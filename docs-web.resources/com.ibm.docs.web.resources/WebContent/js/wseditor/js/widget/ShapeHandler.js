/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* U.S. Government Users Restricted Rights: Use, duplication or      */
/* disclosure restricted by GSA ADP Schedule Contract with IBM Corp. */
/*                                                                   */
/* ***************************************************************** */

dojo.provide("websheet.widget.ShapeHandler");
dojo.require("websheet.widget.ImageHandler");
dojo.declare("websheet.widget.ShapeHandler", websheet.widget.ImageHandler, {

	constructor: function(editor) {
		this.usage = websheet.Constant.RangeUsage.SHAPE;
	},
	
	insertShape: function(imgdata, srcParms) {
		this._updateSvgIds(imgdata);
		this._insertImageCB(null, imgdata, srcParms);
	},
	
	_updateSvgIds: function(imgdata) {
		var svg = imgdata.svg;
		var attrs = svg.match(/id="\w*_id_[^"]*"/g);
		var i = 0;
		var timestamp = new Date().valueOf(); 
		dojo.forEach(attrs, function(attr){
			var id = attr.substring(3, attr.length);
			if(id.charAt(0) == "\"" && id.charAt(id.length - 1) == "\""){
				id = id.substring(1, id.length - 1);
			}
			var uuid = "id_" + timestamp + "-" + (++i);
			var nid = id.replace(/id_[^"]*/, uuid);
			svg = svg.replace(new RegExp(id, "gm"), nid);
		}, this);
		imgdata.svg = svg;
	}
});