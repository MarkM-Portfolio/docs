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
dojo.provide("websheet.widget._SelectRectangle");
dojo.require("websheet.widget._Rectangle");
dojo.require("concord.util.browser");

dojo.declare("websheet.widget._SelectRectangle", [websheet.widget._Rectangle], {
	// summary:
	//		SelectRectangle is used in grid to select contents and the main feature it should cover include:
	//		1. Basic selection features, row(s), column(s), cell(s), entire sheet.
	//		2. Auto-fill
	//		3. Eraser
	
	autofill		:		null,		//a handle to auto-fill and erase
	autofillable	:		true,		//controls the enablement of the autofill feature,
	
	cover			:		null,		//a semitransparent coating under the selection rectangle
	coverFixed		:		false,		//if it's true, the cover node will always be shown out, otherwise, it will be hidden automatically 
										//when it's selecting a single cell
	highlightClass	:		"selection-highlight",
										//the selection-highlight class is used to mark the selection status on header nodes
	
	eraser			:		null,		//another semitransparent coating with different color compares to cover node
										//the eraser shoud not be enabled if the select rectangle is not autofillable,
	fillborder		:		null,		//a DIV node which indicates the autofill range's border
	
	hotCell			:		null,		//the focused cell indicator, it's a div node similar with rectangle
	hotCellLocated	:		true,		//controls the show/hide status of the hotCell node
	
	focusRow		:		-1,			//0-based numbers,
	focusCol		:		-1,			//1-based number,
	
	formulaBar		:		null,		//reference to the formula-bar, we need to synchronize current selection status with formula-bar's name-box show value.
										//can be null,
	
	_scrolling		:		null,		//String, indicates the direction of the scroll, can be 'up', 'down', 'left', 'right', keep null if it's not scrolling
	_isAutofilling	:		null,		//boolean, as named, indicates if it's currently performing an autofill operation.
	_isSelecting	:		null,		//boolean, indicates if it's current performing select operation
	_picker			:		null,		//data structure used when autofilling and erase selections
	_cellMarginBox	:		null,		//_cellMarginBox indicates the hot-cell node's margin box, a cached data structure got when renderRectangle.
	
	autofillApply: function()
	{
		// summary:
		//		Apply autofill (when mouse up), it may be 'clear range' or 'fill range' depends on the "picker" object's clearing flag which is set during 'autofilling'.
		if(this.autofillable)
		{
			this._isAutofilling = false;
			var picker = this._picker;
			if(!picker)	return;
			picker.eraserNode.style.display = picker.fillNode.style.display ='none';
			var sourceRange = picker.sourceRange;
			if(picker.clearing)
			{
				//eraser, clearing range
				var range = picker.eraseRange;
				if(range.startRow != sourceRange.startRow || range.endRow != sourceRange.endRow || 
						range.startCol != sourceRange.startCol || range.endCol != sourceRange.endCol)
				{
					this.selectRange(sourceRange.startRow - 1, sourceRange.startCol, 
							range.startRow == sourceRange.startRow ? sourceRange.endRow - 1 : range.startRow - 2, 
									range.startCol == sourceRange.startCol ? sourceRange.endCol : range.startCol - 1, true);
					if(this.focusRow > this._endRowIndex || this.focusCol > this._endColIndex){
						this.focusCell(this._startRowIndex, this._startColIndex);
					}else 
						this.render();
				}
				if(this.grid.editor.scene.supportInCurrMode(commandOperate.CLEARRANGE))
					this.grid.editor.execCommand(commandOperate.CLEARRANGE, [range.startRow, range.endRow, range.startCol, range.endCol]);
			}
			else
			{
				//normal, autofill range
				var fillRange = picker.fillRange;
				if(fillRange.startRow != null)
				{
					this.selectRange(fillRange.startRow - 1, fillRange.startCol, fillRange.endRow - 1, fillRange.endCol);
					fillRange.sheetName = this.grid.sheetName;
					var changed = true;
					if(sourceRange.startRow == fillRange.startRow && sourceRange.endRow == fillRange.endRow)
					{
						if(fillRange.startCol < sourceRange.startCol)
							fillRange.endCol = sourceRange.startCol - 1;
						else if(fillRange.startCol == sourceRange.startCol && fillRange.endCol == sourceRange.endCol)
							changed = false;//if fillRange == sourceRange, do nothing
						else
							fillRange.startCol = sourceRange.endCol + 1;
					}
					else
					{
						if(fillRange.startRow < sourceRange.startRow)
							fillRange.endRow = sourceRange.startRow - 1;
						else
							fillRange.startRow = sourceRange.endRow + 1;
					}
					if(this.grid.editor.scene.supportInCurrMode(commandOperate.FILLRANGE) && changed)
						this.grid.editor.execCommand(commandOperate.FILLRANGE, [sourceRange, fillRange]);
				}
			}
			dojo.style(dojo.body(), 'cursor', '');
			this._picker = null;
		}
	},
	
	autofillStart: function()
	{
		// summary:
		//		Start autofill when mouse down on the drag node, the autofill related information are wrapped in a 'filler' object.
		//		The filler object contains the following components:
		//		1.	The range border node, which is this.autofill;
		//		2.	The eraser node, which is this.eraser;
		//		3.	A 'rangeInfo' object related with the autofill node;
		//		4.	A 'rangeInfo' object related with the eraser node;
		//		5.	A 'rangeInfo' object that is the expanded original selected range, it will be useful when we calculate the
		//			new autofill border
		if(this.autofillable)
		{
			this._isAutofilling = true;
			var fillPicker = {};
			fillPicker.fillNode = this.fillborder;
			fillPicker.eraserNode = this.eraser;

			fillPicker.fillRange = {};
			fillPicker.eraseRange = {};
			var range = websheet.Utils.getExpandRangeInfo(this.getRangeInfo());
			
			var colcount = websheet.Constant.MaxColumnIndex;
	    	if(range.endCol > colcount)
	    		range.endCol = colcount;
	    	fillPicker.mergeInfo = websheet.Utils.isSameMergeRange(range);
	    	fillPicker.sourceRange = range;
	    	fillPicker.selectedRange = dojo.clone(range);
	    	//to 0-based row index, they are used in selection & range calculation
	    	fillPicker.selectedRange.startRow -= 1;
	    	fillPicker.selectedRange.endRow -= 1;
	    	fillPicker.rowDelta = Math.abs(range.startRow - range.endRow) + 1;
	    	fillPicker.colDelta = Math.abs(range.startCol - range.endCol) + 1;
			//show auto-fill node, render it
	    	fillPicker.fillNode.style.display = '';
			this.renderRectangle(range, fillPicker.fillNode, {borderWidth : 1, borderWise: true});
			dojo.style(dojo.body(), 'cursor', 'crosshair');
			this._picker = fillPicker;
		}
	},
	
	autofilling: function(e, pos)
	{
		// summary:
		//		Render the autofill range border according to current status and the given mouse event e.
		// e:
		//		Mouse event, transformed with "transformEvent"
		if(this.autofillable && this._isAutofilling && !this._scrolling)
		{
			var range = this._getFillRange(pos);
			if(range)//autofill
			{
				range.startRow += 1;
				range.endRow += 1;
				this._picker.fillRange = range;
				this._picker.clearing = false;
				//hide erase node
				this.eraser.style.display = 'none';
				//render fill-border, the red fill-border width is 1, give the borderWidth to make it precisely rendered.
				this.renderRectangle(range, this._picker.fillNode, {borderWidth : 1, borderWise: true});
			}
			else//eraser
			{
				this._picker.clearing = true;
				var row = pos.row + 1, col = pos.col;
				var range = this._picker.sourceRange;
				var box = this._marginBox;
				var eraseRange = {};
				if(Math.abs(box.l + box.w - e.pageX) > Math.abs(box.t + box.h - e.pageY))
				{
					//in x direction, from right to left
					eraseRange.startCol = col;
					eraseRange.endCol = range.endCol;
					eraseRange.startRow = range.startRow;
					eraseRange.endRow = range.endRow;
				}
				else
				{
					//vice versa, in y direction, from bottom to up
					eraseRange.startCol = range.startCol;
					eraseRange.endCol = range.endCol;
					eraseRange.startRow = row;
					eraseRange.endRow = range.endRow;
				}
				this._picker.eraseRange = eraseRange;
				//render fill-border
				this.renderRectangle(this._picker.sourceRange, this._picker.fillNode, {});
				//render eraser ndoe
				this.eraser.style.display = '';
				this.renderRectangle(eraseRange, this._picker.eraserNode, {});
			}
		}
	},
	
	/*Object*/disableAutofill: function()
	{
		// summary:
		//		Disable the autofill functionality with the call of this.
		// returns:
		//		Self.
		this.autofill.style.display = 'none';
		return ((this.autofillable = false) || this);
	},
	
	destroy: function()
	{
		// summary:
		//		Remove the timer that will be invalid after destroy
		this._bgUpdateTimer && clearTimeout(this._bgUpdateTimer);
		this._bgUpdateTimer = null;
		this.inherited(arguments);
	},
	
	/*Object*/enableAutofill: function()
	{
		// summary:
		//		Enable the autofill functionality with the call of this.
		// returns:
		//		Self
		this.autofill.style.display = '';
		return ((this.autofillable = true) && this);
	},
	
	focusCell: function(rowIndex, colIndex)
	{
		// summary:
		//		Focus to the given cell, the hot cell node's position and status will be updated, but the other selection status keeps unchanged.
		//		So this will not change the selection type of current select rectangle, but only affect the 'focusRow' and 'focusCol';
		// rowIndex:	Number, 0-based, row index
		// colIndex:	Number, 1-based, col index
		var r = this.getRangeInfo();
		if(rowIndex < r.startRow - 1 || rowIndex > r.endRow - 1 || colIndex < r.startCol || colIndex > r.endCol)
		{
			console.warn("You're trying to focus to a cell that's out of current selecting range.");
			this.selectCell(rowIndex, colIndex);
			return;
		}
		this.focusRow = rowIndex;
		this.focusCol = colIndex;
		this.render();
		this.publishCellFocus();
	},
	
	/*Object*/getFocusCellAddress: function()
	{
		// summary:
		//		Return the focused cell 'address',
		var focusCol = this.focusCol;
		var focusRow = this.focusRow;
		var merge = this.grid.cellMergeInfo(focusRow, focusCol);
		if (merge && merge.isCovered) {
			focusCol = merge.masterCol;
			focusRow = (merge.masterRow != undefined)? merge.masterRow : focusRow; // transform to 0-based grid index;
		}
		return {
			sheet : this.grid.sheetname,
			row : focusRow + 1,
			column : focusCol
		};
	},
	
	/*Object*/hide: function()
	{
		// summary:
		//		Overwrite to support header background highlight update
		this.inherited(arguments);
		if(this.hotCellLocated)
			this.hotCell.style.display = 'none';
		if(!this.coverFixed)
			this.cover && (this.cover.style.display = 'none');
		if(this._hibernating)
			this.updateHeaderBackground();
		return this;
	},
	
	/*boolean*/isSelecting: function () {
		return this._isSelecting;
	},
	
	/*boolean*/isActivated: function () {
		// summary:
		//		Activated means it should handle mouse events
		return this._isSelecting || this._isAutofilling;
	},
	
	/*String*/isScrolling: function()
	{
		// summary:
		//		Return the scrolling status of the selection rectangle, if true, it will give the actuall scrolling direction.
		return this._scrolling;
	},
	
	/*boolean*/isAutofilling: function()
	{
		return this._isAutoFilling;
	},
	
	publishSelection: function()
	{
		// summary:
		//		Publish a selection changed message to notify status bar to calculate the formulas that are selected in current rectangle.
		if(this._selectionChangeTrigger != null) return;
		this._selectionChangeTrigger = setTimeout(dojo.hitch(this, function(){
			this._selectionChangeTrigger = null;
			var stb = this.grid.editor.getStatusBar();
			dojo.publish(stb.SELECTION_CHANGED, [this.getRangeInfo()]);
		}), 50);
	},
	
	publishCellFocus: function () {
		// summary:
		//		Trigger a 'CellFocus' event here in another timer;
		if (this._cellFocusTrigger) {
			return;
		} else {
			var self = this;
			this._cellFocusTrigger = setTimeout(function () {
				self._cellFocusTrigger = null;
				var focus = self.getFocusCellAddress();
				self.grid.onCellFocus(focus.row - 1, focus.column);
			}, 0);
		}
	},
	
	render: function()
	{
		// summary:
		//		Overwrite, more need to be rendered, they're:
		//		1. cover node, if it's selecting a cell, cover node should be hidden, but if cover node has been 'fixed' (used in multi-selection mode), just forget the cover node.
		//		2. hot-cell node, we use rectangle's border to select cell, so hot-cell node should be hidden if selecting a cell
		//			in multi-selection mode the hot-cell node may not located in current rectangle, also hide it if 'hotCellLocated' is false.
		//		3. autofill range border, if it's current performing autofill, need to render it too.
		//		Need to publishSelection to make formula digest work.
		//		Update formula bar's name box value to keep it synchronized with current selection status.
		//update cover node status
		if(!this.coverFixed)
		{
			if(this.selectingCell()) 
			{
				this.cover.style.display = 'none';
			}
			else
			{
				this.cover.style.display = '';
			}
		}
		//do i need to render the  hot-cell node ?
		if(this.hotCellLocated)
		{
			if(this.selectingCell())
			{
				this.hotCell.style.display = 'none';
				if(this._borderWidth == 1)
					this.setBorderWidth(2);
			}
			else
			{
				if(this._borderWidth == 2)
					this.setBorderWidth(1);
				if (this.grid.isEditing()) {
					this.hotCell.style.display = 'none';
				} else {
					var range = {};
					range.startRow = range.endRow = this.focusRow + 1;
					range.startCol = range.endCol = this.focusCol;
					range.sheetName = this.grid.sheetName;
					this.renderRectangle(websheet.Utils.getExpandRangeInfo(range), this.hotCell, {borderWidth:2, marginBox: this._cellMarginBox});
				}
			}
		}
		// mobile autofill node is rendered in _MobileSelectRectangle
		if(this.autofillable && !pe.scene.bMobileBrowser){
			var className = "autofill autofill-range";
			switch(this._selectType){
				case websheet.Constant.RowRange:
				case websheet.Constant.Row:
					className = "autofill autofill-row";
					break;
				case websheet.Constant.ColumnRange:
				case websheet.Constant.Column:
					className = "autofill autofill-col";
					break;
			}
			this.autofill.className = className;
		}
		//render the autofill range border, if it's currently autofilling
		if(this._isAutofilling && this._picker)
		{
			var range = this._picker.fillRange;
			this.renderRectangle(range, this._picker.fillNode, {borderWidth : 1, borderWise: true});
		}
		this.inherited(arguments);
		if(this.hotCellLocated && this.selectingCell())
			this._cellMarginBox = this._marginBox;
		this.publishSelection();
		this.updateNameBoxValue();
		this.updateHeaderBackground();
	},
	
	renderRectangle: function(range, node, params) {
		// overwrite
		if (this.grid.editor.isMobile() && !this.grid.editor.scene.bJSMobileApp) {
			return;
		} else {
			this.inherited(arguments);
		}
	},
	
	selectCell: function(/*0-based*/rowIndex, colIndex, skipRender)
	{
		// summary:
		//		Overwrite, update this.focusRow, and this.focusCol
		if(rowIndex == null || rowIndex < 0 || colIndex == null || colIndex < 1)
			return;
		this.focusRow = rowIndex;
		this.focusCol = colIndex;
		this.publishCellFocus();
		this.inherited(arguments);
	},
	
	selectGrid: function(grid)
	{
		// summary:
		//		Overwrite, append customized widget node to the new grid
		if(grid == null || grid == this.grid) return this;
		this.grid = grid;
		var container = this.grid.contentViews;
		this.placeAt(container);
		container.appendChild(this.mover.node);
		if(this.autofill)
			container.appendChild(this.autofill);
		if(this.fillborder)
			container.appendChild(this.fillborder);
		if(this.eraser)
			container.appendChild(this.eraser);
		return this;
	},
	
	scrollingSelectionStart: function(direction)
	{
		// summary:
		//		Scroll the grid in the given direction, and expand current selected range on the same direction, start another timer to call repeatedly
		//		till the 'scrollingSelectionStop' is called.
		this._scrolling = direction;
		var ret = this.grid.scrollByDirection(direction);
		if(!ret){
			// do not scroll or stop scroll for this rectangle when grid scroller has not scrolled
			this.scrollingSelectionStop();
			return;
		}
		var autofilling = this._isAutofilling;
		if(autofilling && this.eraser.style.display != 'none')
		{
			this.eraser.style.display = 'none';
		}
		var fillRange = autofilling ? this._picker.fillRange : null;
		var sourceRange = autofilling ? this._picker.sourceRange : null;
		if(direction == websheet.Constant.DIRECTION.UP)
		{
			var firstVisibleRow = this.grid.scroller.firstVisibleRow;
			if(fillRange)
			{
				if(firstVisibleRow >= fillRange.endRow)
				{
					fillRange.endRow = firstVisibleRow + 1;// to 1-based
					fillRange.startRow = sourceRange.startRow;
				}
				else if(firstVisibleRow < fillRange.startRow)
				{
					fillRange.startRow = firstVisibleRow + 1;
					fillRange.endRow = sourceRange.endRow;
				}
				fillRange.startCol = sourceRange.startCol;
				fillRange.endCol = sourceRange.endCol;
			}
			else
				this._endRowIndex = firstVisibleRow;
		}
		else if(direction == websheet.Constant.DIRECTION.DOWN)
		{
			var lastVisibleRow = this.grid.scroller.lastVisibleRow;
			if(fillRange)
			{
				if(lastVisibleRow >= fillRange.endRow)
				{
					fillRange.endRow = lastVisibleRow + 1;
					fillRange.startRow = sourceRange.startRow;
				}
				else if(lastVisibleRow < fillRange.startRow)
				{
					fillRange.startRow = lastVisibleRow + 1;
					fillRange.endRow = sourceRange.endRow;
				}
				fillRange.startCol = sourceRange.startCol;
				fillRange.endCol = sourceRange.endCol;
			}
			else
				this._endRowIndex = lastVisibleRow;
		}
		else if(direction == websheet.Constant.DIRECTION.LEFT)
		{
			var firstVisibleColumn = this.grid.isMirrored ? this.grid.scroller.lastVisibleCol : this.grid.scroller.firstVisibleCol;
			if(fillRange)
			{
				if(firstVisibleColumn < fillRange.startCol)
				{
					fillRange.startCol = firstVisibleColumn;
					fillRange.endCol = sourceRange.endCol;
				}
				else if(firstVisibleColumn > fillRange.endCol)
				{
					fillRange.endCol = firstVisibleColumn;
					fillRange.startCol = sourceRange.startCol;
				}	
				fillRange.startRow = sourceRange.startRow;
				fillRange.endRow = sourceRange.endRow;
			}
			else
				this._endColIndex = firstVisibleColumn;
		}
		else
		{
			//right
			var lastVisibleColumn = this.grid.isMirrored ? this.grid.scroller.firstVisibleCol : this.grid.scroller.lastVisibleCol;
			if(fillRange)
			{
				if(lastVisibleColumn > fillRange.endCol)
				{
					fillRange.endCol = lastVisibleColumn;
					fillRange.startCol = sourceRange.startCol;
				}
				else if(lastVisibleColumn < fillRange.startCol)
				{
					fillRange.startCol = lastVisibleColumn;
					fillRange.endCol = sourceRange.endCol;
				}
				fillRange.startRow = sourceRange.startRow;
				fillRange.endRow = sourceRange.endRow;
			}
			else
				this._endColIndex = lastVisibleColumn;
		}
		this._selectScrollTimer = setTimeout(dojo.hitch(this, this.scrollingSelectionStart, direction),0);
	},
	
	scrollingSelectionStop: function()
	{
		// summary:
		//		Stop the scrolling.
		clearTimeout(this._selectScrollTimer);
		this._selectScrollTimer = null;
		this._scrolling = null;
	},
	
	selectionStart: function () {
		// summary:
		//		This 'isSelecting' is like the original "_isMouseDown", indicates the selecting status of the select renctangle.
		this._isSelecting = true;
	},
	
	selectionComplete: function ()  {
		// summary:
		//		Mark the selecting status flag as false.
		this._isSelecting = false;
	},
	
	/***************************************************Events***************************************************/
	onclick: function(e)
	{
		// summary:
		//		Overwrite, reset these mouse down flags.
		this._isSelecting = false;
	},
	
	ondblclick: function(e)
	{
		// summary:
		//		Overwrite, double click on rectangle will enter editing mode.
		if(this._decorateEvent(e))
		{
			//if it's clicking on a covered cell, move to its master cell.
			var mhelper = websheet.model.ModelHelper;
    		var doc = mhelper.getDocumentObj();
    		var row = doc.getRow(this.grid.sheetName,e.rowIndex + 1);
    		if(row)
    		{
    			var mcell = row.getCell(e.cellIndex, websheet.Constant.CellType.COVERINFO, true);
    			if(mcell)
    			{
    				e.cellIndex = mcell.getCol();;
    				e.cellNode = e.cell ? e.cell.getNode(row) : null;
    			}
    		}
			this.grid.onCellDblClick(e);
		}
	},
	
	onmousedown: function(e)
	{
		// summary:
		//		Overwrite, click on selection rectangle should focused to the clicked cell;
		//		normal, click on the rectangle, should focus to the 'clicked cell'
		//		click on the drag node will start an auto-fill
		if(dojo.mouseButtons.isLeft(e))
		{
			if(e.target == this.autofill && !this.isAutofilling())
			{
				this.autofillStart();
				dojo.stopEvent(e);
			}
			else
			{
				this.inherited(arguments);
			}
		}
	},
	
	onmousemove: function(e)
	{
		// summary:
		//		mouse over the rectangle will change the the index of the selected rectangle
		if(this._sleeping)
		{
			if(this._decorateEvent(e))
			{
				this.grid.onCellMouseOver(e);
			}
		}
		else if(this.isActivated() || this._isAutofilling)
		{
			//	1.	first see if it needs to start scrolling, if it's currently not scrolling
			//		or if it needs to stop scrolling, if it's currently scrolling.
			var grid = this.grid;
			var box = this._getContentBox();
			var x = e.pageX, y = e.pageY;
			var scrolling = this._scrolling;
			var dir = websheet.Constant.DIRECTION;
			if(!pe.scene.bMobileBrowser) { // do not need scroll when autofill or select range for mobile
			if(scrolling)
			{
				// to see if it needs to stop
				var stop = false;
				if(scrolling == dir.LEFT)
				{
					if(grid.scroller.firstVisibleCol == (grid.freezeCol + 1) || /*FIXME*/grid.scroller.scrollLeft < 2)
						stop = true;
					else if(!grid.isMirrored && x > box.xFreezeEdge)
						stop = true;
				}
				else if(scrolling == dir.UP)
				{
					if( grid.scroller.firstVisibleRow == grid.freezeRow || /*FIXME*/grid.scroller.scrollTop < 2)
						stop = true;
					else if(y > box.yFreezeEdge)
						stop = true;
				}
				else if(scrolling == dir.DOWN)
				{
					if(y < box.bottom)
						stop = true;
				}
				else//right
				{
					if((!grid.isMirrored && x < box.right) || 
						(grid.isMirrored && grid.freezeCol && x > box.xFreezeEdge
							&& (grid.scroller.firstVisibleCol == grid.freezeCol+1))){
						stop = true;
					}
				}
				if(stop)
				{
					this.scrollingSelectionStop();
				}
			}
			else
			{
				// see if it needs to scroll
				var start = false;
				if(!this.selectingRows())
				{
					if(x < box.left || (!grid.isMirrored && x > box.left && x < box.xFreezeEdge && (Math.min(this._startColIndex, this._endColIndex) > grid.freezeCol)))
					{
						start = dir.LEFT;
					}
					else if(x > box.right || (grid.isMirrored && x > box.xFreezeEdge && Math.min(this._startColIndex, this._endColIndex) > grid.freezeCol))
					{
						start = dir.RIGHT;
					}
				}
				if(!this.selectingColumns())
				{
					if(y < box.top || (y > box.top && y < box.yFreezeEdge && (Math.min(this._startRowIndex, this._endRowIndex) >= grid.freezeRow)))
					{
						start = dir.UP;
					}
					else if(y > box.bottom)
					{
						start = dir.DOWN;
					}
				}
				if(start)
				{
					this.scrollingSelectionStart(start);
				}
			}
			}
			if(!this._scrolling)
			{
				var location = this.grid.transformEvent(e.pageX, e.pageY);
				var pos = this.grid.geometry.locatingCell(location.x, location.y, location.range);
				var merge = this.grid.cellMergeInfo(pos.row, pos.col);
				if (merge && merge.isCovered && this.selectingCell() && merge.masterRow == this._startRowIndex && merge.masterCol == this._startColIndex) {
					return;
				}
				if(this._isAutofilling)
				{
					//handle as autofilling
					this.autofilling(e, pos);
				}else {
					if(pos.row != null && pos.col != null)
					{
						if(grid.freezeRow > 0)
						{
							if(pos.row >= grid.freezeRow && Math.max(this._startRowIndex, this._endRowIndex) < grid.freezeRow && (grid.scroller.firstVisibleRow > grid.freezeRow/*FIXME*/ || grid.scroller.scrollTop > 2))
								return grid.scroller.scrollToRow(grid.freezeRow);
						}
						if(grid.freezeCol > 0)
						{
							if(pos.col > grid.freezeCol && Math.max(this._startColIndex, this._endColIndex) <= grid.freezeCol && (grid.scroller.firstVisibleCol > (grid.freezeCol + 1)/*FIXME*/ || grid.scroller.scrollLeft > 2)) {
								if(grid.isMirrored)
									this._endColIndex = grid.freezeCol + 1;
								
								return grid.scroller.scrollToColumn(grid.freezeCol + 1);
							}
						}
						if(this.selectingColumns())
						{
							this.selectColumn(this._startColIndex, pos.col);
						}
						else if(this.selectingRows())
						{
							this.selectRow(this._startRowIndex, pos.row);
						}
						else
						{
							this.selectRange(null, null, pos.row, pos.col);
						}
					}
				}
			}
		} else if((!this.isMoveable || !this.mover.isMoving)) {
			if(this._decorateEvent(e))
				this.grid.onCellMouseOver(e);
		}
	},
	
	onmouseup: function(e)
	{
		// summary:
		//		Overwrite, expand current rectangle add 'apply' it's selection, update the merge/split cell icon in the tool bar according to current status.
		//		Clear mouse down flags,
		//		Stop scrolling if it's currently scrolling
		//		Apply autofill if it's performing autofill.
		this.inherited(arguments);
		this._isSelecting = false;
		if(this._scrolling)
			this.scrollingSelectionStop();
		if(this._isAutofilling)
			this.autofillApply();
		if(this.selectingRange())
		{
			var range = this.getExpandedRangeInfo();
			this._startRowIndex = range.startRow - 1;
			this._startColIndex = range.startCol;
			this._endRowIndex = range.endRow - 1;
			this._endColIndex = range.endCol;
		}
	},
	
	onMoveStop: function(mover)
	{
		// summary:
		//		Overwrite, 
		
		//directly return if it's not changed
		this.inherited(arguments);
		var old = mover.oldRange;
		var moved = mover.range;
		if(!moved || (old.startCol == moved.startCol && old.endCol == moved.endCol && old.startRow == moved.startRow && old.endRow == moved.endRow))
		//I'm not sure where it has been mvoed, or it's just has not been moved, directly return
			return;
		if (websheet.model.ModelHelper.isRangeProtected(this.grid.sheetName, old.startRow, old.endRow, old.startCol, old.endCol)
				||websheet.model.ModelHelper.isRangeProtected(this.grid.sheetName, moved.startRow, moved.endRow, moved.startCol, moved.endCol)) {
			this.grid.editor.protectedWarningDlg();
    		this.grid.editor.scene.hideErrorMessage();
			// source range or target ragne is under protected, directly return;
			return;
		}
		var oldAddr = websheet.Helper.getAddressByIndex(this.grid.sheetName, old.startRow,old.startCol, null, old.endRow, old.endCol,{refMask:websheet.Constant.RANGE_MASK}),
	    	newAddr = websheet.Helper.getAddressByIndex(this.grid.sheetName, moved.startRow,moved.startCol, null, moved.endRow, moved.endCol,{refMask:websheet.Constant.RANGE_MASK});
		
		if(this.grid.editor.isACLForbiddenArea(oldAddr) || this.grid.editor.isACLForbiddenArea(newAddr))
			return;

		//focused to the first row/column of the new range
		this.focusCell(this._startRowIndex, this._startColIndex);
		var bMoveColumn = false;
		//udpate model.
		var funcMethod = '_copyRange';
		var args = [{}, this.grid.sheetName];
		if(this.selectingCell())
		{
			funcMethod = '_copyCell';
			args.push(mover.row);
			args.push(mover.col);
		}
		else if(this.selectingRows())
		{
			funcMethod = '_copyRowRange';
			args.push(mover.row);
			args.push(mover.row + mover.rowDelta);
		}
		else if(this.selectingColumns())
		{
			bMoveColumn = true;
			funcMethod = '_copyColumn';
			args.push(mover.col);
			args.push(mover.col + mover.colDelta);
			// move column is different from other 'moveRange', due to its special routine
			var grid = this.grid;
			var signal = dojo.aspect.after(grid, 'fullRender', function (){
				try {
					if (grid.editor._clipboard._cutting) {
						grid.editor._clipboard._cutting = false;
					}
				} catch (e) {
				}
				signal.remove();
			});
		}
		else
		{
			funcMethod = '_copyRange';
			args.push(mover.row);
			args.push(mover.row + mover.rowDelta);
			args.push(mover.col);
			args.push(mover.col + mover.colDelta);
		}
		this.grid.editor.execCommand(commandOperate.MOVERANGE, [funcMethod, args, bMoveColumn]);
	},
	
	updateNameBoxValue: function()
	{		
		// summary:
		//		Update name box's value according to current status, should call this if the selection changed,
		if(this.formulaBar)
		{
			var value;
			if (this.selectingCell()) {
				var focused = this.getFocusCellAddress();
				value = this.formulaBar.normalizeRangeAddress(focused.row, focused.column, focused.row, focused.column);
			} else if (this.selectingRange()){
				info = this.getExpandedRangeInfo();
				cellInfo = websheet.Utils.getCoverCellInfo(info.sheetName, info.startCol, info.startRow);
				if (cellInfo && 
					cellInfo.colSpan == info.endCol - info.startCol + 1 &&
					cellInfo.rowSpan == info.endRow - info.startRow + 1) {
					value = this.formulaBar.normalizeRangeAddress(info.startRow, info.startCol);
				} else {
					value = this.formulaBar.normalizeRangeAddress(info);
				}
			} else {
				value = this.formulaBar.normalizeRangeAddress(this.getRangeInfo());
			}
			
			this.formulaBar.setNameBoxValue(value);
		}
	},
	
	updateHeaderBackground: function()
	{
		// summary:
		//		Update the header cell node's background color, this indicates the selection status of the rectangle.
		//		Update separately in an independent timer to improve the entire 'render' routine.
		if (this.grid.deferredUpdate) {
			// If there is a grid update waiting, directly return since the fullRender will update the widgets at the last step;
			return;
		} else {
			this.grid.renderer.renderWidgets();
		}
	},
	
	
	/***************************************************Initialize & Destroy & Inner fields***************************************************/
	_customizedInit: function()
	{
		//overwrite, create cusomized widgets.
		this._createCustomizedWidgets();
		if(this.grid.editor.scene.isHTMLViewMode())
		{
			this.disableAutofill();
			this.isMoveable = false;
		}
		this.setBorderWidth(1);
		this.formulaBar = this.grid.editor.getFormulaBar();
	},
	
	_createCustomizedWidgets: function()
	{
		// 1. create the cover node
		this.cover = dojo.create('div', {className : 'cover-node', style : {display : 'none'}}, this.containerNode, 'last');
		this.connect(this.cover, 'onmousemove', this._dispatchEvents);
		if(this.autofillable)
		{
			this.fillborder = dojo.create('div', {className : 'autofill-border', style : {display : 'none'}}, this.containerNode, 'after');
			this.eraser = dojo.create('div', {className : 'erase-node', style : {display : 'none'}}, this.containerNode, 'after');
			//append the auto-fill node to the right bottom of the container node (right : -4px), not sure where it is in RTL environment
			this.autofill = dojo.create('div', {className : "autofill"}, this.containerNode, 'last');
		}
		this.hotCell = dojo.create('div', {className : 'websheetSelection'}, this.containerNode, 'after');
	},
	
	_connectEvents: function()
	{
		this.inherited(arguments);
		//delegate mousedown event on hot cell node to rectangle.
		if(this.hotCell)
			this.connect(this.hotCell, 'onmousedown', this._dispatchEvents);
		//for scroll
		this.connect(dojo.body(), 'onmousemove', this._dispatchEvents);
		this.connect(dojo.body(), 'onmouseup', this._dispatchEvents);
		//for in-line editor
		this.connect(this.grid, 'endUpdate', dojo.hitch(this, function(){
			this.updateHeaderBackground();
		}));
	},
	
	_calculateAutofillRangeBoundary: function(dir, selectedRange, mouseRow, mouseCol)
	{
		var direction = websheet.Constant.DIRECTION;
    	var resultRange = {
    			startRow : selectedRange.startRow,
    			endRow : selectedRange.endRow,
    			startCol : selectedRange.startCol,
    			endCol : selectedRange.endCol
    	};
    	var maxRow = this.grid.editor.getMaxRow();
    	mouseRow = Math.min(mouseRow, maxRow - 1);
    	mouseCol = Math.min(mouseCol, websheet.Constant.MaxColumnIndex);
		resultRange.direction = dir;
		var mergeInfo = this._picker.mergeInfo;
		var rowDelta = this._picker.rowDelta;
		var colDelta = this._picker.colDelta;
    	switch(dir){
    	case direction.UP:/*vertical range: range upwards*/
    		if(mergeInfo === false){
    			var rinc = Math.abs(mouseRow - selectedRange.startRow);
    			if(rinc == 0)
    				break;
    			var incDivDet = Math.round(rinc / rowDelta);
    			resultRange.startRow = selectedRange.startRow - (incDivDet * rowDelta);
    			if(resultRange.startRow >= 0)
    				break;
    			else
    				resultRange.startRow += rowDelta;
    		}else{
    			resultRange.startRow = mouseRow;
    		}
    		break;
    	case direction.DOWN:/*vertical range: range bellow*/
    		if(mergeInfo === false){
    			var rinc = Math.abs(mouseRow - selectedRange.endRow);
    			if(rinc == 0)
    				break;
    			var incDivDet = Math.round(rinc / rowDelta);
    			resultRange.endRow = selectedRange.endRow + (incDivDet * rowDelta);
    			if(resultRange.endRow <= maxRow)
    				break;
    			else
    				resultRange.endRow -= rowDelta;
    			
    		}else{
    			resultRange.endRow = mouseRow;
    		}
    		break;
    	case direction.LEFT:
    		var delta = mergeInfo === false ? colDelta : mergeInfo.colSpan;
    		var cinc = Math.abs(mouseCol - selectedRange.startCol);
    		if(cinc == 0)
    			break;
    		var incDivDet = Math.round(cinc / delta);
    		resultRange.startCol = selectedRange.startCol - (incDivDet * delta);
    		if(resultRange.startCol >= 1)
    			break;
    		else
    			resultRange.startCol += delta;
    		break;
    	case direction.RIGHT:
    		var delta = mergeInfo === false ? colDelta : mergeInfo.colSpan;
    		var cinc = Math.abs(mouseCol - selectedRange.endCol);
    		if(cinc == 0)
    			break;
    		var incDivDet = Math.round(cinc / delta);
    		resultRange.endCol = selectedRange.endCol + (incDivDet * delta);
    		if(resultRange.endCol <= websheet.Constant.MaxColumnIndex)
    			break;
    		else
    			resultRange.endCol -= delta;
    		break;
    	default:
    			console.log("Unhandled mouse position when use dragnode to draw range");
    	}
    	return resultRange;
	},
	
	_getFillRange: function(pos)
	{
		// summary:
	    // 		get the _rangePicker selected range, return null if mouse position is in Mid2 area.
	    // 		MID2 is current selected rectangle.
	    //  Left1  |   Mid1   |  Right1
	    // --------| ======== |--------
	    //  LEFT2  | ==Mid2== |  Right2
	    // --------| ======== |--------
	    //  LEFT3  |   Mid3   |  Right3
		if(!this._isAutofilling)	return;
		var picker = this._picker;
		var range = picker.selectedRange;
		
		var mouseRowIndex = Math.max(pos.row, 0);
		var mouseColIndex = Math.max(pos.col, 1);
		if(mouseRowIndex == null || mouseColIndex == null)
		{
			return;
		}
		var dir = websheet.Constant.DIRECTION;
		var rangeDirection = null;
		
		if(mouseColIndex > range.endCol)
		{//Right1, Right2, Right3
			if((mouseRowIndex >= range.startRow) && (mouseRowIndex <= range.endRow))
			{//Right 2
				rangeDirection = dir.RIGHT;//directly right
			}
			else if(mouseRowIndex < range.startRow)
			{//Right 1
				if(Math.abs(mouseRowIndex - range.startRow) > Math.abs(mouseColIndex - range.endCol))//quadrant 1
					rangeDirection = dir.UP;
				else
					rangeDirection = dir.RIGHT;
			}else
			{//Right 3
				if(Math.abs(mouseRowIndex - range.endRow) > Math.abs(mouseColIndex - range.endCol))//quadrant 4
					rangeDirection = dir.DOWN;
				else
					rangeDirection = dir.RIGHT;
			}
		}
		else if(mouseColIndex >= range.startCol)
		{//Mid1, Mid2, Mid3
			if(mouseRowIndex < range.startRow)
			{//Mid 1, UP
				rangeDirection = dir.UP;
			}
			else if(mouseRowIndex > range.endRow)
			{//Mid 3, DOWN
				rangeDirection = dir.DOWN;
			}
			else {//Mid 2, current selected area
				rangeDirection = null;
			}
		}
		else
		{//Left1, Left2, Left3
			if((mouseRowIndex >= range.startRow) && (mouseRowIndex <= range.endRow))
			{//Left2, directly left
				rangeDirection = dir.LEFT;
			}
			else if(mouseRowIndex < range.startRow)
			{//Left1
				if(Math.abs(mouseRowIndex - range.startRow) > Math.abs(mouseColIndex - range.startCol))//quadrant 2
					rangeDirection = dir.UP;
				else
					rangeDirection = dir.LEFT;
			}
			else 
			{//Left3
				if(Math.abs(mouseRowIndex - range.endRow) > Math.abs(mouseColIndex - range.startCol))//quadrant 3
					rangeDirection = dir.DOWN;
				else
					rangeDirection = dir.LEFT;
			}
		}
		if(rangeDirection)
			return this._calculateAutofillRangeBoundary(rangeDirection, range, mouseRowIndex, mouseColIndex);
	}
});