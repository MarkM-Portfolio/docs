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

dojo.provide("websheet.functions.iserr");
dojo.require("websheet.functions._singleargfunc");
dojo.declare("websheet.functions.iserr", websheet.functions._singleargfunc, {
	_operatorSingleValue: function(item) {
		var bCell = this.Object.isCell(item);
		var curObj = bCell ? item.getError() : item;
		var temp = false;
		if (curObj && curObj.errorCode) {
			if(curObj == websheet.Constant.ERRORCODE["7"])
				temp = false;
			else
				temp = true;
		}
		return temp;
	}
});