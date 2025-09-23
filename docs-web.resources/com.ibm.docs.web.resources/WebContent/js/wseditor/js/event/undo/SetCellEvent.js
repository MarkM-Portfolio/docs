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

dojo.provide("websheet.event.undo.SetCellEvent");
dojo.require("websheet.Constant");
dojo.require("websheet.event.undo.Event");
dojo.require("websheet.parse.FormulaParseHelper");
dojo.require("websheet.event.undo.Range3D");

dojo.declare("websheet.event.undo.SetCellEvent",websheet.event.undo.Event, {
	
	_refTokenList: null,
	_refIdList: null,
	_formula: null,
	_tokenArray: null,
	
	constructor: function(jsonEvent,idManager)
	{
		dojo.mixin(this, jsonEvent);
		var data = jsonEvent.data;
		if(data && data.cell)
		{
			var value = data.cell.v;
			if(value && this.isFormula(value))
			{
				this._formula = value;
			}
			var tarr = data.cell.tarr;
			if (tarr) {
				this._tokenArray = websheet.Helper.cloneJSON(tarr);
			}
		}
		this.transformData2Id();
	},
	
	isFormula: function(str)
	{
		return new RegExp("(^=.+)|(^{=.+}$)").test(str);
	},
	
	_checkRelated: function(token)
	{
		if(token.type == websheet.Constant.Event.SCOPE_ROW)
		{
			var srIndex = token.getStartRowIndex();
			var erIndex = token.getEndRowIndex();
			if(erIndex == -1) erIndex = srIndex;
			var rIndex = this.refTokenId.token.getStartRowIndex();
			if(rIndex <= 0) return true;
			if(rIndex >= srIndex && rIndex <= erIndex) return true;
			else return false;
		}else if(token.type == websheet.Constant.Event.SCOPE_COLUMN)
		{
			var scIndex = token.getStartColIndex();
			var ecIndex = token.getEndColIndex();
			if(ecIndex == -1) ecIndex = scIndex;
			var cIndex = this.refTokenId.token.getStartColIndex();
			if(cIndex <= 0) return true;
			if(cIndex >= scIndex && cIndex <= ecIndex) return true;
			else return false;
		}
	},
	
	/*
	 * transform index -> id for data in the josn event
	 */
	transformData2Id: function()
	{
		if(!this._formula) return;
		var bParse = false;
		if (this._tokenArray == null) {
			try{
				this._refTokenList = websheet.parse.FormulaParseHelper.parseTokenList(this._formula);
				bParse = true;
			} catch(e) {
				this._refTokenList = null;
			}
		} else {
			this._refTokenList = websheet.parse.FormulaParseHelper.getTokenList(this._formula, this._tokenArray);
		}
		if(this._refTokenList == null || this._refTokenList.length == 0) return;
		this._refIdList = [];
		var curSheetName = this.getSheetName();//this.refTokenId.token.getSheetName();
		var msgTransformer = this.getMsgTransformer();
		var docObj = websheet.model.ModelHelper.getDocumentObj();
		for(var i = 0 ; i < this._refTokenList.length; i++)
		{
			var token = this._refTokenList[i];
			var type = token._type;
			var tokenRef = token.getRef();
			if(!tokenRef)
				tokenRef = token.getText();
			if(tokenRef.sheetName && tokenRef.endSheetName && (tokenRef.sheetName != tokenRef.endSheetName)) {
				if(docObj.isSheetExist(tokenRef.sheetName) && docObj.isSheetExist(tokenRef.endSheetName)) {
					//new 3d range
					var range = new websheet.event.undo.Range3D(tokenRef,this._idManager);
					var rangeId = msgTransformer.addRange(range, this.bTrans);
					this._refIdList.push(rangeId);
					continue;
				} 
				var text = token.getText();
				var sheetPart = text.substring(0, text.lastIndexOf("!"));
				if(/^\'.*\'$/.test(sheetPart)) { //'Sheet 1:Sheet2'!A1, sheet part is embraced by "'" but sheet does not exist
					this._refIdList.push(null);
					continue;
				}
				if(docObj.isSheetExist(tokenRef.endSheetName) && bParse){//namerang:Sheet1!A1:B2, it need split to Sheet1!A1:B2
					var sn = tokenRef.sheetName;
					var newText = text.slice(sn.length + 1);
					token.setText(newText);
					token.setIndex(token.getIndex() + sn.length + 1);
					tokenRef.sheetName = tokenRef.endSheetName;
					tokenRef.endSheetName = null;
				} else {
					this._refIdList.push(null);
					continue;
				}
			} 
			if ( tokenRef.sheetName == null || docObj.isSheetExist(tokenRef.sheetName)) {
				var range = new websheet.event.undo.Range(tokenRef,curSheetName,this._idManager);//bEnableMaxRow for reference
				var rangeId = msgTransformer.addRange(range, this.bTrans);
				this._refIdList.push(rangeId);
			} else {
				this._refIdList.push(null);
			}
		}
	},
	
	/*
	 * transform index -> id for data in the josn event
	 */
	transformData2Index: function()
	{
		if(this._refIdList == null || this._refIdList.length == 0)
		{
			return this.jsonEvent.data;
		}
		var msgTransformer = this.getMsgTransformer();
		var rangeList = msgTransformer.getRangeList(this.bTrans);
		for(var i = 0; i < this._refIdList.length;i++)
		{
			var refId = this._refIdList[i];
			if (refId == null) {
				continue;
			}
			try{
				var token = this._refTokenList[i];
				var range = rangeList.getRange(refId);
				if(range!=null)
				{
					var address = range.getAddress();
					token.setChangedText(address);
				}
				else
					console.log("Error: range ", refId, " doesn't exist");
			}catch(e)
			{
				console.log("in translate set cell event" + e);
			}
		}
		
		var newFormula = websheet.parse.FormulaParseHelper.updateFormula(this._formula, this._refTokenList, this._tokenArray);
		var data = websheet.Helper.cloneJSON(this.jsonEvent.data);
		data.cell.v = newFormula;
		if(this._tokenArray)
			data.cell.tarr = this._tokenArray;
		return data;
	},
	
	isContainSheetName: function(text)
	{
		if(text.indexOf("!") == -1) return false;
		else return true;
	},
	
	_validate: function(refValue)
	{
		if (refValue.indexOf("#REF") != -1) {
			// has #REF
			return false;
		}
		var parsedRef = websheet.Helper.parseRef(refValue);
		if (!parsedRef.isValid())
			return false;
		return true;
	},
	
	clear: function()
	{
		if(this._refIdList == null || this._refIdList.length == 0) return;
		var rangeList =  this.getMsgTransformer().getRangeList(this.bTrans);
		for(var i = 0 ; i < this._refIdList.length; i++)
		{
			var range = rangeList.getRange(this._refIdList[i]);
			if(range) rangeList.deleteRange(range);
		}
//		var refList = this.getMsgTransformer().getReferenceList();
//		for(var i = 0 ; i < this._refIdList.length; i++)
//		{
//			var ref = refList.getRange(this._refIdList[i]);
//			if(ref) refList.deleteRange(ref);
//		}
	}
});