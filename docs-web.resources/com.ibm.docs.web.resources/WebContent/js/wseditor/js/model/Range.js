/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2014. All Rights Reserved.          */
/*                                                                   */
/* U.S. Government Users Restricted Rights: Use, duplication or      */
/* disclosure restricted by GSA ADP Schedule Contract with IBM Corp. */
/*                                                                   */
/* ***************************************************************** */

dojo.provide("websheet.model.Range");

// provide interface for compressed row array
dojo.declare("websheet.model._RowBase", null, {
	_sheet: null,
	_rowsModel: null,
	startRow: -1,
	endRow: -1,
	
	_exitOnLastRow: false, // exit the iteration immediately if there doesn't have any row in the row array
	// variable
	_row: -1, // current row index in the range iteration
	_rowIndex: -1, // current row index in the compressed row array
	_rowIndex2: -1, // the _rowIndex backup for the first row
	
	_bIgnoreHiddenCell: false, // filter hidden cells for canvas rendering

	constructor: function(rangeInfo, type) {
		this._row = this.startRow = rangeInfo.startRow;
		this.endRow = rangeInfo.endRow;
		var doc = websheet.model.ModelHelper.getDocumentObj();
		this._sheet = doc.getSheet(rangeInfo.sheetName);
		if (this._sheet) this._rowsModel = this._sheet._rows;
		this._exitOnLastRow = true;
		
		if (websheet.Constant.RangeIterType.CFOPTIMIZEVALUE == type) {
			this._bIgnoreHiddenCell = true;
		}
	},

	/*void*/get: function() {
		if (this._rowIndex == -1) {
			var index = this._sheet.getRowPosition(this.startRow);
			if (index < 0)
				index = -(index + 1);
			
			this._rowIndex2 = this._rowIndex = index;
			if (index == this._rowsModel.length)
				return null;
			
			this._row = this._rowsModel[index].getIndex();
			if (this._row > this.endRow)
				return null;
		}
		
		if (this._rowIndex == this._rowsModel.length)
			return null;
		
		if (this._bIgnoreHiddenCell) {
			// ignore hidden or filtered rows
			var rowModel = this._rowsModel[this._rowIndex];
			if (rowModel && !rowModel.isVisibility()) {
				this._skip();				
				// it moves beyond the end row
				if (this._row > this.endRow)
					return null;
				if (this._rowIndex == this._rowsModel.length)
					return null;				
			}
		}
		
		return {row: this._rowsModel[this._rowIndex]};
	},
	
	/*boolean*/move: function() {
		if (this._rowIndex == this._rowsModel.length) {
			this._row = this.endRow + 1;
			return true;
		}
		
		this._row += 1 + this._rowsModel[this._rowIndex]._gap;
		this._rowIndex++;
		
		if (this._bIgnoreHiddenCell) {
			// ignore hidden or filtered rows
			var rowModel = this._rowsModel[this._rowIndex];
			if (rowModel && !rowModel.isVisibility()) {
				this._skip();
			}
		}
		
		return this._rowIndex == this._rowsModel.length;
	},
	
	/*void*/_skip: function() {		
		do {
			var rowModel = this._rowsModel[++this._rowIndex];
			if (rowModel)
				this._row += 1 + rowModel._gap;
		} while (rowModel && !rowModel.isVisibility());
	},
	
	/*
	 * get current row index
	 */
	/*int*/getIndex: function() {
		return this._row;
	},
	
	/*boolean*/hasNext: function() {
		return this._row <= this.endRow;
	},
	
	/*void*/init: function() {
		this._row = this.startRow;
		this._rowIndex = this._rowIndex2;
	},
	
	/*void*/reset: function() {
		this._row = this.startRow;
		this._rowIndex2 = this._rowIndex = -1;
	}
}),

