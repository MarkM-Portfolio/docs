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

import com.ibm.json.java.JSONObject;

public class OpenSymbolUtil
{
  private static String DEFAULT_SYMBOL_CODE = "2022";
  
  private static JSONObject OPEN_SYMBOL_UD_MAP = G11NConfigFileUtil.parseJSON("OpenSymbolFont.json"); 
  
  /**
   * Transform the source unicode if it's in custom area of open symbol.
   * @param String - the unicode string of source open symbol character 
   * @return String - the unicode string of converted character. 
   */
  public static String transformUnicode(String sourceUnicode)
  {
    int count = sourceUnicode.codePointCount(0, sourceUnicode.length());
    StringBuilder sb = new StringBuilder();
    char E0 = '\ue000';
    for (int i = 0; i < count; i++)
    {
      char iChar = sourceUnicode.charAt(i);
      String key = Integer.toHexString(sourceUnicode.codePointAt(i));
      if (iChar > E0)
      {
        if (OPEN_SYMBOL_UD_MAP != null && OPEN_SYMBOL_UD_MAP.containsKey(key))
          sb.append("\\" + OPEN_SYMBOL_UD_MAP.get(key));
        else
          sb.append("\\" + DEFAULT_SYMBOL_CODE);
      }
      else
      {
        sb.append("\\");
        sb.append(String.format("%04x", sourceUnicode.codePointAt(i)));
      }
    }
    return sb.toString().replaceAll("25cf", DEFAULT_SYMBOL_CODE);
  }
}
