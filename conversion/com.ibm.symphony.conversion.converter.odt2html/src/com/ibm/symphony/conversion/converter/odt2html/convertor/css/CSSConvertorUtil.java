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

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStreamWriter;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.Map;
import java.util.StringTokenizer;
import java.util.Map.Entry;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.Set;

import org.odftoolkit.odfdom.OdfElement;
import org.odftoolkit.odfdom.doc.OdfDocument;
import org.odftoolkit.odfdom.doc.office.OdfOfficeAutomaticStyles;
import org.odftoolkit.odfdom.doc.office.OdfOfficeStyles;
import org.odftoolkit.odfdom.doc.style.OdfStyle;
import org.odftoolkit.odfdom.doc.text.OdfTextListStyle;
import org.odftoolkit.odfdom.doc.text.OdfTextOutlineStyle;
import org.odftoolkit.odfdom.dom.element.OdfStyleBase;
import org.odftoolkit.odfdom.dom.element.OdfStylePropertiesBase;
import org.odftoolkit.odfdom.dom.style.OdfStyleFamily;
import org.odftoolkit.odfdom.dom.style.props.OdfStylePropertiesSet;
import org.odftoolkit.odfdom.dom.style.props.OdfTextProperties;
import org.odftoolkit.odfdom.type.Length.Unit;
import org.w3c.dom.Attr;
import org.w3c.dom.NamedNodeMap;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

import com.ibm.json.java.JSONObject;
import com.ibm.symphony.conversion.converter.odt2html.convertor.html.HtmlConvertorUtil;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.ConvertUtil;
import com.ibm.symphony.conversion.service.common.HtmlCSSConstants;
import com.ibm.symphony.conversion.service.common.IConvertor;
import com.ibm.symphony.conversion.service.common.ODFConstants;
import com.ibm.symphony.conversion.service.common.g11n.G11NFontFamilyUtil;
import com.ibm.symphony.conversion.service.common.util.UnitUtil;

public class CSSConvertorUtil
{
  private static final Logger LOG = Logger.getLogger(CSSConvertorUtil.class.getName());

  private static int DARK_THRESHOLD = 38;

  public static final String LIST_CLASS_PATTERN = "(.?[_][\\d].?\\b)";

  public static String getStyleName(OdfElement element)
  {
    if (ODFConstants.STYLE_DEFAULT_STYLE.equals(element.getNodeName()))
    {
      return "default-style_" + element.getAttribute(ODFConstants.STYLE_FAMILY);
    }
    else if (ODFConstants.STYLE_LIST_LEVEL_PROPERTIES.equals(element.getNodeName()))
    {
      OdfElement parent = (OdfElement) element.getParentNode();
      String txtLevel = parent.getAttribute(ODFConstants.TEXT_LEVEL);
      OdfElement styleList = (OdfElement) parent.getParentNode();
      String styleName = styleList.getAttribute(ODFConstants.STYLE_NAME);
      return styleName + "_" + txtLevel;
    }
    else if (ODFConstants.TEXT_LIST_LEVEL_STYLE_BULLET.equals(element.getNodeName())
        || ODFConstants.TEXT_LIST_LEVEL_STYLE_NUMBER.equals(element.getNodeName())
        || ODFConstants.TEXT_LIST_LEVEL_STYLE_IMAGE.equals(element.getNodeName())
        || ODFConstants.TEXT_OUTLINE_LEVEL_STYLE.equals(element.getNodeName()))
    {
      String txtLevel = element.getAttribute(ODFConstants.TEXT_LEVEL);
      if (ODFConstants.TEXT_OUTLINE_LEVEL_STYLE.equals(element.getNodeName()))
      {
        int level = Integer.parseInt(txtLevel);
        if (level > 6)
        {
          txtLevel = "6";
        }
      }
      OdfElement styleList = (OdfElement) element.getParentNode();
      String styleName = styleList.getAttribute(ODFConstants.STYLE_NAME);
      return styleName + "_" + txtLevel;
    }
    else
    {
      Attr attr = element.getAttributeNode(ODFConstants.STYLE_NAME);
      if (attr != null)
      {
        return attr.getValue();
      }
      else
      {
        Object parentObj = element.getParentNode();
        if (parentObj != null && parentObj instanceof OdfElement)
        {
          OdfElement parent = (OdfElement) parentObj;
          return getStyleName(parent);
        }
        else
          return null;
      }
    }

  }

