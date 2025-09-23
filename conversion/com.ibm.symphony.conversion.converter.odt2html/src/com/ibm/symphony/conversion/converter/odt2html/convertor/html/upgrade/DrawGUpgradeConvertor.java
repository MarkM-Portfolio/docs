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

import java.util.ArrayList;
import java.util.List;

import org.odftoolkit.odfdom.OdfElement;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

import com.ibm.symphony.conversion.converter.odt2html.convertor.html.HtmlConvertorFactory;

import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.HtmlCSSConstants;
import com.ibm.symphony.conversion.service.common.ODFConstants;

import com.ibm.symphony.conversion.service.common.IConvertor;
import com.ibm.symphony.conversion.service.common.indextable.OdfToHtmlIndex;

public class DrawGUpgradeConvertor extends HtmlUpgradeConvertor
{
  @Override
  protected void doConvertHtml(ConversionContext context, OdfElement element, Element parent)
  {
    OdfToHtmlIndex index = context.getOdfToHtmlIndexTable();
    List<String> allChildHtmlIds = getAllChildHtmlId(index, element, null);
    Node firstChild = getFirstHtmlChild(index, allChildHtmlIds);
    if (firstChild == null)
      return;

    OdfElement odfParent = (OdfElement) element.getParentNode();
    parent = index.getFirstHtmlNode(odfParent);

    if (!odfParent.getNodeName().equals(ODFConstants.TEXT_H) && parent == null)
      return;

    // old topDiv
    Node newParent = getNewParent(context, element, parent);

    // convert element from parent again
    if (newParent != null)
    {
      if (isTypeDiv((Element) newParent, "secondDiv"))
      {
        // multiple draw frame in one paragraph
        convertInPSibling(context, element, parent, allChildHtmlIds);
      }
      else
        convertInNewParent(context, element, parent, newParent, allChildHtmlIds);
    }
    else
    {
      if (odfParent.getNodeName().equals(ODFConstants.TEXT_H))
        convertInHParent(context, element, (Element) firstChild, newParent, allChildHtmlIds);
      else
        convertInOldParent(context, element, parent, allChildHtmlIds);
    }
  }

  private Node getNewParent(ConversionContext context, OdfElement element, Element parent)
  {
    Node newParent = null;
    String typeAttr = null;
    if (parent != null)
      typeAttr = parent.getAttribute("_sourceType");

    if (typeAttr == null)
      typeAttr = "";

    Node odfParent = element.getParentNode();
    String odfParentName = odfParent.getNodeName();
    if (typeAttr.length() == 0)
    {
      if (odfParentName.equals(ODFConstants.TEXT_P))
        newParent = UpgradeConvertorUtil.createNodeWithNewName(context, HtmlCSSConstants.P, parent);
      else if (odfParentName.equals(ODFConstants.TEXT_SPAN))
        newParent = UpgradeConvertorUtil.createNodeWithNewName(context, HtmlCSSConstants.SPAN, parent);
    }
    else if (odfParentName.contains(ODFConstants.TEXT_P))
    {
      // for multiple draw frame in one paragraph
      Node pSecondDivNode = ShapeUpgradeConvertor.getPSSecondDiv(parent.getLastChild());
      if (pSecondDivNode != null)
        return pSecondDivNode;
    }

    return newParent;
  }

  private void convertInHParent(ConversionContext context, OdfElement element, Element parent, Node newParent, List<String> allChildHtmlIds)
  {

    Element firstChild = (Element) parent;
    OdfElement odfParent = (OdfElement) element.getParentNode().getParentNode();
    parent = context.getOdfToHtmlIndexTable().getFirstHtmlNode(odfParent);
    firstChild = (Element) getTopDiv(firstChild, parent);

    newParent = UpgradeConvertorUtil.createNodeWithNewName(context, HtmlCSSConstants.P, firstChild);

    NodeList childs = parent.getChildNodes();
    int i = 0;
    for (i = 0; i < childs.getLength(); i++)
    {
      Node child = childs.item(i);
      if (child == firstChild)
        break;
    }

    IConvertor convertor = HtmlConvertorFactory.getInstance().getConvertor(element);
    convertor.convert(context, element, newParent);

    parent.removeChild(firstChild);

    for (i = i + 1; i < childs.getLength(); i++)
    {
      Node child = childs.item(i);
      if (isCurrentGroupDiv(child, allChildHtmlIds))
        parent.removeChild(child);
      else if (!isPInDiv((Element) child))
        break;
    }

    UpgradeConvertorUtil.insertToHtmlDom(context, (Element) newParent);
  }

