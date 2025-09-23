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

import org.odftoolkit.odfdom.doc.style.OdfStyle;
import org.odftoolkit.odfdom.doc.style.OdfStyleTextProperties;

import com.ibm.symphony.conversion.service.common.ConversionContext;

public class FontStyleConvertor extends GeneralPropertyConvertor
{

  public void convert(ConversionContext context,OdfStyle style, Map<String, String> htmlStyle, String name, String value)
  {
    if(value.equalsIgnoreCase("bold"))
    {
      style.setProperty(OdfStyleTextProperties.FontWeight, value);
      style.setProperty(OdfStyleTextProperties.FontWeightAsian, value);
      style.setProperty(OdfStyleTextProperties.FontWeightComplex, value);      
    }
    else
    {
      style.setProperty(OdfStyleTextProperties.FontStyle, value);
      style.setProperty(OdfStyleTextProperties.FontStyleAsian, value);
      style.setProperty(OdfStyleTextProperties.FontStyleComplex, value);      
    }
  }
}