// provide interface for spare row array
dojo.declare("websheet.model._Row", null, {
	_sheet: null,
	_rowsModel: null,
	startRow: -1,
	endRow: -1,
	
	_exitOnLastRow: false, // exit the iteration immediately if there doesn't have any row in the row array
	_bFollowStyle: false, // follow master row for repeated style
	_bIgnoreHiddenCell: false, // filter hidden cells for canvas rendering
	
	// variables
	_row: -1, // current row index in the range iteration
	
	_rowIndex: -1, // current row index in the compressed row array
	_gap: 0, // 0 if current row is not empty, otherwise it is the gap between current row and next row in the compressed row array
	_pRow: -1, // the row index of previous row
	_rowIndex2: -1, // the _rowIndex backup for the first row
	_gap2: 0, // the _gap backup for the first row
	
	constructor: function(rangeInfo, type) {
		this._row = this.startRow = rangeInfo.startRow;
		this.endRow = rangeInfo.endRow;
		var doc = websheet.model.ModelHelper.getDocumentObj();
		this._sheet = doc.getSheet(rangeInfo.sheetName);
		if (this._sheet) this._rowsModel = this._sheet._rows;
		
		var IterType = websheet.Constant.RangeIterType;
		if (type == undefined) type = IterType.VALUE;
		switch (type) {
		case IterType.NORMAL:
		case IterType.MIXED:
			this._bFollowStyle = true; 
			break;
		case IterType.TEXTMEASURE:
		case IterType.EXTENDRENDER:
		case IterType.CALCROWHEIGHT:
			this._bFollowStyle = true;
			this._bIgnoreHiddenCell = true;
			break;
		case IterType.CFOPTIMIZE:
			this._bFollowStyle = true;
			this._bIgnoreHiddenCell = true;
			break;
		case IterType.VALUE:
		default:
			this._exitOnLastRow = true;
			break;
		}
	},
	
	/*
	 * get current row model
	 */
	/*object*/get: function() {
		if (this._rowIndex == -1) {
			var index = this._sheet.getRowPosition(this.startRow, this._bFollowStyle);
			if (index < 0)
				index = -(index + 1);
			
			this._rowIndex2 = this._rowIndex = index;
			if (index == this._rowsModel.length) {
				if (this._exitOnLastRow)
					return null;
				else
					return {row: null};
			}
			
			var rowIndex = this._rowsModel[index].getIndex();
			this._pRow = rowIndex;
			this._gap2 = this._gap = this.startRow < rowIndex ? this.startRow - rowIndex : rowIndex + this._rowsModel[index]._gap - this.startRow;
			this._usePrevRow = this._gap < 0;
		}
		
		var rowModel = null;
		if (this._gap == 0 && !this._bEmptyRow) {
			if (this._rowIndex == this._rowsModel.length) {
				if (this._exitOnLastRow)
					return null;
			}
			
			rowModel = this._rowsModel[this._rowIndex];
			// don't set _gap if current index specified by this._pRow < start row index
			if (this._pRow >= this.startRow && rowModel)
				this._gap = rowModel._gap;
			if (this._row != this.startRow)
				this._pRow = this._row;
		} else {
			if (this._bFollowStyle) {
				var r = this._rowsModel[this._usePrevRow ? this._rowIndex - 1 : this._rowIndex];
				if (r && this._pRow <= this._row && this._row <= this._pRow + r._repeatedNum)
					rowModel = r;
			}
		}

		if (this._bIgnoreHiddenCell) {
			// ignore hidden or filtered rows
			if (rowModel && !rowModel.isVisibility()) {
				rowModel = null;
				this._skip();
				if (this._gap == 0)
					rowModel = this._rowsModel[this._rowIndex];
				
				// it moves beyond the end row
				if (this._row > this.endRow)
					return null;
			}
		}
		
		return {row: rowModel};
	},

	/*
	 * Ignore filtered or hidden rows and set this._row, this._rowIndex, this._pRow and this._gap correctly
	 */
	/*void*/_skip: function() {
		var rowModel = this._rowsModel[this._rowIndex];
		do {
			// FIXME it's better not to use getIndex here
			var rowIndex = rowModel.getIndex();
			this._row = rowIndex + rowModel._repeatedNum + 1;
			this._gap = rowModel._repeatedNum - rowModel._gap;
			this._pRow = rowIndex + rowModel._gap + 1;
			rowModel = this._rowsModel[++this._rowIndex];
			this._usePrevRow = this._gap < 0;
			if (this._gap) {
				return;
			}
		} while (rowModel && !rowModel.isVisibility());
		
		if (rowModel && rowModel.isVisibility()) {
			this._gap = rowModel._gap;
		}
	},
	
	/*
	 * move to next row
	 */
	/*boolean*/move: function() {
		this._row++;
		
		if (this._gap == 0) {
			if (this._rowIndex == this._rowsModel.length)
				return true;
			
			this._rowIndex++;
			
			if (this._usePrevRow)
				this._gap = this._rowsModel[this._rowIndex - 1]._gap;
			else {
				if (this._rowIndex < this._rowsModel.length) {
					this._gap = this._rowsModel[this._rowIndex]._gap;
					this._pRow = this._row;
				}
			}
			this._bEmptyRow = false; // this row model exists in the compressed row array
		} else {
			this._gap > 0 ? -- this._gap : ++ this._gap;
			
			if (this._gap == 0) {
				if (this._usePrevRow)
					this._usePrevRow = false;
				else
					this._bEmptyRow = true;
			}
		}
		
		if (this._bIgnoreHiddenCell) {
			// ignore hidden or filtered rows
			if (this._gap == 0) {
				var rowModel = this._rowsModel[this._rowIndex];
				if (rowModel && !rowModel.isVisibility())
					this._skip();
			}
		}
		
		return false;
	},
	
	/*
	 * get current row index
	 */
	/*int*/getIndex: function() {
		return this._row;
	},
	
	/*boolean*/hasNext: function() {
		return this._row <= this.endRow;
	},
	
	/*void*/init: function() {
		this._row = this.startRow;
		this._gap = this._gap2;
		this._usePrevRow = this._gap2 < 0;
		this._bEmptyRow = false;
		this._rowIndex = this._rowIndex2;
		this._pRow = this._row - this._gap;
	},
	
	/*void*/reset: function() {
		this._row = this.startRow;
		this._gap2 = this._gap = 0;
		this._usePrevRow = false;
		this._bEmptyRow = false;
		this._pRow = this._rowIndex2 = this._rowIndex = -1;
	}
});

dojo.declare("websheet.model.RowIterator", null, {
	constructor: function(/*websheet.model._Row or rangeInfo*/rows, type) {
		if (typeof rows == websheet.model._Row) {
			this._rows = rows;
			this._rows.reset();
		} else {
			var IterType = websheet.Constant.RangeIterType;
			if (type == IterType.OPTIMIZEVALUE || type == IterType.MIXED || type == IterType.CFOPTIMIZEVALUE)
				this._rows = new websheet.model._RowBase(rows);
			else
				this._rows = new websheet.model._Row(rows, type);
		}
	},
	
	/*boolean*/hasNext: function() {
		return this._rows.hasNext();
	},
	
	/*object*/next: function() {
		var o = this._rows.get();
		if (!o) return null;
		
		var ret = {success: true, row: o.row, index: this._rows.getIndex()};
		this._rows.move();
		return ret;
	},
	
	/*void*/iterate: function(/*function*/func) {
		while (this.hasNext()) {
			var o = this.next();
			if (!o) break;
			if (o.success) {
				if (!func(/*row model*/o.row, /*row index*/o.index))
					break;
			}
		}
	}
});

