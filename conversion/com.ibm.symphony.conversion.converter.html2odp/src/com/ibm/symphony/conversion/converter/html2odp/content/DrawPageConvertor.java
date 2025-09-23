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

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.logging.Level;

import org.odftoolkit.odfdom.OdfElement;
import org.odftoolkit.odfdom.OdfFileDom;
import org.odftoolkit.odfdom.doc.office.OdfOfficeAutomaticStyles;
import org.odftoolkit.odfdom.doc.style.OdfStyle;
import org.odftoolkit.odfdom.doc.style.OdfStyleDrawingPageProperties;
import org.odftoolkit.odfdom.dom.element.anim.AnimParElement;
import org.odftoolkit.odfdom.dom.element.office.OfficeStylesElement;
import org.odftoolkit.odfdom.dom.element.style.StyleStyleElement;
import org.w3c.dom.Element;
import org.w3c.dom.NamedNodeMap;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

import com.ibm.symphony.conversion.converter.html2odp.util.ContentConvertUtil;
import com.ibm.symphony.conversion.presentation.ODPCommonUtil;
import com.ibm.symphony.conversion.presentation.ODPConvertConstants;
import com.ibm.symphony.conversion.presentation.PresentationConfig;
import com.ibm.symphony.conversion.presentation.ZIndexedElement;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.indextable.HtmlToOdfIndex;

public class DrawPageConvertor extends AbstractODPConvertor
{
  // private static final String CLASS = DrawPageConvertor.class.getName();
  //
  // private static final Logger log = Logger.getLogger(CLASS);

  static final String SMIL_DIRECTION_DEFAULT = "forward";

  static final String SMIL_FADECOLOR_DEFAULT = "#000000";

  static final String PRESENTATION_TRANSITION_SPEED_DEFAULT = "medium";

  static final String PRESENTATION_DURATION_DEFAULT = "1s";

  static final String TRANSITION_ATTR_VALUE_NONE = "none";

  @SuppressWarnings({ "restriction" })
  @Override
  protected void doContentConvert(ConversionContext context, Element htmlElement, OdfElement odfParent)
  {
	  try{
		  PresentationConfig.incrementPageCount(context);
		  OdfFileDom contentDom = (OdfFileDom) context.get(ODPConvertConstants.CONTEXT_CONVERT_TARGET);
		  HtmlToOdfIndex indexTable = context.getHtmlToOdfIndexTable();
		  // decide whether to create new odfElement
		  OdfElement odfElement = null;
		  if (indexTable.isHtmlNodeIndexed(htmlElement))
		  {
			  odfElement = indexTable.getFirstOdfNode(htmlElement);
		  }
		  else
		  {
			  String odfNodeName = getOdfNodeName(htmlElement);
			  odfElement = contentDom.createElementNS(ContentConvertUtil.getNamespaceUri(odfNodeName), odfNodeName);
			  ArrayList<OdfElement> elements = ContentConvertUtil.processPreserveOnlyElements(contentDom, htmlElement);
			  if (elements != null)
			  {
				  for (int i = 0; i < elements.size(); i++)
				  {
					  OdfElement preserveOnly = (OdfElement) elements.get(i);
					  odfElement.appendChild(preserveOnly);
				  }
			  }
			  indexTable.addEntryByHtmlNode(htmlElement, odfElement);
		  }
		  // parse preserved attributes along with style attributes
		  context.put(ODPConvertConstants.CONTEXT_PAGE_TEMPLATE_NAME, null);
		  context.put(ODPConvertConstants.CONTEXT_PAGE_LAYOUT_NAME_UPDATED, false);
		  parseAttributes(context, htmlElement, odfElement, odfParent);
		  parseTransitionAttributes(context, htmlElement, odfElement);
		  odfParent.appendChild(odfElement);
		  context.put(ODPConvertConstants.CONTEXT_PAGE_LAYOUT_NAME, odfElement.getAttribute("presentation:presentation-page-layout-name"));
		  @SuppressWarnings("unchecked")
		  LinkedList<ZIndexedElement> zIndexList = (LinkedList<ZIndexedElement>) context.get(ODPConvertConstants.CONTEXT_PAGE_FRAME_LIST);
		  zIndexList.clear();		  
		  this.convertChildren(context, htmlElement, odfElement);
		  updateAnimation(odfElement);
		  String slideName = odfElement.getAttribute("draw:name");
		  String slideId = htmlElement.getAttribute("id");
		  @SuppressWarnings("unchecked")
		  HashMap<String, String> slideNameIDMap = (HashMap<String, String>) context.get(ODPConvertConstants.CONTEXT_SLIDE_NAME_ID);
		  checkSlideName(slideNameIDMap, slideName, 0, odfElement);
		  slideName = odfElement.getAttribute("draw:name");
		  slideNameIDMap.put(slideId, slideName);
		    
	  }catch (Exception e){
		  ODPCommonUtil.logException(context, ODPCommonUtil.LOG_ERROR_CONVERT_PAGE, e);
	  }
  }

