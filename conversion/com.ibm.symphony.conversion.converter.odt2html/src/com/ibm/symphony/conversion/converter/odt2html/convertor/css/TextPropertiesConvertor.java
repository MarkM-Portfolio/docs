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

import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.odftoolkit.odfdom.OdfElement;
import org.odftoolkit.odfdom.dom.element.OdfStyleBase;
import org.w3c.dom.Node;

import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.HtmlCSSConstants;
import com.ibm.symphony.conversion.service.common.ODFConstants;
import com.ibm.symphony.conversion.service.common.util.UnitUtil;

public class TextPropertiesConvertor extends CSSConvertor
{
  private static Logger log = Logger.getLogger(TextPropertiesConvertor.class.getName());

  /*
   * "style:text-underline-style":"text-decoration", "style:text-overline-style":"text-decoration",
   * "style:text-line-through-style":"text-decoration",
   */
  @Override
  protected void doConvertCSS(ConversionContext context, OdfElement element, Map<String, Map<String, String>> map)
  {
    OdfElement styleElement = CSSConvertorUtil.getStyleElement(element);
    if( styleElement != null)
    {
      if( ODFConstants.TEXT_LIST_STYLE.equals(styleElement.getNodeName()) )
      {
        return; // don't generate font style for text:list-style in the inplace style map, which is already stored in the css map
      }
      CSSConvertorUtil.parseStyle(context, element, map);
      String styleName = CSSConvertorUtil.getStyleName(styleElement);
      Map<String, String> styleMap = CSSConvertorUtil.getStyleMap(styleName, map);
      
      processFontFamily(context, element, styleName, styleMap);
      processTextDecoration(element, styleMap);
      processSuperSubText(element, styleMap);
      
      if( "true".equals( element.getAttribute(ODFConstants.STYLE_USE_WINDOW_FONT_COLOR) ) )
      {
        CSSConvertorUtil.getAutoColorStyles(context).add(styleName);
      }
      String bgColor = element.getAttribute(ODFConstants.FO_BACKGROUND_COLOR);
      if( bgColor.length() > 0 && ! HtmlCSSConstants.TRANSPARENT.equals(bgColor))
      {
        Set<String> styles = (Set<String>) context.get("BackgroundColorChangedInTextProperties");
        if( styles == null )
        {
          styles = new HashSet<String>();
          context.put("BackgroundColorChangedInTextProperties", styles);
        }
        styles.add(styleName);
        
      }
      
      
    }
  }

  private void processSuperSubText(OdfElement element, Map<String, String> styleMap)
  {
    String textPosition = element.getAttribute(ODFConstants.STYLE_TEXT_POSITION);
    if (textPosition.length() > 0)
    {
      String[] strs = textPosition.split(" ");
      String position = strs[0];
      String fontSize = strs[1];
      int pos = 0;

      if( position.endsWith("%"))
      {  
        try
        {
          pos = Integer.parseInt(position.substring(0, position.length() - 1));
          if( Math.abs(pos) < 30)
            return;
        }
        catch (NumberFormatException e)
        {
        }
      }
      
      if ( pos < 0 || position.equals(HtmlCSSConstants.SUB))
      {
        // negative, means sub.
        styleMap.put(HtmlCSSConstants.VERTICAL_ALIGN, HtmlCSSConstants.SUB);
      }
      else
      {
        styleMap.put(HtmlCSSConstants.VERTICAL_ALIGN, HtmlCSSConstants.SUPER);
      }
      
      String oriFontSize = styleMap.get(HtmlCSSConstants.FONT_SIZE);
      if( oriFontSize == null)
      {
        styleMap.put(HtmlCSSConstants.FONT_SIZE, fontSize);
      }
      else
      {
        styleMap.put(HtmlCSSConstants.FONT_SIZE, UnitUtil.caculateMulWithPercent(oriFontSize, fontSize));
      }
    }
  }

  private void processTextDecoration(OdfElement element, Map<String, String> styleMap)
  {
    String textDecoration = "";

    String styleValue = element.getAttribute(ODFConstants.STYLE_TEXT_LINE_THROUGH_STYLE);
    boolean isNoneDecoration = false;
    if (styleValue.length() > 0)
    {
      if (!"none".equals(styleValue))
      {
        textDecoration += "line-through ";
      }
      else
      {
        isNoneDecoration = true;
      }
    }
    styleValue = element.getAttribute(ODFConstants.STYLE_TEXT_UNDERLINE_STYLE);
    if (styleValue.length() > 0)
    {
      if (!"none".equals(styleValue))
      {
        textDecoration += "underline ";
      }
      else
      {
        isNoneDecoration = true;
      }
    }
    styleValue = element.getAttribute(ODFConstants.STYLE_TEXT_OVERLINE_STYLE);
    if (styleValue.length() > 0)
    {
      if (!"none".equals(styleValue))
      {
        textDecoration += "overline ";
      }
      else
      {
        isNoneDecoration = true;
      }
    }
    styleValue = element.getAttribute(ODFConstants.STYLE_TEXT_BLINKING);
    if (styleValue.length() > 0)
    {
      if ("true".equals(styleValue))
      {
        textDecoration += "blink ";
      }
      else
      {
        isNoneDecoration = true;
      }
    }
    if (textDecoration.length() > 0)
    {
      styleMap.put(HtmlCSSConstants.TEXT_DECORATION, textDecoration);
    }
    else
    {
      if (isNoneDecoration)
      {
        styleMap.put(HtmlCSSConstants.TEXT_DECORATION, "none");
      }
    }
  }
  
  private void processFontFamily(ConversionContext context, OdfElement element, String styleName, Map<String, String> styleMap)
  {
    Node parent = element.getParentNode();
    OdfStyleBase style = null;
    if( parent instanceof OdfStyleBase)
    {
      style = (OdfStyleBase)parent;
    }
    if( style == null)
      return;
    
    if( "default-style_paragraph".equals( styleName) )
    {
      String defaultFontName = element.getAttribute(ODFConstants.STYLE_FONT_NAME);
      if( defaultFontName != null)
        context.put("DefaultFontName", defaultFontName);
      String defaultFontNameAsia = element.getAttribute(ODFConstants.STYLE_FONT_NAME_ASIAN);
      if( defaultFontNameAsia != null)
        context.put("DefaultFontNameAsian", defaultFontNameAsia);
      String defaultFontNameComplex = element.getAttribute(ODFConstants.STYLE_FONT_NAME_COMPLEX);
      if( defaultFontNameComplex != null)
        context.put("DefaultFontNameComplex", defaultFontNameComplex);
    }
    
    try
    {
      String fontFamily = CSSConvertorUtil.getHtmlFontFamily(context, style);
      if(fontFamily!=null && fontFamily.length() > 0 )
        styleMap.put(HtmlCSSConstants.FONT_FAMILY, fontFamily);
      else
        styleMap.remove(HtmlCSSConstants.FONT_FAMILY);

    }
    catch( Exception e)
    {
      log.log(Level.WARNING, e.getMessage(),e);
    }
  }

}
