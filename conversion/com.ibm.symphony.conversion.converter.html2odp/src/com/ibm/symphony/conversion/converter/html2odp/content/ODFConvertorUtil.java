/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.html2odp.content;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.util.Iterator;
import java.util.Map;
import java.util.Map.Entry;
import java.util.logging.Logger;

import org.odftoolkit.odfdom.OdfElement;
import org.odftoolkit.odfdom.OdfFileDom;
import org.odftoolkit.odfdom.doc.office.OdfOfficeAutomaticStyles;
import org.odftoolkit.odfdom.doc.style.OdfStyle;
import org.odftoolkit.odfdom.doc.style.OdfStyleGraphicProperties;
import org.odftoolkit.odfdom.doc.style.OdfStyleTextProperties;
import org.odftoolkit.odfdom.dom.style.OdfStyleFamily;
import org.odftoolkit.odfdom.dom.style.props.OdfStyleProperty;
import org.w3c.dom.Attr;
import org.w3c.dom.Element;
import org.w3c.dom.NamedNodeMap;
import org.w3c.dom.Node;

import com.ibm.json.java.JSONObject;
import com.ibm.symphony.conversion.presentation.ODPCommonUtil;
import com.ibm.symphony.conversion.presentation.ODPConvertConstants;
import com.ibm.symphony.conversion.presentation.ODPMetaFile;
import com.ibm.symphony.conversion.converter.html2odp.style.CSSUtil;
import com.ibm.symphony.conversion.converter.html2odp.util.ContentConvertUtil;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.ConvertUtil;
import com.ibm.symphony.conversion.service.common.indextable.HtmlToOdfIndex;

@SuppressWarnings("unchecked")
public class ODFConvertorUtil
{
  private static final String CLASS = ODFConvertorUtil.class.getName();

  private static final Logger log = Logger.getLogger(CLASS);

  static JSONObject htmlTextMap = null;

  static JSONObject htmlTableMap = null;

  static JSONObject htmlTableCellMap = null;

  static
  {
    InputStream input1 = null;
    InputStream input2 = null;
    InputStream input3 = null;
    try
    {
      htmlTextMap = new JSONObject();
      htmlTextMap.putAll(ConvertUtil.getHtmlMap());
      input1 = ODFConvertorUtil.class.getResourceAsStream("Html-Text-Map.json");
      htmlTextMap.putAll(JSONObject.parse(input1));

      input2 = ODFConvertorUtil.class.getResourceAsStream("Html-Table-Map.json");
      htmlTableMap = JSONObject.parse(input2);

      input3 = ODFConvertorUtil.class.getResourceAsStream("Html-Table-Cell-Map.json");
      htmlTableCellMap = JSONObject.parse(input3);
    }
    catch (FileNotFoundException fnfException)
    {
      String message = ODPCommonUtil.createMessage(ODPCommonUtil.LOG_ERROR_OPENING_FILE, "Html-Text-Map.json");
      ODPCommonUtil.logException(message, fnfException);
    }
    catch (IOException ioException)
    {
      String message = ODPCommonUtil.createMessage(ODPCommonUtil.LOG_ERROR_OPENING_FILE, "Html-Text-Map.json");
      ODPCommonUtil.logException(message, ioException);
    }
    finally
    {
      ODPMetaFile.closeResource(input1);
      ODPMetaFile.closeResource(input2);
      ODPMetaFile.closeResource(input3);
    }
  }

  public static JSONObject getHtmlTextMap()
  {
    return htmlTextMap;
  }

  public static JSONObject getHtmlTableMap()
  {
    return htmlTableMap;
  }

  public static JSONObject getHtmlTableCellMap()
  {
    return htmlTableCellMap;
  }

