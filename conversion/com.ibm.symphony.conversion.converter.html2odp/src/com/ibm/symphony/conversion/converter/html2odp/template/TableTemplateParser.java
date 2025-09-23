/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.html2odp.template;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.logging.Level;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;

import org.odftoolkit.odfdom.OdfElement;
import org.odftoolkit.odfdom.OdfFileDom;
import org.odftoolkit.odfdom.doc.office.OdfOfficeAutomaticStyles;
import org.odftoolkit.odfdom.doc.style.OdfStyle;
import org.odftoolkit.odfdom.dom.element.OdfStylePropertiesBase;
import org.odftoolkit.odfdom.dom.element.style.StyleGraphicPropertiesElement;
import org.odftoolkit.odfdom.dom.element.style.StyleParagraphPropertiesElement;
import org.odftoolkit.odfdom.dom.element.style.StyleTextPropertiesElement;
import org.odftoolkit.odfdom.dom.element.table.TableTableTemplateElement;
import org.odftoolkit.odfdom.dom.style.OdfStyleFamily;
import org.odftoolkit.odfdom.dom.style.props.OdfStylePropertiesSet;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.NamedNodeMap;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

import com.ibm.json.java.JSONObject;
import com.ibm.symphony.conversion.converter.html2odp.style.CSSUtil;
import com.ibm.symphony.conversion.converter.html2odp.util.ContentConvertUtil;
import com.ibm.symphony.conversion.presentation.ODPCommonUtil;
import com.ibm.symphony.conversion.presentation.ODPConvertConstants;
import com.ibm.symphony.conversion.presentation.ODPMetaFile;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.HtmlCSSConstants;

public class TableTemplateParser
{
  private static final String CLASS = TableTemplateParser.class.getName();

  // private static final Logger log = Logger.getLogger(CLASS);

  private static final String TEMPLATE_STYLE_MAP = "Table-Style-Map.json";

  private static final String TABLE_STYLES_CSS = "tablestyles.css";

  private static final String TABLE_STYLES_XML = "tablestyles.xml";

  private static final String TABLE_HEADER_ROW = "tableHeaderRow";

  private static final String TABLE_ALTERNATE_ROW = "alternateRow";

  private static final String TABLE_LAST_ROW = "lastRow";

  private static final String TABLE_LAST_COLUMN = "lastColumn";

  private static final String CUSTOM_STYLE_FAMILY = "custom";

  private static final String STYLE_FAMILY = "predefined";

  private static final String DEFAULT_STYLE_PREFIX = "ConcordCustom";

  private static final String TEXT_FONT_WEIGHT_DEFAULT = "bold";

  private static final String BORDER_DEFAULT = "0.02cm solid ";

  private static final String DRAW_FILL_DEFAULT = "solid";

  private static final String VERTICAL_ALIGN_DEFAULT = "top";

  private static final String HORIZONTAL_ALIGN_DEFAULT = "left";

  private static final String BLACK_STYLE_COLOR = "#000000";

  private static final String WHITE_STYLE_COLOR = "#ffffff";

  private static final String HEADER_DEFAULT_COLOR = "#808080";

  private static final String SUMMARY_DEFAULT_COLOR = "#dddddd";

  private static final String RGB_HTML_TAG = "rgb";

  private static final String BODY_STYLE_PREFIX = "A";

  private static final String ALTERNATE_STYLE_PREFIX = "B";

  private static final String FIRST_STYLE_PREFIX = "C";

  private static final String LAST_STYLE_PREFIX = "D";

  private static JSONObject styleMap = null;

  public static JSONObject getTemplateStyleMap()
  {
    InputStream input = null;
    try
    {
      input = TableTemplateParser.class.getResourceAsStream(TEMPLATE_STYLE_MAP);
      styleMap = JSONObject.parse(input);
    }
    catch (Exception e)
    {
      String message = ODPCommonUtil.createMessage(ODPCommonUtil.LOG_UNEXPECTED_EXCEPTION_IN, CLASS + ".getTemplateStyleMap");
      ODPCommonUtil.logException(Level.SEVERE, message, e);
    }
    finally
    {
      ODPMetaFile.closeResource(input);
    }

    return styleMap;
  }

  public static void loadStyleDocument(ConversionContext context)
  {
    loadCSSDocument(context, TABLE_STYLES_CSS);
  }

  public static boolean isTemplateStyle(String styleName)
  {
    return isTemplate(styleName, STYLE_FAMILY);

  }

  public static boolean isCustomTemplate(String styleName)
  {
    return isTemplate(styleName, CUSTOM_STYLE_FAMILY);
  }

  private static boolean isTemplate(String styleName, String family)
  {
    JSONObject styleMap = getTemplateStyleMap();
    if (styleMap.containsKey(styleName))
    {
      String value = (String) styleMap.get(styleName);
      if (value.contains("/" + family + "/"))
        return true;
    }
    return false;
  }

  /**
   * 1.readcss to cssmap 2.put cssMap in context;
   */
  private static void loadCSSDocument(ConversionContext context, String fileName)
  {
    InputStream fInput = null;
    BufferedReader br = null;
    try
    {
      fInput = TableTemplateParser.class.getResourceAsStream(fileName);
      if (fInput != null)
      {
        br = new BufferedReader(new InputStreamReader(fInput));
        String line = "";

        StringBuilder sBuilder = new StringBuilder(128);

        while (true)
        {
          line = br.readLine();
          if (line == null)
          {
            break;
          }
          sBuilder.append(line);
          sBuilder.append('\n');
        }

        for (int i = 0; i < sBuilder.length(); i++)
        {
          char cTemp = sBuilder.charAt(i);
          if (cTemp == '\n' || cTemp == '\t')
          {
            sBuilder.deleteCharAt(i);
            i--;
          }
        }

        while (true)
        {
          int nFind1 = sBuilder.indexOf("/*");
          if (-1 == nFind1)
          {
            break;
          }
          int nFind2 = sBuilder.indexOf("*/", nFind1);
          if (-1 == nFind2)
          {
            break;
          }
          sBuilder.delete(nFind1, nFind2 + 2);
        }
        String strCSSContent = sBuilder.toString();
        Map<String, Map<String, String>> mapCSSInfo = new HashMap<String, Map<String, String>>();
        while (strCSSContent.length() > 0)
        {

          String[] CSSBlock = getCSSBlock(strCSSContent, "{", "}");
          if (CSSBlock == null)
            break;

          Map<String, String> mapCSSBlockInfo = new HashMap<String, String>();
          putStyleMap(CSSBlock[1], mapCSSBlockInfo);

          while (true)
          {
            int nNameFind = CSSBlock[0].indexOf(',');
            if (-1 == nNameFind)
            {
              mapCSSInfo.put(CSSBlock[0], mapCSSBlockInfo);
              break;
            }

            String strSubName = CSSBlock[0].substring(0, nNameFind).trim();
            mapCSSInfo.put(strSubName, mapCSSBlockInfo);
            CSSBlock[0] = CSSBlock[0].substring(nNameFind + 1, CSSBlock[0].length());
          }
          strCSSContent = CSSBlock[2];
        }
        context.put(ODPConvertConstants.CONTEXT_HTML_STYLE_SOURCE, mapCSSInfo);
      }

    }
    catch (Throwable e)
    {
      String message = ODPCommonUtil.createMessage(ODPCommonUtil.LOG_UNEXPECTED_EXCEPTION_IN, CLASS + ".loadCSSDocument");
      ODPCommonUtil.logException(context, Level.SEVERE, message, e);
    }
    finally
    {
      ODPMetaFile.closeResource(br);
      ODPMetaFile.closeResource(fInput);
    }
  }

