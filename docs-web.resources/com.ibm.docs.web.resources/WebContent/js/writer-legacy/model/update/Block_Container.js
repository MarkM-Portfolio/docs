dojo.provide("writer.model.update.Block_Container");
dojo.require("writer.model.update.Block");
dojo.require("writer.model.update.BlockContainer");
writer.model.update.Block_Container = function(){
};
writer.model.update.Block_Container.prototype={
		
};
(function(){
	var blockUpdate = new writer.model.update.Block();
	var blockContainerUpdate = new writer.model.update.BlockContainer();
	writer.model.update.Block_Container.prototype.update=function(forceExecu){
		if(this.CHANGESTATE){
			blockUpdate.update.apply(this);			
		}else{
			blockContainerUpdate.update.apply(this, [forceExecu]);
		}
	};
	writer.model.update.Block_Container.prototype.resetView=function(){
		blockUpdate.resetView.apply(this);
		this.changedModels&&this.changedModels.removeAll();
	};
	writer.model.update.Block_Container.prototype.notifyInsertToModel=function(forceExecu){
		this.container.forEach(function(child){
			child.notifyInsertToModel();
		});
	};
	writer.model.update.Block_Container.prototype.notifyRemoveFromModel=function(forceExecu){
		window._IDCache.removeId(this.id);
		this.container.forEach(function(child){
			child.notifyRemoveFromModel();
		});
	};
	common.tools.extend(writer.model.update.Block_Container.prototype,blockContainerUpdate);
	common.tools.extend(writer.model.update.Block_Container.prototype,blockUpdate);	
})();
