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

import java.util.HashMap;
import java.util.Map;

import org.odftoolkit.odfdom.OdfElement;

import com.ibm.symphony.conversion.converter.odt2html.convertor.html.list.ListSymbolUtil;
import com.ibm.symphony.conversion.converter.odt2html.convertor.html.list.ListUtil;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.HtmlCSSConstants;
import com.ibm.symphony.conversion.service.common.ODFConstants;

public class ListLevelStyleNumberConvertor extends CSSConvertor
{

  @Override
  protected void doConvertCSS(ConversionContext context, OdfElement element, Map<String, Map<String, String>> map)
  {
    String styleName = CSSConvertorUtil.getStyleName(element);

    parseNumberFormat(styleName, context, element, map);
    //parseStartValue(styleName, context, element, map);
    CSSConvertorUtil.convertChildren(context, element, map);

  }

  @SuppressWarnings("unchecked")
  private static void parseNumberFormat(String styleName, ConversionContext context, OdfElement styleElement, Map<String, Map<String, String>> map)
  {
    Map<String, Map<String, String>> cssMap = (Map<String, Map<String, String>>) context.get("CSSStyle");
    Map<String, String> styleMap = new HashMap<String, String>();
    // defect 40617, support text-style on list
    // >>>>>>>>>>>>>>>>>>>>>>>>>>>>
    String textStyleName = styleElement.getAttribute(ODFConstants.TEXT_STYLE_NAME);
    
    if( textStyleName.length() > 0 )
    {
      Map<String, String> textStyleMap = map.get( textStyleName );
      if( textStyleMap != null && textStyleMap.size() > 0 )
      {
        styleMap.putAll(textStyleMap);
      }
    }
    //<<<<<<<<<<<<<<<<<<<<<<<
    
    
    cssMap.put(ListUtil.generateCssStyleName(styleName), styleMap);
    styleMap.put(HtmlCSSConstants.WHITE_SPACE, HtmlCSSConstants.PRE);
    //styleMap.put(HtmlCSSConstants.COUNTER_INCREMENT, styleName);
    String numberingContent = getNumberingContent(styleName, styleElement) + "\"  \"";
    styleMap.put(HtmlCSSConstants.CONTENT, numberingContent);
    //add CSS style rules for list items having 'rtl' direction
    //add invisible RLM UCC in order to prevent messing text and bullet in list item with 'rtl' direction
    styleName = styleName.trim() + "." + HtmlCSSConstants.RTL;
    styleMap = new HashMap<String, String>();
    styleMap.put(HtmlCSSConstants.CONTENT, numberingContent + "\"\\200F\"");
    cssMap.put(ListUtil.generateCssStyleName(styleName), styleMap);
  }

  public static String getNumberingContent(String styleName, OdfElement styleElement)
  {
    
    String prefix = styleElement.getAttribute(ODFConstants.STYLE_NUM_PREFIX);
    if (prefix.length() > 0)
    {
      prefix = "\"" + ListSymbolUtil.extractToUnicode( prefix ) + "\"";
    }
    String suffix = styleElement.getAttribute(ODFConstants.STYLE_NUM_SUFFIX);
    if (suffix.length() > 0)
    {
      suffix = "\"" + ListSymbolUtil.extractToUnicode(suffix) + "\" ";
    }
    
    return prefix + " attr(values) " + suffix ;

  }

  private static void parseStartValue(String styleName, ConversionContext context, OdfElement element, Map<String, Map<String, String>> map)
  {
    Map<String, String> styleMap = CSSConvertorUtil.getStyleMap(styleName, map);
    String val = element.getAttribute(ODFConstants.TEXT_START_VALUE);
    if (val.length() > 0)
    {
      int startValue = Integer.parseInt(val);
      styleMap.put(HtmlCSSConstants.COUNTER_RESET, styleName + " " + (startValue - 1));
    }
    else
    {
      styleMap.put(HtmlCSSConstants.COUNTER_RESET, styleName);
    }
  }

}
