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
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.odftoolkit.odfdom.OdfElement;
import org.odftoolkit.odfdom.doc.OdfDocument;
import org.odftoolkit.odfdom.doc.office.OdfOfficeStyles;
import org.odftoolkit.odfdom.doc.presentation.OdfPresentationDateTime;
import org.odftoolkit.odfdom.doc.presentation.OdfPresentationFooter;
import org.odftoolkit.odfdom.doc.style.OdfStyle;
import org.odftoolkit.odfdom.doc.text.OdfTextAuthorName;
import org.odftoolkit.odfdom.doc.text.OdfTextDate;
import org.odftoolkit.odfdom.doc.text.OdfTextFileName;
import org.odftoolkit.odfdom.doc.text.OdfTextListHeader;
import org.odftoolkit.odfdom.doc.text.OdfTextPageNumber;
import org.odftoolkit.odfdom.doc.text.OdfTextParagraph;
import org.odftoolkit.odfdom.doc.text.OdfTextSpace;
import org.odftoolkit.odfdom.doc.text.OdfTextSpan;
import org.odftoolkit.odfdom.doc.text.OdfTextTab;
import org.odftoolkit.odfdom.doc.text.OdfTextTime;
import org.odftoolkit.odfdom.dom.attribute.fo.FoFontSizeAttribute;
import org.odftoolkit.odfdom.dom.attribute.presentation.PresentationClassAttribute;
import org.odftoolkit.odfdom.dom.attribute.table.TableDefaultCellStyleNameAttribute;
import org.odftoolkit.odfdom.dom.element.OdfStylableElement;
import org.odftoolkit.odfdom.dom.element.OdfStylePropertiesBase;
import org.odftoolkit.odfdom.dom.element.draw.DrawFrameElement;
import org.odftoolkit.odfdom.dom.element.draw.DrawImageElement;
import org.odftoolkit.odfdom.dom.element.draw.DrawPageElement;
import org.odftoolkit.odfdom.dom.element.draw.DrawTextBoxElement;
import org.odftoolkit.odfdom.dom.element.presentation.PresentationDateTimeElement;
import org.odftoolkit.odfdom.dom.element.presentation.PresentationFooterElement;
import org.odftoolkit.odfdom.dom.element.presentation.PresentationNotesElement;
import org.odftoolkit.odfdom.dom.element.table.TableTableCellElement;
import org.odftoolkit.odfdom.dom.element.table.TableTableRowElement;
import org.odftoolkit.odfdom.dom.element.text.TextAElement;
import org.odftoolkit.odfdom.dom.style.OdfStyleFamily;
import org.odftoolkit.odfdom.dom.style.props.OdfStylePropertiesSet;
import org.w3c.dom.Attr;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.NamedNodeMap;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.w3c.dom.Text;

import com.ibm.symphony.conversion.presentation.CSSProperties;
import com.ibm.symphony.conversion.presentation.ODPCommonUtil;
import com.ibm.symphony.conversion.presentation.ODPConvertConstants;
import com.ibm.symphony.conversion.presentation.PresentationConfig;
import com.ibm.symphony.conversion.presentation.StackableProperties;
import com.ibm.symphony.conversion.presentation.StackableProperties.StringProperty;
import com.ibm.symphony.conversion.presentation.TextDecorationHandler;
import com.ibm.symphony.conversion.presentation.importodf.AutoColorUtil;
import com.ibm.symphony.conversion.presentation.importodf.ODPConvertUtil;
import com.ibm.symphony.conversion.presentation.importodf.css.CSSConvertUtil;
import com.ibm.symphony.conversion.presentation.importodf.css.CSSConvertorFactory;
import com.ibm.symphony.conversion.presentation.importodf.html.AbstractHtmlConvertor;
import com.ibm.symphony.conversion.presentation.importodf.html.HtmlConvertUtil;
import com.ibm.symphony.conversion.presentation.importodf.html.master.AbstractMasterHtmlConvertor;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.ConvertUtil;
import com.ibm.symphony.conversion.service.common.HtmlCSSConstants;
import com.ibm.symphony.conversion.service.common.ODFConstants;
import com.ibm.symphony.conversion.service.common.indextable.DOMIdGenerator;
import com.ibm.symphony.conversion.service.common.indextable.IndexUtil;
import com.ibm.symphony.conversion.service.common.indextable.OdfToHtmlIndex;
import com.ibm.symphony.conversion.service.common.shape2image.ODPConvertMapUtil;
import com.ibm.symphony.conversion.service.common.shape2image.ODPConvertStyleMappingUtil;
import com.ibm.symphony.conversion.service.common.util.Measure;
import com.ibm.symphony.conversion.service.common.util.MeasurementUtil;

public abstract class AbstractContentHtmlConvertor extends AbstractHtmlConvertor
{
  private static final String CLASS = AbstractContentHtmlConvertor.class.getName();

  private static final Logger LOG = Logger.getLogger(CLASS);

  private static final String DELETE_PREFIX = "Delete_";
  
  private static final double SCRIPT_RATION = 0.58;

  protected void convertChildren(ConversionContext context, Node element, Element htmlElement)
  {
    NodeList childrenNodes = element.getChildNodes();
    for (int i = 0; i < childrenNodes.getLength(); i++)
    {
      Node childElement = childrenNodes.item(i);
      // need convert children.
      HtmlContentConvertorFactory.getInstance().getConvertor(childElement).convert(context, childElement, htmlElement);
    }
  }

  /**
   * Creates the HTML Element based on the ODF Node and specified HTML Tag Name
   * <p>
   * This is a helper method that will set the Concord ID if necessary, fetch the OdfToHtmlIndex table, and invoke the logic to create the
   * HTML node. Note: The ID and index table logic is only done when in content processing.
   * <p>
   * This base method additionally automatically generates the HTML ID with no prefix prepended.
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
    return (createHtmlElement(context, node, htmlDoc, tagName, ""));
  }

  /**
   * Creates the HTML Element based on the ODF Node and specified HTML Tag Name
   * <p>
   * This is a helper method that will set an automatically generated HTML ID, will set the Concord ID if necessary, fetch the
   * OdfToHtmlIndex table, and invoke the logic to create the HTML node. Note: The ID and index table logic is only done when in content
   * processing.
   * <p>
   * 
   * @param context
   *          Conversion Context
   * @param node
   *          ODF Node to base the HTML node on
   * @param htmlDoc
   *          HTML Document
   * @param tagName
   *          HTML Tag Name
   * @param prefix
   *          Prefix to prepend on the automatically generated HTML Concord ID
   * @return Element
   * 
   */
  protected final Element createHtmlElement(ConversionContext context, Node node, Document htmlDoc, String tagName, String prefix)
  {
    Element htmlNode = htmlDoc.createElement(tagName);
    ODPConvertConstants.DOCUMENT_TYPE documentType = (ODPConvertConstants.DOCUMENT_TYPE) context
        .get(ODPConvertConstants.CONTEXT_DOCUMENT_TYPE);
    if (documentType == ODPConvertConstants.DOCUMENT_TYPE.CONTENT)
    {
      OdfToHtmlIndex indexTable = (OdfToHtmlIndex) context.get(ODPConvertConstants.CONTEXT_INDEX_TABLE);
      OdfElement oNode = (OdfElement) node;

      Double officeVersion = (Double) context.get(ODPConvertConstants.CONTEXT_OFFICE_VERSION);
      if (officeVersion != null && officeVersion.compareTo(ODPConvertConstants.OFFICE_VERSION_12) >= 0)
      {
        ODPConvertUtil.setConcordId(oNode);
      }

      ODPConvertUtil.setAutomaticHtmlConcordId(htmlNode, prefix);
      indexTable.addEntryByOdfNode(oNode, htmlNode, IndexUtil.RULE_NORMAL);
    }

    return (htmlNode);
  }

  /**
   * Creates the HTML Element based on the HTML Tag Name without indexing the HTML Node
   * <p>
   * This is a helper method that will invoke the logic to create the HTML node.
   * <p>
   * This base method additionally automatically generates the HTML ID with no prefix prepended.
   * <P>
   * 
   * @param context
   *          Conversion Context
   * @param htmlDoc
   *          HTML Document
   * @param tagName
   *          HTML Tag Name
   * @return Element
   * 
   */
  protected Element createHtmlElementWithoutIndexing(ConversionContext context, Document htmlDoc, String tagName)
  {
    return (createHtmlElementWithoutIndexing(context, htmlDoc, tagName, ""));
  }

  /**
   * Creates the HTML Element based on the HTML Tag Name without indexing the HTML Node
   * <p>
   * This is a helper method that will invoke the logic to create the HTML node.
   * <p>
   * 
   * @param context
   *          Conversion Context
   * @param htmlDoc
   *          HTML Document
   * @param tagName
   *          HTML Tag Name
   * @param prefix
   *          Prefix to prepend on the automatically generated HTML Concord ID
   * @return Element
   * 
   */
  protected Element createHtmlElementWithoutIndexing(ConversionContext context, Document htmlDoc, String tagName, String prefix)
  {
    Element htmlNode = htmlDoc.createElement(tagName);
    ODPConvertUtil.setAutomaticHtmlConcordId(htmlNode, prefix);
    return (htmlNode);
  }

  /**
   * Marks the ODF Element for deletion
   * <p>
   * This is a helper method that will set mark an ODF Element for deletion by adding the ODF Element's ID into the index table with a dummy
   * HTML Node ID. When this is detected on export, the ODF Element will be removed from the presentation.
   * <p>
   * 
   * @param context
   *          Conversion Context
   * @param node
   *          ODF Node to mark for deletion
   * 
   */
  protected final void markElementForDeletion(ConversionContext context, Node node)
  {
    OdfToHtmlIndex indexTable = (OdfToHtmlIndex) context.get(ODPConvertConstants.CONTEXT_INDEX_TABLE);

    OdfElement oNode = (OdfElement) node;
    ODPConvertUtil.setAutomaticXmlConcordId(oNode, DELETE_PREFIX);

    String htmlId = DELETE_PREFIX + DOMIdGenerator.generate();

    indexTable.addEntryByOdfNode(oNode, htmlId, IndexUtil.RULE_NORMAL);
  }

