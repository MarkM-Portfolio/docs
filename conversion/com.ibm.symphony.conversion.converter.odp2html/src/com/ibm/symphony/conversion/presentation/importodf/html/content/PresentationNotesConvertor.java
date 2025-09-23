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
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.odftoolkit.odfdom.OdfElement;
import org.odftoolkit.odfdom.doc.OdfDocument;
import org.odftoolkit.odfdom.dom.element.draw.DrawFrameElement;
import org.odftoolkit.odfdom.dom.element.draw.DrawPageThumbnailElement;
import org.odftoolkit.odfdom.dom.element.draw.DrawTextBoxElement;
import org.odftoolkit.odfdom.dom.element.presentation.PresentationNotesElement;
import org.odftoolkit.odfdom.dom.element.style.StyleMasterPageElement;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.NamedNodeMap;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

import com.ibm.symphony.conversion.presentation.ODPCommonUtil;
import com.ibm.symphony.conversion.presentation.ODPConvertConstants;
import com.ibm.symphony.conversion.presentation.PresentationConfig;
import com.ibm.symphony.conversion.presentation.UnsupportedFeatures;
import com.ibm.symphony.conversion.presentation.importodf.ODPConvertUtil;
import com.ibm.symphony.conversion.presentation.importodf.html.HtmlConvertUtil;

import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.ConvertUtil;
import com.ibm.symphony.conversion.service.common.IConvertor;
import com.ibm.symphony.conversion.service.common.shape2image.ODPConvertMapUtil;

public class PresentationNotesConvertor extends AbstractContentHtmlConvertor
{
  private static final String CLASS = PresentationNotesConvertor.class.getName();

  private static final Logger log = Logger.getLogger(CLASS);

  private static final String PNE_PREFIX = "pn_";

  private static final String DPTE_PREFIX = "dpt_";

  private static final String NO_PREFIX = "";

  private static final String SVG = "svg";

  // Default Initial Capacity for the ElementInfo HashMap
  private static final int ELEMENT_INFO_MAP_CAPACITY = (int) (8 * 1.33) + 1;

  private static final IConvertor PRESERVE_CONVERTOR = new PreserveOnlyConvertor();

  @Override
  protected void doConvertHtml(ConversionContext context, Node odfElement, Element htmlParent)
  {
    log.fine("Entering Import " + CLASS + ".doConvertHtml");
    OdfElement parent = (OdfElement) context.get(ODPConvertConstants.CONTEXT_PARENT_ELEMENT);
    //reset list counter for each frame
    TextListChildElementConvertor.initCounter();
    // If parent is an instance of the style master page, we need to save some information about headers
    if (parent instanceof StyleMasterPageElement)
    {
      convertForMaster(context, (OdfElement) odfElement, htmlParent);
    }
    else
    {
      Element htmlElement1 = parsePresentationNotesElement(context, odfElement, htmlParent);

      // Convert Child Nodes
      NodeList children = odfElement.getChildNodes();
      for (int i = 0; children != null && i < children.getLength(); i++)
      {
        Node child = children.item(i);
        if (child instanceof DrawPageThumbnailElement)
        {
          htmlElement1 = parseDrawPageThumbnailElement(context, child, htmlElement1);
        }
        else if (child instanceof DrawFrameElement)
        {
          String notesClass = getPresentationClass(child);
          if (notesClass.equals(ODPConvertConstants.HTML_VALUE_NOTES))
          {
            htmlElement1 = parseDrawFrameElement(context, child, htmlElement1);
          }
          else if (notesClass.equals(ODPConvertConstants.HTML_VALUE_HEADER))
          {
            UnsupportedFeatures.addUnsupportedWarning(context, UnsupportedFeatures.UNSUPPORT_FEATURE_HEADER);
            PRESERVE_CONVERTOR.convert(context, child, htmlElement1);
          }
          else if (notesClass.equals(ODPConvertConstants.HTML_VALUE_PAGE_NUMBER))
          {
            // TODO: Need to handle Page Number
            if (ODPConvertConstants.DEBUG)
            {
              log.info("Page Number in Speaker Note element " + child.getNodeName() + " not handled yet.");
            }
          }
          else
          {
            if (ODPConvertConstants.DEBUG)
            {
              log.info("Speaker Note element in draw:frame with undefined presentation class not handled yet.");
            }
            PRESERVE_CONVERTOR.convert(context, child, htmlElement1);
          }
        }
        else
        {
          if (ODPConvertConstants.DEBUG)
          {
            log.info("Speaker Note element " + child.getNodeName() + " not handled yet.");
          }
          PRESERVE_CONVERTOR.convert(context, child, htmlElement1);
        }
      }
    }
  }

