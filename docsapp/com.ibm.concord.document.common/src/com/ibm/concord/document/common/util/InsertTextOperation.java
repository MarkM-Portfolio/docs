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

import java.util.ArrayList;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

import lotus.org.w3c.tidy.Tidy;

import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

import com.ibm.concord.platform.util.JTidyUtil;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

/**
 * @author sfeiguo@cn.ibm.com
 * 
 */
public class InsertTextOperation extends Operation
{
	//fix for defect 13733, if client index larger than server node length, append " " or "&nbsp;" at end of server node
	private final int allowLostChars = 10;
  private int index;

  private int length;

  private List<InsertTextData> cnts;
  
  private String fragment = null;

  private static final Logger LOG = Logger.getLogger(InsertTextOperation.class.getName());

  private InsertPos insertPos = null;

  static final String[] block = { "address", "blockquote", "center", "dir", "div", "dl", "fieldset", "form", "h1", "h2", "h3", "h4", "h5",
      "h6", "hr", "isindex", "menu", "noframes", "ol", "p", "pre", "table", "ul" };

  static final String[] blockLimit = { "body", "div", "td", "th", "caption", "form" };

  static final String[] listItem = { "dd", "dt", "li" };

  static final String[] list = { "ul", "ol", "dl" };

  static final String[] tableContent = { "caption", "col", "colgroup", "tbody", "td", "tfoot", "th", "thead", "tr" };

  public InsertPos getInsertPos()
  {
    return insertPos;
  }

  public void setInsertPos(InsertPos insertPos)
  {
    this.insertPos = insertPos;
  }

  public void setContents(List<InsertTextData> cnts)
  {
    this.cnts = cnts;
  }

  public List<InsertTextData> getContents()
  {
    return this.cnts;
  }

  public boolean read(JSONObject update)
  {
    try
    {
      setType((String) update.get(TYPE));
      setTarget((String) update.get(TARGET));
      setIndex(Integer.parseInt(update.get(INDEX).toString()));
      setLength(Integer.parseInt(update.get(LENGTH).toString()));
      readAppend(update);
      JSONArray contents = (JSONArray) update.get(CONTENTS);
      fragment = (String)update.get("frag");
      cnts = new ArrayList<InsertTextData>();
      for (int i = 0; i < contents.size(); i++)
      {
        JSONObject content = (JSONObject) contents.get(i);
        InsertTextData data = new InsertTextData();
        data.read(content);
        cnts.add(data);
      }
      return true;
    }
    catch (Exception e)
    {
      return false;
    }
  }

  // TODO,just for test,will be removed.
  static void log(Tidy tidy, Node node)
  {
    // ByteArrayOutputStream baos = new ByteArrayOutputStream();
    // tidy.pprint(node, baos);
  }

  public int getInsertMode()
  {
    int mode = cnts.get(0).getIp();
    return mode;
  }

