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

import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.logging.Level;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.odftoolkit.odfdom.OdfElement;
import org.odftoolkit.odfdom.OdfFileDom;
import org.odftoolkit.odfdom.doc.office.OdfOfficeAutomaticStyles;
import org.odftoolkit.odfdom.doc.office.OdfOfficeStyles;
import org.odftoolkit.odfdom.doc.style.OdfStyle;
import org.odftoolkit.odfdom.doc.style.OdfStyleGraphicProperties;
import org.odftoolkit.odfdom.dom.element.OdfStylableElement;
import org.odftoolkit.odfdom.dom.style.OdfStyleFamily;
import org.odftoolkit.odfdom.type.Color;
import org.w3c.dom.Attr;
import org.w3c.dom.Element;
import org.w3c.dom.NamedNodeMap;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.w3c.dom.Text;

import com.ibm.symphony.conversion.converter.html2odp.content.DrawFrameConvertor.PAGE_PRES_CLASS;
import com.ibm.symphony.conversion.converter.html2odp.style.CSSUtil;
import com.ibm.symphony.conversion.converter.html2odp.style.GeneralCSSStyleConvertor;
import com.ibm.symphony.conversion.converter.html2odp.util.ContentConvertUtil;
import com.ibm.symphony.conversion.presentation.CSSProperties;
import com.ibm.symphony.conversion.presentation.ODPCommonUtil;
import com.ibm.symphony.conversion.presentation.ODPConvertConstants;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.ConvertUtil;
import com.ibm.symphony.conversion.service.common.HtmlCSSConstants;
import com.ibm.symphony.conversion.service.common.ODFConstants;
import com.ibm.symphony.conversion.service.common.indextable.HtmlToOdfIndex;

public class DrawTextBoxConvertor extends AbstractODPConvertor
{

//  private static final String CLASS = DrawTextBoxConvertor.class.getName();
//
//  private static final Logger log = Logger.getLogger(CLASS);

  private static final String BACKGROUND_REGEX = ODPConvertConstants.CSS_BACKGROUND + "\\s*:.*";

  private static final Pattern BACKGROUND_PATTERN = Pattern.compile(BACKGROUND_REGEX);

  private static final String RGB_REGEX = ".*(rgb\\s*\\([0-9\\s,]+\\)).*";

  private static final Pattern RGB_PATTERN = Pattern.compile(RGB_REGEX);

  private static final String HEX_REGEX = ".*(#[a-fA-F0-9]{6})([^\\p{XDigit}]|$).*";

  private static final Pattern HEX_PATTERN = Pattern.compile(HEX_REGEX);

  // Default Initial Capacity for the STATIC_STYLE_MAP HashMap
  private static final int STATIC_STYLE_MAP_CAPACITY = (int) (12 * 1.33) + 1;

  // Temporarily put the client side supported layouts into the map.
  private static Map<String, String> STATIC_STYLE_MAP = new HashMap<String, String>(STATIC_STYLE_MAP_CAPACITY);

  static
  {
    STATIC_STYLE_MAP.put("ALT0_title", "pr3");
    STATIC_STYLE_MAP.put("ALT0_subtitle", "pr5");

    STATIC_STYLE_MAP.put("ALT1_title", "pr8");
    STATIC_STYLE_MAP.put("ALT1_outline", "pr9");

    STATIC_STYLE_MAP.put("ALT3_title", "pr8");
    STATIC_STYLE_MAP.put("ALT3_outline", "pr9");

    STATIC_STYLE_MAP.put("ALT6_title", "pr8");
    STATIC_STYLE_MAP.put("ALT6_outline", "pr11");

    STATIC_STYLE_MAP.put("ALT9_title", "pr8");
    STATIC_STYLE_MAP.put("ALT9_outline", "pr11");

    STATIC_STYLE_MAP.put("ALT19_title", "pr8");

    STATIC_STYLE_MAP.put("ALT32_subtitle", "pr32");
  }

  // Default Initial Capacity for the Shapes Set
  private static final int SHAPES_SET_CAPACITY = (int) (11 * 1.33) + 1;

  private static final HashSet<String> cvShapesMap = new HashSet<String>(SHAPES_SET_CAPACITY);
  static
  {
    cvShapesMap.add(ODPConvertConstants.ODF_ELEMENT_DRAWCUSTOMSHAPE);
    cvShapesMap.add(ODPConvertConstants.ODF_ELEMENT_DRAWLINE);
    cvShapesMap.add(ODPConvertConstants.ODF_ELEMENT_DRAWELLIPSE);
    cvShapesMap.add(ODPConvertConstants.ODF_ELEMENT_DRAWCIRCLE);
    cvShapesMap.add(ODPConvertConstants.ODF_ELEMENT_DRAWRECT);
    cvShapesMap.add(ODPConvertConstants.ODF_ELEMENT_DRAWPATH);
    cvShapesMap.add(ODPConvertConstants.ODF_ELEMENT_DRAWPOLYGON);
    cvShapesMap.add(ODPConvertConstants.ODF_ELEMENT_DRAWPOLYLINE);
    cvShapesMap.add(ODPConvertConstants.ODF_ELEMENT_DRAWREGULARPOLYGON);
    cvShapesMap.add(ODPConvertConstants.ODF_ELEMENT_DRAWMEASURE);
    cvShapesMap.add(ODPConvertConstants.ODF_ELEMENT_DRAWCONNECTOR);
  }

  
  @SuppressWarnings("unused")
  private Element getTextBoxNodeFrom(Element contentBox)
  {
    return null;
  }

