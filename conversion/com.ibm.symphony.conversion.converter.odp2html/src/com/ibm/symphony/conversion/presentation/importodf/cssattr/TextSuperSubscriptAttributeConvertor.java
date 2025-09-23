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
import org.w3c.dom.Element;

import com.ibm.symphony.conversion.presentation.CSSProperties;
import com.ibm.symphony.conversion.presentation.ODPConvertConstants;
import com.ibm.symphony.conversion.presentation.importodf.html.content.AbstractContentHtmlConvertor;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.ConvertUtil;
import com.ibm.symphony.conversion.service.common.HtmlCSSConstants;
import com.ibm.symphony.conversion.service.common.util.Measure;

public class TextSuperSubscriptAttributeConvertor extends AbstractAttributeConvertor
{
//  private static final String CLASS = TextSuperSubscriptAttributeConvertor.class.getName();
//
//  private static final Logger log = Logger.getLogger(CLASS);
  
  @SuppressWarnings("restriction")
  @Override
  public void convertAttribute(ConversionContext context, OdfAttribute attr, Map<String, String> styleMap)
  {
    String textPosition = attr.getNodeValue();
    if (textPosition.length() > 0)
    {
      String[] strs = textPosition.split(" ");
      String position = strs[0];
      String fontSize = strs[1];
      if ("0%".equals(position))
      {
        return; // common text (i.e. neither super or sub script -- Do nothing
      }
      else
      {
        // A negative percentage or a value of "sub" means subscript
        // We will not actually use the % value, since CSS only supports subscript in one position
        if (position.startsWith(ODPConvertConstants.SYMBOL_DASH) || position.equals(HtmlCSSConstants.SUB))
        {
          styleMap.put(HtmlCSSConstants.VERTICAL_ALIGN, HtmlCSSConstants.SUB);
        }
        // A positive percentage or a value of "super" means superscript
        // We will not actually use the % value, since CSS only supports superscript in one position
        else
        {
          styleMap.put(HtmlCSSConstants.VERTICAL_ALIGN, HtmlCSSConstants.SUPER);
        }
        Measure measure = Measure.parseNumber(fontSize);
        if (measure != null && measure.isPercentMeasure())
        {
          fontSize = measure.getNumber() / 100 + Measure.EM;
          
          Element htmlElement = (Element) context.get("htmlElementForSuperSubscript");
          if(htmlElement != null)
          {
        		CSSProperties cp = new CSSProperties(htmlElement.getAttribute(ODPConvertConstants.HTML_ATTR_STYLE), true);
        	    cp.setProperty(ODPConvertConstants.CSS_FONT_SIZE,fontSize);
        	    htmlElement.setAttribute(ODPConvertConstants.HTML_ATTR_STYLE, cp.getPropertiesAsString());	
          }
        }
        styleMap.put(HtmlCSSConstants.FONT_SIZE, fontSize);
      }
    }
  }
}
