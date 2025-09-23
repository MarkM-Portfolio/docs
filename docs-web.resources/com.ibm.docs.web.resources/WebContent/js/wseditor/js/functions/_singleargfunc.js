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

dojo.provide("websheet.functions._singleargfunc");
dojo.declare("websheet.functions._singleargfunc", websheet.functions.FormulaBase, {

	constructor: function() {		
		this.maxNumOfArgs = 1;
	},
	
	/*boolean*/calc: function(context) {
		var value = this.args[0];		
		if(value.getError())
			return this._operatorSingleValue(value.getError());
		
		return this.calcSingleArgFunc(context, value, true);
	},
	
	// handle with union/intersection
	operatorUnionValue : function(context) {
		var curFuncName = this.getCurrentFunc(context);
		if(curFuncName == "ISERR" || curFuncName == "ISERROR")
			return true;
		else
			return false;
	}
});