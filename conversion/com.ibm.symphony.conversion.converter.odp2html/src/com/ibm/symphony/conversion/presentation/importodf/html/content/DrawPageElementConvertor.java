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

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.logging.Logger;

import org.odftoolkit.odfdom.OdfElement;
import org.odftoolkit.odfdom.doc.OdfDocument;
import org.odftoolkit.odfdom.doc.office.OdfOfficeMasterStyles;
import org.odftoolkit.odfdom.doc.style.OdfStyle;
import org.odftoolkit.odfdom.dom.element.OdfStylePropertiesBase;
import org.odftoolkit.odfdom.dom.element.draw.DrawPageElement;
import org.odftoolkit.odfdom.dom.element.style.StyleMasterPageElement;
import org.odftoolkit.odfdom.dom.style.props.OdfStylePropertiesSet;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

import com.ibm.symphony.conversion.presentation.ODPConvertConstants;
import com.ibm.symphony.conversion.presentation.PresentationConfig;
import com.ibm.symphony.conversion.presentation.importodf.ODPConvertUtil;
import com.ibm.symphony.conversion.presentation.importodf.css.CSSConvertUtil;
import com.ibm.symphony.conversion.presentation.importodf.html.HtmlConvertUtil;
import com.ibm.symphony.conversion.service.common.ConversionContext;

public class DrawPageElementConvertor extends GeneralContentHtmlConvertor
{
  private static final String CLASS = DrawPageElementConvertor.class.getName();

  private static final Logger log = Logger.getLogger(CLASS);

  @Override
  protected void doConvertHtml(ConversionContext context, Node odfElement, Element htmlParent)
  {
    PresentationConfig.incrementPageCount(context);

    log.fine("Entering Import " + CLASS + ".doConvertHtml");

    // Per co-editing request, we need to append the slidewrapper div into
    // slide editor.
    Document doc = (Document) context.getTarget();
    Element slideWrapperDiv = appendSlideWrapperDiv(htmlParent, doc, context, odfElement);

    // append element
    Element htmlElement = addHtmlElement(odfElement, slideWrapperDiv, context);

    // Add the Draw Page Style Name to the HTML Element (later logic only adds it to the CLASS attribute)
    DrawPageElement drawPage = (DrawPageElement) odfElement;
    String drawStyleName = drawPage.getStyleName();
    htmlElement.setAttribute(ODPConvertUtil.createSavedAttributeName(ODPConvertConstants.ODF_ATTR_DRAW_STYLE_NAME), drawStyleName);

    // parse attributes.
    htmlElement = parseAttributes(odfElement, htmlElement, context);

    // If the style has a font color or background color, we need to create a new style that will be used by the
    // editor during an edit session (iframe) (defect 14381)
    Map<String, Map<String, String>> styles = CSSConvertUtil.getStyles(context);
    Map<String, String> drawStyleMap = styles.get(CSSConvertUtil.getStyleName(drawStyleName));
    if (drawStyleMap != null 
        && (drawStyleMap.containsKey(ODPConvertConstants.CSS_BACKGROUND_COLOR) || drawStyleMap.containsKey(ODPConvertConstants.CSS_FONT_COLOR)))
    {
       // create a new style map for the iframe, with just the color information (don't want any background images or other properties
      String iframeStyleMapName = "body.concord." + drawStyleName;
      Map<String, String> iframeStyleMap = CSSConvertUtil.getStyleMap(iframeStyleMapName, styles);
      
      if (iframeStyleMap.isEmpty())
      {
        String backgroundColor = drawStyleMap.get(ODPConvertConstants.CSS_BACKGROUND_COLOR);
        if (backgroundColor != null && backgroundColor.length() > 0)
          iframeStyleMap.put(ODPConvertConstants.CSS_BACKGROUND_COLOR, backgroundColor);

        String fontColor = drawStyleMap.get(ODPConvertConstants.CSS_FONT_COLOR);
        if (fontColor != null && fontColor.length() > 0)
          iframeStyleMap.put(ODPConvertConstants.CSS_FONT_COLOR, fontColor);

        iframeStyleMap.put(ODPConvertConstants.CSS_BACKGROUND_IMAGE, ODPConvertConstants.HTML_VALUE_NONE);
      }
   }
    
    addPageSizeAttributes(htmlElement, context);

    // apply the master pages.
    applyMasterPage(drawPage, htmlElement, context);

    // protect original parent size.
    Object oldParentSize = context.get(ODPConvertConstants.CONTEXT_PARENT_SIZE);
    context.put(ODPConvertConstants.CONTEXT_PARENT_SIZE, ODPConvertConstants.CONTEXT_PARENT_SIZE_DEFAULT);

    // convert children.
    convertChildren(context, odfElement, htmlElement);

    // recover original parent size.
    context.put(ODPConvertConstants.CONTEXT_PARENT_SIZE, oldParentSize);
    
    // to check if outline master style is converted, due to maybe one master page is not used one outline style
    checkOutlineListMasterStyle(context);
    checkOutlineParagraphMasterStyle(context);
    
    String slideName = drawPage.getAttribute("draw:name");
    String slideId = htmlElement.getAttribute("id");
    @SuppressWarnings("unchecked")
	HashMap<String, String> slideNameIDMap = (HashMap<String, String>) context.get(ODPConvertConstants.CONTEXT_SLIDE_NAME_ID);
    slideNameIDMap.put(slideName, slideId);
  }
  
  
  private void checkOutlineParagraphMasterStyle(ConversionContext context){
  	String masterPageName = (String)context.get(ODPConvertConstants.CONTEXT_DRAWPAGE_MASTER_NAME);
    String preClassName = "outline";
    boolean bNeed = false;
    for(int index = 1; index <=10; index++){
    	bNeed = HtmlConvertUtil.mergeParagraphMasterClass(masterPageName, preClassName, index, context);
    	if(!bNeed)
    		return;
    }
  }
  
  
  private void checkOutlineListMasterStyle(ConversionContext context){
  	String preClassName = "outline";
    String master_name = (String)context.get(ODPConvertConstants.CONTEXT_DRAWPAGE_MASTER_NAME);
    String outlineStyleNameNew = ".ML_"+master_name+"_"+preClassName+"_1:before ";
    Map<String, Map<String, String>> styles = CSSConvertUtil.getStyles(context);
		Map<String, String> usedStyleMap = CSSConvertUtil.getStyleMap(outlineStyleNameNew, styles);
		if(usedStyleMap!=null && !usedStyleMap.isEmpty())
			return;
    for(int index = 1; index <=10; index++)
    	HtmlConvertUtil.convertListMasterStyle(master_name, preClassName, context, index);
  }
  

