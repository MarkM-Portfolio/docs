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

dojo.provide("websheet.functions.now");

dojo.declare("websheet.functions.now", websheet.functions.FormulaBase, {
	
	constructor: function() {
		this.minNumOfArgs = 0;
		this.inherited(arguments);
		// FIXME throw websheet.Constant.ERRORCODE["511"] if this.args isn't null
	},
	
	/*int*/calc: function() {
		var curDate = new Date();
		return websheet.Helper.getSerialNumberWithDate(curDate);
	}
});