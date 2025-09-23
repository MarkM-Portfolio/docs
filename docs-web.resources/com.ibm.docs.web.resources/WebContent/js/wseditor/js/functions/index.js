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

dojo.provide("websheet.functions.index");

dojo.declare("websheet.functions.index", websheet.functions.FormulaBase, {
	
	constructor: function() {
		this.maxNumOfArgs = 4;
		this.minNumOfArgs = 2; // the ms min size is 2 but not symphony
	},
	
	/*int*/calc: function(context) {
		//clear all the update tokens
		context.currentToken.removeAllUpdateRefToken(context.currentCell);
		
		var values = this.args;
		
		var firArg = values[0];
		var length = values.length;
		
		var firArgValue = this.analyzeToken(firArg);
		
		// first argument is union/intersection
		var bUnion = false;
    	if (dojo.isArray(firArgValue) && this.isRangeObj(firArgValue[0]))
    		bUnion = true;

    	var selectAreaIndex = -1;
    	// get the first argument if argument length is 4
		if(length == 4){
			var area = this.fetchScalaResult(values[3]);
			var areaNum = this.parseNumber(area, this.LOCALE_NUM);
			areaNum = parseInt(areaNum);
			var firArglen = 1;
			if (bUnion)
				firArglen = firArgValue.length;
	    	
			if(areaNum > firArglen) 
				throw websheet.Constant.ERRORCODE["524"]; //#REF!
			else if(areaNum <= 0)
				throw websheet.Constant.ERRORCODE["519"];
			
			if (bUnion) {
				selectAreaIndex = areaNum - 1;
				firArgValue = firArgValue[selectAreaIndex].getValue();
			}
		} else if (length == 3 && bUnion) {
			selectAreaIndex = 0;
			firArgValue = firArgValue[selectAreaIndex].getValue();
		}
		if(selectAreaIndex > -1){
			//the first arg's value is the reference token array
			var refTokens = firArg.getReferenceToken();
			for(var i = 0; i < refTokens.length; i++){
				if(i != selectAreaIndex){
					var refToken = refTokens[i];
					refToken.setProp(websheet.Constant.RefType.IGNORESET);
				}
			}
		}
		
		// range should be handled specially
		if (this.isRangeObj(firArgValue))
			return this._getRangeToken(firArg, firArgValue, values, context);
		
		// get the first argument's array value
		var arrayValue = this.calcSingleArgFunc(context, firArg, true, 0);
		var firArgInfo = this.getArrayRowColSize(arrayValue);
		this._getRowAndColIndex(firArgInfo.rowSize, firArgInfo.colSize, context);
        // get the result by rowIndex & colIndex
		// 0 means get the whole first argument, index({1,2},0) -> {1,2}
        var ret;
        // single value, just return
        if (!dojo.isArray(arrayValue))
        	return arrayValue;
        else {
	        if (context.rowIndex == 0)
	        	ret = arrayValue;
	        else if (context.rowIndex <= arrayValue.length)
	        	ret = arrayValue[context.rowIndex - 1];
	        else if (arrayValue.defaultValue)
	        	ret = arrayValue.defaultValue[0];
	     
	        if (context.colIndex) {
	        	// the ret may be a 2D array, return 1D of colIndex
	        	if (dojo.isArray(ret) && dojo.isArray(ret[0])) {
	        		var result = [];
	        		for (var i = 0; i < ret.length; i++) {
	        			result[i] = ret[i][context.colIndex - 1];
	        		}
	        		ret = result;
	        	} else {
	        		ret = ret[context.colIndex - 1];
	        	}
	        }
        }
        return ret;
  	},
	
  	// if the first argument is a range, should return a range too
  	// index(a1:c3, 0, 2) -> b1:b3, index(a1:c3, 2, 0) -> a2:c2, index(a1:c3, 2, 2) -> b2
  	_getRangeToken : function (firArg, firArgValue, values, context) {
		var rangeInfo = firArgValue._getRangeInfo();
		var rowSize = rangeInfo.endRow - rangeInfo.startRow + 1;
		var colSize = rangeInfo.endCol - rangeInfo.startCol + 1;
		// index(A1:C4,2) --> #REF!, not same behavior with array
		if (rowSize > 1 && colSize > 1 && this.args.length == 2)
			throw websheet.Constant.ERRORCODE["524"];
  		
  		this._getRowAndColIndex(rowSize, colSize, context);
		// selected range size
		var startRow = rangeInfo.startRow;
		var endRow = rangeInfo.endRow;
		var startCol = rangeInfo.startCol;
		var endCol = rangeInfo.endCol;
		if (context.colIndex == 0 && context.rowIndex == 0)
			return firArg;
		else if (context.colIndex == 0 && context.rowIndex) 
			endRow = startRow = context.rowIndex + startRow - 1;
		else if (context.rowIndex == 0 && context.colIndex)
			endCol = startCol = context.colIndex + startCol - 1;
		else {
			endRow = startRow = context.rowIndex + startRow - 1;
			endCol = startCol = context.colIndex + startCol - 1;
		}
		// get selected range, and check whether current cell is in the address(circle reference)
  		var sheetName = firArgValue.getSheetName();
		var parsedRef = new websheet.parse.ParsedRef(sheetName, startRow, startCol, endRow, endCol, websheet.Constant.RANGE_MASK);
		// get current parsed cell information
		var curCell = context.currentCell;
		// return the selected range token
		firArg.setProp(websheet.Constant.RefType.IGNORESET);
		var updateToken = this.generateUpdateToken(context.currentToken, parsedRef, sheetName, curCell);
		// the rule of function token list which return the reference token
		// should always set recalc type to ancestor to avoid function token list recalc when reference content or size changed
		updateToken.setRecalcType(websheet.Constant.RecalcType.ANCESTOR);
		return updateToken;
  	},
  	
  	// get row index from the second argument
  	// get col index from the third argument
  	_getRowAndColIndex: function(rowSize, colSize, context) {
		var rowIndex = this._getIndex(this.args[1], rowSize);
		if( rowIndex < 0)
			throw websheet.Constant.ERRORCODE["519"];
		else if((this.args.length == 2) && (rowSize == 1) && (rowIndex <= colSize)) {
			// index({1,2},2): 2, when the first arguments are in one row, and just has 2 arguments
			// rowIndex is calculated as colIndex
			context.rowIndex = 1;
			context.colIndex = rowIndex;
			return;
		}else if(rowIndex <= rowSize)
			context.rowIndex = rowIndex;
		else 
			throw websheet.Constant.ERRORCODE["524"];
		
		if(this.args.length == 3 || this.args.length == 4){
			var colIndex = this._getIndex(this.args[2], colSize);
			if( colIndex < 0 || colIndex > colSize)
				throw websheet.Constant.ERRORCODE["524"];
			context.colIndex = colIndex;
		}else
			context.colIndex = 0;
  	},
  	
	// rowIndex and colIndex always get scala value
	_getIndex: function(value,num){
		var index = 1;
		if(value == null || value.getType() == this.tokenType.NONE_TOKEN)
			return 0;
		var res = this.fetchScalaResult(value);
		if(res!=undefined){
			index = this.parseNumber(res);
			index = parseInt(index);
		}
		
		return index;
	},
	
	_operatorSingleValue: function(item) {
		// throw error directly
		if (item && item.errorCode)
			throw item;
		return item;
	}
});