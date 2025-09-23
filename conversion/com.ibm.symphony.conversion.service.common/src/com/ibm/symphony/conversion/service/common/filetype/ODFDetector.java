/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.service.common.filetype;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.RandomAccessFile;
import java.util.HashMap;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.zip.ZipEntry;
import java.util.zip.ZipException;
import java.util.zip.ZipFile;
import java.util.zip.ZipInputStream;

import com.ibm.json.java.JSONObject;
import com.ibm.symphony.conversion.service.common.indextable.DOMIdGenerator;
import com.ibm.symphony.conversion.service.common.util.FileUtil;

public class ODFDetector implements IMimeTypeDetector
{
  private static final int BUFFER = 256;

  private static final int MIME_TYPE_STR_OFFSET = 30;

  // {6D 69 6D 65 74 79 70 65}
  private static final byte[] ODF_MIME_TYPE_STR = { 109, 105, 109, 101, 116, 121, 112, 101 };

  private static final int ODF_MIME_TYPE_STR_LENGTH = 8;

  private static final int MIME_TYPE_OFFSET = 38;

  private static Logger log = Logger.getLogger(ODFDetector.class.getName());

  public static Map<String, String> ODFTemplateMap = new HashMap<String, String>();
  static
  {
    ODFTemplateMap.put(MimeTypeConstants.OTT_MIMETYPE, MimeTypeConstants.ODT_MIMETYPE);
    ODFTemplateMap.put(MimeTypeConstants.OTP_MIMETYPE, MimeTypeConstants.ODP_MIMETYPE);
    ODFTemplateMap.put(MimeTypeConstants.OTS_MIMETYPE, MimeTypeConstants.ODS_MIMETYPE);
  }

  public boolean isCorrectMimeType(File sourceFile, String source_MIMETYPE, Map<String, String> options)
  {
    return isODFMime(sourceFile, source_MIMETYPE, options.get("mainFile"));
  }

  private boolean isODFMime(File sourceFile, String source_MIMETYPE, String odfMainFile)
  {
    RandomAccessFile raf = null;
    ZipFile odfZipFile = null;

    try
    {
      raf = new RandomAccessFile(sourceFile, "r");
      if (!FileUtil.isZIPFile(raf))
      {
        log.finer("The source file is not a valid zip file.");
        return false;
      }

      if (isStandardODF(raf, source_MIMETYPE))
        return true;

      odfZipFile = new ZipFile(sourceFile, ZipFile.OPEN_READ);
      ZipEntry odfMainFileEntry = odfZipFile.getEntry(odfMainFile);
      ZipEntry odfMimeTypeEntry = odfZipFile.getEntry("mimetype");
      if (odfMainFileEntry == null || odfMimeTypeEntry == null)
      {
        log.finer("MainFileEntry/MimeTypeEntry is empty.");
        return false;
      }

      StringBuffer sBuffer = readZipMimeFile(odfZipFile, odfMimeTypeEntry);
      if (sBuffer != null && sBuffer.toString().equals(source_MIMETYPE))
        return true;

    }
    catch (ZipException e1)
    {
      return isODFOneMime(sourceFile, source_MIMETYPE, odfMainFile);
    }
    catch (Exception e)
    {
      log.log(Level.FINER, "Failed to read odf mime type.", e);
    }
    finally
    {
      try
      {
        if (raf != null)
        {
          raf.close();
        }
        if (odfZipFile != null)
        {
          odfZipFile.close();
        }
      }
      catch (IOException e)
      {
        log.log(Level.FINER, "Failed to close stream.", e);
      }
    }

    return false;
  }

  private StringBuffer readZipMimeFile(ZipFile zipFile, ZipEntry zipMimeEntry)
  {
    StringBuffer sBuffer = null;
    BufferedReader br = null;
    InputStream f = null;
    try
    {
      f = zipFile.getInputStream(zipMimeEntry);

      if (f != null)
      {
        br = new BufferedReader(new InputStreamReader(f));
        sBuffer = new StringBuffer();

        String line = br.readLine();
        while (line != null)
        {
          sBuffer.append(line.trim().toLowerCase());
          line = br.readLine();
        }
      }
    }
    catch (Exception e)
    {
      log.log(Level.FINER, "Failed to read mime type stream.", e);
    }
    finally
    {
      try
      {
        if (br != null)
        {
          br.close();
        }
        if (f != null)
        {
          f.close();
        }
      }
      catch (IOException e)
      {
        log.log(Level.FINEST, "Failed to close stream.", e);
      }
    }

    return sBuffer;
  }