  /**
   * 1.get current class and inherit class style 2.get current style 3.merge previous two styles
   */
  @SuppressWarnings("unchecked")
  public static Map<String, String> getTableMergedStyle(ConversionContext context, Element htmlElement)
  {
    // get table node's class and style and merge
    Element TableElement = getTableElement(htmlElement);
    if (TableElement == null)
      return null;

    Map<String, Map<String, String>> mapCSSInfo = (Map<String, Map<String, String>>) context
        .get(ODPConvertConstants.CONTEXT_HTML_STYLE_SOURCE);

    Map<String, String> mapAllStyleInfo = new HashMap<String, String>();
    putNodeMergedStyle(TableElement, TableElement, mapCSSInfo, mapAllStyleInfo);
    parseTableBorderStyle(mapAllStyleInfo);
    String strNodeName = htmlElement.getNodeName();
    if (!strNodeName.equals(HtmlCSSConstants.TABLE))
    {

      if (strNodeName.equals(HtmlCSSConstants.TD) || strNodeName.equals(HtmlCSSConstants.TH))
      {
        putNodeMergedStyle((Element) htmlElement.getParentNode(), TableElement, mapCSSInfo, mapAllStyleInfo);
      }
      putNodeMergedStyle(htmlElement, TableElement, mapCSSInfo, mapAllStyleInfo);
    }

    return mapAllStyleInfo;
  }

  private static String[] getCSSBlock(String source, String start, String End)
  {
    if (source == null || source.length() == 0)
      return null;

    String[] result = new String[3];
    int nFind1 = source.indexOf(start);
    if (-1 == nFind1)
    {
      return null;
    }
    int nFind2 = source.indexOf(End, nFind1);
    if (-1 == nFind2)
    {
      return null;
    }

    result[0] = source.substring(0, nFind1).trim();// strCSSBlockName
    result[1] = source.substring(nFind1 + 1, nFind2).trim();// strCSSBlockInfo
    result[2] = source.substring(nFind2 + 1, source.length());// strContent

    return result;
  }

  private static String[] getCSSStyle(String source)
  {
    if (source != null && source.length() > 0 && !source.endsWith(";"))
      source = source + ";";

    return getCSSBlock(source, ":", ";");
  }

  private static void putStyleMap(String styleString, Map<String, String> resultMap)
  {
    if (styleString != null)
      styleString = styleString.toLowerCase().trim();
    while (true)
    {
      String[] CSSStyle = getCSSStyle(styleString);
      if (CSSStyle == null)
        break;

      resultMap.put(CSSStyle[0], CSSStyle[1]);
      styleString = CSSStyle[2];
    }
  }

  private static void putNodeMergedStyle(Element element, Element TableElement, Map<String, Map<String, String>> mapCSSInfo,
      Map<String, String> resultMap)
  {
    List<String> listTableClassName = getClassName(TableElement);

    // Get full name of current class
    List<String> listCurrentCompleteClassName = null;

    String nodeName = element.getNodeName();

    if (!nodeName.equals(HtmlCSSConstants.TABLE))
    {
      List<String> listCurrentClassName = getClassName(element);

      // if current class is empty,inherit class would be node name.
      if (listCurrentClassName.isEmpty())
        listCurrentClassName.add(nodeName);

      listCurrentCompleteClassName = getCompleteClassName(listTableClassName, listCurrentClassName);
    }
    else
      listCurrentCompleteClassName = listTableClassName;

    String strCurrentStyle = element.getAttribute(ODPConvertConstants.HTML_ATTR_STYLE).trim();
    Map<String, String> mapNodeClassInfo = new HashMap<String, String>();
    putCSSInfoMap(listCurrentCompleteClassName, mapCSSInfo, mapNodeClassInfo);
    putStyleMap(strCurrentStyle, resultMap);
    mergerStyleAClass(resultMap, mapNodeClassInfo);
  }

  private static void mergerStyleAClass(Map<String, String> styleMap, Map<String, String> classMap)
  {
    if (classMap != null)
    {
      Iterator<Entry<String, String>> cssEntrySet = classMap.entrySet().iterator();
      while (cssEntrySet.hasNext())
      {
        Entry<String, String> cssEntry = cssEntrySet.next();

        String propertyName = cssEntry.getKey();
        String styleValues = (styleMap == null) ? null : (String) styleMap.get(propertyName);
        String classValues = (String) cssEntry.getValue();

        int nIndex = classValues.indexOf("!important");

        if (nIndex != -1)
        {
          classValues = classValues.substring(0, nIndex).trim();
          styleMap.put(propertyName, classValues);
        }
        else if (styleValues == null)
        {
          styleMap.put(propertyName, classValues);
        }
      }
    }
  }

  private static List<String> getClassName(Element htmlElement)
  {
    List<String> listCurrentClassName = new ArrayList<String>();
    String strCurrentName = htmlElement.getAttribute(ODPConvertConstants.HTML_ATTR_CLASS).trim();
    String strNodeName = htmlElement.getNodeName();
    String strCompleteName = "";

    if (strCurrentName.length() > 0)
    {
      while (true)
      {
        int nNameFind = strCurrentName.indexOf(' ');
        if (-1 == nNameFind)
        {
          strCompleteName = strNodeName + '.' + strCurrentName;
          listCurrentClassName.add(strCompleteName);
          break;
        }

        String strTempName = strCurrentName.substring(0, nNameFind).trim();
        strCurrentName = strCurrentName.substring(nNameFind + 1, strCurrentName.length()).trim();
        strCompleteName = strNodeName + '.' + strTempName;
        listCurrentClassName.add(strCompleteName);
      }
    }
    return listCurrentClassName;
  }

