/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.docs.common.util;

import java.sql.Timestamp;
import java.text.DateFormat;
import java.util.Date;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

/**
 * @author gaowwei@cn.ibm.com
 * 
 */
public class JsonMapConverter
{
  public static JSONObject convert(Map<?, ?> map)
  {
    return convertMap((Map<?, ?>) map);
  }

  private static Object convertObject(Object v)
  {
    Object o;
    if (v instanceof String)
    {
      o = v;
    }
    else if (v instanceof Timestamp)
    {
      DateFormat format = DateFormat.getDateTimeInstance();
      Timestamp t = (Timestamp) v;
      String date = format.format(t);
      o = date;
    }
    else if (v instanceof Date)
    {
      DateFormat format = DateFormat.getDateTimeInstance();
      Date d = (Date) v;
      String date = format.format(d);
      o = date;
    }
    else if (v instanceof Boolean)
    {
      o = v.toString();
    }
    else if (v instanceof Integer)
    {
      o = v.toString();
    }
    else if (v instanceof UUID)
    {
      o = v.toString();
    }
    else if (v instanceof List)
    {
      JSONArray ja = convertList((List<?>) v);
      o = ja;
    }
    else if (v instanceof Map)
    {
      JSONObject jo = convertMap((Map<?, ?>) v);
      o = jo;
    }
    else
    {
      o = null;
    }

    return o;
  }

  private static JSONArray convertList(List<?> l)
  {
    JSONArray ja = new JSONArray();
    for (int i = 0; i < l.size(); i++)
    {
      Object v = l.get(i);
      Object o = convertObject(v);
      ja.add(o);

    }
    return ja;
  }

  private static JSONObject convertMap(Map<?, ?> map)
  {
    JSONObject jo = new JSONObject();
    Iterator<?> iter = map.entrySet().iterator();

    for (; iter.hasNext();)
    {
      Map.Entry<?, ?> entry = (Map.Entry<?, ?>) iter.next();
      Object v = entry.getValue();
      Object o = convertObject(v);
      jo.put(entry.getKey(), o);
    }

    return jo;
  }

}
