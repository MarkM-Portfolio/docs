package com.ibm.concord.writer.message.impl;

import java.io.IOException;

import com.ibm.concord.writer.model.Paragraph;
import com.ibm.json.java.JSONObject;

public class ParagraphTest extends TestMsgUtil {
	public void testInit() throws IOException{
		String old = "{'pPr':{},'c':'','t':'p','rPr':{},'id':'1','fmt':[{'style':{},'rt':'rPr','s':'0','l':'-18'}]}]}";
		String expect = "{'pPr':{},'c':'','t':'p','rPr':{},'id':'1','fmt':[]}";
		Paragraph para = new Paragraph( JSONObject.parse(old) );
		assertEquals( JSONObject.parse(expect), para.getJson());
	}
	
	public void testInit2() throws IOException{
		String old = "{'pPr':{},'c':'a','t':'p','rPr':{},'id':'1','fmt':[{'style':{},'rt':'rPr','s':'1','l':'-18'}]}]}";
		String expect = "{'pPr':{},'c':'a','t':'p','rPr':{},'id':'1','fmt':[{'style':{},'rt':'rPr','s':'0','l':'1'}]}";
		Paragraph para = new Paragraph( JSONObject.parse(old) );
		assertEquals( JSONObject.parse(expect), para.getJson());
	}
	
	public void testInit3() throws IOException{
		String old = "{'pPr':{},'c':'a','t':'p','rPr':{},'id':'1','fmt':[{'style':{},'rt':'rPr','s':'1','l':'-18'}]},{'style':{},'rt':'rPr','s':'3','l':'1'}]}]}";
		String expect = "{'pPr':{},'c':'a','t':'p','rPr':{},'id':'1','fmt':[{'style':{},'rt':'rPr','s':'0','l':'1'}]}";
		Paragraph para = new Paragraph( JSONObject.parse(old) );
		assertEquals( JSONObject.parse(expect), para.getJson());
	}
}
