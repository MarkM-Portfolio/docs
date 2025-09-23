dojo.provide("writer.filter.Json.Cell");
dojo.require("writer.filter.Json.Element");

dojo.declare("writer.filter.Json.Cell", writer.filter.Json.Element,{
	toHtml: function(){
		// Vertical merged cell
		if(this.json.tcPr && this.json.tcPr.vMerge && this.json.tcPr.vMerge.val != "restart")
			return "";
		
		this.startElement("td");	//TH.
		this.addContent( this.json.c );
		this.endElement();
		
		return this.htmlString;
	},
	
	addContent: function(){
		// Add Paragraphs
		var filter = new writer.filter.JsonToHtml();
		this.htmlString += filter.toHtml(this.json.ps);
	},
	
	genAttributes: function()
	{
		// TODO Implement it .
		return "";
	}
	
});