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
    "dojo/dom-construct",
    "dojo/has",
    "writer/constants",
    "writer/model/Model",
    "writer/view/AbstractCanvas",
    "writer/view/ImageView",
    "writer/view/selection/CanvasResizerView"
], function(declare, domConstruct, has, constants, Model, AbstractCanvas, ImageView, CanvasResizerView) {

    var InLineCanvas = declare("writer.view.InLineCanvas", [ImageView, AbstractCanvas], {
        className: "InLineCanvas",

        _createResizer: function() {
            this._resizerView = new CanvasResizerView(this);
        },

        getViewType: function() {
            return "text.InLineCanvas";
        },

        layout: function(line) {
            // layout using parent's layout
            this.inherited(arguments);

            // layout children canvas/group/shape
            this.layoutChildren();
        },

        render: function(parentChange) {
            if (!this.domNode || this.dirty) {
                // clear flag
                delete this.dirty;

                var strMargin = this._calLeftMarginCssStyle();

                // create dom
                this.domNode = domConstruct.create("div", {
                    "class": this.className,
                    "style": "text-indent:0px;display:inline-block;position:relative;width:" +
                        this.getWidth() + "px;height:" + this.getHeight() + "px;" + strMargin
                });
                
                if (this.isVisibleInTrack())
                {
                    this.borderNode = domConstruct.create("div", {
                        "style": "position:absolute;left:" + this.padLeft + "px;bottom:" + this.padBottom + "px;" + "width:" + this.w + "px; height:" + this.h + "px;background-color:rgba(1,1,1,0)"
                    }, this.domNode);

                    var style = "position:absolute;left:0px;bottom:0px;" + "width:" + this.w + "px;height:" + this.h + "px;";

                    if (this.padTop > 0) {
                        style = style + "padding-top:" + this.padTop + "px;";
                    }
                    if (this.padRight > 0) {
                        style = style + "padding-right:" + this.padRight + "px;";
                    }
                    if (this.padLeft > 0) {
                        style = style + "padding-left:" + this.padLeft + "px;";
                    }
                    if (this.padBottom > 0) {
                        style = style + "padding-bottom:" + this.padBottom + "px;";
                    }
                    if (this.model.bgColor)
                        style += ("background-color:" + this.model.bgColor) + ";";

                    this.canvasNode = domConstruct.create("div", {
                        "style": style
                    }, this.domNode);

                    this.containerNode = domConstruct.create("div", {
                        "style": "position:absolute;left:" + this.padLeft + "px;bottom:" + this.padBottom + "px;" + "width:" + this.w + "px; height:" + this.h + "px;background-color:rgba(1,1,1,0)"
                    }, this.canvasNode);
                    
                     // render children canvas/grou/shape
                    this.createChilderDOM(this.containerNode);
                }
               
                if (!this.isVisibleInTrack())
                {
                    this.domNode.style.height = "";
                }
                else if (!this.model.forPreview)
                    this._resizerView && this._resizerView.create(this.domNode, this.canvasNode);
                
            } else if (parentChange) {
                this._updateLeftMarginDom();
            }
            return this.domNode;
        },

        getContentLeft: function() {
            return this.getLeft() + this.padLeft;
        },
        getContentTop: function() {
            return this.getTop() + this.padTop;
        },

        getElementPath: function(x, y, lineHeight, path, options) {
            // check children
            x = x - this.padLeft - this.getLeftMargin();
            y = y - this.padTop;

            var tarChild = this._childViews.selectReverse(function(view) {
                return view.ifPointMe(x, y);
            });

            if (tarChild) {
                path.push(tarChild);
                tarChild.getElementPath(x, y, lineHeight, path, options);
            } else if (has("mobile")) {
                var run = {
                    "index": 0,
                    "isInside": true
                };
                path.push(run);
            }
        }
    });

    Model.prototype.viewConstructors[constants.MODELTYPE.CANVAS] = InLineCanvas;

    return InLineCanvas;
});
