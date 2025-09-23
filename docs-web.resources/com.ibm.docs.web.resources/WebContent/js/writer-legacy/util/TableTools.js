dojo.provide("writer.util.TableTools");
writer.util.TableMatrix = function(table) {
	this.table = table;
	this._matrix= [];
	this._borders= {rows:[],cols:[]};
	this.createTableMatrix();
};
 writer.util.TableMatrix.Border = function(cell,linkMark,len,defaultBorder){
 	 this.pre = {cell:null,len:0,mark:null};
 	 this.next = {cell:null,len:0,mark:null};
 	 this.linkMark = linkMark;
 	 this[linkMark.pos].cell = cell;
 	 this[linkMark.pos].len = len;
 	 this._defaultBorder = defaultBorder || {};
 	 var borderProp;
 	 if(cell.getProperty){
 	 	borderProp = cell.getProperty().borderToJson();
 	 }
 	 else if(cell.model && cell.model.getProperty){
 	 	borderProp = cell.model.getProperty().borderToJson();
 	 }
 	 borderProp = borderProp || {};
 	 this.border = borderProp[this.linkMark.border];
 	 this.getLinkedCell = function(){
 	 	return this[this.linkMark.pos].cell;
 	 };
 	 this.isLinkedPre = function(){
 	 	return this.linkMark.pos == "pre";
 	 };
 	 this.getLinkedLen = function(){
 	 	return this[this.linkMark.pos].len;
 	 };
 	 this.getPreCell  =function(){
 	 	return this.pre.cell;
 	 };
 	 this.getNextCell = function(){
 	 	return this.next.cell;
 	 };
 	 this.setCell = function(cell,linkMark,len){
 	 	this[linkMark.pos].cell = cell;
 	 	this[linkMark.pos].mark = linkMark;
 	 	var borderProp;
 	 	if(linkMark == this.linkMark && this.getLinkedLen < len){
 	 		var pair = writer.util.TableMatrix.Border.LinkMark[this.linkMark.pair];
 	 		var borderCell = this[pair.pos].cell;
 	 		if(borderCell){
 	 			delete this.border;
 	 			if(borderCell.getProperty){
			 		borderProp = borderCell.getProperty().borderToJson();
			 	}else if(borderCell.model && borderCell.model.getProperty){
			 		borderProp = borderCell.model.getProperty().borderToJson();
			 	}
			 	borderProp = borderProp || {};
			 	this.border = borderProp[pair.border];
	 	 		this.linkMark = pair;
 	 		}
 	 	}
 	 	this[linkMark.pos].len = len;
 	 	borderProp = {};
 	 	if(cell.getProperty){
	 		borderProp = cell.getProperty().borderToJson();
	 	}else if(cell.model && cell.model.getProperty){
	 		borderProp = cell.model.getProperty().borderToJson();
	 	}
	 	borderProp = borderProp || {};
	 	var border = borderProp[linkMark.border];
	 	var oldBorder = this.border || this._defaultBorder[this.linkMark.border];
	 	var newBorder = border || this._defaultBorder[linkMark.border];
	 	var priority = writer.util.TableTools.compareBorder(newBorder, oldBorder);
	 	// fix border of vMerge
	 	if(linkMark.border == "left" || linkMark.border == "right"){
	 		
	 		if(len < this.getLinkedLen() && this.border != border){
	 			this.border = border;
 	 			this.linkMark = linkMark;
 	 			return;
 	 		}
	 	}	
	 	if(priority > 0){
 	 		this.border = border;
 	 		this.linkMark = linkMark;
 	 	}
 	 	else if(priority = 0){
 	 		if(len < this.getLinkedLen() && this.border != border){
	 			this.border = border;
 	 			this.linkMark = linkMark;
 	 			return;
 	 		}
 	 	}
 	 };
 	 this.getBorder = function(){
 	 	var linkCell = this.getLinkedCell();
 	 	var borderProp = {};
 	 	if(linkCell.getProperty){
	 		borderProp = linkCell.getProperty().borderToJson();
	 	}else if(linkCell.model && linkCell.model.getProperty){
	 		borderProp = linkCell.model.getProperty().borderToJson();
	 	}
	 	borderProp = borderProp || {};
	 	var border = dojo.clone(borderProp[this.linkMark.border]);
	 	this.border = dojo.clone(border);
	 	return border;
 	 };
 	 this.isPrepared = function(len){
 	 	return this.pre.cell !== null && this.next.cell !== null;
 	 };
 };
 writer.util.TableMatrix.Border.LinkMark = {
 	TOP : {pos:"next",border:"top",pair:"BOTTOM"},
 	BOTTOM : {pos:"pre",border:"bottom",pair:"TOP"},
 	LEFT : {pos:"next",border:"left",pair:"RIGHT"},
 	RIGHT : {pos:"pre",border:"right",pair:"LEFT"}
 }; 
