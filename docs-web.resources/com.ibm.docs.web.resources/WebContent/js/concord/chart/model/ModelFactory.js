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

dojo.provide("concord.chart.model.ModelFactory");
dojo.require("concord.chart.model.Plot");
dojo.require("concord.chart.data.DataInterpreter");

concord.chart.model.ModelFactory = new function()
{
	this.dataInterpreters = {};
	
	this.getDataInterpreter = function(chartType)
	{
		var interpreter = this.dataInterpreters[chartType];
		if(interpreter!=null)
			return interpreter;
		
		if(chartType=="scatter")
			interpreter = new concord.chart.data.ScatterDataInterpreter("scatter");
		else
			interpreter = new concord.chart.data.DataInterpreter(chartType);
		this.dataInterpreters[chartType] = interpreter;
		
		return interpreter;
	};
	
}();