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
import java.util.HashMap;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.zip.ZipEntry;
import java.util.zip.ZipException;
import java.util.zip.ZipFile;
import java.util.zip.ZipInputStream;

import com.ibm.symphony.conversion.service.common.indextable.DOMIdGenerator;
import com.ibm.symphony.conversion.service.common.util.FileUtil;

public class MSOfficeOOXMLDetector implements IMimeTypeDetector
{
  private static final String RELS_FILE_NAME = "_rels/.rels";

  private static final String MIME_FILE_NAME = "[Content_Types].xml";

  private static final int BUFFER = 1024;

  public static Map<String, String> OOXMLTemplateMap = new HashMap<String, String>();
  static
  {
    OOXMLTemplateMap.put(MimeTypeConstants.DOTX_MIMETYPE, MimeTypeConstants.DOCX_MIMETYPE);
    OOXMLTemplateMap.put(MimeTypeConstants.POTX_MIMETYPE, MimeTypeConstants.PPTX_MIMETYPE);
    OOXMLTemplateMap.put(MimeTypeConstants.XLTX_MIMETYPE, MimeTypeConstants.XLSX_MIMETYPE);
  }  

  private static Logger log = Logger.getLogger(MSOfficeOOXMLDetector.class.getName());

  public boolean isCorrectMimeType(File sourceFile, String source_MIMETYPE, Map<String, String> options)
  {
    return isMSOfficeOOXMLMime(sourceFile, source_MIMETYPE, options.get("mainFile"));
  }

  private boolean isMSOfficeOOXMLMime(File sourceFile, String source_MIMETYPE, String ooXMLMainTargetFile)
  {
    BufferedReader br = null;
    InputStream f = null;
    boolean isOOXMLFile = false;

    ZipFile ooXMLZipFile = null;

    try
    {
      if (!FileUtil.isZIPFile(sourceFile))
      {
        log.finer("The source file is not a valid zip file.");
        return false;
      }

      ooXMLZipFile = new ZipFile(sourceFile, ZipFile.OPEN_READ);
      ZipEntry ooXMLRelsFileEntry = ooXMLZipFile.getEntry(RELS_FILE_NAME);

      if (ooXMLRelsFileEntry == null)
      {
        log.finer("RelsFileEntry is empty.");
        return false;
      }

      ZipEntry ooXMLMainFileEntry = ooXMLZipFile.getEntry(ooXMLMainTargetFile);
      ZipEntry ooXMLMimeTypeEntry = ooXMLZipFile.getEntry(MIME_FILE_NAME);
      if (ooXMLMainFileEntry == null || ooXMLMimeTypeEntry == null)
      {
        log.finer("MainFileEntry/MimeTypeEntry is empty.");
        return false;
      }

      f = ooXMLZipFile.getInputStream(ooXMLMimeTypeEntry);
      br = new BufferedReader(new InputStreamReader(f));
      String line = br.readLine();

      String mimePartNameString = "PartName=\"/" + ooXMLMainTargetFile + "\"";
      String mimeContentType = "ContentType=\"" + source_MIMETYPE + ".main+xml\"";
      mimePartNameString = mimePartNameString.toLowerCase();
      mimeContentType = mimeContentType.toLowerCase();

      while (line != null)
      {
        line = line.toLowerCase();
        int iPartName = line.indexOf(mimePartNameString);
        boolean isDefaultXML = line.indexOf("default")>0 && line.indexOf("extension=\"xml\"")>0;

        if ((iPartName > 0 || isDefaultXML) && line.contains(mimeContentType))
        {
          isOOXMLFile = true;
          break;
        }
        line = br.readLine();
      }
    }
    catch (ZipException e1)
    {
      return isZipOneMime(sourceFile, source_MIMETYPE, ooXMLMainTargetFile);
    }
    catch (Exception e)
    {
      log.log(Level.FINER, "Failed to read ooxml mime type.", e);
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
        if (ooXMLZipFile != null)
        {
          ooXMLZipFile.close();
        }
      }
      catch (IOException e)
      {
        log.log(Level.FINEST, "Failed to close stream.", e);
      }
    }

