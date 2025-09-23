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

dojo.provide("websheet.functions.sumifs");

dojo.declare("websheet.functions.sumifs", [websheet.functions.sumif, websheet.functions._countifs], {
	
	constructor: function() {
		this.minNumOfArgs = 3;
		this.maxNumOfArgs = 255;
		this.oddNumOfArgs = 1;
	},
	
	/*int*/calc: function(context) {
		var values = this.args;
		var prefixRange = this._getRange(values[0]);
		var baseRange = this._getRange(values[1]);
		var satisfyCells = this.getSatisfyCells(context, baseRange, prefixRange);
		if (satisfyCells && satisfyCells.length) {
			return this.calcTotal(context, prefixRange, baseRange, satisfyCells);	
		} else {
			return 0;
		}
	}
});