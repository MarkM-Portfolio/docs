/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.service.common.util;

import java.io.BufferedInputStream;
import java.io.BufferedOutputStream;
import java.io.Closeable;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.RandomAccessFile;
import java.util.Set;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;
import java.util.zip.ZipOutputStream;

public class FileUtil
{
  private static final int BUFFER = 2048;

  // the zip file header must be 0x04034B50,here is "50 4B 03 04"
  private static final byte[] ZIP_HEADER = { 0x50, 0x4B, 0x03, 0x04 };

  private static final int ZIP_HEADER_LENGTH = 4;

  private static final long FILE_DELETE_RETRY_INTERVAL = 200;

  private static Logger log = Logger.getLogger(FileUtil.class.getName());

  /**
   * Zip given folder to given output stream
   * 
   * @param targetFolder
   * @param out
   * @throws IOException
   */
  public static void zipFolder(File sourceFolder, ZipOutputStream out) throws IOException
  {
    zipFolder(sourceFolder, out, "");
  }

  /**
   * Zip given folder to given file
   * 
   * @param targetFolder
   * @param out
   * @throws IOException
   */
  public static void zipFolder(File sourceFolder, File targetFile) throws IOException
  {
    FileOutputStream fos = null;
    ZipOutputStream out = null;
    try
    {
      fos = new FileOutputStream(targetFile);
      out = new ZipOutputStream(new BufferedOutputStream(fos));
      zipFolder(sourceFolder, out, "");
    }
    finally
    {
      if (out != null)
        out.close();
      if (fos != null)
        fos.close();
    }
  }

  private static void zipFolder(File sourceFolder, ZipOutputStream out, String baseDir) throws IOException
  {
    File[] files = sourceFolder.listFiles();
    if (files.length == 0)
    {
      if (baseDir.length() > 0)
      {
        out.putNextEntry(new ZipEntry(baseDir + sourceFolder.getName() + "/"));
      }
      return;
    }
    try
    {
      for (int i = 0; i < files.length; i++)
      {
        if (files[i].isDirectory())
        {
          zipFolder(files[i], out, baseDir + files[i].getName() + "/");
        }
        else
        {
          BufferedInputStream bis = null;
          FileInputStream fis = null;
          try
          {
            fis = new FileInputStream(files[i]);
            bis = new BufferedInputStream(fis);
            ZipEntry entry = new ZipEntry(baseDir + files[i].getName());
            byte data[] = new byte[BUFFER];
            int count;
            out.putNextEntry(entry);
            while ((count = bis.read(data, 0, BUFFER)) != -1)
            {
              out.write(data, 0, count);
            }
          }
          finally
          {
            if (bis != null)
              bis.close();
            if (fis != null)
              fis.close();
          }

        }
      }
    }
    catch (Exception e)
    {
      e.printStackTrace();
    }
  }

  /**
   * Copy all files from source location to target location
   * 
   * @param sourceLocation
   *          the directory of source location
   * @param targetLocation
   *          the directory of target location
   * @throws IOException
   */
  public static void copyDirectory(File sourceLocation, File targetLocation)
  {
    if (sourceLocation.isDirectory())
    {
      if (!targetLocation.exists())
      {
        targetLocation.mkdirs();
      }

      String[] children = sourceLocation.list();
      for (int i = 0; i < children.length; i++)
      {
        copyDirectory(new File(sourceLocation, children[i]), new File(targetLocation, children[i]));
      }
    }
    else
    {
      InputStream in = null;
      OutputStream out = null;
      try
      {
        in = new FileInputStream(sourceLocation);
        out = new FileOutputStream(targetLocation);

        // Copy the bits from instream to outstream
        byte[] buf = new byte[8192];
        int len;
        while ((len = in.read(buf)) > 0)
        {
          out.write(buf, 0, len);
        }
        in.close();
        out.close();
      }
      catch (IOException e)
      {
        e.printStackTrace();
      }
      finally
      {
        try
        {
          if (in != null)
            in.close();
          if (out != null)
            out.close();
        }
        catch (IOException e)
        {
          e.printStackTrace();
        }
      }
    }
  }

