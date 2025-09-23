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

dojo.provide("websheet.functions.cot");

dojo.declare("websheet.functions.cot", websheet.functions.FormulaBase, {
	
	constructor: function(){
		this.maxNumOfArgs = 1;
	},
	
	/*number*/calc: function(){
		var parm = this.getNumValue(this.args[0]);
		
		if (parm > this.MAX_NUM || parm < this.MIN_NUM)
			throw websheet.Constant.ERRORCODE["504"];
		
		var tan = Math.tan(parm);
		if(tan == 0)
			throw websheet.Constant.ERRORCODE["532"];
	    return 1 / Math.tan(parm);
	}
	
});