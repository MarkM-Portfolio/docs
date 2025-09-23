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

dojo.provide("websheet.functions.isodd");

dojo.declare("websheet.functions.isodd", websheet.functions.FormulaBase, {
	
	constructor: function() {
		this.maxNumOfArgs = 1;
	},
	
	/*boolean*/calc: function(context) {
		var value = this.args[0];
		var result = this.fetchScalaResult(value,true);
		if (typeof result == "string") {
			var v = this.toBoolean(result,true);
			if(typeof v == "number" || v == "")
				throw websheet.Constant.ERRORCODE["504"];
		} else if (typeof result == "boolean") {
			throw websheet.Constant.ERRORCODE["519"];
		}
		
		var type = value.getType();
		if (type == this.tokenType.DOUBLEQUOT_STRING) {
			if(this.bMS) {
				var parseResult = this.NumberRecognizer.parse(result);
				if(parseResult.isNumber)
					result = parseResult.fValue;
				else
					throw websheet.Constant.ERRORCODE["504"];
			}
			else
				throw websheet.Constant.ERRORCODE["504"];
		}else if(type == this.tokenType.SINGLEQUOT_STRING)
			throw websheet.Constant.ERRORCODE["504"];
		
		result = this.parseNumber(result);
		result=parseInt(result);
		var v = result % 2;
		if(v == 0)
			return false;
		else
			return true;
	}
});