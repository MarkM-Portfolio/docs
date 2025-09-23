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
    "writer/model/prop/RowProperty",
    "writer/model/table/Cell",
    "writer/msg/msgCenter",
    "writer/msg/msgHelper",
    "writer/model/table/TableBase",
    "writer/track/trackChange",
    "writer/util/ModelTools"
], function(array, lang, topic, Container, tools, constants, RowProperty, Cell, msgCenter, msgHelper, TableBase, trackChange, ModelTools) {

    var Row = function(json, table) {
        this.parent = table;
        this.init(json);
    };
    Row.prototype = {
        modelType: constants.MODELTYPE.ROW,
        init: function(json) {
            this.id = json.id;
            this.container = this.cells = new Container(this);
            var trPr = json.trPr;
            this.rowProperty = new RowProperty(trPr, this);
            if (trPr && trPr.trHeight) {
                this.h = this.rowProperty.h;
            }
            this.trPrCh = json.trPrCh;
            this.ch = json.ch;
            this.deleted = false;
			this.visible = this.isVisibleInTrack();

            var cells = json.tcs;
            if (cells) {
                for (var i = 0; i < cells.length; i++) {
                    var cell = new Cell(cells[i], this, this.parent);
                    cell && this.cells.append(cell);
                }
            }
        },
        clearMergedCell: function() {
            var cell = this.cells.getFirst();
            while (cell) {
                var next = this.cells.next(cell);
                if (cell.isMergedCell()) {
                    this.cells.remove(cell);
                }
                cell = next;
            }
        },
        getBoxHeight: function() {
            return this.h || 0;
        },
        getRowIdx: function() {
            return this._rowIdx;
        },
		getVRowIdx:function(){
			if(this._vRowIdx)
				return this._vRowIdx;
			else
				return this.getRowIdx();
		},
        getProperty: function() {
            return this.rowProperty;
        },
        toJson: function(startColumn, endColumn, asFirstRow) {
            startColumn = startColumn || 0;
            endColumn = (endColumn != undefined) ? endColumn : this.parent.getColumnCount();
            var tr = {};
            tr.tcs = [];
            tr.t = "tr";
            tr.id = this.id;
            tr.trPr = this.rowProperty && this.rowProperty.toJson();
            if (!tr.trPr) {
                delete tr.trPr;
            }
            if (this.ch && !tools.isEmpty(this.ch))
                tr["ch"] = this.ch;
            if (this.trPrCh && !tools.isEmpty(this.trPrCh))
                tr["trPrCh"] = this.trPrCh;

			var tableMatrix = this.parent.getTableMatrix(true);
            var cells = tableMatrix.getRowMatrix(this);
            for (var i = startColumn; i < endColumn; i++) {
                if (i > 0 && cells[i] == cells[i - 1]) {
                    continue;
                }
                var cell = cells[i];
                if (!this.cells.contains(cell)) {
                    if (asFirstRow) {
                        tr.tcs.push(cell.emptyClone());
                    } else {
                        tr.tcs.push(this.creatVMergedCell(cell));
                    }


                } else {
                    tr.tcs.push(cell.toJson());
                }
            }
            return tr;
        },
        creatVMergedCell: function(cell) {
            var json = {};
            json.tcPr = {};
            json.tcPr.vMerge = {};
            json.t = "tc";
            if (cell && cell.getColSpan() > 1) {
                json.tcPr.gridSpan = {};
                json.tcPr.gridSpan.val = cell.getColSpan();
            }
			var tableMatrix = this.parent.getTableMatrix(true);
            if (tableMatrix) {
                var leftBorder = tableMatrix.getBorder(this.getRowIdx(), cell.getColIdx());
                var rightBorder = tableMatrix.getBorder(this.getRowIdx(), cell.getColIdx() + cell.getColSpan() - 1);
                if(leftBorder) {
                    json.tcPr.tcBorders = leftBorder;
                }
                if (rightBorder && rightBorder != leftBorder) {
                    json.tcPr.tcBorders = json.tcPr.tcBorders || {};
                    if (!rightBorder.right)
                        delete json.tcPr.tcBorders.right;
                    else
                        json.tcPr.tcBorders.right = rightBorder.right;
                } else if (!rightBorder && json.tcPr.tcBorders) {
                	delete json.tcPr.tcBorders.right;
                }
            }
            return json;
        },
        emptyClone: function(after) {
			var tableMatrix = this.parent.getTableMatrix(true);
            var cells = tableMatrix.getRowMatrix(this);
            var json = {};
            json.id = msgHelper.getUUID();
            var trPr = null;
            if (this.rowProperty) {
                trPr = this.rowProperty.toJson();
            }
            json.trPr = trPr;
            json.tcs = [];
            var nextRow = this.parent.rows.next(this);
            var nextCells = nextRow && tableMatrix.getRowMatrix(nextRow) || [];
            for (var i = 0; i < cells.length; i++) {
                if (cells[i] == cells[i - 1]) {
                    continue;
                }
                var cell = cells[i];
                var cellJson = cell.emptyClone();
                if (cellJson.tcPr) {
                    //fix boders
                    if (after && cellJson.tcPr.tcBorders)
                        cellJson.tcPr.tcBorders.top = cellJson.tcPr.tcBorders.bottom;
                    if (!after && cellJson.tcPr.tcBorders)
                        cellJson.tcPr.tcBorders.bottom = cellJson.tcPr.tcBorders.top;
                    if (this.cells.contains(cell) && !after || nextCells[i] != cell && after) {
                        delete cellJson.tcPr.vMerge;
                    } else if (cellJson.tcPr.vMerge) {
                        delete cellJson.tcPr.vMerge.val;
                    }
                }
                json.tcs.push(cellJson);
            }
            return json;
        },
        changeCSSStyle: function(style, isFirstColumn, isLastColumn, isVBand, isTBRow) {
            var acts = [];
            if (isFirstColumn || isLastColumn || isVBand) {
				var cnt = this.parent.getTableMatrix(true).length2();
                this.cells.forEach(function(cell) {
                    var cCnStOld = lang.clone(cell.getProperty().getConditionStyle());
                    var needMsg = cell.changeCSSStyle(isFirstColumn, isLastColumn, isVBand, cnt, isTBRow);
                    if (!needMsg) return;
                    var cCnStNew = cell.getProperty().getConditionStyle();
                    var cStN = {
                            type: 'cnSt',
                            v: cCnStNew
                        },
                        cStO = {
                            type: 'cnSt',
                            v: cCnStOld
                        };
                    acts.push(msgCenter.createSetAttributeAct(cell, cStN, cStO, null, null));
                });
            }
            var oldStyle = this.getConditionStyle()[0];
            var tableProperty = this.parent.getProperty();
            var ret = tableProperty.compareConditionStyle(oldStyle, style);
            if (ret) {
                //				this.markChangeStyle();
                this.cells.forEach(function(cell) {
                    cell.markChangeCSSStyle();
                });
                var rCnStOld = lang.clone(this.getProperty().getConditionStyle());
                this.getProperty().setConditionStyle(style);
                this.clearAllCache();
                var rCnStNew = this.getProperty().getConditionStyle();
                var rStN = {
                        type: 'cnSt',
                        v: rCnStNew
                    },
                    rStO = {
                        type: 'cnSt',
                        v: rCnStOld
                    };
                !rCnStOld && delete rStO.v;
                !rCnStNew && delete rStN.v;
                acts.push(msgCenter.createSetAttributeAct(this, rStN, rStO, null, null));
                if (ret == 2) {
                    this.markReset();
                }
                this.checkRowBorder();
            }
            return acts;

        },
        changeCSSStyleByValue: function(conditionStyle) {
            var oldStyle = this.getConditionStyle()[0];
            var newStyle = this.getProperty().mergeConditionStyle(conditionStyle)[0];
            var tableProperty = this.parent.getProperty();
            var ret = tableProperty.compareConditionStyle(oldStyle, newStyle);
            if (ret) {
                this.getProperty().setConditionStyleByValue(conditionStyle);
                this.clearAllCache();
                this.cells.forEach(function(cell) {
                    cell.markChangeCSSStyle();
                });
                if (ret == 2) {
                    this.markReset();
                }
                this.checkRowBorder();
            }
        },
        markWidthChange: function(colIdxs) {
            var cell = this.container.getFirst();
            var cellHitHandler = function(idx) {
                return cell.getColIdx() <= idx && cell.getColIdx() + cell.getColSpan() >= idx;
            };
            while (cell) {
                // cells contain the idx (the cell may be merged) should be update
                var hit = array.some(colIdxs, cellHitHandler);
                if (hit)
                    cell.markCheckBorder && cell.markCheckBorder(true);
                cell = cell.next();
            }
            var allViews = this.getAllViews();
            for (var ownerId in allViews) {
                var viewers = allViews[ownerId];
                var firstView = viewers.getFirst();
                while (firstView) {
                    firstView.hasLayouted() && firstView.widthChange(colIdxs);
                    firstView = viewers.next(firstView);
                }
            }
        },
        resizeHeight: function(delH) {
            if (Math.abs(delH) <= 3) {
                return false;
            }
            var oldH = 0;
            var allViews = this.getAllViews();
            for (var ownerId in allViews) {
                var viewers = allViews[ownerId];
                var firstView = viewers.getFirst();
                oldH = firstView.getBoxHeight();
                break;
            }
            var newH = oldH + delH;
            if (newH < 10) {
                return false;
            }
            this.h = newH;
            this.rowProperty.setHeight(this.h);
            return this.markHeightChange();
        },
        setHeight: function(newH) {
            this.h = newH;
            this.rowProperty.setHeight(this.h);
            return this.markHeightChange();
        },
        setTblHeaderRepeat: function(value) {
            this.rowProperty.setTblHeaderRepeat(value);
            this.markHeadRepeat();
            this.parent.update();
        },
        // there are two return values: true, "none" .
        isTblHeaderRepeat: function() {
            return this.rowProperty.getTblHeaderRepeat();
        },
        markHeightChange: function() {
            var allViews = this.getAllViews();
            for (var ownerId in allViews) {
                var viewers = allViews[ownerId];
                var firstView = viewers.getFirst();
                firstView.resizeHeight();
            }
            return true;
        },
        markHeadRepeat: function() {
            var allViews = this.getAllViews();
            for (var ownerId in allViews) {
                var viewers = allViews[ownerId];
                var firstView = viewers.getFirst();
                firstView.repeatHead();
            }
            return true;
        },
        markInsert: function() {
            this.notifyInsertToModel();
            this.clearMergedCell();
            this.insertView();
        },
        markDelete: function() {
            this.notifyRemoveFromModel();
            this.deleteView();
        },
        markReset: function() {
            this.resetView();
        },
        update: function(forceExecu) {
            if (forceExecu) {
                this.suspendUpdate();
                return;
            }
        },
        isCrossPage: function() {
            var allViewrs = this.getAllViews();
            if (allViewrs) {
                for (var ownerid in allViewrs) {
                    if (allViewrs[ownerid].length() > 1) {
                        return true;
                    }
                }
                return false;
            }
        },
        getRowMatrix: function() {
			return this.parent.getTableMatrix(true).getRowMatrix(this);
        },
        getItemByIndex: function(index) {
            if (index >= this.cells.length()) {
                return null;
            }
            return this.cells.getByIndex(index);
        },
        checkRowBorder: function() {
			var tableMatrix = this.parent.getTableMatrix(true);
            var cells = tableMatrix.getRowMatrix(this);
            array.forEach(cells, function(cell) {
                cell.markCheckBorder();
            });
        },
        containsRowSpanCell: function(){
        	if(this.cells.length()<this.parent.cols.length)
        		return true;
        	for(var i=0;i<this.cells.length();i++)
        	{
        		var cell = this.cells.getByIndex(i);
        		var rs = cell.getRowSpan();
        		if(rs && rs>1)
        			return true;
        	}

        	return false;
        },
        triggerTrackInfoUpdate: function(mode) {
    		var m = mode || "reset";
    		if(m == "markDel")
    			this.deleted = true;
    		else if(m == "delete")
    			topic.publish("/trackChange/update", this, m, "table");
    		else
    			topic.publish("/trackChange/update", this.parent, "reset", "table");
        },
		isVisibleInTrack: function(){
			var isDelShow = this.parent.showDel;// trackChange.isShow("del")
			if (isDelShow)
				return true;
			else
			{
				var isDeleted = this.isTrackDeleted();
				if (isDeleted)
					return false;
			}
			return true;
		},        
        deleteInTrack: function(fromParent) {
            var msgs = [];

            if (!this.ch)
                this.ch = [];

            if (this.isTrackDeleted(this.ch)) {
                // deleted already.
            } else if (this.isTrackInsertedByMe(this.ch)) {
                // will not be called, unless just remove row myself.
                return true;
            } else {
                var oldChanges = lang.clone(this.ch);
                var data = trackChange.createChange("del");
                this.ch.push(data);
                var msg = msgCenter.createMsg(constants.MSGTYPE.Attribute, [msgCenter.createSetAttributeAct(this, null, null, {
                    "type": "trCh",
                    "ch": this.ch
                }, {
                    "type": "trCh",
                    "ch": oldChanges
                })]);
                msgs.push(msg);
            }
			this.triggerTrackInfoUpdate();
            this.markDirty();
            return msgs;
        },

        getTrackedGroupItems: function(prev, next, startTime, endTime) {
            var objs = [this];
            var tc = trackChange;
            var change = tc.getLastChangeInfo(this);
            if (prev) {
                var prevObj = this.getContinuedPrevObj(change, startTime, endTime);
                if (prevObj) {
                    var prevObjs = (prevObj.modelType == constants.MODELTYPE.ROW) ? prevObj.getTrackedGroupItems(true, false, startTime, endTime) :
                        prevObj.getTrackedGroupParas(true, false, startTime, endTime);
                    Array.prototype.unshift.apply(objs, prevObjs);
                }
            }
            if (next) {
                var nextObj = this.getContinuedNextObj(change, startTime, endTime);
                if (nextObj) {
                    var nextObjs = (nextObj.modelType == constants.MODELTYPE.ROW) ? nextObj.getTrackedGroupItems(false, true, startTime, endTime) :
                        nextObj.getTrackedGroupParas(false, true, startTime, endTime);
                    objs = objs.concat(nextObjs);
                }
            }

            return objs;
        },
        getContinuedPrevObj: function(ch, startTime, endTime) {
        	if(!ch)
        		return;
            var tc = trackChange;
            var prevCh = null;
            var prevObj = this.parent.rows.prev(this);
            if (prevObj)
                prevCh = tc.getLastChangeInfo(prevObj);

            if (prevObj && prevCh && prevCh.t == ch.t && prevCh.u == ch.u) {
                var inTimes = (startTime ? (prevCh.d >= startTime) : true) && (endTime ? (prevCh.d <= endTime) : true);
                if (inTimes)
                    return prevObj;
            }
            return;
        },
        getContinuedNextObj: function(ch, startTime, endTime) {
        	if(!ch)
        		return;

            var tc = trackChange;
            var nextCh = null;
            var nextObj = this.parent.rows.next(this);
            if (nextObj)
            	 nextCh = tc.getLastChangeInfo(nextObj);              

            if (nextObj && nextCh && nextCh.t == ch.t && nextCh.u == ch.u) {
                var inTimes = (startTime ? (nextCh.d >= startTime) : true) && (endTime ? (nextCh.d <= endTime) : true);
                if (inTimes)
                    return nextObj;
            }
            return;
        }
    };
    tools.extend(Row.prototype, new TableBase());
    return Row;
});
