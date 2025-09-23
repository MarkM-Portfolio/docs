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
    "writer/util/ViewTools",
    "writer/view/AbstractCanvas",
    "writer/view/AnchorView/AnchorImageView",
    "writer/view/selection/AnchorCanvasResizerView"
], function(declare, domConstruct, ViewTools, AbstractCanvas, AnchorImageView, AnchorCanvasResizerView) {

    var AnchorCanvas = declare("writer.view.AnchorView.AnchorCanvas", [AnchorImageView, AbstractCanvas], {
        className: "AnchorCanvas",

        _createResizer: function() {
            this._resizerView = new AnchorCanvasResizerView(this);
        },

        layout: function(line) {
            // layout using parent's layout
            this.inherited(arguments);

            var vTools = ViewTools;

            var p = vTools.getParagraph(line);
            var body = vTools.getTextContent(p);

            // occupy space
            var viewType = this.getViewType();
            if (viewType == "text.AnchorCanvas" || viewType == "text.SQCanvas" || viewType == "text.TBCanvas") {
                this.zIndex = 0;
                this.ownedSpace = this.calcuSpace(line, p, body);
                if (this.ifCanOccupy(line))
                    body.occupy(this.ownedSpace);
            } else if (vTools.isCanvas(this)) {
                this.ownedSpace = this.calcuSpace(line, p, body);
                if (this.ifCanOccupy(line, true))
                    body.occupy(this.ownedSpace, true);
            }

            // layout children canvas/group/shape
            if (this.isVisibleInTrack())
                this.layoutChildren();
        },

        updatePosition: function(body) {
            var line = this.parent;
            var p = ViewTools.getParagraph(line);

            var viewType = this.getViewType();

            // update positionV
            this._updatePositionV(line);

            // update space
            var newSpace = this.calcuSpace(line, p, body);
            if (!this.ownedSpace || !this.ownedSpace.equals(newSpace)) {
                if (this.ownedSpace)
                    body.releaseSpace(this.ownedSpace);

                this.ownedSpace = newSpace;
                if (viewType == "text.AnchorCanvas" || viewType == "text.SQCanvas" || viewType == "text.TBCanvas") {
                    if (this.ifCanOccupy(line))
                        body.occupy(this.ownedSpace);
                } else {
                    if (this.ifCanOccupy(line, true))
                        body.occupy(this.ownedSpace, true);
                }
            } else {
                // as the body has released the spaces, here occupy the space again.
                if (viewType == "text.AnchorCanvas" || viewType == "text.SQCanvas" || viewType == "text.TBCanvas") {
                    if (this.ifCanOccupy(line))
                        body.occupy(this.ownedSpace);
                } else {
                    if (this.ifCanOccupy(line, true))
                        body.occupy(this.ownedSpace, true);
                }
            }
        },

        render: function() {
            if (!this.domNode || this.dirty) {
                // clear flag
                delete this.dirty;

                var style = this.isVisibleInTrack() ? "position:absolute;" : ""

                if (isNaN(this.marginLeft)) {
                    this.marginLeft = 0;
                }
                if (isNaN(this.marginTop)) {
                    this.marginTop = 0;
                }

                // node
                var widthWithBorder = this.iw + this.padLeft + this.padRight;
                var heightWithBorder = this.ih + this.padTop + this.padBottom;

                style = style + "text-indent:0px;";
                style = style + "left:" + (this.marginLeft - this.padLeft) + "px;";
                style = style + "top:" + (this.marginTop - this.padTop) + "px;";
                style = style + "width:" + widthWithBorder + "px;";
                style = style + "height:" + heightWithBorder + "px;";

                var class_style = this.className + " " + this.getCSSStyle();
                this.domNode = domConstruct.create("div", {
                    "class": class_style,
                    "style": style + this.getCommonDomStr()
                });
                
                if (this.isVisibleInTrack())
                {
                    this.borderNode = domConstruct.create("div", {
                        "class": "canvas_frameborder",
                        "style": "position:absolute;left:" + this.padLeft + "px;bottom:" + this.padBottom + "px;" + "width:" + this.iw + "px; height:" + this.ih + "px;background-color:rgba(1,1,1,0)"
                    }, this.domNode);

                    // cut canvas when canvas cross page edge
                    var maskHidden = "visible";
                    if (this._maskLeft > 0 || this._maskRight > 0 || this._maskTop > 0 || this._maskBottom > 0)
                        maskHidden = "hidden";
                    this.maskNode = domConstruct.create("div", {
                        "class": "canvas_mask",
                        "style": "position:absolute;overflow:" + maskHidden + ";" +
                            "left:" + (this._maskLeft + this.padTop) + "px;bottom:" + (this._maskBottom + this.padBottom) + "px;width:" + this._maskWidth + "px;height:" + this._maskHeight + "px;z-index:" + this.zIndex + ";"
                    }, this.domNode);

                    // canvas node
                    var style = "position:absolute;left:" + (-this._maskLeft) + "px;bottom:" + (-this._maskBottom) + "px;" + "width:" + this.iw + "px;height:" + this.ih + "px;";

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
                        "class": "canvas_node",
                        "style": style
                    }, this.maskNode);

                    this.containerNode = domConstruct.create("div", {
                        "class": "canvas_container",
                        "style": "position:absolute;left:" + this.padLeft + "px;bottom:" + this.padBottom + "px;" + "width:" + this.iw + "px; height:" + this.ih + "px;background-color:rgba(1,1,1,0)"
                    }, this.canvasNode);

                    // render children canvas/grou/shape
                    this.createChilderDOM(this.containerNode);

                    if (!this.model.forPreview)
                        this._resizerView && this._resizerView.create(this.domNode, this.canvasNode);
                }
                else
                {
                    this.domNode.style.display = "inline-block";
                    this.domNode.style.height = "0px";
                }
            }
            this.checkTrackClass(this.domNode);
            return this.domNode;
        },

        getTop: function(asRunInLine) {
            if (asRunInLine)
                return this.inherited(arguments);
            else
                return this.parent.getTop() + this.marginTop - this.padTop;
        },
        getLeft: function(asRunInLine) {
            if (asRunInLine)
                return this.inherited(arguments);
            else
                return this.parent.getLeft() + this.marginLeft - this.padLeft;
        },
        getContentLeft: function() {
            return this.getLeft() + this.padLeft;
        },
        getContentTop: function() {
            return this.getTop() + this.padTop;
        },

        getElementPath: function(x, y, lineHeight, path, options) {
            // check children
            x = x - this.marginLeft;
            y = y - this.marginTop;

            var tarChild = this._childViews.selectReverse(function(view) {
                return view.ifPointMe(x, y);
            });

            if (tarChild) {
                path.push(tarChild);
                tarChild.getElementPath(x, y, lineHeight, path, options);
            }
        },
        inTextZone: function(x, y) {
            x = x - this.marginLeft;
            y = y - this.marginTop;

            var tarChild = this._childViews.selectReverse(function(view) {
                return view.ifPointMe(x, y);
            });

            if (tarChild)
                return tarChild.inTextZone(x, y);

            return false;
        }
    });

    return AnchorCanvas;
});
