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

dojo.provide("websheet.functions.log");

dojo.declare("websheet.functions.log", websheet.functions.FormulaBase, {
	
	constructor: function(){
		this.maxNumOfArgs = 2;
	},
	
	/*number*/calc: function(){//log(number,[base]) = ln(number)/ln(base)
		var values= this.args; 
		var parm = this.fetchScalaResult(values[0]); 
		var type = values[0].getType();
		parm = this.getValue(parm, type, this.LOCALE_NUM);
		
		var base = 10;
		var typeBase = this.tokenType.NUMBER_TOKEN;
		
		if(values.length == 2){
			base = this.fetchScalaResult(values[1]); 
			typeBase = values[1].getType();
			base = this.getValue(base, typeBase, this.LOCALE_NUM);
		}
		
		if(parm <= 0 || base <= 0) //Both arguments should in (0, +infinity)
			throw websheet.Constant.ERRORCODE["504"];
		
		var upper = Math.log(parm);
		var lower = Math.log(base);
		if(!isFinite(upper) || !isFinite(lower))
			throw websheet.Constant.ERRORCODE["504"]; //#NUM
			
		if(lower == 0)
			throw websheet.Constant.ERRORCODE["532"];// Division by zero
			
		var ret = websheet.Math.div(upper, lower);
		//ret = Math.round(ret * 1000000000)/1000000000; // round the result and keep 9 decimal.
		
		if(!isFinite(ret))
			throw websheet.Constant.ERRORCODE["504"]; //#NUM
		
		return ret;
	}
});