  private static List<String> getCompleteClassName(List<String> tableClass, List<String> currentClass)
  {
    int size = currentClass.size();
    int capacity = ODPCommonUtil.calculateArrayCapacity(size);
    List<String> result = new ArrayList<String>(capacity);

    for (int i = 0; i < size; i++)
    {
      String strCurrentName = currentClass.get(i);
      for (int j = 0; j < tableClass.size(); j++)
      {
        String strTableName = tableClass.get(j);

        String strCurrentCompleteName = strTableName + " " + strCurrentName;
        result.add(strCurrentCompleteName);
      }
    }
    return result;
  }

  private static void putCSSInfoMap(List<String> sourceClassName, Map<String, Map<String, String>> sourceMap, Map<String, String> resultMap)
  {
    for (int i = 0; i < sourceClassName.size(); i++)
    {
      String name = sourceClassName.get(i);
      Map<String, String> mapCSSTempInfo = sourceMap.get(name);
      if (mapCSSTempInfo != null)
      {
        Iterator<Entry<String, String>> cssEntrySet = mapCSSTempInfo.entrySet().iterator();
        while (cssEntrySet.hasNext())
        {
          Entry<String, String> cssEntry = cssEntrySet.next();
          resultMap.put(cssEntry.getKey(), cssEntry.getValue());
        }
      }
    }
  }

  public static Element getRowElement(Element htmlElement)
  {
    String currentNode = htmlElement.getNodeName();
    if (currentNode.equals(HtmlCSSConstants.TR))
      return htmlElement;

    int nLayer = 5;
    Node parentNode = htmlElement.getParentNode();

    while (nLayer > 0)
    {

      String nodeName = parentNode.getNodeName();

      if (nodeName.equals(HtmlCSSConstants.TR))
        return (Element) parentNode;

      parentNode = parentNode.getParentNode();
      if (parentNode == null)
        break;

      nLayer--;
    }

    return null;
  }

  public static Element getTableElement(Element htmlElement)
  {
    String currentNode = htmlElement.getNodeName();
    if (currentNode.equals(HtmlCSSConstants.TABLE))
      return htmlElement;

    int nLayer = 5;
    Node parentNode = htmlElement.getParentNode();

    while (nLayer > 0)
    {

      String nodeName = parentNode.getNodeName();

      if (nodeName.equals(HtmlCSSConstants.TABLE))
        return (Element) parentNode;

      parentNode = parentNode.getParentNode();
      if (parentNode == null)
        break;

      nLayer--;
    }

    return null;
  }

  private static void parseTableBorderStyle(Map<String, String> tableStyleMap)
  {
    if (tableStyleMap.containsKey("border"))
    {
      tableStyleMap.put("table.border", tableStyleMap.get("border"));
      tableStyleMap.remove("border");
    }
    if (tableStyleMap.containsKey("border-top"))
    {
      tableStyleMap.put("table.border-top", tableStyleMap.get("border-top"));
      tableStyleMap.remove("border-top");
    }
    if (tableStyleMap.containsKey("border-bottom"))
    {
      tableStyleMap.put("table.border-bottom", tableStyleMap.get("border-bottom"));
      tableStyleMap.remove("border-bottom");
    }
    if (tableStyleMap.containsKey("border-left"))
    {
      tableStyleMap.put("table.border-left", tableStyleMap.get("border-left"));
      tableStyleMap.remove("border-left");
    }
    if (tableStyleMap.containsKey("border-right"))
    {
      tableStyleMap.put("table.border-right", tableStyleMap.get("border-right"));
      tableStyleMap.remove("border-right");
    }
  }

  /**
   * Simple doc reader for xml files. Used to process the table styles xml file with the table template definitions.
   * 
   * When refactored to read in the CSS file, this can become deprecated.
   * 
   * @param file
   * @return Document containing the xml contents
   */
  private static Document getdoc(InputStream file)
  {
    DocumentBuilderFactory dbfactory = null;
    DocumentBuilder builder = null;
    Document doc = null;

    try
    {
      dbfactory = DocumentBuilderFactory.newInstance();
      builder = dbfactory.newDocumentBuilder();
      doc = builder.parse(file);
    }
    catch (Exception ioe)
    {
      ODPCommonUtil.logException(ODPCommonUtil.LOG_UNEXPECTED_EXCEPTION, ioe);
    }
    return doc;

  }

  /**
   * Loads the table styles document (tablesstyles.xml) into a Document
   * 
   * @return Document of the tables styles currently defined.
   */
  private static Document loadTableStyles()
  {
    InputStream input = null;
    Document doc = null;
    try
    {
      input = ConvertTemplateUtil.class.getResourceAsStream(TABLE_STYLES_XML);
      doc = TableTemplateParser.getdoc(input);
    }
    finally
    {
      ODPMetaFile.closeResource(input);
    }

    return doc;
  }

  /**
   * Removes color values from the cell styles. This is helpful if a table template is being applied.
   * 
   */
  @SuppressWarnings("restriction")
  public static void updateCellStyles(ConversionContext context, Element htmlElement, OdfElement odfElement, String styleName)
  {
    Element table = getTableElement(htmlElement);

    if (!TableTemplateParser.isTemplateStyle(table))
    {
      return;
    }

    if (styleName != null && styleName.length() > 0)
    {
      // Clean up the default-cell-styles at the row level.
      Element row = getRowElement(htmlElement);
      String defaultCellStyle = row.getAttribute(ODPConvertConstants.HTML_ATTR_TABLE_DEFAULT_CELL_STYLE_NAME);

      if (defaultCellStyle != null && defaultCellStyle.length() > 0)
      {
        TableTemplateParser.updateCellStyle(context, defaultCellStyle);
      }

      // Clean up the cell styles at each cell level
      TableTemplateParser.updateCellStyle(context, styleName);
    }
    else
    {
      // no style anymore, make sure its no longer on the ODF element
      odfElement.removeAttribute(ODPConvertConstants.ODF_ATTR_TABLE_STYLE_NAME);
    }

  }

