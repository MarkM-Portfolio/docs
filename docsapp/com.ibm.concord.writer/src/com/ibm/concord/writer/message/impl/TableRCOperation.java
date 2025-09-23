package com.ibm.concord.writer.message.impl;

import com.ibm.concord.writer.message.MessageUtil;
import com.ibm.concord.writer.message.Operation;
import com.ibm.concord.writer.model.ModelObject;
import com.ibm.concord.writer.model.Table;
import com.ibm.json.java.JSONObject;

public abstract class TableRCOperation extends Operation {
	 public final static String FIXCELLS = "fc";
	 public Object element;
	 public int index;
	 public JSONObject fixCells;
	public TableRCOperation(JSONObject update){
		read(update);
	}
	@Override
	public boolean read(JSONObject update) {
		// TODO Auto-generated method stub
		try {
			setType(update.get(TYPE).toString());
			setTarget(update.get(TARGET).toString());
			this.element =  update.get(CNT);
			this.index = (Integer.parseInt(update.get(INDEX).toString()));
			Object fixCells = update.get(FIXCELLS);
			if(fixCells!=null){
				this.fixCells = (JSONObject)fixCells;
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
			if(this.element!=null){
				update.put(CNT, this.element);
			}
			update.put(INDEX, this.index );
			if(this.fixCells!=null){
				update.put(FIXCELLS, this.fixCells);
			}			
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
