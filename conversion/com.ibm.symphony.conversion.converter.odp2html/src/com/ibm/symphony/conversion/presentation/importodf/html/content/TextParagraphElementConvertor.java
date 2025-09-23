/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.presentation.importodf.html.content;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.logging.Logger;

import org.odftoolkit.odfdom.doc.draw.OdfDrawFrame;
import org.odftoolkit.odfdom.doc.style.OdfStyle;
import org.odftoolkit.odfdom.doc.style.OdfStyleParagraphProperties;
import org.odftoolkit.odfdom.doc.text.OdfTextListHeader;
import org.odftoolkit.odfdom.dom.element.OdfStylePropertiesBase;
import org.odftoolkit.odfdom.dom.style.props.OdfStylePropertiesSet;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.NamedNodeMap;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.w3c.dom.Text;

import com.ibm.symphony.conversion.presentation.CSSProperties;
import com.ibm.symphony.conversion.presentation.ODPConvertConstants;
import com.ibm.symphony.conversion.presentation.StackableProperties;
import com.ibm.symphony.conversion.presentation.importodf.ListLevelDetails;
import com.ibm.symphony.conversion.presentation.importodf.ODPConvertUtil;
import com.ibm.symphony.conversion.presentation.importodf.css.CSSConvertUtil;
import com.ibm.symphony.conversion.presentation.importodf.html.HtmlConvertUtil;

import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.HtmlCSSConstants;
import com.ibm.symphony.conversion.service.common.ODFConstants;
import com.ibm.symphony.conversion.service.common.shape2image.ODPConvertStyleMappingUtil;
import com.ibm.symphony.conversion.service.common.util.Measure;
import com.ibm.symphony.conversion.service.common.util.MeasurementUtil;

public class TextParagraphElementConvertor extends AbstractContentHtmlConvertor
{
  private static final String CLASS = TextParagraphElementConvertor.class.getName();

  private static final Logger log = Logger.getLogger(CLASS);
  
  private static final String PARAGRAPH_TAG = "P";
  
  private static final int TOP = 0; // index into marginValues array for margin-top

  private static final int BOT = 1; // index into marginValues array for margin-bottom
  
  private static final int LEFT = 2; // index into marginValues array for margin-left


