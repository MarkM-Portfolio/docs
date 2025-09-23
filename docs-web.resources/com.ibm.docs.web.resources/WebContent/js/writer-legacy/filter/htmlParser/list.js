dojo.provide("writer.filter.htmlParser.list");
dojo.require("writer.filter.htmlParser.element");

dojo.declare("writer.filter.htmlParser.list", [writer.filter.htmlParser.JsonWriter],{
	level: 0,
	numId: null,
	/**
	 * toJson function
	 * @returns
	 */
	toJson : function()
	{
		this.fixBlockChildren();
		
		var defaultMap = {
			"disc":	  "circle",
			"circle": "circle",
			"square": "square",	
			"decimal": "decimal",	
			"lower-roman": "lowerRoman",
			"upper-roman": "upperRoman",
			"lower-alpha": "lowerLetter",
			"upper-alpha": "upperLetter"
		};
		var element = this.element, plugin = pe.lotusEditor.getPlugin("list");
		if( !this.numId ){
			var msoListId = element.attributes[ "cke:listId"], firstChild = element.children[0];
			if( !msoListId ){
				msoListId = firstChild && firstChild.attributes[ "cke:listId" ];
			}
			if( firstChild && firstChild.attributes[ "cke:indent" ]){
				this.level = firstChild.attributes[ "cke:indent" ];
			}
			
			if( msoListId  && writer.filter.htmlParser.listIds[ msoListId ]){
				this.numId = writer.filter.htmlParser.listIds[ msoListId ];
			}
			else
			{
				var list_type = element.getStyle()["list-style-type"];
				//map first;
				list_type = list_type && defaultMap[list_type];
				
				if( !list_type ){
					if( element.name == "ul" )
						list_type = "circle";
					else 
						list_type = "decimal";
				}
				
				this.numId = plugin.createDefaultList(list_type,this.level, (element.name == "ol") );
				if( msoListId )
					writer.filter.htmlParser.listIds[ msoListId ] = this.numId;
			}
			
		}
		for ( var i = 0 ; i < element.children.length ; i++ ){
			if(  !element.children[i].writer || !element.children[i].writer.setList )
			//is not li ..
				continue;
			else
				element.children[i].writer.setList( this );
		}
		return writer.filter.htmlParser.JsonWriter.prototype.toJson.apply( this,[] );
	},
	/**
	 * set parent list item
	 * "li"
	 * @param list
	 */
	setList: function( list ){
		this.level = list.level + 1;
	}
});

