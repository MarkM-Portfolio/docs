package com.ibm.concord.writer.message.impl;

import java.io.IOException;

import junit.framework.TestCase;

import com.ibm.json.java.JSONObject;

public class TestMsgUtil extends TestCase{
	
	 static void testInsertTextApply(String doc, String act, String restult) {
			try {
				JSONObject fakeDocument = JSONObject.parse(doc);
				JSONObject fakeOperation = JSONObject.parse(act);
				JSONObject resultJson = JSONObject.parse(restult);
				
				
				InsertText insertText = new InsertText( fakeOperation);
				try {
					insertText.apply(fakeDocument);
				} catch (Exception e) {
					e.printStackTrace();
				}
				
				assertEquals( resultJson.get("body"), fakeDocument.get("body"));
			} catch (IOException e) {
				e.printStackTrace();
			}
		}
	 
	 static void testApplyStyle(String doc, String act, String result) {
			try {
				JSONObject fakeDocument = JSONObject.parse(doc);
				JSONObject fakeOperation = JSONObject.parse(act);
				JSONObject resultJson = JSONObject.parse(result);
				
				
				ApplyStyle operate = new ApplyStyle( fakeOperation);
				try {
					operate.apply(fakeDocument);
				} catch (Exception e) {
					e.printStackTrace();
				}
				
				assertEquals( resultJson.get("body"), fakeDocument.get("body"));
			} catch (IOException e) {
				e.printStackTrace();
			}
		}
}
