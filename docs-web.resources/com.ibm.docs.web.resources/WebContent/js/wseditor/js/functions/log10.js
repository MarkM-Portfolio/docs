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

dojo.provide("websheet.functions.log10");

dojo.declare("websheet.functions.log10", websheet.functions.FormulaBase, {
	
	constructor: function(){
		this.maxNumOfArgs = 1;
	},
	
	/*number*/calc: function(){//log(number,10) = ln(number)/ln(10)
		var value= this.args[0]; 
		var parm = this.fetchScalaResult(value,true); 
		var type = value.getType();
		if(type==this.tokenType.NONE_TOKEN)
			throw websheet.Constant.ERRORCODE["511"];//Missing variable
		parm = this.getValue(parm, type, this.LOCALE_NUM);
		if(parm <= 0) //Both arguments should in (0, +infinity)
			throw websheet.Constant.ERRORCODE["504"];	
		var upper = Math.log(parm);
		var lower = Math.log(10);	
		if(!isFinite(upper) || !isFinite(lower))
			throw websheet.Constant.ERRORCODE["504"]; //#NUM	
		if(lower == 0)
			throw websheet.Constant.ERRORCODE["532"];// Division by zero	
		var ret = websheet.Math.div(upper, lower);
		if(!isFinite(ret))
			throw websheet.Constant.ERRORCODE["504"]; //#NUM
		//ret = Math.round(ret * Math.pow(10, 6))/Math.pow(10, 6); // round the result and keep 6 decimal.
		return ret;
	}
	
});