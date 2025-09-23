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

import java.util.Map;

import org.odftoolkit.odfdom.OdfElement;

import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.HtmlCSSConstants;
import com.ibm.symphony.conversion.service.common.ODFConstants;

public class SectionPropertiesConvertor extends GeneralCSSConvertor
{
  @Override
  public void doConvertCSS(ConversionContext context, OdfElement element, Map<String, Map<String, String>> map)
  {
    String styleName = CSSConvertorUtil.getStyleName(element);
    Map<String,String> styleMap = map.get(styleName);
    String backgroundColor = element.getAttribute(ODFConstants.FO_BACKGROUND_COLOR);
    if(backgroundColor.length()>0 && !backgroundColor.equals("transparent"))
    {
      styleMap.put(HtmlCSSConstants.BACKGROUND_COLOR, backgroundColor);
    }
  }
}