writer.util.TableMatrix.prototype = {
	fillRowMatrix : function(row,rowIndex) {
		row._rowIdx = rowIndex;
		var cell = row.cells.getFirst();
		var cellIndex = 0;
		var defaultBorder;
		if(this.table.getProperty)
			defaultBorder = this.table.getProperty().borderToJson();
		else if(this.table.model && this.table.model.getProperty)
			defaultBorder = this.table.model.getProperty().borderToJson();
		while (cell) {
			var rowSpan = cell.rowSpan || 1;
			var colSpan = cell.colSpan || 1;
			var r = 0;
			while (r < rowSpan) {
				var rowMatrix = this._matrix[rowIndex + r];
				if (!rowMatrix) {
					rowMatrix = this._matrix[rowIndex + r] = [];
				}
				var topBorders = this._borders.rows[rowIndex + r];
				if(!topBorders) {
					topBorders = this._borders.rows[rowIndex + r] = [];
				}
				var bottomBorders = this._borders.rows[rowIndex + r +1];
				if(!bottomBorders){
					bottomBorders = this._borders.rows[rowIndex + r + 1] = [];
				}
				while (rowMatrix[cellIndex]) {
					cellIndex++;
				}
				var c =0;
				var cellBorder;
				if(cell.getProperty)
					cellBorder = cell.getProperty().borderToJson();
				else if(cell.model && cell.model.getProperty)
					cellBorder = cell.model.getProperty().borderToJson();
				cellBorder = cellBorder || {};
				var TableBorder = writer.util.TableMatrix.Border;
				while (c < colSpan) {
					if (rowMatrix[cellIndex + c]) {
						return;
					}
					if(!topBorders[cellIndex + c]){
						topBorders[cellIndex + c] = new TableBorder(cell,TableBorder.LinkMark.TOP,c,defaultBorder);
					}else {
						topBorders[cellIndex + c].setCell(cell,TableBorder.LinkMark.TOP,c);
					} 
					if(!bottomBorders[cellIndex + c]){
						bottomBorders[cellIndex + c] = new TableBorder(cell,TableBorder.LinkMark.BOTTOM,c,defaultBorder);
					}else{
						bottomBorders[cellIndex + c].setCell(cell,TableBorder.LinkMark.BOTTOM,c);
					}
					var leftBorders = this._borders.cols[cellIndex + c];
					if(!leftBorders)
						leftBorders = this._borders.cols[cellIndex + c] = [];
					if(!leftBorders[rowIndex + r])
						leftBorders[rowIndex + r] = new TableBorder(cell,TableBorder.LinkMark.LEFT,r,defaultBorder);
					else
						leftBorders[rowIndex + r].setCell(cell,TableBorder.LinkMark.LEFT,r);
					var rightBorders = this._borders.cols[cellIndex + c +1];
					if(!rightBorders) 
						rightBorders = this._borders.cols[cellIndex + c + 1] = [];
					if(!rightBorders[rowIndex + r]){
						rightBorders[rowIndex + r] = new TableBorder(cell,TableBorder.LinkMark.RIGHT,r,defaultBorder);
					}else {
						rightBorders[rowIndex + r].setCell(cell,TableBorder.LinkMark.RIGHT,r);
					}
					rowMatrix[cellIndex + c] = cell;
					c++;
				}
				r++;
			}
			cell._colIdx = cellIndex;
			
			cell = row.cells.next(cell);
			cellIndex += colSpan;
		}
	},
	fixBorderMatrix: function() {
		var borders =  {rows:[],cols:[]};
		var that = this;
		var cells = [];
		if(this.table.getProperty)
			defaultBorder = this.table.getProperty().borderToJson();
		else if(this.table.model && this.table.model.getProperty)
			defaultBorder = this.table.model.getProperty().borderToJson();
		this.table.rows.forEach(function(row){
			var rowIndex = row.getRowIdx();
			row.cells.forEach(function(cell){
				var cellIndex = cell.getColIdx();
				var rowSpan = cell.rowSpan;
				var colSpan = cell.colSpan;
				var r =0;
				while(r < rowSpan) {
					var topBorders = borders.rows[rowIndex + r];
					var oldTopBorders = that._borders.rows[rowIndex + r];
					if(!topBorders) {
						topBorders = borders.rows[rowIndex + r] = [];
					}
					var bottomBorders = borders.rows[rowIndex + r +1];
					var oldBottomBorders = that._borders.rows[rowIndex + r];
					if(!bottomBorders){
						bottomBorders = borders.rows[rowIndex + r + 1] = [];
					}
					var c =0;
					var cellBorder;
					if(cell.getProperty)
						cellBorder = cell.getProperty().borderToJson();
					else if(cell.model && cell.model.getProperty)
						cellBorder = cell.model.getProperty().borderToJson();
					cellBorder = cellBorder || {};
					var TableBorder = writer.util.TableMatrix.Border;
					while (c < colSpan) {
						if(!topBorders[cellIndex + c]){
							topBorders[cellIndex + c] = new TableBorder(cell,TableBorder.LinkMark.TOP,c,defaultBorder);
						}else {
							topBorders[cellIndex + c].setCell(cell,TableBorder.LinkMark.TOP,c);
							if(topBorders[cellIndex + c].isPrepared() &&
								topBorders[cellIndex + c].linkMark != oldTopBorders[cellIndex + c].linkMark){
								cells.push(topBorders[cellIndex + c].getPreCell());
								cells.push(topBorders[cellIndex + c].getNextCell());
							}
						} 
						if(!bottomBorders[cellIndex + c]){
							bottomBorders[cellIndex + c] = new TableBorder(cell,TableBorder.LinkMark.BOTTOM,c,defaultBorder);
						}else{
							bottomBorders[cellIndex + c].setCell(cell,TableBorder.LinkMark.BOTTOM,c);
							if(bottomBorders[cellIndex + c].isPrepared() &&
								bottomBorders[cellIndex + c].linkMark != oldBottomBorders[cellIndex + c].linkMark){
								cells.push(bottomBorders[cellIndex + c].getPreCell());
								cells.push(bottomBorders[cellIndex + c].getNextCell());
							}
						}
						var leftBorders = borders.cols[cellIndex + c];
						var oldLeftBorders = that._borders.cols[cellIndex + c];
						if(!leftBorders)
							leftBorders = borders.cols[cellIndex + c] = [];
						if(!leftBorders[rowIndex + r]){
							leftBorders[rowIndex + r] = new TableBorder(cell,TableBorder.LinkMark.LEFT,r,defaultBorder);
						}
						else{
							leftBorders[rowIndex + r].setCell(cell,TableBorder.LinkMark.LEFT,r);
							if(leftBorders[rowIndex + r].isPrepared() &&
								leftBorders[rowIndex + r].linkMark != oldLeftBorders[rowIndex + r].linkMark){
								cells.push(leftBorders[rowIndex + r].getPreCell());
								cells.push(leftBorders[rowIndex + r].getNextCell());
							}
						}
						var rightBorders = borders.cols[cellIndex + c +1];
						var oldRightBorders = that._borders.cols[cellIndex + c + 1];
						if(!rightBorders) 
							rightBorders = borders.cols[cellIndex + c + 1] = [];
						if(!rightBorders[rowIndex + r]){
							rightBorders[rowIndex + r] = new TableBorder(cell,TableBorder.LinkMark.RIGHT,r,defaultBorder);
						}else {
							rightBorders[rowIndex + r].setCell(cell,TableBorder.LinkMark.RIGHT,r);
							if(rightBorders[rowIndex + r].isPrepared() &&
								rightBorders[rowIndex + r].linkMark != oldRightBorders[rowIndex + r].linkMark){
								cells.push(rightBorders[rowIndex + r].getPreCell());
								cells.push(rightBorders[rowIndex + r].getNextCell());
							}
						}
						c++;
					}
					r++;
				}
			});
		});
		this._borders = borders;
		return cells;
	},
	createTableMatrix : function() {
		var that = this;
		this._borders = {rows:[],cols:[]};
		this.table.rows.forEach(function(row,idx) {
			that.fillRowMatrix(row, idx);
		});
		var cellCnt = this._matrix[0].length;
		for ( var i = 1; i < this._matrix.length; i++) {
			if (this._matrix[i].length != cellCnt) {
				console.error("unsupport table id is: " + (this.table.model ? this.table.model.id : "none"));
				return;
			}
		}
	},
	getBorder:function(rowIndex,colIndex){
		var borderProp = {};
		borderProp.left = this._borders.cols[colIndex][rowIndex].getBorder();
		borderProp.right = this._borders.cols[colIndex + 1][rowIndex].getBorder();
		borderProp.top = this._borders.rows[rowIndex][colIndex].getBorder();
		borderProp.bottom = this._borders.rows[rowIndex + 1][colIndex].getBorder();
		return borderProp;
	},
	getRowBorders:function(rowIdx){
		return this._borders.rows[rowIdx];
	},
	getColBorders: function(colIdx){
		return this._borders.cols[colIdx];
	},
	getRowMatrix:function(row){
		return this._matrix[row._rowIdx];
	},
	length:function(){
		return this._matrix.length;
	},
	length2:function(){
		if(this._matrix.length===0){
			return 0;
		}
		return this._matrix[0].length;
	},
	item:function(row){
		return this._matrix[row._rowIdx];
	},
	getCell:function(rowIdx,colIdx){
		return this._matrix[rowIdx][colIdx];
	},
	getNextCell:function(cell,inTheSameCol){
		var colIdx = cell._colIdx;
		var rowIdx = cell.parent._rowIdx;
		var cells =[];
		if(inTheSameCol){
			cells = this.getColumn(rowIdx, colIdx);
		}else{
			cells = this._matrix[rowIdx];
		}		
		var idx = cells.indexOf(cell);
		var nextCell = cell;
		while(nextCell==cell){
			nextCell = cells[idx++];
		}
		return nextCell;
	},
	getPreviousCell:function(cell,inTheSameCol){
		var colIdx = cell._colIdx;
		var rowIdx = cell.parent._rowIdx;
		var cells =[];
		if(inTheSameCol){
			cells = this.getColumn(colIdx);
		}else{
			cells = this._matrix[rowIdx];
		}		
		var idx = cells.indexOf(cell);
		var nextCell = cell;
		while(nextCell==cell){
			nextCell = cells[idx--];
		}
		return nextCell;
	},
	getNextOrPreviousCellInRowOrCol:function(nextOrPrevious, rowOrCol, idx, cell){
		var cells = [];
		if(rowOrCol == "row"){
			cells = this._matrix[idx];
		}else if(rowOrCol == "col"){
			cells = this.getColumn(idx);
		}else{
			return;
		}
		var nextIdx = cells.indexOf(cell);
		var nextCell = null;
		do{	
			if(nextOrPrevious == "next"){
				if(++nextIdx >= cells.length){
					return null;
				}			
			}else if(nextOrPrevious == "previous"){
				if(--nextIdx < 0){
					return null;
				}
			}
			nextCell =  cells[nextIdx];
		}while(nextCell == cell);
		return nextCell;
	},
	getColumnCount:function(){
		return this._matrix[0].length;
	},
	getColumn:function(i){
		var col =[];
		for(var j=0;j<this.length();j++){
			col.push(this._matrix[j][i]);
		}
		return col;
	},
	getCrossRow:function(cell){
		var row = cell.parent;
		var rowSpan = cell.getRowSpan();
		var ret =[];
		var i=0;
		while(i< ret){
			ret.push(row);
			row = this.table.rows.next(row);
		}
	},
	getColumnWidth:function(cell){
		return this.table.getColumnWidth(cell._colIdx);
	},
	getArrayMatrix:function(){
		return this._matrix;
	},
	getLastCell:function(){
		var x = this._matrix.length-1;
		var y = this._matrix[x].length-1;
		return this._matrix[x][y];
	},
	getCellIdxInJson:function(rowIdx, cellIdx){
		if(!this._matrix[rowIdx][cellIdx]){
			return null;
		}
		var cellIdxInJson = 0;
		var i = 0;
		while(i < cellIdx){
			var currentCell = this._matrix[rowIdx][i];
			var nextCell = this._matrix[rowIdx][i+1];
			if(nextCell._colIdx != currentCell._colIdx){
				cellIdxInJson++;
			} 
			i++;
		}
		return cellIdxInJson;
	},
	mergeVerticalCell:function(row,cell){
		var rowIdx = row.getRowIdx();
		var cellIdx = cell.getColIdx();
		var preCell = this._matrix[rowIdx-1][cellIdx];
		var preRowIdx = preCell.parent.getRowIdx();
		preCell.setRowSpan(preCell.getRowSpan()+1);
		var LinkMark = writer.util.TableMatrix.Border.LinkMark;
		for(var i=0;i< cell.colSpan;i++){
			this._matrix[rowIdx][cellIdx+i] = preCell;
			// Merge Borders
			this._borders.rows[rowIdx][cellIdx+i].setCell(preCell,LinkMark.TOP,i);
			this._borders.rows[rowIdx+1][cellIdx+i].setCell(preCell,LinkMark.BOTTOM,i);
		}
		// TODO simply discard the vMerged cell is not a good implement
		// fixed vertical borders
		// don't need to send message to server
		// server will auto change the vMerged cell's border after related cell's border changed
		if(cellIdx > 0 && !this._borders.cols[cellIdx][rowIdx].isLinkedPre()){
			// if left border is follow vMerged cell, change the left cell's right border;
			var leftCell = this._matrix[rowIdx][cellIdx - 1];
			leftCell = leftCell.model ? leftCell.model : leftCell;
			if(leftCell.parent.getRowIdx() == rowIdx){
				var borderJson = this._borders.cols[cellIdx][rowIdx].getBorder();
				leftCell.changeBorder({right:writer.util.TableTools.borderFromJson(borderJson)});
			}
		}
		if(cellIdx + cell.colSpan < this.length2() &&
		 this._borders.cols[cellIdx + cell.colSpan][rowIdx].isLinkedPre()){
			// if right border is follow vMerged cell,change the right cell's left border;
			var rightCell = this._matrix[rowIdx][cellIdx + cell.colSpan];
			rightCell = rightCell.model ? rightCell.model : rightCell;
			if(rightCell.parent.getRowIdx() == rowIdx){
				var borderJson = this._borders.cols[cellIdx + cell.colSpan][rowIdx].getBorder();
				rightCell.changeBorder({left:writer.util.TableTools.borderFromJson(borderJson)});
			}
		}
		//Merge Borders
		this._borders.cols[cellIdx][rowIdx].setCell(preCell,LinkMark.LEFT,rowIdx - preRowIdx);
		this._borders.cols[cellIdx + cell.colSpan][rowIdx].setCell(preCell,LinkMark.RIGHT,rowIdx - preRowIdx);
	},
	splitVerticalMergedCell:function(row, cell, json){
		var rowIdx = row.getRowIdx();
		var colIdx = cell.getColIdx();
		var cellIdxInJson = this.getCellIdxInJson(rowIdx, colIdx);
		json.trs[rowIdx].tcs[cellIdxInJson].tcPr.vMerge = {val:"restart"};
		
		for(var rowOffset = 1; rowOffset < cell.getRowSpan(); rowOffset++){
			var preIdx = this.getCellIdxInJson(rowIdx+rowOffset, colIdx-1);
			if(preIdx === null){
				preIdx = -1;
			}
			//var	nextIdx = this.getCellIdxInJson(rowIdx+rowOffset, colIdx+cell.getColSpan());

			var recoveredCellJson = cell.emptyClone();
			//var recoveredCellJson = recoveredCell.toJson();
			recoveredCellJson.tcPr.vMerge = {};
			recoveredCellJson.tcPr.border = this.getBorder(rowIdx+rowOffset,colIdx);
			//if(preIdx != null){
				json.trs[rowIdx+rowOffset].tcs.splice(preIdx+1, 0, recoveredCellJson);
			//}else{
			//	json.trs[rowIdx+rowOffset].tcs.splice(nextIdx-1, 0, recoveredCellJson);
			//}
		}
	},
	canMerge:function(nwCell,seCell){
		var minX = nwCell.getColIdx();
		var maxX = seCell.getColIdx()+seCell.getColSpan()-1;
		var minY = nwCell.parent.getRowIdx();
		var maxY = seCell.parent.getRowIdx()+seCell.getRowSpan()-1;
		for(var i=minX;i<=maxX;i++){
			if(minY > 0){
				var inSideCell = this._matrix[minY][i];
				var outSideCell = this._matrix[minY-1][i];
				if(inSideCell==outSideCell){
					return false;
				}
			}
			if(maxY < this._matrix.length-1){
				inSideCell = this._matrix[maxY][i];
				outSideCell = this._matrix[maxY+1][i];
				if(inSideCell==outSideCell){
					return false;
				}	
			}
			
		}
		for(var i= minY;i<=maxY;i++){
			if(minX > 0){
				var inSideCell = this._matrix[i][minX];
				var outSideCell = this._matrix[i][minX-1];
				if(inSideCell==outSideCell){
					return false;
				}	
			}
			
			if(maxX < this._matrix[i].length-1){
				inSideCell = this._matrix[i][maxX];
				outSideCell = this._matrix[i][maxX+1];
				if(inSideCell==outSideCell){
					return false;
				}
			}
			
		}
		return true;
	},
	getSubMatrix:function(nwCell,seCell){
		var ret =[];
		var topRowIdx = nwCell.parent.getRowIdx();
		var topColIdx = nwCell.getColIdx();
		var bottomRowIdx = seCell.parent.parent.getRowIdx()+seCell.getRowSpan()-1;
		var bottomColIdx = seCell.getColIdx()+seCell.getColSpan()-1;
		for(var i=topRowIdx;i<=bottomRowIdx;i++){
			
		}
	},
	getCellsInRange:function(rowIdx1,colIdx1,rowIdx2,colIdx2){
		var cells = [];
		for(var i=rowIdx1;i< rowIdx2+1;i++){
			var cellsInRow = this._matrix[i];
			cells.push(cellsInRow[colIdx1]);
			for(var j=colIdx1+1;j<colIdx2+1;j++){
				if(cellsInRow[j]==cellsInRow[j-1]){
					continue;
				}
				cells.push(cellsInRow[j]);
			}
		}
		return cells;
	}
};
writer.util.TableTools.insertCell=function(newCell,row){
	var cellIdx = newCell.getColIdx();
	if(!row.cells){
		row.cells = new common.Container(row);
	}
	var tarCell = row.cells.select(function(cell){
		if(cell.getColIdx()>cellIdx){
			return true;
		}else{
			return false;
		}
	});
	if(tarCell){
		row.cells.insertBefore(newCell,tarCell);
	}else{
		row.cells.append(newCell);
	}
	row.markDirtyDOM();
	newCell.parent = row;
};
/*
 * used the table Matrix to maintain the rowspan and colSpan.
 */