  /**
   * Copy a file to a target directory
   * 
   * @param filePath
   * @param targetDir
   */
  public static String copyFileToDir(File file, File targetDir, String newName)
  {
    String name = null;
    if (newName != null)
    {
      name = newName;
    }
    else
    {
      name = file.getName();
    }
    String targetFilePath = targetDir + File.separator + name;
    File targetFile = new File(targetFilePath);
    if (!targetDir.exists())
      targetDir.mkdirs();
    InputStream in = null;
    OutputStream out = null;
    try
    {
      in = new FileInputStream(file);
      out = new FileOutputStream(targetFile);

      // Copy the bits from instream to outstream
      byte[] buf = new byte[8192];
      int len;
      while ((len = in.read(buf)) > 0)
      {
        out.write(buf, 0, len);
      }
    }
    catch (IOException e)
    {
      e.printStackTrace();
    }
    finally
    {

      try
      {
        if (in != null)
          in.close();
        if (out != null)
          out.close();
      }
      catch (IOException e)
      {
        e.printStackTrace();
      }
    }
    return targetFilePath;
  }

  public static void forceDelete(String name)
  {
    forceDelete(new File(name));
  }

  public static void forceDelete(File file)
  {
    if (file.exists())
    {
      if (file.isDirectory())
      {
        cleanDirectory(file);
      }
      if (!file.delete())
      {
        log.logp(Level.FINEST, "FileUtil", "forceDelete", "Fail to delete file, " + file.getAbsolutePath() + ". Waiting for trying again");
        try
        {
          Thread.sleep(FILE_DELETE_RETRY_INTERVAL);
          if (!file.delete())
          {
            log.logp(Level.SEVERE, "FileUtil", "forceDelete", "Unable to delete file, " + file.getAbsolutePath());
          }
        }
        catch (InterruptedException e)
        {
          log.logp(Level.WARNING, "FileUtil", "forceDelete", e.getMessage(), e);
        }
      }
    }
  }

  /**
   * delete a file
   * 
   * @param file
   */
  public static void deleteFile(File file)
  {
    try
    {
      if (file.exists())
      {
        if (!file.delete())
        {
          log.log(Level.WARNING, "Fail to delete file : " + file.getAbsolutePath());
        }
      }
    }
    catch (Exception e)
    {
      log.log(Level.WARNING, "Exception when delete file : " + file.getAbsolutePath(), e);
    }
  }

  public static void cleanDirectory(File dir)
  {
    if (!dir.exists())
    {
      return;
    }

    File[] files = dir.listFiles();
    for (int i = 0; i < files.length; i++)
    {
      File f = files[i];
      if (f.isDirectory())
      {
        cleanDirectory(f);
      }
      boolean success = f.delete();
      if (!success)
      {
        log.logp(Level.FINEST, "FileUtil", "cleanDirectory", "Fail to delete file, " + f.getAbsolutePath() + ". Waiting for trying again");
        try
        {
          Thread.sleep(FILE_DELETE_RETRY_INTERVAL);
          success = f.delete();
          if (!success)
          {
            log.logp(Level.SEVERE, "FileUtil", "cleanDirectory", "Unable to delete file, " + f.getAbsolutePath());
          }
        }
        catch (InterruptedException e)
        {
          log.logp(Level.WARNING, "FileUtil", "cleanDirectory", e.getMessage(), e);
        }
      }
    }
  }

  public static void cleanDirectory(File dir, Set<String> dirFilters)
  {
    if (!dir.exists())
    {
      return;
    }

    File[] files = dir.listFiles();
    if (files == null)
      return;

    for (int i = 0; i < files.length; i++)
    {
      File f = files[i];
      if (f.isDirectory())
      {
        if (dirFilters.contains(f.getName()))
          continue;
        cleanDirectory(f);
        f.delete();
      }
      else
      {
        f.delete();
      }
    }
  }

  public static boolean isZIPFile(File file)
  {
    if (file.isDirectory() || !file.isFile() || !file.canRead())
      return false;
    RandomAccessFile raf = null;
    try
    {
      raf = new RandomAccessFile(file, "r");
      if (isZIPFile(raf))
      {
        return true;
      }
    }
    catch (IOException e)
    {
      e.printStackTrace();
    }
    finally
    {
      try
      {
        if (raf != null)
        {
          raf.close();
        }
      }
      catch (IOException e)
      {
        e.printStackTrace();
      }
    }

    return false;
  }

