package com.ibm.concord.writer.model;

import java.io.File;
import java.io.FileReader;
import java.io.IOException;

import com.ibm.concord.writer.TrackChangeCleaner;
import com.ibm.concord.writer.message.impl.TestMsgUtil;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

public class TrackChangeTest extends TestMsgUtil {
	public void testSetStyle() throws IOException{
		
		 File f = new File("test/tc2.json");
		 FileReader fr = new FileReader(f);
		 JSONObject source = JSONObject.parse(fr);
		 JSONArray body = (JSONArray) source.get("body");
		 TrackChangeCleaner.clean(body, System.currentTimeMillis());
		 System.out.println(body.toString());
		
	}
	
	
}
