/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.service.common.g11n;

import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.Map.Entry;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.json.java.JSONObject;

public class G11NFontFamilyUtil
{
  private static Logger log = Logger.getLogger(G11NFontFamilyUtil.class.getName());

  static Map<String, Set<String>> fontMap = null;

  private static JSONObject fallBackFontFamily = G11NConfigFileUtil.parseJSON("FallBackFontFamily.json");

  static
  {
    try
    {
      JSONObject font = G11NConfigFileUtil.parseJSON("NonWesternFont.json");
      if (font != null)
      {
        Iterator it = font.entrySet().iterator();
        fontMap = new HashMap<String, Set<String>>();
        while (it.hasNext())
        {
          Map.Entry entry = (Entry) it.next();

          Set<String> fontSet = new HashSet<String>();

          List<String> fontList = (List<String>) entry.getValue();

          fontSet.addAll(fontList);
          fontMap.put((String) entry.getKey(), fontSet);
        }
      }
    }
    catch (Exception e)
    {
      log.log(Level.SEVERE, e.toString());
    }
  }

  public static Set<String> getAsianFontSet()
  {
    if(fontMap == null)
      return null;
    else
      return fontMap.get("Asian");
  }

  public static Set<String> getComplexFontSet()
  {
    if(fontMap == null)
      return null;
    else
      return fontMap.get("Complex");
  }

  /**
   * Add fall back font family after source font family name.
   * 
   * @param fontFamilyName
   *          - The html font name list split by ','
   * @return String - font name list with the fall back font family added.
   */
  public static String getFontFamilyWithFallBack(String fontFamilyName)
  {
    if (fontFamilyName == null || fontFamilyName.trim().equals(""))
      return "";

    if (fontFamilyName.endsWith(","))
      fontFamilyName = fontFamilyName.substring(0, fontFamilyName.length() - 1);
    String fallBackFont = getFallBackFontFamily(fontFamilyName);
    String result = (fallBackFont.equals("")) ? fontFamilyName : fontFamilyName + "," + fallBackFont;
    result = formatFontFamily(result, true);
    return result;
  }

  private static String formatFontFamily(String familyName, boolean quotes)
  {
    String result = "";
    familyName = (familyName == null) ? "" : familyName.trim();
    if (familyName.equals(""))
      return result;

    if (quotes)
    {
      familyName = formatFontFamily(familyName, false);

      String[] names = familyName.split(",");

      for (int i = 0; i < names.length; i++)
      {
        String name = "'" + names[i] + "'";
        result += name;
        if (i != (names.length - 1))
          result += ",";
      }
    }
    else
    {
      result = familyName.replaceAll("\"", "");
      result = familyName.replaceAll("'", "");
    }
    return result;
  }

  private static String getFallBackFontFamily(String input)
  {
    String result = "";
    if(fallBackFontFamily == null)
      return result;
    
    String[] family = formatFontFamily(input, false).split(",");
    String familyName = input + ",";
    for (int i = 0; i < family.length; i++)
    {
      String fallback = (String) fallBackFontFamily.get(family[i]);
      String str = "";
      while (fallback != null)
      {
        int index = fallback.indexOf(",");
        if (index < 0 && !familyName.contains(fallback + ","))
        {
          str += fallback;
          str += ",";
          break;
        }
        if (index > 0)
        {
          String tf = fallback.substring(0, index);

          if (!familyName.contains(tf + ","))
          {
            str += tf;
            str += ",";
          }
          fallback = fallback.substring(index + 1);
        }
        else
        {
          break;
        }
      }

      if (!str.equals(""))
      {
        familyName += str;
        result += str;
      }
    }
    if (!result.equals(""))
      result = result.substring(0, result.length() - 1);

    return result;
  }

}
