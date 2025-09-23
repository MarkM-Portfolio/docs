package com.ibm.concord.writer.message.impl;

public class InsertTextTest  extends TestMsgUtil {
	
	public void testInsertIntoLink(){
		
		String s1 = "{'body':[{'c':'Test Link element','t':'p','id':'1','fmt':[{'rt':'rPr','s':'0','l':'5'},{'rt':'hyperlink','s':'5','history':'1','src':'http://www.ibm.com','id':'2','s':'5','l':'4','fmt':[{'rt':'rPr','style':{'styleId':'Hyperlink'},'s':'5','l':'4'}]},{'rt':'rPr','s':'9','l':'1'},{'rt':'rPr','style':{'font-weight':'bold'},'s':'10','l':'7'}]}]}";
		String s2 = "{'tid':'1','idx':7,'len':1,'t':'it','cnt':{'fmt':[{'fmt':[{'style':{'styleId':'Hyperlink'},'rt':'rPr','s':7,'l':1}],'id':'2','rt':'hyperlink','src':'http://www.ibm.com','s':7,'l':1,'history':'1'}],'c':'a'}}";

		String s3 = "{'body':[{'c':'Test Liank element','t':'p','id':'1','fmt':[{'rt':'rPr','s':'0','l':'5'},{'rt':'hyperlink','s':'5','history':'1','src':'http://www.ibm.com','id':'2','s':'5','l':'5','fmt':[{'rt':'rPr','style':{'styleId':'Hyperlink'},'s':'5','l':'5'}]},{'rt':'rPr','s':'10','l':'1'},{'style':{'font-weight':'bold'},'rt':'rPr','s':'11','l':'7'}]}]}";
		testInsertTextApply(s1, s2, s3);
	}



	public void testInsertIntoEmptyPararaph(){
		String document = "{'body':[{'pPr':{},'c':'','rPr':{},'t':'p','id':'1','fmt':[]}]}";
		String sAction = "{'tid':'1','idx':0,'len':1,'t':'it','cnt':{'fmt':[{'style':{},'rt':'rPr','s':'0','l':'1'}],'c':'a'}}";
		String result = "{'body':[{'pPr':{},'c':'a','rPr':{},'t':'p','id':'1','fmt':[{'style':{},'rt':'rPr','s':'0','l':'1'}]}]}";
		
		testInsertTextApply(document, sAction, result);
	}
	
