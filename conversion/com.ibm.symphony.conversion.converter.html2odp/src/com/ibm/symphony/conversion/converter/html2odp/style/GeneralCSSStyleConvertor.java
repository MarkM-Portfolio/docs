/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.html2odp.style;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;
import java.util.StringTokenizer;
import java.util.Map.Entry;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.odftoolkit.odfdom.OdfElement;
import org.odftoolkit.odfdom.OdfFileDom;
import org.odftoolkit.odfdom.doc.office.OdfOfficeAutomaticStyles;
import org.odftoolkit.odfdom.doc.style.OdfStyle;
import org.odftoolkit.odfdom.doc.style.OdfStyleGraphicProperties;
import org.odftoolkit.odfdom.doc.style.OdfStyleTextProperties;
import org.odftoolkit.odfdom.doc.text.OdfTextLineBreak;
import org.odftoolkit.odfdom.doc.text.OdfTextList;
import org.odftoolkit.odfdom.doc.text.OdfTextListHeader;
import org.odftoolkit.odfdom.doc.text.OdfTextListItem;
import org.odftoolkit.odfdom.dom.element.OdfStylableElement;
import org.odftoolkit.odfdom.dom.element.OdfStylePropertiesBase;
import org.odftoolkit.odfdom.dom.style.OdfStyleFamily;
import org.odftoolkit.odfdom.dom.style.props.OdfStylePropertiesSet;
import org.w3c.dom.Element;
import org.w3c.dom.NamedNodeMap;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

import com.ibm.symphony.conversion.converter.html2odp.content.ODFConvertorUtil;
import com.ibm.symphony.conversion.converter.html2odp.styleattr.PropertyConvertor;
import com.ibm.symphony.conversion.converter.html2odp.styleattr.PropertyConvertorFactory;
import com.ibm.symphony.conversion.converter.html2odp.util.ContentConvertUtil;
import com.ibm.symphony.conversion.converter.html2odp.util.StyleHashKey;
import com.ibm.symphony.conversion.presentation.ODPCommonUtil;
import com.ibm.symphony.conversion.presentation.ODPConvertConstants;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.ConvertUtil;
import com.ibm.symphony.conversion.service.common.HtmlCSSConstants;

public class GeneralCSSStyleConvertor implements CSSStyleConvertor
{
  private static final String CLASS = GeneralCSSStyleConvertor.class.getName();

  private static final Logger log = Logger.getLogger(CLASS);

  static final Pattern p = Pattern.compile("(.*)(_[0-9]+_CDUP).*");

  public void convertStyle(ConversionContext context, Element htmlElement, OdfElement odfElement, String styleName, String styleString)
  {
    OdfFileDom contentDom = (OdfFileDom) context.get("target");
    Map<String, String> styleMap = getCSSMap(context, contentDom, htmlElement, getStyleFamily(), styleString, styleName);
    convertStyle(context, htmlElement, odfElement, styleName, styleMap);
  }

  /**
   * Return the ODFStyleFamily for this convert. Default is OdfStyleFamily.Text. Override in the subclasses as needed.
   * 
   * @return OdfStyleFamily
   */
  protected OdfStyleFamily getStyleFamily()
  {
    return OdfStyleFamily.Text;
  }

  /**
   * Adds any default style values to the Style Type. Default adds nothing. Override in the subclasses as needed.
   * 
   * @param context
   *          Conversion context
   * @param styleMap
   *          Maps of HTML style values
   */
  protected void addDefaultValues(ConversionContext context, Map<String, String> styleMap)
  {
    // Default adds nothing
  }