	private void checkSlideName(HashMap<String, String> slideNameIDMap,
			String baseSlideName, int i, OdfElement odfElement) {
		String tmpName = baseSlideName + "_" + i;
		if (slideNameIDMap.containsValue(tmpName)) {
			checkSlideName(slideNameIDMap, baseSlideName, (i + 1), odfElement);
		} else {
			odfElement.setAttribute("draw:name", tmpName);
		}
	}

@SuppressWarnings({ "unchecked", "restriction" })
  protected void parseAttributes(ConversionContext context, Element htmlNode, OdfElement element, OdfElement odfParent)
  {
    NamedNodeMap attributes = htmlNode.getAttributes();
    List<String> transitionAttrList = ODPConvertConstants.getTransitionAttrTypeList();

    for (int i = 0; i < attributes.getLength(); i++)
    {
      Node attr = attributes.item(i);
      String nodeName = attr.getNodeName();
      if (ContentConvertUtil.isPreservedAttribute(nodeName))
      {
        String qName = ContentConvertUtil.convertToQName(nodeName);
        // TODO: Workaround for Editor issue. Will remove when they have made the change.
        if (qName.equals("smil:fadecolor"))
        {
          qName = ODPConvertConstants.ODF_ATTR_SMIL_FADECOLOR;
        }

        if (ODPConvertConstants.ODF_ATTR_PRESENTATION_PAGE_LAYOUT_NAME.equalsIgnoreCase(qName))
        {
          OdfFileDom stylesDom = (OdfFileDom) context.get(ODPConvertConstants.CONTEXT_STYLES_DOM);
          String styleName = attr.getNodeValue();
          Map<String, OdfElement> stylesMap = (Map<String, OdfElement>) context.get(ContentConvertUtil.ODP_STYLES_MAP);
          // Determine if the styleName has changed. If it has been updated, we'll need to update the
          // presentation:style-name when processing the text box child (DrawTextBoxConvertor).
          String currentStyleName = element.getAttribute(ODPConvertConstants.ODF_ATTR_PRESENTATION_PAGE_LAYOUT_NAME);
          if (currentStyleName != null && !styleName.equals(currentStyleName))
          {
            context.put(ODPConvertConstants.CONTEXT_PAGE_LAYOUT_NAME_UPDATED, true);
          }

          if (!stylesMap.containsKey(styleName))
          {
            OfficeStylesElement stylesElement = (OfficeStylesElement) stylesDom.getRootElement()
                .getElementsByTagName(ODPConvertConstants.ODF_STYLE_COMMON).item(0);
            OdfElement styleElement = ContentConvertUtil.buildDefaultStyles(ODPConvertConstants.ODF_STYLE_PRES_PAGE_LAYOUT, styleName,
                stylesDom);
            if (styleElement != null)
            {
              stylesElement.appendChild(styleElement);
              stylesMap.put(styleName, styleElement);
              element.setAttributeNS(ContentConvertUtil.getNamespaceUri(qName), qName, attr.getNodeValue());
            } // Unknown page layout name ("blank" from client indicates none to be used). Do not add style:presentation-page-layout
            // element.
          }
          else
          {
            element.setAttributeNS(ContentConvertUtil.getNamespaceUri(qName), qName, attr.getNodeValue());
          }

        }
        else if (ODPConvertConstants.ODF_ATTR_DRAW_MASTER_PAGE_NAME.equalsIgnoreCase(qName))
        {
          String value = attr.getNodeValue();
          if (value.startsWith(ODPConvertConstants.SYMBOL_U))
          {
            value = value.replaceFirst(ODPConvertConstants.SYMBOL_U, ODPConvertConstants.SYMBOL_UNDERBAR);
          }
          context.put(ODPConvertConstants.CONTEXT_PAGE_TEMPLATE_NAME, value);
          element.setAttributeNS(ContentConvertUtil.getNamespaceUri(qName), qName, value);
        }
        // If the draw page contains any transition elements, compile into context
        else if (transitionAttrList.contains(qName))
        {
          Map<String, String> transitionMap = (Map<String, String>) context.get(ODPConvertConstants.CONTEXT_TRANSITION_VALUES);
          if (transitionMap == null)
          {
            transitionMap = new HashMap<String, String>();
          }
          transitionMap.put(qName, attr.getNodeValue());
          context.put(ODPConvertConstants.CONTEXT_TRANSITION_VALUES, transitionMap);

          Node drawPageStyleClasses = attributes.getNamedItem(ODPConvertConstants.HTML_ATTR_CLASS);
          String classValue = drawPageStyleClasses.getNodeValue();
          String[] classStyles = classValue.split(ODPConvertConstants.SYMBOL_WHITESPACE);

          for (String style : classStyles)
          {
            if (style != null && style.startsWith(ODPConvertConstants.DRAW_PAGE_ID))
            {
              transitionMap.put(ODPConvertConstants.CONTEXT_PAGE_TRANSITION_STYLE, style);
            }
          }
        }
        else if (element.getAttribute(qName).compareTo(attr.getNodeValue()) != 0)
        {
          // Get the current page number
          int pageNum = PresentationConfig.getCurrentPageNumber(context);

          // Check to see if this is a draw-style-name attribute and if it this page was copied from master
          // and page number is greater than one
          if (nodeName.equalsIgnoreCase(ODPConvertConstants.CSS_ATTR_DRAW_STYLE_NAME) && isPageCopiedFromTitle(htmlNode) && pageNum > 1)
          {
            // Get the current draw-style-name from the current page and retrieve from context
            String drawStyleName = htmlNode.getAttribute(ODPConvertConstants.CSS_ATTR_DRAW_STYLE_NAME);
            HashMap<String, OdfElement> styleElementsMap = (HashMap<String, OdfElement>) context
                .get(ODPConvertConstants.CONTEXT_ODP_STYLES_MAP);
            OdfElement style = (OdfElement) styleElementsMap.get(drawStyleName);

            // Now get the drawStyleName from the next page to determine what footer information should be shown
            String nextPageDrawStyleName = getNextPageDrawStyleName(htmlNode, pageNum);
            if (nextPageDrawStyleName != null && nextPageDrawStyleName.length() > 0)
            {
              // Clone the style, actually the parent style, since this is a style:family="drawing-page" and give it a new name
              // style:family="drawing-page" styles have the following definition:
              // <style:style style:family="drawing-page" style:name="dp1">
              //     <style:drawing-page-properties presentation:background-objects-visible="true" presentation:background-visible="true"
              //     presentation:display-date-time="true" presentation:display-footer="true" presentation:display-page-number="true"/>
              // </style:style>
              OdfElement styleToClone = (OdfElement) style.getParentNode();
              if (!(styleToClone instanceof StyleStyleElement))
                styleToClone = style;
              OdfElement newStyle = (OdfElement) styleToClone.cloneNode(true);
              String newStyleName = drawStyleName + ODPConvertConstants.SYMBOL_UNDERBAR + ODPConvertConstants.DRAWSTYLE_COPY_IDENTIFIER;
              newStyle.setAttribute(ODPConvertConstants.ODF_ATTR_STYLE_NAME, newStyleName);
              // Retrieve the footer properties element, ie do we show date, footer and page
              OdfElement newStyleProperties = this.getDrawingPagePropertiesElement(newStyle);

              // Retrieve this style from the map
              OdfElement nextPageDrawStyle = (OdfElement) styleElementsMap.get(nextPageDrawStyleName);
              HashMap<String, String> drawingPageProperties = getDrawingPageProperties(nextPageDrawStyle);
              // If we have a next page, use those footer attributes
              if (drawingPageProperties != null && newStyleProperties != null)
              {
                // Assign the next page draw style properties to the current node
                newStyleProperties.setAttribute(ODPConvertConstants.ODF_ATTR_PRESENTATION_DISPLAY_DATE_TIME,
                    drawingPageProperties.get(ODPConvertConstants.ODF_ATTR_PRESENTATION_DISPLAY_DATE_TIME));
                newStyleProperties.setAttribute(ODPConvertConstants.ODF_ATTR_PRESENTATION_DISPLAY_FOOTER,
                    drawingPageProperties.get(ODPConvertConstants.ODF_ATTR_PRESENTATION_DISPLAY_FOOTER));
                newStyleProperties.setAttribute(ODPConvertConstants.ODF_ATTR_PRESENTATION_DISPLAY_PAGE_NUMBER,
                    drawingPageProperties.get(ODPConvertConstants.ODF_ATTR_PRESENTATION_DISPLAY_PAGE_NUMBER));
                // Before we add this new style to the DOM, verify that it doesn't already exist. This is the case where multiple
                // pages were inserted.
                OdfElement styleExists = styleElementsMap.get(newStyleName);
                if (styleExists == null) // Add it to the DOM and the styleElementMap
                {
                  OdfFileDom contentDom = (OdfFileDom) context.get(ODPConvertConstants.CONTEXT_CONVERT_TARGET);
                  OdfOfficeAutomaticStyles autoStyles = contentDom.getAutomaticStyles();
                  autoStyles.appendChild(newStyle);
                  styleElementsMap.put(newStyleName, newStyle);
                }
                element.setAttributeNS(ContentConvertUtil.getNamespaceUri(qName), qName, newStyleName);
              }
              else
              { // No next page, we will use the current draw-style-name properties
                element.setAttributeNS(ContentConvertUtil.getNamespaceUri(qName), qName, attr.getNodeValue());
              }
            }
            else
            {
              element.setAttributeNS(ContentConvertUtil.getNamespaceUri(qName), qName, attr.getNodeValue());
            }
          }
          else
          {
            element.setAttributeNS(ContentConvertUtil.getNamespaceUri(qName), qName, attr.getNodeValue());
          }
        }
      }
    }
  }

