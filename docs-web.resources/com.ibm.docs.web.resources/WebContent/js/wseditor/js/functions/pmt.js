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
dojo.provide("websheet.functions.pmt");

dojo.declare("websheet.functions.pmt", websheet.functions.FormulaBase, {
	constructor: function() {
		this.minNumOfArgs = 3;
		this.maxNumOfArgs = 5;
	},
	
	calc: function(context) {
		var values = this.args;
		var rate = this.getNumValue(values[0]);
		if (rate <= -1) {
			throw websheet.Constant.ERRORCODE["504"];
		}
		var nper = this.getNumValue(values[1]);
		if (nper === 0) {
			throw websheet.Constant.ERRORCODE["504"];
		}
		var pv  = this.getNumValue(values[2]);
		var fv = values[3] ? this.getNumValue(values[3]) : 0;
		var type = values[4] && this.getNumValue(values[4]) ? 1 : 0;
		return this._calcPayment(rate, nper, pv, fv, type);
	},

	/*Number*/_calcPayment: function(rate, nper, pv, fv, type) {
		var wsMath = websheet.Math;
		var pmt;
		if (rate) {
			// pmt =  rate * (fv + pv * Math.pow(1 + rate, nper)) / ((1 + rate * type) * (1 - Math.pow(1 + rate, nper)));
			var tmp = wsMath.add(1, rate, true);
			var pow = wsMath.pow(tmp, nper, true);
			tmp = wsMath.mul(pv, pow, true);
			tmp = wsMath.add(fv, tmp, true);
			pmt = wsMath.mul(rate, tmp, true);
			tmp = wsMath.sub(1, pow, true);
			pmt = wsMath.div(pmt, tmp, true);
			tmp = wsMath.mul(rate, type, true);
			tmp = wsMath.add(1, tmp, true);
			pmt = wsMath.div(pmt, tmp, true);
		} else {
			// pmt = - (pv + fv) / nper;
			pmt = wsMath.add(pv, fv, true);
			pmt = - wsMath.div(pmt, nper, true);
		}
		return pmt;
		
	},
	
	/*Number*/_calcInterest: function(rate, per, nper, pv, fv, type) {
		if (!rate || (type && per === 1)) {
			return 0;
		}
		var wsMath = websheet.Math;
		var pmt = this._calcPayment(rate, nper, pv, fv, type);
		//var ipmt = pmt * (1 - Math.pow(1 + rate, per - 1)) - rate * pv * Math.pow(1 + rate, per - 1 - type);
		var base = wsMath.add(1, rate, true);
		var tmp = wsMath.sub(per, 1, true);
		tmp = wsMath.pow(base, tmp, true);
		tmp = wsMath.sub(1, tmp, true);
		var ipmt = wsMath.mul(pmt, tmp, true);
		tmp = wsMath.sub(per, 1 + type, true);
		tmp = wsMath.pow(base, tmp, true);
		tmp = wsMath.mul(pv, tmp, true);
		tmp = wsMath.mul(rate, tmp, true);
		ipmt = wsMath.sub(ipmt, tmp, true);
		return ipmt;		
	}
});