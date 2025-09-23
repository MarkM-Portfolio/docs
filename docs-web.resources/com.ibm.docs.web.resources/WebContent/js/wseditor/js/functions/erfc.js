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

dojo.provide("websheet.functions.erfc");

dojo.declare("websheet.functions.erfc", websheet.functions.FormulaBase, {

	constructor: function(){
		this.maxNumOfArgs = 1;
	},
	
	_erfc: function(x){
		
		var ERFC_COF = [-2.8e-17, 1.21e-16, -9.4e-17, -1.523e-15, 7.106e-15,
		                 3.81e-16, -1.12708e-13, 3.13092e-13, 8.94487e-13,
		                -6.886027e-12, 2.394038e-12, 9.6467911e-11,
		                -2.27365122e-10, -9.91364156e-10, 5.059343495e-9,
		                 6.529054439e-9, -8.5238095915e-8, 1.5626441722e-8,
		                 1.303655835580e-6, -1.624290004647e-6,
		                -2.0278578112534e-5, 4.2523324806907e-5,
		                 3.66839497852761e-4, -9.46595344482036e-4,
		                -9.561514786808631e-3, 1.9476473204185836e-2,
		                 6.4196979235649026e-1, -1.3026537197817094];
		var ERFC_COF_LAST = ERFC_COF[ERFC_COF.length - 1];
		
		var y = Math.abs(x);
		var d = 0.0, dd = 0.0, temp = 0.0, t = 2.0 / (2.0 + y), ty = 4.0 * t - 2.0;
		  
		for (var i = 0; i < ERFC_COF.length - 1; i++) {
			temp = d;
			d = ty * d - dd + ERFC_COF[i];
			dd = temp;
		}
		  
		var ans = t * Math.exp(-y * y + 0.5 * (ERFC_COF_LAST + ty * d) - dd);
		    
		return x >= 0.0 ? ans : 2.0 - ans;
		
	},
	
	/*number*/calc: function(){
		var parm = this.getNumValue(this.args[0]);
		return this._erfc(parm);
	}
	
});