  protected Element addHtmlElement(Node node, Node htmlParentNode, ConversionContext context)
  {
    Document doc = (Document) context.getTarget();
    if (htmlParentNode == null)
      return null;

    Node e = null;
    if (node.getNodeType() == Node.TEXT_NODE || node instanceof OdfTextSpace)
    {
      // Check the ODF Node to see if there is an ID to preserve
      if (node instanceof OdfElement)
      {
        Double officeVersion = (Double) context.get(ODPConvertConstants.CONTEXT_OFFICE_VERSION);
        if (officeVersion != null && officeVersion.compareTo(ODPConvertConstants.OFFICE_VERSION_12) >= 0)
        {
          OdfElement oNode = (OdfElement) node;
          ODPConvertUtil.setConcordId(oNode);
        }
      }
      Node t = null;
      String text, text_s = "\u00a0";
      if (node instanceof OdfTextSpace)
      {
      	Node text_c = node.getAttributes().getNamedItem("text:c");
      	if (text_c == null)
      	{
      		text = "\u00a0";
      	}
      	else
      	{
      		int spaceCount = Integer.parseInt(text_c.getNodeValue());
      		for (int i = 1; i < spaceCount; i++)
      		{
      			text_s += "\u00a0";
      		}
      		text = "\u00a0";
      	}
    		t = doc.createTextNode(text_s);

      }
      else{

      	text = node.getNodeValue();
      	t = doc.createTextNode(text);
      }
      // Don't need to add another span tag if we're already inside one or
      // if we are in hyperlink text and we don't have any attributes
      String parentNodeName = htmlParentNode.getNodeName();
      if (((ODPConvertConstants.HTML_ELEMENT_SPAN.equals(parentNodeName) || ODPConvertConstants.HTML_ELEMENT_TEXTA.equals(parentNodeName))
          && !node.hasAttributes()) || node instanceof OdfTextSpace)
      {
        // Converted pptx have the string "<number>" in the node for page number.
        // If the page number is available in the context, we will set the page to that.
        // Otherwise the string number comes out in footers.
        if (text.equals("<number>"))
        {
          boolean pageNumberReset = false;
          NamedNodeMap attrs = htmlParentNode.getAttributes();
          for (int i = 0; i < attrs.getLength() && !pageNumberReset; i++)
          {
            Node attr = attrs.item(i);
            String attrNodeValue = attr.getNodeValue().trim().toLowerCase();
            if (attrNodeValue.equals(ODPConvertConstants.ODF_ELEMENT_PAGENUMBER)
                || attrNodeValue.equals(ODPConvertConstants.CSS_TEXT_PAGE_NUMBER))
            {
              // Get the current page number
              Integer pagecount = PresentationConfig.getCurrentPageNumber(context);
              if (null != pagecount)
                text = pagecount.toString();
              // 15090: Add the presentation_class:page_number. Editor keys off this when updating page numbers
              Element drawFrame = ODPConvertUtil.getDrawFrame((Element) htmlParentNode);
              if (drawFrame != null)
              {
                ODPConvertUtil.setPageNumberPresClass(drawFrame);
                // Get the class attribute, if it contains backgroundImage, remove it and reset the attribute.
                String classInfo = drawFrame.getAttribute(ODPConvertConstants.HTML_ATTR_CLASS);
                if (classInfo.contains(ODPConvertConstants.HTML_VALUE_BACKGROUND_IMAGE))
                {
                  classInfo = classInfo.replace(ODPConvertConstants.HTML_VALUE_BACKGROUND_IMAGE, "").trim();
                  drawFrame.setAttribute(ODPConvertConstants.HTML_ATTR_CLASS, classInfo);
                }
              }
              t = doc.createTextNode(text);
              pageNumberReset = true;
            }
          }
        }
        Boolean processingFooters = (Boolean) context.get(ODPConvertConstants.CONTEXT_PROCESSING_FOOTERS);

        boolean appendTextNode = true; // assume we do need to append the text node

        // If we are not processing footers, check if we should append the child node
        if (processingFooters == null || !processingFooters.booleanValue())
        {
          if (htmlParentNode instanceof Element)
          {
            // Only append the node if the element is not variable
            Element drawFrame = ODPConvertUtil.getDrawFrame((Element) htmlParentNode);
            if (drawFrame != null) // Should not be the case
            {
              // If this is a date time element and is not field data, handle it
              // like footer information. Because of the extremely poor job the Symphony convertor
              // does with PPTX files is when get into situations like this. So, if it is a field, we
              // basically get out and append the text node.
              if (isDateTimeElement((Element) drawFrame) && isNotField((Element) htmlParentNode))
              {
                String dateFormat = getDateTimeFixed(node);
                if (null == dateFormat) // dateFormat is null implies date is fixed
                {
                  drawFrame.setAttribute(ODPConvertConstants.CSS_ATTR_TEXT_FIXED, "true");
                }
                else
                {
                  appendTextNode = false; // Don't want to append text node in this case, editor will do it
                  drawFrame.setAttribute(ODPConvertConstants.CSS_ATTR_TEXT_FIXED, "false");
                  // There might be a date element already set, so we need to concatenate
                  String currFormat = drawFrame.getAttribute(ODPConvertConstants.CSS_ATTR_TEXT_DATETIME_FORMAT);
                  dateFormat = currFormat + dateFormat;
                  drawFrame.setAttribute(ODPConvertConstants.CSS_ATTR_TEXT_DATETIME_FORMAT, dateFormat);
                }
              }
            }
          }
        }
        else
        {

          // if we are processing the page-number footer, we may have other text along with the page-number
          // that we need to create (e.g. "Page 2 of 9") - so don't skip adding that text (note that we don't
          // want to add the page-number itself, that's done elsewhere)
          String footerType = (String) context.get(ODPConvertConstants.CONTEXT_PROCESSING_FOOTER_TYPE);
          String parentClasses = ((Element) htmlParentNode).getAttribute(ODPConvertConstants.HTML_ATTR_CLASS);
          if (footerType != null)
          {
            if (footerType.equals("page-number") && (parentClasses == null || !(parentClasses.contains("text_page-number "))))
            {
              // it's ok to append this (appendTextNode is already true)
            }
            else if (footerType.equals("footer"))
            {
              // it's ok to append this (appendTextNode is already true)
            }
            else
            {
              appendTextNode = false; // we don't want to append this text
            }
          }
          else
          {
            appendTextNode = false; // we don't want to append this text
          }
        }

        if (appendTextNode)
        {
          // If already in a span but our node doesn't have attributes, we still want to wrap this text node
          // within another span because the editor has problems if the span has a mixture of children some
          // of which are spans and some of which are raw text nodes.
          /*
           * if (ODPConvertConstants.HTML_ELEMENT_SPAN.equals(parentNodeName)) { e = doc.createElement("span"); e.appendChild(t); } else {
           * htmlParentNode.appendChild(t); }
           */
          // defect 9864, text nodes must always be surrounded by a blank span so that CSS properties put on hold can be
          // applied properly
         // e = doc.createElement("span");
          //e.appendChild(t);
          //25707: Only one level of span can be created, else split it.
          if (ODPConvertConstants.HTML_ELEMENT_SPAN.equals(parentNodeName))
          {
            String parentClasses = ((Element) htmlParentNode).getAttribute(ODPConvertConstants.HTML_ATTR_CLASS);
            boolean pParent = (parentClasses != null && parentClasses.contains("text_p"));
            if(!pParent && htmlParentNode.hasChildNodes())
            {
            	htmlParentNode.appendChild(t);
//              e = htmlParentNode.cloneNode(false);
//              //this condition check is invalidate, hasAttribute() can not return correct result
//              if(((Element) e).hasAttribute(ODPConvertConstants.CONCORD_ODF_ATTR_ID))
//                ((Element) e).removeAttribute(ODPConvertConstants.CONCORD_ODF_ATTR_ID);
//              htmlParentNode = htmlParentNode.getParentNode();
//              e.appendChild(t);
            }
            else
              htmlParentNode.appendChild(t);
          }
          else
          {
            e = doc.createElement("span");
            e.appendChild(t);
          }
        }
      }
      else
      // not in a span, or in a span with additional attributes
      {
        e = doc.createElement("span");
        e.appendChild(t);
      }

      // defect 9864, takes the text-decoration style previously put on hold and sets it as inline style of the enclosing span
      // of the current text node
      TextDecorationHandler.releaseStyleOnHold(context, t);

      // Autocolor work.
      // if (htmlParentNode instanceof Element)
      // {
      // AutoColorUtil.applyWindowFontColor(context, (Element) htmlParentNode, node.getParentNode());
      // }
    }
    else
    {
      String htmlTag = (String) ODPConvertMapUtil.getJSONMap(ODPConvertMapUtil.MAP_ODF).get(node.getNodeName());
      if (htmlTag == null)
      {
        // e = doc.createElement(MappingEngineConstants.HTMLElement.DIV);
        LOG.fine("No defined HTML Tags for " + node.getNodeName() + ". Parent will be used as its replacement");
      }
      else if (node instanceof DrawTextBoxElement)
      {
        // Set the HTML ID only if the Textbox is not in a Background Object
        if (!isBackgroundFrame(htmlParentNode))
        {
          e = createHtmlElement(context, node, doc, htmlTag, ODPConvertConstants.TEXTBOX_PREFIX);
        }
        else
        {
          e = createHtmlElement(context, node, doc, htmlTag);
        }
      }
      else if (node instanceof OdfElement)
      {
        e = createHtmlElement(context, node, doc, htmlTag);
      }
      else
      {
        e = doc.createElement(htmlTag);
      }
    }

    if (e != null)
    {
      e = htmlParentNode.appendChild(e);
    }
    else
    {
      e = htmlParentNode;
    }

    if (node instanceof OdfTextSpan || node instanceof OdfTextParagraph)
    {
      if (!node.hasChildNodes())
      {
        // Paragraphs with only an empty span and empty paragraphs are ignored by the browser. We need to add a &nbsp; so that
        // they won't be ignored.

        // Add the class="spacePlaceholder" to enable us to strip it on export if the text node is unchanged
        StringBuilder classBuf = new StringBuilder(128).append(((Element) e).getAttribute(ODPConvertConstants.HTML_ATTR_CLASS));
        if (classBuf.length() > 0)
        {
          classBuf.append(ODPConvertConstants.SYMBOL_WHITESPACE);
        }
        classBuf.append(ODPConvertConstants.HTML_ATTR_SPACE_PLACEHOLDER);
        ((Element) e).setAttribute(ODPConvertConstants.HTML_ATTR_CLASS, classBuf.toString());

        // Add the &#8203;
        Text t = doc.createTextNode("\u200b");
        e.appendChild(t);
      }
    }

//    if (node instanceof OdfTextSpace)
//    {
//      Node text_c = node.getAttributes().getNamedItem("text:c");
//      if (text_c == null)
//      {
//        Text t = doc.createTextNode("\u00a0");
//        e.appendChild(t);
//      }
//      else
//      {
//        int spaceCount = Integer.parseInt(text_c.getNodeValue());
//        for (int i = 0; i < spaceCount; i++)
//        {
//          Text t = doc.createTextNode("\u00a0");
//          e.appendChild(t);
//        }
//      }
//    }

    if (node instanceof OdfTextTab)
    {
      Text t = doc.createTextNode("\u00a0\u00a0\u00a0\u00a0"); // using four blanks as one tab
      e.appendChild(t);
    }

    // We get here because some footers are part of a list, and list processing breaks us out of
    // the "normal" convert children process.
    if (node instanceof PresentationFooterElement || node instanceof PresentationDateTimeElement)
    {
      Boolean showHeadFoot = (Boolean) context.get(ODPConvertConstants.CONTEXT_SHOW_HEAD_FOOT);

      if (null != showHeadFoot && showHeadFoot.booleanValue())
      {
        Object content = context.get(ODPConvertConstants.CONTEXT_HEAD_FOOT_VALUE);
        if (content != null)
          htmlParentNode.appendChild(((Document) context.getTarget()).createTextNode((String) content));
      }
    }

    return (Element) e;
  }

  /**
   * 
   * @param node
   *          containing the date information to append if date is fixed
   * @return date format if date is a variable date, null if the date is a fixed format
   */
  private String getDateTimeFixed(Node node)
  {
    Node parentNode = node.getParentNode();
    NamedNodeMap attrs = parentNode.getAttributes();
    // Check to see if the date node has a style name associated with it
    for (int i = 0; i < attrs.getLength(); i++)
    {
      Node attr = attrs.item(i);
      if (attr.getNodeName().equals(ODPConvertConstants.ODF_ATTR_DATE_STYLE_NAME) && attr.getNodeValue() != null)
        return attr.getNodeValue();
    }
    return null;
  }

  /**
   * 
   * @param drawFrame
   *          drawFrame element to check if the presentation_class is a date-time
   * @return true if drawFrame has a presentation_class of date-time
   */
  private boolean isDateTimeElement(Element drawFrame)
  {
    String presClass = drawFrame.getAttribute(ODPConvertConstants.HTML_ATTR_PRESENTATION_CLASS);
    if (presClass.equalsIgnoreCase(ODPConvertConstants.CSS_ATTR_DATE_TIME))
      return true;
    return false;
  }

  /**
   * returns true is the parentNode passed in does NOT have the field attribute
   */
  private boolean isNotField(Element htmlParentNode)
  {
    String field = htmlParentNode.getAttribute("field");
    if (field == null || field.length() == 0)
      return true;
    return false;
  }

  // /*
  // * Determine if the node is in a list. This is meant to be used to check if an empty <text:span>
  // * element is contained within a list to know if we need to do special handling for it
  // *
  // * @param Node parent html node
  // *
  // * @return true if the span is NOT contained within a <text:list-item>
  // */
  // private boolean isNotInAList(Node parent)
  // {
  // if (parent == null)
  // return true; // no parent, we must not be in a list
  //
  // String nodeName = parent.getNodeName();
  //
  // if (ODPConvertConstants.HTML_ELEMENT_LI.equals(nodeName))
  // return false; // we are in a list
  //
  // // span within a span, need to keep looking up the chain
  // if (ODPConvertConstants.HTML_ELEMENT_SPAN.equals(nodeName))
  // return isNotInAList(parent.getParentNode());
  //
  // // if we're a span within a paragraph, we'll assume the parent of the <p> should be
  // // the list item - if one exists. We want to stop searching as soon as we can.
  // //NOTE: we currently don't even would see a <p> in a <li> because we convert <text:p> into a <span>
  // if (ODPConvertConstants.HTML_ELEMENT_P.equals(nodeName))
  // {
  // Node parentParent = parent.getParentNode();
  // if (parentParent != null)
  // {
  // if (parentParent.getNodeName().equals(ODPConvertConstants.HTML_ELEMENT_P))
  // {
  // return isNotInAList(parentParent); // <p> within a <p>, keep looking
  // }
  // else
  // {
  // if (parentParent.getNodeName().equals(ODPConvertConstants.HTML_ELEMENT_LI))
  // return false;
  // }
  // }
  // }
  //
  // return true; // must not be in a list
  // }

  protected List<Node> getClassElements(Node element, OdfDocument doc, ConversionContext context)
  {
    List<Node> styleRef = new ArrayList<Node>();
    if (element instanceof OdfStylableElement)
    {
      String key = HtmlConvertUtil.getStyleValue(element);
      List<Node> nodeList = ODPConvertStyleMappingUtil.getAllStyleNameNodesByKey(context, key);
      // Map<String, List<Node>> styleMap = (Map<String, List<Node>>) context.get(ODPConvertConstants.CONTEXT_SYTLENAME_NODES_MAP);
      // List<Node> nodeList = styleMap.get(key == null ? "" : key);
      for (int i = 0; nodeList != null && i < nodeList.size(); i++)
      {
        Node refNode = nodeList.get(i);
        if (HtmlConvertUtil.hasParentStyleName(refNode))
        {
          Node parentStyleNameNode = HtmlConvertUtil.getParentStyleName(refNode);
          String parentStyleName = parentStyleNameNode.getNodeValue();

          // mich - defect 2896, if the style is of the "graphic" family, instead of using the parent style, we must use a
          // style that corresponds to the parent style, but contains only the text properties
          if (ODPConvertConstants.HTML_VALUE_GRAPHIC.equals(refNode.getAttributes().getNamedItem(ODPConvertConstants.ODF_ATTR_STYLE_FAMILY)
              .getNodeValue()))
          {
            Node styleNode;
            String styleName = parentStyleName + ODPConvertConstants.CSS_GRAPHIC_TEXT_PROPERTIES_CLASS_SUFFIX;
            List<Node> l = ODPConvertStyleMappingUtil.getAllStyleNameNodesByKey(context, styleName);
            if (l == null || (styleNode = l.get(0)) == null)
            {
              continue;
            }
            parentStyleNameNode = HtmlConvertUtil.getStyleName(styleNode);
            // Add the text portion of the parent style
            styleRef.add(parentStyleNameNode);

            styleName = parentStyleName + ODPConvertConstants.CSS_GRAPHIC_PARAGRAPH_PROPERTIES_CLASS_SUFFIX;
            l = ODPConvertStyleMappingUtil.getAllStyleNameNodesByKey(context, styleName);
            if (l == null || (styleNode = l.get(0)) == null)
            {
              continue;
            }
            parentStyleNameNode = HtmlConvertUtil.getStyleName(styleNode);
            // Add the paragraph portion of the parent style
            styleRef.add(parentStyleNameNode);

            boolean insideShape = (Boolean) context.get(ODPConvertConstants.CONTEXT_INSIDE_SHAPE);
            if (!insideShape)
            {
              styleName = parentStyleName + ODPConvertConstants.CSS_GRAPHIC_GRAPHIC_PROPERTIES_CLASS_SUFFIX;
              l = ODPConvertStyleMappingUtil.getAllStyleNameNodesByKey(context, styleName);
              if (l == null || (styleNode = l.get(0)) == null)
              {
                continue;
              }
              parentStyleNameNode = HtmlConvertUtil.getStyleName(styleNode);
              // Add the graphic portion of the parent style
              styleRef.add(parentStyleNameNode);
            }
          }
          else
          { // Add the parent style
            styleRef.add(parentStyleNameNode);
          }
        }
      }
    }

    NamedNodeMap attrs = element.getAttributes();
    for (int i = 0; i < attrs.getLength(); i++)
    {
      Node attrItem = attrs.item(i);

      if (ODPConvertConstants.ODF_ATTR_DRAW_TEXT_STYLE_NAME.equalsIgnoreCase(attrItem.getNodeName()))
      {
        continue;
      }

      String value = (String) ODPConvertMapUtil.getJSONMap(ODPConvertMapUtil.MAP_ODF).get(attrItem.getNodeName());
      if (value != null && value.equals(ODPConvertConstants.HTML_ATTR_CLASS))
      {
        if (attrs.item(i) instanceof TableDefaultCellStyleNameAttribute && element instanceof TableTableRowElement)
        {
          continue;
        }

        styleRef.add(attrItem);
      }
    }

    if (element instanceof TableTableCellElement)
    {
      if (element.getAttributes().getNamedItem("table:style-name") == null)
      {
        if (element.getParentNode().getAttributes().getNamedItem("table:default-cell-style-name") != null)
        {
          styleRef.add(element.getParentNode().getAttributes().getNamedItem("table:default-cell-style-name"));
        }
      }
    }

    return styleRef;
  }