writer.util.TableTools.splitHCells=function(curRowMatrix,newRow){
	var curRow = curRowMatrix[0].parent;
	var tarIdx = curRow.getRowIdx();
	var table = curRowMatrix[0].parent.parent;
	var newRowMatrix = [];
	newRow.cells.forEach(function(cell){
		var cellIdx = cell.getColIdx();
		newRowMatrix[cellIdx] = cell;
	});
	for(var i=0;i< curRowMatrix.length;i++){			
		if(!newRowMatrix[i]&&curRowMatrix[i]!=curRowMatrix[i-1]){
			var cell = curRowMatrix[i];
			cell.setRowSpan(cell.getRowSpan()+1);
		}
	}
	var r = curRow;
	while(r){
		r._rowIdx = tarIdx;
		tarIdx++;
		r = table.rows.next(r);
	}
};
//horizontal split the merged cell;
writer.util.TableTools.splitMergedCell=function(curCell,newCells){
	var colIdx = curCell.getColIdx();
	var preCell = curCell;
	for(var i=0;i< newCells.length;i++){
		var newCell = newCells[i];
		var newCellIdx = newCell.parent.getRowIdx();
		var t = newCellIdx-preCell.parent.getRowIdx();
		newCell.setRowSpan(preCell.getRowSpan()-t);
		preCell.setRowSpan(t);			
		preCell=newCell;
	};
};
// return the target cell for the move left/right/up/down keys.
writer.util.TableTools.moveLeft = function(currentCell){
//	delete this._vpreCell;
	var _viewTools = writer.util.ViewTools;
	var currentRowIdx = this._currRIdx;
	var currentTable = _viewTools.getTable(currentCell);	
	var tableMatrix = currentTable.getTableMatrix();
	if(this._currTbl!=currentTable){
		currentRowIdx = -1;
	}
	if(!currentRowIdx||currentRowIdx<0){
		currentRowIdx = currentCell.parent.getRowIdx();
		this._currTbl = currentTable;
		this._currRIdx = currentRowIdx;
	}
	if(currentRowIdx<0||currentRowIdx>=tableMatrix.length()){
		delete this._currRIdx;
		delete this._currTbl;
		return null;
	}
	var nextCellColIdx = currentCell.getColIdx()-1; 
	if(nextCellColIdx<0){
		this._currRIdx --;
		if(this._currRIdx>=0){
			return tableMatrix.getCell(this._currRIdx,tableMatrix.length2()-1);
		}else{
			delete this._currRIdx;
			delete this._currTbl;
			return null;
		}		
	}
	return tableMatrix.getCell(currentRowIdx,nextCellColIdx);
},
writer.util.TableTools.moveRight = function(currentCell){
//	delete this._vpreCell;
	var _viewTools = writer.util.ViewTools;
	var currentRowIdx = this._currRIdx;
	var currentTable = _viewTools.getTable(currentCell);	
	var tableMatrix = currentTable.getTableMatrix();
	if(this._currTbl!=currentTable){
		currentRowIdx = -1;
	}
	if(!currentRowIdx||currentRowIdx<0){
		currentRowIdx = currentCell.parent.getRowIdx();
		this._currTbl = currentTable;
		this._currRIdx = currentRowIdx;
	}
	if(currentRowIdx<0||currentRowIdx>=tableMatrix.length()){
		delete this._currRIdx;
		delete this._currTbl;
		return null;
	}
	var nextCellColIdx = currentCell.getColIdx()+currentCell.getColSpan(); 
	if(nextCellColIdx>=tableMatrix.length2()){
		this._currRIdx ++;
		if(this._currRIdx<tableMatrix.length()){
			return tableMatrix.getCell(this._currRIdx,0);
		}else{
			delete this._currRIdx;
			delete this._currTbl;
			return null;
		}		
	}
	return tableMatrix.getCell(currentRowIdx,nextCellColIdx);
};
writer.util.TableTools.moveUp = function(currentCell,clearRecord){
	if(clearRecord){
		delete this._currRIdx;
		delete this._currTbl;
	}	
	var _viewTools = writer.util.ViewTools;
	var preCell = this._vpreCell;
	var currentTable = _viewTools.getTable(currentCell);
	if(preCell&&_viewTools.getTable(preCell)!=currentTable){
		preCell = null;
	}
	var tableMatrix = currentTable.getTableMatrix();
	var colSpan = currentCell.getColSpan();
	if(colSpan==1||!preCell){
		var colIdx = currentCell.getColIdx();
	}else{
		var colIdx = preCell.getColIdx();
	}
	this._vpreCell = currentCell;
	var rowIdx = currentCell.parent.getRowIdx()-1;
	if(rowIdx<0){
		delete this._vpreCell;
		return null;
	}
	return tableMatrix.getCell(rowIdx,colIdx);
};
writer.util.TableTools.moveDown = function(currentCell,clearRecord){
	if(clearRecord){
		delete this._currRIdx;
		delete this._currTbl;
	}	
	var _viewTools = writer.util.ViewTools;
	var preCell = this._vpreCell;
	var currentTable = _viewTools.getTable(currentCell);
	if(preCell&&_viewTools.getTable(preCell)!=currentTable){
		preCell = null;
	}
	var tableMatrix = currentTable.getTableMatrix();
	var colSpan = currentCell.getColSpan();
	if(colSpan==1||!preCell){
		var colIdx = currentCell.getColIdx();
	}else{
		var colIdx = preCell.getColIdx();
	}
	var rowIdx = currentCell.parent.getRowIdx()+currentCell.getRowSpan();
	if(rowIdx>=tableMatrix.length()){
		delete this._vpreCell;
		return null;
	}
	this._vpreCell = currentCell;
	return tableMatrix.getCell(rowIdx,colIdx);
};
dojo.subscribe(writer.EVENT.LEFTMOUSEDOWN,function(){
	delete writer.util.TableTools._currRIdx;
	delete writer.util.TableTools._currTbl;
	delete writer.util.TableTools._vpreCell;
});





