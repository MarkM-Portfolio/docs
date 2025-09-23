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

/**
 * The numbers(10xx) are used to indicate the repository access related error codes.
 * 
 */
public class RepositoryAccessException extends Exception
{
  private static final long serialVersionUID = 3917174767763163361L;

  /**
   * Exception code(1099) indicates errors which can not be categorized into any known error code.
   * 
   */
  public static final int EC_REPO_DEFAULT = 1099;

  /**
   * Exception code(1000) indicates that having no permission this file in repository.
   * 
   */
  public static final int EC_REPO_NOPERMISSION = 1000;

  /**
   * Exception code(1001) indicates that having no permission to view the file in repository.
   * 
   */
  public static final int EC_REPO_NOVIEWPERMISSION = 1001;

  /**
   * Exception code(1002) indicates that have no permission to edit the file in repository.
   * 
   */
  public static final int EC_REPO_NOEDITPERMISSION = 1002;

  /**
   * Exception code(1003) indicates that the accessed document is deleted or moved to trash.
   * 
   */
  public static final int EC_REPO_NOTFOUNDDOC = 1003;

  /**
   * Exception code(1004) indicates cannot connect to repository server(SSL issue, etc.).
   * 
   */
  public static final int EC_REPO_CANNOT_FILES = 1004;

  /**
   * Exception code(1005) indicates that the repository is out of space to store new data.
   */
  public static final int EC_REPO_OUT_OF_SPACE = 1005;

  /**
   * Exception code(1007) indicates that have no permission to edit the locked file in repository.
   * 
   */
  public static final int EC_REPO_CANNOT_EDIT_LOCKED_DOC = 1007;

  /**
   * Exception code(1011) the file size is 0
   * 
   */
  public static final int EC_REPO_UNPUBLISHED_FILE = 1011;

  /**
   * Exception code(1012) Server internal error. Runtime exception.
   */
  public static final int EC_REPO_SERVER_INTERNAL_ERROR = 1012;

  /**
   * Exception code(1013) indicates that downloading unscanned file from the repository.
   * 
   */
  public static final int EC_REPO_UNSCANNED_FILE = 1013;
  /**
   * Exception code(1014) indicates that this is a malicious file.
   * 
   */
  public static final int EC_REPO_MALICIOUS_FILE = 1014;  

  private String errorMsg;

  private String errorCode;

  private int statusCode = -1;

  private Throwable nested;

  public RepositoryAccessException(String errorMsg)
  {
    this.errorMsg = errorMsg;
  }

  public RepositoryAccessException(int statusCode)
  {
    this.statusCode = statusCode;
  }

  public RepositoryAccessException(String errorCode, String errorMsg)
  {
    this.errorCode = errorCode;
    this.errorMsg = errorMsg;
  }

  public RepositoryAccessException(int statusCode, String errorCode, String errorMsg)
  {
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.errorMsg = errorMsg;
  }

  public RepositoryAccessException(Throwable nested)
  {
    this.nested = nested;
  }

  public RepositoryAccessException(int statusCode, Throwable nested)
  {
    this.statusCode = statusCode;
    this.nested = nested;
  }

  public String getErrorMsg()
  {
    return errorMsg;
  }

  public String getErrorCode()
  {
    return errorCode;
  }

  public int getStatusCode()
  {
    return statusCode;
  }

  public Throwable getNested()
  {
    return nested;
  }
}
