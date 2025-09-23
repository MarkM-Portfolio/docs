/* ***************************************************************** */
/*                                                                   */
/* HCL Confidential                                                  */
/*                                                                   */
/* OCO Source Materials                                              */
/*                                                                   */
/* Copyright HCL Technologies Limited 2010, 2022                     */
/*                                                                   */
/* The source code for this program is not published or otherwise    */
/* divested of its trade secrets, irrespective of what has been      */
/* deposited with the U.S. Copyright Office.                         */
/*                                                                   */
/* ***************************************************************** */

dojo.provide("websheet.functions.workday");
dojo.require("concord.editor.CharEquivalence");

dojo.declare("websheet.functions.workday", websheet.functions._date, {

	constructor : function() {
		this.minNumOfArgs = 2;
		this.maxNumOfArgs = 3;
	},
	/* int */calc : function() {
		/*
		 * start_date: text or date/datetime 
		 * days: number 
		 * holidays: array or range
		 */
		var values = this.args;
		var datesn = this._parseStartDate(values[0]);
		var days = this._parseArg(values[1]);
		this.checkDateValidSpan(datesn + days);
		var holidays = [];
		if (values.length == 3) {
			holidays = this._parseHolidays(values[2]);
		}
		var weekends = [];
		weekends [0] = 6;
		weekends [1] = 0;
		if(days != 0){
			var i = 0;
			while(i != days){
				datesn+= days>0? 1: -1;
				var dayOfDate = (datesn - 1) % 7;
				if(weekends.indexOf(dayOfDate) < 0 && holidays.indexOf(datesn) < 0)
					i+= days>0? 1: -1;
			}
		}
		this.checkDateValidSpan(datesn);
		return datesn;
	},
	_parseStartDate : function(value) {
		var num = this._parseArg(value);
		this.checkDateValidSpan(num);
		return num;
	},
	_parseArg : function(value) {
		var result = this.analyzeToken(value);
		if(this.isRangeObj(result) && !result.isSingleCell())
			 throw websheet.Constant.ERRORCODE["519"];

		var num = this.fetchScalaResult(value, true, false); //bNonZero=false
		if (num === null || num === "")
			throw websheet.Constant.ERRORCODE["7"];
		if(typeof num == "string"){
			var numResult = this.NumberRecognizer.parse(num, false, false); // bOnlyParseNum=false, bParseBool=false
			if(numResult.isNumber)
				num = numResult.fValue;
		}
		if (typeof num != "number")
			throw websheet.Constant.ERRORCODE["519"];// #VALUE
		return Math.floor(num);
	},
	_parseHolidays : function(value) {
		var type1 = value.getType();
		var ret = [];
		var isArray = false; // true means array formula, false means range.
		if (type1 == this.tokenType.ARRAYFORMULA_TOKEN) {
			value = value.getValue();
			isArray = true;
		} else {
			var temp = value;
			value = this.analyzeToken(value);
			if (dojo.isArray(value)) {
				var res = this.analyzeToken(value[0]);
				if (this.isRangeObj(res) && (value.length == 1))
					value = res;
				else
					throw websheet.Constant.ERRORCODE["7"]; // #N/A
			}
			// scala result of range expression, ToDo(): array result
			if (this.Object.isReference(value)){
				this.iterateWithFunc(value, function(cell, row, col) {
					if(cell.isBoolean())
						throw websheet.Constant.ERRORCODE["519"];// #VALUE
					var v = cell.getComputeValue();
					if(typeof v == "string"){
						v = this.NumberRecognizer.parse(v); // bOnlyParseNum=false, bParseBool=false
						if(!v.isNumber)
							throw websheet.Constant.ERRORCODE["519"];// #VALUE
						v = v.fValue;
					} if(typeof v != "number"){
						throw websheet.Constant.ERRORCODE["519"];// #VALUE
					}
					ret.push(Math.ceil(v));
					return true;
				});
			} else {
				value = [temp];
				var cellsLen = value.length;
				for(var i=0;i<cellsLen;i++){
					if(!value[i])
						continue;
					var v = value[i];
					if (this.Object.isToken(v))
						v = v.getValue();
					if(typeof v == "string"){
						v = this.NumberRecognizer.parse(v); // bOnlyParseNum=false, bParseBool=false
						if(!v.isNumber)
							throw websheet.Constant.ERRORCODE["519"];// #VALUE
						v = v.fValue;
					} if(typeof v != "number"){
						throw websheet.Constant.ERRORCODE["519"];// #VALUE
					}
					ret.push(Math.ceil(v));
				}
			}
		}

		return ret;
	}	
});
