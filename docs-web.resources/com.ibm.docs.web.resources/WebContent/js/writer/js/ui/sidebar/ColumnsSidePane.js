/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2015. All Rights Reserved.          */
/*                                                                   */
/* U.S. Government Users Restricted Rights: Use, duplication or      */
/* disclosure restricted by GSA ADP Schedule Contract with IBM Corp. */
/*                                                                   */
/* ***************************************************************** */
define([
    "writer/ui/sidebar/SidePane",
    "dijit/_Templated",
    "dojo/fx",
    "dojo/aspect",
    "dojo/query",
    "dojo/has",
    "dojo/_base/lang",
    "dojo/_base/declare",
    "dojo/_base/array",
    "dojo/dom",
    "dojo/dom-construct",
    "dojo/dom-attr",
    "dojo/dom-style",
    "dojo/dom-class",
    "dojo/dom-geometry",
    "dojo/on",
    "dojo/topic",
    "dojo/keys",
    "writer/constants",
    "writer/global",
    "dojo/text!writer/templates/ColumnsSidePane.html",
    "dojo/i18n!writer/nls/columns",
    "concord/util/browser",
    "writer/util/RangeTools",
    "writer/util/SectionTools",
    "writer/util/ModelTools",
    "writer/util/ViewTools",
    "writer/model/HFType",
    "writer/msg/msgHelper",
    "writer/model/Paragraph",
    "writer/msg/msgCenter"
],
    function (SidePane, _Templated, fx, aspect, query, has, lang, declare, array, dom, domConstruct, domAttr, domStyle, domClass, domGeo, on, topic, keys, constants, g, template, nls, browser, RangeTools, SectionTools, ModelTools, ViewTools, HFType, msgHelper, Paragraph, msgCenter) {

        var ColumnsSidePane = declare("writer.ui.sidebar.ColumnsSidePane", [SidePane, _Templated], {

            templateString: template,
            name: "ColumnsSidePane",

            status: 0,

            status_all: 1,
            status_section: 2,
            status_text: 3,
            status_unvailable: 0,
            currentSection: null,
            showTitle: true,

            setStatus: function (status) {
                this.status = status;
                this.columnsSubTitle.innerHTML = nls.paneSubTitle2;
                if (this.status == 0) {
                    this.columnsText.style.display = "";
                    this.columnsContent.style.display = "none"
                } else {
                    if (this.status_all == status)
                        this.columnsSubTitle.innerHTML = nls.paneSubTitle1;
                    else if (this.status_text == status)
                        this.columnsSubTitle.innerHTML = nls.paneSubTitle3;
                    this.columnsText.style.display = "none";
                    this.columnsContent.style.display = "";
                    this.checkButtonsStatus();
                }
            },
            
            checkButtonsStatus: function()
            {
                if (this.selectSections == null || this.selectSections.length == 0)
                    return;
                var setting = pe.lotusEditor.setting;
                var secs = array.map(this.selectSections, function(id){
                    return setting.getSection(id);
                });
                
                var num = 0;
                var line = null;
                var sameNum = true;
                var sameLine = true;
                array.forEach(secs, function(sec){
                    if (sec)
                    {
                        var n = sec.getColsNum();
                        if (!num)
                            num = n;
                        else if (num != n)
                            sameNum = false;

                        var l = sec.needSep();
                        if (line === null)
                            line = l;
                        else if (line != l)
                            sameLine = false;
                    }
                });
                
                domClass.remove(this.column1Wrapper, "selected");
                domClass.remove(this.column2Wrapper, "selected");
                domClass.remove(this.column3Wrapper, "selected");
                
                if (sameNum)
                {
                    if (num == 1)
                        domClass.add(this.column1Wrapper, "selected");
                    else if (num == 2)
                        domClass.add(this.column2Wrapper, "selected");
                    else if (num == 3)
                        domClass.add(this.column3Wrapper, "selected");
                }
                
                this.lineCheck.checked = false;
                
                if (sameLine && line)
                    this.lineCheck.checked = true;     
            },

            buildRendering: function () {
                this.nls = nls;
                this.paneTitle = nls.paneTitle;
                this.inherited(arguments);
            },

            postCreate: function () {
                this.inherited(arguments);
                on(this.column1Wrapper, "click", lang.hitch(this, function () {
                    this.setColumns(1);
                }));
                on(this.column2Wrapper, "click", lang.hitch(this, function () {
                    this.setColumns(2);
                }));
                on(this.column3Wrapper, "click", lang.hitch(this, function () {
                    this.setColumns(3);
                }));
                on(this.lineCheck, "click", lang.hitch(this, function () {
                    this.setLineBetween(this.lineCheck.checked);
                }));
                topic.subscribe(constants.EVENT.SELECTION_CHANGE, lang.hitch(this, this.onSelectionChange));

                on(this.column1Wrapper, "keydown", lang.hitch(this, this.columns1Keydown));
                on(this.column2Wrapper, "keydown", lang.hitch(this, this.columns2Keydown));
                on(this.column3Wrapper, "keydown", lang.hitch(this, this.columns3Keydown));
            },

            columns1Keydown: function (e) {
                if (e.keyCode == keys.UP_ARROW) {
                    this.column3Wrapper.focus();
                }
                if (e.keyCode == keys.DOWN_ARROW) {
                    this.column2Wrapper.focus();
                }
            },

            columns2Keydown: function (e) {
                if (e.keyCode == keys.UP_ARROW) {
                    this.column1Wrapper.focus();
                }
                if (e.keyCode == keys.DOWN_ARROW) {
                    this.column3Wrapper.focus();
                }
            },

            columns3Keydown: function (e) {
                if (e.keyCode == keys.UP_ARROW) {
                    this.column2Wrapper.focus();
                }
                if (e.keyCode == keys.DOWN_ARROW) {
                    this.column1Wrapper.focus();
                }
            },

            isAllDocSelected: function (selection) {
                var editView = selection.getEditView();
                if (editView == pe.lotusEditor.layoutEngine.rootView) {
                    var doc = editView.model,
                        children = doc.container;
                    var firstObj = children.getFirst();
                    var lastObj = children.getLast();
                    var ranges = selection.getRanges();
                    var range = ranges[0];
                    var start = range.getStartModel();
                    var end = range.getEndModel();
                    //                var startIndex = start.index;
                    //                var endIndex = end.index;

                    return start.obj && end.obj && start.obj == firstObj && end.obj == lastObj && start.index == 0 && end.index == ModelTools.getLength(lastObj);
                }
                return false;
            },

            onSelectionChange: function () {
                var editor = pe.lotusEditor;
                var selection = editor.getSelection();
                var plugin = editor.getPlugin("Columns");
                if (!plugin.isSelectionOK()) {
                    this.setStatus(this.status_unvailable);
                    return;
                }

                var ranges = selection.getRanges();
                //check ranges in same table cell and split in different page
                ranges = RangeTools.mergeRangesInCrossPageCell(ranges);
                var range = ranges[0];

                var startView = range.getStartView();
                var startViewObj = startView && startView.obj;
                var startModel = range.getStartModel().obj;
                var isStartInTable = ModelTools.inTable(startModel);
                var endModel = range.getEndModel().obj;
                var isEndInTable = ModelTools.inTable(endModel);
                var start = range.getStartParaPos();
                var end = range.getEndParaPos();
                var endView = range.getEndView();
                var endViewObj = endView && endView.obj;
                //
                this.selectSections = [];
                var doc = ModelTools.getDocument(startModel);
                var setting = pe.lotusEditor.setting;
                // if there is table get table else get Para
                var startPara = ModelTools.getDocumentChild(startModel);
                var endPara = ModelTools.getDocumentChild(endModel);
                var startSection = doc.getCurrentSection(startPara);
               
                // set selected Sections num
                if (ranges.length > 1) {
                    this.selectSections.push(startSection);
                } else {
                    if (range.isCollapsed()) {
                        this.selectSections.push(startSection);
                    } else {
                        if (startPara == endPara) {
                            this.selectSections.push(startSection);
                        } else {
                            var endSection = doc.getCurrentSection(endPara);
                            if (startSection && endSection && startSection == endSection) {
                                this.selectSections.push(startSection);
                            } else {
                                var section = startSection;
                                section && this.selectSections.push(section);
                                while (section && section != endSection) {
                                    section = doc.getNextSec(section);
                                    section && this.selectSections.push(section);
                                }
                            }
                        }
                    }
                }

                if (range.isCollapsed()) {
                    this.setCurrentSection(SectionTools.getCurrentSection(startViewObj));
                    // current section
                    this.setStatus(this.status_section);
                } else if (this.isAllDocSelected(selection)) {
                    // section or whole document      
                    this.setStatus(this.status_all);
                } else {
                    this.setStatus(this.status_text);
                }
            },

            setCurrentSection: function (section) {
                if (this.currentSection != section)
                    this.currentSection = section;
            },

            setLineBetween: function (checked) {
                if (this.status == this.status_unvailable)
                    return;
                if (this.selectSections && this.selectSections.length)
                {
                    var msgs = [];
                    var me = this;
                    var first = this.selectSections[0];
                    var setting = pe.lotusEditor.setting;
                    array.forEach(this.selectSections, function(secId){
                        var section = setting.getSection(secId);
                        if (section)
                            me.changeSection(section, null, checked, msgs);
                    });
                    if (msgs.length > 0)
                        msgCenter.sendMessage(msgs);
                    pe.lotusEditor.layoutEngine.rootView.updateSection(first, false, true);
                    
                    pe.lotusEditor.focus();
                    this.onSelectionChange();
                }
            },

            setColumns: function (num) {
                if (this.status == this.status_unvailable)
                    return;

                switch (this.status) {
                case this.status_unvailable:
                    break;
                case this.status_all:
                    this.setWholeDoc(num);
                    pe.lotusEditor.focus();
                    this.onSelectionChange();
                    break;
                case this.status_section:
                    this.setSection(num);
                    pe.lotusEditor.focus();
                    this.onSelectionChange();
                    break;
                case this.status_text:
                    this.setSelectedText(num);
                    pe.lotusEditor.focus();
                    this.onSelectionChange();
                    break;
                default:
                    console.info("can not handle the update type: " + type);
                }
            },
            setSection: function (num) {
                var section = this.currentSection;
                var checked = this.lineCheck.checked;
                var msgs = [];
                section && this.changeSection(section, num, checked, msgs);
                // send message
                if (msgs.length > 0)
                    msgCenter.sendMessage(msgs);
                section && pe.lotusEditor.layoutEngine.rootView.updateSection(section, false, true);
            },
            changeSection: function (section, num, sep, msgs, type) {
                if(!section)
                    return;
                if(num == null && sep == null && type == null)
                	return;
                var oldSecJson = section.toJson();
                // changed the section cols
                if (num) {
                    if(section.getColsNum() != num || section.getEqualWidth() == false){
                        section.setColsNum(num);
                        section.setEqualWidth(true);
                        if (section.getColArr()) {
                            section.removeColArray();
                        }
                    }
                }
                //only change type from null to continuous in this feature
                if (type && type == "continuous" && !section.isContinuous()) {
                    section.setType(type);
                }
                if(sep != null && section.needSep() != sep)
                    section.setColsSep(sep);
                var newSecJson = section.toJson();
                if (msgs) {
                    var sectAct = msgCenter.createReplaceKeyAct(section.getId(), oldSecJson, newSecJson, constants.KEYPATH.Section);
                    msgs.push(msgCenter.createMsg(constants.MSGTYPE.KeyMessage, [sectAct], constants.MSGCATEGORY.Setting));
                }

            },
            setWholeDoc: function (num) {
                var msgs = [];
                var setting = pe.lotusEditor.setting;
                var checked = this.lineCheck.checked;
                var currentSection;

                for (var i = 0; i < setting.getSectionLength(); i++) {
                    currentSection = setting.getSectionByIndex(i);
                    currentSection && this.changeSection(currentSection, num, checked, msgs);
                }
                // send message
                if (msgs.length > 0)
                    msgCenter.sendMessage(msgs);
                pe.lotusEditor.layoutEngine.rootView.updateSection(setting.getSectionByIndex(0), false, true);
            },
            setSelectedText: function (num) {
                var msgs = [];
                var selection = pe.lotusEditor.getSelection();
                var ranges = selection.getRanges();
                var checked = this.lineCheck.checked;
                var setting = pe.lotusEditor.setting;
                var range = ranges[0];
                var startView = range.getStartView();
                var startSection = SectionTools.getCurrentSection(startView.obj);
                var docview = ViewTools.getDocument(startView.obj);
                var startModel = range.getStartModel().obj;
                var plugin = pe.lotusEditor.getPlugin("Table");
                var endModel = range.getEndModel().obj;
                var end = range.getEndParaPos();
                var endView = range.getEndView();
                var endSection = SectionTools.getCurrentSection(endView.obj);
                var doc = ModelTools.getDocument(startModel);
                //create sections
                var start = range.getStartParaPos();
                // new Sections one is insert before and the other one is insert after
                var newEndSection, newbeforeSection,beforeSection, updateEndSection;
                //selected whole table
                if (ranges.length > 1) {
                    msgCenter.beginRecord();
                    var startTable = plugin.getTable(startModel);
                    var prePara, afterPara;
                    if (startTable) {
                        prePara = startTable.previous();
                        afterPara = startTable.next();
                    }

                    var needNewBeforePara = false;
                    if (prePara) {
                        if (ModelTools.isParagraph(prePara) && prePara.directProperty && prePara.directProperty.getSectId()){
                            needNewBeforePara = false;
                            beforeSection = setting.getSection(prePara.directProperty.getSectId());
                        }
                        else
                            needNewBeforePara = true;
                    } else {
                        needNewBeforePara = false;
                    }
                    //create before Section
                    if (needNewBeforePara && startSection) {
                        newbeforeSection = startSection.clone();
                        var newSecId = SectionTools.getNewSectionId();
                        newbeforeSection.setId(newSecId);
                        var idxBefore = setting.getSectionIndex(startSection.getId());
                        SectionTools.insertSection(newbeforeSection, idxBefore, msgs);
                        var newParaBefore = new Paragraph(ModelTools.getEmptyParagraphSource(), doc);
                        newParaBefore.setSectionId(newbeforeSection.getId());
                        doc.insertBefore(newParaBefore, startTable);
                        msgs.push(msgCenter.createMsg(constants.MSGTYPE.Element, [msgCenter.createInsertElementAct(newParaBefore)]));
                        beforeSection = newbeforeSection;
                    }


                    var needNewAfterPara = false;
                    if (!afterPara) {
                        needNewAfterPara = true;
                    } else {
                        if (!ModelTools.isParagraph(afterPara)) {
                            needNewAfterPara = true;
                        } else {
                            // empty para could not be the last para !afterPara.next()
                            var emptyParaWithSectId = afterPara.directProperty && afterPara.directProperty.getSectId() && afterPara.isEmpty();
                            if (!emptyParaWithSectId)
                                needNewAfterPara = true;
                            else
                            	updateEndSection = setting.getSection(emptyParaWithSectId);
                        }
                    }
                    // create After Section
                    if (needNewAfterPara && endSection) {
                        //isEmpty
                        newEndSection = endSection.clone();
                        newEndSection.setEqualWidth(true);
                        var newEndSecId = SectionTools.getNewSectionId();
                        newEndSection.setId(newEndSecId);
                        var idxafter = setting.getSectionIndex(endSection.getId());
                        SectionTools.insertSection(newEndSection, idxafter, msgs);
                        var newParaAfte;
                        //new a para after table and insert sectId
                        newParaAfter = new Paragraph(ModelTools.getEmptyParagraphSource(), doc);
                        newParaAfter.setSectionId(newEndSection.getId());
                        doc.insertAfter(newParaAfter, startTable);
                        msgs.push(msgCenter.createMsg(constants.MSGTYPE.Element, [msgCenter.createInsertElementAct(newParaAfter)]));
                        if (!newParaAfter.next()) {
                            // there must a para after section
                            var newPara = new Paragraph(ModelTools.getEmptyParagraphSource(), doc);
                            doc.insertAfter(newPara, newParaAfter);
                            msgs.push(msgCenter.createMsg(constants.MSGTYPE.Element, [msgCenter.createInsertElementAct(newPara)]));

                        }
                        updateEndSection = newEndSection;
                    }

                    var i = beforeSection ? setting.getSectionIndex(beforeSection.getId()) + 1 : 0;
                    // section after before section is continuous
                    var changeSectionidx = i;
                    var lastIdx = setting.getSectionIndex(updateEndSection.getId());
                    for (; i <= lastIdx; i++) {
                        var section = setting.getSectionByIndex(i);
                        if (changeSectionidx == i && newbeforeSection)
                            section && this.changeSection(section, num, checked, msgs, "continuous");
                        else
                            section && this.changeSection(section, num, checked, msgs);
                    }
                    // section after isertSection
                    if(newEndSection){
                    	var afterChangedSection = setting.getSectionByIndex(i);
                    	afterChangedSection && this.changeSection(afterChangedSection, null , null, msgs, "continuous");
                    }
                    doc.update();
                    if (msgs.length > 0)
                        msgCenter.sendMessage(msgs);
                    msgCenter.endRecord();
                    if (!newbeforeSection && !newEndSection) {
                        pe.lotusEditor.layoutEngine.rootView.updateSection(endSection);
                    }
                } else {

                    msgCenter.beginRecord();
                    // update Selection start
                    var startPara = start.obj;
                    var startSection = SectionTools.getCurrentSection(startView.obj);
                    var startIndex, headInsertSectionPara, newStartPara;
                    var table = ModelTools.getTable(startPara);
                    if (table) {
                        startPara = table;
                        // filter selected part table situation in selectionchanged 
                        startIndex = 0;
                    } else {
                        startIndex = start.index;
                    }
                    if (startIndex == 0) {
                        //table as well considered in this 
                        var prePara = startPara.previous();

                        if ((prePara && ModelTools.isParagraph(prePara) && (prePara.directProperty && prePara.directProperty.getSectId())) || !prePara) {
                            if (prePara)
                                beforeSection = setting.getSection(prePara.directProperty.getSectId());
                        } else {
                            //pre and not has section
                            //create Section 
                            newbeforeSection = startSection.clone();
                            var newSecId = SectionTools.getNewSectionId();
                            newbeforeSection.setId(newSecId);
                            var idxBefore = setting.getSectionIndex(startSection.getId());
                            SectionTools.insertSection(newbeforeSection, idxBefore, msgs);
                            if (ModelTools.isParagraph(prePara)) {
                                headInsertSectionPara = prePara;
                                var msg = prePara.setSectionId(newbeforeSection.getId(), true);
                                msgHelper.mergeMsgs(msgs, msg);
                            } else { // table
                                newStartPara = g.modelFac.createModel(g.modelTools.getEmptyParagraphSource(), startPara.parent);
                                newStartPara.setSectionId(newbeforeSection.getId(), false);
                                startPara.parent.insertBefore(newStartPara, startPara);
                                msgs.push(msgCenter.createMsg(constants.MSGTYPE.Element, [msgCenter.createInsertElementAct(newStartPara)]));
                                headInsertSectionPara = newStartPara;

                            }
                            beforeSection = newbeforeSection;

                        }

                    } else if (ModelTools.getLength(startPara) == startIndex) {
                        // table's end has been handles in ranges>1

                        newStartPara = startPara.split(startIndex, msgs);
                        if (startPara.getFixedTarget)
                            startPara.getFixedTarget();
                        newbeforeSection = startSection.clone();
                        var newSecId = SectionTools.getNewSectionId();
                        newbeforeSection.setId(newSecId);
                        var idxBefore = setting.getSectionIndex(startSection.getId());
                        SectionTools.insertSection(newbeforeSection, idxBefore, msgs);
                        var msg = startPara.setSectionId(newbeforeSection.getId(), true);
                        msgHelper.mergeMsgs(msgs, msg);
                        startPara.parent.insertAfter(newStartPara, startPara);
                        msgs.push(msgCenter.createMsg(constants.MSGTYPE.Element, [msgCenter.createInsertElementAct(newStartPara)]));
                        beforeSection = newbeforeSection;
                        headInsertSectionPara = startPara;

                    } else {
                        // table's end has been handles in ranges>1
                        newStartPara = startPara.split(startIndex, msgs);
                        if (startPara.getFixedTarget)
                            startPara.getFixedTarget();
                        newbeforeSection = startSection.clone();
                        var newSecId = SectionTools.getNewSectionId();
                        newbeforeSection.setId(newSecId);
                        var idxBefore = setting.getSectionIndex(startSection.getId());
                        SectionTools.insertSection(newbeforeSection, idxBefore, msgs);
                        var msg = startPara.setSectionId(newbeforeSection.getId(), true);
                        msgHelper.mergeMsgs(msgs, msg);
                        startPara.parent.insertAfter(newStartPara, startPara);
                        msgs.push(msgCenter.createMsg(constants.MSGTYPE.Element, [msgCenter.createInsertElementAct(newStartPara)]));
                        //same para graph and split
                        if (end.obj == start.obj) {
                            var index = end.index - ModelTools.getLength(startPara);
                            end.obj = newStartPara;
                            end.index = index;
                            //                            range.setEndModel(newStartPara, ModelTools.getLength(newStartPara));
                        }
                        beforeSection = newbeforeSection;
                        headInsertSectionPara = startPara;
                    }

                    //End Selection
                    var endIndex, endInsertSectionPara, newEndPara;
                    var endPara = end.obj;
                    var table = ModelTools.getTable(endPara);
                    if (table) {
                        endPara = table;
                        endIndex = table.rows.length();
                    } else {
                        endIndex = end.index;
                    }
                    if (ModelTools.getLength(endPara) == endIndex) {
                        // end para could not be the last para
                        if (endPara && ModelTools.isParagraph(endPara) && (endPara.directProperty && endPara.directProperty.getSectId())) {
                            updateEndSection = endSection;
                        } else {
                            newEndSection = endSection.clone();
                            newEndSection.setEqualWidth(true);
                            var newSecId = SectionTools.getNewSectionId();
                            newEndSection.setId(newSecId);
                            var idxAfter = setting.getSectionIndex(endSection.getId());
                            SectionTools.insertSection(newEndSection, idxAfter, msgs);
                            // split paragraph
                            if (ModelTools.isParagraph(endPara)) {
                                endInsertSectionPara = endPara;
                                var msg = endPara.setSectionId(newEndSection.getId(), true);
                                msgHelper.mergeMsgs(msgs, msg);
                                if (!endPara.next()) {
                                    newEndPara = g.modelFac.createModel(g.modelTools.getEmptyParagraphSource(), endPara.parent);
                                    newEndPara.parent.insertAfter(newEndPara, endPara);
                                    msgs.push(msgCenter.createMsg(constants.MSGTYPE.Element, [msgCenter.createInsertElementAct(newEndPara)]));
                                }
                            } else {
                                //end in table or anchor
                                newEndPara = g.modelFac.createModel(g.modelTools.getEmptyParagraphSource(), endPara.parent);
                                newEndPara.setSectionId(newEndSection.getId(), true);

                                newEndPara.parent.insertAfter(newEndPara, endPara);
                                msgs.push(msgCenter.createMsg(constants.MSGTYPE.Element, [msgCenter.createInsertElementAct(newEndPara)]));
                                endInsertSectionPara = newEndPara;
                            }
                            updateEndSection = newEndSection;
                        }

                    } else if (endIndex == 0) {

                        newEndPara = endPara.split(endIndex, msgs);
                        if (newEndPara.getFixedTarget)
                            newEndPara = newEndPara.getFixedTarget();

                        endInsertSectionPara = newEndPara;
                        newEndSection = endSection.clone();
                        newEndSection.setEqualWidth(true);
                        var newSecId = SectionTools.getNewSectionId();
                        newEndSection.setId(newSecId);
                        var idxAfter = setting.getSectionIndex(endSection.getId());
                        SectionTools.insertSection(newEndSection, idxAfter, msgs);
                        newEndPara.setSectionId(newEndSection.getId());
                        endPara.parent.insertBefore(newEndPara, endPara);
                        msgs.push(msgCenter.createMsg(constants.MSGTYPE.Element, [msgCenter.createInsertElementAct(newEndPara)]));
                        updateEndSection = newEndSection;

                    } else {
                        //there is not end in table situation
                        newEndPara = endPara.split(endIndex, msgs);
                        if (newEndPara.getFixedTarget)
                            newEndPara = newEndPara.getFixedTarget();

                        endInsertSectionPara = endPara;
                        newEndSection = endSection.clone();
                        newEndSection.setEqualWidth(true);
                        var newSecId = SectionTools.getNewSectionId();
                        newEndSection.setId(newSecId);
                        var idxAfter = setting.getSectionIndex(endSection.getId());
                        SectionTools.insertSection(newEndSection, idxAfter, msgs);
                        var msg = endPara.setSectionId(newEndSection.getId(), true);
                        msgHelper.mergeMsgs(msgs, msg);
                        endPara.parent.insertAfter(newEndPara, endPara);
                        msgs.push(msgCenter.createMsg(constants.MSGTYPE.Element, [msgCenter.createInsertElementAct(newEndPara)]));

                        updateEndSection = newEndSection;
                    }

                    var i = beforeSection ? setting.getSectionIndex(beforeSection.getId()) + 1 : 0;
                    // section after before section is continuous
                    var changeSectionidx = i;
                    var lastIdx = setting.getSectionIndex(updateEndSection.getId());
                    for (; i <= lastIdx; i++) {
                        var section = setting.getSectionByIndex(i);
                        if (changeSectionidx == i && newbeforeSection)
                            section && this.changeSection(section, num, checked, msgs, "continuous");
                        else
                            section && this.changeSection(section, num, checked, msgs);
                    }
                    // section after UpdateSection
                    if (newEndSection) {
                        var afterChangedSection = setting.getSectionByIndex(i);
                        afterChangedSection && this.changeSection(afterChangedSection, null , checked, msgs, "continuous");
                    }
                    if (headInsertSectionPara) {
                        var views = headInsertSectionPara.getRelativeViews("rootView");
                        var paraView = views && views.getFirst();
                        if (paraView)
                            topic.publish(constants.EVENT.UPDATEINSERTSECTION, paraView, paraView.directProperty.getSectId());
                        var newStart = headInsertSectionPara.next();
                        newStart && range.setStartModel(newStart, 0);
                    }
                    if (endInsertSectionPara) {
                        var views = endInsertSectionPara.getRelativeViews("rootView");
                        var paraView = views && views.getFirst();
                        if (paraView)
                            topic.publish(constants.EVENT.UPDATEINSERTSECTION, paraView, paraView.directProperty.getSectId());
                        endInsertSectionPara && range.setEndModel(endInsertSectionPara, ModelTools.getLength(endInsertSectionPara));
                    }
                    if (headInsertSectionPara || endInsertSectionPara) {
                        selection.selectRangesBeforeUpdate([range], true);
                    } else {
                        // only changed section, no newed sections
                        var changeSection = setting.getSectionByIndex(changeSectionidx);
                        pe.lotusEditor.layoutEngine.rootView.updateSection(changeSection);
                    }
                    doc.update();
                    // send message
                    if (msgs.length > 0)
                        msgCenter.sendMessage(msgs);
                    msgCenter.endRecord();
                }
            },
            onOpen: function () {
                var doc = browser.getEditAreaDocument();
                if (!domClass.contains(doc.body, "columnsPanelShow"))
                    domClass.add(doc.body, "columnsPanelShow");
            },

            onClose: function () {
                topic.publish(this.sidePaneMgr.closeTopic, {
                    sidePane: this
                });
                pe.scene.sidebarResized(0);
                var doc = browser.getEditAreaDocument();
                domClass.remove(doc.body, "columnsPanelShow");
            }

        });

        return ColumnsSidePane;
    });