dojo.provide("writer.filter.htmlParser.text");
(function()
{
	/**
	 * A lightweight representation of HTML text.
	 * @constructor
	 * @example
	 */
 	writer.filter.htmlParser.text = function( value )
	{
		/**
		 * The text value.
		 * @type String
		 * @example
		 */
		this.value = value;

		/** @private */
		this._ =
		{
			isBlockLike : false
		};
	};
	writer.filter.NODE_TEXT = 3;
	
	writer.filter.htmlParser.text.prototype =
	{
		/**
		 * The node type. This is a constant value set to {@link writer.filter.NODE_TEXT}.
		 * @type Number
		 * @example
		 */
		type : writer.filter.NODE_TEXT,
		
		filter: function( filter){
			var text = this.value;
			if ( filter && !( text = filter.onText( text, this ) ) )
				return null;
			return this;
		},
		
		writeJson: function( filter ){
		//	if (!( this.value = this.filter(filter)))
		//			return null;
			return this.toJson();
		},
		
		toJson: function()
		{
			return this.getText();
		},
		
		getTextFormats: function(){
			var fmt = {};
			fmt.rt = "rPr";
			fmt.l = this.getText().length;
			fmt.s = 0;
			return [fmt];
		},
		getText: function()
		{
			return this.value.replace(/&nbsp;/g," ").replace(/&amp;/gm, "&").replace(/&lt;/gm, "<").replace(/&gt;/gm, ">").replace(/&quot;/gm, '"');
		}
	};
})();
