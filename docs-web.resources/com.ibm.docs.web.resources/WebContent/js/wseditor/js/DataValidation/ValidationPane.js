/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2015. All Rights Reserved.          */
/*                                                                   */
/* U.S. Government Users Restricted Rights: Use, duplication or      */
/* disclosure restricted by GSA ADP Schedule Contract with IBM Corp. */
/*                                                                   */
/* ***************************************************************** */
dojo.provide("websheet.DataValidation.ValidationPane");
dojo.require("websheet.widget.CommonPane");
dojo.requireLocalization("websheet.DataValidation","Validation");

dojo.declare("websheet.DataValidation.ValidationPane", websheet.widget.CommonPane,{
	
	_nls: null,
	_title: null,
	_widget: null,
	
	constructor: function (domNode) 
	{
		this.buildAll();
	},
	
	_createHeader: function()
	{
		this._headerNode = dojo.create("div",{style:"padding-top: 5px; padding-bottom: 5px"}, this.domNode);
		this._createTitle();
	},
	
	_createTitle: function()
	{
		this._nls = dojo.i18n.getLocalization("websheet.DataValidation","Validation");
		this._title = dojo.create("div",{innerHTML:this._nls.title, 'class': "validationTitle", role : "heading"}, this._headerNode);
	},
	
	_createContent: function()
	{
		var panel = dojo.create("div", null ,this.domNode);
		this._widget = new websheet.DataValidation.ValidationWidget();
		this._widget.placeAt(panel);
		this._widget.setParent(this);
		
		this._warning = new websheet.DataValidation.ValidationWarning();
		this._warning.placeAt(panel);
	},
	
	resizeSidebar: function()
	{
		this.inherited(arguments);
		var width = this.sidePaneMgr.getWidth();
		if(width == "300"){
			dojo.style(this._headerNode,"marginLeft", "18px");
		}else{
			dojo.style(this._headerNode,"marginLeft", "2.5px");
		}
		var maxListHeight = this.domNode.clientHeight - 300;
		this._widget.resize(width, maxListHeight);
		this._warning.resize(width);
	},
	
	_registerEvents: function()
	{
		dojo.connect(this._warning.removeAll.domNode, "onclick", dojo.hitch(this, "onRemoveAll"));
		dojo.connect(this._warning.cancel.domNode, "onclick", dojo.hitch(this, "onCancel"));
		
		dojo.connect(this._widget.ok.domNode, "onclick", dojo.hitch(this, "onOK"));
		dojo.connect(this._widget.remove.domNode, "onclick", dojo.hitch(this, "onRemove"));
		dojo.connect(this._widget.cancel.domNode, "onclick", dojo.hitch(this, "onCancel"));
		
		dojo.connect(this._widget.input1, "onfocus", dojo.hitch(this, "highlightRef", this._widget.input1));
		dojo.connect(this._widget.input2, "onfocus", dojo.hitch(this, "highlightRef", this._widget.input2));
		dojo.connect(this._widget.input1Date.textbox, "onfocus", dojo.hitch(this, "highlightRef", this._widget.input1Date.textbox));
		dojo.connect(this._widget.input2Date.textbox, "onfocus", dojo.hitch(this, "highlightRef", this._widget.input2Date.textbox));
		
		dojo.connect(this._widget.input1, "onblur", dojo.hitch(this, "hideRangeViewer"));
		dojo.connect(this._widget.input2, "onblur", dojo.hitch(this, "hideRangeViewer"));
		dojo.connect(this._widget.input1Date.textbox, "onblur", dojo.hitch(this, "hideRangeViewer"));
		dojo.connect(this._widget.input2Date.textbox, "onblur", dojo.hitch(this, "hideRangeViewer"));
		
		dojo.connect(this._widget.input1, "onmousedown", dojo.hitch(this, "selectionChanged", this._widget.input1));
		dojo.connect(this._widget.input2, "onmousedown", dojo.hitch(this, "selectionChanged", this._widget.input2));
		dojo.connect(this._widget.input1Date.textbox, "onmousedown", dojo.hitch(this, "selectionChanged", this._widget.input1Date.textbox));
		dojo.connect(this._widget.input2Date.textbox, "onmousedown", dojo.hitch(this, "selectionChanged", this._widget.input2Date.textbox));
		
		dojo.connect(this._widget.input1, "onkeydown", dojo.hitch(this, "selectionChanged", this._widget.input1));
		dojo.connect(this._widget.input2, "onkeydown", dojo.hitch(this, "selectionChanged", this._widget.input2));
		dojo.connect(this._widget.input1Date.textbox, "onkeydown", dojo.hitch(this, "selectionChanged", this._widget.input1Date.textbox));
		dojo.connect(this._widget.input2Date.textbox, "onkeydown", dojo.hitch(this, "selectionChanged", this._widget.input2Date.textbox));
	},
	
	init: function(handler, okCb, removeCb)
	{
		this._handler = handler;
		this._okCallback = okCb;
		this._removeCallback = removeCb;
	},
	
	highlightRef: function(input)
	{
		var grid = this._handler.editor.getCurrentGrid();
		dojo.publish("RangePickingStart", [{grid : grid}]);
		this._focusedNode = input;
	},
	
	hideRangeViewer: function()
	{
		var grid = this._handler.editor.getCurrentGrid();
		dojo.publish("RangePickingComplete", [{grid : grid}]);
		this._handler.hideRangeViewer();
		this._focusedNode = null;
	},
	
	getLocale: function()
	{
		var editor = this._handler.editor;
		var locale = editor.scene.getLocale();
		return locale;
	},
	
	setLocalDirty: function(){
		this._sep = null;
		this._widget.setLocale(this.getLocale());
	},
	
	_seperator: function()
	{
		if (!this._sep) {
			var locale = this.getLocale();
			var bundle = dojo.i18n.getLocalization( "dojo.cldr", "number", locale);
			this._sep = (bundle["decimal"] == ",") ? ';' : ',';
		}
		return this._sep;
	},
	
	validateRefs: function(parseTokenResult, forList)
	{
		var tokenArray = parseTokenResult.tokenArray;
		var tokenTypes = websheet.parse.tokenType;
		var docObj = this._handler.editor.getDocumentObj();
		var len = tokenArray.length;
		for(var i = 0; i < len; i++){
			var token = tokenArray[i];
			var tokenType = token.getTokenType();
			if(tokenType == tokenTypes.NAME){
				var area = docObj.getAreaManager().getRangeByUsage(token._name,websheet.Constant.RangeUsage.NAME);
				if(area == null)
					return false;
				if(forList){
					var parsedRef = area.getParsedRef();
					if(!parsedRef.isValid() || (parsedRef.startRow != parsedRef.endRow && parsedRef.startCol != parsedRef.endCol))
						return false;
				}
			}else if(tokenType == tokenTypes.RANGEREF_TOKEN){
				var parsedRef = token.getValue();
				if(!parsedRef.isValid() || (parsedRef.sheetName != null && !docObj.isSheetExist(parsedRef.sheetName)) || parsedRef.is3D())
					return false;
				if(forList && parsedRef.startRow != parsedRef.endRow && parsedRef.startCol != parsedRef.endCol)
					return false;
			}
		}
		if(!forList){
			var token = parseTokenResult.tokenTree;
			if(token.getTokenType() == websheet.parse.tokenType.RANGEREF_TOKEN){
				var parsedRef = token.getValue();
				if(parsedRef.startRow != parsedRef.endRow || parsedRef.startCol != parsedRef.endCol)
					return false;
			}
		}
		return true;
	},
	
	
	selectionChanged: function(input){
		this._handler.hideRangeViewer();
		this.selDirty = true;
	},
	
	rangePicking: function(address)
	{
		if(!this._refTarget){
			if(!this._focusedNode)
				return;
			this._refTarget = this._focusedNode;
		}
		
		if(this._widget.type == "rangeList"){
			var parsedRef = websheet.Helper.parseRef(address);
			var RefAddressType = websheet.Constant.RefAddressType;
			var params = {refMask: parsedRef.refMask 
				| RefAddressType.ABS_COLUMN | RefAddressType.ABS_ROW | RefAddressType.ABS_END_COLUMN | RefAddressType.ABS_END_ROW};				
			this._refTarget.value = "=" + parsedRef.getAddress(params);
			return;
		}
			
		if(!this.isPicking && this.selDirty){
			this.isPicking = true;
			this.selDirty = false;
			this.selStart = this._refTarget.selectionStart;
			this.selEnd = this._refTarget.selectionEnd;
			this.oldVal = this._refTarget.value;
			if(this.selStart != this.selEnd){
				this.oldVal = this.oldVal.substring(0, this.selStart) + this.oldVal.substring(this.selEnd, this.oldVal.length);
				this.selEnd = this.selStart;
			}
			this.selDirty = false;
		}
		var newVal = this.oldVal;
		
		if(this.selStart == 0)
			newVal = "=" + address + this.oldVal;
		else{
			if(this.oldVal[this.selStart - 1] == this._seperator() || this.oldVal[this.selStart - 1] == '(' 
				|| this.oldVal[this.selStart - 1] == ' ' || this.oldVal[this.selStart - 1] == '=' || this.oldVal[this.selStart - 1] == '+')
				newVal = this.oldVal.substring(0, this.selStart) + address;
			else
				newVal = this.oldVal.substring(0, this.selStart) + "+" + address;
			if(this.selEnd < this.oldVal.length)
				newVal += this.oldVal.substring(this.selEnd, this.oldVal.length);
		}
		if(this._refTarget == this._widget.input1Date.textbox)
			this._widget.input1Date.setDisplayedValue(newVal);
		else if(this._refTarget == this._widget.input2Date.textbox)
			this._widget.input2Date.setDisplayedValue(newVal);
		else
			this._refTarget.value = newVal;
		
	},
	
	rangePicked: function()
	{
		this.isPicking = false;
		if(this._widget.input1 == this._refTarget || this._widget.input1Date.textbox == this._refTarget)
			this._widget._value1Change();
		else if(this._widget.input2 == this._refTarget || this._widget.input2Date.textbox == this._refTarget)
			this._widget._value2Change();
			
		this._refTarget.focus();
		this._refTarget = null;
	},
	
	updateRef: function(address)
	{
		if(this._warning.isShowing())
			this._warning.updateRef(address);
		else
			this._widget.updateRef(address);
	},
	
	isEditingRef: function()
	{
		return this._widget.isEditingRef();
	},
	
	close:function()
	{
		this.inherited(arguments);
		this._handler.validationPaneClosed();
	},
	
	open: function(refValue, oriInfo)
	{
		this.inherited(arguments);
		if(!refValue || !oriInfo)
			return;
		if(oriInfo.isMul){
			this._widget.hide();
			this._warning.show();
			this._warning.updateRef(refValue);
		}else{
			this._showWidget(refValue, oriInfo.json);
		}
	},
	
	_showWidget: function(refValue, jsonData)
	{
		this._warning.hide();
		this._widget.show();
		this._widget.reset();		
		this._widget.setState(refValue, jsonData);
	},
	
	onRemoveAll: function()
	{	
		var refValue = this._warning.getRefValue();
		this._showWidget(refValue);
	},
	
	onRemove: function()
	{	
		var ref = this._widget.getRefValue();
		if(!ref)
			return;
		this.close();
		this._removeCallback(ref);
	},
	
	onOK: function()
	{
		var json = this._widget.getState();
		if(json == null)
			return;
		if(json.criteria && json.criteria.type == "none" && json.criteria.prompt == null){
			this.onRemove();
			return;
		}
		this.close();
		this._okCallback(json.refValue, json.criteria);
	},
	
	onCancel: function()
	{
		this.close();
	}
});