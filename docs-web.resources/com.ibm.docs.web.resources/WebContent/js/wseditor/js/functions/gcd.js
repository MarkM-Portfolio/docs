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

dojo.provide("websheet.functions.gcd");

dojo.declare("websheet.functions.gcd", websheet.functions.FormulaBase, {
	
	constructor: function() {
		this.maxNumOfArgs = 255;
	},
	
	_gcd : function(a, b) {
	    return (b>0) ? this._gcd(b,a%b) : a;
	},
	
	/*Number*/calc: function(context) {
		this.iterate(this.args, context);
		return context.num;
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
		
		if (oriobj < 0)
			throw websheet.Constant.ERRORCODE["504"];
		
		if(context.num == undefined || context.num == null) {
			context.num = oriobj;
		}
		else {
			context.num = this._gcd(context.num, oriobj);
		}
	}
});