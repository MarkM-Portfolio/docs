/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.docs.common.io;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.FilenameFilter;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.io.OutputStreamWriter;
import java.util.Set;
import java.util.logging.Level;
import java.util.logging.Logger;

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

  public static boolean exists(File file)
  {
    if (file.exists())
    {
      return true;
    }

    FileInputStream fis = null;
    boolean exist = true;
    try
    {
      file.getParentFile().listFiles();
      fis = new FileInputStream(file);
    }
    catch (FileNotFoundException e)
    {
      exist = false;
    }
    finally
    {
      if (fis != null)
      {
        try
        {
          fis.close();
        }
        catch (Exception e)
        {
          LOG.log(Level.FINE, "close stream IOException: " + file.getAbsolutePath(), e);
        }
      }
    }

    return exist;
  }

  public static String readFile(String path)
  {
    int length = (int) new File(path).length();
    StringBuffer buffer = new StringBuffer(length);
    try
    {
      BufferedReader is = new BufferedReader(new InputStreamReader(new FileInputStream(path), DEFAULT_ENCODING));
      int ch;
      while ((ch = is.read()) > -1)
      {
        buffer.append((char) ch);
      }
      is.close();
    }
    catch (IOException e)
    {
      e.printStackTrace();
      return null;
    }
    return buffer.toString();
  }

  public static boolean writeFile(String content, String path)
  {
    try
    {
      BufferedWriter writer = new BufferedWriter(new OutputStreamWriter(new FileOutputStream(path), DEFAULT_ENCODING));
      writer.write(content);
      writer.flush();
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
   * @param file
   * @param targetDir
   * @param newName
   * @return true copy the file to target directory successfully, otherwise false.
   */
  public static boolean copyFileToDir(File file, File targetDir, String newName)
  {
    boolean success = false;

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
      success = true;
    }
    catch (IOException e)
    {
      e.printStackTrace();
    }

    return success;
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

  public static void cleanDirectory(File dir)
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
        cleanDirectory(f);
        f.delete();
      }
      else
      {
        f.delete();
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

  public static void copyFileToFile(final File src, final File dest) throws IOException
  {
    if(LOG.isLoggable(Level.FINER))
    {
      LOG.log(Level.FINER, "copying file {0} to {1}", new Object[]{src.getAbsolutePath(), dest.getAbsolutePath()});
    }
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
  
  /*
   * Not use renameTo api, but copy first then delete
   * Only used to rename files, rather than rename folder
   * If want to rename folder, use nfs_moveDirToDir instead
   */
  public static boolean nfs_renameFileByCopy(File oldFile, File newFile, int seconds)
  {
    try
    {
      FileUtil.nfs_copyFileToFile(oldFile, newFile, seconds);
      return nfs_delete(oldFile, seconds);
    }
    catch (IOException e)
    {
      LOG.log(Level.INFO, "failed to rename file by copy: src file: {0} dest file: {1}", new Object[] {
          oldFile.getAbsolutePath(), newFile.getAbsolutePath() });
      return false;
    }
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
    IOException recordE = null;

    try
    {
      FileUtil.copyFileToFile(src, dest);
      return;
    }
    catch (IOException e)
    {
      LOG.log(Level.INFO, "failed to copy file from: " + src.getAbsolutePath() + "to: " + dest.getAbsolutePath() + ", will retry shortly.",
          e);
      recordE = e;
    }


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
        FileUtil.copyFileToFile(src, dest);
        LOG.log(Level.INFO,
            "successfully to copy file by retry: " + i + " from: " + src.getAbsolutePath() + " to: " + dest.getAbsolutePath());
        return;
      }
      catch (IOException e)
      {
        recordE = e;
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
    if (children != null)
    {
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
        {
          break;
        }
      }
    }
    else
    {
      LOG.log(Level.INFO, "return null file list, when copy from: " + srcDir.getAbsolutePath() + " to folder: " + destDir.getAbsolutePath());
      success = false;
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
    if (children != null)
    {
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
        {
          break;
        }
      }
    }
    else
    {
      LOG.log(Level.INFO, "return null file list, when copy from: " + srcDir.getAbsolutePath() + " to folder: " + destDir.getAbsolutePath());
      success = false;
    }

    if (!success)
    {
      LOG.log(Level.INFO, "failed to copy folder from: " + srcDir.getAbsolutePath() + " to folder: " + destDir.getAbsolutePath());
    }

    return success;
  }

  public static boolean nfs_copyDirToDir(File srcDir, File destDir, FilenameFilter filter, int seconds)
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

    File[] children = srcDir.listFiles(filter);
    if (children != null)
    {
      for (int i = 0; i < children.length; i++)
      {
        File f = children[i];
        if (nfs_isFile(f, seconds))
        {
          success = nfs_copyFileToDir(f, destDir, null, seconds);
        }
        else
        {
          success = nfs_copyDirToDir(f, new File(destDir, f.getName()), filter, seconds);
        }

        if (!success)
        {
          break;
        }
      }
    }
    else
    {
      LOG.log(Level.INFO, "return null file list, when copy from: " + srcDir.getAbsolutePath() + " to folder: " + destDir.getAbsolutePath());
      success = false;
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

    if (!targetDir.exists())
    {
      nfs_mkdirs(targetDir, seconds);
    }

    boolean success = true;
    File[] children = sourceDir.listFiles();
    for (int i = 0; i < children.length; i++)
    {
      File child = children[i];
      if (nfs_isFile(child, seconds))
      {
        success = nfs_moveFileToDir(child, targetDir, seconds);
      }
      else
      {
        success = nfs_MoveDirToDir(child, new File(targetDir, child.getName()), seconds);
      }
      if (!success)
      {
        LOG.log(Level.INFO, "Failed to move: " + child + " to: " + targetDir);
        break;
      }
    }

    if (success)
    {
      sourceDir.delete();
    }

    return success;
  }

  public static boolean nfs_moveFileToDir(File sourceFile, File targetDir, int seconds)
  {
    if (!nfs_assertExistsFile(sourceFile, seconds))
    {
      LOG.log(Level.INFO, "Source file [" + sourceFile.getAbsolutePath() + "] does not exist.");
      return false;
    }

    String fileName = sourceFile.getName();
    File targetChildFile = new File(targetDir, fileName);
    if (targetChildFile.exists())
    {
      nfs_delete(targetChildFile, seconds);
    }

    return nfs_renameFileByCopy(sourceFile, targetChildFile, seconds);
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
      success = true;
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
  
  public static String resolve(String path)
  {
    if (File.separatorChar == '\\')
    {
      if (path.indexOf('/') != -1)
      {
        path = path.replace('/', '\\');
      }
      if (path.endsWith("\\"))
      {
        path = path.substring(0, path.length() - 1);
      }
    }
    else
    {
      if (path.endsWith("/"))
      {
        path = path.substring(0, path.length() - 1);
      }
    }
    return path;
  }
}
