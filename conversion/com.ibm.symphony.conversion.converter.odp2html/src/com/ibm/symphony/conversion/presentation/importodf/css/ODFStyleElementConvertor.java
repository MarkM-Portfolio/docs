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

import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.regex.Pattern;
import java.util.regex.Matcher;

import org.odftoolkit.odfdom.OdfElement;
import org.odftoolkit.odfdom.doc.style.OdfDefaultStyle;
import org.odftoolkit.odfdom.doc.style.OdfStyle;
import org.odftoolkit.odfdom.doc.style.OdfStyleTableProperties;
import org.odftoolkit.odfdom.doc.style.OdfStyleTextProperties;
import org.odftoolkit.odfdom.dom.element.OdfStyleBase;
import org.odftoolkit.odfdom.dom.element.OdfStylePropertiesBase;
import org.odftoolkit.odfdom.dom.style.OdfStyleFamily;
import org.odftoolkit.odfdom.dom.style.props.OdfStylePropertiesSet;
import org.odftoolkit.odfdom.dom.attribute.fo.FoFontSizeAttribute;

import org.w3c.dom.Element;
import org.w3c.dom.NamedNodeMap;
import org.w3c.dom.Node;

import com.ibm.symphony.conversion.presentation.ODPConvertConstants;
import com.ibm.symphony.conversion.presentation.StackableProperties;
import com.ibm.symphony.conversion.presentation.importodf.cssattr.AttributeConvertorFactory;

import com.ibm.symphony.conversion.service.common.util.Measure;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.ConvertUtil;
import com.ibm.symphony.conversion.service.common.HtmlCSSConstants;
import com.ibm.symphony.conversion.service.common.ODFConstants;
import com.ibm.symphony.conversion.service.common.shape2image.ODPConvertStyleMappingUtil;

public class ODFStyleElementConvertor extends AbstractCSSConvertor
{
  private static final String CLASS = ODFStyleElementConvertor.class.getName();
  
  private static final Logger LOG = Logger.getLogger(CLASS);

  private static final String BORDER_REGEX = ".*(#[a-fA-F0-9]{6})([^\\p{XDigit}]|$).*";

  private static final Pattern BORDER_PATTERN = Pattern.compile(BORDER_REGEX);

