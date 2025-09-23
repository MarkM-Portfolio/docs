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

dojo.provide("websheet.functions.date");

dojo.declare("websheet.functions.date", websheet.functions._date, {
	
	constructor: function() {
		this.minNumOfArgs = 3;
		this.maxNumOfArgs = 3;		
	},
	
	/*int*/calc: function() {	
		var year, month, day;
		dojo.forEach(this.args,function(item,i){			
			var value = this.getNumValue(item);	
			if(i==0){
				year=value;
			}else if(i==1){
				month=value;
			}else{
				day=value;
			}
		},this);
		
    	return this.getSerialNumberWithYMD(year,month-1,day);
	}
});