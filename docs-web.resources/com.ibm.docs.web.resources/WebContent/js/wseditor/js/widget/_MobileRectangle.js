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
dojo.provide("websheet.widget._MobileRectangle");
dojo.require("websheet.widget._Rectangle");

dojo.declare("websheet.widget._MobileRectangle", [websheet.widget._Rectangle], {
	// summary:
	//		MobileSectangle is used in mobile grid for range highlighting
	//		1. Drag selection handle which is special for mobile range highlight selection
//	mouseEvents			:	['touchstart', 'touchmove', 'touchend','contextmenu'],
//	dragNode		:		null,		// a handle to select range
//	render: function()
//	{
//		// summary:
//		//		Overwrite, more need to be rendered, they're:
//		//		drag handler when it select range
//		var className = "select-draghandler select-draghandler-range";
//		this.dragNode.style.top = "auto";
//		this.dragNode.style.left = "auto";
//		switch(this._selectType){
//			case websheet.Constant.RowRange:
//			case websheet.Constant.Row:
//				className = "select-draghandler select-draghandler-row";
//				this.dragNode.style.left = this.grid.boxSizing.w/2 + "px";
//				break;
//			case websheet.Constant.ColumnRange:
//			case websheet.Constant.Column:
//				className = "select-draghandler select-draghandler-col";
//				this.dragNode.style.top = this.grid.boxSizing.h/2 + "px";
//				break;
//		}
//		this.dragNode.className = className;
//		this.inherited(arguments);
//	},
//	
//	/***************************************************Events***************************************************/
//	
//	ontouchstart: function (e) 
//	{
//		console.log("touch start on mobile rect");
//		this.onmousedown(e);
//		this.touchStartEvent = dojo.mixin({}, e);
//	},
//	
//	ontouchend: function (e) 
//	{
//		console.log("touch start on mobile rect");
//		this._isSelecting = false;
//	},
//	
//	ontouchmove: function(e)
//	{
//		console.log("touch move on mobile rect");
//		this.onmousemove(e);
//	},
//	
//	onmousedown: function(e)
//	{
//		// summary:
//		//		click on the autofill node will start an auto-fill
//		//		click on the drag node will start selection
//		if( (e.target == this.dragNode) && !this._isSelecting)
//		{
//			this._isSelecting = true;
//			dojo.stopEvent(e);
//		} 
//	},
//	
//	onmousemove: function(e)
//	{
//		// summary:
//		//		mouse over the rectangle will change the the index of the selected rectangle
//		if(this._isSelecting)
//		{
//			// do not need scroll
//			var x = e.pageX, y = e.pageY;
//			var location = this.grid.transformEvent(e.pageX, e.pageY);
//			var pos = this.grid.geometry.locatingCell(location.x, location.y, location.range);
//			var merge = this.grid.cellMergeInfo(pos.row, pos.col);
//			if (merge && merge.isCovered && this.selectingCell() && merge.masterRow == this._startRowIndex && merge.masterCol == this._startColIndex) {
//				return;
//			}
//				if(pos.row != null && pos.col != null)
//				{
//					if(this.selectingColumns())
//					{
//						this.selectColumn(this._startColIndex, pos.col);
//					}
//					else if(this.selectingRows())
//					{
//						this.selectRow(this._startRowIndex, pos.row);
//					}
//					else
//					{
//						this.selectRange(null, null, pos.row, pos.col);
//					}
//				}
//		} 
//	},
//	
//	/***************************************************Initialize & Destroy & Inner fields***************************************************/
//	
//	_connectEvents: function()
//	{
//		this.inherited(arguments);
//		
//		this.connect(dojo.body(), 'ontouchmove', this._dispatchEvents);
//		this.connect(dojo.body(), 'ontouchend', this._dispatchEvents);
//	},
	
	_customizedInit: function()
	{
//		this.dragNode = dojo.create('div', {className : 'select-draghandler'}, this.containerNode, 'last');
		this.isMoveable = false;
	}
	
	
});