  /**
   * checks to see if the current page was copied from the title page
   * 
   * @param htmlNode
   *          draw-page element to check
   * @return true if ODPConvertConstants.CSS_ATTR_SHOW_ON_TITLE is on non-title page
   */
  private boolean isPageCopiedFromTitle(Element htmlNode)
  {
    String showOnTitle = htmlNode.getAttribute(ODPConvertConstants.CSS_ATTR_SHOW_ON_TITLE);
    if (showOnTitle != null && showOnTitle.length() > 0)
      return true;
    return false;
  }

  /**
   * Get the drawing page properties for displaying elements on the footer
   * 
   * @param element
   *          used to retrieve properties from
   * @return hashmap containing whether to show date-time, footer and page-number
   */
  @SuppressWarnings("restriction")
  private HashMap<String, String> getDrawingPageProperties(OdfElement element)
  {
    OdfElement drawingPageElement = getDrawingPagePropertiesElement(element);
    if (drawingPageElement != null)
    {
      HashMap<String, String> pageProperties = new HashMap<String, String>(DRAWING_PAGE_PROPERTIES_MAP_CAPACITY);

      pageProperties.put(ODPConvertConstants.ODF_ATTR_PRESENTATION_DISPLAY_DATE_TIME,
          drawingPageElement.getAttribute(ODPConvertConstants.ODF_ATTR_PRESENTATION_DISPLAY_DATE_TIME));
      pageProperties.put(ODPConvertConstants.ODF_ATTR_PRESENTATION_DISPLAY_FOOTER,
          drawingPageElement.getAttribute(ODPConvertConstants.ODF_ATTR_PRESENTATION_DISPLAY_FOOTER));
      pageProperties.put(ODPConvertConstants.ODF_ATTR_PRESENTATION_DISPLAY_PAGE_NUMBER,
          drawingPageElement.getAttribute(ODPConvertConstants.ODF_ATTR_PRESENTATION_DISPLAY_PAGE_NUMBER));
      return pageProperties;
    }
    return null;
  }

