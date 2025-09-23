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

dojo.provide("websheet.functions.mround");

dojo.declare("websheet.functions.mround", websheet.functions.FormulaBase, {
	
	constructor: function() {
		this.minNumOfArgs = 2;
		this.maxNumOfArgs = 2;
	},
	
	/*float*/calc: function() {
		var value = this.getNumValue(this.args[0]);
		var round = this.getNumValue(this.args[1]);
		
		if (value * round < 0)
			throw websheet.Constant.ERRORCODE["504"];
		
		if(round == 0)
			return 0;
		
		return round * Math.round(value/round);
	}
});