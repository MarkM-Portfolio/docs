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
    "dojo/topic",
    "writer/constants",
    "writer/model/Paragraph",
    "writer/model/table/Table",
    "writer/msg/msgCenter",
    "writer/msg/msgHelper",
    "writer/plugins/Plugin",
    "writer/util/ModelTools",
    "writer/util/SectionTools",
    "writer/util/ViewTools",
    "writer/model/HFType"
], function(lang, declare, topic, constants, Paragraph, Table, msgCenter, msgHelper, Plugin, ModelTools, SectionTools, ViewTools, HFType) {

    var SectionBreak = declare("writer.plugins.SectionBreak", Plugin, {
        init: function() {
            var pbCommand = {
                exec: function() {
                    var secTools = SectionTools;
                    // be in table?
                    // get split position
                    var msgs = [];
                    var selection = pe.lotusEditor.getSelection();
                    var range = selection.getRanges()[0];
                    var startModel = range.getStartModel().obj;
                    var isInTable = ModelTools.inTable(startModel);
                    var startView = range.getStartView();
                    if (!startView)
                        return;
                    var currSect = secTools.getCurrentSection(startView.obj);
                    if (!currSect) {
                        console.error("cannot find current section!");
                        return;
                    }

                    var start = range.getStartParaPos();
                    if (!start && !isInTable) {
                        console.error("insert position not exist in range when insert section break!");
                        return false;
                    }






                    // get current section ID



                    // generate new section, and insert it to setting.
                    var newSect = currSect.clone();
                    var newSecId = secTools.getNewSectionId();
                    newSect.setId(newSecId);
                    var oldSecJson = currSect.toJson();
                    var sectChg = false;
                    for (var i = HFType.BEGIN; i < HFType.END; ++i) {
                        var oldHF = currSect.getHeaderFooterByType(i);
                        newSect.setHeaderFooterByType(i, oldHF);
                        currSect.setHeaderFooterByType(i, null);
                        if (oldHF != null) {
                            sectChg = true;
                        }
                    }
                    if(currSect.getType()){
                       sectChg = true;
                        // only support next page type section insertion 
                       currSect.setType(null);
                    } 
                    var newSecJson = currSect.toJson();
                    if (sectChg) {
                        var sectAct = msgCenter.createReplaceKeyAct(currSect.getId(), oldSecJson, newSecJson, constants.KEYPATH.Section);
                        msgs.push(msgCenter.createMsg(constants.MSGTYPE.KeyMessage, [sectAct], constants.MSGCATEGORY.Setting));
                    }
                    var setting = pe.lotusEditor.setting;
                    var curSecId = currSect.getId();
                    var idx = setting.getSectionIndex(curSecId);
                    secTools.insertSection(newSect, idx, msgs);


                    if (isInTable) {
                        var currentRow = ModelTools.getRow(startModel);
                        var table = currentRow.parent;
                        var plugin = this._editor.getPlugin("Table");
                        var ret = plugin.splitTable(table, currentRow);
                        var doc = table.parent;
                        var newPara = new Paragraph(ModelTools.getEmptyParagraphSource(), doc);
                        newPara.setSectionId(newSect.getId());
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
                        doc.update();
                        msgCenter.sendMessage(msgs);
                        range.setStartModel(cursorObj, cursorIdx);
                        range.collapse(true);
                        selection.selectRanges([range]);
                        selection.scrollIntoView();
                    } else {
                        var para = start.obj;
                        //defect 44283?Insert one table, select all, then insert page/section break, break is inserted in first cell.
                        var table = ModelTools.getTable(para);
                        if (table) {
                            para = table;
                            var index = 0;
                        } else {
                            var index = start.index;
                        }
                        var updatePara;
                        var newPara;

                        var moveCursor = false;
                        if (index == 0) {
                            var prePara = para.previous();

                            if (prePara && ModelTools.isParagraph(prePara) && !(prePara.directProperty && prePara.directProperty.getSectId())) {
                                /* if the paragraph has previous paragraph without sect id,
                                 * then add sect id to prev para
                                 */
                                updatePara = prePara;
                            } else {
                                // split paragraph
                                if (ModelTools.isParagraph(para)) {
                                    newPara = para.split(index, msgs);
                                    if (para.getFixedTarget)
                                    	para.getFixedTarget();
                                } else {
                                    newPara = g.modelFac.createModel(g.modelTools.getEmptyParagraphSource(), para.parent);
                                }
                                /*
                                	newPara	-> add new sec id
                                	--------split-------------
                                	para	-> no change
                                */
                                if (newPara) {
                                    newPara.setSectionId(newSect.getId(), false);
                                    para.parent.insertBefore(newPara, para);
                                    updatePara = newPara;
                                } else {
                                    updatePara = para;
                                }
                            }
                        } else {
                            // split paragraph
                            newPara = para.split(index, msgs);
                            if (para.getFixedTarget)
                            	para = para.getFixedTarget();
                            /*
                            	para	-> add new sec id
                            	--------split-------------
                            	newPara	-> keep old para sec id
                            */
                            if (newPara)
                                para.parent.insertAfter(newPara, para);
                            updatePara = para;
                        }

                        if (newPara)
                            msgs.push(msgCenter.createMsg(constants.MSGTYPE.Element, [msgCenter.createInsertElementAct(newPara)]));

                        // insert section, set section id in paragraph property
                        if (updatePara != newPara) {
                            var msg = updatePara.setSectionId(newSect.getId(), true);
                            // Add the message to first for OT purpose.
                            // unshift is wrong here, changed to push back.
                            msgHelper.mergeMsgs(msgs, msg);
                        }

                        // send message
                        if (msgs.length > 0)
                            msgCenter.sendMessage(msgs);

                        // update insert new section
                        if (updatePara != newPara) {
                            var views = updatePara.getRelativeViews("rootView");
                            var paraView = views && views.getFirst();
                            if (paraView)
                                topic.publish(constants.EVENT.UPDATEINSERTSECTION, paraView, paraView.directProperty.getSectId());
                        }
                        updatePara.parent.update();

                        // update cursor and selection
                        if (moveCursor || index != 0) //there is no need to move the focus if enter from the beginning of the paragraph
                        {
                            if (newPara) {
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
                    }

                }
            };

            this.editor.addCommand("sectionbreak", pbCommand);
            topic.subscribe(constants.EVENT.SELECTION_CHANGE, lang.hitch(this, this.onSelectionChange));
        },
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
                this.editor.getCommand('sectionbreak').setState(constants.CMDSTATE.TRISTATE_DISABLED);
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
                var cell = ViewTools.getTable(startViewObj);
                if (cell && ViewTools.getCell(cell.getParent())) {
                    bNestTable = true;
                }
            }

            // in table?
            //			plugin = this.editor.getPlugin("Table");
            //			if( plugin )
            //			{
            //				var res = plugin.getStateBySel(this.editor.getSelection());
            //				bIntable = res.isInTable; 
            //			}

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

            this.editor.getCommand('sectionbreak').setState(!(bInField || bInTextbox || bNestTable || bInHeaderFooter || bInFootnotes || bInEndnotes || bInToc) ? constants.CMDSTATE.TRISTATE_ON : constants.CMDSTATE.TRISTATE_DISABLED);
        }
    });
    return SectionBreak;
});