  public void apply(Tidy tidy, Document dom) throws Exception
  {
    if (cnts.size() == 0)
      return;
    Element e = dom.getDocumentElement();
    Element targetElement = XHTMLDomUtil.getElementbyId(e, getTarget());
    if (targetElement == null){
    	LOG.info("==Apply Insert text message error, target is not found: " + getTarget());
    	 return;
    }

    if (targetElement.getNodeName().equalsIgnoreCase("body"))
      return;

    InsertContext insertContext = null;
    boolean insertBefore = false;
    int insertPos = cnts.get(0).getIp();
    if (insertPos > 0)
    {
      if (this.insertPos == null || this.insertPos.node == null || this.insertPos.node.getParentNode().getParentNode() == null)
      {
        // LOG.log(Level.WARNING, "ProcMsg: insertText position error");
        insertContext = getInsertPos(targetElement, getIndex());
      }
      else
      {
        insertContext = new InsertContext(this.insertPos.node, this.insertPos.offset, false);
      }
    }
    else
    {
      insertContext = getInsertPos(targetElement, getIndex());

      if (insertContext !=null){
    	  insertBefore = insertContext.insertBefore;
          if (insertPos == -1)
          {
            int offset = insertContext.offset;
            Node container = insertContext.container;
            Node blockElement = getBlock(container);
            if (getIndex() == XHTMLDomUtil.getPureText(blockElement).length())
            {
              Node last = blockElement.getLastChild();
              if ( last != null && XHTMLDomUtil.isNullBr(last))
                last = last.getPreviousSibling();
              if (last != null && last.getNodeType() == Node.TEXT_NODE)
              {
                insertContext.container = last;
                insertContext.offset = last.getNodeValue().length();
              }
              else
              {
                insertContext.container = blockElement;
                insertContext.offset = (last != null) ? XHTMLDomUtil.getNodeIndex(last) : 0;
              }
            }
            else if( ( container.getNodeType()== Node.TEXT_NODE && offset != XHTMLDomUtil.getPureText(container).length())
          || ( container.getNodeType() == Node.ELEMENT_NODE && offset != container.getChildNodes().getLength()) )
            {
              Node breakElement = container;
              if (breakElement.getNodeType() == Node.TEXT_NODE)
                breakElement = breakElement.getParentNode();
              if (this.isBlock(breakElement) || breakElement.getNodeName().equalsIgnoreCase("a"))
                breakElement = null;
              Element dummy = dom.createElement(XHTMLDomUtil.SPAN_TAG);
              if (container.getNodeType() == Node.TEXT_NODE)
                breakTextNode(container, offset, dummy);
              else
              {
                Node sibling = container.getChildNodes().item(offset);
                if (insertBefore)
                  sibling.getParentNode().insertBefore(dummy, sibling);
                else
                  XHTMLDomUtil.insertAfter(dummy, sibling);
              }
              if (breakElement != null)
                dummy = (Element) breakParent(breakElement, dummy);
              insertContext.container = dummy.getParentNode();
              
    	      // If previous sibling is a splitted empty span, remove it.
    	      Node preSibling = dummy.getPreviousSibling();
    	      if(preSibling != null && preSibling.getNodeType() == Node.ELEMENT_NODE && 
    	    		  preSibling.getNodeName().equalsIgnoreCase("span") && XHTMLDomUtil.getNodeLength(preSibling) == 0)
    	      {
    	    	  preSibling.getParentNode().removeChild(preSibling);
    	    	  insertBefore = true;
    	      }
              
              preSibling = (dummy.getPreviousSibling() != null) ? dummy.getPreviousSibling() : dummy;
              insertContext.offset = XHTMLDomUtil.getNodeIndex(preSibling);
              dummy.getParentNode().removeChild(dummy);
            }
          }
      }
    }
    if (insertContext == null){
		String msgs = "==The insertContext is null, index is:" + getIndex() ;
		LOG.warning(msgs);
		return;
    }
    
    boolean isEmpty = false;
    
    Node preSibling = insertContext.container, oldpreSibling;
    int nOffset = insertContext.offset;
    if (preSibling.getNodeType() == Node.ELEMENT_NODE)
    {
      Node temp = preSibling.getChildNodes().item(nOffset);
      if (temp == null)
      {
        isEmpty = true;
        temp = preSibling;
      }
      else if (temp.getNodeType() == Node.TEXT_NODE)
      {
        nOffset = temp.getNodeValue().length();
      }
      preSibling = temp;
    }
    
    for (int i = 0; i < cnts.size(); i++)
    {
      InsertTextData data = cnts.get(i);
      insertPos = data.getIp();
      Node node = null;
      if (data.getSubType().equals("t"))
      {
        node = dom.createTextNode(data.getContent());
        log(node);
      }
      else if (data.getSubType().equals("e"))
      {
        node = XHTMLDomUtil.parseString(tidy, data.getContent(), false);
        log(node);
      }
      
      if (node == null){
    	  continue;
      }
      
      
      if (isEmpty)
      {
        preSibling.appendChild(node);
        preSibling = node;
        if (preSibling.getNodeType() == Node.TEXT_NODE)
        {
          nOffset = preSibling.getNodeValue().length();
        }
        else
        	nOffset = 0;

        isEmpty = false;
        insertBefore = false;
        continue;
      }
      // #45600: [Firefox]Insert a link and then delete it char by char, and then undo, the link is just added to the first letter.
      // Should append to previous insertNode's last child, when i >0
      oldpreSibling = null;
      if (i > 0 && data.getIp()>=0 && node.getNodeType() == Node.TEXT_NODE && preSibling.getNodeType() == Node.ELEMENT_NODE
          && !preSibling.getNodeName().equalsIgnoreCase("img") && !preSibling.getNodeName().equalsIgnoreCase(XHTMLDomUtil.BR_TAG)
          && preSibling.getLastChild() != null)
      {
        oldpreSibling = preSibling;
        preSibling = preSibling.getLastChild();
        if (preSibling.getNodeType() == Node.TEXT_NODE)
          nOffset = preSibling.getNodeValue().length();
        else
          nOffset = 0;
      }
      
      //#7453
      if( insertPos == -1 )
      { //need insert text to the parent node when insertPos == -1;
        while( !preSibling.getParentNode().equals(targetElement) )
        {
          Node n = preSibling.getNextSibling();
          while(  ( n != null && n.getNodeName().equalsIgnoreCase("span")&& XHTMLDomUtil.getNodeLength(n) == 0 )
              || XHTMLDomUtil.isBlankTextNode(n ))
          { //remove empty span
             Node tmp = n.getNextSibling();
             n.getParentNode().removeChild(n);
             n = tmp;
          }
          if( n != null )
              break;
          preSibling = preSibling.getParentNode();
        }
      }
      
      if (node.getNodeType() == Node.TEXT_NODE && preSibling.getNodeType() == Node.TEXT_NODE)
      {
        // #36554 #36839: Insert blank as &nbsp; will introduce browser layout problem.
        // Convert n blank to (n-1)&nbsp; + blank
        // insert blank space
        String content = data.getContent();
        if (content.equals(" "))
        {
          String nodeValue = preSibling.getNodeValue();
          if (nOffset > 0 && nodeValue.substring(nOffset - 1, nOffset).equals(" "))
          {
            // Previous character is blank
            // content = "\u00a0";
            // Insert &nbsp; before blank
            // nOffset--;

            // Delete blank and insert a &nbsp;
            String newValue = nodeValue.substring(0, nOffset - 1) + "\u00a0" + nodeValue.substring(nOffset);
            preSibling.setNodeValue(newValue);
          }
          else if ((nOffset < nodeValue.length() - 1) && nodeValue.substring(nOffset, nOffset + 1).endsWith(" "))
          {
            // Next character is blank
            content = "\u00a0";
          }
        } else if (content.equals("\u00a0")) {
        	String nodeValue = preSibling.getNodeValue();
        	// Previous character is not blank
            if (nOffset > 0 && !nodeValue.substring(nOffset - 1, nOffset).equals(" ")) 
            {
            	content = " ";
            }
        }
        else if (!content.equals("\u00a0") && preSibling.getNodeValue().length() > 1) // Insert text is not blank or &nbsp;
        {
          // Convert previous or next &nbsp; to blank
          // Previous character is &nbsp;
          String nodeValue = preSibling.getNodeValue();
          if (nOffset > 0 && nodeValue.substring(nOffset - 1, nOffset).equals("\u00a0"))
          {
            // Delete &nbsp; and insert a blank
            String newValue = nodeValue.substring(0, nOffset - 1) + ' ' + nodeValue.substring(nOffset);
            preSibling.setNodeValue(newValue);
          }
          else if ((nOffset < nodeValue.length() - 1) && nodeValue.substring(nOffset, nOffset + 1).endsWith("\u00a0"))
          {
            // Next character is &nbsp;
            // Delete &nbsp; and insert a blank
            String newValue = nodeValue.substring(0, nOffset) + ' ' + nodeValue.substring(nOffset + 1);
            preSibling.setNodeValue(newValue);
          }
        }

        // this.insertData(preSibling, nOffset, content);
        // content was changed
        node = dom.createTextNode(content);
       
        if (insertBefore)
        {
          Node parent = preSibling.getParentNode();
          String parentName = parent.getLocalName();
          if(node.getNodeType() == Node.ELEMENT_NODE && parentName.equalsIgnoreCase("a") && parentName.equalsIgnoreCase(node.getLocalName()))
          {
            Node child = node.getFirstChild();
            while(child != null)
            {
              node.removeChild(child);
              parent.insertBefore(child, preSibling);
              child = node.getFirstChild();
            }
            
            node = preSibling.getPreviousSibling();
          }
          else
            preSibling.getParentNode().insertBefore(node, preSibling);
        }
        else
          this.breakTextNode(preSibling, nOffset, node);
        if (node.getNodeType() != Node.TEXT_NODE && node.getLocalName().equalsIgnoreCase("span"))
        {
          if (preSibling.getParentNode().getLocalName().equalsIgnoreCase("span"))
            node = (Element) breakParent(preSibling.getParentNode(), node);
        }
      }
      else
      {
        if (insertBefore)
        {
          Node parent = preSibling.getParentNode();
          String parentName = parent.getLocalName();
          if(node.getNodeType() == Node.ELEMENT_NODE && parentName.equalsIgnoreCase("a") && parentName.equalsIgnoreCase(node.getLocalName()))
          {
            Node child = node.getFirstChild();
            while(child != null)
            {
              node.removeChild(child);
              parent.insertBefore(child, preSibling);
              child = node.getFirstChild();
            }
            
            node = preSibling.getPreviousSibling();
          }
          else
            preSibling.getParentNode().insertBefore(node, preSibling);
        }
        else
        {
          // Break the first node
          if (i == 0 && preSibling.getNodeType() == Node.TEXT_NODE)
          {
            this.breakTextNode(preSibling, nOffset, node);
            if (node.getNodeType() != Node.TEXT_NODE &&node.getLocalName().equalsIgnoreCase("span"))
            {
              if (preSibling.getParentNode().getLocalName().equalsIgnoreCase("span"))
                node = (Element) breakParent(preSibling.getParentNode(), node);
            }
          }
		  else {
            String tagName = node.getLocalName();
            if (tagName.equalsIgnoreCase("ul") || tagName.equalsIgnoreCase("ol"))
            {
              while (!preSibling.getParentNode().equals(targetElement))
                preSibling = preSibling.getParentNode();
            }
        	  XHTMLDomUtil.insertAfter(node, preSibling);
        	  if(i != 0)
        	  {	  
        		  if (node.getNodeType() != Node.TEXT_NODE &&node.getLocalName().equalsIgnoreCase("span"))
                  {
                    if (preSibling.getParentNode().getLocalName().equalsIgnoreCase("span"))
                      {
                    	node = (Element) breakParent(preSibling.getParentNode(), node);
                    	Node nextSib = node.getNextSibling();
                    	if(nextSib != null && XHTMLDomUtil.getNodeLength(nextSib) == 0)
                    		nextSib.getParentNode().removeChild(nextSib);
                    	
                    	Node preSib = node.getPreviousSibling();
                    	if(preSib != null && XHTMLDomUtil.getNodeLength(preSib) == 0)
                    		preSib.getParentNode().removeChild(preSib);
                      }
                  }
        	  }
          }
        }
      }
      // #45600: [Firefox]Insert a link and then delete it char by char, and then undo, the link is just added to the first letter.
      // restore preSibling for next insert
      preSibling = node;
      if (oldpreSibling != null)
        preSibling = oldpreSibling;

      if (preSibling.getNodeType() == Node.TEXT_NODE)
        nOffset = preSibling.getNodeValue().length();
      else
        nOffset = 0;
      insertBefore = false;
    }
    targetElement.normalize();
  }

