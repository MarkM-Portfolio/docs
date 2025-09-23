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

dojo.provide("websheet.functions.pi");
dojo.require("websheet.functions.FormulaBase");
dojo.declare("websheet.functions.pi", websheet.functions.FormulaBase, {
	
	constructor: function(){
		this.minNumOfArgs = 0;
	},
	
	/*number*/calc: function(){
		var pi = Math.PI.toPrecision(15);
		pi = parseFloat(pi);
		return pi;
	}
});