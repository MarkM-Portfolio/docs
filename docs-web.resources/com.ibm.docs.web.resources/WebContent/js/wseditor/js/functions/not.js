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

dojo.provide("websheet.functions.not");

dojo.declare("websheet.functions.not", websheet.functions.FormulaBase, {
	
	constructor: function() {
		this.maxNumOfArgs = 1;
		this.inherited(arguments);
	},
	
	/*boolean*/calc: function() {
		var value= this.args[0]; 
		var parm = this.fetchScalaResult(value); 
		// parm can be any number
		// for =NOT("true") 
		if(typeof parm =="string")
			parm = this.toBoolean(parm);
		// for =NOT(FALSE) boolean value
		if(parm == 0 || parm == false)
			return true;
		else
			return false;
	}
	
});