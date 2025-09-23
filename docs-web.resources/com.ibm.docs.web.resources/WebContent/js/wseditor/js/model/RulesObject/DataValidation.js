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

dojo.provide("websheet.model.RulesObject.DataValidation");
dojo.declare("websheet.model.RulesObject.DataValidation", websheet.model.RulesObject.RulesObj, {
	_type: null,
	_operator: null,
	_list: null,
	_showDropDown: null,//boolean
	_allowBlank: null,//boolean
	_showInputMsg: null,//boolean
	_showErrorMsg: null,//boolean
	_errorStyle: null,//The default value is "stop"
	_errorTitle: null,
	_error :null,
	_promptTitle: null,
	_prompt:null,
	_IME: null,
		
	_value1: null,
	_value2: null,
	
	VALUETYPE: websheet.Constant.valueType,
	
	_usage: websheet.Constant.RangeUsage.DATA_VALIDATION,
	
	constructor:function(range, doc, criteria){
		if(!criteria)
			return;
		this._type = criteria.type;
		this._operator = criteria.operator;

		this._value1 = new websheet.model.RulesObject.RuleVal(criteria.value1);
		if(this._type == websheet.Constant.DataValidationType.LIST && this._value1._type == this.VALUETYPE.STRING){
			var tmpV = criteria.value1.substring(1,criteria.value1.length -1);
			var list = tmpV.split(",");
			for(var i = list.length - 1; i >= 0; i --){
				list[i] = dojo.trim(list[i]);
				if(list[i] === "")
					list.splice(i,1);
			}
			this._list = list;
			this._dataList = [].concat(this._list);
			for(var i = 0; i < this._list.length; i++){
				if(list[i].length > 1 && list[i].indexOf("=") == 0)
					this._dataList[i] = "'" + list[i];
				else{
					var parseResult = websheet.i18n.numberRecognizer.parse(list[i], false, true);
					if(parseResult.formatType == websheet.Constant.FormatType.BOOLEAN)
						this._dataList[i] =  "'" + websheet.model.ModelHelper.intToBoolean(parseResult.fValue).toString();
					else if(parseResult.isNumber){
						this._dataList[i] = parseFloat(parseResult.fValue.toPrecision(15)) + "";
					}
				}
			}
		}
		this._value1.parseFormulaValue(this._type == websheet.Constant.DataValidationType.LIST);
		if(criteria.value2 != undefined){
			this._value2 = new websheet.model.RulesObject.RuleVal(criteria.value2);
			this._value2.parseFormulaValue();
		}
		if(criteria.showDropDown != undefined)
			this._showDropDown = criteria.showDropDown;
		if(criteria.allowBlank != undefined)
			this._allowBlank = criteria.allowBlank;
		if(criteria.showInputMsg != undefined)
			this._showInputMsg = criteria.showInputMsg;
		if(criteria.showErrorMsg != undefined)
			this._showErrorMsg = criteria.showErrorMsg;
		if(criteria.errorStyle != undefined)
			this._errorStyle = criteria.errorStyle;
		if(criteria.errorTitle != undefined)
			this._errorTitle = criteria.errorTitle;
		if(criteria.error != undefined)
			this._error = criteria.error;
		if(criteria.promptTitle != undefined)
			this._promptTitle = criteria.promptTitle;
		if(criteria.prompt != undefined)
			this._prompt = criteria.prompt;
		if(criteria.IME != undefined)
			this._IME = criteria.IME;
	},
	
	createNewInstance: function(range){
		var dataValidation = this.inherited(arguments);
		dataValidation._type = this._type;
		dataValidation._operator = this._operator;

		dataValidation._value1 = this._value1.clone();
		dataValidation._value2 = this._value2 ? this._value2.clone() : null;
	
		if(this._type == websheet.Constant.DataValidationType.LIST && this._value1._type == this.VALUETYPE.STRING){
			dataValidation._list = this._list;
			dataValidation._dataList = this._dataList;
		}
		
		dataValidation._showDropDown = this._showDropDown;
		dataValidation._allowBlank = this._allowBlank;
		dataValidation._showInputMsg = this._showInputMsg;
		dataValidation._showErrorMsg = this._showErrorMsg;
		dataValidation._errorStyle = this._errorStyle;
		dataValidation._errorTitle = this._errorTitle;
		dataValidation._error = this._error;
		dataValidation._promptTitle = this._promptTitle;
		dataValidation._prompt = this._prompt;
		dataValidation._IME = this._IME;

		return dataValidation;
	},
			
	_getTokenList: function()
	{
		var tokenList = [];
		if(this._value1.isFormula())
			tokenList = this._value1._tokenArray;
		if(this._value2 && this._value2.isFormula())
			tokenList = tokenList.concat(this._value2._tokenArray);
		return tokenList;
	},
	
	isShowList: function(){
		return this._type == websheet.Constant.DataValidationType.LIST;
	},
	
	getType: function(){
		return this._type;
	},
		
	getOperator: function(){
		return this._operator;
	},
	
	getPrompt: function(){
		return this._prompt;
	},
	
	getList: function(range, rowIndex, colIndex, callBack, isCalFin){
		if(isCalFin)			
			this._setData4List(range, rowIndex, colIndex);
		var list = null;
		var dataList = null;
		
		switch(this._value1._type){
			case this.VALUETYPE.STRING:
				list = this._list;
				dataList = this._dataList;
				break;
			case this.VALUETYPE.ABSFORMULA:
				if(this._value1._tokens.getTokenType() == websheet.parse.tokenType.FUNCTION_TOKEN)
					list = dataList = [];
				else if(!this._value1._isDirty){
					list = this._listObj.showList;
					dataList = this._listObj.vList;
				}
				break;
			case this.VALUETYPE.RELFORMULA:
				if(this._value1._tokens.getTokenType() == websheet.parse.tokenType.FUNCTION_TOKEN)
					list = dataList = [];
				else{
					var obj = this._getData4List(range, rowIndex, colIndex, true);
					if(obj){
						list = obj.showList;
						dataList = obj.vList;
					}
				}
				break;
			default:
				break;
		}
		if(!list){
			this._callBack = callBack;
			if(this._prepareData4List(range, rowIndex, colIndex, true))
				this.getList(range, rowIndex, colIndex, callBack);				
			return;
		}
		
		callBack(list, dataList);
	},
	
	validate: function(range, cell, result, callBack){
		var ret = true;
		
		if(this._value1._type == this.VALUETYPE.ERROR || (this._value2 && this._value2._type == this.VALUETYPE.ERROR))
			ret = false;
		else{
			var type = websheet.Constant.DataValidationType;
			if(cell && cell.getRawValue() !== ""){
				this._currRange = range;
				this._cell = cell;
				if(!this._prepareData(range, cell)){
					this._callBack = callBack;
					this._cellResult = result;
					return;
				}
								
				switch(this._type){
				case type.WHOLE:
					ret = this._validateWhole(cell);
					break;
				case type.DECIMAL:
					ret = this._validateDecimal(cell);
					break;
				case type.LIST:
					ret = this._validateList(range,cell);
					break;
				case type.CUSTOM:
					ret = this._validateCustom(cell);
					break;
				case type.DATE:
					ret = this._validateDate(cell);
					break;
				case type.TIME:
					ret = this._validateTime(cell);
					break;
				case type.TEXTLENGTH:
					ret = this._validateTextLen(cell);
					break;
				default:
					break;
				}
			}
		}
		
		if(!ret)
			result.success = false;
		callBack(result);
	},	
	
	_validateDecimal: function(cell){
		var v = cell.getCalculatedValue();
		if(typeof v != "number")
			return false;
		
		return this._validateNumber(v);
	},
	
	_validateList: function(range,cell){
		var list = [];
		
		switch(this._value1._type){
			case this.VALUETYPE.STRING:
				list = this._dataList;
				break;
			case this.VALUETYPE.ABSFORMULA:
				if(this._value1._tokens.getTokenType() == websheet.parse.tokenType.FUNCTION_TOKEN)
					list = [];
				else
					list = this._listObj.vList;
				break;
			case this.VALUETYPE.RELFORMULA:
				list = this._getData4List(range, cell.getRow(), cell.getCol());
				break;
			default:
				break;
		}
		
		if(!cell)
			return list && list.indexOf("") > -1;
			
		var v = cell.getCalculatedValue();
		if(!cell.isFormula() && v != cell.getRawValue())
			v = cell.getRawValue();
		if(this._value1._type == this.VALUETYPE.STRING)
			v = v + "";
		return list && list.indexOf(v) > -1;
	},
	
	_validateCustom: function(cell){
		var v1 = null;
		
		if(this._value1.isFormula())
			v1 = this._getData4Cell(this._currRange, this._cell);
		else
			v1 = this._value1._value;
 		
		if(typeof v1 != "number" && typeof v1 != "boolean")
			return false;
		return !!v1;
	},
	
	_validateDate: function(cell){
		return this._validateWhole(cell);
	},
	
	_validateTime: function(cell){
		return this._validateDecimal(cell);
	},
	
	_validateTextLen: function(cell){
		if(cell.isError())
			return false;
		var v = cell.getCalculatedValue();
		v = (v + "").length;
		return this._validateNumber(v);
	},
	
	_validateWhole: function(cell){
		var v = cell.getCalculatedValue();
		if(!websheet.Helper.isInt(v))
			return false;
		
		return this._validateNumber(v);
	},	
	
     _validateNumber: function(v){
    	 if(this._value1._type == this.VALUETYPE.ERROR || (this._value2 && this._value2._type == this.VALUETYPE.ERROR))
    		 return false;
    	 var v1 = this._value1.isFormula() ? this._getData4Cell(this._currRange, this._cell) : this._value1._value;
    	 var v2 = this._value2 ? (this._value2.isFormula() ? this._getData4Cell(this._currRange, this._cell, true) : this._value2._value) : null;
    	 
		if(typeof v1 != "number")
			return false;
 		
		if(this._value2 && typeof v2 != "number")
			return false;
 		
		switch(this._operator){
		case ">":
			if(v > v1)
				return true;
			return false;
		case ">=":
			if(v >= v1)
				return true;
			return false;
		case "<":
			if(v < v1)
				return true;
			return false;
		case "<=":
			if(v <= v1)
				return true;
			return false;
		case "!=":
			if(v != v1)
				return true;
			return false;
		case "==":
			if(v == v1)
				return true;
			return false;
		case "between":
			if(v >= v1 && v <= v2)
				return true;
			return false;
		case "notBetween":
			if(v > v2 || v < v1)
				return true;
			return false;
		default:
			return true;
		}
	},
		
	_setData4List: function(range, rowIndex, colIndex){
		this._value1._isDirty = false;
		var ref = null;
		var list = [];
		var vList = [];
		var refTokens = range.getRefTokens();
		var valueRef = refTokens[0].getValue();
		if(!this._value1._tokens._error && valueRef.isValid()){
			if(this._value1._type == this.VALUETYPE.ABSFORMULA)
				 ref = valueRef._getRangeInfo();
			else if(this._value1._type == this.VALUETYPE.RELFORMULA)
				ref = this._getRelativeRangeInfo(rowIndex, colIndex, valueRef, refTokens[0].getRefMask(), range);
				
			var bRow = (ref.startRow == ref.endRow);
			var sheet = this._doc.getSheet(ref.sheetName);
			if(bRow){
				var row = sheet.getRow(ref.startRow);
				if(row)
					var maxColIndex = row._valueCells.length;
			}else
				var maxRowIndex = websheet.model.ModelHelper.getMaxRowIndex(sheet, ref.startCol, ref.endCol, true);
			var cols = websheet.model.ModelHelper.getCols(ref, true, true).data;
			var startCol = ref.startCol;
			var iter = new websheet.model.RangeIterator(ref, websheet.Constant.RangeIterType.NORMAL);
			iter.iterate(dojo.hitch(list, function(obj, row, col) {
				var cell = obj && obj.cell;
				if(bRow && col > maxColIndex)
					return false;
				if(!bRow && row > maxRowIndex)
					return false;
				
				if(cell!=null)
				{
					var styleCell = obj.styleCell;
					var colSid = cols[col - startCol] ? cols[col - startCol]._styleId : null;
					var v = cell.getShowValue(styleCell ? styleCell._styleId : colSid);
					list.push(v);
					var calVal = cell.getCalculatedValue();
					if(!cell.isFormula()){
						rawValue = cell.getRawValue();
						if(calVal != rawValue)
							calVal = rawValue;
						else if((cell.getType() >>3) == websheet.Constant.ValueCellType.STRING && websheet.Helper.isNumeric(rawValue)){
							calVal = "'" + rawValue;
						}
					}
					vList.push(calVal);
				}else{
					list.push("");
					vList.push("");
				}
				return true;
			}));
		}
		
		if(this._value1._type == this.VALUETYPE.ABSFORMULA){
			this._listObj ={showList: list,
							vList: vList};
		}
		else{
			var parsedRef = range._parsedRef;
			this._value1.setValue4Range({showList: list, vList: vList}, range._id, rowIndex - parsedRef.startRow, colIndex - parsedRef.startCol);
		}
	},
	
	_prepareData4List: function(range, rowIndex, colIndex, forList){
		var ref = null;
		range.updateTokens();
		var refTokens = range.getRefTokens();
		var area = refTokens[0].getValue();
		if(this._value1._type == this.VALUETYPE.ABSFORMULA){
			if(!this._value1._isDirty)
				return true;
			if(!this._value1._tokens._error && area.isValid())
				ref = area._getRangeInfo();
		}else if(this._value1._type == this.VALUETYPE.RELFORMULA){
			if(this._getData4List(range, rowIndex, colIndex))
				return true;
			if(area.isValid())
				ref = this._getRelativeRangeInfo(rowIndex, colIndex, area, refTokens[0].getRefMask(),range);
		}
		
		if(ref){
			var method = dojo.hitch(this, "_prepareData4List", range, rowIndex, colIndex, forList);
			if(ref.sheetName != range.getSheetName()){
				var controller = this._doc.controller;
				var bRet = controller && controller.getPartial(ref.sheetName);
				if(bRet){
					websheet.model.ModelHelper.getPartialManager().addNotify(method);
		   			return false;
				}
			}
			
			var pcm = this._doc._mhelper.getPartialCalcManager();
			var tm = this._doc._taskMgr;
			var callBack;
			if(forList)
				callBack = dojo.hitch(this,"getList",range,rowIndex, colIndex,this._callBack, true);
			else
				callBack = dojo.hitch(this,"_cellCalcFinished","list");
			tm.addTask(pcm, "startWithCondition", [ref,callBack], tm.Priority.UserOperation);
			tm.start();
			return false;
		}else{//invalid ref
			this._setData4List(range, rowIndex, colIndex);
			return true;
		}
	},
	
	_getRelativeRangeInfo: function(rowIndex, colIndex, area, refMask, baseRange){
		var deltaR = rowIndex - baseRange.getStartRow();
		var deltaC = colIndex - baseRange.getStartCol();
		return websheet.Utils.getDelRangeInfo(area, refMask, deltaR, deltaC);
	},
		
	_collectUnCal: function(range, value, tokenArray, rowIdx, colIdx, tmpId){
		var sheetName = range.getSheetName();
		var tokens = value._tokens;
		if(value._type == this.VALUETYPE.ABSFORMULA){
			var tmpCell = new websheet.model.RulesObject.DummyFormulaCell(tokens, tokenArray, sheetName, rowIdx, colIdx, tmpId, this._doc);
			return tmpCell;
		}
		
		var deltaR = rowIdx - range.getStartRow();
		var deltaC = colIdx - range.getStartCol();
		tmpTokenArray = value.createTokenArray4Index(sheetName, tokenArray, deltaR, deltaC);
		
		var tmpCell;
		if(tokens instanceof websheet.parse.tokenList)
			tmpCell = new websheet.model.RulesObject.DummyFormulaCell(tokens, tmpTokenArray, sheetName, rowIdx, colIdx, tmpId, this._doc);
		else
			tmpCell = new websheet.model.RulesObject.DummyFormulaCell(tmpTokenArray[0], tmpTokenArray, sheetName, rowIdx, colIdx, tmpId, this._doc);
		return tmpCell;
	},
	
	_prepareData: function(range, cell){
		var type = websheet.Constant.DataValidationType;
		this.calcingData = {};
		var pcm = this._doc._mhelper.getPartialCalcManager();
		var tm = this._doc._taskMgr;
		var rowIdx = cell.getRow();
		var colIdx = cell.getCol();
		if(this._type != type.CUSTOM && cell.isFormula() && cell.isDirty()){
			this.calcingData.cell = cell;
			var rangeInfo = {sheetName:cell.getSheetName(),
					startRow:rowIdx,
					endRow:rowIdx,
					startCol:colIdx,
					endCol:colIdx};
			var callback = dojo.hitch(this,"_cellCalcFinished","cell");
			tm.addTask(pcm, "startWithCondition", [rangeInfo,callback], tm.Priority.UserOperation);
		}
		if(this._type == type.LIST){
			var ret = true;
			if(this._value1._type == this.VALUETYPE.ABSFORMULA || (this._value1._type == this.VALUETYPE.RELFORMULA && this._getData4List(range, rowIdx, colIdx) == null)){
				ret = this._prepareData4List(range, rowIdx, colIdx);
				if(ret && Object.keys(this.calcingData).length != 0){
					tm.start();
					ret = false;
				}
			}
			return ret;
		}
		
		range.updateTokens();
		
		var tmpCells = {};
		var refTokens = range.getRefTokens();
		if((this._value1.isFormula()) && this._getData4Cell(range, cell) == null){
			var v1RefTokens = refTokens ? refTokens.slice(0,this._value1.getTokenLength()) : null;
			tmpCells.v1 = this._collectUnCal(range, this._value1, v1RefTokens, rowIdx, colIdx, range._id + "_cell1");
		}
		
		if(this._value2 && this._value2.isFormula() && this._getData4Cell(range, cell, true) == null){
			var v2RefTokens = refTokens ? refTokens.slice(this._value1.getTokenLength()) : null;
			tmpCells.v2 = this._collectUnCal(range, this._value2, v2RefTokens, rowIdx, colIdx, range._id + "_cell2");
		}
		
		if(Object.keys(tmpCells).length > 0){
			this.calcingData.criterias = tmpCells;
			var callback = dojo.hitch(this,"_cellCalcFinished","criterias");
			tm.addTask(pcm, "startWithDummyCells", [tmpCells,callback], tm.Priority.UserOperation);
		}
		
		if(Object.keys(this.calcingData).length == 0)
			return true;
		tm.start();
		return false;
	},
	
	_setDataCache: function(value, tmpCell)
	{
		value._isDirty = false;
		var updateTokens = tmpCell.getUpdateRefTokens();
		var v = tmpCell.getCalculatedValue();
		if(Object.keys(updateTokens).length !=0){
			var cacheCell = new websheet.model.RulesObject.RuleDataCache(v, updateTokens, this._doc);
			v = cacheCell;
			tmpCell.clearUpdateRefs(cacheCell);
		}
		
		if(value._type == this.VALUETYPE.ABSFORMULA)
			value._calculatedValue = v;
		else{
			var parsedRef = this._currRange._parsedRef;
			value.setValue4Range(v, this._currRange._id, tmpCell.getRow() -  parsedRef.startRow, tmpCell.getCol() -  parsedRef.startCol);
		}
	},
	
	_cellCalcFinished: function(key){
		switch(key){
		case "criterias":
			var tmpCells = this.calcingData[key];
			if(tmpCells.v1)
				this._setDataCache(this._value1, tmpCells.v1);
			if(tmpCells.v2)
				this._setDataCache(this._value2, tmpCells.v2);
			break;
		case "list":
			this._setData4List(this._currRange, this._cell.getRow(), this._cell.getCol());
			break;
		default:
			break;
		}
		delete this.calcingData[key];		
		if(Object.keys(this.calcingData).length ==0)
			this.validate(this._currRange, this._cell, this._cellResult, this._callBack);
	},
	
	getTokenIdxs: function(ref, tokenArray, tokenIdxs){
		if(!tokenIdxs)
			tokenIdxs = [];
		var len = tokenArray.length;
		var len1 = this._value1.getTokenLength();
		
		for(var idx = 0; idx < len1 && idx < len; idx ++){
			if(tokenArray[idx].getValue() == ref){
				tokenIdxs[0] = true;
				break;
			}
		}
		
		if(this._value2){
			for(var idx = len1; idx < len; idx++){
				if(tokenArray[idx].getValue() == ref){
					tokenIdxs[1] = true;
					break;
				}
			}
		}
		return tokenIdxs;
	},
	
	clearAllData: function(rangeId, dirtyFlag){
		if(!dirtyFlag)
			return;
		
		if(dirtyFlag[0]){
			this._value1._isDirty = true;
			this._value1.clearData(rangeId);
		}
		
		if(this._value2 && dirtyFlag[1]){
			this._value2._isDirty = true;
			this._value2.clearData(rangeId);
		}
	},
	
	clearData4Cell: function(rangeId, sr, sc, er, ec, dirtyFlag){
		if(!dirtyFlag)
			return;
		
		if(dirtyFlag[0])
			this._value1.clareData4Cell(rangeId, sr, sc, er, ec);
		
		if(this._value2 && dirtyFlag[1])
			this._value2.clareData4Cell(rangeId, sr, sc, er, ec);
	},
	
	clearAll: function(rangeId)
	{
		this._value1.clearData(rangeId);
		if(this._value2)
			this._value2.clearData(rangeId);
	},
	
	_getData4Cell: function(range, cell, isValue2){
		var value = isValue2 ? this._value2 : this._value1;
		if(!value)
			return null;
		if(value._type == this.VALUETYPE.ABSFORMULA){
			if(value._isDirty)
				return;
			var v = value.getValue();
			if(v instanceof websheet.model.RulesObject.RuleDataCache){
				if(v.isDirty){
					v.clearRefs();
					value._isDirty = true;
					return null;
				}else
					return v.value;
			}
			return v;
		}

		var data = value.getData4Range(range._id);
		if(!data)
			return null;
		var parsedRef = range._parsedRef;
		var rIdx = cell.getRow() - parsedRef.startRow;
		var cIdx = cell.getCol() - parsedRef.startCol;

		if(data[rIdx]){
			var v = data[rIdx][cIdx];
			if(v instanceof websheet.model.RulesObject.RuleDataCache){
				if(v.isDirty){
					data[rIdx][cIdx] = null;
					v.clearRefs();
					return null;
				}else
					return v.value;
			}
			return v;
		}
		return null;
	},
	
	_getData4List: function(range, rowIdx, colIdx, forShow){
		if(this._value1._tokens && this._value1._tokens.getTokenType() == websheet.parse.tokenType.FUNCTION_TOKEN)
			return [];
		
		var data = this._value1.getData4Range(range._id);
		if(!data)
			return null;
		
		var parsedRef = range._parsedRef;
		var rIdx = rowIdx - parsedRef.startRow;
		var cIdx = colIdx - parsedRef.startCol;

		if(data[rIdx]){
			var obj = data[rIdx][cIdx];
			if(obj){
				var ret = forShow ?  obj : obj.vList;
				return ret;
			}				
		}
		return null;
	},
	
	compare:function(baseRange, comRange)
	{
		var validation = comRange.data;
		if(this._type != validation._type)
			return false;
		if(this._operator != validation._operator)
			return false;
		if(this._prompt != validation._prompt)
			return false;
		
		if(!this._value1.compare(validation._value1, baseRange, comRange, 0))
			return false;
		if(this._value2 && !this._value2.compare(validation._value2, baseRange, comRange, this._value1.getTokenLength()))
			return false;
					
		return true;
	},
	
	getJSON4Range: function(rangeInfo, baseRange)
	{
		var json = this._toJSON();
		var criteria = json.criteria;
		var refTokens = baseRange.getRefTokens();
		if(refTokens && this._value1.isFormula())
			criteria.value1 = this._value1.updateValue(refTokens.slice(0, this._value1.getTokenLength()),baseRange, rangeInfo);
		else
			criteria.value1 = this._value1._value;
		if(this._value2 != null){
			if(refTokens && this._value2.isFormula())
				criteria.value2 = this._value2.updateValue(refTokens.slice(this._value1.getTokenLength()), baseRange, rangeInfo);
			else
				criteria.value2 = this._value2._value;
		}
		return json;
	},
	
	_toJSON:function(){
		var json = {};
		var criteria = {};
		json.criteria = criteria;
		criteria.type = this._type;
		criteria.operator = this._operator;
		
		if(this._showDropDown != null)
			criteria.showDropDown = this._showDropDown;
		if(this._allowBlank != null)
			criteria.allowBlank = this._allowBlank;
		if(this._showInputMsg != null)
			criteria.showInputMsg = this._showInputMsg;
		if(this._showErrorMsg != null)
			criteria.showErrorMsg = this._showErrorMsg;
		if(this._errorStyle != null)
			criteria.errorStyle = this._errorStyle;
		if(this._errorTitle != null)
			criteria.errorTitle = this._errorTitle;
		if(this._error != null)
			criteria.errorStyle = this._error;
		if(this._promptTitle != null)
			criteria.promptTitle = this._promptTitle;
		if(this._prompt != null)
			criteria.prompt = this._prompt;
		if(this._IME != null)
			criteria.IME = this._IME;
		return json;
	},

	isSplitable: function(bRow)
	{
	   var type = websheet.Constant.RelativeRefType;
	   var relRowV1 = this._value1._relRefType === type.ALL || this._value1._relRefType === type.ROW;
	   var relColV1 = this._value1._relRefType === type.ALL || this._value1._relRefType === type.COLUMN;
	   var relRowV2 = this._value2 ? (this._value2._relRefType === type.ALL || this._value2._relRefType === type.ROW) : false;
	   var relColV2 = this._value2 ? (this._value2._relRefType === type.ALL || this._value2._relRefType === type.COLUMN)  : false;
	   return bRow ? (relRowV1 || relRowV2) : (relColV1 || relColV2);
	}
});