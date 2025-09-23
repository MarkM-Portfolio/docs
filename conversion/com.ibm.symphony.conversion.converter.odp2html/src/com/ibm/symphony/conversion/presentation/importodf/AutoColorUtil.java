/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.presentation.importodf;

import java.util.List;
import java.util.Map;

import org.odftoolkit.odfdom.OdfElement;
import org.odftoolkit.odfdom.doc.draw.OdfDrawPage;
import org.odftoolkit.odfdom.doc.style.OdfStyle;
import org.odftoolkit.odfdom.dom.element.OdfStylePropertiesBase;
import org.odftoolkit.odfdom.dom.style.props.OdfStylePropertiesSet;
import org.odftoolkit.odfdom.type.Color;
import org.w3c.dom.Element;
import org.w3c.dom.Node;

import com.ibm.symphony.conversion.presentation.ODPConvertConstants;
import com.ibm.symphony.conversion.service.common.ConversionContext;

public class AutoColorUtil
{
  static String[] styleAttributeNames = new String[] { "draw:style-name", "draw:text-style-name", "text:style-name",
      "presentation:style-name", "table:style-name" };

  private static int DARK_THRESHOLD = 39;

  private static int BLUE_LUM_ADJUST = 28;

  private static int RED_LUM_ADJUST = 77;

  private static int GREEN_LUM_ADJUST = 151;

  private static String BLACK_FONT_COLOR = "#000000";

  private static String WHITE_FONT_COLOR = "#ffffff";

  private static String FONTCOLOR_ALREADY_SET = null;

  private static String FONTCOLOR_DEFINED = "fontcolor-defined";

  private static final String RGB_HTML_TAG = "rgb";

  /**
   * Will set the in-line style for the font color unless a font color is already set. The htmlElement will have the style attribute added.
   * 
   * Will only perform style modification if processing content.
   * 
   * @param context
   * @param htmlElement
   * @param odfElement
   */
  public static void applyWindowFontColor(ConversionContext context, Element htmlElement, Node odfElement)
  {

    /*
     * will have to stop calling this .. for now just comment out. That way, easier to track the places where this is called from.
     * 
     * // Process once in content conversion as shouldn't be handled in master style // conversion process before the content conversion.
     * boolean inStyleProcessing = (Boolean) context.get(ODPConvertConstants.CONTEXT_IN_STYLE); if (inStyleProcessing) { return; }
     * 
     * String color = AutoColorUtil.getWindowFontColor(context, htmlElement, odfElement);
     * 
     * if (color != null) { //System.out.println("     -- > auto color " + color); String style =
     * htmlElement.getAttribute(ODPConvertConstants.HTML_STYLE_TAG); if (!style.contains("color:")) { style +=
     * ODPConvertConstants.CSS_FONT_COLOR + ":" + color + ";"; htmlElement.setAttribute(ODPConvertConstants.HTML_STYLE_TAG, style);
     * htmlElement.setAttribute(ODPConvertConstants.HTML_ATTR_AUTO_COLOR, color); } }
     */
  }

  /**
   * Retrieve the color that should be used for the automatic color.
   * 
   * First search in-line styles, then class styles. If a font color is defined, then return. If not, the calculated 'automatic' color is
   * returned.
   * 
   * @param context
   * @param htmlElement
   * @param odfElement
   * @return
   */
  @SuppressWarnings("unchecked")
  public static String getWindowFontColor(ConversionContext context, Element htmlElement, Node odfElement)
  {
    Element tempElement = (Element) odfElement;
    // should check auto color
    Map<String, Map<String, String>> cssContentMap = (Map<String, Map<String, String>>) context
        .get(ODPConvertConstants.CONTEXT_CSS_CONTENT_STYLE);
    Map<String, Map<String, String>> styleNodeMap = (Map<String, Map<String, String>>) context
        .get(ODPConvertConstants.CONTEXT_SYTLENAME_NODES_MAP_IN_CONTENT);

    String color = getInlineStyles(context, tempElement, styleNodeMap);

    if (color != null && color.equals(FONTCOLOR_DEFINED))
    {
      return FONTCOLOR_ALREADY_SET;
    }

    if (color == null)
    {
      color = getClassStyles(context, htmlElement, cssContentMap);
    }

    if (color != null && color.equals(FONTCOLOR_DEFINED))
    {
      return FONTCOLOR_ALREADY_SET;
    }

    return color;

  }

