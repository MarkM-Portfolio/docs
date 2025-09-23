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
 * AVERAGEA
 Summary: Average the set of numbers, including logical values inside a range
 Syntax: AVERAGEA( { Any N }+ )
 Returns: Number
 Constraints: At least one value included. Returns an error if no value provided.
 Semantics: Computes SUMA(List) / COUNTA(List). Behaves similarly to the AVERAGE function, 
 * with the exception of logical values inside a range, where True is always treated as 1, 
 * and False is treated as 0. Empty cells are not included. Cells containing text values are treated 
 * as if they contained number 0. Any N may be of type ReferenceList.
 */
dojo.provide("websheet.functions.averagea");
dojo.require("websheet.functions.average");
dojo.declare("websheet.functions.averagea",websheet.functions.average, {
	//include number, string, boolean
	//do not count empty string(no matter it is empty cell or the formula cell return empty string)
	isA : true,
	actionWhenErr:function(obj,value, bNumber, bBoolean){ // the value is number.
	if(!bNumber && !bBoolean){
		if(!value){ // value is not equal to empty string
			obj.errMsg = websheet.Constant.ERRORCODE["532"];
			obj.errCount += 1;
		}else{
			obj.calculateCount += 1;
		}
		return true;
	}
	return false;
	}
});