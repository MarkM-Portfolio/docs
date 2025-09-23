dojo.provide("writer.model.text.BookMark");

dojo.declare("writer.model.text.BookMark",[writer.model.text.TextRun],
{
	t: null,
	name: null,
	id: null,
	type: null,
	
	constructor: function(json, owner, text) {
		text = "";
		this.t = json.t;
		json.name && ( this.name = json.name );
		this.id = json.id;
		this.length = 0;
		json.type && ( this.type = json.type )
	},
	toJson: function(){
		var jsonData ={
			"rt" : "bmk",
			"t" : this.t,
			"id" : this.id
		};
		this.name && (jsonData.name = this.name );
		this.type && ( jsonData.type = this.type ); //unknow property
		
		return jsonData;
	},
	
	isTextRun: function(){
		return false;
	},
	
	modelType: writer.MODELTYPE.BOOKMARK
});
