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

dojo.provide("websheet.functions.count");

dojo.declare("websheet.functions.count", websheet.functions.FormulaBase, {
	
	constructor: function() {
		this.maxNumOfArgs = 32;
	},
	
	/*float*/calc: function(context) {
		var parmObj = {bIgnoreErr: true};
		context.total = 0;
		this.iterate(this.args, context, parmObj);
		return context.total;
	},
	
	_operatorSingleValue:function(context, item, index, type, num){
		if(!num)
			return;
		if (this.bArrayFormula){
			if (typeof item == "string" || typeof item == "boolean")
				return;		
		}
		if(type == this.tokenType.SINGLEQUOT_STRING)
			throw websheet.Constant.ERRORCODE["525"];
		
		var oriobj,bNumber,bBoolean;
		if (this.Object.isCell(item)) {
			var cell = item;
			if (cell.getError())
				return;
			bBoolean = cell.isBoolean();
			oriobj = cell.getComputeValue();
			bNumber = cell.isNumber();
		}else{
			oriobj = item;
			if(typeof oriobj == "boolean")//bBoolean should not set to true even oriobj is boolean if it is not cell reference
				bNumber = true;
			else
				bNumber = this.isNum(oriobj);
		}
		if(type == this.tokenType.DOUBLEQUOT_STRING){
			var parseResult = this.NumberRecognizer.parse(oriobj);
			bNumber = parseResult.isNumber;
		}
		//boolean is not counted for "count"
		if(bNumber && !bBoolean){
			context.total += num;
		}
	}
});