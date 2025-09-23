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

dojo.provide("websheet.functions.n");

dojo.declare("websheet.functions.n", websheet.functions.FormulaBase, {

	constructor: function() {
		this.maxNumOfArgs = 1;
	},

	/*
	 * calculate
	 */
	/*value*/calc: function() {
		var value = this.args[0];
		// range expression, =SUMPRODUCT(N(A1:B2+1)), different with other functions or range
		// range expression result should be error type or number.
		
	    var type = value.getType();
		if(type == this.tokenType.SINGLEQUOT_STRING)
			throw websheet.Constant.ERRORCODE["525"];
		
		if(type == this.tokenType.DOUBLEQUOT_STRING)
			return 0;
			
		var result = this.analyzeToken(value);
		if (dojo.isArray(result)) {
			var len = result.length;
			var colLen = 1;
			var rowLen = 1;
			if (dojo.isArray(result[0])) {
				colLen = result[0].length;
				rowLen = result.length;
			} else {
				colLen = result.length;
				result = [result];
			}
				
			var array = result;
			for (var i = 0; i < rowLen; i++)
				for (var j = 0; j < colLen; j++)
					array[i][j] = this._convertValue(result[i][j], true);
				
			return array;
		}
			//result = this.analyzeToken(result[0]);
				
		if(this.isRangeObj(result)){
			var cell = result.getCell(0,0,true);
			if(cell){
				if(cell.isNumber())
					return cell.getComputeValue();
				var err = cell.getError();
				if(err) {
					throw err;
				}
				return 0;
			}
			return 0;
		}
		
		return this._convertValue(result);
	},
	
	_convertValue: function(result, ignoreErr) {
		var v = null;
		if(typeof result == "boolean")
			v = this.toInt(result);
		else if(typeof result == "string")
			v = 0;
		if(this.isNum(result))
			v = parseFloat(result);
		
		if (!v) {
			if (ignoreErr)
				v = result;
			else
				throw websheet.Constant.ERRORCODE["525"];
		}
		return v;
	}
});