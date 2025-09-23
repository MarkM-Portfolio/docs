dojo.provide("concord.chart.dialogs.ChartPropDlg");
dojo.require("concord.widgets.concordDialog");
dojo.require("concord.chart.widget.DropDownButton");
dojo.require("dijit.layout.ContentPane");
dojo.require("concord.chart.widget.TabContainer");
dojo.require("concord.chart.widget.Section");
dojo.require("concord.chart.widget.ChartSection");
dojo.require("concord.chart.widget.AxisSection");
dojo.require("concord.chart.widget.SeriesSection");
dojo.require("concord.chart.widget.DataSeries");
dojo.require("concord.util.BidiUtils");
dojo.require("concord.chart.config.DefaultSettings");
dojo.require("concord.chart.controller.Chart");

dojo.requireLocalization("concord.chart.dialogs","ChartPropDlg");

dojo.declare("concord.chart.dialogs.ChartPropDlg",[concord.widgets.concordDialog],{
	
	nls:null,	
	changedProps: null,
	chart: null,
	_defaultSettings: concord.chart.config.DefaultSettings,
	_nonSeries: false,
	
	unfoldSection: null,  //Map, record unfold section per chart
	
	constructor: function() {	
		this.dialog.attr("title", this.concordTitle);	
		this.inherited( arguments );
		this.unfoldSection = {};
	},
	
	hideDropDownMenu: function()
	{
		var nodes = dojo.query(".dijitDropDownButton", this.containerNode);
		dojo.forEach(nodes, function(n){
			var widget = dijit.byNode(n);
			if(widget && widget._opened && widget.closeDropDown)
				widget.closeDropDown();
		});
	},
	
	createContent: function (contentDiv) {		
		this.nls = dojo.i18n.getLocalization("concord.chart.dialogs","ChartPropDlg");
		
		var dir = BidiUtils.isGuiRtl() ? "rtl" : "ltr";
		
		this.tabContanierDiv = new concord.chart.widget.TabContainer();
		this.tabContanierDiv.placeAt(contentDiv, "first");
		dijit.setWaiState(this.tabContanierDiv.domNode,"label",this.nls.properties);
		this.tabContanierDiv.tablist.set("lang",g_locale || "en-US");//For ACC PRT check
		this.tabContanierDiv.tablist.set("dir",dir);//For ACC PRT check
		
		this.proTab = new dijit.layout.ContentPane({title : this.nls.properties,dir:dir});
		this.proTab.placeAt(this.tabContanierDiv.containerNode);
		this.proTab.set("lang",g_locale || "en-US");//For ACC PRT check
		dijit.setWaiState(this.proTab.domNode,"label",this.nls.properties);
		
		var proTab = this.proTab.containerNode;
		
		this.dataTab = new dijit.layout.ContentPane({title : this.nls.data,dir:dir});
		this.dataTab.placeAt(this.tabContanierDiv.containerNode);
		this.dataTab.set("lang",g_locale || "en-US");//For ACC PRT check
		dijit.setWaiState(this.dataTab.domNode,"label",this.nls.data);
		
		var tabs = [this.proTab, this.dataTab];
		dojo.forEach(tabs, dojo.hitch(this, function(tab){
			var node = tab.domNode;
			dojo.connect(node, "onscroll", this.hideDropDownMenu);
		}));
		
		var proDiv = dojo.create("div",null,proTab);
		var leftCol_pro = dojo.create("div",{'class':'leftcol',tabindex:-1},proDiv);
		var rightCol_pro = dojo.create("div",{'class':'rightcol',id:"pro_chart_preview"},proDiv);
		
		this.chartSectionDiv = new concord.chart.widget.Section({title : this.nls.chart});
		this.chartSectionDiv.placeAt(leftCol_pro);
		this.chartSection = new concord.chart.widget.ChartSection();
		this.chartSection.placeAt(this.chartSectionDiv.containerNode);
		
		dojo.connect(this.chartSection,"onChange", dojo.hitch(this,function(key,value)
		{
			var setting = {};
			setting[key] = value;
			this.previewChart.set(setting);
			this.previewChart.render();
		}));
		
		dojo.connect(this.chartSection,"onSubmit", dojo.hitch(this,function()
		{
			this._onOk();
		}));
				
		this.axisSectionDiv = new concord.chart.widget.Section({title : this.nls.axis});
		this.axisSectionDiv.placeAt(leftCol_pro);
		this.axisSection = new concord.chart.widget.AxisSection();
		this.axisSection.placeAt(this.axisSectionDiv.containerNode);
		
		dojo.connect(this.axisSection,"onChange", dojo.hitch(this, function(axisId,key,value)
		{
			if(this.axisSection.errorCode==0)
				this.setWarningMsg("");
			
			var setting = {axis:{}};
			setting.axis[axisId] = {};
			setting.axis[axisId][key] = value;
			this.previewChart.set(setting);
			this.previewChart.render();
			
		}));
		dojo.connect(this.axisSection,"onSubmit", dojo.hitch(this,function()
		{
			this._onOk();
		}));
		
		this.seriesSectionDiv = new concord.chart.widget.Section({title : this.nls.series});
		this.seriesSectionDiv.placeAt(leftCol_pro);
		this.seriesSection = concord.chart.widget.SeriesSection();
		this.seriesSection.container = this.seriesSectionDiv;
		
		this.seriesSection.placeAt(this.seriesSectionDiv.containerNode);
		
		this.seriesSection.connect(this.seriesSectionDiv,"onExpand","show");
		dojo.connect(this.seriesSection,"onChange", dojo.hitch(this, function(seriesId,key,value)
		{
			var setting = {series:{}};
			setting.series[seriesId] = {};
			setting.series[seriesId][key] = value;
			this.previewChart.set(setting);
			this.previewChart.render();
			
		}));
		
		var dataDiv = dojo.create("div",null,this.dataTab.containerNode);
		var leftCol_data = dojo.create("div",{'class':'leftcol'},dataDiv);
		var rightCol_data = dojo.create("div",{'class':'rightcol',id:"data_chart_preview"},dataDiv);
		
		this.dataSeries = new concord.chart.widget.DataSeries();
		this.dataSeries.placeAt(leftCol_data);
		dojo.connect(this.dataTab,"onShow", dojo.hitch(this,function()
		{
			if(this.axisSection.errorCode)
				setTimeout(dojo.hitch(this,function(){
					this.tabContanierDiv.selectChild(this.proTab);
					this._showAxisSection();
				}));
			else{
				this._toMode();
				this.dataSeries.reset();
				dojo.byId("data_chart_preview").appendChild(dojo.byId("preview_chart"));
			}
		}));
		
        var msgDiv = dojo.byId(this.warnMsgID + this.dialogId);
        leftCol_data.appendChild(msgDiv);
		
		dojo.connect(this.dataTab,"onHide", dojo.hitch(this,function()
		{
			this._toModeless();
		}));
		
		dojo.connect(this.dataSeries,"onChange", dojo.hitch(this,function(setting)
		{
			this.previewChart.set(setting);
			this.previewChart.render();
		}));
		
		dojo.connect(this.proTab,"onShow", dojo.hitch(this,function()
		{
			if(this.dataSeries.errorCode)
				setTimeout(dojo.hitch(this,function(){
					this.tabContanierDiv.selectChild(this.dataTab);
				}));
			else
				dojo.byId("pro_chart_preview").appendChild(dojo.byId("preview_chart"));
		}));
		
		dojo.create("div",{'class':'chartPreview',id:'preview_chart'},rightCol_pro);
		if(dir == "rtl")
			dojo.style(dojo.byId("preview_chart"), "direction", "ltr");;
	},
	
	_showAxisSection:function()
	{
		this.chartSectionDiv.reset();
		this.axisSectionDiv.expand();
		this.seriesSectionDiv.reset();
	},
	
	postCreate: function()
	{
		this.inherited(arguments);
		var dialog = dojo.byId(this.dialogId);
		dojo.addClass(dialog, "lotusTabDialog");
		
		dojo.connect(this.dataSeries, "onKeypress", dojo.hitch(this,this.onKeyPress));
		dojo.connect(this.chartSection, "onTextDirChange", dojo.hitch(this,function(dir)
		{		
				this.chartSection.setBidiTextDir(dir);
				this.dataSeries.onTextDirChange(dir);
				this.axisSection.onTextDirChange(dir);
				this.seriesSection.onTextDirChange(dir);
		}));
		
		dojo.style(this.tabContanierDiv.domNode, {"width" : "788px", "height" : "390px"});
	},
	
	onKeyPress: function (e, hideWarning) {
		if (e.keyCode == dojo.keys.ENTER) {
			if(this.getOkBtn()){
				//move focus out input, or get its value should be old value
				this.getOkBtn().focus();
			}			
		}
		if(hideWarning)
			this.inherited(arguments);
		var hdl = this.params.hdl;
		if(hdl.hideRangeViewer)
			hdl.hideRangeViewer();
	},
	
	highlightAddress: function(address)
	{
		if(this.dialog._isShown()){
			var hdl = this.params.hdl;
			if(hdl.highLightAddress)
				hdl.highLightAddress(address, true);
		}
	},
	
	_toMode: function()
	{
		if(dijit._underlay)
			dijit._underlay.domNode.style.display = 'none';
		this.handle1 = dojo.connect(this.dialog, "layout", function() {
			if(dijit._underlay)
				dijit._underlay.domNode.style.display = 'none';
		});
		this.handle2 = dojo.connect(this.dialog, "show", function() {
			if(dijit._underlay)
				dijit._underlay.domNode.style.display = 'none';
		});
	},
	
	_toModeless: function ()
	{
		if(this.dialog._isShown()){
			if(dijit._underlay)
				dijit._underlay.domNode.style.display = "block";
			dojo.disconnect(this.handle1);
			dojo.disconnect(this.handle2);
		}
		
		var hdl = this.params.hdl;
		if(hdl.hideRangeViewer)
			hdl.hideRangeViewer();
	},
	
	show: function(){
		if (!this.modal_wrapper) {
			dijit.DialogUnderlay.show();
			dijit.DialogUnderlay.hide();
			var self = this;
			self.modal_wrapper = dojo.aspect.after(dijit._underlay, "layout", function () {
				if (self.tabContanierDiv.selectedChildWidget == self.dataTab) {
					dijit._underlay.domNode.style.display = 'none';
				} else {
					dijit._underlay.domNode.style.display = 'block';
				}
			});
		}
		this.inherited(arguments);
		if(dijit._underlay)
			dijit._underlay.domNode.style.display = "block";
		dojo.disconnect(this.handle1);
		dojo.disconnect(this.handle2);
		
		//Start: Open last opened section per chart
		var unfold = this.unfoldSection[this.chart._id];
		if(!unfold)
			unfold = 1;
		
		switch(unfold)
		{
		case 1:
			this.chartSectionDiv.expand();
			this.axisSectionDiv.reset();
			this.seriesSectionDiv.reset();
			break;
		case 2:
			this.chartSectionDiv.reset();
			this.axisSectionDiv.expand();
			this.seriesSectionDiv.reset();
			break;
		case 3:
			this.chartSectionDiv.reset();
			this.axisSectionDiv.reset();
			this.seriesSectionDiv.expand();
			break;
		}
		//end
		
		if(this._nonSeries){
			this.dataTab.set("disabled",true);
			this.dataTab.controlButton.set("disabled",true);
		}
		else{
			this.dataTab.set("disabled",false);
			this.dataTab.controlButton.set("disabled",false);
		}
		
		this.tabContanierDiv.selectChild(this.proTab);
		
		setTimeout(dojo.hitch(this,function()
		{
			if(!this.previewChart.hasView())
	   		{
				var chartNode =  dojo.byId("preview_chart");
				this.previewChart.setNode(chartNode);
	   		}
			this.previewChart.render();
		}),0);
	},
	
	hide: function()
	{
		this.inherited(arguments);
		this.previewChart && this.previewChart.destroy();
		if(!this.axisSectionDiv.isHidden())
			this.unfoldSection[this.chart._id] = 2;
		else if(!this.seriesSectionDiv.isHidden())
			this.unfoldSection[this.chart._id] = 3;
		else
			this.unfoldSection[this.chart._id] = 1;
		var hdl = this.params.hdl;
		//removed the data source highlight when hide. may show it again when chart selected, no need to show if chart has already been hidden, make sure the highlight will be released
		if(hdl.unHighLightDataSource && this.chart)
			hdl.unHighLightDataSource(this.chart._id);
	},
	
	setState: function(state)
	{
		this.changedProps = {};
		this.chart = state.chart;
		this.previewChart = state.previewChart;
		
		var diagram = this.chart._diagram;
		var plots = diagram.plotArea.plots;
		//pie chart has no axis, so hide axis section
		if(plots.length==1 && this._defaultSettings.supportedTypes[plots[0].type]=="pie")
			this.axisSectionDiv.domNode.style.display = 'none';
		else
			this.axisSectionDiv.domNode.style.display = '';
		
		this.chartSection.setState(diagram,this.changedProps);
		if (BidiUtils.isBidiOn())
			this.updateBidiTextDir (diagram.bidi.textDir);
		this.axisSection.setState(diagram.plotArea.axisList,this.changedProps);
		if(!this.seriesSection.setState(this.chart,this.changedProps))
			dojo.style(this.seriesSectionDiv.domNode,"display","none");
		else{
			dojo.style(this.seriesSectionDiv.domNode,"display","");
		}
		if(!this.dataSeries.setState(this.chart,this.changedProps, this))
			this._nonSeries = true;
		else
			this._nonSeries = false;
		
	},
	
	setDialogID: function() {
		this.dialogId = "S_d_ChartProp";
	},
	
	updateAddress: function(address){
		this.dataSeries.updateAddress(address);
	},
	
	applyAddressOnMouseUp: function(){
		this.dataSeries.applyAddressOnMouseUp();
	},
	
	_preClose: function(){
		if (this.modal_wrapper) {
			this.modal_wrapper.remove();
			this.modal_wrapper = null;
		}
		var hdl = this.params.hdl;
		if(hdl.preCloseDlg)
			hdl.preCloseDlg(true, this.chart);
	},
	
	onOk: function ()
	{	
		if(this.dataSeries.errorCode != 0){
			this.dataSeries.reset();
			return false;
		}
		if(this.axisSection.errorCode!=0)
		{
			this._showAxisSection();
			return false;
		}
		
		var hasChanged = false;
		for(var id in this.changedProps)
		{
			hasChanged = true;
			break;
		}
		if(hasChanged)
		{
			var callback = this.params.callback;
			if(callback!=null)
				callback(this.chart._id, this.changedProps);
		}
		this._preClose();
		return true;
	},
	
	onCancel: function (editor) {
		 if(this.getCancelBtn())
			//move focus out input, or get its value should be old value
			this.getCancelBtn().focus();
		 this._preClose();
	},
	updateBidiTextDir : function(dir){
		this.axisSection.setBidiTextDir (dir);
		this.dataSeries.setBidiTextDir (dir);
		this.seriesSection.setBidiTextDir (dir);
	}
});