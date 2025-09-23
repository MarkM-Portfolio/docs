package com.ibm.concord.writer.model;

import com.ibm.json.java.JSONObject;

public class BookMark extends TextRun {

	int start = -1;
	BookMark(JSONObject jsonobj) {
		super(jsonobj);
		this.modelType = BOOKMARK;
	}
	
	@Override
	int getLength() {
		return 0;
	}
	
	@Override
	void setLength(int len) {
	}
	
	@Override
	void setStart(int start){
		this.start = start;
	}
	@Override
	int getStart(){
		return this.start;
	}
	
	@Override
	boolean isSameObject(ModelObject obj){	
		return false;
	}
	
	boolean setAttributes(int index, int length, JSONObject styles, HintList hintList) {
	    if (length == 0 && index  == this.getStart())
	    {
	    	this.setAttributes(styles);
	    	return true;
	    }
	    return false;
	}
}
