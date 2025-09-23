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

dojo.provide("concord.chart.view.ChartLibAdapter");
dojo.require("concord.chart.config.DefaultSettings");
dojo.requireLocalization("concord.chart.view","ChartLibAdapter");

dojo.declare("concord.chart.view.ChartLibAdapter",null,{
	
	_parentDiv: null,
	_diagram: null,
	SERIES: null,
	_cachedWidth: null,
	_cachedHeight: null,
	_defaultSettings: concord.chart.config.DefaultSettings,
	
	constructor: function(diagram, div)
	{
		var nls = this.nls = dojo.i18n.getLocalization("concord.chart.view","ChartLibAdapter");
		if(nls!=null)
			this.SERIES = nls.SERIES;
		else
			this.SERIES = "Series${0}";
		
		this._parentDiv = div;
		this._diagram = diagram;
		
		var totalW = parseFloat(div.style.width);
		var totalH = parseFloat(div.style.height);
		
		this._cachedWidth = totalW;
		this._cachedHeight = totalH;
		
		dojo.style(div, "overflow", "hidden");
	    this._createChart();
	    
	},
	
	////////// PUBLIC FUNCTIONS ////////////////
	////////////////////////////////////////////
	
	/*void*/attachHighlighter: function(highlighter)//not in use. 
	{
		// To be overrided
	},
	
	/*void*/render: function()
	{
		// To be overrided
	},
	
	/*boolean*/isDirty: function()
	{
		// to be overrided
	},
	
	destroy: function()
	{
		// To be overrided
	},
	
	resize: function(width, height)
	{
		return false;
	},
	
	toSvg: function()
	{
		return null;
	},
	
	getAllSeriesState: function()
	{
		return null;
	},
	
	getFallbackType: function(chartType)
	{
		return this._defaultSettings.supportedTypes[chartType];
	},
	
	// Interface for set view of chart.
	set: function(properties)
	{
		var seriesList = properties.series;
		for(var id in seriesList)
		{
			var pro = seriesList[id];
			this._setSeries(id, pro);
		}
		if("spPr" in properties)
			this._setChartArea(properties.spPr);
		
		if("txPr" in properties)
			this._setChartTextPro(properties.txPr);
		
		if("title" in properties)
			this._setTitle(properties.title);
		
		if("plotArea" in properties)
			this._setPlotArea(properties.plotArea);
		
		if("legend" in properties)
			this._setLegend(properties.legend);
		
		var axisList = properties.axis;
		for(var id in axisList)
		{
			var pro = axisList[id];
			this._setAxis(id, pro);
		}
		if ("bidi" in properties)
			this._setBidi (properties.bidi);
	},

	/*boolean*/_isDataChanged: function(){
		var plotArea = this._diagram.plotArea;
	    var plots = plotArea.plots;
	    var axises = plotArea.axisList;
	    
	    var noCat = plots.length == 1 && plots[0].type == "scatter";
	    if(!noCat){
	    	 for(var i=0;i<axises.length;i++)
	 	    {
	 	    	var axis = axises[i];
	 	    	if(axis.tickLblPos !="none" && axis.isCateDirty())
	 	    		return true;
	 	    }
	    }
	    
	    for(var i=0;i<plots.length;i++)
	    {
	    	var plot = plots[i];
	    	var type = this.getFallbackType(plot.type);
	    	var seriesList = plot.seriesList;
	    	for(var j=0;j<seriesList.length;j++)
	    	{
	    		var serId = seriesList[j];
	    		var series = this._diagram.allSeries[serId];
	    		if(series.isNameDirty() || series.isDataDirty())
	    			return true;
	    		if(type=="pie")
	    			break;
	    	}
	    }
	    
	    return false;
	},
	
	/*boolean*/updateData: function()
	{
		var plotArea = this._diagram.plotArea;
	    var plots = plotArea.plots;
	    var axises = plotArea.axisList;
	    
	    var numFmtAxes = {};
	    var isCateChange = false;
	   
	    var noCat = plots.length == 1 && plots[0].type == "scatter";
		
	    for(var i=0;i<axises.length;i++)
	    {
	    	var axis = axises[i];
	    	if(axis.sourceLinked==1)
	    		numFmtAxes[axis.id] = axis;
	    	//if the axis doesn't show the labels, update category is not needed
	    	if(axis.tickLblPos=="none")
	    		continue;
	    	
	    	if(noCat)
				continue;
	    	
	    	if(axis.isCateDirty())
	    	{
	    		var data = null;
	    		var cateSeq = axis.categorySeq;
		    	if(cateSeq!=null)
		    		data = cateSeq.getData();
	    		this._updateCategories(axis.id, data);
	    		isCateChange = true;
	    		axis.changes = 0;
	    	}
	    }
	    var dataChanged = false;
	    for(var i=0;i<plots.length;i++)
	    {
	    	var plot = plots[i];
	    	var type = this.getFallbackType(plot.type);
	    	var seriesList = plot.seriesList;
	    	var hasSetNumFmt = false;
	    	for(var j=0;j<seriesList.length;j++)
	    	{
	    		var serId = seriesList[j];
	    		var series = this._diagram.allSeries[serId];
	    		var change = this._updateSeriesData(series,isCateChange);
	    		series.changes = 0;
	    		dataChanged = dataChanged || change;
	    		if(!series.hide && !hasSetNumFmt)
	    		{
	    			this._setNumberFormat(plot, series, numFmtAxes);
	    			hasSetNumFmt = true;
	    		}
	    		if(type=="pie")
	    			break;
	    	}
	    }
	    
	    return isCateChange || dataChanged;
	},
	
	//json font to css font
	_mapFont: function(textPro)
	{
		var font = {};
		if(textPro.i == 1 )
			font.style =  "italic";
		else if(textPro.i == 0 )
			font.style =  "normal";
		if(textPro.b == 1)
			font.weight = "bold";
		else if(textPro.b == 0)
			font.weight = "normal";
		if(textPro.sz!=null)
			font.size = textPro.sz+"pt";
		
		var fontName = textPro.latin;
		if(textPro.asian)
			fontName =  fontName? fontName + "," + textPro.asian : textPro.asian;
		if(textPro.ctl)
			fontName =  fontName? fontName + "," + textPro.ctl : textPro.ctl;
		if(fontName)
			font.family = fontName;
		
		return font;
	},
	
	_createChart: function()
	{
		this._createLibInstance();
		
		var isBarChart = false;
	    var plotArea = this._diagram.plotArea;
	    var plots = plotArea.plots;
	    var axises = plotArea.axisList;

	    var needGrid = false;
	    
	    var numFmtAxes = {};
	    for(var i=0;i<axises.length;i++)
	    {
	    	var axis = axises[i];
	    	if(axis.sourceLinked==1)
	    		numFmtAxes[axis.id] = axis;
	    }
	    
	    var serIdx = 1;
	    for(var i=0;i<plots.length;i++)
	    {
	    	//prepare plot
	    	var plot = plots[i];
	    	
	    	var seriesList = plot.seriesList;
	    	//no series, no axis and plot is needed
	    	if(seriesList.length==0)
	    		continue;
	    	
	    	this._addPlot(plot);
	    	var type = this.getFallbackType(plot.type);
	    	var hasSetNumFmt = false;
	    	for(var j=0;j<seriesList.length;j++)
	    	{
	    		var serId = seriesList[j];
	    		var series = this._diagram.allSeries[serId];
	    		
	    		this._addSeries(serId, series, plot.name);
	    		
	    		series.index = serIdx;
	    		//set legend
	    		var seriesName = null;
	    		var labelData = series.getDataSequence("label");
	    		if(labelData!=null)
	    			seriesName = labelData.getData();
	    		else
	    			seriesName = this.SERIES.replace(/\$\{0\}/,serIdx);
	    		serIdx++;
	    		this._setSeriesLabel(serId, seriesName);
	    		if(!series.hide && !hasSetNumFmt)
	    		{
	    			this._setNumberFormat(plot, series, numFmtAxes);
	    			hasSetNumFmt = true;
	    		}
	    		
	    		//pie chart only has one series
	    		if(type=="pie")
	    			break;
	    	}
	    	if(type!="pie")//can't add grid if there is pie only. For pie and other chart types, it has grid.
	    	{
	    		needGrid = true;
	    	}
	    }
    	
	    for(var i=0;i<axises.length;i++)
	    {
	    	this._addAxis(axises[i]);
	    }
	    if(needGrid)
	    	this._addGrid();
	},
	///////////// FUNCTIONS TO BE OVERRIDED BY EACH CHART LIBRARY INSTANCE/////
	///////////////////////////////////////////////////////////////////////////
	
	_createLibInstance: function()
	{
	},
	
	_setTitle: function(settings)
	{
	},
	
	_setChartArea: function(spPr)
	{
		
	},
	
	_setChartTextPro: function(txPr)
	{
		
	},
	
	_setPlotArea: function(settings)
	{
		
	},
	
	_setLegend: function(settings)
	{
		
	},
	
	_setBidi: function(settings)
	{
	},
	
	_addAxis: function(axis)
	{
	},
	
	_setAxis: function(axId, settings)
	{
	},
	
	_addPlot: function(plot)
	{
	},
	
	_addGrid: function(isBarChart,settings)
	{
		
	},
	
	_setSeriesLabel: function(serId, labelData)
	{
	},
	
	_addSeries: function(serId,data,seriesSettings)
	{
	},
	
	_setSeries: function(serId,settings)
	{
	},
	
	_setNumberFormat: function(plot, series, numFmtAxes)
	{
		var xVal = series.getDataSequence("xVal");
		var yVal = series.getDataSequence("yVal");
		
		var type = this.getFallbackType(plot.type);
		var isBar = (type=="bar" && plot.barDir=="bar");
		for(var n=0;n<plot.axisIds.length;n++)
    	{
    		var id = plot.axisIds[n];
    		var axis = numFmtAxes[id];
    		if(axis==null)
    			continue;
    		if(axis.position=="t" || axis.position=="b")
    		{
    			if(isBar)
    			{
    				if(yVal!=null)
        				axis.format = yVal.getNumberFormat();
    			}
    			else
    			{
    				if(xVal!=null)
        				axis.format = xVal.getNumberFormat();
    			}
    		}
    		else if(axis.position=="l" || axis.position=="r")
    		{
    			if(!isBar && yVal!=null)
        			axis.format = yVal.getNumberFormat();
    		}
    	}
	},
	
	_updateSeriesData: function(series,isCateChange)
	{
	},
	
	_updateCategories: function(axisId, data)
	{
		
	}
});