/**
 * The function will rearrange the table JSON data to fit the given table size.
 * @param tableJson
 * @param newTableWidth The unit is px
 */
writer.util.TableTools.resizeTable = function(tableJson, newTableWidth)
{
	// Need to deep detect avoid table include table.
	var colGrids = tableJson.tblGrid;
	var tableWidth = 0;
	for(var i = 0; i < colGrids.length; i++){
		tableWidth += common.tools.toPxValue(colGrids[i].w);
	}	
	
	if(newTableWidth >= tableWidth)
		return;
	
	var scale = newTableWidth / tableWidth;
	var newWidth;
	var offset = 8;	// Should revise with cell padding and border.
	var minimizeCellWidth = 13;
	for(var i = 0; i < colGrids.length; i++)
	{
		newWidth = Math.max( scale * common.tools.toPxValue(colGrids[i].w) - offset, minimizeCellWidth); 
		colGrids[i].w = newWidth + "px";
	}
	
	// Check embedded table
	var rows = tableJson.trs, row, cell, cellContent;
	for(var i = 0; i < rows.length; i++)	// Rows
	{
		row = rows[i];
		for(var j = 0; j < row.tcs.length; j++)	// Columns
		{
			cell = row.tcs[j];
			if(!cell.ps)
				continue;
			
			for(var k = 0; k < cell.ps.length; k++)	// Cell contents
			{
				cellContent = cell.ps[k];
				if(cellContent && cellContent.t == "tbl")
				{
					var curTableInCellWidth = colGrids[j].w;
					writer.util.TableTools.resizeTable(cellContent, curTableInCellWidth);
				}
			}	
		}	
	}	
};

