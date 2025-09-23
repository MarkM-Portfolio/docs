dojo.provide("writer.plugins.pastefilter.textbox");
dojo.require("writer.plugins.pastefilter.anchor");
dojo.declare( "writer.plugins.pastefilter.textbox", [writer.plugins.pastefilter.anchor], {
	/**
	 * filter 
	 * @param m
	 * @returns
	 */
	filter: function( m, webClipBoard, pasteBin ){
		if( webClipBoard && !webClipBoard.isSameFile ){
		//paste across document
			var shapeData = m.anchor || m.inline;
			if( shapeData && shapeData.graphicData && shapeData.graphicData.txbx && shapeData.graphicData.txbx.odfshapeid )
				return null;
		}
		return this.inherited(arguments);
	}
});