  @SuppressWarnings("restriction")
  public void convertStyle(ConversionContext context, Element htmlElement, OdfElement odfElement, String styleName,
      Map<String, String> styleMap)
  {
    OdfFileDom contentDom = (OdfFileDom) context.get("target");

    try
    {
      addDefaultValues(context, styleMap); // Add any default style values to the style map if they are not defined.

      // If the element isn't stylable, this would throw a ClassCastException.
      // Prevent calling this code in that situation and log a message
      // TODO: Should this be handled elsewhere?
      if (odfElement instanceof OdfTextList || odfElement instanceof OdfTextListHeader || odfElement instanceof OdfTextLineBreak
          || odfElement instanceof OdfTextListItem)
      {
        if (log.isLoggable(Level.FINE))
        {
          log.fine("Element " + odfElement.getClass() + " is not stylable");
        }
        return;
      }

      OdfStylableElement stylable = (OdfStylableElement) odfElement;
      OdfOfficeAutomaticStyles autoStyles = contentDom.getAutomaticStyles();
      String origOldStyleName = styleName;
      // If the style is a CDUP, it will not exist in the ODF style map. Use the original style as the old style name
      if (styleName != null)
      {
        Matcher m = p.matcher(styleName);
        if ((m.matches()))
          styleName = m.group(1);
      }

      OdfStyle oldStyle = CSSUtil.getOldStyle(contentDom.getOdfDocument(), styleName, getStyleFamily());
      OdfStyle newStyle = parseStyle(context, contentDom, htmlElement, getStyleName(stylable, origOldStyleName), styleMap,
          getStyleFamily(), oldStyle);

      // Filter out the color property if the color is equal to the automatic color. This
      // color value was added during import and is artificial. However, if the color is
      // different, it means the editor changed it so don't remove it. Same filtering logic
      // applies to the "cell text color" which is the text color pushed from the parent
      // cell element.
      // Check is here so that
      // the following can be asserted :
      // - RGB values have been converted to hex
      // - new style exists even if old style didn't i.e. new inline style info.
      if (newStyle != null)
      {
        if (newStyle.hasProperty(OdfStyleTextProperties.Color))
        {
          String prop = newStyle.getProperty(OdfStyleTextProperties.Color);
          String autoColor = htmlElement.getAttribute(ODPConvertConstants.HTML_ATTR_AUTO_COLOR), cellColor = htmlElement
              .getAttribute(ODPConvertConstants.HTML_ATTR_CELL_COLOR);

          String lvalue = cellColor;
          if (lvalue == null || lvalue.length() == 0)
          {
            lvalue = autoColor;
          }

          if (lvalue != null && prop != null && lvalue.trim().equalsIgnoreCase(prop.trim()))
          {
            newStyle.removeProperty(OdfStyleTextProperties.Color);
          }
        }
      }

      // check to see if the html element has the pseudo background color. If so, the draw:fill will
      // probably be wrong so we want to remove it so it gets put in from the old style. The bg color
      // (i.e. pseudo bg color) is only set for unsupported background types - when we export, need
      // to restore the original bg so we need to remove the draw:fill and draw:fill-color.

      if (newStyle != null && oldStyle != null && htmlElement != null)
      {
        String pcolor = htmlElement.getAttribute(ODPConvertConstants.HTML_ATTR_PSEUDO_BG_COLOR);
        if (pcolor != null && pcolor.length() > 0)
        {
          // only remove the draw fill if we know the old one has a value. Now check to make sure
          // the bg color didn't change. If it did then leave the draw fill.
          String fillcolor = newStyle.getProperty(OdfStyleGraphicProperties.FillColor);
          if (fillcolor != null && fillcolor.length() > 0)
          {
            if (fillcolor.trim().equalsIgnoreCase(pcolor.trim()))
            {
              if (oldStyle.hasProperty(OdfStyleGraphicProperties.Fill))
              {
                newStyle.removeProperty(OdfStyleGraphicProperties.Fill);
              }
              if (oldStyle.hasProperty(OdfStyleGraphicProperties.FillColor))
              {
                newStyle.removeProperty(OdfStyleGraphicProperties.FillColor);
              }
            }
          }
        }
      }

      GeneralCSSStyleConvertor.resolveFontProperties(newStyle, oldStyle);
      updateFontSizeInNewStyle(context, newStyle, oldStyle, htmlElement);

      ODFConvertorUtil.copyPreservedProperties(newStyle, oldStyle);

      // For table cells, need to ensure the graphic properties are pulled over if
      // they are not already defined. Attributes are processed before this is called
      // so do not overwrite any of those values.
      if (getStyleFamily().getName().equals(ODPConvertConstants.ODF_ELEMENT_TABLE_CELL))
      {
        if (oldStyle != null)
        {
          OdfStylePropertiesBase newGraphics = newStyle.getPropertiesElement(OdfStylePropertiesSet.GraphicProperties);

          // If graphic properties have not been applied and old styles exist
          if (newGraphics == null && oldStyle != null)
          {
            OdfStylePropertiesBase oldGraphics = oldStyle.getPropertiesElement(OdfStylePropertiesSet.GraphicProperties);
            if (oldGraphics != null)
            {
              // Need to clone. Appending the oldGraphics will remove it from the original style.
              OdfStylePropertiesBase clonedGraphics = (OdfStylePropertiesBase) oldGraphics.cloneNode(true);
              newStyle.appendChild(clonedGraphics);
            }
          }
        }
        else
        {
          // mich - defect 3695, copy/pasted tables cause oldStyle to be null at this point, but we still need to pull over the
          // graphic, paragraph, and text properties from the original style, using the htmlElement to make our way back to this
          // original style; a distinct variable (pullOverStyle) is used so oldStyle remains the same and the rest of the code is
          // not affected

          // finds the first css class that leads to an odf style
          String[] classes = htmlElement.getAttribute(ODPConvertConstants.HTML_ATTR_CLASS).split(ODPConvertConstants.SYMBOL_WHITESPACE);
          OdfStyle pullOverStyle = null;
          for (String className : classes)
          {
            pullOverStyle = CSSUtil.getOldStyle(contentDom.getOdfDocument(), className, getStyleFamily());
            if (pullOverStyle != null)
            {
              break;
            }
          }

          // if a style was found, use its properties to update any missing ones in newStyle
          if (pullOverStyle != null)
          {
            ODFConvertorUtil.copyPreservedProperties(newStyle, pullOverStyle);
          }
        }
      }

      // check to see if the new style is empty
      if (newStyle != null)
      {
        if (isStyleEmpty(newStyle))
        {
          // the style is empty! just return
          return;
        }
      }

      // Call updateStyle which may be overloaded by a child class to handle the style correctly
      updateStyle(context, styleName, newStyle, oldStyle, stylable, autoStyles);
    }
    catch (Exception e)
    {
      String message = ODPCommonUtil.createMessage(ODPCommonUtil.LOG_UNEXPECTED_EXCEPTION_IN, CLASS + ".convertStyle");
      ODPCommonUtil.logException(context, Level.WARNING, message, e);
    }
  }

