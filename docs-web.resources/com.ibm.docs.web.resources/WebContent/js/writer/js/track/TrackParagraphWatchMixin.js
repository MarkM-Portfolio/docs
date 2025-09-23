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
    "writer/constants",
    "writer/util/ModelTools",
    "writer/model/Paragraph"
], function(lang, array, constants, ModelTools, Paragraph) {
    var WatcherMixin = lang.mixin(lang.getObject("writer.track.TrackParagraphWatchMixin", true), {
        insertRichText: function(para, original, args) {
            if (this._ignoreWatch())
                return original;
            this.isFromAop = true;
            var cnt = args[0],
                index = args[1],
                bNotMark = args[2];
            var groupIndex = this._indexFromChild(para, index);
            var groupCnt = lang.clone(cnt);
            if (typeof(cnt) != "string") {
                var dStart = groupIndex - index;
                if (cnt.s !== undefined) {
                    groupCnt.s = cnt.s + dStart;
                }
                array.forEach(groupCnt.fmt, function(run) {
                    var s = parseInt(run.s);
                    s = s + dStart;
                    run.s = s + "";
                });
            }
            this.setCurrentPara(para);
            Paragraph.prototype.insertRichText.apply(this, [groupCnt, groupIndex, bNotMark]);
            this.initIndexCache();
            delete this.isFromAop;
            return original;
        },
        setListSymbol: function(para, original, args) {
            if (!original || (para != this.getFirstUndeletedPara()))
                return original;
            this.setCurrentPara(para);
            this.listSymbols = para.listSymbols;
            this.createListRuns();
            return original;
        },
        setListLevel: function(para, original, args) {
            if (this._ignoreWatch())
                return original;
            if (para == this.getFirstUndeletedPara())
                Paragraph.prototype.setList.apply(this, args);
            return original;
        },
        setList: function(para, original, args) {
            if (this._ignoreWatch())
                return original;
            if (para == this.getFirstUndeletedPara())
                Paragraph.prototype.setList.apply(this, args);
            return original;
        },
        removeList: function(para, original, args) {
            if (this._ignoreWatch())
                return original;
            if (para == this.getFirstUndeletedPara())
                Paragraph.prototype.removeList.apply(this, args);
            return original;
        },
        setTextAttribute: function(para, cursorFix, args) {
            if (this._ignoreWatch())
                return cursorFix;
            this.isFromAop = true;
            var act = lang.clone(args[0]);
            act.idx = this._indexFromChild(para, act.idx);
            this.setCurrentPara(para);
            var result = Paragraph.prototype.setTextAttribute.apply(this, [act]);
            delete this.isFromAop;
            return result;
        },
        split: function(para, newPara, args) {
            if (this._ignoreWatch())
                return newPara;
            this.isFromAop = true;
            if (para == this.getFirstUndeletedPara() && args[0] === 0) {
                delete this.isFromAop;
                return newPara;
            }
            var result = this.divide(para, args[0] === 0, newPara, args[1]);
            result = result && result.para;
            delete this.isFromAop;
            return result;
        },
        deleteInTrack: function(para, msgDatas, args) {
            if (!msgDatas)
                return;
            this.isFromAop = true;
            var idx = this._indexFromChild(para, 0);
            if (para == this.getLastPara(true) && para.isTrackDeleted(para.ch)) {
                this.rPrCh = this.rPrCh ? this.rPrCh.concat(lang.clone(para.ch)) : lang.clone(para.ch);
                var nextModel = this.next();
                nextModel && nextModel.buildGroup && nextModel.buildGroup();
            }
            delete this.isFromAop;
            // this.markReset();
            return msgDatas;
        },
        deleteTextByOid: function(para, original, args) {
            this.deleteTextByOid(args[0]);
        },
        deleteText: function(para, msgDatas, args) {
            if (this._ignoreWatch())
                return msgDatas;
            this.isFromAop = true;
            var index = args[0],
                len = args[1],
                bNotMark = args[2];
            var deleteIndex = this._indexFromChild(para, index);
            Paragraph.prototype.deleteText.apply(this, [deleteIndex, len, bNotMark]);
            delete this.isFromAop;
            this.initIndexCache();
            // this.markReset();
            return msgDatas;
        },
        setCh: function(para, original, args) {
            this.isFromAop = true;
            var that = this;
            // update runs rParagraph is this para
            var dirtyParaRuns = function() {
                var needMarkDirty = false;
                that.container && that.container.forEach(function(run) {
                    if (run.rParagraph == para){
                        run.markDirty();
                        needMarkDirty = true;
                    }
                });
                if (needMarkDirty)
                    that.markDirty();
            };
            if (!para.isRightClosure()) {
                dirtyParaRuns();
                var divideReslut = this.divide(para);
                var paras = divideReslut.para;
                if (paras && ModelTools.isTrackBlockGroup(paras)){
                    if (divideReslut.blocksBefore && divideReslut.blocksBefore.length > 0)
                        this.parent.insertAfter(paras, divideReslut[divideReslut.length -1 ]);
                    else
                        this.parent.insertAfter(paras, this.getFixedTarget());
                }
            } else if (para == this.getLastPara(true)) {
                var nextModel = this.next();
                if (nextModel && nextModel.buildGroup) {
                    nextModel.buildGroup();
                } else {
                    dirtyParaRuns();
                }
            } else {
                dirtyParaRuns();
            }
            delete this.isFromAop;
            return original;
        },
        merge: function(para, original, args) {
            var deletedPara = args[0];
            var lastPara = this.popBlock(true);
            var refreshParas = [lastPara];
            while (lastPara != para) {
                lastPara = this.popBlock(true);
                refreshParas.unshift(lastPara);
            }
            var me = this;
            array.forEach(refreshParas, function(refreshPara){
                if (deletedPara != refreshPara)
                    me.pushBlock(refreshPara);
                else
                    deletedPara.parent.remove(deletedPara);
            });
            return original;
        },
        setRPrCh: function(para, original, args) {
            this.isFromAop = true;
            var ch = args[0],
                lastPara = this.getLastPara();
            while (lastPara && !ModelTools.isParagraph(lastPara)) {
                lastPara = lastPara.previous();
            }
            if (para == lastPara) {
                this.rPrCh = ch;
                if (!para.isRightClosure())
                    return original;
                var nextModel = this.next();
                if (nextModel && nextModel.buildGroup)
                    nextModel.buildGroup();
                return original;
            }
            if (!para.isRightClosure()) {
                var paras = this.divide(para).para;
                if (paras && ModelTools.isTrackBlockGroup(paras))
                    this.parent.insertAfter(paras, this.getFixedTarget());
                this.markDirty();
            }
            delete this.isFromAop;
            return original;
        },
        setPPrCh: function(para, original, args) {
            if (para == this.getFirstUndeletedPara())
                this.markReset();
            return original;
        },
        deleteBreakInTrack: function(para, msgs, args) {
            if (para != this.getLastPara(true)) {
                console.error("Some thing wrong! Only last paragraph of group can delete break in track");
                return msgs;
            }
            this.isFromAop = true;
            this.rPrCh = para.rPrCh;
            this.markDirty();
            var nextPara = ModelTools.getNext(this, ModelTools.isParagraph);
            if (nextPara && nextPara.buildGroup)
                nextPara.buildGroup();
            this.isFromAop = false;
            return msgs;
        },
        setPageBreakBefore: function(para, msg, args) {
            if (para != this.getFirstPara())
                return msg;
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
        setIndent: function(para, msg, args) {
            if (para != this.getFirstUndeletedPara())
                return msg;
            Paragraph.prototype.setIndent.apply(this, args);
            return msg;
        },
        setIndentRight: function(para, msg, args) {
            if (para != this.getFirstUndeletedPara())
                return msg;
            Paragraph.prototype.setIndentRight.apply(this, args);
            return msg;
        },
        setIndentSpecialTypeValue: function(para, msg, args) {
            if (para != this.getFirstUndeletedPara())
                return msg;
            Paragraph.prototype.setIndentSpecialTypeValue.apply(this, args);
            return msg;
        },
        setBackgroundColor: function(para, msg, args) {
            if (para != this.getFirstUndeletedPara())
                return msg;
            Paragraph.prototype.setBackgroundColor.apply(this, args);
            return msg;
        },
        setBorder: function(para, msg, args) {
            if (para != this.getFirstUndeletedPara())
                return msg;
            Paragraph.prototype.setBorder.apply(this, args);
            return msg;
        },
        setLineSpacing: function(para, msg, args) {
            if (para != this.getFirstUndeletedPara())
                return msg;
            Paragraph.prototype.setLineSpacing.apply(this, args);

            return msg;
        },
        setKeepLines: function(para, msg, args) {
            if (para != this.getFirstUndeletedPara())
                return msg;
            Paragraph.prototype.setKeepLines.apply(this, args);
            return msg;
        },
        setWidowControl: function(para, msg, args) {
            if (para != this.getFirstUndeletedPara())
                return msg;
            Paragraph.prototype.setWidowControl.apply(this, args);

            return msg;
        },
        setDirection: function(para, msg, args) {
            if (para != this.getFirstUndeletedPara())
                return msg;
            Paragraph.prototype.setDirection.apply(this, args);
            return msg;
        },
        setSectionId: function(para, original, args) {
            if (this._ignoreWatch())
                return original;
            var firstUnDeleted = this.getFirstUndeletedPara();
            if (firstUnDeleted == para || firstUnDeleted == para.directProperty.paragraph) {
                Paragraph.prototype.setSectionId.apply(this, args);
                if (!args[1])
                    return true;
            }
            return original;
        },
        setAlignment: function(para, original, args) {
            if (this._ignoreWatch())
                return original;
            var firstUnDeleted = this.getFirstUndeletedPara();
            if (firstUnDeleted == para)
                Paragraph.prototype.setAlignment.apply(this, args);
            return original;
        },
        fillHintIfEmpty: function(para, original, args) {
            if (!original || this._ignoreWatch())
                return original;
            var paraIndexOffset = this._indexFromChild(para,0);
            this.setCurrentPara(para);
            var me = this;
            array.forEach(original, function(fillPos){
                var json = fillPos.json;
                json.s = paraIndexOffset + json.s;
                json.t = "rPr";
                var emptyRun = me.getRunFac().createRun(json, me);
                if (fillPos.offset === undefined) {
                    // insert before para
                    var prevPara = me._blocks.prev(para);
                    var lastHint = prevPara && me.getHintByParaOffset(prevPara,0,true);
                    if (lastHint)
                        me.hints.insertAfter(emptyRun, lastHint);
                    else
                        me.hints.appendFront(emptyRun);
                } else {
                    var tarHint = me.getHintByParaOffset(para, fillPos.offset);
                    if (tarHint && fillPos.isBefore)
                        me.hints.insertBefore(emptyRun, tarHint);
                    else if (tarHint)
                        me.hints.insertAfter(emptyRun, tarHint);
                }
            });
        }
    });

    return WatcherMixin;
});
