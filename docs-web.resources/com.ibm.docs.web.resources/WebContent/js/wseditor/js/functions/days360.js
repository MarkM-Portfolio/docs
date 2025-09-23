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

dojo.provide("websheet.functions.days360");
dojo.declare("websheet.functions.days360",websheet.functions._date, {
	
	constructor: function() {
		this.minNumOfArgs = 2;	
		this.maxNumOfArgs = 3;		
	},
	
	/*int*/calc: function() {
		/*
		 * start_date: text with date/datetime format
		 * end_date: text with date/datetime format
		 * method: number or boolean
		 */
		var values = this.args;
		var start = this._getDate(values[0]);
		var end = this._getDate(values[1]);
		var type = false;
		if (values.length == 3){
			var value = this.getValue(this.fetchScalaResult(values[2]), values[2].getType(), this.LOCALE_NUM);
			type = value;
		}
		var startDate = start.getDate();
		var endDate = end.getDate();
		if(type){
			if (startDate === 31) startDate = 30;
			if (endDate === 31) endDate = 30;
		} else {
			var smd = emd = 31;
			if(start.getMonth() === 1)
				smd = this._getDaysInMonth(start);
			if(end.getMonth() === 1)
				emd = this._getDaysInMonth(end);
			startDate = (startDate === smd)? 30 : startDate;
			if(startDate === 30 || startDate === smd)
				endDate = (endDate === emd)? 30 : endDate;
		}
		return 360 * (end.getFullYear() - start.getFullYear()) + 30 * (end.getMonth() - start.getMonth()) + (endDate - startDate);
	},
	_getDate: function(arg){
		var type = arg.getType();		
		var value=this.fetchScalaResult(arg,true);
		value = this.getValue(value,type,this.LOCALE_NUM);
		this.checkDateValidSpan(value);
		var ret = new Date(this.getMSWithSerialNumber(value));
		websheet.Helper.setTimezoneOffset(ret);
		return ret;
	},
	_getDaysInMonth: function (d){
		var year = d.getFullYear();
		if(year%400 == 0 || year%4 == 0 && year%100 != 0)
			return 29;
		return 28;
	}
	
});
