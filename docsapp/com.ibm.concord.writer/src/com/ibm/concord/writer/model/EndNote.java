package com.ibm.concord.writer.model;

import com.ibm.json.java.JSONObject;

public class EndNote extends TextRun {
	EndNote(JSONObject jsonobj) {
		super(jsonobj);
		this.jsonobj.remove("an");
		this.modelType = RUN_ENDNOTE;
	}
}
