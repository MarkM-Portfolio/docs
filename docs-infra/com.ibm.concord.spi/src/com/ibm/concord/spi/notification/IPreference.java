/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2014. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.spi.notification;

import java.util.HashMap;

import com.ibm.concord.spi.exception.ConcordException;
import com.ibm.docs.directory.beans.UserBean;
import com.ibm.json.java.JSONObject;

public interface IPreference
{
  public static final String bidi_isBidi = "isBidi";

  public static final String bidi_textDir = "textDirection";
  
  public void init(JSONObject config);
  
  public HashMap<String, String> getBidiPreferences(UserBean requester) throws ConcordException;
}
