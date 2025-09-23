/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.html2odp.util;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Set;
import java.util.StringTokenizer;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.odftoolkit.odfdom.OdfElement;
import org.odftoolkit.odfdom.OdfFileDom;
import org.odftoolkit.odfdom.doc.draw.OdfDrawCircle;
import org.odftoolkit.odfdom.doc.draw.OdfDrawConnector;
import org.odftoolkit.odfdom.doc.draw.OdfDrawCustomShape;
import org.odftoolkit.odfdom.doc.draw.OdfDrawEllipse;
import org.odftoolkit.odfdom.doc.draw.OdfDrawLine;
import org.odftoolkit.odfdom.doc.draw.OdfDrawRect;
import org.odftoolkit.odfdom.doc.style.OdfStyle;
import org.odftoolkit.odfdom.doc.style.OdfStyleGraphicProperties;
import org.odftoolkit.odfdom.dom.style.OdfStyleFamily;
import org.w3c.dom.Element;
import org.w3c.dom.NamedNodeMap;
import org.w3c.dom.Node;

import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;
import com.ibm.symphony.conversion.converter.html2odp.style.CSSUtil;
import com.ibm.symphony.conversion.presentation.ODPCommonUtil;
import com.ibm.symphony.conversion.presentation.ODPConvertConstants;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.ConvertUtil;
import com.ibm.symphony.conversion.service.common.ODFConstants;
import com.ibm.symphony.conversion.service.common.shape2image.ODPConvertMapUtil;
import com.ibm.symphony.conversion.service.common.shape2image.ODPConvertStyleMappingUtil;

public class ContentConvertUtil
{
  public static String NOT_FOUND = "NOT FOUND";

  public static final String ODP_STYLES_MAP = "style-elements";

  private static final String CDUP_STYLE_NAME_PATTERN = "^(.*)_[0-9]+_" + ODPConvertConstants.STYLE_COPY_IDENTIFIER + "$";

  private static Pattern cdup_style_name_pattern = Pattern.compile(CDUP_STYLE_NAME_PATTERN);

  public static String getNodeNameByClass(String allClass)
  {
    String nodeName = NOT_FOUND;
    JSONObject jsonMap = ODPConvertMapUtil.getJSONMap(ODPConvertMapUtil.MAP_HTML_CLASS);
    if (allClass != null)
    {
      String[] classes = allClass.split(ODPConvertConstants.SYMBOL_WHITESPACE);
      for (int i = 0; i < classes.length; i++)
      {
        Object name = jsonMap.get(classes[i]);
        if (name != null)
        {
          nodeName = (String) name;
          if (!ODPConvertConstants.ODF_ELEMENT_DRAWFRAME.equals(nodeName))
            break;
        }
      }
    }
    return nodeName;
  }

  public static boolean isPreservedAttribute(String attrName)
  {
    String[] segments = attrName.split(ODPConvertConstants.SYMBOL_UNDERBAR);
    if (segments.length > 1 && ODPConvertMapUtil.getJSONMap(ODPConvertMapUtil.MAP_NAMESPACE).get(segments[0]) != null)
    {
      return true;
    }
    return false;
  }

  public static String convertToQName(String preservedName)
  {
    String qName = preservedName.replaceFirst(ODPConvertConstants.SYMBOL_UNDERBAR, ODPConvertConstants.SYMBOL_COLON);

    qName = qName.replaceAll(ODPConvertConstants.SYMBOL_UNDERBAR, ODPConvertConstants.SYMBOL_DASH);
    return qName;
  }

  public static String getNamespaceUri(String qName)
  {
    String[] nodeNameSegments = qName.split(ODPConvertConstants.SYMBOL_COLON);
    String namespaceUri = (String) ODPConvertMapUtil.getJSONMap(ODPConvertMapUtil.MAP_NAMESPACE).get(nodeNameSegments[0]);
    return namespaceUri;
  }

  @SuppressWarnings("unchecked")
  public static OdfElement buildDefaultStyles(String nodeQName, String styleName, OdfFileDom dom)
  {
    Object arrays = ODPConvertMapUtil.getJSONMap(ODPConvertMapUtil.MAP_DEFAULT_ODP_STYLES).get(nodeQName);
    OdfElement styleElement = null;
    if (arrays != null)
    {
      JSONArray styles = (JSONArray) arrays;
      Iterator<JSONObject> iter = (Iterator<JSONObject>) styles.iterator();

      while (iter.hasNext())
      {
        JSONObject style = iter.next();
        String sourceName = (String) style.get(ODPConvertConstants.ODF_ATTR_STYLE_NAME);
        if (sourceName != null && sourceName.equals(styleName))
        {
          // this is the target style for built. Built it.
          styleElement = buildOdfElementFromJson(style, nodeQName, dom);
          break;
        }
      }
    }
    return styleElement;
  }

