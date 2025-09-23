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
    "writer/msg/msgCenter",
    "writer/plugins/Plugin",
    "writer/util/ModelTools",
    "writer/util/RangeTools",
    "writer/util/ViewTools"
], function(keys, declare, constants, msgCenter, Plugin, ModelTools, RangeTools, ViewTools) {

    var EnterKey = declare("writer.plugins.EnterKey", Plugin, {
        init: function() {
            var enterCommand = {
                exec: function() {
                    var tools = ModelTools;
                    var isInFirstCell = function(p) {
                        var cell = p.parent;
                        if (tools.isCell(cell)) {
                            var table = cell.getTable();
                            var colIdx = cell.getColIdx();
                            if (colIdx != 0) {
                                return false;
                            }
                            var row = cell.parent;
                            var rowIdx = row.getRowIdx();
                            if (rowIdx != 0) {
                                return false;
                            }
                            return table;
                        }

                        return false;
                    };

                    var getToc = function(p) {
                        if (p.parent && p.parent.modelType == constants.MODELTYPE.TOC)
                            return p.parent;
                        return null;
                    };

                    var selection = pe.lotusEditor.getSelection();
                    var ranges = selection.getRanges();
                    var range = ranges[0];

                    // check if the drawing obj selected.
                    if (range) {
                        var drawingObj = RangeTools.ifContainOnlyOneDrawingObj(range);
                        if (drawingObj) {
                            var vTools = ViewTools;
                            if (vTools.isTextBox(drawingObj)) {
                                // if has text content in it, enter the content editing.
                                var paras = drawingObj.getContainer();
                                if (paras.length() > 0) {
                                    selection.moveTo(paras.getFirst(), 0);
                                }

                            } else if (vTools.isImage(drawingObj) || vTools.isCanvas(drawingObj)) {
                                // do nothing now.
                            }

                            return;
                        }
                    }

                    if (!RangeTools.canDo(ranges)) {
                        /*if the range is crossing more than one footnote/endnote, it can not delete anything.				 */
                        return;
                    }
                    if (range.isCollapsed()) {
                        // range is collapse, and it is in link, when press enter, open link
                        var model = range.getStartModel().obj;
                        var index = range.getStartModel().index;
                        if (tools.isInLink(model)) {
                            var p = model.parent;
                            if (index != 0 && index != model.length) {
                                pe.lotusEditor.execCommand('openlink');
                                return true;
                            }
                            if (p && (p.start < model.start && p.start + p.length > model.start + model.length)) {
                                pe.lotusEditor.execCommand('openlink');
                                return true;
                            }
                        }

                    }
                    msgCenter.beginRecord();
                    try {
                        var msgs = [];
                        if (!range.isCollapsed()) {
                            msgs = range.deleteContents(true, true);
                        }

                        var start = range.getStartParaPos();
                        if (!start)
                            return false;
                        var para = start.obj;
                        var index = start.index;
                        var newPara = null;
                        var cmdId = "enter";
                        if (para.text == '' && para.isList()) {
                            var listLvl = para.getListLevel();
                            var cmdName = (listLvl == 0) ? "removeList" : "outdent";
                            pe.lotusEditor.execCommand(cmdName);
                        } else {
                            if (para.getVisibleIndex(index) == 0)
                                index = 0;
                            if (index != 0) {
                                // move to first not ch delete para's position
                                index = para.getFullIndex(para.getVisibleIndex(index));
                            }
                            newPara = para.split(index, msgs);
                            if(para.getFixedTarget)
                                para = para.getFixedTarget();
                            var moveCursor = false;
                            if (index == 0) {
                                var curBlock = isInFirstCell(para) || getToc(para);
                                if (curBlock && !para.previous() && !tools.isParagraph(curBlock.previous())) {
                                    para = curBlock; // Insert new paragraph before table when the table is the first object.
                                    moveCursor = true;
                                }
                                newPara && para.parent.insertBefore(newPara, para);
                                cmdId = "enter_before";
                            } else {
                                if (newPara)
                                    para.parent.insertAfter(newPara, para);
                                else
                                    cmdId = "enter_before";
                            }
                            if (newPara && ModelTools.isTrackBlockGroup && ModelTools.isTrackBlockGroup(newPara))
                                msgs.push(msgCenter.createMsg(constants.MSGTYPE.Element, [msgCenter.createInsertElementAct(newPara.getFirstPara())]));
                            else if (newPara)
                                msgs.push(msgCenter.createMsg(constants.MSGTYPE.Element, [msgCenter.createInsertElementAct(newPara)]));

                            if (newPara) {
                                newPara.buildGroup && newPara.buildGroup();
                                newPara = newPara.getFixedTarget ? newPara.getFixedTarget() : newPara;
                            }
                            // fix issue 39665 - reset the previous paragraph
                            var m = (index ==0 ? newPara : para);
                            m && m.markReset();

                            // fix issue 41230 - reset the next paragraph if exist	
                            var n = ((index == 0 || !newPara) ? para : newPara);
                            var n = tools.getNext(n, null, false);
                            if (n && n.modelType == constants.MODELTYPE.PARAGRAPH) {
                                n.markReset();
                            }
                        }
                        if (msgs.length > 0)
                            msgCenter.sendMessage(msgs, cmdId);
                    } catch (e) {
                        console.error("Press enter: " + e);
                    }

                    para.parent.update();

                    if (moveCursor || index != 0) //there is no need to move the focus if enter from the beginning of the paragraph
                    {
                        if (newPara != null) {
                            range.setStartModel(newPara, 0);
                            range.collapse(true);
                            selection.selectRangesBeforeUpdate([range], true);
                        } else {
                            var nextPara = para && para.next();
                            if (nextPara) {
                                range.setStartModel(nextPara, 0);
                                range.collapse(true);
                                selection.selectRangesBeforeUpdate([range], true);
                            }
                        }
                    } else
                        selection.scrollIntoView();

                    msgCenter.endRecord();
                }
            };

            this.editor.addCommand("enter", enterCommand, keys.ENTER);
        }
    });
    return EnterKey;
});