  /**
   * Creates the HTML Element based on the ODF Node and specified HTML Tag Name
   * <p>
   * This is a helper method that will set the Concord ID if necessary, fetch the OdfToHtmlIndex table, and invoke the logic to create the
   * HTML node.
   * <p>
   * This subclass additionally automatically generates the HTML ID with a prepended "slide_".
   * <P>
   * 
   * @param context
   *          Conversion Context
   * @param node
   *          ODF Node to base the HTML node on
   * @param htmlDoc
   *          HTML Document
   * @param tagName
   *          HTML Tag Name
   * @return Element
   * 
   */
  protected Element createHtmlElement(ConversionContext context, Node node, Document htmlDoc, String tagName)
  {
    return (createHtmlElement(context, node, htmlDoc, tagName, ODPConvertConstants.SLIDE_PREFIX));
  }

  // create slideWrapper div
  private Element appendSlideWrapperDiv(Element htmlParent, Document doc, ConversionContext context, Node node)
  {
    Element slideWrapperDiv = doc.createElement(ODPConvertConstants.HTML_ELEMENT_DIV);
    slideWrapperDiv.setAttribute(ODPConvertConstants.HTML_ATTR_CLASS, ODPConvertConstants.HTML_VALUE_SLIDEWRAPPER);
    ODPConvertUtil.setAutomaticHtmlConcordId(slideWrapperDiv, ODPConvertConstants.SLIDE_WRAPPER_PREFIX);
    htmlParent = (Element) htmlParent.appendChild(slideWrapperDiv);

    return htmlParent;
  }

