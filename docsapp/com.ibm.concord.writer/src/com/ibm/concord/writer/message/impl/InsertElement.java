package com.ibm.concord.writer.message.impl;

import com.ibm.concord.writer.message.MessageUtil;
import com.ibm.concord.writer.message.Operation;
import com.ibm.concord.writer.model.ModelObject;
import com.ibm.concord.writer.model.NotesObject;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

public class InsertElement extends Operation {
	public JSONObject element;
	public int index;
	public InsertElement(JSONObject jsonUpdate) {
		this.read(jsonUpdate);
	}

	@Override
	protected void apply(JSONObject model) throws Exception {
		Object target = null;
		if (this.target.equalsIgnoreCase("body")) {
			target = model.get("body");

		} else {
		  if(model instanceof JSONObject)
		  {
			  Object HeaderFooter = model.get(this.target);
			  if (HeaderFooter != null && HeaderFooter instanceof JSONObject)
			  {
				  JSONObject hf = (JSONObject)HeaderFooter;
				  String t = hf.get("t").toString();
				  if (t.equals("hdr") || t.equals("ftr"))
					  target = hf.get("content");
			  }else {
				  String []ids = this.target.split(":");				  
				  if(ids.length==2){
					  Object element = model.get(ids[0]);
					  target = ((JSONArray)element).get(Integer.parseInt(ids[1]));
					  ModelObject m= new NotesObject((JSONObject)target);
					  m.insertElement( index , this.element);
					  return;
				  }else{
					  target = model.get(ids[0]);
				  }
				  
			  }
		  }
		  
		  if (target == null)
		  {
			  target = MessageUtil.getById(model, this.target);
			  // Text box
			  if( target instanceof JSONObject )
			  {
				String rt = (String)((JSONObject)target).get("rt");
				String t = (String)((JSONObject)target).get("t");
				
				if ( "txbx".equalsIgnoreCase(rt) || "txbx".equalsIgnoreCase(t) )
					target = MessageUtil.getTextBoxContent(target);
			  }
		  }
		}
		
		if( target != null && target instanceof JSONArray ){
			JSONArray children = (JSONArray)target;
			// filter the json. defect 40755
			ModelObject m = ModelObject.createModelObject(this.element);
			children.add(index, element);
		}
		else if( target != null && target instanceof JSONObject){
			ModelObject m= ModelObject.createModelObject( (JSONObject)target );
			m.insertElement( index , element);
		}
	}

	@Override
	public boolean read(JSONObject update) {
		try {
			setType(update.get(TYPE).toString());
			setTarget(update.get(TARGET).toString());
			this.element = (JSONObject) update.get(CNT);
			this.index = (Integer.parseInt(update.get(INDEX).toString()));
			readOp(update);
			return true;
		} catch (Exception e) {
			return false;
		}
	}

	@Override
	public JSONObject write() {
		try {
			JSONObject update = new JSONObject();

			update.put(TYPE, getType());
			update.put(TARGET, getTarget());
			update.put(CNT, this.element);
			update.put(INDEX, this.index );
			writeOp(update);
			return update;
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
			return null;
		}
	}

	public int getIndex()
	{
	  return this.index;
	}
	
	public void setIndex(int idx)
	{
	  this.index = idx;
	}
}
