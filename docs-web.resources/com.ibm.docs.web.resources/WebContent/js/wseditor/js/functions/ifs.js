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

dojo.provide("websheet.functions.ifs");
dojo.declare("websheet.functions.ifs", websheet.functions.FormulaBase, {
	
	constructor: function() {
		this.minNumOfArgs = 2;
		this.maxNumOfArgs = 255;
		this.oddNumOfArgs = 0; 
	},

	calc: function(context) {
		var len = this.args.length;
		var logicalTest;
		for (var i = 0; i < len; i += 2) {
			logicalTest = this.args[i];
			logicalTest = this.fetchScalaResult(logicalTest, true);
			if (typeof logicalTest  === "string") {
				logicalTest = this.toBoolean(logicalTest);
			}
			if (logicalTest) {
				break;
			}
		}
		if (i >= len){
			throw websheet.Constant.ERRORCODE["7"]; 
		}
		var result = this.args[++i];
		result = this.fetchScalaResult(result, true);
		return result;
	}
});