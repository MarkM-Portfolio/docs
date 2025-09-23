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

    var SQTextBox = declare("writer.view.AnchorView.SQTextBox", AnchorTextBox, {
        className: "SQTextBox",
        layout: function(line) {
            //layout using parent's layout
            this.inherited(arguments);
            //occpy space
            var p = ViewTools.getParagraph(line);
            var body = ViewTools.getTextContent(p);
            //update this line 
            var nextSpace = body.bodySpace.getNextSpaceY(body.offsetY);
            line.marginTop = nextSpace.y - body.offsetY;

            var newSpace = this.calcuSpace(line, p, body);
            if (this.ownedSpace && !this.ownedSpace.equals(newSpace)) {
                body.releaseSpace(this.ownedSpace);
                this.ownedSpace = newSpace;
                body.occupy(this.ownedSpace);
            }
        },
        calcuSpace: function(line, p, body) {
            p = p || ViewTools.getParagraph(line);
            //		body = body||writer.util.ViewTools.getTextContent(p);
            var top = this.marginTop + p.top;
            var left = this.marginLeft + p.left;

            var marginLeft = this.marginLeft - this.distant.left - this.paddingLeft;
            var marginRight = body.getWidth() - this.marginLeft - this.iw - this.distant.right - this.paddingRight;

            var spaceW = this.iw + this.distant.left + this.distant.right + this.paddingLeft + this.paddingRight;
            var spaceH = this.ih + this.distant.top + this.distant.bottom + this.paddingTop + this.paddingBottom;
            var spaceLeft = left - this.distant.left;
            var spaceTop = top - this.distant.top;

            if (this.model.wrapSquare && this.model.wrapSquare.wrapText) {
                switch (this.model.wrapSquare.wrapText) {
                    case "left":
                        spaceW = spaceW + marginRight;
                        break;
                    case "right":
                        spaceLeft = p.left;
                        spaceW = spaceW + marginLeft;
                        break;
                    case "largest":
                        if (marginLeft >= marginRight) {
                            spaceW = spaceW + marginRight;
                        } else {
                            spaceLeft = p.left;
                            spaceW = spaceW + marginLeft;
                        }
                        break;
                }
            }

            var bodyWidth = body.getWidth();
            if (spaceLeft > 0 && spaceLeft < this._MIN_SPACE_MARGIN) {
                spaceLeft = 0;
                spaceW = spaceW + (this._MIN_SPACE_MARGIN - spaceLeft);
            }
            if (bodyWidth > spaceLeft + spaceW && bodyWidth - (spaceLeft + spaceW) < this._MIN_SPACE_MARGIN) {
                spaceW = bodyWidth - spaceLeft;
            }

            var newSpace = new Space(spaceW, spaceH, spaceLeft, spaceTop, this);
            return newSpace;
        }
    });

    Model.prototype.viewConstructors[constants.MODELTYPE.SQTXBX] = SQTextBox;

    return SQTextBox;
});
