package com.ibm.concord.writer.message.impl;



import com.ibm.concord.writer.message.MessageUtil;
import com.ibm.concord.writer.message.Operation;
import com.ibm.concord.writer.model.ModelObject;
import com.ibm.concord.writer.model.Table;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

public abstract class TableSplitMergeOperation extends Operation {

	public int startColIndex;
	
	public int startRowIndex;
	
	
	public int newRowSpan;
	
	public int newColSpan;
	
	public JSONArray cnt;
	
	
	public final static String START_COL_INDEX = "sc";
	
	public final static String START_ROW_INDEX = "sr";
	
	public final static String END_COL_INDEX = "ec";
	
	public final static String END_ROW_INDEX = "er";
	
	public final static String OLD_ROW_SPAN = "or";
	
	public final static String OLD_COL_SPAN = "oc";
	
	public final static String NEW_ROW_SPAN = "nr";
	
	public final static String NEW_COL_SPAN = "nc";

	TableSplitMergeOperation(JSONObject update){
		read(update);
	}
	
	@Override
	public boolean read(JSONObject update) {
		// TODO Auto-generated method stub
		try {
			setType(update.get(TYPE).toString());
			setTarget(update.get(TARGET).toString());
			this.startColIndex = Integer.parseInt(update.get(START_COL_INDEX).toString());
			this.startRowIndex = Integer.parseInt(update.get(START_ROW_INDEX).toString());
			this.newColSpan =    Integer.parseInt(update.get(NEW_COL_SPAN).toString());
			this.newRowSpan =    Integer.parseInt(update.get(NEW_ROW_SPAN).toString());	
			if(update.containsKey(CNT)){
				this.cnt = (JSONArray)update.get(CNT);
			}
			readOp(update);
			return true;
		} catch (Exception e) {
			return false;
		}
	}
	@Override
	public JSONObject write() {
		// TODO Auto-generated method stub
		try {
			JSONObject update = new JSONObject();
			update.put(TYPE, getType());
			update.put(TARGET, getTarget());
			if(this.cnt!=null){
				update.put(CNT, this.cnt);
			}
			update.put(START_COL_INDEX, this.startColIndex);
			update.put(START_ROW_INDEX, this.startRowIndex);
			update.put(NEW_ROW_SPAN, newRowSpan);
			update.put(NEW_COL_SPAN, newColSpan);
			writeOp(update);
			return update;
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
			return null;
		}
	}
	public Table getTargetTable(JSONObject model) throws Exception{
		JSONObject target = MessageUtil.getById(model, getTarget());
		if (target==null) {
		  logNoTarget(getTarget(), "table");
		  return null;
		}
		ModelObject table = ModelObject.createModelObject(target);
		if (table == null || !(table instanceof Table)) {
			// not support yet
			throwUnSupported(model, table);
		}
		return (Table) table;
	}
	
}
