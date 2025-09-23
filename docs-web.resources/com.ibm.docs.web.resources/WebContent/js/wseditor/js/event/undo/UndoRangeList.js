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

/***
 * Range Map of all the range model in undo stack
 */
dojo.provide("websheet.event.undo.UndoRangeList");
dojo.require("websheet.event.undo.RangeList");
dojo.declare("websheet.event.undo.UndoRangeList",websheet.event.undo.RangeList,{
	
	constructor: function(args)
	{
		dojo.mixin(this, args);
		this._dltUsageTypeArray = [];
	},
	
	_delta:{},//store the delta data of ranges when deleting row/column(a uuid in the delete event to identify a delete action)
	          //ranges in delta map should be restored when there is insert row/column action with the same uuid(undo action for delete row/column).
	
	restoreUndoRanges:function(source){
		var type;
		if(source.refType == websheet.Constant.OPType.ROW)
			type =  websheet.Constant.Event.SCOPE_ROW;
		else if(source.refType == websheet.Constant.OPType.COLUMN)
			type = websheet.Constant.Event.SCOPE_COLUMN;
		else 
			return;
		if(!source.uuid)
			return;
		var uuid  = source.uuid;
		var deltas = this._delta[uuid];
		if(deltas){
			 var parsedRef = websheet.Helper.parseRef(source.refValue);
			 var startIndex, endIndex;
			 if(type == websheet.Constant.Event.SCOPE_ROW){
				 startIndex = parsedRef.startRow;
				 endIndex = parsedRef.endRow;
			 }
			else if(type == websheet.Constant.Event.SCOPE_COLUMN){
				startIndex = parsedRef.startCol;
				endIndex = parsedRef.endCol;
			}
			for(var rangeId in deltas){
				var range = this.getRange(rangeId);
				if(range){
				 	var delta = deltas[rangeId];
				 	var rInfo = range._getRangeInfo();
			   
				   var end;
				   var start;
				   if(type == websheet.Constant.Event.SCOPE_ROW){
					   end = rInfo.endRow;
					   start = rInfo.startRow;
				   }else if(type == websheet.Constant.Event.SCOPE_COLUMN){
				   	   end = rInfo.endCol;
					   start = rInfo.startCol;
				   }
				    if(start < startIndex && end > endIndex)
			   			continue;
				   if(delta.startIndex ==1){
				   	    if(start != -1){
				   	    	if(startIndex + delta.delta == start)
				   	    		start = startIndex;
				   	    	else
				   	    		end = end + delta.delta;
				   	    }
				   	    else{
				   	    	start = startIndex;
				   	    	end = startIndex + delta.delta-1;
				   	    }				   	    
				   }else{
				   		if(start!= -1)
				   			start = start - delta.delta;
				   		else{
				   			start = startIndex+delta.startIndex-1;
				   			end = start + delta.delta -1;
				   		}
				   }
				   var rangeAddress;
				   var sheetName = rInfo.sheetName;
				   var refMask = websheet.Constant.CELL_MASK;
				   var params = {};
				   if(type == websheet.Constant.Event.SCOPE_ROW){
				   	  if(start != end || rInfo.startCol != rInfo.endCol)
				  	  		refMask = websheet.Constant.RANGE_MASK;
				   	  params.refMask = range._refMask ? range._refMask:refMask;
				   	  params.invalidRef = true;//keep the address for A#REF!
				  	  rangeAddress= websheet.Helper.getAddressByIndex(sheetName,start,rInfo.startCol,null,end,rInfo.endCol,params);			   	  				   
				   }else if(type == websheet.Constant.Event.SCOPE_COLUMN){
				   	   if(start != end || rInfo.startRow != rInfo.endRow)
				  	   		refMask = websheet.Constant.RANGE_MASK;
				   	   params.refMask = range._refMask ? range._refMask:refMask;
				   	   params.invalidRef = true;//keep the address for #REF!1
				   	   rangeAddress= websheet.Helper.getAddressByIndex(sheetName,rInfo.startRow,start,null,rInfo.endRow,end,params);			   	  			   
				   }
				   if(rangeAddress)
				  	 this.updateRange(range,rangeAddress, rInfo.sheetName);
				}				 
			}
			delete this._delta[uuid];
		}
		
	},
	
	//update the range address in undoRangeList
	//There is not usage for the ranges in undoRangeList, so updateRangeByUsage of RangeList is useless.
	updateRange:function(range, refValue, sheetName){		
		if(range){
			var oSheetId = range._sheetId;
			var osr = range._startRowId;
			var osc = range._startColId;
			var oer = range._endRowId;
			var oec = range._endColId;
			range.updateAddress(refValue, sheetName);
			var sheet = this._get(range._sheetId, true);
			if(sheet.range[range.rangeId]){
				//update row / column
				this.modifyRange(sheet, range.rangeId, websheet.Constant.OPType.ROW, osr, range._startRowId, oer, range._endRowId);
				this.modifyRange(sheet, range.rangeId, websheet.Constant.OPType.COLUMN, osc, range._startColId, oec, range._endColId);
			}
		}
	},
	
	//called in RangeList.preDelete
	//the delta data for ranges in undo stack should be collected in predelete event
	//the delta data is stored in this._delta
	_addPredeleteRange:function(event, rangeInfo, rangeModel)
	{
		var type;
		if(event._source.refType == websheet.Constant.OPType.ROW)
			type =  websheet.Constant.Event.SCOPE_ROW;
		else if(event._source.refType == websheet.Constant.OPType.COLUMN)
			type = websheet.Constant.Event.SCOPE_COLUMN;
		else 
			return;
		if(!event._source.uuid) return;
		
		var uuid = event._source.uuid;
		
		//if delete column A for range Sheet1!1:2, then do not need get range delta
		if((rangeModel._type == websheet.Constant.RangeType.ROW && type == websheet.Constant.Event.SCOPE_COLUMN)
				|| (rangeModel._type == websheet.Constant.RangeType.COLUMN && type == websheet.Constant.Event.SCOPE_ROW))
			return;
		if(!rangeInfo)
			rangeInfo = rangeModel._getRangeInfo();
		//the address must be the old address before delete
		var rangeParsedRef = new websheet.parse.ParsedRef(rangeInfo.sheetName,rangeInfo.startRow, rangeInfo.startCol, rangeInfo.endRow, rangeInfo.endCol, websheet.Constant.RANGE_MASK );
		var refValue  = event._source.refValue;
		var deltaData = websheet.Utils.getRangeDelta(rangeParsedRef,websheet.Helper.parseRef(refValue),type);
		if(!this._delta[uuid])
			this._delta[uuid] = {};
		this._delta[uuid][rangeModel.getRangeId(true)] = deltaData;
	},
	
	notify:function(source, event)
	{
		if(event._type == websheet.Constant.EventType.DataChange)
		{
			var s = event._source;
			switch(s.action) {
			case websheet.Constant.DataChange.PREDELETE:
				this.preDelete(s, false, event);
				break;
			case websheet.Constant.DataChange.INSERT:
				this.restoreUndoRanges(s);
				this.insert(s);
				break;
			}
		}
	}
});