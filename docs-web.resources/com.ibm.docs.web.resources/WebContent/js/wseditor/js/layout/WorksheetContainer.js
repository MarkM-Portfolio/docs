dojo.provide("websheet.layout.WorksheetContainer");
dojo.require("dijit.layout.TabContainer");
dojo.require("websheet.Helper");
dojo.require("concord.util.BidiUtils");
dojo.require("websheet.grid.DataGrid");
dojo.requireLocalization("websheet","base");

//here to inherent TabContainer and ScrollingTabController is to fix defect 39477
//when insert new sheet, does not need to change the width of the tabcontainer, cause the original width is 50000px
dojo.declare("websheet.layout.ScrollingTabController", [dijit.layout.ScrollingTabController],{

	onAddChild: function(page, insertIndex)
	{
		//dijit.layout.TabController is the parent of ScrollingTabController, 
		dijit.layout.TabController.prototype.onAddChild.apply(this,arguments);
		// changes to the tab button label or iconClass will have changed the width of the
		// buttons, so do a resize
		dojo.forEach(["label", "iconClass"], function(attr){
			this.pane2watches[page.id].push(
				this.pane2button[page.id].watch(attr, dojo.hitch(this, function(name, oldValue, newValue){
					if(this._postStartup && this._dim){
						this.resize(this._dim);
					}
				}))
			);
		}, this);
	}
});

dojo.declare("websheet.layout.TabContainer", [dijit.layout.TabContainer],{
	
	postMixInProperties: function(){
		this.inherited(arguments);

		// Scrolling controller only works for horizontal non-nested tabs
		if(this.controllerWidget && this.controllerWidget == "dijit.layout.ScrollingTabController")
		{
			this.controllerWidget = "websheet.layout.ScrollingTabController";
		}	
	}
});

