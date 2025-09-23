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

dojo.provide("websheet.model.RulesObject.DummyFormulaCell");
dojo.declare("websheet.model.RulesObject.DummyFormulaCell", null, {
	_rawValue:null,
	_tokens: null, //token tree
	isParsed: true,
	_errProp:websheet.Constant.CellErrProp.DEFAULT,
	_tokenArray:null,			//array of cell/range type tokens which is on the token tree
	_doc: null,
	_updateRefTokens: null,
	
	/**
	 * constructor
	 */
	constructor:function(tokens, tokenArray, sheetName, rowIdx, colIdx, uniqueId, doc){
		this._uniqueId = uniqueId;
		this._tokens = tokens;
		this._tokenArray = tokenArray;
		this._doc = doc;
		this._isUnCalc = true;
		this._sheetName = sheetName;
		this._rowIndex = rowIdx;
		this._colIndex = colIdx;
		this._updateRefTokens = {};
	},
	
	setCheckCR: function(){
		
	},
	
	_checkCR: function(){
		
	},
	
	setError: function(error){
		this._error = error;
		this._calculatedValue = this._error.message;
		delete this._isUnCalc;
	},
	
	_calculate: function(){
		var calcParams = {};
		calcParams.bAutofill = true;
		calcParams.bUpdateAll = true;
		calcParams.tokenArray = this._tokenArray;
		
		var result = websheet.parse.FormulaParseHelper.calcFormula(this, this._tokens, calcParams);
		if(this._isUnCalc){
			var currentTask = this._doc._taskMgr._current;
			if(currentTask){
				var pcm = currentTask.scope;
				if(pcm)
					pcm._bTerminate = true;
			}
			websheet.model.ModelHelper.getPartialManager().addNotify(dojo.hitch(this, '_calculate'));
			return;
		}
		if(result.error)
			this._error = result.error;
		else
			this._error = null;
		var value = result.value;
		this._calculatedValue = value;
	},
	
	setErrProp:function(prop)
	{
		this._errProp |= prop;
	},
	
	getRow:function(){
		return this._rowIndex;
	},
	
	getCol:function(){
		return this._colIndex;
	},
	
	getCalculatedValue: function(){
		return this._calculatedValue;
	},
	
	/*string*/getSheetName: function() {
		return this._sheetName;
	},
	
	/*string*/getValue: function() {
		return null;
	},
	
	/**
	 * get document object
	 */
	/*Document*/_getDocument:function(){
		return this._doc;
	},
	
	/*boolean*/isFormula:function()
	{
		return true;
	},
	/**
	 * get sheet object
	 */
	/*Document*/_getSheet:function(){
		return this._doc.getSheet(this._sheetName);
	},

	
	/**
	 * clear the reference map of the formula cell
	 */
	/*void*/clearUpdateRefs:function(cacheCell)
	{
		//remove refCount for each ref, if refCount ==0, delete it
		var areaMgr = this._doc.getAreaManager();
		for(var id in this._updateRefTokens)
		{
			var list = this._updateRefTokens[id];
			var count = list.length;
			for(var i=0;i<count;i++)
			{
				var token = list[i];
				var area = token.getValue();
				var bContain = area.hasListener(this);
				//if ref related cell does not contain this cell, then should not delete ref count
				if(bContain){
					if(cacheCell)
						area.addListener(cacheCell);
					areaMgr.endListeningArea(area, this);
				}
			}
			delete this._updateRefTokens[id];
		}
	},
	
	getUpdateRefTokens : function(){
		return this._updateRefTokens;
	},
	
	/*void*/deleteRef:function(/*websheet.parse.UpdateRefToken*/token) {
		if(token && (token.getTokenType() == websheet.parse.tokenType.RANGEREF_TOKEN
				|| token.getTokenType() == websheet.parse.tokenType.NAME))
		{
			var area = token.getValue();
			var id = area.getId().toLowerCase();
			var list = this._updateRefTokens[id];
			if(list && list.length > 0)
			{
				var areaMgr = this._doc.getAreaManager();
				var bContain = area.hasListener(this);
				//if ref related cell does not contain this cell, then should not delete ref count
				if(bContain)
					areaMgr.endListeningArea(area, this);
				for(var i=0;i<list.length; i++)
				{
					if(list[i] == token)
					{
						list.splice(i,1);
						break;
					}
				}
			}
		}
	},
	
	//Only push the tokens which are not in tokentree and create a listener for cache data of data validation.
	pushRef:function(token, bInTokenTree){
		if(bInTokenTree)
			return;
		if(token && (token.getTokenType() == websheet.parse.tokenType.RANGEREF_TOKEN
				|| token.getTokenType() == websheet.parse.tokenType.NAME))
		{
			var area = token.getValue();
			if(area.setNeedPartial && area.getSheetName() != this._sheetName)
				area.setNeedPartial(true);
			
			//1.area is already exist in document area manager
			// and area has relation with this cell by addListner
			
			//2.add ref to itself reference list
			var id = area.getId().toLowerCase();
			if(!this._updateRefTokens[id])
			{
				this._updateRefTokens[id] = [];
			}
			var list = this._updateRefTokens[id];
			// bUnique means only push the unique token for the same reference
			list.push(token);
		}
	}
});