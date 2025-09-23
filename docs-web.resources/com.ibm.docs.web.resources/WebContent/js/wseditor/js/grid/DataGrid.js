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

dojo.provide("websheet.grid.DataGrid");
dojo.require("concord.util.browser");
dojo.require("websheet.grid.Events");
dojo.require("websheet.grid.Scroller");
dojo.require("websheet.grid.GridGeometry");
dojo.require("websheet.grid.GridRender");
dojo.require("websheet.grid.GridStage");
dojo.require("websheet.grid.SelectionManager");
dojo.require("websheet.grid.DecoratorView");
dojo.require("websheet.widget.FreezeBar");
dojo.require("dojo.aspect");
dojo.require("dojox.gesture.tap");
dojo.requireLocalization("websheet","base");
dojo.declare("websheet.grid.DataGrid", [dijit._Widget, dijit._Templated, websheet.grid.Events, 
                                          websheet.grid.GridStage, websheet.grid.DecoratorView], {
	// Module:
	//		websheet/canvas/DataGrid
	// Description:
	//		Canvas data grid.
	
	baseClass: "",
	
	// freeze window index
	freezeRow: 0,
	freezeCol: 0,
	
	// scrollbarSize
	//		Size in pixels.
	scrollbarSize: 17,
	
	// sheet level default row height;
	defaultRowHeight: null,
	
	// this flag takes control of the resize & render behavior of current grid.
	// when it is true, we will make sure that the grid will be re-rendered when resize() is called;
	// otherwise we will not update the grid if the box-sizing of current grid is not changed;
	// in this way we can prevent unnecessary resize that maybe triggered in many place;
	forceUpdateOnResize: true,
	
	//TODO: Remove this after acc defects fixed;
	DEBUG_ACC:		false,
	
	// templatePath
	//		The template of the data grid should be rather simple, the main components is a canvas node that
	//		is used to display the most contents like texts, backgrounds, borders...
	templateString: dojo.cache("websheet", "templates/CanvasGrid.html"),
	
	// initialization
	buildRendering: function () {
		this.inherited(arguments);
		//make the container focusable
		if (this.editor.scene.isViewMode()) {
			dojo.attr(this.domNode, "tabindex", 0);
		} else {
			dojo.attr(this.domNode, "tabindex", -1);
		}
		this._createScroller();
		this._createOwns();
		this._connectEvents();
		if(this.isMirrored) {
			this.hScrollNode.dir = 'rtl';
			dojo.place(this.lbSubviewNode, this.rbSubviewNode, "after");
			dojo.place(this.ltSubviewNode, this.rtSubviewNode, "after");
		        dojo.addClass(this.contentViews, 'rtl');
		}
	},
	
	a11yEnabled: function () {
		// currently we enable ACC only for FireFox;
		return (dojo.isFF || this.DEBUG_ACC);
	},
	
	announce: function (message) {
//		console.warn("Not implemented, screen reading message:", message);
		if (this.a11yEnabled() && this.bEnableRead) {
			if(!this.announciator){
				var node = this.announciator = dojo.create('span',null, this.contentViews);
				node.style.zIndex = -20000;        
				node.style.margin = "-10000px";
	        	dijit.setWaiRole(node,'region');
				dijit.setWaiState(node,'live', 'assertive');
				dijit.setWaiState(node,'label', 'live region');
			}
			if (typeof message == "string") {
				message = websheet.Helper.escapeXml(message);
				this.announciator.innerHTML = message;
				if (this.DEBUG_ACC) {
					console.info("Reading message:", message);
				}
			}
		}
	},
	
	apply: function () {
		return this.inlineEditor.apply();
	},
	
	adjustFreezebar: function () {
		/**
		 * Adjust the position of the freeze window indicator line div and freeze bar div accroding to frozen indexes.
		 */
		if (!this.freezeBar) {
			this.freezeBar = new websheet.widget.FreezeBar(this);
		}
		this.freezeBar.adjustPosition();
	},
	
	adaptWidth: function () {
		// summary:
		//		Data grid resized.
		// update style of the vertical scroll bar
		var	style = this.yScrollNode.style;
		style.left = this.isMirrored ? 0 : this.boxSizing.w + 'px';
		style.top = 0;
		style.height = this.boxSizing.h + 'px';
		this.freezeViewWidth = this.geometry.GRID_HEADER_WIDTH + this.geometry.getFreezeWidth();
		this.ltSubviewNode.style.width = this.lbSubviewNode.style.width = this.freezeViewWidth + "px";
		var rightSubviewWidth = this.isMirrored ? this.boxSizing.w - this.freezeViewWidth - this.geometry.freezeBarSize
					: this.boxSizing.w - this.freezeViewWidth;
		this.rtSubviewNode.style.width = this.rbSubviewNode.style.width = rightSubviewWidth + "px";
	},
	
	adaptHeight: function () {
		// summary:
		//		Data grid resized.
		
		//update the style of the horizontal scroll bar
		var	style = this.xScrollNode.style;
		style.top = this.boxSizing.h + 'px';
		style.left = this.isMirrored ? this.yScrollNode.offsetWidth + 'px' : 0;
		style.width = this.boxSizing.w + 'px';
		this.freezeViewHeight = this.geometry.GRID_HEADER_HEIGHT + this.geometry.getFreezeHeight();
		this.ltSubviewNode.style.height = this.rtSubviewNode.style.height = this.freezeViewHeight + "px";
		this.lbSubviewNode.style.height = this.rbSubviewNode.style.height = (this.boxSizing.h - this.freezeViewHeight) + "px";
	},
	
	cancel: function(){
		return this.inlineEditor.cancel();
	},

	/*deferred*/doApplyCellEdit: function(newValue, /*0 based*/inRowIndex, inColIndex){
		var bMobile = !this.getInlineEditor().isEditing() && this.editor.isMobile();
		if (bMobile)
			this.updateRow(inRowIndex);
		
		var ret = this.setValue(newValue, inRowIndex + 1, inColIndex, false, false, (new dojo.Deferred()));
		if (bMobile) {
			// return true or false in mobile to tell whether one operation is made
			var result = ret.results[0];
			ret = false;
			if (result && result.cellJson) {
				for (var id in result.cellJson)
					ret = true;
			}
		}
		return ret;
		
//		return this.setValue(newValue, inRowIndex + 1, inColIndex, false, (new dojo.Deferred()));
	},
	
	endResize: function () {
		// summary:
		//		Called after 'resize' done, @related resize, isResizing
		this.resizing = false;
		this.forceUpdateOnResize = false;
		this.setGridDomRect();
		if(!dojo.isSafari)
			//Set selectable false on the grid dom node will fail the Range Selection In InlineEditor Div
			//This will affect the basic editing functionality of inline editor in Safari so don't roughly do this
			dojo.setSelectable(this.domNode, false);
		
		// notify the in-line inlineEditor if it's currently attached to this grid.
		if (this.inlineEditor.isEditing() && this.inlineEditor.grid == this) {
			this.inlineEditor.onGridResize();
		}
		this.updateUI();
	},
	
	focus: function(){
		// summary:
		//		Focused to current grid;
		this.domNode.focus();
	},
	
	freezeWindow: function (freezeRow, freezeCol) {
		// summary:
		//		Freeze the window at the given position;
		// @param freezeRow 1 based, 0 for none
		// @param freezeCol 1 based, 0 for none
		// @param reviseMerge, forece to re-build the grid with given freeze row, column
		// 
		// @return result 
		// 	{
		// 		success:	boolean, success or not,
		// 		reason:		string, if failed may give the reason why
		// 		row:		number,	if success, the frozen row index
		// 		col:		number, if success, the frozen col index
		// 	}
		var validate = this.validateFreezePosition(freezeRow, freezeCol);
		var result = {success : false};
		//Invalid return
		if(!validate.valid && !validate.image)	return result;
		if (freezeRow != null && freezeRow != this.freezeRow) {
			result.success = true;
			result.row = freezeRow;
			if ((this._freezeFromCurrentUser && freezeRow < this.freezeRow) || this.scroller.scrollTop < 1 || this.scroller.firstVisibleRow < result.row) {
				this.scroller.updateVision({
					fr : freezeRow
				});
			}
			this.freezeRow = result.row;
		}
		if (freezeCol != null && freezeCol != this.freezeCol) {
			result.success = true;
			result.col = freezeCol;
			if ((this._freezeFromCurrentUser && freezeCol < this.freezeCol) || this.scroller.scrollLeft < 1 || this.scroller.firstVisibleCol <= result.col) {
				this.scroller.updateVision({
					fc : freezeCol + 1
				});
			}
			this.freezeCol = result.col;
		}
		if (result.success) {
			this.geometry.resetFreezeBox();
			var self = this;
			this.requestUpdate().then(function () {
				self.adaptHeight();
				self.adaptWidth();
				self.adjustFreezebar();
				delete self._freezeFromCurrentUser;
			});
		}
		return result;
	},
	
    /**
     * this function used to get Cell information(for example{rowIndex:1,colIndex:1, found:true})
     * @param offsetX
     * @param offsetY
     * @param includeBottom
     * @param includeRight
     * @param referToFrozenArea	, if given, do not use scroller's firstVisibleRow to calculate cellInfo, use the grid's getFirstVisibleRow (0 based)
     * @returns
     */
    getCellInfoWithPosition: function(offsetX, offsetY, includeBottom, includeRight, referToFrozenArea){
    	var result={found:true};
		var sc = this.scroller;
		var geometry = this.geometry;
    	// the cell is upper the visible row
    	if(offsetY < 0 ){
    		var rangeInfo = {};
    		rangeInfo.sheetName = this.sheetName;
    		if (referToFrozenArea) {
    			rangeInfo.startRow = rangeInfo.endRow = this.getFirstVisibleRow() + 1;
    			return this._getCellInfoWithPosition(result, offsetX, 0, -1, rangeInfo, true, true, includeBottom, includeRight);
    		}
    		var minRow = geometry.getFirstRowWithLastRow(sc.firstVisibleRow - 1, geometry.getScrollableHeight());
    		if (minRow <0) {
    			minRow = 0;
    		}
			rangeInfo.startRow = minRow + 1;
			rangeInfo.endRow = sc.firstVisibleRow;
			return this._getCellInfoWithPosition(result, offsetX, offsetY, -1, rangeInfo, true, true, includeBottom, includeRight);
    	}else{
    		var rangeInfo = {};
    		var maxSheetRow = this.editor.getMaxRow();
			rangeInfo.sheetName = this.sheetName;
			rangeInfo.endRow = Math.min(sc.lastVisibleRow + 1, maxSheetRow);
			if(referToFrozenArea){
				rangeInfo.startRow = this.getFirstVisibleRow() + 1;
			}else{
				rangeInfo.startRow = sc.firstVisibleRow + 1;
			}
			if(rangeInfo.endRow >= maxSheetRow){
				return this._getCellInfoWithPosition(result, offsetX, offsetY, 1, rangeInfo, false, true, includeBottom, includeRight);
			}else{
				var tmp = this._getCellInfoWithPosition(result, offsetX, offsetY, 1, rangeInfo, false, false, includeBottom, includeRight);
				if (!tmp["found"] && ( sc.lastVisibleRow + 1 != maxSheetRow) ){
					rangeInfo.startRow = rangeInfo.endRow + 1;
	    			var maxRow = sc.lastVisibleRow + 1 + Math.floor(offsetY/this.geometry.defRowHeight);
	    			if(maxRow > maxSheetRow)
	    				maxRow = maxSheetRow;
	    			rangeInfo.endRow = maxRow ;
	    			result={found:true};
	    			return this._getCellInfoWithPosition(result, offsetX, tmp["rowOffset"], 1, rangeInfo, true, true, includeBottom, includeRight);
	    		}
				else
					return tmp;
			}
    	}
    },

	getFreezeWindowHeight: function () {
		// summary:
		//		Handy method, direct to geometry, just add here to make it compatiable with some old code;
		return this.geometry.getFreezeHeight();
	},
	
	getFreezeWindowWidth: function () {
		// summary:
		//		Handy method, direct to geometry, just add here to make it compatiable with some old code;
		return this.geometry.getFreezeWidth();
	},
	
	getFirstVisibleColumn: function () {
		var firstVisibleCol = this.scroller.firstVisibleCol;
		if (this.freezeCol > 0) {
			var array = this.geometry._widthArray;
			var index = 1;
			for(var width; index <= firstVisibleCol; index ++){
				width = array[index - 1];
				if (width == null || width > 0) {
					break;
				}
			}
			return index;
		} else {
			return firstVisibleCol;
		}
	},
	
	getFirstVisibleRow: function () {
		/**
		 * Get the first visible row of the grid, if the window is not frozen, this will be same with
		 * Scroller's firstVisibleRow, otherwise, it may be a row with a index less then Scroller's firstVisibleRow.
		 * Return: 0-based row index.
		 */
		var firstVisibleRow = this.scroller.firstVisibleRow;
		if (this.freezeRow > 0) {
			var array = this.geometry._heightArray;
			var index = 0;
			for(var height; index <= firstVisibleRow; index ++){
				height = array[index];
				if (height == null || height > 0) {
					break;
				}
			}
			return index;
		} else {
			return firstVisibleRow;
		}
	},
	
	getInlineEditor: function(){
		return this.editor.getController().getInlineEditor();
	},
	
	getSheetName: function () {
		return this.sheetName;
	},
	
	getBasicLayerContext: function () {
		return this.basicLayer.getContext('2d');
	},
	
	getWidgetLayerContext: function () {
		return this.widgetLayer.getContext('2d');
	},
	
	getZoomLevel: function (bReset) {
		if(bReset || this.zoomLevel == null) {
			try {
				if(dojo.isWebKit)
					this.zoomLevel = window.devicePixelRatio ? window.devicePixelRatio : window.outerWidth / window.innerWidth;
				else if(dojo.isFF)
					//Not the actural zoom level, but ff is zoomed if pixelratio is not 1
					this.zoomLevel = window.devicePixelRatio ?  window.devicePixelRatio : 1;
				else if(dojo.isIE)
					this.zoomLevel = screen.deviceXDPI / screen.logicalXDPI;
				else
					this.zoomLevel = 1;
			} catch(e){
				this.zoomLevel = 1;
			}
		}
		return this.zoomLevel;
	},
	
	hasColInView: function (range) {
		// summary:
		//		If there're any column in the given range locates in current visible range;
		var 
			firstv = this.scroller.firstVisibleCol,
			lastv = this.scroller.lastVisibleCol,
			start = range.startCol,
			end = range.endCol;
		if ((start <= lastv && start >= firstv) || (end <= lastv && end >= firstv) || (start < firstv && end > lastv)) {
			return true;
		} else {
			return false;
		}
	},
	
	isCoveredCell: function (row, col) {
		// summary:
		//		Return if it's a covered cell on the given position, notice that this rely on the 'cellInfoMap', which means only cells that have been
		//		iterated during rendering can be recognized, for thoes cells that're out of current visible area, the isCoveredCell may not give the correct
		// 		answer !!!
		var merge = this.cellMergeInfo(row, col);
		if (merge && merge.isCovered) {
			return true;
		}
		return false;
	},
	
	/**/
	isEditing: function(){
		return this.inlineEditor.isEditing() ;
	},
	
	/**
	 * @returns false if current grid is not active( not current working sheet).
	 */
	isGridVisible: function(){
		return this._wrapper && this._wrapper.parentNode && !dojo.hasClass(this._wrapper, "dijitHidden");
	},
	
	/**
	 * @returns {Boolean} return whether the rows in this grid have been built yet
	 * true if the grid has never been activated, false otherwise.
	 */
	isGridLoaded: function () {
		return (this.selection.getFocusedRow() != -1);
	},
	
	/**
	 * @returns {Boolean} Is editing in current grid?
	 */
	isEditingCurrentGrid: function () {
		return ((this.inlineEditor.isEditing()) && (this.inlineEditor.getEditGrid() == this));
	},
	
	//check if the current editing cell is start with "=" which means that it is a formula cell
	isEditingFormulaCell: function () {
		return this.inlineEditor.isEditingFormula();
	},
	
	isEditingDialog: function () {
		return (this.editor.getNameRangeHdl().isEditingNamedRange() || this.editor.getChartHdl().isEditingChart()
				|| (this.editor.getDataValidationHdl() && this.editor.getDataValidationHdl().isEditing()) 
				|| (this.editor.hasACLHandler() && this.editor.getACLHandler().isEditing()));
	},
	
	isLoadingRowVisible: function () {
		return (this._loadingRowIndex != null) && this.scroller.isRowInVisibleArea(this._loadingRowIndex);
	},
	
	isVisibleRow: function (rowIndex, precisely) {
		// summary:
		//		Verify if the row is visible, this method can return correct method only the row in the view scope
		// Precisely:
		//		boolean, if given, double check the model if;
		if (this.geometry.rowHeight(rowIndex) > 0) {
			return true;
		} else if (precisely) {
			if (this.geometry.preciseRowHeight(rowIndex) > 0) {
				return true;
			} else {
				return false;
			}
		} else {
			return false;
		}
	},
	
	isVisibleCol: function (colIndex) {
		// summary:
		//		Verify if the column is visible;
		if (this.geometry.colWidth(colIndex) > 0) {
			return true;
		} else {
			return false;
		}
	},
	
	onHide: function () {
		this._activated = false;
	},
	
	onShow: function () {
		this._activated = true;
		this.selection.initialFocus();
		if(BidiUtils.isBidiOn())
			this.editor.getToolbar().updateSheetDirectionState(this.isMirrored);
	},
	
	onScrollerMouseEvent: function (e) {
		// reference:
		//		49769: [FF]screen flickers when drag the horizontal scrollbar
		//		49679: [FF]Grids are trembling when scrolling horizontally
		// record the drag & drop status of the scroll node;
		var self = this;
		if (e.type == "mousedown" || e.type == "touchstart") {
			self._dragScrollingTimer = setTimeout(function () {
				self._dragScrolling = true;
				self._dragScrollingTimer = null;
				if (dojo.isIE) {
					var scrollTop = self.vScrollNode.scrollTop;
					var scrollLeft = self.hScrollNode.scrollLeft;
					setTimeout(function () {
						if (scrollLeft == self.hScrollNode.scrollLeft && scrollTop == self.vScrollNode.scrollTop) {
							self._dragScrolling = false;
						}
					}, 500);
				}
			}, 200);
		} else if (e.type == "mouseup" || e.type == "touchend") {
			if (self._dragScrollingTimer) {
				clearTimeout(self._dragScrollingTimer);
			}
			this._dragScrolling = false;
		}
		return true;
	},
	
	onMoreDocumentLoad: function(rowMoreContentStarts) {
		// need cover rows from rowMoreContentStarts ~ end
		this._loadingRowIndex = rowMoreContentStarts;
		// refresh loading overlay in case loadingRowIndex is in current page
		if (this.scroller.isRowInVisibleArea(this._loadingRowIndex)) {
			this.setLoadingOverlay();
		}
	},
	
	onMoreDocumentLoaded: function() {
		// remove any covers existing
		this._loadingRowIndex = null;
		if (this._bOverlay) {
			this.setLoadingOverlay();
		}
	},
	
	postCreate: function () {
		// summary:
		//		Add a visible 'effect' to indicate the gird focus event when editor/viewer is loaded in files;
		//		For ACC compliant;
		if (this.editor.scene.isHTMLViewMode()) {
			var self = this;
			dojo.connect(this.containerNode, "onfocus", function () {
				self.selection.selector().glowing();
			});
		}
	},
	
	readCellInformation: function (rowIndex, colIndex) {
		// summary:
		//		Collect the cell information and read out the message;
		// 		We suppose you want to read the focused cell;
		// rowIndex, 0-based; optional
		// colIndex, 1-based; optional
		if (!this.a11yEnabled()) {
			return;
			// We support 'A11y' ONLY IN FF;
		}
		var row = rowIndex || this.selection.getFocusedRow();
		var col = colIndex || this.selection.getFocusedCol();
		if (!this.accnls) {
			this.accnls = dojo.i18n.getLocalization("websheet","base");
		}
		var nls = this.accnls;
		var message = this.bAnnounceSheet ? this.sheetName + ", " + nls.acc_cellLabel + ", "
				: nls.acc_cellLabel + ", ";
		this.bAnnounceSheet = false;
		var value = this.cellShowValue(row, col);
		if (!value) {
			message += nls.ACC_BLANKCELL;
		} else {
			message += value;
		}
		var merge = this.cellMergeInfo(row, col);
		if (merge) {
			var startCell = websheet.Helper.getColChar(col) + " " + row;
			var endCell = websheet.Helper.getColChar(col + (merge.colSpan || 1) - 1) + " " + (row + (merge.rowSpan || 1) -1);
			message += dojo.string.substitute(nls.ACC_MERGECELL, [startCell, endCell]);
		}
		if (this.cellContainsLink(row, col)) {
			message += ", " + nls.ACC_HYPERLINK;
		}
		if (this.cellContainsComments(row, col)) {
			message += ", " + nls.ACC_COMMENT;
		}
		if (this.cellLocked(row, col)) {
			message += ", " + nls.ACC_COEDITING;
		}
		if (this.cellContainsFilter(row, col)) {
			message += ", " + nls.ACC_FILTER;
		}
		if(this.cellContainsList(row, col)){
			message += ", " + nls.ACC_DV_LIST;
		}
		//TODO
		/*Task not enabled;
		 * var taskHdl = this.editor.getTaskHdl();
		 * if(taskHdl && taskHdl.focusTask){						
		 * announceTip += ", " + grid.accnls.ACC_IN_TASK_RANGE;							
		 * }
		 * */
		if (this.editor.getFormulaBar()) {
			message += ", " + this.editor.getFormulaBar().getNameBoxValue();
		}
		
		// only read this information out if checked 'co-editing hightlights'
		var item = window["pe"].coeditingIndicatorMenuItem;
		if (item && item.attr("checked")){
			var editor_id = this.cellCoeditingInfo(row, col);
			if (editor_id) {
				var editor = this.editor.scene.getEditorStore().getEditorById(editor_id);
				if (editor) {
					message += ", " + dojo.string.substitute(nls.ACC_EDITED, [editor.getName()]);
				}
				
			}
		}
		if(this.cellContainsDVPrompt(row, col)){
			setTimeout(dojo.hitch(this, this.announce, message), 2000);
		}else
			this.announce(message);
	},
	
	removeContextMenu: function () {
		//TODO
	},
	
	resize: function (box) {
		// summary:
		//		Data grid resize, should re-render the entire frame when resize.
		if (pe.scene.bMobileBrowser) {
			this.scrollbarSize = 0;
		}
		if (!this.forceUpdateOnResize && this.boxSizing && (this.boxSizing.l == box.l && this.boxSizing.t == box.t && 
				this.boxSizing.w == box.w - this.scrollbarSize && 
				this.boxSizing.h == box.h - this.scrollbarSize)) {
				return /*unnecessary resize*/;
		} else {
			this.resizing = true;
			// cache the data grid geometry box
			this.boxSizing = {
					l : box.l,
					t : box.t,
					w : box.w - this.scrollbarSize,
					h : box.h - this.scrollbarSize
			};
			this.editor.publishForMobile({"name": "updateGridSize", "params":[{w: this.boxSizing.w, h: this.boxSizing.h, sheetName: this.sheetName}]});
		}
		var context = this;
		if (!context.waitingForResize) {
			context.waitingForResize = dojo.aspect.before(context, 'fullRender', function () {
				if (!context._updateSuspended && context.resizing) {
					context.waitingForResize.remove();
					context.waitingForResize = null;
					var pixel_ratio = this.isMirrored ? 1 : window.devicePixelRatio || 1;
					context.basicLayer.height = context.boxSizing.h * pixel_ratio;
					context.basicLayer.width = context.boxSizing.w * pixel_ratio;
					context.widgetLayer.height = context.boxSizing.h;
					context.widgetLayer.width = context.boxSizing.w;
					context.basicLayer.getContext('2d').scale(pixel_ratio, pixel_ratio);
					context.basicLayer.style.height = context.boxSizing.h + 'px';
					context.basicLayer.style.width = context.boxSizing.w + 'px';
					context.widgetLayer.style.height = context.boxSizing.h + 'px';
					context.widgetLayer.style.width = context.boxSizing.w + 'px';
				}
			});
		}
		this.requestUpdate().then(dojo.hitch(this, function () {
			this.resizeContentView();
			this.adaptWidth();
			this.adaptHeight();
			this.adjustFreezebar();
			if (this.freezeBar) {
				this.freezeBar.onGridResize(box);
			}
			this.scroller.updateScrollHeight();
			this.scroller.updateScrollWidth();
			this.endResize();
			
			this.editor.publishForMobile({"name": "updateVision", "params":[this.scroller.getCurrentVision()]});
		}));
	},
	
	
	restoreFreeze: function(){
		// summary:
		//		Call this to restore the freeze window at the right position after insert columns/rows if they contain undoFreeze info.
		//		Since we rebuild the grid when perform column opeartions, only need to call this after insert row with undoFreeze.
		var self = this;
		if (this.editor.getFreezeHdl().updateGridFreezeInfo(self)) {
			self.updateStage();
		} else {
			self.requestUpdate().then(function () {
				self.adaptHeight();
				self.adaptWidth();
				self.adjustFreezebar();
			});
		}
	},
	
	/*Object*/setValue: function (newValue, rowIndex, colIndex, /*boolean*/notSendMessage, /*boolean*/noValidation,/*promise*/deferredApply) {
		// summary:
		//		If currently editing cells on this gird, calling 'apply' from the in-line editor or any data grid will be dispatched to 
		//		this place.
		// newValue,
		// rowIndex, colIndex, 
		//		Both are 1-based index;
		// notSendMessage,
		//		Usually we will send message out here if we successfully apply the new value to the cell, but in some cases we may not intend to do so.
		//		Foe example, the  'Find&Replace(handler)' is not intend to send message here; this flag is used to control the behavior of sending messages or not.
		// deferredApply,
		//		This is a promise created by the data grid, post actions are waiting on this promise.
		//		Currently the 'postApply' of InlineEditor directly rely on this promise to be resoved with a 'result' object, the InlineEditor will take different actions
		//		based on the result.
		//		Notice, currently there're no error call back attached to this promise, so do not reject the promise but resolve it with a 'result.success = false'.
		//			-This note need to be updated, if there's any change about the promise;
		// returns:
		//		If deferredApply is given, we will update the status of the promise and return it with the result object as a parameter;
		//		If deferredApply is not given, we will directly return the result object;
		//		The structure of the 'result object' is like this:
		//		{
		//			success:  true/false, if there're any exception when apply (set);
		//			cellJson : the cell JSON if successfully change the cell value;
		//			reason: String, not used for now;
		//			...something else customized.
		//		}
		var result = {};
	    var wsconst = websheet.Constant;
		var sheetName = this.sheetName;
		var docModel = websheet.model.ModelHelper.getDocumentObj();
		var sheetModel = docModel.getSheet(sheetName);
		var isFormula = false;
		var defaultStyle = websheet.style.DefaultStyleCode;
		var styleMgr = docModel._getStyleManager();
		var styleCode = websheet.model.ModelHelper.getStyleCode(sheetName, rowIndex, colIndex);
		var format, wrap, link;
		var reverseInfo = {};
		var parseTokenResult = null;
		// parse formula string which would be locale-sensitive
		if (dojo.isString(newValue) && websheet.parse.FormulaParseHelper.isFormula(newValue)) {
			parseTokenResult = websheet.parse.FormulaParseHelper.parseFormula(newValue, false, null, /*bLocaleSensitive*/true);
			if (parseTokenResult.error && !(notSendMessage || noValidation)) {
				websheet.parse.FormulaParseHelper.showErrorDlg(parseTokenResult.error);
				result.success = false;
				// formula syntax errors;
				if (deferredApply) {
					deferredApply.resolve(result);
					return deferredApply;
				} else {
					return result;
				}
			} else {
				newValue = parseTokenResult.formula;
			}
			isFormula = true;
		}
		if (!isFormula) {
			var parseResult;
			//if there already a cell style/col style(text format) existed, then return as string
			if (styleMgr.getAttr(styleCode, websheet.Constant.Style.FORMATTYPE) != "text") {
				parseResult = websheet.i18n.numberRecognizer.parse(newValue, false, true);//should also parse string "true"/"false" as boolean
			} else {
				parseResult = {
						isNumber : false,
						fValue : 0,
						percentageNum : 0,
						formatType : websheet.Constant.FormatType["STRING"]
						
				};
			}
			var isNumber = parseResult.isNumber;
			var fValue = parseResult.fValue;
			var formatType = parseResult.formatType;
			var currencySymbol = parseResult.currencySymbol;
			if (parseResult.percentageNum>1 && fValue >= 0) {
				isNumber = false;
			}
			
			if (isNumber) {
				//if a value is too large or small, it will not be recognized as number, but set the format of the cell					
				// var absFValue = Math.abs(fValue);
				// if(absFValue == 0 || (!isNaN(absFValue) && isFinite(absFValue) && !(absFValue <= websheet.Constant.SCMinValue || absFValue >= websheet.Constant.SCMaxValue)))			
				if (!isNaN(fValue) && isFinite(fValue)) {
					newValue = fValue;
				}  else {
					// for some reason, fValue is either NaN, or INFINITY, we keep using string newValue, fix parse result as string
					parseResult.isNumber = isNumber = false;
					parseResult.percentageNum = 0;
					parseResult.formatType = formatType = wsconst.FormatType["STRING"];
					// and newValue remains the string the user input
				}
				var cellFormat = null;
				if (styleCode) {
					cellFormat = websheet.Helper.getFormat(styleCode);
				}
				// do not change the format code if user input string has the same category as the cell style 
				// or if user input string is a DATETIME string and the cell style is "DATE" or "TIME"
				if (cellFormat && cellFormat[wsconst.Style.FORMATTYPE] && ( (wsconst.FormatType[cellFormat[wsconst.Style.FORMATTYPE].toUpperCase()] == formatType)
					|| (formatType == wsconst.FormatType["DATETIME"] && (cellFormat[wsconst.Style.FORMATTYPE].toUpperCase() == "DATE" || cellFormat[wsconst.Style.FORMATTYPE].toUpperCase() == "TIME")))) {
					format = null;
				} else if (formatType == wsconst.FormatType["STRING"]) {
					// only happens when fValue turns NaN or INFINITY
					format = null;
				} else if (formatType != wsconst.FormatType["NUMBER"]) {
					// TODO: should use the user input format code, but now can not get it from NumberRecognizer.parse
					format = websheet.i18n.Number.getDefaultFormatForShowValue(formatType, currencySymbol);
				}
				if (formatType == wsconst.FormatType["BOOLEAN"]) {
					// for boolean, normalize value as TRUE and FALSE and don't set format category
					newValue = websheet.model.ModelHelper.intToBoolean(fValue);
					format = null;
				}
			} else {
				// in locale, it is not number, work-around if it is parsed as a number.
				// e.g. in Germany, "1.1" is a string, not a number,
				// we add "'" in such numbers to force it being a string.
				// In Germany locale, "true" & "false" should be taken as string by adding "'" ahead
				if (typeof newValue == "string") {
					var tmpV = newValue.toUpperCase();
					if (tmpV == "TRUE" || tmpV == "FALSE") {
						newValue = "'" + newValue;
					}
				}
				if (websheet.Helper.isNumeric(newValue)) {
					newValue = "'" + newValue;
				}
				var hasWrap = defaultStyle._attributes[wsconst.Style.WRAPTEXT];
				if (styleCode) {
					hasWrap = styleCode._attributes[wsconst.Style.WRAPTEXT] || hasWrap;
				}
				if (!hasWrap) {
					wrap = newValue.indexOf("\n") != -1;
				}
			}
		}
	    var bSameFormula = false;
	    var oldCategory = defaultStyle._attributes[wsconst.Style.FORMATTYPE];
	    var oldUnderline = defaultStyle._attributes[wsconst.Style.UNDERLINE];
	    var oldColor = defaultStyle._attributes[wsconst.Style.COLOR];
	    if (styleCode) {
	    	oldCategory = styleCode._attributes[wsconst.Style.FORMATTYPE] || oldCategory;
	    	oldUnderline = styleCode._attributes[wsconst.Style.UNDERLINE] || oldUnderline;
	    	oldColor = styleCode._attributes[wsconst.Style.COLOR] || oldColor;
	    }
	    var newCategory = oldCategory;
	    var success;
		var cell = sheetModel.getCell(rowIndex, colIndex);
		var bCalcAlways = cell && cell._errProp & wsconst.CellErrProp.CALC_ALWAYS;
		if (cell) {
			var attr = websheet.model.ModelHelper.getValueCellJson(cell, false);
			if (attr.v != null) {
				reverseInfo.v = attr.v; 
			}
			reverseInfo.userId = cell.getUser();
		}
		var oldValue = cell ? cell.getRawValue() : "";
		if (cell && !cell.isFormula() && cell.isBoolean()) {
			oldValue = websheet.model.ModelHelper.intToBoolean(oldValue);
		}
		var tarr = cell ? cell.serializeTokenArray() : null;
		var hasLink = cell ? (cell.getLink() != null) : false;
		if (oldValue === newValue) {
			// user is editing one cell, change nothing, then type Enter to commit. If it is one formula cell,
			// need to check whether the cell that the formula cell refers to has different number format, if yes, need to 
			// change current cell's number format attribute
			if (isFormula) {
				bSameFormula = true;
			} else {
				success = true;
			} 
		}
		// check if cell type is changed by setting newValue in, if so, mark success to false
		if (!isFormula && cell && websheet.model.ModelHelper.getCellType(newValue) != cell.getType()) {
			success = false;
		}
		if (bCalcAlways) {
			success = false;
		}
		var self = this;
		var event, reverse;
		var setCellComplete = function(){
			if (isFormula) {
				// when input one formula into one cell that doesn't have any number format or does not inherit from column model,
				// get its internal number format and explicitly set this number format to cell
				if (cell.isNumber() && !cell._error) {
					format = cell._format; // set number format only if this cell is number and hasn't error
				}
				format && (newCategory = format[wsconst.Style.FORMATTYPE] || defaultStyle._attributes[wsconst.Style.FORMATTYPE]);
				if(styleCode && styleCode._attributes[wsconst.Style.FORMATCURRENCY] && format && format.cur) {
					format = null;
				}
				delete cell._format;
				delete cell._bInheritFormat;
				
				if (bSameFormula) {
					// three cases for same formula string:
					// 1) different result but with same number format - grid update only (calc locally but not send message) 
					// 2) same result but with different number format - grid update and send delta change for number format or cell type
					// 3) same result with same number format - do nothing (calc locally)
					if (oldCategory == newCategory) {
						// same number format
						result.success = true;
						if (bCalcAlways) {
							result.cellJson = {}; // give an empty cell json to make the row update;
	//						return {}; // case 1
						}
						// case 3
						if (notSendMessage) {
							return result;
						} else if(noValidation){
							return;
						} else {
							validationStart();
							return deferredApply;
						}
					}
					delete reverseInfo.v; // case 2
				} else {
					if (tarr && tarr.length > 0)
						reverseInfo.tarr = tarr;
				}
			}
			if (!hasLink)
				link = cell && cell.getLink();
			
			if (format || wrap || link != null) {
				var newStyle = {};
				if (format) newStyle.format = format;
				if (wrap) newStyle[wsconst.Style.WRAPTEXT] = wrap;
				if (link != null) {
					newStyle[wsconst.Style.COLOR] = "#0000ff";
					newStyle[wsconst.Style.UNDERLINE] = true;
				}
				docModel.mergeCellStyle(sheetName, rowIndex, colIndex, newStyle);
				
				reverseInfo.style = {};
				if (wrap)
					reverseInfo.style[wsconst.Style.WRAPTEXT] = false;
				if (link !=null) {
					reverseInfo.style[wsconst.Style.UNDERLINE] = oldUnderline;
					reverseInfo.style[wsconst.Style.COLOR] = oldColor;
				}
				if (format) {
					var oldCode = "", oldCurrency = "", oldFmcolor = "";
					if(styleCode) {
						styleCode._attributes[wsconst.Style.FORMATCODE] && (oldCode = styleCode._attributes[wsconst.Style.FORMATCODE]);
						styleCode._attributes[wsconst.Style.FORMATCURRENCY] && (oldCurrency = styleCode._attributes[wsconst.Style.FORMATCURRENCY]);
						styleCode._attributes[wsconst.Style.FORMAT_FONTCOLOR] && (oldFmcolor = styleCode._attributes[wsconst.Style.FORMAT_FONTCOLOR]);
					}
					var fm = reverseInfo.style.format = {}; // reset number format
					fm[wsconst.Style.FORMATTYPE] = oldCategory;
					fm[wsconst.Style.FORMATCODE] = oldCode;
					fm[wsconst.Style.FORMATCURRENCY] = oldCurrency;
					fm[wsconst.Style.FORMAT_FONTCOLOR] = oldFmcolor;
				}
			}
			
			result.success = true;
			result.cellJson = reverseInfo;
			
			if (notSendMessage) {
				return result;
			}
			
			cell = docModel.getCell(sheetName, rowIndex, colIndex, wsconst.CellType.MIXED);
			var attr = websheet.model.ModelHelper.getValueCellJson(cell, reverseInfo.style != null);
			if (wrap) {
				if (!attr.style) attr.style = {};
				attr.style[wsconst.Style.WRAPTEXT] = true;
			}
			if (link != null) {
				if (!attr.style) attr.style = {};
				attr.style[wsconst.Style.COLOR] = "#0000ff";
				attr.style[wsconst.Style.UNDERLINE] = true;
			}
			var value = cell ? cell.getRawValue() : newValue;
			if (attr.v === undefined)
				attr.v = value;
			if (bSameFormula) {
				delete attr.v;
				delete attr.tarr;
			}

			// Somehow either attr or reverseInfo is one empty object, don't send out invalid message in this case
			var isValid = false;
			for (var id in attr) {
				for (var id2 in reverseInfo) 
					isValid = true;
			}
			if (isValid) {
				var refValue = websheet.Helper.getCellAddr(sheetName, rowIndex, websheet.Helper.getColChar(colIndex));
				event = new websheet.event.SetCell(refValue, attr);
				reverse = new websheet.event.Reverse(event, refValue, reverseInfo);
			}
			if(noValidation){
				sendOutMessage();
			}else
				validationStart();
		};
		var sendOutMessage = function () {
			if (!event) {
				//do nothing if set the same value
				return;
			}
			// remove from cell model as this cell content is changed by self
			// for clear color shading
			if (cell) {
				//cell.removeUser();
				if (self.editor.getFormulaBar()) {
					self.editor.getFormulaBar().setFormulaInputLineValue(cell.getEditValue());
				}
			}
			// send message
			self.editor.sendMessage(event, reverse);
		};
		// We may have data validataion constraint on this cell,
		var validationStart = function () {
			// starts an async data validation request;
			var validationRange = websheet.Utils.getDataValidation4Cell(sheetName, rowIndex, colIndex, true);
			var dataValidation = validationRange ? validationRange.data : null;
			if (dataValidation) {
				dataValidation.validate(validationRange, cell, result, function () {
					validationComplete();
				});
			} else {
				validationComplete();
			}
		};
		var validationComplete = function () {
			// handle data validation result, access the validation result with the 'result' object in closure;
			if (result.success) {
				// valid, send out set cell message and resolve the promise;
				sendOutMessage();
				deferredApply.resolve(result);
			} else {
				//invalid, pop-up indicates and reject user input.
				if (!(cell && cell._jsonDirty) && rowIndex && colIndex && result.cellJson) {
					//var userId = pe.authenticatedUser.getId();
					self.editor.getController().setCell(sheetName, rowIndex, colIndex, result.cellJson.v, result.cellJson.tarr, result.cellJson.userId, websheet.Constant.MSGMode.NORMAL);
					if(result.cellJson.style)
						self.editor.getController().setCellStyle(sheetName, rowIndex, colIndex, result.cellJson.style, false, true);					
				}
				result.cancel = true;
				delete result.cellJson;
				deferredApply.resolve(result);
				self.editor.getDataValidationHdl().showWarning(rowIndex, colIndex);
			}
		};
		if (success) {
			// old value is same with new value;
			result.success = true;
			if (notSendMessage) {
				return result;
			}else if(noValidation){
				return;
			}  else {
				validationStart();
				return deferredApply;
			}
		}
		
		//set info for reverse event
		if (reverseInfo.v == null) {
			reverseInfo.v = "";
		}
		//update the new value to cell
		var userId = pe.authenticatedUser.getId();
		this.editor.getController().setCell(sheetName, rowIndex, colIndex, newValue, parseTokenResult, userId, wsconst.MSGMode.NORMAL, isFormula);
		cell = sheetModel.getCell(rowIndex, colIndex);
		if(cell && cell._isUnCalc){
			cell.calComplete = function () {
				setCellComplete();
			};
			cell._calculate();
		}else{
			setCellComplete();
		}
		if (deferredApply) {
			return deferredApply;
		} else {
			return result;
		}
	},
	
	showHideRows: function (rowsArray, isHide) {
		// summary:
		//		Handle rows show hide operations and update, accept rows array.
		// rowsArray:
		// isHide:	boolean
		//		Indicates show rows or hide rows.
		var self = this;
		var length = rowsArray.length;
		var adjustFreeze = false;
		for (var i = 0, start, end; i < length; i++) {
			start = rowsArray[i].startRowIndex;
			end = rowsArray[i].endRowIndex;
			self.geometry.showHideRow(start, end, isHide);
			if (!adjustFreeze && start < self.freezeRow) {
				adjustFreeze = true;
			}
		}
		this.requestUpdate().then(function () {
			if (adjustFreeze) {
				self.adaptHeight();
				self.adjustFreezebar();
			}
		});
	},
	
	showHideColumns: function (startCol, endCol, isHide) {
		// summary:
		//		Show columns or hide columns;
		if (startCol != null && endCol != null) {
			this.geometry.showHideColumn(startCol, endCol, isHide);
		} else {
			this.geometry.loadColumnsFromModel();
		}
		var self = this;
		this.requestUpdate().then(function () {
			if (startCol <= self.freezeCol) {
				self.adaptWidth();
				self.adjustFreezebar();
			}
		});
	},
	
	setColumns: function (columnsJson, startCol, endCol) {
		// summary:
		//		Handle grid update relate with:
		//		1. Show hide columns
		//		2. Change column(s) width
		//		3. Set columns (width)
		var widthKey = websheet.Constant.Style.WIDTH;
		var changingWidth = (columnsJson[widthKey] !== undefined);
		var width, columns, column, columnIdx;
		if (changingWidth) {
			this.geometry.updateColumn(startCol, endCol, parseInt(columnsJson[widthKey]), true);
		} else if((columns = columnsJson.columns)) {
			for (var colChar in columns) {
				if ((column = columns[colChar]) && ((width = column[widthKey]) !== undefined)) {
					columnIdx = websheet.Helper.getColNum(colChar);
					this.geometry.updateColumn(columnIdx, columnIdx, width);
				}
			}
		}
		var self = this;
		this.requestUpdate().then(function () {
			if (startCol <= self.freezeCol) {
				self.adaptWidth();
				self.adjustFreezebar();
			}
		});
	},
	
	startup: function () {
		if (this._started) {
			return;
		}
		this.inherited(arguments);
	},
	
	scrollPage: function (direction) {
		// summary:
		//		Scroll page includes page up, page down, page left, page right;
		// direction:
		//		Defined in websheet/Constant/DIRECTION
		if (this._loadingRowIndex != null && this.scroller.lastVisibleRow > this._loadingRowIndex) {
			return;
		}
		var
			dir = websheet.Constant.DIRECTION;
		if (direction == dir.LEFT) {
			this.scroller.scrollByColumn(this.geometry.getFirstColumnWithLastColumn(this.scroller.firstVisibleCol, this.geometry.getScrollableWidth()));
		} else if (direction == dir.RIGHT) {
			if(this.scroller.lastVisibleCol >= websheet.Constant.MaxColumnIndex)
				return;
			this.scroller.scrollByColumn(this.scroller.lastVisibleCol);
		} else if (direction == dir.UP) {
			if (this._PCount > 1) {
				var targetLastVisibleRow = this.scroller.firstVisibleRow - 4 * (this.scroller.lastVisibleRow - this.scroller.firstVisibleRow);
				if (targetLastVisibleRow < 1) {
					this.scroller.scrollByRow(0);
				} else {
					this.scroller.scrollByRow(this.geometry.getFirstRowWithLastRow(targetLastVisibleRow, this.geometry.getScrollableHeight()));	
				}
			} else {
				this.scroller.scrollByRow(this.geometry.getFirstRowWithLastRow(this.scroller.firstVisibleRow, this.geometry.getScrollableHeight()));
			}
		} else {
			if (this.scroller.lastVisibleRow >= this.editor.getMaxRow() - 1) {
				return;
			}
			if (this._PCount > 1) {
				var targetFirstVisibleRow = this.scroller.lastVisibleRow + 4 * (this.scroller.lastVisibleRow - this.scroller.firstVisibleRow);
				if (this.scroller.lastVisibleRow >= this.editor.getMaxRow() - 1) {
					return;
				} else {
					this.scroller.scrollByRow(targetFirstVisibleRow);
				}

			} else {
				this.scroller.scrollByRow(this.scroller.lastVisibleRow);
			}
		}
		this.requestUpdate(true);
		this.scroller.endScroll();
	},
	
	scrollByDirection: function(direction, howMany) {
		/*
		 * scroll the grid by the given direction and number
		 * @param: direction {up,down,right,left}
		 * @param: howMany, an integer, to specify how many rows or columns the grid should scroll
		 * @return true if it really scrolled, false if the first visible row/col index is not change
		 */
		if(!howMany) howMany = 1;
		var sc = this.scroller,
			ret;
		if(direction == websheet.Constant.DIRECTION.DOWN)
		{
			var maxRow = this.editor.getMaxRow();
			if(sc.lastVisibleRow < maxRow)
			{
				var target = this.geometry.getFirstRowWithLastRow(Math.min(sc.lastVisibleRow + howMany, maxRow), this.geometry.getScrollableHeight());
				if (target <= sc.firstVisibleRow) {
					target = sc.firstVisibleRow + 1;
				}
				ret = sc.scrollToRow(target);
			}
		}
		else if(direction == websheet.Constant.DIRECTION.UP)
		{
			ret = sc.scrollToRow(Math.max(this.scroller.firstVisibleRow - howMany, this.freezeRow));
		}
		else if(direction == websheet.Constant.DIRECTION.LEFT)
		{
			var current = sc.firstVisibleCol;
			ret = sc.scrollToColumn(current - (this.isMirrored ? -howMany : howMany));
		}
		else if(direction == websheet.Constant.DIRECTION.RIGHT)
		{
			var current = sc.firstVisibleCol;
			ret = sc.scrollToColumn(current + (this.isMirrored ? -howMany : howMany));
		}
		return ret;
	},
	
	isInACLView: function()
	{
		return this.editor.hasACLHandler() && this.editor.getACLHandler().isInACLView();
	},
	
	getPermissions: function(range) 
	{
		range.sheetName = this.sheetName;
		return this.editor.getACLHandler().getPermission4Render(range);
	},
	
	setGridDomRect: function() {
		// summary:
		//		This contentViewRect is a cached value of the margin box of the content view, should update it when grid resized.
		
//		if (this.contentViews.getBoundingClientRect().left > 1) {
//			console.info("why this left value is 514 here ?");
//			return;
//		}
		this.contentViewRect = this.contentViews.getBoundingClientRect();
		this.contentLeftEdge = this.isMirrored ? 1 : this.lbSubviewNode.getBoundingClientRect().right - this.geometry.getFreezeWidth();
		this.contentTopEdge = this.lbSubviewNode.getBoundingClientRect().top;
		this.gridRect = this.domNode.getBoundingClientRect();
	},
	
	updateRowCount: function (rowCount) {
		// summary:
		//	Update the 'row count', row count is the max row index of current scrollable area, it can be dynamiclly updated (increased)  as user scroll.
		this.scroller.updateRowCount(rowCount);
	},
	
	updateSuspended: function () {
		// summary:
		//		Return if the grid render has been suspended;
		return this._updateSuspended;
	},
	
	updateFreezebarShadow: function () {
		// summary:
		//		If there're folded rows/columns, there will be a box shadow effect on the freeze bar;
		if (this.freezeBar && (this.freezeRow > 0 || this.freezeCol > 0)) {
			this.freezeBar.updateDragDivStatus();
		}
	},
	
	updateUI: function () {
		// summary:
		//		Update widgets on data grid.
		dojo.publish("updateUI", [{grid : this}]);
		var controller = this.editor.getController();
		this.bEnableRead = false;
		//update the size of taskFrame
		controller.updateUI(this.sheetName);
		if (!this.isEditing() && !this.selection.isPickingRange()) {
			if(this.editor.getCurrentGrid() == this && !this.isEditingDialog()){
				var formulaBar = this.editor.getFormulaBar();
				if (formulaBar) {
					formulaBar.updateFormulaInputValue();
				}
			}
		}
		
		if (this.isEditingCurrentGrid()) {
			this.inlineEditor.normalizePosition();
		} else {
			this.inlineEditor.updateCellIndicator(this.inlineEditor.isEditing());
		}
		//
		if(!this.editor.scene.isViewMode(true)){
			this._updateDVInfo(this.sheetName, this.selection.getFocusedRow() + 1, this.selection.getFocusedCol());
		}
		//
		this.bEnableRead = true;
	},
	
	updateDVInfo: function()
	{
		this._updateDVInfo(this.sheetName, this.selection.getFocusedRow() + 1, this.selection.getFocusedCol());
	},
		
	updateAll: function () {
		// invalidate all the rows height
		this.geometry.invalidateRow();
		this.geometry.invalidateCol();
		this.geometry.loadColumnsFromModel();
		this.requestUpdate().then(dojo.hitch(this, function () {
			this.adaptHeight();
			this.adaptWidth();
			this.adjustFreezebar();
		}));
		
	},
	
	updateStage: function () {
		// summary:
		//		When the view's freeze info changed, call this to make the update;
		// Notice:
		//		The update level:
		//		1.__________________Basic Canvas Layer (Canvas node at the bottom)_______________________________________________
		//		Basic layer will be clear & update with almost all kinds of update like "updateAll", "requestUpdate", or directly "_lazyFullUpdate / fullRender";
		//		Notice, some kinds of update like "updateHeaderBackground" in Selection Rectangle will not clear this layer, it will directly clear & update the widget Layer
		//		which is the second layer;
		//		2._________________Widget Canvas Layer (Another canvs above the basic layer)_____________________________________
		//		Selection highlight, comments indicator, co-editing highlight rectangles are rendering on this level;
		//		All the update that update the basic layer will also update this layer, but this layer can be updated indenpendent of the basic layer;
		//		3._________________HTML Layer (Div nodes above the widget canvas layer)__________________________________________
		//			3.1	_________________ View containers _________________
		//				These contaienrs are at the same level with the Hovering widgets level;
		//				They should keep align with the grid's view structure (freeze info), and will not change unless 'resize', 'adaptWidth', 'adatpHeight', 'updateStage' are called;
		//				3.1.1_________________Shapes _________________
		//				Image /Chart/ Shapes are located in this level;
		//				Update of this level usually triggered with the "updateUI", any operation that update the Basic Layer will always trigger this
		//			3.2__________________ Hovering widgets_________________
		//			Filter buttons, freeze bar, selection rectangles, range pickers, formula and range highlights are at this level;
		//			Update of this level usually triggered with the "updateUI", any operation that update the Basic Layer will always trigger this 
		// updateRow, updateRows 
		//		1	Basic layer;
		//		2	Widget layer;
		//		3.2 Widgets;
		//	column update (updateAll)
		//		1	Basic layer;
		//		2	Widget layer;
		//		*	Invalidate all the rows height & columns width information in the geometry;
		//		3.1	View containers;
		//		3.2	Widgets;
		//	updateStage
		//		Similar with updateAll, but keep the rows/columns information;
		//	updateUI,
		//		3.2	Widgets;
		//	updateHeaderBackground (_SelectRectangle.js)
		//		2	Widget layer;
		var self = this;
		this.requestUpdate().then(function () {
			self.adaptHeight();
			self.adaptWidth();
			self.adjustFreezebar();
		});
	},
	
	updateRow: function (rowIndex) {
		// summary:
		//		Just another useful interface;
		return this.updateRows(rowIndex, rowIndex);
	},
	
	updateRows: function (rowArray) {
		// summary:
		//		Update rows in the array; Invalidate the row height and render then.
		var bFreezeAdjust = false;
		var geometry = this.geometry;
		if (dojo.isArray(rowArray) && rowArray.length > 0) {
			for (var idx = 0, len = rowArray.length, rowIdx; rowIdx = rowArray[idx++];) {
				geometry.invalidateRow(rowIdx);
				geometry.invalidateWrapCache(rowIdx);
				if (!bFreezeAdjust && rowIdx < this.freezeRow) {
					bFreezeAdjust = true;
				}
			}
		} else {
			if (arguments.length == 0 || arguments[0] < this.freezeRow) {
				bFreezeAdjust = true;
			}
			geometry.invalidateRow(arguments[0], arguments[1] || arguments[0]);
			geometry.invalidateWrapCache(arguments[0], arguments[1] || arguments[0]);
		}
		var self = this;
		this.requestUpdate().then(function() {
			if (bFreezeAdjust) {
				self.adaptHeight();
				self.adjustFreezebar();
			}
		});
	},
	
	
	/**
	 * Validate the freeze row/column index. 
	 * 1.	We can not freeze column which contains only part of a merged cell.
	 * 2.	We will hide image, chart anything span both frozen and unfrozen rows/columns.
	 * 3.	Any other invalid row/column indexes, ie. -1...
	 * @param rowIndex	1based,
	 * @param colIndex	1based,
	 * @param bRevise	if given true, try to revise the indexes, reset them to 0 for invalid indexes.
	 * @param bSkipMerge skip the merge cells check
	 * @param bSkipImage skip the image/chart check
	 * @returns {valid:true, merge:false, image:false, rowInvalid:false, colInvalid:false}
	 * 
	 * Update:
	 *	2015-01-09
	 *	We should remove the limitation on freeze & merge;
	 */
	validateFreezePosition: function(rowIndex, colIndex, bRevise, bSkipImage){
		var result = {valid:true, merge:false, image:false};
		if(rowIndex == undefined || rowIndex == null)	rowIndex = this.freezeRow;
		if(colIndex == undefined || colIndex == null)	colIndex = this.freezeCol;
		var docObj = this.editor.getDocumentObj();
    	var sheet = docObj.getSheet(this.sheetName);
    	var imgRet;
		if((colIndex > 0 || rowIndex > 0) && !bSkipImage){
			//Check image/chart
			var areaManager = docObj.getAreaManager();
			var imageList = areaManager.getRangesByUsage(websheet.Constant.RangeUsage.IMAGE,sheet.getSheetName());
			var shapeList = areaManager.getRangesByUsage(websheet.Constant.RangeUsage.SHAPE,sheet.getSheetName());
			var chartList = areaManager.getRangesByUsage(websheet.Constant.RangeUsage.CHART,sheet.getSheetName());
			imgRet = dojo.some(imageList.concat(chartList).concat(shapeList), function(imageRange){
				var rangeInfo = imageRange._getRangeInfo();
				if(rangeInfo.sheetName == this.sheetName && rangeInfo.startRow <= this.freezeRow && rangeInfo.endRow > this.freezeRow)
					return true;
				if(rangeInfo.sheetname == this.sheetname && rangeInfo.startCol < this.colIndex && rangeInfo.endCol > this.colIndex)
					return true;
			}, {freezeRow:rowIndex, freezeCol:colIndex, sheetName:this.sheetName});
		}
    	colRet = colIndex > websheet.Constant.MaxColumnIndex || colIndex < 0;
    	rowRet = (rowIndex > this.editor.getMaxRow()) || rowIndex < 0;
    	result.valid = !((result.image = imgRet) || (result.colInvalid = colRet) || (result.rowInvalid = rowRet));
    	if(bRevise && !result.valid){
    		 if(result.colInvalid){
    			 this.freezeCol = 0;
    			 //Import file contains merge cell confilict with freeze.
    		 }
    		 if((result.rowInvalid))
    			 this.scroller.firstVisibleRow = this.freezeRow = 0;
    		sheet.setViewSetting({freezeRow: this.freezeRow, freezeCol: this.freezeCol});
    	}
		return result;
	},
	
	/*bool*/getOffGridLines: function(){
		var sheet = this.editor.getDocumentObj().getSheet(this.sheetName);
		return sheet.getOffGridLines();
	},
	
	destroy: function () {
		this.inherited(arguments);
		this.destroyDecorateView();
		if (this.freezeBar) {
			this.freezeBar.destroy();
		}
		this.geometry.endListening(this.editor.getController());
		this.geometry = null;
		this.selection.destroy();
		this.selection = null;
	},
	
	_connectEvents: function () {
		if(pe.scene.bMobileBrowser) {
			var self = this;
			dojo.connect(this.containerNode, dojox.gesture.tap, function(e){
				self.onTap(e);
			});
			dojo.connect(this.containerNode, dojox.gesture.tap.doubletap, function(e){
				self.onDoubleTap(e);
			});
			dojo.connect(this.containerNode, dojox.gesture.tap.hold, function(e){
				self.onHoldTap(e);
			});
		}
		var evts = this.mouseEvents;
    	for (var i=0, l = evts.length; i<l; i++){
			this.connect(this.containerNode, 'on' + evts[i], this.dispatchMouseEvents);
		}
    	evts = this.keyEvents;
    	for (var i=0, l = evts.length; i<l; i++){
			this.connect(this.containerNode, 'on' + evts[i], this.dispatchKeyEvents);
		}
    	// scroll event
    	if (dojo.isFF) {
    		this.connect(this.containerNode, "DOMMouseScroll", "onMouseWheel");
    	} else {
    		this.connect(this.containerNode, 'onmousewheel', 'onMouseWheel');
    	}
    	this.connect(this.vScrollNode, "onscroll", "onVScroll");
    	this.connect(this.hScrollNode, "onscroll", "onHScroll");
    	
    	this.connect(this.vScrollNode, "onmousedown", "onScrollerMouseEvent");
    	this.connect(this.vScrollNode, "onmouseup", "onScrollerMouseEvent");
    	this.connect(this.hScrollNode, "onmousedown", "onScrollerMouseEvent");
    	this.connect(this.hScrollNode, "onmouseup", "onScrollerMouseEvent");
    	
    	// drag drop events
    	dojo.connect(document, "dragover", function (e) {
    		dojo.stopEvent(e);
    	});
    	if (dojo.isIE) {
    		dojo.connect(document, "dragleave", dojo.hitch(this, "onDragLeave"));
        	dojo.connect(document, "dragenter", dojo.hitch(this, "onDragEnter"));
    		dojo.connect(this.domNode, "drop", dojo.hitch(this, "onDragDrop"));
    	} else {
    		dojo.connect(this.contentViews, "dragleave", dojo.hitch(this, "onDragLeave"));
        	dojo.connect(this.contentViews, "dragenter", dojo.hitch(this, "onDragEnter"));
    		dojo.connect(this.contentViews, "drop", dojo.hitch(this, "onDragDrop"));
    	}
    		
	},

	_createScroller: function () {
		this.scroller = new websheet.grid.Scroller(this);
		dojo.attr(this.yScrollNode, 'tabindex', '-1');
		dojo.attr(this.xScrollNode, 'tabindex', '-1');
		if (pe.scene.bMobileBrowser) {
			// hide scroll bar
			this.scrollbarSize = 0;
			dojo.style(this.yScrollNode, {display:"none"});
			dojo.style(this.xScrollNode, {display:"none"});
		}
	},
	
	_createOwns: function () {
		this.geometry = new websheet.grid.GridGeometry(this);
		this.renderer = websheet.grid.GridRender.getRenderer();
		this.selection = new websheet.grid.SelectionManager(this);
		this.inlineEditor = this.editor.getController().getInlineEditor(this);
		this.editorNode = this.inlineEditor.getNode();
		this.selection.picker().subscribe(this.inlineEditor);
		this.geometry.startListening(this.editor.getController());
	},
	

	_getCellInfoWithPosition: function(result, offsetX, offsetY, delta, rangeInfo, render, reviseRow, includeBottom, includeRight){
    	result["rowReviseOffset"] = 0;
    	result["colReviseOffset"] = 0;
    	var rowsdata = websheet.model.ModelHelper.getRows(rangeInfo, true, true);
    	var defaultHeight = this.geometry.defRowHeight;
    	var r;
    	if (delta > 0)
    		r = rangeInfo.startRow - 1;
    	else
    		r = rangeInfo.endRow - 1;
    	var found = false;
    	var rowheight=null;
    	var maxSheetRow = this.editor.getMaxRow();
    	
    	//var below only defined and used if rowsdata is not null
    	
    	var tEdge, bEdge, curr, rows;
    	if (rowsdata){    		
    		rows = rowsdata.data;
    		tEdge = rows.length - 1;
    		bEdge = 0;
    		if(delta > 0)
    			curr = bEdge;
    		else
    			curr = tEdge;
    	}
    	while(r <= (rangeInfo.endRow -1 ) && r >= (rangeInfo.startRow - 1)){
    		if (rowsdata){
				var foundRow = false;
    			for(var i = curr; i <= tEdge && i >= bEdge; i= i + delta){
    				if(!rows[i]){
						continue;
					}
    				rIndex = rows[i].getIndex() - 1;
    				if(r >= rIndex && r <= rIndex+ rows[i].getRepeatedNum()){
    					var height = defaultHeight;
    					if(!rows[i]){
    					}
    					else if(rows[i].isVisibility()){
    						height = this.geometry.preciseRowHeight(rIndex);
						} else {
							height = 0;
						}

    					rowheight = height;
    					if(delta < 0)
    						offsetY += height;
    					else
    						offsetY -= height;
    					foundRow = true;
    					curr = i;
    					break;

    				}else if(rIndex > r){
    					break;
    				}
	    		}
    			if(!foundRow){
    				rowheight = defaultHeight;
    				if(delta < 0)
    					offsetY += defaultHeight;
    				else
    					offsetY -= defaultHeight;
    			}
			} else {
				rowheight = defaultHeight;
				if(delta < 0)
					offsetY += defaultHeight;
				else
					offsetY -= defaultHeight;
			}
			if(delta < 0){
				if(offsetY >= 0 ){
					result["rowIndex"]= r;
					result["rowOffset"]= offsetY ;
					found = true;
					break;
				}
			}else{
				if(offsetY < 0){
    				result["rowIndex"]= r;
    				result["rowOffset"]= rowheight + offsetY ;
    				found = true;
    				break;
    			}
				if(offsetY == 0){
					if(includeBottom){
						result["rowIndex"]= r;
						result["rowOffset"]= rowheight;
					}else{
						if(r + 1 < maxSheetRow ){
							result["rowIndex"]= r + 1;
							result["rowOffset"]= offsetY ;
						}else{
							result["rowIndex"]= maxSheetRow - 1;
							result["rowOffset"]= rowheight ;
						}
					}

    				found = true;
    				break;
    			}
			}
			r += delta;
    	}

    	if(!found){
    		result["found"]= false;
	    	if(delta < 0){
	    		if(reviseRow){
	    			result["rowIndex"]= 0;
	    			result["rowOffset"]= 0;
	    			result["rowReviseOffset"] = offsetY;
	    		}
	    		else{
	    			result["rowIndex"]= -1;
	    			result["rowOffset"]= offsetY;
	    		}

	    	}else{
	    		if(reviseRow){
	    			result["rowOffset"]= rowheight;
	    			result["rowIndex"]= maxSheetRow - 1;
	    			result["rowReviseOffset"] = offsetY;
	    		}else{
	    			result["rowOffset"]= offsetY;
	    			result["rowIndex"]= maxSheetRow;
	    		}
	    	}
    	}
    	// get current colindex based on offsetX
		var maxCol = websheet.Constant.MaxColumnIndex;
		found = false;
		var cells = this.geometry._widthArray;
		if(offsetX >= 0){
			for(var i = 1, len = cells.length; i < len; i++){
				var colWidth = cells[i - 1];
				if (colWidth <= 0) {
					continue;
				}
				offsetX -= colWidth;
				if(offsetX < 0){
					found = true;
					result["colIndex"]= i;
					result["colOffset"]= colWidth + offsetX;
					break;
				}
				if(offsetX == 0){
					found = true;
					if(includeRight){
						result["colIndex"]= i;
						result["colOffset"]= colWidth;
					}else{
						if(i + 1 <= maxCol){
							result["colIndex"]= i + 1;
							result["colOffset"]= offsetX;
						}else{
							result["colIndex"]= maxCol;
							result["colOffset"]= parseInt(cells[cells.length - 1]);
						}
					}
					break;
				}
			}
			if(!found){
				result["colIndex"]= maxCol;
    			result["colOffset"]=  parseInt(cells[cells.length - 1]);
    			result["colReviseOffset"] = offsetX;
			}
		}else{
			result["colIndex"]= 1;
			result["colOffset"]= 0;
			result["colReviseOffset"] = offsetX;
		}
		return result;
    },
    
	_onShow: function () {
		// From tab container, redirect to "onShow"
		this.onShow();
	}
});