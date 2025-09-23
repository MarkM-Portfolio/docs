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
dojo.provide("websheet.widget._MobileSelectRectangle");
dojo.require("websheet.widget._SelectRectangle");

dojo.declare("websheet.widget._MobileSelectRectangle", [websheet.widget._SelectRectangle], {
	// summary:
	//		MobileSelectRectangle is used in mobile grid to select contents and the main feature it should cover include:
	//		1. Drag selection handle for basic selection features, row(s), column(s), cell(s), entire sheet.
	//		2. Auto-fill which has different style with SelectRectangle
	//		3. Eraser same with SelectRectangle
	mouseEvents			:	['touchstart', 'touchmove', 'touchend','contextmenu'],
	dragNode		:		null,		// a handle to select range
	selectionMode	:		true,		// autofill and selection are exlusive for mobile
	render: function()
	{
		// summary:
		//		Overwrite, more need to be rendered, they're:
		//		1. autofill handler when enable autofill
		//		2. drag handler when it can select range
		if(!this.selectionMode){
			var className = "autofill mobile-autofill autofill-range";
			switch(this._selectType){
				case websheet.Constant.RowRange:
				case websheet.Constant.Row:
					className = "autofill mobile-autofill autofill-row";
					break;
				case websheet.Constant.ColumnRange:
				case websheet.Constant.Column:
					className = "autofill mobile-autofill autofill-col";
					break;
			}
			this.autofill.className = className;
			
		} else {
			var className = "select-draghandler select-draghandler-range";
			var resizeClassName = null;
			this.dragNode.style.top = "auto";
			this.dragNode.style.left = "auto";
			switch(this._selectType){
				case websheet.Constant.RowRange:
				case websheet.Constant.Row:
					className = "select-draghandler select-draghandler-row";
					resizeClassName = "mobile-header-resizer mobile-resizer-row";
					this.dragNode.style.left = this.grid.boxSizing.w/2 + "px";
					break;
				case websheet.Constant.ColumnRange:
				case websheet.Constant.Column:
					className = "select-draghandler select-draghandler-col";
					resizeClassName = "mobile-header-resizer mobile-resizer-col";
					this.dragNode.style.top = this.grid.boxSizing.h/2 + "px";
					break;
			}
			this.dragNode.className = className;
			// range picker do not have this resize node for column, row resize
			if(this.resizeNode) {
				if(resizeClassName) {
					this.resizeNode.className = resizeClassName;
					this.resizeNode.style.display = "";
				} else
					this.resizeNode.style.display = "none";
			}
		}
		this.inherited(arguments);
	},
	
	setSelectionMode: function(mode)
	{
		if(mode) {
			this.selectionMode = true;
			this.dragNode.style.display = '';
			this.disableAutofill();
		} else {
			this.selectionMode = false;
			this.dragNode.style.display = 'none';
			this.enableAutofill();
		}
		this.autofillable = true;
	},
	
	/*Object*/enableAutofill: function()
	{
		// summary:
		//		Enable the autofill functionality.
		//		For mobile, autofill and selection are exlusive
		// returns:
		//		Self
		if(!this.selectionMode)
			return this.inherited(arguments);
		return this;
	},
	
	/*Object*/disableAutofill: function()
	{
		// summary:
		//		Disable the autofill functionality.
		// returns:
		//		Self.
		if(this.selectionMode)
			return this.inherited(arguments);
		return this;
	},
	
	selectionStart: function()
	{
		// if it is now in autofill mode, but user does not do autofill
		// mouse down target is not autofill node, but other places
		// then change to selection mode
		if(!this.selectionMode)
			this.setSelectionMode(true);
		this.inherited(arguments);
	},
	
	autofillApply: function()
	{
		// summary:
		//		Apply autofill (when mouse up), should disable autofill mode, and start selection mode
		if(this.autofillable)
		{
			this.setSelectionMode(true);
		}
		this.inherited(arguments);
	},
	
	/*boolean*/isActivated: function () {
		// summary:
		//		Activated means it should handle mouse events
		return this.isSelecting() || this._isAutofilling || this.isMoving() || this._isResizing;
	},
	
	/***************************************************Events***************************************************/
	
	ontouchstart: function (e) 
	{
		console.log("touch start on select rect");
		if (e.touches.length === 2){
		  return;
		}
		this.onmousedown(e);
		this.touchStartEvent = dojo.mixin({}, e);
	},
	
	ontouchend: function (e) 
	{
		console.log("touch end on select rect");
		if (e.touches.length === 2){
		  return;
		}
		this._isResizing = false;
		this.onmouseup(e);
	},
	
	ontouchmove: function(e)
	{
		console.log("touch move on select rect");
		if (e.touches.length === 2){
		  return;
		}
		this.onmousemove(e);
	},
	
	onTap: function(e)
	{
		console.log("tap on select rect");
		//dispatch to data grid
		if(this._decorateEvent(this.touchStartEvent)) {
			this.grid.onCellMouseDown(this.touchStartEvent);
			dojo.stopEvent(e);
		}
		this._isSelecting = false;
	},
	
	onDoubleTap: function(e)
	{
		console.log("double tap on select rect");
		// summary:
		//		Overwrite, double tap on rectangle will enter editing mode.
		this.ondblclick(this.touchStartEvent);
		dojo.stopEvent(e);
	},
	
	//hold tap on select rect, start a drag and move here,
	onHoldTap: function(e)
	{
		console.log("hold tap on select rect");
		if(this._isSelecting || this._isAutofilling || this._isResizing)
			return;
		var box = dojo.marginBox(this.containerNode);
		dojo.style(this.mover.node, {
			left	:	box.l + 'px',
			top		:	box.t + 'px',
			width	:	box.w - 4 + 'px',
			height	:	box.h - 4 + 'px',
			display	:	''
		});
		this.mover.onMouseDown(e);
		
		this.getGridContextMenu()._scheduleOpen(this.containerNode,null, {x: this.touchStartEvent.pageX, y: this.touchStartEvent.pageY});
		dojo.stopEvent(e);
	},
	
	
	
	onmousedown: function(e)
	{
		// summary:
		//		click on the autofill node will start an auto-fill
		//		click on the drag node will start selection
		if(e.target == this.autofill && !this.isAutofilling())
		{
			this.autofillStart();
			dojo.stopEvent(e);
		}
		else if(e.target == this.dragNode && !this.isSelecting())
		{
			this.selectionStart();
			dojo.stopEvent(e);
		} 
		else if(e.target == this.resizeNode && !this.isActivated()) {
			this.resizeNode.style.display = 'none';
			if(this.selectingRows()) {
				e.rowIndex = this._endRowIndex;
				e.cellIndex = 0;
			} else {
				e.rowIndex = -1;
				e.cellIndex = this._endColIndex;
			}
			this._isResizing = true;
			this.grid.beginResizeHeader(e);
			dojo.stopEvent(e);
		}
	},
	
	onmousemove: function(e)
	{
		// summary:
		//		mouse over the rectangle will change the the index of the selected rectangle
		if(this._sleeping)
		{
			if(this._decorateEvent(e))
			{
				this.grid.onCellMouseOver(e);
			}
		}
		else if(this.isSelecting() || this._isAutofilling)
		{
			// do not need scroll
			var x = e.pageX, y = e.pageY;
			var location = this.grid.transformEvent(e.pageX, e.pageY);
			var pos = this.grid.geometry.locatingCell(location.x, location.y, location.range);
			var merge = this.grid.cellMergeInfo(pos.row, pos.col);
			if (merge && merge.isCovered && this.selectingCell() && merge.masterRow == this._startRowIndex && merge.masterCol == this._startColIndex) {
				return;
			}
			if(this._isAutofilling)
			{
				//handle as autofilling
				this.autofilling(e, pos);
			}else {
				if(pos.row != null && pos.col != null)
				{
					if(this.selectingColumns())
					{
						this.selectColumn(this._startColIndex, pos.col);
					}
					else if(this.selectingRows())
					{
						this.selectRow(this._startRowIndex, pos.row);
					}
					else
					{
						this.selectRange(null, null, pos.row, pos.col);
					}
				}
			}
		} 
//		else if(!this.isActivated()) {
//			if(this._decorateEvent(e))
//				this.grid.onCellMouseOver(e);
//		}
	},
	
	/***************************************************Initialize & Destroy & Inner fields***************************************************/
	
	_createCustomizedWidgets: function()
	{
		// 1. create the cover node
		this.cover = dojo.create('div', {className : 'cover-node', style : {display : 'none'}}, this.containerNode, 'last');
		if(this.autofillable)
		{
			this.fillborder = dojo.create('div', {className : 'autofill-border', style : {display : 'none'}}, this.containerNode, 'after');
			this.eraser = dojo.create('div', {className : 'erase-node', style : {display : 'none'}}, this.containerNode, 'after');
			//append the auto-fill node to the right bottom of the container node (right : -4px), not sure where it is in RTL environment
			//TODO: autofill's style, should in the middle
			this.autofill = dojo.create('div', {className : "aotofill mobile-autofill", style : {display : 'none'}}, this.containerNode, 'last');
		}
		this.dragNode = dojo.create('div', {className : 'select-draghandler'}, this.containerNode, 'last');
		this.resizeNode = dojo.create('div', {className: 'mobile-header-resizer', style : {display : 'none'}}, this.containerNode, 'last');
		this.hotCell = dojo.create('div', {className : 'websheetSelection'}, this.containerNode, 'after');
	},
	
	getGridContextMenu: function()
	{
		if(!this.gridContextMenu)
			this.gridContextMenu = dijit.byId("grid_context_menu");
		return this.gridContextMenu;
	},
	
	_connectEvents: function()
	{
		console.log(this.mouseEvents);
		this.inherited(arguments);
		
		this.connect(dojo.body(), 'ontouchmove', this._dispatchEvents);
		this.connect(dojo.body(), 'ontouchend', this._dispatchEvents);
		var self = this;
		dojo.connect(this.containerNode, dojox.gesture.tap, function(e){
			self.onTap(e);
		});
		dojo.connect(this.containerNode, dojox.gesture.tap.doubletap, function(e){
			self.onDoubleTap(e);
		});
		dojo.connect(this.containerNode, dojox.gesture.tap.hold, function(e){
		if (e.touches && e.touches.length === 2) {
		  return;
		}
			self.onHoldTap(e);
		});
		
	}
	
	
});