  public static boolean isZIPFile(RandomAccessFile raf)
  {
    byte[] buf = new byte[ZIP_HEADER_LENGTH];
    try
    {
      raf.seek(0);
      int iRead = raf.read(buf, 0, ZIP_HEADER_LENGTH);
      if (iRead == ZIP_HEADER_LENGTH && isMatched(buf, ZIP_HEADER))
      {
        return true;
      }
    }
    catch (IOException e)
    {
      e.printStackTrace();
    }
    return false;
  }

  public static boolean isMatched(byte[] buffer, byte[] mark)
  {
    if (buffer.length != mark.length)
      return false;

    boolean isMatch = true;
    for (int i = 0; i < mark.length; i++)
    {
      if (mark[i] != buffer[i])
      {
        isMatch = false;
        break;
      }
    }
    return isMatch;
  }

  /**
   * unzip a source zip file to a target directory
   * 
   * @param source
   *          input stream
   * @param target
   *          target folder for unzipped file
   * @throws Exception
   */
  public static void unzip(InputStream source, String target) throws IOException
  {
    ZipInputStream in = null;
    try
    {
      in = new ZipInputStream(source);
      ZipEntry e;
      while ((e = in.getNextEntry()) != null)
      {
        if (e.isDirectory())
        {
          String name = e.getName();
          // remove separator
          name = name.substring(0, name.length() - 1);
          File f = new File(target + File.separator + name);
          f.mkdirs();
        }
        else
        {
          String folderPath = e.getName();
          int idx = folderPath.lastIndexOf("/");
          if (idx > 0)
          {
            folderPath = folderPath.substring(0, idx);
            File folder = new File(target + File.separator + folderPath);
            folder.mkdirs();
          }

          File f = new File(target + File.separator + e.getName());
          f.createNewFile();
          FileOutputStream out = new FileOutputStream(f);
          int numRead = -1;
          byte[] data = new byte[8192];
          while ((numRead = in.read(data)) > 0)
          {
            out.write(data, 0, numRead);
          }
          out.close();
        }
      }
    }
    catch (Exception e)
    {
      e.printStackTrace();
    }
    finally
    {
      try
      {
        if (in != null)
        {
          in.close();
        }
      }
      catch (IOException e)
      {
        e.printStackTrace();
      }
    }
  }

  /**
   * This is convenient method for exists(file, forceRead)
   * 
   * @param file
   *          input file
   * @return file is exist or not
   */
  public static boolean exists(File file)
  {
    return exists(file, false);
  }

  /**
   * Providing this method is just specially because NFS is not stable. JDK exists method does not work on NFS sometimes, so rewrite an
   * exists method by opening the file stream. This method is only for judging file existence. For folder, have no way now
   * 
   * @param file
   *          input file
   * @return the given file exists or not
   */
  public static boolean exists(File file, boolean forceRead)
  {
    FileInputStream fis = null;
    boolean retVal = true;
    try
    {
      fis = new FileInputStream(file);
      if (forceRead)
      {
        fis.read();
      }
    }
    catch (FileNotFoundException e)
    {
      log.log(Level.FINE, "file not found: " + file.getAbsolutePath(), e);
      retVal = false;
    }
    catch (IOException e)
    {
      log.log(Level.FINE, "read IOException: " + file.getAbsolutePath(), e);
      retVal = true;
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
          log.log(Level.FINE, "close stream IOException: " + file.getAbsolutePath(), e);
        }
      }
    }

    return retVal;
  }

  /*
   * Quietly and cleanly closes the Closeable object (Streams, Readers, etc) if it is still open
   * 
   * @param closeable Closeable object (Streams, Readers, etc)
   */
  public static void closeResource(Closeable closeable)
  {
    if (closeable != null)
    {
      try
      {
        closeable.close();
      }
      catch (IOException e)
      {
        log.log(Level.WARNING, "close stream IOException", e);
      }
    }
  }
}
