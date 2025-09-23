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

import java.io.BufferedReader;
import java.io.ByteArrayOutputStream;
import java.io.StringReader;
import java.io.StringWriter;
import java.io.Writer;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.LinkedList;
import java.util.List;
import java.util.Map.Entry;
import java.util.Set;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import lotus.org.w3c.tidy.Tidy;

import org.w3c.dom.Attr;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.NamedNodeMap;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.w3c.dom.Text;

import com.ibm.concord.platform.util.JTidyUtil;

/**
 * @author qins@cn.ibm.com
 * 
 */
public class XHTMLDomUtil
{

  private static final String STYLE_UNDERLINE = "underline";

  private static final String STYLE_LINE_THROUGH = "line-through";

  private static final String STYLE_MARGIN_BOTTOM = "margin-bottom";

  private static final String STYLE_MARGIN_TOP = "margin-top";

  private static final String STYLE_MARGIN_RIGHT = "margin-right";

  private static final String STYLE_MARGIN_LEFT = "margin-left";

  private static final String STYLE_MARGIN = "margin";

  private static final String STYLE_BORDERBOTTOM = "border-bottom";

  private static final String STYLE_BORDERRIGHT = "border-right";

  private static final String STYLE_BORDERLEFT = "border-left";

  private static final String STYLE_BORDERTOP = "border-top";

  private static final String STYLE_BORDERWIDTH = "border-width";

  private static final String STYLE_BORDERSTYLE = "border-style";

  private static final String STYLE_BORDER = "border";

  private static final String TEXT_DECORATION = "text-decoration";

  private static final String COLON = ":";

  private static final String SEMICOLON = ";";

  private static final String SPACE = " ";

  private static final Logger LOG = Logger.getLogger(XHTMLDomUtil.class.getName());

  private static HashSet<String> NO_ID_NODES = null;

  //
  public static String LINE_SEPARATOR = System.getProperty("line.separator");

  public static final String SPAN_TAG = "span";

  public static final String IMG_TAG = "img";

  public static final String BR_TAG = "br";

  public static final String HR_TAG = "hr";

  public static final String STYLE_ATTR = "style";

  public static final String CLASS_ATTR = "class";
  
  private  static Pattern  HEADING_PATTERN =  Pattern.compile("^h[1-6]$", Pattern.CASE_INSENSITIVE);
  // end
  static
  {
    NO_ID_NODES = new HashSet<String>();
    NO_ID_NODES.add("br");
    NO_ID_NODES.add("BR");
    NO_ID_NODES.add("strong");
    NO_ID_NODES.add("STRONG");
    NO_ID_NODES.add("em");
    NO_ID_NODES.add("EM");
    NO_ID_NODES.add("u");
    NO_ID_NODES.add("U");
    NO_ID_NODES.add("strike");
    NO_ID_NODES.add("STRIKE");
    NO_ID_NODES.add("span");
    NO_ID_NODES.add("SPAN");
  }

  // A similar func of getInnerHtml()
  public static String outputElement(Tidy tidy, Element element, boolean isInner)
  {

    String content = null;

    try
    {
      ByteArrayOutputStream baos = new ByteArrayOutputStream();
      tidy.pprint(element, baos);
      content = baos.toString("UTF-8");
      if (isInner)
      {
        if (element.getChildNodes().getLength() <= 0)
        {
          baos.close();
          return "";
        }
        int i = content.indexOf(">");
        int l = content.lastIndexOf("<");
        content = content.substring(i + 1, l);
      }

      content = content.replaceAll(LINE_SEPARATOR, "");
      content = content.replaceAll(" />", ">");
      baos.close();
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "error get inner html, ", e);
    }

