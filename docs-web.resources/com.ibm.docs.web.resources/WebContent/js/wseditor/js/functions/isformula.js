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

dojo.provide("websheet.functions.isformula");

dojo.declare("websheet.functions.isformula", websheet.functions.FormulaBase, {
	
	constructor: function() {
		this.maxNumOfArgs = 1;
		this.inherited(arguments);
	},
	
	/*boolean*/calc: function(context) {
		var value = this.args[0];
		if(value.getType() == this.tokenType.SINGLEQUOT_STRING)
			throw websheet.Constant.ERRORCODE["519"];		
		// the tokenList is not error
		var result = this.analyzeToken(value);
		if(dojo.isArray(result)) {
			if (this.isRangeObj(result[0])) {
				result = this.analyzeToken(result[0]);
			} else {
				// just accept reference
				return false;
			}
		}
		
		var bIgnoreError = true;
		if (this.isRangeObj(result)) {
			if (!this.isArrayValueFunc(context) || result.isSingleCell()) {
				// just first cell when it's a single cell or not need range(scala cell)
				var cell = result.getCell(0, 0, true, bIgnoreError);
				return this._operatorSingleValue(cell);
			} else {
				return this.iterate2D(result, bIgnoreError);
			}
		}
		return false;
	},
	
	_operatorSingleValue: function(item) {
		var bCell = this.Object.isCell(item);
		return  bCell ? item.isFormula() : false;
	}
});