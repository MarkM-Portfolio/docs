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

dojo.provide("websheet.sort.RangeSorting");

dojo.declare("websheet.sort.RangeSorting", null, {	
	
	editor: null,
	_sorter: null,
	_range: null,
	_rangeInfo: null,
	_oriFormulaCellsValue: null,
	_sortRangeConflictDlg : null,
	_sortDlg: null,
	// called from local, default to false, i.e. called from remote and no message sent after done
	_bLocal: false,
	ModelHelper: websheet.model.ModelHelper,
	Constant: websheet.Constant,
	doc: null,
		
	constructor: function(editor, rangeAddress, dlg) {
		this.editor = editor;
		this.doc = editor.getDocumentObj();
		var parsedRef = websheet.Helper.parseRef(rangeAddress);
		this._range = new websheet.parse.Reference(parsedRef, "dummyId");
		this._rangeInfo = this._range._getRangeInfo();
		this._sorter = websheet.sort.Sorter;
		this._sortDlg = dlg;
	},
	
	getRangeModel: function() {
		return this._range;
	},
	
	getRangeInfo: function() {
		return this._rangeInfo;
	},
	
	// for the cells if the rawvalue start with single quote, set the caculate value with rawvalue
	_getSortDataValue: function(sortRows, invisibledRows, expandRangeInfo)
	{
		var sortData = this.ModelHelper.getCells(expandRangeInfo, true);
		var ret = [];
		var lengthY = sortData.length;
		var rowModels = this.ModelHelper.getRows(expandRangeInfo, true, true).data;
		var colSpan = this.sortStructure.colSpan;
		var rowSpan = this.sortStructure.rowSpan;
		for(var i = 0; i < lengthY; i++)
		{
		    var lengthX = sortData[0].length;	
			if(!ret[i]) ret[i] = [];
			ret[i] = lengthX;
			
			if(!sortRows[i]) sortRows[i] = [];
			if(!invisibledRows[i]) invisibledRows[i] = [];
			
			for(var j = 0; j < lengthX; j++)
			{
				var cell = sortData[i][j];
				if (cell == null)
				{
					if(rowModels[j] && !rowModels[j].isVisibility())
						invisibledRows[i].push(j);
					else
						sortRows[i].push({value: null, index: j});
				    continue;
				}
				if(cell._parent.isVisibility())
				{
					if(cell.isError())
				    {
				    	// unnecessary to get style here
				    	 var showValue = cell.getShowValue();
					     sortRows[i].push({value: showValue, index: j, error: true}); 
				    }
				    else if(cell.isBoolean())
				    {
				    	var value = cell.getCalculatedValue();
				    	sortRows[i].push({value: !!value, index: j}); 
				    }
				    else
				    {
				        var rawValue = cell.getRawValue();
	                    var value = null;
	                    if( typeof rawValue == "string" && rawValue.length > 0 && rawValue.charAt(0) == "'")
	                        value = rawValue;
	                    else 
	                        value = cell.getCalculatedValue();
	                    
	                    if(rawValue==="")
	                        value = null;
	                    
	                    sortRows[i].push({value: value, index: j}); 
				    }
				}
				else
				{//hidden or filtered
				    invisibledRows[i].push(j);
				}
				// covered cells are not counted in sort array
				if(rowSpan > 1) 
				{
					for(var m = 1; m < rowSpan; m++)
						invisibledRows[i].push(j + m);
					j += rowSpan - 1;
					// 50146 need delete ._rowSpan after usage
					delete cell._rowSpan;
				}
				if(colSpan > 1) 
				{
//					colSpan = cell._colSpan;
					// 50146 need delete ._colSpan after usage
					delete cell._rowSpan;

				}
			}
			if(colSpan > 1) {
				for(var m = 1; m < colSpan; m++)
					sortRows[i + m] = [];
				i += colSpan - 1;
			}
		}
		return ret;
	},

	
	_postFunc: function(editor)
	{
		this._sortDlg.okBtn.setAttribute("disabled",false);
		this._sortDlg.cancelBtn.setAttribute("disabled",false);
		this._sortDlg.postOnOk(editor, this);
	},
	
	_doCalc: function (editor, criterion) {
		var func = dojo.hitch(this, "_postFunc", editor);
		var tm = editor.getTaskMan();
		var calculateRange = this._rangeInfo;
		if (criterion) {
			calculateRange = this._slimmingSortRange(this._rangeInfo, criterion.rules);
		}
		tm.addTask(editor.getInstanseOfPCM(), "start", [calculateRange, func], tm.Priority.UserOperation);
		tm.start();
	},
	
	_slimmingSortRange: function (rangeInfo, rules, reviseRules) {
		var range = dojo.clone(rangeInfo);
		var isSameMerge = websheet.Utils.isSameMergeRange(range);
		if (!isSameMerge || isSameMerge.colSpan > 1 || isSameMerge.rowSpan > 1) {
			return range;
		}
		var min = max = -1;
		dojo.forEach(rules, function (rule) {
			var byIdx = rule.sortByIdx;
			if (min == -1) {
				min = byIdx;
			} else if (byIdx < min) {
				min = byIdx;
			}
			if (max == -1) {
				max = byIdx;
			} else if (byIdx > max) {
				max = byIdx;
			}
		});
		var delta = 0;
		if (min > 0) {
			range.startCol = range.startCol + min;
			delta = min;
		}
		if (max > 0) {
			range.endCol = range.startCol + max;
		}
		if (reviseRules) {
			if (range.startCol < range.endCol && delta > 0) {
				dojo.forEach(rules, function (rule) {
					rule.sortByIdx = rule.sortByIdx - delta;
				});
				return range;
			}
		}
		return rangeInfo;
	},
	
	/*
	 * Returns:
	 * 1: sort is completed
	 * -1: error happened
	 * -2: set range part of sorting is executed async, but sort results are completed
	 * -3: sorting can't be done for merge cells haven't same size
	 */	
	applyRangeSort: function (sortData,userId, mode) {
		var ret = 0;
		var sortResults = null;
		var cri = dojo.clone(sortData.criterion);
		var scene = this.editor.scene;
		if (cri != null) {
			//need sort the data, get the sort results first
		    var sortCols = {};
			var invisibledRows = [];
			var sortRows = [];
			
			var expandInfo;
			if (cri.isExtend) {
				expandInfo = websheet.Utils.getExpandRangeInfo(this._rangeInfo);
			} else {
				var slimSortRange = this._slimmingSortRange(this._rangeInfo, cri.rules, true);
				expandInfo = websheet.Utils.getExpandRangeInfo(slimSortRange);
				// for normal range/column sort, we check this, but for filter sort, we do not.
				if (!cri.isExtend && (expandInfo.startCol < slimSortRange.startCol || expandInfo.endCol > slimSortRange.endCol)) {
					return -3;
				}
			}
			
			var isSortable = websheet.Utils.isSameMergeRange(websheet.Utils.getExpandRangeInfo(this._rangeInfo));
			
			if (!isSortable) {
				if (cri.withHeader) {
					var headerRange = dojo.clone(this._rangeInfo);
					headerRange.endRow = headerRange.startRow;
					var exHeaderRange = websheet.Utils.getExpandRangeInfo(headerRange);
					var isHeaderSameSize = websheet.Utils.isSameMergeRange(exHeaderRange);
					if (!isHeaderSameSize) {
						return -3;
					}
					var dataRange = dojo.clone(this._rangeInfo);
					dataRange.startRow = exHeaderRange.endRow + 1;
					var exDataRange = websheet.Utils.getExpandRangeInfo(dataRange);
					var isDataSameSize = websheet.Utils.isSameMergeRange(dataRange);
					if (!isDataSameSize) {
						return -3;
					}
					isSortable = isDataSameSize;
					
					this._rangeInfo.startRow = exDataRange.startRow;
					sortData.criterion.withHeader = cri.withHeader = false;
					var modifiedAddress = websheet.Helper.getAddressByIndex(exDataRange.sheetName, exDataRange.startRow,
							exDataRange.startCol, null, exDataRange.endRow, exDataRange.endCol);
					var parsedRef = websheet.Helper.parseRef(modifiedAddress);
					this._range = new websheet.parse.Reference(parsedRef, "dummyId");
					expandInfo = exDataRange;
				} else {
					return -3;
				}
			}
			
			this.sortStructure = isSortable;
			
			this._getSortDataValue(sortRows, invisibledRows, expandInfo);
			
			sortCols.sortRows = sortRows;
			sortCols.lockedRows = invisibledRows;
			
			if (sortRows == null || sortRows.length == 0)
			{
				sortResults = null;
			}
			else
			{
				sortResults = this._sorter.sort(sortCols, cri);
			}

            sortData.sortresults = sortResults;
            sortData.invisibleRows = invisibledRows;
		}
	
		if (sortData.sortresults)
		{ 	
			//has result already.
		    //Refine end row. Because if the bottom of the range has no data, the rows will not take part in sort.
		    this._rangeInfo.endRow = this._rangeInfo.startRow + sortData.sortresults.length - 1;
		    if(cri != null && cri.isExtend)
		    {
		        this._rangeInfo.startCol = 1;
		        this._rangeInfo.endCol = this.Constant.MaxColumnIndex;
		    }
		    ret = this._setSortRange(sortData, userId);
		}
		return ret;
	},
	
	sendSortRangeMsg: function(sortData, async)
	{
	    var sortResults = sortData.sortresults;
		var sheetName = this._rangeInfo.sheetName;
		var startRowIndex = this._rangeInfo.startRow;
		var endRowIndex = this._rangeInfo.endRow;
		var startColName = websheet.Helper.getColChar(this._rangeInfo.startCol);
    	var endColName = websheet.Helper.getColChar(this._rangeInfo.endCol);
    	
    	var refValue = websheet.Helper.getAddressByIndex(sheetName, startRowIndex, startColName,null,endRowIndex,endColName);
		var attrs = {};
		
		/*attrs contains: 1. criterion 2. results
		 * 1. sortcriterion  [It's content need be redefined]
		 * Sending: {sortheader:, sortorder:, sortcols:, sortcase:, sortcompareway:,}
		 * Using on Client: {withHeader:, isAscend:, sortById:, comparators:,}
		 * 2. sortresults [rangeRowIndex1, rangeRowIndex2...]
		 * Be attention!
		 * For the server doesn't have the calc engine, so now sort criterion is not send to 
		 * server, only sort results is send to server to apply the sort event  
		 */
		attrs.sortresults = sortResults;
		if(sortData.invisibleRows && sortData.invisibleRows.length>0)
		    attrs.invisibleRows = sortData.invisibleRows[0];
		var event = new websheet.event.SortRange(refValue, attrs);
		var revSortResults = [];
		for(var i = 0; i < sortResults.length; i++)
		{
		    var t = sortResults[i];
		    revSortResults[t] = i;
		}
			
		var revAttrs = {sortresults:revSortResults};
		var reverse = new websheet.event.Reverse(event, refValue, revAttrs, this._oriFormulaCellsValue);
		this.editor.sendMessage(event, reverse, null, async);
	},
	
	/*
	 * Returns:
	 * 1: sort is completed
	 * -1: error happened
	 */
    
	_setSortRange: function(sortData, userId)
    {
    	var sheetName = this._rangeInfo.sheetName;
    	var sheetModel = this.doc.getSheet(sheetName);
		var sheetId = sheetModel.getId();
		
		var startRowIndex = this._rangeInfo.startRow;
		var endRowIndex = this._rangeInfo.endRow;
		var startColIndex = this._rangeInfo.startCol;
		var endColIndex = this._rangeInfo.endCol;
		
		var modelHelper = this.ModelHelper;

		try{
			// cut the repeating rows if exist..
			modelHelper.splitRow(sheetModel, startRowIndex, this.Constant.Position.PREVIOUS);
			modelHelper.splitRow(sheetModel, endRowIndex, this.Constant.Position.NEXT);
			
			// OT, the sort result is not continues with repeat number in row models.
			var arrRows = sheetModel._rows;
			var firstIndex = sheetModel.getRowPosition(startRowIndex);
			if(firstIndex < 0)
				firstIndex = -(firstIndex + 1);
			
			var rowIndex;
			var rowModel = arrRows[firstIndex];
			if (rowModel)
				rowIndex = rowModel.getIndex();
			
			while (rowModel && rowIndex <= endRowIndex) {
				if (rowModel._repeatedNum > 0) {
					modelHelper.splitRowByArrayIndex(sheetModel, firstIndex, rowIndex + 1);
				}
				firstIndex++;
				rowModel = arrRows[firstIndex];
				if(rowModel)
					rowIndex = rowModel.getIndex();
			}
			
			var oldFormulas = this._sort(this._rangeInfo, sortData);
			
			var tm = this.editor.getTaskMan();
			var priority = tm.Priority.UserOperation;
			
			var args = [oldFormulas, sheetModel, startRowIndex, endRowIndex, startColIndex, endColIndex];
			if(tm.isRunning(priority))
			{
		  		tm.addTask(this, "_postSort", args, priority);
		  		var lastTask = tm.addTask(this, "_notifySort", args, priority);
		  		
		  		var isBigMessage = oldFormulas && oldFormulas.length > 1000;
		  		
		  		var callback = dojo.hitch(this, function(){this._onSetSortRangeDone(sortData, isBigMessage);});
		  		var errback = dojo.hitch(this, this._onSetSortRangeError);
		  		
				lastTask.addCallback(callback);
				lastTask.addErrback(errback);
		
		  		tm.start();
		  		
		  		return -2;
			}
			else
			{
				this._postSort.apply(this, args);
				this._notifySort.apply(this, args);
				this._onSetSortRangeDone(sortData);
				return 1;
			}
		}
		catch(e)
		{
			this.editor.scene.hideErrorMessage();
			return -1;
		}
    },
    
	_onSetSortRangeError: function(error) {
		this.editor.scene.hideErrorMessage();
		if (this._sortDlg)
		{
			this._sortDlg.setWarningMsg(this._sortDlg.STR_SORT_CONFLICT_DEL_SHEET);
		}
		// return false to terminate setRange chain
		return false;
	},
	
	_onSetSortRangeDone: function(sortData, async) {
		this._moveCommentsOnSortingRange(sortData);
		
		if (this._bLocal)
		{
			this.sendSortRangeMsg(sortData, async);
			if (this._sortDlg)
			{
				this._sortDlg.hide();
			}
		}
		
		this.editor.scene.hideErrorMessage();
		this.editor.focus2Grid(false);
	},
	
    _postSort: function(oldFormulas, sheetModel, startRowIndex, endRowIndex, startColIndex, endColIndex)
    {
    	// store old formulas
  		if(oldFormulas)
		{
			dojo.forEach(oldFormulas, dojo.hitch(this, function(of){
				this._storeFormulaCellValue(of[0], of[1], of[2], of[3]);
			}));
		}

  		// merge rows if needed.
  		this.ModelHelper.mergeRow(sheetModel, startRowIndex, this.Constant.Position.PREVIOUS);
  		this.ModelHelper.mergeRow(sheetModel, endRowIndex, this.Constant.Position.NEXT);
  		
  		this._postSortUpdateGridUI(sheetModel, startRowIndex, endRowIndex);
    },
    
    _postSortUpdateGridUI: function(sheetModel, startRowIndex, endRowIndex)
    {
    	var controller = this.editor.getController();
    	var sheetName = sheetModel.getSheetName();
    	var grid = controller.getGrid(sheetName);
		var sr = startRowIndex - 1;
		var er = endRowIndex - 1;
		grid.updateRows(sr, er);
    },
    
    _notifySort: function(oldFormulas, sheetModel, startRowIndex, endRowIndex, startColIndex, endColIndex){
    	var controller = this.editor.getController();
    	var sheetName = sheetModel.getSheetName();
		// notify calculate
    	var params = {refMask: websheet.Constant.RANGE_MASK};
		var refValue = websheet.Helper.getAddressByIndex(sheetName, startRowIndex, startColIndex, null, endRowIndex, endColIndex, params);
		var partialManager = this.ModelHelper.getPartialManager();
		var criteria = partialManager.getPartialCriteria(sheetModel.getId());
		if(criteria)//the sheet is not completely load, set sheet dirty
			sheetModel.setDirty(true);
		controller.sendNotify4SetRange(refValue);
    },
    
	_getSortChangeMap: function(startRowIndex, sortData)
	{
		var offset = startRowIndex - 1;
		var sortResults = sortData.sortresults;
		var map = {};
		for(var i = 0; i < sortResults.length; i++)
		{
			var oldIndex = sortResults[i] + offset;
			var newIndex = i + offset;
			if (oldIndex != newIndex)
				map[oldIndex + ""] = newIndex;
		}
		return map;
	},
	
	_exchangeCells: function(sheet, newRow, newCells, oldPreservedCells, startColIndex, endColIndex)
	{
		if((newCells == null || newCells.length == 0) && (oldPreservedCells == null || oldPreservedCells.length == 0))
			return;
		var sheetId = sheet.getId();
		// delete cells first
		var pos = this.ModelHelper.binarySearch(newCells,startColIndex,this.ModelHelper.equalCondition,"",false,sheetId, this.Constant.Column);
		if (pos <= -1) {
			pos = -(pos + 1); 
		}
		var originalPos = pos;
		if(newCells.length >= pos + 1)
		{
			var headerCell = newCells[pos];
			while(headerCell)
			{
				var colIndex = headerCell.getCol();
				if (colIndex >= startColIndex && colIndex <= endColIndex)
				{
					newCells.splice(pos, 1);
					headerCell = newCells[pos];
				}
				else if(colIndex <= endColIndex)
				{
					headerCell = newCells[++pos];
				}
				else
					headerCell = null;
			}				
		}
		if(oldPreservedCells && oldPreservedCells.length > 0)
		{
			var oldPos = this.ModelHelper.binarySearch(oldPreservedCells,startColIndex,this.ModelHelper.equalCondition,"",false,sheetId, this.Constant.Column);
			if (oldPos <= -1) {
				oldPos = -(oldPos + 1); 
			}
			var oldCells = [];
			if(oldPreservedCells.length >= oldPos + 1)
			{
				var headerCell = oldPreservedCells[oldPos];
				while(headerCell)
				{
					var colIndex = headerCell.getCol();
					if (colIndex >= startColIndex && colIndex <= endColIndex)
					{
						headerCell._parent = newRow;
						oldCells.push(headerCell);
						headerCell = oldPreservedCells[++oldPos];
					}
					else if(colIndex <= endColIndex)
					{
						headerCell = oldPreservedCells[++oldPos];
					}
					else
						headerCell = null;
				}				
			}
			
			if(oldCells.length > 0)
				Array.prototype.splice.apply(newCells, [originalPos, 0].concat(oldCells));
		}
	},
	
	_exchangeAllCells: function(rangeInfo, sortData)
	{
		// do not need to exchange cover info, because the prerequest to do exchange(sort) is that the range has the same merge cells
		// so the covered info in the range must be the same, so do not need to exchange, so does their order in the column coverinfo
		var sheetModel = this.doc.getSheet(rangeInfo.sheetName);
		var sheetId = sheetModel.getId();
		
		var rowModels = this.ModelHelper.getRows(rangeInfo, true, true).data;
		var startRowIndex = rangeInfo.startRow;
		var endRowIndex = rangeInfo.endRow;
		var startColIndex = rangeInfo.startCol;
		var endColIndex = rangeInfo.endCol;
		
		var transformCellTasks = [];
		var transformCellTask = [];
		var taskNumber = 0;
		var parsedCellTaskNumber = 0;
		var notParsedCellTaskNumber = 0;
		
		var MAX_TASK_NUMBER = this.Constant.MaxTransformCells;
		var RATE = this.Constant.MaxTransformCells / this.Constant.PartialParseCellCnt;
		
		transformCellTasks.push(transformCellTask);
		
		var rowsSwap = rangeInfo.startCol == 1 && rangeInfo.endCol == this.Constant.MaxColumnIndex;
		var changeLog = this._getSortChangeMap(startRowIndex, sortData);
		
		if(rowsSwap)
		{
			for(var i = 0; i < rowModels.length; i++)
			{
				var row = rowModels[i];
				if(row)
				{
					row._o_valueCells = row._valueCells;
					row._o_styleCells = row._styleCells;
				}
			}
		}
		else
		{
			var wspconst = this.Constant.Position;
			for(var i = 0; i < rowModels.length; i++)
			{
				var row = rowModels[i];
				
				if(!row)
					continue;

				if(startColIndex > 1)
					this.ModelHelper.splitCell(row, startColIndex, wspconst.PREVIOUS);
				
				this.ModelHelper.splitCell(row, endColIndex, wspconst.NEXT);
				
				row._o_valueCells = [];
				row._o_styleCells = [];
				
				for(var j = 0; j < row._valueCells.length; j++)
				{
					row._o_valueCells[j] = row._valueCells[j];
				}
				for(var j = 0; j < row._styleCells.length; j++)
				{
					row._o_styleCells[j] = row._styleCells[j];
				}
			}
		}
		
		for(var i = 0; i < rowModels.length; i++)
		{
			var oldIndex = i + startRowIndex - 1;
			var newIndex = changeLog[oldIndex + ""];
			var off = 0;
			
			if(newIndex !== undefined /* may be 0 */)
			{
				off = newIndex - oldIndex;
				var newRow = rowModels[newIndex - (startRowIndex - 1)];
				var oldRow = rowModels[i];
				
				if (newRow == null && oldRow == null)
					continue;
				else
				{
					if(newRow == null)
					{
						newRow = rowModels[newIndex - (startRowIndex - 1)] = sheetModel._createRow(newIndex + 1);
					}
				}
				
				// the line [i] goes to [newIndex]
				
				if(rowsSwap)
				{
					// for all columns
					newRow._valueCells = oldRow && oldRow._o_valueCells ? oldRow._o_valueCells : [];
					newRow._styleCells = oldRow && oldRow._o_styleCells ? oldRow._o_styleCells : [];
					
					dojo.forEach(newRow._valueCells, function(cell){
						if (cell && cell._parent)
						{
							cell._parent = newRow;
						}
					});
					dojo.forEach(newRow._styleCells, function(cell){
						if (cell && cell._parent)
						{
							cell._parent = newRow;
						}
					});
				}
				else
				{
					// for some columns
					for (var j = startColIndex - 1; j <= endColIndex - 1; ++j) 
					{
						newRow._valueCells[j] = null;
					}
					if(oldRow && oldRow._o_valueCells)
					{
						for (var j = startColIndex - 1; j <= endColIndex - 1; ++j)
						{
							if(oldRow._o_valueCells[j])
							{
								var cell = oldRow._o_valueCells[j];
								newRow._valueCells[j] = cell;
								newRow._valueCells[j]._parent = newRow;
							}
						}
					}
					
					this._exchangeCells(sheetModel, newRow, newRow._styleCells, oldRow ? oldRow._o_styleCells : null, startColIndex, endColIndex);
				}
			}
			else
			{
				continue;
			}
			
			var cells = newRow._valueCells;
			
			if(rowsSwap)
			{
				for (var j = 0; j < cells.length; ++j)
				{
					var cell = cells[j];
					if (cell && cell.isFormula())
					{
						var hasTarr = cell._tokenArray && cell._tokenArray.length > 0;
						hasTarr ? parsedCellTaskNumber ++ : notParsedCellTaskNumber ++;
						var taskNumber = parsedCellTaskNumber + notParsedCellTaskNumber * RATE;
						if(taskNumber >= MAX_TASK_NUMBER)
						{
							// 60000 cells for a batch
							parsedCellTaskNumber = 0;
							notParsedCellTaskNumber = 0;
							transformCellTask = [];
							transformCellTasks.push(transformCellTask);
						}
						
						if(transformCellTask)
							transformCellTask.push([cell, oldIndex + 1, off]);
					}
				}
			}
			else
			{
				for (var j = startColIndex - 1; j <= endColIndex - 1; ++j)
				{
					var cell = cells[j];
					if (cell && cell.isFormula())
					{
						var hasTarr = cell._tokenArray && cell._tokenArray.length > 0;
						hasTarr ? parsedCellTaskNumber ++ : notParsedCellTaskNumber ++;
						var taskNumber = parsedCellTaskNumber + notParsedCellTaskNumber * RATE;
						if(taskNumber >= MAX_TASK_NUMBER)
						{
							// 60000 cells for a batch
							parsedCellTaskNumber = 0;
							notParsedCellTaskNumber = 0;
							transformCellTask = [];
							transformCellTasks.push(transformCellTask);
						}

						if(transformCellTask)
							transformCellTask.push([cell, oldIndex + 1, off]);
					}
				}
			}
		}
		
		for(var i = 0; i < rowModels.length; i++)
		{
			var row = rowModels[i];
			if (row)
			{
				delete row._o_valueCells;
				delete row._o_styleCells;
			}
		}
		
		return transformCellTasks;
	},
	
	_sort: function(rangeInfo, sortData)
	{
		var oldFormulas = [];
		var transformCellTasks = this._exchangeAllCells(rangeInfo, sortData);
		
		var tm = this.editor.getTaskMan();
		var priority = tm.Priority.UserOperation;
		var sheetName = rangeInfo.sheetName;
		
		if(transformCellTasks.length == 1)
		{
			// sync
			this._transformCellFormulas(transformCellTasks[0], sheetName, oldFormulas);
		}
		else
		{
			var sceneNls = this.editor.scene.nls;
			tm.addTask(this.editor.scene, "showWarningMessage", [sceneNls.browserWorkingMsg], tm.Priority.UserOperation);
			// async
			for(var i = 0; i < transformCellTasks.length; i++)
			{
				tm.addTask(this, "_transformCellFormulas", [transformCellTasks[i], sheetName, oldFormulas], tm.Priority.UserOperation);
			}
			tm.start();
		}
		
		return oldFormulas;
	},
	
	_transformCellFormulas: function(tasks, sheetName, oldFormulas){
		dojo.forEach(tasks, dojo.hitch(this, function(task){
			
			var c = task[0];
			var oldRowIndex = task[1];
			var off = task[2];
			var value = c.getRawValue();
			var tarr = c.serializeTokenArray();
//			if(!tarr)
//				return;
			if(off !== 0)
			{
				var _c = {v: value, tarr: tarr};
				var oldTarr = tarr ? dojo.clone(tarr) : null;
				this.ModelHelper.transformFormulaValue(_c, sheetName, off, 0);
				
				if(_c.v && _c.v.indexOf("#REF") > -1)
				{
					// Only store #REF formula, we can not undo #REF back.
					var colIndex = c.getCol();
					var colName = websheet.Helper.getColChar(colIndex);
					oldFormulas.push([oldRowIndex, colName, value, oldTarr]);
				}
				
				c.setRawValue(_c.v, true);
				c.setReferences(tarr);
			}
			else
			{
				// still need to reset rawValue here, for example, SUM(A4:A6);
				c.setRawValue(value, true);
				c.setReferences(tarr);
			}
		}));
	},
	
	_storeFormulaCellValue:function(rowIndex, colName, formulaValue, formulaTokenArr){
		if(!this._oriFormulaCellsValue)
			this._oriFormulaCellsValue = {};
		var cell = {v: formulaValue, tarr: formulaTokenArr};
		var cRef = websheet.Helper.getCellAddr(this._rangeInfo.sheetName, rowIndex, colName);
		this._oriFormulaCellsValue[cRef] = cell;
	},
	
	_moveCommentsOnSortingRange: function(sortData)
	{
		this.editor.getCommentsHdl().moveComments(this._range, sortData);
	},

	_getLockCellsByOtherUsers: function(){
		var lockCells = [];
		var cC = this.editor.getCollaboratorContainer();
		if(cC && cC.collaborators){
			var i = 0;
		    for (i = 0; i < cC.collaborators.length; i++) {
		        var tmpC = cC.collaborators[i];
		        if (tmpC.lockCellRef) {
		            lockCells.push(tmpC.lockCellRef);
		        }
		    }
		}
		return lockCells;
	},
	
	checkSortRangeConflict: function(sortData, callback)
	{
		var result = false;	
		try
		{
			var sheetModel = this.doc.getSheet(this._rangeInfo.sheetName);
			var lockCells = this._getLockCellsByOtherUsers();
			if(lockCells.length > 0)
			{
				var sheetId = sheetModel.getId();
				var type = this.ModelHelper.Constant.EventType.DataChange;
				var source = {};
				source.action = this.ModelHelper.Constant.DataChange.SET;
				source.refType = this.ModelHelper.Constant.OPType.CELL;
				for (i = 0; i < lockCells.length; i++) 
				{
					//we do not care this kind of 'conflict' any more, anyway we still check the formula impact.
		        	/*if(lockCells[i].sheet == this._rangeInfo.sheetName)
		        	{
						var colIndex =  websheet.Helper.getColNum(lockCells[i].column);
						if(lockCells[i].row >= this._rangeInfo.startRow && lockCells[i].row <= this._rangeInfo.endRow
									&& colIndex >= this._rangeInfo.startCol && colIndex <= this._rangeInfo.endCol){
							result = true;
							break;			
						}
					}*/
					var lockSheet = this.doc.getSheet(lockCells[i].sheet);
					var lockSheetName = lockSheet.getSheetName();
					var refValue = lockSheetName+"!"+ lockCells[i].column + lockCells[i].row;
					if(source.refValue)
					{
						source.refValue += ",";
						source.refValue += refValue;
					}
					else
						source.refValue = refValue;
		    	}
				if(!result && source.refValue)
				{
					var e = new websheet.listener.NotifyEvent(type, source);
					var cells = this.doc.getAreaManager().getImpactCells(e);
					result = this.inRange(cells,this._range);
				}
			}	
		}catch(e){
			result = false;
		}
		if(result){
			this.editor._tmpSortRangeData = {rangeSorting:this, sortData:sortData};
			if( !this._sortRangeConflictDlg ){
				setTimeout(dojo.hitch(this, "setConflictDlg", callback), 50);
			}
		}
		return result;
	},
	
	setConflictDlg: function(callBack){
		//dojo["require"]("websheet.dialog.sortRangeConflict");
		dojo["require"]("concord.concord_sheet_widgets");
		if (!this._sortRangeConflictDlg){
			this._sortRangeConflictDlg = new websheet.dialog.sortRangeConflict(this.editor, "Sort_Range_Conflict", null, true, {callback :callBack});
		}
		var dShow = dojo.hitch(this._sortRangeConflictDlg, "show");
		setTimeout(dShow, 50);
	},
	
	inRange:function(cells, range)
	{
		if(cells && cells.length > 0)
		{
			var rangeInfo = range._getRangeInfo();
			for(var i=0; i<cells.length;i++)
			{
				var cell = cells[i];
				var rowIndex = cell.getRow();
				var colIndex = cell.getCol();
				var sheetName = cell.getSheetName();
				if(rangeInfo.sheetName==sheetName && 
				   rowIndex >= rangeInfo.startRow && rowIndex <= rangeInfo.endRow && 
				   colIndex >= rangeInfo.startCol && colIndex <= rangeInfo.endCol)
				{
				    return true;
				}
			}			
		}
		return false;
	}	
});