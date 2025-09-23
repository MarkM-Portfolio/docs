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

import java.util.HashMap;
import java.util.Map;

public class CSSPropertyConvertorFactory
{

  private static CSSPropertyConvertorFactory instance = new CSSPropertyConvertorFactory();

  private static ICSSPropertyConvertor GENERAL_CSS_CONVERTOR = new GeneralCSSPropertyConvertor();

  private static Map<String, ICSSPropertyConvertor> convertorMap = new HashMap<String, ICSSPropertyConvertor>();
  static
  {
    // add Convertors here
    convertorMap.put("font-size", GENERAL_CSS_CONVERTOR);
    convertorMap.put("background-color", new BackgroundColorConvertor());
    convertorMap.put("color", GENERAL_CSS_CONVERTOR);
    convertorMap.put("text-shadow", GENERAL_CSS_CONVERTOR);
    convertorMap.put("font-style", GENERAL_CSS_CONVERTOR);
    convertorMap.put("font-weight", GENERAL_CSS_CONVERTOR);
    convertorMap.put("font-variant", GENERAL_CSS_CONVERTOR);
    convertorMap.put("text-transform", GENERAL_CSS_CONVERTOR);
    
    convertorMap.put("font-name", new FontNameConvertor());
    convertorMap.put("font-family", new FontFamilyConvertor());
    convertorMap.put("text-decoration", new TextDecorationConvertor());
    convertorMap.put("vertical-align", new VerticalAlignConvertor());
    convertorMap.put("font-size", new FontSizeConvertor());
    convertorMap.put("font-style", new FontStyleConvertor());
    convertorMap.put("font-weight", new FontWeightConvertor());
    convertorMap.put("padding", new PaddingConvertor());
    convertorMap.put("margin", new MarginConvertor());
    convertorMap.put("border", new BorderConvertor());
    convertorMap.put("border-top", new BorderConvertor());
    convertorMap.put("border-bottom", new BorderConvertor());
    convertorMap.put("border-left", new BorderConvertor());
    convertorMap.put("border-right", new BorderConvertor());
    convertorMap.put("border-width", new BorderWidthStyleColorConvertor());
    convertorMap.put("border-style", new BorderWidthStyleColorConvertor());
    convertorMap.put("border-color", new BorderWidthStyleColorConvertor());
    convertorMap.put("padding", new PaddingConvertor());
    convertorMap.put("float", new FloatConvertor());
  }

  public static CSSPropertyConvertorFactory getInstance()
  {
    return instance;
  }

  public ICSSPropertyConvertor getConvertor(String htmlCSSProperty)
  {
    ICSSPropertyConvertor convertor = convertorMap.get(htmlCSSProperty);
    if (convertor != null)
      return convertor;
    return GENERAL_CSS_CONVERTOR;
  }
}
