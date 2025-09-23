dojo.provide("mobile.bean.FileMIConfig");

dojo.declare("mobile.bean.FileMIConfig",null,{
	id: "",
	title: "",
	type: "",
	label: "",
	htmltag: "a",
	selected: false,
	constructor: function(params){
		dojo.mixin(this,params); 
	}
});
