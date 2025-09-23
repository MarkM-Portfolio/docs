/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.viewer.spi.exception;

public class DocumentServiceException extends Exception
{
  private static final long serialVersionUID = 1L;
  
  public static final int EC_DOCUMENT_SERVICE_ERROR = 1700;
  public static final int EC_DOCUMENT_EXCEED_MAX_SESSION_ERROR = 1701;
  
  private int errorCode = EC_DOCUMENT_SERVICE_ERROR;
  
  public DocumentServiceException(Throwable e, int errorCode)
  {
    super(e);
    this.errorCode = errorCode;
  }
  
  public DocumentServiceException(int errorCode)
  {
    this.errorCode = errorCode;
  }
  
  public int getErrorCode() {
	return errorCode;  
  }
}
