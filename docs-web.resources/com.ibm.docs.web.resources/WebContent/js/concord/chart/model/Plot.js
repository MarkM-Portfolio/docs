/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

dojo.provide("concord.chart.model.Plot");
dojo.require("concord.chart.model.DataSeries");
dojo.require("concord.chart.config.DefaultSettings");

dojo.declare("concord.chart.model.Plot", null,{
	
	seriesList: null,    //List<DataSeries>
	name: null,
	_chart: null,
	
	axisIds : null,
	type : null,
	grouping: null,
	gapWidth: null,
	barDir: null,
	firstSliceAng: null,
	style: null,
	smooth: false,
	marker: null,
	_defaultSettings: concord.chart.config.DefaultSettings,
	
	constructor: function(chart)
	{
		this._chart = chart;
		this.seriesList = [];
		this.axisIds = [];
	},
	
	getChartType: function()
	{
		return this.type;
	},
	
	addDataSeries: function(/*String*/seriesId)
	{
		this.seriesList.push(seriesId);
	},
	
	removeDataSeries: function(index)
	{
		this.seriesList.splice(index,1);
	},
	
	getCatAxis: function()
	{
		if(this.type=="scatter")
			return null;
		
		var axisList = this._chart.plotArea.axisList;
		var axisMap = {};
		for(var j=0;j<axisList.length;j++)
		{
			var axis = axisList[j];
			axisMap[axis.id] = axis;
		}
		
		var type = this._defaultSettings.supportedTypes[this.type];
		var isBar = (type=="bar" && this.barDir=="bar");
		
		var catAxis = null;
		for(var i=0;i<this.axisIds.length;i++)
		{
			var id = this.axisIds[i];
			var axis = axisMap[id];
			if(isBar)
			{
				if(axis.position=="l" || axis.position=="r")
					catAxis = axis;
			}
			else
			{
				if(axis.position=="t" || axis.position=="b")
					catAxis = axis;
			}
		}
		
		return catAxis;
	},
	
	toJson: function(noData, noFallBack)
	{
		var json = {};
		json.series = [];
		for(var i=0;i<this.seriesList.length;i++)
		{
			var id = this.seriesList[i];
			var series = this._chart.allSeries[id];
			json.series.push(series.toJson(noData));
		}
		json.axId = this.axisIds;
		if(noFallBack)
			json.type = this.type;
		else
			json.type = this._defaultSettings.supportedTypes[this.type];
		if(this.smooth)
			json.smooth = 1;
		if(this.barDir!=null)
			json.barDir = this.barDir;
		if(this.grouping!=null)
			json.grouping = this.grouping;
		if(this.gapWidth!=null)
			json.gapWidth = this.gapWidth;
		if(this.firstSliceAng!=null)
			json.firstSliceAng = this.firstSliceAng;
		if(this.style!=null)
			json.style = this.style;
		if(this.marker!=null)
			json.marker = this.marker;
		return json;
	},
	
	loadFromJson: function(content,dataProvider)
	{
		this.axisIds = content["axId"];
		this.type = content["type"];
		this.grouping = content["grouping"];
		this.gapWidth = content["gapWidth"];
		this.barDir = content["barDir"];
		this.firstSliceAng = content["firstSliceAng"];
		this.style = content["style"];
		this.smooth = content["smooth"];
		this.marker = content["marker"];
		
		var serListJson = content.series;
		
		for(var i=0;i<serListJson.length;i++)
		{
			var series = new concord.chart.model.DataSeries(this);
			series.loadFromJson(serListJson[i],dataProvider);
			//To support old version
			if("marker" in content && series.marker==null)
				series.marker = content.marker;
			this.seriesList.push(series.seriesId);
			this._chart.allSeries[series.seriesId] = series;
		}
	}
});