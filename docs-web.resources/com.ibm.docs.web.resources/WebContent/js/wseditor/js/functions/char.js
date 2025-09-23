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

dojo.provide("websheet.functions.char");

dojo.declare("websheet.functions.char", websheet.functions.FormulaBase, {
	
	constructor: function() {
		this.maxNumOfArgs = 1;
		this.inherited(arguments);
	},
	
	/*int*/calc: function() {
		var value = this.args[0];
		var parm = this.fetchScalaResult(value); 
		var type = value.getType();
		var value = this.getValue(parm, type, this.LOCALE_NUM);
		value = Math.floor(value);
		if (value > 0 && value < 256)
			return String.fromCharCode(value);
		
		throw websheet.Constant.ERRORCODE["519"]; // #VALUE!
	}
});