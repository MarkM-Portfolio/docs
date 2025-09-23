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
    "dojo/_base/declare",
    "concord/util/browser",
    "writer/common/Container",
    "writer/common/tools",
    "writer/constants",
    "writer/model/Model",
    "writer/msg/msgCenter",
    "writer/util/ViewTools",
    "writer/view/ImageView",
    "writer/view/selection/TextBoxResizerView",
    "writer/view/update/TextBoxViewUpdate"
], function(domConstruct, declare, browser, Container, tools, constants, Model, msgCenter, ViewTools, ImageView, TextBoxResizerView, TextBoxViewUpdate) {

    var InLineTextBox = declare("writer.view.InLineTextBox", [ImageView, TextBoxViewUpdate], {
        container: null,
        bodyPr: null,
        className: "InLineTextBox",
        constructor: function(model, ownerId, start, len) {
            this.ownerId = ownerId;
            this.bodyPr = model.bodyPr;
            this.container = new Container(this);
            var contents = this.model && this.model.container;
            if (contents) {
                var c = contents.getFirst();
                while (c) {
                    var m = c.preLayout(ownerId);
                    this.container.append(m);
                    c = contents.next(c);
                }
            }

            // create resizer view
            this._createResizer();
        },

        _createResizer: function() {
            this._resizerView = new TextBoxResizerView(this);
        },

        //override and disable this function to avoid set padding top to 0
        initLineSpace: function(line) {
            return;
        },

        // resize
        resize: function(incX, incY) {
            var sizeX = this.w + this.paddingLeft + this.paddingRight;
            var sizeY = this.h + this.paddingTop + this.paddingBottom;

            var newSizeX = sizeX + incX;
            var newSizeY = sizeY + incY;

            var minSizeX = this._MINIMIZE_SIZE + this.paddingLeft + this.paddingRight;
            var minSizeY = this._MINIMIZE_SIZE + this.paddingTop + this.paddingBottom;

            if (newSizeX < minSizeX) {
                newSizeX = minSizeX;
            }

            if (newSizeY < this.minSizeY) {
                newSizeY = this.minSizeY;
            }

            var oldSz = {
                "extent": {
                    "cx": this.model.width,
                    "cy": this.model.height
                }
            };
            if (this.model.isAutoFit())
                oldSz.spAutoFit = {
                    "ele_pre": "a"
                };
            else
                delete oldSz.spAutoFit;

            if (this.model.isAutoWrap())
                oldSz.autoWrap = {};
            else
                delete oldSz.autoWrap;

            var newSz = {
                "extent": {
                    "cx": tools.PxToCm(newSizeX) + "cm",
                    "cy": tools.PxToCm(newSizeY) + "cm"
                }
            };
            newSz.autoWrap = {};

            // change size
            this.model.setSize(newSz.extent, false, true);

            // send image
            var msg = msgCenter.createMsg(constants.MSGTYPE.Attribute, [msgCenter.createSetAttributeAct(this.model, null, null, {
                'size': newSz
            }, {
                'size': oldSz
            })]);
            msgCenter.sendMessage([msg]);
        },

        // update after resize
        _resizeUpdate: function() {
            // clear para
            var para = this.container.getFirst();
            while (para) {
                if (para.lines && para.lines.length() != 0)
                    para.lines.removeAll();

                para = this.container.next(para);
            }
        },

        getViewType: function() {
            return "text." + this.className;
        },

        // Override parent function
        getBoxHeight: function() {
            return this.inherited(arguments) + this.paddingTop + this.paddingBottom;
        },
        // override parent function
        getBoxWidth: function() {
            return this.inherited(arguments) + this.paddingLeft + this.paddingRight;
        },
        getWidth: function(asContainer) {
            if (asContainer)
                return this.inherited(arguments);
            else
                return this.inherited(arguments) + this.paddingLeft + this.paddingRight + 2 * this.getBorderSize(); // 2pix border
        },
        getHeight: function() {
            return this.inherited(arguments) + this.paddingTop + this.paddingBottom + 2 * this.getBorderSize(); // 2pix border
        },
        getContentWidth: function() {
            return this.w;
        },
        setContentWidth: function(width) {
            this.w = width;
        },
        getContentHeight: function() {
            return this.h;
        },
        setContentHeight: function(height) {
            this.h = height;
        },
        getOffsetToLeftEdge: function() {
            return this.getLeft() + 2 * this.getBorderSize();
        },
        getOffsetToBottomEdge: function() {
            var line = this.parent;
            var docView = layoutEngine.rootView;
            var docHeight = docView.getHeight();
            var bottomFromEdge = docHeight - (line.getTop() + line.h + 1);
            return bottomFromEdge;
        },
        layout: function(line) {
            //layout using parent's layout
            this.inherited(arguments);
            var body = ViewTools.getTextContent(line);
            this._layoutContent(body);
        },
        getBorderSize: function() {
            return this._noBorder() ? 0 : 1;
        },
        render: function(parentChange) {

            if (!this.domNode || this.dirty) {
                delete this.dirty;

                var strMargin = this._calLeftMarginCssStyle();

                // backgound-color
                var bgColor = this.model.bgColor;

                // border size
                // writer.common.tools.toPxValue(this.model.border.width)
                var borderSize = this.getBorderSize();
                var borderColor = this.model.borderColor;

                // whole size
                var wholeW = this.w + this.paddingLeft + this.paddingRight;
                var wholeH = this.h + this.paddingTop + this.paddingBottom;

                var style = "";
                if (this.isVisibleInTrack()) {
                    // svg node
                    if (this.model.svg && this.model.svg != "") {
                        bgColor = "rgba(1,1,1,0)";
                        borderColor = "rgba(1,1,1,0)";

                        this.svgNode = domConstruct.create("div", {
                            "innerHTML": this.model.svg,
                            "style": "position:absolute;left:0px;bottom:0px;" + "width:" + wholeW + "px; height:" + wholeH + "px;"
                        });
                        this.updateSnapShotIdForSVG(this.svgNode);
                    } else {
                        if (this.model.bgColor)
                            style += ("background-color:" + this.model.bgColor) + ";";
                    }

                    style += "text-indent:0px;position:relative;display:inline-block;border:" + borderSize + "px solid;width:" + this.w + "px; height:" + this.h + "px;" + "border-color:" + borderColor + ";" + strMargin;

                    if (this.paddingTop > 0) {
                        style = style + "padding-top:" + this.paddingTop + "px;";
                    }
                    if (this.paddingRight > 0) {
                        style = style + "padding-right:" + this.paddingRight + "px;";
                    }
                    if (this.paddingLeft > 0) {
                        style = style + "padding-left:" + this.paddingLeft + "px;";
                    }
                    if (this.paddingBottom > 0) {
                        style = style + "padding-bottom:" + this.paddingBottom + "px;";
                    }
                }
                this.domNode = domConstruct.create("div", {
                    "alt": this.model.description ? this.model.description : "",
                    "class": this.className + this.getCSSStyle(),
                    "style": style + this.model.getSelfStyle()
                });

                if (this.svgNode)
                    this.domNode.appendChild(this.svgNode);
                    
                if (this.isVisibleInTrack()) {
                    var autoHide = "overflow: hidden;";
                    var tbNodeStyleStr = "position:absolute;z-index:3;" + "left:" + this.paddingLeft + "px;top:" + (this.paddingTop + this.contentVOffset) + "px;" + "width:" + this.w + "px;height:" + (this.h - this.contentVOffset) + "px;" + autoHide + "border:0px solid;";
                    if (this.model.bgColor)
                        tbNodeStyleStr += ("background-color:" + bgColor) + ";";
                    if (this.model.fontColor)
                        tbNodeStyleStr += ("color:" + this.model.fontColor) + ";";
                    this.textboxNode = domConstruct.create("div", {
                        "class": this.className,
                        "style": tbNodeStyleStr
                    }, this.domNode);

                    var param = this.container.getFirst();
                    while (param) {
                        var childNode = param.render();
                        delete param.insertedDOM;
                        this.textboxNode.appendChild(childNode);
                        param = this.container.next(param);
                    }

                    // this node used to capture mouse event.
                    
                    if (!this.model.forPreview)
                    {
                        var edge = this._resizerView ? this._resizerView._MIN_FRAME_PIXEL / 2 : 0;
                        var captureNode = domConstruct.create("div", {
                            "style": "position:absolute;z-index:2;left:-" + edge + "px;bottom:-" + edge + "px;" + "width:" + (wholeW + edge * 2) + "px; height:" + (wholeH + edge * 2) + "px;background-color:rgba(1,1,1,0)"
                        }, this.domNode);

                        this._resizerView && this._resizerView.create(this.domNode, captureNode);
                    }
                }
                else
                {
                    this.domNode.style.display = "inline-block";
                    this.domNode.style.height = "";
                }
            } else if (parentChange) {
                this._updateLeftMarginDom();
            }
            this.checkTrackClass(this.domNode);
            return this.domNode;
        },
        getContentLeft: function() {
            return this.getLeft() + this.paddingLeft + this.getBorderSize();
        },
        getContentTop: function() {
            return this.getTop() + this.paddingTop + this.contentVOffset;
        },
        getContainer: function() {
            return this.container;
        },
        getElementPath: function(x, y, lineHeight, path, options) {
            x = x - this.getLeftMargin();
            y = y - (lineHeight - this.parent.paddingBottom - this.getBoxHeight());
            var width = this.getBoxWidth();
            var height = this.getBoxHeight();
            if (browser.isMobile() && (x < 10 || x > width - 10 || y < 10 || y > height - 10)) {
                var h = lineHeight;
                var iw = this.getWidth();
                var ih = this.getHeight();
                var isInside = x > 0 && x < iw && y > 0 && y < ih;
                var fixedX = this.getWidth();
                var run = {
                    "delX": fixedX - x,
                    "delY": (h - ih) - y,
                    "index": 0,
                    "offsetX": fixedX,
                    "lineH": h,
                    "h": ih,
                    "isInside": isInside
                };
                path.push(run);
                return;
            }

            if (x <= 0 || x >= this.w + this.paddingLeft + this.paddingRight)
                return this.inherited(arguments);

            // Check occupied space first for anchored object
            x = x - this.paddingLeft;
            y = y - this.paddingTop - this.contentVOffset;
            var anchoredObj = this.bodySpace && ViewTools.getOccupiedObjectInSpace(this.bodySpace, x, y);
            if (anchoredObj) {
                path.push(anchoredObj);
                anchoredObj.getElementPath(x, y, path, options);
            } else {
                var tarPara = this.container.select(function(para) {
                    if (y <= para.h) {
                        return true;
                    } else {
                        y = y - para.h;
                        return false;
                    }
                });

                if (!tarPara) {
                    // when pos.y is over last paragraph, get the bottom of the paragraph
                    tarPara = this.container.getLast();
                    y = tarPara.h - 3; // the 3 is used to compensate y offset so that the line can be selected correctly.
                    if (y < 0) y = 0;
                }

                // Some text box has no paragraph
                if (tarPara) {
                    path.push(tarPara);
                    tarPara.getElementPath(x, y, path, options);
                }
            }
        },
        listener: function(message, param) {
            if (message == "update")
                this.update();
        }
    });

    Model.prototype.viewConstructors[constants.MODELTYPE.TXBX] = InLineTextBox;

    return InLineTextBox;
});