dojo.declare("websheet.model._Range", null, {
	_rows: null, // websheet.model._Row or websheet.model._RowBase
	startCol: -1,
	endCol: -1,
	
	// variables
	_col: -1, // current column index in the range iteration
	_externData: null, // external data in either array or object
	
	constructor: function(rows, rangeInfo, data) {
		this._rows = rows;
		this._col = this.startCol = rangeInfo.startCol;
		this.endCol = rangeInfo.endCol;
		this._externData = data;
	},
	
	/*
	 * get current row model
	 */
	/*object*/getRow: function() {
		return this._rows.get();
	},
	
	/*
	 * get current cell
	 */
	/*object*/getCell: function(rowModel) {
		// to be overridden
		return {success: true};
	},
	
	/*
	 * check whether there has any cell available
	 */
	/*boolean*/hasNext: function() {
		return this._rows.hasNext() && this._col <= this.endCol;
	},
	
	/*
	 * move to next column
	 */
	/*void*/_nextCol: function() {
		this._col++;
	},
	
	// to be overridden
	/*void*/extendColSize: function(rowModel) {
	},
	
	/*
	 * to be overridden
	 * start column and end column would be changed, need to reset 
	 * them if they are changed when move to next row
	 */
	/*void*/resetColSize: function() {
	},
	
	/*
	 * iterate to next cell in current row.
	 * if it's the last cell in this row of the range, move to next row.
	 */
	/*void*/nextCellByRow: function() {
		if (!this._rows.hasNext())
			throw "exceed the range";
		
		this._nextCol();
		
		if (this._col > this.endCol) {
			this.resetColSize();
			this._col = this.startCol;
			this._rows.move();
		}
	},
	
	/*
	 * iterate to next cell in next row. 
	 * if it's the last cell in this column of the range, move to first cell in next column.
	 */
	/*void*/nextCellByCol: function() {
		if (this._col > this.endCol)
			throw "exceed the range";

		var bLastRow = this._rows.move();
		if ((this._rows._exitOnLastRow && bLastRow) || !this._rows.hasNext()) {
			this._rows.init();
			
			this._nextCol();
		}
	},
	
	/*
	 * get current row index
	 */
	/*int*/getRowIndex: function() {
		// inline this._rows.getIndex()
		return this._rows._row;
	},
	
	/*
	 * get current column index
	 */
	/*int*/getColIndex: function() {
		return this._col;
	},
	
	/*
	 * help utility to improve performance
	 */
	/*boolean*/isEmptyCell: function(cell) {
		if (!cell) return true;
		
		var v = cell._rawValue;
		if(null == v || undefined == v) return true;
		if(typeof v == "string" && v.length == 0) return true;
		return false;
	},
	
	/*void*/reset: function() {
		this._rows.reset();
		this._col = this.startCol;
		this._externData = null;
	}
});

dojo.declare("websheet.model._HNormalRange", websheet.model._Range, {
	CellType: websheet.Constant.CellType,

	_colsModel: [],
	
	// variables
	_rowData: {}, // its format is {1, {s: -1, sIdx: -1, s_rn: -1, c: -1, cIdx: -1, c_rn: -1, noMoreContent: false}
	
	constructor: function(rows, range, data) {
		// FIXME column model should be implemented as one sparse array
		var info = {sheetName: range.sheetName, startRow: range.startRow, endRow: range.endRow, startCol: 1, endCol: 1024};
		this._colsModel = websheet.model.ModelHelper.getCols(info, true, true).data;
		this._rowData = {};
	},

	/*
	 * return the object { cell: valueCellObj, styelCell: styleCellObj, bMasterCell: true, noMoreContent: true, row: rowModel}
	 */
	/*object*/getCell: function(rowModel) {
		if (this._col == this.startCol)
			this.extendColSize(rowModel);
		
		if (!rowModel) return {success: true};
		
		var rIdx = this.getRowIndex() - this._rows.startRow;
		if (!this._rowData[rIdx]) 
			this._rowData[rIdx] = {s: -1, sIdx: -1, s_rn: -1, c: -1, cIdx: -1, c_rn: -1, noMoreContent: false, row: rowModel};
		
		var data = this._rowData[rIdx];
		var s = data.s; // current style index in style cell array
		var sIdx = data.sIdx; // the start column index for current style
		var s_rn = data.s_rn; // the remaining repeated number for current style
		var c = data.c; // current coverInfo index in coverInfo array
		var cIdx = data.cIdx; // the start column index for current coverInfo
		var c_rn = data.c_rn; // the remaining repeated number for current coverInfo (a.k.a colspan)
		var hasStyle = true;
		var hasValueCell = true;
		var hasCoverInfo = true;

		var styleCell, coverInfo;
		if (s == -1) {
			if (this._col != 1 && rowModel._styleCells.length > 0) { // this range doesn't start with column A
				var pos = rowModel.getCellPosition(this._col);
				if (pos < 0) pos = -(pos + 1);
				s = data.s = pos;
				styleCell = rowModel._styleCells[s];
				if (styleCell) {
					if (sIdx == -1) sIdx = data.sIdx = styleCell.getCol();
					if (s_rn == -1) s_rn = data.s_rn = (sIdx < this._col ? sIdx : this._col) + styleCell._repeatednum - this._col + 1;
				}
			} else
				s = data.s = 0;
		}
		if (s < rowModel._styleCells.length) {
			styleCell = rowModel._styleCells[s];
			if (sIdx == -1) sIdx = data.sIdx = styleCell.getCol();
			if (s_rn == -1) s_rn = data.s_rn = styleCell._repeatednum + 1;
		} else {
			hasStyle = false;
		}

		if (c == -1) {
			if (this._col != 1 && rowModel._coverInfos.length > 0) { // this range doesn't start with column A
				var pos = rowModel.getCellPosition(this._col, true, this.CellType.COVERINFO);
				if (pos < 0) pos = -(pos + 1);
				c = data.c = pos;
				coverInfo = rowModel._coverInfos[c];
				if (coverInfo) {
					if (cIdx == -1) cIdx = data.cIdx = coverInfo.getCol();
					if (c_rn == -1) c_rn = data.c_rn = (cIdx < this._col ? cIdx : this._col) + coverInfo._repeatednum - this._col + 1;
				}
			} else
				c = data.c = 0;
		}
		if (c < rowModel._coverInfos.length) {
			coverInfo = rowModel._coverInfos[c];
			if (cIdx == -1) cIdx = data.cIdx = coverInfo.getCol();
			if (c_rn == -1) c_rn = data.c_rn = coverInfo._repeatednum + 1;
		} else {
			hasCoverInfo = false;
		}
		
		if (this._col > rowModel._valueCells.length)
			hasValueCell = false;
		
		if (styleCell) {
			if (sIdx <= this._col && (sIdx + styleCell._repeatednum >= this._col)) {
				if (s_rn > 0) {
					// still have this style
					--data.s_rn; --s_rn;
				}
				if (s_rn == 0) {
					// move to next style cell
					++data.s; ++s;
					// reset
					data.sIdx = data.s_rn = -1;
					sIdx = s_rn = -1;
				}
			} else
				styleCell = null;
		}
		
		if (!data.noMoreContent && !(hasValueCell || hasCoverInfo)) {
			var obj = {row: rowModel};
			if (hasStyle) {
				if (styleCell) {
					obj.styleCell = styleCell;
					if (s_rn != -1) {
						obj.rn = s_rn;
					}
				}
			} else {
				data.noMoreContent = true;
			}
			return {success: true, cell: obj};
		}

		var bMasterCell = false;
		if (coverInfo) {
			if (cIdx <= this._col && (cIdx + coverInfo._repeatednum >= this._col)) {
				if (c_rn > 0) {
					if (c_rn == coverInfo._repeatednum + 1) {
						bMasterCell = true;
					}
					// still have coverInfo
					--data.c_rn; --c_rn;
				}
				if (c_rn == 0) {
					// move to next coverInfo
					++data.c; ++c;
					// reset
					data.cIdx = data.c_rn = -1;
					cIdx = c_rn = -1;
				}
			} else
				coverInfo = null;
		}
		
		var cell = rowModel._valueCells[this._col - 1];
		var obj = {row: rowModel};
		if (cell) obj.cell = cell;
		if (styleCell) obj.styleCell = styleCell;
		if (bMasterCell) {
			obj.bMultiRowMaster = (coverInfo._rowSpan > 1);
			obj.bMultiColMaster = (coverInfo._colSpan > 1);
		}
		
		return {success: true, cell: obj};
	},
	
	/*void*/reset: function() {
		this.inherited(arguments);
		
		this._rowData = {};
		this._colsModel = [];
	}
});

