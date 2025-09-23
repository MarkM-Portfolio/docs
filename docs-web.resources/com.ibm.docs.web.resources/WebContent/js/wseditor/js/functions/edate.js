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

dojo.provide("websheet.functions.edate");

dojo.declare("websheet.functions.edate", websheet.functions._date, {

	constructor: function() {
		this.minNumOfArgs = 2;
		this.maxNumOfArgs = 2;
	},
	
	/*int*/calc: function() {
		return this.calcSerialNumber(false);
	},
	
	/*Date*/getStartDate: function() {
		var value = this.fetchScalaResult(this.args[0]);
		if (typeof value == "string") {
			value = this.NumberRecognizer._autoPaseAsDateTime(value);
			if(!value.isNumber)
				throw websheet.Constant.ERRORCODE["519"]; // #VALUE!
			value = value.fValue;
		}
		if (value < 0)
			throw websheet.Constant.ERRORCODE["504"]; // #NUM!
		value = Math.floor(value);
		var date = new Date(this.getMSWithSerialNumber(value));
		return date;
	},
	
	/*int*/getDelta: function() {
		var delta = this.fetchScalaResult(this.args[1]);
		if (typeof delta == "string") {
			delta = parseInt(delta);
		} else if (typeof delta == "number") {
			delta = delta > 0 ? Math.floor(delta) : Math.ceil(delta);
		}
		if(isNaN(delta))
			throw websheet.Constant.ERRORCODE["519"];
		return delta;
	},
	
	/*int*/calcSerialNumber: function(isLastDay) {
		var startDate = this.getStartDate();
		var delta = this.getDelta();
		var year = startDate.getFullYear();
		var month = startDate.getMonth() + 1;
		var date = startDate.getDate();

		var deltaY = delta > 0 ? Math.floor(delta / 12) : Math.ceil(delta / 12);
		var deltaM = delta % 12;
		resultY = year + deltaY;
		resultM = month + deltaM;
		if (resultM > 12) {
			resultY++;
			resultM -= 12;
		} else if (resultM < 0){
			resultY--;
			resultM += 12;
		}

		var result = new Date(resultY, resultM, 0);
		if(isNaN(result) || result < new Date(websheet.baseDateStr))
			throw websheet.Constant.ERRORCODE["504"];
		var resultD = result.getDate();
		if (!isLastDay)
			resultD = date < resultD ? date : resultD;

		return this.getSerialNumberWithYMD(resultY, resultM - 1, resultD);
	}
});