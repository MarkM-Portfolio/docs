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
    "dojo/topic",
    "dojo/aspect",
    "writer/constants",
    "writer/track/TrackChangeAct",
    "writer/track/trackChange",
    "writer/global"
], function (declare, lang, array, topic, aspect, constants, TrackChangeAct, trackChange, g) {

    // for simplicity, only record content change in main content, rootView.

    var TrackChangeAreaSummary = declare("writer.track.TrackChangeAreaSummary", null, {

        activated: false,
        statics: {
            chId: 1,
            sumId: 1,
        },

        constructor: function (start, end, internal) {
            this.seen = {};
            this.actions = [];
            this.doms = [];
            this.start = start;
            this.end = end;
            this.mc = constants.MSGCATEGORY.Content;
            this.internal = internal;
            this.modelActIdsCacheMap = {};
        },

        clear: function () {
        	this.seen = {};
        	this.actions = [];
        	this.modelActIdsCacheMap = {};
        },

        getOrderedActions: function () {
            var actions = [];
            actions.push.apply(actions, this.actions);

            // filter bookmark actions.
            for (var i = actions.length - 1; i >= 0; i--) {
                var act = actions[i];
                if (act.isBookMarkAct()) {
                    actions.splice(i, 1);
                }
            }
            return actions;
        },

        getActsByModel: function (m, real, onlyForDelete) {
            var obj = real || m;
            var objId = obj.__trackSumId;
            if (!objId)
                return [];
            var acts = array.filter(this.modelActIdsCacheMap[objId] || [], function(act){
                return !act.deleted
            });
            if (acts && acts.length && onlyForDelete)
            {
                acts = array.filter(acts, function(act){
                   for(var i = 0 ; i < act.modelChPairs.length; i++)
                   {
                        var pair = act.modelChPairs[i];
                        if (pair.model == obj)
                        {
                            var ch = pair.ch;
                            if (array.some(ch, function(c){
                                return c.t == "del";
                            }))
                            {
                                return true;
                            }
                            break;
                        }
                   }
                   return false;
                });  
            }
            return acts;
        },

        isLastModelOfAct: function (m, act) {
            if (m && act.modelChPairs) {
                var l = act.modelChPairs.length;
                if (l > 0)
                    return (act.modelChPairs[l - 1].model == m);
            }
            return false;
        },

        updateTime: function (start, end) {
            if (this.start != start || this.end != end) {
                this.start = start;
                this.end = end;
                return true;
            }
        },

        build: function (root, opt) {
            this.activated = true;
            this.modelActIdsCacheMap = {};

            var time = new Date();
            var me = this;
            var doc = root;
            var options = opt || {};
            options.users = {};
            options.actions = [];
            if (!doc) {
                doc = pe.lotusEditor.document.container;
                doc.forEach(function (m) {
                    me._group(m, options);
                });
                me.actions = options.actions;
            } else {
                // some array
                doc.forEach(function (m) {
                    me._group(m, options);
                });
                this.actions = options.actions;
            }
            // var time2 = new Date();
            // if (!this.internal)
            //    console.info("Track Change build cost " + (time2 - time));

            topic.subscribe("/track/act/updated", function (act, dirty, isDelete) {
                if (isDelete) {
                    clearTimeout(me._checkNewTimer);
                    me._checkNewTimer = setTimeout(lang.hitch(me, me.checkNew), 10);
                }
                else
                    me.checkActionSeen(act);
            });
        },

        _groupCh: function (m, ch, options, realModel) {
            if (m.deleted && !(m.modelType == constants.MODELTYPE.TABLE && m.isTrackDeleted()))
            	return;

            if (m.length == 0 && m.modelType == constants.MODELTYPE.TEXT) {
                // dummy run
                return;
            }

            var me = this;

            /*
            if (m.isTrackDeletedMyInsertion(ch))
            {
                // it is an insertedByMe;
                // console.warn("found an insertByMe");
                return;
            }
            */

            var insCh = ch && ch.length ? array.filter(ch, function (c) {
                return c.t == "ins" && c.d >= me.start && c.d <= me.end;
            })[0] : null;

            var delCh = ch && ch.length ? array.filter(ch, function (c) {
                return c.t == "del" && c.d >= me.start && c.d <= me.end;
            })[0] : null;

            if (insCh && delCh && insCh.u == delCh.u && m.modelType != constants.MODELTYPE.TABLE ) {
                return;
            }

            var changes = [];
            var users = [];
            if (insCh) {
                changes.push(insCh);
                users.push(insCh.u);
            }
            if (delCh) {
                changes.push(delCh);
                if (array.indexOf(users, delCh.u) < 0)
                    users.push(delCh.u);
            }

            var newAct = function (m, u, insCh, delCh) {
                var chs = [];
                if (insCh && insCh.u == u) {
                    chs.push(insCh);
                }
                if (delCh && delCh.u == u) {
                    chs.push(delCh);
                }

                var start = 0;
                var end = 0;
                var act = new TrackChangeAct(u, me.mc);

                array.forEach(chs, function (ch) {
                    if (!start || start > ch.d)
                        start = ch.d;
                    if (!end || end < ch.d)
                        end = ch.d;
                    act.addType(ch.t);
                });

                var modelChPair = {
                    model: m,
                    ch: chs,
                    realModel: realModel
                };
                var obj = realModel || m;  // realModel is the real para, m is the para group
                var trackSumId = obj.__trackSumId;
                if (!trackSumId)
                    trackSumId = obj.__trackSumId = me.statics.sumId ++; 
                var ids = me.modelActIdsCacheMap[trackSumId];
                if (!ids)
                    me.modelActIdsCacheMap[trackSumId] = [act];
                else
                    me.modelActIdsCacheMap[trackSumId].push(act);
                
                act.modelChPairs = [modelChPair];
                act.start = start;
                act.end = end;

                if (!options.users[u])
                    options.users[u] = [];

                options.users[u].push(act);
                options.actions.push(act);
            };

            // lastChange, last ch array in time.
            // lastModel, last model,
            // lastChModel. last model with ch array in time.

            if (insCh || delCh) {
                if (this.isSplitTracksItem(m, options)) {
                    array.forEach(users, function (u) {
                        if (insCh && insCh.u == u)
                        	newAct(m, u, insCh);
                        if (delCh && delCh.u == u)
                        	newAct(m, u, null, delCh);
                    });
                } else {
                    var continuedUsers = trackChange.getContinueUsers(options.lastChanges, changes);
                    var newUsers = [];
                    array.forEach(users, function (u) {
                        if (array.indexOf(continuedUsers, u) < 0)
                            newUsers.push(u);
                    });
                    if (newUsers.length) {
                        array.forEach(newUsers, function (u) {
                            newAct(m, u, insCh, delCh);
                        });
                    }
                    if (continuedUsers.length) {
                        array.forEach(continuedUsers, function (u) {
                            var userActs = options.users[u];

                            var act = userActs[userActs.length - 1];

                            var start = 0;
                            var end = 0;

                            var chs = [];
                            if (insCh && insCh.u == u) {
                                chs.push(insCh);
                            }
                            if (delCh && delCh.u == u) {
                                chs.push(delCh);
                            }

                            array.forEach(chs, function (ch) {
                                if (!start || start > ch.d)
                                    start = ch.d;
                                if (!end || end < ch.d)
                                    end = ch.d;

                                act.addType(ch.t);
                            });

                            if (!act.start || act.start > start)
                                act.start = start;
                            if (!act.end || act.end < end)
                                act.end = end;

                            var modelChPair = {
                                model: m,
                                ch: chs,
                                realModel: realModel
                            };
                            var obj = realModel || m;
                            var trackSumId = obj.__trackSumId;
                            if (!trackSumId)
                                trackSumId = obj.__trackSumId = me.statics.sumId ++; 
                            var ids = me.modelActIdsCacheMap[trackSumId];
                            if (!ids)
                                me.modelActIdsCacheMap[trackSumId] = [act];
                            else
                                me.modelActIdsCacheMap[trackSumId].push(act);
                            
                            act.modelChPairs.push(modelChPair);
                        });
                    }
                }
                options.lastChModel = m;
            }

            options.prevChanges = options.lastChanges;
            options.lastModel = m;
            options.lastChanges = changes;
            options.lastUsers = users;
        },

        _groupInsDelCh: function (m, options, chKey, vModel) {
            var key = chKey || "ch";
            var getMethodName = "get" + key.replace(/(\w)/, function (v) {
                return v.toUpperCase();
            });
            var ch;
            if (m[getMethodName])
                ch = m[getMethodName]() || [];
            else {
                ch = m[key] || [];

                var para = m.rParagraph || m.paragraph;
                if (para && para.ch) {
                    ch = ch.concat(para.ch);
                }
            }
            var hasIns, hasDel;
            ch = array.filter(ch, function (c) {
                if (c.t == "ins") {
                    if (!hasIns) {
                        hasIns = true;
                        return true;
                    }
                    return false;
                }
                if (c.t == "del") {
                    if (!hasDel) {
                        hasDel = true;
                        return true;
                    }
                    return false;
                }
                return true;
            });
            var hasInsDel = ch.length && (hasIns || hasDel);

            if (vModel)
                this._groupCh(vModel, hasInsDel ? ch : null, options, m);
            else
                this._groupCh(m, hasInsDel ? ch : null, options);
        },

        _group: function (m, options) {
            var me = this;
            if (m.modelType == constants.MODELTYPE.ROW) {
                //			this._groupInsDelCh(m, options); //row
                if (!m.isTrackDeleted()) {
                    m.container && m.container.forEach(function (m2) {
                        // m2 is a cell.
                        m2.container.forEach(function (m3) {
                            // m3 is a para
                            me._group(m3, options);//paras
                        });
                    });
                }
            } else if (m.modelType == constants.MODELTYPE.CELL) {
                //			this._groupTCPRCh(m, options); //cell properties
            } else if (m.modelType == constants.MODELTYPE.TABLE) {
                this._groupInsDelCh(m, options);
                if (!m.isAllDeletedInTrack()) {
                    var tblOptions = {};
                    tblOptions.users = {};
                    tblOptions.actions = [];
                    m.rows.forEach(function (m2) {
                        me._group(m2, tblOptions);//row
                    });
                    options.actions = options.actions.concat(tblOptions.actions);
                }
            } else if (m.modelType == constants.MODELTYPE.PARAGRAPH) {
                if (m.isTrackBlockGroup) {
                    var firstRun = m.container && m.container.getFirst();
                    while (firstRun) {
                        var nextRun = m.container.next(firstRun);
                        me._group(firstRun, options);
                        if (nextRun && firstRun.rParagraph && nextRun.rParagraph != firstRun.rParagraph)
                            me._groupInsDelCh(firstRun.rParagraph, options, "rPrCh", m);
                        firstRun = nextRun;
                    }
                } else {
                    m.container && m.container.forEach(function (m2) {
                        me._group(m2, options);
                    });
                }
                // do not group the last br in the para.
                var mParent = m.getParent();
                if (mParent) {
                    var container = mParent.container;
                    if (!container || (container.getLast() != m))
                        this._groupInsDelCh(m, options, "rPrCh");
                }
            } else if (g.modelTools.isTextBox(m)) {
                this._groupInsDelCh(m, options);
                if (!m.isTrackDeleted() && m.container) {
                    m.container.forEach(function (m2) {
                        me._group(m2, options);
                    });
                }
            } else if (g.modelTools.isCanvas(m)) {
                this._groupInsDelCh(m, options);
                // we do not record things in canvas;
            } else if (g.modelTools.isTrackDeletedObjs(m)) {
                if (m.pRPrCh)
                {
                    this._groupInsDelCh(m, options, "pRPrCh");
                }
                m.objs && m.objs.forEach(function (m2) {
                    me._group(m2, options);
                });
            } else if (m.container) {
                m.container.forEach(function (m2) {
                    me._group(m2, options);
                });
            } else {
                this._groupInsDelCh(m, options);
            }
        },

        getSeenBaseTime: function () {
            return trackChange.seenTime || trackChange.lastVisitTime || trackChange.initTime;
        },

        setSeenBaseTime: function () {
            trackChange.seenTime = new Date().valueOf();
            this.checkActionsSeen();
        },

        markSeen: function (act) {
            for (var j = 0; j < act.modelChPairs.length; j++) {
                var pair = act.modelChPairs[j];
                var chs = pair.ch || [];
                for (var k = 0; k < chs.length; k++) {
                    var ch = chs[k];
                    if (!ch.id) {
                        // should not go here.
                        ch.id = this.statics.chId++;
                    }
                    this.seen[ch.id] = true;
                }
            }
            act.seen = true;
            this.checkNew();
        },

        checkActionSeen: function (act) {
            var allSeen = true;
            var time = this.getSeenBaseTime();
            if (act.end >= time) {
                for (var j = 0; j < act.modelChPairs.length; j++) {
                    if (!allSeen)
                        break;
                    var pair = act.modelChPairs[j];
                    var chs = pair.ch || [];
                    for (var k = 0; k < chs.length; k++) {
                        var ch = chs[k];
                        if (!ch.id) {
                            // should not go here.
                            ch.id = this.statics.chId++;
                        }
                        if (ch.t < time) {
                            // I have seen this ch by time.
                        }
                        else if (!this.seen[ch.id]) {
                            // I did not seen this by click
                            allSeen = false;
                            break;
                        }
                    }
                }
            }
            act.seen = allSeen;
            clearTimeout(this._checkNewTimer);
            this._checkNewTimer = setTimeout(lang.hitch(this, this.checkNew), 10);
            return allSeen;
        },
        checkActionsSeen: function () {
            for (var i = this.actions.length - 1; i >= 0; i--) {
                var act = this.actions[i];
                this.checkActionSeen(act);
            }
            this.checkNew();
        },
        checkNew: function () {
            clearTimeout(this._checkNewTimer);
            if (!this.activated)
                return;
            var newCount = 0;
            for (var i = this.actions.length - 1; i >= 0; i--) {
                var act = this.actions[i];
                if (act.isBookMarkAct())
                    continue;
                if (!act.seen) {
                    newCount++;
                }
            }
            if(!pe.scene.hasChangeHistory() && newCount > 0)
            	pe.scene.setChangeHistoryState(true);
            topic.publish("/trackChange/new", newCount);
        },
        onObjUpdated: function (obj, mode, type) {
            if (g.modelTools.inDelTable(obj))
                return;
            var objs = [];
            if (type && type == "table" || obj.modelType == "table.table")
                objs = this.onTableUpdated(obj, mode);
            else
                objs = this.onParaUpdated(obj, mode);
            this.checkNew();
            return objs;
        },

        removeActionsEffected: function (objs) {
            var me = this;
            var actions = this.actions;
            for (var i = 0; i < actions.length; i++) {
                var action = actions[i];

                var length = action.modelChPairs.length;
                var m = [].concat(action.modelChPairs);
                
                if (array.some(m, function(pair){
                    var p = pair.model;
                    if (p.deleted || array.some(objs, function (para) {
                        return p == para || g.modelTools.isChildOf(p, para);
                    }))
                    {
                        return true;
                    }
                }))
                {
                    // any model is deleted or this model is sub model of this para.
                    action.markDeleted();
                    actions.splice(i, 1);
                    i--;
                    if (i == actions.length - 1)
                        break;
                }
            }
        },

        onTableUpdated: function (obj, mode) {
            var updatedObjs = [];
            var actions = this.actions;
            
            if (obj.modelType != constants.MODELTYPE.TABLE)
                obj = g.modelTools.getTable(obj);
            if(obj && obj.getTrackedGroupItems)
            {
	            if(mode == "dirty")
	            	updatedObjs = obj.getTrackedGroupItems(true, true, this.start, this.end, false);
	            else
	            	updatedObjs = obj.getTrackedGroupItems(true, true, this.start, this.end, true);
            }
            
            if(updatedObjs.length > 0)
            {
	            var sub = new TrackChangeAreaSummary(this.start, this.end, true);
	            sub.build(updatedObjs);
	
	            this.removeActionsEffected(updatedObjs);
	
	            if (sub.actions.length)
	                this.insertSubSum(updatedObjs, sub);
            }

            return updatedObjs;
        },

        onParaUpdated: function (para, mode) {
            // when something occur in para. // "reset", "insert", "dirty", "delete"
            // we need to recalculate the changes in this area.
            // it may need to re-connect the ends together, but we do not bother to do that for performance.

            // firstly find a unbreakable area include this para to rebuild the groups for this area. delete 
            // console.info("update group " + para.id + " " + mode);
            var me = this;
            var actions = this.actions;

            if (mode == "delete") {
                // analysis the impact
                // 1. the model inside the para should kick out of groups
                this.removeItemInGroup(para);

                // 2. we may have continues between prev para and next para.
                var prevPara = para.prevObj; // assigned after delete.
                if (!prevPara) {
                    prevPara = para.parent;
                }
                if (prevPara.modelType != constants.MODELTYPE.PARAGRAPH)
                    prevPara = g.modelTools.getPrev(prevPara, g.modelTools.isParagraph);

                if (prevPara && !prevPara.deleted) {
                    var paras = this.onParaUpdated(prevPara, "delete-prev");
                    return [].concat(paras).concat([para]);
                }
                return [para];
            }

            var paras = para.getTrackedGroupParas(true, true, this.start, this.end);
            if (!(mode == "delete-prev" && paras.length == 1)) {
                // if mode is "delete-prev" && the para is it self, because the prev para would not be connected with para below.
                var sub = new TrackChangeAreaSummary(this.start, this.end, true);
                sub.build(paras);
                this.removeActionsEffected(paras);
                if (sub.actions.length)
                    this.insertSubSum(paras, sub);
            }

            if (!this.actions)
                this.actions = [];

            return paras;
        },

        insertSubSum: function (objs, sub) {
            var subActs = sub.actions;
            var actions = this.actions;
            var me = this;
            var insertIndex = 0;
            var obj = objs[0];
            var preIndex = this.getLastActIndexOfPreObj2(actions, obj);
            if (preIndex.idx >= 0) {
                var subIndex = preIndex.idx;
                var prevObj = preIndex.prevObj;
                insertIndex = subIndex + 1;
            }

            var head = actions.slice(0, insertIndex);
            var tail = actions.slice(insertIndex);
            this.actions = head.concat(subActs).concat(tail);

            array.forEach(subActs, function (act) {
                me.checkActionSeen(act);
            });
            
            for (var id in sub.modelActIdsCacheMap)
            {
                this.modelActIdsCacheMap[id] = sub.modelActIdsCacheMap[id];
            }
        },

        isSplitTracksItem: function (m, options) {
            
            if (!options.lastChModel || this.isSingleTrackItem(m))
                return true;
                
            if (options.lastModel && options.lastModel.modelType == constants.MODELTYPE.TRACKDELETEDOBJS)
                return false;

            if (options.lastModel != options.lastChModel) {
                return true;
            }

            if (options.lastModel && this.isSingleTrackItem(options.lastModel))
                return true;

            return false;
        },

        isSingleTrackItem: function (obj) {
            return g.modelTools.isImage(obj) || g.modelTools.isTable(obj) || g.modelTools.isTextBox(obj) || g.modelTools.isCanvas(obj) || g.modelTools.isTrackDeletedRef(obj) || g.modelTools.isTrackOverRef(obj);
        },
        
        _removeModelIdFromCache: function(actModel, action)
        {
            var id = actModel.__trackSumId;
            if (id)
            {
                var acts = this.modelActIdsCacheMap[id];
                if (acts)
                {
                    var index = acts.indexOf(action);
                    if (index >= 0)
                        acts.splice(index, 1);
                }
            }
        },

        removeItemInGroup: function (obj) {
            // console.info("remove item " + obj.id);
            var actions = this.actions;
            var me = this;

            // analysis the impact
            // 1. the model inside the para should kick out of groups
            for (var i = 0; i < actions.length; i++) {
                var action = actions[i];
                // cut models from deleted paragraph.
                var length = action.modelChPairs.length;
                action.modelChPairs = array.filter(action.modelChPairs, function (pair) {
                    var actModel = pair.model;
                    if (actModel.deleted || actModel == obj || g.modelTools.getParagraph(actModel) == obj || g.modelTools.isChildOf(actModel, obj))
                    {
                        me._removeModelIdFromCache(actModel, action);
                        return false;
                    }
                    else
                        return true;
                });

                var length2 = action.modelChPairs.length;
                if (length2 != length) {
                    action.markDirty();
                }
                if (length2 == 0) {
                    action.markDeleted();
                    actions.splice(i, 1);
                    i--;
                    if (i == actions.length - 1)
                        break;
                }
            }
        },

/*
        deleteTableActs: function (acts, obj) {
            if (!acts)
                return;

            if (obj.modelType == constants.MODELTYPE.ROW)
                return this.removeTRActs(acts, obj);

            var curActIdx = this.getActIndexByModel(obj, acts);
            if (curActIdx >= 0) {
                acts[curActIdx].markDeleted();
                acts.splice(curActIdx, 1);
            }
            this.deleteTableContentsActs(acts, obj);
            if (curActIdx > 0)
                this.mergeActWithNext(acts, curActIdx - 1);
        },

        deleteTableContentsActs: function (acts, obj) {
            var actIdxs = this.getTableContentActIndex(acts, obj);
            var actIdx = actIdxs[0];
            for (var j = 0; j < actIdxs.length; j++) {
                acts[actIdx].markDeleted();
            }
            acts.splice(actIdx, actIdxs.length);
        },

        removeTRActs: function (acts, tr) {
            var cIdx = this.getTableContentActIndex(acts, tr.parent);
            if (cIdx.length < 1)
                return;

            var lEnd = cIdx[0] + cIdx.length;

            for (var i = lEnd; i >= cIdx[0]; i--) {
                var act = acts[i];
                if (!act)
                    continue;
                var ms = act.modelChPairs;
                var sIdx = -1;
                var sL = 0;
                for (var j = 0; j < ms.length; j++) {
                    if (g.modelTools.isChildOf(ms[j].model, tr)) {
                        if (sIdx == -1)
                            sIdx = j;
                        sL++;
                    }
                    else if (sL)
                        break;
                }
                if (sIdx == 0 && sL == ms.length) {
                    act.markDeleted();
                    acts.splice(cIdx[i], 1);
                }
                else if (sL) {
                    act.markDirty();
                    ms.splice(sIdx, sL);
                    break;
                }
            }
        },
        
        getLastActIndexOfPreObj: function (actions, obj, deep) {
            // not accrurate for group.
            var index = -1;
            var prevObj = null;
            if (actions.length == 0)
                return { "idx": index, "prevObj": prevObj };
            var prevObj =  g.modelTools.getPreTrackingObj(obj, false);
            while (prevObj) {
                index = this.getActIndexByModel(prevObj, actions);
                if (index < 0)
                    prevObj = g.modelTools.getPreTrackingObj(prevObj, false);
                else {
                    if (index < (actions.length - 1) && this.isSingleTrackItem(prevObj)) {
                    	
                    	var act = actions[index + 1];
                    	if (this.getModelIndex(act.modelChPairs, prevObj) >=0)
                            index++;
                    }
                    break;
                }
            }
            return { "idx": index, "prevObj": prevObj };
        },
*/

        // compare method can not return the correct position relationship in model.
        // compareModelLocation method, what about the container and containee. paragraph rprch..
        // not to use this method for now.
        getLastActIndexOfPreObj2: function (actions, obj) {

            var index = -1;
            var len = actions.length;
            var mid = Math.floor(len / 2);

            if (len == 0) {
                return { "idx": -1, "prevObj": null };
            }


            var low = 0, high = len - 1;
            var mid;
            while (low <= high) {
                mid = Math.floor((low + high) / 2);
                var act = actions[mid];
                var modelChPairs = act.modelChPairs;
                var firstModel = modelChPairs[0].model;
                if (firstModel.modelType != constants.MODELTYPE.TABLE && firstModel.modelType != constants.MODELTYPE.PARAGRAPH)
                    firstModel = g.modelTools.getParagraph(firstModel);

                if (firstModel.modelType == constants.MODELTYPE.PARAGRAPH && firstModel.isInTCGroup && firstModel.isInTCGroup()) {
                    firstModel = firstModel.parent;
                }

                // because we only swap actions in para level, so we just compare the paragraph.

                var isObjBeforeThisAction = g.modelTools.compareModelLocation(obj, firstModel) < 0;
                if (isObjBeforeThisAction) {
                    index = mid;
                    high = mid - 1;
                }
                else {
                    low = mid + 1;
                }
            }
            if (index < 0)
                index = len - 1;
            else
                index = index - 1;
            var obj = index >= 0 ? actions[index].modelChPairs[0].model : null;
            return { "idx": index, "prevObj": obj };
        },

        isContinueChangeModel: function (preModel, nextModel) {
            var nextCh;
            if (nextModel.modelType && nextModel.modelType == constants.MODELTYPE.PARAGRAPH)
                nextCh = [].concat(nextModel.getRPrCh() || []).concat(nextModel.getCh() || []);
            else
                nextCh = nextModel.getCh();

            var prevO = g.modelTools.getPrev(nextModel);
            var isSame = (prevO == preModel);
            if (!isSame) {
                if (prevO.modelType == constants.MODELTYPE.PARAGRAPH && prevO.firstChild() == nextModel)
                    prevO = g.modelTools.getPrev(prevO);
                else {
                    while (prevO && prevO.deleted) {
                        prevO = g.modelTools.getPrev(prevO);
                    }
                }
                isSame = (prevO == preModel);
            }

            if (isSame) {
                var preCh = [].concat(preModel.getRPrCh() || []).concat(preModel.getCh() || []);
                if (preCh)
                    return trackChange.isContinue(preCh, nextCh);
            }
            return false;
        }
    });
    return TrackChangeAreaSummary;
});
