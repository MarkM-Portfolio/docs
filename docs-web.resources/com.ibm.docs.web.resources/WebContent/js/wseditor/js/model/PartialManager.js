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

dojo.provide("websheet.model.PartialManager");
dojo.declare("websheet.model.PartialManager",null,{
	_sheetMap:{},//record each sheet loading, "rows" is the array to record which rows have been loaded
	_idMapping:{},//server id is key, client id is value
	_notifyList:[],//when partial loading, some operation might have been postponed,
	partialLevel: websheet.Constant.PartialLevel.ROW,
	constructor: function(partialLevel) {
		this._sheetMap = {};
		this._idMapping = {};
		this._notifyList = [];
		this.partialLevel = partialLevel;		
	},
	init:function(doc, criteria, bJoin)
	{
		if(doc == undefined || doc == null)
			return;
		var partialLevel = this.partialLevel;
		var _id = null;
		if(criteria){
			_id = criteria.sheet;//new added attr after send partial loading request
			//not the real partial row level enabled
			//if the sheet contain too much data(such as > 300 rows)
			//then get the first 100 rows, then get the other part of this sheet,
			//in this case, it contain the "startrow" in criteria
//			var nextRow = doc.nextrow;
//			if(nextRow && partialLevel == websheet.Constant.PartialLevel.SHEET)
//			{
//				partialLevel = websheet.Constant.PartialLevel.ROW;
//				criteria.startrow = 1;
//				criteria.endrow = nextRow - 1;
//			}
		}
		var meta = doc.meta;
		var sheetsArray = meta.sheetsArray;
		var sheets = meta.sheets;
		if(!_id)
			_id = meta.sheetsIdArray[0];
		for(var sheetId in sheets)
		{
			//when join, init _sheetMap
			if(bJoin)
			{
				this._sheetMap[sheetId] = {};
			}
			if(partialLevel == websheet.Constant.PartialLevel.ALL)
				this.setComplete(sheetId);
			else
			{
				var maxRow = sheets[sheetId].maxrow;
				if( sheetId == _id )
				{
					//check if it is completely loading by criteria
					if(partialLevel == websheet.Constant.PartialLevel.ROW)
					{
						if (meta.hasMoreContent) {
							// not completed yet
						} else {
							this.setComplete(sheetId);	
						}
					}
					else if(partialLevel == websheet.Constant.PartialLevel.SHEET)
					{
						this.setComplete(sheetId);
					}
				}
				else if (maxRow == undefined || maxRow == 0)
				{
					this.setComplete(sheetId);
				}
			}
		}
	},
	
	//set the server id and client id mapping
	_setMapping:function(sId, cId)//type and sheetId in case the row/col id are duplicate in different sheet
	{
		this._idMapping[sId] = cId;
	},
	
	//get the client id by server id
	_getMapping:function(sId)
	{
		var id = this._idMapping[sId];
		if(!id)
			id = sId;
		return id;
	},
	
	//each time for partial loading should clear the mapping table first
	_clearMapping:function()
	{
		this._idMapping = {};
	},
	
	setComplete:function(sheetId)
	{
		var sheet = this._sheetMap[sheetId];
		if(!sheet){
			sheet = {};
			this._sheetMap[sheetId] = sheet;
		}
		sheet.isComplete = true;
	},
	
	setNotComplete: function(sheetId)
	{
		var sheet = this._sheetMap[sheetId];
		if(sheet)
			sheet.isComplete = false;
	},
	
	isComplete:function(sheetId)
	{
		var sheet = this._sheetMap[sheetId];
		if(sheet)
			return sheet.isComplete;
		return false;//??if not in _sheetMap, means the sheet might generate when co-editing?
	},
	
	//hitch obj.methodStr with params as args of this function
	addNotify:function(method){
		this._notifyList.push(method);
	},
	
	notify:function(){
		var length = this._notifyList.length;
		for(var i=0; i<length; i++){
			var notify = this._notifyList[i];
			if(notify){
				notify();
			}
		}
		this._notifyList.splice(0, length);
//		delete this._notifyList;
//		this._notifyList = [];
	},
	//according to partial level in config,
	//generate criteria when call session.getPatial
	//return null means that do not need partial loading because it has already been loaded
	//as row level, the rowCnt in criteria does not necessary equal to partial row count
	getPartialCriteria:function(sheetId, visibleStartRow, visibleEndRow)
	{
		if (this.partialLevel == websheet.Constant.PartialLevel.ALL) {
			return null;
		} else {
			if(this.isComplete(sheetId)) {
				return null;
			}
			var criteria = {};
			criteria.sheet = sheetId;
			if(this.partialLevel == websheet.Constant.PartialLevel.ROW) {
				if (visibleStartRow != null) {
					criteria["startrow"] = visibleStartRow;
					if (visibleEndRow != null) {
						criteria["endrow"] = visibleEndRow;
					}
				}
			}
			return criteria;
		}
	}
});