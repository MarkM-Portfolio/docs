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

public class HTMLViewConfig
{
  private static final Logger logger = Logger.getLogger(HTMLViewConfig.class.getName());

  private static final int DEFAULT_MAX_SHEET_ROWS = 5000;

  private static final int DEFAULT_MAX_IMAGE_SIZE = 8192;

  private static final int DEFAULT_MAX_TEXT_SIZE = 2048;

  private static final int PARTIAL_LEVEL_ROW = 2;

  private static JSONObject configs;

  private static JSONObject sheetLimits;

  private static String[] excludes = null;

  static
  {
    configs = ViewerConfig.getInstance().getSubConfig("HtmlViewerConfig");
    sheetLimits = (JSONObject) configs.get("sheet-limits");
  }

  public static JSONObject getLimits()
  {
    return sheetLimits;
  }

  public static int getMaxSheetRows()
  {
    JSONObject limits = (JSONObject) configs.get("sheet-limits");

    if (limits == null || (String) limits.get("max-sheet-rows") == null)
    {
      return DEFAULT_MAX_SHEET_ROWS;
    }

    int max = -1;
    try
    {
      String s = (String) limits.get("max-sheet-rows");
      max = Integer.parseInt(s);
    }
    catch (Exception e)
    {
      logger.log(Level.WARNING, "error parsing max-sheet-rows", e);
    }

    return max;
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
      logger.log(Level.WARNING, "error parsing partial-level", e);
    }

    return enable;
  }

  public static int getPartialLevel()
  {
    int level = PARTIAL_LEVEL_ROW;
    try
    {
      if (configs.containsKey("partial-level"))
      {
        String s = configs.get("partial-level").toString();
        level = Integer.parseInt(s);
      }
    }
    catch (Exception e)
    {
      logger.log(Level.WARNING, "error parsing partial-level", e);
    }

    return level;
  }

  public static int getPartialRowCnt()
  {
    int cnt = -1;
    try
    {
      if (configs.containsKey("partial-row-count"))
      {
        String s = configs.get("partial-row-count").toString();
        cnt = Integer.parseInt(s);
      }
    }
    catch (Exception e)
    {
      logger.log(Level.WARNING, "error parsing partial-row-count", e);
    }

    return cnt;
  }

  public static int getMaxImgSize()
  {
    JSONObject limits = (JSONObject) configs.get("sheet-limits");

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
      logger.log(Level.WARNING, "error parsing max-image-size", e);
    }

    return max;
  }

  public static String getMaxSize()
  {
    JSONObject limits = (JSONObject) configs.get("sheet-limits");

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
      logger.log(Level.WARNING, "error parsing max-image-size", e);
    }

    return max;
  }

  public static int getMaxTextSize()
  {
    JSONObject limits = (JSONObject) configs.get("sheet-limits");

    if (limits == null || (String) limits.get("max-text-size") == null)
    {
      return DEFAULT_MAX_TEXT_SIZE;
    }

    int max = -1;
    try
    {
      String s = (String) limits.get("max-text-size");
      max = Integer.parseInt(s);
    }
    catch (Exception e)
    {
      logger.log(Level.WARNING, "error parsing max-text-size", e);
    }

    return max;
  }

  public static int getHBTimeout()
  {
    int hbtimeout = 3000;
    try
    {
      if (configs.containsKey("hbtimeout"))
      {
        String s = configs.get("hbtimeout").toString();
        hbtimeout = Integer.parseInt(s);
      }
    }
    catch (Exception e)
    {
      logger.log(Level.WARNING, "error parsing partial-level", e);
    }

    return hbtimeout;
  }

  public static String[] getExcludes()
  {
    try
    {
      if (excludes == null)
      {
        String s = (String) configs.get("exclude");
        if (s == null) s = "";
        
        if ("".equals(s.trim()))
        {
          excludes = new String[] { "pdf" };
        }
        else
        {
          s += ";pdf";
          excludes = s.split(";");
        }

        StringBuffer sbf = new StringBuffer("HTML view excludes:");
        for (String str : excludes)
        {
          sbf.append(" ").append(str);
        }
        sbf.append(".");
        logger.info(sbf.toString());
      }
    }
    catch (Exception e)
    {
      logger.log(Level.WARNING, e.getMessage(), e);
      return new String[] { "pdf" };
    }

    return excludes;

  }

  public static JSONObject getCustomizedFonts()
  {
    JSONObject config = (JSONObject) configs.get("CustomizedFonts");
    if (config == null)
    {
      JSONObject json = new JSONObject();
      json.put("enabled", "false");
      return json;
    }
    else
    {
      String enabled = (String) config.get("enabled");
      if ("false".equalsIgnoreCase(enabled))
      {
        JSONObject json = new JSONObject();
        json.put("enabled", "false");
        return json;
      }
    }

    return config;
  }

  public static JSONObject getWatermark() {
	  JSONObject config = (JSONObject) configs.get("Watermark");
	  if (config != null && "true".equalsIgnoreCase((String) config.get("enabled"))){
		  return config;
	  } else {
		  JSONObject json = new JSONObject();
	      json.put("enabled", "false");
	      return json;
	  }
  }

  public static String escape(String jsonString)
  {
    if (jsonString == null)
    {
      throw new NullPointerException();
    }

    StringBuffer sb = new StringBuffer();
    for (int i = 0; i < jsonString.length(); i++)
    {
      char ch = jsonString.charAt(i);
      switch (ch)
        {
          case '\'' :
            sb.append("\\\'");
            break;
          case '"' :
            sb.append("\\\"");
            break;
          default:
            sb.append(ch);
            break;
        // case '\\' :
        // sb.append("\\\\");
        // break;
        // case '\b' :
        // sb.append("\\b");
        // break;
        // case '\f' :
        // sb.append("\\f");
        // break;
        // case '\n' :
        // sb.append("\\n");
        // break;
        // case '\r' :
        // sb.append("\\r");
        // break;
        // case '\t' :
        // sb.append("\\t");
        // break;
        // case '/' :
        // sb.append("\\/");
        // break;
        // default:
        // if (ch >= '\u0000' && ch <= '\u001F')
        // {
        // String ss = Integer.toHexString(ch);
        // sb.append("\\u");
        // for (int k = 0; k < 4 - ss.length(); k++)
        // {
        // sb.append('0');
        // }
        // sb.append(ss.toUpperCase());
        // }
        // else
        // {
        // sb.append(ch);
        // }
        }
    }
    return sb.toString();
  }

  public static boolean isCopyDisabled()
  {
    boolean disable = false;
    try
    {
      if (configs.containsKey("disable_copy"))
      {
        String s = configs.get("disable_copy").toString();
        disable = Boolean.valueOf(s);
      }
    }
    catch (Exception e)
    {
      logger.log(Level.WARNING, "error parsing partial-level", e);
    }

    return disable;
  }
}
