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
define([
    "dojo/_base/array",
    "dojo/_base/lang",
    "dojo/topic",
    "writer/common/Container",
    "writer/common/tools",
    "writer/constants",
    "writer/msg/msgCenter",
    "writer/util/ModelTools",
    "writer/util/ViewTools",
    "writer/util/TableTools"
], function(array, lang, topic, Container, tools, constants, msgCenter, ModelTools, ViewTools, TableTools) {

    var TableMatrix = function(table, type, cloneFrom) {
        this.table = table;
        this._matrix = [];
        this._borders = {
            rows: [],
            cols: []
        };
		this.baseContainer = this.table.rows ;
		if(type == "all")
		{
			this.isEntireTable = true;
			if(cloneFrom)
				return this.createDupTableMatrix(cloneFrom);
		}
		else if(type == "split" && cloneFrom)
		{
			if(!this.isStartWithRowSpan())
				return this.createDupTableMatrix(cloneFrom);
		}
		else if(this.table.modelType == "table.table")
			this.baseContainer = this.table.getVisibleRows(true);

        this.createTableMatrix();
        this.fixBorderMatrix();
    };

    TableMatrix.Border = function(cell, linkMark, len, rowCnt, colCnt) {
        this.resetPre = function() {
            this.pre = {
                    cell: null,
                    len: 0,
                    mark: null
                };
        };
        this.resetNext = function() {
            this.next = {
                    cell: null,
                    len: 0,
                    mark: null
                };
        };    	
        this.init = function(cell, linkMark, len, rowCnt, colCnt) {
        	this.resetPre();
        	this.resetNext();
            this.linkMark = linkMark;
            this[linkMark.pos].cell = cell;
            this[linkMark.pos].len = len;
            this._rowCnt = rowCnt;
            this._colCnt = colCnt;
        };
        if(cell) {
        	this.init(cell, linkMark, len, rowCnt, colCnt);
        };        
        this.initFrom = function(oldBorder) {
        	this.linkMark = oldBorder.linkMark;
        	if(oldBorder.pre)
        		this.pre = oldBorder.pre;
        	if(oldBorder.next)
        		this.next = oldBorder.next;
            this._rowCnt = oldBorder.rowCnt;
            this._colCnt = oldBorder.colCnt;
        };
        this.getBorder = function() {
            var cell = this.getLinkedCell();
            var borderProp;
            if(cell.getBorder){
                borderProp = cell.getBorder(this._rowCnt, this._colCnt);
            }else if(cell.model && cell.model.getBorder){
                borderProp = cell.model.getBorder(this._rowCnt, this._colCnt);
            }
            borderProp = borderProp || {};
            return borderProp[this.linkMark.border];
        };
        this.getLinkedCell = function() {
            return this[this.linkMark.pos].cell;
        };
        this.isLinkedPre = function() {
            return this.linkMark.pos == "pre";
        };
        this.getLinkedLen = function() {
            return this[this.linkMark.pos].len;
        };
        this.getPreCell = function() {
            return this.pre.cell;
        };
        this.getNextCell = function() {
            return this.next.cell;
        };
        this.setCell = function(cell, linkMark, len) {
            var isPrepared = this.isPrepared();
            this[linkMark.pos].cell = cell;
            this[linkMark.pos].mark = linkMark;
            var borderProp;
            var hasSwapped = false;
            if (linkMark == this.linkMark && isPrepared) {
                var pair = TableMatrix.Border.LinkMark[this.linkMark.pair];
                var borderCell = this[pair.pos].cell;
                if (borderCell && (this[pair.pos].len <= len)) {
                    // move linkMark to other side
                    hasSwapped = true;
                    this.linkMark = pair;
                }
            }
            this[linkMark.pos].len = len;
            borderProp = {};
            if(cell.getBorder){
                borderProp = cell.getBorder(this._rowCnt, this._colCnt);
            }else if(cell.model && cell.model.getBorder){
                borderProp = cell.model.getBorder(this._rowCnt, this._colCnt);
            }
            borderProp = borderProp || {};
            var border = borderProp[linkMark.border];
            var currentBorder = this.getBorder();
            var priority = TableTools.compareBorder(border, currentBorder);
            // fix border of vMerge
            if (linkMark.border == "left" || linkMark.border == "right") {

                if (len < this.getLinkedLen() && currentBorder != border) {
                    this.linkMark = linkMark;
                    return;
                } else if (len > this.getLinkedLen() && isPrepared && currentBorder != border){
                    return;
                }
            }
            if (priority > 0) {
                this.border = border;
                this.linkMark = linkMark;
            } else if (priority == 0) {
                if (len < this.getLinkedLen() && currentBorder != border) {
                    this.linkMark = linkMark;
                } else if (len == this.getLinkedLen() && hasSwapped) {
                    // if linkMark is moved to otherside and not changed
                    // move it back
                    this.linkMark = linkMark;
                }
            }
        };
        this.getJsonBorder = function() {
            var linkCell = this.getLinkedCell();
            var borderProp = {};
            if (linkCell.getProperty) {
                borderProp = linkCell.getProperty().borderToJson();
            } else if (linkCell.model && linkCell.model.getProperty) {
                borderProp = linkCell.model.getProperty().borderToJson();
            }
            borderProp = borderProp || {};
            var border = lang.clone(borderProp[this.linkMark.border]);
            return border;
        };
        this.isPrepared = function(len) {
            return this.pre.cell !== null && this.next.cell !== null;
        };
    };
    TableMatrix.Border.LinkMark = {
        TOP: {
            pos: "next",
            border: "top",
            pair: "BOTTOM"
        },
        BOTTOM: {
            pos: "pre",
            border: "bottom",
            pair: "TOP"
        },
        LEFT: {
            pos: "next",
            border: "left",
            pair: "RIGHT"
        },
        RIGHT: {
            pos: "pre",
            border: "right",
            pair: "LEFT"
        }
    };
    TableMatrix.prototype = {
        fillRowMatrix: function(row, rowIndex) {
			if(!this.table.modelType)
            	row._rowIdx = rowIndex;
            var cell = row.cells.getFirst();
            var cellIndex = 0;
            while (cell) {
                var rowSpan = cell.rowSpan || 1;
                var colSpan = cell.colSpan || 1;
                var r = 0;
                while (r < rowSpan) {
                    var rowMatrix = this._matrix[rowIndex + r];
                    if (!rowMatrix) {
                        rowMatrix = this._matrix[rowIndex + r] = [];
                    }
                    while (rowMatrix[cellIndex]) {
                        cellIndex++;
                    }
                    var c = 0;
                    while (c < colSpan) {
                        if (rowMatrix[cellIndex + c]) {
                            return;
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
            var borders = {
                rows: [],
                cols: []
            };
            var that = this;
            var cells = [];
            var rowCnt = this.length();
            var colCnt = this.length2();
            this.baseContainer.forEach(function(row) {
                var rowIndex = that.getRowIdx(row);
                row.cells.forEach(function(cell) {
                    var cellIndex = cell.getColIdx();
                    var rowSpan = cell.rowSpan;
                    var colSpan = cell.colSpan;
                    var r = 0;
                    while (r < rowSpan) {
                        var topBorders = borders.rows[rowIndex + r];
                        var oldTopBorders = that._borders && that._borders.rows &&that._borders.rows[rowIndex + r];
                        if (!topBorders) {
                            topBorders = borders.rows[rowIndex + r] = [];
                        }
                        var bottomBorders = borders.rows[rowIndex + r + 1];
                        var oldBottomBorders = that._borders && that._borders.rows && that._borders.rows[rowIndex + r];
                        if (!bottomBorders) {
                            bottomBorders = borders.rows[rowIndex + r + 1] = [];
                        }
                        var c = 0;
                        var cellBorder;
                        if (cell.getProperty)
                            cellBorder = cell.getProperty().borderToJson();
                        else if (cell.model && cell.model.getProperty)
                            cellBorder = cell.model.getProperty().borderToJson();
                        cellBorder = cellBorder || {};
                        var TableBorder = TableMatrix.Border;
                        while (c < colSpan) {
                            if (!topBorders[cellIndex + c]) {
                                topBorders[cellIndex + c] = new TableBorder(cell, TableBorder.LinkMark.TOP, c, rowCnt, colCnt);
                            } else {
                                topBorders[cellIndex + c].setCell(cell, TableBorder.LinkMark.TOP, c);
                                if (topBorders[cellIndex + c].isPrepared() &&
                                    (!oldTopBorders || !oldTopBorders[cellIndex + c] ||
                                    topBorders[cellIndex + c].linkMark != oldTopBorders[cellIndex + c].linkMark)
                                    ) {
                                    cells.push(topBorders[cellIndex + c].getPreCell());
                                    cells.push(topBorders[cellIndex + c].getNextCell());
                                }
                            }
                            if (!bottomBorders[cellIndex + c]) {
                                bottomBorders[cellIndex + c] = new TableBorder(cell, TableBorder.LinkMark.BOTTOM, c, rowCnt, colCnt);
                            } else {
                                bottomBorders[cellIndex + c].setCell(cell, TableBorder.LinkMark.BOTTOM, c);
                                if (bottomBorders[cellIndex + c].isPrepared() &&
                                    (!oldBottomBorders || !oldBottomBorders[cellIndex + c] ||
                                    bottomBorders[cellIndex + c].linkMark != oldBottomBorders[cellIndex + c].linkMark)) {
                                    cells.push(bottomBorders[cellIndex + c].getPreCell());
                                    cells.push(bottomBorders[cellIndex + c].getNextCell());
                                }
                            }
                            var leftBorders = borders.cols[cellIndex + c];
                            var oldLeftBorders = that._borders && that._borders.cols && that._borders.cols[cellIndex + c];
                            if (!leftBorders)
                                leftBorders = borders.cols[cellIndex + c] = [];
                            if (!leftBorders[rowIndex + r]) {
                                leftBorders[rowIndex + r] = new TableBorder(cell, TableBorder.LinkMark.LEFT, r, rowCnt, colCnt);
                            } else {
                                leftBorders[rowIndex + r].setCell(cell, TableBorder.LinkMark.LEFT, r);
                                if (leftBorders[rowIndex + r].isPrepared() &&
                                    (!oldLeftBorders || !oldLeftBorders[rowIndex + r] ||
                                    leftBorders[rowIndex + r].linkMark != oldLeftBorders[rowIndex + r].linkMark)) {
                                    cells.push(leftBorders[rowIndex + r].getPreCell());
                                    cells.push(leftBorders[rowIndex + r].getNextCell());
                                }
                            }
                            var rightBorders = borders.cols[cellIndex + c + 1];
                            var oldRightBorders = that._borders && that._borders.cols && that._borders.cols[cellIndex + c + 1];
                            if (!rightBorders)
                                rightBorders = borders.cols[cellIndex + c + 1] = [];
                            if (!rightBorders[rowIndex + r]) {
                                rightBorders[rowIndex + r] = new TableBorder(cell, TableBorder.LinkMark.RIGHT, r, rowCnt, colCnt);
                            } else {
                                rightBorders[rowIndex + r].setCell(cell, TableBorder.LinkMark.RIGHT, r);
                                if (rightBorders[rowIndex + r].isPrepared() &&
                                    (!oldRightBorders || !oldRightBorders[rowIndex + r] ||
                                    rightBorders[rowIndex + r].linkMark != oldRightBorders[rowIndex + r].linkMark)) {
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
        cloneBorderByRowIdx: function(idx, onlyRow) {
        	var  newBorders = {
                    rows: [],
                    cols: []
                };
        	var rowBds = this.getRowBorders(idx);
        	var nRow = [];
        	for(var i=0;i<rowBds.length;i++){
        		var newBorder =	new TableMatrix.Border();
        		newBorder.initFrom(rowBds[i]);
        		nRow.push(newBorder);
        	}
        	newBorders.rows.push(nRow);

        	if(!onlyRow) {
            	for(var i=0;i<this._borders.cols.length;i++){
            		var col=[];
            		var newBorder =	new TableMatrix.Border();
            		var dupCol = this.getColBorders(i);
            		newBorder.initFrom(dupCol[idx]);
            		col.push(newBorder);
            		newBorders.cols.push(col);
            	}        		
        	}
        	return newBorders;
        },
        fixTopBottomBds: function() {
        	var idx = 0;
        	var tRBds = this.getRowBorders(idx);
        	 
        	tRBds.forEach(function(border){
    			if(border.getPreCell()) {
    				border.resetPre();
    				border.linkMark = TableMatrix.Border.LinkMark.TOP;
    			}
    		});
        	tRBds = this.getRowBorders(-1);
        	tRBds.forEach(function(border){
    			if(border.getNextCell()) {
    				border.resetNext();
    				border.linkMark = TableMatrix.Border.LinkMark.BOTTOM;
    			}
    		});        	
        },
        updateBorderCnt: function(nRowCnt, nColCnt) {
        	this._borders.rows.forEach(function(row){
        		row.forEach(function(border){
        			border._rowCnt = nRowCnt;
        			if(nColCnt)
        				border._colCnt = nColCnt;       
        		});
        	});
        	
        	this._borders.cols.forEach(function(cols){
        		cols.forEach(function(border){
        			border._rowCnt = nRowCnt;
           			if(nColCnt)
           				border._colCnt = nColCnt;       
        		});
        	});        	
        },
        checkCellBorderChange: function(cell){
            var rowIndex = this.getRowIdx(cell.parent);
            var colIndex = cell.getColIdx();
            var colSpan = Math.min(cell.getColSpan(), this.length2() - colIndex);
            var rowSpan = Math.min(cell.getRowSpan(), this.length() - rowIndex);
            // illegal cell or cellView has not layouted, the martix should be rebuild later
            if (!(rowIndex >= 0 && colIndex >= 0 && colSpan >= 1 && rowSpan >= 1)) {
                return;
            }
            for(var i = 0; i < rowSpan; i++){
                // left
                var leftBorder = this._borders.cols[colIndex][rowIndex + i];
                if(leftBorder && leftBorder.next && leftBorder.next.cell == cell)
                    leftBorder.setCell(cell, TableMatrix.Border.LinkMark.LEFT, i);
                // right
                var rightBorder = this._borders.cols[colIndex + colSpan][rowIndex + i];
                if (rightBorder && rightBorder.pre && rightBorder.pre.cell == cell)
                    rightBorder.setCell(cell, TableMatrix.Border.LinkMark.RIGHT, i);

            }
            for(var j = 0; j < colSpan; j++){
                // top
                var topBorder = this._borders.rows[rowIndex][colIndex + j];
                if (topBorder && topBorder.next && topBorder.next.cell == cell)
                    topBorder.setCell(cell, TableMatrix.Border.LinkMark.TOP, j);
                // bottom
                var bottomBorder = this._borders.rows[rowIndex + rowSpan][colIndex + j];
                if (bottomBorder && bottomBorder.pre && bottomBorder.pre.cell == cell)
                    bottomBorder.setCell(cell, TableMatrix.Border.LinkMark.BOTTOM, j);
            }
        },
        createTableMatrix: function() {
            var that = this;
            this._borders = {
                rows: [],
                cols: []
            };
			this.baseContainer.forEach(function(row,idx) {
                that.fillRowMatrix(row, idx);
            });

            if(this._matrix.length == 0)//invisible table
                return;
            var cellCnt = this._matrix[0].length;
            for (var i = 1; i < this._matrix.length; i++) {
                if (this._matrix[i].length != cellCnt) {
                    var inView = this.table.model;
                    if (inView)
                    {
                        console.warn("inView unsupport table model id is: " + this.table.model.id);
                    }
                    else
                    {
                        console.error("inModel unsupport table model id is: " + this.table.id);
                        this._reloadToFix();
                    }
                    return;
                }
            }
		},
		isStartWithRowSpan: function() {
			var row = this.baseContainer.getFirst();
			var ret = false;
			row.cells.forEach(function(cell){
				if(cell.model.rowSpan > 1)
					ret = true;
			});
			return ret;
		},
		createDupTableMatrix: function(vMatrix) {
			var fromIdx = vMatrix.fromIdx || 0;
			var toIdx = vMatrix.toIdx || (vMatrix._matrix.length);
			if(fromIdx == 0 && toIdx == (vMatrix._matrix.length)) {
				this._borders = vMatrix._borders;
				this._matrix = vMatrix._matrix;
				this.baseContainer = vMatrix.baseContainer;
				
			} else {
				var nIdx = 0;				
				if(!this.table.modelType) {
					if(this.baseContainer.length() > (toIdx - fromIdx)) {
						var firstRow = this.baseContainer.getByIndex(0);
						this.fillRowMatrix(firstRow, 0);
						var newBorders = vMatrix.cloneBorderByRowIdx(fromIdx - 1);
						this._borders = newBorders;
						nIdx++;
					}

					this.baseContainer.forEach(function(row,idx) {
		            	row._rowIdx = idx;
		            });
				}

				for (var i=fromIdx; i<toIdx; i++) {

					this._matrix[nIdx] = vMatrix._matrix[i];
					if(i == fromIdx) {
						var lBds = vMatrix.cloneBorderByRowIdx((i), true);
						this._borders.rows[nIdx] = lBds.rows[0];
					} else {
						this._borders.rows[nIdx] = vMatrix.getRowBorders(i);
					}
					if (i == (toIdx - 1)) {
						var lBds = vMatrix.cloneBorderByRowIdx((i+1), true);
						this._borders.rows[nIdx + 1] = lBds.rows[0];
					}
					for(var j=0; j<vMatrix._borders.cols.length; j++){
						if(this._borders.cols.length<=j)
							this._borders.cols[j] = [];
						var curCol = this.getColBorders(j);
						var dupCol = vMatrix.getColBorders(j);
						curCol[nIdx] = dupCol[i];
					}
					nIdx++;
				}

				if(fromIdx == toIdx && this._borders.rows.length == this._matrix.length) {
					var lBds = vMatrix.cloneBorderByRowIdx((toIdx), true);
					this._borders.rows[nIdx] = lBds.rows[0];
				}

				this.updateBorderCnt(this._matrix.length, this._matrix[0].length);
				this.fixTopBottomBds();
			}
       	},
        /**
         * some unkown issue make a wrong table, it will break out custom's docmunt.
         * this method will try to fix it.
         * WARNING: This method just make document not break out, may not expected as custom want
         * @return 
         */
        _reloadToFix: function() {
            if (this.table.model) {
                // will send check msg only in model
                return;
            }
            
            var mc = constants.MSGCATEGORY.Content;
            if (ModelTools.isInHeaderFooter(this.table)) {
                mc = constants.MSGCATEGORY.Relation;
            } else if (ModelTools.isInFootNotes(this.table)) {
                mc = constants.MSGCATEGORY.Footnotes;
            } else if (ModelTools.isInEndNotes(this.table)) {
                mc = constants.MSGCATEGORY.Endnotes;
            }
            var me = this;
            setTimeout(function(){
                msgCenter.sendCheckModelMsg(me.table, mc);
            }, 10);
            // throw new Exception("unsupport table id is: " + this.id);
        },
        getBorder: function(rowIndex, colIndex) {
            var borderProp = {};
            borderProp.left = this._borders.cols[colIndex][rowIndex].getJsonBorder();
            borderProp.right = this._borders.cols[colIndex + 1][rowIndex].getJsonBorder();
            borderProp.top = this._borders.rows[rowIndex][colIndex].getJsonBorder();
            borderProp.bottom = this._borders.rows[rowIndex + 1][colIndex].getJsonBorder();
            return borderProp;
        },
        getRowBorders: function(rowIdx) {
            if(rowIdx < 0)
        	rowIdx = (this._borders.rows.length - 1);
            return this._borders.rows[rowIdx];
        },
        getColBorders: function(colIdx) {
            return this._borders.cols[colIdx];
        },
        getRowMatrix: function(row) {
			var rowIdx = this.getRowIdx(row);
			return this._matrix[rowIdx];
        },
        length: function() {
            return this._matrix.length;
        },
        length2: function() {
            if (this._matrix.length === 0) {
                return 0;
            }
            return this._matrix[0].length;
        },
        item: function(row) {
			var rowIdx = this.getRowIdx(row);
			return this._matrix[rowIdx];
        },
		getRowIdx: function(row){
			if(!this.table.modelType || this.table.showDel || this.isEntireTable )
				return row._rowIdx;
			else
				return row._vRowIdx;
		},
        getCell: function(rowIdx, colIdx) {
            return this._matrix[rowIdx][colIdx];
        },
        getNextCell: function(cell, inTheSameCol) {
            var colIdx = cell._colIdx;
			var rowIdx = this.getRowIdx(cell.parent);
			var nextCell = cell;
            var cells = [];
            if (inTheSameCol) {
                cells = this.getColumn(rowIdx, colIdx);
            } else {
                cells = this._matrix[rowIdx];
            }
            var idx = cells.indexOf(cell);
            var nextCell = cell;
            while (nextCell == cell) {
                nextCell = cells[idx++];
            }
            return nextCell;
        },
        getPreviousCell: function(cell, inTheSameCol) {
            var colIdx = cell._colIdx;
			var rowIdx = this.getRowIdx(cell.parent);
			var nextCell = cell;
            var cells = [];
            if (inTheSameCol) {
                cells = this.getColumn(colIdx);
            } else {
                cells = this._matrix[rowIdx];
            }
            var idx = cells.indexOf(cell);
            while (nextCell == cell) {
                nextCell = cells[idx--];
            }
            return nextCell;
        },
        getNextOrPreviousCellInRowOrCol: function(nextOrPrevious, rowOrCol, idx, cell) {
            var cells = [];
            if (rowOrCol == "row") {
                cells = this._matrix[idx];
            } else if (rowOrCol == "col") {
                cells = this.getColumn(idx);
            } else {
                return;
            }
            var nextIdx = cells.indexOf(cell);
            var nextCell = null;
            do {
                if (nextOrPrevious == "next") {
                    if (++nextIdx >= cells.length) {
                        return null;
                    }
                } else if (nextOrPrevious == "previous") {
                    if (--nextIdx < 0) {
                        return null;
                    }
                }
                nextCell = cells[nextIdx];
            } while (nextCell == cell);
            return nextCell;
        },
        getColumnCount: function() {
            return this._matrix[0].length;
        },
        getColumn: function(i) {
            var col = [];
            for (var j = 0; j < this.length(); j++) {
                col.push(this._matrix[j][i]);
            }
            return col;
        },
        getCrossRow: function(cell) {
            var row = cell.parent;
            var rowSpan = cell.getRowSpan();
            var ret = [];
            var i = 0;
            while (i < ret) {
                ret.push(row);
				row = this.baseContainer.next(row);
            }
        },
        getColumnWidth: function(cell) {
            return this.table.getColumnWidth(cell._colIdx);
        },
        getArrayMatrix: function() {
            return this._matrix;
        },
        getLastCell: function() {
            var x = this._matrix.length - 1;
            var y = this._matrix[x].length - 1;
            return this._matrix[x][y];
        },
        getCellIdxInJson: function(rowIdx, cellIdx) {
            if (!this._matrix[rowIdx][cellIdx]) {
                return null;
            }
            var cellIdxInJson = 0;
            var i = 0;
            while (i < cellIdx) {
                var currentCell = this._matrix[rowIdx][i];
                var nextCell = this._matrix[rowIdx][i + 1];
                if (nextCell._colIdx != currentCell._colIdx) {
                    cellIdxInJson++;
                }
                i++;
            }
            return cellIdxInJson;
        },
        mergeVerticalCell: function(row, cell) {
			var rowIdx = this.getRowIdx(row);
            var cellIdx = cell.getColIdx();
            var preCell = this._matrix[rowIdx - 1][cellIdx];
			var preRowIdx = this.getRowIdx(preCell.parent);
            preCell.setRowSpan(preCell.getRowSpan() + 1);
            var LinkMark = TableMatrix.Border.LinkMark;
            for (var i = 0; i < cell.colSpan; i++) {
                this._matrix[rowIdx][cellIdx + i] = preCell;
                // Merge Borders
                this._borders.rows[rowIdx][cellIdx + i].setCell(preCell, LinkMark.TOP, i);
                this._borders.rows[rowIdx + 1][cellIdx + i].setCell(preCell, LinkMark.BOTTOM, i);
            }
            // TODO simply discard the vMerged cell is not a good implement
            // fixed vertical borders
            // don't need to send message to server
            // server will auto change the vMerged cell's border after related cell's border changed
            if (cellIdx > 0 && !this._borders.cols[cellIdx][rowIdx].isLinkedPre()) {
                // if left border is follow vMerged cell, change the left cell's right border;
                var leftCell = this._matrix[rowIdx][cellIdx - 1];
                leftCell = leftCell.model ? leftCell.model : leftCell;
                if (leftCell.parent.getRowIdx() == rowIdx) {
                    var borderJson = this._borders.cols[cellIdx][rowIdx].getJsonBorder();
                    leftCell.changeBorder({
                        right: TableTools.borderFromJson(borderJson)
                    });
                }
            }
            if (cellIdx + cell.colSpan < this.length2() &&
                this._borders.cols[cellIdx + cell.colSpan][rowIdx].isLinkedPre()) {
                // if right border is follow vMerged cell,change the right cell's left border;
                var rightCell = this._matrix[rowIdx][cellIdx + cell.colSpan];
                rightCell = rightCell.model ? rightCell.model : rightCell;
                if (rightCell.parent.getRowIdx() == rowIdx) {
                    var borderJson = this._borders.cols[cellIdx + cell.colSpan][rowIdx].getJsonBorder();
                    rightCell.changeBorder({
                        left: TableTools.borderFromJson(borderJson)
                    });
                }
            }
            //Merge Borders
            this._borders.cols[cellIdx][rowIdx].setCell(preCell, LinkMark.LEFT, rowIdx - preRowIdx);
            this._borders.cols[cellIdx + cell.colSpan][rowIdx].setCell(preCell, LinkMark.RIGHT, rowIdx - preRowIdx);
        },
        splitVerticalMergedCell: function(row, cell, json) {
			var rowIdx = this.getRowIdx(row);
            var colIdx = cell.getColIdx();
            var cellIdxInJson = this.getCellIdxInJson(rowIdx, colIdx);
            json.trs[rowIdx].tcs[cellIdxInJson].tcPr.vMerge = {
                val: "restart"
            };

            for (var rowOffset = 1; rowOffset < cell.getRowSpan(); rowOffset++) {
                var preIdx = this.getCellIdxInJson(rowIdx + rowOffset, colIdx - 1);
                if (preIdx === null) {
                    preIdx = -1;
                }
                //var	nextIdx = this.getCellIdxInJson(rowIdx+rowOffset, colIdx+cell.getColSpan());

                var recoveredCellJson = cell.emptyClone();
                //var recoveredCellJson = recoveredCell.toJson();
                recoveredCellJson.tcPr.vMerge = {};
                recoveredCellJson.tcPr.border = this.getBorder(rowIdx + rowOffset, colIdx);
                //if(preIdx != null){
                json.trs[rowIdx + rowOffset].tcs.splice(preIdx + 1, 0, recoveredCellJson);
                //}else{
                //	json.trs[rowIdx+rowOffset].tcs.splice(nextIdx-1, 0, recoveredCellJson);
                //}
            }
        },
        canMerge: function(nwCell, seCell) {
            var minX = nwCell.getColIdx();
            var maxX = seCell.getColIdx() + seCell.getColSpan() - 1;
			var minY = this.getRowIdx(nwCell.parent);
			var maxY = this.getRowIdx(seCell.parent) + seCell.getRowSpan() - 1;
            for (var i = minX; i <= maxX; i++) {
                if (minY > 0) {
                    var inSideCell = this._matrix[minY][i];
                    var outSideCell = this._matrix[minY - 1][i];
                    if (inSideCell == outSideCell) {
                        return false;
                    }
                }
                if (maxY < this._matrix.length - 1) {
                    inSideCell = this._matrix[maxY][i];
                    outSideCell = this._matrix[maxY + 1][i];
                    if (inSideCell == outSideCell) {
                        return false;
                    }
                }

            }
            for (var i = minY; i <= maxY; i++) {
                if (minX > 0) {
                    var inSideCell = this._matrix[i][minX];
                    var outSideCell = this._matrix[i][minX - 1];
                    if (inSideCell == outSideCell) {
                        return false;
                    }
                }

                if (maxX < this._matrix[i].length - 1) {
                    inSideCell = this._matrix[i][maxX];
                    outSideCell = this._matrix[i][maxX + 1];
                    if (inSideCell == outSideCell) {
                        return false;
                    }
                }

            }
            return true;
        },
        getSubMatrix: function(nwCell, seCell) {
            var ret = [];
			var topRowIdx = this.getRowIdx(nwCell.parent);
            var topColIdx = nwCell.getColIdx();
			var bottomRowIdx = this.getRowIdx(seCell.parent.parent) + seCell.getRowSpan()-1;
            var bottomColIdx = seCell.getColIdx() + seCell.getColSpan() - 1;
            for (var i = topRowIdx; i <= bottomRowIdx; i++) {

            }
        },
        getCellsInRange: function(rowIdx1, colIdx1, rowIdx2, colIdx2) {
            var cells = [];
            for (var i = rowIdx1; i < rowIdx2 + 1; i++) {
                var cellsInRow = this._matrix[i];
                cells.push(cellsInRow[colIdx1]);
                for (var j = colIdx1 + 1; j < colIdx2 + 1; j++) {
                    if (cellsInRow[j] == cellsInRow[j - 1]) {
                        continue;
                    }
                    cells.push(cellsInRow[j]);
                }
            }
            return cells;
        }
    };


    return TableMatrix;
});
