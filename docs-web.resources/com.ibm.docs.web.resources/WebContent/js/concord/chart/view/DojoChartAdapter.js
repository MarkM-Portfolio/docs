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

dojo.provide("concord.chart.view.DojoChartAdapter");
dojo.require("concord.chart.lib.Chart2D");  
dojo.require("concord.chart.lib.action2d.Tooltip");
dojo.require("concord.chart.lib.themes.Concord");
dojo.require("concord.chart.lib.action2d.Highlight");
dojo.require("dojox.gfx.svg");
dojo.require("dojox.gfx.shape");
dojo.require("dojox.gfx.path");
dojo.require("dojox.gfx.utils");
dojo.require("concord.chart.view.ChartLibAdapter");
dojo.require("concord.util.BidiUtils");
dojo.require("concord.chart.utils.Utils");

dojo.declare("concord.chart.view.DojoChartAdapter",[concord.chart.view.ChartLibAdapter],{
	
	_chart: null,
	_defaultxAxis: {includeZero: false, natural: true,fixLower: "minor", fixUpper: "minor"},
	_defaultyAxis: {vertical: true, includeZero: true, natural: true,fixLower: "major", fixUpper: "major"},
	
	_chartTypeMap:
	{
		"bar,col,clustered" : "ClusteredColumns",
		"bar,col,stacked" : "StackedColumns",
		"bar,col,percentStacked" : "StackedColumns",
		"bar,bar,clustered" : "ClusteredBars",
		"bar,bar,stacked" : "StackedBars",
		"bar,bar,percentStacked" : "StackedBars",
		"pie" : "Pie",
		"area,standard" : "Areas",
		"area,stacked" : "StackedAreas",
		"area,percentStacked" : "StackedAreas",
		"line,standard": "Lines",
		"line,stacked": "StackedLines",
		"line,percentStacked": "StackedLines",
		"scatter,lineMarker": "MarkersOnly",
		"scatter,smoothMarker": "Markers",
		"scatter,straightMarker": "Markers"
	},
	
	//spPr to dojoSettings
	_mapSpPr: function(spPr)
	{
		var dojoSettings = {};
		for(var key in spPr)
		{
			var value = spPr[key];
			if(key=="noFill")
			{
				if(value==1)
					dojoSettings.fill = null;
			}
			else if(key=="solidFill")
			{
				if(spPr.noFill!=1)
					dojoSettings.fill = value;
			}
			else if(key=="gradFill")
			{
				if(spPr.noFill!=1)
				{
					var idx = value.indexOf("#");
					if(idx>0)
						dojoSettings.fill = value.substring(idx,idx+7);
				}
			}
			else if(key=="ln")
			{
				if(value==null)
				{
					dojoSettings.stroke = null;
				}
				else
				{
					if(value.noFill==1)
						dojoSettings.stroke = null;
					else
					{
						if(dojoSettings.stroke==null)
							dojoSettings.stroke = {};
						if("solidFill" in value)
							dojoSettings.stroke.color = value.solidFill;
						if("w" in value)
							dojoSettings.stroke.width = value.w;
					}
				}
			}
		}
		return dojoSettings;
	},
	
	_mapLegend: function(legend)
	{
		var dojoLegend = {};
    	if(legend.txPr!=null)
		{
    		dojoLegend.fontColor = legend.txPr.color;
    		dojoLegend.font = this._mapFont(legend.txPr);
		}
    	dojoLegend.legendPos = legend.legendPos;
    	//top-right will fall back to right
    	if(dojoLegend.legendPos==null || dojoLegend.legendPos=="tr")
    		dojoLegend.legendPos = "r";
    	
    	return dojoLegend;
	},
	
	_createLibInstance: function()
	{
		var title = this._diagram.title;
		var legend = this._diagram.legend;
		
		var settings = {};
		settings.accDesc = this._diagram.accDesc;		
		var plotPro = this._diagram.plotArea.graphPro;
		if(plotPro!=null)
			settings.plotarea = this._mapSpPr(plotPro);
		
		var txPr = this._diagram.textPro;
		if(txPr!=null)
		{
			settings.font = this._mapFont(txPr);
			settings.fontColor = txPr.color;
		}
		var spPr = this._diagram.graphPro;
		if(spPr!=null)
		{
			var dojopr = this._mapSpPr(spPr);
			settings.fill = dojopr.fill;
			settings.stroke = dojopr.stroke;
		}
	    
	    if(title!=null)
	    {
	    	settings.title = title.text;
	    	settings.titleGap  = 10;
	    	settings.titlePos  = "top";
	    	
	    	var textPro = title.textPro;
	    	if(textPro!=null)
			{
				settings.titleFont = this._mapFont(textPro);
				settings.titleFontColor = textPro.color;
			}
	    }
	    if (this._diagram.bidi){
	    	if (this._diagram.bidi.dir)
	    		settings.dir = this._diagram.bidi.dir;
	    	if (this._diagram.bidi.textDir)
	    		settings.textDir = this._diagram.bidi.textDir;
	    }	    
	    this._chart = new concord.chart.lib.Chart2D(this._parentDiv,settings);
	    if(legend!=null)
	    	this._chart.addLegend(this._mapLegend(legend));
	    
	    this._chart.setTheme(concord.chart.lib.themes.Concord);
	},
	
	_setTitle: function(settings)
	{
		if(settings==null)
		{
			this._chart.title = null;
			this._chart.titleFont = null;
			this._chart.titleFontColor = null;
		}
		else
		{
			if("text" in settings)
				this._chart.title = settings["text"];
			
			if("txPr" in settings)
			{
				var txPr = settings.txPr;
				if(!txPr)
				{
					this._chart.titleFont = null;
					this._chart.titleFontColor = null;
				}
				else
				{
					if(this._chart.titleFont==null)
						this._chart.titleFont = {};
					
					this._setFont(this._chart.titleFont, txPr);
					if("color" in txPr)
						this._chart.titleFontColor = txPr.color;
				}
			}
		}
		
		this._chart.dirty = true;
	},
	
	_setChartArea: function(spPr)
	{
		if(spPr==null)
		{
			this._chart.fill = null;
			this._chart.stroke = null;
			this._chart.setChartArea(null);
		}
		else
		{
			var dojoPro = this._mapSpPr(spPr);
			this._chart.setChartArea(dojoPro);
		}
	},
	
	_setChartTextPro: function(txPr)
	{
		if(txPr==null)
		{
			this._chart.font = null;
			this._chart.fontColor = null;
		}
		else
		{
			if(this._chart.font==null)
				this._chart.font = {};
			this._setFont(this._chart.font, txPr);
			if("color" in txPr)
				this._chart.fontColor = txPr.color;
			
			if("latin" in txPr)
			{
				if(this._chart.titleFont)
					delete this._chart.titleFont.family;
				
				if(this._chart.legend!=null && this._chart.legend.font)
					delete this._chart.legend.font.family;
				
				for(var id in this._chart.axes)
				{
					var axis = this._chart.axes[id];
					if(axis.opt.font)
						delete axis.opt.font.family;
					if(axis.opt.titleFont)
						delete axis.opt.titleFont.family;
				}
			}
		}
		
		this._chart.dirty = true;
	},
	
	_setPlotArea: function(settings)
	{
		if("spPr" in settings)
		{
			var spPr = settings.spPr;
			if(spPr==null)
			{
				this._chart.plotarea = {};
				this._chart.setPlotArea(null);
			}
			else
			{
				var dojoPro = this._mapSpPr(spPr);
				this._chart.setPlotArea(dojoPro);
			}
		}
	},
	
	_setLegend: function(settings)
	{
		if(!settings)
		{
			if(this._chart.legend!=null)
			{
				this._chart.legend = null;
				this._chart.dirty = true;
			}
		}
		else
		{
			this._chart.dirty = true;
			if(this._chart.legend==null)
				this._chart.addLegend(this._mapLegend(settings));
			else
			{
				if("legendPos" in settings)
					this._chart.legend.position = settings.legendPos;
				if("txPr" in settings)
				{
					var txPr = settings.txPr;
					if(txPr==null)
					{
						this._chart.legend.fontColor = null;
						this._chart.legend.font = null;
					}
					else
					{
						if("color" in txPr)
							this._chart.legend.fontColor = txPr.color;
						
						if(!this._chart.legend.font)
							this._chart.legend.font = {};
						this._setFont(this._chart.legend.font, txPr);
					}
				}
			}
		}
	},
	
	_setBidi: function(settings)
	{
		if(settings == null)
		{
			this._chart.setDir("ltr");
			this._chart.setTextDir("");
		}
		else
		{
			if("dir" in settings)
				this._chart.setDir(settings["dir"]);
			if("textDir" in settings)
				this._chart.setTextDir(settings["textDir"]);
		}
		this._chart.dirty = true;
	},
	
	_adjustAxisByPlot: function(axis, setting)
	{
		var plots = this._diagram.plotArea.plots;
		for(var i=0;i<plots.length;i++)
		{
			var plot = plots[i];
			if(plot.axisIds[0]==axis.id || plot.axisIds[1]==axis.id)
			{
				var type = this.getFallbackType(plot.type);
				if(type=="bar"&& plot.barDir=="bar")
				{
					if(axis.position=="l" || axis.position=="r")
						setting.natural = true;
				}
				else
				{
					if(axis.position=="b" || axis.position=="t")
					{
						if(type!="scatter")
							setting.natural = true;
					}
				}
				setting.labelFunc = dojo.hitch(axis,"formatting");
				//percentStacked is not supported, it will fall back to stacked, ignore tick step.
				if(plot.grouping=="percentStacked")
				{
					delete setting.majorTickStep;
					delete setting.minorTickStep;
					delete setting.max;
					delete setting.min;
					axis.percentStacked = true;
				}
			}
		}
	},
	
	_addAxis: function(axis)
	{
		var axisSetting = {fixLower: "major", fixUpper: "major", maxLabelCharCount: 26, titleGap: 8};
		if(axis.position=="l")
		{
			axisSetting.vertical = true;
			axisSetting.titleOrientation = "axis";
		}
		else if(axis.position=="r")
		{
			axisSetting.vertical = true;
			axisSetting.leftBottom = false;
			axisSetting.titleOrientation = "away";
		}
		else if(axis.position=="t")
		{
			axisSetting.leftBottom = false;
			axisSetting.titleOrientation = "axis";
		}
		else
			axisSetting.titleOrientation = "away";
		
		if(axis.max!=null)
			axisSetting.max = axis.max;
		if(axis.min!=null)
			axisSetting.min = axis.min;
		
		if(axis.textRotation!=0)
			axisSetting.rotation = -axis.textRotation;
		
		if(axis.invisible)
			axisSetting.type = "Invisible";
		
		if(axis.spPr!=null && axis.spPr.ln!=null)
		{
			axisSetting.stroke = {};
			var ln = axis.spPr.ln;
			if(ln.noFill==1)
				axisSetting.stroke = null;
			else
			{
				if(ln.solidFill!=null)
					axisSetting.stroke.color = ln.solidFill;
				if(ln.w!=null)
					axisSetting.stroke.width = ln.w;
			}
		}
		
		if(axis.textPro!=null)
		{
			axisSetting.fontColor = axis.textPro.color;
			axisSetting.font = this._mapFont(axis.textPro);
		}
		
		if(axis.title!=null)
		{
			axisSetting.title = axis.title.text;
			if(axis.title.textPro)
			{
				var color = axis.title.textPro.color;
				if(color!=null)
					axisSetting.titleFontColor = color;
				
				axisSetting.titleFont = this._mapFont(axis.title.textPro);
			}
		}
		
		if(axis.majorUnit!=null)
			axisSetting.majorTickStep = axis.majorUnit;
		if(axis.minorUnit!=null)
			axisSetting.minorTickStep = axis.minorUnit;
		
		var plots = this._diagram.plotArea.plots;
		//axisSetting.minorTicks = false;
		if(axis.tickLblPos=="none")
		{
			axisSetting.majorLabels = false;
			axisSetting.minorLabels = false;
		}
		else if(axis.categorySeq!=null && (plots.length > 1 || plots[0].type != "scatter"))
		{
			var dataArray = axis.categorySeq.getData();
			var item = dataArray[dataArray.length-1];
			var data = dojo.isArray(item)? item : dataArray;
			
			axisSetting.labels = [];
			axisSetting.labels.push({value:0,text:""});
	   	  	for(var t=0;t<data.length;t++)
	   	  	{
	   	  		axisSetting.labels.push({value:t+1,text:data[t]});
	   	  	}
	   	  	axisSetting.labels.push({value:data.length+1,text:""});
		}
		
		this._adjustAxisByPlot(axis, axisSetting);
			
		this._chart.addAxis(axis.id,axisSetting);
	},
	
	_setFont: function(dojoFont, txPr)
	{
		if(!dojoFont || !txPr)
			return;
		
		if("i" in txPr)
		{
			if(txPr.i!=null)
				dojoFont.style = txPr.i==1 ? "italic" : "normal";
			else
				delete dojoFont.style;
		}
		if("b" in txPr)
		{
			if(txPr.b!=null)
				dojoFont.weight = txPr.b==1 ? "bold" : "normal";
			else
				delete dojoFont.weight;
		}
		if("sz" in txPr)
		{
			this._chart.dirty = true;
			if(txPr.sz==null)
				delete dojoFont.size;
			else
				dojoFont.size = txPr.sz + "pt";
		}
		
		if("latin" in txPr || "asian" in txPr || "ctl" in txPr)
		{
			var fontName = txPr.latin;
			if(txPr.asian)
				fontName =  fontName? fontName + "," + txPr.asian : txPr.asian;
			if(txPr.ctl)
				fontName =  fontName? fontName + "," + txPr.ctl : txPr.ctl;
			
			if(fontName)
				dojoFont.family = fontName;
			else
				delete dojoFont.family;
		}
	},
	
	_setAxis: function(id, settings)
	{
		var dojoAxis = this._chart.getAxis(id);
		if(dojoAxis==null)
			return;
		
		dojoAxis.dirty = true;
		if("spPr" in settings)
		{
			var spPr = settings["spPr"];
			if(!spPr || !spPr.ln)
				delete dojoAxis.opt.stroke;
			else
			{
				var ln = spPr.ln;
				if(ln.noFill==1)
					dojoAxis.opt.stroke = null;
				else
				{
					var stroke = dojoAxis.opt.stroke;
					if(!stroke)
						stroke = dojoAxis.opt.stroke = {};
					if("solidFill" in ln)
						stroke.color = ln.solidFill;
					if("w" in ln)
						stroke.width = ln.w;
				}
			}
		}
		if("scaling" in settings)
		{
			var scaling = settings["scaling"];
			if(!scaling)
			{
				delete dojoAxis.opt.max;
				delete dojoAxis.opt.min;
			}
			else
			{
				if("min" in scaling)
				{
					if(scaling["min"]!=null)
						dojoAxis.opt.min = scaling["min"];
					else
						delete dojoAxis.opt.min;
				}
				if("max" in scaling)
				{
					if(scaling["max"]!=null)
						dojoAxis.opt.max = scaling["max"];
					else
						delete dojoAxis.opt.max;
				}
			}
			dojoAxis.scalerDirty = true;
			this._chart.dirty = true;
		}
		if("majorUnit" in settings)
		{
			var major = settings["majorUnit"];
			if(typeof major != "number")
				delete dojoAxis.opt.majorTickStep;
			else
				dojoAxis.opt.majorTickStep = major;
			dojoAxis.scalerDirty = true;
		}
		if("minorUnit" in settings)
		{
			var minor = settings["minorUnit"];
			if(typeof minor != "number")
				delete dojoAxis.opt.minorTickStep;
			else
				dojoAxis.opt.minorTickStep = minor;
			dojoAxis.scalerDirty = true;
		}
		if("title" in settings)
		{
			var titlePro = settings.title;
			if(titlePro==null)
			{
				delete dojoAxis.opt.title;
				delete dojoAxis.opt.titleFont;
				delete dojoAxis.opt.titleFontColor;
			}
			else
			{
				if("text" in titlePro)
					dojoAxis.opt.title = titlePro.text;
				if("txPr" in titlePro)
				{
					var txPr = titlePro.txPr;
					if(!txPr)
					{
						delete dojoAxis.opt.titleFont;
						delete dojoAxis.opt.titleFontColor;
					}
					else
					{
						var dojoAxisTitleFont = dojoAxis.opt.titleFont;
						if(dojoAxisTitleFont==null)
							dojoAxisTitleFont = dojoAxis.opt.titleFont = {};
						this._setFont(dojoAxisTitleFont, txPr);
						if("color" in txPr)
							dojoAxis.opt.titleFontColor = txPr.color;
					}
				}
			}
			this._chart.dirty = true;
		}
		if("txPr" in settings)
		{
			this._chart.dirty = true;
			var txPr = settings.txPr;
			if(txPr==null)
			{
				delete dojoAxis.opt.font;
				delete dojoAxis.opt.fontColor;
			}
			else
			{
				var dojoAxisFont = dojoAxis.opt.font;
				if(dojoAxisFont==null)
					dojoAxisFont = dojoAxis.opt.font = {};
				
				this._setFont(dojoAxisFont, txPr);
				if("color" in txPr)
					dojoAxis.opt.fontColor = txPr.color;
			}
		}
	},
	
	_addPlot: function(plot)
	{
		var settings = this._mappingPlotSettings(plot);
		this._chart.addPlot(plot.name,settings);
    	this._createActionEffect(plot.name);
	},
	
	_addGrid: function()
	{
		var plots = this._diagram.plotArea.plots;
		var plot = plots[0];
		
		var def = {type: "Grid", hMinorLines: false,hMajorLines:false,vMinorLines: false,vMajorLines: false};
		var type = this.getFallbackType(plot.type);
		if(type=="bar"&& plot.barDir=="bar")
	    {
			//def.vMinorLines = true;
			def.vMajorLines = true;
	    }
		else
		{
			//def.hMinorLines = true;
			def.hMajorLines = true;
		}
		def.hAxis = plot.axisIds[0];
		def.vAxis = plot.axisIds[1];
		this._chart.addPlot("grid", def);
	},
	
	_mappingPlotSettings: function(plot)
	{
		var dojoSettings = {};
		var type = this.getFallbackType(plot.type);
		if(type=="bar")
		{
			dojoSettings.type = this._chartTypeMap[type+","+plot.barDir+","+plot.grouping];
			var gap = plot.gapWidth;
			if(gap==null)
				gap = 100;
			dojoSettings.gap = gap;
			dojoSettings.grouping = plot.grouping;
		}
		else if(type=="pie")
		{
			dojoSettings.type = this._chartTypeMap[type];
			var sliceAng = plot.firstSliceAng;
			if(sliceAng==null)
				dojoSettings.startAngle = -90;	//dojo default ang is 90 and xls default ang is 0
			else
				dojoSettings.startAngle = (360 - sliceAng) % 360; //json keeps odf recognized ang. so need to adjust to dojo recognized ang. 
		}
		else if(type=="area")
		{
			dojoSettings.type = this._chartTypeMap[type+","+plot.grouping];
			dojoSettings.grouping = plot.grouping;
		}
		else if(type=="line")
		{
			dojoSettings.type = this._chartTypeMap[type+","+plot.grouping];
			if(plot.marker!=null)
				dojoSettings.markers = !!plot.marker;
			
			if(plot.smooth)
				dojoSettings.tension = "S";
			dojoSettings.grouping = plot.grouping;
			dojoSettings.interpolate = true;
		}
		else if(type=="scatter")
		{
			dojoSettings.type = "Lines";
			//Default value is true for scatter chart
			dojoSettings.markers = true;
			if(plot.style=="smoothMarker")
				dojoSettings.tension = "S";
		}
		
		var axisList = this._diagram.plotArea.axisList;
		for(var i=0;i<axisList.length;i++)
		{
			var axis = axisList[i];
			if(axis.id==plot.axisIds[0] || axis.id==plot.axisIds[1])
			{
				if(axis.position=="l" || axis.position=="r")
					dojoSettings.vAxis = axis.id;
				else
					dojoSettings.hAxis = axis.id;
			}
		}
		return dojoSettings;
	},
	
	_setSeriesLabel: function(serId, labelData)
	{
		var dojoSer = this._chart.series[this._chart.runs[serId]];
		if(dojoSer==null)
			return;
		
		if(dojo.isArray(labelData)){
			var arr = labelData.length > 50 ? labelData.slice(0,50) : labelData;
			labelData = arr.join(" ");
		}
		
		dojoSer.legend = labelData;
	},
	
	_getFill: function(spPr)
	{
		if(spPr.solidFill)
			return spPr.solidFill;
		else if(spPr.gradFill)
		{
			var idx = spPr.gradFill.indexOf("#");
			if(idx>0)
				return spPr.gradFill.substring(idx,idx+7);
		}
		return null;
	},
	
	_setSeries: function(serId,settings)
	{
		if(settings==null)
			return;
		
		var dojoSer = this._chart.series[this._chart.runs[serId]];
		if(dojoSer==null)
			return;
		
		var dojoPlot = this._chart.stack[this._chart.plots[dojoSer.plot]];
		if(dojoPlot && (dojoPlot.opt.grouping=="stacked" || dojoPlot.opt.grouping=="percentStacked"))
			dojoPlot.dirty = true;
		
		dojoSer.dirty = true;
		if("spPr" in settings)
		{
			var spPr = settings.spPr;
			if(spPr==null)
			{
				delete dojoSer.fill;
				delete dojoSer.stroke;
			}
			else
			{
				if(spPr.noFill==1)
					dojoSer.fill = null;
				else
				{
					if("solidFill" in spPr || "gradFill" in spPr)
				    {
						var fill = this._getFill(spPr);
						if(fill)
							dojoSer.fill = fill;
						else
							delete dojoSer.fill; 
				    }
				}
				
				if("ln" in spPr)
				{
					var ln = spPr.ln;
					if(ln==null)
						delete dojoSer.stroke;
					else
					{
						if(ln.noFill==1)
							dojoSer.stroke = null;
						else 
						{
							if(ln.w)
							{
								if(!dojoSer.stroke)
									dojoSer.stroke = {};
								dojoSer.stroke.width = ln.w;
							}
							
							if("solidFill" in ln || "gradFill" in ln)
							{
								var color = this._getFill(ln);
								if(color)
								{
									if(!dojoSer.stroke)
										dojoSer.stroke = {width:2};
									dojoSer.stroke.color = color;
								}
								else
									delete dojoSer.stroke;
							}
						}
					}
				}
			}
		}
		
		if("marker" in settings)
			dojoSer.markers = settings["marker"];
		
		if("smooth" in settings)
			dojoSer.smooth = settings["smooth"];
		
		if("dPt" in settings)
		{
			//the settings has been set into series
			var series = this._diagram.allSeries[serId];
			var data = this._mappingSeriesData(series);
			dojoSer.update(data);
		}
	},
	
	_addSeries: function(serId,series, plotName)
	{
		var dojoSettings = {hide:series.hide, plot:plotName};
		var chartType = this.getFallbackType(series.parent.type);
		var graphPro = series.graphPro;
		if(graphPro!=null)
		{
			var fillColor = null;
			if(graphPro.noFill==1)
				dojoSettings.fill = null;
			else if(chartType!="pie") //pie chart will not use the series graphic property
			{
				fillColor = this._getFill(graphPro);
				if(fillColor!=null)
					dojoSettings.fill = fillColor;
			}
			if(graphPro.ln!=null)
			{
				if(graphPro.ln.noFill==1)
					dojoSettings.stroke = null;
				else
				{
					dojoSettings.stroke = {};
					var strokeColor = this._getFill(graphPro.ln);
					var strokeWidth = graphPro.ln.w;
					if(strokeColor!=null)
						dojoSettings.stroke.color = strokeColor;
					if(strokeWidth!=null)
						dojoSettings.stroke.width = strokeWidth;
				}
			}
		}
		if(series.marker!=null)
			dojoSettings.markers = series.marker;
		if(series.smooth!=null)
			dojoSettings.smooth = series.smooth;
		
		var data = this._mappingSeriesData(series);
		this._chart.addSeries(serId, data, dojoSettings);
	},
	
	_mappingDataPoints: function(series,pt,i)
	{
		if(series.dataPoints!=null)
		{
			var ptpro = series.dataPoints[i];
			if(ptpro!=null)
			{
				var spPr = ptpro.spPr;
				if(spPr!=null)
				{
					if(spPr.noFill==1)
						pt.fill = null;
					else
					{
						var fill = this._getFill(spPr);
						if(fill!=null)
							pt.fill = fill;
					}
					var ln = spPr.ln;
					if(ln!=null)
					{
						if(ln.noFill==1)
							pt.stroke = null;
						else
						{
							pt.stroke = {};
							var color = this._getFill(ln);
							if(color)
								pt.stroke.color = color;
							if(ln.w!=null)
								pt.stroke.width = ln.w;
						}
					}
				}
			}
		}
	},
	
	_mappingScatterData: function(series)
	{
		var data = [];
		var xValueSeq = series.getDataSequence("xVal");
		var useNature = false;
		var xData = null;
		if(xValueSeq!=null)
		{
			xData = xValueSeq.getData();
			
			if(xData.length == 0){
				useNature = true;
				xData = null;
			}
			else{
				for(var i=0;i<xData.length;i++)
				{
					var dp = xData[i];
					if(dp!=null && typeof dp != "number" && dp!="#N/A")
					{
						useNature = true;
						break;
					}
				}
			}
		}
		else
			useNature = true;
		
		var valuesSeq = series.getDataSequence("yVal");
		var yData = valuesSeq.getData();
		
		for(var i=0;i<yData.length;i++)
		{
			//scatter will ignore "#N/A"
			if(yData[i]=="#N/A" || (xData!=null && xData[i]=="#N/A"))
				continue;
			
			if(yData[i]!=null && typeof yData[i] != "number")
				yData[i] = 0;
			
			var pt = {};
			pt.x = useNature ? i+1:xData[i];
			pt.y = yData[i];
			
			this._mappingDataPoints(series,pt,i);
			
			data.push(pt);
		}
		return data;
	},
	
	_mappingPieData: function(series)
	{
		var data = [];
		var valuesSeq = series.getDataSequence("yVal");
		var yData = valuesSeq.getData();
		
		var legendData = null;
		var plot = series.parent;
		var catAxis = plot.getCatAxis();
		if(catAxis!=null && catAxis.categorySeq!=null)
			legendData = catAxis.categorySeq.getData();
		
		if(series.dataPoints!=null || legendData!=null)
		{
			for(var i=0;i<yData.length;i++)
			{
				var pt = {};
				
				if(typeof yData[i]!="number")
					pt.y = 0;
				else
					pt.y = yData[i];
				
				this._mappingDataPoints(series,pt,i);
				
				if(legendData!=null)
				{
					var legend = "";
					if(dojo.isArray(legendData[0]))
					{
						for(var n=0;n<legendData.length;n++)
						{
							if(legendData[n][i] != null)
								legend += legendData[n][i];
							if(n<legendData.length-1)
								legend += " ";
						}
					}
					else
					{
						legend = legendData[i];
					}
					pt.legend = legend;
				}
				else
					pt.legend = i+1;
				
				data.push(pt);
			}
		}
		else
		{
			for(var i=0;i<yData.length;i++)
			{
				var v = yData[i];
				if(typeof v!="number")
					v = 0;
				data.push(v);
			}
		}
		
		return data;
	},
	
	_mappingLineData: function(series)
	{
		var data = [];
		var valuesSeq = series.getDataSequence("yVal");
		var yData = valuesSeq.getData();
		
		var grouping = series.parent.grouping;
		if(grouping=="stacked" || grouping=="percentStacked")
		{
			for(var i=0;i<yData.length;i++)
			{
				var v = yData[i];
				if(typeof v!="number")
					v = 0;
				data.push(v);
			}
			return data;
		}
		
		for(var i=0;i<yData.length;i++)
		{
			var pt = {};
			if(yData[i]==null)
			{
				data.push({x:i+1,y:null});
				continue;
			}
			else
			{
				//line chart will ignore "#N/A"
				if(yData[i]=="#N/A")
					continue;
				pt.x = i+1;
				if(typeof yData[i]!="number")
					pt.y = 0;
				else
					pt.y = yData[i];
			}
			
			this._mappingDataPoints(series,pt,i);
			
			data.push(pt);
		}
		return data;
	},
	
	_mappingDefaultData: function(series)
	{
		var data = [];
		
		var valuesSeq = series.getDataSequence("yVal");
		var yData = valuesSeq.getData();
		var type = this.getFallbackType(series.parent.type);
		
		if(type != "area" && series.dataPoints!=null)
		{
			for(var i=0;i<yData.length;i++)
			{
				var pt = {};
				if(typeof yData[i]!="number")
					pt.y = 0;
				else
					pt.y = yData[i];
				
				this._mappingDataPoints(series,pt,i);
				
				data.push(pt);
			}
		}
		else
		{
			for(var i=0;i<yData.length;i++)
			{
				var v = yData[i];
				if(typeof v!="number")
					v = 0;
				data.push(v);
			}
		}
		return data;
	},
	
	_mappingSeriesData: function(series)
	{
		var data = null;
		var chartType = this.getFallbackType(series.parent.type);
		if(chartType=="scatter")
		{
			data = this._mappingScatterData(series);
		}
		else if(chartType=="pie")
		{
			data = this._mappingPieData(series);
		}
		else if(chartType=="line")
		{
			data = this._mappingLineData(series);
		}
		else if(chartType=="stock")
		{
			
		}
		else if(chartType=="bubble")
		{
			
		}
		else if(chartType == "radar")
		{
			
		}
		else if(chartType == "ring")
		{
			
		}
		else//bar, area
		{
			data = this._mappingDefaultData(series);
		}
		
		return data || [];
	},
	
	_createActionEffect : function(plotName)
	{
		//new concord.chart.lib.action2d.MoveSlice(this._chart,plotName);
		new concord.chart.lib.action2d.Highlight(this._chart,plotName);	
		new concord.chart.lib.action2d.Tooltip(this._chart,plotName);
	},
	
	isDirty: function() {
		return this._chart.dirty || this._isDataChanged();
	},
	
	render: function()
	{
		var dataChanged = this.updateData();
		var div = this._parentDiv;
		var width = parseFloat(div.style.width);
		var height = parseFloat(div.style.height);
		
		var sizeChanged = Math.abs(width-this._cachedWidth)>2 || Math.abs(height-this._cachedHeight)>2;
		if(sizeChanged)
		{
			this._chart.resize();
			this._cachedWidth = width;
			this._cachedHeight = height;
		}
		else
		{
			this._chart.dirty = this._chart.dirty || dataChanged;
			//if(this._chart.dirty)
				this._chart.render(); 
		}
	},
	
	resize: function(width, height)
	{
		this._chart.resize();
		return true;
	},
	
	destroy: function()
	{
		this._chart.destroy();
	},
	
	_updateCategories: function(axisId, data)
	{
		var dojoAxis = this._chart.getAxis(axisId);
		if(dojoAxis==null)
			return;
   	  	
		if(data==null)
		{
			dojoAxis.opt.labels = null;
			dojoAxis.dirty = true;
			return;
		}
		//Multiple array is not supported. So if data is multiple array, only the last row is used
		var item = data[data.length-1];
		data = dojo.isArray(item)? item : data;
		
		dojoAxis.opt.labels = [];
		dojoAxis.opt.labels.push({value:0,text:""});
   	  	for(var t=0;t<data.length;t++)
   	  	{
   	  		dojoAxis.opt.labels.push({value:t+1,text:data[t]});
   	  	}
   	  	dojoAxis.opt.labels.push({value:data.length+1,text:""});
   	  	
   	  	dojoAxis.dirty = true;
	},
	
	_updateSeriesData: function(series,isCateChange)
	{
		var dojoSer = this._chart.series[this._chart.runs[series.seriesId]];
		if(dojoSer==null)
			return false;
		
		var legendChanged = false;
		//set legend
		if(series.isNameDirty())
		{
			var sname = series.getName();
			if(sname==null)
				sname = this.SERIES.replace(/\$\{0\}/,series.index);
			dojoSer.legend = sname;
			legendChanged = true;
		}
		//set values
		var dataChanged = series.isDataDirty();
		
		var chartType = this.getFallbackType(series.parent.type);
		if(dataChanged || (chartType=="pie" && isCateChange))//because legend of pie chart is data of category.
		{
			var data = this._mappingSeriesData(series);
			dojoSer.update(data);
		}
		dojoSer.hide = series.hide;
		return dataChanged || legendChanged;
	},
	
	toSvg: function()
	{
		var result = null;
		var def = dojox.gfx.utils.toSvg(this._chart.surface); 
        def.addCallback(function(svg)
        { 
        	result = svg ; 
        }); 
        
        def.addErrback(function(err)
        { 
          console.log(err); 
        });    
		return result;
	},
	
	getAllSeriesState: function()//for settings dialog
	{
		var ret = [];
		var t = this._chart.stack[0];
		if(this._chart.stack.length == 1 && t.declaredClass == "concord.chart.lib.plot2d.Pie")
		{
			if(typeof t.run.data[0] == "number")
			{
				for(var i=0;i<t.run.data.length;i++)
				{
					var state = {name:i+1};
					dojo.mixin(state,t.dyn[i]);
					ret.push(state);
				}
			}
			else
			{
				dojo.forEach(t.run.data, function(x, i)
				{
					var name = concord.chart.utils.Utils.escapeHTMLTag(x.legend || x.text || "");
					if(typeof name== "string" && (name == "" || name.trim() == ""))
						name = "&lt;" + this.nls.blankName + "&gt;";
					var state = {name: name};
					dojo.mixin(state,t.dyn[i]);
					ret.push(state);
				}, this);
			}
		}
		else
		{
			var allSeries = this._chart.series;
			for(var i=0;i<allSeries.length;i++)
			{
				var state = {};
				var series = allSeries[i];
				if(series.hide)
					continue;
				state.id = series.name;
				state.name = concord.chart.utils.Utils.escapeHTMLTag(series.legend);
				if(typeof state.name== "string" && (state.name == "" || (state.name).trim() == ""))
					state.name = "&lt;" + this.nls.blankName + "&gt;";
				state.fill = series.dyn.fill;
				state.stroke = series.dyn.stroke;
				state.markerFill = series.dyn.markerFill;
				state.marker = series.dyn.marker;
				ret.push(state);
			}
		}
		return ret;
	}
});