/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.html2odp.styleattr;

import java.util.Map;

import java.lang.Double;

import org.odftoolkit.odfdom.doc.style.OdfStyle;
import org.odftoolkit.odfdom.doc.style.OdfStyleTextProperties;
import org.w3c.dom.Element;

import com.ibm.symphony.conversion.presentation.ODPConvertConstants;
import com.ibm.symphony.conversion.converter.html2odp.style.CSSUtil;
import com.ibm.symphony.conversion.converter.html2odp.util.ContentConvertUtil;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.ConvertUtil;
import com.ibm.symphony.conversion.service.common.util.Measure;

public class FontSizeConvertor extends GeneralPropertyConvertor
{

  public void convert(ConversionContext context, OdfStyle style, Map<String, String> htmlStyle, String name, String value)
  {
    if(value.indexOf(".") != -1)
      value = ConvertUtil.parseFontSizeToString(Double.parseDouble(value));
    
    value += "pt";
    
    style.setProperty(OdfStyleTextProperties.FontSize, value);
    style.setProperty(OdfStyleTextProperties.FontSizeAsian, value);
    style.setProperty(OdfStyleTextProperties.FontSizeComplex, value);
  }

  protected double getRoundedVal(double in)
  {
    double base = Math.floor(in);
    double dec = in - base;

    dec += 0.25;

    if (dec >= 0.5 && dec <= 1.0)
      dec = 0.5;
    else
      dec = Math.floor(dec);

    return (base + dec);
  }
}
