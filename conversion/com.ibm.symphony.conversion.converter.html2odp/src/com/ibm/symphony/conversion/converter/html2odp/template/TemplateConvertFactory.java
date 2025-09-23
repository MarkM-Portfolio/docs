/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

/**
 * 
 */
package com.ibm.symphony.conversion.converter.html2odp.template;

import java.io.File;

import org.odftoolkit.odfdom.doc.OdfDocument;
import org.w3c.dom.Element;

import com.ibm.symphony.conversion.service.common.ConversionContext;

public class TemplateConvertFactory
{
  /**
   * you can refactor this class.
   */
  private ReplaceStyleXmlConvert convert = new ReplaceStyleXmlConvert();

  private static TemplateConvertFactory factory = new TemplateConvertFactory();

  public static TemplateConvertFactory getConvert()
  {
    return factory;
  }

  public OdfDocument doConvert(File targetFile, OdfDocument presentationDoc, Element body, ConversionContext context) throws Exception
  {
    return convert.doConvert(targetFile, presentationDoc, body, context);
  }
}
