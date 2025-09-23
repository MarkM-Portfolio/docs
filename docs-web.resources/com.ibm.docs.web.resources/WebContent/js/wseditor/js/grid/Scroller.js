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

dojo.provide("websheet.grid.Scroller");
dojo.require("concord.util.browser");
// Module: websheet/canvas/Scroller
// Description:
//		The horizontal scroller and the vertical scroller.

dojo.declare("websheet.grid.Scroller", [], {
	
	firstVisibleRow: 0,
	
	lastVisibleRow: -1,
	
	firstVisibleCol: 1,
	
	lastVisibleCol: -1,
	
	SCROLL_INCREASE_ROW: 5,
	
	SCROLL_INCREASE_COL: 2,
	// when scroll to the last row/column, set the blank area
	BLANK_WIDTH: 20,
	BLANK_HEIGHT: 20,
	
	constructor: function(grid)
	{
		this.grid = grid;
		if (this.firstVisibleRow < this.grid.freezeRow) {
			this.firstVisibleRow = this.grid.freezeRow;
		}
		if (this.firstVisibleCol <= this.grid.freezeCol) {
			this.firstVisibleCol = this.grid.freezeCol + 1;
		}
		this._lastScrollTop = this.scrollLeft = this.scrollTop = 0;
		this.maxRow = grid.editor.getMaxRow();
	},

	isRowInVisibleArea: function (rowIndex) {
		return (rowIndex < this.grid.freezeRow && rowIndex >= 0)||(rowIndex >= this.firstVisibleRow && rowIndex <= this.lastVisibleRow);
	},
	
	isColumnInVisibleArea: function (colIndex) {
		return (colIndex <= this.grid.freezeCol && colIndex > 0)||(colIndex >= this.firstVisibleCol && colIndex <= this.lastVisibleCol);
	},
	
	isRowRangeInVisibleArea: function (startRow, endRow) {
		for (var idx = startRow; idx <= endRow; idx++) {
			if (this.isRowInVisibleArea(idx)) {
				return true;
			}
		}
		return false;
	},
	
	isColRangeInVisibleArea: function (startCol, endCol) {
		for (var idx = startCol; idx <= endCol; idx++) {
			if (this.isColumnInVisibleArea(idx)) {
				return true;
			}
		}
		return false;
	},
	
	publishScrollingEvent: function () {
		this.grid.editor.publishForMobile({"name": "updateVision", "params":[this.getCurrentVision()]});
	},
	
	scrollToRow: function (targetRow) {
		// summary:
		//		Scroll to the given row index, the given index will be set as the first visible row
		if (targetRow < this.grid.freezeRow) {
			targetRow = this.grid.freezeRow;
		}

		if(this.firstVisibleRow != targetRow) {
			// lock the scroll once to prevent onscroll event triggered when scrolling.
			this.grid._scrollLocked = true;
			this.scrollByRow(targetRow);
			this.grid.requestUpdate(true);
			return true;
		}
		return false;
	},
	
	scrollToColumn: function (targetColumn) {
		// summary:
		//		Scroll to the given column, the given column index will be set as the first visible column.
		if (targetColumn <= this.grid.freezeCol) {
			targetColumn = this.grid.freezeCol + 1;
		}
		if(this.firstVisibleCol != targetColumn) {
			this.grid._scrollLocked = true;
			this.scrollByColumn(targetColumn);
			this.grid.requestUpdate(true);
			return true;
		}
		return false;
	},
	
	updateVision: function (vision) {
		// summary:
		//		Update the first visible row/ last visible row / first visible column / last visible column index.
		// Notice:
		//		Row indexes are 0-based while column indexes are 1-based.
		if((vision.fr != null && this.firstVisibleRow != Math.max(0,vision.fr)) || (vision.lr != null && this.lastVisibleRow != vision.lr)){
			var pcm = this.grid.editor.getPartialCalcManager();
			pcm.addCalcVisibleTask();
		}
		(vision.fr != null) && (this.firstVisibleRow = Math.max(0,vision.fr));
		(vision.lr != null) && (this.lastVisibleRow = vision.lr);
		(vision.fc != null) && (this.firstVisibleCol = Math.max(1, vision.fc));
		(vision.lc != null) && (this.lastVisibleCol = vision.lc);
		this.publishScrollingEvent();
	},
	
	scrollByRow: function(firstRow, bNotCalcTop) {
		// summary:
		//		Scroll to the given first row
		// Notice:
		//		Row indexes are 0-based.
		//		!!!Make sure you know the difference between 'scrollByRow' and 'scrollToRow', if you're using 'scrollByRow', you need to starts the 
		//		grid update yourself, if you're in doubt about the difference, 'scrollToRow' is recommended; 
		//		!!scrollByRow is a 'scrollToRow' withouth 'requestUpdate';;
		firstRow = firstRow < this.freezeRow ? this.freezeRow : ( firstRow >= this.maxRow ? this.maxRow -1 : firstRow);
		var grid = this.grid,
			geometry = grid.geometry;
		var calcLastRow = geometry.getLastRowWithFirstRow(firstRow, geometry.getScrollableHeight());
		var lastRow = calcLastRow + this.SCROLL_INCREASE_ROW;
		if (grid._loadingRowIndex != null && lastRow > grid._loadingRowIndex + 10) {
			return;
		}		
		if(lastRow >= this.maxRow - 1)
		{
			lastRow = this.maxRow -1;
			if(lastRow > this.firstVisibleRow)
			{
				if(this.lastVisibleRow > lastRow && firstRow > this.firstVisibleRow)// stop scroll down because scroll to the last row
				{
					return;
				}	
				else 
				{
					if(firstRow > this.firstVisibleRow){
						firstRow = geometry.getFirstRowWithLastRow(lastRow, geometry.getScrollableHeight() - this.BLANK_HEIGHT, true);
						if(firstRow != this.firstVisibleRow)
							bNotCalcTop = false;
						else
							bNotCalcTop = true;
					}
				}	
			}	
		}
		if (!bNotCalcTop) {
			if (firstRow == grid.freezeRow) {
				this.scrollTop = 1;
			} else {
				this.scrollTop = geometry.rowHeight(grid.freezeRow, firstRow);
			}
		}
		this.firstVisibleRow = firstRow;
		this.updateRowCount(lastRow+1);
		if (!grid._dragScrolling) {
			grid.vScrollNode.scrollTop = this.scrollTop;
			if(grid.vScrollNode.scrollTop != this.scrollTop) {
				// it means that scrollHeight is not accurate right now 
				// if not recalc the scrollHeight, scroll down will make the first visible row decrease
				this.updateScrollHeight();
				grid.vScrollNode.scrollTop = this.scrollTop;
			}
		}
		//grid.editor.getPartialCalcManager().calcVisibleFormula();
		this.endScroll();
	},
	
	setScrollTop: function(top) {
		var topObj = {top: top};
		var firstRow = this.getFirstVisibleRowByScrollTop(topObj);
		if(!pe.scene.bMobileBrowser) {
			// this._lastScrollTop is updated by grid.vScrollNode.scropTop
			// while for mobile, vScrollNode is invisible, so the value is always 0
			if (top > this._lastScrollTop) {
				// currently scrolling down;
				if (firstRow < this.firstVisibleRow) {
					// to prevent trembling
					return;
				}
			} else if (top < this._lastScrollTop) {
				if (firstRow > this.firstVisibleRow) {
					return;
				}
			}
		}
		this.scrollTop = topObj.top;
		this.scrollByRow(firstRow, true);
		this.grid.requestUpdate(true);
	},
	
	getCurrentVision: function () {
		// summary:
		//		Returns a packge contains current vision boundary indexes;
		// include at least followings:
		//		firstVisibleRow,
		//		lastVisibleRow,
		//		firstVisibleCol,
		//		lastVisibleCol
		return {
			sheetName : this.grid.sheetName,
			fr : this.firstVisibleRow + 1,
			lr : this.lastVisibleRow + 1,
			fc : this.firstVisibleCol,
			lc : this.lastVisibleCol,
			scrollLeft: this.scrollLeft,
			scrollTop: this.scrollTop
		};
	},
	
	getFirstVisibleRowByScrollTop: function(topObj) {
		// summary:
		//		According to the scrollTop to calculate the first visible row
		var contentHeight;
		var geometry = this.grid.geometry;
		if(this.rowCount == this.maxRow 
				&& this.scrollHeight > (contentHeight = geometry.getScrollableHeight())
				&& topObj.top + contentHeight > this.scrollHeight)
			topObj.top = this.scrollHeight - contentHeight;
		if( topObj.top <= 0)
			topObj.top = 1;
		return geometry.getLastRowWithFirstRow(this.grid.freezeRow, topObj.top);
	},
	
	// 1-based
	updateRowCount: function(rowNum) {
		// summary:
		//		Update the scrollHeight according to the updated row count
		var delta = 0;
		if(rowNum >= this.maxRow) {
			rowNum = this.maxRow;
			delta = this.BLANK_HEIGHT;
		}
		var node = this.grid.vScrollNode;
		var scrollMax = node.scrollHeight - node.clientHeight;
		if(rowNum > this.rowCount || (this.scrollTop > scrollMax * 0.8) || (this.rowCount - rowNum < 10))
		{
			if (rowNum < this.rowCount) {
				rowNum = Math.min(this.maxRow, this.rowCount + 15);
			}
			var grid = this.grid;
			delta += grid.geometry.rowHeight(this.rowCount, rowNum-1);
			while (delta == 0 && rowNum < this.maxRow) {
				rowNum += 5;
				delta += grid.geometry.rowHeight(this.rowCount, rowNum-1);
			}
			this.rowCount = rowNum;
			this.updateScrollHeight(delta + this.scrollHeight);
		}	
	},
	
	updateScrollHeight: function(h) {
		if(!h)
			h = this.calcScrollHeight();
		
		this.scrollHeight = h;
		
		var node = this.grid.vScrollNode.children[0];
		if(h >= 0){
			var geo = this.grid.geometry;
			h += geo.GRID_HEADER_HEIGHT;
			if (this.grid.freezeRow > 0) {
				h += geo.getFreezeHeight();
			}
			var s = node.style;
			if(node && s['height'] != h){
				s['height'] = h + 'px';
				if (this.grid.editor.isMobile()) {
					var mainSheetNode = dojo.byId("mainNode");
					dojo.style(mainSheetNode, {height: h + 'px'});
				}
			}
		}
	},
	
	calcScrollHeight: function(){
		var grid = this.grid;
		var delta = 0;
		if(this.rowCount == null) {
			this.rowCount = websheet.Constant.MinRowIndex;
			var initMaxRowIndex = grid.editor.getDocumentObj().getSheet(grid.sheetName).initMaxRowIndex;
			if (initMaxRowIndex > this.rowCount){
				if(initMaxRowIndex < this.maxRow)
					this.rowCount = initMaxRowIndex;
				else{
					this.rowCount = this.maxRow;
					delta = this.BLANK_HEIGHT;
				}
			}
		}
		var h = grid.geometry.rowHeight(0, this.rowCount) + delta;
		return h;
	},
	
	endScroll: function () {
		if (this.grid.isLoadingRowVisible()) {
			this.grid.setLoadingOverlay();
		} else if (this.grid._bOverlay) {
			// if the grid still showing the loading overlay, hide it
			this.grid.setLoadingOverlay();
		}
		this.grid.hideLinkDiv();
		if (!this.grid.isEditing()) {
			this.grid.focus();
		}
		this._lastScrollTop = this.grid.vScrollNode.scrollTop;
		this.grid.accuracyTop = null; // reset this value (used in absolute shape locating);
//		this.publishScrollingEvent();
	},
	
	scrollByColumn:function(firstCol, bNotCalcLeft) {
		// summary:
		//		Scroll to the given first col
		// Notice:
		//		col indexes are 1-based.
		//		!!!Make sure you know the difference between 'scrollByColumn' and 'scrollToColumn', if you're using 'scrollByColumn', you need to starts the 
		//		grid update yourself, if you're in doubt about the difference, 'scrollToColumn' is recommended; 
		//		!!ScrollByColumn is a 'scrollToColumn' withouth 'requestUpdate';;
		var MAXCOL = websheet.Constant.MaxColumnIndex,
			grid = this.grid,
			geometry = grid.geometry;
		firstCol = firstCol <= this.freezeCol ? this.freezeCol + 1 : ( firstCol > MAXCOL ? MAXCOL : firstCol);
		var calcLastCol = geometry.getLastColumnWithFirstColumn(firstCol, geometry.getScrollableWidth());
		var lastCol = calcLastCol + this.SCROLL_INCREASE_COL;
		if(lastCol > MAXCOL)
		{
			lastCol = MAXCOL;
			if(lastCol > this.firstVisibleCol)
			{
				if(this.lastVisibleCol > lastCol && firstCol > this.firstVisibleCol)// stop scroll right because scroll to the last row)
				{
					return;
				}	
				else 
				{
					if(firstCol > this.firstVisibleCol) {
						firstCol = geometry.getFirstColumnWithLastColumn(lastCol, geometry.getScrollableWidth() - this.BLANK_WIDTH, true);
						if(firstCol != this.firstVisibleCol)
							bNotCalcLeft = false;
						else
							bNotCalcLeft = true;
					}
				}	
			}	
		}
		if (!bNotCalcLeft) {
			if (firstCol > grid.freezeCol + 1) {
				 this.scrollLeft = (geometry.colWidth(grid.freezeCol + 1, firstCol));
				 if (grid.freezeCol > 0) {
					 this.scrollLeft += geometry.getFreezeWidth();
				 }
			} else {
				this.scrollLeft = 1;
			}
		}
		this.firstVisibleCol = firstCol;
		this.updateColCount(lastCol);
		if(this.grid.isMirrored && !dojo.isIE) {
			if(dojo.isFF)
				grid.hScrollNode.scrollLeft = -1*this.scrollLeft;
			else if(!bNotCalcLeft)
				grid.hScrollNode.scrollLeft = this.scrollWidth - this.grid.geometry.getGridWidth() - grid.hScrollNode.scrollLeft;
		} else {
			grid.hScrollNode.scrollLeft = this.scrollLeft;
		}
		//grid.editor.getPartialCalcManager().calcVisibleFormula();
		this.endScroll();
	},
	
	setScrollLeft: function(left) {
		if(this.grid.isMirrored && !dojo.isIE && !dojo.isFF) {
			left = this.scrollWidth - this.grid.geometry.getGridWidth() - left;
		}
		var leftObj = {left: left};
		var firstCol = this.getFirstVisibleColByScrollLeft(leftObj);
		this.scrollLeft = leftObj.left;
		this.scrollByColumn(firstCol, true);
		this.grid.requestUpdate(true);
	},
	
	getFirstVisibleColByScrollLeft: function(leftObj) {
		// summary:
		//		According to the scrollLeft to calculate the first visible col
		var contentWidth;
		var geometry = this.grid.geometry;
		if (this.colCount == websheet.Constant.MaxColumnIndex && 
				this.scrollWidth > (contentWidth = geometry.getScrollableWidth()) && leftObj.left + contentWidth > this.scrollWidth) {
			leftObj.left = this.scrollWidth - contentWidth;
		}
		if (leftObj.left <= 0) {
			leftObj.left = 1;
		}
		return geometry.getLastColumnWithFirstColumn(this.grid.freezeCol + 1, leftObj.left);
	},
	
	updateColCount: function(colNum) {
		// summary:
		//		Update the scrollHeight according to the updated row count
		var MAXCOL = websheet.Constant.MaxColumnIndex;
		var delta = 0;
		if(colNum > MAXCOL) {
			colNum = MAXCOL;
			delta = this.BLANK_WIDTH;
		}
		if(colNum > this.colCount || (this.colCount - colNum < 3 && (colNum = Math.min(MAXCOL, this.colCount + 5))))
		{
			if (this.colCount  < colNum) {
				var grid = this.grid;
				delta += grid.geometry.colWidth(this.colCount + 1, colNum);
				this.colCount = colNum;
				this.updateScrollWidth(delta + this.scrollWidth);
			}
		}	
	},
	
	updateScrollWidth: function(w) {
		if(!w)
			w = this.calcScrollWidth();
		
		this.scrollWidth = w;
		
		var node = this.grid.hScrollNode.children[0];
		if(w >= 0){
			var geo = this.grid.geometry;
			w += geo.GRID_HEADER_WIDTH;
			if (this.grid.freezeCol > 0) {
				w += geo.getFreezeWidth();
			}
			var s = node.style;
			if(node && s['width'] != w){
				s['width'] = w + 'px';
				if (this.grid.editor.isMobile()) {
					var mainSheetNode = dojo.byId("mainNode");
					dojo.style(mainSheetNode, {width: w + 'px'});
				}
			}
		}
	},
	
	calcScrollWidth: function(){
		var grid = this.grid;
		var delta = 0;
		if(this.colCount == null) {
			this.colCount = Math.max(websheet.Constant.MinColumnIndex, this.lastVisibleCol);
			var initMaxColIndex = grid.editor.getDocumentObj().getSheet(grid.sheetName).initMaxColIndex;
			if (initMaxColIndex > this.colCount){
				var MAXCOL = websheet.Constant.MaxColumnIndex;
				if(initMaxColIndex < MAXCOL)
					this.colCount = initMaxColIndex;
				else{
					delta = this.BLANK_HEIGHT;
					this.colCount = MAXCOL;
				}
			}
		}
		var w = grid.geometry.colWidth(1, this.colCount) + delta;
		return w;
	}
});