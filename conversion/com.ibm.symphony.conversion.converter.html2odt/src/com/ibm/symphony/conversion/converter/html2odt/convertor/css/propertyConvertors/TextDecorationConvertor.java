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
import java.util.StringTokenizer;

import org.odftoolkit.odfdom.doc.style.OdfStyle;
import org.odftoolkit.odfdom.doc.style.OdfStyleTextProperties;

import com.ibm.symphony.conversion.service.common.ConversionContext;

public class TextDecorationConvertor extends GeneralCSSPropertyConvertor
{

  public void convert(ConversionContext context, OdfStyle style, Map<String, String> htmlStyle, String name, String value)
  {
    String values = value.trim();
    StringTokenizer st = new StringTokenizer(values, " ");
    while (st.hasMoreTokens())
    {
      String aValue = st.nextToken();
      if ("underline".equalsIgnoreCase(aValue))
      {
        style.setProperty(OdfStyleTextProperties.TextUnderlineStyle, "solid");
        style.setProperty(OdfStyleTextProperties.TextUnderlineWidth, "auto");
        style.setProperty(OdfStyleTextProperties.TextUnderlineColor, "font-color");
      }
      else if ("line-through".equalsIgnoreCase(aValue))
      {
        style.setProperty(OdfStyleTextProperties.TextLineThroughStyle, "solid");
      }
      else if ("blink".equalsIgnoreCase(aValue))
      {
        style.setProperty(OdfStyleTextProperties.TextBlinking, "true");
      }
      else if("none".equalsIgnoreCase(aValue))
      {
        style.setProperty(OdfStyleTextProperties.TextUnderlineStyle, "none");
      }
    }
  }
}
