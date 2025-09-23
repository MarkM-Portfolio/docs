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
    "writer/constants",
    "writer/model/Model",
    "writer/util/ViewTools",
    "writer/view/text/RFootNoteView"
], function(declare, constants, Model, ViewTools, RFootNoteView) {

    var REndNoteView = declare("writer.view.text.REndNoteView", RFootNoteView, {
        getViewType: function() {
            return "text.REndNote";
        },
        _getCurrentNotePr: function(parent) {
            if (!this.parent) {
                var page = ViewTools.getPage(parent);
            } else {
                var page = ViewTools.getPage(this);
            }
            var sect = page && page.getSection();
            return sect && sect.getEndnotePr();
        },
        _getGNotePr: function() {
            return pe.lotusEditor.setting.getEndnotePr();
        }
    });

    Model.prototype.viewConstructors[constants.MODELTYPE.RENDNOTE] = REndNoteView;
    return REndNoteView;
});
