/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.html2odt.convertor.css;

import java.util.Map;

import org.odftoolkit.odfdom.OdfFileDom;
import org.odftoolkit.odfdom.doc.style.OdfStyle;
import org.odftoolkit.odfdom.dom.style.OdfStyleFamily;
import org.w3c.dom.Element;

import com.ibm.symphony.conversion.converter.html2odt.common.CSSGroupStylesUtil;
import com.ibm.symphony.conversion.service.common.ConversionContext;

public class TextStyleConvertor extends GeneralCSSStyleConvertor
{
  public TextStyleConvertor()
  {
    this.odfStyleFamily = OdfStyleFamily.Text;
  }

  @Override
  protected OdfStyle parseStyle(ConversionContext context, OdfFileDom odfDoc, Element htmlElement, String styleName,
      Map<String, String> CSSMap, OdfStyleFamily odfStyleFamily)
  {
    String styleKey = ReusableStyleUtil.generateKey(htmlElement, new String[]{"class"}, CSSMap);
    OdfStyle style = ReusableStyleUtil.getReusableStyle(context, styleKey);
    if( style != null)
    {
      return style;
    }
    else
    {
      if(CSSMap.containsKey("background"))
      {
        CSSGroupStylesUtil.splitGroupStyles(CSSMap, "background", CSSMap.get("background"));
        CSSMap.remove("background");
      }

      style = super.parseStyle(context, odfDoc, htmlElement, styleName, CSSMap, odfStyleFamily);
      ReusableStyleUtil.addReusableStyle(context, styleKey, style);
      return style;
    }
  }
  
  
}
