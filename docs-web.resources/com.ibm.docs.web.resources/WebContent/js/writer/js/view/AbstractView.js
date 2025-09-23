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
    "dojo/dom-construct",
    "writer/common/Container",
    "writer/msg/msgHelper",
    "writer/global",
    "writer/util/HtmlTools",
    "writer/track/trackChange",
    "dojo/query",
    "dojo/_base/array",
    "dojo/dom-class",
    "dojo/dom-style"
], function(domConstruct, Container, msgHelper, global, HtmlTools, trackChange, query, array, domClass, domStyle) {

    var AbstractView = function() {
        this.refId = null;
        this.fontSizeState = global.fontResizeState;
    };
    AbstractView.prototype = {
        updateDomTrackClass: function()
        {
            var d = this.domNode;
            var tc = trackChange;
            var classNames = HtmlTools.str2array(d.className);
            var newClassName = ""
            var trackDeletedUser;
            var trackInsertedUser;
            if (!this.isVisibleInTrack())
            {
                var dt2 = query(".delete-text", d)[0];
                if (!dt2) {
                    domConstruct.create("span", {
                        className: "delete-text",
                        innerHTML : "&#8203;"
                    }, d, "first");
                }
                var dt = query(".delete-triangle", d)[0];
                if (!dt) {
                    domConstruct.create("span", {
                        className: "delete-triangle"
                    }, d);
                }
                newClassName = "track-deleted ";
                trackDeletedUser = this.model.getTrackDeletedUserInTime(null, tc.start, tc.end);
                if (trackDeletedUser)
                    newClassName += " track-deleted-" + trackDeletedUser + " ";
            }
            else
            {
                trackInsertedUser = this.model.getTrackInsertedUserInTime(null, tc.start, tc.end);
                if (trackInsertedUser)
                {
                    newClassName += "track-inserted-" + trackInsertedUser + " ";
                }
            }
            
            for(var i = 0; i < classNames.length; i++)
            {
                if (classNames[i].indexOf("track") != 0)
                    newClassName += classNames[i] + " ";
            }
            
            if (trackDeletedUser || trackInsertedUser)
            {
                if (this.getViewType && this.getViewType() == "text.trackDeletedObjs")
                {
                    var trackId = this.isTrackIdListed();
                    if (trackId)
                    {
                        newClassName += "track-id-listed " + trackId + " ";
                    }
                }
                else
                {
                    var trackIds = this.getTrackClassIds();
                    if (trackIds && trackIds.length)
                    {
                        newClassName += "track-id-listed ";
                        if (this.isVisibleInTrack())
                        {   
                            // ony add the insert id for performance
                            array.forEach(trackIds, function(id){
                                newClassName += id + " ";
                            });
                        }
                        else
                        {
                        	var delTrackId = this.getTrackClassIds(true);
                        	// only add the first id
                        	delTrackId = (delTrackId && delTrackId.length > 0) ? delTrackId[0] : trackIds[0];
                            newClassName += delTrackId + " ";
                        }
                    }
                }
            }
            
            d.className = newClassName;
        },
        
        filterTrackIdClass: function(dom)
        {
            var d = dom || this.domNode;
            var classNames = HtmlTools.str2array(d.className);
            var newClassName = "";
            var dirty = false;
            for(var i = 0; i < classNames.length; i++)
            {
                if (classNames[i].indexOf("track-id") != 0)
                {
                    newClassName += classNames[i] + " ";
                }
                else
                    dirty = true;
            }
            if (dirty)
                d.className = newClassName;
        },
        
        filterTrackClass: function(dom)
        {
            var d = dom || this.domNode;
            var classNames = HtmlTools.str2array(d.className);
            var newClassName = "";
            var dirty = false;
            for(var i = 0; i < classNames.length; i++)
            {
                if (classNames[i].indexOf("track") != 0)
                {
                    newClassName += classNames[i] + " ";
                }
                else
                    dirty = true;
            }
            if (dirty)
                d.className = newClassName;
        },

        getTrackClassIds: function(onlyForDelete)
        {
            var tc = trackChange;
            if (!tc.sum || !tc.sum.activated)
                return;
            var acts = onlyForDelete ? tc.sum.getActsByModel(this.model, null, true) : tc.sum.getActsByModel(this.model);
            var ids = array.map(acts, function(act){return "track-id-" + act.id;});
            return ids;
        },
        
        checkTrackClassAbs: function(dom) {
            this.updateDomTrackClass();
        },
        
        borderStyles: {
            "none": "none",
            "dotted": "dotted",
            "single": "solid",
            "wave": "solid",
            "doubleWave": "solid",
            "dashDotStroked": "solid",
            "dashSmallGap": "dashed",
            "dashed": "dashed",
            "dotDash": "dashed",
            "dotDotDash": "dashed",
            "double": "double",
            "triple": "double",
            "thinThickSmallGap": "double",
            "thickThinSmallGap": "double",
            "thinThickThinSmallGap": "double",
            "thinThickMediumGap": "double",
            "thickThinMediumGap": "double",
            "thinThickThinMediumGap": "double",
            "thinThickLargeGap": "double",
            "thickThinLargeGap": "double",
            "thinThickThinLargeGap": "double",
            "threeDEngrave": "groove",
            "threeDEmboss": "ridge",
            "inset": "inset",
            "outset": "outset"
        },

        generateUUID: function() {
            this.ownerId = msgHelper.getUUID();
        },
        getViews: function() {
            return this.model.getRelativeViews(this.ownerId);
        },
        getOwnerId: function() {
            return this.ownerId; // Model is null when the view is page.
        },
        isZoomed: function() {
            return (this.fontSizeState != global.fontResizeState);
        },
        _zoomChangedImpl: function() {
            // Implemented in child object
        },
        zoomChanged: function() {
            if (this.fontSizeState != global.fontResizeState) {
                // Update this view's left, top, width, height information
                this.fontSizeState = global.fontResizeState;
                this._zoomChangedImpl();
            }
        },
        //
        getParent: function() {
            return this.parent;
        },
        getLeft: function() {
            this.zoomChanged();

            var result = this.getParent().getContentLeft() + (this.left || 0);
            if (isNaN(result)) {
                console.error("the left position value must be number!");
                return 0;
            }
            return result;
        },
        getTop: function() {
            var result = this.getParent().getContentTop() + (this.top || 0);
            if (isNaN(result)) {
                console.error("the top position value must be number!");
                return 0;
            }
            return result;
        },
        getWidth: function() {
            this.zoomChanged();
            return this.w;
        },
        setWidth: function(w) {
            this.w = w;
        },
        // optional implement
        next: function() {
            var p = this.getParent();
            if (p) {
                var next = p.getContainer().next(this);
                return next ? next.canSelected() ? next : next.next() : null;
            } else {
                return null;
            }

        },
        previous: function() {
            var p = this.getParent();
            if (p) {
                var prev = p.getContainer().prev(this);
                return prev ? (prev.canSelected() ? prev : prev.previous()) : null;
            } else {
                return null;
            }
        },
        previousEx: function() {
            var p = this.getParent();
            if (p) {
                var prev = p.getContainer().prev(this);
                return prev;
            } else {
                return null;
            }
        },
        getFirst: function() {
            var c = this.getContainer();
            var first = c && c.getFirst();
            return first ? first.canSelected() ? first : first.next() : null;
        },
        getLast: function() {
            var c = this.getContainer();
            var last = c && c.getLast();
            return last ? last.canSelected() ? last : last.previous() : null;
        },
        getByIndex: function(index) {
            var c = this.getContainer();
            if (c) {
                return c.getByIndex(index);
            }
            return null;
        },
        canSelected: function() {
            return true;
        },
        //must be implement!
        getViewType: function() {
            console.error("this function getViewType must be implement");
            throw "this function getViewType must be implement";
        },
        getElementPath: function() {
            console.error("this function getElementPath must be implement");
            throw "this function getElementPath must be implement";
        },
        getChildPosition: function() {
            console.error("this function getChildPosition must be implement");
            throw "this function getChildPosition must be implement";
        },
        getContainer: function() {
            console.warn("the function getContainer has not be implemented!");
            return null;
        },
        // if the in the point, really has some thing, gap? it can be penetrate?
        // default, can not be penetrated.
        canBePenetrated: function(x, y) {
            console.warn("the function canBePenetrated has not be implemented!");
            return false;
        },
        // if the view can be split to more than two part to append to more than two page body then return value is true;
        canBreak2pieces: function() {
            return false;
        },
        getFirstViewForCursor: function() {
            var container = this.getContainer();
            if (container) {
                var first = container.getFirst();
                if (first) {
                    return first.getFirstViewForCursor();
                }
            }
            return this;
        },
        getReferredFootNote: function(_cache) {
            var c;
            var children = this.getContainer();
            children && children.forEach(function(child) {
                var fns = child.getReferredFootNote(_cache);
                if (fns) {
                    if (!c) c = new Container();
                    c.appendAll(fns);
                }
            });
            return c;
        },
        isEmpty: function() {
            var c = this.getContainer();
            if (c && c.isEmpty()) {
                return true;
            }
            return false;
        },
        getDomNode: function() {
            return this.domNode;
        },
        releaseDom: function() {
            var c = this.getContainer();
            if (c) {
                var child = c.getFirst();
                while (child) {
                    child.releaseDom();
                    child = c.next(child);
                }
            }

            if (this.domNode) {
                domConstruct.destroy(this.domNode);
                this.domNode = null;
            }
            this._releaseDom && this._releaseDom();
        },
        // if the view A has been splited to A,B,C...to be append to different container, this function will return true;
        isFirstView: function() {
            try {
                if (this.model.getRelativeViews(this.getOwnerId()).getFirst() == this) {
                    return true;
                }
            } catch (e) {
                console.error(e);
                return false;
            }
        },
        isVisibleInTrack: function() {
            return this._isVisibleInTrack !== false;
        }
    };
    return AbstractView;
});
