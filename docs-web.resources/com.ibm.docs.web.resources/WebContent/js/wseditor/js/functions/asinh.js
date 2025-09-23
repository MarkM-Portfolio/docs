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

dojo.provide("websheet.functions.asinh");

dojo.declare("websheet.functions.asinh", websheet.functions.FormulaBase, {
	
	constructor: function() {
		this.maxNumOfArgs = 1;
		this.inherited(arguments);
	},
	//asinh(x) = ln[x + sqrt(x^2 + 1)]
	//acosh(x) = ln[x + sqrt(x^2 - 1)]
	/*int*/calc: function() {
		var myValue = this.getNumValue(this.args[0]);
		myValue = Math.log(myValue+Math.sqrt(Math.pow(myValue,2)+1));
	    return myValue;
	}
});