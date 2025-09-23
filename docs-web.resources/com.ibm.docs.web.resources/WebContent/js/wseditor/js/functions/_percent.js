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

dojo.provide("websheet.functions._percent");

dojo.declare("websheet.functions._percent", websheet.functions.FormulaBase, {

	constructor: function() {
		this.minNumOfArgs = 1;
		this.maxNumOfArgs = 1;
	},
	
	/*number*/calc: function(context) {
		var value = this.args[0];
		if(value.getError())
			throw value.getError();
		return this.calcSingleArgFunc(context, value);
	},
	
	_operatorSingleValue: function(item) {
		// item may be a empty cell, for this function, convert to 0
		if (item == undefined) item = 0;
		var bCell = this.Object.isCell(item);
		var curObj = bCell ? item.getError() : item;
		// throw error directly
		if (curObj && curObj.errorCode)
			throw curObj;
		// get value, convert to number and then div 100
		var value = bCell ? item.getComputeValue() : item;
		value = this.parseNumber(value, this.LOCALE_NUM);
		value = websheet.Math.div(value, 100);
		return value;
	}
});