dojo.declare("websheet.model._NormalRange", websheet.model._HNormalRange, {

	// variables
	startColBak: -1, // FIXME why not use startCol2 and endCol2?
	endColBak: -1,
	_colData: {}, // its format is {1, {c: -1, cIdx: -1, c_rn: -1, col: -1, masterCell: null, prevRow: -1}
	_masterRows: {}, // cache the master rows that are invisible
	
	constructor: function(rows, range, data) {
		this._colData = {}; // {1: {c: -1, cIdx: -1, c_rn: -1, col: -1, masterCell: null, prevRow: -1}}
		this._masterRows = {}; // {1: rowModel}
		this.startColBak = this.startCol;
		this.endColBak = this.endCol;
	},
	
	/*
	 * return the object { cell: valueCellObj, styelCell: styleCellObj, coverInfo: coverInfoObj, isCovered: true, masterCell: obj }
	 */
	/*object*/getCell: function(rowModel) {
		var ret = this.inherited(arguments);
		
		var colModel = this._colsModel[this._col - 1];
		if (!colModel || colModel._coverInfos.length == 0) return ret;
		if (this._col < this.startColBak || this._col > this.endColBak) return ret;
		
		var idx = this._col - this.startColBak;
		if (!this._colData[idx])
			this._colData[idx] = {c: -1, cIdx: -1, c_rn: -1, col: -1, masterCell: null, prevRow: -1};

		var row = this.getRowIndex();
		var data = this._colData[idx];
		var c = data.c; // current coverInfo index in coverInfo array
		var cIdx = data.cIdx; // the start row index for current coverInfo
		var c_rn = data.c_rn; // the remaining repeated number for current coverInfo (a.k.a rowspan)
		var col = data.col; // the start column index for current coverInfo
		var prevRow = data.prevRow; // the last row being iterated in this column

		if (c == colModel._coverInfos.length) return ret;
		
		if (c != -1 && row != prevRow + 1 && row > cIdx) {
			// there have hidden rows between the last row and the current row
			var bReset;
			if (c < colModel._coverInfos.length) {
				if (c_rn > 0) {
					// if cIdx > prevRow, the delta is row - cIdx, (there have hidden rows before the coverInfo)
					// if cIdx <= prevRow, the delta is row - prevRow - 1 (there have hidden rows within the coverInfo)
					if (c_rn >= row - (cIdx > prevRow ? cIdx : prevRow + 1)) {
						c_rn = data.c_rn -= row - (cIdx > prevRow ? cIdx : prevRow + 1);
						if (c_rn == 0) {
							// move to next coverInfo
							++data.c; ++c;
							bReset = true;
						}
					} else {
						c = data.c = -1;
						bReset = true;
					}
				} else {
					c = data.c = -1;
				}
				
				if (bReset) {
					data.cIdx = data.c_rn = data.col = -1;
					data.masterCell = null;
					cIdx = c_rn = col = -1;
				}
			}
		}
		data.prevRow = row;

		var coverInfo, masterCell;
		if (c == -1) {
			if (row != 1 && colModel._coverInfos.length > 0) { // this range doesn't start with first row
				var pos = colModel.getCoverCellPosition(row, true);
				if (pos < 0) pos = -(pos + 1);
				c = data.c = pos;
				coverInfo = colModel._coverInfos[c];
				if (coverInfo) {
					if (cIdx == -1) cIdx = data.cIdx = coverInfo.getRow();
					if (col == -1) col = data.col = coverInfo.getCol();
					if (c_rn == -1) c_rn = data.c_rn = (cIdx < row ? cIdx : row) + coverInfo._rowSpan - row;
				}
			} else
				c = data.c = 0;
		}
		
		if (c < colModel._coverInfos.length) {
			coverInfo = colModel._coverInfos[c];
			if (cIdx == -1) cIdx = data.cIdx = coverInfo.getRow();
			if (col == -1) col = data.col = coverInfo.getCol();
			if (c_rn == -1) c_rn = data.c_rn = coverInfo._rowSpan;
		}
		
		var bMasterCell = false;
		if (coverInfo) {
			if (cIdx <= row && ((cIdx + coverInfo._rowSpan -1) >= row)) {
				if (c_rn > 0) {
					var colModel, cell, styleCell;
					if (cIdx != row) {
						rowModel = null; // reset it
						if (cIdx >= this._rows.startRow) {
							var rIdx = cIdx - this._rows.startRow;
							if (this._rowData[rIdx])
								rowModel = this._rowData[rIdx].row; // the master row in visible area
							else {
								if (!this._masterRows[cIdx]) // use the cached master row
									this._masterRows[cIdx] = this._rows._sheet.getRow(cIdx); // the master row isn't invisible
								rowModel = this._masterRows[cIdx];
							}
						} else {
							if (!this._masterRows[cIdx]) // use the cached master row
								this._masterRows[cIdx] = this._rows._sheet.getRow(cIdx); // the master row isn't invisible
							rowModel = this._masterRows[cIdx];
						}
					}
					if (c_rn == coverInfo._rowSpan) {
						bMasterCell = col == this._col;
						if (!bMasterCell) {
							if (rowModel) {
								cell = rowModel._valueCells[col - 1];
								styleCell = rowModel.getCell(col, this.CellType.STYLE, true);
							}
						} else {
							var obj = ret.cell;
							if (obj) {
								cell = obj.cell;
								styleCell = obj.styleCell;
							}
						}
						data.masterCell = {masterCol: col, masterRow: cIdx};
						if (cell) data.masterCell.cell = cell;
						if (styleCell)
							data.masterCell.styleCell = styleCell;
						else {
							colModel = this._colsModel[col - 1];
							if (colModel && colModel._styleId)
								data.masterCell.columnStyleId = colModel._styleId;
						}
					} else {
						if (!data.masterCell) {
							// need to get master cover cell here in case the master cover cell is not in visible area
							if (rowModel) {
								cell = rowModel._valueCells[col - 1];
								styleCell = rowModel.getCell(col, this.CellType.STYLE, true);
							}
							data.masterCell = {masterCol: col, masterRow: cIdx};
							if (cell) data.masterCell.cell = cell;
							if (styleCell)
								data.masterCell.styleCell = styleCell;
							else {
								colModel = this._colsModel[col - 1];
								if (colModel && colModel._styleId)
									data.masterCell.columnStyleId = colModel._styleId;
							}
						}
					}
					--data.c_rn; --c_rn;
					masterCell = data.masterCell;
				}
				if (c_rn == 0){
					// move to next coverInfo
					++data.c; ++c;
					// reset
					data.cIdx = data.c_rn = data.col = -1;
					data.masterCell = null;
					cIdx = c_rn = col = -1;
				}
			} else {
				coverInfo = null;
			}
		}
		
		if (coverInfo) {
			var obj = ret.cell;
			if (!ret.cell) obj = ret.cell = {};
			obj.coverInfo = coverInfo;
			
			if (!bMasterCell) {
				obj.isCovered = true;
				obj.masterCell = masterCell;
			}
		}
		
		return ret;
	},
	
	/*void*/reset: function() {
		this.inherited(arguments);
		
		this._colData = {};
		this._masterRows = {};
	}
});

