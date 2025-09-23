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
import org.w3c.dom.Node;

import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.HtmlCSSConstants;
import com.ibm.symphony.conversion.service.common.ODFConstants;
import com.ibm.symphony.conversion.service.common.indextable.IndexUtil;

public class TableColGroupConvertor extends HtmlConvertor
{
  @SuppressWarnings("restriction")
  @Override
  protected void doConvertHtml(ConversionContext context, OdfElement element, Element parent)
  {

    Element colGroupNode = getOrAddColGroup(context, element, parent);

    int iColRepeat = 1;
    if (element.hasAttribute(ODFConstants.TABLE_COLUMN_REPEAT))
    {
      String colRepeat = element.getAttribute(ODFConstants.TABLE_COLUMN_REPEAT);
      iColRepeat = Integer.valueOf(colRepeat).intValue();
    }

    Node odfParent = element.getParentNode();
    boolean isHeaderCol = (odfParent.getNodeName().equals(ODFConstants.TABLE_TABLE_HEADER_COLUMNS))?true:false;
    for (int i = 0; i < iColRepeat; i++)
    {
      Element htmlNode = HtmlConvertorUtil.createHtmlElement(context, element, HtmlCSSConstants.COL);
      colGroupNode.appendChild(htmlNode);
      if(isHeaderCol)
        htmlNode.setAttribute(HtmlCSSConstants.ROLE, "rowheader");
      HtmlConvertorUtil.convertAttributes(context, element, htmlNode);
    }
  }

  private Element getOrAddColGroup(ConversionContext context, OdfElement element, Element parent)
  {
    Element colGroup = null;
    Node firstChild = parent.getFirstChild();
    if (firstChild == null)
    {
      colGroup = ((Document) context.getTarget()).createElement(HtmlCSSConstants.COLGROUP);
      IndexUtil.getHtmlId(colGroup);
      parent.appendChild(colGroup);
    }
    else
      colGroup = (Element) firstChild;

    return colGroup;
  }

}
