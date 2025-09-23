dojo.provide("writer.filter.Json.Paragraph");
dojo.require("writer.filter.Json.Element");

dojo.declare("writer.filter.Json.Paragraph", writer.filter.Json.Element,{
	toHtml: function(){
		this.startElement("p");
		if( this.json.c == "")
			this.addContent(" ");
		else
			this.addContent( this.json.c );
		this.endElement();
		return this.htmlString;
	}
	
});