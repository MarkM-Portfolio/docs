package com.ibm.symphony.conversion.converter.html2odt.common;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.ibm.symphony.conversion.converter.html2odt.convertor.css.CSSUtil;
import com.ibm.symphony.conversion.service.common.ConvertUtil;
import com.ibm.symphony.conversion.service.common.HtmlCSSConstants;
import com.ibm.symphony.conversion.service.common.util.UnitUtil;

public class CSSGroupStylesUtil
{
  private static List<String> groupStyleNames = new ArrayList<String>();
  static
  {
    groupStyleNames.add(HtmlCSSConstants.BORDER);
    groupStyleNames.add(HtmlCSSConstants.BORDER_STYLE);
    groupStyleNames.add(HtmlCSSConstants.BORDER_WIDTH);
    groupStyleNames.add(HtmlCSSConstants.BORDER_COLOR);
    groupStyleNames.add(HtmlCSSConstants.BORDER_TOP);
    groupStyleNames.add(HtmlCSSConstants.BORDER_RIGHT);
    groupStyleNames.add(HtmlCSSConstants.BORDER_BOTTOM);
    groupStyleNames.add(HtmlCSSConstants.BORDER_LEFT);
    groupStyleNames.add(HtmlCSSConstants.MARGIN);
    groupStyleNames.add(HtmlCSSConstants.PADDING);
    groupStyleNames.add(HtmlCSSConstants.BACKGROUND);
  }

  private static List<String> borderSidePropNames = new ArrayList<String>(4);
  static
  {
    borderSidePropNames.add(HtmlCSSConstants.BORDER_TOP);
    borderSidePropNames.add(HtmlCSSConstants.BORDER_RIGHT);
    borderSidePropNames.add(HtmlCSSConstants.BORDER_BOTTOM);
    borderSidePropNames.add(HtmlCSSConstants.BORDER_LEFT);
  }

  private static List<String> fontStylePropNames = new ArrayList<String>(4);
  static
  {
    fontStylePropNames.add(HtmlCSSConstants.COLOR);
    fontStylePropNames.add(HtmlCSSConstants.FONT_FAMILY);
    fontStylePropNames.add(HtmlCSSConstants.FONT_SIZE);
    fontStylePropNames.add(HtmlCSSConstants.FONT_STYLE);
    fontStylePropNames.add(HtmlCSSConstants.FONT_WEIGHT);
    fontStylePropNames.add(HtmlCSSConstants.TEXT_DECORATION);
  }

  private static List<String> positionKeys = new ArrayList<String>(5);
  static
  {
    positionKeys.add("top");
    positionKeys.add("bottom");
    positionKeys.add("center");
    positionKeys.add("left");
    positionKeys.add("right");
  }

  private static List<String> borderStyleKeys = new ArrayList<String>();
  static
  {
    borderStyleKeys.add("hidden");
    borderStyleKeys.add("none");
    borderStyleKeys.add("dotted");
    borderStyleKeys.add("dashed");
    borderStyleKeys.add("solid");
    borderStyleKeys.add("groove");
    borderStyleKeys.add("ridge");
    borderStyleKeys.add("inset");
    borderStyleKeys.add("outset");
    borderStyleKeys.add("double");
  }

  private static Map<String, String> standardColorMap = new HashMap<String, String>();
  static
  {
    standardColorMap.put("aqua", "#00FFFF");
    standardColorMap.put("black", "#000000");
    standardColorMap.put("blue", "#0000FF");
    standardColorMap.put("fuchsia", "#FF00FF");
    standardColorMap.put("green", "#008000");
    standardColorMap.put("lime", "#00FF00");
    standardColorMap.put("maroon", "#800000");
    standardColorMap.put("navy", "#000080");
    standardColorMap.put("olive", "#808000");
    standardColorMap.put("purple", "#800080");
    standardColorMap.put("red", "#FF0000");
    standardColorMap.put("silver", "#C0C0C0");
    standardColorMap.put("teal", "#008080");
    standardColorMap.put("white", "#FFFFFF");
    standardColorMap.put("yellow", "#FFFF00");
  }

