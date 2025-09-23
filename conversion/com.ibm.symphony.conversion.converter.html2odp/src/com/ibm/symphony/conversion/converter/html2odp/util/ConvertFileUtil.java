/**
 * 
 */
package com.ibm.symphony.conversion.converter.html2odp.util;

import java.io.BufferedInputStream;
import java.io.BufferedOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.Enumeration;
import java.util.zip.ZipEntry;
import java.util.zip.ZipFile;

import com.ibm.symphony.conversion.presentation.ODPMetaFile;

public class ConvertFileUtil
{
  static final int BUFFER = 2048;

  public static void writeFileByStream(InputStream in, File destFile) throws IOException
  {
    FileOutputStream fos = null;
    BufferedOutputStream bos = null;
    BufferedInputStream bis = null;
    try
    {
      fos = new FileOutputStream(destFile);
      bos = new BufferedOutputStream(fos, BUFFER);
      bis = new BufferedInputStream(in);
      int count;
      byte data[] = new byte[BUFFER];
      while ((count = bis.read(data, 0, BUFFER)) != -1)
      {
        bos.write(data, 0, count);
      }
    }
    finally
    {
      ODPMetaFile.closeResource(bis);
      ODPMetaFile.closeResource(bos);
    }
  }

  public static void writeFileByByte(byte in[], File destFile) throws IOException
  {
    FileOutputStream fos = new FileOutputStream(destFile);
    BufferedOutputStream bos = null;
    try
    {
      bos = new BufferedOutputStream(fos, BUFFER);
      bos.write(in);
    }
    finally
    {
      ODPMetaFile.closeResource(bos);
    }

  }

  @SuppressWarnings({ "rawtypes" })
  public static void doUnzip(String fileName, String destDir) throws IOException
  {

    ZipFile zipFile = new ZipFile(fileName);
    Enumeration emu = zipFile.entries();
    while (emu.hasMoreElements())
    {
      ZipEntry entry = (ZipEntry) emu.nextElement();
      if (entry.isDirectory())
      {
        new File(destDir + File.separator + entry.getName()).mkdirs();
        continue;
      }

      BufferedInputStream bis = null;
      BufferedOutputStream bos = null;
      try
      {
        bis = new BufferedInputStream(zipFile.getInputStream(entry));
        File file = new File(destDir + File.separator + entry.getName());
        File parent = file.getParentFile();
        if (parent != null && (!parent.exists()))
        {
          parent.mkdirs();
        }
        FileOutputStream fos = new FileOutputStream(file);
        bos = new BufferedOutputStream(fos, BUFFER);

        int count;
        byte data[] = new byte[BUFFER];
        while ((count = bis.read(data, 0, BUFFER)) != -1)
        {
          bos.write(data, 0, count);
        }
      }
      finally
      {
        ODPMetaFile.closeResource(bis);
        ODPMetaFile.closeResource(bos);
      }
    }
    zipFile.close();
  }
}
