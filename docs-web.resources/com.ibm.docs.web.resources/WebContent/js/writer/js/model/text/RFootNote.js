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
    "writer/constants",
    "writer/model/Model",
    "writer/model/notes/EndNote",
    "writer/model/notes/FootNote",
    "writer/model/prop/TextProperty",
    "writer/model/text/Hint"
], function(declare, lang, constants, Model, EndNote, FootNote, TextProperty, Hint) {

    /**
     * 
     */
    var RFootNote = declare("writer.model.text.RFootNote", [Hint, Model], {
        modelType: constants.MODELTYPE.RFOOTNOTE,
        constructor: function(json, owner) {
            this.paragraph = owner && (owner.paragraph || owner);
            this.parent = owner;
            this.fromJson(json);

        },
        fromJson: function(json) {
            if (!json) return;
            this.seqId = -1;
            this.id = json.id;
            this.start = json.s && parseInt(json.s);
            this.length = json.l && parseInt(json.l);
            this.textProperty = new TextProperty(lang.clone(json && json.style));
            if (json.an) {
                this.an = json.an;
            }
        },
        _toJsonType: function() {
            return "fn";
        },
        toJson: function() {
            var retVal = {};
            retVal.rt = this._toJsonType();
            retVal.s = "" + this.start;
            retVal.l = "" + this.length;
            retVal.t = "r";
            retVal.id = this.id;
            retVal.style = this.textProperty.toJson();
            if (this._referFn) {
                retVal.an = this._referFn.toJson();
                //			retVal.id = this.id;
            }
            return retVal;
        },
        createRun: function() {
            if (!this.paragraph)
                return null;

            return this;
        },
        setSeqId: function(id) {
            this.seqId = id;
        },
        getText: function(start, len) {
            return this.seqId;
        },
        //	getSeqId:function(){
        //		if(this.seqId==undefined||this.seqId<0){
        //			var notes = writer.util.ModelTools.getNotes(this);
        //			if(notes){
        //				this.seqId = notes.getSeqId();				
        //			}
        //		}
        //		return this.seqId;
        //	},
        getId: function() {
            return this.id;
        },
        getStyleId: function() {
            return this.textProperty.styleId;
        },
        isTextRun: function() {
            return false;
        },
        markDelete: function() {
            this.deleted = true;
        },
        markDirty: function() {
            this.clearCache();
            this.dirty = true;
        },
        setReferFn: function(fn) {
            this._referFn = fn;
        },
        releaseReferFn: function() {
            delete this._referFn;
        },
        setStyle: function(styleDef, bRemove) {
            this.textProperty.setStyle(styleDef, bRemove);
            this.markDirty();
        },
        getStyle: function() {
            return this.textProperty.getStyle();
        },
        getReferFn: function() {
            return this._referFn;
        },
        markInsert: function() {
            delete this.deleted;
            this.inserted = true;
            if (this._referFn) {
                this.an = this._referFn.toJson();
            }
            this.insertSel();
        },
        updateSeqId: function(id) {
            if (parseInt(id) == parseInt(this.seqId)) {
                return;
            }
            this.seqId = id;
            this.markDirty();
            var para = this.parent;
            if (!para) {
                rturn;
            }
            para.markDirty();
            para.parent && para.parent.update();
        },
        deleteSel: function() {
            this._referFn && pe.lotusEditor.relations.notesManager.deleteFootnoteByRefer(this, true);
        },
        insertSel: function() {
            this.checkReferedNotes();
        },
        split: function(index) {
            if (index == this.start) {
                return this;
            }
            return null;
        },
        checkReferedNotes: function() {
            if (!this.an) {
                return;
            }
            if (this.modelType == constants.MODELTYPE.RFOOTNOTE) {
                var n = new FootNote(this.an);
            } else {
                var n = new EndNote(this.an);
            }
            delete this.an;
            var ret = pe.lotusEditor.relations.notesManager.restoreNotes(this, n, this.modelType == constants.MODELTYPE.RFOOTNOTE);
            if (!ret) {
                delete this._referFn;
            }
        }
    });
    return RFootNote;
});