writer.util.TableTools.getRepeatHeaderRows = function(table){
	var returnRows = [];
	var rows = table.rows;
	var row = rows.getFirst();
	while(row){
		if(row.isTblHeaderRepeat() == true && writer.util.ModelTools.isInDocTable(row)){
			returnRows.push(row)
			row = rows.next(row);
		}	
		else break;
	}
	return returnRows;
};
writer.util.TableTools.getRowsInRange = function(row1,row2){
	var rows = [];
	var modelTools = writer.util.ModelTools;
	table1 = modelTools.getTable(row1);
	table2 = modelTools.getTable(row2);
	if(table1 != table2) return null;
	var start = row1.getRowIdx() <= row2.getRowIdx() ? row1 : row2;
	var end = start == row1 ? row2 : row1;
	var row = start;
	while(row){
		rows.push(row);
		if(row == end) break;
		row = table1.rows.next(row);
	}
	return rows;
};

writer.util.TableTools.mergeBorderChangeSet = function(oldBorder,borderChangeSet) {
	var newBorder = dojo.clone(oldBorder);
	var hasChanged = false;
	if(borderChangeSet.left){
		hasChanged = true;
		newBorder.left = borderChangeSet.left.auto ? undefined : borderChangeSet.left;
	}
	if(borderChangeSet.right){
		hasChanged = true;
		newBorder.right = borderChangeSet.right.auto ? undefined : borderChangeSet.right;
	}
	if(borderChangeSet.top){
		hasChanged = true;
		newBorder.top = borderChangeSet.top.auto ? undefined : borderChangeSet.top;
	}
	if(borderChangeSet.bottom){
		hasChanged = true;
		newBorder.bottom = borderChangeSet.bottom.auto ? undefined : borderChangeSet.bottom;
	}
	if(borderChangeSet.h){
		hasChanged = true;
		newBorder.h = borderChangeSet.h.auto ? undefined : borderChangeSet.h; 
	}
	if(borderChangeSet.v){
		hasChanged = true;
		newBorder.v = borderChangeSet.v.auto ? undefined : borderChangeSet.v;
	}
	if(hasChanged){
		// fix defect 53774
		// some border style we don't support must define in pairs
		// if cellBorder has changed in docs,
		// all borders should be changed to supported tyle
		var _borderSet = {"none":true,"dotted":true,"dashed":true,"solid":true,"double":true,"groove":true,"ridge":true,"inset":true,"outset":true};
		var _adapterBorderStyle = function(border) {
			if(!border || !border.style)
				return;
			border.style = border.style.toLowerCase();
			var ret = common.tools.borderMap[border.style];
			if(_borderSet[ret]){
				border.style = ret;
			}else{
				border.style = "solid";
			}
		};
		_adapterBorderStyle(newBorder.left);
		_adapterBorderStyle(newBorder.right);
		_adapterBorderStyle(newBorder.top);
		_adapterBorderStyle(newBorder.bottom);
		_adapterBorderStyle(newBorder.h);
		_adapterBorderStyle(newBorder.v);
	}
	return newBorder;
};

