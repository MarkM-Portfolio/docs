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

dojo.provide("websheet.functions.choose");

dojo.declare("websheet.functions.choose", websheet.functions.FormulaBase, {
	
	_bIf : false,
	constructor: function() {
		this.minNumOfArgs = 2;
		this.maxNumOfArgs = 31;
//		this.inherited(arguments);
	},
	
	/*int*/calc: function(context) {
		var firArg = this.args[0];
		// SINGLEQUOT_STRING is not accepted
		var type = firArg.getType();
		if(type == this.tokenType.SINGLEQUOT_STRING)
			throw websheet.Constant.ERRORCODE["519"];
		
		// the first argument is error, throw it; need check 2001
		var error = firArg.getError();
		if (error)
			throw error;
		
		var chooseArray = [];
		context.chooseArray = chooseArray;
		var result;
		var firArgValue = this.analyzeToken(firArg);
		// always get scala value for range expresison/range
		if (dojo.isArray(firArgValue) && !this.isRangeObj(firArgValue[0])) {
			var argInfo = this._preCheck(context, firArgValue);
			result = this._getArrayValue(context, firArgValue, argInfo);
		} else {
			// if the first argument isn't an array, return the selected argument's value
			var result = this.fetchScalaResult(firArg);
			result = this._selectValue(context, result, type);
		}
		for(var i = 1; i < this.args.length; i++){
			if(chooseArray[i] == 1){
				this.args[i].removeProp(websheet.Constant.RefType.IGNORESET);
			} else {
				this.args[i].setProp(websheet.Constant.RefType.IGNORESET);
			}
		}
		return result;
	},
	
	// if the first argument is an array, choose should return an array 
	// whose size is maxColSize and maxRowsize in all of arguments
	// Ex. CHOOSE({1,2},A1:A5, B1:C1) should return an 5*2 array
	_preCheck : function(context, firArgValue) {
		var firArgInfo = this.getArrayRowColSize(firArgValue);
		var maxRowSize = firArgInfo.rowSize;
		var	maxColSize = firArgInfo.colSize;
		var hasUnion = false;
		var len = this.args.length;
		var bArray = (context.funcStack.length > 0); // This stack doesn't contain current function
		for (var i = 1; i < len; i++) {
			var argv = this.args[i];
			if(argv.getType() == this.tokenType.SINGLEQUOT_STRING)
				throw websheet.Constant.ERRORCODE["519"];
			var res = this.analyzeToken(argv);
			if (dojo.isArray(res)) {
				if (!this.isRangeObj(res[0])) {
					res = this.getArrayRowColSize(res);
					if (res.rowSize > maxRowSize)
						maxRowSize = res.rowSize;
					if (res.colSize > maxColSize)
						maxColSize = res.colSize;
				} else if (res.length > 1 && !hasUnion) {
					hasUnion = true;
				}
			} else if (this.isRangeObj(res) && bArray) {
				var rangeInfo = res._getRangeInfo();
				var rowSize = rangeInfo.endRow - rangeInfo.startRow + 1;
				var colSize = rangeInfo.endCol - rangeInfo.startCol + 1;
				if (rowSize > maxRowSize)
					maxRowSize = rowSize;
				if (colSize > maxColSize)
					maxColSize = colSize;
			}
		}
		var argInfo = {};
		argInfo.maxRowSize = maxRowSize;
		argInfo.maxColSize = maxColSize;
		argInfo.hasUnion = hasUnion;
		argInfo.bArray = bArray;
		return argInfo;
	},
	
	// Ex. CHOOSE({1,2},A1:A5, B1:C1) should return an 5*2 array. so we need extend the arguments to 5*2 array too
	// rule: 1. the number in the first argument just tell us the selected argument
	//       2. if first and selected argument both are array, need use its position to get one value
	// Ex. 2 in array, need select B1:C1, because 2's position is (row:1,col:2), so need get C1's value
	_getArrayValue : function(context, firArgValue, argInfo) {
		// special case, if the first argument is const-array, and one argument is union, throw #N/A
		// should ignore this in array formula
		if (argInfo.hasUnion)
			throw websheet.Constant.ERRORCODE["7"];
		// result should be an array
		var result = [];
		// default value of the first argument
		var defaultIndex = {};
		for (var i = 0; i < argInfo.maxRowSize; i++) {
			var row = [];
			var defaultArgCount = 0;
			for (var j = 0; j < argInfo.maxColSize; j++) {
				var selectedData;
				var defaultValue = {};
				try {
					var selectedArg;
					if (defaultIndex.defaultRow) {
						var value = (defaultIndex.defaultRow.length == 1) ? defaultIndex.defaultRow[0] : defaultIndex.defaultRow[j];
						selectedArg = this._selectValue(context, value);
					} else {
						defaultIndex = this.getArrayElementByPos(firArgValue, i, j, defaultIndex)
						selectedArg = this._selectValue(context, defaultIndex.value);
					}
					// get element from value by i and j
					selectedData = this.analyzeToken(selectedArg);
					if (dojo.isArray(selectedData) && !this.isRangeObj(selectedData[0])) {
						defaultValue = this.getArrayElementByPos(selectedData, i, j);
						selectedData = defaultValue.value;
					} else if (this.isRangeObj(selectedData)) {
						if (argInfo.bArray) {
							defaultValue = this.getArrayElementByPos(selectedData, i, j);
							selectedData = defaultValue.value;
						} else
							selectedData = this.fetchScalaResult(selectedData);
					} else {
						selectedData = selectedArg.getValue();
						defaultArgCount++;
					}
					// both the value and index use default value
					if (defaultIndex.defaultRow && defaultValue.defaultRow)
						defaultArgCount++;
				} catch(e) {
					selectedData = e;
				}
				row[j] = selectedData;
			}
			result[i] = row;
			// if all of selected arguments use defaultValue, set result's defaultValue
			if (defaultArgCount == argInfo.maxColSize) {
				result.defaultValue = [row];
				result.rowSize = argInfo.maxRowSize;
				result.colSize = argInfo.maxColSize;
				break;
			}
		}
		return result;
	},
	
	// select the indexed data
	// Ex. CHOOSE({1,2},A1:A5, B1:C1), index should be 1 or 2 in the first argument
	_selectValue : function(context, index, type) {
		if (index == undefined)
			throw websheet.Constant.ERRORCODE["7"]; 
		var value = this.getValue(index, type, this.LOCALE_NUM);
		
		if (this._bIf)
			value = value ? 1 : 2;
		else
			value = Math.floor(value);
		
		var valCnt = this.args.length - 1;
		if (value > 0 && value <= valCnt)
		{
			var choose = this.args[value];
			this._throwError(choose.getError());
			
			var chooseArray = context.chooseArray;
			chooseArray[value] = 1;
			return choose;
		}
		
		if (this._bIf && value == 2 && valCnt == 1 ){
			return false;
		}
		
		throw websheet.Constant.ERRORCODE["519"]; // #VALUE!
	}
});