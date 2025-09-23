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
    "dojo/topic",
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/dom-style",
    "dojo/on",
    "writer/controller/EditShell",
    "writer/common/tools",
    "writer/constants",
    "writer/controller/Editor",
    "writer/controller/Selection",
    "writer/msg/msgCenter",
    "writer/util/ModelTools",
    "writer/view/ImageView",
    "writer/view/selection/ResizerView"
], function(topic, declare, lang, domStyle, on, EditShell, tools, constants, Editor, Selection, msgCenter, ModelTools, ImageView, ResizerView) {

    var TextBoxResizerView = declare("writer.view.selection.TextBoxResizerView", ResizerView, {
        _MIN_FRAME_PIXEL: 4, // min px of textbox selected border

        _textboxNode: null, // node of textbox

        // event registion handle
        _textboxDownMoveConnects: null, // mouse down/move events
        _textboxUpConnects: null, // mouse up events

        _isSelecting: false,

        // constructor
        constructor: function(ownerView) {
            this._textboxDownMoveConnects = [];
            this._textboxUpConnects = [];
        },

        // resize
        _resize: function(incX, incY) {
            var sizeX = tools.toPxValue(this._ownerView.model.width);
            var sizeY = tools.toPxValue(this._ownerView.model.height);

            var newSizeX = sizeX + incX;
            var newSizeY = sizeY + incY;

            if (newSizeX <= 0) {
                newSizeX = this._MINIMIZE_SIZE;
            }

            if (newSizeY <= 0) {
                newSizeY = this._MINIMIZE_SIZE;
            }

            var oldSz = {
                "extent": {
                    "cx": this._ownerView.model.width,
                    "cy": this._ownerView.model.height
                }
            };
            if (this._ownerView.model.isAutoFit())
                oldSz.spAutoFit = {
                    "ele_pre": "a"
                };

            var newSz = {
                "extent": {
                    "cx": tools.PxToCm(newSizeX) + "cm",
                    "cy": tools.PxToCm(newSizeY) + "cm"
                }
            };

            var modelTb = this._ownerView.model;
            modelTb.setAutoFit(false);
            modelTb.width = newSz.extent.cx;
            modelTb.height = newSz.extent.cy;

            this._ownerView.iw = newSizeX;
            this._ownerView.ih = newSizeY;

            // update
            this._resizeUpdate();

            // send image
            var msg = msgCenter.createMsg(constants.MSGTYPE.Attribute, [msgCenter.createSetAttributeAct(modelTb, null, null, {
                'size': newSz
            }, {
                'size': oldSz
            })]);
            msgCenter.sendMessage([msg]);
        },

        // update after resize
        _resizeUpdate: function() {
            this._ownerView.model.markDirty();
            var paragraph = ModelTools.getParagraph(this._ownerView.model);
            paragraph.updateView();
            paragraph.parent.update();
        },

        // getViewSize
        _getViewSize: function() {
            var w = this._ownerView.w + this._ownerView.paddingLeft + this._ownerView.paddingRight;
            var h = this._ownerView.h + this._ownerView.paddingTop + this._ownerView.paddingBottom;

            return {
                "offX": 0,
                "offY": 0,
                "w": w,
                "h": h
            };
        },

        // has mouse click only box frame?
        _isValidClick: function(target, clickX, clickY) {
            if (this._textboxNode != target)
                return false;

            return true;

            var minPx = 4;

            var viewSize = this._getViewSize();

            if (clickX <= this._MIN_FRAME_PIXEL || clickX >= viewSize.w - this._MIN_FRAME_PIXEL || clickY <= this._MIN_FRAME_PIXEL || clickY >= viewSize.h - this._MIN_FRAME_PIXEL) {
                return true;
            }

            return false;
        },

        // UI event handler
        _onImgMouseDown: function(event) {
            var target = event.target || event.srcElement;

            var clickX = event.offsetX || event.layerX;
            var clickY = event.offsetY || event.layerY;

            if (this._isInCorrectEditMode() && this._isValidClick(target, clickX, clickY)) {

                this._isSelecting = true;

                this._textboxUpConnects.push(on(this._textboxNode, "mouseup", lang.hitch(this, "_onImgMouseUp")));

                event.preventDefault(), event.stopPropagation();
            }
        },

        _onImgMouseMove: function(event) {
            var target = event.target || event.srcElement;

            var clickX = event.offsetX || event.layerX;
            var clickY = event.offsetY || event.layerY;

            if (this._isValidClick(target, clickX, clickY)) {
                domStyle.set(this._textboxNode, "cursor", "move");
            } else {
                domStyle.set(this._textboxNode, "cursor", "");
            }

            if (this._isSelecting)
                event.preventDefault(), event.stopPropagation();
        },

        _onImgMouseUp: function(event) {
            // select the textbox
            if (!this._selectTextBox())
                return;

            // close context menu
            pe.lotusEditor.getShell().dismissContextMenu();

            event.preventDefault(), event.stopPropagation();

            this._isSelecting = false;

            // unregister mouse move and up on imgNode
            for (var i = 0; i < this._textboxUpConnects.length; i++) {
                this._textboxUpConnects[i].remove();
            }

            this._textboxUpConnects = [];
        },

        _selectTextBox: function(event) {
            if (!this._isInCorrectEditMode() || this._static.selectedModelID == this._ownerView.model.id)
                return false;

            // select the range
            var selection = pe.lotusEditor.getSelection();
            var start = {
                "obj": this._ownerView,
                "line": this._ownerView.parent,
                "index": 0
            };
            var end = {
                "obj": this._ownerView,
                "line": this._ownerView.parent,
                "index": 1
            };
            selection.beginSelect(start);
            selection.endSelect(end);

            return true;
        },

        // create
        create: function(parentNode, ownerNode) {
            // base method
            this.inherited(arguments);

            // unregister image mouse down event
            for (var i = 0; i < this._textboxDownMoveConnects.length; i++) {
                this._textboxDownMoveConnects[i].remove();
            }
            this._textboxDownMoveConnects = [];

            // save current node reference
            this._textboxNode = ownerNode;

            // register image node event
            this._textboxDownMoveConnects.push(on(this._textboxNode, "mousedown", lang.hitch(this, "_onImgMouseDown")));
            this._textboxDownMoveConnects.push(on(this._textboxNode, "mousemove", lang.hitch(this, "_onImgMouseMove")));
        },
    }); // end dojo.declare
    return TextBoxResizerView;
});
