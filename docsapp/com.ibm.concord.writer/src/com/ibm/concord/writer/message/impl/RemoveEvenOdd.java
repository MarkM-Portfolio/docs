package com.ibm.concord.writer.message.impl;

import com.ibm.concord.writer.message.Operation;
import com.ibm.json.java.JSONObject;

public class RemoveEvenOdd extends Operation {
	public RemoveEvenOdd(JSONObject jsonUpdate) {
		this.read(jsonUpdate);
	}
	
	@Override
	protected void apply(JSONObject model) throws Exception {
		// TODO Auto-generated method stub
		Object evenodd = model.get("evenAndOddHeaders");
		if (evenodd == null)
			return;
		
		try{
			model.remove("evenAndOddHeaders");
		} catch (Exception e) {
			return;
		}
	}

	@Override
	public boolean read(JSONObject update) {
		// TODO Auto-generated method stub
		return false;
	}

	@Override
	public JSONObject write() {
		// TODO Auto-generated method stub
		return null;
	}

}