  @SuppressWarnings("restriction")
  private static void updateCellStyle(ConversionContext context, String styleName)
  {

    OdfFileDom target = (OdfFileDom) context.get(ODPConvertConstants.CONTEXT_CONVERT_TARGET);
    OdfOfficeAutomaticStyles styles = target.getAutomaticStyles();

    OdfStyle cellStyle = styles.getStyle(styleName, OdfStyleFamily.TableCell);

    if (cellStyle != null)
    {
      OdfStylePropertiesBase graphicProperties = cellStyle.getPropertiesElement(OdfStylePropertiesSet.GraphicProperties);

      if (graphicProperties != null)
      {
        graphicProperties.removeAttribute(ODPConvertConstants.ODF_ATTR_DRAW_FILL);
        graphicProperties.removeAttribute(ODPConvertConstants.ODF_ATTR_DRAW_FILL_COLOR);
        // graphicProperties.removeAttribute(ODPConvertConstants.ODF_ATTR_DRAW_TEXTAREA_VERTICAL_ALIGN);
        graphicProperties.removeAttribute(ODPConvertConstants.ODF_ATTR_FO_PADDING_RIGHT);
        graphicProperties.removeAttribute(ODPConvertConstants.ODF_ATTR_FO_PADDING_TOP);
        graphicProperties.removeAttribute(ODPConvertConstants.ODF_ATTR_FO_PADDING_BOTTOM);
        graphicProperties.removeAttribute(ODPConvertConstants.ODF_ATTR_FO_PADDING_LEFT);
        graphicProperties.removeAttribute(ODPConvertConstants.ODF_ATTR_DRAW_OPACITY);
      }

      OdfStylePropertiesBase paragraphProperties = cellStyle.getPropertiesElement(OdfStylePropertiesSet.ParagraphProperties);

      if (paragraphProperties != null)
      {
        paragraphProperties.removeAttribute(ODPConvertConstants.ODF_ATTR_FO_BORDER_BOTTOM);
        paragraphProperties.removeAttribute(ODPConvertConstants.ODF_ATTR_FO_BORDER_TOP);
        paragraphProperties.removeAttribute(ODPConvertConstants.ODF_ATTR_FO_BORDER_RIGHT);
        paragraphProperties.removeAttribute(ODPConvertConstants.ODF_ATTR_FO_BORDER_LEFT);
        paragraphProperties.removeAttribute(ODPConvertConstants.ODF_ATTR_FO_BORDER);
        paragraphProperties.removeAttribute(ODPConvertConstants.ODF_ATTR_FO_MARGIN_TOP);
        paragraphProperties.removeAttribute(ODPConvertConstants.ODF_ATTR_FO_MARGIN_BOTTOM);
        paragraphProperties.removeAttribute(ODPConvertConstants.ODF_ATTR_FO_MARGIN_RIGHT);
        paragraphProperties.removeAttribute(ODPConvertConstants.ODF_ATTR_FO_MARGIN_LEFT);
        paragraphProperties.removeAttribute(ODPConvertConstants.ODF_ATTR_FO_TEXT_INDENT);
      }

      OdfStylePropertiesBase textProperties = cellStyle.getPropertiesElement(OdfStylePropertiesSet.TextProperties);

      if (textProperties != null)
      {
        textProperties.removeAttribute(ODPConvertConstants.ODF_ATTR_FO_COLOR);
        textProperties.removeAttribute(ODPConvertConstants.ODF_ATTR_FO_FONT_STYLE);
      }
    }
  }

  private static boolean isTemplateStyle(Element htmlElement)
  {
    NamedNodeMap attributes = htmlElement.getAttributes();

    Node drawPageStyleClasses = attributes.getNamedItem(ODPConvertConstants.HTML_ATTR_CLASS);
    String classValue = drawPageStyleClasses.getNodeValue();
    String[] classStyles = classValue.split(ODPConvertConstants.SYMBOL_WHITESPACE);

    for (String style : classStyles)
    {
      if (style != null)
      {
        if (TableTemplateParser.isTemplateStyle(style))
        {
          return true;
        }
        else if (TableTemplateParser.isCustomTemplate(style))
        {
          return true;
        }
      }
    }

    return false;
  }

  @SuppressWarnings("restriction")
  public static void applyPredefinedStyles(ConversionContext context, Element htmlElement, OdfElement odfElement, String style)
  {

    Document tableStyles = (Document) context.get(ODPConvertConstants.CONTEXT_TABLE_STYLE_ELEMENTS);

    if (tableStyles == null)
    {
      context.put(ODPConvertConstants.CONTEXT_TABLE_STYLE_ELEMENTS, TableTemplateParser.loadTableStyles());
    }

    TableTemplateParser.updateDefinedStyles(context, style);

    // Set table template attribute to the new style that will be stored in content.xml
    odfElement.setAttributeNS(ContentConvertUtil.getNamespaceUri(ODPConvertConstants.ODF_ELEMENT_TABLETEMPLATE_NAME),
        ODPConvertConstants.ODF_ELEMENT_TABLETEMPLATE_NAME, style.replace("_", "-"));

  }

  @SuppressWarnings("restriction")
  public static void applyCustomStyles(ConversionContext context, Element htmlElement, OdfElement odfElement, String[] styles)
  {

    Document tableStyles = (Document) context.get(ODPConvertConstants.CONTEXT_TABLE_STYLE_ELEMENTS);

    // If this is the first time the table styles are being checked, load all table styles
    if (tableStyles == null)
    {
      tableStyles = TableTemplateParser.loadTableStyles();
    }

    // For custom, we need to update the tableStyles with the custom template style definition
    TableTemplateParser.generateCustomTableTemplate(context, htmlElement, tableStyles);

    String customStyleName = (String) context.get(ODPConvertConstants.CONTEXT_CUSTOM_STYLE_NAME);
    TableTemplateParser.updateDefinedStyles(context, customStyleName);
    context.put(ODPConvertConstants.CONTEXT_TABLE_STYLE_ELEMENTS, tableStyles);

    // Set template attribute in the content.xml
    odfElement.setAttributeNS(ContentConvertUtil.getNamespaceUri(ODPConvertConstants.ODF_ELEMENT_TABLETEMPLATE_NAME),
        ODPConvertConstants.ODF_ELEMENT_TABLETEMPLATE_NAME, customStyleName);

  }

  /**
   * Updates the defined-table-styles string in the context. Anytime a new table template is added, this needs to be updated so it can be
   * read when the styles.xml is updated.
   */
  private static void updateDefinedStyles(ConversionContext context, String style)
  {
    String definedStyles = (String) context.get(ODPConvertConstants.CONTEXT_DEFINED_TABLE_STYLES);

    if (definedStyles != null && definedStyles.length() > 0)
    {
      definedStyles = definedStyles + " " + style;
    }
    else
    {
      definedStyles = style;
    }

    context.put(ODPConvertConstants.CONTEXT_DEFINED_TABLE_STYLES, definedStyles);
  }

