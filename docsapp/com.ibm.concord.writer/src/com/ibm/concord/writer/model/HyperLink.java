package com.ibm.concord.writer.model;

import com.ibm.json.java.JSONObject;

public class HyperLink extends InlineObject {

	public HyperLink(JSONObject jsonobj) {
		super(jsonobj);
		// TODO Auto-generated constructor stub
	}

	public void setStyle(JSONObject styles) {

	}

	public void setAttributes(JSONObject atts) {
		Object obj = atts.get("src");
		if( obj != null ){
			String src = obj.toString();
			if ( src!=null  ) {
				this.jsonobj.put("src", src);
			}
		}
		obj =  atts.get("anchor");
		if( obj != null ){
			String anchor = obj.toString();
			this.jsonobj.put("anchor", anchor);
		}
	}
}
