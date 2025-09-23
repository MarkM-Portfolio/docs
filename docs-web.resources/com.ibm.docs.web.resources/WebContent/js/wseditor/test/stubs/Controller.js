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

dojo.provide("websheet.Controller");
dojo.provide("websheet.test.stubs.Controller");

dojo.declare("websheet.Controller", null, {
	_base: null,
	
	_documentObj: null,
	
	_selectRect: null,
	
	constructor: function(base) {
		this.editor = base;
	},

	getDocumentObj: function() {
		return this._documentObj;
	},
	
	getGrid: function(sheetName) {
		return new websheet.grid.DataGrid();
	},
	
	setCell:function(sheetName, rowIndex, colNum, newValue, parseTokenResult/*tokenArray with array type or result of parseFormula with tokenTree and tokenArray*/, userId, mode, bInheritFormat)
	{
		var cellJson = {v: newValue};
		if (dojo.isArray(parseTokenResult)) cellJson.tarr = parseTokenResult;
		this._documentObj.setCell(sheetName, rowIndex, colNum, cellJson, userId, false, mode, bInheritFormat);
	},
	
	getHighlightProvider: function(){
		return new websheet.widget.RangeHighlightProvider(this.editor);
	},
});
