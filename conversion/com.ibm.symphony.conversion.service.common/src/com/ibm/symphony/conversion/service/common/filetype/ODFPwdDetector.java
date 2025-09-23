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
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;

import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.zip.ZipEntry;
import java.util.zip.ZipException;
import java.util.zip.ZipFile;
import java.util.zip.ZipInputStream;

public class ODFPwdDetector
{
  private static final int BUFFER = 1024;

  private static Logger log = Logger.getLogger(ODFPwdDetector.class.getName());

  private static String ODF_MANIFEST_FILE = "META-INF/manifest.xml";

  private static String MANI_MAIN_FILE = "manifest:full-path=\"content.xml\"";

  private static String MANI_MAIN_ENCRY = "<manifest:encryption-data manifest:checksum-type";

  public static boolean isPwdProtected(File sourceFile)
  {
    ZipFile odfZipFile = null;
    InputStream f = null;
    BufferedReader br = null;

    try
    {
      odfZipFile = new ZipFile(sourceFile, ZipFile.OPEN_READ);
      ZipEntry odfManifestEntry = odfZipFile.getEntry(ODF_MANIFEST_FILE);
      f = odfZipFile.getInputStream(odfManifestEntry);

      br = new BufferedReader(new InputStreamReader(f));
      String line = br.readLine();

      while (line != null)
      {
        int iPartName = line.indexOf(MANI_MAIN_FILE);
        if (iPartName > 0)
        {
          line = br.readLine();
          if (line != null && line.indexOf(MANI_MAIN_ENCRY) >= 0)
            return true;
          else
            return false;
        }
        line = br.readLine();
      }

    }
    catch (ZipException e1)
    {
      return isODFOnePwd(sourceFile);
    }
    catch (Exception e)
    {
      log.log(Level.WARNING, "Failed to read ZipInputStream.");
    }
    finally
    {
      try
      {
        if (odfZipFile != null)
        {
          odfZipFile.close();
        }
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
        log.log(Level.FINEST, "Failed to close stream. ", e);
      }
    }

    return false;
  }

  private static boolean isODFOnePwd(File sourceFile)
  {
    FileInputStream fis = null;
    ZipInputStream odfZipFile = null;

    try
    {
      fis = new FileInputStream(sourceFile);
      odfZipFile = new ZipInputStream(fis);

      ZipEntry zipEntry = odfZipFile.getNextEntry();
      while (zipEntry != null)
      {
        String eName = zipEntry.getName();
        if (eName.equalsIgnoreCase(ODF_MANIFEST_FILE))
          return isPwdMainFile(odfZipFile);

        zipEntry = odfZipFile.getNextEntry();
      }

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

  private static boolean isPwdMainFile(ZipInputStream zis)
  {

    try
    {
      if (zis != null)
      {
        byte[] bf = new byte[BUFFER];
        int count = zis.read(bf);
        StringBuffer sBuf = new StringBuffer();
        while (count != -1)
        {
          sBuf.append(new String(bf));
          count = zis.read(bf);
        }

        int index = sBuf.indexOf("<", sBuf.indexOf(MANI_MAIN_FILE));
        if (index + MANI_MAIN_ENCRY.length() < sBuf.length())
        {
          String nextAfterMain = sBuf.substring(index, MANI_MAIN_ENCRY.length());
          if (nextAfterMain.equals(MANI_MAIN_ENCRY))
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

}