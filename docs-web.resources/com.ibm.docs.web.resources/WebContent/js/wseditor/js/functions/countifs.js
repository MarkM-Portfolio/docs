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

dojo.provide("websheet.functions.countifs");

dojo.declare("websheet.functions.countifs", websheet.functions._countifs, {
	
	constructor: function() {
		this.minNumOfArgs = 2;
		this.maxNumOfArgs = 255;
		this.oddNumOfArgs = 0;
	},

	calc: function(context) {
		var satisfyCells = this.getSatisfyCells(context);
		var count = 0;
		dojo.forEach(satisfyCells, function(pos) {
			if (pos.rowSize && pos.colSize) {
				count += pos.rowSize * pos.colSize;
			} else {
				count++;
			}
		});
		return count;
	}

});