  /**
   * adds the new style to the hashmaps so we can check to see if it is a duplicate
   */
  @SuppressWarnings({ "unchecked", "restriction" })
  public static void addNewStyleToHashMaps(ConversionContext context, OdfStyle newStyle)
  {
    NamedNodeMap attrs = newStyle.getAttributes();
    String newStyleName = attrs.getNamedItem(ODPConvertConstants.ODF_ATTR_STYLE_NAME).getNodeValue();
    String flattenedAttrs = StyleHashKey.flattenAttributes(newStyle);
    if (flattenedAttrs == null)
      return;
    // Generate a "unique" hashkey for the style. The map is keyed by the hashKey and the value is
    // an array list of styles. If the hash is unique the array list will have a length of one, but
    // in case we have a collision, we allow for that.
    StyleHashKey hash = StyleHashKey.generateKey(flattenedAttrs);
    Map<StyleHashKey, ArrayList<String>> styleHashMap = (Map<StyleHashKey, ArrayList<String>>) context
        .get(ODPConvertConstants.CONTEXT_STYLES_HASHMAP);
    Map<String, OdfElement> styleMap = (Map<String, OdfElement>) context.get(ODPConvertConstants.CONTEXT_ODP_STYLES_MAP);
    ArrayList<String> styles = styleHashMap.get(hash);
    // Unique hash, create a new arrayList
    if (styles == null || styles.size() == 0)
    {
      styles = new ArrayList<String>();
    }
    // Add the style to the list
    styles.add(newStyleName);
    styleHashMap.put(hash, styles);
    styleMap.put(newStyleName, newStyle);
  }

