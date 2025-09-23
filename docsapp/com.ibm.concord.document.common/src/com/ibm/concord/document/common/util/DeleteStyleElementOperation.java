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

import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

public class DeleteStyleElementOperation extends Operation
{
  private int index;

  private boolean isBlock;
  
  private int length;

  private List<String> elementList;

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
      setLength(Integer.parseInt(update.get(LENGTH).toString()));
      setBlock(Boolean.valueOf(update.get(IS_BLOCK).toString()));
      setList((JSONArray) (update.get(ELEMENT_LIST)));

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
      if (target == null || getLength() == 0)
      {
        return;
      }
    }
    Node ref = XHTMLDomUtil.getBlock(target, this.index);
    if (ref != null)
      target.removeChild(ref);
    else
    {
      String msgs = "==Delete element error, index is:" + getIndex();
      LOG.warning(msgs);
    }
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
      update.put(LENGTH, getLength());

      JSONArray list = new JSONArray();
      for (int index = 0; index < elementList.size(); index++)
      {
        list.add(elementList.get(index));
      }
      update.put(ELEMENT_LIST, list);

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

  public void setBlock(Boolean isBlock)
  {
    this.isBlock = isBlock;
  }

  public Boolean getBlock()
  {
    return this.isBlock;
  }

  public int getLength()
  {
    return length;
  }

  public void setLength(int length)
  {
    this.length = length;
  }

  boolean isRemove()
  {
    return getType().equals(Operation.REMOVE_BLOCK_STYLE);
  }

  public void setList(JSONArray list)
  {
    this.elementList = new ArrayList<String>();
    for (int index = 0; index < list.size(); index++)
    {
      String eleId = (String) list.get(index);
      this.elementList.add(eleId);
    }
  }

  public List<String> getList()
  {
    return this.elementList;
  }

  // public void apply(Tidy tidy, Document dom) throws Exception
  // {
  // AddContentToStyleCSS("span.T10 {color:green;};");
  // Element e = dom.getDocumentElement();
  // Element styleNode = XHTMLDomUtil.getStyleCSSNode(e);
  // if (styleNode == null)
  // {
  // LOG.info("==Update style element style error, style node is not found. ");
  // return;
  // }
  // else
  // {
  // styleNode.setAttribute("href", "style.css?id=" + System.currentTimeMillis());
  // }
  //
  // }
  //
  // private static void AddContentToStyleCSS(String styleContent) throws UnsupportedEncodingException
  // {
  // // flush new content
  // try
  // {
  // File tempFile = new File("C:/workspace/Work/ConcordData/draft/ibm/draft/357/720/testPaste.odt/media/style.css");
  // if (!tempFile.exists())
  // tempFile.createNewFile();
  // FileOutputStream fos = new FileOutputStream(tempFile);
  // styleContent += "\r\n";
  // byte[] buf = styleContent.getBytes("UTF-8");
  // fos.write(buf);
  // fos.close();
  // }
  // catch (IOException e)
  // {
  // LOG.log(Level.WARNING, "Error writing file, ", e);
  // }
  // }
}