  @SuppressWarnings({ "unchecked", "restriction" })
  private void applyMasterPage(DrawPageElement drawpage, Element htmlParent, ConversionContext context)
  {

    String masterPageName = drawpage.getAttribute(ODPConvertConstants.ODF_ATTR_DRAW_MASTER_PAGE_NAME);
    masterPageName = ODPConvertUtil.replaceUnderlineToU(masterPageName);
    context.put(ODPConvertConstants.CONTEXT_DRAWPAGE_MASTER_NAME, masterPageName);

    OdfOfficeMasterStyles masterStyles = ((OdfDocument) context.getSource()).getOfficeMasterStyles();

    NodeList list = masterStyles.getElementsByTagName(ODPConvertConstants.ODF_STYLE_MASTER_PAGE);

    // should start from here.

    // convert the odp file.
    Map<String, OdfElement> autoStyles = (Map<String, OdfElement>) context.get(ODPConvertConstants.CONTEXT_AUTOSTYLE_NODES_MAP);
    String styleName = drawpage.getAttribute(ODPConvertConstants.ODF_ATTR_DRAW_STYLE_NAME);
    OdfElement styleNode = autoStyles.get(styleName);

    // NOTE: There are older IBM Docs presentations that were exported with blank draw:style-names or where the draw:style was stored in the
    // styles.xml instead of the content.xml. Handle these cases by checking in styles.xml and defaulting to dp1 if all else fails.
    if (styleNode == null)
    {
      Map<String, List<Node>> officeAutoStyles = (Map<String, List<Node>>) context
          .get(ODPConvertConstants.CONTEXT_SYTLENAME_NODES_MAP_IN_STYLE);
      List<Node> styleNodes = (List<Node>) officeAutoStyles.get(styleName);
      if (styleNodes != null)
      {
        styleNode = (OdfElement) styleNodes.get(0);
      }
      if (styleNode == null)
      {
        styleName = ODPConvertConstants.DRAW_PAGE_FIRST_ID;
        styleNode = autoStyles.get(styleName);
      }
    }

    // Handle Hidden Slides by setting hideInSlideShow="true" (and elsewhere, changing visibility to visible)
    if (styleNode != null && styleNode instanceof OdfStyle)
    {
      OdfStyle odfStyleNode = (OdfStyle) styleNode;
      OdfStylePropertiesBase drawPageProperties = odfStyleNode.getPropertiesElement(OdfStylePropertiesSet.DrawingPageProperties);
      String visibility = drawPageProperties.getAttribute(ODPConvertConstants.ODF_ATTR_VISIBILTY);
      if (visibility.equals(ODPConvertConstants.CSS_VALUE_HIDDEN))
      {
        htmlParent.setAttribute(ODPConvertConstants.HTML_ATTR_HIDE_SLIDE, ODPConvertConstants.HTML_VALUE_TRUE);
        log.fine("Slide visibility is hidden, so marking the slide as hidden in slide show");
      }
	
      context.put(ODPConvertConstants.CONTEXT_CURRENT_STYLE_NODE, styleNode);

      context.put(ODPConvertConstants.CONTEXT_DRAWPAGE_FOOT_STYLE, drawpage.getAttribute(ODPConvertConstants.ODF_ATTR_USE_FOOTER_NAME));
      context
          .put(ODPConvertConstants.CONTEXT_DRAWPAGE_DATETIME_STYLE, drawpage.getAttribute(ODPConvertConstants.ODF_ATTR_USE_DATE_TIME_NAME));

      // visit the master page node.
      for (int i = 0; i < list.getLength(); i++)
      {
        OdfElement node = (OdfElement) list.item(i);
        if (node instanceof StyleMasterPageElement)
        {
          new StyleMasterPageElementConvertor().doConvertHtml(context, node, htmlParent);
        }
      }
    
      String objectsVisible = drawPageProperties.getAttribute(ODPConvertConstants.ODF_ATTR_BACKGROUND_OBJECTS_VISIBLE);
      if("false".equals(objectsVisible))
      {
        Node node = htmlParent.getFirstChild();
        while(node != null && "backgroundobjects".equals(((Element) node).getAttribute(ODPConvertConstants.HTML_ATTR_DRAW_LAYER)))
        {
          String style = ((Element) node).getAttribute(ODPConvertConstants.HTML_STYLE_TAG);
          style = style +"display:none;";
          ((Element) node).setAttribute(ODPConvertConstants.HTML_STYLE_TAG, style);
          node = node.getNextSibling();
        }
      }
    }

    context.remove(ODPConvertConstants.CONTEXT_DRAWPAGE_DATETIME_STYLE);
    context.remove(ODPConvertConstants.CONTEXT_DRAWPAGE_FOOT_STYLE);
  }

  /**
   * Extract the page size info from the context and plug in to the draw page element. The editor will use this information to calculate the
   * UI object sizes.
   * 
   * @param htmlElement
   * @param context
   */
  protected void addPageSizeAttributes(Element htmlElement, ConversionContext context)
  {
    int unitindex = -1;

    Object cval = context.get(ODPConvertConstants.CONTEXT_PAGE_WIDTH);
    if (cval != null)
    {
      String width = (String) cval;
      unitindex = getUnitIndex(width);

      if (unitindex > -1)
      {
        String units = width.substring(unitindex, width.length());
        htmlElement.setAttribute(ODPConvertConstants.HTML_ATTR_PAGE_UNITS, units);

        width = width.substring(0, unitindex);
      }

      htmlElement.setAttribute(ODPConvertConstants.HTML_ATTR_PAGE_WIDTH, width);
    }

    cval = context.get(ODPConvertConstants.CONTEXT_PAGE_HEIGHT);
    if (cval != null)
    {
      String height = (String) cval;
      unitindex = getUnitIndex(height);

      if (unitindex > -1)
      {
        height = height.substring(0, unitindex);
      }

      htmlElement.setAttribute(ODPConvertConstants.HTML_ATTR_PAGE_HEIGHT, height);
    }

    cval = context.get(ODPConvertConstants.CONTEXT_PAGE_ORIENTATION);
    if (cval != null)
    {
      htmlElement.setAttribute(ODPConvertConstants.HTML_ATTR_PAGE_ORIENTATION, (String) cval);
    }
  }

  /**
   * Return the index value of the string where the unit starts. For example, for the value 21cm this will return 2;
   * 
   * @param value
   * @return the index value or -1 if no unit is found.
   */
  protected int getUnitIndex(String value)
  {
    int index = -1, i = value.length() - 1;

    while (!Character.isDigit(value.charAt(i)) && i >= 0)
    {
      index = i;
      i--;
    }

    return index;
  }
}
