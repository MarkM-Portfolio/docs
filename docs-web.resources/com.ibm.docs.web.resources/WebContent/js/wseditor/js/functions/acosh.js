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

dojo.provide("websheet.functions.acosh");
dojo.declare("websheet.functions.acosh", websheet.functions.FormulaBase, {
	
	constructor: function() {
		this.maxNumOfArgs = 1;
		this.inherited(arguments);
	},
	//arcsh(x) = ln[x + sqrt(x^2 + 1)]
	//arcch(x) = ln[x + sqrt(x^2 - 1)]
	calc: function() {
		var myValue = this.getNumValue(this.args[0]);
		if(myValue<1){
			throw websheet.Constant.ERRORCODE["504"];
		}
		myValue = Math.log(myValue+Math.sqrt(myValue*myValue-1));
	    return myValue;
	}
});