dojo.declare("websheet.model._CFOptimizeRange", websheet.model._NormalRange, {
	constructor: function(rows, range, data) {
	},
	
	/*object*/getCell: function(rowModel) {
			var ret = this.inherited(arguments);
			var colModel = this._colsModel[this._col - 1];
			if (colModel && !colModel._visible)
				return {success: false};
			var obj = ret.cell;
			if(obj && obj.isCovered)
				return {success: false};
			return ret;
		},
});

dojo.declare("websheet.model._RenderRange", websheet.model._NormalRange, {
	
	constructor: function(rows, range, data) {
	},
	
	/*object*/getCell: function(rowModel) {
		var ret = this.inherited(arguments);
		var colModel = this._colsModel[this._col - 1];
		if (colModel && !colModel._visible)
			return {success: false};
		
		var obj = ret.cell;
		if (obj && obj.styleCell) return ret;
		
		if (colModel && colModel._styleId) {
			if (!obj) obj = ret.cell = {row: rowModel};
			obj.columnStyleId = colModel._styleId;
		}
		
		return ret;
	},

	/*void*/reset: function() {
		this.inherited(arguments);
	}
});

dojo.declare("websheet.model._TextMeasureRange", websheet.model._HNormalRange, {
	
	constructor: function(rows, range, data) {
	},
	
	/*object*/getCell: function(rowModel) {
		var ret = this.inherited(arguments);
		var colModel = this._colsModel[this._col - 1];
		if (colModel && !colModel._visible)
			return {success: false};
		
		var obj = ret.cell;
		if (obj && obj.styleCell) return ret;
		
		if (colModel && colModel._styleId) {
			if (!obj) obj = ret.cell = {row: rowModel};
			obj.columnStyleId = colModel._styleId;
		}
		
		return ret;
	},

	/*void*/reset: function() {
		this.inherited(arguments);
	}
});

dojo.declare("websheet.model._CalcRowHeightRange", websheet.model._HNormalRange, {

	// variables
	endCol2: -1, // backup for endCol
	firstNonEmptyCol: -1,
	rowsHeight: null,
	recalculate : false, // set "recalculate" to true will force to iterate all the value cells in each row in all cases;
	
	constructor: function(rows, range, data) {
		this.endCol2 = this.endCol;
		
		for (var i = this.startCol; i <= this.endCol; i++) {
			var colModel = this._colsModel[i - 1];
			if (!colModel || colModel._visible) {
				this.firstNonEmptyCol = i;
				break;
			}
		}
		
		this.rowsHeight = this._externData.heightArray;
		this.recalculate = this._externData.recalculate;
	},

	/*void*/extendColSize: function(rowModel) {
		this.endCol = this.startCol;
		var bAutoHeight = !(rowModel && rowModel._height != null);
		var height = this.rowsHeight && this.rowsHeight[this.getRowIndex() - 1];
		if (!this.recalculate && (!bAutoHeight || height != null))
			; // the row height is available already
		else {
			if (rowModel) {
				// ignore those non-empty cells in hidden columns
				for (var i = rowModel._valueCells.length - 1; i >= 0; --i) {
					if (!this.isEmptyCell(rowModel._valueCells[i])) {
						var colModel = this._colsModel[i];
						if (!colModel || colModel._visible) {
							this.endCol = i + 1;
							break;
						}
					}
				}
			}
		}
		// ensure that first visible cell should be iterated into once
		if (this.endCol < this.firstNonEmptyCol) 
			this.endCol = this.firstNonEmptyCol;
	},

	/*void*/resetColSize: function() {
		this.endCol = this.endCol2;
	},
	
	/*object*/getCell: function(rowModel) {
		var ret = this.inherited(arguments);
		if (!ret.success) return ret;
		// don't iterate into first visible empty cell if there has other non-empty cell in this row
		if (!(this._col == this.firstNonEmptyCol && this._col == this.endCol)) {
			var obj = ret.cell;
			if (this.isEmptyCell(obj ? obj.cell : null))
				return {success: false};
		}
		
		// the same code as websheet.model._RenderRange
		var colModel = this._colsModel[this._col - 1];
		if (colModel && !colModel._visible)
			return {success: false};
		
		var obj = ret.cell;
		if (obj && obj.styleCell) return ret;
		
		if (colModel && colModel._styleId) {
			if (!obj) obj = ret.cell = {row: rowModel};
			obj.columnStyleId = colModel._styleId;
		}
		
		return ret;
	},
	
	/*void*/reset: function() {
		this.inherited(arguments);
		
		this.endCol = this.endCol2;
		this.endCol2 = this.firstNonEmptyCol = -1;
		this.rowsHeight = null;
		this.recalculate = false;
	} 
});