  // Default Initial Capacity for the DrawingPageProperties HashMap which has 3 elements
  private static final int DRAWING_PAGE_PROPERTIES_MAP_CAPACITY = (int) (3 * 1.33) + 1;

  /**
   * get the drawing page properties element from the element input
   * 
   * @param element
   * @return element containing the drawing page properties or null if not found
   */
  @SuppressWarnings("restriction")
  private OdfElement getDrawingPagePropertiesElement(OdfElement element)
  {
    if (element.getNodeName().equalsIgnoreCase(ODPConvertConstants.ODF_STYLE_DRAWING_PAGE_PROP))
      return element;
    NodeList children = element.getChildNodes();
    for (int i = 0; i < children.getLength(); i++)
    {
      Node child = children.item(i);
      if (child.getNodeName().equalsIgnoreCase(ODPConvertConstants.ODF_STYLE_DRAWING_PAGE_PROP))
        return (OdfElement) child;
    }
    return null;
  }

  /**
   * get the next page draw style name
   * 
   * @param htmlNode
   *          node to retrieve draw-style-name from
   * @param currentPageNumber
   *          from where to start our search
   * @return draw-style-name or null if not found
   */
  private String getNextPageDrawStyleName(Element htmlNode, int currentPageNumber)
  {
    // Current htmlNode is a drawPage, so we need to get its parent's parent
    Element grandPa = (Element) htmlNode.getParentNode().getParentNode();
    // Get the pages (slideWrapper elements);
    NodeList parents = grandPa.getChildNodes();
    // parents should be the list of slide wrappers
    for (int i = currentPageNumber; i < parents.getLength(); i++)
    {
      Element drawPageElement = getDrawPageElement(parents.item(i));
      if (drawPageElement != null)
      {
        String showOnTitle = drawPageElement.getAttribute(ODPConvertConstants.CSS_ATTR_SHOW_ON_TITLE);
        if (showOnTitle == null || showOnTitle.length() == 0)
          return drawPageElement.getAttribute(ODPConvertConstants.CSS_ATTR_DRAW_STYLE_NAME);
      }
    }
    return null;
  }

