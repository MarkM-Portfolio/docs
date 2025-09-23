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

dojo.provide("websheet.functions.lookup");

dojo.declare("websheet.functions.lookup", websheet.functions.vlookup, {
	
	constructor: function() {
		this.minNumOfArgs = 2;
		this.maxNumOfArgs = 3;
	},
	
	/*int*/calc: function(context) {
		//clear all the update tokens
		context.currentToken.removeAllUpdateRefToken(context.currentCell);
		/*
		 * lookup_value: number, text or TRUE/FALSE
		 * lookup_vector: A1:B1, or B1:B100, or {"a", "b", "c"}
		 * result_vector: A1:B1, or B1:B100, or {"a", "b", "c"}
		 */
		var values = this.args;
		var firArg = values[0];
	
		var table_array = this._parseTableArray(values[1], context);
		// set array information for array
		var info = {};
		if (context.isArray) {
			info = this.getArrayInfo(table_array);
			context.info = {startRow:1,startCol:1,endRow:info.rowSize,endCol:info.colSize};
			table_array = info.array;
		} else {
			context.info = table_array._getRangeInfo();
			info.rowSize  = context.info.endRow - context.info.startRow + 1;
			info.colSize  = context.info.endCol - context.info.startCol + 1;
		}
		
		var pos;
		if(info.rowSize < info.colSize){
			context.bHLOOKUP = true;
			pos = info.rowSize;
		} else{
			context.bHLOOKUP = false;
			pos = info.colSize;
		}
		// get parameter1's position in parameter 2 array
		// is array
		var range_lookup = 1; // not exact match
		var firValue = this.analyzeToken(firArg);
		if (dojo.isArray(firValue) && !this.isRangeObj(firValue[0])) {
			return this._calcArrayValue(firValue, table_array, pos, range_lookup, context);
		} else {
			var criterion = this._parseCriterion(firArg);
			return this._calcSingleValue(criterion,table_array, pos, range_lookup, context);
		}
	},
	
	
	_calcSingleValue : function(criterion,table_array, pos, range_lookup, context) {
		// get parameter1's position in parameter 2 array 
		var values = this.args;
		var find_pos = this._lookup(criterion,table_array, pos, range_lookup, context);
		if (values.length == 2){
			return this._getInArrayResult(table_array, find_pos, pos, context);
		} else if( values.length == 3){
			return this._getOuterResult(values[2], find_pos, context);
		}
	},
	
	_getOuterResult: function(value, index, context){
		var resultType = value.getType();
		if (resultType == this.tokenType.NONE_TOKEN){
			throw websheet.Constant.ERRORCODE["519"]; // #VALUE!
		} else {
			var result = this.analyzeToken(value);
			
			if(dojo.isArray(result) && this.isRangeObj(result[0])) {
				if (result.length == 1)
					result = this.analyzeToken(result[0]);		
				else
					throw websheet.Constant.ERRORCODE["519"]; //#VALUE
			}
			if(!this.Object.isReference(result)) {
				var info = this.getArrayInfo(result);
				// when lookup has 3 parameters, if the col or row size isn't 1, throw
				if (info.rowSize > 1 && info.colSize > 1)
					throw  websheet.Constant.ERRORCODE["7"];
				
				if (info.rowSize == 1 && index < info.array[0].length)
					return info.array[0][index];
				else if (info.colSize == 1 && index < info.array.length)
					return info.array[index][0];
				throw  websheet.Constant.ERRORCODE["7"];
			} else {
				var info = result._getRangeInfo();
				var isHorizontal = false;
				if (info.endRow != info.startRow && info.endCol != info.startCol){
					throw  websheet.Constant.ERRORCODE["7"];//#N/A
				} else if(info.endRow == info.startRow){ // one row or one cell
					isHorizontal = true;
				}
				return this._fetchResult(info, index, isHorizontal, context);
			}
		}
	},
	
	_fetchResult: function(info, index, isHorizontal, context){
		var rowNum = isHorizontal? info.endRow : info.startRow + index;
		var colNum = isHorizontal? info.startCol + index: info.endCol;
		var sheetName = info.sheetName; 
		
		var valueCell;
		var currentCell = context.currentCell;
		if(this.Object.JS){
			if(!context.isArray){
				var pRef = new websheet.parse.ParsedRef(info.sheetName, rowNum, colNum, rowNum, colNum, websheet.Constant.RANGE_MASK);
				var updateToken = this.generateUpdateToken(context.currentToken, pRef, info.sheetName, currentCell);
			}
			valueCell = currentCell._getDocument().getCell(sheetName, rowNum, colNum);
		}
		if(valueCell != undefined) {
			var value = valueCell.getComputeValue();
			if(valueCell.isBoolean())
				value = Boolean(value);
			return value;
		} else
			return 0;
	}
});
