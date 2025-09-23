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

dojo.provide("websheet.event.undo.RowEvents");

dojo.require("websheet.event.undo.RowEvent");
dojo.require("websheet.listener.Listener");
dojo.require("websheet.event.Factory");

/*
 * SetRowEvent cover three type event: 
 * (1) set row style
 * (2) undo event for set row style
 * (3) undo event for clear row
 */
dojo.declare("websheet.event.undo.SetRowEvent",websheet.event.undo.RowEvent, {
	
	_bUndoDefault: false, // flag to represent the action is the undo of set default style
	_strBUndoDefault: websheet.Constant.bUndoDefault,
	
	constructor: function(jsonEvent,idManager)
	{
		dojo.mixin(this, jsonEvent);
		if(jsonEvent.data && jsonEvent.data[this._strBUndoDefault])
			this._bUndoDefault = true;
	},
	
	_checkRelated: function(token)
	{
		if(token.type == websheet.Constant.Event.SCOPE_ROW)
		{
			var srIndex = token.getStartRowIndex();
			var erIndex = token.getEndRowIndex();
			if(erIndex == -1) erIndex = srIndex;

			var rowRangeIdList = this.getRowRangeIndex();
			var isRelated = true;
			for(var i = 0 ; i < rowRangeIdList.length; i++)
			{
				if(rowRangeIdList[i] > 0)
				{			
					if(rowRangeIdList[i] <srIndex || rowRangeIdList[i] > erIndex)
					{
						isRelated = false;
						break;
					}
				}
			}
			return isRelated;
		}
		return false;
	},
	
	/*
	 * return the rowjosn in jRowsMap, the index is between the srIndex and erIndex
	 */
	getRowJsonByIndex: function(index, jRowsMap)
	{
		var ret = null;
		if(jRowsMap[index])
		{
			ret = websheet.Helper.cloneJSON(jRowsMap[index]);
		}else{
			
			for(var i in jRowsMap)
			{
				var srIndex = parseInt(i);
				var repeatedNum = (jRowsMap[i].rn)? parseInt(jRowsMap[i].rn): 0;
				var erIndex = srIndex + repeatedNum;
				if( index>=srIndex && index <= erIndex)
				{
					ret = websheet.Helper.cloneJSON(jRowsMap[i]);
					ret.rn = erIndex - index;
					break;
				}
			}
			if(!ret)
			{
				var rId = this._idManager.getRowIdByIndex(this.refTokenId.getSheetId(),index -1);
				if(rId && this._rowsId2JsonMap[rId])
				{
					var jRow = {};
					var cells = this.transformCells2Index(this._rowsId2JsonMap[rId]);
					if(cells) jRow.cells = cells;
					else jRow.cells = {};
					jRow.rn = 0;
					ret = jRow;
				}
			}
		}
		return ret;
	},
	
	
	toJson: function()
	{
		var newRowRange = this.getUpdatedRowRange();
		var events = [];
		var sheetName = this.getSheetName();
		var jRowsMap = this.transformData2Index();
		for(var i = 0; i < newRowRange.length; i++)
		{
			var srIndex = newRowRange[i].startRow;
			var erIndex = newRowRange[i].endRow;

			var	event = websheet.Helper.cloneJSON(this.jsonEvent);
			var params = {refMask : websheet.Constant.ROWS_MASK};
			if(erIndex > srIndex)
				event.reference.refValue=websheet.Helper.getAddressByIndex(sheetName, srIndex, null,null,erIndex,null,params);
			else
				event.reference.refValue=websheet.Helper.getAddressByIndex(sheetName, srIndex, null,null,null,null,params);	
			
			if(this._type == websheet.Constant.DATA_TYPE.MAP)
			{
				var rIndex = srIndex;
				var rowsMap = event.data.rows = {};
				while(rIndex <= erIndex)
				{
					var row = this.getRowJsonByIndex(rIndex,jRowsMap);
					if(row)
					{
						var rowRepNum = row.rn ? parseInt(row.rn):0;
						var rowERIndex = rIndex + rowRepNum;
						var curERIndex = (rowERIndex <= erIndex)?rowERIndex:erIndex;
						var curRpeNum = curERIndex - rIndex;
						row.rn = curRpeNum;
						rowsMap[rIndex] = row;
						rIndex = curERIndex + 1;
					}else
					{
						rIndex++;
					}
				}
			}
			if(this._bUndoDefault)
				event.data[this._strBUndoDefault] = true;
			events.push(event);
		}
		return events;
	}
	
});

