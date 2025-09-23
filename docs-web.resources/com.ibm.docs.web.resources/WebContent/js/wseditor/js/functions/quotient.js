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

dojo.provide("websheet.functions.quotient");

dojo.declare("websheet.functions.quotient", websheet.functions.FormulaBase, {
	
	constructor: function() {
		this.minNumOfArgs = 2;
		this.maxNumOfArgs = 2;
	},
	
	/*int*/calc: function() {
		var numerator = this.getNumValue(this.args[0]);
		var denominator = this.getNumValue(this.args[1]);
		
		if(denominator == 0)
			throw websheet.Constant.ERRORCODE["532"];
			
		var result = numerator / denominator;
		result = parseInt(result);
		
		return result;
	}
});