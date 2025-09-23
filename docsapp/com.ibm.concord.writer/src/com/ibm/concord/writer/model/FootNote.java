package com.ibm.concord.writer.model;

import com.ibm.json.java.JSONObject;

public class FootNote extends TextRun {
	/**
	 * constructor
	 * @param jsonobj
	 */
	FootNote(JSONObject jsonobj) {
		super(jsonobj);
		this.jsonobj.remove("an");
		this.modelType = RUN_FOOTNOTE;
	}

}
