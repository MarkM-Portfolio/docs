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
import java.util.Arrays;
import java.util.LinkedList;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

import lotus.org.w3c.tidy.Tidy;

import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

/**
 * @author sfeiguo@cn.ibm.com
 * 
 */
public class DeleteElementOperation extends Operation {

	private int index;

	private int length;

	private boolean isBlock;
	
	private List<String> elementList;
	
	/* Presentation properties */
	
	private boolean  presIsNodeASlide;

	private boolean  presIsNodeASlideWrapper;
	
	private boolean  presIsNodeADrawFrame;
	
	private boolean  presIsNodeATask;
	
	private String   presNodeId;
	
	private String   parentId;
	
	private String   presSlideId;
	
	private int      presOrigSlideCount;
	
	private String   presContentBoxId;
	
	private boolean   presTextTyping;
	
	private String  presIsListCssStyle;
	
	private static final Logger LOG = Logger.getLogger(DeleteElementOperation.class.getName());

	@Override
	public boolean read(JSONObject update) {
		try {
			setType(update.get(TYPE).toString());
			setTarget(update.get(TARGET).toString());
			setIndex(Integer.parseInt(update.get(INDEX).toString()));
			setLength(Integer.parseInt(update.get(LENGTH).toString()));
			setBlock(Boolean.valueOf(update.get(IS_BLOCK).toString()));
			setList((JSONArray)(update.get(ELEMENT_LIST)));
			/* presentation specific properties */
			if (update.containsKey(PRES_IS_NODE_A_SLIDE)) setPresIsNodeASlide(Boolean.valueOf(update.get(PRES_IS_NODE_A_SLIDE).toString()));
			if (update.containsKey(PRES_IS_NODE_A_SLIDE_WRAPPER)) setPresIsNodeASlideWrapper(Boolean.valueOf(update.get(PRES_IS_NODE_A_SLIDE_WRAPPER).toString()));
			if (update.containsKey(PRES_IS_NODE_A_DRAW_FRAME)) setPresIsNodeADrawFrame(Boolean.valueOf(update.get(PRES_IS_NODE_A_DRAW_FRAME).toString()));
			if (update.containsKey(PRES_IS_NODE_A_TASK)) setPresIsNodeATask(Boolean.valueOf(update.get(PRES_IS_NODE_A_TASK).toString()));
			if (update.containsKey(PRES_NODE_ID)) setPresNodeId(update.get(PRES_NODE_ID).toString());
			if (update.containsKey(PARENT_ID)) setParentId(update.get(PARENT_ID).toString());
			if (update.containsKey(PRES_SLIDE_ID)) setPresSlideId(update.get(PRES_SLIDE_ID).toString());
			if (update.containsKey(PRES_ORIG_SLIDE_COUNT)) setPresOrigSlideCount(Integer.valueOf(update.get(PRES_ORIG_SLIDE_COUNT).toString()));
			if (update.containsKey(PRES_CONTENT_BOX_ID)) setPresContentBoxId(update.get(PRES_CONTENT_BOX_ID).toString());
			if (update.containsKey(PRES_TEXT_TYPING)) setPresTextTyping(Boolean.valueOf(update.get(PRES_TEXT_TYPING).toString()));
			if (update.containsKey(PRES_IS_CSS_LIST_BEFORE)) setPresIsListCssStyle(update.get(PRES_IS_CSS_LIST_BEFORE).toString());
			return true;
		} catch (Exception e) {
			return false;
		}
	}
	public String getPresIsListCssStyle() {
		return this.presIsListCssStyle;
	}
  
	public void setPresIsListCssStyle(String presIsListCssStyle) {
		this.presIsListCssStyle = presIsListCssStyle;
	}
	
