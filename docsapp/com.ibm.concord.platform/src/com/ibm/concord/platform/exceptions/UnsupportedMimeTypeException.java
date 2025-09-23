/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.platform.exceptions;

public class UnsupportedMimeTypeException extends Exception
{
  private static final long serialVersionUID = -6252999699349758907L;
  
  /**
   * Exception code(1300) indicates that the MIME type is not supported.
   */
  public static final int EC_MIME_UNSUPPORTED_TYPE = 1300;
  public static final int EC_MIME_OLD_UNSUPPORTED_VIEW_MOBILE = 1350;
  
  private int nErrorCode = 0;
  
  public UnsupportedMimeTypeException(final String message)
  {
    super(message);
    nErrorCode = EC_MIME_UNSUPPORTED_TYPE;
  }
  
  public UnsupportedMimeTypeException(final String message, final int errorCode)
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
