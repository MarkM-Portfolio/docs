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
    "writer/util/ModelTools",
    "writer/view/selection/ImgResizerView"
], function(declare, domStyle, ModelTools, ImgResizerView) {

    var AnchorImgResizerView = declare("writer.view.selection.AnchorImgResizerView", ImgResizerView, {
        // update after resize
        _resizeUpdate: function() {
            this._ownerView.model.markDirty();
            var paragraph = ModelTools.getParagraph(this._ownerView.model);
            //paragraph.updateView();
            paragraph.parent.notifyUpdate([null, paragraph], "update");
            pe.lotusEditor.layoutEngine.rootView.update();
        },

        // getViewSize
        _getViewSize: function() {
            return {
                "offX": this._ownerView.padLeft,
                "offY": this._ownerView.padBottom,
                "w": this._ownerView.iw,
                "h": this._ownerView.ih
            };
        },

        _beginResize: function() {
            var node = this._ownerView.maskNode;
            domStyle.set(node, "overflow", "visible");
        },

        _endResize: function() {
            var node = this._ownerView.maskNode;
            domStyle.set(node, "overflow", "hidden");
        },

        // draw owner node while resizing
        _drawOwner: function(left, bottom, width, height) {
            // base method
            this.inherited(arguments);

            if (width < 0) left = left + width;
            if (height < 0) bottom = bottom + height;
            domStyle.set(this._imgNode, "left", (left - this._ownerView.padLeft - this._ownerView.getMaskLeft()) + "px");
            domStyle.set(this._imgNode, "bottom", (bottom - this._ownerView.padBottom - this._ownerView.getMaskBottom()) + "px");
        }
    }); // end dojo.declare
    return AnchorImgResizerView;
});
