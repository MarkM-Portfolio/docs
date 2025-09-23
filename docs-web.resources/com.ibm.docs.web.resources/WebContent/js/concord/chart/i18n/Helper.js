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
dojo.provide("concord.chart.i18n.Helper");

concord.chart.i18n.Helper = {
	
	//parse a scientific number to two parts, for example 1.1e33, returns {exp=33,base=1.1}
	parseSciNum:function(num){
		var str = (num + "").toLocaleUpperCase();
		var tmps = str.split("E");
		
		var result = {};
		
		if(tmps.length == 2 && tmps[1].length > 0)				
			result.exp = parseFloat(tmps[1]);			
		
		if(tmps[0].length > 0)
			result.base = parseFloat(tmps[0]);
		else
			result.base = 0;
				
		return result;	
	},	
	// if num is a scientific number, such as 1e33, return true, either, return false
	isSciNum:function(num){
		var str = (num + "");
		var len = str.length;
		for(var i = 0 ; i < len ; i ++)
		{
		  var ch = str.charAt(i);
		  if(ch == "E" || ch == "e")
		  	return true;
		}
		return false;
	},
	//if num is int, return true, either, return false
	isInt: function(num){
		return num % 1 == 0;
	},
	// checks to see if the passed value is a numeric value using a regular expression
	isNumeric: function(val)
	{
		if(val == null)
			return false;
			
		if(typeof val == "number")
			return true;
						
		val = val + "";
		if(val.length==0)
			return false;
		
		var numeric = new RegExp("(^[\-|\+]?\\d+(\\.\\d+)?([e|E][\-|\+]?\\d+)?$)");
		if(numeric.test(val))
			return true;
		
		return false;
	},
	
	getMSDifByTimezoneOffset: function(o1,o2){
		var dif=o1-o2;		
    	if(dif!=0){
    		return  Math.round(dif*60*1000);
    	} else
    		return 0;   
	},
	
	/**
	 * returns the timezone offset of a date.
	 * Fix the issue that Date.getTimezoneOffset() can not return the second part in chrome 67+
	 * 
	 * @param date
	 * @returns timezone offset in minutes
	 */
	/*float*/ getTimezoneOffset: function(date) {
		return (date.getTime() - new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds())).getTime()) / 60000;
	},
	
	checkDateValidSpan: function(sn){
		var snMax = websheet.baseDateStr == websheet.Constant.baseDateStr ? 2958465 : 2957003;// sn for 9999-12-31 this.getSerialNumberWithYMD(9999,11,31);
		var snMin = 0 ;  //0 is sn for 1899-12-30   this.getSerialNumberWithYMD(1899,11,30);

		if(sn>=snMax+1 || sn<snMin)
			return false;
		return true;
	},
	
	convertSciNum2General: function(num) {
		var sciNum = this.parseSciNum(num);
		var result = "";
		if (sciNum.exp != undefined && sciNum.base != undefined) {
			var bNegative = false;
			if (sciNum.base < 0) {
				sciNum.base = 0 - sciNum.base;
				bNegative = true;
			}
			var valueStr = sciNum.base.toString();
			var decimalPlace = valueStr.indexOf(".") > -1 ? valueStr.split(".")[1].length : 0;
			var value = valueStr.replace(".", "");
			var zeros = "";
			if (sciNum.exp < 0){
				for (var i = 0; i < - sciNum.exp - 1; ++i) zeros = zeros.concat("0");
				result = "0." + zeros + value;
			} else if (sciNum.exp >= decimalPlace) {
				for (var i = 0; i < sciNum.exp - decimalPlace; ++i) zeros = zeros.concat("0");
				result = value + zeros;
			} else {
				var idx = value.length - (decimalPlace - sciNum.exp);
				result = value.substring(0, idx) + "." + value.substring(idx);
			}
			if (bNegative) result = "-" + result;
		}	
		return result;
	}
		
};