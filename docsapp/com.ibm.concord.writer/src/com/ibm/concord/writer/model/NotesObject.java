package com.ibm.concord.writer.model;

import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

public class NotesObject extends ModelObject {

	public NotesObject(JSONObject jsonobj) {
		super(jsonobj);
		// TODO Auto-generated constructor stub
	}

	@Override
	public void setAttributes(JSONObject atts) {
		// TODO Auto-generated method stub

	}
	public void deleteElement(int index) {
		JSONArray children = (JSONArray)((JSONObject)this.jsonobj).get("ps");
		children.remove(index);		
	}
	@Override
	public void insertElement(int index, JSONObject element){
		JSONArray children = (JSONArray)((JSONObject)this.jsonobj).get("ps");
		children.add(index, element);
	}

}
