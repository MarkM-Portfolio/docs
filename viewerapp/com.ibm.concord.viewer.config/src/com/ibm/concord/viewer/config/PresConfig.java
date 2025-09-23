/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.viewer.config;

import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.json.java.JSONObject;

public class PresConfig
{
  private static final Logger LOG = Logger.getLogger(PresConfig.class.getName());

  private static final int DEFAULT_MAX_IMAGE_SIZE = 8192;

  private static final int DEFAULT_ACTUAL_MAX_SIZE = 2048;

  private static JSONObject configs;

  private static JSONObject presLimits;

  static
  {
    configs = ViewerConfig.getInstance().getSubConfig("HtmlViewerConfig");
    presLimits = (JSONObject) configs.get("pres-limits");
  }

  public static JSONObject getLimits()
  {
    return presLimits;
  }

  public static boolean isEnable()
  {
    boolean enable = false;
    try
    {
      if (configs.containsKey("enabled"))
      {
        String s = configs.get("enabled").toString();
        enable = Boolean.valueOf(s);
      }
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "error parsing partial-level", e);
    }

    return enable;
  }

  public static int getMaxImgSize()
  {
    JSONObject limits = (JSONObject) configs.get("pres-limits");

    if (limits == null || (String) limits.get("max-image-size") == null)
    {
      return DEFAULT_MAX_IMAGE_SIZE;
    }

    int max = -1;
    try
    {
      String s = (String) limits.get("max-image-size");
      max = Integer.parseInt(s);
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "error parsing max-image-size", e);
    }

    return max;
  }

  public static String getMaxSize()
  {
    JSONObject limits = (JSONObject) configs.get("pres-limits");

    if (limits == null || (String) limits.get("max-size") == null)
    {
      return "4196";
    }

    String max = "4196";
    try
    {
      String s = (String) limits.get("max-size");
      max = s;
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "error parsing max-image-size", e);
    }

    return max;
  }

  public static int getActualMaxSize()
  {
    JSONObject limits = (JSONObject) configs.get("pres-limits");

    if (limits == null || (String) limits.get("actual-max-size") == null)
    {
      return DEFAULT_ACTUAL_MAX_SIZE;
    }

    int max = -1;
    try
    {
      String s = (String) limits.get("actual-max-size");
      max = Integer.parseInt(s);
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "error parsing actual-max-size", e);
    }

    return max;
  }

  public static String getMaxPage()
  {
    JSONObject limits = (JSONObject) configs.get("pres-limits");

    if (limits == null || (String) limits.get("max-page") == null)
    {
      return "75";
    }

    String max = "75";
    try
    {
      String s = (String) limits.get("max-page");
      max = s;
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "error parsing max-image-size", e);
    }

    return max;
  }

  public static String getMaxGraphicCount()
  {
    JSONObject limits = (JSONObject) configs.get("pres-limits");

    if (limits == null || (String) limits.get("max-graphic-count") == null)
    {
      return "1500";
    }

    String max = "1500";
    try
    {
      String s = (String) limits.get("max-graphic-count");
      max = s;
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "error parsing max-image-size", e);
    }

    return max;
  }
}
