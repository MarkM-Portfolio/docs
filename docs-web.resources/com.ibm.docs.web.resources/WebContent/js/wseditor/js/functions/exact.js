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

dojo.provide("websheet.functions.exact");

dojo.declare("websheet.functions.exact", websheet.functions.FormulaBase, {

	constructor : function() {
		this.minNumOfArgs = 2;
		this.maxNumOfArgs = 2;
	},

	converttype : function(token, text) {
		var result = this.getScalaCell(this.analyzeToken(token), true, token);
		var bBool = result ? result.isBoolean() : false;
		// boolean can be false or FALSE, boolean cell result (0/1), convert it
		// to TRUE/FALSE
		if (text === false || (bBool && text == 0))
			text = "FALSE";
		else if (text === true || (bBool && text == 1))
			text = "TRUE";
		text += "";
		return text;
	},

	/* float */calc : function() {
		var values = this.args;
		var text1, text2, type1, type2;
		type1 = values[0].getType();
		type2 = values[1].getType();
		if (type1 == this.tokenType.SINGLEQUOT_STRING
				|| type2 == this.tokenType.SINGLEQUOT_STRING) {
			throw websheet.Constant.ERRORCODE["525"];
		}
		text1 = this.fetchScalaResult(values[0], true, true);
		text2 = this.fetchScalaResult(values[1], true, true);
		// EXACT(1,"1"),EXACT("1.1",1.1),EXACT("1",0+1): true
		// but EXACT("0-1",0-1), EXACT(fasle,0), EXACT(50%,"50%") : false
		text1 = this.converttype(values[0], text1);
		text2 = this.converttype(values[1], text2);

		return text1 === text2;
	}
});