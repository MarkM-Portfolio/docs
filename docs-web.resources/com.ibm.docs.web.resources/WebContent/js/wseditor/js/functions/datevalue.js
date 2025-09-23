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

dojo.provide("websheet.functions.datevalue");
dojo.declare("websheet.functions.datevalue", websheet.functions._date, {
	
	constructor: function() {	
		this.maxNumOfArgs = 1;		
	},
	
	/*int*/calc: function() {
		/*
		 * date_text: text with date/datetime format
		 */
		var value = this.fetchScalaResult(this.args[0]);
		if(typeof value != "string")
			throw websheet.Constant.ERRORCODE["519"];// #VALUE
		value = value.replace(/(^\s*)|(\s*$)/g, ""); // remove space in front and end
		var result = this.NumberRecognizer._autoPaseAsDateTime(value); // !inner method of numberRecognizer
		if(!result.isNumber)
			throw websheet.Constant.ERRORCODE["519"];// #VALUE
		this.checkDateValidSpan(result.fValue);
		return this.getResult(result.fValue);
	},
	getResult: function(date){
		return Math.floor(date);
	}
	
});