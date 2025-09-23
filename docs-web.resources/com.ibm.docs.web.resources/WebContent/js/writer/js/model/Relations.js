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
    "writer/constants",
    "writer/model/HeaderFooter",
    "writer/model/Theme",
    "writer/model/notes/EndNote",
    "writer/model/notes/FootNote",
    "writer/model/notes/NotesManager",
    "writer/msg/msgCenter",
    "writer/util/ModelTools"
], function(lang, constants, HeaderFooter, Theme, EndNote, FootNote, NotesManager, msgCenter, ModelTools) {

    var Relations = function(relationsJSON) {
        this.jsonData = relationsJSON;
        this._relations = {};
        var cmtServiceClass = writer.model.comments.CommentService || writer.model.comments.RTECommentService;
        this.commentService = cmtServiceClass.getInstance();
        // Load theme first.
        // Then load content after style loaded.
        for (var n in relationsJSON) {
            var docJSON = relationsJSON[n];
            //		if (docJSON.t == "hdr" || docJSON.t == "ftr"){
            //			this._relations[n] = new writer.model.HeaderFooter(docJSON.content,n,docJSON.t);
            //		}
            //		else 
            if (n == "theme") {
                this._relations[n] = new Theme(docJSON);
            }
            //		else if (n == "footnotes"){
            //			//TODO: endnote, footnote, comment
            //			this._relations[n] = new writer.model.FootNote(docJSON);
            //		}
            //		else if(n=="endnotes"){
            //			this._relations[n] = new writer.model.EndNote(docJSON);
            //		}
        }

    };
    Relations.prototype = {
        _relations: {},
        jsonData: null,
        loadContent: function() {
            var relationsJSON = this.jsonData;
            delete this.jsonData;
            this.notesManager = this.notesManager || new NotesManager();
            for (var n in relationsJSON) {
                var docJSON = relationsJSON[n];
                if (docJSON.t == "hdr" || docJSON.t == "ftr") {
                    this._relations[n] = new HeaderFooter(docJSON.content, n, docJSON.t);
                }
                //			else if(n == "theme"){
                //				this._relations[n] = new writer.model.Theme(docJSON);
                //			}
                else if (n == "footnotes") {
                    //TODO: endnote, footnote, comment
                    this.notesManager = this.notesManager || new NotesManager();
                    this.notesManager.createFootNotes(docJSON);
                } else if (n == "endnotes") {
                    this.notesManager = this.notesManager || new NotesManager();
                    this.notesManager.createEndNotes(docJSON);
                } else if (n == "comments") {
                    this.commentService = this.commentService || CommentService().getInstance();
                    this.commentService.createComments(docJSON);
                }
            }
        },
        /*
         * walk through header/footer model
         * @param
         */
        forEachHeaderFooter: function(callback, param) {
            for (var i in this._relations) {
                var rel = this._relations[i];
                if (rel.modelType == constants.MODELTYPE.HEADERFOOTER) {
                    callback(rel, param);
                }
            }
        },
        getHeaderFooterById: function(id) {
            if (this._relations && this._relations[id]) {
                return this._relations[id];
            }
            return null;
        },

        insertRelation: function(id, rel) {
            if (rel.t == "hdr" || rel.t == "ftr") {
                this._relations[id] = new HeaderFooter(rel.content, id, rel.t);
                return;
            }

            this._relations[id] = rel;
        },

        deleteRelation: function(id) {
            var rel = this._relations[id];
            if (rel) {
                rel.notifyRemoveFromModel && rel.notifyRemoveFromModel();
                delete this._relations[id];
            }
        },
        insertComment: function(key, value) {
            this.commentService.insertComment(key, lang.clone(value));
        },
        delComment: function(key) {
            this.commentService.deleteComment(key, true);
        },
        updateComment: function(cmtid, idx, key, val) {
            this.commentService.updatedComment(cmtid, idx, key, val);
        },
        /**
         * 
         * @param msgList, an array to store the message, can be empty
         * @param isHeader, true for header,  false for footer
         * @returns the section id for the new header/footer
         */
        createHeaderFooter: function(msgList, isHeader) {
            if (!msgList) {
                throw "the first argument must be an array for createHeaderFooter";
            }
            var index = 10;
            // TODO Avoid the index was conflicted in co-editing mode
            // Should change the index generated algorithm to add client information.
            while (this._relations["rId" + index]) {
                index++;
            }

            var resultRef = "rId" + index;
            var emptyPS = ModelTools.getEmptyParagraphSource();
            var jsonContent = {
                t: isHeader ? "hdr" : "ftr",
                content: [emptyPS]
            };
            this._relations[resultRef] = new HeaderFooter(jsonContent.content, resultRef, jsonContent.t);

            var actPair = msgCenter.createInsertKeyAct(resultRef, jsonContent);
            var msg = msgCenter.createMsg(constants.MSGTYPE.KeyMessage, [actPair], constants.MSGCATEGORY.Relation);
            msgList.push(msg);

            return resultRef;
        },

        /**
         * 
         * @param msgList, an array to store the message, can be empty
         * @param headerFooterID, id of hader/footer
         * @returns none
         */
        removeHeaderFooter: function(msgList, headerFooterID, isHeader) {
            if (!msgList) {
                throw "the first argument must be an array for removeHeaderFooter";
                return;
            }

            var headerfooter = this.getHeaderFooterById(headerFooterID);

            if (!headerfooter)
                return;

            var jsonData = headerfooter.toJson();
            jsonData.t = isHeader ? "hdr" : "ftr";
            this.deleteRelation(headerFooterID);

            var actPair = msgCenter.createDeleteKeyAct(headerFooterID, jsonData);
            var msg = msgCenter.createMsg(constants.MSGTYPE.KeyMessage, [actPair], constants.MSGCATEGORY.Relation);
            msgList.push(msg);
        },

        getTheme: function() {
            var themeId = 'theme';
            if (this._relations && this._relations[themeId]) {
                return this._relations[themeId];
            }
            return null;
        },

        getSchemeColor: function(schemeClr) {
            var theme = this.getTheme();
            return theme && theme.getSchemeColor(schemeClr);
        },

        /**
         * Get the message target by id
         * @param id
         */
        byId: function(id) {
            if (this._relations[id])
                return this._relations[id];

            for (var rel in this._relations) {
                var relation = this._relations[rel];
                var ret = relation && relation.byId && relation.byId(id);
                if (ret)
                    return ret;
            }
            if (id.indexOf("footnotes") == 0) {
                var ids = id.split(":");
                if (ids.length == 2) {
                    return this.notesManager.getFootnotesByIndex(ids[1]);
                } else {
                    return this.notesManager;
                }
            }
            if (id.indexOf("endnotes") == 0) {
                var ids = id.split(":");
                if (ids.length == 2) {
                    return this.notesManager.getEndnotesByIndex(ids[1]);
                }
                return this.notesManager;
            }
            return this.notesManager.byId(id);
        }
    };
    return Relations;
});
