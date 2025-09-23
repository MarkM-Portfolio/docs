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
import java.util.StringTokenizer;

import org.odftoolkit.odfdom.OdfElement;

import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.HtmlCSSConstants;
import com.ibm.symphony.conversion.service.common.ODFConstants;

public class GraphicPropertiesConvertor extends CSSConvertor
{

  @Override
  protected void doConvertCSS(ConversionContext context, OdfElement element, Map<String, Map<String, String>> map)
  {
    CSSConvertorUtil.parseStyle(context, element, map);
    String styleName = CSSConvertorUtil.getStyleName(element);
    Map<String,String> styleMap = map.get(styleName);
    String hAlign = element.getAttribute(ODFConstants.STYLE_HORIZONTAL_POS);
    if( hAlign.length() > 0)
    {
      if( ! "from-left".equals(hAlign) )
        styleMap.put(HtmlCSSConstants.TEXT_ALIGN, hAlign);
      else
        styleMap.remove(HtmlCSSConstants.TEXT_ALIGN);
    }
    //****************************for defect 10219, will enhance later************************
    String transparency = element.getAttribute(ODFConstants.STYLE_BACKGROUND_TRANSPARENCY);
    if("100%".equals(transparency) && styleMap.containsKey(HtmlCSSConstants.BACKGROUND_COLOR))
    {
      styleMap.put(HtmlCSSConstants.BACKGROUND_COLOR, "transparent"); 
    }
    //****************************************************************************************
    
    String padding = styleMap.get(HtmlCSSConstants.PADDING);
    String paddingTop = styleMap.get(HtmlCSSConstants.PADDING_TOP);
    String paddingRight = styleMap.get(HtmlCSSConstants.PADDING_RIGHT);
    String paddingBottom = styleMap.get(HtmlCSSConstants.PADDING_BOTTOM);
    String paddingLeft = styleMap.get(HtmlCSSConstants.PADDING_LEFT);
    if(padding == null && paddingTop == null && paddingRight == null && paddingBottom == null && paddingLeft == null)
    {
      return;
    }
    
    String border = styleMap.get(HtmlCSSConstants.BORDER);
    if(border != null)
    {
      if(border.contains("none"))
      {
        styleMap.remove(HtmlCSSConstants.PADDING);
        styleMap.remove(HtmlCSSConstants.PADDING_BOTTOM);
        styleMap.remove(HtmlCSSConstants.PADDING_LEFT);
        styleMap.remove(HtmlCSSConstants.PADDING_RIGHT);
        styleMap.remove(HtmlCSSConstants.PADDING_TOP);
        return;
      }
      else
        return;
    }
    
    String borderTop = styleMap.get(HtmlCSSConstants.BORDER_TOP);
    String borderRight = styleMap.get(HtmlCSSConstants.BORDER_RIGHT);
    String borderBottom = styleMap.get(HtmlCSSConstants.BORDER_BOTTOM);
    String borderLeft = styleMap.get(HtmlCSSConstants.BORDER_LEFT);
    
    boolean noBorderTop = (borderTop == null || borderTop.contains("none"));
    boolean noBorderRight = (borderRight == null || borderRight.contains("none"));
    boolean noBorderBottom = (borderBottom == null || borderBottom.contains("none"));
    boolean noBorderLeft = (borderLeft == null || borderLeft.contains("none"));

    if(!noBorderTop && !noBorderRight && !noBorderBottom && !noBorderLeft)
      return;
    
    CSSConvertorUtil.reOrgMarginBorderPadding(styleMap, HtmlCSSConstants.PADDING);
    
    if(noBorderTop)
      styleMap.remove(HtmlCSSConstants.PADDING_TOP);
    if(noBorderRight)
      styleMap.remove(HtmlCSSConstants.PADDING_RIGHT);
    if(noBorderBottom)
      styleMap.remove(HtmlCSSConstants.PADDING_BOTTOM);
    if(noBorderLeft)
      styleMap.remove(HtmlCSSConstants.PADDING_LEFT);
  }

}
