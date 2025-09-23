/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.session;

import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.concord.config.ConcordConfig;
import com.ibm.concord.platform.Platform;
import com.ibm.json.java.JSONObject;

public class SessionConfig
{
  private static JSONObject configJson = null;

  private static final Logger LOG = Logger.getLogger(SessionConfig.class.getName());

  private static final String KEY_MAX_SAVE_MSG_SIZE = "max-save-msg-size";
  
  private static final String KEY_MAX_SAVE_MSG_SIZE_SINGLE = "max-save-msg-size-single";

  private static final String KEY_MAX_APPLY_MSG_SIZE = "max-apply-msg-size";

  private static final int MAX_SAVE_MSG_SIZE_UPPER_LIMIT = 2000;

  private static final int MAX_APPLY_MSG_SIZE_UPPER_LIMIT = 8000;

  private static final int MAX_USERS_PER_SESSION_DEFAULT_VALUE = 10;

  private static final int MAX_SAVE_MSG_SIZE_FOR_SINGLE = 0;

  private static final int MAX_APPLY_MSG_SIZE_FOR_SINGLE = 800;

  private static Boolean reloadLog = null;

  public static int getHeartBeatInterval()
  {
    JSONObject config = Platform.getConcordConfig().getSubConfig("session");
    int hbInterval = 30;
    try
    {
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
    JSONObject config = Platform.getConcordConfig().getSubConfig("session");
    int hbTimeout = 30;
    try
    {
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
    JSONObject config = Platform.getConcordConfig().getSubConfig("session");
    int hbRetry = 30;
    try
    {
      String s = config.get("retry").toString();
      hbRetry = Integer.parseInt(s);
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "error parsing retry setting, use default value", e);
    }

    return hbRetry;
  }

  public static int getMaxActiveEditing()
  {
    JSONObject config = Platform.getConcordConfig().getSubConfig("session");
    int max = -1;
    try
    {
      String s = config.get("max-active-editing").toString();
      max = Integer.parseInt(s);
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "error parsing max-active-editing setting, use default value", e);
    }

    return max;
  }

  public static boolean getReloadLog()
  {
    if (reloadLog == null)
    {
      JSONObject config = ConcordConfig.getInstance().getSubConfig("log");
      try
      {
        if (config != null)
        {
          String value = (String) config.get("reloadLog");
          reloadLog = "true".equalsIgnoreCase(value);
        }
        else
          reloadLog = false;
      }
      catch (Exception e)
      {
        LOG.log(Level.WARNING, "error parsing reloadLog", e);
      }

      return reloadLog;
    }
    else
      return reloadLog;
  }

  public static int getMaxUsersPerSession()
  {
    JSONObject config = Platform.getConcordConfig().getSubConfig("session");
    int max = MAX_USERS_PER_SESSION_DEFAULT_VALUE;
    try
    {
      Object o = config.get("max-users-per-session");
      if (o == null)
        return MAX_USERS_PER_SESSION_DEFAULT_VALUE;

      String s = o.toString();
      max = Integer.parseInt(s);
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "error parsing max-users-per-session setting, use default value", e);
    }