  private void convertInNewParent(ConversionContext context, OdfElement element, Element parent, Node newParent,
      List<String> allChildHtmlIds)
  {
    NodeList childs = parent.getChildNodes();
    int i = 0;
    for (i = 0; i < childs.getLength(); i++)
    {
      Node child = childs.item(i);
      if (isCurrentGroupDiv(child, allChildHtmlIds))
        break;
      else
        ShapeUpgradeConvertor.appendChildFilterP(newParent, child);
    }

    IConvertor convertor = HtmlConvertorFactory.getInstance().getConvertor(element);
    convertor.convert(context, element, newParent);

    for (i = i + 1; i < childs.getLength(); i++)
    {
      Node child = childs.item(i);
      if (!isCurrentGroupDiv(child, allChildHtmlIds))
      {
        ShapeUpgradeConvertor.appendChildFilterP(newParent, child);
      }
    }
    parent.getParentNode().removeChild(parent);

    UpgradeConvertorUtil.insertToHtmlDom(context, (Element) newParent);
  }

  private void convertInPSibling(ConversionContext context, OdfElement element, Element parent, List<String> allChildHtmlIds)
  {
    NodeList childs = parent.getChildNodes();

    IConvertor convertor = HtmlConvertorFactory.getInstance().getConvertor(element);
    convertor.convert(context, element, parent);

    for (int i = 0; i < childs.getLength(); i++)
    {
      Node child = childs.item(i);
      if (isCurrentGroupDiv(child, allChildHtmlIds))
      {
        if (isTypeDiv((Element) child, "oldSecondDiv"))
        {
          removeFromSecondDiv(child, allChildHtmlIds);
          if (hasNoChild(child.getChildNodes()))
          {
            parent.removeChild(child);
            i--;
          }
        }
        else
        {
          parent.removeChild(child);
          i--;
        }
      }
    }
  }

  private void convertInOldParent(ConversionContext context, OdfElement element, Element parent, List<String> allChildHtmlIds)
  {
    NodeList childs = parent.getChildNodes();
    int i = 0;
    Node firstGNode = null;
    for (i = 0; i < childs.getLength(); i++)
    {
      Node child = childs.item(i);
      if (isCurrentGroupDiv(child, allChildHtmlIds))
      {
        firstGNode = child;
        break;
      }
    }

    IConvertor convertor = HtmlConvertorFactory.getInstance().getConvertor(element);
    convertor.convert(context, element, parent);
    Node htmlNode = parent.getLastChild();

    Node newNode = htmlNode.cloneNode(true);
    parent.removeChild(htmlNode);

    if (firstGNode == null)
      firstGNode = parent.getFirstChild();
    parent.insertBefore(newNode, firstGNode);

    for (i = i + 1; i < childs.getLength(); i++)
    {
      Node child = childs.item(i);
      if (isCurrentGroupDiv(child, allChildHtmlIds))
      {
        if (isTypeDiv((Element) child, "secondDiv") || isTypeDiv((Element) child, "oldSecondDiv"))
        {
          removeFromSecondDiv(child, allChildHtmlIds);
          if (hasNoChild(childs))
          {
            parent.removeChild(child);
            i--;
          }
        }
        else
        {
          parent.removeChild(child);
          i--;
        }
      }
    }

  }

