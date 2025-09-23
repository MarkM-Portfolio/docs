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

dojo.provide("websheet.functions.upper");

dojo.declare("websheet.functions.upper", websheet.functions.FormulaBase, {
	
	constructor: function() {
		this.maxNumOfArgs = 1;
		this.inherited(arguments);
	},
	
	/*string*/calc: function() {
		var value = this.args[0];
		var type = value.getType();
		var text = this.fetchScalaResult(value,true,true);
		
		var upperText = "";
		text = this.getValue(text, type);
		if(text)
			upperText = text.toLocaleUpperCase();
		return upperText;
	}
});