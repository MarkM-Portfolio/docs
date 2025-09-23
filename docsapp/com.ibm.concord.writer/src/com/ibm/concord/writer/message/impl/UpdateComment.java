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

import com.ibm.concord.writer.message.Operation;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

public class UpdateComment extends Operation {

	public final static String KEY = "k";
	public final static String VAL = "v";
	
	private String comment_id;
	private String key;
	private String val;
	private String idx;
	
	public UpdateComment(JSONObject jsonUpdate){
		this.read(jsonUpdate);
	}
	@Override
	protected void apply(JSONObject model) throws Exception {

		JSONArray obj = (JSONArray) model.get("comments");
		if(obj == null) return;
		
		for(int j = obj.size() - 1; j >= 0; j--){
			JSONObject cmt = (JSONObject)obj.get(j);
			String cid = (String)cmt.get("id");
			String pid = "";
			Object pid_obj = cmt.get("pid");
			if (pid_obj != null) pid = (String)pid_obj;
			// check both comment id and pid, if the comment is a child,
			// also set the new done value for parent
			if(cid.equals(comment_id) || pid.equals(comment_id)){
				cmt.remove("done");  // avoid duplicated key
				cmt.put("done", val);
			}
		}
	}
		
	@Override
	public boolean read(JSONObject update) {
		if(update.get(TARGET) != null && !update.get(TARGET).toString().equals(""))
			this.comment_id = update.get(TARGET).toString();
		if(update.get(INDEX) != null && !update.get(INDEX).toString().equals(""))
			this.idx = update.get(INDEX).toString();
		if(update.get(KEY) != null && !update.get(KEY).toString().equals(""))
			this.key = update.get(KEY).toString();
		if(update.get(VAL) != null && !update.get(VAL).toString().equals(""))
			this.val = update.get(VAL).toString();
		setType(update.get(TYPE).toString());
		readOp(update);
		return true;
	}

	@Override
	public JSONObject write() {
		try{
		  JSONObject update = new JSONObject();
		  update.put(TYPE, getType());
		  update.put(TARGET, this.comment_id);
		  update.put(INDEX, this.idx);
		  update.put(KEY, key);
		  update.put(VAL, val);
		  writeOp(update);
		  return update;
		}catch(Exception e)
		{
		  e.printStackTrace();
		  return null;
		}
	}
}
