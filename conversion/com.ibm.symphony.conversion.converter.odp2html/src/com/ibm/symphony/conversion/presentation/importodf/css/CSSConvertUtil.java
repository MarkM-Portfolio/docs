/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.presentation.importodf.css;

import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Set;

import org.odftoolkit.odfdom.OdfElement;
import org.odftoolkit.odfdom.doc.style.OdfStyle;
import org.odftoolkit.odfdom.doc.style.OdfStyleTextProperties;
import org.odftoolkit.odfdom.dom.element.OdfStyleBase;
import org.odftoolkit.odfdom.dom.style.props.OdfTextProperties;
import org.w3c.dom.Attr;
import org.w3c.dom.Element;
import org.w3c.dom.NamedNodeMap;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

import com.ibm.symphony.conversion.presentation.ODPConvertConstants;
import com.ibm.symphony.conversion.presentation.importodf.ODPConvertUtil;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.ConvertUtil;
import com.ibm.symphony.conversion.service.common.IConvertor;
import com.ibm.symphony.conversion.service.common.ODFConstants;
import com.ibm.symphony.conversion.service.common.g11n.G11NFontFamilyUtil;
import com.ibm.symphony.conversion.service.common.shape2image.ODPConvertStyleMappingUtil;
import com.ibm.symphony.conversion.service.common.util.Measure;

public class CSSConvertUtil
{
  public static final String globalStyle = ODPConvertConstants.CSS_CONCORD_SPECIFICITY_INCREASE_CLASS
      + " .flipH {-moz-transform: scaleX(-1);-webkit-transform: scaleX(-1);-o-transform: scaleX(-1);-ms-transform: scaleX(-1);transform: scaleX(-1);}\n"
      + ODPConvertConstants.CSS_CONCORD_SPECIFICITY_INCREASE_CLASS
      + " .flipV {-moz-transform: scaleY(-1);-webkit-transform: scaleY(-1);-o-transform: scaleY(-1);-ms-transform: scaleY(-1);transform: scaleY(-1);}\n"
      + ODPConvertConstants.CSS_CONCORD_SPECIFICITY_INCREASE_CLASS
      + " .flipVH {-moz-transform: scale(-1,-1);-webkit-transform: scale(-1,-1);-o-transform: scale(-1,-1);-ms-transform: scale(-1,-1);transform: scale(-1,-1);}\n";

  public static final String marginTopOverrides = ".draw_frame_classes ul:first-child>li:first-child {margin-top:0px !important;}\n"
      + ".draw_frame_classes ol:first-child>li:first-child {margin-top:0px !important;}\n"
      + ".draw_frame_classes p:first-child {margin-top:0px !important;}\n"
      + ".draw_shape_classes ul:first-child>li:first-child {margin-top:0px !important;}\n"
      + ".draw_shape_classes ol:first-child>li:first-child {margin-top:0px !important;}\n"
      + ".draw_shape_classes p:first-child {margin-top:0px !important;}\n"
      + ".table_table-cell ul:first-child>li:first-child {margin-top:0px !important;}\n"
      + ".table_table-cell ol:first-child>li:first-child {margin-top:0px !important;}\n"
      + ".table_table-cell p:first-child {margin-top:0px !important;}\n";

  public static final String symphonyDefaults = ".symDefaultStyle {border-color: black; border-width: 1px;}\n";

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

  /**
   * Get the appropriate style map to use based on whether we are in style or content processing. If in style processing it will look in the
   * CONTEXT_CSS_AUTOMATIC_STYLE map for the styleName. If in content processing it will look in the CONTEXT_CSS_CONTENT_STYLE map for the
   * styleName.
   * 
   * @param context
   *          - the current context
   * @param styleName
   *          - the style name to retrieve the style map for
   * @return Map<String, String> - null if styleName is not found.
   */
  public static Map<String, String> getStyleMap(ConversionContext context, String styleName)
  {
    styleName = CSSConvertUtil.getStyleName(styleName);

    Map<String, Map<String, String>> styles = getStyles(context);

    return styles.get(styleName);
  }

  /*
   * Return styles that are in use in the context (in style, or in content)
   * 
   * @param context - the current context
   * 
   * @return Map<String, Map<String, String>> - current context styles
   */
  @SuppressWarnings("unchecked")
  public static Map<String, Map<String, String>> getStyles(ConversionContext context)
  {
    boolean inStyleProcessing = (Boolean) context.get(ODPConvertConstants.CONTEXT_IN_STYLE);
    if (inStyleProcessing)
    {
      return (Map<String, Map<String, String>>) context.get(ODPConvertConstants.CONTEXT_CSS_AUTOMATIC_STYLE);
    }
    else
    {
      return (Map<String, Map<String, String>>) context.get(ODPConvertConstants.CONTEXT_CSS_CONTENT_STYLE);
    }
  }

