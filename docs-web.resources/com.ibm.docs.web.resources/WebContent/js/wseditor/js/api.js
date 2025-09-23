/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2016. All Rights Reserved.          */
/*                                                                   */
/* U.S. Government Users Restricted Rights: Use, duplication or      */
/* disclosure restricted by GSA ADP Schedule Contract with IBM Corp. */
/*                                                                   */
/* ***************************************************************** */

dojo.provide("websheet.widget.sidebar");
dojo.require("websheet.widget.CommonPane");

dojo.declare("websheet.widget.sidebar", [websheet.widget.CommonPane], {
	constructor: function (domNode, title, userInterface) {
		this._title = title;
		
		this._userInterface = userInterface;
		this._closeText = " close button";
		
		dojo.style(domNode, {"background-color": "#FFFFFF"});

		this.buildAll();
	},
	
	_createTitle: function() {
		var title = dojo.create("span",{innerHTML:this._title}, this._headerNode);
		dojo.addClass(title, "title");
		
		dijit.setWaiState(this._closeBtn,"label",this._title +  this._closeText);
		dijit.setWaiRole(this._closeBtn, 'button');
	},
	
	_createContent: function() {
		// TODO add sandBoxFrame here
		
		var contentNode = dojo.create("div", null, this.domNode);
		dojo.create("div", {innerHTML: this._userInterface}, contentNode);
	}
});

dojo.provide("websheet.api");
dojo.require("concord/util/ApiEngine");

