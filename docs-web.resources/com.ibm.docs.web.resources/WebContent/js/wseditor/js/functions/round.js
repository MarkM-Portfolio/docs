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

dojo.provide("websheet.functions.round");

dojo.declare("websheet.functions.round", websheet.functions.FormulaBase, {
	
	constructor: function() {
		this.minNumOfArgs = 2;  // Excel need two arguments for function ROUND, ROUNDUP, ROUNDDOWN
		this.maxNumOfArgs = 2;
		this.inherited(arguments);
	},
	
	/*float*/calc: function() {
		var values = this.args;
		var length = values.length;
		var count = 0;
		
		var roundValue = this.getNumValue(values[0]);
		
		if(length == 2){
			count = this.getNumValue(values[1]);
			count = parseInt(count);
		}
		
		if(count == 0){
			if(roundValue < 0)//round(-1.5) should be -2.
			  return 0 - Math.round(0-roundValue);
			return Math.round(roundValue);
		}
		
		var tmpValue = websheet.Helper.isSciNum(roundValue) ? websheet.Helper.convertSciNum2General(roundValue) : roundValue + "";
		if(count > 0){
			var dotIndex = tmpValue.indexOf(".");
			if(dotIndex != -1){
				var len = tmpValue.length;
				var decimalCount = len - dotIndex - 1;
				if(count > decimalCount){
					return roundValue;
				}else{
					//for FF, toFixed can not be rounded correctly for 5
					//such as for round(2.945;2) FF return 2.94, IE return 2.95
//					roundValue = Number(roundValue).toFixed(count);
//					return roundValue;
					var multi = 1;
					if(roundValue < 0)
						multi = -1;
					var div = Math.pow(10, count);
					roundValue = (Math.round(Math.abs(roundValue) * div)/div) * multi;
					return roundValue;
				}
			}
		}else{
			count = -count;
			var intFraction = tmpValue.indexOf(".");
			if(intFraction == -1)
				intFraction = tmpValue.length;
			if(count >= intFraction){
				return 0;
			}else{
				var temp = count;
				var decimals = tmpValue.length-intFraction-1;
				while(temp > 0){
					roundValue /= 10;
					roundValue = roundValue.toFixed(++decimals);//prevent form accuracy problem
					temp--;
				}
				roundValue = Math.round(roundValue);
				while(count > 0){
					roundValue *= 10;
					count--;
				}
			}
			return roundValue;
		}
		return roundValue;
	}
});