  @Override
  protected void doConvertHtml(ConversionContext context, Node odfElement, Element htmlParent)
  {
    log.fine("Entering Import " + CLASS + ".doConvertHtml");

    double oldParentSize = (Double) context.get(ODPConvertConstants.CONTEXT_PARENT_SIZE);

    Element htmlElement = addHtmlElement(odfElement, htmlParent, context);
    // here the parent size in context will be changed.
    htmlElement = parseAttributes2(odfElement, htmlElement, context);
    
    Object contextObj = context
		.get(ODPConvertConstants.CONTEXT_TEXTLIST_HEADER_FLAG);
    if (contextObj != null && (Boolean) contextObj){
    	Integer outline_index = (Integer) context
			.get(ODPConvertConstants.CONTEXT_NEXT_OUTLINE_INDEX);
    	if (outline_index != null && outline_index.intValue() > 1) {
    		htmlElement.setAttribute(ODPConvertConstants.HTML_ATTR_LEVEL, ""
  					+ outline_index.intValue());
    	}
    }
    
    StackableProperties sp = (StackableProperties) context.get(ODPConvertConstants.CONTEXT_STACKABLE_PROPERTIES);
    if (sp != null)
    {
    	String absfontSize = null;
    	StackableProperties.Properties curr = sp.getCurrent();
        StackableProperties.StringProperty currFontSize = curr.getMap().get(ODPConvertConstants.CSS_FONT_SIZE);
    	if(currFontSize !=null ){
        	absfontSize = currFontSize.getValue();
        }
    	if(absfontSize != null)
    		setHtmlFontSize(htmlElement,Double.parseDouble(absfontSize),true,false);
    	else if(oldParentSize > 0){
    		setHtmlFontSize(htmlElement,oldParentSize,true,false);
    	}
    }    
    String presentationClassName = (String) context.get(ODPConvertConstants.CONTEXT_PARENT_PRESENTATION_CLASS);
    String newmpclass = null;
	if(presentationClassName != null&& presentationClassName.length()>0){
		ListLevelDetails listLevelDetails = (ListLevelDetails) context
		.get(ODPConvertConstants.CONTEXT_LIST_ITEM_LEVEL_DETAILS);
		if(listLevelDetails!=null && listLevelDetails.getLevel()>1){
			Object list_header = context
			.get(ODPConvertConstants.CONTEXT_TEXTLIST_HEADER_FLAG);
			if(list_header!=null && list_header.equals(true))
				newmpclass = getParagraphMasterClassName(context,listLevelDetails.getLevel());
		}
		else
			newmpclass = getParagraphMasterClassName(context,1);
		Node attr = htmlElement.getAttributeNode(ODPConvertConstants.HTML_ATTR_CLASS);
		String classAttr = attr.getNodeValue();
		classAttr += newmpclass;
		classAttr += ODPConvertConstants.SYMBOL_WHITESPACE;
		htmlElement.setAttribute(ODPConvertConstants.HTML_ATTR_CLASS,classAttr.toString());
	}
	
    // handle when we have a <text:list-header> that we changed into a <p>.  We need to set the 
    // margin-left for the <p> element in order to get the correct indentation for the level 
    // of the list we are in, since in ODF, this is a list item. 
    Object textListHeaderFlag = context.get(ODPConvertConstants.CONTEXT_TEXTLIST_HEADER_FLAG);
    if (textListHeaderFlag != null && (Boolean) textListHeaderFlag)
    {
      // make sure our parent is a <text:list-header>
      Node odfParent = odfElement.getParentNode();
      if (odfParent instanceof OdfTextListHeader)
      {
        ListLevelDetails listLevelDetails = (ListLevelDetails) context.get(ODPConvertConstants.CONTEXT_LIST_ITEM_LEVEL_DETAILS);
        if (listLevelDetails != null)
        {
          // add the space-before and min-label-width to get the value we need to indent  
          double marginLeft_d = listLevelDetails.getSpaceBefore() + listLevelDetails.getMinLabelWidth();

          if (Double.compare(marginLeft_d, 0.0) != 0)  // only need to set margin-left inline if its not zero
          {
            double containerWidth_d = Measure.extractNumber(ODPConvertUtil.getContainerWidth(context));
            double abs_margin_left = marginLeft_d;
            CSSProperties cp = new CSSProperties(htmlElement.getAttribute(ODPConvertConstants.HTML_ATTR_STYLE), true);
            // See if the <p> tag already has a margin-left on it, if so add our new property to it
            String inlineML = cp.getProperty(ODPConvertConstants.HTML_ATTR_MARGIN_LEFT);
            if (inlineML != null && inlineML.length() > 0)
            {
              // assume this will already be in percent
              double inlineML_d = Measure.extractNumber(inlineML);

              // calculate our new margin left in percent
              marginLeft_d = (marginLeft_d / containerWidth_d) * 100;

              // now add it to what was on the <p>, to get a total percentage
              marginLeft_d += inlineML_d;
            }
            else    // margin-left not in-line, check for it on the paragraph property
            {
              // get current margin-left that is in the paragraph style and add it to our new margin left.
              NamedNodeMap nodeMap = getParagraphProperties(context,odfElement);
              if (nodeMap != null)
              {
                Node odfMarginLeftNode = nodeMap.getNamedItem(ODFConstants.ODF_ATTR_FO_MARGIN_LEFT);
                if (odfMarginLeftNode != null)
                {
                  marginLeft_d += Measure.extractNumber(odfMarginLeftNode.getNodeValue());         
                }
              }
              abs_margin_left = marginLeft_d;
              marginLeft_d = (marginLeft_d / containerWidth_d) * 100;               
            }

            // Now set our new margin-left as an in-line style
            cp.setProperty(ODPConvertConstants.HTML_ATTR_MARGIN_LEFT, MeasurementUtil.formatDecimal(marginLeft_d) + ODPConvertConstants.SYMBOL_PERCENT);
            htmlElement.setAttribute(ODPConvertConstants.HTML_ATTR_STYLE, cp.getPropertiesAsString());
            CSSProperties cps = new CSSProperties(htmlElement.getAttribute(ODPConvertConstants.HTML_ATTR_CUSTOMSTYLE), true);
            cps.setProperty(ODPConvertConstants.HTML_ATTR_ABS+ODPConvertConstants.HTML_ATTR_MARGIN_LEFT, MeasurementUtil.formatDecimal(abs_margin_left*1000,0));
            htmlElement.setAttribute(ODPConvertConstants.HTML_ATTR_CUSTOMSTYLE, cps.getPropertiesAsString());

          }
        }
      }
    }
 
    setMargins(context, htmlElement);
    //add 'rtl' qualifyer to class name, change left-margin style to right-margin and add direction style if paragraph has rtl direction
    String direction = HtmlConvertUtil.getDirectionAttr(context, odfElement, false);
    if(HtmlCSSConstants.RTL.equalsIgnoreCase(direction)) {
    	String pAttr = htmlElement.getAttribute(ODPConvertConstants.HTML_ATTR_STYLE);
    	pAttr = pAttr.replaceAll(ODPConvertConstants.HTML_ATTR_MARGIN_LEFT, HtmlCSSConstants.MARGIN_RIGHT);
    	pAttr = HtmlCSSConstants.DIRECTION + ODPConvertConstants.SYMBOL_COLON + ODPConvertConstants.SYMBOL_WHITESPACE +
    			HtmlCSSConstants.RTL + ODPConvertConstants.SYMBOL_SEMICOLON + pAttr;
    	htmlElement.setAttribute(ODPConvertConstants.HTML_ATTR_STYLE, pAttr);
    }

    convertChildren(context, odfElement, htmlElement);
    
    if(!odfElement.hasChildNodes()){// add empty span for p
    	NodeList nodeList = htmlElement.getChildNodes();
    	if(nodeList != null && nodeList.getLength() == 1){ // for delete nbsp element
    		Node n = nodeList.item(0);
    		htmlElement.removeChild(n);
    		Document htmlDoc = (Document) context.getTarget();
    		Element span = createHtmlElement(context, odfElement, htmlDoc,
    				ODPConvertConstants.HTML_ELEMENT_SPAN);
    		span.setAttribute(ODPConvertConstants.HTML_ATTR_STYLE, "font-size:1.0em; ");
    		Text t = htmlDoc.createTextNode("\u200b");
    		span.appendChild(t);
    		htmlElement.appendChild(span);
    	}
    }
    
    context.put(ODPConvertConstants.CONTEXT_PARENT_SIZE, oldParentSize);
    
  }

