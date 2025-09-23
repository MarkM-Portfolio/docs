/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.odt2html.convertor.html.upgrade;

import java.util.logging.Level;
import java.util.logging.Logger;

import org.odftoolkit.odfdom.OdfElement;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

import com.ibm.symphony.conversion.converter.odt2html.convertor.html.HtmlConvertorFactory;
import com.ibm.symphony.conversion.converter.odt2html.convertor.html.HtmlConvertorUtil;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.HtmlCSSConstants;
import com.ibm.symphony.conversion.service.common.IConvertor;
import com.ibm.symphony.conversion.service.common.ODFConstants;
import com.ibm.symphony.conversion.service.common.indextable.OdfToHtmlIndex;

public class ShapeUpgradeConvertor extends HtmlUpgradeConvertor
{
  private static final Logger LOG = Logger.getLogger(ShapeUpgradeConvertor.class.getName());

  @Override
  protected void doConvertHtml(ConversionContext context, OdfElement element, Element parent)
  {
    OdfToHtmlIndex index = context.getOdfToHtmlIndexTable();
    Element oldHtmlNode = index.getFirstHtmlNode(element);
    if (oldHtmlNode == null)
      return;

    OdfElement odfParent = (OdfElement) element.getParentNode();
    parent = index.getFirstHtmlNode(odfParent);

    if (!odfParent.getNodeName().equals(ODFConstants.TEXT_H) && parent == null)
      return;

    // get old secondDiv
    Element oldParentShape = (Element) getOldParentShapeDiv(index, oldHtmlNode);
    if (oldParentShape == null)
      return;

    Element oldSecondDiv = (Element) oldParentShape.getParentNode();
    if (oldSecondDiv == null)
      return;

    if (isTypeDiv(oldSecondDiv, "secondDiv"))
    {
      HtmlConvertorUtil.setAttribute(oldSecondDiv,"_type", "oldSecondDiv",false);
    }
    else if (!isTypeDiv(oldSecondDiv, "oldSecondDiv") && oldParentShape == oldHtmlNode)
    {
      oldSecondDiv = oldHtmlNode;
      HtmlConvertorUtil.setAttribute(oldSecondDiv,"_type", "selfShape",false);
    }

    // old topDiv
    if (isPUnderDiv(oldSecondDiv))
    {
      parent = (Element) oldSecondDiv.getParentNode();
      oldSecondDiv = oldParentShape;
    }
    else
    {
      parent = (Element) oldSecondDiv.getParentNode();
    }

    if (parent == null)
      return;

    try
    {
      Node newParent = getNewParent(context, element, parent, oldSecondDiv);

      // convert element from parent again
      if (newParent != null)
        if (isTypeDiv((Element) newParent, "secondDiv"))
        {
          // multiple draw frame in one paragraph
          convertInPSibling(context, element, parent, newParent, oldParentShape, oldSecondDiv);
        }
        else
          convertInNewParent(context, element, parent, newParent, oldParentShape, oldSecondDiv);
      else
        convertInOldParent(context, element, parent, oldParentShape, oldSecondDiv);

    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "Error in shape upgading:", e);
    }
  }

  private Node getNewParent(ConversionContext context, OdfElement element, Element parent, Element oldSecondDiv)
  {
    Node newParent = null;
    String typeAttr = parent.getAttribute("_sourceType");
    if (typeAttr == null)
      typeAttr = "";

    String odfParentName = element.getParentNode().getNodeName();
    if (typeAttr.length() == 0)
    {
      if (odfParentName.equals(ODFConstants.TEXT_P) || odfParentName.equals(ODFConstants.TEXT_H))
        newParent = UpgradeConvertorUtil.createNodeWithNewName(context, HtmlCSSConstants.P, parent);
      else if (odfParentName.equals(ODFConstants.TEXT_SPAN))
        newParent = UpgradeConvertorUtil.createNodeWithNewName(context, HtmlCSSConstants.SPAN, parent);
    }
    else if (odfParentName.contains(ODFConstants.TEXT_P))
    {
      // for multiple draw frame in one paragraph
      Node pSecondDivNode = getPSSecondDiv(oldSecondDiv);
      if (pSecondDivNode != null)
        return pSecondDivNode;
    }

    return newParent;
  }

  private void convertInNewParent(ConversionContext context, OdfElement element, Element parent, Node newParent, Element oldParentShape,
      Element oldSecondDiv)
  {
    NodeList childs = parent.getChildNodes();
    int i = 0;
    for (i = 0; i < childs.getLength(); i++)
    {
      Node child = childs.item(i);
      if (child == oldSecondDiv)
        break;
      else
        appendChildFilterP(newParent, child);
    }

    IConvertor convertor = HtmlConvertorFactory.getInstance().getConvertor(element);
    convertor.convert(context, element, newParent);

    if (!isTypeDiv((Element) oldSecondDiv, "selfShape") && !isOnlyOneChild(oldSecondDiv))
    {
      oldSecondDiv.removeChild(oldParentShape);
      newParent.appendChild(oldSecondDiv);
    }

    while (i + 1 < childs.getLength())
    {
      Node child = childs.item(i + 1);
      appendChildFilterP(newParent, child);
      i++;
    }

    parent.getParentNode().removeChild(parent);
    UpgradeConvertorUtil.insertToHtmlDom(context, (Element) newParent);
  }

  private void convertInPSibling(ConversionContext context, OdfElement element, Element parent, Node newParent, Element oldParentShape,
      Element oldSecondDiv)
  {
    IConvertor convertor = HtmlConvertorFactory.getInstance().getConvertor(element);
    convertor.convert(context, element, parent);

    if (isTypeDiv((Element) oldSecondDiv, "selfShape") || isOnlyOneChild(oldSecondDiv))
      parent.removeChild(oldSecondDiv);
    else
      oldSecondDiv.removeChild(oldParentShape);
  }

  private void convertInOldParent(ConversionContext context, OdfElement element, Element parent, Element oldParentShape,
      Element oldSecondDiv)
  {
    IConvertor convertor = HtmlConvertorFactory.getInstance().getConvertor(element);
    convertor.convert(context, element, parent);
    Node htmlNode = parent.getLastChild();

    Node newNode = htmlNode.cloneNode(true);
    parent.removeChild(htmlNode);

    parent.insertBefore(newNode, oldSecondDiv);

    if (isTypeDiv((Element) oldSecondDiv, "selfShape") || isOnlyOneChild(oldSecondDiv))
      parent.removeChild(oldSecondDiv);
    else
      oldSecondDiv.removeChild(oldParentShape);
  }

  private Node getOldParentShapeDiv(OdfToHtmlIndex index, Node oldHtmlNode)
  {
    Node currentNode = oldHtmlNode;
    Node parent = currentNode.getParentNode();
    if (parent == null)
      return null;

    if (isSecondDiv((Element) parent) || isTypeDiv((Element) parent, "topDiv"))
      return currentNode;

    String odfIndex = index.getOdfIndex((Element) parent);

    while (odfIndex == null)
    {
      currentNode = parent;
      parent = currentNode.getParentNode();

      if (parent == null)
        return null;

      if (isSecondDiv((Element) parent) || isTypeDiv((Element) parent, "topDiv"))
        return currentNode;

      odfIndex = index.getOdfIndex((Element) parent);

    }

    return currentNode;

  }

  private boolean isSecondDiv(Element currentNode)
  {
    if (isPUnderDiv(currentNode))
      return true;

    if (isTypeDiv(currentNode, "secondDiv") || isTypeDiv(currentNode, "oldSecondDiv"))
      return true;

    return false;
  }

  private boolean isPUnderDiv(Element htmlNode)
  {
    String idAttr = htmlNode.getAttribute("id");
    if (idAttr != null && idAttr.startsWith("pUnderDiv"))
      return true;

    return false;
  }

  public static void appendChildFilterP(Node parent, Node child)
  {
    if (parent.getNodeName().equals(HtmlCSSConstants.P) && child.getNodeName().equals(HtmlCSSConstants.P))
    {
      String idAttr = ((Element) child).getAttribute("id");
      if (idAttr != null && idAttr.startsWith("pUnderDiv"))
      {
        NodeList allChilds = child.getChildNodes();
        for (int i = 0; i < allChilds.getLength(); i++)
        {
          parent.appendChild(allChilds.item(i));
        }
      }
    }
    else
      parent.appendChild(child);
  }

  public static Node getPSSecondDiv(Node current)
  {
    Node previousNode = current.getPreviousSibling();
    while (previousNode != null)
    {
      if ((previousNode instanceof Element) && isTypeDiv((Element) previousNode, "secondDiv"))
        return previousNode;
      previousNode = previousNode.getPreviousSibling();
    }
    return null;
  }

  public static boolean isTypeDiv(Element htmlNode, String type)
  {
    String typeAttr = htmlNode.getAttribute("_type");
    if (typeAttr != null && typeAttr.equals(type))
      return true;

    return false;
  }

  public static boolean isOnlyOneChild(Node node)
  {
    NodeList childs = node.getChildNodes();
    if (childs == null)
      return true;

    if (childs.getLength() > 1)
      return false;

    return true;
  }

}
