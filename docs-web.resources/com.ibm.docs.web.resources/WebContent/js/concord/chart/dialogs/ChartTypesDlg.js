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

dojo.provide("concord.chart.dialogs.ChartTypesDlg");
dojo.require("dijit.form.MultiSelect");
dojo.require("concord.widgets.concordDialog");
dojo.require("concord.chart.config.DefaultSettings");
dojo.require("concord.chart.widget.DataRange");
dojo.require("dijit.layout.ContentPane");
dojo.require("concord.chart.widget.TabContainer");
dojo.require("concord.util.BidiUtils");
dojo.requireLocalization("concord.chart.dialogs","ChartTypesDlg");

dojo.declare("concord.chart.dialogs.ChartTypesDlg",[concord.widgets.concordDialog],{
	
	categoryDivList: [],
	detailTypeDivList: [],
	
	_chartCategory :   null,
	_chartDetailType : null,
	
    _chartDetailTypeCSS : [
	                       ["clusteredColumn","stackedColumn"],
	                       ["clusteredBar","stackedBar"],
	                       ["pie_basic"],
	                       ["area","stackedArea"],
	                       ["line","stackedLine","line_marker", "stackedLine_marker"],
	                       ["scatter_marker","scatter_smooth_line_marker","scatter_smooth_line", "scatter_straight_line_marker","scatter_straight_line"]
                        ],
    _chartCategoryCSS: ["columnChartThumbIcon","barChartThumbIcon","PieChartThumbIcon","AreaChartThumbIcon","LineChartThumbIcon","ScatterChartThumbIcon"],
   
    _isOK: false,
	_selCateory: 0,
	_selDetailType : 0,	
	_selectedDetailTypeDiv : null,
	defaultSettings: concord.chart.config.DefaultSettings,
	
	constructor: function() 
	{
		this._toMode();
	},
	
	createContent: function (contentDiv) 
	{	
		var nls = this.nls = dojo.i18n.getLocalization("concord.chart.dialogs","ChartTypesDlg");
		this._chartCategory = [nls.COLUMN,nls.BAR,nls.PIE,nls.AREA,nls.LINE,nls.SCATTER];
		
		var dir = BidiUtils.isGuiRtl() ? "rtl" : "ltr";
		
		this.tabContanierDiv = new concord.chart.widget.TabContainer();
		this.tabContanierDiv.placeAt(contentDiv, "first");
		dijit.setWaiState(this.tabContanierDiv.domNode,"label",nls.CHART_TYPES);
		
		this.tabContanierDiv.tablist.set("lang",g_locale || "en-US");//For ACC PRT check
		this.tabContanierDiv.tablist.set("dir",dir);//For ACC PRT check
		
		this.typeTab = new dijit.layout.ContentPane({title : nls.CHART_TYPES,dir:dir});
		this.typeTab.placeAt(this.tabContanierDiv.containerNode);
		this.typeTab.set("lang",g_locale || "en-US");//For ACC PRT check
		dijit.setWaiState(this.typeTab.domNode,"label",nls.CHART_TYPES);
		
		this.dataTab = new dijit.layout.ContentPane({title : nls.DATA,dir:dir});
		this.dataTab.placeAt(this.tabContanierDiv.containerNode);
		this.dataTab.set("lang",g_locale || "en-US");//For ACC PRT check
		dijit.setWaiState(this.dataTab.domNode,"label",nls.DATA);
		
		this._chartDetailType = 
           [
               [nls.CLUSTERED_COLUMN,nls.STACKED_COLUMN],
               [nls.CLUSTERED_BAR,nls.STACKED_BAR],
               [nls.PIE],
               [nls.AREA,nls.STACKED_AREA],
               [nls.LINE,nls.STACKED_LINE,nls.MAKER_LINE, nls.STACKED_MARKER_LINE],
               [nls.SCATTER_MARKER_ONLY,nls.SCATTER_MARKER_LINE_S,nls.SCATTER_LINE_S, nls.SCATTER_MARKER_LINE_X,nls.SCATTER_LINE_X]
           ];
		
		var chartDetailDiv = this.chartDetailDiv = dojo.create('div',null,this.typeTab.containerNode);
		dojo.addClass(chartDetailDiv,"chartWizardDetailDiv");
		dojo.connect(chartDetailDiv,"onkeydown",dojo.hitch(this,"_onKeyPress"));
		dojo.attr(chartDetailDiv, "tabindex", -1);
		
		if(dojo.isIE)
			chartDetailDiv.style.visibility = "hidden";
	    
	    var tabindex = 1;
	    for(var i=0;i<this._chartDetailType.length;i++)
	    {
	    	var len = this._chartDetailType[i].length;
	    	var divs = [];
	    	for(var j=0;j<len;j++)
	    	{
	    		var align = BidiUtils.isGuiRtl() ? 'right' : 'left';
	    		var clazz = "childTypeItemDiv " + this._chartDetailTypeCSS[i][j];
	    		var info = this._chartDetailType[i][j];
				var childType = dojo.create('div',{style:{"float":align}, className: clazz, title:info, tabIndex:0},chartDetailDiv);
				var txtSpan = dojo.create('span',{innerHTML:info,className: "itemVisible dijitDisplayNone"},childType);
				if(i!=1 && j==0)
					childType.style.clear = align;
				dijit.setWaiRole(childType,"button");
				dijit.setWaiState(childType,"label",info);
				divs.push(childType);
				dojo.connect(childType,"onclick", dojo.hitch(this, "onclickDetailType", childType,i,j));
				dojo.connect(childType,"focus", dojo.hitch(this, "onclickDetailType", childType,i,j));
				dojo.connect(childType,"ondblclick", dojo.hitch(this, "onDblclick"));
				dojo.connect(childType,"onmouseover", dojo.hitch(this, "onOverDetailType", childType));
				dojo.connect(childType,"onmouseout", dojo.hitch(this, "onOutDetailType", childType));
	    	}
	    	this.detailTypeDivList.push(divs);
	    }
	    
	    this.dataRange = new concord.chart.widget.DataRange();
	    this.dataRange.placeAt(this.dataTab.containerNode);
	    
	    dojo.connect(this.dataTab,"onShow", dojo.hitch(this,function()
		{
			this.dataRange.onShow();
			
			if(this.previewChart==null)
				this._createPreview();
			if(this.previewChart)
			    setTimeout(dojo.hitch(this,function(){this.previewChart.render();}),100);
			
		}));
	    dojo.connect(this.typeTab,"onShow", dojo.hitch(this,function()
		{
	    	if(this._fadingIn) return;//it has not been complete shown out yet (in animation), do not 'click' on this.
	    	this.onclickDetailType(this.detailTypeDivList[this._selCateory][this._selDetailType], this._selCateory, this._selDetailType);
		}));
	},
	
	_createPreview: function()
	{
		var chartInfo = this.defaultSettings.getChartTypeSetting(this._selCateory,this._selDetailType);
		var data = this.dataRange.getState();
		
		//If the data in the selected range is not loaded, the chart can't be created directly.
		//ChartHandler will publish a event when the data is ready, then create the chart again.
		data.reqId = dojox.uuid.generateRandomUuid();
		this.subscribeHdl = dojo.subscribe(data.reqId,dojo.hitch(this,function()
		{
			if(this.dataTab.selected)
			{
				this._createPreview();
				this.previewChart && this.previewChart.render();
			}
		}));
		var res =  this.params.hdl.createChart(chartInfo, data);
		var okBtn = this.getOkBtn();
		okBtn.setDisabled(!!res.err);
		switch(res.err)
		{
		case 1: //Data is loading
			return false;
		case 2: //invalidate data range
			this.setWarningMsg(this.nls.ERROR_INVALID_RANGE);
			dijit.setWaiState(this.dataRange.range, "invalid", true);
			return false;
		case 3: //Too many data points
			this.setWarningMsg(dojo.string.substitute(this.nls.TOO_MANY_POINTS, [this.defaultSettings.dataPointsLimit]));
			dijit.setWaiState(this.dataRange.range, "invalid", true);
			return false;
		}
		this.previewChart = res.chart;
		var chartNode =  dojo.byId("insert_chart_preview");
		if (BidiUtils.isGuiRtl())
			dojo.style(chartNode, "direction", "ltr");

		this.previewChart.setNode(chartNode);
		this._previewCat = this._selCateory;
		this._previewDetail = this._selDetailType;
		if(this.subscribeHdl)
		{
			dojo.unsubscribe(this.subscribeHdl);
			this.subscribeHdl = null;
		}
			
		this.setWarningMsg("");
		return true;
	},
	
	onKeyPress: function (e) {
		if (e.keyCode == dojo.keys.ENTER){
			if(this.getOkBtn())
				//move focus out input, or get its value should be old value
				this.getOkBtn().focus();
		}
		this.inherited(arguments);
		var hdl = this.params.hdl;
		if(hdl.hideRangeViewer)
			hdl.hideRangeViewer();
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
	
	//The chart data source is changed by the editor. Only the data in the data source input box content will be changed
	updateAddress: function(address){
		this.dataRange.setState(address);
		this._reset();
	},
	
	//Preview chart will apply the new data source range when this function is called
	applyAddress: function(){
		this.dataRange.applyAddress();
	},
	
	setDialogID: function() {
		this.dialogId ="S_d_select_chart_style";
	},
	
	postCreate: function()
	{
		var dialog = dojo.byId(this.dialogId);
		dojo.addClass(dialog, "lotusTabDialog");
		
		dojo.connect(this.dataRange, "onKeypress", dojo.hitch(this,this.onKeyPress));
		dojo.connect(this.dataRange, "onChange", dojo.hitch(this, function(key,value)
		{
			this.getOkBtn().setDisabled(false);
			
			if(this.dialog._isShown() && key=="ref"){
				var hdl = this.params.hdl;
				if(hdl.highLightAddress)
					hdl.highLightAddress(value, true);
			}
			//If there is any change, destroy the old preview chart
			if(this.previewChart!=null)
			{
				this.previewChart.destroy();
				this.previewChart = null;
			}
			//Only render the chart when the dataRange tab is shown
			if(this.dataTab.selected)
			{
				this._createPreview();
				this.previewChart && this.previewChart.render();
			}
			
		}));
		
		var msgId = this.warnMsgID + this.dialogId;
        var msgDiv = dojo.byId(msgId);
        dojo.style(msgDiv, {"paddingLeft":"20px", "width":"340px", "wordWrap": "break-word"});
	},
	
	onclickDetailType: function(childType, categoryIdx, detailIdx)
	{
		if(this._selectedDetailTypeDiv!=null)
			dojo.removeClass(this._selectedDetailTypeDiv,"itemSelected");
		dojo.addClass(childType,"itemSelected");
		
		childType.focus();
		this._selectedDetailTypeDiv = childType;
		if(this._selCateory!=categoryIdx || this._selDetailType!=detailIdx)
		{
			this.setWarningMsg("");
			this.getOkBtn().setDisabled(false);
			this._selCateory = categoryIdx;
			this._selDetailType = detailIdx;
			
			//If chart type is changed, old preview chart will be destroyed 
			if(this.previewChart!=null)
			{
				this.previewChart.destroy();
				this.previewChart = null;
			}
		}
	},
	
	onDblclick: function()
	{
		var ret = this.onOk();
		if(ret)
			this.hide();
	},
	
	_onKeyPress: function(e)
	{
		if (e.altKey || e.ctrlKey || e.metaKey)
			return;
		
		var changed = false;
		var dk = dojo.keys;
		switch(e.keyCode)
		{
		case dk.LEFT_ARROW:
			if(this._selDetailType==0)
			{
				if(this._selCateory>0)
				{
					this._selCateory--;
					this._selDetailType = this._chartDetailType[this._selCateory].length - 1;
				}
			}
			else
				this._selDetailType--;
			changed = true;
			break;
		case dk.RIGHT_ARROW:
			if(this._selDetailType==this._chartDetailType[this._selCateory].length - 1)
			{
				if(this._selCateory<this._chartDetailType.length-1)
				{
					this._selCateory++;
					this._selDetailType = 0;
				}
			}
			else
				this._selDetailType++;
			changed = true;
			break;
		case dk.UP_ARROW:
			if(this._selCateory>1)
			{
				if(this._selCateory==2)
					this._selCateory = 0;
				else
					this._selCateory--;
				var len = this._chartDetailType[this._selCateory].length; 
				if(this._selDetailType>=len)
					this._selDetailType = len - 1;
				changed = true;
			}
			dojo.stopEvent(e);
			break;
		case dk.DOWN_ARROW:
			if(this._selCateory<this._chartDetailType.length-1)
			{
				if(this._selCateory==0)
					this._selCateory+=2;
				else
					this._selCateory++;
				var len = this._chartDetailType[this._selCateory].length; 
				if(this._selDetailType>=len)
					this._selDetailType = len - 1;
				changed = true;
			}
			dojo.stopEvent(e);
			break;
		case dk.ENTER:
		case dk.SPACE:
			{
			    this._onOk(this.editor);
			    return;
			}
		}
		if(changed)
			this.onclickDetailType(this.detailTypeDivList[this._selCateory][this._selDetailType], this._selCateory, this._selDetailType);
	},
	
	onOverDetailType: function(childType)
	{
		dojo.addClass(childType,"itemHovered");
	},
	
	onOutDetailType: function(childType)
	{
		dojo.removeClass(childType,"itemHovered");
	},
	
	show: function(){
		dojo.style(this.okBtn.domNode, "display", "");
		if (!this.modal_wrapper) {
			dijit.DialogUnderlay.show();
			dijit.DialogUnderlay.hide();
			var self = this;
			self.modal_wrapper = dojo.aspect.after(dijit._underlay, "layout", function () {
				if (self.dialog.open) {
					dijit._underlay.domNode.style.display = 'none';
				}
			});
		}
		var promise = this.inherited(arguments);
		this.tabContanierDiv.selectChild(this.typeTab);
		this._isOK = false;
		
		var s = this.chartDetailDiv.style;
		//screen will tremble when this dialog is first loaded on IE
		if(s.visibility=="hidden")
		{
			setTimeout(function(){s.visibility = "visible";},0);
		}
		this.dataRange.reset();
		
		setTimeout(dojo.hitch(this, "onclickDetailType", this.detailTypeDivList[0][0], 0, 0), 300);
		return promise;
	},
	
	hide: function()
	{
		this.inherited(arguments);
		if(this.previewChart!=null)
			this.previewChart.destroy();
		this.previewChart = null;
	},
	
	disable: function(disable)
	{
		if(disable)
			dojo.style(this.okBtn.domNode, "display", "none");
		else
			dojo.style(this.okBtn.domNode, "display", "");
	},
	
	returnFocus : function(){
		if(!this._isOK)
			this.inherited(arguments);
	},
	
	_preClose: function(){
		if (this.modal_wrapper) {
			this.modal_wrapper.remove();
			this.modal_wrapper = null;
		}
		var hdl = this.params.hdl;
		if(hdl.preCloseDlg)
			hdl.preCloseDlg();
	},
	
	onOk: function () 
	{
		if(!this.previewChart || this._previewCat != this._selCateory || this._previewDetail != this._selDetailType)
		{
			if(this.previewChart!=null)
			{
				this.previewChart.destroy();
				this.previewChart = null;
			}
			this._createPreview();
		}
		if(!this.previewChart) return false;
		this._isOK = true;
		var callback = this.params.callback;
		callback && callback(this.previewChart);
		
		this._preClose();
		dijit.setWaiState(this.dataRange.range, "invalid", false);
		return true;
	},
	
	onCancel: function (editor) {
		 if(this.getCancelBtn())
			//move focus out input, or get its value should be old value
			this.getCancelBtn().focus();
		 this._preClose();
	}
	
});