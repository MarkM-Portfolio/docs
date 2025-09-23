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

import java.io.BufferedOutputStream;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.regex.Pattern;

import org.odftoolkit.odfdom.OdfElement;
import org.w3c.dom.Element;
import org.w3c.dom.NamedNodeMap;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

import com.ibm.json.java.JSONObject;
import com.ibm.symphony.conversion.presentation.ODPCommonUtil;
import com.ibm.symphony.conversion.presentation.ODPConvertConstants;
import com.ibm.symphony.conversion.presentation.ODPMetaFile;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.ODFConstants;
import com.ibm.symphony.conversion.service.common.indextable.DOMIdGenerator;
import com.ibm.symphony.conversion.service.common.util.Measure;
import com.ibm.symphony.conversion.service.common.util.MeasurementUtil;

public class ODPConvertUtil
{
  private static final String CLASS = ODPConvertUtil.class.getName();

  private static final Logger LOG = Logger.getLogger(CLASS);

  private static final String URI_REGEX = "^[a-z]+[a-z0-9\\+\\-\\.]*:.*";

  private static final Pattern URI_PATTERN = Pattern.compile(URI_REGEX);

  private static JSONObject listSequence = null;

  static
  {
    InputStream input = null;
    try
    {
      input = ODPConvertUtil.class.getResourceAsStream("ListSequence.json");
      listSequence = JSONObject.parse(input);
    }
    catch (IOException e)
    {
      String message = ODPCommonUtil.createMessage(ODPCommonUtil.LOG_UNEXPECTED_EXCEPTION_IN, CLASS + ".init");
      ODPCommonUtil.logException(Level.WARNING, message, e);
    }
    finally
    {
      ODPMetaFile.closeResource(input);
    }
  }

  public static boolean createFile(String filePath)
  {
    File file = new File(filePath);
    if (file.getParentFile().exists())
    {
      file.getParentFile().mkdir();
    }
    if (!file.exists())
    {
      try
      {
        return file.createNewFile();
      }
      catch (IOException e)
      {
        String message = ODPCommonUtil.createMessage(ODPCommonUtil.LOG_UNEXPECTED_EXCEPTION_IN, CLASS + ".createFile");
        ODPCommonUtil.logException(Level.SEVERE, message, e);
        return false;
      }
    }
    return false;
  }

  public static void writeContents(String filePath, byte[] bytes)
  {
    BufferedOutputStream bufOS = null;

    try
    {
      bufOS = new BufferedOutputStream(new FileOutputStream(new File(filePath)));
      bufOS.write(bytes);
    }
    catch (FileNotFoundException e)
    {
      String message = ODPCommonUtil.createMessage(ODPCommonUtil.LOG_UNEXPECTED_EXCEPTION_IN, CLASS + ".writeContents");
      ODPCommonUtil.logException(Level.WARNING, message, e);
    }
    catch (IOException e)
    {
      String message = ODPCommonUtil.createMessage(ODPCommonUtil.LOG_UNEXPECTED_EXCEPTION_IN, CLASS + ".writeContents");
      ODPCommonUtil.logException(Level.WARNING, message, e);
    }
    finally
    {
      ODPMetaFile.closeResource(bufOS);
    }
  }

  public static final String replaceUnderlineToU(String name)
  {
    return name != null ? name.replaceFirst("^_", ODPConvertConstants.SYMBOL_U) : null;
  }

  public static final String formatAttribute(String key, String value)
  {
    return key + ODPConvertConstants.SYMBOL_COLON + value + ODPConvertConstants.SYMBOL_SEMICOLON;
  }

  /**
   * Convert the name of an ODP attribute name to an HTML attribute name such that this attribute name will be preserved within the HTML
   * (but not used). The name will be automatically decoded when the HTML is exported back to its ODP name.
   * 
   * @param toSave
   *          attribute name to save
   * @return converted attribute name
   */
  public static String createSavedAttributeName(String toSave)
  {
    if (toSave == null)
    {
      return null;
    }
    return toSave.replace(':', '_');
  }

  /**
   * Determine if this URI absolute.
   * 
   * @param uri
   *          - unprocessed URI string
   * @return true is absolute
   */
  public static boolean isAbsoluteURI(String uri)
  {
    if (uri == null)
    {
      return false;
    }
    // match regular expression to detect an "absolute" URI which
    // always has a scheme portion i.e. http: or ftp:. A scheme
    // always has the form 'alpha *(alpha | digit | + | - | .) :'
    // (from RFC 2396).

    return URI_PATTERN.matcher(uri).matches();
  }

