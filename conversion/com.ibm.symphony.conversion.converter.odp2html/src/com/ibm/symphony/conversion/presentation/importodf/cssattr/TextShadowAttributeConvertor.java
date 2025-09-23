/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.presentation.importodf.cssattr;

import java.util.Map;

import org.odftoolkit.odfdom.OdfAttribute;

import com.ibm.symphony.conversion.presentation.ODPConvertConstants;
import com.ibm.symphony.conversion.service.common.ConversionContext;

public class TextShadowAttributeConvertor extends AbstractAttributeConvertor
{
  private static String TEXT_SHADOW_VALUE = "0.056em 0.056em ";

  private static String BLACK = "#000000";

  private static String GRAY = "#808080";

  @SuppressWarnings("restriction")
  @Override
  public void convertAttribute(ConversionContext context, OdfAttribute attr, Map<String, String> styleMap)
  {
    String textShadow = attr.getNodeValue();
    if ((textShadow.length() > 0) && (!textShadow.equals(ODPConvertConstants.HTML_VALUE_NONE)))
    {
      // At this point, neither Symphony nor MS Office permit any configuration of the shadowing support for fonts. Basically, all
      // occurrences of text shadowing are with a 1pt displacement horizontally and vertically.
      // So for now (for efficiency), we will force it to 0.056em (1pt / 18).

      String converted = TEXT_SHADOW_VALUE;
      String fontColor = styleMap.get(ODPConvertConstants.CSS_FONT_COLOR);
      if ((fontColor == null) || (fontColor.equals(BLACK)))
      {
        converted += GRAY; // Gray shadowing
      }
      else
      {
        converted += BLACK; // Black shadowing
      }

      styleMap.put(ODPConvertConstants.CSS_TEXT_SHADOW, converted);
    }
  }
}
