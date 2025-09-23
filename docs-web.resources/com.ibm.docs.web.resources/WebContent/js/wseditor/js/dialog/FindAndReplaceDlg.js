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

dojo.provide("websheet.dialog.FindAndReplaceDlg");
dojo.require("concord.widgets.LotusTextButton");
dojo.require("dijit.Dialog");
dojo.require("dojo.i18n");
dojo.require("dijit.form.Select");
dojo.requireLocalization("websheet.widget","FindReplaceHandler");

dojo.declare("websheet.dialog.FindAndReplaceDlg", [concord.widgets.concordDialog], {	
	
	findString : "",
	replaceString : "",
	findBtn: null,
	replaceBtn: null,
	replaceAllBtn: null,
	_matchCase : false,
	_backwards : false,
	_matchCell : false,
	_searchAllSheets: false,
	_searchFormula: false,
	isCalcDone: true,
	
	MATCH_CASE: 'Match case',
	BACKWARD: 'Backwards',
	MATCHCELL: 'Match cell',
	SEARCH_ALL_SHEETS: 'Search all sheets',
	SEARCH_FORMULA: 'Search Formula',
	FIND_LABEL: 'Find',
	REPLACE_LABEL: 'Replace',
	REPLACEALL_LABEL: 'Replace All',
	handler: null, // find replace handler
	constructor: function () {
		this.dialog.attr("title", this.concordTitle);
	},
	setDialogID: function() {
		// Overridden
		this.dialogId="S_d_FindAndReplaceDlg";
		this.findInputBoxID="S_d_FindAndReplaceDlgFindTxt";
		this.replaceInputBoxID="S_d_FindAndReplaceDlgReplaceTxt";
		this.findBtnID="S_d_FindAndReplaceDlgFind";
		this.replaceBtnID="S_d_FindAndReplaceDlgReplace";
		this.replaceAllBtnID="S_d_FindAndReplaceDlgReplaceAll";
		this.matchCaseBoxID="S_d_FindAndReplaceDlgMatchCase";
		this.matchCellBoxID="S_d_FindAndReplaceDlgMatchCell";
		this.searchAllSheetsBoxID="S_d_FindAndReplaceDlgSearchAll";
		return;
	},
	createContent: function (contentDiv) {
		this.handler = this.editor.getFindReplaceHdl();
		var nls = dojo.i18n.getLocalization("websheet.widget","FindReplaceHandler");
		this.MATCH_CASE = nls.MATCH_CASE;
		this.BACKWARD = nls.BACKWARD;
		this.MATCHCELL = nls.MATCHCELL;
		this.SEARCH_ALL_SHEETS = nls.SEARCH_ALL_SHEETS;
		this.SEARCH_FORMULA = nls.SEARCH_FORMULA;
		this.FIND_LABEL = nls.FIND_LABEL;
		this.REPLACE_LABEL = nls.REPLACE_LABEL;
		this.REPLACEALL_LABEL = nls.REPLACEALL_LABEL;
		
		var headerTable = dojo.create('table', null, contentDiv);
		dijit.setWaiRole(headerTable,'presentation');
		var headerTbody	= dojo.create('tbody', null, headerTable);
		var headerTR1 = dojo.create('tr', null, headerTbody);
		var headerTR1TD1 = dojo.create('td', null, headerTR1);
		var headerTR1TD2 = dojo.create('td', null, headerTR1);
		var headerTR1TD3 = dojo.create('td', null, headerTR1);
		if(!this.editor.scene.isViewMode()){
			var headerTR2 = dojo.create('tr', null, headerTbody);
			var headerTR2TD1 = dojo.create('td', null, headerTR2);
			var headerTR2TD2 = dojo.create('td', null, headerTR2);
			var headerTR2TD3 = dojo.create('td', null, headerTR2);
		}
		var headerTR3 = dojo.create('tr', null, headerTbody);
		var headerTR3TD1 = dojo.create('td', null, headerTR3);
		var headerTR3TD2 = dojo.create('td', null, headerTR3);
		var headerTR3TD3 = dojo.create('td', null, headerTR3);
		
		var headerTR4 = dojo.create('tr', null, headerTbody);
		var headerTR4TD1 = dojo.create('td', null, headerTR4);
		var headerTR4TD2 = dojo.create('td', null, headerTR4);
		var headerTR4TD3 = dojo.create('td', null, headerTR4);
		
		var headerLabel = dojo.create('label', null, headerTR1TD1);
		headerLabel.appendChild(dojo.doc.createTextNode(this.FIND_LABEL));
		dojo.attr(headerLabel,'for',this.findInputBoxID);
		
		
		var findInput = new dijit.form.TextBox({value:this.findString, intermediateChanges:true,id: this.findInputBoxID});
		if (BidiUtils.isBidiOn()){
			this.bidiDir = BidiUtils.getTextDir();
			if (this.bidiDir != ""){
				if (this.bidiDir != "contextual")
					dojo.attr(findInput, "dir", this.bidiDir);
			}
		}else
			this.bidiDir = "";
		dojo.connect(findInput, "onChange", dojo.hitch( this, function()
		{
			this.findString = findInput.attr("value");
			if (!this.hideWarnMsg) 
				this.setWarningMsg("");
			if(this.bidiDir == "contextual"){
				findInput.focusNode.dir = BidiUtils.calculateDirForContextual(this.findString);
			}
		}));
		dojo.connect(findInput.domNode, "onkeypress", dojo.hitch(this,this._onFindInputKeyDown));
		dojo.addClass (findInput.domNode, "inputBox");
		headerTR1TD2.appendChild(findInput.domNode);
		findInput.attr("onFocus", function() { findInput.focusNode.select(); });
		
	    this.findBtn = new concord.widgets.LotusTextButton({label: this.FIND_LABEL,id: this.findBtnID});
	    headerTR1TD3.appendChild(this.findBtn.domNode);
	   
	    if(!this.editor.scene.isViewMode()){
			var headerLabe2 = dojo.create('label', null, headerTR2TD1);
			headerLabe2.appendChild(dojo.doc.createTextNode(this.REPLACE_LABEL));
			dojo.attr(headerLabe2,'for',this.replaceInputBoxID);
			
			var replaceInput = new dijit.form.TextBox({value:this.replaceString, intermediateChanges:true,id: this.replaceInputBoxID});
			if (this.bidiDir != ""){
				if (this.bidiDir != "contextual")
					dojo.attr(replaceInput, "dir", this.bidiDir);
			}
				
			dojo.connect(replaceInput, "onChange", dojo.hitch( this, function(){
															this.replaceString = replaceInput.attr("value");
															if(this.bidiDir == "contextual"){
																replaceInput.focusNode.dir = BidiUtils.calculateDirForContextual(this.replaceString);
															}
														}));
			dojo.connect(replaceInput.domNode, "onkeypress", dojo.hitch(this,this._onFindInputKeyDown));
			dojo.addClass (replaceInput.domNode, "inputBox");		
			headerTR2TD2.appendChild(replaceInput.domNode);
			replaceInput.attr("onFocus", function() { replaceInput.focusNode.select(); });
			
			this.replaceBtn = new concord.widgets.LotusTextButton({label: this.REPLACE_LABEL,id: this.replaceBtnID});
			this.replaceAllBtn = new concord.widgets.LotusTextButton({label: this.REPLACEALL_LABEL,id:this.replaceAllBtnID});
			headerTR2TD3.appendChild(this.replaceBtn.domNode);
			headerTR3TD3.appendChild(this.replaceAllBtn.domNode);
			
			
		}
		
	
		
		var matchCaseBox = new dijit.form.CheckBox({checked: false,id:this.matchCaseBoxID});
		dojo.connect(matchCaseBox, "onChange", dojo.hitch( this,function(){ this._matchCase = matchCaseBox.checked;}));
		
		//var backwardBox = new dijit.form.CheckBox({checked: false});
		//dojo.connect(backwardBox, "onChange", dojo.hitch( this,function(){ this._backwards = backwardBox.checked;}));
		
		var matchCellBox = new dijit.form.CheckBox({checked: false,id:this.matchCellBoxID});
		dojo.connect(matchCellBox, "onChange", dojo.hitch( this,function(){	this._matchCell = matchCellBox.checked;}));
		
		var searchAllSheetsBox = new dijit.form.CheckBox({checked: false,id:this.searchAllSheetsBoxID});
		dojo.connect(searchAllSheetsBox, "onChange", dojo.hitch( this,function(){this._searchAllSheets = searchAllSheetsBox.checked;}));
		
		//var searchFormulaBox = new dijit.form.CheckBox({checked: false});
		//dojo.connect(searchFormulaBox, "onChange", dojo.hitch( this,function(){	this._searchFormula = searchFormulaBox.checked;}));

		headerTR3TD2.appendChild(matchCaseBox.domNode);
		var mLabel = this.createLabel(headerTR3TD2,this.MATCH_CASE);
		dojo.attr(mLabel, 'for', this.matchCaseBoxID);
		//headerTR3TD2.appendChild(dojo.doc.createTextNode(this.MATCH_CASE));
		dojo.create('br', null, headerTR3TD2);
		//headerTR3TD2.appendChild(backwardBox.domNode);
		//headerTR3TD2.appendChild(dojo.doc.createTextNode(this.BACKWARD));
		//dojo.create('br', null, headerTR3TD2);
		headerTR3TD2.appendChild(matchCellBox.domNode);
		mLabel = this.createLabel(headerTR3TD2,this.MATCHCELL);
		dojo.attr(mLabel, 'for', this.matchCellBoxID);
		if(BidiUtils.isGuiRtl() && dojo.isIE)//hack for IE problem with set of check buttons in 'rtl' block
			dojo.attr(mLabel,"dir","rtl");
		//headerTR3TD2.appendChild(dojo.doc.createTextNode(this.MATCHCELL));
		dojo.create('br', null, headerTR3TD2);
		
		headerTR3TD2.appendChild(searchAllSheetsBox.domNode);
		mLabel = this.createLabel(headerTR3TD2,this.SEARCH_ALL_SHEETS);
		dojo.attr(mLabel, 'for', this.searchAllSheetsBoxID);		
		if(BidiUtils.isGuiRtl() && dojo.isIE)
			dojo.attr(mLabel,"dir","rtl");
				
		var sheetsName = this._getSheetsName();
		var sheetContr = dojo.create('div', null, headerTR4TD2);
		dojo.style(sheetContr, "width", "15em");
		dojo.style(sheetContr, "position", "relative");
		dojo.style(sheetContr, "left", "15px");
		this.sheetsLabel = this.createLabel(sheetContr,sheetsName);
		

		//headerTR3TD2.appendChild(dojo.doc.createTextNode(this.SEARCH_ALL_SHEETS));
		dojo.create('br', null, headerTR3TD2);
		//headerTR3TD2.appendChild(searchFormulaBox.domNode);
		//headerTR3TD2.appendChild(dojo.doc.createTextNode(this.SEARCH_FORMULA));
		//dojo.create('br', null, headerTR3TD2);
		
		dojo.connect(this.findBtn, "onClick", dojo.hitch(this, "_find"));
		if(!this.editor.scene.isViewMode()){
			dojo.connect(this.replaceBtn, "onClick", dojo.hitch(this, "_replace"));
			dojo.connect(this.replaceAllBtn, "onClick", dojo.hitch(this, "_replaceAll"));
		}
		
		//calculate width for buttons, will use the biggest value
		var list = [this.FIND_LABEL,this.REPLACE_LABEL,this.REPLACEALL_LABEL];
		var width = 10;
		dojo.forEach(list, function(entry){
			if(entry && width < entry.length){
				width = entry.length;
			}
		});
		dojo.query('button', headerTable).style('width', width*0.75+'em');
		
	},
	
	createLabel: function(parentNode,textValue)
	{
		var temp=dojo.create('label',null,parentNode);
		temp.appendChild(dojo.doc.createTextNode(textValue));
		return temp;
	},
		
	postCreate: function()
	{	
	    var msgId = this.warnMsgID + this.dialogId;
        var msgDiv = dojo.byId(msgId);
        if(msgDiv!=null)
        	dojo.style(msgDiv, {
        		"width" : "350px",
        		"maxHeight" : "150px",
				"wordWrap" : "break-word",
				"wordBreak" : "break-word"});
	},
	
	setWarningMsg: function(msg)
	{
		this.inherited(arguments);
		var msgId = this.warnMsgID + this.dialogId;
		var msgDiv = dojo.byId(msgId);
		if (msgDiv && msgDiv.scrollHeight >= 150) {
			msgDiv.style.overflowY = "scroll";
		} else {
			msgDiv.style.overflowY = "";
		}
	},
	
	_onFindInputKeyDown: function(e){
		if (e.altKey || e.ctrlKey || e.metaKey) 
			return;
			
		if (e.keyCode == dojo.keys.ENTER) 
			this._find();
	},	
	
	onOk: function (editor) {
		
	},
	
	onCancel: function (editor) {
		return true;
	},
	
	reset: function (){
		// reset input box and warning message
		this.setWarningMsg("");
		this.handler._reset();
		this.isCalcDone = false;
		//dijit.byId(this.findInputBoxID).setAttribute("value","");
		//dijit.byId(this.replaceInputBoxID).setAttribute("value","");
		if (this.editor.getDocumentObj().getLoadedSheets().length > 0) {
			var sheetsName = this._getSheetsName();
			this.sheetsLabel.innerHTML = sheetsName;
			dijit.byId(this.searchAllSheetsBoxID).setAttribute('disabled', false);
		}
		else {
			this.sheetsLabel.innerHTML = '';
			dijit.byId(this.searchAllSheetsBoxID).setAttribute('disabled', true);
		}
	},	
	
	_find: function()
	{
		if(!this.isCalcDone && this._searchFormula){
			var func = dojo.hitch(this, "_postFind");
			this.handler._doCalc(func);
		}else
			this._postFind();
	},
	
	_postFind:function(){
		this.setWarningMsg("");		
		this.handler.setMatchOption({matchCase: this._matchCase, matchCell: this._matchCell, searchAllSheet: this._searchAllSheets, searchFormula: this._searchFormula,backwards: this._backwards});
		this.handler.findText(this.findString);
		setTimeout( dojo.hitch(this,function(){dijit.byId(this.findBtnID).focus();}), 50 );
	},
	
	_replace: function(){
		if(!this.isCalcDone && this._searchFormula){
			var func = dojo.hitch(this, "_postReplace");
			this.handler._doCalc(func);
		}else
			this._postReplace();
	},
	
	_postReplace:function(){
		this.setWarningMsg("");
		this.handler.setMatchOption({matchCase: this._matchCase, matchCell: this._matchCell, searchAllSheet: this._searchAllSheets, searchFormula: this._searchFormula,backwards: this._backwards});
		this.handler.replaceText(this.findString,this.replaceString);
		setTimeout( dojo.hitch(this,function(){dijit.byId(this.replaceBtnID).focus();}), 150 );
	},
	
	_replaceAll: function(){
		if(!this.isCalcDone && this._searchFormula){
			var func = dojo.hitch(this, "_postReplaceAll");
			this.handler._doCalc(func);
		}else
			this._postReplaceAll();
	},
	
	_postReplaceAll:function(){
		this.setWarningMsg("");
		this.handler.setMatchOption({matchCase: this._matchCase, matchCell: this._matchCell, searchAllSheet: this._searchAllSheets, searchFormula: this._searchFormula,backwards: this._backwards});
		this.handler.replaceAllText(this.findString,this.replaceString);
	},
	
	_getSheetsName: function() {
		var sheets = this.editor.getDocumentObj().getLoadedSheets();
		var str = "(";
		for (var i=0; i<sheets.length; i++) {
			if (i != 0)
				str += ", ";
			str += sheets[i]._name;
		}
		str += ")";
		return websheet.Helper.escapeXml(str);
	}
});