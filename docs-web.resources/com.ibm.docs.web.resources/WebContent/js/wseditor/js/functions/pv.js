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
dojo.provide("websheet.functions.pv");

dojo.declare("websheet.functions.pv", websheet.functions.FormulaBase, {
	
	constructor: function() {
		this.minNumOfArgs = 3;
		this.maxNumOfArgs = 5;
	},
	
	calc: function(context) {
		var values = this.args;
		var rate = this.getNumValue(values[0]);
		if(rate == -1)
			throw websheet.Constant.ERRORCODE["532"];
		var nper = this.getNumValue(values[1]);
		var pmt  = this.getNumValue(values[2]);
		var fv = values[3] ? this.getNumValue(values[3]) : 0;
		var type = values[4] && this.getNumValue(values[4]) ? 1 : 0;
		return this._calcPresentValue(rate, nper, pmt, fv, type);
	},

	/*Number*/_calcPresentValue: function(rate, nper, pmt, fv, type) {
		var pv;
		if (rate) {
			pv = - (fv + pmt * (1 + rate * type) * (Math.pow(1 + rate, nper) - 1) / rate) / Math.pow(1 + rate, nper);
		} else {
			pv = - (fv + pmt * nper);
		}
		return pv;
	}
	
});