  @SuppressWarnings("restriction")
  public static String getRawStyleName(Node element, ConversionContext context)
  {
    String styleName = null;
    if (belongsToDefaultStyle(element))
    {
      styleName = ODPConvertConstants.ODF_STYLE_DEFAULT_NAME;
    }
    else if (ODFConstants.TEXT_LIST_STYLE.equals(element.getNodeName()))
    {
      styleName = ((OdfElement) element).getAttribute(ODFConstants.STYLE_NAME);
      if (styleName == null)
      {
        styleName = ((OdfElement) element).getNodeName().replace(':', '_');
      }
      if (!styleName.startsWith(ODPConvertConstants.CSS_CONCORD_LIST_STYLE_PREFIX))
        styleName = ODPConvertConstants.CSS_LIST_STYLE_PREFIX + styleName;
    }
    else if (ODFConstants.STYLE_LIST_LEVEL_PROPERTIES.equals(element.getNodeName()))
    {
      OdfElement parent = (OdfElement) element.getParentNode();
      OdfElement styleList = (OdfElement) parent.getParentNode();
      styleName = styleList.getAttribute(ODFConstants.STYLE_NAME);
      if (styleName == null)
      {
        styleName = styleList.getNodeName().replace(':', '_');
      }
      if (!styleName.startsWith(ODPConvertConstants.CSS_CONCORD_LIST_STYLE_PREFIX))
        styleName = ODPConvertConstants.CSS_LIST_STYLE_PREFIX + styleName;
    }
    else if (ODFConstants.TEXT_LIST_LEVEL_STYLE_BULLET.equals(element.getNodeName())
        || ODFConstants.TEXT_LIST_LEVEL_STYLE_NUMBER.equals(element.getNodeName())
        || ODFConstants.TEXT_LIST_LEVEL_STYLE_IMAGE.equals(element.getNodeName()))
    {
      OdfElement styleList = (OdfElement) element.getParentNode();
      styleName = styleList.getAttribute(ODFConstants.STYLE_NAME);
      if (styleName == null)
      {
        styleName = styleList.getNodeName().replace(':', '_');
      }

      if (!styleName.startsWith(ODPConvertConstants.CSS_CONCORD_LIST_STYLE_PREFIX))
      {
        // find container width to append to style name - change format from "24.99cm" to "24-99"
        String containerWidth = convertContainerWidthToStyleFormat(context);
        String bMasterTag = (String)context.get(ODPConvertConstants.CONTEXT_LIST_ITEM_LEVEL_FROM);
        if(bMasterTag!=null && bMasterTag.equals("master")){
        	if(styleName.startsWith("_"))
        		styleName = styleName.replaceFirst("_", "u");
        	styleName = "." + ODPConvertConstants.CSS_LIST_STYLE_PREFIX_NEW_MASTER + styleName;
        	
        }else
        	styleName = "." + ODPConvertConstants.CSS_LIST_STYLE_PREFIX_NEW + styleName + "_" + containerWidth;
      }
    }
    else if (element instanceof OdfElement)
    {

      Attr styleNameAttr = ((OdfElement) element).getAttributeNode(ODPConvertConstants.ODF_ATTR_STYLE_NAME);
      if (styleNameAttr == null)
      {
        // identify whether current node is the node that contains style
        // name.
        if (shouldContainsStyleName(element))
        {
          // ODF 1.1 Doc
          styleName = element.getNodeName().replace(':', '_');
        }
        else
        {
          styleName = getRawStyleName((OdfElement) element.getParentNode(), context);
        }

      }
      else
      {
        styleName = ODPConvertUtil.replaceUnderlineToU(styleNameAttr.getValue());

        if (element instanceof OdfStyle)
        {
          Attr styleFamily = ((OdfElement) element).getAttributeNode(ODPConvertConstants.ODF_ATTR_STYLE_FAMILY);
          if (styleFamily != null)
          {
            ODPConvertConstants.DOCUMENT_TYPE documentType = (ODPConvertConstants.DOCUMENT_TYPE) context
                .get(ODPConvertConstants.CONTEXT_DOCUMENT_TYPE);
            if (documentType == ODPConvertConstants.DOCUMENT_TYPE.CONTENT)
            {
              if (ODPConvertConstants.ODF_ELEMENT_TABLE_CELL.equals(styleFamily.getValue()))
              {
                // For <table:table-cell> in content.html, the style name is more complex than using just the named
                // style, we have to prefix it with a CSS selector name
                styleName = ODPConvertConstants.CSS_TABLE_CELL_SELECTOR + styleName;

              }
            }
          }
        }
      }
    }
    return ODPConvertStyleMappingUtil.getCanonicalStyleName(styleName);
  }

  public static final boolean belongsToDefaultStyle(Node element)
  {
    Node node = element;
    while (node != null && !ODPConvertConstants.ODF_STYLE_DEFAULT.equals(node.getNodeName()))
    {
      node = node.getParentNode();
    }
    if (node != null)
      return true;
    else
      return false;
  }

  public static String getStyleName(Node element, ConversionContext context)
  {
    return getStyleName(getRawStyleName(element, context));
  }

  public static String getStyleName(String stylename)
  {
    String tmp = ODPConvertStyleMappingUtil.getCanonicalStyleName(stylename);

    if(stylename != null
            && ((stylename.startsWith(".IL_")||stylename.startsWith(".ML_")||stylename.startsWith(".MP_")))){
    	return tmp;
    }
    else if(stylename != null
        && ((stylename.startsWith("IL_")||stylename.startsWith("ML_")||stylename.startsWith("MP_")))){
    	return "." + tmp;
    }
    // Some styles should not get a leading period
    else if (stylename != null
        && (stylename.startsWith("li.") || stylename.startsWith("li ") || stylename.startsWith("ul.") || stylename.startsWith("ol.") || stylename
            .startsWith("td.")))
    {
      return tmp + " ";
    }
    else
    {
      return "." + tmp + " ";
    }
  }

  public static final boolean shouldContainsStyleName(Node element)
  {
    String parentName = element.getParentNode().getNodeName();
    return ODPConvertConstants.ODF_STYLE_GRAPHIC_PROP.equals(parentName) ? ODPConvertConstants.ODF_STYLE_TEXT_LIST.equals(element
        .getNodeName()) : (ODPConvertConstants.ODF_STYLE_COMMON.equals(parentName) || ODPConvertConstants.ODF_STYLE_AUTO.equals(parentName)
        || ODPConvertConstants.ODF_STYLE_MASTER.equals(parentName) || ODPConvertConstants.ODF_STYLE_DEFAULT.equals(parentName));
  }

