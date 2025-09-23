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

/**
 * ROUNDDOWN
 Summary: Rounds the value X down to the nearest multiple of the power of 10 specified by Digits
 Syntax: ROUNDDOWN( Number X [ ; Number Digits = 0 ] )
 Returns: Number
 Constraints: None
 Semantics: Round X down, to the precision specified by Digits. The number returned is the largest number that does not exceed X and is a multiple of 10−Digits. If Digits is zero, or absent, round to the nearest decimal integer. If Digits is positive, round to the specified number of decimal places. If Digits is negative, round to the left of the decimal point by -Digits places.
 */
dojo.provide("websheet.functions.rounddown");
dojo.require("websheet.functions.FormulaBase");
dojo.declare("websheet.functions.rounddown",websheet.functions.FormulaBase,{
	constructor:function(){
		this.minNumOfArgs = 2;  // Excel need two arguments for function ROUND, ROUNDUP, ROUNDDOWN
		this.maxNumOfArgs = 2;
		this.inherited(arguments);
	},
	
	/*number*/calc:function(){
		var digit=0,num,type;
		var values = this.args;
		if(values.length==this.maxNumOfArgs){
			digit=values[1];
			type=digit.getType();
			if(type == this.tokenType.SINGLEQUOT_STRING)
				throw websheet.Constant.ERRORCODE["525"];
			digit=this.fetchScalaResult(digit,true);
			digit=this.parseNumber(digit,this.LOCALE_NUM);
			digit=parseInt(digit); 
		}
		
		num=values[0];
		type=num.getType();
		if(type == this.tokenType.SINGLEQUOT_STRING)
			throw websheet.Constant.ERRORCODE["525"];
		num=this.fetchScalaResult(num,true); 
		var num_1=this.parseNumber(num,this.LOCALE_NUM);  // case 1,234.55,"2000/01/01","1000/01/01" will recognize as a negative number
		return this.roundDown(num_1,digit);
	},
	
	roundDown:function(value,digit){
		var _value=Math.abs(value);
		_value=_value*Math.pow(10,digit);
		_value=Math.floor(_value);
		_value=_value*Math.pow(10,-digit);
		return value>=0?_value:-_value;
	}
});