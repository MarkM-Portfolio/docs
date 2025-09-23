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

dojo.provide("websheet.widget.ScSpellCheckDlgHandler");
dojo.require("concord.spellcheck.SpellCheckDlgHandler");
dojo.require("websheet.model.ModelHelper");
dojo.require("concord.util.events");

dojo.declare("websheet.widget.ScSpellCheckDlgHandler", [concord.spellcheck.SpellCheckDlgHandler, websheet.listener.Listener], {
		
	grid: null,	
	editor: null,
	controller: null,
	// original cell position in view 
	_origRowIndex: 1,
	_origColIndex: 1,	
	_lastSheetName: null,
	_sheet: null,
	
	// last cell position in view 
	_lastRowIndex: 1,
	_lastColIndex: 1,
	
	_iteratePreviousCell: false,
	
	constructor: function(editor)
	{
		this.inherited(arguments);
		this.editor = editor;
		
		try
		{
			this.controller = editor.getController();
			this.grid = editor.getCurrentGrid();
			if( !this.isListening(this.controller) )
				this.startListening(this.controller);
		}catch(e)
		{
			console.log("error to get grid in spreadsheet: " + e);
		}
		this._initCellInfo();
		this._toggleEditMode(true, false);	
		
		this._iteratePreviousCell = false;
	},
	
	_initCellInfo: function()
	{
		try{
			var grid = this.editor.getCurrentGrid();
			var sheetName = grid.getSheetName();
			var focusCell = grid.selection.selector().getFocusCellAddress();
			//use current focus cell as the start search position
			this._origRowIndex = focusCell.row;
			this._origColIndex = focusCell.column;
			this._lastSheetName = sheetName;
			this._sheet = this.editor.getDocumentObj().getSheet(sheetName);
			
			this._lastRowIndex = this._origRowIndex;
			this._lastColIndex = this._origColIndex;
			console.log("Sheet:" + this._lastSheetName + "  Row:" + this._lastRowIndex + "  Cell:" + this._lastColIndex );
		}catch(e)
		{
			console.log("error to get cell information: "+e);
		}
	},
		
	/**
	 * true -- there is misspellings; 
	 * false -- no misspellings or no contents
	 * @param cell
	 * @returns {Boolean}
	 */
	_checkCell: function(cell)
	{
		this.index = 0;
		this.misWords = [];
		
		var value = cell.getRawValue();
		if(value && value.length)
		{
			this.setContents( value );
			this.checkText();
			if( this.getMisWordCount() )
				return true;
		}
		
		return false;
	},	
	
	_findPreviousInSheet: function(){
		var prevCell = null;
		if(this.isIteratedAll())
			return null;
		
		var bEmpty = true;
		var rangeInfo = {sheetName: this._sheet.getSheetName(), startRow: 1, endRow: this.editor.getMaxRow(), startCol: 1, endCol: 1024};
		var iter = new websheet.model.RangeIterator(rangeInfo, websheet.Constant.RangeIterType.OPTIMIZEVALUE);
		iter.iterate(dojo.hitch(this, function(cell, row, col) {
			if (bEmpty) bEmpty = false;
			
			var rowModel = cell._parent;
			var rowIndex = row;
			if(!rowModel.isVisibility() || rowIndex < this._lastRowIndex)
				return true;
			
			if(rowIndex > this._origRowIndex)
				return false;
			
			if(cell.isCovered()) // this is covered cell by merge action
				return true;
			var colIndex = col;
			
			if( rowIndex < this._origRowIndex )
			{
				if( (rowIndex > this._lastRowIndex || colIndex > this._lastColIndex) )
				{
					this._lastRowIndex = rowIndex;
					this._lastColIndex = colIndex;
					if( this._checkCell(cell) )
						prevCell = cell;
				
					bEmpty = true; // not reset last row and column index
					return false;
				}
			}
			else
			{// rowIndex == this._origRowIndex
				if( colIndex > this._lastColIndex && colIndex < this._origColIndex )
				{
					this._lastRowIndex = rowIndex;
					this._lastColIndex = colIndex;
					if( this._checkCell(cell) )
						prevCell = cell;

					bEmpty = true; // not reset last row and column index
					return false;
				}
			}
			
			return true;
		}));
		
		if (bEmpty) 
			return prevCell;
		
		// No valid cell any more, set an invalid position
		this._lastRowIndex = -1;
		this._lastColIndex = -1;
		return null;
	},		
	
	_findNextInSheet: function(){
		var nextCell = null;
		
		if(this.isIteratedAll())
			return null;
		
		var bEmpty = true;
		var rangeInfo = {sheetName: this._sheet.getSheetName(), startRow: 1, endRow: this.editor.getMaxRow(), startCol: 1, endCol: 1024};
		var iter = new websheet.model.RangeIterator(rangeInfo, websheet.Constant.RangeIterType.OPTIMIZEVALUE);
		iter.iterate(dojo.hitch(this, function(cell, row, col) {
			if (bEmpty) bEmpty = false;
			
			var rowIndex = row;
			var rowModel = cell._parent;
			if(!rowModel.isVisibility() || rowIndex < this._lastRowIndex)
				return true;

			if(cell.isCovered()) // this is covered cell by merge action
				return true;
			var colIndex = col;
			if(rowIndex == this._lastRowIndex && colIndex <= this._lastColIndex)
				return true;
			
			this._lastRowIndex = rowIndex;
			this._lastColIndex = colIndex;

			if( this._checkCell(cell) ) {
				nextCell = cell;
				bEmpty = true; // not reset last row and column index
				return false;
			}
			else {
				bEmpty = true; // not reset last row and column index
				return false;
			}
		}));
		
		if (bEmpty)
			return nextCell;
		
		// no valid cell later than original cell, reset the position to A1
		this._lastRowIndex = 0;
		this._lastColIndex = 0;		 
		return nextCell;
	},

	
	_toggleEditMode: function(editMode, apply)
	{
		var grid = this.grid;
		if(!grid) return;
		var inlineEditor = grid.getInlineEditor();
		if(editMode)
		{
			inlineEditor.preventCover();
			inlineEditor.editingStart();
			if (inlineEditor.isEditing()){
				this.setContents(inlineEditor.getValue());
			}
		}
		else
		{
			if(inlineEditor.isEditing())
			{
				if(apply && !inlineEditor.isEditCellRemoved())
					inlineEditor.apply();
				else
					inlineEditor.cancel();
			}	
		}	
	},
	
	_setEditorValue: function(value)
	{
		if( this.grid && this.grid.isEditing() )
		{
			var inlineEditor = this.grid.getInlineEditor();
			if(inlineEditor && value != inlineEditor.getValue() )
			{
				inlineEditor.setValue(value);
			}
		}
	},	
	
	_adjustIndex: function(offset)
	{
		for(var i=this.index+1; i<this.beginIndex.length; i++)
		{
			this.beginIndex[i] += offset;
		}		
	},
	
	_replaceAt: function(str, index, len, replacement)
	{
		if(str.length < index + len)
			return null;
		return str.substr(0,index) + replacement + str.substr(index+len);
	},
	
	getWordIndex: function(index)
	{
		return this.beginIndex[index];
	},
	
	_replaceWord: function(misWord, correctWord, index)
	{
		if( this.contents )
		{		
			var wordIndex = this.getWordIndex(index);
			this.contents = this._replaceAt(this.contents, wordIndex, misWord.length, correctWord);
			
			var offset = correctWord.length - misWord.length;
			this._adjustIndex(offset);
			this._setEditorValue(this.contents);
		}
	},
		
	getCurCellName: function()
	{
		var focusCell = null;
		try{
			focusCell = this.controller.getGrid(this._lastSheetName).selection.selector().getFocusCellAddress();
		}catch(e){
			console.log("error to get cell name in spreadsheet: " + e);
		}
		
		if(focusCell)
			return websheet.Helper.getColChar(focusCell.column) + focusCell.row;
			
		return "";	
	},
	
	// if all cells iterated 
	isIteratedAll: function()
	{
		if( this._lastRowIndex == -1 || this._lastColIndex == -1)
			return true;
		
		return false;			
	},
	
	// if a empty sheet
	isEmptySheet: function()
	{
		if(this._sheet){
			var rows = this._sheet.getRows();
			if(rows.length==0)
				return true;
		}
		
		return false;			
	},	
	
	// if forward iterated all later cells 
	isIteratedAllForward: function()
	{
		if( this._lastRowIndex == 0 && this._lastColIndex == 0 )
			return true;
		
		return false;	
	},
	
	// are we iterating previous remain part
	isIteratingPreviousPart: function()
	{
		return this._iteratePreviousCell;	
	},	
	
	// return true if get a cell with mis-word, return false if get a cell without mis-word
	moveToNextCell: function()
	{
		// exit edit mode for current cell
		this._toggleEditMode(false, true);
		
		// get next valid cell
		var cell = null;		
		if ( this.isIteratingPreviousPart() )
		{
			cell = this._findPreviousInSheet();
		}
		else
		{
			cell = this._findNextInSheet();
			if(!cell && this.isIteratedAllForward())
			{// if no cell with mis-word and forward iterated all, need also iterate previous. 
				this._iteratePreviousCell = true;
				cell = this._findPreviousInSheet();
			}
		}
		
		if(cell)
		{// got a mis-word cell, focus on it, change to edit mode and get it's address.
			var cellAddr = cell.getAddress(true);		
			this.editor.setFocus(cellAddr, true,true);
			this._toggleEditMode(true, false);
			
			return true;
		}
		
		return false;
	},	
					
	ignoreMisWord: function()
	{
		// do nothing
		//console.log("ignoreMisWord not implemented");
	},
	
	correctMisWord: function(correctWord)
	{
		if(this.grid)
		{
			var misWord = this.getCurrentMisWord();
			this._replaceWord(misWord, correctWord, this.index);
		}
	},
	
	correctAllMisWord: function(correctWord)
	{
		throw new Error("not implemented");
	},
	
	commit: function()
	{
		this._toggleEditMode(false, true);
		try{
			if( this.isListening(this.controller) )
			{
				//console.log("   ");
				this.endListening(this.controller);
			}
		}catch(e)
		{
			console.log("error happens when commit spell check dialog"+e);
		}
	},
	
	cancel: function()
	{
		this._toggleEditMode(false, false);
		try{
			if( this.isListening(this.controller) )
			{
				//console.log("   ");
				this.endListening(this.controller);
			}
		}catch(e)
		{
			console.log("error happens when cancel spell check dialog"+e);
		}
	},

	focusOnCurrentCell: function()
	{
		try{
			var newCellAddr = websheet.Helper.getCellAddr(this._lastSheetName, this._lastRowIndex, this._lastColIndex);
			this.editor.setFocus(newCellAddr);
			this._toggleEditMode(true, false);
		}catch(e)
		{
			console.log("error to set focus on cell:"+e);
		}
	},
	
	/////////////////////////////////////////////////////////////////////////////////////////////
	////////// Handle co-editing message  ///////////////////////////////////////////////////////
	
	onRowInsert: function(sRow, eRow)
	{	
		var rowCount = eRow - sRow + 1;		
		// original cell index
		if(this._origRowIndex >= sRow )
		{// insert rows before original cell
			this._origRowIndex += rowCount;			
		}
		
		// last cell index	
		if(this._lastRowIndex >= sRow)
		{// insert rows before current cell
			this._lastRowIndex += rowCount;	
			concord.util.events.publish(concord.util.events.spellcheck_cellname_changed, [true]);
		}	
	},
	
	onColInsert: function(sCol, eCol)
	{		
		var colCount = eCol - sCol + 1;		
		// original cell index
		if(this._origColIndex >= sCol )
		{// insert columns before original cell	
			this._origColIndex += colCount;
		}
		
		// last cell index	
		if(this._lastColIndex >= sCol)
		{// insert columns before current cell
			this._lastColIndex += colCount;
			concord.util.events.publish(concord.util.events.spellcheck_cellname_changed, [true]);
		}	
	},
	
	onRowDelete: function(sRow, eRow)
	{
		var rowCount = eRow - sRow + 1;		
		// original cell index
		if(this._origRowIndex >= sRow && this._origRowIndex <= eRow)
		{// the original cell get removed	
			this._origRowIndex = sRow;
		}
		else if(this._origRowIndex >= sRow)
		{// delete rows before
			this._origRowIndex -= rowCount;
			if(this._origRowIndex < 1) 
				this._origRowIndex = 1;
		}
		
		// last cell index	
		if(this._lastRowIndex >= sRow && this._lastRowIndex <= eRow)
		{// current cell get removed	
			this._lastRowIndex = sRow;
			this._lastColIndex = 0;
			concord.util.events.publish(concord.util.events.spellcheck_focuscell_removed, [true]);		
		}
		else if(this._lastRowIndex >= sRow)
		{// delete rows before
			this._lastRowIndex -= rowCount;
			if(this._lastRowIndex < 1) 
				this._lastRowIndex = 1;
			concord.util.events.publish(concord.util.events.spellcheck_cellname_changed, [true]);
		}
	},
	
	onRowHide: function(sRow, eRow)
	{// hide row won't change the row index in the view
		var rowCount = eRow - sRow + 1; 	
		if(this._lastRowIndex >= sRow && this._lastRowIndex <= eRow)
		{// current cell was hidden, move to next cell. do nothing if hide other rows	
			this._lastRowIndex = eRow+1;
			this._lastColIndex = 0;
			concord.util.events.publish(concord.util.events.spellcheck_focuscell_removed, [true]);		
		}		
	},
	
	onColDelete: function(sCol, eCol)
	{	
		var colCount = eCol - sCol + 1;		
		// original cell index
		if(this._origColIndex >= sCol && this._origColIndex <= eCol)
		{// the original cell get removed	
			this._origColIndex = sCol;
		}
		else if(this._origColIndex >= sCol)
		{// delete columns before
			this._origColIndex -= colCount;
			if(this._origColIndex < 1) 
				this._origColIndex = 1;
		}
		
		// last cell index	
		if(this._lastColIndex >= sCol && this._lastColIndex <= eCol)
		{// current cell get removed	
			this._lastColIndex = sCol-1;
			concord.util.events.publish(concord.util.events.spellcheck_focuscell_removed, [true]);		
		}
		else if(this._lastColIndex >= sCol)
		{// delete columns before
			this._lastColIndex -= colCount;
			if(this._lastColIndex < 1) 
				this._lastColIndex = 1;
			concord.util.events.publish(concord.util.events.spellcheck_cellname_changed, [true]);
		}
	},	
	
	/**
	 * listen sheet changes event
	 * @param source
	 * @param e
	 */
	notify: function(source, e)
	{
		if(!e || e._type != websheet.Constant.EventType.DataChange)
			return;
		
		var s = e._source;
		if(s.action == websheet.Constant.DataChange.PREDELETE)
		{
			switch(s.refType)
			{
				case websheet.Constant.OPType.ROW:
				{
					var parsedRef = s.refValue;
					var sheet = docObj.getSheet(parsedRef.sheetName);
					if( sheet && sheet.getSheetName()==this.editor.getCurrentGrid().getSheetName() )
					{
						var rangeStartRow = parsedRef.startRow;
						var	rangeEndRow = parsedRef.endRow;	
							
						this.onRowDelete(rangeStartRow, rangeEndRow);
					}
				}
				break;
				case websheet.Constant.OPType.COLUMN:
				{
					var parsedRef = s.refValue;
					var sheet = docObj.getSheet(parsedRef.sheetName);
					if( sheet && sheet.getSheetName()==this.editor.getCurrentGrid().getSheetName() )
					{
						var nStartColumn = parsedRef.startCol;
						var nEndColumn = parsedRef.endCol;	
							
						this.onColDelete(nStartColumn, nEndColumn);
					}
				}
				break;
				case websheet.Constant.OPType.SHEET:
				{
					concord.util.events.publish(concord.util.events.spellcheck_focussheet_removed, [true]);		
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
					var parsedRef = s.refValue;
					var sheet = docObj.getSheet(parsedRef.sheetName);
					if( sheet && sheet.getSheetName()==this.editor.getCurrentGrid().getSheetName() )
					{
						var rangeStartRow = parsedRef.startRow;
						var	rangeEndRow = parsedRef.endRow;
							
						this.onRowInsert(rangeStartRow, rangeEndRow);
					}
				}
				break;
				case websheet.Constant.OPType.COLUMN:
				{
					var parsedRef = s.refValue;
					var sheet = docObj.getSheet(parsedRef.sheetName);
					if( sheet && sheet.getSheetName()==this.editor.getCurrentGrid().getSheetName() )
					{	
						var nStartColumn = parsedRef.startCol;
						var nEndColumn = parsedRef.endCol;
							
						this.onColInsert(nStartColumn, nEndColumn);
					}
				}
				break;
			}
		}
		else if(s.action == websheet.Constant.DataChange.HIDE && s.refType != websheet.Constant.OPType.SHEET)
		{
			var parsedRef = websheet.Helper.parseRef(s.refValue);
			var sheet = docObj.getSheet(parsedRef.sheetName);
			if( sheet && sheet.getSheetName()==this.editor.getCurrentGrid().getSheetName() )
			{
				var rangeStartRow = parsedRef.startRow;
				var	rangeEndRow = parsedRef.endRow;	
					
				this.onRowHide(rangeStartRow, rangeEndRow);
			}			
		}
		else if(s.action == websheet.Constant.DataChange.SET)
		{
			if(s.refType==websheet.Constant.OPType.SHEET)
			{// sheet name changed
				if(this._lastSheetName == s.oldSheetName)
					this._lastSheetName = s.newSheetName;
			}
		}
		else if(s.action == websheet.Constant.DataChange.PREMOVE)
		{
			if(s.refType==websheet.Constant.OPType.SHEET)
			{// moved sheet
				concord.util.events.publish(concord.util.events.spellcheck_focussheet_moved, [true]);
			}
		}				
	}	
});
