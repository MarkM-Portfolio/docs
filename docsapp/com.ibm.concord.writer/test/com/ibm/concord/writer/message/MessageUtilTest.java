package com.ibm.concord.writer.message;

import java.io.File;
import java.io.FileReader;
import java.io.IOException;

import junit.framework.TestCase;

import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

public class MessageUtilTest extends TestCase {
	public void testGetByPath() throws IOException {
		File f = new File("test/settings.json");
		FileReader fr = new FileReader(f);

		JSONObject source = JSONObject.parse(fr);
		JSONArray arr = new JSONArray();
		arr.add("sects");
		JSONObject idkey = new JSONObject();
		idkey.put("id", "defalut");
		arr.add(idkey);
		arr.add("pgSz");
		JSONObject obj = MessageUtil.getJsonByPath(source, arr);
		assertEquals(obj.get("w"), "576.0pt");

		// getJsonByPath can't return the basic type
		arr.add("w");
		obj = MessageUtil.getJsonByPath(source, arr);
		assertEquals(obj, null);

	}

}
