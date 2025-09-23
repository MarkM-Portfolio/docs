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

public class RevisionStorageException extends Exception
{
  /**
   * 
   */
  private static final long serialVersionUID = -2884549128827552339L;
  private String message;
  
  /**
   * Exception code(2000) indicates failed to do IO operation
   *  
   */
  public static final int ERROR_IO_EXCEPTION = 2000;


  public RevisionStorageException(Exception e)
  {
    super(e);
    message = e.getMessage();
  }
  
  public RevisionStorageException(String message)
  {
    this.message = message;
  }
  
  
  public String getMessage()
  {
    return message;
  }

  public int getErrorCode()
  {
    return ERROR_IO_EXCEPTION;
  }
}
