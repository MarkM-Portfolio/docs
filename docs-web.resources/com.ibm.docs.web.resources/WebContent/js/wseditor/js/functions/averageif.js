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

dojo.provide("websheet.functions.averageif");

dojo.declare("websheet.functions.averageif", websheet.functions.sumif, {
	
	constructor: function() {
		this.minNumOfArgs = 2;
		this.maxNumOfArgs = 3;
		this.privateAcc = false;
		this._summation = 0;
		this._count = 0;
	},
	
	/*int*/calc: function(context) {
		var total = this.inherited(arguments);
		if (!context._count) {
			throw websheet.Constant.ERRORCODE["532"];
		}
		return total / context._count;
	}
});