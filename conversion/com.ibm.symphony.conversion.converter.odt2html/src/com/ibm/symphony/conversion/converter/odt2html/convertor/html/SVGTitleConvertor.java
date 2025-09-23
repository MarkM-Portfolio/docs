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
import org.w3c.dom.Node;

import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.HtmlCSSConstants;

public class SVGTitleConvertor extends HtmlConvertor
{

  @Override
  protected void doConvertHtml(ConversionContext context, OdfElement element, Element parent)
  {
    Node htmlNode = parent.getLastChild();
    while(htmlNode != null)
    {
      if(HtmlCSSConstants.IMG.equals(htmlNode.getNodeName()))
      {
        HtmlConvertorUtil.setAttribute(((Element) htmlNode),HtmlCSSConstants.ALT, element.getTextContent());
      }
      htmlNode = htmlNode.getPreviousSibling();
    }
  }

}
