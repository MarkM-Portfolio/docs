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

import com.ibm.symphony.conversion.service.common.ConversionContext;

public class VerticalAlignConvertor extends GeneralCSSPropertyConvertor
{

  public void convert(ConversionContext context, OdfStyle style, Map<String, String> htmlStyle, String name, String value)
  {
    StringBuffer odfValue = new StringBuffer();
    if ("sub".equalsIgnoreCase(value) || "super".equalsIgnoreCase(value))
    {
      odfValue.append(value.toLowerCase());
      odfValue.append(" 58%");
      style.setProperty(OdfStyleTextProperties.TextPosition, odfValue.toString());
    }
    else
    {
      super.convert(context, style, htmlStyle, name, value);
    }
  }
}