	public static void applyListBeforeStyles(Document dom, Object styleObj)
	{
	  Element e = dom.getDocumentElement();
      if (styleObj!=null){
          //IL_CS_1379785510029:before= font-size: 3.66667em; font-style: normal;
          
          Element head = null;
            NodeList styles = e.getElementsByTagName("head");
            for (int i = 0; i < styles.getLength(); i++)
            {
              Node tmpNode = styles.item(i);
              head = (Element)tmpNode;
            }
            
          if (head == null)
          {
            return;
          }
          try{
        	  
        	  List<String> listCssitems = new ArrayList<String>();
        	  if(styleObj instanceof String)
        	  {
        		  // for old code
        		  String cssStyle = (String)styleObj;
        		  cssStyle = cssStyle.trim();
                  cssStyle = cssStyle.replace("[", "").replace("]", "");
                  
                  if(cssStyle.length()==0)
                    return;
                  
                  listCssitems = Arrays.asList(cssStyle.split(","));
        	  }
        	  else
        	  {
        		  // must be a list
        		  listCssitems = (List<String>)styleObj;
        	  }
        	  
        	  if(listCssitems.size() == 0)
        		  return;
            
              Element styleNode = null;
              
              List<Node> list = new LinkedList<Node>();
              list = XHTMLDomUtil.getElements(head,"style",null);
              
              List<Node> styleList = new LinkedList<Node>();
              if(list != null)
              {
                  for( Node linkNode:list)
                  {
                      
                      String linkAttr =XHTMLDomUtil.getAttribute((Element) linkNode,"stylename");
                      if(linkAttr!=null && linkAttr.startsWith("list_before_style"))
                          styleList.add(linkNode);
                  }
              }
              int size = styleList.size();
              if(size>0){
                  styleNode = (Element) styleList.get(size-1);
                  if(size>1){
                      for(int i=0;i<size-1;i++){
                           Node tmp = styleList.get(i);
                           head.removeChild(tmp);
                      }
                  }
              }
              
              
                if(styleNode==null){
                    styleNode = dom.createElement("style");
                    styleNode.setAttribute("type", "text/css");
                    styleNode.setAttribute("styleName","list_before_style");
                    styleNode.setAttribute("id", DOMIdGenerator.generate());
                    Node textNode = dom.createTextNode("");
                    styleNode.appendChild(textNode);
                    head.appendChild(styleNode);
                }
             
              for(int i =0;i<listCssitems.size();i++){                    
                  String listitem = listCssitems.get(i);
                  //LOG.info("=====>List Before CSS message deal with: " + listitem);
                  String[] nameContent = listitem.split("=");
                  if (nameContent.length == 2)
                  {
                    String name = nameContent[0].trim();
                    String tcontent = nameContent[1].trim();
                    
                    String subStr = XHTMLDomUtil.GetTextNode(styleNode).trim().replaceAll(".concord ", "");
                    int start = subStr.indexOf("."+name);
                    String listStyle="";
                    if(start>=0){
                      String preStr = subStr.substring(0,start);
                      String endStr = subStr.substring(start);
                      endStr = endStr.substring(endStr.indexOf("}")+1);
                      while(styleNode.hasChildNodes()){
                        Node f = styleNode.getFirstChild();
                        styleNode.removeChild(f);   
                      }
                      
                      if(tcontent.equalsIgnoreCase("no")){
                        listStyle = preStr + endStr;
                      }else 
                        listStyle = preStr +"." +name+" {" +tcontent +"}"+ endStr;
                      Node textNode = dom.createTextNode(listStyle);
                      styleNode.appendChild(textNode);                        
                    } else if(!tcontent.equalsIgnoreCase("no")){
                      if(subStr.endsWith("\n"))
                        listStyle = subStr + "." +name+" {" +tcontent +"}";
                      else 
                        listStyle = subStr + "\n." +name+" {" +tcontent +"}";
                      while(styleNode.hasChildNodes()){
                        Node f = styleNode.getFirstChild();
                        styleNode.removeChild(f);   
                      }
                      Node textNode = dom.createTextNode(listStyle);
                      styleNode.appendChild(textNode);
                    }
                  }
              }
          }catch (Exception exception){
              exception.printStackTrace();
          }
      }
	}
	
	private void updateListBeforeStyles(Document dom, List<String> ids)
	{
	    List<String> css = new ArrayList<String>();
	    for(String id: ids)
	    {
	      css.add("IL_CS_" + id + ":before=no");
	    }
        applyListBeforeStyles(dom, css);
	}
	
