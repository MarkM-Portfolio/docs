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
import java.util.List;
import java.util.Map;

import lotus.org.w3c.tidy.Tidy;

import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

import com.ibm.json.java.JSONObject;

public class TaskOperation extends Operation {

	private int index;

	private int length;
	
	private String uuid;
	
	private String taskId;
	
	private String refId;
	
	private Map<String, String> cachedTask = new HashMap<String, String>();
	
	private final static String UUID = "uuid";

	private final static String TASKID = "tsk";
	
	private final static String CACHEDTASK = "cachedTask";
	
	
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
	public String getRefId() {
      return refId;
    }

    public void setRefId(String refId) {
      this.refId = refId;
    }
	@Override
	public void apply(Tidy tidy, Document dom) throws Exception {
		if ( this.type.equalsIgnoreCase(INSERT_TASK)) {
			createTaskArea(dom, this.target, this.index, this.length, this.uuid, this.taskId);
		} 
		if ( this.type.equalsIgnoreCase(UPDATE_TASK)) {
			updateTaskArea(dom, this.uuid, this.taskId, this.cachedTask);
		}
		if ( this.type.equalsIgnoreCase(DELETE_TASK)) {
			deleteTaskArea(dom, this.uuid, this.taskId);
		}
	}

	@Override
	public boolean read(JSONObject update) {
	    try
	    {
	      this.type = (String) update.get(TYPE);
	      if ( type.equalsIgnoreCase(INSERT_TASK) || type.equalsIgnoreCase(DELETE_TASK)) {
	    	  this.target = (String) update.get(TARGET);
	    	  this.index = Integer.parseInt(update.get(INDEX).toString());
	    	  this.length = Integer.parseInt(update.get(LENGTH).toString());
	    	  this.refId = (String) update.get(REFID);
	      }
	      this.uuid = (String) update.get(UUID);
	      this.taskId = (String) update.get(TASKID);
	      JSONObject taskObj = (JSONObject) update.get(CACHEDTASK);
	      if(taskObj != null){
		      Iterator it = taskObj.keySet().iterator();
		      while(it.hasNext()){
		    	  String key = (String)it.next();
		    	  String value = (String)taskObj.get(key);
		    	  cachedTask.put(key, value);   
		      } 	    	  
	      }	      
	      return true;
	    }
	    catch (Exception e)
	    {
	      return false;
	    }
	}

	@Override
	public JSONObject write() {
		try
	    {
	      JSONObject ob = new JSONObject();
	      ob.put(TYPE, type);
	      if ( type.equalsIgnoreCase(INSERT_TASK) || type.equalsIgnoreCase(DELETE_TASK)) {
	    	  ob.put(TARGET, this.target);
	    	  ob.put(INDEX, Integer.toString(this.index));
	    	  ob.put(LENGTH, Integer.toString(this.length));
	      }
	      if ( this.refId!= null )
	          ob.put(REFID, this.refId);
	      if ( this.uuid != null )
	    	  ob.put(UUID, this.uuid);
	      if ( this.taskId != null)
	    	  ob.put(TASKID, this.taskId);
	      
	      Iterator<String> itTask = cachedTask.keySet().iterator();
	      JSONObject attrObj = new JSONObject();
	      while(itTask.hasNext()){
	    	  String attKey = itTask.next();
	    	  String attValue = cachedTask.get(attKey);
	    	  attrObj.put(attKey, attValue);
	      }
	      ob.put(CACHEDTASK, attrObj);
	          
	      return ob;
	    }
	    catch (Exception e)
	    {
	      e.printStackTrace();
	      return null;
	    }
	}
	
