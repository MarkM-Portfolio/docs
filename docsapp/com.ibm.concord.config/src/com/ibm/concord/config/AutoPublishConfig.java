package com.ibm.concord.config;

import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.json.java.JSONObject;

public class AutoPublishConfig
{
  private static final Logger LOG = Logger.getLogger(AutoPublishConfig.class.getName());
  
  private static final String AUTO_PUBLISH = "auto-publish";
  
  private static final String AUTO_CHECKIN = "auto-cehckin";

  public static boolean getFeatureEnabled()
  {
    boolean autoPublish = true;
    JSONObject config = ConcordConfig.getInstance().getSubConfig(AUTO_PUBLISH);
    try
    {
      if (config != null)
      {
        String value = (String) config.get("enable-feature");
        if ("false".equalsIgnoreCase(value))
          autoPublish = false;
      }
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "error parsing enable-feature", e);
    }

    return autoPublish;
  }
  
  public static boolean getAutoPublish()
  {
    boolean autoPublish = true;
    JSONObject config = ConcordConfig.getInstance().getSubConfig(AUTO_PUBLISH);
    try
    {
      if (config != null)
      {
        String value = (String) config.get("default-auto-publish");
        if ("false".equalsIgnoreCase(value))
          autoPublish = false;
      }
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "error parsing default-auto-publish", e);
    }

    return autoPublish;
  }
  
  public static boolean getAutoCheckIn()
  {
    boolean autoCheckIn = false;    
    try
    {
      JSONObject config = ConcordConfig.getInstance().getSubConfig(AUTO_CHECKIN);
      if (config != null)
      {
        String value = (String) config.get("default-auto-cehckin");
        if ("true".equalsIgnoreCase(value))
          autoCheckIn = true;
      }
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "error parsing default-auto-cehckin", e);
    }

    return autoCheckIn;
  }

  public static long getMaxAutoPublishInterval()
  {
    JSONObject config = ConcordConfig.getInstance().getSubConfig(AUTO_PUBLISH);
    long newVersionInterval = 3600 * 1000;
    try
    {
      if (config.get("max-autopublish-interval") != null)
      {
        String value = config.get("max-autopublish-interval").toString();
        newVersionInterval = Integer.parseInt(value) * 1000;
      }
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "error parsing retry setting, use default value", e);
    }

    return newVersionInterval;
  }

}
