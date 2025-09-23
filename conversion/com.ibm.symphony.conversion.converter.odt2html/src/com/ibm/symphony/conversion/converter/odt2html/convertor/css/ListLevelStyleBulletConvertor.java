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

import java.util.HashMap;
import java.util.Map;

import org.odftoolkit.odfdom.OdfElement;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

import com.ibm.symphony.conversion.converter.odt2html.convertor.html.list.ListSymbolUtil;
import com.ibm.symphony.conversion.converter.odt2html.convertor.html.list.ListUtil;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.HtmlCSSConstants;
import com.ibm.symphony.conversion.service.common.ODFConstants;
import com.ibm.symphony.conversion.service.common.g11n.G11NFontFamilyUtil;

public class ListLevelStyleBulletConvertor extends CSSConvertor
{

  @Override
  protected void doConvertCSS(ConversionContext context, OdfElement element, Map<String, Map<String, String>> map)
  {
    parseBulletFormat(context, element, map);
    CSSConvertorUtil.convertChildren(context, element, map);
  }

  @SuppressWarnings("unchecked")
  private void parseBulletFormat(ConversionContext context, OdfElement styleElement, Map<String, Map<String, String>> map)
  {
    String bulletChar = styleElement.getAttribute(ODFConstants.TEXT_BULLET_CHAR);

    Map<String, Map<String, String>> cssMap = (Map<String, Map<String, String>>) context.get("CSSStyle");
    String styleName = CSSConvertorUtil.getStyleName(styleElement);
    Map<String, String> styleMap = new HashMap<String, String>();
    // defect 40617, support text-style on list
    // >>>>>>>>>>>>>>>>>>>>>>>>>>>>
    String textStyleName = styleElement.getAttribute(ODFConstants.TEXT_STYLE_NAME);

    if (textStyleName.length() > 0)
    {
      Map<String, String> textStyleMap = map.get(textStyleName);
      if (textStyleMap != null && textStyleMap.size() > 0)
      {
        styleMap.putAll(textStyleMap);
      }
    }
    // <<<<<<<<<<<<<<<<<<<<<<<
    styleMap.put(HtmlCSSConstants.WHITE_SPACE, HtmlCSSConstants.PRE);

    OdfElement textProperties = null;
    NodeList children = styleElement.getChildNodes();
    for (int i = children.getLength() - 1; i >= 0; i--)
    {
      Node child = children.item(i);
      if (ODFConstants.STYLE_TEXT_PROPERTIES.equals(child.getNodeName()))
      {
        textProperties = (OdfElement) child;
        break;
      }
    }

    String fontName = textProperties == null ? "" : textProperties.getAttribute(ODFConstants.STYLE_FONT_NAME);

    String unicodeStr = ListSymbolUtil.extractToUnicode(bulletChar);

    if (fontName.length() == 0)
    {
      styleMap.put(HtmlCSSConstants.FONT_FAMILY, "\"Times New Roman\",\"Wingdings\",\"OpenSymbol\"");
    }
    else
    {
      Map<String, String> fontMap = CSSConvertorUtil.getFontMap(context);
      String realFontName = fontMap.get(fontName);
      if (realFontName == null)
        realFontName = fontName;
      if ("StarSymbol".equals(realFontName))
        realFontName = "OpenSymbol";

      if (realFontName.equals("OpenSymbol"))
        unicodeStr = ListSymbolUtil.openSymbol2Unicode(bulletChar);

      realFontName = G11NFontFamilyUtil.getFontFamilyWithFallBack(realFontName);
      styleMap.put(HtmlCSSConstants.FONT_FAMILY, realFontName);

    }
    styleMap.put(HtmlCSSConstants.CONTENT, "\"" + unicodeStr + "  \"");

    cssMap.put(ListUtil.generateCssStyleName(styleName), styleMap);
    //add CSS style rules for list items having 'rtl' direction
    //add invisible RLM UCC in order to prevent messing text and bullet in list item with 'rtl' direction
    styleName = styleName.trim() + "." + HtmlCSSConstants.RTL;
    styleMap = new HashMap<String, String>();
    styleMap.put(HtmlCSSConstants.CONTENT, "\"" + unicodeStr + "  \\200F\"");
    cssMap.put(ListUtil.generateCssStyleName(styleName), styleMap);
  }

}