  public static String getStyleFamily(Node styleNode, boolean fromSelf)
  {
    Node family = null;
    if (fromSelf)
    {
      family = styleNode.getAttributes().getNamedItem(ODPConvertConstants.ODF_ATTR_STYLE_FAMILY);
    }
    else
    {
      // default from parent.
      family = styleNode.getParentNode().getAttributes().getNamedItem(ODPConvertConstants.ODF_ATTR_STYLE_FAMILY);
    }
    if (family != null)
      return family.getNodeValue();
    return null;
  }

  public static void convertCSSChildren(ConversionContext context, Node node, Object styles)
  {
    if (node.hasChildNodes())
    {
      NodeList list = node.getChildNodes();
      for (int i = 0; i < list.getLength(); i++)
      {
        Node childNode = list.item(i);
        if (!ODPConvertConstants.ODF_STYLE_MASTER.equals(childNode.getNodeName()))
        {
          IConvertor convertor = CSSConvertorFactory.getInstance().getConvertor(childNode);
          convertor.convert(context, childNode, styles);
        }
      }
    }
  }

  public static String getStyleContents(Map<String, Map<String, String>> styles)
  {
    return getStyleContents(styles, "");
  }

  // mich: added this method signature with a cssStyleClassPrefix parameter for defect 42214 to fix the so called "one ui" issue
  public static String getStyleContents(Map<String, Map<String, String>> styles, String cssStyleClassPrefix)
  {
    StringBuilder buf = new StringBuilder(128);

    Iterator<Entry<String, Map<String, String>>> cssIter = styles.entrySet().iterator();

    while (cssIter.hasNext())
    {
      Entry<String, Map<String, String>> cssStyle = cssIter.next();
      String key = cssStyle.getKey();
      // If prefix is provided and the key is not one of our "special keys", prepend it.
      if (cssStyleClassPrefix.length() > 0 && !key.startsWith("body."))
      {
        // mich: added this insertion of a prefix for defect 42214 to fix the so called "one ui" issue
        buf.append(cssStyleClassPrefix + " ");
      }
      buf.append(cssStyle.getKey());
      buf.append(" {");
      Iterator<Entry<String, String>> keyValueIter = cssStyle.getValue().entrySet().iterator();
      while (keyValueIter.hasNext())
      {
        Entry<String, String> keyValue = keyValueIter.next();
        buf.append(keyValue.getKey());
        buf.append(":");
        buf.append(keyValue.getValue());
        buf.append(";");
      }
      buf.append("}\n");
    }
    return buf.toString();
  }

  public static String getStyleAttribute(Node style, String name)
  {
    NamedNodeMap map = style.getAttributes();
    if (map != null)
    {
      Node node = map.getNamedItem(name);
      if (node != null)
        return node.getNodeValue();
    }
    NodeList children = style.getChildNodes();
    for (int i = 0; i < children.getLength(); i++)
    {
      Node child = children.item(i);
      String attr = getStyleAttribute(child, name);
      if (attr != null)
        return attr;
    }
    return null;
  }

  /**
   * Search the CSS automatic style and content style maps for attributeName in the list of style names listed in styleList. If found,
   * return the attribute value. If not found, return null.
   * 
   * @param context
   *          - the current ConversionContext
   * @param attributeName
   *          - the name of the attribute to search for
   * @param styleList
   *          - a whitespace separated list of style names to search for the attributeName. Note: the list will be searched right to left
   *          and for each named style, the automatic styles will be searched first followed by the content style.
   * @return attributeValue - the value associated with the first occurrence of attributeName found will be returned. null will be returned
   *         if none are found.
   */
  public static String getAttributeValue(ConversionContext context, String attributeName, String styleList)
  {
    String attributeValue = null; // Default to not found
    String[] style = styleList.trim().split("\\s+"); // Split the styleList by whitespace

    @SuppressWarnings("unchecked")
    Map<String, Map<String, String>> autoStyles = (Map<String, Map<String, String>>) context
        .get(ODPConvertConstants.CONTEXT_CSS_AUTOMATIC_STYLE);
    @SuppressWarnings("unchecked")
    Map<String, Map<String, String>> contentStyles = (Map<String, Map<String, String>>) context
        .get(ODPConvertConstants.CONTEXT_CSS_CONTENT_STYLE);
    @SuppressWarnings("unchecked")
    Map<String, Map<String, String>> officeStyles = (Map<String, Map<String, String>>) context
        .get(ODPConvertConstants.CONTEXT_CSS_COMMON_STYLE);

    // Scan backwards through the styleList searching for a matching attribute name
    for (int i = style.length - 1; i >= 0; --i)
    {
      String styleName = CSSConvertUtil.getStyleName(style[i]);
      Map<String, String> styleMap = autoStyles.get(styleName);
      if (styleMap != null)
      {
        attributeValue = styleMap.get(attributeName);
        if (attributeValue != null)
          break;
      }
      if (contentStyles != null)
      {
        styleMap = contentStyles.get(styleName);
        if (styleMap != null)
        {
          attributeValue = styleMap.get(attributeName);
          if (attributeValue != null)
            break;
        }
      }
      if (officeStyles != null)
      {
        styleMap = officeStyles.get(styleName);
        if (styleMap != null)
        {
          attributeValue = styleMap.get(attributeName);
          if (attributeValue != null)
            break;
        }
      }
    }

    return attributeValue;
  }