  /**
   * get the drawPage element from the parent passed in
   * 
   * @param htmlParent
   * @return drawPage element or null if not found
   */
  private Element getDrawPageElement(Node htmlParent)
  {
    NodeList children = htmlParent.getChildNodes();
    for (int i = 0; i < children.getLength(); i++)
    {
      Node child = children.item(i);
      if (child instanceof Element)
      {
        Element e = (Element) child;
        if (e.getAttribute(ODPConvertConstants.ODF_ATTR_CLASS).contains(ODPConvertConstants.ODF_ATTR_DRAW_PAGE))
          return e;
      }
    }
    return null;
  }

  /**
   * Parse the transition attributes. These were accumulated during the DrawPageConvertor.parseAttributes call into the ConversionContext
   * using key CONTEXT_TRANSITION_VALUES.
   */
  @SuppressWarnings({ "unchecked", "restriction" })
  protected void parseTransitionAttributes(ConversionContext context, Element htmlNode, OdfElement element)
  {
    // boolean validAttrs = true;
    List<String> transitionAttrList = ODPConvertConstants.getTransitionAttrTypeList();
    Map<String, String> transitionMap = (Map<String, String>) context.get(ODPConvertConstants.CONTEXT_TRANSITION_VALUES);

    if (validTransitionValues(transitionMap))
    {
      Map<String, OdfElement> stylesMap = (Map<String, OdfElement>) context.get(ContentConvertUtil.ODP_STYLES_MAP);
      String transitionStylePage = transitionMap.get(ODPConvertConstants.CONTEXT_PAGE_TRANSITION_STYLE);

      // If this is a new page, thus a new style, create the style-name attribute in the odf document
      // which contains the new transition style information from the Concord editor
      if (createNewPageStyle(context, htmlNode, transitionStylePage))
      {

        // If we cannot find the dp<> value for a new document, we need to create one to store the transition information.
        // Editor may have to make changes for this to be more inline with what Symphony does in that Symphony will create
        // a dp<> style and include it in the style-name attribute if transitions were added.
        transitionStylePage = getNextDrawPageStyleName(stylesMap);

        OdfFileDom contentDom = (OdfFileDom) context.get(ODPConvertConstants.CONTEXT_CONVERT_TARGET);
        OdfOfficeAutomaticStyles autoStyles = contentDom.getAutomaticStyles();

        // Gets the default style and add the transition attributes.
        OdfElement newStyle = getDefaultStyleElement(autoStyles);

        if (newStyle == null)
        {
          ODPCommonUtil.logMessage(Level.WARNING, ODPCommonUtil.LOG_UNKNOWN_TRANSITION_STYLE);
          return;
        }

        OdfElement drawingPageElement = (OdfElement) newStyle.getElementsByTagName(ODPConvertConstants.ODF_STYLE_DRAWING_PAGE_PROP).item(0);
        if (drawingPageElement != null)
        {
          // Set the new style into the automatic styles section as well as the styles map
          newStyle.setAttributeNS(ContentConvertUtil.getNamespaceUri(ODPConvertConstants.ODF_ATTR_STYLE_NAME),
              ODPConvertConstants.ODF_ATTR_STYLE_NAME, transitionStylePage);
        }
        else
        {
          // The style is only the drawing-page-properties at this time.
          ODPCommonUtil.logMessage(Level.WARNING, ODPCommonUtil.LOG_MALFORMED_STYLE);
          return;
        }
        autoStyles.appendChild(newStyle);
        stylesMap.put(transitionStylePage, newStyle);
      }

      // Set the draw:style-name attribute in the body.
      element.setAttributeNS(ContentConvertUtil.getNamespaceUri(ODPConvertConstants.ODF_ATTR_DRAW_STYLE_NAME),
          ODPConvertConstants.ODF_ATTR_DRAW_STYLE_NAME, transitionStylePage);

      if (stylesMap != null && stylesMap.containsKey(transitionStylePage))
      {
        List<String> transitionEntries = new ArrayList<String>(transitionMap.keySet());
        // TODO: Check if smil:type or smil:subtype equals none. For now not hurting anything.
        for (String entry : transitionEntries)
        {
          if (transitionAttrList.contains(entry))
          {
            String attrValue = transitionMap.get(entry);
            String qName = ContentConvertUtil.convertToQName(entry);

            // Due to limitation in the editor, attributes that are added cannot be omitted. Will need to investigate
            // a better design for this but for now we check to see if any values are not set and set them accordingly.
            // This is really ugly especially if we have to do this for all the styles as we add them into the editor.
            // Using typical defaults for each of these values if not set.
            if (qName.equals(ODPConvertConstants.ODF_ATTR_SMIL_FADECOLOR) && attrValue.equals(TRANSITION_ATTR_VALUE_NONE))
            {
              attrValue = SMIL_FADECOLOR_DEFAULT;
            }
            else if (qName.equals(ODPConvertConstants.ODF_ATTR_SMIL_DIRECTION) && attrValue.equals(TRANSITION_ATTR_VALUE_NONE))
            {
              attrValue = SMIL_DIRECTION_DEFAULT;
            }
            else if (qName.equals(ODPConvertConstants.ODF_ATTR_TRANSITION_SPEED) && attrValue.equals(TRANSITION_ATTR_VALUE_NONE))
            {
              attrValue = PRESENTATION_TRANSITION_SPEED_DEFAULT;
            }
            else if (qName.equals(ODPConvertConstants.ODF_ATTR_TRANSITION_DURATION) && attrValue.equals(TRANSITION_ATTR_VALUE_NONE))
            {
              attrValue = PRESENTATION_DURATION_DEFAULT;
            }

            Element estyle = stylesMap.get(transitionStylePage);
            OdfElement drawingPage = (OdfElement) estyle.getElementsByTagName(ODPConvertConstants.ODF_STYLE_DRAWING_PAGE_PROP).item(0);

            if (drawingPage != null)
            {
              drawingPage.setAttributeNS(ContentConvertUtil.getNamespaceUri(qName), qName, attrValue);
            }

            stylesMap.put(transitionStylePage, (OdfElement) estyle);
            
            if(qName.equals(ODPConvertConstants.ODF_ATTR_SMIL_TYPE) || qName.equals(ODPConvertConstants.ODF_ATTR_SMIL_SUBTYPE) 
            		|| qName.equals(ODPConvertConstants.ODF_ATTR_SMIL_DIRECTION)){
	            NodeList animations = element.getChildNodes();
	            for (int i = 0; i < animations.getLength(); i++){
	              Node animation = animations.item(i);
	              if (animation instanceof AnimParElement){
	            	  NodeList childList = animation.getChildNodes();
	            	  for(int j = 0; j < childList.getLength(); j++){
	            		  Element animPar = (Element)childList.item(j);
	            		  if(animPar instanceof AnimParElement){
	            			  String begin = ((AnimParElement)animPar).getSmilBeginAttribute();
	            			  if(begin != null && begin.length() > 6){
	            				  String beginId = begin.substring(0,begin.length()-6);
	            				  String xmlId = element.getAttribute(ODPConvertConstants.ODF_ATTR_XMLID);
	            				  if(xmlId != null && xmlId.compareToIgnoreCase(beginId)==0){
	            					  OdfElement transitionFilter = (OdfElement)animPar.getElementsByTagName("anim:transitionFilter").item(0);
	            					  if(transitionFilter != null){
	            						transitionFilter.setAttributeNS(ContentConvertUtil.getNamespaceUri(qName), qName, attrValue);
	            					  }
	            				  }
	            			  }
	            		  }
	            	  }
	              }
	            }
            }
          }
        }
      }
    }
    else
    {
      // Check to see if transition values currently exist and remove
      Map<String, OdfElement> stylesMap = (Map<String, OdfElement>) context.get(ContentConvertUtil.ODP_STYLES_MAP);
      NamedNodeMap attributes = htmlNode.getAttributes();

      Node drawPageStyleClasses = attributes.getNamedItem(ODPConvertConstants.HTML_ATTR_CLASS);
      String classValue = drawPageStyleClasses.getNodeValue();
      String[] classStyles = classValue.split(ODPConvertConstants.SYMBOL_WHITESPACE);

      if (transitionMap != null)
      {
        // Ensure the draw:style-name attribute in the body.
        String transitionStylePage = transitionMap.get(ODPConvertConstants.CONTEXT_PAGE_TRANSITION_STYLE);
        element.setAttributeNS(ContentConvertUtil.getNamespaceUri(ODPConvertConstants.ODF_ATTR_DRAW_STYLE_NAME),
            ODPConvertConstants.ODF_ATTR_DRAW_STYLE_NAME, transitionStylePage);
      }

      for (String style : classStyles)
      {
        if (style != null && style.startsWith(ODPConvertConstants.DRAW_PAGE_ID))
        {
          Element estyle = stylesMap.get(style);

          OdfElement drawingPageElement = null;
          if (estyle instanceof OdfStyleDrawingPageProperties)
          {
            drawingPageElement = (OdfElement) estyle;
          }
          else if (estyle != null)
          {
            drawingPageElement = (OdfElement) estyle.getElementsByTagName(ODPConvertConstants.ODF_STYLE_DRAWING_PAGE_PROP).item(0);
          }

          if (drawingPageElement != null)
          {
            for (String attr : transitionAttrList)
            {
              drawingPageElement.removeAttribute(attr);
              stylesMap.put(style, drawingPageElement);
            }
          }
        }
      }
    }

    // Remove the transition information from context. Placed in parseAttributes prior to this method call.
    context.remove(ODPConvertConstants.CONTEXT_PAGE_TRANSITION_STYLE);
    context.remove(ODPConvertConstants.CONTEXT_TRANSITION_VALUES);
  }

