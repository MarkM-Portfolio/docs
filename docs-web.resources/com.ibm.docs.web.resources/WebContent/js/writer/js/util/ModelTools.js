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
    "dojo/_base/array",
    "dojo/topic",
    "concord/i18n/CharacterBreakIterator",
    "writer/constants",
    "concord/i18n/WordBreakIterator",
    "writer/msg/msgCenter",
    "writer/msg/msgHelper",
    "writer/util/SectionTools",
    "writer/global",
    "writer/track/trackChange",
    "exports"
], function(has, lang, array, topic, CharacterBreakIterator, constants, WordBreakIterator, msgCenter, msgHelper, SectionTools, g, trackChange, exports) {

    var ModelTools = lang.mixin(lang.getObject("writer.util.ModelTools", true), {
        
        removeFmtCh: function(fmts){
            if (!fmts)
                return;
            array.forEach(fmts, function(fmt){
                delete fmt.ch;
                if (fmt.fmt && fmt.fmt.length)
                    ModelTools.removeFmtCh(fmt.fmt);
            });
        },

        _getFilterFunction: function(filter) {
            if (lang.isString(filter)) {
                var modelType = filter;
                filter = function(item) {
                    return item.modelType == modelType;
                };
            }
            if (!lang.isFunction(filter)) {
                filter = function() {
                    return true;
                };
            }
            return filter;
        },
        /**
         * 
         * @param maxLevel
         * @returns
         */
        getOutlineParagraphs: function(maxLevel, minLevel, keepBlank) {

            (!maxLevel) && (maxLevel = 5); //default maxLevel = 5
            minLevel = minLevel || 0;

            var headings = [];
            var doc = window.layoutEngine.rootModel;

            function filterFunc(p) {
                var text = p.text && p.text.replace(/\u0001/gi, "");
                text = (keepBlank ? true : (text && (lang.trim(text) != "")))

                if (p.modelType == constants.MODELTYPE.PARAGRAPH && text && p.getStyleId() != "TOCHeading" && p.parent.modelType != constants.MODELTYPE.TOC) {
                    var styleId = p.getStyleId()
                    var level = p.getOutlineLvl();
                    return (level != null) && level < maxLevel && level >= minLevel;
                } else
                    return false;
            }

            var para = ModelTools.getNext(doc, filterFunc, true);

            while (para) {
                headings.push(para);
                para = ModelTools.getNext(para, filterFunc, false);
            };
            return headings;
        },
        /*
         * operations of model
         */
        insertInlineObject: function(cnt, para, index, select) {
            var result = para.insertRichText(cnt, index);
            var insertLen = 0;
            if (result)
                insertLen = result.length;
            if (!result || insertLen === undefined)
                insertLen = (cnt.c) ? cnt.c.length : 0;
            var target = para, targetIndex = index;
            var msgs = [], msg;
            if (para.findParaIndexToInsert) {
                var paraIndex = para.findParaIndexToInsert(index);
                if (paraIndex.para._notNotifyYet) {
                    msg = msgCenter.createMsg(constants.MSGTYPE.Element,[msgCenter.createInsertElementAct(paraIndex.para)]);
                    delete paraIndex.para._notNotifyYet;
                }
                else {
                    actPair = msgCenter.createInsertTextAct(paraIndex.index, result.length, paraIndex.para);
                    msg = msgCenter.createMsg(constants.MSGTYPE.Text, [actPair]);
                }
            }else {
                actPair = msgCenter.createInsertTextAct(targetIndex, insertLen, target);
                msg = msgCenter.createMsg(constants.MSGTYPE.Text, [actPair]);
            }
            msg && msgs.push(msg);
            if (select) {
                var selection = pe.lotusEditor.getSelection();
                var range = selection.getRanges()[0];
                range.setStartModel(para, index + insertLen);
                range.collapse(true);
                selection.selectRangesBeforeUpdate([range]);
            }
            para.parent.update();

            msgCenter.sendMessage(msgs);
        },

        createTrackDeletedPara: function(doc) {
            var paraJson = g.modelTools.getEmptyParagraphSource();   

            if(trackChange.isOn() && !has("trackGroup"))
            	paraJson.ch = [trackChange.createChange("del")];

            return g.modelFac.createModel(paraJson, doc);
        },

        getEmptyParagraphSource: function() {
            return {
                'fmt': [],
                'pPr': {},
                'rPr': {},
                't': 'p',
                'id': msgHelper.getUUID(),
                'c': ''
            };
        },

        isEmptyParagraph: function(p) {
            if (p.modelType == constants.MODELTYPE.PARAGRAPH) {
                return !p.text || p.text == "";
            }
            return true;
        },
        
        isEmptyParagraphInTrack: function(p) {
            if (p.modelType == constants.MODELTYPE.PARAGRAPH) {
                return !p.text || p.text == "" || p.getVisibleText() == "";
            }
            return true;
        },

        cleanChInJson: function(json)
        {
            var me = this;
            if (!json)
                return;
            if (lang.isArray(json))
            {
                json.forEach(function(j){
                    me.cleanChInJson(j);
                });
            }
            else
            {
                delete json.ch;
                delete json.rPrCh;
                delete json.pPrCh;
                delete json.trPrCh;
                for (var x in json)
                {
                    var obj = json[x];
                    if (lang.isObject(obj))
                        me.cleanChInJson(obj);
                }
            }
        },
        
        isImage: function(m) {
            var mType = m.modelType;
            if (mType == constants.MODELTYPE.IMAGE || mType == constants.MODELTYPE.TBIMAGE || mType == constants.MODELTYPE.SQIMAGE || mType == constants.MODELTYPE.FLIMAGE || mType == constants.MODELTYPE.SIMPLEIMAGE)
                return true;
            return false;
        },

        isTextBox: function(m) {
            var mType = m.modelType;
            if (mType == constants.MODELTYPE.TXBX ||
                mType == constants.MODELTYPE.FLTXBX ||
                mType == constants.MODELTYPE.TBTXBX ||
                mType == constants.MODELTYPE.SQTXBX ||
                mType == constants.MODELTYPE.SIMPLETXBX)
                return true;
            return false;
        },


        mergeParaSection: function(p1, p2, msgs) {
            if (!p1 || !p2)
                return null;
            var secId1 = p1.directProperty && p1.directProperty.getSectId && p1.directProperty.getSectId();
            var secId2 = p2.directProperty && p2.directProperty.getSectId && p2.directProperty.getSectId();

            if ((secId1 && "" != secId1) || (secId2 && "" != secId2)) {
                // remove p1 id and its section
                SectionTools.deleteSection(p1, msgs);

                var views = p1.getRelativeViews("rootView");
                var paraView = views && views.getFirst();
                if (!paraView)
                    console.error("!range->merge paragraph: cannot find paragraph view");

                // move p2 secId to p1
                if (secId2 && "" != secId2) {
                    var msg = p1.setSectionId(secId2, true);
                    msgHelper.mergeMsgs(msgs, msg);
                    topic.publish(constants.EVENT.UPDATEINSERTSECTION, paraView, paraView.directProperty.getSectId());
                } else {
                    var msg = p1.setSectionId(null, true);
                    msgHelper.mergeMsgs(msgs, msg);
                    topic.publish(constants.EVENT.UPDATEDELETESECTION, paraView, secId1);
                }
            }
        },
        /*
         * merge two paragraph
         */
        mergeParagraphs: function(p1, p2, msgs, noRPrCh) {
            if (!p1 || !p2)
                return null;
            this.mergeParaSection(p1, p2, msgs);
            var trackParas;
            if (this.isTrackBlockGroup(p1))
                p1 = p1.getLastPara(true);
            if (this.isTrackBlockGroup(p2)) {
                trackParas = p2.cleanBlocks();
                if (trackParas && trackParas.length > 0)
                    p2 = trackParas.shift();
            }
            if (!p1 || !p2)
                return null;
            if (has("trackGroup") && !trackChange.compareCh(p1.ch, p2.ch)) {
                p1.breakUpCh(msgs);
                p2.breakUpCh(msgs);
            } else if (!has("trackGroup") && trackChange.isOn() && this.isParagraph(p1) && p1.isTrackDeleted(p1.ch)) {
                if (ModelTools.isTrackable(p2)) {
                    msgs.push(p2.insertTrackDeletedObjs([p1], true));
                    return p2;
                }
                return null;
            }

            if (msgs) {
                var index = 0,
                    len = 0,
                    msg;
                if (p1.text) {
                    index = p1.text.length;
                }
                if (p2.text) {
                    len = p2.text.length;
                }
                msg = msgCenter.createMsg(constants.MSGTYPE.Element, [msgCenter.createDeleteElementAct(p2)]);
                msg && msgs.push(msg);
            }

            var orig = lang.clone(p1.rPrCh);
            
            if (!has("trackGroup") && !noRPrCh && trackChange.isOn() && this.isParagraph(p1) && p1.hints && ModelTools.isTrackable(p1)) {
                p1.insertTrackDeletedObjs([]);
                if (msgs)
                    len++;
            }

            if (!ModelTools.isEmptyParagraph(p2))
                p1.merge(p2);

            p2.parent.remove(p2);
            
            if(trackChange.isOn() && ModelTools.isTrackable(p1))
            {
                var p1tCh = p1.rPrCh;
                var p2tCh = p2.rPrCh;

                p1.rPrCh = lang.clone(p2.rPrCh);

                if (msgs) {
                    var act = msgCenter.createSetAttributeAct(p1, null, null, {
                        "type": "rPrCh",
                        "ch": p1.rPrCh
                    }, {
                        "type": "rPrCh",
                        "ch": orig
                    });
                    msgs.push(msgCenter.createMsg(constants.MSGTYPE.Attribute, [act]));
                }
            }

            if (msgs && len) {
                var actPair = msgCenter.createInsertTextAct(index, len, p1),
                    msg = msgCenter.createMsg(constants.MSGTYPE.Text, [actPair]);
                msgHelper.mergeMsgs(msgs, msg);
            }

            if (trackParas && trackParas.length > 0) {
                array.forEach(trackParas, function(para) {
                    para.buildGroup && para.buildGroup();
                });
            }

            return p1;
        },
        /*
         * fix block to insert empty paragraph
         * 
         */
        fixBlock: function(block, range, msgs) {
            // FIXME: seems never happen in track change model
            //if (trackChange.isOn() && !has("trackGroup")) {
            //   // TODO: need insert trackDeletedObjs for new p
            //}        

            var p = g.modelFac.createModel(g.modelTools.getEmptyParagraphSource(), block);
            block.insertAfter(p);
            range && range.moveToPosition(p, 0);
            if (msgs) {
                msgs.push(msgCenter.createMsg(constants.MSGTYPE.Element, [msgCenter.createInsertElementAct(p)]));
            }
            return p;
        },
        /*
         * delete paragraph
         */
        removeBlock: function(c, range, msgs) {

            var next = c.next(),
                prev, parent = c.parent;
            var donotDel = false;
            if (next) {
                //move to begin of next
                range && range.moveToEditStart(next);
            } else {
                //move to end of previous
                prev = c.previous();
                if (prev) {
                    switch (prev.modelType) {
                        case constants.MODELTYPE.TOC:
                        case constants.MODELTYPE.TABLE:
                        case constants.MODELTYPE.TBTXBX:
                            donotDel = true;
                    }
                    if (prev.isEndWithPageBreak && prev.isEndWithPageBreak() || prev.hasSectId && prev.hasSectId()) {
                        donotDel = true;
                    }
                }
                range && prev && range.moveToEditEnd(prev);
            }

            if (!next && !prev || donotDel) {
                if (c.isInTCGroup && c.isInTCGroup())
                    parent = parent.parent;
                ModelTools.fixBlock(parent, range, msgs);
            }

            var tc = trackChange;

            //or it is a task para
            if ((c.getBorder && c.getBorder()) || (c.isTask && c.isTask())) {
                prev = c.previous();
                if (next && ((next.getBorder && next.getBorder()) || (next.isTask && next.isTask())))
                    next.markDirty();
                if (prev && ((prev.getBorder && prev.getBorder()) || (prev.isTask && prev.isTask())))
                    prev.markDirty();
            }

            var track = tc.isOn() && this.isTrackable(c);
            var fullyDeleted = true;
            if (msgs) {
                if (track) {
                    fullyDeleted = false;
                    var msgs2 = c.deleteInTrack();
                    if (msgs2 == true)
                        fullyDeleted = true;
                    else if (msgs2) {
                        array.forEach(msgs2, function(m) {
                            msgs.push(m);
                        });
                    }
                } else {
                    fullyDeleted = true;
                }
            }

            if (fullyDeleted) {
                msgs.push(msgCenter.createMsg(constants.MSGTYPE.Element, [msgCenter.createDeleteElementAct(c)]));
                parent.container.remove(c);
                c.markDelete(msgs);
                SectionTools.deleteSection(c, msgs);
                return true;
            } else {
                SectionTools.deleteSection(c, msgs);
                c.markReset();
            }
        },

        /*
         * check if it is a block 
         */
        isBlock: function(p) {
            //TODO: add more block types

            // Footnote, endNote, text box..
            var mt = constants.MODELTYPE;
            switch (p.modelType) {
                case mt.PARAGRAPH:
                case mt.TOC:
                case mt.TABLE:
                case mt.ROW:
                case mt.CELL:
                    return true;

                default:
                    return false;
            }
            return false;
        },
        isParagraph: function(model) {
            return (model && model.modelType == constants.MODELTYPE.PARAGRAPH);
        },
        isTOC: function(model) {
            return (model && model.modelType == constants.MODELTYPE.TOC);
        },
        /*
         * is field 
         * or image 
         * or link
         */
        isInlineObject: function(model) {
            if (!model)
                return false;
            return (model.modelType == constants.MODELTYPE.IMAGE || model.modelType == constants.MODELTYPE.CANVAS || model.modelType == constants.MODELTYPE.FIELD || model.modelType == constants.MODELTYPE.PAGENUMBER || model.modelType == constants.MODELTYPE.LINK || model.modelType == constants.MODELTYPE.RFOOTNOTE || model.modelType == constants.MODELTYPE.RENDNOTE || model.modelType == constants.MODELTYPE.ALTCONTENT);
        },

        isLinkOrField: function(model) {
            if (!model)
                return false;
            return (model.modelType == constants.MODELTYPE.LINK || model.modelType == constants.MODELTYPE.FIELD);
        },

        isLink: function(model) {
            if (!model)
                return false;
            return (model.modelType == constants.MODELTYPE.LINK);
        },

        isInLink: function(model) {
            if (!model) {
                return false;
            }
            if (ModelTools.isLink(model)) {
                return true;
            }
            return ModelTools.isInLink(model.parent);
        },

        isField: function(model) {
            if (!model)
                return false;
            return (model.modelType == constants.MODELTYPE.FIELD);
        },

        isInPageNumber: function(model){
        	var f = ModelTools.getField(model);
        	if(f)
        		return f.isPageNumber();
        	return false;
        },

        getLink: function(model) {
            if (!model) {
                return null;
            }
            if (ModelTools.isLink(model)) {
                return model;
            }
            if (ModelTools.isParagraph(model))
                return null;
            return ModelTools.getLink(model.parent);
        },
        getField: function(model) {
            if (!model) {
                return null;
            }
            if (ModelTools.isField(model)) {
                return model;
            }
            if (ModelTools.isParagraph(model))
                return null;

            return ModelTools.getField(model.parent);
        },

        hasComments: function(model) {
            if (model.clist && model.clist.length > 0)
                return true;
            else
                return false;
        },

        /*
         * is paragraph 
         * or table
         */
        isParaOrTable: function(model) {
            if (!model)
                return false;
            return (model.modelType == constants.MODELTYPE.PARAGRAPH || model.modelType == constants.MODELTYPE.TABLE);
        },
        
        isNormalPara: function(model)
        {
            if (!model)
                return false;
            return (model.modelType == constants.MODELTYPE.PARAGRAPH && !model.isRightClosure());
        },

        isTrackableParaOrTable: function(model) {
            if (!model)
                return false;
            if(model.modelType == constants.MODELTYPE.PARAGRAPH)
            	return !ModelTools.inDelRow(model);
            else if(model.modelType == constants.MODELTYPE.TABLE)
            	return true;

            return false;
        },

        isTrackingObj: function(model) {
            if (!model)
                return false;
            if(ModelTools.isRow(model))
            	return false;

            var ch = null;
            if(ModelTools.isParagraph(model))
            	ch = model.ch || model.rPrCh;
            else 
            	ch = model.ch;
            if(ch && ch.length && (ch.length > 0))
            {
            	var startTime = trackChange.start;
            	var endTime = trackChange.end;
            	var lch = ch[ch.length - 1];
            	var inTimes = (startTime ? (lch.d >= startTime) : true) && (endTime ? (lch.d <= endTime) : true);
               	return inTimes;
            }
            return false;
        },

        isBookMark: function(r) {
            if (!r) {
                console.error("r is null!! ");
                return false;
            }
            return r.modelType == constants.MODELTYPE.BOOKMARK;
        },
        /*
         * check if it is a run 
         */
        isRun: function(r) {
            //TODO: Add more run types
            if (!r) {
                console.error("r is null!! ");
                return false;
            }

            return r.modelType == constants.MODELTYPE.TEXT //'run.text' 
                || r.modelType == constants.MODELTYPE.IMAGE //'run.image'
                || r.modelType == constants.MODELTYPE.TXBX || r.modelType == constants.MODELTYPE.LINK //'run.hyperlink'
                || r.modelType == constants.MODELTYPE.PAGENUMBER || r.modelType == constants.MODELTYPE.BOOKMARK || r.modelType == constants.MODELTYPE.RFOOTNOTE || r.modelType == constants.MODELTYPE.RENDNOTE
                || r.modelType == constants.MODELTYPE.TRACKDELETEDREF
                || r.modelType == constants.MODELTYPE.TRACKDELETEDOBJS
            	|| r.modelType == constants.MODELTYPE.TRACKOVERREF;
        },
        isPageBreak: function(r) {
            if (!r) {
                console.error("r is null!! ");
                return false;
            }

            if (r.modelType == constants.MODELTYPE.TEXT) {
                return r.isPageBreak();
            }

            return false;
        },
        isCanvas: function(r) {
            return r.modelType == constants.MODELTYPE.CANVAS || r.modelType == constants.MODELTYPE.SQCANVAS || r.modelType == constants.MODELTYPE.FLCANVAS || r.modelType == constants.MODELTYPE.TBCANVAS || r.modelType == constants.MODELTYPE.SIMPLECANVAS;

        },
        isDrawingObj: function(r) {
            return ModelTools.isImage(r) || ModelTools.isTextBox(r) || ModelTools.isCanvas(r);
        },
        isInDrawingObj: function(m)
        {
        	 if (m.parent) {
                 if (ModelTools.isDrawingObj(m.parent)) {
                     return true;
                 } else {
                     return ModelTools.isInDrawingObj(m.parent);
                 }
             }
             return false;
        },
        inCanvas: function(r) {
            return r.parent && ModelTools.isCanvas(r.parent);
        },
        isInCanvas: function(m) {
            if (m.parent) {
                if (ModelTools.isCanvas(m.parent)) {
                    return true;
                } else {
                    return ModelTools.isInCanvas(m.parent);
                }
            }
            return false;
        },
        isNotesRefer: function(r) {
            if (!r) {
                console.error("r is null!! ");
                return false;
            }

            return r.modelType == constants.MODELTYPE.RFOOTNOTE || r.modelType == constants.MODELTYPE.RENDNOTE;
        },
        isAnchor: function(r) {
            return r.modelType == constants.MODELTYPE.SQIMAGE || r.modelType == constants.MODELTYPE.FLIMAGE || r.modelType == constants.MODELTYPE.TBIMAGE

                || r.modelType == constants.MODELTYPE.SQTXBX || r.modelType == constants.MODELTYPE.FLTXBX || r.modelType == constants.MODELTYPE.TBTXBX

                || r.modelType == constants.MODELTYPE.SQCANVAS || r.modelType == constants.MODELTYPE.FLCANVAS || r.modelType == constants.MODELTYPE.TBCANVAS;
        },
        isWrappingAnchor: function(r) {
            return r.modelType == constants.MODELTYPE.SQIMAGE || r.modelType == constants.MODELTYPE.TBIMAGE

                || r.modelType == constants.MODELTYPE.SQTXBX || r.modelType == constants.MODELTYPE.TBTXBX

                || r.modelType == constants.MODELTYPE.SQCANVAS || r.modelType == constants.MODELTYPE.TBCANVAS;
        },
        isCell: function(m) {
            return m.modelType == constants.MODELTYPE.CELL;
        },
        /*
         * check if it is a document
         */
        isDocument: function(m) {
            return m.modelType == constants.MODELTYPE.DOCUMENT ||
                m.modelType == constants.MODELTYPE.HEADERFOOTER ||
                m.modelType == constants.MODELTYPE.FOOTNOTE ||
                m.modelType == constants.MODELTYPE.ENDNOTE; //||m.modelType==writer.constants.MODELTYPE.CELL;
        },
        isDocumentChild: function(m){
            return m.getParent() && m.getParent().modelType == constants.MODELTYPE.DOCUMENT;
        },
        isNotes: function(m) {
            return m.modelType == constants.MODELTYPE.FOOTNOTE || m.modelType == constants.MODELTYPE.ENDNOTE;
        },
        isFootNotes: function(m) {
            return m.modelType == constants.MODELTYPE.FOOTNOTE;
        },
        isEndNotes: function(m){
            return m.modelType == constants.MODELTYPE.ENDNOTE;
        },
        isHeaderFooter: function(m) {
            return m.modelType == constants.MODELTYPE.HEADERFOOTER;
        },
        isInHeaderFooter: function(m) {
            if (m.parent) {
                if (ModelTools.isHeaderFooter(m.parent)) {
                    return true;
                } else {
                    return ModelTools.isInHeaderFooter(m.parent);
                }
            }
            return false;
        },
        isInNotes: function(m) {
            if (m.parent) {
                if (ModelTools.isNotes(m.parent)) {
                    return true;
                } else {
                    return ModelTools.isInNotes(m.parent);
                }
            }
            return false;
        },
        isInEndNotes: function(m)
        {
            if (m.parent) {
                if (ModelTools.isEndNotes(m.parent)) {
                    return true;
                } else {
                    return ModelTools.isEndNotes(m.parent);
                }
            }
            return false;
        },
        isInFootNotes: function(m)
        {
            if (m.parent) {
                if (ModelTools.isFootNotes(m.parent)) {
                    return true;
                } else {
                    return ModelTools.isFootNotes(m.parent);
                }
            }
            return false;
        },
        getNotes: function(m) {
            return ModelTools.getParent(m, ModelTools.isNotes);
        },
        inTable: function(model) {
            if (!model) {
                return false;
            }
            if (model.modelType == constants.MODELTYPE.ROW || model.modelType == constants.MODELTYPE.CELL) {
                return true;
            }
            return ModelTools.inTable(model.parent);
        },
        inDelTable: function(model) {
            if (!model || !model.parent) {
                return false;
            }
            var pa = model.parent;
            if (pa.modelType == constants.MODELTYPE.TABLE && pa.isAllDeletedInTrack()) {
                return true;
            }
            return ModelTools.inDelTable(pa);
        },
        inDelRow: function(model) {
            if (!model || !model.parent) {
                return false;
            }
            var pa = model.parent;
            if (pa.modelType == constants.MODELTYPE.ROW && pa.isTrackDeleted()) {
                return true;
            }
            return ModelTools.inDelRow(pa);
        },        
        isTableinTable: function(model) {
            if (!model) {
                return false;
            }
            if (model.modelType == constants.MODELTYPE.TABLE) {
                return ModelTools.inTable(model.parent);
            }
            return ModelTools.isTableinTable(model.parent);
        },
        inTextBox: function(model) {
            if (!model) {
                return false;
            }
            if (ModelTools.isTextBox(model)) {
                return true;
            }
            return ModelTools.inTextBox(model.parent);
        },
        isInSmartart: function() {
            var paras = pe.lotusEditor.getSelectedParagraph();
            if (paras.length > 0) {
                var model = paras[0];

                var inlineCanvas = ModelTools.getParent(model, ModelTools.isCanvas);
                if (inlineCanvas && inlineCanvas.isSmartArt)
                    return true;
            }

            return false;
        },
        getTable: function(model) {
            if (!model) {
                return null;
            }
            if (model.modelType == constants.MODELTYPE.TABLE) {
                return model;
            }
            return ModelTools.getTable(model.parent);
        },
        //get the table,which parent is document
        getRootTable: function(model) {
            if (!model) {
                return null;
            }
            if (model.modelType == constants.MODELTYPE.TABLE &&
                model.parent &&
                model.parent.modelType == constants.MODELTYPE.DOCUMENT) {
                return model;
            }
            return ModelTools.getRootTable(model.parent);
        },
        getRow: function(model) {
            if (!model) {
                return null;
            }
            if (model.modelType == constants.MODELTYPE.ROW) {
                return model;
            }
            return ModelTools.getRow(model.parent);
        },
        getCell: function(model) {
            if (!model) {
                return null;
            }
            if (model.modelType == constants.MODELTYPE.CELL) {
                return model;
            }
            return ModelTools.getCell(model.parent);
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
        isTrackOverRef: function(model) {
            return model && model.modelType && model.modelType == constants.MODELTYPE.TRACKOVERREF;
        },        
        isTrackDeletedRef: function(model) {
            return model && model.modelType && model.modelType == constants.MODELTYPE.TRACKDELETEDREF;
        },
        isTrackDeletedObjs: function(model) {
            return model && model.modelType && model.modelType == constants.MODELTYPE.TRACKDELETEDOBJS;
        },
        isInTrackDeletedTable: function(model) {
            var table = this.getTable(model);
            while (table) {
                if (table.isTrackDeleted()) 
                    return table;
                if (!table.parent)
                    break;
                // nest table
                table = this.getTable(table.parent);
            }
            return false;
        },
        /*
         * first child of model
         */
        firstChild: function(m) {
            if (m.hints)
                return m.hints.getFirst();

            return m.firstChild();
        },
        /*
         * next sibling of model
         */
        nextSibling: function(m) {
            if (m.parent && m.parent.hints)
                return m.parent.hints.next(m);
            return m.next();
        },
        /*
         * parent of model
         */
        getParent: function(m, filter) {
            if (!m)
                return;
            filter = ModelTools._getFilterFunction(filter);
            var p = m.parent;
            while (p && !filter(p))
                p = p.parent;
            return p;
        },

        /*
         * get length
         */
        getLength: function(m) {
            if (!m) {
                console.error("m is null");
                return 0;
            }
            if (ModelTools.isDocument(m))
                return m.container.length();

            switch (m.modelType) {
                case constants.MODELTYPE.TEXT:
                case constants.MODELTYPE.LINK:
                case constants.MODELTYPE.FIELD:
                    if (m.length)
                        return m.length;
                    else
                        m = ModelTools.getParagraph(m);
                case constants.MODELTYPE.PARAGRAPH:
                    return m.getLength();
                case constants.MODELTYPE.CELL:
                case constants.MODELTYPE.ROW:
                case constants.MODELTYPE.TABLE:
                    return m.container.length();
                default:
                    if (m.container) {
                        return m.container.length();
                    }
                    return 1;
            }
        },
        /*
         * get paragaraph   
         */
        getParagraph: function(m) {
            return ModelTools.getParent(m, constants.MODELTYPE.PARAGRAPH);
        },

        /**
         * is hint in toc
         * @param modelObj, hint or paragraph
         * @returns
         */
        isInToc: function(modelObj) {
            if (!modelObj) return false;
            var paragraph = ModelTools.getAncestor(modelObj, constants.MODELTYPE.PARAGRAPH);
            var styleId = paragraph && paragraph.getStyleId();
            if (styleId && styleId.match(/^TOC\d+$/)) {
                //paragraph may not in a toc div now
                return true;
            } else {
                if (!paragraph)
                    return false;
                else
                    return ModelTools.getParent(paragraph, constants.MODELTYPE.TOC);
            }
        },
        /*
         * get Document
         */
        getDocument: function(m) {
            if (ModelTools.isDocument(m))
                return m;
            else
                return ModelTools.getParent(m, ModelTools.isDocument);
        },
        getDocumentChild: function(m) {
            if (m.getParent() && ModelTools.isDocument(m.getParent()))
                return m;
            else
                return ModelTools.getParent(m, ModelTools.isDocumentChild);
        },
        
        getAncestor: function(model, type) {
            if (!model) {
                return null;
            }
            if (model.modelType == type) {
                return model;
            } else {
                return ModelTools.getAncestor(model.parent, type);
            }
        },
        isChildOf: function(child, parent) {
            if (!child) {
                return false;
            }
            if (child.parent == parent) {
                return true;
            }
            return ModelTools.isChildOf(child.parent, parent);
        },
        /*
         * get child
         */
        getChild: function(m, filter) {
            filter = ModelTools._getFilterFunction(filter);
            var child = ModelTools.firstChild(m);;
            while (child) {
                if (filter(child))
                    return child;
                else
                    child = ModelTools.nextSibling(child);
            }
            return null;
        },

        /**
         * Get the paragraph's element path
         * @param para
         */
        getParagraphPath: function(para) {
            if (para.modelType != constants.MODELTYPE.PARAGRAPH)
                return null;

            var path = [];
            var curObj = para;
            var parent = curObj.parent;
            while (true) {
                if (!parent)
                    throw "The object has no parent.";

                if (ModelTools.isParagraph(parent)) {
                    // In text Box
                    if (ModelTools.isTextBox(curObj)) {
                        path.unshift(curObj.start || 0);
                    } else
                        break;
                } else
                    path.unshift(parent.indexOf(curObj));

                if (ModelTools.isDocument(parent)) {
                    if (ModelTools.isNotes(parent)) {
                        path.unshift(parent.getSeqId());
                        path.unshift(4); // After body
                    } else if (ModelTools.isHeaderFooter(parent)) {
                        if (parent.hfType == "hdr")
                            path.unshift(1); // Before body content
                        else
                            path.unshift(3); // After body content
                    } else
                        path.unshift(2);

                    break;
                }
                curObj = parent;
                parent = curObj.parent;
            }

            return path;
        },
        /**
         * get first child which meet the filter function
         * @param element
         * @param filter
         * @param deepSearch
         */
        getFirstChild: function(m, filter, deepSearch) {
            filter = ModelTools._getFilterFunction(filter);
            var child = m.firstChild();

            while (child) {
                if (filter(child))
                    return child;
                if (deepSearch) {
                    var first = ModelTools.getFirstChild(child, filter, true);
                    if (first)
                        return first;
                }
                child = child.next();
            }
            return null;
        },
        getFirstChildInRange: function(m, filter, deepSearch, start, end) {
            var ret = null;
            var idx = start;
            if (end == null) {
                end = ModelTools.getLength(m) - 1;
            }
            while (!ret && idx <= end) {
                var item = m.getItemByIndex(idx);
                ret = ModelTools.getFirstChild(item, filter, deepSearch);
                idx++;
            }
            return ret;
        },
        getLastChildInRange: function(m, filter, deepSearch, start, end) {
            var ret = null;
            var idx = end;
            if (start == null) {
                start = 0;
            }
            while (!ret && idx >= start) {
                var item = m.getItemByIndex(idx);
                ret = ModelTools.getLastChild(item, filter, deepSearch);
                idx--;
            }
            return ret;
        },
        /**
         * get last child which meet the filter function
         * @param element
         * @param filter
         * @param deepSearch: if search child of children?
         * @returns
         */
        getLastChild: function(m, filter, deepSearch) {
            filter = ModelTools._getFilterFunction(filter);
            var child = m.lastChild();
            while (child) {
                if (filter(child))
                    return child;
                if (deepSearch) {
                    var last = ModelTools.getLastChild(child, filter, true);
                    if (last)
                        return last;
                }
                child = child.previous();
            }
            return null;
        },
        
        getDeepLastChild: function(m)
        {
            var child = m.lastChild();
            while(child)
            {
                var c = child.lastChild();
                if (c)
                    child = c;
                else
                    break;
            }  
            return child;
        },
        /**
         * get next model
         * @param element
         * @param filter
         * @param startFromChild
         * @param guard
         * @returns
         */
        getNext: function(element, filter, startFromChild, guard) {
            if (!element)
                return null;
            filter = ModelTools._getFilterFunction(filter);

            if (guard && !guard.call) {
                var guardModel = guard;
                guard = function(e) {
                    return e != guardModel;
                };
            }

            function _checkChild(m) {
                var child = ModelTools.firstChild(m),
                    ret;
                while (child) {

                    if (guard && guard(child, true) === false)
                        return "outside";
                    if (filter(child))
                        return child;
                    else if (ret = _checkChild(child)) {
                        return ret;
                    }
                    child = ModelTools.nextSibling(child);
                }
                return null;
            }

            //check child element
            var item = startFromChild && _checkChild(element);
            if (item == "outside")
                return null;
            else if (item)
                return item;

            //check itself is outside
            if (guard && guard(element, true) === false)
                return null;

            //check next sibling
            item = ModelTools.nextSibling(element);

            var startFromChild = true;
            if (!item) {
                // no sibling
                //then check start from element's parent
                item = ModelTools.getParent(element);
                startFromChild = false;
            }

            if (!item)
                return null;

            if (guard && guard(item) === false)
                return null;


            if (!filter(item))
                return ModelTools.getNext(item, filter, startFromChild, guard);

            return item;
        },
        /**
         * return children of json Data of a Model.
         * @param jsonData
         */
        getJsonChildren: function(jsonData) {
            var rt = jsonData.rt || jsonData.t;
            switch (rt) {
                case constants.RUNMODEL.TXBX:
                    if (jsonData.txContent)
                        return jsonData.txContent;
                    else if (jsonData.txbxContent)
                        return jsonData.txbxContent;
                    else if (jsonData.anchor && jsonData.anchor.graphicData && jsonData.anchor.graphicData.txbx)
                        return jsonData.anchor.graphicData.txbx.txbxContent;
                    else if (jsonData.inline && jsonData.inline.graphicData && jsonData.inline.graphicData.txbx)
                        return jsonData.inline.graphicData.txbx.txbxContent;
                    break;
                case constants.MODELTYPE.FOOTNOTE:
                case constants.MODELTYPE.ENDNOTE:
                    return jsonData.ps;
                case "wgp":
                case "wpc":
                case "grpSp":
                    //canvas
                    {
                        var children = [];
                        var wpx = jsonData.anchor && jsonData.anchor.graphicData &&
                            (jsonData.anchor.graphicData.wpc || jsonData.anchor.graphicData.wgp);
                        if (!wpx)
                            wpx = jsonData.inline && jsonData.inline.graphicData &&
                            (jsonData.inline.graphicData.wpc || jsonData.inline.graphicData.wgp);
                        if (!wpx)
                            wpx = jsonData;

                        if (wpx.grpSp)
                            children = children.concat(wpx.grpSp);
                        if (wpx.txbx)
                            children = children.concat(wpx.txbx);
                        if (wpx.pic)
                            children = children.concat(wpx.pic);
                        if (wpx.wgp)
                            children = children.concat(wpx.wgp);
                        return children;
                    }
            }

            if (jsonData.fmt) {
                return jsonData.fmt;
            }
            switch (jsonData.t) {
                case 'tbl':
                    return jsonData.trs;
                case 'tr':
                    return jsonData.tcs;
                case 'tc':
                    return jsonData.ps;
                case 'sdt':
                    return jsonData.sdtContent;
            }

            return [];
        },

        getNextWordPosition: function(pos) {
            var nextp = -1;
            if (ModelTools.isRun(pos.obj) && pos.obj.paragraph) {
                var wordbrk = new WordBreakIterator(pos.obj.paragraph.text);
                nextp = wordbrk.nextBoundary(pos.obj.start + pos.index);
            }
            return nextp;
        },

        getPreviousWordPosition: function(pos) {
            var prevp = -1;
            if (ModelTools.isRun(pos.obj) && pos.obj.paragraph) {
                var wordbrk = new WordBreakIterator(pos.obj.paragraph.text);
                prevp = wordbrk.prevBoundary(pos.obj.start + pos.index);
            }
            return prevp;
        },

        isValidSel4Find: function() {
            var range = pe.lotusEditor.getSelection().getRanges()[0];

            var obj = range.getSelectedObject();
            if (obj && (ModelTools.isTextBox(obj) || ModelTools.isCanvas(obj) || ModelTools.isImage(obj)))
                return false;
            return true;
        },

        getCurrentWordRange: function(pos, rootview) {
            var start = {
                index: pos.index,
                obj: pos.obj
            };
            var end = {
                index: pos.index,
                obj: pos.obj
            };
            if (ModelTools.isRun(pos.obj) && pos.obj.paragraph) {
                var wordbrk = new WordBreakIterator(pos.obj.paragraph.text);
                var wordrange = wordbrk.curWordBoundary(pos.obj.start + pos.index);
                end.index = wordrange.end;
                start.index = wordrange.start;
                end.obj = pos.obj.paragraph;
                start.obj = pos.obj.paragraph;
            } else if (ModelTools.isParagraph(pos.obj)) {
                var wordbrk = new WordBreakIterator(pos.obj.text);
                var wordrange = wordbrk.curWordBoundary(pos.index);
                end.index = wordrange.end;
                start.index = wordrange.start;
                end.obj = pos.obj;
                start.obj = pos.obj;
            }
            
            return {start: start, end: end}
        },

        //
        // Get next character boundary
        // return, -1 if pos.obj is not a valid run
        //         or next char pos 
        getNextCharBoundary: function(pos) {
            var ret = -1;

            if (ModelTools.isRun(pos.obj) && pos.obj.paragraph) {
                ret = pos.obj.start + pos.index + 1;
                var charbrk = new CharacterBreakIterator(pos.obj.paragraph.text);
                if (!charbrk.isBoundary(ret)) {
                    var nextb = charbrk.nextBoundary(ret);
                    if (nextb >= 0)
                        ret = nextb;
                }
            }

            return ret;
        },

        //
        //Get prev character boundary
        //return, -1 if pos.obj is not a valid run
        //      or prev char pos
        getPrevCharBoundary: function(pos) {
            var ret = -1;
            if (ModelTools.isRun(pos.obj) && pos.obj.paragraph) {
                ret = pos.obj.start + pos.index - 1;
                var charbrk = new CharacterBreakIterator(pos.obj.paragraph.text);
                if (!charbrk.isBoundary(ret)) {
                    var prevb = charbrk.prevBoundary(ret);
                    if (prevb >= 0)
                        ret = prevb;
                }
            }
            return ret;
        },

        // return a char's start and end boundaries
        // @param, char index, may be at the begin or in the middle of a grapheme cluster 
        // {start:val0,end:val1}
        getCharBoundaries: function(pos) {
            var ret = {
                start: pos.index,
                end: pos.index
            };
            var para = null;
            var index = pos.index;
            if (ModelTools.isRun(pos.obj)) {
                para = pos.obj.paragraph;
                index += pos.obj.start;
            } else if (ModelTools.isParagraph(pos.obj))
                para = pos.obj;

            if (para && para.text.length > 0) {
                var charbrk = new CharacterBreakIterator(para.text);
                var e_index = charbrk.nextBoundary(index);
                if (!charbrk.isBoundary(index)) {
                    var s_index = charbrk.prevBoundary(index);
                    if (s_index >= 0 && e_index > 0) {
                        ret.start = s_index;
                        ret.end = e_index;
                    }
                } else if (e_index > 0)
                    ret.end = e_index;
            }

            return ret;
        },

        /**
         * get previous model
         * @param element
         * @param filter
         * @param startFromChild
         * @param guard
         * @returns
         */
        getPrev: function(element, filter, startFromChild, guard, deep) {
            filter = ModelTools._getFilterFunction(filter);

            if (guard && !guard.call) {
                var guardModel = guard;
                guard = function(e) {
                    return e != guardModel;
                };
            }

            var item = (startFromChild && element) ?  (deep ? ModelTools.getDeepLastChild(element) : ModelTools.lastChild(element)): null;
            var parent;

            if (!item) {
                if (guard && guard(element, true) === false)
                    return null;
                    
                // no child.
                item = element && ModelTools.previousSibling(element);
                if (item && deep)
                {
                    var deepChild = ModelTools.getDeepLastChild(item);
                    if (deepChild)
                        item = deepChild;
                }
            }

            while (!item && (parent = ModelTools.getParent(parent || element))) {
                // The guard check sends the "true" paramenter to indicate that
                // we are moving "out" of the element.
                if (guard && guard(parent, true) === false)
                    return null;
                if (filter(parent))
                    return parent;
                item = ModelTools.previousSibling(parent);
                if (item && deep)
                {
                    var deepChild = ModelTools.getDeepLastChild(item);
                    if (deepChild)
                        item = deepChild;
                }
            }

            if (!item)
                return null;

            if (guard && guard(item) === false)
                return null;


            if (!filter(item))
                return ModelTools.getPrev(item, filter, true, guard, deep);

            return item;
        },
        previousSibling: function(m) {
            if (m.parent && m.parent.hints)
                return m.parent.hints.prev(m);
            return m.previous();
        },
        lastChild: function(m) {
            if (m.hints)
                return m.hints.getLast();
            return m.lastChild();
        },
        /**
         * check if index is end of obj
         * @param obj
         * @param index
         * @returns block or null
         */
        isEndBlock: function(obj, index, inTCGroup) {
            if (ModelTools.isParagraph(obj) && index == obj.getLength())
                return obj;
            else if (obj.paragraph && obj.start != null)
                return ModelTools.isEndBlock(obj.paragraph, obj.start + index);
            else if (!inTCGroup && obj.container && index == obj.container.length())
                return obj;
            else if (inTCGroup && obj._blocks && index == obj._blocks.length())
                return obj;
            return null;
        },
        /**
         * check if index is start of obj
         * @param obj
         * @param index
         * @returns block or null
         */
        isStartBlock: function(obj, index, inTCGroup) {
            if (obj.paragraph && obj.start != null)
            //hint
                return ModelTools.isStartBlock(obj.paragraph, obj.start + index);

            if (index == 0)
                return obj;
            else
                return null;
        },
        /**
         * if the position is start of a block( outside most )
         * return the block
         * else return null
         * @param obj
         * @param index
         */
        getStartOfBlock: function(obj, index, inTCGroup) {
            var block = ModelTools.isStartBlock(obj, index, inTCGroup);
            if (block) {
                var p = block.parent,
                    nextBlock;
                if (p && p.getContainer && (nextBlock = ModelTools.getStartOfBlock(p, p.getContainer().indexOf(block))))
                    return nextBlock;
                else if (p && p._blocks && (nextBlock = ModelTools.getStartOfBlock(p, p._blocks.indexOf(block), true)))
                    return nextBlock;
                else
                    return block;
            }
            return null;
        },
        /**
         * if the position is end of a block( outside most )
         * return the block
         * @param obj
         * @param index
         */
        getEndOfBlock: function(obj, index, inTCGroup) {
            var block = ModelTools.isEndBlock(obj, index, inTCGroup);
            if (block) {
                var p = block.parent,
                    nextBlock;
                if (p && p.getContainer && (nextBlock = ModelTools.getEndOfBlock(p, p.getContainer().indexOf(block))))
                    return nextBlock;
                else if (p && p._blocks && (nextBlock = ModelTools.getEndOfBlock(p, p._blocks.indexOf(block), true)))
                    return nextBlock;
                else
                    return block;
            }
            return null;
        },
        /**
         * compare two position'
         * @param obj1
         * @param index1
         * @param obj2
         * @param index2
         * return:
         * 0  --- equail
         * 1  --- big
         * -1 --- small
         */
        compare: function(obj1, index1, obj2, index2) {
            if (obj1 == obj2) {
                if (index1 == index2)
                    return 0;
                else
                    return (index1 < index2) ? -1 : 1;
            } else {
                var that = ModelTools;

                function isNeighborBlock(ob1, idx1, ob2, idx2) {
                    //end of block1 and start of block2 ?
                    var endBlock = that.getEndOfBlock(ob1, idx1);
                    var startBlock = that.getStartOfBlock(ob2, idx2);
                    return (startBlock && endBlock && endBlock == startBlock.previous());
                }
                //check neighbor block
                if (isNeighborBlock(obj1, index1, obj2, index2) || isNeighborBlock(obj2, index2, obj1, index1))
                    return 0;

                function indexOf(ob1, ob2) {
                    //ob2 is descendants of obj1?
                    //if it is , return the index
                    //else return -1;
                    var p = ob2.getParent();
                    while (p && ob1 != p) {
                        ob2 = p;
                        p = ob2.getParent();
                    }
                    if (ob1 == p) {
                        if (p._blocks) {
                            var index = p._blocks.indexOf(ob2);
                            if (index != -1)
                                return index;
                        }
                        return p.container.indexOf(ob2);
                    } else {
                        return -1;
                    }
                }
                //obj1 contains obj2 ??
                var index = indexOf(obj1, obj2);
                if (index >= 0) {
                    return ModelTools.compare(obj1, index1, obj1, index);
                }
                //obj2 contains obj1 ??
                index = indexOf(obj2, obj1);
                if (index >= 0) {
                    return ModelTools.compare(obj2, index, obj2, index2);
                }
                //use index Of block container to compare
                var container;
                if ((obj1.getParent() == obj2.getParent()) && obj1.parent) {
                    //in a cell/textbox/document
                    container = obj1.parent;
                } else
                    container = ModelTools.getDocument(obj1);
                index1 = indexOf(container, obj1);
                index2 = indexOf(container, obj2);
                return ModelTools.compare(container, index1, container, index2);
            }
        },
        
        compareModelLocation: function(obj1, obj2)
        {
            if (obj1 == obj2) {
               return 0;
            } else {
                var that = ModelTools;
                function indexOf(ob1, ob2) {
                    //ob2 is descendants of obj1?
                    //if it is , return the index
                    //else return -1;
                    var p = ob2.getParent();
                    while (p && ob1 != p) {
                        ob2 = p;
                        p = ob2.getParent();
                    }
                    if (ob1 == p) {
                        if (p._blocks) {
                            var index = p._blocks.indexOf(ob2);
                            if (index != -1)
                                return index;
                        }
                        return p.container.indexOf(ob2);
                    } else {
                        return -1;
                    }
                }
                //obj1 contains obj2 ??
                var index = indexOf(obj1, obj2);
                if (index >= 0) {
                    return -1;
                }
                //obj2 contains obj1 ??
                index = indexOf(obj2, obj1);
                if (index >= 0) {
                    return 1;
                }
                
                var doc = window.layoutEngine.rootModel;
                var index = 0;
                
                function compareLocInDoc(m)
                {
                    var index = 0;
                    if (m == obj1)
                    {
                        index = -1;
                    }
                    else if (m == obj2)
                    {
                        index = 1;
                    }
                    return index;
                }
                
                function recusiveCompareLoc(m)
                {
                    var theIndex = compareLocInDoc(m);
                    if (theIndex)
                    {
                        return theIndex;
                    }
                    if (m.objs) {
                        m.objs.forEach(function(child){
                            var index = recusiveCompareLoc(child);
                            if (index)
                            {
                                theIndex = index;
                                return false;
                            }
                        })
                    }
                    if (theIndex)
                    {
                        return theIndex;
                    }
                    if (m._blocks) {
                        m._blocks.forEach(function(child){
                            var index = recusiveCompareLoc(child);
                            if (index)
                            {
                                theIndex = index;
                                return false;
                            }
                        })
                    }
                    if (theIndex)
                    {
                        return theIndex;
                    }
                    if (m.container)
                    {
                        m.container.forEach(function(child){
                            var index = recusiveCompareLoc(child);
                            if (index)
                            {
                                theIndex = index;
                                return false;
                            }
                        })
                    }
                    if (theIndex)
                    {
                        return theIndex;
                    }
                }
                
                return recusiveCompareLoc(doc);
            }
        },
        
        /********************************************************
         * Field part
         */
        getBookMark: function(anchor) {

            var bm;
            if (pe.lotusEditor.paraCache) {
                //check from editor
                for (var id in pe.lotusEditor.paraCache) {
                    if (pe.lotusEditor.paraCache[id].bookMarks)
                        bm = pe.lotusEditor.paraCache[id].bookMarks[anchor];
                    if (bm && bm.name == anchor)
                        break;
                    else if (bm) //renamed ?
                        delete pe.lotusEditor.paraCache[id].bookMarks[anchor];
                }
            }

            if (!bm) {
                var doc = window.layoutEngine.rootModel;
                bm = ModelTools.getNext(doc, function(model) {
                    if (model.modelType == constants.MODELTYPE.BOOKMARK && model.name == anchor)
                        return true;
                }, true);
            }
            return bm;
        },

        /**************************************************************************
         * get bookmarks
         */
        getAllBookMarks: function() {
            var bms = [];
            if (pe.lotusEditor.paraCache) {

                function getBookmarksFromDoc(doc) {
                    function filterFunc(p) {
                        return !!(pe.lotusEditor.paraCache[p.id] && pe.lotusEditor.paraCache[p.id].bookMarks);
                    }

                    var para = ModelTools.getNext(doc, filterFunc, true);

                    while (para) {
                        for (var bmId in pe.lotusEditor.paraCache[para.id].bookMarks)
                            bms.push(pe.lotusEditor.paraCache[para.id].bookMarks[bmId]);
                        para = ModelTools.getNext(para, filterFunc, false, doc);
                    };
                };

                getBookmarksFromDoc(window.layoutEngine.rootModel);
                pe.lotusEditor.relations.forEachHeaderFooter(getBookmarksFromDoc);
                var notesManager = pe.lotusEditor.relations.notesManager;
                if (notesManager) {
                    for (var i = 0; i < notesManager.footnotes.length; i++) {
                        getBookmarksFromDoc(notesManager.footnotes[i]);
                    }
                    for (var i = 0; i < notesManager.endnotes.length; i++) {
                        getBookmarksFromDoc(notesManager.endnotes[i]);
                    }
                }

            }
            return bms;
        },

        /**
         * 
         */
        createParagraphCache: function(para) {
            if (!pe.lotusEditor.paraCache)
                pe.lotusEditor.paraCache = {};
            if (!pe.lotusEditor.paraCache[para.id])
                pe.lotusEditor.paraCache[para.id] = {};
            var cache = pe.lotusEditor.paraCache[para.id];
            cache.bookMarks = {};
            para.container.forEach(function(run) {
                if (run.modelType == constants.MODELTYPE.BOOKMARK && run.name) {
                    cache.bookMarks[run.name] = run;
                }
            });
        },
        /**
         * release cache for paragraph search
         * @param para
         */
        releaseParagraphCache: function(para) {

            if (pe.lotusEditor.paraCache && pe.lotusEditor.paraCache[para.id])
                delete pe.lotusEditor.paraCache[para.id];

        },
        /**
         * create field instr text
         */
        createFieldInstrTextJson: function(instrText, index, length) {
            index = index || 0;
            length = length || 1;

            if (lang.isString(instrText)) {
                instrText = {
                    "space": "preserve",
                    "t": instrText
                };
            }

            var fld = [];
            fld.push({
                "s": "" + index,
                "l": "0",
                "fldType": "begin",
                "t": "r",
                "rt": "fld",
                "id": msgHelper.getUUID(),
                "style": {
                    "t": "rPr",
                    "preserve": {
                        "noProof": {}
                    }
                }
            });
            fld.push({
                "s": "" + index,
                "l": "0",
                "fldType": "instrText",
                "t": "r",
                "rt": "fld",
                "instrText": instrText,
                "id": msgHelper.getUUID(),
                "style": {
                    "t": "rPr",
                    "preserve": {
                        "noProof": {}
                    }
                }
            });
            fld.push({
                "s": "" + index,
                "l": "0",
                "fldType": "separate",
                "t": "r",
                "rt": "fld",
                "id": msgHelper.getUUID(),
                "style": {
                    "t": "rPr",
                    "preserve": {
                        "noProof": {}
                    }
                }
            });
            fld.push({
                "rsidRPr": "006E25B5",
                "s": "" + (index + length),
                "l": "0",
                "fldType": "end",
                "t": "r",
                "rt": "fld",
                "id": msgHelper.getUUID(),
                "style": {
                    "t": "rPr",
                    "preserve": {
                        "bCs": "1",
                        "noProof": {}
                    }
                }
            });
            return fld;
        },

        isInDocPara: function(p) {
            if (!p)
                return false;
            if (p.modelType != constants.MODELTYPE.PARAGRAPH)
                return false;
            if (!p.parent)
                return false;
            if (p.parent.modelType != constants.MODELTYPE.DOCUMENT)
                return false;

            var nonFuncSet = ModelTools.isInHeaderFooter(p) || ModelTools.isInNotes(p) || ModelTools.inTable(p) || ModelTools.inTextBox(p) || ModelTools.isInToc(p);

            if (nonFuncSet)
                return false;

            return true;
        },

        isInDocTable: function(p) {
            if (!p)
                return false;
            if (ModelTools.isTableinTable(p))
                return false;
            if (ModelTools.getTable(p) && ModelTools.getTable(p).parent && (ModelTools.getTable(p).parent.modelType != constants.MODELTYPE.DOCUMENT))
                return false;
            return true;
        },
        getAllNonSplitedView: function(model) {
            var allViews = model.getAllViews();
            var firstView;
            for (var ownerId in allViews) {
                var viewers = allViews[ownerId];
                firstView = viewers.getFirst();
                if (viewers.next(firstView)) return false;
            }
            return firstView;
        },
        getModelById: function(id) {
        	if(!id) return;
            var doc = window.layoutEngine.rootModel;
            var m = ModelTools.getNext(doc, function(model) {
            	if(model.id && model.id == id)
            		return true;
            }, true);

            return m;
        },
        isTrackable: function(p) {
            if (!p)
                return false;
            if (!p.parent)
                return false;

            var nonFuncSet = this.isInCanvas(p) || this.isInHeaderFooter(p) || this.isInNotes(p) || this.isInToc(p) || this.isTOC(p) || this.isNotes(p);

            if (nonFuncSet)
                return false;     

            return true;
        },

        isTrackBlockGroup: function(model) {
            return ModelTools.isParagraph(model) && model.isTrackBlockGroup;
        },

        getPreTrackingObj: function(model, deep){
        	return g.modelTools.getPrev(model, this.isTrackingObj, false, null, deep);
        }

    });

    for (var x in ModelTools)
        exports[x] = ModelTools[x];

    g.modelTools = exports;
});