	private void createTaskArea( Document dom, String target, int index, int length, String uuid, String taskId)
	{
		Element doc = dom.getDocumentElement();
		Element parent = XHTMLDomUtil.getElementbyId(doc, target);
		if ( parent.getNodeName().equalsIgnoreCase("fieldset") ) {
			return;
		}
		String id = taskId != null ? taskId : uuid;
		if (id == null)
			return;
		Element fieldset = dom.createElement("fieldset");
		fieldset.setAttribute("id", id);
		fieldset.setAttribute("contentEditable", "false");
		XHTMLDomUtil.addClass(fieldset, "concordNode");
		
		Element taskStartDiv = dom.createElement("div");
		taskStartDiv.setAttribute(id, "start_" + id);
		taskStartDiv.setAttribute("unselectable", "ON");
		XHTMLDomUtil.addClass(taskStartDiv, "concord_range_start hidden lock");
		XHTMLDomUtil.setStyle(taskStartDiv, "display" ,"none");
		
		Element taskEndDiv = dom.createElement("div");
		taskEndDiv.setAttribute("id", "end_"+ id);
		//taskEndDiv.setAttribute("task_id", taskId);
		taskEndDiv.setAttribute("contentEditable", "false");
		taskEndDiv.setAttribute("unselectable", "ON");
		XHTMLDomUtil.addClass(taskEndDiv, "concord_range_end hidden lock");
		XHTMLDomUtil.setStyle(taskEndDiv, "display" ,"none");
		
		//add a div as container of all selected contents
		Element taskDiv = dom.createElement("div");
		//taskDiv.setAttribute("task_id", taskId);
		taskDiv.setAttribute("frag_id","");	
		taskDiv.setAttribute("contentEditable", "true");
		taskDiv.setAttribute("id", "reference_" + id);
		XHTMLDomUtil.addClass(taskDiv, "reference");
		
		// create legend
		Element legend = dom.createElement("legend");
		legend.setAttribute("id", "legend_" + id);
		legend.setAttribute("contentEditable", "false");
		legend.setAttribute("unselectable", "ON");
		XHTMLDomUtil.addClass(legend,"concordContainer");
		
		
		
		Element actionDiv = dom.createElement("div");
		actionDiv.setAttribute("id", "action_" + id);
		actionDiv.setAttribute("contentEditable", "false");
		actionDiv.setAttribute("unselectable", "ON");
		actionDiv.setAttribute("align", "right");
		XHTMLDomUtil.addClass(actionDiv, "concordBtnContainer");
		
		
		fieldset.appendChild(legend);
		fieldset.appendChild(actionDiv);

		NodeList children = parent.getChildNodes();
		Node start = children.item(index);
		parent.insertBefore(fieldset, start);
		
		for(int i=0; i<length; i++){
			Node next = start.getNextSibling();
			parent.removeChild(start);
			taskDiv.appendChild(start);
			start = next;
		}
		
		fieldset.appendChild(taskStartDiv);
		fieldset.appendChild(taskDiv);
		fieldset.appendChild(taskEndDiv);
		return;
	}
	
	private void deleteTaskArea( Document dom, String uuid, String taskId)
	{
		Element doc = dom.getDocumentElement();
		Element fieldset = null;
		if ( taskId != null )
			fieldset = XHTMLDomUtil.getElementbyId(doc, taskId);
		else if ( uuid != null)
			fieldset =XHTMLDomUtil.getElementbyId(doc, uuid);
		
		if ( fieldset == null )
			return;
        Node parent = fieldset.getParentNode();
        List<Element> elements = XHTMLDomUtil.getElementsbyClass(fieldset, "reference");
        if (elements.size() > 0)
        {
          Element reference = elements.get(0);
          Node node = reference.getFirstChild();
          while (node != null)
          {
              Node next = node.getNextSibling();
              reference.removeChild(node);
              parent.insertBefore(node, fieldset);
              node = next;
          }         
        }
		parent.removeChild(fieldset);
	}

	private void updateTaskArea(Document dom, String uuid, String taskId, Map<String,String> cachedTask)
	{
		Element doc = dom.getDocumentElement();
		Element fieldset = null;
		if ( taskId != null )
			fieldset = XHTMLDomUtil.getElementbyId(doc, taskId);
		if (fieldset == null &&  uuid != null)
			fieldset =XHTMLDomUtil.getElementbyId(doc, uuid);
		
		if ( fieldset == null )
			return;
		
		String id = fieldset.getAttribute("id");
		Element reference = (Element) fieldset.getLastChild().getPreviousSibling();
		if ( taskId != null ) {
			if (! taskId.equalsIgnoreCase(id))
				fieldset.setAttribute("id", taskId);
			String oldTaskId = reference.getAttribute("task_id");
			if (oldTaskId == null || !taskId.equalsIgnoreCase(oldTaskId))
				reference.setAttribute("task_id", taskId);
		}
			
		if ( cachedTask != null && cachedTask.size() !=0 ) {
			if ( reference != null) {
				Iterator<String> itTask = cachedTask.keySet().iterator();
				while(itTask.hasNext()){
					String attribute = itTask.next();
					reference.setAttribute(attribute, cachedTask.get(attribute));
				}
			}
		}
		return;
	}

}
