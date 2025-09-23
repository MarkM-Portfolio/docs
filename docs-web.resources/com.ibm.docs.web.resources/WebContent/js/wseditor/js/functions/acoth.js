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

dojo.provide("websheet.functions.acoth");

dojo.declare("websheet.functions.acoth", websheet.functions.FormulaBase, {
	
	constructor: function() {
		this.maxNumOfArgs = 1;
	},

	//acoth(x) = 0.5 * ln[(x+1) / (x-1)]
	/*int*/calc: function() {
		var parm = this.getNumValue(this.args[0]);
		if(parm < -1 || parm > 1)
			return 0.5 * Math.log( (parm + 1) / (parm - 1) );
		
		throw websheet.Constant.ERRORCODE["504"];
	}
	
});