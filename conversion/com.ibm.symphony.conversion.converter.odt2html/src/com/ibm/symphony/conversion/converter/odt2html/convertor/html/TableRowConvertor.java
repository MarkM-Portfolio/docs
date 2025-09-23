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
import org.w3c.dom.NodeList;
import org.w3c.dom.Node;

import com.ibm.symphony.conversion.service.common.ConversionContext;
//import com.ibm.symphony.conversion.service.common.ConvertUtil;
import com.ibm.symphony.conversion.service.common.HtmlCSSConstants;
import com.ibm.symphony.conversion.service.common.ODFConstants;
//import com.ibm.symphony.conversion.service.common.util.UnitUtil;

public class TableRowConvertor extends HtmlConvertor
{
  @Override
  protected void doConvertHtml(ConversionContext context, OdfElement element, Element parent)
  {
    Element tableBody = getTableBody(context, element, parent);

    Element htmlNode = HtmlConvertorUtil.createHtmlElement(context, element, HtmlCSSConstants.TR);
    if(element.getParentNode().getNodeName().equals(ODFConstants.TABLE_TABLE_HEADER_ROWS))
      htmlNode.setAttribute(HtmlCSSConstants.ROLE, "colheader");

    tableBody.appendChild(htmlNode);
    HtmlConvertorUtil.convertAttributes(context, element, htmlNode);
    removeCoveredCell(element);
    HtmlConvertorUtil.convertChildren(context, element, htmlNode);
  }

  private Element getTableBody(ConversionContext context, OdfElement element, Element parent)
  {
    Element tableBody = null;
    Node child = parent.getFirstChild();
    while (child != null && (child instanceof Element))
    {
      if (child.getNodeName().equalsIgnoreCase(HtmlCSSConstants.TBODY))
        return (Element) child;
      child = child.getNextSibling();
    }

    tableBody = HtmlConvertorUtil.createHtmlElement(context, element, HtmlCSSConstants.TBODY);
    parent.appendChild(tableBody);

    return tableBody;
  }

  private void removeCoveredCell(OdfElement element)
  {
    NodeList odfCellChildren = element.getChildNodes();
    for (int i = 0; i < odfCellChildren.getLength(); i++)
    {
      Node cellNode = odfCellChildren.item(i);
      if (cellNode.getNodeName().equals(ODFConstants.TABLE_COVERED_TABLE_CELL))
      {
        element.removeChild(cellNode);
        i--;
      }
    }
  }
}
