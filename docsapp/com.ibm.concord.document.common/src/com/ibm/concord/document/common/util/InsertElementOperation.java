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
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

import lotus.org.w3c.tidy.Tidy;

import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;

import com.ibm.concord.document.common.pres.Model;
import com.ibm.docs.common.security.ACFUtil;
import com.ibm.json.java.JSONObject;

/**
 * @author sfeiguo@cn.ibm.com
 * 
 */
public class InsertElementOperation extends Operation {
	private int index;

	private boolean isBlock;

	private String content;
	
	/* Presentation properties */
	private JSONObject presObj;
	
	private boolean  presIsNodeASlide;

	private boolean  presIsNodeASlideWrapper;
	
	private boolean  presIsNodeADrawFrame;
	
	private boolean  presIsNodeATask;
	
	private String   presNodeId;
	
	private String   parentId;
	
	private String   presSlideId;
	
	private String   presContentBoxId;
	
	private boolean  presTextTyping;
	
	private String  presIsListCssStyle;
	  
	private static final Logger LOG = Logger.getLogger(InsertElementOperation.class.getName());
	
	private void fixBrPosition(Element element)
	{
	  if (element != null)
      {
        List<Element> brs = XHTMLDomUtil.getElementsbyClass( (Element) element, "hideInIE");
        for (int i = 0; i < brs.size(); i++)
        {
          Element br = brs.get(i);
          Element parent = (Element) br.getParentNode();
          Node last = parent.getLastChild();
          while ( XHTMLDomUtil.isBlockListItem(last))
            last = last.getPreviousSibling();
          if (last != br)
          {
            parent.removeChild(br);
            if (!last.getNodeName().equalsIgnoreCase("br"))
            {
              XHTMLDomUtil.insertAfter(br, last);
            }
          } else {
            Node prev = last.getPreviousSibling();
            while ( prev!= null && XHTMLDomUtil.isBlockListItem(prev))
              prev = prev.getPreviousSibling();
            parent.removeChild(br);
            if (prev != null)
            {
              XHTMLDomUtil.insertAfter(br, prev);
            } else {
              parent.insertBefore(br, parent.getFirstChild());
            }
          }
        }
      }
	}

	@Override
  public boolean read(JSONObject update)
  {
    try
    {
      setType(update.get(TYPE).toString());
      setTarget(update.get(TARGET).toString());
      setIndex(Integer.parseInt(update.get(INDEX).toString()));
      setBlock(Boolean.valueOf(update.get(IS_BLOCK).toString()));
      setContent(update.get(CONTENT).toString());
	  /* presentation specific properties */
      if (update.containsKey(PRES_OBJ)) setPresObj((JSONObject) update.get(PRES_OBJ));
      if (update.containsKey(PRES_IS_NODE_A_SLIDE)) setPresIsNodeASlide(Boolean.valueOf(update.get(PRES_IS_NODE_A_SLIDE).toString()));
      if (update.containsKey(PRES_IS_NODE_A_SLIDE_WRAPPER)) setPresIsNodeASlideWrapper(Boolean.valueOf(update.get(PRES_IS_NODE_A_SLIDE_WRAPPER).toString()));
      if (update.containsKey(PRES_IS_NODE_A_DRAW_FRAME)) setPresIsNodeADrawFrame(Boolean.valueOf(update.get(PRES_IS_NODE_A_DRAW_FRAME).toString()));
      if (update.containsKey(PRES_IS_NODE_A_TASK)) setPresIsNodeATask(Boolean.valueOf(update.get(PRES_IS_NODE_A_TASK).toString()));
      if (update.containsKey(PRES_NODE_ID)) setPresNodeId(update.get(PRES_NODE_ID).toString());
      if (update.containsKey(PARENT_ID)) setParentId(update.get(PARENT_ID).toString());
      if (update.containsKey(PRES_SLIDE_ID)) setPresSlideId(update.get(PRES_SLIDE_ID).toString());
      if (update.containsKey(PRES_CONTENT_BOX_ID)) setPresContentBoxId(update.get(PRES_CONTENT_BOX_ID).toString());
      if (update.containsKey(PRES_TEXT_TYPING)) setPresTextTyping(Boolean.valueOf(update.get(PRES_TEXT_TYPING).toString()));
      if (update.containsKey(PRES_IS_CSS_LIST_BEFORE)) setPresIsListCssStyle(update.get(PRES_IS_CSS_LIST_BEFORE).toString());
      return true;
    }
    catch (Exception e)
    {
      return false;
    }
  }
	
