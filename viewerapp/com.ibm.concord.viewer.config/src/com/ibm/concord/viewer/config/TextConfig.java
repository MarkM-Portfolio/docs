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

public class TextConfig
{
  private static final Logger LOG = Logger.getLogger(TextConfig.class.getName());

  private static final int DEFAULT_MAX_IMAGE_SIZE = 8192;

  private static final int DEFAULT_ACTUAL_MAX_SIZE = 2048;

  private static JSONObject configs;

  private static JSONObject textLimits;

  static
  {
    configs = ViewerConfig.getInstance().getSubConfig("HtmlViewerConfig");
    textLimits = (JSONObject) configs.get("text-limits");
  }

  public static JSONObject getLimits()
  {
    return textLimits;
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
    JSONObject limits = (JSONObject) configs.get("text-limits");

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
    JSONObject limits = (JSONObject) configs.get("text-limits");

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
    JSONObject limits = (JSONObject) configs.get("text-limits");

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

  /**
   * @param extension 
   * @return
   */
  public static String getMaxSizeByExtension(String extension)
  {
    String mimeTypeSize = "4196";
    JSONObject limits = (JSONObject) configs.get("text-limits");
    if (limits == null || (String) limits.get("max-size") == null)
    {
      return mimeTypeSize;
    }
    try
    {
      mimeTypeSize = (String) limits.get("max-size");
      String mimeTypeSizeStr = String.format("max-%s-size", extension);
      if (limits.containsKey(mimeTypeSizeStr))
      {
        mimeTypeSize = (String) limits.get(mimeTypeSizeStr);
      }
      LOG.log(Level.INFO, String.format("parsing %s : %s ", mimeTypeSizeStr, mimeTypeSize));
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "error parsing max-image-size", e);
    }
    return mimeTypeSize;
  }
}
