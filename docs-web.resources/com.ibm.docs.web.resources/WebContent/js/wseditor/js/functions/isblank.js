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

dojo.provide("websheet.functions.isblank");

dojo.declare("websheet.functions.isblank", websheet.functions._singleargfunc, {
	
	ignoreUnparse: true,
	
	constructor: function() {
		this.maxNumOfArgs = 1;
	},
	
	_operatorSingleValue: function(item) {
		if(item == null)
			return true;
		if(this.Object.isCell(item)) {
			var cValue = item.getValue();
			if(cValue == null || cValue === "")//empty cell
				return true;
		}
		return false;
	}
});