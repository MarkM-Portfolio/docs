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
dojo.provide("websheet.functions.pricemat");

dojo.declare("websheet.functions.pricemat", websheet.functions.FormulaBase, {
	
	constructor: function() {
		this.minNumOfArgs = 5;
		this.maxNumOfArgs = 6;
	},
	
	calc: function(context) {
		var values = this.args;
		var settlement = this.getNumValue(values[0]);
		var maturity = this.getNumValue(values[1]);
		if(settlement >= maturity)
			throw websheet.Constant.ERRORCODE["504"];
		var issue = this.getNumValue(values[2]);
		var rate = this.getNumValue(values[3]);
		var yld = this.getNumValue(values[4]);
		if(rate <= 0 || yld <= 0)
			throw websheet.Constant.ERRORCODE["504"];
		var basis = values[5] ? this.getNumValue(values[5]) : 0;
		if(basis != 0 && basis != 1 && basis != 2 && basis != 3 && basis != 4)
			throw websheet.Constant.ERRORCODE["504"];
		return this._calcPRICEMAT(settlement, maturity, issue, rate, yld, basis);
	},

	/*Number*/_calcPRICEMAT: function(settlement, maturity, issue, rate, yld, basis) {
		var daysSet2Mat = websheet.Helper.getDaysOfFraction(settlement, maturity, basis);
		var daysIss2Set = websheet.Helper.getDaysOfFraction(issue, settlement, basis);
		var daysIss2Mat = websheet.Helper.getDaysOfFraction(issue, maturity, basis); 
		var daysOfYear = websheet.Helper.getDaysOfYear(issue, maturity, basis);
		return (100 + daysIss2Mat * rate * 100 / daysOfYear) / (1 + daysSet2Mat / daysOfYear * yld) - daysIss2Set / daysOfYear * rate * 100;
	}
	
});