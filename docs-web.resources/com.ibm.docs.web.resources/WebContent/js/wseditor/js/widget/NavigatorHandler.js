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

dojo.provide("websheet.widget.NavigatorHandler");
dojo.require("websheet.dialog.NavigatorDlg");
dojo.require("dojo.store.Memory");
dojo.require("dojo.store.Observable");
dojo.require("dojo.data.ObjectStore");
dojo.requireLocalization("websheet.widget","NavigatorHandler");

dojo.declare("websheet.widget.NavigatorHandler",null, {

	editor : null, 	
	dlg : null,
	GRAPHICNODE:"graphic",
	GRAPHICROOT:"GRAPHICROOT",	
	CHARTNODE: "chart",
	CHARTROOT: "CHARTROOT",
	GraphicsRoot:null,
	GraphicsNodePrefix:null,
	ChartNode: null,
	ChartsRoot: null,
	dialogtitle:null,
	treeStore:null,
	constructor: function(parent){
		this.editor = parent;
		var nls = dojo.i18n.getLocalization("websheet.widget","NavigatorHandler");
		this.GraphicsRoot = nls.GraphicsRoot;
		this.GraphicsNode = nls.GraphicsNode;
		this.ChartsRoot = nls.ChartsRoot;
		this.ChartNode = nls.ChartNode;
		this.dialogtitle = nls.dialogtitle;
	},	
	
	getTreeStore: function(){		
		allList =[];	
		var graphicData  ={ id: 'graphicroot', label:this.GraphicsRoot, type:this.GRAPHICROOT};
		
		var gList = this._getGraphicList();
		if(gList){			
			graphicData["children"] = gList;
		}
		allList.push(graphicData);
		
		var chartData  ={ id: 'chartroot', label:this.ChartsRoot, type:this.CHARTROOT};
		var chartList = this._getChartList();
		if(chartList!=null)
			chartData.children = chartList;
		allList.push(chartData);
		
		var myStore = new dojo.store.Memory({
		        data: allList
		});
		  
	    // Wrap the store in Observable so that updates to the store are reflected to the Tree		  
	    var dataStore = new dojo.data.ObjectStore({objectStore: myStore});
	    dataStore = new dojo.store.Observable(dataStore);		    
		return dataStore;
	},
	_getGraphicList: function(){
		var docObj = this.editor.getDocumentObj();
		var areaManager = docObj.getAreaManager();
		var imagesData =[];
		var images = areaManager.getRangesByUsage(websheet.Constant.RangeUsage.IMAGE);
		var shapes = areaManager.getRangesByUsage(websheet.Constant.RangeUsage.SHAPE);
		if (images && shapes)
			images = images.concat(shapes);
		else if (shapes)
			images = shapes;
		if(images){
			for(var i = 1; i <= images.length; i++){
				var image =images[i-1];
				if(image.isValid())
					imagesData.push( { id: image.getId(), label:dojo.string.substitute(this.GraphicsNode,[ i]),type:this.GRAPHICNODE});
			}			
		}
		return imagesData;
	},
	
	_getChartList: function()
	{
		var docObj = this.editor.getDocumentObj();
		var areaManager = docObj.getAreaManager();
		var chartsData =[];			
		var charts = areaManager.getRangesByUsage(websheet.Constant.RangeUsage.CHART);
		if(charts){
			for(var i = 0; i < charts.length; i++){
				var chart =charts[i];
				if(chart.isValid())
					chartsData.push( { id: chart.getId(), label:dojo.string.substitute(this.ChartNode,[i + 1]),type:this.CHARTNODE});
			}			
		}
		return chartsData;
	},
	
	selectDrawFrame: function(item,doFocus)
	{
		var docObj = this.editor.getDocumentObj();
		var areaManager = docObj.getAreaManager();
		var RangeUsage = websheet.Constant.RangeUsage;
		var range = null;
		if(this.GRAPHICNODE ==item.type) {	
			range = areaManager.getRangeByUsage(item.id, RangeUsage.IMAGE) || areaManager.getRangeByUsage(item.id, RangeUsage.SHAPE);
		} else if(this.CHARTNODE ==item.type) {
			range = areaManager.getRangeByUsage(item.id, RangeUsage.CHART);
		}
		if (range == null) return;
		var sheetName = range.getSheetName();
		var sheet = docObj.getSheet(sheetName);
		if (sheet == null) return;
		if (sheet.isSheetVisible())
		{
			this.editor.getFreezeHdl().removeFrameStatus(sheetName, range.getId());
			this.editor.getDrawFrameHdlByUsage(range.usage).scrollFrameIntoView(range, doFocus);
		}else
			this.editor.scene.showWarningMessage(this.editor.nls.FOCUS_TO_HIDDEN_SHEET, 5000);
	},
	
	showDlg : function(){		
		if( !this.dlg ){	
			this.dlg = new websheet.dialog.NavigatorDlg(this.editor, this.dialogtitle, null, null);
		}
		this.dlg.show();	
	}
});