  public static void generateCustomTableTemplate(ConversionContext context, Element htmlElement, Document tableStyles)
  {

    try
    {

      OdfFileDom odfContentDom = (OdfFileDom) context.get(ODPConvertConstants.CONTEXT_CONVERT_TARGET);

      // New tablestyle node
      Element tableStyle = (Element) tableStyles.getDocumentElement().getChildNodes().item(0);
      Node newtablestyle = tableStyle.cloneNode(false);

      NamedNodeMap attrs = newtablestyle.getAttributes();
      Node stylename = attrs.getNamedItem(ODPConvertConstants.ODF_ATTR_STYLE_NAME);
      String customStyleName = TableTemplateParser.getCustomStyleName(context);
      stylename.setNodeValue(customStyleName);

      // Concord custom body style
      OdfStyle bodystyle = TableTemplateParser.generateCustomBodyStyle(odfContentDom, htmlElement, customStyleName);
      newtablestyle.appendChild(tableStyles.importNode(bodystyle, true));

      // Concord custom odd rows/columns style
      OdfStyle oddstyle = TableTemplateParser.generateCustomOddStyle(odfContentDom, htmlElement, customStyleName);
      newtablestyle.appendChild(tableStyles.importNode(oddstyle, true));

      // Concord custom firstlast rows/columns style
      OdfStyle firstlaststyle = TableTemplateParser.generateCustomFirstLastStyle(odfContentDom, htmlElement, customStyleName);
      newtablestyle.appendChild(tableStyles.importNode(firstlaststyle, true));

      // Concord custom summary rows/columns style
      OdfStyle summarystyle = TableTemplateParser.generateCustomSummaryStyle(odfContentDom, htmlElement, customStyleName);
      newtablestyle.appendChild(tableStyles.importNode(summarystyle, true));

      // Create table template element
      TableTableTemplateElement tableelement = TableTemplateParser.generateCustomTableTemplateStyle(odfContentDom, customStyleName);
      newtablestyle.appendChild(tableStyles.importNode(tableelement, true));

      // Insert into doc
      NodeList tableStyleNodes = tableStyles.getElementsByTagName(ODPConvertConstants.ODF_TABLESTYLES);
      Node tableStyleNode = tableStyleNodes.item(0);
      tableStyleNode.appendChild(newtablestyle);

    }
    catch (Exception e)
    {
      ODPCommonUtil.logException(context, ODPCommonUtil.LOG_UNEXPECTED_EXCEPTION, e);
    }
  }

  private static void setDefaultPaddingStyle(StyleGraphicPropertiesElement element)
  {
    element.setFoPaddingTopAttribute("0.05cm");
    element.setFoPaddingBottomAttribute("0.05cm");
    element.setFoPaddingLeftAttribute("0.09cm");
    element.setFoPaddingRightAttribute("0.09cm");
  }

  @SuppressWarnings("restriction")
  private static OdfStyle generateCustomBodyStyle(OdfFileDom odfContentDom, Element htmlElement, String templateName)
  {

    // Concord custom body style
    OdfStyle bodystyle = new OdfStyle(odfContentDom);
    bodystyle.setStyleFamilyAttribute(ODPConvertConstants.ODF_ELEMENT_TABLE_CELL);
    bodystyle.setStyleNameAttribute(templateName + BODY_STYLE_PREFIX);
    // bodystyle.setStyleParentStyleNameAttribute(PARENT_STYLE_NAME);

    String backgroundColor = TableTemplateParser.getBodyBackgroundColor(odfContentDom, htmlElement);
    StyleGraphicPropertiesElement element = new StyleGraphicPropertiesElement(odfContentDom);
    element.setDrawFillAttribute(DRAW_FILL_DEFAULT);
    element.setDrawFillColorAttribute(backgroundColor);
    setDefaultPaddingStyle(element);
    element.setDrawTextareaVerticalAlignAttribute(VERTICAL_ALIGN_DEFAULT);
    element.setDrawTextareaHorizontalAlignAttribute(HORIZONTAL_ALIGN_DEFAULT);
    bodystyle.appendChild(element);

    String borderColor = TableTemplateParser.getBorderColor(odfContentDom, htmlElement);
    StyleParagraphPropertiesElement pelement = new StyleParagraphPropertiesElement(odfContentDom);
    pelement.setFoBorderAttribute(BORDER_DEFAULT + borderColor);
    bodystyle.appendChild(pelement);

    String fontColor = TableTemplateParser.getFontColor(odfContentDom, htmlElement);
    StyleTextPropertiesElement telement = new StyleTextPropertiesElement(odfContentDom);
    telement.setFoColorAttribute(fontColor);
    bodystyle.appendChild(telement);

    return bodystyle;
  }

  @SuppressWarnings("restriction")
  private static OdfStyle generateCustomOddStyle(OdfFileDom odfContentDom, Element htmlElement, String templateName)
  {
    OdfStyle oddstyle = new OdfStyle(odfContentDom);
    oddstyle.setStyleFamilyAttribute(ODPConvertConstants.ODF_ELEMENT_TABLE_CELL);
    oddstyle.setStyleNameAttribute(templateName + ALTERNATE_STYLE_PREFIX);
    // oddstyle.setStyleParentStyleNameAttribute(PARENT_STYLE_NAME);

    String backgroundColor = TableTemplateParser.getAlternateRowBackgroundColor(odfContentDom, htmlElement);
    StyleGraphicPropertiesElement oddelement = new StyleGraphicPropertiesElement(odfContentDom);
    oddelement.setDrawFillAttribute(DRAW_FILL_DEFAULT);
    oddelement.setDrawFillColorAttribute(backgroundColor);
    setDefaultPaddingStyle(oddelement);
    oddelement.setDrawTextareaVerticalAlignAttribute(VERTICAL_ALIGN_DEFAULT);
    oddelement.setDrawTextareaHorizontalAlignAttribute(HORIZONTAL_ALIGN_DEFAULT);
    oddstyle.appendChild(oddelement);

    String borderColor = TableTemplateParser.getBorderColor(odfContentDom, htmlElement);
    StyleParagraphPropertiesElement oddpelement = new StyleParagraphPropertiesElement(odfContentDom);
    oddpelement.setFoBorderAttribute(BORDER_DEFAULT + borderColor);
    oddstyle.appendChild(oddpelement);

    String fontColor = TableTemplateParser.getFontColor(odfContentDom, htmlElement);
    StyleTextPropertiesElement oddtelement = new StyleTextPropertiesElement(odfContentDom);
    oddtelement.setFoColorAttribute(fontColor);
    oddstyle.appendChild(oddtelement);

    return oddstyle;

  }

