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

dojo.provide("websheet.functions.asin");

dojo.declare("websheet.functions.asin", websheet.functions.FormulaBase, {
	//constructor
	constructor: function(){
		this.maxNumOfArgs = 1;
	},
	
	/*number*/calc: function(){
		var parm = this.getNumValue(this.args[0]);
		if(parm <= 1.0 && parm >= -1.0)
			return Math.asin(parm);
		
		throw websheet.Constant.ERRORCODE["519"];
	}
});