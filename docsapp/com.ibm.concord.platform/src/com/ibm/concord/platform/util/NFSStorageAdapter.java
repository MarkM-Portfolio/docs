/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2013. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.platform.util;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.concord.config.ConcordConfig;
import com.ibm.concord.spi.util.IStorageAdapter;
import com.ibm.concord.spi.util.IStorageLock;
import com.ibm.docs.common.io.FileUtil;
import com.ibm.json.java.JSONObject;

public class NFSStorageAdapter implements IStorageAdapter
{
  private static final Logger LOG = Logger.getLogger(NFSStorageAdapter.class.getName());
  
  private static boolean isNativeLock = false;
  
  static
  {
    JSONObject config = ConcordConfig.getInstance().getSubConfig("nativefilelock");
    if (config != null && config.get("enabled") != null)
    {
      isNativeLock = Boolean.parseBoolean(config.get("enabled").toString());
    }
    else
    {
      isNativeLock = false;
    }
    LOG.info("Now the native lock is " + isNativeLock);
  }

  protected File draftFile;
  
  private IStorageLock storageLock = null;  
  
  public NFSStorageAdapter()
  {
  }
  
  protected void createLock()
  {
    if (isNativeLock)
    {
      storageLock = new StorageNativeLock(draftFile);
    }
    else
    {
      storageLock = new StorageJavaLock(draftFile);
    }    
  }

  public void init(String pathname)
  {
    draftFile = new File(pathname);
    this.createLock();
  }

  public void init(String parent, String child)
  {
    draftFile = new File(parent, child);
    this.createLock();
  }

  public void init(IStorageAdapter parent, String child)
  {
    draftFile = new File((File) parent.getRaw(), child);
    this.createLock();
  }

  public void createNewFile() throws IOException
  {
    FileUtil.nfs_createNewFile(draftFile, FileUtil.NFS_RETRY_SECONDS);
  }

  public boolean delete()
  {
    if (FileUtil.nfs_isDirectory(draftFile, FileUtil.NFS_RETRY_SECONDS))
    {
      FileUtil.nfs_cleanDirectory(draftFile, FileUtil.NFS_RETRY_SECONDS);
    }
    else
    {
      FileUtil.nfs_delete(draftFile, FileUtil.NFS_RETRY_SECONDS);
    }

    return true;
  }

  public boolean exists()
  {
    return draftFile.exists();
  }

  public boolean assertExistsFile()
  {
    return FileUtil.nfs_assertExistsFile(draftFile, FileUtil.NFS_RETRY_SECONDS);
  }

  public String getName()
  {
    return draftFile.getName();
  }

  public InputStream getInputStream() throws IOException
  {
    return new FileInputStream(draftFile);
  }

  public OutputStream getOutputStream() throws IOException
  {
    return new FileOutputStream(draftFile);
  }

  public OutputStream getOutputStream4Append() throws IOException
  {
    return new FileOutputStream(draftFile, true);
  }

  public String getPath()
  {
    return draftFile.getPath();
  }

  public long getSize()
  {
    return draftFile.length();
  }

  public boolean isFile()
  {
    return FileUtil.nfs_isFile(draftFile, FileUtil.NFS_RETRY_SECONDS);
  }

  public boolean isFolder()
  {
    return FileUtil.nfs_isDirectory(draftFile, FileUtil.NFS_RETRY_SECONDS);
  }

  public boolean mkdirs()
  {
    return FileUtil.nfs_mkdirs(draftFile, FileUtil.NFS_RETRY_SECONDS);
  }

  public boolean rename(IStorageAdapter target)
  {
    if (isFile())
    {
      return FileUtil.nfs_renameFile(draftFile, new File(target.getPath()), FileUtil.NFS_RETRY_SECONDS);
    }
    else
    {
      return FileUtil.nfs_MoveDirToDir(draftFile, new File(target.getPath()), FileUtil.NFS_RETRY_SECONDS);
    }
  }

  public IStorageAdapter getParent()
  {
    String parentFilePath = draftFile.getParent();
    NFSStorageAdapter parent = new NFSStorageAdapter();
    parent.init(parentFilePath);
    return parent;
  }

  public IStorageAdapter[] listFiles()
  {
    File[] subFiles = FileUtil.nfs_listFiles(draftFile, FileUtil.NFS_RETRY_SECONDS);
    if (subFiles != null)
    {
      IStorageAdapter[] subDraftFiles = new IStorageAdapter[subFiles.length];
      for (int i = 0; i < subFiles.length; i++)
      {
        subDraftFiles[i] = new NFSStorageAdapter();
        ((NFSStorageAdapter) subDraftFiles[i]).init(subFiles[i].getPath());
      }
      return subDraftFiles;
    }
    return null;
  }
  
  public void lock() throws IOException
  {   
    storageLock.lock();
  }
  
  public void release() throws IOException
  {
    if (storageLock != null)
    {
      storageLock.release();
    }
  }
  
  public Object getRaw()
  {
    return draftFile;
  }

  public void clean() throws IOException
  {
    if (isFolder())
    {
      // Clean the files or sub directories in this directory.
      FileUtil.nfs_cleanDirectory(draftFile, FileUtil.NFS_RETRY_SECONDS);
    }
    else
    {
      // Just delete this file.
      if (FileUtil.nfs_delete(draftFile, FileUtil.NFS_RETRY_SECONDS))
      {
        LOG.log(Level.WARNING, "Can not delete the file {0}.", draftFile);
      }
    }
  }

  public void moveTo(String destDir) throws IOException
  {
    boolean success;
    File destFile = new File(destDir);
    if (isFolder())
    {
      success = FileUtil.nfs_MoveDirToDir(draftFile, destFile, FileUtil.NFS_RETRY_SECONDS);
    }
    else
    {
      success = FileUtil.nfs_moveFileToDir(draftFile, destFile, FileUtil.NFS_RETRY_SECONDS);
    }
    if (!success)
    {
      throw new IOException("Failed to move " + draftFile.getAbsolutePath() + " to " + destDir);
    }
  }
}