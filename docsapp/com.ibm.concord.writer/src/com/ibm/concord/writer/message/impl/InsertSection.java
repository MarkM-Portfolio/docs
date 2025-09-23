package com.ibm.concord.writer.message.impl;

import com.ibm.concord.writer.message.Operation;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

public class InsertSection extends Operation {
	public InsertSection(JSONObject jsonUpdate) {
		this.read(jsonUpdate);
	}
	private JSONObject element;
	private int index;
	@Override
	protected void apply(JSONObject model) throws Exception {
		JSONArray sects = (JSONArray)model.get("sects");
		sects.add(this.index,this.element);
	}

	@Override
	public boolean read(JSONObject update) {
		// TODO Auto-generated method stub
		try {
		setTarget(update.get(TARGET).toString());
		this.element = (JSONObject) update.get(CNT);
		this.index = (Integer.parseInt(update.get(INDEX).toString()));
		return true;
		}catch (Exception e) {
			return false;
		}
	}

	@Override
	public JSONObject write() {
		// TODO Auto-generated method stub
		return null;
	}

}