  public static OdfElement getStyleElement(OdfElement element)
  {
    if (ODFConstants.STYLE_DEFAULT_STYLE.equals(element.getNodeName()))
    {
      return element;
    }
    else
    {

      String styleName = element.getAttribute(ODFConstants.STYLE_NAME);
      if (styleName.length() > 0)
      {
        return element;
      }
      else
      {
        Object parentObj = element.getParentNode();
        if (parentObj != null && parentObj instanceof OdfElement)
        {
          OdfElement parent = (OdfElement) parentObj;
          return getStyleElement(parent);
        }
        return null;

      }
    }

  }

  public static Map<String, String> getStyleMap(String styleName, Map<String, Map<String, String>> styles)
  {
    Map<String, String> styleMap = styles.get(styleName);
    if (styleMap == null)
    {
      styleMap = new HashMap<String, String>();
      styles.put(styleName, styleMap);
    }
    return styleMap;
  }

  public static void inheritParentStyle(ConversionContext context, OdfElement element, Map<String, Map<String, String>> styles)
  {
    // inherit parent style
    String styleName = getStyleName(element);
    String parentStyleName = element.getAttribute(ODFConstants.STYLE_PARENT_STYLE_NAME);
    Map<String, String> styleMap = getStyleMap(styleName, styles);

    if (parentStyleName != null && parentStyleName.length() > 0)
    {
      Map<String, String> relationMap = getStyleParentRelationshipMap(context);
      relationMap.put(styleName, parentStyleName);
      Map<String, String> parentStyleMap = styles.get(parentStyleName);
      if (parentStyleMap != null)
      {
        if (parentStyleMap.containsKey("border") && parentStyleMap.get("border").indexOf("none") != -1)
          parentStyleMap.remove("border");
        styleMap.putAll(parentStyleMap);
      }
      else
      {
        OdfStyle odfStyle = (OdfStyle) element;
        if (odfStyle.getParentStyle() != null)
        {
          OdfElement parent = (OdfElement) odfStyle.getParentStyle();
          IConvertor styleConvertor = CSSConvertorFactory.getInstance().getConvertor(parent);
          styleConvertor.convert(context, parent, styles);
          parentStyleMap = styles.get(parentStyleName);
          if (parentStyleMap != null)
          {
            if (parentStyleMap.containsKey("border") && parentStyleMap.get("border").indexOf("none") != -1)
              parentStyleMap.remove("border");
            styleMap.putAll(parentStyleMap);
          }
        }
      }
    }
    else if("Default_20_Text".equals(styleName))
    {
      Map<String, String> defaultStyle = styles.get("default-style_paragraph");
      styleMap.putAll(defaultStyle);
    }
  }

  public static void parseStyle(ConversionContext context, OdfElement element, Map<String, Map<String, String>> styles)
  {
    String styleName = getStyleName(element);

    Map<String, String> styleMap = getStyleMap(styleName, styles);
    JSONObject jsObj = ConvertUtil.getODFMap();

    // parseStyle
    NamedNodeMap attributes = element.getAttributes();
    for (int i = 0; i < attributes.getLength(); i++)
    {
      Node attr = attributes.item(i);
      String odfAttribute = attr.getNodeName();
      String htmlAttribute = (String) jsObj.get(odfAttribute);
      if (htmlAttribute != null)
      {
        processAttributeValue(context, styleMap, element, odfAttribute, htmlAttribute, attr.getNodeValue());
      }
    }
  }

  private static Map<String, String> alignMap;

  static
  {
    alignMap = new HashMap<String, String>();
    alignMap.put(HtmlCSSConstants.BEGIN, HtmlCSSConstants.LEFT);
    alignMap.put(HtmlCSSConstants.CENTER, HtmlCSSConstants.CENTER);
    alignMap.put(HtmlCSSConstants.END, HtmlCSSConstants.RIGHT);
    alignMap.put(HtmlCSSConstants.JUSTIFY, HtmlCSSConstants.JUSTIFY);
    alignMap.put(HtmlCSSConstants.START, HtmlCSSConstants.LEFT);
    alignMap.put(HtmlCSSConstants.LEFT, HtmlCSSConstants.LEFT);
    alignMap.put(HtmlCSSConstants.RIGHT, HtmlCSSConstants.RIGHT);
  }

