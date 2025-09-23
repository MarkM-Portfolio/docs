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

import java.util.HashSet;
import java.util.Map;
import java.util.Set;

import org.odftoolkit.odfdom.doc.style.OdfStyle;
import org.odftoolkit.odfdom.doc.style.OdfStyleTextProperties;

import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.ConvertUtil;
import com.ibm.symphony.conversion.service.common.g11n.G11NFontFamilyUtil;

public class FontFamilyConvertor extends GeneralCSSPropertyConvertor
{
  
  public static Set<String> getFontSet(ConversionContext context)
  {
    Set<String> fontSet = (Set<String>) context.get("fontSet");
    if( fontSet == null)
    {
      fontSet = new HashSet<String>();
      context.put("fontSet", fontSet);
    }
    return fontSet;
  }

  public void convert(ConversionContext context, OdfStyle style, Map<String, String> htmlStyle, String name, String value)
  {
    Set<String> fontSet = getFontSet(context);

    value = value.trim();
    value = value.replace("\'", "");

    int index = value.indexOf(",");
    // concord may add several font name separated by ",", only use first one
    if (index > 0)
    {
      Set<String> asianFonts = G11NFontFamilyUtil.getAsianFontSet();
      Set<String> complexFonts = G11NFontFamilyUtil.getComplexFontSet();
      String[] fontNames = value.split(",");
      String font = null;
      String asianFont = null;
      String complexFont = null;
      
      if(ConvertUtil.CJKLocale.contains(context.get("locale")))
      {
        asianFont = fontNames[0]; // CJK, the first font Name is asian font
        if(fontNames.length > 1)
          font = fontNames[1];
      }
      else
      {
        font = fontNames[0]; // un CJK, the first font Name is western font
        if(fontNames.length > 1)
          asianFont = fontNames[1];
      }
      
      for(String fontName : fontNames)
      {
        fontName = fontName.trim();
        if(font == null || asianFonts.contains(font))
        {
          if( asianFonts != null && !asianFonts.contains(fontName))
            font = fontName;
        }
        if(asianFont == null || !asianFonts.contains(asianFont))
        {
          if( asianFonts != null && asianFonts.contains(fontName))
            asianFont = fontName;
        }
        if( complexFont == null || !complexFonts.contains(complexFont))
        {
          if( complexFonts != null && complexFonts.contains(fontName))
            complexFont = fontName;
        }
        if( font != null && asianFont != null && complexFont != null)
          break;        
      }
      
      if( font == null)
        font = asianFont;
      
      if( asianFont == null)
        asianFont = font;
      
      if( complexFont == null)
        complexFont = font;
      
      style.setProperty(OdfStyleTextProperties.FontName, font);
      style.setProperty(OdfStyleTextProperties.FontNameAsian, asianFont);
      style.setProperty(OdfStyleTextProperties.FontNameComplex, complexFont);
      fontSet.add(font);
      fontSet.add(asianFont);
      fontSet.add(complexFont);
    }
    else
    {
      style.setProperty(OdfStyleTextProperties.FontName, value);
      style.setProperty(OdfStyleTextProperties.FontNameAsian, value);
      style.setProperty(OdfStyleTextProperties.FontNameComplex, value);
      fontSet.add(value);
    }
  }

}
