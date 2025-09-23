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

dojo.provide("concord.chart.controller.ChartProxy");
dojo.require("concord.chart.controller.Chart");

dojo.declare("concord.chart.controller.ChartProxy",null,{
	_charts: null,   //map, {chartId, chart}
	_chartDivId: "ChartDiv",
	_renderQueue: null,
	
	constructor:function()
	{
		this._charts = {};
		this._renderQueue = [];
	},
	
	loadCharts: function(charts)
	{
		if(charts==null)
			return;
		for(var id in charts)
		{
			var chartJson = charts[id];
			this.addChart(id, chartJson);
		}
	},
	
	addChart: function(chartId, chartJson)
	{
		var chart = new concord.chart.controller.Chart(chartId);
		chart.loadFromJson(chartJson);
		this._charts[chartId] = chart;	
		return chart;
	},
	
	removeChart: function(chartId)
	{
		var chart = this._charts[chartId];
		if(chart){
			chart.detroyView();//don't need to destroy diagram(there is not referent to release)
			delete this._charts[chartId];	
		}
	},
	
	//don't set chart view
	set: function(chartId, data)
	{
		var chart = this._charts[chartId];
		if(chart)
			chart.set(data, true);
	},
	
	update: function(chartId, data)
	{
		var chart = this._charts[chartId];
		if(chart)
		{
			chart.set(data["properties"]);
			var numFmt = data["numFmt"];
			for(var seqKey in numFmt)
				this._setNumFmt(chart, seqKey, numFmt.seqKey);
			var seriesHide = data["seriesHide"];
			for(seriesId in seriesHide){
				var series = chart.getDataSeries(seriesId);
				if(series)
					series.hide = seriesHide[seriesId];
			}				
		}
	},
	
	_setNumFmt: function(chart, seqKey, numFmt)
	{		
		var role;
		var id;
		var idx = seqKey.indexOf(" ");
		if(idx > 0){
			role = seqKey.substring(0, idx);
			id = seqKey.substring(idx+1);
		}
		var dataSeq = chart.getDataSequence(role,id);
		if(dataSeq)
			dataSeq.setNumberFormat(numFmt);
	},
	
	render: function(chartId, width, height)
	{
		var div = dojo.byId(this._chartDivId);
		if(div){
			this._renderQueue.push({chartId : chartId, width: width, height : height});
			return;
		}
		var chart = this._charts[chartId];
		if(chart){
			var wh = this._normalizeChartSize(width, height);
			width = wh.width;
			height = wh.height;
			var div = dojo.create("div", {id:this._chartDivId ,style:{"width" : width + "px", "height" : height + "px","position": "absolute","top": "0px", "left":"0px"}});//,"border" : "3px solid"
			document.body.insertBefore(div, document.body.firstChild);

			chart.setNode(div);
			chart.render();
			var rect = div.getBoundingClientRect();
			var param = {
				l : rect.left,
				t :rect.top,
				w : rect.width,
				h : rect.height,
				chartId : chartId
			};
			
			concord.util.mobileUtil.chartRendered(param);
		}
	},
	
	 /**
	  * in the case the chart's height or width has exceed the screen, 
	  * we need zoom it.
	  * @param chart's width, height
	  */
	_normalizeChartSize: function(width, height)
	{
		var box = dojo.window.getBox();
		var ratio = 1;
		if(width > box.w)
			ratio = box.w/width;
		if(height > box.h)
		{
			var r = box.h/height;
			if(r < ratio)
				ratio = r;
		}
		
		width = width * ratio;
		height = height * ratio;
		return{width:width, height:height};
	},
	
	// Need experiment test to make sure whether to cache the chart svg in independent div.
	/**
	  * When Native snapshot finished, clear the render.
	  */
	finish : function()
	{
		var div = dojo.byId(this._chartDivId);
		if(div)
			document.body.removeChild(div);
		if(this._renderQueue.length){
			var first = this._renderQueue[0];
			this._renderQueue.splice(0,1);
			this.render(first.chartId, first.width, first.height);
		}
	}
});