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

dojo.provide("websheet.widget._SelectRectangle");
dojo.provide("websheet.test.stubs.widget.SelectRect");

dojo.declare("websheet.widget._SelectRectangle", null, {
	_row: 2,
    _col:2,
    _borderWidth: 2,
    
    focusRow:0,
	focusCol:1,
    
	getFocusCellAddress: function()
	{
		var parsedCellRef = {};
		parsedCellRef.sheet = "Sheet1";
		parsedCellRef.row = this._row;
		parsedCellRef.column = this._col;//index
		return parsedCellRef;
	},
	
	getRangeInfo: function()
	{
		return {sheetName:"Sheet1",
				startRow:2,
				startCol:2,
				endRow:5,
				endCol:4};
	},
	
	getSelectedRangeAddress: function()
	{
		return "A1:B2";
	},
	
	getExpandedRangeInfo: function()
	{
		return this.getRangeInfo();
	},
	
	render: function()
	{
		
	},
	
	hide: function(){},
	
	setBorderWidth: function(width)
	{
		this._borderWidth = width;
	},
	
	setBorderColor: function()
	{
		
	},
	setBorderStyle : function()
	{
		
	},
	selectRange: function()
	{
		
	},
	getSelectType:function(){
		return websheet.Constant.Range;
	}
});