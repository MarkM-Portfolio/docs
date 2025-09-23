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
define(["writer/common/tools"], function(tools) {

    var Block = function() {};
    Block.prototype = {
        _insertViewAfter: function() {
            var container = this.parent.container;
            var target = container.prev(this);
            if (target && target.getSectId && target.getSectId()) {
                // the paragraph is the last paragraph;
                return false;
            }
            var allViewrs = target && target.getAllViews();
            while (target && (!allViewrs || tools.isEmpty(allViewrs))) {
                target = container.prev(target);
                if (target && target.getSectId && target.getSectId()) {
                    // the paragraph is the last paragraph;
                    return false;
                }
                allViewrs = target && target.getAllViews();
            }
            if (allViewrs && !tools.isEmpty(allViewrs)) {
                for (var ownerid in allViewrs) {
                    var myView = this.preLayout(ownerid);
                    var view = allViewrs[ownerid].getLast();
                    if(view.sectId)
                        delete view.sectId;
                    view.insertAfterSel(myView);
                }
                return true;
            }
            return false;
        },
        _insertViewBefore: function() {
            var container = this.parent.container;
            var target = container.next(this);
            var allViewrs = target && target.getAllViews();
            while (target && (!allViewrs || tools.isEmpty(allViewrs))) {
                target = container.next(target);
                allViewrs = target && target.getAllViews();
            }
            if (allViewrs && !tools.isEmpty(allViewrs)) {
                for (var ownerid in allViewrs) {
                    var myView = this.preLayout(ownerid);
                    var view = allViewrs[ownerid].getFirst();
                    view.insertBeforeSel(myView);
                }
                return true;
            }
            return false;
        },
        insertView: function() {
            if (!this._insertViewAfter() && !this._insertViewBefore()) {
                var parent = this.parent;
                var allViewrs = parent.getAllViews();
                for (var ownerid in allViewrs) {
                    var myView = this.preLayout(ownerid);
                    var view = allViewrs[ownerid].getFirst();
                    myView.appendSel(view);
                }
            }
        },
        deleteView: function(noChangeContainer) {
            var allViews = this.getAllViews();
            for (var ownerId in allViews) {
                var viewers = allViews[ownerId];
                var firstView = viewers.getFirst();
                while (firstView) {
                    var next = viewers.next(firstView);
                    firstView.deleteSel();
                    firstView = next;
                }
            }
            if (!noChangeContainer)
                this.container.removeAll();
        },
        resetView: function(forceExe) {
            var allViews = this.getAllViews();
            for (var ownerId in allViews) {
                var viewers = allViews[ownerId];
                var firstView = viewers.getFirst();
                if (firstView) {
                    firstView.reset(forceExe);
                    var sectId;
                    var next = viewers.next(firstView);
                    while (next) {
                        var a = viewers.next(next);
                        sectId = next.sectId;
                        next.deleteSel();
                        next = a;
                    }
                    if (sectId)
                        firstView.sectId = sectId;
                }
            }
        },
        updateView: function() {
            var allViews = this.getAllViews();
            for (var ownerId in allViews) {
                var viewers = allViews[ownerId];
                var firstView = viewers.getFirst();
                if (firstView) {
                    firstView.updateSelf();
                    var next = viewers.next(firstView);
                    while (next) {
                        next.updateSelf();
                        next = viewers.next(next);
                    }
                }
            }
        },
        /**
         * the parent was mark inserted and not update 
         * then no need mark children.
         * @returns {Boolean}
         */
        noNeedMark: function() {
            return this.parent.CHANGESTATE && this.parent.CHANGESTATE.inserted && this.parent.CHANGESTATE.inserted.state;
        },
        mark: function(tag, callbackFun) {
            if (this.noNeedMark())
                return;

            if (!this.CHANGESTATE) {
                this.CHANGESTATE = {
                    deleted: {},
                    inserted: {},
                    reseted: {},
                    dirty: {},
                    resize: {}
                };
            }
            this.CHANGESTATE[tag].state = true;
            this.CHANGESTATE[tag].callbackFunc = callbackFun;
            if (this.parent.addChangeModel) {
                this.parent.addChangeModel(this);
                this.parent.update();
            } else {
                this.update();
            }
        },
        update: function(noChangeContainer) {
            if (!this.CHANGESTATE) {
                return;
            }
            try {
                if (this.CHANGESTATE.deleted.state) {
                    this.deleteView(noChangeContainer);
                    this.CHANGESTATE.deleted.callbackFunc && this.CHANGESTATE.deleted.callbackFunc();
                } else if (this.CHANGESTATE.inserted.state) {
                    this.insertView();
                    this.CHANGESTATE.inserted.callbackFunc && this.CHANGESTATE.inserted.callbackFunc();
                } else if (this.CHANGESTATE.reseted.state) {
                    this.resetView();
                    this.CHANGESTATE.reseted.callbackFunc && this.CHANGESTATE.reseted.callbackFunc();
                } else if (this.CHANGESTATE.dirty.state) {
                    this.updateView();
                    this.CHANGESTATE.dirty.callbackFunc && this.CHANGESTATE.dirty.callbackFunc();
                } else if (this.CHANGESTATE.resize.state) {
                    this.resizeView();
                    this.CHANGESTATE.resize.callbackFunc && this.CHANGESTATE.resize.callbackFunc();
                } else {
                    console.log("has nothing to do!");
                }
            } catch (e) {
                console.error(e);
            }

            delete this.CHANGESTATE;
        },
        // when the model is prelayout, the update state will be clear;
        clearState: function() {
            delete this.CHANGESTATE;
        },
        markDirty: function() {
            this.mark("dirty");
        },
        markInsert: function() {
            this.notifyInsertToModel();
            this.mark("inserted");
        },
        markDelete: function() {
            this.notifyRemoveFromModel();
            this.mark("deleted");
        },
        markReset: function() {
            this.mark("reseted");
        },
        notifyInsertToModel: function() {

        },
        notifyRemoveFromModel: function() {

        }
    };
    return Block;
});