  @SuppressWarnings({ "restriction", "static-access", "unchecked" })
  private void convertColorStyle(OdfElement element, Element htmlElement, ConversionContext context)
  {
    Node n = htmlElement;

    // get the textbox content
    if ((n = n.getFirstChild()) != null && (n = n.getFirstChild()) != null)
    {
      Element colorDiv = (Element) n;
      Attr attr = colorDiv.getAttributeNode(ODPConvertConstants.HTML_ATTR_STYLE);
      String[] styles = attr.getNodeValue().split(";");
      for (String item_it : styles)
      {
        String item = item_it.toLowerCase();

        // get the color
        String color = null;

        // since background is a substring of background-color, use regex to match
        if (BACKGROUND_PATTERN.matcher(item.trim()).matches())
        {
          // search for color in the background attribute. The rgb value might be
          // contained within a bunch of other information - need to parse it out.
          color = getSupportedColor(item);
        }
        else if (item.indexOf(ODPConvertConstants.CSS_BACKGROUND_COLOR) > -1)
        {
          // search for color in background-color attribute
          String value = item.substring(item.indexOf(":") + 1, item.length()).trim();
          color = getSupportedColor(value);          
        }

        if (color != null)
        {
          // these background colors are based on style information from the original import - they
          // should be removed if they have not been changed.
          String colorval = null;
          if (!color.equals(ODPConvertConstants.CSS_VALUE_TRANSPARENT))
          {
            colorval = Color.toSixDigitHexRGB(color); 
          }
          else
            colorval = color;
          String inlinebg = colorDiv.getAttribute(ODPConvertConstants.HTML_ATTR_PSEUDO_BG_COLOR);
          if (colorval != null && inlinebg != null)
          {
            if (colorval.equalsIgnoreCase(inlinebg))
            {
              return;
            }
          }

          String styleName = element.getAttribute(ODPConvertConstants.ODF_ATTR_DRAW_STYLE_NAME);
          // for normal textbox which is created by symphony or exist in odp file.
          if (styleName.length() > 0)
          {
            // TODO: yangjun ,should replace styleMap by ODPConvertStyleMappingUtil
            Map<String, OdfElement> styleMap = (Map<String, OdfElement>) context.get(ODPConvertConstants.CONTEXT_ODP_STYLES_MAP);
            OdfElement style = styleMap.get(styleName);
            if (style != null)
            {
              if (isMatchingFillColor(style, colorval))
              {
                // no sense in cloning the style if the color is already set
                return;
              }

              OdfElement newStyle = (OdfElement) style.cloneNode(true); // should be light copy.
              String newName = CSSUtil.getStyleName(OdfStyleFamily.Graphic, styleName);
              newStyle.removeAttribute(ODFConstants.STYLE_NAME);
              newStyle.setOdfAttributeValue(ConvertUtil.getOdfName(ODFConstants.STYLE_NAME), newName);

              OdfStyleGraphicProperties grStyle = newStyle.findFirstChildNode(OdfStyleGraphicProperties.class, newStyle);
              if (grStyle != null)
              {
                grStyle.removeAttribute(OdfStyleGraphicProperties.Fill.toString());
                grStyle.removeAttribute(OdfStyleGraphicProperties.FillColor.toString());
                if (colorval.equals(ODPConvertConstants.CSS_VALUE_TRANSPARENT))
                {
                  grStyle.setOdfAttributeValue(ConvertUtil.getOdfName(OdfStyleGraphicProperties.Fill.toString()),
                      ODPConvertConstants.CSS_VALUE_NONE);
                }
                else
                {
                  grStyle.setOdfAttributeValue(ConvertUtil.getOdfName(OdfStyleGraphicProperties.FillColor.toString()), colorval);
                  grStyle.setOdfAttributeValue(ConvertUtil.getOdfName(OdfStyleGraphicProperties.Fill.toString()),
                      ODPConvertConstants.CSS_VALUE_SOLID);
                }
              }

              element.setOdfAttributeValue(ConvertUtil.getOdfName(ODPConvertConstants.ODF_ATTR_DRAW_STYLE_NAME), newName);

              Map<String, OdfElement> usedStyle = (Map<String, OdfElement>) context.get(ODPConvertConstants.CONTEXT_USED_STYLE_MAP);
              usedStyle.put(newName, newStyle);
              styleMap.put(newName, newStyle);

              OdfFileDom contentDom = (OdfFileDom) context.get(ODPConvertConstants.CONTEXT_CONVERT_TARGET);
              OdfOfficeAutomaticStyles autoStyles = contentDom.getAutomaticStyles();
              autoStyles.appendChild(newStyle);
            }
          }
          // for textbox which is created by Concord directly and layout which is created by symphony.
          else
          {
            styleName = element.getAttribute(ODPConvertConstants.ODF_ATTR_PRE_STYLE_NAME);
            if (styleName.length() > 0)
            {
              // TODO: yangjun ,should replace styleMap by ODPConvertStyleMappingUtil
              Map<String, OdfElement> styleMap = (Map<String, OdfElement>) context.get(ODPConvertConstants.CONTEXT_ODP_STYLES_MAP);
              OdfElement style = styleMap.get(styleName);
              // for the layout textbox created by symphony
              if (style != null)
              {
            	cloneStyleForColor(element, htmlElement, context, style, styleName, colorval, styleMap);
              }
              // for the textbox created by Concord,create from default style.
              else
              {
                Map<String, OdfElement> defaultStyleMap = (Map<String, OdfElement>) context
                    .get(ODPConvertConstants.CONTEXT_ODP_STYLES_MAP_ADDED);
                OdfElement defaultStyle = defaultStyleMap.get(styleName); // get the default style
                if (defaultStyle != null)
                {
                  cloneStyleForColor(element, htmlElement, context, defaultStyle, styleName, colorval, styleMap);
                }
              }
            }
          }
        }
      }
    }
  }
  /**
   * create new presentation style to protect the exist style,other textbox maybe use the same style too.
   */
  @SuppressWarnings("restriction")
  protected void cloneStyleForColor(OdfElement element, Element htmlElement, ConversionContext context,OdfElement style,String styleName,String colorval, Map<String, OdfElement> styleMap)
  {
	 try{
		 // create new presentation style to protect the default style.
		 OdfElement newStyle = (OdfElement) style.cloneNode(true); // should be light copy.
		 String newName = CSSUtil.getStyleName(OdfStyleFamily.Presentation, styleName);
		 newStyle.setAttribute(ODFConstants.STYLE_NAME, newName);
		 OdfStyleGraphicProperties graStyle = OdfElement.findFirstChildNode(OdfStyleGraphicProperties.class, newStyle);
		 if (graStyle != null)
		 {
			 graStyle.removeAttribute(OdfStyleGraphicProperties.Fill.toString()); // remove draw:fill
			 graStyle.removeAttribute(OdfStyleGraphicProperties.FillColor.toString());
			 if (colorval.equals(ODPConvertConstants.CSS_VALUE_TRANSPARENT))
			 {
				 graStyle.setOdfAttributeValue(ConvertUtil.getOdfName(OdfStyleGraphicProperties.Fill.toString()),
						 ODPConvertConstants.CSS_VALUE_NONE);
			 }
			 else
			 {
				 graStyle.setOdfAttributeValue(ConvertUtil.getOdfName(OdfStyleGraphicProperties.Fill.toString()),
						 ODPConvertConstants.CSS_VALUE_SOLID);
				 graStyle.setOdfAttributeValue(ConvertUtil.getOdfName(OdfStyleGraphicProperties.FillColor.toString()), colorval);
			 }
		 }
		 OdfFileDom contentDom = (OdfFileDom) context.get(ODPConvertConstants.CONTEXT_CONVERT_TARGET);
		 OdfOfficeAutomaticStyles autoStyles = contentDom.getAutomaticStyles();
		 //one log issue in 173303: [BHT6B] Convert Microsoft file caused convert instance crashed frequently.
		 OdfOfficeStyles officeStyles = contentDom.getOfficeStyles();
		 if(newStyle.getOwnerDocument() == autoStyles.getOwnerDocument()) {
			 autoStyles.appendChild(newStyle);
		 } else if(newStyle.getOwnerDocument() == officeStyles.getOwnerDocument()) {
			 officeStyles.appendChild(newStyle);
		 } else {
			 newStyle = null;
			 return;
		 }
		 element.setOdfAttributeValue(ConvertUtil.getOdfName(ODPConvertConstants.ODF_ATTR_PRE_STYLE_NAME), newName);
		 //htmlElement.setAttribute(ODPConvertConstants.CONTEXT_PRE_STYLE_NAME, newName);
		 Map<String, OdfElement> usedStyle = (Map<String, OdfElement>) context.get(ODPConvertConstants.CONTEXT_USED_STYLE_MAP);
		 usedStyle.put(newName, newStyle);
		 styleMap.put(newName, newStyle);
	 }catch(Exception e){
		 ODPCommonUtil.logMessage("cloneStyleForColor error, the background color will be lost"); 
	 }
  }
  /**
   * Check if the passed in graphic style has a solid fill color equal to checkColor
   * 
   * @param style
   * @param checkColor
   * @return true if the color is checkColor
   */
  @SuppressWarnings("restriction")
  protected boolean isMatchingFillColor(OdfElement style, String checkColor)
  {
    OdfStyleGraphicProperties grStyle = OdfStyleGraphicProperties.findFirstChildNode(OdfStyleGraphicProperties.class, style);
    if (grStyle != null)
    {
      String fval = grStyle.getAttribute(OdfStyleGraphicProperties.Fill.toString());
      // If draw:fill="none" and background-color="transparent" then the colors are equal
      if (fval != null && fval.equals(ODPConvertConstants.CSS_VALUE_NONE) && checkColor.equals(ODPConvertConstants.CSS_VALUE_TRANSPARENT))
        return true;

      String bgcolor = grStyle.getAttribute(OdfStyleGraphicProperties.FillColor.toString());
      // If draw:fill-color equals background-color then they are equal
      if (bgcolor != null && fval != null && checkColor != null && !checkColor.equals(ODPConvertConstants.CSS_VALUE_TRANSPARENT))
      {
        if (fval.equalsIgnoreCase(ODPConvertConstants.CSS_VALUE_SOLID) && bgcolor.equals(checkColor))
          return true;
      }
    }
    return false;
  }