/*
 * InsertRowEvent cover two type events:
 * (1) insert row event
 * (2) undo event for delete row
 */
dojo.declare("websheet.event.undo.InsertRowEvent",[websheet.event.undo.RowEvent,websheet.listener.Listener],{
	
	_startRowIndex: -1,
	_insertRowCount: 0,
	_originStartIndex: -1,
	_rowsIdCache: null, // keep the deleted rowid and according index
	
	constructor: function(jsonEvent,idManager)
	{
		dojo.mixin(this, jsonEvent);
		this._startRowIndex = this.refTokenId.token.getStartRowIndex();
		this._originStartIndex = this._startRowIndex;
		var erIndex = this.refTokenId.token.getEndRowIndex();
		if(erIndex < this._startRowIndex ) erIndex = this._startRowIndex;
		this._insertRowCount = erIndex - this._startRowIndex + 1;
		if(!idManager)
			this.startListening(this.controller);
	},
	
	_getRowIndex2IdMap: function()
	{
		var index2IdMap = {};
		for(var rowId in this._rowsIdCache)
		{
			var rowIndex = this._rowsIdCache[rowId];
			index2IdMap[rowIndex] = rowId;
		}
		return index2IdMap;
	},
	
	setRowsIdCache: function(rowsId2IndexMap)
	{
		this._rowsIdCache = rowsId2IndexMap;
	},
	
	_transformData2Id: function(jsonRowsMap)
	{
		this._rowsIdCache = websheet.Helper.cloneJSON(this.jsonEvent.data.meta);
		var index2IdMap = this._getRowIndex2IdMap();
		this._needCheckFormula = false;
		for(var rIndex in jsonRowsMap)
		{
			var jRow = jsonRowsMap[rIndex];
			var srIndex = parseInt(rIndex);
			var repeatedNum = jRow.rn ? parseInt(jRow.rn):0;
			var cells = this.transformCells2Id(srIndex,jRow.cells);
			var row = {};
//			row.id = jRow.id;
			row[websheet.Constant.Style.HEIGHT] = jRow[websheet.Constant.Style.HEIGHT];
			row.visibility = jRow.visibility;
			row.id = index2IdMap[rIndex];
			row.cells = cells;
			row.rn = repeatedNum;
			this._rows.push(row);
//			this._rowsIdCache[row.id] = srIndex;
		}
	},
	
	transformData2Index: function()
	{
		var data = {};
		var jRows = data.rows = {};
		if(this._rows)
		{
			var msgTransformer = this.getMsgTransformer();
			var sheetId = this.refTokenId._sheetId;
			var wcs = websheet.Constant.Style;
			//step 1: all the none foumla cells
			for(var i = 0; i < this._rows.length; i++)
			{
				var row = this._rows[i];
				var rowid = row.id;
				var rIndex = this._rowsIdCache[rowid];
				if(rIndex)
				{
					var jRow = {};
					var jCells = this.transformCells2Index(row.cells);
					if(jCells) jRow.cells = jCells;
					//set row height starts
                    if(row[wcs.HEIGHT]){                        
                        jRow[wcs.HEIGHT] = row[wcs.HEIGHT];
                    }
                    if (row.visibility != undefined) {
                    	jRow.visibility = row.visibility;
                    }
                    //set row height ends
					jRow.rn = row.rn;
					jRows[rIndex] = jRow;
				}
			}
		}
		if(this._rowsIdCache) data.meta = this._rowsIdCache;
		return data;
	},

	_checkRelated: function(token)
	{
		// for the ui insert action, it always can be redo
		if(this._type == websheet.Constant.DATA_TYPE.NONE)
		{
			return false;
		}
		else
		{
			// for the undo of delete action, the state return here is wrong,
			// it totally rely on the state of delete action
			if(token.type == websheet.Constant.Event.SCOPE_ROW)
			{
				var tSrIndex = token.getStartRowIndex();
				var tErIndex = token.getEndRowIndex();
				if(tErIndex == -1) tErIndex = tSrIndex;
				
				var srIndex = this._startRowIndex;
				var erIndex = srIndex + this._insertRowCount - 1;

				if(srIndex == -1)
				{
					return false;
				}else
				{
					if(srIndex >= tSrIndex && erIndex <= tErIndex)
						return true;
					else 
					    return false;
				}
			}
			return false;			
		}
	},
	
	_getRangeInfo: function(range)
	{
		var rst = {};
		result.startRow = -1;
		result.endRow = -1;
		if(this._rowsIdCache[range._startRowId]) rst.startRow = this._rowsIdCache[range._startRowId];
		if(this._rowsIdCache[range._endRowId]) rst.endRow = this._rowsIdCache[range._endRowId];
		return rst;
	},
	
	/*
	 * update the _startRowIndex and the index in _rowsIdCache
	 */
	notify: function(source, event)
	{
		if(event._type == websheet.Constant.EventType.DataChange)
		{
			var s = event._source;
			if(s.mode != undefined && s.mode == websheet.Constant.MSGMode.NORMAL 
			 && s.refType == websheet.Constant.OPType.ROW && 
			   (s.action == websheet.Constant.DataChange.PREDELETE || s.action == websheet.Constant.DataChange.INSERT))
			{
				var parsedRef = s.refValue;
				var sheetName = this.getSheetName();
				if(parsedRef.sheetName != sheetName) return;
				if(s.action == websheet.Constant.DataChange.PREDELETE)
				{
					var deleteCnt = 0;
					if( parsedRef.startRow < this._startRowIndex)
					{
						var endRow = (parsedRef.endRow < this._startRowIndex ) ? parsedRef.endRow : this._startRowIndex -1;
						deleteCnt = endRow - parsedRef.startRow + 1;
						this._startRowIndex -= deleteCnt;
					}
					if(this._rowsIdCache && deleteCnt > 0)
					{
						for(var rowId in this._rowsIdCache)
						{
							var rIndex = parseInt(this._rowsIdCache[rowId]);
							rIndex -= deleteCnt;
							this._rowsIdCache[rowId] = rIndex;
						}
					}
				}
				else if(s.action == websheet.Constant.DataChange.INSERT)
				{
					var insertCnt = 0;
					if( parsedRef.startRow <= this._startRowIndex)
					{
						if(s.mode==websheet.Constant.MSGMode.UNDO && parsedRef.startRow == this._startRowIndex)
						{
							if(parsedRef.startRow < this._originStartIndex)
							{
								insertCnt = parsedRef.endRow -  parsedRef.startRow + 1;
								this._startRowIndex += insertCnt;
							}
						}
						else
						{
							insertCnt = parsedRef.endRow -  parsedRef.startRow + 1;
							this._startRowIndex += insertCnt;
						}
					}
					if(this._rowsIdCache && insertCnt > 0)
					{
						for(var rowId in this._rowsIdCache)
						{
							var rIndex = parseInt(this._rowsIdCache[rowId]);
							rIndex += insertCnt;
							this._rowsIdCache[rowId] = rIndex;
						}
					}
				}
			}
		}
	},
	
	getRefValue: function()
	{
		var startRowId = this.refTokenId._startRowId;
		var endRowId = this.refTokenId._endRowId;
		var startRowIndex = this._rowsIdCache[startRowId];
		var endRowIndex = this._rowsIdCache[endRowId];
		var sheetName = this.getSheetName();
		var refValue=null;
		var params = {refMask : websheet.Constant.ROWS_MASK};
		if(endRowIndex && endRowIndex > startRowIndex)
			refValue=websheet.Helper.getAddressByIndex(sheetName, startRowIndex, null,null,endRowIndex,null,params);
		else
			refValue=websheet.Helper.getAddressByIndex(sheetName, startRowIndex, null,null,null,null,params);
		
		return refValue;
	},
	
	updateIDManager: function(idm, reverse,dltIds) 
	{
		var sheetId = this.refTokenId.getSheetId();
		
		var count = this._insertRowCount;
		var scIndex = this._startRowIndex - 1;
		var ecIndex = scIndex + count - 1;

		if (!reverse )
		{
			idm.insertRowAtIndex(sheetId, scIndex, count);
			if(dltIds)
			{
				for(var i = scIndex; i <= ecIndex; i++ )
				{
					if(dltIds[i-scIndex])
						idm.setRowIdByIndex(sheetId,i,dltIds[i-scIndex]);
				}
			}
		}
		else
			idm.deleteRowAtIndex(sheetId, scIndex, count);

		return true;
	},
	
	clear: function()
	{
		this.inherited(arguments);
		this.endListening(this.controller);
	},
	
	toJson: function()
	{
		var endRow = this._startRowIndex + this._insertRowCount -1;
		var refValue=null;
		var sheetName = this.getSheetName();
		var params = {refMask : websheet.Constant.ROWS_MASK};
		if(endRow > this._startRowIndex)
			refValue=websheet.Helper.getAddressByIndex(sheetName, this._startRowIndex, null,null,endRow,null,params);
		else
			refValue=websheet.Helper.getAddressByIndex(sheetName, this._startRowIndex, null,null,null,null,params);
		var msg = new websheet.event.InsertRow(refValue).getMessage();
		if(this._type == websheet.Constant.DATA_TYPE.NONE)
		{
//			if(this.jsonEvent.meta)
			if(this._rowsIdCache)
				msg.updates[0].data.meta = this._rowsIdCache;
			//return msg.updates[0];
		}
		else
		{
			var data = this.transformData2Index();
			var event = msg.updates[0];
			event.data = data;
			//return msg.updates[0];
		}
		if(this.jsonEvent.data){ 
			if(this.jsonEvent.data.undoRanges)
			{
				//here for the undoRanges, if they are access permission, need to do check before restore it
				var aclHandler = this.controller.editor.getACLHandler();
				if(aclHandler)
				{
					var newRanges = aclHandler._behaviorCheckHandler.filterUndoRanges(this.jsonEvent.data.undoRanges, sheetName,this._startRowIndex,true);
					if(Object.keys(newRanges).length > 0)
						msg.updates[0].data.undoRanges = newRanges;
				}
				else
					msg.updates[0].data.undoRanges = this.jsonEvent.data.undoRanges;
			}
			if(this.jsonEvent.data.undoCharts)
				msg.updates[0].data.undoCharts = this.jsonEvent.data.undoCharts;
			if(this.jsonEvent.data.undoFreeze)
				msg.updates[0].data.undoFreeze = this.jsonEvent.data.undoFreeze;
			if(this.jsonEvent.data.uuid)
				msg.updates[0].data.uuid = this.jsonEvent.data.uuid;
		}
		return msg.updates[0];
	},
	
	hasStructChange: function()
	{
		return true;
	}
});