  /**
   * Get the inline styles color values. This walks through the style element of the ODF element passed in to determine if color or
   * background-color is defined.
   * 
   * An automatic font color will be calculated under the following circumstances: a font color is not set, a background color is set and
   * the "user-window-font-color" property is set.
   * 
   * @param context
   *          Conversion context construct
   * @param odfElement
   *          ODF Element to use to determine inline styles
   * @param map
   *          Style node map (i.e. styles.xml)
   * @return color value to be used based on inline style attribute. If none determined, null is returned.
   */
  private static String getInlineStyles(ConversionContext context, Element odfElement, Map<String, Map<String, String>> map)
  {

    Element tempElement = odfElement;

    while (tempElement != null && !(tempElement instanceof OdfDrawPage))
    {
      String styleName = getElementStyleName(tempElement, map);

      if (styleName != null)
      {
        String useWindowFont = getElementStyleValue(context, tempElement, ODPConvertConstants.CSS_USE_WINDOW_FONT_COLOR);

        String fontColor = getElementStyleValue(context, tempElement, ODPConvertConstants.CSS_FONT_COLOR);
        if (fontColor == null)
        {
          String backgroundColor = getElementStyleValue(context, tempElement, ODPConvertConstants.CSS_BACKGROUND_COLOR);
          if (backgroundColor != null)
          {
            if (useWindowFont != null && useWindowFont.equalsIgnoreCase("false"))
            {
              return FONTCOLOR_DEFINED;
            }
            else
            {
              return getUseWindowFontColor(backgroundColor);
            }
          }
        }
        else
        {
          return FONTCOLOR_DEFINED;
        }
      }

      Node parentNode = tempElement.getParentNode();
      if (parentNode instanceof Element)
      {
        tempElement = (Element) parentNode;
      }
      else
      {
        tempElement = null;
      }
    }
    return null;
  }

  /**
   * Walks through the class attribute values to determine font color
   * 
   * @param context
   *          Conversion context construct
   * @param htmlElement
   *          HTML element used to grab class attribute
   * @param map
   *          CSS content map (i.e. content.html styles)
   * @return Color value to be used for fonts, or null if already set.
   */
  private static String getClassStyles(ConversionContext context, Element htmlElement, Map<String, Map<String, String>> map)
  {

    Element tempElement = htmlElement;

    while (tempElement != null)
    {
      String className = tempElement.getAttribute(ODPConvertConstants.HTML_ATTR_CLASS);

      if (className != null && className.length() > 1)
      {
        String[] classes = className.split(" ");
        for (String styleClass : classes)
        {
          if (styleClass.startsWith("gr"))
          {
            continue;
          }
          String concordStyleClass = "." + styleClass + " ";
          if (map != null && map.containsKey(concordStyleClass))
          {
            String fontColor = getElementClassValue(context, tempElement, ODPConvertConstants.CSS_FONT_COLOR, map.get(concordStyleClass));
            if (fontColor == null)
            {
              String backgroundColor = getElementClassValue(context, tempElement, ODPConvertConstants.CSS_BACKGROUND_COLOR,
                  map.get(concordStyleClass));
              if (backgroundColor != null)
              {
                return getUseWindowFontColor(backgroundColor);
              }
            }
          }
        }
      }

      Node parentNode = tempElement.getParentNode();
      if (parentNode instanceof Element)
      {
        tempElement = (Element) parentNode;
      }
      else
      {
        tempElement = null;
      }
    }

    return getUseWindowFontColor(getMasterStyleDrawFillColor(context, htmlElement));
  }

