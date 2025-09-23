/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.html2odp.style;

import java.util.Map;

import org.odftoolkit.odfdom.OdfElement;
import org.odftoolkit.odfdom.dom.style.OdfStyleFamily;
import org.w3c.dom.Element;
import org.w3c.dom.Node;

import com.ibm.symphony.conversion.presentation.ODPConvertConstants;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.ConvertUtil;

public class ParagraphStyleConvertor extends GeneralCSSStyleConvertor
{
  /**
   * Return the ODFStyleFamily for this convert. Default is OdfStyleFamily.Text. Override in the subclasses as needed.
   * 
   * @return OdfStyleFamily
   */
  @Override
  protected OdfStyleFamily getStyleFamily()
  {
    return OdfStyleFamily.Paragraph;
  }
  
  public void convertStyle(ConversionContext context, Element htmlElement, OdfElement odfElement, String styleName,
      Map<String, String> styleMap)
  {
    adjustMarginTop(htmlElement, styleMap);
    super.convertStyle(context, htmlElement, odfElement, styleName, styleMap);
  }
  
  private void adjustMarginTop(Element htmlElement, Map<String, String> styleMap)
  {
    if(styleMap == null)
      return;   
    String marginTop = styleMap.get(ODPConvertConstants.HTML_ATTR_MARGIN_TOP);
    if(marginTop == null)
      return;
    Node prevSibNode = htmlElement.getPreviousSibling();
    if(prevSibNode == null || !(prevSibNode instanceof Element))
    	return;
    String prevHtmlStyle = ((Element) prevSibNode).getAttribute(ODPConvertConstants.HTML_ATTR_STYLE);
    if(prevHtmlStyle == null)
      return;
    Map<String, String> prevHtmlStyleMap = ConvertUtil.buildCSSMap(prevHtmlStyle);
    String prevMarginBottom = prevHtmlStyleMap.get(ODPConvertConstants.HTML_ATTR_MARGIN_BOTTOM);
    if(prevMarginBottom == null)
      return;
    if(prevMarginBottom.endsWith("px") || prevMarginBottom.endsWith("pt"))
    	prevMarginBottom = "0%";
    Double prevMarginBottomD = Double.parseDouble(prevMarginBottom.substring(0, prevMarginBottom.length()-1));
    if(prevMarginBottomD == 0)
      return;
    if(marginTop.endsWith("px") || marginTop.endsWith("pt"))
      marginTop = "0%";
    Double marginTopD = Double.parseDouble(marginTop.substring(0,marginTop.length()-1));
    Double newMarginTopD = marginTopD - prevMarginBottomD;
    if(newMarginTopD < 0)
      return;
    styleMap.put(ODPConvertConstants.HTML_ATTR_MARGIN_TOP, String.valueOf(newMarginTopD)+"%");
    htmlElement.setAttribute(ODPConvertConstants.HTML_ATTR_STYLE, ConvertUtil.convertMapToStyle(styleMap));
  }

  /**
   * Adds any default style values to the Style Type. Default adds nothing. Override in the subclasses as needed.
   * 
   * @param context
   *          Conversion context
   * @param styleMap
   *          Maps of HTML style values
   */
  @Override
  protected void addDefaultValues(ConversionContext context, Map<String, String> styleMap)
  {
    Boolean isDefaultShapeStyle = (Boolean) context.get(ODPConvertConstants.CONTEXT_INSIDE_SVGSHAPE);
    if (isDefaultShapeStyle)
    {
      if (!styleMap.containsKey(ODPConvertConstants.CSS_TEXT_ALIGN))
        styleMap.put(ODPConvertConstants.CSS_TEXT_ALIGN, ODPConvertConstants.ALIGNMENT_CENTER);
    }
  }
}