  // TODO, just for test,will be removed
  public static void log(Node node)
  {
    Tidy tidy = JTidyUtil.getTidy();
    log(tidy, node);
  }

  public void breakTextNode(Node textNode, int offset, Node element)
  {
    int len = XHTMLDomUtil.getNodeLength(textNode);
    if (offset == len)
    {
      XHTMLDomUtil.insertAfter(element, textNode);
    }
    else if (offset == 0)
    {
      textNode.getParentNode().insertBefore(element, textNode);
    }
    else
    {
      Node clone = textNode.cloneNode(true);
      String content = textNode.getNodeValue();
      textNode.setNodeValue(content.substring(0, offset));
      clone.setNodeValue(content.substring(offset));
      XHTMLDomUtil.insertAfter(element, textNode);
      XHTMLDomUtil.insertAfter(clone, element);
    }
  }

  public Node breakParent(Node node, int deepth)
  {
    Node dummy = node;
    Node ret = dummy;
    while (deepth != 0)
    {
      deepth--;
      Node middle = dummy.getParentNode();
      Node left = middle.cloneNode(true);
      Node right = middle.cloneNode(true);
      
      // In order to avoid duplicate id after break span into two, remove attribute "id" of right one.
      if (right.getNodeType() == Element.ELEMENT_NODE
          && right.getLocalName().equalsIgnoreCase("span")
          && XHTMLDomUtil.hasAttribute((Element)right, "id"))
      {
        ((Element)right).removeAttribute("id");
      }
      
	  int idx = XHTMLDomUtil.getNodeIndex(dummy);
	  
      Node child = left.getLastChild();
      child = left.getChildNodes().item(idx);
      Node nextSibling = null;
      while(child != null)
      {
        nextSibling = child.getNextSibling();
        left.removeChild(child);
        
        child = nextSibling;
      }
      // children = middle.getChildNodes();
      // for (int i = children.getLength() - 1; i >= 0; i--) {
      // if (i > idx)
      // middle.removeChild(children.item(i));
      // }
      // for (int i = children.getLength() - 1; i >= 0; i--) {
      // if (i < idx)
      // middle.removeChild(children.item(i));
      // }

      middle.removeChild(dummy);
      Node tempP = middle.getParentNode();
      tempP.insertBefore(dummy, middle);
      tempP.removeChild(middle);
      middle = dummy;

      child = right.getFirstChild();
      int offset = 0;
      while(child != null && offset <= idx)
      {
        nextSibling = child.getNextSibling();
        right.removeChild(child);
        child = nextSibling;
        offset++;
      }

      if (left.getChildNodes().getLength() != 0)
        middle.getParentNode().insertBefore(left, middle);
      if (right.getChildNodes().getLength() != 0)
        XHTMLDomUtil.insertAfter(right, middle);
      ret = middle;
      dummy = middle;
    }
    return ret;
  }

