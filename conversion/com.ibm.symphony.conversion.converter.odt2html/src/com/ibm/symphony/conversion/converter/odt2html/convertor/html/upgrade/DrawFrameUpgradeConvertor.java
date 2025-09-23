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
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

import com.ibm.symphony.conversion.converter.odt2html.convertor.html.HtmlConvertorFactory;
import com.ibm.symphony.conversion.converter.odt2html.convertor.html.HtmlConvertorUtil;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.HtmlCSSConstants;
import com.ibm.symphony.conversion.service.common.IConvertor;
import com.ibm.symphony.conversion.service.common.ODFConstants;
import com.ibm.symphony.conversion.service.common.indextable.IndexUtil;
import com.ibm.symphony.conversion.service.common.indextable.OdfToHtmlIndex;

public class DrawFrameUpgradeConvertor extends HtmlUpgradeConvertor
{
  private static final Logger LOG = Logger.getLogger(DrawFrameUpgradeConvertor.class.getName());

  @Override
  protected void doConvertHtml(ConversionContext context, OdfElement element, Element parent)
  {
    OdfToHtmlIndex index = context.getOdfToHtmlIndexTable();
    Element oldHtmlNode = index.getFirstHtmlNode(element);
    if (oldHtmlNode == null)
      return;

    if (isDivInList(oldHtmlNode))
      return;

    OdfElement odfParent = (OdfElement) element.getParentNode();
    parent = index.getFirstHtmlNode(odfParent);

    if (!odfParent.getNodeName().equals(ODFConstants.TEXT_H) && parent == null)
      return;

    String childType = getChildType(element);
    if (!isRequredUpgrade(element, oldHtmlNode, childType))
      return;

    // old topDiv
    parent = (Element) oldHtmlNode.getParentNode();
    OdfElement odfChild = (OdfElement) element.getFirstChild();
    OdfElement tmpOdfNode = null;
    if (childType.equals(ODFConstants.DRAW_TEXT_BOX))
    // node which merged to previous draw frame
    {
      tmpOdfNode = createTmpNode(element, odfChild);
      element.removeChild(odfChild);
      if (ShapeUpgradeConvertor.isTypeDiv(parent, "oldDrawFrame"))
      {
        oldHtmlNode = parent;
        parent = (Element) oldHtmlNode.getParentNode();
      }
    }
    else
    {
      if (oldHtmlNode.getNodeName().equals(HtmlCSSConstants.IMG))
      {
        if (ShapeUpgradeConvertor.isTypeDiv(parent, "oldDrawFrame"))
        {
          oldHtmlNode = parent;
          parent = (Element) oldHtmlNode.getParentNode();
        }
        else
          return;
      }

    }

    if (parent == null)
      return;

    try
    {
      Node newParent = getNewParent(context, element, parent, oldHtmlNode);

      // convert element from parent again
      if (newParent != null)
      {
        if (ShapeUpgradeConvertor.isTypeDiv((Element) newParent, "secondDiv"))
        {
          // multiple draw frame in one paragraph
          if (ShapeUpgradeConvertor.isTypeDiv(parent, "oldSecondDiv"))
            convertInTPSibling(context, element, parent, newParent, oldHtmlNode);
          else
            convertInPSibling(context, element, parent, newParent, oldHtmlNode);
        }
        else
          convertInNewParent(context, element, parent, newParent, oldHtmlNode);
      }
      else
        convertInOldParent(context, element, parent, oldHtmlNode);

      if (childType.equals(ODFConstants.DRAW_TEXT_BOX))
      // node which merged to previous draw frame
      {
        String newId = tmpOdfNode.getAttribute("id");
        HtmlConvertorUtil.setAttribute(odfChild,"id", newId,false);
        element.appendChild(odfChild);
        element.removeChild(tmpOdfNode);
        UpgradeConvertorUtil.convertChildren(context, element);
      }
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "Error in draw frame upgading:", e);
    }

  }

  private Node getNewParent(ConversionContext context, OdfElement element, Element parent, Element oldHtmlNode)
  {
    Node newParent = null;
    Node odfParent = element.getParentNode();
    String odfParentName = odfParent.getNodeName();
    if (ShapeUpgradeConvertor.isTypeDiv(oldHtmlNode, "drawframe"))
      HtmlConvertorUtil.setAttribute(oldHtmlNode,"_type", "oldDrawFrame",false);

    if (!ShapeUpgradeConvertor.isTypeDiv(parent, "secondDiv"))
    {
      if (odfParentName.equals(ODFConstants.TEXT_P))
      {
        if (context.getOdfToHtmlIndexTable().isOdfNodeIndexed((OdfElement) odfParent))
        {
          if (ShapeUpgradeConvertor.isTypeDiv(parent, "oldSecondDiv"))
          {
            Node pSecondDivNode = ShapeUpgradeConvertor.getPSSecondDiv(parent);
            if (pSecondDivNode != null)
              return pSecondDivNode;
          }

          // for multiple draw frame in one paragraph
          Node pSecondDivNode = ShapeUpgradeConvertor.getPSSecondDiv(oldHtmlNode);
          if (pSecondDivNode != null)
            return pSecondDivNode;

          newParent = UpgradeConvertorUtil.createNodeWithNewName(context, HtmlCSSConstants.P, parent);
        }
        else
        {
          Node nOdfParent = odfParent.getNextSibling();
          if (nOdfParent != null && (nOdfParent instanceof Element) && nOdfParent.getNodeName().equals(ODFConstants.TEXT_H))
          {
            Node fixParent = updateParentForH(context, (OdfElement) odfParent, parent, oldHtmlNode);
            newParent = UpgradeConvertorUtil.createNodeWithNewName(context, HtmlCSSConstants.P, fixParent);
          }
        }

      }
      else if (odfParentName.equals(ODFConstants.TEXT_SPAN))
        newParent = UpgradeConvertorUtil.createNodeWithNewName(context, HtmlCSSConstants.SPAN, parent);
      else if (odfParentName.equals(ODFConstants.TEXT_H))
      {
        Node fixParent = updateParentForH(context, null, parent, oldHtmlNode);
        newParent = UpgradeConvertorUtil.createNodeWithNewName(context, HtmlCSSConstants.P, fixParent);
      }
    }
    else
    {
      String typeAttr = ((Element) parent.getParentNode()).getAttribute("_sourceType");
      if (typeAttr == null)
        typeAttr = "";

      if (typeAttr.length() == 0)
      {
        if (odfParentName.equals(ODFConstants.TEXT_P))
          newParent = UpgradeConvertorUtil.createNodeWithNewName(context, HtmlCSSConstants.P, parent.getParentNode());
        else if (odfParentName.equals(ODFConstants.TEXT_SPAN))
          newParent = UpgradeConvertorUtil.createNodeWithNewName(context, HtmlCSSConstants.SPAN, parent.getParentNode());
      }
    }

    return newParent;
  }

  private void convertInNewParent(ConversionContext context, OdfElement element, Element parent, Node newParent, Element oldHtmlNode)
  {
    Node oldSecondDiv = null;
    if (ShapeUpgradeConvertor.isTypeDiv(parent, "secondDiv"))
    {
      HtmlConvertorUtil.setAttribute(parent,"_type", "oldSecondDiv",false);
      oldSecondDiv = parent;
      parent = (Element) parent.getParentNode();
    }

    String isFixedForH = ((Element) newParent).getAttribute("upgradeFixForH");
    if (isFixedForH != null && isFixedForH.equals("true"))
    {
      oldHtmlNode = context.getOdfToHtmlIndexTable().getFirstHtmlNode(element);
      parent = (Element) oldHtmlNode.getParentNode();
      ((Element) newParent).removeAttribute("upgradeFixForH");
    }

    Node newNode = null;
    NodeList childs = parent.getChildNodes();
    int i = 0;
    Node child = null;
    for (i = 0; i < childs.getLength(); i++)
    {
      child = childs.item(i);
      if (oldSecondDiv != null && child == oldSecondDiv)
        break;
      else if (child == oldHtmlNode)
        break;
      else
        newParent.appendChild(child);
    }

    newNode = convertByHtmlConvertor(context, element, (Element) newParent, null);
    Node merged = getOldMergedNode(oldHtmlNode);

    if (oldSecondDiv == null)
    {
      if (merged != null)
        newParent.appendChild(merged);
    }
    else
    {
      if (merged != null)
        oldSecondDiv.insertBefore(merged, oldHtmlNode);

      oldSecondDiv.removeChild(oldHtmlNode);
      if (oldSecondDiv.getChildNodes() != null)
        newParent.appendChild(oldSecondDiv);
    }

    while (i + 1 < childs.getLength())
    {
      child = childs.item(i + 1);
      newParent.appendChild(child);
      i++;
    }

    if (newNode != null)
    {
      parseChildren(context, element, newNode);
      parent.getParentNode().removeChild(parent);
    }
    else
    {
      parent.getParentNode().removeChild(parent);
    }

    UpgradeConvertorUtil.insertToHtmlDom(context, (Element) newParent);
  }

  private void convertInPSibling(ConversionContext context, OdfElement element, Element parent, Node secondDiv, Element oldHtmlNode)
  {
    Node converted = convertByHtmlConvertor(context, element, parent, (Element) secondDiv);

    if (converted != null)
    {
      parseChildren(context, element, secondDiv);
    }

    Node merged = getOldMergedNode(oldHtmlNode);
    if (merged != null)
    {
      parent.insertBefore(merged, oldHtmlNode);
      UpgradeConvertorUtil.insertToHtmlDom(context, (Element) merged);
    }

    parent.removeChild(oldHtmlNode);

    UpgradeConvertorUtil.insertToHtmlDom(context, parent);
  }

  private void convertInTPSibling(ConversionContext context, OdfElement element, Element parent, Node secondDiv, Element oldHtmlNode)
  {
    Node converted = convertByHtmlConvertor(context, element, (Element) parent.getParentNode(), (Element) secondDiv);

    if (converted != null)
    {
      parseChildren(context, element, secondDiv);
    }

    if (ShapeUpgradeConvertor.isOnlyOneChild(parent))
    {
      Node child = parent.getFirstChild();
      if (child != null && ShapeUpgradeConvertor.isTypeDiv((Element) child, "drawframe")
          || ShapeUpgradeConvertor.isTypeDiv((Element) child, "oldDrawFrame"))
      {
        if (ShapeUpgradeConvertor.isOnlyOneChild(child))
        {
          parent.removeChild(child);
          if (ShapeUpgradeConvertor.isOnlyOneChild(parent))
            parent.getParentNode().removeChild(parent);
        }
        else
          child.removeChild(child.getFirstChild());
      }
      else
        parent.getParentNode().removeChild(parent);
    }
    else
      parent.removeChild(oldHtmlNode);
  }

  private void convertInOldParent(ConversionContext context, OdfElement element, Element parent, Element oldHtmlNode)
  {
    Node converted = convertByHtmlConvertor(context, element, parent, null);
    if (converted != null)
    {
      Node newNode = converted.cloneNode(true);
      parent.removeChild(converted);
      parent.insertBefore(newNode, oldHtmlNode);
      parseChildren(context, element, newNode);
    }
    Node merged = getOldMergedNode(oldHtmlNode);
    if (merged != null)
    {
      parent.insertBefore(merged, oldHtmlNode);
      UpgradeConvertorUtil.insertToHtmlDom(context, (Element) merged);
    }

    parent.removeChild(oldHtmlNode);
  }

  private Node convertByHtmlConvertor(ConversionContext context, OdfElement element, Element parent, Element secondDiv)
  {
    Node oldLastNode = null;
    Node newNode = null;

    if (secondDiv == null)
      oldLastNode = parent.getLastChild();
    else
      oldLastNode = secondDiv.getLastChild();

    IConvertor convertor = HtmlConvertorFactory.getInstance().getConvertor(element);
    convertor.convert(context, element, parent);

    if (secondDiv == null)
      newNode = parent.getLastChild();
    else
      newNode = secondDiv.getLastChild();

    if (oldLastNode == null && newNode != null)
      return newNode;

    if (oldLastNode != null && oldLastNode == newNode)
    {
      return null;
    }

    return newNode;
  }

  private Node getOldMergedNode(Node oldHtmlNode)
  {
    Node node = null;
    if (oldHtmlNode.getChildNodes().getLength() > 1)
    {
      node = oldHtmlNode.cloneNode(true);
      NodeList nodes = node.getChildNodes();
      node.removeChild(nodes.item(0));
    }
    return node;
  }

  private void parseChildren(ConversionContext context, OdfElement element, Node parent)
  {
    OdfToHtmlIndex index = context.getOdfToHtmlIndexTable();
    OdfElement odfChild = (OdfElement) element.getFirstChild();
    Node old = index.getFirstHtmlNode(odfChild);

    if (odfChild.getNodeName().equals(ODFConstants.DRAW_IMAGE))
    {
      if (parent.hasChildNodes())
      {
        Node newDrawFrame = parent.getLastChild();
        Node newConverted = newDrawFrame;
        if (newDrawFrame.hasChildNodes())
        {
          newConverted = newDrawFrame.getFirstChild();
        }
        replaceByOldChild(index, newDrawFrame, newConverted, old);
      }
      else
      {
        Node topP = parent.getParentNode();
        ((Element) old).removeAttribute("_type");
        replaceByOldChild(index, topP, parent, old);
      }
    }
    else
    {
      Node newDrawFrame = parent.getLastChild();

      Node newDrawTextBox = newDrawFrame.getFirstChild();
      newDrawTextBox = UpgradeConvertorUtil.removeAllChilds(newDrawTextBox);
      if (old.hasChildNodes())
      {
        NodeList nodes = old.getChildNodes();
        for (int i = 0; i < nodes.getLength(); i++)
        {
          Node txtboxChild = nodes.item(i);
          if (txtboxChild instanceof Element && ShapeUpgradeConvertor.isTypeDiv((Element) txtboxChild, "topDiv"))
          {
            HtmlConvertorUtil.setAttribute((Element) txtboxChild,"_type", "oldTopDiv",false);
          }

          newDrawTextBox.appendChild(nodes.item(i));
        }
      }
      UpgradeConvertorUtil.insertToHtmlDom(context, (Element) newDrawTextBox);
    }
  }

  private void replaceByOldChild(OdfToHtmlIndex index, Node parent, Node newChild, Node oldChild)
  {
    if (newChild.getNodeName().equals(HtmlCSSConstants.A))
    {
      parent = newChild;
      newChild = newChild.getFirstChild();
      index.removeEntryByHtmlNode((Element) oldChild.getParentNode());
    }

    Element tmpNode = (Element) oldChild.cloneNode(true);
    index.removeEntryByHtmlNode((Element) tmpNode);
    String newHtmlId = ((Element) newChild).getAttribute("id");
    HtmlConvertorUtil.setAttribute(tmpNode,"id", newHtmlId);
    parent.insertBefore(tmpNode, newChild);
    parent.removeChild(newChild);

  }

  private boolean isRequredUpgrade(OdfElement element, Element oldHtmlNode, String childType)
  {
    if (oldHtmlNode == null)
      return false;

    if (!element.hasChildNodes())
      return false;

    if (!childType.equals(ODFConstants.DRAW_IMAGE) && !childType.equals(ODFConstants.DRAW_TEXT_BOX))
      return false;

    return true;
  }

  private String getChildType(OdfElement odfElement)
  {
    String childType = "";
    Node node = odfElement.getFirstChild();
    if (ODFConstants.DRAW_IMAGE.equals(node.getNodeName()))
    {
      childType = ODFConstants.DRAW_IMAGE;
    }
    else if (ODFConstants.DRAW_TEXT_BOX.equals(node.getNodeName()))
    {
      childType = ODFConstants.DRAW_TEXT_BOX;
    }
    return childType;
  }

  private OdfElement createTmpNode(OdfElement parent, OdfElement odfChild)
  {
    String oldId = odfChild.getAttribute("id");
    odfChild.removeAttribute("id");
    OdfElement tmpOdfNode = (OdfElement) odfChild.cloneNode(false);
    HtmlConvertorUtil.setAttribute(tmpOdfNode,"id", oldId);
    Node tmpChild = tmpOdfNode.getOwnerDocument().createTextNode("For Upgrade.");
    tmpOdfNode.appendChild(tmpChild);
    parent.insertBefore(tmpOdfNode, odfChild);
    return tmpOdfNode;
  }

  private Element updateParentForH(ConversionContext context, OdfElement odfParent, Node parent, Node oldHtmlNode)
  {
    Element fixParent = ((Document) context.getTarget()).createElement(HtmlCSSConstants.DIV);
    parent.insertBefore(fixParent, oldHtmlNode);
    fixParent.appendChild(oldHtmlNode.cloneNode(true));
    parent.removeChild(oldHtmlNode);
    if (odfParent != null)
      context.getOdfToHtmlIndexTable().addEntryIndexByOdfNode(odfParent, (Element) fixParent);
    else
      IndexUtil.getHtmlId(fixParent);

    context.getOdfToHtmlIndexTable().insertToHtmlDom(fixParent);
    HtmlConvertorUtil.setAttribute((Element) fixParent,"upgradeFixForH", "true",false);

    return fixParent;
  }

  public static boolean isDivInList(Node htmlNode)
  {
    Node parent = htmlNode.getParentNode();
    if (htmlNode.getNodeName().equals(HtmlCSSConstants.DIV) && parent.getNodeName().equals(HtmlCSSConstants.LI))
    {
      parent.removeChild(htmlNode);
      return true;
    }

    return false;
  }
}
