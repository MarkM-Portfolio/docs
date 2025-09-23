package com.ibm.concord.writer.message.impl;

public class ApplyStyleTest extends TestMsgUtil {
	public void testSetStyle(){
		String act = "{'tid':'1','t':'sta','idx':12,'len':3,'st':{'font-weight':'normal'}}";
		String org = "{'body':[{'c':'Test Link element','t':'p','id':'1','fmt':[{'rt':'rPr','s':'0','l':'5'},{'rt':'hyperlink','s':'5','history':'1','src':'http://www.ibm.com','id':'2','s':'5','l':'4','fmt':[{'rt':'rPr','style':{'styleId':'Hyperlink'},'s':'5','l':'4'}]},{'rt':'rPr','s':'9','l':'1'},{'rt':'rPr','style':{'font-weight':'bold'},'s':'10','l':'7'}]}]}";
		String result = "{'body':[{'fmt':[{'rt':'rPr','s':'0','l':'5'},{'fmt':[{'style':{'styleId':'Hyperlink'},'rt':'rPr','s':'5','l':'4'}],'id':'2','rt':'hyperlink','src':'http://www.ibm.com','s':'5','l':'4','history':'1'},{'rt':'rPr','s':'9','l':'1'},{'style':{'font-weight':'bold'},'rt':'rPr','s':'10','l':'2'},{'style':{'font-weight':'normal'},'rt':'rPr','s':'12','l':'3'},{'style':{'font-weight':'bold'},'rt':'rPr','s':'15','l':'2'}],'c':'Test Link element','t':'p','id':'1'}]}";
		testApplyStyle(org, act, result);
	}
	
	public void testSetStyleInLink(){
		String act ="{'tid':'1','t':'sta','idx':6,'len':2,'st':{'font-weight':'bold','styleId':'Hyperlink'}}";
		String org = "{'body':[{'c':'Test Link element','t':'p','id':'1','fmt':[{'rt':'rPr','s':'0','l':'5'},{'rt':'hyperlink','s':'5','history':'1','src':'http://www.ibm.com','id':'2','s':'5','l':'4','fmt':[{'rt':'rPr','style':{'styleId':'Hyperlink'},'s':'5','l':'4'}]},{'rt':'rPr','s':'9','l':'1'},{'rt':'rPr','style':{'font-weight':'bold'},'s':'10','l':'7'}]}]}";
		String result = "{'body':[{'fmt':[{'rt':'rPr','s':'0','l':'5'},{'fmt':[{'style':{'styleId':'Hyperlink'},'rt':'rPr','s':'5','l':'1'},{'style':{'font-weight':'bold','styleId':'Hyperlink'},'rt':'rPr','s':'6','l':'2'},{'style':{'styleId':'Hyperlink'},'rt':'rPr','s':'8','l':'1'}],'id':'2','rt':'hyperlink','src':'http://www.ibm.com','s':'5','l':'4','history':'1'},{'rt':'rPr','s':'9','l':'1'},{'style':{'font-weight':'bold'},'rt':'rPr','s':'10','l':'7'}],'c':'Test Link element','t':'p','id':'1'}]}";
		testApplyStyle(org, act, result);
	}
	
}