  @SuppressWarnings({ "unchecked" })
  /**
   * Returns an existing style if match found in stylesHashMap
   */
  protected OdfStyle getExistingStyle(ConversionContext context, OdfStyle newStyle)
  {
    String flattenedAttrs = StyleHashKey.flattenAttributes(newStyle);
    if (flattenedAttrs == null)
      return null;
    StyleHashKey hash = StyleHashKey.generateKey(flattenedAttrs);
    Map<StyleHashKey, ArrayList<String>> styleHashMap = (Map<StyleHashKey, ArrayList<String>>) context
        .get(ODPConvertConstants.CONTEXT_STYLES_HASHMAP);
    Map<String, OdfElement> styleMap = (Map<String, OdfElement>) context.get(ODPConvertConstants.CONTEXT_ODP_STYLES_MAP);
    ArrayList<String> styles = styleHashMap.get(hash);
    if (styles == null)
      return null;

    // now find a matching style name from our hash map, the style name must match the first 1 (or 2 chars
    // for master styles) so we get the same style type
    String newStyleName = newStyle.getStyleNameAttribute();
    int prefixLen = newStyleName.startsWith("M") ? 2 : 1; // when this is a master style, we need to use 2 chars to match the style type
                                                          // (e.g MP13)

    // find a matching style map
    for (int i = 0; i < styles.size(); i++)
    {
      String styleName = styles.get(i);
      // make sure our style name prefixes match. For example, make sure a "P13_123" matches a "P21" and not a "T21" or "MP13"
      // because we can't reference a style from "styles.xml" when we're in "content.xml"
      if (styleName.length() >= prefixLen && newStyleName.length() >= prefixLen
          && styleName.substring(0, prefixLen).equals(newStyleName.substring(0, prefixLen)))
      {
        OdfStyle style = (OdfStyle) styleMap.get(styleName);
        if (newStyle.equals(style))
          return style;
      }
    }
    return null;
  }

  protected boolean useDefaultValue(String key, String value)
  {
//    if(key.equals(ODPConvertConstants.CSS_FONT_SIZE))
//      return true;
    
    return false;
  }

  protected void setDefaultStyle(OdfStylableElement stylable)
  {
    stylable.setStyleName(ODPConvertConstants.DEFAULT_TEXT_STYLE);
  }

  protected String getStyleName(OdfStylableElement stylable, String styleName)
  {
    return styleName;
  }

  /*
   * protected OdfStyle parseStyle(ConversionContext context, OdfFileDom odfDoc, Node htmlElement, String styleName, String htmlStyle,
   * OdfStyleFamily odfStyleFamily) { OdfStyle style = new OdfStyle(odfDoc); style.setStyleFamilyAttribute(odfStyleFamily.getName());
   * style.setStyleNameAttribute(CSSUtil.getStyleName(odfStyleFamily, styleName)); Map<String, String> cssMap =
   * CSSUtil.buildCSSMap(htmlStyle); Iterator<Entry<String, String>> it = cssMap.entrySet().iterator(); while (it.hasNext()) { Entry<String,
   * String> entry = it.next(); if (useDefaultValue(entry.getKey(), entry.getValue())) continue; PropertyConvertor convertor =
   * PropertyConvertorFactory.getInstance().getConvertor(entry.getKey()); convertor.convert(context, style, cssMap, entry.getKey(),
   * entry.getValue()); } return style; }
   */

