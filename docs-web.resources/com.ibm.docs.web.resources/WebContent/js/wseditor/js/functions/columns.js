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
 * Summary: Returns the number of columns in a given range
 */
dojo.provide("websheet.functions.columns");
dojo.require("websheet.functions.FormulaBase");
dojo.declare("websheet.functions.columns", websheet.functions.FormulaBase, {
	constructor:function(){
		this.maxNumOfArgs = 1;
	},
	/*number*/calc:function(){
		var value = this.args[0];
		if(value && value.getError())
			this._throwError(value.getError(), value);
		var type = value.getType();
		if(type == this.tokenType.SINGLEQUOT_STRING || type == this.tokenType.DOUBLEQUOT_STRING || type == this.tokenType.BOOLEAN_TOKEN)
			throw websheet.Constant.ERRORCODE["525"];

		var res = this.analyzeToken(value);
		if (type==this.tokenType.OPERATOR_TOKEN&& typeof res == "boolean")
			throw websheet.Constant.ERRORCODE["519"];
		
		var result = 1;
		if(dojo.isArray(res)){
			// array result of range/const-array
			if (!this.isRangeObj(res[0])) {
				// result of range expression
				if (res.colSize)
					result = res.colSize;
				else if (dojo.isArray(res[0]))
					result = res[0].length;
				else
					result = res.length;
			} else {
				// array result of intersection/union
				if (res.length == 1) {
					res = res[0];
					res = this.analyzeToken(res);
				}else
					throw websheet.Constant.ERRORCODE["524"];   // #REF!
			}
		} 
		if (this.isRangeObj(res)) {
			this.args[0].setProp(websheet.Constant.RefType.IGNORESET);
			var range = res._getRangeInfo();
			var startCol = range.startCol;
			var endCol = range.endCol;
			if(endCol>websheet.Constant.MaxColumnIndex)
				throw websheet.Constant.ERRORCODE["525"];
			result = endCol-startCol+1;
		}
		return result;
	}
});	