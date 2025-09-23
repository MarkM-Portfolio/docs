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

dojo.provide("websheet.functions.isnumber");
dojo.require("websheet.functions._singleargfunc");
dojo.declare("websheet.functions.isnumber", websheet.functions._singleargfunc, {
		
	_operatorSingleValue: function(item) {
		var bCell = this.Object.isCell(item);
		var curObj = bCell ? item.getError() : item;
		if (bCell && item.isNumber() || typeof(item) == "number")
			return true;
		return false;
	}
});