  protected OdfStyle parseStyle(ConversionContext context, OdfFileDom odfDoc, Element htmlElement, String styleName,
      Map<String, String> CSSMap, OdfStyleFamily odfStyleFamily, OdfStyle oldStyle)
  {
    OdfStyle style = new OdfStyle(odfDoc);
    style.setStyleFamilyAttribute(odfStyleFamily.getName());
    style.setStyleNameAttribute(CSSUtil.getStyleName(odfStyleFamily, styleName));

    Map<String, String> styleMap = CSSMap;
    
    String pfontSize = styleMap.get("font-size");
    if(pfontSize != null && !pfontSize.isEmpty() && pfontSize.endsWith("em")) {
    	pfontSize = pfontSize.replaceAll("em", "").trim();
    	Double fpt =  Double.parseDouble(pfontSize) * 18.0;
    	styleMap.put("font-size", fpt + "pt");
    }

    // We need to process vertical-align outside of the loop since when it exists, the font-size is associated
    // with vertical align and we need to process those 2 CSS entries first, remove them, and then process the
    // remaining values in the CSSMap
    String verticalAlign = CSSMap.get(HtmlCSSConstants.VERTICAL_ALIGN);
    if (verticalAlign != null && !"baseline".equals(verticalAlign))
    {
      styleMap = new HashMap<String, String>();
      styleMap.putAll(CSSMap);
      PropertyConvertor convertor = PropertyConvertorFactory.getInstance().getConvertor(HtmlCSSConstants.VERTICAL_ALIGN);
      if (context != null)
      {
        context.put(ODPConvertConstants.CONTEXT_OLD_STYLE_PARAM, oldStyle);
      }
      convertor.convert(context, style, styleMap, HtmlCSSConstants.VERTICAL_ALIGN, verticalAlign);
      if (context != null)
      {
        context.remove(ODPConvertConstants.CONTEXT_OLD_STYLE_PARAM);
      }

      styleMap.remove(HtmlCSSConstants.VERTICAL_ALIGN);
      styleMap.remove(HtmlCSSConstants.FONT_SIZE);
    }
    //for list spans, direction should be null if list originates from import
    //otherwise (in case of concord-created list) it has been already set from list item direction
    String direction = styleMap.get(HtmlCSSConstants.DIRECTION);
    if(direction == null && htmlElement != null && HtmlCSSConstants.P.equals(htmlElement.getNodeName())) {
    	Element parent = (Element)htmlElement.getParentNode();
    	if(HtmlCSSConstants.LI.equals(parent.getNodeName())) {
    		//list item direction takes precedence over 'span' text_p direction (which could be specified
    		//in style rules for paragraph class on import and might be changed afterwards on editing, so
    		//in case of rtl list item, current 'li' direction is what does matter
    		//space between 'direction:' and value assumed to always be present
    		String styleValue = parent.getAttribute(ODPConvertConstants.HTML_ATTR_STYLE);
    		if(styleValue != null) {
    			String dirStyle = HtmlCSSConstants.DIRECTION + 
    								ODPConvertConstants.SYMBOL_COLON + ODPConvertConstants.SYMBOL_WHITESPACE;
    			int index = styleValue.indexOf(dirStyle);
    			if(index != -1) { //shensis
    				direction = styleValue.substring(index + dirStyle.length()).startsWith(HtmlCSSConstants.RTL)
    							? HtmlCSSConstants.RTL : HtmlCSSConstants.LTR;
    				styleMap.put(HtmlCSSConstants.DIRECTION, direction);
    				String textAlign = styleMap.get(HtmlCSSConstants.TEXT_ALIGN);
    				if(textAlign == null || "inherit".equalsIgnoreCase(textAlign)) {
    					styleMap.put(HtmlCSSConstants.TEXT_ALIGN, HtmlCSSConstants.RTL.equalsIgnoreCase(direction)
    							? HtmlCSSConstants.RIGHT : HtmlCSSConstants.LEFT);
    				}
    			}
    		}
    	}
    }

    if (direction != null && HtmlCSSConstants.RTL.equalsIgnoreCase(direction)) {
        String marginRight = styleMap.remove(HtmlCSSConstants.MARGIN_RIGHT);
        if(marginRight != null)
        	styleMap.put(HtmlCSSConstants.MARGIN_LEFT, marginRight);
    }
    
    Iterator<Entry<String, String>> styles = styleMap.entrySet().iterator();
    while (styles.hasNext())
    {
      Entry<String, String> theStyle = styles.next();
      if (theStyle.getKey().equalsIgnoreCase(ODPConvertConstants.HTML_ATTR_MARGIN)){
    	  String[] marginsValue = theStyle.getValue().split(" ");
    	  String[] marginsKey = {ODPConvertConstants.HTML_ATTR_MARGIN_TOP, ODPConvertConstants.HTML_ATTR_MARGIN_RIGHT, 
    			  ODPConvertConstants.HTML_ATTR_MARGIN_BOTTOM, ODPConvertConstants.HTML_ATTR_MARGIN_LEFT};
     	  for(int i = 0; i < marginsValue.length; i++){
    		styleMap.put(marginsKey[i], marginsValue[i]);
    	  }
     	  styleMap.remove(ODPConvertConstants.HTML_ATTR_MARGIN);
    	  break;
      }      
    }

    Iterator<Entry<String, String>> it = styleMap.entrySet().iterator();
    while (it.hasNext())
    {
      Entry<String, String> entry = it.next();
      if (useDefaultValue(entry.getKey(), entry.getValue()))
        continue;

      PropertyConvertor convertor = PropertyConvertorFactory.getInstance().getConvertor(entry.getKey());   
      convertor.convert(context, style, styleMap, entry.getKey(), entry.getValue());
    }
    
    String fontsizeinpts = ContentConvertUtil.getFontSize(context, htmlElement);
    if(htmlElement != null && htmlElement.getLocalName().equalsIgnoreCase("span")
    		&& (fontsizeinpts == null || "".equals(fontsizeinpts))){
      String masterPageName = (String)context.get(ODPConvertConstants.CONTEXT_DRAWFRAME_MASTER_PRES_NAME);
      if(masterPageName ==null || masterPageName.length() == 0){
    	Double parentTextSize = (Double) context.get(ODPConvertConstants.CONTEXT_PARENT_SIZE);
    	if(parentTextSize != null && parentTextSize == 18)
          fontsizeinpts = "18";
    	String fontSize = styleMap.get("font-size");
    	if(fontSize != null && !fontSize.isEmpty()) {
    		fontSize = fontSize.trim().replaceAll("pt", "").trim();
    		fontsizeinpts =  Double.parseDouble(fontSize)+"";
    	}
      }
    }
    if(fontsizeinpts != null && !"".equals(fontsizeinpts))
    {
      PropertyConvertor convertor = PropertyConvertorFactory.getInstance().getConvertor(ODPConvertConstants.CSS_ABS_FONT_SIZE);   
      convertor.convert(context, style, styleMap, ODPConvertConstants.CSS_ABS_FONT_SIZE, fontsizeinpts);
    }
    
    return style;
  }

