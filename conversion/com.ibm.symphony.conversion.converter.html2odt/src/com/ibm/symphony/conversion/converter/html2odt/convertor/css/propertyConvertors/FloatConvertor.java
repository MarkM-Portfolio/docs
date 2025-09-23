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
import org.odftoolkit.odfdom.doc.style.OdfStyleGraphicProperties;

import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.ConvertUtil;
import com.ibm.symphony.conversion.service.common.HtmlCSSConstants;
import com.ibm.symphony.conversion.service.common.ODFConstants;

public class FloatConvertor extends GeneralCSSPropertyConvertor
{
  public void convert(ConversionContext context, OdfStyle style, Map<String, String> htmlStyle, String name, String value)
  {
    if (value.toLowerCase().equals("inline"))
      return;
    style.setProperty(OdfStyleGraphicProperties.HorizontalPos, value);
    style.setProperty(OdfStyleGraphicProperties.HorizontalRel, "paragraph");
    style.setProperty(OdfStyleGraphicProperties.VerticalPos, "top");
    style.setProperty(OdfStyleGraphicProperties.VerticalRel, "paragraph");
    style.removeProperty(OdfStyleGraphicProperties.X);
    style.removeProperty(OdfStyleGraphicProperties.Y);
  }
}
