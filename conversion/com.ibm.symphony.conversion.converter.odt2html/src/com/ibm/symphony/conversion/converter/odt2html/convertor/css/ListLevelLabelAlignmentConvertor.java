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
import org.odftoolkit.odfdom.type.Length.Unit;

import com.ibm.symphony.conversion.converter.odt2html.convertor.html.list.ListUtil;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.ConvertUtil;
import com.ibm.symphony.conversion.service.common.HtmlCSSConstants;
import com.ibm.symphony.conversion.service.common.ODFConstants;
import com.ibm.symphony.conversion.service.common.util.UnitUtil;

public class ListLevelLabelAlignmentConvertor extends CSSConvertor
{

  @Override
  protected void doConvertCSS(ConversionContext context, OdfElement element, Map<String, Map<String, String>> map)
  {
    String styleName = CSSConvertorUtil.getStyleName(element);
    Map<String, Map<String, String>> cssMap = (Map<String, Map<String, String>>) context.get("CSSStyle");
    Map<String, String> cssStyle = cssMap.get(ListUtil.generateCssStyleName(styleName));
    
    String marginLeft = element.getAttribute(ODFConstants.FO_MARGIN_LEFT);
    String textIndent = element.getAttribute(ODFConstants.FO_TEXT_INDENT);
    Map<String, String> styleMap = CSSConvertorUtil.getStyleMap(styleName, map);
    if (marginLeft.length() > 0)
    {
    	if(UnitUtil.getUnit(marginLeft).toLowerCase().equals(Unit.INCH.abbr()))
    		marginLeft = UnitUtil.convertINToCM(marginLeft);
    	styleMap.put(HtmlCSSConstants.MARGIN_LEFT, marginLeft);
    }
    else
    {
      styleMap.put(HtmlCSSConstants.MARGIN_LEFT, "0cm");

    }
    
    if (textIndent.length() > 0)
    {
    	if(UnitUtil.getUnit(textIndent).toLowerCase().equals(Unit.INCH.abbr()))
    		textIndent = UnitUtil.convertINToCM(textIndent);
    	styleMap.put(HtmlCSSConstants.TEXT_INDENT, textIndent);
    }
    else
    {
      styleMap.put(HtmlCSSConstants.TEXT_INDENT, "0cm");
    }
    CSSConvertorUtil.convertChildren(context, element, map);
    

    if( cssStyle != null)
    {
      //cssStyle.put(HtmlCSSConstants.DISPLAY, HtmlCSSConstants.BLOCK);
      //cssStyle.put(HtmlCSSConstants.FLOAT, "left");
      /*
      String tabStop = element.getAttribute("text:list-tab-stop-position");
        
      if( tabStop.length() > 0 )
      {
                    
        if( marginLeft.length() > 0)
        {
          if( marginLeft.startsWith("-") )
          {
            tabStop = ConvertUtil.addLength(tabStop, marginLeft.substring(1));
          }
          else
          {
            tabStop = ConvertUtil.addLength(tabStop,  "-" + marginLeft);
          }
        } 
        if( textIndent.length() > 0)
        {
          if( textIndent.startsWith("-") )
          {
            tabStop = ConvertUtil.addLength(tabStop, textIndent.substring(1));
          }
          else
          {
            tabStop = ConvertUtil.addLength(tabStop,  "-" + textIndent);
          }
        }
        
      }
      else
      {
        if( textIndent.startsWith("-") )
        {
          tabStop = textIndent.substring(1);
        }
        else
        {
          tabStop = "0.741cm";
        }
      }
      if (tabStop.length() > 0)
      {
        if(UnitUtil.getUnit(tabStop).toLowerCase().equals(Unit.INCH.abbr()))
          tabStop = UnitUtil.convertINToCM(tabStop);
         
      }
      
      cssStyle.put(HtmlCSSConstants.WIDTH, tabStop);
      */
    }
    
   
    generateCssPostionStyles(context, styleName, cssMap, map);
       
  }
  
  private void generateCssPostionStyles(ConversionContext context, String styleName, Map<String, Map<String, String>> cssMap, Map<String, Map<String, String>> map )
  {
    String posStyleName = ListUtil.generateCssPostionStyleName(styleName);
    if(! cssMap.containsKey(posStyleName) )
    {
      cssMap.put(posStyleName, new HashMap<String,String>());
    }
    Map<String,String> posStyle = cssMap.get(posStyleName);
    Map<String,String> styleMap = map.get(styleName);
    
    String marginLeft = styleMap.get(HtmlCSSConstants.MARGIN_LEFT);
    String textIndent = styleMap.get(HtmlCSSConstants.TEXT_INDENT);
    if(!styleName.endsWith("_1")) //next after first level.
    {
      int idx = styleName.lastIndexOf('_');
      int level = Integer.parseInt( styleName.substring(idx+1) );
      String prevStyleName = styleName.substring(0, idx+1) + (level - 1); 
      
      Map<String, String> prevStyleMap = map.get(prevStyleName);
      if( prevStyleMap != null)
      {
        String prevMarginLeft = prevStyleMap.get(HtmlCSSConstants.MARGIN_LEFT);
        if( prevMarginLeft != null)
        {
          if( prevMarginLeft.startsWith("-") )
          {
            marginLeft = ConvertUtil.addLength(marginLeft, prevMarginLeft.substring(1));
          }
          else
          {
            marginLeft = ConvertUtil.addLength(marginLeft,  "-" + prevMarginLeft);
          }
        }
      }
    }
    posStyle.put(HtmlCSSConstants.TEXT_INDENT, textIndent);
    posStyle.put(HtmlCSSConstants.MARGIN_LEFT, marginLeft);
    /* Add rule for right-to-left lists, like ol.WW8Num2_1.rtl , ul.WW8Num2_1.rtl */
    posStyleName = posStyleName.replaceAll(CSSConvertorUtil.LIST_CLASS_PATTERN, "$1." + HtmlCSSConstants.RTL);
    if(!cssMap.containsKey(posStyleName) )
      cssMap.put(posStyleName, new HashMap<String,String>());

    posStyle = cssMap.get(posStyleName);
    if (marginLeft.length() > 0) {
    	posStyle.put(HtmlCSSConstants.MARGIN_RIGHT, marginLeft);
    	posStyle.put(HtmlCSSConstants.MARGIN_LEFT, "0.0cm");
    }   
  }
}
