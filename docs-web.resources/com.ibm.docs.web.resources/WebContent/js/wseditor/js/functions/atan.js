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

dojo.provide("websheet.functions.atan");

dojo.declare("websheet.functions.atan", websheet.functions.FormulaBase, {
	
	constructor: function(){
		this.maxNumOfArgs = 1;
	},
	
	/*number*/calc: function(){
		var value= this.args[0]; 
		var parm = this.fetchScalaResult(value); 
		var type = value.getType();
		var validArg = this.isValidArgument(Math.abs(parm));
		
		parm = this.getValue(parm, type, this.LOCALE_NUM | this.NOT_SUPPORT_ARRAY);
		if(validArg)
			return Math.atan(parm);
		
		throw websheet.Constant.ERRORCODE["519"];
	},
	
	// support scientific notation
	/*boolean*/isValidArgument: function(parm){
		if(this.isNum(parm))
			return true;
		
		var regP = /^[+-]?(([1-9]?(\.\d+)?)|(([1-9]\.)?\d*))[eE][+-](\d+)$/;
		if(regP.test(parm)){
			if (parm >= Number.MIN_VALUE && parm <= Number.MAX_VALUE)
				return true;
		}
		
		return false;
	}
});