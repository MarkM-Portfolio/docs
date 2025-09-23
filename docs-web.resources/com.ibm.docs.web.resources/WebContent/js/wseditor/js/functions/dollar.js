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
/**
 * @author Chao Yang 
 */	
dojo.provide("websheet.functions.dollar");
dojo.declare("websheet.functions.dollar", websheet.functions._scientific, {
	
	constructor: function()
	{
		this.maxNumOfArgs = 2;
		this.minNumOfArgs = 1;
		this.inherited(arguments);
	},
	
	/*Float*/
	calc: function()
	{   
		
		var value = this.args[0];//the number to be formatted
	    var myValue = this.getNumValue(value);
	    if(this.args.length==1){
	    	myDecimals = 2;
		}
		else if(this.args.length==2){
			var decimals = this.args[1];
			var myDecimals = this.getNumValue(decimals);
		    var strDecimals = this.parseScientific(myDecimals);
        	var strNum = strDecimals.split(".");
        	myDecimals = parseFloat(strNum[0]);	    		
		}
	    if(myDecimals >= 128) throw websheet.Constant.ERRORCODE["519"];
	    var	testValue = myValue >= 0 ? myValue : -myValue;
		var result = this.fixFloatToLocalNumber(testValue,myDecimals); 
		if(myDecimals == 0) {
			result = result.replace(".","");
		}
		var temp = parseFloat(result);
		var locale = this.getLocale();
		var bundle = dojo.i18n.getLocalization("dojo.cldr" , "number" , locale);
		var commas = bundle["group"];
		var point = bundle["decimal"];
		result = this.addCommas(result,commas, point);
		if(myValue >= 0 || temp==0){
			return "$" + result;
		}
		else{
			return "($" + result +")";
		}
	}
});