  @SuppressWarnings("unchecked")
  protected String parseClassAttribute(List<Node> attr, ConversionContext context)
  {
    StringBuilder classBuf = new StringBuilder(128);
    for (Node classAttrItem : attr)
    {
      int styleInstance = 0;
      String styleName = ODPConvertStyleMappingUtil.getCanonicalStyleName(classAttrItem.getNodeValue());

      ODPConvertConstants.DOCUMENT_TYPE documentType = (ODPConvertConstants.DOCUMENT_TYPE) context
          .get(ODPConvertConstants.CONTEXT_DOCUMENT_TYPE);
      if (documentType == ODPConvertConstants.DOCUMENT_TYPE.CONTENT)
      {
        Map<String, OdfElement> autoStyleMap = (Map<String, OdfElement>) context.get(ODPConvertConstants.CONTEXT_AUTOSTYLE_NODES_MAP);
        OdfElement style = (OdfElement) autoStyleMap.get(styleName);

        if (style != null)
        {
          try
          {
            styleInstance = convertStylesInContent(style, 44, context);
          }
          catch (Exception e)
          {
            String message = ODPCommonUtil.createMessage(ODPCommonUtil.LOG_UNEXPECTED_EXCEPTION_IN, CLASS + ".parseClassAttribute");
            ODPCommonUtil.logException(context, Level.WARNING, message, e);
          }
        }
        if (styleInstance > 0)
        {
          styleName = styleName + "_" + styleInstance + "_" + ODPConvertConstants.STYLE_COPY_IDENTIFIER;
        }
      }
      classBuf.append(ODPConvertUtil.replaceUnderlineToU(styleName)).append(" ");
    }
    return classBuf.toString();
  }

  /**
   * Return the map that maps new style string to instance number. Note the map returned only consists of duplicate style instance numbers
   * for the styleName parameter. This table is used to ensure that only duplicate styles are created with unique attributes.
   * 
   * @param styleName
   *          The original style name.
   * @param context
   * 
   * @return Map of font sizes to duplicate styles names.
   */
  @SuppressWarnings({ "unchecked", "rawtypes" })
  protected Map<Map, Integer> getNewMapForStyle(String styleName, ConversionContext context)
  {
    // Now we know a new font mapping is required. First check to see if a style exists with the same
    // font size.

    Map<String, Map<Map, Integer>> mapTable = (Map<String, Map<Map, Integer>>) context
        .get(ODPConvertConstants.CONTEXT_NEW_STYLE_DUP_INSTANCE_MAP);

    if (mapTable == null)
    {
      mapTable = new HashMap<String, Map<Map, Integer>>();
      context.put(ODPConvertConstants.CONTEXT_NEW_STYLE_DUP_INSTANCE_MAP, mapTable);
    }

    Map<Map, Integer> styleMap = mapTable.get(styleName);
    if (styleMap == null)
    {
      styleMap = new HashMap<Map, Integer>();
      mapTable.put(styleName, styleMap);
    }

    return styleMap;
  }

  @SuppressWarnings({ "unchecked", "rawtypes" })
  protected int convertStylesInContent(Node style, double parentSize, ConversionContext context)
  {
    // Returns the instance number of the original style. So 0 returned the first time
    // the style is encountered. If the style is duplicated then the count is incremented.

    int rvalue = 0;
    String styleName = null;
    Map<String, Map<String, String>> styles = (Map<String, Map<String, String>>) context.get(ODPConvertConstants.CONTEXT_CSS_CONTENT_STYLE);

    /*
     * if (style.getAttributes().getNamedItem(ODPConvertConstants.ODF_ATTR_STYLE_FAMILY) != null &&
     * ("text").equalsIgnoreCase(style.getAttributes().getNamedItem("style:family").getNodeValue())) {
     */
    parentSize = (parentSize == 0.0) ? ODPConvertConstants.CONTEXT_PARENT_SIZE_DEFAULT : parentSize;

    double oldParentSize = (Double) context.get(ODPConvertConstants.CONTEXT_PARENT_SIZE);
    context.put(ODPConvertConstants.CONTEXT_PARENT_SIZE, parentSize);

    // make sure this is clear first
    context.remove(ODPConvertConstants.CONTEXT_NEW_STYLE_MAP);

    // store old font size map.
    Object oldFontSizeMap = context.get(ODPConvertConstants.CONTEXT_OUTLINE_FONTSIZE_MAP);
    CSSConvertorFactory.getInstance().getConvertor(style).convert(context, style, styles);

    styleName = CSSConvertUtil.getStyleName(style, context);

    // check to see if a new style was generated - a new style is created to avoid modifying
    // the font size or padding that was previously calculated. The parsing code will put this new style
    // into this CONTEXT_NEW_STYLE_MAP variable. The style is a duplicate of the style
    // that was just processed. The new style must be named .. the name will have the form:
    // {old-style-name}_{count}_{STYLE_COPY_IDENTIFIER}.
    //
    // Note that the style name used here in the mapping tables is different form the style
    // name placed in the html class attribute.

    Map<String, String> newstyle = (Map<String, String>) context.get(ODPConvertConstants.CONTEXT_NEW_STYLE_MAP);

    if (newstyle != null)
    {
      // This maps a given list of style attributes to a duplicate style instance for this css style
      Map<Map, Integer> savedStyleMap = getNewMapForStyle(styleName, context);

      Integer dupNumber = savedStyleMap.get(newstyle);

      if (dupNumber == null)
      {
        Map<String, Integer> instanceMap = (Map<String, Integer>) context.get(ODPConvertConstants.CONTEXT_NEW_STYLE_COUNT_MAP);
        if (instanceMap == null)
        {
          instanceMap = new HashMap<String, Integer>();
          context.put(ODPConvertConstants.CONTEXT_NEW_STYLE_COUNT_MAP, instanceMap);
        }

        int counter = 0;
        Integer countObj = instanceMap.get(styleName);
        if (countObj != null)
        {
          counter = countObj.intValue();
        }

        instanceMap.put(styleName, new Integer(++counter));

        // the style name created in CSSConvertUtil.getStyleName has a space at the end
        styleName = styleName.trim() + "_" + counter + "_" + ODPConvertConstants.STYLE_COPY_IDENTIFIER + " ";
        LOG.fine("New style has been created: " + styleName);
        styles.put(styleName, newstyle);

        rvalue = counter;
        savedStyleMap.put(newstyle, new Integer(rvalue));

      }
      else
      {
        rvalue = dupNumber.intValue();
        LOG.fine("Found existing style duplicate: " + rvalue + " for style: " + styleName);
      }

      context.remove(ODPConvertConstants.CONTEXT_NEW_STYLE_MAP);
    }

    // recover old font size map.
    context.put(ODPConvertConstants.CONTEXT_OUTLINE_FONTSIZE_MAP, oldFontSizeMap);
    // recover old parent size.
    context.put(ODPConvertConstants.CONTEXT_PARENT_SIZE, oldParentSize);
    // }

    return rvalue;
  }

  @SuppressWarnings({ "unchecked", "restriction" })
  protected Element parseAttributes(Node node, Element htmlNode, ConversionContext context)
  {
    Document doc = (Document) context.getTarget();
    NamedNodeMap attrs = node.getAttributes();
    if (attrs == null)
      return htmlNode;

    int size = attrs.getLength();
    int capacity = ODPCommonUtil.calculateArrayCapacity(size);
    List<Node> queue = new ArrayList<Node>(capacity);
    for (int i = 0; i < size; i++)
    {
      if (!"id".equals(attrs.item(i).getNodeName()))
        queue.add(attrs.item(i));
    }
    StringBuilder stylebuf = new StringBuilder(128);
    Attr styleAttr = ((Document) context.getTarget()).createAttribute(ODPConvertConstants.HTML_ATTR_STYLE);
    Attr classAttr = ((Document) context.getTarget()).createAttribute(ODPConvertConstants.HTML_ATTR_CLASS);
    String nodeName = node.getNodeName();
    if(nodeName.equalsIgnoreCase("office:presentation"))
    {
    	String defaultFontSize =(String) context.get(ODPConvertConstants.CONTEXT_DEFAULT_FONT_SIZE);
    	int dFsize = 18;
    	try{
    	    defaultFontSize = defaultFontSize.toLowerCase().trim();
    		if(defaultFontSize.endsWith("pt")){
    			defaultFontSize = defaultFontSize.replaceAll("pt", "").trim();
    			dFsize = Integer.parseInt(defaultFontSize);
    		}
    	} catch (Exception e) {
    		System.out.println("Add default style error:"+e.getMessage());
    	}
    	htmlNode.setAttribute("sz", dFsize+"");
    }
    List<Node> posList = HtmlConvertUtil.getPosAttributes(node);
    String posInfo = null;
    queue.removeAll(posList);

    List<Node> classList = getClassElements(node, (OdfDocument) context.getSource(), context);

    StringBuilder classBuf = new StringBuilder(128);

    if (node instanceof DrawFrameElement && ((DrawFrameElement) node).getAttribute("draw:layer").equalsIgnoreCase("backgroundobjects"))
    {
      boolean inStyleProcessing = (Boolean) context.get(ODPConvertConstants.CONTEXT_IN_STYLE);
      if (inStyleProcessing) // From master style?
        classBuf.append("draw_frame " + ODPConvertConstants.HTML_VALUE_BACKGROUND_IMAGE + " ");
      else
      // content
      {
        // Only better have draw:layer="background" for master style pulled in draw:frames
        String presentationClass = ((DrawFrameElement) node).getPresentationClassAttribute();
        if (presentationClass != null && AbstractMasterHtmlConvertor.cvCleanTypes.contains(presentationClass))
        {
          // Re-import problem. Fix up the draw:frame element and process like it was draw:layer="layout"
          ((DrawFrameElement) node).setAttribute(ODPConvertConstants.ODF_ATTR_DRAW_LAYER, ODPConvertConstants.HTML_VALUE_LAYOUT);
        }
        classBuf.append(nodeName.replace(':', '_') + ODPConvertConstants.SYMBOL_WHITESPACE);
      }
    }
    else
    {
      classBuf.append(nodeName.replace(':', '_') + ODPConvertConstants.SYMBOL_WHITESPACE);
      if (node instanceof DrawPageElement)
      {
        classBuf.append("PM1 border PM1_concord ");
      }
    }
    if (classList != null && !classList.isEmpty())
    {
      // NOTE: The draw:frame's class styles are not processed here (style into new div to ensure vertical alignment works). The
      // draw:frame's class styles are processed late in this method when the child is a draw:text-box or in DrawImageConvertor when the
      // child is a draw:image.
      if (!(node instanceof DrawFrameElement))
      {
        String classinfo = parseClassAttribute(classList, context);
        classBuf.append(classinfo);

        processClassProperties(context, classinfo, htmlNode, stylebuf);
      }
      queue.removeAll(classList);
    }

    String oldClassBuf = htmlNode.getAttribute(ODPConvertConstants.HTML_ATTR_CLASS);
    if (oldClassBuf != null)
    {
      classBuf.append(oldClassBuf + ODPConvertConstants.SYMBOL_WHITESPACE);
    }

    ODPCommonUtil.setAttributeNode(htmlNode, classAttr, classBuf.toString());

    posInfo = HtmlConvertUtil.parsePosition(posList, false, context);
    // Handle the Position and Size Style,the value format is %
    if (posInfo != null)
      stylebuf.append(posInfo);

    if (node instanceof DrawTextBoxElement)
    {
      // Set the height and width
      stylebuf.append("width:100%;height:100%;");
      // Set the aria role if not from master style
      Node odfParent = node.getParentNode();
      if (odfParent != null && odfParent instanceof DrawFrameElement)
      {
        String drawLayer = ((Element) odfParent).getAttribute(ODPConvertConstants.ODF_ATTR_DRAW_LAYER);
        if (drawLayer != null && drawLayer.equals(ODPConvertConstants.HTML_VALUE_LAYOUT))
        {
          ((Element) htmlNode).setAttribute(ODFConstants.HTML_ATTR_ARIA_ROLE, ODFConstants.ARIA_ROLE_TEXTBOX);
          ((Element) htmlNode).setAttribute(ODFConstants.HTML_ATTR_ARIA_LABEL, ODFConstants.ARIA_ROLE_TEXTBOX);
        }
      }
    }

    for (Node attrItem : queue)
    {
      String attrName = attrItem.getNodeName();
      String attrVal = attrItem.getNodeValue();
      attrVal = ODPConvertUtil.replaceUnderlineToU(attrVal);

      String htmlAttrName = null;

      // handle different kind of xlink
      if (attrName.equals(ODPConvertConstants.ODF_ATTR_XLINK_HREF))
      {
        if (nodeName.equals(ODPConvertConstants.ODF_ELEMENT_DRAW_IMG))
        {
          htmlAttrName = (String) ODPConvertMapUtil.getJSONMap(ODPConvertMapUtil.MAP_ODF).get(attrName);
          htmlNode.setAttribute("width", "100%");
          htmlNode.setAttribute("height", "100%");
        }
      }
      else
        htmlAttrName = (String) ODPConvertMapUtil.getJSONMap(ODPConvertMapUtil.MAP_ODF).get(attrName);

      if (htmlAttrName != null)
      {
        htmlNode.setAttribute(htmlAttrName, attrVal);
      }
      else
      {
        htmlAttrName = attrName.replace(':', '_');
        htmlNode.setAttribute(htmlAttrName, attrVal);
      }

      if (attrVal.startsWith("./") && !attrVal.startsWith("./ObjectReplacements/"))
        htmlNode.setAttribute(ODPConvertConstants.HTML_ATTR_STYLE, "display:none");

    }

    // The paragraphs are formatted as list items but they do not have a
    // preceding number or bullet.
    if (node instanceof OdfTextListHeader)
    {
      stylebuf.append("list-style:none;");
    }
    ODPCommonUtil.setAttributeNode(htmlNode, styleAttr, stylebuf.toString());

    if (node instanceof DrawPageElement)
    {
      if (context.get(ODPConvertConstants.CONTEXT_TRANSITION_VALUES) != null)
      {
        Map<String, String> transitionMap = (Map<String, String>) context.get(ODPConvertConstants.CONTEXT_TRANSITION_VALUES);
        if (transitionMap != null)
        {
          List<String> transitionEntries = new ArrayList<String>(transitionMap.keySet());
          for (String entry : transitionEntries)
          {
            String attrValue = transitionMap.get(entry);
            String htmlAttrName = entry.replace(':', '_');
            htmlNode.setAttribute(htmlAttrName, attrValue);
          }

          context.remove(ODPConvertConstants.CONTEXT_TRANSITION_VALUES);
        }
      }
    }

    // create new div after draw:text-box for vertical-align
    if (node instanceof DrawTextBoxElement)
    {
      String classAttributes = "";

      Element tableDiv = createHtmlElement(context, node, doc, ODPConvertConstants.HTML_ELEMENT_DIV);
      htmlNode = (Element) htmlNode.appendChild(tableDiv);

      Element cellDiv = createHtmlElement(context, node, doc, ODPConvertConstants.HTML_ELEMENT_DIV);
      cellDiv.setAttribute(ODPConvertConstants.HTML_ATTR_STYLE, "display:table-cell; height:100%; width:100%;");
      htmlNode = (Element) htmlNode.appendChild(cellDiv);

      if (node.getParentNode() instanceof DrawFrameElement)
      {
        List<Node> frameClassList = getClassElements(node.getParentNode(), (OdfDocument) context.getSource(), context);
        classAttributes = parseClassAttribute(frameClassList, context);
        Attr attr = ((Document) context.getTarget()).createAttribute(ODPConvertConstants.HTML_ATTR_CLASS);
        String value = "draw_frame_classes symDefaultStyle " + classAttributes;
        ODPCommonUtil.setAttributeNode(htmlNode, attr, value);

        // find the needed style information to copy inline for Draw Frame Classes div
        processClassProperties(context, classAttributes, htmlNode);
      }

      String tableStyle = ODPConvertConstants.HTML_VALUE_TABLE_DIV_STYLE;
      String marginAdjustment = CSSConvertUtil.getGroupedInlineStyle(context, ODPConvertConstants.HTML_ATTR_MARGIN, classAttributes, true);
      CSSConvertUtil.handleMarginAndPaddingAdjustment(cellDiv, marginAdjustment);
      String paddingAdjustment = CSSConvertUtil
          .getGroupedInlineStyle(context, ODPConvertConstants.HTML_ATTR_PADDING, classAttributes, true);
      CSSConvertUtil.handleMarginAndPaddingAdjustment(cellDiv, paddingAdjustment);
      tableDiv.setAttribute(ODPConvertConstants.HTML_ATTR_STYLE, tableStyle);
    }
    return htmlNode;
  }

