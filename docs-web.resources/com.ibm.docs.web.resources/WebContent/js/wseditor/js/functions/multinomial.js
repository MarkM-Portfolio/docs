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

dojo.provide("websheet.functions.multinomial");

dojo.declare("websheet.functions.multinomial", websheet.functions.FormulaBase, {
	
	constructor: function() {
		this.maxNumOfArgs = 255;
	},
	
	/*int*/calc: function(context) {
		context.sum = 0;
		context.divisor = 1;
		this.iterate(this.args, context);
		
		var dividend = 1;
		
		while(context.sum > 1) {
			dividend *= context.sum;
			context.sum --;
		}
		
		var result = dividend / context.divisor;
		if(isFinite(result))
			return result;
		
		throw websheet.Constant.ERRORCODE["504"];
	},
	
	_operatorSingleValue:function(context,item,index,type,num){
		if(!num)
			return;
		
		if (this.bArrayFormula){
			if(typeof item == "string" || typeof item == "boolean")
				throw websheet.Constant.ERRORCODE["519"];
			if(item && item.errorCode)
				throw item;
		}
		
		var bObj = this.Object.isCell(item);
		var oriobj = bObj ? item.getComputeValue():item;
		if(bObj && !item.isNumber()) // non-numeric
			throw websheet.Constant.ERRORCODE["519"];
		else if(item===""&&type==this.tokenType.RANGEREF_TOKEN) //empty cell
			return;
		else
			oriobj=this.getValue(oriobj, type, this.LOCALE_NUM);
		
		if (oriobj < 0)
			throw websheet.Constant.ERRORCODE["504"];
		oriobj = parseInt(oriobj);
		
		context.sum += oriobj;
		while(oriobj > 1) {
			context.divisor *= oriobj;
			oriobj --;
		}
	}
	
});