  /**
   * Get the attributes of the ODF paragraph properties
   * 
   * @param context - Conversion context
   * @param element - current ODF element
   * 
   * @return NamedNodeMap  Null if paragraph properties are not found
   */
  public static NamedNodeMap getParagraphProperties(ConversionContext context, Node element)
  {
    String key =  HtmlConvertUtil.getStyleValue(element);

    List<Node> nodeList = ODPConvertStyleMappingUtil.getAllStyleNameNodesByKey(context, key);
    if (nodeList != null && nodeList.size() > 0)
    {
      int size = nodeList.size();
      for (int i = 0; i < size; i++)
      {
        Node node = nodeList.get(i);
        NodeList children = node.getChildNodes();
        for (int j = 0; j < children.getLength(); j++)
        {
          Node child = children.item(j);
          if (child instanceof OdfStyleParagraphProperties)
          {
            return child.getAttributes();
          }
        }
      }
    }
    return null;
  }
 
  /**
   * Set the margin top, bottom, and left for the paragraph. The order that is being checked: - inline style of the current item - part of any
   * paragraph style of current element and parents - master style
   * 
   * @param context
   *          Conversion context
   * @param htmlElement
   *          Element to set margin top, bottom, and left
   */
  private void setMargins(ConversionContext context, Element htmlElement)
  {

    String[] marginValues = { "", "", "" }; // [margin-top] [margin-bottom] [margin-left] 

    // Go through the elements looking for margin, margin-top, margin-bottom, and margin-left
    // defined as an inline style.
    // NOTE: For now there will be DIVs before the draw_frame in certain instances so don't
    // just check blindly for DIVs as you walk up the chain.

    // Check if margin is defined on the current element inline style
    String styleAttr = htmlElement.getAttribute(ODPConvertConstants.HTML_ATTR_STYLE);
    String[] inlineStyles = styleAttr.split(ODPConvertConstants.SYMBOL_SEMICOLON);
    for (String inlineStyle : inlineStyles)
    {
      if (inlineStyle.contains(ODPConvertConstants.HTML_ATTR_MARGIN_TOP) && !isMarginSpecified(marginValues[TOP]))
      {
        marginValues[TOP] = inlineStyle;
      }
      else if (inlineStyle.contains(ODPConvertConstants.HTML_ATTR_MARGIN_BOTTOM) && !isMarginSpecified(marginValues[BOT]))
      {
        marginValues[BOT] = inlineStyle;
      }
      else if (inlineStyle.contains(ODPConvertConstants.HTML_ATTR_MARGIN_LEFT) && !isMarginSpecified(marginValues[LEFT]))
      {
        marginValues[LEFT] = inlineStyle;
      }
      else if (inlineStyle.contains(ODPConvertConstants.HTML_ATTR_MARGIN + ":"))
      {
        inlineStyle = inlineStyle.substring(inlineStyle.indexOf(":") + 1);
        String[] margins = inlineStyle.split(" ");

        if (!isMarginSpecified(marginValues[TOP]))
          marginValues[TOP] = ODPConvertConstants.HTML_ATTR_MARGIN_TOP + ":" + margins[0];

        if (!isMarginSpecified(marginValues[BOT]))
        {
          if (marginValues.length >= 3)
            marginValues[BOT] = ODPConvertConstants.HTML_ATTR_MARGIN_BOTTOM + ":" + margins[2];
          else
            marginValues[BOT] = ODPConvertConstants.HTML_ATTR_MARGIN_BOTTOM + ":" + margins[0]; // same as top
        }
        
        if (!isMarginSpecified(marginValues[LEFT]))
        {
          if (marginValues.length > 3)
            marginValues[LEFT] = ODPConvertConstants.HTML_ATTR_MARGIN_LEFT + ":" + margins[3];
          else if (marginValues.length == 1) 
            marginValues[LEFT] = ODPConvertConstants.HTML_ATTR_MARGIN_LEFT + ":" + margins[0]; // same as top
          else
            marginValues[LEFT] = ODPConvertConstants.HTML_ATTR_MARGIN_LEFT + ":" + margins[1]; // same as right
        }
      }
    }

    // If we didn't find marginTop, marginBottom, and marginLeft on the inline styles, look in the class
    if (!areAllMarginsSpecified(marginValues))
    {
      // still missing margin-top and/or margin-bottom and/or margin-left. Next lets look for it on the class style
      String classAttr = htmlElement.getAttribute(ODPConvertConstants.HTML_ATTR_CLASS);
      String[] pStyles = classAttr.split(ODPConvertConstants.SYMBOL_WHITESPACE);

      Map<String, Map<String, String>> styles = CSSConvertUtil.getStyles(context);

      for (int i = 0; i < pStyles.length; i++)
      {
        // If there are others styles other then paragraph that we need to consider, update
        if (isParagraphStyle(pStyles[i]))
        {
          // Grab CSS content style since calculations have already been done from cm to percent
          String styleName = CSSConvertUtil.getStyleName(pStyles[i]);

          // Currently the styles contain a space in the key. Convert to ConvertUtils getStyleName
          if (styles != null && styles.containsKey(styleName))
          {
            Map<String, String> styleMap = styles.get(styleName);
            CSSProperties cps = new CSSProperties(htmlElement.getAttribute(ODPConvertConstants.HTML_ATTR_CUSTOMSTYLE), true);

            if (styleMap != null)
            {
              String marginT = styleMap.get(ODPConvertConstants.HTML_ATTR_MARGIN_TOP);
              if (marginT != null && marginT.length() > 0)
              {
                if (!isMarginSpecified(marginValues[TOP]))
                  marginValues[TOP] = ODPConvertConstants.HTML_ATTR_MARGIN_TOP + ":" + marginT;
              }
              String marginB = styleMap.get(ODPConvertConstants.HTML_ATTR_MARGIN_BOTTOM);
              if (marginB != null && marginB.length() > 0)
              {
                if (!isMarginSpecified(marginValues[BOT]))
                  marginValues[BOT] = ODPConvertConstants.HTML_ATTR_MARGIN_BOTTOM + ":" + marginB;
              }
              String marginL = styleMap.get(ODPConvertConstants.HTML_ATTR_MARGIN_LEFT);
              String absMarginL = styleMap.get(ODPConvertConstants.HTML_ATTR_ABS_MARGIN_LEFT);
              double absMarginL_d = Measure.extractNumber(absMarginL);

              if (marginL != null && marginL.length() > 0)
              {
                if (!isMarginSpecified(marginValues[LEFT])){
                  marginValues[LEFT] = ODPConvertConstants.HTML_ATTR_MARGIN_LEFT + ":" + marginL;
                  cps.setProperty(ODPConvertConstants.HTML_ATTR_ABS+ODPConvertConstants.HTML_ATTR_MARGIN_LEFT, MeasurementUtil.formatDecimal(absMarginL_d*1000,0));
                }
              }
              
              String absTextIndent = styleMap.get(ODPConvertConstants.HTML_ATTR_ABS_TEXT_INDENT);
              if(absTextIndent != null && absTextIndent.length() > 0){
              	double absTextIndent_d = Measure.extractNumber(absTextIndent);
                cps.setProperty(ODPConvertConstants.HTML_ATTR_ABS+ODPConvertConstants.CSS_TEXT_INDENT, MeasurementUtil.formatDecimal(absTextIndent_d*1000,0));

              }
            }
            if(cps.size()>0)
            	htmlElement.setAttribute(ODPConvertConstants.HTML_ATTR_CUSTOMSTYLE, cps.getPropertiesAsString());

          }
        }
      }
    }

    // If we still haven't found them, check the draw-frame/draw-shape/table-cell and check those classes and presentation styles
    if (!areAllMarginsSpecified(marginValues))
    {
      // find our parent <div> for draw_frame or draw_shape or table-cell
      Element tempElement = (Element) htmlElement.getParentNode(); // start at the <p>'s parent
      while (tempElement != null && !isDrawFrameDIV(tempElement) && !tempElement.getNodeName().equals(HtmlCSSConstants.TD))
      {
        Node parentNode = tempElement.getParentNode();
        if (parentNode instanceof Element)
          tempElement = (Element) tempElement.getParentNode();
        else
          tempElement = null;
      }
      if (tempElement != null)
      {
        String[] classesStyleMargins = getClassesStyleMargins(context, tempElement, marginValues);
        if (classesStyleMargins != null)
        {
          for (String marginValue : classesStyleMargins)
          {
            if (marginValue.contains(ODPConvertConstants.HTML_ATTR_MARGIN_TOP) && !isMarginSpecified(marginValues[TOP]))
            {
              marginValues[TOP] = marginValue;
            }
            else if (marginValue.contains(ODPConvertConstants.HTML_ATTR_MARGIN_BOTTOM) && !isMarginSpecified(marginValues[BOT]))
            {
              marginValues[BOT] = marginValue;
            }
            else if (marginValue.contains(ODPConvertConstants.HTML_ATTR_MARGIN_LEFT) && !isMarginSpecified(marginValues[LEFT]))
            {
              marginValues[LEFT] = marginValue;
            }
          }
        }
      }
    }

    // adjust this <p>'s margin-top to include the margin-bottom from the previous sibling. This needs to be done because
    // of how css does "margin collapsing".

    // TODO: (rhaugen) This isn't a full implementation of the margin collapse problem - this only fixes it for adjacent
    // paragraph items in the same parent, but margin collapsing happens between ANY adjacent elements: spanning lists, paragraph's..etc
    // so this issue needs to be handled on a much larger scale - and when that happens, this code should be able to be removed

    if (isMarginSpecified(marginValues[TOP]))
    {
      Boolean ParagraphSummation = (Boolean) context.get("ParagraphSummation");
      Element prevSib = (Element) htmlElement.getPreviousSibling();
      if (prevSib != null && ParagraphSummation != null && ParagraphSummation)
      {

        // Check if margin-bottom is defined as an inline style on the previous LI element
        styleAttr = prevSib.getAttribute(ODPConvertConstants.HTML_ATTR_STYLE);
        inlineStyles = styleAttr.split(ODPConvertConstants.SYMBOL_SEMICOLON);
        for (String inlineStyle : inlineStyles)
        {
          if (inlineStyle.contains(ODPConvertConstants.HTML_ATTR_MARGIN_BOTTOM))
          {
            // add the previous margin-bottom to our margin-top so we get the right spacing between elements
            Double prevMarginBottom = Double.parseDouble(inlineStyle.substring(inlineStyle.indexOf(":") + 1, inlineStyle.length() - 1));
            Double currentMarginTop = Double.parseDouble(marginValues[TOP].substring(marginValues[TOP].indexOf(":") + 1,
                marginValues[TOP].length() - 1));
            Double newMarginTop = prevMarginBottom + currentMarginTop;
            marginValues[TOP] = ODPConvertConstants.HTML_ATTR_MARGIN_TOP + ":" + newMarginTop + "%;";
            break;
          }
        }
      }
    }

    // Finally, if the <p> doesn't already have margin-top/bottom/left, add it if one of our parents has it

    String pStyle = htmlElement.getAttribute(ODPConvertConstants.HTML_ATTR_STYLE);
    pStyle = pStyle.replace("{", "");
    pStyle = pStyle.replace("}", "");

    if (!pStyle.contains(ODPConvertConstants.HTML_ATTR_MARGIN_TOP))
    {
      if (isMarginSpecified(marginValues[TOP]))
      {
        pStyle += marginValues[TOP] + ODPConvertConstants.SYMBOL_SEMICOLON;
      }
    }

    if (!pStyle.contains(ODPConvertConstants.HTML_ATTR_MARGIN_BOTTOM))
    {
      if (isMarginSpecified(marginValues[BOT]))
      {
        pStyle += marginValues[BOT] + ODPConvertConstants.SYMBOL_SEMICOLON;
      }
    }
    
    if (!pStyle.contains(ODPConvertConstants.HTML_ATTR_MARGIN_LEFT))
    {
      if (isMarginSpecified(marginValues[LEFT]))
      {
        pStyle += marginValues[LEFT] + ODPConvertConstants.SYMBOL_SEMICOLON;
      }
    }

    htmlElement.setAttribute(ODPConvertConstants.HTML_ATTR_STYLE, pStyle);
  }
  
