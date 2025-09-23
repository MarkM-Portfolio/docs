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

dojo.provide("websheet.functions.rept");
dojo.require("websheet.functions.FormulaBase");

dojo.declare("websheet.functions.rept", websheet.functions.FormulaBase, {
	
	maxLength : 32767,
	
	constructor: function() {
		this.maxNumOfArgs = 2;
		this.minNumOfArgs = 2;
	},
	
	/*string*/calc: function() {
		var values = this.args;		
		var type = values[0].getType();				
		var stringValue =this.getValue(this.fetchScalaResult(values[0],true,true), type);
			
		var countValue = this.getNumValue(values[1]);
		if(countValue < 0){
		   throw websheet.Constant.ERRORCODE["519"];	
		}
		countValue = parseInt(countValue);			
     				
	   if(stringValue.length * countValue > this.maxLength)
	      throw websheet.Constant.ERRORCODE["519"];
	   
	   var result = "";
	   for(var i= 0 ;i < countValue ;i++)
		  result = result + stringValue;
	   
	   return result;
	}
});