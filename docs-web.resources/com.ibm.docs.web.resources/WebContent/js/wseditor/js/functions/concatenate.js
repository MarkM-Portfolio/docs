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

dojo.provide("websheet.functions.concatenate");
dojo.declare("websheet.functions.concatenate", websheet.functions.FormulaBase, {
	
	constructor: function() {
		this.maxNumOfArgs = 255;
	},
	
	/*string*/calc: function() {
		var concateStr = "";
		var values = this.args;
		for(var i=0;i<values.length;i++){
			var type = values[i].getType();
			if(type == this.tokenType.NONE_TOKEN)
				continue;			
			var str = this.fetchScalaResult(values[i],true,true);
			/**
			 * TODO: if it's cell token and the value is TRUE,so far the value is treated as number 0/1
			 * =verketten("true";"false") 
			 *	WAHR, WAHR(), "WAHR" , TRUE, TRUE(), "TRUE"
			 */
			if(typeof str == "boolean"){
				str = this.NumberRecognizer.transBoolEn2Locale(str);
			}
			concateStr+=str;
		}
		return concateStr;
	}
});