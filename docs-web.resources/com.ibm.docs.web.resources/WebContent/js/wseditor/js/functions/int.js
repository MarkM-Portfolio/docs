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

dojo.provide("websheet.functions.int");
dojo.require("websheet.functions.FormulaBase");

dojo.declare("websheet.functions.int", websheet.functions.FormulaBase, {
	
	constructor: function(){
		this.maxNumOfArgs = 1;
	},
	
	// Rounds a number down to the nearest integer. 
	// e.g.  =INT(-8.9) ==> -9; =INT(2.6) ==> 2;
	/*number*/calc: function(){
		var parm = this.getNumValue(this.args[0]);
		return Math.floor(parm); 
	}
});