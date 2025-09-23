/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.viewer.platform.conversion;

import javax.servlet.http.HttpServletResponse;

import com.ibm.concord.viewer.platform.exceptions.ConversionException;

/**
 * This class is used to map conversion service's HTTP status codes to concord server's error codes.
 *
 */
public class ConversionErrorCodeUtil {
  public static final int SC_INVALID_FORMAT = 520;
  
  public static final int SC_SYM_CONNECTION_UNAVAILABLE = 496;

  public static final int ERROR_INVALID_FILE_PASSWORD = 491;

  public static final int ERROR_UNSUPPORT_FILE_PASSWORD = 492;

  public static final int SC_CONV_SYSTEM_BUSY = 493;

  public static final int SC_CONV_CONVERT_TIMEOUT = 521;

  public static final int SC_CONV_IO_EXCEPTION = 522;

  public static final int SC_CONV_SINGLE_PAGE_OVERTIME = 523;

  public static final int SC_CONV_DOWNSIZE_ERROR = 524;

  public static final int SC_CONV_EMPTY_FILE_ERROR = 528;

  public static final int SC_CONV_CORRUPTED_FILE_ERROR = 529;

    /**
     * Map conversion service's HTTP status codes to concord server's error codes.
     *
     * @param code specifies the conversion service's HTTP status code.
     * @return the concord server's error code.
     */
  public static int mapErrorCode(int code)
  {
    switch (code)
      {
        case HttpServletResponse.SC_BAD_REQUEST :
          return ConversionException.EC_CONV_SERVICE_UNAVAILABLE;
        case HttpServletResponse.SC_NOT_ACCEPTABLE :
          return ConversionException.EC_CONV_UNSUPPORTED_FORMAT;
        case HttpServletResponse.SC_REQUEST_ENTITY_TOO_LARGE :
          return ConversionException.EC_CONV_DOC_TOOLARGE;
        case HttpServletResponse.SC_UNSUPPORTED_MEDIA_TYPE :
          return ConversionException.EC_CONV_EXT_CONTENT_MISMATCH;
        case HttpServletResponse.SC_LENGTH_REQUIRED :
          return ConversionException.EC_CONV_SERVICE_UNAVAILABLE;
        case ConversionErrorCodeUtil.SC_SYM_CONNECTION_UNAVAILABLE:
          return ConversionException.EC_CONV_SERVICE_UNAVAILABLE;
        case HttpServletResponse.SC_INTERNAL_SERVER_ERROR :
          return ConversionException.EC_CONV_SERVICE_UNAVAILABLE;
        case ConversionErrorCodeUtil.ERROR_UNSUPPORT_FILE_PASSWORD :
          return ConversionException.EC_CON_ENCRPTED_ERROR;
        case ConversionErrorCodeUtil.ERROR_INVALID_FILE_PASSWORD :
          return ConversionException.EC_CONV_INVALID_PASSWORD;
        case ConversionErrorCodeUtil.SC_INVALID_FORMAT :
          return ConversionException.EC_CONV_INVALID_FORMAT;
        case ConversionErrorCodeUtil.SC_CONV_CONVERT_TIMEOUT :
          return ConversionException.EC_CONV_CONVERT_TIMEOUT;
        case ConversionErrorCodeUtil.SC_CONV_SYSTEM_BUSY :
          return ConversionException.EC_CONV_SYSTEM_BUSY;
        case ConversionErrorCodeUtil.SC_CONV_IO_EXCEPTION :
          return ConversionException.EC_CONV_IO_EXCEPTION;
        case ConversionErrorCodeUtil.SC_CONV_SINGLE_PAGE_OVERTIME :
          return ConversionException.EC_CONV_SINGLE_PAGE_OVERTIME;
        case ConversionErrorCodeUtil.SC_CONV_DOWNSIZE_ERROR :
          return ConversionException.EC_CONV_DOWNSIZE_ERROR;
        case ConversionErrorCodeUtil.SC_CONV_EMPTY_FILE_ERROR :
          return ConversionException.EC_CONV_EMPTY_FILE_ERROR;
        case ConversionErrorCodeUtil.SC_CONV_CORRUPTED_FILE_ERROR :
          return ConversionException.EC_CONV_CORRUPTED_FILE_ERROR;
      }
    return ConversionException.EC_CONV_UNEXPECIFIED_ERROR;
  }
    
}
