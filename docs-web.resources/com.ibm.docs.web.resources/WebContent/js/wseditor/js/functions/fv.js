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
dojo.provide("websheet.functions.fv");

dojo.declare("websheet.functions.fv", websheet.functions.FormulaBase, {
	
	constructor: function() {
		this.minNumOfArgs = 3;
		this.maxNumOfArgs = 5;
	},
	
	calc: function(context) {
		var values = this.args;
		var rate = this.getNumValue(values[0]);
		var nper = this.getNumValue(values[1]);
		var pmt  = this.getNumValue(values[2]);
		var pv = values[3] ? this.getNumValue(values[3]) : 0;
		var type = values[4] && this.getNumValue(values[4]) ? 1 : 0;
		return this._calcFutureValue(rate, nper, pmt, pv, type);
	},

	/*Number*/_calcFutureValue: function(rate, nper, pmt, pv, type) {
		var pv;
		if (rate) {
			fv = - pv * Math.pow(1 + rate, nper) - pmt * (1 + rate * type) * (Math.pow(1 + rate, nper) - 1) / rate;
		} else {
			fv = - (pv + pmt * nper);
		}
		return fv;
	}
	
});