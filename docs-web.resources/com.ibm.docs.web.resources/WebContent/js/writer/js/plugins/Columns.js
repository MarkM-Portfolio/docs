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
    "writer/core/Range",
    "writer/plugins/Plugin",
    "writer/util/ModelTools",
    "writer/util/ViewTools",
    "writer/util/RangeTools",
    "writer/ui/sidebar/ColumnsSidePane",
    "writer/constants",
    "dojo/topic"
], function(declare, lang, Range, Plugin, ModelTools,ViewTools, RangeTools, ColumnsSidePane, constants, topic) {

    var Columns = declare("writer.plugins.Columns", Plugin, {
        init: function() {
            //Merge paragraph
            var tools = ModelTools;
            //current plugin
            var cplugin = this;

            var selectionChangeHandler = function() {
                var selection = pe.lotusEditor.getSelection();
                var ranges = selection.getRanges();
                var disable = !cplugin.isSelectionOK();
                var nState = disable ? constants.CMDSTATE.TRISTATE_DISABLED : constants.CMDSTATE.TRISTATE_OFF;
                pe.lotusEditor.getCommand("columns").setState(nState);
            };

            topic.subscribe(constants.EVENT.SELECTION_CHANGE, lang.hitch(this, selectionChangeHandler));

            var columnsCommandFn = function() {
                var disable = !cplugin.isSelectionOK();

                if (disable)
                    return;

                if (!this.columnsPanel) {
                    var editorFrame = dojo.byId("editorFrame");
                    if (editorFrame) {
                        var vNode = dojo.create("div", { id: "columns_sidebar_div" });
                        dojo.place(vNode, editorFrame, "before");
                        this.columnsPanel = new ColumnsSidePane({}, vNode);
                    }
                }
                this.columnsPanel && this.columnsPanel.toggle();
                this.columnsPanel.onSelectionChange();
            };

            var columnsCommand = {
                exec: function() {
                    columnsCommandFn();
                }
            };

            this.editor.addCommand("columns", columnsCommand);
        },
        isSelectionOK :function() {

                var editor = pe.lotusEditor;
                var selection = editor.getSelection();
                if (!selection) {
                    return;
                }
                // in rootView
                var editView = selection.getEditView();
                if (editView != editor.layoutEngine.rootView) {
                    return;
                }

                var ranges = selection.getRanges();
                if (!ranges || ranges.length == 0) {
                    return;
                }

                //check ranges in same table cell and split in different page
                ranges = RangeTools.mergeRangesInCrossPageCell(ranges);
                
                if (!RangeTools.canDo(ranges)) {
                    /*if the range is crossing more than one footnote/endnote*/
                    return;
                }
                var bInField = false;
                var bInHeaderFooter = false;
                var bInFootnotes = false;
                var bInEndnotes = false;
                var range = ranges[0];
                var drawObj = RangeTools.ifContainOnlyOneDrawingObj(range);
                // in field
                if(drawObj && ViewTools.isCanvas(drawObj))
                    return false;
                var plugin = editor.getPlugin("Field");
                if (plugin) {
                    bInField = plugin.ifInField();
                    if(bInField) return false;
                }
                plugin = editor.getPlugin("HeaderFooter");
                if (plugin){
                    bInHeaderFooter = plugin.getCurrentHeaderFooter && plugin.getCurrentHeaderFooter();
                    if(bInHeaderFooter) return false;
                }
                    
                plugin = editor.getPlugin("Footnotes");
                if (plugin) {
                    bInFootnotes = plugin.isInFootnotes();
                    if(bInFootnotes) return false;
                }
                plugin = editor.getPlugin("Endnotes");
                if (plugin) {
                    bInEndnotes = plugin.isInEndnotes();
                    if(bInEndnotes) return false;
                }
                var startView = range.getStartView();
                var startViewObj = startView && startView.obj;
                var endView = range.getEndView();
                var endViewObj = endView && endView.obj;
                var startModel = range.getStartModel().obj;
                var endModel = range.getEndModel().obj;
                var doc = ModelTools.getDocument(startModel);
                var startPara = ModelTools.getDocumentChild(startModel);
                var endPara = ModelTools.getDocumentChild(endModel);
                plugin = this.editor.getPlugin("Toc");
                var bInToc = plugin && plugin.getSelectedToc();
                if(bInToc || ModelTools.isTOC(startPara) || ModelTools.isTOC(endPara)){
                    return false;
                }  
                // in textbox?
                if (startViewObj) {
                    var textbox = ViewTools.getTextBox(startViewObj);
                    if (textbox){
                       return false;
                    }
                        
                    var cell = ViewTools.getTable(startViewObj);
                    var endcell = ViewTools.getTable(endViewObj);

                    if (cell && ViewTools.getCell(cell.getParent())||endcell && ViewTools.getCell(endcell.getParent())) {
                        return false;
                    }
                }
                if(startModel == endModel && ModelTools.isImage(startModel)){
                        return false;
                }
                plugin = editor.getPlugin("Table");
                var startRow = plugin.getStartRow(ranges);
                var endRow = plugin.getEndRow(ranges);
                if (startRow || endRow) {
                    // only selectionin same table may have multiple ranges, selected in same table
                    if (ranges.length > 1) {
                        var startTable = plugin.getTable(startRow);
                        //                    var endTable = plugin.getTable(endTable);
                        var endOfTable = startTable.rows.length() - 1;
                        //selected part table
                        if (startRow.getRowIdx() != 0 || endRow.getRowIdx() != endOfTable) {
                            return false;
                        }
                    } else {
                        if (!range.isCollapsed()) {
                            //ranges.length ==1
                            if (startRow && startRow.getRowIdx() != 0)
                                return false;
                            if (endRow) {
                                var table = plugin.getTable(endRow);
                                var tableEnd = table.rows.length() - 1;
                                if (endRow.getRowIdx() != tableEnd)
                                    return false;
                            }
                            // select inside one row table
                            if(startRow && endRow && startRow == endRow && startRow.getRowIdx() == 0)
                                return false;
                        }
                    }

                }

            return true;

            }

    });
    

    return Columns;
});
