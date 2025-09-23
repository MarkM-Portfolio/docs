/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2013. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.spi.notification;

import com.ibm.json.java.JSONObject;

public interface IEmailNoticeEntry
{
  public JSONObject getEntry();
  public String getPersonUrl();
}
