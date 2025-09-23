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

dojo.provide("websheet.functions.and");

dojo.declare("websheet.functions.and", websheet.functions.FormulaBase, {
	
	constructor: function() {
		this.maxNumOfArgs = 30;
	},
	
	/*boolean*/calc: function(context) {
		
		this.iterate(this.args, context);
		var ret = websheet.Constant.ERRORCODE["519"];
		if(context.bool != undefined)
			ret = context.bool;
		
		return ret;
	},
	
	_operatorSingleValue: function(context,item,index,type,num) {
		if(!num)
			return;
		
		if (this.bArrayFormula){
			if(typeof item == "string")
				return;
			if(item && item.errorCode)
				throw item;
		}
		
		var curObj = item;
		if (this.Object.isCell(item)) {
			var cell = item;
			if(!cell.isNumber() && !cell.isBoolean())//if is not number cell, do not impact the result
				return;
			curObj = cell.getComputeValue();
		} else if(type == this.tokenType.RANGEREF_TOKEN || type == this.tokenType.NAME){
			//means it is empty cell without cell model exist
			return;//bNumber must be false
		}
		if(typeof curObj =="string")// =AND(123,2,TRUE,TRUE(),"true") return TRUE
			curObj = this.toBoolean(curObj);
		
		//decide whether it is a number
		var v = true;
		if(this.parseNumber(curObj, this.STR_TO_NUM) === 0)
			v = false;
		context.bool = this.getResult(context.bool,v);
	},
	
	getResult:function(v1, v2)
	{
		if(v1 == undefined)
			return v2;
		else
			return v1 && v2;
	}
});