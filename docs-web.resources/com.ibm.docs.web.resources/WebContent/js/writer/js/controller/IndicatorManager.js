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
    "dojo/_base/array",
    "dojo/dom-class",
    "dojo/has",
    "dojo/query",
    "dojo/topic",
    "concord/util/browser",
    "writer/constants",
    "writer/controller/Selection",
    "writer/core/Range",
    "writer/util/ModelTools",
    "writer/util/RangeTools",
    "concord/beans/EditorStoreListener",
    "writer/track/trackChange"
], function(lang, declare, array, domClass, has, query, topic, browser, constants, Selection, Range, ModelTools, RangeTools, EditorStoreListener, trackChange) {

    var IndicatorManager = declare("writer.controller.IndicatorManager", EditorStoreListener, {
        constructor: function() {
            this.tools = ModelTools;
            var createIndicatorCSS = function() {
                this.addIndicatorClass();
                if (this.addIndicatorClassHdl) {
                    this.addIndicatorClassHdl.remove();
                    delete this.addIndicatorClassHdl;
                }
            };
            // subscribe FIRSTTIME_RENDERED to add revision css dynamically
            this.addIndicatorClassHdl = topic.subscribe(constants.EVENT.FIRSTTIME_RENDERED, lang.hitch(this, createIndicatorCSS));
            this.userSelections = {};

            pe.scene.addResizeListener(lang.hitch(this, this.onEditorResized));

            topic.subscribe(constants.EVENT.COEDIT_STOPPED, lang.hitch(this, this.clearUserSelections));
            topic.subscribe(constants.EVENT.COEDIT_USER_LEFT, lang.hitch(this, this.clearUserSelections));
            topic.subscribe(constants.EVENT.COEDIT_COLOR_UPDATE, lang.hitch(this, this.drawUserSelections));
            
            var editorStore = pe.scene.getEditorStore();
            editorStore && editorStore.registerListener(this);
        },
		editorsUpdated: function()
		{
			this.drawUserSelections();
		},
        editorAdded: function (editor)
        {
            this.drawUserSelections();
        },
        editorRemoved: function (editorId)
        {
            
        },
        onEditorResized: function() {
            var me = this;
            setTimeout(function() {
                me.drawUserSelections();
            }, 10);
        },

        clearUserSelections: function(user) {
            if (user) {
                var userId = user.getId();
                this.destroyUserSelection(userId);
                delete this.userSelections[userId];
            } else {
                for (var userId in this.userSelections) {
                    this.destroyUserSelection(userId);
                }
                this.userSelections = [];
            }
        },


        addIndicatorClass: function(para) {
            if (!pe.scene.editors)
                return;

            // referenced the spell check style implementation
            var items = pe.scene.editors.editorContainer && pe.scene.editors.editorContainer.items;
            var doc = browser.getEditAreaDocument();
            this.document = doc;
            var head = null;
            var css = null;
            query('head', doc).some(function(oNode) {
                head = oNode;
                return true;
            });
            query('style[type=\"text/css\"][id="indicatorCss"]', head).some(function(oNode) {
                css = oNode;
                if (has("ie") && has("ie") < 11) {
                    css.styleSheet.cssText = "";
                } else {
                    css.innerHTML = "";
                }
                return true;
            });

            if (items && items.length > 0) {
                var curUser = items[0];
                var curId = curUser.getEditorId();
                for (var i = 0; i < items.length; i++) {
                    var userId = items[i].getEditorId();
                    var isTurnOn = false;
                    var userCSSKey = "";

                    var indciator = curUser.getIndicator(userId);
                    if (!indciator) {
                        if (curId == userId) {
                            isTurnOn = false; // hide color shading for current user by default
                        } else {
                            isTurnOn = true;// show color shading for co-editors by default
                        }
                    } else {
                        if (indciator == "show")
                        	isTurnOn = true;
                    }

                    if (para && para.isTurnOn != undefined && para.userId == userId) {
                        isTurnOn = para.isTurnOn;
                    }

                    if (!pe.scene._usersColorStatus)
                        pe.scene._usersColorStatus = {};
                    var status = pe.scene._usersColorStatus[userId] = {"on":isTurnOn};
                	if(isTurnOn)
                		status.key = userCSSKey = this.getUserCSSKey(userId);

                    if (!css) {
                        if (has("ie") || has("trident")) {
                            css = document.createElement('style');
                            css.setAttribute('type', 'text/css');
                            css.id = "indicatorCss";
                            head.appendChild(css);
                        } else {
                            css = doc.createElement("style");
                            css.type = "text/css";
                            css.id = "indicatorCss";
                            head.appendChild(css);
                        }
                    }
                    var color = pe.scene.getEditorStore().getUserCoeditColor(userId);
                    if (!color)
                        return;
                    //                  var newClass = ".indicatorEnabled .ind" + userId + " {  background-color:" + color + " !important;}";// background-color:" + color + " !important;
                    //+ ".indicatorEnabled .ind_img_" + name + " { border-bottom :1px solid " + color + " !important;}";
                    var newClass = "";
                    if (isTurnOn) {
                        newClass += ".indicatorEnabled .ind" + userCSSKey + ":not(.track-inserted) {  border-bottom: 2px dotted " + color + " !important;}";
                    }
                    newClass += ".indicatorEnabledTrack .ind" + userId + ":not(.track-inserted) {  border-bottom: 2px dotted " + color + " !important;}";
                    newClass += ".indicatorEnabledTrack:not(.track-show) .ind" + userId + " {  border-bottom: 2px dotted " + color + " !important;}";
                    newClass += " .coEditToolip_" + userCSSKey + " .dijitTooltipContainer, .coEditToolip_" + userCSSKey + " .dijitTooltipContents::before  {background-color:" + color + " !important;}";

                    if (has("ie") && has("ie") < 11) {
                        var cssStr = css.styleSheet.cssText + newClass;
                        css.styleSheet.cssText = cssStr;
                    } else {
                        var cssStr = css.innerHTML + newClass;
                        css.innerHTML = cssStr;
                    }
                    
                }
            } else {
                console.log("Editor container is empty! ")
            }


            this.IndicatorAuthor();
        },

        turnOnUserIndicator: function(para) {
            this.addIndicatorClass(para);
        },

        createTextFmt: function(para, text, index, excludeEa) {
        	if(pe.scene.localEdit) excludeEa = true;
            var followRun = para.getInsertionTarget(index).follow;
            var cnt = {};
            if (followRun) {
                // get the textRun which style should be followed
                var followLink = (followRun.modelType == constants.MODELTYPE.LINK);
                if (followLink) {
                    followRun = followRun.hints.getLast();
                }
                var fmt = followRun.toJson(index, text.length);
                if (fmt.br)
                    delete fmt.br;
                if (fmt.tab)
                    delete fmt.tab;
                if (fmt.ptab)
                    delete fmt.ptab;
                if (followLink && index == (followRun.start + followRun.length) && fmt.style && fmt.style.styleId == "Hyperlink")
                    delete fmt.style.styleId;

                cnt.fmt = [fmt];
            } else
                cnt.fmt = [{
                    "rt": "rPr",
                    "s": index,
                    "l": text.length
                }];
            cnt.s = index;
            cnt.c = text;
            cnt.l = text.length;
            for (var i = 0; i < cnt.fmt.length; i++) {
                var fmt = cnt.fmt[i];
                if (fmt.fmt) {
                    array.forEach(fmt.fmt, function(f) {
                        if (trackChange.isOn() && ModelTools.isTrackable(para)) {
                            f.ch = [trackChange.createChange("ins")];
                        } else
                            delete f.ch;
                    });
                } else {
                    if (trackChange.isOn() && ModelTools.isTrackable(para)) {
                        fmt.ch = [trackChange.createChange("ins")];
                    } else
                        delete fmt.ch;
                }
                if (!excludeEa)
                    fmt.e_a = pe.scene.getCurrUserId();

            }

            return cnt;
        },

        IndicatorAuthor: function() {
            if (!this.document || !this.document.body)
                return;

            var isEnabled = (pe.coedtingMenuItem ? (pe.coedtingMenuItem.domNode.style.display == "") : true);
            if (pe.scene.isIndicatorAuthor() && isEnabled) {
                if (!domClass.contains(this.document.body, "indicatorEnabled"))
                    domClass.add(this.document.body, "indicatorEnabled");
            } else {
                if (domClass.contains(this.document.body, "indicatorEnabled"))
                    domClass.remove(this.document.body, "indicatorEnabled");
            }
        },

        clearIndicator: function() {
            if (!this.document || !this.document.body)
                return;
            if (domClass.contains(this.document.body, "indicatorEnabled"))
                domClass.remove(this.document.body, "indicatorEnabled");    	
        },

        getIndicatorClass: function(mRun) {
            if (!mRun.author) {
                return "";
            } else if (mRun.modelType == constants.MODELTYPE.TEXT || mRun.modelType == constants.MODELTYPE.PAGENUMBER)
                return " ind" + this.getUserCSSKey(mRun.author);
            else if (this.tools.isImage(mRun)) {
                return " ind_img_" + this.getUserCSSKey(mRun.author);
            }
            else return "";
        },

        updateUserSelections: function(userId, category, orphan, ranges) {
            if (!this.userSelections[userId])
                this.userSelections[userId] = {};
            lang.mixin(this.userSelections[userId], {
                c: category,
                ranges: ranges,
                userId: userId,
                orphan: orphan,
                t: new Date()
            });
        },

        destroyUserSelection: function(userId) {
            var loc = this.userSelections[userId];
            if (loc) {
                var selection = loc.selection;
                if (selection) {
                    if (selection._cursor)
                        selection._cursor.destroy();
                    selection.destroy();
                    loc.selection = null;
                }
            }
        },

        drawUserSelectionsDelayed: function() {
            var me = this;
            clearTimeout(this._drawUserTimer);
            this._drawUserTimer = setTimeout(function() {
                me.drawUserSelections();
            }, 100);
        },

        drawUserSelections: function() {
            var editor = pe.lotusEditor;

            clearTimeout(this._drawUserTimer);

            if (!this._lastDrawTime)
                this._lastDrawTime = 0;

            /*
            if (!pe.scene.isIndicatorAuthor()) {
                for (var userId in this.userSelections) {
                    this.destroyUserSelection(userId);
                }
                return;
            }
            */

            for (var userId in this.userSelections) {
                var sObj = this.userSelections[userId];
                var t = sObj.t;
                
                /*
                if (!pe.scene.getUsersColorStatus(userId)) {
                    this.destroyUserSelection(userId);
                    continue;
                }
                */

                var mc = sObj.c;

                var msgModel;
                var msgCat = constants.MSGCATEGORY;
                switch (mc) {
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
                        msgModel = editor.document;
                        break;
                }
                if (msgModel) {
                    var ranges = sObj.ranges;
                    var rangeObjs = [];
                    array.forEach(ranges, function(ra) {

                        var startModel = msgModel.byId(ra.startParaId);
                        var endModel = ra.collapsed ? startModel : msgModel.byId(ra.endParaId);
                        var startView = null;
                        var endView = null;
                        var rootView = null;
                        if (startModel) {
                            if (!ra.rId) {
                                startView = RangeTools.toViewPosition(startModel, ra.startParaIndex);
                            } else {
                                // find view by rootView's model id and pageNumber
                                var rootModel = msgModel.byId(ra.rId);
                                var allViews = rootModel.getAllViews();
                                for (var ownerId in allViews) {
                                    var viewers = allViews[ownerId];
                                    var firstView = viewers.getFirst();
                                    if (firstView && firstView.page && firstView.page.pageNumber == ra.pageNumber) {
                                        rootView = firstView;
                                        break;
                                    }
                                }
                                if (rootView) {
                                    startView = RangeTools.toViewPosition(startModel, ra.startParaIndex, rootView);
                                }
                            }
                        }
                        if (ra.collapsed) {
                            endView = startView;
                        } else if (endModel) {
                            if (!ra.rId) {
                                endView = RangeTools.toViewPosition(endModel, ra.endParaIndex);
                            } else if (rootView) {
                                endView = RangeTools.toViewPosition(endModel, ra.endParaIndex, rootView);
                            }
                        }
                        if (startView && endView) {
                            var range = new Range(startView, endView, rootView);
                            rangeObjs.push(range);
                        }
                    });
                    if (rangeObjs.length) {
                        var shell = pe.lotusEditor._shell;
                        if (shell) {
                            var editorStore = pe.scene.getEditorStore();
                            var color = editorStore && editorStore.getUserCoeditColor(userId);
                            if (color)
                            {
                                try {
                                    if (!sObj.selection)
                                        sObj.selection = new Selection({
                                            color: color,
                                            userId: userId,
                                            shell: shell,
                                            coEditIndicator: true
                                        });

                                    sObj.selection.selectRanges(rangeObjs);

                                    var cursor = sObj.selection._cursor;
                                    if (cursor) {
                                        var isOrphan = sObj.orphan;
                                        if (!sObj.orphan) {
                                            cursor.showCoEditIndicator(true);
                                            sObj.orphan = true;
                                        } else {
                                            if (sObj.t > this._lastDrawTime)
                                                cursor.detachCoEditIndicator();
                                        }

                                        sObj.lastOrphan = isOrphan;
                                    }
                                } catch (e) {}
                            }
                        }
                    } else if (sObj.selection) {
                        if (sObj.selection._cursor)
                            sObj.selection._cursor.destroy();
                        sObj.selection.destroy();
                        sObj.selection = null;
                    }
                }
            }
            this._lastDrawTime = new Date();
        },
        
        getUserCSSKey: function(userId) {
        	return userId.replace(/\W/g,"_");
        }
    });
    return IndicatorManager;
});
