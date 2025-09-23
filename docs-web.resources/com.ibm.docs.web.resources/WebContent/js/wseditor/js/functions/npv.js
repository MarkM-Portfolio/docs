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

dojo.provide("websheet.functions.npv");

dojo.declare("websheet.functions.npv", websheet.functions.FormulaBase, {
	
	constructor: function() {
		this.minNumOfArgs = 2;
		this.maxNumOfArgs = 255;
	},
	
	/*number*/calc: function(context) {
		context.rate = this.getNumValue(this.args[0]);
		context.npv = 0;
		context.divisor = 1;
		var values = new Array();
		for(var i = 1; i < this.args.length; ++i)
			values[i-1] = this.args[i];
		this.iterate(values, context);
		return context.npv;
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
		if(type == this.tokenType.RANGEREF_TOKEN || type == this.tokenType.NAME){
			if((oriobj === "") || (bObj && !item.isNumber()))
				return;
		}
		oriobj=this.getValue(oriobj, type, this.LOCALE_NUM);
		
		context.divisor *= 1 + context.rate;
		context.npv += oriobj / context.divisor;
		
	}
	
});