  @SuppressWarnings("restriction")
  @Override
  protected void doContentConvert(ConversionContext context, Element htmlElement, OdfElement odfParent)
  {
	  try{
		  OdfFileDom contentDom = (OdfFileDom) context.get(ODPConvertConstants.CONTEXT_CONVERT_TARGET);
		  OdfElement textBox;
		  boolean isIndexed = false;
		  String layoutName = (String) context.get(ODPConvertConstants.CONTEXT_PAGE_LAYOUT_NAME);
		  HtmlToOdfIndex indexTable = context.getHtmlToOdfIndexTable();
		  if (indexTable.isHtmlNodeIndexed(htmlElement))
		  {
			  isIndexed = true;
			  textBox = indexTable.getFirstOdfNode(htmlElement);
			  if (layoutName != null)
			  {
				  updateForDummyBox(odfParent, layoutName, context, isParentShape(odfParent.getNodeName()));
			  }
		  }
		  else
		  {
			  isIndexed = false;
			  String odfNodeName = getOdfNodeName(htmlElement);
			  textBox = contentDom.createElementNS(ContentConvertUtil.getNamespaceUri(odfNodeName), odfNodeName);
			  odfParent.appendChild(textBox);
			  indexTable.addEntryByHtmlNode(htmlElement, textBox);
			  buildForDummyBox(odfParent, layoutName, context, htmlElement, isParentShape(odfParent.getNodeName()));
		  }
		  
		  if (textBox != null)
		  {
			  // Add or update any accessibility information that might have changed
			  setAccessibilityInfo(context, htmlElement, odfParent);
			  parseAttributes(context, htmlElement, textBox, odfParent);
			  this.convertChildren(context, htmlElement, textBox);
			  
			  ODPConvertConstants.DIV_CONTEXT_TYPE dc = (ODPConvertConstants.DIV_CONTEXT_TYPE) context.get(ODPConvertConstants.CONTEXT_DIV_CONTEXT);
			  
			  if (dc != ODPConvertConstants.DIV_CONTEXT_TYPE.SPEAKER_NOTES)
			  {
				  // Added this call to correct the background color on export such that the call is made after the
				  // element's main style (from the html class attribute) has been determined. Otherwise it was not
				  // clear which style was being modified. Added check to speaker notes export will not modify the
				  // background color of the original style - users are not permitted to modify this background color
				  // so this style change is artificially inserted by the editor.
				  convertColorStyle((OdfElement) textBox.getParentNode(), (Element) htmlElement, context);
				  
				  // Update the graphic or presentation style text area related attributes (such as vertical-align)
				  // which can be modified in the Editor.
				  updateStyle(context, htmlElement, (OdfElement) textBox);
			  }
			  
			  if ((ContentConvertUtil.isShapeModifiable(odfParent) && !isIndexed))
			  {
				  NodeList children = textBox.getChildNodes();
				  int numOfChildren = children.getLength();
				  for (int i = 0; i < numOfChildren; i++)
				  {
					  // NOTE: Go through this loop for the textboxes number of children
					  // However, always take the child at position 0 because once we add the child to
					  // the odfParent, it is removed as a child from the textBox 
					  Node child = children.item(0);
					  if (child instanceof Element)
					  {
						  odfParent.appendChild(child);
					  }
				  }
				  odfParent.removeChild(textBox);
			  }
		  }
	  }catch(Exception e){
		  ODPCommonUtil.logException(context, ODPCommonUtil.LOG_ERROR_CONVERT_TEXTBOX, e);
	  }
  }

