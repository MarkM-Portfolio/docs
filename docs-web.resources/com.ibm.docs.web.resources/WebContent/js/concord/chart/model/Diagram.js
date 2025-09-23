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
dojo.provide("concord.chart.model.Diagram");
dojo.require("concord.chart.model.PlotArea");
dojo.require("concord.chart.model.Legend");
dojo.require("concord.chart.utils.Utils");
dojo.require("concord.util.BidiUtils");
dojo.require("concord.chart.model.Bidi");
dojo.declare("concord.chart.model.Diagram",null,{
	plotArea: null,    
	legend: null,          
	title: null, 
	id: null,
	pivotSource : null,
	_dataProvider: null,
	controller: null, //Chart
	
	//store all the series here
	allSeries: null,  //map, {id: DataSeries}
	
	graphPro: null,       //map
	textPro: null,
	
	utils : concord.chart.utils.Utils,
	
	bidi: null,
	
	constructor: function(chartId,controller)
	{
		this.controller = controller;
		this.id = chartId;
		this.allSeries = {};
		if (BidiUtils.isBidiOn())
			this.bidi = new concord.chart.model.Bidi(this);
	},
	
	createPlotArea: function()
	{
		if(this.plotArea==null)
			this.plotArea = new concord.chart.model.PlotArea(this);
		return this.plotArea;
	},
	
	createLegend: function()
	{
		this.legend = new concord.chart.model.Legend();
		this.legend.legendPos = "r";
	},
	
	createBidiArea: function()
	{
		return this.bidi;
	},

	attachDataProvider: function(provider)
	{
		this._dataProvider = provider;
	},
	
	getUnsupportedType: function()
	{
		return this.plotArea.getUnsupportedType();
	},
	
	getDataSequenceList: function()
	{
		var list = [];
		for(var id in this.allSeries)
		{
			var series = this.allSeries[id];
			var data = series.data;
			for(var role in data)
			{
				list.push(data[role]);
			}
		}
		var axisList = this.plotArea.axisList;
		for(var i=0;i<axisList.length;i++)
		{
			var axis = axisList[i];
			if(axis.categorySeq!=null)
				list.push(axis.categorySeq);
		}
		
		return list;
	},
	
	getDataSeries: function(seriesId)
	{
		return this.allSeries[seriesId];
	},
	
	getDataSequence: function(role, id)
	{
		if(role != "cat")
		{
			var series = this.allSeries[id];
			if(series!=null)
				return series.data[role];
		}
		else
		{
			var axisList = this.plotArea.axisList;
			for(var i=0;i<axisList.length;i++)
			{
				var axis = axisList[i];
				if(axis.id==id)
					return axis.categorySeq;
			}
		}
	},
	
	toJson: function(noData, noFallBack)
	{
		var json = {};
		if(this.legend!=null)
			json.legend = this.legend.toJson();
		if(this.title!=null)
			json.title = this.title.toJson();
		if(this.plotArea)
			json.plotArea = this.plotArea.toJson(noData, noFallBack);

		if(this.graphPro!=null)
			json.spPr = dojo.clone(this.graphPro);
		if(this.textPro!=null)
			json.txPr = dojo.clone(this.textPro);
		if (this.bidi != null)
			json.bidi = this.bidi.toJson();
		return json;
	},
	
	loadFromJson: function(content, dataProvider)
	{
		this.pivotSource = content.pivotSource;
		
		if(content.legend!=null)
		{
			this.legend = new concord.chart.model.Legend();
			this.legend.loadFromJson(content.legend);
		}
		
		if(content.title!=null)
		{
			this.title = new concord.chart.model.Title();
			this.title.loadFromJson(content.title);
		}
		
		var plotAreaJson = content.plotArea;
		if(plotAreaJson!=null)
		{
			this.plotArea = new concord.chart.model.PlotArea(this);
			this.plotArea.loadFromJson(plotAreaJson,dataProvider);
		}
		
		this.graphPro = content.spPr;
		this.textPro = content.txPr;
		
		if(content.bidi != null)
		{
			this.bidi = new concord.chart.model.Bidi();
			this.bidi.loadFromJson(content.bidi);
		}

	},
	
	destroy: function()
	{
		var dataSeqList = this.getDataSequenceList();
		for(var i=0;i<dataSeqList.length;i++)
		{
			var seq = dataSeqList[i];
			if(seq)
				seq.destroy();
		}
	},
	
	_removeFontFace: function(font)
	{
		if(font)
		{
			delete font.latin;
			delete font.asian;
			delete font.ctl;
		}
	},
	
	set: function(properties)
	{
		if("txPr" in properties)
		{
			var txPr = properties["txPr"];
			if(txPr==null)
			{
				this.textPro = null;
			}
			else
			{
				if(this.textPro==null)
					this.textPro = txPr;
				else
					dojo.mixin(this.textPro,txPr);
			}
			
			//clean all the children element's font
			if(this.title!=null)
				this._removeFontFace(this.title.textPro);
			if(this.legend!=null)
				this._removeFontFace(this.legend.txPr);
			var axisList = this.plotArea.axisList;
			for(var i=0;i<axisList.length;i++)
			{
				var axis = axisList[i];
				this._removeFontFace(axis.textPro);
				if(axis.title!=null)
					this._removeFontFace(axis.title.textPro);
			}
		}
		
		var seriesList = properties.series;
		for(var id in seriesList)
		{
			var pro = seriesList[id];
			var series = this.allSeries[id];
			series.set(pro);
		}
		var axisProList = properties.axis;
		if(axisProList!=null)
		{
			var axisMap = {};
			var axisList = this.plotArea.axisList;
			for(var i=0;i<axisList.length;i++)
			{
				var axis = axisList[i];
				axisMap[axis.id] = axis;
			}
			for(var id in axisProList)
			{
				var pro = axisProList[id];
				var axis = axisMap[id];
				axis.set(pro);
			}
		}
		if("spPr" in properties)
		{
			var spPr = properties["spPr"];
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
		
		if("title" in properties)
		{
			var titlePro = properties["title"];
			if(titlePro==null)
			{
				this.title = null;
			}
			else
			{
				if(this.title==null)
				{
					this.title = new concord.chart.model.Title();
					this.title.loadFromJson(titlePro);
				}
				else
				{	
					this.title.set(titlePro);
				}
			}
		}
		
		if("plotArea" in properties)
		{
			this.plotArea.set(properties.plotArea);
		}
		
		if("legend" in properties)
		{
			var legendPro = properties["legend"];
			if(legendPro==null)
				this.legend = null;
			else
			{
				if(this.legend==null)
				{
					this.legend = new concord.chart.model.Legend();
					this.legend.loadFromJson(legendPro);
				}
				else
				{
					this.legend.set(legendPro);
				}
			}
		}
		
		if("bidi" in properties)
		{
			if (this.bidi == null)
				this.bidi = new concord.chart.model.Bidi();
			this.bidi.set(properties.bidi);
		}

	},
	
	getReverseSettings: function(settings)
	{
		var undoPro = {};
		if("series" in settings)
		{
			undoPro.series = {};
			var seriesList = settings.series;
			for(var id in seriesList)
			{
				var pro = seriesList[id];
				var series = this.allSeries[id];
				undoPro.series[id] = series.getReverseSettings(pro);
			}
		}
		
		if("axis" in settings)
		{
			undoPro.axis = {};
			var axisMap = {};
			var axisList = this.plotArea.axisList;
			for(var i=0;i<axisList.length;i++)
			{
				var axis = axisList[i];
				axisMap[axis.id] = axis;
			}
			var axisProList = settings.axis;
			for(var id in axisProList)
			{
				var pro = axisProList[id];
				var axis = axisMap[id];
				undoPro.axis[id] = axis.getReverseSettings(pro);
			}
		}
		
		if("spPr" in settings)
		{
			if(this.graphPro==null)
				undoPro.spPr = null;
			else
				undoPro.spPr = this.utils.reverseSpPr(settings.spPr,this.graphPro);
		}
		
		if("plotArea" in settings)
			undoPro.plotArea = this.plotArea.getReverseSettings(settings.plotArea);
		
		if("title" in settings)
		{
			if(this.title==null)
				undoPro.title = null;
			else
				undoPro.title = this.title.getReverseSettings(settings.title);
		}
		
		if("legend" in settings)
		{
			if(this.legend==null)
				undoPro.legend = null;
			else
			{
				undoPro.legend = this.legend.getReverseSettings(settings.legend);
			}
		}
		
		if("txPr" in settings)
		{
			if(this.textPro==null)
				undoPro.txPr = null;
			else
				undoPro.txPr = this.utils.reverseTxPr(settings.txPr,this.textPro);
			
			//reverse all the children element's font
			if(this.title!=null && this.title.textPro != null)
			{
				if(undoPro.title==null)
					undoPro.title = {};
				undoPro.title.txPr = dojo.clone(this.title.textPro);
			}
			
			if(this.legend!=null && this.legend.txPr!=null)
			{
				if(undoPro.legend==null)
					undoPro.legend = {};
				undoPro.legend.txPr = dojo.clone(this.legend.txPr);
			}
			var axisList = this.plotArea.axisList;
			for(var i=0;i<axisList.length;i++)
			{
				var axis = axisList[i];
				if(axis.textPro != null || (axis.title!=null && axis.title.textPro!=null))
				{
					if(undoPro.axis==null)
						undoPro.axis = {};
					
					var undoAxis = undoPro.axis[axis.id];
					if(undoAxis==null)
						undoAxis = undoPro.axis[axis.id] = {};
					
					if(axis.textPro != null)
						undoAxis.txPr = dojo.clone(axis.textPro);
					if(axis.title!=null && axis.title.textPro!=null)
					{
						if(undoAxis.title==null)
							undoAxis.title = {};
						undoAxis.title.txPr = dojo.clone(axis.title.textPro);
					}
				}
			}
		}
		
		return undoPro;
	}
});