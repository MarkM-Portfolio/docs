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

dojo.provide("websheet.functions.exp");
dojo.require("websheet.functions.FormulaBase");

dojo.declare("websheet.functions.exp", websheet.functions.FormulaBase, {
	
	constructor: function(){
		this.maxNumOfArgs = 1;
	},
	
	/*number*/calc: function(){
		var parm = this.getNumValue(this.args[0]);
		var ret = null;
		//=EXP("709.782712893") is the biggest number we can handle, XLS is the same.
		ret = Math.exp(parm).toPrecision(15);
		ret = parseFloat(ret);
		if(!isFinite(ret))
			throw websheet.Constant.ERRORCODE["504"]; //#NUM
		
		return ret;
	}
});