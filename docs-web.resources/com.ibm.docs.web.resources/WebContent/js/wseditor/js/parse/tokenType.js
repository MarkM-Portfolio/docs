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

dojo.provide("websheet.parse.tokenType");
/**
 * Pls note that any type added or changed need to update the Mobile Native token generation.
 */
websheet.parse.tokenType = {
		//token type 
		NONE_TOKEN     		: 0,				//none token
		FUNCTION_TOKEN 		: 1,				//function token
		OPERATOR_TOKEN 		: 2,				//operator token
		ARRAY_TOKEN  : 3,						//{} token, useless
		RANGEREF_TOKEN 		: 4,				//E.g:A1:B1 token
		SINGLEQUOT_STRING	: 6,				//string token like 'abc', useless
		DOUBLEQUOT_STRING	: 7,				//string token like "abc"
		NUMBER_TOKEN   		: 8,				//number token (has decimal)
		BRACKET_TOKEN 		: 11,				//() token
		FUNCTIONPARMAS_TOKEN: 12,				// useless
		NEGATIVE_TOKEN		: 13,
		NAME				: 14,
		BOOLEAN_TOKEN		: 15,
		ARRAYFORMULA_TOKEN	: 16,				// {} in formula like =sum({})   
		PERCENT_TOKEN   	: 17,                //percent token(with %)
		POSITIVE_TOKEN		: 18,				//'+' before the other token
		ERROR_TOKEN			: 19				// error defined in Constant.js, such as #VALUE!, #N/A
};