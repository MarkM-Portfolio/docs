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

dojo.provide("websheet.functions.seriessum");

dojo.declare("websheet.functions.seriessum", websheet.functions.FormulaBase, {
	
	constructor: function() {
		this.minNumOfArgs = 4;
		this.maxNumOfArgs = 4;
	},
	
	/*number*/calc: function(context) {
		context.x = this.getNumValue(this.args[0]);
		context.n = this.getNumValue(this.args[1]);
		context.m = this.getNumValue(this.args[2]);
		context.index = 0;
		context.result = 0;
		this.iterate(this.args[3], context);
		return context.result;
		
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
		
		context.result += oriobj * Math.pow(context.x, context.n+context.m*context.index++);
		
	}
	
});