dojo.declare("websheet.event.undo.DeleteRowEvent",websheet.event.undo.RowEvent,{
	
	
	constructor: function(jsonEvent,idManager)
	{
		dojo.mixin(this, jsonEvent);
//		this.transformRef2Id();
	},
	
	/*
	 * two type, first is the ui delete action, second is the undo of insert
	 */
	_checkRelated: function(token)
	{
		if(token.type == websheet.Constant.Event.SCOPE_ROW)
		{
			var tSrIndex = token.getStartRowIndex();
			var tErIndex = token.getEndRowIndex();
			if(tErIndex == -1) tErIndex = tSrIndex;
			
			this.refTokenId.updateToken(this._idManager);
			var srIndex = this.refTokenId.token.getStartRowIndex();
			var erIndex = this.refTokenId.token.getEndRowIndex();
			if(erIndex == -1) erIndex = srIndex;
			
			if(srIndex == -1)
			{
				return false;
			}else
			{
				if(srIndex >= tSrIndex && erIndex <= tErIndex)
					return true;
				else 
				    return false;
			}
		}
		return false;
	},
	
	/*
	 *for delete action,  it always should be one action, and will not split into several sub-action 
	 */
	getRefValue: function()
	{
		this.transformRef2Index();
		var newRowRange = this.getUpdatedRowRange();
		if(newRowRange.length == 0) return null;
		var srIndex = newRowRange[0].startRow;
		var erIndex = newRowRange[0].endRow;
		for(var i = 1 ; i < newRowRange.length; i++)
		{
			var item = newRowRange[i];
			if(item.startRow< srIndex) srIndex = item.startRow;
			if(item.endRow > erIndex) erIndex = item.endRow;
		}
		
		var refValue=null;
		var params = {refMask : websheet.Constant.ROWS_MASK};
		if(erIndex > srIndex)
			refValue=websheet.Helper.getAddressByIndex(this.getSheetName(), srIndex, null,null,erIndex,null,params);
		else
			refValue=websheet.Helper.getAddressByIndex(this.getSheetName(), srIndex, null,null,null,null,params);
		return refValue;
	},
	
	updateIDManager: function(idm, reverse) 
	{
		var sheetId = this.refTokenId.getSheetId();
		
		var count = 1;
		var scIndex = this.refTokenId.token.getStartRowIndex() ;
		if(scIndex == -1) 
		{
			console.log("delete message in sendout list transform error !!!");
			return;
		}
		else 
			scIndex--;
		var ecIndex = this.refTokenId.token.getEndRowIndex();
		if(ecIndex == -1) ecIndex = scIndex;
		else ecIndex--;
		
		if (scIndex != -1 && ecIndex != -1)
		{
			count = ecIndex - scIndex + 1;
		}
		if (!reverse)
			idm.deleteRowAtIndex(sheetId, scIndex, count);
		else
			idm.insertRowAtIndex(sheetId, scIndex, count);

		return true;
	},
	
	toJson: function()
	{
		var refValue = this.getRefValue();
		if(refValue == null) return null;
		var jEvent = websheet.Helper.cloneJSON(this.jsonEvent);
		jEvent.reference.refValue = refValue;
		return jEvent;
	},
	
	hasStructChange: function()
	{
		return true;
	}
});

