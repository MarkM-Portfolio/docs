/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.html2odt.convertor.html;

import org.odftoolkit.odfdom.OdfElement;
import org.odftoolkit.odfdom.OdfFileDom;
import org.odftoolkit.odfdom.dom.style.OdfStyleFamily;

import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.ODFConstants;
import com.ibm.symphony.conversion.service.common.util.TableConvertorUtil;

public class TableRowConvertor extends GeneralXMLConvertor
{
  protected void doConvertXML(ConversionContext context, Element htmlElement, OdfElement parent)
  {
    OdfElement newParent = parent;
    OdfFileDom contentDom = XMLConvertorUtil.getCurrentFileDom(context);
    newParent = parseHeaderRow(context, contentDom, htmlElement, parent);
    super.doConvertXML(context, htmlElement, newParent);
  }

  protected void convertAttributes(ConversionContext context, Element htmlElement, OdfElement odfElement)
  {
    TableConvertor.convertTableAttributes(context, htmlElement, odfElement, OdfStyleFamily.TableRow);
  }

  protected void convertChildren(ConversionContext context, Element htmlElement, OdfElement odfElement)
  {
    NodeList tdChilden = htmlElement.getChildNodes();
    if (tdChilden != null && tdChilden.getLength() == 1)
    {
      Element firsTD = (Element) tdChilden.item(0);
      String idAttr = firsTD.getAttribute("id");
      if (idAttr == null || idAttr.length() == 0)
        htmlElement.removeChild(firsTD);
    }

    super.convertChildren(context, htmlElement, odfElement);
  }

  private OdfElement parseHeaderRow(ConversionContext context, OdfFileDom contentDom, Element htmlElement, OdfElement parent)
  {
    if (TableConvertorUtil.isHeaderRow(htmlElement))
    {
      Node lastNode = parent.getLastChild();
      if (lastNode == null || !lastNode.getNodeName().equalsIgnoreCase(ODFConstants.TABLE_TABLE_HEADER_ROWS))
      {
        Node newHeaderRow = TableConvertorUtil.newHeaderRowNode(contentDom);
        parent.appendChild(newHeaderRow);
        return (OdfElement) newHeaderRow;
      }
      return (OdfElement) lastNode;
    }
    return parent;
  }
}
