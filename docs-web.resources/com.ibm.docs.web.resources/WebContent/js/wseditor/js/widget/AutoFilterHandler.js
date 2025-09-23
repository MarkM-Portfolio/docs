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


dojo.provide("websheet.widget.AutoFilterHandler");
dojo.require("websheet.AutoFilter.Filter");

dojo.declare('websheet.widget.AutoFilterHandler', websheet.listener.Listener,{
	editor: null,
	doc: null,
	filters: null,
	filterMenu: null,
	
	constructor: function(editor)
	{
		this.editor = editor;
		this.doc = editor.getDocumentObj();
		this.filters = {};
	},
	
	getFilter: function(sheetName)
	{
		return this.filters[sheetName];
	},
	
	getFilterMenu: function()
	{
		if(!this.filterMenu || this.filterMenu._destroyed)
		{
			this.filterMenu = new websheet.AutoFilter.FilterMenu();
		}	
		return this.filterMenu;
	},
	
	createFilter: function(addr)
	{
		var rangeid = dojox.uuid.generateRandomUuid();
        var attrs = {usage: websheet.Constant.RangeUsage.FILTER, rangeid: rangeid};
		this.editor.execCommand(commandOperate.INSERTRANGE, [rangeid, addr, attrs, attrs]);
	},
	
	loadFilters: function()
	{
		var areaMgr = this.doc.getAreaManager();
        var ranges = areaMgr.getRangesByUsage(websheet.Constant.RangeUsage.FILTER);
        var length = ranges.length;
		for(var i = 0; i < length; i++)
		{
			var range = ranges[i];
			this.insertFilter(range);
		}		
	},
	
	insertFilter: function(area)
	{
		var rangeInfo = area._getRangeInfo();
		var sheetName = rangeInfo.sheetName;
		this.cleanFilter(sheetName);
		var filter = this.filters[sheetName] = new websheet.AutoFilter.Filter(area,this.editor);
		
	   //remove the preserve range for range filter, due to _showRangeFilterMessage when postLoad
	   var doc = this.editor.getDocumentObj();
	   var areaMgr = doc.getAreaManager();
       var rangeFilters = areaMgr.getRangesByUsage(websheet.Constant.RangeUsage.RANGEFILTER, sheetName);
   	   if(rangeFilters && rangeFilters.length > 0)
   	   {
   	       //must only one filter
   		   areaMgr.deleteArea(rangeFilters[0]);
   	       filter.restoreFilteredRows(rangeFilters[0]._getRangeInfo());
   	   }
   	   var areas = areaMgr.getRangesByUsage(websheet.Constant.RangeUsage.FILTER, sheetName);
   	   if(areas && areas.length > 0)
   	   {
   		   for(var i = 0; i < areas.length; i++)
   		   {
   			   if(areas[i] !== area)
   				   areaMgr.deleteArea(areas[i]);
   		   } 	   
   	   }	   
		//add to reference list
		var colFilterRef = new websheet.parse.ParsedRef(sheetName,-1,rangeInfo.startCol,-1,rangeInfo.endCol,websheet.Constant.COLS_MASK);
		var area = areaMgr.startListeningArea(colFilterRef, filter);
		filter.broadcaster = area;
	},
	
	//Called by UI
	removeFilter: function(sheetName)
	{
		var filter = this.filters[sheetName];
		if(filter==null)
			return;
		
		var rangeid = filter._range.getId();
		var refValue = filter._range.getParsedRef().getAddress({hasSheetName:true});
        var attrs = {usage: websheet.Constant.RangeUsage.FILTER, rangeid: rangeid};
        var ret = filter.getRestoreAttrs();
		this.editor.execCommand(commandOperate.DELETERANGE, [rangeid, refValue, attrs, ret.attrs, ret.content]);
	},
	
	//called in undo to remove new added filter in the same sheet by others
	cleanFilter: function(sheetName)
	{
		var filter = this.filters[sheetName];
		if(filter==null)
			return;
		
		var rangeid = filter._range.getId();
		this.editor.getController().deleteRange(rangeid, websheet.Constant.RangeUsage.FILTER);
	},
	//called from message
	deleteFilter: function(sheetName)
	{
		var filter = this.filters[sheetName];
		if(filter==null)
			return;
		
		var areaMgr = this.doc.getAreaManager();
		areaMgr.endListeningArea(filter.broadcaster,filter);
		filter.broadcaster = null;
		filter.destroy();
		delete this.filters[sheetName];
	},
	
	//called from message or undo/redo
	setFilterInfo: function(addr, data, mode)
	{
		var parsedRef = websheet.Helper.parseRef(addr);
		var filter = this.filters[parsedRef.sheetName];
		if(filter==null)
			return;
		
		var rangeInfo = filter.getRangeInfo();
		var sr = parsedRef.startRow;
		var er = parsedRef.endRow;
		var sc = parsedRef.startCol;
		var ec = parsedRef.endCol;
		if(rangeInfo.startRow!=sr || rangeInfo.endRow!=er || rangeInfo.startCol!=sc || rangeInfo.endCol!=ec)
		{
			//update filter range address
			var areaMgr = this.doc.getAreaManager();
			areaMgr.updateRangeByUsage(parsedRef, data.rangeid, websheet.Constant.RangeUsage.FILTER);
			areaMgr.endListeningArea(filter.broadcaster,filter);
			var colFilterRef = new websheet.parse.ParsedRef(parsedRef.sheetName,-1,sc,-1,ec,websheet.Constant.COLS_MASK);
			var newRefArea = areaMgr.startListeningArea(colFilterRef, filter);
			filter.broadcaster = newRefArea;
			filter._dirty = true;
		}
		//If mode is undo/redo, set bLocal = true;
		//TODO: after weihua's change
		filter.updateRule(data, !!mode);
		filter.filterRows(data);
		filter.updateDataChangeFlag(true);
	},
	
	update: function(grid)
	{
		if(!grid.isGridVisible())
        	return;
		
		var toolbar = this.editor.getToolbar();
		var sheetName = grid.sheetName;
        
		var filter = this.filters[sheetName];
		//Check if the filter is not created
		if(filter==null)
		{
	        //One sheet, one filter
			toolbar && toolbar.syncFilterMenuState(false);
        	return;
		}
   		
		toolbar && toolbar.syncFilterMenuState(true);
        filter.showHeader(grid);
	},

	getReverseMsg:function(){
		return this.reverseMsg;
	},

	getAndResetReverseMsg:function(){
		var msg = this.reverseMsg;
		this.reverseMsg = null;
		return msg;
	},
	
	notify:function(area, e) {
		if(e)
		{
			//set Area, this.updateNameRange
			if(e._type == websheet.Constant.EventType.DataChange)
			{
				var s = e._source;
				var data = s.data;
				if (s.refType == websheet.Constant.OPType.AREA) {
					switch(s.action) {
						case websheet.Constant.DataChange.DELETE: {
							this.deleteFilter(area.getSheetName());
							break;
						}
						case websheet.Constant.DataChange.INSERT:{	
							area.data = {};
							for(var attr in data) {
								area.data[attr] = data[attr];
							}
					
							var filter = this.insertFilter(area);
					
							var grid = this.editor.getCurrentGrid();
							if (area.getSheetName() == grid.sheetName) {
								var tm = this.editor.getTaskMan();
								tm.addTask(grid, 'updateUI');
								tm.start();
							}
							break;
						}
					}
				} else if(s.refType == websheet.Constant.OPType.SHEET) {
					if(s.action == websheet.Constant.DataChange.PREDELETE){
						
						var sheetName = area.getSheetName();
						
						var filter = this.filters[sheetName];
						var rules = {};
						for(var col in filter._rules)
						{
							var rule = filter._rules[col];
				        	if(rule.keys)
				        		rules[col] = {keys:Object.keys(rule.keys)}; //change keys from map to array
				        	else
				        		rules[col] = rule;
						}
						area.data = rules;
						
						var areaMgr = this.doc.getAreaManager();
						areaMgr.endListeningArea(filter.broadcaster,filter);
						filter.broadcaster = null;
						
						if(filter && filter._header)
							filter._header.destroy();
						delete this.filters[sheetName];
						
					} else if(s.action == websheet.Constant.DataChange.SET){
						var oldName = s.oldSheetName;
						var newName = s.newSheetName;
						var filter = this.filters[oldName];
						if(filter)
							this.filters[newName] = filter;
						delete this.filters[oldName];
					} else if(s.action == websheet.Constant.DataChange.INSERT) {
						this.insertFilter(area);
					}
				}  else if(s.action == websheet.Constant.DataChange.PREDELETE 
								&&( s.refType == websheet.Constant.OPType.ROW ||s.refType == websheet.Constant.OPType.COLUMN )){
					this.reverseMsg = null;
					
					var sheetName = area.getSheetName();
					
					var filter = this.getFilter(sheetName);
					if (filter)
					{
						var info = filter.getRangeInfo();
						
						var bRow = false;
						if(s.refType == websheet.Constant.OPType.ROW)
							bRow = true;
						
						var sIndex, eIndex;
						var parsedRef = s.refValue;
						if(bRow) {
							sIndex = parsedRef.startRow;
							eIndex = parsedRef.endRow;
						} else { 
							sIndex = parsedRef.startCol;
							eIndex = parsedRef.endCol;
						}
						
						if( (bRow && info.startRow>=sIndex && info.startRow<=eIndex) 
								|| (!bRow && info.startCol>=sIndex && info.endCol<=eIndex) )
						{
							this.reverseMsg = filter.getRestoreMsg();
							this.deleteFilter(sheetName);
						}
						else {
							if(bRow)
								this.reverseMsg = filter.deleteRows(sIndex,eIndex);
							else 
								this.reverseMsg = filter.deleteCols(sIndex, eIndex);
						}
					}
				}
			}
		}
	}
});