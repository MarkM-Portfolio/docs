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
    "dojo/_base/array",
    "dojo/dom-style",
    "dojo/on",
    "dojo/topic",
    "writer/constants",
    "writer/common/RangeIterator",
    "writer/plugins/Plugin",
    "writer/msg/msgHelper",
    "writer/msg/msgCenter",
    "writer/ui/widget/insertDate",
    "writer/ui/widget/insertTime",
    "writer/util/ModelTools",
    "writer/util/RangeTools",
    "writer/util/SectionTools",
    "writer/util/ViewTools",
    "dojo/i18n!concord/scenes/nls/Scene",
    "dojo/i18n!writer/nls/lang",
    "writer/track/trackChange"
], function(declare, lang, dojoArray, domStyle, on, topic, constants, RangeIterator, Plugin, msgHelper, msgCenter, insertDate, insertTime, ModelTools, RangeTools, SectionTools, ViewTools, i18nScene, i18nlang, trackChange) {

    var Field = declare("writer.plugins.Field", Plugin, {
        ifInField: function() {
            return this.getSelectedField(true) ? true : false;
        },
        getSelectedField: function(notCheckSupported) {
            var selection = this.editor.getSelection(),
                ranges = selection.getRanges();
            if (ranges.length == 1) {
                var range = ranges[0];
                var hint = range.getCommonAncestor(true);
                if (hint && hint.length && hint.modelType && hint.modelType == constants.MODELTYPE.FIELD && (notCheckSupported || hint.isSupported()))
                    return hint;
            }
        },
        init: function() {
            var editor = this.editor;
            var nls = i18nScene;
            var instr_pageNumber = " PAGE   \\* MERGEFORMAT ";
            var instr_pageTotalNumbers = " NUMPAGES \\* MERGEFORMAT ";
            var that = this;
            var tools = ModelTools;

            function getObject(m) {
                var toc = ModelTools.getParent(m, constants.MODELTYPE.TOC);
                if (toc)
                    return toc;
                if (tools.isInlineObject(m))
                    return m;

                var txbx = tools.getParent(m, tools.isTextBox);
                if (txbx)
                    return txbx;

                return null;
            };

            /**
             * story 20432
             */
            topic.subscribe(constants.EVENT.BEFORE_SELECT, lang.hitch(this, function(ranges) {
                if (ranges.length == 1) {
                    var range = ranges[0],
                        start = range.getStartModel(),
                        end = range.getEndModel();
                    if (!start || !end) {
                        return;
                    }
                    var startIndex = start.index;
                    var startModel = start.obj;

                    var endIndex = end.index;
                    var endModel = end.obj;

                    var swap = RangeTools.isNeedSwap(range);
                    var startO = getObject(startModel),
                        endO = getObject(endModel);
                    if (startO != endO || (startO == endO && startO && startO.isWaterMarker)) {
                        if (startO) {
                            startModel = (swap) ? startO.lastChild() : startO.firstChild();
                            if (!startModel || tools.isTextBox(startO))
                                range.setStartModel(startO, (swap) ? 1 : 0);
                            else
                                range.setStartModel(startModel, (swap) ? startModel.length : 0);

                        }

                        if (endO) {
                            endModel = endO.firstChild() ? ((swap) ? endO.firstChild() : endO.lastChild()) : endO;
                            if (!endModel || tools.isTextBox(endO))
                                range.setEndModel(endO, (swap) ? 0 : 1);
                            else
                                range.setEndModel(endModel, (swap) ? 0 : endModel.length);
                        }
                    }

                }
            }));

            function focusOut() {
                if (editor.focusFieldNodes) {
                    for (var i = 0; i < editor.focusFieldNodes.length; i++)
                        domStyle.set(editor.focusFieldNodes[i], {
                            "background": ""
                        });
                    editor.focusFieldNodes = null;
                }
            }

            topic.subscribe(constants.EVENT.DOMCREATED, lang.hitch(this, function(m, domNode, run, arg) {
                if (arg.fieldObj != null && !arg.fieldObj.isTOCStart()) {
                    //connect click event
                    function focusIn(e) {
                        console.log("focus in field");
                        focusOut();
                        domStyle.set(domNode, {
                            "background": "#999"
                        });
                        editor.focusFieldNodes = [];
                        editor.focusFieldNodes.push(domNode);
                    };

                    on(domNode, "click", focusIn);
                }
            }));

            var selectionChangeHandler = function() {
                var selection = pe.lotusEditor.getSelection();
                var ranges = selection.getRanges();
                var resulted = [];
                focusOut();
                for (var i = 0; i < ranges.length; i++) {
                    var range = ranges[i];
                    var maxParagraphCount = 100;
                    var iterator = new RangeIterator(range, maxParagraphCount);
                    var next;
                    var maxCheckObj = 1000;
                    while ((next = iterator.next()) && maxCheckObj > 0) {
                        maxCheckObj--;
                        var field = ModelTools.getField(next);
                        if (field && !field._highlighted && !field.isTOCStart()) {
                            if (!editor.focusFieldNodes)
                                editor.focusFieldNodes = [];

                            resulted.push(field);
                            field._highlighted = true;

                            var runs = field.container;
                            runs && runs.forEach(function(run) {
                                var rootViews = run.getAllViews();
                                for (var ownerId in rootViews) {
                                    var views = rootViews[ownerId];
                                    var v = views.getFirst();
                                    while (v) {
                                        if (v.domNode) {
                                            domStyle.set(v.domNode, {
                                                "background": "#999"
                                            });
                                            editor.focusFieldNodes.push(v.domNode);
                                        }
                                        v = views.next(v);
                                    }
                                }
                            });
                        }
                    }
                }

                for (var i = 0; i < resulted.length; i++)
                    resulted[i]._highlighted = false;

                var toc_plugin = pe.lotusEditor.getPlugin("Toc");
                var toc_disable = toc_plugin && toc_plugin.getSelectedToc();
                var nState = toc_disable ? constants.CMDSTATE.TRISTATE_DISABLED : constants.CMDSTATE.TRISTATE_OFF;
                pe.lotusEditor.getCommand("insertTime").setState(nState);
                pe.lotusEditor.getCommand("insertDate").setState(nState);
                pe.lotusEditor.getCommand("insertTotalPageNumber").setState(nState);
                pe.lotusEditor.getCommand("insertPageNumber").setState(nState);
            };
            topic.subscribe(constants.EVENT.SELECTION_CHANGE, lang.hitch(this, selectionChangeHandler));
            
        var createFieldJSON = function( start , instrText){
            var text = "#";//pageNumber+"";
            var len = text.length;
            var json = {
                    "fmt" : [ {
                        "style" : {},
                        "rt" : "rPr",
                        "s" : start,
                        "l" : len
                    } ],
                    "id" : msgHelper.getUUID(),
                    "fld" : ModelTools.createFieldInstrTextJson( instrText, start ),
                    "rt" : "fld",
                    "c" : text,
                    "s": start,
                    "l": len
                };
            
            var bTrackAuthor = pe.scene.isTrackAuthor();
            if (trackChange.isOn())
                json.fmt[0].ch = [trackChange.createChange("ins")];
                
            if (bTrackAuthor) {
                json.fmt[0].e_a = pe.scene.getCurrUserId();
            }
            return json;
        };

            /**
             * update selected field
             */
            var updateCommand = {
                exec: function() {
                    var field = that.getSelectedField();
                    var parent = field && field.parent;
                    if (parent && parent.getStyleId() == "TableofFigures") { //update table of figures
                        topic.publish(constants.EVENT.UPDATE_REFERENCE, "TableofFigures");
                    } else if (field) {
                        field.update(true, true);
                    }
                }
            };
            editor.addCommand("updateField", updateCommand);

            function insertRuns(array, position) {
                msgCenter.beginRecord();
                try {
                    var msgs = [],
                        msg, sel = editor.getSelection(),
                        actPair,
                        ranges = sel.getRanges(),
                        range = ranges[0]
                    paraPos = range.getStartParaPos();
                    if (!RangeTools.canDo(ranges)) {
                        /*if the range is crossing more than one footnote/endnote, it can not delete anything.				 */
                        return;
                    }
                    if (!range.isCollapsed()) {
                        msgs = range.deleteContents(true, true);
                        paraPos = range.getStartParaPos();
                    }

                    var p = paraPos.obj,
                        idx = paraPos.index,
                        runJson;

                    var messageCategory;
                    var bAlignmentRight = false;
                    //if position is top/bottom, need get position in header/footer
                    if (position == "Top") {
                        var header = ViewTools.getPage(range._start.obj).getHeader();
                        if (!header) {
                            SectionTools.insertHeaderFooter(ViewTools.getPage(range._start.obj), true);
                            header = ViewTools.getPage(range._start.obj).getHeader();
                        }
                        // switch to headerfooter edit mode
                        pe.lotusEditor.getShell().moveToHeaderFooter(header);
                        range.setRootView(header);
                        //reassign value to variable p and idx
                        p = header.model.lastChild();
                        idx = p.getLength();
                        if (!ModelTools.isEmptyParagraph(p)) {
                            var newPara = p.split(idx, msgs);
                            if(newPara) {
                                if(p.getFixedTarget)
                                    p = p.getFixedTarget();
                                p.parent.insertAfter(newPara, p);
                                msgs.push(msgCenter.createMsg(constants.MSGTYPE.Element, [msgCenter.createInsertElementAct(newPara)]));
                                p = newPara;
                                idx = 0;
                            }
                        }
                        bAlignmentRight = true;
                        messageCategory = constants.MSGCATEGORY.Relation;
                    } else if (position == "Bottom") {
                        var footer = ViewTools.getPage(range._start.obj).getFooter();
                        if (!footer) {
                            SectionTools.insertHeaderFooter(ViewTools.getPage(range._start.obj), false);
                            footer = ViewTools.getPage(range._start.obj).getFooter();
                        }
                        pe.lotusEditor.getShell().moveToHeaderFooter(footer);
                        range.setRootView(footer);
                        //reassign value to variable p and idx
                        p = footer.model.lastChild();
                        idx = p.getLength();
                        if (!ModelTools.isEmptyParagraph(p)) {
                            var newPara = p.split(idx, msgs);
                            if (newPara) {
                                if (p.getFixedTarget)
                                	p.getFixedTarget();
                                p.parent.insertAfter(newPara, p);
                                msgs.push(msgCenter.createMsg(constants.MSGTYPE.Element, [msgCenter.createInsertElementAct(newPara)]));
                                p = newPara;
                                idx = 0;
                            }
                        }
                        bAlignmentRight = true;
                        messageCategory = constants.MSGCATEGORY.Relation;
                    }
                    var ret = p.getInsertionTarget(idx);
                    var hint = ret.follow;

                    for (var i = 0; i < array.length; i++) {
                        if (array[i].text) { //create text run
                            var text = array[i].text,
                                len = text.length;
                            p.insertRichText(text, idx);
                            if (p.findParaIndexToInsert) {
                                var paraIndex = p.findParaIndexToInsert(idx);
                                if (paraIndex.para._notNotifyYet) {
                                    msg = msgCenter.createMsg(constants.MSGTYPE.Element,[msgCenter.createInsertElementAct(paraIndex.para)], messageCategory);
                                    delete paraIndex.para._notNotifyYet;
                                } else {
                                    actPair = msgCenter.createInsertTextAct(paraIndex.index, len, paraIndex.para);
                                    msg = msgCenter.createMsg(constants.MSGTYPE.Text, [actPair], messageCategory);
                                }
                            } else {
                                actPair = msgCenter.createInsertTextAct(idx, len, p);
                                msg = msgCenter.createMsg(constants.MSGTYPE.Text, [actPair], messageCategory);
                            }
                            msg && msgs.push(msg);
                            idx += len;
                        } else if (array[i].field) { //create field
                            runJson = createFieldJSON(idx, array[i].field, messageCategory ? true : false);
                            if (runJson) {
                            	if (runJson.fmt && !ModelTools.isTrackable(p))
                            	{
                                    ModelTools.removeFmtCh(runJson.fmt);
                            	}

                                if (hint && hint.textProperty) {
                                    //follow styles
                                    var styles = hint.textProperty.toJson() || {};
                                    for (var key in styles) {
                                        if (key != "styleId")
                                            runJson.fmt[0].style[key] = styles[key];
                                    }
                                }
                                var result = p.insertRichText(runJson, idx);
                                if (p.findParaIndexToInsert) {
                                    var paraIndex = p.findParaIndexToInsert(result.index);
                                    if (paraIndex.para._notNotifyYet) {
                                        msg = msgCenter.createMsg(constants.MSGTYPE.Element,[msgCenter.createInsertElementAct(paraIndex.para)], messageCategory);
                                        delete paraIndex.para._notNotifyYet;
                                    }
                                    else {
                                        actPair = msgCenter.createInsertTextAct(paraIndex.index, result.length, paraIndex.para);
                                        msg = msgCenter.createMsg(constants.MSGTYPE.Text, [actPair], messageCategory);
                                    }
                                } else {
                                    actPair = msgCenter.createInsertTextAct(result.index, result.length, p);
                                    msg = msgCenter.createMsg(constants.MSGTYPE.Text, [actPair], messageCategory);
                                }
                                msg && msgs.push(msg);
                                idx += runJson.l;
                            }
                        }
                    }

                    if (bAlignmentRight) {
                        msg = p.setAlignment("right");
                        msgHelper.mergeMsgs(msgs, msg);
                    }

                    msgCenter.sendMessage(msgs);
                    p.parent.update();
                    range.setStartModel(p, idx);
                    range.collapse(true);
                    sel.selectRangesBeforeUpdate([range]);
                } catch (e) {
                    console.error("error in Field plugin: " + e.message);
                }

                msgCenter.endRecord();
            };

            /**
             * create field and send message
             * @param instrText
             * @returns
             */
            var createFieldFunc = function(instrText) {
                return insertRuns([{
                    'field': instrText
                }]);
            };

            var createPageNumberFunc = function(instrText, position) {
                return insertRuns([{
                    'field': instrText
                }], position);
            };
            //insert page number field command
            var insertPageNumberCommand = {
                exec: function(param) {
                    var position = param && param.position;
                    createPageNumberFunc(instr_pageNumber, position);
                }
            };
            editor.addCommand("insertPageNumber", insertPageNumberCommand);

            var insertTotalPageNumberCommand = { //"Page 1 of N"
                exec: function() {
                    var nls = i18nlang,
                        textArray = [];
                    var list = nls.PAGENUMBER_OF_TOTALNUMBER.replace("${0}", "%${0}%").replace("${1}", "%${1}%").split("%");
                    for (var i = 0; i < list.length; i++) {
                        switch (list[i]) {
                            case "${0}":
                                textArray.push({
                                    'field': instr_pageNumber
                                });
                                break;
                            case "${1}":
                                textArray.push({
                                    'field': instr_pageTotalNumbers
                                });
                                break;
                            default:
                                { //text 
                                    var str = list[i];
                                    str.length && textArray.push({
                                        'text': str
                                    });
                                }
                        }
                    }
                    insertRuns(textArray);
                }
            };
            editor.addCommand("insertTotalPageNumber", insertTotalPageNumberCommand);

            var insertDateCommand = {
                exec: function(dateFormat) {
                    if (!dateFormat) {
                        if (!this.insertDateDialog) {
                            var nls = i18nlang;
                            this.insertDateDialog = new insertDate(editor, nls.insertDate);
                        }
                        this.insertDateDialog.show();
                    } else if (lang.isString(dateFormat)) {
                        createFieldFunc(" DATE \\@ \"" + dateFormat.replace(/\bEEEE\b/, "dddd").replace(/\by\b/, "yyyy") + "\" ");
                    }
                    //createFieldFunc(" DATE \\@ \"M/d/yyyy\" ");
                }
            };
            editor.addCommand("insertDate", insertDateCommand);

            var insertTimeCommand = {
                exec: function(format) {
                    if (!format) {
                        if (!this.insertTimeDialog) {
                            var nls = i18nlang;
                            this.insertTimeDialog = new insertTime(editor, nls.insertTime);
                        }
                        this.insertTimeDialog.show();
                    } else if (lang.isString(format)) {
                        createFieldFunc(" DATE \\@ \"" + format + "\" ");
                    }
                }
            };
            editor.addCommand("insertTime", insertTimeCommand);
            //context menu
            var nls = i18nlang;

            var cmds = {
                updateField: {
                    label: nls.field.update,
                    commandID: 'updateField',
                    group: 'field',
                    order: 'updateField',
                    name: 'updateField'
                }
            };

            var ctx = this.editor.ContextMenu;
            if (ctx && ctx.addMenuItem) {
                for (var k in cmds)
                    ctx.addMenuItem(cmds[k].name, cmds[k]);
            }
            if (ctx && ctx.addListener) ctx.addListener(function(target, selection) {
                var field = that.getSelectedField();
                if (field)
                    return {
                        updateField: false
                    };
                else
                    return {};
            });

        }
    });
    return Field;
});
