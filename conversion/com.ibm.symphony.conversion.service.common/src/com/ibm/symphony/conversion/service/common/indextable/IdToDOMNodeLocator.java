/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.service.common.indextable;

import java.util.HashMap;
import java.util.Map;

import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

public class IdToDOMNodeLocator
{
  private Map<String, Node> idNodeMap = null;

  private Document content = null;

  private void traverseDOMTree(Node node)
  {
    int type = node.getNodeType();
    switch (type)
      {
        case Node.DOCUMENT_NODE :
        {
          traverseDOMTree(((Document) node).getDocumentElement());
          break;
        }
        case Node.ELEMENT_NODE :
        {
          String id = ((Element) node).getAttribute(IndexUtil.ID_STRING);
          if (id != null && !id.equals(""))
            idNodeMap.put(id, node);

          if (node.hasChildNodes())
          {
            NodeList children = node.getChildNodes();
            for (int i = 0; i < children.getLength(); i++)
              traverseDOMTree(children.item(i));
          }
          break;
        }
        default:
          break;
      }
  }

  public IdToDOMNodeLocator(Document xmlcontent)
  {
    idNodeMap = new HashMap<String, Node>();
    content = xmlcontent;
    traverseDOMTree(content);
  }

  public void insertFromParent(Node parent)
  {
    traverseDOMTree(parent);
  }

  Node getNode(String id)
  {
    return idNodeMap.get(id);
  }

  void insertNode(String id, Node node)
  {
    idNodeMap.put(id, node);
  }

  void removeNodeFromDOM(String id)
  {
    Node node = idNodeMap.get(id);
    if (node == null)
      return;
    Node parentNode = node.getParentNode();
    if (parentNode == null)
      return;
    parentNode.removeChild(node);
    idNodeMap.remove(id);
  }

  Document getDocument()
  {
    return content;
  }
}