  @SuppressWarnings("restriction")
  private static OdfStyle generateCustomFirstLastStyle(OdfFileDom odfContentDom, Element htmlElement, String templateName)
  {
    OdfStyle firstlaststyle = new OdfStyle(odfContentDom);
    firstlaststyle.setStyleFamilyAttribute(ODPConvertConstants.ODF_ELEMENT_TABLE_CELL);
    firstlaststyle.setStyleNameAttribute(templateName + FIRST_STYLE_PREFIX);
    // firstlaststyle.setStyleParentStyleNameAttribute(PARENT_STYLE_NAME);

    String backgroundColor = TableTemplateParser.getHeaderBackgroundColor(odfContentDom, htmlElement);
    StyleGraphicPropertiesElement firstlastelement = new StyleGraphicPropertiesElement(odfContentDom);
    firstlastelement.setDrawFillAttribute(DRAW_FILL_DEFAULT);
    firstlastelement.setDrawFillColorAttribute(backgroundColor);
    setDefaultPaddingStyle(firstlastelement);
    firstlastelement.setDrawTextareaVerticalAlignAttribute(VERTICAL_ALIGN_DEFAULT);
    firstlastelement.setDrawTextareaHorizontalAlignAttribute(HORIZONTAL_ALIGN_DEFAULT);
    firstlaststyle.appendChild(firstlastelement);

    String borderColor = TableTemplateParser.getBorderColor(odfContentDom, htmlElement);
    StyleParagraphPropertiesElement firstlastpelement = new StyleParagraphPropertiesElement(odfContentDom);
    firstlastpelement.setFoBorderAttribute(BORDER_DEFAULT + borderColor);
    firstlaststyle.appendChild(firstlastpelement);

    String fontColor = TableTemplateParser.getFontColor(odfContentDom, htmlElement);
    StyleTextPropertiesElement firstlasttelement = new StyleTextPropertiesElement(odfContentDom);
    firstlasttelement.setFoColorAttribute(fontColor);
    firstlasttelement.setFoFontWeightAttribute(TEXT_FONT_WEIGHT_DEFAULT);
    firstlaststyle.appendChild(firstlasttelement);

    return firstlaststyle;
  }

  @SuppressWarnings("restriction")
  private static OdfStyle generateCustomSummaryStyle(OdfFileDom odfContentDom, Element htmlElement, String templateName)
  {
    OdfStyle summarystyle = new OdfStyle(odfContentDom);
    summarystyle.setStyleFamilyAttribute(ODPConvertConstants.ODF_ELEMENT_TABLE_CELL);
    summarystyle.setStyleNameAttribute(templateName + LAST_STYLE_PREFIX);
    // summarystyle.setStyleParentStyleNameAttribute(PARENT_STYLE_NAME);

    String backgroundColor = TableTemplateParser.getSummaryBackgroundColor(odfContentDom, htmlElement);
    StyleGraphicPropertiesElement summaryelement = new StyleGraphicPropertiesElement(odfContentDom);
    summaryelement.setDrawFillAttribute(DRAW_FILL_DEFAULT);
    summaryelement.setDrawFillColorAttribute(backgroundColor);
    setDefaultPaddingStyle(summaryelement);
    summaryelement.setDrawTextareaVerticalAlignAttribute(VERTICAL_ALIGN_DEFAULT);
    summaryelement.setDrawTextareaHorizontalAlignAttribute(HORIZONTAL_ALIGN_DEFAULT);
    summarystyle.appendChild(summaryelement);

    String borderColor = TableTemplateParser.getBorderColor(odfContentDom, htmlElement);
    StyleParagraphPropertiesElement summarypelement = new StyleParagraphPropertiesElement(odfContentDom);
    summarypelement.setFoBorderAttribute(BORDER_DEFAULT + borderColor);
    summarystyle.appendChild(summarypelement);

    String fontColor = TableTemplateParser.getFontColor(odfContentDom, htmlElement);
    StyleTextPropertiesElement summarytelement = new StyleTextPropertiesElement(odfContentDom);
    summarytelement.setFoColorAttribute(fontColor);
    summarytelement.setFoFontWeightAttribute(TEXT_FONT_WEIGHT_DEFAULT);
    summarystyle.appendChild(summarytelement);

    return summarystyle;
  }

  @SuppressWarnings("restriction")
  private static TableTableTemplateElement generateCustomTableTemplateStyle(OdfFileDom odfContentDom, String templateName)
  {
    TableTableTemplateElement tableelement = new TableTableTemplateElement(odfContentDom);
    tableelement.setAttributeNS(ODPConvertConstants.ODF_ATTR_TEXT_STYLE_NAME, ODPConvertConstants.ODF_ATTR_TEXT_STYLE_NAME, templateName);

    tableelement.newTableFirstRowElement(templateName + FIRST_STYLE_PREFIX);
    setTextStyleName(tableelement, ODPConvertConstants.ODF_ELEMENT_TABLEFIRST_ROW);
    tableelement.newTableLastRowElement(templateName + LAST_STYLE_PREFIX);
    setTextStyleName(tableelement, ODPConvertConstants.ODF_ELEMENT_TABLELAST_ROW);
    tableelement.newTableFirstColumnElement(templateName + FIRST_STYLE_PREFIX);
    setTextStyleName(tableelement, ODPConvertConstants.ODF_ELEMENT_TABLEFIRST_COLUMN);
    tableelement.newTableLastColumnElement(templateName + LAST_STYLE_PREFIX);
    setTextStyleName(tableelement, ODPConvertConstants.ODF_ELEMENT_TABLELAST_COLUMN);
    tableelement.newTableOddRowsElement(templateName + ALTERNATE_STYLE_PREFIX);
    setTextStyleName(tableelement, ODPConvertConstants.ODF_ELEMENT_TABLEODD_ROWS);
    tableelement.newTableOddColumnsElement(templateName + ALTERNATE_STYLE_PREFIX);
    setTextStyleName(tableelement, ODPConvertConstants.ODF_ELEMENT_TABLEODD_COLUMNS);
    tableelement.newTableBodyElement(templateName + BODY_STYLE_PREFIX);
    setTextStyleName(tableelement, ODPConvertConstants.ODF_ELEMENT_TABLEBODY);

    return tableelement;
  }

