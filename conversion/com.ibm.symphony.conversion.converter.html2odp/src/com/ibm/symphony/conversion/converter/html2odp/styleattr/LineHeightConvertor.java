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
import java.util.logging.Level;

import org.odftoolkit.odfdom.doc.style.OdfStyle;
import org.odftoolkit.odfdom.doc.style.OdfStyleParagraphProperties;

import com.ibm.symphony.conversion.presentation.ODPCommonUtil;
import com.ibm.symphony.conversion.service.common.ConversionContext;

public class LineHeightConvertor extends GeneralPropertyConvertor
{
  // private static final String CLASS = LineHeightConvertor.class.getName();

  // private static final Logger log = Logger.getLogger(CLASS);

  public void convert(ConversionContext context, OdfStyle style, Map<String, String> htmlStyle, String name, String value)
  {
    // First determine if the value is already a %. If so, that can convert as-is
    if (value.endsWith("%"))
    {
      style.setProperty(OdfStyleParagraphProperties.LineHeight, value);
      return;
    }

    // Next check if line height is specified in pt, px, em, or cm
    // Note: this is not expected and will be logged and ignored.
    if (value.endsWith("pt") || value.endsWith("px") || value.endsWith("em") || value.endsWith("cm"))
    {
      String message = ODPCommonUtil.createMessage(ODPCommonUtil.LOG_INVALID_LINE_HEIGHT, value);
      ODPCommonUtil.logMessage(Level.WARNING, message);
      return;
    }

    // Finally determine if the value is just a number. If so, that needs to
    // be converted to a %.
    try
    {
      double dNumber = Double.parseDouble(value);
      style.setProperty(OdfStyleParagraphProperties.LineHeight, dNumber * 100 + "%");
    }
    catch (NumberFormatException nfe)
    { // "normal" - set as is
      style.setProperty(OdfStyleParagraphProperties.LineHeight, value);
    }
  }
}
