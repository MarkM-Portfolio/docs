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
    "writer/view/update/BlockContainerView",
    "writer/view/update/BlockView",
    "writer/view/update/tools"
], function(declare, domStyle, BlockContainerView, BlockView, viewUpdateTools) {

    var TocViewUpdate = declare("writer.view.update.TocViewUpdate", BlockContainerView, {

        constructor: function() {},

        _notifyUpdateImpl: function(args, type) {
            if (!args instanceof Array) {
                console.error("the arg must be array");
            }
            if (type) {
                switch (type) {
                    case "update":
                        this.addChangedView(args[1]);
                        break;
                    case "insertBefore":
                    case "insertAfter":
                    case "delete":
                    case "append":
                        break;
                    default:
                        console.info("can not handle the update type: " + type);
                }
            }
            this.addChangedView(args[0]);
        },
        update: function() {
            if (!this.changedView || this.changedView.len == 0) {
                return;
            }
            delete this.changedView;
            var h = this.h;
            //update contents
            console.log("toc view updating");
            var view = this.container.getFirst();
            var realHeight = 0;
            while (view) {
                if (view.isDeleted()) {
                    var t = this.container.next(view);
                    this.container.remove(view);
                    view = t;
                    continue;
                }
                if (!view.hasLayouted()) {
                    view.layout(this);
                }

                view.left = 0;
                view.top = realHeight;
                realHeight += view.h;
                view = this.container.next(view);
            }

            this.alignItem();
            viewUpdateTools.updateDOM(this.getContainer(), this.domNode);
            var h1 = this.h;
            if (h1 != h) {
                this.parent.notifyUpdate([this]);
                domStyle.set(this.domNode, {
                    "height": this.h + "px"
                });
            }
            console.log("toc view updated");
        }
    });
    return TocViewUpdate;
});
