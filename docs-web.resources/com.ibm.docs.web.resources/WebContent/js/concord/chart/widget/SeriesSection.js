/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2013. All Rights Reserved.          */
/*                                                                   */
/* U.S. Government Users Restricted Rights: Use, duplication or      */
/* disclosure restricted by GSA ADP Schedule Contract with IBM Corp. */
/*                                                                   */
/* ***************************************************************** */
dojo.require("concord.chart.widget.Border");
dojo.provide("concord.chart.widget.SeriesSection");
dojo.require("concord.chart.config.DefaultSettings");
dojo.require("dijit.form.CheckBox");
dojo.require("concord.util.BidiUtils");

dojo.requireLocalization("concord.chart.dialogs","ChartPropDlg");
dojo.requireLocalization("concord.chart.dialogs","ChartTypesDlg");

dojo.declare("concord.chart.widget.SeriesSection", [dijit._Widget, dijit._Templated], {
	
	widgetsInTemplate: true,
	templateString: dojo.cache("concord.chart.widget", "templates/SeriesSection.html"),
	
	allChanges: null,
	seriesList: null,
	_defaultSettings: concord.chart.config.DefaultSettings,
	
	constructor: function() 
	{
		this.nls = dojo.i18n.getLocalization("concord.chart.dialogs","ChartPropDlg");
		this.nls1 = dojo.i18n.getLocalization("concord.chart.dialogs","ChartTypesDlg");
		this.chartTypeNls = {"bar":this.nls1.BAR, "column":this.nls1.COLUMN,"pie":this.nls1.SLICE,
				"area":this.nls1.AREA, "line":this.nls1.LINE, "scatter":this.nls1.SCATTER};
	},
	
	onChange: function(seriesId, key,value) 
	{
		
	},
	
	postCreate: function(){
		this.inherited(arguments);
		
		dijit.setWaiState(this.series_list_btn.focusNode,"label",this.nls.selectSeries);
		dijit.setWaiState(this.fill.focusNode,"label",this.nls.setFillColor);
		
		dojo.addClass(this.series_list_btn.containerNode,"buttonLabelTruncate");
		//this.series_list_btn.containerNode.style.cssText = "backgroudc-olor:#ccc;max-width:230px;min-width:30px;text-align:left";
		dojo.style(this.series_list_btn.titleNode, {"backgroudColor":"#ccc"});
		var dirAttr = BidiUtils.isGuiRtl() ? 'rtl' : '';
		this.series_list_btn.dropDown = new dijit.Menu({baseClass: "chartdropmenu","class":"lotusActionMenu", id:"S_d_ChartProp_p_series", dir: dirAttr});
		
		var popupmenu = dijit.byId("S_d_ChartProp_p_series");
		this.connect(popupmenu,"onOpen",dojo.hitch(this,function()
		{
			if(popupmenu.domNode.parentNode.clientHeight+10 > popupmenu.domNode.clientHeight)
				dojo.style(popupmenu.domNode,"paddingRight","0");
			else
				dojo.style(popupmenu.domNode,"paddingRight","10px");
		}));
		this.connect(popupmenu,"onItemClick",dojo.hitch(this,function(evt)
		{
			if (BidiUtils.isBidiOn()){
				if (this.bidiTextDir == 'auto') {
					//only 'auto' case is handeled here, all other cases are handeled in onTextDirChange() method
					dojo.attr(this.series_list_btn.domNode, "dir", BidiUtils.calculateDirForContextual(evt.label));
				}
			}
		}));
		this.connect(this.fill, "onChange", dojo.hitch(this,function(color)
		{
			var series = this._prepareSeries();
			var spPr = null;
			if(!this.setDataPoint)
			{
				spPr = series.spPr;
				if(!spPr)
					spPr = series.spPr = {};
				
				//For preview
				this.onChange(this.focusSeries.seriesId, "spPr", {solidFill:color});
			}
			else
			{
				var pt = this._prepareDataPoint(series);
				spPr = pt.spPr;
				if(!spPr)
					spPr = pt.spPr = {};
				
				//For preview
				var _dpt = {};
				_dpt[this.focusDataPoint] = {spPr:{solidFill:color}};
				this.onChange(this.focusSeries.seriesId, "dPt", _dpt);
			}
			spPr.solidFill = color;
		}));
		
		this.connect(this.line, "onChange", dojo.hitch(this,function(key, value)
		{
			//if noFill is 1, hide smooth setting
			var type = this._defaultSettings.supportedTypes[this.focusSeries.getType()];
			if(type=="line" || type=="scatter")
			{
				if(key=="noFill" && value==1)
					this.smooth_section.style.display = "none";  
				if(key=="w" && value>0)
					this.smooth_section.style.display = "";  
			}
			
			var series = this._prepareSeries();
			var spPr = null;
			if(!this.setDataPoint)
			{
				spPr = series.spPr;
				if(!spPr)
					spPr = series.spPr = {};
				
				//For preview
				var _ln = {};
				_ln[key] = value;
				this.onChange(this.focusSeries.seriesId, "spPr", {ln:_ln});
			}
			else
			{
				var pt = this._prepareDataPoint(series);
				spPr = pt.spPr;
				if(!spPr)
					spPr = pt.spPr = {};
				
				//For preview
				var _ln = {};
				_ln[key] = value;
				var _dpt = {};
				_dpt[this.focusDataPoint] = {spPr:{ln:_ln}};
				this.onChange(this.focusSeries.seriesId, "dPt", _dpt);
			}
			if(!spPr.ln)
				spPr.ln = {};
			spPr.ln[key] = value;
		}));
		
		this.connect(this.marker, "onChange", dojo.hitch(this,function()
		{
			var series = this._prepareSeries();
			series.marker = this.marker.checked ? 1:0;
			this.fill.setDisabled(!this.marker.checked);
			
			//For preview
			this.onChange(this.focusSeries.seriesId, "marker", series.marker);
		}));
		
		this.connect(this.smooth, "onChange", dojo.hitch(this,function()
		{
			var series = this._prepareSeries();
			series.smooth = this.smooth.checked ? 1:0;
			
			//For preview
			this.onChange(this.focusSeries.seriesId, "smooth", series.smooth);
		}));
	},
	
	_prepareSeries: function()
	{
		var seriesList = this.allChanges.series;
		if(!seriesList)
			seriesList = this.allChanges.series = {};
		var series = seriesList[this.focusSeries.seriesId];
		if(!series)
			series = seriesList[this.focusSeries.seriesId] = {};
		return series;
	},
	
	_prepareDataPoint: function(series)
	{
		var dpts = series.dPt;
		if(!dpts)
			var dpts = series.dPt = {};
		var pt = dpts[this.focusDataPoint];
		if(!pt)
			pt = dpts[this.focusDataPoint] = {};
		return pt;
	},
	
	setState: function(chart,allChanges)
	{
		this.series_list_btn.dropDown.destroyDescendants();
		
		this.allChanges = allChanges;
		var allSeriesState = chart._viewAdapter.getAllSeriesState();
		var allSeries = chart._diagram.allSeries;
		
		var first = allSeriesState[0];
		var plots = chart._diagram.plotArea.plots;
		this.seriesString = "";
		var dirAttr = BidiUtils.isGuiRtl() ? 'rtl' : '';
		if(plots.length==1 && this._defaultSettings.supportedTypes[plots[0].type]=="pie")
		{
			this.setDataPoint = true;
			this.focusSeries = allSeries[plots[0].seriesList[0]];
			if(!this.focusSeries || this.focusSeries.hide || allSeriesState.length==0)
				return false;
			
			this.focusDataPoint = 0;
			for(var i=0;i<allSeriesState.length;i++)
			{
				var state = allSeriesState[i];
				this.seriesString += state.name + "<br>";
				var item = new dijit.MenuItem({label:state.name + '', dir: dirAttr});
				dijit.setWaiState(item.domNode,"label",state.name);
				
				this.connect(item,"onClick", dojo.hitch(this,function(state,idx)
				{
					this.focusDataPoint = idx;
					this._setState(state);
				},state,i));
				
				if (BidiUtils.isBidiOn()){
					dojo.attr(item, "dir", this.bidiTextDir);
				}
				this.series_list_btn.dropDown.addChild(item);
			}
			this.container.setTitle(this.chartTypeNls.pie);
		}
		else
		{
			if(allSeriesState.length==0)
				return false;
			
			this.setDataPoint = false;
			this.focusSeries = allSeries[first.id];
			var chartType = null;
			var complexChart = false;
			for(var i=0;i<allSeriesState.length;i++)
			{
				var state = allSeriesState[i];
				this.seriesString += state.name + "<br>";
				var item = new dijit.MenuItem({label:state.name + '', dir: dirAttr});
				dijit.setWaiState(item.domNode,"label",state.name);
				
				var seriesModel = allSeries[state.id];
				var type = this._defaultSettings.supportedTypes[seriesModel.parent.type];
				if(type=="bar")
				{
					if(seriesModel.parent.barDir!="bar")
						type = "column";
				}
				if(chartType==null)
					chartType = type;
				else if(type!=chartType)
					complexChart = true;
				
				this.connect(item,"onClick", dojo.hitch(this,function(state)
				{
					this.focusSeries = allSeries[state.id];
					this._setState(state);
				},state));
				if (BidiUtils.isBidiOn()){
					dojo.attr(item, "dir", this.bidiTextDir);
				}
				this.series_list_btn.dropDown.addChild(item);
			}
			
			if(!complexChart)
				this.container.setTitle(this.chartTypeNls[chartType]);
			else
				this.container.setTitle(this.nls.series);
		}
		if (BidiUtils.isBidiOn()){
			dojo.attr(this.series_list_btn.domNode, "dir", this.bidiTextDir);
		}
		if(first)
			this._setState(first);
		return true;
	},
	
	show: function()
	{
		this.series_list_btn.containerNode.style.cssText = "backgroudc-olor:#ccc;max-width:210px;min-width:30px";
		var label = this.series_list_btn.label;
		this.series_list_btn.setLabel(this.seriesString);
		dojo.style(this.series_list_btn.containerNode,{"width":this.series_list_btn.containerNode.clientWidth + "px"});
		this.series_list_btn.setLabel(label);
	},
	
	_setState: function(state)
	{
		this.series_list_btn.setLabel(state.name);
		var type = this._defaultSettings.supportedTypes[this.focusSeries.getType()];
		
		var change = null;
		if(this.allChanges.series)
			change = this.allChanges.series[this.focusSeries.seriesId];
		
		var stroke = dojo.mixin({},state.stroke);
		var fill = null;
		
		var changedSpPr = null;
		if(type=="pie")
		{
			if(change!=null && change.dPt!=null && change.dPt[this.focusDataPoint]!=null)
				changedSpPr = change.dPt[this.focusDataPoint].spPr;
		}
		else
		{
			if(change!=null)
				changedSpPr = change.spPr;
		}
		if(changedSpPr)
		{
			if("solidFill" in changedSpPr)
				fill = changedSpPr.solidFill;
			
			if("ln" in changedSpPr)
			{
				var ln = changedSpPr.ln;
				if(!ln)
					stroke = null;
				else
				{
					if("w" in ln)
						stroke.width = ln.w;
					if("solidFill" in ln)
						stroke.color = ln.solidFill;
				}
			}
		}
		
		if(type=="bar" || type=="area" || type=="pie")
		{
			this.fill_section.style.display = "";
			this.line_label.textContent = this.nls.border;
			this.fill_label.textContent = this.nls.fill;
			
			this.fill.setDisabled(false);
			this.fill.setColor(fill || state.fill || "");
			this.line.setWaiState("border");
			this.line.defaultWidth = 1;
			this.marker_section.style.display = "none";
			this.smooth_section.style.display = "none";
			
			dojo.place(this.line_section,this.fill_section,"after");
		}
		else if(type=="line" || type=="scatter")
		{
			this.marker_section.style.display = "";
			dojo.place(this.fill_section,this.line_section,"after");
			this.line.setWaiState("line");
			this.line.defaultWidth = 2;
			this.line_label.textContent = this.nls.line;
			this.fill_label.textContent = this.nls.markerfill;
			
			var marker = 0;
			if(change && "marker" in change)
				marker = change.marker;
			else
				marker = state.marker==null ? 0:1;
			
			var smooth = false;
			if(change && "smooth" in change)
				smooth = change.smooth;
			else
			{
				if(this.focusSeries.smooth!=null)
					smooth = this.focusSeries.smooth;
				else if(this.focusSeries.parent.style=="smoothMarker")
					smooth = true;
				else
				    smooth = this.focusSeries.parent.smooth;
			}
			
			this.smooth._onChangeActive = false;
			this.smooth.setChecked(!!smooth);
			this.smooth._onChangeActive = true;
			if(stroke && stroke.width)
				this.smooth_section.style.display = ""; 
			else
				this.smooth_section.style.display = "none"; 
			
			this.marker._onChangeActive = false;
			this.marker.setChecked(!!marker);
			this.fill.setDisabled(!marker);
			this.marker._onChangeActive = true;
			
			this.fill.setColor(fill || state.markerFill || stroke.color || "");
		}
		
		this.line.setState({w:stroke.width, solidFill:stroke.color});
	},
	
	reset: function()
	{
		
	},
	setBidiTextDir: function (dir)
	{
		this.bidiTextDir = dir;
	},
	onTextDirChange: function(newTextDir) {
		if (!BidiUtils.isBidiOn())
			return;
		this.bidiTextDir = newTextDir;
		var items = this.series_list_btn.dropDown.getChildren();
		for(var i=0;i<items.length;i++){
			var item = items[i];
			dojo.attr(item, "dir", (this.bidiTextDir == "auto")? BidiUtils.calculateDirForContextual(item.label) : this.bidiTextDir);
		}
		dojo.attr(this.series_list_btn.domNode, "dir", (this.bidiTextDir == "auto")? BidiUtils.calculateDirForContextual(this.series_list_btn.label) : this.bidiTextDir);
	}
});