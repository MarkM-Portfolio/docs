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

dojo.provide("websheet.grid.DataGrid");
dojo.provide("websheet.test.stubs.grid.DataGrid");

var websheet_DataGrid = {
	selection : {
		selector: function()
		{
			return new websheet.widget._SelectRectangle();
		},
		picker: function()
		{
			return { subscribe: function(){}};
		},
		doCellFocus:function()
		{
			
		},
	},
	
	getSheetName: function() {
		return "Sheet1";
	},
	
	setValue: function(){
		
	},
	
	updateRow: function (rowIndex) {
		
	}
};

dojo.declare("websheet.grid.DataGrid", null,websheet_DataGrid);
delete websheet_DataGrid;