  protected Map<String, String> getCSSMap(ConversionContext context, OdfFileDom odfDoc, Element htmlElement, OdfStyleFamily odfStyleFamily,
      String htmlStyle)
  {
    Map<String, String> cssMap = ConvertUtil.buildCSSMap(htmlStyle);
    return cssMap;
  }

  /**
   * Check to see if a style node is empty. Will check that attributes other than name and family are set and if there are any non-empty
   * child nodes.
   * 
   * @param newStyle
   * @return true if empty
   */
  public static boolean isStyleEmpty(Node newStyle)
  {
    boolean isempty = true;

    // check to see if the new style is empty
    if (newStyle != null)
    {
      Node xs = (Node) newStyle;
      isempty = !xs.hasAttributes();

      if (!isempty)
      {
        NamedNodeMap nnmap = xs.getAttributes();
        int attlen = nnmap.getLength();
        if (attlen > 0)
          isempty = true;
        for (int ii = 0; ii < attlen; ii++)
        {
          Node attr = nnmap.item(ii);
          String aname = attr.getNodeName();
          if (ODPConvertConstants.ODF_ATTR_STYLE_NAME.equalsIgnoreCase(aname)
              || ODPConvertConstants.ODF_ATTR_STYLE_FAMILY.equalsIgnoreCase(aname))
          {
            // even empty style seem to have a name or family attribute. ignore these.
            continue;
          }
          isempty = false;
          break;
        }
      }

      NodeList clist = xs.getChildNodes();
      if (clist != null && isempty)
      {
        // if there are child nodes, check to see if they're empty.
        for (int ii = 0; ii < clist.getLength(); ii++)
        {
          Node child = clist.item(ii);
          if (child.hasAttributes() || child.hasChildNodes())
          {
            isempty = false;
            break;
          }
        }
      }
    }
    return isempty;
  }

