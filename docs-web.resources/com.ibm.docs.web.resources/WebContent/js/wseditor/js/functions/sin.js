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

dojo.provide("websheet.functions.sin");

dojo.declare("websheet.functions.sin", websheet.functions.FormulaBase, {
	//constructor
	constructor: function(){
		this.maxNumOfArgs = 1;
	},
	
	/*number*/calc: function(){
		var value= this.args[0]; 
		var parm = this.fetchScalaResult(value,true); 
		var type = value.getType();
		if(type==this.tokenType.NONE_TOKEN)
			throw websheet.Constant.ERRORCODE["511"];//Missing variable
		parm = this.getValue(parm, type, this.LOCALE_NUM);
		// test result in MS2013, 134217727(0x7FFFFF), not find the specific document
		if (parm > 134217727 || parm < -134217727)
			throw websheet.Constant.ERRORCODE["504"];
		var result=Math.sin(parm);
		if(!isFinite(result))
			throw websheet.Constant.ERRORCODE["504"]; //#NUM
	    return result;
	}
	
});