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

import com.ibm.json.java.JSONObject;

/**
 * The numbers(17xx) are used to indicate the document service related error codes.
 *
 */
public class DocumentServiceException extends ConcordException
{
  private static final long serialVersionUID = 1L;

  public static final int EC_DOCUMENT_SERVICE_ERROR = 1700;

  public static final int EC_DOCUMENT_EXCEED_MAX_SESSION_ERROR = 1701;

  public static final int EC_DOCUMENT_EXCEED_MAX_USERS_PER_SESSION_ERROR = 1702;

  public static final int EC_DOCUMENT_IMPORT_CONFLICT_ERROR = 1703;

  public static final int EC_DOCUMENT_LOCKED_EDIT_ERROR = 1704;

  public static final int EC_DOCUMENT_JOIN_LOCKED_SESSION_ERROR = 1705;

  public static final int EC_DOCUMENT_LOCKED_PUBLISH_ERROR = 1706;

  public static final int EC_DOCUMENT_ASYNC_RESPONSE_TIME_OUT = 1707;
  
  public static final int EC_DOCUMENT_ASYNC_MAX_REQUEST_ERROR = 1708;
  
  public static final int EC_DOCUMENT_SERVICE_MAINTAINENCE = 1709;
  
  public static final int EC_DOCUMENT_SERVICE_FAILOVER = 1710;

  /**
   * Constructs a new instance with the specified error code.
   * 
   * @param errCode
   *          four-digit integer error code
   */
  public DocumentServiceException(int errCode)
  {
    super(errCode, new JSONObject(), null);
  }

  /**
   * Constructs a new instance with the specified error code and cause.
   * 
   * @param errCode
   *          four-digit integer error code
   * @param cause
   *          the cause
   */
  public DocumentServiceException(int errCode, Throwable cause)
  {
    super(errCode, new JSONObject(), cause);
  }

  /**
   * Constructs a new instance with the specified cause.
   * 
   * @param cause
   *          the cause
   */
  public DocumentServiceException(Throwable cause)
  {
    super(EC_DOCUMENT_SERVICE_ERROR, new JSONObject(), cause);
  }

}
