package com.ibm.concord.writer.message.impl;

import com.ibm.concord.writer.model.Table;
import com.ibm.json.java.JSONObject;

public class SplitCellOperation extends TableSplitMergeOperation {

	public SplitCellOperation(JSONObject update) {
		super(update);
	}

	@Override
	protected void apply(JSONObject model) throws Exception {
		// TODO Auto-generated method stub
		Table table = this.getTargetTable(model);
		if (table != null)
		  table.splitCells(startColIndex, startRowIndex,newRowSpan, newColSpan,cnt);
	}

}
