dojo.provide("writer.filter.Json.BaseObject");

dojo.declare("writer.filter.Json.BaseObject", null,{
	htmlString: "",
	json: null,
	
	constructor: function( json ){
		this.json = json;	
	},
	
	toHtml: function(){
		console.warn("this function need to be implemented!");
		return "";
	}
});