  @SuppressWarnings("restriction")
  private void convertForMaster(ConversionContext context, OdfElement odfElement, Element htmlParent)
  {
    // We will skip the presentation notes element as that will be handled later, but need info about its children
    NodeList nodes = odfElement.getChildNodes();
    for (int i = 0; i < nodes.getLength(); i++)
    {
      OdfElement node = (OdfElement) nodes.item(i);
      if (node.getAttribute(ODPConvertConstants.ODF_ATTR_PRESENTATION_CLASS).equalsIgnoreCase(ODPConvertConstants.CSS_ATTR_HEADER))
      {
        // Create header element
        HashMap<String, String> headerInfo = getElementInfo(context, node);
        context.put(ODPConvertConstants.CONTEXT_HEADER_HEADER_MAP, headerInfo);
      }
      else if (node.getAttribute(ODPConvertConstants.ODF_ATTR_PRESENTATION_CLASS).equalsIgnoreCase(ODPConvertConstants.CSS_ATTR_DATE_TIME))
      {
        // Create datetime element
        HashMap<String, String> dateTimeInfo = getElementInfo(context, node);
        context.put(ODPConvertConstants.CONTEXT_HEADER_DATETIME_MAP, dateTimeInfo);
      }
      else if (node.getAttribute(ODPConvertConstants.ODF_ATTR_PRESENTATION_CLASS).equalsIgnoreCase(ODPConvertConstants.CSS_ATTR_FOOTER))
      {
        // Create footer element
        HashMap<String, String> footerInfo = getElementInfo(context, node);
        context.put(ODPConvertConstants.CONTEXT_HEADER_FOOTER_MAP, footerInfo);
      }
      else if (node.getAttribute(ODPConvertConstants.ODF_ATTR_PRESENTATION_CLASS)
          .equalsIgnoreCase(ODPConvertConstants.CSS_ATTR_PAGE_NUMBER))
      {
        // Create page-number element
        HashMap<String, String> pageNumberInfo = getElementInfo(context, node);
        context.put(ODPConvertConstants.CONTEXT_HEADER_PAGENUMBER_MAP, pageNumberInfo);
      }
    }
  }

  /**
   * getElementInfo retrieves information out of the master style that will be used to build the content html later
   * 
   * @return hashmap of information from the master styles (styles.xml)
   */
  @SuppressWarnings({ "restriction" })
  private HashMap<String, String> getElementInfo(ConversionContext context, OdfElement node)
  {
    // Retreive from the master page the information needed to build the html content later
    // draw frame info
    HashMap<String, String> elementInfo = new HashMap<String, String>(ELEMENT_INFO_MAP_CAPACITY);
    elementInfo.put(ODPConvertConstants.ODF_ATTR_DRAW_LAYER, node.getAttribute(ODPConvertConstants.ODF_ATTR_DRAW_LAYER));
    elementInfo
        .put(ODPConvertConstants.ODF_ATTR_DRAW_TEXT_STYLE_NAME, node.getAttribute(ODPConvertConstants.ODF_ATTR_DRAW_TEXT_STYLE_NAME));
    elementInfo.put(ODPConvertConstants.ODF_ATTR_PRE_STYLE_NAME, node.getAttribute(ODPConvertConstants.ODF_ATTR_PRE_STYLE_NAME));
    String parentStyle = getParentPresentation(context, node.getAttribute(ODPConvertConstants.ODF_ATTR_PRE_STYLE_NAME));
    elementInfo.put(ODPConvertConstants.ODF_ATTR_PRE_STYLE_NAME + ODPConvertConstants.PARENT, parentStyle);

    List<Node> posList = HtmlConvertUtil.getPosAttributes(node);
    String posInfo = HtmlConvertUtil.parsePosition(posList, false, context);
    elementInfo.put(ODPConvertConstants.HTML_ATTR_POSITION, posInfo);
    elementInfo.put(ODPConvertConstants.ODF_ATTR_TEXT_ANCHOR_TYPE, node.getAttribute(ODPConvertConstants.ODF_ATTR_TEXT_ANCHOR_TYPE));

    // draw:text-box info
    context.put(ODPConvertConstants.CONTEXT_TEXT_P_ELEMENT, null);
    getTextPElement(context, node);
    OdfElement textP = (OdfElement) context.get(ODPConvertConstants.CONTEXT_TEXT_P_ELEMENT);
    if (textP != null)
    {
      elementInfo.put(ODPConvertConstants.ODF_STYLE_TEXT_STYLE_NAME + ODPConvertConstants.HTML_VALUE_PARAGRAPH,
          textP.getAttribute(ODPConvertConstants.ODF_STYLE_TEXT_STYLE_NAME));
      OdfElement textSpan = getTextSpanElement(textP);
      if (textSpan != null)
        elementInfo.put(ODPConvertConstants.ODF_STYLE_TEXT_STYLE_NAME + ODPConvertConstants.HTML_ELEMENT_SPAN,
            textSpan.getAttribute(ODPConvertConstants.ODF_STYLE_TEXT_STYLE_NAME));
    }
    context.remove(ODPConvertConstants.CONTEXT_TEXT_P_ELEMENT);
    return elementInfo;
  }