  private List<String> getAllChildHtmlId(OdfToHtmlIndex index, OdfElement element, List<String> allIndex)
  {
    if (allIndex == null)
      allIndex = new ArrayList<String>();

    NodeList odfChilds = element.getChildNodes();
    if (odfChilds != null)
    {
      for (int i = 0; i < odfChilds.getLength(); i++)
      {
        OdfElement odfChild = (OdfElement) odfChilds.item(i);
        if (odfChild.getNodeName().equals(ODFConstants.DRAW_G))
          getAllChildHtmlId(index, odfChild, allIndex);
        else
        {
          String htmlId = index.getFirstHtmlIndex(odfChild);
          if (htmlId != null)
            allIndex.add(htmlId);
        }
      }
    }

    return allIndex;
  }

  private Node getFirstHtmlChild(OdfToHtmlIndex index, List<String> allChildHtmlIds)
  {
    if (allChildHtmlIds == null)
      return null;

    Node child = null;
    for (int i = 0; i < allChildHtmlIds.size(); i++)
    {
      child = index.getNodebyId(allChildHtmlIds.get(i));
      if (child != null)
        return child;
    }
    return null;
  }

  private Node getTopDiv(Element htmlNode, Element topParent)
  {
    Element parent = (Element) htmlNode.getParentNode();
    while (parent != null)
    {
      if (isTypeDiv(parent, "topDiv"))
        return parent;
      else if ((topParent != null && parent == topParent) || parent.getNodeName().equals(HtmlCSSConstants.BODY))
        return htmlNode;

      htmlNode = parent;
      parent = (Element) htmlNode.getParentNode();
    }

    return null;
  }

  private void removeFromSecondDiv(Node htmlNode, List<String> allChildHtmlIds)
  {
    NodeList childs = htmlNode.getChildNodes();
    if (childs == null)
      return;
    for (int i = 0; i < childs.getLength(); i++)
    {
      Node child = childs.item(i);
      if (isCurrentGroupDiv(child, allChildHtmlIds))
      {
        htmlNode.removeChild(child);
        i--;
      }
    }
  }

  private boolean isCurrentGroupDiv(Node htmlNode, List<String> allChildHtmlIds)
  {
    if (htmlNode instanceof Element)
    {
      String idAttr = ((Element) htmlNode).getAttribute("id");
      idAttr = (idAttr == null) ? "" : idAttr;
      if (allChildHtmlIds.contains(idAttr))
        return true;

      if (htmlNode.hasChildNodes())
      {
        return isGroupSecondDiv(htmlNode, allChildHtmlIds);
      }
      else
        return false;
    }
    return false;
  }

  private boolean isGroupSecondDiv(Node htmlNode, List<String> allChildHtmlIds)
  {
    NodeList childs = htmlNode.getChildNodes();
    for (int i = 0; i < childs.getLength(); i++)
    {
      Node child = childs.item(i);
      if (child instanceof Element && isCurrentGroupDiv(child, allChildHtmlIds))
        return true;
      else if (child.hasChildNodes())
        return isGroupSecondDiv(child, allChildHtmlIds);
    }
    return false;
  }

  private boolean isTypeDiv(Element htmlNode, String type)
  {
    String typeAttr = htmlNode.getAttribute("_type");
    if (typeAttr != null && typeAttr.equals(type))
      return true;

    return false;
  }

  private boolean isPInDiv(Element htmlNode)
  {
    String idAttr = htmlNode.getAttribute("id");
    if (idAttr != null)
    {
      if (idAttr.startsWith("pForDelete"))
        return true;
    }

    return false;
  }

  private boolean hasNoChild(NodeList childs)
  {
    if (childs == null)
      return true;
    for (int i = 0; i < childs.getLength(); i++)
    {
      Node node = childs.item(i);
      if (node instanceof Element)
        return false;
      else
      {
        String value = node.getNodeValue();
        if (value != null && value.trim().length() > 0)
          return false;
      }
    }
    return true;
  }

}
