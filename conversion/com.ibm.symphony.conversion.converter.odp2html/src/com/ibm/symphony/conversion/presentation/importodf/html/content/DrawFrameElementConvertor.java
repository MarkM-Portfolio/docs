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

import java.util.HashSet;
import java.util.Map;
import java.util.logging.Logger;

import org.odftoolkit.odfdom.OdfElement;
import org.odftoolkit.odfdom.dom.element.draw.DrawFrameElement;
import org.odftoolkit.odfdom.dom.element.draw.DrawImageElement;
import org.odftoolkit.odfdom.dom.element.draw.DrawObjectOleElement;
import org.odftoolkit.odfdom.dom.element.presentation.PresentationDateTimeElement;
import org.odftoolkit.odfdom.dom.element.presentation.PresentationFooterElement;
import org.odftoolkit.odfdom.dom.element.style.StyleMasterPageElement;
import org.odftoolkit.odfdom.dom.element.svg.SvgDescElement;
import org.odftoolkit.odfdom.dom.element.svg.SvgTitleElement;
import org.odftoolkit.odfdom.dom.element.table.TableTableElement;
import org.odftoolkit.odfdom.dom.element.text.TextListElement;
import org.odftoolkit.odfdom.dom.element.text.TextPElement;
import org.odftoolkit.odfdom.dom.element.text.TextPageNumberElement;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

import com.ibm.symphony.conversion.presentation.ODPConvertConstants;
import com.ibm.symphony.conversion.presentation.importodf.ODPConvertUtil;
import com.ibm.symphony.conversion.presentation.importodf.css.CSSConvertUtil;
import com.ibm.symphony.conversion.presentation.importodf.html.HtmlConvertUtil;
import com.ibm.symphony.conversion.service.common.ConversionContext;

public class DrawFrameElementConvertor extends GeneralContentHtmlConvertor
{
  private static final String CLASS = DrawFrameElementConvertor.class.getName();

  private static final Logger log = Logger.getLogger(CLASS);

  private static final String FOOTER = "footer";

  private static final String PAGE_NUMBER = "page-number";

  private static final String DATE_TIME = "date-time";

  // Default Initial Capacity for the Presentation Classes HashSet
  private static final int PRESENTATION_CLASSES_SET_CAPACITY = (int) (3 * 1.33) + 1;

  private static final HashSet<String> cvPresentationClasses = new HashSet<String>(PRESENTATION_CLASSES_SET_CAPACITY);
  static
  {
    cvPresentationClasses.add(FOOTER);
    cvPresentationClasses.add(PAGE_NUMBER);
    cvPresentationClasses.add(DATE_TIME);
  }

  @Override
  protected void doConvertHtml(ConversionContext context, Node odfElement, Element htmlParent)
  {
    if (ODPConvertConstants.DEBUG)
    {
      log.fine("Entering Import " + CLASS + ".doConvertHtml");
    }

    OdfElement parent = (OdfElement) context.get(ODPConvertConstants.CONTEXT_PARENT_ELEMENT);
    setFrameContext(context, odfElement);
    if (parent instanceof StyleMasterPageElement)
    {
      convertForMaster(context, odfElement, htmlParent);
    }
    else
    {
    	convertListMasterStyle(context);
    	convertParagraphMasterStyle(context);
      // do the normal convert
    	context.put(ODPConvertConstants.ODF_DRAW_FRAME_ELEMENT, odfElement);
    	super.doConvertHtml(context, odfElement, htmlParent);
    	context.remove(ODPConvertConstants.ODF_DRAW_FRAME_ELEMENT);     
    }

    context.remove(ODPConvertConstants.CONTEXT_PARENT_WIDTH);
    context.remove(ODPConvertConstants.CONTEXT_OUTLINE_FONTSIZE_MAP);
    context.remove(ODPConvertConstants.CONTEXT_LIST_OUTLINE_STYLE_NAME);
    context.remove(ODPConvertConstants.CONTEXT_TEXTLIST_START_VALUE);
    context.remove(ODPConvertConstants.CONTEXT_INSIDE_CHART);

  }
  
