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

dojo.provide("websheet.grid.GridGeometry");
dojo.require("websheet.listener.Listener");
dojo.require("websheet.model.Range");

dojo.declare("websheet.grid.GridGeometry", [websheet.listener.Listener], {
	// Module:
	//		websheet/canvas/GridGeometry
	// Description:
	//		Maintain and provide the row height and column width information of the data gird.
	
	_heightArray 		: 		null,
	_widthArray			:		null,
	
	defRowHeight		:		null,
	defColWidth			:		null,
	freezeBarSize		:		3,
	_grid				:		null,
	// GRID_HEADER_WIDTH
	// The width of the header, 36 px
	GRID_HEADER_WIDTH	:		36,
	// GRID_HEADER_HEIGHT
	// The height of the header, 24 px
	GRID_HEADER_HEIGHT	:		24,
	// We may calculate the cell wrap lines when we calculate row height (if the cell is not a merge cell), we intend to cache the calculated result in this _wrapInfoMap,
	// With this map cache, we will first try to access this map to get the already calculated lines when render, if we failed to get it, we still need to calculate the 
	// wrap info when constructing the RenderTree.
	// Like cellInfoMap in data grid, wrapInfoMap store the wrapped lines & their content width of the cells;
	// The key keeps the same with _cellInfoMap, while the value is an object with structure list bellow:
	// {
	//		lines : Array,
	//		widths: Array,
	// }
	// The _cellInfoMap will be cleared & re-generated each time the render tree is built,
	// while the _wrapInfoMap will not be cleared then, it will be overwritten each time the row height is re-calculated ( which means row update ),
	// and it should be cleared each time when user insert/delete row or column (s).
	_wrapInfoMap		:		{},
	
	// collect the rows that have been updated (in order to publish them later when new height calculated/updated);
	// should reset this map after each publish;
	// key : row index (0-based)
	// value : new height (in CSS px);
	// example:
	//		{
	//			0 : 12,
	//			5 : 25
	//		}
	// The height of the row 1 and row 6 is updated to 12px and 25px; 
	_updatedRows: {},
	
	constructor: function (grid) {
		this._grid = grid;
		this._heightArray = [];
		this._minHeightArray = [];
		this._widthArray = [];
		this._wrapInfoMap  = {};
		this.defRowHeight = ((grid.defaultRowHeight == null) ? websheet.Constant.defaultRowHeight : grid.defaultRowHeight),
		this.defColWidth = websheet.Constant.DEFAULT_COLUMN_WIDTH;
		this.loadColumnsFromModel();
		this.loadRowsFromModel();
	},
	
	calculateFrameRange: function (startRow, startCol, heightLimit, widthLimit, maxRow, maxCol) {
		// summary:
		//		Get the range boundary based on the given start position and the limitation.
		// startRow, Number, 1-based
		// startCol, Number, 1-based
		// heightLimit, Number, pixels
		// widthLimit, Number, pixels
		// maxRow, Number, optional
		//		0-based indexes, will break when reach the maxRow if it is given.
		// maxCol, Number, optional
		//		1-based indexes, will break when reach the max column if it is given
		// returns:
		//		Range {startRow, endRow, startCol, endCol}
		var
			endRow = startRow,
			endCol = startCol;
		if (widthLimit > 0) {
			endCol = this.getLastColumnWithFirstColumn(startCol, widthLimit);
		}
		if (maxRow == null) {
			maxRow = this._grid.editor.getMaxRow() - 1;
		}
		if (maxCol == null) {
			maxCol = websheet.Constant.MaxColumnIndex;
		}
		if (heightLimit > 0) {
			var 
				range = {
					startRow: startRow,
					endRow: maxRow + 1,
					startCol: 1,
					endCol: 1024,
					sheetName: this._grid.sheetName
				},
				iter = new websheet.model.RangeIterator(range, websheet.Constant.RangeIterType.CALCROWHEIGHT, false, {
					heightArray : this._heightArray
				}),
				result = {};
			iter.iterate(this.getHeightMeasurer(iter, {heightLimit: heightLimit, rowLimit: maxRow + 1, updateRowHeight: true}, result));
			if (result.height == 0 || result.height == null) {
				return null;
			} else {
				endRow = result.row;
				if (endRow == null) {
					endRow = this.getLastRowWithFirstRow(startRow - 1, heightLimit);
				}
			}
		}
		if (maxCol != null && endCol > maxCol) {
			endCol = maxCol;
		}
		if (maxRow != null && endRow > maxRow) {
			endRow = maxRow + 1;//change to 1-based
		}
		return {
			startRow : startRow,
			endRow : endRow,
			startCol : startCol,
			endCol : endCol,
			sheetName : this._grid.sheetName
		};
	},
	
	colWidth: function (start, /*==optional==*/end) {
		// summary:
		//		Return the width from the start column to the end column, width include both the start and end.
		// start, end: number, 1-based column index
		// returns:
		//		Number, width.
		return this._calculate(start - 1, (end || start) - 1, this._widthArray, this.defColWidth);
	},
	
	fillInRowsHeight: function (startRow, endRow, targetArray) {
		// summary:
		//		Copy the rows height information to the given array;
		// startRow, endRow:
		// 		1-based, mandatory;
		// targetArray:
		//		must be given;
		this.preciseRowHeight(startRow - 1, endRow - 1);
		var array = this._heightArray;
		for (var idx = startRow, height; idx <= endRow; idx ++) {
			height = array[idx - 1];
			if (height < 0) {
				targetArray[idx] = 0;
			} else {
				targetArray[idx] = height;
			}
		}
		return targetArray;
	},
	
	getCellPosition: function (/*0-based*/row, /*1-based*/col, withSize) {
		// summary:
		//		Return the top & left position of the given cell, the position are relative to the grid's left-top corner.
		// row: 0-based,
		// col, 1-based
		// returns:
		//		{l: 100, t: 200}
		var l = t = 0;
		var result = {};
		if (row < this._grid.freezeRow) {
			t = row > 0 ? this._calculate(0, row - 1, this._heightArray, this.defRowHeight) : 0;
		} else {
			// magic number for freeze bar size, not determined
			t = this.getFreezeHeight();
			if (row > this._grid.scroller.firstVisibleRow) {
				t +=  this._calculate(this._grid.scroller.firstVisibleRow, row - 1, this._heightArray, this.defRowHeight);
			}
		}
		if (col <= this._grid.freezeCol) {
			l = col > 1 ? this._calculate(0, col - 2, this._widthArray, this.defColWidth) : 0;
		} else {
			// magic number for freeze bar size, not determined
			l = this.getFreezeWidth();
			if (col > this._grid.scroller.firstVisibleCol) {
				l += this._calculate(this._grid.scroller.firstVisibleCol - 1, col - 2, this._widthArray, this.defColWidth);
			}
		}
		result = {l : l + this.GRID_HEADER_WIDTH, t : t + this.GRID_HEADER_HEIGHT};
		if (withSize) {
			result.h = this._calculate(row, row, this._heightArray, this.defRowHeight);
			result.w = this._calculate(col - 1, col - 1, this._widthArray, this.defColWidth);
		}
		return result;
	},
	
	getLastVisibleColumn: function (/*optional*/from) {
		// summary:
		//		Get the last non-hidden column from the given index;
		// from
		//		If it's not given  we are suppose you're looking for the last visible column of the sheet
		var array = this._widthArray;
		if (from == undefined) {
			if (this._lastVisibleColumn) {
				return this._lastVisibleColumn;
			} else {
				from = array.length;
			}
		}
		while (from > -1) {
			width = ((width = array[from - 1]) == null) ? this.defColWidth : (width < 0) ? 0 : width;
			if (width > 0) {
				return from;
			}
			from--;
		}
		return from;
	},
	
	getLastColumnWithFirstColumn: function (start, limit) {
		// summary:
		//		Return the index of the 'last column' on the giving 'first column' and the width limit.
		//		The column width from first to last should be no less than the limit, but exceeds one more column at most.
		if (limit <= 0) {
			return start;
		}
		var
			array = this._widthArray,
			current,
			width = ((current = array[start - 1]) == null) ? this.defColWidth : (current < 0) ? 0 : current,
			size = array.length,
			visibleEnd = start,
			end = visibleEnd;
		while (width < limit && end < size) {
			end += 1;
			width += ((current = array[end - 1]) == null) ? this.defColWidth : (current < 0) ? 0 : current;
			if (current > 0) {
				visibleEnd = end;
			}
		}
		return visibleEnd;
	},
	
	getFirstColumnWithLastColumn: function (end, limit, lastTotallyVisible) {
		// summary:
		//		Return the index of the first column on the giving last column and the width limit.
		//		lastTotallyVisible means the given end column is totally visible, rather than partial visible
		if (limit <= 0) {
			return end;
		}
		var oriEnd = end;
		lastTotallyVisible && end++;
		var
			array = this._widthArray,
			current,
			width = ((current = array[end - 1]) == null) ? this.defColWidth : (current < 0) ? 0 : current,
			col = this._grid.freezeCol + 1;
			start = end;
		while (width < limit && start > col) {
			start -= 1;
			width += ((current = array[start - 1]) == null) ? this.defColWidth : (current < 0) ? 0 : current;
		}
		if(lastTotallyVisible){
			if(start >= oriEnd)
				return oriEnd;
			if(width - limit > (((current = array[oriEnd - 1]) == null) ? this.defColWidth : (current < 0) ? 0 : current)) {
				start += 1;
			}
		} else {
			if(width - limit > (((current = array[oriEnd - 2]) == null) ? this.defColWidth : (current < 0) ? 0 : current)) {
				start += 1;
			}
		}
		return start;
	},
	
	getFirstRowWithLastRow: function (end, limit, lastTotallyVisible) {
		// summary:
		//		Return the first row with the given last row and the height limitation.
		if (limit <= 0) {
			return end;
		}
		var oriEnd = end;
		lastTotallyVisible && end++;
		var
			array = this._heightArray,
			current,
			height = ((current = array[end]) == null) ? this.defRowHeight : (current < 0) ? 0 : current,
			row = this._grid.freezeRow,
			start = end;
		while (height < limit && start > row) {
			start -= 1;
			height += ((current = array[start]) == null) ? this.defRowHeight : (current < 0) ? 0 : current;
		}
		if(lastTotallyVisible) {
			//this case is that the given last row's height is larger than limit
			if(start >= oriEnd)
				return oriEnd;
			// this case is that the calculated start row's height is too large that the last row becomes invisible
			if(height - limit > (((current = array[oriEnd]) == null) ? this.defRowHeight : (current < 0) ? 0 : current)) {
				start += 1;
			}
		} else {
			// this case is that the calculated start row's height is too large that the last row becomes invisible
			if(height - limit > (((current = array[oriEnd - 1]) == null) ? this.defRowHeight : (current < 0) ? 0 : current)) {
				start += 1;
			}
		}
		return start;
	},
	
	getGridHeight: function (noHeaderHeight) {
		// summary:
		//		The height of the canvas node (rendering area).
		if (!this._grid.boxSizing) {
			// Copy box sizing from current displayed data grid, they should be the same;
			this._grid.boxSizing = this._grid.editor.getCurrentGrid().boxSizing;
		}
		if (noHeaderHeight) {
			return this._grid.boxSizing.h - this.GRID_HEADER_HEIGHT;
		}
		return this._grid.boxSizing.h;
	},
	
	getGridWidth: function (noHeaderWidth) {
		// summary:
		//		The width of the canvas node (rendering area).
		if (noHeaderWidth) {
			return this._grid.boxSizing.w - this.GRID_HEADER_WIDTH;
		}
		return this._grid.boxSizing.w;
	},
	
	getLastRowWithFirstRow: function (start, limit) {
		// summary:
		//		Return the last row with the given start row and the height limitation.
		//		By calling this to get the right result, make sure the row height information in the row height array
		//		are ready, otherwise the row height information may not be precise.
		if (limit <= 0) {
			return start;
		}
		var
			array = this._heightArray,
			current,
			height = ((current = array[start]) == null) ? this.defRowHeight : (current < 0) ? 0 : current,
			size = this._grid.editor.getMaxRow() - 1,
			end = start;
		while (height < limit && end < size) {
			end += 1;
			height += ((current = array[end]) == null) ? this.defRowHeight : (current < 0) ? 0 : current;
			
		}
		return end;
	},
	
	
	getFreezeWidth: function () {
		// summary:
		//		Get the width of the frozen area (include freeze-bar size).
		if (this._grid.freezeCol == 0) {
			return 0;
		} else {
			return this._freezeWidth || (this._freezeWidth = this.colWidth(1, this._grid.freezeCol) + this.freezeBarSize);
		}
	},
	
	getFreezeHeight: function () {
		// summary:
		//		Get the height of the frozen area (include freeze-bar size).
		if (this._grid.freezeRow == 0) {
			return 0;
		} else {
			return this._freezeHeight || (this._freezeHeight = this.preciseRowHeight(0, this._grid.freezeRow - 1) + this.freezeBarSize);
		}
	},
	
	getScrollableWidth: function () {
		// summary:
		//		Get the width of the scrollable area.
		if (this._grid.freezeCol == 0) {
			return this._grid.boxSizing.w - this.GRID_HEADER_WIDTH;
		} else {
			return this._grid.boxSizing.w - this.getFreezeWidth() - this.GRID_HEADER_WIDTH;
		}
	},
	
	getScrollableHeight: function () {
		// summary:
		//		Get the height of the scrollable area.
		if (this._grid.freezeRow == 0) {
			return this._grid.boxSizing.h - this.GRID_HEADER_HEIGHT;
		} else {
			return this._grid.boxSizing.h - this.getFreezeHeight() - this.GRID_HEADER_HEIGHT;
		}
	},
	
	getHeightMeasurer: function (iterator, params, result) {
		// summary:
		//		Return a method that can be passed to the model range iterator to measure height.
		// iterator: a Range Iterator, 
		//		Must be given.
		// params: object
		//		A sequence of flags that controls the behavior of the measurer.
		//		| limit: number,
		//		|	If this height limit is given, the measure function will return false to stop iteration when the accumulated height
		//		|	has reached the given limit.
		//		| updateRowHeight: boolean,
		//		|	If set true, the measurer will use the measured result to update the row height array of the grid geometry.
		// result: object
		//		The measurer will write back result to this object, what it'll write depends on the given  flags.
		var
			self = this,
			bMinRowHeight = params.minRowHeight,
			array = bMinRowHeight ? this._minHeightArray : this._heightArray,
			styleMgr = websheet.model.ModelHelper.getDocumentObj()._styleManager,
			engine = websheet.grid.LayoutEngine.getInstance(),
			styleConst = websheet.Constant.Style,
			defHeight = this.defRowHeight,
			defaultStyle = websheet.style.DefaultStyleCode,
			cellStyle = defaultStyle,
			styleId,
			currentRow = iterator.startRow - 1,
			rowModel,
			rowHeight,
			cellFont,
			cellValue,
			measuring = false,		//if we need to measure the contents in the row during the iteration.
			heightLimit = params.heightLimit,
			rowLimit = params.rowLimit,
			update = params.updateRowHeight,
			breakOnBoundary = heightLimit > 0,
			accumulated = 0,
			beyonds = [],	// record those rows that contains huge wrapped cells, if we got one in the front columns, we should block the following measures;
			indent,
			wrap,
			cell
			;
			engine.setBreakCondition(this.getGridHeight(true));
		return function (obj, row, col) {
			if (beyonds[row]) {
				// no need to measure this row anymore;
				return true;
			}
			result.iteratedRow = row;
			if (row != currentRow) {
				result.row = currentRow;
				// iterate to a new row,
				if (row > (currentRow + 1)) {
					// update invisible row height to 0.
					// those rows height we've already calculated will also be skipped
					for (var idx = currentRow; idx < row - 1; idx++) {
						if (self._heightArray[idx] == null) {
							self._heightArray[idx] = 0;
						} /*else {
							else we should not change the height to 0.
						}*/
					}
				}
				if (measuring) {
					if (((result.height = (accumulated += rowHeight)) >= heightLimit) && breakOnBoundary) {
						return false;
					}
					measuring = false;
				}
				result.row = currentRow = row;
				if (rowLimit != null && currentRow > rowLimit) {
					return false;
				}
				if ((rowHeight = array[row - 1]) != null && rowHeight >= 0) {
					// we have already known the height of this row.
					if (((result.height = (accumulated += rowHeight)) >= heightLimit) && breakOnBoundary) {
						return false;
					}
					return true;
				}
				rowModel = obj ? obj.row : null;
				if (rowModel && (rowModel._height != null) && !bMinRowHeight) {
					// we can get the height from the model.
					rowHeight = rowModel._height || self.defRowHeight; // special meaning for "0" as rows height in model when visibility attribute is visible'  
					if (update){
						array[currentRow - 1] =  rowHeight;
					}
					if (((result.height = (accumulated += rowHeight)) >= heightLimit) && breakOnBoundary) {
						return false;
					}
					return true;
				} else {
					// give a default value and dynamically update the row height in the iteration
					rowHeight = defHeight;
					if (update) {
						array[currentRow - 1] =  rowHeight;
					}
					if (rowModel == null) {
						if (((result.height = (accumulated += rowHeight)) >= heightLimit) && breakOnBoundary) {
							return false;
						}
					} else {
						measuring = true;
						self._updatedRows[currentRow - 1] = true;
					}
				}
			}
			if (obj != null && measuring && !obj.bMultiRowMaster) {
				if (obj.isCovered) {
					// ignore the covered cell.
					return true;
				}
				styleId = obj.styleCell ? obj.styleCell._styleId : obj.columnStyleId;
				cell = obj.cell;
				cellValue = cell ? (cell.getShowValue(styleId) || "") + ""  : "";
				if (cellValue == "") {
					// ignore the empty cell.
					return true;
				}
				if (styleId) {
					cellStyle = styleMgr.styleMap[styleId]; //getStyleById 
				} else {
					cellStyle = defaultStyle;
				}
				if (!cellStyle) {
					// style unknown, can not measure.
					return true;
				}
				cellFont = cellStyle.getFontStyle();
				indent = cellFont.indent || 0;
				if ((wrap = cellFont.wrap) && cell.isString()
						&& !((cell.isFormula() && !cell.isCalculated()))
						/* un-calculated formulas (or error formulas) will not be engaged in row height wrap calculation*/
						&& /*merge masters will not be engaged in row height wrap calculation 
							(no matter single row or multi-row merge master)*/obj.bMultiRowMaster == null) {
					// it's a wrapped cell
					var lines = [],
						widths = [],
						values = cellValue.split("\n"),
						fragments,
						wrapHeight;
					engine.state(cellFont.fontString);
					for (var idx = 0, len = values.length, line, width = self.colWidth(col) - indent; idx < len; idx++) {
						line = values[idx];
						if (line != '') {
							fragments = engine.fragmentText(line, width);
							lines = lines.concat(fragments.lines);
							widths = widths.concat(fragments.widths);
						} else {
							lines.push(line);
							widths.push(0);
						}
					}
					wrapHeight = lines.length * (cellFont.size + 2); // 2 is the padding size.
					if (!cell.isUnknown() && !cell.isError()) {
						self._grid.insertCellInfo(row - 1, col, 'wrap', {
							lines : lines, 
							widths : widths, 
							onWidth : width
						});
					}
					if (wrapHeight > rowHeight) {
						rowHeight = wrapHeight;
						if (update) {
							array[currentRow - 1] =  rowHeight;
						}
						if (fragments && fragments.beyond) {
							beyonds[row] = true;
						}
					}
				} else if (wrap) {
					// insert an empty string to eliminate the cached value;
					self._grid.insertCellInfo(row - 1, col, 'wrap', "");
				} else if (!wrap) {
					// it's not wrapped, use the font size.
					if (cellFont.size + 2 > rowHeight) {
						rowHeight = cellFont.size + 2;
						if (update) {
							array[currentRow - 1] =  rowHeight;
						}
					}
				}
			}
			return true;
		};
	},
	
	
	invalidateCol: function (/*==1-based, optional==*/start, /*==optional==*/end) {
		// summary:
		//		If you're not giving start and end, we will invalidate all the column widths;
		// example:
		//		geometry.invalidateCol(); //invalidate all
		//		geometry.invalidateCol(1);//invalidate the first column
		if (start == null && end == null) {
			this._widthArray = [];
			this._freezeWidth = null;
		} else {
			this._invalidate(start - 1,(end || start) - 1, this._widthArray);
			if (start <= this._grid.freezeCol) {
				this._freezeWidth = null;
			}
		}
	},
	
	invalidateRow: function (/*==0-based, optional==*/start, /*==optional==*/end) {
		// summary:
		//		If you're not giving a row index, we will invalidate all the row heights.
		if (start == null && end == null) {
			this._heightArray = [];
			this._minHeightArray = [];
			this._freezeHeight = null;
		} else {
			this._invalidate(start, end || start, this._heightArray);
			this._invalidate(start, end || start, this._minHeightArray);
			if (start < this._grid.freezeRow) {
				this._freezeHeight = null;
			}
		}
	},
	
	invalidateWrapCache: function (/*==0-based, optional==*/start, /*==optional==*/end) {
		// summary:
		//		Clear the wrap cell info cache, parameters similar with 'invalidateRow';
		if (start == null && end == null) {
			this._wrapInfoMap = {};
		} else {
			this._invalidate(start, end || start, this._wrapInfoMap);
			if (start < this._grid.freezeRow) {
				this._freezeHeight = null;
			}
		}
	},
	
	loadColumnsFromModel: function () {
		var 
			array = this._widthArray,
			rangeInfo = {
				sheetName: this._grid.sheetName,
				startCol: 1,
				endCol: 1024
			},
			def = websheet.Constant.DEFAULT_COLUMN_WIDTH,
			colArray = websheet.model.ModelHelper.getCols(rangeInfo, true, true).data
			;
		for (var i = 0, max = 1024; i < max; i++) {
			var
				col = colArray[i],
				width = null,
				visible = true;
			if (col) {
				width = col.getWidth();
				visible = col.isVisible();
			}
			if (width === null || !col)
				width = def;
			if (!visible)
				width *= -1;
			array[i] = width;
		}
		this._wrapInfoMap = {};
		this._lastVisibleColumn = null;
		this._lastVisibleColumn = this.getLastVisibleColumn();
	},
	
	loadRowsFromModel: function () {
		var 
			array = this._heightArray,
			grid = this._grid,
			sheetName = grid.sheetName,
			sheet = grid.editor.getDocumentObj().getSheet(sheetName),
			rows = sheet._rows
			;
		for (var i = 0, length = rows.length; i < length; i++) {
			var
				row = rows[i],
				height = null,
				visible = true;
			if (row) {
				visible = row.isVisibility();
				height = row._height;
				if (!visible) {
					if(height != null)
						height *= -1;
					else
						height = 0;
				}
				if (height != null) {
					var rn = row.getRepeatedNum();
					var index = row.getIndex() - 1;
					var lastIndex = index + rn;
					for(var j = index; j <= lastIndex; j++)
						array[j] = height;
				}
			}
		}
	},
	
	/**
	 * According to the position x,y of given range scope
	 * get the cell's location in this range
	 * x, y is relative to the left top corner of range
	 * Return the cell's index
	 * {row: (0-based), col: (1-based)}
	 * @param x
	 * @param y
	 * @param range defined with startRow, endRow, startCol, endCol
	 * @param canBeOutOfRange true means it return the row and col out of range, such as when Events.decorateEvent
	 * 							it can return row == -1 or col == 0 which means mouse action on the grid header
	 */
	locatingCell: function (x, y, range, canBeOutOfRange) {
		var array,
			col, row;
		
		if(x < 0){
			col = 0;
		} else {
			array = this._widthArray;
			for(var i = range.startCol, value; (/*i <= range.endCol &&*/ x > 0); i++){
				x -= ((value = array[i-1]) < 0) ? 0 : value;
			}
			if(i - 1 > range.endCol)
				col = null;
			else
				col = i - 1;
		}
		if(y < 0){
			row = -1;
		} else {
			array = this._heightArray;
			for(var i = range.startRow, value; (/*i <= range.endRow &&*/ y > 0); i++){
				y -= ((value = array[i-1]) == null) ? this.defRowHeight : (value < 0)? 0 : value;
			}
			if(i - 1 > range.endRow) // the row after endRow is hided, so we can not locate any cell
				row = null;
			else
				row = i - 2;
		}
		if(!canBeOutOfRange) {
			if(col != null) col = Math.max(col, range.startCol);
			if(row != null) row = Math.max(row, range.startRow - 1);
		}
		return {row: row, col: col, offsetX: x, offsetY: y};
	},
	
	notify: function(source, event) {
		// summary:
		//		Geometry listen on insert/delete row events;
		var constant = websheet.Constant;
		if (event._type == constant.EventType.DataChange) {
			var s = event._source;
			var parsedRef = s.refValue;
			if (!parsedRef) {
				return;
			}
			var sheetName = parsedRef.sheetName;
			if (sheetName != this._grid.sheetName) {
				return;
			}
			var 
				array,
				sIndex,
				eIndex;
			if (s.refType == constant.OPType.ROW) {
				array = this._heightArray;
				sIndex = parsedRef.startRow - 1;
				eIndex = parsedRef.endRow - 1;
				if (sIndex < this._grid.freezeRow) {
					this._freezeHeight = null;
				}
				this._wrapInfoMap = {};
			} else if (s.refType == constant.OPType.COLUMN) {
				array = this._heightArray;
				sIndex = parsedRef.startCol;
				eIndex = parsedRef.endCol;
				this._wrapInfoMap = {};
				if (sIndex <= this._grid.freezeCol) {
					this._freezeWidth = null;
				}
			}
			if (sIndex > eIndex) {
				var i = eIndex;
				eIndex = sIndex;
				sIndex = i;
			}
			var count = eIndex - sIndex + 1;
			if (s.action == constant.DataChange.PREDELETE) {
				array.splice(sIndex, count);
			} else if (s.action == constant.DataChange.PREINSERT) {
				var length = this._heightArray.length;
				for (var i = length ; i >= sIndex; i--){
					array[i + count] = array[i];
				}
				if (s.refType == constant.OPType.ROW) {
					this.invalidateRow(sIndex, eIndex);
				} else {
					this.invalidateCol(sIndex, eIndex);
				}
			}
		}
	},
	
	rowHeight: function () {
		// @deprecated, call quickRowHeight or preciseRowHeight, make sure you get the point.
		return this.quickRowHeight.apply(this, arguments);
	},
	
	getMinRowHeight: function(startRow, endRow) {
		var arr = [];
		for(var i = startRow; i <= endRow; i++){
			var h = this._minHeightArray[i];
			if(h != null)
				arr[i] = h;
			else{
				arr = [];
				break;
			}
		}
		
		if(arr.length == 0) {
			this.preciseRowHeight(startRow, endRow, {minRowHeight: true, updateRowHeight: true});
			for(var i = startRow; i <= endRow; i++){
				var h = this._minHeightArray[i];
				arr[i] = h;
			}
		}
		return arr;
	},
	
	preciseRowHeight: function (start, /*==optional==*/end, params) {
		// summary:
		//		Get the precise row height from the row height array, and the row model, measure the row height depends on cell contents.
		// 		Indexes are 0-based.
		// returns:
		//		Number, height.
		if (end == null) {
			end = start;
		}
		if (start > end) {
			var t = start;
			start = end;
			end = t;
		}
		if (this._heightArray.length == 0) {
			// note:
			//		We may not be able to get the correct height with the iterate & accumulate method when all the row heights are unkonwn;
			//	As an example:
			//		Getting height from row 1 to row X, this can be happening when we need to get the freezeHeight in some case;
			//		If X is a hidden row, the iterator will not iterate to the X row and will just stop at row X-1, the iterate rule is to step over 
			//		those rows that are hidden or their heights are already known;
			//		In this case the height accumulation will miss the last row X, and we will use the defaultRowHeigth to replace with the undefined (unknown) height;
			//		Finally we'll get a result that's more than it should be;
			//		Call this "loadRowsFromModel" can load all the hidden rows in advance, thus can prevent this case from happening;
			if (this._grid.freezeRow > 0) {
				this.loadRowsFromModel();
			} else {
				console.warn("We should prevent this, do we realy need to get the precise height of some ranges, even before the grid is rendered?");
			}
		}
		var 
			range = {
				startRow: start + 1,
				endRow: end + 1,
				startCol: 1,
				endCol: 1024,
				sheetName: this._grid.sheetName
			},
			iter = new websheet.model.RangeIterator(range, websheet.Constant.RangeIterType.CALCROWHEIGHT, false, {
				heightArray : this._heightArray,
				recalculate : params ? params.minRowHeight : false
			}),
			result = {height: 0};
		iter.iterate(this.getHeightMeasurer(iter, params ? params : {updateRowHeight: true}, result));
		if (result.iteratedRow <= end) {
			this.updateRow(result.iteratedRow, end, 0);
		} else if (result.iteratedRow == undefined) {
			this.updateRow(start, end, 0);
		}
		return this.quickRowHeight(start, end);
	},

	publishRowsUpdate: function (forCalcRowHeight) {
		// summary:
		//		Send out the updated rows;
		// Notice:
		//		Only rows that're measured in the iteration will be collected and published;
		// forCalcRowHeight: boolean
		//		There're two kinds of update,the first is row update with operation
		//		the second is, respond to row height calulation request send by Mobile image/chart rendering handler.
		var changed = false;
		var map = this._updatedRows;
		var array = this._heightArray;
		var heights = {};
		for (var key in map) {
			if (/*array[key] != this.defRowHeight && */ array[key] != 0) {
				!changed && (changed = true);
				heights[key] = array[key];
			}
		}
		if (changed || forCalcRowHeight) {
			var params = {sheetName: this._grid.sheetName, rowData: heights, calculateRowHeight: forCalcRowHeight ? 1 : 0};
			this._grid.editor.publishForMobile({"name": "setRowHeight", "params":[params]});
			// & clear the map
			this._updatedRows = {};
		}
	},
	
	quickRowHeight: function (start, /*==optional==*/end) {
		// summary:
		//		Return the height from the start row to end row, height include both the start and end.
		//		Use this method to quickly calculate positions of cells in visible area, used in event decoration and cell rendering.
		// Notice:
		//		This row height calculate results based on current status of the row height array, it MAY NOT BE ACCURATE!.
		//		It may not be accurate in case row height is unknown (not pre-rendered yet), we use default row height then.
		//		If you're calculating row heights that're out of current vision, and need to make it precise, you need to call "preciseRowHeight".
		// start, end: number, 0-based row index
		// returns:
		//		Number, height.
		return this._calculate(start, end, this._heightArray, this.defRowHeight);
	},
	
	resetFreezeBox: function () {
		// summary:
		//		When the grid freeze info changed, need to call this to remove the cached freeze box size;
		this._freezeHeight = this._freezeWidth = null;
	},
	
	showHideColumn: function(startCol, endCol, bHide) {
		var from = startCol - 1;
		if (from <= this._grid.freezeCol) {
			this._freezeWidth = null;
		}
		while (from < endCol) {
			var w = this._widthArray[from];
			if( (bHide && (w > 0)) 
				|| (!bHide && (w < 0)) ){
					this._widthArray[from] = -w;
			} else if(!bHide && (w == 0))
				this._widthArray[from] = null;
			from++;
		}
	},
	
//	
//	setDefaultRowHeight: function (defaultRowHeight) {
//		this.defRowHeight = defaultRowHeight;
//	},
//	
	updateRow: function (/*==0-based==*/rowIndex, height) {
		// summary:
		//		Update the row height of the given row index,
		//		forShow means does not change the sign of the row height, 
		//			if the row is hide, set the height to the negative value of given height
		// example:
		//	|	geometry.updateRow(0, 0);
		//	|	geometry.updateRow(0, 99, 17);
		//		The second example update row 1 ~ 100 all together.
		if (arguments.length == 3) {
			var 
				from = arguments[0],
				to = arguments[1],
				value = arguments[2],
				forShow = arguments[3];
			if (from < this._grid.freezeRow) {
				this._freezeHeight = null;
			}
			while (from <= to) {
				var h = this._heightArray[from];
				this._wrapInfoMap[from + ""] = null;
				if(h != null && h <= 0 && forShow)
					this._heightArray[from] = -Math.abs(value);
				else
					this._heightArray[from] = value;
				from++;
			}
		} else {
			this._wrapInfoMap[rowIndex + ""] = null;
			this._heightArray[rowIndex] = height;
			if (rowIndex < this._grid.freezeRow) {
				this._freezeHeight = null;
			}
		}
	},

	showHideRow: function(startRow, endRow, bHide) {
		var from = startRow;
		if (from < this._grid.freezeRow) {
			this._freezeHeight = null;
		}
		while (from <= endRow) {
			var h = this._heightArray[from];
			if (bHide) {
				if (h > 0) {
					this._heightArray[from] = -h;
				} else {
					this._heightArray[from] = 0;
				}
			} else {
				if (h < 0) {
					this._heightArray[from] = -h;
				} else {
					this._heightArray[from] = null;
				}
			}
			from++;
		}
		
	},
	// 
	updateColumn: function (/*==1-based==*/colIndex, width) {
		// summary:
		//		Update the column width of the given column index.
		//		forShow means does not change the sign of the column width, 
		//			if the column is hide, set the width to the negative value of given width
		//		Similar with "updateRow".
		if (arguments.length >= 3) {
			var 
				from = arguments[0] - 1,
				to = arguments[1] - 1,
				value = arguments[2] || this.defColWidth,
				forShow = arguments[3]
			;
			if (from <= this._grid.freezeCol) {
				this._freezeWidth = null;
			}
			while (from <= to) {
				w = this._widthArray[from];
				if(w < 0 && forShow)
					this._widthArray[from] = -Math.abs(value);
				else
					this._widthArray[from] = value;
				from++;
			}
		} else {
			this._widthArray[colIndex - 1] = width;
			if (colIndex <= this._grid.freezeCol) {
				this._freezeWidth = null;
			}
		}
	},
	
	_calculate: function (start, end, array, defaultValue) {
		var value = 0;
		if (end == null || start == end) {
			return ((value = array[start]) == null) ? defaultValue : (value < 0) ? 0 : value;
		} else {
			if (start > end) {
				var t = start;
				start = end;
				end = t;
			}
			for (var current; start <= end; start++ ) {
				value += ((current = array[start]) == null) ? defaultValue : (current < 0) ? 0 : current;
			}
			return value;
		}
	}, 
	
	
	_invalidate: function (start, end, array) {
		for (; start <= end; start++) {
			array[start] = null;
		}
	}
	
});