  public static Map<String, String> buildStringStringMap(String attr)
  {
    return buildStringStringMap(attr, false, true);
  }

  public static Map<String, String> buildStringStringMap(String attr, boolean preserveCase, boolean removeWhiteSpace)
  {
    if (removeWhiteSpace)
      attr = attr.replaceAll("\\s", "");
    if (!preserveCase)
      attr = attr.toLowerCase();
    StringTokenizer tokenizer = new StringTokenizer(attr, ODPConvertConstants.SYMBOL_SEMICOLON);

    Map<String, String> stringStringMap = new HashMap<String, String>();

    while (tokenizer.hasMoreTokens())
    {
      String next = tokenizer.nextToken();
      int delim = next.indexOf(ODPConvertConstants.SYMBOL_COLON);
      if (delim > 0)
      {
        stringStringMap.put(next.substring(0, delim), next.substring(delim + 1));
      }
    }
    return stringStringMap;
  }

  public static boolean isShapeModifiable(Element odfElement)
  {
    return odfElement instanceof OdfDrawCustomShape || (odfElement instanceof OdfDrawLine) || (odfElement instanceof OdfDrawRect)
        || (odfElement instanceof OdfDrawEllipse) || (odfElement instanceof OdfDrawCircle) || (odfElement instanceof OdfDrawConnector);
  }

  @SuppressWarnings({ "unchecked", "restriction", "rawtypes" })
  public static OdfElement buildOdfElementFromJson(JSONObject json, String elementQName, OdfFileDom dom)
  {
    String nameSpaceUri = getNamespaceUri(elementQName);
    OdfElement targetElement = dom.createElementNS(nameSpaceUri, elementQName);

    Set entries = json.entrySet();

    // for(int i = 0; i < entries.size(); i++){
    Iterator iter = entries.iterator();
    while (iter.hasNext())
    {
      Entry entry = (Entry) iter.next();
      if (entry.getValue() instanceof JSONObject)
      {
        // contains a new element, need recursively added.
        OdfElement subElement = buildOdfElementFromJson(json, (String) entry.getKey(), dom);
        targetElement.appendChild(subElement);
      }
      else if (entry.getValue() instanceof JSONArray)
      {
        JSONArray array = (JSONArray) entry.getValue();
        Iterator<JSONObject> arrayIter = (Iterator<JSONObject>) array.iterator();
        while (arrayIter.hasNext())
        {
          JSONObject obj = arrayIter.next();
          OdfElement elementInArray = buildOdfElementFromJson(obj, (String) entry.getKey(), dom);
          targetElement.appendChild(elementInArray);
        }
      }
      else
      {
        // simple string.
        targetElement.setAttributeNS(getNamespaceUri((String) entry.getKey()), (String) entry.getKey(), (String) entry.getValue());
      }
    }

    // }
    return targetElement;
  }

  /**
   * Generate proper style name for a given initial name. This method will be called When trying to do a style insertion. to make sure there
   * is no repeat name in styles dom and content dom.
   * 
   * @param initialName
   * @param context
   * @return
   */
  @SuppressWarnings("unchecked")
  public static String generateStyleName(String initialName, ConversionContext context)
  {
    int split, c;
    int number = 0;
    for (split = 0; split < initialName.length(); split++)
    {
      c = initialName.charAt(split);
      if (48 < c && c < 58) // Detect first digit 1 - 9
        break;
    }
    String type = initialName.substring(0, split);
    if (split < initialName.length())
    {
      number = Integer.parseInt(initialName.substring(split));
    }

    Map<String, OdfElement> stylesMap = (Map<String, OdfElement>) context.get(ODP_STYLES_MAP);
    if (stylesMap.get(type + number) == null)
    {
    } // Use the original number if it doesn't already exist
    else
    {
      number *= 10; // Start by multiplying the number by 10 to get a unique range for the supported types.
      while (stylesMap.get(type + number) != null)
      {
        ++number;
      }
    }
    return type + number;

  }

