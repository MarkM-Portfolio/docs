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

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
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
public class NFSFileUtil
{
  private static final int NFS_RETRY_INTERVAL = 100;
  public static final int NFS_RETRY_SECONDS = 2;
  private static final Logger LOG = Logger.getLogger(NFSFileUtil.class.getName());
  
  private static final String DEFAULT_ENCODING = "UTF-8";

  
  private static void copyFileToFile(final File src, final File dest) throws IOException
  {
    copyInputStreamToFile(new FileInputStream(src), dest);
    dest.setLastModified(src.lastModified());
  }

  private static void copyInputStreamToFile(final InputStream is, final File f) throws IOException
  {
    copyInputStreamToOutputStream(is, new FileOutputStream(f));
  }

  private static void copyInputStreamToOutputStream(final InputStream in, final OutputStream out) throws IOException
  {
    try
    {
      try
      {
        final byte[] buffer = new byte[32768];
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

  public static boolean nfs_assertExistsFile(File f, int seconds)
  {
    if (f.exists())
      return true;
    
    LOG.log(Level.FINEST, "retry to check file existence: " + f.getAbsolutePath());
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
        if(fis != null)
        {
          try
          {
            fis.close();
          }
          catch (IOException e)
          {
            LOG.log(Level.INFO,"close stream IOException: " + f.getAbsolutePath(), e);
          }
        }
      }

      if (exists)
      {
        LOG.log(Level.FINEST, "successfully to check file existence by retry: " + i + " file: " + f.getAbsolutePath());
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
    
    LOG.log(Level.FINEST, "retry to check directory existence: " + f.getAbsolutePath());
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
        LOG.log(Level.FINEST, "successfully to check directory existence by retry: " + i + " file: " + f.getAbsolutePath());
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
    
    LOG.log(Level.FINEST, "retry to delete file: " + file.getAbsolutePath());
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
        LOG.log(Level.FINEST, "successfully to delete file by retry: " + i + " file: " + file.getAbsolutePath());
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
    
    LOG.log(Level.FINEST, "retry to check directory attribute: " + f.getAbsolutePath());
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
        LOG.log(Level.FINEST, "successfully to check directory attribute by retry: " + i + " file: " + f.getAbsolutePath());
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
    
    LOG.log(Level.FINEST, "retry to check file attribute: " + f.getAbsolutePath());
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
        LOG.log(Level.FINEST, "successfully to check file attribute by retry: " + i + " file: " + f.getAbsolutePath());
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

    LOG.log(Level.FINEST, "retry to rename file from: " + oldFile.getAbsolutePath() + " to: " + newFile.getAbsolutePath());
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
          LOG.log(Level.FINEST, "new file existed: {0}", newFile.getAbsolutePath());
          break;
        }
        else
        {
          copyFileToFile(oldFile, newFile);
          if (nfs_delete(oldFile, seconds))
          {
            return true;
          }
          else {
            break;
          }
        }
      }
      catch (IOException e)
      {
        LOG.log(Level.INFO, "create new file IOException: {0} {1} {2}",
            new Object[] { oldFile.getAbsolutePath(), newFile.getAbsolutePath(), e });
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
    
    LOG.log(Level.FINEST, "retry to list file: " + dir.getAbsolutePath());
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
        LOG.log(Level.FINEST, "successfully to list file by retry: " + i + " file: " + dir.getAbsolutePath());
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
    if (files == null) return;
    
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
    if (files == null) return;
    
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
    
    LOG.log(Level.FINEST, "retry to mkdir: " + f.getAbsolutePath());
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
        LOG.log(Level.FINEST, "successfully to mkdir by retry: " + i + " file: " + f.getAbsolutePath());
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
    
    LOG.log(Level.FINEST, "retry to mkdirs: " + f.getAbsolutePath());
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
        LOG.log(Level.FINEST, "successfully to mkdirs by retry: " + i + " file: " + f.getAbsolutePath());
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
   * Copy a file (in local/shared storage) to another file (in shared storage/local)
   * assume this operation expect to be successful
   */
  public static void nfs_copyFileToFile(File src, File dest, int seconds) throws IOException
  {
    if(src.getAbsolutePath().equalsIgnoreCase(dest.getAbsolutePath()))
      return;

    FileInputStream fis = null;
    FileOutputStream fos = null;
    IOException recordE = null;
    
    boolean success = false;
    try {
      fis = new FileInputStream(src);
      fos = new FileOutputStream(dest);
      copyInputStreamToOutputStream(fis, fos);
      dest.setLastModified(src.lastModified());
      success = true;
    }
    catch (IOException e)
    {
      LOG.log(Level.INFO, "failed to copy file from: " + src.getAbsolutePath() + " to: " + dest.getAbsolutePath() + ", will retry shortly.", e);
      recordE = e;
    }
    finally {
      try {
        if (fis != null)
        {
          fis.close();
        }
      }
      catch (IOException e)
      {
        LOG.log(Level.WARNING, "fail to close stream: " + e);
      }
      
      try {
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
    
    LOG.log(Level.FINEST, "retry to copy file from: " + src.getAbsolutePath() + "to: " + dest.getAbsolutePath());
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
      
      try {
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
      finally {
        try {
          if (fis != null)
          {
            fis.close();
          }
        }
        catch (IOException e)
        {
          LOG.log(Level.WARNING, "fail to close stream: " + e);
        }
        
        try {
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
        LOG.log(Level.FINEST, "successfully to copy file by retry: " + i + " from: " + src.getAbsolutePath() + " to: " + dest.getAbsolutePath());
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
    
    if (!dir.exists())
    {
      nfs_mkdirs(dir, seconds);
    }
    
    File targetFile = new File(dir, name);
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
      LOG.log(Level.INFO, "source directory does not exists for copyDirToDir: " + srcDir.getAbsolutePath() + " to: " + destDir.getAbsolutePath());
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
      else {
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
      LOG.log(Level.INFO, "source directory does not exists for copyDirToDir: " + srcDir.getAbsolutePath() + " to: " + destDir.getAbsolutePath());
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
        if(index != -1)
        {
          String ext = name.substring(index, name.length());
          if(!extFilters.contains(ext))
          {
            success = nfs_copyFileToDir(f, destDir, null, seconds);
          }
        }
        else
        {
          success = nfs_copyFileToDir(f, destDir, null, seconds);          
        }
      }
      else {
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
    try {
      if (f.createNewFile())
        return nfs_assertExistsFile(f, seconds);
      else if (f.exists())
        return false;
    }
    catch (IOException e)
    {
      LOG.log(Level.INFO, "failed to create new file: " + f.getAbsolutePath() + ", will retry shortly.", e);
      recordE = e;
    }
    
    LOG.log(Level.FINEST, "retry to create new file: " + f.getAbsolutePath());
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
      
      try {
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
        LOG.log(Level.FINEST, "successfully to create new file by retry: " + i + " file: " + f.getAbsolutePath());
        return nfs_assertExistsFile(f, seconds);
      }
    }
    
    LOG.log(Level.INFO, "failed to create new file by retry: " + retry + " file: " + f.getAbsolutePath());
    if (recordE == null)
    {
      recordE = new IOException("failed to create new file: " + f.getAbsolutePath());
    }
    throw recordE;
  }
  
  public static String nfs_readFileAsString(File f, int seconds) throws IOException
  {
    if (!nfs_assertExistsFile(f, seconds))
    {
      LOG.log(Level.INFO, "cannot read file as string, file does not exists: " + f.getAbsolutePath());
      throw new IOException("Failed to read file as string, file does not exists: " + f.getAbsolutePath());
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
      if (buffer.length() > 0)
      {
        success = true;
      }
    }
    catch (IOException e)
    {
      LOG.log(Level.INFO, "failed read string from file: " + f.getAbsolutePath() + " will retry shortly", e);
      recordE = e;
    }
    finally {
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
    
    LOG.log(Level.FINEST, "retry to read string from file: " + f.getAbsolutePath());
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
        if (buffer.length() > 0)
        {
          success = true;
        }
      }
      catch (IOException e)
      {
        LOG.log(Level.INFO, "failed to read string from file by retry: " + i + " file: " + f.getAbsolutePath(), e);
        recordE = e;
      }
      finally {
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
        LOG.log(Level.FINEST, "successfully to read string from file by retry: " + i + " file: " + f.getAbsolutePath());
        return buffer.toString();
      }
    }
    
    LOG.log(Level.INFO, "failed to read string from file by retry: " + retry + " file: " + f.getAbsolutePath());
    if (recordE == null)
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
    finally {
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
    
    LOG.log(Level.FINEST, "retry to write string to file: " + f.getAbsolutePath());
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
      finally {
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
        LOG.log(Level.FINEST, "successfully to write string to file by retry: " + i + " file: " + f.getAbsolutePath());
        return true;
      }
    }
    
    LOG.log(Level.INFO, "failed to write string to file by retry: " + retry + " file: " + f.getAbsolutePath());
    if (recordE == null)
    {
      recordE = new IOException("failed to write string to file: " + f.getAbsolutePath());
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
    else {
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
  public static String readDraftFormatVersion(File parentFolder)
  {
    String version = null;
    try 
    {
      File file = new File(parentFolder, "conversionVersion.txt");
      if (file.exists())
      {
        version = nfs_readFileAsString(file, NFSFileUtil.NFS_RETRY_SECONDS);
      }
    } 
    catch (Exception e)
    {
      LOG.log(Level.INFO, "can not get draft version from " + parentFolder);
    }
    return version;
  }
  
}