  @SuppressWarnings("restriction")
  void buildForDummyBox(OdfElement element, String layoutName, ConversionContext context, Element htmlElement, boolean isParentCustomShape)
  {
    // First verify that the draw text style name is not already set. If set, leave it
    String drawTextStyle = element.getAttribute(ODPConvertConstants.ODF_ATTR_DRAW_TEXT_STYLE_NAME);
    if ((null == drawTextStyle) || (drawTextStyle.length() == 0))
    {
      String textStyleName = ContentConvertUtil.insertStyle("P4", context, true, null);
      element.setAttributeNS(ContentConvertUtil.getNamespaceUri(ODPConvertConstants.ODF_ATTR_DRAW_TEXT_STYLE_NAME),
          ODPConvertConstants.ODF_ATTR_DRAW_TEXT_STYLE_NAME, textStyleName);
    }

    // Get the height of the text box (from the draw:frame) to allow us to set the fo:min-height to the correct minimum value
    String height = element.getAttribute(ODPConvertConstants.ODF_ATTR_SVG_HEIGHT);

    // Verify the presentation or draw style is not already set. If set this was likely a copied text box. If it was,
    // we may just need to update the height.
    String existingStyleName = updateDrawFrameStyle(context, htmlElement, element, height);
    if (existingStyleName != null)
    {
      if (existingStyleName.startsWith(ODPConvertConstants.HTML_ELEMENT_STYLE_PR)) // Presentation style found
      {
        // Check if the existing (or newly created) presentation style needs to be updated. It needs to be
        // updated if the master style has changed
        ContentConvertUtil.updatePresentationStyle(existingStyleName, context, null);
      }
      return;
    }

    // Add a presentation style (when needed)
    if (layoutName != null)
    {
      // Map<String, OdfElement> addedStyles = (Map<String, OdfElement>) context.get(ContentConvertUtil.ODP_STYLES_MAP_ADDED);
      // Map<String, OdfElement> stylesMap = (Map<String, OdfElement>) context.get(ContentConvertUtil.ODP_STYLES_MAP);

      String classValue = element.getAttribute(ODPConvertConstants.ODF_ATTR_PRESENTATION_CLASS);
      String styleClass = STATIC_STYLE_MAP.get(layoutName + ODPConvertConstants.SYMBOL_UNDERBAR + classValue);
      if (classValue != null)
      {
        PAGE_PRES_CLASS classType = PAGE_PRES_CLASS.toEnum(classValue);
        switch (classType)
          {
            case TITLE :
            case SUBTITLE :
            {
              element.setAttributeNS(ContentConvertUtil.getNamespaceUri(ODPConvertConstants.ODF_ATTR_PRE_STYLE_NAME),
                  ODPConvertConstants.ODF_ATTR_PRE_STYLE_NAME, STATIC_STYLE_MAP.get(styleClass));
              break;
            }
          }
      }
      if (styleClass != null) // Presentation Style we support
      {
        String prStyleName = ContentConvertUtil.insertStyle(styleClass, context, true, height);
        element.setAttributeNS(ContentConvertUtil.getNamespaceUri(ODPConvertConstants.ODF_ATTR_PRE_STYLE_NAME),
            ODPConvertConstants.ODF_ATTR_PRE_STYLE_NAME, prStyleName);
      }
      else
      {
        if (classValue != null && classValue.equals(ODPConvertConstants.NOTES))
        {
        } // Note: Styles have already been processed in DrawFrameConvertor or appropriate convertor
        else if (!(isInModifiableShape(isParentCustomShape, element)))
        {
          String grStyleName = ContentConvertUtil.insertStyle("pr12", context, true, height);
          element.setAttributeNS(ContentConvertUtil.getNamespaceUri(ODPConvertConstants.ODF_ATTR_PRE_STYLE_NAME),
              ODPConvertConstants.ODF_ATTR_PRE_STYLE_NAME, grStyleName);
        }
      }
    }
  }

