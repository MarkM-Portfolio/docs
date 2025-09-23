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
    "writer/view/AnchorView/AnchorTextBox"
], function(declare, Space, constants, Model, ViewTools, AnchorTextBox) {

    var TBTextBox = declare("writer.view.AnchorView.TBTextBox", AnchorTextBox, {
        className: "TBTextBox",
        layout: function(line) {
            //layout using parent's layout
            this.inherited(arguments);
            //occpy space
            var p = ViewTools.getParagraph(line);
            var body = ViewTools.getTextContent(p);
            this.ownedSpace = this.calcuSpace(line, p, body);
            body.occupy(this.ownedSpace);

        },
        calcuSpace: function(line, p, body) {
            p = p || ViewTools.getParagraph(line);
            body = body || ViewTools.getTextContent(p);
            var left = this.marginLeft + p.left;
            var right = left + this.getWholeWidth();
            if (left > 0) left = 0;
            var top = this.marginTop + p.top;
            var spaceW = body.bodySpace.w;
            if (right > spaceW) spaceW = right;
            spaceW -= left;
            var spaceH = this.ih + this.distant.top + this.distant.bottom + this.paddingTop + this.paddingBottom;
            var newSpace = new Space(spaceW, spaceH, left, top, this);
            return newSpace;
        }
    });

    Model.prototype.viewConstructors[constants.MODELTYPE.TBTXBX] = TBTextBox;
    return TBTextBox;
});
