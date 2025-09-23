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

dojo.provide("websheet.functions.atanh");

dojo.declare("websheet.functions.atanh", websheet.functions.FormulaBase, {
	
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
		//compute method: Log((1 + x) / (1 ¨C x)) / 2	
		if(parm < 1.0 && parm > -1.0)
		{
			var result=Math.log((1+parm)/(1-parm))/2;
			return result;
		}
		
		throw websheet.Constant.ERRORCODE["504"];
	}
	
	
});