  private void convertParagraphMasterStyle(ConversionContext context){
  	String preClassName = (String)context.get(ODPConvertConstants.CONTEXT_PARENT_PRESENTATION_CLASS);
  	if(preClassName == null)
  		return;
  	String master_name = (String)context.get(ODPConvertConstants.CONTEXT_DRAWPAGE_MASTER_NAME);
    if(preClassName.equals("outline")){
    	for(int index = 1; index <=10; index++)
    		HtmlConvertUtil.mergeParagraphMasterClass(master_name, preClassName, index, context);
    }
    else if(preClassName.length()>0){
    	HtmlConvertUtil.copyMasterGeneralStyle(master_name, preClassName, context);
    }
  }
  
  
  private void convertListMasterStyle(ConversionContext context){
  	String preClassName = (String)context.get(ODPConvertConstants.CONTEXT_PARENT_PRESENTATION_CLASS);
    if(preClassName.equals("outline")){
    	String master_name = (String)context.get(ODPConvertConstants.CONTEXT_DRAWPAGE_MASTER_NAME);
    	for(int index = 1; index <=10; index++)
    		HtmlConvertUtil.convertListMasterStyle(master_name, preClassName, context, index);
    }
  }
  

  @SuppressWarnings({ "restriction", "unchecked" })
  private void convertForMaster(ConversionContext context, Node element, Element htmlParent)
  {
    DrawFrameElement drawFrame = (DrawFrameElement) element;
    String presentationClass = drawFrame.getAttribute("presentation:class");
    // Defect 5409: Element in styles.xml was not being displayed in editor.
    // If we have a presentation:class only process it if it a "footer" element.
    // This excludes title, outline, subtitle, etc presentation classes which
    // are handled elsewhere.
    // Otherwise (else leg) process everything else.
    boolean showFromMaster = false;
    if ((presentationClass == null) || (presentationClass.length() == 0))
    {
      showFromMaster = true;
      presentationClass = getFooterField(context, element);
    }
    if ((presentationClass != null) && (presentationClass.length() > 0))
    {
      if (cvPresentationClasses.contains(presentationClass))
      {

        double oldParentSize = (Double) context.get(ODPConvertConstants.CONTEXT_PARENT_SIZE);

        OdfElement styleNode = (OdfElement) context.get(ODPConvertConstants.CONTEXT_CURRENT_STYLE_NODE);

        Map<String, String> headFootMap = (Map<String, String>) context.get("drawpage-header-footers");

        String headFootStyle = (String) context.get("draw-page-" + presentationClass + "-style");
        String headFootValue = null;
        if (headFootStyle != null)
        {
          headFootValue = headFootMap.get(headFootStyle);
        }
        else
        {
          // is a page number class.
          headFootValue = (String) context.get(ODPConvertConstants.CONTEXT_DRAWPAGE_PAGE_NUMBER);
        }
        String showHeadFootStr = "";
        if (styleNode != null)
        {
          showHeadFootStr = CSSConvertUtil.getStyleAttribute(styleNode, "presentation:display-" + presentationClass);
        }
        boolean showHeadFoot = (showHeadFootStr.length() == 0) ? false : Boolean.parseBoolean(showHeadFootStr) || showFromMaster;

        // If there is supposed to be a header/footer, and a header/footer value is not found, we need to force a default value
        if ((showHeadFoot) && (headFootValue == null))
        {
          headFootValue = "";
        }

        context.put(ODPConvertConstants.CONTEXT_PARENT_SIZE, 0.0);
        context.put(ODPConvertConstants.CONTEXT_HEAD_FOOT_VALUE, headFootValue);
        context.put(ODPConvertConstants.CONTEXT_SHOW_HEAD_FOOT, showHeadFoot);
        context.put(ODPConvertConstants.CONTEXT_HEAD_FOOT_STYLE, headFootStyle);
        context.put(ODPConvertConstants.CONTEXT_PROCESSING_FOOTERS, true);
        context.put(ODPConvertConstants.CONTEXT_PROCESSING_FOOTER_TYPE, presentationClass);

        parseForMasterElement(drawFrame, htmlParent, context);

        context.put(ODPConvertConstants.CONTEXT_PROCESSING_FOOTERS, false);
        context.put(ODPConvertConstants.CONTEXT_PARENT_SIZE, oldParentSize);
        context.remove(ODPConvertConstants.CONTEXT_HEAD_FOOT_VALUE);
        context.remove(ODPConvertConstants.CONTEXT_SHOW_HEAD_FOOT);
        context.remove(ODPConvertConstants.CONTEXT_HEAD_FOOT_STYLE);
        context.remove(ODPConvertConstants.CONTEXT_PROCESSING_FOOTER_TYPE);
      }
    }
    else
    {
      boolean parentInStyleProcessing = (Boolean) context.get(ODPConvertConstants.CONTEXT_IN_STYLE);
      context.put(ODPConvertConstants.CONTEXT_IN_STYLE, true);
      parseForMasterElement1(element, htmlParent, context);
      context.put(ODPConvertConstants.CONTEXT_IN_STYLE, parentInStyleProcessing);
    }
  }

