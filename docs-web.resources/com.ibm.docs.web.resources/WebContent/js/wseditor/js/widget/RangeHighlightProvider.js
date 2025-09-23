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

dojo.provide("websheet.widget.RangeHighlightProvider");
dojo.require("concord.util.browser");
dojo.require("websheet.widget._MobileRectangle");
/**
 * Summary:
 * 		RangeHighlightCache uses a set of initialized viewers kept ready to use, 
 * rather than allocating and destroying them on demand.
 */
dojo.declare("websheet.widget.RangeHighlightCache", null, {
	
	LIMIT: 60,				//how many highlights do we allowed in current page
	
	_allocated	:	null,	//Array of viewers, created and current in use,
	
	_pool		: 	null,	//Array of viewers, created and currently free for use.
	
	constructor: function()
	{
		this._pool = [];
		this._allocated = [];
	},
	
	destroy: function()
	{
		dojo.forEach(this._pool.concat(this._allocated), function(viewer){
			viewer.destroy();
		});
		this._pool = [];
		this._allocated = [];
	},
	
	/**
	 * Get a  ready for use viewer, attached the viewer to the given grid.
	 * @param grid
	 */
	allocate: function(grid, params)
	{
		var allocated = this._pool.length > 0 ? this._pool.shift() : this._createNew(grid, params);
		if(allocated)
		{
			if(allocated.grid != grid)
			{
				allocated.selectGrid(grid);
			}
			this._allocated.push(allocated.wakeup());
		}
		return allocated;
	},
	
	/**
	 * Get all the allocated viewers.
	 * @returns
	 */
	getAllocated: function()
	{
		return this._allocated;
	},
	
	/**
	 * Release all the viewers in current grid, if 'grid' is given,
	 * Release the single viewer, if the 'grid' & 'viewer' object is given,
	 * Release all the viewers no matter which grid they are currently attached to.
	 * @param grid
	 * @param viewer
	 */
	release: function(grid, viewer)
	{
		if(grid)
		{
			if(viewer)
			{
				viewer.hibernate().hide();
				viewer._signal && viewer._signal.remove();
				if(viewer._respondToNotify)
					viewer._respondToNotify = false;
				var idx = 0, found = false;
				for(; idx < this._allocated.length; idx++)
					if(this._allocated[idx] == viewer)
					{
						found = true; break;
					}
				if(!found)	
					return;
				this._pool.push(this._allocated[idx]);
				this._allocated.splice(idx, 1);
			}
			else
			{
				var idx = 0;
				while(idx < this._allocated.length)
				{
					var v = this._allocated[idx];
					if(v.grid == grid)
					{
						v.hibernate().hide();
						v._signal && v._signal.remove();
						if(v._respondToNotify)
							v._respondToNotify = false;
						this._pool.push(v);
						this._allocated.splice(idx, 1);
					}
					else
						idx++;
				}
			}
		}
		else
		{
			for(var idx = 0, v; idx < this._allocated.length; idx++)
			{
				v = this._allocated[idx];
				v._signal && v._signal.remove();
				v.hibernate().hide();
				
			}
			this._pool = this._pool.concat(this._allocated);
			this._allocated = [];
		}
	},
	
	_createNew: function(grid)
	{
		if(this._pool.length + this._allocated.length < this.LIMIT)
		{
			var viewer;
			if(pe.scene.bMobileBrowser) 
				viewer = new websheet.widget._MobileRectangle({grid:grid});
			else
				viewer = new websheet.widget._Rectangle({grid:grid});
				
			//This rectangle will be re-used even when the attached grid has been removed,
			//rewrite the destroy method to do nothing.
			viewer.destroy = function ()  {}; 
			return viewer;
		}
		else
			return null;
	}
});

