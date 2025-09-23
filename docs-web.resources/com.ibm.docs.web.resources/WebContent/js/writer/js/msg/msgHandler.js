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
    "dojo/_base/array",
    "dojo/_base/lang",
    "dojo/topic",
    "dojo/has",
    "writer/constants",
    "writer/msg/otService",
    "writer/common/tools",
    "writer/model/table/Row",
    "writer/model/notes/FootNote",
    "writer/core/Range",
    "writer/model/Section",
    "writer/model/abstractNum",
    "writer/model/numberingDefinition",
    "writer/model/notes/EndNote",
    "writer/util/ModelTools",
    "writer/util/RangeTools",
    "writer/util/SectionTools",
    "writer/util/ViewTools",
    "dojo/i18n!concord/scenes/nls/Scene",
    "writer/global",
    "writer/track/trackChange",
    "dojo/i18n!writer/nls/track",
    "exports"
], function(array, lang, topic, has, constants, otService, toolsModule, Row, FootNote, Range, Section, abstractNumModule, numberingDefinition, EndNote, ModelTools, RangeTools, SectionTools, ViewTools, i18nScene, global, trackChange, trackNls, exports) {

    var msgHandler =  lang.mixin(lang.getObject("writer.msg.msgHandler", true), {
        isManipulatingTbl: false,

        receiveMessage: function(msg) {
            // 1.Transform message in sendoutList
        	if(!pe.scene.localEdit)
        		this._transform(msg);
            // 2 apply message to editor
            topic.publish(constants.EVENT.GROUPCHANGE_START);
            trackChange.beginRecord();
            has("trackGroup") && writer.track && writer.track.trackBlockGroupManager && writer.track.trackBlockGroupManager.beginDirtyRecord();

            try{
                this.processMessage(msg);
            }
            catch(e)
            {
                trackChange.endRecord();
                throw e;
            }

            has("trackGroup") && writer.track && writer.track.trackBlockGroupManager && writer.track.trackBlockGroupManager.endDirtyRecord();
            trackChange.endRecord();
            topic.publish(constants.EVENT.GROUPCHANGE_END);
            // 3. Transform Undo/Redo message
            pe.lotusEditor.undoManager.transform(msg);
        },
        /**
         * call by UndoManager
         * before undo/redp
         */
        beginAction: function() {
            this.cursorRanges = null;
        },
        /**
         * call by UndoManager
         * after undo/redo
         */
        endAction: function() {
            if (this.cursorRanges) {
                this.mergeRanges();
                RangeTools.fixTCMergedOfRanges(this.cursorRanges);
                pe.lotusEditor.getSelection().selectRangesBeforeUpdate(this.cursorRanges);
                this.cursorRanges = null;
            }
        },

        _transform: function(msg) {
            var sess = pe.scene.session;
            // if message in waitingList isn't conflict with others, then the message will be OT on server, 
            // so we should clone the waitingList here, or else the message will be OT twice.
            var localList = sess.sendoutList.concat(sess.waitingList);
            if (localList.length > 0) {
                var conflictMsg = otService.transform(msg, localList);
                if (conflictMsg) {
                    //1 show error message
                    var nls = i18nScene;
                    pe.scene.showWarningMessage(nls.conflictMsg, 5000);

                    //remove message on sendoutlist
                    var index = -1;
                    for (var i = 0; i < sess.sendoutList.length; i++) {
                        if (sess.sendoutList[i].client_seq == conflictMsg.client_seq) {
                            index = i;
                            break;
                        }
                    }
                    if (index != -1)
                        sess.sendoutList.splice(index, sess.sendoutList.length - index);

                    //remove message on waiting list
                    sess.waitingList = [];
                    //send resolve conflict message to server
                    var newmsg = sess.createMessage();
                    newmsg.resolve_conflict = "true";
                    sess.sendMessage([newmsg]);

                    //2 roll back local change
                    var isReload = pe.lotusEditor.undoManager.rollback(conflictMsg);
                    if (isReload) {
                        throw "reload for local conflict";
                    }
                }
            }
        },

        /**
         * merge all ranges
         */
        mergeRanges: function() {

            if (!this.cursorRanges || this.cursorRanges.length <= 1)
                return;
            var range = this.cursorRanges[0],
                start, end, tools = ModelTools;

            var obj1 = range.getStartModel().obj,
                idx1 = range.getStartModel().index,
                obj2 = range.getEndModel().obj,
                idx2 = range.getEndModel().index;

            for (var i = 1; i < this.cursorRanges.length; i++) {
                range = this.cursorRanges[i];
                start = range.getStartModel();
                end = range.getEndModel();

                if (tools.compare(obj1, idx1, start.obj, start.index) > 0) {
                    // start in minimum
                    obj1 = start.obj;
                    idx1 = start.index;
                }

                if (tools.compare(obj2, idx2, end.obj, end.index) < 0) {
                    // end is maximum
                    obj2 = end.obj;
                    idx2 = end.index;
                }
            }
            this.cursorRanges = [new Range({
                "obj": obj1,
                "index": idx1
            }, {
                "obj": obj2,
                "index": idx2
            }, this.rootView).toRealModel()];
        },

        _removeRowFromCursorRanges: function(obj, idx) {
            var range;
            if (this.cursorRanges && this.cursorRanges.length == 1) {
                range = this.cursorRanges[0];
                if (range.isCollapsed()) {
                    return;
                }
            }
            var bConflict = false;
            var id = obj && obj.id;
            if (!id)
                return;

            var newRanges = [];
            for (var i = 0; i < this.cursorRanges.length ; i++) {
                range = this.cursorRanges[i];
                var startId = range.start_id.obj;
                var endId = range.end_id.obj;

                if (id && (id == startId || id == endId)) 
                	continue;

                newRanges.push(range);
            }

            this.cursorRanges = newRanges;
        },
  
        _checkRangeConflict: function(obj, idx) {
            var range;
            if (this.cursorRanges && this.cursorRanges.length == 1) {
                range = this.cursorRanges[0];
                if (range.isCollapsed()) {
                    return;
                }
            }
            var bConflict = false;
            var id = obj && obj.id;
            if (!id)
                return;

            for (var i = 0; i < this.cursorRanges.length && !bConflict; i++) {
                range = this.cursorRanges[i];
                var startId = range.start_id.obj;
                var endId = range.end_id.obj;

                if (id && (id == startId || id == endId)) {
                    bConflict = true;
                }
            }
            if (bConflict) {
                range = this.cursorRanges[0];
                range.end_id = range.start_id;
                this.cursorRanges = [range];
            }
        },
        /**
         * add range for undo/redo
         * @param obj1
         * @param idx1
         * @param obj2
         * @param idx2
         */
        addCursorRange: function(obj1, idx1, obj2, idx2) {
            try {
                if (!this.isFromUndoRedo) {
                    this._checkRangeConflict(obj1, idx1);
                    if (obj2 != obj1)
                        this._checkRangeConflict(obj2, idx2);
                    return;
                }
                if (obj1 == null)
                    return;
                // if (obj1.getCursorTarget) {
                //     var tmp = obj1.getCursorTarget(idx1);
                //     obj1 = tmp.obj;
                //     idx1 = tmp.index;
                // }
                if (obj2 == null) {
                    obj2 = obj1;
                    idx2 = idx1;
                // } else if (obj2.getCursorTarget) {
                //     var tmp = obj2.getCursorTarget(idx2);
                //     obj2 = tmp.obj;
                //     idx2 = tmp.index;
                }
                //prepare before add range 
                var tools = ModelTools,
                    compareResult = tools.compare(obj1, idx1, obj2, idx2);
                if (compareResult > 0) { //pos1 should <= pos2
                    var tmp = obj1;
                    obj1 = obj2;
                    obj2 = tmp;

                    tmp = idx1;
                    idx1 = idx2;
                    idx2 = tmp;
                }
                if (this.cursorRanges == null)
                    this.cursorRanges = [];

                //and range
                var range, start, end, ranges = this.cursorRanges;
                newRange = new Range({
                    "obj": obj1,
                    "index": idx1
                }, {
                    "obj": obj2,
                    "index": idx2
                }, this.rootView);
                newRange.toRealModel();

                for (var j = 0; j < ranges.length; j++) {
                    range = ranges[j];
                    start = range.getStartModel();
                    end = range.getEndModel();
                    if (obj2 == obj1 && start.obj == obj1 && end.obj == obj1 && tools.compare(obj1, idx1, start.obj, start.index) >= 0 && tools.compare(obj1, idx1, end.obj, end.index) < 0) {
                        // if two range have overlap
                        //replace with new range
                        ranges[j] = newRange;
                        return;
                    } else if (obj2 == obj1 && start.obj == end.obj && tools.compare(obj1, idx1, start.obj, start.index) == 0 && tools.compare(obj2, idx2, end.obj, end.index) == 0) {
                        //same range , no change
                        return;
                    }
                }
                //do not deal with it
                ranges.push(newRange);
            } catch (e) {
                console.error("addCursorRange exception: " + e);
            }
        },

        setCursorEditPosition: function(obj, bStart, bMerge) {
            try {
                if (!this.isFromUndoRedo) {
                    //check collapsed
                    this._checkRangeConflict(obj, 0);
                } else {
                    if (!bMerge) {
                        var range = new Range({
                            "obj": obj,
                            "index": 0
                        }, {
                            "obj": obj,
                            "index": 0
                        }, this.rootView);
                        range.toRealModel();
                        (bStart) ? range.moveToEditStart(obj): range.moveToEditEnd(obj);
                        this.cursorRanges = [range];
                    } else {
                        this.addCursorRange(obj, 0, obj, ModelTools.getLength(obj));
                    }
                }
            } catch (e) {
                console.error("Exception in setCursorEditPosition:" + e);
            }
        },

        processMessage: function(msg, isFromUndoRedo, lastMsg) {
            var msgCat = constants.MSGCATEGORY,
                msgType = constants.MSGTYPE,
                actType = constants.ACTTYPE;

            if (msg.type == msgType.CheckModel || msg.type == msgType.AcceptTrackChange)
            {
            	if(msg.type == msgType.AcceptTrackChange)
            		trackChange.acceptAllTrackChanges(true);
                pe.scene.showWarningMessage(trackNls.acceptChangesReloadMsg, 5000);
                throw new Error("Accept all track changes, to reload");
            }

        	var trackBlockGroupManager = writer.track && writer.track.trackBlockGroupManager;                        
            trackChange.pause();
            if (has("trackGroup") && trackBlockGroupManager && msg.recordSeq){
                if (msg.isFirstRecord) {
                    if (trackBlockGroupManager.isBuildGroupRecording()){
                        trackBlockGroupManager.endBuildGroupRecord();
                    }
                    this._processingRecord = msg.recordSeq;
                    trackBlockGroupManager.beginBuildGroupRecord(500);
                } else if (msg.recordSeq == this._processingRecord) {
                    if (trackBlockGroupManager.isBuildGroupRecording())
                        trackBlockGroupManager.resetBuildGroupRecordDelay(500);
                    else
                        trackBlockGroupManager.beginBuildGroupRecord(500);
                } else {
                    if (trackBlockGroupManager.isBuildGroupRecording())
                        trackBlockGroupManager.endBuildGroupRecord();
                    this._processingRecord = msg.recordSeq;
                    trackBlockGroupManager.beginBuildGroupRecord(500);
                }
                
            } else if (has("trackGroup") && trackBlockGroupManager && trackBlockGroupManager.isBuildGroupRecording()) {
                trackBlockGroupManager.endBuildGroupRecord();
                delete this._processingRecord;
            }
            var editor = pe.lotusEditor;
            var doc = editor.document;
            var msgModel = null;
            this.isFromUndoRedo = isFromUndoRedo;

            var target;
            switch (msg.mc) {
                case msgCat.Style:
                    msgModel = editor.styles;
                    break;
                case msgCat.List:
                    msgModel = editor.number;
                    break;
                case msgCat.Setting:
                    msgModel = editor.setting;
                    break;
                case msgCat.Relation:
                    msgModel = editor.relations;
                    break;
                case msgCat.Footnotes:
                case msgCat.Endnotes:
                    msgModel = editor.relations;
                    break;
                default:
                    msgModel = doc;
                    break;
            }

            var selection = pe.lotusEditor.getSelection();

            selection.store(msg);
            this.cmdId = msg.cmdId;
            var ranges = selection.getRanges();
            this.rootView = ranges.length > 0 ? ranges[0].rootView : null;
            if (!this.isFromUndoRedo) {
                this.cursorRanges = ranges;
            }
            var updateRoot = null;
            for (var i = 0; i < msg.updates.length; i++) {
                //var isManipulated = false;
                var act = msg.updates[i];
                if (msg.type == msgType.Selection) {
                    if (act.t == actType.SelectionChanged) {
                        // console.info("----Selection Changed received " + msg.orphan);
                        pe.lotusEditor.indicatorManager.updateUserSelections(msg.user_id, msg.mc, msg.orphan, act.ranges);
                    }
                } else if (msg.mc == msgCat.Style) {
                    if (msg.type == msgType.Style) {
                        if (act.t == actType.AddStyle)
                            act.c && pe.lotusEditor.createStyle(act.styleId, act.c);
                        else if (act.t == actType.SetAttribute) {
                            var styleAtt = act.st;
                            if (styleAtt) {
                                var styleId = act.styleId;
                                if (!styleId)
                                    return;

                                var type = styleAtt.type;
                                if (!type) return;
                                if (type == "numPr") {
                                    var style = pe.lotusEditor.getRefStyle(styleId);
                                    style && style.setList(styleAtt.numId, styleAtt.ilvl);
                                    //								style && style.updateReferers();
                                    setTimeout(function() {
                                        style && style.updateReferers();
                                    }, 0);
                                }
                            }

                        }
                    }
                } else if (msg.type == msgType.KeyMessage) {
                    // KeyMessage will use different model to handle message.	
                    switch (act.t) {
                        case actType.InsertKey:
                            if (msgModel.insertRelation)
                                msgModel.insertRelation(act.k, act.c);
                            else
                                console.error("Can't find the msgModel.insertRelation function.");
                            break;
                        case actType.DeleteKey:
                            if (msgModel.deleteRelation)
                                msgModel.deleteRelation(act.k);
                            else
                                console.error("Can't find the msgModel.deleteRelation function.");
                            break;
                        case actType.ReplaceKey:
                            this.replaceKeyHandler(msgModel, act, isFromUndoRedo);
                            break;
                        case actType.InsertArray:
                            if (act.path == "comments") {
                                if (msgModel.insertComment) {
                                    msgModel.insertComment(act.k, act.c);
                                }
                            }
                            break;
                        case actType.DeleteArray:
                            if (act.path == "comments") {
                                if (msgModel.delComment) {
                                    msgModel.delComment(act.k);
                                }
                            }
                            break;
                        default:
                            throw "KeyMessage include illeagle message action!";

                    }
                } else if (msg.type == msgType.List) {
                    switch (act.t) {
                        case actType.AddList:
                            // Check if the editor has the numbering first. Avoid add twice for undo/redo or message from other clients.
                            if (!editor.number.getAbsNum(act.nid)) {
                                var abstractNum = new abstractNumModule(act.cnt);
                                editor.number.addList(act.nid, act.aid, abstractNum);
                                var imgs = act.imgs;
                                if (imgs) {
                                    for (var id in imgs) {
                                        editor.number.addImg(id, imgs[id]);
                                    }
                                }
                            }
                            break;
                        case actType.IndentList:
                            this.indentList(pe.lotusEditor.lists, act);
                            break;
                        case actType.ChangeType:
                            this.changeNumbering(pe.lotusEditor.lists, act);
                            break;
                        case actType.ChangeStart:
                            this.changeStart(pe.lotusEditor.lists, act);
                            break;
                    }
                } else if (msg.type == msgType.Task) {
                    if (pe.lotusEditor.getTaskHdl())
                        pe.lotusEditor.getTaskHdl().processMessage(act);
                } else if (msg.type == msgType.Section) {
                    switch (act.t) {
                        case actType.InsertSection:
                            this.insertSection(msgModel, act);
                            break;
                        case actType.DeleteSection:
                            this.deleteSection(msgModel, act);
                            break;
                    }
                } else if (msg.type == msgType.Setting) {
                    var setting = pe.lotusEditor.setting;
                    var sectTools = SectionTools;
                    if (!setting)
                        console.log("msg handler in setting: cannot find setting.");

                    switch (act.t) {
                        case constants.ACTTYPE.AddEvenOdd:
                            if (!sectTools.isHFDiffOddEvenPages())
                                sectTools.setHFOddEvenPages();
                            break;
                        case constants.ACTTYPE.RemoveEvenOdd:
                            if (sectTools.isHFDiffOddEvenPages())
                                sectTools.setHFOddEvenPages();
                            break;
                        case constants.ACTTYPE.DocsTrackChangeOn:
                            trackChange.enableTrack(act.d, true);
                            break;
                        case constants.ACTTYPE.DocsTrackChangeOff:
                        	trackChange.disableTrack(true);
                            break;
                    }
                }

                if (act.tid == "footnotes" || act.tid == "endnotes") {
                    target = msgModel.byId(act.tid);
                    switch (act.t) {
                        case actType.InsertElement:
                            if (act.tid == "footnotes") {
                                var m = new FootNote(act.cnt);
                                target.insertFootnote(m, act.idx);
                                break;
                            }
                            if (act.tid == "endnotes") {
                                var m = new EndNote(act.cnt);
                                target.insertEndnote(m, act.idx);
                                break;
                            }
                        case actType.DeleteElement:
                            if (act.idx < 0) // The idx change to transformed to -1.
                                break;
                            if (act.tid == "footnotes") {
                                target.deleteFootnote(act.idx);
                                this.deleteNote();
                                break;
                            }
                            if (act.tid == "endnotes") {
                                target.deleteEndnote(act.idx);
                                this.deleteNote();
                                break;
                            }
                    }

                } else if (msgModel == doc || msgModel == editor.relations) {
                    //for document content and header,footer, footnote, endnote
                    if (act.t == actType.UpdateComment) {
                        msgModel.updateComment(act.tid, act.idx, act.k, act.v);
                        continue;
                    }
                    if (!act.tid)
                        continue;
                    target = msgModel.byId(act.tid);
                    if (!target)
                    {
                    	if(isFromUndoRedo)
                    		act.unProcessed = true;
                        continue;
                    }
                    else if (isFromUndoRedo && this.checkTrackConflictObj(target, act))
                    	continue;
                    updateRoot = updateRoot || (target.getUpdateRoot && target.getUpdateRoot()) || target.parent;
                    switch (act.t) {
                        case actType.InsertText:
                            this.insertText(target, act);
                            break;
                        case actType.DeleteText:
                            this.deleteText(target, act);
                            break;
                        case actType.InsertElement:
                            updateRoot = target;
                            this.insertElement(target, act);
                            break;
                        case actType.DeleteElement:
                            updateRoot = target;
                            if (act.idx >= 0) // The index can be transformed to -1. For delete & delete element. 
                                this.deleteElement(target, act);
                            break;
                        case actType.SetAttribute:
                            this.setAttribute(target, act);
                            break;
                        case actType.SetTextAttribute:
                            this.setTextAttribute(target, act);
                            break;
                        case actType.DeleteSection:
                            this.deleteSection(msgModel, act);
                            break;
                        case actType.InsertSection:
                            this.insertSection(msgModel, act);
                            break;
                        case actType.AddComment:
                            this.addComment(target, act);
                            break;
                        case actType.SetParaTask:
                            this.SetParaTask(target, act);
                            break;
                        case actType.SetTableTask:
                            this.SetParaTask(target, act);
                            break;
                        case actType.InsertRow:
                            this.insertRow(target, act);
                            break;
                        case actType.DeleteRow:
                            this.deleteRow(target, act);
                            break;
                        case actType.InsertColumn:
                            this.insertColumn(target, act);
                            break;
                        case actType.DeleteColumn:
                            this.deleteColumn(target, act);
                            break;
                        case actType.MergeCells:
                            this.mergeCells(target, act);
                            break;
                        case actType.SplitCells:
                            this.splitCells(target, act, isFromUndoRedo);
                            break;
                    }
                }
            }

            // The header footer message need update from update root
            if (updateRoot) {
                if (updateRoot.modelType != "toc")
                    updateRoot && updateRoot.update && updateRoot.update(); // TODO need profile			
            }

            //		if( isFromUndoRedo && this.cursorRanges && lastMsg ){
            //			this.mergeRanges();
            //			editor.getSelection().selectRangesBeforeUpdate( this.cursorRanges );
            //		}else 
            if (!isFromUndoRedo) {
                // Defect 39362.  When apply message changed the range, then user insert text will get old range.
                if (this.cursorRanges && this.cursorRanges != selection.getRanges())
                    selection.selectRangesBeforeUpdate(this.cursorRanges);
                selection.restoreBeforeUpdate();
            }

            if (has("trackGroup") && trackBlockGroupManager && msg.recordSeq && msg.isLastRecord && trackBlockGroupManager.isBuildGroupRecording()) {
                trackBlockGroupManager.endBuildGroupRecord();
                delete this._processingRecord;
            }
            doc.update(); //only document can update now
            pe.lotusEditor.updateManager.update();

            trackChange.resume();
        },
        checkTrackConflictObj: function(target, act) {
        	if(ModelTools.inDelTable(target))
        	{
        		act.unProcessed = true;
        		return true;
        	}
        	if(ModelTools.isTable(target) && target.isTrackDeleted())
        	{
        		if(act.t == constants.ACTTYPE.SetAttribute && act.at && act.at.type && act.at.type == "tblCh")
        			return false;

       			act.unProcessed = true;
        		return true;
        	}
        	return false;
        },
        indentList: function(lists, act) {
            var list = lists[act.nid];
            var changedValue = toolsModule.toPtValue(act.cnt.leftChange);
            var numDefinitions = list.absNum.getNumDefinition();
            array.forEach(numDefinitions, function(lvl) {
                var pPr = lvl.getParaProperty();
                oldLeftValue = pPr.getIndentLeft();
                pPr.setIndentLeft(oldLeftValue + changedValue + "pt");
                pPr.getMessage();
            });

            list.reset();
        },

        changeNumbering: function(lists, act) {
            var list = lists[act.nid];

            var defStr = "";
            if (act.cnt.numFmt)
                defStr += '"numFmt":{"val":"' + act.cnt.numFmt + '"}';
            if (act.cnt.lvlText) {
                if (defStr.length > 0) defStr += ',';
                defStr += '"lvlText":{"val":"' + act.cnt.lvlText + '"}';
            }
            if (act.cnt.lvlPicBulletId) {
                if (defStr.length > 0) defStr += ',';
                defStr += '"lvlPicBulletId":{"val":"' + act.cnt.lvlPicBulletId + '"}';
            }

            if (act.cnt.lvlJc) {
                if (defStr.length > 0) defStr += ',';
                defStr += '"lvlJc":{"val":"' + act.cnt.lvlJc + '"}';
            }

            var numDefJson = JSON.parse("{" + defStr + "}");
            var numDefintion = new numberingDefinition(numDefJson);

            if (act.cnt.rPr)
                numDefintion.rPr = lang.clone(act.cnt.rPr);

            list.changeListStyle(numDefintion, act.lvl);
        },

        changeStart: function(lists, act) {
            var list = lists[act.nid];
            list.setNumberingStart(act.cnt.val, act.lvl);
        },

        setAttribute: function(target, act) {
            var styleAtt = act.st;
            var noNeedSetCursor = (this.cmdId && this.cmdId.indexOf("undo_") == 0);
            if (styleAtt) {
                var type = styleAtt.type;
                if (target.modelType == constants.MODELTYPE.TABLE && styleAtt.bidiVisual) {
                	target.tableProperty.direction = styleAtt.bidiVisual;
                	target.markFlipTable();
                	return;
                }
                if (!type) return;
                if (type == "backgroundColor") {
                    target.setBackgroundColor(styleAtt.backgroundColor || 'none'); // keep same with the method getAlign in ParagraphProperty.js
                } else if (type == "align") {
                    target.setAlignment(styleAtt.align || 'left'); // keep same with the method getAlign in ParagraphProperty.js
                } else if (type == "pageBreakBefore") {
                    target.setPageBreakBefore(styleAtt.pageBreakBefore);
                } else if (type == "keepLines") {
                    target.setKeepLines(styleAtt.keepLines);
                } else if (type == "widowControl") {
                    target.setWidowControl(styleAtt.widowControl);
                } else if (type == "direction") {
                    target.setDirection(styleAtt.direction || 'none');
                } else if (type == "border") {
                    target.setBorder(styleAtt.border || 'none');
                } else if (type == "linespacing") {
                    target.setLineSpacing(styleAtt.line || 'none', styleAtt.lineRule || 'none');
                } else if (type == "space") {
                    if (styleAtt.before) {
                        target.directProperty.setSpaceBefore(styleAtt.before);
                        target.markDirty();
                    }
                    if (styleAtt.after) {
                        target.directProperty.setSpaceAfter(styleAtt.after);
                        target.markDirty();
                    }
                } else if (type == "style") {
                    if (!styleAtt.styleId || styleAtt.styleId == "none")
                        target.removeStyle(target.styleId);
                    else
                        target.addStyle(styleAtt.styleId);
                } else if (type == "indent") {
                    if (styleAtt.specialvalue || styleAtt.specialvalue == 0)
                        target.setIndentSpecialTypeValue(styleAtt.specialkey, styleAtt.specialvalue);

                    if (styleAtt.left || styleAtt.left == 0)
                        target.setIndent(styleAtt.left, true); // From undo
                } else if (type == "indentRight") {
                    target.setIndentRight(styleAtt.right);
                } else if (type == 'numPr') {
                    var list = target.list;
                    if ((styleAtt.numId == "") || (styleAtt.numId && (styleAtt.numId == 'none'))) // || styleAtt.numId == -1 ))
                        target.removeList(styleAtt.numId == "none");
                    else if (!styleAtt.numId && styleAtt.ilvl == -1)
                        target.removeList(true);
                    else if (!styleAtt.numId)
                        target.setListLevel(styleAtt.ilvl, true);
                    else {
                        target.setList(styleAtt.numId, styleAtt.ilvl);
                        list = target.list;
                    }
                } else if (type == "pt") // pt is Paragraph text property.
                {
                    var prop = target.paraTextProperty;
                    if (prop) {
                        prop.fromJson(lang.clone(styleAtt.s || {}));
                        if (target.isList())
                            target.markReset();
                        if (target.text == "") {
                            //empty paragraph
                            target.hints.forEach(function(hint) {
                                var textProp = hint.textProperty;
                                if (textProp) {
                                    textProp.fromJson(lang.clone(styleAtt.s || {}));
                                    hint.markDirty();
                                }
                            });
                            target.markDirty();
                        }
                    }

                } else if (type == "cellColor") {
                    target.changeStyle(styleAtt.t, styleAtt.v);
                } else if (type == "cnSt") {
                    target.changeCSSStyleByValue(styleAtt.v);
                    target.markReset();
                    target.update();
                    //				console.log("set condition style");
                } else if (type == "secId") {
                    // update insert new section
                    var views = target.getRelativeViews("rootView");
                    var paraView = views && views.getFirst();
                    noNeedSetCursor = false;
                    if (styleAtt.secId) {
                        var result = target.setSectionId(styleAtt.secId);
                        if (target.isInTCGroup && target.isInTCGroup() && result === true) {
                            views = target.parent.getRelativeViews('rootView');
                            paraView = views && views.getFirst();
                        }
                        if (paraView)
                            topic.publish(constants.EVENT.UPDATEINSERTSECTION, paraView, styleAtt.secId);
                    } else {
                        // remove section
                        var originSecId = target.directProperty.getSectId();
                        var result = target.setSectionId(null);
                        if (target.isInTCGroup && target.isInTCGroup() && result === true) {
                            views = target.parent.getRelativeViews('rootView');
                            paraView = views && views.getFirst();
                        }
                        if (paraView)
                            topic.publish(constants.EVENT.UPDATEDELETESECTION, paraView, originSecId);
                    }
                }
            }
            var attr = act.at;
            var cursorNoMerge = false;
            if (attr) {
                var type = attr.type;

                if (target.modelType == constants.MODELTYPE.LINK && (attr.src || attr.anchor)) {
                    (attr.src || attr.src == "") && (target.src = attr.src);
                    (attr.anchor || attr.anchor == "") && (target.anchor = attr.anchor);

                    target.markDirty();
                    target.paragraph.markDirty();
                } else if (ModelTools.isImage(target)) {
                    // transform
                    if (attr.transform) {
                        if (attr.transform.anchor)
                            target.setAnchor(attr.transform.anchor);
                        else if (attr.transform.inline)
                            target.setInline(attr.transform.inline);
                    }

                    // size
                    if (attr.size)
                        target.setSize(attr.size);

                    // Description
                    if (attr.descr)
                        target.setDescription(attr.descr);

                    // Description
                    if (attr.url)
                        target.setUrl(attr.url);

                    // wrap type
                    if (attr.wrapType)
                        target.setAnchorWrapType(attr.wrapType);

                    // square wrap text
                    if (target.modelType == constants.MODELTYPE.SQIMAGE && attr.wrapText)
                        target.setWrapText(attr.wrapText);
                } else if (ModelTools.isTextBox(target)) {
                    if (attr.size)
                        target.setSize(attr.size.extent, attr.size.spAutoFit, attr.size.autoWrap);

                    if (target.modelType == constants.MODELTYPE.SQTXBX && attr.wrapText)
                        target.setWrapText(attr.wrapText);
                } else if (ModelTools.isCanvas(target)) {
                    if (attr.size)
                        target.setSize(attr.size);
                } else if (target.modelType == constants.MODELTYPE.TABLE || target.modelType == constants.MODELTYPE.CELL || target.modelType == constants.MODELTYPE.ROW) {
                    console.log("TO DO : change attr of table...");
                    cursorNoMerge = true;
                    if (attr.rowSpan) {
                        target.markRowSpanChanged(attr.rowSpan);
                    }

                    if (attr.colSpan) {
                        target.markColSpanChanged(attr.colSpan);
                    }

                    if (attr.cols && target.modelType == constants.MODELTYPE.TABLE) {
                        target.changeCols(attr.cols);
                    }
                    if (attr.rowH && target.modelType == constants.MODELTYPE.ROW) {
                        this.resizeHeight(target, attr.rowH);
                    }
                    if (attr.tblHeader && target.modelType == constants.MODELTYPE.ROW) {
                        this.setRepeatHead(target, attr.tblHeader);
                    }
                    if (attr.border && target.modelType == constants.MODELTYPE.CELL) {
                        this.changeCellBorder(target, attr.border);
                        // this.setCursorEditPosition( target, true );
                    }
                } else if (ModelTools.isBookMark(target) && attr.name) {
                    target.name = attr.name;
                    target.markDirty();
                    target.paragraph.markDirty();
                }

                
                if (type == "rPrCh") {
                    noNeedSetCursor = true;
                    // if ("ch" in attr) {
                        if (target.setRPrCh) {
                            target.setRPrCh(attr.ch);
                        } else {
                            target.rPrCh = attr.ch;
                            target.markReset();
                        }
                    // }
                } else if (type == "pPrCh") {
                    if ("ch" in attr) {
                        if (target.setPPrCh) {
                            target.setPPrCh(attr.ch || []);
                        } else {
                            target.pPrCh = attr.ch || [];
                            target.markReset();
                        }
                    }
                } else if (type == "tcPrCh") {
                    noNeedSetCursor = false;
                    if ("ch" in attr) {
                        target.tcPrCh = attr.ch || [];
                        target.markDirty();
                    }
                    cursorNoMerge = true;
                } else if (type == "trCh"){
                    noNeedSetCursor = false;
                    if ("ch" in attr) {
                        target.ch = attr.ch || [];
                        if(target.isTrackDeleted())
                        	target.triggerTrackInfoUpdate();
                        var tbl = target.parent;
                        tbl.refreshContainer();
                        tbl.markReset();
                    }
	            } else if (type == "tblCh"){
                    if ("ch" in attr) {
                        if (target.setCh) {
                            target.setCh(attr.ch);
                        }else {
                            target.ch = attr.ch || [];
                            if(target.isTrackDeleted())
                            {
                                target.triggerTrackInfoUpdate();
                                target.resetView(true);
                                target.markDirty();
                            }
                        }
                    }
	            } else if ("ch" in attr) {
                    noNeedSetCursor = false;
                    if (target.setCh) {
                        target.setCh(attr.ch || []);
                    } else {
                        target.ch = attr.ch || [];
                        target.markReset();
                    }
                } else if ("rPrCh" in attr) {
                    if (target.setRPrCh) {
                        target.setRPrCh(attr.rPrCh || []);
                    } else {
                        target.rPrCh = attr.rPrCh || [];
                        target.markReset();
                    }
                }
            }
            if (!noNeedSetCursor)
                this.setCursorEditPosition(target, true, type != "indent" && type != "indentRight" && type != "align" && type != 'numPr' && !cursorNoMerge);
        },
        setTextAttribute: function(target, act) {
            if (target.setTextAttribute) {
                var fixCursor = target.setTextAttribute(act);
                this.addCursorRange(fixCursor.target, fixCursor.idx, fixCursor.target, fixCursor.idx + fixCursor.len);
                fixCursor.target.markDirty();
                return;
            }
            //set style
            if (act.len == 0) // OT with delete element will change length to 0.
                return;
            var runs;
            if (ModelTools.isEmptyParagraph(target))
                runs = target.hints;
            else
                runs = target.splitRuns(act.idx, act.len);
            runs.forEach(function(run) {
                if (act.st)
                    run.setStyle(act.st);
                else if (act.at) {
                    if ("ch" in act.at)
                        run.ch = act.at.ch || [];

                    if ("rPrCh" in act.at)
                        run.rPrCh = act.at.rPrCh || [];
                        
                    run.markDirty();
                }
            });
            this.addCursorRange(target, act.idx, target, act.idx + act.len);
            //merge runs if need 
            target.markDirty();
        },
        SetParaTask: function(target, act) {
            //set taskid
            target.setTask(act.taskId);
            //target.markDirty();
        },
        insertSection: function(msgModel, act) {
            var setting = pe.lotusEditor.setting;
            if (!setting)
                console.log("msg handler insert section: cannot find setting.");

            var sect = new Section(act.cnt);
            setting.insertSection(sect, act.idx);
        },

        deleteSection: function(msgModel, act) {
            pe.lotusEditor.setting.deleteSection(act.tid);
        },

        addComment: function(target, act) {
            if (act.len == 0 && !act.cpid && !act.rid)
                return;

            if (!act.cpid)
                pe.lotusEditor.relations.commentService.addComment2ParaModel(target, act.cid, act.idx, act.idx + act.len, act.rid);
            var xcomment = pe.lotusEditor.relations.commentService.getXCommentItem(act.cid);

            if (xcomment.getItemCount() <= 0)
                return;

            // then to sync with comment sidebar,
            // here should call pe.scene.getSession().commentsProxy.msgReceived() with action="add" or "append" to sync the comments in sidebar
            var item = xcomment.getItem(0);
            var msg = {};

            if (!act.cpid) { // parent comment
                msg.isCtrl = true;
                msg.type = "comments";
                msg.action = "add";
                msg.id = act.cid;
                msg.index = xcomment.index;
                msg.data = xcomment;

                var msgList = [];
                msgList.push(msg);
                //pe.scene.session.sendMessage(msgList);
                pe.scene.getSession().commentsProxy.msgReceived(msg);

                //	this.addCursorRange( target, act.idx, target, act.idx + act.len );
                target.markDirty();
            } else { // append comment
                msg.isCtrl = true;
                msg.type = "comments";
                msg.action = "append";
                msg.id = act.cpid;
                msg.data = item;
                item.id = act.cid;

                var msgList = [];
                msgList.push(msg);
                //pe.scene.session.sendMessage(msgList);
                pe.scene.getSession().commentsProxy.msgReceived(msg);
            }
        },
        insertText: function(target, act) {
            if (act.len == 0 && act.cnt.c && act.cnt.c.length > 0) // OT with delete element will change length to 0.
                return;
            target.insertRichText(lang.clone(act.cnt), act.idx);
            if (this.cmdId == "undo_enter" || this.cmdId == "undo_pagebreak" || this.cmdId == "deleteKey" || this.cmdId == "backSpace")
            //merge paragraphs
                this.addCursorRange(target, act.idx);
            else if (this.cmdId == "undo_deleteAtCursor")
                this.addCursorRange(target, act.idx);
            else if (this.cmdId == "undo_backSpace")
                this.addCursorRange(target, act.idx + act.cnt.c.length);
            else if (act.cnt.c.length > 0)
                this.addCursorRange(target, act.idx, target, act.idx + act.cnt.c.length);
        },

        deleteText: function(target, act) {
            if (act.oid && act.len == 0) {
                if (target.deleteTextByOid) {
                    target.deleteTextByOid(act.oid);
                } else {
                    var obj = target.byId(act.oid);
                    if (obj) {
                        target.removeObject(obj);
                        target.markDirty();
                    }
                }
            } else {
                target.deleteText(act.idx, act.len);
                if (act.len > 0)
                    this.addCursorRange(target, act.idx);
            }
        },

        deleteElement: function(target, act) {
            var index = act.idx;
            var element = target.getByIndex(index, true),
                obj;
            if (!element)
                return;
            while (element && element.parent && element.parent != target) {
                // element is in a block group
                element = element.parent;
            }
            var offset = index - target.indexOf(element, true);
            try {
                if (this.cmdId == "undo_enter" || this.cmdId == "deleteAtCursor") {
                    obj = target.previousChild(element);
                    if (obj)
                        this.setCursorEditPosition(obj, false);
                } else {
                    obj = target.nextChild(element);
                    if (obj) {
                        this.setCursorEditPosition(obj, true);
                    } else {
                        obj = target.previousChild(element);
                        if (obj)
                            this.setCursorEditPosition(obj, false);
                    }
                }
            } catch (e) {
                console.error("Set cursor position error in delete element: " + e);
            }
            if (!element.getModelLen || element.getModelLen() == 1){
                var next = element.next();
                target.remove(element);
                if (next && next.buildGroup)
                    next.buildGroup();
            }
            else {
                // element is in a block group
                element.deleteElementAt(offset);
                element.markDirty();
            }
        },

        insertElement: function(target, act) {
            try {
                var m = global.modelFac.createModel(lang.clone(act.cnt), target);
                var container = target.container;
                var index = 0;
                index = act.idx;
                if (index < 0)
                    return;

                var obj = container.getByAdapteIndex(index);
                while(obj && obj.parent && obj.parent != target) {
                    // element is in a block group
                    obj = obj.parent;
                }
                var offset = obj ? index - container.adapteIndexOf(obj) : 0;
                
                if (target.insertBefore) {
                    if (!obj) {
                        // defect 44657, when insert to the end of doc, we should reset the last para to reset the line space.
                        var lastObj = container.getLast();
                        if (lastObj && ModelTools.isParagraph(lastObj))
                            lastObj.markReset();
                    }

                    if(!offset || !obj){
                        target.insertBefore(m, obj);
                        if (m && m.buildGroup)
                            m.buildGroup();
                        if (obj && obj.buildGroup)
                            obj.buildGroup();
                    }
                    else // element is in a block group
                        obj.insertElementAt(offset, m);
                    var mTool = ModelTools;
                    // Reset next paragraph ,Defect 48135, reference from Enter key
                    if (mTool.isParagraph(obj) && mTool.isParagraph(m))
                        obj.markReset();

                    // Reset previous paragraph
                    var next = mTool.getPrev(m, null, false);
                    if (mTool.isParagraph(next))
                        next.markReset();

                    if (this.cmdId == "undo_deleteKey") {
                        this.addCursorRange(m, 0, m, ModelTools.getLength(m));
                    } else if (target.modelType == constants.MODELTYPE.TOC) {
                        //update toc
                        this.addCursorRange(target, 0, target, ModelTools.getLength(target));
                    } else
                        this.setCursorEditPosition(m, true);
                } else {
                    console.error('target.insertBefore must be a function');
                }
            } catch (e) {
                console.error('wrong insertElement msg: ' + e);
            }

        },

        replaceKeyHandler: function(msgModel, act, isFromUndoRedo) {
            var path = act.path;
            if (!path) {
                console.log("why no path?");
                return;
            }

            if (path == constants.KEYPATH.Section) {
                var targetSection = msgModel.getSection(act.k);
                if (targetSection) {
                    var oldContentWidth = targetSection.pageSize.w - targetSection.pageMargin.left - targetSection.pageMargin.right;
                    var oldColNum = targetSection.cols && targetSection.cols.num || 1;

                    targetSection.init(act.c);

                    var newContentWidth = targetSection.pageSize.w - targetSection.pageMargin.left - targetSection.pageMargin.right;
                    var newColNum = targetSection.cols && targetSection.cols.num || 1;
                    var relayoutBlock = oldContentWidth != newContentWidth || oldColNum != newColNum;

                    //update the render
                    if (path == constants.KEYPATH.Section && (act.c.pgMar || act.c.pgSz)) {
                        // check cursor range
                        try {
                            var page = null;
                            var selection = pe.lotusEditor.getSelection();
                            if (selection) {
                                var ranges = selection.getRanges();
                                var range = ranges && ranges[0];
                                if (range) {
                                    var startView = range.getStartView();
                                    if (startView) {
                                        if (startView.obj) {
                                            startView = startView.obj;
                                        }
                                        vTools = ViewTools;
                                        page = vTools.getPage(startView);
                                    }
                                }
                            }

                            if (!page) {
                                var scrollTop = pe.lotusEditor.getScrollPosition();
                                page = pe.lotusEditor.layoutEngine.rootView.getScrollPage(scrollTop);
                            }

                            var that = this;
                            var enterEditor = function() {
                                pe.lotusEditor.undoManager.enterUndoRedo(); // Avoid send message.

                                editShell.enterEditorMode(null, x, y);

                                pe.lotusEditor.undoManager.exitUndoRedo();

                                editShell.endSelect(null, x, y);
                                that.cursorRanges = null;
                                that.rootView = pe.lotusEditor.layoutEngine.rootView;
                            };


                            if (page) {
                                var editShell = pe.lotusEditor.getShell();
                                var x = page.getLeft();
                                var y = page.getTop();
                                var header = page.getHeader();
                                var footer = page.getFooter();
                                var headerType = page.getHeaderType();
                                var footerType = page.getFooterType();

                                var targetHeader = targetSection.getHeaderFooterByType(headerType);
                                var targetFooter = targetSection.getHeaderFooterByType(footerType);

                                if (isFromUndoRedo || pe.lotusEditor.isHeaderFooterEditing()) {
                                    if (header && !targetHeader || footer && !targetFooter) {
                                        //console.log("message section enterEditorMode:x=" + x + ",y=" + y);
                                        enterEditor();
                                    } else if (!header && targetHeader) {
                                        SectionTools.updateHFSelection(true, page.pageNumber);
                                    } else if (!footer && targetFooter) {
                                        SectionTools.updateHFSelection(false, page.pageNumber);
                                    } else {
                                        console.log("!!!! not sec edit mode when apply section undo/redo msg");
                                    }
                                }

                                var selection = pe.lotusEditor.getSelection();
                                var ranges = selection.getRanges();
                                var range = ranges && ranges[0];
                                if (range) {
                                    var sMod = range.getStartModel();
                                    var eMod = range.getEndModel();
                                    this.addCursorRange(sMod.obj, sMod.index, eMod.obj, eMod.index);
                                }
                            }
                        } catch (e) {
                            console.error("error in section replaceKeyHandler():" + e);
                        }

                        // update linked sections
                        var setting = pe.lotusEditor.setting;
                        // if there is continuous section, the update will aotomatically update the rest sections
                        var preSection = setting.getPreSection(targetSection) ? setting.getPreSection(targetSection) : setting.getFirstSection();
                        if (setting.isContinuousLayout(preSection))
                            pe.lotusEditor.layoutEngine.rootView.updateSection(targetSection, relayoutBlock);
                        else {
                                var changedSec = setting.getSectionByIndex(0);
                                var rootView = pe.lotusEditor.layoutEngine.rootView;
                                if (rootView && rootView.updateSection && changedSec) {
                                    rootView.updateSection(changedSec, relayoutBlock,true);
                                }
                        }
                    }
                }
            }
        },
        insertRow: function(table, act) {
            var newRow = new Row(act.cnt, table);
            var fixCells = act.fc;
            var target = null;
            var idx = act.idx - 1;
            if (idx >= 0) {
                target = table.rows.getByIndex(idx);
            }
            table.insertRow(newRow, target, fixCells);
            table.update(true);
            this.setCursorEditPosition(newRow, true);
        },
        deleteRow: function(table, act) {
            var fixCells = act.fc;
            var target = null;
            var idx = act.idx;
            target = table.rows.getByIndex(idx);
            var cursorRow = target.next() || target.previous();
            // TODO: A simple but not high-performance way to fix defect 54329
            table.deleteRow(target, fixCells, true);
            // fix 54606
            table.update(true);
            if (!this.isFromUndoRedo)
            	this._removeRowFromCursorRanges(target);
            else
            	this.setCursorEditPosition(cursorRow, true);
        },
        _getCursorCell: function(colIdx, table) {
            var sel = pe.lotusEditor.getSelection();
            var rowIdx = 0;
            var tableMatrix = table.getTableMatrix();
            if (sel) {
                var range = sel.getRanges()[0];
                var cursorRow = ModelTools.getRow(range.getStartModel().obj);
                if (cursorRow && cursorRow.parent == table) {
                    rowIdx = cursorRow.getRowIdx();
                }
            }
            return tableMatrix.getCell(rowIdx, colIdx) || tableMatrix.getCell(rowIdx, colIdx - 1) || tableMatrix.getCell(rowIdx, colIdx + 1);
        },
        insertColumn: function(table, act) {
            var idx = act.idx;
            var cells = act.cnt;
            var fixCells = act.fc;
            table.insertColumn(idx, cells, fixCells);
            table.update(true);
            var cursorObj = this._getCursorCell(idx, table) || table;
            this.setCursorEditPosition(cursorObj, true);
        },
        deleteColumn: function(table, act) {
            var idx = act.idx;
            var cells = act.cnt;
            var fixCells = act.fc;
            table.deleteColumn(idx, cells, fixCells);
            table.update(true);
            var cursorObj = this._getCursorCell(idx, table) || table;
            this.setCursorEditPosition(cursorObj, true);
        },
        mergeCells: function(table, act) {
            var startColIdx = act.sc;
            var startRowIdx = act.sr;
            var newRowSpan = act.nr;
            var newColSpan = act.nc;
            table.mergeCell(startColIdx, startRowIdx, newRowSpan, newColSpan);
            table.update();
            var tableMatrix = table.getTableMatrix();
            // check borders (fix defect 54269)
            if(startColIdx > 0)
                for(var i = 0; i < newRowSpan; i++){
                    var cell = tableMatrix.getCell(startRowIdx + i, startColIdx - 1);
                    cell && cell.markCheckBorder();
                }
            if((startColIdx + newColSpan) < tableMatrix.length2())
                for(var i = 0; i < newRowSpan; i++){
                    var cell = tableMatrix.getCell(startRowIdx + i, startColIdx + newColSpan);
                    cell && cell.markCheckBorder();
                }
            if(startRowIdx > 0)
                for(var j = 0; j < newColSpan; j++){
                    var cell = tableMatrix.getCell(startRowIdx - 1,startColIdx + j);
                    cell && cell.markCheckBorder();
                }
            if((startRowIdx + newRowSpan) < tableMatrix.length())
                for(var j = 0; j < newColSpan; j++){
                    var cell = tableMatrix.getCell(startRowIdx + newRowSpan,startColIdx + j);
                    cell && cell.markCheckBorder();
                }
            var cursorCell = tableMatrix.getCell(startRowIdx, startColIdx) || table;
            this.setCursorEditPosition(cursorCell, true);
        },
        splitCells: function(table, act, isFromUndoRedo) {
            var startColIdx = act.sc;
            var startRowIdx = act.sr;
            var newRowSpan = act.nr;
            var newColSpan = act.nc;
            var cells = act.cnt;
            table.splitCell(startColIdx, startRowIdx, newRowSpan, newColSpan, cells);
            table.update();
            var tableMatrix = table.getTableMatrix();
            var cursorCell = tableMatrix.getCell(startRowIdx, startColIdx);
            if(cursorCell && isFromUndoRedo)
            {
            	var msgs = [];
            	cursorCell.fixEmptyCell(msgs);
            	if(msgs.length >0)
            		act.appendProssMsg = msgs[0].msg.updates;
            }
            this.setCursorEditPosition((cursorCell || table), true);
        },
        resizeHeight: function(row, value) {
            var newH = Math.round(toolsModule.toPxValue(value));
            row.setHeight(newH);
            var table = row.parent;
            table.update();
        },
        changeCellBorder: function(cell, border) {
            var pro = cell.getProperty();
            pro.initBorder(border);
            delete pro._borderCache;
            cell.clearAllCache && cell.clearAllCache();
            cell.markCheckBorder && cell.markCheckBorder();
            var relatedCells = cell.getTable().getTableMatrix().fixBorderMatrix();
            array.forEach(relatedCells, function(rCell) {
                rCell.clearAllCache && rCell.clearAllCache();
                rCell.markCheckBorder && rCell.markCheckBorder();
                rCell.update();
            });
            cell.update();
        },
        setRepeatHead: function(row, value) {
            row.setTblHeaderRepeat(value);
        },
        deleteNote: function() {
            var shell = layoutEngine.editor.getShell();
            var mode = shell.getEditMode();
            var sel = pe.lotusEditor.getShell().getSelection();
            var target = null;
            if (mode == constants.EDITMODE.FOOTNOTE_MODE || mode == constants.EDITMODE.ENDNOTE_MODE) {
                var range = this.cursorRanges[0];
                var startView = range.getStartView();
                var page = ViewTools.getPage(startView.obj);
                if (!page) {
                    return;
                }
                var body = page.getLastBody();
                var c = body.textArea && body.textArea.getContainer();
                if (c && c.length() > 0) {
                    target = c.getFirst().model;
                } else {
                    target = ModelTools.getFirstChild(layoutEngine.rootModel, ModelTools.isParagraph, true);
                }
                var range = new Range({
                    obj: {}
                }, {
                    obj: {}
                });
                RangeTools.selectToEditStart(range, target);
                range.collapse(true);
                this.cursorRanges = [range];
            }

        }
    });

    for (var x in msgHandler)
        exports[x] = msgHandler[x];
});
