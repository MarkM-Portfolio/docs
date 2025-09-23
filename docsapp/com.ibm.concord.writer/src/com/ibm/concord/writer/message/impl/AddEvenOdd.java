package com.ibm.concord.writer.message.impl;

import com.ibm.concord.writer.message.Operation;
import com.ibm.json.java.JSONObject;

public class AddEvenOdd extends Operation {
	public AddEvenOdd(JSONObject jsonUpdate) {
		this.read(jsonUpdate);
	}
	private JSONObject element;
	@Override
	protected void apply(JSONObject model) throws Exception {
		Object evenodd = model.get("evenAndOddHeaders");
		if (evenodd != null)
			return;
		
		try {
			model.put("evenAndOddHeaders", this.element);
		} catch (Exception e) {
			return;
		}
	}

	@Override
	public boolean read(JSONObject update) {
		try {
			this.element = (JSONObject) update.get(CNT);
			return true;
		}catch (Exception e) {
			return false;
		}
	}

	@Override
	public JSONObject write() {
	    // OT will not change the message content.
		return null;
	}

}
