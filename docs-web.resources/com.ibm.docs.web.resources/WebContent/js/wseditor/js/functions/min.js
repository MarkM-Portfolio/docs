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

dojo.provide("websheet.functions.min");

dojo.declare("websheet.functions.min", websheet.functions.FormulaBase, {
	
	constructor: function() {
		this.maxNumOfArgs = 32;
	},
	
	/*number*/calc: function(context) {
		context.num = Number.MAX_VALUE;
		this.iterate(this.args, context);
		if (context.num == Number.MAX_VALUE) {
			return 0;
		}
		return context.num;		
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
		var oriobj = bObj? item.getComputeValue():item;
	    if((bObj && !item.isNumber()) ||(item===""&&type==this.tokenType.RANGEREF_TOKEN))//empty cell
			return;
		else
			oriobj=this.getValue(oriobj, type, this.LOCALE_NUM);			
	    if(context.num == Number.MAX_VALUE)
			context.num = oriobj;
		else
			context.num = Math.min(context.num,oriobj); 
	}
});