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
dojo.provide("websheet.widget.InlineEditorMixin");
dojo.require("dojo.colors");
/**
 * Components :	
 * 1. In-line editor's position, boundary, style support.
 * 2. In-line editor's co-editing support.
 */
dojo.declare("websheet.widget._EditorStylePositionMixin", null,
{

    DEFAULT_HEIGHT : "17px",
    DEFAULT_WIDTH  : "80px",
	
    _rowIndex	:	null,	// 0 based row index,
    _colIndex	:	null,	// 1 based column index,
    _cellHeight	:	null,
    _cellWidth	:	null,
    
    _absLeft	:	null,	// actual position left,
    _absTop		:	null,
    _absRight	:	null,
    
    _left		:	null,
    _top		:	null,
    
    _maxWidth	:	null,
    _maxWidthR	:	null,	// used in right-align scenario
    _maxHeight	:	null,
    
    _fontInfo	:	null,
    
    constructor: function()
    {
    	this._fontString = "";
    	this.engine = websheet.grid.LayoutEngine.getInstance();
    },
    
    reset: function ()
    {
        this._editColIndex = this._editRowIndex = -1;
        this._left = this._top = 0;
        this._cellHeight = this._cellWidth = 0;
        this._maxWidth = this._maxWidthR = 0;
        this.adjustWidth(0);
        this.adjustHeight(0);
    },
    
    normalizeColor: function (color)
    {
        if (color === 'transparent')
            color = "";
        else
        {
            var _color = dojo.colorFromRgb(color);
            if (_color && _color.r == 0 && _color.g == 0 && _color.b == 0 && _color.a == 0)
                color = "";
        }
        return color;
    },

    attachCellStyle: function (editRow, editCol) {
    	var sheetName = this.grid.sheetName;
    	var docObj = websheet.model.ModelHelper.getDocumentObj();
    	var sheet = docObj.getSheet(sheetName);
    	var cellModel = sheet.getCell(editRow + 1, editCol, websheet.Constant.CellType.MIXED, true);
    	
    	var v = cellModel ? cellModel.getRawValue() : "";
    	var isString = false;
    	var isBoolean = false;
    	var isError = false;
    	var isFormula = false;
    	if (cellModel)
    	{
    		isFormula = cellModel.isFormula();
    		isString = cellModel.isString();
    		isBoolean = cellModel.isBoolean();
    		isError = cellModel.isError();
    	}
    	
    	var colModel = sheet.getColumn(editCol, true);
    	
    	var styleManager = docObj._styleManager;
    	var styleId = (cellModel ? cellModel._styleId : null) || (colModel ? colModel._styleId : null);
    	var style = styleId ? styleManager.styleMap[styleId] : websheet.style.DefaultStyleCode;
    	var attrs = styleManager.getUIAttrs(style);
    	
    	// check whether it's either one "TEXT" number format cell or one formula cell that has internal "TEXT" format
    	var styleConst = websheet.Constant.Style;
    	if (attrs[styleConst.FORMATTYPE] == "text") {
    		isString = true;
    	}
    	
    	var textAlign = attrs[styleConst.TEXT_ALIGN];
    	var modelDirection = attrs[styleConst.DIRECTION];
    	var resolvedDirection = (BidiUtils.isBidiOn() && !modelDirection && isString) ? (BidiUtils.isTextRtl(v) ? "rtl" : "ltr") : null;
    	if (textAlign == null || textAlign.length == 0) {
    		if (!cellModel || isFormula)
    		{
    			textAlign = "left";
    		}
    		else if (isBoolean || isError)
    		{
    			textAlign = "center";
    		}
    		else if (!isString)
    		{
    			textAlign = "right";
    		}
    		else {
    			// fallback to "left" if no other options
    			textAlign = "left";
    		}
    		/* model direction is "rtl" or (BidiOn and string value and Contextual direction resolvs to "rtl" )*/
    		if(modelDirection === "rtl" || resolvedDirection === "rtl")
    			textAlign = "right";
    	}
    	//
		var bgColor = this.normalizeColor(attrs[styleConst.BACKGROUND_COLOR] || "");
		var fontFamily = websheet.Utils.fontFallback(attrs[styleConst.FONTNAME]);
		var fontSize = style.getFontStyle().size + "px";
		var fontColor = attrs[styleConst.COLOR] || "rgb(0, 0, 0)";
		var fontWeight = attrs[styleConst.BOLD] ? "bold" : "normal";
		var fontStyle = attrs[styleConst.ITALIC] ? "italic" : "normal";
		var underline = attrs[styleConst.UNDERLINE];
		var strikethrough = attrs[styleConst.STRIKETHROUGH];
		var textDecoration = underline ? strikethrough ? "underline line-through" : "underline" : strikethrough ? "line-through" : "none";
        /* use 'dir' attribute when direction style is set explicitly (present in model) */
        /* and 'direction' style otherwise (default contextual behavior) to tell between these 2 cases */
        if (modelDirection) {
        	dojo.style(this.inputBox, "direction", "");
        	this.inputBox.setAttribute('dir', modelDirection);
        } else if (resolvedDirection) {
        	dojo.style(this.inputBox, "direction", resolvedDirection);
        	this.inputBox.removeAttribute('dir');
        }
        this._fontString = style.getFontStyle().fontString;
        dojo.style(this.inputBox, {'color' : fontColor, 'fontFamily' : fontFamily, 'fontStyle' : fontStyle, 'fontSize' : fontSize,
        	'fontWeight' : fontWeight, 'backgroundColor' : bgColor, 'textAlign' : textAlign, textDecoration : textDecoration});
        if (dojo.isWebKit)
        {
            if (textAlign == "right")
                dojo.style(this.inputBox, "whiteSpace", "pre");
            else
                dojo.style(this.inputBox, "whiteSpace", "");
        }
    },

    adjustPositionToCell: function (rowIndex, colIndex)
    {
    	var geometry = this.editGrid.geometry;
    	var cellBox = geometry.getCellPosition(rowIndex, colIndex, true);
    	if(this.editGrid.isMirrored) {
    		cellBox.l = geometry.getGridWidth() - cellBox.l - cellBox.w;
    	}
    	var merge = this.editGrid.cellMergeInfo(rowIndex, colIndex);
    	if (merge) {
    		cellBox.w = geometry.colWidth(colIndex, colIndex + merge.colSpan - 1);
    		cellBox.h = geometry.quickRowHeight(rowIndex, rowIndex + merge.rowSpan -1);
    	} else {
    		cellBox.w = geometry.colWidth(colIndex);
    		cellBox.h = geometry.quickRowHeight(rowIndex);
    	}
    	cellBox.l += this.editGrid.contentViewRect.left;
    	cellBox.t += this.editGrid.contentViewRect.top;
//    	var paddingLeft = dojo.style(cell, "paddingLeft");
//    	var paddingRight = dojo.style(cell, "paddingRight");
    	var paddingLeft = paddingRight = 2;
    	this._cellHeight = cellBox.h; // with padding, but not border.
    	this._cellWidth = cellBox.w + paddingLeft + paddingRight - 3 * 2; // with padding, but not border.
    	this._editColIndex = colIndex;
    	this._editRowIndex = rowIndex;
    	this.adjustPosition(cellBox.l, cellBox.t);
    	this.adjustWidth(this._cellWidth);
    	this.adjustHeight(this._cellHeight);
    },
    
    adjustPosition: function (x, y, notAdjustBoundary)
    {
    	if(!this.grid.contentViewRect)
    		this.grid.setGridDomRect();
        this._absLeft = parseFloat(x);
        this._absTop = parseFloat(y);

        this._left = (this._absLeft - parseFloat(this.grid.contentLeftEdge));
        this._top = (this._absTop - parseFloat(this.grid.contentTopEdge));

        var maxWidth = this.getMaxWidth();

        var oldW = this._cellWidth = Math.min(maxWidth, this._cellWidth);

        var oldL = parseInt(this._left);
        this._maxWidthR = oldL + oldW - 1;

        this.inputBox.style.zIndex = "";

        if (this._cellWidth <= 0 || this._cellHeight <= 0)
        {
        	return dojo.style(this.inputBox, {
        		zIndex : '-500',
        		left	: '0px',
        		top		: '0px',
        		width	: '0px',
        		height	: '0px'
        	});
        }

        this.inputBox.style.left = (this._absLeft - 1) +"px";
        this.inputBox.style.top = (this._absTop - 1) + "px";

        if (this.isRightAlign() && !notAdjustBoundary)
        {
            this.adjustBoundary();
        }
    },
    
    adjustWidth: function (width)
    {
        width = parseFloat(width);
        var alignRight = this.isRightAlign();
        if (width > 0 && !alignRight)
        {
            if (!this._maxWidth)
            {
            	if(!this.grid.gridRect)
            		this.grid.setGridDomRect();
				var client_right = this.grid.gridRect.left + this.grid.boxSizing.w;
                var box_right = this._absLeft + width;
                if (box_right > client_right)
                { //touch screen boundary
                    width = client_right - this._absLeft - 9; //fixed width, cut padding, border
                    this._maxWidth = width;
                    if (this._maxWidth < 0)
                        this._maxWidth = 0;
                }
            }
            else
            {
                width = this._maxWidth;
            }
        }

        if (width > 0 && alignRight)
        {
            if (width > this._maxWidthR)
            {
                width = this._maxWidthR;
            }
        }

        if (width >= 0)
        {
        	dojo.contentBox(this.inputBox,{w: width});
            if (!alignRight)
                return;
            var oldW = this._cellWidth;
            var oldL = parseInt(this._absLeft);
            var offset = width - oldW;
            var newL = oldL - offset;
            this.inputBox.style.left = newL + "px";
            if(offset != 0)
            	this.updateCellIndicator(true);
        }
        else if (alignRight)
        {
            this.inputBox.style.left = this._absLeft + "px";
        }
    },
    
    adjustHeight: function (height)
    {
        height = parseFloat(height);
        if (height > 0)
        {
            var bottom = this.grid.contentViewRect.bottom - 2;
            if (this._absTop + height > bottom)
            {
                height = bottom - this._absTop;
            }
        }
        if (height < 0)
            height = 0;
        this.inputBox.style.height = height + "px";
    },

    /**
     * Adjust the width or height automatically according with the string width and line number.
     *
     */
    adjustBoundary: function ()
    {
        if (this._cellWidth <= 0 || this._cellHeight <= 0)
        {
            return;
        }
        // set value to hide div, add a 'W' to make one more char wider for input.
        var value = this.getValue();

        this.inputBox.style.height = '0px';
        var contentWidth = this.getContentWidth(value + "W"/*, this._fontInfo*/);
        // why +4, for word-wrap.
        var maxwidth = Math.max(contentWidth + 4, this._cellWidth);
        this.adjustWidth(maxwidth);
        var tn = this.inputBox;

        var hasScrollBar = false;
        if (tn.offsetWidth > tn.clientWidth + 10)
        {
            hasScrollBar = true;
            // has scrollbar.
            tn.style.overflowY = 'hidden';
        }
        var maxheight = value == "" ?  this._cellHeight : Math.max(tn.scrollHeight, this._cellHeight);
        
        if(dojo.isIE && value.length > 0 && value.replace(/\n/gm, '') == '')
        {
        	var count = (value.match(/\n/g) || []).length;
        	//With only '<br>'s in EditorBox DIV, 
        	//IE will not stretch the height for the new line unless there're other text characters, 
        	maxheight = Math.max(maxheight, parseInt(this._fontInfo.fontSize || 17) * (count + 1) + count);
        }
        if (hasScrollBar)
        // for IE, MUST use 'inherit'
            tn.style.overflowY = !dojo.isFF ? 'inherit' : '';

        this.adjustHeight(maxheight);

        if (!dojo.isFF)
        {
            if (tn.scrollHeight > tn.clientHeight)
            {
                tn.style.overflowY = '';
            }
        }
    },

    /**
     * Adjust the position when the cell is moved or the width/height is changed.
     * rowIndex: the index of row for the editable cell
     * colIndex: the index of column for the editable cell
     */
    normalizePosition: function (rowIndex, colIndex)
    {
        if (!this.isShow())
            return;
        if (rowIndex != undefined)
            this._editRowIndex = rowIndex;
        if (colIndex != undefined)
            this._editColIndex = colIndex;
        var cellInfo = websheet.Utils.getCoverCellInfo(this.grid.sheetName, this._editColIndex, this._editRowIndex + 1);
        if (cellInfo)
        {
            var cellNode = cellInfo.cell;
            if(cellInfo.col > this._editColIndex)
            	return this.updateCellIndicator(true);
            if (cellNode)
            {
                var cellPos = cellNode.getBoundingClientRect();
                var box = dojo.contentBox(cellNode);
                var paddingLeft = dojo.style(cellNode, "paddingLeft");
                var paddingRight = dojo.style(cellNode, "paddingRight");
                var height = box.h; // with padding, but not border.
                var width = box.w + paddingLeft + paddingRight - 3 * 2; // with padding, but not border.
                if (cellPos.left == 0 && cellPos.top == 0 &&
                    height <= 0 && width <= 0)
                {
                	this.updateCellIndicator(true);
                    return;
                }
                this.updateCellIndicator(true/*cellPos.left != this._absLeft || cellPos.top != this._absTop || this.editGrid != this.grid*/);
                this.show(false);
            }
            else
            {
            	this.updateCellIndicator(true);
            }
        }
    },

    getTextAreaContentWidth: function ()
    {
        return this.inputBox.offsetWidth - 10;
    },
    
    getMaxWidth: function ()
    {
        var maxWidth = this.grid.geometry.getGridWidth() - 6;
        return maxWidth;
    },
    
    getContentWidth: function(content)
    {
    	var pieces = content.split("\n");
    	var maxWidth = 0, pWidth = 0;
    	for(var i = 0; i < pieces.length; i++)
    	{
    		pWidth = this.engine.measureWidth(pieces[i], this._fontString);
    		if(pWidth > maxWidth)
    			maxWidth = pWidth;
    	}
    	return maxWidth;
    },

    isRightAlign: function ()
    {
        return this.inputBox.style.textAlign == "right";
    },

    onGridResize: function ()
    {
    	// Summary: If the current in-line editor can not be fully displayed with current content view rectangle, adjust it's position
    	if(!this._isEditing) return;
    	var g = this.grid, eg = this.editGrid;
    	if(!g.contentViewRect)	g.setGridDomRect();
    	var constraint = g.contentViewRect;
    	var box = dojo.marginBox(this.inputBox);
    	var sc = g.scroller;
    	var bAdjust = false;
    	var rowIndex = this._editRowIndex;
    	var colIndex = this._editColIndex;
    	if(box.l + box.w > constraint.right) {
    		colIndex = Math.max(1, parseInt((g.scroller.firstVisibleCol + g.scroller.lastVisibleCol)/2));
    		bAdjust = true;
    		
    	}
    	if (box.t + box.h > constraint.bottom){
    		rowIndex = Math.max(0, parseInt((sc.firstVisibleRow + sc.lastVisibleRow) / 2));
    		bAdjust = true;
    	}
    	if (bAdjust) {
	    	var cPos = g.geometry.getCellPosition(rowIndex, colIndex);
	    	this._maxWidth = 0;
	    	this.adjustPosition(cPos.l + constraint.left, cPos.t + constraint.top);
	        this.adjustBoundary();
    	}
    }
});

