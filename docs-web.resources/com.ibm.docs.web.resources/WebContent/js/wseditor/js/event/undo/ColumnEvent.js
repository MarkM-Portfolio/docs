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

dojo.provide("websheet.event.undo.ColumnEvent");

dojo.declare("websheet.event.undo.ColumnEvent", websheet.event.undo.RowEvent, {
	_type: null,

	constructor: function(jsonEvent, idManager)
	{
		this._type = websheet.Constant.DATA_TYPE.NONE;
		
		if (jsonEvent.data) {
			var data = jsonEvent.data;
			if (data.rows) {
				this._needCheckFormula = true;
				this._type = websheet.Constant.DATA_TYPE.MAP;
			}
			if (data.style != null || data[websheet.Constant.Style.WIDTH] != null) {
				this._type = websheet.Constant.DATA_TYPE.MAP;
			}
		}
	},
	
	/*
	 * should be override by the insert column event
	 */
	addColsId2Cache: function(colId,colIndex)
	{
		
	},
	
	getColIndex: function(colId)
	{
		// the undo event of delete
		var colIndex = -1;
		if(this.action == websheet.Constant.Event.ACTION_INSERT)
		{
			colIndex = this._getColIndex(colId);
		}else{
			var sheetId = this.refTokenId._sheetId;
			colIndex = this._idManager.getColIndexById(sheetId,colId);
			if(colIndex >= 0 ) colIndex++;
		}
		return colIndex;
	},
	
	getColRangeIndex: function()
	{
		var idRange = this.refTokenId.getIdRange();
		var sheetId = this.refTokenId.getSheetId();
		var colRangeIndex = [];
		for(var i = 0 ; i < idRange.length; i++)
		{
			var cIndex = this._idManager.getColIndexById(sheetId,idRange[i]);
			if(cIndex != -1) cIndex++;
			colRangeIndex.push(cIndex);
		}
		return colRangeIndex;
	}
});