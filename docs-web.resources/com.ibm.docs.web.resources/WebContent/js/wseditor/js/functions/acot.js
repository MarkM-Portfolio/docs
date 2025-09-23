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

dojo.provide("websheet.functions.acot");

dojo.declare("websheet.functions.acot", websheet.functions.FormulaBase, {
	
	constructor: function(){
		this.maxNumOfArgs = 1;
	},
	
	//acot(x) = PI/2 - atan(x)
	/*number*/calc: function(){
		var parm = this.getNumValue(this.args[0]);
		return Math.PI/2 - Math.atan(parm);
	}
	
});