package com.ibm.concord.writer.model;

import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

public class Toc extends ModelObject {
	JSONArray children = null;

	Toc(JSONObject jsonobj) {
		super(jsonobj);
		this.children = (JSONArray)((JSONObject)this.jsonobj).get("sdtContent");
		for( int i =0 ; i< this.children.size(); ){
		//maybe removed in future design
			Object rt =  ( (JSONObject)this.children.get(i)).get(RUNTYPE);
			if (rt != null && rt.toString().equals( RUN_BMK )) {
				this.children.remove(i);
			}
			else
				i++;
		}
	}

	@Override
	public void setAttributes(JSONObject atts) {
		// TODO Auto-generated method stub

	}
	
	@Override
	public void deleteElement(int index) {
		this.children.remove(index);		
	}
	@Override
	public void insertElement(int index, JSONObject element){
		this.children.add(index, element);
	}

}
