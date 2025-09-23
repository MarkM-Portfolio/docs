/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.json2ods.sax.element;

import javax.xml.transform.sax.TransformerHandler;

import org.odftoolkit.odfdom.OdfElement;

import com.ibm.symphony.conversion.service.common.ConversionContext;

public class NamedExpressionConvertor extends GeneralPreserveConvertor
{
  public void convert(ConversionContext context,TransformerHandler mXmlWriter,Object input, Object output)
  {
    super.convert(context,mXmlWriter, input, output);
    OdfElement parent = (OdfElement)output;
    OdfElement node = (OdfElement)input;
    parent.appendChild(node);
  }
}
