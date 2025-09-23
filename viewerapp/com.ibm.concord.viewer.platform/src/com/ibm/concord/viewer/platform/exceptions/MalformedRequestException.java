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

/**
 * This class is used to define the malformed request related exception. The numbers(14xx) are used to indicate the malformed request
 * related error codes.
 * 
 */
public class MalformedRequestException extends Exception
{
  private static final long serialVersionUID = -6550451427013525632L;

  public static final int EC_MALFORMED_INVALID_REQUEST = 1400;

  public static final int EC_FULLVIEWER_INVALID_REQUEST = 1401;

  private int nErrorCode = EC_MALFORMED_INVALID_REQUEST;

  /**
   * 
   * @param message
   *          indicates the error message
   */
  public MalformedRequestException(String message)
  {
    super(message);
  }

  /**
   * 
   * @param nErrorCode
   *          indicates the error codes that defined in this exception.
   * @param message
   *          indicates the error message
   */
  public MalformedRequestException(int nErrorCode, String message)
  {
    super(message);
    this.nErrorCode = nErrorCode;
  }

  /**
   * 
   * @return the error code of the exception.
   */
  public int getErrorCode()
  {
    return nErrorCode;
  }
}
