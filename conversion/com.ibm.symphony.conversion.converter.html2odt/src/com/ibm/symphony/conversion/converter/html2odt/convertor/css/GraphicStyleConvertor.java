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

import java.util.Iterator;
import java.util.Map;
import java.util.Map.Entry;
import java.util.UUID;

import org.odftoolkit.odfdom.OdfAttribute;
import org.odftoolkit.odfdom.OdfElement;
import org.odftoolkit.odfdom.OdfFileDom;
import org.odftoolkit.odfdom.doc.style.OdfStyle;
import org.odftoolkit.odfdom.doc.style.OdfStyleGraphicProperties;
import org.odftoolkit.odfdom.dom.style.OdfStyleFamily;
import org.odftoolkit.odfdom.dom.style.props.OdfStyleProperty;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;

import com.ibm.json.java.JSONObject;
import com.ibm.symphony.conversion.converter.html2odt.convertor.css.propertyConvertors.CSSPropertyConvertorFactory;
import com.ibm.symphony.conversion.converter.html2odt.convertor.css.propertyConvertors.GeneralCSSPropertyConvertor;
import com.ibm.symphony.conversion.converter.html2odt.convertor.css.propertyConvertors.ICSSPropertyConvertor;
import com.ibm.symphony.conversion.converter.html2odt.convertor.html.XMLConvertorUtil;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.ConvertUtil;
import com.ibm.symphony.conversion.service.common.HtmlCSSConstants;
import com.ibm.symphony.conversion.service.common.ODFConstants;
import com.ibm.symphony.conversion.service.common.util.UnitUtil;

public class GraphicStyleConvertor extends GeneralCSSStyleConvertor
{
  public GraphicStyleConvertor()
  {
    this.odfStyleFamily = OdfStyleFamily.Graphic;
  }

  @Override
  protected OdfStyle parseStyle(ConversionContext context, OdfFileDom odfDoc, Element htmlElement, String styleName,
      Map<String, String> CSSMap, OdfStyleFamily odfStyleFamily)
  {
    if (HtmlCSSConstants.IMG.equals(htmlElement.getNodeName()))
    {
      return parseImageStyle(context, odfDoc, htmlElement, styleName, CSSMap, odfStyleFamily);
    }
    else if (HtmlCSSConstants.DIV.equals(htmlElement.getNodeName()) || HtmlCSSConstants.CAPTION.equals(htmlElement.getNodeName()))
    {
      return parseTextBoxStyle(context, odfDoc, htmlElement, styleName, CSSMap, odfStyleFamily);
    }

    return super.parseStyle(context, odfDoc, htmlElement, styleName, CSSMap, odfStyleFamily);
  }

