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
    "writer/common/Space",
    "writer/constants",
    "writer/model/Model",
    "writer/util/ViewTools",
    "writer/view/AnchorView/AnchorCanvas"
], function(declare, Space, constants, Model, ViewTools, AnchorCanvas) {

    var FLCanvas = declare("writer.view.AnchorView.FLCanvas", AnchorCanvas, {
        className: "FLCanvas",
        calcuSpace: function(line, p, body) {
            p = p || ViewTools.getParagraph(line);
            body = body || ViewTools.getTextContent(p);
            var top = this.marginTop + p.top;
            var left = this.marginLeft + p.left;
            var newSpace = new Space(this.iw + this.padLeft + this.padRight, this.ih + this.padTop + this.padBottom, left, top, this);
            return newSpace;
        },
        isContainedByBodyV: function(body) {
            return true;
        }
    });

    Model.prototype.viewConstructors[constants.MODELTYPE.FLCANVAS] = FLCanvas;

    return FLCanvas;
});