dojo.declare('websheet.widget._MessageHandler', websheet.listener.Listener, {
	
	preCondition:function(event)
    {
    	var s = event._source, actype = websheet.Constant.DataChange, reftype = websheet.Constant.OPType;
		if (event._type	== websheet.Constant.EventType.DataChange && 
			(s.action == actype.PREDELETE) || (s.action == actype.PREINSERT) || (s.action == actype.SET && s.refType == reftype.SHEET))
			return true;
		return false;
    },
	
    notify:function(caster, event, bNotModify)
	{
    	var doc = this.editor.getDocumentObj();
		var s = event._source;
		var action = s.action, type = s.refType;
		var dispatch, args = [], DC = websheet.Constant.DataChange, OP = websheet.Constant.OPType;
		if(type == OP.SHEET)
		{
			var sheetName = s.refValue;
			dispatch = (action == DC.PREDELETE) ? 'DeleteSheet' : (action == DC.SET) ? (( sheetName = s.newSheetName ) && "RenameSheet" ): null;
			if(!dispatch) return;
			var sheet = doc.getSheet(sheetName); //value should be sheetId
			if(sheet)
				args.push(sheet);
		}
		else if(type == OP.ROW || type == OP.COLUMN)
		{
			var bRow = (type == OP.ROW);
			var parsedRef = s.refValue;
			dispatch = (action == DC.PREDELETE) ? 'Delete' : (action == DC.PREINSERT) ? 'Insert' : null;
			if(!dispatch) return;	//we do not care show/hide rows
			var sheetName = parsedRef.sheetName;
			if(bRow) {
				sIdx = parsedRef.startRow;
				eIdx = parsedRef.endRow;
			} else {
				sIdx = parsedRef.startCol;
				eIdx = parsedRef.endCol;
			}
			var sheet = doc.getSheet(sheetName);
			if(sheet)
				args = [sheet, sIdx, eIdx, bRow];
		}
		
		if(args.length != 0 && ((dispatch = "_on" + dispatch) in this))
			this[dispatch].apply(this, args);
	},
	
	updateOnNotify: function(grid, change, trash)
	{
		if(grid && grid.isEditing())
		{
			var inlineEditor = grid.getInlineEditor();
			var value = inlineEditor.getValue(), _oldValue = value;
			if(trash)
			{
				for(var i = 0; i < trash.length ; i++)
				{
					value = value.replace(trash[i]._token, websheet.Constant.INVALID_REF);
				}
			}
			if(change)
			{
				for(var i = 0; i < change.length ; i++)
				{
					var view = change[i], newRef = '';
					if(view._isNameRange) continue;
					if(view.grid != inlineEditor.editGrid)
					{
						var refMask = websheet.Constant.RANGE_MASK;
						if(view._rangeType == websheet.Constant.RangeType.RANGE)
							refMask = websheet.Constant.RANGE_MASK;
						else if(view._rangeType == websheet.Constant.RangeType.CELL)
							refMask = websheet.Constant.CELL_MASK;
						else if(view._rangeType == websheet.Constant.RangeType.ROW)
							refMask = websheet.Constant.ROWS_MASK;
						else if(view._rangeType == websheet.Constant.RangeType.COLUMN)
							refMask = websheet.Constant.COLS_MASK;
						
						newRef = websheet.Helper.getAddressByIndex(view.grid.sheetName, view._startRowIndex + 1, view._startColIndex, null, view._endRowIndex + 1, view._endColIndex, 
								{refMask: refMask});
					}
					else
					{
						if(view._rangeType == websheet.Constant.RangeType.ROW)
							newRef = view._startRowIndex + 1 + ":" + (view._endRowIndex + 1);
						else if(view._rangeType == websheet.Constant.RangeType.COLUMN)
							newRef = websheet.Helper.getColChar(view._startColIndex) + ":" + websheet.Helper.getColChar(view._endColIndex);
						else
							newRef = view.getSelectedRangeAddress(view.grid == inlineEditor.grid, true);
					}
					value = value.replace(view._token, newRef);
				}
			}
			if(value == _oldValue) return;
			inlineEditor.setValue(value);
			inlineEditor.collapseToEnd();
			inlineEditor.cellIndicator.glowing();
			var formulaBar = grid.editor.getFormulaBar();
			if(formulaBar)
		    	formulaBar.setFormulaInputLineValue(value);
		}
		else
		{
			if(trash)
			{
				for(var i = 0; i < trash.length ; i++)
				{
					this.viewerCache.release(grid,  trash[i]);
				}
			}
		}
	},
	
	_onDelete: function(sheet, start, end, bRow)
	{
		var sheetName = sheet.getSheetName(), change = [], trash = [];
		var delcount = end - start + 1;
		dojo.forEach(this.viewerCache.getAllocated(), function(v){
			if(v._respondToNotify && v.grid.sheetName == sheetName)
			{
				var _vs = vstart = bRow ? v._startRowIndex + 1: v._startColIndex;
				var _ve = vend = bRow ? v._endRowIndex + 1: v._endColIndex;
				if(v._rangeType == websheet.Constant.RangeType.RANGE || v._rangeType == websheet.Constant.RangeType.CELL || 
						(v._rangeType == websheet.Constant.RangeType.COLUMN && !bRow) || (v._rangeType == websheet.Constant.RangeType.ROW && bRow))
				{
					if(start <= vstart && end >= vend)
						vstart = vend = -1;
					else
					{
						if(end < vstart)
							vstart -= delcount;
						else if(start <= vstart && end >= vstart)
							vstart = start;
						if(end < vend)
							vend -= delcount;
						else if(start <= vend && end >= vend)
							vend = start - 1;
					}
					if(bRow)
						v._startRowIndex = vstart - 1, v._endRowIndex = vend - 1;
					else
						v._startColIndex = vstart, v._endColIndex = vend;
					if(_vs != vstart || _ve != vend)
					{
						if(vstart == -1 || vend == -1)
							trash.push(v);
						else
							change.push(v);
					}
				}
			}
		});
		this.updateOnNotify(this.controller.getGrid(sheetName), change, trash);
	},
	
	_onInsert: function(sheet, start, end, bRow)
	{
		var sheetName = sheet.getSheetName(), change = [], trash = [];
		var inscount = end - start + 1;
		dojo.forEach(this.viewerCache.getAllocated(), function(v){
			if(v._respondToNotify && v.grid.sheetName == sheetName)
			{
				var _vs = vstart = bRow ? v._startRowIndex + 1: v._startColIndex;
				var _ve = vend = bRow ? v._endRowIndex + 1: v._endColIndex;
				if(v._rangeType == websheet.Constant.RangeType.RANGE || v._rangeType == websheet.Constant.RangeType.CELL || 
						(v._rangeType == websheet.Constant.RangeType.COLUMN && !bRow) || (v._rangeType == websheet.Constant.RangeType.ROW && bRow))
				{
					if(start <= vend)
						vend += inscount;
					if(start <= vstart)
						vstart += inscount;
					if(bRow)
						v._startRowIndex = vstart - 1, v._endRowIndex = vend - 1;
					else
						v._startColIndex = vstart, v._endColIndex = vend;
					if(_vs != vstart || _ve != vend)
					{
						change.push(v);
					}
				}
			}
		});
		this.updateOnNotify(this.controller.getGrid(sheetName), change, trash);
	},
	
	_onDeleteSheet: function(sheet)
	{
		var sheetName = sheet.getSheetName(), change = [], trash = [];
		dojo.forEach(this.viewerCache.getAllocated(), function(v){
			//we should make sure the viewer will be released no matter 'respond to notify' or not if grid has been removed.
			if(/*v._respondToNotify && */v.grid.sheetName == sheetName)
				trash.push(v);
		});
		this.updateOnNotify(this.controller.getGrid(sheetName), null, trash);
	},
	
	_onRenameSheet: function(sheet)
	{
		var sheetName = sheet.getSheetName(), change = [];
		dojo.forEach(this.viewerCache.getAllocated(), function(v){
			if(v._respondToNotify && v.grid.sheetName == sheetName)
				change.push(v);
		});
		this.updateOnNotify(this.controller.getGrid(sheetName), change);
	}
	
});

