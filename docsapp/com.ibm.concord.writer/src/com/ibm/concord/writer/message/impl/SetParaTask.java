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

public class SetParaTask extends Operation 
{
	public final static String TASK_ID = "taskId";
	private String task_id;
	
	public SetParaTask(JSONObject jsonUpdate){
		this.read(jsonUpdate);
	}
	@Override
	protected void apply(JSONObject model) throws Exception {
		
		JSONObject target = MessageUtil.getById(model, this.target);
        if (target==null) {
          logNoTarget(getTarget(), "paragraph");
          return;
        }
		
		ModelObject modelObj = ModelObject.createModelObject(target);
		if (modelObj == null || !( modelObj instanceof Paragraph )) {
			//not support yet
			throwUnSupported(model, modelObj);
		}
		Paragraph para = (Paragraph) modelObj;
		para.setTaskId(this.task_id);
	}
		
	@Override
	public boolean read(JSONObject update) {
		if(update.get(TASK_ID) != null)
			this.task_id = update.get(TASK_ID).toString();
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
		  update.put(TASK_ID, this.task_id);	
		  writeOp(update);
		  return update;
		}catch(Exception e)
		{
		  e.printStackTrace();
		  return null;
		}
	}
}


