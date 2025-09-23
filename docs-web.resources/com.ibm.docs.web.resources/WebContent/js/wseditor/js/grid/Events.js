/* ***************************************************************** */
/*                                                                   */
/* HCL Confidential                                                  */
/*                                                                   */
/* OCO Source Materials                                              */
/*                                                                   */
/* Copyright HCL Technologies Limited 2010, 2022                     */
/*                                                                   */
/* The source code for this program is not published or otherwise    */
/* divested of its trade secrets, irrespective of what has been      */
/* deposited with the U.S. Copyright Office.                         */
/*                                                                   */
/* ***************************************************************** */

dojo.provide("websheet.grid.Events");
dojo.require("concord.util.browser");
dojo.requireLocalization("websheet","base");
dojo.requireLocalization("concord.widgets", "InsertImageDlg");

dojo.declare("websheet.grid.Events", null, {
	// Module websheet/canvas/Events
	// Description:
	//		Handle all the keyboard/mouse events of the data grid.
	
	mouseEvents	: [ 'mouseover', 'mouseout', 'mousemove', 'mousedown', 'mouseup', 'click', 'dblclick', 'contextmenu', 'touchstart','touchend', 'touchmove'],
	keyEvents	: [ 'keyup', 'keydown', 'keypress' ],
	lastFocusNode : null,
	
	decorateEvent: function (e) {
		// summary:
		//		Attach data
		var location;
		if(e.target != this.yScrollNode && e.target != this.xScrollNode && (location = this.transformEvent(e.pageX, e.pageY))){
			var range = location.range,
				x = location.x,
				y = location.y,
				view = location.view;
			if(range){
				e.grid = this;
				e.sourceView = view;
				var pos = this.geometry.locatingCell(x, y, range, true);
				// can not locate any cell, such as click the blank space which due to the last row/column have been hided
				if(pos.col == null || pos.row == null)
					return false;
				e.cellIndex = pos.col;
				e.rowIndex = pos.row;
				e.headerCellOffsetX = pos.offsetX;
				e.headerCellOffsetY = pos.offsetY;
				return true;
			}
		}
		return false;
	},
	
	dispatchMouseEvents: function(e){
		var d = '_on' + e.type;
    	if(d in this && this.decorateEvent(e))
    		return this[d](e);
	},
	
	dispatchKeyEvents: function(e){
		var d = '_on' + e.type;
    	if(d in this)
    		return this[d](e);
	},
	
	_modifyCMByACL: function(configs, canEdit, type)
	{
		var isSheetProtected = websheet.model.ModelHelper.isSheetProtected();
		if(isSheetProtected)
		{
			var w = dijit.registry.byId("S_CM_ACL");
			if(w)
				w.set('disabled',true);
			return;
		}
		
		if(!this.editor.hasACLHandler()) return;
		var bhChecker = this.editor.getACLHandler()._behaviorCheckHandler;
		var selector = this.selection.selector();
		for(var len = configs.length, i = len -1; i >= 0; i--)
		{
			var config = configs[i];
			var w = dijit.registry.byId(config.id);
			if(w)
			{
				var visible = canEdit || !!config.aclMODE;
				w.attr('disabled',!visible);
			}	
		}
		
		if(type == websheet.Constant.Row || type == websheet.Constant.RowRange)
		{
			var ret = bhChecker.canCurUserInsDlt(this.sheetName, selector._startRowIndex+1, selector._endRowIndex+1,true);
			var w = dijit.registry.byId("S_CM_InertRowAbove");
			if(w) w.attr('disabled',!ret.canInsertBefore);
			w = dijit.registry.byId("S_CM_InertRowBelow");
			if(w) w.attr('disabled',!ret.canInsertAfter);
			w = dijit.registry.byId("S_CM_DeleteRow");
			if(w) w.attr('disabled',!(canEdit && ret.canDelete));
		}
		else if(type == websheet.Constant.Column || type == websheet.Constant.ColumnRange)
		{
			var ret = bhChecker.canCurUserInsDlt(this.sheetName, selector._startColIndex, selector._endColIndex);
			var w = dijit.registry.byId("S_CM_InsertColumnBefore");
			if(w) w.attr('disabled',!ret.canInsertBefore);
			w = dijit.registry.byId("S_CM_InsertColumnAfter");
			if(w) w.attr('disabled',!ret.canInsertAfter);
			w = dijit.registry.byId("S_CM_DeleteColumn");
			if(w) w.attr('disabled',!(canEdit && ret.canDelete));
		}
		else if(type == websheet.Constant.Range || type == websheet.Constant.Cell){
			var addr = selector.getSelectedRangeAddress();
			var addrUp = websheet.Utils.getImpactedRange4InsertOrDel(true, true, addr);
			var addrLeft = websheet.Utils.getImpactedRange4InsertOrDel(true, false, addr);
			var addrDown = websheet.Utils.getImpactedRange4InsertOrDel(false, true, addr);
			var addrRight = websheet.Utils.getImpactedRange4InsertOrDel(false, false, addr);
			var w = dijit.registry.byId("S_CM_DeleteCellUp");
			if(w) w.attr('disabled', !bhChecker.canCurUserEditRange(addrUp));
			w = dijit.registry.byId("S_CM_DeleteCellLeft");
			if(w) w.attr('disabled', !bhChecker.canCurUserEditRange(addrLeft));
			w = dijit.registry.byId("S_CM_InsertCellDown");
			if(w) w.attr('disabled', !bhChecker.canCurUserEditRange(addrDown));
			w = dijit.registry.byId("S_CM_InsertCellRight");
			if(w) w.attr('disabled', !bhChecker.canCurUserEditRange(addrRight));
		}
	},
	
	modifyContextMenu: function(e, type, enable)
	{
		var contextMenu = dijit.byId("grid_context_menu");
		var selector = this.selection.selector();
		if(!contextMenu)
			return;

		var commonItems = window["pe"].commonItems;
		var cmLen = commonItems.length;
		var commonConfig = getCommonCMenuConfig();
		var editor = websheet.model.ModelHelper.getEditor();
		
		var canEdit = true, bhChecker = null, addr = null;
		if(this.editor.hasACLHandler())
		{
			bhChecker = this.editor.getACLHandler()._behaviorCheckHandler;
			addr = selector.getSelectedRangeAddress();
			canEdit = bhChecker.canCurUserEditRange(addr);
		}
		for (var i = 0; i < commonConfig.length; i++) {
			var config = commonConfig[i];
			var w = dijit.registry.byId(config.id);
			if(w){
				if (type == "chart") {
					w.attr('disabled', !enable);
				} else {
					var visible = _showInCurrMode(editor.scene, config) && ( canEdit || !!config.aclMODE);
					w.attr('disabled',!visible);
				}
			}
		}
		
		if( !this.editor.hasACLHandler() && type == contextMenu.type && type != websheet.Constant.Range)
		{
			if(type=="chart")
			{
				var chartConfig = getChartCMenuConfig();
				for(var i = 0; i < chartConfig.length; i++){
					var config = chartConfig[i];
					var w = dijit.registry.byId(config.id);
					if(w){
						w.attr('disabled', !enable);
					}
				}
			}
			return;
		}
		contextMenu.type = type;

		var children = contextMenu.getChildren();
		var length = children.length;

		var items = null;
		if(type == websheet.Constant.Cell || type == websheet.Constant.Range)
		{
			items = window["pe"].cellMenu;
			var configs = getCellCMenuConfig();
			this._modifyCMByACL(configs, canEdit, type);
			var m_sitem = dijit.byId("S_CM_MergeSplit");
			if(m_sitem){
				var canMerge = bhChecker ? bhChecker.canMergeCell(addr) : true;
				if(this.editor.scene.isViewMode() || websheet.model.ModelHelper.isSheetProtected() || !canEdit || !canMerge){
					m_sitem.attr('disabled',true);
				}else{
					m_sitem.attr('disabled',false);
					if (type == websheet.Constant.Range && selector._startColIndex == selector._endColIndex
							&& selector._startRowIndex == selector._endRowIndex){
						m_sitem.attr('disabled',true);
					}
				}

			}
			if(pe.scene.bMobileBrowser) {
				var autofill_item = dijit.byId("S_CM_Autofill");
				if(autofill_item) {
					if(this.editor.scene.isViewMode() || websheet.model.ModelHelper.isSheetProtected()){
						autofill_item.attr('disabled', true);
					} else {
						autofill_item.attr('disabled', false);
					}
				}
			} 
		}
		else if(type == websheet.Constant.Row || type == websheet.Constant.RowRange)
		{
			items = window["pe"].rowMenu;
			var configs = getRowCMenuConfig();
			this._modifyCMByACL(configs, canEdit, type);
		}
		else if (type == websheet.Constant.Column || type == websheet.Constant.ColumnRange)
		{
			items = window["pe"].colMenu;
			var configs = getColCMenuConfig();
			this._modifyCMByACL(configs, canEdit, type);
		}

		else if(type == websheet.Constant.Sheet)
		{
			items = [];
			var size = window["pe"].rowMenu.length;
			for(var i = 0; i < size; i++)
			{
				if(window["pe"].rowMenu[i].id == "S_CM_ClearRow")
				{
					items.push(window["pe"].rowMenu[i]);
					break;
				}
			}
		}
		else if(type=="chart")
		{
			items = window["pe"].chartMenu;
			for(var i = 0; i < items.length; i++)
			{
				items[i].attr('disabled', !enable);
			}
		}
		else if(type=="image")
		{
			items = window["pe"].imageMenu;
		}

		// add the common items.
		if( 0 == length)
		{
			for(var i = 0; i <  cmLen; i++)
				contextMenu.addChild(commonItems[i]);
			if (cmLen > 0)
				contextMenu.addChild(new dijit.MenuSeparator());
		}
		var commonItemsLen = cmLen + 1;
		for(var i = length-1; i >= commonItemsLen; i--)
		{
			contextMenu.removeChild(children[i]);
		}
		if(items)
		{
			for(var i = 0; i < items.length; i++)
			{
				contextMenu.addChild(items[i]);
			}
		}
	},
	
	needScrollPage: function(e) {
		// If user press the page_down/ page_up key for a long time, 
		// it would triger page down/ up too many times, and the interval is too short for execuation
		// here check if the  interval less than 400ms, do nothiing
		var bScroll = true;
		if (dojo.isFF || dojo.isIE < 10) {
			if (!this._PCount) {
				this._LastTimeStamp = 1;
				this._PCount = 1;
			} else {
				this._PCount++;
			}
			var interval = e.timeStamp - this._LastTimeStamp;
			if(this._PCount > 1 && interval < 400) {
				bScroll = false;
			} else {
				this._LastTimeStamp = e.timeStamp;
			}
		}
		return bScroll;
	},
	
	onKeyUp: function(e){
		// summary:
		//		Fired when key up on data grid.
		//		Should sync value in editor to formula input line.
		var
			keyCode = e.keyCode,
			keys = dojo.keys;
		this._PCount = 0;
		var inlineEditor = this.inlineEditor;
		if (inlineEditor.isEditing()) {
			var value = inlineEditor.getValue();
			if (value != null) {
				var formulaBar = this.editor.getFormulaBar();
				if (formulaBar) {
					formulaBar.syncFormulaBarOnKeyUp(value);
				} 
			}
		} else {
			switch (keyCode) {
			case keys.UP_ARROW:
			case keys.DOWN_ARROW:
				if (e.altKey ) {
					this.endKeyboardResizeHeader(true) && dojo.stopEvent(e);
				} 
				break;
			case keys.RIGHT_ARROW:
			case keys.LEFT_ARROW:
				if (e.altKey ) {
					this.endKeyboardResizeHeader(false) && dojo.stopEvent(e);
				} 
				break;
			}
		}
	},
	
	onKeyDown: function(e){
		// summary:
		// 		Grid key event handler. By default enter begins editing and applies edits, escape cancels an edit,
		// 		tab, shift-tab, and arrow keys move grid cell focus.
		var
			keyCode = e.keyCode,
			keys = dojo.keys;
		var selector = this.selection.selector();
		//Some cases we need to stop event and directly return;
		if (selector.isSelecting() || selector.isAutofilling()) {
			return dojo.stopEvent(e);
		}
		
		if (this.freezeBar && (this.freezeBar.isMovingRow || this.freezeBar.isMovingCol)) {
			dojo.stopEvent(e);
			return;
		}

		if (dojo.isMac && dojo.isChrome) {
    		//Chrome on Mac has problem with KeyPress Combinations, Handle the potential short-cut when keydown
    		//They're C(Command) + A, C + B, C + Z/Y (undo redo), C + F(search), C + P(page settings).......
    		e.keyChar = String.fromCharCode(e.keyCode);
    		this._acceptableKeyPress(e, this._shortcuts(e));
    	}
		
		if (!this._acceptableKeyDown(e)) {
			return;
		}
		var maxRow = this.editor.getMaxRow();
		
		if (keyCode == keys.DELETE || keyCode == keys.BACKSPACE) {
			// find selected image and delete the image, should return directly to void clear the cell content
			if(this.editor.getDrawFrameHdl().delSelectedDrawFrames(this.sheetName))
			{
				dojo.stopEvent(e);
				return selector.wakeup().render();
			}
		}
		
		if(e.shiftKey && keyCode == keys.F10){
			dojo.stopEvent(e);
			var ctxMenu = dijit.byId("grid_context_menu");
			var target = selector.getSelectType() == websheet.Constant.Cell ? this.selection._selector.domNode : this.selection._selector.hotCell;
			ctxMenu._scheduleOpen(this.selection._selector.domNode, null, null, target);
			return;
		}
		
		if (this.editor.hasDrawFrameSelected()) {
			if (keyCode == dojo.keys.ESCAPE) {
				this.editor.getDrawFrameHdl().unSelectDrawFrames(this.sheetName);
				selector.render();
			}
			if (keyCode == dojo.keys.TAB) {
				if (!this.editor.scene.isViewMode()) {
					e.preventDefault();
				}
			}
			if (keyCode != keys.LEFT_ARROW && keyCode != keys.RIGHT_ARROW && keyCode != keys.UP_ARROW && keyCode != keys.DOWN_ARROW)
				return;
			else if (this.editor.scene.isViewMode()) {
				// should disable move image with keyboard under view mode
				return;
			}
		}
		
		if ((keyCode == dojo.keys.ENTER) && (e.ctrlKey || e.altKey || e.metaKey)) {
			var apply = dojo.isIE && e.altKey;
			//in IE, it's full screen short-key, just apply the editing if switch to full screen.
			if (apply){
				if (this.isEditing()){
					this.apply();
				}
			}
			return;
		}
		var clipBoard = this.editor._clipboard;
		var formatPainter = this.editor._formatpainter;
		var formulaBar = this.editor.getFormulaBar();
		switch (keyCode) {
		case keys.BACKSPACE:
		case keys.DELETE:
			if (!this.isEditing()) {
				formatPainter.clear();
				clipBoard.exitSelect(true);
				this.editor.execCommand(commandOperate.CLEAR);
			}
			break;
		case keys.ESCAPE:
			formatPainter.clear();
			clipBoard.exitSelect(true);
			if (this.isEditing()) {
				this.cancel();
			}
			if (formulaBar) {
				formulaBar.updateFormulaInputValue();
			}
			if(this.lastFocusNode && this.dataSelectionHelper){
				this.dataSelectionHelper.close();
			}
			this.editor.focus2Grid();
			e.preventDefault();
			break;
		case keys.ENTER:
			dojo.stopEvent(e);
			var grid = this;
			var direction = e.shiftKey ? websheet.Constant.DIRECTION.UP : websheet.Constant.DIRECTION.DOWN;
			if (this.isEditing()) {
				if (!this.isEditingCurrentGrid()) {
					grid = this.getInlineEditor().getEditGrid();
				}
				try {
					grid.apply().then(function (result) {
						if (result.success) {
							grid.selection.navigate(direction, false);
						}
					});
				} catch (e) {}
			} else {
				grid.selection.navigate(direction, false);
			}
			break;
		case keys.PAGE_UP:
		case keys.PAGE_DOWN:
			if (this._scrollingTimer) {
				return;
			} else {
				var 
					self = this,
					sc = this.scroller,
					dir = websheet.Constant.DIRECTION;
				if (e.metaKey || e.ctrlKey) {
					//Chrome has ShortCuts as C+PAGE_UP/PAGE_DOWN to swtich between the pages in different tabs.
		    		//And unlike other browsers, it blocked the ShortCut events thus we can not handle them before the browser do.
		    		//To switch between sheets in Chrome, use Ctrl(Command) + Shift + PAGE_UP/PAGE_DOWN instead of Ctrl + PAGE_UP/PAGE_DOWN.
		    		e.charOrCode = e.keyCode;
		    		var container = this.editor.getWorksheetContainer();
		    		dojo.publish(container.id + "-containerKeyDown", [{ e: e, page: container}]);
		    		dojo.stopEvent(e);
				} else {
					if (!this.needScrollPage(e)) {
						return;
					}
					this._scrollingTimer = setTimeout(function () {
						self._scrollingTimer = null;
						var selector = self.selection.selector();
						var selected = self.selection.getFocusedCell();
						var focusRow = selected.focusRow,
						focusCol = selected.focusCol,
						focusOffset;
						if(e.altKey)
							focusOffset = focusCol - sc.firstVisibleCol;
						else
							focusOffset = focusRow - sc.firstVisibleRow;
						self.scrollPage((keyCode == keys.PAGE_UP) ? (e.altKey ? dir.LEFT : dir.UP) : (e.altKey ? dir.RIGHT: dir.DOWN));
						if(e.altKey) {
							focusCol = sc.firstVisibleCol + focusOffset;
							if(focusCol > sc.lastVisibleCol)
								focusCol = sc.lastVisibleCol;
							focusCol = self.searchVisibleCol(focusCol);
						} else {
							focusRow = sc.firstVisibleRow + focusOffset;
							if(focusRow > sc.lastVisibleRow)
								focusRow = sc.lastVisibleRow;
							focusRow = self.searchVisibleRow(focusRow);
						}
						selector.selectCell(focusRow, focusCol);
					}, 10);
				}
			}
			break;
		case keys.SPACE:
			if (!this.isEditing()) {
				if ((e.ctrlKey ||e.metaKey) && e.shiftKey)
					selector.selectRow(0, maxRow - 1);
				else if((e.ctrlKey || e.metaKey)) {
					if (selector.selectingRows()) {
						selector.selectRow(0, maxRow - 1);
					} else {
						var exRange = websheet.Utils.getExpandRangeInfo(selector.getRangeInfo());
						selector.selectColumn(exRange.startCol, exRange.endCol);
					}
				} else if(e.shiftKey) {//select ROW
					if (selector.selectingColumns()) {
						selector.selectRow(0, maxRow - 1);
					} else {
						selector.selectRow(selector._startRowIndex, selector._endRowIndex);//select ROW(s);
					}
				}
				//don't stopEvent in IE or Safari. Defect 21202
				if (dojo.isFF){
					dojo.stopEvent(e);
				}
				if (this.a11yEnabled()) {
					var range = selector.getRangeInfo();
					if (selector.selectingRows(true)) {
						// selecting multiple rows;
						this.announce(dojo.string.substitute(this.accnls.ACC_ROWS_SEL, [(range.startRow), (range.endRow)]));
					} else if (selector.selectingRows()){
						// selecting single row;
						this.announce(dojo.string.substitute(this.accnls.ACC_ROW_SEL, [(range.startRow)]));
					} else if (selector.selectingColumns(true)) {
						// multiple columns;
						this.announce(dojo.string.substitute(this.accnls.ACC_COLS_SEL, [websheet.Helper.getColChar(range.startCol), websheet.Helper.getColChar(range.endCol)]));
					} else if (selector.selectingColumns()) {
						// single column;
						this.announce(dojo.string.substitute(this.accnls.ACC_COL_SEL, [websheet.Helper.getColChar(range.endCol)]));
					}
				}
			}
			if(e.ctryKey || e.metaKey) this.isNeededToApply4Arrow(e);
			break;
		case keys.TAB:
			if (this.editor.scene.isViewMode()) {
				return;
			} else {
				dojo.stopEvent(e);
				if (e.ctrlKey) {
					return;
				}
				var linkDiv = this.getLinkDiv();
				if (linkDiv.isShow()) {//if current cell contains hyperlink, navigate to it when press tab.
					linkDiv.onKeydown(e);
					return;
				}
				var grid = this;
				var direction = e.shiftKey ? websheet.Constant.DIRECTION.LEFT : websheet.Constant.DIRECTION.RIGHT;
				if (this.isEditing()) {
					if (!this.isEditingCurrentGrid()) {
						grid = this.getInlineEditor().getEditGrid();
					}
					grid.apply().then(function (result) {
						if (result.success) {
							grid.selection.navigate(direction, true);
						}
					});
				} else {
					grid.selection.navigate(direction, true);
				}
			}
			break;
		case keys.UP_ARROW:
		case keys.DOWN_ARROW:
			if (this.editor.getDrawFrameHdl().onArrowKeyDown(this.sheetName, e, keyCode)) {
				return dojo.stopEvent(e);
			}
			if(this.lastFocusNode && this.dataSelectionHelper && this.dataSelectionHelper.onArrowKey()){
				return dojo.stopEvent(e);
			}
			if(e.altKey){
				if(this.beginKeyboradResizeHeader(true, keyCode == keys.DOWN_ARROW))
					dojo.stopEvent(e);
				else if(keyCode == keys.DOWN_ARROW && !this.isEditing()){
					// drop down filter if any;
					var filters = this.editor.getAutoFilterHdl().getFilter(this.sheetName);
					var bFilter = false;
					if (filters) {
						var focusedCell = this.selection.getFocusedCell();
						var filterRange = filters._range._getRangeInfo();
						if (focusedCell.focusRow + 1 == filterRange.startRow && focusedCell.focusCol >= filterRange.startCol && focusedCell.focusCol <= filterRange.endCol) {
							filters.showMenu(focusedCell.focusCol);
							bFilter = true;
							return dojo.stopEvent(e);
						}
					}
					if(!bFilter)
					{
						if (this.lastFocusNode){
							if(this.dataSelectionHelper){
								this.dataSelectionHelper.showMenu();
							}
						}
					}
				}
			}
			this._rangepickingOrApply(e);
			if (e.shiftKey && !e.ctrlKey && !this.isEditing()) {
				this.selection.shiftSelecting(keyCode);
			} else if (!e.altKey && !this.isEditing()) {
				this.selection.moveFocus(keyCode, e);
			}
			if (!this.isEditing()) {
				dojo.stopEvent(e);
			}
			break;
		case keys.RIGHT_ARROW:
		case keys.LEFT_ARROW:
			if (this.editor.getDrawFrameHdl().onArrowKeyDown(this.sheetName, e, keyCode)) {
				return dojo.stopEvent(e);
			}
			if(!this.isEditing()){
				if(e.altKey ){
					if (this.beginKeyboradResizeHeader(false, keyCode == keys.RIGHT_ARROW)) {
						dojo.stopEvent(e);
					} else {
						var filter = this.editor.getAutoFilterHdl().getFilter(this.sheetName);
						if (filter && selector.selectingCell() && !websheet.model.ModelHelper.isSheetProtected(this.sheetName)) {
							var info = filter.getRangeInfo();
							var selected = this.selection.getFocusedCell();
							var irow = selected.focusRow + 1;
							var icol = selected.focusCol;
							if (info.startRow == irow && icol >= info.startCol && icol <= info.endCol) {
								filter.showMenu(icol);
								dojo.stopEvent(e);
								break;
							}
						}
					}
				}
			}
			this._rangepickingOrApply(e);
			if (e.shiftKey && !e.ctrlKey && !this.isEditing()) {
				this.selection.shiftSelecting(keyCode);
			} else if (!e.altKey && !this.isEditing()){
				this.selection.moveFocus(keyCode, e);
			}
			break;
		case keys.F2:
	    	clipBoard.exitSelect(true);
	    	formatPainter.clear();
	    	this.inlineEditor.shouldMoveRangePicker(false);
			if (!this.isEditing()) {
				if(e.shiftKey){//edit comment.
					break;
				}
				dojo.stopEvent(e);
				this.inlineEditor.editingStart();
				this.inlineEditor.collapseToEnd();
			}
			break;
		case keys.HOME:
		case keys.END:
			if(!this.isEditing()) {
				this._navigateToBlockEdge(e);
			}
			break;
		default:
			//Here we will enter editing mode in case user press some character keys.
			//In FF, keycode 0 is sent when IME active, in Safari/IE, it's 229, 197 in some browser
			//I remove the keycode == 0 since some function keys such as "Mute" "increase volume" will also send 0,
			//In ff, there's no preeditng mode, so IME is not opened in advance.
			if (!e.altKey && !e.ctrlKey && !e.metaKey && !this.isEditing() &&
					(this._isPrintableKey(e)|| /*e.keyCode == 0||*/ e.keyCode == 229 || e.keyCode == 197)) {
				var cmtHdl = this.editor.getCommentsHdl();
				if (cmtHdl.newCmt || cmtHdl.activeId) {
					return;
				}
				var focusedRow = this.selection.getFocusedRow();
				var focusedCol = this.selection.getFocusedCol();
				if (websheet.model.ModelHelper.isCellProtected(this.sheetName, focusedRow + 1, focusedCol)) {
					return;
				}
				var inlineEditor = this.inlineEditor;
				inlineEditor.editingStart(true);
				this.pre2Edit = true;
				inlineEditor.shouldMoveRangePicker(true);
			}
		}
	},
	
	_navigateToBlockEdge: function (e) {
		// summary:
		//		Handle on CTRL + HOME/END, move to the start/end position of the selected content block;
		var keyCode = e.keyCode;
		var keys = dojo.keys;
		var maxRow = this.editor.getMaxRow();
		var focusedRow = this.selection.getFocusedRow();
		var row, col, 
			backward = false;
		if(this.isCtrlPressed(e)){
			//move to document start/end
			if (keyCode == keys.HOME){
				row = 1;
				col = 1;
			} else {
				backward = true;
				var sheet = this.editor.getDocumentObj().getSheet(this.sheetName);
				row = websheet.model.ModelHelper.getValidLastRow(sheet, true);
				if(row > maxRow)
					row = maxRow;
				col = websheet.model.ModelHelper.getValidLastCol(sheet, true);
				if(col > websheet.Constant.MaxColumnIndex)
					col = websheet.Constant.MaxColumnIndex;
			}
		} else {
			// move to focused row start/end
			if(keyCode == keys.HOME){
				row = focusedRow + 1;
				col = 1;
			}else{
				backward = true;
				row = focusedRow + 1;
				var sheet = this.editor.getDocumentObj().getSheet(this.sheetName);
				var rowModel = sheet.getRow(row, true);
				col = websheet.model.ModelHelper.getLastCellInRow(rowModel);
			}
		}
		row = this.searchVisibleRow(row - 1, backward) + 1;
		col = this.searchVisibleCol(col, backward);
		var focusCellRef = new websheet.parse.ParsedRef(this.sheetName, row, col, -1, -1, websheet.Constant.CELL_MASK);
		this.editor.setFocus(focusCellRef);
		dojo.stopEvent(e);
	},
	
	onKeyPress: function (e) {
		// summary:
		//		Event fired when keypress, we should handle grid short-cuts here.
		if (this.freezeBar && (this.freezeBar.isMovingRow || this.freezeBar.isMovingCol)) {
			dojo.stopEvent(e);
			return;
		}
		if(!this.isEditing() && dojo.isFF && (e.keyCode == dojo.keys.HOME || e.keyCode == dojo.keys.END)){
			this._navigateToBlockEdge(e);
			return;
		}
		
		var inlineEditor = this.inlineEditor;
		var formulaBar = this.editor.getFormulaBar();
		if (!this.isEditing() || this.pre2Edit) {
			var isShortcut = this._shortcuts(e);
			if (!this._acceptableKeyPress(e, isShortcut)) {
				return;
			}
			if (e.keyChar!="") {
				// user press some characters
				if (!isShortcut && !e.altKey && !e.ctrlKey && !e.metaKey) {
					if (this.editor.hasDrawFrameSelected()) {
						return;
					}
					var cmtHdl = this.editor.getCommentsHdl();
					if (cmtHdl.newCmt || cmtHdl.activeId) {
						return;
					}
					this.inlineEditor.shouldMoveRangePicker(true);
					this.pre2Edit = false;
					this.inlineEditor.editingStart();
					
					// if e.keyChar is one digit and the cell has percent number format, append % after the digit
					var keyChars = e.keyChar;
					var bFillPer;
					if (e.charCode >= 48 && e.charCode <= 57 ) { // digit '0' - '9'
						var colIndex = this.selection.getFocusedCol();
						var rowIndex = this.selection.getFocusedRow() + 1;
						var style = websheet.model.ModelHelper.getStyleCode(this.sheetName, rowIndex, colIndex);
						var category = this.editor.getDocumentObj()._styleManager.getAttr(style, websheet.Constant.Style.FORMATTYPE);
						if (category == "percent") {
							keyChars = keyChars + "%";
							bFillPer = true;
						}
					}
					inlineEditor.setValue(keyChars);
					if(bFillPer && dojo.isFF){
						if(!this.accnls) this.accnls = dojo.i18n.getLocalization("websheet","base");
						this.announce(this.accnls.ACC_PERCENTAGE_ADDED);//auto complete
					}
					if (!bFillPer && !dojo.isIE) {
						// prevent IE from crashing when 'quick-input&apply' 
						inlineEditor.setCursor(-1);
					} else {
						inlineEditor.setCursor(1);
					}
					dojo.stopEvent(e);
				}
			} else {
				// user may pressing on "HOME/END/ARROW keys" with CTRL
				// but seems we handle them in 'keydown phase',
				// just leave the branch here
			}
		} else {
			// currently in editing;
			if (!inlineEditor.isFocus()){ //no focus, don't set value.
				e.preventDefault();
				return;
			}
			//when editing stop this key press event CTRL+HOME/END
			//to prevent dojo TabContainer from switching to the first/last sheet
			var dk = dojo.keys;
			if (this.isCtrlPressed(e) && (e.keyCode == dk.HOME || e.keyCode == dk.END)) {
				var editNode = this.getInlineEditor().getNode();
				//end move cursor to the beginning/end of the multi-line content in cell
				if (e.keyCode == dk.HOME) {
					inlineEditor.setCursor(0);
					editNode.scrollTop = 0;
				} else {
					inlineEditor.setCursor(-1);
					editNode.scrollTop = editNode.scrollHeight;
				}
				dojo.stopEvent(e);
			}
		}
		// 1. see if we need to to append ")" when formula editing;
		// 2. see if we need to sync the values to formula input line
		if (!(e.altKey || e.ctrlKey || e.metaKey || e.charOrCode == dojo.keys.SHIFT)) {
	        if (e.keyChar != "" || e.keyCode == dojo.keys.BACKSPACE || e.keyCode == dojo.keys.DELETE) {
	        	var value = inlineEditor.getValue();
	        	var isDelete = (e.keyCode == dojo.keys.BACKSPACE || e.keyCode == dojo.keys.DELETE);
		        var length = value.length;
		        if (isDelete && length == 1) {
		        	return;
		        }
		        var selection = formulaBar ? formulaBar.getInputTextSelectionPositon() : null;
        		var bFillRigthP = false;
        		if (selection && this.isEditingFormulaCell()) {
        			if ("(" == e.keyChar && this.editor.enableFormulaAutoComplete) {
        				var length = value.length;
        	        	var latterStr = value.slice(selection.end, length);
        	        	var preStr = value.slice(0,selection.start);
        				//if it is editing a formula cell with "(" key pressed ")" should be filled automatically
        				value = preStr + e.keyChar + ')' + latterStr;
        				bFillRigthP = true;
        			}
        		}
	        	if (formulaBar) {
	        		formulaBar.syncFormulaBarOnKeyUp(value);
	        	} 
	        	if (bFillRigthP && dojo.isFF) {
	        		if(!this.accnls) this.accnls = dojo.i18n.getLocalization("websheet","base");
					this.announce(this.accnls.ACC_RIGHTPAREN_ADDED);//auto complete
	        	}
	        	if (bFillRigthP) {
	        		setTimeout(dojo.hitch(this, function (value) {
	        			var formulaBar = this.editor.getFormulaBar(), inlineEditor = this.inlineEditor;
        				var backup = formulaBar ? formulaBar.getInputTextSelectionPositon() : null;
        				inlineEditor.setValue(value);
        				if (backup) {
        					inlineEditor.setCursor(backup.start);
        				}
	        		}, value), 10);
	        	}
	        }
		}
	},
	
	_onmouseover: function(e){
		// summary:
		//		Event fired when mouse is over the grid.
		// e: Event
		//		Decorated event object contains reference to grid, cell, and rowIndex
	},
	
	_onmousemove: function(e){
		// summary:
		//		Event fired when mouse is move over the grid.
		// e: Event
		//		Decorated event object to simulate the mouse out/over event
		var body = dojo.body();
		if (this.inResizeArea(e)) {
			var c = "col-resizing";
			if (e.cellIndex == 0) {
				c = "row-resizing";
			}
			if(!this._canResize(e)){
				c = "noResize";
				dojo.addClass(body, "noResize");
			} else {
				dojo.removeClass(body, "noResize");
				dojo.toggleClass(body, c, (c == "col-resizing" || c == "row-resizing"));
			}
		} else {
			dojo.removeClass(body, ["noResize", "col-resizing", "row-resizing"]);
		}
		if(this.lastCellIndex != e.cellIndex || this.lastRowIndex != e.rowIndex) {
			var selector = this.selection.activeSelector();
			var picker = this.selection.picker();
			if (selector.isSelecting() || picker.picking()) {
				dojo.stopEvent(e);
			} /*else {
				// Otherwise do not stop event it will break down the mouse event logic of the widgets that render above the grid;
			}*/
			var bakCellIndex = e.cellIndex;
			var bakRowIndex = e.rowIndex;
			if(this.lastCellIndex != null && this.lastRowIndex != null){
				e.cellIndex = this.lastCellIndex;
				e.rowIndex = this.lastRowIndex;
				(this.lastRowIndex == -1 || this.lastCellIndex == 0) ? this.onHeaderCellMouseOut(e) : this.onCellMouseOut(e);
			}
			this.lastCellIndex = e.cellIndex = bakCellIndex;
			this.lastRowIndex = e.rowIndex = bakRowIndex;
			(this.lastRowIndex == -1 || this.lastCellIndex == 0) ? this.onHeaderCellMouseOver(e) : this.onCellMouseOver(e);
		}
	},
	
	_onmouseout: function(e){
		// summary:
		//		Event fired when mouse moves out of the grid.
		// e: Event
//		dojo.stopEvent(e);
	},
	
	_onmousedown: function(e){
		// summary:
		//		Event fired when mouse is down inside grid.
		// e: Event
		//		Decorated event object that contains reference to grid, cell, and rowIndex
		(e.rowIndex == -1 || e.cellIndex == 0) ? this.onHeaderCellMouseDown(e) : this.onCellMouseDown(e);
	},
	
	_ontouchstart: function(e){
		console.log("touch start");
		if (e.touches.length === 2){
		  return;
		}
		this.touchStartEvent = dojo.mixin({}, e);
	},
	
	_ontouchend: function(e){
		console.log("touch end");
		if (e.touches.length === 2){
		  return;
		}
		this._bScrolling = false;
		this._onmouseup(e);
	},
	
	_ontouchmove: function(e){
		console.log("touch move");

		if (e.touches.length === 2){
		  return;
		}
		if (!(this.selection.selector().isActivated() || this.selection.picker().isActivated()
				|| (this.freezeBar && (this.freezeBar.isMovingCol || this.freezeBar.isMovingRow))
				|| this.editor.hasDrawFrameSelected())) {
			this._bScrolling = true;
			e.wheelDeltaX = e.pageX - this.touchStartEvent.pageX;
			e.wheelDeltaY = e.pageY - this.touchStartEvent.pageY;
			this.touchStartEvent.pageX = e.pageX;
			this.touchStartEvent.pageY = e.pageY;
			(Math.abs(e.wheelDeltaX) > Math.abs(e.wheelDeltaY))? 
					((e.wheelDelta = (e.wheelDeltaX *= 4) ) && (e.wheelDeltaY = 0)) 
					: ((e.wheelDelta = (e.wheelDeltaY *= 2) ) && (e.wheelDeltaX = 0));
			this.onMouseWheel(e);
		}
	},

	onTap: function(e) {
		console.log("grid tap");
		this._onmousedown(this.touchStartEvent);
		this._onmouseup(e);
	},
	
	onDoubleTap: function(e) {
		console.log("doubleTap");
		this._onmousedown(this.touchStartEvent);
		this._onmouseup(e);
	},
	
	onHoldTap: function(e) {
		console.log("holdTap");
		if(!this._bScrolling 
				&& !this.selection.selector().isActivated() && !this.selection.picker().isActivated()
				&& !this.editor.hasDrawFrameSelected())
			this._onmousedown(this.touchStartEvent);
	},
	
	_onmouseup: function(e){
		// summary:
		//		Event fired when mouse moves up on the grid.
		// e: Event
		//		Decorated event object that contains reference to grid, cell, and rowIndex
		this.selection.selector().selectionComplete();
		if (this._dragScrolling) {
			this._dragScrolling = false;
		}
	},
	
	_onclick: function(e){
//		console.log("click");
	},
	
	_ondblclick: function(e){
		if (dojo.isIE) {
			// double click just can not trigger on _Rectangle's dispatch, add canvas container node's dbclick and re-direct it to the _Rectangle;
			// just for IE;
			this.selection.selector().ondblclick(e);
		}
	},
	
	onMouseOverRow: function(e){
		// summary:
		//		Event fired when mouse is over any row (data or header).
		// e: Event
		//		Decorated event object contains reference to grid, cell, and rowIndex
	},
	
	onMouseOutRow: function(e){
		// summary:
		//		Event fired when mouse moves out of any row (data or header).
		// e: Event
		//		Decorated event object contains reference to grid, cell, and rowIndex
	},
	
	onMouseDownRow: function(e){
		// summary:
		//		Event fired when mouse is down inside grid row
		// e: Event
		//		Decorated event object that contains reference to grid, cell, and rowIndex
	},
	

	// cell events
	onCellMouseOver: function(e){
		// summary:
		//		Event fired when mouse is over a cell.
		// e: Event
		//		Decorated event object contains reference to grid, cell, and rowIndex
		var selector = this.selection.selector();
		var picker = this.selection.picker();
		var commentsHandler = this.editor.getCommentsHdl();
		if(selector.isSelecting()) {
			if (!selector.sleeping()) {
				if (commentsHandler.activeId) {
					setTimeout(function () {
						commentsHandler.collapseCommentsByFocus(true);
					}, 50);
				}
				selector.onmousemove(e);
			}
		} else if (picker.picking()){
			(!picker.sleeping()) && picker.onmousemove(e);
			if (picker.isScrolling()) {
				return;
			}
		}
		var overRow = e.rowIndex;
		var overCol = e.cellIndex;
		// try to revise the cell index to master index if it's covered;
		var merge = this.cellMergeInfo(overRow, overCol);
		if (merge) {
			overRow = merge.masterRow == null ? overRow : merge.masterRow;
			overCol = merge.masterCol || overCol;
		}
		// over unsupported formula ?
		var formula = this.cellContainsUnsupportedFormula(overRow, overCol);
		if (formula && (!dijit.Dialog._dialogStack || (dijit.Dialog._dialogStack.length) <= 1) && (!dijit.popup._stack || dijit.popup._stack.length < 1)) {
			var nls = dojo.i18n.getLocalization("websheet","base");
			var message = dojo.string.substitute(nls.UNSUPPORT_FORMULA, [formula]);
			if (BidiUtils.isGuiRtl())
				message = BidiUtils.RLE + message;

			dijit.showTooltip(message, {
				x : e.pageX,
				y : e.pageY,
				w : 5,
				h : 5
			}, ["above"]);
			this._displayingToolTips = true;
		}
		// over commented cell ?
		if (this.cellContainsComments(overRow, overCol) && !selector.isSelecting() && !this.commentsTimer && !commentsHandler.activeId) {
			var cellAddress = websheet.Helper.getAddressByIndex(this.sheetName, (overRow + 1), overCol, null, null, null, {refMask: websheet.Constant.CELL_MASK});
			this.hoverCell = cellAddress; // for comments handler;
			if (this.commentsTimer) {
				clearTimeout(this.commentsTimer);
			}
			if (!commentsHandler.isCommentsOpening(cellAddress)) {
				var self = this;
				this.commentsTimer = setTimeout(function() {
					self.commentsTimer = null;
					self.editor.getCommentsHdl().expandComments(self.hoverCell);
				});
			} else {
				this.commentsTimer = null;
			}
		} else if (this.commentsTimer || commentsHandler.activeId){
			// clear & collapse the comments;
			if (this.commentsTimer) {
				clearTimeout(this.commentsTimer);
				this.commentsTimer = null;
			}
			if (commentsHandler.activeId) {
				setTimeout(function () {
					commentsHandler.collapseComments(commentsHandler.activeId);
				}, 500);
			}
		}
		
		if (!this.editor.scene.isViewMode()){
			dojo.style(this.contentViews, "cursor", "");
			var self = this;
			this._linkEvents(e, function(){
				dojo.style(self.contentViews, "cursor", "pointer");
			});
		}
	},
	
	onCellMouseOut: function(e) {
		// summary:
		//		Event fired when mouse moves out of a cell.
		// e: Event
		//		Decorated event object which contains reference to grid, cell, and rowIndex
		// Don't do this, otherwise we'll be not able to click on the link div;
//		if (this.isShowLinkDivOnCell(e.rowIndex,e.cellIndex)) {
//			this.hideLinkDiv();
//		}
		// tool tip hide;
		var outRow = e.rowIndex;
		var outCol = e.cellIndex;
		// revise covered index to master index;
		var merge = this.cellMergeInfo(outRow, outCol);
		if (merge) {
			outRow = merge.masterRow == null ? outRow : merge.masterRow;
			outCol = merge.masterCol || outCol;
		}
		
		// formula tool tip hide
		if (this._displayingToolTips) {
			if (dijit._masterTT) {
				dijit._masterTT.fadeOut.play();
			}
		}
		// hide comments;
		var commentsId = this.cellContainsComments(outRow, outCol);
		if (commentsId) {
			var commentsHandler = this.editor.getCommentsHdl();
			if (this.hoverCell && commentsHandler.isCommentsOpening(this.hoverCell)) {
				setTimeout(function () {
					commentsHandler.collapseComments(commentsId);
				}, 500);
				this.hoverCell = null;
			}
			if (this.commentsTimer) {
				clearTimeout(this.commentsTimer);
				this.commentsTimer = null;
			}
		}
	},
	
	onCellMouseDown: function(e) {
		// summary:
		//		Event fired when mouse is down in a header cell.
		// e: Event
		// 		Decorated event object which contains reference to grid, cell, and rowIndex
		
		// make the selected image unselected
		if (e.cellIndex > websheet.Constant.MaxColumnIndex || e.rowIndex > this.editor.getMaxRow()) {
			return dojo.stopEvent(e);
		}
		this.editor.getDrawFrameHdl().unSelectDrawFrames(this.sheetName);
		var formulaBar = this.editor.getFormulaBar();
		var inlineEditor = this.inlineEditor;
		var selector = this.selection.select();
		var picker = this.selection.picker();
		var applied = false;
		dojo.stopEvent(e);
		// if it's on merged cell ?
		var mergeInfo = this.cellMergeInfo(e.rowIndex, e.cellIndex);
		if (mergeInfo){
			 var eventRow = e.rowIndex;
			 var eventCol = e.cellIndex;
			 if(mergeInfo.isCovered) {
				e.cellIndex = mergeInfo.masterCol || e.cellIndex;
				e.rowIndex = mergeInfo.masterRow != null ? mergeInfo.masterRow : e.rowIndex;
			 }
			var eRow = e.rowIndex + mergeInfo.rowSpan - 1;
			var eCol = e.cellIndex + mergeInfo.colSpan - 1;
			if(eventRow != eRow){
				e.headerCellOffsetY -= this.geometry.rowHeight(eventRow + 1, eRow);
			}
			if(eventCol!= eCol){
				e.headerCellOffsetX -= this.geometry.colWidth(eventCol + 1, eCol);
			}
		}
		//
		if (e.shiftKey && inlineEditor.isEditing() && !(this.isEditingDialog() || this.isEditingFormulaCell())) {
			inlineEditor.apply();
			formulaBar && formulaBar.exitEditing();
			applied = true;
		}
		if (this.isEditingFormulaCell()||this.isEditingDialog()) {
			this.selection.pick().start();
			inlineEditor.shouldMoveRangePicker(true);//need to move range picker when press
		} else if(picker.picking()) {
			picker.complete();
		}
		
		if (!this.isEditingDialog() && !this.isEditingFormulaCell()) {
			if(formulaBar && formulaBar.isFormulaInputLineKeyDown) {
				formulaBar.applyEdittingCellWithInputLine();
				formulaBar.isFormulaInputLineKeyDown = false;
			}
			if (e.shiftKey) {
				//mutli-select when focus rowIndex > 0(not click on the row header)
				if(selector._startRowIndex > -1 && selector._startColIndex > -1){
					selector.selectRange(selector.focusRow, selector.focusCol, e.rowIndex, e.cellIndex);
					selector.selectionStart();
					return;
				}
			}
			//3) set the focus cell with selectRange
			// TODO, may need to modify the index here in case there're merged cells
			if (dojo.mouseButtons.isLeft(e) || !this.selection.inSelectedRange(e.rowIndex, e.cellIndex) || pe.scene.bMobileBrowser) {
				selector.selectionStart();
//				selector.selectCell(e.rowIndex, e.cellIndex);
			}
		} else if (!applied) {
			// formulas
			if (e.shiftKey) {
				//select range between focus cell and the mouse down cell
				var startRowIndex = -1;
				var startColIndex = -1;
				if (picker.picking()) {
					startRowIndex = picker._startRowIndex;
					startColIndex = picker._startColIndex;
				}
				//else when just edit the formula cell
				if (startRowIndex == -1 || startColIndex == -1) {
					startRowIndex = selector._startRowIndex;
					startColIndex = selector._startColIndex;
				}
				if (startRowIndex > -1 && startColIndex > -1) {
					selector.selectionComplete();
					picker.start();
					picker.selectRange(startRowIndex, startColIndex, e.rowIndex, e.cellIndex);
				}
			} else {
				picker.selectCell(e.rowIndex, e.cellIndex);
			}
			return dojo.stopEvent(e);
		}
		if (!e.shiftKey) {
			if (this.isEditing()) {
				inlineEditor.apply();
			}
			if (dojo.mouseButtons.isLeft(e) || pe.scene.bMobileBrowser) {
				try {
					this.selection.doCellFocus(e.rowIndex, e.cellIndex, true);
					var self = this;
					this._linkEvents(e, function(){
						selector.selectionComplete();
						self.gotoLinkWithIndex(e.rowIndex, e.cellIndex);
					});
				} catch(e) {}
			}
		}
	},
	
	_linkEvents: function(e, func){
		var row = e.rowIndex;
		var col = e.cellIndex;
		var offsetX = e.headerCellOffsetX;
		var offsetY = e.headerCellOffsetY;
		if(e.type == "mousemove"){
			var mergeInfo = this.cellMergeInfo(row, col);
			if(mergeInfo){
				if(mergeInfo.isCovered){
					row = mergeInfo.masterRow != null ? mergeInfo.masterRow : e.rowIndex;
					col = mergeInfo.masterCol || e.cellIndex;
				}
				
				var eRow = row + mergeInfo.rowSpan - 1;
				var eCol = col + mergeInfo.colSpan - 1;
				if(e.rowIndex != eRow){
					offsetY -= this.geometry.rowHeight(e.rowIndex + 1, eRow);
				}
				if(e.cellIndex != eCol){
					offsetX -= this.geometry.colWidth(e.cellIndex + 1, eCol);
				}
			}
		}
		if(this.cellContainsLink(row, col)){
			if(this.cellWrapInfo(row, col))
				func();
			else{
				var eRow = row;
				var eCol = col;
				var mergeInfo = this.cellMergeInfo(row, col);
				if(mergeInfo){
					eRow += mergeInfo.rowSpan - 1;
					eCol += mergeInfo.colSpan - 1;
				}
				var h = this.geometry.rowHeight(row, eRow);
				var w = this.geometry.colWidth(col, eCol);
				var ox = w + offsetX;
				var oy = h + offsetY;
				var rect = this.cellTextRect(row, col);
				if(ox >= rect[0] && oy >= rect[1] && ox <= rect[0]+ rect[2] && oy <= rect[1] + rect[3])
					func();
			}
		}
	},

	onCellClick: function(e){
		// summary:
		//		Event fired when a cell is clicked.
		// e: Event
		//		Decorated event object which contains reference to grid, cell, and rowIndex
	},

	onCellDblClick: function(e){
		// summary:
		//		Event fired when a cell is double-clicked.
		// e: Event
		//		Decorated event object contains reference to grid, cell, and rowIndex
		if (this.editor.scene.isViewMode() || e.rowIndex < 0 || e.cellIndex <= 0) {
			return;
		}
		var inlineEditor = this.inlineEditor;
		if (this.selection.activeSelector().hibernating() || inlineEditor.isEditingFormula()) {
			return;
		} else {
			this.selection.doCellFocus(e.rowIndex, e.cellIndex, true);
		}
		if (!inlineEditor.isEditing()) {
			inlineEditor.editingStart();
			if (!e.shiftKey) {
				inlineEditor.setCursor(-1);
				if(dojo.isSafari) {
					var editNode = inlineEditor.getNode();
					editNode.scrollTop = editNode.scrollHeight;
				}
				this.editor._clipboard.exitSelect(true);
			}
		}
	},
	
	onDragEnter: function (e) {
		// summary:
		//		For drag & drop to insert images.
		dojo.stopEvent(e);
	},
	
	onDragLeave: function (e) {
		// summary:
		//		For drag & drop to insert images;
		dojo.stopEvent(e);
	},
	
	onDragDrop: function (e) {
		// summary:
		//		For drag & drop to insert images.
		var fileList = e.dataTransfer ? e.dataTransfer.files : null; 
		dojo.stopEvent(e);
        if (!fileList || fileList.length == 0) { 
            return false; 
        }
        var unsupported = largeFile = false;
        var isValid = function () {
        	for (var index = 0, len = fileList.length; index < len; index++) {
        		if (fileList[index].type.indexOf('image') === -1) {
        			unsupported = true;
        			return false;
        		}
        		if (fileList[index].size > g_maxImgSize * 1024) {
        			largeFile = true;
           			return false;
        		}
        	}
        	return true;
        };
        if (isValid()) {
        	this.editor.getImageHdl().uploadImageWithFiles(fileList);
        } else {
        	if (unsupported) {
        		var nls = dojo.i18n.getLocalization("concord.widgets", "InsertImageDlg");
        		this.editor.scene.showWarningMessage(nls.invalidImageType, 2000);
        	} else if (largeFile) {
    			this.editor.scene.showErrorMessage(dojo.string.substitute(this.editor.nls.maxImgSize,[g_maxImgSize]),2000);
        	}
        }
	},

	onMouseWheel: function(e) {
		// summary:
		//		Event fired when the mouse wheel on the grid
		// e: Event
		var rolledX = 0;
		var rolledY = 0;
		if (dojo.isMac || pe.scene.bMobileBrowser) {		
			rolledX = 
				((typeof e.wheelDelta == "number") ? 
					e.wheelDeltaX : 
						((e.axis == e.HORIZONTAL_AXIS) ? (-40 * e.detail) : 0)); 
			rolledY = 
				((typeof e.wheelDelta == "number") ? 
					e.wheelDeltaY : 
						((e.axis == e.VERTICAL_AXIS) ? (-40 * e.detail) : 0)); 
		} else {
			rolledY = 
				(typeof e.wheelDelta == "number") ? e.wheelDelta : (-40 * e.detail);   
		}
		
		var sc = this.scroller;
		if (Math.abs(rolledX) > Math.abs(rolledY)) {
			this._scrollLocked = true;
			sc.setScrollLeft(Math.max(1, sc.scrollLeft - rolledX));
		} else {
			this._scrollLocked = true;
			sc.setScrollTop(Math.max(1, sc.scrollTop - rolledY));
		}
		dojo.stopEvent(e);
	},
	
	onHScroll: function(e) {
		// summary:
		//		Event fired when the scroll on the horizontal scroll bar
		// e: Event
		var left = (this.isMirrored && dojo.isFF) ? //in FF mirrored scrollbar produces negative values
				-this.hScrollNode.scrollLeft : this.hScrollNode.scrollLeft;
		var colWidth;
		var self = this;

		// Fix for PMR Docs-7
		
		// Converting the value of left to its ceil value because for browser zoom 100% or above the assignment
		//	grid.hScrollNode.scrollLeft = this.scrollLeft (class- websheet/grid/Scroller , function scrollByColumn)is not working properly.
		// If this.scrollLeft is 82 then ideally grid.hScrollNode.scrollLeft should also be 82 after assignment
		// but the value of grid.hScrollNode.scrollLeft seems to be reducing by some fraction like 81.802.So rounding it  
		// to a whole number using ceil.This value of grid.hScrollNode.scrollLeft is assigned to left in line number 1424.
		left = Math.ceil(left);
		if(window.devicePixelRatio < 1){
			// If the browser screen has zoom less than 100 % then the assignment grid.hScrollNode.scrollLeft = this.scrollLeft
			// also sets grid.hScrollNode.scrollLeft to a value less than this.scrollLeft and the difference in values goes maximum to 1. So for zoom less than 100 adding 1 to left.
			if(left < this.scroller.scrollLeft){
				left = left + 1;
			}
		}
		// END for Fix for Docs-7
		
		if (left == this.scroller.scrollLeft) {
			return;
		} else {
			var self = this;
			if (self._delayedScroll || self._scrollLocked) {
				return (self._scrollLocked = false);
			}
			self._delayedScroll = setTimeout(function () {
				left = (self.isMirrored && dojo.isFF) ? -self.hScrollNode.scrollLeft : self.hScrollNode.scrollLeft;
				
				if (!self._dragScrolling && Math.abs(left - self.scroller.scrollLeft) < (colWidth = self.geometry.colWidth(self.scroller.firstVisibleCol))) {
					// Reference 49431: the buttons of forward and backward of browser's scroll bar(vertical and horizon) almost do not work
					// to scroll at least one column on each scroll;
					if (left < self.scroller.scrollLeft) {
						left = Math.max(1, self.scroller.scrollLeft - colWidth);
					} else {
						left = self.scroller.scrollLeft + colWidth + 1;
					}
				}
				self.scroller.setScrollLeft(left);
				self._delayedScroll = null;
			}, 10);
//			if (dojo.isFF && self.scroller.lastVisibleColumn >= self.geometry.getLastVisibleColumn()) {
//				// The set scroll left will trigger onHScroll again in FF, and when it reach the last supported row and the row can not be fully displayed
//				// This will trigger a loop iteration to scroll the page to the left;
//				self._scrollLock = true;
//			}
		}
	},
	
	onVScroll: function(e) {
		// summary:
		//		Event fired when the scroll on the vertical scroll bar
		// e: Event
		var 
			node = this.vScrollNode,
			top = node.scrollTop,
			scroller = this.scroller,
			rowHeight;
		if (this._delayedScroll || this._scrollLocked) {
			return (this._scrollLocked = false);
		}
		var self = this;
		
		self._delayedScroll = setTimeout(function () {
			self._delayedScroll = null;
			if (top == node.scrollHeight - node.clientHeight && scroller.rowCount < scroller.maxRow) {
				//50644: [Chrome] Page is not scrolling when dragging the vertical scroll bar to the bottom
				//the scroll bar just get sticked to the edge, push it to scroll down;
				top += 5;
			}
						
			// Fix for PMR Docs-7
			// Converting the value of top to its ceil value because for browser zoom 100% or above the assignment
			//	grid.vScrollNode.scrollTop = this.scrollTop; (class- websheet/grid/Scroller , function scrollByRow)is not working properly.
			// If this.scrollTop is 82 then ideally grid.hScrollNode.scrollLeft should also be 82 after assignment
			// but the value of grid.vScrollNode.scrollTop seems to be reducing by some fraction like 81.802.So rounding it  
			// to a whole number using ceil.This value of grid.vScrollNode.scrollTop is assigned to left in line number 1484.
			top = Math.ceil(top);
			
			// END Fix for PMR Docs-7
			
			if (top == scroller.scrollTop) {
				return;
			} else if(!self._dragScrolling && Math.abs(top - scroller.scrollTop) < (rowHeight = self.geometry.quickRowHeight(scroller.firstVisibleRow))) {
				// to scroll at least one row on each scroll;
				// Reference 49431: the buttons of forward and backward of browser's scroll bar(vertical and horizon) almost do not work
				if (top < scroller.scrollTop) {
					top = Math.max(1, scroller.scrollTop - rowHeight);
				} else {
					top = scroller.scrollTop + rowHeight + 1;
				}
			}
			scroller.setScrollTop(top);
		}, 10);
	},
	
	removeContextMenu: function() {},

	onCellContextMenu: function(e){
		// summary:
		//		Event fired when a cell context menu is accessed via mouse right click.
		// e: Event
		//		Decorated event object which contains reference to grid, cell, and rowIndex
	},

	onCellFocus: function(inRowIndex, inColIndex) {
		// summary:
		//		Event fired when a cell receives focus.
		// inColIndex: Object
		//		Index of the grid column.
		// inRowIndex: Integer
		//		Index of the grid row
		var commentsHandler = this.editor.getCommentsHdl();
		commentsHandler.collapseCommentsByFocus();
		if (pe.scene.bMobileBrowser) {
			if (this.cellContainsComments(inRowIndex, inColIndex) && !commentsHandler.activeId) {
				var cellAddress = websheet.Helper.getAddressByIndex(this.sheetName, (inRowIndex + 1), inColIndex, null, null, null, {refMask: websheet.Constant.CELL_MASK});
				commentsHandler.expandComments(cellAddress);
			} 
		}
		
		if(dijit.Dialog._dialogStack && dijit.Dialog._dialogStack.length <= 1)
		{
			var inlineEditor = this.inlineEditor;
			if(inlineEditor && document.activeElement != inlineEditor.getNode()){
				if (!inlineEditor.waitForInput()) {
					this.focus();
				}
			}
		}
		var sheetName = this.sheetName;
		var rowIndex = inRowIndex + 1;
		
		var cellAddress = websheet.Helper.getCellAddr(sheetName, rowIndex, websheet.Helper.getColChar(inColIndex));
		var taskHdl = this.editor.getTaskHdl();
		if (taskHdl) 
			taskHdl.showRangeAreaByCellPos(cellAddress);
		var selector = this.selection.selector();
		var formulaBar = this.editor.getFormulaBar();
		if (formulaBar) {
			formulaBar.syncOnCellMouseDown(cellAddress, "cell");
		} 
		this.editor.getCommentsHdl().focus2Cell(sheetName, rowIndex, inColIndex);
		
		var styleCode = websheet.model.ModelHelper.getStyleCode(sheetName, rowIndex, inColIndex, BidiUtils.isBidiOn());
		this.editor.applyUIStyle(styleCode);
		
		var bar = this.editor.getToolbar();
		if (bar) {
			if(selector.selectingCell() || selector.selectingRows()){
				bar.enableMultiSelCell();
			}
			if(selector.selectingCell() || selector.selectingRange())
				bar.enableTaskToolBar();
		}
		
		// update merge icon
		var info = {sheetName:sheetName, startRow: rowIndex, endRow: rowIndex, startCol: inColIndex, endCol:inColIndex};
		var expandInfo = websheet.Utils.getExpandRangeInfo(info);
		
		if (selector.selectingCell()) {
			if(expandInfo.startCol != expandInfo.endCol)
			{
				if (bar) bar.disableMultiSelCell();
			}
		}
			
		if(!this.editor.scene.isViewMode(true)){
			if(this.lastFocusNode && this.dataSelectionHelper){
				this.dataSelectionHelper.close();
			}
			if(!(this._lastSheetName == sheetName && this._lastRowIdx == rowIndex && this._lastColIdx == inColIndex))
				this._updateDVInfo(sheetName, rowIndex, inColIndex);
		}
		
		if(this._lastSheetName != sheetName || this._lastRowIdx != rowIndex || this._lastColIdx != inColIndex){
			//do not fire selection change event if next selection change event comes in next 50 ms
			if (this._selectionChangeTimer) {
                clearTimeout(this._selectionChangeTimer);
            }
			this._selectionChangeTimer = setTimeout(function() {
				dojo.publish(websheet.Constant.APIEvent.SELECTION_CHANGE);
			 }, 50);
		}
		this._lastSheetName = sheetName;
		this._lastRowIdx = rowIndex;
		this._lastColIdx = inColIndex;
	},
	
	hideDVInfo: function()
	{
		this._lastSheetName = null;
		this._lastRowIdx = null;
		this._lastColIdx = null;
		if (this.lastFocusNode && this.dataSelectionHelper)
			this.dataSelectionHelper.hideButton();
			
		var dataValidationHdl = this.editor.getDataValidationHdl();
 		if(dataValidationHdl)
 			dataValidationHdl.closeInfo();
	},

	_updateDVInfo: function(sheetName, rowIndex, colIndex)
	{
		if (pe.scene.bMobileBrowser && !pe.scene.bJSMobileApp) {
			return;
		}
		if (this.lastFocusNode && this.dataSelectionHelper)
			this.dataSelectionHelper.hideButton();
			
		var dataValidationHdl = this.editor.getDataValidationHdl();
 		if(dataValidationHdl)
 			dataValidationHdl.closeInfo();
		
		if(!this.scroller.isRowInVisibleArea(rowIndex - 1))
			return;
		if(!this.scroller.isColumnInVisibleArea(colIndex))
			return;
		
		if(!this.isVisibleRow(rowIndex -1))
			return;
		if(!this.isVisibleCol(colIndex))
			return;
		
		this.lastFocusNode = null;
		var selector = this.selection.selector();
		var attNode = selector.selectingCell() ? selector.domNode : selector.hotCell;
		
		var dvRange = websheet.Utils.getDataValidation4Cell(sheetName, rowIndex, colIndex, true);
		var dataValidation = dvRange ? dvRange.data : null;
		if(dataValidation && attNode){
			var prompt = dataValidation.getPrompt();
			if(prompt){
				prompt = websheet.Helper.escapeXml(prompt);
				this.editor.getDataValidationHdl().showInfo(rowIndex, colIndex, prompt);
			}
			if(dataValidation.isShowList()){
				this.lastFocusNode = attNode;
				if(!this.dataSelectionHelper){
					dojo["require"]("concord.concord_sheet_extras");
					this.dataSelectionHelper = new websheet.DataValidation.DataSelectionHelper(this.editor);
				}
				this.dataSelectionHelper.showButton(dvRange, sheetName, rowIndex, colIndex, this);
			}
		}
	},
	
	// row events
	onRowClick: function(e){
		// summary:
		//		Event fired when a row is clicked.
		// e: Event
		//		Decorated event object which contains reference to grid, cell, and rowIndex
	},

	onRowDblClick: function(e){
		// summary:
		//		Event fired when a row is double clicked.
		// e: Event
		//		decorated event object which contains reference to grid, cell, and rowIndex
	},

	onRowMouseOver: function(e){
		// summary:
		//		Event fired when mouse moves over a data row.
		// e: Event
		//		Decorated event object which contains reference to grid, cell, and rowIndex
	},

	onRowMouseOut: function(e){
		// summary:
		//		Event fired when mouse moves out of a data row.
		// e: Event
		// 		Decorated event object contains reference to grid, cell, and rowIndex
	},
	
	onRowMouseDown: function(e){
		// summary:
		//		Event fired when mouse is down in a row.
		// e: Event
		// 		Decorated event object which contains reference to grid, cell, and rowIndex
	},

	onRowContextMenu: function(e){
		// summary:
		//		Event fired when a row context menu is accessed via mouse right click.
		// e: Event
		// 		Decorated event object which contains reference to grid, cell, and rowIndex
	},

	// header events
	onHeaderMouseOver: function(e){
		// summary:
		//		Event fired when mouse moves over the grid header.
		// e: Event
		// 		Decorated event object contains reference to grid, cell, and rowIndex
	},

	onHeaderMouseOut: function(e){
		// summary:
		//		Event fired when mouse moves out of the grid header.
		// e: Event
		// 		Decorated event object which contains reference to grid, cell, and rowIndex
	},

	onHeaderCellMouseOver: function(e){
		// summary:
		//		Event fired when mouse moves over a header cell.
		// e: Event
		// 		Decorated event object which contains reference to grid, cell, and rowIndex
	},

	onHeaderCellMouseOut: function(e){
		// summary:
		//		Event fired when mouse moves out of a header cell.
		// e: Event
		// 		Decorated event object which contains reference to grid, cell, and rowIndex
	},
	
	onHeaderCellMouseDown: function(e) {
		// summary:
		//		Event fired when mouse is down in a header cell.
		// e: Event
		// 		Decorated event object which contains reference to grid, cell, and rowIndex
		var selector = this.selection.selector();
		var picker = this.selection.picker();
		dojo.stopEvent(e);
		// for mobile, if the selector is selecting or autofilling, or resizing col/row, or dnd, stop response on header cell mouse down
		if(pe.scene.bMobileBrowser && selector.isActivated())
			return;
		this.editor.getDrawFrameHdl().unSelectDrawFrames(this.sheetName);
		if (this.freezeBar && (this.freezeBar.isMovingCol || this.freezeBar.isMovingRow)) {
			return;
		}
		if (!this.isEditingDialog() && !this.isEditingFormulaCell()) {
			this.selection.select();
			if (e.cellIndex == 0 && e.rowIndex == -1) {
				if(this.editor.scene.supportInCurrMode(commandOperate.SELECTSHEET))
					this.editor.execCommand(commandOperate.SELECTSHEET);
			} else {
				if (this.inResizeArea(e) && !websheet.model.ModelHelper.isSheetProtected(this.sheetName)) {
					this.beginResizeHeader(e);
					return;
				}
				if (this.isEditing()) {
					this.apply();
				}
				selector.selectionStart();
				if (dojo.mouseButtons.isLeft(e) || pe.scene.bMobileBrowser || 
						(dojo.mouseButtons.isRight(e) && 
								(!((selector.selectingColumns() && this.selection.inSelectedRange(null, e.cellIndex)) 
															|| (selector.selectingRows() && this.selection.inSelectedRange(e.rowIndex)))))){
					// Do not expand selection on header selection, called 'fixed' to define the render behavior;
					if (e.shiftKey) {
						//mutli-select when focus rowIndex > 0(not click on the row header)
						if(selector._startRowIndex > -1 && selector._startColIndex > -1){
							if (e.cellIndex == 0) {
								selector.fixed().selectRow(selector.focusRow, e.rowIndex);
							} else if (e.rowIndex == -1) {
								selector.fixed().selectColumn(selector.focusCol, e.cellIndex);
							}
						}
					} else {
						if (e.rowIndex == -1) {
							selector.fixed().selectColumn(e.cellIndex, e.cellIndex, true);
							selector.focusCell(this.searchVisibleRow(), e.cellIndex);
						} else if(e.cellIndex == 0) {
							selector.fixed().selectRow(e.rowIndex, e.rowIndex, true);
							selector.focusCell(e.rowIndex, this.searchVisibleCol());
						}
					}
				}
			}
		} else {
			this.selection.pick().start();
			// it's editing a formula cell or some areas that receive references
			if (e.shiftKey) {
				if (e.cellIndex == 0) {
					picker.selectRow(picker._startRowIndex > -1 ? picker._startRowIndex : selector._startRowIndex, e.rowIndex);
				} else if (e.rowIndex == -1) {
					picker.selectColumn(picker._startColIndex > -1 ? picker._startColIndex : selector._startColIndex, e.cellIndex);
				} 
			} else {
				if(e.cellIndex == 0 && e.rowIndex == -1)
				{
					picker.selectAll();
				}else{
					if (e.cellIndex == 0) {
						picker.selectRow(e.rowIndex, e.rowIndex);
					} else if (e.rowIndex == -1) {
						picker.selectColumn(e.cellIndex, e.cellIndex);
					}
				}
			}
		}
		var formulaBar = this.editor.getFormulaBar();
		formulaBar && (formulaBar.isFormulaInputLineKeyDown = false);
	},

	onHeaderClick: function(e){
		// summary:
		//		Event fired when the grid header is clicked.
		// e: Event
		// Decorated event object which contains reference to grid, cell, and rowIndex
	},

	onHeaderCellClick: function(e){
		// summary:
		//		Event fired when a header cell is clicked.
		// e: Event
		//		Decorated event object which contains reference to grid, cell, and rowIndex
	},

	onHeaderDblClick: function(e){
		// summary:
		//		Event fired when the grid header is double clicked.
		// e: Event
		//		Decorated event object which contains reference to grid, cell, and rowIndex
	},

	onHeaderCellDblClick: function(e){
		// summary:
		//		Event fired when a header cell is double clicked.
		// e: Event
		//		Decorated event object which contains reference to grid, cell, and rowIndex
	},

	onHeaderCellContextMenu: function(e){
		// summary:
		//		Event fired when a header cell context menu is accessed via mouse right click.
		// e: Event
		//		Decorated event object which contains reference to grid, cell, and rowIndex
	},

	onHeaderContextMenu: function(e){
		// summary:
		//		Event fired when the grid header context menu is accessed via mouse right click.
		// e: Event
		//		Decorated event object which contains reference to grid, cell, and rowIndex
	},
	
	searchVisibleRow: function (fromRow, reverseSearch) {
		// summary:
		//		Seaerch the first visible (un-hiden) row from the given row;
		// reverseSearch:
		//		Boolean, indicates if we need to search backwards.
		//	Notice:
		//		This method rely on the geometry height array to judge the visible attribute, and will breaks on visible boundary.
		//		
		var row = ((fromRow != null) ? fromRow : this.scroller.firstVisibleRow);
		if (!reverseSearch && this.freezeRow > 0 && fromRow == null) {
			row = 0;
		}
		var array = this.geometry._heightArray;
		var maxRow = this.editor.getMaxRow();
		var lastIndex = maxRow - 1;
		var height;
		while (true) {
			height = array[row];
			if (height == null || height > 0) {
				break;
			}
			if (reverseSearch) {
				row = row - 1;
				if (row <= 0) {
					break;
				}
			} else {
				row = row + 1;
				if (row >= lastIndex) {
					break;
				}
			}
		}
		return row;
	},
	
	searchVisibleCol: function (fromCol, reverseSearch) {
		// summary:
		//		Seaerch the first visible (un-hiden) column from the given column;
		// reverseSearch:
		//		Boolean, indicates if we need to search backwards.
		var col = fromCol || this.scroller.firstVisibleCol;
		if (fromCol == null && this.freezeCol > 0 && !reverseSearch) {
			col = 0;
		} else {
			col = col - 1;
		}
		var array = this.geometry._widthArray;
		var lastIndex = websheet.Constant.MaxColumnIndex - 1;
		var width;
		while (true) {
			width = array[col];
			if (width == null || width > 0) {
				break;
			}
			if (reverseSearch) {
				col = col - 1;
				if (col <= 0) {
					break;
				}
			} else {
				col = col + 1;
				if (col >= lastIndex) {
					break;
				}
			}
		}
		return col + 1;
	},
	
	/**
	 * Method ot verify if pressed Ctrl
	 */
	isCtrlPressed:function(e){
		if(!e)
			return false;
	    var code = e.keyCode;
		if((!e.shiftKey && e.ctrlKey)||(dojo.isMac && (e.metaKey || e.ctrlKey) && !e.shiftKey ))
			return true;
		return false;
	},
	
	/**
	 * Transform pageX, pageY to the postion of the sub content view
	 * @param x	pageX
	 * @param y	pageY
	 * @returns return value of _locatingView
	 */
	transformEvent: function(x, y)
	{
		var rect = this.contentViewRect || (this.contentViewRect = this.contentViews.getBoundingClientRect());
		if (rect) {
			return this._locatingView(x - rect.left, y - rect.top);
		}
	},
	
	_acceptableKeyDown: function (e) {
		// summary:
		//		In view mode, we will return 'false' in some case, this will make the 'onKeyDown' to directly return,
		//		thus not handle some key events we're not intend to deal with.
		if(!this.editor.scene.isViewMode()) return true;
		var keyCode = e.keyCode;
		var dk = dojo.keys;
		var ret = true;
		switch(keyCode){
		case dk.ESCAPE:
		case dk.SPACE:
		case dk.TAB:
		case dk.HOME:
		case dk.END:
		case dk.LEFT_ARROW:
		case dk.RIGHT_ARROW:
		case dk.UP_ARROW:
		case dk.DOWN_ARROW:
		case dk.PAGE_UP:
		case dk.PAGE_DOWN:
			break;
		case dk.ENTER:
		case dk.F2:
			if (!e.shiftKey) {
				ret = false;
			}
			break;
		case dk.DELETE:
			ret = false;
			dojo.stopEvent(e);
			break;
		default:
			ret = false;
		break;
		}
		return ret;
	},
	
	_acceptableKeyPress: function (e, isShortCuts) {
		if(!this.editor.scene.isViewMode()) {
			// in edit mode, return true 
			return true;
		} else {
			// doc in view mode
			if (!this.editor.scene.isDocViewMode() && !isShortCuts) {
				// doc mode is edit, stopevent
				dojo.stopEvent(e);
			}
		}
		if (!isShortCuts) {
			// Do not stop event, or press F12 will not open firebug and
			// Ctrl+ C does not copy successfully under view Mode
		    //dojo.stopEvent(e);
			return false;
		}
		if(!(e.altKey || ((e.ctrlKey || e.metaKey)) ||  e.charOrCode == dojo.keys.SHIFT))
		{
	        if(e.keyCode == dojo.keys.BACKSPACE || e.keyCode == dojo.keys.DELETE)
	        {
	        	dojo.stopEvent(e);
	        	return false;
	        }
		}
		return true;
	},
	
	_canResize: function (e) {
		if(this.isEditing() || this.isEditingDialog() || websheet.model.ModelHelper.isSheetProtected(this.sheetName)){
			return false;
		}
		return true;
	},
	
	
	_focusWithInGrid: function()
	{
		var f = document.activeElement;
		return !this.isEditing() && f && (f == this.editorNode || dojo.isDescendant(f, this.domNode) || f == this.domNode);
	},
	
	/**
	 * Judge whether the event's relevant char is printable
	 * KeyChar is not set by browser in KeyDown phase, use keyCode.
	 * @param e
	 * @returns {Boolean}
	 */
	_isPrintableKey: function(e){
		var keyCode = e.keyCode, printable = false;
		if((keyCode >= 48 && keyCode <= 90)/*0-9,a-z*/
				||(keyCode >= 96 && keyCode <= 111)/*Num1~Num9, add,subtract,multiply,divide,decimal point*/
				||(keyCode >= 186 && keyCode <= 192)/*comma, dash, period...*/
				||(keyCode >= 219 && keyCode <= 222))/*forward slash, close/open bracket, quote..*/{
			printable = true;
		}
		return printable;
	},
	
	/**
	 * According to the position (x,y) relative to the grid.contentViews node
	 * return {
	 * 	view: one of the four subviews ,
	 *  range: the corresponding range of that subview
	 *  x: x relative to the subview
	 *  y: y relative to the subview
	 *  l: left relative to the whole content view
	 *  t: to relative to the whole content view
	 * @param x
	 * @param y
	 */
	_locatingView: function(l, t){
		var 
			geometry = this.geometry,
			x = l - geometry.GRID_HEADER_WIDTH,
			y = t - geometry.GRID_HEADER_HEIGHT,
			x1 = x - geometry.getFreezeWidth(),
			y1 = y - geometry.getFreezeHeight(),
			fr = this.scroller.firstVisibleRow + 1,
			fc = this.scroller.firstVisibleCol,
			lr = this.scroller.lastVisibleRow + 1,
			lc = this.scroller.lastVisibleCol,
			view, range;

		if((!this.isMirrored && x1 < 0) || (this.isMirrored && l > geometry.getScrollableWidth())) {
			if (this.isMirrored)
				x = geometry.getGridWidth(true) - l;

			if( y1 < 0 ){
				view = this.ltSubviewNode;
				range = {startRow: 1, endRow: this.freezeRow, startCol:1, endCol:this.freezeCol};
			} else {
				view = this.lbSubviewNode;
				range = {startRow: fr, endRow: lr, startCol:1, endCol:this.freezeCol};
				y = y1;
			}
		} else {
			x = this.isMirrored ? geometry.getScrollableWidth() - l : x1;
			if( y1 < 0 ){
				view = this.rtSubviewNode;
				range = {startRow: 1, endRow: this.freezeRow, startCol:fc, endCol:lc};
			} else {
				view = this.rbSubviewNode;
				range = {startRow: fr, endRow: lr, startCol:fc, endCol:lc};
				y = y1;
			}
		}
		return {view: view, range: range, x: x, y: y, l: l, t: t};
	},
	
	_onkeydown: function (e) {
		return this.onKeyDown(e);
	},
	
	_onkeyup: function (e) {
		return this.onKeyUp(e);
	},
	
	_onkeypress: function (e) {
		return this.onKeyPress(e);
	},
	
	
	_rangepickingOrApply: function (e) {
		// summary:
		//		As named, handle navigate keys like up/down/left/right arrows, page up, page down when editing.
		var inlineEditor = this.inlineEditor;
		if (inlineEditor.shouldMoveRangePicker() && inlineEditor.isEditing()) {
			if (inlineEditor.shouldMoveRangePicker() && this.isEditingFormulaCell() || this.isEditingDialog()) {
				if (this.selection.moveRangePicker(e, true)) {
					dojo.stopEvent(e);
				}
			} else {
				try{
					this.apply();
					inlineEditor.shouldMoveRangePicker(false);
				}catch(e){}
			}
		}
	},
	
	_shortcuts: function (e) {
		// summary:
		//		Handle short cuts, and return if it is handled.
		var isShortCuts = false;
		var letPassEvent = false;
		var doCopy = doPaste = false;
		var doInsert = false;
		var dk = dojo.keys;
		var editor = this.editor;
		if (e.altKey) {
			//alt + f10 , move focus to tool bar
	    	if(e.keyCode == dk.F10){
	    		isShortCuts = true;
	    	} else {
		    	//alt + shift + f, move focus to menu bar
		    	if (e.shiftKey && ((e.keyChar == "f" || e.keyChar == "F")||e.keyCode == 70)) {
		    		isShortCuts = true;
		    	}
	    	}
	    	if (dojo.isIE && e.keyChar == "+" && e.ctrlKey) {
	    		doInsert = true;
	    	}
		} else if (e.shiftKey) {
			// shift keys, shift + space select current row
			if (!this.isEditing() && e.keyChar == " ")
				isShortCuts = true;
			else if (e.keyCode == dk.F2) {// shift + f2,  move focus to side bar (comments input area).
				if (!pe.scene.isHTMLViewMode()) {
					isShortCuts = true;
				}
			} else if (e.keyChar == '' && e.keyCode == dk.INSERT){
				doPaste = true;
			} else if (e.keyChar == '+' && (dojo.isMac && e.metaKey ||  e.ctrlKey)) {
				doInsert = true;
    		} else {
				isShortCuts = false;
			}
			
		} else if (dojo.isMac && e.ctrlKey) {
			// ctrl key on mac
		} else if ((dojo.isMac && e.metaKey) || e.ctrlKey) {
			if(e.keyChar == '' && e.keyCode == dk.INSERT)
				doCopy = true;
			else {
				// ctrl key except mac, or meta key on mac
				var c = e.keyChar;
				switch (c) {
				case "z":
				case "Z":
					var widget = dijit.byId("S_t_Undo");
					var disabled = widget ? widget.attr("disabled"): false;
					if(!disabled)
					{
						if (editor.scene.supportInCurrMode(commandOperate.UNDO))
							editor.execCommand(commandOperate.UNDO);
					}		
					isShortCuts = true;
					break;
				case "y":
				case "Y":
					var widget = dijit.byId("S_t_Redo");
					var disabled = widget ? widget.attr("disabled"): false;
					if(!disabled)
					{
						if (editor.scene.supportInCurrMode(commandOperate.REDO))
							editor.execCommand(commandOperate.REDO);
					}		
					isShortCuts = true;
					break;
				case "b":
				case "B":
					if (editor.scene.supportInCurrMode(commandOperate.BOLD))
						editor.execCommand(commandOperate.BOLD);
					isShortCuts = true;
					break;
				case "i":
				case "I":
					if (editor.scene.supportInCurrMode(commandOperate.ITALIC))
						editor.execCommand(commandOperate.ITALIC);
					isShortCuts = true;
					break;
				case "u":
				case "U":
					if (editor.scene.supportInCurrMode(commandOperate.UNDERLINE))
						editor.execCommand(commandOperate.UNDERLINE);
					isShortCuts = true;
					break;
				case "x":
				case "X":
					//announce copy operation
					if(dojo.isFF){
						if (!this.accnls) 
							this.accnls = dojo.i18n.getLocalization("websheet","base");
						this.announce(this.accnls.ACC_CUT);
					}
					if(this._focusWithInGrid())
					{
						if (!dojo.isWebKit) {
							if (editor.scene.supportInCurrMode(commandOperate.CUT))
								editor.execCommand(commandOperate.CUT, [e]);
						}
						isShortCuts = true;
						letPassEvent = true;
					}
					break;
				case "c":
				case "C":
					doCopy = true;
					break;
				case "v":
				case "V":
					doPaste = true;
					break;
				case "f":
				case "F":
					if (editor.scene.supportInCurrMode(commandOperate.FIND))
						editor.execCommand(commandOperate.FIND);
					isShortCuts = true;
					break;
				case "S":
				case "s":
					if (editor.scene.supportInCurrMode(commandOperate.SAVEDRAFT))
						editor.execCommand(commandOperate.SAVEDRAFT);
					isShortCuts = true;
					break;
				case "P":
				case "p":
					if (editor.scene.supportInCurrMode(commandOperate.EXPORTTOPDF))
						editor.execCommand(commandOperate.EXPORTTOPDF);
					isShortCuts = true;
					break;
				case "A":
				case "a":
					//select current sheet.
					if (editor.scene.supportInCurrMode(commandOperate.SELECTSHEET))
						editor.execCommand(commandOperate.SELECTSHEET);
					isShortCuts = true;
					break;
				case "D":
				case "d":
					// fill selected range(s) down
					editor.directionFill(websheet.Constant.DIRECTION.DOWN);
					isShortCuts = true;
					break;
				case "R":
				case "r":
					// fill selected range(s) right
					editor.directionFill(websheet.Constant.DIRECTION.RIGHT);
					isShortCuts = true;
					break;
				default:
					isShortCuts = false;
				break;
				}
			}
		} else {
			if (e.keyCode == dk.ESCAPE)
				isShortCuts = true;
			else
				// no short cuts
				isShortCuts = false;
		}
		if (doCopy) {
			//announce copy operation
			if (dojo.isFF) {
				if(!this.accnls) this.accnls = dojo.i18n.getLocalization("websheet","base");
				this.announce(this.accnls.ACC_COPY);
			}
			if (this._focusWithInGrid()) {
				if(!dojo.isWebKit){
					if(editor.scene.supportInCurrMode(commandOperate.COPY))
						editor.execCommand(commandOperate.COPY, [e]);
				}
				isShortCuts = true;
				letPassEvent = true;
			}
		}
		if (doPaste) {
			if (this._focusWithInGrid()) {
				if (!dojo.isWebKit) {
					if(editor.scene.supportInCurrMode(commandOperate.PASTE))
						editor.execCommand(commandOperate.PASTE, [e]);
				}
				isShortCuts = true;
				letPassEvent = true;
			}
		}
		if (doInsert) {
			var bhChecker = null;
			if(this.editor.hasACLHandler())
			{
				bhChecker = this.editor.getACLHandler()._behaviorCheckHandler;
			}
			var selector = this.selection.selector();
			if (selector.selectingRows() && !selector.selectingSheet()) {
				var selected = selector.getRangeInfo();
				var ret = bhChecker && bhChecker.canCurUserInsert(this.sheetName,selected.startRow, selected.endRow,true);
				if(ret && !ret.canInsertBefore)
					bhChecker.cannotEditWarningDlg();
				else 
					editor.execCommand(commandOperate.INSERTROW, [selected.startRow, selected.endRow]);
				isShortCuts = true;
			} else if (selector.selectingColumns()) {
				var selected = selector.getRangeInfo();
				var ret = bhChecker && bhChecker.canCurUserInsert(this.sheetName,selected.startCol, selected.endCol,false);
				if(ret && !ret.canInsertBefore)
					bhChecker.cannotEditWarningDlg();
				else 
					editor.execCommand(commandOperate.INSERTCOLUMN, [selected.startCol, selected.endCol]);
				isShortCuts = true;
			}
			dojo.stopEvent(e);
		}
		if (isShortCuts) {
			if (!letPassEvent) {
				e.preventDefault();
			}
			return true;
		} else {
			return false;
		}
	}
	
});
