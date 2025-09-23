/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.webmsg.rtc4web;

import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.rtc.polled.RealTimeSessionFactory;
import com.ibm.rtc.polled.RealTimeSession;
import com.ibm.wsspi.httpqueue.service.QueueManagementService;
import com.ibm.concord.log.ConcordErrorCode;
import com.ibm.concord.log.ConcordLogger;
import com.ibm.concord.platform.Platform;
import com.ibm.concord.spi.webmessage.IWebMessageAdapter;
import com.ibm.json.java.JSONObject;

public class Rtc4WebMessageAdapter implements IWebMessageAdapter
{
  private static final Logger LOG = Logger.getLogger(Rtc4WebMessageAdapter.class.getName());

  private static final String rtc4web_coEdit_ch = "co-edit-data";
  private static boolean isbAddRtcContextRoot = false;

  /**
   * 
   */
  public Rtc4WebMessageAdapter()
  {
  }

  /*
   * (non-Javadoc)
   * @see com.ibm.concord.spi.webmessage.IWebMessageAdapter#init(com.ibm.json.java.JSONObject)
   */
  public void init(JSONObject config)
  {
    if (!isbAddRtcContextRoot)
    {
      QueueManagementService queueService = QueueManagementService.getReference();
      if (queueService == null)
      {
        ConcordLogger.log(LOG, Level.SEVERE, ConcordErrorCode.RTC4WEB_ERROR, "Error happens when obtaining QueueManagementSerivce instance");
      }
      else
      {
        String rtcContextPath = Platform.getRtcContextPath();
        queueService.addTargetResource(rtcContextPath + "/RTCServlet");
        queueService.addTargetResource(rtcContextPath + "/RTCServlet/");
      }

      isbAddRtcContextRoot = true;
    }
  }

  /*
   * (non-Javadoc)
   * @see com.ibm.concord.spi.webmessage.IWebMessageAdapter#publishMessage(java.lang.String, java.lang.String)
   */
  public boolean publishMessage(String channel, String msgText)
  {
    boolean bSuccess = false;

    try
    {
      channel = channel.substring(1);
      channel = channel.replace("/", "-");
      RealTimeSession rtSession = RealTimeSessionFactory.getInstanceWithChannel(channel, rtc4web_coEdit_ch);
      rtSession.sendMessage(rtc4web_coEdit_ch, msgText);

      if (LOG.isLoggable(Level.FINER))
      {
        LOG.finer("Publishing message: " + msgText + " to channel " + channel);
      }
      
      bSuccess = true;
    }
    catch (Exception e)
    {
      LOG.log(Level.SEVERE, "Error happens when publishing message: " + msgText + " to channel " + channel, e);
    }
    return bSuccess;
  }
}
