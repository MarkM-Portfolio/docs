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

dojo.provide("websheet.functions.countif");

dojo.declare("websheet.functions.countif", websheet.functions._countif, {
	
	constructor: function() 
	{
		this.minNumOfArgs = 2;
		this.maxNumOfArgs = 2;
		this.privateAcc = false;
	},
	
	/*string or function*/calc: function(context) 
	{
		context._count = 0;
		this.exec(context);
		if(context.result)
			return context.result;
		else
			return context._count;
	},
	
	processRes: function(cell, context, pos)
	{
		var num = 1;
		if(pos && pos.rowSize != undefined && pos.colSize != undefined)
			num = pos.rowSize * pos.colSize;
		context._count += num;
	}
});