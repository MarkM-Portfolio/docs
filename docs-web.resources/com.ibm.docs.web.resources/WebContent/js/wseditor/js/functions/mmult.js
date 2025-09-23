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

/**
 * Summary: Multiplies the matrices A and B.
 */
dojo.provide("websheet.functions.mmult");
dojo.require("websheet.functions.FormulaBase");
dojo.declare("websheet.functions.mmult", websheet.functions.FormulaBase, {
	constructor:function(){
		this.maxNumOfArgs = 2;
		this.minNumOfArgs = 2;
		this.inherited(arguments);
	},
	
	/*array*/calc:function(context) {
		var values = this.args;
		var firArgRes = this.getArgInfo(context, values[0]);
		var secArgRes = this.getArgInfo(context, values[1]);
		// the column length of first argument is not equal second argument's row length;
		if (firArgRes.colSize != secArgRes.rowSize)
			throw websheet.Constant.ERRORCODE["519"];
		var rowSize = firArgRes.rowSize;
		var colSize = secArgRes.colSize;
		var firValue = firArgRes.array;
		var secValue = secArgRes.array;
		var array = [];
		for (var i = 0; i < rowSize; i++) {
			var rowValue;
			if (i < firValue.length)
				rowValue = firValue[i];
			else
				rowValue = firValue.defaultValue[0];
			var rowRes = [];
			for (var j = 0; j < colSize; j++) {
				rowRes[j] = this.calcSingleValue(rowValue, secValue, j, firArgRes.colSize);
			}
			array[i] = rowRes;				
		}
		
		return array;
	},
	
	// check the argument type and get its value and information(if range)
	getArgInfo: function(context, argv) {
		if (argv.getType() == this.tokenType.SINGLEQUOT_STRING)
			throw websheet.Constant.ERRORCODE["519"];
		var value = this.analyzeToken(argv);
		if (typeof value == "string" || typeof value == "boolean")
			throw websheet.Constant.ERRORCODE["519"];
		var result = this.calcSingleArgFunc(context, argv);
		return this.getArrayInfo(result);
	},
	
	// @rowValue: one row of the first argument
	// @rows: array the second argument
	// @colIndex: current column index of second argument
	// @length: first argument's column(second argument's row) length
	/*number*/calcSingleValue: function(rowValue, secValues, colIndex, length) {
		var result = 0;
		for (var j = 0; j < length; j++) {
			var firValue = rowValue[j];
			var secValue;
			if (j < secValues.length)
				secValue = secValues[j][colIndex];
			else
				secValue = secValues.defaultValue[0][colIndex];
			if (firValue && firValue.errorCode)
				throw firValue;
			else if (secValue && secValue.errorCode)
				throw secValue;
			else if (typeof firValue == "number" && typeof secValue == "number")
				result = websheet.Math.add(result, websheet.Math.mul(firValue, secValue));
			else
				throw websheet.Constant.ERRORCODE["519"];
		}
		return result;
	},
	
	_operatorSingleValue: function(item) {
		// item may be a empty cell, for this function, throw #VALUE!
		if (item == undefined)
			throw websheet.Constant.ERRORCODE["519"];
		var bCell = this.Object.isCell(item);
		var curObj = bCell ? item.getError() : item;
		// throw error directly
		if (curObj && curObj.errorCode)
			throw curObj;
		// get value, convert to number and then div 100
		var value = bCell ? item.getComputeValue() : item;
		return value;
	}
	
//	/*number*/calc2:function(){
//		var values = this.args;
//		var type1=values[0].getTokenType();
//		var type2=values[1].getTokenType();
//		if(type1 == this.tokenType.SINGLEQUOT_STRING
//				||type1 == this.tokenType.DOUBLEQUOT_STRING
//				||type1 == this.tokenType.BOOLEAN_TOKEN
//				||type1 == this.tokenType.NONE_TOKEN
//				||type2 == this.tokenType.SINGLEQUOT_STRING
//				||type2 == this.tokenType.DOUBLEQUOT_STRING
//				||type2 == this.tokenType.NONE_TOKEN
//				||type2 == this.tokenType.BOOLEAN_TOKEN)
//				throw websheet.Constant.ERRORCODE["525"];
//		// only validate the param 1.
//		if(type1 == this.tokenType.ARRAYFORMULA_TOKEN && values[0].length > 1){
//			throw websheet.Constant.ERRORCODE["519"];
//		}
//		// ToDo: should use array value for range expression
//		var arg1 = this.analyzeToken(values[0]);
//		arg1 = this._getArrayRes(arg1);
//				
//		var arg2 = this.analyzeToken(values[1]);
//		arg2 = this._getArrayRes(arg2);
//				
//		if((type1==this.tokenType.OPERATOR_TOKEN&& typeof arg1 == "boolean")
//		||(type2==this.tokenType.OPERATOR_TOKEN&& typeof arg2 == "boolean"))
//			throw websheet.Constant.ERRORCODE["519"];
//		
//		var sum=0;
//		var multA=this._checkAndGetValues(arg1,true); // get first row in A.
//		var multB=this._checkAndGetValues(arg2,false); // get first column in B.
//		// Constraints: COLUMNS(A)=ROWS(B)
//		if(multA.length!=multB.length)
//			throw websheet.Constant.ERRORCODE["519"];
//		// get 2 arrays which is from first row in A and first column in B.
//		for(var i=0;i<multA.length;i++){
//			sum=websheet.Math.add(sum,websheet.Math.mul(multA[i],multB[i]));
//		}
//		return sum;
//	},
//	
//	_checkAndGetValues:function(arg,bRow){
//		var result=[];
//		if(this.isRangeObj(arg)){
//			var rangeInfo=arg._getRangeInfo();
//			var startRow = rangeInfo.startRow;
//			var endRow = rangeInfo.endRow;
//			var startCol = rangeInfo.startCol;
//			var endCol = rangeInfo.endCol;
//			// check cells
//			var cellArray=arg.getCells(true);//var cellArray=websheet.model.ModelHelper.getCells(rangeInfo,true);
//			// check total cells number because we can't the exact sum of cells via getCells.
//			var length = cellArray.length;
//			if(length!=((endCol+1-startCol)*(endRow+1-startRow)))
//				throw websheet.Constant.ERRORCODE["519"];
//			
//			for (var i = 0; i < length; ++i) {
//				var cell = cellArray[i];
//				if(!cell.isNumber())
//					throw websheet.Constant.ERRORCODE["519"];
//				if(bRow){
//					if(cell.getRow()==startRow)
//						result.push(cell.getComputeValue());	
//				}else{
//					if(cell.getCol()==startCol)
//						result.push(cell.getComputeValue());
//				}
//			}
//		}else{
//			result.push(arg);
//		}
//		return result;
//	},
//	
//	// get the first element of constant-array or single result or intersection
//	// {1,2,3} get 1, (a1:a2 a1) get a1
//	_getArrayRes: function(range) {
//		if(dojo.isArray(range)) {
//			var res = this.analyzeToken(range[0]);
//			if(this.isRangeObj(res) && range.length > 1)
//				throw websheet.Constant.ERRORCODE["519"];
//			else
//				range = res;
//		}
//		return range;
//	}
});