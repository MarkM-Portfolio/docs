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

dojo.provide("websheet.functions.cosh");

dojo.declare("websheet.functions.cosh", websheet.functions.FormulaBase, {
	//constructor
	constructor: function(){
		this.maxNumOfArgs = 1;
	},
	
	/*number*/calc: function(){//sinh(z)=(e^z+e^(-z))/2
		var value= this.args[0]; 
		var parm = this.fetchScalaResult(value,true); 
		var type = value.getType();
		if(type==this.tokenType.NONE_TOKEN)
			throw websheet.Constant.ERRORCODE["511"];//Missing variable
		parm = this.getValue(parm, type, this.LOCALE_NUM);
		var result=(Math.pow(Math.E, parm)+websheet.Math.div(1, Math.pow(Math.E, parm)))/2;
		//result = Math.round(result * Math.pow(10, 6))/Math.pow(10, 6); // round the result and keep 6 decimal.
	    return result;
	}
	
});