  protected Map<String, String> getCSSMap(ConversionContext context, OdfFileDom odfDoc, Element htmlElement, OdfStyleFamily odfStyleFamily,
      String htmlStyle, String styleName)
  {
    Map<String, String> cssMap = buildCSSMap(context, htmlStyle, odfStyleFamily);
    return cssMap;
  }

  public static Map<String, String> buildCSSMap(ConversionContext context, String htmlStyle, OdfStyleFamily odfStyleFamily)
  {
    Map<String, String> rs = new HashMap<String, String>();

    if (htmlStyle == null)
      return rs;

    StringTokenizer st = new StringTokenizer(htmlStyle, ODPConvertConstants.SYMBOL_SEMICOLON);
    while (st.hasMoreTokens())
    {
      String prop = st.nextToken();
      int index = prop.indexOf(ODPConvertConstants.SYMBOL_COLON);
      if (index < 0 || index == prop.length())
        continue;

      String name = prop.substring(0, index);
      String value = prop.substring(index + 1);
      if (name != null)
      {
        // defect 38783,38738,38699,38533 to lower case is important, used as key in map
        name = name.trim().toLowerCase();
        // Don't put unmodifiable (Concord unmodifiable) resources in the map
        if (name.contains(ODPConvertConstants.HTML_ATTR_PADDING))
          continue;

        // (10692) Margin is not modifiable by the editor, but for <p> elements, we want to export the margin-left we
        // may have added during import for <text:list-header> elements that we converted to <p>
        if (name.contains(ODPConvertConstants.HTML_ATTR_MARGIN) && !odfStyleFamily.equals(OdfStyleFamily.Paragraph))
          continue;

        ODPConvertConstants.DIV_CONTEXT_TYPE dc = (ODPConvertConstants.DIV_CONTEXT_TYPE) context
            .get(ODPConvertConstants.CONTEXT_DIV_CONTEXT);

        // enum types return pointers to static objects, therefore pointer comparison works. If the
        // context value is null this causes no problem. As far as pointer comparison is concerned,
        // null is just another value as long as we don't try to deference the object.

        if (dc == ODPConvertConstants.DIV_CONTEXT_TYPE.SPEAKER_NOTES)
        {
          // None of these attributes should be exported for speaker notes because the editor is just
          // creating static style definitions that have no relation to the original style definitons.
          if (name.equals(ODPConvertConstants.CSS_FONT_SIZE) || name.equals(ODPConvertConstants.CSS_BACKGROUND_COLOR)
              || name.equals(ODPConvertConstants.CSS_BACKGROUND) || name.equals(ODPConvertConstants.CSS_FONT_FAMILY)
              || name.equals(ODPConvertConstants.CSS_FONT_COLOR))
          {
            continue;
          }
        }
      }
      if (value != null)
        value = value.trim();
      rs.put(name, value);
    }
    return rs;
  }

  @SuppressWarnings("restriction")
  protected void updateStyle(ConversionContext context, String styleName, OdfStyle newStyle, OdfStyle oldStyle,
      OdfStylableElement stylable, OdfOfficeAutomaticStyles autoStyles)
  {
    try
    {
      if (newStyle != null && oldStyle != null)
      {
        if (oldStyle.equals(newStyle))
        {
          stylable.setStyleName(oldStyle.getStyleNameAttribute());
          return;
        }
      }
      if (newStyle != null)
      {
        OdfStyle existingStyle = getExistingStyle(context, newStyle);
        if (existingStyle != null)
        {
          stylable.setStyleName(existingStyle.getStyleNameAttribute());
          return;
        }
      }
      if (!newStyle.hasChildNodes())// no pros,use default style
      {
        // setDefaultStyle(stylable); // use parents style
      }
      else
      {
        newStyle.setStyleFamilyAttribute(getStyleFamily().getName());
        newStyle.setStyleNameAttribute(CSSUtil.getStyleName(getStyleFamily(), styleName));
        autoStyles.appendChild(newStyle);
        stylable.setStyleName(newStyle.getStyleNameAttribute());
        addNewStyleToHashMaps(context, newStyle);
      }
    }
    catch (Exception e)
    {
      String message = ODPCommonUtil.createMessage(ODPCommonUtil.LOG_UNEXPECTED_EXCEPTION_IN, CLASS + ".updateStyle");
      ODPCommonUtil.logException(context, Level.WARNING, message, e);
    }
  }

