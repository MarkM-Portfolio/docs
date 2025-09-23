dojo.provide("writer.filter.htmlParser.row");
dojo.require("writer.filter.htmlParser.element");

dojo.declare("writer.filter.htmlParser.row", [writer.filter.htmlParser.JsonWriter],{
	toJson : function( fillCells, colCount )
	{
		if( this.element && !this.element.parent.name)
		//tr in root ??
		//not fixed.
			return {};
			
		var retVal={};
		retVal.id = WRITER.MSG_HELPER.getUUID();
		retVal.t = "tr";
		retVal.trPr = {};
		retVal.tcs = [];
		var element = this.element;
		if( element.children.length == 0 )
			element.children.push( new writer.filter.htmlParser.element("td"));
		
		var colIndex = 0;
		for( var i= 0; i< element.children.length; i++ ){
			if( fillCells && fillCells[colIndex])
			{
				retVal.tcs.push(  fillCells[colIndex].cell );
				colIndex += fillCells[colIndex].colspan;
			}
			retVal.tcs.push( element.children[i].writeJson());
			colIndex += element.children[i].getColspan();
		}
		
		var cellJson;
		for( var j=colIndex; j< colCount; ){
			if( fillCells && fillCells[j])
			{
				retVal.tcs.push(  fillCells[colIndex].cell );
				j += fillCells[colIndex].colspan;
			}
			else
			{
				if( !cellJson) cellJson = (new writer.filter.htmlParser.element("td")).writeJson();
				retVal.tcs.push(cellJson);
				j++;
			}
		}
		return retVal;
	}
});

