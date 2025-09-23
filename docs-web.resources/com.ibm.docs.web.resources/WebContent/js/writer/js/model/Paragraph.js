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
    "dojo/_base/array",
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/topic",
    "writer/common/Container",
    "writer/msg/msgHelper",
    "writer/common/tools",
    "writer/constants",
    "writer/model/Hints",
    "writer/model/Model",
    "writer/model/prop/ParagraphProperty",
    "writer/model/prop/TextProperty",
    "writer/model/text/Run",
    "writer/model/update/Block",
    "writer/msg/msgCenter",
    "writer/util/ModelTools",
    "writer/track/trackChange",
    "writer/global"
], function(has, array, declare, lang, topic, Container, msgHelper, tools, constants, Hints, Model, ParagraphProperty, TextProperty, Run, Block, msgCenter, ModelTools, trackChange, g) {

    var Paragraph = declare("writer.model.Paragraph", null, {
    	constructor: function(json, parent, hasId, refPara) {
            this.parent = parent;
            // TODO need change to global, document is Real document, header footer, footnote endnote.
            this.doc = ModelTools.getDocument(parent);
            this.container = new Container(this);
            this.text = "";
            this.listSymbols = null;
            this.list = null;
            this.AnchorObjCount = 0;
            this.task = "";
            this.fromJson(json, hasId, refPara);
            this.deleted = false;
            //page break
            topic.publish(constants.EVENT.CREATEDNEWPARA, this);

        }
    });

    Paragraph.prototype = {
        modelType: constants.MODELTYPE.PARAGRAPH,

        setRPrCh: function(value) {
            this.rPrCh  = value;
            this.markReset();
        },

        setPPrch: function(value) {
            this.pPrCh = value;
            this.markReset();
        },

        setCh: function(value) {
            this.ch = value;
            this.markReset();
            // buildGroup
            if (this.isRightClosure() && !this.isInTCGroup || !this.isInTCGroup()) {
                var nextPara = ModelTools.getNext(this,ModelTools.isParagraph);
                this.buildGroup && this.buildGroup();
                if (nextPara && nextPara.buildGroup) {
                    nextPara.buildGroup();
                }
            }
        },

        breakUpCh: function(msgs) {
            if (!this.ch || this.ch.length == 0){
                return;
            }
            if (!this.container) {
                console.error("break up ch of paragraph with no container");
                this.buildRuns();
                return;
            }
            var needMsg = false;
            var pairs;
            if (msgs) {
                needMsg = true;
                pairs = [];
            }
            var me = this;
            this.container.forEach(function(run){
                if (ModelTools.isTrackable(run)) {
                    var cloneCh = lang.clone(me.ch);
                    if(needMsg){
                        var origRunCh = lang.clone(run.ch);
                        run.ch = run.ch ? run.ch.concat(cloneCh) : cloneCh;
                        var act = msgCenter.createSetTextAttribute(run.start, run.length, me, null, null, {
                            "ch": run.ch
                        }, {
                            "ch": origRunCh
                        });
                        pairs.push(act);
                    }else {
                        run.ch = run.ch ? run.ch.concat(cloneCh) : cloneCh;
                    }
                }
            });
            // rPrCh
            var cloneCh = lang.clone(this.ch);
            var origRPrCh = lang.clone(this.rPrCh);
            this.rPrCh = this.rPrCh ? this.rPrCh.concat(cloneCh) : cloneCh;
            this.ch = [];
            if (needMsg){
                var msg = msgCenter.createMsg(constants.MSGTYPE.Text, pairs);
                msg && msgs.push(msg);
                var actRprCh = msgCenter.createSetAttributeAct(this, null, null, {type:"rPrCh", "ch": this.rPrCh},{type:"rPrCh","ch":origRPrCh});
                var actCh = msgCenter.createSetAttributeAct(this, null, null, {type:"ch","ch": this.ch}, {type:"ch","ch": cloneCh});
                msg = msgCenter.createMsg(constants.MSGTYPE.Attribute, [actRprCh, actCh]);
                msg && msgs.push(msg);
            }
        },

        getRuns: function(){
            return this.container;
        },
        isRightClosure: function(){
            return this.isTrackDeleted(this.rPrCh) || this.isTrackDeleted(this.ch);
        },
        getFullIndex: function(visibleIndex) {
            if (visibleIndex < 0)
                return visibleIndex;
            if (visibleIndex >= this.getVisibleText().length)
                return visibleIndex + (this.text.length - this.getVisibleText().length);

            var visibleLen = 0;
            var len = 0;
            var fullIndex = 0;
            var got = false;
            // 1234, 23 deleted, visibleIndex: 1 -> fullIndex: 3
            
            function forEachRun(run) {
            	
            	if (run.hints) {
            		run.hints.forEach(forEachRun);
            	} else {
	                var l = run.length;
	                len += l;
	                if (run.isVisibleInTrack()) {
	                    visibleLen += l;
	                    if (visibleIndex < visibleLen) {
	                        fullIndex = len - (visibleLen - visibleIndex);
	                        got = true;
	                        // = 4 - (2-1) = 3;
	                        return false;
	                    }
	                }
            	}
            }

            this.hints.forEach(forEachRun);
            if (got)
                return fullIndex;

            return this.text.length - 1;
        },

        getVisibleIndex: function(index) {
            if (index <= 0)
                return index;
            if (index >= this.text.length)
                return index - this.text.length + this.getVisibleText().length;

            var visibleIndex = 0;

            // 1234, 23 deleted
            // index: 0, visibleIndex: 0.
            // index: 1, visibleIndex: 1.
            // index: 2, visibleIndex: 1.
            // index: 3, visibleIndex: 1.
            var len = 0;
            var visibleLen = 0;
            
            function forEachRun(run) {
            	
            	if (run.hints) {
            		run.hints.forEach(forEachRun);
            	}
            	else {
	                var s = run.start;
	                var l = run.length;
	                len += l;
	                if (index >= s && index < len) {
	                    if (run.isVisibleInTrack()) {
	                        visibleIndex = visibleLen + (index - s);
	                    } else {
	                        visibleIndex = visibleLen;
	                    }
	                    return false;
	                } else if (run.isVisibleInTrack()) {
	                    visibleLen += l;
	                }
            	}
            }
            
            this.hints.forEach(forEachRun);
            return visibleIndex;
        },

        copy: function(para, deep) {
            this.parent = para.parent;
            this.text = para.text;
            this.id = para.id;
            this.task = para.task;

            if (this.directProperty && !deep)
                this.directProperty.fromJson(para.directProperty.toJson() || {});
            else {
                this.directProperty = para.directProperty.clone();
                this.directProperty.paragraph = this;
            }

            var rPr = para.paraTextProperty.toJson();
            if (this.paraTextProperty && !deep)
                this.paraTextProperty.fromJson(rPr || {});
            else {
                this.paraTextProperty = para.paraTextProperty.clone();
                this.paraTextProperty.paragraph = this;
            }

            this.pPrCh = lang.clone(para.pPrCh);
            this.rPrCh = lang.clone(para.rPrCh);

            var fmt = para.hintsToJson(0, para.text.length);

            this.createHints(fmt, rPr);
            this.checkStartAndLength(0, this.getLength(), true);
            this.buildRuns();
        },

        clone: function(deep) {
            var para = new Paragraph(null, this.parent);

            para.copy(this, deep);
            // list, style ref, TODO
            return para;
        },

        fromJson: function(json, hasId, refPara) {

            this.text = (json && json.c) || "";
            this.id = hasId ? (json.id || msgHelper.getUUID()) : json.id;
            this.task = (json && json.taskId) || "";
            // The directProperty was used for change current paragraph property
            this.directProperty = new ParagraphProperty(json.pPr, this);


            /* Store import format in order to correctly process alignment property of RTL paragraphs/tables */
            if (pe.lotusEditor.setting.isOdtImport() == null) {
                var paraDir = this.directProperty._getValue("direction");
                if (!paraDir)
                    paraDir = pe.lotusEditor.setting.getDefaultDirection();

                if (paraDir)
                    pe.lotusEditor.setting.setImportFormat(paraDir == "rl-tb" || paraDir == "lr-tb");
            }
            this.createHints(json.fmt, json.rPr);
            // It was used to display paragraph mark, like list symbol.
            this.paraTextProperty = new TextProperty(json.rPr);
            this.pPrCh = json.pPrCh;
            this.rPrCh = json.rPrCh;
            this.ch = json.ch;

            this.checkStartAndLength(0, this.getLength(), true);
            this.buildRuns();
        },
        /**
         * Convert the object to JSON format for copy and co-editing message.
         * @param index
         * @param length
         * @param includeParagraph Boolean
         *    includeParagraph is true will generated JSON should include the whole paragraph,
         *    otherwise will only generate internal text JSON.  
         */
        toJson: function(index, length, includeParagraph, btrimBookmark) {
            index = index || 0;
            length = length == undefined ? this.text.length : length;

            var retVal = {};
            retVal.fmt = this.hintsToJson(index, length, btrimBookmark);
            retVal.c = this.text.substring(index, index + length);
            if (includeParagraph) {
                if (this.task != "")
                    retVal.taskId = this.task;
                retVal.t = 'p';
                retVal.id = this.id;
                var rPr = this.paraTextProperty.toJson();
                if (rPr) {
                    retVal.rPr = rPr;
                }
                var pPr = this.directProperty.toJson();
                var dir = this.directProperty.getDirection(true);
                if (dir == "rtl" || dir == "rl-tb") {
                    if (!pPr) {
                        var align = (dir == "rtl") ? "left" : "right";
                        pPr = {
                            direction: dir,
                            align: align
                        };
                    } else if (!pPr.direction)
                        pPr.direction = dir;
                }
                if (pPr) {
                    retVal.pPr = pPr;
                }
                if (this.pPrCh)
                    retVal.pPrCh = this.pPrCh;
                if (this.rPrCh)
                    retVal.rPrCh = this.rPrCh;
                if (this.ch)
                    retVal.ch = this.ch;

            }
            return retVal;
        },
        /**
         * Get the paragraph length
         * @returns
         */
        getLength: function() {
            return this.text.length;
        },
        
        getVisibleLength: function() {
            return this.getVisibleText().length;
        },

        /**
         * override function from Hints
         */
        buildRuns: function() {
            Hints.prototype.buildRuns.apply(this);
            ModelTools.createParagraphCache(this);
        },
        markDirty: function() {
            this.stripMatchModels();
            var that = this;
            this.mark("dirty", function() {
                that.clearCache();
                that._cacheListSymbolProperty = null;
            });
            this.buildRuns();
            if ((!this.isInTCGroup || !this.isInTCGroup()) && ModelTools.isTrackable(this))
                topic.publish("/trackChange/update", this, "dirty");

            this.triggerNavigationUpdate("dirty");
        },
        markDelete: function() {
            this.notifyRemoveFromModel();
            this.mark("deleted");
            if (ModelTools.isTrackable(this) && (!this.isInTCGroup || !this.isInTCGroup()))
                topic.publish("/trackChange/update", this, "delete");
            this.triggerNavigationUpdate("delete");
        },

        markNextToBorderDirty: function() {
            var preModel = this.previous();
            var nextModel = this.next();
            if (this.getBorder() && preModel && preModel.modelType == constants.MODELTYPE.PARAGRAPH && preModel.getBorder())
                preModel.markDirty();
            if (this.getBorder() && nextModel && nextModel.modelType == constants.MODELTYPE.PARAGRAPH && nextModel.getBorder())
                nextModel.markDirty();
        },
        notifyInsertToModel: function() {
            try {
                this.directProperty.insertToModel();
            } catch (e) {
                console.info(e);
            }

            delete this.deleted;
            // Notify paragraphs in text box.
            
            window._IDCache.addCache(this.id, this);

            var mTools = ModelTools;
            this.container.forEach(function(run) {
                if (run.deleted)
                    delete run.deleted;
                if (mTools.isTextBox(run) || mTools.isCanvas(run))
                    run.notifyInsertToModel();
                if (ModelTools.isNotesRefer(run)) {
                    run.insertSel();
                }
            });
        },
        notifyRemoveFromModel: function() {
            this.stripMatchModels();
            this.deleted = true;
            this.directProperty.removeFromModel();
            this.container.forEach(function(run) {
                run.deleteSel && run.deleteSel();
            });

            window._IDCache.removeId(this.id);

            // Notify paragraphs in text box.
            var mTools = ModelTools;
            this.hints.forEach(function(run) {
                if (mTools.isTextBox(run) || mTools.isCanvas(run))
                    run.notifyRemoveFromModel();
            });
        },
        /**
         * Sample: Copy a paragraph with list and heading will create the paragraph object.
         *           Paste it into document will call this function to connect the paragraph with list object and heading style. 
         */
        markInsert: function() {
            /*TODO:crash when modify foot note content for doc is null*/
            var that = this;
            this.notifyInsertToModel();
            this.mark("inserted", function() {
                that.updateListSymbolView();
            });
        },
        markReset: function() {
            var that = this;
            this.mark("reseted", function() {
                that.reset();
                that.createListRuns();
                that.updateListSymbolView();
                if (!that.isInTCGroup || !that.isInTCGroup())
                    topic.publish("/trackChange/update", that, "reset");

                that.triggerNavigationUpdate("reset");
            });

        },
        /**
         * The function will remove paragraph property
         * @param msgs
         */
        cleanParagraphProperty: function(msgs, silent) {
            var msg = this.setIndentRight("none");
            msgHelper.mergeMsgs(msgs, msg);


            // Clear indent
            this.directProperty.setIndentLeft("none");
            this.directProperty.clearSpecialIndent();

            /* alignment and direction should be preserved on creating headings from RTL paragraph */
            if (this.directProperty.getDirection() != "rtl") {
                msg = this.setAlignment("none");
                msgHelper.mergeMsgs(msgs, msg);
            }

            msg = this.directProperty.getMessage();
            if (msg && !silent) {
                this.markReset();
                this.parent.update();
            }

            msgHelper.mergeMsgs(msgs, msg);
        },
        styleChanged: function() {
            this.directProperty.styleChanged();
            this.markNextToBorderDirty();
            this.markReset();
        },
        /**
         * Return message Array
         * @param styleId
         * @returns
         */
        addStyle: function(styleId) {
            var msgs = this.directProperty.addStyle(styleId);
            this.styleChanged();
            this.parent.update();

            return msgs;
        },
        /**
         * Return message Array
         * @param styleId
         */
        removeStyle: function(styleId) {
            var msgs = this.directProperty.removeStyle(styleId);
            this.styleChanged();
            this.parent.update();

            return msgs;
        },
        _insertText: function(text, index, noMark) {
            if (!text || text == "")
                return;
            if (!this.text) {
                this.text = text;
            } else if (index < 0 || index == null) {
                index = this.text.length;
                this.text = this.text + text;
            } else {
                var preText = this.text.substring(0, index);
                var postText = this.text.substring(index);
                this.text = preText + text + postText;
            }
            if (!noMark)
                this.markDirty();
            this.updateMiswordsIndex(index, text.length, text);
        },
        /**
         * insert text 
         * @param text
         * @param index
         */
        insertText: function(text, index, run) {
            if (this.addTextLength(text.length, index)) {
                this._insertText(text, index);
                this.markDirty();
                topic.publish(constants.EVENT.REQUESTSPELLCHECKONPARA, this, text, index);
            }
            this.checkStartAndLength(0, this.getLength());
            return {index: index, length: text.length};
        },

        _getEmptyRPr: function(index) {
            var emptyRPr = this.container.getLast() ? this.paraTextProperty.merge(this.container.getLast().textProperty, true).toJson() : this.paraTextProperty.toJson();
            if (emptyRPr && emptyRPr['ime']) {
                delete emptyRPr['ime'];
            }

            if (emptyRPr && emptyRPr['styleId'] == "Hyperlink")
                delete emptyRPr['styleId'];
            return emptyRPr;
        },
        /**
         * internal method for delete text
         * remove length from index
         * @param index
         * @param len
         */
        removeTextLength: function(index, len, changesData) {
            var that = this;
            var inTrack = trackChange.isOn();
            var trackable = ModelTools.isTrackable(this);
            if (!inTrack || !trackable) {
                that.hints.forEach(function(curProp) {
                    if (curProp.removeTextLength) {
                        curProp.removeTextLength(index, len, that.hints);
                    }
                });
            } else {
                var hint = this.hints.getFirst();
                while (hint) {
                    if (hint.removeTextLength) {
                        var changeData = hint.removeTextLength(index, len, that.hints);
                        if (changeData) {
                            if (lang.isArray(changeData)) {
                                array.forEach(changeData, function(cd) {
                                    cd.para = that;
                                    changesData.push(cd);
                                });
                            } else {
                                changeData.para = that;
                                changesData.push(changeData);
                            }
                        }
                    }
                    hint = hint.next();
                }
            }

            //#34820
            this.fillHintIfEmpty(this._getEmptyRPr(index));
        },

        /**
         * For apply message and paste
         * @param cnt format is similar with insert text message:
         *    {"c": "hello", "fmt":[{"rt":"rPr", "style":{"b":1}} ]}
         * @param index
         */
        insertRichText: function(cnt, index, bNotMark) {
            // console.log("InsertRichText in",index,"of",this.id);
            var index = Math.min(index || 0, this.getLength());
            if (typeof cnt == "string")
                return this.insertText(cnt, index);
            var cloneCnt = lang.clone(cnt);
            if (cloneCnt.rt && cloneCnt.rt != constants.RUNMODEL.TEXT_Run)
                this.insertObject(cloneCnt, index, bNotMark);
            else
                index = this.insert(cloneCnt.fmt, index, cloneCnt.c.length);
            // the markDirty will be called later.
            this._insertText(cloneCnt.c, index, true);

            this.fillHintIfEmpty(this._getEmptyRPr(index));

            this.buildRuns();
            if (!bNotMark) {
                if (cloneCnt && cloneCnt.fmt && array.some(cloneCnt.fmt, function(f) {
                        return f.anchor;
                    }))
                    this.markReset();
                else
                    this.markDirty();
            }

            topic.publish(constants.EVENT.REQUESTSPELLCHECKONPARA, this, cloneCnt.c, index);
            return {index: index, length: cloneCnt.l};
        },
        /**
         * remove bookmarks at index of idx
         * @param idx
         * @param bNotMark
         * @returns {Array}
         */
        removeBookmarks: function(idx, bNotMark) {
            var run = this.byIndex(idx);
            if (idx == this.getLength())
                run = this.lastChild();

            var msgs = [],
                prev, next, dirty;
            if (run && run.modelType == constants.MODELTYPE.BOOKMARK) {
                this.removeBookmark(run, msgs);
                !bNotMark && this.markDirty();
                return msgs;
            }
            var curOpRun = run;
            //remove previous child
            if (run && (run.start == idx)) {
                curOpRun = run;
                prev = this.previousChild(run);
                while (prev && prev.isTrackDeleted && prev.isTrackDeleted()) {
                    curOpRun = prev;
                    prev = this.previousChild(prev);
                }
                while (prev && this.removeBookmark(prev, msgs)) {
                    prev = this.previousChild(curOpRun);
                    while (prev && prev.isTrackDeleted && prev.isTrackDeleted()){
                        curOpRun = prev;
                        prev = this.previousChild(prev);
                    }
                    dirty = true;
                }
            }

            //remove next child
            if (run && (run.start + run.length == idx)) {
                curOpRun = run;
                next = this.nextChild(run);
                while (next && next.isTrackDeleted() && next.isTrackDeleted()) {
                    curOpRun = next;
                    next = this.nextChild(next);
                }
                while (next && this.removeBookmark(next, msgs)) {
                    next = this.nextChild(curOpRun);
                    while (next && next.isTrackDeleted() && next.isTrackDeleted()) {
                        curOpRun = next;
                        next = this.nextChild(next);
                    }
                    dirty = true;
                }
            }
            !bNotMark && dirty && this.markDirty();
            return msgs;
        },

        /**
         * remove bookmark
         * @param index
         * @param len
         * @param bNotMark
         */
        removeBookmark: function(bookmarkRun, msgs) {
            var inTrack = trackChange.isOn();
            var trackable = ModelTools.isTrackable(this);
            if (bookmarkRun && bookmarkRun.modelType == constants.MODELTYPE.BOOKMARK) {
                if (!inTrack || !trackable) {
                    msgs.push(msgCenter.createMsg(constants.MSGTYPE.Text, [msgCenter.createDeleteInlineObjAct(bookmarkRun)], null, "bm"));
                    this.removeObject(bookmarkRun);
                } else {
                    var msgData = bookmarkRun.markDeleteChange();
                    if (msgData) {
                        if (msgData.deleted) {
                            msgs.push(msgCenter.createMsg(constants.MSGTYPE.Text, [msgCenter.createDeleteInlineObjAct(bookmarkRun)], null, "bm"));
                            this.removeObject(bookmarkRun);
                        } else {
                            var act = msgCenter.createSetTextAttribute(bookmarkRun.start, bookmarkRun.length, this, null, null, {
                                ch: msgData.newChanges
                            }, {
                                ch: msgData.oldChanges
                            });
                            var msg = msgCenter.createMsg(constants.MSGTYPE.Text, [act]);
                            msgs.push(msg);
                            this.markDirty();
                        }
                    }
                }
                return true;
            }
            return false;
        },
        deleteTextByOid: function(oid) {
            var obj = this.byId(oid);
            if (obj) {
                this.removeObject(obj);
                // for spell check
                if (obj.length > 0) {
                    this.updateMiswordsIndex(obj.start, -1 * obj.length);
                    topic.publish(constants.EVENT.REQUESTSPELLCHECKONPARA, this, "", obj.start, false);
                }
                this.markDirty();
            }
        },
        deleteText: function(index, len, bNotMark) {
            // if text is pagebreak, then mark, for paragraph updateLayout
            var run = this.byIndex(index);

            while (run && 0 == run.length) {
                // TODO Track, VISIBLE ?
                // filter the bookmark and some run whose length is 0
                run = run.next();
            }

            if (run && run.br && run.br.type == "page") {
                this.deletedPbr = true;
            }
            
            if(run && run.isDynaPageNumber && run.isDynaPageNumber())
            {
            	index = (index<=run.start ? index: run.start);
            	len = ((index + len)>=(run.start + run.length)? len:  (run.start + run.length - index));
            }


            var inTrack = trackChange.isOn() && ModelTools.isTrackable(this);
            var deleted = this["_deleteText" + (inTrack ? "Track" : "")](index, len);

            var changeMsgData = [];

            if (deleted) {
                this.removeTextLength(index, len, changeMsgData);

                this.checkStartAndLength(0, this.getLength());
                if (bNotMark)
                    this.buildRuns();
                else
                    this.markDirty();
                if (inTrack) {
                    this.updateMiswordsIndex(index, -1 * len);
                    topic.publish(constants.EVENT.REQUESTSPELLCHECKONPARA, this, "", index, false);
                }
                
                return changeMsgData;
            }
        },

        /*
         * Remove text from this.text, donot modify properties
         * index : where to remove
         * len : the length to remove
         * return true if removed text;
         * otherwise return false.
         */
        _deleteText: function(index, len) {
            if (this.text == null || this.text == "" || len <= 0)
                return false;

            var preText = "",
                postText = "";
            preText = this.text.substring(0, index);
            postText = this.text.substring(index + len);
            this.text = preText + postText;

            // for spell check
            this.updateMiswordsIndex(index, -1 * len);
            topic.publish(constants.EVENT.REQUESTSPELLCHECKONPARA, this, "", index, false);

            return true;
        },

        _deleteTextTrack: function(index, len) {
            if (this.text == null || this.text == "" || len <= 0)
                return false;

            return true;
        },

        /*
         * removeHint from paragraph
         */
        removeHint: function(hint, bNotMark) {
            //  this.deleteText( hint.start, hint.length, bNotMark );
            this._deleteText(hint.start, hint.length);
            var parent = hint.parent;
            var len = hint.length;
            parent.removeObject(hint, bNotMark);

            var next;
            while (parent && parent != this) {
                if (parent.length != null)
                    parent.length -= len;
                if (parent.parent && parent.parent != this) {
                    next = parent.parent.next(parent);
                    next && next.moveBackward(-len, true);
                }
                parent = parent.parent;
            }
            this.checkStartAndLength(0, this.getLength());
            this.buildRuns();
            if (!bNotMark)
                this.markDirty();
        },

        setTextAttribute: function(act){
            if (act.len == 0) // OT with delete element will change length to 0.
                return {
                    target: this,
                    idx: act.idx,
                    len: act.len
                };
            var runs;
            if (ModelTools.isEmptyParagraph(this))
                runs = this.hints;
            else
                runs = this.splitRuns(act.idx, act.len);
            var me = this;
            runs.forEach(function(run) {
                if (act.st)
                    run.setStyle(act.st);
                else if (act.at) {
                    if ("ch" in act.at){
                        var before = run.isTrackDeleted();
                        // not an object reference, like clone
                        run.ch = act.at.ch ? [].concat(act.at.ch) : [];
                        var after = run.isTrackDeleted();
                        if (before && !after){ // insert
                            if (run && run.br && run.br.type == "page" && me.deletedPbr) {
                                delete me.deletedPbr; // insert page break
                            }
                            me.updateMiswordsIndex(run.start, run.length, run.text);
                            topic.publish(constants.EVENT.REQUESTSPELLCHECKONPARA, me, run.text, run.start);
                        } else if(!before && after) { //delete
                            if (run && run.br && run.br.type == "page") {
                                me.deletedPbr = true; // remove page break
                            }
                            me.updateMiswordsIndex(run.start, -1 * run.length);
                            topic.publish(constants.EVENT.REQUESTSPELLCHECKONPARA, me, "", run.start, false);
                        }
                    }

                    if ("rPrCh" in act.at)
                    	// not an object reference, like clone
                        run.rPrCh = act.at.rPrCh ? [].concat(act.at.rPrCh) : [];
                    run.markDirty();
                }
            });
            if (act.at && "ch" in act.at)
                this.fillHintIfEmpty();
            this.markDirty();
            // return informations to fix cursor
            return {
                target: this,
                idx: act.idx,
                len: act.len
            };
        },

        /*
         * event fire up when paragraph split
         * 
         * */
        onSplit: function() {
            var sel = pe.lotusEditor.getShell().getSelection();

            // request spell check
            topic.publish(constants.EVENT.REQUESTSPELLCHECKONPARA, this, "", this.text.length, true);
        },
        /*
         * split model
         * If the paragraph include a section and create paragraph after it, will move it to new created paragraph
         */
        split: function(idx, msgs) {
        	var isStartOfPara = (idx == 0);
            if (this.getVisibleIndex(idx) == this.getVisibleText().length)
            	idx = this.text.length;

            //create new paragraph json
            var len = idx > 0 ? (this.text && (this.text.length - idx)) : 0;
            var newParaJson = this.toJson(idx, len, true, true);
            newParaJson.id = msgHelper.getUUID();
            var curRun = null;
            if (idx == 0) // Start of paragraph 
            {
                curRun = this.byIndex(idx);

                var styleId = this.getStyleId();
                delete newParaJson.ch;
                if (styleId && (styleId == "TOCHeading" || (/TOC[1-6]/).test(styleId))) {
                    if (!newParaJson.pPr)
                        newParaJson.pPr = {};
                    else if (newParaJson.pPr.numPr)
                        delete newParaJson.pPr.numPr;
                    delete newParaJson.pPr.styleId;
                }
            } else if (idx == this.text.length) // End of paragraph
            {
                delete newParaJson.ch;
                // Get next paragraph style
                var styleId = this.getStyleId();
                var style = styleId && styleId != "none" && pe.lotusEditor.getRefStyle(styleId);

                var hint = this.byIndex(idx - 1);
                var tarHint = hint;
                while (tarHint && (!tarHint.isVisibleInTrack() || tarHint.modelType == constants.MODELTYPE.RFOOTNOTE || tarHint.modelType == constants.MODELTYPE.RENDNOTE)) {
                    tarHint = this.hints.prev(tarHint);
                }
                if (!tarHint) {
                    tarHint = hint;
                    while (tarHint && (!tarHint.isVisibleInTrack() || tarHint.modelType == constants.MODELTYPE.RFOOTNOTE || tarHint.modelType == constants.MODELTYPE.RENDNOTE)) {
                        tarHint = this.hints.next(tarHint);
                    }
                }

                if (style && style.next && style.next != "" && !style.isDefault) {
                    if (!newParaJson.pPr)
                        newParaJson.pPr = {};
                    else if (newParaJson.pPr.numPr) {
                        // Defect 39353, remove List
                        delete newParaJson.pPr.numPr;
                    }
                    newParaJson.pPr.styleId = style.next;
                    newParaJson.fmt = [];
                    // clear the rPr if next attr exist
                    if (newParaJson.rPr)
                        newParaJson.rPr = {};
                } else {
                    if (tarHint) {
                        newParaJson.rPr = tarHint.textProperty.merge(this.paraTextProperty, true).toJson(); //merge the last run text style with paragraph text style
                    } else {
                        newParaJson.rPr = this.paraTextProperty.toJson();
                    }
                }
                curRun = tarHint;
            } else // Middle of paragraph
            {
                msgs && msgCenter.addDeleteMsg(this, idx, null, msgs);
                trackChange.pause();

                this.deleteText(idx, len);

                trackChange.resume();

            }

            if (curRun) {
                newParaJson.fmt = [];
                var runJson = curRun.toJson(0, 0);
                if (curRun.isTextRun && curRun.isTextRun()) {
                    //split from the end of para, we don't need inherit its comments
                    if (idx == this.text.length)
                        delete runJson.cl;
                    newParaJson.fmt.push(runJson);
                }

            }

            // TODO can cache the json for message
            var newPara = new Paragraph(newParaJson, this.parent, true);
            // delete newPara.rPrCh;
            // deal with section id
            if (isStartOfPara) {
                newPara.setSectionId("");
                delete newPara.rPrCh;
                if (trackChange.isOn() && ModelTools.isTrackable(newPara)) {
                    newPara.rPrCh = [trackChange.createChange("ins")];
                }
            } else {
                var oldTpCh = lang.clone(this.rPrCh);
                delete this.rPrCh;
                if (trackChange.isOn() && ModelTools.isTrackable(newPara)) {
                    this.rPrCh = [trackChange.createChange("ins")];
                    if (msgs) {
                        var act = msgCenter.createSetAttributeAct(this, null, null, {
                            "type": "rPrCh",
                            "ch": this.rPrCh || null
                        }, {
                            "type": "rPrCh",
                            "ch": oldTpCh
                        });
                        msgs.push(msgCenter.createMsg(constants.MSGTYPE.Attribute, [act]));
                    }
                }
                if (msgs) {
                    var msg = this.setSectionId("", true);
                    msgHelper.mergeMsgs(msgs, msg);
                }
            }

            this.onSplit();
            return newPara;
        },
        emptyClone: function() {
            trackChange.pause();
            var cloneJson = this.split(this.text.length).toJson();
            trackChange.resume();
            return cloneJson;
        },
        // merge another paragraph to this one
        merge: function(para) {
            para.reset();
            // TODO Merge section
            if (!para.text) {
                para.text = "";
            }
            var last = this.hints.getLast();
            // remove the empty run at the last of para
            if (last.modelType == constants.MODELTYPE.TEXT && last.length == 0) {
                this.hints.remove(last);
                last = this.hints.getLast();
            }
            var that = this;
            para.hints.forEach(function(hint) {
                //do not append bookmark
                if (hint.modelType != constants.MODELTYPE.BOOKMARK) {
                    that.hints.append(hint);
                    hint.setParent(that);
                    hint.setParagraph(that);
                    if (hint.rParagraph && hint.rParagraph == para)
                        hint.rParagraph = that;
                    hint.markInsert();
                }
            });

            // dont call hints.removeObject which will mark the run deleted
            para.hints.removeAll();
            para.buildRuns();

            if (!this.text) {
                var len = 0;
            } else {
                var len = this.text.length;
            }
            this._insertText(para.text, len);
            this.fixStart(last);
            this.markDirty();
            this.buildRuns();

            // notify spell checker for a forced check
            if (para.text.length >= 0)
                topic.publish(constants.EVENT.REQUESTSPELLCHECKONPARA, this, para.text, len, true);

        },

        replaceText: function(idx, len, content) {

        },
        splitRun: function(run, idx) {

        },
        reset: function() {
            this.clearCache();
            this._cacheListSymbolProperty = null;
            this.hints.forEach(function(hint) {
                hint.clearAllCache();
            });
        },

        changeStyle: function(style, idx, len) {

        },
        isPageBreakBefore: function() {
            return this.directProperty.isPageBreakBefore();
        },

        isKeepLines: function() {
            return this.directProperty.isKeepLines();
        },

        isWidowControl: function() {
            return this.directProperty.isWidowControl();
        },

        ifOnlyContianPageBreak: function() {
            var run = this.container.getFirst();
            while (run) {
                if (!run.br || run.br.type != "page")
                    return false;

                run = this.container.next(run);
            }

            return true;
        },
        isList: function() {
            return !!this.list;
        },
        isBullet: function() {
            if (this.isList()) {
                var lvl = this.getListLevel();
                var absNum = this.list.getAbsNum();
                var numDef = absNum.getNumDefinitonByLevel(lvl);
                if (numDef)
                {
                    var numFmt = numDef.getNumFmt();
                    if (numFmt == "bullet" || numFmt == "none")
                        return true;
                }
            }
            return false;
        },
        isFirstListItem: function() {
            if (this.isList() && this == this.list.getParagraph(0)) {
                return true;
            }
            return false;
        },
        getOrderInSubList: function() {
        	var listLvl = this.getListLevel();
        	var allItems = this.list.paras;
        	var num = 1;
        	for(var i = 0;i< allItems.length;i++) {
        		var item = allItems[i];
        		var curLvl = item.getListLevel();
        		if(curLvl == listLvl){
        			if(this == item)
        				break;
        			num++;
        		} else if (curLvl < listLvl) {
        			num = 1;
        		}
        	}
        	return num;
        },
        isOutline: function(){
        	var outlineLvl = this.getOutlineLvl();
        	if(outlineLvl != undefined && outlineLvl >= 0)
        		return true;
        	return false;
        },
        isHeading: function() {
            var styleId = this.getStyleId();
            if (styleId && styleId.indexOf("Heading") == 0)
                return true;
            return false;
        },
        isTitle: function() {
            var styleId = this.getStyleId();
            if (styleId && styleId == "Title")
                return true;
            return false;
        },
        isSubtitle: function() {
            var styleId = this.getStyleId();
            if (styleId && styleId == "Subtitle")
                return true;
            return false;
        },
        isHeadingOutline: function() {
            if (this.isHeading() && this.isList()) {
                var heading1Style = pe.lotusEditor.getRefStyle("Heading1");
                if (heading1Style) {
                    var styleProp = heading1Style.getParagraphProperty();
                    var headingNumId = styleProp && styleProp.getNumId();
                    if (headingNumId != "none" && headingNumId != -1 && pe.lotusEditor.number.isValidNumId(headingNumId)) {
                        // Defect 39363
                        var otherNumIds = pe.lotusEditor.number.getSameListNumId(headingNumId);
                        if (otherNumIds && otherNumIds.length > 0) {
                            for (var i = 0; i < otherNumIds.length; i++) {
                                if (this.list.id == otherNumIds[i])
                                    return true;
                            }
                        }
                    }
                }
            }

            return false;
        },
        isEndWithPageBreak: function() {
            var lastRun = this.container.getLast();
            while (lastRun && (ModelTools.isBookMark(lastRun) || !lastRun.isVisibleInTrack())) {
                lastRun = this.container.prev(lastRun);
            }
            if (lastRun && ModelTools.isPageBreak(lastRun)) {
                return true;
            }
            return false;
        },
        hasSectId: function() {
            var sectId = this.directProperty && this.directProperty.sectId;
            if (sectId && sectId.length > 0) {
                return true;
            }
            return false;
        },

        getOutlineLvl: function() {
            return this.directProperty.getOutlineLvl();
        },
        getSectId: function() {
            return this.directProperty.getSectId();
        },
        getDirectProperty: function() {
            return this.directProperty;
        },
        addViewerCallBack: function(view) {
            var sectId = this.getSectId();
            if (!sectId) {
                return;
            }
            var viewers = view.getViews();
            var previousView = viewers.prev(view);
            if (previousView) {
                delete previousView.sectId;
            }
            view.sectId = sectId;
        },
        isEmpty: function() {
            if (this.hints.length() == 1 && this.hints.getFirst().start == 0 && this.hints.getFirst().length == 0) {
                return true;
            }
        },

        hasInlineContent: function() {
            var hasInline = false;
            this.hints.forEach(function(run) {
                if (run.length > 0 && !ModelTools.isAnchor(run) && (run.isVisibleInTrack && run.isVisibleInTrack())) {
                    hasInline = true;
                    return false;
                }
            });
            return hasInline;
        },

        /**
         * is in headerfooter container
         * @returns {Boolean}
         */
        isInHeaderFooter: function() {
            return ModelTools.getParent(this, constants.MODELTYPE.HEADERFOOTER) != null;
        },
        getListSymbolProperty: function() {
            if (!this.list) {
                this._cacheListSymbolProperty = null;
                return null;
            }
            // Cache list symbol style
            // The list property should be changed when change list type.
            var listProperty = this.list.getListSymbolProperty(this.getListLevel());
            if (this._cacheListProperty != listProperty || !this._cacheListSymbolProperty) {
                this._cacheListProperty = listProperty;

                var result = null;
                if (this.paraTextProperty && listProperty)
                    result = this.paraTextProperty.merge(listProperty, true, true);
                else {
                    result = (listProperty || this.paraTextProperty);
                    if (result)
                        result = result.clone();
                }

                // Defect 36902, remove underline from para text property
                var hasUnderline = function(textProp) {
                    if (!textProp)
                        return false;
                    var textDec = textProp.style["text-decoration"];
                    return (textDec && textDec.indexOf("underline") != -1);
                };
                if (result && hasUnderline(this.paraTextProperty) && !hasUnderline(listProperty)) {
                    var textDec = result.style["text-decoration"];
                    if (textDec)
                        result.style["text-decoration"] = textDec.replace(/underline/g, "");
                }

                this._cacheListSymbolProperty = result;
            }

            return this._cacheListSymbolProperty;
        },
        /**
         * Change the list symbol
         * @param symbol
         * @param imageId	Image ID of picture bullet
         * @param justification The bullet justififaction.
         * @returns {Boolean} Return true when need change
         */
        setListSymbol: function(symbol, imageId, justification) {
            if (this.listSymbols && this.listSymbols.txt == symbol) {
                if (imageId == this.listSymbols.imageId)
                    return false;
            }
            this.listSymbols = {};
            this.listSymbols.txt = symbol;
            if (imageId || imageId == 0)
                this.listSymbols.imageId = imageId;
            this.listSymbols.lvlJc = justification;
            this.createListRuns();
            //    	this.markDirty();
            return true;
        },
        /**
         * Remove the paragraph list
         * Return the messages
         * Boolean isClean, clear the numbering Id and level in direct property
         * Clean list maybe set the paragraph to list. Like remove list from heading outline then undo.
         */
        removeList: function(isClean) {
            //    	if(!this.isList() && !isClean)
            //    		return null;

            var msg = this.directProperty.removeList(isClean);
            if (msg) {
                delete this.listSymbols;
                delete this.listRuns;

                this.updateListSymbolView();
                this.markReset();
                this.parent.update();
            }

            return msg;
        },
        /**
         * Set the paragraph to list
         * @param numId
         * @param level
         * @param needClearIndent is true will clean the paragraph's indent value
         * @returns
         */
        setList: function(numId, level, needClearIndent) {

            var msg = this.directProperty.setList(numId, level, needClearIndent);
            if (msg) {
                this.markReset();
                //			this.buildRuns();
                this.parent.update();
            }
            return msg;
        },
        getListId: function() {
            return this.directProperty.getNumId();
        },
        getListLevel: function() {
            var lvl = this.directProperty.getNumLevel();
            if (lvl == 'none') return -1;
            return parseInt(lvl);
        },
        setListLevel: function(lvl) {
            //    	if (!this.directProperty || !this.directProperty.getNumLevel() == 'none') return -1;
            this.directProperty.setNumLevel(lvl);
            var msg = this.directProperty.getMessage();
            if (msg) {
                this.list.updateListValue();
                // TODO Need considerate the update mechanism
                this.markReset();
                this.buildRuns();
                this.parent.update();
            }
            return msg;
        },
        /**
         * @argument bMessage
         * return a message for removing section property
         */
        setSectionId: function(sectId, bMessage) {
            var curSectId = this.directProperty.getSectId();
            if (sectId == curSectId || (!sectId && !curSectId))
                return null;

            var message = null;
            if (this.directProperty) {
                this.directProperty.setSectId(sectId);
                this.markDirty();
                message = this.directProperty.getMessage();
                if (bMessage)
                    return message;
            }
            return message;
        },
        updateView: function() {
            var allViews = this.getAllViews();
            var textModelContainer = this.container;
            var textModel = this.container.getFirst();
            if (!textModel) {
                this.deleteView();
                return;
            }
            for (var ownerId in allViews) {
                var viewers = allViews[ownerId];
                var firstView = viewers.getFirst();
                // When apply multiple messages, the first message maybe reset the model
                // Then markDirty to update the paragraph will throw exception.
                if (firstView && firstView.hasLayouted()) {
                    firstView.update(textModel, textModelContainer, viewers);
                }
            }
            this.container.forEach(function(textModel) {
                delete textModel.inserted;
                delete textModel.dirty;
            });
        },
        updateListSymbolView: function() {
            var allViews = this.getAllViews();
            for (var ownerId in allViews) {
                var viewers = allViews[ownerId];
                var firstView = viewers.getFirst();
                firstView && firstView.updateListSymbol();
            }
        },
        /**
         * The indent value should include unit.
         * @param indentVal, 21pt
         * @returns
         */
        setIndent: function(indentVal, isFromMsg) {
            this.directProperty.setIndentLeft(indentVal, isFromMsg);

            var msg = this.directProperty.getMessage();
            if (msg) {
                this.markReset();
                this.parent.update();
                //			this.buildRuns();
            }
            return msg;
        },

        setIndentRight: function(indentVal) {
            this.directProperty.setIndentRight(indentVal);

            var msg = this.directProperty.getMessage();
            if (msg) {
                this.markReset();
                this.parent.update();
                //			this.buildRuns();
            }
            return msg;
        },

        /**
         * Set indent type and value together.
         * If type is empty string("") will not change the type attribute. 
         */
        setIndentSpecialTypeValue: function(type, value) {
            this.directProperty.setIndentSpecialTypeValue(type, value);

            var msg = this.directProperty.getMessage();
            if (msg) {
                this.markReset();
                this.parent.update();
            }
            return msg;
        },

        /**
         * Set paragraph's alignment
         * @param align
         * @returns The message
         */
        setAlignment: function(align, noMark) {
            if (this.directProperty.getDirection(true) == "rtl") {
                if (align == "right")
                    align = "left";
                else if (align == "left")
                    align = "right";
            }
            this.directProperty.setAlign(align);

            var msg = this.directProperty.getMessage();
            if (msg && !noMark) {
                this.markReset();
                this.parent.update();
            }

            return msg;
        },
        setPageBreakBefore: function(value) {
            this.directProperty.setPageBreakBefore(value);

            var msg = this.directProperty.getMessage();
            if (msg) {
                if (this.parent.modelType == constants.MODELTYPE.CELL) {
                    var table = this.parent.parent.parent;
                    table.markReset();
                    table.update();
                } else {
                    this.markReset();
                    this.parent.update();
                }

            }

            return msg;
        },
        setKeepLines: function(value) {
            this.directProperty.setKeepLines(value);

            var msg = this.directProperty.getMessage();
            if (msg) {
                if (this.parent.modelType == constants.MODELTYPE.CELL) {
                    var table = this.parent.parent.parent;
                    table.markReset();
                    table.update();
                } else {
                    this.markReset();
                    this.parent.update();
                }
            }

            return msg;
        },

        setWidowControl: function(value) {
            this.directProperty.setWidowControl(value);

            var msg = this.directProperty.getMessage();
            if (msg) {
                if (this.parent.modelType == constants.MODELTYPE.CELL) {
                    var table = this.parent.parent.parent;
                    table.markReset();
                    table.update();
                } else {
                    this.markReset();
                    this.parent.update();
                }
            }

            return msg;
        },
        /**
         * Set paragraph's direction
         * @param direction
         * @returns The message
         */
        setDirection: function(direction) {
            this.directProperty.setDirection(direction);
            var msg = this.directProperty.getMessage();
            if (msg) {
                this.markReset();
                this.parent.update();
            }

            return msg;
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
            var act = msgCenter.createSetParaTaskAct(constants.ACTTYPE.SetParaTask, task_id == "" ? false : true, this.id, task_id == "" ? this.task : task_id);
            var msg = msgCenter.createMsg(constants.MSGTYPE.Attribute, [act]);
            this.task = task_id;
            this.markReset();
            this.parent.update();
            return msg;
        },

        setBackgroundColor: function(color) {
            this.directProperty.setBackgroundColor(color);

            var msg = this.directProperty.getMessage();
            if (msg) {
                this.markReset();
                this.parent.update();
            }
            return msg;
        },

        setBorder: function(border) {
            this.directProperty.setBorder(border);

            var msg = this.directProperty.getMessage();
            if (msg) {
                this.markReset();
                this.parent.update();
                this.markNextToBorderDirty();
            }
            return msg;
        },

        /**
         * Set line spacing
         * @param lineSpacing
         * @param lineRule
         * @returns
         */
        setLineSpacing: function(lineSpacing, lineRule) {
            if (lineRule)
                this.directProperty.setLineSpaceType(lineRule);
            if (lineSpacing || lineSpacing == 0)
                this.directProperty.setLineSpaceValue(lineSpacing);

            var msg = this.directProperty.getMessage();
            if (msg) {
                this.markReset();
                this.parent.update();
            }

            return msg;
        },

        getStyleId: function() {
            var styleId = this.directProperty.styleId;
            if (styleId && styleId != this.directProperty._defaultVal) {
                return styleId;
            } else {
                // Defect 40376
                // Get default paragraph style.
                var defaultStyle = pe.lotusEditor.getDefaultParagraphStyle();
                styleId = defaultStyle && defaultStyle.styleId;
                return styleId;
            }
            return null;
        },
        /**
         * @returns Docuemnt's default paragraph style
         */
        getDefaultStyle: function() {
            if (this.getStyleId())
                return null;
            return pe.lotusEditor.getDefaultParagraphStyle();
        },
        /**
         * 
         * @param isPrevious true is Previous paragraph, false is Next paragraph
         * @returns {Boolean}
         */
        canMergeBorder: function(isPrevious) {
            var curPara = isPrevious ? this.previous() : this;
            var nextPara = isPrevious ? this : this.next();

            if (!curPara || !nextPara || curPara.modelType != nextPara.modelType)
                return false;

            var curProp = curPara.directProperty,
                nextProp = nextPara.directProperty;
            if (curProp.getIndentLeft() != nextProp.getIndentLeft() || curProp.getIndentRight() != nextProp.getIndentRight())
                return false;

            var curBorder = curPara.getBorder();
            var nextBorder = nextPara.getBorder();
            if (!curBorder || !nextBorder)
                return false;

            if (curBorder["bottom"] && (nextBorder["bottom"] || nextBorder["top"]) || (curBorder["top"] && nextBorder["top"])) {
                // Compare border style
                var borderLen = 0,
                    nextBorderLen = 0;
                for (var item in curBorder)
                    borderLen++;
                for (var item in nextBorder)
                    nextBorderLen++;
                if (borderLen != nextBorderLen)
                    return false;

                for (var item in curBorder) {
                    if (!nextBorder[item])
                        return false;
                    var borderItem = curBorder[item];
                    var nextBorderItem = nextBorder[item];
                    for (var count in borderItem) {
                        if (borderItem[count] != nextBorderItem[count])
                            return false;
                    }
                }
                // Same border style.
                return true;
            }

            return false;
        },
        getBorder: function() {
            if (this.directProperty) {
                var border = this.directProperty.getBorder();
                return border;
            }
        },
        getBackgroundColor: function() {
            return this.directProperty.getBackgroundColor();
        },

        getParagraphs: function() {
            return [this];
        },

        pushFindResultModels: function(finder, model) {
            if (!this.finder)
                this.finder = finder;
            if (this.finder.isReplacingAll)
                return;
            if (!this.matchModels)
                this.matchModels = [];
            this.matchModels.push(model);
        },

        getMatchModelIndex: function(matchModels, model) {
            var len = matchModels.length;
            for (var i = 0; i < len; i++) {
                var tmp = matchModels[i];
                if (tmp.start == model.start && tmp.end == model.end && tmp.para.id == model.para.id)
                    return i;
            }
            return -1;
        },
        stripMatchModels: function() {
            if (pe.lotusEditor.isReplacingAll || pe.lotusEditor.isReplacing)
                return;
            if (!this.finder || (this.finder.matchModels.length == 0 && this.finder.replacedMatchModels.length == 0)) {
                this.clearMatchModels();
                return;
            }
            var index, tempArray, sourceModels = this.finder.matchModels;
            if (this.matchModels && this.matchModels.length > 0)
                for (var i = 0; i < this.matchModels.length; i++) {
                    index = this.getMatchModelIndex(sourceModels, this.matchModels[i]);
                    if (index == -1) {
                        sourceModels = this.finder.replacedMatchModels;
                        index = sourceModels.indexOf(this.matchModels[i]);
                        if (index == -1)
                            continue;
                        tempArray = sourceModels.splice(index);
                        tempArray.shift();
                        this.finder.replacedMatchModels = sourceModels = sourceModels.concat(tempArray);
                    } else {
                        tempArray = sourceModels.splice(index);
                        tempArray.shift();
                        this.finder.matchModels = sourceModels = sourceModels.concat(tempArray);
                        topic.publish(constants.EVENT.SHOWTOTALNUM, this.finder.focusIndex, this.finder.matchBeforeFocus, this.finder.matchModels.length);
                    }
                }
            this.finder.highlight(this.finder.highlightAll, false, true);
            this.clearMatchModels();
        },
        clearMatchModels: function() {
            delete this.finder;
            delete this.matchModels;
        },

        /*
         * get next misspelled word mark, considering every word's start and end
         */
        getLastMisWordsMark: function(start, end) {
            var ret = -1;
            // when spellcheck is not enabled, always return -1
            if (!window.spellcheckerManager ||
                !window.spellcheckerManager.isAutoScaytEnabled())
                return ret;
            var scdata = this.scdata;
            if (scdata && lang.isArray(scdata.misWords) && scdata.misWords.length > 0) {
                for (var i = 0; i < scdata.misWords.length; i++) {
                    var mis_start = this.getFullIndex(scdata.misWords[i].index);
                    var mis_end = this.getFullIndex(mis_start + scdata.misWords[i].word.length);
                    if (mis_start < end && mis_start > start) {
                        ret = mis_start;
                        break;
                    }
                    if (mis_end < end && mis_end > start) {
                        ret = mis_end;
                        break;
                    }
                }
            }
            return ret;
        },

        /*
         * update misspelled words index when delete/add contents
         */
        updateMiswordsIndex: function(index, len, text) {
            var scdata = this.scdata;
            if (len == 0 || !scdata) return;
            var visibleIndex = this.getVisibleIndex(index);
            var visibleLen = this.getVisibleIndex(index + len) - visibleIndex;
            // update the range to be checked
            if (scdata.scrange_start == -1 ||
                scdata.scrange_start == undefined || scdata.scrange_start > visibleIndex)
                scdata.scrange_start = visibleIndex;
            var change_end = len < 0 ? visibleIndex : visibleIndex + visibleLen;
            if (scdata.scrange_end != undefined && scdata.scrange_end > 0 &&
                scdata.scrange_end < change_end)
                scdata.scrange_end = change_end;

            // update the checking range when the para is under spell checking
            if (scdata.checking) {
                var checking_range = scdata.checking;
                if (len > 0) { // insert
                    if (index > checking_range.start && index < checking_range.end) {
                        checking_range.state = 1;
                        checking_range.end += len;
                    } else if (index <= checking_range.start) {
                        checking_range.start += len;
                        checking_range.end += len;
                    }
                } else if (len < 0 && index < checking_range.end) { // delete, len is a negnative value
                    var delta_end = index - len;
                    if (delta_end <= checking_range.start) {
                        checking_range.start += len;
                        checking_range.end += len;
                    } else {
                        checking_range.state = 1; // changed checking area
                        if (checking_range.end > index && checking_range.end < delta_end) {
                            checking_range.end = index;
                        } else {
                            checking_range.end += len;
                        }
                        if (checking_range.start > index && checking_range.start < delta_end) {
                            checking_range.start = index;
                        }
                    }
                }
            }

            if (!lang.isArray(scdata.misWords) || scdata.misWords.length == 0) return;
            for (var i = scdata.misWords.length - 1; i >= 0; i--) {
                var origindex = scdata.misWords[i].index;
                // before the range
                if ((origindex + scdata.misWords[i].word.length) <= visibleIndex) continue;
                // after the range
                var endp = visibleIndex;
                if (len < 0) endp -= visibleLen;
                if (origindex >= endp) {
                    scdata.misWords[i].index += visibleLen;
                    continue;
                }

                var posinword, preText, postText;
                // insert case
                if (len > 0) {
                    posinword = visibleIndex - origindex;
                    preText = scdata.misWords[i].word.substring(0, posinword);
                    postText = scdata.misWords[i].word.substring(posinword);
                    scdata.misWords[i].word = preText + text + postText;
                } else { // delete case
                    if (index >= origindex) {
                        preText = scdata.misWords[i].word.substring(0, index - origindex);
                        var pos2 = visibleIndex - visibleLen - origindex; // len is a neg val
                        if (pos2 < scdata.misWords[i].word.length)
                            postText = scdata.misWords[i].word.substring(pos2);
                        else
                            postText = "";
                        scdata.misWords[i].word = preText + postText; // avoid undef
                    } else {
                        // in this case, we will also need update the index val
                        scdata.misWords[i].index = visibleIndex;
                        var pos2 = visibleIndex - visibleLen - origindex; // len is a neg val
                        if (pos2 < scdata.misWords[i].word.length)
                            postText = scdata.misWords[i].word.substring(pos2);
                        else
                            postText = "";
                        scdata.misWords[i].word = postText; // avoid undef
                    }
                    if (scdata.misWords[i].word.length == 0)
                        scdata.misWords.splice(i, 1);
                }
            }
        },
        getMergedTextProperty: function() {
            if (!this.mergedTextProperty) {
                Model.prototype.getMergedTextProperty.apply(this);
                if (this.directProperty && this.directProperty.backgroundColor) {
                    if (this.directProperty.backgroundColor.fill)
                        this.mergedTextProperty.style["background-color"] = this.directProperty.backgroundColor.fill;
                    if (this.directProperty.backgroundColor.color && this.directProperty.backgroundColor.color != 'auto')
                        this.mergedTextProperty.style["background-color"] = this.directProperty.backgroundColor.color["background-color"];
                }
            }
            return this.mergedTextProperty;
        },
        deleteBreakInTrack: function() {
            var msgs = [];
            var oldChanges = lang.clone(this.rPrCh);

            if (!this.rPrCh)
                this.rPrCh = [];

            if (this.isTrackDeleted(this.rPrCh)) {
                // deleted already.
            } else if (this.isTrackInsertedByMe(this.rPrCh)) {
                this.rPrCh.pop();
                var msg = msgCenter.createMsg(constants.MSGTYPE.Attribute, [msgCenter.createSetAttributeAct(this, null, null, {
                    "type": "rPrCh",
                    "ch": this.rPrCh
                }, {
                    "type": "rPrCh",
                    "ch": oldChanges
                })]);
                msgs.push(msg);
                msg.pt = true;
                msg.deleted = true;
                this.markDirty();
            } else {
                var oldChanges = lang.clone(this.rPrCh);
                var data = trackChange.createChange("del");
                this.rPrCh.push(data);
                var msg = msgCenter.createMsg(constants.MSGTYPE.Attribute, [msgCenter.createSetAttributeAct(this, null, null, {
                    "type": "rPrCh",
                    "ch": this.rPrCh
                }, {
                    "type": "rPrCh",
                    "ch": oldChanges
                })]);
                msgs.push(msg);
                this.markDirty();
            }
            // buildGroup
            if (!this.isInTCGroup || !this.isInTCGroup()) {
                var nextPara = ModelTools.getNext(this,ModelTools.isParagraph);
                if (nextPara) {
               		// var directMsg = nextPara.changeDirectProperty(this);
                	// if (directMsg) {
                 //    	msgs = msgs.concat(directMsg);
                	// }
                	if (nextPara.buildGroup)
                    	nextPara.buildGroup();
                }
            }
            return msgs;
        },
        changeDirectProperty: function(para) {
            return para.directProperty.applyDirectStyle(this,true);
        },
        createBreakInTrack: function() {
            var msgs = [];
            var orig = lang.clone(this.rPrCh);
            var changed = false;
            if (this.rPrCh) {
                if (!array.some(this.rPrCh, function(c) {
                        return c.t == "ins" || c.t == "del";
                    })) {
                    this.rPrCh.push(trackChange.createChange("ins"));
                    changed = true;
                }
            } else {
                this.rPrCh = [];
                changed = true;
                this.rPrCh.push(trackChange.createChange("ins"));
            }

            if (changed) {
                var act = msgCenter.createSetAttributeAct(this, null, null, {
                    "type": "rPrCh",
                    "ch": this.rPrCh
                }, {
                    "type": "rPrCh",
                    "ch": orig
                });
                msgs.push(msgCenter.createMsg(constants.MSGTYPE.Attribute, [act]));
            }
            return msgs;
        },

        isAllTextDeletedInTrack: function() {
            if (this.isTrackDeleted(this.getCh()))
                return true;
            var container = this.container;
            var isAllDeleted = true;
            var isEmpty = ModelTools.isEmptyParagraph(this);
            if (!isEmpty) {
                container.forEach(function(child) {
                    if (child && !child.isTrackDeleted()) {
                        isAllDeleted = false;
                        return false;
                    }
                });
            }
            if (!isAllDeleted)
                return false;
            return true;
        },

        isAllDeletedInTrack: function() {
            if (this.isTrackDeleted(this.getCh()))
                return true;
            if (!(this.isTrackDeleted(this.rPrCh)))
                return false;
            var text = this.isAllTextDeletedInTrack();
            if (!text)
                return false;
            return true;
        },

        deleteInTrack: function() {
            if (!has("trackGroup"))
                return true;
            if (this.isTrackDeleted(this.ch))
                return;
            // if (ModelTools.isEmptyParagraph(this) && this.isTrackInsertedByMe(this.rPrCh))
            //     return true;

            var msgs = [];
            var oldCh = [];
            this.ch = [trackChange.createChange("del")];
            var act = msgCenter.createSetAttributeAct(this, null, null, {
                    "type": "ch",
                    "ch": this.ch
                }, {
                    "type": "ch",
                    "ch": oldCh
            });
            
            msgs.push(msgCenter.createMsg(constants.MSGTYPE.Attribute, [act]));
            
            this.list && this.list.removePara(this);
            this.markDirty();

            return msgs;
        },

        getText: function() {
            return this.text;
        },

        getVisibleText: function() {
            var me = this;
            var text = "";
            if (this.isTrackDeleted())
                return "";
            this.hints.forEach(function(child) {
                if (child) {
                    if (child.isVisibleInTrack()) {
                        text += me.text.substring(child.start, child.start + child.length);
                    } else {

                    }
                }
            });
            return text;
        },

        _getPPRTrack: function() {
            if (this.pPrCh && this.pPrCh.length) {
                return this.pPrCh[0];
            }
            return null;
        },

        // find the first run, get its track id to check if it is connected with prev para.
        _getFirstRunForTrack: function(dummyOK) {
            var c = this.container;
            if (!c)
                return null;
            var run = c.getFirst();
            // ignore dummy run
            var dummy = null;
            if (run && run.length == 0 && run.modelType == constants.MODELTYPE.TEXT) {
                dummy = run;
                run = c.next(run);
            }
            if (!run && dummy && dummyOK)
                return dummy;
            return run;
        },
        
        _getLastRunForTrack: function(dummyOK)
        {
            var c = this.container;
            if (!c)
                return null;
            var run = c.getLast();
            var dummy = null;
            // ignore dummy run
            if (run && run.length == 0 && run.modelType == constants.MODELTYPE.TEXT) {
                dummy = run;
                run = c.prev(run);
            }
            if (!run && dummy && dummyOK)
                return dummy;
            return run;
        },

        _getContinuedPrevPara: function(start, end) {
            var tc = trackChange;
            var parentContainer = this.getParent().container || this.getParent().objs;
            var needDummy = parentContainer.getLast() == this;
            var run = this._getFirstRunForTrack(needDummy);
            
            var runChs = array.filter(run ? run.getCh() : [], function(c) {
                return (c.t == "ins" || c.t == "del") && c.d >= start && c.d <= end;
            });
            var paraBreakChs = array.filter((!run) ? this.getRPrCh() : [], function(c) {
                return (c.t == "ins" || c.t == "del") && c.d >= start && c.d <= end;
            });

            var hasRunCh = runChs.length > 0;
            var iamLast = (parentContainer.getLast() == this);
            var iamFirst = (parentContainer.getFirst() == this);
            if (iamFirst)
                return null;
            var iamLastEmpty = false;
            if (iamLast && runChs.length == 0 && paraBreakChs.length == 0 && run.length == 0 && run.modelType == constants.MODELTYPE.TEXT)
            {
                // empty paragraph in the parent end,
                iamLastEmpty = true;
            }
            if (runChs.length || paraBreakChs.length || iamLastEmpty) {
                // has run, and run ch/rPrCh or the end of char has rPrCh if no run
                var prevPara = ModelTools.getPrev(this, ModelTools.isTrackableParaOrTable);
                if (prevPara)
                {
                    if (ModelTools.isTable(prevPara))
                	    return false;
                    if (prevPara.getParent() != this.getParent())
                    {
                        return false;
                    }
                    if (iamLastEmpty)
                        return prevPara;
                }
                
                var prevChs = [];
                if (prevPara)
                {
                    var container = prevPara.getParent().container || prevPara.getParent().objs;
                    if (container.getLast() == prevPara)
                    {
                        var run = prevPara._getLastRunForTrack(true);
                        if (run)
                        {
                            // maybe it is the dummy run.
                            var chs = run.getCh();
                            prevChs = array.filter(run.getCh(), function(c) {
                                 return (c.t == "ins" || c.t == "del") && c.d >= start && c.d <= end;
                            });
                            if (!chs || chs.length == 0)
                            {
                                if (run.length == 0 && run.modelType == constants.MODELTYPE.TEXT)
                                {
                                    // dummy run.
                                    return prevPara;
                                }
                            }
                        }
                        else
                        {
                           return false;
                        }
                    }
                    else
                    {
                        prevChs = array.filter(prevPara.getRPrCh(), function(c) {
                            return (c.t == "ins" || c.t == "del") && c.d >= start && c.d <= end;
                        });
                    }
                }
                if (prevChs.length) {
                    if (tc.isContinue(prevChs, hasRunCh ? runChs : paraBreakChs)) {
                        // exist same user;
                        return prevPara;
                    }
                }
            }
            return false;
        },

        _getContinuedNextPara: function(start, end) {
            var nextPara = ModelTools.getNext(this, ModelTools.isTrackableParaOrTable);
            if (nextPara) {
            	if(ModelTools.isTable(nextPara))
            		return null;
                var prev = nextPara._getContinuedPrevPara(start, end);
                if (prev == this) {
                    return nextPara;
                }
            }
            return null;
        },

        getTrackedGroupParas: function(prev, next, startTime, endTime) {
            var paras = [this];
            if (prev) {
                var prevPara = this._getContinuedPrevPara(startTime, endTime);
                if (prevPara && !g.modelTools.isChildOf(this, prevPara)) {
                    var prevParas = prevPara.getTrackedGroupParas(true, false, startTime, endTime);
                    Array.prototype.unshift.apply(paras, prevParas);
                }
            }
            if (next) {
                var nextPara = this._getContinuedNextPara(startTime, endTime);
                if (nextPara && !g.modelTools.isChildOf(nextPara, this))
                    paras = paras.concat(nextPara.getTrackedGroupParas(false, true, startTime, endTime));
            }
            return paras;
        },
        triggerNavigationUpdate: function(mode) {
        	if(pe.scene && pe.scene.naviMgr && pe.scene.naviMgr.getCurrentOpenPane()) {
            	if(this.isOutline()) {
            		if(!g.modelTools.isInToc(this))
            			topic.publish("/navigation/update", this, mode);
            	} else {
            		if(mode == 'reset' || mode == 'dirty') {
                		var naviPane = pe.scene.naviMgr.getCurrentOpenPane();
                		var idx = naviPane.findPara(this.id);
                		if(idx >=0)
                			topic.publish("/navigation/update", this, 'delete');
            		}
            	}
        	}
        },
        getRPrCh: function() {
            var ch = this.getCh();
            if (ch)
                if (this.rPrCh)
                    return this.rPrCh.concat(ch);
                else
                    return ch;
            return this.rPrCh || [];
        },

        toMarkdown: function() {        	
            if (this.isTrackDeleted(this.getCh()))
                return {"text":""};

        	var md = {};
        	var prefix ="", mdStr = "", suffix = "";

        	var getHeadingPrefix = function(lvl) {
        		var hPrefix = "";
        		var iLvl = parseInt(lvl);
       			switch(iLvl){
	    			case 5: hPrefix += "#";
	    			case 4: hPrefix += "#";
	    			case 3: hPrefix += "#";
	    			case 2: hPrefix += "#";
	    			case 1: hPrefix += "#";
	    			case 0: hPrefix += "# ";
	    			default:
       			}
       			return hPrefix;
        	};

        	var filterFormat = function(str) {
        		return str && str.replace(/[*_]/gm,"");
        	};

        	if (ModelTools.isTOC(this)) {
        		prefix = "\n";
        		mdStr = "[TOC]";
        		suffix += "\n";
        	} else {
            	md = this.hintsToMd();
            	mdStr = md.text;
            	if(this.isList()) {
            		var lvl = this.getListLevel();
            		if(this.isHeading()){
            			prefix += getHeadingPrefix(lvl);
            			mdStr = filterFormat(mdStr);
            			suffix += "\n";
            		} else if(this.listSymbols){
            			for(var i=0;i<lvl;i++) {
            				prefix += "    ";
            			}
            			if(this.isBullet())
            				prefix +="* ";
            			else{
            				prefix += this.getOrderInSubList();
            				prefix += ". ";
            			}
            		}
            	} else if (this.isHeading()) {
            		var styleId = this.getStyleId();
            		var lvl = styleId.substr(7);
            		prefix += getHeadingPrefix(lvl);
            		mdStr = filterFormat(mdStr);
            		suffix += "\n";
            	} else if(this.isSubtitle()) {
            		prefix += getHeadingPrefix(1);
            		mdStr = filterFormat(mdStr);
        			suffix += "\n";
        		} else if(this.isTitle()) {
        			prefix += getHeadingPrefix(0);
        			mdStr = filterFormat(mdStr);
        			suffix += "\n";
        		}
        	}

            if (!(this.isTrackDeleted(this.rPrCh)))
        		suffix += "\n";
        	md.text = prefix + mdStr + suffix;

            return md;
        },
        toHtml: function() {
        	var tagName = "p";
        	var getHeadingName = function(lvl) {
        		var hName = "p";
        		var iLvl = parseInt(lvl);
        		if(iLvl > 5) 
        			iLvl = 5;
        		if(iLvl > 0)
        			hName = "h" + iLvl;
       			return hName;
        	};

//        	if(this.isList()) {
//        		var lvl = this.getListLevel();
//        		if(this.isHeading())
//        			tagName = getHeadingName(lvl);
//        		 else if(this.listSymbols){
//        			if(this.isBullet())
//        				tagName ="ol";
//        			else
//        				tagName ="li";
//        		}
//        	} else 
        	if (this.isHeading()) {
        		var styleId = this.getStyleId();
        		var lvl = styleId.substr(7);
        		tagName = getHeadingName(lvl);
        	} else if(this.isSubtitle())
        		tagName = getHeadingName(2);
    		else if(this.isTitle())
    			tagName = getHeadingName(1);

        	var html = "<"+tagName+">";
            var allViews = this.getAllViews();
            for (var ownerId in allViews) {
                var viewers = allViews[ownerId];
                var firstView = viewers.getFirst();
                if(firstView.getHtmlContent)
                	html += firstView.getHtmlContent();
            }
            html += "</"+tagName+">";
        	return html;
        }
    };
    tools.extend(Paragraph.prototype, new Hints());
    tools.extend(Paragraph.prototype, new Model());
    tools.extend(Paragraph.prototype, new Block());

    return Paragraph;
});