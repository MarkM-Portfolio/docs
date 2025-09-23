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
dojo.provide("websheet.functions.cumprinc");

dojo.declare("websheet.functions.cumprinc", websheet.functions.fv, {
	
	constructor: function() {
		this.minNumOfArgs = 6;
		this.maxNumOfArgs = 6;
	},
	
	calc: function(context) {
		var values = this.args;
		var rate = this.getNumValue(values[0]);
		var nper = this.getNumValue(values[1]);
		var pv = this.getNumValue(values[2]);
		var start = this.getNumValue(values[3]);
		var end = this.getNumValue(values[4]);
		var type = this.getNumValue(values[5]);
		if(rate <= 0 || nper <= 0 || pv <= 0 || start < 1 || end < 1 || start > end)
			throw websheet.Constant.ERRORCODE["504"];
		if(type != 0 && type != 1)
			throw websheet.Constant.ERRORCODE["504"];
		return this._calcCUMPRINC(rate, nper, pv, start, end, type);
	},

	/*Number*/_calcCUMPRINC: function(rate, nper, pv, start, end, type) {
		var payment;
		if(rate)
			payment =  rate * (pv * Math.pow(1 + rate, nper)) / ((1 + rate * type) * (1 - Math.pow(1 + rate, nper)));
		else
			payment = - pv / nper;
		var principal = 0;
		if(start === 1) {
			if(type === 0) {
				principal = payment + pv * rate;
		    } else {
		    	principal = payment;
		    }
		    start++;
		}
		for (var i = start; i <= end; i++) {
			if (type === 1) {
				principal += payment - (this._calcFutureValue(rate, i - 2, payment, pv, 1) - payment) * rate;
			} else {
				principal += payment - this._calcFutureValue(rate, i - 1, payment, pv, 0) * rate;
			}
		}
		return principal;
	}
	
});