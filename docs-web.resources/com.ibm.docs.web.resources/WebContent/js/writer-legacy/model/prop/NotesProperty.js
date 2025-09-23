dojo.provide("writer.model.prop.NotesProperty");
writer.model.prop.NotesProperty = function(json){
	this.init(json);
};
writer.model.prop.NotesProperty.prototype={
	init:function(json){
		json.pos&&(this.pos = json.pos.val);
		json.numFmt&&(this.fmt = json.numFmt.val);
		json.numRestart&&(this.restart = json.numRestart.val);
		if(json.numStart){
			this.start = parseInt(json.numStart.val);
		}else{
			this.start =1;
		}
		this.json = dojo.clone(json);
	},
	isEndSect:function(){
		return this.pos&&this.pos=="sectEnd";
	},
	getFormat:function(){
		if(this.fmt){
			switch (this.fmt){
				case "upperRoman":
					return  writer.model.listPrototype.prototype.I;
				case "lowerRoman":
					return  writer.model.listPrototype.prototype.i;
				case "upperLetter":
					return  writer.model.listPrototype.prototype.A;
				case "lowerLetter":
					return  writer.model.listPrototype.prototype.a;
				default:
					return  writer.model.listPrototype.prototype.N;
						
			}
		}
	},
	isRestart:function(){
		return this.restart&&this.restart=="eachSect";
	},
	getStart:function(){
		return this.start;
	},
	toJson:function(){
		return dojo.clone(this.json);
	}
};