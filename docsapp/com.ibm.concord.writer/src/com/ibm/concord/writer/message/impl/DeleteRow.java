package com.ibm.concord.writer.message.impl;
import com.ibm.concord.writer.model.Table;
import com.ibm.json.java.JSONObject;

public class DeleteRow extends  TableRCOperation {


	public DeleteRow(JSONObject update) {
		super(update);
		// TODO Auto-generated constructor stub
	}

	@Override
	protected void apply(JSONObject model) throws Exception {
		// TODO Auto-generated method stub
		Table table = this.getTargetTable(model);
		if (table != null)
		  table.deleteRow(this.index, this.fixCells);
	}


}

