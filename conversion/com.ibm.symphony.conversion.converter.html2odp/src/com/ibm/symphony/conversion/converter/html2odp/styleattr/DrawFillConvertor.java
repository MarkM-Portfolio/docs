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
import org.odftoolkit.odfdom.doc.style.OdfStyleGraphicProperties;
import org.odftoolkit.odfdom.type.Color;

import com.ibm.symphony.conversion.presentation.ODPConvertConstants;
import com.ibm.symphony.conversion.service.common.ConversionContext;

public class DrawFillConvertor extends GeneralPropertyConvertor
{
  public void convert(ConversionContext context, OdfStyle style, Map<String, String> htmlStyle, String name, String value)
  {
    if (value == null || value.equals(ODPConvertConstants.CSS_VALUE_TRANSPARENT))
    {
      style.setProperty(OdfStyleGraphicProperties.Fill, ODPConvertConstants.HTML_VALUE_NONE);
    }
    else
    {
      style.setProperty(OdfStyleGraphicProperties.Fill, ODPConvertConstants.CSS_VALUE_SOLID);
      style.setProperty(OdfStyleGraphicProperties.FillColor, Color.toSixDigitHexRGB(value));
      //style.setProperty(OdfStyleGraphicProperties.Repeat, ODPConvertConstants.CSS_VALUE_REPEAT);
    }
  }

}