  /**
   * getParentPresentation returns the parent presentation style for the input style
   */
  @SuppressWarnings({ "unchecked", "restriction" })
  private String getParentPresentation(ConversionContext context, String presStyle)
  {
    if (presStyle.length() == 0)
    {
      //ODPCommonUtil.logMessage(Level.INFO, ODPCommonUtil.LOG_UNKNOWN_PARENT_PRES_STYLE);
      return "";
    }
    Map<String, ArrayList<Element>> styleMap = (Map<String, ArrayList<Element>>) context
        .get(ODPConvertConstants.CONTEXT_SYTLENAME_NODES_MAP_IN_STYLE);
    ArrayList<Element> elements = styleMap.get(presStyle);
    OdfElement element = (OdfElement) elements.get(0);
    return element.getAttribute(ODPConvertConstants.ODF_ATTR_PARENT_STYLE_NAME);
  }

  /**
   * Returns the textP element if one exists
   */
  @SuppressWarnings("restriction")
  private void getTextPElement(ConversionContext context, OdfElement node)
  {
    if (null != context.get(ODPConvertConstants.CONTEXT_TEXT_P_ELEMENT))
      return;

    NodeList children = node.getChildNodes();
    for (int i = 0; i < children.getLength(); i++)
    {
      OdfElement child = (OdfElement) children.item(i);
      if (child.getNodeName().equalsIgnoreCase(ODPConvertConstants.ODF_ELEMENT_TEXT_PARAGRAPH))
        context.put(ODPConvertConstants.CONTEXT_TEXT_P_ELEMENT, child);
      else
        getTextPElement(context, child);
    }
  }

  /**
   * getTextSpanElement returns the span element if one exists
   */
  @SuppressWarnings("restriction")
  private OdfElement getTextSpanElement(OdfElement node)
  {
    NodeList children = node.getChildNodes();
    for (int i = 0; i < children.getLength(); i++)
    {
      if (children.item(i) instanceof OdfElement)
      {
        OdfElement child = (OdfElement) children.item(i);
        if (child.getNodeName().equalsIgnoreCase(ODPConvertConstants.ODF_ELEMENT_TEXTSPAN))
          return child;
      }
    }
    return null;
  }

  /**
   * Parses the presentation:notes Element into the appropriate HTML Div
   * <p>
   * 
   * @param context
   *          Conversion context
   * @param odfElement
   *          ODF Element (the presentation:notes element)
   * @param htmlParent
   *          Parent element for the new div
   * @return String Resulting HTML Div
   * 
   */
  @SuppressWarnings("restriction")
  private Element parsePresentationNotesElement(ConversionContext context, Node odfElement, Element htmlParent)
  {
    PresentationNotesElement pne = (PresentationNotesElement) odfElement;

    Document doc = (Document) context.getTarget();

    String drawFrameClass = ODPConvertConstants.HTML_VALUE_DRAW_FRAME;

    // Create the top level div for the draw_frame
    Element htmlElement1 = createHtmlElement(context, odfElement, doc, ODPConvertConstants.HTML_ELEMENT_DIV);
    htmlElement1.setAttribute(ODPConvertConstants.HTML_ATTR_CLASS, drawFrameClass);
    htmlElement1.setAttribute(ODPConvertConstants.HTML_ATTR_DRAW_LAYER, ODPConvertConstants.HTML_VALUE_LAYOUT);
    htmlElement1.setAttribute(ODPConvertConstants.HTML_ATTR_TEXT_ANCHOR_TYPE, ODPConvertConstants.HTML_VALUE_PARAGRAPH);
    htmlElement1.setAttribute(ODPConvertConstants.HTML_ATTR_PRESENTATION_CLASS, ODPConvertConstants.HTML_VALUE_NOTES);
    htmlElement1.setAttribute(ODPConvertConstants.HTML_ATTR_STYLE, ODPConvertConstants.HTML_VALUE_DIV1_PN_STYLE);

    // Parse all the presentation:notes attributes and place them on the first div with a pn_ prefix
    NamedNodeMap pnAttrs = pne.getAttributes();
    int size = pnAttrs.getLength();
    int capacity = ODPCommonUtil.calculateArrayCapacity(size);
    List<Node> queue = new ArrayList<Node>(capacity);
    for (int i = 0; pnAttrs != null && i < size; i++)
    {
      if (!"id".equals(pnAttrs.item(i).getNodeName()))
        queue.add(pnAttrs.item(i));
    }

    // First Parse the Class List attributes
    List<Node> classList = getClassElements(odfElement, (OdfDocument) context.getSource(), context);
    if (classList != null && !classList.isEmpty())
    {
      StringBuilder classBuf = new StringBuilder(128);
      classBuf.append(ODPConvertConstants.HTML_ATTR_PRESENTATIONNOTES + ODPConvertConstants.SYMBOL_WHITESPACE);
      classBuf.append(parseClassAttribute(classList, context));
      htmlElement1.setAttribute(PNE_PREFIX + ODPConvertConstants.HTML_ATTR_CLASS, classBuf.toString());
      queue.removeAll(classList);
    }

    // Check to see if headers are enabled, if so convert them
    createContentForHeaders(context, doc, odfElement, htmlElement1);

    // Second Parse the remaining attributes
    for (Node item : queue)
    {
      String pnAttrName = item.getNodeName();
      String pnAttrValue = item.getNodeValue();
      pnAttrName = getHtmlAttrName(pnAttrName, PNE_PREFIX);
      htmlElement1.setAttribute(pnAttrName, pnAttrValue);
    }

    // Attach the Top Level Div to the HTML Parent
    htmlParent.appendChild(htmlElement1);

    return htmlElement1;
  }

