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
    "writer/model/Model",
    "writer/model/notes/EndNote",
    "writer/view/notes/FootNoteView"
], function(declare, Model, EndNote, FootNoteView) {

    var EndNoteView = declare("writer.view.notes.EndNoteView", FootNoteView, {
        getViewType: function() {
            return 'note.endnote';
        },
        _defalutClass: "endnote"
    });
    Model.prototype.viewConstructors[EndNote.prototype.modelType] = EndNoteView;
    return EndNoteView;
});
