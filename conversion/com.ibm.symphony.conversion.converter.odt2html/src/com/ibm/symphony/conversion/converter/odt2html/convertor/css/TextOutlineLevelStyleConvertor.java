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

import com.ibm.symphony.conversion.converter.odt2html.convertor.html.list.CounterUtil;
import com.ibm.symphony.conversion.converter.odt2html.convertor.html.list.ListUtil;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.HtmlCSSConstants;
import com.ibm.symphony.conversion.service.common.ODFConstants;

public class TextOutlineLevelStyleConvertor extends CSSConvertor
{

  @SuppressWarnings("unchecked")
  @Override
  protected void doConvertCSS(ConversionContext context, OdfElement element, Map<String, Map<String, String>> map)
  {
    String format = element.getAttribute(ODFConstants.STYLE_NUM_FORMAT);
    String level = element.getAttribute(ODFConstants.TEXT_LEVEL);
    if( level.length() > 0 )
    {
      int iLvl = Integer.parseInt(level);
      if( iLvl > 6)
        return;
    }
    if (format.length() > 0)
    {
      Map<String, Map<String, String>> cssMap = (Map<String, Map<String, String>>) context.get("CSSStyle");

      String styleName = CSSConvertorUtil.getStyleName(element);

      Map<String, String> styleMap = new HashMap<String, String>();

      String numberingContent = ListLevelStyleNumberConvertor.getNumberingContent(styleName, element);
      styleMap.put(HtmlCSSConstants.WHITE_SPACE, HtmlCSSConstants.PRE);
      styleMap.put(HtmlCSSConstants.CONTENT, numberingContent + "\"  \"");
      cssMap.put(ListUtil.generateCssStyleName(styleName), styleMap);
      //add CSS style rules for list items having 'rtl' direction
      //add invisible RLM UCC in order to prevent messing text and bullet in list item with 'rtl' direction
      styleName = styleName.trim() + "." + HtmlCSSConstants.RTL;
      styleMap = new HashMap<String, String>();
      styleMap.put(HtmlCSSConstants.CONTENT, numberingContent + "\"\\  200F\"");
      cssMap.put(ListUtil.generateCssStyleName(styleName), styleMap);
      /*
      int startValue = 0;
      String strStartValue = element.getAttribute(ODFConstants.TEXT_START_VALUE);
      if( strStartValue.length() > 0 )
      {
        try
        {
          startValue = Integer.parseInt(strStartValue) - 1;
        }
        catch(NumberFormatException e)
        {
        }
      }
      CounterUtil.initCounter(context, styleName, startValue);
      */
    }
    CSSConvertorUtil.convertChildren(context, element, map);
  }

}
