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

import com.ibm.docs.common.security.ACFUtil;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

/**
 * @author qins@cn.ibm.com
 * 
 */
// wangxum@cn.ibm.com
// to backup old message
public class OldOperation extends Operation
{

  public static final String CMD_INSERTTEXT = "insertText";

  public static final String CMD_DELETETEXT = "deleteText";

  public static final String CMD_INSERTNODE = "insertNode";

  public static final String CMD_DELETENODE = "deleteNode";

  public static final String CMD_SPLITNODE = "splitNode";

  public static final String CMD_JOINNODE = "joinNode";

  public static final String CMD_REPLACENODE = "replaceNode";

  public static final String CMD_TASK = "Task";

  public static final String CMD_TABLE = "Table";

  public static final String CMD_TEXT = "Text";

  public static final String CMD_ATTRIBUTE = "Attribute_";

  public static final String CMD_RESETCONTENT = "resetContent";

  private static final Logger LOG = Logger.getLogger(OldOperation.class.getName());

  private String elementId;

  private String parentId;

  private String refId;

  private List<DeltaData> deltaList;// 1-2 delta in list.

  final static String COMMANDTYPE = "commandType";

  final static String DELTADATA = "deltaData";

  final static String ELEMENTID = "elementId";

  final static String PARENTID = "parentId";

  final static String REFRENCEID = "refId";

  final static String STRING = "string";

  final static String LENGTH = "length";

  final static String INDEX = "index";

  public void setElementId(String element)
  {
    elementId = element;
  }

  public void setParentId(String parent)
  {
    parentId = parent;
  }

  public void setRefId(String ref)
  {
    refId = ref;
  }

  public String getElementId()
  {
    return elementId;
  }

  public String getParentId()
  {
    return parentId;
  }

  public String getRefId()
  {
    return refId;
  }

  public List<DeltaData> getDeltaList()
  {
    return deltaList;
  }

  public void setDeltaList(List<DeltaData> deltaList)
  {
    this.deltaList = deltaList;
  }

  public JSONObject write()
  {
    try
    {
      JSONObject update = new JSONObject();
      OldOperation op = this;
      update.put(ELEMENTID, op.getElementId());
      update.put(PARENTID, op.getParentId());
      update.put(REFRENCEID, op.getRefId());

      JSONArray deltaArray = new JSONArray();
      update.put(DELTADATA, deltaArray);

      for (int index = 0; index < op.getDeltaList().size(); index++)
      {
        JSONObject deltaData = new JSONObject();
        deltaArray.add(deltaData);
        DeltaData delta = op.getDeltaList().get(index);
        deltaData.put(COMMANDTYPE, delta.commandType);
        deltaData.put(STRING, delta.string);
        deltaData.put(INDEX, delta.index);
        deltaData.put(LENGTH, delta.length);
      }

      return update;
    }
    catch (Exception e)
    {
      // TODO Auto-generated catch block
      e.printStackTrace();
      return null;
    }
  }

  public boolean read(JSONObject update)
  {
    try
    {
      OldOperation op = this;
      Object parentId = update.get(PARENTID);
      Object referenceId = update.get(REFRENCEID);
      op.setElementId(update.get(ELEMENTID).toString());
      op.setParentId((parentId != null) ? parentId.toString() : null);
      op.setRefId((referenceId != null) ? referenceId.toString() : null);

      JSONArray deltaArray = (JSONArray) update.get(DELTADATA);
      List<DeltaData> deltaList = new ArrayList<DeltaData>();

      for (int index = 0; index < deltaArray.size(); index++)
      {
        JSONObject deltaData = (JSONObject) deltaArray.get(index);
        DeltaData delta = new DeltaData();
        delta.commandType = deltaData.get(COMMANDTYPE).toString();
        delta.string = deltaData.get(STRING).toString();
        delta.index = Integer.parseInt(deltaData.get(INDEX).toString());
        delta.length = Integer.parseInt(deltaData.get(LENGTH).toString());
        deltaList.add(delta);
      }
      op.setDeltaList(deltaList);
      return true;
    }
    catch (Exception e)
    {
      return false;
    }
  }

