/* ***************************************************************** */
/*                                                                   */
/* HCL Confidential                                                  */
/*                                                                   */
/* OCO Source Materials                                              */
/*                                                                   */
/* Copyright HCL Technologies Limited 2020                           */
/*                                                                   */
/* The source code for this program is not published or otherwise    */
/* divested of its trade secrets, irrespective of what has been      */
/* deposited with the U.S. Copyright Office.                         */
/*                                                                   */
/* ***************************************************************** */

dojo.provide("websheet.widget.FindReplaceHandler");
dojo.require("dojo.i18n");
dojo.require("dojo.string");
dojo.require("concord.editor.CharEquivalence");
dojo.requireLocalization("websheet.widget","FindReplaceHandler");

dojo.declare("websheet.widget.FindReplaceHandler", websheet.listener.Listener, {

	editor : null,
	dlg : null,

	charEQ: null,
	lang: null,

	_lastSheetName : '',
	_lastRowIndex : 1,
	_lastColIndex : 1,
	_lastRowPos : 0,
	_lastAction : 0,

	_startRowIndex : 1,
	_startColIndex : 1,
	_startSheetName : '',

	CASE_SENSITIVE : 1,
	WRAP_SEARCH : 1 << 1,
	BACKWARD : 1 << 2,
	MATCH_CELL : 1 << 3,
	SEARCH_ALL_SHEETS : 1 << 4,
	SEARCH_FORMULA : 1 << 5,
	SEARCH_VALUES : 1 << 6,

	_FOUND: 0,
	_NOT_FOUND: 1,
	_TO_BE_CONTINUE: 2,
	_OUT_OF_SCOPE:3,

	_matchOption : 0,

	STRING_NOT_FOUND : "String Not Found",
	FIND_AND_REPLACE : "Find and replace",
	LOOKING_AROUND: 'HCL Docs has searched to end of the sheet. You can continue at the beggining',
	LOOKING_AROUND_DOC: '',
	NO_FIND_KEY: '',
	REPLACE_FINISHED: "${0} matched cells have been replaced",

	_searchedText : '',
	_isFound : false,
	_specials : null, //escape wildchar

	CellType: websheet.Constant.CellType,

	// if curreng dialog is for edit mode
	_bViewModeDialog: null,

	constructor: function(parent){
		this.editor = parent;
		this._specials = new RegExp("[.*+?|()\\[\\]\\$\\^{}\\\\]", "g");
		this._matchOption = this.WRAP_SEARCH;

		this.lang = navigator.userLanguage || navigator.language;

        this.charEQ = new concord.editor.CharEquivalence;

        var nls = dojo.i18n.getLocalization("websheet.widget","FindReplaceHandler");
        this.STRING_NOT_FOUND= nls.STRING_NOT_FOUND;
		this.FIND_AND_REPLACE =  this.editor.scene.isViewMode()? nls.FIND_LABEL : nls.FIND_AND_REPLACE;
		this.LOOKING_AROUND = nls.LOOKING_AROUND;
		this.LOOKING_AROUND_DOC = nls.LOOKING_AROUND_DOC;
		this.REPLACE_FINISHED = nls.REPLACE_FINISHED;
		this.NO_FIND_KEY = nls.NO_FIND_KEY;
	},

	setMatchOption : function(option){
		var lastOption = this._matchOption;
		this._matchOption = this.WRAP_SEARCH | this.SEARCH_FORMULA;
		if(option.matchCase)
			this._matchOption |= this.CASE_SENSITIVE;
		if(option.matchCell)
			this._matchOption |= this.MATCH_CELL;
		if(option.searchAllSheet)
			this._matchOption |= this.SEARCH_ALL_SHEETS;
		//if(option.searchFormula)
			//this._matchOption |= this.SEARCH_FORMULA;
		if(lastOption!=this._matchOption)
			this._reset();
	},

	//apply order: spreasheet locale > browser locale
	_normalize: function(stext){
		var pattern = stext;
		var locale = this.editor.scene.getLocale();
		if (!locale ) locale = this.lang;
		if(locale) {
			if(locale.indexOf('ja') != -1)
				pattern = this.charEQ.decompose_ja(stext);
			else
				pattern = this.charEQ.decompose_latin(stext);
		}
		return pattern;
	},

	_popupDlg : function(type){
		if (this.dlg) {
			if (this._bViewModeDialog == this.editor.scene.isViewMode()) {
				// dialog mode matches edit mode, do nothing
				;
			} else {
				this._resetDialog();
			}
		}

		if(!this.dlg) {
			this.dlg = new websheet.dialog.FindAndReplaceDlg(this.editor, this.FIND_AND_REPLACE,null,false);
			this._bViewModeDialog = this.editor.scene.isViewMode();
		}

		this.dlg.show();
	},

	_resetDialog: function() {
		// reset, destroy cached dialog
		if (this.dlg) {
			this.dlg.hide();
			this.dlg._destroy();
			this.dlg = null;
		}
	},

	_reset : function(){
		var grid = this.editor.getCurrentGrid();
		var sheetName = grid.sheetName;
        var doc = this.editor.getDocumentObj();

        //get current focus cell
		var sheet = doc.getSheet(sheetName);
		var selectRect = grid.selection.selector();
		var focusCell = selectRect.getFocusCellAddress();

		//use current focus cell as the start search position
		this._lastRowIndex = focusCell.row;
		this._lastColIndex = focusCell.column;
		this._lastSheetName = sheetName;

		this._lastRowPos = 0;

		this._startRowIndex = this._lastRowIndex;
		this._startColIndex = this._lastColIndex;
		this._startSheetName = sheetName;
		this._isFound = false;
	},

	find: function(){
		this._popupDlg();
	},

	_getCellValue: function(cell){
		var value = '';
		if(this._matchOption & this.SEARCH_FORMULA)
		{
			// TODO why get edit value
			value += cell.getEditValue();
		}
		else
			value += cell.getCalculatedValue();

		//the text to be searched must be normalized
		return this._normalize(value);
	},

	_createRegExp: function(stext){

		if(this._searchedText!=stext){
			this._searchedText=stext;
			this._isFound = false;
			this._reset();
		}

		var normalized = stext.replace(this._specials, "\\$&");
		if(this._matchOption & this.MATCH_CELL)
			normalized = '^' + normalized + '$';
		var condition = (this._matchOption & this.CASE_SENSITIVE) ? 'g' : 'ig';
		var reg = new RegExp(normalized,condition);
		return reg;
	},

	_mixStyleCell: function(cell, rowModel)
	{
		if (cell && !cell._styleId)
		{
			if (rowModel && rowModel._styleCells)
			{
				var sC = rowModel.getCell(cell.getCol(),cell._doc.CellType.STYLE, true);
				if (sC)
				{
					cell.mixin(sC);
				}
			}
		}
	},

	_findNextInRow: function(rowModel, curRowIndex, reg, stext,iswrap, colsMap){
		var ret = {};
		if(iswrap && (curRowIndex>this._startRowIndex))
		{
			if(this._searchedText==stext && !this._isFound)
			{
				if (BidiUtils.isBidiOn())
					stext = BidiUtils.addEmbeddingUCC(stext);

				var msg = dojo.string.substitute(this.STRING_NOT_FOUND,[stext]);
				this.dlg.setWarningMsg(msg);
				ret.code = this._NOT_FOUND;
				return ret;
			}
		}

		if(curRowIndex<this._lastRowIndex){
			ret.code = this._TO_BE_CONTINUE;
			return ret;
		}

		var len = rowModel._valueCells.length;
		for (var i = 0; i < len; ++i) {
			var curColIndex = i + 1;
			var cell = rowModel._valueCells[i];
			if (!cell) continue;

			if(iswrap && (curRowIndex==this._startRowIndex))
			{
				if(curColIndex>=this._startColIndex)
				{
					if(this._searchedText==stext && !this._isFound)
					{
						if (BidiUtils.isBidiOn())
							stext = BidiUtils.addEmbeddingUCC(stext);

						var msg = dojo.string.substitute(this.STRING_NOT_FOUND,[stext]);
						this.dlg.setWarningMsg(msg);
						ret.code = this._NOT_FOUND;
						break;
					}
				}
			}
			if(curRowIndex==this._lastRowIndex)
			{
				if(curColIndex<this._lastColIndex)
					continue;
			}

			if(colsMap[curColIndex])//column is invisible
				continue;

			this._mixStyleCell(cell, rowModel);
			var value = this._getCellValue(cell);
			if(value.search(reg)>=0)
			{
				this._lastRowIndex = curRowIndex;
				this._lastColIndex = curColIndex;
				this._isFound = true;
				ret.code = this._FOUND;
				ret.cell = cell;
				break;
			}
		}

		if (ret.code === undefined)
			ret.code = this._TO_BE_CONTINUE;

		return ret;
	},

	_findNextInSheet: function(stext,sheet, iswrap, moveStart){
		this._lastSheetName = sheet.getSheetName();
		var reg = this._createRegExp(stext);
		if(moveStart)
			this._lastColIndex ++;

		var ret;
		var colsMap = websheet.Utils.getColsVisMap(sheet, 1, websheet.Constant.MaxColumnIndex);
		var maxRow = this.editor.getMaxRow();
		var rangeInfo = {sheetName: this._lastSheetName, startRow: this._lastRowIndex, endRow: maxRow, startCol: 1, endCol: websheet.Constant.MaxColumnIndex};
		var iter = new websheet.model.RowIterator(rangeInfo, websheet.Constant.RangeIterType.OPTIMIZEVALUE);
		iter.iterate(dojo.hitch(this, function(row, index) {
			if(!row.isVisibility())
				return true;
			ret = this._findNextInRow(row,index, reg,stext,iswrap,colsMap);
			if(ret.code===this._FOUND){
				this._lastRowPos = sheet.getRowPosition(index);
				return false;
			}
			if(ret.code==this._NOT_FOUND||ret.code==this._OUT_OF_SCOPE)
				return false;
			return true;
		}));

		return (ret && ret.cell) ? ret.cell : null;
	},

	_findNext: function(stext, bReplace){
		var grid = this.editor.getCurrentGrid();
		var sheetName = grid.sheetName;

		if(!(this._matchOption & this.SEARCH_ALL_SHEETS)){
			var selectRect = grid.selection.selector();
			if(!selectRect.selectingCell()){
				var rangeInfo = selectRect.getRangeInfo();
				return this._findNextInRange(stext, rangeInfo, bReplace);
			}
		}

		var doc = this.editor.getDocumentObj();
		var sheet = doc.getSheet(sheetName);

		// find candidate string within current sheet
		var cell = null;

		if(!bReplace || !sheet.isProtected())
			cell = this._findNextInSheet(stext,sheet, false, !bReplace);
		if(cell)
		{
			if(bReplace)
				this._lastColIndex ++;
			return cell;
		}

		var lastFound = this._isFound;
		var nextSheet = sheet;
		var reachEndOfDoc = false;
		if(this._matchOption & this.SEARCH_ALL_SHEETS)
		{
			this._lastRowPos = 0;
			this._lastRowIndex = 1;
			this._lastColIndex = 1;
			// continue to search at next sheet until the initial sheet
			// is searched again
			while(cell==null)
			{
				//var sheetIndex = nextSheet.getIndex();
				var next_sheet_name = nextSheet.getSheetName();
				var next_sheet_tabIndex = doc.getSheetTabIndex(next_sheet_name);
				var sheets = doc.getVisibleSheets();
				if(next_sheet_tabIndex<sheets.length)
					nextSheet = sheets[next_sheet_tabIndex];
				else
				{
				    nextSheet = sheets[0];
				    reachEndOfDoc = true;
				}

				if(nextSheet.getSheetName()==this._startSheetName)
					break;

				if(bReplace && nextSheet.isProtected())
					continue;

				if (!doc.isSheetLoaded(nextSheet))
					continue;

				cell = this._findNextInSheet(stext,nextSheet, false);
			}
		}
		if(cell)
		{
			if(!lastFound)
			{
				this._lastRowPos = 0;
				this._startRowIndex = this._lastRowIndex;
				this._startColIndex = this._lastColIndex;
				this._startSheetName = nextSheet.getSheetName();
			}
			if(reachEndOfDoc)
			    this.dlg.setWarningMsg(this.LOOKING_AROUND_DOC);
			if(bReplace)
				this._lastColIndex ++;
			return cell;
		}

		// start from the first cell of the initial sheet, A1, to continue search
		this._lastRowPos = 0;
		this._lastRowIndex = 1;
		this._lastColIndex = 1;

		if(!bReplace || !sheet.isProtected()){
			if(!bReplace)
				this._startColIndex ++;
			cell = this._findNextInSheet(stext,nextSheet, true);
		}
		if(cell==null) {
			if (BidiUtils.isBidiOn())
				stext = BidiUtils.addEmbeddingUCC(stext);

			var msg = dojo.string.substitute(this.STRING_NOT_FOUND,[stext]);
			this.dlg.setWarningMsg(msg);
		} else
		{
		    if(this._matchOption & this.SEARCH_ALL_SHEETS)
		    {
		        if(reachEndOfDoc)
                    this.dlg.setWarningMsg(this.LOOKING_AROUND_DOC);
		    }
		    else
		        this.dlg.setWarningMsg(this.LOOKING_AROUND);
		    if(bReplace)
				this._lastColIndex ++;
		}

		return cell;
	},

	_findAllCellsInSheet: function(reg,sheet,matchedCells){
		var maxRow = this.editor.getMaxRow();
		var rangeInfo = {sheetName: sheet.getSheetName(), startRow: 1, endRow: maxRow, startCol: 1, endCol: websheet.Constant.MaxColumnIndex};
		var iter = new websheet.model.RangeIterator(rangeInfo, websheet.Constant.RangeIterType.STYLEDVALUE);
		iter.iterate(dojo.hitch(this, function(cell, row, col) {
			var value = this._getCellValue(cell);
			if(value.search(reg)>=0){
				matchedCells.push(cell);
			}

			return true;
		}));
	},

	_findAllCells: function(stext){
		if(!(this._matchOption & this.SEARCH_ALL_SHEETS)){
			var grid = this.editor.getCurrentGrid();
			var sheetName = grid.getSheetName();
			var selectRect = grid.selection.selector();
			if(!selectRect.selectingCell()){
				rangeInfo = selectRect.getRangeInfo();
				return this._findAllInRange(stext, rangeInfo);
			}
		}

		var matchedCells = new Array();

		var doc = this.editor.getDocumentObj();
		var reg = this._createRegExp(stext);

		if(this._matchOption & this.SEARCH_ALL_SHEETS)
		{
			var sheets = doc.getVisibleSheets();
			for(var i=0;i<sheets.length;i++){
				var sheet = sheets[i];
				if(!sheet.isProtected() && doc.isSheetLoaded(sheet))
					this._findAllCellsInSheet(reg,sheet,matchedCells);
			}
		}
		else
		{
			var sheetName = this.editor.getCurrentGrid().getSheetName();
			var sheet = doc.getSheet(sheetName);
			this._findAllCellsInSheet(reg,sheet,matchedCells);
		}
		return matchedCells;
	},

	_findAllInRange: function(stext, rangeInfo){
		var matchedCells = new Array();
		var reg = this._createRegExp(stext);
	 	var iter = new websheet.model.RangeIterator(rangeInfo, websheet.Constant.RangeIterType.STYLEDVALUE);
	 	iter.iterate(dojo.hitch(this, function(cell, row, col) {
	 		var value = this._getCellValue(cell);
	 		if(value.search(reg)>=0){
	 			matchedCells.push(cell);
	 		}
	 		return true;
	 	}));

		return matchedCells;
	},

	_findNextInRange: function(stext, rangeInfo, bReplace){
		 var doc = this.editor.getDocumentObj();
		 var sheet = doc.getSheet(rangeInfo.sheetName);
		 var maxRow = this.editor.getMaxRow();

		 var maxVisColIndex = websheet.Constant.MaxColumnIndex;
		 rangeInfo.endCol = rangeInfo.endCol > maxVisColIndex ? maxVisColIndex : rangeInfo.endCol;

		 var reg = this._createRegExp(stext);
		 var colsMap;

		 if(!bReplace)
			 this._move2Next(rangeInfo);
		 var startRow = this._lastRowIndex;//start from the last cell.
		 var endRow = rangeInfo.endRow > maxRow ? maxRow : rangeInfo.endRow;
		 var start = sheet.getRowPosition(startRow, false);
	 	 if(start < 0){
	 		start = -(start + 1);
	 	 }
	 	 var end = sheet.getRowPosition(endRow, false);
	 	 if(end < 0)
	 		end = -(end + 1) - 1;

	 	 var rows = sheet.getRows();
	 	 if(end >= start)
	 		 colsMap = websheet.Utils.getColsVisMap(sheet, rangeInfo.startCol, rangeInfo.endCol);
	 	 for(var i = start; i <= end; i++){
	 		 var row = rows[i];
	 		 if(!row.isVisibility())
	 			 continue;

	 		 var startCol = rangeInfo.startCol;
	 		 if(i == start){
	 			 if(row.getIndex() == this._lastRowIndex)
	 				 startCol = this._lastColIndex;//start from the last cell.
	 			 else
	 				 start --;//There is not row model for row of last cell.
	 		 }

	 		var cell = this._findNextInRowOfRange(row, reg, startCol, rangeInfo.endCol, colsMap);
	 		if(cell)
	 			break;
	 	 }

	 	 if(!cell && (this._lastRowIndex > rangeInfo.startRow || this._lastColIndex > rangeInfo.startCol)){//wrap from start of the range.
	 		 end = start;
	 		 startRow = rangeInfo.startRow > maxRow ? maxRow : rangeInfo.startRow;
		 	 start = sheet.getRowPosition(startRow, false);
		 	 if(start < 0){
		 		start = -(start + 1);
		 	 }
		 	 if(end >= start && !colsMap)
		 		colsMap = websheet.Utils.getColsVisMap(sheet, rangeInfo.startCol, rangeInfo.endCol);
	 		 for(var i = start; i <= end; i++){
		 		 var row = rows[i];
		 		 if(!row.isVisibility())
		 			 continue;

		 		 var endCol = rangeInfo.endCol;
		 		 if(i == end && row.getIndex() == this._lastRowIndex)
				 	endCol = this._lastColIndex - 1;

		 		var cell = this._findNextInRowOfRange(row, reg, rangeInfo.startCol, endCol, colsMap);
		 		if(cell)
		 			break;
		 	 }
	 	 }
	 	if(cell){
	 		this._lastRowIndex = cell.getRow();
			this._lastColIndex = cell.getCol();
			if(bReplace)
				this._move2Next(rangeInfo);
	 	}else{
			if (BidiUtils.isBidiOn())
				stext = BidiUtils.addEmbeddingUCC(stext);

		 	var msg = dojo.string.substitute(this.STRING_NOT_FOUND,[stext]);
			this.dlg.setWarningMsg(msg);
			return null;
	 	}
	 	return cell;
	},

	_move2Next: function(rangeInfo){
		if(this._lastColIndex < rangeInfo.endCol)
			this._lastColIndex ++;
		else{
			this._lastColIndex = rangeInfo.startCol;
			this._lastRowIndex = this._lastRowIndex < rangeInfo.endRow ? this._lastRowIndex + 1 : rangeInfo.startRow;
		}
	},

	_findNextInRowOfRange: function(rowModel, reg, startCol, endCol, colsMap){
		var nextCell = null;
		var sheetName = rowModel._getSheetName();
		var index = rowModel.getIndex();
		var rangeInfo = {sheetName: sheetName, startRow: index, endRow: index, startCol: startCol, endCol: endCol};
		var iter = new websheet.model.RangeIterator(rangeInfo, websheet.Constant.RangeIterType.STYLEDVALUE);
		iter.iterate(dojo.hitch(this, function(cell, row, col) {
			var curColIndex = col;
			if(colsMap[curColIndex])//column is invisible
				return true;
			var value = this._getCellValue(cell);
			if(value.search(reg)>=0) {
				nextCell = cell;
				return false;
			}
			return true;
		}));

		return nextCell;
	},

	_postFunc: function(func)
	{
		this.dlg.replaceAllBtn.setAttribute("disabled",false);
		this.dlg.replaceBtn.setAttribute("disabled",false);
		this.dlg.findBtn.setAttribute("disabled",false);
		this.dlg.isCalcDone = true;
		func();
	},

	_doCalc: function(func)
	{
		this.dlg.findBtn.setAttribute("disabled", true);
		this.dlg.replaceBtn.setAttribute("disabled", true);
		this.dlg.replaceAllBtn.setAttribute("disabled", true);
		var scene = this.editor.scene;
		var sceneNls = scene.nls;
		scene.showWarningMessage(sceneNls.browserWorkingMsg);
		var func = dojo.hitch(this, "_postFunc", func);

		var grid = this.editor.getCurrentGrid();
		var docObj = this.editor.getDocumentObj();
		var sheetName = grid.sheetName;
		var sheet = docObj.getSheet(sheetName);
		var rangeInfo = {};
		if(sheet){
			rangeInfo.sheetName = sheetName;
			rangeInfo.startRow = 1;
			rangeInfo.endRow = sheet.initMaxRowIndex;
			rangeInfo.startCol = -1;
			rangeInfo.endCol = -1;
		}
//		var partialCalcMgr = this.editor.getPartialCalcManager();
//		partialCalcMgr.start(rangeInfo, func);
		var tm = this.editor.getTaskMan();
		tm.addTask(this.editor.getInstanseOfPCM(), "start", [rangeInfo, func], tm.Priority.UserOperation);
		tm.start();
	},

	findText:function(stext){
		if(!stext || stext.length==0) {
			this.dlg.setWarningMsg(this.NO_FIND_KEY);
			return;
		}

		if(this._lastAction!=0)
		{
			this._lastAction = 0;
			this._reset();
		}

		var pattern = this._normalize(stext);

		var cell = this._findNext(pattern);

		if(!cell)
			return;

		var cellAddr = cell.getAddress(true);
		var parsedRef = websheet.Helper.parseRef(cellAddr);
		if(!this._setFocusInSelectRect(parsedRef))
			this.editor.setFocus(cellAddr);
		dojo.publish("_cellFocusMoveIn" + parsedRef.sheetName, null);
	},

	_setFocusInSelectRect: function(parsedRef){
		if(!(this._matchOption & this.SEARCH_ALL_SHEETS)){
			var controller = this.editor.getController();
			var selector = controller.getGrid(parsedRef.sheetName).selection.selector();
			if(!selector.selectingCell()){
				var grid = selector.grid;
				var colIndex = parsedRef.startCol;
				var rowIndex = parsedRef.startRow - 1;
				selector.focusCell(rowIndex, colIndex);
				return true;
			}
		}
		return false;
	},

	_canReplace: function(matchedCells)
	{
		if(!matchedCells || !this.editor.hasACLHandler()) return true;

		var bhChecker = this.editor.getACLHandler()._behaviorCheckHandler;
		for(var len = matchedCells.length, i = len -1 ; i >= 0; i--)
		{
			var cell = matchedCells[i];
			var addr = cell.getAddress(true);
			var canEdit = bhChecker.canCurUserEditRange(addr);
			if(!canEdit)
			{
				bhChecker.cannotEditWarningDlg();
				return false;
			}
		}
		return true;
	},

	replaceText: function(stext, replacement){
		if(!(this._matchOption & this.SEARCH_ALL_SHEETS) && websheet.model.ModelHelper.isSheetProtected()){
			this.editor.protectedWarningDlg();
			return;
		}

		if(!stext || stext.length==0) {
			this.dlg.setWarningMsg(this.NO_FIND_KEY);
			return;
		}

		if(this._lastAction!=1)
		{
			this._lastAction = 1;
			this._reset();
		}

		var pattern = this._normalize(stext);

		var cell = null;
		if(this._matchOption & this.BACKWARD)
			cell = this._findPrevious(pattern);
		else
		 	cell = this._findNext(pattern, true);

		if(!cell){
			if (BidiUtils.isBidiOn())
				stext = BidiUtils.addEmbeddingUCC(stext);

			var msg = dojo.string.substitute(this.STRING_NOT_FOUND,[stext]);
			this.dlg.setWarningMsg(msg);
			return;
		}
		var cellAddr = cell.getAddress(true);
		var parsedRef = websheet.Helper.parseRef(cellAddr);
		if(!this._setFocusInSelectRect(parsedRef))
			this.editor.setFocus(cellAddr);
		dojo.publish("_cellFocusMoveIn" + parsedRef.sheetName, null);

		// ACL controll
		if(!this._canReplace([cell])) return;

		var rowIndex = cell.getRow();
		var colIndex = cell.getCol();

		var reg = this._createRegExp(pattern);

		var value = this._getCellValue(cell); // edit value
		var newtext = value.replace(reg,replacement);
		if(newtext==value)
			return;

    	var parsedRef = websheet.Helper.parseRef(cellAddr);
    	var cellJson = {};
    	cellJson.row = rowIndex;
    	cellJson.col = colIndex;
    	cellJson.value = newtext; // new edit value
    	cellJson.sheetName = parsedRef.sheetName;
		var ret = this._setCell(cellJson);
		var cbCell = ret.newCellJson;
		var origCellJson = ret.oldCellJson;

		var colName = websheet.Helper.getColChar(colIndex);
    	var refValue=websheet.Helper.getCellAddr(parsedRef.sheetName, rowIndex, colName);
    	var event = new websheet.event.SetCell(refValue, cbCell);
    	var reverse = new websheet.event.Reverse(event, refValue, origCellJson );

    	this.editor.sendMessage(event,reverse);
	},

	replaceAllText:function(stext, replacement){
		if(!(this._matchOption & this.SEARCH_ALL_SHEETS) && websheet.model.ModelHelper.isSheetProtected()){
			this.editor.protectedWarningDlg();
			return;
		}

		if(!stext || stext.length==0) {
			this.dlg.setWarningMsg(this.NO_FIND_KEY);
			return;
		}

		var pattern = this._normalize(stext);
		var matchedCells = this._findAllCells(pattern);
		if(!matchedCells || matchedCells.length==0){
			if (BidiUtils.isBidiOn())
				stext = BidiUtils.addEmbeddingUCC(stext);

			var msg = dojo.string.substitute(this.STRING_NOT_FOUND,[stext]);
			this.dlg.setWarningMsg(msg);
			return;
		}

		// ACL controll
		if(!this._canReplace(matchedCells)) return;

		var events = null;
		var reverses = null;
		for(var i=0;i<matchedCells.length;i++){
			try{
				var cell = matchedCells[i];
				var rowIndex = cell.getRow();
				var colIndex = cell.getCol();

				var reg = this._createRegExp(pattern);
				var value = this._getCellValue(cell); // edit value

				var newtext = value.replace(reg,replacement);
				if(newtext==value)
					continue;

				var cellAddr = cell.getAddress(true);
				var parsedRef = websheet.Helper.parseRef(cellAddr);

				var cellJson = {};
		    	cellJson.row = rowIndex;
		    	cellJson.col = colIndex;
		    	cellJson.value = newtext; // new edit value
		    	cellJson.sheetName = parsedRef.sheetName;

				var ret = this._setCell(cellJson);
				var cbCell = ret.newCellJson;
				var origCellJson = ret.oldCellJson;

	    		var refValue=websheet.Helper.getCellAddr(parsedRef.sheetName, rowIndex, colIndex);
				if(!events)
				{
					events = new websheet.event.SetCell(refValue, cbCell);
					reverses = new websheet.event.Reverse(events, refValue, origCellJson );
				}
				else
				{
					var event = new websheet.event.SetCell(refValue, cbCell);
					var reverse = new websheet.event.Reverse(event, refValue, origCellJson );
					events.getMessage().updates.push(event.getMessage().updates[0]);
					reverses.getMessage().updates.push(reverse.getMessage().updates[0]);
				}
			}catch(err){
				console.log("error happens when replace all text, the exception is " + err);
			}
		}

		this.dlg.setWarningMsg(dojo.string.substitute(this.REPLACE_FINISHED, [matchedCells.length]));
		this.editor.sendMessage(events,reverses);
	},

	// Return the old cell json and new cell json
	/*Object*/_setCell: function(cellJson)
	{
		this.editor._calcManager.pauseTasks();
	 	var rowIndex = cellJson.row;
		var colIndex = cellJson.col;
	 	var controller = this.editor.getController();
    	var docObj = this.editor.getDocumentObj();
    	var sheetName = cellJson.sheetName;
    	var grid = controller.getGrid(sheetName);
 		var sheetObj = docObj.getSheet(sheetName);
    	var rowModel = sheetObj ? sheetObj.getRow(rowIndex) : null;
    	var result = grid.setValue(cellJson.value, rowIndex, colIndex, true); // original cell json
        var oldCellJson = result.cellJson; // original cell json
        var cellModel = rowModel.getCell(colIndex);
        var withNumberStyle = oldCellJson ? oldCellJson.style != null : false;
        var newCellJson = websheet.model.ModelHelper.getValueCellJson(cellModel, withNumberStyle);
        if (newCellJson.v === undefined)
        	newCellJson.v = cellJson.value;

        grid.updateRow(rowIndex - 1);

        var currentGrid = this.editor.getCurrentGrid();
        if (currentGrid.sheetName == sheetName) {
        	var selector = currentGrid.selection.activeSelector();
        	var focusCell = selector.getFocusCellAddress();

        	if(focusCell.row==rowIndex && focusCell.column==colIndex) {
        		var cellRef = websheet.Helper.getAddressByIndex(sheetName, rowIndex, colIndex, null, null, null, {refMask : websheet.Constant.CELL_MASK});
        		var formulaBar = this.editor.getFormulaBar();
        		if (formulaBar) formulaBar.syncOnCellMouseDown(cellRef,"cell");
        	}
        }

        return {oldCellJson: oldCellJson, newCellJson: newCellJson};
    },

    /*boolean*/preCondition: function (event)
    {
    	var s = event._source;
    	if (event._type != websheet.Constant.EventType.DataChange)
    		return false;

    	if (s.action != websheet.Constant.DataChange.PREDELETE &&
    		s.action != websheet.Constant.DataChange.PREINSERT &&
    		s.action != websheet.Constant.DataChange.SET &&
    		s.action != websheet.Constant.DataChange.PREMOVE)
    		return false;

    	if (s.action == websheet.Constant.DataChange.PREDELETE)
    	{
    		if (s.refType != websheet.Constant.OPType.ROW &&
    			s.refType != websheet.Constant.OPType.COLUMN &&
    			s.refType != websheet.Constant.OPType.SHEET)
    			return false;
    	}
    	if (s.action == websheet.Constant.DataChange.PREINSERT)
    	{
    		if (s.refType != websheet.Constant.OPType.ROW &&
    			s.refType != websheet.Constant.OPType.COLUMN)
    			return false;
    	}
    	if (s.action == websheet.Constant.DataChange.SET)
    	{
    		if (s.refType != websheet.Constant.OPType.SHEET)
    			return false;
    	}
    	if (s.action == websheet.Constant.DataChange.PREMOVE)
    	{
    		if (s.refType != websheet.Constant.OPType.SHEET)
    			return false;
    	}

    	return true;
    },

    notify: function(source, e)
	{
		if(e )
		{
			if(e._type == websheet.Constant.EventType.DataChange)
			{
				var docObj = this.editor.getDocumentObj();
				var grid = this.editor.getCurrentGrid();
				var curSheetName = 	grid.getSheetName();
				var s = e._source;
				var refvalue = s.refValue;
				var parsedRef = null;
				if(s.refType==websheet.Constant.OPType.SHEET)
					parsedRef = {sheetName:refvalue.split("|")[0] };
				else
					parsedRef = refvalue;

				if(s.action == websheet.Constant.DataChange.PREDELETE)
				{
					switch(s.refType)
					{
						case websheet.Constant.OPType.ROW:
						{
							if(parsedRef.sheetName == curSheetName)
							{
								var rangeStartRow = parsedRef.startRow;
								var	rangeEndRow = parsedRef.endRow;

								var focusCell = grid.selection.selector().getFocusCellAddress();

								if(focusCell.row>rangeStartRow && focusCell.row<=rangeEndRow){
									var newCellAddr = websheet.Helper.getCellAddr(parsedRef.sheetName, rangeStartRow, focusCell.column);
									this.editor.setFocus(newCellAddr);
									this._reset();
								}
								else if(focusCell.row>rangeEndRow)
								{
									var newRowIndex = focusCell.row - (rangeEndRow-rangeStartRow+1);
									if(newRowIndex<1)
										newRowIndex = 1;
									var newCellAddr = websheet.Helper.getCellAddr(parsedRef.sheetName, newRowIndex, focusCell.column);
									this.editor.setFocus(newCellAddr);
									this._reset();
								}
							}
						}
						break;
						case websheet.Constant.OPType.COLUMN:
						{
							if(parsedRef.sheetName == curSheetName)
							{
								var nStartColumn = parsedRef.startCol;
								var	nEndColumn = parsedRef.endCol;

								var focusCell = grid.selection.selector().getFocusCellAddress();
								var nCol = focusCell.column;
								if(nCol>nStartColumn && nCol<=nEndColumn)
								{
									var newCellAddr = websheet.Helper.getCellAddr(parsedRef.sheetName, focusCell.row, nStartColumn);
									this.editor.setFocus(newCellAddr);
									this._reset();
								}
								else if(nCol>nEndColumn)
								{
									var newColIndex = nCol - (nEndColumn-nStartColumn+1);
									if(newColIndex<1)
										newColIndex = 1;
									var newCellAddr = websheet.Helper.getCellAddr(parsedRef.sheetName, focusCell.row, newColIndex);
									this.editor.setFocus(newCellAddr);
									this._reset();
								}
							}
						}
						break;
						case websheet.Constant.OPType.SHEET:
						{
							if(this._lastSheetName == parsedRef.sheetName)
							{
								this._reset();
							}
						}
						break;
					}
				}
				else if(s.action == websheet.Constant.DataChange.PREINSERT)
				{
					switch(s.refType)
					{
						case websheet.Constant.OPType.ROW:
						{
							if(parsedRef.sheetName == curSheetName)
							{
								var rangeStartRow = parsedRef.startRow;
								var	rangeEndRow = parsedRef.endRow;

								var focusCell = grid.selection.selector().getFocusCellAddress();

								if(focusCell.row>=rangeStartRow)
								{
									var newRowIndex = focusCell.row + (rangeEndRow-rangeStartRow+1);
									var newCellAddr = websheet.Helper.getCellAddr(parsedRef.sheetName, newRowIndex, focusCell.column);
									this.editor.setFocus(newCellAddr);
									this._reset();
								}
							}
						}
						break;
						case websheet.Constant.OPType.COLUMN:
						{
							if(parsedRef.sheetName == curSheetName)
							{
								var nStartColumn = parsedRef.startCol;
								var	nEndColumn = parsedRef.endCol;

								var focusCell = grid.selection.selector().getFocusCellAddress();
								var nCol = focusCell.column;
								if(nCol >= nStartColumn)
								{
									var newColIndex = nCol + (nEndColumn-nStartColumn+1);
									var strColumn = websheet.Helper.getColChar(newColIndex);
									var newCellAddr = websheet.Helper.getCellAddr(parsedRef.sheetName, focusCell.row, strColumn);
									this.editor.setFocus(newCellAddr);
									this._reset();
								}
							}
						}
						break;
					}
				}
				else if(s.action == websheet.Constant.DataChange.SET)
				{
					if(s.refType==websheet.Constant.OPType.SHEET)
					{
						if(this._lastSheetName == s.oldSheetName)
							this._lastSheetName = s.newSheetName;
						if(this._startSheetName == s.oldSheetName)
							this._startSheetName = s.newSheetName;
					}
				}
				else if(s.action == websheet.Constant.DataChange.PREMOVE)
				{
					if(s.refType==websheet.Constant.OPType.SHEET)
					{
						this._reset();
					}
				}
			}
		}
	}
});