	public JSONObject getPresObj() {
		return presObj;
	}

	public void setPresObj(JSONObject presObj) {
		this.presObj = presObj;
	}
	
	public boolean isPresObj()
	{
		return presObj != null;
	}

	public String getPresIsListCssStyle() {
		return this.presIsListCssStyle;
	}
	  
	public void setPresIsListCssStyle(String presIsListCssStyle) {
		this.presIsListCssStyle = presIsListCssStyle;
   }
	
	private void updateListBeforeStyles(Document dom, List<JSONObject> styles)
	{
	    List<String> css = new ArrayList<String>();
	    for (JSONObject styleMap : styles)
	    {
	      Iterator it = styleMap.entrySet().iterator();
	      while (it.hasNext())
	      {
	        Map.Entry pairs = (Map.Entry) it.next();
	        String id = pairs.getKey().toString();
	        String value = pairs.getValue().toString();
	        css.add("IL_CS_" + id + ":before=" + value);
	      }
	    }
	    DeleteElementOperation.applyListBeforeStyles(dom, css);
	}
	
	@Override
	public void apply(Tidy tidy, Document dom) throws Exception {
		Element e = dom.getDocumentElement();
		if (this.presIsListCssStyle!=null){
			//IL_CS_1379785510029:before= font-size: 3.66667em; font-style: normal;
		  DeleteElementOperation.applyListBeforeStyles(dom, this.presIsListCssStyle);
		}
		Element target = XHTMLDomUtil.getElementbyId(e, getTarget());
	    if (target == null){
	    	LOG.info("==Apply Insert element message error, target is not found: " + getTarget());
	    	 return;
	    }
	    
	    Node element  = null;
	    if(isPresObj())
	    {
	        /* tmp rollback in MainStream to verify fix 
	         * in 54763: The current logical of Heartbeat & Reconnection maybe cause some messages will be applied many times.
	    	Element oldnode = XHTMLDomUtil.getElementbyId(target, this.presNodeId);
	        if(oldnode != null) {
	          LOG.info("==Apply Insert element message error, the insert element with id : " + this.presNodeId + " already exist,the message is duplication one.");
	          return;
	        }*/
	    	String type = presObj.get("type").toString();
	    	Model model = null;
	    	if(type.equals("element"))
	    		model = com.ibm.concord.document.common.pres.Element.fromJson(presObj);
	    	if(type.equals("slide"))
	    		model = com.ibm.concord.document.common.pres.Slide.fromJson(presObj);
	        if (model != null)
	        {
	          String html = model.getHTML();
	          element = XHTMLDomUtil.parseString(tidy, html, false);
	        }
	    }
	    else
	    {
	    	element = XHTMLDomUtil.parseString(tidy, this.content, false);
	    }
		Node ref;
		if ((this.isBlock || isPresObj()) && element != null) {
			if (this.index > 0) {
				ref = XHTMLDomUtil.getBlock(target,this.index-1);
				if(ref == null)
				{
					int childCnt = target.getChildNodes().getLength();
					String msgs = "The ref node is null, child count is: " + childCnt
						+ " index is:" + this.index;
					LOG.severe("==Apply Insert element message error: " + msgs);
					//NullPointerException ex = new NullPointerException(msgs);
					//throw ex;
				  target.appendChild(element);
				}
				else
				  XHTMLDomUtil.insertAfter(element, ref);
			} 
			else
			{			
			    ref = XHTMLDomUtil.getBlock(target,this.index);
				if(ref != null)
					target.insertBefore(element, ref);
				else
					target.appendChild(element);
			}
			fixBrPosition(target);
			
		} else {
			/*********************************************************************************
			 * The unblock situation is covered by Text insert.This section will
			 * be remove
			 ********************************************************************************* 
			 * HashMap<String,Object> parent =
			 * transOffsetAbsToRel(tidy,target,getIndex()); Node
			 * container=(Node) parent.get("container"); int
			 * offset=Integer.parseInt(parent.get("offset").toString());
			 * if(container.getNodeType()==Node.ELEMENT_NODE) {
			 * ref=container.getChildNodes().item(offset-1);
			 * container.insertBefore(element,ref); } else
			 * if(container.getNodeType()==Node.TEXT_NODE) { int
			 * len=container.getNodeValue().length(); if(offset!=0&&offset!=len)
			 * { //container=split(container,offset);
			 * container=XHTMLDomUtil.split(container,offset);
			 * container.getParentNode().insertBefore(element,container); } else
			 * if(offset==0)
			 * container.getParentNode().insertBefore(element,container); else
			 * container .getParentNode().insertBefore(element.getNextSibling(),
			 * container ); }
			 */
		}
	}

