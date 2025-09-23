/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.docs.repository;

import com.ibm.concord.spi.exception.ConcordException;
import com.ibm.json.java.JSONObject;

/**
 * The numbers(10xx) are used to indicate the repository access related error codes.
 * 
 */
public class RepositoryAccessException extends ConcordException
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
   * Exception code(1006) indicates that the repository is unable to delete the document.
   */
  public static final int EC_REPO_CANNOT_DELETE = 1006;

  /**
   * Exception code(1007) indicates that have no permission to edit the locked file in repository.
   * 
   */
  public static final int EC_REPO_CANNOT_EDIT_LOCKED_DOC = 1007;

  /**
   * Exception code(1008) indicates that the operation is not supported.
   * 
   */
  public static final int EC_REPO_UNSUPPORTED_OPERATION = 1008;

  /**
   * Exception code(1009) indicates that the operation intent is restricted.
   * 
   */
  public static final int EC_REPO_OPERATION_INTENT_RESTRICTED = 1009;

  /**
   * Exception code(1010) indicates that the published file exceeds the maximum size set by the repository.
   * 
   */
  public static final int EC_REPO_FILE_SIZE_EXCEED = 1010;

  /**
   * Exception code(1011) indicates that duplicated document name is found when creating a new file.
   */
  public static final int EC_REPO_DUPLICATED_TITLE = 1011;

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

  private static final String REPO_HTTP_STATUS = "repo_http_status";

  private static final String REPO_ERR_CODE = "repo_err_code";

  private static final String REPO_ERR_MSG = "repo_err_msg";

  /**
   * Constructs a new instance with the specified detail message.
   * 
   * @param detail
   *          error detail for the default error code
   */
  public RepositoryAccessException(String detail)
  {
    super(EC_REPO_DEFAULT, new JSONObject(), null);
    setDefaultErrDetail(detail);
  }

  /**
   * Constructs a new instance with the specified error code.
   * 
   * @param errCode
   *          four-digit integer error code
   */
  public RepositoryAccessException(int errCode)
  {
    super(errCode, new JSONObject(), null);
  }

  /**
   * Constructs a new instance with the specified server error code and repository returned error code.
   * 
   * @param errCode
   *          four-digit integer error code
   * @param repoErrCode
   *          repository returned error code in the response body, such as "ItemExists"
   */
  public RepositoryAccessException(int errCode, String repoErrCode)
  {
    super(errCode, new JSONObject(), null);
    getData().put(REPO_ERR_CODE, repoErrCode);
  }

  /**
   * Constructs a new instance with default server error code(1000), repository returned error code <br>
   * and detail error message.
   * 
   * @param repoErrCode
   *          repository returned error code in the response body, such as "ItemExists"
   * @param detail
   *          error detail message
   */
  public RepositoryAccessException(String repoErrCode, String detail)
  {
    super(EC_REPO_DEFAULT, new JSONObject(), null);
    getData().put(REPO_ERR_CODE, repoErrCode);
    setDefaultErrDetail(detail);
  }

  /**
   * Constructs a new instance with the specified server error code, repository returned error code and message.
   * 
   * @param errCode
   *          four-digit integer error code
   * @param repoErrCode
   *          repository returned error code in the response body, such as "ItemExists"
   * @param repoErrMsg
   *          repository returned error message in the response body
   */
  public RepositoryAccessException(int errCode, String repoErrCode, String repoErrMsg)
  {
    super(errCode, new JSONObject(), null);
    getData().put(REPO_ERR_CODE, repoErrCode);
    getData().put(REPO_ERR_MSG, repoErrMsg);
  }

  /**
   * Constructs a new instance with default server error code(1000) and the cause.
   * 
   * @param cause
   *          the cause
   */
  public RepositoryAccessException(Throwable cause)
  {
    super(EC_REPO_DEFAULT, new JSONObject(), cause);
  }

  /**
   * Constructs a new instance with the specified server error code and cause.
   * 
   * @param errCode
   *          four-digit integer error code
   * @param cause
   *          the cause
   */
  public RepositoryAccessException(int errCode, Throwable cause)
  {
    super(errCode, new JSONObject(), cause);
  }

  /**
   * Get the repository returned error code in the response body
   * 
   * @return repository returned error code in the response body
   */
  public String getRepoErrCode()
  {
    return (String) getData().get(REPO_ERR_CODE);
  }

  /**
   * Get the error message in the repository returned response body
   * 
   * @return repository returned error message in the response body
   */
  public String getRepoErrMsg()
  {
    return (String) getData().get(REPO_ERR_MSG);
  }

  /**
   * Put the HTTP status code into the attached JSONObject data.
   * 
   * @param statusCode
   *          HTTP status code, such as 401
   */
  public void setStatusCode(int statusCode)
  {
    getData().put(REPO_HTTP_STATUS, statusCode);
  }

  /**
   * Get the returned HTTP status code when exception occurred. <br>
   * -1 is returned if there is no HTTP status code appeared.
   * 
   * @return HTTP status code
   */
  public int getStatusCode()
  {
    Object value = getData().get(REPO_HTTP_STATUS);
    return value == null ? -1 : (Integer) value;
  }
}
