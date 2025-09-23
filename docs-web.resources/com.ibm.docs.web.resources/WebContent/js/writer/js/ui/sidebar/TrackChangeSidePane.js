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
    "writer/ui/widget/TrackChangePopup",
    "writer/ui/sidebar/TrackChangeTimeChooser",
    "dijit/_Templated",
    "dijit/Tooltip",
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
    "dojo/string",
    "dojo/topic",
    "dojo/mouse",
    "writer/constants",
    "writer/global",
    "writer/track/trackChange",
    "writer/util/HtmlTools",
    "dojo/text!writer/templates/TrackChangeSidePane.html",
    "dojo/i18n!writer/nls/track",
    "concord/util/browser",
    "dojo/_base/Color",
    "writer/util/ViewTools",
    "concord/util/acf"
],
    function(SidePane, TrackChangePopup, TrackChangeTimeChooser, _Templated, Tooltip, fx, aspect, query, has, lang, declare, array, dom, domConstruct, domAttr, domStyle, domClass, domGeo, on, string, topic, mouse, constants, g, trackChange, HtmlTools, template, nls, browser, dojoColor, ViewTools, acf) {

        var TrackChangeSidePane = declare("writer.ui.sidebar.TrackChangeSidePane", [SidePane, _Templated], {

            highlightCssId: "trackChangeHighLightCss",

            templateString: template,
            showTitle: false,

            uiDirty: false,
            
            name: "TrackChangeSidePane",

            buildRendering: function() {
                this.nls = nls;
                this.inherited(arguments);
            },

            setDirty: function(dirty) {
                if (this.uiDirty != dirty) {
                    this.uiDirty = dirty;
                    if (this.uiDirty)
                    {
                        this.refresh();
                    }
                }
            },

            postCreate: function() {
                this.inherited(arguments);
                on(this, "keydown", lang.hitch(this, this._onKeyPress));
                var me = this;
                this.actions = [];
                this.actDoms = {};
                this.setDirty(false);
                
                domAttr.set(me.timeDesc, "tabindex", 0);

                this.chooser = new TrackChangeTimeChooser({
                    onChange: function(time, desc, showAll) {
                        me.timeDesc.innerHTML = BidiUtils.isArabicLocale() ? BidiUtils.convertArabicToHindi(desc) : desc;
                        domAttr.set(me.timeDesc, "aria-label", desc);
                        me.onTimeChange(time, showAll);
                    }
                });
                this.sliderWrapper.display = "none";
                this.sliderWrapper.appendChild(this.chooser.domNode);
                this.chooser.setDijitTooltip();

                this.userList = this.addIndicatorClass();
                topic.subscribe(constants.EVENT.COEDIT_USER_JOINED, lang.hitch(this, function(uid) {
                    if (this.userList.indexOf(uid) <= 0) {
                        this.addIndicatorClass(uid);
                    }
                }));
                topic.subscribe(constants.EVENT.TRACKCHANGE_ON, lang.hitch(this, function() {
                    this.refresh();
                }));
                topic.subscribe("/trackChange/hoverDelete", lang.hitch(this, function(actId){
                    if (this.isCollapsed())
                        return;
                    this.highlightByHoverDelete(actId);
                }));

                pe.scene.addResizeListener(lang.hitch(this, function() { if (this.popup) this.popup.destroy(); }));
                on(window, "resize", lang.hitch(this, this.resized));

                if(trackChange.isCurrentUserDocOwner() && trackChange.isOn()) {
                    domAttr.set(this.acceptall, "tabindex", 0);
                    domAttr.set(this.acceptall, "aria-label", nls.panel_changes_accept_all + ". " + nls.panel_accept_all_aria_label);
                    domAttr.set(this.acceptall, "id", "acceptallbutton");
                    new Tooltip({
            			connectId: this.acceptall.id,
            			label: nls.panel_changes_accept_all,
            			showDelay: 0,
            			position: ["below"]
            		});
                    on(this.acceptall, "click", lang.hitch(this, this._onClearHistoryClick));
                    on(this.acceptall, "keydown", lang.hitch(this, this._clearChangeHistoryKeyHanlder));
                    
                    //if in high contrast mode, show this div instead of background image
                    var acceptall_text = domConstruct.create("div", {
                        className: "acceptall_high_contrast",
                        innerHTML: nls.panel_changes_accept_all
                    });
                    this.acceptall.appendChild(acceptall_text);
                } else {
                	this.acceptall.style.display = "none";
                }

                this.root.style.display = "none";
                this.avatarsArrow.title = nls.avatars_arrow_to_expand;
            },
            
            _filterUserKeyHanlder: function(e){
        		e = e || window.event;
        		if (e.keyCode == dojo.keys.ENTER || e.keyCode == dojo.keys.SPACE){        	
        			this.filterUserAction(e);
        		}	
        	},
        	
        	 _clearChangeHistoryKeyHanlder: function(e){
         		e = e || window.event;
         		if (e.keyCode == dojo.keys.ENTER || e.keyCode == dojo.keys.SPACE){        	
         			this._onClearHistoryClick();
         		}	
         	},
            
            _onClearHistoryClick: function() {
            	pe.scene.clearChangeHistory && pe.scene.clearChangeHistory();
            },
            
            _onKeyPress: function(event){
        		event = event || window.event;
        		var key = (event.keyCode ? event.keyCode : event.which);
        		if(key == dojo.keys.F4 && (event.ctrlKey || event.metaKey)){
        			if (event.preventDefault) 
        				event.preventDefault();
        		} else if(key == dojo.keys.F1 && event.shiftKey){	
        			conditionRenderer.grabSTBarFocus();
        			event.preventDefault();
        		}
        	},

            resized: function() {
                setTimeout(lang.hitch(this, function() {
                    this.chooser && this.chooser.refreshTooltip();
                }), 500);
            },

            onTimeChange: function(v, showAll) {
                var start = v;
                clearTimeout(this.timeChangeTimer);
                var me = this;
                this.timeChangeTimer = setTimeout(function() {
                    trackChange.updateHistoryTime(start, Number.MAX_VALUE);
                    me.buildList();
                    me.chooser && me.chooser.refreshTooltip();
                    me.showAll = showAll;
                    me.checkShowAll();
                }, 100);
            },
            
            checkShowAll: function()
            {
                var doc = browser.getEditAreaDocument();
                if (this.showAll)
                    domClass.add(doc.body, "indicatorEnabledTrack");
                else
                    domClass.remove(doc.body, "indicatorEnabledTrack");
            },

            reload: function() {
                this.currentFilterUser = this.currentSelUser = null;
                this.refreshTime();
                this.buildList();
            },

            refreshTime: function() {
                var tc = trackChange;
                var newStart = tc.start; // since when
                var newEnd = Number.MAX_VALUE;
                tc.updateHistoryTime(newStart, newEnd);
                this.setDirty(false);
            },

            open: function() {
                this.inherited(arguments);
                pe.settings.setSidebar(pe.settings.SIDEBAR_TC);
                trackChange.setCoedtingMenuItem(false);
                this.uiDirty = false;
                this.buildTime = new Date();
                trackChange.resetMarkTime();
                trackChange.sum.setSeenBaseTime();
                if (this.chooser && this.chooser.selectDotIndex < 0)
                    this.chooser.setSelectDotIndex(this.chooser.defaultIndex);
                else
                    this.reload();
                if (this.sliderWrapper.style.display != "none")
                    this.chooser && this.chooser.refreshTooltip();
                if (this._onSumChangeConnection) {
                    this._onSumChangeConnection.remove();
                    delete this._onSumChangeConnection;
                }
                this._onSumChangeConnection = aspect.after(trackChange, "onSumChanged", lang.hitch(this, "onSumChanged"), true);
                this._onSelChangeConnection = topic.subscribe(constants.EVENT.SELECTION_CHANGE, lang.hitch(this, this.onSelectionChange));
                this.root.style.display = "";
                this.checkShowAll();
                pe.lotusEditor.focus();
            },

            close: function() {
                clearTimeout(this._uiDirtyRefreshTimer);
                var doc = browser.getEditAreaDocument();
                domClass.remove(doc.body, "indicatorEnabledTrack");
                this.inherited(arguments);
                this.chooser && this.chooser.hideTooltip();
                if (this.popup) {
                    this.popup.destroy();
                    this.popup = null;
                }
                this.unhighlight();
                delete this.highlightedAct;
                if (this._onSumChangeConnection) {
                    this._onSumChangeConnection.remove();
                    delete this._onSumChangeConnection;
                }
                if (this._onSelChangeConnection) {
                    this._onSelChangeConnection.remove();
                    delete this._onSelChangeConnection;
                }
                var button = dom.byId("track_change_header_button");
                if (button)
                    domClass.remove(button, "selected");

                trackChange.setCoedtingMenuItem(true);
            },

            onSelectionChange: function() {
                // TODO
            },

            buildActDom: function(act) {
                
                var userNameWrapperClass = "text";
                var descHTML = "";
                
                if (act.isImageAct()) {
                    userNameWrapperClass = "image";
                }
                else if (act.isTableAct()) {
                    userNameWrapperClass = "table";
                }
                else if (act.isCanvasAct() || act.isTextBoxAct()) {
                   userNameWrapperClass = "textbox";
                }
                else {
                   descHTML = act.getActionMovesHtmlView();
                }
                
                var uId = act.u;
                var editorName = "";
                var editor = pe.scene.getEditorStore().getEditorById(uId);
                if (editor)
                {
                    editorName = acf.escapeXml(editor.getName());
                }
                
                var wordBreak = (has("ie") || has("trident") || has("ff")) ? "break-all" : "break-word";
                
                var html0 = "<div class='avatar'></div><div class='userTypeTime'><div class='userNameWrapper "+userNameWrapperClass+"'><div class='userName'>"+editorName+"</div><div class='imgTable'></div></div><div class='typeTime'>" + act.getTypeTimesHtmlView() + "</div></div>";
                var html1 = "<div class='desc' style='word-break:"+wordBreak+"'>"+ descHTML + "</div>";
                var html2 = "<div style='clear:both'></div>";
                
                var dom = domConstruct.create("div", {
                    className: "action action_" + act.u + " action_" + act.id,
                    id: "act_" + act.id,
                    innerHTML: html0 + html1 + html2
                });

                domAttr.set(dom, "user", act.u);
                
                if (window.conditionRenderer) {
                    var icon = window.conditionRenderer.getUserTokenByUUID(act.u);
                    this.updateUserTitle(icon, act.u);
                    var avatar = dojo.query(".avatar", dom)[0];
                    avatar.appendChild(icon);
                }

                this.connect(dom, "onclick", "highlight");
                this.connect(dom, "keydown", "highlightKeyHandler");
                this.actDoms[act.id + ""] = dom;
                domAttr.set(dom, "tabindex", 0);
                domAttr.set(dom, "aria-label", editorName + " " + act.getTypeTimesText() + " " + act.getActionMovesText());

                return dom;
            },
            
            highlightByHoverDelete: function(id)
            {
                var currentHighlightAct = this.highlightedAct;
                var needHighlightAct;
                for (var i = 0; i < this.actions.length; i++) {
                    var act = this.actions[i];
                    if (act.id == id) {
                        needHighlightAct = act;
                        break;
                    }
                }
                if (needHighlightAct)
                {
                    if (needHighlightAct != currentHighlightAct)
                    {
                        var dom = query(".action.action_" + id, this.listContainer)[0];
                        if (dom)
                        {
                            this.unhighlight();
                            dom.scrollIntoView();
                            this.highlightAct(act, dom);
                        }
                    }
                    else
                    {
                        // the same, do nothing.
                    }
                }
            },
            
            highlightKeyHandler: function(e) {
            	e = e || window.event;
         		if (e.keyCode == dojo.keys.ENTER || e.keyCode == dojo.keys.SPACE){        	
         			this.highlight(e);
         		}
            },

            highlight: function(e) {
                var currentHighlightAct = this.highlightedAct;
                this.unhighlight();
                // trackChange.resetMarkTime();

                var target = e.target;
                while (!domClass.contains(target, "action") && target != document.body) {
                    target = target.parentNode;
                }
                if (!target)
                    return;

                var id = target.id.substring(4);
                for (var i = 0; i < this.actions.length; i++) {
                    var act = this.actions[i];
                    if (act.id == id) {
                        if (currentHighlightAct != act)
                            this.highlightAct(act, target);
                        break;
                    }
                }
            },

            unhighlight: function() {
                HtmlTools.writerCss(browser.getEditAreaDocument(), this.highlightCssId, "", true);
                HtmlTools.writerCss(document, this.highlightCssId, "", true);
                delete this.highlightedAct;
                if (this.popup) {
                    this.popup.destroy();
                    this.popup = null;
                }
            },

            highlightAct: function(act, actDom) {

            	if (domClass.contains(actDom, "fresh")) {
            		domClass.remove(actDom, "fresh");
            		var jawsText = domAttr.get(actDom, "aria-label");
            		jawsText = jawsText.substring("new change".length+1);
            		domAttr.set(actDom, "aria-label", jawsText);
            	}
                trackChange.sum.markSeen(act);
                var index = array.indexOf(this.newActs, act);
                if (index >= 0) {
                    this.newActs.splice(index, 1);
                    topic.publish("/trackChange/new", this.newActs.length);
                }

                if (act.deleted) {
                    // what to do ?
                    console.warn("What to do, the act is deleted");
                    return;
                }

                if (!act.isImageAct() && !act.isTableAct() && !act.isTextBoxAct() && !act.isCanvasAct()) {
                    // refresh content just in case it has been dirty.
                    query(".desc", actDom)[0].innerHTML = act.getActionMovesHtmlView();
                }

                var me = this;

                this.highlightedAct = act;

                var color = pe.scene.getEditorStore().getUserCoeditColor(act.u);
                var colorObj = new dojoColor(color).toRgba();
                var _15alphaColor = "rgba(" + colorObj[0] + "," + colorObj[1] + "," + colorObj[2] + ",0.10)";
                var cssStr = ".track-id-" + act.id + "{background-color: " + _15alphaColor + "}";
                cssStr += ".track-id-" + act.id + ".carriageNode{display:inline-block}";
                if (act.isImageAct() && act.onlyIns()) {
                    cssStr += ".track-id-" + act.id + ".track-inserted:after{height:100%;border:2px solid " + color + "}";
                }

                var cssStr2 = ".track_change_pane .list .action_" + act.id + "{background-color: " + _15alphaColor + "}";
                // cssStr2 += ".track_change_pane .list .action_" + act.id + " .unified_editor .initial_name_bg {  border-color: " + _15alphaColor + " !important;}";

                HtmlTools.writerCss(browser.getEditAreaDocument(), this.highlightCssId, cssStr, true);
                HtmlTools.writerCss(document, this.highlightCssId, cssStr2, true);

                var onlyIns = act.onlyIns();
                var showPopup = !onlyIns;

                var models = act.modelChPairs;
                if (onlyIns && array.every(models, function(m) {
                    return m.model.isTrackDeleted();
                })) {
                    showPopup = true;
                }

                if (models.length) {
                    var lastModel = models[models.length - 1].model;
                    var lastRealModel = models[models.length - 1].realModel;
                    
                    var onlyContinueDeletes = act.getOnlyContinueDeleteModels();
                    var onlyDelete = false;
                    if (act.mixTypes() && onlyContinueDeletes && onlyContinueDeletes.length) {
                        lastModel = onlyContinueDeletes[onlyContinueDeletes.length - 1].model;
                        lastRealModel = onlyContinueDeletes[onlyContinueDeletes.length - 1].realModel;
                        onlyDelete = true;
                    }
                    var range = this.getViewRange(lastModel, lastRealModel);
                    if (range) {
                        var rangeObjs = [range];
                        var sel = pe.lotusEditor.getSelection();
                        sel.selectRanges(rangeObjs);
                        sel.scrollIntoView();
                        if (showPopup) {
                            this.popup = new TrackChangePopup({
                                act: act,
                                ownerDocument: browser.getEditAreaDocument(),
                                _focusManager: pe.scene.iframeFocusMgr,
                                onlyDelete: true,
                                deleteModel: lastModel,
                                onDestroy: function() {
                                    setTimeout(function(){
                                        if (me.highlightedAct == act)
                                            me.unhighlight();
                                    }, 100)
                                }
                            });
                            var editorNode = dom.byId("editor", browser.getEditAreaDocument());
                            if (editorNode)
                            {
                                this.popup.show(editorNode);
                                this.popup.focus();
                                if (sel && sel._cursor) sel._cursor.hide();
                            }
                        }
                    }
                    pe.lotusEditor.focus();
                }
            },

            getViewRange: function(model, realModel) {
                
                var objsModel = g.modelTools.getParent(model, constants.MODELTYPE.TRACKDELETEDOBJS);
                while (objsModel)
                {
                    model = objsModel;
                    objsModel = g.modelTools.getParent(model, constants.MODELTYPE.TRACKDELETEDOBJS);
                }
                
                
                if (realModel && realModel != model && model.isTrackBlockGroup)
                {
                    // point to a rpr inside a track group.
                    var nextPara = model._blocks.next(realModel);
                    if (nextPara)
                    {
                        var beginIndex = model._indexFromChild(nextPara, 0);
                        var runs = model.getRuns();
                        runs && runs.forEach(function(run){
                        if (run.start < beginIndex)
                            model = run;
                        else
                            return false;
                        });
                    }
                }
                
                var Range = g.RangeClass;
                var range = null;
                var rootView = window.layoutEngine.rootView;
                var isDeletedAnchor = g.modelTools.isAnchor(model) && model.isTrackDeleted();
                if (isDeletedAnchor) {
                    model = g.modelTools.getParent(model, constants.MODELTYPE.PARAGRAPH);
                    var viewPos = g.rangeTools.toViewPosition(model, 0);
                    if (!viewPos || !viewPos.obj) {
                        // TODO
                    }
                    return new Range(viewPos, viewPos, rootView);
                }
                if (!model)
                    return null;
                var allViews = model.getAllViews();
                var view = null;
                for (var ownerId in allViews) {
                    var viewers = allViews[ownerId];
                    var lastView = isDeletedAnchor ? viewers.getFirst() : viewers.getLast();
                    if (lastView) {
                        view = lastView;
                        if (lastView.getViewType() == "table.Table") {
                            var firstRow = null,
                                lastRow = null,
                                firstCell = null,
                                lastCell = null;
                            firstRow = lastView.getFirst && lastView.getFirst();
                            if (firstRow && firstRow.getFirst)
                                firstCell = firstRow.getFirst();

                            lastRow = lastView.getLast && lastView.getLast();
                            if (lastRow && lastRow.getLast)
                                lastCell = lastRow.getLast();
                            if (firstCell && lastCell) {
                                range = new Range({
                                    obj: firstCell,
                                    index: 0
                                }, {
                                        obj: lastCell,
                                        index: 0
                                    });
                            }
                            else {
                                range = new Range({
                                    obj: view,
                                    index: 0
                                }, {
                                        obj: view,
                                        index: 0
                                    });
                            }
                        } else {
                            var len = 0;
                            if (lastView.getViewType() == "text.Paragraph") {
                                var lastLine = lastView.getLast();
                                if (lastLine)
                                    lastView = lastLine.getLast() || lastView;
                                len = lastView.len || 0;
                            }
                            else if (ViewTools.isRun(lastView))
                                len = lastView.len || 0;
                            range = new Range({
                                obj: lastView,
                                index: len
                            }, {
                                    obj: lastView,
                                    index: len
                                });
                        }
                        break;
                    }
                }
                if (!view) {
                    // the model is not layouted for some reason, may be its container is totally removed.      
                }

                return range;
            },

            refresh: function() {
                clearTimeout(this._uiDirtyRefreshTimer);
                var me = this;
                this._uiDirtyRefreshTimer = setTimeout(function(){
                    me.buildList();
                }, 100);
                trackChange.colorAllDoms();
            },

            buildList: function(markActived) {
                // var panelScrollTop = this.domNode.scrollTop;
                clearTimeout(this._uiDirtyRefreshTimer);
                var a = new Date();
                if (trackChange.sum && !trackChange.sum.activated) {
                    trackChange.buildSummary();
                }

                if (this.popup) {
                    this.popup.destroy();
                    this.popup = null;
                }

                delete this.highlightedAct;
                this.unhighlight();

                var me = this;
                this.actions = trackChange.getOrderedActions();
                var counts = [];
                var users = [];
                var newActs = [];
                var hasNewAct = false;

                var container = document.createElement("div");
                array.forEach(this.actions, function(act) {
                    if (act.seen === undefined)
                    {
                    	// it should not be there.
                        trackChange.sum.checkActionSeen(act);
                    }
                    if (!act.seen)
                        newActs.push(act);
                    var usrIndex = array.indexOf(users, act.u);
                    if (usrIndex < 0) {
                        users.push(act.u);
                        counts.push(1);
                    } else {
                        counts[usrIndex] = counts[usrIndex] + 1;
                    }
                    var oldDom = me.actDoms[act.id + ""];
                    var dom;
                    var useOldDom = false;
                    if (oldDom && !act.dirty) {
                        dom = oldDom;
                        dom.style.display = "";
                        useOldDom = true;
                    } else {
                        dom = me.buildActDom(act);
                    }
                    container.appendChild(dom);
                    
                    /*
                    domClass.remove(dom, "anim");
                    if (!useOldDom)
                        domClass.add(dom, "anim");
                    */

                    if (domClass.contains(dom, "fresh")) {
                		domClass.remove(dom, "fresh");
                		var jawsText = domAttr.get(dom, "aria-label");
                		jawsText = jawsText.substring("new change".length+1);
                		domAttr.set(dom, "aria-label", jawsText);
                	}
                    if (!act.seen) {
                        domClass.add(dom, "fresh");
                        var jawsText = "new change." + domAttr.get(dom, "aria-label");
                        domAttr.set(dom, "aria-label", jawsText);
                    }

                    if (me.currentSelUser && act.u != me.currentSelUser)
                        dom.style.display = "none";
                });

                var list = me.list;
                while (list.firstChild) {
                    list.removeChild(list.firstChild);
                }
                list.appendChild(container);
                this.listContainer = container;

                var size = this.actions.length;
                var isOn = trackChange.isOnOrPaused();
                if (size == 0 && !isOn) {
                    var headText = isOn ? nls.panel_no_changes_after_shared : nls.panel_no_changes_for_now;
                    var descText = isOn ? nls.panel_no_changes_after_shared_desc : nls.panel_no_changes_for_now_desc;
                    this.head.innerHTML = "";
                    this.head.appendChild(document.createTextNode(headText));
                    this.desc.innerHTML = "";
                    this.desc.style.display = "";
                    this.desc.appendChild(document.createTextNode(descText));
                } else {
                    this.desc.style.display = "none";
                    this.updateChangesHead(size);
                }

                this.timeWrapper.style.display = isOn ? "" : "none";
                this.avatarsWrapper.style.display = isOn ? "" : "none";
                this.sliderWrapper.style.display = isOn ? "" : "none";

                var avatars = me.avatars;
                while (avatars.firstChild) {
                    avatars.removeChild(avatars.firstChild);
                }
                array.forEach(users, function(usr, index) {
                    var avatar = domConstruct.create("div", {
                        className: "avatar avatar_" + usr
                    }, avatars);

                    domAttr.set(avatar, "user", usr);
                    if (usr == me.currentSelUser)
                        domClass.add(avatar, "selected");

                    on(avatar, "click", lang.hitch(me, me.filterUserAction));
                    on(avatar, "keydown", lang.hitch(me, me._filterUserKeyHanlder));
                    on(avatar, mouse.enter, lang.hitch(me, me.filterUserAction));
                    on(avatar, mouse.leave, lang.hitch(me, me.filterUserAction));

                    if (window.conditionRenderer) {
                        var icon = window.conditionRenderer.getUserTokenByUUID(usr);
                        me.updateUserIconbg(icon, usr);
                        me.updateUserTitle(icon, usr);
                        avatar.appendChild(icon);
                        if(icon && icon.firstChild && icon.firstChild.firstChild && icon.firstChild.firstChild.firstChild) {
                        	domAttr.set(icon.firstChild.firstChild.firstChild, "tabindex", 0);
                        	domAttr.set(icon.firstChild.firstChild.firstChild, "id", "icon_"+icon.firstChild.firstChild.firstChild.title);
                        	domAttr.set(icon.firstChild.firstChild.firstChild, "aria-label", icon.firstChild.firstChild.firstChild.title + ". " + nls.avaters_aria_label);
                        	new Tooltip({
                    			connectId: icon.firstChild.firstChild.firstChild,
                    			label: icon.firstChild.firstChild.firstChild.title,
                    			showDelay: 0,
                    			position: ["below"]
                    		});
                        }
                        var count = counts[index];
                        var countText = BidiUtils.isArabicLocale() ? BidiUtils.convertArabicToHindi(count + "") : count;
//                        if (count > 99)
//                            count = "99";
                        var cDiv = domConstruct.create("div", { innerHTML: countText, className: "count", tabindex: "0", "aria-label": count + " changes" }, avatar);
                        if(count > 99)
                        	cDiv.style.width="20px";
                    }
                });
                
                this.avatarsArrow.style.display = users.length > 6 ? "inlineBlock" : "none";

                this.uiDirty = false;
                this.newActs = newActs;

                topic.publish("/trackChange/new", newActs.length);

                this.chooser && this.chooser.refreshTooltip();
                
                console.info("track change build list used time " + (new Date() - a)/1000);
            },

            updateChangesHead: function(num) {
            	var headText = string.substitute(nls.panel_new_changes, [num]);
                var sl = num + "";
                var s2 = BidiUtils.isArabicLocale() ? BidiUtils.convertArabicToHindi(sl) : sl;
                var numNode = domConstruct.create("span", { className: "number", tabindex: "0", "aria-label": sl});
                numNode.appendChild(document.createTextNode(s2));
                
                this.head.innerHTML = "";
                var idx = headText.indexOf(sl);                
                if(idx == 0){
                	this.head.appendChild(numNode);
                	this.head.appendChild(document.createTextNode(headText.substr(sl.length)));
                } else {
                	this.head.appendChild(document.createTextNode(headText.substr(0, idx)));
                	this.head.appendChild(numNode);
                	if(idx < (headText.length - sl.length))
                		this.head.appendChild(document.createTextNode(headText.substr(idx + sl.length)));
                }
            	
                domAttr.set(this.head, "tabindex", "0");
                domAttr.set(this.head, "aria-label", headText);
            },

            __onAvatarsArrowClick: function(e)
            {
                if (this._avatarsExpanded)
                {
                    domClass.remove(this.avatarsWrapper, "autoHeight");
                    domClass.remove(this.avatarsArrowInner, "dijitUpArrowButton");
                    domClass.add(this.avatarsArrowInner, "dijitDownArrowButton");
                    this.avatarsArrowInner.setAttribute("aria-expanded", "false");
                    this._avatarsExpanded = false;
                    this.avatarsArrow.title = nls.avatars_arrow_to_expand;
                }
                else
                {
                    domClass.add(this.avatarsWrapper, "autoHeight");
                    domClass.add(this.avatarsArrowInner, "dijitUpArrowButton");
                    domClass.remove(this.avatarsArrowInner, "dijitDownArrowButton");
                    this._avatarsExpanded = true;
                    this.avatarsArrowInner.setAttribute("aria-expanded", "true");
                    this.avatarsArrow.title = nls.avatars_arrow_to_hide;
                }
            },
            
            updateUserTitle: function(icon, uId)
            {
                var photo = query(".default_photo_base", icon)[0];
                if (photo){
                	var editor = pe.scene.getEditorStore().getEditorById(uId);
                    if (editor)
                    	photo.title = editor.getName();
                }
            },

            updateUserIconbg: function(icon, uId) {
                var node = query(".initial_name_bg", icon)[0];
                var bgColor = "";
                if (node) {
                    bgColor = domStyle.get(node, "backgroundColor");
                    if (bgColor) {
                        var colorObj = new dojoColor(bgColor).toRgba();
                        var _50alphaColor = "rgba(" + colorObj[0] + "," + colorObj[1] + "," + colorObj[2] + ",0.5)";
                        domStyle.set(node, "backgroundColor", _50alphaColor);
                    }
                } else {
                	if(!this._waitingPaint)
                		this._waitingPaint = [];
                	this._waitingPaint.push(icon);
                }
            },

            checkUserIcons: function(){
            	if(!this._waitingPaint)
            		return;
            	for(var item in this._waitingPaint){

            		this.updateUserIconbg(this._waitingPaint[item]);
            	}
            	delete this._waitingPaint;
            },

            filterUserAction: function(e) {
                var target = e.target;
                while (!domClass.contains(target, "avatar") && target != document.body)
                    target = target.parentNode;
                if (target) {
                    var user = domAttr.get(target, "user");
                    this.filterUser(user, target, e.type);
                }
            },

            filterUser: function(user, target, actType) {
            	var isClick = (!actType || actType == "click" || actType == "keydown");
            	var isSelUser = (this.currentSelUser == user);
                if(isClick)
                	this.currentFilterUser = this.currentSelUser = (isSelUser ? null : user );
                else if (actType == "mouseover")
                	this.currentFilterUser = user;
                else if(this.currentSelUser)
                	this.currentFilterUser = this.currentSelUser;
                else
                	this.currentFilterUser = null;
                
                var curFilterUser = this.currentFilterUser;
                var curSelUser = this.currentSelUser;

                query(".avatars .avatar", this.domNode).forEach(function(avatar) {
                	var usr = domAttr.get(avatar, "user");
                	if(curFilterUser == usr || curSelUser == usr)
                		domClass.add(avatar, "selected");
                	else
                		domClass.remove(avatar, "selected");
                });

                if(isClick) {
                    array.forEach(this.listContainer.children, function(c) {
                        var usr = domAttr.get(c, "user");
                        if(curFilterUser && !(usr == curFilterUser))
                        	c.style.display = "none";
                        else
                        	c.style.display = "";
                    });
                }
            },

            onSumChanged: function() {
                this.setDirty(true);
            },

            addIndicatorClass: function() {
                var ids = [];
                if (!pe.scene.editors)
                    return ids;

                // referenced the spell check style implementation
                var items = pe.scene.editors.editorContainer && pe.scene.editors.editorContainer.items;
                var doc = document;
                var id = "trackChangeCss";
                var cssStr = "";
                if (items && items.length > 0) {
                    for (var i = 0; i < items.length; i++) {
                        var userId = items[i].getEditorId();
                        var color = pe.scene.getEditorStore().getUserCoeditColor(userId);
                        var colorObj = new dojoColor(color).toRgba();
                        var _15alphaColor = "rgba(" + colorObj[0] + "," + colorObj[1] + "," + colorObj[2] + ",0.15)";
                        var colorAlign = BidiUtils.isGuiRtl() ? " {  border-right-color: " : " {  border-left-color: ";
                        var newClass = ".track_change_pane .action_" + userId + colorAlign + color + " !important;}";
                        newClass += ".track_change_pane .action_" + userId + " .userName {  color: " + color + " !important;}";
                        newClass += ".track_change_pane .avatar_" + userId + ".selected .unified_editor .initial_name_bg" + " { border: 2px solid " + color + " !important; top: -3px; left: -3px}";
                        newClass += ".track_change_pane .avatar_" + userId + ".selected .count" + " {color:#ffffff;background:" + color + " !important;}";
                        newClass += ".track_change_pane .avatar_" + userId + ".selected .unified_editor .default_photo_base > img " + " {  border:2px solid " + color + " !important;}";
                        newClass += ".track_change_pane .avatar_" + userId + " .unified_editor .default_photo_base > img " + " {  border:1px solid " + color + " !important;}";
                        newClass += ".track_change_popup_" + userId + "{  border: 2px solid " + color + " !important; }";
                        newClass += ".track_change_popup_" + userId + ".image_popup{  border: 2px solid " + color + " !important; }";
                        newClass += ".track_change_popup_" + userId + " .content {  background: " + _15alphaColor + " !important; }";
                        newClass += ".track-show .track-deleted-" + userId + " .delete-triangle:after {  border-bottom-color: " + color + " !important; }";
                        newClass += ".track-show .Paragraph .track-id-listed.track-inserted-" + userId + " {  border-bottom: 2px dotted " + color + " !important; }";
                        newClass += ".track-show div.track-id-listed.table.track-inserted-" + userId + " { margin-bottom: -2px; border-bottom: 2px dotted " + color + " !important; }";
                        // newClass += ".track_change_pane .list .action_" + userId + ".fresh:after {  border-top-color: " + color + " !important; }";
                        cssStr += newClass + "\n";
                        ids.push(userId);
                    }
                }

                HtmlTools.writerCss(doc, id, cssStr, true);
                HtmlTools.writerCss(browser.getEditAreaDocument(), id, cssStr, true);

                return ids;
            }

        });
        return TrackChangeSidePane;
    });
