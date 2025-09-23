/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.presentation.importodf.html.master;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;

import org.odftoolkit.odfdom.doc.OdfDocument;
import org.odftoolkit.odfdom.doc.style.OdfStyleMasterPage;
import org.odftoolkit.odfdom.doc.text.OdfTextSpace;
import org.odftoolkit.odfdom.dom.element.OdfStylableElement;
import org.odftoolkit.odfdom.dom.element.draw.DrawFrameElement;
import org.odftoolkit.odfdom.dom.element.draw.DrawImageElement;
import org.odftoolkit.odfdom.dom.element.draw.DrawPageElement;
import org.odftoolkit.odfdom.dom.element.draw.DrawTextBoxElement;
import org.odftoolkit.odfdom.dom.element.presentation.PresentationNotesElement;
import org.w3c.dom.Attr;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.NamedNodeMap;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.w3c.dom.Text;

import com.ibm.symphony.conversion.presentation.ODPCommonUtil;
import com.ibm.symphony.conversion.presentation.importodf.ODPConvertUtil;
import com.ibm.symphony.conversion.presentation.ODPConvertConstants;
import com.ibm.symphony.conversion.presentation.importodf.html.AbstractHtmlConvertor;
import com.ibm.symphony.conversion.presentation.importodf.html.HtmlConvertUtil;

import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.shape2image.ODPConvertMapUtil;
import com.ibm.symphony.conversion.service.common.shape2image.ODPConvertStyleMappingUtil;

public abstract class AbstractMasterHtmlConvertor extends AbstractHtmlConvertor
{
  private static final String TITLE = "title";

  private static final String SUBTITLE = "subtitle";

  private static final String OUTLINE = "outline";

  // Default Initial Capacity for the Clean Types HashSet
  private static final int CLEAN_TYPES_SET_CAPACITY = (int) (3 * 1.33) + 1;

  public static final HashSet<String> cvCleanTypes = new HashSet<String>(CLEAN_TYPES_SET_CAPACITY);
  static
  {
    cvCleanTypes.add(TITLE);
    cvCleanTypes.add(SUBTITLE);
    cvCleanTypes.add(OUTLINE);
  }

  protected void convertChildren(ConversionContext context, Node element, Element htmlElement)
  {
    NodeList childrenNodes = element.getChildNodes();
    for (int i = 0; i < childrenNodes.getLength(); i++)
    {
      Node childElement = childrenNodes.item(i);
      // need convert children.
      if (!(childElement instanceof PresentationNotesElement))
      {
        HtmlMasterConvertorFactory.getInstance().getConvertor(childElement).convert(context, childElement, htmlElement);
      }
    }
  }

  protected List<Node> getClassElements(Node element, OdfDocument doc, ConversionContext context)
  {
    List<Node> styleRef = new ArrayList<Node>();

    if (element instanceof OdfStylableElement)
    {
      String key = HtmlConvertUtil.getStyleValue(element);
      List<Node> nodeList = ODPConvertStyleMappingUtil.getAllStyleNameNodesByKey(context, key);
      for (int i = 0; nodeList != null && i < nodeList.size(); i++)
      {
        Node refNode = nodeList.get(i);
        if (HtmlConvertUtil.hasParentStyleName(refNode)
            && !ODPConvertConstants.HTML_VALUE_GRAPHIC.equals(refNode.getAttributes().getNamedItem("style:family").getNodeValue()))
        {
          Node node = HtmlConvertUtil.getParentStyleName(refNode);
          styleRef.add(node);
        }
      }
    }

    NamedNodeMap attrs = element.getAttributes();
    int size = attrs.getLength();
    for (int i = 0; i < size; i++)
    {
      Node attrItem = attrs.item(i);
      String value = (String) ODPConvertMapUtil.getJSONMap(ODPConvertMapUtil.MAP_ODF).get(attrItem.getNodeName());
      if (value != null && value.equals(ODPConvertConstants.HTML_ATTR_CLASS))
      {
        styleRef.add(attrItem);
      }
    }
    return styleRef;
  }