  /**
   * 
   * @param context
   *          - conversion context
   * @param node
   *          - node to check to see if it is part of the footer (page-number, date-time or footer text)
   * @return footer, page-number, date-time string or null if not found
   */
  private String getFooterField(ConversionContext context, Node node)
  {
    NodeList children = node.getChildNodes();
    for (int i = 0; i < children.getLength(); i++)
    {
      Node child = children.item(i);
      if (child.getNodeName().equalsIgnoreCase(ODPConvertConstants.ODF_ATTR_PRESENTATION_FOOTER))
      {
        return ODPConvertConstants.ODF_ATTR_FOOTER_FIELD_FOOTER;
      }
      if (child.getNodeName().equalsIgnoreCase(ODPConvertConstants.ODF_ATTR_PRESENTATION_DATETIME))
      {
        return ODPConvertConstants.ODF_ATTR_FOOTER_FIELD_DATETIME;
      }
      if (child.getNodeName().equalsIgnoreCase(ODPConvertConstants.ODF_ATTR_PRESENTATION_PAGENUMBER))
      {
        return ODPConvertConstants.ODF_ATTR_FOOTER_FIELD_PAGENUMBER;
      }
      else
      {
        String footerField = getFooterField(context, child);
        if (footerField != null)
          return footerField;
      }

    }
    return null;
  }

  /**
   * Parameter
   * 
   */
  public void parseForMasterElement1(Node element, Element htmlParent, ConversionContext context)
  {
    Element targetNode = null;

    // Note: In the future, we should consider implementing a HashMap convertor factory for use
    // in this method once we start supporting additional convertors.
    if (element instanceof TableTableElement)
    {
      new TableTableElementConvertor().doConvertHtml(context, element, htmlParent);
      targetNode = (Element) context.get("target-html-node");
    }
    else if (element instanceof SvgTitleElement || element instanceof SvgDescElement)
    {
      // svg:title and svg:desc should be treated as alt text
      new SVGTitleDescConvertor().doConvertHtml(context, element, htmlParent);
    }
    else if (element instanceof DrawImageElement)
    {
      // Draw image should be converted as "background" image
      new DrawImageElementConvertor().doConvertHtml(context, element, htmlParent);
    }
    else if (HtmlConvertUtil.isShape(element))
    {
      // Convert the shape as "background" image
      new ShapeElementConvertor().doConvertHtml(context, element, htmlParent);
    }
    else if (element instanceof TextListElement)
    {
      // Convert the list
      new TextListElementConvertor().doConvertHtml(context, element, htmlParent);
    }
    else if (element instanceof TextPElement)
    {
      // Convert the paragraph
      new TextParagraphElementConvertor().doConvertHtml(context, element, htmlParent);
    }
    else if (element instanceof DrawObjectOleElement)
    {
      // Just return (defect 11601) - no need to convert this element or preserve it - it
      // has no relevance to the HTML being generated. We assume that there is a "replacement"
      // object associated with this element - that will be used to display the image.
      return;
    }
    else
    {
      targetNode = addHtmlElement(element, htmlParent, context);
      targetNode = parseAttributes(element, targetNode, context);
    }
    // mapping ODF attributes to HTML attributes
    if (!element.hasChildNodes() || targetNode == null)
      return;
    NodeList childrenNodes = element.getChildNodes();
    int childrenNum = childrenNodes.getLength();
    for (int i = 0; i < childrenNum; i++)
    {
      Node node = (Node) childrenNodes.item(i);
      parseForMasterElement1(node, targetNode, context);
    }
  }