  @SuppressWarnings("restriction")
  public static void copyPreservedProperties(OdfStyle newStyle, OdfStyle oldStyle)
  {
    if (newStyle != null && oldStyle != null)// need to copy preserved properties from old style to new style
    {
      NamedNodeMap attrsOld = oldStyle.getAttributes();
      for (int i = 0; i < attrsOld.getLength(); i++)
      {
        Node node = attrsOld.item(i).cloneNode(false);
        if (!newStyle.hasAttribute(node.getNodeName()))
          newStyle.setAttributeNode((Attr) node);
      }
      Map<OdfStyleProperty, String> oldProps = oldStyle.getStyleProperties();
      Iterator<Entry<OdfStyleProperty, String>> it = oldProps.entrySet().iterator();
      while (it.hasNext())
      {
        Entry<OdfStyleProperty, String> entry = it.next();
        if (!newStyle.hasProperty(entry.getKey()))
        {
          OdfStyleProperty prop = entry.getKey();
          // don't add concord supported properties for they maybe deleted by concord
          // String key = prop.getName().getPrefix() + ":" + prop.getName().getLocalName();
          newStyle.setProperty(prop, entry.getValue());
        }
      }
      // Remove any incompatible style properties
      String color = newStyle.getProperty(OdfStyleTextProperties.Color);
      if (color != null) // fo:color text property set?
      {
        String useWindowColor = newStyle.getProperty(OdfStyleTextProperties.UseWindowFontColor);
        if (useWindowColor != null && "true".equals(useWindowColor)) // style:use-window-font-color="true"?
        {
          newStyle.removeProperty(OdfStyleTextProperties.UseWindowFontColor);
          log.fine("Removing incompatible color attribute");
        }
      }
    }
  }

  @SuppressWarnings("restriction")
  public static void copySupportedTextProperties(OdfStyle newStyle, OdfStyle oldStyle)
  {
    if (newStyle != null && oldStyle != null)// need to copy preserved properties from old style to new style
    {
      NamedNodeMap attrsOld = oldStyle.getAttributes();
      for (int i = 0; i < attrsOld.getLength(); i++)
      {
        Node node = attrsOld.item(i).cloneNode(false);
        if (!newStyle.hasAttribute(node.getNodeName()))
          newStyle.setAttributeNode((Attr) node);
      }
      Map<OdfStyleProperty, String> oldProps = oldStyle.getStyleProperties();
      Iterator<Entry<OdfStyleProperty, String>> it = oldProps.entrySet().iterator();
      while (it.hasNext())
      {
        Entry<OdfStyleProperty, String> entry = it.next();
        if (!newStyle.hasProperty(entry.getKey()))
        {
          OdfStyleProperty prop = entry.getKey();
          String qName = prop.getName().getQName();
          if (!ConvertUtil.getODFMap().containsKey(qName))
            continue;

          // don't add concord supported properties for they maybe deleted by concord
          // String key = prop.getName().getPrefix() + ":" + prop.getName().getLocalName();
          newStyle.setProperty(prop, entry.getValue());
        }
      }
    }
  }

  @SuppressWarnings("restriction")
  public static OdfElement setOdfStyleGraphicPropertiesAttribute(OdfElement source, Class<OdfStyleGraphicProperties> target, String key,
      String value)
  {
    OdfElement tmp = null;
    if (source != null && source.getLength() > 0)
    {
      tmp = (OdfElement) OdfElement.findFirstChildNode(target, source);
      if (tmp != null)
        tmp.setOdfAttributeValue(ConvertUtil.getOdfName(key), value);
    }
    return tmp;
  }

  @SuppressWarnings("restriction")
  public static OdfElement updateOdfStyleGraphicPropertiesAttribute(OdfElement source, Class<OdfStyleGraphicProperties> target, String key,
      String value)
  {
    OdfElement tmp = null;
    if (source != null && source.getLength() > 0)
    {
      tmp = (OdfElement) OdfElement.findFirstChildNode(target, source);
      if (tmp != null && tmp.getAttribute(key) != null)
        tmp.setOdfAttributeValue(ConvertUtil.getOdfName(key), value);
    }
    return tmp;
  }

