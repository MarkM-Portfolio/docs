/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.viewer.spi.cache;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;

public interface ICacheStorageAdapter
{
  public static final String separator = File.separator;

  public void init(String pathname);

  public void init(String parent, String child);

  public void init(ICacheStorageAdapter parent, String child);

  public Object getRaw();

  public String getPath();

  public long getSize();

  public boolean exists();

  public boolean isFile();

  public boolean isFolder();

  public boolean delete();

  public boolean mkdirs();

  public ICacheStorageAdapter getParent();

  public String getName();

  public InputStream getInputStream() throws IOException;

  public OutputStream getOutputStream() throws IOException;

  public OutputStream getOutputStream4Append() throws IOException;

  public void createNewFile() throws IOException;

  public ICacheStorageAdapter[] listFiles();
}
