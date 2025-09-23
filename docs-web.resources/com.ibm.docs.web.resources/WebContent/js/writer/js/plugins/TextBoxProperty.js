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
    "dojo/i18n!concord/widgets/nls/menubar",
    "dojo/topic",
    "concord/widgets/ResizePropDlg",
    "writer/constants",
    "writer/plugins/Plugin",
    "writer/util/ViewTools"
], function(declare, lang, i18nmenubar, topic, ResizePropDlg, constants, Plugin, ViewTools) {

    var TextBoxProperty = declare("writer.plugins.TextBoxProperty", Plugin, {
        init: function() {
            var that = this;
            var textboxPropCmd = {
                exec: function() {
                    var boxView = ViewTools.getCurrSelectedTextbox();
                    if (boxView) {
                        if (!this.dlg)
                            this.dlg = new ResizePropDlg(this.editor, null, null, null, {
                                type: "TEXTBOX"
                            });
                        this.dlg.setSizeInfo({
                            focusObj: boxView,
                            width: boxView.getWholeWidth(),
                            height: boxView.getWholeHeight()
                        });
                        this.dlg.show();
                    }

                }
            };

            this.editor.addCommand("textboxProp", textboxPropCmd);
            this.addContextMenu();
            topic.subscribe(constants.EVENT.SELECTION_CHANGE, lang.hitch(this, this.selectionChangeHandler));
        },

        getSelectedTextBox: function() {
            var boxView = ViewTools.getCurrSelectedTextbox();
            if (boxView)
                return boxView.model;

            return null;
        },

        selectionChangeHandler: function() {
            var txtbox = this.getSelectedTextBox();
            pe.lotusEditor.getCommand('textboxProp').setState(txtbox == null ? constants.CMDSTATE.TRISTATE_DISABLED : constants.CMDSTATE.TRISTATE_ON);
        },

        addContextMenu: function() {
            var nls = i18nmenubar;
            var ctx = this.editor.ContextMenu;
            var menuItem = {
                name: 'textboxProperty',
                commandID: 'textboxProp',
                label: nls.formatMenu_Properties,
                group: 'textbox',
                order: 'textboxProperty',
                disabled: false
            };
            if (ctx && ctx.addMenuItem) {
                ctx.addMenuItem(menuItem.name, menuItem);
            }

            var that = this;
            if (ctx && ctx.addListener) ctx.addListener(function(target, selection) {
                var img = that.getSelectedTextBox();
                var ret = {};
                if (img) {
                    ret.textboxProperty = menuItem;
                    return ret;
                } else
                    return;
            });
        }
    });
    return TextBoxProperty;
});
