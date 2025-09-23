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
    "dojo/dom-style",
    "concord/util/browser",
    "writer/common/Container",
    "writer/common/tools"
], function(declare, domStyle, browser, Container, tools) {

    var AbstractCanvas = declare("writer.view.AbstractCanvas", null, {
        isCanvasView: true,
        _childViews: null, // contains sub views

        /*
         * this function is used to return the origin point of this coordinate.
         */
        getChildOriginPoint: function() {
            var getPxValue = tools.toPxValue;

            if (!this.childOriginX)
                this.childOriginX = this.model.chOffX ? getPxValue(this.model.chOffX) : 0;

            if (!this.childOriginY)
                this.childOriginY = this.model.chOffY ? getPxValue(this.model.chOffY) : 0;

            return {
                x: this.childOriginX,
                y: this.childOriginY
            };
        },

        getChildScale: function() {
            var getPxValue = tools.toPxValue;

            if (!this.scaleX)
                this.scaleX = (this.model.extX && this.model.chExtX) ? getPxValue(this.model.extX) / getPxValue(this.model.chExtX) : 1;

            if (!this.scaleY)
                this.scaleY = (this.model.extY && this.model.chExtY) ? getPxValue(this.model.extY) / getPxValue(this.model.chExtY) : 1;

            var parent = this.getParent();
            var scale = parent && parent.getChildScale && parent.getChildScale();
            if (scale)
                return {
                    x: this.scaleX * scale.x,
                    y: this.scaleY * scale.y
                };
            else
                return {
                    x: this.scaleX,
                    y: this.scaleY
                };
        },

        getBorderStyle: function(bHidden) {
            var width = bHidden ? 0 : 1;

            if (this.model.isGroup)
                return width + "px dashed #808080";
            else
                return width + "px solid #808080";
        },

        // get the top level of the canvas/group
        _getTopParent: function() {
            var ret = this;
            var parent = this.getParent();
            while (parent && parent.isCanvasView) {
                ret = parent;
                parent = parent.getParent();
            }

            return ret;
        },

        getContainer: function() {
            return this._childViews;
        },

        // turn on/off this and all children's border
        switchBorder: function(bHidden) {
            if (bHidden)
                domStyle.set(this.borderNode, {
                    "border": this.getBorderStyle(bHidden)
                });

            else
                domStyle.set(this.borderNode, {
                    "border": this.getBorderStyle(bHidden)
                });

            this._childViews.forEach(function(view, i) {
                view.isCanvasView && view.switchBorder(bHidden);
            });
        },

        onSelect: function() {
            if (browser.isMobile()) {
            	concord.util.mobileUtil.image.show(this);
                return;
            }

            // turn on border
            if (this.borderNode) {
                var topParent = this._getTopParent();
                topParent && topParent.switchBorder(false);
            }
        },

        onUnSelect: function() {
            if (browser.isMobile()) {
            	concord.util.mobileUtil.image.show();
                return;
            }

            // turn off border
            if (this.borderNode) {
                var topParent = this._getTopParent();
                topParent && topParent.switchBorder(true);
            }
        },

        constructor: function(model, ownerId) {
            this.initViews(ownerId);
        },
        
        layout: function()
        {
            this.inherited(arguments);
            if (this.model.forPreview)
            {
                this.padLeft = this.padTop = this.padRight = this.padBottom = 0;
                this.paddingLeft = this.paddingTop = this.paddingRight = this.paddingBottom = 0;
                this._maskLeft = this._maskRight = this._maskTop = this._maskBottom = 0;
                this.marginTop = 0;
                this.marginLeft = 0;
                this._maskWidth = this.iw;
                this._maskHeight = this.ih;
            }  
        },

        initViews: function(ownerId) {
            var that = this;

            // generate canvas/group/shape views
            this._childViews = new Container(this);
            if (this.isVisibleInTrack())
            {
                var children = this.model.getChildren();
                children.forEach(function(child, i) {
                    var childView = child.preLayout(ownerId);
                    that._childViews.append(childView);
                });
            }
        },

        layoutChildren: function() {
            var that = this;

            // layout canvas/group
            this._childViews.forEach(function(view, i) {
                view.parent = that;
                view.layout(that);
            });
        },

        createChilderDOM: function(parentDomNode) {
            // render canvas/group
            this._childViews.forEach(function(view, i) {
                var domNode = view.render();
                parentDomNode.appendChild(domNode);
            });
        },
    });


    return AbstractCanvas;
});
