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

dojo.provide("websheet.functions._datetime");
dojo.declare("websheet.functions._datetime",  websheet.functions._date, {
	_hour:0,
	_minute:0,
	_second:0,
	_date:0,
	
	constructor: function() {	
		this.maxNumOfArgs = 1;	
	},
	
	/*string*/calc: function() {
		var value = this.getNumValue(this.args[0]);
		this.checkDateValidSpan(value);
		var hms=websheet.Math.sub(value,Math.floor(value));
		value=Math.floor(value);
		this._date = new Date(this.getMSWithSerialNumber(value));
		websheet.Helper.setTimezoneOffset(this._date);
		this.parseHMS(hms);
		return this.getResult(this._date);
	},
	
	getHour: function(){
		return this._hour;
	},
	
	getMinute: function(){
		return this._minute;
	},
	
	getSecond: function(){
		return this._second;
	},
	
	parseHMS: function(number){		
		number=websheet.Math.sub(number,Math.floor(number));
		number=websheet.Math.mul(number,24);
		this._hour=Math.floor(number);
		number=websheet.Math.sub(number,Math.floor(number));	
		number=websheet.Math.mul(number,60);
		this._minute=Math.floor(number);
		number=websheet.Math.sub(number,Math.floor(number));	
		this._second= Math.round(websheet.Math.mul(number,60));		
		
		if(this._second==60){
			this._second= 0;
			this._minute++;
			if(this._minute==60){
				this._minute=0;
				this._hour++;
				if(this._hour==24){
					this._hour=0;
					if(this._date){
						this._date.setDate(this._date.getDate()+1);
					}
				}
			}			
		}		
	},
	
	/*int*/ getResult: function(date){	
		/* to be overridden */
		return 0;		
	}	
});