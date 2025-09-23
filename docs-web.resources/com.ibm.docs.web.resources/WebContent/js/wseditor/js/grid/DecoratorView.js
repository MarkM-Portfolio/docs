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

dojo.provide("websheet.grid.DecoratorView");

dojo.require("concord.util.browser");
dojo.require("websheet.widget.LinkDiv");
dojo.requireLocalization("websheet","base");

dojo.declare("websheet.grid.DecoratorView", null, {
	// Module:
	//		websheet/canvas/DecoratorView
	// Description:
	//		Decorator view of Canvas data grid.
	//		Used to create decorator widget
	
	// row/column resizer widget
	rowResizer: null,
	colResizer: null,
	overResizeWidth: 4,
	minResize: 1,
	resizeDelta: 5,
	// hyperlink div
	linkDiv: null,
	
	destroyDecorateView: function() {
		if(this.colResizer)
			this.colResizer.destroy();
		if(this.rowResizer)
			this.rowResizer.destroy();
	},
	
	/************************* Header Resizer ******************************/
	// Summary:
	//		When drag on the edge of column/row header, it can resize the header widht/height
	beginResizeHeader: function(e, bKeyBorad) {
		var mover = null;
		var selector = this.selection.selector();
		var rangeInfo = selector.getRangeInfo();
		if(e.rowIndex == -1) {
			this._initResizer(false);
			var s = this.colResizerNode.style;
			s.height = this.boxSizing.h + "px";
			s.left = (e.clientX - this.contentViewRect.left) +
				(this.isMirrored ? this.yScrollNode.offsetWidth : 0) + "px";
			s.display = '';
			mover = this.colResizer;
			var col = e.cellIndex;
			if(pe.scene.bMobileBrowser) {
				var ls = this.mobileColLineNode.style;
				ls.height = s.height;
				// adjust the column width according to select range
				col = rangeInfo.endCol;
				mover.startCol = rangeInfo.startCol;
				mover.endCol = rangeInfo.endCol;
			} else {
				// adjust the column width according to the mouse position
				if((e.headerCellOffsetX + this.overResizeWidth) <= 0){
					col = e.cellIndex - 1;
					// incase it is the invisible col
					var w = 0;
					while( col >= 1
							&& (w = this.geometry._widthArray[col - 1]) <= 0){
						col--;
					}
				}
				if(selector.selectingColumns() && col >= rangeInfo.startCol && col <= rangeInfo.endCol){
					mover.startCol = rangeInfo.startCol;
					mover.endCol = rangeInfo.endCol;
				} else {
					mover.startCol = mover.endCol = col;
				}
			}
			mover.startRow = mover.endRow = -1;
			var pos = this.geometry.getCellPosition(-1, col);
			mover.maxLeft = this.isMirrored ? this.boxSizing.l + 1 : this.boxSizing.w - 1;
			mover.minLeft = this.isMirrored ? this.geometry.getGridWidth() - pos.l : pos.l;
		} else if(e.cellIndex == 0) {
			this._initResizer(true);
			var s = this.rowResizerNode.style;
			s.width = this.boxSizing.w + "px";
			s.top = (e.clientY - this.contentViewRect.top) + "px";
			s.display = '';
			mover = this.rowResizer;
			var row = e.rowIndex;
			if(pe.scene.bMobileBrowser) {
				var ls = this.mobileRowLineNode.style;
				ls.width = s.width;
				// adjust the row height according to select range
				row = rangeInfo.endRow - 1;
				mover.startRow = rangeInfo.startRow;
				mover.endRow = rangeInfo.endRow;
			} else {
				// adjust the row height according to the mouse position
				if((e.headerCellOffsetY + this.overResizeWidth) <= 0){
					row = e.rowIndex - 1;
					// incase it is the invisible row
					var h = 0;
					while( row >= 0 
							&& (h = this.geometry._heightArray[row]) <= 0 ){
						row--;
					}
				}
				if(selector.selectingRows() && row >= (rangeInfo.startRow - 1) && row <= (rangeInfo.endRow - 1)){
					mover.startRow = rangeInfo.startRow;
					mover.endRow = rangeInfo.endRow;
				} else {
					mover.startRow = mover.endRow = row + 1;
				}
			}
			mover.startCol = mover.endCol = 0;
			var pos = this.geometry.getCellPosition(row, 0);
			mover.maxTop = this.boxSizing.h - 1;
			mover.minTop = pos.t;
		}
		if(mover) {
			mover.onMouseDown(e);
		}
	},
	
	headerResizing: function(mover, leftTop, e) {
		var m = mover.host;
		m.onMoving(mover, leftTop);
		if(m.startRow == -1){
			leftTop.t = 0;
			if((!this.isMirrored && leftTop.l > m.maxLeft) || (this.isMirrored && leftTop.l < m.maxLeft)){
				leftTop.l = m.maxLeft;
			}else if((!this.isMirrored && leftTop.l < m.minLeft)||(this.isMirrored && leftTop.l >= m.minLeft)){
				leftTop.l = m.minLeft;
			}
			
		}else{
			leftTop.l = 0;
			if(leftTop.t > m.maxTop){
				leftTop.t = m.maxTop;
			} else if(leftTop.t < m.minTop){
				leftTop.t = m.minTop;
			}
		}
		m.top = leftTop.t;
		m.left = leftTop.l;
		if (m.originalTop == null) {
			m.originalTop = m.top;
			m.originalLeft = m.left;
		}
		var s = mover.node.style;
		s.left = leftTop.l + "px";
		s.top  = leftTop.t + "px";
		m.onMoved(mover, leftTop);
	},
	
	_initResizer: function(bRow) {
		if(bRow){
			if(!this.rowResizer){
				if(pe.scene.bMobileBrowser) {
					// mobile should has drag node when resize
					this.rowResizerNode = dojo.create('div', {className: 'mobile-resizer'}, this.decoratorViews);
					this.mobileRowLineNode = dojo.create('div', {className: 'mobile-resize-line-row'}, this.rowResizerNode);
					var mobileRowDragNode = dojo.create('div', {className: 'mobile-resize-dragnode-row'}, this.rowResizerNode);
				} else {
					this.rowResizerNode = dojo.create('div', {className : 'row-resizer'}, this.decoratorViews);
				}
				this.rowResizer = 
					new dojo.dnd.Moveable(this.rowResizerNode); 
				this.rowResizer.onMove = dojo.hitch(this, "headerResizing");
				this.connect(this.rowResizer, "onMoveStop", dojo.hitch(this, 'endResizeHeader'));
			}
		} else {
			if(!this.colResizer){
				if(pe.scene.bMobileBrowser) {
					// mobile should has drag node when resize
					this.colResizerNode = dojo.create('div', {className: 'mobile-resizer'}, this.decoratorViews);
					var mobileColDragNode = dojo.create('div', {className: 'mobile-resize-dragnode-col'}, this.colResizerNode);
					this.mobileColLineNode = dojo.create('div', {className: 'mobile-resize-line-col'}, this.colResizerNode);
				} else {
					this.colResizerNode = dojo.create('div', {className : 'col-resizer'}, this.decoratorViews);
				}
				this.colResizer = 
					new dojo.dnd.Moveable(this.colResizerNode); 
				this.colResizer.onMove = dojo.hitch(this, "headerResizing");
		    	this.connect(this.colResizer, "onMoveStop", dojo.hitch(this, 'endResizeHeader'));
			}
		}
	},
	
	resizeHeader: function(m, bRow){

		if(bRow){
			if(m.top){

				var height = m.top - m.minTop;
				var oldHeight = this.geometry.rowHeight(m.startRow - 1);
				if(height < this.minResize){
					// hide row
					this.editor.execCommand(commandOperate.HIDEROW, [m.startRow - 1, m.endRow - 1]);
				} else{
					if(height > websheet.Constant.MaxRowHeight)
						height = websheet.Constant.MaxRowHeight;
					this.editor.execCommand(commandOperate.CHANGEROWHEIGHT, [m.startRow, m.endRow, height]);
				}
				if (this.a11yEnabled()) {
					var delta = height - oldHeight;
					this.announce(
							dojo.string.substitute((delta > 0)?this.accnls.ACC_INCREASE_ROWHEIGHT :this.accnls.ACC_DECREASE_ROWHEIGHT, [Math.abs(delta)]));
				}
			}
		} else {
			if(m.left){

				var width = this.isMirrored ? this.yScrollNode.offsetWidth + m.minLeft - m.left : m.left - m.minLeft;
				var oldWidth = this.geometry.colWidth(m.startCol);
				if(width < this.minResize){
					// hide column
					this.editor.execCommand(commandOperate.HIDECOLUMN, [m.startCol, m.endCol]);
				}else{
					if(width > websheet.Constant.MaxColumnWidth)
						width = websheet.Constant.MaxColumnWidth;
					this.editor.execCommand(commandOperate.CHANGECOLUMNWIDTH, [m.startCol, m.endCol, width]);
				}
				if (this.a11yEnabled()) {
					var delta = width - oldWidth;
					this.announce(
							dojo.string.substitute((delta > 0) ? this.accnls.ACC_INCREASE_COLUMNWIDTH : this.accnls.ACC_DECREASE_COLUMNWIDTH, [Math.abs(delta)]));
				}
			}
		}
	},
	
	endResizeHeader: function(resizer) {
		resizer.node.style.display = "none";
		var m = resizer.host;
		if(m.startRow == -1) {
			if(m.startCol <= 0)
				 return;
			// if m.left == null means the mover is not moved
			if( m.left != null && Math.abs(m.left - m.originalLeft) > 1) {
				this.resizeHeader(m);
			} else {
				if(this._clickr == null){
					this._clickr = {time : new Date()};
					return;
				} else {
					var current = new Date();
					if(current - this._clickr.time < 2000)
					{
						this.fitContentForColumns(m.startCol, m.endCol);
					}
				}
			}
				
		} else if(m.startCol == 0){
			if(m.startRow <=0)
				return;
			if (m.top != null && Math.abs(m.top - m.originalTop) > 1) {
				this.resizeHeader(m, true);
			} else {
				if(this._clickr == null){
					this._clickr = {time : new Date()};
					return;
				} else {
					var current = new Date();
					if(current - this._clickr.time < 2000)
					{
						this.fitContentForRows(m.startRow, m.endRow);
					}
				}
			}
		}
		m.originalTop = m.originalLeft = m.left = m.top = this._clickr = null;
	},
	

	beginKeyboradResizeHeader: function(bRow, bIncrease) {
		this._initResizer(bRow);
		var selector = this.selection.selector();
		var rangeInfo = selector.getRangeInfo();
		var mover, pos;
		var delta = this.resizeDelta;
		if(!bIncrease)
			delta = -this.resizeDelta;
		if(bRow && selector.selectingRows()){
			mover = this.rowResizer;
			mover.startCol = mover.endCol = -1;
			mover.startRow = rangeInfo.startRow;
			mover.endRow = rangeInfo.endRow;
			var row = selector.focusRow;
			var height = this.geometry.rowHeight(row);
			if(height <= 0){
				mover.top = null;
				return true;
			}
			pos = this.geometry.getCellPosition(row, 0);
			mover.maxTop = this.boxSizing.h - 1;
			mover.minTop = pos.t;
			mover.top = pos.t + height + delta;
			if(mover.top > mover.maxTop){
				mover.top = mover.maxTop;
			}else if(mover.top < mover.minTop){
				mover.top = mover.minTop;
			}
			var s = this.rowResizerNode.style;
			s.width = this.boxSizing.w + "px";
			s.top = mover.top + "px";
			s.display = '';
		} else if( !bRow && (selector.selectingColumns() || selector.selectingSheet())){
			mover = this.colResizer;
			mover.startRow = mover.endRow = -1;
			mover.startCol = rangeInfo.startCol;
			mover.endCol = rangeInfo.endCol;
			col = this.selection.getFocusedCol();
			if (col < rangeInfo.startCol) {
				col = rangeInfo.startCol;
			}
			var width = this.geometry.colWidth(col);
			if(width <= 0){
				mover.left = null;
				return true;
			}
			pos = this.geometry.getCellPosition(-1, col);
			if(this.isMirrored) {
				mover.maxLeft = this.boxSizing.l + 1;
				mover.minLeft = this.geometry.getGridWidth() - pos.l;
				mover.left = mover.minLeft - width + delta;
				if(mover.left < mover.maxLeft){
					mover.left = mover.maxLeft;
				}else if(mover.left >= mover.minLeft){
					mover.left = mover.minLeft;
				}
			} else {
				mover.maxLeft = this.boxSizing.w - 1;
				mover.minLeft = pos.l;
				mover.left = pos.l + width + delta;
				if(mover.left > mover.maxLeft){
					mover.left = mover.maxLeft;
				}else if(mover.left < mover.minLeft){
					mover.left = mover.minLeft;
				}
			}
			var s = this.colResizerNode.style;
			s.height = this.boxSizing.h + "px";
			s.left = mover.left + "px";
			s.display = '';
		} else 
			return false;
		return true;
	},
	
	endKeyboardResizeHeader: function(bRow) {
		var selector = this.selection.selector();
		var m;
		if(bRow && selector.selectingRows()){
			m = this.rowResizer;
		} else if(!bRow && (selector.selectingColumns() || selector.selectingSheet())){
			m = this.colResizer;
		} else 
			return false;
		var node = m.node;
		node.style.display = "none";
		this.resizeHeader(m, bRow);
		return true;
	},
	
	inResizeArea: function(e) {
		// mouse move around the header cell edget less than overResizeWidth distance
		if(pe.scene.bMobileBrowser)
			return false;
		if(e.rowIndex == -1
				&& ( (e.cellIndex > 0 && (e.headerCellOffsetX + this.overResizeWidth) > 0) 
						|| (e.cellIndex > 1 && (this.geometry.colWidth(e.cellIndex) + e.headerCellOffsetX) < this.overResizeWidth))) {
			return true;
		} else if(e.cellIndex == 0 
				&& ( (e.rowIndex > -1 && (e.headerCellOffsetY + this.overResizeWidth) > 0)
						|| (e.rowIndex > 0 && (this.geometry.rowHeight(e.rowIndex) + e.headerCellOffsetY) < this.overResizeWidth))) {
			return true;
		} 
		return false;
	},
	
	fitContentForRows: function(startRow, endRow, bData) {

		var hArray = this.geometry._heightArray;
			newRows = {}, 
			minHeights = this.geometry.getMinRowHeight(startRow - 1, endRow - 1);
			bChanged = false,
			wcs = websheet.Constant.Style;
		for(i = startRow - 1; i < endRow; i++)
		{
			var h = hArray[i];
			var minH = minHeights[i];
			if(h == null || (h > 0 && h != minH))
			{
				(newRows[i + 1] = {})[wcs.HEIGHT] = minH;
				bChanged = true;
			}
		}
		if (bData)
			return bChanged ? newRows : null;
		
		if (bChanged) {
			this.editor.execCommand(commandOperate.CHANGEROWHEIGHT, [startRow, endRow, newRows]);
		}
	},
	
	/*
	 * callback from mobile
	 */
	/*object*/fitContentForColumnsInSync: function(startCol, endCol)
	{
		var measures = {};
		var maxRow = this.editor.getMaxRow();
		for(var index = startCol; index <= endCol; index++)
		{
			var r = {sheetName: this.sheetName, startRow: 1, endRow: maxRow, startCol: index, endCol: index};
			var result = this._measureColumns(r);
			for (var col in result)
			{
				measures[col] = result[col];
			}
		}
		
		delete measures.complete;
		var colJson = {}, wcs = websheet.Constant.Style;
		var changed = false;
		for(var col in measures)
		{
			(colJson[col] = {})[wcs.WIDTH] = measures[col];
			changed = true;
		}

		return changed ? colJson : null;
	},
	
	fitContentForColumns: function(startCol, endCol)
	{
		var tm = this.editor.getTaskMan();
		var maxRow = this.editor.getMaxRow();
		var _collector = dojo.hitch(this, '_collector', startCol, endCol, {});
		var callback = dojo.hitch(this,function(){
			// 50000 cells a time.
			for(var i = startCol; i <= endCol; i += 5)
			{
				var s = i, e = Math.min(i + 5, endCol);
				var r = {sheetName: this.sheetName, startRow: 1, endRow: maxRow, startCol: s, endCol: e};
				tm.addTask(this, '_measureColumns', [r, e == endCol], tm.Priority.UserOperation).then(_collector);
			}
			tm.start();
		});
		var range = {sheetName: this.sheetName, startRow: 1, endRow: maxRow, startCol: startCol, endCol: endCol};
		tm.addTask(this.editor.getInstanseOfPCM(), "startWithCondition", [range,callback], tm.Priority.UserOperation);
		tm.start();
		this.measures = {};
	},
	
	_measureColumns: function(range, lastOne)
	{
		var wcst = websheet.Constant;
		var min = max = wcst.MaxColumnWidth;
		var sheet = this.editor.getDocumentObj().getSheet(this.sheetName);
		var sc = range.startCol, ec = range.endCol, sr = range.startRow, er = range.endRow;
		var stlMgr = sheet._parent._styleManager;
		var _storeResult = function(result, key, value)
		{
			//set the measure result in an object and return the object as the result of this measure task.
			//there will be a constraint of MAX and Min value on the width for each column.
			var _current = result[key];
			if(_current == max) return false;
			if(_current < value || _current == null)
				result[key] = Math.min(max, value);
			return result;
		};
		var result = {}, _colsStyle = {}, _colsWidth = {};
		//get column style map and column width map for the columns in range.
		var _cp = sheet.getColumnPosition(sc, true);
		if(_cp < 0) 
			_cp = - ( _cp + 1);
		for(var i = _cp, key; i  < sheet._columns.length; i ++)
		{
			var col = sheet._columns[_cp], index = col.getIndex();
			if(index > ec)
				break;
			else
			{	
				key = websheet.Helper.getColChar(index);
				_colsStyle[key] = col.getStyleId();
				_colsWidth[key] = col.getWidth();
			}
		}
		var layout = websheet.grid.LayoutEngine.getInstance();
		var style, fontInfo, fonts;
		var iter = new websheet.model.RangeIterator(range, wcst.RangeIterType.TEXTMEASURE);
		iter.iterate(function(obj, row, col) {
			var _cell = obj && obj.cell;
			if (!_cell || _cell.isNull()) {
				return true;
			}
			//master cell of muti-columns merged cell should not engaged,
			if (obj.bMultiRowMaster || obj.bMultiColMaster) {
				return true;
			}
			
			var index = websheet.Helper.getColChar(col);
			var colStyleId = _colsStyle[index];
			var styleCell = obj && obj.styleCell;
			var styleId = styleCell ? styleCell._styleId : colStyleId;
			//skip measure of this column if it has already reached MAX value.
			if(result[index] == max)
				return true;
			var showValue = _cell.getShowValue(styleId);
			//for merge cell, skip covered cells.
			var wrap = false, indent = 0;
			//Split the cell content with '\n' and measure them separately 
			//If there's a wrap text attribute on this cell, the rule is to compare the current column width with the measure width,
			//only change the column widh in case the column width is larger than the measured one.
			//warp flag can be set when getFont from cell/column style.
			//indent can be update right when getFont from cell/column style.
			style = stlMgr.getStyleById(styleId) || websheet.style.DefaultStyleCode ;
			fontInfo = style.getFontStyle();
			fonts = fontInfo.fontString;
			wrap = fontInfo.wrap;
			indent = fontInfo.indent;
			
			var values = showValue.split('\n'), measureWidth, currentWidth;
			for(var idx in values)
			{
				// + indent for each cell.
				// + offset for the padding on both sides, (1 + ?0 ~ 0.5) * 2
				measureWidth = layout.measureWidth(values[idx], fonts) + indent + (wrap ?  /*double to make enough space for browser's word break text layout*/4 : 2);
				currentWidth = (_colsWidth[index] || wcst.DEFAULT_COLUMN_WIDTH);
				if(!wrap || (wrap && measureWidth < currentWidth))
				{
					_storeResult(result, index, Math.ceil(measureWidth));
				}
				else if(wrap && measureWidth >= currentWidth)
				{
					//keep the column width unchanged, it may be expanded later by other cells, but should not change this time.
					_storeResult(result, index, Math.ceil(currentWidth));
				}
			}
			
			return true;
		});
		result.complete = lastOne;
		return result;
	},
	
	_collector: function(startCol, endCol, measures, result)
	{
		if(!result) return;
		result = result.result;
		for(var col in result)
		{
			measures[col] = result[col];
		}
		if(result.complete == true)
		{
			delete measures.complete;
			//console.info('All measure tasks complete, construct the json to set column widths');
			var changed = false;
			var colJson = {}, wcs = websheet.Constant.Style;
			for(var _col in measures)
			{
				(colJson[_col] = {})[wcs.WIDTH] = measures[_col];
				changed = true;
			}
			if (changed)
				this.editor.execCommand(commandOperate.CHANGECOLUMNWIDTH, [startCol, endCol, colJson]);
		}
	},
	
	/************************* Header Resizer End ******************************/
	
	/************************* HyperLink ******************************/
	gotoLinkWithIndex: function(/*0-based*/rowIndex,/*1-based*/colIndex)
	{
		if(this.editor.scene.isViewMode())
			return;
		var tmpCell=this.editor.getDocumentObj().getCell(this.sheetName, rowIndex + 1, colIndex);
		if(tmpCell!=null && tmpCell.hasLink() && !tmpCell.hasURL()){
			var link = tmpCell.getLink();
			var parsedLink = websheet.Utils.parseLink(link);
			if(parsedLink.type != null){//Invlid link
				var msg = null;
				if(!this.nls)
					this.nls = dojo.i18n.getLocalization("websheet","base");
				switch(parsedLink.type){
				case websheet.Constant.linkType.URL:
					msg = this.nls.LINK_URL_ALERT;
					break;
				case websheet.Constant.linkType.File:
					msg = this.nls.LINK_FILE_ALERT;
					break;
				default:
					msg = this.nls.LINK_REF_ALERT;
					break;
				}
				var dlg = new concord.widgets.MessageBox(this, this.nls.LINK_ALERT_TITLE, null, false, 
						{message: msg});
				dlg.show();
				return;	
			}
			else{
				var parsedRef = parsedLink.parsedRef;
				if(!parsedRef.sheetName)
					parsedRef.sheetName = this.sheetName;
				this.editor.moveFocusTo(parsedRef.getAddress({refMask: parsedRef.refMask|websheet.Constant.RefAddressType.SHEET}));
				var self = this;
				setTimeout( function(){ self._moveSelection(parsedRef); }, 10);
			}
		}
	},	
	
	_moveSelection: function(parsedRef)
	{
		var grid = this.editor.controller.getGrid(parsedRef.sheetName );
		var selector = grid.selection.select();
		selector.selectionStart(); 
		if((parsedRef.refMask & websheet.Constant.DEFAULT_RANGE_MASK) > 0){
			selector.selectRange(parsedRef.startRow - 1, parsedRef.startCol, parsedRef.endRow - 1, parsedRef.endCol);
		}else if((parsedRef.refMask & websheet.Constant.DEFAULT_COLS_MASK) > 0){
			selector.selectColumn(parsedRef.startCol, parsedRef.endCol || parsedRef.endCol);
		}else if((parsedRef.refMask & websheet.Constant.DEFAULT_ROWS_MASK) > 0){
			selector.selectRow(parsedRef.startRow - 1, (parsedRef.endRow || parsedRef.startRow) - 1);
		}else {
			selector.selectCell(parsedRef.startRow - 1, parsedRef.startCol);
		}
		selector.selectionComplete();
		this.requestWidgetsUpdate(true);
	},
	
	getLinkDiv:function()
	{
		if(!this.linkDiv)
			this.linkDiv = new websheet.widget.LinkDiv(this);
		return this.linkDiv;			
	},

	isShowLinkDivOnCell:function(rowIndex,colIndex){
		if(this.getLinkDiv().isShow()){
			if(this._linkRowIndex == rowIndex && this._linkColIndex == colIndex)
				return true;
		}
		return false;
	},
	
	hideLinkDiv:function () {
		this.getLinkDiv().hide();	
		this._linkRowIndex = null;
		this._linkColIndex = null;
	},
	
	showLinkDivWithIndex:function(/*0-based*/rowIndex,/*1-based*/colIndex){
		var div = this.getLinkDiv();
		if (div.isShow()) {
			div.hide();
		}
		var tmpCell=this.editor.getDocumentObj().getCell(this.sheetName, rowIndex + 1, colIndex);
		if(tmpCell!=null && tmpCell.hasURL()){			
			div.setValue(tmpCell.getLink(), tmpCell.isLinkFormula());
			div.adjustPosition(this.geometry.getCellPosition(rowIndex, colIndex, true));
			div.show();
			this._linkRowIndex = rowIndex;
			this._linkColIndex = colIndex;				
		}
    },
    
    removeCellLink:function(){
    	var rowIndex = this._linkRowIndex;
    	var colIndex = this._linkColIndex;
		var docObj = this.editor.getDocumentObj();
		var cellObj = docObj.getCell(this.sheetName, rowIndex + 1, colIndex);
		var Style = websheet.Constant.Style;
		var reverseInfo={"link":cellObj.getLink(), "style": {}};
		reverseInfo.style[Style.COLOR] = "#0000ff";
		reverseInfo.style[Style.UNDERLINE] = true;
		cellObj.setLink("");
		var style = {};
		style[Style.COLOR] = websheet.style.DefaultStyleCode._attributes[Style.COLOR];
		style[Style.UNDERLINE] = websheet.style.DefaultStyleCode._attributes[Style.UNDERLINE];
		docObj.mergeCellStyle(this.sheetName, rowIndex + 1, colIndex, style);
		var inField = websheet.Helper.getColChar(colIndex);
		var refValue= websheet.Helper.getCellAddr(this.sheetName, (rowIndex + 1), inField);
		var attr = {"link":""};
		attr.style = style;
		var event = new websheet.event.SetCell(refValue,attr);
		var reverse = new websheet.event.Reverse(event, refValue, reverseInfo);
		// for clear color shading
		// remove from cell model as this cell content is changed by self
     	//if (cellObj) {
     		//cellObj.removeUser();
     	//}
     	// send message
		this.editor.sendMessage (event, reverse);
		this.updateRow(rowIndex);
	}
    /************************* HyperLink End ******************************/
});