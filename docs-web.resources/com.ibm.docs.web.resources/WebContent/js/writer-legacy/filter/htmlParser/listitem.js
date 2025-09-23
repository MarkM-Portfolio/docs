dojo.provide("writer.filter.htmlParser.listitem");
dojo.require("writer.filter.htmlParser.element");

dojo.declare("writer.filter.htmlParser.listitem", [writer.filter.htmlParser.JsonWriter],{
	list: null,
	level: 0,
	/**
	 * list is "ol" or "ul"
	 * level is the level of list
	 * @param list
	 */
	setList: function( list ){
		this.list = list;
		this.level = list.level;
	},
	/**
	 * toJson function
	 * core function when parsing 
	 * @returns
	 */
	toJson : function()
	{
		var inlines = null, newChildren = [],element = this.element;
		
		function createParagraph( inlines ){
			if( inlines ){
				child = new writer.filter.htmlParser.element( "p", element.attributes );
				child.children = inlines;
				newChildren.push( child );
			}
		}
		for ( var i = 0 ; i < element.children.length ; i++ ){
			if( !element.children[i]._.isBlockLike || element.children[i].name == "br" ){
				inlines = inlines || [];
				inlines.push( element.children[i] );
			}
			else{
				createParagraph( inlines );
				inlines = null;
				if( element.children[i].writer && element.children[i].writer.setList )
					element.children[i].writer.setList( this );
				newChildren.push( element.children[i] );
			}
		}
		createParagraph( inlines );
		element.children = newChildren;
		for ( var i = 0 ; i < element.children.length ; i++ ){
			if( element.children[i].name == "p" && this.list && element.children[i].writer )
				element.children[i].writer.setNumId( this.list.numId, this.list.level );
				if ( dojo.isIE && element.attributes["style"] ){
					element.children[i].attributes["style"] = element.attributes["style"];
			}
		}
		
		return writer.filter.htmlParser.JsonWriter.prototype.toJson.apply( this,[] );
	}
});