  private OdfStyle parseImageStyle(ConversionContext context, OdfFileDom odfDoc, Element htmlElement, String styleName,
      Map<String, String> CSSMap, OdfStyleFamily odfStyleFamily)
  {
    // htmlElement must be "img", odfElement must be "draw:frame"
    String width = null,height = null;
    OdfElement odfElement = (OdfElement) context.get("OdfElement");
    String anchorType = odfElement.getAttribute(ODFConstants.TEXT_ANCHOR_TYPE);
    OdfStyle oldStyle = CSSUtil.getOldStyle(context, styleName, odfStyleFamily);
    OdfStyle style = new OdfStyle(odfDoc);
    style.setStyleFamilyAttribute(odfStyleFamily.getName());
    style.setStyleNameAttribute(CSSUtil.getStyleName(odfStyleFamily, styleName));
    style.setStyleParentStyleNameAttribute("Graphics");
    if (oldStyle == null)
    {
      style.setProperty(OdfStyleGraphicProperties.Mirror, "none");
      style.setProperty(OdfStyleGraphicProperties.Clip, "rect(0in, 0in, 0in, 0in)");
      style.setProperty(OdfStyleGraphicProperties.Luminance, "0%");
      style.setProperty(OdfStyleGraphicProperties.Contrast, "0%");
      style.setProperty(OdfStyleGraphicProperties.Red, "0%");
      style.setProperty(OdfStyleGraphicProperties.Green, "0%");
      style.setProperty(OdfStyleGraphicProperties.Blue, "0%");
      style.setProperty(OdfStyleGraphicProperties.Gamma, "100%");
      style.setProperty(OdfStyleGraphicProperties.ColorInversion, "false");
      style.setProperty(OdfStyleGraphicProperties.ImageOpacity, "100%");
      style.setProperty(OdfStyleGraphicProperties.ColorMode, "standard");
      style.setProperty(OdfStyleGraphicProperties.VerticalPos, "top");
      style.setProperty(OdfStyleGraphicProperties.VerticalRel, "baseline");
      String uuid = UUID.randomUUID().toString().substring(0, 4);
      odfElement.setOdfAttributeValue(ConvertUtil.getOdfName(ODFConstants.DRAW_NAME), "graphics_" + uuid);
    }
    else
    {
      //preserve margin
      String prop = oldStyle.getProperty(OdfStyleGraphicProperties.Margin);
      if(prop != null)
        style.setProperty(OdfStyleGraphicProperties.Margin, prop);
      prop = oldStyle.getProperty(OdfStyleGraphicProperties.MarginTop);
      if(prop != null)
        style.setProperty(OdfStyleGraphicProperties.MarginTop, prop);
      prop = oldStyle.getProperty(OdfStyleGraphicProperties.MarginRight);
      if(prop != null)
        style.setProperty(OdfStyleGraphicProperties.MarginRight, prop);
      prop = oldStyle.getProperty(OdfStyleGraphicProperties.MarginBottom);
      if(prop != null)
        style.setProperty(OdfStyleGraphicProperties.MarginBottom, prop);
      prop = oldStyle.getProperty(OdfStyleGraphicProperties.MarginLeft);
      if(prop != null)
        style.setProperty(OdfStyleGraphicProperties.MarginLeft, prop);
      
      updateLeftTop(context, CSSMap, anchorType, oldStyle);
    }
    CSSUtil.updateHeightWidth(CSSMap);
    Iterator<Entry<String, String>> it = CSSMap.entrySet().iterator();
    while (it.hasNext())
    {
      Entry<String, String> entry = it.next();
      String key = entry.getKey();
      String value = entry.getValue();

      if (key.equals(HtmlCSSConstants.ZINDEX))
        continue;

      if ((key.equals(HtmlCSSConstants.TOP) || key.equals(HtmlCSSConstants.LEFT)) && anchorType.equals("as-char"))
        continue;
      
      if(key.startsWith("margin") && !anchorType.equals("as-char"))
        continue;

      // new created image border just like this - border: 5px solid
      if (key.equals(HtmlCSSConstants.BORDER) && value.split(" ").length == 2)
      {
        String oldOdfValue = style.getProperty(OdfStyleGraphicProperties.Border);
        if (oldOdfValue != null && oldOdfValue.split(" ").length == 3)
          continue;

        String odfValue = value.split(" ")[0];
        if (odfValue.endsWith("px"))
          odfValue = CSSUtil.convertPXToIN(odfValue);
        style.setProperty(OdfStyleGraphicProperties.Border, odfValue + " solid #000000");
        continue;
      }

      if (key.equals(HtmlCSSConstants.BORDER_STYLE) || key.equals(HtmlCSSConstants.BORDER_COLOR))// border set by concord. must be solid black.
        continue;

      // border set by concord. use boder-width. just ignore this.
      if ((key.equals(HtmlCSSConstants.BORDER_TOP) || key.equals(HtmlCSSConstants.BORDER_BOTTOM)
          || key.equals(HtmlCSSConstants.BORDER_LEFT) || key.equals(HtmlCSSConstants.BORDER_RIGHT))
          && value.split(" ").length != 3)
        continue;

      if (key.equals(HtmlCSSConstants.BORDER_WIDTH))
      {
        String oldOdfValue = style.getProperty(OdfStyleGraphicProperties.Border);
        if (oldOdfValue != null && oldOdfValue.split(" ").length == 3)
          continue;

        String odfValue = value;
        if (value.endsWith("px"))
          odfValue = CSSUtil.convertPXToIN(value);
        style.setProperty(OdfStyleGraphicProperties.Border, odfValue + " solid #000000");
        continue;
      }

      if (key.equals(HtmlCSSConstants.WIDTH) || key.equals(HtmlCSSConstants.HEIGHT) || key.equals(HtmlCSSConstants.TOP)
          || key.equals(HtmlCSSConstants.LEFT))
      {
        JSONObject htmlMap = XMLConvertorUtil.getHtmlTextMap();
        String odfKey = (String) htmlMap.get(key);
        String odfValue = value;
        if (value.endsWith("px"))
          odfValue = CSSUtil.convertPXToIN(value);

        if (key.equals(HtmlCSSConstants.TOP) || key.equals(HtmlCSSConstants.LEFT))// top and left attribute may add on <draw:frame> or style
        {
          String keyInOdfElement = odfElement.getAttribute(odfKey);
          if (keyInOdfElement != null && !keyInOdfElement.equals(""))
            odfElement.setOdfAttributeValue(ConvertUtil.getOdfName(odfKey), odfValue);

          String keyInOldStyle = (oldStyle == null) ? null : oldStyle.getAttribute(odfKey);
          if (keyInOldStyle == null || keyInOldStyle.equals(""))
          {
            if (keyInOdfElement == null || keyInOdfElement.equals(""))
              odfElement.setOdfAttributeValue(ConvertUtil.getOdfName(odfKey), odfValue);
            continue;
          }
        }
        else
        // width and height attribute add on <draw:frame>
        {
          if (key.equals(HtmlCSSConstants.WIDTH))
            width = odfValue;
          else
            height = odfValue;
          odfElement.setOdfAttributeValue(ConvertUtil.getOdfName(odfKey), odfValue);
          continue;
        }
      }
      if (key.equals(HtmlCSSConstants.FLOAT) && !value.toLowerCase().equals("inline"))
        if (anchorType.equals("as-char"))
          odfElement.setOdfAttributeValue(ConvertUtil.getOdfName(ODFConstants.TEXT_ANCHOR_TYPE), "paragraph");
        else
          continue;
      if(key.equals(HtmlCSSConstants.BACKGROUND_COLOR) && value.toLowerCase().equals("transparent") && oldStyle != null)
      {
        String prop = oldStyle.getProperty(OdfStyleGraphicProperties.BackgroundColor);
        if(prop != null)
          style.setProperty(OdfStyleGraphicProperties.BackgroundColor, prop);
        prop = oldStyle.getProperty(OdfStyleGraphicProperties.BackgroundTransparency);
        if(prop != null)
          style.setProperty(OdfStyleGraphicProperties.BackgroundTransparency, prop);
        continue;
      }

      ICSSPropertyConvertor convertor = CSSPropertyConvertorFactory.getInstance().getConvertor(key);
      convertor.convert(context, style, CSSMap, key, value);
    }
    // For shape export only. It will append the draw:fill-color property to exported odt file
    if (XMLConvertorUtil.isShape(context, htmlElement))
    {
      Map<OdfStyleProperty, String> oldProps = oldStyle.getStyleProperties();
      Map<String, OdfStyleProperty> propertyMap = GeneralCSSPropertyConvertor.SHAPE_STYLE_NAME_PROR_MAP;
      JSONObject jsObj = ConvertUtil.getPreservedShapeStyleMap();

      for (Object name : jsObj.keySet())
      {
        OdfStyleProperty odfProp = propertyMap.get((String) name);
        String shapeValue = oldProps.get(odfProp);
        if (odfProp != null)
        {
          String odfValue = CSSUtil.convertHtmlStyleValue(odfProp, shapeValue);
          if (odfValue != null)
          {
            style.setProperty(odfProp, odfValue);
          }
        }
      }
      if(width != null && height != null)
        reCalculateXY(width, height, odfElement);
    }
    return style;
  }

