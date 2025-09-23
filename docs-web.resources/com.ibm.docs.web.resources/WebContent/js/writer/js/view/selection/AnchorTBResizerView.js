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
    "writer/view/selection/TextBoxResizerView"
], function(declare, TextBoxResizerView) {

    var AnchorTBResizerView = declare("writer.view.selection.AnchorTBResizerView", TextBoxResizerView, {
        // getViewSize
        _getViewSize: function() {
            var w = this._ownerView.iw + this._ownerView.paddingLeft + this._ownerView.paddingRight;
            var h = this._ownerView.ih + this._ownerView.paddingTop + this._ownerView.paddingBottom;

            return {
                "offX": 0,
                "offY": 0,
                "w": w,
                "h": h
            };
        }
    }); // end dojo.declare
    return AnchorTBResizerView;
});
