dojo.provide('websheet.JsProxyModel.IDManager');

dojo.declare("websheet.JsProxyModel.IDManager", websheet.functions.IDManager, {
	_javaIDManager : null, // com.ibm.concord.spreadsheet.document.oomodel.impl.IDManager
	
	constructor: function(jim)
	{
		this._javaIDManager = jim;
	},
	
	getSheetIdBySheetName: function(sheetName)
	{
		var sheet = this._javaIDManager.getSheetNameMapSync().getSync(sheetName);
		if(sheet)
			return sheet.getIdSync();
		return null;
	},
	
	getSheetIndexById: function(id)
	{
		var sheet = this._javaIDManager.getSheetIdMapSync().getSync(id);
		if(sheet)
			return sheet.getIndexSync();
		return -1;
	},
	
	getSheetNameById: function(id)
	{
		var sheet = this._javaIDManager.getSheetIdMapSync().getSync(id);
		if(sheet)
			return sheet.getSheetNameSync();
		return null;
	},
	
	getColIdByIndex:function(sheetId, colIndex, bCreate)
	{
		if(!sheetId || (colIndex == null) || (colIndex == undefined) || (colIndex < 0) || isNaN(colIndex))
			return null;
		return this._javaIDManager.getColIdByIndexSync(sheetId, colIndex, bCreate);
	},
	
	getRowIdByIndex:function(sheetId, rowIndex, bCreate, bMax)
	{
		if(!sheetId || (rowIndex == null) || (rowIndex == undefined) || (rowIndex < 0))
			return null;
		if(bMax !== true)
			bMax = false;
		return this._javaIDManager.getRowIdByIndexSync(sheetId, rowIndex, bCreate, bMax);
	},
	
	getColIndexById:function(sheetId, colId)
	{
		if(!sheetId || !colId)
			return -1;
		return this._javaIDManager.getColIndexByIdSync(sheetId, colId);
	},
	
	getRowIndexById:function(sheetId, rowId)
	{
		if(!sheetId || !rowId)
			return -1;
		return this._javaIDManager.getRowIndexByIdSync(sheetId, rowId);
	}
	
});
