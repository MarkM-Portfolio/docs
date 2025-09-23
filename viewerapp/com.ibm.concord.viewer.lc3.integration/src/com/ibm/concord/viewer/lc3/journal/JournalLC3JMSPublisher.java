/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.viewer.lc3.journal;

import com.ibm.concord.viewer.platform.JMSConnection;
import com.ibm.concord.viewer.spi.journal.IJournalAdapter;
import com.ibm.json.java.JSONObject;

public class JournalLC3JMSPublisher implements IJournalAdapter
{

  public void init(JSONObject config)
  {
  }

  public void publish(String msg)
  {
    JMSConnection.writeMessage(msg);
  }

}
