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

dojo.provide("websheet.functions.average");
dojo.require("websheet.functions.FormulaBase");
dojo.declare("websheet.functions.average", websheet.functions.FormulaBase, {
	isA : false,
	constructor: function() {
		this.maxNumOfArgs = 32;
	},
	
	/*int*/calc: function(context) {
		context.count = 0;
		context.sum = 0;
		context.errCount = 0;
		context.calculateCount = 0;
		this.iterate(this.args, context);
		if(context.errMsg && context.errCount == context.count)
			throw context.errMsg;

		
		if (context.calculateCount == 0){
			throw websheet.Constant.ERRORCODE["532"];
		}else
			return context.sum / context.calculateCount;
		
	},
	
	//Tcontextverage(A:A&1) how to figure out "11" is get from range expression or user input
	_operatorSingleValue: function(context, item, index, type, num) {
		if(!num)
			return;
		if (this.bArrayFormula) {
			//ignore boolean in contant array
			if (typeof item == "boolean") {
				return;
			} else if (typeof item == "string") {
			// count double quote string in averagea
				if (this.isA) {
					context.count += num;
					context.calculateCount += num;
				}
				return;
			}else if(item && item.errorCode)
				throw item;
		}
		context.count += 1;
		var value;
		var bNumber;
		var bBool;
		if (this.Object.isCell(item)) {
			var cell = item;
			bNumber = cell.isNumber();
			value = cell.getComputeValue();
			if(value === "" && cell.getValue() != "")
				value = cell.getValue();
			bBool = cell.isBoolean();
		} else {
			value = item;
			bNumber = this.isNum(value);
		}
		if(!bBool)
			bBool = (typeof value == "boolean");
		//if cell's content is a string,throw error
		if(type == this.tokenType.RANGEREF_TOKEN || type == this.tokenType.NAME){
			if(this.actionWhenErr(context,value, bNumber, bBool))
				return;
		}
		value = this.getValue(value,type,this.LOCALE_NUM);
		if(num >= 1){
			if (num > 1)
				value = websheet.Math.mul(value, num);
			var bInt = (context.sum % 1 == 0) && (value % 1 == 0);
			if (bInt)
				context.sum = context.sum + value;
			else
				context.sum =websheet.Math.add(context.sum, value, true);
			context.calculateCount += num;
		}
	},
	
	//only include number,
	//not count string and boolean
	actionWhenErr:function(context,value, bNumber, bBoolean){
		if(!bNumber || bBoolean){
			context.errMsg = websheet.Constant.ERRORCODE["532"];
			context.errCount += 1;
			return true;
		}
		return false;
	}
});