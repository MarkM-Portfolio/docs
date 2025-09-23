/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

dojo.provide("concord.chart.model.PlotArea");
dojo.require("concord.chart.model.ModelFactory");
dojo.require("concord.chart.model.Plot");
dojo.require("concord.chart.model.Axis");
dojo.require("concord.chart.config.DefaultSettings");
dojo.require("concord.chart.utils.Utils");

dojo.declare("concord.chart.model.PlotArea", null,{
	
	_chart: null,  //Diagram
	axisList: null,
	plots:null,
	
	textPro: null,
	graphPro: null,
	
	_factory : concord.chart.model.ModelFactory,
	_defaultSettings : concord.chart.config.DefaultSettings,
	utils : concord.chart.utils.Utils,
	
	constructor:function(chart)
	{
		this._chart = chart;
		this.axisList = [];
		this.plots = [];
	},
	
	createDefaultAxis: function()
	{
		//Create primary X axis
		var xAxis = new concord.chart.model.Axis(this._chart);
		xAxis.id = "x0";
		xAxis.position = "b";
		this.axisList.push(xAxis);
		
		//Create the primary Y axis
		var yAxis = new concord.chart.model.Axis(this._chart);
		yAxis.id = "y0";
		yAxis.position = "l";
		this.axisList.push(yAxis);
	},
	
	createPlot: function(chartSetting)
	{
		var plot = new concord.chart.model.Plot(this._chart);
		
		var	detailSetting = this._defaultSettings.getDefaultSetting(chartSetting.type);
		dojo.mixin(plot, detailSetting,chartSetting);
		delete plot.line;
		delete plot.marker;
		
		plot.name = "plot" + this.plots.length;
		this.plots.push(plot);
		
		return plot;
	},
	
	createPlotByDataSource: function(chartSetting, dataSrc, /*Map<String,Object>*/ args)
	{
		var plot = this.createPlot(chartSetting);
		
		var interpreter = this._factory.getDataInterpreter(chartSetting.type);
		var data = interpreter.generateSeries(dataSrc, args,this._chart._dataProvider);
		seriesList = data.seriesList;
		
		if(seriesList.length==0 || seriesList.length>255)
			return false;
		
		for(var i=0;i<seriesList.length;i++)
		{
			var series = seriesList[i];
			if(chartSetting.type=="line" || chartSetting.type=="scatter")
			{
				series.marker = chartSetting.marker;
				if(!chartSetting.line)
					series.graphPro = {ln:{noFill:1}};
			}
			series.seriesId = "ser" + i;
			series.setParent(plot);
			this._chart.allSeries[series.seriesId] = series;
			plot.addDataSeries(series.seriesId); 
		}
		
		plot.axisIds[0] = "x0";
		plot.axisIds[1] = "y0";
		
		this.createDefaultAxis();
		var isBarChart = chartSetting.type=="bar" && chartSetting.barDir =="bar";
		//set default grid line
		if(isBarChart)
		{
			this.axisList[0].type = "valAx";
			this.axisList[0].majorGrid = {};
			this.axisList[1].type = "catAx";
		}
		else
		{
			if(chartSetting.type=="scatter")
				this.axisList[0].type = "valAx";
			else
				this.axisList[0].type = "catAx";
			this.axisList[1].majorGrid = {};
			this.axisList[1].type = "valAx";
		}
		
		if(data.category!=null)
		{
			if(isBarChart)
				this.axisList[1].setCategorySeq(data.category);
			else
				this.axisList[0].setCategorySeq(data.category);
		}
		return true;
	},
	
	getUnsupportedType: function()
	{
		for(var i=0;i<this.plots.length;i++)
		{
			var plot = this.plots[i];
			if(!this._defaultSettings.supportedTypes[plot.type])
				return plot.type;
		}
		return null;
	},
	
	toJson: function(noData, noFallBack)
	{
		var json = {};
		json.plots = [];
		for(var i=0;i<this.plots.length;i++)
		{
			json.plots.push(this.plots[i].toJson(noData, noFallBack));
		}
		json.axis = [];
		for(var i=0;i<this.axisList.length;i++)
		{
			var axis = this.axisList[i];
			json.axis.push(axis.toJson(noData));
		}
		
		if(this.textPro!=null)
			json.txPr = dojo.clone(this.textPro);
		if(this.graphPro!=null)
			json.spPr = dojo.clone(this.graphPro);
		return json;
	},
	
	loadFromJson: function(content,dataProvider)
	{
		if(content.dataSource)
			dataProvider.setDataSource(content.dataSource);
		
		this.textPro = content.txPr;
		this.graphPro = content.spPr;

		var axisMap = {}; //missing axis type
		for(var i=0;i<content.axis.length;i++)
		{
			var axis = new concord.chart.model.Axis(this._chart);
			axis.loadFromJson(content.axis[i]);
			if(!axis.type) //load from odf, can't set this property
			{
				axisMap[axis.id] = axis;
			}
			this.axisList.push(axis);
		}
		
		var catSeq = null;
		var plotsJson = content.plots;
		
		for(var i=0;i<plotsJson.length;i++)
		{
			var plot = new concord.chart.model.Plot(this._chart);
			plot.name = "plot" + i;
			plot.loadFromJson(plotsJson[i],dataProvider);
			this.plots.push(plot);
			
			//set missing axis type
			var isBar = plot.type=="bar" && plot.barDir=="bar";
			for(var j=0;j<plot.axisIds.length;j++)
			{
				var id = plot.axisIds[j];
				var axis = axisMap[id];
				if(axis)
				{
					var axType = null;
					if(plot.type=="scatter")
						axType = "valAx";
					else
					{
						if(axis.position=="l" || axis.position=="r")
							axType = isBar ? "catAx" : "valAx";
						else
							axType = isBar ? "valAx" : "catAx";
					}
					if(axType=="valAx")
						axis.type = "valAx";
					else if(!axis.type)
						axis.type = axType;
				}
			}
		}
	},
	
	set: function(settings)
	{
		if("spPr" in settings)
		{
			var spPr = settings["spPr"];
			if(spPr==null)
			{
				this.graphPro = null;
			}
			else
			{
				if(this.graphPro==null)
					this.graphPro = spPr;
				else
					this.utils.mergeSpPr(this.graphPro,spPr);
			}
		}
	},
	
	getReverseSettings: function(settings)
	{
		var undoPro = {};
		if("spPr" in settings)
		{
			if(this.graphPro==null)
				undoPro.spPr = null;
			else
				undoPro.spPr = this.utils.reverseSpPr(settings.spPr,this.graphPro)
		}
		return undoPro;
	}
});