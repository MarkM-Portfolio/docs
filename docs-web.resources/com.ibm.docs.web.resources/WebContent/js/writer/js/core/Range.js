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
    "dojo/has",
    "dojo/_base/declare",
    "dojo/_base/array",
    "dojo/topic",
    "writer/common/RangeIterator",
    "writer/constants",
    "writer/util/SectionTools",
    "writer/util/ViewTools",
    "writer/msg/msgCenter",
    "writer/msg/msgHelper",
    "writer/track/trackChange",
    "writer/model/text/TrackDeletedObjs",
    "writer/global"
], function(has, declare, array, topic, RangeIterator, constants, SectionTools, ViewTools, msgCenter, msgHelper, trackChange, TrackDeletedObjs, g) {

    var Range = declare("writer.core.Range",
        null, {
            /*
             * start is an object with two members 'obj' and 'index', this is for view
             */
            _start: null,
            /*
             * end is an object with two members 'obj' and 'index', this is for view
             */
            _end: null,

            /**
             * _startModel is an object with two members 'obj' and 'index', this is for model
             */
            startModel: null,
            /**
             * _startModel is an object with two members 'obj' and 'index', this is for model
             */
            endModel: null,


            /*
             * rootView
             */
            rootView: null,

            //TODO: not all view range and model range match. So, we need to write a function to convert from view to model
            /**
             * view is an object with two members 'obj' and 'index'
             */
            _viewToModel: function(view) {
                if (!view || !view.obj) {
                    console.log("WARNING:unknown range start or end");
                    return null;
                }
                if (!view.obj.model) {
                    if (ViewTools.isLine(view.obj)) { //line, only in \r , empty line
                        var paraView = view.obj.getParent(),
                            m = paraView.model,
                            viewers = m.getViews(paraView.ownerId),
                            index = 0,
                            viewer = viewers && viewers.prev(paraView);

                        while (viewer) {
                            var line = viewer.lines.getLast();
                            var lastRun = line && line.container.getLast();
                            if (lastRun) {
                                index += lastRun.start + lastRun.len;
                                break;
                            } else {
                                index++;
                                viewer = viewers.prev(viewer);
                            }
                        }
                        return {
                            'obj': m,
                            'index': index
                        };
                    } else {
                        //          console.log("WARNING:unknown model for view");
                        return null;
                    }
                }
                try {
                    var obj = view.obj.model,
                        index = view.index || 0;
                    var viewers = view.obj.getViews();
                    if (viewers && obj.modelType == constants.MODELTYPE.TEXT) {
                        var viewer = viewers.prev(view.obj);
                        //          if(!viewers.contains(view.obj))
                        //              debugger;

                        while (viewer) {
                            index += viewer.len;
                            viewer = viewers.prev(viewer);
                        }
                    } else if (ViewTools.isCell(view.obj)) {
                        var index = view.index;
                        if (index == 0) {
                            var targetPara = view.obj.getContainer().getFirst();
                            var modelIndex = targetPara.container.getFirst().start;
                        } else {
                            var targetPara = view.obj.getContainer().getLast();
                            var lastRun = targetPara.container.getLast();
                            var modelIndex = lastRun.start + lastRun.len;
                        }
                        return {
                            "obj": targetPara.model,
                            "index": modelIndex
                        };
                    } else if (ViewTools.isRow(view.obj)) {
                        //temp solution. there is more better solution, it will be removed;
                        var allViewers = view.obj.getViews();
                        if (view.obj != allViewers.getFirst()) {
                            this.isSplited = true;
                        }
                        return {
                            "obj": view.obj.model,
                            index: view.index
                        };
                    } else if (ViewTools.isTable(view.obj)) {
                        var row = view.obj.getItemByIndex(view.index);
                        if (row) {
                            var index = row.model.getRowIdx();
                        } else {
                            var index = view.obj.model.rows.length();
                        }
                        return {
                            "obj": view.obj.model,
                            index: index
                        };
                    } else {
                        var viewer = viewers.prev(view.obj);
                        while (viewer) {
                            index += viewer.getContainer().length();
                            viewer = viewers.prev(viewer);
                        }
                    }
                } catch (e) {
                    console.error('model maybe have been deleted');
                }

                return {
                    'obj': obj,
                    'index': index
                };
            },

            _modelToView: function(pos) {
                return g.rangeTools.toViewPosition(pos.obj, pos.index, this.rootView);
            },
            /**
             * @param start
             * @param end
             * @param rootView
             */
            constructor: function(start, end, rootView) {
                if (!start || !end || !start.obj || !end.obj) {
                    console.error('wrong parameters in range\'s constructor');
                }
                //init rootView
                var vTools = ViewTools;
                if (rootView)
                    this.rootView = rootView; //use view of document instend model
                else if (start.obj.getViewType) {
                    if (vTools.isTextBox(start.obj)) {
                        this.rootView = vTools.getTextBox(start.obj.getParent()) || vTools.getDocument(start.obj);
                    } else {
                        this.rootView = vTools.getTextBox(start.obj) || vTools.getDocument(start.obj);
                    }
                } else
                    this.rootView = pe.lotusEditor.layoutEngine.rootView;

                if (start.obj.modelType)
                    this.setStartModel(start.obj, start.index);
                else
                    this.setStartView(start);

                if (end.obj.modelType)
                    this.setEndModel(end.obj, end.index);
                else
                    this.setEndView(end);

            },

            clone: function() {
                return new Range(this.startModel, this.endModel, this.rootView);
            },

            isCollapsed: function() {
                if (this._start && this._end)
                    return this._start.obj == this._end.obj && this._start.index == this._end.index;
                else
                    return this.startModel.obj == this.endModel.obj && this.startModel.index == this.endModel.index;
            },

            collapse: function(toStart) {
                if (toStart) {
                    this._end = this._start;
                    this.endModel = this.startModel;
                } else {
                    this._start = this._end;
                    this.startModel = this.endModel;
                }
            },

            getStartView: function() {
                if (!this._start && this.startModel) {
                    this._start = this._modelToView(this.startModel);
                    if (this._start && this._start.index == null)
                        this._start.index = 0;
                }
                return this._start;
            },
            getEndView: function() {
                if (!this._end && this.endModel)
                    this._end = this._modelToView(this.endModel);
                return this._end;
            },

            getRootView: function() {
                return this.rootView;
            },

            setRootView: function(rootView) {
                this.rootView = rootView;
            },

            setStartView: function(start, index) {
                if (index == null && start.obj) {
                    this._start = start;
                } else {
                    this._start = {
                        'obj': start,
                        'index': index
                    };
                }
                this.startModel = this._viewToModel(this._start);
            },

            setEndView: function(end, index) {
                if (index == null && end.obj) {
                    this._end = end;
                } else {
                    this._end = {
                        'obj': end,
                        'index': index
                    };
                }
                //  this._setEndViewOwnerId();
                this.endModel = this._viewToModel(this._end);
            },

            /*
             * start can be model or view 
             */
            setStart: function(obj, index) {
                if (obj.modelType)
                    this.setStartModel(obj, index);
                else
                    this.setStartView(obj, index);
            },

            /*
             * end can be model or view 
             */
            setEnd: function(obj, index) {
                if (obj.modelType)
                    this.setEndModel(obj, index);
                else
                    this.setEndView(obj, index);
            },
            /**
             * 
             * @param obj start model object
             * @param index start model index
             * @param pageLimit start view limit, optional param, used for header/footer, the viewLimit is 
             * the page view for the header/footer.
             */
            setStartModel: function(obj, index) {
                if (index == null && obj.obj)
                    this.startModel = obj;
                else
                    this.startModel = {
                        'obj': obj,
                        'index': index
                    };
                this._start = null;
                //  this._start = this._modelToView( this.startModel );
            },

            setEndModel: function(obj, index) {
                if (index == null && obj.obj)
                    this.endModel = obj;
                else
                    this.endModel = {
                        'obj': obj,
                        'index': index
                    };
                this._end = null;
                //  this._end = this._modelToView( this.endModel );
            },

            getStartModel: function() {
                return this.startModel;
            },

            _getParaPos: function(pos, bEnd) {
                var obj = pos && pos.obj;
                var index = pos && pos.index;
                
                if (!obj || (obj.modelType && obj.modelType == 'paragraph')) {
                    return pos;
                } else if (g.modelTools.isRun(obj) || g.modelTools.isAnchor(obj) || g.modelTools.isInlineObject(obj)) {
                    return {
                        "obj": g.modelTools.getParagraph(obj),
                        "index": index = obj.start + index
                    };
                } else {
                    var container = obj.getContainer && obj.getContainer();
                    if (!container)
                        return null;
                    var child = container.getByIndex(index);
                    if (!child) {
                        child = container.getLast();
                        if (!child)
                            return null;
                        if (child.modelType == 'paragraph')
                            return {
                                "obj": child,
                                "index": child.getLength()
                            };
                        else
                            return this._getParaPos({
                                "obj": child,
                                "index": child.getContainer && (child.getContainer().length())
                            });
                    } else {
                        //For getEndParaPos in cells, should return the last paragraph length of the last selected cell.
                        if (bEnd) { // end position
                            child = container.getByIndex(index - 1);
                            try {
                                return this._getParaPos({
                                    "obj": child,
                                    "index": child.getContainer().length()
                                });
                            } catch (e) {
                                return this._getParaPos({
                                    "obj": child,
                                    "index": 0
                                });
                            }


                        }
                        return this._getParaPos({
                            "obj": child,
                            "index": 0
                        });
                    }
                }
            },

            _isAnchorAtPos: function(para, index) {
                var hint = para.byIndex(index);
                return hint && g.modelTools.isAnchor(hint);
            },

            _isTrackDeletedAtPos: function(para, index) {
                var hint = para.byIndex(index);
                while (hint && 0 == hint.length) {
                    hint = hint.next();
                }
                return hint && hint.isTrackDeleted();
            },

            getStartParaPos: function() {
                return this._getParaPos(this.getStartModel());
            },
            getEndParaPos: function() {
                return this._getParaPos(this.getEndModel(), true);
            },

            getEndModel: function() {
                return this.endModel;
            },

            /**
             * Find the node which fully contains the range.
             * @param includeSelf
             */
            getCommonAncestor: function(includeSelf, modelType) {
                var start = this.getStartParaPos(),
                    end = this.getEndParaPos();
                if (start && end && start.obj == end.obj) {
                    var iStart = start.index <= end.index ? start.index : end.index,
                        iEnd = start.index <= end.index ? end.index : start.index,
                        obj = start.obj;
                    if (modelType) {
                        var hint1 = obj.byIndex(iStart, true, false),
                            hint2 = obj.byIndex(iEnd, true, true);
                        hint1 = hint1 && g.modelTools.getParent(hint1, modelType);
                        hint2 = hint2 && g.modelTools.getParent(hint2, modelType);
                        return (hint1 == hint2) ? hint1 : null;
                    } else {
                        if (iStart < iEnd) {
                            var hint1 = obj.byIndex(iStart),
                                hint2 = (iEnd - 1 == iStart) ? hint1 : obj.byIndex(obj, iEnd - 1);
                            if (hint1 == hint2)
                                return hint1;
                            else
                                return obj;
                        } else {
                            return obj.byIndex(iStart) || obj;
                        }
                    }
                } else {
                    var mTools = g.modelTools;
                    var commAncestor = mTools.getParent(start.obj, function(p) {
                        return mTools.getParent(end.obj, function(p2) {
                            return p2 == p;
                        });
                    })
                    if (modelType && commAncestor) {
                        if (commAncestor.modelType == modelType) {
                            return commAncestor;
                        } else
                            return g.modelTools.getParent(commAncestor, modelType);
                    }
                    return commAncestor;
                }

            },
            /**
             * move to position
             * @param start
             * @param index
             */
            moveToPosition: function(start, index) {
                if (index == -1) {
                    //Move to end
                    if (start.modelType)
                        index = g.modelTools.getLength(start);
                    else
                        index = ViewTools.length(start);
                }
                this.setStart(start, index);
                this.collapse(true);
            },
            /**
             * move to edit start position of m
             * @param m
             */
            moveToEditStart: function(m) {
                //Model 
                var p;
                if (g.modelTools.isParagraph(m))
                    p = m;
                else
                    p = g.modelTools.getFirstChild(m, g.modelTools.isParagraph, true);
                p && this.moveToPosition(p, 0);
                //TODO:
                //m is view
            },
            /**
             * move to edit end postion of m
             * @param m
             */
            moveToEditEnd: function(m) {
                //Model 
                var p;
                if (g.modelTools.isParagraph(m))
                    p = m;
                else
                    p = g.modelTools.getLastChild(m, g.modelTools.isParagraph, true);
                p && this.moveToPosition(p, -1);
                //TODO:
                //m is view
            },
            /**
             * check if the range is from the beginning of a paragraph
             * @returns {Boolean}
             */
            isStartOfPara: function() {
                var start = this.getStartParaPos();
                if (!start)
                    return false;

                var index = start.index;
                if (index == 0)
                    return true;
                if (start.obj.getVisibleIndex(index) == 0)
                    return true;
                return false;
            },
            /**
             * check if the range is end of a paragraph
             * @returns {Boolean}
             */
            isEndofPara: function() {
                var end = this.getEndParaPos();
                if (!end)
                    return false;

                var index = end.index;
                if (index == end.obj.text.length)
                    return true;
                if (start.obj.getVisibleIndex(index) == start.getVisibleText().length)
                    return true;

                return false;
            },

            resetView: function() {
                this._start = null;
                this._end = null;
            },

            shrink: function() {
                //TODO:
            },

            store: function(msg) {
                //#35276
                var start = this.getStartModel(),
                    end = this.getEndModel();

                if (!start || !end) {
                    console.error("range store :: no startModel or endModel")
                    return;
                }

                function isInParagraph(obj) {
                    return (!obj.getContainer) && g.modelTools.isRun(obj);
                }
                if (isInParagraph(start.obj)) {
                    start = this.getStartParaPos();
                }
                if (isInParagraph(end.obj)) {
                    end = this.getEndParaPos();
                }

                if (!start || !end) {
                    console.error("range store :: no startModel or endModel")
                    return;
                }

                if (msg) {
                    function checkDeleteAction(pos) {
                        for (var i = 0; i < msg.updates.length; i++) {
                            var act = msg.updates[i];
                            if (act.t == constants.ACTTYPE.DeleteElement && act.tid == pos.obj.id) {
                                var prenext = pos.obj.previous() || pos.obj.next();
                                if (prenext) {
                                    pos.obj = prenext;
                                    pos.index = g.modelTools.getLength(pos.obj);
                                }
                            }
                        }
                    }
                    checkDeleteAction(start);
                    checkDeleteAction(end);
                }

                if (start.obj && start.obj.id)
                    this.start_id = {
                        'obj': start.obj.id,
                        'index': start.index
                    };

                if (end.obj && end.obj.id)
                    this.end_id = {
                        'obj': end.obj.id,
                        'index': end.index
                    };

            },

            isSaved: function() {
                return this.start_id || this.end_id;
            },

            restore: function() {
                var obj;
                if (!this.rootView.model || this.rootView.model.deleted) {
                    // text box has been deleted, e.g. Shape
                    var existParent = g.modelTools.getParent(this.rootView, function(parent) {
                        return parent.model && !parent.model.deleted;
                    });
                    var existRootView;
                    if (existParent)
                        existRootView = g.viewTools.getTextBox(existParent) || g.viewTools.getDocument(existParent);
                    if (!existRootView)
                    	existRootView = pe.lotusEditor.layoutEngine.rootView;
                    this.setRootView(existRootView);
                    this.setStartModel(this.rootView.model.firstChild(),0);
                    this.collapse(true);
                    delete this.start_id;
                    delete this.end_id;
                    return this;
                }
                if (this.start_id) {
                    obj = this.rootView.model.byId(this.start_id.obj);
                    if (!obj) {
                        //          console.error( 'start obj have been removed ');
                        //          The object maybe deleted by other client
                        //          Set cursor to the start of document
                        var firstChild = this.rootView.model.firstChild();
                        firstChild && this.moveToEditStart(firstChild);
                        delete this.start_id;
                        return this;
                    }
                    var delTableOfStart = g.modelTools.isInTrackDeletedTable(obj);
                    if (delTableOfStart){
                        var firstChild = this.rootView.model.firstChild();
                        firstChild && this.moveToEditStart(firstChild);
                        delete this.start_id;
                        return this;
                    } else {
                        var len = -1;
                        if (g.modelTools.isParagraph(obj))
                        //is paragraph
                            len = g.modelTools.getLength(obj);
                        else if (obj.getContainer)
                        //is container 
                            len = obj.getContainer().length();
                        if (len >= 0 && this.start_id.index > len)
                            this.start_id.index = len;
                        this.setStartModel(obj, this.start_id.index);
                        delete this.start_id;
                    }
                }

                if (this.end_id) {
                    obj = this.rootView.model.byId(this.end_id.obj);
                    if (!obj) {
                        //          The object maybe deleted by other client
                        this.setEndModel(this.rootView.model.lastChild(), 0);
                        delete this.end_id;
                        return this;
                    }
                    var delTableOfStart = g.modelTools.isInTrackDeletedTable(obj);
                    if (delTableOfStart){
                        this.setEndModel(this.rootView.model.lastChild(), 0);
                        delete this.end_id;
                        return this;
                    }
                    var len = -1;
                    if (g.modelTools.isParagraph(obj))
                    //is paragraph
                        len = g.modelTools.getLength(obj);
                    else if (obj.getContainer)
                    //is container 
                        len = obj.getContainer().length();

                    if (len >= 0 && this.end_id.index > len)
                        this.end_id.index = len;
                    this.setEndModel(obj, this.end_id.index);
                    delete this.end_id;
                }
                return this;
            },

            _removeParaSection: function(p, msgs) {
                var secId = p.directProperty && p.directProperty.getSectId && p.directProperty.getSectId();

                if (secId && "" != secId) {
                    // remove p id and its section
                    SectionTools.deleteSection(p, msgs);

                    var views = p.getRelativeViews("rootView");
                    var paraView = views && views.getFirst();
                    if (!paraView)
                        console.error("!range->remove paragraph secid: cannot find paragraph view");

                    var msg = p.setSectionId(null, true);
                    msgHelper.mergeMsgs(msgs, msg);
                    topic.publish(constants.EVENT.UPDATEDELETESECTION, paraView, secId);
                }
            },
            _mergeParaSection: function(p1, p2, msgs) {
                var secId1 = p1.directProperty && p1.directProperty.getSectId && p1.directProperty.getSectId();
                var secId2 = p2.directProperty && p2.directProperty.getSectId && p2.directProperty.getSectId();

                if ((secId1 && "" != secId1) || (secId2 && "" != secId2)) {
                    // remove p1 id and its section
                    if (secId1)
                    	SectionTools.deleteSection(p1, msgs);

                    var views = p1.getRelativeViews("rootView");
                    var paraView = views && views.getFirst();
                    if (!paraView)
                        console.error("!range->merge paragraph: cannot find paragraph view");

                    // move p2 secId to p1
                    if (secId2 && "" != secId2) {
                        var msg = p1.setSectionId(secId2, true);
                        msgs.push(msg);
                        msg = p2.setSectionId(null, true);
                        msgs.push(msg);
                        topic.publish(constants.EVENT.UPDATEINSERTSECTION, paraView, paraView.directProperty.getSectId());
                    } else {
                        var msg = p1.setSectionId(null, true);
                        msgs.push(msg);
                        topic.publish(constants.EVENT.UPDATEDELETESECTION, paraView, secId1);

                    }
                }
            },
            /**
             * delete contents without selecting something
             * @param isBackspace
             * @returns {Array}
             */
            deleteAtCursor: function(isBackspace) {

                var tools = g.modelTools;
                var inTrack = trackChange.isOn();

                var that = this;
                var indexOffset = 0;
                var mergeParagraphs = function(p1, p2, msgs) {
                    if (!p1 || !p2)
                        return;
                    // TODO Track
                    // Defect 37921 Delete page break/section break
                    if (p1.isEndWithPageBreak()) {
                        var index = p1.getLength() - 1,
                            cnt = 1;

                        if (!inTrack || !g.modelTools.isTrackable(p1)) {
                            var actPair = msgCenter.createDeleteTextAct(index, cnt, para);
                            var msg = msgCenter.createMsg(constants.MSGTYPE.Text, [actPair]);
                            msgHelper.mergeMsgs(msgs, msg);
                            p1.deleteText(index, cnt);
                        } else {
                            var trackedChanges = p1.deleteText(index, cnt);
                            if (trackedChanges && trackedChanges.length) {
                                var pairs = [];
                                trackChange.pause();

                                array.forEach(trackedChanges, function(tc) {
                                    if (!tc.deleted) {
                                        var act = msgCenter.createSetTextAttribute(tc.start, tc.length, para, null, null, {
                                            ch: tc.newChanges
                                        }, {
                                            ch: tc.oldChanges
                                        });
                                        pairs.push(act);
                                    }
                                });

                                var realDeletion = array.filter(trackedChanges, function(tc) {
                                    return tc.deleted;
                                });

                                realDeletion.sort(function(a, b) {
                                    if (a.start > b.start)
                                        return -1;
                                    else
                                        return 1;
                                });

                                array.forEach(realDeletion, function(tc, index) {
                                    var start = tc.start;
                                    var len = tc.length;
                                    if (!tc.noMsg)
                                    {
                                        var act = msgCenter.createDeleteTextAct(start, len, para);
                                        pairs.push(act);
                                    }
                                    para.deleteText(start, len, true);
                                })

                                para.checkStartAndLength(0, para.getLength());
                                para.markDirty();

                                if (pairs.length)
                                {
                                    msg = msgCenter.createMsg(constants.MSGTYPE.Text, pairs);
                                    msgHelper.mergeMsgs(msgs, msg);
                                }
                                
                                trackChange.resume();
                                
                            }
                        }

                    }
                    // update section
                    if (has("trackGroup") && inTrack && g.modelTools.isTrackable(p1)) {
                        writer.track.trackBlockGroupManager && writer.track.trackBlockGroupManager.pauseBuildGroup();
                        var msgs2 = p1.deleteBreakInTrack();
                        writer.track.trackBlockGroupManager && writer.track.trackBlockGroupManager.resumeBuildGroup();
                        array.forEach(msgs2, function(msg) {
                            msgHelper.mergeMsgs(msgs, msg);
                        })
                        if (msgs2 && msgs2[0] && msgs2[0].deleted) {
                            p1 = tools.mergeParagraphs(p1, p2, msgs);
                            p1.markDirty();
                            p2.markDelete();
                        } else {
                            that._mergeParaSection(p1, p2, msgs);
                            var msgs2 = p1.directProperty.applyDirectStyle(p2, true);
                            array.forEach(msgs2, function(msg) {
                                msgHelper.mergeMsgs(msgs, msg);
                            });
                            p2.buildGroup && p2.buildGroup();
                        }
                    } else if (inTrack && g.modelTools.isTrackable(p1)) {
                        var isP1Paragraph = g.modelTools.isParagraph(p1),
                            isP2Paragraph = g.modelTools.isParagraph(p2);
                        if (isP1Paragraph && isP2Paragraph){
                            p1 = tools.mergeParagraphs(p1, p2, msgs);
                        }
                        else if (isP1Paragraph) {
                            g.modelTools.removeBlock(p2,that,msgs);
                            p2.markDelete();
                            if (!p2.isAllInsByMe || !p2.isAllInsByMe()){
                                indexOffset++;
                                msgs.push(p1.insertTrackDeletedObjs([p2]));
                            }
                        } else if (isP2Paragraph) {
                            g.modelTools.removeBlock(p1,that,msgs);
                            p1.markDelete();
                            if (!p1.isAllInsByMe || !p1.isAllInsByMe())
                                msgs.push(p2.insertTrackDeletedObjs([p1], true));
                        } else {
                            // FIXME: should never happen?
                            console.warn("merge two part is both not paragraph");
                        }
                        
                    } else {
                        p1 = tools.mergeParagraphs(p1, p2, msgs);
                        p1.markDirty();
                        p2.markDelete();
                    }
                };
                
                // adjust the position of cursor to the end of previous para
                var adjustIndexInPrevPara = function() {

                    var paraProperty = para.getDirectProperty();
                    var isList = para.isList();
                    var isPStartDel = false;
                    if (isList && para.getListLevel() > 0) {
                        // Begin of list and it's not the first level.
                        // TRACK CHANGE - Should be Handled
                        pe.lotusEditor.execCommand("outdent");
                        return {"isPStartDel":true,"msgs":msgs};
                    } else {
                        var indentLeft = paraProperty.getIndentLeft();
                        var indentSpecialVal = paraProperty.getIndentSpecialValue();
                        var indentSpecialType = paraProperty.getIndentSpecialType();
                        if (!isList && indentLeft == 0 && (indentSpecialVal == 0 || (indentSpecialType != "hanging" && indentSpecialType != "firstLine"))) {
                            // move to the last char of para and then merge
                            para = para.previous();
                            if (para)
                                index = tools.getLength(para);
                            else
                                return {"msgs":msgs};
                        } else {
                            // 1. Remove list
                            if (isList) {
                                // Set the paragraph list id to -1.
                                msg = para.setList(-1); //removeList(true);
                                msgHelper.mergeMsgs(msgs, msg);
                                isPStartDel = true;
                                if (indentSpecialType == "hanging" || indentSpecialType == "firstLine") {
                                    msg = para.setIndentSpecialTypeValue("none", "none");
                                    msgHelper.mergeMsgs(msgs, msg);

                                    msg = para.setIndent(indentLeft + "pt");
                                    msgHelper.mergeMsgs(msgs, msg);
                                }
                            } else {
                                // TRACK CHANGE - Should be Handled
                                if (indentSpecialVal == 0) {
                                	isPStartDel = true;
                                    pe.lotusEditor.execCommand("outdent");
                                } else if (indentSpecialType == "hanging" || indentSpecialType == "firstLine") {
                                    msg = para.setIndentSpecialTypeValue("none", "none");
                                    msgHelper.mergeMsgs(msgs, msg);

                                    var realIndentLeft = paraProperty.getRealIndentLeft();
                                    if (realIndentLeft != "none" && realIndentLeft != 0)
                                        msg = para.setIndent("none"); // Defect 43280                             
                                    else
                                        msg = para.setIndent(indentLeft + "pt");
                                    msgHelper.mergeMsgs(msgs, msg);
                                    isPStartDel = true;
                                } else
                                    pe.lotusEditor.execCommand("outdent");
                            }
                            return {"isPStartDel":isPStartDel,"msgs":msgs};
                        }
                    }
                };
                
                //check if the paragrpah contain assigment, which can not be removed
                //  if(!writer.util.HelperTools.canTaskDelete()){
                //      var nls = dojo.i18n.getLocalization("concord.widgets","CKResource");
                //      window.pe.scene.showWarningMessage(nls.coediting.forbiddenInput,10000);
                //      return [];
                //  }   
                var range = this;
                var msgs = [],
                    msg = null;
                var start = range.getStartParaPos();
                if (!start) {
                    //TODO: delete before image... 
                    console.error('delete object: not implimented yet !!');
                } else {
                    var para = start.obj;
                    var index = start.index;
                    var paraText = para.getVisibleText();
                    if (isBackspace) {
                        // try to move cursor left first, and skip the anchor run
                        do {
                            index--;
                            // TODO TRACK, performance.
                        }
                        while (index >= 0 && (this._isAnchorAtPos(para, index) || this._isTrackDeletedAtPos(para, index)));

                        if (index > 0) { // avoid breaking hi/lo surrogates

                            // abcd, point to char d, the index;3, visibleIndex : 1
                            var visibleIndex = para.getVisibleIndex(index);
                            if (visibleIndex > 0) {
                                var chcode = paraText.charCodeAt(visibleIndex);
                                if (chcode >= 0xDC00 && chcode <= 0xDFFF) {
                                    chcode = paraText.charCodeAt(visibleIndex - 1);
                                    if (chcode >= 0xD800 && chcode <= 0xDBFF) {
                                        visibleIndex--;
                                        index = para.getFullIndex(visibleIndex);
                                    }
                                }
                            }
                        }

                        var adjustResult = {};
                        if (index < 0)
                        	adjustResult = adjustIndexInPrevPara();

                        // move cursor left
                        if (g.modelTools.isParagraph(para)) {
                        	if(adjustResult && adjustResult.isPStartDel)
                        		range.moveToPosition(para, 0);
                        	else
                        		range.moveToPosition(para, index);
                        } else {
                            if (g.modelTools.isTOC(para)) {
                                var lastPara = g.modelTools.getLastChild(para, g.modelTools.isParagraph, true);
                                range.moveToPosition(lastPara, g.modelTools.getLength(lastPara));
                                range.collapse();
                                pe.lotusEditor.getSelection().selectRanges([range]);
                            }
                        }
                    }

                    // check if next run is anchor
                    if (!g.modelTools.isParagraph(para)) {
                        return msgs;
                    }
                    while (index < para.text.length && (this._isAnchorAtPos(para, index) || this._isTrackDeletedAtPos(para, index))) {
                        index++;
                        // TODO performance, TRACK
                    }

                    // right now, the index must point to a visible char.

                    if (index == para.text.length) {
                        //end of paragrpah  
                        if ((g.modelTools.isEmptyParagraph(para) || (!has("trackGroup") && g.modelTools.isEmptyParagraphInTrack(para))) && !para.isList()) {
                            //do not delete empty paragraph after table/textbox/toc... 
                            //if at the end of Document
                            // TODO, TRACK virtual para.
                            var next = para.next(),
                                donotDel;
                            if (!next) {
                                var prev = para.previous();
                                if (prev) {
                                    switch (prev.modelType) {
                                        case constants.MODELTYPE.TOC:
                                        case constants.MODELTYPE.TABLE:
                                        case constants.MODELTYPE.TBTXBX:
                                            donotDel = true;
                                    }
                                } else {
                                    donotDel = true;
                                    msgs = msgs.concat(para.removeBookmarks(0));
                                }
                            }
                            
                            var trackable = inTrack && g.modelTools.isTrackable(para);
                            //DONT delete  para at task boundary
                            //              if(next&&next.getTaskId&&(next.getTaskId()!=para.getTaskId()))
                            //                  donotDel = true;
                            // since it is the empty para, remove it.
                            if(!donotDel) {
                                if (g.modelTools.isEmptyParagraph(para)){
                                    if (trackable && !has("trackGroup")) {
                                        if (next && g.modelTools.isParagraph(next) && g.modelTools.isTrackable(next)) {
                                            g.modelTools.removeBlock(para, this, msgs);
                                            var msg = next.insertTrackDeletedObjs([para], true);
                                            msg && msgs.push(msg);
                                        } else {
                                            var prev = para.previous();
                                            if (prev && g.modelTools.isParagraph(prev) && g.modelTools.isTrackable(prev)) {
                                                adjustIndexInPrevPara();
                                                if (g.modelTools.isParagraph(para)) {
                                                    range.moveToPosition(para, index);
                                                } else {
                                                    if (g.modelTools.isTOC(para)) {
                                                        var lastPara = g.modelTools.getLastChild(para, g.modelTools.isParagraph, true);
                                                        range.moveToPosition(lastPara, g.modelTools.getLength(lastPara));
                                                        range.collapse();
                                                        pe.lotusEditor.getSelection().selectRanges([range]);
                                                    }
                                                }
                                            	mergeParagraphs(para, para.next(), msgs);
                                            } else {
                                            	donotDel = true;
                                            }
                                        }
                                    } else {
                                    	var prev = para.previous();
                                    	if ((next && g.modelTools.isParagraph(next)) || (prev && g.modelTools.isParagraph(prev)))
                                        	g.modelTools.removeBlock(para, this, msgs);
                                    	else
                                    		donotDel = true;
                                    }
                                    if (next && next.buildGroup)
                                        next.buildGroup();
                                } else {
                                	if (isBackspace) {
	                                    var prev = para.previous();
	                                    if (prev && g.modelTools.isParagraph(prev) && g.modelTools.isTrackable(prev)) {
	                                        //g.modelTools.removeBlock(para,this,msgs);
	                                        if (trackable && !has("trackGroup"))
	                                        {
	                                            adjustIndexInPrevPara();
	                                            if (g.modelTools.isParagraph(para)) {
	                                                range.moveToPosition(para, index);
	                                            } else {
	                                                if (g.modelTools.isTOC(para)) {
	                                                    var lastPara = g.modelTools.getLastChild(para, g.modelTools.isParagraph, true);
	                                                    range.moveToPosition(lastPara, g.modelTools.getLength(lastPara));
	                                                    range.collapse();
	                                                    pe.lotusEditor.getSelection().selectRanges([range]);
	                                                }
	                                            }
	                                        }
	                                        mergeParagraphs(para, para.next(), msgs);
	                                    } 
	                                    else if (next && g.modelTools.isParagraph(next) && g.modelTools.isTrackable(next)) {
	                                    	g.modelTools.removeBlock(para, this, msgs);
	                                    	if (trackable && !has("trackGroup"))
	                                    	{
	                                    		var msg = next.insertTrackDeletedObjs([para], true);
	                                    		msg && msgs.push(msg);
	                                    	}
	                                    } else {
	                                    	donotDel = true;
	                                    }
                                	}
                                	else {
                                		if (next && g.modelTools.isParagraph(next) && g.modelTools.isTrackable(next)) {
                                            g.modelTools.removeBlock(para, this, msgs);
                                            if (trackable && !has("trackGroup"))
	                                        {
                                            	var msg = next.insertTrackDeletedObjs([para], true);
                                            	msg && msgs.push(msg);
	                                        }
                                        } else {
                                            var prev = para.previous();
                                            if (prev && g.modelTools.isParagraph(prev) && g.modelTools.isTrackable(prev)) {
                                                if (trackable && !has("trackGroup"))
    	                                        {
                                                	adjustIndexInPrevPara();
                                                    if (g.modelTools.isParagraph(para)) {
                                                        range.moveToPosition(para, index);
                                                    } else {
                                                        if (g.modelTools.isTOC(para)) {
                                                            var lastPara = g.modelTools.getLastChild(para, g.modelTools.isParagraph, true);
                                                            range.moveToPosition(lastPara, g.modelTools.getLength(lastPara));
                                                            range.collapse();
                                                            pe.lotusEditor.getSelection().selectRanges([range]);
                                                        }
                                                    }
    	                                        }
                                                mergeParagraphs(para, para.next(), msgs);
                                            }
                                            else {
                                            	donotDel = true;
                                            }
                                        }
                                	}
                                }
                            }
                        } else {
                            var next = para.next();
                            var donotDel = false;
                            if (!next || !g.modelTools.isParagraph(next))
                            	donotDel = true;
                            //DONT delete  para at task boundary
                            //              if(next&&next.getTaskId&&(next.getTaskId()!=para.getTaskId()))
                            //                  donotDel = true;
                            (!donotDel) && mergeParagraphs(para, para.next(), msgs);
                        }
                    } else if (index >= 0) {
                        // delete key deletes a GC while backspace key still delete char one by one
                        var cnt = 1;
                        if (!isBackspace) {
                            // TODO TRACK
                            var cbs = g.modelTools.getCharBoundaries({
                                obj: para,
                                index: index
                            });
                            if (cbs.end > cbs.start) {
                            	index = cbs.start;
                            	cnt = cbs.end - cbs.start;

                            	var charcode = paraText.charCodeAt(cbs.end -1);
                            	if (charcode >= 0xD800 && charcode <= 0xDBFF)
                            		cnt++;
                            }
                        } else {
                            // backspace key, check hi/lo surrogate
                            var visibleIndex = para.getVisibleIndex(index);
                            var charcode = paraText.charCodeAt(visibleIndex);
                            if (charcode >= 0xdc00 && charcode <= 0xDFFF && visibleIndex > 0) { // lo surrogate
                                charcode = paraText.charCodeAt(visibleIndex - 1);
                                if (charcode >= 0xD800 && charcode <= 0xDBFF) {
                                    visibleIndex -= 1;
                                    cnt = 2;
                                    index = para.getFullIndex(visibleIndex);
                                }
                            } else if (charcode >= 0xd800 && charcode <= 0xDBFF) {
                                charcode = paraText.charCodeAt(visibleIndex + 1);
                                if (charcode >= 0xdc00 && charcode <= 0xDFFF)
                                    cnt = 2;
                            }
                        }

                        if (cnt != 1) {
                            // calculate the real char count in para.
                            var visibleIndex = para.getVisibleIndex(index);
                            var visibleIndex2 = visibleIndex - cnt;
                            var startIndex = para.getFullIndex(visibleIndex2);
                            cnt = index - startIndex;
                        }

                        if (!inTrack || !g.modelTools.isTrackable(para)) {
                            var actPair = msgCenter.createDeleteTextAct(index, cnt, para);
                            msg = msgCenter.createMsg(constants.MSGTYPE.Text, [actPair]);
                        }

                        var trackedChanges = para.deleteText(index, cnt);

                        var emptyRun, prev;

                        if (isBackspace) {
                            var curRun = para.byIndex(index);
                            if (curRun && curRun.length == cnt && curRun.isTextRun && curRun.isTextRun()) {
                                if (inTrack && trackedChanges && trackedChanges.length) {
                                    var realDeletion = array.filter(trackedChanges, function(tc) {
                                        return tc.deleted;
                                    });
                                    if (realDeletion.length > 0) {
                                        emptyRun = curRun.clone();
                                        emptyRun.length = 0;
                                        prev = curRun.previous();
                                    }
                                } else {
                                    emptyRun = curRun.clone();
                                    emptyRun.length = 0;
                                    prev = curRun.previous();
                                }
                            }
                        }

                        if (emptyRun) {
                            var curRun = para.byIndex(index);
                            if (curRun && curRun.length == 0 && curRun.isTextRun && curRun.isTextRun()) {
                                curRun.isStyleRun = true;
                            } else { //if there is not empty run ( when paragraph is empty , will filled with empty text run )
                                if (inTrack && g.modelTools.isTrackable(para))
                                    emptyRun.ch = [trackChange.createChange("ins")];
                                emptyRun.isStyleRun = true;
                                para.hints.insertAfter(emptyRun, prev);
                                emptyRun.markInsert();
                                this.setStartModel(emptyRun, 0);
                                this.collapse(true);
                                para.markDirty();
                            }
                        }
                        if (inTrack && trackedChanges && trackedChanges.length) {
                            var pairs = [];
                            trackChange.pause();

                            array.forEach(trackedChanges, function(tc) {
                                if (!tc.deleted) {
                                    var realPara = tc.para || para;
                                    var act = msgCenter.createSetTextAttribute(tc.start, tc.length, realPara, null, null, {
                                        ch: tc.newChanges
                                    }, {
                                        ch: tc.oldChanges
                                    });
                                    pairs.push(act);
                                }
                            });

                            var tcs = {};
                            array.forEach(trackedChanges, function(tc) {
                                var para = tc.para || para;
                                var id = para.id;
                                if (!tcs[id])
                                    tcs[id] = [];
                                tcs[id].push(tc);
                            })

                            for (var paraId in tcs) {
                                trackedChanges = tcs[paraId];

                                var realPara = trackedChanges[0].para || para;

                                var realDeletion = array.filter(trackedChanges, function(tc) {
                                    return tc.deleted;
                                });

                                realDeletion.sort(function(a, b) {
                                    if (a.start > b.start)
                                        return -1;
                                    else
                                        return 1;
                                });

                                array.forEach(realDeletion, function(tc, index) {
                                    var start = tc.start;
                                    var len = tc.length;
                                    if (!tc.noMsg)
                                    {
                                        var act = msgCenter.createDeleteTextAct(start, len, realPara);
                                        pairs.push(act);
                                    }
                                    realPara.deleteText(start, len, true);
                                });

                                realPara.checkStartAndLength(0, realPara.getLength());
                                realPara.markDirty();
                            }
							if (pairs.length)
                            	msg = msgCenter.createMsg(constants.MSGTYPE.Text, pairs);
                            trackChange.resume();
                        }
                        msgHelper.mergeMsgs(msgs, msg);
                    }

                }
                //append the comment del msg
                var cmtMsgs = pe.lotusEditor.relations.commentService.checkCommentsDelete();
                if (cmtMsgs.length > 0)
                    msgs = msgs.concat(cmtMsgs);

                // If range selection start in merged group, should fix it
                if (this.isCollapsed()) {
                    var startModel = this.getStartModel();
                    var startIndex = startModel.index;
                    startModel = startModel && startModel.obj;
                    if (indexOffset){
                        this.setStartModel(startModel, startIndex + indexOffset);
                        this.collapse(true);
                    }
                    if (g.modelTools.isTrackBlockGroup(startModel) && startModel.isCollapse()) {
                        this.setStartModel(startModel.getFixedTarget(), startIndex);
                        this.collapse(true);
                    }
                }

                return msgs;
            },

            /**
             * If the range selection start in table will return the selection rows/columns.
             * Else will return null;
             * @returns
             */
            _getRowColumn: function(selModel, selIndex, isEnd) {
                var selTable = null,
                    rowIdx, columnIdx;

                if (g.modelTools.isCell(selModel)) {
                    var row = selModel.getParent();
                    selTable = row.getParent();
                    rowIdx = row.getRowIdx();
                    columnIdx = selModel.getColIdx();
                } else if (g.modelTools.isRow(selModel)) {
                    selTable = selModel.getParent();
                    rowIdx = selModel.getRowIdx();
                    //      columnIdx = selIndex;
                    var idx = isEnd ? (selIndex > 0 ? (selIndex - 1) : 0) : selIndex;
                    var cell = selModel.getItemByIndex(idx);
                    columnIdx = cell.getColIdx(); // Defect 40720
                    if (isEnd) {
                        columnIdx += cell.getColSpan();
                        //          columnIdx++;
                    }

                } else if (g.modelTools.isTable(selModel)) {
                    selTable = selModel;
                    rowIdx = isEnd ? selIndex - 1 : selIndex;
                    columnIdx = 0;
                } else {
                    var startCell = g.modelTools.getCell(selModel);
                    if (startCell) {
                        // In cell
                        var row = g.modelTools.getRow(startCell);
                        selTable = row.getParent();
                        rowIdx = row.getRowIdx();
                        columnIdx = startCell.getColIdx();
                    } else if (g.modelTools.isBlock(selModel) && !g.modelTools.isParagraph(selModel)) {
                        // In table's parent. like table in table, body, text box etc.
                        var selectedObj = selModel.getByIndex(selIndex);
                        if (g.modelTools.isTable(selectedObj)) {
                            selTable = selectedObj;
                            rowIdx = 0;
                            columnIdx = 0;
                        }
                    }
                }

                return selTable == null ? null : {
                    "selTable": selTable,
                    "rowIndex": rowIdx,
                    "columnIndex": columnIdx
                };
            },

            getStartRowColumn: function() {
                var startModel = this.getStartModel();
                return this._getRowColumn(startModel.obj, startModel.index);
            },

            /**
             * If the range selection end in table will return the selection rows/columns.
             * Else will return null;
             */
            getEndRowColumn: function() {
                var endModel = this.getEndModel();
                return this._getRowColumn(endModel.obj, endModel.index, true);
            },
            /**
             * get selected object 
             * if selected one drawing object
             */
            getSelectedObject: function() {
                var startObj = this.getStartModel().obj,
                    startIndex = this.getStartModel().index;
                var endObj = this.getEndModel().obj,
                    endIndex = this.getEndModel().index;

                if (startObj == endObj && g.modelTools.isDrawingObj(startObj) && startIndex == 0) {
                    var len = (startObj.getContainer && startObj.getContainer().length()) || startObj.length;
                    if (endIndex == len) {
                        return startObj;
                    }
                }
                return null;
            },
            /**
             * 
             * @param ignoreTableBoundary is true will not extract start/end table in range. But will extract whole selected table.
             * @returns
             */
            extractContents: function(styleFilterFunc, ignoreTableBoundary, limitedCount) {

                if (this.isCollapsed())
                    return null;

                var range = this.clone();

                function enLargeStartToBlock(r) {
                    var startM = r.getStartModel(),
                        obj = startM.obj,
                        p = obj.getParent(),
                        index = startM.index;
                    if (p == null)
                        return r;

                    if (g.modelTools.isTextBox(p) || g.modelTools.isCanvas(p) || p.modelType == constants.MODELTYPE.CELL)
                        return r;

                    if (index == 0) {
                        if (obj.paragraph && obj.start != null)
                            r.setStartModel(obj.paragraph, obj.start);
                        else
                            r.setStartModel(p, p.getContainer().indexOf(obj));
                        return enLargeStartToBlock(r);
                    } else
                        return r;
                }

                enLargeStartToBlock(range);

                function enLargeEndToBlock(r) {
                    var endM = r.getEndModel(),
                        obj = endM.obj,
                        index = endM.index,
                        p = endM.obj.getParent();
                    if (p == null)
                        return r;

                    if (g.modelTools.isTextBox(p) || g.modelTools.isCanvas(p) || p.modelType == constants.MODELTYPE.CELL)
                        return r;

                    if (obj.paragraph && index == obj.length) {
                        r.setEndModel(obj.paragraph, obj.start + index);
                        return enLargeEndToBlock(r);
                    } else if ((obj.getContainer && (index == obj.getContainer().length())) ||
                        (obj.modelType == constants.MODELTYPE.PARAGRAPH && index == obj.getLength())) {
                        r.setEndModel(p, p.getContainer().indexOf(obj) + 1);
                        return enLargeEndToBlock(r);
                    }
                    return r;
                }

                enLargeEndToBlock(range);

                var selectedOneDrawingObj = range.getSelectedObject();

                var start = this.getStartParaPos();
                var end = this.getEndParaPos();

                var startModel = start.obj;
                var endModel = end.obj;
                var startIndex = start.index;
                var endIndex = end.index;

                var it = new RangeIterator(range);
                var paraCount = 0;
                var c = it.nextBlock(),
                    next;
                var firstObj = c;
                var result = [],
                    jsonObject;
                while (c) {
                    next = it.nextBlock();
                    if (c.isTrackDeleted())
                    {
                    	c = next;
                    	continue;
                    }
                    paraCount ++;
                    if (limitedCount && paraCount >= limitedCount)
                    	break;
                    //extract styles
                    styleFilterFunc && styleFilterFunc(c);
                    if (c == startModel && startModel == endModel) {
                        var wholeParagraph = !!(c.modelType == constants.MODELTYPE.PARAGRAPH && startIndex == 0 && (endIndex >= c.getLength()) && !selectedOneDrawingObj);
                        var selectOneObject = false;

                        if (wholeParagraph && c.modelType == constants.MODELTYPE.PARAGRAPH && endIndex - startIndex == 1) {
                            //select only one object 
                            var obj = c.byIndex(startIndex);
                            while (obj && obj.length == 0)
                                obj = obj.next();
                            if (obj && obj.start == startIndex && obj.length == 1 && obj.modelType != constants.MODELTYPE.TEXT)
                                selectOneObject = true;
                        }
                        if (!selectOneObject && wholeParagraph)
                            jsonObject = c.toJson(startIndex, null, true);
                        else
                            jsonObject = c.toJson(startIndex, endIndex - startIndex);
                        result.parentJson = c.toJson(0, null, true);
                    } else if (c == startModel && c.modelType == constants.MODELTYPE.PARAGRAPH) {
                        jsonObject = c.toJson(startIndex, null, true);
                    } else if (c == endModel && c.modelType == constants.MODELTYPE.PARAGRAPH) {
                        jsonObject = c.toJson(0, endIndex, true);
                    } else if (ignoreTableBoundary && c.modelType == constants.MODELTYPE.ROW) {
                        jsonObject = null; // Table row
                    } else if (ignoreTableBoundary && c.modelType == constants.MODELTYPE.TABLE) {
                        if (c == firstObj || !next) // Ignore the first and last table
                            jsonObject = null;
                        else
                            jsonObject = c.toJson();
                    } else if (c.toJson) {
                        if (c.modelType == constants.MODELTYPE.PARAGRAPH)
                            jsonObject = c.toJson(0, null, true);
                        else
                            jsonObject = c.toJson();
                    } else {
                        console.error("Need implement the function toJson for model: " + c.modelType);
                        jsonObject = null;
                    }
                    jsonObject && result.push(jsonObject);
                    c = next;
                }
                return result;
            },

            deleteContents: function(bReturnMsg, merge, options) {
                // bReturnMsg:false only used for test, not in production env.

                if (this.isCollapsed())
                    return [];
                var inTrack = trackChange.isOn();
                if (!options)
                    options = {};
                //check if the contents contain assigment, which can not be removed
                //  if(!writer.util.HelperTools.canTaskDelete()){
                //      var nls = dojo.i18n.getLocalization("concord.widgets","CKResource");
                //      window.pe.scene.showWarningMessage(nls.coediting.forbiddenInput,10000);
                //      return [];
                //  }

                function filter(p) {
                    var mt = constants.MODELTYPE;
                    switch (p.modelType) {
                        case mt.PARAGRAPH:
                        case mt.TOC:
                        case mt.TABLE:
                        case mt.ROW:
                            return true;

                        default:
                            return false;
                    }
                    return false;
                }

                var start = this.getStartParaPos();
                var end = this.getEndParaPos();

                var startModel = start.obj;
                var endModel = end.obj;
                var startIndex = start.index || 0;
                var endIndex = end.index || 0;
                var range = this;

                var startTable = g.modelTools.getParent(startModel, constants.MODELTYPE.TABLE);
                var endTable = g.modelTools.getParent(endModel, constants.MODELTYPE.TABLE);
                var startRow = g.modelTools.getParent(startModel, constants.MODELTYPE.ROW);
                if (startRow) {
                    var startCelll = g.modelTools.getParent(startModel, constants.MODELTYPE.Cell) || startRow.cells.getByIndex(startIndex);
                }
                var endRow = g.modelTools.getParent(endModel, constants.MODELTYPE.ROW);
                if (endRow) {
                    var endCell = g.modelTools.getParent(endModel, constants.MODELTYPE.Cell) || endRow.cells.getByIndex(endIndex);
                }
                if (startTable && (startTable == endTable)) { //In same table, only delete text and object in the cell, such as the nested table.
                    filter = function(model) {
                        if (g.modelTools.isParagraph(model) || g.modelTools.isTable(model)) {
                            return true;
                        }
                        return false;
                    };
                }

                var it = new RangeIterator(range);
                var sobj = this.getStartModel().obj;

                var c = it.nextModel(filter),
                    next;
                var result = [],
                    removeStart, removeEnd;
                if (sobj.modelType == constants.MODELTYPE.TOC) {
                    if (sobj.toJson) {
                        var nmodel = g.modelTools.getNext(sobj, filter);
                        removeBlock(sobj, nmodel);
                        removeStart = true;
                        while (c.getParent().modelType == constants.MODELTYPE.TOC)
                            c = it.nextModel(filter);
                    }
                }
                var that = this;
                function removeBlock(c, next) {
                    if (c.modelType == constants.MODELTYPE.PARAGRAPH) {
                        //remove right bookmark
                        result = result.concat(c.removeBookmarks(c.text.length));
                    }

                    if (!bReturnMsg)
                        result.push(c.toJson(0, null, true));
                    else
                        g.modelTools.removeBlock(c, (next) ? null : range, result);
                    if (c == endModel || c == startModel)
                        merge = false;
                    if (!removeStart) removeStart = (c == startModel);
                    if (!removeEnd) removeEnd = (c == endModel);
                }

                function deleteText(c, idx1, idx2, rPr) {
                    var inTrack = trackChange.isOn() && g.modelTools.isTrackable(c);
                    if (!options.keepBookmark) {
                        if (c.removeBookmarks) {
                            result = result.concat(c.removeBookmarks(idx1));
                            if (idx2 != (idx1 + 1))
                                result = result.concat(c.removeBookmarks(idx2));
                        }
                    }
                    var len = idx2 - idx1;
                    if (!bReturnMsg) {
                        // TODO TRACK-CHANGE for test env.
                        result.push(c.toJson(idx1, len));
                        c.deleteText(idx1, len);
                    } else {
                        if (inTrack) {
                            if (rPr) {
                                var rprMsgs = c.deleteBreakInTrack();
                                if (rprMsgs && rprMsgs.length) {
                                    array.forEach(rprMsgs, function(r) {
                                        result.push(r);
                                    });
                                }
                            }
                            var trackedChanges = c.deleteText(idx1, len);
                            var msg = null;
                            if (trackedChanges && trackedChanges.length) {
                                var pairs = [];
                                trackChange.pause();

                                array.forEach(trackedChanges, function(tc) {
                                    if (!tc.deleted) {
                                        var realPara = tc.para || c;
                                        var act = msgCenter.createSetTextAttribute(tc.start, tc.length, realPara, null, null, {
                                            ch: tc.newChanges
                                        }, {
                                            ch: tc.oldChanges
                                        });
                                        pairs.push(act);
                                    }
                                });


                                var tcs = {};
                                array.forEach(trackedChanges, function(tc) {
                                    var para = tc.para || c;
                                    var id = para.id;
                                    if (!tcs[id])
                                        tcs[id] = [];
                                    tcs[id].push(tc);
                                })

                                for (var paraId in tcs) {
                                    trackedChanges = tcs[paraId];

                                    var realPara = trackedChanges[0].para || c;

                                    var realDeletion = array.filter(trackedChanges, function(tc) {
                                        return tc.deleted;
                                    });

                                    realDeletion.sort(function(a, b) {
                                        if (a.start > b.start)
                                            return -1;
                                        else
                                            return 1;
                                    });

                                    array.forEach(realDeletion, function(tc, index) {
                                        var start = tc.start;
                                        var len = tc.length;
                                        if (len == 0 && tc.obj.modelType == constants.MODELTYPE.TEXT) {
                                            try {
                                                realPara.hints.remove(tc.obj);
                                            } catch (e) {}
                                        } else {
                                            if (!tc.noMsg)
                                            {
                                                var act = msgCenter.createDeleteTextAct(start, len, realPara);
                                                pairs.push(act);
                                            }
                                            // track change has been turned off.
                                            realPara.deleteText(start, len, true);
                                        }
                                    });
                                    
                                    if (pairs.length)
                                        msg = msgCenter.createMsg(constants.MSGTYPE.Text, pairs);
                                    realPara.checkStartAndLength(0, realPara.getLength());
                                    realPara.markDirty();
                                }

                                c.markDirty();
                                trackChange.resume();
                            }
                            msg && result.push(msg);
                        } else {
                            if (c.isTrackBlockGroup) {
                                var redirects = c.redirectIndex(idx1, idx2 - idx1);
                                array.forEach(redirects, function(redirect){
                                    msgCenter.addDeleteMsg(redirect.obj, redirect.start, redirect.start + redirect.len, result);
                                });
                            }else {
                                msgCenter.addDeleteMsg(c, idx1, idx2, result);
                            }
                            c.deleteText(idx1, len);
                        }
                    }

                }

                function deletedFilter(models) {
                    var delObjs = [];
                    for (var delIdx = 0; delIdx < models.length; delIdx++) {
                        var model = models[delIdx];
                        if (g.modelTools.isTable(model.parent)){
                            model = model.parent;
                        }
                        if (!model.deleted || (model.isAllInsByMe && model.isAllInsByMe()))
                            continue;
                        if (!g.modelTools.isTrackable(model))
                            continue;
                        if (delObjs.indexOf(model) == -1)
                            delObjs.push(model);
                    };
                    return delObjs;
                }
                var startInTable = g.modelTools.getTable(startModel);
                if (startInTable) {
                    var previousBlock = startInTable.previous();
                }
                var endInTable = g.modelTools.getTable(endModel);
                if (endInTable) {
                    var nextBlock = endInTable.next();
                }
                var deletedTbl = [];
                var tableChanaged = false;
                var models = [];
                var commAncestor = this.getCommonAncestor();
                var trackBlockGroupManager = writer.track && writer.track.trackBlockGroupManager;
                // don't update trackChange acts
                trackChange.beginRecord();
                // don't build groups, will build it after all deleted
                if (has("trackGroup"))
                    trackBlockGroupManager && trackBlockGroupManager.pauseBuildGroup();
                while (c) {
                    models.push(c);
                    next = it.nextModel(filter);
                    if (c == startModel && startModel == endModel) {
                        deleteText(c, startIndex, endIndex);
                    } else if (c == startModel && c.modelType == constants.MODELTYPE.PARAGRAPH) {
                        var visibleIndex = c.getVisibleIndex(startIndex);
                        var keepMe = next && next.getParent() != c.getParent();
                        if (keepMe)
                            deleteText(c, startIndex, c.text.length);
                        else if (visibleIndex == 0 || startIndex == 0 && (!endInTable || endInTable != c.next()))
                            removeBlock(c, next);
                        else
                        {
                            var deleteRPR = has("trackGroup") && (!endInTable || endInTable != c.next());
                            deleteText(c, startIndex, c.text.length, deleteRPR);
                        }
                	} else if (c == endModel && c.modelType == constants.MODELTYPE.PARAGRAPH) {
                        var visibleText = c.getVisibleText();
                        var visibleEndIndex = c.getVisibleIndex(endIndex);
                        if (visibleEndIndex == visibleText.length && !next)
                            deleteText(c, 0, endIndex);
                        else if (visibleEndIndex >= visibleText.length)
                            removeBlock(c, next);
                        else
                            deleteText(c, 0, endIndex);
                    } else if (c.modelType == constants.MODELTYPE.ROW) {
                        var rows = [];
                        rows.push(c);
                        while (next && next.modelType == constants.MODELTYPE.ROW) {
                            rows.push(next);
                            next = it.nextModel(filter);
                        }
                        var deleteTbl = function(table, rows) {
                            tableChanaged = true;
                            if (rows.length == table.rows.length()) {
                                removeBlock(table);
                                table.triggerTrackInfoUpdate("delete");
                                deletedTbl.push(table);
                            } else {
                                var acts = pe.lotusEditor.getPlugin("Table").deleteRow(rows, true);
                                var tableId = table.id;
                                result.push(msgCenter.createTableMsg(tableId, acts));
                            }
                        };
                        var currTable = rows[0].getParent();
                        var startTable = currTable;
                        var toDelRows = [];
                        for (var i = 0; i < rows.length; i++) {
                            if (rows[i].getParent() == currTable) {
                                toDelRows.push(rows[i]);
                            } else {
                                deleteTbl(currTable, toDelRows);
                                toDelRows = [];
                                toDelRows.push(rows[i]);
                                currTable = rows[i].getParent();
                            }
                        }
                        if (currTable && toDelRows.length > 0) {
                            deleteTbl(currTable, toDelRows);
                        }
                    } else if (g.modelTools.isParagraph(c)) {
                        // don't delete rPrCh before the endInTable
                        var keepMe = next && next.getParent() != c.getParent();
                        if (keepMe || endInTable && endInTable == c.next())
                            deleteText(c, 0, c.text.length);
                        else
                            removeBlock(c, next);
                    } else if (c.toJson) {
                        removeBlock(c, next);
                    } else
                        console.error("Need implement the function toJson for model: " + c.modelType);
                    c = next;
                }
                if (tableChanaged && (startInTable || endInTable)) {
                    var hasInsDelObjs;
                    var delObjs;
                    var lastRun, firstRun;
                    if (inTrack && !has("trackGroup")) {
                        delObjs = deletedFilter(models);
                        if (delObjs && delObjs.length) {
                            if (startInTable && endInTable) {
                                if (startInTable != endInTable) {
                                    if (deletedTbl.indexOf(startInTable) == -1 && deletedTbl.indexOf(endInTable) == -1) {
                                        // both start and end is not deleted, insert a new para to track all deleted objs
                                        var targetBlock;
                                        if (endInTable.parent == commAncestor)  {
                                            targetBlock = endInTable;
                                        } else {
                                            targetBlock = g.modelTools.getParent(endInTable, function(m) {
                                                return m.parent == commAncestor;
                                            });
                                        }
                                        var vPara = g.modelTools.createTrackDeletedPara(commAncestor);
                                        vPara.insertTrackDeletedObjs(delObjs, true, true);
                                        vPara.parent.container.insertBefore(vPara, targetBlock);
                                        result.push(msgCenter.createMsg(constants.MSGTYPE.Element, [msgCenter.createInsertElementAct(vPara)]));
                                        lastRun = g.modelTools.getLastChild(startInTable, g.modelTools.isRun, true);
                                    } else if (deletedTbl.indexOf(startInTable) == -1) {
                                        // first table is not deleted, if next block of endInTable is para insert trackdeletd to it, or insert a new para
                                        if (nextBlock && g.modelTools.isParagraph(nextBlock) && g.modelTools.isTrackable(nextBlock)) {
                                            result.push(nextBlock.insertTrackDeletedObjs(delObjs,true));
                                        } else {
                                            var targetBlock;
                                            if (startInTable.parent == commAncestor)  {
                                                targetBlock = startInTable;
                                            } else {
                                                targetBlock = g.modelTools.getParent(startInTable, function(m) {
                                                    return m.parent == commAncestor;
                                                });
                                            }
                                            var vPara = g.modelTools.createTrackDeletedPara(commAncestor);
                                            vPara.insertTrackDeletedObjs(delObjs, true, true);
                                            vPara.parent.container.insertAfter(vPara, targetBlock);
                                            result.push(msgCenter.createMsg(constants.MSGTYPE.Element, [msgCenter.createInsertElementAct(vPara)]));
                                        }
                                        lastRun = g.modelTools.getLastChild(startInTable, g.modelTools.isRun, true);
                                    } else if (deletedTbl.indexOf(endInTable) == -1) {
                                        if (previousBlock &&g.modelTools.isTrackable(previousBlock) && g.modelTools.isParagraph(previousBlock)) {
                                            result.push(previousBlock.insertTrackDeletedObjs(delObjs));
                                        } else {
                                            var targetBlock;
                                            if (endInTable.parent == commAncestor)  {
                                                targetBlock = endInTable;
                                            } else {
                                                targetBlock = g.modelTools.getParent(endInTable, function(m) {
                                                    return m.parent == commAncestor;
                                                });
                                            }
                                            var vPara = g.modelTools.createTrackDeletedPara(commAncestor);
                                            vPara.insertTrackDeletedObjs(delObjs, true, true);
                                            vPara.parent.container.insertBefore(vPara, targetBlock);
                                            result.push(msgCenter.createMsg(constants.MSGTYPE.Element, [msgCenter.createInsertElementAct(vPara)]));
                                        }
                                        firstRun = g.modelTools.getFirstChild(endInTable, g.modelTools.isRun, true);
                                    } else {
                                        if (g.modelTools.isParagraph(previousBlock) && g.modelTools.isTrackable(previousBlock)) {
                                            result.push(previousBlock.insertTrackDeletedObjs(delObjs));
                                            lastRun = g.modelTools.getLastChild(previousBlock, g.modelTools.isRun, true);
                                        } else if (g.modelTools.isParagraph(nextBlock) && g.modelTools.isTrackable(nextBlock)) {
                                            result.push(nextBlock.insertTrackDeletedObjs(delObjs, true));
                                            firstRun = g.modelTools.getFirstChild(nextBlock, g.modelTools.isRun, true);
                                        } else if (previousBlock) {
                                            var targetBlock;
                                            if (previousBlock.parent == commAncestor)  {
                                                targetBlock = previousBlock;
                                            } else {
                                                targetBlock = g.modelTools.getParent(previousBlock, function(m) {
                                                    return m.parent == commAncestor;
                                                });
                                            }
                                            var vPara = g.modelTools.createTrackDeletedPara(commAncestor);
                                            vPara.insertTrackDeletedObjs(delObjs, true, true);
                                            vPara.parent.container.insertAfter(vPara, targetBlock);
                                            result.push(msgCenter.createMsg(constants.MSGTYPE.Element, [msgCenter.createInsertElementAct(vPara)]));
                                            lastRun = g.modelTools.getLastChild(previousBlock, g.modelTools.isRun, true);
                                        } else if (nextBlock) {
                                            var targetBlock;
                                            if (nextBlock.parent == commAncestor)  {
                                                targetBlock = nextBlock;
                                            } else {
                                                targetBlock = g.modelTools.getParent(nextBlock, function(m) {
                                                    return m.parent == commAncestor;
                                                });
                                            }
                                            var vPara = g.modelTools.createTrackDeletedPara(commAncestor);
                                            vPara.insertTrackDeletedObjs(delObjs, true, true);
                                            vPara.parent.container.insertBefore(vPara, targetBlock);
                                            result.push(msgCenter.createMsg(constants.MSGTYPE.Element, [msgCenter.createInsertElementAct(vPara)]));
                                            firstRun = g.modelTools.getFirstChild(nextBlock, g.modelTools.isRun, true);
                                        } else {
                                            lastRun = g.modelTools.getLastChild(startInTable.getParent(), g.modelTools.isRun, true);
                                            var vPara = g.modelTools.createTrackDeletedPara(commAncestor);
                                            vPara.insertTrackDeletedObjs(delObjs, true, true);
                                            vPara.parent.container.append(vPara);
                                            result.push(msgCenter.createMsg(constants.MSGTYPE.Element, [msgCenter.createInsertElementAct(vPara)]));
                                        }
                                    }
                                } else {
                                    var firstCell = g.modelTools.getCell(startModel);
                                    firstRun = firstCell && g.modelTools.getFirstChild(firstCell, g.modelTools.isRun, true);
                                }
                            } else if (endInTable) {
                                if (deletedTbl.indexOf(endInTable) == -1) {
                                    if (startModel && g.modelTools.isParagraph(startModel) && !startModel.deleted && g.modelTools.isTrackable(startModel) ) {
                                        result.push(startModel.insertTrackDeletedObjs(delObjs));
                                    } else if (g.modelTools.isTrackable(endInTable.previous()) && g.modelTools.isParagraph(endInTable.previuos())) {
                                        result.push(endInTable.previous().insertTrackDeletedObjs(delObjs));
                                    } else {
                                        var targetBlock;
                                        if (endInTable.parent == commAncestor)  {
                                            targetBlock = endInTable;
                                        } else {
                                            targetBlock = g.modelTools.getParent(endInTable, function(m) {
                                                return m.parent == commAncestor;
                                            });
                                        }
                                        var vPara = g.modelTools.createTrackDeletedPara(commAncestor);
                                        vPara.insertTrackDeletedObjs(delObjs, true, true);
                                        vPara.parent.container.insertBefore(vPara, targetBlock);
                                        result.push(msgCenter.createMsg(constants.MSGTYPE.Element, [msgCenter.createInsertElementAct(vPara)]));
                                    }
                                    firstRun = g.modelTools.getFirstChild(endInTable, g.modelTools.isRun, true);
                                } else if (nextBlock) {
                                    if (startModel && g.modelTools.isParagraph(startModel) && !startModel.deleted && g.modelTools.isTrackable(startModel))
                                        result.push(startModel.insertTrackDeletedObjs(delObjs));
                                    else if (g.modelTools.isParagraph(nextBlock) && g.modelTools.isTrackable(nextBlock))
                                        result.push(nextBlock.insertTrackDeletedObjs(delObjs, true));
                                    else {
                                        var targetBlock;
                                        if (nextBlock.parent == commAncestor)  {
                                            targetBlock = nextBlock;
                                        } else {
                                            targetBlock = g.modelTools.getParent(nextBlock, function(m) {
                                                return m.parent == commAncestor;
                                            });
                                        }
                                        var vPara = g.modelTools.createTrackDeletedPara(commAncestor);
                                        vPara.insertTrackDeletedObjs(delObjs, true, true);
                                        vPara.parent.container.insertBefore(vPara, targetBlock);
                                        result.push(msgCenter.createMsg(constants.MSGTYPE.Element, [msgCenter.createInsertElementAct(vPara)]));
                                    }
                                    firstRun = g.modelTools.getFirstChild(nextBlock, g.modelTools.isRun, true);
                                } else {
                                    if (startModel && g.modelTools.isParagraph(startModel) && !startModel.deleted && g.modelTools.isTrackable(startModel)){
                                        result.push(startModel.insertTrackDeletedObjs(delObjs));
                                        firstRun = g.modelTools.getFirstChild(startModel, g.modelTools.isRun, true);
                                    }
                                    else {
                                        var vPara = g.modelTools.createTrackDeletedPara(commAncestor);
                                        vPara.insertTrackDeletedObjs(delObjs, true, true);
                                        vPara.parent.container.append(vPara);
                                        result.push(msgCenter.createMsg(constants.MSGTYPE.Element, [msgCenter.createInsertElementAct(vPara)]));
                                    }
                                    firstRun = g.modelTools.getFirstChild(endInTable.getParent(), g.modelTools.isRun, true);
                                }
                            } else {
                                if (deletedTbl.indexOf(startInTable) == -1) {
                                    if (endModel && g.modelTools.isParagraph(endModel) && !endModel.deleted && g.models.isTrackable(endModel)) {
                                        result.push(endModel.insertTrackDeletedObjs(delObjs, true));
                                    } else if (g.modelTools.isParagraph(startInTable.next()) && g.modelTools.isTrackable(startTable.next())) {
                                        result.push(startInTable.next().insertTrackDeletedObjs(delObjs, true));
                                    } else {
                                        var targetBlock;
                                        if (startInTable.parent == commAncestor)  {
                                            targetBlock = startInTable;
                                        } else {
                                            targetBlock = g.modelTools.getParent(startInTable, function(m) {
                                                return m.parent == commAncestor;
                                            });
                                        }
                                        var vPara = g.modelTools.createTrackDeletedPara(commAncestor);
                                        vPara.insertTrackDeletedObjs(delObjs, true, true);
                                        vPara.parent.container.insertAfter(vPara, targetBlock);
                                        result.push(msgCenter.createMsg(constants.MSGTYPE.Element, [msgCenter.createInsertElementAct(vPara)]));
                                    }
                                    lastRun = g.modelTools.getLastChild(startInTable, g.modelTools.isRun, true);
                                } else if (previousBlock) {
                                    if (endModel && g.modelTools.isParagraph(endModel) && !endModel.deleted && g.modelTools.isTrackable(endModel))
                                        result.push(endModel.insertTrackDeletedObjs(delObjs, true));
                                    else if (g.modelTools.isParagraph(previousBlock) && g.modelTools.isTrackable(previousBlock))
                                        result.push(previousBlock.insertTrackDeletedObjs(delObjs));
                                    else {
                                        var targetBlock;
                                        if (previousBlock.parent == commAncestor)  {
                                            targetBlock = previousBlock;
                                        } else {
                                            targetBlock = g.modelTools.getParent(previousBlock, function(m) {
                                                return m.parent == commAncestor;
                                            });
                                        }
                                        var vPara = g.modelTools.createTrackDeletedPara(commAncestor);
                                        vPara.insertTrackDeletedObjs(delObjs, true, true);
                                        vPara.parent.container.insertAfter(vPara, targetBlock);
                                        result.push(msgCenter.createMsg(constants.MSGTYPE.Element, [msgCenter.createInsertElementAct(vPara)]));
                                    }
                                    lastRun = g.modelTools.getLastChild(previousBlock, g.modelTools.isRun, true);
                                } else {
                                    if (endModel && g.modelTools.isParagraph(endModel) && !endModel.deleted && g.modelTools.isTrackable(endModel)) {
                                        result.push(endModel.insertTrackDeletedObjs(delObjs, true));
                                        lastRun = g.modelTools.getLastChild(endModel, g.modelTools.isRun, true);
                                    } else {
                                        var vPara = g.modelTools.createTrackDeletedPara(commAncestor);
                                        vPara.insertTrackDeletedObjs(delObjs, true, true);
                                        vPara.parent.container.appendFront(vPara);
                                        result.push(msgCenter.createMsg(constants.MSGTYPE.Element, [msgCenter.createInsertElementAct(vPara)]));
                                    }
                                    lastRun = g.modelTools.getLastChild(startInTable.getParent(), g.modelTools.isRun, true);
                                }
                            }
                        }
                    }
                    if (!lastRun && !firstRun) {
                        if (startInTable && endInTable) {
                            if (startInTable != endInTable) {
                                if (deletedTbl.indexOf(startInTable) == -1) {
                                    lastRun = g.modelTools.getLastChild(startInTable, g.modelTools.isRun, true);
                                } else if (deletedTbl.indexOf(endInTable) == -1) {
                                    firstRun = g.modelTools.getFirstChild(endInTable, g.modelTools.isRun, true);
                                } else {
                                    if (previousBlock) {
                                        lastRun = g.modelTools.getLastChild(previousBlock, g.modelTools.isRun, true);
                                    } else if (nextBlock) {
                                        firstRun = g.modelTools.getFirstChild(nextBlock, g.modelTools.isRun, true);
                                    } else {
                                        lastRun = g.modelTools.getLastChild(startInTable.getParent(), g.modelTools.isRun, true);
                                    }
                                }
                            } else {
                                var firstCell = g.modelTools.getCell(startModel);
                                firstRun = firstCell && g.modelTools.getFirstChild(firstCell, g.modelTools.isRun, true);
                            }
                        } else if (endInTable) {
                            if (deletedTbl.indexOf(endInTable) == -1) {
                                firstRun = g.modelTools.getFirstChild(endInTable, g.modelTools.isRun, true);
                            } else if (nextBlock) {
                                firstRun = g.modelTools.getFirstChild(nextBlock, g.modelTools.isRun, true);
                            } else {
                                firstRun = g.modelTools.getFirstChild(endInTable.getParent(), g.modelTools.isRun, true);
                            }
                        } else {
                            if (deletedTbl.indexOf(startInTable) == -1) {
                                lastRun = g.modelTools.getLastChild(startInTable, g.modelTools.isRun, true);
                            } else if (previousBlock) {
                                lastRun = g.modelTools.getLastChild(previousBlock, g.modelTools.isRun, true);
                            } else {
                                lastRun = g.modelTools.getLastChild(startInTable.getParent(), g.modelTools.isRun, true);
                            }
                        }
                    }
                    if (!lastRun && !firstRun) {
                        var doc = endInTable && endInTable.getParent() || startInTable && startInTable.getParent();
                        var firstRun = g.modelTools.getFirstChild(doc, g.modelTools.isRun, true);
                    }
                    
                    if (lastRun) {
                       range.setStartModel(lastRun, g.modelTools.getLength(lastRun));
                    } else if (firstRun) {
                       range.setStartModel(firstRun, 0);
                    }
                } else if (startRow == endRow && startRow && startCelll != endCell) {
                    if (!has("trackGroup") && inTrack) {
                        var dels = [], delsParent;
                        for (var delIdx = 0; delIdx < models.length; delIdx++) {
                            var currModel = models[delIdx];
                            if (currModel.deleted && g.modelTools.isTrackable(currModel)) {
                                if (delsParent != currModel.parent && dels.length){
                                    var vPara = g.modelTools.createTrackDeletedPara(delsParent);
                                    vPara.insertTrackDeletedObjs(dels, true, true);
                                    vPara.parent.container.append(vPara);
                                    result && result.push(msgCenter.createMsg(constants.MSGTYPE.Element, [msgCenter.createInsertElementAct(vPara)]));
                                    dels = [];
                                }
                                delsParent = currModel.parent;
                                dels.push(currModel);
                            } else if (currModel.deleted) {
                                // real deleted
                            } else if (currModel.parent == delsParent) {
                                if (dels && dels.length) {
                                    if (g.modelTools.isTrackable(currModel) && g.modelTools.isParagraph(currModel)) {
                                        result && result.push(currModel.insertTrackDeletedObjs(dels, true));
                                    } else {
                                        var vPara = g.modelTools.createTrackDeletedPara(delsParent);
                                        vPara.insertTrackDeletedObjs(dels, true, true);
                                        vPara.parent.container.insertBefore(vPara, currModel);
                                        result && result.push(msgCenter.createMsg(constants.MSGTYPE.Element, [msgCenter.createInsertElementAct(vPara)]));
                                    }
                                    dels = [];
                                    delsParent = null;
                                }
                            } else if (dels && dels.length) {
                                var vPara = g.modelTools.createTrackDeletedPara(delsParent);
                                vPara.insertTrackDeletedObjs(dels, true, true);
                                vPara.parent.container.append(vPara, currModel);
                                result && result.push(msgCenter.createMsg(constants.MSGTYPE.Element, [msgCenter.createInsertElementAct(vPara)]));
                                dels = [];
                                delsParent = null;                            }
                        }
                        if (dels && dels.length) {
                            var vPara = g.modelTools.createTrackDeletedPara(delsParent);
                            vPara.insertTrackDeletedObjs(dels, true, true);
                            vPara.parent.container.append(vPara);
                            result && result.push(msgCenter.createMsg(constants.MSGTYPE.Element, [msgCenter.createInsertElementAct(vPara)]));
                            dels = [];
                            delsParent = null;
                        }
                    }
                    range.moveToEditStart(startCelll);
                } else {
                    var endIdxFix = 0;
                    if (startModel != endModel && (merge || inTrack)) { // merge startModel and endModel
                        var msgs;
                        if (bReturnMsg)
                            msgs = result;

                        if (has("trackGroup") && inTrack) {
                            // we may need to merge more, because some paragraph inside may be not fully deleted.
                            var last;
                            var existModels = array.filter(models, function(m) {
                                return !m.deleted && !m.isTrackDeleted(m.ch);
                            });
                            var firstExistPara = null;

                            for (var i = 0; i < existModels.length; i++) {
                                var c = existModels[i];
                                if (!firstExistPara && c.modelType == constants.MODELTYPE.PARAGRAPH) {
                                    firstExistPara = c;
                                }
                                if (firstExistPara && c.modelType == constants.MODELTYPE.PARAGRAPH && c != firstExistPara) {
                                    var msgs2 = firstExistPara.directProperty.applyDirectStyle(c, true);
                                    array.forEach(msgs2, function(msg) {
                                        msgHelper.mergeMsgs(msgs, msg);
                                    });
                                    c.markReset();
                                }
                            }

                            var last = existModels.length ? existModels[existModels.length - 1] : null;
                            var i = array.indexOf(models, last);
                            // In order to not delete sectId twice
                            // use a point to mark model of real sectId
                            // change it when that paragraph merge to prev one
                            var lastSectIdModel = endModel;
                            while (last && i > 0) {
                                i--;
                                var prev = models[i];
                                while (prev && prev.deleted) {
                                    i--;
                                    prev = models[i];
                                }

                                if (prev && !prev.deleted) {
                                    if (last.modelType == constants.MODELTYPE.PARAGRAPH && prev.modelType == constants.MODELTYPE.PARAGRAPH) {
                                        var rPrCh = prev.getRPrCh && prev.getRPrCh();
                                        if (!rPrCh || rPrCh.length == 0 || (rPrCh.length == 1 && rPrCh[0].t == "prop")) {
                                            // no insert, delete tag, so we can merge
                                            if (last == lastSectIdModel)
                                                lastSectIdModel = prev;
                                            g.modelTools.mergeParagraphs(prev, last, msgs);
                                        }
                                    }

                                    last = prev;
                                }
                            }
                            var bStartModel = false;
                            for (var i = 0; i < models.length; i++) {
                                var curr = models[i];
                                if (!curr.deleted && !(curr.isTrackDeleted && curr.isTrackDeleted(curr.ch)) && bStartModel) {
                                    startModel = curr;
                                    break;
                                }
                            }
                            // update section
                            if (startModel != lastSectIdModel)
                                this._mergeParaSection(startModel, lastSectIdModel, msgs);
                        } else if (inTrack) {
                            var startModelIdx = models.indexOf(startModel),
                                endModelIdx = models.indexOf(endModel);
                            var preModels = [], midModels = [], afterModels = [];
                            if (startModel && !startModel.deleted) {
                                var noRPRCh = false;
                                if (g.modelTools.isTrackable(startModel)) {
                                    if (startModelIdx > 0)
                                        preModels = deletedFilter(models.slice(0, startModelIdx));
                                    if (endModelIdx > 0)
                                        midModels = deletedFilter(models.slice(startModelIdx + 1, endModelIdx));
                                    if (endModelIdx < models.length - 1)
                                        afterModels = deletedFilter(models.slice(endModelIdx + 1, models.length));
                                    if (preModels.length) {
                                        var msg = startModel.insertTrackDeletedObjs(preModels, true, true);
                                        msg && msgs.push(msg);
                                    }
                                    if (midModels.length) {
                                        var msg = startModel.insertTrackDeletedObjs(midModels, false, true);
                                        msg && msgs.push(msg);
                                        noRPRCh = true;
                                        startIndex++;
                                    }
                                    if (afterModels.length) {
                                        endModel.insertTrackDeletedObjs(afterModels,false, true);
                                    }
                                } else if (g.modelTools.isTrackable(endModel)) {
                                     if (endModelIdx > 0)
                                        preModels = deletedFilter(models.slice(0, endModelIdx));
                                    if (endModelIdx < models.length - 1)
                                        afterModels = deletedFilter(models.slice(endModelIdx + 1, models.length));
                                    if (preModels.length) {
                                        endModel.insertTrackDeletedObjs(preModels, true, true);
                                    }
                                    if (afterModels.length) {
                                        endModel.insertTrackDeletedObjs(afterModels,false, true);
                                    }
                                } else {
                                    var allDels = deletedFilter(models);
                                    if (allDels.length) {
                                        var startParent = g.modelTools.getParent(startModel, function(parent) {
                                            return parent.parent == commAncestor;
                                        });
                                        var vPara = g.modelTools.createTrackDeletedPara(commAncestor);
                                        vPara.insertTrackDeletedObjs(allDels, true, true);
                                        vPara.parent.container.insertAfter(vPara, startParent);
                                        msgs && msgs.push(msgCenter.createMsg(constants.MSGTYPE.Element, [msgCenter.createInsertElementAct(vPara)]));
                                    }
                                }
                                startModel = g.modelTools.mergeParagraphs(startModel, endModel, msgs, noRPRCh);
                            } else if (endModel && !endModel.deleted) {
                                if (g.modelTools.isTrackable(endModel)) {
                                    if (endModelIdx > 0)
                                        preModels = deletedFilter(models.slice(0, endModelIdx));
                                    if (endModelIdx < models.length - 1)
                                        afterModels = deletedFilter(models.slice(endModelIdx + 1, models.length));
                                    if (preModels.length) {
                                        var msg = endModel.insertTrackDeletedObjs(preModels, true);
                                        endIdxFix = 1;
                                        msg && msgs.push(msg);
                                    }
                                    if (afterModels.length) {
                                        var msg = endModel.insertTrackDeletedObjs(afterModels);
                                        msg && msgs.push(msg);
                                    }
                                } else {
                                    var allDels = deletedFilter(models);
                                    if (allDels.length) {
                                        var endParent = g.modelTools.getParent(endModel, function(parent) {
                                            return parent.parent == commAncestor;
                                        });
                                        var vPara = g.modelTools.createTrackDeletedPara(commAncestor);
                                        vPara.insertTrackDeletedObjs(allDels, true, true);
                                        vPara.parent.container.insertBefore(vPara, endParent);
                                        msgs && msgs.push(msgCenter.createMsg(constants.MSGTYPE.Element, [msgCenter.createInsertElementAct(vPara)]));
                                    }
                                }
                                endModel.buildRuns();
                            } else {
                                //TODO: should never happen?
                            }
                        } else{
                            startModel = g.modelTools.mergeParagraphs(startModel, endModel, msgs);
                        }
                    }
                    if (!removeStart) {
                        var msgs;
                        if (bReturnMsg)
                            msgs = result;

                        range && range.setStartModel(startModel, startIndex);
                        if (startModel != endModel && !merge)
                            this._removeParaSection(startModel, msgs);
                    } else if (!removeEnd)
                        range.setStartModel(endModel, endIdxFix || 0);
                }
                range.collapse(true);
                //append the comment del msg
                var cmtMsgs = pe.lotusEditor.relations.commentService.checkCommentsDelete();
                if (cmtMsgs.length > 0)
                    result = result.concat(cmtMsgs);
                //
                if (has("trackGroup")) {
                    trackBlockGroupManager && trackBlockGroupManager.resumeBuildGroup();
                    // will mark dirty only one time
                    trackBlockGroupManager && trackBlockGroupManager.beginDirtyRecord();
                    var groupsNeedCheck = {};
                    for (var i=0; i < models.length; i++) {
                        var c = models[i];
                        if (c.modelType == constants.MODELTYPE.PARAGRAPH && c.isTrackBlockGroup) {
                            // get the real paragraph when group is destroyed
                            c = c.getFixedTarget();
                        }
                        // skip the destroyed groups
                        if (c.deleted && c.isTrackBlockGroup)
                            continue;
                        if (c.parent.modelType == constants.MODELTYPE.PARAGRAPH && c.parent.isTrackBlockGroup) {
                            if (c == c.parent.getLastPara())
                                c = c.parent;
                            else if (models[i] != c)
                                c = c.parent;
                            else
                                continue;
                        }
                        var nextPara = c.next();
                        var newGroup;
                        while (nextPara && nextPara.deleted)
                            nextPara = nextPara.next();
                        if (nextPara && nextPara.buildGroup){
                            newGroup = nextPara.buildGroup();
                            if (newGroup && !groupsNeedCheck[newGroup.id])
                                groupsNeedCheck[newGroup.id] = newGroup;
                        }
                    }
                    for (var groupId in groupsNeedCheck)
                        groupsNeedCheck[groupId].getFirstUndeletedPara().fillHintIfEmpty();
                    if (has("trackGroup"))
                        trackBlockGroupManager && trackBlockGroupManager.endDirtyRecord();
                }
                trackChange.endRecord();
                return result;
                //...
            },
            toRealModel: function() {
                if (!has("trackGroup"))
                    return this;
                var start = this.getStartParaPos();
                if (start && g.modelTools.isTrackBlockGroup(start.obj)) {
                    var redirects = start.obj.redirectIndex(start.index);
                    if (redirects && redirects[0]) {
                        this.setStartModel(redirects[0].obj, redirects[0].start);
                    }
                }
                var end = this.getEndParaPos();
                if (end && g.modelTools.isTrackBlockGroup(end.obj)) {
                    var redirects = end.obj.redirectIndex(end.index);
                    if (redirects && redirects.length) {
                        redirect = redirects[redirects.length - 1];
                        this.setEndModel(redirect.obj, redirect.start);
                    }
                }
                return this;
            },
            toVirtualModel: function() {
                if (!has("trackGroup"))
                    return this;
                var start = this.startModel;
                if (start && start.obj && g.modelTools.isParagraph(start.obj) && g.modelTools.isTrackBlockGroup(start.obj.parent)) {
                    start.index = start.obj.parent._indexFromChild(start.obj, start.index);
                    start.obj = start.obj.parent;
                }
                var end =  this.endModel;
                if (end && end.obj && g.modelTools.isParagraph(end.obj) && g.modelTools.isTrackBlockGroup(end.obj.parent)) {
                    end.index = end.obj.parent._indexFromChild(end.obj, end.index);
                    end.obj = end.obj.parent;
                }
                return this;
            }
        });
    g.RangeClass = Range;
    return Range;
});
