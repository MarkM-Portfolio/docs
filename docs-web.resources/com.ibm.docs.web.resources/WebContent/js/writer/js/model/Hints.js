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
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/_base/url",
    "writer/common/Container",
    "writer/constants",
    "writer/model/text/TextRun",
    "writer/util/ModelTools",
    "writer/track/trackChange",
    "writer/model/text/TrackDeletedObjs",
    "writer/model/text/TrackOverRef",
    "writer/msg/msgCenter",
    "writer/global"
], function(has, declare, lang, dojoUrl, Container, constants, TextRun, ModelTools, trackChange, TrackDeletedObjs, TrackOverRef, msgCenter, global) {

    /**
     * The Object was used manage the paragraph's text property. 
     * @param json
     * @param para
     */

    var Hints = declare("writer.model.Hints", null, {
        /**
         * 
         * @param jsonAttr
         * @param paragraphRPR The default's paragraph mark property.
         * @returns {common.Container}
         */
         getRunFac: function()
         {
            return global.runFac;
         },

        createHints: function(jsonAttr, paragraphRPR) {
            this.hints = new Container(this);

            var empty = true;
            for (var i = 0; jsonAttr && (i < jsonAttr.length); i++) {
                var att = jsonAttr[i];
                var run = this.getRunFac().createRun(att, this);
                if (!run)
                    console.info("Not implemented property type: " + JSON.stringify(att));
                else
                    this.hints.append(run);
            }
            this.fillHintIfEmpty(paragraphRPR);
            return this.hints;
        },
        /**
         * check start and length
         * @param start
         * @param length
         */
        checkStartAndLength: function(start, length, bInit) {
            var hasError = null;
            var index = start,
                hints = this.hints;

            var doc = this.modelType && ModelTools.getDocument(this);
            var isloading = doc && doc.isLoading;
            for (var i = 0; i < hints.length(); i++) {
                var hint = hints.getByIndex(i);
                if (hint.start != index) {
                    if (!bInit && hint.length != 0) //may init paragraph from split json
                        hasError = true;
                    hint.setStart(index);
                }
                if (hint.start > (start + length) || hint.length < 0 || (hint.length > 0 && (hint.start >= (start + length)))) {
                    hints.remove(hint);
                    if (!isloading || bInit)
                        hint.markDelete();
                    hasError = true;
                    continue;
                }
                index += hint.length;
            };

            if (start + length != index) {
                var hint = hints.getLast();
                if (hint) {
                    hint.setLength(start + length - hint.start);
                    if (!isloading || bInit)
                        hint.markDirty();
                    hasError = true;
                }
            }
            this.fillHintIfEmpty();
            if (hasError)
                console.error("error happend in hints list!!");
        },

        fillHintIfEmpty: function(paragraphRPR) {
            if (!has("trackGroup") && this.isTrackDeleted(this.ch))
                return;
            var empty = true;
            this.hints.forEach(function(run) {
                if (run.modelType != constants.MODELTYPE.BOOKMARK && !ModelTools.isAnchor(run) && (!run.isVisibleInTrack || run.isVisibleInTrack())) {
                    empty = false;
                    return false;
                }
            });
            var fillPos = [];
            if (empty) {
                // If the paragraph is empty will create a dummy run with its paragraph's run property
                paragraphRPR = paragraphRPR ? lang.clone(paragraphRPR) : "";
                if (paragraphRPR && paragraphRPR.styleId == "Hyperlink") {
                    delete paragraphRPR.styleId;
                    delete paragraphRPR.color;
                }
                var emptyRunJson = {
                    s: this.start || 0,
                    l: 0,
                    placeHolder: true,
                    "style": paragraphRPR
                };
                if(this.hints.length() == 1 && this.hints.getFirst().isFront){
                	emptyRunJson.s = this.hints.getFirst().length || 0;
                	this.hints.append(new TextRun(emptyRunJson, this));
                	this.markReset();
                	fillPos.push({isBefore:false, json:emptyRunJson});
                } else {
                	this.hints.appendFront(new TextRun(emptyRunJson, this));
                	fillPos.push({isBefore:true, json:emptyRunJson});
                }
            }

            //insert empty hint for block ojbect
            var blocks = [],
                that = this,
                idxs = [],
                offset = 0;
            this.hints.forEach(function(run) {
                if (ModelTools.isDrawingObj(run)) {
                    var prev = that.hints.prev(run);
                    while (prev && prev.modelType == constants.MODELTYPE.BOOKMARK)
                        prev = that.hints.prev(prev);
                    if (!prev || ModelTools.isDrawingObj(prev)) {
                        blocks.push(run);
                        idxs.push(offset);
                    }
                }
                offset++;
            });
            for (var i = 0; i < blocks.length; i++) {
                paragraphRPR = paragraphRPR ? lang.clone(paragraphRPR) : "";
                var emptyRunJson = {
                    s: blocks[i].start,
                    l: 0,
                    placeHolder: true,
                    "style": paragraphRPR
                };
                this.hints.insertBefore(new TextRun(emptyRunJson, this), blocks[i]);
                fillPos.push({isBefore:true, json:emptyRunJson, offset:idxs[i]});
            }

            var last = this.hints.getLast();
            var lastOffset = this.hints.length() - 1;
            while (last && (last.modelType == constants.MODELTYPE.BOOKMARK || last.br)) {
                last = this.hints.prev(last);
                lastOffset--;
            }

            if (last && ModelTools.isDrawingObj(last)) {
                paragraphRPR = paragraphRPR ? lang.clone(paragraphRPR) : "";
                var emptyRunJson = {
                    s: last.start + last.length,
                    l: 0,
                    placeHolder: true,
                    "style": paragraphRPR
                };
                this.hints.insertAfter(new TextRun(emptyRunJson, this), last);
                fillPos.push({json:emptyRunJson, offset:lastOffset});
            }
            return fillPos;
        },

        createListRuns: function() {
            if (!this.listSymbols)
                return;
            this.listRuns = {};
            if (this.listSymbols.txt) {
                var textRun = new TextRun(null, this, this.listSymbols.txt);
                textRun.isListRun = true;
                this.listRuns['txt'] = textRun;
                var listProp = this.getListSymbolProperty();
                if (listProp)
                    textRun.textProperty = listProp;
            }
            if (this.listSymbols.imageId || this.listSymbols.imageId == 0) {
                this.listRuns['img'] = pe.lotusEditor.number.getImg(this.listSymbols.imageId, this);
            }
        },
        buildRuns: function() {
            //this.container.removeAll();
            this.container = new Container(this);

            this.createListRuns();
            var paragraph = this;
            var last = this.hints.getLast();
            if (ModelTools.isParagraph(paragraph) && last && last.br && last.br.type != "page") {
                //for break, add a dummy run after this br with br run text style
                this.hints.append(new TextRun({
                    s: last.start + last.length,
                    l: 0,
                    style: last.textProperty.toJson()
                }, this));
            }

            this.hints.forEach(function(run) {
                var textRuns = run.createRun();
                if (!textRuns)
                    return;

                if (textRuns.isContainer) {
                    paragraph.container.appendAll(textRuns);
                } else {
                    paragraph.container.append(textRuns);
                }
            });

            return this.container;
        },
        removeChildTextRun: function(childTextRun) {
            if (this.hints.length() <= 1) {
                return false;
            } else {
                this.hints.remove(childTextRun);
                return true;
            }
        },

        firstChild: function() {
            if (!this.hints) {
                return null;
            }
            return this.hints.getFirst();
        },
        lastChild: function() {
            if (!this.hints) {
                return null;
            }
            return this.hints.getLast();
        },

        nextChild: function(m) {
            if (!this.hints) {
                return null;
            }
            return this.hints.next(m);
        },

        previousChild: function(m) {
            if (!this.hints) {
                return null;
            }
            return this.hints.prev(m);
        },

        /**
         * Insert an Object (link,field ...)  into model 
         * @param cnt: {"fmt" : [ {
                    "style" : {
                        "styleId" : "Hyperlink"
                    },
                    "rt" : "rPr",
                    "s" : 5,
                    "l" : 5
                } ],
                "id" : "2",
                "rt" : "hyperlink",
                "src" : "http://www.ibm.com" }
         * @param index: insert position.
         */
        insertObject: function(cnt, index, bNotMark) {
            var hint = this.byIndex(index);
            if (!hint) {
                hint = this.hints.getLast();
            }
            var prop = this.getRunFac().createRun(cnt, this);
            if (prop) {
                hint = hint.insertHint(index, prop);
                // Check if there is a blank text run is next to the inline Object run and it needs to be deleted.
                var nextHint = this.hints.next(hint);
                if (nextHint && nextHint.isTextRun && nextHint.isTextRun() && nextHint.length == 0)
                    this.removeObject(nextHint, true);
                else
                    this.fixStart(hint);
                this.markDirty();
            }
            return prop;
        },
        insertTrackDeletedObjs: function(objs, bFront, bNotMark) {
            var insertIndex = bFront ? 0 : this.getLength();
            var delCh = [trackChange.createChange("del")];
            var delObjs = new TrackDeletedObjs({s:insertIndex,ch:delCh, isFront: bFront}, this, objs);
            if (bFront) {
                this.hints.appendFront(delObjs);
                this.text = "\u0001" + this.text;
                var nextHint = this.hints.next(delObjs);
                if (nextHint) {
                   this.fixStart(delObjs); 
                }
            } else {
                this.hints.append(delObjs);
                this.text = this.text + "\u0001";
            }
            this.fillHintIfEmpty();
            if (!bNotMark)
                this.markDirty();
            return msgCenter.createMsg(constants.MSGTYPE.Text,[msgCenter.createInsertTextAct(insertIndex, 1, this)]);
        },

        insertOverTrackObj: function(cnt, index, text) {
            var hint = this.byIndex(index);
            if (!hint) {
                hint = this.hints.getLast();
            }
            var delObj = new TrackOverRef(cnt, this, text);
            delObj.ch = [trackChange.createChange("del")];
            if (delObj) {
                hint = hint.insertHint(index, delObj);
                var s1 = "", s2 = "";
                if(index > 0)
                	s1 = this.text.substr(0,index);
                if(index < this.text.length)
                	s2 = this.text.substr(index);
                this.text = s1 + cnt.c + s2;
                this.fixStart(hint);
                this.markDirty();
            }
            return msgCenter.createMsg(constants.MSGTYPE.Text,[msgCenter.createInsertTextAct(index, 1, this)]);
        },
        /*
         * removeObject from hints
         */
        removeObject: function(obj, bNotMark) {
            var next = this.hints.next(obj);
            var len = obj.length;

            this.hints.remove(obj);
            !bNotMark && obj.markDelete();
            next && next.moveBackward(-len, true);
        },
        /**
         * check start from fromHint
         * @param from
         */
        fixStart: function(fromHint) {
            var hints = this.hints;
            if (!fromHint) {
                fromHint = hints.getFirst();
            }
            var index = null;
            while (fromHint) {
                if (index == null)
                    index = fromHint.start || 0;
                else if (fromHint.start != index) {
                    fromHint.setStart(index);
                }
                index += fromHint.length;
                fromHint = this.hints.next(fromHint);
            }
        },
        /**
         * Insert formats into model
         * @param formats : [{ "att":"tp", "style":{"b":1}, "l" :1} ]
         * @param index The insert position.
         * @param len  The formats length.
         */
        insert: function(formats, index, len) {
            var prop, l, hint, retIndex = index,
                next;
            var rParagraph = this.getCurrentPara && this.getCurrentPara();
            for (var i = 0; i < formats.length; i++) {
                hint = this.byIndex(index, false, true);
                while (hint && rParagraph && rParagraph != hint.rParagraph)
                    hint = this.hints.next(hint);
                if (hint && index == (hint.start + hint.length)) {
                    next = this.hints.next(hint);
                    while (next && next.modelType == constants.MODELTYPE.BOOKMARK) {
                        hint = next;
                        next = this.hints.next(hint);
                    }
                }

                if (!hint) {
                    hint = this.hints.getLast();
                }
                l = parseInt(formats[i].l) || 0;
                prop = this.getRunFac().createRun(formats[i], this);
                if (prop) {
                    if (!hint) {
                        this.hints.append(prop);
                        hint = prop;
                    } else if (hint.modelType == constants.MODELTYPE.BOOKMARK) {
                        this.hints.insertAfter(prop, hint);
                    } else {
                        var oldHint = hint;
                        hint = hint.insertHint(index, prop);
                        if (hint != oldHint && i == 0)
                        //not inserted into
                            retIndex = hint.start;
                        if (hint === oldHint && prop.clist && prop.clist.length > 0) // merged into existing hints, this run will then be thrown off
                            prop.markDelete && prop.markDelete();
                    }
                    prop.insertSel && prop.insertSel();
                    if (prop.container) {
                        prop.container.forEach(function(r) {
                            r.insertSel && r.insertSel();
                        });
                    }
                    this.fixStart(hint);
                    index += l;
                }
            }
            return retIndex;
        },

	    addTextLength: function( len, index )
	    {
	        var ret = this.getInsertionTarget(index);
            var inTrack = trackChange.isOn() && ModelTools.isTrackable(this);
	        if (!inTrack && ret.target && ret.target == ret.follow)
	        {
	            var targetObj = ret.target;
	            if (targetObj.addTextLength(len, index))
	            {
	                this.fixStart(targetObj);
	                this.markDirty();
	                return true;
	            }
	        }
	        else
	        {
	            var cnt = {};
	            var followObj = ret.follow;
	            if (followObj)
	                cnt.fmt = [followObj.toJson(index, len)];
	            else
	                cnt.fmt = [{"rt":"rPr", "s":index, "l": len}];
	            if (inTrack)
	            {
	                cnt.fmt[0].ch = [trackChange.createChange("ins")];
	            }
	            else
	                delete cnt.fmt[0].ch;
	            this.insert(cnt.fmt, index);
	            return true;
	        }
	        
	        return false;
	    },
        _canfollow: function(run) {
            if (run.modelType == constants.MODELTYPE.RFOOTNOTE 
            		|| run.modelType == constants.MODELTYPE.RENDNOTE 
            		|| run.modelType == constants.MODELTYPE.TRACKDELETEDOBJS
            		|| run.modelType == constants.MODELTYPE.TRACKOVERREF
            		) {
                return false;
            }
            return true;
        },
        getInsertionTarget: function(index) {
            var curObj = (index > 0) ? this.byIndex(index - 1) : this.byIndex(0);
            var followObj = curObj;
            if (!curObj) { // need to create new run
            } else {
                if (curObj.canInsert && !curObj.canInsert())
                //can not insert into page number field
                    index = curObj.start + curObj.length;

                if ((index > curObj.start) && (index < curObj.start + curObj.length)) { // in middle of a text run
                    // directly add into existing text run
                } else {
                    while (curObj && !curObj.length && (curObj.isTextRun && !curObj.isTextRun())) { // skip bookmark 
                        curObj = curObj.next();
                    }
                    if (curObj) {
                        if (index == curObj.start) {
                            // at the beginning of a text run
                        } else { // at the end of a text run
                            var tmpObj = curObj;
                            // if curObj is not visible and there is a visible run after it, move to the visible run
                            while(tmpObj && tmpObj.isVisibleInTrack && !tmpObj.isVisibleInTrack()) {
                                tmpObj = tmpObj.next();
                            }
                            if (tmpObj)
                                curObj = tmpObj;
                            var nextObj = curObj.next();
                            if (nextObj && !nextObj.length && nextObj.isTextRun && nextObj.isTextRun()) { // an empty text run follows
                                curObj = nextObj;
                            }

                            if (curObj.br) { // end of a br
                                curObj = curObj.next();
                            }

                        }
                    }

                    followObj = curObj;
                    // now there are situations which makes the insertion should not follow the target run's style
                    // e.g, insertion at the end of a link
                    // check if the end of the comment
                    var isCommentObj = false;
                    if (curObj && !pe.lotusEditor.relations.commentService.isCommentContinued(curObj, index))
                        isCommentObj = true;
                    var modelTools = ModelTools;
                    if (curObj && (modelTools.isInlineObject(curObj) && (modelTools.isLink(curObj) || !curObj.anchor) || modelTools.isAnchor(curObj) || modelTools.isTextBox(curObj) || isCommentObj || !this._canfollow(curObj) || !this.isVisibleInTrack() || (curObj.rParagraph && curObj.rParagraph != this && !curObj.rParagraph.isVisibleInTrack()))) {
                        var siblingRun = curObj.previous();
                        var firstFollowAbleRun = null;
                        while (siblingRun) {
                            if (siblingRun.isTextRun && siblingRun.isTextRun() && siblingRun.modelType != constants.MODELTYPE.BOOKMARK && this._canfollow(siblingRun)){
                                if (this.isVisibleInTrack() && !(siblingRun.rParagraph && siblingRun.rParagraph !=this && !siblingRun.rParagraph.isVisibleInTrack()))
                                    break;
                                else
                                    firstFollowAbleRun = siblingRun;
                            }
                            siblingRun = siblingRun.previous();
                        }
                        var lastFollowAbleRun = null;
                        if (!siblingRun) {
                            siblingRun = curObj.next();
                            while (siblingRun) {
                                if (siblingRun.isTextRun && siblingRun.isTextRun() && siblingRun.modelType != constants.MODELTYPE.BOOKMARK && this._canfollow(siblingRun)){
                                    if (this.isVisibleInTrack() && !(siblingRun.rParagraph && siblingRun.rParagraph !=this && !siblingRun.rParagraph.isVisibleInTrack()))
                                        break;
                                    else
                                        lastFollowAbleRun = siblingRun;
                                }
                                siblingRun = siblingRun.next();
                            }
                        }
                        followObj = siblingRun || firstFollowAbleRun || lastFollowAbleRun;
                    }
                }
            }

            var ret = {};
            if (curObj && (curObj.br || curObj.modelType == constants.MODELTYPE.TRACKDELETEDOBJS || curObj.modelType == constants.MODELTYPE.TRACKOVERREF)) { // it's still a br, a new run should be created
                curObj = null;
            }
            if (!followObj && curObj && !curObj.hints && this._canfollow(curObj) && (!curObj.isVisibleInTrack || curObj.isVisibleInTrack())) {
                //do not follow inline ojbects
                followObj = curObj;
            }

            ret.target = curObj;
            ret.follow = followObj;
            return ret;
        },

        /**
         * split a text run in idx position.
         * return the right part of split result
         * own is the left part.
         *  @param idx
         *  @returns right text runs of split result
         */
        split: function(idx, len) {

            if (idx <= this.start && len == this.length)
                return;

            if (idx >= (this.start + this.length))
                return;

            // When the length is 0, the by Index will return the left side object, otherwise will return the right object
            // run1.start = 0, run1.length = 1, run2.start = 1, run2.length =1;
            // The this.byIndex(idx, null, true) will return run 1, this.byIndex(idx, null, false) will return run 2
            var bLeftSide = !len;
            var hint = this.byIndex(idx, null, bLeftSide);
            var tools = ModelTools;
            if (!hint)
                return;
            // if it is image or textbox
            if (tools.isImage(hint) || tools.isTextBox(hint)) {
                hint = this.byIndex(idx, null, !bLeftSide);
                if (!hint)
                    return;
            }

            var right = hint.split(idx, len);
            hint.markDirty();

            if (len == null || len <= 0) {
                // For empty paragraph, only need to return the empty run
                if (right == hint && tools.isParagraph(this) && tools.isEmptyParagraph(this))
                    return hint;
                var cloneObj = hint.clone();
                cloneObj.length = 0;
                if (idx == 0) {
                    // In the beginning of hints.
                    cloneObj.start = 0;
                    hint.parent.hints.insertBefore(cloneObj, hint);
                } else {
                    cloneObj.start = hint.start + hint.length;
                    hint.parent.hints.insertAfter(cloneObj, hint);
                }
                cloneObj.markInsert();
                return cloneObj;
            } else {

                var hint2 = this.byIndex(idx + len - 1);

                if (hint2) {
                    right = hint2.split(idx + len);
                    right && hint2.markDirty();
                }

                return right;
            }
        },

        splitRuns: function(start, len) {
            var ret = new Container(this);

            if (len <= 0 || len == null) {
                var right = Hints.prototype.split.apply(this, [start]);
                right && ret.append(right);
                this.buildRuns();
            } else {
                Hints.prototype.split.apply(this, [start, len]);
                this.buildRuns();
                this.container.forEach(function(run) {
                    if (run.start >= start && (run.start + run.length) <= (start + len))
                        ret.append(run);
                    else if (run.start > (start + len))
                        return false;
                });
            }

            return ret;
        },
        /**
         * Return the object by index
         * @param index The index of paragraph
         * @param bLeftSide, return left side first
         * 
         * @Sample
         *   run1.start = 0, run1.length = 1; run2.start = 1, run2.length =1;
         *   The this.byIndex(1, null, true) will return run 1, this.byIndex(1, null, false) will return run 2
         */
        byIndex: function(index, bSearchChild, bLeftSide) {
            var ret = null;

            var hints = this.hints;
            var preEmptyHint = null;
            hints.forEach(function(hint) {
                if (hint.modelType == constants.MODELTYPE.TRACKDELETEDREF)
                    // TrackDeletedRef is virual, skip it when find a hint by index
                    return true;
                if (bSearchChild)
                    ret = hint.byIndex(index, bSearchChild, bLeftSide);
                else if (index >= hint.start) {
                    if (index < (hint.start + hint.length)) {
                        ret = hint;
                    }
                    else if (index == (hint.start + hint.length)) {
                        if (bLeftSide)
                            ret = hint;
                        else if (hint.length == 0)
                            preEmptyHint = hint;
                    }

                }
                if (ret)
                    return false;
                else if (preEmptyHint) {
                    ret = preEmptyHint;
                    return false;
                }
            });
            return ret;
        },
        /**
         * Return the deep level text run
         * @param index
         * 
         * For link, will return the internal run.
         */
        //  getTextRunByIndex: function(index)
        //  {
        //      var ret = this.byIndex(index);
        //      if(ret && ret.getTextRunByIndex)
        //          return ret.getTextRunByIndex(index);
        //      
        //      return ret;
        //  },
        //  /**
        //   * Check the position is an image object. 
        //   * @param index
        //   */
        //  isImage: function(index)
        //  {
        //      var obj = this.byIndex(index);
        //      return obj && obj.modelType == "run.image";
        //  },

        /**
         * Generate JSON format
         * @param index
         * @param length
         */
        hintsToJson: function(index, length, btrimBookmark) {
            var jsonData = [];
            var start = 0;
            var oldIndex = index;
            this.hints.forEach(function(prop) {
                //Bookmark no start...
                if (prop.start == null)
                    prop.start = start;
                start += prop.length || 0;

                if (prop.length == 0 && prop.isTextRun && prop.isTextRun() && prop.next && prop.next())
                    return;
                if (btrimBookmark && start == oldIndex && prop.modelType == constants.MODELTYPE.BOOKMARK)
                //trim bookmark of left side
                    return;
                if (prop.start <= index) {
                    if ((prop.length && ((prop.start + prop.length) <= index)) || (!prop.length && prop.start < index))
                        return;

                    var len = Math.min(prop.length - index + prop.start, length);
                    jsonData.push(prop.toJson(index, len));
                    length -= len;
                    if (length <= 0)
                        return false;
                    index += len;
                } else if (prop.start < (index + length))
                    jsonData.push(prop.toJson(index, length));
                else if (prop.start == null)
                    return false;
            });

            return jsonData;
        },
        /**
         * Need override this function for link, field and toc.
         * @param id
         * @returns
         */
        byId: function(id) {
            var retModel = null;
            this.hints.forEach(function(child) {
                if (child.id == id) {
                    retModel = child;
                    return false;
                } else {
                    var ret = child.byId && child.byId(id);
                    if (ret) {
                        retModel = ret;
                        return false;
                    }
                }
            });

            return retModel;
        },
        /*
         * search deep hint of the child
         */
        getChildHint: function(filterFunc) {
            var retModel = null;
            this.hints.forEach(function(child) {
                if (filterFunc(child)) {
                    retModel = child;
                    return false;
                }
            });

            if (retModel && retModel.getChildHint) {
                var m = retModel.getChildHint(filterFunc);
                if (m) retModel = m;
            }

            return retModel;
        },

        hintsToMd: function() {
            var md = {};
            var mdStr = "";
            var images = [];
           	var escapeChars = function(s){
        		if(typeof s != "string")
        			return s;
        		return s.replace(/&/gm, "&amp;").replace(/</gm, "&lt;").replace(/>/gm, "&gt;").replace(/\*/gm, "&#42;").replace(/#/gm, "&#35;");
        	};
        	var getPreFmt = function() {
        		var preStr = null;
        		if(mdStr.length>2){
        			var testStr = mdStr.slice(-3);
        			preStr = testStr.match(/[*_]{1,3}$/);
        		}
        		return preStr && preStr[0];
        	};

        	var getCurFmt = function(num, prevFmt) {
        		var s = "", c = "*";
        		if(prevFmt && prevFmt.length >1 && (prevFmt.slice(-1)=="*"))
        			c = "_";
        		for(var i=0; i<num; i++) {
        			s += c;
        		}
         		return s;
        	};

            this.hints.forEach(function(prop) {
                if (prop) {
                    if (prop.isVisibleInTrack()) {
                    	if(prop.isTextRun && prop.isTextRun() && prop.length > 0){
                    		var style = prop.mergedComputedStyle;
                    		var prevFmt = getPreFmt();
                    		var fmtNum = 0, fmtStr = "", noStartFmt = false;
                    		if(style && style["font-weight"] && style["font-weight"] == "bold")
                    			fmtNum += 2;
                    		if(style && style["font-style"] && style["font-style"] == "italic")
                    			fmtNum += 1;
                    		if(fmtNum > 0) {
                    			if(prevFmt && (fmtNum == prevFmt.length)){
                    				mdStr = mdStr.substr(0,mdStr.length - fmtNum);
                    				noStartFmt = true;
                    				fmtStr = prevFmt;
                    			} else
                    				fmtStr = getCurFmt(fmtNum, prevFmt);
                    		}
                    		prevFmt = fmtStr;
                    		if(!noStartFmt)
                    			mdStr += fmtStr;
                    		mdStr += escapeChars(prop.getText());
                    		mdStr += fmtStr;
                    	} else if (prop.br) {
                    		mdStr += "\n";
                    	} else if(ModelTools.isImage(prop)){
                    		mdStr += "!";
                			mdStr += "[";
                			if(prop.description)
                				mdStr += prop.description;
                			mdStr += "]";
                    		mdStr += "(";
                    		if(prop.url) {
            					var resolvedURL = new dojoUrl(window.location.href, prop.url);
            					mdStr += resolvedURL.toString();
            				}
                    		mdStr += ")";
                    		images.push(prop.url);
                    	} else if(ModelTools.isLink(prop)) {
                			mdStr += "[";
                			if(prop.getText())
                				mdStr += prop.getText();
                			else if(prop.src)
                				mdStr += prop.src;
                			mdStr += "]";
                    		mdStr += "(";
                    		if(prop.src)
                    			mdStr += prop.src;
                    		mdStr += ")";
                    	}
                    }
                }
            });

            md.text = mdStr;
            md.images = images;
            return md;
        }
    });

    return Hints;
});