  private static String getElementStyleName(Element odfElement, Map<String, Map<String, String>> map)
  {
    for (String styleAttrName : styleAttributeNames)
    {
      String styleName = odfElement.getAttribute(styleAttrName);
      if (styleName.length() > 1)
      {
        if (map.containsKey(styleName))
        {
          return styleName;
        }
      }
    }
    return null;
  }

  /**
   * Based on the odfElement passed in, get the style map from the css content map. The css content map changes the style name to .<style>
   * so this will search using this new search string.
   * 
   * @param odfElement
   *          odf element to check the css content styles against
   * @param map
   *          Style map. Assumes the css content style as this is using the same format that would be present in that html file.
   * @return stylemap of the element
   */
  private static Map<String, String> getElementStyleMap(Element odfElement, Map<String, Map<String, String>> map)
  {
    Map<String, String> styleMap = null;

    for (String styleAttrName : styleAttributeNames)
    {
      String styleAttr = odfElement.getAttribute(styleAttrName);
      if (styleAttr != null)
      {
        String concordStyleClass = "." + styleAttr + " ";
        if (map.containsKey(concordStyleClass))
        {
          styleMap = map.get(concordStyleClass);
          break;
        }
      }
    }
    return styleMap;
  }

  /**
   * Get the element style value. Based on the ODF Element, looks in the css content style map which consists of the html styles to
   * determine if that attribute is set.
   * 
   * @param context
   *          Conversion Context construct
   * @param odfElement
   *          ODF element
   * @param attribute
   *          attribute to retrieve the value.
   * @return
   */
  @SuppressWarnings("unchecked")
  private static String getElementStyleValue(ConversionContext context, Element odfElement, String attribute)
  {
    Map<String, Map<String, String>> map = (Map<String, Map<String, String>>) context.get(ODPConvertConstants.CONTEXT_CSS_CONTENT_STYLE);

    Map<String, String> styleMap = getElementStyleMap(odfElement, map);

    if (styleMap != null)
    {
      String value = styleMap.get(attribute);

      if (value != null && value.length() > 1)
      {
        return value;
      }
    }

    Node parent = odfElement.getParentNode();

    if (parent != null && (parent instanceof OdfElement) /* && !ODFConstants.OFFICE_TEXT.equals( parent.getNodeName() ) */)
    {
      return getElementStyleValue(context, (OdfElement) parent, attribute);
    }
    else
    {
      return null;
    }

  }

  private static String getElementClassValue(ConversionContext context, Element element, String attribute, Map<String, String> styleMap)
  {

    if (styleMap != null)
    {
      String value = styleMap.get(attribute);
      if (value != null)
        return value;
    }

    return null;
  }

  /**
   * Get the master style fill color information. Walks up to see if the master style is defined. If defined then grabs the draw:fill-color
   * information
   * 
   * returns the draw:fill-color in hex
   */
  @SuppressWarnings({ "unchecked", "restriction" })
  private static String getMasterStyleDrawFillColor(ConversionContext context, Element htmlElement)
  {
    String drawFillColor = "";

    // Check to see if a master style is defined. If not defined just return null
    String masterStyleName = (String) context.get(ODPConvertConstants.CONTEXT_DRAWPAGE_MASTER_NAME);

    if (masterStyleName == null || masterStyleName.length() <= 0)
    {
      return null;
    }

    if (masterStyleName.startsWith("u"))
    {
      masterStyleName = masterStyleName.replaceFirst("u", "_");
    }

    Map<String, List<Node>> styleMap = (Map<String, List<Node>>) context.get(ODPConvertConstants.CONTEXT_SYTLENAME_NODES_MAP_IN_STYLE);
    List<Node> nodeList = styleMap.get(masterStyleName + "-background");

    if (nodeList != null && nodeList.size() > 0)
    {
      // Should only be a single style with this name
      OdfStyle listStyle = (OdfStyle) nodeList.get(0);
      // Get the paragraph properties of the master style
      OdfStylePropertiesBase graphicProperties = listStyle.getPropertiesElement(OdfStylePropertiesSet.GraphicProperties);

      if (graphicProperties == null)
      {
        return null;
      }

      Node drawFillColorAttr = graphicProperties.getAttributeNode(ODPConvertConstants.ODF_ATTR_DRAW_FILL_COLOR);
      if (drawFillColorAttr != null)
      {
        if (drawFillColor.contains(RGB_HTML_TAG))
        {
          drawFillColor = convertRGBValues(drawFillColor);
        }

        drawFillColor = drawFillColorAttr.getNodeValue().replace("#", "");
      }
    }

    return drawFillColor;
  }