  private static void processAttributeValue(ConversionContext context, Map<String, String> styleMap, OdfElement element,
      String odfAttribute, String attribute, String value)
  {
    if (UnitUtil.getUnit(value).toLowerCase().equals(Unit.INCH.abbr()))
    {
      String cmValue = UnitUtil.convertINToCM(value);
      value = cmValue;
    }
    if (attribute.startsWith(HtmlCSSConstants.BORDER))
    {
      styleMap.put(attribute, ConvertUtil.convertUnitsToPT(value));
    }
    else if (HtmlCSSConstants.FONT_SIZE.equals(attribute) && value.endsWith("%"))
    {
      int val = Integer.parseInt(value.substring(0, value.length() - 1));
      String parentFontSizeStr = styleMap.get(HtmlCSSConstants.FONT_SIZE);
      double parentFontSize = 12.0;
      if (parentFontSizeStr != null)
      {
        parentFontSize = Double.parseDouble(parentFontSizeStr.substring(0, parentFontSizeStr.length() - 2));
      }
      else
      {
        // get the default font size from the default-style
        Map<String, Map<String, String>> map = (Map<String, Map<String, String>>) context.get("InplaceStyle");
        Map<String, String> defaultStyleMap = map.get("default-style_paragraph");
        if (defaultStyleMap != null)
        {
          String strDefaultFontSize = defaultStyleMap.get("font-size");
          if (strDefaultFontSize != null && strDefaultFontSize.endsWith("pt"))
          {
            parentFontSize = Double.parseDouble(strDefaultFontSize.substring(0, strDefaultFontSize.length() - 2));
          }
        }
      }
      double fontSize = parentFontSize * val / 100;
      styleMap.put(attribute, fontSize + "pt");
    }
    else if (HtmlCSSConstants.TEXT_ALIGN.equals(attribute))
    {
      String align = alignMap.get(value);
      if (align != null)
      {
        styleMap.put(attribute, align);
      }
    }
    else if (HtmlCSSConstants.VERTICAL_ALIGN.equals(attribute))
    {
      String align = (value == null) ? "" : value.trim();
      if (!align.equals(""))
      {
        styleMap.put(attribute, align);
      }
    }
    else if (HtmlCSSConstants.BACKGROUND_COLOR.equals(attribute))
    {
      if (ODFConstants.ODF_ATTR_DRAW_FILL_COLOR.equals(odfAttribute))
      {
        String drawFill = element.getAttribute(ODFConstants.ODF_ATTR_DRAW_FILL);
        if (!"solid".equals(drawFill))
          return;
      }
      // the transparent color should not override the original color
      if (HtmlCSSConstants.TRANSPARENT.equals(value))
      {
        if (!styleMap.containsKey(attribute))
          styleMap.put(attribute, value);
      }
      else
        styleMap.put(attribute, value);
    }
    else if (HtmlCSSConstants.DIRECTION.equals(attribute))
    {
    	if(ODFConstants.RL_TB.equalsIgnoreCase(value))
    		styleMap.put(attribute, HtmlCSSConstants.RTL);
    	else if(ODFConstants.LR_TB.equalsIgnoreCase(value))
    		styleMap.put(attribute, HtmlCSSConstants.LTR);
    }
    else
    {
      styleMap.put(attribute, value);
    }
  }

  private static String getFontName(ConversionContext context, String fontName)
  {
    Map<String, String> fontMap = getFontMap(context);
    String font = fontMap.get(fontName);
    if (font == null)
      font = fontName;
    return font;
  }

  public static void storeToCSSFile(Map<String, Map<String, String>> styles, File file) throws Exception
  {
    FileOutputStream os = null;
    OutputStreamWriter writer = null;
    try
    {
      os = new FileOutputStream(file);
      writer = new OutputStreamWriter(os, "UTF8");
      Iterator<Entry<String, Map<String, String>>> stylesIt = styles.entrySet().iterator();
      String crlf = System.getProperty("line.separator");
      while (stylesIt.hasNext())
      {
        Entry<String, Map<String, String>> entry = stylesIt.next();
        writer.write(entry.getKey());
        writer.write(" {\n");
        Map<String, String> style = entry.getValue();
        Iterator<Entry<String, String>> it = style.entrySet().iterator();
        while (it.hasNext())
        {
          Entry<String, String> styleItem = it.next();
          writer.write(styleItem.getKey());
          writer.write(":");
          writer.write(styleItem.getValue());
          writer.write(";");
          writer.write(crlf);
        }
        writer.write("}");
        writer.write(crlf);
      }
      writer.flush();
    }
    catch (Exception e)
    {
      throw e;
    }
    finally
    {
      if (writer != null)
      {
        try
        {
          writer.close();
        }
        catch (IOException e)
        {
          LOG.log(Level.WARNING, "Failed to close OutputStreamWriter", e);
        }
      }
      if (os != null)
      {
        try
        {
          os.close();
        }
        catch (IOException e)
        {
          LOG.log(Level.WARNING, "Failed to close OutputStream", e);
        }
      }
    }
  }