dojo.declare("websheet.model._ExtendRenderRange", websheet.model._RenderRange, {
	
	MaxNumOfVisibleCols: 100, // configurable, look ahead or after the maximum number of visible columns
	
	// variables
	startCol2: -1, // backup for startCol
	endCol2: -1, // backup for endCol
	firstVisibleCol: -1,
	lastVisibleCol: -1,
	cfRanges: null,
	cfStyleMgr: null,
	
	constructor: function(rows, range, data) {
		this.startCol2 = this.startCol;
		this.endCol2 = this.endCol;
		
		for (var i = this.startCol; i <= this.endCol; i++) {
			var colModel = this._colsModel[i - 1];
			if (!colModel || colModel._visible) {
				this.firstVisibleCol = i;
				break;
			}
		}

		if (this.firstVisibleCol != -1) {
			for (var i = this.endCol; i >= this.startCol; i--) {
				var colModel = this._colsModel[i - 1];
				if (!colModel || colModel._visible) {
					this.lastVisibleCol = i;
					break;
				}
			}
		}
		this.cfRanges = data && data.cfRanges;
		this.cfStyleMgr = websheet.model.ModelHelper.getDocumentObj()._getStyleManager().getCFStyleMgr();
	},

	// extend column range for textover support
	// if first visible cell or last visible cell is empty, need to check whether extend or not
	// it will extend to first string cell and will ignore any hidden cells
	/*void*/extendColSize: function(rowModel) {
		if (!rowModel) return;
		if (this.firstVisibleCol == -1) return;
		
		var cell = rowModel._valueCells[this.firstVisibleCol - 1];
		var length = rowModel._valueCells.length;
		var hasCoverInfo = rowModel._coverInfos.length != 0;
		var count = 0;
		if (this.isEmptyCell(cell)) {
			// set this.startCol and this._col dynamically
			for (var i = this.firstVisibleCol - 1; i >= 1 && count < this.MaxNumOfVisibleCols; i--) {
				var colModel = this._colsModel[i - 1];
				if (colModel && !colModel._visible)
					continue;
				++count;
				cell = rowModel._valueCells[i - 1];
				if (cell && !this.isEmptyCell(cell)) {
					if (cell.isString()) {
						var pos = hasCoverInfo ? rowModel.getCellPosition(i, true, this.CellType.COVERINFO) : -1;
						if (pos < 0) // ignore the master coverInfo cell
							this._col = this.startCol = i;
					}
					break;
				}
			}
		}
		
		if (this.lastVisibleCol > length) return;
		
		cell = rowModel._valueCells[this.lastVisibleCol - 1];
		if (this.isEmptyCell(cell)) {
			// set this.endCol dynamically
			for (var i = this.lastVisibleCol + 1, count = 0; i <= length && count < this.MaxNumOfVisibleCols; ++i) {
				var colModel = this._colsModel[i - 1];
				if (colModel && !colModel._visible)
					continue;
				++count;
				cell = rowModel._valueCells[i - 1];
				if (cell && !this.isEmptyCell(cell)) {
					if (cell.isString()) {
						var pos = hasCoverInfo ? rowModel.getCellPosition(i, true, this.CellType.COVERINFO) : -1;
						if (pos < 0) // ignore the master coverInfo cell
							this.endCol = i;
					}
					break;
				}
			}
		}
	},
	
	/*void*/resetColSize: function() {
		this.startCol = this.startCol2;
		this.endCol = this.endCol2;
	},
	
	/*object*/getCell: function(rowModel) {
		var ret = this.inherited(arguments);
		if (!ret.success) return ret;

		// ignore all empty cells in the extended range
		if (this._col < this.startCol2 || this._col > this.endCol2) {
			if (!ret.cell)
				return {success: false};
		}

		// calc Conditional Format Style ID here		
		var cell = ret.cell;
		if(this.cfRanges && this.cfRanges.length > 0) {
			if (cell) {
				var styleCell = cell.styleCell;
				var columnStyleId = cell.columnStyleId;
				var styleId = styleCell ? styleCell._styleId : columnStyleId;					
				// generate the StyleCode, addStyle in document styleManager and record the id map in CFStyleManager
				var cfStyleId = this.cfStyleMgr.generateStyle(styleId, this.cfRanges, this.getRowIndex(), this.getColIndex());
				if(cfStyleId) {
					cell.cfStyleId = cfStyleId; // this ID can be used to get StyleCode from document styleManager
					if (cell.cell && (cell.bMultiColMaster || cell.bMultiRowMaster)) {
						cell.cell.cfStyleId = cfStyleId;
					}
				}
				else
				{
					if (cell.cell && cell.cell.cfStyleId)
						delete cell.cell.cfStyleId;
				}
			}
			else {
				var cfStyleId = this.cfStyleMgr.generateStyle(null, this.cfRanges, this.getRowIndex(), this.getColIndex());
				if (cfStyleId) {
					ret.cell = {};
					ret.cell.isBlank = true;
					ret.cell.cfStyleId = cfStyleId;
				}
			}
		}
		
		return ret;
	},
	
	/*void*/reset: function() {
		this.inherited(arguments);
		
		this.startCol = this.startCol2;
		this.endCol = this.endCol2;
		this.startCol2 = this.endCol2 = -1;
		this.firstVisibleCol = this.lastVisibleCol = -1;
	}
});

dojo.declare("websheet.model._SortRange", websheet.model._NormalRange, {	
	// variables
	endCol2: -1, // backup for endCol
	colDelta: 1,
	
	constructor: function(rows, range, data) {
		this.endCol2 = this.endCol;
		this.colDelta = 1;
	},
	
	/*void*/resetColSize: function() {
		this.endCol = this.endCol2;
	},

	/*
	 * move to next column
	 */
	/*void*/_nextCol: function() {
		this._col += this.colDelta;
	},

	/*object*/getCell: function(rowModel) {
		this.colDelta = 1;
		var ret = this.inherited(arguments);
		if (!ret.success) return ret;
		
		var rIdx = this.getRowIndex() - this._rows.startRow;
		var data = this._rowData[rIdx];
		// ensure each row can be at least iterated into once
		if (this._col != this.startCol && data && data.noMoreContent) {
			this.endCol = this._col;
			return {success: false};
		}
		
		return ret;
	},
	
	/*void*/reset: function() {
		this.inherited(arguments);
		
		this.endCol = this.endCol2;
		this.endCol2 = -1;
		this.colDelta = 1;
	}
	
});

