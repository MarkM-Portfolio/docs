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

dojo.provide("websheet.functions.combin");

dojo.declare("websheet.functions.combin", websheet.functions.FormulaBase, {
	
	_MAX: 10000000000, //10^10 is the max number
	constructor: function() {
		this.minNumOfArgs = 2;
		this.maxNumOfArgs = 2;
		
		this.inherited(arguments);
	},
	// = n!/k!(n-k)!
	/*int*/calc: function() {
		var values = this.args;
		//if(values[0].getType()==this.tokenType.NONE_TOKEN||values[1].getType()==this.tokenType.NONE_TOKEN)
		//	throw websheet.Constant.ERRORCODE["504"];
		var number = this.getNumValue(values[0]);
		var number_chosen = this.getNumValue(values[1]);
		if(number < 0 || number_chosen < 0 || number < number_chosen || number >= this._MAX)
			throw websheet.Constant.ERRORCODE["504"];
		number = Math.floor(number);
		number_chosen = Math.floor(number_chosen);
		
		var value1=1,value2=1;value3=1,tempNum=number-number_chosen;
		var minNum = tempNum > number_chosen ? number_chosen:tempNum;
		var maxNum = tempNum > number_chosen ? tempNum:number_chosen;
		//1000!/2!998!
		var i = 0;
		while(number > maxNum) //1000*999
			value1 = value1 * number--;
		if(value1 == Number.POSITIVE_INFINITY)
			throw websheet.Constant.ERRORCODE["504"];
		while(minNum > 0)//2!
			value2 = value2 * minNum--;
		var result = value1/value2;
		if(isNaN(result))
			throw websheet.Constant.ERRORCODE["504"];
		//the following performance is slow
//		while(number > 1)
//			value1 = websheet.Math.mul( value1 , number-- );
//		while(number_chosen > 1)
//			value2 = websheet.Math.mul( value2 , number_chosen-- );
//		while(tempNum > 1)
//			value3 = websheet.Math.mul( value3 , tempNum-- );
//		var result = websheet.Math.div(value1 , websheet.Math.mul( value2 , value3 ));
//		
//		if(result == Number.POSITIVE_INFINITY )
//			throw websheet.Constant.ERRORCODE["504"];
		return result;
	}
});