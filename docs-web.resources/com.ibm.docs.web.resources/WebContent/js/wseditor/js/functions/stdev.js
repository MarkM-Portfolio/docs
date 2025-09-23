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

dojo.provide("websheet.functions.stdev");

dojo.declare("websheet.functions.stdev", websheet.functions._stdevBase, {
	
	constructor: function() 
	{
		this.minNumOfArgs = 1;
		this.maxNumOfArgs = 255;
	},
	
	calc: function(context) {
		return this._calcValue(context);
	},
	
	_calcSingleValue: function(alldata, context) 
	{
		if (!dojo.isArray(alldata))    // return error
			return alldata;
		
		if(context.calcCount<=1)
			throw websheet.Constant.ERRORCODE["532"];
		
		var average = this._average(alldata, context);
		var sumdev = this._sumdev(alldata,average);
		var div = websheet.Math.div(sumdev,context.calcCount-1);
		if(!this.bVAR)
			return Math.sqrt(div);
		else
			return div;
	},
	
	_calcCount:function(retArray, item, bNumber, bBool,bFormula, num){
		if(bNumber){
			if(num > 1)
			{
				// for range expression default value, such as A:A+1, the default value is 1
				retArray.defaultValue = item;
				retArray.defaultNum = num;
				retArray.calcCount += num;
			}else{
				retArray.push(item);
				retArray.calcCount++;
			}
			
		}
	}
});