dojo.declare("websheet.model._MixedRange", websheet.model._NormalRange, {
	
	// variables
	endCol2: -1, // backup for endCol
	colDelta: 1,
	
	constructor: function(rows, range, data) {
		this.endCol2 = this.endCol;
		this.colDelta = 1;
	},
	
	/*void*/resetColSize: function() {
		this.endCol = this.endCol2;
	},

	/*
	 * move to next column
	 */
	/*void*/_nextCol: function() {
		this._col += this.colDelta;
	},

	/*object*/getCell: function(rowModel) {
		this.colDelta = 1;
		var ret = this.inherited(arguments);
		if (!ret.success) return ret;
		
		var rIdx = this.getRowIndex() - this._rows.startRow;
		var data = this._rowData[rIdx];
		// ensure each row can be at least iterated into once
		if (this._col != this.startCol && data && data.noMoreContent) {
			this.endCol = this._col;
			return {success: false};
		}
		
		var obj = ret.cell;
		var cell = obj && obj.cell;
		var styleCell = obj && obj.styleCell;
		var coverInfo = obj && obj.coverInfo;
		var isCovered = obj && obj.isCovered;
		var rn = obj && obj.rn;
		
		if (cell) {
			delete cell._styleId;
			delete cell._colSpan;
			delete cell._rowSpan;
		}
		
		if (styleCell) {
			if (!cell) {
				var id = this._rows._sheet._parent._idManager.getColIdByIndex(this._rows._sheet._id, this._col - 1, true);
				cell = new websheet.model.Cell(rowModel, id);
			}
			cell.mixin(styleCell);
			delete cell._repeatednum;
			// there has repeated empty cells with the same style, set its repeated number 
			if (rn) {
				cell._repeatednum = rn;
				this.colDelta = rn + 1;
				
				// move to next style cell
				// FIXME better to make this change in the websheet.model._HNormalRange
				++data.s;
				// reset
				data.sIdx = data.s_rn = -1;
			}
		}

		if (coverInfo) {
			var id = this._rows._sheet._parent._idManager.getColIdByIndex(this._rows._sheet._id, this._col - 1, true);
			if (!isCovered) {
				if (!cell) cell = new websheet.model.Cell(rowModel, id);
				cell.mixin(coverInfo);
			} else {
				cell = new websheet.model.Cell(rowModel, id);
				if (styleCell)
					cell.mixin(styleCell);
				cell._isCovered = true;
			}
			delete cell._repeatednum;
		}
		
		var obj = {cell: cell, row: rowModel};
		return {success: true, cell: obj};
	},
	
	/*void*/reset: function() {
		this.inherited(arguments);
		
		this.endCol = this.endCol2;
		this.endCol2 = -1;
		this.colDelta = 1;
	}
	
});

dojo.declare("websheet.model._ValueRange", websheet.model._Range, {
	
	constructor: function(rows, range, data) {
	},

	/*
	 * get the value cell from _valueCells
	 */
	/*cell*/getCell: function(rowModel) {
		var cell = rowModel ? rowModel._valueCells[this._col - 1] : null;
		return {success: true, cell: cell};
	}
});

dojo.declare("websheet.model._OptimizeValueRange", websheet.model._Range, {
	
	// variables
	startCol2: -1, // backup for startCol
	endCol2: -1, // backup for endCol
	bExtendColumn: true, // don't extend for single column
	
	constructor: function(rows, range, data) {
		this.startCol2 = this.startCol;
		this.endCol2 = this.endCol;
		this.bExtendColumn = this.startCol != this.endCol;
	},
	
	/*void*/extendColSize: function(rowModel) {
		var length = Math.min(this.endCol, rowModel._valueCells.length);
		var index = this.startCol;
		for (; index <= length; ++index) {
			var cell = rowModel._valueCells[index - 1];
			if (cell) {
				this._col = this.startCol = index;
				break;
			}
		}
		
		this.endCol = this.startCol;
		for (var i = length; i > index; --i) {
			var cell = rowModel._valueCells[i - 1];
			if (cell) {
				this.endCol = i;
				break;
			}
		}
	},
	
	/*void*/resetColSize: function() {
		this.startCol = this.startCol2;
		this.endCol = this.endCol2;
	},
	
	/*
	 * get the value cell from _valueCells
	 */
	/*object*/getCell: function(rowModel) {
		if (this.bExtendColumn) {
			if (this._col == this.startCol)
				this.extendColSize(rowModel);
		}
		
		var cell = rowModel._valueCells[this._col - 1];
		if (!cell) return {success: false};
		
		return {success: true, cell: cell};
	},
	
	/*void*/reset: function() {
		this.inherited(arguments);

		this.startCol = this.startCol2;
		this.endCol = this.endCol2;
		this.bExtendColumn = false;
	}
});

dojo.declare("websheet.model._CFOptimizeValueRange", websheet.model._OptimizeValueRange, {
	
	_colsModel: [],
	
	constructor: function(rows, range, data) {
		this.inherited(arguments);
		var info = {sheetName: range.sheetName, startRow: range.startRow, endRow: range.endRow, startCol: 1, endCol: 1024};
		this._colsModel = websheet.model.ModelHelper.getCols(info, true, true).data;	
	},
	
	/*object*/getCell: function(rowModel) {
			var ret = this.inherited(arguments);
			var colModel = this._colsModel[this._col - 1];
			if (colModel && !colModel._visible)
				return {success: false};
			return ret;
		},
		
	reset: function()
	{
		this.inherited(arguments);
		this._colsModel = [];
	}
});

/**
 * iterate the value cells and return instance with mixing it's style cell 
 */
