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
    "dojo/string",
    "dojo/_base/array",
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/dom-class",
    "dojo/dom-style",
    "dojo/has",
    "dojo/i18n!concord/widgets/nls/menubar",
    "dojo/i18n!writer/nls/lang",
    "dojo/topic",
    "concord/util/BidiUtils",
    "concord/util/browser",
    "writer/util/ViewTools",
    "writer/constants",
    "concord/widgets/ResizePropDlg",
    "writer/ui/dialog/TableProp",
    "writer/common/Container",
    "writer/common/tools",
    "writer/msg/msgHelper",
    "writer/msg/msgCenter",
    "writer/core/Range",
    "writer/core/Event",
    "writer/model/Paragraph",
    "writer/model/table/Row",
    "writer/model/table/Table",
    "writer/plugins/Plugin",
    "writer/plugins/TableResizer",
    "writer/ui/menu/Menu",
    "writer/ui/widget/SplitCell",
    "writer/ui/widget/ColorPalette",
    "writer/util/CellBorderTools",
    "writer/util/HelperTools",
    "writer/util/ModelTools",
    "writer/util/RangeTools",
    "writer/util/TableTools",
    "writer/track/trackChange",
    "dijit/registry",
    "dijit/PopupMenuItem",
    "dijit/CheckedMenuItem",
    "dijit/MenuItem"
], function(has, dojoString, arrayModule, declare, lang, domClass, domStyle, has, i18nmenubar, i18nlang, topic, BidiUtils, browser, ViewTools, constants, ResizePropDlg, TableProp, Container, tools, msgHelper, msgCenter, Range, Event, Paragraph, Row, Table, Plugin, TableResizer, Menu, SplitCell, ColorPalette, CellBorderTools, HelperTools, ModelTools, RangeTools, TableTools, trackChange, registry, PopupMenuItem, CheckedMenuItem, MenuItem) {

    var TablePlugin = declare("writer.plugins.Table", Plugin, {
        createTable: function(row, col) {
            var selection = pe.lotusEditor.getSelection();
            var ranges = selection.getRanges();
            var range = ranges[0];
            if (!RangeTools.canDo(ranges)) {
                /*if the range is crossing more than one footnote/endnote, it can not delete anything.				 */
                return;
            }
			var startModelObj = range.getStartModel().obj;
			var endModelObj = range.getEndModel().obj;
			if(this.inTable(startModelObj)||this.inTable(endModelObj)){
                return;
            }
            var tableContainer = ViewTools.getTableContainer(range.getStartView().obj);
            if (!tableContainer) {
                return;
            }
            var docWidth = tableContainer.getWidth && tableContainer.getWidth(true) || 528;
            docWidth -= 5;
            if (row && col) {
                this.rowCount = row;
                this.colCount = col;
            } else {
                this.rowCount = 4;
                this.colCount = 3;
            }

            var json = {};
            json.tblPr = {
                "tblBorders": {},
                "tblLook": {},
                "tblpPr": {},
                "tblW": {}
            };
            json.tblPr.tblBorders = {
                left: {
                    sz: "1pt",
                    val: "single",
                    color: "auto"
                },
                right: {
                    sz: "1pt",
                    val: "single",
                    color: "auto"
                },
                top: {
                    sz: "1pt",
                    val: "single",
                    color: "auto"
                },
                bottom: {
                    sz: "1pt",
                    val: "single",
                    color: "auto"
                },
                insideH: {
                    sz: "1pt",
                    val: "single",
                    color: "auto"
                },
                insideV: {
                    sz: "1pt",
                    val: "single",
                    color: "auto"
                }
            };
            json.id = msgHelper.getUUID();
            json.tblGrid = [];
            var avgWidth = docWidth / this.colCount;
            for (var k = 0; k < this.colCount; k++) {
                json.tblGrid.push({
                    "w": avgWidth
                });
            }
            json.trs = [];
			var isTrackable = trackChange.isOn() && ModelTools.isTrackable(startModelObj);
            for (var i = 0; i < this.rowCount; i++) {
                var tcs = [];
                for (var j = 0; j < this.colCount; j++) {
					var obj = {
                        "id": msgHelper.getUUID(),
                        "tcPr": {
                            "tcBorders": {
                                "left": {
                                    "sz": "1pt",
                                    "val": "single",
                                    "color": "auto"
                                },
                                "right": {
                                    "sz": "1pt",
                                    "val": "single",
                                    "color": "auto"
                                },
                                "top": {
                                    "sz": "1pt",
                                    "val": "single",
                                    "color": "auto"
                                },
                                "bottom": {
                                    "sz": "1pt",
                                    "val": "single",
                                    "color": "auto"
                                }
                            }
                        },
                        "ps": [{
                            "t": "p",
                            "id": msgHelper.getUUID(),
                            // remove firstLine indent if default para style has
                            "pPr": {
                                "t": "pPr",
                                "indent": {
                                    "firstLine": "0pt",
                                    "left": "0pt",
                                    "right": "0pt"
                                }
                            }
                        }]
                    };
					tcs.push(obj);
                }
                json.trs.push({
                    "id": msgHelper.getUUID(),
                    "tcs": tcs,
                    "trPr": {
                        "trHeight": "23.50pt"
                    }
                });
                if (isTrackable)
                {
                	dojo.forEach(json.trs, function(r){
                		r.ch = [trackChange.createChange("ins")];
                	});
                	json.ch = [trackChange.createChange("ins")];
                }
            }
            var tbl = new Table(json, this.editor.document);
            tbl.setTask(HelperTools.getSelectedTaskId());
            var msgs = [];
            if (!range.isCollapsed()) {
                msgs = range.deleteContents(true, true);
            }

            var start = range.getStartParaPos();
            if (!start)
                return false;
            var para = start.obj;
            var index = start.index;
            if (para.getVisibleIndex(index) == 0)
                index = 0;

            var parent = para.parent;
            if (index == 0) {
                // if the inserted table next to or previous to a table, it needs to insert a empty paragraph.
                var prevModel = para.previous();
                if (prevModel && ModelTools.isTable(prevModel)) {
                    var newPara = para.split(0);
                    if (para.getFixedTarget)
                        para = para.getFixedTarget();
                    parent.insertBefore(newPara, para);
                    msgs.push(msgCenter.createMsg(constants.MSGTYPE.Element, [msgCenter.createInsertElementAct(newPara)]));
                }

                parent.insertBefore(tbl, para);
                msgs.push(msgCenter.createMsg(constants.MSGTYPE.Element, [msgCenter.createInsertElementAct(tbl)]));
            } else {
                var newPara = para.split(index, msgs);
                if (para.getFixedTarget)
                    para = para.getFixedTarget();
                parent.insertAfter(tbl, para);
				if(isTrackable)
					msgs = msgs.concat(para.createBreakInTrack());
                msgs.push(msgCenter.createMsg(constants.MSGTYPE.Element, [msgCenter.createInsertElementAct(tbl)]));
                parent.insertAfter(newPara, tbl);
                if (ModelTools.isTrackBlockGroup(newPara))
                    newPara = newPara.getFirstPara(true);
                msgs.push(msgCenter.createMsg(constants.MSGTYPE.Element, [msgCenter.createInsertElementAct(newPara)]));
            }
            //		selection.store();
            para.parent.update();

            // TODO Move cursor to the first paragraph in table.
            //		selection.restore();
            if (msgs.length > 0)
                msgCenter.sendMessage(msgs);
            return tbl;
        },
        deleteTable: function(table) {
            //check if the table contain assignment
            //		if(!writer.util.HelperTools.canTaskDelete()){
            //			var nls = dojo.i18n.getLocalization("concord.widgets","CKResource");
            //			window.pe.scene.showWarningMessage(nls.coediting.forbiddenInput,10000);
            //			return ;
            //		}
            var selection = pe.lotusEditor.getSelection(),
                ranges = selection.getRanges();
            var msgs = [];
            var parent = table.parent;
            var nextPara = table.next();
            var prevPara = table.previous();
            ModelTools.removeBlock(table, ranges[0], msgs);
            if (trackChange.isOn() && !has("trackGroup") && ModelTools.isTrackable(table)) {
                if (!table.isAllInsByMe()) {
                    var msg;
                    if (ModelTools.isParagraph(nextPara))
                        msg = nextPara.insertTrackDeletedObjs([table], true);
                    else if (ModelTools.isParagraph(prevPara))
                        msg = prevPara.insertTrackDeletedObjs([table]);
                    else
                        console.warn("table should be nearby with a paragraph");
                    msg && msgs.push(msg);
                }
                else
                {
                    table.triggerTrackInfoUpdate("delete");
                }
            }
            parent && parent.update();
            //append the comment del msg
            var cmtMsgs = pe.lotusEditor.relations.commentService.checkCommentsDelete();
            if (cmtMsgs.length > 0);
            msgs = msgs.concat(cmtMsgs);
            msgCenter.sendMessage(msgs);
        },
        insertCol: function(targetCol, type, cnt) {
			//TODO: update track change group, and if non-deleted col, add insert info for para?
            if (cnt == null || cnt < 1) {
                cnt = 1;
            }
			var msgs = [], actPairList = [];
            var table = targetCol.getTable();
			var tableMatrix = table.getTableMatrix(true);
            var targetColIdx = targetCol.getColIdx();
            var desColIdx = targetColIdx;
            if (type == "after") {
                desColIdx = targetColIdx + targetCol.getColSpan();
            }
            var oldCols = table.cols.slice(0);
            table.insertColumnW(targetColIdx, cnt);
            var newCols = table.cols;

            var oldColsObj = [],
                newColsObj = [];
            for (var i in oldCols) {
                oldColsObj[i] = {};
                oldColsObj[i].t = "gridCol";
                oldColsObj[i].w = tools.PxToPt(oldCols[i]) + "pt";
            }
            for (var j in newCols) {
                newColsObj[j] = {};
                newColsObj[j].t = "gridCol";
                newColsObj[j].w = tools.PxToPt(newCols[j]) + "pt";
            }
            //action: set attribute
            var newAttrs = {
                    "cols": newColsObj
                },
                oldAttrs = {
                    "cols": oldColsObj
                };
            actPairList.push(msgCenter.createSetAttributeAct(table, null, null, newAttrs, oldAttrs));
            for (var i = 0; i < cnt; i++) {
                var rows = table.rows;
                var currentRow = rows.getFirst();
                var newCells = [];
                while (currentRow) {
                    var cells = tableMatrix.getRowMatrix(currentRow);
                    var leftCell = null;
                    var rightCell = null;
                    var targetCell = cells[targetColIdx];
                    if (type == "before") {
                        leftCell = cells[targetColIdx - 1];
                        rightCell = targetCell;
                    } else {
                        leftCell = targetCell;
                        rightCell = cells[desColIdx];
                    }
                    if (leftCell == rightCell) {
                        //if(currentRow.cells.contains(targetCell)){//in server side, only set the nwcell colspan
                        newCells.push({
                            hMerged: true
                        });
                        //}else{
                        //	newCells.push({});
                        //}
                    } else {
                        var cellJson = targetCell.emptyClone();
                        if (cellJson.tcPr) {
                            if (cellJson.tcPr.tcBorders) {
                                if (type == "before")
                                    cellJson.tcPr.tcBorders.right = cellJson.tcPr.tcBorders.left;
                                else
                                    cellJson.tcPr.tcBorders.left = cellJson.tcPr.tcBorders.right;
                            }
                            delete cellJson.tcPr.gridSpan;
                            delete cellJson.tcPr.vMerge;
                        }
                        newCells.push({
                            cnt: cellJson
                        });
                    }
                    currentRow = table.rows.next(currentRow);
                }
                actPairList.push(msgCenter.createInsertColumn(table, desColIdx, newCells));
                table.insertColumn(desColIdx, newCells);
            }
            var tmpActs = table.updateConditonStyle("col");
            actPairList = actPairList.concat(tmpActs);
            table.update();
            msgs.push(msgCenter.createTableMsg(table.id, actPairList));
            msgCenter.sendMessage(msgs);
        },
        deleteCol: function(targetCells) {
			//TODO: update track change group
            var table = targetCells[0].getTable();
            var msgs = [],
                actPairList = [];
            var rows = table.rows;
            for (var i = 0; i < targetCells.length; i++) {
				var tableMatrix = table.getTableMatrix(true);
                var targetCell = targetCells[i];
                var targetColIdx = targetCell.getColIdx();
                var currentRow = rows.getFirst();
                var newCells = [];
                var fixCells = {};
                var noFix = targetCell.getRowSpan() == tableMatrix.length();
                while (currentRow) {
                    var cells = tableMatrix.getRowMatrix(currentRow);
                    var targetCell = cells[targetColIdx];
                    var rowIdx = currentRow.getRowIdx();
                    if (targetCell.getColIdx() != targetColIdx) {
                        newCells.push({
                            hMerged: true
                        });
                    } else if (!currentRow.cells.contains(targetCell)) {
                        newCells.push({
                            vMerged: true
                        });
                        if (targetCell.getColSpan() > 1 && !noFix) {
                            var fixCell = targetCell.emptyClone();
                            if (fixCell.tcPr && fixCell.tcPr.vMerge) {
                                delete fixCell.tcPr.vMerge.val;
                            }
                            fixCell.tcPr.gridSpan.val = targetCell.getColSpan() - 1;
                            fixCells[rowIdx] = fixCell;
                        }
                    } else {
                        var cellJson = targetCell.toJson();
                        if (!noFix) {
                            if (cellJson.tcPr) {
                                delete cellJson.tcPr.gridSpan;
                                delete cellJson.tcPr.vMerge;
                            }
                            if (targetCell.getColSpan() > 1) {
                                var fixCell = targetCell.emptyClone();
                                if (fixCell.tcPr && fixCell.tcPr.vMerge) {
                                    delete fixCell.tcPr.vMerge.val;
                                }
                                fixCell.tcPr.gridSpan.val = targetCell.getColSpan() - 1;
                                fixCells[rowIdx] = fixCell;
                            }
                        }
                        newCells.push({
                            cnt: cellJson
                        });
                    }
                    currentRow = table.rows.next(currentRow);
                }
                actPairList.push(msgCenter.createDeleteColumn(table, targetColIdx, newCells, fixCells));
                table.deleteColumn(targetColIdx, newCells, fixCells);
            }
            var oldCols = table.cols.slice(0);
            var delColCnt = 0;
            for (var i = 0; i < targetCells.length; i++) {
                var targetCell = targetCells[i];
                if (targetCell.getRowSpan() == tableMatrix.length()) {
                    delColCnt += targetCell.getColSpan();
                } else {
                    delColCnt++;
                }
            }
            table.deleteColumnW(targetColIdx, delColCnt);
            var newCols = table.cols;
            var oldColsObj = [],
                newColsObj = [];
            for (var i in oldCols) {
                oldColsObj[i] = {};
                oldColsObj[i].t = "gridCol";
                oldColsObj[i].w = tools.PxToPt(oldCols[i]) + "pt";
            }
            for (var j in newCols) {
                newColsObj[j] = {};
                newColsObj[j].t = "gridCol";
                newColsObj[j].w = tools.PxToPt(newCols[j]) + "pt";
            }
            //action: set attribute
            var newAttrs = {
                    "cols": newColsObj
                },
                oldAttrs = {
                    "cols": oldColsObj
                };
            actPairList.push(msgCenter.createSetAttributeAct(table, null, null, newAttrs, oldAttrs));
            var tmpActs = table.updateConditonStyle("col");
            actPairList = actPairList.concat(tmpActs);
            msgs.push(msgCenter.createTableMsg(table.id, actPairList));
            table.update();
            //append the comment del msg
            var cmtMsgs = pe.lotusEditor.relations.commentService.checkCommentsDelete();
            if (cmtMsgs.length > 0);
            msgs = msgs.concat(cmtMsgs);
            msgCenter.sendMessage(msgs);
        },
        insertRow: function(targetRow, type, cnt) {
            if (cnt == null || cnt < 1) {
                cnt = 1;
            }
            var acts = [], msgs = [];
            var table = targetRow.parent;
            var prevRow = targetRow;
            if (type == "before") {
                prevRow = table.rows.prev(targetRow);
            }
			var isTrackable = trackChange.isOn() && ModelTools.isTrackable(table);
            for (var i = 0; i < cnt; i++) {
                var newRow = new Row(targetRow.emptyClone(type == "after"), table);
				if (isTrackable)
				{
					newRow.ch = [trackChange.createChange("ins")];
                    /*
					newRow.container.forEach(function(cell){
						var p  = cell.container.getFirst();
						if(p && p.modelType == constants.MODELTYPE.PARAGRAPH)
							p.rPrCh =[trackChange.createChange("ins")];
					});
                    */
				}
	            table.insertRow(newRow, prevRow);
	            acts.push(msgCenter.createInsertRowAct(newRow));
	            if(table.isAllDeletedInTrack())
	            {
	            	var m1 = table.delDelChangeInfo();
	           		m1 && msgCenter.sendMessage([m1]);
	           		if (isTrackable)
	           			table.triggerTrackInfoUpdate();
	            }
            }
            var tmpActs = table.updateConditonStyle("row");
            acts = acts.concat(tmpActs);
            table.update();
            msgCenter.sendMessage([msgCenter.createTableMsg(table.id, acts)]);
        },
        deleteRow: function(targetRows, noMessage) {
            var table = targetRows[0].parent;
            var acts = [],delInTrackRows = [],trackedRows = [];
            msgCenter.beginRecord();
            delInTrackRows = targetRows;  
           
			var avaiRows = table.getAvailableRows();
			if(delInTrackRows.length<=0)
			{
				if(trackedRows.length >0 && avaiRows == 0)//table deleted
				{
					msgCenter.sendMessage([table.addDelChangeInfo()]);
					table.triggerTrackInfoUpdate();
				}

				table.update();
				msgCenter.endRecord();	
				return acts;
			}
			else if(table.rows.length() > delInTrackRows.length 
					&& (delInTrackRows.length == avaiRows.length))//table deleted
			{
				msgCenter.sendMessage([table.addDelChangeInfo()]);
				table.triggerTrackInfoUpdate();
			}

			for(var k=0;k< delInTrackRows.length;k++)
			{
				var targetRow = delInTrackRows[k];
				var tableMatrix = table.getTableMatrix(true);
                var cells = tableMatrix.getRowMatrix(targetRow);
                var fixCells = {};
                for (var i = 0; i < cells.length; i++) 
                {
                    if (cells[i] == cells[i - 1])
                        continue;

                    if (targetRow.cells.contains(cells[i]) && cells[i].isMergedStart() && cells[i].getRowSpan() > 1) 
                        fixCells[i] = cells[i].emptyClone();
                }
                acts.push(msgCenter.createDeleteRowAct(targetRow, fixCells));
                table.deleteRow(targetRow, fixCells, true);
	        }
			if(table.rows.length()>0)
			{
				var tmpActs = table.updateConditonStyle("row");
            	if (tmpActs && tmpActs.length > 0) {
                	acts = acts.concat(tmpActs);
            	}
           	 	tmpActs = this._toMergeColumn(table, 0, table.cols.length - 1);
            	if (tmpActs && tmpActs.length > 0) {
                	acts = acts.concat(tmpActs);
            	}
			}
            table.update();

            try {
                msgCenter.sendMessage(pe.lotusEditor.relations.commentService.checkCommentsDelete());
                !noMessage && msgCenter.sendMessage([msgCenter.createTableMsg(table.id, acts)]);
            } catch (e) {}
            msgCenter.endRecord();
            return acts;
	    },
        repeatHeader: function(rows) {
            var sel = pe.lotusEditor.getShell().getSelection();
            var result = this.getStateBySel(sel);
            var acts = [];
            var table = rows[0].parent;
            var newVal = result.repeat ? "none" : true;
            for (var i = 0; i < rows.length; i++) {
                var oldObj, newObj;
                if (rows[i].isTblHeaderRepeat() != newVal) {
                    if (newVal == true) {
                        oldObj = {
                            "tblHeader": "none"
                        };
                        newObj = {
                            "tblHeader": true
                        };
                    } else {
                        oldObj = {
                            "tblHeader": true
                        };
                        newObj = {
                            "tblHeader": "none"
                        };
                    }
                    rows[i].setTblHeaderRepeat(newVal);
                    acts.push(msgCenter.createSetAttributeAct(rows[i], null, null, newObj, oldObj));
                }
            }
            if (table) {
                var tmpActs = table.updateConditonStyle("row");
                acts = acts.concat(tmpActs);
                if (acts.length > 0) {
                    table.update();
                    msgCenter.sendMessage([msgCenter.createTableMsg(table.id, acts)]);
                }
            }

        },
        _toMergeColumn: function(table, startColIdx, endColIdx) {
            if (endColIdx == startColIdx) 
                return;
			var tableMatrix = table.getTableMatrix(true);
            var miniMergeMap = {};
            var mergeCnt = endColIdx - startColIdx + 1;
            var filterMerged = function(targetCell, startIdx, endIdx, miniMergeMap) {
                var targetColIdx = targetCell.getColIdx();
                var targetColEnd = targetCell.getColSpan() + targetColIdx;
                var mergeBegin = Math.max(startIdx, targetColIdx);
                var mergeCnt = Math.min(targetColEnd - mergeBegin, endIdx - mergeBegin + 1);
                if (!miniMergeMap[mergeBegin] || miniMergeMap[mergeBegin] > mergeCnt)
                    miniMergeMap[mergeBegin] = mergeCnt;
                if (targetColEnd < endColIdx)
                    return targetColEnd;
            };
            for (var i = 0; i < tableMatrix.length(); i++) {
                var targetCell = tableMatrix.getCell(i, startColIdx);
                var nextCellIdx = filterMerged(targetCell, startColIdx, endColIdx, miniMergeMap);
                while (nextCellIdx) {
                    targetCell = tableMatrix.getCell(i,nextCellIdx);
                    nextCellIdx = targetCell && filterMerged(targetCell, startColIdx, endColIdx, miniMergeMap);
                }
            }
            var toMergeCol = false;
            for (var mergeBegin in miniMergeMap) {
                if (miniMergeMap[mergeBegin] == 1)
                    delete miniMergeMap[mergeBegin];
                else
                    toMergeCol = true;
            }
            if (!toMergeCol) 
                return;

            var acts = [];
            var newCells = [];
            var fixCells = {};
            for (var i = 0; i < table.rows.length(); i++) {
                newCells.push({
                    hMerged: true
                });
            }
            var oldCols = table.cols.slice(0);
            for (var mergeBegin in miniMergeMap) {
                var beginIdx = parseInt(mergeBegin);
                var mergeCnt = miniMergeMap[mergeBegin];
                for (var i = 0; i < mergeCnt - 1; i++) {
                    acts.push(msgCenter.createDeleteColumn(table, beginIdx + 1, newCells, fixCells));
                    table.deleteColumn(beginIdx + 1, newCells, fixCells);
                }
                table.mergeColumnW(beginIdx, mergeCnt);
            }
            var newCols = table.cols;
            var oldColsObj = [],
                newColsObj = [];
            for (var i in oldCols) {
                oldColsObj[i] = {};
                oldColsObj[i].t = "gridCol";
                oldColsObj[i].w = tools.PxToPt(oldCols[i]) + "pt";
            }
            for (var j in newCols) {
                newColsObj[j] = {};
                newColsObj[j].t = "gridCol";
                newColsObj[j].w = tools.PxToPt(newCols[j]) + "pt";
            }
            var newAttrs = {
                    "cols": newColsObj
                },
                oldAttrs = {
                    "cols": oldColsObj
                };
            acts.push(msgCenter.createSetAttributeAct(table, null, null, newAttrs, oldAttrs));
            var tmpActs = table.updateConditonStyle("col");
            acts = acts.concat(tmpActs);
            return acts;
        },
        delInvisibleRows: function(table, startRowIdx, endRowIdx){
        	var ltr = table.rows.getByIndex(startRowIdx);
        	var deleted = [];
            for (var i = startRowIdx; i < endRowIdx; i++) {
                if (!ltr) {
                    console.error("something error,please check!");
                    break;
                }
            	if(!ltr.visible)
            		deleted.push(ltr);

           		ltr = table.rows.next(ltr);
            }

            if(deleted.length > 0)
            {
            	var tcOn = trackChange.isOn();
            	if(tcOn)
            		trackChange.pause();

            	var acts =  this.deleteRow(deleted, true);

            	if(tcOn)
            		trackChange.resume();
            	pe.lotusEditor.undoManager.ignoreUndo(true);
                msgCenter.sendMessage([msgCenter.createTableMsg(table.id, acts)]);
                pe.lotusEditor.undoManager.ignoreUndo(false);
                table.changeTable();
            }
        	return deleted.length;
        },
        mergeCells: function(nwCell, seCell) {
            if (!nwCell || !seCell) {
                return;
            }
            var table = nwCell.getTable();
			var tableMatrix = table.getTableMatrix(true);
            var topRowIdx = nwCell.parent.getRowIdx();
            var topColIdx = nwCell.getColIdx();
            var bottomRowIdx = seCell.parent.getRowIdx() + seCell.getRowSpan() - 1;
            var bottomColIdx = seCell.getColIdx() + seCell.getColSpan() - 1;

            var delRows = this.delInvisibleRows(table, topRowIdx, bottomRowIdx);
            if(delRows > 0)
            	return this.mergeCells(nwCell, seCell);

            var msgs = [],
                acts = [];

            var oldRowSpan = nwCell.getRowSpan(),
                oldColSpan = nwCell.getColSpan();
            var newRowSpan = bottomRowIdx - topRowIdx + 1,
                newColSpan = bottomColIdx - topColIdx + 1;

            var i = topRowIdx,
                istop = bottomRowIdx + 1;
            var j = topColIdx,
                jstop = bottomColIdx + 1;
            var changeCells = [];
            var currentRow = nwCell.parent;
            var toInsertContent = new Container();
            for (; i < istop; i++) {
                var currentCells = tableMatrix.getRowMatrix(currentRow);
                changeCells.push([]);
                for (j = topColIdx; j < jstop; j++) {
                    if (currentCells[j] == currentCells[j - 1]) {
                        continue;
                    }
                    var cell = currentCells[j];
                    if (!currentRow.cells.contains(cell)) {
                        changeCells[i - topRowIdx].push(currentRow.creatVMergedCell(cell));
                    } else {
                        if (cell !== nwCell && !cell.isContentEmpty()) {
                            toInsertContent.appendAll(cell.contentTOJSON());
                        }
                        var cellContent = cell.toJson();
                        changeCells[i - topRowIdx].push(cellContent);
                    }
                }
                currentRow = table.rows.next(currentRow);
            }
            var borderAct = this._fixCellBorder(nwCell, seCell);
            if (borderAct) {
                acts = acts.concat(borderAct);
            }
            acts.push(msgCenter.createMergeCellsAct(table, topColIdx, topRowIdx, oldRowSpan, oldColSpan, newRowSpan, newColSpan, changeCells));
            var toDeleteRow = table.mergeCell(topColIdx, topRowIdx, newRowSpan, newColSpan);
            if (toDeleteRow && toDeleteRow.length > 0) {
            	var tcOn = trackChange.isOn();
            	if(tcOn)
            		trackChange.pause();
                var tmpActs = this.deleteRow(toDeleteRow, true);
                acts = acts.concat(tmpActs);
                if(tcOn)
                	trackChange.resume();
            }
            if (toInsertContent.length() > 0) {
                toInsertContent.forEach(function(c) {
                    var p = new Paragraph(c, nwCell);
                    nwCell.insertAfter(p);
                    acts.push(msgCenter.createInsertElementAct(p));
                });
                nwCell.update();
            }
            var tmpActs = this._toMergeColumn(table, topColIdx, bottomColIdx);
            if (tmpActs && tmpActs.length > 0) {
                acts = acts.concat(tmpActs);
            }
            table.update();
            msgs.push(msgCenter.createTableMsg(table.id, acts));
            msgCenter.sendMessage(msgs);
        },
        //fix merged cel border. for defect 46396
        _fixCellBorder: function(nwCell, seCell) {
            var tableTools = TableTools;
            var startRowIdx = nwCell.parent.getVRowIdx();
            var startColIdx = nwCell.getColIdx();
            var endRowIdx = seCell.parent.getVRowIdx() + seCell.getRowSpan();
            var endColIdx = seCell.getColIdx() + seCell.getColSpan();
            var table = nwCell.getTable();
            var tableMatrix = table.getTableMatrix();
            var bottomBorder = tableTools.borderFromJson(tableMatrix.getRowBorders(endRowIdx)[endColIdx - 1].getJsonBorder());
            var topBorder = tableTools.borderFromJson(tableMatrix.getRowBorders(startRowIdx)[startColIdx].getJsonBorder());
            var leftBorder = tableTools.borderFromJson(tableMatrix.getColBorders(startColIdx)[startRowIdx].getJsonBorder());
            var rightBorder = tableTools.borderFromJson(tableMatrix.getColBorders(endColIdx)[endRowIdx - 1].getJsonBorder());


            var cols = [],
                rows = [],
                changes = [];
            var i = startRowIdx,
                j = startColIdx;
            for (i = startRowIdx; i < endRowIdx; i++) {
                cols.push({
                    row: i,
                    col: startColIdx
                });
            }


            changes = changes.concat(tableTools.changeBorders(table, leftBorder, rows, cols));
            cols = [];
            for (j = startColIdx; j < endColIdx; j++) {
                rows.push({
                    row: startRowIdx,
                    col: j
                });
            }
            changes = changes.concat(tableTools.changeBorders(table, topBorder, rows, cols));
            rows = [];
            for (i = startRowIdx; i < endRowIdx; i++) {
                cols.push({
                    row: i,
                    col: endColIdx
                });
                cols.push({
                    row: i,
                    col: startColIdx + nwCell.getColSpan()
                });
            }
            changes = changes.concat(tableTools.changeBorders(table, rightBorder, rows, cols));
            cols = [];
            for (j = startColIdx; j < endColIdx; j++) {
                rows.push({
                    row: endRowIdx,
                    col: j
                });
                rows.push({
                    row: startRowIdx + nwCell.getRowSpan(),
                    col: j
                });
            }
            changes = changes.concat(tableTools.changeBorders(table, bottomBorder, rows, cols));
            rows = [];
            var msgAttrs = [];
            arrayModule.forEach(changes, function(change) {
                var cell = change.obj,
                    border = change.border;
                // spread means vMerged cell's border should be changed
                var oldBorderAttr = {
                    spread: true,
                    border: cell.getProperty().borderToJson() || {}
                };
                cell.changeBorder(border);
                var newBorderAttr = {
                    spread: true,
                    border: cell.getProperty().borderToJson() || {}
                };
                msgAttrs.push(msgCenter.createSetAttributeAct(cell, null, null, newBorderAttr, oldBorderAttr));
            });
            return msgAttrs;
        },
        splitCell: function(cell, rowNum, colNum) {
            if (rowNum == 1 && colNum == 1) {
                return;
            }
            var msgs = [],
                acts = [];
            var table = cell.getTable();
            var row = cell.parent;
			var tableMatrix = table.getTableMatrix(true);
            var colIdx = cell.getColIdx();
            var rowIdx = row.getRowIdx();
            var oldRowSpan = cell.getRowSpan();
            var oldColSpan = cell.getColSpan();
            var isTrackable = trackChange.isOn() && ModelTools.isTrackable(table);
            if (oldRowSpan > 1 && rowNum > 1 || oldColSpan > 1 && colNum > 1) {
                var changedCells = [];
                var newRowSpan = oldRowSpan / rowNum;
                var newColSpan = oldColSpan / colNum;

                for (var i = 0; i < oldRowSpan; i++) {
                    changedCells.push([]);
                    for (var j = 0; j < colNum; j++) {
                        var cellJson = cell.emptyClone();
                        var vMergedCellJson = row.creatVMergedCell(cell);
                        if (newColSpan <= 1) {
                            if (cellJson.tcPr) {
                                delete cellJson.tcPr.gridSpan;
                            }
                            if (vMergedCellJson.tcPr) {
                                delete vMergedCellJson.tcPr.gridSpan;
                            }
                        } else {
                            cellJson.tcPr.gridSpan = cellJson.tcPr.gridSpan || {};
                            cellJson.tcPr.gridSpan.val = newColSpan;
                            vMergedCellJson.tcPr.gridSpan = vMergedCellJson.tcPr.gridSpan || {};
                            vMergedCellJson.tcPr.gridSpan.val = newColSpan;
                        }
                        if (newRowSpan <= 1) {
                            delete cellJson.tcPr.vMerge;
                            delete vMergedCellJson.tcPr.vMerge;
                        }
                        var changeCellJson;
                        if (i % newRowSpan == 0) {
                            changeCellJson = lang.clone(cellJson);
                        } else {
                            changeCellJson = lang.clone(vMergedCellJson);
                        }
                        // // fix border
                        if (j === 0) {
                            var border = tableMatrix.getBorder(rowIdx + i, colIdx).left;
                            if (border && !changeCellJson.tcPr) {
                                changeCellJson.tcPr = {
                                    tcBorders: {
                                        left: border
                                    }
                                };
                            } else if (border && !changeCellJson.tcPr.tcBorders) {
                                changeCellJson.tcPr.tcBorders = {
                                    left: border
                                };
                            } else if (changeCellJson.tcPr.tcBorders) {
                                changeCellJson.tcPr.tcBorders.left = border;
                            }
                        }
                        if (j === colNum - 1) {
                            var border = tableMatrix.getBorder(rowIdx + i, colIdx + j).right;
                            if (border && !changeCellJson.tcPr) {
                                changeCellJson.tcPr = {
                                    tcBorders: {
                                        right: border
                                    }
                                };
                            } else if (border && !changeCellJson.tcPr.tcBorders) {
                                changeCellJson.tcPr.tcBorders = {
                                    right: border
                                };
                            } else if (changeCellJson.tcPr.tcBorders) {
                                changeCellJson.tcPr.tcBorders.right = border;
                            }
                        }
                        if (i === 0) {
                            var border = tableMatrix.getBorder(rowIdx, colIdx + j).top;
                            if (border && !changeCellJson.tcPr) {
                                changeCellJson.tcPr = {
                                    tcBorders: {
                                        top: border
                                    }
                                };
                            } else if (border && !changeCellJson.tcPr.tcBorders) {
                                changeCellJson.tcPr.tcBorders = {
                                    top: border
                                };
                            } else if (changeCellJson.tcPr.tcBorders) {
                                changeCellJson.tcPr.tcBorders.top = border;
                            }
                        }
                        if (i === oldRowSpan - 1) {
                            var border = tableMatrix.getBorder(rowIdx + i, colIdx + j).bottom;
                            if (border && !changeCellJson.tcPr) {
                                changeCellJson.tcPr = {
                                    tcBorders: {
                                        bottom: border
                                    }
                                };
                            } else if (border && !changeCellJson.tcPr.tcBorders) {
                                changeCellJson.tcPr.tcBorders = {
                                    bottom: border
                                };
                            } else if (changeCellJson.tcPr.tcBorders) {
                                changeCellJson.tcPr.tcBorders.bottom = border;
                            }
                        }
                        changedCells[i].push(lang.clone(changeCellJson));
                    }
                }
                table.splitCell(cell.getColIdx(), row.getRowIdx(), newRowSpan, newColSpan, changedCells);
                acts.push(msgCenter.createSplitCellsAct(table, cell.getColIdx(), row.getRowIdx(), oldRowSpan, oldColSpan, newRowSpan, newColSpan, changedCells));
            } else if (colNum > 1) {
                var targetColIdx = cell.getColIdx();
                var desColIdx = targetColIdx + cell.getColSpan();
                var oldCols = table.cols.slice(0);
                table.splitColumn(targetColIdx, colNum);
                var newCols = table.cols;
                var oldColsObj = [],
                    newColsObj = [];
                for (var i in oldCols) {
                    oldColsObj[i] = {};
                    oldColsObj[i].t = "gridCol";
                    oldColsObj[i].w = tools.PxToPt(oldCols[i]) + "pt";
                }
                for (var j in newCols) {
                    newColsObj[j] = {};
                    newColsObj[j].t = "gridCol";
                    newColsObj[j].w = tools.PxToPt(newCols[j]) + "pt";
                }
                var newAttrs = {
                        "cols": newColsObj
                    },
                    oldAttrs = {
                        "cols": oldColsObj
                    };
                acts.push(msgCenter.createSetAttributeAct(table, null, null, newAttrs, oldAttrs));
                var rows = table.rows;
                var currentRow = rows.getFirst();
                var newCells = [];
                while (currentRow) {
                    var cells = tableMatrix.getRowMatrix(currentRow);
                    var targetCell = cells[targetColIdx];
                    if (targetCell != cell) {
                        newCells.push({
                            hMerged: true
                        });
                    } else {
                        if (currentRow.cells.contains(targetCell)) {
                            newCells.push({
                                cnt: true
                            });
                        } else {
                            newCells.push({
                                vMerged: true
                            });
                        }
                    }
                    currentRow = table.rows.next(currentRow);
                }
                for (var i = 1; i < colNum; i++) {
                    var cloneNewCells = this._cloneColumnJson(newCells, cell);
                    acts.push(msgCenter.createInsertColumn(table, desColIdx, cloneNewCells));
                    table.insertColumn(desColIdx, cloneNewCells);
                }
                var tmpActs = table.updateConditonStyle("col");
                acts = acts.concat(tmpActs);
            } else if (rowNum > 1) {
                var cells = tableMatrix.getRowMatrix(row);
                var leftBorder, rightBorder;
                leftBorder = tableMatrix.getBorder(rowIdx, colIdx).left;
                if (colIdx + oldColSpan <= tableMatrix.length2())
                    rightBorder = tableMatrix.getBorder(rowIdx, colIdx + oldColSpan - 1).right;
                for (var i = 1; i < rowNum; i++) {
                    var emptyRow = table.createEmptyRow(row);
     				if (isTrackable)
							emptyRow.ch =[trackChange.createChange("ins")];

                    var cellJsons = [];
                    for (var j = 0; j < cells.length; j++) {
                        if (cells[j] == cells[j - 1]) {
                            continue;
                        }
                        if (cells[j] == cell) {
                            var cellJson = cells[j].emptyClone();
                            if (cellJson.tcPr) {
                                delete cellJson.tcPr.vMerge;
                                // fix vMerged border
                                if (leftBorder || rightBorder || cellJson.tcPr.tcBorders) {
                                    cellJson.tcPr.tcBorders = cellJson.tcPr.tcBorders || {};
                                    cellJson.tcPr.tcBorders.left = leftBorder;
                                    cellJson.tcPr.tcBorders.right = rightBorder;
                                }
                            } else if (leftBorder || rightBorder) {
                                // fix vMerged border
                                cellJson.tcPr = {
                                    tcBorders: {
                                        left: leftBorder,
                                        right: rightBorder
                                    }
                                };
                            }
                            cellJsons.push(cellJson);
                        } else {
                            cellJsons.push(row.creatVMergedCell(cells[j]));
                        }
                    }
                    emptyRow.tcs = cellJsons;
                    var newRow = new Row(emptyRow, table);
                    table.insertRow(newRow, row);
                    acts.push(msgCenter.createInsertRowAct(newRow));
                }
                var tmpActs = table.updateConditonStyle("row");
                acts = acts.concat(tmpActs);
            }
            if (acts.length >= 1) {
                msgs.push(msgCenter.createTableMsg(table.id, acts));
                table.update();
                msgCenter.sendMessage(msgs);
            }
        },
        _cloneRowJson: function(row) {
            var json = lang.clone(row);
            json.id = msgHelper.getUUID();
            if (json.tcs) {
                for (var i = 0; i < json.tcs.length; i++) {
                    json.tcs[i].id = msgHelper.getUUID();
                }
            }
            return json;
        },
        _cloneColumnJson: function(cells, targetCell) {
            var cellsJson = lang.clone(cells);
            var isTrackable = trackChange.isOn() && ModelTools.isTrackable(targetCell.table);
            arrayModule.forEach(cellsJson, function(cell) {
                if (cell.cnt) {
                    var cellJson = targetCell.emptyClone();
                    /*
     				if (isTrackable)
    				{
						var p  = cellJson.ps && cellJson.ps[0];
						if(p && p.t == "p")
							p.rPrCh =[trackChange.createChange("ins")];
    				}
                    */

                    if (cellJson.tcPr) {
                        delete cellJson.tcPr.gridSpan;
                    }
                    cell.cnt = cellJson;
                }
            });
            return cellsJson;
        },
        getColor: function() {
            var color = null;
            var sel = pe.lotusEditor.getShell().getSelection();
            if (sel) {
                var ranges = sel.getRanges();
                var cells = this.getSelectedCells(ranges);
                for (var i = 0; i < cells.length; i++) {
                    var cellColor = cells[i].getProperty().getColor() && cells[i].getProperty().getColor()["background-color"];
                    if (cellColor) {
                        if (cellColor.substring(0, 1) != '#')
                            cellColor = "#" + cellColor;
                        if (!color) {
                            color = cellColor;
                        } else {
                            if (color != cellColor)
                                color = "autoColor";
                        }
                    }
                }
            }
            if (!color) {
                color = "autoColor";
            }
            return color;
        },
        setColor: function(cells, type, value) {
            var msgs = [];
            for (var i = 0; i < cells.length; i++) {
                var oldColor = {
                        type: 'cellColor',
                        t: type
                    },
                    newColor = {
                        type: 'cellColor',
                        t: type
                    };
				acts = [];
                var cellProp = cells[i].getProperty();
                if (cellProp.getColor()) {
                    oldColor.v = cellProp.getColor()[type];
                } else {
                    oldColor.v = null;
                }
//				var changesData = null;
//				if (trackChange.isOn())
//					changesData = trackChange.checkPropChange(cellProp.toJson(), cells[i], "tcPrCh");

                oldColor.cnt = cellProp.colorToJson();
                cells[i].changeStyle(type, value);
                newColor.v = cellProp.getColor()[type];
                newColor.cnt = cellProp.colorToJson();
                acts.push(msgCenter.createSetAttributeAct(cells[i], newColor, oldColor, null, null));
//				if (changesData)
//				{
//					var act = msgCenter.createSetAttributeAct(cells[i],null,null,{"type": "tcPrCh", "ch":changesData.newChanges}, {"type": "tcPrCh", "ch":changesData.oldChanges});
//					acts.push(act);
//					topic.publish("/trackChange/update", cells[i], "dirty", "table");
//				}
				msgs.push(msgCenter.createTableMsg( cells[i].getTable().id, acts));
            }
            if (msgs.length > 0) {
                msgCenter.sendMessage(msgs);
            }
        },
        setCellBorder: function(cells, border, pos) {
            if (!lang.isArray(cells) || cells.length == 0)
                return;
            var tableTools = TableTools;
            var borderRangeConstant = CellBorderTools.Constant.RANGE;
            var cols = [],
                rows = [];
            var addUniqueHandler = function(array, element) {
                if (array.indexOf(element) != -1)
                    return;
                array.push(element);
            };
            // get top/bottom/left/right index
            var leftIdx = Infinity,
                bottomIdx = 0,
                rightIdx = 0,
                topIdx = Infinity;
            arrayModule.forEach(cells, function(cell) {
                var cRowIdx = cell.parent.getRowIdx();
                var cColIdx = cell.getColIdx();
                var cRowSpan = cell.getRowSpan();
                var cColSpan = cell.getColSpan();
                leftIdx = Math.min(leftIdx, cColIdx);
                topIdx = Math.min(topIdx, cRowIdx);
                rightIdx = Math.max(rightIdx, cColIdx + cColSpan);
                bottomIdx = Math.max(bottomIdx, cRowIdx + cRowSpan);
            });
            if (pos === borderRangeConstant.CLEAR) {
                border.style = "none";
                border.width = "0pt";
                pos = borderRangeConstant.ALL;
            }
            if (pos === borderRangeConstant.ALL) {
                arrayModule.forEach(cells, function(cell) {
                    var sRowIdx = cell.parent.getRowIdx();
                    var sColIdx = cell.getColIdx();
                    var eRowIdx = sRowIdx + cell.getRowSpan();
                    var eColIdx = sColIdx + cell.getColSpan();
                    for (var i = sRowIdx; i < eRowIdx; i++) {
                        addUniqueHandler(cols, {
                            row: i,
                            col: sColIdx
                        });
                        addUniqueHandler(cols, {
                            row: i,
                            col: eColIdx
                        });
                    }
                    for (var j = sColIdx; j < eColIdx; j++) {
                        addUniqueHandler(rows, {
                            row: sRowIdx,
                            col: j
                        });
                        addUniqueHandler(rows, {
                            row: eRowIdx,
                            col: j
                        });
                    }
                });
            } else if (pos === borderRangeConstant.INNER) {
                arrayModule.forEach(cells, function(cell) {
                    var sRowIdx = cell.parent.getRowIdx();
                    var sColIdx = cell.getColIdx();
                    var eRowIdx = sRowIdx + cell.getRowSpan();
                    var eColIdx = sColIdx + cell.getColSpan();
                    if (sColIdx > leftIdx) {
                        for (var i = sRowIdx; i < eRowIdx; i++) {
                            addUniqueHandler(cols, {
                                row: i,
                                col: sColIdx
                            });
                        }
                    }
                    if (eColIdx < rightIdx) {
                        for (var i = sRowIdx; i < eRowIdx; i++) {
                            addUniqueHandler(cols, {
                                row: i,
                                col: eColIdx
                            });
                        }
                    }
                    if (sRowIdx > topIdx) {
                        for (var j = sColIdx; j < eColIdx; j++) {
                            addUniqueHandler(rows, {
                                row: sRowIdx,
                                col: j
                            });
                        }
                    }
                    if (eRowIdx < bottomIdx) {
                        for (var j = sColIdx; j < eColIdx; j++) {
                            addUniqueHandler(rows, {
                                row: eRowIdx,
                                col: j
                            });
                        }
                    }

                });
            } else if (pos === borderRangeConstant.HORIZONTAL) {
                arrayModule.forEach(cells, function(cell) {
                    var sRowIdx = cell.parent.getRowIdx();
                    var sColIdx = cell.getColIdx();
                    var eRowIdx = sRowIdx + cell.getRowSpan();
                    var eColIdx = sColIdx + cell.getColSpan();
                    if (sRowIdx > topIdx) {
                        for (var j = sColIdx; j < eColIdx; j++) {
                            addUniqueHandler(rows, {
                                row: sRowIdx,
                                col: j
                            });
                        }
                    }
                    if (eRowIdx < bottomIdx) {
                        for (var j = sColIdx; j < eColIdx; j++) {
                            addUniqueHandler(rows, {
                                row: eRowIdx,
                                col: j
                            });
                        }
                    }
                });
            } else if (pos === borderRangeConstant.VERTICAL) {
                arrayModule.forEach(cells, function(cell) {
                    var sRowIdx = cell.parent.getRowIdx();
                    var sColIdx = cell.getColIdx();
                    var eRowIdx = sRowIdx + cell.getRowSpan();
                    var eColIdx = sColIdx + cell.getColSpan();
                    if (sColIdx > leftIdx) {
                        for (var i = sRowIdx; i < eRowIdx; i++) {
                            addUniqueHandler(cols, {
                                row: i,
                                col: sColIdx
                            });
                        }
                    }
                    if (eColIdx < rightIdx) {
                        for (var i = sRowIdx; i < eRowIdx; i++) {
                            addUniqueHandler(cols, {
                                row: i,
                                col: eColIdx
                            });
                        }
                    }
                });
            } else if (pos === borderRangeConstant.OUTER) {
                arrayModule.forEach(cells, function(cell) {
                    var sRowIdx = cell.parent.getRowIdx();
                    var sColIdx = cell.getColIdx();
                    var eRowIdx = sRowIdx + cell.getRowSpan();
                    var eColIdx = sColIdx + cell.getColSpan();
                    if (sColIdx == leftIdx) {
                        for (var i = sRowIdx; i < eRowIdx; i++) {
                            addUniqueHandler(cols, {
                                row: i,
                                col: sColIdx
                            });
                        }
                    }
                    if (eColIdx == rightIdx) {
                        for (var i = sRowIdx; i < eRowIdx; i++) {
                            addUniqueHandler(cols, {
                                row: i,
                                col: eColIdx
                            });
                        }
                    }
                    if (sRowIdx == topIdx) {
                        for (var j = sColIdx; j < eColIdx; j++) {
                            addUniqueHandler(rows, {
                                row: sRowIdx,
                                col: j
                            });
                        }
                    }
                    if (eRowIdx == bottomIdx) {
                        for (var j = sColIdx; j < eColIdx; j++) {
                            addUniqueHandler(rows, {
                                row: eRowIdx,
                                col: j
                            });
                        }
                    }
                });
            } else if (pos === borderRangeConstant.LEFT) {
                arrayModule.forEach(cells, function(cell) {
                    var sRowIdx = cell.parent.getRowIdx();
                    var sColIdx = cell.getColIdx();
                    var eRowIdx = sRowIdx + cell.getRowSpan();
                    if (sColIdx == leftIdx) {
                        for (var i = sRowIdx; i < eRowIdx; i++) {
                            addUniqueHandler(cols, {
                                row: i,
                                col: sColIdx
                            });
                        }
                    }
                });
            } else if (pos === borderRangeConstant.TOP) {
                arrayModule.forEach(cells, function(cell) {
                    var sRowIdx = cell.parent.getRowIdx();
                    var sColIdx = cell.getColIdx();
                    var eColIdx = sColIdx + cell.getColSpan();
                    if (sRowIdx == topIdx) {
                        for (var j = sColIdx; j < eColIdx; j++) {
                            addUniqueHandler(rows, {
                                row: sRowIdx,
                                col: j
                            });
                        }
                    }
                });
            } else if (pos === borderRangeConstant.RIGHT) {
                arrayModule.forEach(cells, function(cell) {
                    var sRowIdx = cell.parent.getRowIdx();
                    var sColIdx = cell.getColIdx();
                    var eRowIdx = sRowIdx + cell.getRowSpan();
                    var eColIdx = sColIdx + cell.getColSpan();
                    if (eColIdx == rightIdx) {
                        for (var i = sRowIdx; i < eRowIdx; i++) {
                            addUniqueHandler(cols, {
                                row: i,
                                col: eColIdx
                            });
                        }
                    }
                });
            } else if (pos === borderRangeConstant.BOTTOM) {
                arrayModule.forEach(cells, function(cell) {
                    var sRowIdx = cell.parent.getRowIdx();
                    var sColIdx = cell.getColIdx();
                    var eRowIdx = sRowIdx + cell.getRowSpan();
                    var eColIdx = sColIdx + cell.getColSpan();
                    if (eRowIdx == bottomIdx) {
                        for (var j = sColIdx; j < eColIdx; j++) {
                            addUniqueHandler(rows, {
                                row: eRowIdx,
                                col: j
                            });
                        }
                    }
                });
            }
            var table = cells[0].getTable();
            var changes = tableTools.changeBorders(table, border, rows, cols);
            var msgAttrs = [];
            arrayModule.forEach(changes, function(change) {
                var cell = change.obj,
                    border = change.border;
                // spread means vMerged cell's border should be changed
                var oldBorderAttr = {
                    border: cell.getProperty().borderToJson() || {},
                    spread: true
                };
                cell.changeBorder(border);
                var newBorderAttr = {
                    border: cell.getProperty().borderToJson() || {},
                    spread: true
                };
                msgAttrs.push(msgCenter.createSetAttributeAct(cell, null, null, newBorderAttr, oldBorderAttr));
            });
            if (msgAttrs.length > 0)
                msgCenter.sendMessage([msgCenter.createTableMsg(table.id, msgAttrs)]);
			var fixCells = table.getTableMatrix(true).fixBorderMatrix();
            arrayModule.forEach(fixCells, function(cell) {
                cell.cleanAllCache && cell.cleanAllCache();
                cell.markCheckBorder && cell.markCheckBorder();
                cell.update();
            });
        },
        splitTable: function(table, currentRow) {
            var currentRowIdx = currentRow.getRowIdx();
            if (currentRowIdx == 0) {
                return null;
            }

            var newTable = table.toJson(currentRowIdx);
            this._changeId(newTable);

            if (trackChange.isOn() && ModelTools.isTrackable(table))
            {
            	dojo.forEach(newTable.trs, function(r){
            		r.ch = [trackChange.createChange("ins")];
            	});
            	newTable.ch = [trackChange.createChange("ins")];
            }

            var toDelRow = [];
            while (currentRow) {
                toDelRow.push(currentRow);
                currentRow = table.rows.next(currentRow);
            }
            var acts = this.deleteRow(toDelRow, true);
            return {
                "acts": acts,
                "newTable": newTable
            };
        },
        _changeId: function(tbl) {
            if (tbl.id) {
                tbl.id = msgHelper.getUUID();
            }
            var trs = tbl.trs;
            for (var i = 0; i < trs.length; i++) {
                var tr = trs[i];
                tr.id = msgHelper.getUUID();
                var cells = tr.tcs;
                for (var j = 0; j < cells.length; j++) {
                    var cell = cells[j];
                    cell.id = msgHelper.getUUID();
                    for (var k = 0; cell.ps && k < cell.ps.length; k++) {
                        cell.ps[k].id = msgHelper.getUUID();
                    }
                }
            }
        },
        _verifyConditionStyle: function(table, tableStyle) {
            var _checkStyle = function(el) {
                var property = el.getProperty();
                var conStyle = el.getConditionStyle(false, true);
                for (var i = 0; i < conStyle.length; i++) {
                    if (!tableStyle.getConditionStyle(conStyle[i])) {
                        property.removeConditionStyle(conStyle[i]);
                    }
                }
            };
            _checkStyle(table);
            var firstRow = table.rows.getFirst();
            while (firstRow) {
                _checkStyle(firstRow);
                var firstCell = firstRow.cells.getFirst();
                while (firstCell) {
                    _checkStyle(firstCell);
                    firstCell = firstRow.cells.next(firstCell);
                }
                firstRow = table.rows.next(firstRow);
            }
        },
        changeStyle: function(table, styleId) {
            var doc = table.parent;
            var referredStyle = pe.lotusEditor.getRefStyle(styleId);
            if (!referredStyle) {
                return;
            }
            if (!table.parent.container.contains(table)) {
                return;
            }
            var nextTag = table.next();
            if (!nextTag) {
                return;
            }
            table.clearStyle(true);
            var clearedJson = table.toJson();
            table.clearStyle(false);
            clearedJson.id = msgHelper.getUUID();
            clearedJson.tblPr = clearedJson.tblPr || {};
            clearedJson.tblPr.styleId = styleId;
            var newTable = new Table(clearedJson, doc);
            this._verifyConditionStyle(newTable, referredStyle);
            //firstRow,lastRow,firstColumn,lastColumn,noHBand,noVBand
            newTable.setStyleFormat("1", "1", "1", "0", "0", "1");
            newTable.updateConditonStyle();
            var acts = [];
            var delAct = msgCenter.createDeleteElementAct(table);
            delAct.act.tbId = table.id;
            delAct.rAct.tbId = table.id;
            acts.push(delAct);
            doc.remove(table);
            doc.insertBefore(newTable, nextTag);
            var insAct = msgCenter.createInsertElementAct(newTable);
            insAct.act.tbId = newTable.id;
            insAct.rAct.tbId = newTable.id;
            acts.push(insAct);
            var msg = msgCenter.createMsg(constants.MSGTYPE.Table, acts);
            doc.update();
            msgCenter.sendMessage([msg]);
            return newTable;
        },
        canMerge: function(startCell, endCell) {
            if (!startCell || !endCell) {
                return false;
            }
			return startCell.getTable().getTableMatrix(true).canMerge(startCell,endCell);
        },
        inTable: function(model) {
            if (!model) {
                return false;
            }
            if (model.modelType == constants.MODELTYPE.ROW || model.modelType == constants.MODELTYPE.CELL) {
                return true;
            }
            return this.inTable(model.parent);
        },
        getTable: function(model) {
            if (!model) {
                return null;
            }
            if (model.modelType == constants.MODELTYPE.TABLE && !model.isTrackDeleted()) {
                return model;
            }
            return this.getTable(model.parent);
        },
        getRow: function(model) {
            if (!model) {
                return null;
            }
            if (model.modelType == constants.MODELTYPE.ROW) {
                return model;
            }
            return this.getRow(model.parent);
        },
        getCell: function(model) {
            if (!model) {
                return null;
            }
            if (model.modelType == constants.MODELTYPE.CELL) {
                return model;
            }
            return this.getCell(model.parent);
        },
        isCell: function(model) {
            return model.modelType == constants.MODELTYPE.CELL;
        },
        isRow: function(model) {
            return model.modelType == constants.MODELTYPE.ROW;
        },
        isTable: function(model) {
            return model.modelType == constants.MODELTYPE.TABLE;
        },
        _viewTools: ViewTools,
        commands: null,
        menuItems: null,
        colMenuItems: null,
        rowMenuItems: null,
        cellMenuItems: null,
        colSubMenuToolbar: {},
        rowSubMenuToolbar: {},
        cellSubMenuToolbar: {},
        colSubMenuCtx: {},
        rowSubMenuCtx: {},
        cellSubMenuCtx: {},

        bindSubMenu: function(menu, type, isCtx) {
            var currentMenuItems = null;
            var currentSubMenu = null;
            if (type == "col") {
                currentMenuItems = this.colMenuItems;
                if (isCtx) {
                    currentSubMenu = this.colSubMenuCtx;
                } else {
                    currentSubMenu = this.colSubMenuToolbar;
                }

            } else if (type == "row") {
                currentMenuItems = this.rowMenuItems;
                if (isCtx) {
                    currentSubMenu = this.rowSubMenuCtx;
                } else {
                    currentSubMenu = this.rowSubMenuToolbar;
                }
            } else if (type == "cell") {
                currentMenuItems = this.cellMenuItems;
                if (isCtx) {
                    currentSubMenu = this.cellSubMenuCtx;
                } else {
                    currentSubMenu = this.cellSubMenuToolbar;
                }
            }

            if (currentSubMenu.menu) {
                return currentSubMenu.menu;
            }

            for (var menuItemName in currentMenuItems) {
                var onClickFun = function(command) {
                    return function() {
                        pe.lotusEditor.execCommand(command);
                    };
                };
                currentMenuItems[menuItemName].onClick = onClickFun(currentMenuItems[menuItemName].commandID);

                var menuItem;
                if (currentMenuItems[menuItemName].popup)
                    menuItem = new PopupMenuItem(currentMenuItems[menuItemName]);
                else if (currentMenuItems[menuItemName].isCheckedMenu && currentMenuItems[menuItemName].isCheckedMenu == true)
                    menuItem = new CheckedMenuItem(currentMenuItems[menuItemName]);
                else
                    menuItem = new MenuItem(currentMenuItems[menuItemName]);
                menu.addChild(menuItem);

                currentSubMenu[menuItemName] = menuItem;
            }

            currentSubMenu.menu = menu;
            return menu;
        },
        onSelectionChange: function() {
            var bInToc = false;
            var bInFootnotes = false;
            var bInEndnotes = false;
            var bInNonHorizonalTextbox = false;
            var bInJustwordsTextbox = false;

            var selection = pe.lotusEditor.getSelection();
            var ranges = selection.getRanges();
            var range = ranges[0];
            if (!range)
                return;
            var startView = range.getStartView();
            var startViewObj = startView && startView.obj;

            //is in toc
            var plugin = this.editor.getPlugin("Toc");
            bInToc = plugin && plugin.getSelectedToc(selection);
            plugin = this.editor.getPlugin("Footnotes");
            if (plugin) {
                bInFootnotes = plugin.isInFootnotes();
            }
            plugin = this.editor.getPlugin("Endnotes");
            if (plugin) {
                bInEndnotes = plugin.isInEndnotes();
            }
            // is in Textbox with non-text horizonal align. or in just words
            if (startViewObj) {
                var textbox = ViewTools.getTextBox(startViewObj);
                if (textbox) {
                    bInNonHorizonalTextbox = !textbox.model.isHorz();
                    bInJustwordsTextbox = textbox.model.isJustWords();
                }
            }

            if (bInToc || bInNonHorizonalTextbox || bInJustwordsTextbox || bInFootnotes || bInEndnotes || ModelTools.isInSmartart()) {
                pe.lotusEditor.getCommand('row').setState(constants.CMDSTATE.TRISTATE_HIDDEN);
                pe.lotusEditor.getCommand('column').setState(constants.CMDSTATE.TRISTATE_HIDDEN);
                pe.lotusEditor.getCommand('createTable').setState(constants.CMDSTATE.TRISTATE_HIDDEN);
                pe.lotusEditor.getCommand('createTableState').setState(constants.CMDSTATE.TRISTATE_HIDDEN);
                pe.lotusEditor.getCommand('TableTmplate').setState(constants.CMDSTATE.TRISTATE_HIDDEN);
                pe.lotusEditor.getCommand('deleteTable').setState(constants.CMDSTATE.TRISTATE_DISABLED);
                pe.lotusEditor.getCommand('Cell').setState(constants.CMDSTATE.TRISTATE_DISABLED);
                return;
            }

            var res = this.getStateBySel(selection);
            var drawingObjSel = false;
            if (!res.canTable) {
                if (ranges.length == 1 && RangeTools.ifContainOnlyOneDrawingObj(range)) {
                    drawingObjSel = true;
                }
            }
            pe.lotusEditor.getCommand('table').setState(res.canTable ? constants.CMDSTATE.TRISTATE_OFF : constants.CMDSTATE.TRISTATE_HIDDEN);
            pe.lotusEditor.getCommand('tableProperties').setState(res.canTable ? constants.CMDSTATE.TRISTATE_OFF : constants.CMDSTATE.TRISTATE_HIDDEN);
            pe.lotusEditor.getCommand('Cell').setState(res.canTable ? constants.CMDSTATE.TRISTATE_OFF : constants.CMDSTATE.TRISTATE_HIDDEN);
            pe.lotusEditor.getCommand('row').setState(res.canRow ? constants.CMDSTATE.TRISTATE_OFF : constants.CMDSTATE.TRISTATE_HIDDEN);
            pe.lotusEditor.getCommand('column').setState(res.canCol ? constants.CMDSTATE.TRISTATE_OFF : constants.CMDSTATE.TRISTATE_HIDDEN);
            pe.lotusEditor.getCommand('createTable').setState((!res.canTable && !drawingObjSel) ? constants.CMDSTATE.TRISTATE_OFF : constants.CMDSTATE.TRISTATE_HIDDEN);
            pe.lotusEditor.getCommand('createTableState').setState((res.canCreateTable && !drawingObjSel) ? constants.CMDSTATE.TRISTATE_OFF : constants.CMDSTATE.TRISTATE_HIDDEN);
            pe.lotusEditor.getCommand('TableTmplate').setState(res.canTable ? constants.CMDSTATE.TRISTATE_OFF : constants.CMDSTATE.TRISTATE_HIDDEN);
            pe.lotusEditor.getCommand('deleteTable').setState(res.canTable ? constants.CMDSTATE.TRISTATE_OFF : constants.CMDSTATE.TRISTATE_HIDDEN);
            pe.lotusEditor.getCommand('repeatHeader').setState(res.canRepeat ? (res.repeat ? constants.CMDSTATE.TRISTATE_ON : constants.CMDSTATE.TRISTATE_OFF) : constants.CMDSTATE.TRISTATE_HIDDEN);
            pe.lotusEditor.getCommand('changeTableStyle').setState(res.canTable ? constants.CMDSTATE.TRISTATE_OFF : constants.CMDSTATE.TRISTATE_HIDDEN);
            pe.lotusEditor.getCommand('insertColBfr').setState(res.canCol ? constants.CMDSTATE.TRISTATE_ON : constants.CMDSTATE.TRISTATE_DISABLED);
            pe.lotusEditor.getCommand('insertColAft').setState(res.canCol ? constants.CMDSTATE.TRISTATE_OFF : constants.CMDSTATE.TRISTATE_HIDDEN);
            pe.lotusEditor.getCommand('insertRowAbove').setState(res.canRow ? constants.CMDSTATE.TRISTATE_ON : constants.CMDSTATE.TRISTATE_DISABLED);
            pe.lotusEditor.getCommand('insertRowBelow').setState(res.canRow ? constants.CMDSTATE.TRISTATE_OFF : constants.CMDSTATE.TRISTATE_HIDDEN);
            pe.lotusEditor.getCommand('deleteRow').setState(res.canRow ? constants.CMDSTATE.TRISTATE_ON : constants.CMDSTATE.TRISTATE_DISABLED);
            pe.lotusEditor.getCommand('deleteCol').setState(res.canCol ? constants.CMDSTATE.TRISTATE_ON : constants.CMDSTATE.TRISTATE_DISABLED);
            pe.lotusEditor.getCommand('mergeCells').setState(res.canMergeCells ? constants.CMDSTATE.TRISTATE_ON : constants.CMDSTATE.TRISTATE_DISABLED);
            pe.lotusEditor.getCommand('showSplitCellDlg').setState(res.canSplitCell ? constants.CMDSTATE.TRISTATE_ON : constants.CMDSTATE.TRISTATE_DISABLED);
            pe.lotusEditor.getCommand('cellProperties').setState(res.canSplitCell ? constants.CMDSTATE.TRISTATE_ON : constants.CMDSTATE.TRISTATE_DISABLED);
            pe.lotusEditor.getCommand('setTableColor').setState(res.canCell ? constants.CMDSTATE.TRISTATE_OFF : constants.CMDSTATE.TRISTATE_HIDDEN);
            pe.lotusEditor.getCommand('setCellBorder').setState(res.canCell ? constants.CMDSTATE.TRISTATE_OFF : constants.CMDSTATE.TRISTATE_HIDDEN);
        },
        getStateBySel: function(selection) {
            var result = {};
            var modelTools = ModelTools;
            var ranges = selection.getRanges();
            if (ranges.length == 0)
                return result;

            var firstRange = ranges[0],
                lastRange = ranges[ranges.length - 1];

            var startModel = firstRange.getStartModel().obj;
            var endModel = lastRange.getEndModel().obj;
            var startInTable = this.getTable(startModel);
            var endInTable = this.getTable(endModel);
            if (startInTable || endInTable) {
                result.canCreateTable = false;
            } else {
                result.canCreateTable = true;
            }
            if (startInTable != endInTable || (!startInTable || !endInTable)) {
                result.canTable = false;
                return result;
            }
            var startCell = this.getStartCell(ranges);
            var endCell = this.getEndCell(ranges);
            if (startCell && startCell == endCell) {
                result.canSplitCell = true;
            } else if (this.canMerge(startCell, endCell)) {
                result.canMergeCells = true;
            }
            var startRow = modelTools.getRow(startModel);
            var endRow = modelTools.getRow(endModel);
            var repeatHeaders = TableTools.getRepeatHeaderRows(startInTable);
            if(startRow && endRow)
            {
                var selectRows = TableTools.getRowsInRange(startRow, endRow);
                if (selectRows && selectRows[0] == startInTable.rows.getFirst())
                    result.canRepeat = true;
            
                if (modelTools.isInDrawingObj(startRow.parent))
            	    result.canRepeat = false;
            
                if (repeatHeaders && selectRows && repeatHeaders.length > 0 && selectRows.length > 0) {
                    if (result.canRepeat) {
                        result.repeat = arrayModule.every(selectRows, function(r) {
                            return r.isTblHeaderRepeat() == true;
                        });
                    }
                }
            }
            result.isInTable = true;
            result.canRow = true;
            result.canCol = true;
            result.canTable = true;
            result.canCell = true;
            return result;
        },
        getSelectedCells: function(ranges) {
            var cells = [];
            for (var r = 0; r < ranges.length; r++) {
                var range = ranges[r];
                var startObj = range.getStartModel().obj,
                    endObj = range.getEndModel().obj;
                var startIdx = range.getStartModel().index,
                    endIdx = range.getEndModel().index;
                if (this.isTable(startObj)) {
                    var startRow = startObj.getItemByIndex(startIdx);
                    var endRow = endObj.getItemByIndex(endIdx);
                    while (startRow != endRow) {
                        startRow.cells.forEach(function(cell) {
                            cells.push(cell);
                        });
                        startRow = startRow.next();
                    }
                } else if (this.isRow(startObj)) {
                    var startRow = startObj;
                    var startCell = startRow.getItemByIndex(startIdx);
                    for (var i = startIdx; i < endIdx; i++) {
                        cells.push(startCell);
                        startCell = startCell.next();
                    }

                } else {
                    var startCell = this.getCell(startObj);
                    if (startCell) {
                        cells.push(startCell);
                    }
                }
            }
            return cells;
        },
        getStartCell: function(ranges) {
            var that = this;
            var _getStartCell = function(start) {
                var startObj = start.obj;
				var startCell = null;
                if (that.isTable(startObj)) {
                    var startRow = startObj.getItemByIndex(start.index);
                    if (startRow)
					   startCell = startRow.cells.getFirst();
                } else if (that.isRow(startObj)) {
					startCell = startObj.getItemByIndex(start.index)||startObj.cells.getLast();
                } else {
					startCell = that.getCell(startObj);
                }
                return startCell;
            };
            var firstRange = ranges[0];
            var endRange = ranges[ranges.length - 1];
            var start1 = firstRange.getStartModel();
            var start2 = endRange.getStartModel();
            if (start1 == start2) {
                return _getStartCell(start1);
            } else {
                var r1 = _getStartCell(start1);
                var r2 = _getStartCell(start2);
                if (r1.parent.getRowIdx() > r2.parent.getRowIdx()) {
                    return r2;
                } else {
                    return r1;
                }
            }

        },
        getEndCell: function(ranges) {
            var that = this;
            var _getEndCell = function(end) {
                var endObj = end.obj;
				var endCell = null;
                if (that.isTable(endObj)) {
                	var endIdx = (end.index > 0)?(end.index - 1):0;
                    var startRow = endObj.getItemByIndex(endIdx);
					endCell = startRow.cells.getLast();
                } else if (that.isRow(endObj)) {
					endCell = endObj.getItemByIndex(end.index-1);
                } else {
					endCell = that.getCell(endObj);
                }
                return endCell;
            };
            var firstRange = ranges[0];
            var endRange = ranges[ranges.length - 1];


            var end1 = firstRange.getEndModel();
            var end2 = endRange.getEndModel();
            if (end1 == end2) {
                return _getEndCell(end1);
            } else {
                var r1 = _getEndCell(end1);
                var r2 = _getEndCell(end2);
                if (r1.parent.getRowIdx() < r2.parent.getRowIdx()) {
                    return r2;
                } else {
                    return r1;
                }
            }

        },
        getStartRow: function(ranges) {
            var that = this;
            var firstRange = ranges[0];
            var endRange = ranges[ranges.length - 1];
            var _getStartRow = function(start) {
                var startObj = start.obj;
				var startRow = null;
                if (that.isTable(startObj)) {
					startRow = startObj.getItemByIndex(start.index);
                } else if (that.isRow(startObj)) {
					startRow = startObj;
                } else {
					startRow = that.getRow(startObj);
                }
                return startRow;
            };
            var start1 = firstRange.getStartModel();
            var start2 = endRange.getStartModel();
            if (start1 == start2) {
                return _getStartRow(start1);
            } else {
                var r1 = _getStartRow(start1);
                var r2 = _getStartRow(start2);
                if (r1.getRowIdx() < r2.getRowIdx()) {
                    return r1;
                } else {
                    return r2;
                }
            }

        },
        getEndRow: function(ranges) {
            var that = this;
            var firstRange = ranges[0];
            var endRange = ranges[ranges.length - 1];
            var _getEndRow = function(end) {
                var endObj = end.obj;
				var endRow = null;
                if (that.isTable(endObj)) {
					endRow = endObj.getItemByIndex(end.index-1);
                } else if (that.isRow(endObj)) {
					endRow = endObj;
                } else {
					endRow = that.getRow(endObj);
                }
                return endRow;
            };
            var end1 = firstRange.getEndModel();
            var end2 = endRange.getEndModel();
            if (end1 == end2) {
                return _getEndRow(end1);
            } else {
                var r1 = _getEndRow(end1);
                var r2 = _getEndRow(end2);
                if (r1.getRowIdx() < r2.getRowIdx()) {
                    return r2;
                } else {
                    return r1;
                }
            }
        },
        /*
        changeTableProperties: function() {
            if (!this.tablePropertiesDlg) {
                var res = i18nlang;
                this.tablePropertiesDlg = new tablePropertiesDlg(this.editor, res.tablePropertyTitle);
            }
            this.tablePropertiesDlg.show();
        },
        */

        init: function() {
            var plugin = this,
                editor = this.editor;

            var rowToolbarButton = registry.byId("D_t_AddRow");
            var rowToolbarMenu = registry.byId("D_m_AddRow");
            var colToolbarButton = registry.byId("D_t_AddColumn");
            var colToolbarMenu = registry.byId("D_m_AddColumn");
            var onMergeCell = function() {
                var sel = pe.lotusEditor.getShell().getSelection();
                if (sel) {
                    var ranges = sel.getRanges();
                    if (ranges && ranges.length > 0) {
                        var startCell = plugin.getStartCell(ranges);
                        var endCell = plugin.getEndCell(ranges);
                        plugin.mergeCells(startCell, endCell);
                        //					sel.select({obj:startCell,index:0},{obj:startCell,index:0});
                        var range = new Range({
                            obj: {}
                        }, {
                            obj: {}
                        }, ranges[0].rootView);
                        range.moveToEditStart(startCell);
                        sel.selectRangesBeforeUpdate([range]);
                    }
                }
            };
            var onShowSplitCellDlg = function() {
                var sel = pe.lotusEditor.getShell().getSelection();
                if (sel) {
                    var range = sel.getRanges()[0];
                    var startModel = range.getStartModel().obj;
                    var cell = ModelTools.getAncestor(startModel, constants.MODELTYPE.CELL);
                    if (!cell) {
                        return;
                    }
                    if (!this.splitCellDialog)
                        this.splitCellDialog = new SplitCell(editor, nls.splitCells);
                    this.splitCellDialog.setFocuCell(cell);
                    this.splitCellDialog.show();

                }
            };
            var onSplitCell = function(rowNum, colNum) {
                var sel = pe.lotusEditor.getShell().getSelection();
                if (sel) {
                    var range = sel.getRanges()[0];
                    var startModel = range.getStartModel().obj;
                    var cell = ModelTools.getAncestor(startModel, constants.MODELTYPE.CELL);
                    cell && plugin.splitCell(cell, rowNum, colNum);
                }
            };

            var onTablePropertiesDlg = function() {
                var sel = pe.lotusEditor.getShell().getSelection();
                if (sel) {
                    var range = sel.getRanges()[0];
                    var startModel = range.getStartModel().obj;
                    var table = ModelTools.getAncestor(startModel, constants.MODELTYPE.TABLE);
                    if (!table) {
                        return;
                    }
                    var tableView = ViewTools.getTable(range.getStartView().obj);
                    if (!this.tablePropDialog)
                        this.tablePropDialog = new TableProp(editor, null, null, null, {
                            type: "TABLE"
                        });
                    // get table's height and width				
                    this.tablePropDialog.setSizeInfo({
                        focusObj: table,
                        width: tableView.w,
                        height: tableView.h
                    });
                    this.tablePropDialog.show();

                }
            };
            var onCellPropertiesDlg = function() {
                var sel = pe.lotusEditor.getShell().getSelection();
                if (sel) {
                    var range = sel.getRanges()[0];
                    var startModel = range.getStartModel().obj;
                    var cell = ModelTools.getAncestor(startModel, constants.MODELTYPE.CELL);
                    if (!cell) {
                        return;
                    }
                    var row = cell.parent;
                    var rowHeight = 0;
                    var allViews = row.getAllViews();
                    for (var ownerId in allViews) {
                        var viewers = allViews[ownerId];
                        var firstView = viewers.getFirst();
                        rowHeight += firstView.getBoxHeight();
                        break;
                    }

                    if (!this.cellPropDialog)
                        this.cellPropDialog = new ResizePropDlg(editor, null, null, null, {
                            type: "TABLECELL"
                        });
                    // get cell's height and width
                    this.cellPropDialog.setSizeInfo({
                        focusObj: cell,
                        width: cell.table.getColumnWidth(cell.getColIdx()),
                        height: rowHeight
                    });
                    this.cellPropDialog.show();

                }
            };
            //dojo.subscribe("insertRow",this,function(type){
            var insertRow = function(type) {
                var sel = pe.lotusEditor.getShell().getSelection();
                if (sel) {
                    var ranges = sel.getRanges();
                    if (ranges && ranges.length > 0) {
                        var row1 = plugin.getStartRow(ranges);
                        var row2 = plugin.getEndRow(ranges);
                        if (!row1 || !row2) {
                            console.info("can not insertRow");
                            return;
                        } else {
                            var cnt = row2.getRowIdx() - row1.getRowIdx() + 1;
							var lastInsertedRow = firstInsertedRow = null;
                            if (type == "before") {
                                plugin.insertRow(row1, type, cnt);
								lastInsertedRow = row1.previous();
								firstInsertedRow = row1;
                                for (var i = 0; i < cnt; i++) {
                                    firstInsertedRow = firstInsertedRow.previous();
                                }
                            } else {
                                plugin.insertRow(row2, type, cnt);
								lastInsertedRow = row2;
								firstInsertedRow = row2.next();
                                for (var i = 0; i < cnt; i++) {
                                    lastInsertedRow = lastInsertedRow.next();
                                }
                            }
                            //						sel.select({obj:firstInsertedRow.cells.getFirst(),index:0},{obj:lastInsertedRow.cells.getLast(),index:0});
                            var range = new Range({
                                obj: {}
                            }, {
                                obj: {}
                            }, ranges[0].rootView);
                            RangeTools.selectToEditStart(range, firstInsertedRow);
                            RangeTools.selectToEditEnd(range, lastInsertedRow);
                            //						range.moveToEditStart(lastInsertedRow);
                            sel.selectRangesBeforeUpdate([range]);
                        }

                    }
                }
            };
            var deleteRow = function() {
                var sel = pe.lotusEditor.getShell().getSelection();
                var ranges = sel.getRanges();
                if (ranges && ranges.length > 0) {
				//	var startModel = ranges[0].getStartModel().obj;
				//	var endModel   = ranges[ranges.length-1].getEndModel().obj;
                    var row1 = plugin.getStartRow(ranges);
                    var row2 = plugin.getEndRow(ranges);
                    if (!row1 || !row2) {
                        console.info("can not insertRow");
                        return;
                    } else {
                        var table = row1.parent;
                        var cnt = row2.getRowIdx() - row1.getRowIdx() + 1;
                        if (table.rows.length() == cnt) {
                            onDeleteTable();
                            return;
                        }
                        var rows = [];
                        var cursorRow = row2.next();
                        if (!cursorRow) {
                            cursorRow = row1.previous();
                        }
                        for (var i = 0; i < cnt; i++) {
                            rows.push(row1);
                            row1 = row1.next();
                        }
                        plugin.deleteRow(rows);
                        var cursorCell = cursorRow.cells.getFirst();
                        var range = new Range({
                            obj: {}
                        }, {
                            obj: {}
                        }, ranges[0].rootView);
                        range.moveToEditStart(cursorCell);
                        sel.selectRangesBeforeUpdate([range]);
                        //					sel.select({obj:cursorCell,index:0},{obj:cursorCell,index:0});
                    }
                }
            };
            var repeatHeader = function() {
                var sel = pe.lotusEditor.getShell().getSelection();
                if (sel) {
                    var ranges = sel.getRanges();
                    if (ranges && ranges.length > 0) {
                        var startModel = ranges[0].getStartModel().obj;
                        var endModel = ranges[ranges.length - 1].getEndModel().obj;
                        var row1 = plugin.getStartRow(ranges);
                        var row2 = plugin.getEndRow(ranges);
                        if (!row1 || !row2) {
                            console.info("can not repeatRow");
                            return;
                        } else {
                            var startInTable = ModelTools.getTable(startModel);
                            var selectRows = TableTools.getRowsInRange(row1, row2);
                            if (startInTable && selectRows && startInTable.rows.getFirst() == selectRows[0])
                                plugin.repeatHeader(selectRows);
                        }

                    }
                }

            };
            //dojo.subscribe("insertColumn",this,function(type){
            var insertColumn = function(type) {
                var sel = editor.getShell().getSelection();
                if (sel) {
                    var ranges = sel.getRanges();
                    if (ranges && ranges.length > 0) {
                        var startCell = plugin.getStartCell(ranges);
                        var endCell = plugin.getEndCell(ranges);
                        if (!startCell || !endCell) {
                            console.info("can not insertColumn");
                            return;
                        } else {
                            var cnt = endCell.getColIdx() - startCell.getColIdx() + 1;
							var firstCell = lastCell = null;
                            if (type == "before") {
								firstCell = startCell.previous();
								lastCell = startCell;
                                plugin.insertCol(startCell, type, cnt);
                            } else {
								firstCell = endCell;
								lastCell = endCell.next();
                                plugin.insertCol(endCell, type, cnt);

                            }
                            var row = startCell.parent;
                            var table = row.parent;
							var tableMatrix = table.getTableMatrix(true);
                            if (!firstCell) {
                                firstCell = row.cells.getFirst();
                            } else {
                                firstCell = firstCell.next();
                            }
                            if (!lastCell) {
                                lastCell = row.cells.getLast();
                            } else {
                                lastCell = lastCell.previous();
                            }
                            if (!firstCell || !lastCell) {
                                //							sel.select({obj:startCell,index:0},{obj:startCell,index:0});
                                var range = new Range({
                                    obj: {}
                                }, {
                                    obj: {}
                                }, ranges[0].rootView);
                                range.moveToEditStart(startCell);
                                sel.selectRangesBeforeUpdate([range]);
                                return;
                            }
                            var startIdx = firstCell.getColIdx();
                            var endIdx = lastCell.getColIdx();
                            var firstCell = tableMatrix.getCell(0, startIdx);
                            var lastCell = tableMatrix.getCell(table.rows.getLast().getRowIdx(), endIdx);
                            var range = new Range({
                                obj: {}
                            }, {
                                obj: {}
                            }, ranges[0].rootView);
                            RangeTools.selectToEditStart(range, firstCell);
                            RangeTools.selectToEditEnd(range, lastCell);
                            sel.selectRangesBeforeUpdate([range]);
                            pe.lotusEditor.needScroll = false;
                            //						sel.select({obj:firstCell,index:0},{obj:lastCell,index:0});
                        }
                    }
                }
            };
            var deleteColumn = function() {
                var sel = pe.lotusEditor.getShell().getSelection();
                if (sel) {
                    var ranges = sel.getRanges();
                    if (ranges && ranges.length > 0) {
                        var startCell = plugin.getStartCell(ranges);
                        var endCell = plugin.getEndCell(ranges);
                        var table = startCell && startCell.getTable();
                        if (!startCell || !endCell || !table || table != endCell.getTable()) {
                            console.info("can not delete column");
                            return;
                        }

                        var startIdx = startCell.getColIdx();
                        var cnt = endCell.getColSpan() + endCell.getColIdx() - startCell.getColIdx();
                        var tableMatrix = table.getTableMatrix(true);
                        if (!tableMatrix){
                            console.info("can not delete column");
                            return;
                        }
                        if (cnt == tableMatrix.length2()) {
                            onDeleteTable();
                            return;
                        }
                        var cursorCell = startCell.previous();
                        if (!cursorCell) {
                            cursorCell = endCell.next();
                        }
                        var deleteCol = [];
                        for (var i = 0; i < cnt; i++) {
                            var currentIdx = startIdx + i;
                            var col = tableMatrix.getColumn(currentIdx);
                            arrayModule.some(col, function(cell){
                                if (cell.getColIdx() == currentIdx){
                                    deleteCol.push(cell);
                                    return true;
                                }
                                return false;
                            });
                        }
                        if (deleteCol.length > 0)
                            plugin.deleteCol(deleteCol);
                        if (cursorCell) {
                            //                          sel.select({obj:cursorCell,index:0},{obj:cursorCell,index:0});
                            var range = new Range({
                                obj: {}
                            }, {
                                obj: {}
                            }, ranges[0].rootView);
                            range.moveToEditStart(cursorCell);
                            sel.selectRangesBeforeUpdate([range]);
                        }
                    }
                }
            };
            var onTableCreate = function(rows, cols) {
                var cursorObj = plugin.createTable(rows, cols);
                if (cursorObj) {
                    var sel = pe.lotusEditor.getShell().getSelection();
                    var range = sel.getRanges()[0];
                    var newRange = new Range({
                        obj: {}
                    }, {
                        obj: {}
                    }, range.rootView);
                    newRange.moveToEditStart(cursorObj);
                    sel.selectRangesBeforeUpdate([newRange]);
                    if (has("ff")) {
                        var nls = i18nlang;
                        var text = dojoString.substitute(nls.acc_inTable, [1, 1]) + " " + nls.acc_blank;
                        pe.lotusEditor && pe.lotusEditor.getShell()._editWindow.announce(text);
                    }
                }
            };
            var onDeleteTable = function() {
                var sel = pe.lotusEditor.getShell().getSelection();
                if (sel) {
                    var range = sel.getRanges()[0];
                    var startModel = range.getStartModel().obj;
                    var table = ModelTools.getAncestor(startModel, constants.MODELTYPE.TABLE);
                    if (!table) {
                        return;
                    }
                    var cursorObj = table.next();
                    if (!cursorObj) {
                        cursorObj = table.previous();
                    }
                    plugin.deleteTable(table);
                    if (cursorObj) {
                        var newRange = new Range({
                            obj: {}
                        }, {
                            obj: {}
                        }, range.rootView);
                        newRange.moveToEditStart(cursorObj);
                        sel.selectRangesBeforeUpdate([newRange]);
                    }


                }

            };
            var onSetTableColor = function(value) {
                if (!value) return;
                var sel = pe.lotusEditor.getShell().getSelection();
                if (sel) {
                    var ranges = sel.getRanges();
                    var cells = plugin.getSelectedCells(ranges);
                    var tValue = value == "autoColor" ? "" : value.substr(1);
                    plugin.setColor(cells, 'background-color', tValue);
                }


            };
            var onSetCellBorder = function(border, pos) {
                var sel = pe.lotusEditor.getShell().getSelection();
                if (sel) {
                    var ranges = sel.getRanges();
                    var cells = plugin.getSelectedCells(ranges);
                    if (cells && cells.length > 0) {
                        plugin.setCellBorder(cells, border, pos);
                    }
                }
            };
            var onTableStyleChange = function(table, newStyle) {
                var cursorObj = plugin.changeStyle(table, newStyle);
                //			var cursorObj = table.next();
                //			if(!cursorObj){
                //				cursorObj = table.previous();
                //			}
                if (cursorObj) {
                    var sel = pe.lotusEditor.getShell().getSelection();
                    var range = sel.getRanges()[0];
                    var newRange = new Range({
                        obj: {}
                    }, {
                        obj: {}
                    }, range.rootView);
                    newRange.moveToEditStart(cursorObj);
                    sel.selectRangesBeforeUpdate([newRange]);
                }
            };
            //		var tableResizer = new writer.plugins.TableResizer();
            //		tableResizer.init(this.editor);
            topic.subscribe(constants.EVENT.BEFORE_SELECT, lang.hitch(this, function(ranges) {
                //			if(tableResizer.isResizing()){
                ////				var start = ranges[0].getStartModel();
                ////				ranges[0].setEndModel(start.obj,start.index);
                //				ranges[0].collapse(true);
                //				return;
                //			}
                for (var rangeIdx = 0; rangeIdx < ranges.length; rangeIdx++) {
                    var range = ranges[rangeIdx],
                        start = range.getStartModel(),
                        end = range.getEndModel();
                    var startInTable = this.inTable(start.obj);
                    var endInTable = end && this.inTable(end.obj);
                    if (!startInTable && !endInTable) {
                        return;
                    }
                    var ownerId = range.rootView.getOwnerId();
                    var owner = range.rootView;
                    var starTable = this.getTable(start.obj);
                    var endTable = this.getTable(end.obj);
                    var isSwapped = RangeTools.isNeedSwap(range);
                    //				if(startInTable != endInTable ||  starTable!=endTable){
                    // for nested table.
                    if (endTable && endTable && starTable != endTable) {
                        if (this.inTable(endTable)) {
                            endTable = this.getTable(endTable.parent);
                            end.obj = this.getCell(end.obj);
                            end.index = 0;
                        }
                        if (this.inTable(starTable)) {
                            starTable = this.getTable(starTable.parent);
                            start.obj = this.getCell(start.obj);
                            start.index = 0;
                        }
                    }
                    if ((starTable || endTable) && starTable != endTable) {
                        if (starTable) {
                            var firstRow = this.getRow(start.obj);
                            if (firstRow) {
                                var allViews = firstRow.getAllViews();
                                var viewers = allViews[ownerId];
                                if (isSwapped) {
                                    var lastRow = viewers.getLast();
                                    var lastTable = lastRow.getParent();
                                    range.setStartView(lastTable, lastRow.getRowIdx() + 1);
                                } else {
                                    var firstRowView = viewers.getFirst();
                                    var firstTable = firstRowView.getParent();
                                    range.setStartView(firstTable, firstRowView.getRowIdx());
                                }
                            }
                        }
                        if (endTable) {
                            var endRow = this.getRow(end.obj);
                            var allViews = endRow.getAllViews();
                            var viewers = allViews[ownerId];
                            if (isSwapped) {
                                var firstRow = viewers.getFirst();
                                var firstTable = firstRow.getParent();
                                range.setEndView(firstTable, firstRow.getRowIdx());
                            } else {
                                var lastRowView = viewers.getLast();
                                var lastTable = lastRowView.getParent();
                                range.setEndView(lastTable, lastRowView.getRowIdx() + 1);
                            }
                            //						console.info("select end this row!");
                        }
                    } else if (endTable) {
                        var startCell = this.isRow(start.obj) ? null : this.getCell(start.obj);
                        var endCell = this.isRow(end.obj) ? null : this.getCell(end.obj);
                        var table = endTable;
						var startRow = endRow = null;
                        if (this.isTable(start.obj)) {
                            if (!isSwapped) {
								startRow = table.getItemByIndex(start.index);
                                startCell = startRow.cells.getFirst();
                            } else {
								startRow = table.getItemByIndex(start.index-1);
                                startCell = startRow.cells.getLast();
                            }
                        } else {
							startRow = this.getRow(start.obj);
                        }
                        if (this.isTable(end.obj)) {
                            if (!isSwapped) {
                                endRow = table.getItemByIndex(end.index - 1);
                                endCell = endRow.cells.getLast();
                            } else {
                                endRow = table.getItemByIndex(end.index);
                                endCell = endRow.cells.getFirst();
                            }
                        } else {
							endRow = this.getRow(end.obj);
                        }
                        if (startCell && startCell == endCell) {
                            var startView = range.getStartView();
                            var endView = range.getEndView();
                            if (!startView || !endView) {
                                return;
                            }
                            var startCellView = this._viewTools.getCell(startView.obj);
                            var endCellView = this._viewTools.getCell(endView.obj);
                            if (!startCellView || !endCellView)
                                return;
                            if (startCellView != endCellView) {
                                if (!isSwapped) {
                                    RangeTools.selectToEnd(range, startCellView);
                                    var newRange = new Range({
                                        obj: {}
                                    }, {
                                        obj: {}
                                    }, owner);
                                    ranges.splice(rangeIdx + 1, 0, newRange);
                                    rangeIdx++;
                                    RangeTools.selectFromStart(newRange, endCellView);
                                    newRange.setEndView(endView.obj, endView.index);
                                } else {
                                    RangeTools.selectFromStart(range, startCellView, true);
                                    var newRange = new Range({
                                        obj: {}
                                    }, {
                                        obj: {}
                                    }, owner);
                                    ranges.splice(rangeIdx + 1, 0, newRange);
                                    rangeIdx++;
                                    RangeTools.selectToEnd(newRange, endCellView, true);
                                    newRange.setEndView(endView.obj, endView.index);
                                }

                            }
                            return;
                        }
                        var tableMatrix = table.getTableMatrix().getArrayMatrix();
						var r1 = startRow.getVRowIdx();
						var r2 = endRow.getVRowIdx();
						var c1 = c2 = c3 = c4 = null;
                        if (startCell) {
							c1 = startCell.getColIdx();
							c3 = c1 + startCell.getColSpan()-1;
                        } else {
							c1 = start.index; // start.obj must be a row!
                            this._hasSwapped && c1--;
                            startCell = startRow.getItemByIndex(c1);
                            if (startCell) {
                                c1 = startCell.getColIdx();
                            } else {
                                console.error("can not find the start cell!");
                            }

							c3 = c1;
                        }
                        if (endCell) {
							c2 = endCell.getColIdx();
							c4 = c2 + endCell.getColSpan()-1;
                        } else {
                            //						console.error("the end cell can not bu null!");
							c2 = end.index;
                            !isSwapped && c2--;
                            endCell = endRow.getItemByIndex(c2);
                            if (endCell) {
                                c2 = endCell.getColIdx();
                            } else {
                                console.error("can not find the end cell!");
                            }
							c4 = c2;
                        }
                        var r = Math.max(r1, r2);
                        r1 = Math.min(r1, r2);
                        r2 = r;
                        var c = Math.max(c1, c2, c3, c4);
                        c1 = Math.min(c1, c2, c3, c4);
                        c2 = c;
                        var currentRange = range;
                        var currentRow = startRow;
						var currentRowIdx = currentRow.getVRowIdx();
						var toPrev = startRow.getVRowIdx() > endRow.getVRowIdx();
                        while (currentRow && currentRowIdx >= r1 && currentRowIdx <= r2) {
                            var i = c1;
                            var tr = tableMatrix[currentRowIdx];
                            if (tr) {
                                startCell = tr[i];
                                while (!currentRow.cells.contains(tr[i]) && i <= c2) {
                                    i++;
                                    startCell = tr[i];
                                }
                                if (!currentRow.cells.contains(startCell)) {
                                    startCell = null;
                                }
                                var j = c2;
                                endCell = tr[j];
                                while (!currentRow.cells.contains(tr[j]) && j >= c1) {
                                    j--;
                                    endCell = tr[j];
                                }
                                if (!currentRow.cells.contains(endCell)) {
                                    endCell = null;
                                }
                            }
                            if (!endCell || !startCell) {
                                console.warn("there may be some error!");
                            } else {
                                var allViews = currentRow.getAllViews();
                                var viewers = allViews[ownerId];
                                var rowView = viewers.getFirst();
                                var startIdx = currentRow.cells.indexOf(startCell);
                                var endIdx = currentRow.cells.indexOf(endCell);
                                while (rowView) {
                                    if (!currentRange) {
                                        currentRange = new Range({
                                            obj: {}
                                        }, {
                                            obj: {}
                                        }, owner);
                                        ranges.splice(rangeIdx + 1, 0, currentRange);
                                        rangeIdx++;
                                    }
                                    if (!isSwapped) {
                                        currentRange.setStartView(rowView, startIdx);
                                        currentRange.setEndView(rowView, endIdx + 1);
                                    } else {
                                        currentRange.setEndView(rowView, startIdx);
                                        currentRange.setStartView(rowView, endIdx + 1);
                                    }
                                    currentRange = null;
                                    rowView = viewers.next(rowView);
                                }
                            }
                            if (toPrev) {
								currentRow = table.vRows.prev(currentRow);
                            } else {
								currentRow = table.vRows.next(currentRow);
                            }
							currentRowIdx = currentRow&&currentRow.getVRowIdx();
                        }
                        delete this._hasSwapped;
                        if (isSwapped) {
                            this._hasSwapped = true;
                        }
                    }
                }
            }));
            var cursor4Resize = function(table) {
                if (!table) {
                    return;
                }
                try {
                    var sel = pe.lotusEditor.getShell().getSelection();
                    if (sel) {
                        var range = sel.getRanges()[0];
                        var startModel = range.getStartModel();
                        var endModel = range.getEndModel();
                        if (that.getTable(startModel.obj) == table || that.getTable(endModel.obj) == table) {
                            return;
                        }
                        var cursorObj = table.rows.getFirst().cells.getFirst();
                        var newRange = new Range({
                            obj: {}
                        }, {
                            obj: {}
                        }, range.rootView);
                        newRange.moveToEditStart(cursorObj);
                        sel.selectRangesBeforeUpdate([newRange]);
                    }
                } catch (e) {
                    console.error(e);
                }
            };

            topic.subscribe(constants.EVENT.RESIZECELL, lang.hitch(this, function(table, coldIdx, delX, rowIdx, delH) {
                if (!table.parent.container.contains(table)) {
                    return;
                }
                var oldCols = table.cols.slice(0);
                delX = Math.round(delX);
                table.resizeColunm(coldIdx, delX);
                var newCols = table.cols;
                var oldColsObj = [],
                    newColsObj = [];
                for (var i in oldCols) {
                    oldColsObj[i] = {};
                    oldColsObj[i].t = "gridCol";
                    oldColsObj[i].w = tools.PxToPt(oldCols[i]) + "pt";
                }
                for (var j in newCols) {
                    newColsObj[j] = {};
                    newColsObj[j].t = "gridCol";
                    newColsObj[j].w = tools.PxToPt(newCols[j]) + "pt";
                }
                var newAttrs = {
                        "cols": newColsObj
                    },
                    oldAttrs = {
                        "cols": oldColsObj
                    };
                var acts = [];
                acts.push(msgCenter.createSetAttributeAct(table, null, null, newAttrs, oldAttrs));
                table.markWidthChange([coldIdx]);


                var msgs = [];
                var msg;
                msg = msgCenter.createTableMsg(table.id, acts);
                msg && msgs.push(msg);


                var row = table.rows.getByIndex(rowIdx);
                var h = row.getBoxHeight();
                if (row.resizeHeight(delH)) {
                    var newH = row.getBoxHeight();;
                    var acts = [];
                    var oldHObj = {
                        "rowH": tools.PxToPt(h) + "pt"
                    };
                    var newHObj = {
                        "rowH": tools.PxToPt(newH) + "pt"
                    };
                    acts.push(msgCenter.createSetAttributeAct(row, null, null, newHObj, oldHObj));

                    msg = msgCenter.createTableMsg(table.id, acts);
                    msg && msgs.push(msg);

                }
                if (msgs.length > 0) {
                    msgCenter.sendMessage(msgs);
                }
                table.update();
                cursor4Resize(table);

            }));
            topic.subscribe(constants.EVENT.RESIZECOLUMN, lang.hitch(this, function(table, coldIdx, delX) {
                if (!table.parent.container.contains(table)) {
                    return;
                }
                var oldCols = table.cols.slice(0);
                delX = Math.round(delX);
                table.resizeColunm(coldIdx, delX);
                table.resizeColunm(coldIdx + 1, 0 - delX);
                var newCols = table.cols;
                var oldColsObj = [],
                    newColsObj = [];
                for (var i in oldCols) {
                    oldColsObj[i] = {};
                    oldColsObj[i].t = "gridCol";
                    oldColsObj[i].w = tools.PxToPt(oldCols[i]) + "pt";
                }
                for (var j in newCols) {
                    newColsObj[j] = {};
                    newColsObj[j].t = "gridCol";
                    newColsObj[j].w = tools.PxToPt(newCols[j]) + "pt";
                }
                var newAttrs = {
                        "cols": newColsObj
                    },
                    oldAttrs = {
                        "cols": oldColsObj
                    };
                var acts = [];
                acts.push(msgCenter.createSetAttributeAct(table, null, null, newAttrs, oldAttrs));
                table.markWidthChange([coldIdx, coldIdx + 1]);
                table.update();
                msgCenter.sendMessage([msgCenter.createTableMsg(table.id, acts)]);
                cursor4Resize(table);
            }));
            topic.subscribe(constants.EVENT.RESIZEROW, lang.hitch(this, function(table, rowIdx, delH) {
                if (!table.parent.container.contains(table)) {
                    return;
                }
                var row = table.rows.getByIndex(rowIdx);
                var h = row.getBoxHeight();
                if (row.resizeHeight(delH)) {
                    var newH = row.getBoxHeight();;
                    var acts = [];
                    var oldHObj = {
                        "rowH": tools.PxToPt(h) + "pt"
                    };
                    var newHObj = {
                        "rowH": tools.PxToPt(newH) + "pt"
                    };
                    acts.push(msgCenter.createSetAttributeAct(row, null, null, newHObj, oldHObj));
                    table.update();
                    msgCenter.sendMessage([msgCenter.createTableMsg(table.id, acts)]);
                    cursor4Resize(table);
                }

            }));
            topic.subscribe(constants.EVENT.RESIZETABLE, lang.hitch(this, function(table, delX, delY) {
                if (!table.parent.container.contains(table)) {
                    console.info("cancel resize table");
                    return;
                }
                var oldCols = table.cols.slice(0);
                var length = oldCols.length;
                var acts = [];
                var del = Math.round(delX / length);
                if (Math.abs(del) > 3) {
                    for (var i = 0; i < length; i++) {
                        table.resizeColunm(i, del);
                    }
                    var newCols = table.cols;
                    var oldColsObj = [],
                        newColsObj = [];
                    for (var i in oldCols) {
                        oldColsObj[i] = {};
                        oldColsObj[i].t = "gridCol";
                        oldColsObj[i].w = tools.PxToPt(oldCols[i]) + "pt";
                    }
                    for (var j in newCols) {
                        newColsObj[j] = {};
                        newColsObj[j].t = "gridCol";
                        newColsObj[j].w = tools.PxToPt(newCols[j]) + "pt";
                    }
                    var newAttrs = {
                            "cols": newColsObj
                        },
                        oldAttrs = {
                            "cols": oldColsObj
                        };
                    acts.push(msgCenter.createSetAttributeAct(table, null, null, newAttrs, oldAttrs));
                    table.markWidthChange();
                }
                del = Math.round(delY / table.rows.length());
                var firstRow = table.rows.getFirst();
                while (firstRow) {
                    var h = firstRow.getBoxHeight();
                    if (firstRow.resizeHeight(del)) {
                        var newH = firstRow.getBoxHeight();
                        var oldHObj = {
                            "rowH": tools.PxToPt(h) + "pt"
                        };
                        var newHObj = {
                            "rowH": tools.PxToPt(newH) + "pt"
                        };
                        acts.push(msgCenter.createSetAttributeAct(firstRow, null, null, newHObj, oldHObj));
                    }
                    firstRow = table.rows.next(firstRow);
                }
                if (acts.length > 0) {
                    table.update();
                    msgCenter.sendMessage([msgCenter.createTableMsg(table.id, acts)]);
                    cursor4Resize(table);
                } else {
                    browser.isMobile() && concord.util.mobileUtil && concord.util.mobileUtil.tableResize.show(null, true);
                }
            }));

	topic.subscribe('flipTable', lang.hitch(this, function(table) {
		if (table) {
			var actPairList = [], msgs = [], newStyle, oldStyle;
			var dir = table.tableProperty.getDirection(true) || "ltr";
			var oldStyle = { "bidiVisual": dir};
			switch (dir) {
				case "rl-tb":
					dir = "lr-tb";
					break;
				case "lr-tb":
					dir = "rl-tb";
					break;
				case "rtl":
					dir = "ltr";
					break;
				case "ltr":
					dir = "rtl";
					break;
			}
			var newStyle = { "bidiVisual": dir };
			table.tableProperty.direction = dir;

			actPairList.push(msgCenter.createSetAttributeAct(table, newStyle, oldStyle,  null, null));
			msgs.push(msgCenter.createTableMsg(table.id, actPairList, constants.MSGCATEGORY.Content));
			table.markFlipTable();
			msgCenter.sendMessage(msgs);
		}
	}));

            var that = this;
            this.commands = [{
                    name: 'createTable',
                    exec: function(args) {
                        if (!args || args.length != 2) {
                            return;
                        }
                        onTableCreate(args[0], args[1]);
                    }
                }, {
                    name: 'createTableState',
                    exec: function(args) {
                        //empty method, just used to disable/hide menu
                    }
                }, {
                    name: 'TableTmplate',
                    exec: function(args) {
                        //empty method, just used to disable menu
                    }
                }, {
                    name: 'deleteTable',
                    exec: function() {
                        onDeleteTable();
                        console.log('delete table commond');
                    }
                }, {
                    name: 'splitTable',
                    exec: function(args) {
                        if (!args || args.length != 2) {
                            return;
                        }
                        return that.splitTable(args[0], args[1]);
                    }
                }, {
                    name: 'setTableColor',
                    exec: function(value) {
                        onSetTableColor(value);
                    }
                }, {
                    name: 'changeTableStyle',
                    exec: function(args) {
                        onTableStyleChange(args[0], args[1]);
                    }
                }, {
                    name: 'insertColBfr',
                    exec: function() {
                        insertColumn("before");
                        //	dojo.publish("insertColumn",["before"]);
                        //		console.log('insertColBfr command.');
                    }
                }, {
                    name: 'table',
                    exec: function(args) {

                    }
                }, {
                    name: 'Cell',
                    exec: function(args) {

                    }
                }, {
                    name: 'row',
                    exec: function(args) {

                    }
                }, {
                    name: 'column',
                    exec: function(args) {

                    }
                }, {
                    name: 'insertColAft',
                    state: constants.CMDSTATE.TRISTATE_HIDDEN,
                    exec: function() {
                        insertColumn("after");
                        //	dojo.publish("insertColumn", ["after"]);
                        //	console.log('insertColAft command.');
                    }
                }, {
                    name: 'deleteCol',
                    exec: function() {
                        deleteColumn();
                        console.log('deleteCol command');
                    }
                }, {
                    name: 'insertRowAbove',
                    exec: function() {
                        insertRow("before");
                        //	dojo.publish("insertRow",["before"]);
                        //	console.log('insertRowAbove command.');
                    }
                }, {
                    name: 'insertRowBelow',
                    state: constants.CMDSTATE.TRISTATE_HIDDEN,
                    exec: function() {
                        insertRow("after");
                        //	dojo.publish("insertRow", ["after"]);
                        //	console.log('insertRowAfter command.');
                    }
                }, {
                    name: 'deleteRow',
                    exec: function() {
                        deleteRow();
                        //	dojo.publish("deleteRow");
                        //	console.log('deleteRow command');
                    }
                }, {
                    name: 'repeatHeader',
                    exec: function() {
                        repeatHeader();
                    }
                }, {
                    name: 'mergeCells',
                    exec: function() {
                        onMergeCell();
                        //	dojo.publish("onMergeCell");
                        //	console.log('mergeCells command');
                    }
                }, {
                    name: 'showSplitCellDlg',
                    exec: function() {
                        onShowSplitCellDlg();
                        console.log('splitCell command');
                    }
                }, {
                    name: 'splitCell',
                    exec: function() {
                        onSplitCell(arguments[0].r, arguments[0].c);
                        console.log('splitCell command');
                    }
                }, {
                    name: 'cellProperties',
                    exec: function() {
                        onCellPropertiesDlg();
                        console.log('cell properties command');
                    }
                }, {
                    name: 'tableProperties',
                    exec: function() {
                        onTablePropertiesDlg();
                        console.log('table properties command');
                    }
                },
                {
                    name: 'BackColor',
                    exec: function() {
                        console.log('BackColor command');
                    }
                }, {
                    name: 'setCellBorder',
                    exec: function(args) {
                        onSetCellBorder(args[0], args[1]);
                    }
                }
            ];

            for (var i in this.commands) {
                this.editor.addCommand(this.commands[i].name, this.commands[i]);
            }

            var nls = i18nmenubar;
            var ctx = this.editor.ContextMenu;
            var dirAttr = window.BidiUtils.isGuiRtl() ? 'rtl' : '';
            this.colMenuItems = {
                'insertColBfr': {
                    name: 'insertColBfr',
                    commandID: 'insertColBfr',
                    label: nls.ctxMenuAddSTColBfr,
                    group: 'Column',
                    order: 'insertColBfr',
                    disabled: true,
                    dir: dirAttr
                },
                'insertColAft': {
                    name: 'insertColAft',
                    commandID: 'insertColAft',
                    label: nls.ctxMenuAddSTColAft,
                    group: 'Column',
                    order: 'insertColAft',
                    disabled: true,
                    dir: dirAttr
                },
                'deleteCol': {
                    name: 'deleteCol',
                    commandID: 'deleteCol',
                    label: nls.ctxMenuDelSTCol,
                    group: 'Column',
                    order: 'deleteCol',
                    disabled: true,
                    dir: dirAttr
                }
            };
            this.rowMenuItems = {
                'insertRowAbove': {
                    name: 'insertRowAbove',
                    commandID: 'insertRowAbove',
                    label: nls.ctxMenuAddSTRowAbv,
                    group: 'Row',
                    order: 'insertRowAbove',
                    disabled: true,
                    dir: dirAttr
                },
                'insertRowBelow': {
                    name: 'insertRowBelow',
                    commandID: 'insertRowBelow',
                    label: nls.ctxMenuAddSTRowBlw,
                    group: 'Row',
                    order: 'insertRowBelow',
                    disabled: true,
                    dir: dirAttr
                },
                'deleteRow': {
                    name: 'deleteRow',
                    commandID: 'deleteRow',
                    label: nls.ctxMenuDelSTRow,
                    group: 'Row',
                    order: 'deleteRow',
                    disabled: true,
                    dir: dirAttr
                }         
            };

            var palette = registry.byId("D_ctx_BackgroundColor");
            	if(!palette) 
            		palette = new ColorPalette({
                id: "D_ctx_BackgroundColor",
                colorType: "BackColor",
                palette: "7x10",
                onOpen: function(val) {
                    if (pe.lotusEditor) {
                        var plugin = pe.lotusEditor.getPlugin && pe.lotusEditor.getPlugin("Table");
                        if (plugin) {
                            var color = plugin.getColor();
                            var colorPallete = this;
                            this.focus();
                            this._currentColor = color.toUpperCase();
                            if ("autoColor" == color || color == "auto") {
                                if (colorPallete._selectedCell >= 0) {
                                    domClass.remove(colorPallete._cells[colorPallete._selectedCell].node, "dijitPaletteCellSelected");
                                }
                                colorPallete._selectedCell = -1;
                                colorPallete.autoNode.focus();
                                this.focusSection = "autonode";
                            } else {
                                var index = colorPallete.colorMap[color.toUpperCase()];
                                if (index != undefined) {
                                    if (colorPallete._selectedCell >= 0) {
                                        domClass.remove(colorPallete._cells[colorPallete._selectedCell].node, "dijitPaletteCellSelected");
                                    }
                                    colorPallete._selectedCell = -1;
                                    colorPallete.setFocus(colorPallete._cells[index].node);
                                    colorPallete.focus();
                                } else {
                                    if (colorPallete._selectedCell >= 0) {
                                        domClass.remove(colorPallete._cells[colorPallete._selectedCell].node, "dijitPaletteCellSelected");
                                    }
                                    colorPallete._selectedCell = -1;
                                    colorPallete.setFocus(colorPallete._cells[0].node);
                                    colorPallete.focus();
                                }
                                this.focusSection = "gridnode";
                            }
                        }
                    }
                },
                onChange: function(val) {
                    if (val == 'autoColor') {
                        if (this._selectedCell >= 0) {
                            domClass.remove(this._cells[this._selectedCell].node, "dijitPaletteCellSelected");
                            this._selectedCell = -1;
                        }
                    } else
                        this._antoColorNode && domStyle.set(this._antoColorNode, 'border', '');
                    setTimeout(function() {
                        pe.lotusEditor.execCommand("setTableColor", val);
                    }, 10);
                }
            });

            //		console.log("pallet value is"+palette);
            this.cellMenuItems = {
                'CellColor': {
                    name: 'setTableColor',
                    commandID: 'setTableColor',
                    label: nls.tableMenu_SetTableColor,
                    group: 'Cell',
                    order: 'setTableColor',
                    disabled: true,
                    popup: palette,
                    dir: dirAttr

                },
                'mergeCells': {
                    name: 'mergeCells',
                    commandID: 'mergeCells',
                    label: nls.ctxMenuMergeCells,
                    group: 'Cell',
                    order: 'mergeCells',
                    disabled: true,
                    dir: dirAttr
                },
                'splitCell': {
                    name: 'splitCell',
                    commandID: 'showSplitCellDlg',
                    label: nls.ctxMenuSplitCells,
                    group: 'Cell',
                    order: 'splitCell',
                    disabled: false,
                    dir: dirAttr
                }
            };
            if (rowToolbarMenu) {
                this.bindSubMenu(rowToolbarMenu, "row");
            }
            if (colToolbarMenu) {
                this.bindSubMenu(colToolbarMenu, "col");
            }
            //register selection change event
            topic.subscribe(constants.EVENT.SELECTION_CHANGE, lang.hitch(this, this.onSelectionChange));
            this.menuItems = {
                'Column': {
                    name: 'Column',
                    commandID: 'column',
                    label: nls.ctxMenuSTCol,
                    group: 'table',
                    order: 'Column',
                    disabled: false, //true
                    dir: dirAttr
                },

                'Row': {
                    name: 'Row',
                    commandID: 'row',
                    label: nls.ctxMenuSTRow,
                    group: 'table',
                    order: 'Row',
                    disabled: false, //true
                    dir: dirAttr
                },

                'Cell': {
                    name: 'Cell',
                    commandID: 'Cell',
                    label: nls.ctxMenuSTCell,
                    group: 'table',
                    order: 'Cell',
                    disabled: false, //true
                    dir: dirAttr
                },
                'deleteTable': {
                    name: 'deleteTable',
                    commandID: 'deleteTable',
                    label: nls.ctxMenuDeleteSTTable,
                    group: 'deleteTable',
                    order: 'deleteTable',
                    disabled: false,
                    dir: dirAttr
                }

            };
            if (ctx && ctx.addMenuItem) {
                for (var i in this.menuItems) {
                    ctx.addMenuItem(this.menuItems[i].name, this.menuItems[i]);
                }
            }


            if (ctx && ctx.addListener) ctx.addListener(function(target, selection) {
                var isInTable = false,
                    canMergeCells = false,
                    canSplitCell = false,
                    canInsert = false,
                    canDeleteRow = false,
                    canDeleteCol = false,
                    canRepeatHeader = false,
                    ret = {};

                function retFun(result) {
                    if (result.isInTable) {
                        ret.Column = {
                            disabled: false
                        };
                        ret.Row = {
                            disabled: false
                        };
                        ret.Cell = {
                            disabled: false
                        };
                        ret.deleteTable = {
                            disabled: false
                        };
                        //					ret.setTableProperties = {disabled:false};
                    } else {
                        return;
                    }
                    ret.Column.subWidget = plugin.colSubMenuCtx.menu ? plugin.colSubMenuCtx.menu : plugin.bindSubMenu(new Menu({
                        dir: dirAttr
                    }), "col", true);
                    ret.Row.subWidget = plugin.rowSubMenuCtx.menu ? plugin.rowSubMenuCtx.menu : plugin.bindSubMenu(new Menu({
                        dir: dirAttr
                    }), "row", true);
                    ret.Cell.subWidget = plugin.cellSubMenuCtx.menu ? plugin.cellSubMenuCtx.menu : plugin.bindSubMenu(new Menu({
                        dir: dirAttr
                    }), "cell", true);
                    return ret;
                }
                var result = plugin.getStateBySel(selection);
                return retFun(result);
            });
        }
    });
    return TablePlugin;
});
