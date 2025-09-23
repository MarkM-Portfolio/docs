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
    "dojo/string",
    "dojo/_base/declare",
    "dojo/has",
    "writer/constants",
    "writer/plugins/Plugin",
    "dojo/i18n!writer/nls/lang"
], function(dojoString, declare, has, constants, Plugin, i18nlang) {

    var Indicator = declare("writer.plugins.Indicator", Plugin, {
        init: function() {
            var scene = pe.scene;

            var showAndHideUserIndicator = {
                exec: function() {
                    pe.scene.setIndicatorAuthor(!scene.isIndicatorAuthor());
                    pe.lotusEditor.indicatorManager.IndicatorAuthor();
                }
            };
            this.editor.addCommand("showAndHideUserIndicator", showAndHideUserIndicator);

            var turnOnUserIndicator = {
                exec: function(para) {
                    pe.lotusEditor.indicatorManager.turnOnUserIndicator(para);
                }
            };
            this.editor.addCommand("turnOnUserIndicator", turnOnUserIndicator);

            if (has("ff")) {
                var readIndicator = {
                    exec: function(para) {
                        try {
                            var sel = pe.lotusEditor.getSelection();
                            var ranges = sel.getRanges();
                            if (ranges.length == 1 && ranges[0].isCollapsed()) {
                                var startModel = ranges[0].getStartModel().obj;
                                var author = startModel.author;

                                var editorName = author ? pe.scene.getEditorStore().getEditorById(author).getName() : null;
                                if (editorName) {
                                    var nls = i18nlang;
                                    var info = dojoString.substitute(nls.acc_editor, [editorName]) + " ";
                                    pe.lotusEditor && pe.lotusEditor.getShell()._editWindow.announce(info);
                                }
                            }
                        } catch (e) {}
                    }
                };

                this.editor.addCommand("readIndicator", readIndicator, constants.KEYS.CTRL + constants.KEYS.SHIFT + 49); // ctrl + shift + 1	
            }
        }
    });

    return Indicator;
});
