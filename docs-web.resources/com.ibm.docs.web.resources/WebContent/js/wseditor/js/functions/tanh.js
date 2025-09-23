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

dojo.provide("websheet.functions.tanh");

dojo.declare("websheet.functions.tanh", websheet.functions.FormulaBase, {
	
	constructor: function(){
		this.maxNumOfArgs = 1;
	},
	
	/*number*/calc: function(){//tanh(z)=(e^2z - 1) / (e^2z + 1)
		var parm = this.getNumValue(this.args[0]);
		if (parm > this.MAX_NUM || parm < this.MIN_NUM)
			throw websheet.Constant.ERRORCODE["504"];
		return (Math.pow(Math.E, parm*2)-1) / (Math.pow(Math.E, parm*2)+1);
	}
	
});