websheet.api = {
	getEditor: function() {
		return websheet.model.ModelHelper.getEditor();
	},
	
	getDocType: function() {
		var docType = "sheet";
		return this._genResult(docType);
	},

	// Publish silently to create new file version
	_idocs_saveToRepository: function() {
		var editor = this.getEditor();
		var data = {"changeSummary": ""};
    	editor.publish(data);
    	
		return this._genResult();
	},
	
	// append custom fonts to fontname submenu on menubar and dropdown on toolbar
	_idocs_addFonts: function(list) {
		var dirAttr = BidiUtils.isGuiRtl() ? 'rtl' : '';
		var tempList = [];
		
		var fontNameMenu = dijit.registry.byId("S_m_FontName");
		var toolbarFontNameMenu = dijit.registry.byId("S_m_FontName_toolbar");
		dojo.forEach(fontNameMenu.getChildren(), function(child){
			tempList.push(child.label.toLowerCase());
		});
		
    	for (var i = 0; i < list.length; i++) {
			var label = list[i];
			if (!label || typeof label != "string" || label.length == 0)
				continue;
			
			label = label.trim();
			label = websheet.Helper.escapeXml(label);
			
			var found = false;
			var lowercaseLabel = label.toLowerCase();
			for (var j = 0; j < tempList.length; j++) {
				if (lowercaseLabel == tempList[j]) {
					found = true;
					break;
				}
			}
			if (found) continue;
			tempList.push(lowercaseLabel);

			var _mItem = null;
			var id = "S_i_FONT_" + label.replace(/ /g,"_");
			fontNameMenu.addChild(_mItem = new dijit.CheckedMenuItem({
		    	id: id,
		        label: label,
		        style: {fontFamily: label},
		        onClick: function() {
		        	pe.lotusEditor.execCommand(commandOperate.FONT, [this.label]);
		        },
		        dir: dirAttr
		    }));
			dijit.setWaiState(_mItem.domNode, "labelledby", _mItem.containerNode.id);
			
			var _mItem2 = null;
			id += "_toolbar";
			toolbarFontNameMenu.addChild(_mItem2 = new dijit.CheckedMenuItem({
		    	id: id,
		        label: label,
		        style: {fontFamily: label},
		        onClick: function() {
		        	pe.lotusEditor.execCommand(commandOperate.FONT, [this.label]);
		        },
		        dir: dirAttr
		    }));
			dijit.setWaiState(_mItem2.domNode, "labelledby", _mItem2.containerNode.id);			
		}

		return this._genResult();
	},
	
	/*void*/configSubMenu: function(/*array*/menubarData, /*MenubarConfig*/widget, level) {
		var visibleMode = websheet.Constant.ModeVisible.EDITMODEVISIBLE;
		for (var i = 0; i < menubarData.length; i++) {
			var element = {};
			var item = menubarData[i];
			var type = item.type;
			if (type == "separator") {
				element.type = websheet.Constant.MenuBarType.MENUSEPORATOR;
				element.showMODE = visibleMode;
			} else if (type == "menuitem") {
				var label = item.label;
				var func = item.func;
				
				element.id = dojo.string.substitute("S_i_Add-ons_${0}_${1}", [level, label]);
				element.isShow = true;
				element.type = websheet.Constant.MenuBarType.MENUITEM,
				element.label = websheet.Helper.escapeXml(label);
				element.showMODE = visibleMode;
				element.privatecommand = func;
			} else if (type == "menu") {
				var subMenu = item.sub;
				var label = subMenu.label;

		     	element.id = dojo.string.substitute("S_m_Add-ons_${0}_${1}", [level, label]);
 			 	element.pid = dojo.string.substitute("S_i_Add-ons_${0}_${1}", [level, label]);
 			 	element.isShow = true;
	 		    element.type = websheet.Constant.MenuBarType.POPUPMENU; 
	 		    element.label = websheet.Helper.escapeXml(label);
	 		    element.showMODE = visibleMode;
	 		    element.sub = [];
	 		    
	 		    this.configSubMenu(subMenu.elements, element.sub, ++level);
			}
			
			widget.push(element);
		}
	},
	
	/*void*/createSubMenu: function(scene, widget) {
		var menubar = dijit.registry.byId("S_m");
		if (!menubar) return;

		var isShow = widget.isShow  != undefined ? widget.isShow: true;
		if	(!isShow /*|| !_showInCurrMode(scene, widget) */) return;

		var dirAttr = BidiUtils.isGuiRtl() ? 'rtl' : '';
		if	(widget.type == websheet.Constant.MenuBarType.POPUPMENUBAR) {
			var popupmenubar = dijit.registry.byId(widget.id);
			if (popupmenubar)
				_createSubMenu(scene, popupmenubar, widget.sub, dirAttr);
			else {
				popupmenubar = new dijit.Menu({ id:  widget.id, dir: dirAttr });
				dojo.addClass(popupmenubar.domNode,"lotusActionMenu");
				dojo.addClass(popupmenubar.domNode,widget.cssClass);
				dijit.setWaiState(popupmenubar.domNode, "label", widget.accLabel? widget.accLabel: widget.label);
					
				_createSubMenu(scene, popupmenubar, widget.sub, dirAttr);
				
				var helpMenu = menubar._getLast();
				menubar.removeChild(helpMenu);
				menubar.addChild(new dijit.PopupMenuBarItem({label: widget.label, id: widget.pid, popup: popupmenubar}));
				menubar.addChild(helpMenu);
			}
		}
	},
	
	_idocs_menu_addUi: function(/*array*/menubarData) {
		var editor = this.getEditor();
		var menuStrs = dojo.i18n.getLocalization("concord.widgets","menubar");
		var label = menuStrs.addOnsMenu;

		var widget = {};
     	widget.id = dojo.string.substitute("S_m_Add-ons_0_${0}", [label]);
		widget.pid = dojo.string.substitute("S_i_Add-ons_0_${0}", [label]);
		widget.isShow = true;
		widget.type = websheet.Constant.MenuBarType.POPUPMENUBAR; 
		widget.label = label;
		widget.sub = [];
		widget.showMODE = websheet.Constant.ModeVisible.EDITMODEVISIBLE;

		this.configSubMenu(menubarData, widget.sub, 1);
		this.createSubMenu(editor.scene, widget);
		
		return this._genResult();
	},
	
	_idocs_ui_alert: function(title, message, okButtonOnly, domain, messageId) {
		var params = {message: message};
		var dialog;
		var productName = concord.util.strings.getProdName();
		if (okButtonOnly) {
			params.callback = this._idocs_ui_alert_callback;
			params.cancelCallback = this._idocs_ui_alert_cancelCallback;
			dialog = new concord.widgets.MessageBox(this, title ? title : productName, null, false, params);
		} else {
			params.callback = this._idocs_ui_confirm_callback;
			dialog = new concord.widgets.ConfirmBox(this, title ? title : productName, null, true, params);
		}
		dialog.show();

		this.alert_domain = domain;
		this.alert_messageId = messageId;		
		
		return null;
	},

	_idocs_ui_alert_cancelCallback: function(apiObj) {
		apiObj._idocs_ui_alert_callback(apiObj, true);
	},
	
	_idocs_ui_confirm_callback: function(apiObj, okBtnClicked) {
		apiObj._idocs_ui_alert_callback(apiObj, !okBtnClicked);
	},
	
	_idocs_ui_alert_callback: function(apiObj, cancelBtnClicked) {
		cancelBtnClicked = !!cancelBtnClicked;
		var result = apiObj._genResult(!cancelBtnClicked);
		
		var domain = apiObj.alert_domain;
		var id = apiObj.alert_messageId;
    	apiObj.responseApiCall(domain, id, result.status, result.detail);
    	
    	delete apiObj.alert_domain;
    	delete apiObj.alert_messageId;
	},

	_idocs_ui_prompt: function(title, message, domain, messageId) {
		var params = {message: message,
					callback: this._idocs_ui_prompt_callback,
					cancelCallback: this._idocs_ui_prompt_cancelCallback};
		var productName = concord.util.strings.getProdName();
		var dialog = new concord.widgets.InputBox(this, title ? title : productName, null, true, params);
		dialog.show();

		this.prompt_domain = domain;
		this.prompt_messageId = messageId;
		
		return null;
	},

	_idocs_ui_prompt_cancelCallback: function(apiObj) {
		apiObj._idocs_ui_prompt_callback(apiObj, null, true);
	},

	_idocs_ui_prompt_callback: function(apiObj, input, cancelBtnClicked) {
		cancelBtnClicked = !!cancelBtnClicked;
		var response = {button: !cancelBtnClicked};
		if (input) response.input = input;
    	var result = apiObj._genResult(response);
    	
    	var domain = apiObj.prompt_domain;
    	var id = apiObj.prompt_messageId;
    	apiObj.responseApiCall(domain, id, result.status, result.detail);
    	
    	delete apiObj.prompt_domain;
    	delete apiObj.prompt_messageId;
	},

	_idocs_ui_showDialog: function(userInterface) {
		var params = {content: userInterface.content};
		if (userInterface.width) params.width = userInterface.width;
		var productName = concord.util.strings.getProdName();
		var title = userInterface.title;
		var dialog = new concord.widgets.ModelDialog(this, title ? title : productName, null, false, params);
		dialog.show();
		
		return this._genResult();
	},
	
	_idocs_ui_showSidebar: function(userInterface) {
		var editor = this.getEditor();
		if (this._sidebar) {
			this._sidebar.close();
			this._sidebar = null;
		}
		
		var mainNode = dojo.byId("mainNode");
		var	pNode = dojo.create("div",{id: "idocs_sidebar_div"}, mainNode);
		var title = userInterface.title ? userInterface.title : "Sidebar"; // FIXME "Sidebar" is hard-coded
		var width = userInterface.width;
		if (width === undefined) width = -1;
		var sidePaneMgr = editor.getPaneMgr();
		sidePaneMgr.setWidth(width);
		
		this._sidebar = new websheet.widget.sidebar(pNode, title, userInterface.content);
		this._sidebar.open();
		
		return this._genResult();
	},

	 /*
     * return editvalue of focused cell as string
     * scope must be 'cell' in spreadsheet
     */ 
    getSelectedTextInScope: function(scope){
    	if(scope != "cell")
    		return this._genError("not supported scope, just support cell as scope");
    	var editor = this.getEditor();
    	if(editor.hasDrawFrameSelected())
    		return this._genError("There is not cell selected");
    	
    	var grid = editor.getCurrentGrid();
		var selector = grid.selection.selector();
		var sheetName = grid.getSheetName();
		var rowIdx = selector.focusRow + 1;
		var colIdx = selector.focusCol;
		
		var doc = editor.getDocumentObj();
		var cell = doc.getCell(sheetName, rowIdx, colIdx, websheet.Constant.CellType.MIXED);
		if(!cell)
			return this._genResult("");
		
		var v = cell.getEditValue(null, true);//editvalue
		//change number to string?
		return this._genResult(v + "");
    },
    
    /*
     * select and scroll to current focused cell or next text cell.
     * Just circle inside one sheet, unless user click to change to another sheet.
     * direction: ['self'|'nextSibling']
     */
    selectTextInScope: function(scope, direction){
    	if(scope != "cell")
    		return this._genError("not supported scope, just support cell as scope");
    	var editor = this.getEditor();
    	if(editor.hasDrawFrameSelected())
    		return this._genError("There is not cell selected");
    	var grid = editor.getCurrentGrid();
		var selector = grid.selection.selector();
    	if(direction == "self"){
    		grid.selection.doCellFocus(selector.focusRow, selector.focusCol, true);
    		return this._genResult();
    	}else if(direction == "nextSibling"){
    		var sheetName = grid.getSheetName();
    		var rowIdx = selector.focusRow + 1;
    		var colIdx = selector.focusCol;
    		
    		//find next cell with string value
    		var loop = true;
    		var doc = editor.getDocumentObj();
    		var sheet = doc.getSheet(sheetName);
    		var rows = sheet._rows;
    		var len = rows.length;
    		if(len == 0)
    			return this._genResult();
    		var mhelper = websheet.model.ModelHelper;
    		var rIdx = mhelper.binarySearch(rows,rowIdx,mhelper.equalCondition,"",false,sheet._id, sheet.Constant.Row);
    		var cIdx = colIdx;// + 1;
    		if(rIdx < 0){//current row is empty row, move to next row
    			cIdx = 0;
    			rIdx = -(rIdx + 1);
    		}
    		
    		while(rIdx < len || loop){
    			if(rIdx >= len){
    				rIdx = 0;
    				loop = false;
    			}
    			var row = rows[rIdx];
    			if(!row._valueCells)
    				continue;
    			while(cIdx < row._valueCells.length){
    				var cell = row._valueCells[cIdx];
    				if(cell &&((cell.getType() >>3) == websheet.Constant.ValueCellType.STRING
    						|| (cell.getType() >>3) == websheet.Constant.ValueCellType.BOOLEAN))//cell.type
    				{
    					grid.selection.doCellFocus(row.getIndex() - 1, cIdx + 1, true);
    	    			return this._genResult();
    				}
    				cIdx ++;
    			}
    			rIdx ++;
    			cIdx = 0;
    		}
    		return this._genError("There is error when selecting next sibling");
    	}else
    		return this._genError("not supported direction, self or nextSibling");
    },
    
    /*
     * Set value to current focused cell.
     */
    setTextInScope: function(value, scope){
    	if(scope != "cell")
    		return this._genError("not supported scope, just support cell as scope");
    	if(value == null)
    		return this._genError("value can not be null");
    	if(typeof value != "string" && typeof value != "boolean" && typeof value != "number")
    		return this._genError("value must be string, boolean or number");
    	var editor = this.getEditor();
    	if(editor.hasDrawFrameSelected())
    		return this._genError("There is not cell selected");
    	
    	var grid = editor.getCurrentGrid();
		var selector = grid.selection.selector();
		var rowIdx = selector.focusRow + 1;
		var colIdx = selector.focusCol;
		
//		if(!this._checkEditAble())
//			return {status : 'error'};
		grid.setValue(value, rowIdx, colIdx, false, true);
		grid.updateRow(rowIdx);
		return  this._genResult();
    },
    
    _sheet_getActiveSheet: function() {
    	var editor = this.getEditor();
    	var doc = editor.getDocumentObj();
    	var grid = editor.getCurrentGrid();
    	if (!grid)
    		return this._genError("no active sheet");
    	
    	var sheetName = grid.getSheetName();
    	var sheetId = doc.getSheetId(sheetName);
    	return this._genResult(sheetId);
    },
    
    _sheet_setActiveSheet: function(sheetId) {
    	var editor = this.getEditor();
    	var doc = editor.getDocumentObj();
    	var sheetName = doc.getSheetName(sheetId);
    	var grid = editor.getController().getGrid(sheetName);
    	if (grid) {
    		editor.getWorksheetContainer().selectChild(grid);
    		return this._genResult();
    	} else
    		return this._genError("can not active this sheet");
    },
        
    _sheet_getSheets: function() {
    	var editor = this.getEditor();
    	var doc = editor.getDocumentObj();
    	var sheets = doc.getSheets();
    	var sheetsInfo = {};
    	for (var i = 0; i < sheets.length; i++) {
    		var sheet = sheets[i];
    		var sheetId = sheet.getId();
    		sheetsInfo[sheetId] = sheet.getIndex();
    	}
    	
    	return this._genResult(sheetsInfo);
    },
    
    _sheet_isValidSheet: function(sheetName) {
    	var editor = this.getEditor();
    	var doc = editor.getDocumentObj();
    	var sheet = doc.getSheet(sheetName);
    	if (sheet) {
    		var sheetId = sheet.getId();
    		return this._genResult(sheetId);
    	} else
    		return this._genError("this sheet doesn't exist");
    },
    
    _sheet_insertSheet: function(sheetName) {
    	var editor = this.getEditor();
    	var doc = editor.getDocumentObj();
    	if (!websheet.Helper.isValidSheetName(sheetName))
    		return this._genError("this sheet name isn't valid");
    	if (doc.isSheetExist(sheetName))
    		return this._genError("this sheet already exists");
 
    	editor.insertSheet(sheetName);
    	
    	var sheetId = doc.getSheetId(sheetName);
    	return this._genResult(sheetId);
    },
    
    _sheet_hideSheet: function(sheetId) {
    	var editor = this.getEditor();
    	var doc = editor.getDocumentObj();
    	var sheetName = doc.getSheetName(sheetId);    	
    	editor._hideSheet(sheetName);
    	
    	return this._genResult();
    },

    _sheet_showSheet: function(sheetId) {
    	var editor = this.getEditor();
    	var doc = editor.getDocumentObj();
    	var sheetName = doc.getSheetName(sheetId);
    	editor.unhideSheet(sheetName);
    	
    	return this._genResult();
    },

    _sheet_getSheetName: function(sheetId) {
    	var editor = this.getEditor();
    	var doc = editor.getDocumentObj();
    	var sheetName = doc.getSheetName(sheetId);
    	
    	return this._genResult(sheetName);
    },
    
    _sheet_setSheetName: function(sheetId, newSheetName) {
    	var editor = this.getEditor();
    	var doc = editor.getDocumentObj();
    	var sheetName = doc.getSheetName(sheetId);    	
    	
    	if (!websheet.Helper.isValidSheetName(newSheetName))
    		return this._genError("this sheet name isn't valid");
    	if (doc.isSheetExist(newSheetName))
    		return this._genError("this sheet already exists");
		
    	editor._doRenameSheet(editor, sheetName, newSheetName);
    	
    	return this._genResult();
    },

    _sheet_isHiddenSheet: function(sheetId) {
    	var editor = this.getEditor();
    	var doc = editor.getDocumentObj();
    	var sheet = doc.getSheetById(sheetId);
    	var visible = sheet.isSheetVisible();
    	
    	return this._genResult(!visible);
    },
    
    _sheet_getSheetIndex: function(sheetId) {
    	var editor = this.getEditor();
    	var doc = editor.getDocumentObj();
    	var sheet = doc.getSheetById(sheetId);
    	var index = sheet.getIndex();
    	// FIXME should return tab index instead?
//    	index = doc.getSheetTabIndexByIndex(index);

    	return this._genResult(index);
    },

    _sheet_getActiveRange: function(sheetId) {
    	var editor = this.getEditor();
    	var doc = editor.getDocumentObj();
    	var sheetName = doc.getSheetName(sheetId);    	
    	var grid = editor.getController().getGrid(sheetName);
    	if (!grid)
    		return this._genError("this sheet doesn't exist");

    	var selector = grid.selection.activeSelector();
		var rangeInfo = selector.getRangeInfo();
		var selectType = selector.getSelectType();
		var range = {row: rangeInfo.startRow, column: rangeInfo.startCol, endRow: rangeInfo.endRow, endColumn: rangeInfo.endCol};
		switch (selectType) {
 		case websheet.Constant.Column:
 		case websheet.Constant.ColumnRange:
 			range.row = -1;
 			range.endRow = -1;
 			break;
 		case websheet.Constant.Row:
 		case websheet.Constant.RowRange:
 			range.column = -1;
 			range.endColumn = -1;
 			break;
 		default:
 			break;
		}
		
    	return this._genResult(range);
    },

    _sheet_setActiveRange: function(sheetId, row, col, endRow, endCol, type) {
    	var editor = this.getEditor();
    	var doc = editor.getDocumentObj();
    	var sheetName = doc.getSheetName(sheetId);    	
    	var grid = editor.getController().getGrid(sheetName);
    	if (!grid)
    		return this._genError("this sheet doesn't exist");
    	
    	editor.doCellFocus(sheetName, row == -1 ? 1 : row, col == -1 ? 1 : col);
    	
    	var selection = {sheetName: sheetName, startRow: row, startCol: col, endRow: endRow, endCol: endCol};
    	if (type == 1) selection.bCell = true;
    	else if (type == 2) selection.bRow = true;
    	else if (type == 4) selection.bCol = true;
    	else selection.bRange = true;
    	editor.select(selection);
    	
    	return this._genResult();
    },
    
    _sheet_range_clearContent: function(sheetId, row, col, endRow, endCol, domain, messageId) {
    	var editor = this.getEditor();
    	var doc = editor.getDocumentObj();
    	var sheetName = doc.getSheetName(sheetId);
    	if (!this._checkEditAble(sheetName, row, col, endRow, endCol))
    		return this._genError("no permission to change cell value");

    	if (editor.getController().getPartial(sheetName)) {
    		var self = this;
    		var method = function() {
    			editor._clearRange(sheetName, row, col, endRow, endCol);
    	    	var result = self._genResult();
    	    	self.responseApiCall(domain, messageId, result.status, result.detail);
    		};
    		
    		editor.getPartialManager().addNotify(method);
    		
    		return null; //not ready to response yet
    	}
    	
    	editor._clearRange(sheetName, row, col, endRow, endCol);
    	return this._genResult();
    },
    
    _sheet_range_getValues: function(sheetId, row, col, endRow, endCol, bShowValue, domain, messageId) {
    	var editor = this.getEditor();
    	var doc = editor.getDocumentObj();
    	var sheet = doc.getSheetById(sheetId);
		var sheetName = sheet.getSheetName();
    	var lastRowModel = sheet._rows.length > 0 ? sheet._rows[sheet._rows.length - 1] : null;
    	var maxRow = 0;
    	if (lastRowModel) maxRow = lastRowModel.getIndex();
    	
    	var colSize = endCol - col + 1;
    	var count = 0;
    	var MaxCount = 50000; // FIXME the hardcoded 50,000 cells

		var values = [];
		var rangeInfo = {sheetName: sheetName, startRow: row, startCol: col, endRow: endRow, endCol: endCol};
		var colModelArray = websheet.model.ModelHelper.getCols(rangeInfo, true, true).data;
		var iter = new websheet.model.RangeIterator(rangeInfo, websheet.Constant.RangeIterType.NORMAL);

    	if (editor.getController().getPartial(sheetName)) {
    		var self = this;
    		var method = function() {
    			iter.iterate(dojo.hitch(self, function(obj, rowIndex, colIndex) {
    				if (count > MaxCount) return false;
    				if (rowIndex > maxRow) return false;
    				
    				var value = "";
    				var list = values[rowIndex - row];
    				if (!list)
    					list = values[rowIndex - row] = [];
    				
    				var rowModel = obj && obj.row;
					if (!rowModel || rowModel._valueCells.length < colIndex) {
						count += colSize - list.length;
						return true;
					}
			
    				var cell = obj && obj.cell, isCovered = obj && obj.isCovered;
    				var styleCell = obj && obj.styleCell;
    				if ((!cell || cell.isNull()) || isCovered) {
    					list.push(value);
    					++count;
    					return true;
    				}
    				
    				var colModel = colModelArray[colIndex-col];
    				var colStyleId = colModel ? colModel._styleId : null;
    				var styleId = styleCell ? styleCell._styleId : colStyleId;
    	    		if (bShowValue)
    	    			value = cell.getShowValue(styleId);
    	    		else
    	    			value = cell.getEditValue(styleId, true);
    	    		list.push(value);
    	    		++count;
    			    return true;
    			}));

				var result;
				if (count > MaxCount)
				 	result = self._genError("too many cells, can not get their values");
				else
    	    		result = self._genResult(values);
    	    	self.responseApiCall(domain, messageId, result.status, result.detail);
    		};

    		editor.getPartialManager().addNotify(method);
    		
    		return null; // not ready to response yet
    	}

		iter.iterate(dojo.hitch(this, function(obj, rowIndex, colIndex) {
			if (count > MaxCount) return false;
			if (rowIndex > maxRow) return false;
			
			var value = "";
			var list = values[rowIndex - row];
			if (!list)
				list = values[rowIndex - row] = [];
			
			var rowModel = obj && obj.row;
			if (!rowModel || rowModel._valueCells.length < colIndex) {
				count += colSize - list.length;
				return true;
			}
			
			var cell = obj && obj.cell, isCovered = obj && obj.isCovered;
			var styleCell = obj && obj.styleCell;
			if ((!cell || cell.isNull()) || isCovered) {
				list.push(value);
				++count;
				return true;
			}
			
			var colModel = colModelArray[colIndex-col];
			var colStyleId = colModel ? colModel._styleId : null;
			var styleId = styleCell ? styleCell._styleId : colStyleId;
    		if (bShowValue)
    			value = cell.getShowValue(styleId);
    		else
    			value = cell.getEditValue(styleId, true);
    		list.push(value);
    		++count;
		    return true;
		}));
		
		if (count > MaxCount)
			return this._genError("too many cells, can not get their values");

    	return this._genResult(values);
    },
    
    _sheet_range_setValues: function(sheetId, row, col, endRow, endCol, values, domain, messageId) {
    	var editor = this.getEditor();
    	var doc = editor.getDocumentObj();
    	var sheetName = doc.getSheetName(sheetId);
    	var controller = editor.getController();
    	var grid = controller.getGrid(sheetName);
    	if (!grid)
    		return this._genError("this sheet doesn't exist");
    	if (!this._checkEditAble(sheetName, row, col, endRow, endCol))
    		return this._genError("no permission to change cell value");
    	
    	var colSize = endCol - col + 1;
    	if (values.length * colSize > 50000) // FIXME the hardcoded 50,000 cells
    		return this._genError("too large range, can not set values to it");
    	
    	if (controller.getPartial(sheetName)) {
    		var self = this;
    		var method = function() {
 	    		for (var i = 0; i < values.length; i++) {
   	    			var list = values[i];
   	    			for (var j = 0; j < colSize; j++) {
   	    				var value = list ? (list[j] !== undefined ? list[j] : "") : "";
   	    				grid.setValue(list[j], row + i, col + j, false, true);
   	    			}
					
   	    			grid.updateRow(row + i);
   	    		}
   		    	
    	    	var result = self._genResult();
    	    	self.responseApiCall(domain, messageId, result.status, result.detail);
   			}
    		
    		editor.getPartialManager().addNotify(method);
    		
    		return null; //not ready to response yet
    	}

		//FIXME cann't undo all changes at once
   		for (var i = 0; i < values.length; i++) { // FIXME should use rowSize here (endRow - row + 1)
   			var list = values[i];
   			for (var j = 0; j < colSize; j++) {
   				var value = list ? (list[j] !== undefined ? list[j] : "") : "";
   				grid.setValue(value, row + i, col + j, false, true);
   			}
    			
   			grid.updateRow(row + i);
   		}
    	
    	return this._genResult();
    },
    
    _sheet_range_canEdit: function(sheetId, row, col, endRow, endCol) {
       	var editor = this.getEditor();
    	var doc = editor.getDocumentObj();
    	var sheetName = doc.getSheetName(sheetId);
    	var editable = this._checkEditAble(sheetName, row, col, endRow, endCol);
    	return this._genResult(editable);
    },
    
    _sheet_range_getColors: function(sheetId, row, col, endRow, endCol, bBackground, domain, messageId) {
    	var editor = this.getEditor();
    	var controller = editor.getController();
    	var doc = editor.getDocumentObj();
    	var sheetName = doc.getSheetName(sheetId);
    	var styleMgr = doc._getStyleManager();
    	var attrId = bBackground ? websheet.Constant.Style.BACKGROUND_COLOR : websheet.Constant.Style.COLOR;
    	var defaultColor = styleMgr.getAttr(null, attrId);

		var colors = [];
		var rangeInfo = {sheetName: sheetName, startRow: row, startCol: col, endRow: endRow, endCol: endCol};
		var colModelArray = websheet.model.ModelHelper.getCols(rangeInfo, true, true).data;
		var iter = new websheet.model.RangeIterator(rangeInfo, websheet.Constant.RangeIterType.NORMAL);
    
    	var count = 0;
    	var MaxCount = 50000; // FIXME the hardcoded 50,000 cells
    	
    	if (controller.getPartial(sheetName)) {
    		var self = this;
    		var method = function() {
    			var colors;
    			iter.iterate(dojo.hitch(self, function(obj, rowIndex, colIndex) {
    				if (count > MaxCount) return false;
    				
    				var color = defaultColor;
    				var list = colors[rowIndex - row];
    				if (!list)
    					list = colors[rowIndex - row] = [];

    				var isCovered = obj && obj.isCovered;
    				var styleCell = obj && obj.styleCell;
    				if (isCovered) {
    					list.push(color);
    					++count;
    					return true;
    				}
    				
    				var colModel = colModelArray[colIndex-col];
    				var colStyleId = colModel ? colModel._styleId : null;
    				var styleId = styleCell ? styleCell._styleId : colStyleId;
    				if (styleId) {
    					var styleCode = styleMgr.getStyleById(styleId);
    					var attr = styleCode.getAttr(attrId);
    					if (attr) color = attr;
    				}
    				
    	    		list.push(color);
    	    		++count;
    			    return true;
    			}));

				var result;
				if (count > MaxCount)
					result = self._genError("Too many cells, can not get their colors");
				else
    	    		result = self._genResult(colors);
    	    	self.responseApiCall(domain, messageId, result.status, result.detail);
    		};
    		
    		editor.getPartialManager().addNotify(method);
    		
    		return null; //not ready to response yet
    	}

		iter.iterate(dojo.hitch(this, function(obj, rowIndex, colIndex) {
			if (count > MaxCount) return false;
			
			var color = defaultColor;
			var list = colors[rowIndex - row];
			if (!list)
				list = colors[rowIndex - row] = [];

			var isCovered = obj && obj.isCovered;
			var styleCell = obj && obj.styleCell;
			if (isCovered) {
				list.push(color);
				++count;
				return true;
			}
			
			var colModel = colModelArray[colIndex-col];
			var colStyleId = colModel ? colModel._styleId : null;
			var styleId = styleCell ? styleCell._styleId : colStyleId;
			if (styleId) {
				var styleCode = styleMgr.getStyleById(styleId);
				var attr = styleCode.getAttr(attrId);
				if (attr) color = attr;
			}
			
    		list.push(color);
    		++count;
		    return true;
		}));

		if (count > MaxCount)
			return this._genError("Too many cells, can not get their colors");
		
    	return this._genResult(colors);
    },

    _sheet_range_setColor: function(sheetId, row, col, endRow, endCol, color, bBackground, domain, messageId) {
    	var editor = this.getEditor();
    	var doc = editor.getDocumentObj();
    	var sheetName = doc.getSheetName(sheetId);
    	var controller = editor.getController();
    	if (!this._checkEditAble(sheetName, row, col, endRow, endCol))
    		return this._genError("no permission to change cell style");

		var bSetColors = false;
		if (Array.isArray(color)) bSetColors = true;
		if (bSetColors) {
			 // TODO need to implement set colors
			return this._genError("set colors isn't implemented yet");
		}
		
    	var type = websheet.Constant.Range;
    	if (row == endRow && col == endCol)
    		type = websheet.Constant.Cell;
    	else if (col == 1 && endCol == 1024)
    		type = websheet.Constant.Row;
    	else if (row == 1 && endRow >= doc.maxSheetRows)
    		type = websheet.Constant.Column;
    	
		var style = {};
		if (bBackground)
			style[websheet.Constant.Style.BACKGROUND_COLOR] = color;
		else {
			var fontColor = {};
			fontColor[websheet.Constant.Style.COLOR] = color;
			style[websheet.Constant.Style.FONT] = fontColor;
		}
		var styleInfo = {sheetName: sheetName, startRow: row, startCol: col, endRow: endRow, endCol: endCol};
		styleInfo.rowIndex = row;
		styleInfo.colIndex = col;
		styleInfo.style = style;
		styleInfo.selectType = type; 
		
    	if (controller.getPartial(sheetName)) {
    		var self = this;
    		var method = function() {
    			editor.SetStyle(styleInfo);
   	    		
    	    	var result = self._genResult();
    	    	self.responseApiCall(domain, messageId, result.status, result.detail);
    		};
    		
    		editor.getPartialManager().addNotify(method);
    		
    		return null; //not ready to response yet
    	}

		editor.SetStyle(styleInfo);

    	return this._genResult();
    },

    _checkEditAble: function(sheetName, rowIdx, colIdx, endRowIdx, endColIdx) {
    	//sheet protection
    	if(websheet.model.ModelHelper.isRangeProtected(sheetName, rowIdx, colIdx, endRowIdx, endColIdx))
    		return false;
    	
    	//ACL
    	var editor = this.getEditor();
    	if(editor.hasACLHandler())
		{
			var bhChecker = editor.getACLHandler()._behaviorCheckHandler;
			var addr = websheet.Helper.getAddressByIndex(sheetName, rowIdx, colIdx, sheetName, endRowIdx, endColIdx);
			if(!bhChecker.canCurUserEditRange(addr))
				return false;
		}
    	
    	return true;
    }
};

dojo.mixin(websheet.api, concord.util.ApiEngine.prototype);
websheet.api.configure();
websheet.api.startListener();