  private boolean isInModifiableShape(boolean isParentCustomShape, Element element)
  {
    return (isParentCustomShape || ContentConvertUtil.isShapeModifiable(element));
  }

  private boolean isParentShape(String nodeName)
  {
    String lcNodeName = nodeName.toLowerCase();
    return cvShapesMap.contains(lcNodeName);
  }

  /**
   * Update the presentation style name for existing text boxes if the layout or master style has been changed. In addition, create the
   * presentation style if it does not yet exist.
   * 
   * @param element
   *          - the existing OdfElement
   * @param layoutName
   *          - the new layout name
   * @param context
   *          - the current conversion context.
   * @param appendDefaultPrStyle
   *          - true if the parent is a custom shape or draw line.
   */
  @SuppressWarnings({ "restriction" })
  protected void updateForDummyBox(OdfElement element, String layoutName, ConversionContext context, boolean appendDefaultPrStyle)
  {

    String classValue = element.getAttribute(ODPConvertConstants.ODF_ATTR_PRESENTATION_CLASS);

    if (classValue != null && classValue.length() > 0)
    {
      if (!classValue.equals(ODPConvertConstants.NOTES))
      {
        String styleClass = STATIC_STYLE_MAP.get(layoutName + ODPConvertConstants.SYMBOL_UNDERBAR + classValue);

        if (styleClass != null)
        {
          String currentStyleClass = element.getAttribute(ODPConvertConstants.ODF_ATTR_PRE_STYLE_NAME);

          // Get the height of the text box (from the draw:frame) to allow us to set the fo:min-height to the correct minimum value
          String height = element.getAttribute(ODPConvertConstants.ODF_ATTR_SVG_HEIGHT);

          // If the style class has changed, need to update it to the new value and create the new style class if it
          // doesn't exist already
          boolean layoutChanged = (Boolean) context.get(ODPConvertConstants.CONTEXT_PAGE_LAYOUT_NAME_UPDATED);
          if (layoutChanged && (currentStyleClass == null || !currentStyleClass.equals(styleClass)))
          {
            styleClass = ContentConvertUtil.insertStyle(styleClass, context, true, height);
            element.setAttributeNS(ContentConvertUtil.getNamespaceUri(ODPConvertConstants.ODF_ATTR_PRE_STYLE_NAME),
                ODPConvertConstants.ODF_ATTR_PRE_STYLE_NAME, styleClass);
          }
          else if (currentStyleClass != null && currentStyleClass.length() > 0)
          {
            // Check if the existing presentation style needs to be updated. It needs to be updated if the
            // master style has changed. In this case, the parent stylename as well as the fo:min-height may be incorrect.
            ContentConvertUtil.updatePresentationStyle(currentStyleClass, context, height);
          }
        }
        else
        {
          if (!appendDefaultPrStyle)
          {
            // Since we don't know what the style class is suppose to be, leave the current one (if it exists).
            // If is doesn't currently have one, set it to pr12.
            String currentStyleClass = element.getAttribute(ODPConvertConstants.ODF_ATTR_PRE_STYLE_NAME);
            if (currentStyleClass == null)
            {
              styleClass = ContentConvertUtil.insertStyle("pr12", context, true, null);
              element.setAttributeNS(ContentConvertUtil.getNamespaceUri(ODPConvertConstants.ODF_ATTR_PRE_STYLE_NAME),
                  ODPConvertConstants.ODF_ATTR_PRE_STYLE_NAME, styleClass);
            }
          }
        }
      }
      else
      { // Notes style - may need update of parent if the master style changed
        String currentStyleClass = element.getAttribute(ODPConvertConstants.ODF_ATTR_PRE_STYLE_NAME);
        if (currentStyleClass != null && currentStyleClass.length() > 0)
        {
          ContentConvertUtil.updatePresentationStyle(currentStyleClass, context, null);
        }
      }
    }
  }

