package com.ibm.concord.writer.message.impl;

import com.ibm.concord.writer.model.Table;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

public class InsertColumn extends  TableRCOperation {

	public InsertColumn(JSONObject update) {
		super(update);
		// TODO Auto-generated constructor stub
	}

	@Override
	protected void apply(JSONObject model) throws Exception {
		// TODO Auto-generated method stub
		Table table = this.getTargetTable(model);
		if (table != null)
		  table.insertColumn(index, (JSONArray)this.element, fixCells);
	}


}