  @SuppressWarnings({ "unchecked", "restriction" })
  protected Element parseAttributes2(Node node, Element htmlNode, ConversionContext context)
  {
    Document doc = (Document) context.getTarget();
    OdfDocument odfDoc = (OdfDocument) context.getSource();
    NamedNodeMap attrs = node.getAttributes();
    if (attrs == null)
    {
      if (ODPConvertConstants.HTML_ELEMENT_SPAN.equals(htmlNode.getNodeName()))
      {
        // make sure spans have a line height - necessary because the defaults don't work right
        // so the line height must be adjusted according to the font and font size.
        forceLineHeight(context, htmlNode);
      }
      return htmlNode;
    }
    if (attrs.getLength() >= 0)
    {
      if (ODPConvertConstants.HTML_ELEMENT_SPAN.equals(htmlNode.getNodeName()))
      {
        forceLineHeight(context, htmlNode);
      }
    }

    context.put("htmlElementForSuperSubscript", htmlNode);
    
    boolean flag = false;
    int size = attrs.getLength();
    int capacity = ODPCommonUtil.calculateArrayCapacity(size);
    List<Node> queue = new ArrayList<Node>(capacity);
    
    for (int i = 0; i < size; i++)
    {
      // handler outline font-size
      if (node instanceof DrawFrameElement)
      {
        if (attrs.item(i) instanceof PresentationClassAttribute
            && PresentationClassAttribute.Value.OUTLINE.toString().equals(attrs.item(i).getNodeValue()))
        {
          String preStyleName = attrs.getNamedItem(ODPConvertConstants.ODF_ATTR_PRE_STYLE_NAME) == null ? "" : attrs.getNamedItem(
              ODPConvertConstants.ODF_ATTR_PRE_STYLE_NAME).getNodeValue();
          getFontSizeForList(preStyleName, context);
          flag = true;
        }

        if (i == attrs.getLength() - 1 && flag == false)
        {
          Map<Integer, Double> outlineFontSizeMap = (Map<Integer, Double>) context.get(ODPConvertConstants.CONTEXT_OUTLINE_FONTSIZE_MAP);
          if (outlineFontSizeMap != null)
          {
            outlineFontSizeMap.clear();
          }
        }
      }
      if (!"id".equals(attrs.item(i).getNodeName()))
        queue.add(attrs.item(i));
    }
    StringBuilder stylebuf = new StringBuilder(128);
    Attr styleAttr = doc.createAttribute(ODPConvertConstants.HTML_ATTR_STYLE);
    Attr classAttr = doc.createAttribute(ODPConvertConstants.HTML_ATTR_CLASS);
    String nodeName = node.getNodeName();

    List<Node> posList = HtmlConvertUtil.getPosAttributes(node);
    String posInfo = null;
    queue.removeAll(posList);

    List<Node> classList = getClassElements(node, odfDoc, context);
    String classListNames = ""; // whitespace separated list of class names

    StringBuilder classBuf = new StringBuilder(128);

    if (node instanceof DrawFrameElement
        && ((DrawFrameElement) node).getAttribute(ODPConvertConstants.ODF_ATTR_DRAW_LAYER).equalsIgnoreCase(
            ODPConvertConstants.HTML_VALUE_BACKGROUND))
    {
      boolean inStyleProcessing = (Boolean) context.get(ODPConvertConstants.CONTEXT_IN_STYLE);
      if (inStyleProcessing) // From master style?
      {
        queue.removeAll(classList);
        classList = null;
        classBuf.append("draw_frame ");
        if (node.getChildNodes().item(0) != null && node.getChildNodes().item(0) instanceof DrawImageElement)
        {
          classBuf.append(ODPConvertConstants.HTML_VALUE_BACKGROUND_IMAGE + " ");
        }
      }
      else
      // content
      {
        // Only better have draw:layer="background" for master style pulled in draw:frames
        String presentationClass = ((DrawFrameElement) node).getPresentationClassAttribute();
        if (presentationClass != null && AbstractMasterHtmlConvertor.cvCleanTypes.contains(presentationClass))
        {
          // Re-import problem. Fix up the draw:frame element and process like it was draw:layer="layout"
          ((DrawFrameElement) node).setAttribute(ODPConvertConstants.ODF_ATTR_DRAW_LAYER, ODPConvertConstants.HTML_VALUE_LAYOUT);
        }
        classBuf.append(nodeName.replace(':', '_') + " ");
      }
    }
    else
    {
      classBuf.append(nodeName.replace(':', '_') + " ");
      if (node instanceof DrawPageElement)
      {
        classBuf.append("PM1 border PM1_concord ");
      }
    }
    if (classList != null && !classList.isEmpty())
    {
      // NOTE: The draw:frame's class styles are not processed here (style into new div to ensure vertical alignment works). The
      // draw:frame's class styles are processed late in this method when the child is a draw:text-box or in DrawImageConvertor when the
      // child is a draw:image.
      if (!(node instanceof DrawFrameElement))
      {
        String classinfo = parseClassAttribute(classList, stylebuf, htmlNode, context);
        classBuf.append(classinfo);
        processClassProperties(context, classinfo, htmlNode, stylebuf);
        classListNames = classinfo;
      }

      queue.removeAll(classList);
    }
    else
    {
      // need to update the style info regarding cell colors for p elements with no class properties. This is not
      // normal processing for this call - it is originally designed to be called specifically when processing style
      // info derived from class information - however, circumstances dictate otherwise ....
      if (node instanceof OdfTextParagraph)
      {
        processClassProperties(context, "", htmlNode, stylebuf);
      }
    }

    String oldClassBuf = htmlNode.getAttribute(ODPConvertConstants.HTML_ATTR_CLASS);
    if (oldClassBuf != null && oldClassBuf.length() > 0)
    {
      classBuf.append(oldClassBuf + ODPConvertConstants.SYMBOL_WHITESPACE);
    }

    ODPCommonUtil.setAttributeNode(htmlNode, classAttr, classBuf.toString());

    // mich - task 5149: copy the properties from the css classes to the span's inline style to enable editor buttons
    // gives precedence to (and won't overwrite) any styles already set in stylebuf
    if (node instanceof OdfTextSpan || node instanceof OdfTextSpace ||
    		node instanceof OdfTextDate)
    {
      // makes sure there's something to work with in case unnecessary computing could be avoided
      String trimmedClassListNames = classListNames.trim();
      if (trimmedClassListNames.length() > 0)
      {
        // define a blank css properties group to handle the text properties
        CSSProperties cssPropertiesText = new CSSProperties();
        // add styles from each class in the list
        for (String className : trimmedClassListNames.split("\\s+"))
        {
          Map<String, String> cssStyleMap = CSSConvertUtil.getContextCSSClassStyleMap(context, className);
          cssPropertiesText.setProperties(cssStyleMap, true);
          if(cssStyleMap.containsKey(ODPConvertConstants.CSS_ABS_FONT_SIZE))
        	  HtmlConvertUtil.insertStyleToBodyFirst(context, className+" ");
        }
        // Remove font-size if it is in percent (i.e. if it is for a subscript or superscript)
        // 14851 We no longer import these in percent so removed this logic
        // extract only the text properties
        String textProperties = cssPropertiesText.getPropertiesByFamilyAsString(CSSProperties.FAMILY_TEXT);
        // define a new css properties group this time to merge the text properties we just got with those of stylebuf
        // this two steps approach preserves the styles initially set in stylebuf, and removes any potential dupes
        // while giving precedence to those of stylebuf
        CSSProperties cssPropertiesInline = new CSSProperties(stylebuf.toString(), true);
        cssPropertiesInline.setProperties(textProperties, false);
        Node childNode = node.getFirstChild();
        if(childNode != null && node.getFirstChild().getNodeName().equalsIgnoreCase(ODPConvertConstants.ODF_ELEMENT_TEXT_A)){
        	cssPropertiesInline.removeProperty(ODPConvertConstants.CSS_FONT_SIZE);
        }
        stylebuf = new StringBuilder(128).append(cssPropertiesInline.getPropertiesAsString());
      }
      else if(htmlNode.getNodeName().equalsIgnoreCase("span")){
      	// we still need add font-size style for span element
          double oldParentSize = (Double) context.get(ODPConvertConstants.CONTEXT_PARENT_SIZE);
          if(oldParentSize > 0)
          	stylebuf.append(" " + ODPConvertConstants.CSS_FONT_SIZE + ":" + ConvertUtil.parseFontSizeToString(oldParentSize / ODPConvertConstants.CONTEXT_PARENT_SIZE_DEFAULT)+"em;");
      }
    }

    posInfo = HtmlConvertUtil.parsePosition(posList, false, context);

    // Handle the Position and Size Style,the value format is %
    if (posInfo != null)
      stylebuf.append(posInfo);

    if (node instanceof DrawTextBoxElement)
    {
      // Set the height and width
      stylebuf.append("width:100%;height:100%;");
      // Set the aria role if not from master style
      Node odfParent = node.getParentNode();
      if (odfParent != null && odfParent instanceof DrawFrameElement)
      {
        String drawLayer = ((Element) odfParent).getAttribute(ODPConvertConstants.ODF_ATTR_DRAW_LAYER);
        if (drawLayer != null && drawLayer.equals(ODPConvertConstants.HTML_VALUE_LAYOUT))
        {
          ((Element) htmlNode).setAttribute(ODFConstants.HTML_ATTR_ARIA_ROLE, ODFConstants.ARIA_ROLE_TEXTBOX);
          ((Element) htmlNode).setAttribute(ODFConstants.HTML_ATTR_ARIA_LABEL, ODFConstants.ARIA_ROLE_TEXTBOX);
        }
      }
    }

    for (Node attrItem : queue)
    {
      String attrName = attrItem.getNodeName();
      String attrVal = attrItem.getNodeValue();
      attrVal = ODPConvertUtil.replaceUnderlineToU(attrVal);
      String htmlAttrName = null;

      // handle different kind of xlink
      if (attrName.equals(ODPConvertConstants.ODF_ATTR_XLINK_HREF))
      {
        if (nodeName.equals(ODPConvertConstants.ODF_ELEMENT_DRAW_IMG))
        {
          htmlAttrName = (String) ODPConvertMapUtil.getJSONMap(ODPConvertMapUtil.MAP_ODF).get(attrName);
          stylebuf.append("position:absolute;width:100%;height:100%;");
        }
        else if (node instanceof TextAElement)
        {
          TextAElement a = (TextAElement) node;

          // Default the ALT tag for the case where office:title was not provided
          String alt = a.getAttribute(ODFConstants.OFFICE_TITLE);
          if (alt == null || alt.length() == 0)
          {
            htmlNode.setAttribute(HtmlCSSConstants.ALT, "");
          }

          String xhref = a.getXlinkHrefAttribute();
          htmlAttrName = "href";

          // defect 10273, this text-decoration style was already being set here prior to fixing defect 10273, and while it has
          // its purpose, it's actually the cause of unnecessary style growth so it has to be removed on export
          stylebuf.append(ODPConvertConstants.CSS_TEXT_DECORATION + ODPConvertConstants.SYMBOL_COLON + ODPConvertConstants.HTML_VALUE_NONE
              + ODPConvertConstants.SYMBOL_SEMICOLON);

          // coliva. do not allow relative URLs (including doc links).
          // if the link is not absolute or if the URL scheme is "file", do not
          // convert the href attribute. Instead, simply preserve the URL info as
          // a preserved attribute.

          if (ODPConvertUtil.isAbsoluteURI(xhref))
          {
            if (xhref.toLowerCase().startsWith("file:"))
            {
              htmlAttrName = ODPConvertUtil.createSavedAttributeName(ODPConvertConstants.ODF_ATTR_XLINK_HREF);
            }
          }
          else
          {
            htmlAttrName = ODPConvertUtil.createSavedAttributeName(ODPConvertConstants.ODF_ATTR_XLINK_HREF);
          }

          if (xhref.startsWith("mailto"))
          {
            htmlNode.setAttribute(htmlAttrName, xhref);
            continue;
          }
          else
            htmlNode.setAttribute("target", "_new");
          
          if(xhref.toLowerCase().startsWith("data:") || attrVal.toLowerCase().startsWith("data:")){
        	  htmlAttrName = null;
        	  xhref = "";
        	  attrVal = "";
        	  htmlNode.removeAttribute("target");
          }
          if(attrVal.startsWith("#")){
        	  ArrayList<Element> slideHrefList = (ArrayList<Element>) context.get(ODPConvertConstants.CONTEXT_SLIDE_HREF_LIST);
        	  slideHrefList.add(htmlNode);
          }
        }
        else
          htmlAttrName = (String) ODPConvertMapUtil.getJSONMap(ODPConvertMapUtil.MAP_ODF).get(attrName);
      }
      else if (attrName.equals(ODPConvertConstants.ODF_ATTR_DRAW_TRANSFORM))
      {
    	  /*
    	   * D51546: Improve the rotation of shape/textbox for ODP/PPT.
    	   * The rotation info will add to the first div for shape/textbox 
    	  */
    	  DrawTransformParser.handleTransform(attrItem.getNodeValue(), context, stylebuf);
      }
      else
        htmlAttrName = (String) ODPConvertMapUtil.getJSONMap(ODPConvertMapUtil.MAP_ODF).get(attrName);

      if (htmlAttrName != null)
      {
        htmlNode.setAttribute(htmlAttrName, attrVal);
      }
      else
      {
        if (attrName.equals(ODPConvertConstants.ODF_ATTR_PRESENTATION_CLASS) && attrVal.equals(ODPConvertConstants.NOTES))
        {
          // Symphony only treats notes frames that are in presentation:notes as Speaker Notes. Therefore, we will ignore the attribute
          // unless it is in the pressentation:notes element
          Node parentNode = node.getParentNode();
          if (parentNode instanceof PresentationNotesElement)
          {
            htmlAttrName = attrName.replace(':', '_');
            htmlNode.setAttribute(htmlAttrName, attrVal);
          }
          else
          {
            ((Element) node).removeAttribute(ODPConvertConstants.ODF_ATTR_PRESENTATION_CLASS);
          }
        }
        else
        {
          htmlAttrName = attrName.replace(':', '_');
          htmlNode.setAttribute(htmlAttrName, attrVal);
        }
      }

      if (attrVal.startsWith("./") && !attrVal.startsWith("./ObjectReplacements/"))
        htmlNode.setAttribute(ODPConvertConstants.HTML_ATTR_STYLE, "display:none");
    }

    boolean processFooters = Boolean.valueOf(String.valueOf(context.get(ODPConvertConstants.CONTEXT_PROCESSING_FOOTERS)));
    // krings - Check if value is a field (date, time, page) and set the field attribute in the html
    if (node instanceof OdfTextDate)
    {
      if (processFooters)
      {
        Boolean showHeadFoot = (Boolean) context.get(ODPConvertConstants.CONTEXT_SHOW_HEAD_FOOT);
        if ((null != showHeadFoot) && (showHeadFoot.booleanValue()))
        {
          Map<String, String> headFootMap = (Map<String, String>) context.get(ODPConvertConstants.CONTEXT_DRAWPAGE_HEAD_FOOT);
          String dateStyle = (String) context.get(ODPConvertConstants.CONTEXT_HEAD_FOOT_STYLE);
          String dateFormat = (String) headFootMap.get(dateStyle + ODPConvertConstants.HTML_STYLE_TAG);
          String attrTextFixedValue;
          Element drawFrame = ODPConvertUtil.getDrawFrame(htmlNode);
          // If we don't have a date format, the date is fixed
          if (dateFormat == null || dateFormat.length() == 0)
          {
            attrTextFixedValue = ODPConvertConstants.HTML_VALUE_TRUE;
            // Check to see if null (Symphony pptx defect) footers are not converted correctly
            if (null != context.get(ODPConvertConstants.CONTEXT_HEAD_FOOT_VALUE))
              htmlNode.appendChild(((Document) context.getTarget()).createTextNode((String) context
                  .get(ODPConvertConstants.CONTEXT_HEAD_FOOT_VALUE)));
          }
          else
          {
            attrTextFixedValue = ODPConvertConstants.HTML_VALUE_FALSE;
            htmlNode.appendChild(((Document) context.getTarget()).createTextNode(""));
            drawFrame.setAttribute(ODPConvertConstants.CSS_ATTR_TEXT_DATETIME_FORMAT, dateFormat);
            // Need to get the span element, one level up
            Element nodeParent = (Element) node.getParentNode();
            String styleName = nodeParent.getAttribute("text:style-name");
            String locale = ODPConvertUtil.getLocaleInfo(context, styleName);
            drawFrame.setAttribute(ODPConvertConstants.CSS_ATTR_TEXT_LOCALE, locale);
          }
          drawFrame.setAttribute(ODPConvertConstants.CSS_ATTR_TEXT_FIXED, attrTextFixedValue);
        }
      }
      else
      {
        // "Normal" date field
        htmlNode.setAttribute(ODPConvertConstants.ODF_ELEMENT_FIELD, ODPConvertConstants.ODF_ELEMENT_DATE);
      }
    }

    if (node instanceof OdfTextTime)
    {
      htmlNode.setAttribute(ODPConvertConstants.ODF_ELEMENT_FIELD, ODPConvertConstants.ODF_ELEMENT_TIME);
    }

    if (node instanceof OdfTextAuthorName)
    {
      htmlNode.setAttribute(ODPConvertConstants.ODF_ELEMENT_FIELD, ODPConvertConstants.ODF_ELEMENT_AUTHOR);
    }

    if (node instanceof OdfTextFileName)
    {
      htmlNode.setAttribute(ODPConvertConstants.ODF_ELEMENT_FIELD, ODPConvertConstants.ODF_ELEMENT_FILENAME);
    }

    if (node instanceof OdfTextPageNumber)
    {
      if (processFooters)
      {
        // Get the current page number
        Integer pageNum = PresentationConfig.getCurrentPageNumber(context);
        htmlNode.appendChild(((Document) context.getTarget()).createTextNode(pageNum.toString()));
      }
      else
      {
        htmlNode.setAttribute(ODPConvertConstants.ODF_ELEMENT_FIELD, ODPConvertConstants.ODF_ELEMENT_PAGENUMBER);
        // 15090: Add the presentation_class:page_number. Editor keys off this when updating page numbers
        Element drawFrame = ODPConvertUtil.getDrawFrame(htmlNode);
        if (drawFrame != null)
        {
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
    }

    if (node instanceof OdfPresentationFooter)
    {
      if (processFooters)
      {
        Boolean showHeadFoot = (Boolean) context.get(ODPConvertConstants.CONTEXT_SHOW_HEAD_FOOT);
        if ((null != showHeadFoot) && (showHeadFoot.booleanValue()))
          htmlNode.appendChild(((Document) context.getTarget()).createTextNode((String) context
              .get(ODPConvertConstants.CONTEXT_HEAD_FOOT_VALUE)));
      }
    }

    if (node instanceof OdfPresentationDateTime)
    {
      if (processFooters)
      {
        Boolean showHeadFoot = (Boolean) context.get(ODPConvertConstants.CONTEXT_SHOW_HEAD_FOOT);
        if ((null != showHeadFoot) && (showHeadFoot.booleanValue()))
        {
          Map<String, String> headFootMap = (Map<String, String>) context.get(ODPConvertConstants.CONTEXT_DRAWPAGE_HEAD_FOOT);
          String dateStyle = (String) context.get(ODPConvertConstants.CONTEXT_HEAD_FOOT_STYLE);
          String dateFormat = (String) headFootMap.get(dateStyle + ODPConvertConstants.HTML_STYLE_TAG);
          String attrTextFixedValue;
          Element drawFrame = ODPConvertUtil.getDrawFrame(htmlNode);
          // If we don't have a date format, the date is fixed
          if (dateFormat == null || dateFormat.length() == 0)
          {
            attrTextFixedValue = ODPConvertConstants.HTML_VALUE_TRUE;
            htmlNode.appendChild(((Document) context.getTarget()).createTextNode((String) context
                .get(ODPConvertConstants.CONTEXT_HEAD_FOOT_VALUE)));
          }
          else
          {
            attrTextFixedValue = ODPConvertConstants.HTML_VALUE_FALSE;
            htmlNode.appendChild(((Document) context.getTarget()).createTextNode(""));
            drawFrame.setAttribute(ODPConvertConstants.CSS_ATTR_TEXT_DATETIME_FORMAT, dateFormat);
          }
          drawFrame.setAttribute(ODPConvertConstants.CSS_ATTR_TEXT_FIXED, attrTextFixedValue);
        }
      }
    }

    // The paragraphs are formatted as list items but they do not have a
    // preceding number or bullet.
    if (node instanceof OdfTextListHeader)
    {
      stylebuf.append("list-style:none;");
    }

    ODPCommonUtil.setAttributeNode(htmlNode, styleAttr, stylebuf.toString());
    // if (node.getNodeName().equalsIgnoreCase(ODPConvertConstants.ODF_ELEMENT_PRESENTATION))
    // htmlNode.setAttribute("id", "office_prez");

    // create new div after draw:text-box for vertical-align
    if (node instanceof DrawTextBoxElement)
    {
      String classAttributes = "";

      Element tableDiv = createHtmlElement(context, node, doc, ODPConvertConstants.HTML_ELEMENT_DIV);
      htmlNode = (Element) htmlNode.appendChild(tableDiv);

      Element cellDiv = createHtmlElement(context, node, doc, ODPConvertConstants.HTML_ELEMENT_DIV);

      cellDiv.setAttribute(ODPConvertConstants.HTML_ATTR_STYLE, "display:table-cell; height:100%; width:100%;");
      htmlNode = (Element) htmlNode.appendChild(cellDiv);

      if (node.getParentNode() instanceof DrawFrameElement)
      {
        List<Node> frameClassList = getClassElements(node.getParentNode(), odfDoc, context);
        classAttributes = parseClassAttribute(frameClassList, null, htmlNode, context);
        Attr attr = doc.createAttribute(ODPConvertConstants.HTML_ATTR_CLASS);
        String value = "draw_frame_classes symDefaultStyle " + classAttributes;
        ODPCommonUtil.setAttributeNode(htmlNode, attr, value);

        // find the needed style information to copy inline for Draw Frame Classes div
        processClassProperties(context, classAttributes, htmlNode);
      }

      Element drawFrame = ODPConvertUtil.getDrawFrame(cellDiv);
      boolean applyMasterStyleInfo = CSSConvertUtil.isBackgroundObject(drawFrame);

      String tableStyle = ODPConvertConstants.HTML_VALUE_TABLE_DIV_STYLE;
      String marginAdjustment = CSSConvertUtil.getGroupedInlineStyle(context, ODPConvertConstants.HTML_ATTR_MARGIN, classAttributes, true);
      if (drawFrame != null && applyMasterStyleInfo)
        marginAdjustment = CSSConvertUtil.applyMasterStyleMarginAndPadding(drawFrame, marginAdjustment);
      CSSConvertUtil.handleMarginAndPaddingAdjustment(cellDiv, marginAdjustment);
      String paddingAdjustment = CSSConvertUtil
          .getGroupedInlineStyle(context, ODPConvertConstants.HTML_ATTR_PADDING, classAttributes, true);
      if (drawFrame != null && applyMasterStyleInfo)
        paddingAdjustment = CSSConvertUtil.applyMasterStyleMarginAndPadding(drawFrame, paddingAdjustment);

      // if (drawFrame != null) {
      // if (CSSConvertUtil.isBackgroundObject(drawFrame) && CSSConvertUtil.isAutomaticStyle(classAttributes))
      // {
      // String[] paddingValues = paddingAdjustment.split(ODPConvertConstants.SYMBOL_WHITESPACE);
      // double top = Measure.extractNumber(paddingValues[0]) / 100;
      // double right = Measure.extractNumber(paddingValues[1]) / 100;
      // double bottom = Measure.extractNumber(paddingValues[2]) / 100;
      // double left = Measure.extractNumber(paddingValues[3]) / 100;
      //
      // String style = drawFrame.getAttribute("style");
      // double width = CSSConvertUtil.getDrawFrameWidth(style) / 100;
      //
      // double newTop = top / width * 100;
      // double newBottom = bottom / width * 100;
      //
      // double newRight = right / width * 100;
      // double newLeft = left / width * 100;
      //
      // paddingAdjustment = Double.toString(newTop) + ODPConvertConstants.SYMBOL_PERCENT + ODPConvertConstants.SYMBOL_WHITESPACE;
      // paddingAdjustment += Double.toString(newRight) + ODPConvertConstants.SYMBOL_PERCENT + ODPConvertConstants.SYMBOL_WHITESPACE;
      // paddingAdjustment += Double.toString(newBottom) + ODPConvertConstants.SYMBOL_PERCENT + ODPConvertConstants.SYMBOL_WHITESPACE;
      // paddingAdjustment += Double.toString(newLeft) + ODPConvertConstants.SYMBOL_PERCENT;
      // }
      // }
      CSSConvertUtil.handleMarginAndPaddingAdjustment(cellDiv, paddingAdjustment);
      String styleStr = cellDiv.getAttribute(ODPConvertConstants.HTML_ATTR_STYLE);
      if(styleStr != null && styleStr.contains("vertical-writing:tb-rl")){
    	  styleStr = styleStr.replaceAll("vertical-writing:tb-rl;", "");
    	  cellDiv.setAttribute(ODPConvertConstants.HTML_ATTR_STYLE, styleStr);
    	  if (drawFrame != null){
    		  String clsStr = drawFrame.getAttribute("class").trim();
    		  clsStr += " verticalWriting";
    		  drawFrame.setAttribute("class", clsStr);
    	  }
      }
      tableDiv.setAttribute(ODPConvertConstants.HTML_ATTR_STYLE, tableStyle);
    }

    context.remove("htmlElementForSuperSubscript");
    
    return htmlNode;
  }

  protected String parseClassAttribute(List<Node> attr, StringBuilder buf, Element htmlNode, ConversionContext context)
  {
    StringBuilder classBuf = new StringBuilder(128);

    int fontSizeFound = 0;

    Boolean skipInlineStyle = (Boolean) context.get(ODPConvertConstants.CONTEXT_DISABLE_INLINE_STYLE_PROCESS);
    if (skipInlineStyle == null)
    {
      skipInlineStyle = false;
    }

    ODPConvertConstants.DOCUMENT_TYPE documentType = (ODPConvertConstants.DOCUMENT_TYPE) context
        .get(ODPConvertConstants.CONTEXT_DOCUMENT_TYPE);

    for (Node classAttrItem : attr)
    {
      int styleInstance = 0;
      String styleName = ODPConvertStyleMappingUtil.getCanonicalStyleName(classAttrItem.getNodeValue());
      double size = ODPConvertConstants.CONTEXT_PARENT_SIZE_DEFAULT; 
      List<Node> l = ODPConvertStyleMappingUtil.getStyleNameInContentNodesByKey(context, styleName);

      // 13035 - Need to set the correct inline font-size for master.html as well as content.html

      // NOTE: Older ODF documents sometimes have the same named styles in styles.xml as in content.xml. Make sure we only enter this leg
      // when we are processing the content.xml.
      if ((l != null) && (documentType == ODPConvertConstants.DOCUMENT_TYPE.CONTENT))
      {
        Node style = l.get(0);

        String fontSize = getFontSize(style);
        String superSubAdjustment = getSuperSubscriptPercentage(style);
        if (fontSize != null && !fontSize.equals("nullpt"))
        {
          fontSizeFound = fontSizeFoundF(fontSizeFound, styleName, fontSize);

          double currSize = extractFontSizeInPT(fontSize);

          if (currSize != 0.0)
          {            
            if (superSubAdjustment != null)
            {
              int index = superSubAdjustment.indexOf("%");
              double adjustment = Double.parseDouble(superSubAdjustment.substring(0, index));
              currSize = currSize * adjustment / 100;
            }

            if (buf != null && !skipInlineStyle)
            {
              if (size != 0.0)
              {
//                buf.append(ODPConvertUtil.formatAttribute(ODPConvertConstants.CSS_FONT_SIZE, MeasurementUtil.formatDecimal(currSize / size)
//                    + "em"));
              }
              // The parent font size may not be set yet, so the Super/Subscript font
              // adjustment needs to be performed relative to the Default Font Size
              else if (superSubAdjustment != null)
              {
//                buf.append(ODPConvertUtil.formatAttribute(ODPConvertConstants.CSS_FONT_SIZE,
//                    MeasurementUtil.formatDecimal(currSize / ODPConvertConstants.CONTEXT_PARENT_SIZE_DEFAULT) + "em"));
              }
            }
            if(htmlNode != null && !skipInlineStyle){
            	setHtmlFontSize(htmlNode,currSize,true,false);
            }
            // concordNode.setParentFontSize(currSize);
            context.put(ODPConvertConstants.CONTEXT_PARENT_SIZE, currSize);
          }
        }
        try
        {
          styleInstance = convertStylesInContent(style, size, context);
        }
        catch (Exception e)
        {
          String message = ODPCommonUtil.createMessage(ODPCommonUtil.LOG_UNEXPECTED_EXCEPTION_IN, CLASS + ".parseClassAttribute");
          ODPCommonUtil.logException(context, Level.WARNING, message, e);
        }
      }
      else
      {
        l = ODPConvertStyleMappingUtil.getStyleNameInStyleNodesByKey(context, styleName);
        // Map<String, List<Node>> sytleMap = (Map<String, List<Node>>) context.get(ODPConvertConstants.CONTEXT_SYTLENAME_NODES_MAP);
        // List<Node> l=sytleMap.get(styleName);
        Node style;
        if (l != null && (style = l.get(0)) != null)
        {
          String fontSize = getFontSize(style);
          
          if (fontSize != null)
          {
            fontSizeFound = fontSizeFoundF(fontSizeFound, styleName, fontSize);
            double currSize = extractFontSizeInPT(fontSize);
          
            if( htmlNode != null && currSize != 0.0 && !skipInlineStyle)
            {
            	if((styleName.toLowerCase().startsWith("p") && htmlNode.getNodeName().equalsIgnoreCase("p"))||(styleName.toLowerCase().startsWith("t")&& htmlNode.getNodeName().equalsIgnoreCase("span"))){
            		setHtmlFontSize(htmlNode,currSize,true,false);                
            	}
            }
  
            if (size != 0.0)
            {
              if (currSize != 0.0)
              {
                if (buf != null && !skipInlineStyle)
                {
                  if(htmlNode != null && !htmlNode.getNodeName().equalsIgnoreCase("p"))
                	buf.append(ODPConvertUtil.formatAttribute("font-size", MeasurementUtil.formatDecimal(currSize / size) + "em"));
                }
                context.put(ODPConvertConstants.CONTEXT_PARENT_SIZE, currSize);
              }
            }
            else
            {
              /**
               * Defect:39844: Incorrect Default text-box font-size and bullet font-size Conversion There's a conflict in two situations:
               * 1:One ODP only with Default text-box and the font size changed. 2:One ODP with one default text-box and another new created
               * text-box and their font size keep the same. You will see the font size is different in the two situations. TODO:Just fixed
               * the conflict and there will be more smart way to resolve the font size problem.
               */
              // roll back
              /*
               * if(styleName.indexOf("_Default_")!=-1&&classAttrItem instanceof
               * StyleParentStyleNameAttribute&&styleName.indexOf("outline")==-1){ parentSize=ODPConvertConstants.CONTEXT_PARENT_SIZE_DEFAULT;
               * }
               */
              context.put(ODPConvertConstants.CONTEXT_PARENT_SIZE, currSize);
            }
          }
        }
      }
      if (styleInstance > 0)
      {
        styleName = styleName + "_" + styleInstance + "_" + ODPConvertConstants.STYLE_COPY_IDENTIFIER;
      }
      classBuf.append(ODPConvertUtil.replaceUnderlineToU(styleName)).append(" ");
    }
    return classBuf.toString();
  }

  protected int fontSizeFoundF(int count, String stylename, String size)
  {
    if (count > 0)
    {
      LOG.fine("FontSize overlapping styles detected: " + stylename + " size: " + size);
    }

    return count++;
  }

  // private String getFontSizeFromParent(Node style,ConversionContext context)
  // {
  // // get the parent style
  // NamedNodeMap map = style.getAttributes();
  // String fontSize = null;
  // if (map != null)
  // {
  // Node parent = map.getNamedItem("style:parent-style-name");
  // if (parent != null)
  // {
  // String parentName = parent.getNodeValue();
  // if (!"".equals(parentName))
  // {
  // List<Node> nl = ODPConvertStyleMappingUtil.getStyleNameInStyleNodesByKey(context, parentName);
  // if (nl != null)
  // {
  // Node n = nl.get(0);
  // fontSize = getFontSize(n);
  // }
  // }
  // }
  // }
  // return fontSize;
  // }

  protected String getFontSize(Node style)
  {
    String fontSize = null;

    NamedNodeMap map = style.getAttributes();
    if (map != null)
    {
      Node node = map.getNamedItem(ODPConvertConstants.ODF_ATTR_FONT_SIZE);

      if (node != null)
        return fontSize = node.getNodeValue();
      else
      {
        NodeList children = style.getChildNodes();
        for (int i = 0; i < children.getLength(); i++)
        {
          Node child = children.item(i);
          if (child.getNodeName().equalsIgnoreCase(ODPConvertConstants.ODF_ATTR_STYLE_TEXT_PROPERTIES))
          {
            Node fontSizeAttr = child.getAttributes().getNamedItem(ODPConvertConstants.ODF_ATTR_FONT_SIZE);
            if (fontSizeAttr != null)
            {
              fontSize = fontSizeAttr.getNodeValue();
              break;
            }
          }
        }
      }
    }
    return fontSize;
  }

  protected String getSuperSubscriptPercentage(Node style)
  {
    String fontSize = null;

    NamedNodeMap map = style.getAttributes();
    if (map != null)
    {
      Node node = map.getNamedItem(ODPConvertConstants.ODF_ATTR_STYLE_TEXT_POSITION);

      if (node != null)
      {
        fontSize = node.getNodeValue();
        String[] strs = fontSize.split(" ");
        fontSize = strs[1];
      }
      else
      {
        NodeList children = style.getChildNodes();
        for (int i = 0; i < children.getLength(); i++)
        {
          Node child = children.item(i);
          if (child.getNodeName().equalsIgnoreCase(ODPConvertConstants.ODF_ATTR_STYLE_TEXT_PROPERTIES))
          {
            Node fontSizeAttr = child.getAttributes().getNamedItem(ODPConvertConstants.ODF_ATTR_STYLE_TEXT_POSITION);
            if (fontSizeAttr != null)
            {
              fontSize = fontSizeAttr.getNodeValue();
              String[] strs = fontSize.split(" ");
              fontSize = strs[1];
              break;
            }
          }
        }
      }
    }
    return fontSize;
  }

  protected boolean isBackgroundFrame(Node htmlNode)
  {
    NamedNodeMap x = htmlNode.getAttributes();
    for (int y = 0; y < x.getLength(); y++)
    {
      if (x.item(y).getNodeValue().equals(ODPConvertConstants.HTML_VALUE_BACKGROUND))
      {
        return true;
      }
    }
    return false;
  }

  @SuppressWarnings("unchecked")
  private void getFontSizeForList(String preStyleName, ConversionContext context)
  {
    String outlinePrefix;
    OdfDocument odfDoc = (OdfDocument) context.getSource();

    List<Node> refList = ODPConvertStyleMappingUtil.getAllStyleNameNodesByKey(context, preStyleName);
    // NodeList refList = ODPConvertUtil.search(ODPConvertConstants.ODF_ATTR_STYLE_NAME, preStyleName, odfDoc);
    for (int j = 0; refList != null && j < refList.size(); j++)
    {
      Node refNode = refList.get(j);
      if (HtmlConvertUtil.hasParentStyleName(refNode))
      {
        String rawoutlinePrefix = null;
        String textPropertyValue = null;
        try
        {
          Node parentNode = HtmlConvertUtil.getParentStyleName(refNode);

          rawoutlinePrefix = parentNode.getNodeValue();
          rawoutlinePrefix = rawoutlinePrefix.substring(0, rawoutlinePrefix.length() - 1);

          outlinePrefix = ODPConvertStyleMappingUtil.getCanonicalStyleName(rawoutlinePrefix);
          String contextOutlineStyleName = ODPConvertUtil.replaceUnderlineToU(outlinePrefix);
          context.put(ODPConvertConstants.CONTEXT_LIST_OUTLINE_STYLE_NAME, contextOutlineStyleName);

          String fontSize;
          OdfStyle style;
          OdfStylePropertiesBase textProperty;
          OdfOfficeStyles officeStyles = odfDoc.getStylesDom().getOfficeStyles();
          for (int outline_index = 0; outline_index < 9; outline_index++)
          {
            style = officeStyles.getStyle(rawoutlinePrefix + (outline_index + 1), OdfStyleFamily.Presentation);
            if (style != null)
            {
              textProperty = style.getPropertiesElement(OdfStylePropertiesSet.TextProperties);
              textPropertyValue = textProperty.getOdfAttributeValue(FoFontSizeAttribute.ATTRIBUTE_NAME);
              fontSize = textPropertyValue.substring(0, textPropertyValue.indexOf("pt"));

              Map<Integer, Double> outlineFontSizeMap = (Map<Integer, Double>) context
                  .get(ODPConvertConstants.CONTEXT_OUTLINE_FONTSIZE_MAP);
              if (outlineFontSizeMap == null)
              {
                outlineFontSizeMap = new HashMap<Integer, Double>();
                context.put(ODPConvertConstants.CONTEXT_OUTLINE_FONTSIZE_MAP, outlineFontSizeMap);
              }

              outlineFontSizeMap.put(outline_index, Double.parseDouble(fontSize));
            }
          }
        }
        catch (StringIndexOutOfBoundsException e)
        {
          String message = ODPCommonUtil.createMessage(ODPCommonUtil.LOG_LIST_FONT_STYLE, rawoutlinePrefix, textPropertyValue);
          ODPCommonUtil.logContext(context);
          ODPCommonUtil.logMessage(Level.WARNING, message);
        }
        catch (Exception e)
        {
          String message = ODPCommonUtil.createMessage(ODPCommonUtil.LOG_UNEXPECTED_EXCEPTION_IN, CLASS + ".getFontSizeForList");
          ODPCommonUtil.logException(context, Level.WARNING, message, e);
        }
      }
    }
  }

  /**
   * Construct a style string based on the CSS properties passed in to props hash map. Any style information found in the style classes
   * listed in slist are combined and returned as a style string.
   * 
   * @param context
   * @param props
   *          - list of new properties. The value of the entries should be null - they will be populated from the styles referenced in slist
   *          (if found).
   * @param slist
   *          - space separated list of style names to search for CSS information.
   * @return the new style string including old and new style info
   */
  static public String constructStyleString(ConversionContext context, LinkedHashMap<String, String> props, String slist)
  {
    if (props == null || props.isEmpty())
      return null;

    if (slist == null || slist.length() == 0)
      return null;

    if (CSSConvertUtil.getAttributeValues(context, props, slist) == 0)
      return null;

    CSSProperties cp = new CSSProperties();

    // defect 9864, list of props that should not end up in the style string
    HashSet<String> skipProps = new HashSet<String>();
    skipProps.add(ODPConvertConstants.CSS_VALUE_OVERLINE);
    skipProps.add(ODPConvertConstants.CSS_VALUE_STRIKETHROUGH);
    skipProps.add(ODPConvertConstants.CSS_VALUE_UNDERLINE);

    for (Map.Entry<String, String> e : props.entrySet())
    {
      if (e.getValue() == null || e.getValue().length() == 0)
      {
        // LOG.fine("constructStyleString: CSS style property " + e.getKey() + " not found.");
        continue;
      }
      if (skipProps.contains(e.getKey()))
      {
        continue;
      }
      cp.setProperty(e.getKey(), e.getValue());
    }

    if (cp.size() == 0)
      return null;

    return cp.getPropertiesAsString();
  }

  /**
   * Process the given class properties. This must include at a minimum the following attributes: background, background-color, and color.
   * The inline information is modified with the color properties and automatic colors are also checked. This method also figures out the
   * applicable text-decoration style previously put on hold and allows calling the necessary method to handle it.
   * 
   * @param context
   *          - the current conversion context
   * @param styleList
   *          - list of style names from the current node, these styles are checked to extract the named properties
   * @param htmlNode
   *          - the current html node
   * @param buff
   *          - string buffer to modify, if buff is null the htmlNode style attribute is updated, otherwise the style info is updated in
   *          buff
   */
  static public void processClassProperties(ConversionContext context, String styleList, Element htmlNode, StringBuilder buff)
  {
    // check to see if we should skip this processing. This will prevent in-line styles from being added to the current
    // node, particularly the color processing. Also this will affect all nodes below the current node as the stackable
    // properties will not get updated.

    Boolean skip = (Boolean) context.get(ODPConvertConstants.CONTEXT_DISABLE_INLINE_STYLE_PROCESS);
    if (skip != null && skip.booleanValue())
    {
      return;
    }

    if (styleList == null || styleList.length() == 0)
    {
      return;
    }

    LinkedHashMap<String, String> props = new LinkedHashMap<String, String>();
    props.put("vertical-writing", null);
    props.put(ODPConvertConstants.CSS_BACKGROUND_COLOR, null);
    props.put(ODPConvertConstants.CSS_BACKGROUND, null);
    props.put(ODPConvertConstants.CSS_FONT_COLOR, null);
    props.put(ODPConvertConstants.CSS_VERTICAL_ALIGN, null);
    props.put(ODPConvertConstants.CSS_LINE_HEIGHT, null);
    props.put("pt-"+ODPConvertConstants.CSS_LINE_HEIGHT, null);
    // defect 9864, these are text-decoration values used as fake CSS properties in the CONTEXT_CSS_ON_HOLD_STYLE context hash
    props.put(ODPConvertConstants.CSS_VALUE_OVERLINE, null);
    props.put(ODPConvertConstants.CSS_VALUE_STRIKETHROUGH, null);
    props.put(ODPConvertConstants.CSS_VALUE_UNDERLINE, null);

    boolean setStyleInNode = (buff == null);

    CSSProperties cp = new CSSProperties();

    // Make sure to read in the current style information for the node so we don't
    // end up with duplicated information later on.

    if (setStyleInNode)
    {
      Node styleAttr = htmlNode.getAttributes().getNamedItem(ODPConvertConstants.HTML_ATTR_STYLE);
      if (styleAttr != null)
        cp.setProperties(styleAttr.getNodeValue(), true);
    }
    else
    {
      cp.setProperties(buff.toString(), true);
    }

    boolean styleChanged = false;

    String newStyle = constructStyleString(context, props, styleList);
    if (newStyle != null)
    {
      cp.setProperties(newStyle, true);
      styleChanged = true;
    }

    if (adjustLineHeight(context, htmlNode, props))
    {
      styleChanged = true;
      cp.setProperty(ODPConvertConstants.CSS_LINE_HEIGHT, props.get(ODPConvertConstants.CSS_LINE_HEIGHT));
    }
    cp.setProperty(ODPConvertConstants.CSS_FONT_SIZE,props.get(ODPConvertConstants.CSS_FONT_SIZE));
	CSSProperties customCP = new CSSProperties(htmlNode.getAttribute(ODPConvertConstants.HTML_ATTR_CUSTOMSTYLE), true);
	customCP.setProperty(ODPConvertConstants.CSS_ABS_FONT_SIZE,props.get(ODPConvertConstants.CSS_ABS_FONT_SIZE));
	htmlNode.setAttribute(ODPConvertConstants.HTML_ATTR_CUSTOMSTYLE, customCP.getPropertiesAsString());
    // defect 9864, process the text-decoration style to set the styletemplate attribute in the html node and merge the
    // text-decoration style in the stackable properties
    TextDecorationHandler.processStyle(context, props, htmlNode);

    String autoColor = checkFontColorProperties(context, htmlNode, props, styleList);
    if (autoColor != null)
    {
      cp.setProperties(autoColor, true);
      styleChanged = true;
    }

    if (!styleChanged)
    {
      return;
    }

    if (setStyleInNode)
    {
      htmlNode.setAttribute(ODPConvertConstants.HTML_ATTR_STYLE, cp.getPropertiesAsString());
    }
    else
    {
      buff.delete(0, buff.length());
      buff.append(cp.getPropertiesAsString());
    }
  }

  /**
   * This is called when the element being converted has no style information or we want to force the html node to have a line height. In
   * this case, the node's style info is ignored (or it doesn't exist) and we force the line height to be caculated based on the font
   * information from the context (if the element has style info it will be within the stackableProperties anyway).
   * 
   * @param context
   * @param htmlNode
   */
  static public void forceLineHeight(ConversionContext context, Element htmlNode)
  {
    LinkedHashMap<String, String> tmp = new LinkedHashMap<String, String>();

    if (adjustLineHeight(context, htmlNode, tmp))
    {
      Document doc = (Document) context.getTarget();
      CSSProperties cp = new CSSProperties(htmlNode.getAttribute(ODPConvertConstants.HTML_ATTR_STYLE), true);
      cp.setProperty(ODPConvertConstants.CSS_LINE_HEIGHT, tmp.get(ODPConvertConstants.CSS_LINE_HEIGHT));
      String vertical_align = cp.getProperty(ODPConvertConstants.CSS_VERTICAL_ALIGN);
      if(vertical_align != null && (vertical_align.equalsIgnoreCase("sub")
      		|| vertical_align.equalsIgnoreCase("super"))){
      	double font_size = Measure.extractNumber(tmp.get(ODPConvertConstants.CSS_FONT_SIZE));
      	if(font_size > 0){
      		font_size *= SCRIPT_RATION;
      		cp.setProperty(ODPConvertConstants.CSS_FONT_SIZE, font_size+"em");
      	}
      	else
        	cp.setProperty(ODPConvertConstants.CSS_FONT_SIZE, tmp.get(ODPConvertConstants.CSS_FONT_SIZE));
      }
      else
      cp.setProperty(ODPConvertConstants.CSS_FONT_SIZE, tmp.get(ODPConvertConstants.CSS_FONT_SIZE));
      Attr styleAttr = doc.createAttribute(ODPConvertConstants.HTML_ATTR_STYLE);
      ODPCommonUtil.setAttributeNode(htmlNode, styleAttr, cp.getPropertiesAsString());

    }
  }

  /**
   * Calculate the line height on a node. This will apply the adjustment from the font metric by calculating a percentage increment that is
   * equal to the percentage the font metric line height is bigger than the pt size of the current font size. Will grab the font info from
   * the stackable properties: font pt size, font name, and the raw line height value (or default to the CSS style values - except for line
   * height which uses the CSS style value if it's there, otherwise gets the value from the stack).
   * 
   * @param context
   * @param htmlNode
   * @param props
   *          - will use style infor for
   * @return true if line
   */
  static public boolean adjustLineHeight(ConversionContext context, Element htmlNode, LinkedHashMap<String, String> props)
  {
    try
    {
      return adjustLineHeightImpl(context, htmlNode, props);
    }
    catch (NumberFormatException e)
    {
      String message = ODPCommonUtil.createMessage(ODPCommonUtil.LOG_UNEXPECTED_EXCEPTION_IN, CLASS + ".adjustLineHeight");
      ODPCommonUtil.logException(context, Level.WARNING, message, e);

      return false;
    }
  }

  static public boolean adjustLineHeightImpl(ConversionContext context, Element htmlNode, LinkedHashMap<String, String> props)
      throws NumberFormatException
  {
    // First check to see if there is any point to performing the calculation. Proceed if any of the following are true:
    // - the font name/size is specified in the style information for this node (by checking stack current level)
    // - the line-height is specified in this node's style info (by checking the props passed in which was extracted
    // earlier by checking the style nodes). This could also have been done by checking the stack current level but
    // gives some extra flexibility if special calls need to be made.
    //
    // Font size is obtained in pt in order of preference:
    // - from the stack
    // - use the context parent size
    // - use the default font size (18pt)
    //
    // Font name is obtained from the stack - this MUST be present otherwise the whole thing is abandoned and exits. This
    // is because the font name is a vital part of the font metric definition.
    //
    // Line height is obtained (as a percentage ratio) in order of preference:
    // - from the stack
    // - from the props passed in (likely obtained from the node style info)
    // - default to 1.0
    //
    // An attempt is made to force the span and paragraph to have a line height. This is to try and make
    // sure line height is always set.

    Double parentFontSize = (Double) context.get(ODPConvertConstants.CONTEXT_PARENT_SIZE);

    StackableProperties sp = (StackableProperties) context.get(ODPConvertConstants.CONTEXT_STACKABLE_PROPERTIES);
    if (sp == null)
    {
      return false;
    }

    StackableProperties.Properties curr = sp.getCurrent();
    if (curr == null)
    {
      LOG.warning("Unexpected style definition. stack current node is null");
      return false;
    }
    if (curr.getMap() == null)
    {
      LOG.warning("Unexpected style definition. stack current node map is empty");
      return false;
    }

    StackableProperties.StringProperty fontName = curr.getMap().get(ODPConvertConstants.CSS_FONT_FAMILY);
    StackableProperties.StringProperty currFontSize = curr.getMap().get(ODPConvertConstants.CSS_FONT_SIZE);
    String lineHeight = props.get(ODPConvertConstants.CSS_LINE_HEIGHT);
    String lineHeightPT = props.get("pt-"+ODPConvertConstants.CSS_LINE_HEIGHT);
    boolean inParagraph = ODPConvertConstants.HTML_ELEMENT_P.equalsIgnoreCase(htmlNode.getNodeName());
    boolean inSpan = ODPConvertConstants.HTML_ELEMENT_SPAN.equalsIgnoreCase(htmlNode.getNodeName());

    if (fontName == null && lineHeight == null && currFontSize == null && !inParagraph && !inSpan)
    {
      return false;
    }

    Double fontSize = Double.valueOf(ODPConvertConstants.CONTEXT_PARENT_SIZE_DEFAULT);
    if (parentFontSize != null)
    {
      fontSize = parentFontSize;
    }
    if(currFontSize !=null ){
    	String stackFontSize = currFontSize.getValue();
    	fontSize = Double.valueOf(stackFontSize);
    }

    if (fontSize == null)
    {
      return false;
    }

    if(fontSize != parentFontSize) {
        String absfont = "";
        if(fontSize==10.5) {
        	absfont = MeasurementUtil.formatDecimal(fontSize.doubleValue(),1);
        } else {
        	absfont = MeasurementUtil.formatDecimal(fontSize.doubleValue(),0);
        }
        props.put(ODPConvertConstants.CSS_ABS_FONT_SIZE,absfont);
        
       if (inSpan) {
    	   props.put(ODPConvertConstants.CSS_FONT_SIZE,ConvertUtil.parseFontSizeToString(fontSize / ODPConvertConstants.CONTEXT_PARENT_SIZE_DEFAULT)+"em");
    	   setHtmlFontSize(htmlNode,fontSize,false,true);
       } else if(inParagraph) {
    	   setHtmlFontSize(htmlNode,fontSize,true,false);
       }
    } else {
    	 if(inSpan) {
    		 props.put(ODPConvertConstants.CSS_FONT_SIZE,ConvertUtil.parseFontSizeToString(fontSize / ODPConvertConstants.CONTEXT_PARENT_SIZE_DEFAULT)+"em");
    		 setHtmlFontSize(htmlNode,fontSize,false,true);
         }
    }
    
    double lhd = 1.2558;
    if (lineHeight != null)
    {
      lhd = Double.parseDouble(lineHeight);
      sp.addProperty(ODPConvertConstants.CSS_LINE_HEIGHT, lineHeight, StackableProperties.Type.CSS, null);
    }
    else
    {
      String stackLH = sp.getValue(ODPConvertConstants.CSS_LINE_HEIGHT).getValue();
      if (stackLH != null)
      {
        lhd = Double.parseDouble(stackLH);
        if (lhd <= 0)
        {
          LOG.info("Unexpected  style definition. Could not parse stack lineheight: " + stackLH);
          return true;
        }
      }
    }
    double scale = 1.2558;
    // the will be a magic number to transform line spacing value to HTML linehieght  it's 1.2558.
    // the AVERAGE value of the Scale is 1.2558
    // the STDEV is 0.0182
    // the deviation is about 2.2%. in brower will be only 1-2 px. 
    // so inorder to make logical simple clear just use 1.2558 as the magical munber for lineheight scale. 
    if(lineHeightPT!=null){
    	sp.addProperty("pt-"+ODPConvertConstants.CSS_LINE_HEIGHT, lineHeightPT, StackableProperties.Type.CSS, null);
    }
    StringProperty lineHeightPTs = sp.getValue("pt-"+ODPConvertConstants.CSS_LINE_HEIGHT);
    if(lineHeightPTs!=null && lineHeightPTs.getValue()!=null){
    	lhd = scale * (Double.parseDouble(lineHeightPTs.getValue()) / fontSize.doubleValue());
    }
    if(inParagraph) {
    	CSSProperties absLHcp = new CSSProperties(htmlNode.getAttribute(ODPConvertConstants.HTML_ATTR_CUSTOMSTYLE), true);
    	absLHcp.setProperty("abs-"+ODPConvertConstants.CSS_LINE_HEIGHT, MeasurementUtil.formatDecimal(lhd/scale));
		htmlNode.setAttribute(ODPConvertConstants.HTML_ATTR_CUSTOMSTYLE, absLHcp.getPropertiesAsString());
    }
    props.put(ODPConvertConstants.CSS_LINE_HEIGHT, MeasurementUtil.formatDecimal(lhd));
    return true;
  }

  /**
   * Similar to processClassProperties(context,styleList,htmlNode,buff) execpt the htmlNode style information will be used in place of buff
   * for style information and the htmlNode will be updated with any new style information.
   * 
   * @param context
   * @param styleList
   * @param htmlNode
   */
  static public void processClassProperties(ConversionContext context, String styleList, Element htmlNode)
  {
    processClassProperties(context, styleList, htmlNode, null);
  }

  /**
   * Will check the font color properties for automatic colors. If the color must be set, the color string will be returned as a style
   * string. The passed in props must include background, background-color and color - those properties must be extracted from the current
   * node's style information. If props is null, those properties are checked by default. Note, if auto color information is needed, the
   * html element will have the automatic_Color attribute added to it.
   * 
   * @param context
   * @param htmlNode
   *          the current html node
   * @param props
   *          the hashmap of properties to extract. If null the default applies.
   * @param slist
   *          list of style attributes from the current node. Must be set if props is null.
   * @return the color style info if necessary, otherwise null
   */
  static public String checkFontColorProperties(ConversionContext context, Element htmlNode, LinkedHashMap<String, String> props,
      String slist)
  {
    StackableProperties sp = (StackableProperties) context.get(ODPConvertConstants.CONTEXT_STACKABLE_PROPERTIES);

    if (sp == null)
    {
      return null;
    }

    // check to see if we have table cell color defined. The table cell color is extracted and removed from the cell style and
    // put in the stackable properties so we have to explicitly check for that. If the table cell color is defined, there's no
    // point in trying to calculate an automatic color.

    boolean inTableCell = ODPConvertConstants.HTML_ELEMENT_TD.equalsIgnoreCase(htmlNode.getNodeName());

    if (inTableCell)
    {
      if (sp.getValue(ODPConvertConstants.HTML_ATTR_CELL_COLOR).getValue() != null)
        return null;
    }

    String returnValue = null;

    // Note about master page styles: the stackable properties do not (for the moment) contain the Mdp style info taken
    // from the draw page master style. This is style info is added outside of the regular call stack processing i.e.
    // in DrawPageElementConvertor.applyMasterPage. It can be added there if needed but this works out conveniently for
    // this routine because we do not want to consider the master page info for font colors - we want the element with a
    // background color to include an explicit font color so it will look good if the user applies a new master style.
    // One quirk is the page background color. If the background is set to transparent this should revert the bg color to
    // the page color and the font color should be set appropriately in the master page style.

    if (props == null)
    {
      props = new LinkedHashMap<String, String>();
      props.put(ODPConvertConstants.CSS_BACKGROUND_COLOR, null);
      props.put(ODPConvertConstants.CSS_BACKGROUND, null);
      props.put(ODPConvertConstants.CSS_FONT_COLOR, null);

      if (CSSConvertUtil.getAttributeValues(context, props, slist) == 0)
        return null;
    }

    // check to see if we found a background color

    // Assumptions
    // 1. the background and background-color will never be set at the same time on the current node
    // 2. the color and use-window-font-color will never be set at the same time on the current node

    StackableProperties.Properties curr = sp.getCurrent();

    String c_bgcolor = props.get(ODPConvertConstants.CSS_BACKGROUND_COLOR);
    String c_ftcolor = props.get(ODPConvertConstants.CSS_FONT_COLOR);
    String c_backgnd = props.get(ODPConvertConstants.CSS_BACKGROUND);

    // handle transparent for background color (kind of a hack for now, but this is a safe, late in the cycle change for defect 14436)
    if (c_bgcolor != null && c_bgcolor.toLowerCase().equals(ODPConvertConstants.CSS_VALUE_TRANSPARENT))
    {
      c_backgnd = ODPConvertConstants.CSS_VALUE_TRANSPARENT;
      c_bgcolor = null;
    }

    StackableProperties.StringProperty uwfc = curr.getMap().get(ODPConvertConstants.CSS_USE_WINDOW_FONT_COLOR);

    boolean useAutoColor = false;
    if (uwfc != null)
    {
      useAutoColor = Boolean.parseBoolean(uwfc.getValue());
    }

    // before we go any further, check to see if we are a <p> and we have a cell text color or cell
    // automatic color defined. If so set the color if one isn't already defined. No need to bother with
    // the spans - they'll be inside the p.

    if (ODPConvertConstants.HTML_ELEMENT_P.equalsIgnoreCase(htmlNode.getNodeName()))
    {
      if (c_ftcolor == null && !useAutoColor)
      {
        String celltext = sp.getValue(ODPConvertConstants.HTML_ATTR_CELL_COLOR).getValue(), cellauto = sp.getValue(
            ODPConvertConstants.HTML_ATTR_CELL_AUTO_COLOR).getValue();

        if (celltext != null)
        {
          htmlNode.setAttribute(ODPConvertConstants.HTML_ATTR_CELL_COLOR, celltext);
          return (ODPConvertConstants.CSS_FONT_COLOR + ":" + celltext + ";");
        }
        else if (cellauto != null)
        {
          htmlNode.setAttribute(ODPConvertConstants.HTML_ATTR_AUTO_COLOR, cellauto);
          return (ODPConvertConstants.CSS_FONT_COLOR + ":" + cellauto + ";");
        }
      }
    }

    if (c_bgcolor == null && c_ftcolor == null && c_backgnd == null && uwfc == null)
      return null;

    boolean transparent = false;
    if (c_backgnd != null && c_backgnd.toLowerCase().contains(ODPConvertConstants.CSS_VALUE_TRANSPARENT))
    {
      transparent = true;
    }

    // check to see what has changed in this current element.

    boolean calculateAutoColor = false;
    String colorFromStack = getColorDefinedInStack(sp);

    if ((c_bgcolor != null) || transparent)
    {
      // found a bg color so see if we need to update the automatic color info. In
      // this case only if there's already a font color do we not want to calculate
      // the auto color.

      calculateAutoColor = true;

      // check to see if there is already a font color defined.
      if (c_ftcolor != null)
        calculateAutoColor = false;
      else
      {
        // need to check if there is an actual color set in the stack
        String scolor = sp.getValue(ODPConvertConstants.CSS_FONT_COLOR).getValue();
        if (scolor != null)
          calculateAutoColor = false;
      }
    }

    if (useAutoColor)
    {
      // if auto color is defined on this node, then we always want to calculate
      calculateAutoColor = true;
    }

    String autoFontColor = null;
    if (calculateAutoColor)
    {
      String useBGColor = c_bgcolor;
      if (useBGColor == null)
      {
        useBGColor = sp.getValue(ODPConvertConstants.CSS_BACKGROUND_COLOR).getValue();
      }

      if (useBGColor != null)
      {
        autoFontColor = AutoColorUtil.getUseWindowFontColor(useBGColor);
      } else {
    	//51454: After importing, font color is incorrect in slide.  
    	//assume BG is white and font is black color.
    	autoFontColor = "#000000";
      }

      // if the auto color is the same as the color already being used, don't bother
      // putting it inline.
      if (autoFontColor != null && colorFromStack != null)
      {
        if (autoFontColor.equalsIgnoreCase(colorFromStack))
        {
          autoFontColor = null;
        }
      }

      if (autoFontColor != null)
      {
        if (inTableCell)
        {
          // store the automatic cell color in the stack so later we know to use it. No need to put the
          // HTML_ATTR_AUTO_COLOR attribute on the cell element because we won't have any inline style to
          // remove at export time. That will have to go on any p child.
          sp.addProperty(ODPConvertConstants.HTML_ATTR_CELL_AUTO_COLOR, autoFontColor, StackableProperties.Type.ELEMENT, null);
        }
        else
        {
          // only want to create the color information if we are not in a table cell otherwise
          // the color property will affect the table borders.
          returnValue = ODPConvertConstants.CSS_FONT_COLOR + ":" + autoFontColor + ";";

          htmlNode.setAttribute(ODPConvertConstants.HTML_ATTR_AUTO_COLOR, autoFontColor);
        }
      }
    }

    // Now enter the stack information for this node.

    // UWFC is already set, so skip that one
    if (c_bgcolor != null)
    {
      sp.addProperty(ODPConvertConstants.CSS_BACKGROUND_COLOR, c_bgcolor, StackableProperties.Type.CSS, null);
      sp.addProperty(ODPConvertConstants.CSS_BACKGROUND, null, null, null);
    }
    else if (c_backgnd != null && transparent)
    {
      sp.addProperty(ODPConvertConstants.CSS_BACKGROUND, c_backgnd, StackableProperties.Type.CSS, null);
      sp.addProperty(ODPConvertConstants.CSS_BACKGROUND_COLOR, null, null, null);
    }

    if (useAutoColor && autoFontColor != null)
    {
      sp.addProperty(ODPConvertConstants.CSS_FONT_COLOR, null, null, null);
      sp.addProperty(ODPConvertConstants.HTML_ATTR_AUTO_COLOR, autoFontColor, StackableProperties.Type.ELEMENT, null);
    }
    else if (c_ftcolor != null)
    {
      sp.addProperty(ODPConvertConstants.HTML_ATTR_AUTO_COLOR, null, null, null);
      sp.addProperty(ODPConvertConstants.CSS_FONT_COLOR, c_ftcolor, StackableProperties.Type.CSS, null);
    }

    // flag the color on this current node as a fake color to be removed at export. This color is set during
    // the style processing so the background color CSS properties will be set and any appropriate auto color
    // processing will happen properly. But this is not a real background color - it is derived from the gradient,
    // hatch or bitmap fill color (gradient and hatch backgrounds are not currently supported). Only check
    // the current level in the stack - do not want to flag a gradient color inherited from higher up in the node
    // hierarchy.
    // ODPConvertConstants.CSS_USE_WINDOW_FONT_COLOR);
    StackableProperties.StringProperty grad = curr.getMap().get(ODPConvertConstants.HTML_ATTR_PSEUDO_BG_COLOR);
    if (grad != null && c_bgcolor != null)
    {
      String gcolor = grad.getValue();
      if (c_bgcolor.equals(gcolor))
      {
        htmlNode.setAttribute(ODPConvertConstants.HTML_ATTR_PSEUDO_BG_COLOR, gcolor);
      }
    }

    return returnValue;
  }
  
  /**
   * Get the current font color from stack. Either the color set by user or the automatic color.
   * 
   * @param stack
   * @return
   */
  static public String getColorDefinedInStack(StackableProperties stack)
  {
    String color = stack.getValue(ODPConvertConstants.CSS_FONT_COLOR).getValue(), autocolor = stack.getValue(
        ODPConvertConstants.HTML_ATTR_AUTO_COLOR).getValue();

    if (autocolor == null && color == null)
      return null;

    if (autocolor == null)
      return color;

    return autocolor;
  }

  static final private double extractFontSizeInPT(String fontSize)
  {
    Measure measure = Measure.parseNumber(fontSize);

    // Make sure the font size is in PTs
    if (measure.isPTMeasure())
    {
      return measure.getNumber();
    }
    else
    {
      measure.convertCMToPT();
      return measure.getNumber();
    }
  }
  
  public static void setHtmlFontSize(Element htmlNode, Double absfontSize,boolean setCustomStyle,boolean setInlineStyle){
	if(htmlNode==null || absfontSize==null)
		return;
	
	if(setCustomStyle){
		CSSProperties absFontcp = new CSSProperties(htmlNode.getAttribute(ODPConvertConstants.HTML_ATTR_CUSTOMSTYLE), true);
		absFontcp.setProperty(ODPConvertConstants.CSS_ABS_FONT_SIZE, ConvertUtil.parseFontSizeToString(absfontSize));
		htmlNode.setAttribute(ODPConvertConstants.HTML_ATTR_CUSTOMSTYLE, absFontcp.getPropertiesAsString());
	}
	if(setInlineStyle){
		CSSProperties cp = new CSSProperties(htmlNode.getAttribute(ODPConvertConstants.HTML_ATTR_STYLE), true);
	    cp.setProperty(ODPConvertConstants.CSS_FONT_SIZE,ConvertUtil.parseFontSizeToString(absfontSize / ODPConvertConstants.CONTEXT_PARENT_SIZE_DEFAULT)+"em");
	    htmlNode.setAttribute(ODPConvertConstants.HTML_ATTR_STYLE, cp.getPropertiesAsString());	
	}
  }

  public String getParagraphMasterClassName(ConversionContext context, int outline_index){
		String master_name = (String)context.get(ODPConvertConstants.CONTEXT_DRAWPAGE_MASTER_NAME);
		String presentationClassName = (String) context
		.get(ODPConvertConstants.CONTEXT_PARENT_PRESENTATION_CLASS);
		return "MP_"+master_name+"_"+presentationClassName
				+(presentationClassName.equals("subtitle") ? "_1" : "_"+outline_index);
	} 
}
