dojo.provide("writer.model.text.Link");
dojo.require("writer.model.text.InlineObject");


dojo.declare("writer.model.text.Link",[writer.model.text.InlineObject],{
	
	modelType: writer.MODELTYPE.LINK,
	
	fromJson: function( json ){
		this.id = json.id;
		this.start = json.s||0;
		this.length = json.l||0;
		this.src = json.src;
		this.anchor = json.anchor;
		this.name = json.name;
		//not implemented yet
		this.history = json.history;
		this.createHints(json.fmt);
		var firstHint = this.hints.getFirst();
		//
		this.start = ( firstHint && firstHint.start ) || 0;
	    var length = 0;
	    this.hints.forEach(function(run){
	    	length += run.length;
	    });
	    this.length  = length;
	    
	},
	toJson: function( index, length )
	{
		var retVal = {};
		index = ( index == null ) ? this.start : index;
		length = ( length == null ) ? this.length : length;
		
		retVal.fmt = this.hintsToJson( index, length );
		retVal.id = this.id;
		retVal.rt = writer.model.text.Run.LINK_Run;
		retVal.src = this.src;
		if(this.anchor)
			retVal.anchor = this.anchor;
		if(this.name)
			retVal.name = this.name;
		retVal.s = "" + index;
		retVal.l = "" + length;
		//
		if(this.history)
			retVal.history = this.history;
		return retVal;
	}
});
