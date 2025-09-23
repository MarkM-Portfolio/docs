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
import org.odftoolkit.odfdom.doc.style.OdfStyleParagraphProperties;
import org.odftoolkit.odfdom.dom.style.OdfStyleFamily;
import org.odftoolkit.odfdom.dom.style.props.OdfStyleProperty;

import com.ibm.symphony.conversion.converter.html2odt.convertor.css.CSSUtil;
import com.ibm.symphony.conversion.service.common.ConversionContext;

public class PaddingConvertor extends GeneralCSSPropertyConvertor
{

  public void convert(ConversionContext context, OdfStyle style, Map<String, String> htmlStyle, String name, String value)
  {
		if(!value.contains(" "))
		{
			super.convert(context, style, htmlStyle, name, value);
			return;
		}
		
    StringTokenizer st = new StringTokenizer(value, " ");
    int i = 0;

    OdfStyleProperty paddingTop = CSSUtil.getODFStyleProperty(style.getFamily(), "fo:padding-top");
    OdfStyleProperty paddingBottom = CSSUtil.getODFStyleProperty(style.getFamily(), "fo:padding-bottom");
    OdfStyleProperty paddingRight = CSSUtil.getODFStyleProperty(style.getFamily(), "fo:padding-right");
    OdfStyleProperty paddingLeft = CSSUtil.getODFStyleProperty(style.getFamily(), "fo:padding-left");

    while (st.hasMoreTokens())
    {
      i++;
      String subV = st.nextToken();
      if (subV.toLowerCase().indexOf("px") == (subV.length() - 2))
      {
        if (0 == Integer.parseInt(subV.substring(0, subV.length() - 2)))
        {// sub margin value == 0
          continue;
        }
        // if unit is px, convert to inch
        subV = CSSUtil.convertPXToIN(subV);
      }
      switch (i)
        {
          case 1 :
            style.setProperty(paddingTop, subV);
            style.setProperty(paddingBottom, subV);
            style.setProperty(paddingRight, subV);
            style.setProperty(paddingLeft, subV);
            break;
          case 2 :
            style.setProperty(paddingRight, subV);
            style.setProperty(paddingLeft, subV);
            break;
          case 3 :
            style.setProperty(paddingBottom, subV);
            break;
          case 4 :
            style.setProperty(paddingLeft, subV);
            break;
        }
    }
  }
}
