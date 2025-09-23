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

dojo.provide("websheet.widget.ChartDiv");

dojo.require("websheet.widget.BasicDrawDiv");
dojo.require("concord.util.browser");
dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("dojo.i18n");
dojo.requireLocalization("websheet","base");

dojo.declare('websheet.widget.ChartDiv', websheet.widget.BasicDrawDiv,{
	//	summary:
	//		Provide the div to show image
	//
	//    
	//	description:
	//		The div is an individual node within a sheet, After create it
	//
	
	/**
	 * Create the draw Div dom node 
	 */
	_createDrawDivBoxNode: function() {
		this.inherited(arguments);
		
		this.setEventListener();
		if (!this._grid.editor.scene.isDocViewMode()) {
			this._drawDiv.style.cursor="move";	
			
			this._connects.push(dojo.connect(this._drawDiv,"onkeypress",dojo.hitch(this,this.onKeyPress)));
			this._connects.push(dojo.connect(this._drawDiv,"onclick",dojo.hitch(this,this.onClick)));
			this._connects.push(dojo.connect(this._drawDiv,"ondblclick",dojo.hitch(this,this.onDbClick)));
		}	
	},
	
	doUpdateContextMenu: function (e, bKeyboard) {
		if((e && dojo.mouseButtons.isRight(e)) || bKeyboard || pe.scene.bMobileBrowser) {
			this._grid.modifyContextMenu(e,"chart", this.manager.hasChartView(this.rangeInfo.range.getId()));
		}
	},
	
	onHoldTap: function(e) {
		if(!this._grid.editor.scene.isViewMode() && !websheet.model.ModelHelper.isSheetProtected()) {
			this.selectDrawFrame(this.touchStartEvent);
			if (pe.scene.bMobileBrowser) {
				var contextMenu = dijit.byId("grid_context_menu");	
				contextMenu._scheduleOpen(this._drawDiv,null, {x: this.touchStartEvent.pageX, y: this.touchStartEvent.pageY});
			}
		}
	},
	
	redraw: function (topleft,data) {
		this._resetParentNode();
		this._drawDiv.style.display = "";
		if (data) {
			this._drawDiv.style.width = data.w + "px";
			this._drawDiv.style.height = data.h + "px";
			this.redrawHeight = data.h;
			this.redrawWidth = data.w;
			if(data.w === 0 || data.h === 0)
				this._drawDiv.style.display = "none";
		}
		var actuallySet = this._setRenderDivPosition(topleft.top, topleft.left);
		this.redrawHeight = this.redrawWidth = 0;
		if (!actuallySet) {
			return;
		}
		
		this.isResizing = this.isMoving = false;
		if (this.isSelected()) {
			if (this._grid.isEditingDialog()) {
				this.hideImageResizeDivs();
			} else {
				this.updateResizeDivs();
				this._showImageResizeDivs();
			}
		}		
	},
	
	onKeyPress: function(e) {
		if(e.shiftKey && e.keyCode == dojo.keys.F10) {
			this._grid.modifyContextMenu(e,"chart", this.manager.hasChartView(this.rangeInfo.range.getId()));
		}
	},
	
	onClick: function() {
		if (!websheet.model.ModelHelper.isSheetProtected()) {
			this._setFocus(this._drawDiv);
		}
	},
	
	onDbClick: function (e) {
		dojo.stopEvent(e);
		if (websheet.model.ModelHelper.isSheetProtected()) {
			return;
		}
		var chartId = this.rangeInfo.range.getId();
		if (this.manager.isSupported(chartId)) {
		    this.manager.chartProperties(chartId);
	    }
	},
	
	setFocus: function() {
		 this._setFocus(this._drawDiv);
	},
		
	delImage: function() {		
		this.manager.deleteDrawFrame(this.rangeInfo.range.getId());
		var toolbar = this._grid.editor.getToolbar();
		if (toolbar) {
			toolbar.disableImagePropertyDlg(true);
		}
	},
	
	hideImageResizeDivs: function(){
		this.inherited(arguments);
		var toolbar = this._grid.editor.getToolbar();
		if (toolbar) toolbar.disableImagePropertyDlg(true);
		var chartId = this.rangeInfo.range.getId();
		this.manager.unHighLightDataSource(chartId);
	},
	
	_showImageResizeDivs: function(){
		this.inherited(arguments);
		var chartId = this.rangeInfo.range.getId();
		var msg;
		if (this.rangeInfo.range.data.alt) {
			msg = this.rangeInfo.range.data.alt;
		} else {
			msg = this.rangeInfo.isRelative ? this._grid.editor.nls.ACC_CHART_CELL : this._grid.editor.nls.ACC_CHART_SHEET;  	
		}
	
		setTimeout(dojo.hitch(this, function(msg){
			 this._grid.announce(msg);
		 }, msg), 2000);
		var toolbar = this._grid.editor.getToolbar();
		if (toolbar) toolbar.disableImagePropertyDlg(false);
		setTimeout(dojo.hitch(this,function(){
			this.manager.highLightDataSource(chartId);
		}));
	},
	
	setEventListener:function(resize){	
		this.disImageResizeDivconnectstHandler();
		if (this._grid.editor.scene.isDocViewMode()) {
			this._resizeDivconnects.push(dojo.connect(this._drawDiv,dojo.touch.press,dojo.hitch(this,this.selectDrawFrame)));
		} else {
			if (resize) {
				this._resizeDivconnects.push(dojo.connect(this._drawDiv,dojo.touch.press,dojo.hitch(this,this.startResize,this._drawDiv)));
				this._resizeDivconnects.push(dojo.connect(document,dojo.touch.move,dojo.hitch(this,this.resize)));
				this._resizeDivconnects.push(dojo.connect(document,dojo.touch.release,dojo.hitch(this,this.endResize)));	
			} else {
			    this._resizeDivconnects.push(dojo.connect(this._drawDiv,dojo.touch.press,dojo.hitch(this,this.startMove)));
				this._resizeDivconnects.push(dojo.connect(document,dojo.touch.move,dojo.hitch(this,this.move)));	
				this._resizeDivconnects.push(dojo.connect(document,dojo.touch.release,dojo.hitch(this,this.endMove)));
				this._drawDiv.style.cursor="move";
			}
			if (pe.scene.bMobileBrowser) {
				// hold tap to trigger context menu, just same as right click
				var self = this;
				this._resizeDivconnects.push( dojo.connect(this._drawDiv, dojox.gesture.tap, function(e){
					self.onClick(e);
					dojo.stopEvent(e);
				}) );
				this._resizeDivconnects.push( dojo.connect(this._drawDiv, dojox.gesture.tap.hold, function(e){
													self.onHoldTap(e);
												}) );
			}
		}
	},
	
	prepareResize: function(dir, e) {	
		//already in resize operation, do nothing and return directly.
		if (this.isResizing || this.isMoving) {
			return;
		}
		this.direction =dir;
		switch (dir){
			case this.directionMap.LEFT:
				 this._drawDiv.style.cursor="w-resize";
				break;
			case this.directionMap.TOPLEFT:
				this._drawDiv.style.cursor="nw-resize";
				break;
			case this.directionMap.TOPRIGHT:
				this._drawDiv.style.cursor="ne-resize";
				break;
			case this.directionMap.TOP:
				this._drawDiv.style.cursor="n-resize";
				break;
			case this.directionMap.BOTTOMLEFT:
				this._drawDiv.style.cursor="sw-resize";
				break;
			case this.directionMap.BOTTOMRIGHT:
				this._drawDiv.style.cursor="se-resize";
				break;
			case this.directionMap.BOTTOM:
				 this._drawDiv.style.cursor="s-resize";
				break;
			case this.directionMap.RIGHT:
				 this._drawDiv.style.cursor="e-resize";
				break;
		}
	},
	
	move: function(e) {	
		if (this.isMoving) {		
			if (e.clientX == this.oriX && e.clientY == this.oriY) {
				return;
			}
			
			this.calculateDirection4Move(this.oriX, this.oriY, e.clientX, e.clientY);			
			var cellInfo = this.validTargetPos( e.clientX , e.clientY);	
			if (!cellInfo) {
				return;
			} 
			var delta = this._grid.isMirrored ? this.oriX - e.clientX + cellInfo.colReviseOffset 
					: e.clientX - this.oriX - cellInfo.colReviseOffset;

			this._setRenderDivPosition(
					(this.oriTop + e.clientY - this.oriY) - cellInfo.rowReviseOffset, 
					(this.oriLeft + delta));
		    this.updateResizeDivs();
		}
	}   		 
});