  private void reCalculateXY(String width, String height, OdfElement odfElement)
  {
    OdfAttribute x1Attr = odfElement.getOdfAttribute(ConvertUtil.getOdfName("svg:x1"));
    OdfAttribute y1Attr = odfElement.getOdfAttribute(ConvertUtil.getOdfName("svg:y1"));
    OdfAttribute x2Attr = odfElement.getOdfAttribute(ConvertUtil.getOdfName("svg:x2"));
    OdfAttribute y2Attr = odfElement.getOdfAttribute(ConvertUtil.getOdfName("svg:y2"));
    if(null != x1Attr && null != x2Attr && null != y1Attr && null != y2Attr )
    {
      String x1 = x1Attr.getNodeValue();
      String x2 = x2Attr.getNodeValue();
      String y1 = y1Attr.getNodeValue();
      String y2 = y2Attr.getNodeValue();
      double dX1 = Double.valueOf(x1.split("cm")[0]);
      double dY1 = Double.valueOf(y1.split("cm")[0]);
      double dX2 = Double.valueOf(x2.split("cm")[0]);
      double dY2 = Double.valueOf(y2.split("cm")[0]);
      double dWidth = Double.valueOf(width.split("cm")[0]);
      double dHeight = Double.valueOf(height.split("cm")[0]);
      String endXNode = "",endYNode = "";
      double beginXPosition = 0,beginYPosition = 0;
      boolean isChangeX = true, isChangeY = true;
      if(dX1 > dX2)
      {
        endXNode = "svg:x1";
        beginXPosition = dX2;
      }else if(dX1 < dX2)
      {
        endXNode = "svg:x2";
        beginXPosition = dX1;
      }else
        isChangeX = false;
      if(dY1 > dY2)
      {
        endYNode = "svg:y1";
        beginYPosition = dY2;
      }else if(dY1 < dY2)
      {
        endYNode = "svg:y2";
        beginYPosition = dY1;
      }else
        isChangeY = false;
      if(isChangeX)
        odfElement.setOdfAttributeValue(ConvertUtil.getOdfName(endXNode), String.valueOf(beginXPosition+dWidth) + "cm");
      if(isChangeY)
        odfElement.setOdfAttributeValue(ConvertUtil.getOdfName(endYNode), String.valueOf(beginYPosition+dHeight) + "cm");
    }
  }

