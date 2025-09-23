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

import java.util.ArrayList;

import com.ibm.concord.spi.exception.AccessException;
import com.ibm.docs.directory.beans.UserBean;
import com.ibm.json.java.JSONObject;

public interface IEmailNoticeAdapter
{

  public void init(JSONObject config);

  public boolean entriesNotified(UserBean user, ArrayList<IEmailNoticeEntry> entryList) throws AccessException;
}
