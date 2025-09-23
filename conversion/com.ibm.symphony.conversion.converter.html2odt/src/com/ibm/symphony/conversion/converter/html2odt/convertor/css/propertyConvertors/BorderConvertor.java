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

import org.odftoolkit.odfdom.doc.OdfDocument;
import org.odftoolkit.odfdom.doc.style.OdfStyle;
import org.odftoolkit.odfdom.doc.style.OdfStyleParagraphProperties;
import org.odftoolkit.odfdom.dom.element.OdfStyleBase;
import org.odftoolkit.odfdom.dom.style.OdfStyleFamily;
import org.odftoolkit.odfdom.dom.style.props.OdfParagraphProperties;
import org.odftoolkit.odfdom.type.Color;

import com.ibm.symphony.conversion.converter.html2odt.convertor.css.CSSUtil;
import com.ibm.symphony.conversion.converter.html2odt.convertor.html.XMLConvertorUtil;
import com.ibm.symphony.conversion.service.common.ConversionContext;

public class BorderConvertor extends GeneralCSSPropertyConvertor
{
  
  

  public void convert(ConversionContext context, OdfStyle style, Map<String, String> htmlStyle, String name, String value)
  {
    processJoinBorderAttribute(context, style);
    
    String valueConv = value;
    int start_idx = value.indexOf("rgb");
    if (-1 != start_idx)
    {
      StringBuffer sb = new StringBuffer();
      int end_idx = value.indexOf(")", start_idx);
      String color = Color.toSixDigitHexRGB(value.substring(start_idx, end_idx + 1));
      String prefix = value.substring(0, start_idx);
      prefix = convertBorderWidth(prefix);
      String suffix = value.substring(end_idx + 1);
      suffix = convertBorderWidth(suffix).trim();
      if (!"".equals(prefix))
      {
        sb.append(prefix);
      }
      sb.append(color);
      if (!"".equals(suffix))
      {
        sb.append(" ");
        sb.append(suffix);
      }
      valueConv = sb.toString();
    }
    else
    {
      valueConv = convertBorderWidth(value).trim();
    }

    super.convert(context, style, htmlStyle, name, valueConv);
  }

  public static void processJoinBorderAttribute(ConversionContext context, OdfStyle style)
  {
    String oldStyleName = (String) context.get("oldStyleName");
    if( oldStyleName == null)
    {
      String joinBorder = style.getProperty(OdfParagraphProperties.JoinBorder);
      if(! "false".equals(joinBorder ) )
      {  
        //new create style should set join border as "false" to meet concord effect.
        style.setProperty(OdfParagraphProperties.JoinBorder, "false");
      }
    }
  }

  private String convertBorderWidth(String value)
  {
    StringTokenizer st = new StringTokenizer(value, " ");
    StringBuffer sb = new StringBuffer();
    while (st.hasMoreTokens())
    {
      String temp = st.nextToken();
      temp = CSSUtil.convertBorderValue(temp);
      sb.append(temp);
      sb.append(" ");
    }
    return sb.toString();
  }
}
