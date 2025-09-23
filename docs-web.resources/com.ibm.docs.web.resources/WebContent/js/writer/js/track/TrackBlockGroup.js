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
    "dojo/_base/array",
    "dojo/aspect",
    "dojo/_base/declare",    
    "dojo/has",
    "writer/constants",
    "writer/common/tools",
    "writer/common/Container",
    "writer/model/Paragraph",
    "writer/model/table/Table",
    "writer/model/text/TrackDeletedRef",
    "writer/msg/msgCenter",
    "writer/util/ModelTools",
    "writer/track/TrackParagraphWatchMixin",
    "writer/track/trackChange",
    "writer/track/trackBlockGroupManager"
], function(lang, array, aspect, declare, has, constants, tools, Container, Paragraph, Table, TrackDeletedRef, msgCenter, ModelTools, WatcherMixin, trackChange, groupManager) {

    var TrackBlockGroup = declare("writer.track.TrackBlockGroup", null, {
        constructor: function(firstPara, paras, isSplit){
	        firstPara.update();
	        this.parent = firstPara.parent;
	        this.id = "v_" + firstPara.id;
	        this._blocks = new Container(this);
	        this._blocks.append(firstPara);
	        this.doc = ModelTools.getDocument(this.parent);
	        this.text = firstPara.text;
	        this._setDirectParaProp(firstPara);
	        
	        this.pPrCh = lang.clone(firstPara.pPrCh);
	        this.rPrCh = lang.clone(firstPara.rPrCh);
	        this.hints = new Container(this);
	        var index = 0;
	        this._indexCache = [0];
	        index += firstPara.getLength();
	        this.hints.appendAll(this._adpterTextRuns(firstPara));
	        var me = this;
	        array.forEach(paras, function(para) {
	            me.pushBlock(para);
	        });
	        if (!isSplit)
	            this.parent.insertBefore(this, firstPara);
	        this.parent.remove(firstPara);
	        firstPara.parent = this;
	        firstPara.update(true);
	        // firstPara.buildRuns();
	        this._aopParaFunctions(firstPara);
	
	        this.buildRuns();
	        this.update();
        }
    });

    TrackBlockGroup.prototype = {
        isTrackBlockGroup: true,
        getModelLen: function() {
            return this._blocks.length();
        },
        insertElementAt: function(index, para) {
            var targetPara = this._blocks.getByIndex(index);
            if (!targetPara){
                console.error("[TC]insert error");
                return;
            }
            if (para.isRightClosure && !para.isRightClosure())
                this.divide(targetPara,true,para);
            else if (!para.isTrackDeleted()) {// table
                this.divide(targetPara, true);
                this.parent.insertAfter(para, this.getFixedTarget());
            } else if (ModelTools.isParagraph(para) || ModelTools.isTable(para)){
                var popedBlocks = [];
                var lastPara = this.getLastPara();
                while (lastPara != targetPara){
                    popedBlocks.unshift(lastPara);
                    tmpPara = lastPara.previous();
                    this.popBlock(true);
                    lastPara = tmpPara;
                }
                popedBlocks.unshift(targetPara);
                this.popBlock(true);
                this.pushBlock(para);
                var that = this;
                array.forEach(popedBlocks, function(para){
                    that.pushBlock(para);
                });
            }
        },
        deleteElementAt: function(index) {
            var targetPara = this._blocks.getByIndex(index);
            if (targetPara == this.getLastPara()){
                var nextPara = this.next();
                this.popBlock();
                this.parent.remove(targetPara);
                if (nextPara && nextPara.buildGroup)
                    nextPara.buildGroup();
            } else if (targetPara == this.getFirstPara()) {
                var paras = this.cleanBlocks();
                this.parent.remove(paras.shift(0));
                var firstPara = paras.shift(0);
                while (firstPara && !ModelTools.isParagraph(firstPara)) {
                    firstPara = paras.shift(0);
                }
                if (firstPara)
                    new TrackBlockGroup(firstPara,paras);
            } else {
                var nextGroup = this.divide(targetPara).para;
                this.popBlock(true);
                this.parent.remove(targetPara);
                if (nextGroup)
                    this.merge(nextGroup);
            }
        },
        _ignoreWatch: function(ignore) {
            if (ignore)
                this._bIgnoreWatch = ignore;
            else if (ignore === false)
                delete this._bIgnoreWatch;
            return this._bIgnoreWatch;
        },
        _onlyForGroup: function(onlyForGroup) {
            if (onlyForGroup)
                this._bOnlyForGroup = onlyForGroup;
            else if (onlyForGroup === false)
                delete this._bOnlyForGroup;
            return this._bOnlyForGroup;
        },
        _aopParaFunctions: function(para) {
            this._cleanAopParaFunctions(para);
            para._aop = [];
            var me = this;
            for (var method in WatcherMixin) {
                para._aop.push(
                    aspect.after(para, method, lang.hitch(this, WatcherMixin[method], para))
                );
            }
        },
        _cleanAopParaFunctions: function(para) {
            if (para._aop && lang.isArray(para._aop)) {
                array.forEach(para._aop, function(aop) {
                    aop.remove();
                });
                delete para._aop;
            }
        },
        insertRichText: function(cnt, index, bNotMark) {
            var me = this;
            var _insertNewParaForText = function() {
                console.warn("last paragraph of group should never have a track deleted ch");
                me._ignoreWatch(true);
                var newParaJson = me.getFirstUndeletedPara().emptyClone();
                newParaJson.fmt = [];
                delete newParaJson.ch;
                var newPara = new Paragraph(newParaJson,me.parent, true);
                if (cnt.s)
                    cnt.s = 0;
                var realReturn = newPara.insertRichText(cnt, 0, bNotMark);
                newPara._notNotifyYet = true;
                me.pushBlock(newPara);
                me._ignoreWatch(false);
                return realReturn;
            };
            if (index >= this.text.length){
                var lastPara = this.getLastPara(true);
                if (lastPara.isTrackDeleted(lastPara.ch)){
                	// TODO: should never be called
                    // lastPara has a deleted ch, insert a new paragraph
                    var realReturn = _insertNewParaForText();
                    return {index:index,length:realReturn.length};
                }
            }
            var redirects = this.redirectIndex(index);
            if (redirects.length <= 0) {
                throw new Error("error in insert to ParagraphGroup " + this.id + " of " + index);
            }
            var redirect = redirects[0];
            var para = redirect.obj,
                realIndex = redirect.start;
            // don't insert text in deleted para
            while (para && para.isTrackDeleted(para.ch)){
                para = para.next();
                realIndex = 0;
            }
            if (!para || !ModelTools.isParagraph(para)) {
                _insertNewParaForText();
            }
            this.setCurrentPara(para);
            
            var realCnt = lang.clone(cnt);
            if (cnt.rt && cnt.rt != constants.RUNMODEL.TEXT_Run)
                this.insertObject(cnt, index, bNotMark);
            else
                index = this.insert(cnt.fmt, index, cnt.c.length);
          
            if (typeof(realCnt) != "string") {
                var dStart = realIndex - index;
                if (cnt.s !== undefined) {
                    realCnt.s = cnt.s - index + realIndex;
                }
                array.forEach(realCnt.fmt, function(run) {
                    var s = parseInt(run.s);
                    s = s + dStart;
                    run.s = s + "";
                });
            }
            this._ignoreWatch(true);
            var realReturn = para.insertRichText(realCnt, realIndex, bNotMark);
            this._ignoreWatch(false);
            this.buildRuns();
            if (!bNotMark) {
                if (cnt && cnt.fmt && array.some(cnt.fmt, function(f) {
                        return f.anchor;
                    }))
                    this.markReset();
                else
                    this.markDirty();
            }
            this.initIndexCache();
            return {index: index, length: realReturn.length};
        },
        removeBookmark: function(bookmarkRun, msgs) {
            var redirects = this.redirectIndex(bookmarkRun.start, 0);
            var targetPara = redirects[0].obj,
                targetStart = redirects[0].start;
            var msg = targetPara.removeBookmarks(targetStart);
            if (!msg)
                return false;
            if (msg instanceof Array)
                array.forEach(msg, function(sMsg) {
                    msgs.push(sMsg);
                });
            else
                msgs.push(msg);
            return Paragraph.prototype.removeBookmark.apply(this,[bookmarkRun,[]]);
        },
        setTextAttribute: function(act) {
            var redirects = this.redirectIndex(act.idx, act.len);
            this._ignoreWatch(true);
            array.forEach(redirects, function(redirect) {
                var realAct = dojo.clone(act);
                realAct.idx = redirect.start;
                realAct.len = redirect.len;
                redirect.obj.setTextAttribute(realAct);
            });
            this._ignoreWatch(false);
            return Paragraph.prototype.setTextAttribute.apply(this, [act]);
        },
        deleteText: function(index, len, bNotMark) {
            var redirects = this.redirectIndex(index, len);
            if (redirects < 0) {
                console.error("ParagraphGroup delete error. id " + this.id + " index:" + index + " len:" + len);
                return;
            }
            var msgs = [];
            this._ignoreWatch(true);
            var isOn = trackChange.isOn();
            array.forEach(redirects, function(redirect) {
                if (!redirect.obj.isTrackDeleted() || !isOn){
                    var msg = redirect.obj.deleteText(redirect.start, redirect.len, bNotMark);
                    if (msg && !isOn && msg.length)
                    {
                        console.warn("error on trackgroup::deleteText, should not have a msg returned");
                    }
                    if (msg && msg instanceof Array && msg.length)
                        msgs = msgs.concat(msg);
                    else if (msg)
                        msgs.push(msg);
                }
            });
            this._ignoreWatch(false);
            Paragraph.prototype.deleteText.apply(this, [index, len, bNotMark]);
            this.initIndexCache();
            return msgs;
        },
        deleteInTrack: function() {
            var msgs = [];
            this._blocks.forEach(function(para) {
                if (!para.isTrackDeleted()){
                    var msg = para.deleteInTrack();
                    if (msg === true) {
                        console.error("[TC]should never real delete para in group");
                    }
                    else if (msg){
                        msgs = msgs.concat(msg);
                    }
                }
            });
            this.list && this.list.removePara(this);
            return msgs;
        },
        setList: function(numId, level, needClearIndent) {
            var msgs = [];
            if (!this._onlyForGroup()) {
                this._ignoreWatch(true);
                this._blocks.forEach(function(para) {
                    if (!ModelTools.isParagraph(para))
                        return;
                    var msg = para.setList(numId, level, needClearIndent);
                    if (msg && msg instanceof Array)
                        msgs = msgs.concat(msg);
                    else if (msg)
                        msgs.push(msg);
                });
                this._ignoreWatch(false);
            }
            Paragraph.prototype.setList.apply(this,[numId, level, needClearIndent]);
            return msgs;
        },
        setListLevel: function(lvl) {
            var msgs = [];
            if (!this._onlyForGroup()) {
                this._ignoreWatch(true);
                this._blocks.forEach(function(para) {
                    if (!ModelTools.isParagraph(para))
                        return;
                    var msg = para.setListLevel(lvl);
                    if (msg && msg instanceof Array)
                        msgs = msgs.concat(msg);
                    else if (msg)
                        msgs.push(msg);
                });
                this._ignoreWatch(false);
            }
            Paragraph.prototype.setList.apply(this,[lvl]);
            return msgs;
        },
        removeList: function(isClean) {
            var msgs = [];
            if (!this._onlyForGroup()) {
                this._ignoreWatch(true);
                this._blocks.forEach(function(para) {
                    var msg = para.removeList(isClean);
                    if (msg && msg instanceof Array)
                        msgs = msgs.concat(msg);
                    else if (msg)
                        msgs.push(msg);
                });
                this._ignoreWatch(false);
            }
            Paragraph.prototype.removeList.apply(this, [isClean]);
            return msgs;
        },
        nextChild: function(m) {
            if (m.modelType === constants.MODELTYPE.PARAGRAPH || m.modelType === constants.MODELTYPE.TABLE)
                return this._blocks.next(m);
            return Paragraph.prototype.nextChild.apply(this, [m]);
        },
        previousChild: function(m) {
            if (m.modelType === constants.MODELTYPE.PARAGRAPH || m.modelType === constants.MODELTYPE.TABLE)
                return this._blocks.prev(m);
            return Paragraph.prototype.previousChild.apply(this, [m]);
        },
        initIndexCache: function() {
            this._indexCache = [];
            if (this.isCollapse())
                return;
            var para = this._blocks.getFirst();
            var index = 0;
            this.text = "";
            while (para) {
                this._indexCache.push(index);
                if (ModelTools.isParagraph(para)){
                    this.text = this.text + para.text;
                    index += para.getLength();
                }
                para = para.next();
            }
        },
        isRightClosure: function() {
            return this.getLastPara(true).isRightClosure();
        },
        redirectIndex: function(start, len) {
            var length = len || 0;
            if (!this._indexCache || !this._indexCache.length) {
                this.initIndexCache();
            }
            if (start >= this.text.length) {
                var para = this.getLastPara();
                while (para && !ModelTools.isParagraph(para)) {
                    para = para.previous();
                }
                return [{
                    obj: para,
                    start: start - this.text.length + this.getLastPara().text.length,
                    len: len
                }];
            }
            var para = this.getFirstPara();
            var i = 0,
                index = 0,
                nextIndex;
            var redirects = [];
            while (i < this._indexCache.length && para) {
                if (!ModelTools.isParagraph(para)) {
                    i++;
                    para = para.next();
                    continue;
                }
                index = this._indexCache[i];
                if (start < index) {
                    break;
                }
                nextIndex = this._indexCache[i + 1];
                if (nextIndex === undefined)
                    nextIndex = this.text.length;
                if (start >= nextIndex) {
                    i++;
                    para = para.next();
                    continue;
                }
                redStart = start - index;
                if (length <= nextIndex - start) {
                    redirects.push({
                        obj: para,
                        start: redStart,
                        len: length
                    });
                    break;
                }
                redLen = nextIndex - start;
                length = start + length - nextIndex;
                start = nextIndex;
                redirects.push({
                    obj: para,
                    start: redStart,
                    len: redLen
                });
                i++;
                para = para.next();
            }
            return redirects;
        },
        _indexFromChild: function(para, index) {
            var groupIndex = parseInt(index) || 0;
            var parIdx = this._blocks.indexOf(para);
            if (parIdx > 0)
                groupIndex = groupIndex + this._indexCache[parIdx];
            return groupIndex;
        },
        _adpterTextRuns: function(para) {
            var me = this;
            var runs = new Container(this);
            var beginIndex = me._indexFromChild(para, 0);
            var startFilter = function(textRun, beginIndex) {
                textRun.start = beginIndex + textRun.start;
                if (textRun.hints  && textRun.hints.forEach) {
                    textRun.hints.forEach(function(run){
                        startFilter(run, beginIndex);
                    });
                }
            };
            var setRParagraph = function(textRun) {
                textRun.rParagraph = para;
                if (textRun.hints && textRun.hints.forEach) {
                    textRun.hints.forEach(function(run) {
                        setRParagraph(run);
                    });
                }
            };
            var gcu = this.getCurrentPara;
            this.getCurrentPara = function(){return this;};
            para.hints.forEach(function(textRun) {
                var run = me.getRunFac().createRun(textRun.toJson(), me);
                startFilter(run, beginIndex);
                setRParagraph(run);
                runs.append(run);
            });
            this.getCurrentPara = gcu;
            return runs;
        },
        _autoCollapse: function() {
            if (this._blocks.length() === 1) {
                var para = this.getFirstPara();
                this.popBlock();
            } else if (this._blocks.length() < 1) {
                this._indexInParent = this.parent.indexOf(this, true);
                this.parent.remove(this);
                this.list && this.list.removePara(this,1);
            }
        },
        isCollapse: function() {
            return this._blocks.length() < 1;
        },
        getFixedTarget: function() {
            if (this.isCollapse())
                return this.parent.getByIndex(this._indexInParent, true);
            return this;
        },
        popBlock: function(notAutoCollapse) {
            var para = this.getLastPara();
            para.update(true);
            var index = this._indexCache.length - 1;
            this._blocks.remove(para);
            para.parent = this.parent;
            if (ModelTools.isParagraph(para)) {
                this._popPara(para, index);
            } else if (ModelTools.isTable(para)) {
                this._popTable(para, index);
            } else {
                console.warn("unsupport model for blockGroup, modelType is", para.modelType);
            }
            this.parent.insertAfter(para, this);
            // para.buildRuns();
            !notAutoCollapse && this._autoCollapse();
            this._runChanged = true;
            return para;
        },

        _popPara: function(para, index) {
            if (!this._firstUndeletedPara || this._firstUndeletedPara == para) {
                delete this._firstUndeletedPara;
                if (!this.isCollapse())
                    this._setDirectParaProp(this.getLastPara(true));
            }
            this._cleanAopParaFunctions(para);
            if (index !== -1) {
                var start = this._indexCache[index];
                var newText = this.text.substring(0, start);
                if (index < this._indexCache.length - 1)
                    newText = newText + this.text.substring(this._indexCache[index + 1]);
                this.text = newText;
                this._indexCache.splice(index, 1);
                var lastRun = this.hints.getLast();
                while (lastRun && lastRun.start >= start) {
                    var tmpRun = this.hints.prev(lastRun);
                    if (lastRun.rParagraph == para) {
                        this.hints.remove(lastRun);
                    }
                    lastRun = tmpRun;
                }
            }
        },

        _popTable: function(table, index) {
            if (index !== -1) {
                var start = this._indexCache[index];
                this._indexCache.splice(index, 1);
                var lastRun = this.hints.getLast();
                while (lastRun) {
                    if (ModelTools.isTrackDeletedRef(lastRun) && lastRun.obj == table) {
                        this.hints.remove(lastRun);
                        lastRun = this.hints.getLast();
                    } else {
                        break;
                    }
                }
            }
        },

        cleanBlocks: function() {
            var paras = [];
            var para = this._blocks.getLast();
            while (para) {
                para.update();
                var prePara = para.previous();
                this._blocks.remove(para);
                this._cleanAopParaFunctions(para);
                para.parent = this.parent;
                this.parent.insertAfter(para, this);
                paras.unshift(para);
                para = prePara;
            }
            this._indexInParent = this.parent.indexOf(this, true);
            this.parent.remove(this);
            return paras;
        },
        pushBlock: function(block) {
            this._blocks.append(block);
            index = this.text.length;
            this._indexCache.push(index);
            if (ModelTools.isParagraph(block))
                this._pushPara(block);
            else if (ModelTools.isTable(block))
                this._pushTable(block);
            else
                console.warn("unsupport model for trackblockgroup, the modelType is ", block.modelType);
        },
        _pushPara: function(para) {
            para.update();
            this._setDirectParaProp(para);
            para.parent && para.parent.remove && para.parent.remove(para);
            para.update(true);
            // para.buildRuns();
            para.parent = this;
            this.text = this.text + para.text;
            this.rPrCh = lang.clone(para.rPrCh);
            // this.fmt = this.fmt.concat(this._adpterTextRuns(para,para.toJson().fmt));
            this.hints.appendAll(this._adpterTextRuns(para));
            this._runChanged = true;
            this._aopParaFunctions(para);
            this.markReset();
        },

        _pushTable: function(table) {
            table.update();
            table.parent && table.parent.remove && table.parent.remove(table);
            table.update(false, true);
            table.parent = this;
            var trackDeletedRef = new TrackDeletedRef(table, this);
            trackDeletedRef.start = this.text.length;
            this.hints.append(trackDeletedRef);
            this._runChanged = true;
        },

        _setDirectParaProp: function(para) {
            if (!this._firstUndeletedPara) {
                if (para.list != this.list) {
                    if (this.list)
                        this.list.removePara(this);
                    this.list = para.list;
                    this.listSymbols = para.listSymbols;
                }
                if (!this.directProperty) {
                    this.directProperty = para.directProperty.clone();
                    this.directProperty.paragraph = this;
                } else {
                    this._onlyForGroup(true);
                    this.changeDirectProperty(para);
                    this.directProperty.sectId = para.directProperty.sectId;
                    this._onlyForGroup(false);
                }
                this.paraTextProperty  = para.paraTextProperty; 
                this.task = para.task;
                if (!para.isTrackDeleted())
                    this._firstUndeletedPara = para;
            }
        },

        merge: function(otherGroup) {
            if (ModelTools.isParagraph(otherGroup) && !ModelTools.isTrackBlockGroup(otherGroup)) {
                otherGroup.reset();
                this.pushBlock(otherGroup);
            } else if (ModelTools.isTrackBlockGroup(otherGroup)) {
                otherGroup.reset();
                var paras = otherGroup.cleanBlocks();
                for (var i = 0; i < paras.length; i++) {
                    this.pushBlock(paras[i]);
                }
            } else if (otherGroup.isTrackDeleted && otherGroup.isTrackDeleted()) {
                this.pushBlock(otherGroup);
            }
            this.markReset();
        },
        divide: function(para, isBefore, newPara, msgs) {
            var lastPara = this.getLastPara();
            var tmpPara;
            var newParas = [];
            while (lastPara != para) {
                tmpPara = lastPara.previous();
                newParas.unshift(lastPara);
                this.popBlock(true);
                lastPara = tmpPara;
            }
            var newFirstPara, blocksBefore;
            if (isBefore) {
                this.popBlock(true);
                if (newPara && !this.isCollapse()) {
                    this.parent.insertAfter(newPara,this);
                    msgs && msgs.push(msgCenter.createMsg(constants.MSGTYPE.Element, [msgCenter.createInsertElementAct(newPara)]));
                    this.pushBlock(newPara);
                }
                newFirstPara = para;
            } else if (newPara) {
                newFirstPara = newPara;
                if (this._blocks.length() == 1) {
                    this.popBlock(true);
                    this.pushBlock(para);
                }
                newPara.parent = this.parent;
            } else {
                if (this._blocks.length() == 1) {
                    this.popBlock(true);
                }
                newFirstPara = newParas.shift(0);
                blocksBefore = [];
                while(newFirstPara && !ModelTools.isParagraph(newFirstPara)) {
                    // if (!this.isCollapse() && newFirstPara.isTrackDeleted && newFirstPara.isTrackDeleted()) {
                    //     this.pushBlock(newFirstPara);
                    // } else {
                    newFirstPara.parent = this.parent;
                    blocksBefore.push(newFirstPara);
                    // }
                    newFirstPara = newParas.shift(0);
                }
                if (newFirstPara)
                    newFirstPara.parent = this.parent;
            }
            var newGroup;
            if (newParas.length > 0 && newFirstPara)
                newGroup = new TrackBlockGroup(newFirstPara, newParas, true);
            this._autoCollapse();
            return isBefore ? null : {"blocksBefore":blocksBefore, "para": newGroup || newFirstPara };
        },
        getFirstPara: function(onlyParagraph) {
            var first = this._blocks.getFirst();
            if (!onlyParagraph)
                return first;
            while (first && !ModelTools.isParagraph(first)) {
                first = this._blocks.next(first);
            }
            return first;
        },
        /**
         * Get first undeleted paragraph in group, it will be use to get property of real model
         * @param  orLast - false will return undefined when all paras are deleted
         *                  other value(include undefined) will return last para in that case
         */
        getFirstUndeletedPara: function(orLast) {
            if (!this._firstUndeletedPara) {
                this._firstUndeletedPara = this._blocks.select(function(block){
                    return !block.isTrackDeleted();
                });
            }
            if(this._firstUndeletedPara)
                return this._firstUndeletedPara;
            if (orLast !== false)
                return this.getLastPara(true);
        },
        getLastPara: function(onlyParagraph) {
            var last = this._blocks.getLast();
            if (!onlyParagraph)
                return last;
            while (last && !ModelTools.isParagraph(last)) {
                last = this._blocks.prev(last);
            }
            return last;
        },
        ifOnlyContianPageBreak: function() {
            return false;
        },
        getBackgroundColor: function() {
            if (this._blocks.length() > 0)
                return this.getFirstUndeletedPara().getBackgroundColor();
        },
        getBorder: function() {
            if (this._blocks.length > 0)
                return this.getFirstUndeletedPara().getBorder();
        },
        getRuns: function() {
            if (!this.container || this._runChanged) {
                // this.createHints(this.fmt,this.paraTextProperty.toJson());
                this.buildRuns();
                delete this._runChanged;
            }
            return this.container;
        },
        update: function(noChangeContainer) {
            if (!this.getAllViews() && this.CHANGESTATE && this.CHANGESTATE.insert && this.isFromAop)
                    return;
            Paragraph.prototype.update.apply(this, [noChangeContainer]);
        },
        split: function(idx, msgs) {
            if (idx === 0) {
                return this.getFirstUndeletedPara().split(idx, msgs);
            }
            if (this.getVisibleIndex(idx) == this.getVisibleText().length)
                idx = this.text.length;
            var redirects = this.redirectIndex(idx);
            if (redirects.length !== 1)
                throw new Error("Could not get the paragraph to be split!!!");
            var para = redirects[0].obj;
            var redIdx = redirects[0].start;
            var originDirectProp = para.directProperty;
            para.directProperty = this.getFirstUndeletedPara().directProperty;
            var newPara = para.split(redIdx, msgs);
            para.directProperty = originDirectProp;
            return newPara;
        },
        setAlignment: function(align, noMark, para) {
            var msgs = [];
            this._ignoreWatch(true);
            if (!this._onlyForGroup()) {
                this._blocks.forEach(function(_para) {
                    if (para != _para && ModelTools.isParagraph(_para)) {
                        var msg = _para.setAlignment(align, noMark);
                        if (msg && msg instanceof Array)
                            msgs = msgs.concat(msg);
                        else if (msg)
                            msgs.push(msg);
                    }
                });
            }
            else {
                var msg = this.getFirstUndeletedPara().setAlignment(align,noMark);
                if (msg && msg instanceof Array)
                    msgs = msgs.concat(msg);
                else if (msg)
                    msgs.push(msg);
            }
            this._ignoreWatch(false);
            Paragraph.prototype.setAlignment.apply(this, [align, noMark]);
            return msgs;
        },
        setIndent: function(indentVal, isFromMsg) {
            return this.getFirstUndeletedPara().setIndent(indentVal, isFromMsg);
        },
        setIndentRight: function(indentVal) {
            return this.getFirstUndeletedPara().setIndentRight(indentVal);
        },
        setIndentSpecialTypeValue: function(type, value) {
            return this.getFirstUndeletedPara().setIndentSpecialTypeValue(type, value);
        },
        setLineSpacing: function(lineSpacing, lineRule) {
            return this.getFirstUndeletedPara().setLineSpacing(lineSpacing, lineRule);
        },
        setBorder: function(border) {
            return this.getFirstUndeletedPara().setBorder(border);
        },
        setBackgroundColor: function(color) {
            return this.getFirstUndeletedPara().setBackgroundColor(color);
        },
        setKeepLines: function(value) {
            return this.getFirstUndeletedPara().setKeepLines(value);
        },
        setWidowControl: function(value) {
            return this.getFirstUndeletedPara().setWidowControl(value);
        },
        setDirection: function(direction) {
            return this.getFirstUndeletedPara().setDirection(direction);
        },
        notifyInsertToModel: function() {
            try {
                this.directProperty.insertToModel();
            } catch (e) {
                console.info(e);
            }
            delete this.deleted;
            var mTools = ModelTools;
            this.getRuns().forEach(function(run) {
                if (run)
                    delete run.deleted;
                if (mTools.isTextBox(run) || mTools.isCanvas(run))
                    run.notifyInsertToModel();
                if (ModelTools.isNotesRefer(run)) {
                    run.insertSel();
                }
            });
        },
        findParaIndexToInsert: function(index) {
            var redirects = this.redirectIndex(index);
            if (redirects.length > 0) {
                var redirect = redirects[0];
                var para = redirect.obj;
                var reIndex = redirect.start;
                while (para && para.isTrackDeleted(para.ch)) {
                    para = para.next();
                    reIndex = 0;
                }
                if (!para) {
                    console.error("[TC]There are some wrong in insertRichText");
                    var lastPara = this.getLastPara(true);
                    para = lastPara;
                    reIndex = lastPara.getText().length;
                }
                return {
                    para: para,
                    index: reIndex
                };
            } else {
                console.error("Couldn't find index" + index + "in ParagraphGroup(" + this.id + ")");
            }
        },
        byId: function(id) {
            var retModel = Paragraph.prototype.byId.apply(this,[id]);
            if (retModel)
                return retModel;
            this._blocks.forEach(function(child) {
                if (child.id == id) {
                    retModel = child;
                    return false;
                } else {
                    var ret = child.byId(id);
                    if (ret) {
                        retModel = ret;
                        return false;
                    }
                }
            });

            return retModel;
        },
        getByAdapteIndex: function(index) {
            return this._blocks.getByAdapteIndex(index);
        },
        deleteBreakInTrack: function() {
            return this.getLastPara(true).deleteBreakInTrack();
        },
        buildGroup: function() {
            if (trackChange.show_del || groupManager.isBuildGroupPaused())
                return;
            var prevPara = this.previous();
            var deleteParas = [];
            while(prevPara && !ModelTools.isParagraph(prevPara)) {
                deleteParas.unshift(prevPara);
                prevPara = prevPara.previous();
            };
            if (prevPara && prevPara.parent == this.parent && prevPara.isRightClosure()) {
                if (ModelTools.isTrackBlockGroup(prevPara)) {
                    array.forEach(deleteParas, function(model){
                        prevPara.pushBlock(model);
                    });
                    prevPara.merge(this);
                    return prevPara;
                    // prevPara.update();
                } else {
                    var par = new TrackBlockGroup(prevPara, deleteParas);
                    par.merge(this);
                    return par;
                    // par.update();
                }
            }
        },
        changeDirectProperty: function(para) {
            if (!this._onlyForGroup()){
                var msgs = [];
                var nextPara = this.getFirstPara(true);
                while (nextPara) {
                    if (ModelTools.isParagraph(nextPara)) {
                        var msg = nextPara.changeDirectProperty(para);
                        if (msg) {
                            msgs = msgs.concat(msg);
                        }
                    }
                    nextPara = nextPara.next();
                }
                return msgs;
            }
            return Paragraph.prototype.changeDirectProperty.apply(this,[para]);
        },
        setCurrentPara: function(para) {
            this._currentPara = para;
        },
        getCurrentPara: function() {
            return this._currentPara || this.getLastPara(true);
        },
        createBreakInTrack: function() {
            var lastPara = this.getLastPara(true);
            var msgs = lastPara.createBreakInTrack();
            this.rPrCh = lang.clone(lastPara.rPrCh);
            return msgs;
        },
        setSectionId: function(sectId, bMessage) {
            this._ignoreWatch(true);
            Paragraph.prototype.setSectionId.apply(this,[sectId,bMessage]);
            var msgs = this.getFirstUndeletedPara().setSectionId(sectId, bMessage);
            this._ignoreWatch(false);
            return msgs;
        },
        getRPrCh: function() {
            var lastPara = this.getLastPara(true);
            if (lastPara)
                return lastPara.getRPrCh();
            else
            // in a middle phase
                return [];
        },
        getHintByParaOffset: function(block, idx, reverse) {
            var isTable = ModelTools.isTable(block);
            var isPara = ModelTools.isParagraph(block);
            var paraOffset;
            if (isPara)
                paraOffset = this._indexFromChild(block, 0);
            var findIndex = 0;
            var findFilter = function(hint) {
                if (isTable) {
                    if (hint.obj && hint.obj == block)
                        return true;
                    return false;
                }
                if (isPara) {
                    if (!hint.rParagraph || hint.rParagraph != block)
                        return false;
                    if (findIndex == idx)
                        return true;
                    findIndex++;
                }
            };
            if (reverse)
                return this.hints.selectReverse(findFilter);
            else
                return this.hints.select(findFilter);
        }
    };
    // inject
    
    if (has("trackGroup"))
    {
        (function() {
            Paragraph.prototype.buildGroup = function() {
                if (trackChange.show_del || groupManager.isBuildGroupPaused() || this.isInTCGroup())
                    return;
                var prevPara = this.previous();
                var deleteParas = [];
                while(prevPara && !ModelTools.isParagraph(prevPara)) {
                    deleteParas.unshift(prevPara);
                    prevPara = prevPara.previous();
                };
                if (prevPara && prevPara.parent == this.parent && prevPara.isRightClosure()) {
                    if (ModelTools.isTrackBlockGroup(prevPara)) {
                        array.forEach(deleteParas, function(model) {
                            prevPara.pushBlock(model);
                        });
                        prevPara.pushBlock(this);
                        return prevPara;
                        // prevPara.markDirty();
                        // prevPara.update();
                    } else {
                        return new TrackBlockGroup(prevPara, deleteParas.concat(this));
                    }
                }
            };
            Paragraph.prototype.setRPrCh = function(value) {
                this.rPrCh = value;
                this.markReset();
                if (!this.isInTCGroup() && this.isRightClosure()) {
                    var nextModel = this.next();
                    if (nextModel && nextModel.buildGroup)
                        nextModel.buildGroup();
                }
            };
            Paragraph.prototype.getCursorTarget = function(index) {
                if (!ModelTools.isTrackBlockGroup(this.parent))
                    return {"obj": this, "index": index};
                else
                    return {
                        "obj": this.parent,
                        "index": this.parent._indexFromChild(this, index)
                    };
            };
            Paragraph.prototype.getUpdateRoot = function(){
                if(ModelTools.isTrackBlockGroup(this.parent))
                    return this.parent.getUpdateRoot();
                return this.parent;
            };
            Paragraph.prototype.getMsgParent = function(){
                if (ModelTools.isTrackBlockGroup(this.parent))
                    return this.parent.getMsgParent();
                return this.parent;
            };
            Paragraph.prototype.getMsgIdx = function(){
                if (ModelTools.isTrackBlockGroup(this.parent))
                    return this.parent.getMsgIdx() + this.parent._blocks.adapteIndexOf(this);
                return this.parent.container.adapteIndexOf(this);
            };
            Paragraph.prototype.isInTCGroup = function(){
                return ModelTools.isTrackBlockGroup(this.parent);
            };

            Table.prototype.buildGroup = function() {
                if (trackChange.show_del || groupManager.isBuildGroupPaused() || this.isInTCGroup())
                    return;
                if (this.isTrackDeleted()) {
                    var next = this.next();
                    return next && next.buildGroup && next.buildGroup();
                }
            };
            Table.prototype.isInTCGroup = function() {
                return ModelTools.isTrackBlockGroup(this.parent);
            };

        })();
    }
    tools.extend(TrackBlockGroup.prototype, Paragraph.prototype);
    return TrackBlockGroup;
});
