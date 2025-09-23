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

dojo.provide("websheet.widget.FormulaBar");
dojo.require("dijit.form.TextBox");
dojo.require("dijit.layout.ContentPane");
dojo.require("dojo.i18n");
dojo.require("dijit.form.TextBox");
dojo.require("websheet.model.ModelHelper");
dojo.require("concord.util.BidiUtils");
dojo.require("websheet.widget.AutoCompleteMixin");
dojo.require("websheet.widget.AutoCompleteProvider");
dojo.requireLocalization("websheet.widget","FormulaBar");
dojo.requireLocalization("websheet","base");

dojo.declare("websheet.widget.FormularBarInput", [dijit.form.TextBox, websheet.widget.AutoCompleteMixin],{
	templateString: "input",
	postCreate: function()
	{
		this.inherited(arguments);
		this.connect(this.focusNode, "onkeypress", "_onKey");
	},
	
    _autoCompleteText: function()
    {
    	this.inherited(arguments);
    	this.editor.getFormulaBar().syncFormulaBar2Cell();
    }
});


dojo.declare("websheet.widget.FormulaBar", [dijit._Widget, dijit._Templated], {
	
	BUTTON_WIDTH				: 	330,//254, width for both namebox and 'all formulas' button
	
	editor						: 	null,
	nameBoxNode					: 	null,
	formulaInputLineNode		: 	null,
	isShow						: true,
	// indicates if the formula input node is focused;
	isFormulaInputLineFocus		: false,
	// indicates if it's currently type in contents in the formula input node;
	isFormulaInputLineKeyDown	: false,
		
	_backupedSelection:null,	//record the selection when keyup,mouseup, doFocus
	
	widgetsInTemplate: true,
	
	templateString: "<div><input type='text' class='namebox' dojoAttachPoint='nameBoxNode'></input><div dojoType='dijit.form.Button' id='formulaInputLind' dojoAttachPoint='allFormulaButton'></div><div dojoType='websheet.widget.FormularBarInput'  id='formulaInputLine', dojoAttachPoint='formulaInputLine'></div></div>",
	
	constructor: function(args) {
		dojo.mixin(this, args);
	},
	
	postCreate: function()
	{
		this.inherited(arguments);
		var bnls = dojo.i18n.getLocalization("websheet","base");
		dijit.setWaiState(this.nameBoxNode, "label", bnls.acc_formulaNameBox);
		dijit.setWaiState(this.nameBoxNode, "required", true);
		
		this.allFormulaButton.attr("label", dojo.i18n.getLocalization("websheet.widget","FormulaBar").allFormula);
		this.connect(this.allFormulaButton, "onClick", this.showAllFormulaDialog);
		dojo.style(this.allFormulaButton.focusNode, {
			"width": "150px",
			"height": "15px",
			"vertical-align": "top"
		});
		
		this.formulaInputLineNode = this.formulaInputLine.focusNode;
		var formulaInputLindWidth = concord.util.browser.getBrowserWidth() - this.BUTTON_WIDTH + "px";
		dijit.setWaiState(this.formulaInputLineNode, "label", bnls.acc_formulaInputLine);
		dijit.removeWaiState(this.formulaInputLineNode, "autocomplete");
		this.formulaInputLineNode.style.width = formulaInputLindWidth;
		dojo.addClass(this.formulaInputLineNode, "inputline");
		this.customizeWithMode();
		// this happens prior to setBase, have to access with global variables here
		var scene = window["pe"].scene;
		var settings = window["pe"].settings;
		if(scene.isHTMLViewMode() || (settings && !settings.getFormula()))
		{
			// hide formula
			this.toggle(true);
		}
	},
	
	exitEditing: function()
	{
		this.isFormulaInputLineFocus = this.isFormulaInputLineKeyDown = false;
	},
	
	editingSheetName: function()
	{
        return this.editor.getController().getInlineEditor().getEditSheet();			     
	},

	syncFormulaBar2Cell: function(){
		var inlineEditor = this.editor.getController().getInlineEditor();
		//change the value of inlineEditor
		if (inlineEditor.isEditing()) {
			inlineEditor.setValue(this.getFormulaInputLineValue(), true);
		}
	},
			
	setBase: function (editor) {
		this.editor = editor;
	},
	
	isEditing: function() {
		// summary:
		//		If it's editing (actually) in the formula input line node;
		return this.isFormulaInputLineFocus || this.isFormulaInputLineKeyDown;
	},
	
	setEditing: function (isEditing) {
		this.isFormulaInputLineFocus = isEditing;			
		var sheetName = this.editor.getCurrentGrid().getSheetName();
		var grid = this.editor.getController().getGrid(sheetName);
		var inlineEditor = grid.getInlineEditor();
		
		if (true == isEditing) {
			// unselect image when set Editing
			if (inlineEditor.isEditCellRemoved()) {
				this.formulaInputLineNode.blur();
				return;
			}
			this.editor.getDrawFrameHdl().unSelectDrawFrames(sheetName);
			
			var selection = this.getInputTextSelectionPositon(this.formulaInputLineNode);
			if (selection.start || selection.end) {
				this._backupedSelection = selection;
			}
			if (inlineEditor.isEditingFormula()) return;  //in formula mode
			
			if (!inlineEditor.isEditing()) {
				inlineEditor.editingStart();
			}
			if (!inlineEditor.isEditing()) // for protect cell, it will not enable editing when call inlineEditor.editingStart()
				return;
			inlineEditor.setValue(this.getFormulaInputLineValue(), true);
			if (!this.isFormulaInputLineFocus) {
				var self = this;
				setTimeout(function () {
					self.formulaInputLineNode.focus();
				}, 100);	
			}
		}
	},
	
	onMouseUp: function (e) {
		this._backupedSelection = this.getInputTextSelectionPositon(this.formulaInputLineNode);
		var inlineEditor = this.editor.getController().getInlineEditor();
		if (inlineEditor.isEditing()) {
			var editValue = this.formulaInputLineNode.value;
			if (editValue.indexOf("=") == 0) {
				inlineEditor.shouldMoveRangePicker(false);
				inlineEditor.formulaAssist.dropHelpInfo(editValue, this._backupedSelection.end, null, this.formulaInputLineNode);
			}
		}
	},
	
	
	customizeWithMode: function() {			
		this.connectEvent();
		// this happens prior to setBase, have to access with global variable here
		if (window["pe"].scene.isViewMode()) {			
			this._connectors.push(dojo.connect(this.nameBoxNode, "onkeydown", this, dojo.hitch(this, function(e){
				var keyCode = e.keyCode;					
				if(keyCode== dojo.keys.TAB && !e.shiftKey){							
					var grid = this.editor.focus2Grid();
					dojo.stopEvent(e);
				}
	        })));				
			this.allFormulaButton.set('disabled',true);			
			this.formulaInputLineNode.disabled = true;		
			dojo.addClass(this.allFormulaButton,"websheet_toolbar_grayout");
			dojo.addClass(this.formulaInputLineNode,"websheet_toolbar_grayout");				
		} else {
			this.allFormulaButton.set('disabled',false);
			this.formulaInputLineNode.disabled = false;		
			dojo.removeClass(this.allFormulaButton,"websheet_toolbar_grayout");
			dojo.removeClass(this.formulaInputLineNode,"websheet_toolbar_grayout");
		}			
	},		
	
	disable: function(disabled) {
		this.nameBoxNode.disabled = disabled;
		this.allFormulaButton.disabled  = disabled;
		this.formulaInputLineNode.disabled  = disabled;	
		if (disabled) {
			dojo.addClass(this.editor.formulaBar.nameBoxNode,"websheet_toolbar_grayout");
			dojo.addClass(this.editor.formulaBar.allFormulaButton,"websheet_toolbar_grayout");
			dojo.addClass(this.editor.formulaBar.formulaInputLineNode,"websheet_toolbar_grayout");
		} else {
			dojo.removeClass(this.editor.formulaBar.nameBoxNode,"websheet_toolbar_grayout");
			dojo.removeClass(this.editor.formulaBar.allFormulaButton,"websheet_toolbar_grayout");
			dojo.removeClass(this.editor.formulaBar.formulaInputLineNode,"websheet_toolbar_grayout");
		}
			
	},
	
	toggle: function (preventStatus) {
		var formulaBarDiv = document.getElementById('formulaBar_node');
		this.isShow = !this.isShow;
		
		// it would occur prior to setBase, have to access with global variables here
		var settings = window["pe"].settings;
		var scene = window["pe"].scene;
		
		if (this.isShow) {
			formulaBarDiv.style.display = "";
			var fh = dojo.marginBox(formulaBarDiv).h;
			scene.setHeightDelta(-fh);
			var sheetName = this.editingSheetName();
			var grid = this.editor && this.editor.getController().getGrid(sheetName);
			if (!grid) {
				return;
			}
			var inlineEditor = grid.getInlineEditor();
			if (inlineEditor.isEditing()) {
				inlineEditor.focus();
			}	
		} else {
			var h = dojo.marginBox(formulaBarDiv).h;
			formulaBarDiv.style.display = "none";
			scene.setHeightDelta(h);
		}
		
		if (settings && !preventStatus) {
			settings.setFormula(this.isShow);
		}
		var item = window["pe"].FormulaBarMenuItem;
		item && item.attr("checked", this.isShow);
	},
	
	setNameBoxValue: function(newValue)
	{
		this.nameBoxNode.value = newValue;
	},
	
	getNameBoxValue: function()
	{
		return this.nameBoxNode.value;
	},
	
	setFormulaInputLineValue: function( newValue)
	{
		if(newValue == null) newValue = "";
		var nodeValue = newValue, bString = (typeof(nodeValue) == "string");
		if(bString && dojo.isIE)
		{
			//refer to defect 37032, defect 7878
			newValue = newValue.replace(/\u00a0/gm, "\u0020");
		}
		if(bString){					
			nodeValue = nodeValue.replace(/\n/gm, "\u00a0");
		}			
		this.formulaInputLineNode.value = nodeValue;
	},
	
	getFormulaInputLineValue: function()
	{
		var value = this.formulaInputLineNode.value;
		return value.replace(/\u00a0/gm, "\n");
	},
	
	setInputLineWidth: function()
	{
		var formulaInputLindWidth = concord.util.browser.getBrowserWidth() - this.BUTTON_WIDTH + "px";
		this.formulaInputLineNode.style.width = formulaInputLindWidth;
	},
	
	/*
	 * how to connect evnts:
	 * 1, if the widegt is dijit,  can use dojo.connect(dijit,"onKeyPress",...) or dojo.connect(dijit.domNode,"onkeypress");
	 * 2 if the widegt is html element, use dojo.connect(element,"onkeypress") or elemnt.onkeypress = dojo.hitch(...)
	 */
	connectEvent: function()
	{
		this._disconnectEvent();
		this._connectors.push(dojo.connect(this.nameBoxNode,"onkeypress", this, this.onNameBoxEnter));
		// this happens prior to setBase, have to access with global variable here
		if(!window["pe"].scene.isViewMode()){
			if(dojo.isFF && dojo.isMac)
				//TODO, CC, Should re-test and remove this when independent inline-editor enabled.
				this._connectors.push(dojo.connect(this.formulaInputLineNode,"onkeydown", this, function(e){
					if(e.keyCode == dojo.keys.ESCAPE)
					{
						var grid = this.editor.getController().getGrid(this.editingSheetName());
						grid.cancel();
						this.onEscape(e);
						this.editor.focus2Grid();
					}
				}));
			this._connectors.push(dojo.connect(this.formulaInputLineNode,"onkeypress", this, this.onInputLineKeyDown));
			this._connectors.push(dojo.connect(this.formulaInputLineNode,"onkeyup", this, this.onInputLineKeyUp));
			this._connectors.push(dojo.connect(this.formulaInputLineNode, "oncompositionstart", this, this.onInputLineCompositionStart));
			this._connectors.push(dojo.connect(this.formulaInputLineNode,"oncompositionend", this, this.onInputLineCompositonEnd));
			this._connectors.push(dojo.connect(this.formulaInputLineNode,"onfocus", this, dojo.hitch(this, "setEditing", true)));
			this._connectors.push(dojo.connect(this.formulaInputLineNode,"onblur", this, dojo.hitch(this, "setEditing", false)));
			this._connectors.push(dojo.connect(this.formulaInputLineNode,"onmouseup", this, "onMouseUp"));
		}
	},
			
	_disconnectEvent:function(){
		if(this._connectors)
			dojo.forEach(this._connectors, dojo.disconnect);
		this._connectors = [];
	},
	
	showAllFormulaDialog: function()
	{
		this.editor.allFormulas();
	},
	
	setFormulaBarDefault: function()
	{
		this.setFormulaInputLineValue("");
		this.setNameBoxValue("");
	},
	
	updateFormulaInputValue: function ()
	{
		var sheetName = this.editingSheetName();//this.editor.getCurrentGrid().getSheetName();
		var grid = this.editor.getController().getGrid(sheetName);
		if(!grid.isEditing())
		{
			this._updateValueAndDirection(sheetName);
		}
	},
	
	/* summary: synch FormulaBar when CellMouseDown event fired
	 * para ref: cell/row/column address
	 */
	syncOnCellMouseDown: function(ref, type)
	{
		if(undefined == ref || null == ref || undefined == type || null == type)
			return;
	
		var focusCellRef = null;
		if (type == "cell") {
			focusCellRef = ref;
		}
		var sheetName = this.editingSheetName();//this.editor.getCurrentGrid().getSheetName();
		var grid = this.editor.getController().getGrid(sheetName);
		if (null == focusCellRef) {
			var selectionManager = grid.selection;
			focusCellRef = websheet.Helper.getCellAddr(sheetName, selectionManager.getFocusedRow() + 1, selectionManager.getFocusedCol());
		}
		if (null != focusCellRef) {
			if (grid.isEditing()) {
				this._updateValueAndDirection(sheetName);
			} else {
				var parsedRef = websheet.Helper.parseRef(focusCellRef); 
				if(!parsedRef)
				{
					var newRef = websheet.Helper.replaceSheetName("sh", ref);
					parsedRef = websheet.Helper.parseRef(newRef);
				}
				this._updateValueAndDirection(sheetName, parsedRef.startRow, parsedRef.startCol);
  				if (grid.a11yEnabled()) {
  					grid.readCellInformation();
  				}
			}
		}
	},
	
	normalizeRangeAddress: function(rowIndex1, colIndex1, rowIndex2, colIndex2 /*|| ==============rangeInfo===========*/)
	{
		// summary:
		//		Return the 'range address' of the given range
		// arguments:
		//		Can be a  'rangeInfo' object gotten SelectRect
		//		Or four indexes in order: startRow, startCol, endRow, endCol, they are 1-based.
		//
		//		Suppose the indexes in 'rangeInfo' object have been normalized, that's start index no bigger than end index.
		//		If you're getting rangeInfo from SelectRect's getRangeInfo, it must have been normalized.
		//		And for the directly given indexes, we normalize them here.
		// returns;
		//		String, range address.
		
		var sr, er, sc, ec;
		//startRow, endRow, startCol, endCol
		if(arguments.length == 1)
		{
			var range = arguments[0];
			sr = range.startRow;
			er = range.endRow;
			sc = range.startCol;
			ec = range.endCol;
		}
		else if(arguments.length >= 2)
		{
			sr = rowIndex1;
			sc = colIndex1;
			er = rowIndex2 || sr;
			ec = colIndex2 || sc;
			//should be integer bigger then 0,
			if(sr > er){sr ^= er;er ^= sr;sr ^= er;}
			if(sc > ec){sc ^= ec;ec ^= sc;sc ^= ec;}
		}
		var minColIndexStr = websheet.Helper.getColChar(sc);
		var maxColIndexStr = websheet.Helper.getColChar(ec);
		var value = "";
		if(sr == er && sc == ec)
		{
			value = minColIndexStr + "" + sr;
		}
		else
		{
			value = minColIndexStr + "" + sr + ":" + maxColIndexStr + er;
		}
		return value;
	},
	
	_setFomulaBarDirection: function(direction, value)
	{
		/* use 'dir' attribute when direction style is set explicitly (present in model) */
		/* and 'direction' style otherwise (default contectual behaviour) to tell between these 2 cases */
		if(direction){
			this.formulaInputLineNode.setAttribute("dir", direction);
			this.formulaInputLineNode.style.direction = "";
		}else{
			this.formulaInputLineNode.removeAttribute("dir");
			this.formulaInputLineNode.style.direction = BidiUtils.isTextRtl(value) ? "rtl" : "ltr";
		}
	},
	
	syncFormulaBarOnKeyUp: function (newValue)
	{
		var sheetName = this.editingSheetName();
		var mHelper = websheet.model.ModelHelper;
		if (mHelper.isSheetProtected(sheetName))
		{
			var grid = this.editor.getController().getGrid(sheetName);
			var colIndex = grid.selection.getFocusedCol();
			var rowIndex = grid.selection.getFocusedRow() + 1; 
			if (mHelper.isCellProtected(sheetName, rowIndex, colIndex)) {
				return;
			}
		}
		if (BidiUtils.isBidiOn() && !this.formulaInputLineNode.dir) {
			this.formulaInputLineNode.style.direction = BidiUtils.isTextRtl(newValue) ? "rtl" : "ltr";
		}			
		this.setFormulaInputLineValue(newValue);
	},
	/*
	 * for parese ref reason, add the sheet name to the ref
	 */
	addSheetNameToRef: function (ref)
	{
		var index = ref.indexOf("!");
		var newRef = ref;
		if(-1 == index)
		{
			var sheetName = this.editor.getCurrentGrid().getSheetName();
			if(websheet.Helper.needSingleQuotePattern.test(sheetName)){
				sheetName = sheetName.replace(/\'/g,"''");	// change '' if the sheet name has '
				sheetName = "'" + sheetName + "'";
			}
			newRef = sheetName + "!" + ref;
		}
		return newRef;
	},
	
	/*
	 * if the parsedRef.sheet is the correct sheet name return true;
	 * else return false;
	 */
	isSheetExist: function (parsedRef)
	{
		if(undefined == parsedRef.sheetName || null == parsedRef.sheetName)
		{
			return false;
		}
		var sheet = this.editor.getDocumentObj().getSheet(parsedRef.sheetName);
		if(undefined == sheet || null == sheet)
		{
			return false;
		}
		return true;
	},
	
	onNameBoxEnter: function (e)
	{
		if (e.keyCode != dojo.keys.ENTER) {
			// we only cares about "ENTER key" here!
			return;
		}
		try{
			//step 1: if there are some input in the input line, apply it
			var sheetName = this.editor.getCurrentGrid().getSheetName();
			var grid = this.editor.getController().getGrid(sheetName);	
			if(grid.isEditing())
			{
				this.applyEdittingCellWithInputLine();
				this.exitEditing();
			}
			//step 2: sync the name box with the grid
			var value = this.getNameBoxValue();
			if(null == value || undefined == value)
			{
				return;
			}
			value = this.addSheetNameToRef(value);
			var parsedRef = websheet.Helper.parseRef(value);
			
			if(parsedRef && parsedRef.isValid() && this.isSheetExist(parsedRef))
			{
				var cellRef = value;
				var showValue = value;
				var refMaxRow = 0;
				var refMaxCol = 0;
				var MAXROW = this.editor.getMaxRow();
				var normalizedRef = "";
				var newParsedRef = null;
				var bMergeOrSplit = false;
				var isCellRef=false;
				var focusCellInfo;
				if(websheet.Helper.isCellRef(parsedRef))
				{
					isCellRef=true;
					focusCellInfo = websheet.Utils.getCoverCellInfo(parsedRef.sheetName, parsedRef.startCol, parsedRef.startRow);
					var cellRef = value;
					if(focusCellInfo)
					{
						if(!focusCellInfo.cell){
							focusCellInfo = websheet.Utils.getCoverCellInfo(parsedRef.sheetName, parsedRef.startCol, parsedRef.startRow, true);
						}
						if(focusCellInfo){
							parsedRef.startCol = focusCellInfo.col;
							cellRef = parsedRef.toString();
							showValue = websheet.Helper.getColChar(parsedRef.startCol) + parsedRef.startRow;
						}
					}
					refMaxRow = parsedRef.startRow;
					refMaxCol = parsedRef.startCol;
					this.isRangeRenderComplete = true;
					newParsedRef = parsedRef;
					var info = {sheetName:parsedRef.sheetName, startRow: refMaxRow, endRow: refMaxRow, startCol: refMaxCol, endCol:refMaxCol};
					var expandInfo = websheet.Utils.getExpandRangeInfo(info);
					bMergeOrSplit = (expandInfo.startCol == expandInfo.endCol);
				}
				else
				{
					var rowIndex = parsedRef.startRow;
					var endRowIndex = parsedRef.endRow;
					var colIndex = parsedRef.startCol;
					var endColIndex = parsedRef.endCol;
					
					var type = parsedRef.getType();
					if(type == websheet.Constant.RangeType.ROW){
						colIndex = 1;
						endColIndex = websheet.Constant.MaxColumnIndex;
					} else if(type == websheet.Constant.RangeType.COLUMN){
						rowIndex = 1;
						endRowIndex = MAXROW;
					}
					
					var info = {sheetName:parsedRef.sheetName, startRow: rowIndex, endRow: endRowIndex, startCol: colIndex, endCol:endColIndex};
					if(colIndex != endColIndex)
						bMergeOrSplit = false;
					else{
						expandInfo = websheet.Utils.getExpandRangeInfo(info);
						bMergeOrSplit = (expandInfo.startCol == expandInfo.endCol);
					}
					normalizedRef = this.normalizeRangeAddress(rowIndex ,colIndex,endRowIndex,endColIndex);
					showValue = normalizedRef;
					normalizedRef = this.addSheetNameToRef(normalizedRef);
					newParsedRef = websheet.Helper.parseRef(normalizedRef);
					cellRef = websheet.Helper.getCellAddr(newParsedRef.sheetName, newParsedRef.startRow, newParsedRef.startCol);
					refMaxRow = newParsedRef.endRow;
					refMaxCol = newParsedRef.endCol;
				}
				
				if(refMaxCol > websheet.Constant.MaxColumnIndex || refMaxRow > MAXROW)
				{
					var nls = dojo.i18n.getLocalization("websheet.widget","FormulaBar");
					var dlg = new concord.widgets.MessageBox(null, null, null, false, {message: nls.largeRowColPmpt});
					dlg.show();
					if(dojo.isIE)//For IE9, there will be twice Enter Key event if dlg shows.
						dojo.stopEvent(e);
					return;
				}
				var parsedCellRef = websheet.Helper.parseRef(cellRef);
				var grid = this.editor.getController().getGrid(parsedCellRef.sheetName);
				var selector = grid.selection.selector();
				if( parsedCellRef.startRow > grid.scroller.lastVisibleRow || parsedCellRef.startRow < grid.scroller.firstVisibleRow+1) {
					var delta = parseInt((grid.scroller.lastVisibleRow - grid.scroller.firstVisibleRow)/2);
					
					if (parsedCellRef.startRow > grid.scroller.lastVisibleRow) {
						grid.scroller.scrollToRow(parsedCellRef.startRow- delta);
					} else {
						if (parsedCellRef.startRow > grid.freezeRow) {
							grid.scroller.scrollToRow((parsedCellRef.startRow- delta < 0)? 0: parsedCellRef.startRow - delta);
						}
					}
				}					
				if(this.isColRef(newParsedRef,MAXROW)){					
					var curRow = grid.scroller.firstVisibleRow;
					var maxRow = grid.scroller.lastVisibleRow;
					var found = false;
					while(curRow <= maxRow){							
						if(grid.isVisibleRow(curRow)){
							found = true;
							break;
						}								
						curRow++;										
					}			
					if(found)
						cellRef = websheet.Helper.getCellAddr(newParsedRef.sheetName, (curRow + 1),newParsedRef.startCol);
				}					
				this.editor.setFocus(cellRef, true);
				//clear cahced indexes
				var newShowValue = showValue.toUpperCase();
				// it had a timeout there before
				// tested Tab in range, "select row/column", "page down/page up", #22922, #20038
				// seems no need anymore, deleted the setTimeout function.
				this.setNameBoxValue(newShowValue);
				
				var docObj = this.editor.getDocumentObj();
				var iColIndex =  parsedCellRef.startCol;
				var currentCell = docObj.getCell(parsedCellRef.sheetName, parsedCellRef.startRow, iColIndex, websheet.Constant.CellType.MIXED);
				var cellValue = "";
				//get the value from the cellModel
				if(undefined!=currentCell)
				{
					cellValue = currentCell.getEditValue();
				}
				this.setFormulaInputLineValue(cellValue);
				
				var selector = grid.selection.selector();
				//if its a range , draw the multi-select range
				if(-1 != value.indexOf(":"))
				{
					var toolbar = this.editor.getToolbar();
					var rowIndex = newParsedRef.startRow;
					var colIndex = newParsedRef.startCol;
					var endRowIndex = newParsedRef.endRow;
					var endColIndex = newParsedRef.endCol;
					if(!grid.accnls) grid.accnls = dojo.i18n.getLocalization("websheet","base");
					//currently, had not render the end row
					
					if(selector)
					{
						if(this.isRowRangeRef(newParsedRef))
						{
							selector.selectRow(newParsedRef.startRow - 1, newParsedRef.endRow - 1);
							if(newParsedRef.startRow == newParsedRef.endRow){
								grid.announce(dojo.string.substitute(grid.accnls.ACC_ROW_SEL, [(newParsedRef.startRow)]));
							}else{
								grid.announce(dojo.string.substitute(grid.accnls.ACC_ROWS_SEL, [(newParsedRef.startRow), (newParsedRef.endRow)]));
							}
						}
						else if(this.isColRef(newParsedRef,MAXROW))
						{
							selector.selectColumn(colIndex, endColIndex);
							if (toolbar) toolbar.disableTaskToolBar();
							if(colIndex == endColIndex){
								grid.announce(dojo.string.substitute(grid.accnls.ACC_COL_SEL, 
										[websheet.Helper.getColChar(endColIndex)]));
							}else{
								grid.announce(dojo.string.substitute(grid.accnls.ACC_COLS_SEL, 
										[websheet.Helper.getColChar(colIndex),
										 websheet.Helper.getColChar(endColIndex)]));
							}
						}
						else
						{
							selector.selectRange(newParsedRef.startRow - 1, colIndex, newParsedRef.endRow - 1, endColIndex);
							var extRange = websheet.Utils.getExpandRangeInfo(selector.getRangeInfo());
							selector.selectRange(extRange.startRow-1, extRange.startCol, extRange.endRow-1, extRange.endCol, true);
							
							showValue = this.normalizeRangeAddress(extRange);
							this.setNameBoxValue(showValue.toUpperCase());
							if (toolbar) toolbar.disableMultiSelCell();
							//announce the selection. ACC_RANGE_SEL
							grid.announce(dojo.string.substitute(grid.accnls.ACC_RANGE_SEL, 
									[websheet.Helper.getColChar(extRange.startCol) + extRange.startRow,
									 websheet.Helper.getColChar(extRange.endCol) + extRange.endRow]));
						}
					}
				}
				
				dojo.publish("UserSelection",[{selector: selector}]);
				// unselect image when input addr in name box, and press enter
				this.editor.getDrawFrameHdl().unSelectDrawFrames(this.editingSheetName());
			}
			else
			{
				var nls = dojo.i18n.getLocalization("websheet.widget","FormulaBar");
				if(!this.invalidReferenceBoxOpen){
					this.invalidReferenceBoxOpen = true;
					var dlg = new concord.widgets.MessageBox(this, null, null, false, 
							{message: nls.validReferencePmpt, callback:this.invalidReferenceBoxClosed});
					dlg.onCancel= (function() {							
						this.inlineEditor.invalidReferenceBoxClosed(this.inlineEditor);
					});
					dlg.show();
				}
				if(dojo.isIE)//For IE9, there will be twice Enter Key event if dlg shows.
					dojo.stopEvent(e);					
			}
		}catch(e)
		{
		}
	},
	
	/*
	 * summary: when switch to another sheet, sync namebox and input line with the sheet's select rectangle
	 */
	onSwitchSheet: function (sheetName)
	{
		//step 1: if there are some input in the input line, apply it
		//notice: we no longer apply the value any more, when switch sheet, new design new behavior;
		//step 2: synchronize the formula bar with the target sheet
		if (!sheetName) {
			return;
		}
		this._updateValueAndDirection(sheetName);
	},
	
	/*
	 * this function is used for input use input method (FF)
	 */
	onInputLineCompositionStart: function(evt)
	{
		var node = this.formulaInputLineNode, value = node.value;
		if(value.indexOf('=') == 0)
		{
			var sel = this.getInputTextSelectionPositon();
			if (sel.start != sel.end) {
				this.setCurserPos(node, sel.end);
			}
		}
	},
	
	/*
	 * this function is used for input use input method (IE )
	 */
	onInputLineKeyUp: function(e)
	{
		// summary, update value to inline-editor;
		this._backupedSelection = this.getInputTextSelectionPositon(this.formulaInputLineNode);
		if ((e.keyCode != dojo.keys.ENTER && e.keyCode != dojo.keys.ESCAPE) || ( this._pressingKeyCode == 229)) {
			var value = this.getFormulaInputLineValue();
			//change the value of inlineEditor
			var inlineEditor = this.editor.getController().getInlineEditor();
			if (inlineEditor.isEditing()) {
				inlineEditor.setValue(value);
			}
		}
		if(BidiUtils.isBidiOn() && !this.formulaInputLineNode.dir){
			inlineEditor.getNode().style.direction =
				this.formulaInputLineNode.style.direction = 
					BidiUtils.isTextRtl(this.formulaInputLineNode.value) ? "rtl" : "ltr";

			if(inlineEditor.getNode().style.direction == "rtl") 
				inlineEditor.getNode().style.textAlign = "right";
		}
	},
	
	invalidReferenceBoxClosed: function (inlineEditor) {
		inlineEditor.invalidReferenceBoxOpen = false;			
	},
	
	isRowRangeRef: function (parsedRef) {
		if (parsedRef.endRow > 0 && parsedRef.startRow > 0 && parsedRef.startCol == 1 && parsedRef.endCol == websheet.Constant.MaxColumnIndex) {
			return true;
		} else {
			return false;
		}
	},
	
	isRowRef: function (parsedRef) {
		if (parsedRef.endRow > 0 && (parsedRef.startRow == parsedRef.endRow) && parsedRef.startCol == 1 && parsedRef.endCol == websheet.Constant.MaxColumnIndex) {
			return true;
		} else {
			return false;
		}
	},
	
	isColRef: function(pasredRef, MaxRow)
	{
		if (pasredRef.startCol > 0 && pasredRef.endCol > 0 && pasredRef.startRow == 1 && pasredRef.endRow == MaxRow) {
			return true;
		} else {
			return false;
		}
	},
	
	onInputLineCompositonEnd: function(evt)
	{
		var value = this.getFormulaInputLineValue();
		var inlineEditor = this.editor.getController().getInlineEditor();
		if (inlineEditor.isEditing()) {
			inlineEditor.setValue(value);
		}
	},
	
	getBackupedSelection: function()
	{
		if (!this._backupedSelection) {
			this._backupedSelection =  this.getInputTextSelectionPositon(this.formulaInputLineNode);
		}
		return this._backupedSelection;
	},
	
	applyEdittingCellWithInputLine: function()
	{
		var sheetName = this.editingSheetName();//this.editor.getCurrentGrid().getSheetName();
		var grid = this.editor.getController().getGrid(sheetName);
		if (grid.isEditing()) {
			grid.apply();
		}
	},
	
	onEscape: function(e)
	{
		this._updateValueAndDirection(this.editingSheetName());
	},
	
	onInputLineKeyDown: function(e)
	{
		this._pressingKeyCode = e.keyCode;
		var value = this.getFormulaInputLineValue();
		
		var sheetName = this.editingSheetName();
		var grid = this.editor.getController().getGrid(sheetName);
		var rowIndex = grid.selection.getFocusedRow();
		var colIndex = grid.selection.getFocusedCol();
		
		//for task
//		var cellAddress = websheet.Helper.getCellAddr(sheetName, parseInt(rowIndex + 1), websheet.Helper.getColNum(store.inCell.field));
//		var taskHdl = this.editor.getTaskHdl();
//		if (taskHdl) taskHdl.showRangeAreaByCellPos(cellAddress);
		
		//if is first press the key, send lock msg
		if (this.isFormulaInputLineKeyDown == false && this.editor.scene.coedit == true)
		{
			var curCellRef = websheet.Helper.getCellAddr(sheetName, parseInt(rowIndex + 1), colIndex);
			var event = new websheet.event.Lock(curCellRef);
			this.editor.sendMessage(event);
		}
		
		if (this.isFormulaInputLineKeyDown == false)
		{
			var toolbar = this.editor.getToolbar();
			if (toolbar) toolbar.disableUndoRedoIcon();
		}
		this.isFormulaInputLineKeyDown = true;
		//keyChar:'(', keyCode:40, which is the same value of dojo.keys.ARROW_DOWN
		// while formulaAssist only care about some control keyboard
		if (e.keyChar == '' && grid.getInlineEditor().formulaAssist.dispatchEvent(e)) {
    		return dojo.stopEvent(e);
    	}
		if (e.keyCode == dojo.keys.TAB) {
			dojo.stopEvent(e);
			return grid.getInlineEditor().focus();//navigate to in-line editor when tab in formula input line.
		}
		
		if (e.ctrlKey && e.keyChar == 'z') {
			if(dojo.isIE) {
				this.formulaInputLineNode.focus();
				this.formulaInputLineNode.document.execCommand('undo');
			}
		}
		
		var key = e.charOrCode;
		
		var _sheetName = this.editor.getCurrentGrid().getSheetName();;
		var _grid = (_sheetName == sheetName) ? grid : this.editor.getController().getGrid(_sheetName);
		var eventStopped = false;
		if (_grid.getInlineEditor().shouldMoveRangePicker() && grid.isEditing()) {
			if (value.indexOf("=") == 0){
				//because for IE, the e.keyCode for input char "(" is the same with down arrow key code, 40
				//for IE, Chrome, e.keyCode for input char '"', is the same with page down key code, 34. '!' is the same with page up, 33.
				//for Chrome, & is the same with arrow up key '38'.
				if("(" != e.keyChar && '"' != e.keyChar && '!' != e.keyChar && '&' !=e.keyChar)
				{
					var isMoved = _grid.selection.moveRangePicker(e);
					if(isMoved)
					{
						dojo.stopEvent(e);
						eventStopped = true;
					}
				}
			}
		}
		// not handling copy/cutting/pasting case - ctrl + x/v/c
		if(e.altKey || ((e.ctrlKey || e.metaKey)) || key == dojo.keys.SHIFT || (e.shiftKey && key == " "))
		{
//			console.info("Throw out weird key combiniations and spurious events");
			return; // throw out weird key combinations and spurious events
		}
		
		if (e.keyChar!="" || e.keyCode == dojo.keys.BACKSPACE || e.keyCode == dojo.keys.DELETE) {
        	var selection = this.getInputTextSelectionPositon(this.formulaInputLineNode);	        	
        	var latterStr = "";
        	var preStr = "";		        	
    		var length = value.length;
    		latterStr = value.slice(selection.end,length);
    		var start = selection.start;
    		var end = selection.end;
    		var bFillRigthP = false;
    		if (value.indexOf("=") == 0) {
    			if ("(" == e.keyChar) {
    				latterStr = ")" + latterStr;
    				bFillRigthP = true;
    			}
    		}
    		if ((e.keyCode == dojo.keys.BACKSPACE) && (start>0) && (start == end)) {
    			preStr = value.slice(0, start - 1);
    		} else {
    			preStr = value.slice(0, start);
    		}
    		
    		if ((e.keyCode == dojo.keys.DELETE) && (start == end)) {
    			latterStr = value.slice(end+1,length);
    		}
    		value = preStr + (e.keyChar || "") + latterStr;
			if (bFillRigthP || eventStopped) {
				this.setFormulaInputLineValue(value);
				this.setCurserPos(this.formulaInputLineNode, start + 1);
				e.preventDefault();
			}
        }
        if (e.keyCode == dojo.keys.ENTER || e.keyCode == dojo.keys.ESCAPE) {
			try {
				this.isFormulaInputLineKeyDown = false;
				if (grid.isEditing()) {
					if (e.keyCode == dojo.keys.ENTER) {
						e.preventDefault && dojo.stopEvent(e);
						grid.apply().then(function (result) {
							if (result.success) {
								var direction = e.shiftKey ? websheet.Constant.DIRECTION.UP : websheet.Constant.DIRECTION.DOWN;
								grid.selection.navigate(direction, false);
							}
						});
						//if the apply does not success, do not move focus
						var colIndex = grid.selection.getFocusedCol();
						var rowIndex = grid.selection.getFocusedRow() + 1;
						if (websheet.model.ModelHelper.isCellProtected(grid.sheetName, rowIndex, colIndex)) {
							this.formulaInputLineNode.blur();
						}
					} else {
						// ESCAPE
						grid.cancel();
					}
				}
			} catch(err) {
			}
        }
	},
	
	/*
	 * set the curser postion to the pointed postion
	 * obj: domNode of input
	 * pos: the positon(integer)
	 */
    setCurserPos: function(obj, pos)
    {
    	if (undefined == obj || undefined == pos) {
    		return ;
    	}
    	if (dojo.isIE) {
    		var rng=obj.createTextRange()
			var sel = rng.duplicate();
			sel.moveStart("character", pos);
			var end = pos - obj.value.length;
			sel.moveEnd("character", end);
			sel.select();
    	} else {
    		obj.focus();
	  		obj.setSelectionRange(pos,pos);
    	}
    },
    
	/*
	 * Get input selection position from either formula input-line or inline-editor node.
	 * Depends on which node is active.
	 */
	getInputTextSelectionPositon: function()
	{
		var start = end = 0;
		var inlineEditor = this.editor.getController().getInlineEditor();
		try
		{
			var sel = window.getSelection(), node = document.activeElement;
			// Get range selection from formula input(line).
			if (node == this.formulaInputLineNode)
			{
				start = node.selectionStart;
				end = node.selectionEnd;
			}
			// Get range selection from inline editor.
			else
			{
				return inlineEditor.getInputTextSelection(true);
			}
		}catch(e)
		{
			console.log("formula bar inputline selection err: " + e);
		}
		var pos = {start: start, end: end};
		inlineEditor.backupCursorSelection(pos);
		return pos;
	},
	
	_updateValueAndDirection: function (sheetName, rowIndex, colIndex) {
		// summary:
		//		Sheetname should be given;
		//		rowIndex, colIndex are 1-based;
		//		rowIndex, colIndex can be optional; (We will use the focused row index and the focused column index fetched from selection manager);
		
		// get the focused cell model and set the edit value to the formula input line node;
		var sheetName = sheetName || this.editingSheetName() || this.editor.getCurrentGrid().getSheetName();
		var grid = this.editor.getController().getGrid(sheetName);
		var value = "";
		var focusedRow = rowIndex || grid.selection.getFocusedRow() + 1;
		var focusedCol = colIndex || grid.selection.getFocusedCol();
		var docObj = this.editor.getDocumentObj();
		var currentCell = docObj.getCell(sheetName, focusedRow, focusedCol, websheet.Constant.CellType.MIXED);
		if (currentCell) {
			value = currentCell.getEditValue();
		}
		this.setFormulaInputLineValue(value);

		var col = docObj.getSheet(sheetName).getColumn(focusedCol, true);
		var styleId = (currentCell && currentCell._styleId) ? currentCell._styleId : (col && col.getStyleId());		
		var style = styleId ? docObj._styleManager.getStyleById(styleId) : null;
		var direction = docObj._styleManager.getAttr(style, websheet.Constant.Style.DIRECTION);
		this._setFomulaBarDirection(direction, value);
	}
});
