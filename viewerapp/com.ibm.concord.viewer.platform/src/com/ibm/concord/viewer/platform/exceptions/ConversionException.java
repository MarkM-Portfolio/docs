/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.viewer.platform.exceptions;

import com.ibm.json.java.JSONObject;

/*
 * This class is used to define conversion related exception.
 * The numbers(12xx) are used to indicate the conversion related exception codes.
 * 
 */
public class ConversionException extends Exception
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
   * Exception code(1214) indicates that conversion error for unexpecified reason.
   * 
   */
  public static final int EC_CONV_UNEXPECIFIED_ERROR = 1214;

  public static final int EC_CONV_INVALID_PASSWORD = 1205;

  public static final int EC_CON_ENCRPTED_ERROR = 1206;
  
  public static final int EC_CONV_SYSTEM_BUSY = 1207;

  public static final int EC_CONV_IO_EXCEPTION = 1213;

  public static final int EC_CONV_EXT_CONTENT_MISMATCH = 1209;

  public static final int EC_CONV_DOWNSIZE_ERROR = 1210;

  public static final int EC_CONV_EMPTY_FILE_ERROR = 1211;
  
  public static final int EC_CONV_CORRUPTED_FILE_ERROR = 1212;
  
  public static final int EC_CONV_SINGLE_PAGE_OVERTIME = 1260;

  private final int code;
  
  private JSONObject data;
  
  public ConversionException(final String message, final int code)
  {
    super(message);
    this.code = code;
    this.data = new JSONObject();
  }
  
  public ConversionException(final String message)
  {
    super(message);
    this.code = EC_CONV_SERVICE_UNAVAILABLE;
    this.data = new JSONObject();
  }
  
  public int getErrCode()
  {
    return code;
  }
  
  public void setData(String key, String val)
  {
    this.data.put(key, val);
  }
  
  public JSONObject getData()
  {
    return data;
  }
}
