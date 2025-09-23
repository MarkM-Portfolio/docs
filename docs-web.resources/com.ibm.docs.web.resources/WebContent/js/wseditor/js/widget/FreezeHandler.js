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
dojo.provide("websheet.widget.FreezeHandler");
dojo.require("websheet.widget.FreezeBar");

dojo.declare('websheet.widget.FreezeHandler', websheet.listener.Listener,{
	
	_restoreIndex: null,
	
	//Monitor the DrawFrame show/hide status change caused by freeze operation.
	//And notify user the related warning message when necessary
	_drawFrameListener: null,
	_drawFrameStatus: null,

	//warning message
	_duration: 6000,
	
	constructor: function(editor) {
		this.docObj = editor.getDocumentObj();
		this.editor = editor;
		this._restoreIndex = {};
		this._drawFrameListener = dojo.subscribe("UpdateFrameStatus", this, "_frameChangeNotify");
		this._drawFrameStatus = {};
	},
	
	/**
	 * Notify user if the draw frame status change from show to hide caused by freeze.
	 * @param show
	 * @param freeze
	 * @param range
	 */
	_frameChangeNotify: function(show, freeze, range){
		var sheetName = range.getSheetName();
		var frames = this._drawFrameStatus[sheetName], needNotify = false;
		var rangeId = range.getId();
		if(frames)
		{
			
			var frame = frames[rangeId];
			if(frame)
			{
				if(frame.show && !show && freeze)
					needNotify = true;
			}
			else
			{
				frame = frames[rangeId] = {};
				needNotify = freeze;
			}
			frame.show = show;
		}
		else
		{
			var frames = this._drawFrameStatus[sheetName] = {};	
			if(!show && freeze)
				needNotify = true;
			frames[rangeId] = {show:show};
		}
		//Status from show/unknown to hide.
		if(needNotify)
		{
			//Do not disturb user if frame is not in current grid.
			if(this.editor.getCurrentGrid().getSheetName() == sheetName)
			{
				this.showWarningMessage(this.editor.nls.FW_GRAFIC_HIDDEN);
			}
		}
	},
	
	/**
	 * Switch to another sheet, reset the frame status of current sheet, so user can be notified when switch back.
	 * @param sheetName
	 */
	resetFrameStatus: function(sheetName){
		var status;
		if(status = this._drawFrameStatus[sheetName])
		{
			for(var rangeId in status)
			{
				status[rangeId].show = true;
			}
		}
	},
	
	/**
	 * Reset the range show/hide status to unknown when it's deleted
	 * @param sheetId
	 * @param rangeId
	 */
	removeFrameStatus: function(sheetName, rangeId){
		var frames = this._drawFrameStatus[sheetName];
		if(frames){
			delete frames[rangeId];
		}
	},
	
	showWarningMessage: function(message, dur)
	{
		if(message)
			this.editor.scene.showWarningMessage(message, dur || this._duration);
	},
	
	getRestoreInfo: function(){
		return this._restoreIndex;
	},
	
	/**
	 * Reset it each time notified.
	 */
	resetRestoreInfo: function(){
		this._restoreIndex == null;
		delete this._restoreIndex;
	},
	
	/**
	 * Add restore info so the editor know if there's a need to append undoFreeze to reverse event of delete rows/columns.
	 * @param sheetId
	 * @param freezeInfo
	 */
	addRestoreInfo: function(sheetName, freezeInfo){
		if(!this._restoreIndex)
		{
			this._restoreIndex = {};
		}
		this._restoreIndex[sheetName] = freezeInfo;
	},
	
	/**
	 * Synchronize the view settings with sheet model.
	 * Call this after CacheManager has finished rowNodes' gridRowIndex adjustment and is about to update rows/grid next. 
	 * @param grid
	 * @return diff {col:true, row:true}, need this information to perform grid update. Need to unfreeze col when cDif == true.
	 */
	updateGridFreezeInfo: function(grid){
		if(!grid) return false;
		var sheetObj = this.docObj.getSheet(grid.sheetName), freezeInfo = sheetObj.getFreezePos();
		var rDif = cDif = false;
		if(freezeInfo.row >= 0)
		{
			rDif = (grid.freezeRow != freezeInfo.row);
			grid.freezeRow = freezeInfo.row;
		}
		if(freezeInfo.col >= 0)
		{
			cDif = (grid.freezeCol != freezeInfo.col);
			grid.freezeCol = freezeInfo.col;
		}
		if (rDif || cDif) {
			grid.geometry.resetFreezeBox();
		}
		if (grid.scroller.firstVisibleCol <= grid.freezeCol) {
			grid.scroller.firstVisibleCol = grid.freezeCol + 1;
		}
		if (grid.scroller.firstVisibleRow < grid.freezeRow) {
			grid.scroller.firstVisibleRow = grid.freezeRow;
		}
		return rDif || cDif;
	},
	
	/**
	 * Called when document reload.
	 */
	reset: function(){
		this._drawFrameStatus = this._restoreIndex = {};
		if(this._drawFrameListener)
			dojo.unsubscribe(this._drawFrameListener);
	},
	
	/**
	 * We care about delete/insert rows/columns that may affect freeze indexes.
	 * @param event
	 * @returns
	 */
	preCondition:function(event){
		if (event._type == websheet.Constant.EventType.DataChange)
			return true;
		return false;
	},
	
	/**
	 * Can not un-freeze rows/columns by delete, the freeze index will stay at the first row/column if you delete all the frozen
	 * sections.
	 * If frozen row/column is deleted (startRow < freezeRow < endRow), new index is attached to startRow - 1.
	 * @param caster
	 * @param event
	 */
	notify:function(caster, event){
		var s = event._source;
		if( (s.refType == websheet.Constant.OPType.ROW || s.refType == websheet.Constant.OPType.COLUMN) &&
				(s.action == websheet.Constant.DataChange.PREDELETE || s.action == websheet.Constant.DataChange.PREINSERT)) {
			var sheetName, sIdx, eIdx;
			
			var parsedRef = s.refValue;
			var sheetName = parsedRef.sheetName;
			var grid = caster.getGrid(sheetName);
			
			var freezeInfo = {row:grid.freezeRow, col:grid.freezeCol};
			var bRow = (s.refType == websheet.Constant.OPType.ROW);
			var bCol = (s.refType == websheet.Constant.OPType.COLUMN);
			var bInsert = (s.action == websheet.Constant.DataChange.PREINSERT);
			var delta = 0;
			if (event && event._data && event._data.undoFreeze && event._data.undoFreeze.delta)
				delta = event._data.undoFreeze.delta;
			
			if(bRow){
				sIdx = parsedRef.startRow;
				eIdx = parsedRef.endRow;
			} else {
				sIdx = parsedRef.startCol;
				eIdx = parsedRef.endCol;
			}
			this.resetRestoreInfo();
			if(bRow && freezeInfo.row)
			{
				var sRowIndex = sIdx, eRowIndex = eIdx;
				if(sRowIndex > freezeInfo.row)
					return;
				var newIndex = freezeInfo.row;
				if(bInsert)
				{
					var maxRow = this.editor.getMaxRow();
					newIndex += (eRowIndex - sRowIndex + 1);
					if(newIndex > maxRow)
					{
						newIndex = maxRow;
					}
					if (newIndex > (delta + freezeInfo.row)) {
						newIndex = freezeInfo.row + delta;
					}				
				}
				else
				{
					if(eRowIndex < freezeInfo.row)
					{
						newIndex -= (eRowIndex - sRowIndex + 1);
					}
					else
					{
						newIndex = Math.max(sRowIndex - 1, 1);
						this.addRestoreInfo(sheetName, {delta : freezeInfo.row - sRowIndex});
					}
				}
				if(s.mode != websheet.Constant.MSGMode.REDO && s.mode != websheet.Constant.MSGMode.UNDO){
					if(grid.scroller.firstVisibleRow < newIndex)
					{
						grid.scroller.firstVisibleRow = newIndex;
					}	
				}
			}
			else if(bCol && freezeInfo.col)//col
			{
				var sColIndex = sIdx, eColIndex = eIdx;
				if(sColIndex > freezeInfo.col)
					return;
				var newIndex = freezeInfo.col;
				if(bInsert)
				{
					newIndex += (eColIndex - sColIndex + 1);
					if(newIndex > websheet.Constant.MaxColumnIndex)
					{
						newIndex = websheet.Constant.MaxColumnIndex;
					}
					if (newIndex > (delta + freezeInfo.col)) {
						newIndex = freezeInfo.col + delta;
					}						
				}
				else
				{
					if(eColIndex < freezeInfo.col)
						newIndex -= (eColIndex - sColIndex + 1);
					else
					{
						newIndex = Math.max(sColIndex - 1, 1);
						this.addRestoreInfo(sheetName, {delta : freezeInfo.col - sColIndex});
					}
				}
				this.updateGridFreezeInfo(grid);
			}
		} else if(s.refType == websheet.Constant.OPType.SHEET ) {
			if(s.action == websheet.Constant.DataChange.SET){
				var oldSheetName = s.oldSheetName;
				var newSheetName = s.newSheetName;
				this._drawFrameStatus[newSheetName] = this._drawFrameStatus[oldSheetName];
				delete  this._drawFrameStatus[oldSheetName];
			}
			//TODO: recover sheet
		}
	}	
});