/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.html2odt.convertor.css.propertyConvertors;

import java.util.Map;

import org.odftoolkit.odfdom.doc.style.OdfStyle;
import org.odftoolkit.odfdom.doc.style.OdfStyleTextProperties;

import com.ibm.symphony.conversion.converter.html2odt.convertor.css.CSSUtil;
import com.ibm.symphony.conversion.service.common.ConversionContext;

public class FontSizeConvertor extends GeneralCSSPropertyConvertor
{

  public void convert(ConversionContext context, OdfStyle style, Map<String, String> htmlStyle, String name, String value)
  {
    value = CSSUtil.convertHtmlStyleValue(OdfStyleTextProperties.FontSize, value);
    style.setProperty(OdfStyleTextProperties.FontSize, value);
    style.setProperty(OdfStyleTextProperties.FontSizeAsian, value);
    style.setProperty(OdfStyleTextProperties.FontSizeComplex, value);
  }

}
