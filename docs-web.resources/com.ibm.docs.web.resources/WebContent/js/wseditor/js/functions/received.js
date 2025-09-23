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
dojo.provide("websheet.functions.received");

dojo.declare("websheet.functions.received", websheet.functions.FormulaBase, {
	
	constructor: function() {
		this.minNumOfArgs = 4;
		this.maxNumOfArgs = 5;
	},
	
	calc: function(context) {
		var values = this.args;
		var settlement = this.getNumValue(values[0]);
		var maturity = this.getNumValue(values[1]);
		if(settlement >= maturity)
			throw websheet.Constant.ERRORCODE["504"];
		var investment  = this.getNumValue(values[2]);
		var discount = this.getNumValue(values[3]);
		if(investment <= 0 || discount <= 0)
			throw websheet.Constant.ERRORCODE["504"];
		var basis = values[4] ? this.getNumValue(values[4]) : 0;
		if(basis != 0 && basis != 1 && basis != 2 && basis != 3 && basis != 4)
			throw websheet.Constant.ERRORCODE["504"];
		return this._calcRECEIVED(settlement, maturity, investment, discount, basis);
	},

	/*Number*/_calcRECEIVED: function(settlement, maturity, investment, discount, basis) {
		var daysOfFraction = websheet.Helper.getDaysOfFraction(settlement, maturity, basis);
		var daysOfYear = websheet.Helper.getDaysOfYear(settlement, maturity, basis);
		return investment / (1 - discount * daysOfFraction / daysOfYear);
	}
	
});