/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.html2odp.styleattr;

import java.util.Map;
import java.util.Set;

import org.odftoolkit.odfdom.doc.style.OdfStyle;
import org.odftoolkit.odfdom.doc.style.OdfStyleTextProperties;

import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.ConvertUtil;
import com.ibm.symphony.conversion.service.common.g11n.G11NFontFamilyUtil;


public class FontFamilyConvertor extends GeneralPropertyConvertor
{
  
  public void convert(ConversionContext context,OdfStyle style, Map<String, String> htmlStyle, String name, String value)
  {
    value = value.trim();
    value = value.replace("\'", "");

    int index = value.indexOf(",");
    // concord may add several font name separated by ",", order is based on locale
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
      }
      else
        font = fontNames[0]; // un CJK, the first font Name is western font
      
      for(String fontName : fontNames)
      {
        fontName = fontName.trim();
        if(font == null)
        {
          if( asianFonts != null && !asianFonts.contains(fontName))
            font = fontName;
        }
        if(asianFont == null)
        {
          if( asianFonts != null && asianFonts.contains(fontName))
            asianFont = fontName;
        }
        if( complexFont == null)
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
      
      style.setProperty(OdfStyleTextProperties.FontFamily, font);
      style.setProperty(OdfStyleTextProperties.FontFamilyAsian, asianFont);
      style.setProperty(OdfStyleTextProperties.FontFamilyComplex, complexFont);
    }
    else
    {
      style.setProperty(OdfStyleTextProperties.FontFamily, value);
      style.setProperty(OdfStyleTextProperties.FontFamilyAsian, value);
      style.setProperty(OdfStyleTextProperties.FontFamilyComplex, value);
    }
  }
}
