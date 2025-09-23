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
    "dojo/topic",
    "writer/constants",
    "writer/plugins/Plugin",
    "writer/util/SectionTools",
    "writer/util/ViewTools"
], function(declare, lang, topic, constants, Plugin, SectionTools, ViewTools) {

    /**
     * FIXME: not implemented yet
     */
    var InsertHeaderFooter = declare("writer.plugins.InsertHeaderFooter", Plugin, {
        init: function() {
            var insertHeaderFooter = function(isHeader) {

                console.log("insert header");

                // get page
                var page = null;
                var selection = pe.lotusEditor.getSelection();
                if (selection) {
                    var ranges = selection.getRanges();
                    var range = ranges && ranges[0];
                    if (range) {
                        var startView = range.getStartView();
                        if (startView.obj) {
                            startView = startView.obj;
                        }
                        page = ViewTools.getPage(startView);
                    }
                }

                if (!page) {
                    var scrollTop = pe.lotusEditor.getScrollPosition();
                    page = pe.lotusEditor.layoutEngine.rootView.getScrollPage(scrollTop);
                }

                if (!page) {
                    console.log("current page is not found!!");
                    return;
                }

                SectionTools.insertHeaderFooter(page, isHeader);
            };
            var insertHeaderCommand = {
                exec: function() {
                    insertHeaderFooter(true);
                }
            };
            var insertFooterCommand = {
                exec: function() {
                    insertHeaderFooter(false);
                }
            };

            this.editor.addCommand("insertHeader", insertHeaderCommand);
            this.editor.addCommand("insertFooter", insertFooterCommand);
        }
       
    });
    return InsertHeaderFooter;
});
