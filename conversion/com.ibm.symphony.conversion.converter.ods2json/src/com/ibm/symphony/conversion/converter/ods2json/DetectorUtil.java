/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.ods2json;

import java.io.IOException;
import java.io.InputStream;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.Map;
import java.util.Set;
import java.util.logging.Logger;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

import org.w3c.dom.Element;

import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

public class DetectorUtil
{
  
  private static Logger log = Logger.getLogger(DetectorUtil.class.getName());
  private final static String configFileName = "feature_map.json";
  
  static JSONObject featureMap;
  
  public static HashMap<String,String> unsupContentTagMap;
  public static HashMap<String,String> unsupStyleTagMap;
  public static HashMap<String,HashMap<String,Set>> tagAttrsMap;
  public static HashMap<String,String> featuresId;
  public static int content_feature_num = 0;
  public static int style_feature_num = 0;
  public static boolean bRecordCount = false;
  
  static
  {
    InputStream in = null;
    try
    {
      in = DetectorUtil.class.getResourceAsStream(configFileName);
      if(null != in)
      {
        featureMap = JSONObject.parse(in);
        in.close();
      }
    }
    catch (IOException e)
    {
      log.severe("Can't find feature_map.json");
    }
    unsupContentTagMap = new HashMap<String,String>();
    unsupStyleTagMap = new HashMap<String,String>();
    featuresId = new HashMap<String,String>();
    tagAttrsMap = new HashMap<String,HashMap<String,Set>>();
    initUnsupTagMap((JSONObject)featureMap.get("content"), unsupContentTagMap);
    initUnsupTagMap((JSONObject)featureMap.get("style"), unsupStyleTagMap);
    featuresId = (HashMap<String,String>)featureMap.get("featuresId");
    content_feature_num = unsupContentTagMap.size();
    style_feature_num = unsupStyleTagMap.size();
  }
  
 
  
  public static JSONObject getFeatureMap()
  {
    return featureMap;
  }
  
  public static boolean isAttrsMatch(String tagName, Element element)
  {
    HashMap<String, Set> map = DetectorUtil.tagAttrsMap.get(tagName);
    if (null == map)
      return true;
    Iterator it = map.entrySet().iterator();
    while (it.hasNext())
    {
      Map.Entry<?, ?> entry = (Map.Entry<?, ?>) it.next();
      String key = (String) entry.getKey();
      Set<String> values = (Set<String>) entry.getValue();
      String attrValue = element.getAttribute(key);
      Iterator itv = values.iterator();
      boolean flag = false;
      while (itv.hasNext())
      {
        String value = (String) itv.next();
        if (attrValue.startsWith(value))
        {
          flag = true;
          break;
        }
      }
      if (!flag)
        return false;
    }
    return true;
  }

  
  public static boolean detectMacro(InputStream input)
  {
    boolean hasMacro = false ;
    ZipInputStream in = null;
    try
    {
      in = new ZipInputStream(input);
      ZipEntry e;
      while ((e = in.getNextEntry() )!= null)
      {
        String name = e.getName();
        if(name.startsWith("Basic/"))
        {
          hasMacro = true;
          break;
        }
      }
      return hasMacro;
    }
    catch (IOException e)
    {
      return hasMacro;
    }
    finally{
      try
      {
        in.close();
      }
      catch (IOException e)
      {
      }
    }
  }
  
  public static void initUnsupTagMap(JSONObject json, HashMap<String,String> map )
  {
    if(null == json) return;
    Iterator it = json.entrySet().iterator();
    while(it.hasNext())
    {
      Map.Entry<?,?> entry = (Map.Entry<?,?>)it.next();
      String key = (String)entry.getKey();
      JSONArray value = (JSONArray)entry.getValue();
      for(int i = 0; i < value.size(); i++)
      {
        JSONObject item = (JSONObject) value.get(i);
        String tagName = (String)item.get("tagname");
        map.put(tagName, key);
        JSONArray attrs = (JSONArray) item.get("attrs");
        if(null != attrs)
        {
          HashMap<String,Set> tagAttrs = tagAttrsMap.get(tagName);
          if(null == tagAttrs)
          {
            tagAttrs = new HashMap<String,Set>();
            tagAttrsMap.put(tagName, tagAttrs);
          }
          for(int j = 0 ; j < attrs.size(); j++)
          {
            JSONObject attrItem = (JSONObject) attrs.get(j);
            // every attrItem only contain one attr
            String attrName =(String) attrItem.keySet().iterator().next();
            String attrValue = (String) attrItem.get(attrName);
            Set<String> attrSet = tagAttrs.get(attrName);
            if(null == attrSet)
            {
              attrSet = new HashSet<String>();
              tagAttrs.put(attrName, attrSet);
            }
            attrSet.add(attrValue);
          }
        }
      }
    }
  }
  
}
