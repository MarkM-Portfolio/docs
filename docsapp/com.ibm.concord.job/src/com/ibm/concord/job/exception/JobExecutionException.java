/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.job.exception;

import com.ibm.json.java.JSONObject;

public class JobExecutionException extends Throwable
{
  private static final long serialVersionUID = 3954904748767434162L;

  public static final String ERROR_CODE = "ERROR_CODE";
  public static final String ERROR_MSG = "ERROR_MSG";
  public static final String USER_ACTION = "USER_ACTION";
  public static final String STATUS_CODE = "STATUS_CODE";
  public static final String DATA = "data";

  private String errorCode;
  private String errorMsg;
  private String userAction;
  private JSONObject data;
  

  /**
   * @deprecated
   * This is preserved for compatibility with existing code, for long term, we should try to avoid API caller to directly facing HTTP
   * status, since it is not rich enough to represent application level error code. Meanwhile, not all JobExecutionException will have http
   * error status, such as exception from Draft and Conversion components.
   */
  private int errorStatus;

  private Throwable nested;

  private JobExecutionException(String errorCode, String errorMsg, String userAction, Throwable nested)
  {
    super(nested);
    this.errorCode = errorCode;
    this.errorMsg = errorMsg;
    this.userAction = userAction;
    this.nested = nested;
  }

  public JobExecutionException(String errorCode, String errorMsg, String userAction, int errorStatus, Throwable nested)
  {
    this(errorCode, errorMsg, userAction, nested);

    this.errorStatus = errorStatus;
  }

  /**
   * Constructs a new instance with the specified error code and cause.
   * 
   * @param nErrorCode
   *          four-digit integer error code
   * @param nested
   *          the cause
   */
  public JobExecutionException(int nErrorCode, Throwable nested)
  {
    this(String.valueOf(nErrorCode), nested.getMessage(), null, nested);
  }

  public Throwable getNested()
  {
    return nested;
  }

  public String getErrorCode()
  {
    if (errorCode == null)
    {
      errorCode = "";
    }

    return errorCode;
  }

  public String getErrorMsg()
  {
    if (errorMsg == null)
    {
      errorMsg = "";
    }

    return errorMsg;
  }

  public String getUserAction()
  {
    if (userAction == null)
    {
      userAction = "";
    }

    return userAction;
  }

  public int getErrorStatus()
  {
    return errorStatus;
  }

  public JSONObject toJSON()
  {
    JSONObject json = new JSONObject();
    json.put(ERROR_CODE, errorCode);
    json.put(ERROR_MSG, errorMsg);
    json.put(USER_ACTION, userAction);
    json.put(STATUS_CODE, errorStatus);
    json.put("data", data);
    return json;
  }

  public void setData(JSONObject data)
  {
    this.data = data;
  }

  public JSONObject getData()
  {
    return data;
  }
}
