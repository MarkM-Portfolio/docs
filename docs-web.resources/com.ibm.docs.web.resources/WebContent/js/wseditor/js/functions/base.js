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
 * Summary: Converts a number into a text representation with the given base.
 */
dojo.provide("websheet.functions.base");
dojo.require("websheet.functions.FormulaBase");
dojo.declare("websheet.functions.base", websheet.functions.FormulaBase, {
	constructor:function(){
		this.maxNumOfArgs = 3;
		this.minNumOfArgs = 2;
		this.inherited(arguments);
	},
	
	/*text*/calc:function(){
		var result;
		var values=this.args;
		var number,radix,len=0,type;
		
		radix=this.getNumValue(values[1]);
		radix=parseInt(radix); // 16.5 --> 16
		if(radix<2||radix>36)throw websheet.Constant.ERRORCODE["502"];
		
		number=this.getNumValue(values[0]);
		if(number<0)throw websheet.Constant.ERRORCODE["502"];
		number=parseInt(number);
		
		if(values[2]){
			len=this.getNumValue(values[2]);
			if(len<0)throw websheet.Constant.ERRORCODE["508"];
			len=parseInt(len);
		}
		result=number.toString(radix);
		result=result.toLocaleUpperCase();
		if(len>result.length)
			result=dojo.string.pad(result, len);
		return result;
	}
});