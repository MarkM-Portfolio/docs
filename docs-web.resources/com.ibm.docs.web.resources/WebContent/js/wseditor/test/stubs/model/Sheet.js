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

dojo.provide("websheet.test.stubs.model.Sheet");
dojo.provide("websheet.model.Sheet");

dojo.declare("websheet.model.Sheet", websheet.functions.Sheet, {
	constructor: function(parent, sheetId, sheetName, meta) {
		this._id = sheetId;
		this._name = sheetName;
		this._parent = parent;
		this._idManager = this._parent._idManager;
		this._rows = [];
		this._columns = [];
		this._offGridLine = false;
		
		if (meta)
		{
			if (meta.dir){
				this._direction = meta.dir;
			}
			if (meta["protected"])
				this._bProtected = meta["protected"];			
			// since 1.03 version, the abbreviated name is used
			var visibility = meta.visibility !== undefined ? meta.visibility : meta.vis;
			if (visibility){
				this._visibility = visibility;
			}
			if (meta.color)
				this._tabColor = meta.color;
			if (meta.offGridLine)
				this._offGridLine = meta.offGridLine;
		}		
	},
	
	getColumn: function() {
		return null;
	},
	
	getOffGridLines: function() {
		return this._offGridLine;
	},
	
	setOffGridLines: function(b) {
		this._offGridLine = b;
	}
});