  /**
   * Returns the original name from a given style name by stripping out any characters added by the CDUP code. If the style name doesn't
   * contain any CDUP characters, it is returned as is.
   * 
   * @param styleName
   *          - the style name to filter
   * @return the filtered style name
   */
  public static String getOriginalNameFromCDUPStyle(String styleName)
  {
    if (styleName == null)
    {
      return null;
    }

    Matcher m = cdup_style_name_pattern.matcher(styleName);
    if (m.matches())
    {
      return m.group(1);
    }
    else
    {
      return styleName;
    }
  }

  /**
   * 
   * @param initialName
   * @param context
   * @param inContentDom
   *          : if not in ContentDom, then will insert in styles Dom
   * @param minHeight
   *          : if provided, use this value in place of the value in the json file to set fo:min-height
   */
  @SuppressWarnings({ "unchecked", "restriction" })
  public static String insertStyle(String initialName, ConversionContext context, boolean inContentDom, String minHeight)
  {
    String adjustedStyleName = ContentConvertUtil.generateStyleName(initialName, context);
    Map<String, OdfElement> addedStyles = (Map<String, OdfElement>) context.get(ODPConvertConstants.CONTEXT_ODP_STYLES_MAP_ADDED);

    OdfFileDom odfDom;

    if (inContentDom)
    {
      odfDom = (OdfFileDom) context.get(ODPConvertConstants.CONTEXT_CONVERT_TARGET);
    }
    else
    {
      odfDom = (OdfFileDom) context.get(ODPConvertConstants.CONTEXT_STYLES_DOM);
    }

    if (!addedStyles.containsKey(adjustedStyleName))
    {
      OdfElement textStyle = ContentConvertUtil.buildDefaultStyles(ODPConvertConstants.ODF_ATTR_STYLE_STYLE, initialName, odfDom);
      if (!adjustedStyleName.equals(initialName))
        textStyle.setAttributeNS(ContentConvertUtil.getNamespaceUri(ODPConvertConstants.ODF_ATTR_STYLE_NAME),
            ODPConvertConstants.ODF_ATTR_STYLE_NAME, adjustedStyleName);
      if (minHeight != null) // min-height override provided?
      {
        // Get the current fo:min-height property
        String currentMinHeight = ((OdfStyle) textStyle).getProperty(OdfStyleGraphicProperties.MinHeight);
        if (currentMinHeight != null && !currentMinHeight.equals(minHeight))
        {
          // Override the current value with the new minimum provided.
          ((OdfStyle) textStyle).setProperty(OdfStyleGraphicProperties.MinHeight, minHeight);
        }
      }
      /**
       * update the template
       */
      String default_template = textStyle.getAttribute(ODPConvertConstants.ODF_ATTR_PARENT_STYLE_NAME);
      if (default_template.length() > 0)
      {
        String postfix = default_template.substring(default_template.lastIndexOf(ODPConvertConstants.SYMBOL_DASH),
            default_template.length());
        String template = context.get(ODPConvertConstants.HTML_ATTR_PAGE_TEMPLATE_NAME) + postfix;
        textStyle.setAttributeNS(ContentConvertUtil.getNamespaceUri(ODPConvertConstants.ODF_ATTR_PARENT_STYLE_NAME),
            ODPConvertConstants.ODF_ATTR_PARENT_STYLE_NAME, template);
      }
      odfDom.getAutomaticStyles().appendChild(textStyle);
      addedStyles.put(adjustedStyleName, textStyle);
    }
    else if (minHeight != null)
    {
      // Verify that the minimum height matches the already added style. If not, we'll need to make a new one.
      OdfElement textStyle = addedStyles.get(adjustedStyleName);
      // Get the current fo:min-height property
      String currentMinHeight = ((OdfStyle) textStyle).getProperty(OdfStyleGraphicProperties.MinHeight);
      if (currentMinHeight != null && !currentMinHeight.equals(minHeight))
      {
        // Create new presentation style to protect the initial presentation style.
        OdfElement newStyle = (OdfElement) textStyle.cloneNode(true); // should be light copy.
        String newName = CSSUtil.getStyleName(OdfStyleFamily.Presentation, adjustedStyleName);
        newStyle.setAttribute(ODFConstants.STYLE_NAME, newName);
        adjustedStyleName = newName;

        // Override the current value with the new minimum provided.
        ((OdfStyle) newStyle).setProperty(OdfStyleGraphicProperties.MinHeight, minHeight);

        odfDom.getAutomaticStyles().appendChild(newStyle);
        addedStyles.put(adjustedStyleName, newStyle);
      }
    }
    return adjustedStyleName;
  }