  public Node breakParent(Node parentNode, Node dummy)
  {
    Node ret = null;
    int deepth = 1;
    Node temp = dummy;
    while (!temp.getParentNode().equals(parentNode))
    {
      deepth++;
      temp = temp.getParentNode();
    }
    ret = breakParent(dummy, deepth);
    return ret;
  }

  public void insertData(Node node, int offset, String content)
  {
    String value = node.getNodeValue();
    String real = value.substring(0, offset) + content + value.substring(offset, value.length());
    node.setNodeValue(real);
  }

  public Node getBlock(Node node)
  {
    Node temp = node;
    while (!this.isBlock(temp))
      temp = temp.getParentNode();
    return temp;
  }

  // Same logical with MSGUTIL.js
  public boolean isBlock(Node node)
  {
    String nodeName;

    if (node.getNodeType() == Node.ELEMENT_NODE)
      nodeName = node.getNodeName();
    else if (node.getNodeType() == Node.TEXT_NODE)
      return false;
    else
      return false;

    boolean ret = isContain(block, nodeName) || isContain(blockLimit, nodeName) || isContain(listItem, nodeName)
        || isContain(list, nodeName) || isContain(tableContent, nodeName);
    return ret;
  }

  public boolean isContain(String[] ids, String name)
  {
    boolean ret = false;
    for (int i = 0; i < ids.length; i++)
    {
      if (ids[i].equals(name))
      {
        ret = true;
        break;
      }
    }
    return ret;
  }

