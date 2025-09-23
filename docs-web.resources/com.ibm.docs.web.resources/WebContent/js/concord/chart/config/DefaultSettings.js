/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

dojo.provide("concord.chart.config.DefaultSettings");

concord.chart.config.DefaultSettings = new function()
{
	this.chartSize = {width: 500, height: 300};
	
	this.supportedTypes = {"bar":"bar", "bar3D": "bar", 
			               "pie":"pie", "pie3D":"pie", "doughnut": "pie",
			               "area":"area", "area3D":"area",
			               "line":"line", "line3D":"line",
			               "scatter":"scatter"};
	
	this._chartTypeSettings =
    [
	   [{type: "bar", barDir: "col", grouping: "clustered"}, {type: "bar", barDir: "col", grouping: "stacked"}],
	   [{type: "bar", barDir: "bar", grouping: "clustered"}, {type: "bar", barDir: "bar", grouping: "stacked"}],
	   [{type: "pie"}],
	   [{type: "area", grouping: "standard"},{type: "area", grouping: "stacked"}],
	   [{type: "line",grouping: "standard",line:1, marker:0},{type: "line",grouping: "stacked",line:1, marker:0},
	    {type: "line",grouping: "standard",line:1, marker:1},{type: "line",grouping: "stacked",line:1, marker:1}],
	   [{type: "scatter",style: "lineMarker",line:0,marker:1},
	    {type: "scatter",style: "smoothMarker",line:1,marker:1},{type: "scatter",style: "smoothMarker", line:1, marker:0},
	    {type: "scatter",style: "lineMarker",line:1,marker:1}, {type: "scatter",style: "lineMarker",line:1,marker:0}]
 	];
	
	this._defaultSettings = 
	{
		bar:
		{
			gapWidth: 100
		},
		pie:
		{
		},
		area:
		{
			
		},
		line:
		{
			smooth: 0
		},
		scatter:
		{
		},
		dataLabel:
		{
			showLegendKey: 0,
			showVal: 0,
			showCatName: 0,
			showSerName: 0,
			showPercent: 0,
			showBubbleSize: 0,
			showLeaderLines: 0	
		},
		axis:
		{
			id: null,              //string
			scaling: null,         //map
			del: 0,                //number
			axPos: "left",         //string, "left", "right", "top", "bottom"     
			majorGridlines: null,  //map
			title: {
				layout:null, 
				overlay: null, 
				text:null
			},
			numFmt: null,
			majorTickMark: null,
			minorTickMark: null,
			textProperties: null,
			crossAx : 0,
			crosses: "autoZero",
			categories: null
		},
		common:
		{
			
		}
	};
	
	this.getChartTypeSetting = function(category, detail)
	{
		var settings = this._chartTypeSettings[category][detail];
		
		return dojo.mixin({},settings);
	};
	
	this.getDefaultSetting = function(chartType)
	{
		var settings = this._defaultSettings[chartType];
		
		return dojo.mixin({},settings);
	};
	
	this.chartLibrary = "dojo";
	this.dataPointsLimit = 10000;
};