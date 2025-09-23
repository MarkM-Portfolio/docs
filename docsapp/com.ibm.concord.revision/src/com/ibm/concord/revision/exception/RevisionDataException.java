/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2013. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.revision.exception;

public class RevisionDataException extends Exception
{
  /**
   * 
   */
  private static final long serialVersionUID = -2884549128827552339L;
  private String message;
  private int statusCode = 0;

  /**
   * Exception code(2001) indicates the revision meta is not found
   *  
   */
  public static final int ERROR_REVISION_NOT_FOUND = 2001;
  
  /**
   * Exception code(2002) indicates the revision is failed to create
   */
  public static final int ERROR_REVISION_FAILED_CREATE = 2002;
  
  /**
   * Exception code(2001) indicates the revision data is not found
   */
  public static final int ERROR_REVISION_DATA_NOT_FOUND = 2003;
  
  /**
   * Exception code(2001) indicates the revision data is not found
   */
  public static final int ERROR_REVISION_FAILED_RESTORE = 2004;  
  
  public RevisionDataException(Exception e)
  {
    super(e);
    message = e.getMessage();
  }
  
  public RevisionDataException(int code)
  {
    statusCode = code;
  }
  
  public RevisionDataException(String message)
  {
    this.message = message;
  }
  
  public RevisionDataException(int code, String message)
  {
    statusCode = code;
    this.message = message;
  }
  
  public String getMessage()
  {
    return message;
  }

  public int getErrorCode()
  {
    return statusCode;
  }
}
