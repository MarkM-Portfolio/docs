/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.viewer.platform.exceptions;

public class UnsupportedMimeTypeException extends Exception
{
  private static final long serialVersionUID = -6252999699349758907L;
  
  /**
   * Exception code(1300) indicates that the MIME type is not supported.
   */
  public static final int EC_MIME_UNSUPPORTED_TYPE = 1300;
  
  private int nErrorCode = 0;
  
  public UnsupportedMimeTypeException(final String message)
  {
    super(message);
    nErrorCode = EC_MIME_UNSUPPORTED_TYPE;
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
