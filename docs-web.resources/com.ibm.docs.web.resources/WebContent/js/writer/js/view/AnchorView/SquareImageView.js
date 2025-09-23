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
    "writer/msg/msgCenter",
    "writer/util/ViewTools",
    "writer/view/AnchorView/AnchorImageView"
], function(declare, Space, constants, Model, msgCenter, ViewTools, AnchorImageView) {

    var SquareImageView = declare("writer.view.AnchorView.SquareImageView", AnchorImageView, {
        className: "SquareImage",
        layout: function(line) {
            this.inherited(arguments);
            var p = ViewTools.getParagraph(line);
            var body = ViewTools.getTextContent(p);
            //update this line 
            var nextSpace = body.bodySpace.getNextSpaceY(body.offsetY);
            line.marginTop = nextSpace.y - body.offsetY;
            //this.ownedSpace = this.calcuSpace(line, p, body);
            // The parent has occupied space already.
            //		if (this.ifCanOccupy(body))
            //			body.occupy(this.ownedSpace);
        },
        calcuSpace: function(line, p, body) {
            p = p || ViewTools.getParagraph(line);
            body = body || ViewTools.getTextContent(p);
            var top = this.marginTop + p.top;
            var left = this.marginLeft + p.left;
            var marginLeft = this.marginLeft - this.distant.left - this.padLeft;
            var marginRight = body.getWidth() - this.marginLeft - this.iw - this.distant.right - this.padRight;

            var spaceW = this.iw + this.distant.left + this.distant.right + this.padLeft + this.padRight;
            var spaceH = this.ih + this.distant.top + this.distant.bottom + this.padTop + this.padBottom;
            var spaceLeft = left - this.distant.left - this.padLeft;
            var spaceTop = top - this.distant.top - this.padTop;

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
        },

        modifyWrapText: function(wrapText) {
            // generate value
            var oldWrapText = this.model.wrapSquare.wrapText;
            var newWrapText = wrapText;

            // set wrapText
            this.model.setWrapText(wrapText);

            // send message
            var msg = msgCenter.createMsg(constants.MSGTYPE.Attribute, [msgCenter.createSetAttributeAct(this.model, null, null, {
                'wrapText': newWrapText
            }, {
                'wrapText': oldWrapText
            })]);
            msgCenter.sendMessage([msg]);
        }
    });

    Model.prototype.viewConstructors[constants.MODELTYPE.SQIMAGE] = SquareImageView;
    return SquareImageView;
});