writer.util.TableTools.getBorderChangeSet = function(oldBorder,newBorder) {
	var borderChangeSet ={};
	if(oldBorder.left != newBorder.left){
		borderChangeSet.left = newBorder.left === undefined ? {auto:true} : newBorder.left;
	}
	if(oldBorder.right != newBorder.right){
		borderChangeSet.right = newBorder.right === undefined ? {auto:true} : newBorder.right;
	}
	if(oldBorder.top != newBorder.top){
		borderChangeSet.top = newBorder.top === undefined ? {auto:true} : newBorder.top;
	}
	if(oldBorder.bottom != newBorder.bottom){
		borderChangeSet.bottom = newBorder.bottom === undefined ? {auto:true} : newBorder.bottom;
	}
	if(oldBorder.h != newBorder.h){
		borderChangeSet.h = newBorder.h === undefined ? {auto:true} : newBorder.v;
	}
	if(oldBorder.v != newBorder.v) {
		borderChangeSet.v = newBorder.v === undefined ? {auto:true} : newBorder.v;
	}
	return dojo.clone(borderChangeSet);
};

writer.util.TableTools.changeBorders = function(table,newBorder,rows,cols){
	if(newBorder === undefined)
		newBorder = {auto:true};
	var tableMatrix = table.getTableMatrix();
	var cellDict = new dojox.collections.Dictionary();
	dojo.forEach(rows,function(row){
		var borderMatrix = tableMatrix.getRowBorders(row.row)[row.col];
		var preCell = borderMatrix.getPreCell();
		var nextCell = borderMatrix.getNextCell();
		if(preCell == nextCell) // merged cell inside
			return;
		if(preCell){
			var tmp = cellDict.item(preCell.id) || {};
			tmp.obj = preCell;
			tmp.border = tmp.border || {};
			tmp.dirty = tmp.dirty || {};
			tmp.dirty.bottom = tmp.dirty.bottom || [];
			tmp.dirty.bottom.push(row.col - preCell.getColIdx());
			tmp.border.bottom = newBorder;
			cellDict.add(preCell.id,tmp);
		}
		if(nextCell){
			var tmp = cellDict.item(nextCell.id) || {};
			tmp.obj = nextCell;
			tmp.border = tmp.border || {};
			tmp.border.top = newBorder;
			tmp.dirty = tmp.dirty || {};
			tmp.dirty.top = tmp.dirty.top || [];
			tmp.dirty.top.push(row.col - nextCell.getColIdx());
			cellDict.add(nextCell.id,tmp);
		}
	});
	dojo.forEach(cols,function(col){
		var borderMatrix = tableMatrix.getColBorders(col.col)[col.row];
		var preCell = borderMatrix.getPreCell();
		var nextCell = borderMatrix.getNextCell();
		if(preCell == nextCell) // merged cell inside
			return;
		if(preCell && preCell.parent.getRowIdx() == col.row){
			var tmp = cellDict.item(preCell.id) || {};
			tmp.obj = preCell;
			tmp.border = tmp.border || {};
			tmp.border.right = newBorder;
			cellDict.add(preCell.id,tmp);
		}
		
		if(nextCell && nextCell.parent.getRowIdx() == col.row){
			var tmp = cellDict.item(nextCell.id) || {};
			tmp.obj = nextCell;
			tmp.border =tmp.border || {};
			tmp.border.left = newBorder;
			cellDict.add(nextCell.id,tmp);
		}
	});
	return dojo.filter(cellDict.getValueList(),function(change){
		// for colSpan > 1, 
		// only change top/bottom border when all cell upper/lower changes
		if(change.border.bottom){
			var i = 0,colSpan = change.obj.getColSpan();
			for(; i < colSpan; i++){
				if(change.dirty.bottom.indexOf(i) == -1)
					break;
			}
			if(i < colSpan)
				delete change.border.bottom;
		}
		if(change.border.top){
			var i = 0,colSpan = change.obj.getColSpan();
			for(; i < colSpan; i++){
				if(change.dirty.top.indexOf(i) == -1)
					break;
			}
			if(i < colSpan)
				delete change.border.top;
		}
		delete change.dirty;
		if(!change.border.bottom && !change.border.top && !change.border.left && !change.border.right)
			return false;
		return true;
	});
};

