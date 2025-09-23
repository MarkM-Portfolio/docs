package com.ibm.concord.writer.message.impl;

import com.ibm.concord.writer.model.Table;
import com.ibm.json.java.JSONObject;

public class MergeCellsOperation extends TableSplitMergeOperation {

	public MergeCellsOperation(JSONObject update){
		super(update);
	}
	
	

	@Override
	protected void apply(JSONObject model) throws Exception {
		Table table = this.getTargetTable(model);
		if (table != null)
		  table.mergeCells(startColIndex, startRowIndex,  newRowSpan, newColSpan);
	}

}
