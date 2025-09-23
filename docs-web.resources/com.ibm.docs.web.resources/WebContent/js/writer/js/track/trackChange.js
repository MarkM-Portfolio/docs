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
    "dojo/i18n!writer/nls/track",
    "writer/track/TrackChangeAreaSummary",
    "writer/msg/msgCenter",
    "writer/msg/msgHelper",
    "concord/util/browser",
    "dojo/dom",
    "dojo/dom-class",
    "dojo/dom-construct",
    "dojo/query",
    "dojo/has",
    "dojox/uuid",
    "exports",
    "writer/global"
], function (declare, lang, array, topic, aspect, constants, i18ntrack, TrackChangeAreaSummary, msgCenter, msgHelper, browser, dom, domClass, domConstruct, query, has, uuid, exports, global) {

    var trackChange = lang.mixin(lang.getObject("writer.track.trackChange", true), {

        SELF_INS_TIME: 1000 * 60 * 60 * 24, // An insertion will be just deleted if inserted by myself less than 1 day,
        MAX_TRACK_TXT_DEL_SIZE : 10240, //bytes
        MAX_TRACK_DOC_CONTENT_SIZE : 3, //M; content json, including pure text and all the format string that we supported.

        initTime: 0,
        lastVisitTime: 0,
        createTime: 0,

        on: false,

        editorsReady: false,
        metaReady: false,

        pauseCount: 0,

        start: 0,
        end: Number.MAX_VALUE,

        trackButtonShowed: false,

        refreshInterval : 1500,

        isFileCreatedToday: function () {
            var today = new Date();
            var date = new Date(this.createTime);
            return date.getFullYear() == today.getFullYear() && date.getMonth() == today.getMonth() && date.getDate() == today.getDate();
        },

        editorAdded: function (editor) {
            //this.triggerOn();  
        },

        editorRemoved: function (editorId) {
            this.editorsTime[editorId] = new Date().valueOf();
        },

        editorsUpdated: function () {
            var store = pe.scene.getEditorStore();
//            if (store.getCount() > 1)
//                this.triggerOn();  
            this.triggerEditorsReady();
            this.checkUsersLeaveTime();
        },

        checkUsersLeaveTime: function()
        {
            var store = pe.scene.getEditorStore();
            var container = store.getContainer();
            for (var i = 0; i < container.items.length; i++) {
                var c = container.items[i];
                var id = c.getEditorId();
                var leaveTime = c.getLeaveSessionTime();
                var recoredLeaveTime = this.editorsTime[id];
                if (leaveTime && (!recoredLeaveTime || leaveTime > recoredLeaveTime))
                    this.editorsTime[id] = leaveTime;
            }
        },

        isCurrentUserDocOwner: function()
        {
            return (pe.authenticatedUser.getId() == window.DOC_SCENE.ownerId);
        },

        acceptAllTrackChanges: function(fromMsg)
        {
        	if(!fromMsg){
        		pe.scene.saveDraft();
         		msgCenter.sendAcceptTrackChangeMsg();
        	}

            this.sum && this.sum.clear();
            pe.scene.setChangeHistoryState(false);
        },

        triggerEditorsReady: function () {
            this.editorsReady = true;
            var store = pe.scene.getEditorStore();
            var leaveSession = store.getUserLeaveSessionTime(pe.scene.getCurrUserId());
            if (leaveSession)
            {
            	var chooser = this.panel && this.panel.chooser;
            	var isReset = (this.lastVisitTime == 0);
            	if(!isReset && (chooser && chooser.isLastVisitSelected())) {
            		if(!(this.start == this.lastVisitTime && this.start == leaveSession))
            			isReset = true;
            	}
            	if(isReset) {
            		this.start = this.lastVisitTime = leaveSession;
                    this.updateHistoryTime(this.start, this.end);
            	}
            } else {
            	console.log("This is new user join tracking session!");
            	this.isNewUserTrackSession = true;
            }
//            this.checkButton();
        },

        triggerOn: function (time, fromMsg) {

        	if (!this.docTrackEnabled)
        		return;
        	
            var setting = pe.lotusEditor.setting;
            if (!setting)
            {
                var me = this;
//                setTimeout(function(){
//                    me.triggerOn(time, fromMsg);
//                }, 2000);
                return;
            }
            if (!setting || setting.isTrackChangeOn())
                return;

            if (!time)
                time = new Date().valueOf();
            var set = setting.setTrackChangeOn(time);
            if (set && !fromMsg)
                msgCenter.sendTrackChangeOnMsg(time);
            this.on = setting.isTrackChangeOn();
            this.checkButton();
            if (this.on)
            {
                topic.publish(constants.EVENT.TRACKCHANGE_ON);
                this._refreshStore();
                if (!this.sum.activated)
                {
                    this.buildSummary();
                }
            }
        },

        switchTrackChanges: function(nStatus) {
        	nStatus = (nStatus == undefined ? !this.on : nStatus);

        	if(nStatus){
        		if(this.on) return;

        		this.enableTrack();
        	} else {
        		if(!this.on) return;

        		dojo["require"]("concord.widgets.ConfirmBox");
        		var title = i18ntrack.dialog_turn_off_title;
        		var msg = i18ntrack.dialog_turn_off_msg;
        		var oklabel = i18ntrack.dialog_turn_off_oklabel;
        		var callbk = dojo.hitch(this, function(editor, answer) {
					if (answer) {
						this.disableTrack();
					}
				});

        		var dlg = new concord.widgets.ConfirmBox( null, title, oklabel, true, { message:msg,callback:callbk} );
        		dlg.show();
        	}
        },

        clearChangeHistory: function() {
        	dojo["require"]("concord.widgets.ConfirmBox");

    		var acDTitle = i18ntrack.dialog_accept_all_title;
    		var acDMsg = i18ntrack.dialog_accept_all_msg;
    		var acDOklabel = i18ntrack.dialog_accept_all_oklabel;
    		var acDCallbk = dojo.hitch(this, function(editor, answer) {
				if (answer)
					this.acceptAllTrackChanges();
			});

    		var acDlg = new concord.widgets.ConfirmBox( null, acDTitle, acDOklabel, true, { message:acDMsg,callback:acDCallbk} );
    		acDlg.show();
        },

        enableTrack: function(time, fromMsg) {
        	if(!this.sum) {
                this.sum = new TrackChangeAreaSummary(this.start, this.end);
                var me = this;
                aspect.after(this.sum, "onSumChanged", lang.hitch(me, "onSumChanged"), true);
                this._pendingUpdates = [];       		
        	}

        	this.triggerOn(time, fromMsg);
        },

        disableTrack: function(fromMsg) {
            pe.lotusEditor.setting.setTrackChangeOff();
        	this.on = false;
        	this.panel && this.panel.chooser && this.panel.chooser.reset();
        	if(this.isTrackShowActived())
        		pe.scene.getSidebar().toggle();

        	pe.scene.hideTrackButton();
        	this.setCoedtingMenuItem(true);
        	this.trackButtonShowed = false;
            if(!fromMsg)
            	msgCenter.sendTrackChangeOffMsg();
//            if(this.sum)
//            	delete this.sum;
        },

        setCoedtingMenuItem: function(enabled){
        	if(pe.coedtingMenuItem) {
        		var isEnabled = (pe.coedtingMenuItem.domNode.style.display == "");
        		if(enabled != isEnabled){
        			if(enabled){
                    	pe.coedtingMenuItem.domNode.style.display="";
                    	if(pe.scene.isIndicatorAuthor()){
                    		pe.lotusEditor.indicatorManager.IndicatorAuthor();
                    	}
        			} else {
        				pe.coedtingMenuItem.domNode.style.display="none";
        				if(pe.scene.isIndicatorAuthor())
        					pe.lotusEditor.indicatorManager.clearIndicator();
        			}
        		}
        	}
        },

        disableOldIndicator: function() {
            pe.scene.setIndicatorAuthor(false);
            if (pe.lotusEditor)
                pe.lotusEditor.indicatorManager.IndicatorAuthor();
            if (this.isOn())
            	this.setCoedtingMenuItem(false);
        },

        checkButton: function () {
            if (this.metaReady && this.editorsReady && !this.trackButtonShowed && this.docTrackEnabled) {
            	if(this.isOn()) {
                	var trackMenu = pe.trackChangesMenuItem;
                	if(trackMenu){
                		trackMenu.set("checked", true);
                	}

                    pe.scene.showTrackButton();
                    this.trackButtonShowed = true;
                    if (!this.sum.activated)
                        this.buildSummary();
            	}

            }
        },

        colorDom: function (view) {
            var me = this;
            if (!view.domNode)
            {
                return;
            }
            if (view.checkTrackClass) {
                view.checkTrackClass(view.domNode);
            }
            if (view.container) {
                view.container.forEach(function (c) {
                    me.colorDom(c);
                });
            }
            if (view.rows) {
                view.rows.forEach(function (c) {
                    me.colorDom(c);
                });
            }
            if (view.cells) {
                view.cells.forEach(function (c) {
                    me.colorDom(c);
                });
            }
            if (view.lines) {
                view.lines.forEach(function (c) {
                    c.checkTrackClass();
                    setTimeout(function(){
                        c.updateTrackClassIdForVRuns();
                    }, 0);
                });
            }
        },

        colorAllDoms: function () {
            var me = this;
            setTimeout(function () {
                if (pe.lotusEditor &&pe.lotusEditor.layoutEngine && pe.lotusEditor.layoutEngine.rootView) {
                    pe.lotusEditor.layoutEngine.rootView.container.forEach(function (c) {
                        me.colorDom(c);
                    });
                }
            }, 200);
        },

        updateHistoryTime: function (start, end) {
            this.start = start;
            this.end = end;
            var updated = this.sum.updateTime(start, end);
            if (this.sum.activated && updated)
            {
                this.buildSummary();
            }
            this.colorAllDoms();
            this.checkTrackClass();
        },

        getDraftMeta: function () {
            if (this.metaReady)
                return;
            var url = contextPath + "/api/docsvr/" + DOC_SCENE.repository + "/" + DOC_SCENE.uri + "/draft";
            // TODO, use new API, csrf
            dojo.xhrGet
                (
                {
                    url: url,
                    handleAs: "json",
                    handle: lang.hitch(this, this._draftMetaReturned),
                    preventCache: true
                }
                );
        },

        isAnyUserCare: function(insertTime)
        {
            var deleteTime = new Date();
            for(var user in this.editorsTime)
            {
                var lastVisitTime = this.editorsTime[user];
                if (lastVisitTime)
                {
                    if (insertTime < lastVisitTime)
                        return true;
                }
                else
                {
                    // the user did not check in, or first time.
                    // no since last visit for this user.
                    // this user did not care.
                }
            }
            
            return false;
        },
        
        _refreshStore: function()
        {
            if (!this.isOnOrPaused())
                return;
            clearTimeout(this._refreshStoreTimer);
            this._refreshStoreTimer = setTimeout(function(){
                var store = pe.scene.getEditorStore();
                if (store)
                    store.refresh();
            }, 1000);
        },

        _draftMetaReturned: function (c) {
            var d = new Date(c.created);
            this.createTime = d.valueOf();
            console.info("createTime "  +this.createTime);
            this.metaReady = true;
            this.checkButton();
            if(this.panel && this.panel.checkUserIcons)
            	this.panel.checkUserIcons();
        },

        init: function () {
        	this.docTrackEnabled = window.g_docTrackEnabled;

        	if(!this.docTrackEnabled)
        		return;

            this.editorsTime = {};
            this.initTime = new Date().valueOf();
            // by default, since today.
            var today = new Date();
            today.setHours(0); today.setMinutes(0); today.setSeconds(0);
            this.start = today.valueOf();

            pe.scene.switchTrackChanges = lang.hitch(this, this.switchTrackChanges);            
            pe.scene.toggleTrackChangePanel = lang.hitch(this, this.togglePanel);
            pe.scene.clearChangeHistory = lang.hitch(this, this.clearChangeHistory);
            var store = pe.scene.getEditorStore();
            store && store.registerListener(this);

            var me = this;
            var events = [constants.EVENT.COEDIT_USER_JOINED];
            array.forEach(events, function (event) {
                topic.subscribe(event, function (uid) {
                    if (uid != pe.scene.getCurrUserId()) {
//                        me.triggerOn();
                       me._refreshStore();
                    }
                });
            });
            
            topic.subscribe(constants.EVENT.COEDIT_USER_LEFT, function(user){
                 var userId = user.getId();
                 me.editorsTime[userId] = new Date().valueOf();
            });

            this.sum = new TrackChangeAreaSummary(this.start, this.end);
            aspect.after(this.sum, "onSumChanged", lang.hitch(me, "onSumChanged"), true);

            this.checkTrackClass();
            this._pendingUpdates = [];

            topic.subscribe(constants.EVENT.LOAD_READY, function () {
                me.getDraftMeta();
                var setting = pe.lotusEditor.setting;
                me.on = setting.isTrackChangeOn();
                me.checkButton();
                
                if (me.on && (me.loadReady || !me.sum.activated))
                {
                    me.buildSummary();
                }
                
                me.loadReady = true;

            	if(me.on && me.isDocSizeOverLmtWithTrack()) {
            		me.showOverDocTrackSizeMsg(30000);
            	}

                if (!me.watched) {
                    topic.subscribe("/trackChange/update", function (obj, mode, type) {
                        if (!me.sum)
                            return;
                        if (!me.sum.activated)
                            return;
                        if (!pe.lotusEditor.setting.isTrackChangeOn())
                            return;
                        if (obj.forPreview)
                            return;
                        if (!trackChange.inAllBatch) {
                            obj.mc = obj.mc || obj.getMessageCategory();
                            var mc = obj.mc;
                            if (mc != constants.MSGCATEGORY.Content)
                                return;
                            var update = {
                                obj: obj,
                                mode: mode,
                                type: type
                            };
                            
                            if (obj.modelType == constants.MODELTYPE.PARAGRAPH)
                            {
                                var table = global.modelTools.getTable(obj);
                                if (table)
                                {
                                    update = {
                                        obj: table,
                                        mode: "dirty",
                                        type: "table"
                                    };
                                }
                            }
                            
                            if ((mode == "dirty" || mode == "reset") && obj.modelType == constants.MODELTYPE.PARAGRAPH)
                            {
                                if (obj.isInTCGroup && obj.isInTCGroup())
                                    return;
                            }
                         
                            clearTimeout(me._pendingUpdatesTimer);
                            
                            //if (mode == "delete") 
                            //   me._pendingUpdates.unshift(update);
                            //else
                            //if (mode != "delete")
                                me._pendingUpdates.push(update); // must in order
                            
                            me._pendingUpdatesTimer = setTimeout(function () {
                                me.checkPendingUpdate();
                            }, me.refreshInterval);
                        }
                    });
                    me.watched = true;
                }
            });
            topic.subscribe(constants.EVENT.GROUPCHANGE_START, function (isTrackChangeAll) {
                if (!me.sum)
                    return;
                if (!me.sum.activated)
                    return;
                if (isTrackChangeAll)
                    me.inAllBatch = true;
            });
            topic.subscribe(constants.EVENT.GROUPCHANGE_END, function (isTrackChangeAll) {
                if (!me.sum)
                    return;
                if (!me.sum.activated)
                    return;
                if (isTrackChangeAll) {
                    clearTimeout(me._pendingUpdatesTimer);
                    me.inAllBatch = false;
                    me.buildSummary(true);
                }
            });

            if(this.isCurrentUserDocOwner() && pe.trackChangesMenuItem)
                pe.trackChangesMenuItem.setDisabled(false);
        },

        checkPendingUpdate: function () {
            var len = this._pendingUpdates.length;

            if (!len)
                return;

            var objs = [];
            var modes = [];
            var types = [];
            var count = 0;
            var prevItem;
            for (var i = 0; i < this._pendingUpdates.length; i++) {
                var item = this._pendingUpdates[i];
                var obj = item.obj;
                var mode = item.mode;
                var type = item.type;
                
                var index = array.indexOf(objs, obj);
                if (index < 0) {
                    objs.push(obj);
                    modes.push(mode);
                    types.push(type);
                    count ++;
                } else if (modes[index] == "delete")
                {
                    // has delete mode before, and here comes another insert/dirty.
                    // undo ?
                    break;
                } else if (mode == "delete") {
                    // exist, what about the mode;
                    // update reset,insert,dirty to delete.
                    // console.warn("update to delete")
                    modes[index] = "delete";
                    count ++;
                } 
                else if (prevItem && prevItem.obj != obj)
                {
                    objs.push(obj);
                    modes.push(mode);
                    types.push(type);
                    count ++;
                }
                else
                {
                    count ++;
                }
                prevItem = item;
            }
            
            this._pendingUpdates.splice(0, count);
            
            var len = objs.length;

            if (!len)
                return;

            if (len > 20) {
                var t = new Date();
                
                // too many, better build from start.
                this._pendingUpdates = [];
                this.buildSummary();
                this.onSumChanged();
                console.info("i better build all from start since so many objs got updated " + len + " used time " + (new Date() - t)/ 1000)
                return;
            }

            var checkedItems = [];
            for (var i = 0; i < objs.length; i++) {
                var obj = objs[i];
                var mode = modes[i];
                var type = types[i];
                if ((mode == "dirty" || mode == "reset") && checkedItems.indexOf(obj) >= 0)
                    continue;
                var cObjs = this.sum.onObjUpdated(obj, mode, type);
                if (cObjs && cObjs.length) {
                    
                    array.forEach(cObjs, function (cObj) {
                        if (checkedItems.indexOf(cObj) < 0)
                            checkedItems.push(cObj);
                    });
                    
                    if (checkedItems.length >= 20 && i != objs.length - 1 && i > 0)
                    {
                        var t = new Date();
                        this._pendingUpdates = [];
                        this.buildSummary();
                        this.onSumChanged();
                        console.info("i better build all from start since so many objs got updated " + len + " used time " + (new Date() - t)/ 1000)
                        return;
                    }
                }
            }
            this.buildSummary();
            this.sum.onSumChanged();
            
            if (this._pendingUpdates.length)
                this.checkPendingUpdate();
        },

        checkTrackClass: function () {
            var doc = browser.getEditAreaDocument();
            if (this.isTrackShowActived())
                domClass.add(doc.body, "track-show");
            else
                domClass.remove(doc.body, "track-show");
        },

        isTrackShowActived: function () {
            return (this.panel && !this.panel.isCollapsed());
        },

        toggleShow: function (show, type) {
            if (show === true || show === false)
                this["show_" + type] = show;
            else
                this["show_" + type] = !this["show_" + type];
            pe.lotusEditor && pe.lotusEditor.reset();
            this.checkTrackClass();
            return this.show;
        },

        isOn: function () {
            return this.on;
        },

        isOnOrPaused: function() {
            return this.on || this.onBefore;
        },

        _mark: function () {
            // use same time to combine insertion/deletion, in 10 seconds
            // what about client - server time not sync.
            var milliseconds = new Date().valueOf();
            this.t = milliseconds;
            /*
            if (this.t < this.createTime || this.t < this.lastVisitTime)
            {
                this.t += 5000;
            }
            */
            var me = this;
            clearTimeout(this.timer);
            this.timer = setTimeout(function () {
                me.t = 0;
            }, 30 * 1000);
        },

        beginRecord: function() {
        	// pause checkPending
            if (!this.recordLevel) {
                this.recordLevel = 0;
                this.origCheckPendingUpdate = this.checkPendingUpdate;
                this.checkPendingUpdate = function() {
                    this.checkPendingUpdateCalled = true;
                };
            }
            this.recordLevel ++;
        },

        endRecord: function() {
            if (!this.recordLevel)
                return;
            this.recordLevel--;
            if (!this.recordLevel) {
                this.checkPendingUpdate = this.origCheckPendingUpdate;
                delete this.origCheckPendingUpdate;
                if (this.checkPendingUpdateCalled) {
                    this.checkPendingUpdate();
                }
                delete this.checkPendingUpdateCalled;
                delete this.recordLevel;
            }
        },

        checkPropChange: function (original, parent, chKey) {
            if (true) //if (!this.isOn())
                return null;

            var hasChange = false;
            var o = null;

            var changesPoint = parent;

            if (changesPoint[chKey] && changesPoint[chKey].length) {
                hasChange = true;
                for (var i = 0; i < changesPoint[chKey].length; i++) {
                    if (changesPoint[chKey][i].t == "prop") {
                        o = changesPoint[chKey][i].o;
                        break;
                    }
                }
            }

            if (!o)
                o = lang.clone(original) || {};

            var old = lang.clone(changesPoint[chKey]);

            var obj = this.createChange("prop");
            obj.o = o;

            if (!changesPoint[chKey])
                changesPoint[chKey] = [];

            obj.o = obj.o ? obj.o : {};
            var changes = [];
            for (var i = 0; i < changesPoint[chKey].length; i++) {
                if (changesPoint[chKey][i].t != "prop") {
                    changes.push(changesPoint[chKey][i]);
                }
            }

            changes.unshift(obj);
            changesPoint[chKey] = changes;

            return {
                oldChanges: old,
                newChanges: changesPoint[chKey]
            };
        },
        
        resetMarkTime: function()
        {
            delete this.t;  
        },

        createChange: function (type) {
            if (!this.t)
                this._mark();
            if (!this.u)
                this.u = pe.scene.getCurrUserId();
            return {
                t: type, // "ins" "del"
                u: this.u,
                d: this.t,
                id: uuid.generateRandomUuid()
            };
        },

        pause: function () {
            this.pauseCount++;
            if (this.pauseCount == 1) {
                this.onBefore = false;
                if (this.on) {
                    this.onBefore = true;
                    this.on = false;
                }
            }
        },

        resume: function () {
            this.pauseCount--;
            if (this.pauseCount == 0) {
                if (this.onBefore)
                    this.on = true;
            }
        },

        getContinueUsers: function (lastCh, ch) {
            if (!lastCh || !ch)
                return [];
            var continueUsers = [];
            var users = [];
            array.forEach(lastCh, function (c) {
                users.push(c.u);
            });
            for (var i = 0; i < ch.length; i++) {
                if (array.indexOf(users, ch[i].u) >= 0) {
                    continueUsers.push(ch[i].u);
                }
            }
            return continueUsers;
        },

        isContinue: function (lastCh, ch) {
            return this.getContinueUsers(lastCh, ch).length > 0;
        },

        buildSummary: function () {
            this.sum.build();
            this._pendingUpdates = [];
            this.sum.checkActionsSeen();
        },

        getOrderedActions: function () {
            return this.sum.getOrderedActions();
        },

        onSumChanged: function (sum) { },

        togglePanel: function () {
        	var tcSidePane = writer.ui.sidebar && writer.ui.sidebar.TrackChangeSidePane;
        	if(!tcSidePane) return;
            if (!this.panel) {
                var editorFrame = dom.byId("editorFrame");
                var vNode = domConstruct.create("div", {
                    id: "trackchange_sidebar_div"
                });
                domConstruct.place(vNode, editorFrame, "before");
                this.panel = new tcSidePane({}, vNode);
                aspect.after(this.panel, "onOpen", lang.hitch(this, this.checkTrackClass), true);
                aspect.after(this.panel, "onClose", lang.hitch(this, this.checkTrackClass), true);
            }
            this.panel.toggle();
            if(this.panel.isCollapsed())
            	pe.settings.setSidebar(pe.settings.SIDEBAR_COLLAPSE);
            var headerButton = dom.byId("track_change_header_button");
            var selected = false;
            domClass.remove(headerButton, 'selected');
            if (!this.panel.isCollapsed()) {
                domClass.add(headerButton, 'selected');
                selected = true;
            }
            headerButton.title = headerButton.getAttribute(selected ? "toHideTitle" : "toShowTitle");
            headerButton.setAttribute("aria-label", dojo.string.substitute(i18ntrack.jawsSideBarAriaLabel, [headerButton.title, headerButton.title]));
        },

        isOverMaxTxtSizeLmt: function() {
            var over = false;
        	if(this.isOn()){
        		var selection = pe.lotusEditor.getSelection();
        		if(selection){
            		var selTxt = selection.getSelectedText(null,"",this.MAX_TRACK_TXT_DEL_SIZE);
            		if (selTxt && (selTxt.getBytesLength() > this.MAX_TRACK_TXT_DEL_SIZE)){
            			selTxt = selTxt.replace(/[\r\n\u0001]/g, "");
            			over = selTxt.trim().substr(0,50);
            		}
        		}
        	}
        	return over;
        },
        
        insertOverLmtText: function(text) {
       		var sel = pe.lotusEditor.getSelection();
       		var rgs = sel.getRanges();
       		var r1 = rgs[0];
       		var startPos = r1.getStartParaPos();
       		var p = startPos.obj;
       		var idx = startPos.index;

            var cnt = {
                    "fmt" : [ {
                        "style" : {},
                        "rt" : "rPr",
                        "s" : idx,
                        "l" : 1
                    } ],
                    "id" : msgHelper.getUUID(),
                    "rt" : constants.MODELTYPE.TRACKOVERREF,
                    "c" : "\u0001",
                    "s": idx,
                    "l": 1
                };
            var msg = p && p.insertOverTrackObj(cnt, idx, text);
       		return (msg?[msg]:[]);
        },

        isDocSizeOverLmtWithTrack: function() {
        	var docSize = pe.lotusEditor.document.cntJsonSize;
        	if(pe.scene.hasChangeHistory() && (docSize > (this.MAX_TRACK_DOC_CONTENT_SIZE * 1024 * 1024)))
        		return true;
        	return false;
        },

    	showOverDocTrackSizeMsg: function(interval) {
    		if(this.isCurrentUserDocOwner())
    			pe.scene.myHeader.showTextMessage(i18ntrack.overDocTrackSizeMsg1);
    		else
    			pe.scene.myHeader.showTextMessage(i18ntrack.overDocTrackSizeMsg2);

    		if(interval === undefined) interval = 10000;
    		if(interval){
    			setTimeout( dojo.hitch(this, this.hideOverTrackTxtLmtMsg), interval );
    		}
    	},

    	showOverTrackTxtLmtMsg: function(interval) {
    		pe.scene.myHeader.showTextMessage(i18ntrack.overTxtTrackSizeMsg);
    		if(interval === undefined) interval = 5000;
    		if(interval){
    			setTimeout( dojo.hitch(this, this.hideOverTrackTxtLmtMsg), interval );
    		}
    	},

    	hideOverTrackTxtLmtMsg: function() {
    		pe.scene.myHeader.hideTextMessage();
    	},

        getLastChangeInfo: function (obj, type) {
            if (type) {
                if (type == "tcPr")
                    return ((obj && obj.tcPrCh && obj.tcPrCh.length > 0) ? obj.tcPrCh[obj.tcPrCh.length - 1] : null);
                else if (type == "rPr")
                    return ((obj && obj.rPrCh && obj.rPrCh.length > 0) ? obj.rPrCh[obj.rPrCh.length - 1] : null);
            }
            return ((obj && obj.ch && obj.ch.length > 0) ? obj.ch[obj.ch.length - 1] : null);
        },

        /** compare two ch, return true if they are same */
        compareCh: function(ch1, ch2) {
            if (ch1 == ch2)
                return true;
            if ((!ch1 && ch2) || (ch1 && !ch2) || ch1.length != ch2.length)
                return false;
            for (var i = 0; i < ch1.length; i++) {
                var change1 = ch1[i], change2 = ch2[i];
                if (change1 == change2)
                    continue;
                if (change1.d == change2.d && change1.u == change2.u && change1.t == change2.t)
                    continue;
                return false;
            }
            return true;
        }
    });
    
    for (var x in trackChange)
        exports[x] = trackChange[x];
        
    global.trackChange = exports;
});