  /**
   * Search the CSS automatic style and content style maps corresponding to the style names in styleList. Search for attributes named in the
   * attrs hashmap. The values if found are put into the hashmap. The count of how many were found is returned.
   * 
   * @param context
   * @param attrs
   *          a hashmap of CSS atribute names to search for. The values should be null when passed in.
   * @param styleList
   *          whitespace separated list of style-names from the html class attribute.
   * @return count of number of attributes found.
   */
  public static int getAttributeValues(ConversionContext context, HashMap<String, String> attrs, String styleList)
  {
    if (attrs == null)
      return 0;

    int countFound = 0;

    String[] style = styleList.trim().split("\\s+"); // Split the styleList by whitespace

    @SuppressWarnings("unchecked")
    // onHoldStyles added in the scope of defect 9864
    Map<String, Map<String, String>> onHoldStyles = (Map<String, Map<String, String>>) context
        .get(ODPConvertConstants.CONTEXT_CSS_ON_HOLD_STYLE);
    @SuppressWarnings("unchecked")
    Map<String, Map<String, String>> contentStyles = (Map<String, Map<String, String>>) context
        .get(ODPConvertConstants.CONTEXT_CSS_CONTENT_STYLE);
    @SuppressWarnings("unchecked")
    Map<String, Map<String, String>> autoStyles = (Map<String, Map<String, String>>) context
        .get(ODPConvertConstants.CONTEXT_CSS_AUTOMATIC_STYLE);
    @SuppressWarnings("unchecked")
    Map<String, Map<String, String>> officeStyles = (Map<String, Map<String, String>>) context
        .get(ODPConvertConstants.CONTEXT_CSS_COMMON_STYLE);

    // clone the list of attributes so we can reduce the list each time we find one
    @SuppressWarnings("unchecked")
    HashMap<String, String> tmp = (HashMap<String, String>) attrs.clone();
    Set<String> attrNames = tmp.keySet();

    // special processing required for background color. If the background:transparent or
    // background:none value is found, this cancels the background color. But only if this is
    // found in a child style or within the same style. This means we need to detect if we uncover
    // this value before we encounter a background color.
    boolean backGroundInfoFound = false;

    // Scan backwards through the styleList searching for a matching attribute name
    for (int i = style.length - 1; i >= 0; --i)
    {

      if (attrNames.isEmpty())
        break;
      String item = style[i];
      if(item!=null && item.trim().endsWith("_CDUP"))
      {
        item = item.substring(0, item.lastIndexOf("_"));
        item = item.substring(0, item.lastIndexOf("_"));
      }

      String styleName = CSSConvertUtil.getStyleName(item);
       // loop through and search for each attribute
      Iterator<String> it = attrNames.iterator();
      while (it.hasNext())
      {
        String attributeName = it.next();
        String attributeValue = null; // Default to not found

        Map<String, String> styleMap = null;

        if (onHoldStyles != null)
        {
          styleMap = onHoldStyles.get(styleName);
          if (styleMap != null)
          {
            attributeValue = styleMap.get(attributeName);
          }
        }

        if (contentStyles != null && attributeValue == null)
        {
          styleMap = contentStyles.get(styleName);
          if (styleMap != null)
          {
            attributeValue = styleMap.get(attributeName);
          }
        }

        if (autoStyles != null && attributeValue == null)
        {
          styleMap = autoStyles.get(styleName);
          if (styleMap != null)
          {
            attributeValue = styleMap.get(attributeName);
          }
        }

        if (officeStyles != null && attributeValue == null)
        {
          styleMap = officeStyles.get(styleName);
          if (styleMap != null)
          {
            attributeValue = styleMap.get(attributeName);
          }
        }

        if (attributeValue == null)
          continue;

        if (attributeName.equalsIgnoreCase(ODPConvertConstants.CSS_BACKGROUND)
            || attributeName.equalsIgnoreCase(ODPConvertConstants.CSS_BACKGROUND_COLOR))
        {
          // check if we've already found background info. If so skip it
          // otherwise the conflicting information will cause problems.
          if (backGroundInfoFound)
          {
            it.remove();
            continue;
          }

          backGroundInfoFound = true;
        }

        if (attributeName.equals(ODPConvertConstants.CSS_BACKGROUND_COLOR))
        {
          // check to see if background exists on the same style level and has a
          // conflicting value. If so then omit background-color.

          String bgval = styleMap.get(ODPConvertConstants.CSS_BACKGROUND);
          if (bgval != null)
          {
            if (bgval.toLowerCase().contains(ODPConvertConstants.HTML_VALUE_NONE)
                || bgval.toLowerCase().contains(ODPConvertConstants.CSS_VALUE_TRANSPARENT))
            {
              // don't add anything .. just skip over the background color attribute
              backGroundInfoFound = false;
              it.remove();
              continue;
            }
          }
        }

        attrs.put(attributeName, attributeValue);
        it.remove();
        countFound++;
      }
    }
    return countFound;
  }

