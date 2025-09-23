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
 *  Summary: Rounds the value X up to the nearest multiple of the power of 10 specified by Digits
 Syntax: ROUNDUP( Number X [ ; Number Digits = 0 ] )
 Returns: Number
 Constraints: None
 Semantics: Round X up, to the precision specified by Digits. The number returned is the smallest number that is not less than X and is a multiple of 10Digits. If Digits is zero, or absent, round to the smallest decimal integer larger or equal to X. If Digits is positive, round to the specified number of decimal places. If Digits is negative, round to the left of the decimal point by -Digits places.
 */
dojo.provide("websheet.functions.roundup");
dojo.require("websheet.functions.FormulaBase");
dojo.declare("websheet.functions.roundup",websheet.functions.FormulaBase,{
	constructor:function(){
		this.minNumOfArgs = 2;  // Excel need two arguments for function ROUND, ROUNDUP, ROUNDDOWN
		this.maxNumOfArgs = 2;
		this.inherited(arguments);
	},
	/*number*/calc:function(){
		var digit=0,num;
		var values = this.args;
		if(values.length==this.maxNumOfArgs){
			digit=values[1];
			type=digit.getType();
			if(type == this.tokenType.SINGLEQUOT_STRING )
				throw websheet.Constant.ERRORCODE["525"];
			digit=this.fetchScalaResult(digit,true);
			digit=this.parseNumber(digit,this.LOCALE_NUM);
			digit=parseInt(digit); // floor the digit
		}
		
		num=values[0];
		type=num.getType();
		if(type == this.tokenType.SINGLEQUOT_STRING)
			throw websheet.Constant.ERRORCODE["525"];
		
		num=this.fetchScalaResult(num,true);
		var num_1=this.parseNumber(num,this.LOCALE_NUM);
		return this.roundUp(num_1,digit);
	},
	
	/*
	 * must assue the parameters are number type.
	 */
	roundUp:function(value,digit){
		var _value=Math.abs(value);
		_value=_value*Math.pow(10,digit);
		_value=Math.ceil(_value);
		_value=_value*Math.pow(10,-digit);
		return value>=0?_value:-_value;
	}
});