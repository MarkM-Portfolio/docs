package com.ibm.concord.spreadsheet.common.utils;

import java.io.File;
import java.io.InputStream;

/*
 * Interface for get streamer, for viewer html cache encryption supporter
 */
public interface StreamBuilder
{
  public InputStream getInputStream(File f);
  public InputStream getInputStream(String path);
}