  public InsertContext getInsertPos(Node ascendant, int offset)
  {
    InsertContext ret = null;
    if (ascendant == null)
    {
      return ret;
    }
    if (ascendant.getNodeType() == Node.TEXT_NODE)
      return new InsertContext(ascendant, offset, (offset == 0));
    else
    {
      NodeList children = ascendant.getChildNodes();
      int length = children.getLength();
      // for (int i = 0; i < length; i++)
      // {
      // log(children.item(i));
      // }
      if (length == 0)
      {
        if (isBlock(ascendant))
          return new InsertContext(ascendant, 0, false);
        else
          return new InsertContext(ascendant.getParentNode(), XHTMLDomUtil.getNodeIndex(ascendant), (offset == 0));
      }
      Node lastNode = null;
      for (int i = 0; i < length; i++)
      {
        Node child = children.item(i);
        int len = XHTMLDomUtil.getNodeLength(child);
        if(len > 0)  lastNode = child;
        if (len >= offset)
        {
          // <li>^<ul><li>abc</li></ul>
          // For this case: insert text before abc
          if (offset == 0 && ascendant.getNodeName().equalsIgnoreCase("li"))
            return new InsertContext(ascendant, 0, true);
          else
            return getInsertPos(child, offset);
        }
        offset -= len;
      }
      if (offset>0 && offset< allowLostChars && isBlock(ascendant)){
    	  //there may be some lost chars on server side, we should insert "offset" of " "\
    	  String content = "";
    	  if(fragment != null && fragment.length() >= offset){
    		  int fragLen = fragment.length();
    		  content = fragment.substring(fragLen - offset, fragLen);
    		  if(lastNode != null && fragLen > offset){
    			  Node lastChild = null;
    			  if(lastNode.getNodeType() == Node.TEXT_NODE)
    				  lastChild = lastNode;
    			  else if(lastNode.getNodeName().equalsIgnoreCase(XHTMLDomUtil.SPAN_TAG) && lastNode.getChildNodes().getLength() == 1)
    				  lastChild = lastNode.getFirstChild();
    			  if(lastChild != null && lastChild.getNodeType() == Node.TEXT_NODE){
	    			  String otherCnt = fragment.substring(0, fragLen - offset);
	    			  String childText = lastChild.getNodeValue();
	    			  if(otherCnt.length() > 0 && childText.length() >= otherCnt.length() )
	    			  {
	    				  String postCnt = childText.substring(childText.length() - otherCnt.length(), childText.length());
	    				  if(!otherCnt.equalsIgnoreCase(postCnt))
	    				  {
	    					  String newCnt = childText.substring(0, childText.length() - otherCnt.length());
	    					  newCnt += otherCnt;
	    					  lastChild.setNodeValue(newCnt);
	    				  }
	    			  }
    			  }
    		  }
    	  }
    	  else{
    		  if(fragment != null && fragment.length() < offset)
    		  {
    			  content = fragment;
    			  offset = offset - fragment.length();
    		  }
    		  
    		  char[] chars = new char [offset];
        	  //n-1 &nbsp; + 1 ' ', at least 1 &nbsp;
        	  for (int i=0;i<offset;i++){
        		  chars[i]='\u00a0';
        	  }
        	  if (offset>1){
        		  chars[offset-1]=' ';
        	  }
        	  
        	  String spaceCnt = new String(chars);
        	  content = spaceCnt + content;
    	  }
    	  
    	  Node node = ascendant.getOwnerDocument().createTextNode(content);
    	  Node last = ascendant.getLastChild();
    	  if (last !=null &&  XHTMLDomUtil.isBogus(last)){
    		  ascendant.insertBefore(node, last);
    	  }else{
    		  ascendant.appendChild(node);
    	  }
    	  //log here
    	  LOG.warning("==Apply Insert text error, appended some &nbsp;");
    	  return new InsertContext(node, offset, false);
      	}
    }

    return ret;
  }