  private static void setTextStyleName(Element tableelement, String tagName)
  {
    // For some reason the new TableTableTemplateElement sets table:style-name and not text:style-name
    // fixup for now but need to investigate why the ODF API sets it this way.
    Element first = (Element) tableelement.getElementsByTagName(tagName).item(0);
    String tableStyleName = first.getAttribute(ODPConvertConstants.ODF_ELEMENT_TABLESTYLE_NAME);
    first.removeAttribute(ODPConvertConstants.ODF_ELEMENT_TABLESTYLE_NAME);
    first.setAttributeNS(ODPConvertConstants.ODF_ATTR_TEXT_STYLE_NAME, ODPConvertConstants.ODF_ATTR_TEXT_STYLE_NAME, tableStyleName);

  }
  /**
   * Get the row elements (tr) from the html element
   */
  private static NodeList getHtmlTRNodes(Element element)
  {
    if (element.hasChildNodes())
    {
      NodeList nodes = element.getChildNodes();
      for (int i = 0; i < nodes.getLength(); i++)
      {
        Node node = nodes.item(i);
        if (node != null)
        {
          if (node.getNodeName().equals(HtmlCSSConstants.TR))
            return nodes;
          if (node.getNodeName().equals(HtmlCSSConstants.TBODY))
            return node.getChildNodes();
        }
      }
    }
    return null;
  }
  private static Element getTableHeaderRow(Element htmlElement)
  {
    Element tableHeaderRow = null;
    NodeList tableRows = getHtmlTRNodes(htmlElement);
    Element firstTableRow = (Element) tableRows.item(0);
//    Element firstTableRow = (Element) htmlElement.getFirstChild().getFirstChild();
    NamedNodeMap firstRowAttrs = firstTableRow.getAttributes();

    Node firstRowStyle = firstRowAttrs.getNamedItem(ODPConvertConstants.HTML_ATTR_CLASS);
    String firstRowClass = firstRowStyle.getNodeValue();

    if (firstRowClass != null && firstRowClass.length() > 0 && firstRowClass.contains(TABLE_HEADER_ROW))
    {
      tableHeaderRow = firstTableRow;
    }

    return tableHeaderRow;
  }

  private static Element getTableStyleRow(Element htmlElement)
  {
    Element tableRow = null;

    Element tableBody = (Element) htmlElement.getFirstChild();
    NodeList children = tableBody.getChildNodes();

    for (int i = 0; i < children.getLength(); i++)
    {
      Element child = (Element) children.item(i);
      String elementClass = child.getAttribute(ODPConvertConstants.HTML_ATTR_CLASS);

      if (elementClass.contains(ODPConvertConstants.HTML_ATTR_TABLE_ROW) && !elementClass.contains(TABLE_HEADER_ROW)
          && !elementClass.contains(TABLE_ALTERNATE_ROW) && !elementClass.contains(TABLE_LAST_ROW))
      {
        tableRow = child;
        break;
      }
    }

    if (tableRow == null)
    {
      tableRow = TableTemplateParser.getTableHeaderRow(htmlElement);
    }

    return tableRow;
  }

  private static Element getTableAlternateRow(Element htmlElement)
  {
    Element tableAlternateRow = null;

    Element tableBody = (Element) htmlElement.getFirstChild();
    NodeList children = tableBody.getChildNodes();

    for (int i = 0; i < children.getLength(); i++)
    {
      Element child = (Element) children.item(i);
      String elementClass = child.getAttribute(ODPConvertConstants.HTML_ATTR_CLASS);
      if (elementClass.contains(ODPConvertConstants.HTML_ATTR_TABLE_ROW) && elementClass.contains(TABLE_ALTERNATE_ROW))
      {
        tableAlternateRow = child;
        break;
      }
    }

    return tableAlternateRow;
  }

  private static Element getTableLastRow(Element htmlElement)
  {
    Element tableLastRow = null;

    Element tableBody = (Element) htmlElement.getFirstChild();
    NodeList children = tableBody.getChildNodes();

    for (int i = 0; i < children.getLength(); i++)
    {
      Element child = (Element) children.item(i);
      String elementClass = child.getAttribute(ODPConvertConstants.HTML_ATTR_CLASS);
      if (elementClass.contains(ODPConvertConstants.HTML_ATTR_TABLE_ROW) && elementClass.contains(TABLE_LAST_ROW))
      {
        tableLastRow = child;
        break;
      }
    }

    return tableLastRow;
  }

  private static String getBodyBackgroundColor(OdfFileDom odfDocument, Element htmlElement)
  {

    String backgroundColor = WHITE_STYLE_COLOR;

    // First check if the table_background_color attribute was specified by the editor. If it was,
    // this is the default background color for the table.
    // The alt color in the editor is really the body color in Symphony.
    String bgColor = htmlElement.getAttribute(ODPConvertConstants.HTML_ATTR_TABLE_ALT_COLOR);
    if (bgColor != null && !"".equals(bgColor))
    {
      // Convert rgb value if provided
      bgColor = CSSUtil.convertRGBValues(bgColor).trim();
      if (bgColor.equals(ODPConvertConstants.CSS_VALUE_TRANSPARENT))
        bgColor = WHITE_STYLE_COLOR;
      return bgColor;
    }
    else
    // Legacy logic in case the table_background_color attribute does not exist
    {
      // For now this appears backwards as the main background color in ODF is stored
      // in the content.html as alternate row
      Element tableRow = TableTemplateParser.getTableAlternateRow(htmlElement);

      // If this is a single row table, the editor team does not populate the alternate
      // row style. In this case use the table header row which is populated. (CONFIRM)
      // UNCONFIRMED - in discussions with editor team.
      // if (tableRow == null)
      // {
      // tableRow = TableTemplateParser.getTableHeaderRow(htmlElement);
      // }

      String color = TableTemplateParser.getBackgroundColor(tableRow);

      if (color != null)
      {
        backgroundColor = color;
      }

      return backgroundColor;
    }
  }

  private static String getHeaderBackgroundColor(OdfFileDom odfDocument, Element htmlElement)
  {

    String backgroundColor = HEADER_DEFAULT_COLOR;

    Element firstTableRow = TableTemplateParser.getTableHeaderRow(htmlElement);

    String color = TableTemplateParser.getBackgroundColor(firstTableRow);

    if (color != null)
    {
      backgroundColor = color;
    }

    return backgroundColor;
  }

