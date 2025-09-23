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

dojo.provide("websheet.model.RecoverManager");

dojo.declare("websheet.model.RecoverManager",null,{
	
	_sheets: null, // this is a map which stores the deleted sheets info: reference list, sheet model and  id meta
	doc: null,
	
	 constructor: function(doc)
	 {
		 this.doc = doc;
		 this._sheets = {};
	 },
	 
	 getDeletedSheetInfo: function(uuid)
	 {
		 var info = this._sheets[uuid];
		 if(!info)
		 {
			 info = this._sheets[uuid] = {};
		 }
		 return info;
	 },
	 
	 /* clear */
	 clear: function(uuid)
	 {
		 this._sheets[uuid] = undefined;
		 delete this._sheets[uuid];
	 },
	 
	 addDltSheetInfo: function(uuid,info)
	 {
		 if(uuid && info)
			 this._sheets[uuid] = info;
	 },
	 
	 backupAreaMaps: function( areaMap, uuid)
	 {
		 var sheetInfo = this.getDeletedSheetInfo(uuid);
		 sheetInfo.areaMap = areaMap;
	 },
	 
	 /*
	  * backup the sheet model and meta in idmanager
	  */
	 backupSheet: function(sheet,meta,uuid)
	 {
		 if(!uuid) return;
		 var sheetInfo = this.getDeletedSheetInfo(uuid);
		 sheetInfo.sheet = sheet;
		 sheetInfo.meta = meta; 
	 },
	 
	/*
	 * recover the deleted sheet
	 * recoverSheet()
	 */
	recoverSheet: function(uuid,sheetName,index)
	{
		if(!uuid) return;
		var sheetInfo = this._sheets[uuid];
		//error happens
		if(!sheetInfo)
		{
			window.location.reload();
			return;
		}
		var sheetModle = sheetInfo.sheet;
		sheetModle.rename(sheetName);
		var sheetId = sheetModle._id;
		
		var mHelper = websheet.model.ModelHelper;
		var docObj = mHelper.getDocumentObj();
		var partialManager = mHelper.getPartialManager();
		var bComplete = partialManager.isComplete(sheetId);
		// recover the sheet meta in idManager
		var IDManager = docObj._getIDManager();
		IDManager.insertSheetAtIndex(index - 1, sheetId, sheetName);
		IDManager.recoverSheet(sheetInfo.meta,sheetId);

		sheetModle.setSheetVisibility("visible");
		// recover the sheet model
		this.doc._sheets.splice(index - 1, 0, sheetModle);
		
		//TODO: following cell dirty 24219
		if(!bComplete)
		{
			partialManager.setNotComplete(sheetId);
		}
		else{
			
			//for formula cells if there is one cell is dirty(impact by the cells in other existing sheet)
			//then set all the formula cells dirty and calc by calculate manager, because we can not tell which cells might be impact
			var formulaCells = [];
			var bDirty = false;
			var rows = sheetModle.getRows();
			dojo.forEach(rows, function (row) {
				var cells = row._valueCells;
				for (var i = 0; i < cells.length; ++i) {
					var cell = cells[i];
					if (cell && cell.isFormula()){
						if(cell._isDirty){
							bDirty = true;//first encounter the dirty cell
						}else if(bDirty){
							cell._isDirty = true;//the cells after the first dirty cells are change to dirty
							cell._isUnCalc = true;
						}else{
							formulaCells.push(cell);//before find the first dirty cell
						}
					}
				}
				var size = formulaCells.length;
				if(bDirty){
					for(var i = 0; i < size; i++){
						cell = formulaCells[i];
						cell._isDirty = true;
						cell._isUnCalc = true;
					}
				}
			});
		}
	}
});