/**
 * compair border priority in render
 * @return -1 when oldBoder has higher priority
 *          0  when same priority
 *          1  when newBoder has higher priority
 */
writer.util.TableTools.compareBorder = function(newBorder, oldBorder){
	if(newBorder == oldBorder)
		return 0;
	if(!oldBorder)
		return 1;
	if(!newBorder)
		return -1;
	// compair style
	var newBorderStyle = newBorder.style || newBorder.val || "none",
		oldBorderStyle = oldBorder.style || oldBorder.val || "none";
	var stylePriority = {
		"none":-1,"nil":-1,
		"dotted":1,
		"dashed":2,
		"double":3,"triple":3,"single":3,"solid":3,
		"dotdash":4,"dotdotdash":4,
		"wave":6,
		"doublewave":7,
		"inset":8,
		"outset":9,
		"thinthickthinlargegap":10,
		"thickthinlargegap":11,
		"thinthicklargegap":12,
		"thinthickthinmediumgap":13,
		"thickthinmediumgap":14,
		"thinthickmediumgap":15,
		"thinthickthinsmallgap":16,
		"thickthinsmallgap":17,
		"thinthicksmallgap":18,
		"dashsmallgap":19,
		"dashdotstroked":20,
		"threedemboss":21,
		"threedengrave":22 
	};
	var newStylePriority = stylePriority[newBorderStyle.toLowerCase()] || 0;
	var oldStylePriority = stylePriority[oldBorderStyle.toLowerCase()] || 0;
	if(newStylePriority > oldStylePriority)
		return 1;
	if(newStylePriority < oldStylePriority)
		return -1;
	// border with larger width has higer priority
	var widthHandler = function(border){
		if(!border || !border.sz)
			return 0;
		var sz = common.tools.toPtValue(border.sz);
		var borderStyle = border.style || border.val ||"none";
		borderStyle = borderStyle.toLowerCase();
		if(borderStyle == "double")
			return sz*3;
		else if(borderStyle == "triple")
			return sz*5;
		return sz;
	};
	var newBorderWidth = widthHandler(newBorder),
		oldBorderWidth = widthHandler(oldBorder);
	if(newBorderWidth > oldBorderWidth)
		return 1;
	if(newBorderWidth < oldBorderWidth)
		return -1;
	// compair color ?
	// default
	return 0;
};

writer.util.TableTools.borderFromJson = function(borderJson){
	if(!borderJson)
		return;
	var border = dojo.clone(borderJson);
	border.width = border.width || border.sz;
	border.style = border.style || border.val;
	delete border.sz;
	delete border.val;
	return border;
};