  @SuppressWarnings("restriction")
  @Override
  protected void doConvert(ConversionContext context, Node element, Object output)
  {
    @SuppressWarnings("unchecked")
    Map<String, Map<String, String>> styles = (Map<String, Map<String, String>>) output;

    NamedNodeMap attributes = element.getAttributes();
    String rawStyleName = CSSConvertUtil.getRawStyleName(element, context);
    String styleName = CSSConvertUtil.getStyleName(rawStyleName);

    Map<String, String> styleMap = CSSConvertUtil.getStyleMap(styleName, styles);

    // mich - defect 2896, an additional css class is needed here so that text elements can inherit the text properties
    // without any of the other properties, such as graphic and paragraph, defined in a style of the "graphic" family
    Map<String, String> styleMapSplitProperties = null;

    String styleType = element.getNodeName();

    Element parentNode = (Element) element.getParentNode();

    if (null != parentNode && !parentNode.hasAttribute(ODPConvertConstants.ODF_ATTR_PARENT_STYLE_NAME))
    {
      if ((ODPConvertConstants.ODF_ATTR_STYLE_TEXT_PROPERTIES.equals(styleType) || ODPConvertConstants.ODF_STYLE_GRAPHIC_PROP
          .equals(styleType))
          && ODPConvertConstants.ODF_ATTR_STYLE_STYLE.equals(element.getParentNode().getNodeName())
          && ODPConvertConstants.HTML_VALUE_GRAPHIC.equals(CSSConvertUtil.getStyleFamily(element.getParentNode(), true)))
      {
        styleMapSplitProperties = createSubsetStyle(context, element, styleType, rawStyleName, styles);
      }
    }

    Object oldElement = context.get(ODPConvertConstants.CONTEXT_CURRENT_ELEMENT);
    context.put(ODPConvertConstants.CONTEXT_CURRENT_ELEMENT, element);

    // Determine the style map to use for attribute parsing
    Map<String, String> styleMapToProcess = styleMap;
    if (styleMapSplitProperties != null)
    {
      styleMapToProcess = styleMapSplitProperties;
    }

    if (attributes != null && attributes.getLength() > 0)
    {
      for (int j = 0; j < attributes.getLength(); j++)
      {
        parseAttribute(attributes.item(j), context, styleMapToProcess);
      }
      
      // If processing style:text-properties, the font family needs special processing 
      if (ODPConvertConstants.ODF_ATTR_STYLE_TEXT_PROPERTIES.equals(styleType))
      {
        try
        {
          if (element instanceof OdfStyleTextProperties)
          {
            String fontFamily = CSSConvertUtil.getHtmlFontFamily(context, (OdfStyleTextProperties) element);
            if(fontFamily!=null && fontFamily.length() > 0 )
              styleMapToProcess.put(HtmlCSSConstants.FONT_FAMILY, fontFamily);
            else
              styleMapToProcess.remove(HtmlCSSConstants.FONT_FAMILY);
          }

        }
        catch( Exception e)
        {
          LOG.log(Level.WARNING, e.getMessage(),e);
        }
      }
      else if (ODPConvertConstants.ODF_ATTR_STYLE_TABLE_PROPERTIES.equals(styleType))
      {
        if (element instanceof OdfStyleTableProperties)
        {
          styleMapToProcess.remove(HtmlCSSConstants.WIDTH);
          styleMapToProcess.remove(HtmlCSSConstants.HEIGHT);
        }
      }
    }
    
    if(rawStyleName != null && rawStyleName.equalsIgnoreCase("default-style") && (element instanceof OdfStyleTextProperties))
    {
    	dealDefaultStyle(context, styleMapToProcess);
    }
    
    if(rawStyleName != null && rawStyleName.equalsIgnoreCase("standard") && (element instanceof OdfStyleTextProperties))
    {
    	dealDefaultStyle(context, styleMapToProcess);
    }
    
    // Copy substyle to full style if needed
    if (styleMapSplitProperties != null)
    {
      styleMap.putAll(styleMapSplitProperties);
    }

    // Need to get the current font size so that line height conversion works in the
    // case of a cm value conversion - it uses the font size in the calculation.
    Double this_font_size = null;
    if (element instanceof OdfStyle)
    {
      OdfStyle style_element = (OdfStyle) element;
      if (style_element.hasChildNodes())
      {
        OdfStylePropertiesBase text_props = style_element.getPropertiesElement(OdfStylePropertiesSet.TextProperties);

        if (text_props != null)
        {
          String fsize = text_props.getOdfAttributeValue(FoFontSizeAttribute.ATTRIBUTE_NAME);
          if (fsize != null && fsize.length() > 0)
          {
            Measure m = Measure.parseNumber(fsize);
            if (m != null && m.isPTMeasure() && m.getNumber() > 0)
            {
              this_font_size = m.getNumber();
              context.put(ODPConvertConstants.CONTEXT_CURRENT_FONT_SIZE, this_font_size);
            }
          }
        }
      }
    }

    context.put(ODPConvertConstants.CONTEXT_CURRENT_ELEMENT, oldElement);
    CSSConvertUtil.convertCSSChildren(context, element, styles);

    if (this_font_size != null)
    {
      context.remove(ODPConvertConstants.CONTEXT_CURRENT_FONT_SIZE);
    }

    // This next if statement fixes the table cell style by checking to see if we have a color
    // attribute present without any other border color specified. We need to remove the color
    // attribute from the cell style because it will cause the border color to change unless
    // either border-color or border is specified (but border is multi valued so check that the
    // hex encoding is present).

    if (element instanceof OdfStyle)
    {
      OdfStyle se = (OdfStyle) element;
      if (OdfStyleFamily.TableCell.compareTo(se.getFamily()) == 0)
      {
        if (cellColorFixNeeded(styleMap))
          fixCellColor(context, styleMap);
      }
    }
  }

  private void dealDefaultStyle(ConversionContext context,Map<String, String> styleMapToProcess) {
	// Save default style to context, only support fontsize for now, consider add more in later.
//	String defaultItalic = styleMapToProcess.get("font-style").trim();
//  	String defaultBold = styleMapToProcess.get("font-weight").trim();
//  	if(defaultItalic.equalsIgnoreCase("italic")){
//  		defaultItalic = "1";
//  	}
//  	if(defaultBold.equalsIgnoreCase("bold")){
//  		defaultBold = "1";
//  	}
  	String defaultFontSize = styleMapToProcess.get("abs-font-size");
  	if(!defaultFontSize.isEmpty())
  		context.put(ODPConvertConstants.CONTEXT_DEFAULT_FONT_SIZE, defaultFontSize);
  	else
  	    context.put(ODPConvertConstants.CONTEXT_DEFAULT_FONT_SIZE, "18pt");
  }

protected void fixCellColor(ConversionContext context, Map<String, String> styleMap)
  {
    StackableProperties sp = (StackableProperties) context.get(ODPConvertConstants.CONTEXT_STACKABLE_PROPERTIES);

    if (sp != null)
    {
      sp.addProperty(ODPConvertConstants.HTML_ATTR_CELL_COLOR, styleMap.get(ODPConvertConstants.CSS_FONT_COLOR),
          StackableProperties.Type.ELEMENT, "text color from cell");

      styleMap.remove(ODPConvertConstants.CSS_FONT_COLOR);
    }
  }

