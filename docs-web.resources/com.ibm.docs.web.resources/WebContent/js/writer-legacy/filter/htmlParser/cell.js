dojo.provide("writer.filter.htmlParser.cell");
dojo.require("writer.filter.htmlParser.element");

dojo.declare("writer.filter.htmlParser.cell", [writer.filter.htmlParser.JsonWriter],{
	constructor: function( element ){
		element.getColspan = function(){
			return parseInt( this.attributes.colspan || 1 );
		};
		
		element.getRowspan = function(){
			return parseInt( this.attributes.rowspan || 1 );
		};
	},
	
	toJson : function()
	{
	
		var tc = {};
		tc.t="tc";
		tc.id =  WRITER.MSG_HELPER.getUUID();
		tc.tcPr = {};
		var value;
		if( value = this.element.getStyle()["background-color"]){
			if( value.indexOf("#")==0)
				value = value.substring(1);
			tc.tcPr.shd = {
				"fill": value,
				"color": "auto"
			};
		}
		var colspan = this.element.getColspan();
		if( colspan!= 1 )
			tc.tcPr.gridSpan = { "val": colspan };
		var rowspan = this.element.getRowspan();
		if( rowspan!= 1 )
			tc.tcPr.vMerge = {"val": "restart" };
		
		tc.ps = writer.filter.htmlParser.JsonWriter.prototype.writeBlockContentsJson.apply(this);
		if( tc.ps.length == 0 ){
			var p =  new writer.filter.htmlParser.element("p");
			tc.ps.push( p.writeJson() );
		}
		return tc;
	},
	/**
	 * get width
	 * @returns
	 */
	getWidth: function(){
		if( this.width == null ){
			var width = this.element.getStyle().width, unit, tmp;
		    if ( width && ( tmp =width.toLowerCase().match(/^(-?[\d|\.]*)(pc|px|pt|em|cm|in|mm|emu|%)$/i))){
				width = tmp[1];
				unit = tmp[2];
				this.width = { "val":width,"unit":unit };
			}	
		}
		return this.width;
	}
});

