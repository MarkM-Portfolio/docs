/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.document.common.util;

import java.util.HashMap;
import java.util.Iterator;
import java.util.Map.Entry;
import java.util.Set;

import org.w3c.dom.Element;
import org.w3c.dom.NamedNodeMap;
import org.w3c.dom.Node;

import com.ibm.docs.common.security.ACFUtil;
import com.ibm.json.java.JSONObject;

public class HTMLAttributes
{
  public final static String STYLES = "s";

  public final static String ATTRIBUTES = "a";

  public final static String BLOCKTAG = "e";

  protected HashMap<String, String> styles = new HashMap<String, String>();

  protected HashMap<String, String> attributes = new HashMap<String, String>();

  protected String blockTag = XHTMLDomUtil.SPAN_TAG;

  private boolean checkStyles(HashMap<String, String>styleMap)
  {
    Set<String> keys = styleMap.keySet();
    Iterator<String> iter = keys.iterator();
    while (iter.hasNext())
    {
      String key = iter.next();
      String value = styleMap.get(key).toString();
      if(ACFUtil.suspiciousAttribute(key, value))
        return true;
    }
    
    return false;
  }
  
  public boolean checkSuspicious()
  {
    if( ACFUtil.suspiciousHtmlRegex("<" + blockTag + ">") || checkStyles(styles) || checkStyles(attributes))
      return true;
    
    return false;
  }
  
  public void read(JSONObject ob)
  {
    Object elementname = ob.get(BLOCKTAG);
    blockTag = (elementname == null) ? XHTMLDomUtil.SPAN_TAG : elementname.toString();
    // read styles
    readHashMap((JSONObject) ob.get(STYLES), styles);
    // read attributes
    readHashMap((JSONObject) ob.get(ATTRIBUTES), attributes);
  }
  
  Node removeElement(Node node)
  {
    Node parent = node.getParentNode();
    if (parent == null)
      return null;
    if (node.getNodeName().compareToIgnoreCase(blockTag) == 0)
    {
      Element element = node.getOwnerDocument().createElement(XHTMLDomUtil.SPAN_TAG);
      Element old = (Element) node;
      Node child = old.getFirstChild();
      while (child != null)
      {
        Node next = child.getNextSibling();
        element.appendChild(old.removeChild(child));
        child = next;
      }

      NamedNodeMap attrs = old.getAttributes();
      int length = attrs.getLength();
      for (int i = 0; i < length; i++)
      {
        Node item = attrs.item(i);
        if (!item.getNodeName().toLowerCase().equals("id"))
          element.setAttribute(item.getNodeName(), item.getNodeValue());
      }
      parent.replaceChild(element, node);
      return element;
    }
    return node;
  }

  public void removeInline(Node node)
  {
    if (!blockTag.equals(XHTMLDomUtil.SPAN_TAG))
    {
      if (node != null)
        node = removeElement(node);
    }
    if (node != null)
    { 
      removeStyles(node, true ); 
      removeAttributes( node );
    }
  }

  public void setInline(Node node)
  {
	//Tab stop is a image node. It should be processed as text node.
	boolean isConcordTab = XHTMLDomUtil.IMG_TAG.equals( node.getNodeName() ) && "ConcordTab".equals( ( (Element) node ).getAttribute( "class" ) );
    if (node.getNodeType() == Node.TEXT_NODE || isConcordTab )
    {
      Element span = node.getOwnerDocument().createElement(XHTMLDomUtil.SPAN_TAG);
      Node parent = node.getParentNode();
      parent.insertBefore(span, node);
      span.appendChild(parent.removeChild(node));
      node = span;
    }
    setStyles(node);
    setAttributes(node);
    
    if (node != null)
    { 
      Node child = node.getFirstChild();
      while (child != null)
      {//remove duplicated styles and attributes to children elements.
        Node next = child.getNextSibling();
        if( child.getNodeType() == Node.ELEMENT_NODE )
          removeStyles(child, true );
        child = next;
      }
    }
  }

  static void moveChildren(Node node)
  {
    Node child = node.getFirstChild();
    while (child != null)
    {
      Node next = child.getNextSibling();
      node.getParentNode().insertBefore(node.removeChild(child), node);
      child = next;
    }
    node.getParentNode().removeChild(node);
  }