  /**
   * Search the CSS automatic style and content style maps for attributes in the same group (eg. margin and padding) in the list of style
   * names listed in styleList. If found, return the values of the attribute group. If not found, return null.
   * 
   * @param context
   *          - the current ConversionContext
   * @param attributeGroup
   *          - the name of the attribute group to search for
   * @param styleList
   *          - a whitespace separated list of style names to search for the attributeName. Note: the list will be searched right to left
   *          and for each named style, the automatic styles will be searched first followed by the content style.
   * @param valuesOnly
   *          - if true, the values for all dimensions will be returned. If false, the values will be returned in inline style form.
   * @return attributeGroupValue - the values associated with the first occurrence of various values for the attributeGroup found will be
   *         returned (either as an inline style or values only, based on valuesOnly). An empty string will be returned if none are found.
   */
  @SuppressWarnings("unchecked")
  public static String getGroupedInlineStyle(ConversionContext context, String attributeGroup, String styleList, boolean valuesOnly)
  {
    String[] style = styleList.trim().split("\\s+"); // Split the styleList by whitespace

    String[] values = new String[ALL_DIMENSIONS]; // Top, Right, Bottom, Left - these are initialized to null
    boolean done = false;

    Map<String, Map<String, String>> autoStyles = (Map<String, Map<String, String>>) context
        .get(ODPConvertConstants.CONTEXT_CSS_AUTOMATIC_STYLE);
    Map<String, Map<String, String>> contentStyles = (Map<String, Map<String, String>>) context
        .get(ODPConvertConstants.CONTEXT_CSS_CONTENT_STYLE);
    Map<String, Map<String, String>> officeStyles = (Map<String, Map<String, String>>) context
        .get(ODPConvertConstants.CONTEXT_CSS_COMMON_STYLE);

    // Scan backwards through the styleList searching for a matching attribute name
    for (int i = style.length - 1; i >= 0; --i)
    {
      String styleName = CSSConvertUtil.getStyleName(style[i]);
      Map<String, String> styleMap = autoStyles.get(styleName);
      done = checkStyleForGroupedAttribute(context, styleMap, attributeGroup, values, false);
      if (done)
      {
        return convertValuesToString(attributeGroup, values, valuesOnly, true); // We can return because all values are set
      }

      if (contentStyles != null)
      {
        styleMap = contentStyles.get(styleName);
        done = checkStyleForGroupedAttribute(context, styleMap, attributeGroup, values, false);
        if (done)
        {
          return convertValuesToString(attributeGroup, values, valuesOnly, true); // We can return because all values are set
        }
      }

      if (officeStyles != null)
      {
        styleMap = officeStyles.get(styleName);
        done = checkStyleForGroupedAttribute(context, styleMap, attributeGroup, values, true);
        if (done)
        {
          return convertValuesToString(attributeGroup, values, valuesOnly, true); // We can return because all values are set
        }
      }
    }

    return convertValuesToString(attributeGroup, values, valuesOnly, false);
  }

  /**
   * adjust margins and padding depending on what is input. The caller will provided the adjustments for either margin or padding.
   * 
   * @param htmlElement
   *          element modified
   * @param adjustments
   *          space seperated string of adjustment percentages
   */
  public static void handleMarginAndPaddingAdjustment(Element htmlElement, String adjustments)
  {
    String[] marginAdjustments = adjustments.split(ODPConvertConstants.SYMBOL_WHITESPACE);
    double top = Measure.extractNumber(marginAdjustments[0]);
    double right = Measure.extractNumber(marginAdjustments[1]);
    double bottom = Measure.extractNumber(marginAdjustments[2]);
    double left = Measure.extractNumber(marginAdjustments[3]);

    // We have to do two things.
    // 1) Set the padding and
    // 2) Adjust the size accordingly
    HashMap<String, String> inlineStyleMap = getInLineStyleMap(htmlElement);
    if (0.0 != top)
      inlineStyleMap.put(ODPConvertConstants.HTML_ATTR_PADDING_TOP, marginAdjustments[0]);
    if (0.0 != right)
      inlineStyleMap.put(ODPConvertConstants.HTML_ATTR_PADDING_RIGHT, marginAdjustments[1]);
    if (0.0 != bottom)
      inlineStyleMap.put(ODPConvertConstants.HTML_ATTR_PADDING_BOTTOM, marginAdjustments[2]);
    if (0.0 != left)
      inlineStyleMap.put(ODPConvertConstants.HTML_ATTR_PADDING_LEFT, marginAdjustments[3]);

    double height = 100;
    if (null != inlineStyleMap.get(ODPConvertConstants.ALIGNMENT_HEIGHT))
    {
      height = Measure.extractNumber(inlineStyleMap.get(ODPConvertConstants.ALIGNMENT_HEIGHT));
    }
    height = height - top - bottom;
    inlineStyleMap.put(ODPConvertConstants.ALIGNMENT_HEIGHT, Double.toString(height) + ODPConvertConstants.SYMBOL_PERCENT);

    double width = 100;
    if (null != inlineStyleMap.get(ODPConvertConstants.ALIGNMENT_WIDTH))
    {
      width = Measure.extractNumber(inlineStyleMap.get(ODPConvertConstants.ALIGNMENT_WIDTH));
    }
    width = width - right - left;
    inlineStyleMap.put(ODPConvertConstants.ALIGNMENT_WIDTH, Double.toString(width) + ODPConvertConstants.SYMBOL_PERCENT);

    String style = getStyleString(inlineStyleMap);
    htmlElement.setAttribute(ODPConvertConstants.HTML_ATTR_STYLE, style);
  }

  /**
   * returns a hashmap of the inline style and the styles settings
   * 
   * @param drawFrameHtml
   *          html element from which to return inline style
   */
  private static HashMap<String, String> getInLineStyleMap(Element drawFrameHtml)
  {
    String styleInfo = drawFrameHtml.getAttribute(ODPConvertConstants.HTML_ATTR_STYLE);
    String[] styles = styleInfo.split(ODPConvertConstants.SYMBOL_SEMICOLON);
    HashMap<String, String> styleInfoMap = new HashMap<String, String>();
    for (int i = 0; i < styles.length; i++)
    {
      String[] attr = styles[i].split(ODPConvertConstants.SYMBOL_COLON);
      styleInfoMap.put(attr[0].trim(), attr[1].trim());
    }
    return styleInfoMap;
  }

