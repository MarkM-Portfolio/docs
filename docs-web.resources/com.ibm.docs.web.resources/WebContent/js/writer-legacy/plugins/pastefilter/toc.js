dojo.provide("writer.plugins.pastefilter.toc");
dojo.declare( "writer.plugins.pastefilter.toc", null, {
	cmd : "createTOC",
	/**
	 * filter 
	 * @param m
	 * @returns
	 */
	filter: function( jsonData, webClipBoard, pasteBin ){
		return jsonData;
	}}	
);