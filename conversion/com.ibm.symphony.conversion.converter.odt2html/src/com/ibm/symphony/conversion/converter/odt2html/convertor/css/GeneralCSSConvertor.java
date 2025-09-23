/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.odt2html.convertor.css;

import java.util.HashSet;
import java.util.Iterator;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Set;

import org.odftoolkit.odfdom.OdfElement;

import com.ibm.json.java.JSONObject;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.ConvertUtil;
import com.ibm.symphony.conversion.service.common.ODFConstants;

public class GeneralCSSConvertor extends CSSConvertor
{

  public static final Set<String> propertyTagNames = new HashSet<String>();
  static
  {
    propertyTagNames.add(ODFConstants.STYLE_DRAWING_PAGE_PROPERTIES);
    propertyTagNames.add(ODFConstants.STYLE_GRAPHIC_PROPERTIES);
    propertyTagNames.add(ODFConstants.STYLE_PARAGRAPH_PROPERTIES);
    propertyTagNames.add(ODFConstants.STYLE_TABLE_PROPERTIES);
    propertyTagNames.add(ODFConstants.STYLE_TABLE_CELL_PROPERTYES);
    propertyTagNames.add(ODFConstants.STYLE_TABLE_ROW_PROPERTIES);
    propertyTagNames.add(ODFConstants.STYLE_TABLE_COLUMN_PROPERTIES);
    propertyTagNames.add(ODFConstants.STYLE_SECTION_PROPERTIES);
  }

  @Override
  public void doConvertCSS(ConversionContext context, OdfElement element, Map<String, Map<String, String>> map)
  {
    if (propertyTagNames.contains(element.getNodeName()))
    {
      CSSConvertorUtil.parseStyle(context, element, map);
    }
    else
    {
      String styleName = element.getAttribute(ODFConstants.STYLE_NAME);
      if (styleName.length() > 0)
      {
        Map<String, String> styleMap = CSSConvertorUtil.getStyleMap(styleName, map);
        handleDefaultValue(map, element, styleMap);
        CSSConvertorUtil.inheritParentStyle(context, element, map);
      }
      CSSConvertorUtil.convertChildren(context, element, map);

      stripBorderStyle(element, map);

      String masterPageName = element.getAttribute(ODFConstants.STYLE_MASTER_PAGE_NAME);

      if (masterPageName.length() > 0)
      {
        CSSConvertorUtil.getUsedMasterPageNameSet(context).add(masterPageName);
      }
    }
  }

  /**
   * If the border style of the child is none , then remove the border - left;top;right;bottom style which are from parent style.
   * 
   * @param element
   * @param map
   */
  private void stripBorderStyle(OdfElement element, Map<String, Map<String, String>> map)
  {
    String childStyleName = CSSConvertorUtil.getStyleName(element);
    Map<String, String> styleMap = CSSConvertorUtil.getStyleMap(childStyleName, map);
    if (styleMap.containsKey("border") && styleMap.get("border").indexOf("none") != -1)
    {
      styleMap.remove("border-left");
      styleMap.remove("border-right");
      styleMap.remove("border-top");
      styleMap.remove("border-bottom");
    }
  }

  @SuppressWarnings("unchecked")
  private void handleDefaultValue(Map<String, Map<String, String>> map, OdfElement element, Map<String, String> styleMap)
  {
    JSONObject defaultValueMap = ConvertUtil.getDefaultValueMap();
    String styleFamily = element.getAttribute(ODFConstants.STYLE_FAMILY);
    if (defaultValueMap.containsKey(styleFamily))
    {
      Map<String, String> defaultStyle = (Map<String, String>) defaultValueMap.get(styleFamily);
      Map<String, String> globalStyle = map.get("default-style_" + styleFamily);
      Iterator<Entry<String, String>> it = defaultStyle.entrySet().iterator();
      while( it.hasNext() )
      {
        Entry<String, String> entry = it.next();
        if( globalStyle != null && globalStyle.containsKey( entry.getKey() ))
        {
          styleMap.put(entry.getKey(), globalStyle.get( entry.getKey()));
        }
        else
        {
          styleMap.put(entry.getKey(), entry.getValue());
        }
      }
      
    }
  }

}
