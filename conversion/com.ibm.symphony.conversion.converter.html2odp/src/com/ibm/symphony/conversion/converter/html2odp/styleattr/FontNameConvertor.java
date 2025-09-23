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


public class FontNameConvertor extends GeneralPropertyConvertor
{

  public void convert(ConversionContext context,OdfStyle style, Map<String, String> htmlStyle, String name, String value)
  {
    value = value.trim();
    int index = value.indexOf(",");
    // concord may add several font name separated by ",", only use first one
    if (index > 0)
    {
      value = value.substring(0, index);
    }
    // concord may add "'" before and after the font name
    value = value.replace("\'", "");
    style.setProperty(OdfStyleTextProperties.FontName, value);
    
    // we have decided not to sync the asian/complex fonts with the basic font.
    //style.setProperty(OdfStyleTextProperties.FontNameAsian, value);
    //style.setProperty(OdfStyleTextProperties.FontNameComplex, value);
  }

}
