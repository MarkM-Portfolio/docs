/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.platform.conversion;

import javax.servlet.http.HttpServletResponse;

import com.ibm.concord.platform.exceptions.ConversionException;

/**
 * This class is used to map conversion service's HTTP status codes to concord server's error codes.
 *
 */
public class ConversionErrorCodeUtil
{
  // When the converted document has invalid format, conversion server return 520 as the status code.
  public static final int SC_INVALID_FORMAT = 520;
  
  public static final int SC_INVALID_PASSWORD = 491;
  
  public static final int SC_UNSUPPORTED_ENCRYPTION = 492;
  
  public static final int SC_SERVER_BUSY = 493;
  
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
      case HttpServletResponse.SC_BAD_REQUEST : return ConversionException.EC_CONV_SERVICE_UNAVAILABLE;
      case HttpServletResponse.SC_NOT_ACCEPTABLE : return ConversionException.EC_CONV_UNSUPPORTED_FORMAT;
      case HttpServletResponse.SC_REQUEST_ENTITY_TOO_LARGE : return ConversionException.EC_CONV_DOC_TOOLARGE;
      case HttpServletResponse.SC_UNSUPPORTED_MEDIA_TYPE : return ConversionException.EC_CONV_EXT_CONTENT_MISMATCH;
      case HttpServletResponse.SC_LENGTH_REQUIRED : return ConversionException.EC_CONV_SERVICE_UNAVAILABLE;
      case ConversionErrorCodeUtil.SC_INVALID_FORMAT : return ConversionException.EC_CONV_INVALID_FORMAT;
      case ConversionErrorCodeUtil.SC_INVALID_PASSWORD : return ConversionException.EC_CONV_INVALID_PASSWORD;
      case ConversionErrorCodeUtil.SC_UNSUPPORTED_ENCRYPTION : return ConversionException.EC_CONV_UNSUPPORTED_ENCRYPTION;
      case SC_SERVER_BUSY: return ConversionException.EC_CON_SERVER_BUSY;
    }
    return ConversionException.EC_CONV_SERVICE_UNAVAILABLE;
  }
}
