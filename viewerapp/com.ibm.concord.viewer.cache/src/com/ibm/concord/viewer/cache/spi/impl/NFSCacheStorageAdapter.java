/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.viewer.cache.spi.impl;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;

import com.ibm.concord.viewer.spi.cache.CacheStorageAdapterFactory;
import com.ibm.concord.viewer.spi.cache.ICacheStorageAdapter;

public class NFSCacheStorageAdapter implements ICacheStorageAdapter
{

  private File cacheFile;

  public NFSCacheStorageAdapter()
  {
    ;
  }

  public void init(String pathname)
  {
    cacheFile = new File(pathname);
  }

  public void init(String parent, String child)
  {
    cacheFile = new File(parent, child);
  }

  public void init(ICacheStorageAdapter parent, String child)
  {
    cacheFile = new File((File) parent.getRaw(), child);
  }

  public void createNewFile() throws IOException
  {
    cacheFile.createNewFile();
  }

  public boolean delete()
  {
    if (cacheFile.isDirectory())
    {
      ICacheStorageAdapter[] cacheFiles = this.listFiles();
      for (int i = 0; i < cacheFiles.length; i++)
      {
        cacheFiles[i].delete();
      }
      return cacheFile.delete();
    }
    else
    {
      return cacheFile.delete();
    }
  }

  public boolean exists()
  {
    return cacheFile.exists();
  }

  public String getName()
  {
    return cacheFile.getName();
  }

  public InputStream getInputStream() throws IOException
  {
    return new FileInputStream(cacheFile);
  }

  public OutputStream getOutputStream() throws IOException
  {
    return new FileOutputStream(cacheFile);
  }

  public OutputStream getOutputStream4Append() throws IOException
  {
    return new FileOutputStream(cacheFile, true);
  }

  public String getPath()
  {
    return cacheFile.getPath();
  }

  public long getSize()
  {
    return cacheFile.length();
  }

  public boolean isFile()
  {
    return cacheFile.isFile();
  }

  public boolean isFolder()
  {
    return cacheFile.isDirectory();
  }

  public boolean mkdirs()
  {
    return cacheFile.mkdirs();
  }

  public ICacheStorageAdapter getParent()
  {
    String parentFilePath = cacheFile.getParent();
    return CacheStorageAdapterFactory.newCacheAdapter(parentFilePath, NFSCacheStorageAdapter.class);
  }

  public ICacheStorageAdapter[] listFiles()
  {
    File[] subFiles = cacheFile.listFiles();
    ICacheStorageAdapter[] subCacheFiles = new ICacheStorageAdapter[subFiles.length];
    for (int i = 0; i < subFiles.length; i++)
    {
      subCacheFiles[i] = new NFSCacheStorageAdapter();
      subCacheFiles[i].init(subFiles[i].getPath());
    }
    return subCacheFiles;
  }

  public Object getRaw()
  {
    return cacheFile;
  }
}
