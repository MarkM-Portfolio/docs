/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2017. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */
package com.ibm.concord.services.rest.handlers;

import java.net.InetAddress;
import java.net.UnknownHostException;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.ibm.concord.platform.util.ConcordUtil;
import com.ibm.concord.services.rest.GetHandler;
import com.ibm.json.java.JSONObject;

public class SnoopHandler implements GetHandler
{
  private static final Logger LOG = Logger.getLogger(SnoopHandler.class.getName());
  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws Exception
  {
    JSONObject snoopValue = new JSONObject();
    String version = ConcordUtil.getVersion();
    String timestamp = ConcordUtil.getBuildNumber();
    snoopValue.put("version", version);
    snoopValue.put("timestamp", timestamp);
    String host = "";
    try
    {
      InetAddress ia = InetAddress.getLocalHost();
      host = ia.getHostName();
    }
    catch (UnknownHostException e)
    {
      LOG.log(Level.SEVERE, "Failed to know server host information " + e);
    }
    snoopValue.put("host", host);
    response.setHeader("Cache-Control", "no-cache");
    response.setContentType("application/json");
    snoopValue.serialize(response.getOutputStream());    
  }
}
