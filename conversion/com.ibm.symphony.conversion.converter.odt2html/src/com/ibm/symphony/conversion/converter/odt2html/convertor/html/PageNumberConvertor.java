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
import org.w3c.dom.Text;

import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.HtmlCSSConstants;
import com.ibm.symphony.conversion.service.common.ODFConstants;

public class PageNumberConvertor extends HtmlConvertor
{

  @Override
  protected void doConvertHtml(ConversionContext context, OdfElement element, Element parent)
  {
    Document doc = (Document) context.getTarget();
    Element htmlNode = HtmlConvertorUtil.createHtmlElementWithForceId(context, element, HtmlCSSConstants.SPAN);
    HtmlConvertorUtil.setAttribute(htmlNode,"_src", ODFConstants.TEXT_PAGE_NUMBER,false);
    Text txtChild = doc.createTextNode("#");
    htmlNode.appendChild(txtChild);

    parent.appendChild(htmlNode);
    convertAttributes(context, element, htmlNode);
    HtmlConvertorUtil.addIdToParentSpan(context, element, parent);

  }

  private void convertAttributes(ConversionContext context, OdfElement element, Element htmlNode)
  {
    HtmlConvertorUtil.setAttribute(htmlNode,HtmlCSSConstants.CONTENT_EDITABLE, "false",false);
    HtmlConvertorUtil.setAttribute(htmlNode,HtmlCSSConstants.UNSELECTABLE, "on",false);
    HtmlConvertorUtil.setAttribute(htmlNode,HtmlCSSConstants.CLASS, "ODT_PN",false);

    HtmlConvertorUtil.convertAttributes(context, element, htmlNode);
  }

}
