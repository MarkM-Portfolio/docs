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

dojo.provide("websheet.model.RulesObject.RulesObj");
dojo.declare("websheet.model.RulesObject.RulesObj", null, {
	_doc: null,
	_id: null,			//string, same as rangeId defined in range
	_ranges: null, 		//data validation applied range
	
	_topRow: null,
	_leftCol: null,
	
	VALUETYPE: websheet.Constant.valueType,
	
	constructor:function(range, doc, criteria){
		this._doc = doc;
		this._ranges = [];
		this._ranges.push(range);
		this._id = range._id;
	},
	
	createNewInstance : function(range){
		var rulesObj = this.constructor.apply(null,[range, this._doc]);
		
		rulesObj._topRow = range.getStartRow();
		rulesObj._leftCol = range.getStartCol();
		
		return rulesObj;
	},
	
	rangeNum: function()
	{
		return this._ranges.length;
	},
	
	getRanges: function()
	{
		return this._ranges;
	},
	
	addRange:function(range, bParse){
		this._ranges.push(range);
		if(bParse)
			this.parse4Range(range);
	},
	
	removeRange: function(range){
		var len = this._ranges.length;
		var i = 0;
		for(; i < len; i++){
			if(this._ranges[i].getId() == range.getId()){
				this.clearAll(range.getId());
				this._ranges.splice(i,1);
				break;
			}
		}
		if(this._ranges.length == 0){
			this._doc.removeRulesObjByUsage(this._id, this._usage);
			this._doc._areaManager.deleteAreaInUsageMap(range);
			return;
		}
		if(i == 0){//set the range id of the second one to parentid;
			this._doc.renameRulesObjByUsage(this, this._ranges[0]._id, this._usage);
		}
	},

	getJSON4Range: function(rangeInfo, baseRange)
	{
		
	},
	
	//For copy paste, row repeat or col repeat
	parse4Range: function(range){
		this._parse(range);
	},
	
	_parse: function(sharedFormulaRef, bFirst, tokenList, areaManager){
		if(!tokenList){
			tokenList = this._getTokenList();
			if(tokenList.length == 0)
				return;
			this._updateTokenArrays(tokenList);
		}
		
		if(!areaManager)
			areaManager = this._doc.getAreaManager();
		
		var deltaR = sharedFormulaRef.getStartRow() - this._topRow;
		var deltaC = sharedFormulaRef.getStartCol() - this._leftCol;
		var rowNum = sharedFormulaRef.getEndRow() - sharedFormulaRef.getStartRow();
		var colNum = sharedFormulaRef.getEndCol() - sharedFormulaRef.getStartCol();
		for(var j = 0; j < tokenList.length; j++){
			var token = tokenList[j];
			var ref = token.getValue();
			if(token.getTokenType() == websheet.parse.tokenType.RANGEREF_TOKEN && websheet.Helper.isRelativeRef(token.getRefMask()) && ref.isValid()){
				if(!ref.sheetName){
					var sheetName = sharedFormulaRef.getSheetName();
					ref.setSheetName(sheetName);
				}
				
				var startRow = ref.startRow;
				var endRow = ref.endRow;
				var startCol = ref.startCol;
				var endCol = ref.endCol;
				
				var rowSize = endRow - startRow + 1;
				var colSize = endCol - startCol + 1;
				
				if((ref.refMask & websheet.Constant.RefAddressType.ROW) > 0 && (ref.refMask & websheet.Constant.RefAddressType.ABS_ROW) == 0)
					startRow += deltaR;
				if((ref.refMask & websheet.Constant.RefAddressType.COLUMN) > 0 && (ref.refMask & websheet.Constant.RefAddressType.ABS_COLUMN) == 0)
					startCol += deltaC;
				var isCell = (ref.refMask & websheet.Constant.RefAddressType.END_ROW) == 0 && (ref.refMask & websheet.Constant.RefAddressType.END_COLUMN) == 0;	
				if(isCell){
					endRow = startRow;
					endCol = startCol;
				}else{
					if((ref.refMask & websheet.Constant.RefAddressType.END_ROW) > 0 && (ref.refMask & websheet.Constant.RefAddressType.ABS_END_ROW) == 0)
						endRow += deltaR;
					if((ref.refMask & websheet.Constant.RefAddressType.END_COLUMN) > 0 && (ref.refMask & websheet.Constant.RefAddressType.ABS_END_COLUMN) == 0)
						endCol += deltaC;
				}
				
				//var mask = websheet.Constant.RANGE_MASK;
				if(((ref.refMask & websheet.Constant.RefAddressType.ROW) > 0 && (ref.refMask & websheet.Constant.RefAddressType.ABS_ROW) == 0)
						||((ref.refMask & websheet.Constant.RefAddressType.END_ROW) > 0 && (ref.refMask & websheet.Constant.RefAddressType.ABS_END_ROW) == 0)){
					if(endRow < startRow){
						var tmp = startRow;
						startRow = endRow;
						endRow = tmp;
					}
					endRow += rowNum;
				}
				if(((ref.refMask & websheet.Constant.RefAddressType.COLUMN) > 0 && (ref.refMask & websheet.Constant.RefAddressType.ABS_COLUMN) == 0)
						||((ref.refMask & websheet.Constant.RefAddressType.END_COLUMN) > 0 && (ref.refMask & websheet.Constant.RefAddressType.ABS_END_COLUMN) == 0)){
					if(endCol < startCol){
						var tmp = startCol;
						startCol = endCol;
						endCol = tmp;
					}
					endCol += colNum;
				}
				
				var mask = ref.refMask;
				if(isCell){//cell, maybe need to expand to range.
					if(startRow != endRow || startCol != endCol){
						if((ref.refMask & websheet.Constant.RefAddressType.ABS_ROW) > 0)
							mask |= websheet.Constant.RefAddressType.ABS_END_ROW;
						mask |=  websheet.Constant.RefAddressType.END_ROW;
						if((ref.refMask & websheet.Constant.RefAddressType.ABS_COLUMN) > 0)
							mask |= websheet.Constant.RefAddressType.ABS_END_COLUMN;
						mask |= websheet.Constant.RefAddressType.END_COLUMN;
					}
				}
				
				var sharedReferenceRef = new websheet.parse.SharedReferenceRef(new websheet.parse.ParsedRef(ref.sheetName, startRow, startCol, endRow, endCol, mask), rowSize, colSize);
				var newSharedRefToken = new websheet.parse.RefToken();
				dojo.mixin(newSharedRefToken, token);
	            newSharedRefToken.setValue(sharedReferenceRef);
	            newSharedRefToken.setRefMask(mask);
	            sharedFormulaRef.pushRefToken(newSharedRefToken, true);
	            areaManager.startListeningArea(sharedReferenceRef._parsedRef, sharedFormulaRef, sharedReferenceRef);
			}else{
				var refToken = bFirst ? this._generateRefToken(token) : token;
				var area = refToken.getValue();
				if(!area.isInstanceOf(websheet.parse.Area)){
					refToken = this._generateRefToken(token);
					area = refToken.getValue();
				}
				sharedFormulaRef.pushRefToken(refToken, true);
				area.addListener(sharedFormulaRef);
			}
		}
	},
	
	//generate ref tokens for sharedformularef.
	parse:function(){
		var tokenList = this._getTokenList(true);		
		if(tokenList.length == 0)
			return;
		
		this._parseBaseRef();
		var areaManager = this._doc.getAreaManager();
		
		for(var i = 0; i < this._ranges.length; i++){
			var sharedFormulaRef = this._ranges[i];
			this._parse(sharedFormulaRef, i == 0, tokenList, areaManager);
		}
	},
	
	_getTokenList: function()
	{
		
	},
	
	_updateTokenArrays: function(tokenList){
		var range = this._ranges[0];
		var deltaR = range.getStartRow() - this._topRow;
		var deltaC = range.getStartCol() - this._leftCol;
		var rowNum = range.getEndRow() - range.getStartRow();
		var colNum = range.getEndCol() - range.getStartCol();
		
		var refTokens = range.getRefTokens();
		for(var i = 0; i < refTokens.length; i ++){
			var refToken = refTokens[i];
			var ref = refToken.getValue();
			if(ref.usage != websheet.Constant.RangeUsage.SHARED_REFS)
				continue;
			var token = tokenList[i];
			var parsedRef = token.getValue();
			
			//parsedRef
			var startRow = ref.getStartRow();
			var endRow = ref.getEndRow();
			var startCol = ref.getStartCol();
			var endCol = ref.getEndCol();
			
			if((parsedRef.refMask & websheet.Constant.RefAddressType.ROW) > 0 && (parsedRef.refMask & websheet.Constant.RefAddressType.ABS_ROW) == 0)
				startRow -= deltaR;
			if((parsedRef.refMask & websheet.Constant.RefAddressType.COLUMN) > 0 && (parsedRef.refMask & websheet.Constant.RefAddressType.ABS_COLUMN) == 0)
				startCol -= deltaC;			
			if(parsedRef.refMask == websheet.Constant.DEFAULT_CELL_MASK || parsedRef.refMask == websheet.Constant.CELL_MASK){
				endRow = startRow;
				endCol = startCol;
			}else{
				if((parsedRef.refMask & websheet.Constant.RefAddressType.END_ROW) > 0 && (parsedRef.refMask & websheet.Constant.RefAddressType.ABS_END_ROW) == 0)
					endRow -= deltaR;
				if((parsedRef.refMask & websheet.Constant.RefAddressType.END_COLUMN) > 0 && (parsedRef.refMask & websheet.Constant.RefAddressType.ABS_END_COLUMN) == 0)
					endCol -= deltaC;
			}
			
			parsedRef.startRow = startRow;
			parsedRef.endRow = endRow;
			parsedRef.startCol = startCol;
			parsedRef.endCol = endCol;
		}
	},
	
	_generateRefToken: function(token){
		var areaManager = this._doc.getAreaManager();
		
		var range = this._ranges[0];
		var sheetName = range.getSheetName();
		if(token.getTokenType() == websheet.parse.tokenType.NAME){
			var name = token.getName();
			var area = areaManager.startListeningNameArea(name, null);
			 if(area){
				token.setValue(area);
				token.setName(area.getId());
				if (area.getUsage() == websheet.Constant.RangeUsage.NAME) {
					if(!area.isValid())
						token._error = websheet.Constant.ERRORCODE["524"];
					else if(area.setNeedPartial && area.getSheetName() != sheetName)
						area.setNeedPartial(true);
				} else {
					 token.setValue(area);
	           		 token._error = websheet.Constant.ERRORCODE["525"];//#NAME!
				}
			 }
		}else{
			var parsedRef = token.getValue();
			if(!parsedRef.sheetName)
				parsedRef.setSheetName(sheetName);
			var area = areaManager.startListeningArea(parsedRef, null);
			if(area.getSheetName() != sheetName)
				area.setNeedPartial(true);
			token.setValue(area);
			token.setRefMask(parsedRef.refMask);
		}
		return token;
	},
	
	_parseBaseRef: function(){
		var topRow, leftCol;
		for(var i = 0; i < this._ranges.length; i++){
			var range = this._ranges[i];
			if(!topRow || topRow > range.getStartRow())
				topRow = range.getStartRow();
			if(!leftCol || leftCol > range.getStartCol())
				leftCol = range.getStartCol();
		}
		this._topRow = topRow;
		this._leftCol = leftCol;
	},
	
	getTokenIdxs: function(ref, tokenArray, tokenIdxs)
	{
		
	},
	
	isSplitable: function()
	{
		return true;		
	},
	
	//clear all cached data for the value of the range
	clearAllData: function(rangeId, dirtyFlag)
	{
		
	},
	
	//clear partial cached data for the value of the range
	clearData4Cell: function(rangeId, sr, sc, er, ec, dirtyFlag)
	{
		
	},
	
	//clear all cached data for range
	clearAll: function(rangeId)
	{
		
	}
});