  private boolean isODFOneMime(File sourceFile, String source_MIMETYPE, String odfMainFile)
  {
    FileInputStream fis = null;
    ZipInputStream odfZipFile = null;

    try
    {
      fis = new FileInputStream(sourceFile);
      odfZipFile = new ZipInputStream(fis);

      boolean isMainFileEntry = false;
      boolean isMimeTypeEntry = false;
      boolean isMimeTypeCorrect = false;

      ZipEntry zipEntry = odfZipFile.getNextEntry();
      while (zipEntry != null)
      {
        String eName = zipEntry.getName();
        if (eName.equalsIgnoreCase(odfMainFile))
          isMainFileEntry = true;
        else if (eName.equalsIgnoreCase("mimetype"))
        {
          isMimeTypeEntry = true;
          isMimeTypeCorrect = isCorrectMime(odfZipFile, source_MIMETYPE);
        }

        if (isMainFileEntry && isMimeTypeEntry)
          break;

        zipEntry = odfZipFile.getNextEntry();
      }

      if (isMainFileEntry && isMimeTypeEntry && isMimeTypeCorrect)
        return true;

      if (!(isMainFileEntry && isMimeTypeEntry))
        log.finer("MainFileEntry/MimeTypeEntry is empty.");

      return false;

    }
    catch (Exception e)
    {
      log.log(Level.FINER, "Failed to read ZipInputStream.", e);
    }
    finally
    {
      try
      {
        if (fis != null)
        {
          fis.close();
        }
        if (odfZipFile != null)
        {
          odfZipFile.close();
        }
      }
      catch (IOException e)
      {
        log.log(Level.FINEST, "Failed to close stream.", e);
      }
    }

    return false;
  }

  private boolean isCorrectMime(ZipInputStream zipFileStream, String source_MIMETYPE)
  {
    try
    {
      if (zipFileStream != null)
      {
        byte[] bf = new byte[BUFFER];
        int count = zipFileStream.read(bf);

        if (count != -1)
        {
          String s = new String(bf);// ISO-8859-1

          if (s != null && s.trim().equals(source_MIMETYPE))
            return true;
        }
      }
    }
    catch (Exception e)
    {
      log.log(Level.FINER, "Failed to read zipFileStream.", e);
    }

    return false;
  }

  private boolean isStandardODF(RandomAccessFile raf, String source_MIMETYPE)
  {
    try
    {
      raf.seek(MIME_TYPE_STR_OFFSET);
      byte[] buf = new byte[ODF_MIME_TYPE_STR_LENGTH];
      int iRead = raf.read(buf);
      if (iRead > 0)
      {
        if (FileUtil.isMatched(buf, ODF_MIME_TYPE_STR))
        {
          return isStandardMimeType(raf, source_MIMETYPE);
        }
      }
    }
    catch (IOException e)
    {
      log.log(Level.FINER, "Failed to read raf to buf.", e);
    }
    return false;
  }

  private boolean isStandardMimeType(RandomAccessFile raf, String source_MIMETYPE)
  {
    int ODFMimeInfoLength = source_MIMETYPE.length();
    try
    {
      raf.seek(MIME_TYPE_OFFSET);
      byte[] buf = new byte[ODFMimeInfoLength];
      int iRead = raf.read(buf);
      if (iRead > 0)
      {
        String readStr = new String(buf);
        if (readStr.equals(source_MIMETYPE))
          return true;
      }
    }
    catch (IOException e)
    {
      log.log(Level.FINER, "Failed to read raf to buf.", e);
    }
    return false;
  }

  public void updateTemplateMimeType(File sourceFile, String source_MIMETYPE, File targetFolder, Map obj)
  {
    FileInputStream fis = null;
    FileOutputStream fos = null;
    File temp = null;
    try
    {
      String fileName = sourceFile.getName();
      String newFileName = (fileName.indexOf(".") > 0) ? fileName.substring(0, fileName.indexOf(".")) : fileName;
      newFileName += getExtension(source_MIMETYPE);
      if (!targetFolder.exists())
        targetFolder.mkdirs();

      if (ODFTemplateMap.containsKey(source_MIMETYPE))
      {
        temp = new File(sourceFile.getParent(), "z_" + DOMIdGenerator.generate());
        temp.mkdirs();
        String tmpFolder = temp.getAbsolutePath();
        fis = new FileInputStream(sourceFile);
        FileUtil.unzip(fis, tmpFolder);
        File mimeFile = new File(tmpFolder, "mimetype");
        fos = new FileOutputStream(mimeFile);
        fos.write(ODFTemplateMap.get(source_MIMETYPE).getBytes());
        FileUtil.zipFolder(temp, new File(targetFolder, newFileName));
      }
      else
      {
        FileUtil.copyFileToDir(sourceFile, targetFolder, newFileName);
      }
      obj.put("filePath", targetFolder + File.separator + newFileName);
    }
    catch (Exception e)
    {
      log.log(Level.WARNING, "Failed to update Template MimeType.", e);
    }
    finally
    {
      if (fis != null)
      {
        try
        {
          fis.close();
        }
        catch (IOException e)
        {
          log.log(Level.WARNING, "Failed to close the stream.", e);
        }
      }
      if (fos != null)
      {
        try
        {
          fos.close();
        }
        catch (IOException e)
        {
          log.log(Level.WARNING, "Failed to close the stream.", e);
        }
      }
      if(temp != null)
      {
        FileUtil.cleanDirectory(temp);
        temp.delete();
      }
    }
  }

  private static String getExtension(String source_MIMETYPE)
  {
    String str = ODFTemplateMap.get(source_MIMETYPE);
    str = (str == null) ? source_MIMETYPE : str;
    String ext = ".odt";
    if (str.equals(MimeTypeConstants.ODP_MIMETYPE))
      ext = ".odp";
    else if (str.equals(MimeTypeConstants.ODS_MIMETYPE))
      ext = ".ods";

    return ext;
  }
}