  @SuppressWarnings("unchecked")
  private void parseForMasterElement(Node currNode, Element htmlParent, ConversionContext context)
  {
    Element targetNode = null;

    double oldParentSize = (Double) context.get(ODPConvertConstants.CONTEXT_PARENT_SIZE);

    if ((currNode instanceof PresentationFooterElement || currNode instanceof PresentationDateTimeElement || currNode instanceof TextPageNumberElement))
    {
    	Element targetElement = htmlParent;
      if (currNode instanceof PresentationDateTimeElement)
      {
        setLocaleDateTime(context, (Element) htmlParent);
      }
      else if (currNode instanceof TextPageNumberElement)
      {
      	
      	if(htmlParent != null && htmlParent.getLocalName().equalsIgnoreCase("p")){
      		Document htmlDoc = (Document) context.getTarget();
    			Element spanElement = htmlDoc.createElement(ODPConvertConstants.HTML_ELEMENT_SPAN);
    			spanElement.setAttribute(ODPConvertConstants.HTML_ATTR_CLASS, "text_page-number ");
    			htmlParent.appendChild(spanElement);
    			targetElement = spanElement;
      	}
      	else{
      		// we also need to add "text_page-number" to the class attribute, so the
      		// editor knows that this element is the page-number
      		StringBuilder tempBfr = new StringBuilder(128);
        	String classes = htmlParent.getAttribute(ODPConvertConstants.HTML_ATTR_CLASS);
        	if (classes != null)
        	{
          	tempBfr.append(classes);
        	}
        	tempBfr.append("text_page-number ");
        	targetElement.setAttribute(ODPConvertConstants.HTML_ATTR_CLASS, tempBfr.toString());
      	}
        // 15090: Add the presentation_class:page_number. Editor keys off this when updating page numbers
        Element drawFrame = ODPConvertUtil.getDrawFrame(htmlParent);
        if (drawFrame != null)
        {
          // Set the presentation-class to page number
          ODPConvertUtil.setPageNumberPresClass(drawFrame);
          // Get the class attribute, if it contains backgroundImage, remove it and reset the attribute.
          String classInfo = drawFrame.getAttribute(ODPConvertConstants.HTML_ATTR_CLASS);
          if (classInfo.contains(ODPConvertConstants.HTML_VALUE_BACKGROUND_IMAGE))
          {
            classInfo = classInfo.replace(ODPConvertConstants.HTML_VALUE_BACKGROUND_IMAGE, "").trim();
            drawFrame.setAttribute(ODPConvertConstants.HTML_ATTR_CLASS, classInfo);
          }
        }
      }

      Object content = context.get(ODPConvertConstants.CONTEXT_HEAD_FOOT_VALUE);
      if (content != null)
      	targetElement.appendChild(((Document) context.getTarget()).createTextNode((String) content));

      // Autocolor work. Defect 5420 - revamp auto color - this code can hang around until we're
      // sure we can remove it - until then it remains commented-out as a fallback.
      // AutoColorUtil.applyWindowFontColor(context, (Element) htmlParent, currNode);

      return;
    }

    if (currNode instanceof TableTableElement)
    {
      new TableTableElementConvertor().doConvertHtml(context, currNode, htmlParent);
    }
    else if (currNode instanceof TextListElement)
    {
      new TextListElementConvertor().doConvertHtml(context, currNode, htmlParent);
    }
    else
    {
      targetNode = addHtmlElement(currNode, htmlParent, context);
      targetNode = parseAttributes2(currNode, targetNode, context);
    }

    if ((currNode instanceof DrawFrameElement))
    {
      if (!(Boolean) context.get(ODPConvertConstants.CONTEXT_SHOW_HEAD_FOOT))
      {
        Node styleAttr = targetNode.getAttributes().getNamedItem(ODPConvertConstants.HTML_STYLE_TAG);
        StringBuilder sb = new StringBuilder(32);
        if (styleAttr != null)
        {
          sb.append(styleAttr.getNodeValue() + ODPConvertConstants.HTML_VISIBILITY_TAG + ODPConvertConstants.SYMBOL_COLON
              + ODPConvertConstants.CSS_VALUE_HIDDEN + ODPConvertConstants.SYMBOL_SEMICOLON);

        }
        ((Element) targetNode).setAttribute(ODPConvertConstants.HTML_STYLE_TAG, sb.toString());
      }
      Node className = targetNode.getAttributes().getNamedItem(ODPConvertConstants.HTML_ATTR_PRESENTATION_CLASS);
      if (className != null)
      {
        if (className.getNodeValue().equalsIgnoreCase(ODPConvertConstants.CSS_ATTR_DATE_TIME))
        {
          Map<String, String> headFootMap = (Map<String, String>) context.get(ODPConvertConstants.CONTEXT_DRAWPAGE_HEAD_FOOT);
          String dateStyle = (String) context.get(ODPConvertConstants.CONTEXT_HEAD_FOOT_STYLE);
          String dateFormat = (String) headFootMap.get(dateStyle + ODPConvertConstants.HTML_STYLE_TAG);
          String attrTextFixedValue;
          if (dateFormat == null || dateFormat.length() == 0)
            attrTextFixedValue = ODPConvertConstants.HTML_VALUE_TRUE;
          else
          {
            attrTextFixedValue = ODPConvertConstants.HTML_VALUE_FALSE;
            ((Element) targetNode).setAttribute(ODPConvertConstants.CSS_ATTR_TEXT_DATETIME_FORMAT, dateFormat);
          }
          ((Element) targetNode).setAttribute(ODPConvertConstants.CSS_ATTR_TEXT_FIXED, attrTextFixedValue);
        }
        // TODO: Currently only supporting numeric page numbers (in odp, page number format is stored in settings.xml)
        if (className.getNodeValue().equalsIgnoreCase(ODPConvertConstants.CSS_ATTR_PAGE_NUMBER))
        {
          // Set the page to numeric
          ((Element) targetNode).setAttribute(ODPConvertConstants.CSS_ATTR_PAGE_NUMBER_FORMAT,
              ODPConvertConstants.CSS_ATTR_PAGE_NUMBER_FORMAT_NUMERIC);
          // Check to see if this is the first page
          Object content = context.get(ODPConvertConstants.CONTEXT_HEAD_FOOT_VALUE);
          if (content != null)
          {
            String pageNumber = (String) content;
            if (pageNumber.equals("1"))
            {
              boolean footersEnabledPageOne = areFootersEnabledPageOne(context);
              ((Element) htmlParent).setAttribute(ODPConvertConstants.CSS_ATTR_SHOW_ON_TITLE, Boolean.toString(footersEnabledPageOne));
            } // if on page 1
          } // if page number set in context
        } // presentation class is page number
      } // if we have a className
    } // if current node is a draw frame

    // mapping ODF attributes to HTML attributes
    if (!currNode.hasChildNodes() || targetNode == null)
      return;
    NodeList childrenNodes = currNode.getChildNodes();
    int childrenNum = childrenNodes.getLength();
    for (int i = 0; i < childrenNum; i++)
    {
      Node node = (Node) childrenNodes.item(i);
      parseForMasterElement(node, targetNode, context);
    }
    context.put(ODPConvertConstants.CONTEXT_PARENT_SIZE, oldParentSize);
  }

