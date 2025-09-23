/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.odt2html.convertor.css;

import java.util.Map;

import org.odftoolkit.odfdom.OdfElement;

import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.IConvertor;

public abstract class CSSConvertor implements IConvertor
{

  @SuppressWarnings("unchecked")
  public void convert(ConversionContext context, Object input, Object output)
  {
    OdfElement element = (OdfElement) input;
    Map<String, Map<String, String>> map = (Map<String, Map<String, String>>) output;
    doConvertCSS(context, element, map);
  }

  protected abstract void doConvertCSS(ConversionContext context, OdfElement element, Map<String, Map<String, String>> map);

}
