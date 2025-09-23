/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.localtest.integration.journal;

import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.concord.spi.journal.IJournalAdapter;
import com.ibm.json.java.JSONObject;

public class JournalLocalTestJMSPublisher implements IJournalAdapter
{
  private static final Logger LOG = Logger.getLogger(JournalLocalTestJMSPublisher.class.getName());

  public void init(JSONObject config)
  {
  }

  public void publish(Object[] msg)
  {
    LOG.log(Level.INFO, "Local Journal: [{0}] [{1}] [{2}] [{3}] [{4}] [{5}] [{6}] [{7}]", msg);
  }

  public void uninit()
  {
  }

}