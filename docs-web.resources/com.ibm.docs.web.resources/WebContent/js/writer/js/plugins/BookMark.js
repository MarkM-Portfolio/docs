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
    "dojo/_base/declare",
    "dojo/dom",
    "dojo/dom-class",
    "dojo/dom-construct",
    "dojo/topic",
    "concord/util/browser",
    "writer/constants",
    "writer/plugins/Plugin",
    "writer/ui/widget/BookmarkDlg",
    "writer/util/BookmarkTools",
    "writer/util/ViewTools"
], function(lang, declare, dom, domClass, domConstruct, topic, browser, constants, Plugin, BookmarkDlg, BookmarkTools, ViewTools) {

    var BookMark = declare("writer.plugins.BookMark", Plugin, {
        onSelectionChange: function() {

            var toc_plugin = this.editor.getPlugin("Toc");
            var toc_disable = toc_plugin && toc_plugin.getSelectedToc();
            var field_plugin = this.editor.getPlugin("Field");
            var field_disable = field_plugin && field_plugin.ifInField();

            var disable = toc_disable || field_disable;
            this.editor.getCommand('insertBookmark').setState((!disable) ? constants.CMDSTATE.TRISTATE_OFF : constants.CMDSTATE.TRISTATE_DISABLED);
        },

        doToggle: function() {
            var doc = browser.getEditAreaDocument();
            if (pe.scene.isShowBookMark()) {
                if (domClass.contains(doc.body, "bookMarkDisabled"))
                    domClass.remove(doc.body, "bookMarkDisabled");
            } else {
                if (!domClass.contains(doc.body, "bookMarkDisabled"))
                    domClass.add(doc.body, "bookMarkDisabled");
            }
        },

        getWidget: function() {
            if (!this.pWidgetObj) {
                var mainNode = dom.byId("mainNode");
                var tmpNode = domConstruct.create("div", null, mainNode);
                this.pWidgetObj = new BookmarkDlg({
                    id: "bookmarkPanel"
                }, tmpNode);
            }
            return this.pWidgetObj;
        },

        editBookmark: function(line) {
            if (line && line.domNode)
            {
                var sel = this.editor.getSelection(); 
                sel && sel.moveTo(line.getFirstViewForCursor(), 0);
            }
            this.getWidget().editBookmark(line);
        },

        init: function() {
            //toggle show bookmark.
            var editor = this.editor;
            var toggleMethod = this.doToggle;
            var plugin = this;
            var toggleBookMark = {
                exec: function() {
                    pe.scene.setShowBookMark(!pe.scene.isShowBookMark());
                    toggleMethod();
                }
            };

            this.editor.addCommand("toggleBookMark", toggleBookMark);

            var toggleBeforeLoad = function() {
                this.doToggle();
                if (this.handler) {
                    this.handler.remove();
                    delete this.handler;
                }
            };
            this.handler = topic.subscribe(constants.EVENT.BEFORE_LOAD, lang.hitch(this, toggleBeforeLoad));
            //insert book mark
            var insertBookMark = {
                exec: function() {
                    //insert book mark widget...
                    plugin.getWidget().createBookmark(editor.getSelection());
                }
            }

            this.editor.addCommand("insertBookmark", insertBookMark);

            var editBookMark = {
                exec: function() {
                    var selection = editor.getSelection();
                    plugin.getWidget().editBookmark(null, editor.getSelection());
                }
            }

            this.editor.addCommand("editBookmark", editBookMark, constants.KEYS.CTRL + constants.KEYS.ALT + 66); // Ctrl+alt+b

            topic.subscribe(constants.EVENT.SELECTION_CHANGE, lang.hitch(this, this.onSelectionChange));
        }
    });
    return BookMark;
});