  private OdfStyle parseTextBoxStyle(ConversionContext context, OdfFileDom odfDoc, Element htmlElement, String styleName,
      Map<String, String> CSSMap, OdfStyleFamily odfStyleFamily)
  {
    OdfStyle style = new OdfStyle(odfDoc);
    style.setStyleFamilyAttribute(odfStyleFamily.getName());
    style.setStyleNameAttribute(CSSUtil.getStyleName(odfStyleFamily, styleName));
    style.setStyleParentStyleNameAttribute("Frame");
    ICSSPropertyConvertor borderConvertor = CSSPropertyConvertorFactory.getInstance().getConvertor("border-top");
    borderConvertor.convert(context, style, CSSMap, "border-top", "none");
    borderConvertor = CSSPropertyConvertorFactory.getInstance().getConvertor("border-right");
    borderConvertor.convert(context, style, CSSMap, "border-right", "none");
    borderConvertor = CSSPropertyConvertorFactory.getInstance().getConvertor("border-bottom");
    borderConvertor.convert(context, style, CSSMap, "border-bottom", "none");
    borderConvertor = CSSPropertyConvertorFactory.getInstance().getConvertor("border-left");
    borderConvertor.convert(context, style, CSSMap, "border-left", "none");

    Iterator<Entry<String, String>> it = CSSMap.entrySet().iterator();
    while (it.hasNext())
    {
      Entry<String, String> entry = it.next();
      if (useDefaultValue(entry.getKey(), entry.getValue()))
        continue;
      ICSSPropertyConvertor convertor = CSSPropertyConvertorFactory.getInstance().getConvertor(entry.getKey());
      convertor.convert(context, style, CSSMap, entry.getKey(), entry.getValue());
    }
    return style;
  }
  
  private void updateLeftTop(ConversionContext context, Map<String, String> CSSMap, String anchorType, OdfStyle odfStyle)
  {
    if(!(anchorType.equals("char") || anchorType.equals("paragraph")))
        return;
    String horizontalRel = odfStyle.getProperty(OdfStyleGraphicProperties.HorizontalRel);
    String verticalRel = odfStyle.getProperty(OdfStyleGraphicProperties.VerticalRel);
    if("page".equals(horizontalRel) || "page".equals(verticalRel))
    {
      Document html = (Document) context.getSource();
      Node body = html.getElementsByTagName("body").item(0);
      String bodyStyle = ((Element) body).getAttribute(HtmlCSSConstants.STYLE);
      Map<String, String> bodyStyleMap = ConvertUtil.buildCSSMap(bodyStyle);
      String left = CSSMap.get(HtmlCSSConstants.LEFT);
      String top = CSSMap.get(HtmlCSSConstants.TOP);
      if(left != null && "page".equals(horizontalRel))
      {
        String pagePaddingLeft = bodyStyleMap.get(HtmlCSSConstants.PADDING_LEFT);
        if(pagePaddingLeft != null)
          CSSMap.put(HtmlCSSConstants.LEFT, UnitUtil.addLength(left, pagePaddingLeft));
      }
      if(top != null && "page".equals(verticalRel))
      {
        String pagePaddingTop = bodyStyleMap.get(HtmlCSSConstants.PADDING_TOP);;
        if(pagePaddingTop != null)
          CSSMap.put(HtmlCSSConstants.TOP, UnitUtil.addLength(top, pagePaddingTop));
      }
    }
  }
}
