package com.ibm.concord.writer.message.impl;

import com.ibm.concord.writer.model.Table;
import com.ibm.json.java.JSONObject;

public class InsertRow extends TableRCOperation {
	public InsertRow(JSONObject update){
		super(update);
	}
	@Override
	protected void apply(JSONObject model) throws Exception {
		// TODO Auto-generated method stub
		Table table = this.getTargetTable(model);
		JSONObject row = (JSONObject) this.element;
		if (table != null)
		  table.insertRow(row, index, fixCells);
	}

}
