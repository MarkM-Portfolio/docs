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

dojo.provide("websheet.widget.ImageDiv");

dojo.require("websheet.widget.BasicDrawDiv");
dojo.require("concord.util.browser");
dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("dojo.i18n");
dojo.require("dojox.gesture.tap");
dojo.requireLocalization("websheet","base");
dojo.declare('websheet.widget.ImageDiv', websheet.widget.BasicDrawDiv,{
	//	summary:
	//		Provide the div to show image
	//
	//    
	//	description:
	//		The div is an individual node within a sheet, After create it
	//		
	_image: null,
	
	_imageResizeDiv:null,
	_imageKeyconnects:null,

	/**
	 * Construct the class with grid parent and border width
	 *  @param rangeInfo includes the image information for example{x:100, y:100, width:100, height:100, imageurl:"images/i.jpg",
	 *  imageid:"image1", usage:IMAGE, rangid:"img0", isRelative:false/true};
	 *  	    manager instance of ImageDivManager
	 */
	/**
	 * Construct the class with grid parent and border width
	 */
	constructor:function(grid, rangeInfo, manager){
		this._imageKeyconnects=[];
	},
	
	/**
	 * [COMMON CODE][Freeze Window]
	 *	FIXME CC, comments tbd... should call this if freeze window in a new position to help draw the image in the right
	 *	position.
	 */
	_resetParentNode: function () {
		this.inherited(arguments);
		if (this._imageResizeDiv!=null) {
			if(this._imageResizeDiv.parentNode == this.container.containerNode) {
				return;
			} else {		
				this.container.containerNode.appendChild(this._imageResizeDiv);
			}
		}
	},
	
	/**
	 * Create the image Div dom node 
	 */
	_createDrawDivBoxNode: function() {
		this.inherited(arguments);
		this.createImage();		
		if (this.rangeInfo.range.usage == websheet.Constant.RangeUsage.IMAGE || this.rangeInfo.range.usage == websheet.Constant.RangeUsage.SHAPE) {
			this._createResizeDiv();	
	    }
	},
	
	doUpdateContextMenu: function (e, bKeyboard) {
		if ((e && dojo.mouseButtons.isRight(e)) || bKeyboard || pe.scene.bMobileBrowser) {
			this._grid.modifyContextMenu(e,"image");
		} else if (dojo.isIE && e && dojo.mouseButtons.isLeft(e)) {
			var contextMenu = dijit.byId("grid_context_menu");		
			if (contextMenu) {			
				contextMenu._onBlur();
				this._grid.removeContextMenu();			
			}
		}
	},
	
	hide: function(){
		this.inherited(arguments);
		if (this._imageResizeDiv) {
			this._imageResizeDiv.style.display = "none";
		}
	},
	
	redraw:function(topleft,data){	
		this._resetParentNode();
	
		this._drawDiv.style.display = "";
		if (data) {
			this._drawDiv.style.width = data.w + "px";
			this._drawDiv.style.height = data.h + "px";
			this.redrawHeight = data.h;
			this.redrawWidth = data.w;
			this._image.style.width = data.w + "px";
			this._image.style.height = data.h + "px";
			if(data.w === 0 || data.h === 0)
				this._drawDiv.style.display = "none";
		}
		var actuallySet = this._setRenderDivPosition(topleft.top, topleft.left);
		this.redrawHeight = this.redrawWidth = 0;
		if (!actuallySet) {
			return;
		}
		this.isMoving= false;	
		this.isResizing = false;
		if (this._imageResizeDiv) {
			this._imageResizeDiv.style.top = actuallySet.top + "px";
			this._imageResizeDiv.style.left = actuallySet.left + "px";
			this._imageResizeDiv.style.display = "";
			if (data) {
				this._imageResizeDiv.style.width = data.w + "px";
				this._imageResizeDiv.style.height = data.h + "px";
			}
	
		}
		if (this.isSelected()) {
			if (this._grid.isEditingDialog()) {
				this._hideImageResizeDivs();
			} else {
				this.updateResizeDivs();
				this._showImageResizeDivs();
			}
		}		
	},
	
	_createResizeDiv: function(){
		if (!this._imageResizeDiv) {
			this._imageResizeDiv = dojo.clone(this._drawDiv);
		  
			this._imageResizeDiv.id = this.getDivId()+"resize";
			this._imageResizeDiv.innerHTML ="";
			this._drawDiv.parentNode.appendChild(this._imageResizeDiv);
			if (dojo.isIE) {
				this._imageResizeDiv.style.background= "#E1E1E1";
				if (dojo.isIE >= 10) {							
					this._imageResizeDiv.style.opacity = 0;
				} else {			
					this._imageResizeDiv.style.filter = "Alpha(opacity=0)";
				}
			} else {
				this._imageResizeDiv.style.background= "transparent";
			}
			this._imageResizeDiv.style.zIndex = this._calcZIndex() + 1;
			this._imageResizeDiv.style.outline = 0;
			if (!this._grid.editor.scene.isDocViewMode()) {
				this._imageResizeDiv.style.cursor="move";			
			}
			this.setEventListener();
		 }
	},
	
	showImageResizeDivs: function(){
		 this.inherited(arguments);
		 var msg;
		 if (this.rangeInfo.range.data.alt) {
			 msg = this.rangeInfo.range.data.alt;
		 } else {
			 msg = this.rangeInfo.isRelative ? this._grid.editor.nls.acc_Image_cell : this._grid.editor.nls.acc_Image_sheet;  	
		 }
		setTimeout(dojo.hitch(this, function(msg){
			 this._grid.announce(msg);
		 }, msg), 2000);
		 var toolbar = this._grid.editor.getToolbar();
		 if (toolbar) toolbar.disableImagePropertyDlg(false);
	},
	
	_showImageResizeDivs: function(){
		this.inherited(arguments);
		if (this._divTopLeft) {
			this._imageResizeDiv.style.display = "";
		}
	},
	
	hideImageResizeDivs: function(){	
		this.inherited(arguments);
		var toolbar = this._grid.editor.getToolbar();
		if (toolbar) toolbar.disableImagePropertyDlg(true);
	},
	
	updateResizeDivs:function(){
		this.inherited(arguments);
	},
	
	delImage: function() {
		var usage = this.rangeInfo.range.getUsage();
		if (usage == websheet.Constant.RangeUsage.IMAGE || usage == websheet.Constant.RangeUsage.SHAPE) {		
			this.manager.deleteDrawFrame(this.rangeInfo.range.getId());
		}
		var toolbar = this._grid.editor.getToolbar();
		if (toolbar) toolbar.disableImagePropertyDlg(true);
	},
	
	setKeyMoveListener: function() {
		this.disImageKeyconnectstHandler();			
		this._imageKeyconnects.push(dojo.connect(document,"onkeyup",dojo.hitch(this,this.endKeyMove)));	
	},
	
	setEventListener: function (resize) {	
		this.disImageResizeDivconnectstHandler();
		if (this._grid.editor.scene.isDocViewMode()) {
			this._resizeDivconnects.push(dojo.connect(this._imageResizeDiv,dojo.touch.press,dojo.hitch(this,this.selectDrawFrame)));		
		} else {
			if (resize) {
				//only image support resize
				if (this.rangeInfo.range.getUsage() == websheet.Constant.RangeUsage.IMAGE || this.rangeInfo.range.getUsage() == websheet.Constant.RangeUsage.SHAPE) {			
					this._resizeDivconnects.push(dojo.connect(this._imageResizeDiv, dojo.touch.press ,dojo.hitch(this,this.startResize, this._imageResizeDiv)));
					this._resizeDivconnects.push(dojo.connect(document, dojo.touch.move ,dojo.hitch(this,this.resize)));			
					this._resizeDivconnects.push(dojo.connect(document, dojo.touch.release ,dojo.hitch(this,this.endResize)));	
				}
			} else {		
				 // only iamge support DND
			    if (this.rangeInfo.range.getUsage() == websheet.Constant.RangeUsage.IMAGE || this.rangeInfo.range.getUsage() == websheet.Constant.RangeUsage.SHAPE) {	
			    	this._resizeDivconnects.push(dojo.connect(this._imageResizeDiv,"onclick",dojo.hitch(this,this.onClick)));
			    	this._resizeDivconnects.push(dojo.connect(this._imageResizeDiv,"onkeypress",dojo.hitch(this,this.onKeyPress)));
			    	this._resizeDivconnects.push(dojo.connect(this._imageResizeDiv,dojo.touch.press,dojo.hitch(this,this.startMove)));
					this._resizeDivconnects.push(dojo.connect(document,dojo.touch.move,dojo.hitch(this,this.move)));	
					this._resizeDivconnects.push(dojo.connect(document,dojo.touch.release,dojo.hitch(this,this.endMove)));
					this._imageResizeDiv.style.cursor="move";
			    }
			}
			if (pe.scene.bMobileBrowser) {
				// hold tap to trigger context menu, just same as right click
				var self = this;
				this._resizeDivconnects.push( dojo.connect(this._imageResizeDiv, dojox.gesture.tap, function(e){
					self.onClick(e);
					dojo.stopEvent(e);
				}) );
				this._resizeDivconnects.push( dojo.connect(this._imageResizeDiv, dojox.gesture.tap.hold, function(e){
													self.onHoldTap(e);
												}) );
			}
		}
	},
	
	setFocus: function () {
		this._setFocus(this._imageResizeDiv);
	},
	
	onClick: function () {
		if(!websheet.model.ModelHelper.isSheetProtected())
			this._setFocus(this._imageResizeDiv);
	},
	
	onKeyPress: function (e) {
		if (e.shiftKey && e.keyCode == dojo.keys.F10) {
			this._grid.modifyContextMenu(e,"image");
		}
	},
	
	prepareResize: function (dir, e) {	
		//already in resize operation, do nothing and return directly.
		if (this.isResizing || this.isMoving) return;
		// not in edit mode, do nothing
		if (this._grid.editor.scene.isViewMode()) return;
		this.direction =dir;
		switch (dir){
			case this.directionMap.LEFT:
				 this._imageResizeDiv.style.cursor="w-resize";
				break;
			case this.directionMap.TOPLEFT:
				this._imageResizeDiv.style.cursor="nw-resize";
				break;
			case this.directionMap.TOPRIGHT:
				this._imageResizeDiv.style.cursor="ne-resize";
				break;
			case this.directionMap.TOP:
				this._imageResizeDiv.style.cursor="n-resize";
				break;
			case this.directionMap.BOTTOMLEFT:
				this._imageResizeDiv.style.cursor="sw-resize";
				break;
			case this.directionMap.BOTTOMRIGHT:
				this._imageResizeDiv.style.cursor="se-resize";
				break;
			case this.directionMap.BOTTOM:
				 this._imageResizeDiv.style.cursor="s-resize";
				break;
			case this.directionMap.RIGHT:
				 this._imageResizeDiv.style.cursor="e-resize";
				break;
		}
	},
	
	/**
	 * this method is called to resized the image based on the mouse position
	 * @param e the event which include the mouse position
	 */
	_resize: function (X, Y) {
		if (X == this.oriX && Y == this.oriY) {
			return;
		}
	    var pos = this._imageResizeDiv.getBoundingClientRect();
	    if (this.direction == this.directionMap.RIGHT || this.direction == this.directionMap.BOTTOMRIGHT || this.direction == this.directionMap.TOPRIGHT) {
	    	var width =  this.oriWidth + (X - this.oriX);
	    	if (width >0) {    		
	    		var cellInfo =this.validTargetPos(X,Y);  
	    		var bigger = width - cellInfo.colReviseOffset >  this.oriWidth? true:false;
	    		if (bigger) {
	    			this._imageResizeDiv.style.width = width - cellInfo.colReviseOffset +"px";	  
	    		}
	    		this._drawDiv.style.width = width - cellInfo.colReviseOffset +"px";	  
	    		this._image.style.width = width - cellInfo.colReviseOffset +"px";   
	    		if (!bigger) {
	    			this._imageResizeDiv.style.width = width - cellInfo.colReviseOffset +"px";
	    		}
	    	}
	    }
	    if (this.direction ==this.directionMap.LEFT || this.direction ==this.directionMap.BOTTOMLEFT ||  this.direction ==this.directionMap.TOPLEFT) {
	    	var width =  this.oriWidth  - (X - this.oriX);
	    	if (width >0) {
	    		var cellInfo =this.validTargetPos(X,Y);
	    		var delta = this._grid.isMirrored ? this.oriX - X + cellInfo.colReviseOffset : X - this.oriX - cellInfo.colReviseOffset;
	    		var left = this.oriLeft + delta;
	    		if(this.container.containerMap == this.containerMap.RIGHTBOTTOM || this.container.containerMap == this.containerMap.RIGHTTOP) {
	    			if (!this._grid.isMirrored) {
	    				left -= this._grid.getFreezeWindowWidth();
	    			}
	    			if (this._grid.scroller.firstVisibleCol > this._grid.freezeCol + 1) {
						left -= this._grid.geometry.colWidth(this._grid.freezeCol + 1, this._grid.scroller.firstVisibleCol - 1);
	    			}
	    			if (this._grid.isMirrored) {
	    				left = this._grid.geometry.getGridWidth(true) - left - this.rangeInfo.range.data.w;
	    			}
	    		} else if(this._grid.isMirrored && (this.container.containerMap == this.containerMap.LEFTTOP || this.container.containerMap == this.containerMap.LEFTBOTTOM)) {
	    			left = this._grid.getFreezeWindowWidth() - left - this.rangeInfo.range.data.w;
	    		}
	    		var bigger = left > this.oriLeft? false : true;
	    		if (bigger) {
	    			this._imageResizeDiv.style.left = left + "px";	    	
	    			this._imageResizeDiv.style.width =width + cellInfo.colReviseOffset + "px";
	    		}    		
	    		this._drawDiv.style.left = left + "px";	    	
	    		this._drawDiv.style.width =width + cellInfo.colReviseOffset + "px";
	    		this._image.style.width = width + cellInfo.colReviseOffset + "px";
	    		if (!bigger) {
	    			this._imageResizeDiv.style.left = left + "px";	    	
	    			this._imageResizeDiv.style.width =width + cellInfo.colReviseOffset + "px";
	    		}  
	    		
	    	}
	    }
	  if (this.direction ==this.directionMap.BOTTOM || this.direction ==this.directionMap.BOTTOMRIGHT || this.direction ==this.directionMap.BOTTOMLEFT ) { 
	    	var height = this.oriHeight  +(Y - this.oriY);
	    	if (height >0) {
	    		var cellInfo = this.validTargetPos(X,Y);    	
	    		var bigger = height - cellInfo.rowReviseOffset > this.oriHeight ? true : false;
	    		if (bigger) {
	    			this._imageResizeDiv.style.height = height - cellInfo.rowReviseOffset + "px";    			
	    		}
	    		this._drawDiv.style.height = height - cellInfo.rowReviseOffset + "px";
	    		this._image.style.height = height- cellInfo.rowReviseOffset + "px"; 
	    		if (!bigger) {
	    			this._imageResizeDiv.style.height = height - cellInfo.rowReviseOffset + "px";  
	    		}
	    	}
	    }
	  if (this.direction ==this.directionMap.TOP||  this.direction ==this.directionMap.TOPRIGHT || this.direction ==this.directionMap.TOPLEFT) {
		  var height = this.oriHeight  - (Y - this.oriY);
	    	if (height >0) {
	    		var cellInfo = this.validTargetPos(X,Y);   		
	    		var top = this.oriTop + (Y - this.oriY) - cellInfo.rowReviseOffset;   
	    		var bigger = top > this.oriTop ? false : true;
	    		if (bigger){
	    			this._imageResizeDiv.style.top = top+ "px";	    	
	        		this._imageResizeDiv.style.height =height + cellInfo.rowReviseOffset +"px";
	    		}    		
	    		this._drawDiv.style.top =top + "px";	       	
	    		this._drawDiv.style.height =height +cellInfo.rowReviseOffset +"px";
	    		this._image.style.height = height+cellInfo.rowReviseOffset+"px";  
	    		if (!bigger){
	    			this._imageResizeDiv.style.top = top+ "px";	    	
	        		this._imageResizeDiv.style.height =height + cellInfo.rowReviseOffset +"px";
	    		}
	    	}
	    }   
	  this.updateResizeDivs();
	},
	
	validKeyMoveTargetPos:function(curLeft, curTop){	
		if (this.direction == this.directionMap.TOP) {		
			return  this._grid.getCellInfoWithPosition(curLeft, curTop - this.offsetMove, false, false, this.inFrozenArea());
		 }	
		if (this.direction ==this.directionMap.RIGHT) {		
			return this._grid.getCellInfoWithPosition(curLeft + this.oriWidth + this.offsetMove, curTop, false, true, this.inFrozenArea());	
		}		 
		if (this.direction == this.directionMap.BOTTOM) {		
			return this._grid.getCellInfoWithPosition(curLeft, curTop + this.oriHeight + this.offsetMove, true, false, this.inFrozenArea());	
		}		
		if (this.direction ==this.directionMap.LEFT) {		
			return this._grid.getCellInfoWithPosition(curLeft - this.offsetMove, curTop, false, false, this.inFrozenArea());	
		}
	},
	
	prepareKeyMove:function(dir){
		var dk = dojo.keys;
		var offset = {offsetX:0,offsetY:0};
		switch(dir){
			case dk.LEFT_ARROW:
				this.direction = this.directionMap.LEFT;
				offset.offsetX = -this.offsetMove;
				break;
			case dk.RIGHT_ARROW:
				this.direction = this.directionMap.RIGHT;
				offset.offsetX = this.offsetMove;
				break;
			case dk.UP_ARROW:	
				this.direction = this.directionMap.TOP;
				offset.offsetY = -this.offsetMove;
				break;
			case dk.DOWN_ARROW:
				this.direction = this.directionMap.BOTTOM;
				offset.offsetY = this.offsetMove;
				break;
		}
		return offset;
	},
	
	move: function(e){	
		if (this.isMoving) {		
			if(e.clientX == this.oriX && e.clientY == this.oriY)
				return;
			
			this.calculateDirection4Move(this.oriX, this.oriY, e.clientX, e.clientY);			
			var cellInfo = this.validTargetPos( e.clientX , e.clientY);			
			if (!cellInfo) {
				return;
			}
			var delta = this._grid.isMirrored ? this.oriX - e.clientX + cellInfo.colReviseOffset 
					: e.clientX - this.oriX - cellInfo.colReviseOffset;

			var actuallySet = this._setRenderDivPosition(
					(this.oriTop + e.clientY - this.oriY) - cellInfo.rowReviseOffset, 
					(this.oriLeft + delta),
					false/*,
					true*/
				);
			this._imageResizeDiv.style.top 	=  actuallySet.top + "px";
	    	this._imageResizeDiv.style.left =  actuallySet.left + "px";
		    this.updateResizeDivs();
		}
	},
	
	keyMove: function(e, dir){	
		if (!this.isKeymoving) {
			this.isKeymoving = true;
			this.setKeyMoveListener();
			this.cacheOriPosition(e);
		}	
		var offset = this.prepareKeyMove(dir);
		var pos = this.getRenderDivPosition();
		var curLeft = pos.left + this._image.offsetLeft; 
		var curTop = pos.top + this._image.offsetTop;
		
		var cellInfo = this.validKeyMoveTargetPos(curLeft, curTop);
		if(!cellInfo) return;
		var delta = this._grid.isMirrored ? -offset.offsetX : offset.offsetX;
		var actuallySet = this._setRenderDivPosition((curTop + offset.offsetY) - cellInfo.rowReviseOffset, 
				(curLeft + delta) - cellInfo.colReviseOffset, /*NeedReviseLeft*/ true/*, true*/);
		this._imageResizeDiv.style.left = actuallySet.left + "px"; 
	    this._imageResizeDiv.style.top = actuallySet.top + "px";
	    this._image.style.left = "0px"; 
	    this._image.style.top = "0px";   
	    this.updateResizeDivs();
	},
	
	endKeyMove:function(){
		this.isKeymoving = false;
		this.disImageKeyconnectstHandler();	
		if (this.rangeInfo.isRelative) {		
			var imgLeftPos = this.oriLeft;
			var preTopLeftCellInfo =  this._grid.getCellInfoWithPosition(imgLeftPos  , this.oriTop, false, false, this.inFrozenArea());
			var imgRightPos = this.oriLeft + this.oriWidth;
			var preRightBottomCellInfo =  this._grid.getCellInfoWithPosition(imgRightPos , this.oriTop + this.oriHeight, true, true, this.inFrozenArea());
			var pos = this.getRenderDivPosition();
			imgLeftPos = pos.left + this._image.offsetLeft;
			var newLeftTopCellInfo = this._grid.getCellInfoWithPosition(imgLeftPos, pos.top + this._image.offsetTop, false, false, this.inFrozenArea());
			imgRightPos = pos.left + this._image.offsetLeft + this._image.offsetWidth;
			var newRightBottomCellInfo = this._grid.getCellInfoWithPosition(imgRightPos , pos.top + this._image.offsetTop + this._image.offsetHeight, true, true, this.inFrozenArea());
			this.sendPositionChangedMessage(preTopLeftCellInfo,newLeftTopCellInfo, preRightBottomCellInfo, newRightBottomCellInfo);
		} else {
			this.sendPositionChangedMessage();
		}	
	},
	
	/**
	 * create Image and add it into _drawDiv
	 */
	createImage:function(){
		var alt;
		if (this.rangeInfo.range.data.alt) {
			alt = this.rangeInfo.range.data.alt;
		} else {
			alt = this.rangeInfo.isRelative ? this._grid.editor.nls.acc_Image_cell : this._grid.editor.nls.acc_Image_sheet;	   	
		}
		
		if (this.rangeInfo.range.usage == websheet.Constant.RangeUsage.SHAPE) {
			var svg = this.rangeInfo.range.data.svg;
			if (svg) {
				dojo.style(this._drawDiv, "backgroundColor", "transparent");
				this._image = dojo.create("div", {innerHTML: svg,  alt:alt}, this._drawDiv);
			}
		} else {
			var srcHref = this.rangeInfo.range.data.href;
			if (this._grid.editor.scene.isHTMLViewMode()) {
				// HTML viewer requires image to attach snapshot id and version info to its HREF,
				// the href is set to ../<version-id>/<original-href>?sid=<snapshot-id>
				var snapId = DOC_SCENE.snapshotId;
				var version = DOC_SCENE.version;
				if (snapId != null || version != null) {
					if (snapId != null) {
						srcHref += "?sid=" + snapId;
					}
					
					if (version != null) {
						srcHref = version + "/" + srcHref;
					}
				}
			}
			
			this._image = dojo.create("img", {src: srcHref, alt:alt},this._drawDiv);
		}
		dojo.style(this._image, "line-height", "normal");
		if (this._grid.editor.scene.isHTMLViewMode()) {
			// for viewer, add special error handler
			this._connects.push(
					dojo.connect(this._image, "onerror", dojo.hitch(this._grid.editor.scene, this._grid.editor.scene.monitorSnapshotStatus, this._image))
			);
		}
		this._image.id = this.rangeInfo.range.getId();
		this._image.style.top = "0px";
		this._image.style.left ="0px";
	    this._image.style.width = this.rangeInfo.width+"px";
	    this._image.style.height = this.rangeInfo.height+"px";	
	    this._image.style.position= "relative";
	},
	
	disImageKeyconnectstHandler:function(){	 
		dojo.forEach(this._imageKeyconnects, dojo.disconnect);
	},
	
	onHoldTap: function(e) {
		if(!this._grid.editor.scene.isViewMode() && !websheet.model.ModelHelper.isSheetProtected()) {
			this.selectDrawFrame(this.touchStartEvent);
			if (pe.scene.bMobileBrowser) {
				var contextMenu = dijit.byId("grid_context_menu");	
				contextMenu._scheduleOpen(this._imageResizeDiv,null, {x: this.touchStartEvent.pageX, y: this.touchStartEvent.pageY});
			}
		}
	},
	
	startMove: function(e){
//		if(pe.scene.bMobileBrowser)
//			this.touchStartEvent = dojo.mixin({}, e);
		this.inherited(arguments);
		if(dojo.mouseButtons.isRight(e) && !this._grid.editor.scene.isViewMode() && !websheet.model.ModelHelper.isSheetProtected()) {
			this.selectDrawFrame(e);
		}
//		if(pe.scene.bMobileBrowser) {
//			dojo.stopEvent(e);
//		}
	},
	
	startResize: function(obj, e){	
		this.inherited(arguments);
		if (dojo.mouseButtons.isRight(e) && !this._grid.editor.scene.isViewMode()) {
			this.selectDrawFrame(e);
		}
//		if(pe.scene.bMobileBrowser) {
//			dojo.stopEvent(e);
//		}
	},
	  /**
	   * Destroy the editor after parent grid is destroy.
	   */
	destroy: function()
	{
		this.inherited(arguments);
		this.disImageKeyconnectstHandler();
	   
	    if (this._imageResizeDiv) {
	    	dojo.destroy(this._imageResizeDiv);
			delete this._imageResizeDiv;
		}
	}
});		
