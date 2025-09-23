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

dojo.provide("websheet.Connector");

dojo.require("websheet.ConnectorBase");
dojo.require("websheet.Helper");

dojo.declare('websheet.Connector', [websheet.ConnectorBase], {
    editor: null,
    controller: null,
    /////////////////////////////////////////////////////////////////////
    ///////////// RECEIVE MESSAGE AND TRANSFORM /////////////////////////
    /////////////////////////////////////////////////////////////////////

    processMessageUpdates: function(events, userId, index)
    {
    	var tm = this.editor.getTaskMan();
    	var wconst = websheet.Constant;
		var priority = tm.Priority.UserOperation;
		var len = events.length;
		if (!index) {
			// first in
			if (len > wconst.THRESHOLD_MERGE_MESSAGE_UPDATES) {
				this.editor.scene.showWarningMessage(this.editor.scene.nls.browserWorkingMsg);
				this.controller._bBatchNotify = true;
			}

			index = 0;
		}
		for(var i = index; i < len; i++)
		{
			var update = events[i];
			this.applyEvent(update, userId, websheet.Constant.MSGMode.NORMAL);
			if(tm.hasNext(priority) && i <= len - 1)
			{
				this.editor.suspendGridUpdate();
				if(update.action == wconst.Event.ACTION_INSERT || 
				    update.action == wconst.Event.ACTION_DELETE)
				{
					this.editor.resumeGridUpdate();
				}	
				var next = i+1;
				// to make performActionUpdates tasks happens before postPerformAction;
				tm.addTask(this, "processMessageUpdates", [events, userId, next], priority);
				this.controller._bBatchNotify = false;
				break; 
			}
		}
		if (i == len) {
			this.editor.resumeGridUpdate();
			// all message applied
			this.controller._bBatchNotify = false;
		}
    },

    /* process a single message */
    processMessage: function(msg) 
    {
    	var tm = this.editor.getTaskMan();
		this.updateSendoutList();
	
		var changeContent = msg;
		var userId = msg.user_id;
		var clientSeq = msg.client_seq;
		var actionType = changeContent.updates[0].action;
		
		this.decompact(msg, dojo.hitch(this, function(){
			if (!this.isOperationMsg (changeContent.updates[0]))
			{
				//co-editing indicator event. The message contains only one event in it.
				this.applyEvent(changeContent.updates[0], userId, websheet.Constant.MSGMode.NORMAL);
				return;
			}

			var undoManager = this.editor.getUndoManager();

			// document change event
			var list = this.getTransformList();
			if (list.length == 0 && (msg.solist == null || msg.solist.length == 0 || msg.xflist == null || msg.xflist.length == 0))  // no OT needed
			{
				undoManager.transform(changeContent.updates);
				var events = dojo.filter(changeContent.updates, dojo.hitch(this, function(event){
					return this.isOperationMsg(event);
				}));
				if(events.length == 0)
					return;
				
				var priority = tm.Priority.UserOperation;
				
				if(tm.isRunning(priority))
				{
					tm.addTask(this, "processMessageUpdates", [events, userId], priority);
				}
				else
				{
					this.processMessageUpdates(events, userId);
				}
			}
			else
			{
				var transformer = this.editor.getEventHdl();
				//OT
				var solist = msg.solist;
				var xflist = msg.xflist;
				
				if (solist == null || solist.length == 0 || xflist == null || xflist.length == 0) {
					transformer.transformMsg(changeContent, list);
				} else {
					// if the message is with a message list snapshot, OT with the snapshot transform list,
					// leave the sendout list to perform UNDO-REDO OT
					this.solist = solist;
					transformer.transformMsg(changeContent, xflist);
					this.solist = null;
				}

				this.clearConflictMsg();
							
				var eventCnt = changeContent.updates.length;
				//The incoming message will be not applied when the msg.updates is empty
				if(eventCnt == 0)
					return;
				
				undoManager.transform(changeContent.updates);
				
				var events = dojo.filter(changeContent.updates, dojo.hitch(this, function(event){
					return this.isOperationMsg(event);
				}));
				if(events.length == 0)
					return;
				
				var priority = tm.Priority.UserOperation;
				
				if(tm.isRunning(priority))
				{
					tm.addTask(this, "processMessageUpdates", [events, userId], priority);
				}
				else
				{
					this.processMessageUpdates(events, userId);
				}
			}
		}));
    },
    /////////////////////////////////////////////////////////////////////
    ///////////// APPLY EVENT WHEN RECEIVE FROM NETWORK /////////////////
    /////////////////////////////////////////////////////////////////////

    /*
     * @param sessionId   client Id
     * @param mode        websheet.Constant.MSGMode.NORMAL // sent from server
     *                    UNDO/REDO (local invoked, no conflict notice)
     */
    applyEvent: function (event, sessionID, mode) 
    {
		if (event == undefined)
			return;
	
		if (event.action == this.Event.ACTION_IGNORE)
			return;
	
		var refValue = event.reference.refValue;
		var refType = event.reference.refType;
		var bCut = event.data && event.data.bCut;
	
		// reference array to get and do the operations
		refValue = websheet.Helper.handleRefValue(refValue,refType);
		var parsedRef = websheet.Helper.parseRef(refValue);
		if (refType == websheet.Constant.Event.SCOPE_SHEET) {
			parsedRef = {};			
    		refValue = websheet.Helper.normalizeSheetName(refValue);
			parsedRef.sheetName = refValue;
		}
	
		switch (event.action) {
		// delete operator
		case this.Event.ACTION_DELETE:
			switch (refType) {
			case this.Event.SCOPE_SHEET:
				var uuid = null;
				if (event.data && event.data.sheet&& event.data.sheet.uuid)
					uuid = event.data.sheet.uuid;
				this.deleteSheetHelper(refValue, uuid, mode);
				break;
			case this.Event.SCOPE_ROW:
				var uuid = null;
				if (event.data && event.data.uuid)
					uuid = event.data.uuid;
				this.deleteRowsHelper(parsedRef,uuid,mode);
				break;
			case this.Event.SCOPE_COLUMN:
				var uuid = null;
				if (event.data && event.data.uuid)
					uuid = event.data.uuid;
				this.deleteColumnHelper(parsedRef, uuid, mode);
				break;
			case this.Event.SCOPE_RANGE:
			case this.Event.SCOPE_UNNAMERANGE:
				this.deleteRangeHelper(refValue, event.data, mode);
				break;
			}
			break;
		case this.Event.ACTION_CLEAR:
			switch (refType) {
			case this.Event.SCOPE_ROW:
				this.clearRowsHelper(parsedRef, bCut);
				break;
			case this.Event.SCOPE_UNNAMERANGE:
				this.clearRangeHelper(parsedRef);
				break;
			}
			break;
		// set operator
		case this.Event.ACTION_SET:
			switch (refType) {
			case this.Event.SCOPE_SHEET:
				this.setSheetHelper(event.data.sheet,sessionID, refValue);
				break;
			case this.Event.SCOPE_ROW:
				this.setRowsHelper(parsedRef, event.data, false, mode);
				break;
			case this.Event.SCOPE_COLUMN:
				this.setColumnHelper(parsedRef, event.data);
				break;
			case this.Event.SCOPE_CELL:
				var cell = event.data.cell;
				this.setCellHelper(parsedRef, cell,sessionID, mode);
				break;
			case this.Event.SCOPE_RANGE:
				this.controller.setRangeInfo(event.reference.refValue, event.data, mode);
				break;
			case this.Event.SCOPE_UNNAMERANGE:
				this.setRangeHelper(event.reference.refValue, event.data, sessionID, mode);
				break;
			case this.Event.SCOPE_FRAGMENT:
				this.setFragment(refValue, event.data, sessionID);
				break;
			case this.Event.SCOPE_CHART:
            	this.setChartHelper(event.data, mode);
            	break;
			}
			break;
	
		// insert operator
		case this.Event.ACTION_INSERT:
			switch (refType) {
			case this.Event.SCOPE_SHEET:
				this.insertSheetHelper(event.data.sheet, sessionID, mode);
				break;
			case this.Event.SCOPE_ROW:
				this.insertRowsHelper(parsedRef, event.data, mode);
				break;
			case this.Event.SCOPE_COLUMN:
				this.insertColumnHelper(parsedRef, event.data, mode);
				break;
			case this.Event.SCOPE_RANGE:
			case this.Event.SCOPE_UNNAMERANGE:
				this.insertRangeHelper(event.reference.refValue, event.data, mode);
				break;
			}
			break;
	
		// move operator
		case this.Event.ACTION_MOVE:
			switch (refType) {
			case this.Event.SCOPE_SHEET:
				this.moveSheetHelper(parsedRef, event.data);
				break;
			case this.Event.SCOPE_ROW:
				break;
			case this.Event.SCOPE_COLUMN:
				break;
			case this.Event.SCOPE_CELL:
				break;
			}
			break;
	
		case this.Event.ACTION_SORT:
			switch (refType) {
			case this.Event.SCOPE_UNNAMERANGE:
				this.sortRangeHelper(event.reference.refValue, event.data, sessionID, mode);
				break;
			}
			break;
		case this.Event.ACTION_FILTER:
			switch (refType) {
			case this.Event.SCOPE_UNNAMERANGE:
				this.controller.setFilterInfo(event.reference.refValue, event.data, mode);
				break;
			}
			break;
		case this.Event.ACTION_MERGE:
			this.mergeCellHelper(parsedRef);
			break;
		case this.Event.ACTION_SPLIT:
			this.splitCellHelper(parsedRef);
			break;
		case this.Event.ACTION_FREEZE:
			this.freezeWindowHelper(event.reference.refValue, event.data, mode);
			break;
		case this.Event.LOCK:
			var collaborator = this.editor.getCollaboratorContainer().getCollaborator(sessionID);
			if (collaborator) {
				collaborator.lockCell(parsedRef);
			}
			break;
		case this.Event.RELEASE:
			var collaborator = this.editor.getCollaboratorContainer().getCollaborator(sessionID);
			if (collaborator) {
				collaborator.releaseLock();
			}
			break;
		}
	},
    
    // delete sheet operation
    deleteSheetHelper: function(ref,uuid,mode)
    {
    	// backup the reflist when delete sheet from the other client
    	if(mode == websheet.Constant.MSGMode.NORMAL && uuid)
    	{
    		var sheet = this.controller.getDocumentObj().getSheet(ref);
    		if(!sheet) return;
    	}
        
        var cb = this.editor._clipboard;
    	cb.exitSelect(true);
    	
    	this.controller.deleteSheet(ref,false,uuid);
    },
    
    clearRowsHelper: function(ref, bCut)
    {
		if (ref.endRow == undefined)
		    this.controller.clearRows(ref.sheetName, ref.startRow, bCut);
		else
		    this.controller.clearRows(ref.sheetName,ref.startRow, ref.endRow, bCut);
    },
    
    //delete row operation
    deleteRowsHelper:function(ref,uuid,mode)
    {
    	this._exitCutSelect(ref, this.Event.SCOPE_ROW);
    	this.controller.deleteRows(ref.sheetName,ref.startRow, ref.endRow, uuid,mode);
    },

    //delte column operation
    deleteColumnHelper:function(ref,uuid,mode)
    {
    	this._exitCutSelect(ref, this.Event.SCOPE_COLUMN);
    	this.controller.deleteColumns(ref.sheetName,ref.startCol,ref.endCol,uuid,mode);
    },

    //insert sheet operation
    insertSheetHelper: function( sheet, userId,mode)
    {
        if(sheet != null)
        {
          var sheetName = sheet.sheetname;
          var sheetIndex = sheet.sheetindex ;
          if (this.controller._grids[sheetName])
          		return;
          
          this.controller.addSheet(sheetName, sheetIndex, sheet,mode);
        }
    },
    /*
     * mode represents undo or redo action
     */
    insertRowsHelper: function(ref,data,mode)
    {
    	this._exitCutSelect(ref, this.Event.SCOPE_ROW);
    	this.controller.insertRows(ref.sheetName,ref.startRow,ref.endRow,data, mode);
    },
    //insert column operation
    insertColumnHelper:function(ref,data,mode)
    {
    	if(ref.startCol == -1)
    		return;
    	this._exitCutSelect(ref, this.Event.SCOPE_COLUMN);
		this.controller.insertColumns(ref.sheetName,ref.startCol,ref.endCol,data,mode);
    },

    //insert range operation
    insertRangeHelper:function(refValue, data, mode)
    {
    	this.controller.insertRange(data.rangeid, refValue, data, mode);
    },

    //delete range operation
    deleteRangeHelper:function(refValue, data, mode)
    {
    	if(data.usage == websheet.Constant.RangeUsage.DATA_VALIDATION)
    		this.controller.deleteRangeByRef(refValue, data.usage);
    	else
    		this.controller.deleteRange(data.rangeid,data.usage, mode);
    },

    _exitCutSelect:function(ref, refType)
    {
    	var cb = this.editor._clipboard;
    	var cutRange = cb.getCutRangeInfo();
    	if(cutRange){
    		if(ref.sheetName == cutRange.sheetName){
    			var exitSelect = false;
    			switch (refType) {
    			case this.Event.SCOPE_ROW:
    				if(ref.endRow <= cutRange.startRow)
    					exitSelect = true;
    				break;
    			case this.Event.SCOPE_COLUMN:
    				if(ref.endCol <= cutRange.startCol)
    					exitSelect = true;
    				break;
    			case this.Event.SCOPE_CELL:
    				if(ref.startRow >= cutRange.startRow && ref.startRow <= cutRange.endRow && ref.startCol >= cutRange.startCol && ref.startCol <= cutRange.endCol)
    					exitSelect = true;
    				break;
    			case this.Event.SCOPE_UNNAMERANGE:
    				exitSelect = true;
    				if(ref.endRow < cutRange.startRow || ref.startRow > cutRange.endRow || ref.endCol < cutRange.startCol || ref.startCol > cutRange.endCol)
    					exitSelect = false;
    				break;
    			}
    			if(exitSelect)
    				cb.exitSelect(true);	
    		}
    	}
    },
    
    //set range operation
    setRangeHelper:function(refValue, data, userId, mode)
    {
    	var rangeId = data.rangeid;
    	if(data && ( data.rows || data.style || data[websheet.Constant.Style.WIDTH] || data.visibility || data.rn))
    	{
    		this._exitCutSelect(refValue, this.Event.SCOPE_UNNAMERANGE);
    		var parsedRef = websheet.Helper.parseRef(refValue);
    		var startRow = parsedRef.startRow;
			var endRow = parsedRef.endRow;
			var startColumn = parsedRef.startCol;
			var endColumn = parsedRef.endCol;
			
    		var rows = data.rows;
    		var bReplace = data.bR;	//replace or merge
    		var bRCmts = data.bRCmts;
    		var bCol = data.bCol;
    		var bUpdateChart = false;
    		if(data.style && !bReplace)
    		{
    			//build range data, same as in Base.setStyle
    			//only for merge range style
    			//TODO: abstract one method, same does setRowsHelper
    			var sStartCol = websheet.Helper.getColChar(startColumn);
    			var cellsJson = {};
    			var style = data.style;
    			cellsJson[sStartCol] = {style: style};
    			if (endColumn > startColumn) {
    				cellsJson[sStartCol].rn = endColumn - startColumn;
    			}
    			
    			rows = data.rows = {};
    			rows[startRow] = {cells: cellsJson};
    			if (endRow > startRow) {
    				rows[startRow].rn = endRow - startRow;
    			}
    			
	    		// update formula ref when changing FORMAT style, or set to default style
	    		var bUpdateChart = (style[websheet.Constant.Style.FORMAT] || style.id) ? true : false;
    		}
    		//Defect 42834: undo does not work for references if cells referenced are changed from number->text 
    		if(!bUpdateChart && !bReplace){
 				var utils = websheet.Utils; 	
 				bUpdateChart = utils.isJSONContainValue(rows, utils.hasFormat);
    		}
    		// only paste need color shading
    		if(!bReplace)
    			userId = null;

    		if(data.bCut && bCol)
    		{
    			if(!data.bFollowPart)
    			{
    				this.controller.cutCols(parsedRef.sheetName, endRow, startColumn,endColumn);
    			}	
    			this._postSetRange(parsedRef, startRow, endRow, startColumn, endColumn);
    		}	
    		else
    		{
    			// TODO count the rows?
    			this._bLargeRange = bReplace && ((endRow - startRow + 1) * Math.min( endColumn - startColumn + 1, websheet.Constant.MaxColumnIndex) > websheet.Constant.THRESHOLD_ASYNC_SET_RANGE);
    	        if (this._bLargeRange)
    	        {
    	        	var scene = this.editor.scene;
    				var sceneNls = scene.nls;
    				scene.showWarningMessage(sceneNls.browserWorkingMsg);
    	        	this.controller.asyncSetRange(parsedRef.sheetName, startRow, endRow, startColumn, endColumn, data,
    	        		{ forReplace: bReplace, bRCmts: bRCmts, bUpdateChart: bUpdateChart, forColumn: bCol, userId: userId, forRow: data.bRow, ignoreFilteredRow:data.ignoreFilteredRow,
    	        			callback: dojo.hitch(this, this._postSetRange, parsedRef, startRow, endRow, startColumn, endColumn), mode:mode});
    	        }
    	        else
    	        {
    	        	if(data.bCut)
    	        	{
    	        		this.controller.cutRange(parsedRef.sheetName, startRow, startColumn, endRow, endColumn, bCol);
    	        	}
    	        	else{
    	        		this.controller.setRange(parsedRef.sheetName, startRow, endRow, startColumn, endColumn, data,
    	        				{ forReplace: bReplace, bRCmts: bRCmts, bUpdateChart: bUpdateChart, forColumn: bCol, userId: userId,  forRow: data.bRow, ignoreFilteredRow:data.ignoreFilteredRow, mode:mode});
    	        	}
    		    	this._postSetRange(parsedRef, startRow, endRow, startColumn, endColumn);
    	        }
    		}	
    	}
    	else
    	{
	    	this.controller.setRangeInfo(refValue, data, mode);
    	}
    },
    
    _postSetRange: function(parsedRef, startRow, endRow, startColumn, endColumn) {
 		if(this.editor.getCurrentGrid().getSheetName() == parsedRef.sheetName){
 			var grid = this.controller.getGrid(parsedRef.sheetName);
 			var focusRow = grid.selection.getFocusedRow() + 1;
 			var focusCol = grid.selection.getFocusedCol();
 			if (focusRow >= startRow && focusRow <= endRow && focusCol >= startColumn && focusCol <= endColumn) {
 				var styleCode = websheet.model.ModelHelper.getStyleCode(parsedRef.sheetName, focusRow, focusCol);
 				this.editor.applyUIStyle(styleCode);
 			}
 		}
        if (this._bLargeRange)
        {
        	this._bLargeRange = false;
        	this.editor.scene.hideErrorMessage();
        }
    },
	
    clearRangeHelper: function(ref)
    {
    	var startRow = ref.startRow;
		var endRow = ref.endRow;
		var startColumn = ref.startCol;
		var endColumn = ref.endCol;
		
		this.controller.clearRange(ref.sheetName, startRow, endRow, startColumn, endColumn);
    },
    
	sortRangeHelper:function(refValue, data, userId, mode)
	{
		this.controller.sortRange(refValue, data, userId, mode);
	},
	
    //submit section operation
    setFragment:function(refValue, data, sessionID)
    {    
    	this.controller.setFragment(refValue, data, sessionID);
    },
    
    //set sheet operation
    setSheetHelper: function(sheets, userId,sheetName){
    	if(sheets.sheetname){
    		var doc = this.controller.getDocumentObj();
	        var sheet = doc.getSheet(sheetName);
	        this.controller.renameSheet(sheet.getSheetName(),sheets.sheetname,true);
	
	        var cb = this.editor._clipboard;
	        cb.exitSelect(true);
    	} else if(sheets.isMirrored != undefined){
	        this.editor.SheetDirection(sheets.isMirrored, true);
    	} else if (sheets.visibility){
	        var doc = this.controller.getDocumentObj();
	        var sheet = doc.getSheet(sheetName);	        	         
	        if (sheets.visibility == websheet.Constant.SHEET_VISIBILITY_ATTR.HIDE)
	        	this.controller.hideSheet(sheetName);
	        else
	        	this.controller.unhideSheet(sheetName, true);
    	} else if(sheets.offGridLine === true || sheets.offGridLine === false){
    		this.controller.showGridLines(sheetName, !sheets.offGridLine);
    	}
    },

    moveSheetHelper: function(ref,data)
    {
        if(!data.delta){return;}
        var doc = this.controller.getDocumentObj();
        var sheet = doc.getSheet(ref.sheetName);
        var sheetIndex = sheet.getIndex();
        var moveTo = sheetIndex+ parseInt(data.delta);
        this.controller.moveSheet(ref.sheetName,moveTo);
    },

    /*
     * @param mode     message mode, see websheet.Constant.MSGMode
     */
    setCellHelper: function(ref, cell, userId, mode){
    	var sheetName = ref.sheetName;
    	var startRow = ref.startRow;
    	var startCol = ref.startCol;
        var docObj = this.controller.getDocumentObj();
        var sheetObj = docObj.getSheet(sheetName);
        if (!sheetObj)//in case ref is #REF!.A1 which is the set cell event for delete sheet undo
        	return;

        this._exitCutSelect(ref, this.Event.SCOPE_CELL);
        
        if (!cell) cell = {}; // it is one invalid message. make the code robust in order to handle it.
        
	   	if(cell.v != undefined)
	    	this.controller.setCell(sheetName, startRow, startCol, cell.v, cell.tarr, userId, mode);
	   	// Can't use mixed cell object because we need to set link to value cell object here
	    var cellObj = sheetObj.getCell(startRow, startCol);
	    if(cellObj){
	       	if (cell.link !== undefined)
	       		cellObj.setLink(cell.link);
	    }
	    if(cell.style) {
	    	var bUpdateChart;
	       	if (cell.style[websheet.Constant.Style.FORMAT])
	       		bUpdateChart = true;
	    	else {
	    		// only need style cell,using followstyle
	    		cellObj = sheetObj.getCell(startRow, startCol, websheet.Constant.CellType.STYLE,true);
	    	   	if (cell.style.id && cellObj && cellObj._styleId) {
		       		var style = cellObj.getStyle();
		       		if (style && style.toJSON()[websheet.Constant.Style.FORMAT]) bUpdateChart = true;
	    	   	}
	    	} 
	       	this.controller.setCellStyle(sheetName, startRow, startCol, cell.style, false, bUpdateChart);
	    }

     	var grid = this.controller.getGrid(sheetName);
     	if (grid) {
     		//this.editor.getPartialCalcManager().calcVisibleFormula();
     		grid.updateRows(startRow - 1);
     	}
        //if it's current focus cell, synchronize the formula bar
        //  also update font toolbar
        if (this.editor.getCurrentGrid().getSheetName() == sheetName && startRow == grid.selection.getFocusedRow() + 1 && startCol == grid.selection.getFocusedCol()) {
           	var cellRef = websheet.Helper.getCellAddr(sheetName, startRow, startCol);
           	var formulaBar = this.editor.getFormulaBar();
           	if (formulaBar) formulaBar.syncOnCellMouseDown(cellRef,"cell");
			var styleCode = websheet.model.ModelHelper.getStyleCode(sheetName, startRow, startCol);
			this.editor.applyUIStyle(styleCode);
        }
    },
	 
    setChartHelper : function(data, mode) {
		var areaMgr = this.controller.getDocumentObj().getAreaManager();
		var area = areaMgr.getRangeByUsage(data.chartId, websheet.Constant.RangeUsage.CHART);
		this.controller.setChartInfo(area.getParsedRef().getAddress(), data, mode);
	},
    
    /*
     * set row operation
     */
    setRowsHelper: function(ref, data, bReplaceStyle, mode) {
    	var sheetName = ref.sheetName;
		var startRowIndex = ref.startRow;
		var endRowIndex = ref.endRow;
		var rows = null;
		var sheet = this.controller.getDocumentObj().getSheet(sheetName);
    	if (undefined != data.visibility) {
	   		if(data.visibility == websheet.Constant.ROW_VISIBILITY_ATTR.SHOW){
				var hiddenArray = websheet.Utils.getHiddenArray4Show(sheetName,startRowIndex-1,endRowIndex-1);
			    if (hiddenArray.length == 0){//no hidden rows in this range, check top hidden rows
			    	if (websheet.Utils.checkTopBoundaryHiddenRows(startRowIndex-1)){
						//show row from first rows
						//get the hidden row again with new range.
			    		hiddenArray = websheet.Utils.getHiddenArray4Show(sheetName,0,startRowIndex-1);
					}
			    }
    			this.controller.showRows(sheetName, hiddenArray);
    		}
    		else{
    			var hiddenArray = websheet.Utils.getHiddenArray4Hide(sheetName,startRowIndex-1,endRowIndex-1);
        		this.controller.hideRows(sheetName, parseInt(startRowIndex)-1, parseInt(endRowIndex)-1, hiddenArray);
    		}
    	} else if (data[websheet.Constant.Style.HEIGHT] != undefined) { 
	        // it assumes that if data has {height: xx} there should NOT be anything else in the data
            var rowsJson = {};
            rowsJson[startRowIndex] = data;
    		this.controller.setRowsHeight(sheetName, startRowIndex, endRowIndex, rowsJson, mode);
    	} else {
    		var bUpdateChart;
    		// UNDO CLEAR ROWS || SET STYLE || UNDO SET STYLE
    		if (data.style) {
    			// SET STYLE
				rows = {};
				rows[startRowIndex] = {
					"cells": {
						"A": {
							"style": data.style,
							"rn": websheet.Constant.MaxColumnIndex - 1
						}
					}
				}
				if (startRowIndex != endRowIndex) rows[startRowIndex].rn = endRowIndex - startRowIndex;
				// Always update when set default formatting
				if (data.style[websheet.Constant.Style.FORMAT] || data.style.id)
					bUpdateChart = true;
				
				this.controller.setRows(sheetName, startRowIndex, endRowIndex, rows, bReplaceStyle, mode, bUpdateChart);
    		} else {
    			// UNDO CLEAR ROWS || UNDO SET STYLE
				rows = data.rows;
				var bSetRowHeight = false;
				for (var index in rows) {
					var row = rows[index];
					for (var id in row) {
						if (id == websheet.Constant.Style.HEIGHT) {
							bSetRowHeight = true;
							break;
						}
					}
				}
				
				if (bSetRowHeight)
					this.controller.setRowsHeight(sheetName, startRowIndex, endRowIndex, rows, mode);
				else {
					var utils = websheet.Utils;
					if (utils.isJSONContainValue(rows, utils.hasFormat))
						bUpdateChart = true;

					this.controller.setRows(sheetName, startRowIndex, endRowIndex, rows, bReplaceStyle, mode, bUpdateChart);
				}
    		}
    		
			if (this.editor.getCurrentGrid().getSheetName() == sheetName) {
		     	var grid = this.editor.getCurrentGrid();
		     	var focusRow = grid.selection.getFocusedRow() + 1;
		     	if (focusRow >= ref.startRow && focusRow <= ref.endRow) {
					// current focus in rows range
					var styleCode = websheet.model.ModelHelper.getStyleCode(sheetName, focusRow, grid.selection.getFocusedCol());
					this.editor.applyUIStyle(styleCode);
		     	}
			}
    	}
    },
	
    /*
     * set column operation
     */
    setColumnHelper: function(ref, data, bReplaceStyle){
    	var sheetName = ref.sheetName;
    	var startCol = ref.startCol;
    	var endCol = ref.endCol;
    	var bUpdateChart = false;
    	if (data.rows)
    		bUpdateChart = websheet.Utils.isJSONContainValue(data.rows, websheet.Utils.hasFormat);
    	if(data.columns)
    		bUpdateChart = bUpdateChart || websheet.Utils.isJSONContainValue(data.columns, websheet.Utils.hasFormat, websheet.Constant.Column);
    	if (data.style)
    		bUpdateChart = bUpdateChart || data.style[websheet.Constant.Style.FORMAT] || data.style.id;
	
    	var params = {};
    	params.updateGrid = true;
    	params.bReplaceStyle = bReplaceStyle;
    	params.bUpdateChart = bUpdateChart;
    	this.controller.setColumns(sheetName, startCol, endCol, data, params);
    	
    	if (this.editor.getCurrentGrid().getSheetName() == sheetName) {
	     	var grid = this.editor.getCurrentGrid();
	     	var focusRow = grid.selection.getFocusedRow();
	     	var focusCol = grid.selection.getFocusedCol();
	     	if (startCol == focusCol) {
				// current focus in column range
				var styleCode = websheet.model.ModelHelper.getStyleCode(sheetName, focusRow + 1, focusCol);
				this.editor.applyUIStyle(styleCode);
	     	}
    	}
    },
    
    mergeCellHelper: function(parsedRef)
    {
    	if(!parsedRef) return;
	   	
	   	var iscIndex = parsedRef.startCol;
	   	var iecIndex = parsedRef.endCol;
		this.controller.mergeCells(parsedRef.sheetName,parsedRef.startRow,parsedRef.endRow,iscIndex,iecIndex);
    },
    
    splitCellHelper: function(parsedRef)
    {
    	if(!parsedRef) return;
	   	
    	var iscIndex = parsedRef.startCol;
	   	var iecIndex = parsedRef.endCol;
	   	this.controller.splitCells(parsedRef.sheetName,parsedRef.startRow,parsedRef.endRow,iscIndex,iecIndex);
    },
    
    freezeWindowHelper: function(refValue, data, mode)
    {
    	var sheet, row, col, bHoldScroll = (mode == websheet.Constant.MSGMode.NORMAL);
    	//unfreeze row or column
    	if(data && (data.col || data.row)){
    		sheet = refValue, row = data.row ? 0 : null, col = data.col ? 0 : null;
    	}else{
    		var parsedRef = websheet.Helper.parseRef(refValue);
    		if(parsedRef){
    			sheet = parsedRef.sheetName;
    			var type = parsedRef.getType();
    			if(type == websheet.Constant.RangeType.ROW)
    				row = parsedRef.startRow;
    			else if(type == websheet.Constant.RangeType.COLUMN)
    				col = parsedRef.startCol;
    		}else{
    			sheet = refValue, row = data.row ? 0 : null, col = data.col ? 0 : null;
    		}
    	}
    	this.controller.freezeWindow(sheet, row, col, bHoldScroll);
    }
});
