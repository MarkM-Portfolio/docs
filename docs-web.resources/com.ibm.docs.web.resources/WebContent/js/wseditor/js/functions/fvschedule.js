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

dojo.provide("websheet.functions.fvschedule");

dojo.declare("websheet.functions.fvschedule", websheet.functions.FormulaBase, {
	
	constructor: function() {
		this.minNumOfArgs = 2;
		this.maxNumOfArgs = 2;
	},
	
	/*number*/calc: function(context) {
		context.principal = this.getNumValue(this.args[0]);
		this.iterate(this.args[1], context);
		return context.principal;
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
		
		context.principal *= oriobj + 1;
		
	}
	
});