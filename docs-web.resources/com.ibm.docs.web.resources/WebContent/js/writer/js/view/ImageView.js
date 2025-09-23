/* ***************************************************************** */
/*                                                                   */
/* HCL Confidential                                                  */
/*                                                                   */
/* OCO Source Materials                                              */
/*                                                                   */
/* Copyright HCL Technologies Limited 2010, 2022                     */
/*                                                                   */
/* The source code for this program is not published or otherwise    */
/* divested of its trade secrets, irrespective of what has been      */
/* deposited with the U.S. Copyright Office.                         */
/*                                                                   */
/* ***************************************************************** */

define([
    "dojo/_base/array",
    "dojo/_base/declare",
    "dojo/dom",
    "dojo/dom-construct",
    "dojo/has",
    "dojo/_base/lang",
    "dojo/query",
    "dojo/topic",
    "writer/model/Model",
    "writer/common/tools",
    "writer/util/ViewTools",
    "writer/common/MeasureText",
    "writer/util/ModelTools",
    "writer/msg/msgCenter",
    "concord/util/browser",
    "writer/constants",
    "writer/view/Run",
    "writer/view/selection/ImgResizerView",
    "writer/model/text/ImageBorderType",
    "dojo/i18n!writer/nls/lang"
], function(array, declare, dom, domConstruct, has, lang, query, topic, Model, tools, ViewTools, MeasureText, ModelTools, msgCenter, browser, constants, Run, ImgResizerView, ImageBorderType, i18nlang) {

    var ImageView = declare("writer.view.ImageView", Run, {
        doNotCalLineSpaceHeight: true, // for only line calculate height ratio.
        _resizerView: null, // resizer view of this image view

        _MINIMIZE_SIZE: 4,

        constructor: function(model, ownerId, start, len) {
            this.init(start, len);

            this.marginLeft = 0;
            this.marginTop = 0;
            this.marginRight = 0;
            this.marginBottom = 0;

            this.padTop = 0;
            this.padBottom = 0;
            this.padLeft = 0;
            this.padRight = 0;

            this.borderWidth = 0;

            this.zIndex = 10;

            if (this.model.isBulletPic) return;

            // create resizer view
            this._createResizer();
        },

        _createResizer: function() {
        	this._createResizerNode();
            this._resizerView = new ImgResizerView(this);
            topic.subscribe(constants.EVENT.PAGELEFTCHANGED, lang.hitch(this, this._onPageShift));            
            
        },

        _onPageShift: function() {
        	this._resizerView._onPageShift();
        },

        _createResizerNode: function() {
        	if(!this._imgResizerNode) {
            	var _imgResizerDiv = dom.byId("_ImgResizeDiv", pe.lotusEditor.getEditorDoc());
            	if(!_imgResizerDiv) {
                	_imgResizerDiv = domConstruct.create('div', {
                		"id":"_ImgResizeDiv",
                		"style":"position:absolute;left:0px;z-index:auto;",
                		"needReloc":"1"
                	}, pe.lotusEditor.getEditorDIV());
            	}

            	this._imgResizerNode = _imgResizerDiv;
        	}

//         create own resizer per image
//        	this._imgResizerNode = dom.byId("refImg_" + this.model.id, pe.lotusEditor.getEditorDoc());
//            if(!this._imgResizerNode){
//            	this._imgResizerNode = domConstruct.create('div', {
//            		"id":"refImg_" + this.model.id,
//            		"style":"position:absolute;left:0px;z-index:auto;",
//            		"needReloc":"1"
//            	}, _imgResizerDiv);
//             }
        },
        // Select the image
        select: function() {
            if (this.model.isBulletPic) return;
            if (this.model.isWaterMarker) return;
            if (!this._resizerView) return;
            var sel = this._resizerView.select();
            if (has("ff")) {
                var viewTolls = ViewTools;
                var nls = i18nlang;
                if (viewTolls.getCurrSelectedImage()) {
                    var text = nls.acc_imageSelected;
                    if (this.model.description) {
                        text += " ";
                        text += this.model.description;
                    }
                    pe.lotusEditor.getShell()._editWindow.announce(text);
                } else if (viewTolls.getCurrSelectedTextbox()) {
                    var text = nls.acc_textboxSelected;
                    if (this.model.description) {
                        text += " ";
                        text += this.model.description;
                    }
                    pe.lotusEditor.getShell()._editWindow.announce(text);
                } else {
                    var text = nls.acc_canvasSelected;
                    if (this.model.description) {
                        text += " ";
                        text += this.model.description;
                    }
                    pe.lotusEditor.getShell()._editWindow.announce(text);
                }
            }
            return sel;
        },

        onSelect: function() {
            browser.isMobile() && concord.util.mobileUtil.image.show(this);
        },

        onUnSelect: function() {
            browser.isMobile() && concord.util.mobileUtil.image.show();
        },

        // resize
        resize: function(incX, incY) {
            var sizeX = tools.toPxValue(this.model.width);
            var sizeY = tools.toPxValue(this.model.height);

            var newSizeX = sizeX + incX;
            var newSizeY = sizeY + incY;

            if (ViewTools.isCanvas(this) && !this.model.isGroup && !this.model.isSmartArt) {
                // for canvas(not group and not smartart), do not let it resize.
                newSizeX = sizeX;
                newSizeY = sizeY;
            }

            if (this.model.isSmartArt) {
                newSizeX = sizeX;
                newSizeY = sizeY;
            }

            if (newSizeX <= 0) {
                newSizeX = this._MINIMIZE_SIZE;
            }

            if (newSizeY <= 0) {
                newSizeY = this._MINIMIZE_SIZE;
            }

            var oldSz = {
                "cx": this.model.width,
                "cy": this.model.height
            };

            var newSz = {
                "cx": tools.PxToCm(newSizeX) + "cm",
                "cy": tools.PxToCm(newSizeY) + "cm"
            };

            // set size
            this.model.setSize(newSz);

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
            this.model.markDirty();
            var paragraph = ModelTools.getParagraph(this.model);
            if (paragraph) {
                paragraph.markReset();
                paragraph.parent.update();
            }
            pe.lotusEditor.layoutEngine.rootView.update();
        },

        // aspect locked?
        isAspectLocked: function() {
            return this.model.noChangeAspect && this.model.noChangeAspect == "1";
        },

        // get position relative to paragraph
        getOffsetToPara: function() {
            var line = this.parent;
            var para = line.parent;

            var lineLeft = line.getLeft();
            var paraLeft = para.getLeft();
            var imgLeft = this.getLeft();

            var lineTop = line.getTop();
            var paraTop = para.getTop();
            var imgTop = lineTop + (line.h - this.h);

            return {
                "x": imgLeft - paraLeft,
                "y": imgTop - paraTop
            };
        },
        getOffsetToLeftEdge: function() {
            return this.getLeft();
        },
        getOffsetToBottomEdge: function() {
            var line = this.parent;
            var docView = layoutEngine.rootView;
            var docHeight = docView.getHeight();
            var bottomFromEdge = docHeight - (line.getTop() + line.h);
            return bottomFromEdge;
        },
        getViewType: function() {
            return "text.ImageView";
        },
        //can be put on next line
        getLastBreakPoint: function() {
            return 0;
        },
        _getFitRunHeight: function() {
            var fitRun = this.previous(true);
            while (fitRun) {
                if (fitRun.getViewType() == "text.Run" && fitRun.len > 0)
                    return fitRun.getHeight();
                else
                    fitRun = fitRun.previous(true);
            }

            fitRun = this.next(true);
            while (fitRun) {
                if (fitRun.getViewType() == "text.Run" && fitRun.len > 0)
                    return fitRun.getHeight();
                else
                    fitRun = fitRun.next(true);
            }

            // Can't find suitable run will create get the default run's height
            return MeasureText.measureTextRun("Q", this.getComputedStyle()).h;
        },

        _getFitRunTop: function() {
            var fitRun = this.previous(false);
            while (fitRun) {
                if (fitRun.getViewType() == "text.Run" && fitRun.len > 0)
                    return fitRun.getTop();
                else
                    fitRun = fitRun.previous(false);
            }

            fitRun = this.next(false);
            while (fitRun) {
                if (fitRun.getViewType() == "text.Run" && fitRun.len > 0)
                    return fitRun.getTop();
                else
                    fitRun = fitRun.next(false);
            }

            return null;
        },
        _noBorder: function() {
            return !this.model.border || this.model.border.type == ImageBorderType.NONE;
        },
        getChildPosition: function(idx, placeholderArg, bNeedLogicalPos) {
            // The cursor height should follow previous run's height
            var line = ViewTools.getLine(this);
            if (line && !line.bidiMap)
                line.initBidiMap();

            var x = (!bNeedLogicalPos && line && line.isBidiLine()) ?
                this._logicalIndexToOffset(idx, line) : this.getLeft() + (idx == 0 ? 0 : this.getWidth());

            var height = this._getFitRunHeight();
            var isItalic = this.getComputedStyle()["font-style"] == "italic";
            var top = this._getFitRunTop() || (this.getTop() + this.getHeight() - height);

            return {
                'x': x,
                'y': top,
                'h': height,
                "italic": isItalic
            };
        },
        // Override parent function
        getBoxHeight: function() {
            return this.getContentHeight() + this.marginTop + this.marginBottom + this.padTop + this.padBottom;
        },
        // override parent function
        getBoxWidth: function() {
            return this.w + this.padLeft + this.padRight + this.getLeftMargin();
        },
        getWidth: function() {
            return this.w + this.padLeft + this.padRight;
        },
        getHeight: function() {
            return this.h + this.padTop + this.padBottom;
        },
        getMobileImageInfo: function() {
            var docLeft = pe.lotusEditor.layoutEngine.rootView.docLeft;
            var docTop = pe.lotusEditor.padding;
            var imageInfo = {};
            imageInfo.left = docLeft + this.padLeft + this.getLeft();
            imageInfo.top = docTop + this.padTop + this.getTop();
            var viewSize = this._resizerView._getViewSize();
            imageInfo.width = viewSize.w;
            imageInfo.height = viewSize.h;

            return imageInfo;
        },
        getResizerRect: function() {
        	var rect = {};
        	rect.t = this.getTop() + pe.lotusEditor._shell.baseTop;
        	rect.l = this.getOffsetToLeftEdge() + pe.lotusEditor._shell.baseLeft;
        	rect.w = this.getBoxWidth();
        	rect.h = this.getBoxHeight();
        	return rect;
        },
        //	relayout:function(line){
        //		// Override run relayout function
        //	},
        layout: function(line) {
            this._isVisibleInTrack = this.model.isVisibleInTrack();
            delete this._relayout;
            if (this._layouted) {
                return;
            }
            if (!this.isVisibleInTrack()) {
                this.w = this.h = 0;
                return;
            }

            var getPxValue = tools.toPxValue;
            var distant = this.model.distant || {};
            this.marginLeft = getPxValue(distant.left);
            this.marginTop = getPxValue(distant.top);
            this.marginRight = getPxValue(distant.right);
            this.marginBottom = getPxValue(distant.bottom);

            this.borderWidth = this.model.border ? getPxValue(this.model.border.width) : 0;

            this.w = getPxValue(this.model.width) + getPxValue(this.model.extX_off);
            this.h = getPxValue(this.model.height) + getPxValue(this.model.extY_off);
        },
        /**
         * Calculate the image size by the new height for picture list.
         * @param newHeight
         */
        calcSize: function(newHeight) {
            var scale = this.w / (this.h || 1);
            newHeight /= 2.0;
            this.w = newHeight * scale;
            this.h = newHeight;
        },
        canSplit: function() {
            return false;
        },
        canFit: function(w, h, isLinehead) {
            return isLinehead || this.w <= w; // || this.h > h);
        },
        getText: function() {
            return "";
        },
        isWordBreak: function(text, index) {
            return true;
        },
        updateFixHight: function(fixH, isShow) {
        	if(!this.domNode) return;
        	
        	if(!fixH)
        		fixH = this.parent && this.parent.fixHeight;

        	if(!fixH) return;

        	this.domNode.style.height = fixH + "px";
        	this.setOverflowSect(isShow, 'y');
        },
        setOverflowSect: function(show, side) {        	
        	var val = (show? 'visible' : 'hidden');

        	if(side == 'x')
        		this.domNode.style['overflow-x'] = val;
        	else if (side == 'y')
        		this.domNode.style['overflow-y'] = val;
        	else
        		this.domNode.style['overflow'] = val;
        },
        render: function(parentChange) {
            if (!this.domNode || this.dirty) {
                delete this.dirty;

                var strMargin = this._calLeftMarginCssStyle();

                var srcPath = this.model.url;
                if (pe.scene.isHTMLViewMode()) {
                    var prefix = DOC_SCENE.version ? DOC_SCENE.version + '/' : "";
                    srcPath = prefix + srcPath + '?sid=' + DOC_SCENE.snapshotId;
                }

                if (this.model.isBulletPic) {
                    // Defect 38490
                    this.domNode = domConstruct.create("img", {
                        "src": srcPath,
                        "alt": this.model.description ? this.model.description : "",
                        "class": this.getCSSStyle(),
                        "style": "z-index:0;width:" + this.w + "px;height:" + this.h + "px;display:inline-block;"
                    });
                } else {
                    this.domNode = domConstruct.create("div", {
                        "class": "image",
                        "style": "display:inline-block;position:relative;width:" + (this.w + this.padLeft + this.padRight) + "px;height:" + (this.h + this.padTop + this.padBottom) + "px;" + strMargin
                    });
                    if (this.isVisibleInTrack()) {
                        var borderStyle = this._noBorder() ? "" : "border:" + "solid " + this.borderWidth + "px;" + "border-color:" + this.model.borderColor;
                        var imgRelWidth = (borderStyle && this.borderWidth && this.borderWidth > 0)? this.w - 2 * this.borderWidth : this.w;

                        var imgNode = domConstruct.create("img", {
                            "src": srcPath,
                            "alt": this.model.description ? this.model.description : "",
                            "class": this.getCSSStyle(),
                            "style": "position:absolute;left:0px;bottom:0px;z-index:0;width:" + imgRelWidth + "px;height:" + this.h + "px;" + borderStyle
                        }, this.domNode);

                        this.handleLinkField();

                        this._resizerView && this._resizerView.create(this._imgResizerNode, imgNode);
                        pe.lotusEditor.relations.commentService.handleCommentByView(this);
                    }
                    else
                    {
                        // this.domNode.style.position = "absolute";
                        this.domNode.style.display = "inline-block";
                        this.domNode.style.height = "";
                    }
                }
            } else {
                this._updateLeftMarginDom();
            }
            this.checkTrackClass(this.domNode);

            return this.domNode;
        },
        // for resizeView to use, generate real domNode to hold indicator nodes.
        getResizeViewParentDomNode: function() {
            return this._imgResizerNode || this.domNode;
        },
        getElementPath: function(x, y, h, path, options) {
            y = y - (h - this.getBoxHeight());

            if (x > this._leftMargin) {
                x -= this._leftMargin;
            } else {
                if (x < this._leftMargin / 2) {
                    var prev = this.previous();
                    if (prev) {
                        x = prev.getBoxWidth() + 1;
                        path.pop();
                        path.push(prev);
                        prev.getElementPath(x, y, h, path, options);
                        return;
                    }
                } else {
                    x = 0;
                }
            }

            var index = this.len;

            if (x < this.getWidth()) {
                index = 0;
            }

            var iw = this.getWidth();
            var ih = this.getHeight();
            var isInside = x > 0 && x < iw && y > 0 && y < ih;

            var fixedX = this.getWidth();
            var run = {
                "delX": fixedX - x,
                "delY": (h - ih) - y,
                "index": index,
                "offsetX": fixedX,
                "lineH": h,
                "h": ih,
                "isInside": isInside
            };
            path.push(run);
        },
        markDelete: function() {
            this._delete = true;

            // release body space
            this.releaseBodySpace && this.releaseBodySpace();

            // remove resizer
            this._resizerView && this._resizerView.unSelect();

        },
        listener: function(message, param) {
            if (message == "releaseBodySpace")
                this.releaseBodySpace && this.releaseBodySpace();
        },
        updateSnapShotIdForSVG: function(svgNode) {
            if (pe.scene.isHTMLViewMode()) {
                array.forEach(query("image", svgNode), function(img) {
                    var link = img.getAttributeNS('http://www.w3.org/1999/xlink', 'href')
                    if (link) {
                        var prefix = DOC_SCENE.version ? DOC_SCENE.version + '/' : "";
                        link = prefix + link + '?sid=' + DOC_SCENE.snapshotId;
                        img.setAttributeNS('http://www.w3.org/1999/xlink', 'href', link);
                    }
                });
            }
        }
    });
    
    Model.prototype.viewConstructors[constants.MODELTYPE.IMAGE] = ImageView;

    return ImageView;
});
