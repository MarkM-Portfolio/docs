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
    "writer/model/text/TextRun"
], function(declare, lang, constants, TextRun) {

    var BookMark = declare("writer.model.text.BookMark", TextRun, {
        t: null,
        name: null,
        id: null,
        type: null,

        constructor: function(json, owner, text) {
            text = "";
            this.t = json && json.t;
            json && json.name && (this.name = json.name);
            this.id = json && json.id;
            this.length = 0;
            json && json.type && (this.type = json.type);
        },
        toJson: function() {
            var jsonData = {
                "rt": "bmk",
                "t": this.t,
                "id": this.id
            };
            this.name && (jsonData.name = this.name);
            this.type && (jsonData.type = this.type); //unknow property
            if (this.ch && this.ch.length)
                jsonData["ch"] = lang.clone(this.ch);
            if (this.rParagraph && this.rParagraph.ch && this.rParagraph != this.paragraph) {
                // run in block group, should append ch from real paragraph
                jsonData["ch"] = jsonData["ch"] ? jsonData["ch"].concat(this.rParagraph.ch) : lang.clone(this.rParagraph.ch);
            }
            return jsonData;
        },
        clone: function() {
            var cloneBookMark = new BookMark();
            cloneBookMark.paragraph = this.paragraph;
            cloneBookMark.parent = this.parent;
            cloneBookMark.author = this.author;
            cloneBookMark.start = this.start;
            cloneBookMark.length = this.length;
            cloneBookMark.textProperty = this.textProperty.clone();
            if(this.textProperty.preserve)
                cloneBookMark.textProperty.preserve = this.textProperty.preserve;
            cloneBookMark.revision = this.revision;
            cloneBookMark.comment_selected = this.comment_selected;
            if (this.clist.length > 0) {
                cloneBookMark.clist = this.clist.concat();
                pe.lotusEditor.relations.commentService.insertCmtTextRun(cloneBookMark);

            } else
                cloneBookMark.clist = [];
            cloneBookMark.ch = lang.clone(this.ch);

            cloneBookMark.t = this.t;
            cloneBookMark.name = this.name;
            cloneBookMark.type = this.type;
            return cloneBookMark;
        },
        isTextRun: function() {
            return false;
        },

        modelType: constants.MODELTYPE.BOOKMARK
    });

    return BookMark;
});