  /**
   * Check if the style is a paragraph style.
   * 
   * @param style
   *          Style name to check
   * @return True if paragraph style
   */
  private boolean isParagraphStyle(String style)
  {
    // For now just checking to see if the style starts with P
    // Modify in future to actually check type of style
    if (style.startsWith(PARAGRAPH_TAG))
    {
      return true;
    }

    return false;
  }
  
  /**
   * Determine if the marginValues contain margin-top, margin-bottom, and margin-left
   * 
   * @param marginValues
   * @return boolean - true if it contains all values, false otherwise
   */
  private boolean areAllMarginsSpecified(String[] marginValues)
  {
    boolean found = false;
    if (marginValues != null && marginValues.length == 3)
    {
      found = isMarginSpecified(marginValues[TOP]) && isMarginSpecified(marginValues[BOT]) && isMarginSpecified(marginValues[LEFT]);
    }

    return found;
  }

  /**
   * Determine if the specific marginValue is specified
   * 
   * @param String
   * @return boolean - true if it has a non-empty string
   */
  private boolean isMarginSpecified(String marginValue)
  {
    if (marginValue != null && marginValue.length() > 0)
      return true;
    else
      return false;
  }
  
  /**
   * Check if the current element is a draw frame or draw shape.
   * 
   * Looks to see if the element is a div and has the draw_frame_classes or draw_shape_classes in the class attribute
   * 
   * @param htmlElement
   *          Element to check if the draw frame element
   * @return True if the draw frame div else false
   */
  private boolean isDrawFrameDIV(Element htmlElement)
  {

    // Return false if not a DIV or if it is a DIV, not the draw_frame_classes DIV
    if (!htmlElement.getLocalName().equalsIgnoreCase(ODPConvertConstants.HTML_ELEMENT_DIV))
    {
      return false;
    }
    else
    {
      // Walk through the class attribute looking for the frame_classes element
      // Grab the master style defined in that class
      NamedNodeMap attributes = htmlElement.getAttributes();
      for (int i = 0; i < attributes.getLength(); i++)
      {
        Node attr = attributes.item(i);
        String nodeName = attr.getNodeName();
        String nodeValue = attr.getNodeValue();

        if (nodeName.equals(ODPConvertConstants.HTML_ATTR_CLASS))
        {
          if (nodeValue.contains(ODPConvertConstants.HTML_VALUE_DRAW_FRAME_CLASSES)
              || nodeValue.contains(ODPConvertConstants.HTML_CLASS_DRAW_SHAPE_CLASSES)
              || nodeValue.contains(ODPConvertConstants.HTML_VALUE_DRAW_FRAME))
          {
            return true;
          }
        }
      }
    }

    return false;
  }

