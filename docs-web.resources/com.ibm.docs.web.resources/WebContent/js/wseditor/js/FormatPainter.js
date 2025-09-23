/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2018. All Rights Reserved.          */
/*                                                                   */
/* U.S. Government Users Restricted Rights: Use, duplication or      */
/* disclosure restricted by GSA ADP Schedule Contract with IBM Corp. */
/*                                                                   */
/* ***************************************************************** */

dojo.provide("websheet.FormatPainter");
dojo.require("websheet.Constant");
dojo.require("websheet.RangeDataHelper");
dojo.require("websheet.formatpainter.Storage");
dojo.require("websheet.formatpainter.SelectionRectMixin");
dojo.require("websheet.widget._Rectangle");

dojo.requireLocalization("websheet", "base");

dojo.declare('websheet.FormatPainter', [websheet.formatpainter.SelectionRectMixin], {
	editor: null,
	controller: null,
	_baseNLS: null,
	
    constructor: function(editor){
        this.editor = editor; 
        this.controller = editor.getController();
        this._baseNLS = dojo.i18n.getLocalization("websheet", "base");
        this._storage = new websheet.formatpainter.Storage();
    },
    
    onGridReset: function()
    {
    	this.exitSelect(true);
    },
    
    getCutRect: function(){
    	var c_grid = this.editor.getCurrentGrid();
    	if(!this._cutRect || this._cutRect._destroyed)
    	{
    		this._cutRect = new websheet.widget._Rectangle({grid : c_grid, isMoveable: false});
    		this._cutRect.setBorderStyle('dashed');
    	}
    	this._cutRect.wakeup().selectGrid(c_grid).placeAt(c_grid.selection.selector().containerNode, 'before');
    	return this._cutRect.select(c_grid.selection.selector(), true);
    },
    
    _reviseSelectRect: function(sheetName, startRowIndex, endRowIndex, startColIndex, endColIndex, type)
    {
		var sr = this.controller.getGrid(sheetName).selection.selector();
		var maxRow = this.editor.getMaxRow();
		if(endRowIndex == null)
			endRowIndex = maxRow;
		if(sr.selectingRows())
		{
			if(type == websheet.Constant.Range && endColIndex < websheet.Constant.MaxColumnIndex)
			{
				// you do not fill me full.
				sr.selectRange(null, null, endRowIndex - 1, endColIndex);
			}
			else
			{
				sr.selectRow(startRowIndex - 1, endRowIndex - 1);
			}
		}
		else if(sr.selectingColumns())
		{
			if(type == websheet.Constant.Range && endRowIndex < maxRow)
			{
				// you do not fill me full.
				sr.selectRange(null, null, endRowIndex - 1, endColIndex);
			}
			else
			{
				sr.selectColumn(startColIndex, endColIndex);
			}
		}
		else if(type == websheet.Constant.Range)
		{
			sr.selectRange(null, null, endRowIndex - 1, endColIndex);
		}
    },

    format: function(event) {
    	this.setSelect(true);
    	this.editor._clipboard.onGridReset();
    	var drawFrameHdl = this.editor.getDrawFrameHdl();
    	var drawFrameRanges = drawFrameHdl.getSelectedDrawFramesInCurrSheet();
    	if (drawFrameRanges.length != 0) {
    		// ignore chart and image
    	} else {
    		this._showSelection();
	    	var grid = this.editor.getCurrentGrid();
			var sheetName = grid.sheetName;
			var selector = grid.selection.selector();
			var range = selector.getRangeInfo();
			var startRowIndex = range.startRow;
	        var endRowIndex = range.endRow;
	        var startColIndex = range.startCol;
	        var endColIndex = range.endCol;
				
			var selectType = selector.getSelectType();
				
			if(selectType == websheet.Constant.Cell){
				rangeInfo = websheet.Utils.getExpandRangeInfo(selector.getRangeInfo());
				if(rangeInfo.startCol != rangeInfo.endCol
						|| rangeInfo.startRow != rangeInfo.endRow){
					selectType = websheet.Constant.Range;
					startColIndex = rangeInfo.startCol;
					endColIndex = rangeInfo.endCol;
					startRowIndex = rangeInfo.startRow;
					endRowIndex = rangeInfo.endRow;
				}
			}
			
			switch (selectType) {
		    case websheet.Constant.RowRange:
		    case websheet.Constant.Row:
		    	this._formatRowRange(event, sheetName, startRowIndex, endRowIndex);
		        break;
		    case websheet.Constant.Column:
		    case websheet.Constant.ColumnRange:
		        this._formatColumn(event, sheetName, startColIndex,endColIndex);
		        break;
		    case websheet.Constant.Cell:
		        this._formatCell(event, sheetName, startRowIndex, startColIndex);
		        break;
		    case websheet.Constant.Range:
		        this._formatRange(event, sheetName, startRowIndex, endRowIndex, startColIndex, endColIndex);
		        break;
		    default:
		        break;
			}
    	}
    },
    
    /**
     * paint, returning event and reverse event, { event: <event>, reverse: <reverse>, refValue: <refValue> }
     */
    paint: function(e) 
    {
        var elem = e.currentTarget;
        elem.focus();
        var content = this._storage.getData();
        if (content) {
        	if (!content._invalid) {
        		this._paint(content);
        	} else {
        		this.editor.scene.hideErrorMessage();
        	}
        }
    },
    
    /**
     * clear, clean existing format data for painter
     */
    clear: function()
    {
    	this._unsetStyleCursor();
		this.exitSelect(true);
		this._storage.clear();
    },
    
    _unsetStyleCursor: function()
    {
        //change cursor back to auto
    	var sheet_node = dojo.byId("sheet_node");
    	if(sheet_node)
        {
    		sheet_node.style.cursor = "auto";	
        }
		var widget = dijit.byId("S_t_FormatPainter");
		if(widget)
		{
			widget.attr("checked", false);
		}
    },
    
    setStyleCursor: function()
    {
        //change cursor 
    	var sheet_node = dojo.byId("sheet_node");
    	if(sheet_node)
        {
    		sheet_node.style.cursor = "url('" + window.contextPath + window.staticRootPath + "/images/painter32.cur'),auto";    	
        }
    },
    
    getCutRangeInfo: function()
    {
    	if(this._cutRect)
    		return this._cutRect.getRangeInfo();
    	return null;
    },
    
    _onFormat: function(data, event, callback)
    {   	
    	if(!data || !data.data)
    		return;
    	
    	if(callback)
    	{    		
    		callback(data);
    	}	
    	else
    	{
    		this._storage.setData(data);
    	}
    	
    	if(dojo.isSafari)
    	{
    		var beforeFocus = document.activeElement;
    		setTimeout(dojo.hitch(this, function(){
    			beforeFocus && beforeFocus.blur();
    			this.editor.focus2Grid();
    		}), 600);
    	}
    	else
    	{
    		setTimeout(dojo.hitch(this, function(){
    			this.editor.focus2Grid();
    		}), 0);
    	}
    }, 
     
     _getAllColJson: function(sheetName)
     {
    	var mHelper = websheet.model.ModelHelper;
     	var docObj = this.editor.getDocumentObj();
     	var sheet = docObj.getSheet(sheetName);
    	var colModels = sheet._columns;
    	var len = colModels.length;
    	var lastColIndex = 1;
    	if(len > 0)
    	{
			var lastCol = colModels[len -1];
			lastColIndex = lastCol._repeatedNum ? (lastCol.getIndex() + lastCol._repeatedNum):lastCol.getIndex();
    	}	
    	var cols = {};
    	cols.columns = mHelper.toColsJSON(sheetName,1,lastColIndex,{bSet:true});
    	return cols;
     },
     
    _formatRowRange: function(event, sheetName, startRowIndex, endRowIndex) {
    	var helper = websheet.model.ModelHelper;
    	var isFilter = true;
    	var maxCellsNumber = websheet.Constant.MaxCopyCells;
        var maxColumn = websheet.Constant.MaxColumnIndex;
    	var maxRow = parseInt(maxCellsNumber / maxColumn);
    	var _endRowIndex = endRowIndex;
    	var _useTwoSteps = false;
    	if(endRowIndex - startRowIndex > maxRow * 2)
    	{
    		// we are coping less than 1/2 of the whole rows out.
    		// copy what we need out first.
    		_endRowIndex = startRowIndex + maxRow - 1;
    		_useTwoSteps = true;
    	}
    
    	var isCopyAll = endRowIndex == this.editor.getMaxRow() && startRowIndex == 1;
    	
    	var rangeJson = helper.toRangeJSON(sheetName, startRowIndex, 1,
    			_endRowIndex, websheet.Constant.MaxColumnIndex, { forRow: true ,checkFilter:isFilter, forCopy:true, forCut: false});
    	
    	var filteredRowNum = rangeJson.filterRowNum || 0;
    	var refValue = websheet.Helper.getAddressByIndex(sheetName,startRowIndex,null,null,(_endRowIndex-filteredRowNum),null);
    	delete rangeJson.filterRowNum;
    	
    	var dvs = websheet.model.ModelHelper.getJSONByUsage(sheetName, startRowIndex, 1,
        		_endRowIndex, websheet.Constant.MaxColumnIndex, websheet.Constant.RangeUsage.DATA_VALIDATION);

    	var data = {rows: rangeJson, dvs: dvs};
    	if(isCopyAll)
    	{
    		var colsJson = this._getAllColJson(sheetName);
			dojo.mixin(data, colsJson);
		}
    	var maxShowColIndex = helper.getMaxColIndex4Show(sheetName,startRowIndex,_endRowIndex);
    	var content = {data: data, filteredRowNum: filteredRowNum, refValue: refValue, refType: websheet.Constant.RowRange, maxShowColIndex : maxShowColIndex, _limited:_useTwoSteps};
    	
    	if(_useTwoSteps)
    	{
	    	var callback = dojo.hitch(this, function(data){
	    		// calculate all..
	    		setTimeout(dojo.hitch(this, function(){
	    			var rows = data.data.rows;
	    			var maxRowIndex = 1;
	    			if(rows)
	    			{
	    				for(var x in rows)
	    				{
	    					if(x !== "filterRowNum")
	    						maxRowIndex = Math.max(maxRowIndex, parseInt(x));
	    				}
	    			}
	    			
	    			maxRowIndex += data.filteredRowNum;
	    			
		    		var rangeJson = helper.toRangeJSON(sheetName, isCopyAll ? 1 : maxRowIndex, 1,
		        			endRowIndex, websheet.Constant.MaxColumnIndex, { forRow: true, checkFilter:isFilter, includeColumnStyle:!isCopyAll});
		    		
		    		var filterRowNum = isFilter ?  websheet.Utils.getFilterRowNum(sheetName, startRowIndex, endRowIndex) : 0;
		    		var refValue = websheet.Helper.getAddressByIndex(sheetName,startRowIndex,null,null,(endRowIndex-filterRowNum),null);
		    		
		    		if(!rows || isCopyAll)
		    			rows = rangeJson;
		    		else
		    		{
			    		for(var y in rangeJson)
			    		{
			    			// merge two step's results together.
			    			rows[y] = rangeJson[y];
			    		}
		    		}
		    		
		        	delete rows.filterRowNum;
		        	
		        	var rangeJSON = {rows: rows, dvs: data.data.dvs};
		        	if(isCopyAll)
		        	{
		        		var colsJson = this._getAllColJson(sheetName);
		    			dojo.mixin(rangeJSON, colsJson);
		    		}
		        	var maxShowColIndex = helper.getMaxColIndex4Show(sheetName,startRowIndex,endRowIndex);
		        	var content = {data: rangeJSON, refValue: refValue, refType: websheet.Constant.RowRange, maxShowColIndex : maxShowColIndex};
		        	content.sysclip = data.sysclip;
		        	content.sn = data.sn;
		        	setTimeout(dojo.hitch(this, function(){
		        		this._storage.setData(content);
		        	},0));
	    		}), 800);
	    	});
	    	
	    	this._onFormat(content, event, callback);
    	}
    	else
    	{
    		// copy all would not go here. it will use two - steps.
    		this._onFormat(content, event);
    	}
    },
    
    _getColumnRangeJson: function(sheetName, scIndex, ecIndex, bCheckFilter, bCheckMerge, forCopy)
    {
    	var mHelper = websheet.model.ModelHelper;
    	var maxRowIndex = websheet.Constant.MaxRowNum; //mHelper.getMaxRowIndex(sheet,scIndex,ecIndex);
    	var rowsJson = mHelper.toRangeJSON(sheetName,1,scIndex,maxRowIndex,ecIndex,{checkMerge:bCheckMerge,checkFilter:bCheckFilter,forCopy:forCopy, forCut: false /*,includeColumnStyle:true,forColumn:true*/});
    	delete rowsJson.filterRowNum;
    	var rangeJson = {};
    	if(rowsJson) rangeJson.rows = rowsJson;
    	var colsJson = mHelper.toColsJSON(sheetName,scIndex, ecIndex, {/*Only get columns json, exclude rows/meta*/bSet : true});
    	rangeJson.columns = colsJson;
    	var dvs = websheet.model.ModelHelper.getJSONByUsage(sheetName, 1, scIndex,
    			maxRowIndex, ecIndex, websheet.Constant.RangeUsage.DATA_VALIDATION);
    	rangeJson.dvs = dvs;
    	return rangeJson;
    },
    
    _formatColumn: function(event, sheetName, scIndex, ecIndex) {
    	if(scIndex == ecIndex &&  websheet.Utils.isLastHiddenCol(sheetName,scIndex))
    		return;
    	
    	var strSCIndex = websheet.Helper.getColChar(scIndex);
    	var strECIndex = websheet.Helper.getColChar(ecIndex);
    	var params = {refMask: websheet.Constant.COLS_MASK};
    	var refValue = websheet.Helper.getAddressByIndex(sheetName,null,strSCIndex,null,null,strECIndex,params);
    	var data = this._getColumnRangeJson(sheetName, scIndex,ecIndex, true, true, true);
    	var content = {data: data, refValue: refValue, refType: websheet.Constant.Column};
    	this._onFormat(content, event);
    },
    
    _formatCell: function(event, sheetName, rowIndex, colIndex) {
    	var colName = websheet.Helper.getColChar(colIndex);
    	var refValue = websheet.Helper.getCellAddr(sheetName,rowIndex,colName);
    	var cellJson = this._getCellJson(sheetName, rowIndex, colIndex, true);
    	delete cellJson.rn;
    	var dvs = websheet.model.ModelHelper.getJSONByUsage(sheetName, rowIndex, colIndex,
        		rowIndex, colIndex, websheet.Constant.RangeUsage.DATA_VALIDATION);
    	var data = {cell: cellJson, dvs : dvs};
    	var content = {data: data, refValue: refValue, refType: websheet.Constant.Cell};
    	this._onFormat(content, event);
    },
    
    _formatRange: function(event, sheetName, startRowIndex, endRowIndex, startColIndex, endColIndex) {
    	var startColName = websheet.Helper.getColChar(startColIndex);
    	var endColName = websheet.Helper.getColChar(endColIndex);
    	var rangeJson = websheet.model.ModelHelper.toRangeJSON(sheetName, startRowIndex, startColIndex,
    		endRowIndex, endColIndex,{checkFilter:true,forCopy:true, forCut: false});
    	var filteredRowNum = rangeJson.filterRowNum || 0;
    	var refValue = websheet.Helper.getAddressByIndex(sheetName,startRowIndex,startColName,null,(endRowIndex-filteredRowNum),endColName);
    	delete rangeJson.filterRowNum;
    	
    	var dvs = websheet.model.ModelHelper.getJSONByUsage(sheetName, startRowIndex, startColIndex,
        		endRowIndex, endColIndex, websheet.Constant.RangeUsage.DATA_VALIDATION);
    	
    	var data = {rows: rangeJson, dvs : dvs};
    	var content = {data: data, refValue: refValue, refType: websheet.Constant.Range};
    	var callback = dojo.hitch(this, function(data){
    		this._storage.setData(data);
    	});
    	this._onFormat(content, event, callback);
    },
    
    _paint: function(content)
    {
    	if(!content)
    	{
    		this.editor.scene.hideErrorMessage();
    		return;
    	}
    	var refType = content.refType;
    	var refValue = content.refValue;
    	var data = content.data;
    	if (refType == undefined || refValue == undefined || !data) {
    		this.editor.scene.hideErrorMessage();
    		return;
    	}
    	var grid = this.editor.getCurrentGrid();
    	var sheetName = grid.getSheetName();
		var selector = grid.selection.selector();
		var range = selector.getRangeInfo();
		var maxRow = this.editor.getMaxRow();
		// calculate rowIndex & colIndex
		//websheet.parse.FormulaParseHelper.enableCache();

        var rowIndex = grid.selection.getFocusedRow() + 1;
        var colIndex = grid.selection.getFocusedCol();        
		var cbRef = websheet.Helper.parseRef(refValue);		
		var srcSheetName = cbRef.sheetName;
		
		var mHelper = websheet.model.ModelHelper;
        switch (refType) {
        case websheet.Constant.RowRange:
        case websheet.Constant.Row:
        	if (!data.rows) {
        		this.editor.scene.hideErrorMessage();
        		return;
        	}
        	
        	if (selector.selectingColumns())
        	{
        		var dlg = new concord.widgets.MessageBox(this, this._baseNLS.PAINT, null, false, 
						{message: this._baseNLS.PAINT_NO_MATCHED_SPACE});
        		dlg.show();
        		this.editor.scene.hideErrorMessage();
        		return;
        	}
        	
        	if (selector.selectingRows()) {
        		// when clipboard is row, current selector is row, normalize focus to row start
        		rowIndex = range.startRow;
        		colIndex = 1;
        	}
        	
        	if (colIndex > 1) {
        		// paste row but not start with first column, error
				var dlg = new concord.widgets.MessageBox(this, this._baseNLS.PAINT, null, false, 
											{message: this._baseNLS.PAINT_NO_MATCHED_SPACE});
				dlg.show();
				this.editor.scene.hideErrorMessage();
				return;
        	}
        	var endRowIndex = rowIndex + cbRef.endRow - cbRef.startRow;
        	
        	var selectEndRowIndex = range.endRow;
        	var rowsCount = cbRef.endRow - cbRef.startRow + 1;
        	
        	var remainRows = selectEndRowIndex - endRowIndex;
        	var times = Math.floor(remainRows / rowsCount);
        	if(times >= 0)
        	{
        		endRowIndex = endRowIndex + times * rowsCount;
        	}
        	
          	if (endRowIndex > maxRow ) {
				this.editor.scene.hideErrorMessage();
				return;
        	}
        	
          	if(mHelper.isRowProtected(sheetName, rowIndex, endRowIndex)){
        		this.editor.protectedWarningDlg();
        		this.editor.scene.hideErrorMessage();
        		return;
          	}
          	var addr = websheet.Helper.getAddressByIndex(sheetName,rowIndex,null,null,endRowIndex,null,{refMask:websheet.Constant.ROWS_MASK});
        	if(this.editor.isACLForbiddenArea(addr))
        		return;
        	
        	this._paintRowRange(data, sheetName, rowIndex, endRowIndex, cbRef.startRow, cbRef.endRow, content.maxShowColIndex, srcSheetName);
        	break;
		case websheet.Constant.Column:
		case websheet.Constant.ColumnRange:	
        	if (!data.rows) {
        		this.editor.scene.hideErrorMessage();
        		return;	
        	}
        	if (selector.selectingRows())
        	{
        		if(!(range.startRow == 1 && range.endRow == maxRow))
        		{
        			var dlg = new concord.widgets.MessageBox(this, this._baseNLS.PAINT, null, false, 
							{message: this._baseNLS.PAINT_NO_MATCHED_SPACE});
        			dlg.show();
        			this.editor.scene.hideErrorMessage();
        			return;
        		}
        		else
        		{
        			// select all
        			rowIndex = 1;
            		colIndex = 1;
        		}
        	}
        	var endColIndex = range.endCol;
        	if (selector.selectingColumns())
        	{
        		// when clipboard is column, current selector is column, normalize focus to column start
        		rowIndex = 1;
        		colIndex = range.startCol;
        	}
        	if (rowIndex > 1) {
        		// paste column but not start with first row, error
				var dlg = new concord.widgets.MessageBox(this, this._baseNLS.PAINT, null, false, 
											{message: this._baseNLS.PAINT_NO_MATCHED_SPACE});
				dlg.show();
				this.editor.scene.hideErrorMessage();
				return;
        	}
        	
			var cbColIndex = cbRef.startCol;
			var cbEColIndex = cbRef.endCol;
			var colsCount = cbEColIndex - cbColIndex + 1;
			var endCol = colIndex + colsCount - 1;

			var remainCols = endColIndex - endCol;
			var times = Math.floor(remainCols / colsCount);
			if(times >= 0)
			{
				endCol = endCol + times * colsCount;
			}
    		
	      	if (endCol > websheet.Constant.MaxColumnIndex) {
				this.editor.scene.hideErrorMessage();
				return;
        	}
	    	if(mHelper.isColumnProtected(sheetName,colIndex, endCol)){
        		this.editor.protectedWarningDlg();
        		this.editor.scene.hideErrorMessage();
        		return;
	    	}
	    	var addr = websheet.Helper.getAddressByIndex(sheetName,null,colIndex,null,null,endColIndex,{refMask:websheet.Constant.COLS_MASK});
	    	if(this.editor.isACLForbiddenArea(addr))
	    		return;

	    	this._paintColumn(data, sheetName, colIndex, endCol, cbColIndex, cbEColIndex, srcSheetName);
			break;
        case websheet.Constant.Cell:   
        	if (!data.cell) {
        		this.editor.scene.hideErrorMessage();
        		return;
        	}
        	data = websheet.Helper.cloneJSON(data);
        	// TODO, rowSpan
        	cbRef.endRow = cbRef.startRow;
        	var cell = data.cell;
        	var colName = websheet.Helper.getColChar(cbRef.startCol);
        	data.rows = {};
        	data.rows[cbRef.startRow + ""] = {cells:{}};
        	data.rows[cbRef.startRow + ""].cells[colName] = cell;
        	var cbColIndex = cbRef.startCol;
        	var cbEndColIndex = cbColIndex;
        	var colspan = data.cell.cs;
        	if(colspan && colspan >1)
        	{
        		cbEndColIndex = cbColIndex + colspan - 1;
        	}
        	cbRef.endCol = cbEndColIndex;
        	delete data.cell;
        	// use Range for cell, no break here/
        case websheet.Constant.Range:

        	if (!data.rows) {
        		this.editor.scene.hideErrorMessage();
        		return;
        	}
        	
        	if (selector.selectingRows()) {
        		rowIndex = range.startRow;
        		colIndex = 1;
        	}
        	
        	else if (selector.selectingColumns())
        	{
        		colIndex = range.startCol;
        		rowIndex = 1;
        	}
        	else
        	{
        		rowIndex = range.startRow;
        		colIndex = range.startCol;
        	}
        	
        	var cbStartColIndex = cbRef.startCol;
        	var cbEndColIndex = cbRef.endCol;
        	var cbStartRowIndex = cbRef.startRow;
        	var cbEndRowIndex = cbRef.endRow;
        	var endRowIndex = rowIndex + cbEndRowIndex - cbStartRowIndex;
        	var endColIndex = colIndex + cbEndColIndex - cbStartColIndex;
        	
        	if (endRowIndex > maxRow || endColIndex > websheet.Constant.MaxColumnIndex) {
				this.editor.scene.hideErrorMessage();
				return;
        	}
        	
        	var selectStartRowIndex = rowIndex;
        	var selectStartColIndex = colIndex;
        	
        	var selectEndRowIndex = range.endRow;
        	var selectEndColIndex = range.endCol;
        	
        	var rowsCount = cbEndRowIndex - cbStartRowIndex + 1;
        	var colsCount = cbEndColIndex - cbStartColIndex + 1;
        	
        	if(selectEndRowIndex < endRowIndex)
        	{
        		selectEndRowIndex = endRowIndex;
        	}
        	else
        	{
        		var remainRows = selectEndRowIndex - endRowIndex;
        		var times = Math.floor(remainRows / rowsCount);
        		if(times >= 0)
        		{
        			selectEndRowIndex = endRowIndex + times * rowsCount;
        		}
        	}
        	if(selectEndColIndex < endColIndex)
        	{
        		selectEndColIndex = endColIndex;
        	}
        	else
        	{
        		var remainCols = selectEndColIndex - endColIndex;
        		var times = Math.floor(remainCols / colsCount);
        		if(times >= 0)
        		{
        			selectEndColIndex = endColIndex + times * colsCount;
        		}
        	}
        	if(mHelper.isRangeProtected(sheetName, rowIndex, endRowIndex, colIndex, endColIndex)){
        		this.editor.protectedWarningDlg();
        		this.editor.scene.hideErrorMessage();
        		return;
        	}
        	var addr = websheet.Helper.getAddressByIndex(sheetName,rowIndex,colIndex,null,selectEndRowIndex,selectEndColIndex,{refMask:websheet.Constant.RANGE_MASK});
        	if(this.editor.isACLForbiddenArea(addr))
        		return;
        	
        	this._paintRange(data, sheetName, rowIndex, selectEndRowIndex, colIndex, selectEndColIndex, cbStartRowIndex, cbStartColIndex, cbEndRowIndex, cbEndColIndex, srcSheetName);
        	break;
        default:
        	this.editor.scene.hideErrorMessage();
        	break;
        }  

    },
    
    _paintCallback: function (result, srcSheetName, rowIndex, colIndex) {
    	this.editor.resumeGridUpdate();
    	if (result)
    		this.editor.sendMessage(result.event, result.reverse, {"atomic": true});
    	
    	this.editor.scene.hideErrorMessage();
    	
        this.controller.validateSheet (srcSheetName);
        var cellStyle = websheet.model.ModelHelper.getStyleCode (srcSheetName, rowIndex, colIndex, BidiUtils.isBidiOn());
        this.editor.applyUIStyle(cellStyle);
    	
    	// check focus just after paint done.
    	this.editor.getTaskMan().addTask(this, "_checkFocus", [], null, false, 0, function (newTask, taskInQueue) {
			if (newTask.task == taskInQueue.task) {
				return -1; // remove the old task in queue, keep the new task;
			}
		});
    },
    
    _checkFocus: function()
    {
    	var sheetName = this.editor.getCurrentGrid().getSheetName();
    	var grid = this.editor.getController().getGrid(sheetName);
    	if(!grid._focusWithInGrid())
    		this.editor.focus2Grid();
    },
   
    _paintColumn: function(data, sheetName, colIndex, endCol, cbColIndex, cbEColIndex, srcSheetName) {
    	if(colIndex == endCol && websheet.Utils.isLastHiddenCol(sheetName,colIndex))
    		return;
    	var params = {data: data, sheetName: sheetName, 
			     startColIndex:colIndex, endColIndex: endCol, 
			     cbStartColIndex: cbColIndex,  cbEndColIndex: cbEColIndex, srcSheetName: srcSheetName};
    	this._transformRange(dojo.hitch(this, this._paintColumnCallback), params, 1, null, colIndex, endCol, 1, null, cbColIndex, cbEColIndex, websheet.Constant.Column);
    },
    
    _paintColumnCallbackSetEvent: function(params, origRangeJson)
    {
        var data = params.data;
    	var sheetName = params.sheetName;
    	var srcSheetName = params.srcSheetName;
    	var colIndex = params.startColIndex;
    	var endCol = params.endColIndex;
    	var pasteData = params.result;  
    	
    	var maxOrigRowIndex = this._getMaxIndex(origRangeJson.rows);
    	var maxCbRowIndex = this._getMaxIndex(data.rows);
    	var maxRowIndex = Math.max(maxOrigRowIndex, maxCbRowIndex);
    	params.maxRowIndex = maxRowIndex; 	
    	
    	var strSCol = websheet.Helper.getColChar(colIndex);
    	var strECol = websheet.Helper.getColChar(endCol);
    	var refValue=websheet.Helper.getAddressByIndex(sheetName,1 , strSCol,null,maxRowIndex,strECol);
    	var attrs = { rows: pasteData.rows, dvs: pasteData.dvs, bR: false, bCol: true };
    	if(pasteData.columns)
    		attrs.columns = pasteData.columns;
    	if(data.extras)
	  		attrs.compactData = data;
    	var event = new websheet.event.SetUnnameRange(refValue, attrs);
    	attrs = { rows: origRangeJson.rows, dvs: origRangeJson.dvs, bR: true, bCol: true };
    	if(origRangeJson.columns)
    		attrs.columns = origRangeJson.columns;
    	var reverseContent = {};
    	if(origRangeJson.mergeCells)
    		reverseContent.mergeCells = origRangeJson.mergeCells;
    	var reverse = new websheet.event.Reverse(event, refValue, attrs,reverseContent);
    	var result = { event: event, reverse: reverse };
    	
    	// clear column styles
    	var csParams = {refMask: websheet.Constant.COLS_MASK};
    	var csRefValue = websheet.Helper.getAddressByIndex(sheetName, null, colIndex, null, null, endCol,csParams);
    	var csAttrs = this._paintColumnClearStyle(sheetName, colIndex, endCol);
    	var eventClear = new websheet.event.SetColumn(csRefValue,  csAttrs);
    	event.getMessage().updates.forEach(function(v){eventClear.getMessage().updates.push(v);});
    	result.event = eventClear;
		
    	var tm = this.editor.getTaskMan();
    	tm.addTask(this, "_paintColumnCallbackSetRange", [params, result], tm.Priority.UserOperation);
    	tm.start();
    },
    
    _paintColumnCallbackSetRange: function(params, result)
    {
    	var sheetName = params.sheetName;
    	var colIndex = params.startColIndex;
    	var endCol = params.endColIndex;
    	var pasteData = params.result;  
    	var maxRowIndex = params.maxRowIndex;
    	var srcSheetName = params.srcSheetName;

    	var nextCallback = dojo.hitch(this, this._paintCallback, result, srcSheetName, 1, colIndex);
    	var callback = dojo.hitch(this, this.editor.addRangesByJSON, pasteData.dvs, nextCallback);
    	this.controller.asyncSetRange(sheetName, 1, maxRowIndex, colIndex, endCol, pasteData, {forReplace: false, forColumn:true, callback: callback });
    },
    
    _paintColumnCallback: function(params) {
    	var data = params.data;
    	var sheetName = params.sheetName;
    	var scIndex = params.startColIndex;
    	var ecIndex = params.endColIndex;
    	
    	var origRangeJson = this._getColumnRangeJson(sheetName, scIndex, ecIndex,false, false, false);
    	this._toJSON4Msg(origRangeJson.dvs, websheet.Constant.RangeUsage.DATA_VALIDATION, "DV");
        var range = {};
		range.sheetName = sheetName;
		range.startRow = 1;
		range.startCol = scIndex;
		range.endRow = this.editor.getMaxRow();
		range.endCol = ecIndex;
		var expandRange = websheet.Utils.getExpandRangeInfo(range);
		if(expandRange.startCol != scIndex || expandRange.endCol != ecIndex)
		{
			var mergeCellInfo = websheet.Utils.getMergeCellInfo(sheetName,1,range.endRow,expandRange.startCol, expandRange.endCol);
			origRangeJson.mergeCells = mergeCellInfo;
		}	
    	var tm = this.editor.getTaskMan();
    	tm.addTask(this.editor.scene, "showWarningMessage", [this.editor.scene.nls.browserWorkingMsg], tm.Priority.UserOperation);
    	tm.addTask(this, "_paintColumnCallbackSetEvent", [params, origRangeJson], tm.Priority.UserOperation);
    	tm.start();
    },
    /**
     * Refer to SetStyle method in Main.js
     * @param sheetName the sheet name
     * @param startColIndex the start column index of the target column range
     * @param endColIndex the end column index of the target column range
     * @param maxRowIndex the end row index
     */
    _paintColumnClearStyle: function(sheetName, startColIndex, endColIndex)
    {
    	var style = {id: websheet.Constant.Style.DEFAULT_CELL_STYLE};
    	var hasFilteredRows = websheet.Utils.hasFilteredRows( {sheetName: sheetName, startRow: 1,
    		endRow: websheet.Constant.MaxRowNum, startCol: startColIndex, endCol: endColIndex});
    	var rowsStyleDelta = websheet.model.ModelHelper.toRangeJSON(sheetName, 1, startColIndex, websheet.Constant.MaxRowNum, endColIndex,
    		{includeColumnStyle: hasFilteredRows, includeValue: false, computeDelta: true, style: style, forColumn: true, ignoreFilteredRows: hasFilteredRows});
    	var utils = websheet.Utils;
    	var bUpdateChart = false;
    	if (style.id && utils.isJSONContainValue(rowsStyleDelta, utils.hasFormat))
    		bUpdateChart = true;
    	
    	var params = {};
    	params.updateGrid = true;
    	params.bReplaceStyle = undefined;
    	params.bSetFocus = true;
    	params.bUpdateChart = bUpdateChart;
    	
    	var colJson = {};
    	var attr;
    	if (hasFilteredRows) {
    		var rowsMeta = {};
    		for (var rowIdx in rowsStyleDelta) {
    			if (rowsStyleDelta.hasOwnProperty(rowIdx)){
    				if (rowsStyleDelta[rowIdx].visibility) {
    					rowsMeta[rowIdx] = websheet.Helper.cloneJSON(rowsStyleDelta[rowIdx]);
    					delete rowsMeta[rowIdx].visibility;
    				}
    			}
    		}
    		colJson.rows = rowsMeta;
    		var columnsMeta = {};
    		var sStartCol = websheet.Helper.getColChar(startColIndex);
    		columnsMeta[sStartCol] = {
    				"style": style,
    				"rn": endColIndex - startColIndex 
    		};
    		colJson.columns = columnsMeta;
    		attr = websheet.Helper.cloneJSON(colJson);
    	} else {
    		attr = colJson = {style: style};
    	}
    	this.controller.setColumns(sheetName, startColIndex, endColIndex, colJson, params);	
    	return attr;
    },
    
    _paintRowRange: function(data, sheetName, startRowIndex, endRowIndex, cbStartRowIndex, cbEndRowIndex, maxShowColIndex, srcSheetName) {
    	var params = {data: data, sheetName: sheetName, startRowIndex: startRowIndex, endRowIndex: endRowIndex, cbEndRowIndex: cbEndRowIndex,
    				 cbStartRowIndex: cbStartRowIndex, maxShowColIndex: maxShowColIndex, srcSheetName: srcSheetName};
    	this._transformRange(dojo.hitch(this, this._paintRowRangeCallback), params, startRowIndex, endRowIndex, 1, null, cbStartRowIndex, cbEndRowIndex, 1, null, websheet.Constant.Row);
    },
    
    _paintRowRangeCallback: function(params) {
    	if (params.cbEndRowIndex - params.cbStartRowIndex > websheet.Constant.THRESHOLD_ASYNC_SET_RANGE / params.maxShowColIndex) {
    		// only show working message if pasted range is larger than threshold
    		this.editor.scene.showWarningMessage(this.editor.scene.nls.browserWorkingMsg, 0);
    	}
    	
    	var data = params.data;
    	var sheetName = params.sheetName;
    	var startRowIndex = params.startRowIndex;
    	var endRowIndex = params.endRowIndex;
    	var pasteData = params.result;
    	var srcSheetName = params.srcSheetName;
    	var maxRow = this.editor.getMaxRow();

    	var maxColIndex = websheet.Constant.MaxColumnIndex;
    	
    	// has column attributes, then, it is paste all.
    	var isPasteAll = data.columns ? true: false;
    	
    	var maxColName = websheet.Helper.getColChar(maxColIndex);
    	var refValue = websheet.Helper.getAddressByIndex(sheetName, startRowIndex, "A", null, endRowIndex, maxColName);
    	var attrs = { rows: pasteData.rows, dvs: pasteData.dvs, bR: false ,bRow: true};
    	if(pasteData.columns)
    		attrs.columns = pasteData.columns;
    	if(data.extras)
	  		attrs.compactData = data;
       	
       	if(isPasteAll)
       		attrs.bCol = true;
       	
       	var refValue_reverse = refValue;
    	var event = new websheet.event.SetUnnameRange(refValue, attrs);
    	var origRowsJSON;
    	var oriDvs;
    	var reverseContent = {};
    	if(isPasteAll){
    		origRowsJSON = websheet.model.ModelHelper.toRangeJSON(sheetName, 1, 1, maxRow, maxColIndex, { forRow: true, includeColumnStyle:false} );
    		oriDvs = websheet.model.ModelHelper.getJSONByUsage(sheetName,  1, 1, maxRow, maxColIndex, websheet.Constant.RangeUsage.DATA_VALIDATION);
    	}
    	else {
    		origRowsJSON = websheet.model.ModelHelper.toRangeJSON(sheetName, startRowIndex, 1, endRowIndex, maxColIndex, { forRow: true, includeColumnStyle:true} );
    		var expandRange = websheet.Utils.getExpandRangeInfo({sheetName:sheetName, startRow:startRowIndex, startCol:1, endRow:endRowIndex, endCol:maxColIndex});
    		if(expandRange.startRow != startRowIndex || expandRange.endRow != endRowIndex)
    		{
    			var mergeCellInfo = websheet.Utils.getMergeCellInfo(sheetName,expandRange.startRow,expandRange.endRow,1, maxColIndex);
    			reverseContent.mergeCells = mergeCellInfo;
    		}
    		oriDvs = websheet.model.ModelHelper.getJSONByUsage(sheetName, startRowIndex, 1 , endRowIndex, maxColIndex, websheet.Constant.RangeUsage.DATA_VALIDATION);
    	}
    	this._toJSON4Msg(oriDvs, websheet.Constant.RangeUsage.DATA_VALIDATION, "DV");
    	attrs = { rows: origRowsJSON, bR: true ,bRow: true, dvs: oriDvs};
    	if(isPasteAll)
    	{
    		attrs.columns = this._getAllColJson(sheetName).columns;
           	attrs.bCol = true;
    	}
    	
    	if(isPasteAll)    	
    		refValue_reverse = websheet.Helper.getAddressByIndex(sheetName, 1, "A", null, maxRow, maxColName);
    	//TODO: mergeCells in undo event?
    	var reverse = new websheet.event.Reverse(event, refValue_reverse, attrs, reverseContent); 
    	var result = { event: event, reverse: reverse };	
    	
    	//Considering of clear style of target rows
    	var csAttrs = this._paintRowClearStyle(sheetName, startRowIndex, endRowIndex);
    	var csParams = {refMask: websheet.Constant.ROWS_MASK};
    	var csRefValue = websheet.Helper.getAddressByIndex(sheetName, startRowIndex, "A", null, endRowIndex, maxColName, csParams);
    	var eventClear = new websheet.event.SetRow(csRefValue, csAttrs);
    	event.getMessage().updates.forEach(function(v){eventClear.getMessage().updates.push(v);});
    	result.event = eventClear;
    	
    	var nextCallback = dojo.hitch(this, this._paintRowCallbackDone, result, sheetName, srcSheetName, startRowIndex, endRowIndex, maxColIndex, origRowsJSON, pasteData, params);
    	var callback = dojo.hitch(this, this.editor.addRangesByJSON, pasteData.dvs, nextCallback);
    	this.controller.asyncSetRange(sheetName, startRowIndex, endRowIndex, 1, maxColIndex, pasteData, {forReplace: false, forRow:true, forColumn:isPasteAll, callback: callback});
    },
    
     /**
      * Refer to SetStyle method in Main.js
      * @param sheetName the sheet name
      * @param startRowIndex the start row index of target row range
      * @param endRowIndex the end row index of target row range
      * @param hasFilteredRows whether or not containing filtered rows
      * @returns {rows: rowsJson} which is used to clear styles of targe row range
      */
    _paintRowClearStyle: function(sheetName, startRowIndex, endRowIndex){
    	var rowJson = {};
    	var attr = null;
    	var style = {id: websheet.Constant.Style.DEFAULT_CELL_STYLE};
    	var hasFilteredRows = websheet.Utils.hasFilteredRows( {sheetName: sheetName, startRow: startRowIndex,
    		endRow: endRowIndex, startCol: 1, endCol: websheet.Constant.MaxColumnIndex});
    	var rowsDeltaStyle = websheet.model.ModelHelper.toRangeJSON(sheetName, startRowIndex, 1, endRowIndex, websheet.Constant.MaxColumnIndex,
    			{ includeValue: false,  computeDelta: true, style: style, ignoreFilteredRows: hasFilteredRows});
    	var utils = websheet.Utils;
        var bUpdateChart = false;
    	if (style.id &&  utils.isJSONContainValue(rowsDeltaStyle, utils.hasFormat))
    		bUpdateChart = true;
    	
    	rowJson.style = style;
    	var cellsJson = {
    		"A": {
    			"style": style,
    			"rn": websheet.Constant.MaxColumnIndex - 1
    		}
    	};
    	var rowsMeta = {};
    	if (hasFilteredRows) {
    		rowsMeta = websheet.Helper.cloneJSON(rowsDeltaStyle);
    		for (var rowIdx in rowsMeta) {
    			if (rowsMeta.hasOwnProperty(rowIdx))
    				rowsMeta[rowIdx].cells = cellsJson;
    		}
    		attr = {rows: rowsMeta};
    	} else {
    		rowsMeta[startRowIndex] = {cells: cellsJson};
    		if (startRowIndex != endRowIndex) {
    			rowsMeta[startRowIndex].rn = endRowIndex - startRowIndex;
    		}
    		attr = {style: style};
    	}
    	rowJson.rows = rowsMeta;
    	var bReplaceStyle = undefined;
    	this.controller.setRows(sheetName, startRowIndex, endRowIndex, rowJson, bReplaceStyle, false, bUpdateChart);  	
    	return attr;
    },
    
    _paintRowCallbackDone: function(result, sheetName, srcSheetName, startRowIndex, endRowIndex, maxColIndex, origRowsJSON, pasteData, params)
    {
    	this._paintCallback(result, srcSheetName, startRowIndex, 1);
    },
    
	_paintRange: function(data, sheetName, startRowIndex, endRowIndex, startColIndex, endColIndex, cbStartRowIndex, cbStartColIndex, cbEndRowIndex, cbEndColIndex, srcSheetName) {
		var params = {data: data, sheetName: sheetName, startRowIndex: startRowIndex, endRowIndex: endRowIndex, 
				     startColIndex:startColIndex, endColIndex: endColIndex, 
				     cbStartRowIndex: cbStartRowIndex, cbStartColIndex: cbStartColIndex, cbEndRowIndex: cbEndRowIndex, cbEndColIndex: cbEndColIndex, srcSheetName: srcSheetName};
		this._transformRange(dojo.hitch(this, this._paintRangeCallback), params, startRowIndex, endRowIndex, startColIndex, endColIndex, cbStartRowIndex, cbEndRowIndex, cbStartColIndex, cbEndColIndex, websheet.Constant.Range);
	},
	
	_transformRange: function(callback, params, startRowIndex, endRowIndex, startColIndex, endColIndex, cbStartRowIndex, cbEndRowIndex, cbStartColIndex, cbEndColIndex, type)
	{
		var sheetName = params.sheetName;
		var data = params.data;
		var extras = {};
		extras.rowCount = cbEndRowIndex - cbStartRowIndex + 1;
		extras.colCount = cbEndColIndex - cbStartColIndex + 1;
		extras.rowDelta = startRowIndex - cbStartRowIndex;
		extras.colDelta = startColIndex - cbStartColIndex;
		extras.colRepeat = 1;
		extras.rowRepeat = 1;
		extras.sheetName = sheetName;
		
		this.controller.getGrid(sheetName).selection.selector();
		if(type != websheet.Constant.Row)
		{
			var colTimes = (endColIndex - startColIndex + 1)/(cbEndColIndex - cbStartColIndex + 1);
			if(colTimes > 1)
			{
				extras.colRepeat = colTimes;
			}
		}
		
		if(type != websheet.Constant.Column)
		{
			var rowTimes = (endRowIndex - startRowIndex + 1)/(cbEndRowIndex - cbStartRowIndex + 1);
			if(rowTimes > 1)
			{
				extras.rowRepeat = rowTimes;
			}
		}
		
		var cellsCount = 0;
		var fCellsCount = 0;
		if(data.rows)
		{
			for(var rowIndex in data.rows)
			{
				var row = data.rows[rowIndex];
				if(row.cells)
				{
					for(var colName in row.cells)
					{
						cellsCount ++;
						var cell = row.cells[colName];
						if (cell.v && websheet.parse.FormulaParseHelper.isFormula(cell.v)) 
							fCellsCount++;
					}
				}
			}
		}
		
		var isTooBig = extras.colRepeat * extras.rowRepeat > 1 && (cellsCount * extras.colRepeat * extras.rowRepeat > websheet.Constant.MaxCellsInPaste ||
				fCellsCount * extras.colRepeat * extras.rowRepeat > websheet.Constant.MaxFormulaCellsInPaste);
		if(!isTooBig)
		{
			//In order not to increase the flush message output, style's large area painting is not allowed
			if((type == websheet.Constant.Column && (endColIndex - startColIndex + 1) > websheet.Constant.MaxColumnIndex/2) 
					|| type == websheet.Constant.Row && (endRowIndex - startRowIndex + 1) > this.editor.getMaxRow()/2)
			{
				isTooBig = true;
			}
		}
		if(isTooBig)
		{
			var dlg = new concord.widgets.MessageBox(this, this._baseNLS.PAINT, null, false, 
					{message: this._baseNLS.PAINT_LARGE_DATA});
			dlg.show();
			this.editor.scene.hideErrorMessage();
			return;
		}
		
		delete data.extras;
		
		if(extras.colRepeat > 1 || extras.rowRepeat > 1)
		{
			data.extras = extras;
		}
		
		websheet.RangeDataHelper.transformData(data, extras, false, callback, params); //dont's transform formular
		
		this._reviseSelectRect(sheetName, startRowIndex, endRowIndex, startColIndex, endColIndex, type);
	},
	
	_paintRangeCallback: function(params) {
		var data = params.data;
		var sheetName = params.sheetName;
		var startRowIndex = params.startRowIndex;
		var endRowIndex = params.endRowIndex;
		var startColIndex = params.startColIndex;
		var endColIndex = params.endColIndex;
		
		var startColName = websheet.Helper.getColChar(startColIndex);
		var endColName = websheet.Helper.getColChar(endColIndex);
		
		var pasteData = params.result;
        var ignoreFilteredRow = (params.cbStartRowIndex == params.cbEndRowIndex);
        
        var range = {};
		range.sheetName = sheetName;
		range.startRow = startRowIndex;
		range.startCol = startColIndex;
		range.endRow = endRowIndex;
		range.endCol = endColIndex;
		var expandRange = websheet.Utils.getExpandRangeInfo(range);
		var startColName1 = websheet.Helper.getColChar(expandRange.startCol);
		var endColName1 = websheet.Helper.getColChar(expandRange.endCol);
		
	  	var refValue = websheet.Helper.getAddressByIndex(sheetName, startRowIndex, startColName,null,endRowIndex,endColName);
	  	var attrs = { rows: pasteData.rows, dvs: pasteData.dvs, bR: false, ignoreFilteredRow: ignoreFilteredRow};
	  	if(data.extras)
	  		attrs.compactData = data;
    	var event = new websheet.event.SetUnnameRange(refValue, attrs);
    	
    	var origRowsJSON = params.toReload ? {} : websheet.model.ModelHelper.toRangeJSON(sheetName, expandRange.startRow, expandRange.startCol, expandRange.endRow, expandRange.endCol);
    	var oriDvs = websheet.model.ModelHelper.getJSONByUsage(sheetName, expandRange.startRow, expandRange.startCol, expandRange.endRow, expandRange.endCol, websheet.Constant.RangeUsage.DATA_VALIDATION);
    	this._toJSON4Msg(oriDvs, websheet.Constant.RangeUsage.DATA_VALIDATION, "DV");
    	var reverseContent = {};
    	if(expandRange.startCol != range.startCol || expandRange.endCol != range.endCol 
    			|| expandRange.startRow != range.startRow || expandRange.endRow != range.endRow)
		{
			var mergeCellInfo = websheet.Utils.getMergeCellInfo(sheetName,expandRange.startRow,expandRange.endRow,expandRange.startCol, expandRange.endCol);
			reverseContent.mergeCells = mergeCellInfo;
		}
    	var refValue1=websheet.Helper.getAddressByIndex(sheetName, startRowIndex, startColName1,null,endRowIndex,endColName1);
    	var reverse = new websheet.event.Reverse(event, refValue1, { rows: origRowsJSON, bR: true, dvs: oriDvs}, reverseContent);
    	
    	var result = { event: event, reverse: reverse };
    	
    	//construct a remove formatting event together with format&painter event
    	var cfAttrs = this._paintRangeClearStyle(sheetName, startRowIndex, startColIndex, endRowIndex, endColIndex, ignoreFilteredRow);
    	var eventClear = new websheet.event.SetUnnameRange(refValue, cfAttrs);
    	event.getMessage().updates.forEach(function(v){eventClear.getMessage().updates.push(v);});
    	result.event = eventClear;
    	
    	var _bFillLargeRange = ((endRowIndex - startRowIndex + 1) * (endColIndex - startColIndex + 1) > websheet.Constant.THRESHOLD_ASYNC_SET_RANGE);
    	
    	var nextCallback = dojo.hitch(this, this._paintRangeCallbackDone, result, params, startRowIndex, startColIndex);
    	var callback = dojo.hitch(this, this.editor.addRangesByJSON, pasteData.dvs, nextCallback);
    	if(_bFillLargeRange)
    	{
    		if(params.toReload)
    		{
    			// not used by now.
	    		this.editor.sendMessage(result.event, result.reverse, {"atomic": true}, true);
	    		
	    		this.editor.scene.session.forceSync();
	    		
	    		concord.net.Beater.beat(true);
	    		
	    		this.editor.scene.hideErrorMessage();
    			this.editor.scene.session.reload();	    	
	    		return;
    		}
    		var tm = this.editor.getTaskMan();
    		tm.addTask(this.editor.scene, "showWarningMessage", [this.editor.scene.nls.browserWorkingMsg], tm.Priority.UserOperation);
    		tm.addTask(this.controller, "asyncSetRange", [sheetName, startRowIndex, endRowIndex, startColIndex, endColIndex,  pasteData, {forReplace: false, callback: callback, ignoreFilteredRow: ignoreFilteredRow}], tm.Priority.UserOperation);
    		tm.start();
    	}
    	else
    	{
    		this.controller.setRange(sheetName, startRowIndex, endRowIndex, startColIndex, endColIndex,  pasteData, {forReplace: false, ignoreFilteredRow: ignoreFilteredRow});
    		callback.apply(this);
    	}
    },
    
    /**
     * Refer to SetStyle method in Main.js
     * @param sheetName the sheet name
     * @param startRowIndex start row index for range painter
     * @param startColIndex end column index for range painter
     * @param endRowIndex end row index for range painter
     * @param endColIndex end column index for range painter
     * @param hasFilteredRows whehter or not to ignore filtered rows
     * @returns {___anonymous_rangeJson} property for event
     */
    _paintRangeClearStyle: function(sheetName, startRowIndex, startColIndex, endRowIndex,  endColIndex, hasFilteredRows)
    {
    	var rangeJson = {};
    	var attr;
    	var style = {id: websheet.Constant.Style.DEFAULT_CELL_STYLE};
    	var sStartCol = websheet.Helper.getColChar(startColIndex);
    	var oldRangeStyle = websheet.model.ModelHelper.toRangeJSON(sheetName, startRowIndex, startColIndex, endRowIndex,  endColIndex,
    			{ includeValue: false, computeDelta: true, style: style, ignoreFilteredRows: hasFilteredRows} );
    	var bUpdateChart = false;
    	var utils = websheet.Utils;
    	if (style.id && utils.isJSONContainValue(oldRangeStyle, utils.hasFormat))
    		bUpdateChart = true;
    	
    	var cellsJson = {};
    	cellsJson[sStartCol] = {style: style};
    	if (endColIndex > startColIndex) {
    		cellsJson[sStartCol].rn = endColIndex - startColIndex ;
    	}
    	if (hasFilteredRows) {
    		var rowsMeta = websheet.Helper.cloneJSON(oldRangeStyle);
    		for (var rowIdx in rowsMeta) {
    			if (rowsMeta.hasOwnProperty(rowIdx))
    				rowsMeta[rowIdx].cells = cellsJson;
    		}
    		rangeJson.rows = rowsMeta;
    		attr = rangeJson;
    	} else {
    		rangeJson[startRowIndex] = {cells: cellsJson};
    		if (endRowIndex > startRowIndex) {
    			rangeJson[startRowIndex].rn = endRowIndex - startRowIndex;
    		}
    		attr = {style: style};
    	} 	
    	var bReplaceStyle = undefined;
    	this.controller.setRange(sheetName, startRowIndex, endRowIndex, startColIndex, endColIndex, rangeJson, {forReplace:bReplaceStyle, bUpdateChart: bUpdateChart});  
    	return attr;
    },
    
    _toJSON4Msg: function(oriJSON, usage, preId)
    {
    	if(oriJSON){
    		for(var i = 0; i < oriJSON.length; i ++){
    			var json = oriJSON[i];
    			json.data = {data: json.data,
    					rangeid:preId + dojox.uuid.generateRandomUuid(),
    					usage:usage};
    		}
    	}
    	return oriJSON;
    },
	
	_paintRangeCallbackDone: function(result, params, rowIndex, colIndex)
	{
		var cbSheetName = params.srcSheetName;
    	this._paintCallback(result, cbSheetName, rowIndex, colIndex);
	},
	
	/*
	 * Parameter json should not be changed.
	 */
    _transformColName: function(json, columnIndexDelta) {
    	var o = {};
    	
		for (var colName in json) {
			var colIndex = websheet.Helper.getColNum(colName);
			var newColIndex = colIndex + columnIndexDelta;
			var newColName = websheet.Helper.getColChar(newColIndex);
			o[newColName] = json[colName];
		}
    	return o;
    },

    _getCellJson: function(sheetName, rowIndex, colIndex, forCopy) {
    	var cellJson = {};
    	var d = this.editor.getDocumentObj();
    	var cell = d.getCell(sheetName, rowIndex, colIndex, websheet.Constant.CellType.MIXED, /* follow style */ true);//_isCovered is not useful when copy/paste cell
    	if (cell) {
    		var params = {bStyle: true, bValue: false, bHasColStyle: true, forCopy: forCopy, forCut: false};
    		cellJson = websheet.model.ModelHelper.toCellJSON(cell, params); // return null for empty cell
       		if (!cellJson) cellJson = {};
    		else if(forCopy)
    		{
    			var styleId = null;
    		    var column = d.getColumn(sheetName, colIndex, true);
    		    if (column)
    		    	styleId = column._styleId;
    		    cellJson.model = cell;
    		    cellJson.showValue = cell.getShowValue(cell._styleId || styleId);
    		    // if(cell.isFormula())
    		    //	 cellJson.cv = cell._calculatedValue;
    		}
    	} else {
    		var column = d.getColumn(sheetName, colIndex, true);
    		if (column) {
    			var colStyleCode = column.getStyle();
    			if (colStyleCode) {
    				cellJson.style = colStyleCode.toJSON();
    			}
    		}
    	}
    	return cellJson;
    },    
    
	_getMaxIndex: function(json) {
    	var max = 1;
    	for (var i in json) {
    		i = parseInt(i);
    		if (i > max) {
    			max = i;
    		}
    	}
    	max = (json[max] && json[max].rn) ? json[max].rn + max : max;
    	return max;
    }
});