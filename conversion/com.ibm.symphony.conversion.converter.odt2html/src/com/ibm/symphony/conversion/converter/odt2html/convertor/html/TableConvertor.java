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
import com.ibm.symphony.conversion.service.common.HtmlCSSConstants;
import com.ibm.symphony.conversion.service.common.ODFConstants;

public class TableConvertor extends HtmlConvertor
{
  @SuppressWarnings("restriction")
  @Override
  protected void doConvertHtml(ConversionContext context, OdfElement element, Element parent)
  {
    if(!element.hasChildNodes())
      return;

    Element htmlNode = HtmlConvertorUtil.createHtmlElement(context, element, HtmlCSSConstants.TABLE);

    HtmlConvertorUtil.setAttribute(htmlNode,HtmlCSSConstants.CELL_SPACING, "0px",false);

    parseTableName(context, element, htmlNode);

    String tableStyleName = element.getAttribute(ODFConstants.TABLE_STYLE_NAME);
    HtmlConvertorUtil.generatePageBreak(context, tableStyleName, element, htmlNode, parent);

    parent.appendChild(htmlNode);
    HtmlConvertorUtil.convertAttributes(context, element, htmlNode);
    parent = htmlNode;

    HtmlConvertorUtil.convertChildren(context, element, htmlNode);
  }

  @SuppressWarnings("restriction")
  private static void parseTableName(ConversionContext context, OdfElement element, Element htmlNode)
  {
    if (element.hasAttribute(ODFConstants.TABLE_NAME))
    {
      String tableName = element.getAttribute(ODFConstants.TABLE_NAME);
      HtmlConvertorUtil.setAttribute(htmlNode,HtmlCSSConstants.NAME, tableName);
    }
  }
}
