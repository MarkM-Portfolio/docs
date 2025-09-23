dojo.provide("writer.model.text.AltContent");
dojo.require("writer.model.text.InlineObject");

dojo.declare("writer.model.text.AltContent",[writer.model.text.InlineObject],{
	modelType: writer.MODELTYPE.ALTCONTENT,
	
	fromJson: function( json ){
		this.start = json.s ? Number(json.s) : 0;
		this.length = json.l ? Number(json.l) : 0;
		var fmt = json.AlternateContent && json.AlternateContent.Choice.fmt;
		if (fmt)
		{
			/*
				there will be only one run in the content now.
			*/
			if (fmt.length != 1)
			{
				console.error("!!!!!!!!!alternate content fmt error:fmt.length!=1");
			}

			fmt[0].s = this.start;
			fmt[0].l = this.length;

			this.createHints(fmt);
		}
	},
	toJson: function( index, length )
	{
		var retVal = {};
		retVal.rt = writer.model.text.Run.TEXT_Run;
		index = ( index == null ) ? this.start : index;
		length = ( length == null ) ? this.length : length;
		
		retVal.AlternateContent = {};
		retVal.AlternateContent.Choice = {};
		retVal.AlternateContent.Choice.fmt = this.hintsToJson( index, length );
		retVal.s = "" + index;
		retVal.l = "" + length;
		
		return retVal;
	}
});