  /**
   * Get the margin top, bottom, and left values from the styles listed in the class value of the htmlElement
   * 
   * @param context
   *          - the current context
   * @param htmlElement
   *          - the htmlElement containing draw_frame_classes/draw_shape_classes
   * @param marginValues
   *          - the current margin values.
   * @return String[] margin values. 
   */
  private String[] getClassesStyleMargins(ConversionContext context, Node htmlElement, String[] marginValues)
  {
    // Get the draw_frame_classes or table cell classes and check each of the styles listed (and their parents) for
    // margin top or margin bottom or margin left values
    String classValue = ((Element) htmlElement).getAttribute(ODPConvertConstants.HTML_ATTR_CLASS);
    if (classValue.contains(ODPConvertConstants.HTML_VALUE_DRAW_FRAME_CLASSES)
        || classValue.contains(ODPConvertConstants.HTML_CLASS_DRAW_SHAPE_CLASSES)
        || classValue.contains(ODPConvertConstants.HTML_ATTR_TABLE_CELL))
    {
      String[] classes = classValue.split(" ");
      ArrayList<String> stylesChecked = new ArrayList<String>();

      for (int i = classes.length - 1; i > 0; --i)
      {
        String styleName = classes[i];
        if (styleName.equals(ODPConvertConstants.HTML_VALUE_DRAW_FRAME_CLASSES)
            || styleName.equals(ODPConvertConstants.HTML_CLASS_DRAW_SHAPE_CLASSES)
            || styleName.equals(ODPConvertConstants.HTML_ATTR_TABLE_CELL))
          break;
        marginValues = getStyleMargins(context, styleName, stylesChecked, marginValues);
        if (areAllMarginsSpecified(marginValues))
          break;
      }
    }
    return marginValues;
  }
  
