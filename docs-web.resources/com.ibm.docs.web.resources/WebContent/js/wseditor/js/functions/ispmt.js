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
dojo.provide("websheet.functions.ispmt");

dojo.declare("websheet.functions.ispmt", websheet.functions.FormulaBase, {
	
	constructor: function() {
		this.minNumOfArgs = 4;
		this.maxNumOfArgs = 4;
	},
	
	calc: function(context) {
		var values = this.args;
		var rate = this.getNumValue(values[0]);
		var per = this.getNumValue(values[1]);
		var nper  = this.getNumValue(values[2]);
		var pv = this.getNumValue(values[3]);
		return -this._calcISPMT(rate, per, nper, pv);
	},

	/*Number*/_calcISPMT: function(rate, per, nper, pv) {
		var left = pv - pv/nper*per;
		return left * rate;
	}
	
});