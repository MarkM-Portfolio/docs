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

dojo.provide("websheet.test.stubs.parse.Reference");
dojo.provide("websheet.parse.Reference");

dojo.declare("websheet.parse.Reference", websheet.functions.Reference, {

	constructor: function(base) {
		this.rows = [];
		this.cols = [];
		this.lists = [];
	},
	
	/**
	 * get Range address with sheetname(or not, according to withSheetName)
	 *  and with semicolon(or not, according to bSimple) for single cell if bUserDefine = true
	 *  
	 */
	getAddress:function(bMSFormat, refMask)
	{
		var rangeInfo = this._getRangeInfo();
		
		// get sheet name
		var sheetName = withSheetName ? "Sheet1" : null;
		
		var startCol = rangeInfo.startCol;
		var startRow = rangeInfo.startRow;
		var endCol = rangeInfo.endCol;
		var endRow = rangeInfo.endRow;
		
		var type = this.getType();
		if (type == websheet.Constant.RangeType.INVALID)
			type == websheet.Constant.RangeType.CELL;
		var params = {refMask: refMask};
		var address = websheet.Helper.getAddressByIndex(sheetName, startRow, startCol, null, endRow, endCol, params);
		return address;
	},
	
	addListener:function(listener)
	{
		if(listener != null)
			this._list.push(listener);
	}

});