	@Override
	public void apply(Tidy tidy, Document dom) throws Exception {
		Element e = dom.getDocumentElement();
		if (this.presIsListCssStyle!=null){
		    // for old code
			//IL_CS_1379785510029:before= font-size: 3.66667em; font-style: normal;
			applyListBeforeStyles(dom, this.presIsListCssStyle);
		}
		Element node = XHTMLDomUtil.getElementbyId(e, getTarget());
	    if (node == null || getLength()==0)
	        return;
		if (isBlock()) {
			Node first = XHTMLDomUtil.getBlock(node, getIndex());
			String presNodeId = this.getPresNodeId();
			if (null != presNodeId) {  // pres delete
				Element rmNode = XHTMLDomUtil.getElementbyId(e, presNodeId);
				if (null != rmNode && node.equals(rmNode.getParentNode())) {
				    List<String> ids = new ArrayList<String>();
	                XHTMLDomUtil.getElementsIds(rmNode, ids);
	                // if(ids.size() > 0)
	                //  updateListBeforeStyles(dom, ids);
					node.removeChild( rmNode );
				} else {
					String msgs = "==Delete element error, pres id is:" + presNodeId;
					LOG.warning(msgs);
				}
			} else {
				if( first!=null )
				{
					// Get the last element should be removed.
					int len = getLength() - 1;
					Node last = first;
					while( last!= null && len > 0 )
					{
					  last = last.getNextSibling();
					  len--;
					}
					
					//Remove the elements from last to first
					Node preSibling = null;
					while( !last.equals(first))
					{
					  preSibling = last.getPreviousSibling();
					  node.removeChild(last);
					  last = preSibling;
					}
					
					node.removeChild( first ); 
				}else{
					String msgs = "==Delete element error, index is:" + getIndex();
					LOG.warning(msgs);
				}
			}
		}
	}

	public int getIndex() {
		return index;
	}

	public void setIndex(int index) {
		this.index = index;
	}

	public int getLength() {
		return length;
	}

	public void setLength(int length) {
		this.length = length;
	}

	public boolean isBlock() {
		return isBlock;
	}

	public void setBlock(boolean isBlock) {
		this.isBlock = isBlock;
	}
	  
    public Boolean getBlock() {
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
	
	public String getPresSlideId() {
		return this.presSlideId;
	}
	
	public int getPresOrigSlideCount() {
		return this.presOrigSlideCount;
	}
	
	public String getPresContentBoxId() {
		return this.presContentBoxId;
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
	
	public void setPresOrigSlideCount(int presOrigSlideCount) {
		this.presOrigSlideCount = presOrigSlideCount;
	}
	
	public void setPresContentBoxId(String contentBoxId) {
		this.presContentBoxId = contentBoxId;
	}
	
	public void setPresTextTyping(boolean presTextTyping) {
		this.presTextTyping = presTextTyping;
	}
    
    public void setList(JSONArray list)
    {
      this.elementList = new ArrayList<String>();
      for (int index = 0; index< list.size();index++)
      {
        String eleId = (String) list.get(index);
        this.elementList.add(eleId);
      }
    }
    
    public List<String> getList()
    {
      return this.elementList;
    }    

  @Override
  public JSONObject write()
  {
    try {
      JSONObject update = new JSONObject();

      update.put(TYPE,getType());
      update.put(TARGET,getTarget());
      update.put(LENGTH, getLength());
      update.put(INDEX,getIndex());
      update.put(IS_BLOCK,getBlock());
      //presentation specific properties
      if (this.presIsNodeASlide) update.put(PRES_IS_NODE_A_SLIDE,getPresIsNodeASlide());
      if (this.presIsNodeASlideWrapper) update.put(PRES_IS_NODE_A_SLIDE_WRAPPER, getPresIsNodeASlideWrapper());
      if (this.presIsNodeADrawFrame) update.put(PRES_IS_NODE_A_DRAW_FRAME, getPresIsNodeADrawFrame());
      if (this.presIsNodeATask) update.put(PRES_IS_NODE_A_TASK, getPresIsNodeATask());
      if (this.presNodeId!= null) update.put(PRES_NODE_ID, getPresNodeId());
      if (this.parentId!= null) update.put(PARENT_ID, getParentId());
      if (this.presSlideId!= null) update.put(PRES_SLIDE_ID, getPresSlideId());
      if (this.presOrigSlideCount > 0) update.put(PRES_ORIG_SLIDE_COUNT, getPresOrigSlideCount());
      if (this.presContentBoxId!= null) update.put(PRES_CONTENT_BOX_ID, getPresContentBoxId());
      if (this.presTextTyping) update.put(PRES_TEXT_TYPING, getPresTextTyping());
      if (this.presIsListCssStyle!=null) update.put(PRES_IS_CSS_LIST_BEFORE,getPresIsListCssStyle());
      
      JSONArray list = new JSONArray();
      for (int index = 0; index< elementList.size();index++)
      {
        list.add(elementList.get(index));
      }
      update.put(ELEMENT_LIST, list);

      return update;
    } catch (Exception e) {
      // TODO Auto-generated catch block
      e.printStackTrace();
      return null;
    } 
  }
}
