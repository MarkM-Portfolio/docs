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

dojo.provide("websheet.functions.or");

dojo.declare("websheet.functions.or", websheet.functions.and, {
	
	constructor: function() {
		this.maxNumOfArgs = 32;
	},
	
	getResult:function(v1, v2)
	{
		if(v1 == undefined)
			return v2;
		else
			return v1 || v2;
	}
});