    return max;
  }

  /**
   * Get the max string length of messages in message queue..
   * 
   * @return
   */
  public static long getMaxMsgsSizeInQueue()
  {
    JSONObject config = Platform.getConcordConfig().getSubConfig("session");
    long maxMsgsSizeInQueue = 2 * 1024 * 1024;
    try
    {
      if (config.get("max-msgsize-in-queue") != null)
      {
        String value = config.get("max-msgsize-in-queue").toString();
        maxMsgsSizeInQueue = Integer.parseInt(value) * 1024;
      }
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "error parsing retry setting, use default value", e);
    }

    return maxMsgsSizeInQueue;
  }



  public static JSONObject toJSON()
  {
    if (configJson == null)
    {
      configJson = new JSONObject();
      configJson.put("retry", getHeartBeatRetryCount());
      configJson.put("interval", getHeartBeatInterval());
      configJson.put("timeout", getHeartBeatTimeout());
      configJson.put("max_active_editing", getMaxActiveEditing());
      configJson.put("max_users_per_session", getMaxUsersPerSession());
    }

    return configJson;
  }

  public static int getMaxSaveMsgSizeForSingle()
  {
    int maxSaveMsgSize = 0;
    JSONObject config = Platform.getConcordConfig().getSubConfig("session");
    try
    {
      if (config.get(KEY_MAX_SAVE_MSG_SIZE_SINGLE) != null)// top priority
      {
        String value = config.get(KEY_MAX_SAVE_MSG_SIZE_SINGLE).toString();
        maxSaveMsgSize = Integer.parseInt(value);
        return maxSaveMsgSize;
      }
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "error when parsing " + KEY_MAX_SAVE_MSG_SIZE + "setting, use the default value", e);
    }
    return MAX_SAVE_MSG_SIZE_FOR_SINGLE;
  }

  public static int getMaxSaveMsgSizeForCoEdit()
  {
    int maxSaveMsgSize = 0;
    JSONObject config = Platform.getConcordConfig().getSubConfig("session");
    try
    {
      if (config.get(KEY_MAX_SAVE_MSG_SIZE) != null)// top priority
      {
        String value = config.get(KEY_MAX_SAVE_MSG_SIZE).toString();
        maxSaveMsgSize = Integer.parseInt(value);
        return maxSaveMsgSize;
      }
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "error when parsing " + KEY_MAX_SAVE_MSG_SIZE + "setting, use the default value", e);
    }
    maxSaveMsgSize = (MAX_SAVE_MSG_SIZE_FOR_SINGLE + 30)* (getMaxUsersPerSession() / MAX_USERS_PER_SESSION_DEFAULT_VALUE);
    maxSaveMsgSize = maxSaveMsgSize < MAX_SAVE_MSG_SIZE_FOR_SINGLE ? MAX_SAVE_MSG_SIZE_FOR_SINGLE : maxSaveMsgSize;
    maxSaveMsgSize = maxSaveMsgSize > MAX_SAVE_MSG_SIZE_UPPER_LIMIT ? MAX_SAVE_MSG_SIZE_UPPER_LIMIT : maxSaveMsgSize;

    if (LOG.isLoggable(Level.FINE))
    {
      LOG.log(Level.FINE, "maxSaveMsgSizeForCoEdit is " + maxSaveMsgSize);
    }
    return maxSaveMsgSize;
  }

  public static int getMaxApplyMsgSizeForSingle()
  {
    return MAX_APPLY_MSG_SIZE_FOR_SINGLE;
  }

  public static int getMaxApplyMsgSizeForCoEdit()
  {
    int maxApplyMsgSize = 0;
    JSONObject config = Platform.getConcordConfig().getSubConfig("session");
    try
    {
      if (config.get(KEY_MAX_APPLY_MSG_SIZE) != null)
      {
        String value = config.get(KEY_MAX_APPLY_MSG_SIZE).toString();
        maxApplyMsgSize = Integer.parseInt(value);
        return maxApplyMsgSize;
      }
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "error when parsing " + KEY_MAX_APPLY_MSG_SIZE + "setting, use the default value", e);
    }

    maxApplyMsgSize = MAX_APPLY_MSG_SIZE_FOR_SINGLE * (getMaxUsersPerSession() / MAX_USERS_PER_SESSION_DEFAULT_VALUE);
    maxApplyMsgSize = maxApplyMsgSize < MAX_APPLY_MSG_SIZE_FOR_SINGLE ? MAX_APPLY_MSG_SIZE_FOR_SINGLE : maxApplyMsgSize;
    maxApplyMsgSize = maxApplyMsgSize > MAX_APPLY_MSG_SIZE_UPPER_LIMIT ? MAX_APPLY_MSG_SIZE_UPPER_LIMIT : maxApplyMsgSize;

    if (LOG.isLoggable(Level.FINE))
    {
      LOG.log(Level.FINE, "maxApplyMsgSizeForCoEdit is " + maxApplyMsgSize);
    }

    return maxApplyMsgSize;
  }

}
