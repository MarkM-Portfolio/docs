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

dojo.provide("websheet.model.RulesObject.ConditionalFormat");
dojo.declare("websheet.model.RulesObject.ConditionalFormat", websheet.model.RulesObject.RulesObj,{
	_preserve:null, //has unsupported criterion, need preserve
	_pivot: null,	//optional preserved for pivot table
	
	_criterias:null,	//criteria array, ordered by priority?
	
	_usage: websheet.Constant.RangeUsage.CONDITION_FORMAT,
	
	_calcIdx : -1,
	_calcArray : {},
		
	constructor:function(range, doc, data){
		if(!data)
			return;
		this._criterias = new Array();
		var criterias = data.criterias;
		var length = criterias.length;
		for (var i = 0; i < length; i++){
			var criterion = new websheet.model.RulesObject.ConditionalCriteria(doc, criterias[i], this);
			this._criterias.push(criterion);
		}
		
		if (data.preserve != undefined)
			this._preserve = true;
		if (data.pivot != undefined)
			this._pivot = true;
	},
	
	createNewInstance : function(range){
		var conditionalFormat = this.inherited(arguments);
		
		conditionalFormat._preserve = this._preserve;
		conditionalFormat._pivot = this._pivot;
		
		var len = this._criterias.length;
		conditionalFormat._criterias = new Array();
		for(var i = 0; i < len; i++){
			var newCriteria = this._criterias[i].clone();
			newCriteria._parentCF = conditionalFormat;
			conditionalFormat._criterias.push(newCriteria);
		}
		
		return conditionalFormat;
	},
	
	removeRange: function(range)
	{
		this.inherited(arguments);
		this._doc._calcManager.removeCF(range);
	},
	
	getJSON4Range: function(rangeInfo, baseRange)
	{
		var json = {};
		
		if(this._preserve != null)
			json._preserve = this._preserve;
		if(this._pivot != null)
			json._pivot = this._pivot;
		var len = this._criterias.length;
		if(len != 0){
			json.criterias  = [];
			for(var i = 0; i < len; i++)
				json.criterias.push(this._criterias[i].getJSON4Range(rangeInfo, baseRange));
		}
		return json;
	},
	
	calculate: function(range, callBack)
	{
		this.cal4Range(range, range._getRangeInfo(), callBack);
	},
	
	/*
	 * Calculate style for range
	 * return Two dimensional array, array item is a list of object{styleid, priority, stopIfTrue}
	 * How to optimize by stopiftrue
	 * @param range	rangeInfo
	 * @param baseRange unname range for conditional format
	 */
	cal4Range: function(baseRange, range, callBack)
	{
		baseRange.updateTokens();
		
		if(!baseRange.result)
			baseRange.result = [];
		var len = this._criterias ? this._criterias.length : 0;
	    if(len == 0){
	    	callBack();
	    	return;
	    }
		this._calcArray[baseRange._id] = 0;
		var callback = dojo.hitch(this,"_calComplete", baseRange, range, baseRange._id, callBack);
		for(var i = 0; i < len ; i ++)
			this._criterias[i].cal4Range(baseRange, range, callback);
	},
	
	_calComplete: function(baseRange, range, calcIdx, callback)
	{
		this._calcArray[calcIdx] ++;
		var len = this._criterias.length;
		if(this._calcArray[calcIdx] == len){
			var cfResult = baseRange.result;
			var parsedRef = baseRange._parsedRef;
			sr = parsedRef.startRow;
			sc = parsedRef.startCol;
			
			var sheet = this._doc.getSheet(range.sheetName);
			var colsMap = websheet.Utils.getColsVisMap(sheet, range.startCol, range.endCol);
			var rowsMap = websheet.Utils.getRowsVisMap(sheet, range.startRow, range.endRow);
			
			for(var j = range.startRow; j <= range.endRow; j++){
				if(rowsMap[j])
					continue;
				var ri = j - sr;
				if(!cfResult[ri])
					cfResult[ri] = [];
				for(var k = range.startCol; k <= range.endCol; k++){
					if(colsMap[k])
						continue;
					var ci = k - sc;
					if(!cfResult[ri][ci]){//only update point without result.
						cfResult[ri][ci] = [];
						for(var i = 0; i < len ; i ++){
							var r = this._criterias[i].getResult4Cell(baseRange._id, ri, ci);
							if(r)
								cfResult[ri][ci].push(r);
						}
					}
				}
			}
			this._doc._calcManager.removeCF(baseRange);
			callback();
		}
	},
	
//	_parse: function(sharedFormulaRef, bFirst, tokenList, areaManager)
//	{
//		sharedFormulaRef.dirty = true;
//		sharedFormulaRef.unCalc = true;
//		this.inherited(arguments);
//	},
	
	_getTokenList: function(setTokenPos)
	{
		var tokenList = [];
		var idx = 0;
		var len = this._criterias ? this._criterias.length : 0;
		for(var i = 0; i < len; i ++){
			var list = setTokenPos ? this._criterias[i].getTokenList(idx) : this._criterias[i].getTokenList();
			tokenList = tokenList.concat(list);
			idx += list.length;
		}
		return tokenList;
	},
	
	//tokenIdxs is array[undefined /array,undefined /array...]
	getTokenIdxs: function(ref, tokenArray, tokenIdxs){
		var len = this._criterias ? this._criterias.length : 0;
		if(!tokenIdxs)
			tokenIdxs = [];
		for(var i = 0; i < len; i ++){
			var ret = this._criterias[i].getTokenIdxs(ref, tokenArray, tokenIdxs[i]);
			if(ret)
				tokenIdxs[i] = ret;
		}
		return tokenIdxs;
	},
	
	isSplitable: function(bRow)
	{
		for (var i=0; i<this._criterias.length; i++) {
			var crt = this._criterias[i];
			if (crt.isRangeBasedCriteria()) {				
				continue;
			}
			var cfvos = crt._cfvos;
			for (var j=0; j<cfvos.length; j++)
			{
				if (bRow) {
					if (cfvos[j]._relRefType === websheet.Constant.RelativeRefType.ALL || cfvos[j]._relRefType === websheet.Constant.RelativeRefType.ROW)
						return true;
				} else {
					if (cfvos[j]._relRefType === websheet.Constant.RelativeRefType.ALL || cfvos[j]._relRefType === websheet.Constant.RelativeRefType.COLUMN)
						return true;
				}
			}
		}
		return false;
	},
	
	clearAllData: function(rangeId, dirtyFlag)
	{
		if(!dirtyFlag)
			return;
		var len = dirtyFlag.length;
		for(var i = 0; i < len; i++){
			if(!dirtyFlag[i])
				continue;
			this._criterias[i].clearAllData(rangeId, dirtyFlag[i]);
		}
	},
	
	clearData4Cell: function(rangeId, sr, sc, er, ec, dirtyFlag)
	{
		if(!dirtyFlag)
			return;
		var len = dirtyFlag.length;
		//var ret = false;  TODO: color's criteria
		for(var i = 0; i < len; i++){
			if(!dirtyFlag[i])
				continue;
			this._criterias[i].clearData4Cell(rangeId, sr, sc, er, ec, dirtyFlag[i]);
		}
	},
	
	clearResult: function(rangeId, dsr, dsc, der, dec)
	{
		var len = this._criterias ? this._criterias.length : 0;
		var ret = false;
		for(var i = 0; i < len; i ++){
			if(this._criterias[i].clearResult(rangeId, dsr, dsc, der, dec))
				ret = true;
		}
		return ret;
	},
	
	clearAll: function(rangeId)
	{
		var len = this._criterias ? this._criterias.length : 0;
		for(var i = 0; i < len; i ++)
			this._criterias[i].clearAll(rangeId);
	}
});