  /**
   * Update the presentation style in the content Dom if the master style has changed (leading to the parent being incorrect) or if the
   * textbox has been resized. Update the parent style (if the master style has changed), and update fo:min-height if the new master style
   * or resize of the text box requires it.
   * 
   * @param styleName
   *          - the presentation style name to update
   * @param context
   *          - the current conversion context
   * @param minHeight
   *          - the new minimum height to use. null indicates to not update the current value.
   */
  @SuppressWarnings({ "restriction", "unchecked" })
  public static void updatePresentationStyle(String styleName, ConversionContext context, String minHeight)
  {

    Map<String, OdfElement> updatedStyles = (Map<String, OdfElement>) context.get(ODPConvertConstants.CONTEXT_ODP_STYLES_MAP_UPDATED);
    if (!updatedStyles.containsKey(styleName))
    {

      // Check if the existing presentation style needs to be updated. It needs to be updated if the
      // master style has changed and/or the textbox has been resized. In the later case, only the fo:min-height
      // will require update.
      Map<String, OdfElement> stylesMap = (Map<String, OdfElement>) context.get(ODP_STYLES_MAP);
      OdfElement presentationStyle = stylesMap.get(styleName);
      if (presentationStyle != null)
      {
        String parentStyle = presentationStyle.getAttribute(ODPConvertConstants.ODF_ATTR_PARENT_STYLE_NAME);
        if (parentStyle.length() > 0)
        {
          boolean updateRequired = false;
          String template = parentStyle.substring(0, parentStyle.lastIndexOf(ODPConvertConstants.SYMBOL_DASH));
          String newTemplate = (String) context.get(ODPConvertConstants.HTML_ATTR_PAGE_TEMPLATE_NAME);

          if (!template.equals(newTemplate))
          {
            // Update required - start with the parent name
            String postfix = parentStyle.substring(parentStyle.lastIndexOf(ODPConvertConstants.SYMBOL_DASH), parentStyle.length());
            presentationStyle.setAttributeNS(ContentConvertUtil.getNamespaceUri(ODPConvertConstants.ODF_ATTR_PARENT_STYLE_NAME),
                ODPConvertConstants.ODF_ATTR_PARENT_STYLE_NAME, newTemplate + postfix);
            updateRequired = true;
          }
          if (minHeight != null)
          {
            // Get the current fo:min-height property
            String currentMinHeight = ((OdfStyle) presentationStyle).getProperty(OdfStyleGraphicProperties.MinHeight);
            if (currentMinHeight != null && !currentMinHeight.equals(minHeight))
            {
              // Override the current value with the new minimum provided.
              ((OdfStyle) presentationStyle).setProperty(OdfStyleGraphicProperties.MinHeight, minHeight);
              updateRequired = true;
            }
          }
          if (updateRequired)
          {
            // Set this presentation style in the updated styles map to speed processing of subsequent uses of this style
            updatedStyles.put(styleName, presentationStyle);
          }
        }
      }
    }
  }

  /*
   * krings - looks into the context to determine if the current element we are processing is a field return true if found in context, false
   * otherwise
   */
  public static boolean isField(ConversionContext context)
  {
    boolean isField = false;
    try
    {
      isField = (Boolean) context.get(ODPConvertConstants.CONTEXT_FIELD_BOOLEAN_ATTRIBUTE);
    }
    catch (Exception e)
    {
      return false;
    }
    return isField;
  }

  /*
   * krings - If the element being processed is a field, handle them accordingly For a page-number, ignore the span that have <number> in it
   * For a date, remove a null attribute from the text:date-value For a time, remove a null attribure from the text:time-value
   */
  @SuppressWarnings("restriction")
  public static void handleFields(ConversionContext context, OdfElement odfParent, OdfElement odfElement)
  {
    String fieldType = (String) context.get(ODPConvertConstants.CONTEXT_FIELD_TYPE);
    if (fieldType.equalsIgnoreCase(ODPConvertConstants.HTML_ATTR_PAGE_NUMBER_FIELD))
    {
      if (!odfElement.getLocalName().equalsIgnoreCase(ODPConvertConstants.HTML_ELEMENT_SPAN))
      {
        odfParent.appendChild(odfElement);
      }
    }
    if (fieldType.equalsIgnoreCase(ODPConvertConstants.HTML_ATTR_DATE_FIELD_TYPE))
    {
      String dateValue = odfParent.getAttribute(ODPConvertConstants.ODF_ATTR_TEXT_FIELD_DATE);
      if (null == dateValue)
        odfParent.removeAttribute(ODPConvertConstants.ODF_ATTR_TEXT_FIELD_DATE);
    }
    if (fieldType.equalsIgnoreCase(ODPConvertConstants.HTML_ATTR_TIME_FIELD_TYPE))
    {
      String timeValue = odfParent.getAttribute(ODPConvertConstants.ODF_ATTR_TEXT_FIELD_TIME);
      if (null == timeValue)
        odfParent.removeAttribute(ODPConvertConstants.ODF_ATTR_TEXT_FIELD_TIME);
    }
    // remove entries from context
    context.put(ODPConvertConstants.CONTEXT_FIELD_BOOLEAN_ATTRIBUTE, false);
    context.put(ODPConvertConstants.CONTEXT_FIELD_TYPE, "");
  }

