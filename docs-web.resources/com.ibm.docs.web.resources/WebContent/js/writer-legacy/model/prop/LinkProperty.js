dojo.provide("writer.model.prop.LinkProperty");
writer.model.prop.LinkProperty = function(json,hint){
//	this.source = json;
	this.hint = hint;
	this.paragraph = hint && hint.paragraph;
	this.init();
};
writer.model.prop.LinkProperty.prototype = {
	type: writer.model.prop.Property.LINK_PROPERTY,
	init:function(){
				
	}
	
};
