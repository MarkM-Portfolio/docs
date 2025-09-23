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

dojo.provide("websheet.functions.power");

dojo.declare("websheet.functions.power", websheet.functions.FormulaBase, {
	
	constructor: function() {
		this.minNumOfArgs = 2;
		this.maxNumOfArgs = 2;
		this.inherited(arguments);
	},
	
	/*int*/calc: function() {
		var values = this.args;
		if(values[0].getType()==this.tokenType.NONE_TOKEN&&values[1].getType()==this.tokenType.NONE_TOKEN)
			throw websheet.Constant.ERRORCODE["504"];
		var base = this.fetchScalaResult(values[0],true);
		var exp = this.fetchScalaResult(values[1],true);
		base = this.parseNumber(base);
		exp = this.parseNumber(exp);
		if(base < 0 && !websheet.Helper.isInt(exp))
			throw websheet.Constant.ERRORCODE["504"];
		var result = websheet.Math.pow(base, exp);
		if(result == Number.POSITIVE_INFINITY || result == Number.NEGATIVE_INFINITY)
			throw websheet.Constant.ERRORCODE["504"];
		return result;
	}
});