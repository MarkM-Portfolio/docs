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

dojo.provide("websheet.functions.value");
dojo.declare("websheet.functions.value", [websheet.functions._singleargfunc], {
	
	constructor: function() {
		this.maxNumOfArgs = 1;
		this.inherited(arguments);
	},
	
	calc: function(context) {
		var value = this.args[0];
		return this.calcSingleArgFunc(context, value);
	},
	
	_operatorSingleValue: function(item) {
		// item may be a empty cell, for this function, convert to 0
		if (item == undefined) item = 0;
		var bCell = this.Object.isCell(item);
		var boolVar = bCell ? item.isBoolean() : (typeof(item) == "boolean");
		if(boolVar)
			throw websheet.Constant.ERRORCODE["519"];
		// throw error directly
		var err = bCell ? item.getError() : item;
		if (err && err.errorCode)
			throw err;
		
		var value = bCell ? item.getComputeValue() : item;
		var type = this.Object.isToken(item) ? item.getTokenType() : null;
		return this.getValue(value, type, this.LOCALE_NUM);//for the special input 
	}
});