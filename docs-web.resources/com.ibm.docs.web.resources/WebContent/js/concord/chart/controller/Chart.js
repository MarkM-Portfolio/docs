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

dojo.provide("concord.chart.controller.Chart");
dojo.require("concord.chart.model.ModelFactory");
dojo.require("concord.chart.model.Diagram");
dojo.require("concord.chart.data.DataProvider");

dojo.require("concord.chart.model.PlotArea");
dojo.require("concord.chart.config.DefaultSettings");
dojo.requireLocalization("concord.chart.controller","Chart");

dojo.declare("concord.chart.controller.Chart",null,{
	_diagram : null,
	_dataProvider: null,
	_highlighter: null,
	_viewAdapter: null,
	_id: null,
	checkData: false,  
	
	_factory : concord.chart.model.ModelFactory,
	_dataPointsLimit: concord.chart.config.DefaultSettings.dataPointsLimit,
	nls : null,
	
	constructor: function(chartId)
	{
		this._id = chartId;
		this._diagram = new concord.chart.model.Diagram(chartId,this);
		this.nls = dojo.i18n.getLocalization("concord.chart.controller","Chart");
		
		this._tooManyPointsMsg = dojo.string.substitute(this.nls.TOO_MANY_POINTS, [this._dataPointsLimit]);
	},
	
	loadFromJson: function(content)
	{
		if(this._dataProvider==null)
		{
			this._dataProvider = new concord.chart.data.DataProvider();
			this._diagram.attachDataProvider(this._dataProvider);
		}
		this._diagram.loadFromJson(content,this._dataProvider);
	},
	
	attachDataProvider: function(provider)
	{
		this._dataProvider = provider;
		this._diagram.attachDataProvider(provider);
	},
	
	getDataProvider: function()
	{
		return this._dataProvider;
	},
	
	createModel: function(chartSetting, args)
	{
		var plotArea = this._diagram.createPlotArea();
		
		var interpreter = this._factory.getDataInterpreter(chartSetting.type);
		if(this._dataProvider==null)
		{
			this._dataProvider = new concord.chart.data.DataProvider();
			this._diagram.attachDataProvider(this._dataProvider);
		}
		
		var dataSrc = this._dataProvider.createDataSource(args,interpreter);
		
		if(dataSrc==null)
			return false;
		
		this._diagram.createLegend();
		return plotArea.createPlotByDataSource(chartSetting, dataSrc, args);
	},
	
	setNode: function(node)
	{
		this.node = node;
		this.showMsg(this.nls.LOADING);
	},

	getUnsupportedType: function()
	{
		var type = this._diagram.getUnsupportedType();
		if(type && this.nls[type])
			return this.nls[type];
		return type;
	},
	
	hasView: function()
	{
		return this._viewAdapter != null;
	},
	
	getDataSequenceList: function()
	{
		return this._diagram.getDataSequenceList();
	},	
	
	getDataSequence: function(role, id)
	{
		return this._diagram.getDataSequence(role, id);
	},
	
	getDataSeries: function(seriesId)
	{
		return this._diagram.getDataSeries(seriesId);
	},
	
	getChartId: function()
	{
		return this._id;
	},
	
	destroy: function()
	{
		this._diagram.destroy(); //destroy model
		this.detroyView();  ////destroy view
	},
	
	detroyView: function()
	{
		if(this._viewAdapter){
			this._viewAdapter.destroy();
			this._viewAdapter = null;
		}
		else if (this.node)
			this.node.innerHTML = "";
		this.msgNode = null;
	},
	
	set: function(properties, bMobile)
	{
		if(properties==null)
			return;
		
		this._diagram.set(properties);
		if(!bMobile && this._viewAdapter)
			this._viewAdapter.set(properties);
	},
	
	getReverseSettings: function(settings)
	{
		if(settings==null)
			return null;
		
		return this._diagram.getReverseSettings(settings);
	},
	
	hideMsg: function()
	{
		if(this.msgNode)
			this.msgNode.style.display = "none";
	},

	showMsg: function(msg)
	{
		if(!this.node)
			return;
		
		if(!this.msgNode)
		{
			this.msgNode = dojo.create("div", {
				style: {
					 fontWeight: "bold",
					 fontSize: "12pt",
					 textAlign: "center",
					 direction: BidiUtils.isGuiRtl() ? "rtl" : ""
				}
			}, this.node);
		}
		
		this.msgNode.style.display = "";
		if(typeof msg == "string")
			msg = msg.replace(/&/gm, "&amp;").replace(/</gm, "&lt;").replace(/>/gm, "&gt;").replace(/"/gm, "&quot;").replace(/'/gm, "&#39;");
		this.msgNode.innerHTML = msg;
		var t = (this.node.offsetHeight - this.msgNode.offsetHeight)/ 2;
		if(t<0) t=0;
		this.msgNode.style.marginTop = t + 'px';
	},
	
	render: function()
	{
		if(this._diagram==null || this.node==null)
			return;
		
		var unsupported = this.getUnsupportedType();
		if(unsupported!=null)
		{
			this.showMsg(dojo.string.substitute(this.nls.UNSUPPORTED_CHART,[unsupported]));
			return;
		}
		
		if(this._viewAdapter==null)
		{
			if(concord.chart.config.DefaultSettings.chartLibrary=="dojo")
				this._viewAdapter = new concord.chart.view.DojoChartAdapter(this._diagram, this.node);
			else
				return;  //no other adapter is implemented
		}
		
		this._viewAdapter.render();
		
		this.hideMsg();
	},
	
	/*boolean*/isDirty: function() {
		return this._viewAdapter ? this._viewAdapter.isDirty() : true;
	},
	
	resize: function(width, height)
	{
		if(this._diagram==null || this._viewAdapter==null)
			return;
		this._viewAdapter.resize(width, height);
	},
	
	toJson: function(noData, noFallBack)
	{
		var json = this._diagram.toJson(noData, noFallBack);
		json.plotArea.dataSource = this._dataProvider._dataSource;
		return json;
	},
	
	notify: function(event)
	{
	},
	
	getSvg: function()
	{
		if(this._diagram==null || this._viewAdapter==null)
			return null;
		var svg = this._viewAdapter.toSvg();
		return svg;
	},
	
	downloadPng: function()
	{
		if(this._diagram==null || this._viewAdapter==null)
			return;
		var svg = this._viewAdapter.toSvg();
		
		if(svg==null)
			return;
		
		var scene = pe.scene;
		var form = scene.chart2PngForm;
		if(form==null)
		{
			var fname = "chart2pngFrame";
			var cframe = dojo.place(
					'<iframe id="'+fname+'" name="'+fname+
					'" style="position: absolute; left: 1px; top: 1px; height: 1px; width: 1px; visibility: hidden">',
				dojo.body());

			window[fname] = cframe;
				
			form = scene.chart2PngForm = dojo.create("form", {
				method:"post", 
				action: contextPath + "/api/svg2png/" + scene.bean.getRepository() + "/" + scene.bean.getUri(),
				target: fname,
				style: {display:"none"}
				}, cframe);
				
			dojo.create("input", {name:"svg"}, form);
			// dojo.create("input", {name:"docuri",value:scene.bean.getUri()}, form);
			// dojo.create("input", {name:"repoId",value:scene.bean.getRepository()}, form);
		}
		dojo.query("input", form)[0].value = svg;
		form.submit();
	}
});