  /**
   * returns an html style formatted string
   * 
   * @param styleInfoMap
   *          map from which setting are retrieved
   */
  private static String getStyleString(HashMap<String, String> styleInfoMap)
  {
    String newStyle = "";
    Iterator<Map.Entry<String, String>> entries = styleInfoMap.entrySet().iterator();
    while (entries.hasNext())
    {
      Map.Entry<String, String> entry = entries.next();
      newStyle += entry.getKey() + ODPConvertConstants.SYMBOL_COLON + entry.getValue() + ODPConvertConstants.SYMBOL_SEMICOLON;
    }
    return newStyle;
  }

  /**
   * Helper method for getGroupedInlineStyle - Checks the StyleMap for attributes matching the Style Group and updates the appropriate
   * value.
   * 
   * @param context
   *          - the current ConversionContext
   * @param styleMap
   *          - the Style Map to search
   * @param attributeGroup
   *          - the name of the attribute group to search for
   * @param values
   *          - String array containing the attribute values for the Grouped Attribute
   * @param valuePageWidthBased
   *          - Value is based on the page width, not object width and needs to be adjusted (e.g. Office Styles)
   * @return boolean - true if all values are now set, false if not all values are set
   */
  private static boolean checkStyleForGroupedAttribute(ConversionContext context, Map<String, String> styleMap, String attributeGroup,
      String[] values, boolean valuePageWidthBased)
  {
    if (styleMap != null)
    {
      int valuesSet = 0;
      for (int i = 0; i < ALL_DIMENSIONS; i++)
      {
        if (values[i] != null)
        {
          valuesSet++;
        }
      }
      Iterator<String> styleKeys = styleMap.keySet().iterator();
      while (styleKeys.hasNext())
      {
        String key = styleKeys.next();
        Side keySide = Side.getEnumFromString(attributeGroup, key);
        if (keySide != null)
        {
          // Figure out which one and set it if is hasn't been set before
          int index = keySide.ordinal();
          if (index != ALL_DIMENSIONS)
          {
            if (values[index] == null)
            {
              values[index] = styleMap.get(key);

              // If the value is based on the Page Width, we need to adjust it based on the Object width (no need to adjust 0% though_
              if (valuePageWidthBased)
              {
                String width = values[index].substring(0, values[index].length() - 1);
                double widthValue = Double.parseDouble(width);
                if (widthValue != 0.0)
                {
                  // If the parent has a width, we need to adjust the percentage based on the page size. If there is no parent width, it is
                  // a line or connector and we want to leave the current percentage as is.
                  String objectWidth = (String) context.get(ODPConvertConstants.CONTEXT_PARENT_WIDTH);
                  if (objectWidth != null)
                  {
                    double objectWidthValue = Measure.extractNumber(objectWidth);
                    String pageWidth = (String) context.get(ODFConstants.CONTEXT_PAGE_WIDTH);
                    double pageWidthValue = Measure.extractNumber(pageWidth);
                    double newWidthValue = widthValue * pageWidthValue / objectWidthValue;
                    values[index] = Double.toString(newWidthValue) + "%";
                  }
                }
              }

              valuesSet++;
              if (valuesSet == ALL_DIMENSIONS)
              {
                return true; // All values are now set
              }
            }
          }
          else
          {
            // Handle the short-hand form
            values = updateValuesBasedOnShortHandForm(styleMap.get(key), values);
            return true; // All values are now set
          }
        }
      }
    }
    return false; // Not all values are set yet
  }

  /**
   * Helper method for getGroupedInlineStyle - Converts the values array to an appropriate inline style string
   * 
   * @param attributeGroup
   *          - the name of the attribute group to search for
   * @param values
   *          - String array containing the attribute values for the Grouped Attribute
   * @param allSet
   *          - Indicator of whether all values are set
   * @param valuesOnly
   *          - if true, the values for all dimensions will be returned. If false, the values will be returned in inline style form.
   * @return String Inline style string or space separated values (based on valuesOnly) representing the grouped attribute
   */
  private static String convertValuesToString(String attributeGroup, String[] values, boolean valuesOnly, boolean allSet)
  {
    StringBuilder buffer = new StringBuilder(32);

    // Check if values only are to be returned (otherwise an inline style string will be returned)
    if (valuesOnly)
    {
      for (int i = 0; i < values.length; i++)
      {
        String value = values[i];
        if (value == null)
        {
          value = "0%";
        }
        buffer.append(value);
        buffer.append(ODPConvertConstants.SYMBOL_WHITESPACE);
      }
    }

    // If no values are set, there is no need to generate a CSS String
    else if (!allSet)
    {
      for (int i = 0; i < values.length; i++)
      {
        String value = values[i];
        if (value != null)
        {
          buffer.append(Side.getCssStyle(attributeGroup, i));
          buffer.append(ODPConvertConstants.SYMBOL_COLON);
          buffer.append(value);
          buffer.append(ODPConvertConstants.SYMBOL_SEMICOLON);
        }
      }
    }

    // All Values are set, so use the shorthand form
    else
    {
      buffer.append(attributeGroup);
      buffer.append(ODPConvertConstants.SYMBOL_COLON);

      for (int i = 0; i < values.length; i++)
      {
        String value = values[i];
        if (value == null)
        {
          value = "0%";
        }
        buffer.append(ODPConvertConstants.SYMBOL_WHITESPACE);
        buffer.append(value);
      }
      buffer.append(ODPConvertConstants.SYMBOL_SEMICOLON);
    }

    return buffer.toString();
  }

