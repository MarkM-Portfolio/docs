/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2013. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.spi.util;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;

public interface IStorageAdapter
{
  public static final String separator = File.separator;

  public void init(String pathname);

  public void init(String parent, String child);

  public void init(IStorageAdapter parent, String child);
 
  public Object getRaw();

  public String getPath();

  public long getSize();

  public boolean exists();

  public boolean assertExistsFile();
  
  public boolean isFile();

  public boolean isFolder();

  public boolean delete();

  public boolean mkdirs();
  
  public boolean rename(IStorageAdapter target);
  
  public void clean() throws IOException;
  
  public void moveTo(String destDir) throws IOException;
  
  public IStorageAdapter getParent();

  public String getName();

  public InputStream getInputStream() throws IOException;

  public OutputStream getOutputStream() throws IOException;

  public OutputStream getOutputStream4Append() throws IOException;

  public void createNewFile() throws IOException;

  public void lock() throws IOException;

  public void release() throws IOException;

  public IStorageAdapter[] listFiles();
}