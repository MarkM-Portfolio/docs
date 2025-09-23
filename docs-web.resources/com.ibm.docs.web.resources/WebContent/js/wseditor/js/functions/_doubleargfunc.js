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

dojo.provide("websheet.functions._doubleargfunc");
dojo.require("websheet.functions.FormulaBase");
dojo.declare("websheet.functions._doubleargfunc", websheet.functions.FormulaBase, {

	constructor: function() {		
		this.minNumOfArgs = 2;
	},
	
	/*boolean*/calc: function(context) {
		return this.calcDoubleArgFunc(this.args, context);
	},
	
	/*boolean*/calcDoubleArgFunc: function(values, context) {
		var firArg = values[0];
		var firType = firArg.getType();
		// the first argument is error, throw it; need check 2001
		var error = firArg.getError();
		if (error)
			throw error;
		
		var secArg = (values.length > 1) ? values[1] : null;
		// SINGLEQUOT_STRING is not accepted
		if (secArg) {
			var secType = secArg.getType();
			error = secArg.getError();
			if (error)
				throw error;
		}
		if(firType == this.tokenType.SINGLEQUOT_STRING || secType == this.tokenType.SINGLEQUOT_STRING)
			throw websheet.Constant.ERRORCODE["519"];
		
		var argInfo = this._getMaxRowColSize(this.args, context);
		// get array value when it has const array argument or is included in array functions
		// FLOOR(5,{1,2,3}) -> {5,4,3}. INDEX(FLOOR(A1:B2+4,3), 2, 2) is valid
		if (argInfo.maxRowSize > 1 || argInfo.maxColSize > 1) {
			return this._getArrayValue(argInfo, context);
		} else {
			// get scala value
			var firArgValue = this.fetchScalaResult(firArg);
			var secArgValue = this.fetchScalaResult(secArg);
			var result = this._calcSingleValue(firArgValue, secArgValue, context);
			return argInfo.bArray ? [result] : result;
		}
	},
	
	// if the first argument is an array, choose should return an array 
	// whose size is maxColSize and maxRowsize in all of arguments
	// Ex. FLOOR({1,2},{2;3;4}) should return an 3*2 array
	_getMaxRowColSize : function(values, context) {
		var length = values.length;
		var maxRowSize = 1;
		var	maxColSize = 1;
		var bArray = false;
		for (var i = 0; i < length; i++) {
			var argv = values[i];
			var res = this.analyzeToken(argv);
			var range = null;
			if (dojo.isArray(res)) {
				if(this.isRangeObj(res[0])){
					if(res.length == 1){
						range = this.analyzeToken(res[0]);
					} else
						throw websheet.Constant.ERRORCODE["519"];
				} else{
					res = this.getArrayRowColSize(res);
					if (res.rowSize > maxRowSize)
						maxRowSize = res.rowSize;
					if (res.colSize > maxColSize)
						maxColSize = res.colSize;
					if (!bArray)
						bArray = true;
				} 
			} else if (this.isRangeObj(res) ) {
				range = res;
			}
			if (range && this.isArrayValueFunc(context)) {
				var rangeInfo = range._getRangeInfo();
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
		if ((argInfo.maxRowSize > 1 || argInfo.maxColSize > 1) && !bArray)
			bArray = true;
		argInfo.bArray = bArray;
		return argInfo;
	},
	
	// calculate array value
	_getArrayValue : function(argInfo, context) {
		var firArgValue = this.analyzeToken(this.args[0]);
		var secArgValue = this.analyzeToken(this.args[1]);
		// result should be an array
		var result = [];
		// default value of the first argument
		var firArgRes = {};
		var secArgRes = {};
		for (var i = 0; i < argInfo.maxRowSize; i++) {
			var row = [];
			for (var j = 0; j < argInfo.maxColSize; j++) {
				var value;
				try {
					var firRawValue;
					// default value may be one single value
					if (firArgRes.defaultRow) {
						firRawValue = (firArgRes.defaultRow.length == 1) ? firArgRes.defaultRow[0] : firArgRes.defaultRow[j];
					} else {
						firArgRes = this.getArrayElementByPos(firArgValue, i, j);
						firRawValue = firArgRes.value;
					}
					
					var secRawValue;
					if (secArgRes.defaultRow) {
						secRawValue = (secArgRes.defaultRow.length == 1) ? secArgRes.defaultRow[0] : secArgRes.defaultRow[j];
					} else {
						secArgRes = this.getArrayElementByPos(secArgValue, i, j);
						secRawValue = secArgRes.value;
					}
					value = this._calcSingleValue(firRawValue, secRawValue, context);
				} catch(e) {
					// throw unparse error
					if (e == websheet.Constant.ERRORCODE["2001"])
						throw e;
					value = e;
				}
				row[j] = value;
			}
			// both arguments use default value, break
			if (secArgRes.defaultRow && firArgRes.defaultRow) {
				result.defaultValue = [row];
				result.rowSize = argInfo.maxRowSize;
				result.colSize = argInfo.maxColSize;
				break;
			}
			result[i] = row;
		}
		return result;
	}
});