  /**
   * createContentForHeaders creates the html content for headers if they are enabled. Headers contain four parts: header, "head footer",
   * header date and header page number. Any or all of these could be included.
   */
  @SuppressWarnings("unchecked")
  private void createContentForHeaders(ConversionContext context, Document doc, Node odfElement, Element htmlParent)
  {
    String dateTimeName = "";
    String footerName = "";
    String headerName = "";
    NamedNodeMap attrs = odfElement.getAttributes();
    // Retrieves the format names, such as dtd1, ftr3 and hdr4
    for (int i = 0; i < attrs.getLength(); i++)
    {
      Node attr = attrs.item(i);
      if (attr.getNodeName().equalsIgnoreCase(ODPConvertConstants.ODF_ATTR_USE_DATE_TIME_NAME))
        dateTimeName = attr.getNodeValue();
      else if (attr.getNodeName().equalsIgnoreCase(ODPConvertConstants.ODF_ATTR_USE_FOOTER_NAME))
        footerName = attr.getNodeValue();
      else if (attr.getNodeName().equalsIgnoreCase(ODPConvertConstants.ODF_ATTR_USE_HEADER_NAME))
        headerName = attr.getNodeValue();
    }

    // Get from the context stored information about the headers
    Map<String, String> headFootMap = (Map<String, String>) context.get(ODPConvertConstants.CONTEXT_DRAWPAGE_HEAD_FOOT);
    HashMap<String, String> dateTimeMap = (HashMap<String, String>) context.get(ODPConvertConstants.CONTEXT_HEADER_DATETIME_MAP);
    HashMap<String, String> headerMap = (HashMap<String, String>) context.get(ODPConvertConstants.CONTEXT_HEADER_HEADER_MAP);
    HashMap<String, String> footerMap = (HashMap<String, String>) context.get(ODPConvertConstants.CONTEXT_HEADER_FOOTER_MAP);
    HashMap<String, String> pageNumberMap = (HashMap<String, String>) context.get(ODPConvertConstants.CONTEXT_HEADER_PAGENUMBER_MAP);

    if (dateTimeMap != null) // If dateTime header was enabled, build the html
    {
      Element dateTimeElement = createHtmlElement(context, odfElement, doc, ODPConvertConstants.HTML_ELEMENT_DIV);
      dateTimeElement.setAttribute(ODPConvertConstants.HTML_ATTR_CLASS, ODPConvertConstants.HTML_VALUE_DRAW_FRAME);
      dateTimeElement.setAttribute(ODPConvertConstants.HTML_ATTR_DRAW_LAYER, dateTimeMap.get(ODPConvertConstants.ODF_ATTR_DRAW_LAYER));
      dateTimeElement.setAttribute(ODPConvertConstants.HTML_ATTR_TEXT_ANCHOR_TYPE,
          dateTimeMap.get(ODPConvertConstants.ODF_ATTR_TEXT_ANCHOR_TYPE));
      dateTimeElement.setAttribute(ODPConvertConstants.HTML_ATTR_PRESENTATION_CLASS, ODPConvertConstants.CSS_ATTR_DATE_TIME);
      dateTimeElement.setAttribute(ODPConvertConstants.HTML_ATTR_STYLE, dateTimeMap.get(ODPConvertConstants.HTML_ATTR_POSITION)
          + ODPConvertConstants.HTML_VISIBILITY_TAG + ODPConvertConstants.SYMBOL_COLON + ODPConvertConstants.CSS_VALUE_HIDDEN);
      String dateText = "";
      if (dateTimeName.length() != 0) // If we have a header name
      {
        String dateFormat = (String) headFootMap.get(dateTimeName + ODPConvertConstants.HTML_STYLE_TAG);
        dateText = (String) headFootMap.get(dateTimeName + ODPConvertConstants.TEXT);
        String attrTextFixedValue;
        if (dateFormat == null || dateFormat.length() == 0)
        {
          attrTextFixedValue = ODPConvertConstants.HTML_VALUE_TRUE;
        }
        else
        {
          attrTextFixedValue = ODPConvertConstants.HTML_VALUE_FALSE;
          dateTimeElement.setAttribute(ODPConvertConstants.CSS_ATTR_TEXT_DATETIME_FORMAT, dateFormat);
          String locale = ODPConvertUtil.getLocaleInfo(context,
              dateTimeMap.get(ODPConvertConstants.ODF_STYLE_TEXT_STYLE_NAME + ODPConvertConstants.HTML_ELEMENT_SPAN));
          dateTimeElement.setAttribute(ODPConvertConstants.CSS_ATTR_TEXT_LOCALE, locale);
          dateText = "";
        }
        dateTimeElement.setAttribute(ODPConvertConstants.CSS_ATTR_TEXT_FIXED, attrTextFixedValue);
      }
      createContentDivs(context, doc, odfElement, dateTimeElement, dateText, dateTimeMap);
      htmlParent.appendChild(dateTimeElement);
    }

    // Set the "header footer" divs
    if (footerMap != null)
    {
      Element footerElement = createHtmlElement(context, odfElement, doc, ODPConvertConstants.HTML_ELEMENT_DIV);
      footerElement.setAttribute(ODPConvertConstants.HTML_ATTR_CLASS, ODPConvertConstants.HTML_VALUE_DRAW_FRAME);
      footerElement.setAttribute(ODPConvertConstants.HTML_ATTR_DRAW_LAYER, ODPConvertConstants.HTML_VALUE_BACKGROUND);
      footerElement.setAttribute(ODPConvertConstants.HTML_ATTR_TEXT_ANCHOR_TYPE,
          footerMap.get(ODPConvertConstants.ODF_ATTR_TEXT_ANCHOR_TYPE));
      footerElement.setAttribute(ODPConvertConstants.HTML_ATTR_PRESENTATION_CLASS, ODPConvertConstants.CSS_ATTR_FOOTER);
      footerElement.setAttribute(ODPConvertConstants.HTML_ATTR_STYLE, footerMap.get(ODPConvertConstants.HTML_ATTR_POSITION)
          + ODPConvertConstants.HTML_VISIBILITY_TAG + ODPConvertConstants.SYMBOL_COLON + ODPConvertConstants.CSS_VALUE_HIDDEN);
      String footerText = "";
      if (footerName.length() != 0)
        footerText = (String) headFootMap.get(footerName + "text");
      createContentDivs(context, doc, odfElement, footerElement, footerText, footerMap);
      htmlParent.appendChild(footerElement);
    }

    // Set the "header" divs
    if (headerMap != null)
    {
      Element headerElement = createHtmlElement(context, odfElement, doc, ODPConvertConstants.HTML_ELEMENT_DIV);
      headerElement.setAttribute(ODPConvertConstants.HTML_ATTR_CLASS, ODPConvertConstants.HTML_VALUE_DRAW_FRAME);
      headerElement.setAttribute(ODPConvertConstants.HTML_ATTR_DRAW_LAYER, ODPConvertConstants.HTML_VALUE_BACKGROUND);
      headerElement.setAttribute(ODPConvertConstants.HTML_ATTR_TEXT_ANCHOR_TYPE,
          headerMap.get(ODPConvertConstants.ODF_ATTR_TEXT_ANCHOR_TYPE));
      headerElement.setAttribute(ODPConvertConstants.HTML_ATTR_PRESENTATION_CLASS, ODPConvertConstants.CSS_ATTR_HEADER);
      headerElement.setAttribute(ODPConvertConstants.HTML_ATTR_STYLE, headerMap.get(ODPConvertConstants.HTML_ATTR_POSITION)
          + ODPConvertConstants.HTML_VISIBILITY_TAG + ODPConvertConstants.SYMBOL_COLON + ODPConvertConstants.CSS_VALUE_HIDDEN);
      String headerText = "";
      if (headerName.length() != 0)
        headerText = (String) headFootMap.get(headerName + ODPConvertConstants.TEXT);
      createContentDivs(context, doc, odfElement, headerElement, headerText, headerMap);
      htmlParent.appendChild(headerElement);
    }

    // Get the page number
    if (pageNumberMap != null)
    {
      Element pageElement = createHtmlElement(context, odfElement, doc, ODPConvertConstants.HTML_ELEMENT_DIV);
      pageElement.setAttribute(ODPConvertConstants.HTML_ATTR_CLASS, ODPConvertConstants.HTML_VALUE_DRAW_FRAME);
      pageElement.setAttribute(ODPConvertConstants.HTML_ATTR_DRAW_LAYER, ODPConvertConstants.HTML_VALUE_BACKGROUND);
      pageElement.setAttribute(ODPConvertConstants.HTML_ATTR_TEXT_ANCHOR_TYPE,
          pageNumberMap.get(ODPConvertConstants.ODF_ATTR_TEXT_ANCHOR_TYPE));
      pageElement.setAttribute(ODPConvertConstants.HTML_ATTR_PRESENTATION_CLASS, ODPConvertConstants.CSS_ATTR_PAGE_NUMBER);
      pageElement.setAttribute(ODPConvertConstants.HTML_ATTR_STYLE, pageNumberMap.get(ODPConvertConstants.HTML_ATTR_POSITION)
          + ODPConvertConstants.HTML_VISIBILITY_TAG + ODPConvertConstants.SYMBOL_COLON + ODPConvertConstants.CSS_VALUE_HIDDEN);
      pageElement.setAttribute(ODPConvertConstants.CSS_ATTR_PAGE_NUMBER_FORMAT, ODPConvertConstants.CSS_ATTR_PAGE_NUMBER_FORMAT_NUMERIC);

      Integer pageNumber = PresentationConfig.getCurrentPageNumber(context);
      createContentDivs(context, doc, odfElement, pageElement, pageNumber.toString(), pageNumberMap);
      htmlParent.appendChild(pageElement);
    }

    // Clean up the context
    context.remove(ODPConvertConstants.CONTEXT_THUMB_NAIL_PAGENUMBER);
    context.remove(ODPConvertConstants.CONTEXT_HEADER_DATETIME_MAP);
    context.remove(ODPConvertConstants.CONTEXT_HEADER_HEADER_MAP);
    context.remove(ODPConvertConstants.CONTEXT_HEADER_FOOTER_MAP);
    context.remove(ODPConvertConstants.CONTEXT_HEADER_PAGENUMBER_MAP);
  }

