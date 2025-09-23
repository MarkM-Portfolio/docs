/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2014. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.spi.exception;

import java.util.logging.Logger;

import com.ibm.docs.common.util.LogEntry;
import com.ibm.docs.common.util.URLConfig;
import com.ibm.json.java.JSONObject;

/**
 * The base exception class.
 * 
 */
public class ConcordException extends Exception
{
  private static final long serialVersionUID = -3335544866621222539L;
  
  public static final Logger LOGGER = Logger.getLogger(ConcordException.class.getName());

  /** Exception code(9999) indicates errors which can not be categorized into any known error code. */
  public static final int EC_CONCORD_DEFAULT = 9999;

  public static final String ERROR_CODE = "ERROR_CODE";
  
  public static final String ERROR_MSG = "ERROR_MSG";
  
  /** Key for the detail error message of the default error code. */
  private static final String DEFAULT_ERR_DETAIL = "detail_msg";

  private final int errCode;

  private final JSONObject data;

  /**
   * Constructs a new instance with error code, attached data and cause.
   * 
   * @param errCode
   *          a four-digit integer indicating what error happened, with the higher two digits <br>
   *          representing the Exception itself and the lower two digits for the detail error.
   * @param data
   *          a JSONObject in which you can put any information needed for troubleshooting
   * @param cause
   *          the cause which is saved for later retrieval. A <tt>null</tt> value is permitted and <br>
   *          indicates that the cause is nonexistent or unknown.
   */
  public ConcordException(int errCode, JSONObject data, Throwable cause)
  {
    super(cause);
    this.errCode = errCode;
    this.data = data;
    LOGGER.info(new LogEntry(URLConfig.getRequestID(), URLConfig.getResponseID()).toString());
  }

  @Override
  public String getMessage()
  {
    StringBuilder sb = new StringBuilder();
    sb.append("Exception occurred with error code: ");
    sb.append("CLFAD" + errCode);
    sb.append(", message: ");
    sb.append(ErrorMapping.errMsg(errCode));
    sb.append(", and additional data: ");
    sb.append(data);
    return sb.toString();
  }

  /**
   * Get the error code.
   * 
   * @return a four-digit integer indicating what error happened
   */
  public int getErrCode()
  {
    return errCode;
  }

  /**
   * Get the error message.
   * 
   * @return message that describe what the error code meaning
   */
  public String getErrMsg()
  {
    return ErrorMapping.errMsg(errCode);
  }

  /**
   * Get the nested JSONObject.
   * 
   * @return a JSONObject in which you can put any information needed for troubleshooting
   */
  public JSONObject getData()
  {
    return data;
  }
  
  
  /**
   * 
   * @return exceptions as json include the error code
   */
  public JSONObject toJSON()
  {
    JSONObject json = new JSONObject();
    json.put(ERROR_CODE, errCode);
    json.put(ERROR_MSG, getErrMsg());
    return json;
  }

  /**
   * Put error detail for the default error code into nested JSONObject.
   * 
   * @param detail
   *          default error detail
   */
  public void setDefaultErrDetail(String detail)
  {
    data.put(DEFAULT_ERR_DETAIL, detail);
  }

  /**
   * Put <tt>Object[]</tt> into nested JSONObject as a string.
   * 
   * @param key
   *          key for the data
   * @param objects
   *          object array, if <tt>null<tt> nothing will be put
   */
  public void setArrayData(final String key, final Object[] objects)
  {
    if (objects == null)
    {
      return;
    }

    StringBuilder sb = new StringBuilder();
    int count = objects.length;
    for (int i = 0; i < count; i++)
    {
      sb.append(objects[i].toString());
      if (i < count - 1)
      {
        sb.append(", ");
      }
    }
    data.put(key, sb.toString());
  }

}