  /**
   * Checks to see if the color attribute should be removed - if so returns true. Will retrun false if border-color or border (with color)
   * is defined - in this case all 4 borders will have a color defined. Otherwise we must remove the color attribute (it is possible that
   * other properties will define the 4 border colors but this will not be checked - in practice no harm will come of removing the color
   * property in this case).
   * 
   * @param styleMap
   * @return true if color is found but no border color definitions.
   */
  protected boolean cellColorFixNeeded(Map<String, String> styleMap)
  {
    boolean fix = false;

    // check to see if there is a color attribute but no border color
    if (styleMap.containsKey(ODPConvertConstants.CSS_FONT_COLOR) && !styleMap.containsKey(ODPConvertConstants.ODF_ELEMENT_BORDER_COLOR))
    {
      fix = true;
      // now check to make sure color is not present in the border attribute
      String border = styleMap.get(ODPConvertConstants.CSS_BORDER);
      if (border != null)
      {
        Matcher m = BORDER_PATTERN.matcher(border);
        if (m.matches())
          fix = false;
      }
    }

    return fix;
  }

  protected void parseAttribute(Node attrNode, ConversionContext context, Map<String, String> styleMap)
  {
    AttributeConvertorFactory.getInstance().getConvertor(attrNode).convert(context, attrNode, styleMap);
  }

  /**
   * Create a substyle for the text-properties, paragraph-properties, or graphic-properties
   * 
   * @param context
   *          - the ConversionContext
   * @param element
   *          - the style element being processed
   * @param styleType
   *          - the type of style (text-properties, paragraph-properties, or graphic-properties)
   * @param rawStyleName
   *          - the raw style name of the element being processed
   * @param styles
   *          - map of styles
   * @return Map of attributes for the new subset style
   */
  protected Map<String, String> createSubsetStyle(ConversionContext context, Node element, String styleType, String rawStyleName,
      Map<String, Map<String, String>> styles)
  {
    String classSuffix = null;
    if (ODPConvertConstants.ODF_ATTR_STYLE_TEXT_PROPERTIES.equals(styleType))
      classSuffix = ODPConvertConstants.CSS_GRAPHIC_TEXT_PROPERTIES_CLASS_SUFFIX;
    else if (ODPConvertConstants.ODF_STYLE_GRAPHIC_PROP.equals(styleType))
      classSuffix = ODPConvertConstants.CSS_GRAPHIC_GRAPHIC_PROPERTIES_CLASS_SUFFIX;
    else
      classSuffix = ODPConvertConstants.CSS_GRAPHIC_PARAGRAPH_PROPERTIES_CLASS_SUFFIX;

    String substyleStyleName = rawStyleName + classSuffix;
    String substyleCSSClassName = CSSConvertUtil.getStyleName(substyleStyleName);
    Map<String, String> styleMapSplitProperties = CSSConvertUtil.getStyleMap(substyleCSSClassName, styles);

    // css classes need to be mapped to an ODF style object
    // a clone of the current style is created, properly named, and then added to the context
    OdfElement newStyle = (OdfElement) element.getParentNode().cloneNode(true);
    // subset the element to only include the styles for the style type
    subsetStyleElement(newStyle, styleType);
    // set the subsetted style name
    newStyle.setOdfAttributeValue(ConvertUtil.getOdfName(ODFConstants.STYLE_NAME), substyleStyleName);
    // add the subsetted style to the style node map in the context
    ODPConvertStyleMappingUtil.addNodeToStyle(context, newStyle);
    return styleMapSplitProperties;
  }

  /**
   * Subset the cloned element to only contain children of styleType
   * 
   * @param element
   *          - the cloned element to be subsetted
   * @param styleType
   *          - the style type to include
   */
  private void subsetStyleElement(OdfElement element, String styleType)
  {
    @SuppressWarnings("restriction")
    Node curNode = element.getFirstChild();
    while (curNode != null)
    {
      Node nextNode = curNode.getNextSibling();
      if (!styleType.equals(curNode.getNodeName()))
      {
        element.removeChild(curNode);
      }
      curNode = nextNode;
    }
  }
}
