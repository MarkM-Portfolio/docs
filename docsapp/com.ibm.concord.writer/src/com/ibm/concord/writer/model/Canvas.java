package com.ibm.concord.writer.model;

import com.ibm.concord.writer.message.MessageUtil;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

public class Canvas extends Image {
	Canvas(JSONObject jsonobj) {
		super(jsonobj);
	}

	void _setImageSize(JSONObject atts)
	{
		Object size = atts.get("size");
		if (size == null || !(size instanceof JSONObject))
			return;
		
		Object anchor = this.jsonobj.get("anchor");
		Object inline = this.jsonobj.get("inline");
		Object graphicData = null;
			
		if (anchor != null && anchor instanceof JSONObject)
		{
			((JSONObject)anchor).put("extent", size);
			graphicData = ((JSONObject)anchor).get("graphicData");
		}
		else  if (inline != null && inline instanceof JSONObject)
		{
			((JSONObject)inline).put("extent", size);
			graphicData = ((JSONObject)inline).get("graphicData");
		}
		
		if (graphicData != null && graphicData instanceof JSONObject)
		{
			JSONArray jArray = new JSONArray();
			jArray.add("wgp");
			jArray.add("grpSpPr");
			jArray.add("xfrm");
			
			JSONObject xfrm = MessageUtil.getJsonByPath((JSONObject)graphicData, jArray);
			if (xfrm != null)
			{
				xfrm.put("ext", size);
			}
		}
	}
}
