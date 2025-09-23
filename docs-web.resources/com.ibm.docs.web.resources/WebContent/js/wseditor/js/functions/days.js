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

dojo.provide("websheet.functions.days");
dojo.declare("websheet.functions.days",websheet.functions._date, {
	
	constructor: function() {
		this.minNumOfArgs = 2;	
		this.maxNumOfArgs = 2;		
	},
	
	/*int*/calc: function() {
		var t1,t2;
		dojo.forEach(this.args,function(item,i){		
			var value = this.getNumValue(item);
			value = Math.floor(value);
			this.checkDateValidSpan(value);
			if(i==0)
				t1=value;
			else
				t2=value;
			
		},this);
		
		return websheet.Math.sub(t1,t2);
	}
});