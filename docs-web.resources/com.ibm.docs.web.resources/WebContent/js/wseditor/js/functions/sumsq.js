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

dojo.provide("websheet.functions.sumsq");

dojo.declare("websheet.functions.sumsq", websheet.functions.FormulaBase, {
	
	constructor: function() {
		this.maxNumOfArgs = 255;
	},
	
	/*int*/calc: function(context) {
		context.sum = 0;
		this.iterate(this.args, context);
		return context.sum;
	},
	
	_operatorSingleValue:function(context,item,index,type,num){
		if(!num)
			return;
		
		if (this.bArrayFormula){
			if(typeof item == "string" || typeof item == "boolean")
				return;
			if(item && item.errorCode)
				throw item;
		}
		
		var bObj = this.Object.isCell(item);
		var oriobj = bObj ? item.getComputeValue():item;
		if((bObj && !item.isNumber()) ||(item===""&&type==this.tokenType.RANGEREF_TOKEN))//empty cell
			return;
		else
		  oriobj=this.getValue(oriobj, type, this.LOCALE_NUM);
		
		context.sum += oriobj * oriobj;
	}
	
});