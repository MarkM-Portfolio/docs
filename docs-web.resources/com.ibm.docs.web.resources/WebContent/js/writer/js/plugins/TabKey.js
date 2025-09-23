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
    "dojo/string",
    "dojo/_base/declare",
    "dojo/has",
    "dojo/topic",
    "writer/constants",
    "writer/core/Range",
    "writer/msg/msgCenter",
    "writer/msg/msgHelper",
    "writer/plugins/Plugin",
    "writer/util/ModelTools",
    "dojo/i18n!writer/nls/lang"
], function(keys, dojoString, declare, has, topic, constants, Range, msgCenter, msgHelper, Plugin, ModelTools, i18nlang) {

    var TabKey = declare("writer.plugins.TabKey", Plugin, {
        _firstLineOffset: 21, // Unit is pt, same with indent
        init: function() {
            var plugin = this;
            var tabCmd = {
                exec: function() {
                    var isShift = (this.getName() == "shiftTab");

                    var selection = pe.lotusEditor.getSelection();
                    if (!selection) return;
                    var ranges = selection.getRanges();
                    if (!ranges || ranges.length == 0) return;

                    var paras = pe.lotusEditor.getSelectedParagraph();
                    var para = paras[0];
                    if (!para) {
                        console.error("the range has select no para, it must be incorrect");
                        return;
                    }
                    var msgs = [];

                    var cell = ModelTools.getParent(para, constants.MODELTYPE.CELL);
                    if (cell) {
                        plugin._navigateTable(msgs, cell, paras, isShift, selection);
                    } else if (paras.length > 1) {
                        if (ranges[0].isStartOfPara())
                            pe.lotusEditor.execCommand(isShift ? "outdent" : "indent");
                        else
                            pe.lotusEditor.getShell().insertText("\t");
                    } else {
                        if (ranges[0].isStartOfPara()) {
                            var isCollapsed = ranges.length > 1 ? false : ranges[0].isCollapsed();
                            if (isCollapsed || ranges[0].isEndofPara())
                                plugin._changeFirstLine(msgs, para, isShift);
                            else
                                pe.lotusEditor.getShell().insertText("\t");
                        } else {
                            pe.lotusEditor.getShell().insertText("\t");
                        }
                    }

                    msgCenter.sendMessage(msgs);

                    return true;
                }
            };

            var ctrlTabCmd = {
                exec: function() {
                    pe.lotusEditor.getShell().insertText("\t"); // Ensure can insert Tab in table
                    return true;
                }
            };

            this.editor.addCommand("tab", tabCmd, keys.TAB); // Tab
            this.editor.addCommand("shiftTab", tabCmd, constants.KEYS.SHIFT + keys.TAB); // Shift + Tab
            this.editor.addCommand("ctrlTab", ctrlTabCmd, constants.KEYS.CTRL + keys.TAB); // Ctrl + Tab
        },

        _getNavCell: function(cell, isShift)
        {
            var selectedCell = null;
            if (isShift) {
                // Select previous cell
                selectedCell = cell.previous();
                if (!selectedCell) {
                    var preRow = cell.parent.previous();
                    selectedCell = preRow && preRow.lastChild();
                }
            } else {
                selectedCell = cell.next();
                if (!selectedCell) {
                    var nextRow = cell.parent.next();
                    if (!nextRow) {
                        pe.lotusEditor.execCommand("insertRowBelow");
                        nextRow = cell.parent.next();
                        selectedCell = nextRow.firstChild();
                        selectedCell.isNew = true;
                    } else {
                        selectedCell = nextRow.firstChild();
                    }
                }
            }
            if (selectedCell && selectedCell != cell && !selectedCell.firstChild())
            {
                selectedCell = this._getNavCell(selectedCell, isShift);
            }
            return selectedCell;
        },

        _navigateTable: function(msgs, cell, paras, isShift, selection) {
            var selectedCell = null;
            var text = "";
            var nls = i18nlang;
            // notify spell check
            topic.publish(constants.EVENT.CURSORCOMMAND, "tab", selection.getRanges()[0]);

            // Navigate cell
            var lastCell = paras.length > 1 ? ModelTools.getParent(paras[paras.length - 1], constants.MODELTYPE.CELL) : null;
            if (cell != lastCell && paras.length > 1) {
                // Select multiple cell, will select the first cell
                selectedCell = cell;
            } else {
                selectedCell = this._getNavCell(cell, isShift);
            }

            if (selectedCell != null) {
                // Select it

                var start = {},
                    end = {};
                start.obj = selectedCell.firstChild();
                start.index = 0;
                end.obj = selectedCell.lastChild();
                end.index = end.obj.getLength();

                var range = new Range(start, end, selection.getRanges()[0].rootView);
                selection.selectRanges([range]);
                selection.scrollIntoView();
                if (has("ff")) {
                    var row;
                    if (selectedCell)
                        row = ModelTools.getRow(selectedCell);
                    if (selectedCell && row) {

                        if (selectedCell.isNew)
                            text += nls.ACC_uniformTable + " ";

                        text += selection.getSelectedText(nls);
                        text += " ";
                        text += dojoString.substitute(nls.acc_inTable, [row.getRowIdx(), selectedCell.getColIdx()]);
                        pe.lotusEditor && pe.lotusEditor.getShell()._editWindow.announce(text);
                    }
                }
            }
        },

        _changeFirstLine: function(msgs, para, isShift) {
            var indentLeft = para.directProperty.getIndentLeft();
            if (para.isList() || indentLeft != 0) {
                pe.lotusEditor.execCommand(isShift ? 'outdent' : 'indent');
            } else {
                var msg = null;
                var directProp = para.directProperty;
                var specialIndent = directProp.getIndentSpecialType();
                var specialIndentVal = directProp.getIndentSpecialValue();
                if (isShift) {
                    if (specialIndent == "firstLine") {
                        if (specialIndentVal > this._firstLineOffset) {
                            var delta = specialIndentVal % this._firstLineOffset;
                            if (delta == 0)
                                delta = plugin._firstLineOffset;
                            specialIndentVal -= delta;
                            msg = para.setIndentSpecialTypeValue(specialIndent, specialIndentVal + "pt");
                        } else {
                            // Remove first line
                            msg = para.setIndentSpecialTypeValue('none', 'none');
                        }
                    } else {
                        pe.lotusEditor.execCommand('outdent');
                    }
                } else {
                    if (specialIndent == "hanging")
                        msg = para.setIndentSpecialTypeValue('none', 'none'); // Remove hanging
                    else if (specialIndent == "firstLine") {
                        // Add indent for all 
                        pe.lotusEditor.execCommand('indent');
                    } else
                        msg = para.setIndentSpecialTypeValue('firstLine', this._firstLineOffset + "pt"); // Add first line
                }
                msgHelper.mergeMsgs(msgs, msg);
            }
        }
    });
    return TabKey;
});
