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
    "writer/view/selection/CanvasResizerView"
], function(declare, CanvasResizerView) {

    var AnchorCanvasResizerView = declare("writer.view.selection.AnchorCanvasResizerView", CanvasResizerView, {
        // getViewSize
        _getViewSize: function() {
            return {
                "offX": this._ownerView.padLeft,
                "offY": this._ownerView.padBottom,
                "w": this._ownerView.iw,
                "h": this._ownerView.ih
            };
        },

        _beginResize: function() {},

        _endResize: function() {},

        // draw owner node while resizing
        _drawOwner: function(left, bottom, width, height) {
            // todo
        }
    }); // end dojo.declare
    return AnchorCanvasResizerView;
});