  class InsertContext
  {
    public Node container = null;

    public int offset;

    public boolean insertBefore;

    public InsertContext(Node container, int offset, boolean insertBefore)
    {
      this.container = container;
      this.offset = offset;
      this.insertBefore = insertBefore;
    }
  }

  public int getIndex()
  {
    return index;
  }

  public void setIndex(int index)
  {
    this.index = index;
  }

  public int getLength()
  {
    return length;
  }

  public void setLength(int length)
  {
    this.length = length;
  }

  @Override
  public JSONObject write()
  {
    try
    {
      JSONObject update = new JSONObject();

      update.put(TYPE, getType());
      update.put(TARGET, getTarget());
      update.put(LENGTH, getLength());
      update.put(INDEX, getIndex());
      if(fragment != null && fragment.length() > 0)
    	  update.put("frag", fragment);
      
      writeAppend(update);
      JSONArray contents = new JSONArray();
      for (int i = 0; i < cnts.size(); i++)
      {
        JSONObject content = cnts.get(i).write();
        contents.add(content);
      }
      update.put(CONTENTS, contents);

      return update;
    }
    catch (Exception e)
    {
      // TODO Auto-generated catch block
      e.printStackTrace();
      return null;
    }
  }
}

class InsertTextData
{

  public final static String INSERT_POSITION = "ip";

  public final static String ELEMENT = "e";

  public final static String TEXT = "t";

  private String content;

  private String subType;// "e":element,"t":text

  private int ip;

  public void read(JSONObject ob)
  {
    setIp(Integer.parseInt(ob.get(INSERT_POSITION).toString()));
    if (ob.containsKey(ELEMENT))
    {
      setSubType("e");
      setContent(ob.get(ELEMENT).toString());
    }
    if (ob.containsKey(TEXT))
    {
      setSubType("t");
      setContent(ob.get(TEXT).toString());
    }
  }

  public JSONObject write()
  {
    JSONObject ob = new JSONObject();
    ob.put(INSERT_POSITION, getIp());
    if (getSubType().equalsIgnoreCase(ELEMENT))
    {
      ob.put(ELEMENT, getContent());
    }
    else
    {
      ob.put(TEXT, getContent());
    }
    return ob;
  }

  public String getContent()
  {
    return content;
  }

  public void setContent(String content)
  {
    this.content = content;
  }

  public String getSubType()
  {
    return subType;
  }

  public void setSubType(String subType)
  {
    this.subType = subType;
  }

  public int getIp()
  {
    return ip;
  }

  public void setIp(int ip)
  {
    this.ip = ip;
  }

}
