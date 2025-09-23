/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2016. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.writer;

import java.io.StringReader;
import java.util.Set;

import org.apache.commons.lang.StringUtils;

import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

public class LogPurify
{

  public static String purify(JSONObject json)
  {
    if (json == null)
      return "";
    try
    {
      JSONObject obj = JSONObject.parse(new StringReader(json.toString()));
      checkJSON(obj);
      return obj.toString();
    }
    catch (Exception ex)
    {
      return "";
    }
  }

  public static String purify(JSONArray json)
  {
    if (json == null)
      return "";
    try
    {
      JSONArray obj = JSONArray.parse(new StringReader(json.toString()));
      checkJSONArray(obj);
      return obj.toString();
    }
    catch (Exception ex)
    {
      return "";
    }
  }

  private static void checkJSONArray(JSONArray json)
  {
    if (json == null)
      return;

    for (int i = 0; i < json.size(); i++)
    {
      Object value = json.get(i);
      if (value == null)
        return;
      else if (value instanceof JSONArray)
        checkJSONArray((JSONArray) value);
      else if (value instanceof JSONObject)
        checkJSON((JSONObject) value);
    }
  }

  private static void checkJSON(JSONObject json)
  {
    if (json == null)
      return;

    Set<String> keys = json.keySet();

    for (String key : keys)
    {
      Object value = json.get(key);
      if (value == null)
      {

      }
      else if (value instanceof JSONObject)
      {
        checkJSON((JSONObject) (value));
      }
      else if (value instanceof JSONArray)
      {
        checkJSONArray((JSONArray) (value));
      }
      else if (value instanceof String && key.equals("c"))
      {
        String v = (String) value;
        int len = v.length();
        json.put(key, fakeData(len));
      }
    }

  }

  private static String fakeData(int len)
  {
    return StringUtils.leftPad("", len, "*");
  }
}
