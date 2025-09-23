/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.viewer.session;

import java.io.File;

import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.concord.viewer.platform.Platform;
import com.ibm.json.java.JSONObject;

public class SessionConfig
{
  private static final Logger LOG = Logger.getLogger(SessionConfig.class.getName());
  
  public static int getHeartBeatInterval()
  {
    JSONObject config = Platform.getViewerConfig().getSubConfig("session");
    int hbInterval = 30;
    try {
      String s = config.get("interval").toString();
      hbInterval = Integer.parseInt(s);
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "error parsing interval setting, use default value.");
    }
    
    return hbInterval;
  }
  
  public static int getHeartBeatTimeout()
  {
    JSONObject config = Platform.getViewerConfig().getSubConfig("session");
    int hbTimeout = 30;
    try {
      String s = config.get("timeout").toString();
      hbTimeout = Integer.parseInt(s);
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "error parsing timeout setting, use default value.");
    }
    
    return hbTimeout;    
  }
  
  public static int getHeartBeatRetryCount()
  {
    JSONObject config = Platform.getViewerConfig().getSubConfig("session");
    int hbRetry = 30;
    try {
      String s = config.get("retry").toString();
      hbRetry = Integer.parseInt(s);
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "error parsing retry setting, use default value" , e);
    }
    
    return hbRetry;    
  }
  
  public static int getMaxActiveEditing()
  {
    JSONObject config = Platform.getViewerConfig().getSubConfig("session");
    int max = -1;
    try {
      String s = config.get("max-active-editing").toString();
      max = Integer.parseInt(s);
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "error parsing max-active-editing setting, use default value" , e);
    }
    
    return max;
  }
  
  public static String getCacheFolder()
  {
    JSONObject config = Platform.getViewerConfig().getSubConfig("session");
    try {
      String path = config.get("cache-folder").toString();
      File folder = new File(path);
      if (!folder.exists())
      {
        folder.mkdirs();
      }
      return path;
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "error parsing cache-folder setting" , e);
    }
    
    return null;
  }
}