  /**
   * Checks to see if a new dp style needs to be created for transitions.
   * 
   * Will create a new page style if either the transition style page is not set or the smil:type or smil:subtype have changed
   * 
   * @param context
   *          Conversion context carriage
   * @param htmlElement
   *          Current draw page element
   * @param transitionStylePage
   *          Transition style page (ex. dp1)
   * @return True if a new page should be created.
   */
  @SuppressWarnings({ "unchecked", "restriction" })
  private boolean createNewPageStyle(ConversionContext context, Element htmlElement, String transitionStylePage)
  {

    if (transitionStylePage == null || transitionStylePage.length() <= 0)
    {
      return true;
    }

    Map<String, OdfElement> stylesMap = (Map<String, OdfElement>) context.get(ContentConvertUtil.ODP_STYLES_MAP);
    Map<String, String> transitionMap = (Map<String, String>) context.get(ODPConvertConstants.CONTEXT_TRANSITION_VALUES);
    List<String> transitionAttrList = ODPConvertConstants.getTransitionAttrTypeList();

    String classValue = htmlElement.getAttribute(ODPConvertConstants.HTML_ATTR_CLASS);
    String[] classStyles = classValue.split(ODPConvertConstants.SYMBOL_WHITESPACE);

    for (String style : classStyles)
    {
      if (style != null && style.startsWith(ODPConvertConstants.DRAW_PAGE_ID))
      {
        Element estyle = stylesMap.get(style);

        OdfElement drawingPageElement = null;
        if (estyle instanceof OdfStyleDrawingPageProperties)
        {
          drawingPageElement = (OdfElement) estyle;
        }
        else if (estyle != null)
        {
          drawingPageElement = (OdfElement) estyle.getElementsByTagName(ODPConvertConstants.ODF_STYLE_DRAWING_PAGE_PROP).item(0);
        }

        if (drawingPageElement != null)
        {
          String transitionType = drawingPageElement.getAttribute(ODPConvertConstants.ODF_ATTR_SMIL_TYPE);
          String transitionSubType = drawingPageElement.getAttribute(ODPConvertConstants.ODF_ATTR_SMIL_SUBTYPE);

          List<String> transitionEntries = new ArrayList<String>(transitionMap.keySet());
          for (String entry : transitionEntries)
          {
            if (transitionAttrList.contains(entry))
            {
              String qName = ContentConvertUtil.convertToQName(entry);
              String attrValue = transitionMap.get(entry);
              if ((qName.equals(ODPConvertConstants.ODF_ATTR_SMIL_TYPE) && !attrValue.equals(transitionType))
                  || (qName.equals(ODPConvertConstants.ODF_ATTR_SMIL_SUBTYPE) && !attrValue.equals(transitionSubType)))
              {
                return true;
              }
            }
          }
        }
      }
    }
    return false;
  }