  @SuppressWarnings("restriction")
  public static OdfElement removeOdfStyleGraphicPropertiesAttribute(OdfElement source, Class<OdfStyleGraphicProperties> target, String key)
  {
    OdfElement tmp = null;
    if (source != null && source.getLength() > 0)
    {
      tmp = (OdfElement) OdfElement.findFirstChildNode(target, source);
      if (tmp != null)
        tmp.removeAttribute(key);
    }
    return tmp;
  }

  public static OdfElement convertElement(ConversionContext context, Element htmlElement)
  {

    OdfFileDom contentDom = (OdfFileDom) context.get("target");
    HtmlToOdfIndex indexTable = (HtmlToOdfIndex) context.get("indexTable");
    OdfElement odfElement = indexTable.getFirstOdfNode(htmlElement);
    if (odfElement != null)
      return odfElement;

    String htmlNodeName = htmlElement.getNodeName();

    JSONObject htmlMap = ODFConvertorUtil.getHtmlTextMap();
    String odfNodeName = (String) htmlMap.get(htmlNodeName);

    if (odfNodeName == null)
    {
      String elementClass = htmlElement.getAttribute(ODPConvertConstants.HTML_ATTR_CLASS);
      odfNodeName = ContentConvertUtil.getNodeNameByClass(elementClass);
    }

    if (odfNodeName != null && !ContentConvertUtil.NOT_FOUND.equals(odfNodeName))
    {
      odfElement = contentDom.createElementNS(ContentConvertUtil.getNamespaceUri(odfNodeName), odfNodeName);
    }
    return odfElement;
  }

  public static boolean isDrawingObject(Element htmlIMG)
  {
    Element parent = (Element) htmlIMG.getParentNode();
    return ODPConvertConstants.HTML_VALUE_DRAWING.equals(parent.getAttribute(ODPConvertConstants.HTML_ATTR_CONTEXTBOXTYPE));
  }

  @SuppressWarnings("restriction")
  public static OdfStyle createNewStyle(ConversionContext context, OdfElement odfElement, OdfStyleFamily family)
  {
    OdfFileDom contentDom = (OdfFileDom) context.get("target");
    OdfOfficeAutomaticStyles autoStyles = contentDom.getAutomaticStyles();
    String styleName = CSSUtil.getStyleName(family, "ro");
    OdfStyle style = new OdfStyle(contentDom);
    style.setStyleFamilyAttribute(family.getName());
    style.setStyleNameAttribute(styleName);
    autoStyles.appendChild(style);
    return style;
  }
  
  public static String getFontSizeFromClass(ConversionContext context, Element htmlElement)
  {
    String s_fontSize = "";

    NamedNodeMap attributes = htmlElement.getAttributes();
    String styleName = getStyleNameFromClass(attributes);

    Map<String, String> cssStyles = (Map<String, String>) context.get(ODPConvertConstants.CONTEXT_CSS_CONTENT_STYLE);

    if (cssStyles != null)
    {
      String style = cssStyles.get("." + styleName);
      if (style != null && style.indexOf(ODPConvertConstants.CSS_FONT_SIZE) > -1)
      {
        Map<String, String> styleMap = CSSUtil.buildCSSMap(style);
        String fontSize = styleMap.get(ODPConvertConstants.CSS_FONT_SIZE);
        if (fontSize != null && fontSize.length() > 0)
        {
          if (!fontSize.endsWith("%")) // Skip any that end with % (such as superscript/subscript)
          {
            int emIndex = fontSize.indexOf("em");
            s_fontSize = fontSize.substring(0, emIndex);
          }
        }
      }
    }

    return s_fontSize;
  }
  
  public static String getStyleNameFromClass(NamedNodeMap attrs)
  {
    Node classAttr = attrs.getNamedItem(ODPConvertConstants.HTML_ATTR_CLASS);
    if (classAttr == null)
      return "";
    
    String[] classes = classAttr.getNodeValue().trim().split(ODPConvertConstants.SYMBOL_WHITESPACE);
    if (classes == null || classes.length < 2)
      return "";
    return classes[1];
  }

}
