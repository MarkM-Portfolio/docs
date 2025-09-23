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

dojo.provide("websheet.grid.SelectionManager");
dojo.require("websheet.widget._SelectRectangle");
dojo.require("websheet.widget._MobileSelectRectangle");
dojo.require("concord.util.browser");
dojo.requireLocalization("websheet","base");
dojo.declare("websheet.grid.SelectionManager", null, {
	// summary:
	//		Manage selections on grid.
	
	mode				:		'single',	//selection mode, 'single' or 'multiple'
	grid				:		null,		//data grid
	controller			:		null,		//controller
	_selections			:		null,		//array of selections,
	
	_selector			:		null,		//the last selection rectangle, mostly we are working on it.
	_activeSelector		:		null,
	_picker				:		null,
	
	constructor: function(grid)
	{
		this.grid = grid;
		this._selections = [];
		this.controller = this.grid.editor.getController();
		this.maxRow = this.grid.editor.getMaxRow();
		this._subscriptions = [
               dojo.subscribe("RangePickingStart", dojo.hitch(this, 'rangePickingStart')),
               dojo.subscribe("RangePickingComplete", dojo.hitch(this, "rangePickingComplete"))];
	},
	
	/*Object*/activeSelector: function () {
		// summary:
		//		An active selector is the selector in which focus cell located
		return (this._activeSelector || this.selector());
	},
	
	deselect: function()
	{
		// summary:
		//TODO, 
	},
	
	doCellFocus: function(row, col, bSelectCell, bSync) {
		// summary:
		//		Focus to the given cell, notice that 'selecting a cell' is different with 'focus to a cell'.
		//		Selecting a cell will change the selection type of the selector, while focus to a cell won't.
		// bSelectCell: boolean
		//		Indicates if it's a selecting cell operation.
		var 
			self = this,
			grid = this.grid;
		
		if (!bSync && grid._scrollingTimer) {
			return;
		} else {
			if (bSync) {
				this._focusCell(row, col, bSelectCell);
			} else {
				self._scrollingTimer = setTimeout(function () {
					self._scrollingTimer = null;
					self._focusCell(row, col, bSelectCell);
				}, 10);
			}
		}
	},
	
	getFocusedCell: function () {
		// summary:
		// 		Return the focused row & col of the selector;
		// Notice:
		//		The row index must be the master index if there're any merge on the focused cell;
		//		(The internal focusRow, focusCol may point to a covered cell, we need to keep track of the covered index for focus navigation);
		// Return row is 0-based index;
		// Returns {focusRow : focusedRow, focusCol : focusedCol};
		var selector = (this._activeSelector || this.selector());
		var focusCol = selector.focusCol;
		var focusRow = selector.focusRow;
		var merge = this.grid.cellMergeInfo(focusRow, focusCol);
		if (merge && merge.isCovered) {
			focusCol = merge.masterCol;
			focusRow = merge.masterRow != null ? merge.masterRow : focusRow; // transform to 0-based grid index;
		}
		return {focusRow : focusRow, focusCol : focusCol};
	},
	
	getFocusedRow: function () {
		// summary:
		// 		Return the focused row of the selector;
		// Notice:
		//		The row index must be the master index if there're any merge on the focused cell;
		//		(The internal focusRow, focusCol may point to a covered cell, we need to keep track of the covered index for focus navigation);
		// Return row is 0-based index;
		return this.getFocusedCell().focusRow;
	},
	
	getFocusedCol: function () {
		// summary:
		// 		Return the focused row of the selector;
		// Notice:
		//		The row index must be the master index if there're any merge on the  focused cell;
		return this.getFocusedCell().focusCol;
	},
	
	/*Number*/getSelectedCount: function()
	{
		// summary:
		//		Return how many selections there're.
		return this._selections.length;
	},
	
	/*Array*/getSelectedRanges: function(bExpended)
	{
		// summary:
		//		Return all the selected selections' 'rangeInfo', refer to getRangeInfo in "websheet/widget/_Rectangle" for more details.
		// bExpended:
		//		boolean, if the ranges should be expended;
		var ranges = [];
		this._selections.forEach(function(item){
			ranges.push(bExpended ? item.getExpandedRangeInfo() : item.getRangeInfo());
		});
		return ranges;
	},
	
	/*Self*/hibernate: function()
	{
		// summary:
		//		Make all the selectors to hibernate, it may happen when the grid is hidden or something.
		// returns:
		//		Self.
		this._selections.forEach(function(item){
			item.hibernate();
		});
		return this;
	},
	
	/*Self*/hideSelectors: function () {
		// summary:
		//		Hide all the selectors;
		this._selections.forEach(function(item) {
			item.hibernate();
			item.hide();
		});
		return this;
	},
	
	/*void*/initialFocus: function () {
		// summary:
		//		Initial focus, document loaded and the grid is selected the first time.
		//		Find the first visible row and the first visible column to focus.
		if (this.getFocusedRow() < 0 || this.getFocusedCol() < 0) {
			var 
				range = {
					startRow: 1,
					endRow: 1048576,
					startCol: 1,
					endCol: 1024,
					sheetName: this.grid.sheetName
				},
			iter = new websheet.model.RangeIterator(range, websheet.Constant.RangeIterType.EXTENDRENDER);
			var targetRow, targetCol;
			iter.iterate(function(obj , row, col) {
				targetRow = row;
				targetCol = col;
				return false;
			});
			this.selector().selectCell(targetRow - 1, targetCol, true);
		}
	},
	
	/*void*/inSelectedRange: function (row, col) {
		// summary:
		//		Judge if the given cell index is in selected range;
		// row: Number, 0-based
		//		Optional
		// col: Number, 1-based
		// Example:
		//		|		grid.selection.inSelectedRange( null, col);
		//		|		// is col in selected columns ?
		//		|		grid.selection.inSelectedRange( row, null);
		//		|		// is row in selected rows ?
		//		|		grid.selection.inSelectedRange(row, col);
		//		|		// is row & col (cell) in selected ranges ?
		var selects = this.getSelectedRanges();
		return dojo.some(selects, function (range) {
			var sr = range.startRow, er = range.endRow;
			var sc = range.startCol, ec = range.endCol;
			var rowInRange = false;
			var colInRange = false;
			if (row != null) {
				row++;//change to 1-based
				rowInRange = (sr <= row && er >= row);
			}
			if (col != null) {
				colInRange = (sc <= col && ec >= col);
			}
			if (row == null && colInRange) {
				return true;
			}
			if (col == null && rowInRange) {
				return true;
			}
			if (rowInRange && colInRange) {
				return true;
			}
		});
	},
	
	/*Boolean*/isSelectingRange: function () 
	{
		// summary:
		//		Return if it's currently selecting range with selector.
		return (this._selector ? this._selector.isSelecting() : false);
	},
	
	/*Boolean*/isPickingRange: function()
	{
		// summary:
		//		Return if it's currently picking range with RangePicker.
		// returns:
		//		boolean
		return (this._picker ? this._picker.picking() : false);
	},
	
	/*Object*/multipleMode: function()
	{
		// summary:
		//		Switch selection mode to 'multiple mode', return self to make chained function calls.
		// example:
		//	|	//update the last selected rectangle to select B2:D4
		//	|	selectionMgr.multipleMode().select().selectRange(1, 2, 3, 4);
		//	|	//select a new rectangle and add it to current selections
		//	|	selectionMgr.multipleMode().select('add').selectRange(1, 2, 3, 4);
		return (this.mode = 'multiple') && this;
	},
	
	moveRangePicker: function (e, bTimeout) {
		//Summary:
		//	Move the range picker according to arrowKeyCode based on the selected cell(s) of range picker
		//	It can handle:
		//		arrow key move to pick a cell
		//		shift + arrow key move to pick a range,
		//		ctrl + space to pick a column range accroding to current RangePicker range.
		//		shift + space for row range selection.
		//	Return isMoved, representing if the keyboard in "e" is handled properly in this logic.
		//	Should set timeout to move the range if call this from Grid's key event handler
		var arrowKeyCode = e.keyCode || e.charCode;//In some browser, keyCode is 0 for ctrl + space, use charCode " " then
		var isMoved = rangeSelection = false;
		//we only expect arrow keys, page up, page down, and ctrl/shift + space.
		if (e.keyChar && arrowKeyCode != dojo.keys.SPACE) {
			return isMoved;
		}
		var selector = this.activeSelector();
		var picker = this.picker();
		if (selector.isSelecting() || selector.isAutofilling()) {
			return isMoved;//moving range picker with mouse, disable keyboard movement
		}
		var grid = this.grid;
		var controller = grid.editor.getController();
		var sheet = grid.editor.getDocumentObj().getSheet(grid.sheetName);
		var sc = grid.scroller;
		var highlight = controller.getHighlightProvider().getLastViewer();
		var rowIndex = colIndex = -1;
		var cols = grid.geometry._widthArray, colMax = cols.length;
		if (picker.isShow() || (highlight && highlight.isShow())) {
			if (e.shiftKey) {
				rowIndex = picker._endRowIndex;
				colIndex = Math.min(picker._endColIndex, colMax - 1);
			} else {
				rowIndex = picker._startRowIndex;
				colIndex = Math.min(picker._startColIndex, colMax - 1);
			}
		}
		//Just starting to show the range, begin with the selected cell.
		if(rowIndex == -1 || colIndex == -1)
		{
			if (selector && selector._startRowIndex >= 0) {
				picker._startRowIndex = picker._endRowIndex = rowIndex = selector._startRowIndex;
				picker._startColIndex = picker._endColIndex = colIndex = selector._startColIndex;
			} else if(grid.getInlineEditor().isCrossSheetEditing()) {
				picker._startRowIndex = picker._endRowIndex = rowIndex = grid.getFirstVisibleRow();
				picker._startColIndex = picker._endColIndex = colIndex = grid.getFirstVisibleColumn();
			}
		}
		//don't know where to start
		if (rowIndex < 0 || colIndex < 0) {
			return false;
		}
		picker.start();
		var nRange = websheet.Utils.getExpandRangeInfo(picker.getRangeInfo());
		var curRowIndex = rowIndex, bLeft = bDown = null;

		switch (arrowKeyCode){
		case dojo.keys.LEFT_ARROW:
		case dojo.keys.RIGHT_ARROW:
			bLeft = arrowKeyCode == dojo.keys.LEFT_ARROW;
			if (grid.isMirrored)
				bLeft = !bLeft;
			var bEnlarge = false;
			var rModel= sheet.getRow(rowIndex + 1, true);
			if (bLeft) {
				//moving left;
				//Pick a cell;
				if (!e.shiftKey) {
					var result = this._nextColumn(colIndex, 1, colMax, -1, rowIndex + 1, rModel, {sheet: sheet});
					colIndex = result;
				} else if (picker._endColIndex >= picker._startColIndex) {
					//Pick a range, moving left, decrease range area;
					colIndex = Math.min(nRange.endCol, colMax -1);
					for (var _row = nRange.startRow, _merge = null; _row <= nRange.endRow; _row++) {
						_merge = grid.cellMergeInfo(_row - 1, colIndex);
						if (_merge && _merge.isCovered) {
							//so it's a merged cell.
							var colIndex = _merge.masterCol;
							if (colIndex < nRange.startCol) {
								bEnlarge = true; 
								break;
							} else {
								_row = nRange.startRow - 1;
								continue;
							}
						}
					}
					if (colIndex == nRange.endCol) {
						colIndex -= 1;
					}
					colIndex = grid.searchVisibleCol(colIndex, true);
				}
				if (bEnlarge || picker._endColIndex < picker._startColIndex) {
					// moving left, increase range area;
					colIndex = grid.searchVisibleCol(Math.max(nRange.startCol - 1, 1), true);
				}
			} else {
				//moving right;
				if (!e.shiftKey) {
					var result = this._nextColumn(colIndex, 1, colMax, 1, rowIndex + 1, rModel, {sheet: sheet});
					colIndex = grid.searchVisibleCol(result);
				} else if (picker._endColIndex < picker._startColIndex) {
					colIndex = nRange.startCol;
					for (var _row = nRange.startRow, _merge = null; _row <= nRange.endRow; _row++) {
						_merge = grid.cellMergeInfo(_row - 1, colIndex);
						if (_merge && _merge.isCovered) {
							//a merge cell
							colIndex = _merge.masterCol;
							if (colIndex > nRange.endCol) {
								bEnlarge = true; break;
							} else {
								_row = nRange.startRow - 1;
								continue;
							}
						}
					}
					if (colIndex == nRange.startCol) {
						colIndex += 1;
					}
					colIndex = grid.searchVisibleCol(colIndex);
				} 
				if (picker._endColIndex > colMax - 1) {
					return isMoved;
				}
				if (bEnlarge || picker._endColIndex >= picker._startColIndex) {
					colIndex = Math.min(nRange.endCol + 1, colMax - 1);
					colIndex = grid.searchVisibleCol(colIndex);
				}
			}
			isMoved = true;
			if (!e.shiftKey && colIndex < 1) {
				colIndex = 1;
				colIndex = grid.searchVisibleCol(colIndex);
			}
			if (!e.shiftKey && colIndex >= colMax) {
				colIndex = colMax - 1;
				colIndex = grid.searchVisibleCol(colIndex, true);
			}
			break;
		case dojo.keys.UP_ARROW:
		case dojo.keys.DOWN_ARROW:
			bDown = (arrowKeyCode == dojo.keys.DOWN_ARROW);
			
			if (!e.shiftKey) {
				picker._selectType = websheet.Constant.Cell;
			} else if(picker.selectingColumns()) {
				//Do not move range picker when shift up/down while current selection type is column/column range.
				return isMoved = true;
			}
			if (bDown) {
				rowIndex = (rowIndex < this.maxRow)? (rowIndex) : this.maxRow - 1;
			}
			var moved = this._nextVisibleRow(rowIndex + 1, 1, this.maxRow, bDown ? 1 : -1, sheet, {});
			rowIndex = Math.min(moved.index - 1, this.maxRow - 1);
			//The movement has found it's edge so just stay there.
			if(!e.shiftKey && (rowIndex < 0 || rowIndex >= this.maxRow))
			{
				rowIndex = picker._startRowIndex;
			}
			//check the cell node, should expand to master cell if it's a covered one
			var _merge = grid.cellMergeInfo(rowIndex - 1, colIndex);
			if (_merge && _merge.isCovered) {
				colIndex = _merge.masterCol;
			}
			isMoved = true;
			break;
		case dojo.keys.PAGE_UP:
			if (e.ctrlKey || e.metaKey) {
				return isMoved;
			}
			if (rowIndex !== 0) {
				rowIndex = sc.firstVisibleRow - sc.lastVisibleRow + rowIndex;
				if ((curRowIndex >= sc.firstVisibleRow) && (curRowIndex <= sc.lastVisibleRow) ){
					var moveCount = sc.firstVisibleRow - (sc.lastVisibleRow - sc.firstVisibleRow);
					if (moveCount < 0) {
						moveCount = 0;
					}
					sc.scrollToRow(moveCount);
				} else {
					sc.scrollToRow(rowIndex);
				}
				isMoved = true;
			}
			break;
			break;
		case dojo.keys.PAGE_DOWN:
			if (e.ctrlKey || e.metaKey) {
				return isMoved;
			}
			if (rowIndex + 1 != sc.rowCount) {
				rowIndex = Math.min(sc.lastVisibleRow - sc.firstVisibleRow + rowIndex + 1,this.maxRow - 1);
				if( (curRowIndex >= sc.firstVisibleRow) && (curRowIndex <= sc.lastVisibleRow) ){
					sc.scrollToRow(sc.lastVisibleRow + 1);
				} else {
					sc.scrollToRow(rowIndex);
				}
				isMoved = true;
			}
			break;
			break;
		case dojo.keys.SPACE:
			if (e.shiftKey) {//select row range
				picker.selectRow(picker._startRowIndex, rowIndex, null, true);
				colIndex = picker._endColIndex;
				rangeSelection = isMoved = true;
			} else if(e.ctrlKey || e.metaKey) {//select column range
				picker.selectColumn(picker._startColIndex, colIndex = picker._endColIndex, null, true);
				rowIndex = picker._endRowIndex;
				rangeSelection = isMoved = true;
			}
			break;
		}
		if (isMoved && rowIndex > -1 && colIndex > 0) {
			//scroll column into view when move range picker via keyboard.
			if (bLeft != null) {
				if (colIndex < sc.firstVisibleCol && colIndex > grid.freezeCol){
					sc.scrollToColumn(colIndex);
				} else if (colIndex >= sc.lastVisibleCol - 1) {
					sc.scrollToColumn(grid.geometry.getFirstColumnWithLastColumn(colIndex, grid.geometry.getScrollableWidth(), true));
				}
			}
			//scroll row into view when necessary
			if (bDown != null || (!e.shiftKey && bLeft != null)) {
				if (rowIndex < sc.firstVisibleRow) {
					sc.scrollToRow(rowIndex);
				}
				if (rowIndex >= sc.lastVisibleRow - 1) {
					grid.scrollByDirection(websheet.Constant.DIRECTION.DOWN);
				}
			}
			if (e.shiftKey || rangeSelection) {
				picker.selectRange(null, null, rowIndex, colIndex);
			} else {
				picker.selectCell(rowIndex, colIndex);
			}
			if ((bTimeout && !e.shiftKey)) {
				picker.render();
			} else {
				switch(picker.selectType)
				{
					case websheet.Constant.Column:
					case websheet.Constant.ColumnRange:
						picker.selectColumn(picker._startColIndex, colIndex);
						break;
					case websheet.Constant.Row:
					case websheet.Constant.RowRange:
						picker.selectRow(picker._startRowIndex, rowIndex);
						break;
					default:
						break;
				}
			}
		}
		picker.complete();
		return isMoved;
	},
	
	moveFocus: function (dirCode, e) {
		// summary:
		//		internally deals with moving focus operations.
		// dir:
		//		direction, use constants defined in dojo.keys, include up/down/right/left arrow
		// e:
		//		key event
		var grid = this.grid,
			selector = this.selector(),
			row = selector.focusRow? selector.focusRow + 1 : 1,
			col = (selector.focusCol || 1),
			doc = grid.editor.getDocumentObj(),
			sheet = doc.getSheet(grid.sheetName),
			DIRECTION = websheet.Constant.DIRECTION, 
			dk = dojo.keys,
			dir, rangeInfo;
			
		switch(dirCode){
			case dk.LEFT_ARROW:
				if (grid.isMirrored) {
					dir = DIRECTION.RIGHT;
				} else
					dir = DIRECTION.LEFT;
				break;
			case dk.RIGHT_ARROW:
				if (grid.isMirrored) {
					dir = DIRECTION.LEFT;	
				} else
					dir = DIRECTION.RIGHT;
				break;
			case dk.UP_ARROW:
				dir = DIRECTION.UP;
				break;
			case dk.DOWN_ARROW:
				dir = DIRECTION.DOWN;
				break;
		}
			
		var params = {skipCoveredCell: false, bContentCell: false, bMoveBack: false, sheet: sheet};
		
		if (this.grid.isCtrlPressed(e)) {
			params.bContentCell = true;
		}
		if (dir == DIRECTION.RIGHT || dir == DIRECTION.LEFT) {
			//moving right/left, first column then row.
			// navigate in the focus row
			rangeInfo = {
					sheetName: grid.sheetName,
					startRow: row,
					endRow: row,
					startCol: 1,
					endCol: websheet.Constant.MaxColumnIndex
					};
				
			params.bNext = (dir == DIRECTION.RIGHT);
			result = this._moveHorizontal(rangeInfo, row, col, params);
		} else {
			//moving up/down, first row then column
			// navigate in the focus col
			rangeInfo = {
				sheetName: grid.sheetName,
				startRow: 1,
				endRow: this.maxRow,
				startCol: col,
				endCol: col
				};
			params.bNext = (dir == DIRECTION.DOWN);
			result = this._moveVertical(rangeInfo, row, col, params);
		}
		var rowMoveTo = result.row - 1;
		var colMoveTo = result.col;
		var merge = this.grid.cellMergeInfo(rowMoveTo, colMoveTo);
		if (merge) {
			// if the target row/column is covered just stay still;
			if (dir == DIRECTION.DOWN && merge.masterCol == col && merge.masterRow + merge.rowSpan - 1> rowMoveTo) {
				rowMoveTo = merge.masterRow;
//				return;
			}
			if (dir == DIRECTION.UP && merge.masterCol == col && merge.masterRow < rowMoveTo) {
				rowMoveTo = merge.masterRow;	
//				return;
			}
			if (dir == DIRECTION.LEFT && merge.masterRow == rowMoveTo && merge.masterCol < colMoveTo) {
				colMoveTo = merge.masterCol;
//				return;
			}
			if (dir == DIRECTION.RIGHT && merge.masterRow == rowMoveTo && merge.masterCol + merge.colSpan - 1 > colMoveTo && colMoveTo > merge.masterCol) {
				colMoveTo = merge.masterCol;
//				return;
			}
		}
		var signal = dojo.aspect.after(this, "_focusCell", function() {
			signal.remove();
			dojo.publish("UserSelection",[{selector: selector}]);
		});
		this.doCellFocus(rowMoveTo, colMoveTo, true);
	},
	
	navigate: function (dir, tabNavigation) {
		// summary:
		//		Move around hot cell within all the selections.
		// directions:		
		//		Move direction, 'up', 'down', 'left', 'right'
		// tabNavigation: boolean
		//		The Tab and Enter have different behavior when navigate on 'locked cell'.
		//		So add this flag to distinguish them.
		var grid = this.grid,
			selector = this.selector(),
			row = selector.focusRow? selector.focusRow + 1 : 1,
			col = (selector.focusCol || 1),
			doc = grid.editor.getDocumentObj(),
			sheet = doc.getSheet(grid.sheetName),
			DIRECTION = websheet.Constant.DIRECTION,
			rangeInfo, result,
			wrapNavigation = true,
			bSkipCoveredCell = true;
		if(selector.selectingCell()){
			if(tabNavigation){
				// navigate in the focus row
				rangeInfo = {
						sheetName: grid.sheetName,
						startRow: row,
						endRow: row,
						startCol: 1,
						endCol: websheet.Constant.MaxColumnIndex
				};
			} else {
				// navigate in the focus col
				rangeInfo = {
						sheetName: grid.sheetName,
						startRow: 1,
						endRow: this.maxRow,
						startCol: col,
						endCol: col
				};
			}
			bSkipCoveredCell = false;
			wrapNavigation = false;
		} else {
			rangeInfo = selector.getRangeInfo();
		}
		if (wrapNavigation) {
			if (grid.geometry.quickRowHeight(rangeInfo.startRow - 1, rangeInfo.endRow - 1) == 0 || grid.geometry.colWidth(rangeInfo.startCol, rangeInfo.endCol) == 0) {
				return;
			}
		}
		var params = {skipCoveredCell: bSkipCoveredCell, bContentCell: false, bMoveBack: wrapNavigation, sheet: sheet};
		
		if(sheet.isProtected() && tabNavigation){
			params.ignoreLockedCell = true;
		}
		if(dir == DIRECTION.RIGHT || dir == DIRECTION.LEFT)
		{
			//moving right/left, first column then row.
			params.bNext = (dir == DIRECTION.RIGHT);
			result = this._moveHorizontal(rangeInfo, row, col, params);
		}
		else
		{
			//moving up/down, first row then column
			params.bNext = (dir == DIRECTION.DOWN);
			result = this._moveVertical(rangeInfo, row, col, params);
		}
		var row = result.row - 1;
		var col = result.col;
		this.doCellFocus(row, col, selector.selectingCell());
		return result;
	},
	
	/*Object*/pick: function()
	{
		// summary:
		//		Give the range picker with proper initialization, the picker is a singleton, registered in data concentrator.
		if(!this._picker)
		{
			this._picker = this.controller.getRangePicker(this.grid);
		}
		this._picker.selectGrid(this.grid);
		this._selector && this._selector.sleep();
		return this._picker.wakeup();
	},
	
	/*Object*/picker: function()
	{
		// summary:
		//		Give the instantce of the range picker without any side effect, you may want to check the status yourself.
		return (this._picker && !this._picker._destroyed) ? this._picker : (this._picker = this.controller.getRangePicker(this.grid));
	},
	
	/*Void*/rangePickingStart: function (e) {
		// summary:
		//		Should hide all selectors and make them hibernate when range picker is about to enable;
		if (e == null || e.grid == null) {
			e = {grid : this.grid.editor.getCurrentGrid()};
		}
		dojo.forEach(this._selections, function (selector) {
			if (e.grid == selector.grid){
				if (selector.isShow()) {
					selector.hide();
				}
				selector.hibernate();
			}
		});
	},
	
	/*Void*/rangePickingComplete: function (e) {
		// summary:
		//		Recover the selectors;
		if (e == null || e.grid == null) {
			e = {grid : this.grid.editor.getCurrentGrid()};
		}
		dojo.forEach(this._selections, function (selector) {
			if (e.grid == selector.grid){
				selector.show().wakeup();
			}
		});
	},
	
	/*Object*/singleMode: function()
	{
		// summary:
		//		switch selection mode to 'single mode', this is the default mode, return self to make chained function calls.
		// example:
		//	|	selectionMgr.singleMode().select().selectRange(1, 2, 3, 4);
		return (this.mode = 'single') && this;
	},
	
	/*Object*/select: function()
	{
		// summary:
		//		Give a selection rectangle object that can be used to select content in data grid.
		
		//TODO, only single mode now.
		if(this._selector)
			return this._selector.wakeup();
		if(this._selections.length == 0) {
			if(pe.scene.bMobileBrowser)
				this._selector = new websheet.widget._MobileSelectRectangle({grid : this.grid});
			else
				this._selector = new websheet.widget._SelectRectangle({grid : this.grid});
			this._selections.push(this._selector);
		}
		return this._selector.wakeup();
	},
	
	/*Object*/selector: function()
	{
		// summary:
		//		Get the last selector's instance without any side effect, in case you want to see the status yourself.
		// returns:
		//		Returns may be null.
		if(!this._selector && this._selections.length == 0) {
			if(pe.scene.bMobileBrowser)
				this._selector = new websheet.widget._MobileSelectRectangle({grid : this.grid});
			else
				this._selector = new websheet.widget._SelectRectangle({grid : this.grid});
			this._selections.push(this._selector);
		}
		return this._selector || this._selections[0];
	},
	
	shiftSelecting: function (key) {
		// summary:
		//		Pressing shift, and select the area with arrow keys;
		var
			keys = dojo.keys,
			selector = this.activeSelector(),
			grid = this.grid;
		if (!grid.isEditingDialog() && !grid.isEditingFormulaCell()) {
			if (key == keys.LEFT_ARROW || key == keys.RIGHT_ARROW) {
				if (selector.selectingRows()) {
					// if select row/rowrange, and press LEFT/RIGHT key, do nothing
					return;
				}
				
			} else {
				if (selector.selectingColumns()) {
					// if select column, and press UP/DOWN key, do nothing
					return;
				}
			}
		}
		var
			maxRow = (grid._looadingRowIndex != null) ? grid._loadingRowIndex - 1 : this.maxRow,
			maxCol = websheet.Constant.MaxColumnIndex,
			originalSelectedRange,
			planB
			;
		if (selector.selectingCell()) {
			originalSelectedRange = selector.getExpandedRangeInfo();
		} else {
			originalSelectedRange = selector.getRangeInfo();
		}
		// we're gonna use this if we can not find any place to go latter;
		planB = dojo.clone(originalSelectedRange);
		
		if (grid.isMirrored) {
			if (key == keys.LEFT_ARROW) {
				key = keys.RIGHT_ARROW;
			} else if (key == keys.RIGHT_ARROW) {
				key = keys.LEFT_ARROW;
			}
		}
		
		var delta = 0;
		var moved = this._searchAndSelect(selector, maxRow, maxCol, key, delta);
		if (!moved) {
			return;
		}
		if (selector.selectingRows()) {
			// do not need to scroll with column in this case;
			this.scrollToSelection(moved.rowIndex - 1, null);
		} else if (selector.selectingColumns()) {
			// do not need to scroll with rows in this case;
			this.scrollToSelection(null, moved.colIndex);
		} else {
			this.scrollToSelection(moved.rowIndex - 1, moved.colIndex);
		}
		var newSelectedRange = selector.getExpandedRangeInfo();
		selector.selectRange(newSelectedRange.startRow - 1, newSelectedRange.startCol, newSelectedRange.endRow - 1, newSelectedRange.endCol);
		
		var self = this;
		var edgeVisible = function () {
			if (key == keys.LEFT_ARROW || key == keys.RIGHT_ARROW) {
				return grid.isVisibleCol(moved.colIndex);
			} else {
				return grid.isVisibleRow(moved.rowIndex - 1);
			}
		};
		var anySpaceLeft = function () {
			var rangeInfo = selector.getExpandedRangeInfo();
			var focus = self.getFocusedCell();
			var focusRow = focus.focusRow + 1;
			var focusCol = focus.focusCol;
			var edge = self._relativePositionInRange(focusRow, focusCol, rangeInfo);
			if (key == keys.RIGHT_ARROW) {
				if((!edge.isLeft && !edge.isRight) || edge.isLeft){
					if(rangeInfo.endCol == maxCol)
						return false;
				}else{
					if(rangeInfo.startCol == maxCol)
				 		return false;
				}
				return true;
			}
			if (key == keys.LEFT_ARROW) {
				if((!edge.isLeft && !edge.isRight) || edge.isRight){
					if(rangeInfo.startCol == 1)
						return false;
				}else{
					if(rangeInfo.endCol == 1)
						return false;
				}
				return true;
			}
			if (key == keys.DOWN_ARROW) {
				if ((!edge.isTop && !edge.isBottom) || edge.isTop) {
					if (rangeInfo.endRow == maxRow) {
						return false;
					}
				} else {
					if (rangeInfo.startRow == maxRow) {
						return false;
					}
				}
				return true;
			}
			if (key == keys.UP_ARROW){
				if ((!edge.isTop && !edge.isBottom) || edge.isBottom) {
					if (rangeInfo.startRow == 1) {
						return false;
					}
				} else {
					if (rangeInfo.endRow == 1) {
						return false;
					}
				}
				return true;
			}
		};
		while (this._rangeEqual(originalSelectedRange, newSelectedRange) || !edgeVisible()) {
			if (anySpaceLeft()) {
				if (this._rangeEqual(originalSelectedRange, newSelectedRange)) {
					delta++;
				} else {
					delta = 0;
				}
				originalSelectedRange = selector.getRangeInfo();
				moved = this._searchAndSelect(selector, maxRow, maxCol, key, delta);
				if (!moved) {
					return;
				}
				newSelectedRange = selector.getExpandedRangeInfo();
				selector.selectRange(newSelectedRange.startRow - 1, newSelectedRange.startCol, newSelectedRange.endRow - 1, newSelectedRange.endCol);
				this.scrollToSelection(moved.rowIndex - 1, moved.colIndex);
			} else {
				// can not find any place to go, roll back to adopt plan B
				selector.selectRange(planB.startRow - 1, planB.startCol, planB.endRow - 1, planB.endCol);
				break;
			}
		}
		dojo.publish("UserSelection",[{selector: selector}]);
		if (grid.a11yEnabled()) {
			if (!grid.accnls) {
				grid.accnls = dojo.i18n.getLocalization("websheet","base");
			}
			var extRange = selector.getRangeInfo();
			grid.announce(dojo.string.substitute(grid.accnls.ACC_RANGE_SEL,
					[websheet.Helper.getColChar(extRange.startCol) + extRange.startRow,
					 websheet.Helper.getColChar(extRange.endCol) + extRange.endRow]));
		}
		
	},
	
	scrollToSelection: function(row, col){
		// summary:
		//		Scroll the grid to make the row/col visible
		var grid = this.grid,
			sc = grid.scroller,
			geometry = grid.geometry,
			bScroll = false,
			fr = sc.firstVisibleRow,
			fc = sc.firstVisibleCol;
		if(row < sc.firstVisibleRow && row >= grid.freezeRow){
			sc.scrollToRow(row);
			bScroll = true;
		}else if(row > sc.firstVisibleRow /*firstVisibleRow might equal to lastVisibleRow*/&& row >= sc.lastVisibleRow && row < this.maxRow){
			if(sc.lastVisibleRow > -1 && geometry.quickRowHeight(sc.firstVisibleRow, sc.lastVisibleRow) < geometry.getScrollableHeight()) {
				// the lastVisibleRow might be the last row that is visible in the whole document
				if ((col >= sc.firstVisibleCol && col <= sc.lastVisibleCol) || col <= grid.freezeCol){
					return;
				}
			}
			var target = geometry.getFirstRowWithLastRow(row, geometry.getScrollableHeight(), true);
			if(target < sc.firstVisibleRow && sc.lastVisibleRow < (this.maxRow - 1))
				target = row;
			else if(target == sc.firstVisibleRow && row < (this.maxRow - 1))
				// if target == sc.firstVisibleRow && row == Max row index means we do not need to scroll
				// because row is the last visible row and is totally visible ( the third param of geometry.getFirstColumnWithLastColumn
				target = sc.firstVisibleRow + 1;
			if (target > sc.firstVisibleRow) {
				sc.scrollToRow(target);
				bScroll = true;
			}
		}
		if(col < sc.firstVisibleCol && col > grid.freezeCol){
			sc.scrollToColumn(col);
			bScroll = true;
		}else if(col > sc.firstVisibleCol && col >= sc.lastVisibleCol && col <= websheet.Constant.MaxColumnIndex){
			if(geometry.colWidth(sc.firstVisibleCol, sc.lastVisibleCol) < geometry.getScrollableWidth())
				return;
			var target = geometry.getFirstColumnWithLastColumn(col, geometry.getScrollableWidth(), true);
			if(target < sc.firstVisibleCol && sc.lastVisibleCol < websheet.Constant.MaxColumnIndex)
				target = col;
			else if(target == sc.firstVisibleCol && col < websheet.Constant.MaxColumnIndex)
			// if target == sc.firstVisibleCol && col == websheet.Constant.MaxColumnIndex means we do not need to scroll
			// because col is the last visible column and is totally visible ( the third param of geometry.getFirstColumnWithLastColumn
				target = sc.firstVisibleCol + 1;
			if(target > sc.firstVisibleCol) {
				sc.scrollToColumn(target);
				bScroll = true;
			} 
		}
		if(bScroll) {
//			grid.requestUpdate(true);
			if(fr != sc.firstVisibleRow || fc != sc.firstVisibleCol) {
				// recusive call scrollToSelection because the row height/col width are not accurate when getFirstRow/ColumnWithLastRow/Column
				// they can be accurate after full render
				this.scrollToSelection(row, col);
			}
		}
	},
	
	zoomed: function()
	{
		// summary:
		//		Update all the selectors and picker's mode according to current zoom level.
		//		For pickers we may not need precise mode.
		var zoomed = false;
		if(Math.abs(this.grid.getZoomLevel() - 1) > 0.09)
			zoomed = true;
		this._selections.forEach(function(selector){
			zoomed ? selector.precisely() : selector.quickly();
		});
	},
	
	
	destroy: function()
	{
		dojo.forEach(this._selections, function(item){
			item.destroy();
		});
		dojo.forEach(this._subscriptions, function(item) {
			dojo.unsubscribe(item);
		});
		this._selections = [];
		this._selector = null;
	},
	
	_focusCell: function (row, col, isSelect) {
		var grid = this.grid;
		this.scrollToSelection(row, col);
		if (isSelect) {
			this.selector().selectCell(row, col);
		} else {
			this.selector().focusCell(row, col);
		}
		if (!grid.editor.isMobile())
			grid.showLinkDivWithIndex(row,col);
	},
	
	_relativePositionInRange : function (row, col, range) {
		var result = {};
		if (range.startRow == row) {
			result.isTop = true;
		}
		if (range.endRow == row) {
			result.isBottom = true;
		}
		if (range.startCol == col) {
			result.isLeft = true;
		}
		if (range.endCol == col) {
			result.isRight = true;
		}
		return result;
	},
	
	/**
	 * 
	 * @param range	navigate in the given range
	 * @param row	current row
	 * @param col	current col
	 * @param params {
	 * 					bNext: true if right when horizontal and down when vertical
	 * 					skipCoveredCell: true means skip the covered cell which is not visible, false means move to the main cell of this covered cell
	 * 					bContentCell: true if only move to the cell with content
	 * 					bMoveBack:	true means move back from the beginning of range if reach the edge of range
	 * 					ignoreLockedCell: true if the cell is locked
	 * 					}
	 */
	_moveHorizontal: function(range, row, col, params){
		var targetRow = row, targetCol = col,
			sheet = params.sheet,
			rowModel = sheet.getRow(targetRow, true),
			moveOffset = params.bNext ? 1 : -1,
			targetRowResult;
		var full = false;
		while((targetCol = this._nextColumn(targetCol, range.startCol, range.endCol, moveOffset, targetRow, rowModel, params)) <= 0)
		{
			if(!params.bMoveBack)
			{
				targetCol = col;
				break;
			}
			if(params.bNext){
				targetCol = range.startCol - moveOffset;
			}else {
				targetCol = range.endCol - moveOffset;
			}
			targetRowResult = this._nextVisibleRow(targetRow, range.startRow, range.endRow, moveOffset, sheet, params);
			if((targetRow = targetRowResult.index) < 0)
			{
				if(full){
					targetRow = row;
					targetCol = col;
					console.log("error when moveHorizontal");
					break;
				}
				full = true;
				if(params.bNext)
					targetRow = range.startRow - moveOffset;
				else
					targetRow = range.endRow - moveOffset;
				targetRowResult = this._nextVisibleRow(targetRow, range.startRow, range.endRow, moveOffset, sheet, params);
				if((targetRow = targetRowResult.index) < 0){
					targetRow = row;
					targetCol = col;
					console.log("error when moveHorizontal");
					break;
				}
			}
			rowModel = targetRowResult.model;
		}
		return {row: targetRow, col: targetCol};
	},
	
	/**
	 * 
	 * @param range	navigate in the given range
	 * @param row	current row
	 * @param col	current col
	 * @param params {
	 * 					bNext: true if right when horizontal and down when vertical
	 * 					skipCoveredCell: true means skip the covered cell which is not visible, false means move to the main cell of this covered cell
	 * 					bContentCell: true if only move to the cell with content
	 * 					bMoveBack:	true means move back from the beginning of range if reach the edge of range
	 * 					}
	 */
	_moveVertical: function(range, row, col, params){
		var targetRow = row, targetCol = col,
			sheet = params.sheet,
			columnWidths = this.grid.geometry._widthArray,
			moveOffset = params.bNext ? 1 : -1;
		
		if(params.bContentCell){
			// value cell or the start or end
			// precondition: it will never moveBack and will skipCoveredCell
			// if the precondition is not fullfilled, should rewrite this code 
			
			// hasValue: false means get the first value cell when traverse vertically, true means get the last continuous value cell
			var hasValue = false;
			var rowLength = sheet._rows.length;
			var rowPos = sheet.getRowPosition(row);
			if (rowPos < 0) {
				rowPos = -(rowPos + 1);// this rowPos is just the rowModel with index after row
				if(params.bNext)
					rowPos--; // letter it will += moveOffset when first while loop
			} else {
				var rModel = sheet._rows[rowPos];
				if(rModel && rModel.isVisibility() && rModel._valueCells && rModel._valueCells[targetCol - 1]){
					hasValue = true;
				}
			}
			
			targetRow = row + moveOffset;
			if(targetRow > range.endRow || targetRow < range.startRow)
				return {row: row, col: col};
				
			var lastIndex = -1;
			while((rowPos += moveOffset) >= 0 && rowPos < rowLength ){
				rModel = sheet._rows[rowPos]; 
				var index = rModel.getIndex();
				if(rModel.isVisibility()) {
					if(rModel._valueCells && rModel._valueCells[targetCol - 1]){
						if(hasValue && (index == targetRow)){
							targetRow += moveOffset;
						} else if(hasValue && lastIndex > -1){
								return {row: lastIndex, col: targetCol};
						} else
							return {row: index, col: targetCol};
					} else if(hasValue && lastIndex > -1){
						return {row: lastIndex, col: targetCol};
					} else
						hasValue = false;
					lastIndex = index;
				}else
					targetRow = index + moveOffset;
			}
			if(hasValue && lastIndex > -1){
				return {row: lastIndex, col: targetCol};
			} else {
				if(params.bNext)
					targetRow = range.endRow;
				else
					targetRow = range.startRow;
				targetRow = this.grid.searchVisibleRow(targetRow - 1, params.bNext) + 1;
			}
			return {row : targetRow, col: targetCol};
		}
		
		var targetRowResult;
		while((targetRowResult = this._nextVisibleRow(targetRow, range.startRow, range.endRow, moveOffset, sheet, params))
				&& ((targetRow = targetRowResult.index)< 0) ) 
		{
			if(!params.bMoveBack)
			{
				targetRow = row;
				targetCol = col;
				break;
			}
			if(params.bNext)
				targetRow = range.startRow - moveOffset;
			else
				targetRow = range.endRow - moveOffset;
			targetRowResult = this._nextVisibleRow(targetRow, range.startRow, range.endRow, moveOffset, sheet, params);
			if((targetRow = targetRowResult.index) < 0){
				console.log("error when moveVertical");
				return {row: row, col: col};
			} else {
				targetCol += moveOffset;
				if(params.bNext){
					if(targetCol > range.endCol)
						targetCol = range.startCol;
				} else {
					if(targetCol < range.startCol)
						targetCol = range.endCol;
				}
				
				break;
			}
		}
		var rModel = targetRowResult.model;
		
		if(params.ignoreLockedCell){
			if(rModel && rModel.isCellProtected(index))
				return this._moveVertical(range, targetRow, targetCol, params);
		}
		
		var cModel = sheet.getColumn(targetCol, true);
		if(cModel) {
			var coverInfo = cModel.getCoverInfo(targetRow, true);
			if(coverInfo) {
				var mainCellRow = coverInfo.getRow();
				var mainCellCol = coverInfo.getCol();
				if(mainCellRow != targetRow || (!params.bNext && (mainCellRow + coverInfo.getRowSpan() > row) )|| (params.skipCoveredCell && targetCol != mainCellCol)){
					if((!params.skipCoveredCell || (targetCol == mainCellCol)) && !params.bNext && (mainCellRow + coverInfo.getRowSpan() <= row))
						return {row : targetRow, col: targetCol};
					return this._moveVertical(range, params.bNext? (mainCellRow + coverInfo._rowSpan - moveOffset): 
								(((mainCellRow + coverInfo.getRowSpan() > row) || (params.skipCoveredCell && targetCol != mainCellCol))? mainCellRow: (mainCellRow - moveOffset)), targetCol, params);
				} 
			}
		}
		return {row : targetRow, col: targetCol};
	},

	//Search the next accessible column
	_nextColumn: function(current, start, end, moveOffset, rowIndex, rModel, params)
	{
		var columnWidths = this.grid.geometry._widthArray;
		var index = current + moveOffset;
		if(index > end || index < start) 
			return -1;
		var width = columnWidths[index - 1];
		if(width == null || width > 0 ){
			if(params.ignoreLockedCell){
				if(rModel && rModel.isCellProtected(index))
					return this._nextColumn(index, start, end, moveOffset, rowIndex, rModel, params);
			}
			if(params.bContentCell){
				// value cell or the start or end
				var hasValue = false;
				if(rModel && rModel._valueCells){
					if(rModel._valueCells[current-1])
						hasValue = true;
					var lastIndex = -1;
					index--;//change to 0-based
					for (var i = index; i < end && i >= start; i += moveOffset) {
						width = columnWidths[i];
						if(width == null || width > 0 ) {
							if (rModel._valueCells[i]) {
								lastIndex = i + 1;
								if(hasValue && (i == index)){
									index += moveOffset;
								} else
									return lastIndex;
							} else if(hasValue && lastIndex > -1){
								return lastIndex;
							} else
								hasValue = false;
						} else
							index = i + moveOffset;
					}
				}
				if(params.bNext)
					return end;
				else
					return start;
			}
			var cModel = params.sheet.getColumn(index, true);
			if(cModel) {
				var coverInfo = cModel.getCoverInfo(rowIndex, true);
				if(coverInfo) {
					var mainCellCol = coverInfo.getCol();
					var mainCellRow = coverInfo.getRow();
					
					if(mainCellCol != index || (!params.bNext && (mainCellCol + coverInfo.getColSpan() > current) ) || (params.skipCoveredCell && rowIndex != mainCellRow)){
						if((!params.skipCoveredCell || (rowIndex == mainCellRow)) && !params.bNext && (mainCellCol + coverInfo.getColSpan() <= current))
							return index;
						return this._nextColumn(params.bNext? (mainCellCol + coverInfo._colSpan - moveOffset):
												(((mainCellCol + coverInfo.getColSpan() > current) || (params.skipCoveredCell && rowIndex != mainCellRow)) ? mainCellCol : mainCellCol - moveOffset),
												start, end, moveOffset, rowIndex, rModel, params);
					} else
						return mainCellCol;
				}
			}
		} else {
			return this._nextColumn(index, start, end, moveOffset, rowIndex, rModel, params);
		}
		return index;
		
	},

	_nextVisibleRow: function(current, start, end, moveOffset, sheetModel, params)
	{
		var index = current + moveOffset;
		if(index > end || index < start)
			return {index: -1, model: null};
		var rModel = sheetModel.getRow(index, true);
		if(rModel && !rModel.isVisibility()){
			var rIndex = rModel.getIndex();
			if(moveOffset > 0)
				index = rIndex + rModel.getRepeatedNum();
			else
				index = rIndex;
			return this._nextVisibleRow(index, start, end, moveOffset, sheetModel, params);
		} else
			return {index: index, model: rModel};
	},
	
	_rangeEqual: function (range1, range2) {
		if (range1.startRow != range2.startRow || (range1.startCol != range2.startCol) || (range1.endRow != range2.endRow) || (range1.endCol != range2.endCol)) {
			return false;
		}
		return true;
	},
	
	_searchAndSelect: function (selector, maxRow, maxCol, key, delta) {
		// summary:
		//		change rect range, and return the range changed edge new value
		// return {
		//		colIndex:value,
		//		rowIndex:value
		//	} if still not meet the edge
		// return null if meet the edge
		var
			moved = {},
			keys = dojo.keys,
			grid = this.grid,
			selectedRange = selector.getExpandedRangeInfo(),
			focus = this.getFocusedCell(),
			focusRow = focus.focusRow + 1,
			focusCol = focus.focusCol,
			edge = this._relativePositionInRange(focusRow, focusCol, selectedRange),
			movedRowIndex,
			movedColIndex,
			sheet = grid.editor.getDocumentObj().getSheet(grid.sheetName);
			;
		switch (key) {
		case keys.RIGHT_ARROW:
			var rowModel = sheet.getRow(focusRow, true);
			if ((!edge.isLeft && !edge.isRight) || edge.isLeft) {
				var result = this._nextColumn(selectedRange.endCol + delta, 1, maxCol, 1, focusRow, rowModel, {sheet: sheet, bNext: true});
				if (result > 0) {
					movedRowIndex = selectedRange.endRow;
					movedColIndex = result;
					selector.selectRange(null, null, movedRowIndex - 1, movedColIndex, true);
				} else {
					return null;
				}
			} else {
				var result = this._nextColumn(selectedRange.startCol + delta, 1, maxCol, 1, focusRow, rowModel, {sheet: sheet});
				if (result > 0) {
					movedRowIndex = selectedRange.startRow;
					movedColIndex = result;
					selector.selectRange(movedRowIndex - 1, movedColIndex, selectedRange.endRow - 1, selectedRange.endCol, true);
				} else {
					return null;
				}
			}
			break;
		case keys.LEFT_ARROW:
			var rowModel = sheet.getRow(focusRow, true);
			if ((!edge.isLeft && !edge.isRight) || edge.isRight) {
				var result = this._nextColumn(selectedRange.startCol - delta, 1, maxCol, -1, focusRow, rowModel, {sheet: sheet});
				if (result > 0) {
					movedRowIndex = selectedRange.startRow;
					movedColIndex = result;
					selector.selectRange(movedRowIndex - 1, movedColIndex, null, null, true);
				} else {
					return null;
				}
			} else {
				var result = this._nextColumn(selectedRange.endCol - delta, 1, maxCol, -1, focusRow, rowModel, {sheet: sheet});
				if (result > 0) {
					movedRowIndex = selectedRange.endRow;
					movedColIndex = result;
					selector.selectRange(null, null, movedRowIndex - 1, movedColIndex, true);
				} else {
					return null;
				}
			}
			break;
		case keys.UP_ARROW:
			if ((!edge.isTop && !edge.isBottom) || edge.isBottom) {
				var result = this._nextVisibleRow(selectedRange.startRow - delta, 1, maxRow, -1, sheet, {});
				if (result.index > 0) {
					movedRowIndex = result.index;
					movedColIndex = selectedRange.startCol;
					selector.selectRange(movedRowIndex - 1, movedColIndex, null, null, true);
				} else {
					return null;
				}
			} else {
				var result = this._nextVisibleRow(selectedRange.endRow - delta, 1, maxRow, -1, sheet, {});
				if (result.index > 0) {
					movedRowIndex = result.index;
					movedColIndex = selectedRange.endCol;
					selector.selectRange(null, null, movedRowIndex - 1, movedColIndex, true);
				} else {
					return null;
				}
			}
			break;
		case keys.DOWN_ARROW:
			if( (!edge.isTop && !edge.isBottom) || edge.isTop){
				var result = this._nextVisibleRow(selectedRange.endRow + delta, 1, maxRow, 1, sheet, {});
		 		if (result.index > 0){
		 			movedRowIndex = result.index;
		 			movedColIndex = selectedRange.endCol ;
		 			selector.selectRange(null, null, movedRowIndex - 1, movedColIndex, true);
		 		}else{
		 			return null;
		 		}
			}else{
				var result = this._nextVisibleRow(selectedRange.startRow + delta, 1, maxRow, 1, sheet, {});
			    if (result.index > 0){
			    	movedRowIndex = result.index;
			    	movedColIndex = selectedRange.startCol ;
			 		selector.selectRange(movedRowIndex -1, movedColIndex, null, null, true);
			 	}else{
		 			return null;
		 		}
			}
			break;
		}
		moved.colIndex = movedColIndex;
		moved.rowIndex = movedRowIndex;
		return moved;
	}
	
});