package com.ibm.symphony.conversion.converter.html2odt.convertor.css;

import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

import org.odftoolkit.odfdom.doc.style.OdfStyle;
import org.w3c.dom.Element;

import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.ConvertUtil;

public class ReusableStyleUtil 
{
  private static Map<String,OdfStyle> getReusableStyleMap(ConversionContext context)
  {
    Map<String,OdfStyle> styleMap = (Map<String,OdfStyle>) context.get("ReusableStyleMap");
    if( styleMap == null)
    {
      styleMap = new HashMap<String,OdfStyle>();
      context.put("ReusableStyleMap",styleMap);
    }
    return styleMap;
  }

  public static OdfStyle getReusableStyle(ConversionContext context, String key)
  { 
    if( key.length() > 0)
      return getReusableStyleMap(context).get(key);
    else
      return null;
  }
  
  public static OdfStyle getReusableStyle(ConversionContext context, Element htmlElement, String[] keyAttributes, Map<String, String> CSSMap)
  {
    String key = generateKey(htmlElement, keyAttributes, CSSMap);
    return getReusableStyle(context, key);
  }

  public static void addReusableStyle(ConversionContext context, String key, OdfStyle style )
  {
    if( key.length() > 0)
      getReusableStyleMap(context).put(key, style);
  }
  
  public static void addReusableStyle(ConversionContext context, Element htmlElement, String[] keyAttributes, Map<String, String> CSSMap, OdfStyle style )
  {
    String key = generateKey(htmlElement, keyAttributes, CSSMap);
    addReusableStyle(context, key, style);
  }

  
  
  public static String generateKey(Element htmlElement, String[] keyAttributes, Map<String, String> CSSMap)
  {
    StringBuilder keyBuf = new StringBuilder();
    if( htmlElement == null)
      return "";
    
    if( keyAttributes != null)
    {
      for( String key : keyAttributes)
      {
        String value = htmlElement.getAttribute(key);
        if( value != null)
        {
          keyBuf.append(value);
          keyBuf.append("::");
        }
      }
    }
    
    if( CSSMap != null)
    {
      keyBuf.append( ConvertUtil.convertMapToStyle(CSSMap) );
    }
    return keyBuf.toString();
  }
  
 
}
