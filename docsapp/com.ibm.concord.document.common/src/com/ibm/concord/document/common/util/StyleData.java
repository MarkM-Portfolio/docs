/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

/**
 * @author wangxum@cn.ibm.com
 * 
 */
package com.ibm.concord.document.common.util;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.Text;

import com.ibm.concord.document.common.util.XHTMLDomUtil.SplitResult;
import com.ibm.json.java.JSONObject;

public class StyleData implements Data
{
  private static final Logger LOG = Logger.getLogger(StyleData.class.getName());
  
  public final static String INDEX = "i";

  public final static String OFFSET = "l";

  protected int index;

  protected int offset;

  HTMLAttributes attributes = new HTMLAttributes();

  public int getIndex()
  {
    return index;
  }

  public void setIndex(int index)
  {
    this.index = index;
  }

  public int getOffset()
  {
    return offset;
  }

  public void setOffset(int offset)
  {
    this.offset = offset;
  }

  public void read(JSONObject ob)
  {
    try
    {
      index = Integer.parseInt(ob.get(INDEX).toString());
      offset = Integer.parseInt(ob.get(OFFSET).toString());
      attributes.read(ob);
    }
    catch (NumberFormatException e)
    {
      e.printStackTrace();
    }
    catch (Exception e2)
    {
      e2.printStackTrace();
    }
  }

  public void apply(InlineStyleOperation op, Document dom)
  {
    Element e = dom.getDocumentElement();
    Element element = XHTMLDomUtil.getElementbyId(e, op.getTarget());
    if (element == null)
    {
      String msgs = "The target is null"; 
      LOG.log(Level.INFO, "Apply Inline Style message error: " + msgs);
      return;
    }
    if(LOG.isLoggable(Level.FINER ))
    {
      LOG.finer("Apply Element:" + XHTMLDomUtil.getContent(element));
      JSONObject ob = op.write();
      LOG.finer(ob.toString());
    }
    
    if (!attributes.blockTag.equals( XHTMLDomUtil.SPAN_TAG ) && !op.isRemove())
    {
      Node node = createElement(element, attributes.blockTag);
      if (node != null)
      {
        checkImage( node );
        attributes.setInline(node);
      }
    }
    else
    {
      List<Node> nodes = XHTMLDomUtil.splitNode(element, index, offset, attributes.blockTag);
      Iterator<Node> iter = nodes.iterator();
      while (iter.hasNext())
      {
        Node node = iter.next();
        if(LOG.isLoggable(Level.FINER ))
        {
          LOG.finer( "node: " + XHTMLDomUtil.getContent(node));
        }
        if (op.isRemove())
          attributes.removeInline(node);
        else
          attributes.setInline(node);
      }
    }
    element.normalize();
    XHTMLDomUtil.mergeChildNodes(element);
    if(LOG.isLoggable(Level.FINER ))
    {
      LOG.finer(  "Apply result:" + XHTMLDomUtil.getContent(element));
    }
  }

  private void checkImage(Node node)
  {
    //#13389
    //if the image 's parent node is span
    // need remove the span from the image
    // <a> <span> ... <img> ... </span> </a>
    // changed to 
    // <a> <span> ... <span> <img> <span>...</span> </a>
    if( node.getNodeName().equals("a"))
    {
      List<Node> imgs = XHTMLDomUtil.getElements( (Element) node, "img", null );
      Iterator<Node> it = imgs.iterator();
      while (it.hasNext())
      {
          Node img = it.next();
          Node parent = img.getParentNode();
          Node spanL = null, spanR = null;
          if( parent.getNodeName().equals("span"))
          {
              Node child, grandParent = parent.getParentNode();
              while( ( child = img.getPreviousSibling())!= null )
              {
                  if( spanL == null )
                  {
                      spanL = parent.cloneNode(false);
                      grandParent.insertBefore(spanL, parent);
                  }
                  parent.removeChild(child);
                  spanL.insertBefore(child, spanL.getFirstChild());
              }
              while( ( child = img.getNextSibling()) != null )
              {
                  if( spanR == null )
                  {
                      spanR = parent.cloneNode(false);
                      grandParent.insertBefore(spanR, parent.getNextSibling());
                  }
                  parent.removeChild(child);
                  spanR.appendChild(child);
              }
              parent.removeChild(img);
              grandParent.insertBefore(img, parent);
              grandParent.removeChild(parent);
          }
      }
    }
  }

  public void write(JSONObject ob)
  {
    ob.put(INDEX, index);
    ob.put(OFFSET, offset);
    attributes.write(ob);
  }

  public Element createElement(Node node, String elementName)
  {
    SplitResult result = null;
    XHTMLDomUtil util = new XHTMLDomUtil();
    if (node.getNodeType() == Node.TEXT_NODE)
    {
      result = util.splitTextNode((Text) node, index, offset, false, elementName);
      ArrayList<Node> nodes = result.midNodes;
      return (nodes.size() > 0) ? (Element) nodes.get(0) : null;
    }
    else
    {
      result = util.splitElement(node, index, offset, false);
      ArrayList<Node> nodes = result.midNodes;
      // make a node
      Element newNode = null;
      if (nodes.size() > 0)
      {
        Node pos = nodes.get(nodes.size() - 1).getNextSibling();
        Document doc = node.getOwnerDocument();
        newNode = doc.createElement(elementName);
        for (int index = 0; index < nodes.size(); index++)
        {
          Node child = node.removeChild(child = nodes.get(index));
          newNode.appendChild(child);
        }
        HTMLAttributes.removeChildren(newNode, elementName);
        node.insertBefore(newNode, pos);
      }
      return newNode;
    }
  }

  public boolean checkSuspicious()
  {
    return attributes.checkSuspicious();
  }
}
