/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.docs.repository.files;

import javax.servlet.http.HttpServletResponse;

import com.ibm.docs.repository.RepositoryAccessException;

/**
 * This class is used to map repository server's HTTP status codes to concord server's error codes.
 * 
 */
public class LCFilesRepositoryErrorHelper
{
  /**
   * Map repository server's HTTP status codes to concord server's error codes.
   * 
   * @param statusCode
   *          specifies the repository server's HTTP status code.
   * @return the concord server's error code.
   */
  public static int mapErrorCode(int statusCode, String errorCode)
  {
    switch (statusCode)
      {
        case HttpServletResponse.SC_FORBIDDEN :
          if ("QuotaViolation".equals(errorCode))
          {
            return RepositoryAccessException.EC_REPO_OUT_OF_SPACE;
          }
          else if ("UnscannedFileDownloadWarning".equals(errorCode))
          {
            return RepositoryAccessException.EC_REPO_UNSCANNED_FILE;
          }
          else if ("MaliciousFileDownloadWarning".equals(errorCode))
          {
            return RepositoryAccessException.EC_REPO_MALICIOUS_FILE;
          }
          else
          {
            return RepositoryAccessException.EC_REPO_NOPERMISSION;
          }
        case HttpServletResponse.SC_NOT_FOUND :
          if ("UnsupportedOperation".equals(errorCode))
          {
            return RepositoryAccessException.EC_REPO_UNSUPPORTED_OPERATION;
          }
          else
          {
            return RepositoryAccessException.EC_REPO_NOTFOUNDDOC;
          }
        case HttpServletResponse.SC_BAD_REQUEST :
          if ("SharingIntentRestriction".equals(errorCode))
          {
            return RepositoryAccessException.EC_REPO_OPERATION_INTENT_RESTRICTED;
          }
          else if ("ContentMaxSizeExceeded".equals(errorCode))
          {
            return RepositoryAccessException.EC_REPO_FILE_SIZE_EXCEED;
          }
        case HttpServletResponse.SC_CONFLICT :
          if ("ItemExists".equals(errorCode))
          {
            return -1;
          }
      }
    return RepositoryAccessException.EC_REPO_DEFAULT;
  }
}