  protected void parseAttributes(ConversionContext context, Element htmlNode, OdfElement element, OdfElement odfParent)
  {
    // get the father's node and convert the color of text-box.

    // removed old call to convertColorStyle from here
    NamedNodeMap attributes = htmlNode.getAttributes();
    for (int i = 0; i < attributes.getLength(); i++)
    {
      // for converting attribute here.
    }
  }

  /**
   * Update the draw:style-name or presentation:style-name using the existing draw_frame_classes div.
   * 
   * @param context
   *          - Conversion context
   * @param htmlElement
   *          - current html element being processed (draw_text-box div)
   * @param odfElement
   *          - draw-frame div
   * @param drawFrameClasses
   *          - list of classes associated with draw:frame
   * @param height
   *          - fo:min-height to use
   * @return String - style name set, null if no graphic or presentation style was found.
   */
  @SuppressWarnings({ "restriction" })
  private String updateDrawFrameStyle(ConversionContext context, Element htmlElement, OdfElement odfElement, String height)
  {
    // First, find the draw_frame_classes div
    Node child = htmlElement.getFirstChild(); // display:table div
    if (child != null)
    {
      child = child.getFirstChild(); // display:table-cell div
    }
    if (child == null) // Invalid text box structure
      return null;

    String drawFrameClasses = ((Element) child).getAttribute(ODPConvertConstants.HTML_ATTR_CLASS);
    if (!drawFrameClasses.contains(ODPConvertConstants.HTML_VALUE_DRAW_FRAME_CLASSES)) // Invalid text box structure
      return null;

    OdfFileDom contentDom = (OdfFileDom) context.get(ODPConvertConstants.CONTEXT_CONVERT_TARGET);
    OdfOfficeAutomaticStyles autoStyles = contentDom.getAutomaticStyles();
    String styleName = null;
    String[] classes = drawFrameClasses.split("\\s+"); // Split by whitespace
    for (int i = 0; i < classes.length; i++)
    {
      // Check to see if there is a gr(aphic) style
      if (classes[i].startsWith(ODPConvertConstants.HTML_ELEMENT_STYLE_GR))
      {
        if (odfElement.getNodeName().equalsIgnoreCase(ODPConvertConstants.ODF_ELEMENT_DRAWFRAME))
        {
          String drawStyleName = odfElement.getAttribute(ODPConvertConstants.ODF_ATTR_DRAW_STYLE_NAME);
          // If the draw:style-name is not set, or it is set to a CDUP, set it.
          if (drawStyleName == null || drawStyleName.length() == 0 || drawStyleName.contains(ODPConvertConstants.STYLE_COPY_IDENTIFIER))
          {
            String grStyleName = classes[i];
            // Get the existing graphic style
            OdfStyle odfStyle = autoStyles.getStyle(grStyleName, OdfStyleFamily.Graphic);
            if (odfStyle != null)
            {
              String currentMinHeight = odfStyle.getProperty(OdfStyleGraphicProperties.MinHeight);
              if (currentMinHeight != null && !currentMinHeight.equals(height))
              {
                // Clone the style and update the min-height
                OdfStyle newStyle = (OdfStyle) odfStyle.cloneNode(true);
                newStyle.setProperty(OdfStyleGraphicProperties.MinHeight, height);
                String newStyleName = CSSUtil.getStyleName(OdfStyleFamily.Graphic, grStyleName);
                newStyle.setStyleNameAttribute(newStyleName);
                // Add the new style to the autoStyles
                autoStyles.appendChild(newStyle);
                // Add the new style to the stylemaps
                GeneralCSSStyleConvertor.addNewStyleToHashMaps(context, newStyle);
                styleName = newStyleName;
              }
              else
              {
                // Use the existing style
                styleName = grStyleName;
              }

              // Update the ODF element to reference the new style
              ((OdfStylableElement) odfElement).setAttributeNS(
                  ContentConvertUtil.getNamespaceUri(ODPConvertConstants.ODF_ATTR_DRAW_STYLE_NAME),
                  ODPConvertConstants.ODF_ATTR_DRAW_STYLE_NAME, styleName);
              // Remove any existing presentation:style-name since we are going to use a draw:style-name
              String presStyleName = odfElement.getAttribute(ODPConvertConstants.ODF_ATTR_PRE_STYLE_NAME);
              if (presStyleName != null)
                odfElement.removeAttribute(ODPConvertConstants.ODF_ATTR_PRE_STYLE_NAME);
              break;
            }
          }
        }
      }
      // Check to see if there is a pr(esentation) style
      else if (classes[i].startsWith(ODPConvertConstants.HTML_ELEMENT_STYLE_PR))
      {
        if (odfElement.getNodeName().equalsIgnoreCase(ODPConvertConstants.ODF_ELEMENT_DRAWFRAME))
        {
          String presStyleName = odfElement.getAttribute(ODPConvertConstants.ODF_ATTR_PRE_STYLE_NAME);
          // If the presentation:style-name is not set, or it is set to a CDUP, set it.
          if (presStyleName == null || presStyleName.length() == 0 || presStyleName.contains(ODPConvertConstants.STYLE_COPY_IDENTIFIER))
          {
            String prStyleName = classes[i];
            // Get the existing presentation style
            OdfStyle odfStyle = autoStyles.getStyle(prStyleName, OdfStyleFamily.Presentation);
            if (odfStyle != null)
            {
              String currentMinHeight = odfStyle.getProperty(OdfStyleGraphicProperties.MinHeight);
              if (currentMinHeight != null && !currentMinHeight.equals(height))
              {
                // Clone the style and update the min-height
                OdfStyle newStyle = (OdfStyle) odfStyle.cloneNode(true);
                newStyle.setProperty(OdfStyleGraphicProperties.MinHeight, height);
                String newStyleName = CSSUtil.getStyleName(OdfStyleFamily.Presentation, prStyleName);
                newStyle.setStyleNameAttribute(newStyleName);
                // Add the new style to the autoStyles
                autoStyles.appendChild(newStyle);
                // Add the new style to the stylemaps
                GeneralCSSStyleConvertor.addNewStyleToHashMaps(context, newStyle);
                styleName = newStyleName;
              }
              else
              {
                // Use the existing style
                styleName = prStyleName;
              }

              // Update the ODF element to reference the new style
              ((OdfStylableElement) odfElement).setAttributeNS(
                  ContentConvertUtil.getNamespaceUri(ODPConvertConstants.ODF_ATTR_PRE_STYLE_NAME),
                  ODPConvertConstants.ODF_ATTR_PRE_STYLE_NAME, styleName);
              // Remove any existing draw:style-name since we are going to use a presentation:style-name
              String grStyleName = odfElement.getAttribute(ODPConvertConstants.ODF_ATTR_DRAW_STYLE_NAME);
              if (grStyleName != null)
                odfElement.removeAttribute(ODPConvertConstants.ODF_ATTR_DRAW_STYLE_NAME);
              break;
            }
          }
        }
      }
    }
    return styleName;
  }

