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
import org.odftoolkit.odfdom.dom.element.style.StyleMasterPageElement;
import org.w3c.dom.Element;
import org.w3c.dom.NodeList;

import com.ibm.symphony.conversion.converter.html2odt.Constants;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.ODFConstants;

public class HeaderFooterConvertor extends GeneralXMLConvertor
{
  @Override
  protected void doConvertXML(ConversionContext context, Element htmlElement, OdfElement parent)
  {
    OdfElement odfHF = convertElement(context, htmlElement, parent);
    convertChildren(context, htmlElement, odfHF);
  }

  protected OdfElement convertElement(ConversionContext context, Element htmlElement, OdfElement parent)
  {
    OdfElement odfElement = null;

    if (htmlElement.getAttribute("id").equals(Constants.HEADER_DIV))
    {
      NodeList nodes = parent.getElementsByTagName(ODFConstants.STYLE_HEADER);
      
      if (nodes != null && nodes.getLength()>0)
        odfElement = (OdfElement) parent.getElementsByTagName(ODFConstants.STYLE_HEADER).item(0);
      else
        odfElement = ((StyleMasterPageElement) parent).newStyleHeaderElement();
    }
    else
    {
      NodeList nodes = parent.getElementsByTagName(ODFConstants.STYLE_FOOTER);
      if (nodes != null && nodes.getLength()>0)
        odfElement = (OdfElement) parent.getElementsByTagName(ODFConstants.STYLE_FOOTER).item(0);
      else
        odfElement = ((StyleMasterPageElement) parent).newStyleFooterElement();
    }
    return odfElement;
  }

}