  /**
   * Sets the Concord ID attribute on the ODF Node. Note: This method should not be used for documents prior to office:version 1.2 as the
   * IDs have been found to not be unique.
   * <p>
   * This method attempts to use the node's own ID. If no ODF Node ID is found, the Concord ID is not set. The node's own ID is determined
   * by a generic search order:
   * <ol>
   * <li>xml:id
   * <li>draw:id
   * <li>text:id
   * <li>table:id
   * </ol>
   * <p>
   * 
   * @param node
   *          ODF Node to set the Concord ID on
   * @return void
   * 
   */
  @SuppressWarnings("restriction")
  public static void setConcordId(OdfElement node)
  {
    // Generic Search Order for the Node's ID: (1) xml:id (2) draw:id (3) text:id (4) table:id
    String id = node.getAttribute(ODPConvertConstants.ODF_ATTR_XMLID);
    if ((id == null) || (id.length() < 1))
    {
      id = node.getAttribute(ODPConvertConstants.ODF_ATTR_DRAWID);
      if ((id == null) || (id.length() < 1))
      {
        id = node.getAttribute(ODPConvertConstants.ODF_ATTR_TEXTID);
        if ((id == null) || (id.length() < 1))
        {
          id = node.getAttribute(ODPConvertConstants.ODF_ATTR_TABLEID);
        }
      }
    }

    // If we didn't find a Node specific ID, don't set the Concord ID yet (let Common Conversion code handle this)
    if ((id != null) && (id.length() >= 1))
    {
      node.setAttribute(ODPConvertConstants.CONCORD_ODF_ATTR_ID, id);
      if (LOG.isLoggable(Level.FINE))
      {
        LOG.fine("Setting id for " + node.getNodeName() + " to \"" + id + "\"");
      }
    }
  }

  /**
   * Sets the Concord ID attribute on the ODF Node with a prefix prepended
   * <p>
   * This method sets the Concord ID on the ODF Node with a automatically generated with the provided prefix prepended onto the ID.
   * <p>
   * 
   * @param node
   *          ODF Node to set the Concord ID on
   * @param prefix
   *          String to prefix on the automatically generated Concord ID
   * @return void
   * 
   */
  @SuppressWarnings("restriction")
  public static void setAutomaticXmlConcordId(OdfElement node, String prefix)
  {
    String id = DOMIdGenerator.generate();
    id = prefix + id;
    node.setAttribute(ODPConvertConstants.CONCORD_ODF_ATTR_ID, id);
    if (ODPConvertConstants.DEBUG)
    {
      LOG.fine("Setting id for " + node.getNodeName() + " to \"" + id + "\"");
    }
  }

  /**
   * Sets the Concord ID attribute on the HTML Node with a prefix prepended
   * <p>
   * This method sets the Concord ID on the HTML Node with a automatically generated with the provided prefix prepended onto the ID.
   * <p>
   * 
   * @param node
   *          HTML Node to set the Concord ID on
   * @param prefix
   *          String to prefix on the automatically generated Concord ID
   * @return void
   * 
   */
  public static void setAutomaticHtmlConcordId(Element node, String prefix)
  {
    String id = DOMIdGenerator.generate();
    id = prefix + id;
    node.setAttribute(ODPConvertConstants.CONCORD_ODF_ATTR_ID, id);
    if (ODPConvertConstants.DEBUG)
    {
      LOG.fine("Setting id for " + node.getNodeName() + " to \"" + id + "\"");
    }
  }

  /**
   * Determines if the ODF Node contains a textbox
   * <p>
   * 
   * @param node
   *          ODF Node to check
   * @return boolean true if the ODF contains a textbox
   * 
   */
  public static boolean containsTextBox(Node odfNode)
  {
    NodeList childrenNodes = odfNode.getChildNodes();
    int childrenNum = childrenNodes.getLength();
    for (int i = 0; i < childrenNum; i++)
    {
      Node node = childrenNodes.item(i);
      // make sure it has text.
      if (node.getPrefix().equals(ODPConvertConstants.TEXT) && node.hasChildNodes())
      {
        return true;
      }
    }
    return false;
  }

  public static String getClasses(List<Node> frameClassList)
  {
    Iterator<Node> iter = frameClassList.iterator();
    StringBuilder buffer = new StringBuilder(256);
    while (iter.hasNext())
    {
      buffer.append(ODPConvertConstants.SYMBOL_WHITESPACE);
      buffer.append(((Node) iter.next()).getNodeValue());
    }
    return buffer.toString();
  }

