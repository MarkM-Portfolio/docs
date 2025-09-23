package com.ibm.concord.writer.message.impl;

import com.ibm.concord.writer.message.Operation;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

public class DeleteSection extends Operation {
	public DeleteSection(JSONObject jsonUpdate) {
		this.read(jsonUpdate);
	}
	@Override
	protected void apply(JSONObject model) throws Exception {
		// TODO Auto-generated method stub
		JSONArray sects = (JSONArray)model.get("sects");
		for(int i=0;i< sects.size();i++){
			JSONObject sect = (JSONObject) sects.get(i);
			String id = (String)sect.get("id");
			if(id.equalsIgnoreCase(this.target)){
				sects.remove(i);
				break;
			}
		}
	}

	@Override
	public boolean read(JSONObject update) {
		// TODO Auto-generated method stub
		setTarget(update.get(TARGET).toString());
		return true;
	}

	@Override
	public JSONObject write() {
		// TODO Auto-generated method stub
		return null;
	}

}