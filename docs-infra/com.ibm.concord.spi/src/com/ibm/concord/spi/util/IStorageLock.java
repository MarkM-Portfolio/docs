package com.ibm.concord.spi.util;

import java.io.IOException;

public interface IStorageLock
{
  public void lock() throws IOException;

  public void release() throws IOException;

}