  public static String calculateMultiplyWithPercent(String length, String percent)
  {
    if (length.length() <= 2 || !percent.endsWith("%"))
      return length;
    String unit = length.substring(length.length() - 2);
    String number = length.substring(0, length.length() - 2);

    try
    {
      double val = Double.parseDouble(number);
      double p = Double.parseDouble(percent.substring(0, percent.length() - 1));
      return val * p / 100 + unit;
    }
    catch (Exception e)
    {
      return length;
    }
  }

  static final String ELEMENT_DELIMETER = "|-|";

  static final String ELEMENT_LEVEL_DELIMETER = "|!|";

  static final String ATTRIBUTE_DELIMETER = "|!|";

  static final String ATTRIBUTE_NAME_VALUE_DELIMETER = "::";

  static final String ELEMENT = "ELEMENT::";

  static final String LEVEL = "LEVEL::";

  /**
   * Builds a String representing a flattened odfElement Node so it can stored as an HTML attribute
   * 
   * @param odfElement
   *          ODF Element to Flatten
   * @param level
   *          Level of attribute
   * @return String Flattened version of ODF Element Node
   */
  public static String flattenElement(Node odfElement, int level)
  {
    StringBuilder builder = new StringBuilder(512);
    return flattenElement(odfElement, builder, level).toString();
  }

  private static StringBuilder flattenElement(Node odfElement, StringBuilder builder, int level)
  {
    builder.append(ELEMENT);
    builder.append(odfElement.getNodeName());
    builder.append(ELEMENT_LEVEL_DELIMETER + LEVEL);
    builder.append(level);
    builder.append(ELEMENT_DELIMETER);

    NamedNodeMap attrs = odfElement.getAttributes();
    if (attrs != null)
    {
      int length = attrs.getLength();
      for (int i = 0; i < length; i++)
      {
        Node item = attrs.item(i);
        // Use 2 colons to separate name from value, and the string "|-|" to separate attributes
        // Don't include id as this is not and attribute
        String itemNodeName = item.getNodeName();
        if (!itemNodeName.equals("id"))
        {
          builder.append(itemNodeName);
          builder.append(ATTRIBUTE_NAME_VALUE_DELIMETER);
          builder.append(item.getNodeValue());
          builder.append(ATTRIBUTE_DELIMETER);
        }
      }
    }

    NodeList nodes = odfElement.getChildNodes();
    int totalNodes = nodes.getLength();
    if (totalNodes > 0)
      level++;
    for (int i = 0; i < totalNodes; i++)
    {
      Node child = nodes.item(i);
      builder = flattenElement(child, builder, level);
    }
    return builder;
  }

  /**
   * getLocaleInfo retrieve the locale info from the test style. If none can be determined, the en_US locale is returned.
   * 
   * @param context
   * @param textStyle
   * @return
   */
  @SuppressWarnings({ "unchecked", "restriction" })
  public static String getLocaleInfo(ConversionContext context, String textStyle)
  {
    String defaultLocale = ODPConvertConstants.ENGLISH_US_LOCALE;
    if (textStyle == null || textStyle.trim().length() == 0)
      return defaultLocale;
    // Get the style map out of the context
    Map<String, ArrayList<Element>> styleMap = (Map<String, ArrayList<Element>>) context
        .get(ODPConvertConstants.CONTEXT_SYTLENAME_NODES_MAP_IN_STYLE);
    // Retrieve the input style from the style map
    ArrayList<Element> elements = styleMap.get(textStyle.trim());

    // ODF 1.0 documents do not define this, so make sure elements is not null
    if (elements != null)
    {
      OdfElement element = (OdfElement) elements.get(0);
      NodeList nodes = element.getChildNodes();
      for (int i = 0; i < nodes.getLength(); i++)
      {
        Element e = (Element) nodes.item(i);
        if (e.getNodeName().equals(ODPConvertConstants.ODF_ATTR_STYLE_TEXT_PROPERTIES))
        {
          String asianLanguage = e.getAttribute(ODPConvertConstants.ODF_ATTR_LANGUAGE_ASIAN);
          String asianCountry = e.getAttribute(ODPConvertConstants.ODF_ATTR_COUNTRY_ASIAN);
          // Check if asian country and language is set
          if (asianLanguage == null || asianLanguage.length() == 0 || asianCountry == null || asianCountry.length() == 0)
          {
            String language = e.getAttribute(ODPConvertConstants.ODF_ATTR_LANGUAGE);
            String country = e.getAttribute(ODPConvertConstants.ODF_ATTR_COUNTRY);
            if (language == null || language.length() == 0 || country == null || country.length() == 0)
              return defaultLocale;
            else
              return language + ODPConvertConstants.SYMBOL_UNDERBAR + country;
          }
          else
          {
            return asianLanguage + ODPConvertConstants.SYMBOL_UNDERBAR + asianCountry;
          }
        }
      }
    }
    return defaultLocale;
  }

