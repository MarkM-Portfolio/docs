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

dojo.provide("websheet.functions.time");

dojo.declare("websheet.functions.time", websheet.functions.FormulaBase, {
	
	constructor: function() {
		this.minNumOfArgs = 3;
		this.maxNumOfArgs = 3;		
	},
	
	/*int*/calc: function() {
		var hour, minute, second;
		dojo.forEach(this.args,function(item,i){
			var value = this.getNumValue(item);				
			if(i==0)
				hour=Math.floor(value);	
			else if(i==1)
				minute=Math.floor(value);
			else
				second=Math.floor(value);
		},this);
		
		this.validTime(hour, minute, second);
    	return this.getTime(hour, minute, second);
	},
	
	validTime: function(hour, minute, second){
		if(hour>32767 || hour<-32768)
			throw websheet.Constant.ERRORCODE["504"];	//#NUM!
		if(minute>32767 || minute<-32768)
			throw websheet.Constant.ERRORCODE["504"];	//#NUM!
		if(second>32767 || second<-32768)
			throw websheet.Constant.ERRORCODE["504"];	//#NUM!
	},
	
	/*number*/ getTime: function(hour, minute, second){
		var sum=hour*60*60+minute*60+second;				
		if(sum<0)
			throw websheet.Constant.ERRORCODE["504"];	//#NUM!
		
		//Seconds in one day
		var SecondinDay = 86400;// 60*60*24 	
 		var temp=sum/SecondinDay;
    	return temp-Math.floor(temp);
	}
});