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

dojo.provide("websheet.functions.countblank");

dojo.declare("websheet.functions.countblank", websheet.functions.FormulaBase, {
	
	constructor: function() {
		this.maxNumOfArgs = 1;
		this.inherited(arguments);
	},
	
	/*float*/calc: function() {
		var values = this.args;
		var result = this.analyzeToken(values[0]);
		
		if(dojo.isArray(result)) {
			if(result.length == 1)
				result = this.analyzeToken(result[0]);
			else
				throw websheet.Constant.ERRORCODE["519"];
		}
		
		//parameter must be a cell/range ref
		if(!this.isRangeObj(result))
			throw websheet.Constant.ERRORCODE["504"];
		
		if(!result.isValid())
			throw websheet.Constant.ERRORCODE["524"];
		
		var countValue = 0;
		var param = {bIgnoreError: true}; //bIgnoreError = true, because counta is ignore error formula
		this.iterateWithFunc(result, function(cell, row, col) {
			var value = cell.getComputeValue();
			if(value !== "" && value != null)
				countValue++;
			return true;
		}, param);
		
		var info = result._getRangeInfo();
		var startCol = info.startCol;
		var startRow = info.startRow;
		var endCol = info.endCol;
		var endRow = info.endRow;
		var rowCnt = endRow - startRow + 1;
		var colCnt = endCol - startCol + 1;
		var count = rowCnt * colCnt;
		
		return count - countValue;
	}
});