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

dojo.provide("websheet.functions.product");

dojo.declare("websheet.functions.product", websheet.functions.FormulaBase, {
	
	constructor: function() {
		this.maxNumOfArgs = 30;
	},
	
	/*float*/calc: function(context) {
		context.total = 0;
		context.bNumber = false; // the specified cell range contains any number
		this.iterate(this.args,context);
		return context.total;
	},
	
	_operatorSingleValue:function(context,item,index,type,num){
		if(type == this.tokenType.NONE_TOKEN
				||(this.bArrayFormula && (typeof item == "string" || typeof item == "boolean"))){
			return;
		}
		
		var curObj=0;
		if(type == this.tokenType.RANGEREF_TOKEN || type == this.tokenType.NAME){
			if(this.Object.isCell(item) && item.isNumber()){// the cell is number	
				curObj=this.parseNumber(item.getComputeValue(),this.LOCALE_NUM);
				// we flag there is an avaliable number at least.
				if (!context.bNumber) {
					context.bNumber = true;
					context.total = 1; // change it from 0 to 1
				}				
			}else // if the cell is not number we ignore it.
				curObj = 1; // prevent throwing one exception by following parseNumber if the cell value is one string
		}else{
			curObj=this.getValue(item,type,this.LOCALE_NUM); // if the cell is not number we throw exception
			// we flag there is an avaliable number at least.
			if(!context.bNumber){
				context.total=1;
				context.bNumber=true;
			}
		}
		
		if(num > 1){
			curObj = Math.pow(curObj, num);
			if(!Number.isFinite(curObj))
				throw websheet.Constant.ERRORCODE["504"];
		}
		context.total =websheet.Math.mul(context.total , parseFloat(curObj)); // if the curObj is string the parseNumber will throw Exception.
		//if overflow, return #NUM!
	}
});