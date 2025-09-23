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
	"dojo/topic",
    "writer/common/Container",
    "writer/constants",
    "dojo/_base/array",
    "writer/global"
], function(has, topic, Container, constants, array, global) {

    var Model = function() {
        this.refId = null;
        this._viewers = null;
    };
    Model.prototype = {
        cleanCh: function()
        {
            delete this.ch;
            delete this.rPrCh;
            delete this.trPrCh;
            delete this.pPrCh;
            if (this.container)
            {
                this.container.forEach(function(c){
                    if (c.cleanCh)
                        c.cleanCh();
                });
            }
        },
        getCh: function() {
            if (has("trackGroup"))
                return this.ch;
            if (this.parent && this.parent.getCh) {
                var parentCh = this.parent.getCh();
                if (parentCh && this.ch)
                    return this.ch.concat(parentCh);
                else if (!this.ch)
                    return parentCh;
            }

            return this.ch;
        },
        getInsertTrack: function(chObj) {
            var obj = chObj || this.getCh();
            if (obj && obj.length) {
                return array.filter(obj, function(c) {
                    return c.t == "ins"
                })[0];
            }
            return null;
        },
        getDeleteTrack: function(chObj) {
            var obj = chObj || this.getCh();
            if (obj && obj.length) {
                return array.filter(obj, function(c) {
                    return c.t == "del"
                })[0];
            }
            return null;
        },
        isTrackDeleted: function(chObj) {
            return this.getDeleteTrack(chObj) != null;
        },
        getTrackDeletedUserInTime: function(chObj, from, end) {
            var obj = this.getDeleteTrack(chObj);
            if (!obj)
                return null;
            if (obj.d >= from && obj.d <= end)
                return obj.u;
            return null
        },
        getTrackInsertedUserInTime: function(chObj, from, end) {
            var obj = this.getInsertTrack(chObj);
            if (!obj)
                return null;
            if (obj.d >= from && obj.d <= end)
                return obj.u;
            return null
        },
        isTrackInserted: function(chObj) {
            var obj = this.getInsertTrack(chObj);
            return obj ? obj.u : false;
        },
        
        /*
        isTrackDeletedMyInsertion: function(ch)
        {
            var insCh = ch && ch.length ? array.filter(ch, function (c) {
                return c.t == "ins";
            })[0] : null;
            
            var delCh = ch && ch.length ? array.filter(ch, function (c) {
                return c.t == "del";
            })[0] : null;
            
            if (insCh && delCh && insCh.u == delCh.u && delCh.d - insCh.d <= global.trackChange.SELF_INS_TIME)
            {
                return true;
            }  
        },
        */
        
        _isSameDay: function(d1, d2)
        {
            return (d1.getDate() == d2.getDate() && d1.getMonth() == d2.getMonth() && d1.getFullYear() == d2.getFullYear());
        },
        
        // meaning the model will be trully deleted
        isTrackInsertedByMe: function(chObj) {
            var insertTrack = this.getInsertTrack(chObj);
            if (insertTrack && insertTrack.u == pe.scene.getCurrUserId()) {
                var d = insertTrack.d;
                var date = new Date(d);
                // if inserted in another day or some one not saw this insertion before, we can not fully delete this.
                if (!this._isSameDay(date, new Date()))
                    return false;
                else if (global.trackChange.isAnyUserCare(d))
                    // if any user care about this insert and delete, treat this as NOT my insertion, just add delete change.
                    return false;
                return true;
            }
            return false;
        },
        getRoot: function() {
            var curr = this;
            var parent = this.parent;
            while (parent != null) {
                curr = parent;
                parent = parent.parent;
            }
            return curr;
        },

        getMessageCategory: function() {
            var mc = constants.MSGCATEGORY.Content;
            if (this.isInHeaderFooter())
                mc = constants.MSGCATEGORY.Relation;
            else if (this.isInFootNote())
                mc = constants.MSGCATEGORY.Footnotes;
            else if (this.isInEndNote())
                mc = constants.MSGCATEGORY.Endnotes;
            return mc;
        },
        isInHeaderFooter: function() {
            return global.modelTools.getParent(this, constants.MODELTYPE.HEADERFOOTER) != null;
        },
        isInEndNote: function() {
            return global.modelTools.getParent(this, constants.MODELTYPE.ENDNOTE) != null;
        },
        isInFootNote: function() {
            return global.modelTools.getParent(this, constants.MODELTYPE.FOOTNOTE) != null;
        },
        isVisibleInTrack: function() {
            if (this.modelType == constants.MODELTYPE.PARAGRAPH) {
                return !this.isAllDeletedInTrack();
            }
            else 
            {
                if (this.paragraph)
                {
                    if (this.paragraph.isTrackDeleted())
                        return false;
                }
                if (this.rParagraph && this.rParagraph != this.paragraph)
                {
                    if (this.rParagraph.isTrackDeleted())
                        return false;
                }
            }
            if (this.container && !(global.modelTools.isCanvas(this) || global.modelTools.isTextBox(this))) {
                var hasView = false;
                this.container.forEach(function(child) {
                    if (child) {
                        if (child.isVisibleInTrack()) {
                            hasView = true;
                            return false;
                        }
                    }
                });
                return hasView;
            } else {
                if (this.isTrackDeleted()) {
                    return false
                }
                return true;
            }
        },


        viewConstructors: {},
        isCompoundModel: function() {
            var mType = this.modelType;
            if (mType == 'table' || mType == 'tr' || mType == 'tc') // tr/tc
            {
                return true;
            }
            return false;
        },
        //	byId: function()
        //	{
        //		return null;
        //	},
        _initView: function(ownerId) {
            var cont = new Container(this);
            this._viewers = this._viewers || {};
            this._viewers[ownerId] = cont;
            return cont;
        },
        preLayout: function(ownerId, clearState) {
            if (!ownerId) {
                console.error("the ownerId must be needed");
                return null;
            }
            clearState && this.clearState && this.clearState();
            var constructor = this.viewConstructors[this.modelType];

            this._initView(ownerId);
            var viewer = new constructor(this, ownerId);
            this.addViewer(viewer, ownerId);
            return viewer;
        },
        addViewer: function(viewer, ownerId, after) {
            if (!ownerId) {
                console.error("the ownerId must be needed");
                return null;
            }
            var viewers = this.getViews(ownerId);
            if (!viewers) {
                viewers = this._initView(ownerId);
            }
            if (after) {
                viewers.insertAfter(viewer, after);
            } else {
                viewers.append(viewer);
            }
            this.addViewerCallBack(viewer);
        },
        removeViewer: function(viewer, ownerId) {
            ownerId = ownerId || viewer.getOwnerId();
            if (!ownerId) {
                console.error("something Error");
                return;
            }
            var viewers = this.getViews(ownerId);
            if (!viewers) {
                console.error("something Error");
                return
            }
            viewers.remove(viewer);
            if (viewers.isEmpty())
                delete this._viewers[ownerId];
        },
        addViewerCallBack: function(view) {

        },
        getViews: function(ownerId) {
            if (!this._viewers)
                return null;
            var viewer = this._viewers[ownerId];
            if (!viewer) return null;
            else return viewer;
        },
        getRelativeViews: function(ownerId) {
        	if (!this._viewers)
                return null;
            return this._viewers[ownerId];
        },
        getAllViews: function() {
            return this._viewers;
        },
        getOwnerId: function(view) {
            if (view) {
                for (var ownerId in this._viewers) {
                    if (this._viewers[ownerId].contains(view)) {
                        return ownerId;
                    }
                }
            }
            return null;
        },
        getParent: function() {
            return this.parent;
        },
        /** for block in trackBlockGroup, it will return the real parent in json */
        getMsgParent: function() {
            return this.parent;
        },
        /** for block in trachBlockGroup, it will return the real index in json */
        getMsgIdx: function() {
            return this.parent.container.adapteIndexOf(this);
        },
        firstChild: function() {
            if (!this.container) {
                return null;
            }
            return this.container.getFirst();
        },
        lastChild: function() {
            if (!this.container) {
                return null;
            }
            return this.container.getLast();
        },

        nextChild: function(m) {
            if (!this.container) {
                return null;
            }
            return this.container.next(m);
        },

        previousChild: function(m) {
            if (!this.container) {
                return null;
            }
            return this.container.prev(m);
        },

        next: function() {
            if (!this.parent) {
                return null;
            }
            return this.parent.nextChild(this);
        },
        previous: function() {
            if (!this.parent) {
                return null;
            }

            return this.parent.previousChild(this);
        },
        broadcast: function(message, param) {
            if (!this._viewers)
                return;

            if (this._viewers.isContainer) {
                var view = this._viewers.getFirst();
                while (view) {
                    try {
                        view.listener && view.listener(message, param);
                        view = this._viewers.next(view);
                    } catch (e) {
                        console.log(e.message);
                        view = null;
                    }
                }
            } else {
                for (var ownerId in this._viewers) {
                    var viewers = this._viewers[ownerId];
                    var view = viewers.getFirst();
                    while (view) {
                        try {
                            view.listener && view.listener(message, param);
                            view = viewers.next(view);
                        } catch (e) {
                            console.log(e.message);
                            view = null;
                        }
                    }
                }
            }
        },

        // For performance reason, change function call to inline.
        _isValid: function(prop) {
            if (prop && prop != 'empty')
                return true;
            return false;
        },

        getMergedTextProperty: function() {
            if (!this.mergedTextProperty) {
                if (this.modelType == constants.MODELTYPE.DOCUMENT || this.modelType == constants.MODELTYPE.HEADERFOOTER || this.modelType == constants.MODELTYPE.FOOTNOTE || this.modelType == constants.MODELTYPE.ENDNOTE) {
                    // Get default style 
                    var styleTextProp = null;
                    if (window.layoutEngine)
                        styleTextProp = pe.lotusEditor.getDocMergedDefaultTextStyle();

                    var textProp = this.textProperty;
                    if (styleTextProp && styleTextProp != "empty" && textProp) {
                        this.mergedTextProperty = styleTextProp.merge(textProp, true);
                    } else if (textProp || (styleTextProp && styleTextProp != "empty"))
                        this.mergedTextProperty = (textProp || styleTextProp).clone();
                    else
                        this.mergedTextProperty = "empty"; //Empty merged object
                } else {
                    var parent = this.parent;
                    // Defect 43306, Don't get parent's text property for text box object.
                    // Can't forbidden paragraph's css. 
                    //    			if(writer.util.ModelTools.isTextBox(this))
                    //    				parent = writer.util.ModelTools.getDocument(this);

                    var parentTextProp = parent && parent.getMergedTextProperty();

                    var styleTextProp = null;
                    if (window.layoutEngine) {
                    	var pStyleId = this.getStyleId();
                    	if(pStyleId) {
                    		var style = pe.lotusEditor.getRefStyle(pStyleId);
                    		if(style)
                    			styleTextProp = style.getMergedTextProperty();
                    	}
                    }

                    var textProp = this.textProperty;
                    if (styleTextProp && styleTextProp != "empty" && textProp) {
                        this.mergedTextProperty = styleTextProp.merge(textProp, true);
                    } else if (textProp || (styleTextProp && styleTextProp != "empty"))
                        this.mergedTextProperty = (textProp || styleTextProp).clone();
                    else
                        this.mergedTextProperty = "empty"; //Empty merged object 

                    if (parentTextProp && parentTextProp != "empty") {
                        if (this.mergedTextProperty == "empty")
                            this.mergedTextProperty = parentTextProp.clone();
                        else
                            this.mergedTextProperty = parentTextProp.merge(this.mergedTextProperty);
                    }

                }

            }
            return this.mergedTextProperty;
        },

        getCSSStyle: function() {
            var style = null;
            if (window.layoutEngine && window.layoutEngine.rootModel) {
                if (this.getStyleId()) {
                    style = pe.lotusEditor.getRefStyle(this.getStyleId());
                } else {
                    style = pe.lotusEditor.getDefaultTextStyle();
                }
            }
            var str = " ";
            if (style && style.refId) {
                str += style.refId;
            }

            var defaultStyle = this.getDefaultStyle && this.getDefaultStyle();
            if (defaultStyle && defaultStyle.refId)
                str += (" " + defaultStyle.refId);
            return str;
        },
        getStyle: function() {
            if (!this.mergedStyle) {
                this.mergedStyle = this.textProperty;
                if (this.mergedStyle == "empty" || !this.mergedStyle) {
                    this.mergedStyle = {};
                } else {
                    this.mergedStyle = this.mergedStyle.getStyle();
                }
            }
            return this.mergedStyle;
        },
        getComputedStyle: function() {
            if (!this.mergedComputedStyle) {
                if (!this.parent) {
                    return null;
                }
                var parentTextProperty = this.parent.getMergedTextProperty();
                if (parentTextProperty && parentTextProperty != "empty") {
                    this.ParentBGColor = parentTextProperty.getStyle()['background-color'];
                    if(this.textProperty)
                    	this.mergedComputedStyle = this.textProperty.getComputedStyle(parentTextProperty);
                }
                if (!this.mergedComputedStyle) {
                    var s = (parentTextProperty && parentTextProperty != "empty") ? parentTextProperty : this.textProperty;
                    if (s) {
                    	if(s.getComputedStyle)
                    		this.mergedComputedStyle = s.getComputedStyle();
                    	else if (s.getStyle)
                    		this.mergedComputedStyle = s.getStyle();
                    }
                }
            }

            return this.mergedComputedStyle;
        },
        clearCache: function() {
            delete this.mergedStyle;
            delete this.mergedTextProperty;
            delete this.mergedComputedStyle;
            delete this.ParentBGColor;
        },
        clearAllCache: function() {
            this.clearCache();
            this.container && this.container.forEach(function(c) {
                if (c && c.clearAllCache)
                    c.clearAllCache();
            });
        },
        createSubModel: function(json) {
            return global.modelFac.createModel(json, this);
        },
        getStyleId: function() {
            // Must override function
            console.error("Need implement the get styleId function in model!");
        },
        getItemByIndex: function(index) {
            return this.container.getByIndex(index);
        },
        triggerTrackInfoUpdate: function(mode) {
        	if(this.modelType == constants.MODELTYPE.TABLE || this.modelType == constants.MODELTYPE.PARAGRAPH)
        	{
        		var m = mode || "reset";
        		var t = (this.modelType == constants.MODELTYPE.TABLE ? "table" : "" );
        		topic.publish("/trackChange/update", this, m, t);
         	}
        }
    };

    return Model;
});
