dojo.provide("writer.model.notes.EndNote");
dojo.require("writer.model.update.BlockContainer");
writer.model.notes.EndNote = function(json){
	if(!json){
		console.error("the json source can not be null!");
		return ;
	}
	this.container = new common.Container(this);
	this.fromJson(json);
};
writer.model.notes.EndNote.prototype={
	modelType:writer.MODELTYPE.ENDNOTE
};
common.tools.extend(writer.model.notes.EndNote.prototype,new writer.model.notes.FootNote());