  /**
   * Get the window font color to use. Depending on the color, will return white (#ffffff) if considered a dark luminance or black (#000000)
   * if determined a light luminance.
   * 
   * @param color
   *          color used to check which font color should be used.
   * @return #ffffff if a dark color, else #000000 if a light color
   */
  public static String getUseWindowFontColor(String color)
  {

    if (isDarkColor(color))
    {
      return WHITE_FONT_COLOR;
    }
    else
    {
      return BLACK_FONT_COLOR;
    }
  }

  /**
   * Determines if the color is considered a dark luminance Currently uses a threshold value of 39
   * 
   * @param color
   *          Color to determine dark luminance
   * @return true if this is considered a dark luminance color, else false
   */
  public static boolean isDarkColor(String color)
  {
    int luminance = getLuminance(color);

    return luminance <= DARK_THRESHOLD;
  }

  /**
   * Get the luminance of the background color. This is based on the formula: <blue color> * 28 + <green color> * 151 + <red color> * 77
   * 
   * @param backgroundColor
   *          background color
   * @return Integer value of the luminance of the background color
   */
  public static Integer getLuminance(String backgroundColor)
  {
    Integer luminance = 0;

    if (backgroundColor == null || backgroundColor.equals(ODPConvertConstants.CSS_VALUE_TRANSPARENT))
    {
      return 255;
    }

    if (backgroundColor.contains(RGB_HTML_TAG))
    {
      backgroundColor = convertRGBValues(backgroundColor);
    }

    if (backgroundColor.length() <= 1)
    {
      return 255;
    }

    // Omit the leading # value
    int colorValue = Integer.valueOf(backgroundColor.substring(1), 16);
    int redColor = (colorValue & 0xFF0000) >>> 16;
    int greenColor = (colorValue & 0x00FF00) >>> 8;
    int blueColor = colorValue & 0x0000FF;

    // Current computation for detecting luminance to be consistent with Symphony
    luminance = ((blueColor * BLUE_LUM_ADJUST + redColor * RED_LUM_ADJUST + greenColor * GREEN_LUM_ADJUST) >>> 8);

    return luminance;
  }

  /**
   * Convert the html value from rgb to hex. If a value is not in rgb format, will just return the same value passed in. Would convert
   * rgb(255, 255, 255) to #ffffff
   * 
   * @param htmlValue
   *          html value to check if in rgb format and convert
   * @return Converted color value to hex format
   */
  private static String convertRGBValues(String htmlValue)
  {
    String rs = htmlValue;
    int start_idx = 0;
    if (htmlValue != null && htmlValue.length() > 0)
      start_idx = htmlValue.indexOf(RGB_HTML_TAG);
    if (start_idx != -1)
    {
      StringBuilder sb = new StringBuilder(32);
      int end_idx = -1;
      do
      {
        sb.append(htmlValue.substring(end_idx + 1, start_idx));
        end_idx = htmlValue.indexOf(")", start_idx);
        String colorV = Color.toSixDigitHexRGB(htmlValue.substring(start_idx, end_idx + 1));
        sb.append(colorV);
        start_idx = htmlValue.indexOf(RGB_HTML_TAG, end_idx + 1);
      }
      while (-1 != start_idx);
      sb.append(htmlValue.substring(end_idx + 1));
      rs = sb.toString();
    }
    return rs;
  }

}