  public static void convertChildren(ConversionContext context, OdfElement element, Map<String, Map<String, String>> map)
  {
    NodeList children = element.getChildNodes();
    for (int i = 0; i < children.getLength(); i++)
    {
      Node child = children.item(i);
      if (child instanceof OdfElement)
      {
        CSSConvertorFactory.getInstance().getConvertor(child).convert(context, child, map);
      }
    }
  }

  public static Map<String, String> getFontMap(ConversionContext context)
  {
    Map<String, String> fontMap = (Map<String, String>) context.get("FontMap");
    if (fontMap == null)
    {
      fontMap = new HashMap<String, String>();
      context.put("FontMap", fontMap);
    }
    return fontMap;
  }

  public static Map<String, String> getPageBreakMap(ConversionContext context)
  {
    Map<String, String> pageBreakMap = (Map<String, String>) context.get("PageBreakMap");
    if (pageBreakMap == null)
    {
      pageBreakMap = new HashMap<String, String>();
      context.put("PageBreakMap", pageBreakMap);
    }
    return pageBreakMap;
  }

  public static Map<String, OdfElement> getGraphicStyleElementMap(ConversionContext context)
  {
    Map<String, OdfElement> graphicStyles = (Map<String, OdfElement>) context.get("GraphicStyleElementMap");
    if (graphicStyles == null)
    {
      graphicStyles = new HashMap<String, OdfElement>();
      context.put("GraphicStyleElementMap", graphicStyles);
    }
    return graphicStyles;
  }

  public static Map<String, String> getStyleParentRelationshipMap(ConversionContext context)
  {
    Map<String, String> relationMap = (Map<String, String>) context.get("ParentMap");
    if (relationMap == null)
    {
      relationMap = new HashMap<String, String>();
      context.put("ParentMap", relationMap);
    }
    return relationMap;
  }

  public static Set<String> getUsedMasterPageNameSet(ConversionContext context)
  {
    Set<String> masterPages = (Set<String>) context.get("UsedMasterPageNameSet");
    if (masterPages == null)
    {
      masterPages = new HashSet<String>();
      context.put("UsedMasterPageNameSet", masterPages);
    }
    return masterPages;
  }

  public static Set<String> getPageLayoutStyleSet(ConversionContext context)
  {
    Set<String> pageLayouts = (Set<String>) context.get("ConcordPageLayoutStyles");
    if (pageLayouts == null)
    {
      pageLayouts = new HashSet<String>();
      context.put("ConcordPageLayoutStyles", pageLayouts);
    }
    return pageLayouts;
  }

  public static Set<String> getAutoColorStyles(ConversionContext context)
  {
    Set<String> styles = (Set<String>) context.get("AutoColorStyles");
    if (styles == null)
    {
      styles = new HashSet<String>();
      context.put("AutoColorStyles", styles);
    }
    return styles;
  }

  public static String getElementStyleVaule(ConversionContext context, OdfElement element, String attribute)
  {
    Map<String, Map<String, String>> map = (Map<String, Map<String, String>>) context.get("InplaceStyle");

    Map<String, String> styleMap = HtmlConvertorUtil.getElementStyleMap(element, map);

    if (styleMap != null)
    {
      String bkColor = styleMap.get(attribute);
      if (bkColor != null)
        return bkColor;
    }

    Node parent = element.getParentNode();

    if (parent != null && (parent instanceof OdfElement) && !ODFConstants.OFFICE_TEXT.equals(parent.getNodeName()))
    {
      return getElementStyleVaule(context, (OdfElement) parent, attribute);
    }
    else
    {
      return null;
    }

  }

