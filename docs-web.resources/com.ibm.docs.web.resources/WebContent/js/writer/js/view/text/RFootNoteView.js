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
    "dojo/dom-construct",
    "dojo/dom-style",
    "dojo/dom-attr",
    "dojo/topic",
    "writer/constants",
    "writer/model/Model",
    "writer/model/text/RFootNote",
    "writer/util/ModelTools",
    "writer/util/ViewTools",
    "writer/view/Run"
], function(has, declare, lang, domConstruct, domStyle, domAttr, topic, constants, Model, RFootNote, ModelTools, ViewTools, Run) {

    /**
     * Foot Note mark in content. it may be a super or sub number.
     * */
    var RFootNoteView = declare("writer.view.text.RFootNoteView", Run, {
        constructor: function(model) {
            if (!model) return;
            this.model = model;
            this.init();
            //		this.start = this.model.start||0;
            //		this.len = this.model.length||this.model.len||0;
            //		this.seq = model.seq;
            topic.subscribe(constants.EVENT.INSERTSECTION, lang.hitch(this, this._handleInsertSect));
            topic.subscribe(constants.EVENT.DELETESECTION, lang.hitch(this, this._handleDeleteSect));
        },
        getViewType: function() {
            return "text.RFootNote";
        },
        getSeqId: function() {
            return this.model.seqId;
        },
        setSeqId: function(id) {
            this.model.setSeqId(id);
        },
        getId: function() {
            return this.model.id;
        },
        getStyle: function() {
            return this.model.getStyle();
        },
        setReferFn: function(fn) {
            this.model.setReferFn(fn);
        },
        getReferFn: function() {
            return this.model.getReferFn();
        },
        canSplit: function(w, h, forceFit) {
            return false;
        },
        getElementPath: function(x, y, h, path, options) {
            var index;
            var fixedX;
            if (x > this.w / 2) {
                index = 1;
                fixedX = this.w;
            } else {
                index = 0;
                fixedX = 0;
            }
            var run = {
                "delX": fixedX - x,
                "delY": (h - this.h) - y,
                "index": index,
                "offsetX": fixedX,
                "lineH": h,
                "h": this.h
            };
            path.push(run);
        },
        getChildPosition: function(idx) {
            var x = this.getLeft();
            var y = this.getTop();
            var isItalic = this.getComputedStyle()["font-style"] == "italic";
            if (idx == 0) {
                return {
                    'x': x,
                    'y': y,
                    "italic": isItalic
                };
            } else {
                return {
                    'x': x + this.w,
                    'y': y,
                    "italic": isItalic
                };
            }
        },
        getText: function(parent) {
            return this._getText(this.getSeqId(), parent);
        },
        _getCurrentNotePr: function(parent) {
            if (!this.parent) {
                var page = ViewTools.getPage(parent);
            } else {
                var page = ViewTools.getPage(this);
            }
            var sect = page && page.getSection();
            return sect && sect.getFootnotePr();
        },
        _getCurrentSectIdx: function() {
            var page = ViewTools.getPage(this);
            var sect = page && page.getSection();
            return sect && pe.lotusEditor.setting.getSectionIndex(sect.id) || -1;
        },
        _getGNotePr: function() {
            return pe.lotusEditor.setting.getFootnotePr();
        },
        _getText: function(seqId, parent) {
            seqId = parseInt(seqId);
            var gNotePr = this._getGNotePr();
            var currentNotePr = this._getCurrentNotePr(parent);
            var format = currentNotePr && currentNotePr.getFormat() || gNotePr && gNotePr.getFormat();
            var start = 1;
            if (currentNotePr) {
                start = currentNotePr.getStart();
            } else if (gNotePr) {
                start = gNotePr.getStart();
            }
            if (currentNotePr && currentNotePr.isRestart()) {
                var referFn = this.getReferFn();
                if (!referFn) {
                    referFn = ModelTools.getNotes(this.model);
                }
                if (referFn) {
                    seqId = pe.lotusEditor.relations.notesManager.indexOfCurrentSect(referFn, this.getViewType() == "text.RFootNote");
                }
            }
            var index = seqId + start - 1;
            if (format && index > 0) {
                return format.getValue(index).toString();
            } else {
                return index.toString();
            }
        },
        _wrapSpanForSuperSub: function() {
            var style = this.getComputedStyle();
            var wrapSpan = domConstruct.create("span", {
                "class": "run "
            });
            domAttr.remove(wrapSpan, 'style');
            domStyle.set(wrapSpan, "fontSize", style['font-size']);
            wrapSpan.appendChild(this.domNode);
            return wrapSpan;
        },
        render: function() {
            var strMargin = this._calLeftMarginCssStyle();
            this.domNode = domConstruct.create("span", {
                "class": "run footnoteRefer " + this.getCSSStyle(),
                "style": (this.getStyleStr() + strMargin)
            });
            this.updateSeqId(this.getSeqId());
            return this._wrapSpanForSuperSub();
        },
        updateSeqId: function(id) {
            var text = this._getText(id);
            if (has("ie") && has("ie") < 9) {
                this.domNode.innerText = text;
            } else {
                this.domNode.textContent = text;
            }
        },
        _handleInsertSect: function(index) {
            var currIdx = this._getCurrentSectIdx();
            if (currIdx == -1) {
                return;
            }
            if (currIdx == index) {
                this.markRelayout();
                var para = ViewTools.getParagraph(this);
                if (para && !para.isDeleted()) {
                    para.model.markReset();
                }
                if (!this.getReferFn()) {
                    var referFn = ModelTools.getNotes(this.model);
                    referFn && referFn.toBeUpdate();
                }
            }
        },
        _handleDeleteSect: function(index) {
            var currIdx = this._getCurrentSectIdx();
            if (currIdx == -1) {
                return;
            }
            if (index == currIdx || index + 1 == currIdx) {
                this.markRelayout();
                var para = ViewTools.getParagraph(this);
                if (para && !para.isDeleted()) {
                    para.model.markReset();
                }
                if (!this.getReferFn()) {
                    var referFn = ModelTools.getNotes(this.model);
                    referFn && referFn.toBeUpdate();
                }
            }
        }

    });

    Model.prototype.viewConstructors[constants.MODELTYPE.RFOOTNOTE] = RFootNoteView;
    return RFootNoteView;
});
