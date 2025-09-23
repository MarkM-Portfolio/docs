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

import com.ibm.json.java.JSONObject;

public class OutOfCapacityException extends Exception
{
  private static final long serialVersionUID = -6252999699349999L;

  public static final int EC_OUTOF_CAPACITY = 1500;
  public static final int EC_OUTOF_CAPACITY_File_Size_Mobile = 1501;
  public static final int EC_OUTOF_CAPACITY_Page_Count_Mobile = 1502;
  public static final int EC_OUTOF_CAPACITY_Image_Count_Mobile = 1503;
  public static final int EC_OUTOF_CAPACITY_Sheet_View_ROWCOL_Mobile = 1511;

  
  
  private int nErrorCode = EC_OUTOF_CAPACITY;
  
  private JSONObject data = null;
  public OutOfCapacityException(final String message)
  {
    super(message);
  }
  
  public OutOfCapacityException(final int errorCode)
  {
    super();
    nErrorCode = errorCode;
  }
  
  
  
  public OutOfCapacityException(final int errorCode, final String message)
  {
    super(message);
    nErrorCode = errorCode;
  }
  
  /**
   * Get the error code of this exception.
   * 
   * @return
   */
  public int getErrorCode()
  {
    return nErrorCode;
  }
  
  public void setData(JSONObject data)
  {
	  this.data = data;
  }
  
  public void setData(String data)
  {
     this.data = new JSONObject();
     this.data.put("error_message", data);
  }
  
  public void setData(Object data)
  {
    if (data != null)
      this.setData(data.toString());
  }
  
  public JSONObject getData()
  {
	  return data;
  }
}
