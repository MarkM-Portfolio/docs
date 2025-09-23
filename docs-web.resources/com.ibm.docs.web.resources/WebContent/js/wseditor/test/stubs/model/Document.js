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

dojo.provide("websheet.test.stubs.model.Document");
dojo.require("websheet.model.RecoverManager");
dojo.require("websheet.model.PartialCalcManager");
dojo.require("websheet.model.PartialManager");
dojo.require("websheet.CalcManager");
dojo.provide("websheet.model.Document");

dojo.declare("websheet.model.Document", websheet.functions.Document, {
	
	_idManager: null,
	
	CellType: websheet.Constant.CellType,
	
	_sheets: null,
	
	_sheetsByName: null,
	
	maxSheetRows: 10000,							// the max rw in sheet 
	
	/*void*/constructor: function(args) {
		utils.bindDocument(this);
		this.partialLevel = websheet.Constant.PartialLevel.ALL;
		this._idManager = new websheet.model.IDManager();
		this._idManager.setDocument(this);
		this._styleManager = new websheet.style.StyleManager();
		this._styleManager._dcs = websheet.style.DefaultStyleCode
			= this._styleManager.styleMap[websheet.Constant.Style.DEFAULT_CELL_STYLE]
			= builders.style().defaultStyle().finish();
		this._styleManager._hashCodeIdMap = {};
		this._styleManager.styleMap = {};
		this._mhelper = websheet.model.ModelHelper;
		this._taskMgr = websheet.TaskManager;
		this._calcManager = new websheet.CalcManager();
		this._partialCalcManager = new websheet.model.PartialCalcManager();
		this._partialManager = new websheet.model.PartialManager();
		this._sheets = [];
		this._sheetsByName = {};
		this._taskMgr = websheet.TaskManager;
	},
	
	/*StyleManager*/_getStyleManager:function(){
		return this._styleManager;
	},
	
	/*Sheet*/getSheet:function(sheetName){
		return this._sheetsByName[sheetName];
	},
	
	/*Sheet*/ _createSheet: function(sheetName, sheetId, index, sort, meta) {
		if (sheetId == null) {
			sheetId = "st" + this._sheets.length;
		}
		if (sheetName == null) {
			sheetName = sheetId;
		}
		var sheet = new websheet.model.Sheet(this, sheetId, sheetName, meta);
		if(index > 0 && index <= this._sheets.length) {
			this._sheets.splice(index-1, 0, sheet);
		}
		this._sheets.push(sheet);
		this._sheetsByName[sheetName] = sheet;
		return sheet;
	},
	
	getOrCreateValueCell:function(sheetName, rowIndex, colIndex, rawValue, bCreate) {
		var sheet = this._sheetsByName[sheetName];
		if (!sheet){
			if(bCreate)
				sheet = this._createSheet(sheetName);
			else
				return null;
		} 
		var row = sheet._rows[rowIndex];
		if (!row){
			if(bCreate)
				row = sheet._createRow(rowIndex);
			else
				return null;
		}
		var cell = row.getCell(colIndex);
		if (!cell){
			if(bCreate)
				cell = row._createCell(colIndex);
			else
				return null;
		}
		cell.setRawValue(rawValue, true);
		return cell;
	},
	
	_getIDManager: function() {
		return this._idManager;
	},
	
	getAreaManager: function(broadcaster) {
		if(!this._areaManager){
			this._areaManager = new websheet.parse.AreaManager(this);
			if(broadcaster)
				this._areaManager.startListening(broadcaster);
		}
		return this._areaManager;
	},
	
	getAreaListener:function(area){
		return null;
	},
	
	getSheetId: function(name) {
		return "os1";
	},
	
	getSheetById: function(name) {
		return "os1";
	},
	
	clear: function() {
		this._sheets = [];
		this._sheetsByName = {};
		this._mhelper.docObj = null;
		this._areaManager = null;
	},
	
	removeRulesObjByUsage: function(){
		
	},
	
	addRulesObjByUsage: function(dataValiation){
		
	},
	
	renameRulesObjByUsage: function(){
		
	},
	
	filterRows: function(sheetName,rows, bFilter)
	{
		
	},
	
	isSheetProtected: function()
	{
		return false;
	},
	
	getRecoverManager: function()
	{
		if (!this._recoverManager) {
			this._recoverManager = new websheet.model.RecoverManager(this);
		}
		return this._recoverManager;
	},
	
	getCell:function(sheetName,rowIndex,/*integer*/colIndex,/*websheet.Constant.CellType*/cellType, followStyle){
		var sheet = this.getSheet(sheetName);
		if(!sheet)
			return null;
		var cell = sheet.getCell(rowIndex,colIndex,cellType,followStyle);
		return cell;
	},
	
	setCell: function(sheetName, rowIndex, /*integer*/colIndex, cellJson, userId, bReplace, mode, bInheritFormat) {
		var sheet = this.getSheet(sheetName);
		sheet.setCell(rowIndex, colIndex, cellJson, userId, bReplace, mode, bInheritFormat);
	},
	
	getColumn:function(sheetName,colIndex,followStyle){
		var sheet = this.getSheet(sheetName);
		return sheet.getColumn(colIndex,followStyle);
	},
	
	getSheetNameRanges:function(startName, endName) {
		if(!startName && !endName) {
			var sheets = [];
			for(var i = 0; i < this._sheets.length; i++) {
				sheets[i] = this._sheets[i].getSheetName();
			}
			return sheets;
		}
		return this._idManager.getSheetNameRanges(startName, endName);
	}
});