var websheet_layout_WorksheetContainer = {

	_sheetsIDMap: null, // store the initial extis sheets id, only used in selectChild, if the sheetId in this map, 
						// need to update the headerRow height, cause this only use in the first time, then delete the sheetId from the map	
	/**
	 * Maximum characters to display as sheet name before cutting
	 */
	MAX_TITLE_CHARS: 15,
	TITLE_ID:"worksheetTabcontainer_",
	templateString: dojo.cache("websheet.templates", "WorksheetContainer.html"),
	widgetsInTemplate: true,
	editor: null,
	tabPosition: "bottom",
	
	setBase: function(editor) {
		this.editor = editor;
		if(BidiUtils.isGuiRtl())
			this.tablist.tablistWrapper.setAttribute('dir','rtl');
	},
	
	constructor: function(args) {
		dojo.mixin(this, args);
		//[Performance]Replace dijit.layout.StackContainer.addChild
		dijit.layout.StackContainer.prototype.addChild = undefined;
		//The language and direction attribute should not be null for ACC/rpt support.
		if(!this.lang)
			this.lang = navigator.userLanguage || navigator.language;
		if(!this.dir){
			this.dir = dojo._isBodyLtr() ? "ltr" : "rtl";
		}
	},
	
	/*
	 * when the document first load, init this._sheetsIDMap map
	 */
	initSheetsIDMap: function()
	{
		var docObj = this.editor.getDocumentObj();
		var sheets = docObj.getSheets();
		if (!sheets || !sheets.length) return;
		this._sheetsIDMap = {};
		for(var i = 0; i < sheets.length; i++)
		{
			var id = sheets[i].getId();
			this._sheetsIDMap[id] = true;
		}
	},
	
	_onKeyPress: function(e){
		if(this.lastSelectedGrid && dojo.isFF)
		{
			var grid = this.lastSelectedGrid, dk = dojo.keys;
			if((e.ctrlKey || (dojo.isMac && (e.metaKey || e.ctrlKey))) && (e.keyCode == dk.PAGE_UP || e.keyCode == dk.PAGE_DOWN))
				return false;
		}
		this.inherited(arguments);
	},

	newWorksheet: function(sheetName,sheetId,position) {
		var docObj = this.editor.getDocumentObj();
		var sheet = docObj.getSheet(sheetName);
		var title = sheetName;
		if (title.substring(0, 1) == "'") {
			title = title.substring(1, title.length - 1);
		}
		if(!dijit.hasWaiState(this.domNode, "label"))
			dijit.setWaiState(this.domNode, "label", dojo.i18n.getLocalization("websheet","base").acc_worksheetPanelLabel);
		var shortenedTitle = websheet.Utils.truncateStrWithEllipsis(title,this.MAX_TITLE_CHARS);//websheet.BrowserHelper.shortenName4Display(title,this.MAX_TITLE_CHARS);
		shortenedTitle = websheet.Helper.escapeXml(shortenedTitle, null, true);
		shortenedTitle = shortenedTitle.replace(/\ /g,"&nbsp;");
		var freezeInfo = sheet.getFreezePos();
		
		var titleStr = '<span title="' + websheet.Helper.escapeXml(title, null, true) + ' " id="' + this.TITLE_ID + sheetId +  '" ' + BidiUtils.generateDirAttr(title) + '>' +shortenedTitle  + '</span>';
		if(sheet.isProtected())
			titleStr = titleStr + '<img src='+ this.editor.lockIcon + ' alt="' + this.editor.nls.PROTECTEDSHEET + '"></img>';
		var grid = new websheet.grid.DataGrid({
			title: titleStr,
			editor: this.editor,
			updateDelay: 0,
			sheetName: sheetName,
			defaultRowHeight : sheet._rowHeight,
			freezeRow: freezeInfo.row || 0,
			freezeCol: freezeInfo.col || 0,
			isMirrored: sheet.isMirrored()
		}, dojo.doc.createElement('div'));
		if (position != undefined )
			grid.placeAt(this, position);
		else
			grid.placeAt(this);
		if(sheet.getSheetColor())
			this.showSheetColor(sheet, position);
		dijit.setWaiState(grid.domNode, "label", dojo.i18n.getLocalization("websheet","base").acc_worksheetGridLabel + " " + sheetName);
		grid.startup();
		return grid;
	},
	
	removeWorksheet: function(sheetName) {
		var w = this.getWorksheet(sheetName);
		if (w) {
			this.removeChild(w);
		}
	},
	
	hideWorksheet: function(sheetName){
		var widget = this.getWorksheet(sheetName);
		if (widget) {
			var next = this._adjacent(true);
			var node = widget._wrapper;
			if(node && node.parentNode){
				node.parentNode.removeChild(node); // detach but don't destroy
			}
			
			if(this._started){
				// this will notify any tablists to remove a button; do this first because it may affect sizing
				dojo.publish(this.id + "-removeChild", [widget]);
			}

			// If we are being destroyed than don't run the code below (to select another page), because we are deleting
			// every page one by one
			if(this._beingDestroyed){ return; }

			// Select new page to display, also updating TabController to show the respective tab.
			// Do this before layout call because it can affect the height of the TabController.
			if(this.selectedChildWidget === widget){
				this.selectedChildWidget = undefined;
				if(this._started && next){
					this.selectChild(next);					
				}
			}

			if(this._started){
				// In case the tab titles now take up one line instead of two lines
				// (note though that ScrollingTabController never overflows to multiple lines),
				// or the height has changed slightly because of addition/removal of tab which close icon
				this.layout();
			}
		}
	},
	
	moveWorkSheetto: function(sheetName, index)
	{	
		this.movingSheet = true;
		try{
			var sheet = this.getWorksheet(sheetName);
			var controller = this.editor.getController();
			var grid = controller.getGrid(sheetName);
    		var inlineEditor = grid.getInlineEditor();
    		if(inlineEditor.isEditing())
    		{
    			this._restoreEditStatus = true;
    			inlineEditor.backupCursorSelection();
    			setTimeout(dojo.hitch(this, function(inlineEditor){
    				this.restoreEditStatus = null;
    				inlineEditor.restoreCursorSelection();
    			}, inlineEditor), 30);
    		}
    		else
    			this.restoreEditStatus = false;
		    this.removeChild(sheet);
		    this.addChild(sheet, index - 1);
		}catch(e)
		{
			console.log("err happened in move worksheet:" + e);
		}
	    this.movingSheet = false;
	},
	
	getWorksheet: function(sheetName) {
		var workSheets = this.getChildren();
		var sheet = dojo.filter(workSheets, function(item) {
			return item.getSheetName() == sheetName;
		});
		if (sheet.length >  0) {
			return sheet[0];
		}
		return null;
	},
	
	getCurrentWorksheet: function() {
		return this.selectedChildWidget;
	},
	
	isCurrentWorksheet: function(sheetName) {
		return this.getCurrentWorksheet() === this.getWorksheet(sheetName);
	},
	
	showSheetColor: function(sheet, pos){
		var tabs = this.tablist.getChildren();
		var tab = pos != undefined ? tabs[pos] : tabs[tabs.length - 1];
		if(tab){
			var color = sheet.getSheetColor();
			dojo.style(tab.domNode, "backgroundColor", color);
			var title = dojo.byId(this.TITLE_ID + sheet.getId());
			if(title){
				var gray = websheet.Utils.getGrayFromRGB(color);
				if(gray != null)
					(gray > 119) ? dojo.style(title, "color", "#000000") : dojo.style(title, "color", "#FFFFFF");
			}
		}
	},
	
	//Fixed for defect_20389
	selectChild: function(/*dijit._Widget*/ grid){
		if (!grid || this._beingDestroyed) return;
		
		var controller = this.editor.getController();
		var formulaBar = this.editor.getFormulaBar();
		var inlineEditor = controller.getInlineEditor();
		var bPartial = false;
		var doc = this.editor.getDocumentObj();
		var sheetName = grid.getSheetName();
		var oldSheetName = null;
		
		//Fixed defect 58652: If the editing cell is not formula cell, then apply and stop editing
		if (inlineEditor.isEditing()) {
			var editGrid = inlineEditor.getEditGrid();
			if (editGrid && editGrid != grid && !editGrid.isEditingFormulaCell() && !editGrid.isEditingDialog()) {
				try {
					editGrid.apply();
				} catch (e) {}
			}
		}
		
		if (this.lastSelectedGrid) {
			oldSheetName = this.lastSelectedGrid.sheetName;
			//reset freeze draw frame notify status
			if (this.lastSelectedGrid != grid) {
				this.editor.getFreezeHdl().resetFrameStatus(this.lastSelectedGrid.getSheetName());
				this.editor.getCommentsHdl().collapseCommentsByFocus(true);
				if (this.lastSelectedGrid.lastFocusNode)
					dijit.hideTooltip(this.lastSelectedGrid.lastFocusNode);
				if(this.lastSelectedGrid.dataSelectionHelper)
					this.lastSelectedGrid.dataSelectionHelper.close();
			}
			
			//if movingSheet is true, means moving sheet now, then getPartial would make the wrong it mapping in paritalManager
			if (!this.movingSheet) {
				// Need to refresh page, otherwise too large memory would be consumed and impact the browser performance
				if (!inlineEditor.isEditing() && doc.haveTooManyCells()) {
					var partialMgr = this.editor.getPartialManager();
					var sheetId = doc.getSheetId(sheetName);
					if (!partialMgr.isComplete(sheetId)) {
						this.inherited(arguments); // make sure the selected sheet is current sheet
						window.location.reload();
						return;
					}
				}

				bPartial = controller.getPartial(sheetName, true);
				var sheet = doc.getSheet(this.lastSelectedGrid.sheetName);
				if(sheet && sheet.getSheetColor()){
					var pos = doc.getSheetTabIndex(this.lastSelectedGrid.sheetName);
					this.showSheetColor(sheet, pos - 1);
				}
			}
			//reset it's cached value to 0, update it when switch back to it with (synUpdateScrollTop), get real scroll value from scroller.
			this.lastSelectedGrid.vScrollNodeTop = 0;
			this.lastSelectedGrid.selection.hibernate();
			// make sure it will be updated next time it is activated;
			this.lastSelectedGrid.forceUpdateOnResize = true;
		}
		
		//update in-line editor's binding grid
		inlineEditor.switchToGrid(grid);
		
		this.lastSelectedGrid = grid;
		this.inherited(arguments);
		if(!this.movingSheet){
			var tabIndex = doc.getSheetTabIndex(sheetName);
			if(tabIndex){
				var tab = this.tablist.getChildren()[tabIndex - 1];
				if(tab) {
					dojo.style(tab.domNode, "backgroundColor", "");
					var sheetId = doc.getSheetId(sheetName);
					var title = dojo.byId(this.TITLE_ID + sheetId);
					if(title)
						dojo.style(title, "color", "");
				}
			}
		}
		if (!grid.selection.isPickingRange()) {
			//wakeup selector
			grid.selection.select();
		}
		//start partial calculate the visible formula cells
		
		//if load finished and not get partial of this sheet, will calc visible formula here
		//if not load finished, the calcVisibleFormula will be triggered by Document._postLoadContent
		if(!doc.isLoading && !bPartial){
//					//show warning message for the sheet at the first show
//					//because it might be load finished by writing a formula refer to such sheet,
//					//so for the first display time of this grid, it should also show the warning message
//					var idManager = this.editor.getIDManager();
//					var sId = idManager.getSheetIdBySheetName(sheetName);
//					var criteria = {sheet: sId};
//					this.editor._showPostLoadWarningMessage(criteria, doc);
			
//					this.editor.scene.hideErrorMessage();//wait loading message
			var partialCalcMgr = this.editor.getPartialCalcManager();
			partialCalcMgr.calcVisibleFormula();
		}
		grid.bAnnounceSheet = true;
		if (formulaBar && !inlineEditor.isEditing())   {
			formulaBar.onSwitchSheet(grid.sheetName);
		}
		if (!bPartial && !this.editor.scene.isHTMLViewMode()) {
			this.editor.setFocusFlag(true);
		}
		/*
		 * Set focus to grid DOM node first, 
		 * and then asynchronously focus to cell node via focus2Grid()
		 * Some browser implementation may fail to locate focus on particular element (cNode TD ?)
		 */
		if(dijit._underlay && dijit._underlay.domNode.style.display != "none" && 
				dijit.Dialog._dialogStack && dijit.Dialog._dialogStack.length > 1){
			//do not set focus to anywhere if a modal window (i.e the welcome dialog) is shown, leave it there
			//after dialog is closed by user, focus will be set to grid.
			//Reference: Defect 15198 [A11Y][Web 2.1d] Welcome dialog could not get focused by keyboard after loaded a sheet with contents.
			var len =  dijit.Dialog._dialogStack.length;
			var dialog =  dijit.Dialog._dialogStack[len-1].dialog;
			if(dialog && dialog.title == this.editor.nls.DELETE_SHEET)
			{
				//for the delete sheet action, it would select the next sheet, here need to focus
				setTimeout(dojo.hitch(this.editor, "_focus"), 10);
			}	
		}
		else if(!this._restoreEditStatus)
		{
			if (!this.movingSheet) {
				this.editor.focus2GridDOM();
			} else {
				this.editor.focus2Grid();
			}
		}
		//
		var focusCell = grid.selection.getFocusedCell();
		var styleCell = doc.getCell(
				grid.sheetName, 
				focusCell.focusRow + 1, 
				focusCell.focusCol,
				websheet.Constant.CellType.STYLE, true);
		var styleId;
		if (styleCell) {
			styleId = styleCell._styleId;
		} else {
			var colModel = doc.getColumn(sheetName, focusCell.focusedCol, true);
			if (colModel) {
				styleId = colModel.getStyleId();
			}
		}
		this.editor.applyUIStyle(doc._getStyleManager().getStyleById(styleId));
		var drawFrameHdl = this.editor.getDrawFrameHdl();
		var drawFrameRanges = drawFrameHdl.getSelectedDrawFramesInSheet(sheetName);
		var toolbar = this.editor.getToolbar();
		if(drawFrameRanges.length != 0){
			if (toolbar) toolbar.disableImagePropertyDlg(false);
		}else{
			if (toolbar) toolbar.disableImagePropertyDlg(true);
		}
		var chartHdl = this.editor.getChartHdl(); 
		chartHdl.disableInsertChart(sheetName);
		customizeContextMenu(this.editor.scene);
		if (!this.editor.isMobile()) {
			customizeToolbar(this.editor.scene, null, toolbar);
			customizeMenubar(this.editor.scene);
		}
		// This is for ACL
		customizeSheetContextMenu(this.editor);
		if (toolbar) {
			toolbar.refreshUndoRedoIcon();
			if(!grid.isEditingFormulaCell())
			{
				var selector = grid.selection.selector();
				dojo.publish("UserSelection",[{selector: selector}]);
			}	
		}
		this._removeInvalidState();
		
		//for ACL
		if(!this.movingSheet && sheetName != oldSheetName)
			dojo.publish("selectSheetChanged",[{sheetName:sheetName}]);
	},
	//End 20389
	
	//just for IE
	destroyDescendants: function(/*Boolean*/preserveDom){
		if (this._destroyed)
			return;
		this.inherited(arguments);
	},
		
	showWorksheet: function(sheetName) {
		this.selectChild(this.getWorksheet(sheetName));
		//update UI in case the UI is not ready because of lazy loading		
	},
	
	clearWorksheets: function() {
		this._beingDestroyed = true;
		if(this.hasChildren()) {
			var children = this.getChildren();
			for (var i in children) {
				this.removeChild(children[i]);
			}
			this.destroyDescendants(true);
		}
		this._beingDestroyed = false;
		this.selectedChildWidget = null;
		this.lastSelectedGrid = null;
	},
	
	DisableMenuItems: function(){
		var document = this.editor.getDocumentObj();
		var unhided_sheet_count = document.getVisibleSheetsCount();
		var disable_menu_item = true;
		if (unhided_sheet_count > 1){
			disable_menu_item = false;
		}
		var menuitem = dijit.registry.byId("S_CM_Hide_Sheet");
    	if (menuitem){
    		window["pe"].menuItemDisabled(menuitem,disable_menu_item);  			
    	}
    	menuitem = dijit.registry.byId("S_CM_Delete_Sheet");
    	if (menuitem){
    		window["pe"].menuItemDisabled(menuitem,disable_menu_item);  			
    	} 
    	menuitem = dijit.registry.byId("S_CM_Move_Sheet");
    	if (menuitem){
    		window["pe"].menuItemDisabled(menuitem,disable_menu_item);  			
    	} 
	},
	
	onMouseDown: function(grid,e)
	{
		// for the context menu, should not to focus 2 the grid
		// in ie and ff, the button == 2 means right click
		// in safari, dojo.isMac && e.ctrlKey means right click
		if(e.button == 2)
		{
			this.editor.setFocusFlag(false);
			this.DisableMenuItems();
			this.selectChild(grid);
		}
		else if(dojo.isMac && e.ctrlKey)
		{
			this.editor.setFocusFlag(false);
			this.DisableMenuItems();
		}
	},
	
	onContextMenu: function(e)
	{
		var grid = this.lastSelectedGrid;
		if(grid &&( grid.isEditingDialog() || grid.isEditingFormulaCell()))
		{
			return dojo.stopEvent(e);
		}
	},
	
	resize: function()
	{
		//here to cache the grid height and width when resize
		var gridHeight = window["pe"].gridHeight;
		var tabHeight = window["pe"].tabHeight;
		if(this.containerNode.id == "sheet_tab_container")
		{
			window["pe"].gridWidth = this.domNode.offsetWidth ;
			if(tabHeight)
			window["pe"].gridHeight = this.domNode.offsetHeight  - tabHeight + 1;
		}	
		this.inherited(arguments);
		if(!tabHeight)
		{
			window["pe"].tabHeight = this.tablist.domNode.offsetHeight;
		}	
	},
	
	//[Performance]Overrides dijit.layout.StackContainer.addChild
	addChild:function(child,insertIndex){
		this.inherited(arguments);
		
		if(this._started){
			//ACC/RPT, language and direction can not be "" to support screen reader.
			if(!child.lang)
				child.lang = navigator.userLanguage || navigator.language;;
			if(!child.dir)
				child.dir = dojo._isBodyLtr() ? "ltr" : "rtl";
			dojo.publish(this.id+"-addChild", [child, insertIndex]);
			//Performance improvement, move below code later
			//this.layout();
			if(child.controlButton)
			{
				dojo.connect(child.controlButton.domNode,"onmousedown",dojo.hitch(this,this.onMouseDown,child));
				dojo.connect(this.tablist.tablistWrapper,"oncontextmenu",dojo.hitch(this,this.onContextMenu));
			}
			var doc = this.editor.getDocumentObj();
			var sheet = doc.getSheet(child.sheetName);
			if(sheet && sheet.getSheetColor()){
				var pos = doc.getSheetTabIndex(child.sheetName);
				this.showSheetColor(sheet, pos - 1);
			}
		}
	},
	/**
	 * For RPT compliance, dojo tab role do not have aria-pressed state(this is for buttons).
	 */
	_removeInvalidState: function(){
		for( pageId in this.tablist.pane2button){
			var sheetTab = this.tablist.pane2button[pageId];
			sheetTab && sheetTab.focusNode && dijit.removeWaiState(sheetTab.focusNode, "pressed");
		}
	},
	
	getContainerNode:function(){
		return this.containerNode;
	}
};
dojo.declare("websheet.layout.WorksheetContainer", [websheet.layout.TabContainer], websheet_layout_WorksheetContainer);
delete websheet_layout_WorksheetContainer;