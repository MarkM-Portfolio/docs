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

dojo.provide("websheet.functions.factdouble");

dojo.declare("websheet.functions.factdouble", websheet.functions.FormulaBase, {
	
	constructor: function() {
		this.maxNumOfArgs = 1;
	},
	
	/*int*/calc: function() {
		var value = 1;
		var fact = this.getNumValue(this.args[0]);
		
		if(fact <0)
			throw websheet.Constant.ERRORCODE["504"];
		
		fact = parseInt(fact);
		while(fact > 1){
			value *= fact;
			fact -= 2;
		}
		
		if(!isFinite(value))
			throw websheet.Constant.ERRORCODE["504"];
		return value;
	}
	
});