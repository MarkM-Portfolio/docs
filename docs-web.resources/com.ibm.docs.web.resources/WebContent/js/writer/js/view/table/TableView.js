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
    "dojo/_base/declare",
    "dojo/dom-construct",
    "dojo/dom-class",
    "dojo/has",
    "dojo/query",
    "dojo/topic",
    "writer/constants",
    "writer/common/Container",
    "writer/common/tools",
    "writer/model/Model",
    "writer/model/table/Table",
    "writer/util/ModelTools",
    "writer/util/TableTools",
    "writer/util/ViewTools",
    "writer/view/AbstractView",
    "writer/view/update/TableViewUpdate",
    "writer/view/table/TableBase",
    "writer/util/TableMatrix",
    "writer/track/trackChange"
], function(array, declare, domConstruct, domClass, has, query, topic, constants, Container, tools, Model, Table, ModelTools, TableTools, ViewTools, AbstractView, TableViewUpdate, TableBase, TableMatrix, trackChange) {

    var TableView = declare("writer.view.table.TableView", null, {
    	constructor: function(model, ownerId, fromSplit) {
	        this.model = model;
	        this.ownerId = ownerId;
	        this.taskNode = new Object();
	        this.tpNode = null;
	        !fromSplit && this.init(ownerId);
	        //	this.initEdgeWidth();
    	}
    });
    TableView.prototype = {
        _MIN_MARGINTOP: 3,
        marginTop: 3,
        marginBottom: 3,
        // if set as true means diable the repeat header function
        repeatHeadDisabled: false,
        init: function(ownerId) {
            this.rows = new Container(this);
            this._isVisibleInTrack = this.model.isVisibleInTrack();
            this.visible = this.isVisibleInTrack() || this.model.forPreview;
            var showAllRows = false;
            if (!this.isVisibleInTrack() && this.model.forPreview)
                showAllRows = true;
			if(this.visible)
			{
                var rowModel = this.model.rows.getFirst();
                while (rowModel)
                {
					if(rowModel.visible || showAllRows)
					{
                   	 	var row = rowModel.preLayout(ownerId);
                    	row.parent = this;
                    	this.rows.append(row);
					}
					else
					{
						if(rowModel._viewers)
							delete rowModel._viewers;
					}

                    rowModel = this.model.rows.next(rowModel);
                }
            }
            else
            {
                this.marginTop = 0;
                this.marginBottom = 0;
            }
            this.marginLeft = 0;
        },
        destory: function() {
            this.model.removeViewer(this);
        },
        // implement of abstractView:canBePenetrated()
        canBePenetrated: function(x, y) {
            if (y < this.marginTop)
                return true;

            return false;
        },
        getViewType: function() {
            return 'table.Table';
        },
        getContainer: function() {
            return this.rows;
        },
        getBoxHeight: function() {
            return this.h;
        },
        getContentHeight: function() {
            return this._h;
        },
        getColumnWidth: function(i) {
            return this.model.getColumnWidth(i);
        },
        calculateMarginTop: function() {
            var textArea = this.parent;
            var body = ViewTools.getBody(textArea);
            if (!body || !textArea.bodySpace) {
                this.marginTop = this._MIN_MARGINTOP;
                return;
            }

            this.marginTop = textArea.bodySpace.getBottomFlatY() - textArea.offsetY + this._MIN_MARGINTOP;
            if (isNaN(this.marginTop) || this.marginTop < this._MIN_MARGINTOP)
                this.marginTop = this._MIN_MARGINTOP;
                
            if (!this.visible)
            {
                this.marginTop = 0;
            }
        },
        layout: function(body) {
            this.parent = body;
            if(this.visible)
            {
	            this.calculateMarginTop();
	            if (this.isSplited) {
	                delete this.isSplited;
	                return;
	            }
	            var row = this.rows.getFirst();
	            var that = this;
	            var rowWidth = 0;
	            var top = 0;
	            this.rows.forEach(function(row) {
	                row.setContentTop(top);
	                row.layout(that);
	                rowWidth = Math.max(rowWidth, row.getBoxWidth());
	                top += row.getBoxHeight();
	            });
	            this.w = rowWidth;
	            this.adjustAlign();
	            this._h = top;
	            this.h = top + this.getTopEdge() + this.getBottomEdge() + this.marginTop + this.marginBottom;
            }
            else
            {
                this._h = 0;
            	this.h = 0;
                this.marginLeft = 0;
                this.marginTop = this.marginBottom = 0;
            }
            this._hasLayout = true;
            this.markDirtyDOM();
        },
        adjustAlign: function() {
            var align = this.model.getAligin();
            if (!this.parent) {
                return;
            }
            this.marginLeft = 0;
            if (align == "right") {
                this.marginLeft = this.parent.getWidth() - this.w;
            } else if (align == "center") {
                this.marginLeft = (this.parent.getWidth() - this.w) / 2;
            } else {
                this.marginLeft = this.model.getIndent();
            }
            if (!this.visible)
            {
                this.marginLeft = 0;
            }
        },
        canFit: function(w, h) {
            if (this.h <= h) {
                return true;
            } else {
                return false;
            }
        },
        getRepeatHeader: function() {
            var rowViews = [];
            var tableModel = this.model;
            //if this tableView disable repeatHeadDisabled we don't need to repeat header rows
            if (this.repeatHeadDisabled)
                return [];
            var row = tableModel ? tableModel.rows.getFirst() : null;
            while (row) {
                if (row.isTblHeaderRepeat() != true || !ModelTools.isInDocTable(row))
                    break;
                //if repeat rows are splited
                var view = ModelTools.getAllNonSplitedView(row);
                if (!view) {
                    // this row is splitted.
                    rowViews = [];
                    break;
                }
                //if cells in repeat rows are splited
                if (row.cells) {
                    var irregularRow = false;
                    var cellSplitted = false;
                    var rowSpan = row.cells && row.cells.getFirst() && row.cells.getFirst().getRowSpan();
                    row.cells.forEach(function(cell) {
                        if (cell.getRowSpan() != rowSpan) {
                            irregularRow = true;
                            return false;
                        }
                        if (!ModelTools.getAllNonSplitedView(cell)) {
                            // this cell is splitted, should not go there.
                            cellSplitted = true;
                            return false;
                        }
                    });
                    if (irregularRow || cellSplitted) {
                        rowViews = [];
                        break;
                    }
                }
                rowViews.push(view);
                row = tableModel.rows.next(row);
            }
            var viewCount = rowViews.length;
            if (viewCount > 0) {
                var firstRowTableView = ViewTools.getTable(rowViews[0]);
                if (firstRowTableView.rows.length() <= viewCount) {
                    rowViews = [];
                    return rowViews;
                }
                for (var i = 0; i < viewCount; i++) {
                    // should be in same tableView
                    var rowTableView = ViewTools.getTable(rowViews[i]);
                    if (firstRowTableView != rowTableView) {
                        rowViews = [];
                        break;
                    }
                    // should NOT be me
                    if (this == rowTableView) {
                        rowViews = [];
                        break;
                    }
                }
            }
            return rowViews;
        },
        repeatViewH: function(rows) {
            var rowViews = rows || this.getRepeatHeader();
            var h = 0;
            if (rowViews.length > 0) {
                for (var i = 0; i < rowViews.length; i++) {
                    h += rowViews[i].getBoxHeight();
                }
            }
            return h;
        },
        canSplit: function(w, h, body) {
            var rowModels = TableTools.getRepeatHeaderRows(this.model);
            var repeatHeight = 0;
            var reserveHeight = 0;
            var view;
            //only need to decide repeatHeders can Split or not
            if (rowModels.length > 0 && this.rows.getFirst() == ModelTools.getAllNonSplitedView(rowModels[0])) {
                //calculate repeatHeader's height
                for (var i = 0; i < rowModels.length; i++) {
                    view = ModelTools.getAllNonSplitedView(rowModels[i]);
                    if (view)
                        repeatHeight += view.getBoxHeight();
                    else break;
                }
                // repeatHeder must render with next rowView,if not means table
                var next = this.rows.next(view);
                if (next) {
                    reserveHeight = repeatHeight + next.getBoxHeight();
                    if (body && body.getHeight() - (this.marginTop - this._MIN_MARGINTOP) > repeatHeight) {
                        if (body.getHeight() - (this.marginTop - this._MIN_MARGINTOP) < reserveHeight) {
                            var bodyContentH = body.getHeight() - (this.marginTop - this._MIN_MARGINTOP);
                            var tarRow = this.rows.select(function(row) {
                                var rowH = row.getBoxHeight();
                                if (bodyContentH > rowH) {
                                    bodyContentH = bodyContentH - rowH;
                                    return false;
                                } else {
                                    return true;
                                }
                            });
                            if (tarRow && !tarRow.canSplit(w, bodyContentH) && tarRow == next)
                                return true;
                        } else {
                            //  first table View ,no need to minus repeatH
                            var unUsedHeight = h - (this.marginTop - this._MIN_MARGINTOP);
                            if (unUsedHeight <= repeatHeight)
                                return false;
                            else if (unUsedHeight < reserveHeight) {
                                var tarRow = this.rows.select(function(row) {
                                    var rowH = row.getBoxHeight();
                                    if (unUsedHeight > rowH) {
                                        unUsedHeight = unUsedHeight - rowH;
                                        return false;
                                    } else {
                                        return true;
                                    }
                                });
                                if (tarRow && !tarRow.canSplit(w, unUsedHeight) && tarRow == next)
                                    return false;
                            }
                        }
                    }
                }
            }
            return true;
        },
        split: function(w, h, body) {
            var repeatH = this.repeatViewH();
            var oh = h;
            h -= (this.marginTop - this._MIN_MARGINTOP + repeatH);
            var tarRow = this.rows.select(function(row) {
                var rowH = row.getBoxHeight();
                if (h >= rowH) {
                    h = h - rowH;
                    return false;
                } else {
                    return true;
                }
            });
            if (tarRow) {
                var newRow = tarRow.split(w, h);
                var splitted = newRow != null;
                if (!newRow) {
                    newRow = tarRow;
                }
                if (newRow.getRowIdx() == 0) {
                    // the row is out of the range of the body, then it will be force fixed in the body!
                    if (splitted == false && repeatH > 0) {
                        //if tried split first row onece but can't not split and it caused by repeat header
                        //we disable this tableView repeatHeadDisabled prop,so that we don't repeat the header rows
                        this.repeatHeadDisabled = true;
                        return this.split(w, oh, body);
                    }

                    if (body && !body.getContainer().length() == 0) {
                        return this;
                    } else {
                        newRow = this.rows.next(newRow);
                        if (!newRow) {
                            return null;
                        }
                    }
                }
                var newTable = new TableView(this.model, this.getOwnerId(), true);
                newTable.visible = true;
                /*new created tableView must inherited it's previous tableView's repeatHeadDisabled prop
                 which means if one tableview's previous tableviews don't repeat header,
                  this don't repeat as well
                */
                newTable.repeatHeadDisabled = this.repeatHeadDisabled;
                var rows = this.rows.divide(newRow);
                newTable.rows = rows;
                newTable.isSplited = true;
                newTable.marginLeft = this.marginLeft;

                newTable._changeForSplit={"index":this.rows.length(),"type":"toEnd"};
                newTable.getTableMatrix(this._tableMatrix);
                this.changeTable({"index":this.rows.length(),"type":"fromStart"});
                this.getTableMatrix();

                var lastRowView = this.rows.getLast();
                this.model.addViewer(newTable, this.getOwnerId(), this);
                this.alignItem();
                newTable.alignItem();
                this.adjustAlign();
                newTable.marginLeft = this.marginLeft;
                newTable._hasLayout = true;
                var firstRow = newTable.rows.getFirst();
                firstRow.toCheckBorder(true, true);
                return newTable;
            }
            return null;
        },
        getTableMatrix: function(cloneMatrix) {
            if (!this._tableMatrix || this._tableStructChange) {
            	if(this._changeForSplit){
            		var cloneFrom = this._tableMatrix || cloneMatrix;
            		if(this._changeForSplit.type == "fromStart")
            			cloneFrom.toIdx = this._changeForSplit.index;
            		else
            			cloneFrom.fromIdx = this._changeForSplit.index;
            		this._tableMatrix = new TableMatrix(this, "split", cloneFrom);
            		delete cloneFrom.fromIdx;
            		delete cloneFrom.toIdx;
            	}
            	else
            		this._tableMatrix = new TableMatrix(this);
                delete this._tableStructChange;
                delete this._changeForSplit;
            }
            return this._tableMatrix;
        },

        isMatrixReady: function() {
            return this._tableMatrix && ! this._tableStructChange;
        },
        changeTable: function(isSplit) {
            this._tableStructChange = true;
            if(isSplit)
            	this._changeForSplit = isSplit;
            this.markDirtyDOM();
        },
        canMerge: function(w, h) {
        	if(h < 0)
        		return false;
        	var r = this.rows.getFirst();
        	var c = r.getFirst();
        	var bMerger = false;
        	var minLh = -1;
        	while(c) {
        		var lh = c.getFistLineHeight();
        		if(lh && lh > 0)
        			minLh = (minLh>0? Math.min(minLh, lh) : lh);
        		c = c.next();
        	}
        	if(minLh > 0 && minLh > h)
        		return false;

            return true;
        },
        merge: function(table) {
            var last = this.rows.getLast();
            var r = table.rows.getFirst();
            if (last.merge(r) && r.deleted) {
                r = table.rows.next(r);
            }
            while (r) {
                this.insertRow(r, last);
                last = r;
                r = table.rows.next(r);
            }
            if(table.sectId) this.sectId = table.sectId;
            this.changeTable();
            // this.fixFirstRow();
            this.alignItem();
            this.markDirtyDOM();
            //		table.deleteSel();
            this.model.removeViewer(table, table.getOwnerId());
        },
        alignItem: function() {
            var that = this;
            var rowWidth = 0;
            var top = this.repeatViewH();
            this.rows.forEach(function(row) {
                row.parent = that;
                rowWidth = Math.max(rowWidth, row.getBoxWidth());
                row.setContentTop(top);
                row.alignItem();
                top += row.getBoxHeight();
            });
            this.w = rowWidth;
            this.h = top + this.getTopEdge() + this.getBottomEdge() + this.marginTop + this.marginBottom;
            this._h = top;
        },
        taskRender: function() {
            if (pe.lotusEditor.getTaskHdl())
                pe.lotusEditor.getTaskHdl().taskRender(this);
        },
        getMainNode: function() {
            //add for table head repeat no table view domnode error
            if (!this.domNode)
                return null;
            return this.domNode.childNodes[0];
        },
        cleanRepeatHeaderDom: function(dom) {
            var selections = query(".cellSelection", dom);
            array.forEach(selections, domConstruct.destroy);
        },
        checkLinks: function(dom) {
            var selections = query(".hasLink", dom);
            array.forEach(selections, function(d) {
                d.title = "";
            });
        },
        render: function() {
            var tblOuterNode = null;

            if (!this.domNode || this.isDirtyDOM()) {
                this.adjustAlign();

                this.domNode = document.createElement("div");
                this.domNode.className = "table"
                this.domNode.id = this.model.id;

                if (!this.visible) {
                    tblOuterNode = document.createElement("div");
                    tblOuterNode.setAttribute("style", "height:0px;display:none;");
                    this.domNode.appendChild(tblOuterNode);
                    this.domNode.setAttribute("style", "height:0px;display:none;");
                    return this.domNode;
                }

                this.adjustAlign();
                
                if (this.model.forPreview)
                    this.marginTop = this.marginBottom = this.marginLeft = 0;

                var style = "padding-bottom:" + this.marginBottom + "px;padding-top:" + this.marginTop + "px";
                this.domNode.setAttribute("style", style);

                var tableNode = document.createElement("table");
                tableNode.className = "table " + this.getCSSStyle();
                var tr = this.rows.getFirst();
                var repeatViews = this.getRepeatHeader();
                if (repeatViews.length > 0 && this.repeatViewH(repeatViews) > 0) {
                    for (var i = 0; i < repeatViews.length; i++) {
                        var newDom = repeatViews[i].render().cloneNode(true);
                        this.cleanRepeatHeaderDom(newDom);
                        this.checkLinks(newDom);
                        if (i == repeatViews.length - 1) {
                            query(">.cell>.bottomGroup", newDom).forEach(function(borderDom) {
                                domConstruct.destroy(borderDom);
                            });
                        }
                        tableNode.appendChild(newDom);
                    }
                }
                while (tr) {
                    tableNode.appendChild(tr.render());
                    tr = this.rows.next(tr);
                }
                //			this.tpNode = tableNode;  // Unsupport task to remove it.
                //			this.taskRender();

                tblOuterNode = document.createElement("div");
                tblOuterNode.setAttribute("style", this.getStyleStr());
                tblOuterNode.appendChild(tableNode);
                this.domNode.appendChild(tblOuterNode);

                delete this.changedView;
                delete this._dirtyDOM;
                topic.publish(constants.EVENT.TBLDOMCHG, this);
            }

            var trackDeletedUser = this.isTrackDeleted();
            if (trackDeletedUser) {
                var outerDom = this.domNode.children[0];
                domClass.remove(outerDom, "track-deleted-x");
                domClass.add(outerDom, "track-deleted-x track-deleted-x-" + trackDeletedUser);
                var xDom = domConstruct.create("div", {
                    className: "track-deleted-x-dom",
                    innerHTML: "X"
                }, outerDom);
                xDom.style.fontSize = parseInt(outerDom.style.height) / 2 + "px";
            } else {
            	this.checkTrackClass(this.domNode);
            }

            return this.domNode;
	},
	isTrackDeleted: function()
	{
		var deleted = true;
		return false;
		/*
		this.model.container.forEach(function(c){
			if (c && !(c.rowProperty && c.rowProperty.ch && c.rowProperty.ch.length && c.ch[c.ch.length -1].t == "del"))
			{
				deleted = false;
				return false;
			}
			else
				deleted = c.ch[c.ch.length -1].u;
		})
		return deleted;
		*/
        },
        getStyleStr: function() {
            return "margin-left:" + this.marginLeft + "px;width:" + this.w + "px;height:" + this._h + "px;" + this.getBorderStyleStr();
        },
        getCSSStyle: function() {
            return this.model.getCSSStyle();
        },
        insertRow: function(newRow, tarRow) {
            this.rows.insertAfter(newRow, tarRow);
            newRow.parent = this;
        },
        getElementPath: function(x, y, path, options) {
            if (!this.visible)
                return;

            if (this.isDeleted() || this.isReseted())
                return;
            x -= this.marginLeft;
            y -= this.getTopEdge();
            y -= this.marginTop;
            x -= this.getLeftEdge();
            var y1 = y;
            y -= this.repeatViewH();
            var tarRow = this.rows.select(function(row) {
                if (y <= row.getBoxHeight()) {
                    return true;
                } else {
                    y = y - row.getBoxHeight();
                    return false;
                }
            });
			if(!tarRow)
                tarRow = this.rows.getLast();

            if (tarRow) {
                y = tarRow.getBoxHeight();
                path.push(tarRow);
                tarRow.getElementPath(x, y1, path, options);
            }
        },
        getContentTop: function() {
            var top = this.getTop();
            top += this.getTopEdge();
            top += this.marginTop;
            return top;
        },
        getContentLeft: function() {
            var left = this.getLeft();
            left += this.getLeftEdge() + this.marginLeft;
            return left;
        },
        hasLayouted: function() {
            return this._hasLayout;
        },
        //add for relayout table 
        releaseLayout: function() {
            delete this._hasLayout;
            delete this.isSplited;
        },
        canBreak2pieces: function() {
            return true;
        },
        updateSelf: function() {
            this.markDirtyDOM();
            var parent = this.getParent();
            if (parent) {
                this.parent.notifyUpdate([this]);
            }
        },
        reset: function(forceExe) {
            var parent = this.getParent();
            if (!forceExe) {
                parent.notifyUpdate([this]);
                if(this.visible)
                {
                	if(this.model.isTrackDeleted())
                		this.visible = false;
                }
                this._reseted = true;
                return;
            }
            if (parent) {
                this.init(this.getOwnerId());
                delete this._hasLayout;
                this.markDirtyDOM();
                delete this._reseted;
                this.changeTable();
                this.getTableMatrix();
            }
        },
        getItemByIndex: function(index) {
            return this.rows.getByIndex(index);
        },
        isReseted: function() {
            return this._reseted == true;
        },
        // TODO: this method is no longer used
        //fix the first row defect 37880
        fixFirstRow: function() {
            var toDelete = true;
            var firstRow = this.rows.getFirst();
            var cells = firstRow.cells;
            cells.forEach(function(cell) {
                if (cell.getRowSpan() == 1 && cell.container && cell.container.length() > 0) {
                    toDelete = false;
                }
            });
            if (!toDelete) {
                return;
            }
            var i = 0;
            var cell = cells.getFirst();
            var nextRow = this.rows.next(firstRow);
            if (!nextRow) {
                console.warn("something is incorrect!");
                return;
            }
            while (cell) {
                var rowSpan = cell.getRowSpan();
                if (rowSpan > 1) {
                    cell.setRowSpan(rowSpan - 1);
                    nextRow.cells.insertAt(cell, i);
                }
                cell = cells.next(cell);
                i++;
            }
            this.rows.remove(firstRow);
            firstRow.model.removeViewer(firstRow, firstRow.getOwnerId());
            this.changeTable();
        },
        _initEdgeWidth: function() {
            return {
                left: {
                    border: 0,
                    padding: 0
                },
                right: {
                    border: 0,
                    padding: 0
                },
                top: {
                    border: 0,
                    padding: 0
                },
                bottom: {
                    border: 0,
                    padding: 0
                }
            };
        },
        getMinWidth: function() {
            var matrix = this.getTableMatrix();
            var rowMatrix = matrix.getRowMatrix(this.rows.getFirst());
            var minW = 0;
            for (var i = 0; i < rowMatrix.length; i++) {
                var cell = rowMatrix[i];
                minW = minW + cell.getMinWidth();
            }
            return minW;
        },
        getMinHeight: function() {
            var matrix = this.getTableMatrix();
            var cells = matrix.getColumn(0);
            var minH = 0;
            for (var i = 0; i < cells.length; i++) {
                var cell = cells[i];
                minH = minH + cell.getMinHeight();
            }
            return minH;
        },
        getChildPosition: function(idx) {
        	if(this.visible)
        	{
	            var row = this.rows.getByIndex(idx);
	            if (!row) {
	                row = this.rows.getLast();
	                return {
	                    'x': row.getBoxWidth() + this.getLeft(),
	                    'y': row.getTop()
	                };
	            } else {
	                return {
	                    'x': row.getLeft(),
	                    'y': row.getTop()
	                };
	            }
        	}
        	return {
                'x': this.getLeft(),
                'y': this.getTop()
            };
        },
        isTrackDeleted: function() {
            return false;
        },

        checkTrackClass: function(dom) {
            this.checkTrackClassAbs(dom);
        },

        getHtmlContent: function() {
        	var style = "style=\"border:1px solid #0000; border-collapse:collapse; width:" + this.getWidth() + "px\"";
        	var content = "<table border=\"1\" " + style + "><tbody>";
            this.rows.forEach(function(row) {
            	content += row.getHtmlContent();
            });
            content += "</tbody></table>";
            return content;
        }
    };

    Model.prototype.viewConstructors[Table.prototype.modelType] = TableView;
    tools.extend(TableView.prototype, new AbstractView());
    tools.extend(TableView.prototype, new TableViewUpdate());
    tools.extend(TableView.prototype, new TableBase());
    return TableView;
});
