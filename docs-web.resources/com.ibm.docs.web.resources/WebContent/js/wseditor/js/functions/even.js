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

dojo.provide("websheet.functions.even");

dojo.declare("websheet.functions.even", websheet.functions.FormulaBase, {
	
	constructor: function() {
		this.maxNumOfArgs = 1;
		this.inherited(arguments);
	},
	
	/*int*/calc: function() {
		var value = this.args[0];
		var numValue = this.fetchScalaResult(value,true);
		var type = value.getType();
		if(type == this.tokenType.DOUBLEQUOT_STRING){
			var parseResult = this.NumberRecognizer.parse(numValue);
			if(parseResult.isNumber)
				numValue = parseResult.fValue;
			else
				throw websheet.Constant.ERRORCODE["519"];
		}
		numValue = this.parseNumber(numValue);
		if(this.isNum(numValue)){
			if(numValue == 0){return 0;}
			var isNegative = false;
			if(numValue < 0){
				isNegative = true;
				numValue =  -numValue;
			}
			var intValue =  parseInt(numValue);
			if(intValue % 2 == 0){
				if(numValue > intValue){ 
					intValue = intValue + 2;
				}else{
					intValue = numValue;
				}
			}else{
				intValue = intValue + 1;
			}
			if(isNegative){
				return -intValue;
			}
			return intValue;
		}else{
			throw websheet.Constant.ERRORCODE["519"];
		}
	}
});