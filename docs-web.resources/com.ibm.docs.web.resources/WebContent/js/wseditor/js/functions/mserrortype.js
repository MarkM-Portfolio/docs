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

dojo.provide("websheet.functions.mserrortype");
dojo.require("websheet.Constant");

dojo.declare("websheet.functions.mserrortype",  websheet.functions._singleargfunc, {
	
	constructor: function() {
		this.maxNumOfArgs = 1;
		this.inherited(arguments);
	},
	
	_operatorSingleValue: function(item) {
		var bCell = this.Object.isCell(item);
		var curObj = bCell ? item.getError() : item;
		if (curObj && curObj.message){
			return this.getErrorType(curObj.message.toUpperCase());
		}
		if(bCell && !item.isFormula()){
			var para=item.getValue();
			if(typeof(para) == "string")
				return this.getErrorType(para.toUpperCase());
		}
		throw websheet.Constant.ERRORCODE["7"];
	},
	
	getErrorType: function(text) {
		var errType;
		var errMsg = websheet.functions.errMsg;
		switch(text){
		case errMsg.NUL:
			errType = 1;
			break;
		case errMsg.DIV:
			errType = 2;
			break;
		case errMsg.VALUE:
			errType = 3;
			break;
		case errMsg.REF:
			errType = 4;
			break;
		case errMsg.NAME:
			errType = 5;
			break;
		case errMsg.NUM:
			errType = 6;
			break;
		case errMsg.NA:
			errType = 7;
			break;
		}
		if(errType)
			return errType;
		else 
			throw websheet.Constant.ERRORCODE["7"];
	}
});