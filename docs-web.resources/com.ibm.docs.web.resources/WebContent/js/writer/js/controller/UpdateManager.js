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
    "dojo/_base/lang",
    "dojo/topic",
    "writer/common/Container",
    "writer/constants"
], function(declare, lang, topic, Container, constants) {

    var UpdateManager = declare("writer.controller.UpdateManager", null, {
        constructor: function() {
            this.changedRecord = new Container(this);
            this.changedLists = {};
            this.updateTimer = null;
        },
        addChangedBlock: function(block) {
            if (!this.changedRecord.contains(block)) {
                this.changedRecord.append(block);
            }
        },
        addChangedList: function(list) {
            this.changedLists[list.id] = list;
        },
        /**
         * 
         * @param immediately Boolean, true will update immediately
         */
        update: function(immediately) {
            if (immediately)
                this._updateAllBlockImpl();
            else if (!this.updateTimer) {
                this.updateTimer = setTimeout(lang.hitch(this, this._updateAllBlockImpl), 50);
            }
        },

        isUpdating: function() {
            return this.updateTimer != null;
        },

        _updateAllBlockImpl: function() {
            // TODO Update Header & Footer first
            // Need to sort the update paragraphs.

            this.updateTimer = null;
            // Update list value first
            for (var listId in this.changedLists) {
                var listObj = this.changedLists[listId];
                listObj.updateListValueNow(true);
            }

            var executeUpdate = function(model) {
                var suspendChildren = model.getSuspendedChildren();
                suspendChildren && suspendChildren.forEach(function(subModel) {
                    executeUpdate(subModel);
                });
                model.update(true);
                suspendChildren && model.clearSuspendChildren();
            };
            topic.publish(constants.EVENT.BEGINUPDATEDOCMODEL);
            this.changedRecord.forEach(function(model) {
                executeUpdate(model);
            });
            topic.publish(constants.EVENT.ENDUPDATEDOCMODEL);

            // Update selection after update view
            var selection = pe.lotusEditor.getSelection();
            selection && selection.updateHeaderFooter();
            try {
                //          if( selection && !selection.restore())
                if(selection)
                {
                    var notScrollView = !pe.lotusEditor.needScroll;
                    selection && selection.updateSelection(notScrollView);
                    // selection.scrollIntoView(); no need here, in updateSelection() do it.
                }
            } catch (e) {
                console.error("Exception in update manager to restore selection: " + e);
            }

            pe.lotusEditor.indicatorManager.drawUserSelections();

            pe.lotusEditor.needScroll = false;

            this.clear();
        },
        clear: function() {
            this.changedRecord.removeAll();
            this.changedLists = {};
        }

    });

    return UpdateManager;
});
