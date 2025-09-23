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

dojo.provide("websheet.functions.trunc");

dojo.declare("websheet.functions.trunc", websheet.functions.FormulaBase, {
	
	constructor: function() {
		this.maxNumOfArgs = 2;
		this.inherited(arguments);
	},
	
	/*number*/calc: function() {
		var length = this.args.length;
		var values = this.args;
		var decimalCount = 0;
		var fact = this.getNumValue(values[0]);
		
		if(length == 2){
			decimalCount = this.getNumValue(values[1]);			
			decimalCount = parseInt(decimalCount);
		}
		
		if(decimalCount == 0)
			return parseInt(fact);
		
		if(decimalCount >0){
			fact = new String(fact);
			var dotIndex = fact.indexOf(".");
			if(dotIndex != -1){
				var len = fact.length;
				var fractionalCount = len - dotIndex - 1;
				if(decimalCount > fractionalCount){
					return parseFloat(fact);
				}else{
					return parseFloat(fact.substring(0, dotIndex + 1 + parseInt(decimalCount)));
				}
			}
			return parseFloat(fact);
		}else { // decimalCount < 0
			decimalCount = -decimalCount;
			fact = new String(fact);
			var intFraction = fact.indexOf(".");
			if(decimalCount >= intFraction){
				return 0;
			}else{
				var del = intFraction - decimalCount;
				fact = fact.substring(0, del);
				while(decimalCount > 0){
					fact += "0";
					decimalCount--;
				}
			}
			return parseFloat(fact);
		}
	}
});