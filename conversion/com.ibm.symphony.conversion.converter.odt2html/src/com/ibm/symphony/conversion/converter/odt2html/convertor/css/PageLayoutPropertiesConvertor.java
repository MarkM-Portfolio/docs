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

import org.odftoolkit.odfdom.OdfElement;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

import com.ibm.symphony.conversion.converter.odt2html.convertor.html.HtmlConvertorUtil;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.ConvertUtil;
import com.ibm.symphony.conversion.service.common.HtmlCSSConstants;
import com.ibm.symphony.conversion.service.common.ODFConstants;

public class PageLayoutPropertiesConvertor extends CSSConvertor
{    
  @Override
  protected void doConvertCSS(ConversionContext context, OdfElement element, Map<String, Map<String, String>> map)
  {
    String styleName = CSSConvertorUtil.getStyleName(element);
    if( styleName != null)
    {
      CSSConvertorUtil.parseStyle(context, element, map);
      
      Map<String, String> styleMap = CSSConvertorUtil.getStyleMap(styleName, map);
      operateBackgroundColor(styleMap);
      operateImageProperties(context, element, styleMap);
      changeMarginToPadding(styleMap);
      operatePageWidth(styleMap);
      CSSConvertorUtil.getPageLayoutStyleSet(context).add(styleName);
      //changeMapName(map, styleName);
    }
  }
  
  private static void operatePageWidth(Map<String, String> map)
  {
    String str = map.get("width");
    map.put("page-widths", str);
    if (str != null)
    {
      String unit = str.substring(str.length() - 2);
      float widthValue = Float.parseFloat(str.substring(0, str.length() - 2));
      float left = 0;
      float right = 0;
      if ((str = map.get("padding")) != null)
      {
        left = Float.parseFloat(str.substring(0, str.length() - 2));
        right = left;
      }
      else
      {
        if ((str = map.get("padding-left")) != null)
          left = Float.parseFloat(str.substring(0, str.length() - 2));
        if ((str = map.get("padding-right")) != null)
          right = Float.parseFloat(str.substring(0, str.length() - 2));
      }
      widthValue = widthValue - right - left;
      String width = widthValue + unit;
      map.put("width", width);
    }
  }

  private static void operateBackgroundColor(Map<String, String> map)
  {
    if ("transparent".equals(map.get("background-color")))
      map.remove("background-color");
  }

  /*
   * process xlink:href xlink:type xlink:actuate style:position style:repeat
   */
  @SuppressWarnings("restriction")
  private static void operateImageProperties(ConversionContext context, OdfElement styleElement, Map<String, String> styleMap)
  {
    OdfElement imageProperties = null;
    NodeList children = styleElement.getChildNodes();
    for (int i = children.getLength() - 1; i >= 0; i--)
    {
      Node child = children.item(i);
      if (ODFConstants.STYLE_BACKGROUND_IMAGE.equals(child.getNodeName()))
      {
        imageProperties = (OdfElement) child;
        break;
      }
    }

    if (imageProperties != null)
    {
      String temp = imageProperties.getAttribute(ODFConstants.XLINK_HREF);
      if (temp.length() != 0)
      {
        temp = HtmlConvertorUtil.updateImageDirAndCopyImageToDraftFolder(context, temp, imageProperties);
        styleMap.put(HtmlCSSConstants.BACKGROUND_IMAGE, "url(\"" + temp + "\")");
      }

      temp = imageProperties.getAttribute(ODFConstants.STYLE_POSITION);
      if (temp.length() != 0)
        styleMap.put(HtmlCSSConstants.BACKGROUND_POSITION, temp);

      temp = imageProperties.getAttribute(ODFConstants.STYLE_REPEAT);
      if (temp.length() != 0)
        styleMap.put(HtmlCSSConstants.BACKGROUND_REPEAT, temp);
    }

  }

  /* the margin of ODF document will change to the padding of HTML body. */
  private static void changeMarginToPadding(Map<String, String> map)
  {
    String margin = map.get(HtmlCSSConstants.MARGIN);
    String padding = map.get(HtmlCSSConstants.PADDING);
    //save the odf margins to map now in order to output the margin values to page-settings.js
    String[] marginArray = ConvertUtil.getMargin(map);
    putOdfMarginsToMap(map, marginArray);
    if (margin != null && padding != null)
      map.put(HtmlCSSConstants.PADDING, ConvertUtil.addLength(margin, padding));
    else
    {
      String[] paddingArray = ConvertUtil.getPadding(map);
      String[] paddingSeq = {HtmlCSSConstants.PADDING_TOP, HtmlCSSConstants.PADDING_RIGHT, HtmlCSSConstants.PADDING_BOTTOM, HtmlCSSConstants.PADDING_LEFT};
      for(int i=0; i<4; i++)
      {
        if(marginArray[i] != null)
        {
          if(paddingArray[i] != null)
            map.put(paddingSeq[i], ConvertUtil.addLength(marginArray[i], paddingArray[i]));
          else
            map.put(paddingSeq[i], marginArray[i]);
        }
      }
      map.remove(HtmlCSSConstants.MARGIN_LEFT);
      map.remove(HtmlCSSConstants.MARGIN_RIGHT);
      map.remove(HtmlCSSConstants.MARGIN_TOP);
      map.remove(HtmlCSSConstants.MARGIN_BOTTOM);
      map.remove(HtmlCSSConstants.PADDING);
    }
    map.remove(HtmlCSSConstants.MARGIN);
  }

  private static void putOdfMarginsToMap(Map<String, String> map, String[] marginArray)
  {
    String[] odfMarginSeq = {HtmlCSSConstants.ODF_MARGIN_TOP, HtmlCSSConstants.ODF_MARGIN_RIGHT, HtmlCSSConstants.ODF_MARGIN_BOTTOM, HtmlCSSConstants.ODF_MARGIN_LEFT};
    for(int i=0; i< marginArray.length; i++)
    {
      map.put(odfMarginSeq[i], marginArray[i]);
    }
  }
}