  public static String getWindowFontColor(String backgroundColor)
  {
    try
    {
      int colorVal = Integer.valueOf(backgroundColor.substring(1), 16);
      // r*0.59 g*0.3 b *.11
      int r = (colorVal & 0xFF0000) >>> 16;
      int g = (colorVal & 0x00FF00) >>> 8;
      int b = colorVal & 0x0000FF;
      int luminance = (r * 77 + g * 151 + b * 28) >>> 8;
      if (luminance <= DARK_THRESHOLD)
      {
        // dark color
        return "#FFFFFF";
      }
      else
      {
        return "#000000";
      }

    }
    catch (NumberFormatException e)
    {

    }
    return null;
  }

  public static OdfStyle getStyleElement(ConversionContext context, String name, OdfStyleFamily familyType)
  {
    try
    {
      OdfDocument odfDoc = (OdfDocument) context.getSource();
      OdfOfficeStyles odfStyles = odfDoc.getStylesDom().getOfficeStyles();
      OdfOfficeAutomaticStyles autoStyles = null;
      if (ODFConstants.OFFICE_TEXT.equals(context.get("contentRootNode")))
      {
        autoStyles = odfDoc.getContentDom().getAutomaticStyles();
      }
      else
      {
        autoStyles = odfDoc.getStylesDom().getAutomaticStyles();
      }
      OdfStyle oldStyle = null;
      if (autoStyles != null)
      {
        oldStyle = autoStyles.getStyle(name, familyType);
      }
      if (odfStyles != null && oldStyle == null)
      {
        oldStyle = odfStyles.getStyle(name, familyType);
      }
      return oldStyle;
    }
    catch (Exception e)
    {
      return null;
    }
  }

  public static abstract class LevelsWrapper
  {
    protected OdfElement source;

    LevelsWrapper(OdfElement source)
    {
      this.source = source;
    }

    public OdfElement getSource()
    {
      return this.source;
    }

    public abstract OdfElement getLevel(int i);

  }

  public static LevelsWrapper generateListStyleWapper(OdfTextListStyle listStyle)
  {
    return new LevelsWrapper(listStyle)
    {
      @Override
      public OdfElement getLevel(int i)
      {
        OdfTextListStyle style = (OdfTextListStyle) source;
        return style.getLevel(i);
      }
    };
  }

  public static LevelsWrapper generateListStyleWapper(OdfTextOutlineStyle outline)
  {
    return new LevelsWrapper(outline)
    {
      @Override
      public OdfElement getLevel(int i)
      {
        OdfTextOutlineStyle outline = (OdfTextOutlineStyle) source;
        return outline.getLevel(i);
      }

    };
  }

  public static LevelsWrapper getTextListStyleElement(ConversionContext context, String name)
  {
    try
    {
      OdfDocument odfDoc = (OdfDocument) context.getSource();
      OdfOfficeStyles odfStyles = odfDoc.getStylesDom().getOfficeStyles();
      if ("Outline".equalsIgnoreCase(name))
      {
        OdfTextOutlineStyle outline = odfStyles.getOutlineStyle();
        return generateListStyleWapper(outline);
      }

      OdfOfficeAutomaticStyles autoStyles;
      if (ODFConstants.OFFICE_TEXT.equals(context.get("contentRootNode")))
      {
        autoStyles = odfDoc.getContentDom().getAutomaticStyles();
      }
      else
      {
        autoStyles = odfDoc.getStylesDom().getAutomaticStyles();
      }

      OdfTextListStyle oldStyle = null;
      if (autoStyles != null)
      {
        oldStyle = autoStyles.getListStyle(name);
      }
      if (odfStyles != null && oldStyle == null)
      {
        oldStyle = odfStyles.getListStyle(name);
      }

      if (oldStyle != null)
      {
        return generateListStyleWapper(oldStyle);
      }

      return null;
    }
    catch (Exception e)
    {
      return null;
    }
  }

  public static OdfElement getTextListLevelStyleElement(ConversionContext context, String styleName)
  {
    String name = styleName.substring(0, styleName.lastIndexOf('_'));
    String strLevel = styleName.substring(styleName.lastIndexOf('_') + 1);
    LevelsWrapper levels = CSSConvertorUtil.getTextListStyleElement(context, name);
    if (levels == null)
    {
      return null;
    }
    try
    {
      return levels.getLevel(Integer.parseInt(strLevel));
    }
    catch (NumberFormatException e)
    {
      return null;
    }
  }

