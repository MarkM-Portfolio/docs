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

dojo.provide("websheet.widget._Rectangle");
dojo.require("concord.util.browser");

dojo.declare("websheet.widget._Rectangle", [dijit._Widget, dijit._Templated], {
	//summary: 
	//		Selection rectangles are mainly used in range selection and range highlighting.
	"class"				:	"websheetSelection",
	baseClass			:	"",
	mouseEvents			:	['mouseover', 'mousemove', 'mouseout', 'mousedown', 'mousewheel', 'mouseup', 'click', 'dblclick', 'contextmenu'],
	templateString		:	"<div dojoAttachPoint='containerNode'>" +
								"<div class='rectangle-border top-draghandle' dojoAttachPoint='rbt, rangeBorderTop'></div>" +
								"<div class='rectangle-border right-draghandle' dojoAttachPoint='rbr, rangeBorderRight'></div>" +
								"<div class='rectangle-border bottom-draghandle' dojoAttachPoint='rbb, rangeBorderBottom'></div>" +
								"<div class='rectangle-border left-draghandle' dojoAttachPoint='rbl, rangeBorderLeft'></div>"+
							"</div>",
							
	_startRowIndex		: 	0,			//range start row index, 0 based,
	_startColIndex		:	1, 			//range start column index, 1 based.
	_endRowIndex		:	0, 			//range end row index, 0 based,
	_endColIndex		:	1, 			//range end column index

	_borderWidth		:	2,			//in pixels
	_borderStyle		:	null,		//customized border style
	_borderColor		:	'#0B67FF',	//can be customized
	
	_marginBox			:	null,		//a cached margin box object of current rectangle node, cached & updated when 'render' is called.
	
										//selection type can be, Cell|Column/ColumnRange|Row/Range|Range
	_selectType			:	websheet.Constant.Cell,
	
	_isHidden			:	true,		//boolean, hidden status flag 
	_expand				:	null,		//boolean, this flag control the render behavior of the rectangle, when set 'true', expended the range before render.
	
	_preciseMode		:	null,		//Current MODE, default to be falsy, see quickly()/precisely() for more details 
	
	_sleeping			:	false,		//events are handled in a different way while sleeping, dispatch to data grid
	_hibernating		:	true,		//no events will be handled when hibernating
	
	grid				:	null,		//data grid
	isMoveable			:	true,		//if the rectangle is moveable, default to be true.
	mover				:	null,		//data structure used when drag & drop
	
	postCreate: function()
	{
		//some initialize work
		(this.grid == null) && (this.grid = websheet.model.ModelHelper.getEditor().getCurrentGrid());
		this.placeAt(this.grid.contentViews);
		this._initialize();
	},
	
	destroy: function()
	{
		this.inherited(arguments);
		this.mover.destroy();
	},
	
	/*Object*/disableMover: function()
	{
		// summary:
		//		Disable the drag & drop functionality.
		// returns:
		//		Self.
		dojo.NodeList([this.rbt, this.rbr, this.rbb, this.rbl]).style('cursor', 'default');
		return ((this.isMoveable = false) || this);
	},
	
	/*Object*/enableMover: function()
	{
		// summary:
		//		Restore the drag & drop functionality.
		// returns:
		//		Self
		dojo.NodeList([this.rbt, this.rbr, this.rbb, this.rbl]).style('cursor', '');
		return ((this.isMoveable = true) && this);
	},
	
	/***************************************************Render***************************************************/
	/*Object*/expand: function()
	{
		//summary:
		//		This flag control the renderSelection behavior, when set true, renderSelection will first expand current range and then render the selection area.
		//Example:
		//	|	//expand current range and render the expanded rectangle by doing this
		//	|	rectangle.expand().render();
		return ((this._expand = true) && this);
	},
	
	/*Object*/fixed: function()
	{
		//summary:
		//		This flag control the renderSelection behavior, fixed() give a counteraction against expand().
		//Example:
		//	|	//directly render current range
		//	|	rectangle.notexpand().render();
		return ((this._expand = false) || this);
	},
	
	/*void*/glowing: function (color)
	{
		//summary:
		//		Animation effect on border nodes;
		//color:
		//		RGB color in string, example "#FF00FF";
		var _color = color || this._borderColor;
		dojo.animateProperty({
			node : this.containerNode,
			duration : 1000,
			rate: 50,
			properties: { _count : { start : 1, end : 12, units : ''} },
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
	
	/*Object*/getExpandedRangeInfo: function()
	{
		// summary:
		//		Return the expanded 'rangeInfo', see 'getRangeInfo' for more details
		// returns;
		//		same pattern with 'getRangeInfo'.
		return websheet.Utils.getExpandRangeInfo(this.getRangeInfo());
	},
	
	/*Object*/getRangeInfo: function()
	{
		//summary:
		//		Get the 'range object' based on current status, the range object contains four indexes and the sheet name.
		//		The internal 0-based row indexes will be transformed to 1-based indexes.
		//		Normalize the start/end indexes if start index > end index.
		//returns:
		//		{sheetName: string, startRow: 1-based number, endRow: 1-based number, startCol: 1, endCol:1}
		var rangeInfo = {};
		var startRow = this._startRowIndex;
		var endRow = this._endRowIndex;
		var startCol = this._startColIndex;
		var endCol = this._endColIndex;
		if(startRow > endRow)
		{
			var index = endRow; endRow = startRow; startRow = index;
		}
		if(startCol > endCol)
		{
			var index = endCol; endCol = startCol; startCol = index;
		}
		rangeInfo.startRow = startRow + 1;
		rangeInfo.startCol = startCol;
		rangeInfo.endRow = endRow + 1;
		rangeInfo.endCol = endCol;
		rangeInfo.sheetName = this.grid.sheetName;
		return rangeInfo;
	},
	
	/*String*/getSelectedRangeAddress: function(noSheetName, bSimple, absolute, endSheet, bExpand)
	{
		// summary:
		//		Return the reference address of the selected rectangle.
		//	noSheetName:	boolean
		//		with or without sheet name
		//	bSimple:		boolean
		//		Sheet1!A1 is simple, while Sheet1!A1:A1 is not.
		//	absolute:		boolean
		//		if it's an absolute address, like "Sheet1!$A1"
		//	endSheet:		boolean
		//		with or without end sheet name
		//  bExpand:		boolean
		//		expand the range or not when get address.
		// returns:
		//		Range reference in string.
		var address = null;
		if( (this._startRowIndex > -1) && (this._startColIndex > -1) && (this._endRowIndex > -1) && (this._endColIndex > -1))
		{
			var rangeInfo = bExpand ? websheet.Utils.getExpandRangeInfo(this.getRangeInfo()) : this.getRangeInfo();
			if(rangeInfo.endCol > websheet.Constant.MaxColumnIndex)
				rangeInfo.endCol = websheet.Constant.MaxColumnIndex;
			var startRowIndex = rangeInfo.startRow, endRowIndex = rangeInfo.endRow, 
				startColIndex = rangeInfo.startCol, endColIndex = rangeInfo.endCol;
			var constant = websheet.Constant;
			var bRow = this._selectType == constant.Row || this._selectType == constant.RowRange;
			var bCol = this._selectType == constant.Column || this._selectType == constant.ColumnRange;
			
			var params = {
					refMask: bRow ? (websheet.Constant.ROWS_MASK) : 
						(bCol ? websheet.Constant.COLS_MASK : 
							((bSimple && this.selectingCell()) ? websheet.Constant.CELL_MASK : websheet.Constant.RANGE_MASK))
			};
			var sheetName = noSheetName ? null : this.grid.sheetName;
			return websheet.Helper.getAddressByIndex(sheetName, startRowIndex, startColIndex, endSheet, endRowIndex, endColIndex, params);
		}
	},
	
	/*Number*/getSelectType: function()
	{
		// summary:
		//		In case you want the _selectType directly, suggest to use 'selectingXYZ' to make your choice.
		return this._selectType;
	},
	
	/*Object*/hibernate: function()
	{
		// summary:
		//		No rendering, no events are handled while hibernating.
		// returns:
		//		Self
		return ((this._hibernating = true) && this);
	},
	
	/*Boolean*/hibernating: function()
	{
		// summary:
		//		Getter method for the hibernating status.
		return this._hibernating;
	},
	
	/*Object*/hide: function()
	{
		//summary:
		//		Hide the rectangle by hiding it's container node.
		// returns:
		//		Reference to self to make a call chain.
		this.containerNode.style.display = 'none';
		return ((this._isHidden = true) && this);
	},
	
	/*Boolean*/isShow: function()
	{
		//summary:
		//		Return the show/hide status.
		return !this._isHidden;
	},
	
	moveScrollingStart: function(direction, args)
	{
		// summary:
		//		Scroll the data grid by the given direction, automatically and continuously scroll until 'stopAutoScroll' is called.
		// direction:
		//		Defiend in websheet.Constant.DIRECTION, they are 'up', 'down', 'left', 'right'
		// args:
		//		should be [mover, leftTop] gotten from dnd.Moveable when moving, they are used to calculate the new destination for the mover after grid scrolled.
		var ret = this.grid.scrollByDirection(direction);
		if(!ret){
			this.moveScrollingStop();
			return;
		}
		this._moveScrollTimer = setTimeout(dojo.hitch(this, this.moveScrollingStart,direction, args),50);
		if(this.mover.isMoving && args)
		{
			this._rangeDecoration.apply(this, args);
		}
	},
	
	moveScrollingStop: function()
	{
		//	summary:
		//		Stop scrolling the grid by calling this.
		if(this._moveScrollTimer)
		{
			clearTimeout(this._moveScrollTimer);
			this._moveScrollTimer = null;
		}
	},
	
	/***************************************************Events***************************************************/
	onupdateui: function(e)
	{
		// summary: 
		//		Connect to the updateUI of the data grid, 
		//		By default, need to re-render the selection when grid is updated.
		if(!this._hibernating && e.grid == this.grid)
		{
			if(this._isHidden)
				return this.show().render();
			return this.render();
		}
	},
	
	onmouseover: function(e)
	{
		// summary:
		//		Mouse over the container node of the rectangle (and together with the four drag handle div node).
		//		Prefer 'mouse move' event, since the mouse over triggering frequency is far more less than 'mouse move'.
		//		Besides data grid have no idea about this 'over' target, need to decorate the event before use.
		//		default do nothing.
		if((!this.isMoveable || !this.mover.isMoving))
		{
			if(this._decorateEvent(e))
				this.grid.onCellMouseOver(e);
		}
	},
	
	onmousemove: function(e)
	{
		// summary:
		//		Mouse move for container node of the rectangle, by default we intend to decorate it as a 'mose over cell event' and 
		//		dispatch this event to data grid's 'onCellMouseOver' handler.
		if(e.target == this.containerNode && (!this.isMoveable || !this.mover.isMoving))
		{
			if(this._decorateEvent(e))
				this.grid.onCellMouseOver(e);
		}
	},
	
	onmouseout: function(e)
	{
		// summary:
		//		Mouse out the container node( and the four drag handle div node) of the rectangle.
		//		Default do nothing
	},
	
	onmousedown: function(e)
	{
		// summary:
		//		Mouse down on the container node of the rectangle
		//		By default, we dispatch the mouse down event to data grid.
		//		If we're pressing the  mouse on the drag handlers, we handle the mouse down event here and starts the drag & move routine.
		
		if(!dojo.mouseButtons.isLeft(e))
			return;
		var target = e.target;
		if(this.isMoveable && (target == this.rbt || target == this.rbr || target == this.rbb || target == this.rbl))
		{
			//mouse down on border drag-handle, start a drag and move here,
			var box = dojo.marginBox(this.containerNode);
			dojo.style(this.mover.node, {
				left	:	box.l + 'px',
				top		:	box.t + 'px',
				width	:	box.w - 4 + 'px',
				height	:	box.h - 4 + 'px',
				display	:	''
			});
			this.mover.onMouseDown(e);
		}
		else if(!this.isMoveable || !this.mover.isMoving)
		{
			//else dispatch to data grid
			if(this._decorateEvent(e))
				this.grid.onCellMouseDown(e);
		}
	},
	
	onmouseup: function(e)
	{
		// summary:
		//		Mouse Up on container node or the four drag handle div node.
		if(this._moveScrollTimer)
			this.moveScrollingStop();
	},
	
	onclick: function(e)
	{
		// summary:
		//		Click on the container node of the rectangle.
		//		default do nothing
	},
	
	ondblclick: function(e)
	{
		// summary:
		//		Double click on the container node of the rectangle.
		//		default do noting
	},
	
	oncontextmenu: function(e)
	{
		// summary:
		//		Right click on container ndoe to trigger the context menu, custmize context menu here if necessary.
		//		default do nothing.
	},
	
	onMoveStart: function(mover)
	{
		//summary:
		//		Set boundaries for the mover, recording it's initial state with row/col and calculate the delta.
		//	_ _ _ _ _ _ _ _ _ _ _ __ _ _ _ _ _topEdge(0)_ _ _  _  _ _ _ _ _ _ _ _ _ _ _ _ _ _ 
		//	|					|															|
		//	|					|															|
		//	|leftEdge(0)		|xFreezeEdge												|rightEdge
		//	|					|															|
		//	|_ _ _ _ _ _ _ _ _ _|_ __ _ _ _ _yFreezeEdge _ _ _  _  _ _ _ _ _ _ _ _ _ _ _ _ _|
		//	|					|															|
		//	|					|															|		
		//	|					|															|
		//	| _ _ _ _ _ _ _ _ _ |_ __ _ _ _ _ bottomEdge _ _ _ _  _  _ _ _ _ _ _ _ _ _ _ _ _|_ 
		if(this.selectingSheet() || !this.isMoveable)
			return;
		mover.self = this;
		var range = this.getRangeInfo();
		mover.locating = 'range';
		if(this.selectingCell())
		{
			// expand range if selecting a cell, if it's a covered cell, we will move it as a range.
			range =  websheet.Utils.getExpandRangeInfo(range);
		}
		else if(this.selectingRows())
		{
			mover.locating = 'row';
		}
		else if(this.selectingColumns())
		{
			mover.locating = 'column';
		}
		dojo.addClass(dojo.body(), 'rectangle-moving');
		mover.oldRange = range;
		mover.row = mover.current_row = range.startRow;
		mover.col = mover.current_col = range.startCol;
		mover.current_row -= 1;
		mover.rowDelta = range.endRow - range.startRow;
		mover.colDelta = range.endCol - range.startCol;
		mover.contentBox = this._getContentBox();
//		mover.xFreezed = this.grid.freezeCol > 0;
//		mover.yFreezed = this.grid.freezeRow > 0;
		mover.maxCol = websheet.Constant.MaxColumnIndex;
		mover.maxRow = this.grid.editor.getMaxRow() - 1;
		this.mover.isMoving = true;
	},
	
	onMove: function(mover, leftTop, e)
	{
		// summary:
		//		When mover hit the boundaires(edge as figured bellow), the grid should scroll on the direction.
		this.mover.onMoving(mover, leftTop);
		var node = mover.node;
		var box = mover.contentBox;
		var direction = '';

		if (e.touches && e.touches.length === 2) {
		  return;
		}

		//more precisely mouse locating
		var grid = this.grid,
			x = e.pageX,
			y = e.pageY;
		
		if(mover.locating != 'row')
		{
			// can move left/right if it's not selecting a row or rowrange
			if(((!grid.isMirrored && x > box.left && x < box.xFreezeEdge) || x < box.left) && (grid.scroller.firstVisibleCol > (grid.freezeCol + 1) || /*FIXME*/grid.scroller.scrollLeft > 1) )
//			if(((!this.grid.isMirrored && mover.xFreezed && leftTop.l + box.left < box.xFreezeEdge) || (leftTop.l < 0)) && this.grid.lastScrollLeft > 1)
			{
				x = box.xFreezeEdge + 1;
				direction = websheet.Constant.DIRECTION.LEFT;
			}
			else if((this.grid.isMirrored && x > box.xFreezeEdge)
				 || (x > box.right))
			{
				direction = websheet.Constant.DIRECTION.RIGHT;
			}
		}
		if(mover.locating != 'column')
		{
			// can move up/down if it's not selecting a column or columnrange
			if( (y < box.top || y < box.yFreezeEdge) && (grid.scroller.firstVisibleRow > grid.freezeRow || /*FIXME*/grid.scroller.scrollTop > 1))
			{
				y = box.yFreezeEdge + 1;
				direction = websheet.Constant.DIRECTION.UP;
			}
			else if(leftTop.t + box.top > box.bottom)
			{
				direction = websheet.Constant.DIRECTION.DOWN;
			}
		}
		var location = grid.transformEvent(x, y);
		
		this._rangeDecoration(mover, location);
		
		var range = mover.range;
		if(range)
		{
			this.renderRectangle(range, node);
			dijit.showTooltip(mover.show, mover.node.firstChild, ["above-centered", "below-centered"]);
		}
		//scroll the grid if necessary
		if(direction != '' && !pe.scene.bMobileBrowser) // do not need scroll for mobile
		{
			if (!this._moveScrollTimer) {
				this.moveScrollingStart(direction, [mover, location]);
			}
		}
		else
		{
			this.moveScrollingStop();
		}
		this.mover.onMoved(mover, location);
	},
	
	onMoveStop: function(mover)
	{
		// summary:
		//		Move stopped, hide the temporary 'mover div node'and selet the new range.
		this.mover.isMoving = false;
		this.mover.node.style.display = 'none';
		dojo.removeClass(dojo.body(), 'rectangle-moving');
		dijit.hideTooltip(mover.node.firstChild);
		var range = mover.range;
		if (range) {
			
			if (mover.locating == "column") {
				this.selectColumn(range.startCol, range.endCol);
			} else if (mover.locating == "row") {
				this.selectRow(range.startRow - 1, range.endRow -1);
			} else {
				this.selectRange(range.startRow - 1, range.startCol, range.endRow - 1, range.endCol);
			}
		}
	},
	
	render: function()
	{
		// summary:
		//		Render out the rectangle itself.
		this.renderRectangle();
	},
	
	renderRectangle: function(range, node, params)
	{
		//summary:
		//		Render the rectangle based on current status, hide it if it's collapsed with 0 height or width.
		//		If parameters are given, will render the given node based on given range, the 'given range' should have the same pattern with object returned from "getRangeInfo".
		//range:		Object
		//		Should contains, "startRow", "startCol", "endRow", "endCol" at least.
		//		!!Important, the row indexes in range should be 1-based.
		//node:			DOM Node
		//		Render the given node, if it's not null
		//params:
		//		Control the custmized render behavior when it's not 'self renderring'.
		//returns:
		//		Return the margin box of the rendered node.
		//Example:
		//	|	//Normal usage, this will render the rectangle out.
		//	|	rectangle.renderRectangle()
		//	|	//You can pass your own node and range info, and call this to render the node on grid
		//	|	//For example, you can doing this:
		//	|	rectangle.renderRectangle(rangeInfo, domNode);
		if(this._startRowIndex < 0 || this._endRowIndex < 0 || this._startColIndex < 1 || this._endColIndex < 1)
			return;
		
		var r, selfRendering = (range == null || node == null);
		var n;
		if(!selfRendering)
		{
			r = range;
			n = node;
		}
		else
		{
			n = this.containerNode;
			r = this.getRangeInfo();
			(this._expand || this.selectingCell()) && (r = websheet.Utils.getExpandRangeInfo(r));
		}
		var left = 0, top = 0;
		var width = 0, height = 0;
		var rangeSize = this.getRangeSize(r);
		var borderWidth = params ? (params.borderWidth || this._borderWidth) : this._borderWidth;
		var borderWise = params ? params.borderWise : false;
		left = rangeSize.l;
		top = rangeSize.t;
		width = rangeSize.w;
		height = rangeSize.h;
		if((width <= 0 && !(rangeSize.leftBorderVisible && rangeSize.rightBorderVisible))
				|| (height <= 0 && !(rangeSize.topBorderVisible && rangeSize.bottomBorderVisible)))
		{
			//TODO: is it possible??
			
			//we will hide the node if it's not visible
			if(selfRendering)
			{
				this.hide();
			}
			else
			{
				n.style.display = 'none';
			}
		}
		else
		{
			// width or height == 0 means the selected columns/rows is hidden
			if (width > 0) {
				width -= borderWidth * 2;
			}
			if (height > 0) {
				height -= borderWidth * 2;
			}
			width = Math.max(0, width);
			height = Math.max(0, height);
			//update it's position and box model
			dojo.style(n, {left : left + 'px', top : top + 'px', width : width + 'px', height : height + 'px'});
			if(selfRendering)
			{
				(!this.isShow()) && (this.show());
				if(rangeSize.leftBorderVisible)
					n.style.borderLeftColor = this._borderColor;
				else
					n.style.borderLeftColor = 'transparent';
				if(rangeSize.rightBorderVisible)
					n.style.borderRightColor = this._borderColor;
				else
					n.style.borderRightColor = 'transparent';
				if(rangeSize.topBorderVisible)
					n.style.borderTopColor = this._borderColor;
				else
					n.style.borderTopColor = 'transparent';
				if(rangeSize.bottomBorderVisible)
					n.style.borderBottomColor = this._borderColor;
				else
					n.style.borderBottomColor = 'transparent';
			}
			else
			{
				n.style.display = '';
				if(borderWise){
					if(rangeSize.leftBorderVisible)
						n.style.borderLeftColor = null;
					else
						n.style.borderLeftColor = 'transparent';
					if(rangeSize.rightBorderVisible)
						n.style.borderRightColor = null;
					else
						n.style.borderRightColor = 'transparent';
					if(rangeSize.topBorderVisible)
						n.style.borderTopColor = null;
					else
						n.style.borderTopColor = 'transparent';
					if(rangeSize.bottomBorderVisible)
						n.style.borderBottomColor = null;
					else
						n.style.borderBottomColor = 'transparent';
				}
			}
		}
		// cached the margin box model
		if(selfRendering)
		{
			this._marginBox = rangeSize;
		}
		else if(params && params.marginBox)
		{
			params.marginBox = rangeSize;
		}
	},
	
	show: function()
	{
		//summary:
		//		Directly shown out the rectangle, if you want to re-render the rectangle based on its current status, use 'render()'
		// returns:
		//		Reference to self.
		this.containerNode.style.display = '';
		return ((this._isHidden = false) || this);
	},
	
	setBorderWidth: function(newWidth)
	{
		//summary:
		//		Set the border width for the rectangle, we have a this._borderWidth (2px) by default.
		//newWidth:		Number
		if(newWidth > -1)
		{
			this.containerNode.style.borderWidth = newWidth + 'px';
			var oldBordWidth = this._borderWidth;
			this._borderWidth = newWidth;
//			if(oldBordWidth > newWidth)
//				this.renderRectangle();
		}
		return this;
	},
	
	setBorderColor: function(newColor)
	{
		//summary:
		//		Set the border color for the rectangle.
		//newColr:		String, css string
		//Example:
		//	|	rectangle.setBorderColor('#6C6C6C');
		//	|	rectangle.setBorderColor('transparent');
		this.containerNode.style.borderColor = newColor;
		this._borderColor = newColor;
		if(this.isMoveable)
			this.mover.node.style.borderColor = newColor;
	},
	
	setBorderStyle: function(newStyle)
	{
		//summary:
		//		Set the border sytle for the rectangle,
		//newSyle:		String, css string
		//Example:
		//	|	rectangle.setBorderStyle('dashed');
		//	|	//other valid values are 'none', 'hidden', 'dotted', 'dashed', 'solid', 'double', 'groove', 'ridge', 'inset', 'outset'
		if(newStyle)
		{
			this.containerNode.style.borderStyle = newStyle;
			if(this.isMoveable)
				this.mover.node.style.borderStyle = newStyle;
		}
	},
	
	/***************************************************Selection Methods & Selection Status***************************************************/
	/*Object*/select: function(/*========rangeInfo===or===Rectangle======*//*......*/)
	{
		// summary:
		//		Smart selection, directly select the same range with the given parameter.
		// parameter:
		//		It can be a "Rectangle" object itself.
		//		It can be a "RangeInfo" object gotten from 'getRangeInfo' of "Rectangle".
		//		There may be a second parameter of boolean type, which indicates the 'skipRender'.
		// returns:
		//		Self.
		if(arguments.length > 0)
		{
			var p = arguments[0];
			if(p instanceof websheet.widget._Rectangle)
			{
				this._startRowIndex = p._startRowIndex;
				this._endRowIndex = p._endRowIndex;
				this._startColIndex = p._startColIndex;
				this._endColIndex = p._endColIndex;
				this._selectType = p._selectType;
				if (arguments[1] !== true) {
					this.render();
				}
				return this;
			}
			else if(p.startRow != null && p.endRow != null)
			{
				this._startRowIndex = p.startRow - 1;
				this._endRowIndex = p.endRow - 1;
				this._startColIndex = p.startCol;
				this._endColIndex = p.endCol;
				this._selectType = p.selectType || websheet.Constant.Range;
				if (arguments[1] !== true) {
					this.render();
				}
				return this;
			}
			else
			{
				throw "unknow parameter in select";
			}
		}
	},
	
	/*Object*/selectCell: function(/*0-based*/rowIndex, colIndex, skipRender)
	{
		//summary:
		//		Select a single cell, update index and internal selection type.
		//skipRender:	boolean
		//		If given true, directly return after attribute set, otherwise, re-render the selection with new status.
		//returns:
		//		Reference to self.
		//Example:
		//	|	//Normal usage, select the cell 'A1' and then render the selection
		//	|	rectangle.selectCell(0, 1);
		//	|	//select the cell 'B1' but do not render the selection, i may want to render out later 
		//	|	rectangle.selectCell(0, 2, true);
		//	|	//....after some steps, render the rectangle by doing this
		//	|	rectangle.render();
		this._endRowIndex = this._startRowIndex = rowIndex;
		this._endColIndex = this._startColIndex = colIndex;
		this._selectType = websheet.Constant.Cell;
		if(this.grid.editor.isMobile()){
			return this;
		}
		if(!skipRender)
		{
			//we expand the range for cell selection render to make it works on merge cell.
			this._expand = true;
			this.render();
			if(!this.grid.selection.isPickingRange() && this.grid.selection.isSelectingRange())
				dojo.publish("UserSelection",[{selector: this}]);
		}
		return this;
	},
	
	/*boolean*/selectingCell: function(row, col)
	{
		// summary: 
		//		Give the status whether the rectangle is currently selecting a single cell. If given a row and column index it will return whether it's selecting the
		//		given cell.
		// row:	number, 0-based
		// col:	number
		// Example:
		//	|	if(rectangle.selectingCell())
		//	|		console.info("i've no idea which cell it is, but it is selecting a cell now");
		//	|	if(rectangle.selectingCell(0, 1)
		//	|		console.info("definitely it's selecting a cell and it's selecting the cell 'A1'");
		if(arguments.length == 2)
		{
			return (this._selectType == websheet.Constant.Cell) && 
			(this._startRowIndex == row) && 
			(this._endRowIndex == row) &&
			(this._startColIndex == col) && 
			(this._endColIndex == col);
		}
		else
		{
			return (this._selectType == websheet.Constant.Cell);
		}
	},
	
	/*Object*/selectRow: function(startRow, endRow, skipRender)
	{
		// summary:
		//		Select the given row from start row index to end row index.
		// startRow:		Number	0-based
		// endRow:		Number	0-based, maybe null
		// skipRender:	boolean
		//		If given, directly return after index & select type update, by default we will
		// returns:
		//		Reference to self
		if(endRow == null)
			endRow = startRow;
		this._startRowIndex = startRow;
		this._endRowIndex = endRow;
		this._selectType = (startRow == endRow) ? websheet.Constant.Row : websheet.Constant.RowRange;
		this._startColIndex = 1;
		this._endColIndex = websheet.Constant.MaxColumnIndex;
		if(!skipRender)
		{
			this._expand = false;
			this.render();
		}
		if(!this.grid.selection.isPickingRange() && this.grid.selection.isSelectingRange())
			dojo.publish("UserSelection",[{selector: this}]);
		return this;
	},
	
	/*boolean*/selectingRow: function(rowIndex)
	{
		// summary:
		//		If it's currently selecting a row.
		// rowIndex:		Number 0-based, can be null
		if(rowIndex != null)
		{
			return 
				(this._selectType == websheet.Constant.Row) &&
				(this._startRowIndex == rowIndex) &&
				(this._endRowIndex == rowIndex);
		}
		else
		{
			return (this._selectType == websheet.Constant.Row);
		}
	},
	
	/*boolean*/selectingRows: function(/*boolean*/strictly)
	{
		// summary:
		//		Return if it's currently selecting a single row or rows.
		// strictly:	boolean
		//		If true, selecting a single row will return false.
		if(strictly)
			return this._selectType == websheet.Constant.RowRange;
		return (this._selectType == websheet.Constant.RowRange || this._selectType == websheet.Constant.Row);
	},
	
	/*Object*/selectColumn: function(startCol, endCol, skipRender)
	{
		// summary:
		//		Select the given column from start to end,
		// startCol:		Number
		// endCol:		Number, can be null
		// skipRender:	boolean
		//		If given, directly return after index & select type update, by default we will
		// returns:
		//		Reference to self.
		if(endCol == null)
			endCol = startCol;
		this._startColIndex = startCol;
		this._endColIndex = endCol;
		this._selectType = (startCol == endCol) ? websheet.Constant.Column : websheet.Constant.ColumnRange;
		this._startRowIndex = 0;
		this._endRowIndex = this.grid.editor.getMaxRow() - 1;
		if(!skipRender)
		{
			this._expand = false;
			this.render();
		}
		if(!this.grid.selection.isPickingRange() && this.grid.selection.isSelectingRange())
			dojo.publish("UserSelection",[{selector: this}]);
		return this;
	},
	
	/*boolean*/selectingColumn: function(col)
	{
		//summary:
		//		If it's currently selecting a single column, or a given column
		//col:		Number
		if(col != null)
		{
			return 
				(this._selectType == websheet.Constant.Column) &&
				(this._startColIndex == col) &&
				(this._endColIndex == col);
		}
		else
		{
			return (this._selectType == websheet.Constant.Column);
		}
	},
	
	/*boolean*/selectingColumns: function(strictly)
	{
		//summary:
		//		If it's selecting a 'ColumnRange' or 'Column'
		//strictly:
		//		If true, selecting a single column will return false
		if(strictly)
			return this._selectType == websheet.Constant.ColumnRange;
		return (this._selectType == websheet.Constant.ColumnRange || this._selectType == websheet.Constant.Column);
	},
	
	/*Object*/selectRange: function(startRow, startCol, endRow, endCol, skipRender)
	{
		// summary:
		//		Set range selection with the given index.
		// startRow:		Number 0-based row index
		// startCol:		Number 
		// endRow:		Number 0-based
		// endCol:		Number
		// skipRender:	boolean
		//		If given true, will skip the render in this, should call 'render()' later by yourself if you want to render the selection out.
		// returns:
		//		Reference to self.
		// Example:
		//	|	//set E11 (col 5, row 10) as the start cell node
		//	|	rectangle.selectRange(10, 5, null, null, true);
		//	|	//... ... do something else and then, set C5 (col 3, row 4) as the end cell node,
		//	|	rectangle.selectRange(null, null, 4, 3, true);
		//	|	//then expand to render the selection out
		//	|	rectangle.expand().render();
		//	|	
		//	|	//Normal usage, select A1:A10 and render the selection
		//	|	rectangle.selectRange(0, 1, 9, 1);
		//	|	//!!Give a null will keep the related index un-changed.
		var maxr = this.grid.editor.getMaxRow() - 1;
		var maxc = websheet.Constant.MaxColumnIndex;
		(startRow != null) && (this._startRowIndex = startRow);
		(endRow != null) && (this._endRowIndex = endRow);
		(startCol != null) && (this._startColIndex = startCol);
		(endCol != null) && (this._endColIndex = endCol);
		var csr = this._startRowIndex;//csr => current start row
		var cer = this._endRowIndex;
		var csc = this._startColIndex;
		var cec = this._endColIndex;
		var cst = websheet.Constant;
		//update select type based on current status
		if(csr == cer && csc == cec)
			this._selectType = cst.Cell;
		else if((this._selectType == cst.Row || this._selectType == cst.RowRange) && (csc == 1) && (cec == maxc))
		{
			//original selection is Row or RowRange, and the column indexes are not changed
			//update Row to RowRange or vice versa
			this._selectType = (csr == cer)? cst.Row : cst.RowRange;
		}
		else if((this._selectType == cst.Column || this._selectType == cst.ColumnRange) && (csr == 0) && (cer == maxr))
		{
			//original selection is Column or ColumnRange, and the row indexes are not changed
			//update select type from Column to ColumnRange or vice versa
			this._selectType = (csc == cec) ? cst.Column : cst.ColumnRange;
		}
		else
		{
			this._selectType = cst.Range;
		}
		if(!skipRender)
		{
			this.render();
			if(!this.grid.selection.isPickingRange() && this.grid.selection.isSelectingRange())
				dojo.publish("UserSelection",[{selector: this}]);
		}
		return this;
	},
	
	/*boolean*/selectingRange: function(startRow, startCol, endRow, endCol)
	{
		// summary:
		//		Return if it's currently selecting a range, or selecting the given range.
		// returns:
		//		boolean
		if(arguments.length == 4)
		{
			return 
				(this._selectType == websheet.Constant.Range) &&
				(this._startRowIndex == startRow) &&
				(this._endRowIndex == endRow) &&
				(this._startColIndex == startCol) &&
				(this._endColIndex == endCol);
		}
		else
		{
			return (this._selectType == websheet.Constant.Range);
		}
	},
	
	/*Object*/selectAll: function(skipRender)
	{
		// summary:
		//		Select the whole sheet, currently we use 'RowRange' selection to represent this kind of selection.
		// skipRender:		boolean
		// returns:
		//		Reference to self
		this._startRowIndex = 0;
		this._endRowIndex = this.grid.editor.getMaxRow() - 1;
		this._startColIndex = 1;
		this._endColIndex = websheet.Constant.MaxColumnIndex;
		this._selectType = websheet.Constant.RowRange;
		if(!skipRender)
		{
			this._expand = false;
			this.render();
		}
		//here do not check the selecting status, cause for when selectAll is always false
		if(!this.grid.selection.isPickingRange())
			dojo.publish("UserSelection",[{selector: this}]);
	},
	
	/*boolean*/selectingSheet: function()
	{
		// summary:
		//		If it's currently selecting the entire sheet.
		return (this._selectType == websheet.Constant.RowRange) && (this._startRowIndex == 0) && (this._endRowIndex == (this.grid.editor.getMaxRow() - 1));
	},
	
	/*Object*/selectGrid: function(grid)
	{
		// summary:
		//		Attach current rectangle to a new grid.
		// grid:		Object
		// returns:
		//		Reference to self.
		if(grid == null || grid == this.grid) return this;
		this.grid = grid;
		var container = this.grid.contentViews;
		this.placeAt(container);
		container.appendChild(this.mover.node);
		return this;
	},
	
	/*Object*/sleep: function()
	{
		// summary:
		//		Swith current rectangle to 'sleep' mode, in this mode, mouse events have no effect on the rectangle.
		// returns:
		//		Reference to self.
		return ((this._sleeping = true) && (this));
	},
	
	/*Boolean*/sleeping: function()
	{
		// summary:
		//		Getter for the sleeping status.
		return this._sleeping;
	},
	
	
	/*Object*/wakeup: function()
	{
		return ((this._hibernating = this._sleeping = false) || (this));
	},
	
	/***************************************************Initialize & Destroy & Inner fields***************************************************/
	_createMover: function()
	{
		this.mover = 
			new dojo.dnd.Moveable(
					dojo.create('div', {className : 'websheetSelection rectangle-moving',  style :{display : 'none', borderStyle:'solid'}, 
						innerHTML: '<div class="mover-indicator"></div>'}, this.containerNode, 'after'));
		this.mover.onMove = dojo.hitch(this, this.onMove);
		if(!this.isMoveable)
			this.disableMover();
	},
	
	_connectEvents: function() 
	{
		var evts = this.mouseEvents;
    	for (var i=0, l=evts.length; i<l; i++){
			this.connect(this.containerNode, 'on' + evts[i], this._dispatchEvents);
			this.connect(this.rbt, 'on' + evts[i], this._dispatchEvents);
			this.connect(this.rbr, 'on' + evts[i], this._dispatchEvents);
			this.connect(this.rbb, 'on' + evts[i], this._dispatchEvents);
			this.connect(this.rbl, 'on' + evts[i], this._dispatchEvents);
		}
    	if(this.isMoveable)
    	{
    		this.connect(this.mover, "onMoveStart", dojo.hitch(this, 'onMoveStart'));
    		this.connect(this.mover, "onMoveStop", dojo.hitch(this, 'onMoveStop'));
    	}
    	this.own(dojo.subscribe("updateUI", dojo.hitch(this, 'onupdateui')));
	},
	
	_customizedInit: function()
	{
		//in case you need to do something before initialization
	},
	
	_decorateEvent: function(e)
	{
		if(e.rowIndex != null && e.cellIndex != null)
			return true;
		
		// calculate the row/column index and attach the cell node to the event
		var location = this.grid.transformEvent(e.pageX, e.pageY);
		if (location) {
			var cell = this.grid.geometry.locatingCell(location.x, location.y, location.range, true);
			e.headerCellOffsetX = cell.offsetX;
			e.headerCellOffsetY = cell.offsetY;
			var row = cell.row, col = cell.col;
			if(row != null && col != null)
			{
				e.rowIndex = row;
				e.cellIndex = col;
				return true;
			}
		}
		return false;
	},
	
	_dispatchEvents: function(e)
    {
		if(this._hibernating)
			return;
    	var d = 'on' + e.type;
    	if(d in this)
    		return this[d](e);
    },
    
	_initialize: function() {
		this._customizedInit();
		this._createMover();
		this._connectEvents();
	},
	
	_getContentBox: function()
	{
		var grid = this.grid;
		var box = {};
		var rect = grid.contentViewRect /*|| grid.contentViews.getBoundingClientRect()*/;
		box.left = rect.left + (grid.isMirrored ? 0 : grid.geometry.GRID_HEADER_WIDTH);
		box.right = rect.right - (grid.isMirrored ? grid.geometry.GRID_HEADER_WIDTH : 0);
		box.top = rect.top + grid.geometry.GRID_HEADER_HEIGHT;
		box.bottom = rect.bottom;
		box.xFreezeEdge = grid.isMirrored ? rect.right - grid.freezeViewWidth :
							grid.freezeViewWidth + rect.left;
		box.yFreezeEdge = grid.freezeViewHeight + rect.top;
		return box;
	},
	
	getRangeSize: function(range)
	{
		//calculate column width from start column's left to end column's left. 
		//skip columns that are not visible
		var grid = this.grid,
			fc = grid.scroller.firstVisibleCol,
			lc = grid.scroller.lastVisibleCol,
			fr = grid.scroller.firstVisibleRow + 1,
			lr = grid.scroller.lastVisibleRow + 1,
			startRow = range.startRow,
			startCol = range.startCol,
			endRow = range.endRow,
			endCol = range.endCol,
			leftBorderVisbile = rightBorderVisible = topBorderVisible = bottomBorderVisible = true;
		if(startCol > grid.freezeCol && startCol < fc){
			leftBorderVisbile = false;
			startCol = fc;
		}
		if(endCol > lc){
			rightBorderVisible = false;
			endCol = lc;
		}
		
		if(startRow > grid.freezeRow && startRow < fr){
			topBorderVisible = false;
			startRow = fr;
		}
		if(endRow > lr) {
			bottomBorderVisible = false;
			endRow = lr;
		}
		var startPos = grid.geometry.getCellPosition(startRow - 1, startCol);
		var endPos = grid.geometry.getCellPosition(endRow, endCol + 1);
		var left = startPos.l;
		var top = startPos.t;
		var width = endPos.l - startPos.l;
		if(grid.isMirrored) {
			left = grid.geometry.getGridWidth() - left - width;
		}
		var height = endPos.t - startPos.t;
		return {l: left, w: width, leftBorderVisible: leftBorderVisbile, rightBorderVisible: rightBorderVisible,
				t: top, h: height, topBorderVisible: topBorderVisible, bottomBorderVisible: bottomBorderVisible};
	},
	
	_rangeDecoration: function(mover, location)
	{
		// calculate range based on current left top position, update the content in the mover's indicator
		var pos = this.grid.geometry.locatingCell(location.x, location.y, location.range);
		
		if(pos.row != null)
		{
			if(pos.row + mover.rowDelta > mover.maxRow) {
				mover.current_row = Math.max(0, mover.maxRow - mover.rowDelta);
			}
			else
				mover.current_row = pos.row;
		}
		if(pos.col != null)
		{
			if(pos.col + mover.colDelta > mover.maxCol) {
				mover.current_col = Math.max(1, mover.maxCol - mover.colDelta);
			}
			else
				mover.current_col = pos.col;
		}
		var range = {
			startRow : mover.current_row + 1,
			startCol : mover.current_col,
			endRow : Math.min(mover.current_row + mover.rowDelta, mover.maxRow) + 1,
			endCol : Math.min(mover.maxCol, mover.current_col + mover.colDelta)
		};
		mover.range = range;
		//update indicator
		var helper = websheet.Helper;
		var node = mover.node;
		var show = helper.getColChar(range.startCol) + (range.startRow);
		if(!this.selectingCell())
			show = show + ":" + helper.getColChar(range.endCol) + (range.endRow);
		mover.show = "<span style = 'padding-left: 4px; font-size: 10px; text-align: center; font-weight: bold;'>" + show + "</span>";
	},
	
	isMoving: function()
	{
		return (this.isMoveable && this.mover.isMoving);
	}
	
});