  public static List<String> getGroupStylePropNames()
  {
    return groupStyleNames;
  }

  public static List<String> getBorderSidePropNames()
  {
    return borderSidePropNames;
  }

  public static Map<String, String> getStandardColorMaps()
  {
    return standardColorMap;
  }

  public static List<String> getFontStylePropNames()
  {
    return fontStylePropNames;
  }

  public static String[] getBorderSidePropsArr(String proName, String proValue)
  {
    if (proValue == null || proValue.trim().equals(""))
      return null;

    proValue = CSSUtil.convertRGBValues(proValue);

    String[] propertyArr = new String[3];
    String[] values = proValue.trim().split(" ");

    for (int i = 0; i < values.length; i++)
    {
      String value = values[i].trim();
      if (UnitUtil.getUnit(value).length() > 0 || value.equalsIgnoreCase("thin") || value.equalsIgnoreCase("medium")
          || value.equalsIgnoreCase("thick"))
        propertyArr[0] = value;
      else if (borderStyleKeys.contains(value))
        propertyArr[1] = value;
      else if (standardColorMap.containsKey(value))
        propertyArr[2] = standardColorMap.get(value);
      else if (!value.equalsIgnoreCase("inherit"))
        propertyArr[2] = value;
    }
    return propertyArr;
  }

  public static String[] getBackgroundPropsArr(String proName, String proValue)
  {
    if (proValue == null || proValue.trim().equals(""))
      return null;

    proValue = CSSUtil.convertRGBValues(proValue);

    String[] propertyArr = new String[5];
    String[] values = proValue.trim().split(" ");

    for (int i = 0; i < values.length; i++)
    {
      String value = values[i].trim().toLowerCase();

      if (value.startsWith("#") || value.equals("transparent"))
        propertyArr[0] = value;
      else if (standardColorMap.containsKey(value))
        propertyArr[0] = standardColorMap.get(value);
      else if (value.startsWith("url"))
        propertyArr[1] = value;
      else if (value.contains("repeat"))
        propertyArr[2] = value;
      else if (value.equals("scroll") || value.equals("fixed"))
      {
        propertyArr[3] = value;
      }
      else if (value.endsWith("%") || positionKeys.contains(value) || UnitUtil.getUnit(value).length() > 0)
      {
        if (propertyArr[4] != null)
        {
          propertyArr[4] += " ";
          propertyArr[4] += value;
        }
        else
          propertyArr[4] = value;
      }
    }
    return propertyArr;
  }

  public static String getBorderCSSStyleName(int sideMark, int type)
  {
    String styleName = "";

    if (sideMark == 4)
      styleName = "border";
    else
      styleName = getSideCSSStyleName("border", sideMark);

    if (type == 1)
      styleName += "-width";
    else if (type == 2)
      styleName += "-style";
    else if (type == 3)
      styleName += "-color";

    return styleName;
  }

  public static String getSideCSSStyleName(String type, int sideMark)
  {
    String styleName = "";

    switch (sideMark)
      {
        case 0 :
          styleName = type + "-top";
          break;
        case 1 :
          styleName = type + "-right";
          break;
        case 2 :
          styleName = type + "-bottom";
          break;
        case 3 :
          styleName = type + "-left";
          break;
      }
    return styleName;
  }

  public static void mergeBorderSeparateStyle(Map<String, String> cssMap)
  {
    String borderWidth = "0.0008in";
    String borderStyle = "solid";
    String borderColor = "#000000";

    for (int i = 0; i < 4; i++)
    {
      String sidePropertyName = getBorderCSSStyleName(i, 0);
      if (cssMap.containsKey(sidePropertyName + "-style") || cssMap.containsKey(sidePropertyName + "-width")
          || cssMap.containsKey(sidePropertyName + "-color"))
      {
        String style = cssMap.get(sidePropertyName + "-style");
        String width = cssMap.get(sidePropertyName + "-width");
        String color = cssMap.get(sidePropertyName + "-color");

        style = (style == null) ? borderStyle : style;
        width = (width == null) ? borderWidth : width;
        color = (color == null) ? borderColor : color;
        if (standardColorMap.containsKey(color))
          color = standardColorMap.get(color);

        String sideProperty = width + " " + style + " " + color;

        cssMap.put(sidePropertyName, sideProperty);
        cssMap.remove(sidePropertyName + "-style");
        cssMap.remove(sidePropertyName + "-width");
        cssMap.remove(sidePropertyName + "-color");
      }
    }
  }

