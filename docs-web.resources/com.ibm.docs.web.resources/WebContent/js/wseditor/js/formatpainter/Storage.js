/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2018. All Rights Reserved.          */
/*                                                                   */
/* U.S. Government Users Restricted Rights: Use, duplication or      */
/* disclosure restricted by GSA ADP Schedule Contract with IBM Corp. */
/*                                                                   */
/* ***************************************************************** */

dojo.provide("websheet.formatpainter.Storage");
dojo.declare("websheet.formatpainter.Storage", null, {

	constructor : function() {
		this._memClipboard = null;
	},

	clear : function() {
		this._memClipboard = null;
	},

	getData : function() {
		return this._memClipboard;
	},

	_cleanData : function(data) {
		if (!data)
			return;
		delete data._limited;
		var d = data.data;
		if (!d)
			return;
		if (d.cell) {
			delete d.cell.showValue;
			delete d.cell.cv;
			delete d.cell.v;
			delete d.cell.model;
			delete d.cell._styleCode;
		} else if (d.rows) {
			for ( var x in d.rows) {
				if (d.rows[x].cells) {
					for ( var y in d.rows[x].cells) {
						var c = d.rows[x].cells[y];
						delete c.showValue;
						delete c.cv;
						delete c.v;
						delete c.model;
						delete c._styleCode;
					}
				}
			}
		}
	},

	setData : function(data) {
		if (!data)
			return;
		this._cleanData(data);
		data._timestamp = new Date().valueOf();
		this._memClipboard = data;
	}
});
