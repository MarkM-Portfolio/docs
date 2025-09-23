dojo.provide("writer.filter.Json.Element");
dojo.require("writer.filter.Json.BaseObject");


dojo.declare("writer.filter.Json.Element", writer.filter.Json.BaseObject,{
	tag: null,
	attributes:"",
	styles: "",
	constructor: function( json ){
		if(json._fromClip )
			this.attributes = "_fromClip="+json._fromClip;
	},
	startElement: function( tag )
	{
		this.genAttributes();
		this.htmlString = "<"+tag+ " " + this.attributes + ">";
		this.tag = tag;
	},
	
	addContent: function( text )
	{
		text = text.replace(/&/g,"&amp;").replace(/  /g," &nbsp;").replace(/ $/g,"&nbsp;").replace(/^ /g,"&nbsp;").replace(/>/g,"&gt;").replace(/</g,"&lt;").replace(/"/g,"&quot;");
		this.htmlString += text; 
	},
	
	endElement: function( )
	{
		this.htmlString += "</" + this.tag + ">";
	},
	
	genAttributes: function()
	{
		
	}
	
});