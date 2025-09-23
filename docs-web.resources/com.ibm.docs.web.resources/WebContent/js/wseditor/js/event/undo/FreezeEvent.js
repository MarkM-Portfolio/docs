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

dojo.provide("websheet.event.undo.FreezeEvent");
dojo.require("websheet.listener.Listener");
dojo.require("dojo.i18n");
dojo.require("websheet.Constant");

dojo.declare("websheet.event.undo.FreezeEvent",[websheet.event.undo.Event,websheet.listener.Listener], {
	_startIndex: -1,
	MAX_COL: websheet.Constant.MaxColumnIndex,
	
	constructor: function(jsonEvent,idManager)
	{
		var token = this.refTokenId.token;
		if(this.type == websheet.Constant.Event.SCOPE_ROW)
			this._startIndex = token.getStartRowIndex();
		else if(this.type == websheet.Constant.Event.SCOPE_COLUMN)
			this._startIndex = token.getStartColIndex();
		
		if(!idManager)
			this.startListening(this.controller);
	},
	
	_checkRelated: function(token)
	{
		return false;
	},
	
	notify: function(source, event)
	{
		if(this._startIndex == -1) return;
		
		if(event._type == websheet.Constant.EventType.DataChange)
		{
			var s = event._source;
			if(s.mode != undefined && s.mode == websheet.Constant.MSGMode.NORMAL 
			 && ( this.type == websheet.Constant.Event.SCOPE_ROW && s.refType == websheet.Constant.OPType.ROW
				  || this.type == websheet.Constant.Event.SCOPE_COLUMN && s.refType == 	websheet.Constant.OPType.COLUMN ) 
			 && (s.action == websheet.Constant.DataChange.PREDELETE || s.action == websheet.Constant.DataChange.PREINSERT))
			{
				var parsedRef = s.refValue;
				var sheetName = this.getSheetName();
				if(parsedRef.sheetName != sheetName) return;
				var start = s.refType == websheet.Constant.OPType.ROW ? parsedRef.startRow : parsedRef.startCol;
				var end = start;
				if(s.refType == websheet.Constant.OPType.ROW)
				{
					end = parsedRef.endRow;
				}	
				else
				{
					end = parsedRef.endCol;
				}	
				if(s.action == websheet.Constant.DataChange.PREDELETE)
				{
					if(this._startIndex > end)
					{
						this._startIndex -= end -start +1;
					}	
					else if( this._startIndex >= start && this._startIndex <= end)
					{
						this._startIndex = start -1 < 1 ? 1 : start -1  ;
					}	
				}
				else if(s.action == websheet.Constant.DataChange.PREINSERT)
				{
					if( start <= this._startIndex)
					{
						this._startIndex += end -start +1;
					}
					var maxRow = this._idManager.maxRow;
					if(this.type == websheet.Constant.Event.SCOPE_ROW && this._startIndex > maxRow)
						this._startIndex  = maxRow;
					else if(this.type == websheet.Constant.Event.SCOPE_COLUMN && this._startIndex > this.MAX_COL)
						this._startIndex = this.MAX_COL;
				}
			}
		}
	},
	
	clear: function()
	{
		this.inherited(arguments);
		this.endListening(this.controller);
	},
	
	toJson: function()
	{
		if(this._startIndex == -1)
			return this.inherited(arguments);
		var sheetName = this.getSheetName();
		var params = {};
		var refValue = null;
		if(this.type == websheet.Constant.Event.SCOPE_ROW)
		{
			params =  {refMask: websheet.Constant.ROWS_MASK};
			refValue = websheet.Helper.getAddressByIndex(sheetName, this._startIndex, null,null,null,null,params);
		}	
		else if(this.type == websheet.Constant.Event.SCOPE_COLUMN)
		{
			params =  {refMask: websheet.Constant.COLS_MASK};
			refValue = websheet.Helper.getAddressByIndex(sheetName, null, this._startIndex,null,null,null,params);
			//to check the whole sheet model,if the current freeze column just in the merged cells, return null to make
			//the event would not been execute and send out
//			if(this._startIndex > 0)
//			{
////				var docAgent = websheet.event.DocumentAgent;
////				var bMerge = docAgent.hasMergeCellForCol(sheetName,this._startIndex);
////				var docObj = websheet.model.ModelHelper.getDocumentObj();
////		    	var sheet = docObj.getSheet(sheetName);
////		    	var rows = sheet._rows;
////		    	var colIndex = this._startIndex;
////		    	var mergeRet = dojo.some(rows, function(row){
////					var mCell = row.getCell(colIndex, websheet.Constant.CellType.COVERINFO, true);
////					if(mCell && mCell.getCol() + mCell._colSpan - 1> colIndex)
////						return true;
////		    	});
////		    	if(bMerge) return null;
//			}	
			// This 'limitation' has been removed, we can support 'cross merge freeze' on canvas grid;
		}	
			
		if(refValue == null) return null;
		var jEvent = websheet.Helper.cloneJSON(this.jsonEvent);
		jEvent.reference.refValue = refValue;
		return jEvent;
	}
});