    return isOOXMLFile;
  }

  private boolean isZipOneMime(File sourceFile, String source_MIMETYPE, String ooXMLMainTargetFile)
  {
    FileInputStream fis = null;
    ZipInputStream xmlZipFile = null;

    try
    {
      fis = new FileInputStream(sourceFile);
      xmlZipFile = new ZipInputStream(fis);

      boolean isRelsFileEntry = false;
      boolean isMainFileEntry = false;
      boolean isMimeTypeEntry = false;
      boolean isMimeTypeCorrect = false;

      ZipEntry zipEntry = xmlZipFile.getNextEntry();
      while (zipEntry != null)
      {
        String eName = zipEntry.getName();
        if (eName.equalsIgnoreCase(RELS_FILE_NAME))
          isRelsFileEntry = true;
        else if (eName.equalsIgnoreCase(ooXMLMainTargetFile))
          isMainFileEntry = true;
        else if (eName.equalsIgnoreCase(MIME_FILE_NAME))
        {
          isMimeTypeEntry = true;
          isMimeTypeCorrect = isCorrectMime(xmlZipFile, source_MIMETYPE, ooXMLMainTargetFile);
        }

        if (isRelsFileEntry && isMainFileEntry && isMimeTypeEntry)
          break;

        zipEntry = xmlZipFile.getNextEntry();
      }

      if (isRelsFileEntry && isMainFileEntry && isMimeTypeEntry && isMimeTypeCorrect)
        return true;

      if (!(isRelsFileEntry && isMainFileEntry && isMimeTypeEntry))
        log.finer("RelsFileEntry/MainFileEntry/MimeTypeEntry is empty.");

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
        if (xmlZipFile != null)
        {
          xmlZipFile.close();
        }
      }
      catch (IOException e)
      {
        log.log(Level.FINEST, "Failed to close stream.", e);
      }
    }

    return false;
  }

  private static boolean isCorrectMime(ZipInputStream zis, String source_MIMETYPE, String ooXMLMainTargetFile)
  {
    try
    {
      if (zis != null)
      {
        byte[] bf = new byte[BUFFER];
        int count = zis.read(bf);
        StringBuffer content = new StringBuffer();
        while (count != -1)
        {
          String tmpStr = new String(bf).toLowerCase();
          content.append(tmpStr);
          count = zis.read(bf);
        }

        String mimePartNameString = "PartName=\"/" + ooXMLMainTargetFile + "\" ";
        String mimeContentType = "ContentType=\"" + source_MIMETYPE + ".main+xml\"";
        mimePartNameString = mimePartNameString.toLowerCase();
        mimeContentType = mimeContentType.toLowerCase();

        int mainPartIdx = content.indexOf(mimePartNameString);
        if (mainPartIdx > 0)
        {
          int index = content.indexOf(">", mainPartIdx);
          if (index > 0)
          {
            String nextAfterMain = content.substring(mainPartIdx, index);
            if (nextAfterMain.contains(mimeContentType))
              return true;
          }
        }
      }
    }
    catch (Exception e)
    {
      log.log(Level.FINER, "Failed to read zipFileStream.", e);
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

      if (OOXMLTemplateMap.containsKey(source_MIMETYPE))
      {
        temp = new File(sourceFile.getParent(), "z_" + DOMIdGenerator.generate());
        temp.mkdirs();
        String tmpFolder = temp.getAbsolutePath();
        fis = new FileInputStream(sourceFile);
        FileUtil.unzip(fis, tmpFolder);

        File mimeFile = new File(tmpFolder, "[Content_Types].xml");
        //open and read 
        StringBuffer ts = readTemplateMimeFile(mimeFile);
        int mimeIdx;
        if(ts != null && (mimeIdx = ts.indexOf(source_MIMETYPE + ".main+xml"))>0)
        {
          ts.replace(mimeIdx, mimeIdx + source_MIMETYPE.length(), OOXMLTemplateMap.get(source_MIMETYPE));
          fos = new FileOutputStream(mimeFile);
          fos.write(ts.toString().getBytes("UTF-8"));
          FileUtil.zipFolder(temp, new File(targetFolder, newFileName)); 
        }
        else
          FileUtil.copyFileToDir(sourceFile, targetFolder, newFileName);
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

  private StringBuffer readTemplateMimeFile(File mimeFile)
  {
    StringBuffer sBuffer = null;
    BufferedReader br = null;
    InputStream f = null;
    try
    {
      f =  new FileInputStream(mimeFile);

      if (f != null)
      {
        br = new BufferedReader(new InputStreamReader(f, "UTF-8"));
        sBuffer = new StringBuffer();

        String line = br.readLine();
        while (line != null)
        {
          sBuffer.append(line.trim());
          line = br.readLine();
        }
      }
    }
    catch (Exception e)
    {
      log.log(Level.FINER, "Failed to read template mime type stream.", e);
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

  private static String getExtension(String source_MIMETYPE)
  {
    String str = OOXMLTemplateMap.get(source_MIMETYPE);
    str = (str == null) ? source_MIMETYPE : str;
    String ext = ".docx";
    if (str.equals(MimeTypeConstants.PPTX_MIMETYPE))
      ext = ".pptx";
    else if (str.equals(MimeTypeConstants.XLSX_MIMETYPE))
      ext = ".xlsx";
    return ext;
  }
}