  /**
   * Gets the next page style name. Probably should be replaced with CSS style utilities
   * 
   * @param stylesMap
   *          Style map of existing styles
   * @return String of the next draw page style available (ex. dp12)
   */
  private String getNextDrawPageStyleName(Map<String, OdfElement> stylesMap)
  {
    int i = 1;
    String stylePage = "";
    while (true)
    {
      String styleName = ODPConvertConstants.DRAW_PAGE_ID + i++;
      if (!stylesMap.containsKey(styleName))
      {
        stylePage = styleName;
        break;
      }
    }
    return stylePage;
  }

  /**
   * Check to see if the transition values passed in from the editor are valid. This consists of checking if there are any transition values
   * or certain attributes are set.
   * 
   * @param transitionValues
   *          Transition values set for this page
   * @return Currently if no transitions are set this will return false. Also if the smil:type or smil:subtype is set to none, this will
   *         return false.
   */
  private boolean validTransitionValues(Map<String, String> transitionValues)
  {
    boolean validValues = true;

    if (transitionValues == null)
    {
      return false;
    }

    for (Map.Entry<String, String> entry : transitionValues.entrySet())
    {
      String key = entry.getKey();
      String value = entry.getValue();
      if (key.equals(ODPConvertConstants.ODF_ATTR_SMIL_TYPE) && value.equals(TRANSITION_ATTR_VALUE_NONE)
          || key.equals(ODPConvertConstants.ODF_ATTR_SMIL_SUBTYPE) && value.equals(TRANSITION_ATTR_VALUE_NONE))
      {
        validValues = false;
        break;
      }
    }
    return validValues;
  }