  /**
   * Helper method for getGroupedInlineStyle - Updates all the grouped attribute values based on the shorthand format
   * 
   * @param attributeGroup
   *          - the name of the attribute group to search for
   * @param values
   *          - String array containing the attribute values for the Grouped Attribute
   * @return String[] The updated values string
   */
  private static String[] updateValuesBasedOnShortHandForm(String attributeValue, String[] values)
  {

    String[] cssValues = attributeValue.split("\\s+"); // Split the CSS Values with whitespace

    switch (cssValues.length)
      {
        case 1 : // With 1 value, all 4 dimensions get the same value
          setDimensionsIfNotNull(values, new String[] { cssValues[0], cssValues[0], cssValues[0], cssValues[0] });
          break;
        case 2 : // With 2 values, Top/Bottom get the same value and Right/Left get the same value
          setDimensionsIfNotNull(values, new String[] { cssValues[0], cssValues[1], cssValues[0], cssValues[1] });
          break;
        case 3 : // With 3 values, Top and Bottom each get their own value and Right/Left get the same value
          setDimensionsIfNotNull(values, new String[] { cssValues[0], cssValues[1], cssValues[2], cssValues[1] });
          break;
        case 4 : // With 4 values, all dimensions get their own value
          setDimensionsIfNotNull(values, new String[] { cssValues[0], cssValues[1], cssValues[2], cssValues[3] });
          break;
      }

    return values;
  }

  /**
   * Helper method for getGroupedInlineStyle - Sets the grouped attribute values if they are not null
   * 
   * @param values
   *          - String array containing the attribute values for the Grouped Attribute
   * @param NewValues
   *          - String array containing the new attribute values for the Grouped Attribute
   * @return void
   */
  private static void setDimensionsIfNotNull(String[] values, String[] newValues)
  {
    for (int i = 0; i < values.length; i++)
    {
      if (newValues[i] != null)
      {
        values[i] = newValues[i];
      }
    }
  }

  // ===============================================================================
  // Enumeration to represent the 4 sides of a box as used by margins, padding, etc.
  // ===============================================================================
  public static final int ALL_DIMENSIONS = 4;

  private static enum Side {
    TOP, RIGHT, BOTTOM, LEFT, ALL;

    public static Side getEnumFromString(String attributeGroup, String str)
    {
      if (str != null)
      {
        try
        {
          if (str.equals(attributeGroup))
          {
            return valueOf("ALL");
          }
          else if (str.startsWith(attributeGroup))
          {
            int index = str.indexOf(ODPConvertConstants.SYMBOL_DASH) + 1;
            str = str.substring(index).toUpperCase();
            return valueOf(str);
          }
        }
        catch (Exception ex)
        {
          return null;
        }
      }
      return null;
    }

    public static String getCssStyle(String attributeGroup, int ordinal)
    {
      String cssStyle = attributeGroup + ODPConvertConstants.SYMBOL_DASH;
      switch (ordinal)
        {
          case 0 :
            return cssStyle + ODPConvertConstants.ALIGNMENT_TOP;
          case 1 :
            return cssStyle + ODPConvertConstants.ALIGNMENT_RIGHT;
          case 2 :
            return cssStyle + ODPConvertConstants.ALIGNMENT_BOTTOM;
          case 3 :
            return cssStyle + ODPConvertConstants.ALIGNMENT_LEFT;
        }
      return "";
    }
  }

  /**
   * Returns a CSS style map from the context for a given CSS class name. Null is returned if no value can be found.
   * 
   * @param context
   *          - the conversion context
   * @param styleName
   *          - the style name to get the map for, the name must not be prefixed by a dot
   * @return the CSS style map, or null if none can be found
   */
  @SuppressWarnings("unchecked")
  public static Map<String, String> getContextCSSClassStyleMap(ConversionContext context, String styleName)
  {
    String cssStyleName = CSSConvertUtil.getStyleName(styleName);

    String[] contextCssStyles = { ODPConvertConstants.CONTEXT_CSS_AUTOMATIC_STYLE, ODPConvertConstants.CONTEXT_CSS_CONTENT_STYLE,
        ODPConvertConstants.CONTEXT_CSS_COMMON_STYLE };
    Boolean found = false;
    Map<String, Map<String, String>> cssStyles = null;
    for (String contextCssStyle : contextCssStyles)
    {
      cssStyles = (Map<String, Map<String, String>>) context.get(contextCssStyle);
      if (cssStyles == null)
      {
        continue;
      }
      if (!cssStyles.containsKey(cssStyleName))
      {
        continue;
      }
      found = true;
      break;
    }
    if (!found)
    {
      return null;
    }

    Map<String, String> cssStyle = (Map<String, String>) cssStyles.get(cssStyleName);

    return cssStyle;
  }