  private static String getAlternateRowBackgroundColor(OdfFileDom odfDocument, Element htmlElement)
  {

    String backgroundColor = WHITE_STYLE_COLOR;

    // For now this seems a little backwards in that the alternate row in html is really the
    // color of the main rows in ODF
    Element altTableRow = TableTemplateParser.getTableStyleRow(htmlElement);

    String color = TableTemplateParser.getBackgroundColor(altTableRow);

    if (color != null)
    {
      backgroundColor = color;
    }

    return backgroundColor;
  }

  private static String getSummaryBackgroundColor(OdfFileDom odfDocument, Element htmlElement)
  {

    String backgroundColor = SUMMARY_DEFAULT_COLOR;

    Element lastTableRow = TableTemplateParser.getTableLastRow(htmlElement);
    String lastColumnColor = null;

    if (lastTableRow != null)
    {
      NodeList children = lastTableRow.getChildNodes();

      for (int i = 0; i < children.getLength(); i++)
      {
        Element child = (Element) children.item(i);
        String elementClass = child.getAttribute(ODPConvertConstants.HTML_ATTR_CLASS);
        if (elementClass.contains(ODPConvertConstants.HTML_ATTR_TABLE_CELL) && elementClass.contains(TABLE_LAST_COLUMN))
        {
          lastColumnColor = TableTemplateParser.getBackgroundColor(child);
          break;
        }
      }

      if (lastColumnColor == null)
      {
        lastColumnColor = TableTemplateParser.getBackgroundColor(lastTableRow);
      }
    }

    if (lastColumnColor != null)
    {
      backgroundColor = lastColumnColor;
    }

    return backgroundColor;
  }

  private static String getBorderColor(OdfFileDom odfDocument, Element htmlElement)
  {

    String borderColor = BLACK_STYLE_COLOR;

    Element tableRow = TableTemplateParser.getTableStyleRow(htmlElement);
    if (tableRow != null)
    {
      NodeList children = tableRow.getChildNodes();
      Node tableData = children.item(0);

      NamedNodeMap firstRowAttrs = tableData.getAttributes();

      Node tableDataStyle = firstRowAttrs.getNamedItem(ODPConvertConstants.HTML_STYLE_TAG);
      String style = tableDataStyle.getNodeValue();

      if (style.contains(ODPConvertConstants.ODF_ELEMENT_BORDER_COLOR) || style.contains(ODPConvertConstants.ODF_ELEMENT_BORDER_TOP_COLOR))
      {
        String[] values = style.split(";");
        for (int i = 0; i < values.length; i++)
        {
          if (values[i].contains(ODPConvertConstants.ODF_ELEMENT_BORDER_COLOR)
              || style.contains(ODPConvertConstants.ODF_ELEMENT_BORDER_TOP_COLOR))
          {
            String[] borderValue = values[i].split(":");
            if (borderValue[1].contains(RGB_HTML_TAG))
            {
              borderColor = CSSUtil.convertRGBValues(borderValue[1]).trim();
            }
            else
            {
              borderColor = borderValue[1].trim();
            }
          }
        }
      }
    }

    return borderColor;
  }

  private static String getFontColor(OdfFileDom odfDocument, Element htmlElement)
  {
    String fontColor = BLACK_STYLE_COLOR;

    return fontColor;
  }

  private static String getBackgroundColor(Element tableElement)
  {

    String backgroundColor = null;

    if (tableElement != null)
    {
      NamedNodeMap firstRowAttrs = tableElement.getAttributes();

      Node elementStyle = firstRowAttrs.getNamedItem(ODPConvertConstants.HTML_ATTR_STYLE);
      String style = elementStyle.getNodeValue();

      if (style != null && style.toLowerCase().contains(ODPConvertConstants.ODF_ELEMENT_BACKGROUND_COLOR))
      {
        String[] values = style.split(";");
        for (int j = 0; j < values.length; j++)
        {
          if (values[j].toLowerCase().contains(ODPConvertConstants.ODF_ELEMENT_BACKGROUND_COLOR))
          {
            String[] backgroundValue = values[j].toLowerCase().split(":");
            if (backgroundValue[1].contains(RGB_HTML_TAG))
            {
              backgroundColor = CSSUtil.convertRGBValues(backgroundValue[1]).trim();
            }
            else if (backgroundValue[1].trim().equals(ODPConvertConstants.CSS_VALUE_TRANSPARENT))
            {
              backgroundColor = WHITE_STYLE_COLOR;
            }
            else
            {
              backgroundColor = backgroundValue[1].trim();
            }
          }
        }
      }
    }

    return backgroundColor;
  }

  private static String getCustomStyleName(ConversionContext context)
  {
    String customStyleName = DEFAULT_STYLE_PREFIX;
    Document stylesdom = (Document) context.get(ODPConvertConstants.CONTEXT_STYLES_DOM);

    HashSet<String> domTableTemplates = new HashSet<String>();

    NodeList tableTemplates = stylesdom.getElementsByTagName(ODPConvertConstants.ODF_ELEMENT_TABLETABLE_TEMPLATE);
    if (tableTemplates != null)
    {
      for (int tempindex = 0; tempindex < tableTemplates.getLength(); tempindex++)
      {
        Element tabletemp = (Element) tableTemplates.item(tempindex);
        String styleName = tabletemp.getAttribute(ODPConvertConstants.ODF_ATTR_TEXT_STYLE_NAME);
        domTableTemplates.add(styleName.toLowerCase());
      }
    }

    String definedStyles = (String) context.get(ODPConvertConstants.CONTEXT_DEFINED_TABLE_STYLES);

    // Add the currently defined styles to the current table templates
    if (definedStyles != null && definedStyles.length() > 0)
    {
      String[] styles = definedStyles.split(" ");

      for (String style : styles)
      {
        domTableTemplates.add(style.toLowerCase());
      }
    }

    if (domTableTemplates.contains(DEFAULT_STYLE_PREFIX.toLowerCase()))
    {
      customStyleName = TableTemplateParser.getTableCustomStyleName(domTableTemplates);
    }

    context.put(ODPConvertConstants.CONTEXT_CUSTOM_STYLE_NAME, customStyleName);
    return customStyleName;
  }

  // Function to obtain the next custom style name for creating table template styles
  private static String getTableCustomStyleName(HashSet<String> definedTemplates)
  {
    int i = 1;
    String customStyleName = "";
    while (true)
    {
      String styleName = DEFAULT_STYLE_PREFIX + i++;
      if (!definedTemplates.contains(styleName.toLowerCase()))
      {
        customStyleName = styleName;
        break;
      }
    }
    return customStyleName;
  }
}
