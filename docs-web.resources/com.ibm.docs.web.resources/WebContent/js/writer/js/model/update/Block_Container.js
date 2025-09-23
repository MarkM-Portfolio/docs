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
    "writer/common/tools",
    "writer/model/update/Block",
    "writer/model/update/BlockContainer"
], function(tools, Block, BlockContainer) {

    var Block_Container = function() {};
    Block_Container.prototype = {

    };
    (function() {

        var blockUpdate = new Block();
        var blockContainerUpdate = new BlockContainer();

        Block_Container.prototype.update = function(forceExecu, noChangeContainer) {
            if (this.CHANGESTATE) {
                blockUpdate.update.apply(this, [noChangeContainer]);
            } else {
                blockContainerUpdate.update.apply(this, [forceExecu]);
            }
        };
        Block_Container.prototype.resetView = function(forceExecu) {
            blockUpdate.resetView.apply(this, [forceExecu]);
            this.changedModels && this.changedModels.removeAll();
        };
        Block_Container.prototype.notifyInsertToModel = function(forceExecu) {
            if (this.deleted)
                delete this.deleted;
            this.container.forEach(function(child) {
                child.notifyInsertToModel();
            });
        };
        Block_Container.prototype.notifyRemoveFromModel = function(forceExecu) {
            this.deleted = true;
            window._IDCache.removeId(this.id);
            this.container.forEach(function(child) {
                child.notifyRemoveFromModel();
            });
        };
        tools.extend(Block_Container.prototype, blockContainerUpdate);
        tools.extend(Block_Container.prototype, blockUpdate);
    })();

    return Block_Container;
});