  /*
   * Build the css style name for an LI, UL, or OL
   * 
   * @param nodeName - name of node; li, ul or ol
   * 
   * @param styleName - list style name in the format ".I-lst-Lxx_ww-ww " (preceding period, with blank at end)
   * 
   * @param listLevel - level of the list (e.g. 2)
   * 
   * @return String - css style name to create. For example, a level-2 list item would be: "li li.li-I-lst-L23-24-999"
   */
  public static String buildCssListStyleName(String nodeName, String styleName, int listLevel)
  {

    StringBuilder styleNameBuf = new StringBuilder(128);
    /*for (int i = 0; i < listLevel - 1; i++)
    {
      styleNameBuf.append(ODPConvertConstants.HTML_ELEMENT_LI);
      styleNameBuf.append(ODPConvertConstants.SYMBOL_WHITESPACE);
    }*/
    //styleNameBuf.append(nodeName);
    styleName = styleName.trim();
    styleNameBuf.append(styleName);
    styleNameBuf.append("_level"+listLevel);

    return styleNameBuf.toString();

  }

  /**
   * 
   * @param drawFrame
   *          checks to see if the current element is a background object
   * @return true if the attribute "backgroundobjects" is set
   */
  public static boolean isBackgroundObject(Element drawFrame)
  {
    if (drawFrame.getAttribute(ODPConvertConstants.HTML_ATTR_DRAW_LAYER).equals(ODPConvertConstants.HTML_VALUE_BACKGROUND))
      return true;
    return false;
  }

  /**
   * 
   * @param styles
   *          set on drawFrameElement
   * @return width setting if found, 0.0 otherwise
   */
  public static double getDrawFrameWidth(String styles)
  {
    String[] style = styles.split(ODPConvertConstants.SYMBOL_SEMICOLON);
    for (int i = 0; i < style.length; i++)
    {
      if (style[i].startsWith(ODPConvertConstants.ALIGNMENT_WIDTH + ODPConvertConstants.SYMBOL_COLON))
      {
        return Measure.extractNumber(style[i].substring((ODPConvertConstants.ALIGNMENT_WIDTH + ODPConvertConstants.SYMBOL_COLON).length()));
      }
    }
    return 0.0;
  }

  /**
   * 
   * @param drawFrame
   *          - draw frame element of element being processed
   * @param currentSettings
   *          - current value margin/padding
   * @return adjusted values for margin/padding
   */
  public static String applyMasterStyleMarginAndPadding(Element drawFrame, String currentSettings)
  {
    String[] values = currentSettings.split(ODPConvertConstants.SYMBOL_WHITESPACE);
    double top = Measure.extractNumber(values[0]) / 100;
    double right = Measure.extractNumber(values[1]) / 100;
    double bottom = Measure.extractNumber(values[2]) / 100;
    double left = Measure.extractNumber(values[3]) / 100;

    String style = drawFrame.getAttribute(ODPConvertConstants.HTML_ATTR_STYLE);
    double width = CSSConvertUtil.getDrawFrameWidth(style) / 100;

    // Calculate the new top and bottom. NOTE: Margin and padding use width for adjustment, seems to me it should be height.
    double newTop = top / width * 100;
    double newBottom = bottom / width * 100;

    double newRight = right / width * 100;
    double newLeft = left / width * 100;

    StringBuilder adjustment = new StringBuilder(128);
    adjustment.append(Double.toString(newTop) + ODPConvertConstants.SYMBOL_PERCENT + ODPConvertConstants.SYMBOL_WHITESPACE);
    adjustment.append(Double.toString(newRight) + ODPConvertConstants.SYMBOL_PERCENT + ODPConvertConstants.SYMBOL_WHITESPACE);
    adjustment.append(Double.toString(newBottom) + ODPConvertConstants.SYMBOL_PERCENT + ODPConvertConstants.SYMBOL_WHITESPACE);
    adjustment.append(Double.toString(newLeft) + ODPConvertConstants.SYMBOL_PERCENT);

    return adjustment.toString();
  }

  public final static String convertContainerWidthToStyleFormat(ConversionContext context)
  {
    // find container width to append to style name - change format from "24.99cm" to "24-99"
    String containerWidth = ODPConvertUtil.getContainerWidth(context);
    int index = containerWidth.indexOf("cm");
    if (index >= 0)
    {
      containerWidth = containerWidth.substring(0, index);
    }
    else
    {
      // Handle the case where the container width is in inches
      Measure nonCmMeasure = Measure.parseNumber(containerWidth);
      nonCmMeasure.convertINToCM();
      containerWidth = Double.toString(nonCmMeasure.getNumber());
    }
    containerWidth = containerWidth.replace(".", "-");

    return containerWidth;
  }
  
  public static String getHtmlFontFamily(ConversionContext context, OdfStyleTextProperties style)
  {
    String fontName = style.getFoFontFamilyAttribute();
    if (fontName == null || fontName.length() == 0)
    {
      return "";
    }

    StringBuilder fontBuf = new StringBuilder();
    String fontNameAsian = style.getStyleFontFamilyAsianAttribute();
    String fontNameComplex = style.getStyleFontFamilyComplexAttribute();

    String locale = (String) context.get("locale");
    if (!ConvertUtil.CJKLocale.contains(locale)) // Order: font, asian font, complex font
    {
      if (fontName != null && fontName.length() > 0)
      {
        fontBuf.append(fontName);
        fontBuf.append(',');
      }
      if (fontNameAsian != null && fontNameAsian.length() > 0)
      {
        fontBuf.append(fontNameAsian);
        fontBuf.append(',');
      }
    }
    else // Asian Order: asian font, font, complex
    {
      if (fontNameAsian != null && fontNameAsian.length() > 0)
      {
        fontBuf.append(fontNameAsian);
        fontBuf.append(',');
      }

      if (fontName != null && fontName.length() > 0)
      {
        fontBuf.append(fontName);
        fontBuf.append(',');
      }
    }
    if (fontNameComplex != null && fontNameComplex.length() > 0)
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
}
