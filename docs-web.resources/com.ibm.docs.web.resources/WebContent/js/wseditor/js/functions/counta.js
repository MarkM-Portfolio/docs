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

dojo.provide("websheet.functions.counta");

dojo.declare("websheet.functions.counta", websheet.functions.FormulaBase, {
	
	constructor: function() {
		this.maxNumOfArgs = 32;
	},
	/*int*/calc: function(context) {	
		var parmObj = {bIgnoreErr: true};
		context.total = 0;
		this.iterate(this.args, context, parmObj);
		return context.total;
	},
	
	_operatorSingleValue: function(context,item,index,type, num){
		if(!num)
			return;
		if(type == this.tokenType.SINGLEQUOT_STRING)
			throw websheet.Constant.ERRORCODE["525"];
		var oriobj;
		if (this.Object.isCell(item)) {
			var cell = item;
			if (cell.getComputeValue() == null) // for subtotal
				return;
			oriobj = cell.getValue();
		}else
			oriobj = item;
			
		if((type == this.tokenType.RANGEREF_TOKEN || type == this.tokenType.NAME) && oriobj === "")
			return;
		context.total += num;
	}
});