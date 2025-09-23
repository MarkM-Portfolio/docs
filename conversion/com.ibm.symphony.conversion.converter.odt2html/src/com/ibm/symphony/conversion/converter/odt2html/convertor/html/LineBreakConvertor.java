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

import org.odftoolkit.odfdom.OdfElement;

import org.w3c.dom.Element;

import com.ibm.symphony.conversion.service.common.ConversionContext;

public class LineBreakConvertor extends GeneralHtmlConvertor
{

  @Override
  protected void convertAttributes(ConversionContext context, OdfElement element, Element htmlNode)
  {
    super.convertAttributes(context, element, htmlNode);    
    HtmlConvertorUtil.setAttribute(htmlNode,"type", "lb",false);
  }
}
