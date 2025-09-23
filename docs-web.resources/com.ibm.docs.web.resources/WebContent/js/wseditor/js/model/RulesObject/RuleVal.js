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

dojo.provide("websheet.model.RulesObject.RuleVal");
dojo.declare("websheet.model.RulesObject.RuleVal", null, {
	_value:null,
	_type:null,
	
	VALUETYPE: websheet.Constant.valueType,
	
	_isDirty: false,
	
	_tokens: null,
	_tokenArray: null,
	
	_cacheData: null,        //cached calculated value for relative formula, map{rangeid, two dimensional array}
	_calculatedValue: null, //calculated value for absolute formula, can be value or RuleDataCache obj.
	
	constructor:function(val){
		if(val != null){
			this._value = val;
			this._type = websheet.Helper.parseValue(val);
		}
	},
	
	getData4Range: function(rangeId)
	{
		return this._cacheData == null ? null : this._cacheData[rangeId];
	},
	
	clearData: function(rangeId)
	{
		if(this._cacheData == null)
			return;
		var data = this._cacheData[rangeId];
		if(!data)
			return;
		for(var i = 0; i < data.length; i++){
			var cData = data[i];
			if(!cData)
				continue;
			for(var j = 0; j < cData.length; j++){
				var v = cData[j];
				if(v instanceof websheet.model.RulesObject.RuleDataCache)
					v.clearRefs();
				delete cData[j];
			}
		}
		delete this._cacheData[rangeId];
	},
	
	clareData4Cell: function(rangeId, sr, sc, er, ec)
	{
		if(this._cacheData == null)
			return;
		var data = this._cacheData[rangeId];
		if(!data)
			return;
		for(var i = sr; i <= er; i ++){
			var cData = data[i];
			if(!cData)
				continue;
			for(var j = sc; j <= ec && j < cData.length; j++){
				var v = cData[j];
				if(v instanceof websheet.model.RulesObject.RuleDataCache)
					v.clearRefs();
				delete cData[j];
			}
		}
	},
	
	setValue4Range: function(value, rangeId, rIdx, cIdx){
		if(!this._cacheData)
			this._cacheData = {};
		if(!this._cacheData[rangeId])
			this._cacheData[rangeId] = [];
		if(!this._cacheData[rangeId][rIdx])
			this._cacheData[rangeId][rIdx] = [];
		this._cacheData[rangeId][rIdx][cIdx] = value;
	},
	
	getValue: function()
	{
		if(this._type ==  this.VALUETYPE.ABSFORMULA)
			return this._calculatedValue;
		if(this._type == this.VALUETYPE.BOOLEAN){
			var tmpV = this._value.toLowerCase();
			return tmpV == "true";
		}
		return this._value;
	},
	
	createTokenArray4Index: function(sheetName, tokenArray, deltaR, deltaC)
	{
		var tmpTokenArray = [];
		var len = tokenArray ? tokenArray.length : 0;
		for(var j = 0; j < len; j++){
			if(tokenArray[j]._tokenType == websheet.parse.tokenType.RANGEREF_TOKEN && websheet.Helper.isRelativeRef(tokenArray[j].getRefMask())){
				var area = tokenArray[j].getValue();
				var ref = area.getParsedRef();
				var parsedRef = ref;
				if(ref.isValid()){
					var mask = tokenArray[j].getRefMask();
					var info = websheet.Utils.getDelRangeInfo(area, mask, deltaR, deltaC);
					parsedRef = new websheet.parse.ParsedRef(ref.sheetName, info.startRow, info.startCol, info.endRow, info.endCol, mask);
				}
				
				var tmpRef = new websheet.parse.Reference(parsedRef);
				if(ref.sheetName != sheetName)
					tmpRef.setNeedPartial(true);
				var tmpToken = new websheet.parse.RefToken();
				dojo.mixin(tmpToken, tokenArray[j]);
	            tmpToken.setValue(tmpRef);
	            tmpTokenArray.push(tmpToken);
			}else{
				tmpTokenArray.push(tokenArray[j]);
			}
		}
		return tmpTokenArray;
	},
	
	clone: function(){
		var ret = new websheet.model.RulesObject.RuleVal();
		dojo.mixin(ret, this);
		ret._isDirty = true;
		delete ret._cacheData;
		delete ret._calculatedValue;
		return ret;
	},
	
	parseFormulaValue: function(bList)
	{
		if(this._type != this.VALUETYPE.FORMULA)
			return;
		var formulaParser = websheet.parse.FormulaParseHelper.getFormulaParser();
		result = formulaParser.parseFormula(this._value, null, false, false);
		if(result.error){//parse tokenlist for other refs in formula, such as sum(a1, #REF!)
			this._type = this.VALUETYPE.ERROR;
			return
		}
		var type = this.VALUETYPE.ABSFORMULA;
		var tokenArray = result.tokenArray;
		var relativeRefType = websheet.Constant.RelativeRefType;
		var relRefType = relativeRefType.NONE;
		var relativeRow = false;
		var relativeCol = false;
		for(var i = 0; i< tokenArray.length; i++){
			var token = tokenArray[i];
			if(token.getTokenType() == websheet.parse.tokenType.NAME){
				continue;
			}
			var area = token.getValue();
			if(area && !area.isValid()){
				if((token.getRefMask() & websheet.Constant.RefAddressType.INVALID_SHEET) > 0)
					token.setRefMask(websheet.Constant.RefAddressType.INVALID_SHEET, true);
				token._error = websheet.Constant.ERRORCODE["524"];//#REF!
			} else {
				relRefType = websheet.Helper.getRelativeRefType(token.getRefMask());
				if (relRefType === relativeRefType.NONE) {
					continue;
				} else if (relRefType === relativeRefType.COLUMN) {
					relativeCol = true;
				} else if (relRefType === relativeRefType.ROW) {
					relativeRow = true;
				} else if (relRefType === relativeRefType.ALL || (relativeCol && relativeRow)) {
					relRefType = relativeRefType.ALL;
					break;
				}
			}
		}
		if (relRefType != relativeRefType.ALL) {
			if (relativeRow) {
				relRefType = relativeRefType.ROW;
			} else if (relativeCol) {
				relRefType = relativeRefType.COLUMN;
			}
		}
		if (relRefType != relativeRefType.NONE) {
			type = this.VALUETYPE.RELFORMULA;
		} else {
			tokenTree = result.tokenTree;
			if(this._isRelFunc(tokenTree))
				type = this.VALUETYPE.RELFORMULA;
		}
		this._type = type;
		this._relRefType = relRefType;
		this._tokens = result.tokenTree;
		this._tokenArray = result.tokenArray;
		this._isDirty = true;
	},
	
	_isRelFunc: function(token)
	{
		var tokenList = token.tokenList;
		if(!tokenList && token._tokenType !=  websheet.parse.tokenType.FUNCTION_TOKEN)
			return false;
		if(token._name == "ROW" || token._name == "COLUMN")
			return true;
		var len = tokenList ? tokenList.length : 0;
		for(var i = 0; i < len; i++){
			if(this._isRelFunc(tokenList[i]))
				return true;
		}
		
		return false;
	},
	
	isFormula: function()
	{
		return (this._type == this.VALUETYPE.RELFORMULA || this._type == this.VALUETYPE.ABSFORMULA);
	},
	
	getTokenLength: function()
	{
		return this._tokenArray ? this._tokenArray.length : 0;
	},
	
	updateValue: function(tokenArray, baseRange, rangeInfo)
	{
		var deltaR = rangeInfo.startRow - baseRange.getStartRow();
		var deltaC = rangeInfo.startCol - baseRange.getStartCol();
		var value = "";
		var start = 0;
		for(var j = 0; j < tokenArray.length; j++){
			var token = tokenArray[j];
			if(token._tokenType == websheet.parse.tokenType.RANGEREF_TOKEN){
				var area = token.getValue();
				var ref = area.getParsedRef();
				var parsedRef = ref;
				if(ref.isValid()){
					var mask = this._tokenArray[j].getRefMask();
					var info = websheet.Utils.getDelRangeInfo(area, mask, deltaR, deltaC);
					parsedRef = new websheet.parse.ParsedRef(ref.sheetName, info.startRow, info.startCol, info.endRow, info.endCol, mask);
				}
				
				var oriText = token.getName();//original cell/range text
				var length =  oriText.length;
				var end = token.getIndex() - 1;
				var tmpStr = this._value.substring(start, end);
				value += tmpStr;
				var newText = parsedRef.getAddress();
				value +=newText;
				start = end + length;
			}else
				continue;
		}
		var lastStr = this._value.substring(start, this._value.length);
		value += lastStr;
		return value;
	},
	
	compare: function(ruleVal, baseRange, comRange, start){
		if(this._type != ruleVal._type)
			return false;
		if(this._type == this.VALUETYPE.RELFORMULA || this._type == this.VALUETYPE.ABSFORMULA){
			var refTokens = baseRange.getRefTokens();
			var refTokens2 = comRange.getRefTokens();
			if(!refTokens && !refTokens2 && this._value != ruleVal._value)
				return false;
			if(this.getTokenLength() != ruleVal.getTokenLength())
				return false;
			var info = baseRange._getRangeInfo();
			var v1 = refTokens ? this.updateValue(refTokens.slice(start, start + this._tokenArray.length), baseRange, info) : this._value;
			var v2 = refTokens2 ? ruleVal.updateValue(refTokens2.slice(start, start + ruleVal._tokenArray.length), comRange, info) : ruleVal._value;
			if(v1 != v2)
				return false;
		}else if(this._value != ruleVal._value)
			return false;
		
		return true;
	}
});