    return content;

  }

  public static Element parseString(Tidy tidy, String content, boolean isInner)
  {

    try
    {
      if (isInner)
      {
        // content to outter html
        content = "<div>" + content + "</div>";
      }

      int start = content.indexOf("<") + 1;
      int end = content.indexOf(" ");
      int end1 = content.indexOf(">");

      end = (end < end1 && end > start) ? end : end1;

      String elementTag = content.substring(start, end).toLowerCase();
      if (elementTag.equalsIgnoreCase("li"))
      {
        content = "<ul>" + content + "</ul>";
      }
      else if (elementTag.equalsIgnoreCase("caption"))
      {
        content = "<table>" + content + "</table>";
      }
      Document document = null;

      BufferedReader reader = new BufferedReader(new StringReader(content));

      Writer writer = new StringWriter();

      document = tidy.parseDOM(reader, writer);
      reader.close();
      writer.close();

      if (elementTag.equalsIgnoreCase("meta"))
      {
        // JTidy will create a title behind meta, we need to remove it
        NodeList nodes = document.getElementsByTagName("title");
        if (nodes != null && nodes.getLength() > 0)
        {
          Node titleNode = nodes.item(0);
          titleNode.getParentNode().removeChild(titleNode);
        }
      }
      // Element element = document.getDocumentElement();

      Element element = (Element) document.getElementsByTagName(elementTag).item(0);

      return element;

    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "error parse html, " , e);
      return null;
    }
  }

  public static int getFirstTextNodeIndex(String string, boolean inner)
  {
    if (string.length() == 0)
      return 0;
    Document document = null;

    Tidy tidy = JTidyUtil.getTidy();

    try
    {
      StringReader sr = new StringReader(string);
      document = tidy.parseDOM(sr, null);
      sr.close();
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "error getFirstTextNodeIndex, ", e);
    }

    Element element = document.getDocumentElement();// <p> or <div>
    String subStr = GetTextNode(element);

    int index = 0;
    if (inner)
      index = string.indexOf(subStr) - string.indexOf(">") - 1;// remove
    // <p....>
    else
      // outter
      index = string.indexOf(subStr);
    return index;
  }

  public static String GetTextNode(Node element)
  {
    String subStr = null;
    short type;

    Node child = element.getFirstChild();
    while (child != null)
    {
      type = child.getNodeType();
      if (type == Node.TEXT_NODE)
      {
        subStr = ((Text) child).getData();
        break;
      }
      else if (type == Node.CDATA_SECTION_NODE)
      {
      }
      else
      {
        if ((subStr = GetTextNode(child)) != null)
          break;
      }

      child = child.getNextSibling();
    }

    return subStr;
  }

  public static List<Element> getElementsbyClass(Element element, String value)
  {
    List<Element> elements = new ArrayList<Element>();
    getElementsbyAttr(elements, element, "class", value);
    return elements;
  }

  public static void getElementsbyAttr(List<Element> elements, Element rootElement, String name, String value)
  {
    // only compare if the attribute existing
    if (XHTMLDomUtil.hasAttribute(rootElement, name))
    {
      String attrValue = rootElement.getAttribute(name);
      if (null != attrValue && attrValue.equals(value))
      {
        elements.add(rootElement);
      }
    }

    // search in children
    Node child = rootElement.getFirstChild();
    while (child != null)
    {
      if (Node.ELEMENT_NODE == child.getNodeType())
      {
        getElementsbyAttr(elements, (Element) child, name, value);
      }
      child = child.getNextSibling();
    }
  }
  
  public static void getElementsIds(Element rootElement,List<String> ids)
  {
    // only compare if the attribute existing
    String name = "id";
    if (XHTMLDomUtil.hasAttribute(rootElement, name))
    {
      String attrValue = rootElement.getAttribute(name);
      if (null != attrValue )
      {
        ids.add(attrValue);
      }
    }

    // search in children
    Node child = rootElement.getFirstChild();
    while (child != null)
    {
      if (Node.ELEMENT_NODE == child.getNodeType())
      {
        getElementsIds((Element)child, ids);
      }
      child = child.getNextSibling();
    }
  }

  public static Element getElementbyId(Element element, String value)
  {

    return getElementbyAttr(element, "id", value);

  }

  public static Element getHead(Element rootElement)
  {
	
    if (rootElement.getNodeName().equalsIgnoreCase("head"))
    {
      return rootElement;
    }
    
    Element head = null;
    Node child = rootElement.getFirstChild();
    while (child != null)
    {
	    if (Node.ELEMENT_NODE == child.getNodeType())
	    {
	    	head = getHead((Element) child);
	    	if(head != null)
	    		return head;
	    }
        child = child.getNextSibling();	
    }
    
    return null;
  }

  public static Element getStyleCSSNode(Element rootElement)
  {
	Element head = getHead(rootElement);
	if(head!=null)
	{
	    List<Node> list = new LinkedList<Node>();
	    list = getElements(head,"link",null);
	    
	    if(list != null)
	    {
	    	for( Node linkNode:list)
	    	{
	    		String linkAttr = getAttribute((Element) linkNode,"href");
	    		if(linkAttr!=null && linkAttr.startsWith("style.css"))
	    			return (Element) linkNode;
	    	}
	    }
	}
    
    return null;
  }

  public static List<Node> getElements(Element rootElement, String tagName, String classname)
  {
    List<Node> list = new LinkedList<Node>();
    Pattern classfilter = null;
    if (classname != null)
      classfilter = Pattern.compile("(?:^|\\s+)" + classname + "(?=\\s|$)");
    getElementsImpl(rootElement, tagName, classfilter, list);
    return list;
  }
  
  private static void getElementsImpl(Element root, String tagName, Pattern attrFilter, List<Node> list)
  {
    if (root.getNodeName().equalsIgnoreCase(tagName) && (attrFilter==null ||  attrFilter.matcher(((Element)root).getAttribute(XHTMLDomUtil.CLASS_ATTR)).find()))
    {
      list.add(root);
    }
    Node child = root.getFirstChild();
    while (child != null)
    {
      if (Node.ELEMENT_NODE == child.getNodeType())
      {
        /*
        if (child.getNodeName().equalsIgnoreCase(tagName) && attrFilter.matcher(((Element)child).getAttribute(XHTMLDomUtil.CLASS_ATTR)).matches())
        {
          list.add(child);
        }
        */
        getElementsImpl((Element) child, tagName, attrFilter, list);
      }
      child = child.getNextSibling();
    }
  }

  public static Element getElementbyAttr(Element rootElement, String name, String value)
  {

    Element element = null;

    // only compare if the attribute existing
    if (XHTMLDomUtil.hasAttribute(rootElement, name))
    {
      String attrValue = rootElement.getAttribute(name);
      if (null != attrValue && attrValue.equals(value))
      {
        return rootElement;
      }
    }

    // search in children
    Node child = rootElement.getFirstChild();
    while (child != null)
    {
      if (Node.ELEMENT_NODE == child.getNodeType())
      {
        element = getElementbyAttr((Element) child, name, value);
        if (null != element)
          return element;
      }
      child = child.getNextSibling();
    }

    return element;
  }

  public static boolean hasAttribute(Node node, String name)
  {

    return (node.getAttributes().getNamedItem(name) != null);

  }

  public static String getAttribute(Element element, String name)
  {
    String attrValue = null;
    if (XHTMLDomUtil.hasAttribute(element, name))
      attrValue = element.getAttribute(name);
    return attrValue;
  }

  public static void generateIdForDocument(Document document)
  {
    Element root = document.getDocumentElement();
    generateIdForElement(root, "id_");
  }

  public static void generateIdForElement(Element element, String prefix)
  {
    // String nodename = element.getNodeName();
    // String att = element.getAttribute("id");
    // UUID id = UUID.randomUUID();
    // UUID is too huge for a simple document, try another id generator
    String name = element.getNodeName();
    if (!NO_ID_NODES.contains(name) && (element.getAttribute("id").equals("") || element.getAttribute("id") == null))
    {
      if (name.equalsIgnoreCase("body"))
      {
        prefix = DOMIdGenerator.generate();
        element.setAttribute("id", prefix);
      } else {
        element.setAttribute("id", DOMIdGenerator.generate(prefix));
      }
      
    }

    Node child = element.getFirstChild();
    while (child != null)
    {
      if (child instanceof Element)
      {
        generateIdForElement((Element) child, prefix);
      }
      child = child.getNextSibling();
    }
  }
  
  public static Element renameNode(Element element, String name)
  {
    Element copy = element.getOwnerDocument().createElement(name);
    NamedNodeMap attrs = element.getAttributes();
    NodeList children = element.getChildNodes();
    int len = children.getLength();
    for (int i = 0; i < len; i++)
      copy.appendChild(children.item(i));
    len = attrs.getLength();
    for (int i = 0; i < len; i++)
    {
      copy.setAttributeNode((Attr) attrs.item(i));
    }
    Element parent = (Element) element.getParentNode();
    if (parent != null)
      parent.replaceChild(copy,element);
    return copy;
  }

  /**
   * @author wangxum@cn.ibm.com function used to get length of a dom node
   */
  public static int getNodeLength(Node node)
  {
    return getPureText(node).length();
  }

  class SplitResult
  {
    private ArrayList<Node> leftNodes = new ArrayList<Node>();

    ArrayList<Node> midNodes = new ArrayList<Node>();

    private ArrayList<Node> rightNodes = new ArrayList<Node>();

    public void pushLeft(Node o)
    {
      if (o != null)
        leftNodes.add(o);
    }

    public void pushMid(Node o)
    {
      if (o != null)
        midNodes.add(o);
    }

    public void pushRight(Node o)
    {
      if (o != null)
        rightNodes.add(o);
    }

    public void add(SplitResult nodes)
    {
      if (nodes != null)
      {
        if (nodes.leftNodes.size() > 0)
          leftNodes.addAll(nodes.leftNodes);
        if (nodes.midNodes.size() > 0)
          midNodes.addAll(nodes.midNodes);
        if (nodes.rightNodes.size() > 0)
          rightNodes.addAll(nodes.rightNodes);
      }
    }

    

    public SplitResult makeThreeElements()
    {
      SplitResult ret = new SplitResult();
      ret.pushLeft(makeElement(leftNodes));
      ret.pushMid(makeElement(midNodes));
      ret.pushRight(makeElement(rightNodes));
      return ret;
    }
  }
  
  private  Node makeElement(ArrayList<Node> nodes)
  {
    Node newNode = null;
    // if( nodes.size() == 1 && nodes.get(0).getNodeType() == Node.TEXT_NODE)
    // return nodes.get(0).getParentNode();
    if (nodes.size() > 0)
    {
      Element parentNode = (Element) nodes.get(0).getParentNode();
      if (parentNode != null)
      {
        Node pos = nodes.get(0).getPreviousSibling();
        newNode = parentNode.cloneNode(false);
        for (int index = 0; index < nodes.size(); index++)
          newNode.appendChild(parentNode.removeChild(nodes.get(index)));
        if (pos != null)
          parentNode.getParentNode().insertBefore(newNode, pos.getNextSibling());
        else
          parentNode.getParentNode().insertBefore(newNode, parentNode);
        if (parentNode != null && !parentNode.hasChildNodes())
          parentNode.getParentNode().removeChild(parentNode);
      }
    }
    return newNode;
  }
  /**
   * @author wangxum@cn.ibm.com used in split node
   */
  private Text splitText(Text node, int offset)
  {
    Text newNode = (Text) node.cloneNode(false);
    String value = node.getNodeValue();
    String value1 = value.substring(0, offset);
    String value2 = value.substring(offset, value.length());
    node.setNodeValue(value1);
    newNode.setNodeValue(value2);
    node.getParentNode().insertBefore(newNode, node.getNextSibling());
    return newNode;
  }

  SplitResult splitTextNode(Text node, int start, int offset, boolean splitparent, String elementName)
  {
    // because not implemented Text::splitTextNode in this dom level
    SplitResult result = new SplitResult();
    int len = getNodeLength(node);
    Node node1 = null, node2, node3 = null;
    if (start == 0 && offset >= len)
      node2 = node;
    else if (start > 0)
    {
      node2 = splitText(node, start);
      node1 = node;
      if (start + offset < len)
        node3 = splitText((Text) node2, offset);
    }
    else
    {
      node3 = splitText(node, offset);
      node2 = node;
    }
    if (!splitparent && node2 != null && (node1 != null || node3 != null))
    {
      Document doc = node.getOwnerDocument();
      Node span = doc.createElement(elementName);
      node.getParentNode().replaceChild(span, node2);
      span.appendChild(doc.createTextNode(node2.getNodeValue()));
      node2 = span;
    }

    result.pushLeft(node1);
    result.pushMid(node2);
    result.pushRight(node3);
    return result;
  }

  /**
   * @author wangxum@cn.ibm.com used in split node
   */
  protected SplitResult splitElement(Node node, int start, int offset, String elementName)
  {
    SplitResult result = null;
    SplitResult ret = new SplitResult();
    boolean splitOwn = (node.getNodeName().toLowerCase().equals(elementName) || node.getNodeName().toLowerCase().equals(SPAN_TAG))
        && !XHTMLDomUtil.hasAttribute(node, "id");
    Node childNode = node.getFirstChild();
    if (childNode == null)
    { // if it is an image
      ret.pushMid(node);
      return ret;
    }
    Node nextChild;
    while( childNode != null ){
      nextChild = childNode.getNextSibling();
      fixSpan( childNode );
      childNode = nextChild;
    }
    childNode = node.getFirstChild();
    
    while (childNode != null)
    {
      nextChild = childNode.getNextSibling();
      int len = getNodeLength(childNode);
      if (start == 0 && len == 0 && offset == 0)
      {
        result = new SplitResult();
        if (childNode.getNodeName().equals("br"))
          result.pushRight(childNode);
        else
          result.pushMid(childNode);
      }
      else if (offset <= 0)
      {
        offset -= len;
        result = new SplitResult();
        result.pushRight(childNode);
      }
      else if (start >= len)
      {
        start -= len;
        result = new SplitResult();
        result.pushLeft(childNode);
      }
      else
      {
        if (childNode.getNodeType() == Node.TEXT_NODE)
          result = splitTextNode((Text) childNode, start, offset, splitOwn, elementName);
        else if (childNode.getNodeType() == Node.ELEMENT_NODE)
          result = splitElement(childNode, start, offset, elementName);
        offset = offset + start - len;
        start = 0;
      }
      childNode = nextChild;
      ret.add(result);
    }
    if (splitOwn)
      ret = ret.makeThreeElements();
    return ret;
  }

  void fixSpan( Node node ){
  //change <span> abc<a>...</a></span> to <span>abc</span><a><span>...</span></a>
    if( !node.getNodeName().equalsIgnoreCase("span") )
        return;
    ArrayList<Node> array = new ArrayList<Node>();
    Node next;
    Node child = node.getFirstChild();
    while( child != null  ){
        next = child.getNextSibling();
        if( child.getNodeType() == Node.TEXT_NODE || !child.getNodeName().equalsIgnoreCase("a")){
            array.add(child);
        }else{
            makeElement(array);
            Node span = node.cloneNode(false);
            child.appendChild( span );
            Node prev;
            while( ( prev = span.getPreviousSibling()) != null ){
                child.removeChild(prev);
                span.insertBefore( prev, span.getFirstChild() );
            }
            node.removeChild( child );
            node.getParentNode().insertBefore( child, node );
            array.clear();  
        }
        child = next;
    }
    if( node.getFirstChild()== null )
        node.getParentNode().removeChild(node);
  }
  
  SplitResult splitElement(Node node, int start, int offset, boolean splitOwn)
  {
    SplitResult result = null;
    SplitResult ret = new SplitResult();
    Node childNode = node.getFirstChild();
    if (childNode == null)
    { // if it is an image
      ret.pushMid(node);
      return ret;
    }
    Node nextChild;
    while( childNode != null ){
      nextChild = childNode.getNextSibling();
      fixSpan( childNode );
      childNode = nextChild;
    }
    childNode = node.getFirstChild();
    while (childNode != null)
    {
      nextChild = childNode.getNextSibling();
      int len = getNodeLength(childNode);
      if (start == 0 && len == 0 && offset == 0)
      {
        result = new SplitResult();
        if (childNode.getNodeName().equals("br"))
          result.pushRight(childNode);
        else
          result.pushMid(childNode);
      }
      else if (offset <= 0)
      {
        offset -= len;
        result = new SplitResult();
        result.pushRight(childNode);
      }
      else if (start >= len)
      {
        start -= len;
        result = new SplitResult();
        result.pushLeft(childNode);
      }
      else
      {
        if (childNode.getNodeType() == Node.TEXT_NODE)
          result = splitTextNode((Text) childNode, start, offset, true, node.getNodeName());
        else if (childNode.getNodeType() == Node.ELEMENT_NODE)
          result = splitElement(childNode, start, offset, true);
        offset = offset + start - len;
        start = 0;
      }
      childNode = nextChild;
      ret.add(result);
    }
    if (splitOwn)
      ret = ret.makeThreeElements();
    return ret;

  }

  public static List<Node> splitNode(Node node, int start, int offset, String elementName)
  {// return false if need split next sibling node.
    if (elementName == null || elementName.equals(""))
      elementName = XHTMLDomUtil.SPAN_TAG;
    XHTMLDomUtil util = new XHTMLDomUtil();
    SplitResult result = null;
    // Node cloneNode = node.cloneNode(true);
    try
    {
      if (node.getNodeType() == Node.TEXT_NODE)
        result = util.splitTextNode((Text) node, start, offset, false, elementName);
      else if (node.getNodeType() == Node.ELEMENT_NODE)
        result = util.splitElement(node, start, offset, elementName);
    }
    catch (Exception e)
    {
//      e.printStackTrace();
      LOG.log(Level.WARNING, "error in XHTMLDomUtil.splitNode.");
      // node.getParentNode().replaceChild(cloneNode, node);
      return new ArrayList<Node>();
    }
    if (result != null)
      return result.midNodes;
    else
      return new ArrayList<Node>();
  }

  public static void setStyle(Element element, HashMap<String, String> styles)
  {
    String oldStyles = ((Element) element).getAttribute(XHTMLDomUtil.STYLE_ATTR);
    if (oldStyles != "")
    { // merge old styles
      HashMap<String, String> hash = new HashMap<String, String>();
      putStylesToHash(oldStyles, hash);

      hash.putAll(styles);
      element.setAttribute(XHTMLDomUtil.STYLE_ATTR, convertStylesHashtoString(hash));
    }
    else
      element.setAttribute(XHTMLDomUtil.STYLE_ATTR, convertStylesHashtoString(styles));
  }

  /**
   * @author wangxum@cn.ibm.com
   * 
   */
  private static boolean isMergedStyle(String stylename)
  {
    return stylename.equalsIgnoreCase(TEXT_DECORATION);
  }

  public static void setStyle(Element element, String stylename, String value)
  {
    String oldStyles = element.getAttribute(XHTMLDomUtil.STYLE_ATTR);
    if (oldStyles == null)
      oldStyles = "";
    stylename = stylename.toLowerCase().trim();
    if (oldStyles != "")
    { // merge old styles
      HashMap<String, String> hash = new HashMap<String, String>();
      putStylesToHash(oldStyles, hash);

      if (stylename.equals(STYLE_LINE_THROUGH) || stylename.equals(STYLE_UNDERLINE))
      {
        String oldValue = hash.get(TEXT_DECORATION);
        if (oldValue == null || oldValue.matches(".*\\bnone\\b.*") )
          oldValue = "";
        if (!value.equals(""))
        {
          value = stylename;
          stylename = TEXT_DECORATION;
          if (!oldValue.matches(".*\\b" + value + "\\b.*"))
            value = oldValue + " " + value;
          else
            value = oldValue;
        }
        else if (oldValue.matches(".*\\b" + value + "\\b.*"))
        {
          value = oldValue.replaceAll(stylename, "").replaceAll("\\s+", " ").trim();
          stylename = TEXT_DECORATION;
        }
      }
      String margin = hash.get(STYLE_MARGIN);
      if( margin != null && !margin.trim().isEmpty())
      {
    	  hash.remove(STYLE_MARGIN);
    	  String[] margins = margin.split(" ");
    	  String marginL,marginR,marginT,marginB;
    	  marginL = marginR = marginT = marginB = margin;
    	  if(margins.length > 2)
    	  {
    		  marginT = margins[0];
    		  marginR = margins[1];
    		  marginB = margins[2];
    		  marginL = margins[3];
    	  }else if(margins.length > 1)
    	  {
    		  marginT = marginB = margins[0];
    		  marginR = marginL = margins[1];
    	  }
    	  hash.put(STYLE_MARGIN_LEFT, marginL);
    	  hash.put(STYLE_MARGIN_RIGHT, marginR);
    	  hash.put(STYLE_MARGIN_TOP, marginT);
    	  hash.put(STYLE_MARGIN_BOTTOM, marginB);
      }

      if (value.equals(""))
      {
        hash.remove(stylename);
        if (stylename.equals(STYLE_BORDER))
        {
          hash.remove(STYLE_BORDERSTYLE);
          hash.remove(STYLE_BORDERWIDTH);
          hash.remove(STYLE_BORDERTOP);
          hash.remove(STYLE_BORDERLEFT);
          hash.remove(STYLE_BORDERRIGHT);
          hash.remove(STYLE_BORDERBOTTOM);
        }
        else if (stylename.equals(STYLE_MARGIN))
        {
          hash.remove(STYLE_MARGIN_LEFT);
          hash.remove(STYLE_MARGIN_RIGHT);
          hash.remove(STYLE_MARGIN_TOP);
          hash.remove(STYLE_MARGIN_BOTTOM);
        }
      }
      else
    	hash.put(stylename.trim(), value);
      element.setAttribute(XHTMLDomUtil.STYLE_ATTR, convertStylesHashtoString(hash));
    }
    else if (!value.equals(""))
    {
      if (stylename.equals(STYLE_LINE_THROUGH) || stylename.equals(STYLE_UNDERLINE))
      {
        value = stylename;
        stylename = TEXT_DECORATION;
      }
      element.setAttribute(XHTMLDomUtil.STYLE_ATTR, stylename + COLON + value + SEMICOLON);
    }
  }

  /**
   * @author wangxum@cn.ibm.com
   * 
   */
  public static void removeStyle(Element element, String stylename, String value)
  {
    String oldStyles = element.getAttribute(XHTMLDomUtil.STYLE_ATTR);
    stylename = stylename.toLowerCase();
    if (stylename.equals(STYLE_LINE_THROUGH) || stylename.equals(STYLE_UNDERLINE))
    {
      value = stylename;
      stylename = TEXT_DECORATION;
    }
    if (oldStyles != null && oldStyles != "")
    {
      HashMap<String, String> hash = new HashMap<String, String>();
      putStylesToHash(oldStyles, hash);
      String string = hash.get(stylename);
      if (string != null)
      {
        if (isMergedStyle(stylename))
        {
          string = string.replace(value, "").trim();
          if (string.equals(""))
            hash.remove(stylename);
          else
            hash.put(stylename, string);
        }
        else
          hash.remove(stylename);
        String newstyles = convertStylesHashtoString(hash).trim();
        if (newstyles.length() > 0)
          element.setAttribute(XHTMLDomUtil.STYLE_ATTR, newstyles);
        else
          element.removeAttribute(XHTMLDomUtil.STYLE_ATTR);
      }
    }
  }

  /**
   * @author zhouzlin@cn.ibm.com
   * 
   */
  public static void removeClass(Element element, String className)
  {
    String string = element.getAttribute(XHTMLDomUtil.CLASS_ATTR).trim();
    Matcher macher = Pattern.compile("(?:^|\\s+)" + className + "(?=\\s|$)").matcher(string);
    if (macher.find())
    {
      String newClasses = macher.replaceFirst(" ").trim();
      if (newClasses.length() > 0)
        element.setAttribute(XHTMLDomUtil.CLASS_ATTR, newClasses);
      else
        element.removeAttribute(XHTMLDomUtil.CLASS_ATTR);
    }
  }

  /**
   * @author wangxum@cn.ibm.com check if an element has a specific class
   */
  public static boolean hasClass(Element element, String className)
  {
    
    String string = element.getAttribute(XHTMLDomUtil.CLASS_ATTR).trim();
    if (Pattern.compile("(?:^|\\s+)" + className + "(?=\\s|$)").matcher(string).find())
    {
      return true;
    }
    return false;
  }
  
  /**
   * @author zhouzlin@cn.ibm.com check if an element has a specific class begin with
   */
  public static boolean hasClassBeginWith(Element element, String className)
  {
    String string = element.getAttribute(XHTMLDomUtil.CLASS_ATTR).toLowerCase().trim();
    className = className.toLowerCase().trim();
    if (string != null && !string.isEmpty())
    {
      String[] classes = string.split(SPACE);
      for (int i = 0; i < classes.length; i++)
      {
        if (classes[i].startsWith(className))
          return true;
      }
    }
    return false;
  }

  /**
   * @author zhouzlin@cn.ibm.com "classA classB classC" + "classB" will become "classA classC classB"
   */
  public static void addClass(Element element, String className)
  {
    String string = element.getAttribute(XHTMLDomUtil.CLASS_ATTR).trim();
    Matcher macher = Pattern.compile("(?:^|\\s+)" + className + "(?=\\s|$)").matcher(string);
    if (!macher.find())
    {
      String newClasses = (string + " " + className).trim();
      if (newClasses.length() > 0)
        element.setAttribute(XHTMLDomUtil.CLASS_ATTR, newClasses);
      else
        element.removeAttribute(XHTMLDomUtil.CLASS_ATTR);
    }
  }

  /**
   * @author wangxum@cn.ibm.com
   * 
   */
  public static void putStylesToHash(String string, HashMap<String, String> styleshash)
  {
    String[] styles = string.split(SEMICOLON);
    for (int i = 0; i < styles.length; i++)
    {
      if (!styles[i].equals(""))
      {
        String[] stylePair = styles[i].split(COLON);
        String name = stylePair[0].trim().toLowerCase();
        if (stylePair.length == 2)
          styleshash.put(name, stylePair[1].trim());
        else
          // remove attribute
          styleshash.remove(name);
      }
    }
  }

  /**
   * @author wangxum@cn.ibm.com
   * 
   */
  public static String convertStylesHashtoString(HashMap<String, String> styleshash)
  {
    Set<Entry<String, String>> entries = styleshash.entrySet();
    Iterator<Entry<String, String>> iter = entries.iterator();
    StringBuffer buf = new StringBuffer();
    while (iter.hasNext())
    {
      Entry<String, String> entry = iter.next();
      buf.append(entry.getKey()).append(COLON).append(entry.getValue()).append(SEMICOLON);
    }
    return buf.toString();
  }

  /*
   * @author wangxum@cn.ibm.com check if a node is a bogus of paragraph.
   * 
   * @param Node node
   * 
   * @return boolean
   */
  public static boolean isBogus(Node node)
  {
    return node.getNodeType() == Node.ELEMENT_NODE && node.getNodeName().equals(BR_TAG)
        && XHTMLDomUtil.hasClass((Element) node, "hideInIE");
  }

  /*
   * @author xuezhiy@cn.ibm.com check if a node is a line break <br type='lb'>.
   * 
   * @param Node node
   * 
   * @return boolean
   */
  public static boolean isLineBreak(Node node)
  {
    if (node.getNodeType() == Node.ELEMENT_NODE && node.getNodeName().equals(BR_TAG))
    {
      String value = XHTMLDomUtil.getAttribute((Element) node, "type");
      return value != null && value.equalsIgnoreCase("lb");
    }
    return false;
  }

  /*
   * @author wangxum@cn.ibm.com check if a node is a br added by FireFox.
   * 
   * @param Node node
   * 
   * @return boolean
   */
  public static boolean isMozBr(Node node)
  {
    if (node.getNodeType() == Node.ELEMENT_NODE && node.getNodeName().equals(BR_TAG))
    {
      String value = XHTMLDomUtil.getAttribute((Element) node, "type");
      String mozDirty = XHTMLDomUtil.getAttribute((Element) node, "_moz_dirty");
      
      return ( (value != null && value.equals("_moz")) || mozDirty != null );
    }
    return false;
  }

  /*
   * @author wangxum@cn.ibm.com check if a node is br that should be 0 length.
   * 
   * @param Node node
   * 
   * @return boolean
   */
  public static boolean isNullBr(Node node)
  {
    return ( node.getNodeType() == Node.ELEMENT_NODE && node.getNodeName().equals(BR_TAG) &&  !XHTMLDomUtil.isLineBreak(node) );
    
  }

  /**
   * @author sfeiguo@cn.ibm.com
   */
  public static String getPureText(Node node)
  {
    if (node == null)
      return null;
    String ret = "";
    if (node.getNodeType() == Node.TEXT_NODE)
      ret = node.getNodeValue();
    else if (node.getNodeType() == Node.ELEMENT_NODE)
    {
      String name = node.getNodeName();
      if (name.equals("img"))
        ret = "\u0001";
      else if (name.equals(BR_TAG) && !XHTMLDomUtil.isNullBr(node))
        ret = "\n";
      else if (!XHTMLDomUtil.hasAttribute(node, "_fck_bookmark"))
      {
        Node child = node.getFirstChild();
        while(child != null)
        {
          ret += getPureText(child);
          child = child.getNextSibling();
        }
      }
    }
    return ret;
  }

  public static void insertAfter(Node newNode, Node node)
  {
    if (node.getNextSibling() != null)
    {
      node.getParentNode().insertBefore(newNode, node.getNextSibling());
    }
    else
    {
      node.getParentNode().appendChild(newNode);
    }
  }
  
  public static boolean isHeading( String name )
  {
    return HEADING_PATTERN.matcher(name).matches();
  }
  public static boolean isBlockListItem(Node node)
  {
    String name = node.getNodeName();
    return name.equalsIgnoreCase("ul") || name.equalsIgnoreCase("ol")
        || name.equalsIgnoreCase("p")
        || isHeading(name);
  }
  /**
   * @author wangxum@cn.ibm.com
   * 
   */
  public static void mergeElements(Element element, Element element2)
  {// TODO: wangxum

  }

  /**
   * @author wangxum@cn.ibm.com
   * 
   *         Check if two elements has same attributes and tagName
   * 
   */
  public static boolean isMergable(Node node, Node toMerge)
  {
    if (node.getNodeType() != Node.ELEMENT_NODE || toMerge.getNodeType() != Node.ELEMENT_NODE)
      return false;
    if (!node.getNodeName().equals(toMerge.getNodeName()))
      return false;
    NamedNodeMap attributes = node.getAttributes();
    NamedNodeMap attributes2 = toMerge.getAttributes();
    Element e1 = (Element) node;
    Element e2 = (Element) toMerge;
    if (attributes.getLength() != attributes2.getLength())
      return false;

    int length = attributes.getLength();
    for (int i = 0; i < length; i++)
    {
      Node attr = attributes.item(i);
      String name = attr.getNodeName();
      // if(name.equalsIgnoreCase("style"))
      // {
      //        
      // }
      // else
      if (e1.getAttribute(name)== null || !e1.getAttribute(name).equalsIgnoreCase(e2.getAttribute(name)))
        return false;
      else if(node.getNodeName().equalsIgnoreCase(BR_TAG) && name.equalsIgnoreCase("type"))
      {
        // Don't merge <br type='lb'> element.
        return false;
      }
    }
    return true;
  }

  public static String getContent(Node node)
  {
    Tidy tidy = JTidyUtil.getTidy();
    String content = XHTMLDomUtil.getNodeHtml(tidy, node);
    return content.trim();
  }

  static String getNodeHtml(Tidy tidy, Node node)
  {
    ByteArrayOutputStream baos = new ByteArrayOutputStream();
    tidy.pprint(node, baos);
    return baos.toString();
  }

  public static void mergeChildNodes(Node element)
  {
    Node node = element.getFirstChild();
    while (node != null)
    {
      node = XHTMLDomUtil.mergeSiblings(node, false);
      mergeChildNodes(node);
      // remove black span nodes
      if (node.getNodeName().equals(XHTMLDomUtil.SPAN_TAG) && node.getChildNodes().getLength() == 0)
      {
        Node tmp = node;
        node = tmp.getNextSibling();
        element.removeChild(tmp);
      }
      if (node != null)
        node = node.getNextSibling();
    }
  }

  public static Node mergeSiblings(Node node, boolean bNext)
  {
    Node merged = bNext ? node.getNextSibling() : node.getPreviousSibling();
    if (merged != null && isMergable(node, merged))
    {
      Node newChild;
      if (bNext)
      {
        while ((newChild = merged.getFirstChild()) != null)
        {
          newChild = merged.removeChild(newChild);
          node.appendChild(newChild);
        }
      }
      else
      {
        while ((newChild = merged.getLastChild()) != null)
        {
          newChild = merged.removeChild(newChild);
          node.insertBefore(newChild, node.getFirstChild());
        }
      }
      node.getParentNode().removeChild(merged);
    }
    return node;
  }
  
  public static void mergeTextNode( Node element )
  {
    if( element.getNodeType() == Node.ELEMENT_NODE )
    {
        Node  child = element.getFirstChild();
        while( child != null )
        {
           if( child.getNodeType() == Node.TEXT_NODE )
           {
              Node next = child.getNextSibling();
              if( next!= null && next.getNodeType() == Node.TEXT_NODE )
              {
                 String s = child.getNodeValue();
                 child.setNodeValue(s.concat(next.getNodeValue()));
                 next.getParentNode().removeChild(next);
                 continue;
              }
           }
           child = child.getNextSibling();
        }
    }
    
  }

  public static boolean isBlankTextNode(Node node)
  {
    if (node != null && node.getNodeType() == Node.TEXT_NODE && XHTMLDomUtil.getPureText(node).trim().isEmpty())
      return true;
    return false;
  }

  public static int getNodeIndex( Node node )
  {
    return getNodeIndex( node, false );
  }
  
  public static int getBlockIndex( Node node )
  {
    return getNodeIndex( node , true );
  }
  
  private static int getNodeIndex(Node node, boolean bBlock )
  {
    if (node.getParentNode() == null)
      return -1;
    
    boolean isBullet = bBlock && isBullet((Element) node.getParentNode());
    
    int nodeIndex = 0;
    Node preSibling = node.getPreviousSibling();
    while (preSibling != null)
    {
      if( !isBullet || !isInline(preSibling))
        nodeIndex++;
      
      preSibling = preSibling.getPreviousSibling();
    }
    return nodeIndex;
  }

  public static Node getBlock(Element parent, int index )
  {
   
    boolean isBullet = isBullet(parent);
    int i = 0;
    Node child = parent.getFirstChild();
    while( child!=null )
    {
      while( isBullet && child!= null && isInline( child )) 
          child = child.getNextSibling();
      
      if( i == index )
          return child;
      if( child == null )
          break;
      i++;
      child = child.getNextSibling();
    }
    return null;
  }
  
  public static boolean isBullet(Element node)
  {
    String nodeName = node.getNodeName();
    return Dtd.isListItem(nodeName)||Dtd.isList(nodeName);
  }

  public static boolean isInline(Node node)
  {
    if( node.getNodeType() != Node.ELEMENT_NODE )
         return true;
    String nodeName = node.getNodeName();
    
    //#8863
    if( nodeName.equalsIgnoreCase("div") && node.getParentNode().getNodeName().equalsIgnoreCase("li"))
      return true;
    
    return Dtd.isInline(nodeName);
  }
  
  public static Node getAscendant(Node node,String nodeName,boolean includeSelf)
  {
    if (!includeSelf)
      node = node.getParentNode();
    
    while (node != null)
    {
        if (node.getNodeName().equalsIgnoreCase(nodeName))
        {
            return node;
        }
        node = node.getParentNode();
    }
    return null;
  }
  
}

class InsertPos
{
  public Node node = null;

  public int offset;

  public InsertPos(Node node, int offset)
  {
    this.node = node;
    this.offset = offset;
  }
}
