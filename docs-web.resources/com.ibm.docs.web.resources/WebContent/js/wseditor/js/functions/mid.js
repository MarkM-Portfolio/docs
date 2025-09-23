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

dojo.provide("websheet.functions.mid");

dojo.declare("websheet.functions.mid", websheet.functions.FormulaBase, {
	
	constructor: function() {
		this.minNumOfArgs = 3;
		this.maxNumOfArgs = 3;
	},
	
	/*text*/calc: function() {		
		var values = this.args;
		
		var type = values[0].getType();			
		var stringValue =this.getValue(this.fetchScalaResult(values[0],false,true),type);
		
		type = values[1].getType();
		var startValue = this.fetchScalaResult(values[1]);			
		startValue = this.getValue(startValue, type, this.LOCALE_NUM);	
		if(startValue < 1)
			throw websheet.Constant.ERRORCODE["519"];
		
		startValue = parseInt(startValue);	
		
		type = values[2].getType();
		var lengthValue = this.fetchScalaResult(values[2]);			
		lengthValue = this.getValue(lengthValue, type, this.LOCALE_NUM);	
		if(lengthValue < 0)
			throw websheet.Constant.ERRORCODE["519"];
		
		lengthValue = parseInt(lengthValue);	
		return stringValue.substr(startValue-1,lengthValue);
	}
});