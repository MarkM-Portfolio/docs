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
dojo.provide("websheet.functions.ipmt");
dojo.declare("websheet.functions.ipmt", websheet.functions.pmt, {
	constructor: function() {
		this.minNumOfArgs = 4;
		this.maxNumOfArgs = 6;
	},
	
	calc: function(context) {
		var values = this.args;
		var rate = this.getNumValue(values[0]);
		if (rate <= -1) {
			throw websheet.Constant.ERRORCODE["504"];
		}
		var per = this.getNumValue(values[1]);
		var nper = this.getNumValue(values[2]);
		if (per < 1 || websheet.Math.sub(per, nper, true) >= 1) {
			throw websheet.Constant.ERRORCODE["504"];
		}
		var pv  = this.getNumValue(values[3]);
		var fv = values[4] ? this.getNumValue(values[4]) : 0;
		var type = values[5] && this.getNumValue(values[5]) ? 1 : 0;
		return this._calcInterest(rate, per, nper, pv, fv, type);
	}
});