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

dojo.provide("websheet.event.undo.ColumnEvents");

dojo.require("websheet.event.undo.ColumnEvent");
dojo.declare("websheet.event.undo.SetColumnEvent",websheet.event.undo.SetUnnamedRangeEvent,{
	
	_bUndoDefault: false, // flag to represent the action is the undo of set default style
	_strBUndoDefault: websheet.Constant.bUndoDefault,
	
	constructor: function(jsonEvent,idManager)
	{
		this._bColumn = true;
		this._cols = {};
		var data = jsonEvent.data;
		if(data)
		{
			if(data[this._strBUndoDefault])
				this._bUndoDefault = true;;
			if(data.rows || data.columns)	
				this._type = websheet.Constant.DATA_TYPE.MAP;
			else
				this._type = websheet.Constant.DATA_TYPE.STYLE;
		}	
		this._transformColumn2Id();
		this._initIdRange();
		this._initRowsIdRange();
	},
	
	_isExpandRowsMap: function()
	{
		return false;
	},
	
	_initRowsIdRange: function()
	{
		if(this.jsonEvent.data && this.jsonEvent.data.rows)
		{
			var rows = this.jsonEvent.data.rows;
			var maxRow = 1;
			for(var rIndex in rows)
			{
				rIndex = parseInt(rIndex);
				var repNum = rows[rIndex].rn;
				var er = repNum ? rIndex + parseInt(repNum) : rIndex;
				if(er > maxRow)
					maxRow = er;
			}
			var maxSheetRows = this._idManager.maxRow;
			if(maxRow > maxSheetRows)
				maxRow = maxSheetRows;
			this._rowsIdRange = [];
			var sheetId = this.refTokenId.getSheetId();
			this._rowsIdRange =  this._idManager.getRowIdArrayByIndex(sheetId, 0, maxRow-1,true);
		}	
	},
	
	_checkRelated: function(token)
	{
		if(token.type == websheet.Constant.Event.SCOPE_COLUMN)
		{
			var scIndex = token.getStartColIndex();
			var ecIndex = token.getEndColIndex();
			if(ecIndex == -1) ecIndex = scIndex;
			var colRangeList = this._getRangesIndex(websheet.Constant.OPType.COLUMN);
			var isRelated = true;
			for(var i = 0 ; i < colRangeList.length; i++)
			{
				var item = colRangeList[i];
				if(item)
				{			
					if(item.startCol <scIndex || item.endCol > ecIndex)
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
		}else
		{
			for(var i in jRowsMap)
			{
				var srIndex = parseInt(i);
				var repeatedNum = (jRowsMap[i].rn)? parseInt(jRowsMap[i].rn): 0;
				var erIndex = srIndex + repeatedNum;
				if( index>=srIndex && index <= erIndex)
				{
					ret = websheet.Helper.cloneJSON(jRowsMap[i]);
					var curRepNum =  erIndex - index;
					ret.rn = curRepNum;
					break;
				}
			}
		}
		return ret;
	},
	
	toJson: function()
	{
		var events = [];
		var sheetName = this.getSheetName();
		var colRanges = this._getRangesIndex(websheet.Constant.OPType.COLUMN);
		var rowRanges = this._getRangesIndex();
		
		var colsMetaArray = this._getColsMetaArray(colRanges);
		var jRowsMap = this.transformData2Index();
		
		var rowsMap = {}; 
		for(var i = 0; i < rowRanges.length; i++)
		{
			var srIndex = rowRanges[i].startRow;
			var erIndex = rowRanges[i].endRow;
			
			//get row event
			var rIndex = srIndex;
			
			while(rIndex <= erIndex)
			{
				var row = this.getRowJsonByIndex(rIndex,jRowsMap);
				if(row)
				{
					var rowRepNum = row.rn ? parseInt(row.rn):0;
					var rowERIndex = rIndex + rowRepNum;
					var curERIndex = (rowERIndex <= erIndex)?rowERIndex:erIndex;
					row.rn = curERIndex - rIndex;
					rowsMap[rIndex] = row;
					rIndex = curERIndex + 1;
				}else
					rIndex++;
			}
		}
		
		for(var j = 0; j < colRanges.length; j++)
		{
			var scIndex = colRanges[j].startCol;
			var ecIndex = colRanges[j].endCol;
			var event = websheet.Helper.cloneJSON(this.jsonEvent);
			var sc = websheet.Helper.getColChar(scIndex);
			var ec = sc;
			if(ecIndex > scIndex)
				ec = websheet.Helper.getColChar(ecIndex);
			event.reference.refValue=websheet.Helper.getAddressByIndex(sheetName, null, sc,null,null,ec,{refMask: websheet.Constant.COLS_MASK});	
			
			// the event such as set style show/hide, adjust the column width, need not to add the rows data
			// map only for the undo event of set style
			if(this._type == websheet.Constant.DATA_TYPE.MAP)
			{
				var rows = event.data.rows = {};
				for(var i = 0; i < rowRanges.length; i++)
				{
					var cells = this.getCellsJsonByIndex(scIndex, ecIndex, rowsMap);
					rows = dojo.mixin(rows,cells);
				}
				event.data.columns = colsMetaArray[j];
				if(this._bUndoDefault)
					event.data[this._strBUndoDefault] = true;
			}
			events.push(event);
		}
		return events;
	}
	
//	toJsonOld: function()
//	{
//		var event = {};
//		event.action = this.jsonEvent.action;
//		// reference
//		var sheetName = this.getSheetName();
//		// only for 1 column
//		var colIndex = this.getColRangeIndex()[0];
//		var strColIndex = websheet.Helper.getColChar(colIndex);
//		var params = {type: websheet.Constant.RangeType.COLUMN};
//		var refValue=websheet.Helper.getAddressByIndex(sheetName, null, strColIndex,null,null,null,params);
//		event.reference = {};
//		event.reference.refValue = refValue;
//		event.reference.refType = this.jsonEvent.reference.refType;
//		// data
//		var eventData = event.data = {};
//		var rowsJson = this.transformData2Index();
//		if (rowsJson != null) {
//			eventData["rows"] = rowsJson;
//		}
//		if (this.data.style) {
//			eventData["style"] = this.data.style;
//		}
//		if (this.data.width != null) {
//			eventData["width"] = this.data.width;
//		}
//		if (this.data.visibility !== undefined )
//			eventData["visibility"] = this.data.visibility;
//		if(this._bUndoDefault)
//			event.data[this._strBUndoDefault] = true;
//		return event;
//	}
});

dojo.declare("websheet.event.undo.InsertColumnEvent",[websheet.event.undo.ColumnEvent,websheet.listener.Listener],{
	_startColIndex: -1,
	_insertColCount: 0,
	_originStartIndex: -1,
	_colsIdCache: null,
	_colId: null,
	
	constructor: function(jsonEvent,idManager)
	{
		var scIndex = this.refTokenId.token.getStartColIndex();
		var ecIndex = this.refTokenId.token.getEndColIndex();
		if(ecIndex < scIndex) ecIndex = scIndex;
		this._startColIndex = scIndex;
		this._originStartIndex = scIndex;
		this._insertColCount = ecIndex - scIndex + 1;
		if (this.data.meta) {
			this._colsIdCache = websheet.Helper.cloneJSON(this.data.meta);
		}
		if(!idManager)
			this.startListening(this.controller);
		
		if (this.data.rows) {
			this._transformData2Id(this.data.rows);
		}
	},
	
	_transformData2Id: function(jsonRowsMap) {
		// for single column
		if (this._startColIndex == -1) {
			// early entering from RowEvent
			return;
		}
		var sheetId = this.refTokenId.getSheetId();
		var sheetName  = this.getSheetName();
		var msgTransformer = this.getMsgTransformer()
		for (var rIndex in jsonRowsMap) {
			var jRow = jsonRowsMap[rIndex];
			var srIndex = parseInt(rIndex);
			var rn = jRow.rn ? parseInt(jRow.rn) : 0;
			var row = {};
			if(rn == 0)
			{
				row.rId = this._idManager.getRowIdByIndex(sheetId,srIndex-1,true);
			}
			else
			{
				var erIndex = srIndex + rn;
				var address = srIndex + ":" + erIndex;
				var range = new websheet.event.undo.Range(address,sheetName,this._idManager);
				var rangeId = msgTransformer.addRange(range,this.bTrans);
				row.rangeId = rangeId;
				this._rangeIdList.push(rangeId);
			}
			for (var colId in this._colsIdCache){
				var colName = websheet.Helper.getColChar(this._colsIdCache[colId]);
				if (jRow.cells && jRow.cells[colName]){
					var cell = jRow.cells[colName];
					if(!row.cells) row.cells = {};
					row.cells[colId] = cell;
				}
			}
			this._rows.push(row);
		}
	},
	
	_checkRelated: function(token)
	{
		// for the ui insert action, it always can be redo
		if(this._type ==  websheet.Constant.DATA_TYPE.NONE)
		{
			return false;
		}
		// for the undo of delete action, if has undo, then 
		else
		{
			if(token.type == websheet.Constant.Event.SCOPE_COLUMN)
			{
				// first check the reference ;
				var scIndex = token.getStartColIndex();
				var ecIndex = token.getEndColIndex();
				if(ecIndex == -1) ecIndex = scIndex;
				
				var curSCIndex = this._startColIndex;
				var curECIndex = this._startColIndex + this._insertColCount -1;
				if(curSCIndex >= scIndex && curECIndex <= ecIndex)
					return true;
				return false;
			}
			return false;
		}
	},
	
	_checkDataRelated: function (token) {
		if (token.type == websheet.Constant.Event.SCOPE_COLUMN) {
			var scIndex = token.getStartColIndex();
			var ecIndex = token.getEndColIndex();
			if (ecIndex == -1) {
				ecIndex = scIndex;
			}
			var rows, row, cells;
			if (this.data != null && ((rows = this.data.rows) != null)) {
				for (var key in rows) {
					// key are row index;
					row = rows[key];
					if (row && (cells = row.cells)) {
						for (var col in cells) {
							var colidx = websheet.Helper.getColNum(col);
							if (colidx >= scIndex && colidx <= ecIndex) {
								// we only cares about merge/cover cells;
								if (cells[col].cs || cells[col].ic) {
									return true;
								}
							}
						}
					}
				}
			}
		}
	},
	
	notify: function(source, event)
	{
		if(event._type == websheet.Constant.EventType.DataChange)
		{
			var s = event._source;
			if(s.mode == websheet.Constant.MSGMode.NORMAL && s.refType == websheet.Constant.OPType.COLUMN)
			{
				var parsedRef = s.refValue;
				var sheetName = this.getSheetName();
				if(parsedRef.sheetName != sheetName) return;
				var scIndex = parsedRef.startCol;
				var ecIndex = parsedRef.endCol;
				if(s.action == websheet.Constant.DataChange.PREDELETE)
				{
					var deleteCnt = 0;
					if(scIndex < this._startColIndex)
					{
						var endCol = (ecIndex < this._startColIndex)?ecIndex: this._startColIndex -1;
						deleteCnt = endCol - scIndex + 1;
						this._startColIndex -= deleteCnt;
					}
					if(this._colsIdCache && deleteCnt > 0)
					{
						for(var colId in this._colsIdCache)
						{
							var colIndex = parseInt(this._colsIdCache[colId]);
							colIndex -= deleteCnt;
							this._colsIdCache[colId] = colIndex;
						}
					}
				}
				else if(s.action == websheet.Constant.DataChange.INSERT)
				{
					var insertCnt = 0;
					if(scIndex <= this._startColIndex)
					{
						if(s.mode==websheet.Constant.MSGMode.UNDO && scIndex == this._startColIndex)
						{
							if(scIndex<this._originStartIndex)
							{
								insertCnt = ecIndex - scIndex + 1;
								this._startColIndex += insertCnt;
							}
						}
						else
						{
							insertCnt = ecIndex - scIndex + 1;
							this._startColIndex += insertCnt;
						}
					}
					if(this._colsIdCache && insertCnt > 0)
					{
						for(var colId in this._colsIdCache)
						{
							var colIndex = parseInt(this._colsIdCache[colId]);
							colIndex += insertCnt;
							this._colsIdCache[colId] = colIndex;
						}
					}
				}
			}
		}
	},
	
	_getColIndex: function(colId)
	{
		return this._colsIdCache[colId];
	},
	
	updateIDManager : function (idm, reverse,dltIds)
	{
		var sheetId = this.refTokenId.getSheetId();
		
		var count = this._insertColCount;
		
		var scIndex = this._startColIndex -1;
		var ecIndex = scIndex + count - 1;

		if (!reverse)
		{
			idm.insertColAtIndex(sheetId, scIndex, count);
			if(dltIds)
			{
				for(var i = scIndex; i <= ecIndex; i++)
				{
					if(dltIds[i-scIndex])
						idm.setColIdByIndex(sheetId,i,dltIds[i-scIndex]);
				}
			}
		}
		else
			idm.deleteColAtIndex(sheetId, scIndex, count);
			
		return true;
	},
	
	transformData2Index: function() {
		var ret = {};
		var idm = this._idManager;
		var rows = this._rows;
		var l = rows.length;
		var msgTransformer = this.getMsgTransformer();
		var rangeList = msgTransformer.getRangeList(this.bTrans);
		var sheetId = this.refTokenId._sheetId;
		
		for (var i = 0; i < l; i++) {
			var row = rows[i];
			var cells = row.cells;
			var rn = 0;
			if (row.rId) {
				var rIndex = idm.getRowIndexById(sheetId, row.rId);
				if (rIndex == -1) {
					continue;
				}
				rIndex += 1;
			} else if (row.rangeId) {
				var range = rangeList.getRange(row.rangeId, sheetId);
				if(!range) continue;
				var rst = this.getRangeInfo(range);
				if (rst.startRow == -1) {
					continue;
				}
				rn = (rst.endRow >= rst.startRow) ? (rst.endRow - rst.startRow ) : 0;
				rIndex = rst.startRow;
			}
			var retRow = {};
			if (rn > 0) {
				retRow["rn"] = rn;
			}
			var retCells = {};
			for(var colId in this._colsIdCache){
				if (cells && cells[colId]) {
					var colName = websheet.Helper.getColChar(this._colsIdCache[colId]);
					retCells[colName] = cells[colId];
				}
			}
			retRow["cells"] = retCells, ret[rIndex] = retRow;
		}
		return ret;
	},
	
	clear: function()
	{
		this.inherited(arguments);
		this.endListening(this.controller);
	},
	
	toJson: function()
	{
		var endCol = this._startColIndex + this._insertColCount - 1;
		var sheetName = this.getSheetName();
		var refValue=null;
		var params = {refMask: websheet.Constant.COLS_MASK};
		if(endCol > this._startColIndex){
			refValue=websheet.Helper.getAddressByIndex(sheetName, null, this._startColIndex,null,null,endCol,params);
		}
		else
			refValue=websheet.Helper.getAddressByIndex(sheetName, null, this._startColIndex,null,null,null,params);
		var msg = new websheet.event.InsertColumn(refValue).getMessage();
		var msgData = msg.updates[0].data;
		if(this._type == websheet.Constant.DATA_TYPE.NONE)
		{
			if(this._colsIdCache)
				msgData.meta = this._colsIdCache;
			//return msg.updates[0];
		}
		else if(this._type == websheet.Constant.DATA_TYPE.MAP)
		{
			var rows = this.transformData2Index();
			msgData.rows = rows;
			if (this.data.columns) {
				msgData.columns = {};
				var delta = this._startColIndex - this._originStartIndex;
				for(var col in this.data.columns)
				{
					msgData.columns[websheet.Helper.getColChar(websheet.Helper.getColNum(col) + delta)]
						= this.data.columns[col];
				}
			}
			if(this._colsIdCache) {
				msgData.meta = this._colsIdCache;
			}
			//return msg.updates[0];
		}
		if(this.jsonEvent.data){ 
			if(this.jsonEvent.data.undoRanges)
			{
				//here for the undoRanges, if they are access permission, need to do check before restore it
				var aclHandler = this.controller.editor.getACLHandler();
				if(aclHandler)
				{
					var newRanges = aclHandler._behaviorCheckHandler.filterUndoRanges(this.jsonEvent.data.undoRanges, sheetName,this._startColIndex,false);
					if(Object.keys(newRanges).length > 0)
						msgData.undoRanges = newRanges;
				}
				else
					msgData.undoRanges = this.jsonEvent.data.undoRanges;
			}	
			if(this.jsonEvent.data.undoCharts)
				msgData.undoCharts = this.jsonEvent.data.undoCharts;
			if(this.jsonEvent.data.undoFreeze)
				msgData.undoFreeze = this.jsonEvent.data.undoFreeze;
			if(this.jsonEvent.data.uuid)
				msgData.uuid = this.jsonEvent.data.uuid;
		}
		return msg.updates[0];
	},
	
	hasStructChange: function()
	{
		return true;
	}
});

dojo.declare("websheet.event.undo.DeleteColumnEvent",websheet.event.undo.ColumnEvent,{
	
	constructor: function(jsonEvent,idManager)
	{
		dojo.mixin(this, jsonEvent);
	},
	
	/*
	 * two type, first is the ui delete action, second is the undo of insert
	 */
	_checkRelated: function(token)
	{
		if(token.type == websheet.Constant.Event.SCOPE_COLUMN)
		{
			var tScIndex = token.getStartColIndex();
			var tEcIndex = token.getEndColIndex();
			if(tEcIndex == -1) tEcIndex = tScIndex;
			
			this.refTokenId.updateToken(this._idManager);
			var scIndex = this.refTokenId.token.getStartColIndex();
			var ecIndex = this.refTokenId.token.getEndColIndex();
			if(ecIndex == -1) ecIndex = scIndex;
			
			if(scIndex == -1)
			{
				return false;
			}else
			{
				if(scIndex >= tScIndex && ecIndex <= tEcIndex)
					return true;
				else 
				    return false;
			}
		}
		return false;
	},
	
	updateIDManager : function (idm, reverse)
	{
		var sheetId = this.refTokenId.getSheetId();
		
		var count = 1;
		
		var scIndex = this.refTokenId.token.getStartColIndex();
		if(scIndex == -1)
		{
			console.log("delete message in sendout list transform error !!!");
			return;
		}
		else 
			scIndex--;
		var ecIndex = this.refTokenId.token.getEndColIndex() ;
		if(ecIndex == -1)
			ecIndex = scIndex;
		else
			ecIndex--;

		if (scIndex != -1 && ecIndex != -1)
		{
			count = ecIndex - scIndex + 1;
		}
		if (!reverse)
			idm.deleteColAtIndex(sheetId, scIndex, count);
		else
			idm.insertColAtIndex(sheetId, scIndex, count);
			
		return true;
	},
	
	toJson: function()
	{
		this.transformRef2Index();
		var iStartColIdx = this.refTokenId.token.getStartColIndex(), iEndColIdx = this.refTokenId.token.getEndColIndex();
		if(iStartColIdx <=0) return null;
		var params = {refMask: websheet.Constant.COLS_MASK};
		var refValue = null;
		if(iEndColIdx && iEndColIdx > iStartColIdx)
			refValue = websheet.Helper.getAddressByIndex(this.getSheetName(), null, iStartColIdx, null, null, iEndColIdx, params);
		else
			refValue = websheet.Helper.getAddressByIndex(this.getSheetName(), null, iStartColIdx, null, null, null, params);
		var jEvent = websheet.Helper.cloneJSON(this.jsonEvent);
		jEvent.reference.refValue = refValue;
		return jEvent;
	},
	
	hasStructChange: function()
	{
		return true;
	}
});
