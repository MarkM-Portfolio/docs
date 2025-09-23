package com.ibm.concord.writer.message.impl;

import com.ibm.concord.writer.message.Operation;
import com.ibm.json.java.JSONObject;

public class SetTrackChange extends Operation {
	private long time;
	
	public SetTrackChange(JSONObject jsonUpdate) {
		this.read(jsonUpdate);
	}

	@Override
	protected void apply(JSONObject model) throws Exception {
	  if(this.time == 0){
	    model.remove("docsTrackChangeOnTime");
	    model.remove("docsTrackChangeCheckTime");
	  }
	  else
		model.put("docsTrackChangeOnTime", this.time);
	}

	@Override
	public boolean read(JSONObject update) {
		// setTarget(update.get(TARGET).toString());
		this.time = (Long.parseLong(update.get("d").toString()));
		return true;
	}

	@Override
	public JSONObject write() {
		return null;
	}

}
