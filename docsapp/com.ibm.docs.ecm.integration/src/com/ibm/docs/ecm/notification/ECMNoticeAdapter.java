/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2014. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */
package com.ibm.docs.ecm.notification;

import java.util.ArrayList;

import com.ibm.concord.spi.exception.AccessException;
import com.ibm.concord.spi.notification.IEmailNoticeAdapter;
import com.ibm.concord.spi.notification.IEmailNoticeEntry;
import com.ibm.docs.directory.beans.UserBean;
import com.ibm.json.java.JSONObject;

public class ECMNoticeAdapter implements IEmailNoticeAdapter
{

  public void init(JSONObject config)
  {

  }

  public boolean entriesNotified(UserBean user, ArrayList<IEmailNoticeEntry> entryList) throws AccessException
  {
    return true;
  }

}
