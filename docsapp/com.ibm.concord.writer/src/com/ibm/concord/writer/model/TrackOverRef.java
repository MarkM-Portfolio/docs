package com.ibm.concord.writer.model;

import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

public class TrackOverRef extends Run{

	TrackOverRef(JSONObject jsonobj) {
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
      boolean deleted = isTrackDeleted(chs, time, true);
      if (chs == null || chs.isEmpty())
        this.jsonobj.remove("ch");
      return deleted;
	}
}
