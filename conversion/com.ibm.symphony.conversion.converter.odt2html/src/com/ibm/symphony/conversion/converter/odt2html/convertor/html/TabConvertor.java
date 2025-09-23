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
import org.w3c.dom.Document;
import org.w3c.dom.Element;

import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.HtmlCSSConstants;

public class TabConvertor extends HtmlConvertor
{

  @Override
  protected void doConvertHtml(ConversionContext context, OdfElement element, Element parent)
  {
    Document doc = (Document) context.getTarget();
    Element htmlNode = HtmlConvertorUtil.createHtmlElement(context, element, HtmlCSSConstants.IMG);
    HtmlConvertorUtil.setAttribute(htmlNode,"class", "ConcordTab",false);
    HtmlConvertorUtil.setAttribute(htmlNode,"style", "height: 0; width: 1.25cm;",false);
    parent.appendChild(htmlNode);
  }

}