  static void removeChildren(Node node, String elementName)
  {
    Node child = node.getFirstChild();
    while (child != null)
    {
      Node next = child.getNextSibling();
      removeChildren(child, elementName);
      if (child.getNodeName().compareToIgnoreCase(elementName) == 0)
        moveChildren(child);
      child = next;
    }
  }

  public void removeBlockStyle(Node node)
  {
    if (!blockTag.equals(XHTMLDomUtil.SPAN_TAG))
    {
      HTMLAttributes.moveChildren(node);
    }
    else
      removeStyles(node, false);
  }

  public void setBlockStyle(Node node)
  {
    setStyles(node);
    setAttributes(node);
  }

  private void setAttributes(Node node)
  {
    Set<String> keys = attributes.keySet();
    Iterator<String> iter = keys.iterator();
    Element n = (node.getNodeType() ==  Element.ELEMENT_NODE )? (Element)node :(Element)node.getParentNode();
    while (iter.hasNext())
    {
      String key = iter.next();
      String value = attributes.get(key).toString();
      if(value.equals("")) 
        n.removeAttribute(key);
      else
        n.setAttribute(key, value);
    }
  }

  public void write(JSONObject ob)
  {
    if (blockTag != null && !blockTag.equals("") && !blockTag.equalsIgnoreCase(XHTMLDomUtil.SPAN_TAG))
      ob.put(BLOCKTAG, blockTag);
    JSONObject json_styles = convertHashToJSON(styles);
    if (json_styles != null)
      ob.put(STYLES, json_styles);
    JSONObject json_attributes = convertHashToJSON(attributes);
    if (json_attributes != null)
      ob.put(ATTRIBUTES, json_attributes);
  }
  
  public boolean isModifiedAttribute( String atributeName )
  {
    Set<String> keys = attributes.keySet();
    return keys.contains(atributeName);
  }

  static void readHashMap(JSONObject ob, HashMap<String, String> hash)
  {
    if (ob != null)
    {
      Set<?> keys = ob.keySet();
      Iterator<?> iter = keys.iterator();
      while (iter.hasNext())
      {
        String key = iter.next().toString();
        String value = ob.get(key).toString();
        if (key != null){
        	//HTML attribute and style key is case insensitive
        	key = key.toLowerCase();
        	if(!ACFUtil.suspiciousAttribute(key, value) )
        		hash.put(key, value);
        }
      }
    }
  }

  static JSONObject convertHashToJSON(HashMap<String, String> hash)
  {
    if (hash.size() > 0)
    {
      JSONObject ob = new JSONObject();
      Set<Entry<String, String>> entries = hash.entrySet();
      Iterator<Entry<String, String>> iter = entries.iterator();
      while (iter.hasNext())
      {
        Entry<String, String> entry = iter.next();
        ob.put(entry.getKey(), entry.getValue());
      }
      return ob;
    }
    return null;
  }

  private void setStyles(Node node)
  {
    if (node.getNodeType() == Element.ELEMENT_NODE)
    {
      Set<String> keys = styles.keySet();
      Iterator<String> iter = keys.iterator();
      while (iter.hasNext())
      {
        String key = iter.next();
        XHTMLDomUtil.setStyle((Element) node, key, styles.get(key).toString());
      }
    }
  }

  private void removeStyles(Node node, boolean includeChildren )
  {
    if (node.getNodeType() == Element.ELEMENT_NODE)
    {
      Set<String> keys = styles.keySet();
      Iterator<String> iter = keys.iterator();
      while (iter.hasNext())
      {
        String key = iter.next();
        XHTMLDomUtil.removeStyle((Element) node, key, styles.get(key).toString());
      }
      
      if( includeChildren )
      {
        Node child = node.getFirstChild();
        while (child != null)
        {
          Node next = child.getNextSibling();
          removeStyles(child, true );
          child = next;
        }
      }
    }
  }
  
  private void removeAttributes(Node node)
  {
    if (node.getNodeType() == Element.ELEMENT_NODE)
    {
      Set<String> keys = attributes.keySet();
      Iterator<String> iter = keys.iterator();
      while (iter.hasNext())
      {
        String key = iter.next();
        if (key.equals(XHTMLDomUtil.CLASS_ATTR))
          XHTMLDomUtil.removeClass((Element) node, attributes.get(key));
        else
          ((Element) node).removeAttribute(key);
      }
    }
  }
}
