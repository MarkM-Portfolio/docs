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

dojo.provide("websheet.functions.isref");

dojo.declare("websheet.functions.isref", websheet.functions.FormulaBase, {
	
	constructor: function() {
		this.maxNumOfArgs = 1;
		this.inherited(arguments);
	},
	
	/*boolean*/calc: function() {
		var value = this.args[0];
		var tokenType=value.getType();
		if(tokenType == this.tokenType.SINGLEQUOT_STRING){
				throw websheet.Constant.ERRORCODE["525"];
		}
		var result = this.analyzeToken(value);
		
		if(dojo.isArray(result)){
			for(var i=0;i<result.length;i++) {
				cal = this.analyzeToken(result[i]);
				if(!this.Object.isReference(cal))
					return false;
			}
			return true;
		}
		//invalid range like "#REF!1" will not be considered as reference.
		else if (this.Object.isReference(result) && result.isValid())
			return true;
		return false;
	}
});