  /**
   * Update the presentation or graphic style if attributes within it were changed by the editor. Current supported attributes include: -
   * vertical-align
   * 
   * @param context
   *          - Conversion context
   * @param htmlElement
   *          - current html element being processed (draw_text-box div)
   * @param odfElement
   *          - Draw Text Box element (for text boxes and text boxes within an image) or Draw Shape element (if text box in a shape)
   * @return String - style name created (new clone), null if no changes or an error occurred.
   */
  @SuppressWarnings("restriction")
  private String updateStyle(ConversionContext context, Element htmlElement, OdfElement odfElement)
  {
    // First, find the draw_frame_classes div
    Node child = htmlElement.getFirstChild(); // display:table div
    if (child != null)
    {
      child = child.getFirstChild(); // display:table-cell div
    }
    if (child == null)
      return null; // Invalid text box structure

    String drawFrameClasses = ((Element) child).getAttribute(ODPConvertConstants.HTML_ATTR_CLASS);
    if (drawFrameClasses == null
        || !(drawFrameClasses.contains(ODPConvertConstants.HTML_VALUE_DRAW_FRAME_CLASSES) || drawFrameClasses
            .contains(ODPConvertConstants.HTML_CLASS_DRAW_SHAPE_CLASSES)))
      return null; // Invalid text box structure

    // Get the CSS styles which should be checked to see if they require update in the ODF presentation or graphic style
    String stylesString = ((Element) child).getAttribute(ODPConvertConstants.HTML_ATTR_STYLE);
    if (stylesString == null || stylesString.length() == 0)
      return null;

    CSSProperties styles = new CSSProperties(stylesString, true);
    String verticalAlign = styles.getProperty(HtmlCSSConstants.VERTICAL_ALIGN);
    if (verticalAlign == null)
      return null; // Nothing to change

     // Find the ODF element for possible update of the style
    String odfNodeName = odfElement.getNodeName();
    if (!isParentShape(odfNodeName))
      odfElement = (OdfElement) odfElement.getParentNode();
    
    // Get the ODF style which may need update
    OdfStyle odfStyle = null;
    OdfStyleFamily odfStyleFamily = null;
    String styleAttribute = null;
    OdfFileDom contentDom = (OdfFileDom) context.get(ODPConvertConstants.CONTEXT_CONVERT_TARGET);
    OdfOfficeAutomaticStyles autoStyles = contentDom.getAutomaticStyles();
    String styleName = odfElement.getAttribute(ODPConvertConstants.ODF_ATTR_DRAW_STYLE_NAME);
    if (styleName == null || styleName.length() == 0)
    {
      styleName = odfElement.getAttribute(ODPConvertConstants.ODF_ATTR_PRE_STYLE_NAME);
      if (styleName == null || styleName.length() == 0)
        return null; // No style to update
      else
      {
        // Get the presentation style
        odfStyleFamily = OdfStyleFamily.Presentation;
        odfStyle = autoStyles.getStyle(styleName, odfStyleFamily);
      }
      styleAttribute = ODPConvertConstants.ODF_ATTR_PRE_STYLE_NAME;
    }
    else
    {
      // Get the graphic style
      odfStyleFamily = OdfStyleFamily.Graphic;
      odfStyle = autoStyles.getStyle(styleName, odfStyleFamily);
      styleAttribute = ODPConvertConstants.ODF_ATTR_DRAW_STYLE_NAME;
    }

    if (odfStyle == null)
      return null; // Error getting the style

    String newStyleName = null;
    String currentVerticalAlign = odfStyle.getProperty(OdfStyleGraphicProperties.TextareaVerticalAlign);
    if (!verticalAlign.equals(currentVerticalAlign)) // Vertical Align change?
    {
      // Clone the style and update the appropriate attribute(s)
      OdfStyle newStyle = (OdfStyle) odfStyle.cloneNode(true);
      newStyle.setProperty(OdfStyleGraphicProperties.TextareaVerticalAlign, verticalAlign);
      newStyleName = CSSUtil.getStyleName(odfStyleFamily, styleName);
      newStyle.setStyleNameAttribute(newStyleName);
      // Add the new style to the autoStyles
      autoStyles.appendChild(newStyle);
      // Add the new style to the stylemaps
      GeneralCSSStyleConvertor.addNewStyleToHashMaps(context, newStyle);
      // Update the ODF element to reference the new style
      ((OdfStylableElement) odfElement).setAttributeNS(ContentConvertUtil.getNamespaceUri(styleAttribute), styleAttribute, newStyleName);
    }

    // Return the new style name (or null if no new style was created)
    return newStyleName;
  }
  
