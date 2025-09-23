/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.viewer.localtest.integration.journal;

import java.util.logging.Logger;

import com.ibm.concord.viewer.spi.journal.IJournalAdapter;
import com.ibm.json.java.JSONObject;

public class JournalLocalTestJMSPublisher implements IJournalAdapter
{
  private static final Logger LOG = Logger.getLogger(JournalLocalTestJMSPublisher.class.getName());

  public void init(JSONObject config)
  {
  }

  public void publish(String msg)
  {
    LOG.info(msg);
  }

}