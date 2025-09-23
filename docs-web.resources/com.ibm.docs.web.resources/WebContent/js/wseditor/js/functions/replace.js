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

dojo.provide("websheet.functions.replace");

dojo.declare("websheet.functions.replace", websheet.functions.FormulaBase, {
	
	constructor: function() {
		this.minNumOfArgs = 4;
		this.maxNumOfArgs = 4;
		this.inherited(arguments);
	},
	
	/*string*/calc: function() {
		var values = this.args;
		var text = this.fetchScalaResult(values[0],false,true);
		var type = values[0].getType();
		text = this.getValue(text, type);
		
		type = values[1].getType();		
		var start = parseInt(this.getValue(this.fetchScalaResult(values[1]), type, this.LOCALE_NUM));
		
		type = values[2].getType();
		var len = parseInt(this.getValue(this.fetchScalaResult(values[2]), type, this.LOCALE_NUM));
		if (start < 1 || len < 0) throw websheet.Constant.ERRORCODE["519"];
		
		var newText = this.fetchScalaResult(values[3],false,true);
		type = values[3].getType();
		
		newText = this.getValue(newText, type);
		var pre = text.substr(0, start-1);
		var post = "";
		if (start + len <= text.length)
			post = text.substr(start - 1 + len);
		
		return pre + newText + post;
	}
});