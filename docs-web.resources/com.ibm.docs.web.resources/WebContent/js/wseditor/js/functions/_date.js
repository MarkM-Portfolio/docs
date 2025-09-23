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

dojo.provide("websheet.functions._date");
dojo.declare("websheet.functions._date",websheet.functions.FormulaBase, {	
	/*int*/ getSerialNumberWithYMD: function(year, month, day){		
		var sn = websheet.Helper.getSerialNumberWithYMD(year, month, day);
		this.checkDateValidSpan(sn);
    	return sn;
	},
	
	/*int*/ getSerialNumberWithDate: function(date){ 
		//ms in one day
		var sn = websheet.Helper.getSerialNumberWithDate(date, true);
		this.checkDateValidSpan(sn);
    	return sn;
	},

	/*int*/ getMSWithSerialNumber: function(sn){
		this.checkDateValidSpan(sn);
    	return websheet.Helper.getMSWithSerialNumber(sn);
	},
	
	/*void*/ checkDateValidSpan: function(sn){
		if(!websheet.Helper.checkDateValidSpan(sn))
			throw websheet.Constant.ERRORCODE["504"];	//#NUM!
	}
});