  /**
   * createContentDivs creates the necessary html elements to display the contents for the header elements
   */
  private void createContentDivs(ConversionContext context, Document doc, Node odfElement, Element htmlParent, String text,
      HashMap<String, String> elementInfo)
  {
    // Create the text box element
    Element textBoxElement = createHtmlElement(context, odfElement, doc, ODPConvertConstants.HTML_ELEMENT_DIV);
    textBoxElement.setAttribute(ODPConvertConstants.HTML_ATTR_CLASS, ODPConvertConstants.HTML_VALUE_DRAW_TEXT_BOX);
    textBoxElement.setAttribute(ODPConvertConstants.HTML_ATTR_STYLE, "height:100%; width:100%;");
    htmlParent.appendChild(textBoxElement);

    // Create the display-table div
    Element tableElement = createHtmlElement(context, odfElement, doc, ODPConvertConstants.HTML_ELEMENT_DIV);
    tableElement.setAttribute(ODPConvertConstants.HTML_ATTR_STYLE, ODPConvertConstants.HTML_VALUE_TABLE_DIV_STYLE);
    textBoxElement.appendChild(tableElement);

    // Create the table-cell div
    Element tableCellElement = createHtmlElement(context, odfElement, doc, ODPConvertConstants.HTML_ELEMENT_DIV);
    tableCellElement.setAttribute(ODPConvertConstants.HTML_ATTR_STYLE, ODPConvertConstants.HTML_VALUE_CELL_DIV_STYLE);
    tableCellElement.setAttribute(ODPConvertConstants.HTML_ATTR_CLASS, ODPConvertConstants.HTML_VALUE_DRAW_FRAME_CLASSES
        + ODPConvertConstants.SYMBOL_WHITESPACE + elementInfo.get(ODPConvertConstants.ODF_ATTR_PRE_STYLE_NAME + ODPConvertConstants.PARENT)
        + ODPConvertConstants.SYMBOL_WHITESPACE + elementInfo.get(ODPConvertConstants.ODF_ATTR_PRE_STYLE_NAME));
    tableElement.appendChild(tableCellElement);

    // Create the P element
    Element paragraphElement = createHtmlElement(context, odfElement, doc, ODPConvertConstants.HTML_ELEMENT_P);
    paragraphElement.setAttribute(ODPConvertConstants.HTML_ATTR_STYLE, "");
    String pStyle = elementInfo.get(ODPConvertConstants.ODF_STYLE_TEXT_STYLE_NAME + ODPConvertConstants.HTML_VALUE_PARAGRAPH);
    if (pStyle != null && pStyle.length() != 0) // Make sure pstyle is not null prior to setting
      paragraphElement.setAttribute(ODPConvertConstants.HTML_ATTR_CLASS, pStyle);
    tableCellElement.appendChild(paragraphElement);

    // Create the span element if needed
    String spanStyle = elementInfo.get(ODPConvertConstants.ODF_STYLE_TEXT_STYLE_NAME + ODPConvertConstants.HTML_ELEMENT_SPAN);
    if (spanStyle != null && spanStyle.length() != 0) // Make sure there is a span
    {
      Element spanElement = createHtmlElement(context, odfElement, doc, ODPConvertConstants.HTML_ELEMENT_SPAN);
     // spanElement.setAttribute(ODPConvertConstants.HTML_ATTR_STYLE, "text-align:center; font-size: 1em;");
      spanElement.setAttribute(ODPConvertConstants.HTML_ATTR_CLASS,
          "text_span " + elementInfo.get(ODPConvertConstants.ODF_STYLE_TEXT_STYLE_NAME + ODPConvertConstants.HTML_ELEMENT_SPAN));
      setHtmlFontSize(spanElement,ODPConvertConstants.CONTEXT_PARENT_SIZE_DEFAULT,false,true);
      if (text == null) // Make sure text is not null prior to appending it
        text = "";
      spanElement.appendChild(((Document) context.getTarget()).createTextNode(text));
      paragraphElement.appendChild(spanElement);
    }
    else
    { // No span so append to paragraph
      if (text == null) // Make sure text is not null prior to appending it
        text = "";
      paragraphElement.appendChild(((Document) context.getTarget()).createTextNode(text));
    }
  }

