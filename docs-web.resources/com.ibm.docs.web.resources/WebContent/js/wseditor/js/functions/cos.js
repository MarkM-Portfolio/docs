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

dojo.provide("websheet.functions.cos");

dojo.declare("websheet.functions.cos", websheet.functions.FormulaBase, {
	
	constructor: function(){
		this.maxNumOfArgs = 1;
	},
	
	/*number*/calc: function(){
		var parm = this.getNumValue(this.args[0]);
		// test result in MS2013, 134217727(0x7FFFFF) not find the specific document
		if (parm > this.MAX_NUM || parm < this.MIN_NUM)
			throw websheet.Constant.ERRORCODE["504"];
	    return Math.cos(parm);
	}
	
});