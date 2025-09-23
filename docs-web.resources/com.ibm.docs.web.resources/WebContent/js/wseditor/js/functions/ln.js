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

dojo.provide("websheet.functions.ln");

dojo.declare("websheet.functions.ln", websheet.functions.FormulaBase, {
	
	constructor: function(){
		this.maxNumOfArgs = 1;
	},
	
	/*number*/calc: function(){
		var value= this.args[0]; 
		var parm = this.fetchScalaResult(value); 
		var type = value.getType();
		parm = this.getValue(parm, type, this.LOCALE_NUM);
		
		if(parm <= 0) //parm should in (0, +infinity)
			throw websheet.Constant.ERRORCODE["504"];
		
		var ret = Math.log(parm);
		if(!isFinite(ret))
			throw websheet.Constant.ERRORCODE["504"]; //#NUM
		
		return ret;
	}
});