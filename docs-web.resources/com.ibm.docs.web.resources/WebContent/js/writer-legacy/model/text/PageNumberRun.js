dojo.provide("writer.model.text.PageNumberRun");

dojo.declare("writer.model.text.PageNumberRun",[writer.model.text.TextRun],
{
	constructor: function(json, owner, text) {
		
	},
	
	clone:function(){
		var cloneRun = new writer.model.text.PageNumberRun();
		cloneRun.paragraph = this.paragraph;
		cloneRun.parent = this.parent;
		cloneRun.splitChars = this.splitChars.concat();
		
		cloneRun.start = this.start;
		cloneRun.length = this.length;
		cloneRun.textProperty =  this.textProperty.clone();
		
		cloneRun.comments = this.comments;
		cloneRun.revision = this.revision;
		return cloneRun;
	},
	
	modelType: writer.MODELTYPE.PAGENUMBER
});

