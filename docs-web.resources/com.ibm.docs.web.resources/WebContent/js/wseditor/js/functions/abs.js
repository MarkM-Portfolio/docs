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

dojo.provide("websheet.functions.abs");

dojo.declare("websheet.functions.abs", websheet.functions.FormulaBase, {
	
	constructor: function() {
		this.maxNumOfArgs = 1;
		this.inherited(arguments);
	},
	
	/*int*/calc: function() {
		var numValue = this.getNumValue(this.args[0]);
		if(this.isNum(numValue)){
			if(parseFloat(numValue) >= 0){
				return numValue;
			}else{
				return -numValue;
			}
		}else{
			throw websheet.Constant.ERRORCODE["519"];
		}
	}
});