  /**
   * Add or update accessibility information associated with this Text Box
   * @param context - the current conversion context
   * @param htmlNode - the table element
   * @param odfParent - the parent to add/update the svg:title or svg:desc
   */
  @SuppressWarnings("restriction")
  private void setAccessibilityInfo(ConversionContext context, Element htmlNode, OdfElement odfParent)
  {
    // First handle any aria information
    try
    {
      String ariaTitle = htmlNode.getAttribute(ODFConstants.HTML_ATTR_ARIA_LABEL);
      if (ariaTitle != null && ariaTitle.length() > 0)
      {
        // Add or update the svg:title
        NodeList svgTitles = odfParent.getElementsByTagName(ODPConvertConstants.ODF_ELEMENT_SVGTITLE);
        if (svgTitles.getLength() == 0)
        {
          // Add a new svg:title
          OdfFileDom contentDom = (OdfFileDom) context.get(ODPConvertConstants.CONTEXT_CONVERT_TARGET);
          OdfElement titleElement = contentDom.createElementNS(
              ContentConvertUtil.getNamespaceUri(ODPConvertConstants.ODF_ELEMENT_SVGTITLE), ODPConvertConstants.ODF_ELEMENT_SVGTITLE);
          Text t = contentDom.createTextNode(ariaTitle);
          titleElement.appendChild(t);
          odfParent.appendChild(titleElement);
        }
        else
        {
          // Update the svg:title if it has been updated
          Node svgTitle = svgTitles.item(0);
          String currentTitle = svgTitle.getTextContent();
          if (currentTitle == null || !currentTitle.equals(ariaTitle))
          {
            svgTitle.setTextContent(ariaTitle);
          }
        }
      }

      String ariaLabels = htmlNode.getAttribute(ODFConstants.HTML_ATTR_ARIA_DESCRIBEDBY);
      if (ariaLabels != null && ariaLabels.length() > 0)
      {
        String[] ariaLabelIDs = ariaLabels.trim().split("\\s+"); // Split by whitespace
        for (String ariaLabel : ariaLabelIDs)
        {
          if (!ariaLabel.startsWith(ODFConstants.HTML_ATTR_ARIA_IGNORE_PREFIX))
          {
            // Find the label containing the description.  It should be the last child of the draw_text-box <div> element.
            Node label = htmlNode.getLastChild();
            if (label != null && label.getNodeName().equals(ODFConstants.HTML_ELEMENT_LABEL))
            {
              String id = ((Element)label).getAttribute(ODFConstants.HTML_ATTR_ID);
              if (id != null && id.equals(ariaLabel))
              {
                Node textNode = label.getFirstChild();
                if (textNode != null && textNode instanceof Text)
                {
                  String svgDescText = textNode.getNodeValue();
                  if (svgDescText != null && svgDescText.length() > 0)
                  {
                    // Add or update the svg:desc
                    NodeList svgDescriptions = odfParent.getElementsByTagName(ODPConvertConstants.ODF_ELEMENT_SVGDESC);
                    if (svgDescriptions.getLength() == 0)
                    {
                      // Add a new svg:desc
                      OdfFileDom contentDom = (OdfFileDom) context.get(ODPConvertConstants.CONTEXT_CONVERT_TARGET);
                      OdfElement descElement = contentDom.createElementNS(
                          ContentConvertUtil.getNamespaceUri(ODPConvertConstants.ODF_ELEMENT_SVGDESC), ODPConvertConstants.ODF_ELEMENT_SVGDESC);
                      Text t = contentDom.createTextNode(svgDescText);
                      descElement.appendChild(t);
                      odfParent.appendChild(descElement);
                    }
                    else
                    {
                      // Update the svg:desc if it has been updated
                      Node svgDesc = svgDescriptions.item(0);
                      String currentDesc = svgDesc.getTextContent();
                      if (currentDesc == null || !currentDesc.equals(svgDescText))
                      {
                        svgDesc.setTextContent(svgDescText);
                      }
                    }
                  }
                }
              }
            }
            break;
          }
        }
      }
    }
    catch (Exception e)
    {
      ODPCommonUtil.logException(context, Level.SEVERE, ODPCommonUtil.LOG_FAILED_ARIA_EXPORT, e);
    }
  }

  private String getSupportedColor(String source)
  {
    String color = null;
    Matcher m = RGB_PATTERN.matcher(source);
    if (m.matches())
      color = m.group(1);

    // also check for the #hex encoding
    if (color == null)
    {
      m = HEX_PATTERN.matcher(source);
      if (m.matches())
        color = m.group(1);
    }
    if(source.equals(ODPConvertConstants.CSS_VALUE_TRANSPARENT)){
  	  color = source;
    }
    return color;
  }
}
