/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.viewer.spi.util;

import java.io.BufferedInputStream;
import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.FileWriter;
import java.io.FilenameFilter;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.io.OutputStreamWriter;
import java.util.Enumeration;
import java.util.Set;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.zip.ZipEntry;
import java.util.zip.ZipFile;

/**
 * @author gaowwei@cn.ibm.com
 * 
 */
public class FileUtil
{
  private static final int NFS_RETRY_INTERVAL = 100;

  public static final int NFS_RETRY_SECONDS = 2;

  private static final Logger LOG = Logger.getLogger(FileUtil.class.getName());

  private static final String DEFAULT_ENCODING = "UTF-8";

  /**
   * Copy all files from source location to target location
   * 
   * @param sourceLocation
   *          the directory of source location
   * @param targetLocation
   *          the directory of target location
   * @throws IOException
   */
  public static void copyDirectory(File sourceLocation, File targetLocation) throws IOException
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
      InputStream in;
      try
      {
        in = new FileInputStream(sourceLocation);
        OutputStream out = new FileOutputStream(targetLocation);

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
    }
  }

  public static void copyDirectory(File sourceLocation, File targetLocation, FilenameFilter filter) throws IOException
  {
    if (sourceLocation.isDirectory())
    {
      if (!targetLocation.exists())
      {
        targetLocation.mkdirs();
      }

      String[] children = sourceLocation.list(filter);
      for (int i = 0; i < children.length; i++)
      {
        copyDirectory(new File(sourceLocation, children[i]), new File(targetLocation, children[i]));
      }
    }
    else
    {
      InputStream in;
      try
      {
        in = new FileInputStream(sourceLocation);
        OutputStream out = new FileOutputStream(targetLocation);

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
    }
  }

  /**
   * Read file content and save it in a String.
   * 
   * @param path
   *          file to read
   * @return file content string
   */
  public static String readFile(String path)
  {
    byte[] buffer = new byte[(int) new File(path).length()];
    try
    {
      BufferedInputStream is = new BufferedInputStream(new FileInputStream(path));
      is.read(buffer);
      is.close();
    }
    catch (IOException e)
    {
      // TODO Auto-generated catch block
      e.printStackTrace();
      return null;
    }
    return new String(buffer);
  }

  /**
   * Write the content into a file located by given path
   * 
   * @param content
   *          content to write
   * @param path
   *          file to store the content
   * @return true if succes, false if not
   */
  public static boolean writeFile(String content, String path)
  {
    try
    {
      BufferedWriter writer = new BufferedWriter(new FileWriter(path));
      writer.write(content);
      writer.close();
      return true;
    }
    catch (IOException e)
    {
      e.printStackTrace();
      return false;
    }
  }

  /**
   * Copy a file to a target directory
   * 
   * @param filePath
   * @param targetDir
   */
  public static void copyFileToDir(File file, File targetDir, String newName)
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
    InputStream in;
    try
    {
      in = new FileInputStream(file);
      OutputStream out = new FileOutputStream(targetFile);

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
      return;
    }
  }

  /**
   * Copy a directory recursively to a target directory
   * 
   * @param filePath
   * @param targetDir
   */
  public static void copyDirToDir(String sourceDir, String targetDir)
  {
    File source = new File(sourceDir);
    File target = new File(targetDir);

    if (!source.exists())
      return;
    if (!target.exists())
    {
      target.mkdirs();
    }

    try
    {
      String[] children = source.list();
      for (int i = 0; i < children.length; i++)
      {
        File file = new File(source, children[i]);
        if (file.isFile())
        {
          FileUtil.copyFileToDir(file, target, null);
        }
        else
        {
          copyDirToDir(file.getAbsolutePath(), targetDir + File.separator + file.getName());
        }
      }
    }
    catch (Exception e)
    {
    }
  }

  public static void copyDirToDir(String sourceDir, String targetDir, Set<String> extFilters)
  {
    File source = new File(sourceDir);
    File target = new File(targetDir);

    if (!source.exists())
      return;
    if (!target.exists())
    {
      target.mkdirs();
    }

    try
    {
      String[] children = source.list();
      for (int i = 0; i < children.length; i++)
      {
        File file = new File(source, children[i]);
        if (file.isFile())
        {
          String name = file.getName();
          int index = name.lastIndexOf('.');
          if (index != -1)
          {
            String ext = name.substring(index, name.length());
            if (!extFilters.contains(ext))
            {
              FileUtil.copyFileToDir(file, target, null);
            }
          }
          else
          {
            FileUtil.copyFileToDir(file, target, null);
          }
        }
        else
        {
          copyDirToDir(file.getAbsolutePath(), targetDir + File.separator + file.getName());
        }
      }
    }
    catch (Exception e)
    {
    }
  }

  /**
   * Copy a input stream as path file name in target directory
   * 
   * @param is
   * @param targetDir
   * @param path
   */
  public static void copyInputStreamToDir(InputStream is, File targetDir, String name)
  {
    String targetFilePath = targetDir + File.separator + name;
    int idx = targetFilePath.lastIndexOf("/");
    if (idx > 0)
    {
      String folderPath = targetFilePath.substring(0, idx);
      File folder = new File(folderPath);
      if (!folder.exists())
      {
        folder.mkdirs();
      }
    }

    File targetFile = new File(targetFilePath);
    if (!targetDir.exists())
      targetDir.mkdirs();

    try
    {
      OutputStream os = new FileOutputStream(targetFile);

      // Copy the bits from instream to outstream
      byte[] buf = new byte[8192];
      int len;
      while ((len = is.read(buf)) > 0)
      {
        os.write(buf, 0, len);
      }
      is.close();
      os.close();
    }
    catch (IOException e)
    {
      e.printStackTrace();
      return;
    }
  }

  public static void removeDirectory(File dir)
  {
    cleanDirectory(dir);
    dir.delete();
  }

  public static void cleanDirectory(File dir)
  {
    if (!dir.exists() || !dir.isDirectory())
    {
      return;
    }

    File[] files = dir.listFiles();
    for (int i = 0; i < files.length; i++)
    {
      boolean b = false;
      File f = files[i];
      if (f.isDirectory())
      {
        cleanDirectory(f);
      }

      b = f.delete();
      if(!b)
      {
        LOG.log(Level.WARNING, "Failed removing file: {0}", f.getAbsolutePath());
      }
      else
      {
        LOG.log(Level.FINE, "Successfully removed file: {0}", f.getAbsolutePath());
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

  public static void copyFileToFile(final File src, final File dest) throws IOException
  {
    copyInputStreamToFile(new FileInputStream(src), dest);
    dest.setLastModified(src.lastModified());
  }

  public static void copyInputStreamToFile(final InputStream is, final File f) throws IOException
  {
    copyInputStreamToOutputStream(is, new FileOutputStream(f));
  }

  public static void copyFileToOutputStream(final File in, final OutputStream out) throws IOException
  {
    copyInputStreamToOutputStream(new FileInputStream(in), out);
  }

  public static void appendInputStreamToFile(final InputStream is, final File f) throws IOException
  {
    copyInputStreamToOutputStream(is, new FileOutputStream(f, true));
  }

  public static void copyInputStreamToOutputStream(final InputStream in, final OutputStream out) throws IOException
  {
    try
    {
      try
      {
        final byte[] buffer = new byte[8192];
        int n;
        while ((n = in.read(buffer)) != -1)
        {
          out.write(buffer, 0, n);
        }
      }
      finally
      {
        out.close();
      }
    }
    finally
    {
      in.close();
    }
  }

  public static void createTempFolder(File folder)
  {
    if (folder.exists())
    {
      FileUtil.cleanDirectory(folder);
    }
    else
    {
      if (!folder.mkdirs())
      {
        LOG.log(Level.WARNING, "failed to create directory " + folder.getAbsolutePath());
      }
    }
  }

  public static boolean nfs_assertExistsFile(File f, int seconds)
  {
    if (f.exists())
      return true;

    LOG.log(Level.INFO, "retry to check file existence: " + f.getAbsolutePath());
    if (seconds < 0)
    {
      seconds = 0;
    }

    int retry = seconds * 1000 / NFS_RETRY_INTERVAL;
    for (int i = 0; i < retry; i++)
    {
      try
      {
        Thread.sleep(NFS_RETRY_INTERVAL);
      }
      catch (InterruptedException e)
      {
        // ignore
        break;
      }

      FileInputStream fis = null;
      boolean exists = true;
      try
      {
        fis = new FileInputStream(f);
      }
      catch (FileNotFoundException e)
      {
        exists = false;
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
            LOG.log(Level.INFO, "close stream IOException: " + f.getAbsolutePath(), e);
          }
        }
      }

      if (exists)
      {
        LOG.log(Level.INFO, "successfully to check file existence by retry: " + i + " file: " + f.getAbsolutePath());
        return true;
      }
    }

    LOG.log(Level.INFO, "failed to check file existence by retry: " + retry + " file: " + f.getAbsolutePath());
    return false;
  }

  public static boolean nfs_assertExistsDirectory(File f, int seconds)
  {
    if (f.exists())
    {
      return true;
    }

    LOG.log(Level.INFO, "retry to check directory existence: " + f.getAbsolutePath());
    if (seconds < 0)
    {
      seconds = 0;
    }

    int retry = seconds * 1000 / NFS_RETRY_INTERVAL;
    for (int i = 0; i < retry; i++)
    {
      try
      {
        Thread.sleep(NFS_RETRY_INTERVAL);
      }
      catch (InterruptedException e)
      {
        // ignore
        break;
      }
      if (f.exists())
      {
        LOG.log(Level.INFO, "successfully to check directory existence by retry: " + i + " file: " + f.getAbsolutePath());
        return true;
      }
    }

    LOG.log(Level.INFO, "failed to check directory existence by retry: " + retry + " file: " + f.getAbsolutePath());
    return false;

  }

  /*
   * Delete a file or directory from shared storage (NFS), will retry in @seconds if failed
   */
  public static boolean nfs_delete(File file, int seconds)
  {
    if (file.delete())
    {
      return true;
    }

    LOG.log(Level.INFO, "retry to delete file: " + file.getAbsolutePath());
    if (seconds < 0)
    {
      seconds = 0;
    }

    int retry = seconds * 1000 / NFS_RETRY_INTERVAL;
    for (int i = 0; i < retry; i++)
    {
      try
      {
        Thread.sleep(NFS_RETRY_INTERVAL);
      }
      catch (InterruptedException e)
      {
        // ignore
        break;
      }
      if (file.delete())
      {
        LOG.log(Level.INFO, "successfully to delete file by retry: " + i + " file: " + file.getAbsolutePath());
        return true;
      }
    }

    LOG.log(Level.INFO, "failed to delete file by retry: " + retry + " file: " + file.getAbsolutePath());
    return false;
  }

  /*
   * Check a file in storage is a file or directory in shared storage (NFS)
   */
  public static boolean nfs_isDirectory(File f, int seconds)
  {
    boolean isDir = f.isDirectory();
    boolean isFile = f.isFile();
    if (isDir != isFile)
    {
      return isDir;
    }

    LOG.log(Level.INFO, "retry to check directory attribute: " + f.getAbsolutePath());
    if (seconds < 0)
    {
      seconds = 0;
    }

    int retry = seconds * 1000 / NFS_RETRY_INTERVAL;
    for (int i = 0; i < retry; i++)
    {
      try
      {
        Thread.sleep(NFS_RETRY_INTERVAL);
      }
      catch (InterruptedException e)
      {
        // ignore
        break;
      }
      isDir = f.isDirectory();
      isFile = f.isFile();

      if (isDir != isFile)
      {
        LOG.log(Level.INFO, "successfully to check directory attribute by retry: " + i + " file: " + f.getAbsolutePath());
        return isDir;
      }
    }

    LOG.log(Level.INFO, "failed to check directory attribute by retry: " + retry + " file: " + f.getAbsolutePath());
    return false;
  }

  /*
   * Check a file in storage is a file or directory in shared storage (NFS)
   */
  public static boolean nfs_isFile(File f, int seconds)
  {
    boolean isDir = f.isDirectory();
    boolean isFile = f.isFile();
    if (isDir != isFile)
    {
      return isFile;
    }

    LOG.log(Level.INFO, "retry to check file attribute: " + f.getAbsolutePath());
    if (seconds < 0)
    {
      seconds = 0;
    }

    int retry = seconds * 1000 / NFS_RETRY_INTERVAL;
    for (int i = 0; i < retry; i++)
    {
      try
      {
        Thread.sleep(NFS_RETRY_INTERVAL);
      }
      catch (InterruptedException e)
      {
        // ignore
        break;
      }
      isDir = f.isDirectory();
      isFile = f.isFile();

      if (isDir != isFile)
      {
        LOG.log(Level.INFO, "successfully to check file attribute by retry: " + i + " file: " + f.getAbsolutePath());
        return isFile;
      }
    }

    LOG.log(Level.INFO, "failed to check file attribute by retry: " + retry + " file: " + f.getAbsolutePath());
    return false;
  }

  public static boolean nfs_renameFile(File oldFile, File newFile, int seconds)
  {
    boolean ret = oldFile.renameTo(newFile);
    if (ret)
    {
      return true;
    }

    LOG.log(Level.INFO, "retry to rename file from: " + oldFile.getAbsolutePath() + " to: " + newFile.getAbsolutePath());
    if (seconds < 0)
    {
      seconds = 0;
    }

    int retry = seconds * 1000 / NFS_RETRY_INTERVAL;
    for (int i = 0; i < retry; i++)
    {
      try
      {
        Thread.sleep(NFS_RETRY_INTERVAL);
      }
      catch (InterruptedException e)
      {
        // ignore
        break;
      }

      FileOutputStream fos = null;
      try
      {
        if (newFile.exists())
        {
          LOG.log(Level.INFO, "new file existed: {0}", newFile.getAbsolutePath());
          break;
        }
        else
        {
          FileUtil.copyFileToFile(oldFile, newFile);
          if (nfs_delete(oldFile, seconds))
          {
            return true;
          }
          else
          {
            break;
          }
        }
      }
      catch (IOException e)
      {
        LOG.log(Level.INFO, "create new file IOException: {0} {1} {2}", new Object[] { oldFile.getAbsolutePath(),
            newFile.getAbsolutePath(), e });
      }
      finally
      {
        if (fos != null)
        {
          try
          {
            fos.close();
            fos = null;
          }
          catch (IOException e)
          {
            LOG.log(Level.INFO, "close output stream IOException: {0} {1} {2}",
                new Object[] { oldFile.getAbsolutePath(), newFile.getAbsolutePath(), e });
          }
        }
      }
    }

    LOG.log(Level.INFO, "failed to rename file by retry: {0} src file: {1} dest file: {2}", new Object[] { retry,
        oldFile.getAbsolutePath(), newFile.getAbsolutePath() });
    return false;
  }

  public static File[] nfs_listFiles(File dir, int seconds)
  {
    File[] list = dir.listFiles();
    if (list != null)
    {
      return list;
    }

    LOG.log(Level.INFO, "retry to list file: " + dir.getAbsolutePath());
    if (seconds < 0)
    {
      seconds = 0;
    }

    int retry = seconds * 1000 / NFS_RETRY_INTERVAL;
    for (int i = 0; i < retry; i++)
    {
      try
      {
        Thread.sleep(NFS_RETRY_INTERVAL);
      }
      catch (InterruptedException e)
      {
        // ignore
        break;
      }

      list = dir.listFiles();
      if (list != null)
      {
        LOG.log(Level.INFO, "successfully to list file by retry: " + i + " file: " + dir.getAbsolutePath());
        return list;
      }
    }

    LOG.log(Level.INFO, "failed to list file by retry: " + retry + " file: " + dir.getAbsolutePath());
    return null;
  }

  /*
   * Clean a directory from shared storage (NFS), for any file or directory cannot be deleted, will retry in seconds
   */
  public static void nfs_cleanDirectory(File dir, int seconds)
  {
    File[] files = nfs_listFiles(dir, seconds);
    if (files == null)
      return;

    for (int i = 0; i < files.length; i++)
    {
      File f = files[i];
      if (nfs_isDirectory(f, seconds))
      {
        nfs_cleanDirectory(f, seconds);
        nfs_delete(f, seconds);
      }
      else
      {
        nfs_delete(f, seconds);
      }
    }
  }

  public static void nfs_cleanDirectory(File dir, Set<String> dirFilters, int seconds)
  {
    File[] files = nfs_listFiles(dir, seconds);
    if (files == null)
      return;

    for (int i = 0; i < files.length; i++)
    {
      File f = files[i];
      if (nfs_isDirectory(f, seconds))
      {
        if (dirFilters.contains(f.getName()))
          continue;
        nfs_cleanDirectory(f, seconds);
        nfs_delete(f, seconds);
      }
      else
      {
        nfs_delete(f, seconds);
      }
    }
  }

  public static boolean nfs_mkdir(File f, int seconds)
  {
    if (f.mkdir())
    {
      return true;
    }

    if (f.exists())
    {
      // already exists
      return false;
    }

    LOG.log(Level.INFO, "retry to mkdir: " + f.getAbsolutePath());
    if (seconds < 0)
    {
      seconds = 0;
    }

    int retry = seconds * 1000 / NFS_RETRY_INTERVAL;
    for (int i = 0; i < retry; i++)
    {
      try
      {
        Thread.sleep(NFS_RETRY_INTERVAL);
      }
      catch (InterruptedException e)
      {
        // ignore
        break;
      }
      if (f.mkdir())
      {
        LOG.log(Level.INFO, "successfully to mkdir by retry: " + i + " file: " + f.getAbsolutePath());
        // wait for NFS to propagate
        return nfs_assertExistsDirectory(f, seconds);
      }
      else if (f.exists())
      {
        return false;
      }
    }

    LOG.log(Level.INFO, "failed to mkdir by retry: " + retry + " file: " + f.getAbsolutePath());
    return false;
  }

  public static boolean nfs_mkdirs(File f, int seconds)
  {
    if (f.mkdirs())
    {
      return true;
    }

    if (f.exists())
    {
      // already exists
      return false;
    }

    LOG.log(Level.INFO, "retry to mkdirs: " + f.getAbsolutePath());
    if (seconds < 0)
    {
      seconds = 0;
    }

    int retry = seconds * 1000 / NFS_RETRY_INTERVAL;
    for (int i = 0; i < retry; i++)
    {
      try
      {
        Thread.sleep(NFS_RETRY_INTERVAL);
      }
      catch (InterruptedException e)
      {
        // ignore
        break;
      }
      if (f.mkdirs())
      {
        LOG.log(Level.INFO, "successfully to mkdirs by retry: " + i + " file: " + f.getAbsolutePath());
        // wait for NFS to propagate
        return nfs_assertExistsDirectory(f, seconds);
      }
      else if (f.exists())
      {
        return false;
      }
    }

    LOG.log(Level.INFO, "failed to mkdirs by retry: " + retry + " file: " + f.getAbsolutePath());
    return false;
  }

  /*
   * Copy a file (in local/shared storage) to another file (in shared storage/local) assume this operation expect to be successful
   */
  public static void nfs_copyFileToFile(File src, File dest, int seconds) throws IOException
  {
    FileInputStream fis = null;
    FileOutputStream fos = null;
    IOException recordE = null;

    boolean success = false;
    try
    {
      fis = new FileInputStream(src);
      fos = new FileOutputStream(dest);
      copyInputStreamToOutputStream(fis, fos);
      dest.setLastModified(src.lastModified());
      success = true;
    }
    catch (IOException e)
    {
      LOG.log(Level.INFO, "failed to copy file from: " + src.getAbsolutePath() + "to: " + dest.getAbsolutePath() + ", will retry shortly.",
          e);
      recordE = e;
    }
    finally
    {
      try
      {
        if (fis != null)
        {
          fis.close();
        }
      }
      catch (IOException e)
      {
        LOG.log(Level.WARNING, "fail to close stream: " + e);
      }

      try
      {
        if (fos != null)
        {
          fos.close();
        }
      }
      catch (IOException e)
      {
        LOG.log(Level.WARNING, "fail to close stream: " + e);
      }
    }

    if (success)
      return;

    LOG.log(Level.INFO, "retry to copy file from: " + src.getAbsolutePath() + "to: " + dest.getAbsolutePath());
    if (seconds < 0)
    {
      seconds = 0;
    }

    int retry = seconds * 1000 / NFS_RETRY_INTERVAL;
    for (int i = 0; i < retry; i++)
    {
      try
      {
        Thread.sleep(NFS_RETRY_INTERVAL);
      }
      catch (InterruptedException e)
      {
        // ignore
        break;
      }

      try
      {
        fis = new FileInputStream(src);
        fos = new FileOutputStream(dest);
        copyInputStreamToOutputStream(fis, fos);
        dest.setLastModified(src.lastModified());
        success = true;
      }
      catch (IOException e)
      {
        recordE = e;
      }
      finally
      {
        try
        {
          if (fis != null)
          {
            fis.close();
          }
        }
        catch (IOException e)
        {
          LOG.log(Level.WARNING, "fail to close stream: " + e);
        }

        try
        {
          if (fos != null)
          {
            fos.close();
          }
        }
        catch (IOException e)
        {
          LOG.log(Level.WARNING, "fail to close stream: " + e);
        }
      }

      if (success)
      {
        LOG.log(Level.INFO,
            "successfully to copy file by retry: " + i + " from: " + src.getAbsolutePath() + " to: " + dest.getAbsolutePath());
        return;
      }
    }

    LOG.log(Level.INFO, "failed to copy file by retry: " + retry + " from: " + src.getAbsolutePath() + " to: " + dest.getAbsolutePath());
    throw recordE;
  }

  public static boolean nfs_copyFileToDir(File f, File dir, String newName, int seconds)
  {
    boolean success = false;

    String name = null;
    if (newName != null)
    {
      name = newName;
    }
    else
    {
      name = f.getName();
    }

    String targetFilePath = dir + File.separator + name;
    File targetFile = new File(targetFilePath);

    if (!dir.exists())
    {
      nfs_mkdirs(dir, seconds);
    }

    try
    {
      nfs_copyFileToFile(f, targetFile, seconds);
      success = true;
    }
    catch (IOException e)
    {
      LOG.log(Level.INFO, "failed to copy file from: " + f.getAbsolutePath() + " to folder: " + dir.getAbsolutePath());
    }

    return success;
  }

  public static boolean nfs_copyDirToDir(File srcDir, File destDir, int seconds)
  {
    if (!nfs_assertExistsDirectory(srcDir, seconds))
    {
      LOG.log(Level.INFO,
          "source directory does not exists for copyDirToDir: " + srcDir.getAbsolutePath() + " to: " + destDir.getAbsolutePath());
      return false;
    }

    boolean success = true;
    if (!destDir.exists())
    {
      nfs_mkdirs(destDir, seconds);
    }

    File[] children = srcDir.listFiles();
    for (int i = 0; i < children.length; i++)
    {
      File f = children[i];
      if (nfs_isFile(f, seconds))
      {
        success = nfs_copyFileToDir(f, destDir, null, seconds);
      }
      else
      {
        success = nfs_copyDirToDir(f, new File(destDir, f.getName()), seconds);
      }

      if (!success)
        break;
    }

    if (!success)
    {
      LOG.log(Level.INFO, "failed to copy folder from: " + srcDir.getAbsolutePath() + " to folder: " + destDir.getAbsolutePath());
    }

    return success;
  }

  public static boolean nfs_copyDirToDir(File srcDir, File destDir, Set<String> extFilters, int seconds)
  {
    if (!nfs_assertExistsDirectory(srcDir, seconds))
    {
      LOG.log(Level.INFO,
          "source directory does not exists for copyDirToDir: " + srcDir.getAbsolutePath() + " to: " + destDir.getAbsolutePath());
      return false;
    }

    boolean success = true;
    if (!destDir.exists())
    {
      nfs_mkdirs(destDir, seconds);
    }

    File[] children = srcDir.listFiles();
    for (int i = 0; i < children.length; i++)
    {
      File f = children[i];
      if (nfs_isFile(f, seconds))
      {
        String name = f.getName();
        int index = name.lastIndexOf('.');
        if (index != -1)
        {
          String ext = name.substring(index, name.length());
          if (!extFilters.contains(ext))
          {
            success = nfs_copyFileToDir(f, destDir, null, seconds);
          }
        }
        else
        {
          success = nfs_copyFileToDir(f, destDir, null, seconds);
        }
      }
      else
      {
        success = nfs_copyDirToDir(f, new File(destDir, f.getName()), seconds);
      }

      if (!success)
        break;
    }

    if (!success)
    {
      LOG.log(Level.INFO, "failed to copy folder from: " + srcDir.getAbsolutePath() + " to folder: " + destDir.getAbsolutePath());
    }

    return success;
  }

  public static boolean nfs_createNewFile(File f, int seconds) throws IOException
  {
    IOException recordE = null;

    boolean success = false;
    try
    {
      if (f.createNewFile())
        return true;
      else if (f.exists())
        return false;
    }
    catch (IOException e)
    {
      LOG.log(Level.INFO, "failed to create new file: " + f.getAbsolutePath() + ", will retry shortly.", e);
      recordE = e;
    }

    LOG.log(Level.INFO, "retry to create new file: " + f.getAbsolutePath());
    if (seconds < 0)
    {
      seconds = 0;
    }

    int retry = seconds * 1000 / NFS_RETRY_INTERVAL;
    for (int i = 0; i < retry; i++)
    {
      try
      {
        Thread.sleep(NFS_RETRY_INTERVAL);
      }
      catch (InterruptedException e)
      {
        // ignore
        break;
      }

      try
      {
        if (f.createNewFile())
          success = true;
        else if (f.exists())
          return false;
      }
      catch (IOException e)
      {
        recordE = e;
      }

      if (success)
      {
        LOG.log(Level.INFO, "successfully to create new file by retry: " + i + " file: " + f.getAbsolutePath());
        return true;
      }
    }

    LOG.log(Level.INFO, "failed to create new file by retry: " + retry + " file: " + f.getAbsolutePath());
    if (recordE == null)
    {
      recordE = new IOException("failed to create new file: " + f.getAbsolutePath());
    }
    throw recordE;
  }

  public static boolean nfs_MoveDirToDir(File sourceDir, File targetDir, int seconds)
  {
    if (!nfs_assertExistsDirectory(sourceDir, seconds))
    {
      LOG.log(Level.INFO, "Source directory [" + sourceDir.getAbsolutePath() + "] does not exist.");
      return false;
    }

    if (sourceDir.renameTo(targetDir))
    {
      return true;
    }

    if (nfs_copyDirToDir(sourceDir, targetDir, seconds))
    {
      nfs_cleanDirectory(sourceDir, seconds);
    }
    else
    {
      LOG.log(Level.INFO, "failed to move directory from: " + sourceDir + " to: " + targetDir);
      return false;
    }
    return true;
  }

  public static void nfs_moveFileToDir(File sourceFile, File targetDir, int seconds) throws IOException
  {
    if (!nfs_assertExistsFile(sourceFile, seconds))
    {
      throw new FileNotFoundException("Source file [" + sourceFile.getAbsolutePath() + "] does not exist.");
    }

    String fileName = sourceFile.getName();
    File targetChildFile = new File(targetDir, fileName);
    if (targetChildFile.exists())
    {
      nfs_delete(targetChildFile, seconds);
    }

    nfs_renameFile(sourceFile, targetChildFile, seconds);
  }

  public static void nfs_forceCreateDirectory(File dir, int seconds)
  {
    if (dir.exists())
    {
      nfs_cleanDirectory(dir, seconds);
    }

    nfs_mkdirs(dir, seconds);
  }

  public static String nfs_readFileAsString(File f, int seconds) throws IOException
  {
    if (!nfs_assertExistsFile(f, seconds))
    {
      LOG.log(Level.INFO, "cannot read file as string, file does not exists: " + f.getAbsolutePath());
    }

    int length = (int) f.length();
    StringBuffer buffer = new StringBuffer(length);
    BufferedReader br = null;
    IOException recordE = null;
    boolean success = false;
    try
    {
      br = new BufferedReader(new InputStreamReader(new FileInputStream(f), DEFAULT_ENCODING));
      int ch;
      while ((ch = br.read()) > -1)
      {
        buffer.append((char) ch);
      }
      success = true;
    }
    catch (IOException e)
    {
      LOG.log(Level.INFO, "failed read string from file: " + f.getAbsolutePath() + " will retry shortly", e);
      recordE = e;
    }
    finally
    {
      if (br != null)
      {
        try
        {
          br.close();
        }
        catch (IOException e)
        {
          LOG.log(Level.WARNING, "cannot close stream: " + f.getAbsolutePath(), e);
        }
      }
    }

    if (success)
      return buffer.toString();

    LOG.log(Level.INFO, "retry to read string from file: " + f.getAbsolutePath());
    if (seconds < 0)
    {
      seconds = 0;
    }

    int retry = seconds * 1000 / NFS_RETRY_INTERVAL;
    for (int i = 0; i < retry; i++)
    {
      try
      {
        Thread.sleep(NFS_RETRY_INTERVAL);
      }
      catch (InterruptedException e)
      {
        // ignore
        break;
      }

      try
      {
        buffer = new StringBuffer(length);
        br = new BufferedReader(new InputStreamReader(new FileInputStream(f), DEFAULT_ENCODING));
        int ch;
        while ((ch = br.read()) > -1)
        {
          buffer.append((char) ch);
        }
        success = true;
      }
      catch (IOException e)
      {
        LOG.log(Level.INFO, "failed to read string from file by retry: " + i + " file: " + f.getAbsolutePath(), e);
        recordE = e;
      }
      finally
      {
        if (br != null)
        {
          try
          {
            br.close();
          }
          catch (IOException e)
          {
            LOG.log(Level.WARNING, "cannot close stream: " + f.getAbsolutePath(), e);
          }
        }
      }

      if (success)
      {
        LOG.log(Level.INFO, "successfully to read string from file by retry: " + i + " file: " + f.getAbsolutePath());
        return buffer.toString();
      }
    }

    LOG.log(Level.INFO, "failed to read string from file by retry: " + retry + " file: " + f.getAbsolutePath());
    if (recordE != null)
    {
      recordE = new IOException("failed to read string from file: " + f.getAbsolutePath());
    }
    throw recordE;
  }

  public static boolean nfs_writeStringToFile(File f, String content, int seconds) throws IOException
  {
    BufferedWriter bw = null;
    IOException recordE = null;
    boolean success = false;
    try
    {
      bw = new BufferedWriter(new OutputStreamWriter(new FileOutputStream(f), DEFAULT_ENCODING));
      bw.write(content);
      bw.flush();
    }
    catch (IOException e)
    {
      LOG.log(Level.INFO, "failed write string to file: " + f.getAbsolutePath() + " will retry shortly", e);
      recordE = e;
    }
    finally
    {
      if (bw != null)
      {
        try
        {
          bw.close();
        }
        catch (IOException e)
        {
          LOG.log(Level.WARNING, "cannot close stream: " + f.getAbsolutePath(), e);
        }
      }
    }

    if (success)
      return true;

    LOG.log(Level.INFO, "retry to write string to file: " + f.getAbsolutePath());
    if (seconds < 0)
    {
      seconds = 0;
    }

    int retry = seconds * 1000 / NFS_RETRY_INTERVAL;
    for (int i = 0; i < retry; i++)
    {
      try
      {
        Thread.sleep(NFS_RETRY_INTERVAL);
      }
      catch (InterruptedException e)
      {
        // ignore
        break;
      }

      try
      {
        bw = new BufferedWriter(new OutputStreamWriter(new FileOutputStream(f), DEFAULT_ENCODING));
        bw.write(content);
        bw.flush();
        success = true;
      }
      catch (IOException e)
      {
        LOG.log(Level.INFO, "failed to write string to file by retry: " + i + " file: " + f.getAbsolutePath(), e);
        recordE = e;
      }
      finally
      {
        if (bw != null)
        {
          try
          {
            bw.close();
          }
          catch (IOException e)
          {
            LOG.log(Level.WARNING, "cannot close stream: " + f.getAbsolutePath(), e);
          }
        }
      }

      if (success)
      {
        LOG.log(Level.INFO, "successfully to write string to file by retry: " + i + " file: " + f.getAbsolutePath());
        return true;
      }
    }

    LOG.log(Level.INFO, "failed to write string to file by retry: " + retry + " file: " + f.getAbsolutePath());
    if (recordE != null)
    {
      recordE = new IOException("failed to write string to file: " + f.getAbsolutePath());
    }
    throw recordE;
  }

  public static void deleteFile(String fileName)
  {
    File file = new File(fileName);
    if (file.exists())
      file.delete();
  }

  public static void unzip(File file, String dir) throws Exception
  {
    InputStream is = null;
    OutputStream os = null;
    try
    {
      ZipFile zipFile = new ZipFile(file.getAbsolutePath());
      Enumeration<? extends ZipEntry> entries = zipFile.entries();
      while (entries.hasMoreElements())
      {
        ZipEntry entry = entries.nextElement();
        File entryDest = new File(dir, entry.getName());
        if (entry.isDirectory())
        {
          boolean succ = entryDest.mkdirs();
          if(!succ)
          {
            throw new Exception();
          }
        }
        else
        {
          is = zipFile.getInputStream(entry);
          os = new FileOutputStream(entryDest);
          byte[] buffer = new byte[8 * 1024 * 1024];
          int len = 0;
          while ((len = is.read(buffer)) > 0)
          {
            os.write(buffer, 0, len);
          }
          is.close();
          os.close();
        }
      }
    }
    catch (Exception e)
    {
      throw new Exception(e);
    }
    finally
    {
      if (is != null)
      {
        try
        {
          is.close();
        }
        catch (Exception e)
        {
        }
      }
      if (os != null)
      {
        try
        {
          os.close();
        }
        catch (Exception e)
        {
        }
      }
    }
  }
}