  @SuppressWarnings("restriction")
  @Override
  protected Element parseAttributes(Node node, Element htmlNode, ConversionContext context)
  {

    Document doc = (Document) context.getTarget();
    OdfDocument odfDoc = (OdfDocument) context.getSource();
    NamedNodeMap attrs = node.getAttributes();
    if (attrs == null)
      return htmlNode;

    int size = attrs.getLength();
    int capacity = ODPCommonUtil.calculateArrayCapacity(size);
    List<Node> queue = new ArrayList<Node>(capacity);
    for (int i = 0; i < size; i++)
    {
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

    StringBuilder classBuf = new StringBuilder(128);

    if (node instanceof DrawFrameElement && ((DrawFrameElement) node).getAttribute("draw:layer").equalsIgnoreCase("backgroundobjects"))
    {
      classBuf.append("draw_frame ");
      // Per defect 47159/2502, draw_frame elements from master.html that don't have the presentation_class attribute defined need
      // to have "backgroundImage" in the className list of that draw_frame.
      String presentationClass = ((DrawFrameElement) node).getAttribute(ODPConvertConstants.ODF_ATTR_PRESENTATION_CLASS);
      if (presentationClass == null || presentationClass.length() == 0)
      {
        classBuf.append(ODPConvertConstants.HTML_VALUE_BACKGROUND_IMAGE + " ");
      }
      else if (node.getChildNodes().item(0) != null && node.getChildNodes().item(0) instanceof DrawImageElement)
      {
        classBuf.append(ODPConvertConstants.HTML_VALUE_BACKGROUND_IMAGE + " ");
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
      // draw:frame don't add style to class, put style into new div for
      // vertical-align unless one of the "clean" types
      if (node instanceof DrawFrameElement)
      {
        String presentationClass = ((DrawFrameElement) node).getAttribute(ODPConvertConstants.ODF_ATTR_PRESENTATION_CLASS);
        if (presentationClass != null && cvCleanTypes.contains(presentationClass))
        {
          classBuf.append(parseClassAttribute(classList, context));
        }
      }
      else
      {
        classBuf.append(parseClassAttribute(classList, context));
      }
      queue.removeAll(classList);
    }

    ODPCommonUtil.setAttributeNode(htmlNode, classAttr, classBuf.toString());

    posInfo = HtmlConvertUtil.parsePosition(posList, false, context);
    // Handle the Position and Size Style,the value format is %
    if (posInfo != null)
      stylebuf.append(posInfo);
    if (node instanceof DrawTextBoxElement)
    {
      stylebuf.append("width:100%;height:100%;");
    }

    for (Node attrItem : queue)
    {

      String attrName = attrItem.getNodeName();
      String attrVal = attrItem.getNodeValue();
      String htmlAttrName = null;

      // handle different kind of xlink
      if (attrName.equals("xlink:href"))
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
        attrVal = ODPConvertUtil.replaceUnderlineToU(attrVal);
        if (node instanceof OdfStyleMasterPage && "style:name".equals(attrName))
        {
          htmlNode.setAttribute("id", attrVal);
        }

        htmlAttrName = attrName.replace(':', '_');
        htmlNode.setAttribute(htmlAttrName, attrVal);
      }
      if (attrVal.startsWith("./"))
        htmlNode.setAttribute("style", "display:none");

    }
    ODPCommonUtil.setAttributeNode(htmlNode, styleAttr, stylebuf.toString());

    if (node.getNodeName().equals("office:presentation"))
      htmlNode.setAttribute("id", "office_prez");

    // create new div after draw:text-box for vertical-align
    if (node instanceof DrawTextBoxElement)
    {
      Element tableDiv = doc.createElement(ODPConvertConstants.HTML_ELEMENT_DIV);
      tableDiv.setAttribute(ODPConvertConstants.HTML_ATTR_STYLE, ODPConvertConstants.HTML_VALUE_TABLE_DIV_STYLE);
      htmlNode = (Element) htmlNode.appendChild(tableDiv);
      Element cellDiv = doc.createElement(ODPConvertConstants.HTML_ELEMENT_DIV);
      cellDiv.setAttribute(ODPConvertConstants.HTML_ATTR_STYLE, "display:table-cell; height:100%; width:100%;");
      htmlNode = (Element) htmlNode.appendChild(cellDiv);

      if (node.getParentNode() instanceof DrawFrameElement)
      {
        Attr attr = ((Document) context.getTarget()).createAttribute(ODPConvertConstants.HTML_ATTR_CLASS);
        List<Node> frameClassList = getClassElements(node.getParentNode(), (OdfDocument) context.getSource(), context);

        String classAttributes = parseClassAttribute(frameClassList, context);

        String value = "draw_frame_classes " + classAttributes;
        ODPCommonUtil.setAttributeNode(htmlNode, attr, value);
      }
    }

    return htmlNode;
  }

  @Override
  protected String parseClassAttribute(List<Node> attr, ConversionContext context)
  {
    StringBuilder classBuf = new StringBuilder(128);
    for (Node classAttrItem : attr)
    {
      classBuf.append(ODPConvertUtil.replaceUnderlineToU(classAttrItem.getNodeValue())).append(" ");
    }
    return classBuf.toString();
  }

  @Override
  protected Node addHtmlElement(Node node, Node htmlParentNode, ConversionContext context)
  {

    Document doc = (Document) context.getTarget();

    if (htmlParentNode == null)
      return null;

    Node e = null;
    if (node.getNodeType() == Node.TEXT_NODE)
    {
      String text = node.getNodeValue();
      e = doc.createTextNode(text);
    }
    else
    {
      String htmlTag = (String) ODPConvertMapUtil.getJSONMap(ODPConvertMapUtil.MAP_ODF).get(node.getNodeName());
      if (htmlTag == null)
        e = doc.createElement(ODPConvertConstants.HTML_ELEMENT_DIV);
      else
        e = doc.createElement(htmlTag);
    }
    if (e != null)
      e = htmlParentNode.appendChild(e);
    if (node instanceof OdfTextSpace)
    {
      Node text_c = node.getAttributes().getNamedItem("text:c");
      if (text_c == null)
      {
        Text t = doc.createTextNode(" ");
        e.appendChild(t);
      }
      else
      {
        int spaceCount = Integer.parseInt(text_c.getNodeValue());
        for (int i = 0; i < spaceCount; i++)
        {
          Text t = doc.createTextNode(" ");
          e.appendChild(t);
        }
      }
    }

    return e;
  }

}
