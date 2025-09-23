package com.ibm.concord.writer.model;

import com.ibm.concord.writer.TrackChangeCleaner;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

public class TrackDeletedObjs extends Run{

	TrackDeletedObjs(JSONObject jsonobj) {
		super(jsonobj);
	}
	
	@Override
	int getLength() {
		return 1;
	}
	
	@Override
	boolean isSepObj()
	{
	  return true;
	}
	
	@Override
	public boolean checkTrackChange(long time)
	{
	    Object chsObj = this.jsonobj.get("ch");
	    if (chsObj == null || chsObj instanceof String)
	      return false;
	    JSONArray chs = (JSONArray)chsObj;
		boolean deleted = isTrackDeleted(chs, time, false);
		if (deleted)
		  this.jsonobj.remove("ch");
		else
		{
			Object objs = this.jsonobj.get("objs");
			if (objs != null)
			{
				JSONArray arr = (JSONArray)objs;
				TrackChangeCleaner.clean(arr, time);
				this.jsonobj.put("objs", arr);
			}
		}
		
		return deleted;
	}
}
