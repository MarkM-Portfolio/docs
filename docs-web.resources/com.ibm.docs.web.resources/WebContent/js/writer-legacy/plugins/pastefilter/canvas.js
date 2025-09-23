dojo.provide("writer.plugins.pastefilter.canvas");
dojo.require("writer.plugins.pastefilter.anchor");
dojo.declare( "writer.plugins.pastefilter.canvas",  [writer.plugins.pastefilter.anchor], {
	/**
	 * filter 
	 * @param m
	 * @returns
	 */
	filter: function( m, webClipBoard, pasteBin ){
		if(this.isSmartArt(m))
			return null;
		
		if( webClipBoard && !webClipBoard.isSameFile ){
		//paste across document
			if( m.anchor && m.anchor.graphicData &&   m.anchor.graphicData.odfshapeid )
				return null;
		}
		return this.inherited(arguments);
	},
	
	isSmartArt:function(m){
		if(m.rt == "smartart")
			return true;
		return false;
	}
});