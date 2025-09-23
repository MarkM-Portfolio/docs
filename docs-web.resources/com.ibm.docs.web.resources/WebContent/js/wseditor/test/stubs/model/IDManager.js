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

dojo.provide("websheet.test.stubs.model.IDManager");
dojo.provide("websheet.model.IDManager");
dojo.require("websheet.functions.IObject");

dojo.declare("websheet.model.IDManager", websheet.functions.IDManager, {
	getMapping:function(id)
	{
		// summary: dummy impl return id directly
		return id;
	},
	/*int*/getRowIndexById: function(sid, /*string*/id) {
		// summary: returns number after "ro"
		return parseInt(id.substring(2)) - 1;
	},
	
	/*int*/getColIndexById: function(sid, /*string*/id) {
		// summary: returns number after "co"
		return parseInt(id.substring(2)) - 1;
	},
	getColIdByIndex: function(sheetId, colIndex, bCreate) {
		return "co" + (colIndex + 1);
	},
	getColIdArrayByIndex: function(sheetId, colIndex, endColIndex, bCreate) {
		var ret = [];
		for (var i = colIndex + 1; i <= endColIndex + 1; i++) {
			ret.push("co" + i);
		}
		return ret;
	},
	getRowIdByIndex:function(sheetId, rowIndex, bCreate){
		return "ro" + (rowIndex +1);
	},
	getSheetIdBySheetName: function(sheetName)
	{
		return sheetName;
	},
	
	setDocument:function(doc) {
		this.doc = doc;
	},
	
	getSheetIndexById: function(id)
	{
		for(var i = 0; i < this.doc._sheets.length; i++) {
			var sheet = this.doc._sheets[i];
			if ( sheet._id == id) {
				return i;
			}
		}
		return -1;
	},
	getSheetNameById: function(id)
	{
		return id;
	},
	getSheetNameRanges: function(startSheet, endSheet)
	{
		if(!endSheet || startSheet == endSheet)
			return [startSheet];
		var bStart = false;
		var sheets = [];
		for(var i = 0; i < this.doc._sheets.length; i++) {
			var sheet = this.doc._sheets[i];
			if (bStart) {
				sheets.push(sheet._name);
				if ( sheet._name == startSheet || sheet._name == endSheet) {
					break;
				}
				continue;
			}
			if ( sheet._name == startSheet || sheet._name == endSheet) {
				bStart = true;
				sheets.push(sheet._name);
			}
		}
		return sheets;
	}
});