  /**
   * Gets the default automatic style (typically dp1). This style will be cloned and a new style returned based on the original
   */
  @SuppressWarnings("restriction")
  private OdfElement getDefaultStyleElement(OdfOfficeAutomaticStyles autoStyles)
  {

    // Clone the first dp style found for adding the transition attributes.
    // The current assertion is that at least one "dp" style will exist.
    Iterator<OdfStyle> iter = autoStyles.getAllStyles().iterator();
    OdfElement newStyle = null;
    while (iter.hasNext())
    {
      OdfElement checkElement = iter.next();
      String name = checkElement.getAttribute(ODPConvertConstants.ODF_ATTR_STYLE_NAME);
      if (name.startsWith(ODPConvertConstants.DRAW_PAGE_ID))
      {
        newStyle = (OdfElement) checkElement.cloneNode(true);
        break;
      }
    }

    return newStyle;
  }

  /**
   * If this page has object animation, it may have moved due to z-index re-ordering. Move it to the end (prior to presentation:notes) to
   * ensure the IDs referenced are before the animation.
   * 
   * @param odfParent
   *          - the draw:page element
   */
  @SuppressWarnings("restriction")
  private void updateAnimation(OdfElement odfParent)
  {
    NodeList animations = odfParent.getElementsByTagName(ODPConvertConstants.ODF_ELEMENT_ANIMPAR);
    if (animations.getLength() > 0) // Are there any animations?
    {
      // First, get the presentation:notes node. We want to put the animations just prior to presentation:notes.
      Node presentationNotes = null;
      NodeList presentationNotesList = odfParent.getElementsByTagName(ODPConvertConstants.ODF_ELEMENT_PRESENTATIONNOTES);
      if (presentationNotesList.getLength() > 0)
      {
        presentationNotes = presentationNotesList.item(0);
      }
      NodeList children = odfParent.getChildNodes();
      int numChildren = children.getLength();
      for (int i = 0; i < numChildren; ++i)
      {
        Node child = children.item(i);
        if (child instanceof AnimParElement)
        {
          if (presentationNotes != null)
          {
            // Presentation notes exist so move the animation just prior (if not already there)
            Node prevSib = presentationNotes.getPreviousSibling();
            if (prevSib == null || prevSib != child)
            {
              odfParent.removeChild(child);
              odfParent.insertBefore(child, presentationNotes);
            }
          }
          else
          {
            // No presentation notes so just ensure the animation is the last child
            Node lastChild = odfParent.getLastChild();
            if (lastChild != child)
            {
              odfParent.removeChild(child);
              odfParent.appendChild(child);
            }
          }
        }
      }
    }
  }
}
