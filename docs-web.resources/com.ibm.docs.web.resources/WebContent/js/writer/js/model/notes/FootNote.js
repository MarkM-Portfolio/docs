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
    "dojo/i18n!writer/nls/lang",
    "writer/common/Container",
    "writer/common/tools",
    "writer/constants",
    "writer/model/Model",
    "writer/model/update/BlockContainer",
    "writer/model/update/Block_Container",
    "writer/util/ModelTools"
], function(i18nlang, Container, tools, constants, Model, BlockContainer, Block_Container, ModelTools) {

    var FootNote = function(json, parent) {
        if (!json) {
            //		console.error("the json source can not be null!");
            return;
        }
        this.container = new Container(this);
        this.fromJson(json);
    };
    FootNote.prototype = {
        modelType: constants.MODELTYPE.FOOTNOTE,
        fromJson: function(content) {
            if (content) {
                this.seqId = -1;
                this.id = content.id;
                this.t = content.t;
                this.type = content.type;
                if(content.ps && content.ps.length > 0) {
                    for (var i = 0; i < content.ps.length; i++) {
                        var c = content.ps[i];
                        var m = this.createSubModel(c);
                        if (m) {
                            if (m.isContainer)
                                this.container.appendAll(m);
                            else
                                this.container.append(m);
                        }
                    }
                    var referSymbol = this.getIndicatorSymbol();
                    referSymbol && (referSymbol.setSeqId(this.seqId));
                }
            }
        },
        toJson: function() {
            var json = {};
            json.id = this.id;
            json.t = this.t;
            if (this.type) {
                json.type = this.type;
            }
            json.ps = [];
            this.container.forEach(function(m) {
                if (m.modelType == constants.MODELTYPE.PARAGRAPH)
                    json.ps.push(m.toJson(0, null, true));
                else
                    json.ps.push(m.toJson());
            });
            return json;
        },
        getIndicatorSymbol: function() {
            var firstRun = ModelTools.getFirstChild(this, ModelTools.isNotesRefer, true);
            if (firstRun) {
                if (firstRun.modelType == constants.MODELTYPE.RFOOTNOTE || firstRun.modelType == constants.MODELTYPE.RENDNOTE) {
                    return firstRun;
                }
            }
        },
        getId: function() {
            return this.id;
        },
        setId: function(id) {
            this.id = id;
        },
        getSeqId: function() {
            return this.seqId;
        },
        setSeqId: function(id) {
            this.seqId = id;
            var referSymbol = this.getIndicatorSymbol();
            referSymbol && (referSymbol.setSeqId(this.seqId));
        },
        getMergedView: function(view) {
            if (this.needToUpdate()) {
                this.update(true);
                delete this._toupdate;
            }
            var allViews = this.getAllViews();
            if (allViews) {
                allViews = allViews["rootView"];
                var firstView = view? view :allViews.getFirst();
                var next = firstView && allViews.next(firstView);
                while (next) {
                    firstView.merge(next);
                    var next = allViews.next(firstView);
                }
                firstView && firstView.hasLayouted() && firstView.alignItem();
                return firstView;
            } else {
                return this.preLayout("rootView");
            }
        },
        getFirstView: function() {
            var allViews = this.getAllViews();
            if (allViews) {
                var views = allViews["rootView"];
                var v = views.getFirst();
                return v;
            }
            var v = this.preLayout("rootView");
            delete this._toupdate;
            return v;
        },
        resetView: function() {
            delete this._viewers;
        },
        getReferer: function() {
            return this._referer;
        },
        setReferer: function(_referer) {
            var ref = _referer.model || _referer;
            if (this._referer == ref)
                return;

            this._referer = ref;
            this._referer.setReferFn(this);

            this.notifyInsertToModel();
        },
        releaseRefer: function() {
            this.notifyRemoveFromModel();

            this._referer.releaseReferFn();
            delete this._referer;
        },
        delayUpdate: true,
        getUpdateTrigger: function() {
            return layoutEngine.rootModel;
        },
        updateSeqId: function(id) {
            //		if(id==this.seqId){
            //			return;
            //		}
            this.seqId = id;
            this._referer && this._referer.updateSeqId(id);
            var referSymbol = this.getIndicatorSymbol();
            referSymbol && (referSymbol.updateSeqId(this.seqId));
        },
        next: function() {
            return pe.lotusEditor.relations.notesManager.nextNote(this, this.modelType == constants.MODELTYPE.FOOTNOTE);
        },
        previous: function() {
            return pe.lotusEditor.relations.notesManager.previousNote(this, this.modelType == constants.MODELTYPE.FOOTNOTE);
        },
        toBeUpdate: function() {
            this._toupdate = true;
        },
        needToUpdate: function() {
            return this._toupdate;
        }
    };
    tools.extend(FootNote.prototype, new BlockContainer());
    tools.extend(FootNote.prototype, new Block_Container());
    tools.extend(FootNote.prototype, new Model());
    return FootNote;
});
