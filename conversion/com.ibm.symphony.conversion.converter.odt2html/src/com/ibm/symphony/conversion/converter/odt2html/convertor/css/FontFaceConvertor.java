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
import com.ibm.symphony.conversion.service.common.ODFConstants;

public class FontFaceConvertor extends CSSConvertor
{

  @Override
  protected void doConvertCSS(ConversionContext context, OdfElement element, Map<String, Map<String, String>> map)
  {
    String fontName = element.getAttribute(ODFConstants.STYLE_NAME);
    if(! "".equals(fontName))
    {
      Map<String, String> fontMap = CSSConvertorUtil.getFontMap(context);
      fontMap.put(fontName, element.getAttribute(ODFConstants.SVG_FONT_FAMILY));
    }
  }

  
}