dojo.declare("websheet.event.undo.ClearRowEvent",websheet.event.undo.RowEvent,{
	constructor: function(jsonEvent,idManager)
	{
		dojo.mixin(this, jsonEvent);
	},
	
	
	_checkRelated: function(token)
	{
		if(token.type == websheet.Constant.Event.SCOPE_ROW)
		{
			var tSrIndex = token.getStartRowIndex();
			var tErIndex = token.getEndRowIndex();
			if(tErIndex == -1) tErIndex = tSrIndex;
			
			this.refTokenId.updateToken(this._idManager);
			var srIndex = this.refTokenId.token.getStartRowIndex();
			var erIndex = this.refTokenId.token.getEndRowIndex();
			if(erIndex == -1) erIndex = srIndex;
			
			if(srIndex == -1)
			{
				return false;
			}else
			{
				if(srIndex >= tSrIndex && erIndex <= tErIndex)
					return true;
				else 
				    return false;
			}
		}
		return false;
	},
	
	/*
	 *for clear action,  it always should be one action, and will not split into several sub-action 
	 */
	getRefValue: function()
	{
		this.transformRef2Index();
		var newRowRange = this.getUpdatedRowRange();
		if(newRowRange.length == 0) return null;
		var srIndex = newRowRange[0].startRow;
		var erIndex = newRowRange[0].endRow;
		for(var i = 1 ; i < newRowRange.length; i++)
		{
			var item = newRowRange[i];
			if(item.startRow< srIndex) srIndex = item.startRow;
			if(item.endRow > erIndex) erIndex = item.endRow;
		}
		var sheetName = this.getSheetName();
		var refValue=null;
		var params = {refMask : websheet.Constant.ROWS_MASK};
		if(erIndex > srIndex)
			refValue=websheet.Helper.getAddressByIndex(sheetName, srIndex, null,null,erIndex,null,params);
		else
			refValue=websheet.Helper.getAddressByIndex(sheetName, srIndex, null,null,null,null,params);
		return refValue;
	},
	
	toJson: function()
	{
		var refValue = this.getRefValue();
		if(refValue == null) return null;
		var jEvent = websheet.Helper.cloneJSON(this.jsonEvent);
		jEvent.reference.refValue = refValue;
		return jEvent;
	}
});
