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
dojo.provide("websheet.functions.tbillprice");

dojo.declare("websheet.functions.tbillprice", websheet.functions.FormulaBase, {
	
	constructor: function() {
		this.minNumOfArgs = 3;
		this.maxNumOfArgs = 3;
	},
	
	calc: function(context) {
		var values = this.args;
		var settlement = this.getNumValue(values[0]);
		var maturity = this.getNumValue(values[1]);
		if(settlement >= maturity)
			throw websheet.Constant.ERRORCODE["504"];
		var discount = this.getNumValue(values[2]);
		if(discount <= 0)
			throw websheet.Constant.ERRORCODE["504"];
		return this._calcTBILLPRICE(settlement, maturity, discount);
	},

	/*Number*/_calcTBILLPRICE: function(settlement, maturity, discount) {
		return 100 * (1 - discount * (maturity - settlement) / 360);
	}
	
});