/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.spi.exception;

/**
 * @author gaowwei@cn.ibm.com
 *
 */
public class AccessException extends Exception
{
  private static final long serialVersionUID = 8477329995258724686L;
  private final int code;
  
  /**
   * Exception code(1100) indicates that the document is encrypted while user upload it to repository.
   */
  public static final int EC_DOCUMENT_ENCRYPT = 1100;
  
  public AccessException(final String message, final int code)
  {
    super(message);
    this.code = code;
  }
  
  public AccessException(final String message)
  {
    this(message, 403);
  }

  public int getCode()
  {
    return code;
  }
}
