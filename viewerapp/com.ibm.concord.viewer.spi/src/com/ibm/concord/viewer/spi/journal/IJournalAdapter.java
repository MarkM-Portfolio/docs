/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.viewer.spi.journal;

import com.ibm.json.java.JSONObject;

public interface IJournalAdapter
{
  public void init(JSONObject config);
  public void publish(String msg);
}