dojo.declare("websheet.widget._EditorMessageListener", websheet.listener.Listener, 
{
	DC		:	websheet.Constant.DataChange,	//data change (action type)
	OP		:	websheet.Constant.OPType,		//operation type(row, column, range, sheet ......)
	
	preCondition:function(event)
	{
		if (this.isEditing() && !this.isEditCellRemoved() && event._type == websheet.Constant.EventType.DataChange) {
			return true;
		}
		return false;
	},
	
	notify:function(caster, event, bNotModify)
	{
		var s = event._source;
		var action = s.action, type = s.refType, value = s.refValue;
		var dispatch, args = [];
		if(type == this.OP.SHEET)
		{
			dispatch = (action == this.DC.PREDELETE) ? 'DeleteSheet' : (action == this.DC.HIDE) ? 'HideSheet' : (action == this.DC.SET) ? (( value = s.newSheetName )&& "RenameSheet") : null;
			if(!dispatch) return;
			var sheet = this.getDocumentObj().getSheet(value); //value should be sheetName
			if(sheet)
				args.push(sheet);
		}
		else if(type == this.OP.ROW)
		{
			//value should be parsedRef
			dispatch = (action == this.DC.PREDELETE) ? 'DeleteRow' : (action == this.DC.PREINSERT) ? 'InsertRow' : null;
			if(!dispatch) return;	//we do not care show/hide rows
			var sheetName = value.sheetName, sIdx = value.startRow, eIdx = value.endRow;
			var sheet = this.getDocumentObj().getSheet(sheetName);
			if(sheet)
				args = [sheet, sIdx, eIdx];
		}
		else if(type == this.OP.COLUMN)
		{
			//value should be parsedRef
			dispatch = (action == this.DC.PREDELETE) ? 'DeleteCol' : (action == this.DC.PREINSERT) ? 'InsertCol' : null;
			if(!dispatch) return;	//neither show/hide columns
			var sheetName = value.sheetName, sIdx = value.startCol, eIdx = value.endCol;
			var sheet = this.getDocumentObj().getSheet(sheetName);
			if(sheet)
				args = [sheet, sIdx, eIdx];
		}
		else if(type == this.OP.RANGE)
		{
			dispatch = (action == this.DC.MERGE) ? 'Merge' : (action == this.DC.SORT) ? 'Sort' : null;
			if(!dispatch) return;
			var data = event._data;
			if(data.sortRange)
				args = [data.sortRange.sheetName, data.sortRange.startRow, data.sortRange.endRow, data.sortRange.startCol, data.sortRange.endCol, data.data];
			else
				args = [data.sheetName, data.sr, data.er, data.sc, data.ec];
		}
		if(args.length != 0 && ((dispatch = "_on" + dispatch) in this))
			this[dispatch].apply(this, args);
	}
});

