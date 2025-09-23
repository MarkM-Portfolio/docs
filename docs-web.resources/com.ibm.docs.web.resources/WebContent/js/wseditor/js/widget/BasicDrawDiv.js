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

dojo.provide("websheet.widget.BasicDrawDiv");

dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("dojo.i18n");
dojo.require("dojo.touch");
dojo.require("concord.util.browser");
dojo.requireLocalization("websheet","base");
dojo.declare("websheet.widget.BasicDrawDiv", null,{
//	summary:
	//		Provide the basic class to show shapes such as image and chart
	//
	//    
	//	description:
	//		The div is an individual node within a sheet, After create it
	//	
	resizeDivClass 				: "image-resize-handle",	
	_grid						: null,
	_drawDiv					: null,
	//8 divs for resize
	_divTopLeft					: null,
	_divTopMiddle				: null,
	_divTopRight				: null,
	_divLeft					: null,
	_divRight					: null,
	_divBottomLeft				: null,
	_divBottomMiddle			: null,
	_divBottomRight				: null,
	rangeInfo					: null,	
	manager						: null,
	_connects					: null, 
	
	directionMap				: {
		TOP:1, 
		BOTTOM:2,
		LEFT:3,
		RIGHT:4,
		TOPLEFT:5,
		TOPRIGHT:6,
		BOTTOMLEFT:7, 
		BOTTOMRIGHT:8
	},
	
	containerMap				: {
		LEFTTOP:1, 
		RIGHTTOP:2, 
		LEFTBOTTOM:3, 
		RIGHTBOTTOM:4
	},
	
	interval					: websheet.Constant.FreezeBarSize,
	
	direction					: null,
	isResizing					: null,
	// timer to resize image
	resizeTime					: null,
	
	// half (width + 2*border) of resize div
	offsetPixel					: 4,
	// if the div resize divs visible
	resizeDivVisible			: null,

	_resizeDivconnects			: null,
	
	//if click the image to show real resize Div, and not solved
	//used to save the original position information 
	//oriX and oriY is used to record the X Y of the mouse clicked down it is absolute position, oriLeft, oriTop, record the image left, top, they are offset of imageDiv
	oriX						: null, 
	oriY						: null, 
	oriLeft						: null, 
	oriTop						: null, 
	oriWidth					: null, 
	oriHeight					: null,
	isMoving					: null,
	// the value how much pixels moved each time with arrow key
	offsetMove					: 5,
	isKeymoving					: null,
	offsetZIndex				: 20001,
	newAlt						: null,
	
	/**
	 * Construct the class with grid parent and border width
	 *  @param imageInfo includes the image information for example{x:100, y:100, width:100, height:100, imageurl:"images/i.jpg",
	 *  imageid:"image1", usage:IMAGE, rangid:"img0", isRelative:false/true};
	 *  	    manager instance of ImageDivManager
	 */
	/**
	 * Construct the class with grid parent and border width
	 */	
	constructor:function(grid, rangeInfo, manager){
		this._connects= [];
		this._resizeDivconnects = [];
		this.isMoving = false;
		this.resizeDivVisible = false;	
		this.isResizing = false;
		this.manager = manager;
		this.rangeInfo = rangeInfo;
		this._grid = grid;
		this.zIndex = this.rangeInfo.range.data.z ? this.rangeInfo.range.data.z : 0;
		this.zIndex += this.offsetZIndex;
		this.container = this._calcContainer();
		this._createDrawDivBoxNode();	
		if (pe.scene.bMobileBrowser) {
			this.resizeDivClass = "mobile-resize-handle image-resize-handle";
		} else
			this.resizeDivClass = "image-resize-handle";
	},
	
	calculateDirection4Move:function(oriX, oriY, newX, newY){
		var isTop = false, isLeft = false, isBottom = false, isRight = false;
		if(oriX > newX){
			isLeft = true;
		}else if(oriX < newX){
			isRight = true;
		}
		if(oriY > newY){
			isTop = true;
		}else if(oriY < newY){
			isBottom = true;
		}
		
		if(isTop){
			if(isRight){
				this.direction = this.directionMap.TOPRIGHT;
			}else if(isLeft){
				this.direction = this.directionMap.TOPLEFT;
			}else{
				this.direction = this.directionMap.TOP;
			}
		}else if(isBottom){
			if(isRight){
				this.direction = this.directionMap.BOTTOMRIGHT;
			}else if(isLeft){
				this.direction = this.directionMap.BOTTOMLEFT;
			}else{
				this.direction = this.directionMap.BOTTOM;
			}
		}else if(isRight){
			this.direction = this.directionMap.RIGHT;
		}else{
			this.direction = this.directionMap.LEFT;
		}
	},	
	
	cacheOriPosition:function(e){
		if(e){
			this.oriX = parseInt(e.clientX); 
			this.oriY = parseInt(e.clientY); 
		}
		var pos = this.getRenderDivPosition();
		this.oriLeft = pos.left; 
		this.oriTop = pos.top;		
		this.oriWidth =  this._drawDiv.offsetWidth;
		this.oriHeight = this._drawDiv.offsetHeight;
	},

	disImageResizeDivconnectstHandler:function(){	 
		dojo.forEach(this._resizeDivconnects, dojo.disconnect);
	},

	disconnectHandler:function(){	 
		dojo.forEach(this._connects, dojo.disconnect);
	},
	
	endResize:function(e){
		if(!this.isResizing) 
			return;
		if(this._grid != this._grid.editor.getCurrentGrid()) return; //important, defect 41922, it may have already been switched to other grid after it's triggered with dojo connect.
		if(this.objCaptured){
			this.objCaptured.releaseCapture();
			this.objCaptured = null;
		}
		 this.isResizing = false;
		 if(dojo.isChrome){
			var formulaBar = this._grid.editor.getFormulaBar();
			if (formulaBar) formulaBar.disable(false);
		 }
		 websheet.Utils.setSelectable(dojo.body(),true);
		 if(this.rangeInfo.isRelative){
			var imgLeftPos = this.oriLeft;
			var preTopLeftCellInfo =  this._grid.getCellInfoWithPosition(imgLeftPos  , this.oriTop, false, false, this.inFrozenArea());
			var imgRightPos = this.oriLeft + this.oriWidth;
			var preRightBottomCellInfo =  this._grid.getCellInfoWithPosition(imgRightPos , this.oriTop + this.oriHeight, true, true, this.inFrozenArea());
			var pos = this.getRenderDivPosition();
			imgLeftPos =  pos.left;
			var newLeftTopCellInfo = this._grid.getCellInfoWithPosition(imgLeftPos, pos.top, false, false, this.inFrozenArea());
			imgRightPos = pos.left + this._drawDiv.offsetWidth;
			var newRightBottomCellInfo = this._grid.getCellInfoWithPosition(imgRightPos , pos.top + this._drawDiv.offsetHeight, true, true, this.inFrozenArea());
			this.sendPositionChangedMessage(preTopLeftCellInfo,newLeftTopCellInfo, preRightBottomCellInfo, newRightBottomCellInfo);
		}else{
			this.sendPositionChangedMessage();
		}
		 
	    this.setEventListener();
	},
	
	endMove: function(e){
		if(!this.isMoving) return;
		if(this._grid != this._grid.editor.getCurrentGrid()) return; //important, defect 41922, it may have already been switched to other grid after it's triggered with dojo connect.
		if(this.rangeInfo.isRelative){
			var imgLeftPos = this.oriLeft;
			var preTopLeftCellInfo =  this._grid.getCellInfoWithPosition(imgLeftPos  , this.oriTop, false, false, this.inFrozenArea());
			var imgRightPos = this.oriLeft + this.oriWidth;
			var preRightBottomCellInfo =  this._grid.getCellInfoWithPosition(imgRightPos , this.oriTop + this.oriHeight, true, true, this.inFrozenArea());
			var pos = this.getRenderDivPosition();
			imgLeftPos = pos.left;
			var newLeftTopCellInfo = this._grid.getCellInfoWithPosition(imgLeftPos, pos.top, false, false, this.inFrozenArea());
			imgRightPos = pos.left + this._drawDiv.offsetWidth;
			var newRightBottomCellInfo = this._grid.getCellInfoWithPosition(imgRightPos , pos.top + this._drawDiv.offsetHeight, true, true, this.inFrozenArea());
			this.sendPositionChangedMessage(preTopLeftCellInfo,newLeftTopCellInfo, preRightBottomCellInfo, newRightBottomCellInfo);
		}else{
			this.sendPositionChangedMessage();
		}	
		this.isMoving= false;	
	},
	
	endResizeWithDialog: function(){
		this.isResizing = false;	
	},
	
	/**
	 * [COMMON CODE]
	 * Return the image DIV position {top:top, left:left, absTop: used for absolute frames, bFrozen: if located in frozen area} relative to it's (top-bottom, 2 way)container's upper-left corner.
	 */
	getRenderDivPosition: function(){
		var 
			position = {}, 
			top = this._drawDiv.offsetTop, 
			left = this._drawDiv.offsetLeft, 
			absTop = top, 
			bFrozen = false,
			grid = this._grid,
			geometry = grid.geometry,
			scroller = grid.scroller;
		switch (this.container.containerMap) {
		case this.containerMap.LEFTTOP:
			if (grid.isMirrored) {
				left = grid.getFreezeWindowWidth() - left - this._drawDiv.offsetWidth;
			} else {			
				left -= geometry.GRID_HEADER_WIDTH;
			}
			top -= this._grid.geometry.GRID_HEADER_HEIGHT;
			bFrozen = true;
			break;
		case this.containerMap.RIGHTTOP:
			bFrozen = true;
			if (!grid.isMirrored) {
				left = left	+ this._grid.getFreezeWindowWidth();
			} else {
				left = geometry.getGridWidth(true) - left - this._drawDiv.offsetWidth;
			}
			if (this._grid.freezeCol > 0) {
				left -= this.interval;
			}
			if (scroller.firstVisibleCol > grid.freezeCol + 1) {
				left += geometry.colWidth(grid.freezeCol + 1, scroller.firstVisibleCol - 1);
			}
			top -= this._grid.geometry.GRID_HEADER_HEIGHT;
			absTop -= this._grid.geometry.GRID_HEADER_HEIGHT;
			break;
		case this.containerMap.LEFTBOTTOM:
			if (!this.rangeInfo.isRelative) {
				absTop = absTop + this._grid.getFreezeWindowHeight();
				if (this._grid.freezeRow > 0) {
					absTop -= this.interval;
				}
			}
			if (grid.isMirrored) {
				left = grid.getFreezeWindowWidth() - left - this._drawDiv.offsetWidth;
			} else {			
				left -= geometry.GRID_HEADER_WIDTH;
			}
			break;
		case this.containerMap.RIGHTBOTTOM:
			if (!this.rangeInfo.isRelative) {
				absTop = absTop + this._grid.getFreezeWindowHeight();
				if (this._grid.freezeRow > 0) {
					absTop -= this.interval;
				}
			}
			if (!grid.isMirrored) {
				left = left	+ this._grid.getFreezeWindowWidth();
			} else {
				left = geometry.getGridWidth(true) - left - this._drawDiv.offsetWidth;
			}
			if (this._grid.freezeCol > 0) {
				left -= this.interval;
			}
			if (scroller.firstVisibleCol > grid.freezeCol + 1) {
				left += geometry.colWidth(grid.freezeCol + 1, scroller.firstVisibleCol - 1);
			}
			break;
		default:
			break;
		}
		position.top = top, position.left = left, position.absTop = absTop, position.bFrozen = bFrozen;
		return position;
	},
	
	/**
	 * Get offset X/Y of this image 
	 */
	getOffset: function() {
		this._resetParentNode();
		var ox, oy, bFreezeArea = false;//offsetX offsetY
		ox = this._drawDiv.offsetLeft;
		oy = this._drawDiv.offsetTop;	
		switch (this.container.containerMap) {
		case this.containerMap.LEFTTOP:	
			bFreezeArea = true;
			break;
		case this.containerMap.RIGHTTOP:
			if(!this._grid.isMirrored)
				ox = ox + this._grid.getFreezeWindowWidth();
			bFreezeArea = true;
			break;
		case this.containerMap.LEFTBOTTOM:
			break;
		case this.containerMap.RIGHTBOTTOM:
			if(!this._grid.isMirrored)
				ox = ox + this._grid.getFreezeWindowWidth();
			break;
		default:
			break;	
		}
		return {x: ox, y:oy, freeze:bFreezeArea};
	},
	
	/**
	 * This method is used to get unique id for ID, since range id unique, it will be unique. 
	 */
	getDivId: function() {
		return this.rangeInfo.range.getId()+"Div";
	},
	
	getImagePosInfo:function(){
		return {
			left:this.oriLeft, 
			top:this.oriTop,
			width:this.oriWidth, 
			height:this.oriHeight
		};
	},

	getFramePosInfo: function () {
		return {
			left:this._drawDiv.offsetLeft,
			top:this._drawDiv.offsetTop,
			width:this._drawDiv.offsetWidth, 
			height:this._drawDiv.offsetHeight
		};
	},
	
	hideMsg: function () {
		if (this.msgNode) {
			this.msgNode.style.display = "none";
		}
	},

	hideSelectRect: function (grid) {
		if (grid) {
			grid.selection.hideSelectors();
		}
	},
	
	hide: function () {
		this._drawDiv.style.display = "none";
		this._hideImageResizeDivs();
	},
	
	hideImageResizeDivs: function () {	
		if (!this.resizeDivVisible) {
			return;
		}
		this._hideImageResizeDivs();
		this.resizeDivVisible = false;	
		this.isMoving= false;	
		this.isResizing = false; 
	},
	
	/**
	 * [COMMON CODE]
	 * If the image is appended to frozen area
	 */
	inFrozenArea: function() {
		return ((this.container.containerMap == this.containerMap.LEFTTOP)||
				(this.container.containerMap == this.containerMap.RIGHTTOP));
	},
	
	isHidden: function(){
		return this._drawDiv.style.display == "none";
	},
	
	isSelected: function(){
		return this.resizeDivVisible? true:false;
	},

	resize: function(e) {		
		if (this.isResizing) {
			 if (this.resizeTime) {
				 clearTimeout(this.resizeTime);  
				 this.resizeTime = null; 
			 }
			 var X = parseInt(e.clientX); 
			 var Y = parseInt(e.clientY);		
			 this.resizeTime= setTimeout(dojo.hitch(this,this._resize, X, Y)); 		
		}
	},
	
	resetCuror: function(){	
		if (!this.isResizing) {
			this.direction =null;		
			this.setEventListener();
		}
	},
	
	setFocus: function() {},
	 
	showMsg: function (msg) {
		if (!this.msgNode || !this.msgNode.parentNode) {
			this.msgNode = dojo.create("div", {
				style: {
					position: "absolute",
					fontWeight: "bold",
					fontSize: "12pt"
				}
			}, this._drawDiv);
		}
		
		this.msgNode.innerHTML = msg;
		this.msgNode.style.display = "";
		var l = (this._drawDiv.offsetWidth - this.msgNode.offsetWidth)/2;
		if(l<0) l=0;
		this.msgNode.style.left = l + 'px';
		var t = (this._drawDiv.offsetHeight - this.msgNode.offsetHeight)/ 2;
		if(t<0) t=0;
		this.msgNode.style.top = t + 'px';
	},
	
	 showImageResizeDivs: function(){
		 if(this.isHidden())
			 return;
		 if(this.resizeDivVisible) 
			 return;
		 this._grid.editor.getCommentsHdl().collapseCommentsByFocus(true);
		 //dojo.publish(websheet.Constant.APIEvent.SELECTION_CHANGE);
		 this._grid.hideDVInfo();
		 concord.util.events.publish(concord.util.events.commentButtonDisabled,[true]);
		 this._grid.editor.getDrawFrameHdl().unSelectDrawFrames(this.rangeInfo.range.getSheetName());
		 if(this._grid.isEditing()){
			 try{
				 this._grid.apply();
				 setTimeout(dojo.hitch(this, this.hideSelectRect, this._grid),100);	
			 }catch(e){}
		 }else
			 this.hideSelectRect(this._grid);
		 
		 this.updateResizeDivs();
		 this._showImageResizeDivs(); 
		 this.resizeDivVisible = true;
	},
		
	sendPositionChangedMessage: function(preTopLeftCellInfo,topLeftCellInfo,preRightBottomCellInfo,rightBottomCellInfo)
	{
		var isAttrsEmpty = true;
		var attrs ={};
		if(this.newAlt != null)
		{
			attrs["alt"] = this.newAlt || "";
			this.newAlt = null;
			isAttrsEmpty = false;
		}
		
		if(topLeftCellInfo){
			if(preTopLeftCellInfo.rowIndex == topLeftCellInfo.rowIndex && preTopLeftCellInfo.colIndex == topLeftCellInfo.colIndex &&
					preRightBottomCellInfo.rowIndex == rightBottomCellInfo.rowIndex && preRightBottomCellInfo.colIndex == rightBottomCellInfo.colIndex){
				var pos = this.getRenderDivPosition();
				var newLeft = pos.left ; 
				var newTop = pos.top ;
				var newWidth =  this._drawDiv.offsetWidth;
				var newHeight = this._drawDiv.offsetHeight;
				var newRight = newLeft + newWidth; 
				var newBottom = newTop + newHeight;	
				
				if(newLeft != this.oriLeft){
					attrs["x"] = topLeftCellInfo["colOffset"];
					isAttrsEmpty = false;
				}
				if(newTop != this.oriTop){
					attrs["y"] = topLeftCellInfo["rowOffset"];
					isAttrsEmpty = false;
				}			
				if(newRight != this.oriLeft + this.oriWidth || this.rangeInfo.range.data.ex == -1){
					attrs["ex"] = rightBottomCellInfo["colOffset"];
					isAttrsEmpty = false;
				}
				if(newBottom != this.oriTop + this.oriHeight || this.rangeInfo.range.data.ey == -1){
					attrs["ey"] = rightBottomCellInfo["rowOffset"];
					isAttrsEmpty = false;
				}			
				if(newWidth != this.oriWidth){
					attrs["w"] = newWidth;
					isAttrsEmpty = false;
				}
				if(newHeight != this.oriHeight){
					attrs["h"] = newHeight;
					isAttrsEmpty = false;
				}
				if(isAttrsEmpty)
					return;
				var rangeInfo = this.rangeInfo.range._getRangeInfo();
				if(preTopLeftCellInfo.rowIndex != rangeInfo.startRow - 1 || preTopLeftCellInfo.colIndex != topLeftCellInfo.colIndex ||
						preRightBottomCellInfo.rowIndex == rangeInfo.endRow - 1 || preRightBottomCellInfo.colIndex == rangeInfo.endCol){
					var params = {refMask: websheet.Constant.RANGE_MASK};
					var newAddr = websheet.Helper.getAddressByIndex(this._grid.sheetName, topLeftCellInfo.rowIndex + 1, websheet.Helper.getColChar(topLeftCellInfo.colIndex),
									null,rightBottomCellInfo.rowIndex + 1, websheet.Helper.getColChar(rightBottomCellInfo.colIndex), params);
					this.manager.setDrawFrame(this.rangeInfo.range.getId(), {newAddr : newAddr, attrs : attrs});
				}else{			
					this.manager.setDrawFrame(this.rangeInfo.range.getId(), {attrs : attrs});
				}
			}
			else{
				var params = {refMask: websheet.Constant.RANGE_MASK};
				var newAddr = websheet.Helper.getAddressByIndex(this._grid.sheetName, topLeftCellInfo.rowIndex + 1, websheet.Helper.getColChar(topLeftCellInfo.colIndex),
								null,rightBottomCellInfo.rowIndex + 1, websheet.Helper.getColChar(rightBottomCellInfo.colIndex), params);
				var pos = this.getRenderDivPosition();
				var newLeft = pos.left ; 
				var newTop = pos.top ;
				var newWidth =  this._drawDiv.offsetWidth;
				var newHeight = this._drawDiv.offsetHeight;
				var newRight = newLeft + newWidth; 
				var newBottom = newTop + newHeight;	
				
				if(newLeft != this.oriLeft){
					attrs["x"] = topLeftCellInfo["colOffset"];
					isAttrsEmpty = false;
				}
				if(newTop != this.oriTop){
					attrs["y"] = topLeftCellInfo["rowOffset"];
					isAttrsEmpty = false;
				}
				if(newRight != this.oriLeft + this.oriWidth || this.rangeInfo.range.data.ex == -1 || this.rangeInfo.range.data.ex == 0){
					attrs["ex"] = rightBottomCellInfo["colOffset"];
					isAttrsEmpty = false;
				}
				if(newBottom != this.oriTop + this.oriHeight || this.rangeInfo.range.data.ey == -1 || this.rangeInfo.range.data.ey == 0){
					attrs["ey"] = rightBottomCellInfo["rowOffset"];
					isAttrsEmpty = false;
				}
				if(newWidth != this.oriWidth){
					attrs["w"] =  newWidth;
					isAttrsEmpty = false;
				}
				if(newHeight != this.oriHeight){
					
					attrs["h"] = newHeight;
					isAttrsEmpty = false;
				}		
				
				if(isAttrsEmpty)
					return;				
				this.manager.setDrawFrame(this.rangeInfo.range.getId(),{newAddr : newAddr, attrs : attrs});
			}
		}else{
			//absolute position shape.
			var pos = this.getRenderDivPosition();;	
			var newLeft = pos.left; 
			var newTop = pos.absTop || pos.top;	
			var newWidth =  this._drawDiv.offsetWidth;
			var newHeight = this._drawDiv.offsetHeight;
			if(newLeft != this.oriLeft){
				attrs["x"]= newLeft; 
				isAttrsEmpty = false;
			}
			if(pos.top != this.oriTop){
				attrs["y"] = newTop + (pos.bFrozen ? 0 : this._grid.scroller.scrollTop); 
				isAttrsEmpty = false;
			}	
			
			if(newWidth != this.oriWidth){
				attrs["w"] = newWidth;
				isAttrsEmpty = false;
			}
			if(newHeight != this.oriHeight){			
				attrs["h"] = newHeight;
				isAttrsEmpty = false;
			}		
			
			if(isAttrsEmpty)
				return;
			
			this.manager.setDrawFrame(this.rangeInfo.range.getId(),  {attrs : attrs});
		}
	},
	
	startResize: function(obj, e){	
		var bMBrowser = pe.scene.bMobileBrowser;
		if(e && dojo.mouseButtons.isLeft(e) || bMBrowser){
			dojo.stopEvent(e);
			if(bMBrowser) {
				this.touchStartEvent = dojo.mixin({}, e);
			}
			if(this.isMoving || this.isResizing) return;
			websheet.Utils.setSelectable(dojo.body(),false);
			// setCapture to fix 12228: When user loosen the mouse, image still resize with the moving of mouse.
			//should releaseCapture when end Resize
			if(dojo.isIE && obj){
				obj.setCapture();
				this.objCaptured = obj;
			}
			if(dojo.isChrome){
				var formulaBar = this._grid.editor.getFormulaBar();
				if (formulaBar) formulaBar.disable(true);
			}
			this.isResizing = true;	
			this.setEventListener(true);
			this.cacheOriPosition(e);
		}	
		else if(e && dojo.mouseButtons.isRight(e))
			this.selectDrawFrame(e);
		this.doUpdateContextMenu(e);
	},
	
	validTargetPos:function(X, Y){
		var delta = this._grid.isMirrored ? this.oriX - X : X - this.oriX;
		if(this.direction == this.directionMap.TOPLEFT)
			return this._grid.getCellInfoWithPosition(this.oriLeft + delta  , this.oriTop + Y - this.oriY, false, false, this.inFrozenArea());
		
		if(this.direction == this.directionMap.TOP)		
			return this._grid.getCellInfoWithPosition(this.oriLeft, this.oriTop + Y - this.oriY, false, false, this.inFrozenArea());
		
		if(this.direction == this.directionMap.TOPRIGHT)
			return this._grid.getCellInfoWithPosition(this.oriLeft + this.oriWidth + delta, this.oriTop + Y - this.oriY, false, true, this.inFrozenArea());
		
		if(this.direction == this.directionMap.RIGHT)
			return this._grid.getCellInfoWithPosition(this.oriLeft + this.oriWidth + delta, this.oriTop, false, true, this.inFrozenArea());
		
		if(this.direction == this.directionMap.BOTTOMRIGHT)
			return this._grid.getCellInfoWithPosition(this.oriLeft + this.oriWidth + delta, this.oriTop + this.oriHeight + Y - this.oriY, true, true, this.inFrozenArea());
		
		if(this.direction == this.directionMap.BOTTOM)		
			return this._grid.getCellInfoWithPosition(this.oriLeft  ,this.oriTop + this.oriHeight + Y - this.oriY, true, false, this.inFrozenArea());
		
		if(this.direction == this.directionMap.BOTTOMLEFT)		
			return this._grid.getCellInfoWithPosition(this.oriLeft + delta, this.oriTop + this.oriHeight + Y - this.oriY, true, false, this.inFrozenArea());
	
		if(this.direction == this.directionMap.LEFT)		
			return this._grid.getCellInfoWithPosition(this.oriLeft + delta, this.oriTop, false, false, this.inFrozenArea());
	},

	selectDrawFrame: function(e){
		this.showImageResizeDivs();
		this.doUpdateContextMenu(e);
		dojo.stopEvent(e);
	},

	startMove: function(e){
		var bMBrowser = pe.scene.bMobileBrowser;
		if(websheet.model.ModelHelper.isSheetProtected()){
			if(dojo.mouseButtons.isRight(e) || bMBrowser)
				this._grid.editor.stopeContextMenu = true;
			dojo.stopEvent(e);
			return;
		}

		if(this._grid.isEditingDialog())
		{
			dojo.stopEvent(e);
			return;
		}
	
		if(bMBrowser) {
			this.touchStartEvent = dojo.mixin({}, e);
		}
		if (this._grid.editor.scene.isViewMode())
		{
			// can't move image in observer mode
			this.doUpdateContextMenu(e);
			dojo.stopEvent(e);
			return;
		}
		
		if(dojo.mouseButtons.isLeft(e) || bMBrowser){
			if(this.isResizing) 
				return;
						
			this.isMoving= true;
			this.cacheOriPosition(e);
			this.showImageResizeDivs();			
		}
		else if(dojo.mouseButtons.isRight(e))
			this.selectDrawFrame(e);
		
		this.doUpdateContextMenu(e);
		dojo.stopEvent(e);
	},
	
	startResizeWithDialog: function(){
		if(this.isMoving) return;
		this.isResizing = true;	
		this.cacheOriPosition();
	},
	
	updateResizeDivs:function(){
		if(!this._divTopLeft){
			var zidx = this._calcZIndex(true);
			this._divTopLeft = dojo.create('div',null,this.container.containerNode); 
			this._divTopLeft.style.zIndex = zidx;
			this._divTopMiddle = dojo.create('div',null,this.container.containerNode);
			this._divTopMiddle.style.zIndex = zidx;
			this._divTopRight = dojo.create('div',null,this.container.containerNode);
			this._divTopRight.style.zIndex = zidx;
			this._divLeft = dojo.create('div',null,this.container.containerNode);
			this._divLeft.style.zIndex = zidx;
			this._divRight = dojo.create('div',null,this.container.containerNode);		
			this._divRight.style.zIndex = zidx;
			this._divBottomLeft = dojo.create('div',null,this.container.containerNode);		
			this._divBottomLeft.style.zIndex = zidx;
			this._divBottomMiddle = dojo.create('div',null,this.container.containerNode);		
			this._divBottomMiddle.style.zIndex = zidx;
			this._divBottomRight = dojo.create('div',null,this.container.containerNode);		
			this._divBottomRight.style.zIndex = zidx;
					
			if(!this._grid.editor.scene.isDocViewMode()){			
				this._divTopLeft.style.cursor="nw-resize";
				this._divTopMiddle.style.cursor="n-resize";
				this._divTopRight.style.cursor="ne-resize";
				this._divLeft.style.cursor="w-resize";
				this._divRight.style.cursor="e-resize";
				this._divBottomLeft.style.cursor="sw-resize";
				this._divBottomMiddle.style.cursor="s-resize";
				this._divBottomRight.style.cursor="se-resize";
				
				this._connects.push(dojo.connect(this._divTopLeft,dojo.touch.over,dojo.hitch(this,this.prepareResize,this.directionMap.TOPLEFT)));
				this._connects.push(dojo.connect(this._divTopLeft,dojo.touch.out,dojo.hitch(this,this.resetCuror)));	
				this._connects.push(dojo.connect(this._divTopLeft,dojo.touch.press,dojo.hitch(this,this.startResize, this._divTopLeft)));
				this._connects.push(dojo.connect(this._divTopMiddle,dojo.touch.over,dojo.hitch(this,this.prepareResize,this.directionMap.TOP)));
				this._connects.push(dojo.connect(this._divTopMiddle,dojo.touch.out,dojo.hitch(this,this.resetCuror)));
				this._connects.push(dojo.connect(this._divTopMiddle,dojo.touch.press,dojo.hitch(this,this.startResize, this._divTopMiddle)));
				this._connects.push(dojo.connect(this._divTopRight,dojo.touch.over,dojo.hitch(this,this.prepareResize,this.directionMap.TOPRIGHT)));
				this._connects.push(dojo.connect(this._divTopRight,dojo.touch.out,dojo.hitch(this,this.resetCuror)));
				this._connects.push(dojo.connect(this._divTopRight,dojo.touch.press,dojo.hitch(this,this.startResize, this._divTopRight)));
				this._connects.push(dojo.connect(this._divLeft,dojo.touch.over,dojo.hitch(this,this.prepareResize,this.directionMap.LEFT)));	
				this._connects.push(dojo.connect(this._divLeft,dojo.touch.out,dojo.hitch(this,this.resetCuror)));
				this._connects.push(dojo.connect(this._divLeft,dojo.touch.press,dojo.hitch(this,this.startResize, this._divLeft)));
				this._connects.push(dojo.connect(this._divRight,dojo.touch.over,dojo.hitch(this,this.prepareResize,this.directionMap.RIGHT)));
				this._connects.push(dojo.connect(this._divRight,dojo.touch.out,dojo.hitch(this,this.resetCuror)));	
				this._connects.push(dojo.connect(this._divRight,dojo.touch.press,dojo.hitch(this,this.startResize, this._divRight)));
				this._connects.push(dojo.connect(this._divBottomLeft,dojo.touch.over,dojo.hitch(this,this.prepareResize,this.directionMap.BOTTOMLEFT)));
				this._connects.push(dojo.connect(this._divBottomLeft,dojo.touch.out,dojo.hitch(this,this.resetCuror)));
				this._connects.push(dojo.connect(this._divBottomLeft,dojo.touch.press,dojo.hitch(this,this.startResize, this._divBottomLeft)));
				this._connects.push(dojo.connect(this._divBottomMiddle,dojo.touch.over,dojo.hitch(this,this.prepareResize,this.directionMap.BOTTOM)));
				this._connects.push(dojo.connect(this._divBottomMiddle,dojo.touch.out,dojo.hitch(this,this.resetCuror)));
				this._connects.push(dojo.connect(this._divBottomMiddle,dojo.touch.press,dojo.hitch(this,this.startResize, this._divBottomMiddle)));
				this._connects.push(dojo.connect(this._divBottomRight,dojo.touch.over,dojo.hitch(this,this.prepareResize,this.directionMap.BOTTOMRIGHT)));
				this._connects.push(dojo.connect(this._divBottomRight,dojo.touch.out,dojo.hitch(this,this.resetCuror)));
				this._connects.push(dojo.connect(this._divBottomRight,dojo.touch.press,dojo.hitch(this,this.startResize, this._divBottomRight)));
			}
			this._divTopLeft.style.display = "none";  
			this._divTopMiddle.style.display = "none";  
			this._divTopRight.style.display = "none";  
			this._divLeft.style.display = "none";  
			this._divRight.style.display = "none";  
			this._divBottomLeft.style.display = "none";  
			this._divBottomMiddle.style.display = "none"; 
			this._divBottomRight.style.display = "none";		
		}
		var pos = this._drawDiv.getBoundingClientRect();	
			
		var drawDivTop = this._drawDiv.offsetTop;
		var drawDivLeft = this._drawDiv.offsetLeft;
		this._divTopLeft.className = this.resizeDivClass;
	    this._divTopLeft.style.top = drawDivTop - this.offsetPixel + "px";
		this._divTopLeft.style.left =drawDivLeft -this.offsetPixel + "px";
		
		this._divTopMiddle.className  =this.resizeDivClass;
	    this._divTopMiddle.style.top = drawDivTop - this.offsetPixel + "px";
		this._divTopMiddle.style.left =drawDivLeft + ((pos.right - pos.left - 2*this.offsetPixel)/2 )  + "px";   
		
		this._divTopRight.className  =this.resizeDivClass;
	    this._divTopRight.style.top = drawDivTop - this.offsetPixel + "px";
		this._divTopRight.style.left =drawDivLeft+ (pos.right - pos.left - this.offsetPixel) + "px";	
		
		this._divLeft.className  =this.resizeDivClass;
	    this._divLeft.style.top = drawDivTop + ((pos.bottom - pos.top - 2*this.offsetPixel)/2)+ "px";
		this._divLeft.style.left = drawDivLeft -this.offsetPixel + "px";	
		
		this._divRight.className  =this.resizeDivClass;
	    this._divRight.style.top = drawDivTop + ((pos.bottom - pos.top - 2*this.offsetPixel)/2)+ "px";
		this._divRight.style.left =drawDivLeft + ( pos.right - pos.left - this.offsetPixel)  + "px";	
		
		this._divBottomLeft.className  =this.resizeDivClass;
	    this._divBottomLeft.style.top =drawDivTop + pos.bottom - pos.top - this.offsetPixel + "px";
		this._divBottomLeft.style.left =drawDivLeft - this.offsetPixel + "px";	
		  
		this._divBottomMiddle.className  =this.resizeDivClass;
	    this._divBottomMiddle.style.top =drawDivTop + pos.bottom - pos.top - this.offsetPixel + "px";
		this._divBottomMiddle.style.left =drawDivLeft + ((pos.right - pos.left - 2*this.offsetPixel)/2)  + "px";   
		
		this._divBottomRight.className  =this.resizeDivClass;
	    this._divBottomRight.style.top = drawDivTop + pos.bottom - pos.top - this.offsetPixel + "px";
		this._divBottomRight.style.left = drawDivLeft + pos.right - pos.left - this.offsetPixel + "px";
	},
	

	/**
	 * Create the draw Div dom node 
	 */
	_createDrawDivBoxNode: function () {
	 	this._drawDiv = dojo.create('div',null,this.container.containerNode);
		this._drawDiv.id = this.getDivId();
	    this._drawDiv.style.backgroundColor = "#FFFFFF";
	    this._drawDiv.style.position= "absolute";
	    this._drawDiv.style.outline= "none";
	    this._drawDiv.style.zIndex = this._calcZIndex();
	    dojo.attr(this._drawDiv, "tabIndex", -1);
	    this._setRenderDivPosition(this.rangeInfo.y, this.rangeInfo.x);	
		this._drawDiv.style.display = "";	
		this._drawDiv.style.overflow = "hidden";
	},
	
	/**
	 * [COMMON CODE]
	 * Return the zIndex of the image DIV, the zIndex is the cascading relationship between images and is
	 * relevant to the image's parent node.
	 * @param bOffset, if given, it must be used as the resizeDivs' zIndex attributes.
	 * @returns the ZIndex
	 */
	_calcZIndex: function(bOffset){
		var containerZ = dojo.style(this._drawDiv.parentNode, "zindex");
		if(containerZ)
			containerZ = parseInt(containerZ);
		if(bOffset)
			containerZ = containerZ ? containerZ + this.offsetZIndex : this.offsetZIndex;
		else
			containerZ = containerZ ? containerZ : 0;
		return this.zIndex + containerZ;
	},
	/**
	 * [COMMON CODE]
	 * Return the information about the image DIV's parent node. 
	 * According to the image's range, it may be appended to different parent nodes, there may be four DIVs to which
	 * the image will be adhered.
	 * One principle is that, IMAGE can not be drawn in frozen area unless it is very small (the size is smaller than the frozen area), otherwise it
	 * will not be rendered.
	 * @returns {renderOffset} the node reference of the container and the position defined in this.containerMap.
	 */
	_calcContainer: function (rangeInfo) {
		if(!rangeInfo)	var rangeInfo = this.rangeInfo.range._getRangeInfo();
		var grid = this._grid;
		var renderOffset = {};
		var bRelative = this.rangeInfo.isRelative;
		if (bRelative) {
			renderOffset.containerMap = rangeInfo.startRow <= grid.freezeRow ?
					(rangeInfo.startCol <= grid.freezeCol ?  this.containerMap.LEFTTOP : this.containerMap.RIGHTTOP) : 
					(rangeInfo.startCol <= grid.freezeCol ?	this.containerMap.LEFTBOTTOM : this.containerMap.RIGHTBOTTOM);
		} else {
			var x = this.rangeInfo.range.data.x, y = this.rangeInfo.range.data.y, fh = Math.max(0, grid.getFreezeWindowHeight() - this.interval), fw = Math.max(0, grid.getFreezeWindowWidth() - this.interval);
			renderOffset.containerMap = x >= fw ? 
					(y >= fh ? this.containerMap.RIGHTBOTTOM: this.containerMap.RIGHTTOP):/*right*/
					(y >= fh ? this.containerMap.LEFTBOTTOM	: this.containerMap.LEFTTOP);/*left*/
		}
		renderOffset.containerNode = (renderOffset.containerMap == this.containerMap.LEFTTOP) ?
				grid.ltSubviewNode 	 : 	(renderOffset.containerMap == this.containerMap.RIGHTTOP) ?
						grid.rtSubviewNode	 :	(renderOffset.containerMap == this.containerMap.LEFTBOTTOM) ?
								grid.lbSubviewNode	 :	grid.rbSubviewNode;
		return renderOffset;
	},
	
	_hideImageResizeDivs: function(){
		if (this._divTopLeft) {
			  this._divTopLeft.style.display = "none";  
			  this._divTopMiddle.style.display = "none";  
			  this._divTopRight.style.display = "none";  
			  this._divLeft.style.display = "none";  
			  this._divRight.style.display = "none";  
			  this._divBottomLeft.style.display = "none";  
			  this._divBottomMiddle.style.display = "none"; 
			  this._divBottomRight.style.display = "none"; 	 
		}
	},
	
	/**
	 * this method is called to resized the image based on the mouse position
	 * @param e the event which include the mouse position
	 */
	_resize:function(X, Y){
		if(X == this.oriX && Y == this.oriY)
			return;
	    var pos = this._drawDiv.getBoundingClientRect();
	    if(this.direction ==this.directionMap.RIGHT || this.direction ==this.directionMap.BOTTOMRIGHT ||  this.direction ==this.directionMap.TOPRIGHT){
	    	var width =  this.oriWidth + (X - this.oriX) ;
	    	if(width >0){    		
	    		var cellInfo =this.validTargetPos(X,Y);   
	    		this._drawDiv.style.width = width - cellInfo.colReviseOffset +"px";
	    	}
	    }
	    if(this.direction ==this.directionMap.LEFT || this.direction ==this.directionMap.BOTTOMLEFT ||  this.direction ==this.directionMap.TOPLEFT){
	    	var width =  this.oriWidth  - (X - this.oriX);
	    	if(width >0){
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
	    		this._drawDiv.style.left = left + "px";	    	
	    		this._drawDiv.style.width = width + cellInfo.colReviseOffset + "px";
	    	}
	    }
	  if(this.direction ==this.directionMap.BOTTOM || this.direction ==this.directionMap.BOTTOMRIGHT || this.direction ==this.directionMap.BOTTOMLEFT ){ 
	    	var height = this.oriHeight  +(Y - this.oriY);
	    	if(height >0){
	    		var cellInfo = this.validTargetPos(X,Y); 			
	    		this._drawDiv.style.height = height - cellInfo.rowReviseOffset + "px";
	    	}
	    }
	  if(this.direction ==this.directionMap.TOP||  this.direction ==this.directionMap.TOPRIGHT ||  this.direction ==this.directionMap.TOPLEFT){
		  var height = this.oriHeight  - (Y - this.oriY);
	    	if(height >0){
	    		var cellInfo = this.validTargetPos(X,Y);   		
	    		var top = this.oriTop + (Y - this.oriY) - cellInfo.rowReviseOffset;  
	    		this._drawDiv.style.top = top + "px";	       	
	    		this._drawDiv.style.height =height +cellInfo.rowReviseOffset +"px";
	    	}
	    }   
	  
	  this.updateResizeDivs();
	},
	
	/**
	 * [COMMON CODE][Freeze Window]
	 *	FIXME CC, comments tbd... should call this if freeze window in a new position to help draw the image in the right
	 *	position.
	 */
	_resetParentNode: function(){
		this.container = this._calcContainer();
		if(this._drawDiv.parentNode == this.container.containerNode){
			return;
		}else{
			this.container.containerNode.appendChild(this._drawDiv);
			if(!this._divTopLeft) return;
			this.container.containerNode.appendChild(this._divTopLeft);
			this.container.containerNode.appendChild(this._divTopMiddle);
			this.container.containerNode.appendChild(this._divTopRight);
			this.container.containerNode.appendChild(this._divBottomLeft);
			this.container.containerNode.appendChild(this._divBottomMiddle);
			this.container.containerNode.appendChild(this._divBottomRight);
			this.container.containerNode.appendChild(this._divLeft);
			this.container.containerNode.appendChild(this._divRight);
		}
	},
	
	_showImageResizeDivs: function(){
		if(this._divTopLeft){
			 this._divTopLeft.style.display = "";  
			 this._divTopMiddle.style.display = "";  
			 this._divTopRight.style.display = "";  
			 this._divLeft.style.display = "";  
			 this._divRight.style.display = "";  
			 this._divBottomLeft.style.display = "";  
			 this._divBottomMiddle.style.display = ""; 
			 this._divBottomRight.style.display = ""; 
		}
	},
	
	_setFocus : function (div) {
		if (!div) {
			return;
		}
		if (dojo.isWebKit || dojo.isIE) {
			//Set focus will cause screen vibrate on safari and IE, so disable it
			// but we need to make dojo to know this div has been virtual 'focused';
			var singleton = require("dijit/focus");
			if (singleton) {
				singleton._onFocusNode(div);
				if(dojo.isSafari){
					var editor = this._grid.editor;
					//setTimeout(function () {
						var inLineEditor = editor.getController().getInlineEditor();
						inLineEditor.focus();
					//}, 500);
				}
				singleton.set("curNode", null);
			}
			return;
		}
		
		var x = window.scrollX, y = window.scrollY;
		div.focus();
		window.scrollTo(x, y);
	 },
	 
	/**
	 * [COMMON CODE]
	 * Locate the image DIV in the right position,
	 * top, left are calculated in ImageHandler, and are relative to grid content node,
	 * Since image DIVs are created in four different child nodes of grid content node, need to correct the positions
	 * here.
	 * Return the {top: actually set top, left: actually set left}
	 */
	_setRenderDivPosition: function(_top, _left, needReviseLeft/*, movingSet*/){
		var top, left;
		if( _top != undefined )
			top = _top, left = _left;
		else
			top = this.rangeInfo.y, left = this.rangeInfo.x;
		var grid = this._grid;
		var geometry = grid.geometry;
		var 
			fwh = grid.getFreezeWindowHeight(), 
			fww = grid.getFreezeWindowWidth(),
			imh = this.redrawHeight || this._drawDiv.offsetHeight, 
			imw = this.redrawWidth || this._drawDiv.offsetWidth || this.rangeInfo.range.data.w, //add data.w in case of newly inserted image
			interval = this.interval;
		switch (this.container.containerMap) {
		case this.containerMap.LEFTTOP:
			//Invalid set.
//			top -= geometry.GRID_HEADER_HEIGHT;
			// we contain the header height in the container...;
//			left -= geometry.GRID_HEADER_WIDTH;
			// we contain the header width in the continaer;
			
//			var overstep = false;
			if (top + imh > fwh - interval)	{
				top = fwh - imh - interval;
//				overstep = true;
			}
			if (top < 0) {
				top = 0;
//				overstep = true;
			}
			if (left + imw > fww - interval) {
				left = fww - imw - interval;
//				overstep = true;
			}
			if(left < 0) {
				left = 0;
//				overstep = true;
			}
			top += geometry.GRID_HEADER_HEIGHT;
			if (grid.isMirrored) {
				left = fww - left - imw;
			} else {			
				left += geometry.GRID_HEADER_WIDTH;
			}
//			if (movingSet && !overstep) {
//				top += geometry.GRID_HEADER_HEIGHT;
//				left += geometry.GRID_HEADER_WIDTH;
//			}
			break;
		case this.containerMap.RIGHTTOP:
			if (!grid.isMirrored) {
				left = left	- fww;
			}
			if (grid.freezeCol > 0 && needReviseLeft) {
				left += interval;
			}
			//Invalid set.
//			top -= geometry.GRID_HEADER_HEIGHT;
//			var overstep = false;
			if (top + imh > fwh - interval)	{
				top = fwh - imh - interval;
//				overstep = true;
			}
			if (top < 0) {
				top = 0;
//				overstep = true;
			}
			if (left < 0) {
				left = 0;
			}
			if (grid.scroller.firstVisibleCol > grid.freezeCol + 1) {
				left -= geometry.colWidth(grid.freezeCol + 1, grid.scroller.firstVisibleCol - 1);
			}
			if (grid.isMirrored) {
				left = geometry.getGridWidth(true) - left - imw;
			}
			top += geometry.GRID_HEADER_HEIGHT;
//			if (movingSet && !overstep) {
//				top += geometry.GRID_HEADER_HEIGHT;
//			}
			break;
		case this.containerMap.LEFTBOTTOM:
//			left -= geometry.GRID_HEADER_WIDTH;
			if (left + imw > fww - interval) {
				left = fww - imw - interval;
			}
			if(left < 0) {
				left = 0;
			}
			if(top + grid.scroller.scrollTop - 1 < 0 ) {
				top = - grid.scroller.scrollTop + 1;
			}
			if (grid.isMirrored) {
				left = fww - left - imw;
			} else {			
				left += geometry.GRID_HEADER_WIDTH;
			}
			break;
		case this.containerMap.RIGHTBOTTOM:
			if (!grid.isMirrored) {
				left = left	- fww;
			}
			if (grid.freezeCol > 0 && needReviseLeft){
				left += interval;
			}
			if (left < 0) {
				left = 0;
			}
			if (grid.scroller.firstVisibleCol > grid.freezeCol + 1) {
				left -= geometry.colWidth(grid.freezeCol + 1, grid.scroller.firstVisibleCol - 1);
			}
			if (grid.isMirrored) {
				left = geometry.getGridWidth(true) - left - imw;
			}
			if(top + grid.scroller.scrollTop - 1 < 0 )	{
				top = -grid.scroller.scrollTop + 1;
			}
			break;
		}
		this._drawDiv.style.top 	=	top + "px";
		this._drawDiv.style.left 	=	left + "px";
	    this._drawDiv.style.width 	=	this.rangeInfo.range.data.w + "px";
	    this._drawDiv.style.height	=	this.rangeInfo.range.data.h + "px";
	    return {top: top, left:left};
	},
	
	
	/**
	   * Destroy the editor after parent grid is destroy.
	   */
	destroy: function()
	{
		this.disconnectHandler();
		this.disImageResizeDivconnectstHandler();
	    if (this._drawDiv )
	    {
	    	dojo.destroy(this._drawDiv);
			delete this._drawDiv;	    	
		}
	    
		if(this._divTopLeft){
			dojo.destroy(this._divTopLeft);
			delete this._divTopLeft;
			dojo.destroy(this._divTopMiddle);
			delete this._divTopMiddle;
			dojo.destroy(this._divTopRight);
			delete this._divTopRight;
			dojo.destroy(this._divLeft);
			delete this._divLeft;
			dojo.destroy(this._divRight);
			delete this._divRight;
			dojo.destroy(this._divBottomLeft);
			delete this._divBottomLeft;
			dojo.destroy(this._divBottomMiddle);
			delete this._divBottomMiddle;
			dojo.destroy(this._divBottomRight);
			delete this._divBottomRight;	
		}
	}	
});