  public static String getHtmlFontFamily(ConversionContext context, OdfStyleBase style)
  {
    String locale = (String) context.get("locale");
    boolean isCJK = false;
    if(ConvertUtil.CJKLocale.contains(locale))
    {
      OdfStylePropertiesBase textStyle = style.getPropertiesElement(OdfStylePropertiesSet.TextProperties);
      if(textStyle != null)
      {
        String fontName = textStyle.getAttribute(ODFConstants.STYLE_FONT_NAME);
        String fontNameAsian = textStyle.getAttribute(ODFConstants.STYLE_FONT_NAME_ASIAN);
        if(!"".equals(fontName) && "".equals(fontNameAsian))
          isCJK = false;
        else
          isCJK = true;
      }
    }
    
    String fontName = style.getProperty(OdfTextProperties.FontName);
    boolean isParagraphStyle = style.getFamily().equals(OdfStyleFamily.Paragraph);
    fontName = getFontName(context, fontName);
    StringBuilder fontBuf = new StringBuilder();
    if (fontName == null || fontName.length() == 0)
    {
      if (isParagraphStyle)
      {
        fontName = (String) context.get("DefaultFontName");
      }
    }

    String fontNameAsian = style.getProperty(OdfTextProperties.FontNameAsian);
    fontNameAsian = getFontName(context, fontNameAsian);
    if (fontNameAsian == null || fontNameAsian.length() == 0)
    {
      if (isParagraphStyle)
      {
        fontNameAsian = (String) context.get("DefaultFontNameAsian");
      }
    }

    String fontNameComplex = style.getProperty(OdfTextProperties.FontNameComplex);
    fontNameComplex = getFontName(context, fontNameComplex);
    if (fontNameComplex == null || fontNameComplex.length() == 0)
    {
      if (isParagraphStyle)
      {
        fontNameComplex = (String) context.get("DefaultFontNameComplex");
      }
    }

    
    if (!isCJK)
    {
      if (fontName != null && fontName.length() > 0)
      {
        fontBuf.append(fontName);
        fontBuf.append(',');
      }
      else
    	  return "";
      
      if (fontNameAsian != null && fontNameAsian.length() > 0)
      {
        fontBuf.append(fontNameAsian);
        fontBuf.append(',');
      }
    }
    else
    {
      if (fontNameAsian != null && fontNameAsian.length() > 0)
      {
        fontBuf.append(fontNameAsian);
        fontBuf.append(',');
      }
      else
    	  return "";

      if (fontName != null && fontName.length() > 0)
      {
        fontBuf.append(fontName);
        fontBuf.append(',');
      }
    }
    if (fontNameComplex != null && fontNameComplex.length() > 0 && fontBuf.length() > 0)
    {
      fontBuf.append(fontNameComplex);
      fontBuf.append(',');
    }

    String font;
    if (fontBuf.length() > 0)
      font = fontBuf.substring(0, fontBuf.length() - 1);
    else
      font = "";

    return G11NFontFamilyUtil.getFontFamilyWithFallBack(font);
  }

  public static String getStyleAttribute(OdfStyleBase style, String attributeName)
  {
    if (style.hasAttribute(attributeName))
    {
      return style.getAttribute(attributeName);
    }
    OdfStyleBase parentStyle = style.getParentStyle();
    if (parentStyle != null)
    {
      return getStyleAttribute(parentStyle, attributeName);
    }
    else
      return null;
  }

  public static void reOrgMarginBorderPadding(Map<String, String> styleMap, String tagName)
  {
    String margin = styleMap.get(tagName);
    if (margin == null || margin.equals(""))
      return;

    String marginLeft = null;
    String marginRight = null;
    String marginTop = null;
    String marginBottom = null;
    StringTokenizer st = new StringTokenizer(margin, " ");
    int i = 0;
    while (st.hasMoreTokens())
    {
      i++;
      String subV = st.nextToken();
      switch (i)
        {
          case 1 :
            marginRight = subV;
            marginLeft = subV;
            marginTop = subV;
            marginBottom = subV;
            break;
          case 2 :
            marginRight = subV;
            marginLeft = subV;
            break;
          case 3 :
            marginBottom = subV;
            break;
          case 4 :
            marginLeft = subV;
            break;
        }
    }
    styleMap.put(tagName + "-top", marginTop);
    styleMap.put(tagName + "-right", marginRight);
    styleMap.put(tagName + "-bottom", marginBottom);
    styleMap.put(tagName + "-left", marginLeft);
    styleMap.remove(tagName);
  }
}