  /**
   * Sync the complex and asian fonts with the new font size. Only need to do this if the old style info had the complex and asian font
   * specified and if their font size was the same as the basic font size.
   * 
   * @param newStyle
   * @param oldStyle
   */
  public static void resolveFontProperties(OdfStyle newStyle, OdfStyle oldStyle)
  {
    if (newStyle == null || oldStyle == null)
      return;

    if (!newStyle.hasProperty(OdfStyleTextProperties.FontSize))
      return;

    if (!oldStyle.hasProperty(OdfStyleTextProperties.FontSize))
      return;

    // getProperty actually returns the parent values and default values
    // therefore it is necessary to do the above checks - must call
    // hasValue to see if the value is there first.

    String newfs = newStyle.getProperty(OdfStyleTextProperties.FontSize);
    if (newfs == null || newfs.length() == 0)
      return;

    String oldfs = oldStyle.getProperty(OdfStyleTextProperties.FontSize);
    if (oldfs == null || oldfs.length() == 0)
      return;

    if (newfs.equals(oldfs))
    {
      // no change, don't bother doing anything
      return;
    }

    // first check to see if the old complex font was specified
    String complexfs = oldStyle.getProperty(OdfStyleTextProperties.FontSizeComplex);
    if (complexfs != null && complexfs.length() > 0 && oldStyle.hasProperty(OdfStyleTextProperties.FontSizeComplex))
    {
      if (oldfs.equals(complexfs))
        newStyle.setProperty(OdfStyleTextProperties.FontSizeComplex, newfs);
    }

    // now check the asian font size
    String asianfs = oldStyle.getProperty(OdfStyleTextProperties.FontSizeAsian);
    if (asianfs != null && asianfs.length() > 0 && oldStyle.hasProperty(OdfStyleTextProperties.FontSizeAsian))
    {
      if (oldfs.equals(asianfs))
        newStyle.setProperty(OdfStyleTextProperties.FontSizeAsian, newfs);
    }
  }
  
  public void updateFontSizeInNewStyle(ConversionContext context, OdfStyle newStyle, OdfStyle oldStyle, Element htmlElement)
  {
    if(htmlElement != null && newStyle!=null && oldStyle!=null && !newStyle.hasProperty(OdfStyleTextProperties.FontSize) && oldStyle.hasProperty(OdfStyleTextProperties.FontSize))
    {
      String pfs = ContentConvertUtil.getFontSize(context, htmlElement);
      if(pfs != null && !"".equals(pfs))
      {
        if(pfs.indexOf(".") != -1)
          pfs = ConvertUtil.parseFontSizeToString(Double.parseDouble(pfs));
        
        newStyle.setProperty(OdfStyleTextProperties.FontSize, pfs+"pt");
        return;
      }
      String classFontsize = ODFConvertorUtil.getFontSizeFromClass(context, htmlElement);
      Double parentTextSize = (Double) context.get(ODPConvertConstants.CONTEXT_PARENT_SIZE);
      if(parentTextSize != null)
      {
        try{
          double fontsize = Double.parseDouble(classFontsize);
          newStyle.setProperty(OdfStyleTextProperties.FontSize, String.valueOf(parentTextSize * fontsize)+"pt");
        }catch(NumberFormatException e)
        {
        }
      }
    }
  }
}
