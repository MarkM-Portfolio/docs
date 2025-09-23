/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.spi.webmessage;

import com.ibm.json.java.JSONObject;

/**
 * @author gaowwei@cn.ibm.com
 *
 */
public interface IWebMessageAdapter
{
  public void init(JSONObject config);
  /**
   * Called when a message need to be published to a channel
   * @param channel
   *            identifier of a channel
   * @param msgText
   *            message body need to be published
   * @return
   *            TRUE if a message is successfully published
   */
  public boolean publishMessage(String channel, String msgText);
}
