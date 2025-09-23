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
import com.ibm.symphony.conversion.service.common.ODFConstants;

public class TextSequenceConvertor extends HtmlConvertor
{

  @Override
  protected void doConvertHtml(ConversionContext context, OdfElement element, Element parent)
  {
    Document doc = (Document) context.getTarget();

    Element htmlNode = HtmlConvertorUtil.createHtmlElementWithForceId(context, element, HtmlCSSConstants.SPAN);
    HtmlConvertorUtil.setAttribute(htmlNode,"_src", ODFConstants.TEXT_SEQUENCE,false);
    parent.appendChild(htmlNode);
    convertAttributes(context, element, htmlNode);
    HtmlConvertorUtil.addIdToParentSpan(context, element, parent);
    HtmlConvertorUtil.convertChildren(context, element, htmlNode);
  }

  private void convertAttributes(ConversionContext context, OdfElement element, Element htmlNode)
  {
    HtmlConvertorUtil.setAttribute(htmlNode,HtmlCSSConstants.CONTENT_EDITABLE, "false",false);
    HtmlConvertorUtil.setAttribute(htmlNode,HtmlCSSConstants.UNSELECTABLE, "on",false);
    
    String sequenceStyle = "TS_STYLE_" + htmlNode.getAttribute("id");
    
    HtmlConvertorUtil.setAttribute(htmlNode,HtmlCSSConstants.CLASS, "ODT_TS " + sequenceStyle);

    HtmlConvertorUtil.convertAttributes(context, element, htmlNode);
  }

}
