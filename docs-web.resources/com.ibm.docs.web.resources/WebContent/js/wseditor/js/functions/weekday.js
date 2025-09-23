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

dojo.provide("websheet.functions.weekday");

dojo.declare("websheet.functions.weekday",  websheet.functions._date, {
	
	constructor: function() {		
		this.maxNumOfArgs = 2;			
	},
	
	/*int*/calc: function() {
		var values = this.args;
		var returntype = 1;
		var sn = this.getNumValue(values[0]);
		
		if(values.length==2){
			returntype=this.getNumValue(values[1]);
			returntype=Math.floor(returntype);
		}
		
		var d=new Date(this.getMSWithSerialNumber(Math.floor(sn)));
		websheet.Helper.setTimezoneOffset(d);
		
		var weekday=d.getDay();		
		switch (returntype) {
			case 1:
			case 17:
				return weekday+1;
			case 2:
			case 11:			
				return (weekday+6)%7+1;
			case 3: 
				return (weekday+6)%7;
			case 12: 
				return (weekday+5)%7+1;
			case 13: 
				return (weekday+4)%7+1;
			case 14: 
				return (weekday+3)%7+1;
			case 15: 
				return (weekday+2)%7+1;
			case 16: 
				return (weekday+1)%7+1;
			
			default: throw  websheet.Constant.ERRORCODE["519"];
		}
	}
});