package com.ibm.concord.writer.message.impl;

import java.io.File;
import java.io.FileReader;

import junit.framework.TestCase;

import com.ibm.concord.writer.message.MessageUtil;
import com.ibm.concord.writer.message.Operation;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

public class OperationTest  extends TestCase{
	public void testModifyMeta() throws Exception{
		JSONObject act = new JSONObject();
		JSONArray arr = new JSONArray();
		  arr.add("sects");
		  JSONObject idkey = new JSONObject();
		  idkey.put("id", "defalut");
		  arr.add(idkey);
		  arr.add("pgSz");
		
		 act.put(Operation.PATH, arr);
		  JSONObject content = new JSONObject();
		  content.put("w", "newresult");
		 act.put(Operation.CONTENT, content);
		  
		//create a modifymeta operation
//		ModifyMeta meta = new ModifyMeta(act);
//		 File f = new File("test/settings.json");
//		 FileReader fr = new FileReader(f);
//		
//		 JSONObject source = JSONObject.parse(fr);
//		meta.apply(source);
		 
//		JSONObject result = MessageUtil.getJsonByPath(source, arr);
//		 assertEquals(result.get("w"),"newresult");
		  
	 }
	
	public void testSetAttribute() throws Exception{

		JSONObject act = new JSONObject();
		
		 act.put(Operation.TYPE, "sa");
		 act.put(Operation.TARGET, "id_9374102045964021");
		 JSONObject st = new JSONObject();
		 st.put("type", "meta"); 
		 JSONObject content = new JSONObject();
		 content.put("secId", "");
		 st.put("content",content);
		 
		 act.put("st", st);
		
		//create a modifymeta operation
		 SetAttribute meta = new SetAttribute(act);
		 File f = new File("test/content.json");
		 FileReader fr = new FileReader(f);
		
		 JSONObject source = JSONObject.parse(fr);
		meta.apply(source);
		JSONObject newModel = MessageUtil.getById(source, "id_9374102045964021");
		JSONObject newPpr = (JSONObject)newModel.get("pPr");
		 assertEquals(newPpr.get("secId"),null);
		  
	}
	
	public void testApplyStyle() throws Exception{
		JSONObject fakeObj = new JSONObject();
		JSONArray styles=  new JSONArray();
		JSONObject style = new JSONObject();
		fakeObj.put("tid", "id_9629262340849954");
		fakeObj.put("idx", 3);
		fakeObj.put("len", 6);
		fakeObj.put("r", 0);
		fakeObj.put("t", "sta");
		style.put("u", 1);
		styles.add(style);
		style = new JSONObject();
		style.put("u", 1);
		styles.add(style);
		fakeObj.put("st",styles);
		
		ApplyStyle aps = new ApplyStyle(fakeObj);
		File f = new File("test/content.json");
		FileReader fr = new FileReader(f);
		JSONObject source = JSONObject.parse(fr);
		aps.apply(source);
		
		JSONObject newModel = MessageUtil.getById(source, fakeObj.get("tid").toString());
		JSONArray fmt = (JSONArray)newModel.get("fmt");
		JSONObject targetRun=null;
		int i=0;
		for(;i<fmt.size();i++){
			targetRun = (JSONObject) fmt.get(i);
			if(Integer.parseInt(targetRun.get("s").toString())==3) break;
		}
		assertEquals(2,targetRun.get("l"));
		JSONObject targetStyle = (JSONObject)targetRun.get("style");
		assertEquals(1,targetStyle.get("u"));
		
		targetRun = (JSONObject)fmt.get(++i);
		assertEquals(5,targetRun.get("s"));
		assertEquals(4,targetRun.get("l"));
		targetStyle = (JSONObject)targetRun.get("style");
		assertEquals(1,targetStyle.get("u"));
	}
	
	public void testDeleteElement() throws Exception{
		JSONObject fakeObj = new JSONObject();
		fakeObj.put("tid", "id_9629262340849954");
		fakeObj.put("t", Operation.DELETE_ELEMENT);
		
		DeleteElement aps = new DeleteElement( fakeObj );
		File f = new File("test/content.json");
		FileReader fr = new FileReader(f);
		JSONObject source = JSONObject.parse(fr);
		aps.apply(source);
		
		JSONObject element = MessageUtil.getById(source,fakeObj.get("tid").toString());
		assertEquals( null, element );
		
	}
	
	public void testInsertElement(){
		JSONObject fakeObj = new JSONObject();
		fakeObj.put("tid", "id_9629262340849954");
		fakeObj.put("t", Operation.INSERT_ELEMENT);
		//TODO:
		//...
	}
	

}
