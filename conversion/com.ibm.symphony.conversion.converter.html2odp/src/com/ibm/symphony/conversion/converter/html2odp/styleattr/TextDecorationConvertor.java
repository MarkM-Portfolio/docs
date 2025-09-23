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

public class TextDecorationConvertor extends GeneralPropertyConvertor
{

  public void convert(ConversionContext context,OdfStyle style, Map<String, String> htmlStyle, String name, String value)
  {
    value = value.trim();
    String lowerCaseValue = " " + value.toLowerCase() + " "; // padding spaces are required, do not remove

    if (lowerCaseValue.contains("none"))
    {
      style.setProperty(OdfStyleTextProperties.TextUnderlineStyle, "none");
      style.setProperty(OdfStyleTextProperties.TextOverlineStyle, "none");
      style.setProperty(OdfStyleTextProperties.TextLineThroughStyle, "none");
      style.setProperty(OdfStyleTextProperties.TextBlinking, "false");
      return;
    }

    if (lowerCaseValue.contains("no-underline"))
    {
      style.setProperty(OdfStyleTextProperties.TextUnderlineStyle, "none");
    }
    if (lowerCaseValue.contains("no-overline"))
    {
      style.setProperty(OdfStyleTextProperties.TextOverlineStyle, "none");
    }
    if (lowerCaseValue.contains("no-line-through"))
    {
      style.setProperty(OdfStyleTextProperties.TextLineThroughStyle, "none");
    }

    if (lowerCaseValue.contains(" underline ")) // spaces are required to distinguish from no-underline
    {
      style.setProperty(OdfStyleTextProperties.TextUnderlineStyle, "solid");
      style.setProperty(OdfStyleTextProperties.TextUnderlineWidth, "auto");
      style.setProperty(OdfStyleTextProperties.TextUnderlineColor, "font-color");
    }
    if (lowerCaseValue.contains(" overline ")) // spaces are required to distinguish from no-overline
    {
      style.setProperty(OdfStyleTextProperties.TextOverlineStyle, "solid");
      style.setProperty(OdfStyleTextProperties.TextOverlineWidth, "auto");
      style.setProperty(OdfStyleTextProperties.TextOverlineColor, "font-color");
    }
    if (lowerCaseValue.contains(" line-through ")) // spaces are required to distinguish from no-line-through
    {
      style.setProperty(OdfStyleTextProperties.TextLineThroughStyle, "solid");
    }
    if (lowerCaseValue.contains("blink"))
    {
      style.setProperty(OdfStyleTextProperties.TextBlinking, "true");
    }
  }

}
