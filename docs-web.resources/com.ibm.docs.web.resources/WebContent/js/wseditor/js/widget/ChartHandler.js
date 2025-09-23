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

dojo.provide("websheet.widget.ChartHandler");

dojo.require("websheet.widget.ChartDiv");
dojo.require("websheet.model.chart.Chart");
dojo.require("websheet.model.chart.DataProvider");
dojo.require("websheet.Constant");
dojo.requireLocalization("websheet.widget","ChartHandler");

dojo.declare("websheet.widget.ChartHandler", websheet.widget.DrawFrameHandler, {

	_document: null,
	
	chartTypesDlg: null,
	chartPropsDlg: null,
	
	_dataProvider: null,
	
	_defaultWidth: 500,
	_defaultHeight: 300,
	
	_nls: null,
	
	_focusedChart: null,//the chart id which is cached in _highlightmap
	_isHighLighting: false,//whether the chart is high lighting.
	_dirtyCharts: {}, // the list of charts that is dirty or should be resized
	
	constructor: function(editor)
	{
		this.usage =  websheet.Constant.RangeUsage.CHART;
		this._document = editor.getDocumentObj();
		this._nls = dojo.i18n.getLocalization("websheet.widget","ChartHandler");
		this._highlightProvider = editor.getController().getHighlightProvider();
		this._highlightMap =  {};
		editor.getCurrentGrid().selection.picker().subscribe(this);
		this.startListening(editor.getController());
	},
	
	showCreateChartDlg: function(){
		var dlg = this.getChartTypesDlg();
		
		this.editor.enableUI(true);
		dlg.params = {callback:dojo.hitch(this, "generateChart"), hdl: this};
		var grid = this.editor.getCurrentGrid();
		dojo.publish("RangePickingStart", [{grid : grid}]);
		var sheetName = grid.getSheetName();
		var selector = grid.selection.selector();
		currAddress = selector.getSelectedRangeAddress(false, true);
		var rangeAddr = websheet.Utils.getRangeAddr4Chart(currAddress);
		dlg.updateAddress(rangeAddr);
		this.highLightAddress(rangeAddr);
		dlg._fadingIn = true;
		dlg.show().then(function(){dlg._fadingIn = false;});
	},
	
	chartProperties: function(chartId)
	{
		var dlg = this.getChartPropsDlg();
		var selChart = null;
		if(chartId)
			selChart = this._document._charts[chartId];
		else{
			var chartRange = null;
			var chartRanges = this.getSelectedDrawFramesInCurrSheet();
			for(var i=0;i<chartRanges.length;i++)
			{
				chartRange = chartRanges[i];
				selChart = this._document._charts[chartRange.getId()];
				break; //Only get first selected chart
			}
		}
		
		if(selChart==null || !selChart.hasView())
			return;
		
		var previewChart = new websheet.model.chart.Chart("preview_chart",this._document);
		previewChart.attachDataProvider(selChart.getDataProvider());
		previewChart.loadFromJson(selChart.toJson());
		
		var state = {};
		state.chart = selChart;
		state.previewChart = previewChart;
		
		this.editor.enableUI(true);
		dlg.params = {callback:dojo.hitch(this, "setProperties"), hdl: this};
		dlg.setState(state);
		dlg.show();
	},
	
	isSupported: function(chartId)
	{
		var chart = this._document._charts[chartId];
		if(chart==null || !chart.hasView())
			return false;
		return true;
	},
	
	getChartTypesDlg: function()
	{
		dojo["require"]("concord.concord_sheet_widgets");
		dojo["require"]("concord.concord_sheet_extras");
		
		if(this.chartTypesDlg==null)
			this.chartTypesDlg = new concord.chart.dialogs.ChartTypesDlg(this.editor,this._nls.CHART_TYPE_DLG_TITLE);
		return this.chartTypesDlg;
	},
	
	getChartPropsDlg: function()
	{
		dojo["require"]("concord.concord_sheet_widgets");
		if(this.chartPropsDlg==null)
			this.chartPropsDlg = new concord.chart.dialogs.ChartPropDlg(this.editor,this._nls.CHART_PROP_DLG_TITLE);
		
		return this.chartPropsDlg;
	},
	
	disableInsertChart: function(sheetName)
	{
		if(this.chartTypesDlg && this.chartTypesDlg.dialog && this.chartTypesDlg.dialog._isShown()){
			var sheet = this._document.getSheet(sheetName);
			this.chartTypesDlg.disable(sheet.isProtected());
		}
		return;
	},
	
	//Called by syncCellInputWithRangePicker of rangepicker.
	updateCurrAddress: function(address){
		this._highlightProvider.removeHighlight(this._currentHighlight);
		if(this.chartTypesDlg && this.chartTypesDlg.dialog && this.chartTypesDlg.dialog._isShown())
		{
			this.chartTypesDlg.updateAddress(address);
			this.highLightAddress(address);
		}
		else if(this.chartPropsDlg && this.chartPropsDlg.dialog && this.chartPropsDlg.dialog._isShown())
		{
			this.chartPropsDlg.updateAddress(address);
			this.highLightAddress(address);
		}
		this.currAddress = address;	
	},
	
	rangePicking: function(rangepicker)
	{
		if(this.isEditingChart())
		{
			var address = rangepicker.getSelectedRangeAddress(false, true, false, false, !rangepicker.selectingCell());
			this.updateCurrAddress(address);
		}
	},
	
	rangePicked: function (rp) {
		this.highLightAddress(this.currAddress);
		if(this.chartPropsDlg && this.chartPropsDlg.dialog && this.chartPropsDlg.dialog._isShown())
			this.chartPropsDlg.applyAddressOnMouseUp();
		else if(this.chartTypesDlg && this.chartTypesDlg.dialog && this.chartTypesDlg.dialog._isShown())
			this.chartTypesDlg.applyAddress();
	},
	//called by dialog to high light currently editing data source
	highLightAddress: function(address)
	{
		this._highlightProvider.removeHighlight(this._currentHighlight);
		if(address)
		{
			this._currentHighlight = this._highlightProvider.highlightChartRange(address);
		}
	},
	
	isEditingChart: function(){
		var isNew = this.chartTypesDlg && this.chartTypesDlg.dialog && this.chartTypesDlg.dialog._isShown();
		var isSet = this.chartPropsDlg && this.chartPropsDlg.dialog && this.chartPropsDlg.dialog._isShown();
		
		return isNew || isSet;		
	},
	
	hideRangeViewer: function()
	{
		if(this._currentHighlight)
		{
			this._highlightProvider.removeHighlight(this._currentHighlight);
			this._currentHighlight = null;
		}
	},
	
	preCloseDlg: function(focus, chart)
	{
		this.editor.enableUI(false);
		dojo.publish("RangePickingComplete", [{grid : this.editor.getCurrentGrid()}]);
		this.hideRangeViewer();
		if(focus && chart){
			var range = this._areaMgr.getRangeByUsage(chart._id,this.usage);
			if(range)
				this._setFocus(range);
		}
	},
		
	//highlight current focused chart.
	highLightDataSource: function(chartId){
		this.unHighLightDataSource(chartId);
		this._isHighLighting = true;
		this._focusedChart = chartId;
		
		var chart = this._document.getChart(chartId);
		if(!chart)	return;
		
		var currentGrid = this.editor.getCurrentGrid();
		var chartSheet = this._areaMgr.getRangeByUsage(chartId, this.usage).getSheetName();
		var curSheet = currentGrid.sheetName;
		
		if(chartSheet != curSheet) return;//chart is not in current grid? Just return.
		
		var dqList = chart.getDataSequenceList();
		var len = dqList.length;
		
		var highlights = [];
		for(var idx = 0; idx < len; idx ++)
		{
			var dq = dqList[idx], dataGroup = [];
			if(!dq) continue;
			var refs = dq._refList;
			for(var indx = 0; indx < refs.length; indx++)
			{
				var ref = refs[indx];
				if(ref)
				{
					refSheet = ref.getSheetName();
					//only highlight reference in current sheet, data source in other sheets will not be highlighted even when we switch to that sheet.
					if(refSheet == curSheet)
						dataGroup.push(ref);
				}
			}
			if(dataGroup.length > 0)
				highlights.push(dataGroup);
		}
		this._highlightMap[chartId] = this._highlightProvider.highlightRangeGroup(highlights);
	},
		
	unHighLightDataSource: function(chartId)
	{
		this._isHighLighting = false;
		if(!this._highlightMap) return;
		
		var viewers = this._highlightMap[chartId];
		if(viewers)
		{
			this._highlightProvider.removeHighlight(viewers);
			delete this._highlightMap[chartId];
		}
	},
	
	//update the highlight chart or its cache when chart data source changed
	updateHighLightChart: function()
	{
		if(this._focusedChart){
			if(this._isHighLighting)
				this.highLightDataSource(this._focusedChart, true);
			else
				this._focusedChart = null;
		}
	},
	
	/**
	 * @param chartSettings
	 * ERR 0: successful, 1: Can not get the data, 2: illegal data range, 3, too many data points
	 */
	
	createChart: function(chartSettings, data)
	{
		var address = data.address;
	    
		if(!address)
			return {err:2};
	    var rangeAddr = websheet.Utils.getRangeAddr4Chart(address);
		if(!rangeAddr)
		{
			var prasedName = websheet.Helper.parseName(address, true);
		    if(prasedName){
		    	var sheet = this._document.getSheet(prasedName.sheet);
				if(!sheet){
					var title = this.editor.scene.getDocBean().getTitle();
					if(prasedName.sheet != title)
						return {err:2};
				}
				var nameRange = this._areaMgr.getRangeByUsage(prasedName.name,websheet.Constant.RangeUsage.NAME);
				if(!nameRange || !nameRange.isValid())
					return {err:2};
				rangeAddr = websheet.Utils.getRangeAddr4Chart(nameRange.getParsedRef().getAddress());
		    }
		    else
		    	return {err:2};
		}
		if(!rangeAddr)
			return {err:2};
		
		var parseRef = websheet.Helper.parseRef(rangeAddr);
		var sr = parseRef.startRow;
		var er = parseRef.endRow;
		var sc = parseRef.startCol;
		var ec = parseRef.endCol;
		if((er-sr+1)*(ec-sc+1)> websheet.Constant.MaxPointsInSeries)
			return {err:3};
		
		var sheet = this._document.getSheet(parseRef.sheetName);
		if(!sheet)
			return {err:2};
		
		//The range data is not loaded
		//When the data is loaded, create chart will be called
		if(this.editor.getController().getPartial(parseRef.sheetName))
		{
			var method = function(){dojo.publish(data.reqId);};
			this.editor.getPartialManager().addNotify(method);
			return {err:1};
		}
		var chart = new websheet.model.chart.Chart("priview",this._document);
		
		if(this._dataProvider==null)
			this._dataProvider = new websheet.model.chart.DataProvider(this._document);
		chart.attachDataProvider(this._dataProvider);
		
		var args = {};
		args.rangeAddr = rangeAddr;
		args.dataSource = data.type;
		var ret = chart.createModel(chartSettings, args);
		if(!ret)
			return {err:2};
		
		return {err:0,chart:chart};
	},
	
	generateChart : function(refChart, bNotFocus)
	{
		var grid = this.editor.getCurrentGrid();
	    var chartId = "chart" + dojox.uuid.generateRandomUuid();
//		var chart = new websheet.model.chart.Chart(chartId,this._document);
//		
//		if(this._dataProvider==null)
//			this._dataProvider = new websheet.model.chart.DataProvider(this._document);
//		chart.attachDataProvider(this._dataProvider);
//		chart.loadFromJson(refChart.toJson());
//		
//		this._document._charts[chartId] = chart;
		
		var win_w = grid.geometry.getScrollableWidth();
		var win_h = grid.geometry.getScrollableHeight();
		
		var scrollLeft = grid.scroller.scrollLeft;
		var left = (win_w - this._defaultWidth)/2 + scrollLeft;
		var top = (win_h - this._defaultHeight)/2;
		var right = (win_w + this._defaultWidth)/2 + scrollLeft;
		var bottom = (win_h + this._defaultHeight)/2;
		var bFreezeArea = top < grid.getFreezeWindowHeight();
		var lt = grid.getCellInfoWithPosition(left , top, false, false, bFreezeArea);
		var rb = grid.getCellInfoWithPosition(right, bottom, true, true, bFreezeArea);
		
		var rangeAddr = websheet.Helper.getAddressByIndex(grid.sheetName, lt.rowIndex + 1, lt.colIndex,null, rb.rowIndex + 1, rb.colIndex);
		var sheetId = this._document.getSheetId(grid.sheetName);
		var zIndex = this.editor.getDrawFrameHdl().getMaxZIndex(sheetId) + 1;
		var attrs = {usage:websheet.Constant.RangeUsage.CHART, rangeid: chartId};
		var data = {w: this._defaultWidth, h: this._defaultHeight,z:zIndex, ex:0 ,ey:0 , pt: "relative", href: "Charts/"+chartId};
		
		data["x"] = lt["colOffset"];
		data["y"] = lt["rowOffset"];
		data["ex"] = rb["colOffset"];
		data["ey"] = rb["rowOffset"];
		attrs.data = data;
		
		//chart json will not be stored in the range data
		var eventAttrs = websheet.Helper.cloneJSON(attrs);
		eventAttrs.data.chart = refChart.toJson(true);
		var revAttrs = {usage: websheet.Constant.RangeUsage.CHART, rangeid: chartId};
		this.editor.execCommand(commandOperate.INSERTRANGE, [chartId, rangeAddr, eventAttrs, revAttrs]);
		
		if (!bNotFocus) {
			var range = this._areaMgr.getRangeByUsage(chartId,this.usage);
			var tm = this.editor.getTaskMan();
			tm.addTask(this, "setFocus", [range], tm.Priority.UserOperation);
			tm.start();
		}
	},
	
	//used to focus to new inserted chart
	setFocus: function(range){	
		setTimeout(dojo.hitch(this, "_setFocus", range), 300);		
	},
	
	_setFocus: function(range){
		this.editor._focus();
		this.scrollFrameIntoView(range, true);
	},
	
	//insert chart at current focus cell or shape when paste
	insertChart: function(data){
		if(!data)
			return;
		var grid = this.editor.getCurrentGrid();
		var sheetName = grid.getSheetName();
        this.editor.moveSelectRectFocusVisible();
        
        var x = 0;
        var y = 0; 
        var ex = 0;
        var ey = 0;
    	var width = data.w;
    	var height = data.h;
    	
    	var rangeAddr;
    	//paste to a shape, chart or img
    	 var drawDiv = this.editor.getDrawFrameHdl().getSelectedDrawDivInCurrSheet();
    	if(drawDiv){
        	var offset = drawDiv.getRenderDivPosition();
        	var imgLeftPos = offset.left + 15;
        	var imgRightPos = imgLeftPos + width;
        	var newLeftTopCellInfo = drawDiv._grid.getCellInfoWithPosition(imgLeftPos,offset.top + 16, false, false, offset.bFrozen);		
        	var newRightBottomCellInfo = drawDiv._grid.getCellInfoWithPosition(imgRightPos,offset.top + 16 + height, true, true, offset.bFrozen);
          
           if(newRightBottomCellInfo.colReviseOffset){ 
				width = width - newRightBottomCellInfo.colReviseOffset;
				if(width < websheet.Constant.minImgWidth){
					this.editor.scene.showWarningMessage(this._nls.chartSizeMsg,2000);
					return;
				}
			}
			if(newRightBottomCellInfo.rowReviseOffset){
				height = height - newRightBottomCellInfo.rowReviseOffset;
				if(height < websheet.Constant.minImgHeight){
					this.editor.scene.showWarningMessage(this._nls.chartSizeMsg,2000);
					return;
				}
			}	
			
			var params = {refMask: websheet.Constant.RANGE_MASK};
			rangeAddr = websheet.Helper.getAddressByIndex(sheetName, newLeftTopCellInfo.rowIndex + 1, websheet.Helper.getColChar(newLeftTopCellInfo.colIndex),
									null,newRightBottomCellInfo.rowIndex + 1, websheet.Helper.getColChar(newRightBottomCellInfo.colIndex),params);
           
            if(data.pt == "absolute"){
            	rangeAddr = websheet.Helper.createVirtualRef(sheetName);
			    var grid = controller.getGrid(sheetName); 					
				x = offset.left + 15;
				y = offset.top + 16 + grid.scroller.scrollTop;
            }else{
            	x = newLeftTopCellInfo["colOffset"];
				y = newLeftTopCellInfo["rowOffset"];
				ex = newRightBottomCellInfo["colOffset"];
				ey = newRightBottomCellInfo["rowOffset"];
            }
    	}    		
    	 
    	//paste to a cell
    	if(!rangeAddr){
	    	var selected = grid.selection.getFocusedCell();
			var rowIndex = selected.focusRow + 1;
			var colIndex = selected.focusCol;
			var ret = this._getRangeForShape(rowIndex, colIndex, width, height);    	
	    	if(!ret){
				this.editor.scene.showWarningMessage(this._nls.chartSizeMsg,2000);
				return;
	    	}
	    	rangeAddr = ret.rangeAddr;
	    	ex = ret.ex;
	    	ey = ret.ey;
    	
	    	if(data.pt == "absolute"){
				rangeAddr = websheet.Helper.createVirtualRef(sheetName);
				var topleft = this._getCellLeftTopPos(sheetName,rowIndex,colIndex, grid);
				if(!topleft)
					return;
				x = topleft.left;
				y = topleft.top;
			}	    	
    	}
    	
    	var chartId = "chart" + dojox.uuid.generateRandomUuid();
    	var attrs = {usage:this.usage, rangeid: chartId};
    	
    	var sheetId = this._document.getSheetId(sheetName);		
		var zIndex = this.editor.getDrawFrameHdl().getMaxZIndex(sheetId) + 1;		
		var param = {w: width, h: height, x:x, y:y,z:zIndex, ex:ex ,ey:ey , pt: data.pt, href: "Charts/"+chartId};
		if(data.alt)
			param.alt = data.alt;
		
		attrs.data = param;
		attrs.data.chart = data.chart;

		var revAttrs = {usage: this.usage, rangeid: chartId};
		this.editor.execCommand(commandOperate.INSERTRANGE, [chartId, rangeAddr, attrs, revAttrs]);
		
		var range = this._areaMgr.getRangeByUsage(chartId,this.usage);
		var tm = this.editor.getTaskMan();
     	tm.addTask(this, "setFocus", [range], tm.Priority.UserOperation);
     	tm.start();
	},
	
	drawAll: function(sheetName)
	{
		var controller = this.editor.getController();
        var grid = controller.getGrid(sheetName);
        if(!grid.isGridVisible())
        	return;
        
        var chartList = this._areaMgr.getRangesByUsage(this.usage,sheetName);
        try
        {        	
        	if(chartList.length > 0)
            {
        		this.prepareColsWidth(grid);
            	this.prepareRowsHeight(chartList,grid);
//            	var sc = grid.scroller;
//            	grid.accuracyTop = sc.findScrollTop(sc.firstVisibleRow);
            	grid.accuracyTop = grid.scroller.firstVisibleRow > grid.freezeRow ? grid.geometry.preciseRowHeight(grid.freezeRow, grid.scroller.firstVisibleRow - 1) : 0;
            	for(var i=0;i<chartList.length;i++)
                 {
                     var range = chartList[i];
                     var publishAlways = this._dirtyCharts[range.getId()] ? true : false;
                     this.draw(range,grid, publishAlways);
                 }
            	
            	this.resetCache();
            	this._dirtyCharts = {}; // reset
            }
        }
        catch(e)
        {
        	console.log(e);
        }
	},
	
	drawChart: function(range, grid, publishAlways){
		 if(!grid.isGridVisible())
	        	return;
		 try{
			var rangeInfo = range._getRangeInfo();    		
       		var sheetName = this.editor.getCurrentGrid().getSheetName();
       		if(rangeInfo.sheetName != sheetName)
       			return;
       		this.prepareCache(rangeInfo, grid);

			this.draw(range, grid, publishAlways);
		}catch(e)
    	{
    		console.log(e);
    	}
    	this.resetCache();
	},
	
	draw: function(range, grid, publishAlways)
	{
		try{
    		var rangeInfo = range._getRangeInfo();    		
       		var sheetName = this.editor.getCurrentGrid().getSheetName();
       		if(rangeInfo.sheetName != sheetName)
       			return;
       		
       		var chart= this._document._charts[range.getId()];
    		if(chart!=null)
    		{
    			var rect = this._getFrameRect(range, grid);
    			var chartDiv = this.getDrawFrameDivbySheetName(sheetName ,range.getId());
    			if(rect==null)
    			{
    				if(chartDiv)
    					chartDiv.hide();
    				return;
    			}
    			
    			range.data.w = rect.w;
    			range.data.h = rect.h;
    			
    			//create or update chartDiv firstly
    			if(!chartDiv)
    				chartDiv = this._createChartDiv(range,grid, rect);//chartDiv is the _imageDiv of chartDiv
    			else
    				chartDiv.redraw({top:rect.t,left:rect.l},{w:rect.w,h:rect.h});
    			
    			if(!chartDiv || chartDiv.isHidden())
    				return;
    			
    			if(!chart.hasView())
    	   		{
    				dojo["require"]("concord.concord_sheet_extras");
    				if(range.data.alt)
    					chart._diagram.accDesc = range.data.alt;
    				else
    					chart._diagram.accDesc = this.isRelativeShape(range) ? this.editor.nls.ACC_CHART_CELL : this.editor.nls.ACC_CHART_SHEET;
    				chart.setNode(chartDiv._drawDiv);
    	   		}

    			var isDirty = chart.isDirty();
    			chart.render();
    			if (isDirty || publishAlways) {
   					var params = {rangeid: range.getId(), sheetName: sheetName, data: chart.getSvg()};
   					this.editor.publishForMobile({"name": "setChartSVG", "params":[params]});
    			}
    		}
    	}
		catch(e)
    	{
    		console.log(e);
    	}
	},
	
	hasChartView: function(chartId)
	{
		var chart= this._document._charts[chartId];
		if(chart)
			return chart.hasView();
		return false;
	},
	
	_createChartDiv: function(range, grid, rect)
	{
		var rangeInfo = { x: rect.l, y: rect.t,  width:rect.w, height:rect.h,
    			range:range,isRelative: this.isRelativeShape(range)};
		var chartDiv = new websheet.widget.ChartDiv(grid, rangeInfo, this);
		if(range.selected)
		{
			if(range.doFocus)
				chartDiv.setFocus();
			chartDiv.showImageResizeDivs();
			delete range.selected;
			delete range.doFocus;
		}
		this.addDrawFrameDiv2Map(range.getSheetName(), range.getId(), chartDiv);		

		return chartDiv;
	},	   
   
	reset: function(){
		if(this.drawFrameDivMap){
			for(var sheetName in this.drawFrameDivMap){
				var drawFrameSheetMap = this.drawFrameDivMap[sheetName];
				if(drawFrameSheetMap){
					for(var chartId in drawFrameSheetMap){
						var chart = this._document._charts[chartId];
						if(chart)
							chart.destroy();
					}
				}
			}
		}
		
		this.inherited(arguments);
    },    
	
	//Must be called before preDelete of sheet, otherwise, charts' id of the sheet can't be gotten.
	dltDrawFramesInSheet: function(sheetName, rangeId){      
		var chart= this._document._charts[rangeId];
      	if(chart)
      		 chart.detroyView();
      	this.inherited(arguments);
	 },
	 
	 removeDrawFrameFromUI: function(sheetName, rangeId){
		var chart= this._document._charts[rangeId];
       	if(rangeId == this._focusedChart){
       		this._highlightProvider.removeHighlight(this._highlightMap[rangeId]);
       		this._focusedChart = null;
       		this._isHighLighting = false;
       	}
       	this.inherited(arguments);
	 },	 
	
	setChart: function(chartId, data)
	{
		var range = this._areaMgr.getRangeByUsage(chartId,this.usage);
		if(range==null)
			return;
		
		var sheetName = range.getSheetName();
		if(sheetName==null)
			return;
		
		var chart = this._document.getChart(chartId);
		if(chart==null)
			return;
		
		var settings = data.settings;
		chart.set(settings);
		
		if(chartId == this._focusedChart && chart.checkData){
			if(this._isHighLighting)
				this.highLightDataSource(chartId, true);
			else
				this._focusedChart = null;
		}
		return range;
	},	
	
	setProperties: function(chartId, props)
	{
		var range = this._areaMgr.getRangeByUsage(chartId,this.usage);
		if(range==null)
			return;
		
		var sheetName = range.getSheetName();
		if(sheetName==null)
			return;
		
		var chart = this._document.getChart(chartId);
		if(chart==null)
			return;
		
		var undoProps = chart.getReverseSettings(props);
		var attrs = {"chartId" : chart._id , "settings" : props};
		var	refValue = websheet.Helper.createVirtualRef(sheetName);
		var revAttrs = {"chartId" : chart._id, "settings": undoProps};
		this.editor.execCommand(commandOperate.SETCHARTINFO, [refValue, attrs, revAttrs]);
		
		if(chart._id == this._focusedChart && chart.checkData){
			this.highLightDataSource(chart._id, true);
		}
	},
	
	deleteDrawFrame: function (/*string*/rangeid) {
		if (!rangeid) return;
		
		this._highlightProvider.removeHighlight(this._highlightMap[rangeid]);
    	var range = this._areaMgr.getRangeByUsage(rangeid,this.usage);
    	var refValue = range.getParsedRef().getAddress();
		var data = {};
		for (var attr in range.data){
			data[attr] = range.data[attr];
			if(range.data[attr] == undefined){
				console.log(range.data);	
				return;
			}
		}
		var chart= this._document._charts[range.getId()];
		data["chart"] = chart.toJson(true, true);

		var attrs = {usage: this.usage, rangeid: rangeid};
		var revAttrs = {usage: this.usage, rangeid: rangeid, data: data};
		this.editor.execCommand(commandOperate.DELETERANGE, [rangeid, refValue, attrs, revAttrs]);
	},
	
	onArrowKeyDown:function(sheetName, e, dir){		
		var move = false;
		var chartSheetMap = this.getDrawFrameMapBySheetName(sheetName);
		if(chartSheetMap){
	    	for(var chartid in chartSheetMap){
	    		var chartDiv = chartSheetMap[chartid];
	    		if(chartDiv && chartDiv.isSelected()){
	    			//move focuse inside of chart
	    			move = true;
	    		}
	    	}  
		}
		return move;
	},
	
	downloadSelChart: function()
	{
		var chartRanges = this.getSelectedDrawFramesInCurrSheet();
		for(var i=0;i<chartRanges.length;i++)
		{
			var ref = chartRanges[i];
			var chart = this._document._charts[ref.getId()];
			chart.downloadPng();
		}
	},
	
	notify: function(area, event) {
		if(event && event._type == websheet.Constant.EventType.DataChange)
		{
			var s = event._source;
			var data = s.data;
			var DataChange = websheet.Constant.DataChange;
			if (s.refType == websheet.Constant.OPType.AREA) {
				var controller = this.editor.getController();
				var areaId = area.getId();
				switch(s.action) {
					case DataChange.DELETE:{
						this.removeDrawFrameFromUI(area.getSheetName(), areaId);
						this._document.removeChart(areaId);
						break;
					}
					case DataChange.INSERT:{
						area.data = {};
						for(var attr in data) {
							if(attr != "chart")
								area.data[attr] = data[attr];
						}
						
						var chartJson = data["chart"];
						var chart = null;
						if(chartJson)
							chart = this._document.addChart(areaId, chartJson);
						else
							chart = this._document.getChart(areaId);
						controller.calcDrawFrameInfo(area);
						var mode = s.mode;
						if(websheet.Constant.MSGMode.NORMAL === mode)
							chart.checkData = true;
						this.drawChart(area,this.editor.getCurrentGrid());
						if(mode){//focus to chart if undo/redo
							var tm = this.editor.getTaskMan();
					     	tm.addTask(chartHdl, "setFocus", [area], tm.Priority.UserOperation);
					     	tm.start();
						}
						
						break;
					}
					case DataChange.SET:{
						// TODO - don't publish svg data for moving chart
						var publishAlways = true;

						// do not care about the refValue which is the old position of image (parsedRef type)
						// area is the updated area
						if(!area.data)
							area.data = {};
						
						for(var attr in data) {
							area.data[attr] = data[attr];
						}
						if(data || s.mode != undefined)//don't redraw chart when update area is caused by undo delete row/column.
							this.drawChart(area, this.editor.getCurrentGrid(), publishAlways);
						break;
					}
				}
			} else if (s.refType == websheet.Constant.OPType.ROW || s.refType == websheet.Constant.OPType.COLUMN) {
				if (s.action == DataChange.PREDELETE) {
					if (area instanceof websheet.parse.Area) {
						this._dirtyCharts[area.getId()] = area;
						this.inherited(arguments);
					}
					return;
				}
				
				var list = [];
				if (s.action == DataChange.HIDE || s.action == DataChange.INSERT || s.action == DataChange.CHANGEHEIGHTORWIDTH)
					list.push(s.refValue);
				else if (s.action == DataChange.SHOW) {
					if (s.refType == websheet.Constant.OPType.ROW)
						list = s.refValue;
					else
						list.push(s.refValue);
				}
				
				switch (s.action) {
				case DataChange.HIDE:
				case DataChange.INSERT:
				case DataChange.SHOW:
				case DataChange.CHANGEHEIGHTORWIDTH:
					var sheetName = list[0].sheetName;
					var ranges = this._areaMgr.getRangesByUsage(this.usage,sheetName);
					for (var i = 0; i < list.length; i++) {
						var parsedRef = list[i];
						for (var j = 0; j < ranges.length; j++) {
							var chartArea = ranges[j];
							if (chartArea.intersect(parsedRef))
								this._dirtyCharts[chartArea.getId()] = chartArea;
						}
					}
					break;
				default:
					break;
				}
			} else {
				if (area instanceof websheet.parse.Area)
				 this.inherited(arguments);
			}
		}
	}
});