  /**
   * Check if the html element's class attribute has a class value flagging the element as default information.
   * 
   * @param htmlElement
   * @return true if element has the default content text flag.
   */
  public static boolean containsDefaultData(Element htmlElement)
  {
    if (htmlElement == null)
    {
      return false;
    }

    String vals = htmlElement.getAttribute(ODPConvertConstants.HTML_ATTR_CLASS);
    if (vals == null)
    {
      return false;
    }

    String[] cv = vals.split(" ");
    for (String cval : cv)
    {
      if (cval.equalsIgnoreCase(ODPConvertConstants.CSS_DEFAULT_CONTENT_TEXT))
      {
        return true;
      }
      if (cval.equalsIgnoreCase(ODPConvertConstants.CSS_DEFAULT_CONTENT_IMAGE))
      {
        return true;
      }
    }

    // when it's ul, its child li may have defautlContentText class
    if (htmlElement.getTagName().equalsIgnoreCase(ODPConvertConstants.HTML_ELEMENT_UL)
        && htmlElement.getChildNodes().getLength() != 0)
    {
      Element li = (Element) htmlElement.getChildNodes().item(0);
      String liClass = li.getAttribute(ODPConvertConstants.HTML_ATTR_CLASS);
      if (liClass != null && liClass.contains(ODPConvertConstants.CSS_DEFAULT_CONTENT_TEXT))
      {
        return true;
      }
    }

    return false;
  }

  public static OdfElement unflattenElement(OdfFileDom contentDom, String fe)
  {
    // Get the list of elements
    List<String> elements = getElementsFromString(fe);

    int capacity = ODPCommonUtil.calculateGrowableArrayCapacity(elements.size() + 1);
    List<OdfLevelElement> elemList = new ArrayList<OdfLevelElement>(capacity);

    // First Element is special. Create the element that will be returned
    OdfElement returnElement = createElement(contentDom, elements.get(0));
    addAttributes(returnElement, elements.get(0));
    int level = getElementLevel(elements.get(0));
    elemList.add(new OdfLevelElement(returnElement, level));

    // Now handle the rest of the elements
    for (int i = 1; i < elements.size(); i++)
    {
      OdfElement element = createElement(contentDom, elements.get(i));
      if(element == null)
      	continue;
      addAttributes(element, elements.get(i));
      int elementLevel = getElementLevel(elements.get(i));
      addElementToParent(elemList, element, elementLevel);
      elemList.add(new OdfLevelElement(element, elementLevel));
    }
    return returnElement;

  }

  @SuppressWarnings("restriction")
  private static void addElementToParent(List<OdfLevelElement> elemList, OdfElement element, int level)
  {
    // If level equals 1, it is the child of the elemnt that is to be returned
    if (level == 1)
    {
      OdfElement parent = elemList.get(0).getElement();
      parent.appendChild(element);
      return;
    }
    // Level is greater than 1. Need to iterate backwards through the list to find its parent
    boolean parentFound = false;
    for (int i = elemList.size(); !parentFound; i--)
      if (elemList.get(i - 1).getLevel() == (level - 1))
      {
        parentFound = true;
        OdfElement parent = elemList.get(i - 1).getElement();
        parent.appendChild(element);
      }
  }

  private static OdfElement createElement(OdfFileDom contentDom, String element)
  {
    String elementName = getElementName(element);
    if(elementName.equalsIgnoreCase("#text")){
    	return null;
    }
    return contentDom.createElementNS(ContentConvertUtil.getNamespaceUri(elementName), elementName);
  }

