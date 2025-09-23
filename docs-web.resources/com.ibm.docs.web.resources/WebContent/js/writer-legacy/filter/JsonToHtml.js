dojo.provide("writer.filter.JsonToHtml");
dojo.require("writer.filter.Json.Factory");

dojo.declare("writer.filter.JsonToHtml",
		null, {
		/*
		 * convert jsonArray to html string
		 */
		toHtml : function( jsonArray ){
			var htmlString ="";
			var clipId = jsonArray && jsonArray[0] &&  jsonArray[0]._fromClip;
			for( var i = 0; jsonArray && ( i < jsonArray.length ); i++ )
			{
				if( jsonArray[i] && clipId && jsonArray[i].c !=""){
					jsonArray[i]._fromClip = clipId;
					clipId = null;
				}
				htmlString += this.convert( jsonArray[i] );
			}
			return htmlString;
		},
		/*
		 * Convert a block element to html string
		 */
		convert: function( jsonObject ){
			var factor = new writer.filter.Json.Factory();
			var block = factor.createBlock(jsonObject);
			if( block )
				return block.toHtml();
			else
			{
				console.warn( " unknown json object");
				return "";
			}
		}
	}
);