  /**
   * Get the Style Margin Top, Bottom, and Left values from the named style or any of its parent styles
   * 
   * @param context
   *          - the current context
   * @param styleName
   *          - the style name so start checking on
   * @param stylesChecked
   *          - the list of styles checked thus far. Additional styles checked will be added
   * @param marginValues
   *          - the current list of margin values
   * @return String[] margin values. null if none found in the styleName or its parent styles.
   */
  @SuppressWarnings("restriction")
  private String[] getStyleMargins(ConversionContext context, String styleName, ArrayList<String> stylesChecked, String[] marginValues)
  {
    int end = styleName.indexOf("_");
    if (end != -1 && styleName.contains("CDUP")) // If CDUP style, use the original name since we are working with the ODF nodes
    {
      styleName = styleName.substring(0, end);
    }
    if (stylesChecked.contains(styleName))
      return marginValues; // Already checked this one, just return the current margin values

    stylesChecked.add(styleName); // We're checking this one so save it off to prevent checking it again


    @SuppressWarnings("unchecked")
    Map<String, OdfStyle> odfAutoStyleMap = (Map<String, OdfStyle>) context.get(ODPConvertConstants.CONTEXT_AUTOSTYLE_NODES_MAP);
    @SuppressWarnings("unchecked")
    Map<String, List<Node>> odfStyleMap = (Map<String, List<Node>>) context.get(ODPConvertConstants.CONTEXT_SYTLENAME_NODES_MAP_IN_STYLE);

    // First check for the automatic styles in the autostyle nodes map
    OdfStyle node = null;
    if (odfAutoStyleMap != null)
      node = odfAutoStyleMap.get(styleName);

    if (node == null)
    {
      // Now check for the style in the Styles style nodes map
      List<Node> nodeList = odfStyleMap.get(styleName);
      if (nodeList != null && nodeList.size() > 0)
      {
        // Should only be a single style with this name
        node = (OdfStyle) nodeList.get(0);
      }
    }

    if (node != null)
    {
      // Check if this style has margin values
      marginValues = getMarginValues(context, node, marginValues);
      // If we didn't find all margin values here then go up checking each parent style
      if (!areAllMarginsSpecified(marginValues))
      {
        String parentStyleName = node.getAttribute(ODPConvertConstants.ODF_ATTR_PARENT_STYLE_NAME);
        parentStyleName = ODPConvertStyleMappingUtil.getCanonicalStyleName(parentStyleName);
        Integer listLevel = (Integer) context.get(ODPConvertConstants.CONTEXT_NEXT_OUTLINE_INDEX);
        if (listLevel == null)
          listLevel = 1;
        while (parentStyleName != null && parentStyleName.length() > 0)
        {
          // If the parent is an outline style, ensure we check for the correct outline based on our
          // outline index
          if (parentStyleName.endsWith("-outline1") && listLevel != 1)
          {
            parentStyleName = parentStyleName.replace("-outline1", "-outline" + listLevel);
          }
          // Verify we haven't checked this one yet
          if (!stylesChecked.contains(parentStyleName))
          {
            OdfStyle parentStyle = null;
            // We're checking this parent so save it off to prevent checking it again
            stylesChecked.add(parentStyleName);
            // Get the parent style
            List<Node> nodeList = odfStyleMap.get(parentStyleName);
            if (nodeList != null && nodeList.size() > 0)
            {
              // Should only be a single style with this name
              parentStyle = (OdfStyle) nodeList.get(0);
            }
            if (parentStyle != null)
            {
              // Check if this parent contains margin values
              marginValues = getMarginValues(context, parentStyle, marginValues);
              if (areAllMarginsSpecified(marginValues))
                break; // Found our margin values, no more parents to check
              else
              { // Get the next parent style to check
                parentStyleName = parentStyle.getAttribute(ODPConvertConstants.ODF_ATTR_PARENT_STYLE_NAME);
                parentStyleName = ODPConvertStyleMappingUtil.getCanonicalStyleName(parentStyleName);
                
                if (parentStyleName.endsWith("-outline1"))
                  listLevel = 1; // This time we do want to actually check outline level 1
              }
            }
            else
            {
              break; // No more parents to check
            }
          }
          else
          {
            break;
          }
        }
      }
    }
    return marginValues;
  }
  
