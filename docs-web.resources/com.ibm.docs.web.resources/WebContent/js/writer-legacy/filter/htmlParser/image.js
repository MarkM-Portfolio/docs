dojo.provide("writer.filter.htmlParser.image");
dojo.require("writer.filter.htmlParser.element");

dojo.declare("writer.filter.htmlParser.image", [writer.filter.htmlParser.textportion],{
	constructor: function( element ){
		
		var src = this.getSrc(), that = this;
		this.element.getTextFormats = function(){
			var isShape = this.attributes["v:shapes"];
			if( (!isShape) && src && src.match(/^data:image\/([\w]+);base64/) ){
				return that.getFormatJson(src);
			}
			else
				return [];
		};
		
	},
	/**
	 * to json object
	 * @returns {___anonymous497_498}
	 */
	toJson : function()
	{
		var retVal={},src = this.getSrc();
		var isShape = this.element.attributes["v:shapes"];
		if( (!isShape) && src && src.match(/^data:image\/([\w]+);base64/) )
		// local file paste support
		{
			retVal = this.getFormatJson(src);
			retVal.c = "\u0001";
		}
		return retVal;
	},
	/**
	 * get json 
	 * @param src
	 * @returns
	 */
	getFormatJson: function( src ){
		var imageObj = new writer.model.text.Image();
		imageObj.width = "15px";
		imageObj.height = "15px";
		imageObj.url = src;
		return imageObj.toJson();
	},
	/**
	 * get src file
	 * @returns
	 */
	getSrc: function()
	{
		return this.element.attributes.src;
	},
	/**
	 * override function of JsonWriter
	 * @returns
	 */
	getText: function(){
		var src = this.getSrc();
		if(  src && src.match(/^data:image\/([\w]+);base64/) ){
			return "\u0001";
		}
		else
			return "";
	}
});

