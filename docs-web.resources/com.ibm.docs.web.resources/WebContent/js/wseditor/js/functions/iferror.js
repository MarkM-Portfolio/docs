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

dojo.provide("websheet.functions.iferror");
dojo.declare("websheet.functions.iferror", websheet.functions.FormulaBase, {
	
	_bNa: false,

	constructor: function() {
		this.minNumOfArgs = 2;
		this.maxNumOfArgs = 2;
	},

	calc: function(context) {
		var msgNA = websheet.functions.errMsg.NA;
		var firstArg = this.args[0];
		var secondArg = this.args[1];
		var firstValue = this.analyzeToken(firstArg);
		if (dojo.isArray(firstValue) && !this.isRangeObj(firstValue[0])) { 
			var secondValue = null;
			var result = dojo.map(firstValue, function(row){
				return dojo.map(row, function(item) {
					if (item.errorCode) {
						if (context._bNa && item.message != msgNA) {
							return item;
						}
						if (!secondValue) {
							secondValue = this._getValue(secondArg);
						}
						return secondValue;
					} else {
						return item;
					}
				}, this);
			}, this);
			return result;
		} else {
			try {
				return this._getValue(firstArg);
			} catch (error) {
				if (context._bNa && error.message != msgNA) {
					throw error;
				}
				return this._getValue(secondArg);
			}
		}
	},
	
	_getValue: function(value) {
		var error = value.getError();
		if (error) {
			throw error;
		}
		return this.fetchScalaResult(value);
	}
});