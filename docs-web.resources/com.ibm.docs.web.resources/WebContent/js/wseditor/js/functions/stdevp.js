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

dojo.provide("websheet.functions.stdevp");
dojo.require("websheet.functions.stdev");

dojo.declare("websheet.functions.stdevp", websheet.functions.stdev, {
	
	_calcSingleValue: function(alldata, context) 
	{
		if (!dojo.isArray(alldata))    // return error
			return alldata;
		
		if(context.calcCount<1)
			throw websheet.Constant.ERRORCODE["532"];
		
		var average = this._average(alldata, context);
		var sumdev = this._sumdev(alldata,average);
		
		var div = websheet.Math.div(sumdev,context.calcCount);
		if(!this.bVAR)
			return Math.sqrt(div);
		else
			return div;
	}
	
});