	public void testInsertIntoToc(){
		String fld = "'fld':[{'fldType':'begin','t':'r','rt':'fld','rsidR':'00803DB0','style':{'t':'rPr','preserve':{'noProof':{},'webHidden':{}}}}," +
				"{'fldType':'instrText','t':'r','rt':'fld','instrText':{'space':'preserve','t':' PAGEREF _Toc356309393 \\\\h '},'rsidR':'00803DB0','style':{'t':'rPr','preserve':{'noProof':{},'webHidden':{}}}},{'t':'r','rt':'rPr','rsidR':'00803DB0','style':{'t':'rPr','preserve':{'noProof':{},'webHidden':{}}}}," +
				"{'fldType':'separate','t':'r','rt':'fld','rsidR':'00803DB0','style':{'t':'rPr','preserve':{'noProof':{},'webHidden':{}}}}," +
				"{'fldType':'end','t':'r','rt':'fld','rsidR':'00803DB0','style':{'t':'rPr','preserve':{'noProof':{},'webHidden':{}}}}]";
		String tabs = "'tabs':[{}]";
		String sdtPr = "'sdtPr':{}";
		String sdtEndPr = "'sdtEndPr':{}";
	//	String tocHeading = "{'t':'p','id':'id_2','pPr':{'styleId':'TOCHeading'},'c':'Contents','fmt':[{'rt':'rPr','s':'0','l':'8'}]}"; 
		
		String document = "{'body':[" +
				"{'t':'sdt','id':'id_1'," + sdtPr + "," + sdtEndPr + "," +
				"'sdtContent':[" +
				"{'t':'p','id':'id_3','pPr':{'styleId':'TOC2'," +
				 tabs+ "},'c':'Heading2\t1','fmt':[{'rt':'hyperlink','anchor':'_Toc1','id':'id_4','fmt':[{'rt':'rPr','style':{'styleId':'Hyperlink'},'s':'0','l':'8'},{'rt':'rPr','style':{},'s':'8','l':'1'},{'s':'9','rt':'fld','id':'id_4','fmt':[{'rt':'rPr','style':{},'s':'9','l':'1'}]," +
				fld + "," + "'l':'1'}],'s':'0','l':'10'}]}," +
				"]}]}";
		String sAct = "{" +
				"'tid' : 'id_3'," +
				"'idx' : 8," +
				"'len' : 1," +
				"'t' : 'it'," +
				"'cnt' : {" +
				"'fmt' : [" +
				" {'fmt' : " +
				"[ {'style' : {'styleId' : 'Hyperlink'},'rt' : 'rPr','s' : 8,'l' : 1} ]," +
				"'id' : 'id_4','rt' : 'hyperlink','anchor' : '_Toc1','s' : 8,'l' : 1} ],'c' : 'a'}}";
		
		
		String result = "{'body':[{'t':'sdt'" +"," + "'id':'id_1'" + "," +
				 sdtPr + "," +
				 sdtEndPr + "," +
				"'sdtContent':[" +
				"{'pPr':{'styleId':'TOC2'," + tabs +"}," +
				 	"'c':'Heading2a\t1'," +
				 	"'t':'p'," +
				 	"'id':'id_3'," +
				 	"'fmt':[" +
				 	"{'rt':'hyperlink','s':'0','anchor':'_Toc1','id':'id_4','l':'11'," +
				 		"'fmt':[" +
				 			"{'style':{'styleId':'Hyperlink'},'rt':'rPr','s':'0','l':'9'}," +
				 			"{'style':{},'rt':'rPr','s':'9','l':'1'}," +
				 			"{'rt':'fld','s':'10'," +
				 			fld +
				 			"," +
				 			"'id':'id_4','l':'1','fmt':[{'style':{},'rt':'rPr','s':'10','l':'1'}]}]}]}" +
				 			"]" +
				 			"," +
				 			"}]}";
		testInsertTextApply(document, sAct, result);
	}
	
	public void testInsertIntoEmptyParagraphWithBookmarks(){
		String doc ="{'body':[{'t':'p','fmt':[{'t':'s','rt':'bmk','name':'_GoBack','id':'0'},{'t':'e','rt':'bmk','id':'0'}],'id':'id_1'}]}";
		String sAct = "{'t':'it','len':10,'cnt':{'c':'abaeageage','fmt':[{'rt':'bmk','t':'s','id':'0','name':'_GoBack'},{'rt':'bmk','t':'e','id':'0','name':''},{'style':{},'rt':'rPr','s':0,'l':1},{'style':{},'rt':'rPr','s':1,'l':1},{'style':{},'rt':'rPr','s':2,'l':1},{'style':{},'rt':'rPr','s':3,'l':1},{'style':{},'rt':'rPr','s':4,'l':1},{'style':{},'rt':'rPr','s':5,'l':1},{'style':{},'rt':'rPr','s':6,'l':1},{'style':{},'rt':'rPr','s':7,'l':1},{'style':{},'rt':'rPr','s':8,'l':1},{'style':{},'rt':'rPr','s':9,'l':1}]},'idx':0,'tid':'id_1'}";
		String result = "{'body':[{'t':'p','c':'abaeageage','fmt':[{'t':'s','rt':'bmk','name':'_GoBack','id':'0'},{'t':'e','rt':'bmk','id':'0'},{'style':{},'rt':'rPr','s':'0','l':'10'}],'id':'id_1'}]}";
		testInsertTextApply(doc, sAct, result);
	}
}