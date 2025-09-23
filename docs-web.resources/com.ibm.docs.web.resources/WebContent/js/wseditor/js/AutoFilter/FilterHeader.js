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


dojo.provide("websheet.AutoFilter.FilterHeader");
dojo.require("websheet.AutoFilter.FilterButton");

dojo.declare('websheet.AutoFilter.FilterHeader', null,{
	editor: null,
	_range: null,
	_buttons: null,
	
	constructor: function(range, editor)
	{
		this._range = range;
		this.editor = editor;
		this._buttons = [];
	},
	
	show: function(grid)
	{
		if (grid.editor.isMobile() && !grid.editor.scene.bJSMobileApp) {
			// do not render header in mobile app;
			return;
		}
		var rangeInfo = this._range._getRangeInfo();
		var startRow = rangeInfo.startRow;
		
		var startCol = rangeInfo.startCol;
		var endCol = rangeInfo.endCol;
		var geometry = grid.geometry;
		var view = grid.contentViews;
//		var rowModel = this.editor.getDocumentObj().getSheet(grid.sheetName).getRow(startRow, true);
		for(var i=startCol;i<=endCol;i++)
		{
			var cellGeom = geometry.getCellPosition(startRow - 1, i, true);
			var btn = this._buttons[i-startCol];
			if (btn == null) {
				btn = this._buttons[i-startCol] = new websheet.AutoFilter.FilterButton({iconClass:"filterHeaderIcon", editor: this.editor});
				btn.placeAt(view);
				dojo.connect(btn,"onClick", dojo.hitch(this,"onClick", btn));
				dojo.connect(btn,"onMouseDown", dojo.hitch(this,"onClick", btn));
			}
			//here several conditions for the filter icon
			//1) for hidden column, hide it
			//2) for freeze row or column, if in invisible area, hide it
			var bHide = false;
			var colWidth = cellGeom.w;
			var rowHeight = cellGeom.h;
			if (colWidth == 0 || cellGeom.h == 0 || !grid.scroller.isRowInVisibleArea(startRow - 1) || !grid.scroller.isColumnInVisibleArea(i)) {
				bHide = true;
			}
			if (!bHide) {
				var original =  scaled = 14;
				var left, top, ratio = 1;
				btn.domNode.style.display = "";
				if (original > colWidth || original > rowHeight) {
					scaled = Math.min(colWidth, rowHeight);
					ratio = scaled / original;
				} 
				if (ratio < 0.7 || scaled < 10) {
					// gonna hide the filter button, the size is too small to display the button;
					btn.domNode.style.display = "none";
				} else {
					ratio = Math.max(0.7, ratio);
					if (scaled == original) {
						btn.domNode.style.transform = '';
					} else {
						btn.domNode.style.transform = 'scale(' + ratio + ')';
					}
					// TODO, we need to provide a method to quickly get the text dicellGeomion of a cell;
					if (colWidth <= original) {
						// 2 is the margin of dijit.button;
						left = grid.isMirrored ? geometry.getGridWidth() - cellGeom.l - original
							: cellGeom.l - 2;
					} else {
						left = grid.isMirrored ? geometry.getGridWidth() - cellGeom.l - colWidth + 2
							: cellGeom.l + colWidth - original - 2;
					}
					if (rowHeight <= original) {
						top = cellGeom.t - 2;
					} else {
						top = cellGeom.t + cellGeom.h - original  - 2;
					}
					btn.domNode.style.left = left + "px";
					btn.domNode.style.top = top + "px";
				}
			} else {
				btn.domNode.style.display = "none";
			}
			btn.index = i;
		}
		for(var i=this._buttons.length-1;i>endCol-startCol;i--)
		{
			var btn = this._buttons.pop();
			if(btn)
			{
				//unbind the dropDown filterMenu, otherwise it would be destroied
				btn.dropDown = null;
				btn.destroyRecursive();
			}	
		}
	},
	
	updateButtonStatus: function(index, hasRule)
	{
		var btn = this._buttons[index];
		if(btn)
		{
			if(hasRule)
			{
				btn.set("iconClass","filterHeaderIconWithRule");
			}	
			else
				btn.set("iconClass","filterHeaderIcon");
		}
	},
	
	onClick: function(btn)
	{
		
	},
	
	
	destroy: function()
	{
		for(var i=0;i<this._buttons.length;i++)
		{
			var btn = this._buttons[i];
			if(btn)
			{
				btn.closeDropDown(false);
				//unbind the dropDown filterMenu, otherwise it would be destroied
				btn.dropDown = null;
				btn.destroyRecursive();
			}	
		}
		this._buttons = [];
	}
});