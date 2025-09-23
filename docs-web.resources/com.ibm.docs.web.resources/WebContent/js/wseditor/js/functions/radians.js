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

dojo.provide("websheet.functions.radians");

dojo.declare("websheet.functions.radians", websheet.functions.FormulaBase, {
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
		var result=(parm*Math.PI)/180;
		//result = Math.round(result * Math.pow(10, 6))/Math.pow(10, 6); // round the result and keep 6 decimal.
	    return result;
	}
	
});