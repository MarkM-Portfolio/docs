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
    "dojo/_base/lang",
    "dojo/_base/array",
    "dojo/topic",
    "writer/constants",
    "writer/controller/Cursor",
    "writer/controller/DrawShell",
    "writer/controller/Selection",
    "writer/util/ModelTools",
    "writer/track/trackChange",
    "writer/util/RangeTools",
    "writer/msg/msgCenter",
    "writer/msg/msgHelper",
    "writer/util/ViewTools",
    "dojo/i18n!writer/nls/lang",
    "dijit/registry",
    "dijit/popup"
], function(declare, lang, array, topic, constants, Cursor, DrawShell, Selection, ModelTools, trackChange, RangeTools, msgCenter, msgHelper, ViewTools, i18nlang, registry, popup) {

    var EditShell = declare("writer.controller.EditShell", DrawShell, {
        _mode: constants.EDITMODE.EDITOR_MODE,

        _selection: null,

        _renderParam: null,

        getSelection: function() {
            if (this.view()) {
                if (!this._selection)
                    this._selection = new Selection({
                        shell: this
                    });
                return this._selection;
            }
        },

        getInputPos: function() {
            return this.getSelection().getInputPos();
        },
        /*
         * return maybe text or object
         * return value : {'line': line,'point': point, 'obj': run,'index':index };
         *
         */
        pickAnything: function(point) {
            this.itemByPoint(point.x, point.y);
            // Select no paragraph text box the path should not include run.
            var sel = this.getSelectedIdx();
            var run, line;
            if (sel.index == undefined) {
                run = sel;
                line = run.parent;
                sel = {};
                sel.index = 0;
            } else {
                run = this.getSelectedRun();
                line = this.getSelectedLine();
            }
            var fixedX = this.basePoint.x;
            var fixedY = this.basePoint.y;
            if (!run) {
                //Create empty paragraph and set cursor to it
                console.log('create empty paragraph');

            } else {
                return {
                    'line': line,
                    'point': {
                        x: fixedX,
                        y: fixedY
                    },
                    'obj': run,
                    'index': sel.index,
                    'isInside': sel.isInside
                };
            }
        },
        /**
         * mouse down  event will call this function to begin selecting ( set selecting status ) 
         * @param target
         * @param x
         * @param y
         * @param isCtrl
         * @param isShift
         */
        beginSelect: function(target, x, y, isCtrl, isShift, onBoundary) {
            //#38724
        	this.moving = false;
        	this.lastMoveY = 0;
            if (this.getSelection().isSelecting())
                return this.endSelect(target, x, y, isCtrl, onBoundary);

            this.clearScrollTimer();

            var point = this.screenToClient({
                'x': x,
                'y': y
            });
            var ret = this.pickAnything(point);
            if (ret) {
                var sel = this.getSelection();
                if (isShift && !isCtrl) // SHIFT 
                {
                    sel.selectTo(ret, onBoundary);
                } else if (!isShift && isCtrl) // CTRL
                {
                    this.selectParagraph(target, x, y); // this.selectParagraph(ret);
                } else // Normal or SHIFT + CTRL
                {
                    // select drawingObj
                    var vTools = ViewTools;
                    if (0 == ret.index && vTools.isDrawingObj(ret.obj)) {
                        if (vTools.isInlineDrawingObj(ret.obj)) {
                            if (ret.isInside) {
                                var retEnd = {
                                    "obj": ret.obj,
                                    "index": 1
                                };
                                sel.select(ret, retEnd);
                            } else
                                sel.beginSelect(ret, onBoundary);
                        } else {
                            var retEnd = {
                                "obj": ret.obj,
                                "index": 1
                            };
                            sel.select(ret, retEnd);
                        }
                    } else
                        sel.beginSelect(ret, onBoundary);
                }
            } else
                console.log('click in none in beginSelect');
        },
        
        renderSelect: function (nx, ny, onBoundary, dir) {
            var sel = this.getSelection();
            var point = this.screenToClient({
                'x': nx,
                'y': ny
            });
            var ret = this.pickAnything(point);
            if (ret) {
                try {
                    if (sel && sel.isSelecting()) {
                       sel.selectTo(ret, onBoundary, dir);
                    }
                } catch (e) {
                    console.error("error in moveSelect");
                }
            }
        },
        
        leaveSelect: function (x, y) {
            var sel = this.getSelection();
            this.clearScrollTimer();
            if (sel && sel.isSelecting() && this._mode == constants.EDITMODE.EDITOR_MODE && this.moving) {
                var nscroll = 0;
                var editorwin = pe.lotusEditor.getWindow();
                var that = this;
                if (y <= 0) {
                    nscroll = -50;
                }
                else {
                    var height = editorwin.innerHeight;
                    if (y >= height)
                        nscroll = 50;
                }
                if (nscroll != 0)
                {
                    function proc() {
                        var scrollTop = pe.lotusEditor.getScrollPosition();
                        pe.lotusEditor.layoutEngine.rootView.render(scrollTop);
                        editorwin.scrollBy(0, nscroll);
                        var finalY = y + nscroll;
                        that.renderSelect(x, finalY, false, nscroll < 0 ? "up" : "down");
                        that._scrollTimer = setTimeout(proc, 80);
                    };
                    that._scrollTimer = setTimeout(proc, 80);
                }
            }
        },
        /**
         * mouse move event call this function to change selection( in selecting status )
         * @param target
         * @param x
         * @param y
         * @param isCtrl
         */
        moveSelect: function(target, x, y, isCtrl, onBoundary) {
            var sel = this.getSelection();
            this.clearScrollTimer();
            if (sel && sel.isSelecting()) {
                this.renderSelect(x, y);
                this.lastMoveY = y;
                this.moving = true;
            }
        },
        /**
         * clear scroll timer
         */
        clearScrollTimer: function() {
            if (this._scrollTimer)
                clearTimeout(this._scrollTimer);
            this._scrollTimer = null;
        },
        /**
         * mouse up event call this function ( end selecting status )
         * @param target
         * @param x
         * @param y
         * @param isCtrl
         */
        endSelect: function(target, x, y, isCtrl, onBoundary) {
            this.clearScrollTimer();
            this.moving = false;
            this.lastMoveY = 0;
            var sel = this.getSelection();
            if (isCtrl || (sel && sel.isSelecting())) {
                var point = this.screenToClient({
                    'x': x,
                    'y': y
                });
                var ret = this.pickAnything(point);
                if (sel.isSelecting()) {
                    this.getSelection().endSelect(ret, onBoundary);
                }
            }
        },

        /**
         * Check if selection in table 
         * @param domTarget or Ranges
         */
        isInTable: function(domTarget) {
            // Two option to implement this function
            // 1. Check if the domTarget is in rendered Table element
            // 2. Pickup selected object from the selection
            console.log("Function editShell:isInTable not implemented yet.");
        },

        /**
         * Check if current position in Header and Footer
         * @param target
         * @param x
         * @param y
         * @returns
         */
        isPositionInHeaderFooter: function(area) {
            if (area && area.getViewType && (area.getViewType() == "page.HeaderFooter" ||
                    area.getViewType() == "page.Header" || area.getViewType() == "page.Footer")) {
                return true;
            }
            return false;
        },

        /**
         * Check if current position in Editor area
         * @param target
         * @param x
         * @param y
         * @returns   */
        isPositionInEditorContent: function(area) {
            if (area && area.getViewType && area.getViewType() == "text.content") {
                return true;
            }
            return false;

        },
        isPositionInFootnotes: function(area) {
            if (area && area.getViewType && area.getViewType() == "text.footnotes") {
                return true;
            }
            return false;
        },
        isPositionInEndnotes: function(area) {
            if (area && area.getViewType && area.getViewType() == "text.endnotes") {
                return true;
            }
            return false;
        },
        getEditorArea: function(target, x, y) {
            var point = this.screenToClient({
                'x': x,
                'y': y
            });
            var document = this.view();
            return document && document.getEditorArea(point.x, point.y - 10);
        },
        isPointInHeaderFooter: function(x, y) {
            var point = this.screenToClient({
                'x': x,
                'y': y
            });
            var document = this.view();
            return document && document.isPointInHeaderFooter(point.x, point.y - 10);
        },
        setEditMode: function(model) {
            this._mode = model;
        },

        /**
         * @returns Return the edit mode
         */
        getEditMode: function() {
            return this._mode;
        },

        /**
         * Enter edit header and footer mode.
         * @returns If enter Header Footer edit mode.
         */
        enterHeaderFooterMode: function(target, offsetX, offsetY) {
            if (this._mode != constants.EDITMODE.HEADER_FOOTER_MODE) {
                this._mode = constants.EDITMODE.HEADER_FOOTER_MODE;
                this._hfTarget = target;
                this.view().markHeaderFooterEditing(true);
                this.beginSelect(target, offsetX, offsetY);
                topic.publish(constants.EVENT.EDITAREACHANGED);
                if (!this.nls) {
                    this.nls = i18nlang;
                }
                pe.lotusEditor && pe.lotusEditor.getShell()._editWindow.announce(this.nls.ACC_headerFooterMode);
                return true;
            }
            return false; // No changed
        },

        /**
         * 
         * @param headerfooter the header/footer to be moved into
         * @returns boolean If the editor mode was changed
         */
        moveToHeaderFooter: function(headerfooter, force, bNotSetCursor) {
            if (force || this._mode != constants.EDITMODE.HEADER_FOOTER_MODE || this._hfTarget != headerfooter) {
                this._mode = constants.EDITMODE.HEADER_FOOTER_MODE;
                this._hfTarget = headerfooter;
                if (!this.nls) {
                    this.nls = i18nlang;
                }
                pe.lotusEditor && pe.lotusEditor.getShell()._editWindow.announce(this.nls.ACC_headerFooterMode);
                this.view().markHeaderFooterEditing(true);
                var selection = this.getSelection();
                if (!bNotSetCursor) {
                    selection.moveTo(headerfooter, 0);
                    selection.scrollIntoView();
                }
                topic.publish(constants.EVENT.EDITAREACHANGED);
                return true;
            }
            return false;
        },

        /**
         * Enter edit document mode.
         * @returns boolean If the editor mode was changed
         */
        enterEditorMode: function(target, offsetX, offsetY) {
            if (this._mode != constants.EDITMODE.EDITOR_MODE) {
                this._mode = constants.EDITMODE.EDITOR_MODE;
                //        console.log("enter editor mode");
                if (!this.nls) {
                    this.nls = i18nlang;
                }
                pe.lotusEditor && pe.lotusEditor.getShell()._editWindow.announce(this.nls.ACC_EditorMode);
                this.view().markHeaderFooterEditing(false);
                if (offsetX != null && offsetY != null)
                    this.beginSelect(target, offsetX, offsetY);
                topic.publish(constants.EVENT.EDITAREACHANGED);
                return true;
            }
            return false; // No changed
        },
        enterFootnotesMode: function(target, offsetX, offsetY) {
            if (this._mode != constants.EDITMODE.FOOTNOTE_MODE) {
                //        console.info("enter the footnotes x: "+offsetX+";y: "+ offsetY);
                if (this._mode == constants.EDITMODE.HEADER_FOOTER_MODE) {
                    this.view().markHeaderFooterEditing(false);
                }
                if (!this.nls) {
                    this.nls = i18nlang;
                }
                pe.lotusEditor && pe.lotusEditor.getShell()._editWindow.announce(this.nls.ACC_FootnotesMode);
                this._mode = constants.EDITMODE.FOOTNOTE_MODE;
                if (offsetX != null && offsetY != null)
                    this.beginSelect(target, offsetX, offsetY);
                return true;
            }
            return false;
        },
        setMode: function(mode) {
            this._mode = mode;
        },
        enterEndnotesMode: function(target, offsetX, offsetY) {
            if (this._mode != constants.EDITMODE.ENDNOTE_MODE) {
                if (this._mode == constants.EDITMODE.HEADER_FOOTER_MODE) {
                    this.view().markHeaderFooterEditing(false);
                }
                if (!this.nls) {
                    this.nls = i18nlang;
                }
                pe.lotusEditor && pe.lotusEditor.getShell()._editWindow.announce(this.nls.ACC_EndnotesMode);
                this._mode = constants.EDITMODE.ENDNOTE_MODE;
                if (offsetX != null && offsetY != null)
                    this.beginSelect(target, offsetX, offsetY);
                return true;
            }
            return false;
        },

        /**
         * Insert text into cursor position.
         * @param text The inserted content.
         * @param keepStyle if keep the style of text which current selected( which will be deleted )
         * @returns Boolean
         */
        insertText: function(text, keepStyle) {
            //delete in selection
            var msgs = [],
                msg, actPair;
            var sel = this.getSelection();
            sel && sel.clearSelectionChangeTimer();
            var ranges = sel.getRanges();
            if (!RangeTools.canDo(ranges)) {
                /*if the range is crossing more than one footnote/endnote, it can not delete anything.               */
                return;
            }
            ranges = RangeTools.mergeRangesInCrossPageCell(ranges);
            var targetRun;
            if (keepStyle && lang.isString(text) && !ranges[0].isCollapsed()) {
                // TODO TRACK
                // keep style when insert text at the beginning of text run 
                // #44938
                var start = ranges[0].getStartParaPos();
                var end = ranges[0].getEndParaPos();

                var para = start.obj;
                var index = start.index;
                var run = para.byIndex(index);
                if (run && !run.tab && run.length > 0 && run.start == index) {
                    if (end.obj == para && end.index < (index + run.length)) {
                        // run will not deleted
                        // targetRun = run;
                        // track-change, comment this line, looks not needed
                    } else if (!ModelTools.isImage(run)) {
                        var jsonText = run.toJson(null, text.length);
                        delete jsonText.ch;
                        if (jsonText.fmt) {
                            //inline object
                            jsonText.c = text;
                            if (jsonText.fmt.length) {
                                delete jsonText.fmt[0].ch;
                                if (trackChange.isOn() && ModelTools.isTrackable(para)) {
                                    jsonText.fmt[0].ch = [trackChange.createChange("ins")];
                                }
                            }
                            // TODO TRACK
                            return this.insertInlineObj(jsonText);
                        } else {
                            text = {
                                "c": text,
                                "fmt": [jsonText]
                            };
                            if (text.fmt.length) {
                                delete text.fmt[0].ch;
                                if (trackChange.isOn() && ModelTools.isTrackable(para)) {
                                    text.fmt[0].ch = [trackChange.createChange("ins")];
                                }
                            }
                        }
                    }
                }
            }

            msgCenter.beginRecord();
            var trackStop = trackChange.isOverMaxTxtSizeLmt();
            if(trackStop)
              	trackChange.pause();

            for (var i = 0; i < ranges.length; i++) {
                var range = ranges[i];
                if (!range) {
                    console.log("range not exist!");
                    msgCenter.endRecord();
                    return false;
                }
                if (!range.isCollapsed()) {
                    // TODO The msgs will be return without send .....
                    msgs = msgs.concat(range.deleteContents(true, true));
                }
            }

            if(trackStop)
            	msgs = msgs.concat(trackChange.insertOverLmtText(trackStop));

            if(trackStop){
            	trackChange.resume();
            	trackChange.showOverTrackTxtLmtMsg(); 
            }

            if (msgs.length > 0) {
                sel._checkCursor();
                ranges = sel.getRanges();
            }
            var range = ranges[0];
            //Insert text.
            var start = RangeTools.getFirstParaInRanges(ranges);
            if (!start){
                msgCenter.endRecord();
                return false;
            }

            var para = start.obj;
            var index = start.index;
            var length = 0;

            var visibleIndex = para.getVisibleIndex(index);
            var realIndex = para.getFullIndex(visibleIndex);

            // TRACK-CHANGE TODO
            if (targetRun && targetRun.insertText(text, index)) {
                length = text.length;
            } else if (lang.isString(text)) {
                if (text == "\r") // Insert line break by shift + enter
                {
                    // The function will return Textrun or other inline object.
                    // Change it to text run.
                    var curFmt = {};
                    var prevIdx = visibleIndex == 0 ? 0 : visibleIndex - 1;
                    var fullPrevIndex = para.getFullIndex(prevIdx);
                    curFmt.style = lang.clone(para.byIndex(fullPrevIndex).textProperty.toJson()); //follow prev run style
                    curFmt.rt = constants.RUNMODEL.TEXT_Run;
                    curFmt.s = realIndex;
                    curFmt.l = 1;
                    curFmt.br = {};
                    curFmt.br.t = "br";

                    if (trackChange.isOn() && ModelTools.isTrackable(para)) {
                        curFmt.ch = [trackChange.createChange("ins")];
                    }

                    var lineBreak = {};
                    lineBreak.c = text;
                    lineBreak.fmt = [curFmt];
                    if (para.c == "") {
                        para.hints.removeAll();
                    }
                    index = para.insertRichText(lineBreak, realIndex).index;
                } else if (text == "\t") // Insert tab key, add tab format
                {
                    var curFmt = {};
                    var prevIdx = visibleIndex == 0 ? 0 : visibleIndex - 1;
                    var fullPrevIndex = para.getFullIndex(prevIdx);
                    curFmt.style = lang.clone(para.byIndex(fullPrevIndex).textProperty.toJson()); //follow prev run style
                    curFmt.rt = constants.RUNMODEL.TEXT_Run;
                    curFmt.s = realIndex;
                    curFmt.l = 1;
                    curFmt.tab = {};
                    curFmt.tab.t = "tab";

                    if (trackChange.isOn() && ModelTools.isTrackable(para)) {
                        curFmt.ch = [trackChange.createChange("ins")];
                    }

                    var tabKey = {};
                    tabKey.c = text;
                    tabKey.fmt = [curFmt];
                    if (para.c == "") {
                        para.hints.removeAll();
                    }
                    index = para.insertRichText(tabKey, realIndex).index;
                } else {
                    var bTrackAuthor = pe.scene.isTrackAuthor();
                    var useFmt = bTrackAuthor && !ModelTools.isInToc(para);
                    // Not track TOC now
                    if (trackChange.isOn() && ModelTools.isTrackable(para)) {
                        var formats = pe.lotusEditor.indicatorManager.createTextFmt(para, text, realIndex, !useFmt);
                        // delete 'br', because it is not a break
                        if (formats && formats.fmt) {
                            for (var i = 0; i < formats.fmt.length; ++i) {
                                var ofmt = formats.fmt[i];
                                if (ofmt.br)
                                    delete ofmt.br;
                            }
                        }
                        index = para.insertRichText(formats, realIndex).index;
                    } else if (bTrackAuthor && !ModelTools.isInToc(para)) {
                        var formats = pe.lotusEditor.indicatorManager.createTextFmt(para, text, realIndex);
                        // delete 'br', because it is not a break
                        if (formats && formats.fmt) {
                            for (var i = 0; i < formats.fmt.length; ++i) {
                                var ofmt = formats.fmt[i];
                                if (ofmt.br)
                                    delete ofmt.br;
                            }
                        }
                        index = para.insertRichText(formats, realIndex).index;
                    } else
                        para.insertText(text, realIndex);
                }
                length = text.length;
            } else if (text.c && text.fmt) {
                var bTrackAuthor = pe.scene.isTrackAuthor();
                // Not track TOC now
                if (bTrackAuthor && !ModelTools.isInToc(para)) {
                    for (var i = 0; i < text.fmt.length; i++) {
                        if (!text.fmt[i].e_a)
                            text.fmt[i].e_a = pe.scene.getCurrUserId();
                    }
                }
                if (text.fmt && !ModelTools.isTrackable(para)) {
                    ModelTools.removeFmtCh(text.fmt);
                }
                index = para.insertRichText(lang.clone(text), realIndex).index;
                length = text.c.length;
            } else { //wrong text 
                msgCenter.endRecord();
                return false;
            }

            if (length) {
                var modelPara = para;
                if (para.findParaIndexToInsert) {
                    var paraIndex = para.findParaIndexToInsert(realIndex);
                    modelPara = paraIndex.para;
                    modelIndex = paraIndex.index;
                    if (modelPara._notNotifyYet){
                    	// TODO: should never be called
                        msg = msgCenter.createMsg(constants.MSGTYPE.Element,[msgCenter.createInsertElementAct(modelPara)]);
                        msg && msgs.push(msg);
                        delete modelPara._notNotifyYet;
                    } else 
                        actPair = msgCenter.createInsertTextAct(modelIndex, length, modelPara);
                } else
                    actPair = msgCenter.createInsertTextAct(realIndex, length, para);


                if (actPair) {
                    msg = msgCenter.createMsg(constants.MSGTYPE.Text, [actPair]);
                    msg && msgs.push(msg);
                }

                range.setStartModel(para, realIndex + length);
                range.collapse(true);
                sel.selectRangesBeforeUpdate([range]);
                pe.lotusEditor.needScroll = true;
                para.parent.update();

                msgCenter.sendMessage(msgs);
                msgCenter.endRecord();
                return para;
            }
            msgCenter.endRecord();
            return false;
        },

        /**
         * Insert image
         *  @param cnt format is similar with insert text message:
         *    {"c": "hello", "fmt":[{"rt":"rPr", "style":{"b":1}} ]}
         */
        insertInlineObj: function(cnt) {
            //delete in selection
            var msgs = [],
                msg;
            var ranges = this.getSelection().getRanges();
            var range = ranges[0];
            if (!RangeTools.canDo(ranges)) {
                /*if the range is crossing more than one footnote/endnote, it can not delete anything.               */
                return false;
            }

            msgCenter.beginRecord();
            try {
                if (!range.isCollapsed()) {
                    msgs = range.deleteContents(true, true);
                    msgCenter.sendMessage(msgs);
                    this.getSelection()._checkCursor();
                    range = this.getSelection().getRanges()[0];
                }
                //Insert text.
                var start = range.getStartParaPos();
                if (start) {
                    if (cnt.fmt && !ModelTools.isTrackable(start.obj)) {
                        ModelTools.removeFmtCh(cnt.fmt);
                    }
                    ModelTools.insertInlineObject(cnt, start.obj, start.index, true);
                }
            } catch (e) {

            }

            msgCenter.endRecord();

            if (!start)
                return false;

            return true;
        },
        /**
         * split in current cursor
         * @param msgs
         */
        split: function(msgs) {

            var sendMsg = (msgs == null);
            msgs = msgs || [];

            var selection = pe.lotusEditor.getSelection();
            var ranges = selection.getRanges();
            var range = ranges[0];
            if (!RangeTools.canDo(ranges)) {
                /*if the range is crossing more than one footnote/endnote, it can not delete anything.               */
                return;
            }
            if (!range.isCollapsed()) {
                var tmpMsg = range.deleteContents(true, true);
                for (var i = 0; i < tmpMsg.length; i++)
                    msgs.push(tmpMsg[i]);
            }
            var start = range.getStartParaPos();
            if (!start) {
                sendMsg && msgs.length && msgCenter.sendMessage(msgs);
                return null;
            }
            var para = start.obj;
            var index = start.index;
            var parent = para.parent;
            if (index == 0) {
                sendMsg && msgs.length && msgCenter.sendMessage(msgs);
                return para;
            } else {
                var sectId = para.getSectId();
                if (index == para.text.length && (!sectId || sectId == "none" || sectId == "")) {
                    var nextPara = para.next();
                    if (nextPara && nextPara.modelType == constants.MODELTYPE.PARAGRAPH) {
                        sendMsg && msgs.length && msgCenter.sendMessage(msgs);
                        return nextPara;
                    }
                }

                var newPara = para.split(index, msgs);
                if (para.getFixedTarget)
                	para = para.getFixedTarget();
                //remove section property from the old 
                var msg = para.setSectionId("", true);
                msgHelper.mergeMsgs(msgs, msg);
                if (newPara) {
                    parent.insertAfter(newPara, para);

                    msgs.push(msgCenter.createMsg(constants.MSGTYPE.Element, [msgCenter.createInsertElementAct(newPara)]));
                }
                sendMsg && msgCenter.sendMessage(msgs);
                return newPara;
            }

        },
        /*
         * Insert Block
         */
        insertBlock: function(obj, forceUpdate) {
            var msgs = [];
            var nextPara = this.split(msgs);
            if (nextPara) {
                if (!ModelTools.isTrackable(nextPara)) {
                    obj.cleanCh();
                }
                nextPara.parent.insertBefore(obj, nextPara);
                msgs.push(msgCenter.createMsg(constants.MSGTYPE.Element, [msgCenter.createInsertElementAct(obj)]));

                var selection = pe.lotusEditor.getSelection();
                var range = selection.getRanges()[0];
                range.moveToEditStart(nextPara);
                selection.selectRangesBeforeUpdate([range]);
                nextPara.parent.update(forceUpdate);
                msgCenter.sendMessage(msgs);
            }
        },

        /*
         * delete Text 
         */
        deleteText: function(ime) {
            var selection = pe.lotusEditor.getSelection();
            if (!selection) {
                return false;
            }
            var ranges = selection.getRanges();
            if (!ranges) {
                return false;
            }
            if (!RangeTools.canDo(ranges)) {
                /*if the range is crossing more than one footnote/endnote, it can not delete anything.               */
                return false;
            }
            var msgs = [];
            if (ime)
                trackChange.pause();

            for (var i = 0; i < ranges.length; i++) {
                var range = ranges[i];
                if (!range.isCollapsed()) {
                    //delete contents
                    msgs = msgs.concat(range.deleteContents(true, true, {
                        keepBookmark: ime
                    }));
                } else if (range.isCollapsed()) {
                    //remove a char
                    msgs = msgs.concat(range.deleteAtCursor(false));
                }
            }

            //send msgs
            var para = ranges[0].getStartParaPos().obj;

            para.parent.update();
            msgCenter.sendMessage(msgs);

            if (ime)
                trackChange.resume();

            selection._checkCursor();
            return true;
        },

        /**
         * Hide the context menu.
         * @returns If the context menu was opened and dismissed it.
         */

        dismissContextMenu: function() {
            var ctxMenu = registry.byId("ctx");
            if (ctxMenu && ctxMenu.isShowingNow)
                popup.close(ctxMenu);
        },

        dismissMobileMenu: function() {
            var mobileToolBar = registry.byId("mobile_menu");
            if(mobileToolBar){
                mobileToolBar.destroyRecursive();
           }
        },

        /**
         * Open the context menu
         * @param {DOM object} target The target element.
         * @param {Integer} x
         * @param {Integer} y
         */
        openContextMenu: function(target, x, y) {
            // TODO Should forbidden default context menu when right click in TOOLBAR, MENU BAR, TITLE BAR, SIDEBAR.
            //COMMON code to do that for three Editor.
            // Generate the context menu
            this.dismissContextMenu();
            var ctx = pe.lotusEditor.ContextMenu,
                selection = this.getSelection();
            if (selection && selection._cursor) selection._cursor.hide();
            if (ctx && ctx.show)
                ctx.show(target, selection, x, y);
        },

        /**
         * Select the mouse clicked whole word
         * @param target
         * @param x
         * @param y
         */
        selectWord: function(target, x, y) {
            var point = this.screenToClient({
                'x': x,
                'y': y
            });
            var ret = this.pickAnything(point);
            if (ret) {
                var sel = this.getSelection();
                sel.selectOneWord(ret);
            }
        },

        /**
         * Select the mouse clicked whole paragraph
         * @param target
         * @param x
         * @param y
         */
        selectParagraph: function(target, x, y) {
            console.log("Function editShell:selectParagraph not implemented yet.");
        }

    });

    return EditShell;
});
