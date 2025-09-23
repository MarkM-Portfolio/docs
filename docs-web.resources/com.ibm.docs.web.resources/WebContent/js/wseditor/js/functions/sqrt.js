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
SQRT
 Summary: Return the square root of a number
 Syntax: SQRT( Number N )
 Returns: Number
 Constraints: N>=0 
 Semantics: Returns the square root of a non-negative number. This function must produce an error if given a negative number; for producing complex numbers, see IMSQRT.
 */
dojo.provide("websheet.functions.sqrt");
dojo.require("websheet.functions.FormulaBase");
dojo.declare("websheet.functions.sqrt",websheet.functions.FormulaBase,{
	constructor:function(){
		this.maxNumOfArgs = 1;
		this.inherited(arguments);
	},
	/*number*/calc:function(){
		var value = this.getNumValue(this.args[0]);
		if(value < 0)
			throw websheet.Constant.ERRORCODE["502"];
		
		return Math.sqrt(value);
	}
});