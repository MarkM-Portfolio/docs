dojo.provide("writer.filter.Json.Table");
dojo.require("writer.filter.Json.Element");

dojo.declare("writer.filter.Json.Table", writer.filter.Json.Element,{
	toHtml: function(){
		this.startElement("table");
		this.addContent();
		this.endElement();
		
		return this.htmlString;
	},
	
	startElement: function( tag )
	{
		this.tag = tag;
		this.genAttributes();
		this.htmlString = "<"+tag+ " " + this.attributes + "><tbody>";
	},
	
	addContent: function(){
		// Add column group
		var colGrids = this.json.tblGrid;
		var colGroup = "<colgroup>";
		for(var i = 0; i < colGrids.length; i++)
		{
			colGroup += "<col style='width:" + colGrids[i].w + "' />";
		}	
		colGroup += "</colgroup>";
		this.htmlString += colGroup;

		// Add rows
		var filter = new writer.filter.JsonToHtml();
		this.htmlString += filter.toHtml(this.json.trs);
	},
	
	endElement: function()
	{
		this.htmlString += "</tbody></" + this.tag + ">"; 
	},
	
	genAttributes: function()
	{
		// TODO Implement it.
//		this.attributes = "";
	}
});