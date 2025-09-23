package com.ibm.concord.viewer.spi.exception;

public class SnapshotException extends Exception
{
  private static final long serialVersionUID = 1L;

  private int errorCode = 0;
  
  public int getErrorCode()
  {
    return errorCode;
  }

  public SnapshotException(int errorCode)
  {
    this.errorCode = errorCode;
  }
  
}
