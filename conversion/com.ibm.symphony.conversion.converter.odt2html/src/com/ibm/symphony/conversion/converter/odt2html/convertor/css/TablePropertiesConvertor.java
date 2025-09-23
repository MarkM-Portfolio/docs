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
import com.ibm.symphony.conversion.service.common.HtmlCSSConstants;
import com.ibm.symphony.conversion.service.common.ODFConstants;

public class TablePropertiesConvertor extends ParagraphPropertiesConvertor
{

  @Override
  protected void doConvertCSS(ConversionContext context, OdfElement element, Map<String, Map<String, String>> map)
  {
    super.doConvertCSS(context, element, map);

    String styleName = CSSConvertorUtil.getStyleName(element);
    Map<String, String> styleMap = CSSConvertorUtil.getStyleMap(styleName, map);

    parseTableAlignment(context, element, styleMap);
    parseTableBorderModel(context, element, styleMap);
  }

  private void parseTableBorderModel(ConversionContext context, OdfElement element, Map<String, String> styleMap)
  {
    String borderModel = null;
    if (element.hasAttribute(ODFConstants.TABLE_BORDER_MODEL))
    {
      borderModel = element.getAttribute(ODFConstants.TABLE_BORDER_MODEL);

      if (borderModel != null)
      {
        if (borderModel.equals("separating"))
          borderModel = "separate";
        else if (borderModel.equals("collapsing"))
          borderModel = "collapse";
        
          styleMap.put(HtmlCSSConstants.BORDER_COLLAPSE, borderModel);
      }
    }
  }

  private void parseTableAlignment(ConversionContext context, OdfElement element, Map<String, String> styleMap)
  {
    String alignStyle = null;
    if (element.hasAttribute(ODFConstants.TABLE_ALIGN))
    {
      alignStyle = element.getAttribute(ODFConstants.TABLE_ALIGN);

      if (alignStyle != null)
      {
        if (alignStyle.equals("left")) {
        	if(!styleMap.containsKey(HtmlCSSConstants.MARGIN_LEFT))
        		alignStyle = "0pt";
        	else {
        		String leftMargin = styleMap.get(HtmlCSSConstants.MARGIN_LEFT); 
        		alignStyle = "auto auto auto " + leftMargin;
        		styleMap.remove(HtmlCSSConstants.MARGIN_LEFT);
        	}
        }
        else if (alignStyle.equals("center"))
          alignStyle = "auto";
        else if (alignStyle.equals("right"))
          alignStyle = "auto 0pt auto auto";
        else
          alignStyle = null;

        if (alignStyle != null)
        {
          styleMap.put(HtmlCSSConstants.MARGIN, alignStyle);
        }
      }
    }
  }
}
