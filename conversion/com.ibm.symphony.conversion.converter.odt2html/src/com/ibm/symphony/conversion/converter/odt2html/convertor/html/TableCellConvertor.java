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

import java.util.Map;

import org.odftoolkit.odfdom.OdfElement;
import org.w3c.dom.Element;
import org.w3c.dom.Node;

import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.HtmlCSSConstants;
import com.ibm.symphony.conversion.service.common.ODFConstants;

public class TableCellConvertor extends HtmlConvertor
{

  @Override
  protected void doConvertHtml(ConversionContext context, OdfElement element, Element parent)
  {
    Element htmlNode;
    boolean isInHeaderRow = isInHeaderRow(element);

    if (isInHeaderRow)
      htmlNode = HtmlConvertorUtil.createHtmlElement(context, element, HtmlCSSConstants.TH);
    else
      htmlNode = HtmlConvertorUtil.createHtmlElement(context, element, HtmlCSSConstants.TD);

    parent.appendChild(htmlNode);

    if (isInHeaderRow)
      setHeaderDefaultStyle(context, element);

    HtmlConvertorUtil.convertAttributes(context, element, htmlNode);
    HtmlConvertorUtil.convertChildren(context, element, htmlNode);
  }

  private boolean isInHeaderRow(Node odfNode)
  {
    Node node = odfNode.getParentNode().getParentNode();

    if (node.getNodeName().equals(ODFConstants.TABLE_TABLE_HEADER_ROWS))
      return true;

    return false;
  }

  private void setHeaderDefaultStyle(ConversionContext context, OdfElement element)
  {
    Map<String, Map<String, String>> map = (Map<String, Map<String, String>>) context.get("InplaceStyle");
    String odfCellStyleName = element.getAttribute(ODFConstants.TABLE_STYLE_NAME);
    Map<String, String> styleMap = map.get(odfCellStyleName);
    if (!styleMap.containsKey(HtmlCSSConstants.FONT_WEIGHT))
    {
      styleMap.put(HtmlCSSConstants.FONT_WEIGHT, "normal");
    }
    if (!styleMap.containsKey(HtmlCSSConstants.TEXT_ALIGN))
    {
      styleMap.put(HtmlCSSConstants.TEXT_ALIGN, "left");
    }
  }

}
