/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* U.S. Government Users Restricted Rights: Use, duplication or      */
/* disclosure restricted by GSA ADP Schedule Contract with IBM Corp. */
/*                                                                   */
/* ***************************************************************** */

dojo.provide("pres.test.ut.utils.ut_basic_edit");

//dojo.require("pres.editor.EditorUtil");
dojo.require("pres.editor.model.Content");
dojo.require("dojo.i18n");

describe("pres.test.ut.editor.ut_basic_edit", function(){
	
	var testPage1 = "slide_id_171";
	var testBoxTextID = "text_box_id_173";
	
	var testData = getTestData("editing_ut_sample.html");
	function _BuildContext(slideID, textBoxID)
	{
		var doc = new pres.model.Document(testData);
		var slideElment = doc.find(slideID);
		var slideDom = dojo.create("div", {
			innerHTML: slideElment.content,
			style: {
				"display": "none"
			}
		}, dojo.body());
		
		var textBoxDom = document.getElementById(textBoxID);
		
		var box = {
				domNode : textBoxDom,
				getEditNode : function()
				{
					return this.domNode;
				},
				element : doc.find(textBoxID)
		};
		
		var contentModel = new pres.editor.model.Content();//Store content model
		contentModel.build(box);
		var txtCell = contentModel.getFocusTxtCell();
		
		return {
			contentModel : contentModel,
			txtCell : txtCell,
			textBoxDom : textBoxDom,
			slideDom : slideDom
		};
	};
	
	function _ClearContext(context)
	{
		dojo.destroy(context.slideDom);		
	};
	
	//if bendLineIndex == null means a collapse selection
	function _setTxtSelection(context,startLineIndex, startTextOffset, endLineIndex, endTextOffset)
	{		
		var selInfo = {
				bCollapsed : (endLineIndex == null),
				startSelection : {lineIndex:startLineIndex,lineTextOffset:startTextOffset},
				endSelection : (endLineIndex == null)?null:{lineIndex:endLineIndex,lineTextOffset:endTextOffset}
		};
		context.txtCell.updateTxtSelection(selInfo);
	};
	
	it("buildmodel", function(){

		var context = _BuildContext(testPage1,testBoxTextID);
		//==================================
				
		expect(context.txtCell.paragraphs.length).toBe(19);
		
		//=========================
		_ClearContext(context);
	});
	
	
	it("delete selected word", function(){
		var context = _BuildContext(testPage1,testBoxTextID);
		//==================================
		_setTxtSelection(context,1,5,1,15);
		context.txtCell.handleDetete();
		var para = context.txtCell.paragraphs[1];
		expect(para.strContent).toBe("With line 1");
		//=========================
		_ClearContext(context);
	});
	
	it("delete text by backspace", function(){
		var context = _BuildContext(testPage1,testBoxTextID);
		//==================================
		_setTxtSelection(context,2,3);
		context.txtCell.handleDetete(true);
		var para = context.txtCell.paragraphs[2];
		expect(para.strContent).toBe("Nubering 2");
		//=========================
		_ClearContext(context);
	});
	
	it("delete line", function(){
	});
	
	it("insert text", function(){
	});
	
	it("insert line", function(){
	});
	
	it("set text style", function(){
	});
	
	it("indent line", function(){
	});
	
	it("outdent line", function(){
	});
	
	it("enable list", function(){
	});
	
	it("disable list", function(){
	});
	
	it("change list style", function(){
	});
	
	it("Create hyperlink website", function(){
		var context = _BuildContext(testPage1,testBoxTextID);
		//==================================
		_setTxtSelection(context,1,5,1,15);
		var url = "www.baidu.com";
		context.txtCell.insertChangeHyperLink(url);
		var strRe = context.txtCell.getCurHyperLink();
		expect(strRe).toBe(url);
		//=========================
		_ClearContext(context);
	});
	
	it("Create hyperlink email", function(){
		var context = _BuildContext(testPage1,testBoxTextID);
		//==================================
		_setTxtSelection(context,1,5,1,15);
		var url = "mailto:a@c.com?subject=title";
		context.txtCell.insertChangeHyperLink(url);
		var strRe = context.txtCell.getCurHyperLink();
		expect(strRe).toBe(url);
		//=========================
		_ClearContext(context);
	});
	
	it("Create hyperlink slide pre/next/last/first", function(){
		var context = _BuildContext(testPage1,testBoxTextID);
		//==================================
		_setTxtSelection(context,1,5,1,15);
		var url = "previousslide";
		context.txtCell.insertChangeHyperLink(EditorUtil.STR_XLINK + url);
		var strRe = context.txtCell.getCurHyperLink();
		expect(strRe).toBe(EditorUtil.STR_XLINK + "ppaction://hlinkshowjump?jump="+url);
		//=========================
		_ClearContext(context);
	});
	
	it("Create hyperlink slide by ID", function(){
		var context = _BuildContext(testPage1,testBoxTextID);
		//==================================
		_setTxtSelection(context,1,5,1,15);
		var url = "slide_id_888";
		context.txtCell.insertChangeHyperLink(EditorUtil.STR_XLINK + url);
		var strRe = context.txtCell.getCurHyperLink();
		expect(strRe).toBe(EditorUtil.STR_XLINK + "slideaction://?"+url);
		//=========================
		_ClearContext(context);
	});
	
	it("remove hyperlink", function(){
		
		var context = _BuildContext(testPage1,testBoxTextID);
		//==================================
		_setTxtSelection(context,1,5,1,15);
		var url = "slide_id_888";
		context.txtCell.insertChangeHyperLink(EditorUtil.STR_XLINK + url);
		var strRe = context.txtCell.getCurHyperLink();
		expect(strRe).toBe(EditorUtil.STR_XLINK + "slideaction://?"+url);
		
		context.txtCell.insertChangeHyperLink();
		var strRe = context.txtCell.getCurHyperLink();
		expect(strRe).toBe(null);
		//=========================
		_ClearContext(context);
		
	});
	
	it("set lineSpace", function(){
		var context = _BuildContext(testPage1,testBoxTextID);
		//==================================
		_setTxtSelection(context,1,5,1,15);
		context.txtCell.setLineSpaceValue("2.345");
		var para = context.txtCell.paragraphs[1];
		expect(Math.round(parseFloat(para.lineHeight)/1.2558*100)/100).toBe(2.35);
		//==================================
		_setTxtSelection(context,2,5,null,null);
		context.txtCell.setLineSpaceValue("3.451");
		var para = context.txtCell.paragraphs[2];
		expect(Math.round(parseFloat(para.lineHeight)/1.2558*100)/100).toBe(3.45);
		//==================================
		_setTxtSelection(context,1,5,2,5);
		context.txtCell.setLineSpaceValue("4");
		var para1 = context.txtCell.paragraphs[1];
		var para2 = context.txtCell.paragraphs[2];
		expect(Math.round(parseFloat(para.lineHeight)/1.2558*100)/100).toBe(4);
		expect(Math.round(parseFloat(para.lineHeight)/1.2558*100)/100).toBe(4);
		_ClearContext(context);		
	});
});