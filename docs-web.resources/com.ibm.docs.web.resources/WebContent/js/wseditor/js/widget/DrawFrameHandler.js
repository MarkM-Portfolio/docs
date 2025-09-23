/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* U.S. Government Users Restricted Rights: Use, duplication or      */
/* disclosure restricted by GSA ADP Schedule Contract with IBM Corp. */
/*                                                                   */
/* ***************************************************************** */

dojo.provide("websheet.widget.DrawFrameHandler");

dojo.declare("websheet.widget.DrawFrameHandler", websheet.listener.Listener, {
	// module:
	///
	// summary:
	//		A basic handler for shapes such as chart and image. 
	//		Basic methods to render shapes(position).
	//		DrawFrameDiv 
	//		Msgs to del, move or resize shapes
	
	
	_rowsHeightMap			: null, // format {rowIndex, height} rowIndex 1-based
	_colsWidthMap			: null, // format {colIndex, width} colIndex 1-based
	isLoadingDraw			: false,
	
	_areaMgr				: null,
	usage					: null,
	editor					: null,
	
	drawFrameDivMap:{},
	
	constructor: function(editor) {
		var docObj = editor.getDocumentObj();
		this._areaMgr = docObj.getAreaManager();
		this.editor = editor;
	},
	
	reset: function(){
    	if(this.drawFrameDivMap)
    		delete this.drawFrameDivMap;  
    	this.drawFrameDivMap={};
    },    

    destroy: function(){
    	if(this.drawFrameDivMap)
    		delete this.drawFrameDivMap;    	
    },
    
    addDrawFrameDiv2Map: function(sheetName, Id, DrawFrameDiv){
    	var drawFrameSheetMap = this.getDrawFrameMapBySheetName(sheetName);
    	if(!drawFrameSheetMap){
    		drawFrameSheetMap ={};
    		this.drawFrameDivMap[sheetName] = drawFrameSheetMap;
    	}
    	drawFrameSheetMap[Id] = DrawFrameDiv;
    },       
        
    getDrawFrameMapBySheetName:function(sheetName){
    	return this.drawFrameDivMap[sheetName] ;
    },
    
    getDrawFrameDivbySheetName:function(sheetName, Id){
    	var drawFrameSheetMap = this.getDrawFrameMapBySheetName(sheetName);
    	if(drawFrameSheetMap){
    		return drawFrameSheetMap[Id] ;
    	}
    	return null;
    }, 
	
    delCachedDrawFrameDiv: function(sheetName, Id){
    	var drawFrameSheetMap = this.getDrawFrameMapBySheetName(sheetName);
    	if(drawFrameSheetMap)
    		delete drawFrameSheetMap[Id];
    },
    
    delSelectedDrawFrames:function(sheetName){
    	var del = false;
    	var drawFrameSheetMap = this.getDrawFrameMapBySheetName(sheetName);
    	if(drawFrameSheetMap){
	    	for(var Id in drawFrameSheetMap){
	    		var drawFrameDiv = drawFrameSheetMap[Id];
	    		if(drawFrameDiv && drawFrameDiv.isSelected()){
	    			drawFrameDiv.delImage();
	    			del = true;
	    		}
	    	}  
    	}
    	return del;
    },    
    
    hasSelectedDrawFrames: function(sheetName){    	
    	var drawFrameSheetMap = this.getDrawFrameMapBySheetName(sheetName);
    	if(drawFrameSheetMap){
	    	for(var id in drawFrameSheetMap){
	    		var drawFrameDiv = drawFrameSheetMap[id];
	    		if(drawFrameDiv && drawFrameDiv.isSelected()){
	    			return true;
	    		}
	    	}  
    	}
    	return false;
    },
       
    unSelectDrawFrames:function(sheetName){
    	var drawFrameSheetMap = this.getDrawFrameMapBySheetName(sheetName);
    	if(drawFrameSheetMap){
	    	for(var Id in drawFrameSheetMap){
	    		var drawFrameDiv = drawFrameSheetMap[Id];
	    		if(drawFrameDiv && drawFrameDiv.isSelected()){
	    			drawFrameDiv.hideImageResizeDivs();
	    		}
	    	}  
    	}
    },
    
 // remove the drawFrame div
	removeDrawFrameFromUI: function(sheetName, id) {
		if(sheetName){
			var drawFrameDiv = this.getDrawFrameDivbySheetName(sheetName,id);
			if(drawFrameDiv){
				drawFrameDiv.destroy();
				this.delCachedDrawFrameDiv(sheetName, id);
			}
			var freezeHdl = this.editor.getFreezeHdl();
			freezeHdl.removeFrameStatus(sheetName, id);
			var controller = this.editor.getController();
			var docObj = this.editor.getDocumentObj();
			var grid = controller.getGrid(sheetName);
			if (grid) {
				grid.updateUI();
			}
		}
	},
    
	prepareCache: function(rangeInfo, grid)
	{
		if (!this._rowsHeightMap) {
			var startRow = rangeInfo.startRow;
			var endRow = rangeInfo.endRow;
        	var canShow = this._isFrameCanShow(startRow, endRow, rangeInfo.startCol, rangeInfo.endCol, grid);
        	if (!canShow.show) {
        		return;
        	}
        	this._rowsHeightMap = {};
        	//do not use the offsetHeight of rowNode in anyview's rowNodes map, not accurate.
        	grid.geometry.fillInRowsHeight(startRow, endRow, this._rowsHeightMap);
        	if (grid.freezeRow > 0) {
        		grid.geometry.fillInRowsHeight(1, grid.freezeRow, this._rowsHeightMap);
        	}
		}
		if (!this._colsWidthMap) {
			this.prepareColsWidth(grid);	
		}
	},
	
	getShapeWidth: function(data,startCol,endCol)
	{
		if(startCol < 0 || endCol <0) return 0;
		var width = 0;
		for(var i = startCol; i < endCol; i++)
		{
			if(this._colsWidthMap[i])
				width += this._colsWidthMap[i];
		}
		var startX = data.x;
		var endX = data.ex;
		startX = startX < this._colsWidthMap[startCol]? startX : this._colsWidthMap[startCol];
		if(endX == -1)
		{
			endX =  this._colsWidthMap[endCol];
		}
		else
		{
			endX = endX < this._colsWidthMap[endCol] ? endX : this._colsWidthMap[endCol];
		}		
		// means the start col is not hidden
		if(this._colsWidthMap[startCol] > 0)
		{
			width -= startX;
		}
		
		if(this._colsWidthMap[endCol] > 0)
		{
			width += endX;
		}
		return width;
	},
	
	getShapeHeight: function(data, startRow,endRow)
	{
		if(startRow < 0 || endRow <0) return 0;
		var height = 0;
		for(var i = startRow; i < endRow; i++)
		{
			if(this._rowsHeightMap[i])
				height += this._rowsHeightMap[i];
		}
		var startY = data.y;
		var endY = data.ey;
		startY = startY < this._rowsHeightMap[startRow] ? startY : this._rowsHeightMap[startRow];
		if(endY == -1)
		{
			endY = this._rowsHeightMap[endRow];
		}
		else
		{
			endY = endY < this._rowsHeightMap[endRow] ? endY : this._rowsHeightMap[endRow];
		}
		// means the start row is not hidden
		if(this._rowsHeightMap[startRow])
		{
			height -= startY;
		}
		if(this._rowsHeightMap[endRow])
		{
			height += endY;
		}
		return height;
	},
	
	_isFrameCanShow: function(startRow, endRow, startCol, endCol, grid, range)
    {
		var result = {show:true, fw:false};
    	var firstVisibleRow = grid.scroller.firstVisibleRow + 1;
        var lastVisibleRow = grid.scroller.lastVisibleRow + 1;
        if (startRow > 0  && startRow <= grid.freezeRow && endRow > grid.freezeRow) {
        	result.show = false;result.fw = true;
        }
        if (startCol > 0 && startCol <= grid.freezeCol && endCol > grid.freezeCol) {
        	result.show = false;result.fw = true;
        }
        
        if (startRow < 0 && startCol < 0) {
        	result.show = false;
        }
        	
        if ((endRow <firstVisibleRow && endRow > grid.freezeRow) || startRow > lastVisibleRow) {
        	result.show = false;
        }
        if (range) {
        	dojo.publish("UpdateFrameStatus", [result.show, result.fw, range]);
        }
        return result;
    },
    
    /*
     * if bStart is true, return the left and top
     * else return bottom and right
     */
    _getBounding: function(rangeInfo, range, grid, bStart)
    {
    	var rowIndex = bStart ? rangeInfo.startRow : rangeInfo.endRow;
    	var colIndex = bStart ? rangeInfo.startCol : rangeInfo.endCol;
    	var newRowIndex = rowIndex, newColIndex = colIndex;
    	//if the start cell in hidden row and col, need to correct it
    	//the rule is find it down right
    	if(bStart)
    	{
    		var maxRow = grid.scroller.lastVisibleRow + 1;
    		var maxCol = websheet.Constant.MaxColumnIndex;
    		while((newRowIndex <= maxRow) && !this._rowsHeightMap[newRowIndex])
    			newRowIndex++;
    		while((newColIndex <= maxCol) &&!this._colsWidthMap[newColIndex])
    			newColIndex++;
    	}
    	// the end cell in hidden row and coll, the rule is find it up left
    	else
    	{
    		while((newRowIndex > 0) && !this._rowsHeightMap[newRowIndex])
    			newRowIndex--;
    		while((newColIndex > 0) &&!this._colsWidthMap[newColIndex])
    			newColIndex--;
    	}
    	var row = newRowIndex - 1, col = newColIndex;
    	var top = left = right = bottom = 0;
    	var srIdx = (row >= grid.freezeRow) ? grid.scroller.firstVisibleRow : 0;
    	var scIdx = (col > grid.freezeCol) ? grid.freezeCol + 1: 1;
    	if (bStart) {
    		top = ((row > srIdx) ? grid.geometry.quickRowHeight(srIdx, row - 1) : 0);
    		if(newRowIndex == rowIndex){
    			var startY = range.data.y < this._rowsHeightMap[rowIndex] ? range.data.y : this._rowsHeightMap[rowIndex];
    			top += startY;
    		}
    		for (;scIdx < col; scIdx++) {
    			left += this._colsWidthMap[scIdx];
    		}
    		if (newColIndex == colIndex) {
        		var startX = range.data.x < this._colsWidthMap[colIndex] ? range.data.x : this._colsWidthMap[colIndex];
        		left += startX;
        	}
    	} else {
    		if (newRowIndex == rowIndex) {
    			bottom = (row > srIdx) ? grid.geometry.quickRowHeight(srIdx, row - 1) : 0;
    			var endY = range.data.ey;
				if (endY == -1) {
					endY = this._rowsHeightMap[rowIndex];
				} else {
					endY = endY < this._rowsHeightMap[rowIndex]? endY : this._rowsHeightMap[rowIndex];
				}
				bottom += endY;
    		} else {
    			bottom = grid.geometry.quickRowHeight(srIdx, row);
    		}
    		if (this.isRelative2Shape(range)) {
    			// for this kind of shape, the width & height will not change with the row/column resize, thus the ex (ey) should be ignored in position calculation;
    			// 
    			for (col = rangeInfo.startCol; scIdx < col; scIdx++) {
        			left += this._colsWidthMap[scIdx];
        		}
        		if (newColIndex == colIndex) {
            		var startX = range.data.x < this._colsWidthMap[colIndex] ? range.data.x : this._colsWidthMap[colIndex];
            		left += startX;
            	}
        		right = left + range.data.w;
    		} else {
    			if (newColIndex == colIndex) {
    				for (;scIdx < col; scIdx++) {
    					right += this._colsWidthMap[scIdx];
    				}
    				var endX = range.data.ex;
    				if (endX == -1) {
    					endX = this._colsWidthMap[colIndex];
    				} else {
    					endX = endX < this._colsWidthMap[colIndex] ? endX : this._colsWidthMap[colIndex];
    				}
    				right += endX;
    			} else {
    				for (;scIdx <= col; scIdx++) {
    					right += this._colsWidthMap[scIdx];
    				}
    			}
    		}
    	}
    	if (newColIndex > grid.freezeCol) {
    		var fw = grid.getFreezeWindowWidth();
    		right += fw;
    		left += fw;
    	}
    	return {left:left, top: top, right: right, bottom: bottom};
    },
    
 // update image position information if the image x, y is bigger than row height or col width
    _updateDrawPos: function(range, grid)
    {
    	var rangeInfo = range._getRangeInfo();
    	var canShow = this._isFrameCanShow(rangeInfo.startRow,rangeInfo.endRow,rangeInfo.startCol,rangeInfo.endCol, grid, range);
    	if(!canShow.show)
    		return false;
		if((this._rowsHeightMap[rangeInfo.startRow] && this._rowsHeightMap[rangeInfo.startRow] < range.data.y)
				||(this._colsWidthMap[rangeInfo.startCol] && this._colsWidthMap[rangeInfo.startCol] < range.data.x)){
			
			var newStartRowIndex = rangeInfo.startRow, newStartColIndex = rangeInfo.startCol,
			    newEndRowIndex = rangeInfo.startRow, newEndColIndex = rangeInfo.startCol;
			var x = range.data.x, y = range.data.y, 
			w = range.data.w, h = range.data.h;
			var ex = x + w, ey = y + h;        		
			
			while(this._rowsHeightMap[newStartRowIndex] && this._rowsHeightMap[newEndRowIndex]
			&& (this._rowsHeightMap[newStartRowIndex] <= y || this._rowsHeightMap[newEndRowIndex] <= ey)){
				if(this._rowsHeightMap[newStartRowIndex] <= y){
					y -=this._rowsHeightMap[newStartRowIndex];
					newStartRowIndex++;
				}
				if(this._rowsHeightMap[newEndRowIndex] <= ey){
					ey -=this._rowsHeightMap[newEndRowIndex];
					newEndRowIndex++;
				}
			}
			while(this._colsWidthMap[newStartColIndex] && this._colsWidthMap[newEndColIndex]   
			&& (this._colsWidthMap[newStartColIndex] <= x || this._colsWidthMap[newEndColIndex] <= ex)){
				if(this._colsWidthMap[newStartColIndex] <= x){
					x -=this._colsWidthMap[newStartColIndex];
					newStartColIndex++;
				}
				if(this._colsWidthMap[newEndColIndex] <= ex){
					ex -=this._colsWidthMap[newEndColIndex];       				
					newEndColIndex++;
				}
			}
			
			var attrs ={x:x, y:y, ex:ex, ey:ey};
		
			var params = {refMask: websheet.Constant.RANGE_MASK};
			var newAddr = websheet.Helper.getAddressByIndex(range.getSheetName(), 
					newStartRowIndex, newStartColIndex, null, newEndRowIndex, newEndColIndex, params);
			this.setDrawFrame(range.getId(), {newAddr : newAddr, attrs : attrs}, true);
		}
		
		return true;
    },
    
    _getTopLeftWhenInvisible:function(rowIndex, colIndex, range,  grid)
    {
    	var left = 0;
    	for(var i = 1; i < colIndex; i++)
    	{
    		left += this._colsWidthMap[i];
    	}
    	if(this._colsWidthMap[colIndex])
    		left += range.data.x;
    	
    	var top = 0;
    	var firstVRow = grid.scroller.firstVisibleRow + 1;
    	for(var i = firstVRow-1; i >= rowIndex; i--)
    	{
    		if(this._rowsHeightMap[i])
    			top += this._rowsHeightMap[i];
    	}
    	var startY = range.data.y;
		//means the startY need to the start cell's row height
		if(startY == -1)
		{
			startY = this._rowsHeightMap[rowIndex];
		}
		// means the start row is not hidden
		if(this._rowsHeightMap[rowIndex])
		{
			top -= startY;
		}
		return {top: -top, left:left};
    },
    
    /**
     * [COMMON CODE?]
     * @param sheetName
     * @param rowIndex
     * @param colIndex
     * @param grid
     * @param relativePos, if get the positon in Grid, do not think about scroll postion
     * @returns
     */
	 _getCellLeftTopPos: function(sheetName, rowIndex, colIndex, grid, relativePos)
    {
		 var topLeft = {top:0, left:0, freeze:false};
		 var info = {};
		 //if the cell in hidden row need to correct it
		 //the rule is find it down right
		 //seems it's a 1 - based index;
		 rowIndex = Math.min(grid.scroller.lastVisibleRow + 1, grid.searchVisibleRow(rowIndex - 1) + 1);
		 
		 if (rowIndex <= grid.freezeRow) {
			 topLeft.freeze = true;
		 }
		 
		 var coverInfo = websheet.Utils.getCoverCellInfo(sheetName, colIndex, rowIndex);
		 var cellRow = coverInfo.row - 1;
		 var cellCol = coverInfo.col;
		 var cellBox = grid.geometry.getCellPosition(cellRow, cellCol, true);
		 
		 if (relativePos) {
			 topLeft.top = cellBox.t;
		 } else {
			 topLeft.top = grid.scroller.scrollTop + cellBox.t;
		 }
		 if (!topLeft.freeze) {
			 topLeft.top -= (grid.geometry.getFreezeHeight() + grid.geometry.GRID_HEADER_HEIGHT);
		 }
		 topLeft.left = cellBox.l;
		 if (cellCol > grid.freezeCol) {
			 topLeft.left = topLeft.left + grid.scroller.scrollLeft;
		 }
		 topLeft.left -= grid.geometry.GRID_HEADER_WIDTH;
		 return topLeft;
    },
    
    _getFrameRect: function(range, grid)
	{
		var top, left, width, height;
		if(!this.isRelativeShape(range))
		{
			if( grid.accuracyTop == null)
			{
	        	grid.accuracyTop = grid.scroller.firstVisibleRow > grid.freezeRow ? grid.geometry.preciseRowHeight(grid.freezeRow, grid.scroller.firstVisibleRow - 1) : 0;
			}
			var fs = websheet.Constant.FreezeBarSize;
			var fh = Math.max(grid.getFreezeWindowHeight() - fs, 0), fw = Math.max(grid.getFreezeWindowWidth() - fs, 0);
			
			left = range.data.x;
			width = range.data.w;
			height = range.data.h;
			//Row truncated, hide it
			if((range.data.y < fh && parseInt(height + range.data.y) > fh)
					//Column truncated, hide it
					||((range.data.x < fw && parseInt(width + range.data.x) > fw))){
				dojo.publish("UpdateFrameStatus", [false, true, range]);
				return null;
			}
			
			if(range.data.x > fw && fw > 0)
				left += fs;
			
			if(range.data.y < fh){
				top = range.data.y;
				dojo.publish("UpdateFrameStatus", [true, false, range]);
			} else {
				if (range.data.y < 1) {
					top = 1 - fh - grid.accuracyTop;
				} else {
					top = range.data.y - fh - grid.accuracyTop;
				}
				
				var gridHeight = Math.max(0, grid.scroller.contentClientHeight - fh -fs);
				if(top + height <= 0 || (top >= gridHeight)){
					dojo.publish("UpdateFrameStatus", [false, false, range]);
					return null;
				}else{
					dojo.publish("UpdateFrameStatus", [true, false, range]);
				}
			}
		}
		else
		{
        	var rangeInfo = range._getRangeInfo();
        	var canShow = this._isFrameCanShow(rangeInfo.startRow, rangeInfo.endRow, rangeInfo.startCol, rangeInfo.endCol, grid,range);
        	if (!canShow.show) {
        		return;
        	}
        	// rollback 32089
//        	if (this.isRelative2Shape(range) && range.data.h != null && range.data.w != null) {
        		// We may not be able to get the width/height for this kind of shape on initial render;
        		// Can not get these information from conversion, we need to calculate & set the data.w & data.h (for the first time);
//    			height = range.data.h;
//    			width = range.data.w;
//        	} else {
        		height = this.getShapeHeight(range.data, rangeInfo.startRow,rangeInfo.endRow);	
        		width = this.getShapeWidth(range.data,rangeInfo.startCol,rangeInfo.endCol);
//        	}
        	if (height == 0 || width == 0) {
        		return null;
        	}
        	var firstVRow = grid.scroller.firstVisibleRow + 1;
        	var lastVRow = grid.scroller.lastVisibleRow + 1;
        	//start cell in visible area
        	if((rangeInfo.startRow >= firstVRow && rangeInfo.startRow <= lastVRow)||(rangeInfo.startRow <= grid.freezeRow))
        	{
        		var bound = this._getBounding(rangeInfo, range, grid, true);
        		if(!bound)
        		{
        			console.log("start not found!!!"); 
        			return null;
        		}
        		top = bound.top;
        		left = bound.left;
        	}
        	//end cell in visible area
        	else if((rangeInfo.endRow >= firstVRow && rangeInfo.endRow <= lastVRow)||(rangeInfo.endRow <= grid.freezeRow))
        	{
        		var bound = this._getBounding(rangeInfo, range, grid, false);
        		if(!bound)
        		{
        			console.log("end not found!!!"); 
        			return null;
        		}
        		top = bound.bottom - height;
        		left = bound.right - width;
        	}
        	//large imgae, both start and end out of visisble area
        	else if(rangeInfo.startRow < firstVRow && rangeInfo.endRow > lastVRow)
        	{
        		var bound = this._getTopLeftWhenInvisible(rangeInfo.startRow, rangeInfo.startCol, range, grid);
        		top = bound.top;
        		left = bound.left;
        	}
        	else
        		return null;
		}

		return {t:top, l:left, w:width, h:height};
	},
    
	_getRangeForShape: function(rowIndex, colIndex, width, height){
		var controller = this.editor.getController();
        var sheetName = this.editor.getCurrentGrid().getSheetName();        
        
    	var grid = controller.getGrid(sheetName);		
		var leftTopPos = this._getCellLeftTopPos(sheetName,rowIndex,colIndex,grid, true);
		if (!leftTopPos) {
			return;
		}
		var imgRightPos = leftTopPos.left + width;
		var rightBottomCellInfo = grid.getCellInfoWithPosition(imgRightPos, leftTopPos.top + height, true, true, leftTopPos.freeze);

		if(rightBottomCellInfo.colReviseOffset){ 
			width = width - rightBottomCellInfo.colReviseOffset;
			if(width < websheet.Constant.minImgWidth)
				return null;			
		}
		if(rightBottomCellInfo.rowReviseOffset){
			height = height - rightBottomCellInfo.rowReviseOffset;
			if(height < websheet.Constant.minImgHeight)
				return null;
		}
		
		var endRowIndex = rightBottomCellInfo.rowIndex + 1;
		var endColIndex = rightBottomCellInfo.colIndex;
		var ex = 0;
        var ey = 0;
		ex = rightBottomCellInfo.colOffset;
		ey = rightBottomCellInfo.rowOffset;			
	
		var params = {refMask: websheet.Constant.RANGE_MASK};
		rangeAddr = websheet.Helper.getAddressByIndex(sheetName, rowIndex, colIndex,null,endRowIndex,endColIndex,params);

		return {"rangeAddr":rangeAddr, "ex": ex, "ey":ey};
	},
	
    isRelativeShape: function(/*Area*/range) {
		return range && range.data && (range.data.pt == "relative" || range.data.pt == "relative2");
	},
	
	isRelative2Shape: function(/*Area*/range) {
		return range && range.data && range.data.pt == "relative2";
	},
	
	prepareColsWidth: function (grid) {
		var _widthArray = grid.geometry._widthArray;
		this._colsWidthMap = {};
		for (var i = 0, length = _widthArray.length, colWidth; i < length; i++) {
			colWidth =  _widthArray[i];
			this._colsWidthMap[i + 1] = colWidth < 0 ? 0 : colWidth;
		}
	},
	
	prepareRowsHeight: function (rangeArray, grid) {
		var geometry = grid.geometry;
		var firstVRow = grid.scroller.firstVisibleRow + 1;
        var lastVRow = grid.scroller.lastVisibleRow + 1;
        var startRow = firstVRow , endRow = lastVRow;
        for (var i = 0, length = rangeArray.length; i < length; i++) {
        	var range = rangeArray[i];
        	if (this.isRelativeShape(range)) {
        		var rangeInfo = range._getRangeInfo();
	        	if ((rangeInfo.startRow < firstVRow && rangeInfo.endRow >= firstVRow && rangeInfo.startRow > grid.freezeRow)) {
	        		if(rangeInfo.startRow < startRow) {
	        			startRow = rangeInfo.startRow;
	        		}
	        	}
	        	if (rangeInfo.endRow > lastVRow && rangeInfo.startRow <= lastVRow) {
	        		if (rangeInfo.endRow > endRow) {
	        			endRow = rangeInfo.endRow;
	        		}
	        	}
        	}
        }
        this._rowsHeightMap = {};
        geometry.fillInRowsHeight(startRow, endRow, this._rowsHeightMap);
        if (grid.freezeRow > 0) {
        	geometry.fillInRowsHeight(1, grid.freezeRow, this._rowsHeightMap);
        }
	},
	
	resetCache: function() {
		if (!this.isLoadingDraw) {
			this._rowsHeightMap = null;
			this._colsWidthMap = null;
		}
	},
	
	deleteDrawFrame: function (/*string*/rangeid) {
		if (!rangeid) return;

    	var range = this._areaMgr.getRangeByUsage(rangeid,this.usage);
		var data = {};
		for (var attr in range.data){
			data[attr] = range.data[attr];
			if(range.data[attr] == undefined){
				console.log(range.data);
				return;
			}
		}
		
		var refValue = range.getParsedRef().getAddress();
		var attrs = {usage: this.usage, rangeid: rangeid};
		var revAttrs = {usage: this.usage, rangeid: rangeid, data: data};
		this.editor.execCommand(commandOperate.DELETERANGE, [rangeid, refValue, attrs, revAttrs]);
	},
	
	//when move or resize draw frames, the rangeaddr or its x, y, w, h in attrs would change 
	//param is a map for such as newaddr, attrs
	setDrawFrame: function(rangeid, param, notSendRev){
		if(!rangeid || !param) return;
		
    	var range = this._areaMgr.getRangeByUsage(rangeid,this.usage);
    	var rangeAddr = range.getParsedRef().getAddress();
    	var newAddr = param.newAddr ? param.newAddr : rangeAddr;
		var x = range.data.x, y = range.data.y, w = range.data.w, h = range.data.h, ex = range.data.ex, ey = range.data.ey;
    	var prop = {};
		prop.x = x, prop.y = y, prop.w = w, prop.h = h, prop.ex = ex, prop.ey =ey;
		prop.alt = range.data.alt || "";
		var params = {rangeid: rangeid, usage: this.usage};
		params.data = param.attrs ? param.attrs : {};
		var revAttrs = {rangeid: rangeid, usage: this.usage};
		revAttrs.data = {};
		for (var attr in params.data){
			revAttrs.data[attr] = prop[attr];
			if(params.data[attr] == undefined){
				console.log(params.data);	
				return;
			}		
		}
		if(!this.isRelativeShape(range))
		{
			revAttrs.data.pt = range.data.pt;
			params.data.pt = range.data.pt;
		}
		
		if (notSendRev) revAttrs = null;
		this.editor.execCommand(commandOperate.SETRANGEINFO, [newAddr, params, rangeAddr, revAttrs]);
	},
	
	dltDrawFramesInSheet: function(sheetName, rangeId)
	{
		var drawFrameSheetMap = this.drawFrameDivMap[sheetName];
		if(drawFrameSheetMap)
		{
			if(rangeId){
				var drawFrameDiv = drawFrameSheetMap[rangeId];
				if(drawFrameDiv)
				{
					drawFrameDiv.destroy();
				}
				delete drawFrameSheetMap[rangeId];
			}
		}
	},
	
	getSelectedDrawFramesInSheet:function(sheetName){
    	var selectedList=new Array();
    	var drawFrameSheetMap = this.getDrawFrameMapBySheetName(sheetName);
    	if(drawFrameSheetMap){
	    	for(var id in drawFrameSheetMap){
	    		var div = drawFrameSheetMap[id];
	    		if(div && div.isSelected()){
	    			var range = this._areaMgr.getRangeByUsage(id, this.usage);
	    			range && selectedList.push(range);
	    		}
	    	}  
    	}
    	return selectedList;
    },
	
    getSelectedDrawFramesInCurrSheet: function(){    	
    	return this.getSelectedDrawFramesInSheet(this.editor.getCurrentGrid().getSheetName());
    },

    scrollFrameIntoView: function(range, doFocus){
    	if(range==null)
    		return;
    	
    	var info = range._getRangeInfo();
    	var sheetName = info.sheetName;
    	var rangeId = range.getId();
    	var workSheetContainer = this.editor.getWorksheetContainer();
        if (!workSheetContainer.isCurrentWorksheet(sheetName)){
              workSheetContainer.showWorksheet(sheetName);
        }
        var controller = this.editor.getController();
        var grid = controller.getGrid(sheetName);
    	var sc = grid.scroller;	
    	var frameDiv = null;
    	
    	// move the image scroll into view vertically if necessary   		
        if(this.isRelativeShape(range)){
        	if (info.startRow > grid.freezeRow && (info.endRow - 1  < sc.firstVisibleRow || info.startRow - 1> sc.lastVisibleRow)) {
	    		grid.scroller.scrollToRow(info.startRow - 1);	    		
	    	}
        	frameDiv = this.getDrawFrameDivbySheetName(sheetName,rangeId);        	 
        }else{
        	frameDiv = this.getDrawFrameDivbySheetName(sheetName,rangeId);
        	if(frameDiv){
				if(frameDiv._drawDiv.offsetTop + range.data.h < 0 || frameDiv._drawDiv.offsetTop > grid.geometry.getScrollableHeight()) {
					grid.scroller.setScrollTop(range.data.y); 
				}
        	}
        }
 
    	//make the image scroll into view horizontally if necessary
		var rangeInfo = {};
		if(this.isRelativeShape(range)){
			rangeInfo = info;
			if(rangeInfo.startCol != rangeInfo.endCol)
				rangeInfo.startCol++;
        }else{
        	var imageLeft = range.data.x;
        	var ImageRight = range.data.x + range.data.w;
        	var geometry = grid.geometry;    	
    		var length = websheet.Constant.MaxColumnIndex;
    		for(var i = 1; i <= length; i++)
    		{
    			var colWidth = grid.geometry.colWidth(i);
    			if (imageLeft > 0) {
    				imageLeft -= colWidth;
    				if (imageLeft <= 0) {
    					rangeInfo.startCol = i;
    				}
    			}
    			if (ImageRight > 0) {
    				ImageRight -= colWidth;
    				if(ImageRight <= 0){
    					rangeInfo.endCol = i;
    				}
    			}
    		}
        }
		
		if (!grid.hasColInView(rangeInfo)) {
			grid.scroller.scrollToColumn(rangeInfo.startCol);
		}
		
		var rangeInfo = range._getRangeInfo();
    	//give the warning message if the frame is not displayed due to freeze window.
    	this._isFrameCanShow(rangeInfo.startRow,rangeInfo.endRow,rangeInfo.startCol,rangeInfo.endCol,grid,range);
        
        if(websheet.model.ModelHelper.isSheetProtected(info.sheetName)){
        	if(!frameDiv)
        		this.unSelectDrawFrames(sheetName);
			return;
		}
        
        if(!frameDiv){
        	var toolbar = grid.editor.getToolbar();
     		if(range.usage==websheet.Constant.RangeUsage.IMAGE || range.usage==websheet.Constant.RangeUsage.SHAPE || range.usage==websheet.Constant.RangeUsage.CHART)
     			toolbar && toolbar.disableImagePropertyDlg(true);
     		range.selected = true;
     		range.doFocus = doFocus;
     		return;
         }
         
		frameDiv.showImageResizeDivs();
		
    	if(doFocus)
    		frameDiv.setFocus();
    },
	
	notify: function(area, event) {
		
		if(event && event._type == websheet.Constant.EventType.DataChange)
		{
			var s = event._source;
			var data = s.data;
			if (s.action == websheet.Constant.DataChange.PREDELETE && (s.refType == websheet.Constant.OPType.ROW || s.refType == websheet.Constant.OPType.COLUMN)) {
				if(s.data && s.data.collectUndo){//delete the edge
					var bRow = false;
					if(s.refType == websheet.Constant.OPType.ROW)
						bRow = true;
					var startIdx, endIdx;
					if (bRow) {
						startIdx = area.getStartRow();
						endIdx = area.getEndRow();
					} else {
						startIdx = area.getStartCol();
						endIdx = area.getEndCol();
					}
					var sIndex, eIndex;
					var parsedRef = s.refValue;
					if(bRow) {
						sIndex = parsedRef.startRow;
						eIndex = parsedRef.endRow;
					} else { 
						sIndex = parsedRef.startCol;
						eIndex = parsedRef.endCol;
					}
					var undoRange = this._areaMgr.delUndoAreas[area.getId()];
					//check delete the upper edge or bottom edge for delete row
					// or delete the left edge or right edge for delete column
					if(sIndex <= startIdx && eIndex >= startIdx)
					{
						//reset data, only put the changed part, rather then the whole data
						if(bRow){
							undoRange.data = {y:area.data.y};
							area.data.y = 0;
						} else {
							undoRange.data = {x:area.data.x};
							area.data.x = 0;
						}
					}
					else if(sIndex <= endIdx && eIndex >= endIdx)
					{
						if(bRow){
							undoRange.data = {ey:area.data.ey};
							area.data.ey = -1;
						} else {
							undoRange.data = {ex:area.data.ex};
							area.data.ex = -1;
						}
					}
				}
			} else if(s.refType == websheet.Constant.OPType.SHEET ) {
				if(s.action == websheet.Constant.DataChange.SET){
					var oldSheetName = s.oldSheetName;
					if(this.drawFrameDivMap[oldSheetName]){
						var newSheetName = s.newSheetName;
						this.drawFrameDivMap[newSheetName] = this.drawFrameDivMap[oldSheetName];
						delete  this.drawFrameDivMap[oldSheetName];
					}
				} else if(s.action == websheet.Constant.DataChange.PREDELETE){
					var sheetName = s.refValue;
					this.dltDrawFramesInSheet(sheetName, area.getId());
				}
			}
		}
	}
});