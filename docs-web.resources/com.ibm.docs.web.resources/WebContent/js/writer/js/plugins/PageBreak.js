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
    "writer/model/Paragraph",
    "writer/model/table/Table",
    "writer/msg/msgCenter",
    "writer/plugins/Plugin",
    "writer/util/ModelTools",
    "writer/util/ViewTools",
    "writer/global"
], function(declare, lang, topic, constants, Paragraph, Table, msgCenter, Plugin, ModelTools, ViewTools, g) {

    var PageBreak = declare("writer.plugins.PageBreak", Plugin, {
        /**
         * check cmd status when selection change
         */
        onSelectionChange: function() {
            var bInField = false;
            var bInTextbox = false;
            var bIntable = false;
            var bInHeaderFooter = false;
            var bInFootnotes = false;
            var bInEndnotes = false;
            var bNestTable = false;

            var viewTools = ViewTools;
            var selection = pe.lotusEditor.getSelection();
            var range = selection.getRanges()[0];

            if (!range) {
                this.editor.getCommand('pagebreak').setState(constants.CMDSTATE.TRISTATE_DISABLED);
                return;
            }

            var startView = range.getStartView();
            var startViewObj = startView && startView.obj;

            // in field
            var plugin = this.editor.getPlugin("Field");
            if (plugin) {
                bInField = plugin.ifInField();
            }

            // in textbox?
            if (startViewObj) {
                var textbox = ViewTools.getTextBox(startViewObj);
                if (textbox)
                    bInTextbox = true;

                var table = ViewTools.getTable(startViewObj);
                if (table && ViewTools.getCell(table.getParent())) {
                    bNestTable = true;
                }
            }

            // in table?
            //				plugin = this.editor.getPlugin("Table");
            //				if( plugin )
            //				{
            //					var res = plugin.getStateBySel(this.editor.getSelection());
            //					bIntable = res.isInTable; 
            //				}

            // in header/footer?
            plugin = this.editor.getPlugin("HeaderFooter");
            if (plugin)
                bInHeaderFooter = plugin.getCurrentHeaderFooter && plugin.getCurrentHeaderFooter();
            plugin = this.editor.getPlugin("Footnotes");
            if (plugin) {
                bInFootnotes = plugin.isInFootnotes();
            }
            plugin = this.editor.getPlugin("Endnotes");
            if (plugin) {
                bInEndnotes = plugin.isInEndnotes();
            }

            plugin = this.editor.getPlugin("Toc");
            var bInToc = plugin && plugin.getSelectedToc();

            this.editor.getCommand('pagebreak').setState(!(bInField || bInTextbox || bNestTable || bIntable || bInHeaderFooter || bInFootnotes || bInEndnotes || bInToc) ? constants.CMDSTATE.TRISTATE_ON : constants.CMDSTATE.TRISTATE_DISABLED);
        },

        init: function() {
            var pbCommand = {
                exec: function() {

                    var msgs = [];
                    msgCenter.beginRecord();
                    try {
                        // split para
                        var selection = pe.lotusEditor.getSelection();
                        var range = selection.getRanges()[0];

                        if (!range.isCollapsed()) {
                            msgs = range.deleteContents(true, true);
                        }
                        var currentMsgIndex = msgs.length;

                        var startModel = range.getStartModel().obj;
                        if (ModelTools.inTable(startModel)) {
                            var currentRow = ModelTools.getRow(startModel);
                            var table = currentRow.parent;
                            var doc = table.parent;
                            var plugin = this._editor.getPlugin("Table");
                            var ret = plugin.splitTable(table, currentRow);
                            var newPara = new Paragraph(ModelTools.getEmptyParagraphSource(), doc);
                            var json = {
                                c: "\r",
                                fmt: [{
                                    br: {
                                        type: "page"
                                    },
                                    s: 0,
                                    l: 1,
                                    rt: "rPr"
                                }]
                            };
                            if (g.trackChange.isOn() && g.modelTools.isTrackable(table))
                                json.fmt[0].ch = [g.trackChange.createChange("ins")];
                            newPara.insertRichText(json, 0);
                            var cursorObj = newPara;
                            var cursorIdx = 0;
                            if (ret) {
                                msgs.push(msgCenter.createMsg(constants.MSGTYPE.Table, ret.acts));
                                doc.insertAfter(newPara, table);
                                msgs.push(msgCenter.createMsg(constants.MSGTYPE.Element, [msgCenter.createInsertElementAct(newPara)]));
                                var newTable = new Table(ret.newTable, doc);
                                newTable.updateConditonStyle("row");
                                doc.insertAfter(newTable, newPara);
                                msgs.push(msgCenter.createMsg(constants.MSGTYPE.Element, [msgCenter.createInsertElementAct(newTable)]));
                            } else {
                                doc.insertBefore(newPara, table);
                                msgs.push(msgCenter.createMsg(constants.MSGTYPE.Element, [msgCenter.createInsertElementAct(newPara)]));
                            }
                        } else {
                            var start = range.getStartParaPos();
                            if (!start) {
                                msgCenter.endRecord();
                                console.error("insert position not exist in range when insert page break!");
                                return false;
                            }

                            var para = start.obj;
                            //defect 44283��Insert one table, select all, then insert page/section break, break is inserted in first cell.
                            var table = ModelTools.getTable(para);
                            if (table) {
                                para = table;
                                var index = 0;
                            } else if(para.getVisibleIndex){
                                var visibleIndex = para.getVisibleIndex(start.index);
                                if (visibleIndex == 0)
                                    var index = 0;
                                else
                                    var index = para.getFullIndex(visibleIndex);
                            } else {
                                var index = start.index;
                            }
                            var newPara = null;
                            var updatePara = para;
                            var doc = updatePara.parent;
                            var cursorObj = updatePara;
                            var cursorIdx = 0;


                            var moveCursor = false;
                            if (index == 0) {
                                newPara = g.modelFac.createModel(g.modelTools.getEmptyParagraphSource(), para.parent);
                                //								newPara.setSectionId("");
                                para.parent.insertBefore(newPara, para);
                                updatePara = newPara;
                            } else {
                                newPara = para.split(index, msgs);
                                if (para.getFixedTarget)
                                	para = para.getFixedTarget();
                                para.parent.insertAfter(newPara, para);
                                //remove section property from the old 
                                var message = para.setSectionId("", true);
                                if (message) {
                                    msgs.push(message);
                                }
                                updatePara = para;
                                cursorObj = newPara;
                            }
                            msgs.push(msgCenter.createMsg(constants.MSGTYPE.Element, [msgCenter.createInsertElementAct(newPara)]));

                            // insert page break
                            var jsonContent = {
                                c: "\r",
                                fmt: [{
                                    br: {
                                        type: "page"
                                    },
                                    s: 0,
                                    l: 1,
                                    rt: "rPr"
                                }]
                            };
                            
                            if (g.trackChange.isOn() && g.modelTools.isTrackable(updatePara))
                                jsonContent.fmt[0].ch = [g.trackChange.createChange("ins")];
                                
                            updatePara.insertRichText(jsonContent, index);
                            var msg,actPair;
                            if (updatePara.findParaIndexToInsert) {
                                var paraIndex = updatePara.findParaIndexToInsert(index);
                                if (paraIndex.para._notNotifyYet) {
                                    msg = msgCenter.createMsg(constants.MSGTYPE.Element,[msgCenter.createInsertElementAct(modelPara)]);
                                    delete paraIndex.para._notNotifyYet;
                                } else
                                    actPair = msgCenter.createInsertTextAct(updatePara.index, 1, updatePara.para);
                                    msg = msgCenter.createMsg(constants.MSGTYPE.Text, [actPair]);
                            } else {
                                actPair = msgCenter.createInsertTextAct(index, 1, updatePara);
                                msg = msgCenter.createMsg(constants.MSGTYPE.Text, [actPair]);
                            }
                            msg && msgs.push(msg);
                        }

                        for (var i = currentMsgIndex; i < msgs.length; i++) {
                            msgs[i].msg.cmdId = "pagebreak";
                        }
                        msgCenter.sendMessage(msgs);

                        doc.update();
                    } catch (e) {

                    }
                    msgCenter.endRecord();

                    //reset selection
                    range.setStartModel(cursorObj, cursorIdx);
                    range.collapse(true);
                    selection.selectRanges([range]);
                    selection.scrollIntoView();
                }
            };

            this.editor.addCommand("pagebreak", pbCommand);

            topic.subscribe(constants.EVENT.SELECTION_CHANGE, lang.hitch(this, this.onSelectionChange));
        }
    });
    return PageBreak;
});
