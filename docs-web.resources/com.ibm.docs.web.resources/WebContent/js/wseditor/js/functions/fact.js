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

dojo.provide("websheet.functions.fact");

dojo.declare("websheet.functions.fact", websheet.functions.FormulaBase, {
	
	constructor: function() {
		this.maxNumOfArgs = 1;
	},
	
	/*float*/calc: function() {
		var value = 1;
		var fact = this.getNumValue(this.args[0]);
		if(fact > 170){throw websheet.Constant.ERRORCODE["519"];}
		if(fact == 0){return 1;}
		if(fact <0){throw websheet.Constant.ERRORCODE["502"];}
		fact = parseInt(fact);
		while(fact > 1){
			value *= fact;
			fact--;
		}
		return value;
	}
});