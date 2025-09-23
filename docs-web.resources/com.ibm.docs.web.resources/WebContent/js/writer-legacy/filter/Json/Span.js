dojo.provide("writer.filter.Json.Span");
dojo.require("writer.filter.Json.Element");

dojo.declare("writer.filter.Json.Span", writer.filter.Json.Element,{
	/*
	 * json: 
	 * {
	 *  'c': ....
	 *  'fmt': ....
	 * }
	 */
	toHtml: function(){
		this.startElement("span");
		this.addContent( this.json.c );
		this.endElement();
		return this.htmlString;
	}
	
});