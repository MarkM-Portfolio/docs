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

dojo.provide("websheet.functions.code");
dojo.declare("websheet.functions.code",websheet.functions.FormulaBase, {
	
	constructor: function() {
		this.maxNumOfArgs = 1;
//		this.inherited(arguments);
	},
	
	/*boolean*/calc: function(context) {
		var value = this.args[0];
		return this.calcSingleArgFunc(context, value);
	},
	
	_operatorSingleValue: function(item) {
		var bCell = this.Object.isCell(item);
		var boolVar = bCell ? item.isBoolean() : (typeof(item) == "boolean");
		var strValue = bCell ? item.getComputeValue() : item;
		if(boolVar){
			if(strValue)
				return 84;
			else
				return 70;
		}
		strValue = this.parseString(strValue);
		if (strValue && strValue.length > 0) {
			return strValue.charCodeAt(0);
		} else {
			throw websheet.Constant.ERRORCODE["519"];
		}
	}
});