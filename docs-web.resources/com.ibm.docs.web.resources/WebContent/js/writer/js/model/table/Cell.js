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
    "dojo/_base/lang",
    "dojo/topic",
    "writer/common/Container",
    "writer/common/tools",
    "writer/constants",
    "writer/model/Model",
    "writer/model/table/TableBase",
    "writer/model/prop/CellProperty",
    "writer/model/update/Block",
    "writer/msg/msgCenter",
    "writer/msg/msgHelper",
    "writer/util/ModelTools",
    "writer/view/table/CellView",
    "writer/util/TableTools",
    "writer/track/trackChange"
], function(lang, topic, Container, tools, constants, Model, TableBase, CellProperty, Block, msgCenter, msgHelper, ModelTools, CellView, TableTools, trackChange) {

    var Cell = function(json, row, table) {
        this.parent = row;
        this.table = table;
        this.init(json);
    };

    Cell.prototype = {
        modelType: constants.MODELTYPE.CELL,
        init: function(json) {
            this.id = json.id;
            this.rowSpan = 1;
            this.colSpan = 1;
            //		this.container = new writer.common.Container(this);
            this.cellProperty = new CellProperty(json.tcPr, this);
            if (json.tcPr) {
                if (this.cellProperty.tcW) {
                    this.w = Math.round(tools.toPxValue(this.cellProperty.tcW.w, this.cellProperty.tcW.type));
                }
                this._initColSpan();
            } else {
                this.cellProperty = new CellProperty({}, this);
            }
            this.initContent(json.ps);
            //		var childElement = json.ps;
            //		for(var i=0;i< childElement.length;i++){
            //			var c = this.createSubModel(childElement[i]);
            //			c&&this.container.append(c);
            //		}
        },
        /**
         * The function was used to paste content into selected cell. 
         * It will remove all contents and insert given paragraphs
         * @param paragraphs Array
         * @return Return message
         */
        replaceContent: function(paragraphs, bInternal) {
            var msgs = [],
                para;
            var oldLen = this.container.length();
            var trackable = ModelTools.isTrackable(this);
            if (!trackable)
            {
                ModelTools.cleanChInJson(paragraphs);
            }
            for (var i = 0; i < paragraphs.length; i++) {
                var jsonData = paragraphs[i];
                if (paragraphs[i].t == null) {
                    // Create an empty paragraph
                    jsonData = ModelTools.getEmptyParagraphSource();
                }
                var m = this.createSubModel(jsonData);
                if (m) {
                    m = pe.lotusEditor.addIndicatorInModel(m, bInternal);
                    this.insertAfter(m);
                    msgCenter.sendMessage([msgCenter.createMsg(constants.MSGTYPE.Element, [msgCenter.createInsertElementAct(m)])]);
                }

                if (paragraphs[i].t == null) {
                    // Insert content into this paragraph
                    var richTextJson = pe.lotusEditor.fitlerIndicatorInJson(paragraphs[i], bInternal);
                    // The function will send message.
                    ModelTools.insertInlineObject(richTextJson, m, 0, false);
                }
            }

            for (var i = oldLen - 1; i >= 0; i--) {
                para = this.getByIndex(i);
                msgs.push(msgCenter.createMsg(constants.MSGTYPE.Element, [msgCenter.createDeleteElementAct(para)]));
                this.remove(para);
            }
            msgCenter.sendMessage(msgs);
            this.update();
            return msgs;
        },
        _initColSpan: function() {
            this.colSpan = this.cellProperty.getColSpan();
        },
        isMergedCell: function() {
            return this.cellProperty.isMerged();
        },
        isMergedStart: function() {
            return this.cellProperty.isMergedStart();
        },
        setMergedStart: function() {
            this.cellProperty.megeredStart = true;
        },
        removeMergedStart: function() {
            delete this.cellProperty.megeredStart;
        },
        getProperty: function() {
            return this.cellProperty;
        },
        getAlgin: function(view) {
            var allViewers = this.getAllViews();
            for (var ownerId in allViewers) {
                var viewers = allViewers[ownerId];
                var firstView = viewers.getFirst();
                if (firstView == view) {
                    return this.cellProperty.getAlignment();
                }
            }
        },
        getRowSpan: function() {
            return this.rowSpan;
        },
        getTable: function() {
            return this.table;
        },
        setRowSpan: function(s) {
            if (s == 1) {
                this.removeMergedStart();
            }
            if (s > 1 && !this.isMergedStart()) {
                this.setMergedStart();
            }
            this.rowSpan = s;
        },
        getColSpan: function() {
            return this.colSpan;
        },
        setColSpan: function(colSpan) {
            this.colSpan = colSpan;
            this.cellProperty.setColSpan(colSpan);
        },
        getContentWidth: function() {
            var w = 0;
            if (this.getColIdx() == null) {
                return 0;;
            }
            for (var i = 0; i < this.getColSpan(); i++) {
                w += this.table.getColumnWidth(this.getColIdx() + i);
            }
            return w;
        },
        getPadding: function() {
            return null;
        },
        getColIdx: function() {
            return this._colIdx;
        },
        setColIdx: function(idx) {
            this._colIdx = idx;
        },
        toJson: function() {
            var tc = {};
            tc.t = "tc";
            tc.id = this.id;
            tc.tcPr = this.cellProperty && this.cellProperty.toJson() || {};
            try {
                tc.tcPr.tcW = {
                    "w": tools.PxToDXA(this.getTable().getColumnWidth(this.getColIdx())),
                    "type": "dxa"
                };
            } catch (e) {

            }
            if (!tc.tcPr) {
                delete tc.tcPr;
            }
            if (this.table && this.table._noRecordStyle && tc.tcPr) {
                delete tc.tcPr.tcBorders;
                delete tc.tcPr.shd;
                delete tc.tcPr.vAlign;
            }
            tc.ps = [];
            var child = this.container.getFirst();
            var i = 0;
            var childJson;
            while (i < this.container.length() && child) {
                if (child.modelType == constants.MODELTYPE.PARAGRAPH)
                    childJson = child.toJson(0, null, true);
                else
                    childJson = child.toJson();

                tc.ps.push(childJson);
                child = this.container.next(child);
                i++;
            }
            return tc;
        },

        getContainer: function() {
            return this.container;
        },

        getConditionStyle: function(revert, noMerge) {
            var conditionStyle = null;
            var rowConditionStyle = null;
            var property = this.getProperty();
            if (property) {
                conditionStyle = property.getConditionStyle();
            }
            //var rowProperty = this.parent.getProperty();
            //if(rowProperty&&!noMerge){
            //	rowConditionStyle = rowProperty.getConditionStyle();
            //}
            if (!noMerge) {
                rowConditionStyle = this.getRowConditionStyle();
            }

            var ret = property.mergeConditionStyle(conditionStyle, rowConditionStyle);
            if (revert) {
                ret = ret.reverse();
            }
            return ret;
        },
        getRowConditionStyle: function() {
            var ret = null;
            var rowProperty = this.parent.getProperty();
            if (rowProperty) {
                ret = rowProperty.getConditionStyle();
            }
            return ret;
        },
        _getCellPosType: function(rowsCnt, colsCnt) {
            var colIdx = this.getColIdx();
            var rowIdx = this.parent.getRowIdx();
            var matrix;
            if(!rowsCnt || !colsCnt)
                matrix = this.getTable().getTableMatrix();
            
            var rowCnt = rowsCnt || matrix.length();
            var colCnt = colsCnt || matrix.length2();
            var type = "N";
            if (colIdx == 0) {
                type = "L";
            }
            if (colIdx == colCnt - 1) {
                if (type == "L")
                    type = "WE";
                else
                    type = "R";
            }
            if (rowIdx == 0) {
                if (type == "L") {
                    type = "WN";
                } else if (type == "R") {
                    type = "EN";
                } else if (type == "WE") {
                    type = "WEN";
                } else {
                    type = "T";
                }
            }
            if (rowIdx == rowCnt - 1) {
                if (type == "R") {
                    type = "ES";
                } else if (type == "L") {
                    type = "WS";
                } else if (type == "WE") {
                    type = "WES";
                } else if (type == "WN") {
                    type = "WNS";
                } else if (type == "EN") {
                    type = "ENS";
                } else if (type == "WEN") {
                    type = "WENS";
                } else if (type == "T") {
                    type = "NS";
                } else {
                    type = "B";
                }
            }
            return type;
        },
        changeBorder: function(border, options) {
            if (!border)
                return;
            var borderChangeSet = lang.clone(border);
            var cellProperty = this.getProperty();
            var newBorder = TableTools.mergeBorderChangeSet(cellProperty.getBorder(), borderChangeSet);
            cellProperty.setBorder(newBorder);
            //clean model cache and reset to render
            this.clearAllCache && this.clearAllCache();
            this.markCheckBorder && this.markCheckBorder();
            this.update();
        },
        /**
         * @param  rowCnt row count of table(add for defect 54071)
         * @param  colCnt col count of table
         * @return real border
         */
        getBorder: function(rowCnt, colCnt) {
            var cellPerporty = this.getProperty();
            var cellType = this._getCellPosType(rowCnt, colCnt);
            var border = lang.clone(cellPerporty.getBorder());
			var leftNull = rightNull = topNull = bottomNull = null;
            if (border.left && border.left.style == "none") {
				leftNull = border.left;
                border.left = null;
            }
            if (border.right && border.right.style == "none") {
				rightNull = border.right;
                border.right = null;
            }
            if (border.top && border.top.style == "none") {
				topNull = border.top;
                border.top = null;
            }
            if (border.bottom && border.bottom.style == "none") {
				bottomNull = border.bottom;
                border.bottom = null;
            }

            var tablePropertyHandler = function(styleBorder) {
                if (!styleBorder) {
                    return;
                }
                if (cellType == "N") {
                    border.left = border.left || lang.clone(styleBorder.v);
                    border.right = border.right || lang.clone(styleBorder.v);
                    border.top = border.top || lang.clone(styleBorder.h);
                    border.bottom = border.bottom || lang.clone(styleBorder.h);
                } else if (cellType == "R") {
                    border.left = border.left || lang.clone(styleBorder.v);
                    border.right = border.right || lang.clone(styleBorder.right);
                    border.top = border.top || lang.clone(styleBorder.h);
                    border.bottom = border.bottom || lang.clone(styleBorder.h);
                } else if (cellType == "L") {
                    border.left = border.left || lang.clone(styleBorder.left);
                    border.right = border.right || lang.clone(styleBorder.v);
                    border.top = border.top || lang.clone(styleBorder.h);
                    border.bottom = border.bottom || lang.clone(styleBorder.h);
                } else if (cellType == "T") {
                    border.left = border.left || lang.clone(styleBorder.v);
                    border.right = border.right || lang.clone(styleBorder.v);
                    border.top = border.top || lang.clone(styleBorder.top);
                    border.bottom = border.bottom || lang.clone(styleBorder.h);
                } else if (cellType == "B") {
                    border.left = border.left || lang.clone(styleBorder.v);
                    border.right = border.right || lang.clone(styleBorder.v);
                    border.top = border.top || lang.clone(styleBorder.h);
                    border.bottom = border.bottom || lang.clone(styleBorder.bottom);
                } else if (cellType == "WN") {
                    border.left = border.left || lang.clone(styleBorder.left);
                    border.right = border.right || lang.clone(styleBorder.v);
                    border.top = border.top || lang.clone(styleBorder.top);
                    border.bottom = border.bottom || lang.clone(styleBorder.h);
                } else if (cellType == "EN") {
                    border.left = border.left || lang.clone(styleBorder.v);
                    border.right = border.right || lang.clone(styleBorder.right);
                    border.top = border.top || lang.clone(styleBorder.top);
                    border.bottom = border.bottom || lang.clone(styleBorder.h);
                } else if (cellType == "WS") {
                    border.left = border.left || lang.clone(styleBorder.left);
                    border.right = border.right || lang.clone(styleBorder.v);
                    border.top = border.top || lang.clone(styleBorder.h);
                    border.bottom = border.bottom || lang.clone(styleBorder.bottom);
                } else if (cellType == "ES") {
                    border.left = border.left || lang.clone(styleBorder.v);
                    border.right = border.right || lang.clone(styleBorder.right);
                    border.top = border.top || lang.clone(styleBorder.h);
                    border.bottom = border.bottom || lang.clone(styleBorder.bottom);
                } else if (cellType == "NS") {
                    border.left = border.left || lang.clone(styleBorder.v);
                    border.right = border.right || lang.clone(styleBorder.v);
                    border.top = border.top || lang.clone(styleBorder.top);
                    border.bottom = border.bottom || lang.clone(styleBorder.bottom);
                } else if (cellType == "WE") {
                    border.left = border.left || lang.clone(styleBorder.left);
                    border.right = border.right || lang.clone(styleBorder.right);
                    border.top = border.top || lang.clone(styleBorder.h);
                    border.bottom = border.bottom || lang.clone(styleBorder.h);
                } else if (cellType == "WNS") {
                    border.left = border.left || lang.clone(styleBorder.left);
                    border.right = border.right || lang.clone(styleBorder.v);
                    border.top = border.top || lang.clone(styleBorder.top);
                    border.bottom = border.bottom || lang.clone(styleBorder.bottom);
                } else if (cellType == "ENS") {
                    border.left = border.left || lang.clone(styleBorder.v);
                    border.right = border.right || lang.clone(styleBorder.right);
                    border.top = border.top || lang.clone(styleBorder.top);
                    border.bottom = border.bottom || lang.clone(styleBorder.bottom);
                } else if (cellType == "WEN") {
                    border.left = border.left || lang.clone(styleBorder.left);
                    border.right = border.right || lang.clone(styleBorder.right);
                    border.top = border.top || lang.clone(styleBorder.top);
                    border.bottom = border.bottom || lang.clone(styleBorder.h);
                } else if (cellType == "WES") {
                    border.left = border.left || lang.clone(styleBorder.left);
                    border.right = border.right || lang.clone(styleBorder.right);
                    border.top = border.top || lang.clone(styleBorder.h);
                    border.bottom = border.bottom || lang.clone(styleBorder.bottom);
                } else if (cellType == "WENS") {
                    border.left = border.left || lang.clone(styleBorder.left);
                    border.right = border.right || lang.clone(styleBorder.right);
                    border.top = border.top || lang.clone(styleBorder.top);
                    border.bottom = border.bottom || lang.clone(styleBorder.bottom);
                }
                // leftNull has high priority than border.left..
                border.left = leftNull || border.left;
                border.right = rightNull || border.right;
                border.top = topNull || border.top;
                border.bottom = bottomNull || border.bottom;
            };
            var rowStyleHandler = function(styleBorder) {
                if (!styleBorder) {
                    return;
                }
                if (cellType == "N" || cellType == "T" || cellType == "B" || cellType == "NS") {
                    border.left = border.left || lang.clone(styleBorder.v);
                    border.right = border.right || lang.clone(styleBorder.v);
                    border.top = border.top || lang.clone(styleBorder.top);
                    border.bottom = border.bottom || lang.clone(styleBorder.bottom);
                } else if (cellType == "R") {
                    border.left = border.left || lang.clone(styleBorder.v);
                    border.right = border.right || lang.clone(styleBorder.right);
                    border.top = border.top || lang.clone(styleBorder.top);
                    border.bottom = border.bottom || lang.clone(styleBorder.bottom);
                } else if (cellType == "L") {
                    border.left = border.left || lang.clone(styleBorder.left);
                    border.right = border.right || lang.clone(styleBorder.v);
                    border.top = border.top || lang.clone(styleBorder.top);
                    border.bottom = border.bottom || lang.clone(styleBorder.bottom);
                } else if (cellType == "WN" || cellType == "WS" || cellType == "WNS") {
                    border.left = border.left || lang.clone(styleBorder.left);
                    border.right = border.right || lang.clone(styleBorder.v);
                    border.top = border.top || lang.clone(styleBorder.top);
                    border.bottom = border.bottom || lang.clone(styleBorder.bottom);
                } else if (cellType == "EN" || cellType == "ES" || cellType == "ENS") {
                    //				border.left  = border.left||dojo.clone(styleBorder.v);
                    border.right = border.right || lang.clone(styleBorder.right);
                    border.left = border.left || lang.clone(styleBorder.v);
                    border.top = border.top || lang.clone(styleBorder.top);
                    border.bottom = border.bottom || lang.clone(styleBorder.bottom);
                } else if (cellType == "WE" || cellType == "WEN" || cellType == "WES" || cellType == "WENS") {
                    border.right = border.right || lang.clone(styleBorder.right);
                    border.left = border.left || lang.clone(styleBorder.left);
                    border.top = border.top || lang.clone(styleBorder.top);
                    border.bottom = border.bottom || lang.clone(styleBorder.bottom);
                }
            };
            var colStyleHandler = function(styleBorder) {
                if (!styleBorder) {
                    return;
                }
                border.left = border.left || lang.clone(styleBorder.left);
                border.right = border.right || lang.clone(styleBorder.right);
                if (cellType == "WN" || cellType == "EN" || cellType == "T" || cellType == "WEN") {
                    border.top = border.top || lang.clone(styleBorder.top);
                    border.bottom = border.bottom || lang.clone(styleBorder.h);
                } else if (cellType == "WS" || cellType == "ES" || cellType == "B" || cellType == "WES") {
                    border.top = border.top || lang.clone(styleBorder.h);
                    border.bottom = border.bottom || lang.clone(styleBorder.bottom);
                } else if (cellType == "NS" || cellType == "WNS" || cellType == "ENS" || cellType == "WENS") {
                    border.top = border.top || lang.clone(styleBorder.top);
                    border.bottom = border.bottom || lang.clone(styleBorder.bottom);
                } else {
                    border.top = border.top || lang.clone(styleBorder.top) || lang.clone(styleBorder.h);
                    border.bottom = border.bottom || lang.clone(styleBorder.h);
                }
            };
            var concerCellStyleHander = function(styleBorder) {
                if (!styleBorder) {
                    return;
                }
                if (cellType == "WN" || cellType == "EN" || cellType == "WS" || cellType == "ES" ||
                    cellType == "WEN" || cellType == "WES" || cellType == "WNS" || cellType == "ENS" ||
                    cellType == "WENS") {
                    border.left = border.left || lang.clone(styleBorder.left);
                    border.right = border.right || lang.clone(styleBorder.right);
                    border.top = border.top || lang.clone(styleBorder.top);
                    border.bottom = border.bottom || lang.clone(styleBorder.bottom);
                }
            };
            var tablePerporty = this.getTable().getProperty();
            var tableBorder = tablePerporty && tablePerporty.getBorder();
            tableBorder && tablePropertyHandler(tableBorder);
            var tableStyle = tablePerporty && tablePerporty.tableStyle;
            if (!tableStyle) {
                return border;
            }
            var conditionStyle = this.getConditionStyle();
            for (var i = 0; i < conditionStyle.length; i++) {
                var styleName = conditionStyle[i];
                var style = tableStyle.getConditionStyle(styleName);
                if (style) {
                    var handler = null;
                    switch (styleName) {
                        case "lastRowFirstColumn":
                        case "lastRowLastColumn":
                        case "firstRowFirstColumn":
                        case "firstRowLastColumn":
                            handler = concerCellStyleHander;
                            break;
                        case "firstColumn":
                        case "lastColumn":
                        case "evenVBand":
                        case "oddVBand":
                            handler = colStyleHandler;
                            break;
                        case "firstRow":
                        case "lastRow":
                        case "evenHBand":
                        case "oddHBand":
                            handler = rowStyleHandler;
                            break;
                    }
                    handler(style.getBorder());
                }
            }
            var tableStyleBorder = tableStyle.getBorder();
            tableStyleBorder && tablePropertyHandler(tableStyleBorder);
            return border;

        },

        getMergedTextProperty: function() {
            if (!this.mergedTextProperty) {
                var property = this.getProperty();
                if (!property) {
                    this.mergedTextProperty = "empty";
                    return "empty";
                }
                var tableProperty = property.getTableProperty();
                if (!tableProperty) {
                    this.mergedTextProperty = "empty";
                    return "empty";
                }

                var parentTextProp = this.table.getMergedTextProperty();

                this.mergedTextProperty = tableProperty.getMergedTextProperty(this.getConditionStyle());
                if (parentTextProp && parentTextProp != "empty") {
                    if (this.mergedTextProperty == "empty")
                        this.mergedTextProperty = parentTextProp.clone();
                    else
                        this.mergedTextProperty = parentTextProp.merge(this.mergedTextProperty);
                }
                // the color in cell is higher priority than table
                var color = property.getColor();
                if (color && color["background-color"] && !this.mergedTextProperty == "empty")
                        this.mergedTextProperty.style["background-color"] = color["background-color"];
            }
            return this.mergedTextProperty;
        },
        // create a new cell with the same property 
        emptyClone: function() {
            var json = {};
            json.t = "tc";
            var tcPr = {};
            if (this.cellProperty) {
                tcPr = this.cellProperty.toJson();
                tcPr && (json.tcPr = tcPr);
            }
            json.ps = [];
            json.id = msgHelper.getUUID();
            var firstElement = this.container.getFirst();
            if (firstElement) {
                if (!ModelTools.isParagraph(firstElement)) {
                    firstElement = ModelTools.getFirstChild(firstElement, ModelTools.isParagraph, true);
                }
                var paraJson = ModelTools.getEmptyParagraphSource();
                if (firstElement) {
                    paraJson.pPr = firstElement.directProperty && firstElement.directProperty.toJson();
                    paraJson.rPr = firstElement.paraTextProperty && firstElement.paraTextProperty.toJson();
                }
                json.ps.push(paraJson);
            }
            return json;

        },
        fixEmptyCell: function(msgs){
        	if(!this.container || this.container.length() == 0)
        	{
	            var p = ModelTools.createEmptyParagraph(this);
	            this.insertAfter(p);
	            this.update();
	            msgs && msgs.push(msgCenter.createMsg(constants.MSGTYPE.Element, [msgCenter.createInsertElementAct(p)]));
        	}
        },
        // update cell
        /*
         * update the cell content. when the paragraph in the cell is updated  this function will be invoked.
         */
        changeColSpan: function(delSpan) {
            if (delSpan == 0) {
                return;
            }
            this.setColSpan(this.colSpan + delSpan);
        },
        markColSpanChanged: function(delSpan) {
            if (delSpan == 0) {
                return;
            }

            this.changeColSpan(delSpan);
            var allViews = this.getAllViews();
            for (var ownerId in allViews) {
                var viewers = allViews[ownerId];
                var firstView = viewers.getFirst();
                firstView.changeColSpan(delSpan);
            }
        },
        changeRowSpan: function(delSpan) {
            if (delSpan == 0) {
                return;
            }
            this.setRowSpan(this.rowSpan + delSpan);
        },
        markRowSpanChanged: function(delSpan) {
            if (delSpan == 0) {
                return;
            }
            this.setRowSpan(this.rowSpan + delSpan);
            var allViews = this.getAllViews();
            for (var ownerId in allViews) {
                var viewers = allViews[ownerId];
                var firstView = viewers.getFirst();
                firstView.changeRowSpan(delSpan);
            }
        },
        changeStyle: function(style, value) {
            var property = this.getProperty();
            property.setColor(style, value);
            var allViews = this.getAllViews();
            for (var ownerId in allViews) {
                var viewers = allViews[ownerId];
                var firstView = viewers.getFirst();
                while (firstView) {
                    firstView.changeStyle();
                    firstView = viewers.next(firstView);
                }

            }
            if (style == "background-color") {
                //clean model cache and reset to render
                this.clearAllCache && this.clearAllCache();
                this.container.forEach(function(c) {
                    c.markReset && c.markReset();
                });
            }
        },

        changeCornerCSSStyle: function(style) {
            var tableProperty = this.getProperty().getTableProperty();
            var t = this.getConditionStyle(false, true);
            var ret = tableProperty.compareConditionStyle(style);
            if (!t.indexOf(style) >= 0) {
                this.getProperty().setConditionStyle(style, true);
                this.clearAllCache();
                this.markCheckBorder();
            }
            if (ret) {
                this.markChangeCSSStyle();
                if (ret == 2) {
                    this.markReset();
                }
                return true;
            }
            return false;
        },
        changeCSSStyle: function(isFirstColumn, isLastColumn, isVBand, totalCellCnt, isTBRow) {
            var colIdx = this.getColIdx();
            var that = this;
            var _changeStyle = function(style) {
                var tableProperty = that.getProperty().getTableProperty();
                var t = that.getConditionStyle(false, true);
                if (style && t.indexOf(style) >= 0) {
                    return;
                }
                var ret = 0;
                var oldStyle = t[t.length - 1];
                ret = tableProperty.compareConditionStyle(oldStyle, style);
                if (ret) {
                    that.markChangeCSSStyle();
                    that.getProperty().setConditionStyle(style);
                    that.clearAllCache();
                    that.markCheckBorder();
                    if (ret == 2) {
                        that.markReset();
                    }
                    return true;
                }
                return false;
            };
            var needMsg = false;
            var conStyle = this.getProperty().conditionStyle;
            if (conStyle) {
                if (colIdx != 0 && isFirstColumn && conStyle["firstColumn"] == "1") {
                    //to be optimized (may need not reset)
                    this.getProperty().removeConditionStyle("firstColumn");
                    this.markReset();
                    needMsg = true;
                }
                // the last column style
                if (colIdx != totalCellCnt - 1 && isLastColumn && conStyle["lastColumn"] == "1") {
                    this.getProperty().removeConditionStyle("lastColumn");
                    this.markReset();
                    needMsg = true;
                }

                if (!isTBRow || colIdx != 0) {
                    if (conStyle["firstRowFirstColumn"] == "1") {
                        this.getProperty().removeConditionStyle("firstRowFirstColumn");
                        this.markReset();
                        needMsg = true;
                    } else if (conStyle["lastRowFirstColumn"] == "1") {
                        this.getProperty().removeConditionStyle("lastRowFirstColumn");
                        this.markReset();
                        needMsg = true;
                    }
                }
                if (!isTBRow || colIdx != totalCellCnt - 1) {
                    if (conStyle["firstRowLastColumn"] == "1") {
                        this.getProperty().removeConditionStyle("firstRowLastColumn");
                        this.markReset();
                        needMsg = true;
                    } else if (conStyle["lastRowLastColumn"] == "1") {
                        this.getProperty().removeConditionStyle("lastRowLastColumn");
                        this.markReset();
                        needMsg = true;
                    }
                }
            }
            if (colIdx == 0 && isFirstColumn) {
                needMsg = needMsg || _changeStyle("firstColumn");
            } else if (colIdx == totalCellCnt - 1 && isLastColumn) {
                needMsg = needMsg || _changeStyle("lastColumn");
            } else if (isVBand) {
				var step = (isFirstColumn ? 2 : 1);
                if ((colIdx + step) % 2 == 0) {
                    needMsg = needMsg || _changeStyle("evenVBand");
                } else {
                    needMsg = needMsg || _changeStyle("oddVBand");
                }
            }
            // remove oldStyle 
            // the first column style
            return needMsg;
        },
        changeCSSStyleByValue: function(conditionStyle) {
            var oldCnSt = this.getConditionStyle(false, true);
            var tableProperty = this.getProperty().getTableProperty();
            var oldStyle = oldCnSt[oldCnSt.length - 1];

            var currentConditionStyle = this.getRowConditionStyle();
            var newCnSt = this.getProperty().mergeConditionStyle(conditionStyle, null);
            var newStyle = newCnSt[newCnSt.length - 1];
            this.getProperty().setConditionStyleByValue(conditionStyle);
            this.clearAllCache();
            this.markCheckBorder();
            if (oldCnSt.length != newCnSt.length) {
                this.markReset();
            } else {
                var ret = tableProperty.compareConditionStyle(oldStyle, newStyle);
                if (ret) {
                    if (ret == 2) {
                        that.markReset();
                    }
                    this.markChangeCSSStyle();
                    if (ret == 2) {
                        this.markReset();
                    }
                    //				this.getProperty().setConditionStyleByValue(conditionStyle);
                }
            }

        },
        markInsert: function() {
            this.notifyInsertToModel();
            this.insertView();
        },
        markDelete: function() {
            this.notifyRemoveFromModel();
            this.deleteView();
        },
        markReset: function() {
            this.resetView();
        },
        insertView: function() {
            if (!this._insertViewAfter() && !this._insertViewBefore()) {
                var parent = this.parent;
                var allViewrs = parent.getAllViews();
                for (var ownerid in allViewrs) {
                    var myView = this.preLayout(ownerid);
                    var view = allViewrs[ownerid].getFirst();
                    while (view) {
                        myView.appendSel(view);
                        view = allViewrs[ownerid].next(view);
                    }
                }
            }
        },
        _insertViewAfter: function() {
            var container = this.parent.container;
            var target = container.prev(this);
            var allViewrs = target && target.getAllViews();
            while (target && !allViewrs) {
                target = container.prev(target);
                allViewrs = target && target.getAllViews();
            }
            if (allViewrs) {
                for (var ownerid in allViewrs) {
                    var myView = this.preLayout(ownerid);
                    var view = allViewrs[ownerid].getFirst();
                    if (!view) {
                        console.error("the viewer should not be null!");
                        continue;
                    }
                    view.insertAfterSel(myView);
                    view = allViewrs[ownerid].next(view);
                    while (view) {
                        myView = new CellView(this, ownerid, true);
                        myView.container = new Container(myView);
                        this.addViewer(myView, ownerid);
                        view.insertAfterSel(myView);
                        view = allViewrs[ownerid].next(view);
                    }

                }
                return true;
            }
            return false;
        },
        _insertViewBefore: function() {
            var container = this.parent.container;
            var target = container.next(this);
            var allViewrs = target && target.getAllViews();
            while (target && !allViewrs) {
                target = container.next(target);
                allViewrs = target && target.getAllViews();
            }
            if (allViewrs) {
                for (var ownerid in allViewrs) {
                    var myView = this.preLayout(ownerid);
                    var view = allViewrs[ownerid].getFirst();
                    if (!view) {
                        console.error("the viewer should not be null!");
                        continue;
                    }
                    view.insertBeforeSel(myView);
                    view = allViewrs[ownerid].next(view);
                    while (view) {
                        myView = new CellView(this, ownerid, true);
                        myView.container = new Container(myView);
                        this.addViewer(myView, ownerid);
                        view.insertBeforeSel(myView);
                        view = allViewrs[ownerid].next(view);
                    }
                }
                return true;
            }
            return false;
        },
        isContentEmpty: function() {
            if (this.container.length() <= 1) {
                var c = this.container.getFirst();
                if (c.modelType == constants.MODELTYPE.PARAGRAPH && c.text.length == 0) {
                    return true;
                }
            }
            return false;
        },
        contentTOJSON: function() {
            var ret = [];
            this.container.forEach(function(c) {
                ret.push(c.toJson(null, null, true));
            });
            return ret;
        },
        markCheckBorder: function() {
            if(this.getTable().isMatrixReady()){
                this.getTable().getTableMatrix(true).checkCellBorderChange(this);
            }
            var allViews = this.getAllViews();
            for (var ownerId in allViews) {
                var viewers = allViews[ownerId];
                var firstView = viewers.getFirst();
                while (firstView) {
                    firstView.hasLayouted() && firstView.toCheckBorder(true);
                    firstView = viewers.next(firstView);
                }
            }
        },
        getPrevious: function(type) {
            var curRow = this.parent;
            var prevCell = null;
            if (!type || type == "row" || type == "table")
                prevCell = curRow.cells.prev(this);
            else if (type == "col") {
				var matrix = this.getTable().getTableMatrix(true);
                prevCell = matrix.getPreviousCell(this, true);
            }
            if (!prevCell && type && type == "table") {
                var prevRow = curRow.parent.rows.prev(curRow);
                if (prevRow)
                    prevCell = prevRow.container.getLast();
            }
            return prevCell;
        },
        getNext: function(type) {
            var curRow = this.parent;
            var nextCell = null;
            if (!type || type == "row" || type == "table")
                nextCell = curRow.cells.next(this);
            else if (type == "col") {
				var matrix = this.getTable().getTableMatrix(true);
                nextCell = matrix.getNextCell(this, true);
            }
            if (!nextCell && type && type == "table") {
                var nextRow = curRow.parent.rows.next(curRow);
                if (nextRow)
                    nextCell = nextRow.container.getFirst();
            }
            return nextCell;
        },
        triggerTrackInfoUpdate: function(mode) {
   			topic.publish("/trackChange/update", this.parent, "reset", "table");
        },
        getTrackedGroupItems: function(prev, next, startTime, endTime) {
            var objs = [this];
            var tc = trackChange;
            var change = tc.getLastChangeInfo(this, "tcPr");
            if (prev) {
                var prevCell = this.getContinuedPrevCell(change, startTime, endTime);
                if (prevCell) {
                    var prevCells = prevCell.getTrackedGroupItems(true, false, startTime, endTime);
                    Array.prototype.unshift.apply(objs, prevCells);
                }
            }
            if (next) {
                var nextCell = this.getContinuedNextCell(change, startTime, endTime);
                if (nextCell)
                    objs = objs.concat(nextCell.getTrackedGroupItems(false, true, startTime, endTime));
            }
            return objs;
        },
        getContinuedPrevCell: function(ch, startTime, endTime) {
            var tc = trackChange;
            var prevCell = this.getPrevious("table");
            while (prevCell) {
                var prevTcPrCh = tc.getLastChangeInfo(prevCell, "tcPr");
                if (prevTcPrCh && prevTcPrCh.t == ch.t && prevTcPrCh.u == ch.u)
                    return prevCell;
                else
                    prevCell = prevCell.getPrevious("table");
            }
            return null;
        },
        getContinuedNextCell: function(ch, startTime, endTime) {
            var tc = trackChange;
            var nextCell = this.getNext("table");
            while (nextCell) {
                var nextTcPrCh = tc.getLastChangeInfo(nextCell, "tcPr");
                if (nextTcPrCh && nextTcPrCh.t && ch.t && nextTcPrCh.u && ch.u && nextTcPrCh.t == ch.t && nextTcPrCh.u == ch.u)
                    return nextCell;
                else
                    nextCell = nextCell.getNext("table");
            }
            return null;
        },
        deleteInTrack: function() {
            // when delete row, not to delete paragraphs inside cells.
            return;
        },
		isVisibleInTrack: function(){
			return this.parent.visible;
		},        
        rejectPropertyChange: function() {

        }

    };
    tools.extend(Cell.prototype, new TableBase());

    Model.prototype.viewConstructors[Cell.prototype.modelType] = CellView;

    return Cell;
});
