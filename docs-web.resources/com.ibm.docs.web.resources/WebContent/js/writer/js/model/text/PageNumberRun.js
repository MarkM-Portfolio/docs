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

    var PageNumberRun = declare("writer.model.text.PageNumberRun", TextRun, {
        constructor: function(json, owner, text) {},

        clone: function() {
            var cloneRun = new PageNumberRun();
            cloneRun.paragraph = this.paragraph;
            cloneRun.parent = this.parent;
            cloneRun.splitChars = this.splitChars.concat();
            cloneRun.author = this.author;
            cloneRun.start = this.start;
            cloneRun.length = this.length;
            cloneRun.textProperty = this.textProperty.clone();

            cloneRun.comments = this.comments;
            cloneRun.revision = this.revision;

            cloneRun.ch = lang.clone(this.ch);

            return cloneRun;
        },

        modelType: constants.MODELTYPE.PAGENUMBER
    });


    return PageNumberRun;
});
