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

import com.ibm.symphony.conversion.converter.odt2html.convertor.html.HtmlConvertorUtil;
import com.ibm.symphony.conversion.converter.odt2html.convertor.html.list.ListUtil;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.HtmlCSSConstants;
import com.ibm.symphony.conversion.service.common.ODFConstants;

public class ListLevelStyleImageConvertor extends CSSConvertor
{

  
  @Override
  protected void doConvertCSS(ConversionContext context, OdfElement element, Map<String, Map<String, String>> map)
  {
    parseImageFormat(context, element);
    CSSConvertorUtil.convertChildren(context, element, map);
  }

  @SuppressWarnings("unchecked")
  private void parseImageFormat(ConversionContext context, OdfElement styleElement)
  {
    Map<String, Map<String, String>> cssMap = (Map<String, Map<String, String>>) context.get("CSSStyle");
    OdfElement listStyle = (OdfElement) styleElement.getParentNode();
    String styleName = listStyle.getAttribute(ODFConstants.STYLE_NAME) + "_" + styleElement.getAttribute(ODFConstants.TEXT_LEVEL);
    Map<String, String> styleMap = new HashMap<String, String>();
    String image = styleElement.getAttribute(ODFConstants.XLINK_HREF);
    image = HtmlConvertorUtil.updateImageDirAndCopyImageToDraftFolder(context, image, styleElement);
    styleMap.put(HtmlCSSConstants.WHITE_SPACE, HtmlCSSConstants.PRE);
    styleMap.put(HtmlCSSConstants.CONTENT, "url('" + image + "') \"    \"");
    cssMap.put(ListUtil.generateCssStyleName(styleName), styleMap);
  }
}