  /**
   * Parses the draw:page-thumbnail Element into the appropriate HTML Div
   * <p>
   * 
   * @param context
   *          Conversion context
   * @param odfElement
   *          ODF Element (the draw:page-thumbnail element)
   * @param htmlElement1
   *          HTML element to be modified
   * @return String Resulting HTML Div
   * 
   */
  @SuppressWarnings("restriction")
  private Element parseDrawPageThumbnailElement(ConversionContext context, Node odfElement, Element htmlElement1)
  {
    DrawPageThumbnailElement dpte = (DrawPageThumbnailElement) odfElement;

    // Parse all the draw:page-thumbnail attributes and place them on the first div with a dpt_ prefix
    NamedNodeMap dptAttrs = dpte.getAttributes();
    for (int i = 0; dptAttrs != null && i < dptAttrs.getLength(); i++)
    {
      String dptAttrName = dptAttrs.item(i).getNodeName();
      String dptAttrValue = dptAttrs.item(i).getNodeValue();
      dptAttrName = getHtmlAttrName(dptAttrName, DPTE_PREFIX);
      htmlElement1.setAttribute(dptAttrName, dptAttrValue);
    }

    return htmlElement1;
  }

  /**
   * Parses the draw:frame Element into the appropriate HTML Div
   * <p>
   * 
   * @param context
   *          Conversion context
   * @param odfElement
   *          ODF Element (the draw:frame element)
   * @param htmlElement1
   *          HTML element to be modified
   * @return String Resulting HTML Div
   * 
   */
  @SuppressWarnings("restriction")
  private Element parseDrawFrameElement(ConversionContext context, Node odfElement, Element htmlElement1)
  {
    // set draw frame attributes - needed when processing children
    String pageSize = (String) context.get(ODPConvertConstants.CONTEXT_PAGE_WIDTH);
    context.put(ODPConvertConstants.CONTEXT_PARENT_WIDTH, pageSize);
    //Add note flag to context
    OdfElement temp = (OdfElement) odfElement;
    String pre_class = temp.getAttribute(ODPConvertConstants.ODF_ATTR_PRESENTATION_CLASS);
    String master_name = (String)context.get(ODPConvertConstants.CONTEXT_DRAWPAGE_MASTER_NAME);
    //create notes master style
    if(pre_class != null && pre_class.length() > 0 && pre_class.equals("notes")){
    	context.put(ODPConvertConstants.CONTEXT_PARENT_PRESENTATION_CLASS, pre_class);
    	HtmlConvertUtil.copyMasterGeneralStyle(master_name, pre_class, context);
    }
    else
    	context.put(ODPConvertConstants.CONTEXT_PARENT_PRESENTATION_CLASS, "");
    
    //change the name of notes master style
//    String fullClass = htmlElement1.getAttribute(ODPConvertConstants.HTML_ATTR_CLASS);
//    if(fullClass != null && fullClass.length() > 0)
//    	fullClass.replaceFirst(master_name+"-"+pre_class, master_name+"_"+pre_class);
    
    DrawFrameElement dfe = (DrawFrameElement) odfElement;

    // Parse all the draw:frame attributes and place them on the first div with no prefix
    NamedNodeMap dfAttrs = dfe.getAttributes();
    for (int i = 0; dfAttrs != null && i < dfAttrs.getLength(); i++)
    {
      String dfAttrName = dfAttrs.item(i).getNodeName();

      // Ignore the SVG Attributes and parse the rest
      if (!dfAttrName.startsWith(SVG))
      {
        String dfAttrValue = dfAttrs.item(i).getNodeValue();
        dfAttrName = getHtmlAttrName(dfAttrName, NO_PREFIX);

        // Make sure we add the draw_frame class to the Class attribute
        if (dfAttrName.equals(ODPConvertConstants.HTML_ATTR_CLASS))
        {
          dfAttrValue = ODPConvertConstants.HTML_VALUE_DRAW_FRAME + ODPConvertConstants.SYMBOL_WHITESPACE + dfAttrValue;
        }
        htmlElement1.setAttribute(dfAttrName, dfAttrValue);
      }
    }

    // Parse only the draw:text-box children of the draw:frame using normal processing
    // The remaining types (e.g. Shapes, Images, Tables) will only be preserved
    NodeList children = odfElement.getChildNodes();
    for (int i = 0; i < children.getLength(); i++)
    {
      IConvertor convertor = null;

      Node child = children.item(i);
      if (child instanceof DrawTextBoxElement)
      {
        convertor = HtmlContentConvertorFactory.getInstance().getConvertor(child);
        convertor.convert(context, child, htmlElement1);
        Node node = htmlElement1.getLastChild();
        node = node.getFirstChild();
        if(node != null)
        {
          node = node.getFirstChild();
          if(node != null && node instanceof Element)
          {
            
            String style = ((Element)node).getAttribute(ODPConvertConstants.HTML_STYLE_TAG);
            if(style.indexOf(ODPConvertConstants.CSS_VERTICAL_ALIGN) != -1)
            {
              Map<String, String> styleMap = ConvertUtil.buildCSSMap(style);
              styleMap.put(ODPConvertConstants.CSS_VERTICAL_ALIGN, "top");
              style = ConvertUtil.convertMapToStyle(styleMap);
              ((Element)node).setAttribute(ODPConvertConstants.HTML_STYLE_TAG, style);
            }
          }
        }
      }
      else
      {
        convertor = PRESERVE_CONVERTOR;
        convertor.convert(context, child, htmlElement1);
      }
    }

    context.remove(ODPConvertConstants.CONTEXT_PARENT_WIDTH);

    return htmlElement1;
  }

  /**
   * Converts ODF Attribute Name to an HTML Attribute Name
   * <p>
   * 
   * @param attrName
   *          ODF Attribute Name
   * @param prefix
   *          Prefix to add to the HTML Attribute Name
   * @return String Resulting HTML Attribute Name
   * 
   */
  private String getHtmlAttrName(String attrName, String prefix)
  {
    String htmlAttrName = (String) ODPConvertMapUtil.getJSONMap(ODPConvertMapUtil.MAP_ODF).get(attrName);

    if (htmlAttrName == null)
    {
      htmlAttrName = attrName.replace(':', '_');
    }

    return prefix + htmlAttrName;
  }

  /**
   * Determines the Presentation Class
   * <p>
   * 
   * @param element
   *          draw:frame
   * @return String Presentation Class (if it exists) or Empty String
   * 
   */
  private String getPresentationClass(Node element)
  {
    String notesClass = ((Element) element).getAttribute(ODPConvertConstants.ODF_ATTR_PRESENTATION_CLASS);
    if (notesClass == null)
    {
      notesClass = "";
    }

    return notesClass;
  }
}
