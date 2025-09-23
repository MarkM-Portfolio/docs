/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.json2ods.sax;

import javax.xml.transform.sax.TransformerHandler;

import com.ibm.symphony.conversion.service.common.ConversionContext;

public interface IConvertor
{
  public void convert(ConversionContext context, TransformerHandler mXMLWriter, Object input, Object output);
  
  public void buildDOMNode(ConversionContext context,TransformerHandler mXMLWriter, Object input, Object output);
}