  public static void splitGroupStyles(Map<String, String> styleMap, String proName, String proValue)
  {
    String[] propertyArr;
    String addImportant = "";

    if (proValue.indexOf("!important") > 0)
    {
      addImportant = "!important";
      proValue = proValue.substring(0, proValue.indexOf("!important")).trim();
    }

    if (proName.equals(HtmlCSSConstants.BORDER))
    {
      splitBorderSideProps(styleMap, proName + "-top", proValue, addImportant);
      splitBorderSideProps(styleMap, proName + "-right", proValue, addImportant);
      splitBorderSideProps(styleMap, proName + "-bottom", proValue, addImportant);
      splitBorderSideProps(styleMap, proName + "-left", proValue, addImportant);
    }
    else if (proName.equals(HtmlCSSConstants.BACKGROUND))
    {
      splitBackgroundProps(styleMap, proName, proValue, addImportant);
    }
    else if (borderSidePropNames.contains(proName))
    {
      splitBorderSideProps(styleMap, proName, proValue, addImportant);
    }
    else
    {
      if (proName.startsWith(HtmlCSSConstants.BORDER))
      {
        proValue = CSSUtil.convertRGBValues(proValue);
        propertyArr = ConvertUtil.getPaddingMarginArr(proValue);

        styleMap.put("border-top" + proName.substring(proName.lastIndexOf("-")), propertyArr[0] + addImportant);
        styleMap.put("border-right" + proName.substring(proName.lastIndexOf("-")), propertyArr[1] + addImportant);
        styleMap.put("border-bottom" + proName.substring(proName.lastIndexOf("-")), propertyArr[2] + addImportant);
        styleMap.put("border-left" + proName.substring(proName.lastIndexOf("-")), propertyArr[3] + addImportant);
      }
      else
      {
        propertyArr = ConvertUtil.getPaddingMarginArr(proValue);
        styleMap.put(proName + "-top", propertyArr[0] + addImportant);
        styleMap.put(proName + "-right", propertyArr[1] + addImportant);
        styleMap.put(proName + "-bottom", propertyArr[2] + addImportant);
        styleMap.put(proName + "-left", propertyArr[3] + addImportant);
      }
    }
  }

  private static void splitBackgroundProps(Map<String, String> styleMap, String proName, String proValue, String addImportant)
  {
    String[] values = getBackgroundPropsArr(proName, proValue);
    if (values == null)
      return;

    if (values[0] != null)
      styleMap.put(proName + "-color", values[0] + addImportant);

    if (values[1] != null)
      styleMap.put(proName + "-image", values[1] + addImportant);

    if (values[2] != null)
      styleMap.put(proName + "-repeat", values[2] + addImportant);

    if (values[3] != null)
      styleMap.put(proName + "-attachment", values[3] + addImportant);

    if (values[4] != null)
      styleMap.put(proName + "-position", values[4] + addImportant);

  }

  private static void splitBorderSideProps(Map<String, String> styleMap, String proName, String proValue, String addImportant)
  {
    String[] borderStyles = getBorderSidePropsArr(proName, proValue);
    if (borderStyles == null)
      return;

    if (borderStyles[0] != null)
      styleMap.put(proName + "-width", borderStyles[0] + addImportant);

    if (borderStyles[1] != null)
      styleMap.put(proName + "-style", borderStyles[1] + addImportant);

    if (borderStyles[2] != null)
      styleMap.put(proName + "-color", borderStyles[2] + addImportant);
  }
}
