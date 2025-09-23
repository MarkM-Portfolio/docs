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
    "writer/core/Range",
    "writer/plugins/Plugin",
    "writer/util/ModelTools"
], function(declare, constants, Range, Plugin, ModelTools) {

    var SelectAll = declare("writer.plugins.SelectAll", Plugin, {
        init: function() {
            //init commands
            var selectAllCmd = function(name) {};
            var editor = this.editor;

            selectAllCmd.prototype.exec = function() {
                var sel = editor.getSelection();
                var editView = sel.getEditView();
                if (editView == pe.lotusEditor.layoutEngine.rootView) {
                    var doc = editView.model,
                        children = doc.container;
                    var firstObj = children.getFirst();
                    var lastObj = children.getLast();
                    //TODO:
                    sel.selectRanges([new Range({
                        "obj": firstObj,
                        "index": 0
                    }, {
                        "obj": lastObj,
                        "index": ModelTools.getLength(lastObj)
                    })]);
                } else if (editView.getViewType() == "note.footnote" || editView.getViewType() == "note.endnote") {
                    var notes = null;
                    if (editView.getViewType() == "note.footnote") {
                        notes = pe.lotusEditor.relations.notesManager.footnotes;
                    } else {
                        notes = pe.lotusEditor.relations.notesManager.endnotes;
                    }
                    var ranges = [];
                    for (var i = 0; i < notes.length; i++) {
                        var firstObj = notes[i].container.getFirst();
                        var lastObj = notes[i].container.getLast();
                        var range = new Range({
                            "obj": firstObj,
                            "index": 0
                        }, {
                            "obj": lastObj,
                            "index": ModelTools.getLength(lastObj)
                        }, notes[i].getFirstView());
                        ranges.push(range);
                    }
                    sel.selectRanges(ranges);

                } else
                    sel.selectAll();

                sel.AnnounceSelection("all", false);
            };

            this.editor.addCommand("selectAll", new selectAllCmd(), constants.KEYS.CTRL + 65 /* A */ );
        }
    });
    return SelectAll;
});
