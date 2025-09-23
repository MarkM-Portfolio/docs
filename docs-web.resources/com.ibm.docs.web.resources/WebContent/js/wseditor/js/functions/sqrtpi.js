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

dojo.provide("websheet.functions.sqrtpi");

dojo.declare("websheet.functions.sqrtpi", websheet.functions.FormulaBase, {

	constructor: function(){
		this.maxNumOfArgs = 1;
	},
	
	/*float*/calc: function(){
		var parm = this.getNumValue(this.args[0]);
		
		if(parm < 0)
			throw websheet.Constant.ERRORCODE["504"];
		
		return Math.sqrt(parm * Math.PI);
	}
	
});