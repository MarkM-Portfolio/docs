/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.writer.message.impl;

import com.ibm.concord.writer.message.MessageUtil;
import com.ibm.concord.writer.message.Operation;
import com.ibm.concord.writer.model.ModelObject;
import com.ibm.concord.writer.model.Paragraph;
import com.ibm.json.java.JSONObject;

public class AddComment extends Operation 
{
	private int length = 0;
	private int index;
	private String comment_id;
	private String comment_pid;
	private String comment_rcid; // referred reply comment id
	private String comment_runid;
	//-1 begin end
	//0 end
	//1 start
	private int comment_t;
	
	public AddComment(JSONObject jsonUpdate){
		this.read(jsonUpdate);
	}
	@Override
	protected void apply(JSONObject model) throws Exception {
		
		JSONObject target = MessageUtil.getById(model, this.target);
		// OT will transform the length to 0.
		if(target==null || (this.length == 0 && (this.comment_pid == null || this.comment_pid.length() == 0))) return;
		
		ModelObject modelObj = ModelObject.createModelObject(target);
		if (modelObj == null || !( modelObj instanceof Paragraph )) {
			//not support yet
			throwUnSupported(model, modelObj);
		}
		
		Paragraph para = (Paragraph) modelObj;
		if (this.comment_pid == null || this.comment_pid.length() == 0)
			para.addComment(comment_id, comment_t, index, length);
		else  // parent comment id is not null means it is for reply comment to append to cl
			para.appendResponseComment(comment_id, comment_pid, comment_rcid);
	}
		
	@Override
	public boolean read(JSONObject update) {
		if(update.get(LENGTH) != null && !update.get(LENGTH).toString().equals(""))
			this.length = Integer.parseInt(update.get(LENGTH).toString());
		if(update.get(INDEX) != null && !update.get(INDEX).toString().equals(""))
			this.index = Integer.parseInt(update.get(INDEX).toString());
		if(update.get(COMMENT_T) != null && !update.get(COMMENT_T).toString().equals(""))
			this.comment_t = Integer.parseInt(update.get(COMMENT_T).toString());
		if(update.get(COMMENT_ID) != null && !update.get(COMMENT_ID).toString().equals(""))
			this.comment_id = update.get(COMMENT_ID).toString();
		if(update.get(COMMENT_PID) != null && !update.get(COMMENT_PID).toString().equals(""))
			this.comment_pid = update.get(COMMENT_PID).toString();
		if(update.get(COMMENT_RCID) != null && !update.get(COMMENT_RCID).toString().equals(""))
			this.comment_rcid = update.get(COMMENT_RCID).toString();
		if(update.get(COMMENT_RUNID) != null && !update.get(COMMENT_RUNID).toString().equals(""))
			this.comment_runid = update.get(COMMENT_RUNID).toString();
		setTarget(update.get(TARGET).toString());
		setType(update.get(TYPE).toString());
		readOp(update);
		return true;
	}

	@Override
	public JSONObject write() {
		try{
		  JSONObject update = new JSONObject();
		  update.put(TYPE, getType());
		  update.put(TARGET, getTarget());
		  update.put(LENGTH, getLength());
		  update.put(INDEX, getIndex());
		  update.put(COMMENT_T, this.comment_t);
		  update.put(COMMENT_ID, this.comment_id);
		  if (this.comment_pid != null && this.comment_pid.length()>0)
			  update.put(COMMENT_PID, this.comment_pid);
		  if (this.comment_rcid != null && this.comment_rcid.length()>0)
			  update.put(COMMENT_RCID, this.comment_rcid);
		  if (this.comment_runid != null && this.comment_runid.length()>0)
			  update.put(COMMENT_RUNID, this.comment_runid);
		  writeOp(update);
		  return update;
		}catch(Exception e)
		{
		  e.printStackTrace();
		  return null;
		}
	}

	public void setPid(String pid)
	{
	  this.comment_pid = pid;
	}
	
	public int getLength(){
	  return this.length;
	}
	
	public void setLength(int len)
	{
	  this.length = len;
	}
	
	public int getIndex(){
	  return this.index;
	}
	
	public void setIndex(int idx)
	{
	  this.index = idx;
	}
}
