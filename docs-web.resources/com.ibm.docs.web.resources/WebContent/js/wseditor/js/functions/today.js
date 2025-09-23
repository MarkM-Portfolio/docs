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

dojo.provide("websheet.functions.today");

dojo.declare("websheet.functions.today", websheet.functions._date, {
	
	constructor: function() {
		this.minNumOfArgs = 0;
		this.maxNumOfArgs = -1;			
	},
	
	/*int*/calc: function() {		
    	return this.getSerialNumberWithDate(new Date());
	}
});