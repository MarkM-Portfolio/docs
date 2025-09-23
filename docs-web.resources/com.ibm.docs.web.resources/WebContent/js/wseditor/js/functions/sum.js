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

dojo.provide("websheet.functions.sum");
dojo.declare("websheet.functions.sum", websheet.functions.FormulaBase, {
	
	constructor: function() {
		this.maxNumOfArgs = 32;
	},
	
	/*float*/calc: function(context) {
		context.total = 0;
		this.iterate(this.args,context);
		return context.total;
	},
	
	_operatorSingleValue:function(context, item, index, type, num){
		if(!num)
			return;
		
		// ignore the string and boolean in constant-array and range expression 
		if (this.bArrayFormula){
			if (typeof item == "string" || typeof item == "boolean")
				return;
			if(item && item.errorCode)
				throw item;
		}
		
		var bObj = this.Object.isCell(item);
		var curObj = bObj ? item.getComputeValue() : item;
		if(type == this.tokenType.RANGEREF_TOKEN || type == this.tokenType.NAME){
			if((curObj === "") || (bObj && !item.isNumber()))
				return;
		}
		
		curObj = parseFloat(this.getValue(curObj,type,this.LOCALE_NUM));
		if(num > 1)
			curObj = websheet.Math.mul(num, curObj);
		var bInt = (context.total % 1 == 0) && (curObj % 1 == 0); // inline websheet.Helper.isInt
		if (bInt)
			context.total = context.total + curObj;
		else
			context.total = websheet.Math.add(context.total, curObj, true);
	}
});