dojo.declare("websheet.widget._cellIndicator", null, {
	
	domNode		:	null,	//cell indicator dom
	inlineEditor		:	null,	//inline-editor
	mover		:	null,	//movable object
	status		:	"",		//current status
	constructor: function(inlineEditor)
	{
		this.inlineEditor = inlineEditor;
		this.domNode = dojo.create('div', {'class' : 'edit-cell-indicator', style :{
        	display : 'none'
        }}, inlineEditor.inputBox, 'after');
		this.mover =  new dojo.dnd.move.constrainedMoveable(this.domNode, {
			constraints : dojo.hitch(this, function() {
				var pos = dojo.position(this.inlineEditor.grid.contentViews);
				var box = dojo.marginBox(this.inlineEditor.inputBox);
				boundary = {}, boundary.l = pos.x, boundary.t = pos.y,
				boundary.w = pos.w - box.w - 20, boundary.h = pos.h - box.h - 20;
				return boundary;
		})});
		this.inlineEditor._connects.push(dojo.connect(this.mover, 'onMoveStart', dojo.hitch(this, this._startMoving)));
		this.inlineEditor._connects.push(dojo.connect(this.mover, 'onMove', dojo.hitch(this, this._moving)));
		this.inlineEditor._connects.push(dojo.connect(this.mover, 'onMoveStop', dojo.hitch(this, this._stopMoving)));
	},
	
	destroy: function(){},
	glowing: function()
	{
		var _color = this.inlineEditor.isEditCellRemoved() ? '#FF0000' : '#000000';
		dojo.animateProperty({
			node : this.inlineEditor.inputBox,
			duration : 1000,
			rate: 50,
			properties: { _count : { start : 1, end : 11, units : ''} },
			onAnimate : function(n)
			{
				var x = parseFloat(n._count);
				var y = (-1 * x * x * 0.45 + 5.95 * x - 3.5);
				var shadow = '0 0 ' + y + 'px ' + _color;
				dojo.style(this.node, 'boxShadow', shadow);
			},
			onEnd : function()
			{
				this.node.style.boxShadow = '';
			}
		}).play();
		return false;
	},
	
	hide: function()
	{
		dojo.style(this.domNode, 'display', 'none');
	},
	
	show: function()
	{
		this.domNode.style.display = '';
	},
	
	setPosition: function(left, top)
	{
		this.domNode.style.top = top;
		this.domNode.style.left = left;
	},
	
	setAddress: function(addr)
	{
		this.domNode.textContent = addr;
	},
	
	_moving: function(drag)
	{
		var position = dojo.position(drag.node);
		this.inlineEditor.adjustPosition(position.x, position.y + 17, true);
	},
	
	_startMoving: function(drag)
	{
		this._updateCursor(true);
		var content = dojo.contentBox(this.inlineEditor.inputBox);
		this.inlineEditor._cellWidth = content.w;
	},
	
	_stopMoving: function(drag)
	{
		this._updateCursor(false);
	},
	
	_updateCursor: function(moving)
    {
    	var node = this.domNode;
    	if(dojo.isFF)
			node.style.cursor = moving ? "-moz-grabbing" : "-moz-grab";
		else if(dojo.isWebKit)
			node.style.cursor = moving ? "-webkit-grabbing" : "-webkit-grab";
    }
});
