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
    "dojo/keys",
    "dojo/_base/declare",
    "writer/constants",
    "writer/plugins/Plugin",
    "writer/util/RangeTools",
    "writer/util/ViewTools"
], function(keys, declare, constants, Plugin, RangeTools, ViewTools) {

    var EscapeKey = declare("writer.plugins.EscapeKey", Plugin, {
        init: function() {
            var escapeCommand = {
                exec: function() {
                    try {
                        var vTools = ViewTools;
                        var selection = pe.lotusEditor.getSelection();
                        var range = null;
                        var startView = null;
                        if (selection) {
                            var ranges = selection.getRanges();
                            range = ranges && ranges[0];
                            startView = range && range.getStartView();
                            if (startView && startView.obj) {
                                startView = startView.obj;
                            }
                        }
                        if (!range || !startView)
                            return;

                        //------------------------------------------------------
                        // escape from drawing selection mode
                        //------------------------------------------------------
                        var drawingObj = RangeTools.ifContainOnlyOneDrawingObj(range);
                        if (drawingObj) {
                            // unselect it and move to runs next to it.
                            selection.moveTo(drawingObj, 0);
                            return;
                        }

                        //------------------------------------------------------
                        // escape from textbox/shape/canvas text edit mode
                        //------------------------------------------------------
                        var drawingParent = vTools.getCanvas(startView);
                        if (!drawingParent)
                            drawingParent = vTools.getTextBox(startView);
                        if (drawingParent) {
                            // select the drawing object
                            var start = {
                                "obj": drawingParent,
                                "line": drawingParent.parent,
                                "index": 0
                            };
                            var end = {
                                "obj": drawingParent,
                                "line": drawingParent.parent,
                                "index": 1
                            };
                            selection.beginSelect(start);
                            selection.endSelect(end);
                            return;
                        }

                        //------------------------------------------------------
                        // escape from header/footer edit mode
                        //------------------------------------------------------
                        var editShell = pe.lotusEditor.getShell();
                        var editMode = editShell.getEditMode();
                        if (editMode == constants.EDITMODE.HEADER_FOOTER_MODE) {
                            var page = null;
                            page = vTools.getPage(startView);

                            if (!page) {
                                var scrollTop = pe.lotusEditor.getScrollPosition();
                                page = pe.lotusEditor.layoutEngine.rootView.getScrollPage(scrollTop);
                            }

                            if (page) {
                                var x = page.getLeft();
                                var y = page.getTop();

                                editShell.enterEditorMode(null, x, y);
                                editShell.endSelect(null, x, y);
                            }
                        }
                    } catch (e) {
                        console.error("error occurred in escape from header/footer from pressing ESC!" + e);
                    }

                }
            };

            this.editor.addCommand("escape", escapeCommand, keys.ESCAPE);
        }
    });
    return EscapeKey;
});
