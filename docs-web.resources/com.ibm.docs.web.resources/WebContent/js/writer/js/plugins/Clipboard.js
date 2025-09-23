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
    "writer/global",
    "dojo/string",
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/dom-style",
    "dojo/has",
    "dojo/i18n!concord/widgets/nls/menubar",
    "dojo/i18n!concord/widgets/nls/InsertImageDlg",
    "dojo/i18n!concord/widgets/nls/CKResource",
    "dojo/json",
    "dojo/query",
    "writer/msg/msgHelper",
    "concord/util/browser",
    "writer/constants",
    "writer/filter/JsonToHtml",
    "writer/msg/msgCenter",
    "writer/filter/HtmlToJson",
    "writer/core/Range",
    "writer/model/text/Run",
    "writer/plugins/Plugin",
    "writer/plugins/copyfilter/filter",
    "writer/plugins/pastefilter/filter",
    "writer/util/ModelTools",
    "writer/util/RangeTools",
    "writer/util/TableTools",
    "writer/util/ViewTools",
    "writer/track/trackChange"
], function(global, dojoString, declare, lang, domStyle, has, i18nmenubar, i18nInsertImageDlg, i18nCKResource, JSON, query, msgHelper, browser, constants, JsonToHtml, msgCenter, HtmlToJson, Range, Run, Plugin, pluginsCopyfilterFilter, filter, ModelTools, RangeTools, TableTools, ViewTools, trackChange, ConfirmBox, i18nTrack) {

    var Clipboard = declare("writer.plugins.Clipboard", Plugin, {
        filter: null,
        /**
         * get internal web clipboard data
         * @returns
         */
        getWebClipBoardData: function() {
            if (!this.webClipBoardData) {
                var webClipData = this.getWebClipBoard().getData();
                if (webClipData && (has("ie") || has("trident")))
                    webClipData = JSON.parse(webClipData);
                this.webClipBoardData = webClipData && JSON.parse(webClipData);
            }
            return this.webClipBoardData;
        },
        /**
         * get webclip board
         */
        getWebClipBoard: function() {
            if (!this.webClipBoard)
                this.webClipBoard = pe.scene.getDocClipBoard();
            return this.webClipBoard;
        },
        /**
         * set webclip board data
         * @param data
         */
        setWebClipBoardData: function(data) {
            this.getWebClipBoard();
            this.cleanWebClipBoard();
            if (has("ie") || has("trident"))
                data = JSON.stringify(data);
            this.getWebClipBoard().setData(data);
        },
        /**
         * clean web clipboard data
         */
        cleanWebClipBoard: function() {
            this.getWebClipBoard().emptyClipboard();
            this.webClipBoardData = null;
            delete this.webClipBoard;
        },
        /**
         * filter paste content
         */
        filterPaste: function(m, bInternal, pasteBin) {
            var webClipData = bInternal ? (this.getWebClipBoardData()) : null;
            this.filter = new filter(webClipData);

            m = this.filter.filter(m, webClipData, pasteBin);
            if (m) {
                var that = this;
                var container = m.hints || (m.getContainer && m.getContainer());

                if (container) {
                    container.forEach(function(item) {
                        that.filterPaste(item, webClipData, pasteBin);
                    });
                }
            }
            return m;
        },

        filterText: function(json, bInternal, pasteBin) {
            var webClipData = bInternal ? (this.getWebClipBoardData()) : null;
            this.filter = new filter(webClipData);
            return this.filter.filterText(json, webClipData, pasteBin);
        },
        /**
         * init function
         */
        init: function() {
            var editor = this.editor;
            var ClipboardPlugin = this;
            /**
             * get clip board node
             * 
             * @param bPaste
             * @returns
             */
            function getClipboard(bPaste) {
                return editor.getShell().getInputNode();
            }
            /**
             * clean clipboard content
             * 
             * @param clipboard
             */
            function cleanClipboard(clipboard) {
                clipboard.innerHTML = "";
                ClipboardPlugin.webClipBoardData = null;
                select(clipboard, true);
            }

            /**
             * select the clipboard node
             * 
             * @param node
             */
            function select(element, bElement) {
                if (browser.isMobile())
                    return;
                var doc = element.ownerDocument,
                    win = doc.parentWindow || doc.defaultView;
                /*
                 * select body
                 */
                var native_range;
                if (doc.body.createControlRange) // ie??
                {
                    try {
                        native_range = doc.body.createControlRange();
                        native_range.addElement(element);
                        native_range.select();
                    } catch (e) {
                        native_range = doc.body.createTextRange();
                        native_range.moveToElementText(element);
                        native_range.select();
                    }

                } else {
                    native_range = doc.createRange();
                    if (bElement && !has("edge"))
                        native_range.selectNode(element);
                    else
                        native_range.selectNodeContents(element);
                    var sel = win.getSelection();
                    sel.removeAllRanges();
                    sel.addRange(native_range);
                }
            }


            function _isContainer(model) {
                if (!model)
                    return false;
                return (model.rt == constants.RUNMODEL.FIELD_Run || model.rt == constants.RUNMODEL.LINK_Run);
            }

            function _updateBlock(m, author) {
                if (m.modelType == constants.MODELTYPE.PARAGRAPH) {
                    _updatePara(m, author);
                } else if (m.modelType == constants.MODELTYPE.TABLE) {
                    var paras = m.getParagraphs();
                    for (var i = 0; i < paras.length; i++) {
                        _updatePara(paras[i], author);
                    }
                }
            }

            editor.addIndicatorInModel = function(m, bInternal) {
                if (m && pe.scene.isTrackAuthor()) {
                    //process some filter
                    var mIndicator = ClipboardPlugin.filterPaste(m, bInternal, getClipboard(true));
                    if (mIndicator) {
                        _updateBlock(mIndicator, pe.scene.getCurrUserId());
                        m = mIndicator;
                    }
                }
                return m;
            };

            editor.fitlerIndicatorInJson = function(json, bInternal) {
                return _filterJsonContent(json, bInternal);
            };

            function _updatePara(m, author) {
                m.container.forEach(function(item) {
                    if (item && item.modelType == constants.MODELTYPE.TEXT) {
                        item.author = author;
                    }
                });
            }

            function _filterJsonContent(jsonObj, bInternal, avoidCheckCmds) {
                var cnt = jsonObj;
                if (cnt._fromClip)
                    delete cnt._fromClip;
                var pasteBin = getClipboard(true);
                pasteBin.avoidCheckCmds = avoidCheckCmds || [];
                //always filter all text
                return ClipboardPlugin.filterText(cnt, bInternal, getClipboard(true));
            };

            /**
             * insert json contents
             * 
             * @param jsonArray
             */
            function insertJsonContents(jsonArray, bInternal) {
                // Insert contents
                var prevBlock, cnt;
                //prepare for table
                var selTable = null,
                    startRow = -1,
                    startColumn = -1,
                    endRow = -1,
                    endColumn = -1;
                var startTable = null,
                    endTable = null;
                try {
                    // 1. Check paste context.
                    // 1.1 Paste in table, selection in one table
                    var selection = editor.getSelection(),
                        ranges = selection.getRanges();
                    if (!RangeTools.canDo(ranges)) {
                        /*if the range is crossing more than one footnote/endnote, it can not delete anything.				 */
                        return;
                    }
                    var start = ranges[0].getStartModel(),
                        end = ranges[ranges.length - 1].getEndModel();
                    starTable = ModelTools.getTable(start.obj);
                    endTable = ModelTools.getTable(end.obj);
                    // select from the paragraph to table, the paste action will not be responded. 
                    if ((starTable || endTable) && (starTable != endTable)) {
                        var newRange = new Range(start, start, ranges[0].rootView);
                        selection.selectRanges([newRange]);
                        return;
                    }
                    if (ranges.length > 1) {
                        var selectTableInfo = selection.getSelectedTable();
                        if (selectTableInfo["startTable"]) {
                            // Select multiple columns/rows
                            selTable = selectTableInfo["startTable"];
                            startRow = selectTableInfo["startTableStartRow"];
                            startColumn = selectTableInfo["startTableStartColumn"];
                            endRow = selectTableInfo["startTableEndRow"];
                            endColumn = selectTableInfo["startTableEndColumn"];
                        }
                    } else { // Select rows
                        var range = ranges[0];
                        var startSelectTable = range.getStartRowColumn();
                        var endSelectTable = range.getEndRowColumn();
                        if (startSelectTable && endSelectTable && endSelectTable.selTable == startSelectTable.selTable) {
                            // Select cells in same row 
                            selTable = startSelectTable.selTable;
                            startRow = startSelectTable.rowIndex;
                            startColumn = startSelectTable.columnIndex;
                            endRow = endSelectTable.rowIndex;
                            endColumn = endSelectTable.columnIndex;
                        } else if (startSelectTable)
                            selTable = startSelectTable.selTable; // Case #3. Will paste content into this table
                    }
                } catch (e) {
                    console.error(e.message);
                }

                msgCenter.beginRecord();
                try {

                    //filter json before inserting
                    var tempArray = [],
                        avoidCheckCmds = [];
                    if (startRow >= 0) {
                        avoidCheckCmds.push("createTable");
                    }

            	    var trackStop = trackChange.isOverMaxTxtSizeLmt();
                    if(trackStop)
              	        trackChange.pause();

                    //delete selected contents first.
                    var msgs = [];
                    var range = selection.getRanges()[0];
                    if (!range.isCollapsed()) {
                        var tmpMsg = range.deleteContents(true, true);
                        for (var i = 0; i < tmpMsg.length; i++)
                            msgs.push(tmpMsg[i]);
                    }

                    if(trackStop)
                    	msgs = msgs.concat(trackChange.insertOverLmtText(trackStop));

                    msgCenter.sendMessage(msgs);

                    if(trackStop){
                    	trackChange.resume();
                    	trackChange.showOverTrackTxtLmtMsg(); 
                    }                    

                    for (var i = 0; i < jsonArray.length; i++) {
                        cnt = _filterJsonContent(lang.clone(jsonArray[i]), bInternal, avoidCheckCmds);
                        cnt && tempArray.push(cnt);
                    }

                    jsonArray = tempArray;
                    if (jsonArray.length == 0) {
                        msgCenter.endRecord();
                        return;
                    }

                    var isPasteInTable = false;
                    if (selTable) {
                        var cursorCell = null;
                        if (startRow >= 0 && jsonArray.length == 1 && jsonArray[0].t == "tbl") {
                            isPasteInTable = true;

                            var tableMatrix = selTable.getTableMatrix();
                            var tableJson = lang.clone(jsonArray[0]);
                            var rowsJson = tableJson.trs;
                            var colLength = tableJson.tblGrid.length;

                            // 1.2 Selection in table, and paste object is one table will paste content into table.
                            if (startRow == endRow && startColumn == endColumn) {
                                // No selection will copy from current position to the end of Table
                                endRow = Math.min(selTable.rows.length() - 1, startRow + rowsJson.length - 1);
                                endColumn = Math.min(selTable.cols.length, startColumn + colLength);
                                // Move cursor to this cell
                                cursorCell = tableMatrix.getCell(startRow, startColumn);
                            }

                            var cellJson, rowIdx, colIdx;
                            for (var i = startRow; i <= endRow; i++) {
                                for (var j = startColumn; j < endColumn; j++) {
                                    cell = tableMatrix.getCell(i, j);
                                    // Vertical merge and horizontal merge
                                    if (cell.isMergedCell() || cell.parent.getRowIdx() != i || cell.getColIdx() != j)
                                        continue;

                                    rowIdx = (i - startRow) % rowsJson.length;
                                    colIdx = (j - startColumn) % colLength;

                                    cellJson = rowsJson[rowIdx].tcs[colIdx];
                                    var parasJson = (cellJson && cellJson.ps) || [ModelTools.getEmptyParagraphSource()]; // If no paragraph will replace an empty paragraph
                                    cell.replaceContent(parasJson, bInternal);
                                }
                            }
                        } else if ((endRow - startRow > 0 || endColumn - startColumn > 0)) {
                            // 1.3 Selection is select some row/column and paste.
                            isPasteInTable = true;
                            selection.store();

                            var tableMatrix = selTable.getTableMatrix();
                            var cell, contentIndex, insertContent;
                            var indexOffset = 0,
                                appendParas = []; // Use it for add offset for paste table and next paragraph
                            // Select rows, columns, rows and columns
                            for (var j = startColumn; j < endColumn; j++) {
                                indexOffset = 0;
                                for (var i = startRow; i <= endRow; i++) {
                                    cell = tableMatrix.getCell(i, j);
                                    // Vertical merge and horizontal merge
                                    if (cell.isMergedCell() || cell.parent.getRowIdx() != i || cell.getColIdx() != j)
                                        continue;
                                    contentIndex = (i - startRow + indexOffset) % jsonArray.length;

                                    if ((i - startRow + indexOffset) > jsonArray.length)
                                        indexOffset = 0;

                                    insertContent = lang.clone(jsonArray[contentIndex]);

                                    // Content is table need resize and paste with next paragraph or append new paragraph at the end.
                                    appendParas = [insertContent];
                                    while (insertContent && insertContent.t == "tbl") {
                                        var cellWidth = cell.getContentWidth();
                                        TableTools.resizeTable(insertContent, cellWidth);

                                        if (contentIndex < jsonArray.length - 1) {
                                            contentIndex++;
                                            insertContent = lang.clone(jsonArray[contentIndex]);
                                            appendParas.push(insertContent);
                                            indexOffset++;
                                        } else {
                                            // Append a new empty paragraph after table
                                            appendParas.push(ModelTools.getEmptyParagraphSource());
                                            break;
                                        }
                                    }
                                    cell.replaceContent(appendParas, bInternal);
                                }
                            }
                        } else {
                            // Change pasted table Size with cell's width
                            var cellWidth = -1,
                                cloneJsonArray = null;
                            //defect 43762 DO NOT NEED TO CHANGE SOURCE DATE IN THE CLIPBOARD
                            jsonArray = lang.clone(jsonArray);
                            for (var i = 0; i < jsonArray.length; i++) {
                                if (jsonArray[i].t == "tbl") {
                                    if (cellWidth == -1) { // Late initialized
                                        // Case #3 get the first selected cell.
                                        var cell = ModelTools.getCell(range.getStartModel().obj);
                                        if (cell) {
                                            cellWidth = cell.getContentWidth();
                                        }
                                    }
                                    if (cellWidth > 0)
                                        TableTools.resizeTable(jsonArray[i], cellWidth); // Change the cloned JSON Array
                                }
                            }
                        }

                        // Defect 40614, Cell content changed and restore selection.
                        if (isPasteInTable && selTable) {
                            if (cursorCell) {
                                var newRange = new Range({
                                    obj: {}
                                }, {
                                    obj: {}
                                }, ranges[0].rootView);
                                newRange.moveToEditStart(cursorCell);
                                selection.selectRangesBeforeUpdate([newRange]);
                            } else {
                                var newRanges = [],
                                    cell, tableMatrix = selTable.getTableMatrix();
                                for (var j = startColumn; j < endColumn; j++) {
                                    for (var i = startRow; i <= endRow; i++) {
                                        if (cell = tableMatrix.getCell(i, j)) {
                                            var start = {};
                                            var end = {};
                                            start.obj = end.obj = cell;
                                            start.index = 0;
                                            end.index = cell.container.length();
                                            var newRange = new Range(start, end, ranges[0].rootView);
                                            newRanges.push(newRange);
                                        }

                                    }
                                }
                                selection.selectRangesBeforeUpdate(newRanges);
                            }
                        }
                    }

                    var fac = global.modelFac;

                    // 2. Insert content into Model
                    // Normal paste case.
                    for (var i = 0; !isPasteInTable && i < jsonArray.length; i++) {
                        cnt = jsonArray[i];
                        if (cnt.t == null) { // rich text
                            // <span>...</span>
                            if (cnt.rt)
                                editor.getShell().insertInlineObj(cnt);
                            else if (cnt.fmt && cnt.fmt.length > 0)
                                editor.getShell().insertText(cnt);
                        } else { // block element
                            //process some filter
                            var m = fac.createModel(cnt, editor.document);
                            if (m) {
                                if (!prevBlock) {
                                    editor.getShell().insertBlock(m);
                                } else {
                                	if (!ModelTools.isTrackable(prevBlock))
                                		m.cleanCh();
                                    prevBlock.parent.insertAfter(m, prevBlock);
                                    msgCenter.sendMessage([msgCenter.createMsg(constants.MSGTYPE.Element, [msgCenter.createInsertElementAct(m)])]);
                                }

                                if (m.hints) {
                                    m.hints.forEach(function(hint) {
                                        if (hint.modelType == constants.MODELTYPE.FIELD && hint.isPageNumber() && hint.getText() == "#") {
                                            hint.update(true, true);
                                        }
                                    });
                                }
                                prevBlock = m;
                            }
                        }
                    }

                    //check last hint in document is a page break
                    //then append an empty paragraph
                    var lastPara = editor.document.lastChild();
                    if (lastPara.modelType == constants.MODELTYPE.PARAGRAPH) {
                        //last paragraph in document
                        //and last insert
                        var lastHint = lastPara.lastChild();
                        while (lastHint && !lastHint.br && lastHint.length == 0)
                            lastHint = lastHint.previous();

                        if (lastHint && lastHint.br && (lastHint.br.type == "page")) {
                            //need append an empty paragraph for page 
                            var emptyPara = lastPara.toJson(0, 0, true);
                            emptyPara.id = msgHelper.getUUID();
                            emptyPara = fac.createModel(emptyPara, editor.document);
                            lastPara.parent.insertAfter(emptyPara, lastPara);
                            msgCenter.sendMessage([msgCenter.createMsg(constants.MSGTYPE.Element, [msgCenter.createInsertElementAct(emptyPara)])]);
                        }
                    }

                    var updateStyles = pe.lotusEditor.updateStyles;
                    for (var i = 0; updateStyles && (i < updateStyles.length); i++) {
                        updateStyles[i].updateReferers();
                    }
                    updateStyles && delete pe.lotusEditor.updateStyles;

                } catch (e) {
                    console.error(e.message);
                }
                msgCenter.endRecord();

            }

            var pasteCommand = {
                exec: function() {
                    var clipboard = getClipboard(true);
                    select(clipboard, true);
                    editor.isPasting = true;
                    var pasteFunc = function() {
                        window.setTimeout(
                            function() {
                                // get paste content and
                                // clear clipboard iframe
                                try {
                                    var child = clipboard.childNodes.length == 1 && clipboard.firstChild;
                                    if (child && child.nodeName.toLowerCase() == "img") { //allow single image
                                        var src = child.src;
                                        if (src && (src.length * 0.75) > (g_maxImgSize * 1024)) {
                                            //image is too large 
                                            var nls = i18nInsertImageDlg;
                                            pe.scene.showPasteImgErrorDialog(dojoString.substitute(nls.maxSize, [g_maxImgSize]), 2000);
                                            editor.isPasting = false;
                                            cleanClipboard(clipboard);
                                            return;
                                        } else {
                                            if (child.complete == false || child.getAttribute("onloading")) {
                                                //image is not finish loading
                                                pasteFunc();
                                                return;
                                            }
                                            var width = child.width;
                                            var selection = pe.lotusEditor.getSelection();;
                                            var range = selection.getRanges()[0];
                                            if (range) {
                                                var view = range.getStartView().obj;
                                                var container = ViewTools.getBody(view) || ViewTools.getTableContainer(view);
                                                var maxWidth = container && container.getWidth();
                                                if (maxWidth && (width > maxWidth)) {
                                                    domStyle.set(child, "width", maxWidth + "px");
                                                }
                                            }
                                        }
                                    } else if (clipboard.innerHTML.length > 1000 * 1024) {
                                        var tnls = i18nCKResource;
                                        var msg = tnls.clipboard.pasteMaxMsg;
                                        //concord.util.dialogs.alert(msg);
                                        pe.scene.showPasteTextErrorDialog(msg);
                                        editor.isPasting = false;
                                        cleanClipboard(clipboard);
                                        return;
                                    }
                                    var html = clipboard.innerHTML;
                                    var tmp = query("[_fromClip]", clipboard);
                                    var clipId = tmp && tmp[0] && tmp[0].getAttribute("_fromClip");
                                    if (window.g_concordInDebugMode) {
                                        console.log("html = " + html);
                                        console.log("_fromClip = " + clipId);
                                    }
                                    var external = false;
                                    if (clipId && editor._webClipData && clipId == editor._webClipData.id) { //
                                        insertJsonContents(editor._webClipData.data, true);
                                    } else if (clipId) { // from
                                        // internal
                                        // web clipboard
                                        var webClipData = ClipboardPlugin.getWebClipBoardData();
                                        //										webClipData && console.log( webClipData.id );
                                        if (webClipData && webClipData.id == clipId)
                                            insertJsonContents(webClipData.data, true);
                                        else
                                            external = true;
                                    } else {
                                        external = true;
                                    }

                                    if (external && html != "") {
                                        // paste external
                                        if (editor._webClipData)
                                            delete editor._webClipData;
                                        var converter = new HtmlToJson();
                                        var jsonArray = converter.toJson(html);
                                        if (jsonArray && jsonArray.length)
                                            insertJsonContents(jsonArray);
                                    }

                                    cleanClipboard(clipboard);
                                } catch (e) {
                                    console.error(e.message);
                                }
                                editor.isPasting = false;
                            }, 50);
                    };
                    pasteFunc();
                    return false;
                }
            };

            var copyCommand = function(isCut) {
                this._isCut = isCut;
            };

            copyCommand.prototype.exec = function() {
            	var selection = editor.getSelection(),
                ranges = selection.getRanges();
                if (ranges.length == 1 && ranges[0].isCollapsed())
                    //select nothing
                        return false;

            	if(this._isCut){
            	    var trackStop = trackChange.isOverMaxTxtSizeLmt();
                    if(trackStop)
              	        trackChange.pause();
                    var doCut = this.doCopy(trackStop);
                    if(trackStop){
                    	trackChange.resume();
                    	trackChange.showOverTrackTxtLmtMsg(); 
                    }
              		return doCut;

            	} else {
                	return this.doCopy();
            	}
            };

            copyCommand.prototype.doCopy = function(overTrackContent){

                // extract contents
                //			console.log("copy command!!!");
                var result = [],
                    selection = editor.getSelection(),
                    ranges = selection.getRanges();
                var copyFilter = new pluginsCopyfilterFilter();
                var styleFilter = function(m) {
                    copyFilter.filter(m, editor);
                };
                //check ranges in same table cell and split in different page
                ranges = RangeTools.mergeRangesInCrossPageCell(ranges);
                var canDel = RangeTools.canDo(ranges, true);
                var limitedCopyCount = 1000;
                if ((has("ie") || has("trident")))
                    limitedCopyCount = 500;
                var jsonArray = [],
                    jsonData;
                if (ranges.length > 1) {
                    // 1. Get start row, end row, start column, end column.
                    var selectTableInfo = selection.getSelectedTable();

                    // 2. Extract contents
                    var hasExtactStartTable = false,
                        hasExtractEndTable = false;
                    msgCenter.beginRecord();
                    try {
                        for (var i = ranges.length - 1; i > -1; i--) {
                            var range = ranges[i];
                            var extracted = false;
                            // The ranges select from table 
                            if (selectTableInfo["startTable"]) {
                                var startSelectTable = range.getStartRowColumn();
                                if (startSelectTable && startSelectTable.selTable == selectTableInfo["startTable"]) {
                                    if (!hasExtactStartTable) {
                                        var sRow = selectTableInfo["startTableStartRow"];
                                        var eRow = selectTableInfo["startTableEndRow"];
                                        var sCol = selectTableInfo["startTableStartColumn"];
                                        var eCol = selectTableInfo["startTableEndColumn"];

                                        // fix defect 53726
                                        if (sCol != eCol) {
                                            var startTableJson = selectTableInfo["startTable"].toJson(sRow, eRow, sCol, eCol);
                                            result.push(startTableJson);
                                            copyFilter.filterTable(selectTableInfo["startTable"], editor, sRow, eRow, sCol, eCol);

                                            jsonData = copyFilter.filterJson(startTableJson, editor, startTableJson.parentJson);
                                            if (jsonData)
                                                jsonArray.push(jsonData);
                                            hasExtactStartTable = true;
                                        }
                                    }
                                    extracted = true;
                                }
                            }

                            if (selectTableInfo["endTable"]) {
                                var endSelectTable = range.getEndRowColumn();
                                if (endSelectTable && endSelectTable.selTable == selectTableInfo["endTable"]) {
                                    if (!hasExtractEndTable) {
                                        var sRow = selectTableInfo["endTableStartRow"];
                                        var eRow = selectTableInfo["endTableEndRow"];
                                        var sCol = selectTableInfo["endTableStartColumn"];
                                        var eCol = selectTableInfo["endTableEndColumn"];

                                        // fix defect 53726
                                        if (sCol != eCol) {
                                            var endTableJson = selectTableInfo["endTable"].toJson(sRow, eRow, sCol, eCol);
                                            result.push(endTableJson);
                                            copyFilter.filterTable(selectTableInfo["endTable"], editor, sRow, eRow, sCol, eCol);
                                            
                                            jsonData = copyFilter.filterJson(endTableJson, editor, endTableJson.parentJson);
                                            if (jsonData)
                                                jsonArray.push(jsonData);
                                            hasExtractEndTable = true;
                                        }

                                    }
                                    extracted = true;
                                }
                            }

                            if (!extracted) {
                                var extResult = range.extractContents(styleFilter, null, limitedCopyCount);
                                for (var j = 0; j < extResult.length; j++) {
                                    jsonData = copyFilter.filterJson(extResult[j], editor, extResult[j].parentJson);
                                    if (jsonData)
                                        jsonArray.push(jsonData);
                                }
                                result = extResult ? result.concat(extResult) : result;
                            }

                            if (this._isCut && canDel) 
                             	msgCenter.sendMessage(range.deleteContents(true, true));
                        }
                    } catch (e) {
                        console.error("Copy command exception:" + e);
                    }
                    msgCenter.endRecord();
                } else if (ranges.length == 1) {
                    var range = ranges[0];

                    var isSelectCell = false;
                    var startSelectTable = range.getStartRowColumn();
                    var endSelectTable = range.getEndRowColumn();
                    if (startSelectTable && endSelectTable && endSelectTable.selTable == startSelectTable.selTable) {
                        // Select cells in same row 
                        var selTable = startSelectTable.selTable,
                            sRowIdx = startSelectTable.rowIndex,
                            eRowIdx = endSelectTable.rowIndex;
                        var sColIdx = startSelectTable.columnIndex;
                        eColIdx = endSelectTable.columnIndex;
                        if (sRowIdx == eRowIdx && sColIdx == eColIdx) {
                            // Select paragraphs in cell
                            startSelectTable = null;
                            endSelectTable = null;
                        } else {
                            isSelectCell = true;
                            result.push(selTable.toJson(sRowIdx, eRowIdx, sColIdx, eColIdx));
                            copyFilter.filterTable(selTable, editor, sRowIdx, eRowIdx, sColIdx, eColIdx);
                        }
                    }
                    if (!isSelectCell) {
                        var ignoreTableBoundary = true;
                        result = range.extractContents(styleFilter, ignoreTableBoundary, limitedCopyCount);
                        if (startSelectTable) {
                            result.unshift(startSelectTable.selTable.toJson(startSelectTable.rowIndex));
                            copyFilter.filterTable(startSelectTable.selTable, editor, startSelectTable.rowIndex);
                        }
                        if (endSelectTable && endSelectTable != startSelectTable) {
                            result.push(endSelectTable.selTable.toJson(0, endSelectTable.rowIndex));
                            copyFilter.filterTable(endSelectTable.selTable, editor, 0, endSelectTable.rowIndex);
                        }
                    }
                    //remove comments, task, indicator...
                    for (var i = 0; i < result.length; i++) {
                        jsonData = copyFilter.filterJson(result[i], editor, result[i].parentJson);
                        if (jsonData)
                            jsonArray.push(jsonData);
                    }
                    if (this._isCut && !range.isCollapsed() && canDel) {
                       	var msgs = range.deleteContents(true, true);
                    	if(overTrackContent)
                    		msgs = msgs.concat(trackChange.insertOverLmtText(overTrackContent));
                        msgCenter.sendMessage(msgs);
                    }
                }
                result = jsonArray;
                //set clipboard
                if (result && result.length) {
                    //create clipboard data
                    var clipId = msgHelper.getUUID();
                    var convertor = new JsonToHtml();
                    result[0]._fromClip = clipId;
                    var htmlstring = convertor.toHtml(result);

                    if (htmlstring == "") {
                        //an placeholder for paste
                        //					console.log("empty content");
                        htmlstring = "<span _fromClip=\"" + clipId + "\">" + "&nbsp;</span>";
                    }

                    // set interal Data
                    editor._webClipData = {
                        "id": clipId,
                        "data": result
                    };

                    ClipboardPlugin.setWebClipBoardData(
                        JSON.stringify({
                            "id": clipId,
                            "data": result,
                            "styles": copyFilter.styles,
                            "numbers": copyFilter.absNumers,
                            "imgs": copyFilter.imgs,
                            "href": window.location.href
                        }));
                    if (browser.isMobile()) {
                        concord.util.mobileUtil.layoutDoc.copyString = htmlstring;
                        return false;
                    }

                    //select html contents	
                    var clipboard = getClipboard();
                    clipboard.innerHTML = htmlstring;
                    if (has("webkit") && clipboard.childElementCount == 1) {
                        //add additional element 
                        clipboard.innerHTML += "<p><br/></p>";
                    }

                    select(clipboard);
                    //
                    //clean clipboard
                    window.setTimeout(function() {
                        cleanClipboard(clipboard);
                    }, 30);

                    return false;
                }

                return false;
            };

            if (has("webkit") && !has("edge")) {
                this.editor.addCommand("copy", new copyCommand(false)); // CTRL+C
                this.editor.addCommand("cut", new copyCommand(true)); // CTRL+X
            } else {
                this.editor.addCommand("copy", new copyCommand(false), 67 + constants.KEYS.CTRL); // CTRL+C
                this.editor.addCommand("cut", new copyCommand(true), 88 + constants.KEYS.CTRL); // CTRL+X
                this.editor.addCommand("cut", new copyCommand(true), 46 + constants.KEYS.SHIFT); // SHIFT+DEL
            }

            this.editor.addCommand("paste", pasteCommand, 86 + constants.KEYS.CTRL); // CTRL+V
            this.editor.addCommand("paste", pasteCommand, 45 + constants.KEYS.SHIFT); // SHIFT+INS

            // add context copy, paste and cut command
            var contextCopy = {
                exec: function() {
                    var type = "copy";
                    var nls = i18nCKResource;
                    var os = has("mac") ? 'OnMac' : '';
                    setTimeout(function() {
                        // set timeout to make the menu disappear first.
                        alert(nls.clipboard[type + 'Error' + os]);
                    }, 0);
                }
            };
            this.editor.addCommand("contextCopy", contextCopy);

            var contextPaste = {
                exec: function() {
                    var type = "paste";
                    var nls = i18nCKResource;
                    var os = has("mac") ? 'OnMac' : '';
                    setTimeout(function() {
                        // set timeout to make the menu disappear first.
                        alert(nls.clipboard[type + 'Error' + os]);
                    }, 0);
                }
            };

            this.editor.addCommand("contextPaste", contextPaste);

            var contextCut = {
                exec: function() {
                    var type = "cut";
                    var nls = i18nCKResource;
                    var os = has("mac") ? 'OnMac' : '';
                    setTimeout(function() {
                        // set timeout to make the menu disappear first.
                        alert(nls.clipboard[type + 'Error' + os]);
                    }, 0);
                }
            };

            this.editor.addCommand("contextCut", contextCut);
            this.addContextMenu();

        },

        addContextMenu: function() {
            var nls = i18nmenubar;
            var ctx = this.editor.ContextMenu;

            var menuItemCut = {
                name: 'cut',
                commandID: 'contextCut',
                label: nls.ctxMenu_cut,
                group: 'filter',
                order: 'cut',
                disabled: false
            };

            var menuItemCopy = {
                name: 'copy',
                commandID: 'contextCopy',
                label: nls.ctxMenu_copy,
                group: 'filter',
                order: 'copy',
                disabled: false
            };

            var menuItemPaste = {
                name: 'paste',
                commandID: 'contextPaste',
                label: nls.ctxMenu_paste,
                group: 'filter',
                order: 'paste',
                disabled: false
            };
            if (ctx && ctx.addMenuItem) {
                ctx.addMenuItem(menuItemCut.name, menuItemCut);
                ctx.addMenuItem(menuItemCopy.name, menuItemCopy);
                ctx.addMenuItem(menuItemPaste.name, menuItemPaste);
            }

            var that = this;
            if (ctx && ctx.addListener) ctx.addListener(function(target, selection) {
                var bAppend = that.appendCopyContextMenu();
                var ret = {};
                if (bAppend) {
                    ret.copy = {
                        disabled: false
                    };
                    ret.cut = {
                        disabled: false
                    };
                    ret.paste = {
                        disabled: false
                    };
                }
                return ret;
            });
        },
        appendCopyContextMenu: function() {
            // only Field, and the field not in TOC, do not append these menus
            var selection = this.editor.getSelection();
            var ranges = selection.getRanges();

            if (ranges.length == 1) {
                var isField = false;
                var range = ranges[0];
                // Only select one chart , do not append this menus
                var startModel = range.getStartModel(),
                    endModel = range.getEndModel();
                if (startModel && endModel && startModel.obj && startModel.obj == endModel.obj && startModel.obj.isChart)
                    return false;
                var hint = range.getCommonAncestor(true);

                if (hint) {
                    if (hint.modelType == constants.MODELTYPE.PAGENUMBER || hint.modelType == constants.MODELTYPE.FIELD)
                        isField = true;
                    else
                        isField = (ModelTools.getParent(hint, constants.MODELTYPE.PAGENUMBER) || ModelTools.getParent(hint, constants.MODELTYPE.FIELD)) ? true : false;
                }
                if (isField) {
                    return ModelTools.getParent(hint, constants.MODELTYPE.TOC) ? true : false;
                }
            }
            return true;
        }
    });
    return Clipboard;
});
