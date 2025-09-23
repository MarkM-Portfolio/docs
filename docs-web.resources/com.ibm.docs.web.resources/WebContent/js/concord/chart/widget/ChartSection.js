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

dojo.provide("concord.chart.widget.ChartSection");

dojo.require("concord.chart.widget.FontToolbar");
dojo.require("concord.chart.widget.DropDownButton");
dojo.require("concord.chart.widget.LineThickDropDownButton");
dojo.require("concord.chart.widget.Title");
dojo.require("concord.chart.widget.Border");
dojo.require("concord.chart.utils.Utils");
dojo.require("concord.util.BidiUtils");
dojo.require("concord.chart.config.DefaultSettings");
dojo.require("concord.chart.widget.FontNameDropDownButton");
dojo.require("concord.chart.widget.ColorPickerDropDownButton");

dojo.requireLocalization("concord.chart.dialogs","ChartPropDlg");

dojo.declare("concord.chart.widget.ChartSection", [dijit._Widget, dijit._Templated], {
	
	widgetsInTemplate: true,
	templateString: dojo.cache("concord.chart.widget", "templates/ChartSection.html"),
	legendPositions : ["n", "l", "r", "t", "b"],
	
	chartModel: null,
	allChanges: null,
	
	_defaultSettings: concord.chart.config.DefaultSettings,
	
	bidiGuiDirArr : ["ltr", "rtl"],
	bidiTextDirArr : ["ltr", "rtl", "auto"],
	
	constructor: function() 
	{
		this.nls = dojo.i18n.getLocalization("concord.chart.dialogs","ChartPropDlg");
	},
	
	postMixInProperties: function()
	{
		this.inherited(arguments);
		if (BidiUtils.isBidiOn()){
			var closeDivStr = "</div>";
			var bidiTemplateStr = dojo.cache("concord.chart.widget", "templates/ChartSectionBidi.html");
			var lastDivIndx = this.templateString.lastIndexOf(closeDivStr);
			this.templateString = this.templateString.substring(0,lastDivIndx).concat(bidiTemplateStr).concat(closeDivStr); 
		}
	},
	
	onChange: function(key,value) 
	{
		
	},
	
	onTextDirChange: function(newTextDir) {
		if (!BidiUtils.isBidiOn())
			return;
		this.bidiTextDir = newTextDir;
		this.onChange("bidi",{"textDir": newTextDir});
		dojo.attr(this.chart_title.content, "dir", (this.bidiTextDir == 'auto') ? BidiUtils.calculateDirForContextual(this.chart_title.content.value) : this.bidiTextDir);
	},
	
	onSubmit: function()
	{
		
	},
	
	postCreate: function(){
		this.inherited(arguments);
		
		dijit.setWaiState(this.chart_font.focusNode,"label",this.nls.selectFontName);
		this.chart_title.font.setWaiState(this.nls.chartTitle);
		dijit.setWaiState(this.legend_place.focusNode,"label",this.nls.setLegendPos);
		this.legend_font.setWaiState(this.nls.legend);
		dijit.setWaiState(this.chart_fill_color.focusNode,"label",this.nls.background);
		this.chart_border.setWaiState("border");
		dijit.setWaiState(this.plot_fill_color.focusNode,"label",this.nls.setPlotAreaColor);
		var dirAttr = BidiUtils.isGuiRtl() ? 'rtl' : '';		
		this.chart_title.font.setSize(18); //Default chart title font size is 18
		this.legend_place.dropDown = new dijit.Menu({baseClass: "chartdropmenu","class":"lotusActionMenu", dir: dirAttr});
		dojo.style(this.legend_place.containerNode,"width", "78px");
		dojo.addClass(this.legend_place.containerNode,"buttonLabelTruncate");
		for(var i=0;i<this.legendPositions.length;i++)
		{
			var pos = this.legendPositions[i];
			var item = new dijit.MenuItem({label:this.nls[pos], dir: dirAttr});
			dijit.setWaiState(item.domNode,"label",this.nls[pos]);
			this.connect(item,"onClick", dojo.hitch(this,function(pos)
			{
				this.legend_place.setLabel(this.nls[pos]);
				
				var legendPr = this.allChanges.legend;
				if(!legendPr)
					legendPr = this.allChanges.legend = {};
				legendPr.legendPos = pos;
				
				this.onChange("legend",{"legendPos":pos});
			},pos));
			
			this.legend_place.dropDown.addChild(item);
		}
		
		this.connect(this.legend_font,"onChange", dojo.hitch(this,function(key, value)
		{
			var ntxPr = {};
			ntxPr[key] = value;
			this.onChange("legend",{"txPr": ntxPr});
			
			var legendPr = this.allChanges.legend;
			if(!legendPr)
				legendPr = this.allChanges.legend = {};
			
			var txPr = legendPr.txPr;
			if(!txPr)
				txPr = legendPr.txPr = {};
			txPr[key] = value;
		}));
		
		this.connect(this.chart_font,"onChange", dojo.hitch(this,function(value)
		{
			var ntxPr = {latin:value, asian:value, ctl:value};
			this.onChange("txPr", ntxPr);
			
			var txPr = this.allChanges.txPr;
			if(!txPr)
				txPr = this.allChanges.txPr = {};
			dojo.mixin(txPr,ntxPr);
		}));
		
		this.connect(this.chart_fill_color,"onChange", dojo.hitch(this,function(value)
		{
			this.onChange("spPr", {solidFill: value});
			var spPr = this.allChanges.spPr;
			if(!spPr)
				spPr = this.allChanges.spPr = {};
			spPr.solidFill = value;
		}));
		
		this.connect(this.chart_border,"onChange", dojo.hitch(this,function(key,value)
		{
			var nspPr = {ln:{}};
			nspPr.ln[key] = value;
			this.onChange("spPr", nspPr);
			
			var spPr = this.allChanges.spPr;
			if(!spPr)
				spPr = this.allChanges.spPr = {};
			if(!spPr.ln)
				spPr.ln = {};
			
			spPr.ln[key] = value;
		}));
		
		this.connect(this.plot_fill_color,"onChange", dojo.hitch(this,function(value)
		{
			this.onChange("plotArea", {spPr:{solidFill: value}});
			
			var plotArea = this.allChanges.plotArea;
			if(!plotArea)
				plotArea = this.allChanges.plotArea = {};
			var spPr = plotArea.spPr;
			if(!spPr)
				spPr = plotArea.spPr = {};
			spPr.solidFill = value;
		}));
		
		this.connect(this.chart_title,"onChange", dojo.hitch(this, function(key, value)
		{
			var ntitle = {};
			ntitle[key] = value;
			this.onChange("title", ntitle);
			
			var title = this.allChanges.title;
			if(!title)
				title = this.allChanges.title = {};
			if(key=="txPr")
			{
				if(!title.txPr)
					title.txPr = value;
				else
					dojo.mixin(title.txPr,value);
			}
			else
				title[key] = value;
		}));
		
		this.connect(this.chart_title,"onSubmit", dojo.hitch(this, function()
		{
			this.onSubmit();
		}));
		if (!BidiUtils.isBidiOn())
			return;
		
		this.bidi_gui_dir.dropDown = new dijit.Menu({baseClass: "chartdropmenu","class":"lotusActionMenu", dir: dirAttr});
		//dojo.style(this.bidi_gui_dir.titleNode,"width", "90px");

		for(var i=0;i<this.bidiGuiDirArr.length;i++)
		{
			var dir = this.bidiGuiDirArr[i];
			var item = new dijit.MenuItem({label:this.nls[dir], dir: dirAttr});
			this.connect(item,"onClick", dojo.hitch(this,function(dir)
			{
				this.bidi_gui_dir.setLabel(this.nls[dir]);
				var bidi = this.allChanges.bidi;
				if(!bidi)
					bidi = this.allChanges.bidi = {};
				bidi.dir = dir;
				
				this.onChange("bidi",{"dir":dir});
			},dir));
			this.bidi_gui_dir.dropDown.addChild(item);
		}
		this.bidi_text_dir.dropDown = new dijit.Menu({baseClass: "chartdropmenu","class":"lotusActionMenu", dir: dirAttr});
		//dojo.style(this.bidi_text_dir.titleNode,"width", "90px");

		for(var i=0;i<this.bidiTextDirArr.length;i++)
		{
			var dir = this.bidiTextDirArr[i];
			var item = new dijit.MenuItem({label:this.nls[dir], dir: dirAttr});
			this.connect(item,"onClick", dojo.hitch(this,function(dir)
			{
				this.bidi_text_dir.setLabel(this.nls[dir]);
				var bidi = this.allChanges.bidi;
				if(!bidi)
					bidi = this.allChanges.bidi = {};
				bidi.textDir = dir;
				
				this.onTextDirChange(dir);
			},dir));
			this.bidi_text_dir.dropDown.addChild(item);
		}
		this.connect(this.chart_title,"onKeyUp", dojo.hitch(this, function(key, value)
		{
			var textDir = this.getBidiTextDir();
			dojo.attr(this.chart_title.content, "dir", (textDir == 'auto' ? BidiUtils.calculateDirForContextual(this.chart_title.content.value) : textDir)); 
		}));
	},
	
	
	setState: function(chart, allChanges)
	{
		this.chartModel = chart;
		this.allChanges = allChanges;
		
		var plots = chart.plotArea.plots;
		if(plots.length==1 && this._defaultSettings.supportedTypes[plots[0].type]=="pie")
			dojo.style(this.plot_fill_section,"display","none");
		else
			dojo.style(this.plot_fill_section,"display","");
		
		var txPr = chart.textPro;
		if(!txPr)
			txPr = {};
		
		var fontName = concord.chart.utils.Utils.escapeHTMLTag(txPr.latin);
		this.chart_font.setLabel(fontName || "Arial");
		
		var title = {};
		title.textPro = dojo.mixin({sz:18},txPr); //Use chart font
		if(chart.title)
		{
			title.text = chart.title.text;
			dojo.mixin(title.textPro, chart.title.textPro);
		}
		this.chart_title.setState(title);
		
		var legend = chart.legend;
		var legendTxPr = dojo.mixin({},txPr);
		if(!legend)
		{
			this.legend_place.setLabel(this.nls.n);
		}
		else
		{
			var pos = legend.legendPos;
			this.legend_place.setLabel(this.nls[pos] || this.nls.n);
			dojo.mixin(legendTxPr,legend.txPr);
		}
		this.legend_font.setState(!!legendTxPr.b,!!legendTxPr.i,legendTxPr.sz || 10, legendTxPr.color || "", legendTxPr.latin);
		
		var spPr = chart.graphPro;
		if(spPr)
		{
			var fill = concord.chart.utils.Utils.getFill(spPr);
			this.chart_fill_color.setColor(fill);
			if(spPr.ln)
				this.chart_border.setState(spPr.ln);
			else
				this.chart_border.reset();
		}
		else
		{
			this.chart_fill_color.setColor("");
			this.chart_border.reset();
		}
		
		var plotSpPr = chart.plotArea.graphPro;
		if(plotSpPr)
		{
			var fill = concord.chart.utils.Utils.getFill(plotSpPr);
			this.plot_fill_color.setColor(fill);
		}
		else
			this.plot_fill_color.setColor("");
		if (!BidiUtils.isBidiOn())
			return;
		var bidiGuiDir = chart.bidi.dir;
		if(!bidiGuiDir)
		{
			this.bidi_gui_dir.setLabel(this.nls[this.bidiGuiDirArr[0]]);
		}
		else
		{
			this.bidi_gui_dir.setLabel(this.nls[bidiGuiDir]);
		}
		var bidiTxtDir = chart.bidi.textDir;
		if(!bidiTxtDir)
		{
			this.bidi_text_dir.setLabel(this.nls[this.bidiTextDirArr[0]]);
		}
		else
		{
			this.bidi_text_dir.setLabel(this.nls[bidiTxtDir]);
		}
		if (bidiTxtDir == 'auto')
			dojo.attr(this.chart_title.content, "dir", BidiUtils.calculateDirForContextual(this.chart_title.content.value)); 
		else
			dojo.attr(this.chart_title.content, "dir", bidiTxtDir ? bidiTxtDir : "ltr");
	},
	
	reset: function()
	{
	},
	
	getBidiTextDir :function(){
		if (!this.bidiTextDir)
			this.bidiTextDir = this.chartModel.bidi.textDir;
		return this.bidiTextDir;
	},
	setBidiTextDir : function (dir){
		this.bidiTextDir = dir;
	}
	
});