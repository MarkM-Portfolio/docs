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

dojo.provide("websheet.event.undo.FilterEvent");
dojo.require("websheet.Constant");
dojo.require("websheet.event.undo.Event");

dojo.declare("websheet.event.undo.FilterEvent",websheet.event.undo.Event, {
	
	constructor: function(jsonEvent,idManager)
	{
		dojo.mixin(this, jsonEvent);
		
		this.showRowIds = [];
		this.hideRowIds = [];
		this.colId = null;
		this.delta = null;
		
		this.transformData2Id();
	},
	
	_checkRelated: function(token)
	{
		if(token.type == websheet.Constant.Event.SCOPE_ROW)
		{
			var eventSIndex = token.getStartRowIndex();
			var eventEIndex = token.getEndRowIndex();
			if(eventEIndex == -1) 
				eventEIndex = eventSIndex;
			var sIndex = this.refTokenId.token.getStartRowIndex();
			var eIndex = this.refTokenId.token.getEndRowIndex();
			//Filter is deleted
			if(eventSIndex <= sIndex && sIndex <= eventEIndex) 
				return true;
		}
		else if(token.type == websheet.Constant.Event.SCOPE_COLUMN && this.colId)
		{
			//If this.col == 0, that means this event only show/hide rows, not set filter rule
		    var eventSIndex = token.getStartColIndex();
		    var eventEIndex = token.getEndColIndex();
		    if(eventEIndex == -1) 
				eventEIndex = eventSIndex;
		    
		    var col = this._idManager.getColIndexById( this.refTokenId._sheetId, this.colId);
		    if(col==-1 || (col>=eventSIndex && col<=eventEIndex))
				return true;
		}
		return false;
	},
	
	/*
	 * transform index -> id for data in the josn event
	 */
	transformData2Id: function()
	{
		var sheetId = this.refTokenId.getSheetId();
		var data = this.jsonEvent.data;
		if(data.s)
		{
			for(var i=0;i<data.s.length;i++)
			{
				var rowIndex = data.s[i];
				this.showRowIds.push(this._idManager.getRowIdByIndex(sheetId, rowIndex - 1,true));
			}
		}
		if(data.h)
		{
			for(var i=0;i<data.h.length;i++)
			{
				var rowIndex = data.h[i];
				this.hideRowIds.push(this._idManager.getRowIdByIndex(sheetId, rowIndex - 1,true));
			}
		}
		
		if(data.startCol){
			this.delta = data.col - data.startCol;
			delete data.startCol;
		}else if(data.col>0)
			this.colId = this._idManager.getColIdByIndex(sheetId, data.col - 1,true);
	},
	
	/*
	 * transform index -> id for data in the josn event
	 */
	transformData2Index: function()
	{
		var sheetId = this.refTokenId.getSheetId();
		
		var data = websheet.Helper.cloneJSON(this.jsonEvent.data);
		if(this.delta != null)
			data.delta = this.delta;
		else if(this.colId){
			var colIndex = this._idManager.getColIndexById(sheetId, this.colId);
			if(colIndex != -1)
				colIndex ++;
			data.col = colIndex;
		}
		
		var s = [];
	    for(var i = 0; i < this.showRowIds.length; i++)
	    {
	    	var index = this._idManager.getRowIndexById(sheetId, this.showRowIds[i]);
	    	if (index == -1)
	    		continue;
	    	index ++;

	    	s.push(index);
	    }
	    
	    var h = [];
	    for(var i = 0; i < this.hideRowIds.length; i++)
	    {
	    	var index = this._idManager.getRowIndexById(sheetId, this.hideRowIds[i]);
	    	if (index == -1)
	    		continue;
	    	index ++;

	    	h.push(index);
	    }
	    
	    if(s.length>0)
	    	data.s = s;
	    else
	    	delete data.s;
	    if(h.length>0)
	    	data.h = h;
	    else
	    	delete data.h;
	    
		return data;
	},
	
	toJson:function()
	{
		// only check column action
		if (this.colId) 
		{
			var rangeId = this.data.rangeid;
			var doc = websheet.model.ModelHelper.getDocumentObj();
			var areaManager = doc.getAreaManager();
			var range = areaManager.getRangeByUsage(rangeId,websheet.Constant.RangeUsage.FILTER);
			if(!range)
				return null;
			var sheetName = range.getSheetName();
			var filters = areaManager.getRangesByUsage(websheet.Constant.RangeUsage.FILTER, sheetName);
			if(filters.length == 0)
				return null;
		}
		return this.inherited(arguments);
	}
});