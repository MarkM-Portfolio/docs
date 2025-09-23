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
    "writer/plugins/Plugin"
], function(declare, constants, Plugin) {

    var Footnotes = declare("writer.plugins.Footnotes", Plugin, {
        init: function() {},
        isInFootnotes: function() {
            var editor = this.editor;
            var shell = editor.getShell();
            var model = shell.getEditMode();
            return model == constants.EDITMODE.FOOTNOTE_MODE;
        }
    });
    return Footnotes;
});
