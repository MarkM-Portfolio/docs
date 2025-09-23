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

public class ScriptConvertor extends GeneralCSSPropertyConvertor
{

  public void convert(ConversionContext context, OdfStyle style, Map<String, String> htmlStyle, String name, String value)
  {
    String fontSize = htmlStyle.get("font-size");
    StringBuffer odfValue = new StringBuffer();
    if("sub".equalsIgnoreCase(value)){
      odfValue.append("sub");
    }
    else {
      odfValue.append("super");
    }
    odfValue.append(" ");
    odfValue.append(fontSize);
    style.setProperty(OdfStyleTextProperties.TextPosition, odfValue.toString());
  }

}
