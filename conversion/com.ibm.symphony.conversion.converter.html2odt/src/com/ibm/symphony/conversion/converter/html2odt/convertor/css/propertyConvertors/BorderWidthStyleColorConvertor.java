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
import org.odftoolkit.odfdom.dom.style.props.OdfStyleProperty;

import com.ibm.symphony.conversion.converter.html2odt.convertor.css.CSSUtil;
import com.ibm.symphony.conversion.service.common.ConversionContext;

public class BorderWidthStyleColorConvertor extends GeneralCSSPropertyConvertor
{
  public void convert(ConversionContext context, OdfStyle style, Map<String, String> htmlStyle, String name, String value)
  {
    if (context.get("curStyle") == null || context.get("curStyle").hashCode() != style.hashCode())
    {
      BorderConvertor.processJoinBorderAttribute(context, style);
      context.put("curStyle", style);
      // default value: 0.0008in solid #000000
      String[] borderWidthArray = { "0.0008in", "0.0008in", "0.0008in", "0.0008in" };
      String[] borderStyleArray = { "solid", "solid", "solid", "solid" };
      String[] borderColorArray = { "#000000", "#000000", "#000000", "#000000" };
      CSSUtil.convertBorderValues(htmlStyle, "border-width", borderWidthArray);
      CSSUtil.convertBorderValues(htmlStyle, "border-style", borderStyleArray);
      CSSUtil.convertBorderValues(htmlStyle, "border-color", borderColorArray);
      String borderTop = CSSUtil.getShorthandValue(borderWidthArray, borderStyleArray, borderColorArray, 0);
      String borderRight = CSSUtil.getShorthandValue(borderWidthArray, borderStyleArray, borderColorArray, 1);
      String borderBottom = CSSUtil.getShorthandValue(borderWidthArray, borderStyleArray, borderColorArray, 2);
      String borderLeft = CSSUtil.getShorthandValue(borderWidthArray, borderStyleArray, borderColorArray, 3);

      OdfStyleProperty boderProperty = CSSUtil.getODFStyleProperty(style.getFamily(), "fo:border");
      OdfStyleProperty boderTopProperty = CSSUtil.getODFStyleProperty(style.getFamily(), "fo:border-top");
      OdfStyleProperty boderBottomProperty = CSSUtil.getODFStyleProperty(style.getFamily(), "fo:border-bottom");
      OdfStyleProperty boderRightProperty = CSSUtil.getODFStyleProperty(style.getFamily(), "fo:border-right");
      OdfStyleProperty boderLeftProperty = CSSUtil.getODFStyleProperty(style.getFamily(), "fo:border-left");

      int borderTopHashCode = borderTop.hashCode();
      if (borderTopHashCode == borderRight.hashCode() && borderTopHashCode == borderBottom.hashCode()
          && borderTopHashCode == borderLeft.hashCode())
      {
        style.setProperty(boderProperty, borderTop);
        return;
      }
      style.setProperty(boderTopProperty, borderTop);
      style.setProperty(boderRightProperty, borderRight);
      style.setProperty(boderBottomProperty, borderBottom);
      style.setProperty(boderLeftProperty, borderLeft);
    }
  }
}
