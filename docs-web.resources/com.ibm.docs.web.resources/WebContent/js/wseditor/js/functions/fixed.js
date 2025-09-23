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
dojo.provide("websheet.functions.fixed");
dojo.declare("websheet.functions.fixed",websheet.functions._scientific,{
	
	constructor: function()
	{
		this.maxNumOfArgs = 3;
		this.minNumOfArgs = 1;
		
	},
	
	/*Float*/
	calc: function()
	{   
		var value = this.args[0];//the number to be formatted
		//this structor of value
		//_calculateValue
		//_parent
		//_token
		//_tokenType
		//prototype
        var myValue = this.getNumValue(value);        
        var decimals = this.args[1];
        var myDecimals,dType;
        if(decimals){
        	myDecimals = this.fetchScalaResult(decimals,true);
			dType = decimals.getTokenType();
			myDecimals = this.getValue(myDecimals, dType, this.LOCALE_NUM);
			if(myDecimals>=128) throw websheet.Constant.ERRORCODE["519"];
	    }
        if(dType==this.tokenType.NONE_TOKEN || myDecimals == undefined){
	    	myDecimals = 2;
	    }//e.g 1.23E-87,-7E+29
        else{
        	var strDecimals = this.parseScientific(myDecimals);
        	var strNum = strDecimals.split(".");
        	myDecimals = parseFloat(strNum[0]);
	    }		
		switch (this.args.length){
			case 1:
				myDecimals=2;
				break;
			case 2:
				break;
			case 3:
				var no_commas = this.args[2];
				var myNo_commas = this.fetchScalaResult(no_commas,true);
				if(typeof myNo_commas =="string"){
					myNo_commas = this.toBoolean(myNo_commas);//e.g:"faLSe"
				}
				if(typeof myNo_commas =="string"){
					throw websheet.Constant.ERRORCODE["519"];
				}
				break;
		};
		var result = this.fixFloatToLocalNumber(myValue,myDecimals); 
		var locale = this.getLocale();
		var bundle = dojo.i18n.getLocalization("dojo.cldr" , "number" , locale);
		var commas = bundle["group"];
		var point = bundle["decimal"];
		if(!myNo_commas){
			result = this.addCommas(result,commas,point);
		}
		return result;
	}
});
