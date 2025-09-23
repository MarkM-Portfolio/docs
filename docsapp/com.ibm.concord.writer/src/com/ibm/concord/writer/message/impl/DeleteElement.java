package com.ibm.concord.writer.message.impl;

import com.ibm.concord.writer.message.MessageUtil;
import com.ibm.concord.writer.message.Operation;
import com.ibm.concord.writer.model.ModelObject;
import com.ibm.concord.writer.model.NotesObject;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

public class DeleteElement extends Operation {
    public int index;
  
	public DeleteElement(JSONObject jsonUpdate) {
		this.read(jsonUpdate);
	}

	@Override
	protected void apply(JSONObject model) throws Exception {
		//MessageUtil.remove( model,this.target);  //what's this for?
	  
	  // After OT, the index can be transformed to -1.
	  if(this.index < 0)
	    return;
	  
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
					  m.deleteElement( this.index );
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
          children.remove(this.index);
      }else if( target != null && target instanceof JSONObject){
    	  ModelObject m= ModelObject.createModelObject( (JSONObject)target );
		  m.deleteElement( index );
		}
	}

	@Override
	public boolean read(JSONObject update) {
		try {
			setType(update.get(TYPE).toString());
			setTarget(update.get(TARGET).toString());
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
