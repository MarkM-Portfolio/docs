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
dojo.provide("websheet.functions.pricedisc");

dojo.declare("websheet.functions.pricedisc", websheet.functions.FormulaBase, {
	
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
		var discount = this.getNumValue(values[2]);
		var redemption = this.getNumValue(values[3]);
		if(discount <= 0 || redemption <= 0)
			throw websheet.Constant.ERRORCODE["504"];
		var basis = values[4] ? this.getNumValue(values[4]) : 0;
		if(basis != 0 && basis != 1 && basis != 2 && basis != 3 && basis != 4)
			throw websheet.Constant.ERRORCODE["504"];
		return this._calcPRICEDISC(settlement, maturity, discount, redemption, basis);
	},

	/*Number*/_calcPRICEDISC: function(settlement, maturity, discount, redemption, basis) {
		var daysOfFraction = websheet.Helper.getDaysOfFraction(settlement, maturity, basis);
		var daysOfYear = websheet.Helper.getDaysOfYear(settlement, maturity, basis);
		return redemption - discount * redemption * daysOfFraction / daysOfYear;
	}
	
});