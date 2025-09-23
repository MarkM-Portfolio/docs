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

import com.ibm.json.java.JSONObject;

public class PreferenceException extends ConcordException
{
  private static final long serialVersionUID = -3120900793662644059L;
  
  public static final int EC_BIDI_PREFERENCE_ERROR = 1800;
  
  private static final String PREFERENCE_ERR_CODE = "preference_err_code";
  
  private static final String PREFERENCE_ERR_MSG = "PREFERENCE_err_msg";
  
  public PreferenceException(int errCode, JSONObject data, Throwable cause)
  {
    super(errCode, data, cause);
  }
  
  public PreferenceException(int errCode, String code, String message)
  {
    super(errCode, new JSONObject(), null);
    getData().put(PREFERENCE_ERR_CODE, code);
    getData().put(PREFERENCE_ERR_MSG, message);
  }
  
  public PreferenceException(Throwable cause)
  {
    super(EC_BIDI_PREFERENCE_ERROR, new JSONObject(), cause);
  }

}
