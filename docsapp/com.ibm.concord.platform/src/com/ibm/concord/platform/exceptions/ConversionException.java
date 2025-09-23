/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.platform.exceptions;

import com.ibm.concord.spi.exception.ConcordException;
import com.ibm.json.java.JSONObject;

/*
 * This class is used to define conversion related exception.
 * The numbers(12xx) are used to indicate the conversion related exception codes.
 * 
 */
public class ConversionException extends ConcordException
{
  private static final long serialVersionUID = 8865920575147015451L;

  /**
   * Exception code(1200) indicates that conversion service is unavailable.
   * 
   */
  public static final int EC_CONV_SERVICE_UNAVAILABLE = 1200;

  /**
   * Exception code(1201) indicates that the accessed document is too large.
   * 
   */
  public static final int EC_CONV_DOC_TOOLARGE = 1201;

  /**
   * Exception code(1202) indicates that convert document time out.
   * 
   */
  public static final int EC_CONV_CONVERT_TIMEOUT = 1202;

  /**
   * Exception code(1203) indicates that the format of document is invalid.
   * 
   */
  public static final int EC_CONV_INVALID_FORMAT = 1203;

  /**
   * Exception code(1204) indicates that the format of document is not supported.
   * 
   */
  public static final int EC_CONV_UNSUPPORTED_FORMAT = 1204;

  /**
   * Exception code(1205) indicates wrong password is passed to conversion
   * 
   */
  public static final int EC_CONV_INVALID_PASSWORD = 1205;

  /**
   * Exception code(1206) indicates the encryption is not supported
   * 
   */
  public static final int EC_CONV_UNSUPPORTED_ENCRYPTION = 1206;

  /**
   * Exception code(1207) indicates the document should not be downloaded.
   * 
   */
  public static final int EC_CONV_NO_NEED_TO_CONVERT = 1207;

  /**
   * Exception code(1208) indicates the server is busy.
   * 
   */
  public static final int EC_CON_SERVER_BUSY = 1208;

  /**
   * Exception code(1209) indicates the file extension mismatches with the content of the document.
   * 
   */
  public static final int EC_CONV_EXT_CONTENT_MISMATCH = 1209;
  
  /**
   * Exception code(1211) the file is empty.
   * 
   */
  public static final int EC_CONV_EMPTY_FILE_ERROR = 1211;

  /** Key for the native error code returned from conversion. */
  private static final String CONV_NATIVE_ERR_CODE = "native_err_code";

  /**
   * Constructs a new instance with the specified error code.
   * 
   * @param errCode
   *          four-digit integer error code
   */
  public ConversionException(final int errCode)
  {
    super(errCode, new JSONObject(), null);
  }

  /**
   * Constructs a new instance with the specified error code and the cause.
   * 
   * @param errCode
   *          four-digit integer error code
   * @param cause
   *          the cause
   */
  public ConversionException(final int errCode, Throwable cause)
  {
    super(errCode, new JSONObject(), null);
  }

  /**
   * Constructs a new instance with the specified detail message.
   * 
   * @param detail
   *          error detail for the default error code
   */
  public ConversionException(final String detail)
  {
    super(EC_CONV_SERVICE_UNAVAILABLE, new JSONObject(), null);
    setDefaultErrDetail(detail);
  }

  /**
   * Constructs a new instance with the specified detail message and the cause.
   * 
   * @param detail
   *          detail error detail for the default error code
   * @param cause
   *          the cause
   */
  public ConversionException(String detail, Throwable cause)
  {
    super(EC_CONV_SERVICE_UNAVAILABLE, new JSONObject(), cause);
    setDefaultErrDetail(detail);
  }

  /**
   * Put the native error code into the attached JSONObject data.
   * 
   * @param statusCode
   *          native error code returned from conversion
   */
  public void setNativeErrorCode(int statusCode)
  {
    getData().put(CONV_NATIVE_ERR_CODE, statusCode);
  }

  /**
   * Get the native error code
   * 
   * @return native error code returned from conversion
   */
  public int getNativeErrorCode()
  {
    return (Integer) getData().get(CONV_NATIVE_ERR_CODE);
  }
}
