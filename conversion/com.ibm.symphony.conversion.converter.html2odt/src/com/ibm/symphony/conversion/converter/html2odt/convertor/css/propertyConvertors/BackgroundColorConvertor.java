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
import org.odftoolkit.odfdom.type.Color;
import org.w3c.dom.Element;
import org.w3c.dom.Node;

import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.HtmlCSSConstants;

public class BackgroundColorConvertor extends GeneralCSSPropertyConvertor
{

  @Override
  public void convert(ConversionContext context, OdfStyle style, Map<String, String> htmlStyle, String name, String value)
  {
    Element htmlElement = (Element) context.get("HtmlElement");
    
    if (!"transparent".equalsIgnoreCase(value) && !"inherit".equalsIgnoreCase(value))//background color may be transparent,do not convert
      value = Color.toSixDigitHexRGB(value);

    if( htmlElement != null)
    {
      
      Node parent = htmlElement.getParentNode();
      if( HtmlCSSConstants.LI.equals(parent.getNodeName()) )
      {
        Element li = (Element) parent;
        String liStyle = li.getAttribute(HtmlCSSConstants.STYLE);
        if( liStyle.indexOf( HtmlCSSConstants.BACKGROUND_COLOR ) == -1)
        {
          style.setProperty( OdfStyleTextProperties.BackgroundColor , value);// set background color for text only.
          return;
        }
        
      }
    }
    
    super.convert(context, style, htmlStyle, name, value);
  }

}
