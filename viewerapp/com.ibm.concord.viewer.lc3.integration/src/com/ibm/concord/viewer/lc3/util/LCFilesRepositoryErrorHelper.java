/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.viewer.lc3.util;

import javax.servlet.http.HttpServletResponse;

import com.ibm.concord.viewer.spi.exception.RepositoryAccessException;

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
   * @param errorCode
   *          the error code
   * @return the concord server's error code.
   */
  public static int mapErrorCode(int statusCode, String errorCode)
  {
    switch (statusCode)
      {
        case HttpServletResponse.SC_FORBIDDEN :
          if ("UnscannedFileDownloadWarning".equals(errorCode))
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
          return RepositoryAccessException.EC_REPO_NOTFOUNDDOC;
      }
    return statusCode;
  }
}
