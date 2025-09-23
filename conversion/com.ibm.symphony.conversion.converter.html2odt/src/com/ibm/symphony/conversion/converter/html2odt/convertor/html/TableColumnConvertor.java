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
import org.odftoolkit.odfdom.dom.style.OdfStyleFamily;

import org.w3c.dom.Element;
import org.w3c.dom.Node;

import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.ConvertUtil;
import com.ibm.symphony.conversion.service.common.HtmlCSSConstants;
import com.ibm.symphony.conversion.service.common.ODFConstants;

public class TableColumnConvertor extends GeneralXMLConvertor
{
  protected void doConvertXML(ConversionContext context, Element htmlElement, OdfElement parent)
  {
    String htmlRole = htmlElement.getAttribute(HtmlCSSConstants.ROLE);
    if(htmlRole != null && htmlRole.equalsIgnoreCase("rowheader"))
    {
      OdfElement headerCol = getOrAddHeaderCols(context, htmlElement, parent);
      parent = headerCol;
    }
    super.doConvertXML(context, htmlElement, parent);
  }
  protected void convertAttributes(ConversionContext context, Element htmlElement, OdfElement odfElement)
  {
    TableConvertor.convertTableAttributes(context, htmlElement, odfElement, OdfStyleFamily.TableColumn);
  }

  private OdfElement getOrAddHeaderCols(ConversionContext context, Element htmlElement, OdfElement parent)
  {
    Node previousNode = parent.getLastChild();
    if(previousNode != null && previousNode.getNodeName().equals(ODFConstants.TABLE_TABLE_HEADER_COLUMNS))
      return (OdfElement) previousNode;
    
    OdfElement odfElement = XMLConvertorUtil.getCurrentFileDom(context).createElementNS(ConvertUtil.getOdfName(ODFConstants.TABLE_TABLE_HEADER_COLUMNS));
    parent.appendChild(odfElement);
    return odfElement;
  }
}