  @SuppressWarnings("restriction")
  private static void addAttributes(OdfElement element, String attrStr)
  {
    List<String> attributes = getAttributes(attrStr);
    for (int i = 0; i < attributes.size(); i++)
    {
      String[] nameValue = attributes.get(i).split("\\:\\:");
      if (nameValue.length > 1)
      {
        element.setAttributeNS(ContentConvertUtil.getNamespaceUri(nameValue[0]), nameValue[0], nameValue[1]);
      }
      else
      {
        element.setAttributeNS(ContentConvertUtil.getNamespaceUri(nameValue[0]), nameValue[0], "");
      }
    }
  }

  private static List<String> getElementsFromString(String fe)
  {
    String[] elements = fe.split("ELEMENT\\:\\:");
    int capacity = ODPCommonUtil.calculateArrayCapacity(elements.length);
    List<String> list = new ArrayList<String>(capacity);
    for (int i = 0; i < elements.length; i++)
      if (elements[i].length() > 0)
        list.add(elements[i]);
    return list;
  }

  private static String getElementName(String str)
  {
    int endIndexOfName = str.indexOf("|!|");
    String elementName = str.substring(0, endIndexOfName);
    return elementName;
  }

  private static int getElementLevel(String str)
  {
    int beginningOfLevel = str.indexOf("LEVEL::");
    int endOfLevel = str.indexOf("|-|");
    String level = str.substring(beginningOfLevel + "LEVEL::".length(), endOfLevel);
    return Integer.parseInt(level);
  }

  private static List<String> getAttributes(String str)
  {
    int indexOfAttrs = str.indexOf("|-|");
    String attrStr = str.substring(indexOfAttrs + 3);
    String[] attrs = attrStr.split("\\|\\!\\|");

    int capacity = ODPCommonUtil.calculateArrayCapacity(attrs.length);
    List<String> attributes = new ArrayList<String>(capacity);
    for (int i = 0; i < attrs.length; i++)
    {
      if (attrs[i].length() > 0)
        attributes.add(attrs[i]);
    }
    return attributes;
  }

  public static ArrayList<OdfElement> processPreserveOnlyElements(OdfFileDom contentDom, Element htmlElement)
  {
    NamedNodeMap attrs = htmlElement.getAttributes();
    if (attrs == null)
      return null;

    int size = attrs.getLength();
    int capacity = ODPCommonUtil.calculateArrayCapacity(size);
    ArrayList<OdfElement> elements = new ArrayList<OdfElement>(capacity);
    int preservedElements = 0;
    for (int i = 0; i < size; i++)
    {
      Node item = attrs.item(i);
      // Use 2 colons to separate name from value, and the string "|-|" to separate attributes
      // Don't include id as this is not and attribute
      String attrName = item.getNodeName();
      if (attrName.startsWith(ODPConvertConstants.HTML_ATTR_PRESERVE_ONLY))
      {
        String attrValue = item.getNodeValue();
        preservedElements++;
        elements.add(ContentConvertUtil.unflattenElement(contentDom, attrValue));
      }
    }
    if (preservedElements == 0)
      return null;
    return elements;
  }

  /**
   * Returns the parent style name of a given style name.
   * 
   * @param context
   *          conversion context
   * @param styleName
   *          style name to get the parent style name of
   * @return the parent style name, or null if none can be found
   */
  public static String getParentStyleName(ConversionContext context, String styleName)
  {
    List<Node> l = ODPConvertStyleMappingUtil.getAllStyleNameNodesByKey(context, styleName);
    Node styleNode;
    if (l == null || (styleNode = l.get(0)) == null)
    {
      return null;
    }
    Node parentStyleAttr = styleNode.getAttributes().getNamedItem(ODPConvertConstants.ODF_ATTR_PARENT_STYLE_NAME);
    if (parentStyleAttr == null)
    {
      return null;
    }
    return parentStyleAttr.getNodeValue();
  }
  
  public static String getFontSize(ConversionContext context, Element htmlElement)
  {
    String fontsize = null;
    if(htmlElement != null) {
        String customStyle = htmlElement.getAttribute(ODPConvertConstants.HTML_ATTR_CUSTOM_STYLE);
        if(customStyle != null && customStyle.contains(ODPConvertConstants.CSS_ABS_FONT_SIZE))
        {
          Map<String, String> map = ConvertUtil.buildCSSMap(customStyle);
          fontsize = map.get(ODPConvertConstants.CSS_ABS_FONT_SIZE);
        }
    }
    return fontsize;
  }

}
