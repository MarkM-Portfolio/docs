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
import org.w3c.dom.Element;

import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.IConvertor;

public abstract class XMLConvertor implements IConvertor
{

  public void convert(ConversionContext context, Object input, Object output)
  {
    Element node = (Element) input;
    OdfElement parent = (OdfElement) output;
    doConvertXML(context, node, parent);
  }

  protected abstract void doConvertXML(ConversionContext context, Element element, OdfElement parent);

}
