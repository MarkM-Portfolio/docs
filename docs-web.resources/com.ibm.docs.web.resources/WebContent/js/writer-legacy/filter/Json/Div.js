dojo.provide("writer.filter.Json.Div");
dojo.require("writer.filter.Json.Paragraph");
dojo.require("writer.filter.Json.Factory");

dojo.declare("writer.filter.Json.Div", writer.filter.Json.Element,{
	toHtml: function(){
		this.startElement("div");
		var contents= [];
		if( this.json.t == "sdt"){
			contents =  this.json.sdtContent;
		}
		var c = "";
		for( var i = 0; i< contents.length; i++ ){
			var factor = new writer.filter.Json.Factory();
			var block = factor.createBlock(contents[i]);
			if( block ){
				c += block.toHtml();
			}
		}
		this.htmlString += c ;
		
		this.endElement();
		
		return this.htmlString;
	}
	
});