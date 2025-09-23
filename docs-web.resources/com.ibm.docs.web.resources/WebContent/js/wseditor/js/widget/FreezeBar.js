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

dojo.provide("websheet.widget.FreezeBar");
dojo.require("dojo.dnd.move");
dojo.require("dojo.i18n");
dojo.require("concord.util.browser");
dojo.requireLocalization("websheet","base");

dojo.declare("websheet.widget.FreezeBar", null, {
	
	_grid: null,
	
	CLASS_SNAP_DIV			: "freeze-snap",
	CLASS_SLOT_DIV			: "freeze-slot",
	CLASS_DRAG_DIV			: "freeze-dragger",
	CLASS_SHADOW_ROW		: "freeze-row-shadow",
	CLASS_SHADOW_COL		: "freeze-col-shadow",
	
	//Number, PX, limit the lines to a certain range area.
	reservedColSpace		: null,
	reservedRowSpace		: null,
	//Number, PX, 3 px as defined
	freezeBarSize			: null,
	
	//freeze bar/freeze line divs
	rSlotDiv				: null,	//row slot div near sheet header node
	cSlotDiv				: null,	//column slot div newar sheet header ndoe
	
	rSnapDiv				: null, //row snap div when move freeze handler
	cSnapDiv				: null, //column snap div when move freeze handler
	
	rDragDiv				: null, //row drag div when drag/drop freeze handler
	cDragDiv				: null,  //ditto, column
	
	rFreezeHandle			: null, //a horizontal line
	cFreezeHandle			: null, //a vertical line
	
	isMovingCol				: null,	//flag
	isMovingRow				: null,	//flag
	
	//
	constructor: function(grid){
		this._grid = grid;
		this.isMovingCol = this.isMovingRow = false;
//		if (concord.util.browser.isMobile())
			this.freezeBarSize = 8;
//		else
//			this.freezeBarSize = websheet.Constant.FreezeBarSize;
		this._updateConstraintSpace();
		this.createContent();
	},
	
	createContent: function(){
		var grid = this._grid;
		if (!this.rFreezeHandle && grid.domNode) {
			this.rDragDiv = dojo.create('div', {}, grid.domNode);// a horizontal line
			dojo.addClass(this.rDragDiv, this.CLASS_DRAG_DIV);
			this._updateCursor(this.rDragDiv, false, true);
			var _m = (this.rFreezehandle = new dojo.dnd.move.constrainedMoveable(this.rDragDiv, {
				constraints : dojo.hitch(this, function() {
							boundary = {},
							boundary.l = 0,
							boundary.t = this._getSheetHeaderHeight(),
							boundary.w = 0,
							boundary.h = this.reservedRowSpace;
							return boundary;
							})}));
			this.rFreezehandle.connects = [];
			
			this.rFreezehandle.connects.push(dojo.connect(_m, "onMoveStart", dojo.hitch(this,function(rDragDiv) {
				this.isMovingRow = true;
				if(dojo.isIE)
					grid.editor.focus2GridDOM();
				this._preMove(true);
				this._updateSlotDivStatus(/*bRow*/true ,/*moving*/true);
				this._updateCursor(rDragDiv.node, true, true);
				this._updateCursor(dojo.body(), true, true);
				grid.scroller.scrollToRow(0);
				grid.setLoadingOverlay();
			})));
			
			this.rFreezehandle.connects.push(dojo.connect(_m, "onMove", dojo.hitch(this,function(rDragDiv) {
				this.rDragDiv.style.top = rDragDiv.node.offsetTop  + "px";//show
				this._updateSnapDiv(true, rDragDiv, true);
			})));
			
			
			this.rFreezehandle.connects.push(dojo.connect(_m, "onMoveStop", dojo.hitch(this, function(rDragDiv) {
				this.isMovingRow = false;
				this._updateCursor(rDragDiv.node, false, true);
				this._updateCursor(null, false, true);
				this._updateSnapDiv(true, 0, false);
				this._normalizePosition(rDragDiv.node, false);//bvertical == false
			})));
		}
		
		if (!this.cFreezeHandle && grid.domNode) {
			this.cDragDiv = dojo.create('div', {}, grid.domNode);
			dojo.addClass(this.cDragDiv, this.CLASS_DRAG_DIV);
			this._updateCursor(this.cDragDiv, false, false);
			var _m = (this.cFreezeHandle = new dojo.dnd.move.constrainedMoveable(this.cDragDiv, {
				constraints : dojo.hitch(this, function() {
					boundary = {},
					boundary.l = this._getSheetHeaderWidth(),
					boundary.t = 0,
					boundary.h = 0;
					boundary.w = this.reservedColSpace;
					return boundary;
					})}));
			this.cFreezeHandle.connects = [];
			
			this.cFreezeHandle.connects.push(dojo.connect(_m, "onMoveStart", dojo.hitch(this,function(cDragDiv) {
				this.isMovingCol = true;
				if (dojo.isIE) {
					grid.editor.focus2GridDOM();
				}
				this._preMove(false);
				this._updateSlotDivStatus(/*bRow*/false, /*moving*/true);
				this._updateCursor(cDragDiv.node, true, false);
				this._updateCursor(dojo.body(), true, false);
				grid.scroller.scrollToColumn(1);
				grid.setLoadingOverlay();
			})));
			
			this.cFreezeHandle.connects.push(dojo.connect(_m, "onMove", dojo.hitch(this,function(cDragDiv) {
				this.cDragDiv.style.left = cDragDiv.node.offsetLeft + "px";//show
				this._updateSnapDiv(false, cDragDiv, true);
			})));
			
			this.cFreezeHandle.connects.push(dojo.connect(_m, "onMoveStop", dojo.hitch(this, function(cDragDiv) {
				this.isMovingCol = false;
				this._updateCursor(cDragDiv.node, false, false);
				this._updateCursor(null, false, false);
				this._updateSnapDiv(false, 0, false);
				this._normalizePosition(cDragDiv.node, true);//bvertical == false
			})));
		}
		this.adjustPosition(); 
	},
	
	
	adjustPosition: function() {
		var grid = this._grid;
		var rowDragTop = grid.scrollRowCollapsed ? grid.boxSizing.h :
			this._getSheetHeaderHeight() + grid.geometry.getFreezeHeight() - this.freezeBarSize + 1;
		var colDragLeft = grid.scrollColCollapsed ? grid.boxSizing.w:
			this._getSheetHeaderWidth() + grid.geometry.getFreezeWidth() - this.freezeBarSize /*+ 1*/;
		var rowDragLeft = 0;		
		if (grid.isMirrored) {
			colDragLeft = grid.geometry.getScrollableWidth() + grid.yScrollNode.offsetWidth;
			if (grid.freezeRow == 0)
				rowDragLeft = this._getFreezeHandleWidth() + grid.yScrollNode.offsetWidth;
		}
		dojo.style(this.rDragDiv, {position : "absolute",
			top :  rowDragTop + 'px',
			left : rowDragLeft + 'px',
			height : this.freezeBarSize + 'px',
			width : grid.freezeRow > 0 ? this._getFreezeHandleWidth() + 'px' : this._getSheetHeaderWidth() + 'px'
		});
		dojo.toggleClass(this.rDragDiv, this.CLASS_DRAG_DIV, grid.freezeRow > 0);
		dojo.toggleClass(this.rDragDiv, this.CLASS_SLOT_DIV, grid.freezeRow <= 0);
		
		dojo.style(this.cDragDiv, {position : "absolute",
			top : '0px',
			left :  colDragLeft + 'px',
			height :grid.freezeCol > 0 ? this._getFreezeHandleHeight() + 'px' : this._getSheetHeaderHeight() + 1 + 'px',
			width : this.freezeBarSize + 'px'
		});
		dojo.toggleClass(this.cDragDiv, this.CLASS_DRAG_DIV, grid.freezeCol > 0);
		dojo.toggleClass(this.cDragDiv, this.CLASS_SLOT_DIV, grid.freezeCol <= 0);
		this.updateStatus();
	},
	
	updateStatus: function () {
		this._updateSlotDivStatus(true);
		this._updateSlotDivStatus(false);
		this.updateDragDivStatus();
	},
	
	//Draw shadows
	updateDragDivStatus: function(){
		var grid = this._grid;
		if (grid.freezeRow >= 0) {
			dojo.toggleClass(this.rDragDiv, this.CLASS_SHADOW_ROW, 
					(grid.scroller.scrollTop > 1 && grid.freezeRow != 0) || grid.scrollRowCollapsed);
		}
		if(grid.freezeCol >= 0){
			dojo.toggleClass(this.cDragDiv, this.CLASS_SHADOW_COL, 
					(grid.scroller.scrollLeft > 1 && grid.freezeCol != 0) || grid.scrollColCollapsed);
		}
	},
	
	_updateConstraintSpace: function(){
		this.reservedColSpace = Math.max(this._getFreezeHandleWidth() - this._getSheetHeaderWidth() - this.freezeBarSize, 0);
		this.reservedRowSpace = Math.max(this._getFreezeHandleHeight() - this._getSheetHeaderHeight() - this.freezeBarSize, 0);
	},
	
	//Update slot div show/hide status.
	_updateSlotDivStatus: function (bRow, bMoving) {
		var grid = this._grid;
		if (bRow) {
			if (!this.rSlotDiv) {
				this.rSlotDiv = dojo.create('div', {}, grid.domNode);
				//Place row slot div to the bottom of sheet header node.
				dojo.style(this.rSlotDiv, {position : "absolute",
					top : this._getSheetHeaderHeight() - this.freezeBarSize + 1 + 'px',
					left : '0px',
					height : this.freezeBarSize + 'px',
					width : this._getSheetHeaderWidth() + 'px',
					display: "none"
				});
				dojo.addClass(this.rSlotDiv, this.CLASS_SLOT_DIV);
			}
			if (grid.freezeRow == 0 && bMoving) {
				this.rSlotDiv.style.display = "";
			} else {
				this.rSlotDiv.style.display = "none";
			}
		} else {
			if (!this.cSlotDiv) {
				this.cSlotDiv = dojo.create('div', {}, grid.domNode);
				//Place column slot div to the right of sheet header node.
				var cSlotDivLeft = !grid.isMirrored ? this._getSheetHeaderWidth() - this.freezeBarSize + 1 :
						this._getFreezeHandleWidth() + this.freezeBarSize;

				dojo.style(this.cSlotDiv, {position : "absolute",
					top : '0px',
					left : cSlotDivLeft + 'px',
					height : this._getSheetHeaderHeight() + 'px',
					width : this.freezeBarSize + 'px',
					display: "none"
				});
				dojo.addClass(this.cSlotDiv, this.CLASS_SLOT_DIV);
			}
			if (grid.freezeCol == 0 && bMoving) {
				this.cSlotDiv.style.display = "";
			} else {
				this.cSlotDiv.style.display = "none";
			}
		}
	},
	
	_updateSnapDiv: function (bRow, mover, moving) {
		var node = mover.node;
		var grid = this._grid;
		var geometry = grid.geometry;
		if (bRow && this.rSnapDiv) {
			if (!moving) {
				this.rSnapDiv.style.display = "none";
				return;
			}
			var nodePos = node.getBoundingClientRect(), indicatorLeft = nodePos.left + this.freezeBarSize/2, indicatorTop = nodePos.top + this.freezeBarSize/2;
			this.rSnapDiv.style.display = "";
			var heightArray = geometry._heightArray;
			var firstRowTop = lastPosition = -1;
			
			var trHeight = null;
			var tr, ptr;
			for (i = 0; i < grid.scroller.lastVisibleRow; i++) {
				trHeight = heightArray[i];
				if (!trHeight || trHeight < 0) {
					continue;
				}
				if (lastPosition < 0) {
					firstRowTop = lastPosition = grid.contentViewRect.top + geometry.GRID_HEADER_HEIGHT;
				}
				//console.log("lastPosition:" + lastPosition);
				//console.log("indicatorTop:" + indicatorTop);
				//console.log("rowHeight[" + i + "]" + trHeight);
				if (lastPosition < indicatorTop && lastPosition + trHeight > indicatorTop) {
					if (indicatorTop - lastPosition <= trHeight/2) {
						tr = ptr;
						//console.log("tr:"+tr);
					} else {
						lastPosition += trHeight;
						tr = i;
						//console.log("2222tr:" + tr);
					}
					var freezeRow = tr != null ? tr + 1 : 0;
					//console.log("freezeRow:" + freezeRow);
					dojo.style(this.rSnapDiv, {
						top : lastPosition - firstRowTop + this._getSheetHeaderHeight() + (freezeRow > grid.freezeRow && grid.freezeRow > 0 ? this.freezeBarSize : 0) +   'px'
					});
					this.rFreezehandle.freezeRow = freezeRow;
					break;
				} else {
					ptr = i;
					lastPosition = lastPosition + trHeight;
				}
			}
		} else if (this.cSnapDiv) {
			if (!moving) {
				this.cSnapDiv.style.display = "none";
				return;
			}
			var nodePos = node.getBoundingClientRect(), indicatorLeft = nodePos.left + this.freezeBarSize/2, indicatorTop = nodePos.top + this.freezeBarSize/2;
			this.cSnapDiv.style.display = "";
			var firstColLeft = lastPosition = -1, cols = geometry._widthArray;
			var th = lth = null;//previous th = lth;
			var width;
			for (i = 0, len = cols.length; i < len; i ++) {
				width = cols[i];
				if (!width || width < 0) {
					continue;
				}
				if (lastPosition < 0){
					if (grid.isMirrored) { //measure from right border towards left
						lastPosition = 0;
						indicatorLeft = geometry.getGridWidth(true) - node.offsetLeft;
					} else {
						firstColLeft = grid.contentViewRect.left + geometry.GRID_HEADER_WIDTH;
						lastPosition = firstColLeft;
					}
				}
				if (lastPosition < indicatorLeft && lastPosition + width > indicatorLeft) {
					if (indicatorLeft - lastPosition <= width/2) {
						th = lth;
					} else {
						lastPosition += width;
						th = i;
					}
					var freezeCol = th != null ? th + 1 : 0;
					var leftPos = lastPosition + (freezeCol > grid.freezeCol && grid.freezeCol > 0 ? this.freezeBarSize : 0);
					if(grid.isMirrored) {
						leftPos = geometry.getGridWidth(true) + grid.yScrollNode.offsetWidth - this.freezeBarSize - leftPos;
					} else {
						leftPos -= firstColLeft - this._getSheetHeaderWidth();
					}
					dojo.style(this.cSnapDiv, {
						left : leftPos + 'px'
					});
					this.cFreezeHandle.freezeCol = freezeCol;
					break;
				} else {
					lth = i;
					lastPosition = lastPosition + width;
				}
			}
		}
	},
	
	_updateCursor: function(node, grabbing, bRow){
		if (node) {
			if (dojo.isFF) {
				node.style.cursor = grabbing ? "-moz-grabbing" : "-moz-grab";
			} else if(dojo.isWebKit) {
				node.style.cursor = grabbing ? "-webkit-grabbing" : "-webkit-grab";
			} else {
				node.style.cursor = bRow ? "s-resize" : "e-resize";
			}
		} else {
			dojo.body().style.cursor = "";
		}
	},
	
	/**
	 * Used when user drag & drop the freeze window indicator, adjust it's position.
	 * @param node, indicator div
	 * @param bVertical, which indicator to adjsut?
	 */
	_normalizePosition: function (node, bVertical){
		if (!node) {
			return;
		}
		var grid = this._grid;
		var editor = grid.editor;
		// Note:
		//		This "_freezeFromCurrentUser" is use to help data grid to judge if the freezeWindow operation is triggered by current user or just an operation received from
		//		other co-editors;
		//		The change of the first visible row in scroller rely on the difference;
		grid._freezeFromCurrentUser = true;
		//		Remember to reset this value after freeze done;
		// freeze window is disabled in observer mode, also in loading read-only mode.
		if (bVertical) {
			var freezeCol = (this.cFreezeHandle.freezeCol != null && this.cFreezeHandle.freezeCol >= 0) ? this.cFreezeHandle.freezeCol :
				this._getFreezePosition(node, bVertical);
			if (freezeCol >= 0) {
				this.cFreezeHandle.freezeCol = -1;
				if (editor.scene.isObserverMode() || !editor.execCommand(commandOperate.FREEZEWINDOW,[{col:freezeCol}])) {
					this.adjustPosition();
					grid.updateUI();
				}
			} else {
				this.adjustPosition();
			}
		} else {
			var freezeRow = this.rFreezehandle.freezeRow >= 0 ? this.rFreezehandle.freezeRow :
				this._getFreezePosition(node, bVertical);
			if (freezeRow >= 0) {
				this.rFreezehandle.freezeRow = -1;
				if(grid.isEditing()) {
					try{
						grid.apply();
					} catch(e) {
						this.adjustPosition();
						return;
					}
				}
				if (editor.scene.isObserverMode() || !editor.execCommand(commandOperate.FREEZEWINDOW,[{row:freezeRow}])) {
					this.adjustPosition();
					grid.updateUI();
				}
			} else {
				this.adjustPosition();
			}
		}
	},
	
	_getFreezePosition: function (node, bVertical) {
		var grid = this._grid;
		var nodePos = node.getBoundingClientRect(), indicatorLeft = nodePos.left + this.freezeBarSize/2, indicatorTop = nodePos.top + this.freezeBarSize/2;
		var geometry = grid.geometry;
		if (bVertical) {
			var firstColLeft = lastPosition = -1, cols = geometry._widthArray;
			var th = lth = null;//previous th = lth;
			var width;
			if (grid.isMirrored) { //measure from right border towards left
				lastPosition = 0;
				indicatorLeft = geometry.getGridWidth(true) - node.offsetLeft;
			}
			for (i = 0, len = cols.length; i < len; i ++) {
				width = cols[i];
				if (!width || width < 0) {
					continue;
				}
				if (lastPosition < 0) {
					firstRowTop = lastPosition = grid.contentViewRect.left + geometry.GRID_HEADER_WIDTH;
				}
				if (lastPosition < indicatorLeft && lastPosition + width > indicatorLeft) {
					if (indicatorLeft - lastPosition <= width/2) {
						th = lth;
					} else {
						th = i;
					}
					var freezeCol = th ? th + 1: 0;
					return freezeCol;
				} else {
					lth = i;
					lastPosition = lastPosition + width;
				}
			}
			//Invalidate position?
			return -1;
		} else {
			var firstRowTop = lastPosition = -1, rows = geometry._heightArray;
			var tr = ptr = null;//previous tr.
			var height;
			for (i = 0; i <= grid.scroller.lastVisibleRow; i ++) {
				height = rows[i];
				if (!height || height < 0) {
					continue;
				}
				if (lastPosition < 0) {
					firstRowTop = lastPosition =  grid.contentTopEdge + grid.geometry.GRID_HEADER_HEIGHT;
				}
				if (lastPosition < indicatorTop && lastPosition + height > indicatorTop){
					if (indicatorTop - lastPosition <= height/2){
						tr = ptr;
					} else {
						tr = i;
					}
					return tr ? tr + 1 : 0;
				} else {
					ptr = i;
					lastPosition = lastPosition + height;
				}
			}
			//invalid position
			return -1;
		}
	},
	
	_preMove: function(bRow) {
		var grid = this._grid;
		if (bRow) {
			var width = this._getFreezeHandleWidth() + 'px';
			dojo.style(this.rDragDiv, {width : this._getFreezeHandleWidth() + 'px'});
			if(!this.rSnapDiv){
				this.rSnapDiv = dojo.create('div', {}, grid.domNode);
				dojo.addClass(this.rSnapDiv, this.CLASS_SNAP_DIV);
			}
			dojo.style(this.rSnapDiv, {
				position : "absolute",
				top : this.rDragDiv.offsetTop - 1 + 'px',
				left : '0px',
				height : this.freezeBarSize + 1 +'px',
				width : width
			});
			dojo.toggleClass(this.rDragDiv, this.CLASS_DRAG_DIV, true);
			dojo.toggleClass(this.rDragDiv, this.CLASS_SNAP_DIV, false);
		} else {
			var height = this._getFreezeHandleWidth() + 'px';
			dojo.style(this.cDragDiv, {height : height});
			if (!this.cSnapDiv) {
				this.cSnapDiv = dojo.create('div', {}, grid.domNode);
				dojo.addClass(this.cSnapDiv, this.CLASS_SNAP_DIV);
			}
			dojo.style(this.cSnapDiv, {
				position : "absolute",
				top : '0px',
				left : this.cDragDiv.offsetLeft - 1 + 'px',
				height : height,
				width : this.freezeBarSize + 1 +'px'
			});
			dojo.toggleClass(this.cDragDiv, this.CLASS_DRAG_DIV, true);
			dojo.toggleClass(this.cDragDiv, this.CLASS_SNAP_DIV, false);
		}
	},
	
	_getFreezeHandleHeight: function () {
		return this._grid.boxSizing.h;
	},
	
	_getFreezeHandleWidth: function () {
		return (this._grid.isMirrored ? this._grid.geometry.getGridWidth(true)
			: this._grid.boxSizing.w);
	},
	
	_getSheetHeaderHeight: function () {
		return this._grid.geometry.GRID_HEADER_HEIGHT;
	},
	
	_getSheetHeaderWidth: function () {
		return this._grid.geometry.GRID_HEADER_WIDTH;
	},

	/**
	 * update the freeze handler's move constraint boundary when grid resize
	 */ 
	onGridResize: function (box) {
		this._updateConstraintSpace();
		var rh = this.rFreezehandle, ch = this.cFreezeHandle;
		if(this.reservedColSpace > 0 && this.reservedRowSpace > 0 && rh && ch){
			dojo.forEach([rh, ch], function(h){
				var c = h.constraintBox =  h.constraints.call();
				c.r = c.l + c.w;
				c.b = c.t + c.h;
			});
		}
	},
	
	destroy: function(){
		dojo.forEach(this.cFreezeHandle.connects, dojo.disconnect);
		dojo.forEach(this.rFreezehandle.connects, dojo.disconnect);
		if(this.rDragDiv){
			dojo.destroy(this.rDragDiv);
			delete this.rFreezeHandle;
		}
		if(this.cDragDiv){
			dojo.destroy(this.cDragDiv);
			delete this.cFreezeHandle;
		}
	}
});

