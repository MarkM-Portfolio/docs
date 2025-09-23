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
    "writer/model/text/RFootNote"
], function(declare, constants, RFootNote) {

    /**
     * 
     */
    var REndNote = declare("writer.model.text.REndNote", RFootNote, {
        modelType: constants.MODELTYPE.RENDNOTE,
        deleteSel: function() {
            this._referFn && pe.lotusEditor.relations.notesManager.deleteEndnotesByRefer(this, true);
        },
        _toJsonType: function() {
            return "en";
        }
    });

    return REndNote;
});
