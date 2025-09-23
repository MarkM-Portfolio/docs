/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.odt2html.convertor.html;

import java.util.HashMap;

import org.odftoolkit.odfdom.OdfElement;
import org.w3c.dom.Element;

import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.ODFConstants;

public class TOCEntryTemplateConvertor extends GeneralHtmlConvertor
{
  public static HashMap<String, String> map = new HashMap<String, String>();
  
  @Override
  protected void doConvertHtml(ConversionContext context, OdfElement element, Element parent)
  {
    String outlineLevel = element.getAttribute(ODFConstants.TEXT_OUTLINE_LEVEL);
    String styleName = element.getAttribute(ODFConstants.TEXT_STYLE_NAME);
    map.put(styleName, outlineLevel);
  }
}