  public void apply(Tidy tidy, Document dom) throws Exception
  {
    String content = null;
    Element element = null;

    Element e = dom.getDocumentElement();
    element = XHTMLDomUtil.getElementbyId(e, getElementId());

    // getinnerhtml()
    if (element != null)
    {
      content = XHTMLDomUtil.outputElement(tidy, element, true);
      if (LOG.isLoggable(Level.FINER))
      {
        LOG.finer("Existing element: " + getElementId() + "; innerHTML: " + content);
      }
    }

    boolean isNodeOperation = true;

    for (int i = 0; i < getDeltaList().size(); i++)
    {

      DeltaData delta = getDeltaList().get(i);
      String commandType = delta.commandType;

      if (commandType.equalsIgnoreCase(CMD_DELETENODE))
      {
        if (element != null)
          element.getParentNode().removeChild(element);
      }
      else if (commandType.equalsIgnoreCase(CMD_INSERTNODE))
      {
        Element new_element = null;
        String string = delta.string;

        // ACF
        if (ACFUtil.suspiciousHtml(string))
        {
          // LOG.warning("malicious html fragment detected: " + msg.toString());
          throw new Exception("malicious html fragment detected");
        }

        new_element = XHTMLDomUtil.parseString(tidy, string, false);
        Element parent_element = null;
        Element next_element = null;

        if (delta.index == 1)
        {
          NodeList temp = new_element.getElementsByTagName("tr");
          if (temp.getLength() > 0)
          {
            new_element = (Element) temp.item(0);
          }
          else
          {
            new_element = (Element) new_element.getElementsByTagName("thead").item(0);
          }
        }
        else if (delta.index == 2)
        {
          NodeList temp = new_element.getElementsByTagName("td");
          if (temp.getLength() > 0)
          {
            new_element = (Element) temp.item(0);
          }
          else
          {
            new_element = (Element) new_element.getElementsByTagName("th").item(0);
          }
        }
        else if (delta.index == 3)
        {
          NodeList temp = new_element.getElementsByTagName("caption");
          if (temp.getLength() > 0)
          {
            new_element = (Element) temp.item(0);
          }
        }

        parent_element = XHTMLDomUtil.getElementbyId(e, getParentId());
        if (parent_element == null)
          parent_element = (Element) dom.getElementsByTagName("body").item(0);
        next_element = XHTMLDomUtil.getElementbyId(e, getRefId());

        if (next_element != null)
        {
          next_element.getParentNode().insertBefore(new_element, next_element);
        }
        else if (parent_element != null)
        {
          parent_element.appendChild(new_element);
        }
        else
          throw new Exception("elements is null"); // should not happen

      }
      else if (commandType.equalsIgnoreCase(CMD_DELETETEXT))
      {
        isNodeOperation = false;
        StringBuffer strBuf = new StringBuffer(content);

        int index = delta.index;
        int length = delta.length;
        if (index < content.length())
        {
          if (index + length > content.length())
            strBuf.delete(index, content.length() - index);
          else
            strBuf.delete(index, index + length);

          content = strBuf.toString();

          if (LOG.isLoggable(Level.FINER))
          {
            LOG.finer("COMMAND: " + commandType + "; INDEX: " + delta.index + "; STRING: " + delta.string + "; LENGTH: " + delta.length
                + "; RESULT: " + content);
          }

        }
        else if (LOG.isLoggable(Level.FINER))
        {
          LOG.finer("INVALID COMMAND: " + commandType + "; INDEX: " + delta.index + "; STRING: " + delta.string + "; LENGTH: "
              + delta.length + "; RESULT: " + content);
        }
      }
      else if (commandType.equalsIgnoreCase(CMD_INSERTTEXT))
      {
        isNodeOperation = false;
        StringBuffer strBuf = new StringBuffer(content);

        String string = delta.string;
        int index = delta.index;
        if (index > strBuf.length())
          index = strBuf.length();
        strBuf.insert(index, string);
        // parse string to child nodes
        content = strBuf.toString();

        if (LOG.isLoggable(Level.FINER))
        {
          LOG.finer("COMMAND: " + commandType + "; INDEX: " + delta.index + "; STRING: " + delta.string + "; LENGTH: " + delta.length
              + "; RESULT: " + content);
        }
      }
      else if (commandType.indexOf(CMD_ATTRIBUTE) == 0)
      {
        isNodeOperation = true;
        if (element != null)
        {
          String attrName = commandType.substring(CMD_ATTRIBUTE.length());
          // ACF
          if (ACFUtil.suspiciousAttribute(attrName, delta.string))
            throw new Exception("malicious html attribute detected");

          if (delta.string.equals("null"))
          {
            element.removeAttribute(attrName);
          }
          else
          {
            element.setAttribute(attrName, delta.string);
          }
        }
      }
    }

    if (!isNodeOperation)
    {
      // ACF
      if (ACFUtil.suspiciousHtml(content))
      {
        // LOG.warning("malicious html fragment detected: " + msg.toString());
        return;
      }

      // parse string to child nodes
      Element newElement = XHTMLDomUtil.parseString(tidy, content, true);
      if (newElement == null)
        return;
      NodeList newNodeList = newElement.getChildNodes();

      Node child = element.getFirstChild();
      while(child != null)
      {
    	  element.removeChild(child);
    	  child = element.getFirstChild();
      }

      child = newElement.getFirstChild();
      Node next = null;
      while(child != null)
      {
    	  next = child.getNextSibling();
    	  element.appendChild(child);
    	  child = next;
      }
    }
  }

}