  private void setLocaleDateTime(ConversionContext context, Element htmlElement)
  {
    String locale = ODPConvertConstants.ENGLISH_US_LOCALE;
    String classInfo = htmlElement.getAttribute(ODPConvertConstants.HTML_ATTR_CLASS);
    if (classInfo != null && classInfo.length() > 0)
    {
      String[] styles = classInfo.split(ODPConvertConstants.SYMBOL_WHITESPACE);
      int lastStyle = styles.length;
      String styleName = styles[lastStyle - 1];
      locale = ODPConvertUtil.getLocaleInfo(context, styleName);
    }
    // Get the drawFrame element so that we can add the local attribute
    Element drawFrame = ODPConvertUtil.getDrawFrame(htmlElement);
    if (drawFrame != null)
      drawFrame.setAttribute(ODPConvertConstants.CSS_ATTR_TEXT_LOCALE, locale);
  }

  private boolean areFootersEnabledPageOne(ConversionContext context)
  {
    OdfElement styleNode = (OdfElement) context.get(ODPConvertConstants.CONTEXT_CURRENT_STYLE_NODE);
    // footer|page-number|date-time
    if (styleNode != null)
    {
      String showFooter = CSSConvertUtil.getStyleAttribute(styleNode, "presentation:display-" + ODPConvertConstants.CSS_ATTR_FOOTER);
      String showDateTime = CSSConvertUtil.getStyleAttribute(styleNode, "presentation:display-" + ODPConvertConstants.CSS_ATTR_DATE_TIME);
      String showPageNumber = CSSConvertUtil.getStyleAttribute(styleNode, "presentation:display-"
          + ODPConvertConstants.CSS_ATTR_PAGE_NUMBER);
      return ((showFooter.length() == 0) ? false : Boolean.parseBoolean(showFooter) && (showDateTime.length() == 0) ? false : Boolean
          .parseBoolean(showDateTime) && (showPageNumber.length() == 0) ? false : Boolean.parseBoolean(showPageNumber));
    }
    return false;
  }

  @SuppressWarnings("restriction")
  private void setFrameContext(ConversionContext context, Node element)
  {
    //reset list counter for each frame
    TextListChildElementConvertor.initCounter();
    OdfElement temp = (OdfElement) element;
    String preClassName = temp.getAttribute(ODPConvertConstants.ODF_ATTR_PRESENTATION_CLASS);
    if(preClassName == null || preClassName.length() == 0)
    	context.put(ODPConvertConstants.CONTEXT_PARENT_PRESENTATION_CLASS, "");
    else
    	context.put(ODPConvertConstants.CONTEXT_PARENT_PRESENTATION_CLASS, preClassName);

    context.put(ODPConvertConstants.CONTEXT_PARENT_WIDTH, temp.getAttribute(ODPConvertConstants.ODF_ATTR_SVG_WIDTH));
  }
}
