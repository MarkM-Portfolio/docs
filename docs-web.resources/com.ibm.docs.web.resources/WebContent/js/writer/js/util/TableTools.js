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
    "writer/util/ModelTools",
    "writer/util/ViewTools",
    "writer/util/TableMatrix",
    "dojox/collections/Dictionary",
    "exports"
], function(array, lang, topic, Container, tools, constants, ModelTools, ViewTools, TableMatrix, Dictionary, exports) {

    var TableTools = {};

    TableTools.insertCell = function(newCell, row) {
        var cellIdx = newCell.getColIdx();
        if (!row.cells) {
            row.cells = new Container(row);
        }
        var tarCell = row.cells.select(function(cell) {
            if (cell.getColIdx() > cellIdx) {
                return true;
            } else {
                return false;
            }
        });
        if (tarCell) {
            row.cells.insertBefore(newCell, tarCell);
        } else {
            row.cells.append(newCell);
        }
        row.markDirtyDOM();
        newCell.parent = row;
    };
    /*
     * used the table Matrix to maintain the rowspan and colSpan.
     */

    TableTools.splitHCells = function(curRowMatrix, newRow) {
        var curRow = curRowMatrix[0].parent;
        var tarIdx = curRow.getRowIdx();
        var table = curRowMatrix[0].parent.parent;
        var newRowMatrix = [];
        newRow.cells.forEach(function(cell) {
            var cellIdx = cell.getColIdx();
            newRowMatrix[cellIdx] = cell;
        });
        for (var i = 0; i < curRowMatrix.length; i++) {
            if (!newRowMatrix[i] && curRowMatrix[i] != curRowMatrix[i - 1]) {
                var cell = curRowMatrix[i];
                cell.setRowSpan(cell.getRowSpan() + 1);
            }
        }
        var r = curRow;
        while (r) {
            r._rowIdx = tarIdx;
            tarIdx++;
            r = table.rows.next(r);
        }
    };
    //horizontal split the merged cell;
    TableTools.splitMergedCell = function(curCell, newCells) {
        var colIdx = curCell.getColIdx();
        var preCell = curCell;
        for (var i = 0; i < newCells.length; i++) {
            var newCell = newCells[i];
            var newCellIdx = newCell.parent.getRowIdx();
            var t = newCellIdx - preCell.parent.getRowIdx();
            newCell.setRowSpan(preCell.getRowSpan() - t);
            preCell.setRowSpan(t);
            preCell = newCell;
        };
    };
    // return the target cell for the move left/right/up/down keys.
    TableTools.moveLeft = function(currentCell) {
            //	delete this._vpreCell;
            var _viewTools = ViewTools;
            var currentRowIdx = this._currRIdx;
            var currentTable = _viewTools.getTable(currentCell);
            var tableMatrix = currentTable.getTableMatrix();
            if (this._currTbl != currentTable) {
                currentRowIdx = -1;
            }
            if (!currentRowIdx || currentRowIdx < 0) {
                currentRowIdx = currentCell.parent.getRowIdx();
                this._currTbl = currentTable;
                this._currRIdx = currentRowIdx;
            }
            if (currentRowIdx < 0 || currentRowIdx >= tableMatrix.length()) {
                delete this._currRIdx;
                delete this._currTbl;
                return null;
            }
            var nextCellColIdx = currentCell.getColIdx() - 1;
            if (nextCellColIdx < 0) {
                this._currRIdx--;
                if (this._currRIdx >= 0) {
                    return tableMatrix.getCell(this._currRIdx, tableMatrix.length2() - 1);
                } else {
                    delete this._currRIdx;
                    delete this._currTbl;
                    return null;
                }
            }
            return tableMatrix.getCell(currentRowIdx, nextCellColIdx);
        },
        TableTools.moveRight = function(currentCell) {
            //	delete this._vpreCell;
            var _viewTools = ViewTools;
            var currentRowIdx = this._currRIdx;
            var currentTable = _viewTools.getTable(currentCell);
            var tableMatrix = currentTable.getTableMatrix();
            if (this._currTbl != currentTable) {
                currentRowIdx = -1;
            }
            if (!currentRowIdx || currentRowIdx < 0) {
                currentRowIdx = currentCell.parent.getRowIdx();
                this._currTbl = currentTable;
                this._currRIdx = currentRowIdx;
            }
            if (currentRowIdx < 0 || currentRowIdx >= tableMatrix.length()) {
                delete this._currRIdx;
                delete this._currTbl;
                return null;
            }
            var nextCellColIdx = currentCell.getColIdx() + currentCell.getColSpan();
            if (nextCellColIdx >= tableMatrix.length2()) {
                this._currRIdx++;
                if (this._currRIdx < tableMatrix.length()) {
                    return tableMatrix.getCell(this._currRIdx, 0);
                } else {
                    delete this._currRIdx;
                    delete this._currTbl;
                    return null;
                }
            }
            return tableMatrix.getCell(currentRowIdx, nextCellColIdx);
        };
    TableTools.moveUp = function(currentCell, clearRecord) {
        if (clearRecord) {
            delete this._currRIdx;
            delete this._currTbl;
        }
        var _viewTools = ViewTools;
        var preCell = this._vpreCell;
        var currentTable = _viewTools.getTable(currentCell);
        if (preCell && _viewTools.getTable(preCell) != currentTable) {
            preCell = null;
        }
        var tableMatrix = currentTable.getTableMatrix();
        var colSpan = currentCell.getColSpan();
        if (colSpan == 1 || !preCell) {
            var colIdx = currentCell.getColIdx();
        } else {
            var colIdx = preCell.getColIdx();
        }
        this._vpreCell = currentCell;
        var rowIdx = currentCell.parent.getRowIdx() - 1;
        if (rowIdx < 0) {
            delete this._vpreCell;
            return null;
        }
        return tableMatrix.getCell(rowIdx, colIdx);
    };
    TableTools.moveDown = function(currentCell, clearRecord) {
        if (clearRecord) {
            delete this._currRIdx;
            delete this._currTbl;
        }
        var _viewTools = ViewTools;
        var preCell = this._vpreCell;
        var currentTable = _viewTools.getTable(currentCell);
        if (preCell && _viewTools.getTable(preCell) != currentTable) {
            preCell = null;
        }
        var tableMatrix = currentTable.getTableMatrix();
        var colSpan = currentCell.getColSpan();
        if (colSpan == 1 || !preCell) {
            var colIdx = currentCell.getColIdx();
        } else {
            var colIdx = preCell.getColIdx();
        }
        var rowIdx = currentCell.parent.getRowIdx() + currentCell.getRowSpan();
        if (rowIdx >= tableMatrix.length()) {
            delete this._vpreCell;
            return null;
        }
        this._vpreCell = currentCell;
        return tableMatrix.getCell(rowIdx, colIdx);
    };
    topic.subscribe(constants.EVENT.LEFTMOUSEDOWN, function() {
        delete TableTools._currRIdx;
        delete TableTools._currTbl;
        delete TableTools._vpreCell;
    });





    /**
     * The function will rearrange the table JSON data to fit the given table size.
     * @param tableJson
     * @param newTableWidth The unit is px
     */
    TableTools.resizeTable = function(tableJson, newTableWidth) {
        // Need to deep detect avoid table include table.
        var colGrids = tableJson.tblGrid;
        var tableWidth = 0;
        for (var i = 0; i < colGrids.length; i++) {
            tableWidth += tools.toPxValue(colGrids[i].w);
        }

        if (newTableWidth >= tableWidth)
            return;

        var scale = newTableWidth / tableWidth;
        var newWidth;
        var offset = 8; // Should revise with cell padding and border.
        var minimizeCellWidth = 13;
        for (var i = 0; i < colGrids.length; i++) {
            newWidth = Math.max(scale * tools.toPxValue(colGrids[i].w) - offset, minimizeCellWidth);
            colGrids[i].w = newWidth + "px";
        }

        // Check embedded table
        var rows = tableJson.trs,
            row, cell, cellContent;
        for (var i = 0; i < rows.length; i++) // Rows
        {
            row = rows[i];
            for (var j = 0; j < row.tcs.length; j++) // Columns
            {
                cell = row.tcs[j];
                if (!cell.ps)
                    continue;

                for (var k = 0; k < cell.ps.length; k++) // Cell contents
                {
                    cellContent = cell.ps[k];
                    if (cellContent && cellContent.t == "tbl") {
                        var curTableInCellWidth = colGrids[j].w;
                        TableTools.resizeTable(cellContent, curTableInCellWidth);
                    }
                }
            }
        }
    };

    TableTools.getRepeatHeaderRows = function(table) {
        var returnRows = [];
        var rows = table.rows;
        var row = rows.getFirst();
        while (row) {
            if (row.isTblHeaderRepeat() == true && ModelTools.isInDocTable(row)) {
                returnRows.push(row)
                row = rows.next(row);
            } else break;
        }
        return returnRows;
    };
    TableTools.getRowsInRange = function(row1, row2) {
        var rows = [];
        table1 = ModelTools.getTable(row1);
        table2 = ModelTools.getTable(row2);
        if (table1 != table2) return null;
        var start = row1.getRowIdx() <= row2.getRowIdx() ? row1 : row2;
        var end = start == row1 ? row2 : row1;
        var row = start;
        while (row) {
            rows.push(row);
            if (row == end) break;
            row = table1.rows.next(row);
        }
        return rows;
    };

    TableTools.mergeBorderChangeSet = function(oldBorder, borderChangeSet) {
        var newBorder = lang.clone(oldBorder);
        var hasChanged = false;
        if (borderChangeSet.left) {
            hasChanged = true;
            newBorder.left = borderChangeSet.left.auto ? undefined : borderChangeSet.left;
        }
        if (borderChangeSet.right) {
            hasChanged = true;
            newBorder.right = borderChangeSet.right.auto ? undefined : borderChangeSet.right;
        }
        if (borderChangeSet.top) {
            hasChanged = true;
            newBorder.top = borderChangeSet.top.auto ? undefined : borderChangeSet.top;
        }
        if (borderChangeSet.bottom) {
            hasChanged = true;
            newBorder.bottom = borderChangeSet.bottom.auto ? undefined : borderChangeSet.bottom;
        }
        if (borderChangeSet.h) {
            hasChanged = true;
            newBorder.h = borderChangeSet.h.auto ? undefined : borderChangeSet.h;
        }
        if (borderChangeSet.v) {
            hasChanged = true;
            newBorder.v = borderChangeSet.v.auto ? undefined : borderChangeSet.v;
        }
        if (hasChanged) {
            // fix defect 53774
            // some border style we don't support must define in pairs
            // if cellBorder has changed in docs,
            // all borders should be changed to supported tyle
            var _borderSet = {
                "none": true,
                "dotted": true,
                "dashed": true,
                "solid": true,
                "double": true,
                "groove": true,
                "ridge": true,
                "inset": true,
                "outset": true
            };
            var _adapterBorderStyle = function(border) {
                if (!border || !border.style)
                    return;
                border.style = border.style.toLowerCase();
                var ret = tools.borderMap[border.style];
                if (_borderSet[ret]) {
                    border.style = ret;
                } else {
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

    TableTools.getBorderChangeSet = function(oldBorder, newBorder) {
        var borderChangeSet = {};
        if (oldBorder.left != newBorder.left) {
            borderChangeSet.left = newBorder.left === undefined ? {
                auto: true
            } : newBorder.left;
        }
        if (oldBorder.right != newBorder.right) {
            borderChangeSet.right = newBorder.right === undefined ? {
                auto: true
            } : newBorder.right;
        }
        if (oldBorder.top != newBorder.top) {
            borderChangeSet.top = newBorder.top === undefined ? {
                auto: true
            } : newBorder.top;
        }
        if (oldBorder.bottom != newBorder.bottom) {
            borderChangeSet.bottom = newBorder.bottom === undefined ? {
                auto: true
            } : newBorder.bottom;
        }
        if (oldBorder.h != newBorder.h) {
            borderChangeSet.h = newBorder.h === undefined ? {
                auto: true
            } : newBorder.v;
        }
        if (oldBorder.v != newBorder.v) {
            borderChangeSet.v = newBorder.v === undefined ? {
                auto: true
            } : newBorder.v;
        }
        return lang.clone(borderChangeSet);
    };

    TableTools.changeBorders = function(table, newBorder, rows, cols) {
        if (newBorder === undefined)
            newBorder = {
                auto: true
            };
        var tableMatrix = table.getTableMatrix();
        var cellDict = new Dictionary();
        array.forEach(rows, function(row) {
            var borderMatrix = tableMatrix.getRowBorders(row.row)[row.col];
            var preCell = borderMatrix.getPreCell();
            var nextCell = borderMatrix.getNextCell();
            if (preCell == nextCell) // merged cell inside
                return;
            if (preCell) {
                var tmp = cellDict.item(preCell.id) || {};
                tmp.obj = preCell;
                tmp.border = tmp.border || {};
                tmp.dirty = tmp.dirty || {};
                tmp.dirty.bottom = tmp.dirty.bottom || [];
                tmp.dirty.bottom.push(row.col - preCell.getColIdx());
                tmp.border.bottom = newBorder;
                cellDict.add(preCell.id, tmp);
            }
            if (nextCell) {
                var tmp = cellDict.item(nextCell.id) || {};
                tmp.obj = nextCell;
                tmp.border = tmp.border || {};
                tmp.border.top = newBorder;
                tmp.dirty = tmp.dirty || {};
                tmp.dirty.top = tmp.dirty.top || [];
                tmp.dirty.top.push(row.col - nextCell.getColIdx());
                cellDict.add(nextCell.id, tmp);
            }
        });
        array.forEach(cols, function(col) {
            var borderMatrix = tableMatrix.getColBorders(col.col)[col.row];
            var preCell = borderMatrix.getPreCell();
            var nextCell = borderMatrix.getNextCell();
            if (preCell == nextCell) // merged cell inside
                return;
            if (preCell && preCell.parent.getRowIdx() == col.row) {
                var tmp = cellDict.item(preCell.id) || {};
                tmp.obj = preCell;
                tmp.border = tmp.border || {};
                tmp.border.right = newBorder;
                cellDict.add(preCell.id, tmp);
            }

            if (nextCell && nextCell.parent.getRowIdx() == col.row) {
                var tmp = cellDict.item(nextCell.id) || {};
                tmp.obj = nextCell;
                tmp.border = tmp.border || {};
                tmp.border.left = newBorder;
                cellDict.add(nextCell.id, tmp);
            }
        });
        return array.filter(cellDict.getValueList(), function(change) {
            // for colSpan > 1, 
            // only change top/bottom border when all cell upper/lower changes
            if (change.border.bottom) {
                var i = 0,
                    colSpan = change.obj.getColSpan();
                for (; i < colSpan; i++) {
                    if (change.dirty.bottom.indexOf(i) == -1)
                        break;
                }
                if (i < colSpan)
                    delete change.border.bottom;
            }
            if (change.border.top) {
                var i = 0,
                    colSpan = change.obj.getColSpan();
                for (; i < colSpan; i++) {
                    if (change.dirty.top.indexOf(i) == -1)
                        break;
                }
                if (i < colSpan)
                    delete change.border.top;
            }
            delete change.dirty;
            if (!change.border.bottom && !change.border.top && !change.border.left && !change.border.right)
                return false;
            return true;
        });
    };

    /**
     * compare border priority in render
     * @return -1 when oldBoder has higher priority
     *          0  when same priority
     *          1  when newBoder has higher priority
     */
    TableTools.compareBorder = function(newBorder, oldBorder) {
        if (newBorder == oldBorder)
            return 0;
        if (!oldBorder)
            return 1;
        if (!newBorder)
            return -1;
        // compare style
        var newBorderStyle = newBorder.style || newBorder.val || "none",
            oldBorderStyle = oldBorder.style || oldBorder.val || "none";
        var stylePriority = {
            "none": -1,
            "nil": -1,
            "dotted": 1,
            "dashed": 2,
            "double": 3,
            "triple": 3,
            "single": 3,
            "solid": 3,
            "dotdash": 4,
            "dotdotdash": 4,
            "wave": 6,
            "doublewave": 7,
            "inset": 8,
            "outset": 9,
            "thinthickthinlargegap": 10,
            "thickthinlargegap": 11,
            "thinthicklargegap": 12,
            "thinthickthinmediumgap": 13,
            "thickthinmediumgap": 14,
            "thinthickmediumgap": 15,
            "thinthickthinsmallgap": 16,
            "thickthinsmallgap": 17,
            "thinthicksmallgap": 18,
            "dashsmallgap": 19,
            "dashdotstroked": 20,
            "threedemboss": 21,
            "threedengrave": 22
        };
        var newStylePriority = stylePriority[newBorderStyle.toLowerCase()] || 0;
        var oldStylePriority = stylePriority[oldBorderStyle.toLowerCase()] || 0;
        if (newStylePriority > oldStylePriority)
            return 1;
        if (newStylePriority < oldStylePriority)
            return -1;
        // border with larger width has higer priority
        var widthHandler = function(border) {
            if (!border || (!border.sz && !border.width))
                return 0;
            var sz = tools.toPtValue(border.sz || border.width);
            var borderStyle = border.style || border.val || "none";
            borderStyle = borderStyle.toLowerCase();
            if (borderStyle == "double")
                return sz * 3;
            else if (borderStyle == "triple")
                return sz * 5;
            return sz;
        };
        var newBorderWidth = widthHandler(newBorder),
            oldBorderWidth = widthHandler(oldBorder);
        if (newBorderWidth > oldBorderWidth)
            return 1;
        if (newBorderWidth < oldBorderWidth)
            return -1;
        // compare color ?
        // default
        return 0;
    };

    TableTools.borderFromJson = function(borderJson) {
        if (!borderJson)
            return;
        var border = lang.clone(borderJson);
        border.width = border.width || border.sz;
        border.style = border.style || border.val;
        delete border.sz;
        delete border.val;
        return border;
    };

    for (var x in TableTools)
        exports[x] = TableTools[x];
});