  @Override
  public JSONObject write()
  {
    try {
      JSONObject update = new JSONObject();

      update.put(TYPE,getType());
      update.put(TARGET,getTarget());
      update.put(INDEX,getIndex());
      update.put(IS_BLOCK,getBlock());
      update.put(CONTENT, getContent());
      //presentation specific properties
      if (this.isPresObj()) update.put(PRES_OBJ, getPresObj());
      if (this.presIsNodeASlide) update.put(PRES_IS_NODE_A_SLIDE,getPresIsNodeASlide());
      if (this.presIsNodeASlideWrapper) update.put(PRES_IS_NODE_A_SLIDE_WRAPPER, getPresIsNodeASlideWrapper());
      if (this.presIsNodeADrawFrame) update.put(PRES_IS_NODE_A_DRAW_FRAME, getPresIsNodeADrawFrame());
      if (this.presIsNodeATask) update.put(PRES_IS_NODE_A_TASK, getPresIsNodeATask());
      if (this.presNodeId!= null) update.put(PRES_NODE_ID, getPresNodeId());
      if (this.parentId!= null) update.put(PARENT_ID, getParentId());
      if (this.presSlideId!= null) update.put(PRES_SLIDE_ID, getPresSlideId());
      if (this.presContentBoxId!= null) update.put(PRES_CONTENT_BOX_ID, getPresContentBoxId());
      if (this.presTextTyping) update.put(PRES_TEXT_TYPING, getPresTextTyping());
      if (this.presIsListCssStyle!=null) update.put(PRES_IS_CSS_LIST_BEFORE,getPresIsListCssStyle());

      return update;
    } catch (Exception e) {
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
    StringBuilder sb = new StringBuilder();
    boolean processed = ACFUtil.process(content, sb);    
    if(processed) {
      LOG.warning("==found suspicious content: " + content);
    }
    this.content = sb.toString();
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
  
  /* Presentation specific properties */
	
	public boolean getPresIsNodeASlide() {
		return this.presIsNodeASlide;
	}

	public void setPresIsNodeASlide(boolean presIsNodeASlide) {
		this.presIsNodeASlide = presIsNodeASlide;
	}

	public boolean getPresIsNodeASlideWrapper() {
		return this.presIsNodeASlideWrapper;
	}

	public void setPresIsNodeASlideWrapper(boolean presIsNodeASlideWrapper) {
		this.presIsNodeASlideWrapper = presIsNodeASlideWrapper;
	}

	public boolean getPresIsNodeADrawFrame() {
		return this.presIsNodeADrawFrame;
	}

	public void setPresIsNodeADrawFrame(boolean presIsNodeADrawFrame) {
		this.presIsNodeADrawFrame = presIsNodeADrawFrame;
	}

	public boolean getPresIsNodeATask() {
		return this.presIsNodeATask;
	}

	public void setPresIsNodeATask(boolean presIsNodeATask) {
		this.presIsNodeATask = presIsNodeATask;
	}

	public String getPresNodeId() {
		return this.presNodeId;
	}
	
	public String getParentId() {
		return this.parentId;
	}
	
	public String getPresContentBoxId() {
		return this.presContentBoxId;
	}
	
	public String getPresSlideId() {
		return this.presSlideId;
	}
	
	public boolean getPresTextTyping() {
	  return this.presTextTyping;
	}

	public void setPresNodeId(String presNodeId) {
		this.presNodeId = presNodeId;
	}
	
	public void setParentId(String parentId) {
		this.parentId = parentId;
	}
	
	public void setPresSlideId(String slideId) {
		this.presSlideId = slideId;
	}
	
	public void setPresContentBoxId(String contentBoxId) {
		this.presContentBoxId = contentBoxId;
	}
	
	public void setPresTextTyping(boolean presTextTyping) {
	  this.presTextTyping = presTextTyping;
	}
  

}
