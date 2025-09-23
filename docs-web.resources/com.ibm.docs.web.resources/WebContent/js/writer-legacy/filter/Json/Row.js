dojo.provide("writer.filter.Json.Row");
dojo.require("writer.filter.Json.Element");

dojo.declare("writer.filter.Json.Row", writer.filter.Json.Element,{
	toHtml: function(){
		this.isMergedRow = false;
		this.startElement("tr");
		this.addContent();
		this.endElement();
		
		if(this.isMergedRow)
			return "";
		
		return this.htmlString;
	},

	addContent: function(){
		// Add Cells
		var filter = new writer.filter.JsonToHtml();
		var cellStr = filter.toHtml(this.json.tcs);
		if(cellStr == "")	// The row is merged
			this.isMergedRow = true;
		else
			this.htmlString += cellStr;
	},
	
	genAttributes: function()
	{
		// TODO Implement it .
		return "";
	}
	
});