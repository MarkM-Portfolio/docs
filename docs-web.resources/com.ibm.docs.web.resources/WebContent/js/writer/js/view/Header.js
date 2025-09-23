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
    "writer/view/HeaderFooter"
], function(declare, domStyle, HeaderFooter) {

    var Header = declare("writer.view.Header", HeaderFooter, {

        isHeader: true,

        getViewType: function() {
            return 'page.Header';
        },
        layout: function(init) {
            var offsetY = 0;
            this.contentTop = 0;
            //TODO: not good to use internal var
            this.top = this.page._pageMargin.header;
            var para = this.container.getFirst();
            while (para) {
                para.parent = this;
                para.left = 0;
                para.top = offsetY;
                para.layout(this);
                offsetY = offsetY + para.h;
                para = this.container.next(para);
            }

            // if offsetY is over max percent of body height, then cut it
            this.contentHeight = offsetY;
            offsetY = this._checkHeight(offsetY);
            var delH = offsetY - this.bodySpace.h;
            if (this.bodySpace.h < offsetY) {
                this.bodySpace.h = offsetY;
            }

            this._updateAnchor();

            if (init) {
                if (delH > 0)
                    this.getPage().notifyUpdate([this.getPage(), {
                        height: delH
                    }, "fromHeader"], "changePageSetup");
            }
        },
        _updateHeaderFooterHeight: function(delH) {
            if (delH == 0)
                return;

            this.contentTop = 0;

            if (this.domNode)
                domStyle.set(this.domNode, {
                    height: this.bodySpace.h + "px"
                });
            if (this.titleNode)
                domStyle.set(this.titleNode, {
                    top: this.bodySpace.h + "px"
                });
            if (this.bottomNode) {
                domStyle.set(this.bottomNode, {
                    top: this.bodySpace.h + "px"
                });
            }

            this._updateAnchor();

            this.getPage().notifyUpdate([this.getPage(), {
                height: delH
            }, "fromHeader"], "changePageSetup");
        }

    });


    return Header;
});