  public static Element getDrawFrame(Element element)
  {
    Element drawFrame = (Element) element.getParentNode();
    String className = drawFrame.getAttribute(ODPConvertConstants.HTML_ATTR_CLASS).trim();

    while (drawFrame != null && !classIsDrawFrame(className))
    {
      drawFrame = (Element) drawFrame.getParentNode();
      if (null != drawFrame)
        className = drawFrame.getAttribute(ODPConvertConstants.HTML_ATTR_CLASS).trim();
    }
    return drawFrame;
  }

  public static void setPageNumberPresClass(Element drawFrame)
  {
    String preserve_pres_class = drawFrame.getAttribute(ODPConvertConstants.HTML_ATTR_PRESERVE_PRES_CLASS);
    if(preserve_pres_class != null && preserve_pres_class.length()>0)
      return;
    
    String drawLayer = drawFrame.getAttribute(ODPConvertConstants.HTML_ATTR_DRAW_LAYER);
    String pres_class = drawFrame.getAttribute(ODPConvertConstants.HTML_ATTR_PRESENTATION_CLASS);

    if (drawLayer != null && pres_class != null && drawLayer.equals(ODPConvertConstants.HTML_VALUE_LAYOUT)
        && pres_class.equals(ODPConvertConstants.HTML_VALUE_NOTES))
      drawFrame.setAttribute(ODPConvertConstants.HTML_ATTR_PRESERVE_PRES_CLASS, ODPConvertConstants.CSS_ATTR_PAGE_NUMBER);
    else
      drawFrame.setAttribute(ODPConvertConstants.HTML_ATTR_PRESENTATION_CLASS, ODPConvertConstants.CSS_ATTR_PAGE_NUMBER);
  }

  private static boolean classIsDrawFrame(String className)
  {
    String[] classes = className.split(ODPConvertConstants.SYMBOL_WHITESPACE);
    for (int i = 0; i < classes.length; i++)
    {
      String classValue = classes[i];
      if (classValue.equals(ODFConstants.HTML_VALUE_DRAW_FRAME))
        return true;
    }
    return false;
  }

  /*
   * get width of the current container
   * 
   * @param context - conversion context
   * 
   * @return String - container width - e.g "24.99cm" or an empty string when the container width could not be found
   */
  public static String getContainerWidth(ConversionContext context)
  {
    String containerWidth = (String) context.get(ODPConvertConstants.CONTEXT_PARENT_WIDTH);
    if (containerWidth == null)
      containerWidth = ""; // make sure we don't return null

    // when we're in a table cell, some width's need to be based on the width of the table cell, not the text box
    String cellWidth = (String) context.get(ODPConvertConstants.CONTEXT_TABLE_CELL_WIDTH);
    if (cellWidth != null && cellWidth.length() > 0 && containerWidth.length() > 0)
    {
      // the width of the cell is a percent of the svg:width of the container
      double cellWidth_d = Measure.extractNumber(containerWidth) * (Measure.extractNumber(cellWidth) / 100);

      StringBuilder formattedSize = new StringBuilder(MeasurementUtil.formatDecimal(cellWidth_d));
      formattedSize.append("cm");

      containerWidth = formattedSize.toString();
    }
    return containerWidth;
  }

  /**
   * Return character for a Japanese numbering schema
   * 
   * @param counter
   *          - list item number
   * @param format
   *          - format of numbering schema (e.g. "j1" or "j2")
   * 
   * @return String - containing numbering character to use
   */
  @SuppressWarnings("unchecked")
  public static String getCounterValue(int counter, String format)
  {
    List<String> values = (List<String>) listSequence.get(format);
    if (values != null)
    {
      int i = counter;

      if (counter > values.size())
      {
        // wrap when the counter is greater than size of char array
        i = (counter + values.size()) % values.size();
      }

      return values.get(i);
    }

    // when we can't find the format, return the input counter as a string
    return new Integer(counter).toString();

  }

}
