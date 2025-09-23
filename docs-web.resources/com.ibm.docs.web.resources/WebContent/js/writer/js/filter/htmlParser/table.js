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
    "dojo/_base/declare",
    "writer/msg/msgHelper",
    "writer/filter/htmlParser/JsonWriter",
    "writer/util/ViewTools",
   "writer/filter/HtmlParser"
], function(declare, msgHelper, JsonWriter, ViewTools, htmlParser) {

    var table = declare("writer.filter.htmlParser.table", JsonWriter, {
        toJson: function() {
            if (this.containsShape())
                return null;

            var retVal = {};
            retVal.id = msgHelper.getUUID();
            retVal.t = "tbl";
            retVal.tblGrid = [];
            retVal.trs = [];
            var element = this.element;

            for (var i = 0; i < element.children.length; i++) {
                var tbody = element.children[i];
                if (tbody.name == "tbody" || tbody.name == "thead" || tbody.name == "tfoot") {
                    retVal.trs = retVal.trs.concat(this.getTableRows(tbody, retVal.tblGrid));
                }
            }

            if (retVal.trs.length == 0)
                return null;

            //set table property
            retVal.tblPr = this.getTablePropertyJson();
            //check tblGrid
            var nWidth = 0,
                totalWidth = 0;
            for (var i = 0; i < retVal.tblGrid.length; i++) {
                if (!retVal.tblGrid[i].w)
                    nWidth++;
                else
                    totalWidth += parseInt(retVal.tblGrid[i].w);
            }
            if (nWidth > 0) {
                var margin = this.getWidth().val - totalWidth;
                var cellWidth;
                if (margin < 0)
                    cellWidth = "50pt";
                else
                    cellWidth = Math.round(margin / nWidth) + this.getWidth().unit;
                for (var i = 0; i < retVal.tblGrid.length; i++) {
                    if (!retVal.tblGrid[i].w)
                        retVal.tblGrid[i].w = cellWidth;
                }
            }
            return retVal;
        },

        containsShape: function() {
            if (htmlParser.isPasteFromWord) {
                var shape = this.element.firstChild(function(node) {
                    return (node.name == "div" || node.name == "img") && (/shape/).test(node.attributes['class'] || "");
                });
                if (shape)
                    return true;
            }
        },

        getContainerWidth: function() {
            if (this.element.parent && this.element.parent.name == "td") {
                //in a cell
                var cell = this.element.parent;
                var row = cell.parent;
                var table = row.parent.parent;
                if (table && table.writer) {
                    var colspanWidth = table.writer.getColSpanWidth();
                    return ("" + (colspanWidth.val * cell.getColspan() * 0.8) + colspanWidth.unit);
                }
            }

            var selection = null;
            if (pe.lotusEditor.getSelection) 
                selection = pe.lotusEditor.getSelection();
            if (selection)
            {
                var range = selection.getRanges()[0];
                if (range) {
                    var view = range.getStartView().obj;
                    var container = ViewTools.getBody(view) || ViewTools.getTableContainer(view);
                    if (container) {
                        return "" + (container.getWidth && container.getWidth()) + "px";
                    }
                    console.error("something wrong!!");
                } else
                    console.error("Does not have selection!!");
            }
            else
                console.error("Does not have selection!!");
        },

        getWidth: function() {
            if (this.width == null) {
                var width = this.element.getStyle().width,
                    unit, tmp;
                if (!width) width = this.getContainerWidth();

                if (width && (tmp = width.toLowerCase().match(/^(-?[\d|\.]*)(pc|px|pt|em|cm|in|mm|emu)$/i))) {
                    width = parseInt(tmp[1]);
                    unit = tmp[2];
                } else {
                    //set a default
                    width = 500;
                    unit = "px";
                }
                this.width = {
                    "val": width,
                    "unit": unit
                };
            }
            return this.width;
        },

        getColSpanWidth: function() {
            if (!this.colspanWidth) {
                var count = this.getColSpanCount() || 1;
                var width = this.getWidth();
                this.colspanWidth = {
                    "val": Math.round(width.val / count),
                    "unit": width.unit
                };
            }
            return this.colspanWidth;
        },
        /**
         * get max cell spans in a row
         * which is to fix table structure
         * @returns {Number}
         */
        getColSpanCount: function() {
            if (this.maxCount)
                return this.maxCount;
            var table = this.element,
                maxCount = 0,
                tbody, count;
            for (var j = 0; j < table.children.length; j++) {
                tbody = table.children[j];
                if (tbody) {
                    for (var k = 0; k < tbody.children.length; k++) {
                        count = this.getTotalSpanOfRow(tbody.children[k]);
                        if (count > maxCount)
                            maxCount = count;
                    }

                }
            }
            this.maxCount = maxCount;
            return this.maxCount;
        },
        /**
         * get cell total span count of row
         * @param row
         */
        getTotalSpanOfRow: function(row) {
            var count = 0;
            for (var i = 0; i < row.children.length; i++) {
                count += row.children[i].getColspan();
            }
            return count;
        },

        getTableRows: function(tbody, grid) {
            var trs = [],
                cell, colspan, filledCells = [];
            var maxCount = this.getColSpanCount(),
                count;

            for (var i = 0; i < tbody.children.length; i++) {
                var row = tbody.children[i];
                var trJson = row.writeJson(filledCells[i], maxCount);
                if (!trJson)
                    continue;
                trs.push(trJson);

                //fill grid columns
                var colIndex = 0;
                for (var j = 0; j < row.children.length; j++) {
                    cell = row.children[j];
                    rowspan = cell.getRowspan();
                    colspan = cell.getColspan();

                    if (filledCells[i] && filledCells[i][colIndex])
                        colIndex += filledCells[i][colIndex].colspan;

                    if (rowspan > 1) {
                        //set cells which need fill 
                        for (var k = i + 1; k < i + rowspan; k++) {
                            filledCells[k] = [];
                            filledCells[k][colIndex] = {};
                            filledCells[k][colIndex].cell = {
                                "tcPr": {
                                    "gridSpan": {
                                        "val": colspan
                                    },
                                    "vMerge": {}
                                },
                                "t": "tc",
                                "id": msgHelper.getUUID()
                            };
                            filledCells[k][colIndex].colspan = colspan;
                        }
                    }

                    if (colspan > 1 && grid[colIndex]) {
                        colIndex += colspan;
                        continue;
                    }

                    //calculate cell width
                    cellW = cell.getWidth();
                    if (cellW && cellW.unit == "%") {
                        var tableWidth = this.getWidth();
                        cellW.val = Math.round(tableWidth.val * parseInt(cellW.val) * 0.01);
                        cellW.unit = tableWidth.unit;
                    }

                    if (colspan >= 1) {
                        var cellW = cellW && (Math.round(cellW.val / colspan) + cellW.unit);
                        for (var k = 0; k < colspan; k++) {
                            if (grid[colIndex]) {
                                (colspan == 1 && cellW) && (grid[colIndex].w = cellW);
                            } else {
                                grid[colIndex] = {
                                    "t": "gridCol"
                                };
                                cellW && (grid[colIndex].w = cellW);
                            }
                            colIndex++;
                        }
                    }
                }
            }

            return trs;
        },

        getTablePropertyJson: function() {
            function toStyleJson(cssBorder, json) {
                json.sz = cssBorder.width;
                json.val = cssBorder.style;
                json.color = cssBorder.color.substring(1);
            }
            var ret = {},
                element = this.element,
                bPasteFromWord = htmlParser.isPasteFromWord;
            var border = (bPasteFromWord) ? {} : element.getBorder(),
                defaultBorder = {
                    "width": "1px",
                    "style": "solid",
                    "color": "#000000"
                };

            border.left = border.left || defaultBorder;
            border.top = border.top || defaultBorder;
            border.right = border.right || defaultBorder;
            border.bottom = border.bottom || defaultBorder;
            ret.tblBorders = {};
            var keys = ["left", "right", "top", "bottom"];
            for (var i = 0; i < keys.length; i++) {
                ret.tblBorders[keys[i]] = {};
                toStyleJson(border[keys[i]] || defaultBorder, ret.tblBorders[keys[i]]);
            }

            var child = element.children[0];
            if (child && child.children[0]) {
                var firstCell = child.children[0].children[0];
                if (!firstCell) {
                    console.warn("no child in col");
                    return ret;
                }

                border = firstCell.getBorder();
                if (bPasteFromWord) {
                    border.bottom = defaultBorder;
                    border.right = defaultBorder;
                }
                if (border.bottom) {
                    ret.tblBorders.insideH = {};
                    toStyleJson(border.bottom, ret.tblBorders.insideH);
                }
                if (border.right) {
                    ret.tblBorders.insideV = {};
                    toStyleJson(border.right, ret.tblBorders.insideV);
                }
            }
            return ret;
        }
    });


    return table;
});
