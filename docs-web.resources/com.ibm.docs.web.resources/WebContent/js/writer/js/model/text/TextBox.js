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
    "writer/common/Container",
    "writer/constants",
    "writer/model/prop/TextProperty",
    "writer/model/text/Image",
    "writer/model/update/BlockContainer",
    "writer/model/update/Block_Container",
    "writer/util/ModelTools",
    "writer/track/trackChange"
], function(declare, lang, Container, constants, TextProperty, Image, BlockContainer, Block_Container, ModelTools, trackChange) {

    var TextBox = declare("writer.model.text.TextBox", [Image, BlockContainer, Block_Container], {
        modelType: constants.MODELTYPE.TXBX,
        WRAP: {
            //before text or after text
            wrapNone: constants.MODELTYPE.FLTXBX,
            wrapSquare: constants.MODELTYPE.SQTXBX,
            wrapTopAndBottom: constants.MODELTYPE.TBTXBX
        },
        bodyPr: null,
        delayUpdate: true,
        isWaterMarker: false,
        constructor: function(json, owner, simpleStruct) {
            //use parent's constructor to init anchor, position...
            var txbx;
            // Should not apply text property on text box
            this.textProperty = new TextProperty(null);

            if (simpleStruct) {
                this.simpleStruct = simpleStruct;
                this.modelType = constants.MODELTYPE.SIMPLETXBX;
                this.description = json && json.cNvPr && json.cNvPr.descr;
                txbx = json;
            } else {
                txbx = json.anchor && json.anchor.graphicData && json.anchor.graphicData.txbx;
                if (!txbx) {
                    txbx = json.inline && json.inline.graphicData && json.inline.graphicData.txbx;
                }
            }

            this.justwords = txbx.justwords;
            this.bodyPr = txbx && txbx.bodyPr;
            if (this.bodyPr) {
                if (!isNaN(this.bodyPr.lIns)) this.bodyPr.lIns = this.bodyPr.lIns + "emu";
                if (!isNaN(this.bodyPr.rIns)) this.bodyPr.rIns = this.bodyPr.rIns + "emu";
                if (!isNaN(this.bodyPr.tIns)) this.bodyPr.tIns = this.bodyPr.tIns + "emu";
                if (!isNaN(this.bodyPr.bIns)) this.bodyPr.bIns = this.bodyPr.bIns + "emu";
            }

            this.svg = txbx && txbx.svg_data;
            this.spProperty = txbx && txbx.spPr;
            this.isWaterMarker = json.anchor && json.anchor.docPr && json.anchor.docPr.isWMO == "1";
            this.isWaterMarker = this.isWaterMarker || (json.inline && json.inline.docPr && json.inline.docPr.isWMO == "1");

            if (this.spProperty) {
                if (this.spProperty.solidFill)
                    this._initBgSolidFillColor(this.spProperty.solidFill);
                else if (this.spProperty.noFill)
                    this._initBgNoFillColor();
            }

            this.grpFill = this.spProperty && this.spProperty.grpFill;

            // border
            this.importBorder(this.spProperty);

            if (this.spProperty) {
                var xfrm = this.spProperty && this.spProperty.xfrm;

                // position
                this.offX = xfrm && xfrm.off && xfrm.off.x || "0emu";
                this.offY = xfrm && xfrm.off && xfrm.off.y || "0emu";
                this.offX_off = xfrm && xfrm.off && xfrm.off.x_off || "0emu";
                this.offY_off = xfrm && xfrm.off && xfrm.off.y_off || "0emu";

                // size
                this.extX = xfrm && xfrm.ext && xfrm.ext.cx || "0emu";
                this.extY = xfrm && xfrm.ext && xfrm.ext.cy || "0emu";
                this.extX_off = xfrm && xfrm.ext && xfrm.ext.cx_off || "0emu";
                this.extY_off = xfrm && xfrm.ext && xfrm.ext.cy_off || "0emu";

                this.rot = xfrm && xfrm.rot ? parseFloat(xfrm.rot) : 0;
            }

            if (txbx && txbx.style)
                this._styleFromeJson(txbx.style);

            this.bgColor = this._getBgColor();

            this.txContent = txbx && txbx.txbxContent;
            this.initContent(this.txContent);
            if (this.canbePenetrate()) {
                this.behindDoc = "1";
                //this.relativeHeight = "1";
            }
        },

        // if a textbox has noFill background and has no text content in it, it can be penetrated.
        canbePenetrate: function() {
            return this.noFill && this.isContentEmpty();
        },

        _styleFromeJson: function(json) {
            this.style = lang.clone(json);

            // text color
            if (json.fontRef && json.fontRef.schemeClr && json.fontRef.schemeClr.val) {
                var rel = pe.lotusEditor.relations;
                this.fontColor = rel && rel.getSchemeColor(json.fontRef.schemeClr.val);
            }

            if (json.fillRef)
                this._initRefSolidFill(json.fillRef);

            return null;
        },

        _styleToJson: function() {
            if (this.style) {
                return this.style;
            }
        },

        _contentToJson: function() {
            var txtContent = [];

            var addToTxtContent = function(para, index) {
                var paraJson = para.toJson(null, null, true);
                txtContent.push(paraJson);
            };

            this.container.forEach(addToTxtContent);

            return txtContent.length > 0 ? txtContent : null;
        },

        isHorz: function() {
            if (this.bodyPr) {
                return !this.bodyPr.vert || "horz" == this.bodyPr.vert;
            }

            return false;
        },

        isJustWords: function() {
            return "1" == this.justwords;
        },

        toJson: function(index, length) {
            var jsonData = this.json ? lang.clone(this.json) : this.json;

            if (this.simpleStruct) {
                jsonData.id = this.id;
                jsonData.svg_data = this.svg;
                jsonData.txbxContent = this._contentToJson();
                if (null == jsonData.txbxContent) delete jsonData.txbxContent;
                jsonData.style = this._styleToJson();
                jsonData.spPr = lang.clone(this.spProperty);
                jsonData.bodyPr = lang.clone(this.bodyPr);
                jsonData.t = this.t;

                if (this.description) {
                    jsonData.cNvPr = jsonData.cNvPr ? jsonData.cNvPr : {};
                    jsonData.cNvPr.descr = this.description;
                }
            } else {
                // base method
                jsonData = this.inherited(arguments);

                // set type
                jsonData.rt = constants.RUNMODEL.TXBX;

                var graphic = jsonData.anchor && jsonData.anchor.graphicData && jsonData.anchor.graphicData;
                if (!graphic) {
                    graphic = jsonData.inline && jsonData.inline.graphicData && jsonData.inline.graphicData;
                }

                if (graphic) {
                    graphic.txbx = graphic.txbx ? graphic.txbx : {};
                    graphic.txbx.svg_data = this.svg;
                    graphic.txbx.txbxContent = this._contentToJson();
                    if (null == graphic.txbx.txbxContent) delete graphic.txbx.txbxContent;
                    graphic.txbx.style = this._styleToJson();
                    graphic.txbx.spPr = lang.clone(this.spProperty);
                    graphic.txbx.bodyPr = lang.clone(this.bodyPr);

                    delete graphic.pic;
                }
            }
            
            if (this.ch && this.ch.length)
                jsonData["ch"] = lang.clone(this.ch);
            
            if (this.rParagraph && this.rParagraph.ch && this.rParagraph != this.paragraph) {
                // run in block group, should append ch from real paragraph
                jsonData["ch"] = jsonData["ch"] ? jsonData["ch"].concat(this.rParagraph.ch) : lang.clone(this.rParagraph.ch);
            }

            return jsonData;
        },

        _getBgColor: function() {
            if (this.grpFill) {
                if (this.parent && ModelTools.isCanvas(this.parent)) {
                    return this.parent._getBgColor();
                }
            }

            return this.inherited(arguments);
        },

        setSize: function(newSz, autoFit, autoWrap) {
            this.setAutoFit(autoFit);
            this.setAutoWrap(autoWrap);
            this.width = newSz.cx;
            this.height = newSz.cy;

            // update
            this.updateAll();
        },

        setAutoWrap: function(autoWrap) {
            if (this.bodyPr) {
                if (autoWrap)
                    this.bodyPr.wrap = "square";
                else
                    this.bodyPr.wrap = "none";
            }
        },

        isAutoWrap: function() {
            return this.simpleStruct || !(this.bodyPr && this.bodyPr.wrap == "none");
        },

        setAutoFit: function(autofit) {
            if (this.bodyPr) {
                if (autofit)
                    this.bodyPr.spAutoFit = {
                        "ele_pre": "a"
                    };
                else
                    delete this.bodyPr.spAutoFit;
            }
        },

        isAutoFit: function() {
            return !this.simpleStruct && !!(this.bodyPr && this.bodyPr.spAutoFit);
        },

        addChangedModel: function(model) {
            this.markDirty();
            this.changedModel = this.changedModel || new Container(this);
            if (this.changedModel.contains(model)) {
                return;
            }
            this.changedModel.append(model);
        },

        mark: function(tag) {
            this[tag] = true;
            //this.parent.markDirty();	// TODO Check anchored to page object.
        },
        markDirty: function() {
            this.clearCache();
            this.mark("dirty");
        },

        markReset: function() {
            this.reset();
            this.mark("reseted");
        },
        /**
         * Remove the property from the index with length
         * @param index
         * @param len
         */
        removeTextLength: function(index, len, container) {
            var inTrack = trackChange.isOn() && ModelTools.isTrackable(this);
            if (this.start >= index) {
                var delta = index + len - this.start;
                if (delta > 0) {
                    if (!inTrack) {
                        container.remove(this);
                        this.notifyRemoveFromModel();
                        if (this.modelType != constants.MODELTYPE.TXBX)
                            this.paragraph.AnchorObjCount -= 1;
                    } else {
                        return this.markDeleteChange();
                    }
                } else {
                    if (!inTrack) {
                        this.start -= len;
                        this.markDirty();
                    }
                }
            }
        },
        getCSSStyle: function() {
            var style = pe.lotusEditor.getRefStyle(constants.STYLE.DEFAULT);

            var str = " ";
            if (style && style.refId) {
                str += style.refId;
            }

            return str;
        },

        getSelfStyle: function() {
            var style = "";

            // text box should not inherit parent style, it should use the document default style.
            var mergedProp = this.getMergedTextProperty();
            if (!mergedProp.style || !mergedProp.style["font-weight"])
                style += "font-weight:normal;";
            if (!mergedProp.style || !mergedProp.style["font-weight"])
                style += "color:#000000;";

            return style;
        },

        getMergedTextProperty: function() {
            if (!this.mergedTextProperty) {
                var editor = pe.lotusEditor;
                var docDefaultStyle = editor.getRefStyle(constants.STYLE.DEFAULT);
                var textDefaultStyle = editor.getDefaultTextStyle();

                var docDefaultTextProp = docDefaultStyle && docDefaultStyle != "empty" && docDefaultStyle.getMergedTextProperty();
                var textDefaultTextProp = textDefaultStyle && textDefaultStyle != "empty" && textDefaultStyle.getMergedTextProperty();

                var that = this;
                var mergeTextProp = function(srcTextProp, destTextProp) {
                    if (srcTextProp && srcTextProp != "empty") {
                        if (destTextProp && destTextProp != "empty")
                            return srcTextProp.merge(destTextProp, true);
                        else
                            return srcTextProp;
                    } else if (destTextProp && destTextProp != "empty")
                        return destTextProp;
                    return null;
                };

                this.mergedTextProperty = mergeTextProp(docDefaultTextProp, textDefaultTextProp);
                //this.inherited(arguments);
            }
            return this.mergedTextProperty;
        }
    });

    return TextBox;
});