dojo.declare("websheet.model._StyledValueRange", websheet.model._OptimizeValueRange, {
	_scis: {}, // current indexes in _styleCells for rows, the row index is the key in the map
	
	constructor: function(rows, range, data) {	
	},

	/*
	 * get the value cell and mixed it with stylecell from _valueCells/_styleCells
	 */
	/*cell*/getCell: function(rowModel) {
		var ret = this.inherited(arguments);
		if (!ret.success) return ret;
		
		var c = ret.cell;					
		if (c && !c._styleId)
		{			
			if (rowModel && rowModel._styleCells)
			{	// do it if really need mix the style cell			
				var ci = c.getCol();
				var ri =rowModel.getIndex();
				var sci = this._scis[ri];
				if (sci == undefined || sci == null)
				{// init the style cell index in this row
					this._scis[ri] = this._initStyleCellIndex(rowModel, ci);
				}
				
				// get style cell
				var sc = this._getStyleCell(rowModel._styleCells, ri, ci);
				if (sc)
				{
					c.mixin(sc);
				}								
			}
		}		
		return ret;
	},
	
	/*int*/_initStyleCellIndex: function(rowModel, ci)
	{
		var helper = rowModel._doc._mhelper;
		var pos = helper.binarySearch(rowModel._styleCells,ci,helper.equalCondition,"",true,rowModel._parent._id,websheet.Constant.Column);
		if(pos <= -1){// if does not match, uses the low value for start index
			pos = -(pos + 1);
		}
		return pos;
	},
	
	/*void*/_resetStyleIndex: function()
	{
		this._scis = {};
	},
	
	/**
	 * 
	 * @param styleCells
	 * @param ri, row index
	 * @param ci, cell index
	 * @returns
	 */
	/*cell*/_getStyleCell: function(styleCells, ri, ci)
	{
		var sci = this._scis[ri];
		var sc = styleCells[sci];
		while(sc)
		{				
			var si = sc.getCol();
			var ei = sc._repeatednum ? si + sc._repeatednum : si; 
			if ( ci >= si && ci <=ei )				
			{
				return sc;
			}
			else
			{
				this._scis[ri] = ++sci;
				sc = styleCells[sci];
			}
		}		
		return null;
	},
	
	/*void*/reset: function() {
		this.inherited(arguments);
		this._resetStyleIndex();
	}
});

dojo.declare("websheet.model.RangeIterator", null, {
	_range: null,
	_bColumn: false, // iterate by column
	constructor: function(/*websheet.model.Range or range info*/range, type, bColumn, data) {
		if (typeof range == websheet.model._Range) {
			this._range = range;
			this._range.reset();
		} else {
			this.startRow = range.startRow;
			var IterType = websheet.Constant.RangeIterType;
			if (type == undefined) type = IterType.VALUE;
			var rows;
			if (type == IterType.OPTIMIZEVALUE || type == IterType.MIXED || type == IterType.TEXTMEASURE || type == IterType.CHECKSORTRANGE || type == IterType.STYLEDVALUE || type == IterType.CFOPTIMIZEVALUE)
				rows = new websheet.model._RowBase(range, type);
			else
				rows = new websheet.model._Row(range, type);
			switch (type) {
			case IterType.CHECKSORTRANGE:
				this._range = new websheet.model._SortRange(rows, range, data);
				break;
			case IterType.NORMAL:
				this._range = new websheet.model._NormalRange(rows, range, data);
				break;
			case IterType.MIXED:
				this._range = new websheet.model._MixedRange(rows, range, data);
				break;
			case IterType.TEXTMEASURE:
				this._range = new websheet.model._TextMeasureRange(rows, range, data);
				break;
			case IterType.EXTENDRENDER:
				this._range = new websheet.model._ExtendRenderRange(rows, range, data);
				break;
			case IterType.CFOPTIMIZE:
				this._range = new websheet.model._CFOptimizeRange(rows, range, data);
				break;
			case IterType.CFOPTIMIZEVALUE:
				this._range = new websheet.model._CFOptimizeValueRange(rows, range, data);
				break;				
			case IterType.CALCROWHEIGHT:
				this._range = new websheet.model._CalcRowHeightRange(rows, range, data);
				break;
			case IterType.OPTIMIZEVALUE:
				this._range = new websheet.model._OptimizeValueRange(rows, range, data);
				break;	
			case IterType.STYLEDVALUE:
				this._range = new websheet.model._StyledValueRange(rows, range, data);
				break;					
			case IterType.VALUE:
			default:
				this._range = new websheet.model._ValueRange(rows, range, data);
				break;
			}
		}
		this._bColumn = bColumn;
	},
	
	/*
	 * get next cell in current row,
	 */
	/*object*/_nextByRow: function() {
		var range = this._range;
		var o = range.getRow();
		if (!o) return null;
		
		var ret = range.getCell(o.row);
		if (ret.success) {
			ret.row = range.getRowIndex();
			ret.col = range.getColIndex();
		}
		range.nextCellByRow();
		return ret;
	},
	
	/*
	 * get next cell in current column,
	 */
	/*object*/_nextByCol: function() {
		var range = this._range;
		var o = range.getRow();
		var rowModel = o ? o.row : null;
		var	ret = range.getCell(rowModel);
		if (ret.success) {
			ret.row = range.getRowIndex();
			ret.col = range.getColIndex();
		}
		range.nextCellByCol();
		return ret;
	},
	
	/////////////////////////////////////////////
	/////// PUBLIC FUNCTIONS ////////////////////
	/////////////////////////////////////////////
	
	/*object*/next: function() {
		if (!this._bColumn)
			return this._nextByRow();
		else
			return this._nextByCol();
	},
	
	/*
	 * check whether there has any cell available
	 */
	/*boolean*/hasNext: function() {
		return this._range.hasNext();
	},
	
	/*
	 * iterate the range, and execute 'func' for each cell
	 * iterate the range per row by default
	 * 
	 */
	/*void*/iterate: function(/*function*/func) {
		if (!func) return;
		
		while (this.hasNext()) {
			var o = this.next();
			if (o) {
				if (o.success) {
					if (!func(o.cell, o.row, o.col))
						break;
				}
			} else 
				break;
		}
	},
	
	// callback
	/*boolean*/print: function(obj, row, col) {
		var cell = obj && obj.cell;
		var styleCell = obj && obj.styleCell;
		var columnStyleId = obj && obj.columnStyleId;
		var styleId = styleCell ? styleCell._styleId : columnStyleId;
		var doc = websheet.model.ModelHelper.getDocumentObj();
		var styleMgr = doc._getStyleManager();
		var c = "";
		if (cell) {
			c = cell.getShowValue(styleId);
		}
		console.log("row " + row + " col " + col + " : " + c);
		var style = styleMgr.getStyleById(styleId);
		if (style) {
			var css = style.getCssString();
			console.log("    its style is " + css);
		}
		return true;
	}
});