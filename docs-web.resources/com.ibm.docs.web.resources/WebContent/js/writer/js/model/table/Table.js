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
    "dojo/has",
    "dojo/_base/lang",
    "dojo/_base/declare",
    "dojo/_base/array",
    "writer/model/table/Cell",
    "writer/common/Container",
    "writer/common/tools",
    "writer/constants",
    "writer/filter/JsonToHtml",
    "writer/model/prop/TableProperty",
    "writer/model/table/Row",
    "writer/model/table/TableBase",
    "writer/msg/msgCenter",
    "writer/msg/msgHelper",
    "writer/util/ModelTools",
    "writer/util/TableTools",
    "writer/util/ViewTools",
    "writer/util/TableMatrix",
    "writer/track/trackChange",
    "writer/global"
], function(has, lang, declare, array, Cell, Container, tools, constants, JsonToHtml, TableProperty, Row, TableBase, msgCenter, msgHelper, ModelTools, TableTools, ViewTools, TableMatrix, trackChange, g) {

    var Table =  declare("writer.model.table.Table", null, {
    	constructor: function(json, doc) {
	        this.parent = doc;
	        this.doc = doc;
	        this.task = "";
	        this.init(json);
    	}
    });
    Table.prototype = {
        modelType: constants.MODELTYPE.TABLE,
        init: function(json) {
            this.id = json.id;
            this.ch = json.ch;

            this.task = (json && json.taskId) || "";
            this.container = this.rows = new Container(this);
            this.cols = [];
            this._initTableCol(json);
            this._initTableProperty(json.tblPr);
            this._createRows(json.trs);
            this._initCellRowSpan();
	    	this.showDel = false;//trackChange.isShow("del");
        },
        
        setCh: function(value) {
        	// FIXME: improve perfermance
            var before = this.isTrackDeleted(this.ch);
            this.ch = value || [];
            var after = this.isTrackDeleted(this.ch);

            if(!before && after) {
            	this.deleted = true;
                this.triggerTrackInfoUpdate();
                this.resetView(true);
                this.markDirty();
                var next = this.next();
                if (next && next.buildGroup) {
                    next.buildGroup();
                }
            } else if (before && !after){
            	delete this.deleted;
            	if(!(this.parent && this.parent.isTrackBlockGroup)) {
	                this.triggerTrackInfoUpdate();
	                this.resetView(true);
	                this.markDirty();
				}
            }
        },
        /**
         * Get the table length
         * Use this function for select after table
         * @returns
         */
        getLength: function() {
            return 1;
        },
        _initTableProperty: function(json) {
            this.tableProperty = new TableProperty(json, this);
            this.tableStyleId = json.styleId;
            if (this.tableStyleId) {
                var refStyle = pe.lotusEditor.getRefStyle(this.tableStyleId);
                refStyle && refStyle.addReferer(this);
                if (refStyle) {
                    if (refStyle.isTableStyle) {
                        this.tableProperty.tableStyle = refStyle;
                    } else {
                        console.info("the refered Style is not a table Style!");
                    }

                }
            }
            this.tableProperty.tblLook && this.initConditionStyle(this.tableProperty.tblLook);
        },
        _createRows: function(trs) {
            for (var i = 0; i < trs.length; i++) {
                var tr = new Row(trs[i], this);
                tr && this.rows.append(tr);
            }
        },
        _initTableCol: function(json) {
            var colsj = json.tblGrid;
            for (var i = 0; i < colsj.length; i++) {
                this.cols.push(Math.round(tools.toPxValue(colsj[i].w)));
            }
        },
        _initCellRowSpan: function() {
            var rowCount = this.getTableMatrix().length();
            var row = this.rows.getFirst();
            while (row) {
				if(row.visible){
	                var cell = row.cells.getFirst();
	                while (cell) {
	                    var next = row.cells.next(cell);
	                    if (cell.isMergedCell()) {
	                        this.getTableMatrix().mergeVerticalCell(row, cell);
	                        row.cells.remove(cell);
	                    }
	                    cell = next;
	                }
				}
                row = this.rows.next(row);
            }
            this.getTableMatrix();

        },
        insertColumnW: function(idx, cnt) {
            if (cnt == null || cnt < 1) {
                cnt = 1;
            }
            var total = 0;
            for (var i = 0; i < this.cols.length; i++) {
                total += this.cols[i];
            }
            var ratio = total / (total + this.cols[idx] * cnt);
            var temp = 0;
            for (var i = 0; i < this.cols.length; i++) {
                this.cols[i] = this.cols[i] * ratio;
                temp += this.cols[i];
            }
            for (var i = 0; i < cnt; i++) {
                this.cols.splice(idx, 0, (total - temp) / cnt);
            }

        },
        deleteColumnW: function(idx, cnt) {
            if (cnt == null || cnt < 1) {
                cnt = 1;
            }
            // var total = 0;
            //		for(var i=0;i<this.cols.length;i++){
            //			total+=this.cols[i];
            //		}
            //		var ratio = total/(total-this.cols[idx]);
            for (var i = 0; i < cnt; i++) {
                this.cols.splice(idx, 1);
            }

            //		for(var i=0;i<this.cols.length;i++){
            //			this.cols[i] = this.cols[i]*ratio;
            //		}
        },
        mergeColumnW: function(idx, cnt) {
            for (var i = 1; i < cnt; i++) {
                this.cols[idx] += this.cols[idx + 1];
                this.cols.splice(idx + 1, 1);
            }
        },
        splitColumn: function(idx, nums) {
            var colW = this.cols[idx];
            this.cols[idx] = colW / nums;
            for (var i = 1; i < nums; i++) {
                this.cols.splice(idx, 0, colW / nums);
            }

        },
        resizeColunm: function(idx, del) {
            if (idx < 0 || idx > this.cols.length - 1) {
                return;
            }
            if (this.cols[idx] + del < 10) {
                return;
            }
            this.cols[idx] = this.cols[idx] + del;
        },
        scaleColumn: function(delW) {
            var colLen = this.cols.length;
            var delWPerCol = delW / colLen;
            for (var i = 0; i < this.cols.length; i++) {
                if (this.cols[i] + delWPerCol >= 20) {
                    this.cols[i] += delWPerCol;
                    delW -= delWPerCol;
                } else {
                    var tmpDelW = 20 - this.cols[i];
                    this.cols[i] = 20;
                    delW -= tmpDelW;
                    if (colLen - 1 - i > 0) {
                        delWPerCol = delW / (colLen - 1 - i);
                    }
                }
            }
        },
        changeCols: function(cols) {
            var widthChange = false;
            if (this.cols.length != cols.length) {
                this.cols = [];
                for (var i = 0; i < cols.length; i++) {
                    this.cols[i] = Math.round(tools.toPxValue(cols[i].w));
                }
                widthChange = true;
            } else {
                for (var i = 0; i < this.cols.length; i++) {
                    if (this.cols[i] != cols[i]) {
                        this.cols[i] = Math.round(tools.toPxValue(cols[i].w));
                        widthChange = true;
                    }
                }
            }
            if (widthChange) {
                this.markWidthChange();
                this.update();
            }
        },
        getAligin: function() {
            var align = this.tableProperty.getAlignment();
            if (this.tableProperty.getDirection(true) == "rtl") {
                if (align == "right")
                    align = "left";
                else if (align == "left" || !align)
                    align = "right";
            }
            return align;
        },
        getIndent: function() {
            var ind = this.tableProperty.getIndent();
            if (!ind) {
                ind = 0;
            }
            return ind;
        },
        markFlipTable: function() {
        	this.rows.forEach(function(row) {
        		var cell = row.container.getFirst();
        		while (cell) {
        			cell.markCheckBorder && cell.markCheckBorder(true);
        			cell = cell.next();
        		}
        		var allViews = row.getAllViews();
        		for (var ownerId in allViews) {
        			var viewers = allViews[ownerId];
        			var rowView = viewers.getFirst();
        			while (rowView) {
        				rowView.widthChange();
        				var cellView = rowView.cells.getFirst();
        				while (cellView) {
        					cellView.relayout();
        					cellView.markDirtyDOM();
        					cellView = rowView.cells.next(cellView);
        				}
        				rowView = viewers.next(rowView);
        			}
        		}
        	});
        	this.update();
        },

        markWidthChange: function(colIdxs) {
            this.rows.forEach(function(row) {
                row.markWidthChange(colIdxs);
            });
        },
        getMinScaleWidth: function() {
            var colLen = this.cols.length;
            return colLen * 20;
        },
        getMinScaleHeight: function() {
            var rowLen = this.getTableMatrix().length();
            return rowLen * 20;
        },
        setCols: function(cols) {
            var oldCols = this.cols;
            this.cols = cols;
            delete oldCols;
        },
        getColumnCount: function() {
            return this.cols.length;
        },
        getProperty: function() {
            return this.tableProperty;
        },
        getDefaultStyle: function() {
            return this.tableProperty.tableStyle();
        },
        getColumnWidth: function(i) {
            return this.cols[i];
        },
 		getTableMatrix:function(isEntire){
 			var showDel = false;//(trackChange.isShow("del")
			if(isEntire)
			{
				if(!this._tableMatrix || this._tableStructChange)
					this.getTableMatrix(false);

				return this._entireTableMatrix;
			}
			else
			{
				if(!this._tableMatrix || this._tableStructChange)
				{
					this.refreshRowsIndex();
					if(this.isEntireTable && this.table._tableMatrix && (showDel || !this.table.hasDelInTrackRows() ))
						return this.createCopyOfEntire();

					this._tableMatrix = new TableMatrix(this);
					var cloneFrom = (showDel || !this.hasDelInTrackRows())? this._tableMatrix : null;
					this._entireTableMatrix = new TableMatrix(this, "all", cloneFrom);
					delete this._tableStructChange;
				}
			}
			return this._tableMatrix;
 		},
        isMatrixReady: function() {
            return this._tableMatrix && !this._tableStructChange;
        },
        changeTable: function() {
            this._tableStructChange = true;
			this._tableMatrix = null;
			this._entireTableMatrix = null;
            var allViews = this.getAllViews();
            for (var ownerId in allViews) {
                var viewers = allViews[ownerId];
                var firstView = viewers.getFirst();
                while (firstView) {
                    firstView.changeTable();
                    firstView = viewers.next(firstView);
                }
            }
        },
        getTaskId: function() {
            return this.task;
        },
        isTask: function() {
            if (this.getTaskId() == "")
                return false;
            else
                return true;
        },
        /**
         * Set task to para 
         * @param task_id
         * @returns The message
         */
        setTask: function(task_id) {
            var act = msgCenter.createSetParaTaskAct(constants.ACTTYPE.SetTableTask, task_id == "" ? false : true, this.id, task_id == "" ? this.task : task_id);
            var msg = msgCenter.createMsg(constants.MSGTYPE.Attribute, [act]);
            this.task = task_id;
            this.markDirty();
            return msg;
        },
        getBorder: function() {
        	if(!this._mergedBorder) {
                var tableProperty = this.getProperty();
                var border = lang.clone(tableProperty.getBorder());
                if (tableProperty.tableStyle) {
                    var styleBorder = tableProperty.tableStyle.getBorder();
                    border.left = border.left || lang.clone(styleBorder.left);
                    border.right = border.right || lang.clone(styleBorder.right);
                    border.top = border.top || lang.clone(styleBorder.top);
                    border.bottom = border.bottom || lang.clone(styleBorder.bottom);
                }
                this._mergedBorder = border;
        	}
            return this._mergedBorder;
        },
        getMergedTextProperty: function() {
            if (!this.mergedTextProperty) {
                var property = this.getProperty();
                if (!property) {
                    this.mergedTextProperty = "empty";
                    return "empty";
                }
                this.mergedTextProperty = property.getMergedTextProperty();
                var parentTextProp = this.parent && this.parent.getMergedTextProperty();
                if (parentTextProp && parentTextProp != "empty") {
                    if (this.mergedTextProperty == "empty")
                        this.mergedTextProperty = parentTextProp.clone();
                    else
                        this.mergedTextProperty = parentTextProp.merge(this.mergedTextProperty);
                }
            }
            return this.mergedTextProperty;
        },
        clearStyle: function(value) {
            if (value) {
                this._noRecordStyle = true;
            } else {
                delete this._noRecordStyle;
            }
        },
        /**
         * 
         * @param startRow Start Row
         * @param endRow End Row
         * @param startCol Start column
         * @param endCol End column
         * @returns {___anonymous6494_6495}
         */
        toJson: function(startRow, endRow, startCol, endCol) {
            startRow = parseInt(startRow) || 0;
            startCol = parseInt(startCol) || 0;
            endRow = parseInt(endRow);
            endCol = parseInt(endCol);
            if (isNaN(endRow)) {
                endRow = (this.rows.length() - 1);
            }
            if (isNaN(endCol)) {
                endCol = this.cols.length;;
            }
            var result = {};
            result.t = "tbl";
            result.tblPr = this.tableProperty && this.tableProperty.toJson();
            if (this.task != "")
                result.taskId = this.task;
            if (this.tableStyleId) {
                if (!result.tblPr) result.tblPr = {};
                result.tblPr.styleId = this.tableStyleId; // TODO for copy/paste, copy style content.
            }
            if (!result.tblPr) {
                delete result.tblPr;
            }
            if (this._noRecordStyle && result.tblPr) {
                delete result.tblPr.tblBorders;
                delete result.tblPr.tblCellSpacing;
                delete result.tblPr.shd;
                delete result.tblPr.align;

            }
            result.id = this.id;
            if (this.ch && !tools.isEmpty(this.ch))
                result.ch = this.ch;

            result.tblGrid = [];
            for (var i = startCol; i < endCol; i++) {
                result.tblGrid.push({
                    "t": "gridCol",
                    "w": tools.PxToPt(this.cols[i]) + "pt"
                });
            }
            result.trs = [];
            var row = this.rows.getFirst();
            var i = 0;
            while (row) {
                if (i >= startRow)
                    result.trs.push(row.toJson(startCol, endCol, i == startRow));
                i++;
                if (i > endRow)
                    break;

                row = this.rows.next(row);
            }
            return result;
        },
        getStyleId: function() {
            this.tableProperty.styleId;
        },
        resizeView: function() {
            var allViews = this.getAllViews();
            for (var ownerId in allViews) {
                var viewers = allViews[ownerId];
                var firstView = viewers.getFirst();
                firstView.updateSelf();
                var next = viewers.next(firstView);
                while (next) {
                    var tmpNext = viewers.next(next);
                    next.deleteSel();
                    firstView.merge(next);
                    next = tmpNext;
                }
            }
        },
        setStyleFormat: function(firstRow, lastRow, firstColumn, lastColumn, noHBand, noVBand) {
            var tblProperty = this.getProperty();
            if (!tblProperty) {
                return;
            }
            var conditionStyle = tblProperty.conditionStyle;
            if (!conditionStyle) {
                tblProperty.conditionStyle = {};
                conditionStyle = tblProperty.conditionStyle;
            }
            if (firstRow == 1 || firstRow == 0) {
                conditionStyle.firstRow = firstRow;
            }
            if (lastRow == 1 || lastRow == 0) {
                conditionStyle.lastRow = lastRow;
            }
            if (firstColumn == 1 || firstColumn == 0) {
                conditionStyle.firstColumn = firstColumn;
            }
            if (lastColumn == 1 || lastColumn == 0) {
                conditionStyle.lastColumn = lastColumn;
            }
            if (noHBand == 1 || noHBand == 0) {
                conditionStyle.noHBand = noHBand;
            }
            if (noVBand == 0 || noVBand == 1) {
                conditionStyle.noVBand = noVBand;
            }
        },
        updateConditonStyle: function(type) {
            var acts = [];
            var tblProperty = this.getProperty();
            if (!tblProperty) {
                return;
            }
            var conditionStyle = tblProperty.getConditionStyle();
            var firstRowStyle = tblProperty.checkStyle("firstRow") ? "firstRow" : null;
            firstRowStyle = (conditionStyle.firstRow == 1 && firstRowStyle);

            var lastRowStyle = tblProperty.checkStyle("lastRow") ? "lastRow" : null;
            lastRowStyle = (conditionStyle.lastRow == 1 && lastRowStyle);

            var isFirstColumn = (conditionStyle.firstColumn == 1 && tblProperty.checkStyle("firstColumn"));
            var isLastColumn = (conditionStyle.lastColumn == 1 && tblProperty.checkStyle("lastColumn"));

            var evenRowStyle = tblProperty.checkStyle("evenHBand") ? "evenHBand" : null;
            var oddRowStyle = tblProperty.checkStyle("oddHBand") ? "oddHBand" : null;
            var isHBand = (conditionStyle.noHBand == 0 && (evenRowStyle || oddRowStyle));
            if (!isHBand) {
                evenRowStyle = null;
                oddRowStyle = null;
            }

            var evenColStyle = tblProperty.checkStyle("evenVBand") ? "evenVBand" : null;
            var oddColStyle = tblProperty.checkStyle("oddVBand") ? "oddVBand" : null;
            var isVBand = (conditionStyle.noVBand == 0 && (evenColStyle || oddColStyle));
            if (!isVBand) {
                evenColStyle = null;
                oddColStyle = null;
            }
            var nwCellStyle = tblProperty.checkStyle("firstRowFirstColumn") && firstRowStyle && isFirstColumn ? "firstRowFirstColumn" : null;
            var swCellStyle = tblProperty.checkStyle("lastRowFirstColumn") && lastRowStyle && isFirstColumn ? "lastRowFirstColumn" : null;
            var neCellStyle = tblProperty.checkStyle("firstRowLastColumn") && firstRowStyle && isLastColumn ? "firstRowLastColumn" : null;
            var seCellStyle = tblProperty.checkStyle("lastRowLastColumn") && lastRowStyle && isLastColumn ? "lastRowLastColumn" : null;


            var changeCell = type != "row" && (isFirstColumn || isLastColumn || isVBand) || (nwCellStyle || swCellStyle || neCellStyle || seCellStyle);
            var firstRow = this.rows.getFirst();
            var lastRow = null;
            var nextRow = firstRow;
            var i = 1;
            //		if(firstRowStyle){
            if (changeCell) {
                var nActs = firstRow.changeCSSStyle(firstRowStyle, isFirstColumn, isLastColumn, isVBand, true);
                acts = acts.concat(nActs);
                firstRow = this.rows.next(firstRow);
            } else {
                do {
                    var nActs = firstRow.changeCSSStyle(firstRowStyle);
                    acts = acts.concat(nActs);
                    firstRow = this.rows.next(firstRow);
                } while (firstRow && firstRow.isTblHeaderRepeat() == true)
            }
            if (firstRowStyle) {
                nextRow = firstRow;
            }
            //		}
            //		if(lastRowStyle){
            lastRow = this.rows.getLast();
            if (changeCell) {
                var nActs = lastRow.changeCSSStyle(lastRowStyle, isFirstColumn, isLastColumn, isVBand, true);
                acts = acts.concat(nActs);
            } else {
                var nActs = lastRow.changeCSSStyle(lastRowStyle);
                acts = acts.concat(nActs);
            }
            //		}
            //		if(isHBand){
            while (nextRow && (nextRow != lastRow || !lastRowStyle)) {
                if (i % 2 == 0) {
                    if (changeCell) {
                        var nActs = nextRow.changeCSSStyle(evenRowStyle, isFirstColumn, isLastColumn, isVBand);
                        acts = acts.concat(nActs);
                    } else {
                        var nActs = nextRow.changeCSSStyle(evenRowStyle);
                        acts = acts.concat(nActs);
                    }
                } else {
                    if (changeCell) {
                        var nActs = nextRow.changeCSSStyle(oddRowStyle, isFirstColumn, isLastColumn, isVBand);
                        acts = acts.concat(nActs);
                    } else {
                        var nActs = nextRow.changeCSSStyle(oddRowStyle);
                        acts = acts.concat(nActs);
                    }
                }
                nextRow = this.rows.next(nextRow);
                i++;
            }
            //		}

            // for the four cells at the four corners of the table;
            var tbMatrix = this.getTableMatrix();
            var rowCnt = tbMatrix.length();
            var colCnt = tbMatrix.length2();

            var _changeCornerCSSStyle = function(cell, cellStyle) {
                if (!cell) {
                    return;
                }
                var cCnStOld = cell.getProperty().getConditionStyle();
                if (cell.changeCornerCSSStyle(cellStyle)) {
                    var cCnStNew = cell.getProperty().getConditionStyle();
                    var cStO = {
                            type: 'cnSt',
                            v: cCnStOld
                        },
                        cStN = {
                            type: 'cnSt',
                            v: cCnStNew
                        };
                    acts.push(msgCenter.createSetAttributeAct(cell, cStN, cStO, null, null));
                }
            };

            if (nwCellStyle) {
                var nwCell = tbMatrix.getCell(0, 0);
                _changeCornerCSSStyle(nwCell, nwCellStyle);
            }
            if (swCellStyle) {
                var swCell = tbMatrix.getCell(rowCnt - 1, 0);
                _changeCornerCSSStyle(swCell, swCellStyle);
            }
            if (neCellStyle) {
                var neCell = tbMatrix.getCell(0, colCnt - 1);
                _changeCornerCSSStyle(neCell, neCellStyle);
            }
            if (seCellStyle) {
                var seCell = tbMatrix.getCell(rowCnt - 1, colCnt - 1);
                _changeCornerCSSStyle(seCell, seCellStyle);
            }
            return acts;
        },
        isCrossPages: function() {
            var allViews = this.getAllViews();
            for (var ownerId in allViews) {
                var viewers = allViews[ownerId];
                if (viewers.length() > 1) {
                    return true;
                }
            }
            return false;

        },
        inTheSameBody: function(row1, row2) {
            if (row1 == row2) {
                return true;
            }
            var body1 = null;
            var body2 = null;
            var allViewrs = row1.getAllViews();
            if (allViewrs) {
                for (var ownerid in allViewrs) {
                    var rowView = allViewrs[ownerid].getFirst();
                    body1 = ViewTools.getBody(rowView);
                    break;
                }
            }
            allViewrs = row2.getAllViews();
            if (allViewrs) {
                for (var ownerid in allViewrs) {
                    var rowView = allViewrs[ownerid].getFirst();
                    body2 = ViewTools.getBody(rowView);
                    break;
                }
            }
            return body1 == body2;
        },
        insertRow: function(newRow, targetRow, fixCells) {
            var toReset = false;
            var forceReset = false;
            var visibleRows = this.getVisibleRows();
            if(visibleRows && visibleRows.length() == 0)
            	forceReset = true;

			var tableMatrix = this.getTableMatrix(true);
            var nextRow = this.rows.getFirst();
            if (targetRow) {
                nextRow = this.rows.next(targetRow);
            }
            var cells = targetRow && tableMatrix.getRowMatrix(targetRow);
            var nextCells = nextRow && tableMatrix.getRowMatrix(nextRow);
            var idx = 0;
            var newCell = newRow.cells.getFirst();
            while (newCell) {
                if (newCell.isMergedCell()) {
                    cells[idx].markRowSpanChanged(1);
                    toReset = true;
                } else if (fixCells && fixCells[idx]) {
                    var toRemove = nextCells[idx];
                    var rowSpan = toRemove.getRowSpan();
                    nextRow.remove(toRemove);
                    newCell.changeRowSpan(rowSpan);
                    toReset = true;
                }
                idx = idx + newCell.getColSpan();
                newCell = newRow.cells.next(newCell);
            }
            newRow.clearMergedCell();
            this.insertBefore(newRow, nextRow);
            if (forceReset || (toReset && this.isCrossPages())) {
                this.resetView();
            }
            this.changeTable();
            this.getTableMatrix();
            if (!this.isAllViewReseted()) {
                targetRow && targetRow.checkRowBorder();
                nextRow && nextRow.checkRowBorder();
            }
        },
        isAllViewReseted: function () {
            var allViews = this.getAllViews();
            for (var ownerId in allViews) {
                var viewers = allViews[ownerId];
                var firstView = viewers.getFirst();
                while (firstView) {
                    if(!firstView.isReseted())
                        return false;
                    firstView = viewers.next(firstView);
                }
            }
            return true;
        },
        deleteRow: function(row, fixCells, mustResetForCrossPage) {
            var toReset = mustResetForCrossPage;
			var tableMatrix = this.getTableMatrix(true);
            var cells = tableMatrix.getRowMatrix(row);
            var nextRow = this.rows.next(row);
            var prevRow = this.rows.prev(row);
            for (var i = 0; i < cells.length; i++) {
                if (cells[i] == cells[i - 1]) {
                    continue;
                }
                if (!row.cells.contains(cells[i])) {
                    cells[i].markRowSpanChanged(-1);
                    toReset = true;
                } else if (fixCells && fixCells[i]) {
                    var newCell = new Cell(fixCells[i], nextRow, this);
                    newCell.setRowSpan(cells[i].getRowSpan() - 1);
                    cells[i].setRowSpan(1);

                    var targetCell = nextRow.cells.getFirst();
                    while (targetCell) {
                        if (targetCell.getColIdx() > i) {
                            break;
                        }
                        targetCell = nextRow.cells.next(targetCell);
                    }
                    if (targetCell) {
                        nextRow.insertBefore(newCell, targetCell);
                    } else {
                        targetCell = nextRow.cells.getLast();
                        nextRow.insertAfter(newCell, targetCell);
                    }
                    toReset = true;
                }
            }
            this.remove(row);
            if (toReset && this.isCrossPages()) {
                this.resetView();
            }
            this.changeTable();
            this.getTableMatrix();
            if (!this.isAllViewReseted()) {
                prevRow && prevRow.checkRowBorder();
                nextRow && nextRow.checkRowBorder();
            }
        },
        insertColumn: function(index, cells, fixCells) {
            var toReset = false;
			var tableMatrix = this.getTableMatrix(true);
            var currentRow = this.rows.getFirst();
            var prevInsertCell = null;
            while (currentRow) {
                var rowIdx = currentRow.getRowIdx();
                var currentCells = tableMatrix.getRowMatrix(currentRow);
                var cellJson = cells[rowIdx];
                var targetCell = currentCells[index];
                if (cellJson.hMerged) {
                    var preCell = currentCells[index - 1];
                    if (currentRow.cells.contains(preCell)) {
                        if (preCell) {
                            preCell.markColSpanChanged(1);
                        } else {
                            console.error("the column data is incorrect");
                        }
                        toReset = true;
                    }
                } else if (cellJson.vMerged) {
                    if (prevInsertCell) {
                        //					prevInsertCell.setMergedStart();
                        prevInsertCell.markRowSpanChanged(1);
                    } else {
                        console.error("the data format is incorrect!");
                    }
                    toReset = true;
                } else if (cellJson.cnt) {
                    var newCell = new Cell(cellJson.cnt, currentRow, this);
                    prevInsertCell = newCell;
                    var toMoveCell = null;
                    if (fixCells && fixCells[rowIdx]) {
                        var colSpan = targetCell.getColSpan();
                        newCell.setColSpan(1 + colSpan);
                        toMoveCell = targetCell;
                        toReset = true;
                    }
                    if (!currentRow.cells.contains(targetCell)) {
                        var i = 1;
                        while (targetCell && !currentRow.cells.contains(targetCell)) {
                            targetCell = currentCells[index + i];
                            i++;
                        }
                    }
                    currentRow.insertBefore(newCell, targetCell);
                    toMoveCell && currentRow.remove(toMoveCell);
                }
                currentRow = this.rows.next(currentRow);
            }
            if (this.isCrossPages()) {
                this.resetView();
            }
            this.changeTable();
            this.getTableMatrix();
            if (!this.isAllViewReseted()) {
                this.checkColumnBorder(index - 1);
                this.checkColumnBorder(index + 1);
            }
            
        },
        deleteColumn: function(index, cells, fixCells) {
            var toReset = false;
			var tableMatrix = this.getTableMatrix(true);
            var currentRow = this.rows.getFirst();
            while (currentRow) {
                var rowIdx = currentRow.getRowIdx();
                var currentCells = tableMatrix.getRowMatrix(currentRow);
                var cellJson = cells[rowIdx];
                var targetCell = currentCells[index];
                if (cellJson.hMerged) {
                    var preCell = currentCells[index - 1];
                    if (currentRow.cells.contains(preCell)) {
                        if (preCell) {
                            preCell.markColSpanChanged(-1);
                        } else {
                            console.error("the column data is incorrect");
                        }
                        toReset = true;
                    }
                } else if (cellJson.vMerged) {

                } else if (cellJson.cnt) {
                    var toInsertCell = null;
                    if (fixCells && fixCells[rowIdx]) {
                        toInsertCell = new Cell(fixCells[rowIdx], currentRow, this);
                        toInsertCell.setRowSpan(targetCell.getRowSpan());
                        //					if(toInsertCell.getRowSpan()>1){
                        //						toInsertCell.setMergedStart();
                        //					}
                        toReset = true;
                    }
                    toInsertCell && currentRow.insertBefore(toInsertCell, targetCell);
                    currentRow.remove(targetCell);
                }
                currentRow = this.rows.next(currentRow);
            }
            if (toReset && this.isCrossPages()) {
                this.resetView();
            }
            this.changeTable();
            this.getTableMatrix();
            if (!this.isAllViewReseted()) {
                this.checkColumnBorder(index - 1);
                this.checkColumnBorder(index);
            }
        },

        mergeCell: function(startColIdx, startRowIdx, newRowSpan, newColSpan) {
            var tableMatrix = this.getTableMatrix(true);
            var targetCell = tableMatrix.getCell(startRowIdx, startColIdx);
            var oldRowSpan = targetCell.getRowSpan(),
                oldColSpan = targetCell.getColSpan();
            targetCell.setColSpan(newColSpan);
            var endColIdx = startColIdx + newColSpan;
            var endRowIdx = startRowIdx + newRowSpan;
            var currentRow = targetCell.parent;
            var toDeleteRow = [];
            for (var i = startRowIdx; i < endRowIdx; i++) {
                if (!currentRow) {
                    console.error("something error,please check!");
                    break;
                }

                var currentCells = tableMatrix.getRowMatrix(currentRow);
                for (var j = startColIdx; j < endColIdx; j++) {
                    if (currentCells[j] == currentCells[j - 1]) {
                        continue;
                    }
                    if (currentRow.cells.contains(currentCells[j]) && targetCell != currentCells[j]) {
                        currentRow.remove(currentCells[j]);
                    }
                }
                var next = this.rows.next(currentRow);
                if (currentRow.cells.isEmpty()) {
                    toDeleteRow.push(currentRow);
                }
                currentRow = next;
            }
            targetCell.setRowSpan(newRowSpan);       
            var toReset = false;
            if (this.isCrossPages()) {
                currentRow = targetCell.parent;
                var firstRow = currentRow;
                for (var i = 0; i < newRowSpan; i++) {
                    if (currentRow.isCrossPage()) {
                        toReset = true;
                        break;
                    } else if (!this.inTheSameBody(firstRow, currentRow)) {
                        toReset = true;
                        break;
                    }
                    currentRow = this.rows.next(currentRow);
                }
            }
            if (toReset) {
                this.resetView();
            } else {
                targetCell.resetView();
            }
            this.changeTable();
            this.getTableMatrix();
            return toDeleteRow;
        },
        splitCell: function(startColIdx, startRowIdx, newRowSpan, newColSpan, changedCells) {
			var tableMatrix = this.getTableMatrix(true);
            var targetCell = tableMatrix.getCell(startRowIdx, startColIdx);
            var oldRowSpan = targetCell.getRowSpan(),
                oldColSpan = targetCell.getColSpan();
            targetCell.setRowSpan(newRowSpan);
            targetCell.setColSpan(newColSpan);
            var currentRow = targetCell.parent;
            var subTable = this._createSubTable(changedCells);
            var subTableMatrix = subTable.getTableMatrix().getArrayMatrix();
            var firstSubRow = subTable.rows.getFirst();
            var firstSubCell = subTableMatrix[0][0];
            var tmpCell = targetCell;
            firstSubRow.cells.forEach(function(cell) {
                if (cell == firstSubCell) {
                    return;
                }
                currentRow.insertAfter(cell, tmpCell);
                cell.table = currentRow.parent;
                tmpCell = cell;
            });

            for (var j = 1; j < subTable.rows.length(); j++) {
                currentRow = this.rows.next(currentRow);
                firstSubRow = subTable.rows.next(firstSubRow);
                var k = 1;
                var insertBeforePosCell = tableMatrix.getCell(startRowIdx + j, startColIdx + subTableMatrix[0].length);
                while (insertBeforePosCell && !currentRow.cells.contains(insertBeforePosCell)) {
                    insertBeforePosCell = tableMatrix.getCell(startRowIdx + j, startColIdx + subTableMatrix[0].length + k);
                    k++;
                }
                firstSubRow.cells.forEach(function(cell) {
                    currentRow.insertBefore(cell, insertBeforePosCell);
                    cell.table = currentRow.parent;
                });
            }
            var toReset = false;
            if (this.isCrossPages()) {
                currentRow = targetCell.parent;
                var firstRow = currentRow;
                for (var i = 0; i < oldRowSpan; i++) {
                    if (currentRow.isCrossPage()) {
                        toReset = true;
                        break;
                    } else if (!this.inTheSameBody(firstRow, currentRow)) {
                        toReset = true;
                        break;
                    }
                    currentRow = this.rows.next(currentRow);
                }
            }
            if (toReset) {
                this.resetView();
            } else {
                targetCell.resetView();
            }
            this.changeTable();
            tableMatrix = this.getTableMatrix();
            // mark checkborder
            var checkRowSpan = Math.max(oldRowSpan, newRowSpan);
            var checkColSpan = Math.max(oldColSpan, newColSpan);
            for (var i = 0; i < checkColSpan; i++) {
                if (startRowIdx > 0) {
                    var topCell = tableMatrix.getCell(startRowIdx - 1, startColIdx + i);
                    if (topCell)
                        topCell.markCheckBorder();
                }
                if (startRowIdx < tableMatrix.length() - checkRowSpan) {
                    var bottomCell = tableMatrix.getCell(startRowIdx + checkRowSpan, startColIdx + i);
                    if (bottomCell)
                        bottomCell.markCheckBorder();
                }
            }
            for (var j = 0; j < checkRowSpan; j++) {
                if (startColIdx > 0) {
                    var leftCell = tableMatrix.getCell(startRowIdx + j, startColIdx - 1);
                    if (leftCell)
                        leftCell.markCheckBorder();
                }
                if (startColIdx < tableMatrix.length2() - checkColSpan) {
                    var rightCell = tableMatrix.getCell(startRowIdx + j, startColIdx + checkColSpan);
                    if (rightCell)
                        rightCell.markCheckBorder();
                }
            }
        },
        createEmptyRow: function(targetRow) {
            var json = {};
            json.id = msgHelper.getUUID();
            var trPr = null;
            if (targetRow.rowProperty) {
                trPr = targetRow.rowProperty.toJson();
            }
            json.trPr = trPr;
            json.tcs = [];
            return json;
        },
        _createSubTable: function(subCells) {
            var result = {};
            result.t = "tbl";
            result.tblPr = this.tableProperty && this.tableProperty.toJson() || {};
            if (this.tableStyleId) {
                result.tblPr.styleId = this.tableStyleId;
            }
            result.id = this.id;
            result.tblGrid = [];
            result.trs = [];
            for (var i = 0; i < subCells.length; i++) {
                var rowjson = {};
                rowjson.tcs = subCells[i];
                result.trs.push(rowjson);
            }
            return new Table(result, this.parent);
        },
        getItemByIndex: function(index) {
            return this.rows.getByIndex(index);
        },
        checkColumnBorder: function(colIdx) {
            var tableMatrix = this.getTableMatrix();
            if (colIdx >= 0 && colIdx < tableMatrix.length2()) {
                var cells = tableMatrix.getColumn(colIdx);
                for (var i = 0; i < cells.length; i++) {
                    cells[i].markCheckBorder();
                }

            }
        },
        isVisibleInTrack: function(){
        	var isDelShow = this.showDel; //trackChange.isShow("del")
            if (isDelShow)
                return true;
            else
            {
                var allDeleted = this.isAllDeletedInTrack();
                if (allDeleted)
                    return false;
            }
            return true;
        },
        getTrackedGroupItems: function(prev, next, startTime, endTime, withSiblingTrackedParas) {
        	var objs = [this];
        	if(withSiblingTrackedParas)
        	{
        		if(this.deleted && !this.isTrackDeleted())
        		{
        			 var prevObj = this.prevObj;
                     if (!prevObj || !ModelTools.isTrackableParaOrTable(prevObj))
                    	 prevObj = ModelTools.getPrev(this, ModelTools.isTrackableParaOrTable);
                     if (prevObj && prevObj.parent == this.parent)
                     {
                         if (ModelTools.isTable(prevObj))
                     	    return prevObj.getTrackedGroupItems(true, true, startTime, endTime, withSiblingTrackedParas);
                         else
                        	return prevObj.getTrackedGroupParas(true, true, startTime, endTime);
                     }
        		}
        		else
        		{
	        		if(prev) {
	                    var prevParas = this._getTrackedPrevObjs(startTime, endTime);
	                    if (prevParas)
	                    	Array.prototype.unshift.apply(objs, prevParas);
	        		}
	
	        		if(next) {
	                    var nextParas = this._getTrackedNextObjs(startTime, endTime);
	                    if (nextParas)
	                    	 objs = objs.concat(nextParas);			
	        		}
        		}
        	}

        	return objs;
        },
        _getTrackedPrevObjs: function(startTime, endTime) {
			var prevObj = ModelTools.getPrev(this, ModelTools.isTrackableParaOrTable);
			if (prevObj && prevObj.parent == this.parent)
			{
                if (ModelTools.isTable(prevObj))
            	    return false;
                else
                	return prevObj.getTrackedGroupParas(true, false, startTime, endTime);
			}
			return false;
        },
        _getTrackedNextObjs: function(startTime, endTime) {
			var nextObj = ModelTools.getNext(this, ModelTools.isTrackableParaOrTable);
			if (nextObj && nextObj.parent == this.parent)
			{
                if (ModelTools.isTable(nextObj))
            	    return false;
                else
                	return nextObj.getTrackedGroupParas(false, true, startTime, endTime);
			}
			return false;
        },

        deleteInTrack: function() {
            if (!has("trackGroup"))
                return true;
            var msgs = [];

            if (this.isAllInsByMe()) {
                this.triggerTrackInfoUpdate("delete");
                return true;
            }

			if(this.getAvailableRows().length == 0)//all the rows have been deleted before, do nothing
				return;

			msgs.push(this.addDelChangeInfo());
			this.triggerTrackInfoUpdate();

            this.resetView(true);
            return msgs;
        },
        isAllDeletedInTrack: function() {
            return this.isTrackDeleted(this.getCh());
        },
		getAvailableRows: function(){
			var ret = [];
            if (this.isAllDeletedInTrack())
                return ret;
			if(this.rows && this.rows.length()>0)
			{
				this.rows.forEach( function (row) {
					if(!(row.ch && row.isTrackDeleted(row.ch)))
						ret.push(row);
				});
			}
			return ret;
		},
		addDelChangeInfo: function(){
			if (!this.ch)
				this.ch = [];
			var oldChanges = dojo.clone(this.ch);
			if(this.isTrackDeleted(this.ch))
				this.ch.pop();
			var data = trackChange.createChange("del");
			this.ch.push(data);
			return msgCenter.createMsg(constants.MSGTYPE.Attribute,[msgCenter.createSetAttributeAct(this,null,null,{"type": "tblCh", "ch":this.ch}, {"type": "tblCh", "ch":oldChanges})] );
		},
		delDelChangeInfo: function(){
			if (!this.ch)
				return;
			var oldChanges = dojo.clone(this.ch);
			if(this.isTrackDeleted(this.ch))
				this.ch.pop();
			return msgCenter.createMsg(constants.MSGTYPE.Attribute,[msgCenter.createSetAttributeAct(this,null,null,{"type": "tblCh", "ch":this.ch}, {"type": "tblCh", "ch":oldChanges})] );			
		},
		hasDelInTrackRows: function(){
            if (this.isAllDeletedInTrack())
                return true;
			for(var i = 0; i< this.rows.length(); i++)
			{
				var row = this.rows.getByIndex(i);
				if (row.isTrackDeleted(row.ch))
					return true;
			}
			return false;
		},	
		hasInvisibleRows: function(){
			//TODO:check if there is invisible row
			return this.vRows && this.rows && (this.vRows.length()<this.rows.length());
		},
		getVisibleRows: function(forceUpdate){
			if(forceUpdate || !this.vRows)
			{
				var curContainer = this.subContainer = this.vRows = new Container(this);
				this.container.forEach(function(tr){
					if(tr.visible)
						curContainer.append(tr);
				});
			}
			return this.subContainer;
		},
		refreshContainer: function(){
			this._tableStructChange=true;
			this._tableMatrix = null;
			this._entireTableMatrix = null;	
			this.getTableMatrix();
		},
		refreshRowsIndex: function(){
			this.showDel = false;//trackChange.isShow("del");
			if(this.showDel)
			{
				this.container.forEach(function(tr, idx){
					tr._rowIdx = idx;
					tr.visible = true;
					delete tr._vRowIdx ;
				});
			}
			else
			{
				var rIdx = 0;
				this.container.forEach(function(tr, idx){
					tr._rowIdx = idx;
					if(tr.isVisibleInTrack())
					{
						tr._vRowIdx = rIdx;
						tr.visible = true;
						rIdx++;
					}
					else
					{
						tr._vRowIdx = rIdx;
						tr.visible = false;
					}
				});
			}		
		},
		updateRowToInvisible: function(row){
//			if(trackChange.isShow("del"))
//				return;
			row.visible = false;
			var idx = row._rowIdx;
			for(var i = idx; i<this.rows.length(); i++)
			{
				var ir = this.rows.getByIndex(i);
				ir._vRowIdx = ir._vRowIdx - 1;			
			}
		},
        toMarkdown: function() {
        	var jsonStr = this.toJson();
            var htmlStr = new JsonToHtml().toHtml([jsonStr]);
            return {"text": (htmlStr + "\n")};
        },
        toHtml: function() {
        	var html = "";
            var allViews = this.getAllViews();
            for (var ownerId in allViews) {
                var viewers = allViews[ownerId];
                var firstView = viewers.getFirst();
                if(firstView.getHtmlContent)
                	html += firstView.getHtmlContent();
            }
        	return html;
        }		
    };
    tools.extend(Table.prototype, new TableBase());

    return Table;
});