  /**
   * Get the margin top, bottom, and left values from the ODF node with the given styleName
   * 
   * @param context
   *          - the current context
   * @param odfStyle
   *          - the style to look for margins in
   * @param currentMargins
   *          - the current margins found
   * @return String[] containing margin top, bottom, and left values
   */
  private String[] getMarginValues(ConversionContext context, OdfStyle odfStyle, String[] currentMargins)
  {
    // Get the paragraph properties of the master style
    OdfStylePropertiesBase paragraphProperties = odfStyle.getPropertiesElement(OdfStylePropertiesSet.ParagraphProperties);

    if (paragraphProperties == null)
    {
      return currentMargins; // return unchanged
    }

    @SuppressWarnings("restriction")
    Node topMarginAttr = paragraphProperties.getAttributeNode(ODPConvertConstants.ODF_ATTR_FO_MARGIN_TOP);
    if (topMarginAttr != null && !isMarginSpecified(currentMargins[TOP]))
    {
      String convertedMarginTop = MeasurementUtil.convertCMToPercentage(topMarginAttr, context);
      currentMargins[TOP] = "margin-top:" + convertedMarginTop;
    }

    @SuppressWarnings("restriction")
    Node bottomMarginAttr = paragraphProperties.getAttributeNode(ODPConvertConstants.ODF_ATTR_FO_MARGIN_BOTTOM);
    if (bottomMarginAttr != null && !isMarginSpecified(currentMargins[BOT]))
    {
      String convertedMarginBottom = MeasurementUtil.convertCMToPercentage(bottomMarginAttr, context);
      currentMargins[BOT] = "margin-bottom:" + convertedMarginBottom;
    }

    @SuppressWarnings("restriction")
    Node leftMarginAttr = paragraphProperties.getAttributeNode(ODPConvertConstants.ODF_ATTR_FO_MARGIN_LEFT);
    if (leftMarginAttr != null && !isMarginSpecified(currentMargins[LEFT]))
    {
      String convertedMarginLeft = MeasurementUtil.convertCMToPercentage(leftMarginAttr, context);
      currentMargins[LEFT] = "margin-left:" + convertedMarginLeft;
    }
    
    return currentMargins;
  }

}
