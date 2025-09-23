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

dojo.provide("websheet.functions.xnpv");

dojo.declare("websheet.functions.xnpv", websheet.functions.FormulaBase, {
	
	constructor: function() {
		this.minNumOfArgs = 3;
		this.maxNumOfArgs = 3;
	},
	
	/*number*/calc: function(context) {
		var rate = this.getNumValue(this.args[0]);
		
		context.values = new Array();
		context.dates = new Array();
		
		context.isValue = true;
		this.iterate(this.args[1], context);
		context.isValue = false;
		this.iterate(this.args[2], context);
		
		var values = context.values;
		var dates = context.dates;
		
		if(values.length != dates.length)
			throw websheet.Constant.ERRORCODE["504"];
		
		var xnpv = 0;
		var firstDate;
		for(var i = 0; i < values.length; ++i) {
			var value = values[i];
			var date = dates[i];
			if(!websheet.Helper.checkDateValidSpan(date))
				throw websheet.Constant.ERRORCODE["519"];
			if(i == 0)
				firstDate = date;
			else if(date <= firstDate)
				throw websheet.Constant.ERRORCODE["504"];
			xnpv += value / Math.pow(1+rate, (date-firstDate)/365);
		}
		return xnpv;
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
			return; //throw websheet.Constant.ERRORCODE["519"];
		else if(item===""&&type==this.tokenType.RANGEREF_TOKEN) //empty cell
			return;
		else
			oriobj=this.getValue(oriobj, type, this.LOCALE_NUM);
		
		if(context.isValue)
			context.values.push(oriobj);
		else
			context.dates.push(oriobj);
	}
	
});