dojo.require("websheet.parse.FormulaLexer");
dojo.declare('websheet.widget.RangeHighlightProvider', websheet.widget._MessageHandler, {
	
	UPDATEUI		: 	'updateUI',
	
	updateHandler	: 	null,		//subscribe handler for update.
	
	viewerCache		: 	null,		//viewer pool manager
	
	highLightEnable	:	true,		//..
	
	colors			:	["0101DF", "FF0040", "0B610B", "FF8000", "5F04B4", "01A9DB", "29088A"],
	
	constructor: function(editor)
    {
		this.editor = editor;
		this.controller = this.editor.getController();
		this.updateHandler = dojo.subscribe(this.UPDATEUI, dojo.hitch(this, function(parms){
			this.onUpdate(parms ?  parms.grid : null);
		}));
		this.viewerCache = new websheet.widget.RangeHighlightCache();
		this.lexer = websheet.parse.FormulaParseHelper.getFormulaLexer();
		this.startListening(this.controller);
    },
    
    destroy: function()
    {
    	this.updateHandler && dojo.unsubscribe(this.updateHandler);
    	this.endListening(this.controller);
    	this.viewerCache.destroy();
    },
    
    /**
	 * Get "highlight objects"(read _generateHighlight to get more) in the formula string.
	 * @param formula
	 * @returns {Array}
	 */
	getHighlights: function(formula)
	{
		return this.getHighlightsByLexerTokens(this.lexer.parseToken(formula, false, null, /*bLocalSenstivie*/true));
	},
	
	getHighlightsByLexerTokens:function(tokens)
	{
		return (this.highlights = this._getHighlightsByTokens(tokens));
	},
    
    getHighlightRange: function (str)
    {
    	return this.getHighlights(str);
    },
    
    getColorByIndex: function(index)
    {
    	return '#' + this.colors[index % this.colors.length];
    },
    
    getLastViewer: function()
    {
    	var allocated = this.viewerCache.getAllocated();
    	if(allocated.length > 0)
    		return allocated[allocated.length -1];
    	return null;
    },
    
    /**
     *	Summary: Highlight the given range(s), accept a single Range object or a Range list array. 
     *	Notice:
     *		1. The object in parameter must be a "Range" object, or some structure implements "_getRangeInfo" to support highlight
     *		2. For performance, we may limit the number of ranges to be highlighted.
     *		3. Return value is the array of the allocated viewers that are used to highlight the given ranges.
     */
    highlightRange: function(rangelist, color, moveCallback)
    {
    	if(!this.highLightEnable)	return;
    	var viewers = [];
    	var ranges = dojo.isArray(rangelist) ? rangelist : [].concat(rangelist);
    	for(var idx = 0; idx < ranges.length; idx++)
    	{
    		var highlight = ranges[idx], range = null;
    		if(highlight.index != null && highlight.index >= 0)
    		{
    			range = highlight.range;
    		}
    		else if(highlight._getRangeInfo)
    		{
    			range = highlight;
    		}
    		if(!range) continue;
    		var rangeInfo  = range._getRangeInfo();
    		var sheetNames = [rangeInfo.sheetName];
    		if (rangeInfo.endSheetName && rangeInfo.endSheetName != rangeInfo.sheetName) {
    			sheetNames = this.controller.getDocumentObj().getSheetNameRanges(rangeInfo.sheetName, rangeInfo.endSheetName);
    		}
    		var sl = sheetNames.length;
    		for(var i = 0; i < sl; i++) {
    			var grid = this._getGridBySheetName(sheetNames[i]);
    			if (grid)
    			{
    				viewers.push(this._decorateHighlight(this.viewerCache.allocate(grid), rangeInfo, color || this.getColorByIndex(idx), highlight.index, highlight.token, range.getType(), moveCallback, highlight.nameRange));
    			}
    			
    		}
    	}
    	return viewers;
    },
    
    /**
     * Summary: Highlight the given ranges, ranges in a 'group' have the same highlight color. 
     * @param arrays, a general list structure for example:
     *  [[ref1, ref2, ref3],
     * 	 [ref4, ref5],
     * 	 [ref6, ref7, ref8]]
     */
    highlightRangeGroup: function(arrays, moveCallback)
    {
    	if(!arrays || !this.highLightEnable)	return;
    	var viewers = [];
    	for(var idx = 0; idx < arrays.length; idx++)
    	{
    		var array = arrays[idx];
    		if(!array || array.length <= 0) continue;
    		//color for this group
    		var color = this.getColorByIndex(idx);
    	    viewers = viewers.concat(this.highlightRange(array, color, moveCallback));
    	}
    	return viewers;
    },
    
    /**
     * Give the formula string & highlight the ranges in the formula string, 
     * formula string must be something like "=abcdefg.........", or somekind of "={abcdefg...." (starts with '=')
     */
    highlightRangeInString: function(value, moveCallback)
    {
    	if(!this.highLightEnable)	return;
    	return this.highlightRange(this.getHighlightRange(value), moveCallback);
    },
    
    /**
     * This is used for chart data series highlight, in case some special range such as
     * N1!Test1 while 'N1' is the name of the sheet(or the name of the file) and 'Test1' is a name range.
     * It's not a valid formula reference, but a valid data range in chart data series.
     * @param value
     */
    highlightChartRange: function(value)
    {
    	if(!this.highLightEnable)	return;
    	var doc = this.editor.getDocumentObj();
    	var helper = websheet.Helper;
    	var parsed = helper.parseRef(value);
		if(parsed && parsed.isValid() && (!parsed.sheetName || doc.isSheetExist(parsed.sheetName)))
		{
			return this.highlightRange(this._generateHighlight(parsed, value, 0));
		}
		else
		{
			var result = helper.parseName(value, true);
	    	if(result)
	    	{
	    		var sheet = result.sheet;
	    		if(sheet != this.editor.scene.getDocBean().getTitle() && !doc.isSheetExist(sheet))
	    			return;
	    		return this.highlightRangeInString(result.name);
	    	}
		}
		return this.highlightRangeInString(value);
    },
    
    /**
     * Called on grid UPDATEUI, redraw the range highlight viewers.
     * @param GRID
     */
    onUpdate: function(grid)
    {
//    	var updateGrid = grid || this._currentGrid();
//		var viewers = this._getViewerInGrid(grid);
//		dojo.forEach(viewers, dojo.hitch(this, "_updateViewer"));
    },
    
    /**
     * Remove the given highlights.
     * @param viewers
     */
    removeHighlight: function(viewers)
    {
    	var highlights = dojo.isArray(viewers) ? viewers : [].concat(viewers);
    	if(highlights && highlights.length  > 0)
    	{
    		for(var idx = 0; idx < highlights.length; idx ++)
    		{
    			var view = highlights[idx];
    			if(view)
    				this.viewerCache.release(view.grid, view);
    		}
    	}
    },
    
    /**
     * Remove all the highlight range for the given sheet.
     */
    removeSheetHighlight: function(sheetName)
    {
    	var grid = sheetName ? this._getGridBySheetName(sheetName) : this._currentGrid();
    	this.viewerCache.release(grid);
    },
    
    updateHighlight: function(viewers)
    {
//    	if(viewers)
//    	{
//    		var _viewers = dojo.isArray(viewers) ? viewers : [].concat(viewers);
//    		if(_viewers && _viewers.length > 0)
//    			dojo.forEach(viewers, dojo.hitch(this, "_updateViewer"));
//    	}
    },
    
    zoomed: function()
    {
		this.viewerCache.getAllocated().forEach(function(item){
			(!item.sleeping()) && item.wakeup();
		});
    },
    
    _currentGrid: function()
    {
    	return this.editor.getCurrentGrid();
    },
    
    _currentEditor: function()
    {
    	var grid = this._currentGrid();
    	if(grid)
    		return grid.getInlineEditor();
    },
    
    _decorateHighlight: function(viewer, range, color, index, token, rangeType, moveCallback, isNameRange)
    {
    	if(viewer)
    	{
    		var maxCol = websheet.Constant.MaxColumnIndex;
    		if(range.endCol > maxCol)	range.endCol = maxCol;
    		if(range.startCol > maxCol)	range.startCol = maxCol;
        	viewer.selectRange(range.startRow - 1, range.startCol, range.endRow - 1, range.endCol, true);
        	viewer.setBorderColor(color);
        	var bExpand = false;// we should not expand the highlight range by Default
        	if(viewer.selectingCell())
        	{
        		//But if it's a master cell, we should expand it.
        		var cell = this.editor.getDocumentObj().getCell(range.sheetName, range.startRow, range.startCol, websheet.Constant.CellType.COVERINFO);
        		if (cell && cell._colSpan > 1) {
        			bExpand = true;
        		}
        	}
        	if(bExpand)
        		viewer.expand();
        	else
        		viewer.fixed();
        	viewer.render();
        	viewer._shouldExpand = bExpand;
    		viewer._tokenIndex = index;
    		viewer._token = token;
    		viewer._rangeType = rangeType;
    		if(moveCallback != null)
    		{
    			// anything respond to 'move' events also cares about the insert/delete events.
    			// suppose it's the in-line editor here, anyway the updateOnNotify also makes the judgement.
    			viewer._respondToNotify = true;
    			if(pe.scene.bMobileBrowser) {
    				//when _MobileRectangle can be resize, then enable this for edit formula value changed
//    				viewer._signal = dojo.aspect.after(viewer, 'ontouchend', moveCallback, true);
    			} else
    				viewer._signal = dojo.aspect.after(viewer, 'onMoveStop', moveCallback, true);
    			viewer.enableMover();
    		}
    		else
    		{
    			viewer.disableMover();
    		}
    		viewer._isNameRange = isNameRange;
        	return viewer;
    	}
    },
    
    /**
     * given parsedRef is 3D reference, but it might be invalid, such as sheet name does not exist
     * then we should treat such 3D reference as ":" operator token tree
     * and split it into two ranges, one is name range, another is reference
     * @param parsedRef
     * @param token
     * @param index
     */
    _check3DRef: function(token)
    {
    	var parsedRef = token.value;
    	var text = token.text;
    	var index = token.start;
    	var doc = this.editor.getDocumentObj();
    	var startSheet = doc.getSheet(parsedRef.sheetName);
		var endSheet = doc.getSheet(parsedRef.endSheetName);
		if(startSheet && endSheet) {
			if(startSheet.getIndex() > endSheet.getIndex()) {
				var sn = parsedRef.sheetName;
				parsedRef.sheetName = parsedRef.endSheetName;
				parsedRef.endSheetName = sn;
			}
			return [token];
		} else {
			if(text.indexOf("'") != -1) {
				// if 3D reference contains "'", and sheet name is not exist
				// such as 'Sheet1:Sheet 2'!A1, but Sheet1 or Sheet 2 do not exist
				// we should not split them into two ref
				return null;
			}
			// invalid 3D reference
			// split 3D reference to two ranges
			var name = parsedRef.sheetName;
			var nameToken = {text: name, value: name, start: index, end: index + name.length};
			
			var pr = parsedRef.copy();
			pr.sheetName = pr.endSheetName;
			pr.endSheetName = null;
			var refToken = {text: text.slice(name.length + 1),value: pr, start: nameToken.start + name.length + 1};
			return [nameToken, refToken];
		}
    },
    /**
	 * Give a closure contains a "highlight object",
	 * 1.	A highlight object is a "range" or some object with a "_getRangeInfo" function,
	 * thus the highlight object can return the "{sheetName, startRow, startCol, endRow, endCol}" with the call of it's "_getRangeInfo".
	 * 2.	The closure object also may also has a "token" and a "index" property, this is used if we need to set back changes when the highlight
	 * viewer is moved or resized after it's shown out.
	 */
	_generateHighlight: function(parsedRef, token, index)
	{
		var constant = websheet.Constant;
		var sheet = parsedRef.sheetName || this.controller.getInlineEditor().getEditSheet() || this.editor.getCurrentGrid().getSheetName();
		var endSheet = parsedRef.endSheetName;
		var selectType = null, startRow = endRow = startCol = endCol = 0;
		var type = parsedRef.getType();
		
		if(type == constant.RangeType.RANGE)
		{
			selectType = constant.Range; startRow = parsedRef.startRow; endRow = parsedRef.endRow; 
			startCol = parsedRef.startCol;
			endCol = parsedRef.endCol;
		}
		else if(type == constant.RangeType.CELL)
		{
			selectType = constant.Cell;
			startRow = endRow = parsedRef.startRow;
			startCol = endCol =  parsedRef.startCol;
		}
		else if(type == constant.RangeType.COLUMN)
		{
			selectType = constant.Column;
			startRow = 1, endRow = this.editor.getMaxRow();
			startCol = parsedRef.startCol;
			endCol = parsedRef.endCol;
		}
		else if(type == constant.RangeType.ROW)
		{
			selectType = constant.Row;
			startCol = 1, endCol = constant.MaxColumnIndex;
			startRow = parsedRef.startRow; endRow = parsedRef.endRow; 
		}
		else
		{
			startRow = endRow = starCol = endCol = -1;
		}
		var range = {}, obj = {};
		range.sheetName = sheet;
		range.endSheetName = endSheet;
		range.startRow = startRow, range.startCol = startCol;
		range.endRow	= endRow, range.endCol = endCol,
		range.selectType = selectType;
		range.getType = function(){
			return type;
		}
		range._getRangeInfo = function(){
			return {
				sheetName : this.sheetName,
				endSheetName: this.endSheetName,
				startRow : this.startRow,
				endRow : this.endRow,
				startCol : this.startCol,
				endCol	: this.endCol
			};
		};
		obj.token = token, obj.index = index, obj.range = range;
		return obj;
	},
    
    _getHighlightsByTokens: function(tokens)
	{
		if(!tokens)	return null;
		var highlights = [], _hl, lexer = this.lexer;
		var doc = this.editor.getDocumentObj();
		var areaManager = doc.getAreaManager();
		for(var idx = 0; idx < tokens.length; idx ++)
		{
			var token = tokens[idx];
			if(token.error)
				break;
			
			if(token.type == lexer.TOKEN_TYPE.REFERENCE_TYPE){
				if(token.value.is3D()) {
					var ranges = this._check3DRef(token);
					if(ranges == null)
						// invalid 3D ref, error
						break;
					else if(ranges.length == 1) {
						// 3D reference
						highlights.push(this._generateHighlight(token.value, token.text, token.start));
					} else if(ranges.length == 2) {
						// 3D reference has been split to two ranges
						var nameToken = ranges[0];
						var nameRef = areaManager.getRangeByUsage(nameToken.text, websheet.Constant.RangeUsage.NAME);
						if(nameRef)
							highlights.push({range: nameRef, index: nameToken.start, token: nameToken.text, nameRange: true});
						var refToken = ranges[1];
						highlights.push(this._generateHighlight(refToken.value, refToken.text, refToken.start));
					}
				} else {
					highlights.push(this._generateHighlight(token.value, token.text, token.start));
				}
			} else if(token.type == lexer.TOKEN_TYPE.NAME_TYPE){
				if(token.subType == lexer.TOKEN_SUBTYPE.NAME_INVALID)
					break;
				var	ref = areaManager.getRangeByUsage(token.text, websheet.Constant.RangeUsage.NAME);
				if(ref)
					highlights.push({range: ref, index: token.start, token: token.text, nameRange: true});
			}
		}
		return highlights;
	},
    
    _getViewerInGrid: function(grid)
    {
    	//Since only one grid can be active, we can assume that current allocated viewers
    	return this.viewerCache.getAllocated();
    },
    
    _getGridBySheetName: function(sheetName)
    {
    	return this.controller.getGrid(sheetName);
    },
    
    _showViewer: function()
    {
    	//We should highlight range when editing formula cell
    	var grid = this._currentGrid();
    	if(grid)
    	{
    		var bShow = grid.isEditingFormulaCell();
    		//Or some other cases
    		return bShow;
    	}
    },
    
    _updateViewer: function(viewer)
    {
    }
    
});