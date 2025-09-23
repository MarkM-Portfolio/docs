package com.ibm.concord.platform.exceptions;

public class InvalidVersionException extends Exception
{
  
  private static final long serialVersionUID = 4014755224251486278L;
  
  public static final int EC_INVALID_VERSION = 4000;
  private int nErrorCode = 0;
  
  public InvalidVersionException(final String message)
  {
    super(message);
    nErrorCode = EC_INVALID_VERSION;
  }
  
  public InvalidVersionException(final String message, final int errorCode)
  {
    super(message);
    nErrorCode = errorCode;
  }

  /**
   * Get the error code of this exception.
   * 
   * @return
   */
  public int getErrorCode()
  {
    return nErrorCode;
  }
}
