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
import java.util.logging.Logger;

import lotus.org.w3c.tidy.Tidy;

import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.Text;

import com.ibm.json.java.JSONObject;

public class InsertStyleElementOperation extends Operation
{
  private int index;

  private boolean isBlock;

  private String content;

  private static final int STYLE_NODES_MAX_SIZE = 25;

  private static final Logger LOG = Logger.getLogger(InsertStyleElementOperation.class.getName());

  @Override
  public boolean read(JSONObject update)
  {
    try
    {
      setType(update.get(TYPE).toString());

      if (update.get(TARGET) != null)
        setTarget(update.get(TARGET).toString());

      setIndex(Integer.parseInt(update.get(INDEX).toString()));
      setBlock(Boolean.valueOf(update.get(IS_BLOCK).toString()));
      setContent(update.get(CONTENT).toString());

      return true;
    }
    catch (Exception e)
    {
      return false;
    }
  }

  @Override
  public void apply(Tidy tidy, Document dom) throws Exception
  {
    Element e = dom.getDocumentElement();
    Element target = null;

    if (getTarget() != null)
      target = XHTMLDomUtil.getElementbyId(e, getTarget());

    if (target == null)
    {
      target = XHTMLDomUtil.getHead(e);
      if (target == null)
      {
        LOG.info("==Apply Insert style message error, target is not found: " + getTarget());
        return;
      }
    }

    mergeStyleElements(target, dom);

    Node element = XHTMLDomUtil.parseString(tidy, this.content, false);
    Node ref;
    ref = XHTMLDomUtil.getBlock(target, this.index);
    if (ref != null)
      target.insertBefore(element, ref);
    else
      target.appendChild(element);

    Node nxt = element.getNextSibling();
    if (nxt != null && nxt.getNodeName().equals("title") && !nxt.hasChildNodes())
      target.removeChild(nxt);
  }

  @Override
  public JSONObject write()
  {
    try
    {
      JSONObject update = new JSONObject();

      update.put(TYPE, getType());
      update.put(TARGET, getTarget());
      update.put(INDEX, getIndex());
      update.put(IS_BLOCK, getBlock());
      update.put(CONTENT, getContent());

      return update;
    }
    catch (Exception e)
    {
      // TODO Auto-generated catch block
      e.printStackTrace();
      return null;
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

  public void setContent(String content)
  {
    this.content = content;
  }

  public String getContent()
  {
    return this.content;
  }

  public void setBlock(Boolean isBlock)
  {
    this.isBlock = isBlock;
  }

  public Boolean getBlock()
  {
    return this.isBlock;
  }

  boolean isRemove()
  {
    return getType().equals(Operation.DELETE_STYLE_ELEMENT);
  }

  private void mergeStyleElements(Element target, Document dom)
  {
    List<Node> allPasted = getPastedStyleNodes(target);
    if (allPasted.size() > STYLE_NODES_MAX_SIZE)
    {
      StringBuffer sBuffer = new StringBuffer();
      for (int i = 0; i < allPasted.size(); i++)
      {
        Node child = allPasted.get(i);
        sBuffer.append(XHTMLDomUtil.GetTextNode(child));
        target.removeChild(child);
      }

      Element mergedTo = getPastedMergedNode(target, dom);
      Text newText = dom.createTextNode(sBuffer.toString());
      mergedTo.appendChild(newText);
    }
  }

  private Element getPastedMergedNode(Element target, Document dom)
  {
    Element mergedTo = XHTMLDomUtil.getElementbyAttr(target, "s_type", "mergedPastedStyle");
    if (mergedTo == null)
    {
      mergedTo = dom.createElement("style");
      target.appendChild(mergedTo);
      mergedTo.setAttribute("type", "text/css");
      mergedTo.setAttribute("s_type", "mergedPastedStyle");
      mergedTo.setAttribute("id", DOMIdGenerator.generate());
    }

    return mergedTo;
  }

  private List<Node> getPastedStyleNodes(Element target)
  {
    List<Node> result = new ArrayList<Node>();

    List<Node> allStyles = XHTMLDomUtil.getElements(target, "style", null);
    for (int i = 0; i < allStyles.size(); i++)
    {
      Element style = (Element) allStyles.get(i);
      String styleType = style.getAttribute("s_type");
      if (styleType != null && styleType.equalsIgnoreCase("pastedStyle"))
        result.add(style);
    }

    return result;
  }

}
