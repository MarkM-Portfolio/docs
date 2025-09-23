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
    "writer/common/Container"
], function(Container) {

    var BlockContainerView = function() {

    };
    BlockContainerView.prototype = {
        isBlockContainer: true,
        // the changed view in the changeView needs to be sorted
        addChangedView: function(view) {
            this.changedView = this.changedView || new Container(this);
            if (this.changedView.contains(view)) {
                return;
            }
            this.changedView.append(view);
        },
        notifyUpdate: function(args, type) {
            if (!args instanceof Array) {
                console.error("the arg must be array");
            }
            if (type) {
                switch (type) {
                    case "insertBefore":
                        this.insertBefore(args[0], args[1]);
                        break;
                    case "insertAfter":
                        this.insertAfter(args[0], args[1]);
                        break;
                    case "delete":
                        this.deleteView(args[0]);
                        break;
                    case "append":
                        this.appendView(args[0]);
                        break;
                    default:
                        console.info("can not handle the update type: " + type);
                }
            }
            this._notifyUpdateImpl(args, type);
        },
        /**
         * you can implement this function when there is something will be updated.
         */
        _notifyUpdateImpl: function(args, type) {
            this.addChangedView(args[0]);
        },
        update: function() {
            console.error("sorry, this function must be implemented");
        },
        insertBefore: function(view, tar) {
            this.getContainer().insertBefore(view, tar);
            view.parent = this;
        },
        insertAfter: function(view, tar) {
            this.getContainer().insertAfter(view, tar);
            view.parent = this;
        },
        deleteView: function(view) {
            view.markDelete();
        },
        appendView: function(view) {
            //		if(this.getContainer().length()!=0){
            //			console.info("when this function called, the container have to be empty!");
            //		}
            this.getContainer().append(view);
            view.parent = this;
        }
    };
    return BlockContainerView;
});
