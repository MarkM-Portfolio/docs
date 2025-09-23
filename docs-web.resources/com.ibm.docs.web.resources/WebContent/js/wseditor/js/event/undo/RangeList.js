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

/***
 * Range Map of all the range model(except range model referenced by formula)
 * Include Collaboration object and unname/name range
 */
dojo.provide("websheet.event.undo.RangeList");
dojo.require("websheet.Helper");
dojo.require("websheet.Constant");
dojo.require("websheet.listener.Listener");
dojo.require("websheet.event.undo.Range3D");
dojo.declare("websheet.event.undo.RangeList",websheet.listener.Listener,{
	//store range model by sheet, key is sheetId
	//each sheet contains row map and col map with row/col id as key
	_Map : null,
	_idManager: null,
	_bDelete: true,
	_maxIndex:	0,	//for range id
	_usageMap: null,	//have the same content with _Map, but store by usage
	//so that we can easily get the ranges by type
	//especially when we support copy/inherited type
	_dltUsageTypeArray: null, // when delete sheet, these usage type ranges need to be delted in _usageMap
	_stUndefind: "stU",
	constructor: function(args) 
	{
		dojo.mixin(this, args);
		this._Map = {};
		this._idManager = websheet.functions.Object.getIDManager();
		if(arguments && arguments.length >= 2)
			this._bDelete = arguments[1];
		this._usageMap = {};
		var RangeUsage = websheet.Constant.RangeUsage;
		this._dltUsageTypeArray = [ RangeUsage.COMMENTS, RangeUsage.FILTER, RangeUsage.IMAGE, RangeUsage.SHAPE, RangeUsage.CHART];
	},
	
	reset: function(idManager)
	{
		if(idManager)
			this._idManager = idManager;
		this._Map = {};
		this._usageMap = {};
	},
	
	/*
	 * generate range id
	 */
	generateId: function()
	{
		return websheet.Constant.IDPrefix.RANGE + this._maxIndex++;
	},
	
	/**************Private********************************/
	//get range set which locate at sheet which id is sheetId 
	//bCreate == true means that if the array does not exist, create a empty array
	_get:function(sheetId, bCreate)
	{
		var idManager = this._idManager;
		var index = idManager.getSheetIndexById(sheetId);
		var sheet  = null;
		//TODO: when clear the map for the invalid sheet
		if(index > -1)
		{
			sheet = this._Map[sheetId];
			
			if(!sheet)
			{
				if(bCreate)
				{
					sheet = {};
					sheet.row = {};//store the range id with the start/end row id as key
					sheet.col = {};//store the range id with the start/end col id as key
					sheet.range = {};//store the range model with the range id as key
					sheet.range3D = {};//store the 3D range model which does not contain row/col id, but index
					this._Map[sheetId] = sheet;
				}
			}
		}
		return sheet;
	},
	/**************Range Management***********************/
	//return the range array of all the document or the specified sheet
	getRanges:function(sheetId)
	{
		var ranges = [];
		if(sheetId)
		{	
			var sheet = this._get(sheetId);
			if(sheet)
			{
				for(var rangeId in sheet.range)
				{
					var range = sheet.range[rangeId];
					ranges.push(range);
				}
			}
		}else
		{
			for( var sheetId in this._Map)
			{
				var sheet = this._get(sheetId);
				if(sheet)
				{
					for(var rangeId in sheet.range)
					{
						var range = sheet.range[rangeId];
						ranges.push(range);
					}
				}
			}
		}
		return ranges;
	},
	
	getRangesByUsage: function(usage, sId){
		if(!usage)
			return null;
		var ranges = [];
		var map = this._usageMap[usage];
		for(var sheetId in map)
		{
			if(sId && sheetId != sId)
				continue;
			var sheet = map[sheetId];
            if(sheet)
			{
				for(var rangeId in sheet)
				{
					var range = sheet[rangeId];
					ranges.push(range);
				}
			}
		}		
		return ranges;
	},
	
	//get range according to range id in sheet with sheetId
	//if sheetId is not given, search in the whole document
	getRange:function(rangeId, sheetId)
	{
		if(rangeId)
		{
			if(sheetId)
			{	
				var sheet = this._get(sheetId);
				if(sheet)
				{
					var range = sheet.range[rangeId];
					if(range)
						return range;
					range = sheet.range3D[rangeId];
					if(range)
						return range;
				}
			}else
			{
				for( var sheetId in this._Map)
				{
					var sheet = this._get(sheetId);
					if(sheet)
					{
						var range = sheet.range[rangeId];
						if(range)
							return range;
						range = sheet.range3D[rangeId];
						if(range)
							return range;
					}
				}
			}
		}
		return null;
	},
	//get the range by rangeId and usage which should get from _usageMap
	getRangeByUsage:function(rangeId, usage)
	{
		if(!usage || !rangeId)
			return null;
		if(usage == websheet.Constant.RangeUsage.NAME)
			rangeId = rangeId.toLowerCase();
		var map = this._usageMap[usage];
		for(var sheetId in map)
		{
			var sheet = map[sheetId];
			if(sheet[rangeId])
				return sheet[rangeId];
		}
		return null;
	},
	//add range according to the range address
	addRange:function(rangeModel)
	{
		if(rangeModel.is3D()) {
			var id = rangeModel.rangeId;
			var sheet = this._get(rangeModel._sheetId, true);
			if(sheet)
				sheet.range3D[id] = rangeModel;
			sheet = this._get(rangeModel._endSheetId, true);
			if (sheet)
				sheet.range3D[id] = rangeModel;
		} else {
		var sheet = this._get(rangeModel._sheetId, true);
		if(sheet)
		{
			var id = rangeModel.rangeId;
			if(id)
				sheet.range[id] = rangeModel;
			var sRId = rangeModel._startRowId;
			var eRId = rangeModel._endRowId;
			var sCId = rangeModel._startColId;
			var eCId = rangeModel._endColId;
			if(sRId)
			{
				var list = sheet.row[sRId];
				if(!list)
				{
					list = [];
					sheet.row[sRId] = list;
				}
				list.push(id);
			}
			if(eRId)
			{
				if(eRId != sRId)
				{
					var list = sheet.row[eRId];
					if(!list)
					{
						list = [];
						sheet.row[eRId] = list;
					}
					list.push(id);
				}
			}
			if(sCId)
			{
				var list = sheet.col[sCId];
				if(!list)
				{
					list = [];
					sheet.col[sCId] = list;
				}
				list.push(id);
			}
			if(eCId)
			{
				if(eCId != sCId)
				{
					var list = sheet.col[eCId];
					if(!list)
					{
						list = [];
						sheet.col[eCId] = list;
					}
					list.push(id);
				}
			}
		}
		}
		//update _usageMap, no matter the sheet is exist or not
		//because the sheet might be delete by other client
		//but the name range should still be there
		if(rangeModel){
			var usage = rangeModel.usage;
			if(!usage)
				return;
			var sheetId = rangeModel._sheetId;
			if(!sheetId)
				sheetId = this._stUndefind;
			var id = rangeModel.rangeId;
			var map = this._usageMap[usage];
			if(!map){
				map = {};
				this._usageMap[usage] = map;
			}
			var rMap = map[sheetId];
			if(!rMap){
				rMap = {};
				map[sheetId] = rMap;
			}
			rMap[id] = rangeModel;
		}
	},
	deleteRange:function(rangeModel)
	{
		if(rangeModel.is3D()) {
			var id = rangeModel.rangeId;
			var sheet = this._get(rangeModel._sheetId);
			if(sheet) {
				delete sheet.range3D[id];
			}
			sheet = this._get(rangeModel._endSheetId);
			if(sheet) {
				delete sheet.range3D[id];
			}
		} else {
		var sheet = this._get(rangeModel._sheetId);
		if(sheet)
		{
			var id = rangeModel.rangeId;
			if(id)
				delete sheet.range[id];
			var sRId = rangeModel._startRowId;
			var eRId = rangeModel._endRowId;
			var sCId = rangeModel._startColId;
			var eCId = rangeModel._endColId;
			if(sRId)
			{
				var list = sheet.row[sRId];
				if(list)
				{
					for(var i=0;i<list.length;i++)
					{
						if(list[i] == id)
						{
							list.splice(i,1);
							break;
						}
					}
				}
			}
			if(eRId)
			{
				if(eRId != sRId)
				{
					var list = sheet.row[eRId];
					if(list)
					{
						for(var i=0;i<list.length;i++)
						{
							if(list[i] == id)
							{
								list.splice(i,1);
								break;
							}
						}
					}
				}
			}
			if(sCId)
			{
				var list = sheet.col[sCId];
				if(list)
				{
					for(var i=0;i<list.length;i++)
					{
						if(list[i] == id)
						{
							list.splice(i,1);
							break;
						}
					}
				}
			}
			if(eCId)
			{
				if(eCId != sCId)
				{
					var list = sheet.col[eCId];
					if(list)
					{
						for(var i=0;i<list.length;i++)
						{
							if(list[i] == id)
							{
								list.splice(i,1);
								break;
							}
						}
					}
				}
			}
		}
		}
		//always delete range from _usageMap
		//delete it from _usageMap
		//no matter the sheet is exist or not
//		if(bDeleteUsage)
		{
			var usage = rangeModel.usage;
			if(!usage)
				return;
			var map = this._usageMap[usage];
			if(map){
				var sheetId = rangeModel._sheetId;
				if(!sheetId)
					sheetId = this._stUndefind;
				var rMap = map[sheetId];
				if(rMap){
					var id = rangeModel.rangeId;
					delete rMap[id];
				}
			}
		}
	},
	
	/*
	 * delete the ranges in usage map 
	 */
	dltUnUsedRangesInUsageMap: function(sheetId)
	{
		if(!this._dltUsageTypeArray) return;
		var size = 	this._dltUsageTypeArray.length;
		for(var i = 0 ; i < size; i++)
		{
			var usage = this._dltUsageTypeArray[i];
			var map = this._usageMap[usage];
			if(map)
				delete map[sheetId];
		}			
	},
	
	/**
	 * before delete action(cuased by undo), collect impact comments
	 * @param event
	 * @returns
	 */
	getImpactComments4DeleteUndo:function(event)
	{
		if(event._type == websheet.Constant.EventType.DataChange)
		{
			var s = event._source;
			if(s.action == websheet.Constant.DataChange.PREDELETE)
			{
				if(!event._data)
					event._data = {};
				//event._data.cmts might already collected when broadcast preDelete event
				//which will call this.preDelete(s, false, event)
				if(!event._data.cmts){
					this.preDelete(s, true, event);//bNotModify = true;
				}
				return event._data.cmts;
			}
		}
		return null;
	},
	
	//listening for inserting row/column event
	//when insert first row/column, the range with column/row range type should change their startRow/startCol id
	// and should also attach to the corresponding row/column id list
	insert:function(event)
	{
		if(event && (event.refType == websheet.Constant.OPType.COLUMN ||
				event.refType == websheet.Constant.OPType.ROW)){
			var parsedRef = event.refValue;
			var sheetName = parsedRef.sheetName;
			var sheetId = this._idManager.getSheetIdBySheetName(sheetName);
			var sheet = this._get(sheetId);
			if(sheet)
			{
				var sIndex;
				if(event.refType == websheet.Constant.OPType.COLUMN)
				{
					sIndex = parsedRef.startCol;
				}else
				{
					sIndex = parsedRef.startRow;
				}
				if(sIndex == 1)//insert first row/column
				{
					var maxRef = websheet.Constant.MAXREF;
					var list = [];
					var testType = websheet.Constant.RangeType.ROW;
					var firstId;
					if(event.refType == websheet.Constant.OPType.ROW)
					{
						list = sheet.row[maxRef];
						testType = websheet.Constant.RangeType.COLUMN;
						firstId = this._idManager.getRowIdByIndex(sheetId, 0, true);
					}else
					{
						list = sheet.col[maxRef];
						firstId = this._idManager.getColIdByIndex(sheetId, 0, true);
					}
					//search from M 
					if(list)
					{
						var length = list.length;
						for(var j=0; j < length;j++)
						{
							var id = list[j];
							var rangeModel = sheet.range[id];
							if(rangeModel._type == testType || rangeModel._typeBak == testType)
							{
								var os = null;
								if(testType == websheet.Constant.RangeType.COLUMN)
								{
									os = rangeModel._startRowId;
									rangeModel._startRowId = firstId;
								}else
								{
									os = rangeModel._startColId;
									rangeModel._startColId = firstId;
								}
								
								//change the start row/col id with the first new row/col id
								//and end id should not change which is "M"
								this.modifyRange(sheet, id, event.refType, os, firstId, "", "");
							}
						}
					}
				}
			}
		} 
	},
	
	//bNotModify=true, means that do not modify any ranges
	preDelete:function(event, bNotModify, notifyEvent)
	{
		var sheetName;
		if(event.refType == websheet.Constant.OPType.COLUMN ||
				event.refType == websheet.Constant.OPType.ROW) {
			var parsedRef = event.refValue;
			sheetName = parsedRef.sheetName;
		} if(event.refType == websheet.Constant.OPType.SHEET) {
			sheetName = event.refValue;
		}
		var sheetId = this._idManager.getSheetIdBySheetName(sheetName);
		var sheet = this._get(sheetId);
		if(sheet)
		{
			if(event.refType == websheet.Constant.OPType.COLUMN ||
					event.refType == websheet.Constant.OPType.ROW)
			{
				var sIndex, eIndex;
				if(event.refType == websheet.Constant.OPType.COLUMN)
				{
					sIndex = parsedRef.startCol;
					eIndex = parsedRef.endCol;
				}else
				{
					sIndex = parsedRef.startRow;
					eIndex = parsedRef.endRow;
				}
				if(sIndex > eIndex)
				{
					var i = eIndex;
					eIndex = sIndex;
					sIndex = i;
				}
				sIndex--;
				eIndex--;
				for(var i=sIndex; i<=eIndex; i++)
				{
					var rid = null;
					if(event.refType == websheet.Constant.OPType.ROW)
						rid = this._idManager.getRowIdByIndex(sheetId, i);
					else
						rid = this._idManager.getColIdByIndex(sheetId, i);
					if(rid)
					{
						var list = [];
						if(event.refType == websheet.Constant.OPType.ROW)
							list = sheet.row[rid];
						else
							list = sheet.col[rid];
						if(list)
						{
							for(var j=list.length-1; j>=0;j--)
							{
								var id = list[j];
								var rangeModel = sheet.range[id];
								this._changeByType(rangeModel, event, sheetId, sIndex, eIndex, bNotModify, notifyEvent);
							}
							if(!bNotModify)
							{
								//TODO check if the sheet.row[rid].length == 0
								if(event.refType == websheet.Constant.OPType.ROW)
								{
									delete sheet.row[rid];
								}else
								{
									delete sheet.col[rid];
								}
							}
						}
					}
				}
			}else if(event.refType == websheet.Constant.OPType.SHEET)
			{
				//set the range to invalid, and set sheet name to #REF!
				if(this._bDelete)
				{
					for(var id in sheet.range)
					{
						var rangeModel = sheet.range[id];
						if(rangeModel)
						{
							//should be called before setInvalidSheetName
							this._addPredeleteRange(notifyEvent, null, rangeModel);//bChangeId must be true
							if(!bNotModify)
								rangeModel.setInvalidSheetName();
						}
					}
					if(!bNotModify)
					{
						delete this._Map[sheetId];
						this.dltUnUsedRangesInUsageMap(sheetId);
					}
				}
				/*
				for(var id in sheet.range3D) {
					var range = sheet.range3D[id];
					if(sheetId == range._sheetId || sheetId == range._endSheetId) {
						var sheetIds = this._idManager.getSheetIdRanges(range._sheetId, range._endSheetId);
						var newSheet;
						if(sheetId == range._sheetId) {
							newSheetId = range._sheetId = sheetIds[1];
						} else {
							newSheetId = range._endSheetId = sheetIds[sheetIds.length - 2];
						}
						if(range._sheetId == range._endSheetId) {
							this._modify3DRefTo2D(range);
						} else if (newSheetId){
							// insert to new Sheet
							var newSheet = this._get(newSheetId, true);
							newSheet.range3D[id] = range;
						}
					}
				}
				sheet.range3D = {};
				*/
			}
		}
	},
	/*
	_modify3DRefTo2D: function(range) 
	{
		// delete from range3D map, because it is not 3D range anymore
		var newSheet = this._get(range._sheetId);
		if(newSheet) {
			delete newSheet.range3D[range.rangeId];
		}
		// should change to 2d range
		range = new websheet.event.undo.Range(range.getAddress(),null,this._idManager);
		this.addRange(range);
	},
	*/
	//for predelete event, delete the row/column from sIndex to eIndex
	//then modify the range according to the range type
	//and should delete the range from sheet.range list when it does not need to exist.
	_changeByType:function(rangeModel, event, sheetId, sIndex, eIndex, bNotModify, notifyEvent)
	{
		if(rangeModel)
		{
			var id = rangeModel.rangeId;;
			var result = rangeModel._getRangeInfo();
			var start = result.startRow - 1;
			var end = result.endRow - 1;
			var startId = rangeModel._startRowId;
			var endId = rangeModel._endRowId;
			if(event.refType == websheet.Constant.OPType.COLUMN)
			{
				start = result.startCol - 1;
				end = result.endCol - 1;
				startId = rangeModel._startColId;
				endId = rangeModel._endColId;
			}
			var usage = rangeModel.usage;
			var bChangeStartId = false;
			var bChangeEndId = false;
			if((sIndex <= start) && (eIndex >= end))
			{
				bChangeStartId = true;
				bChangeEndId = true;
				start = -1;
				end = -1;
			}else if((sIndex <= start) && (eIndex >= start))
			{
				bChangeStartId = true;
				start = eIndex+1;
			}else if((sIndex <= end) && (eIndex >= end))
			{
				bChangeEndId = true;
				end = sIndex-1;
			}
			if(bChangeStartId || bChangeEndId)
			{
				//record the old id
				var os = startId;
				var oe = endId;
				//should be called before modifyRange
				this._addPredeleteRange(notifyEvent, result, rangeModel);
				if(!bNotModify)
				{
					//if the rangeModel has ussage, such as names, image, then whatever the new id is ,need to change it
					var bChange = rangeModel.usage ? true: false; 
					if(bChangeStartId)
					{
						//if start == -1, getRowIdByIndex will return null, 
						//which will delete the sheet.row[oldStartId] in this._map when call modifyRange
						if(event.refType == websheet.Constant.OPType.ROW){
							startId = this._idManager.getRowIdByIndex(sheetId, start, true);
							//if startId is null, means that this row has been delete from model as well as idmanager
							//then do not change startId here, because when delete undo, this id might be recovered
							if(startId != null || bChange)
								rangeModel._startRowId = startId;
						}else{
							startId = this._idManager.getColIdByIndex(sheetId, start, true);
							if(startId != null || bChange)
								rangeModel._startColId = startId;
						}
					}else
						startId = "";//no change
					if(bChangeEndId)
					{
						if(event.refType == websheet.Constant.OPType.ROW){
							if(end == start && bChangeStartId)
								endId = startId;
							else
								endId = this._idManager.getRowIdByIndex(sheetId, end, true);
							if(endId != null || bChange)
								rangeModel._endRowId = endId;
						}else{
							if(end == start && bChangeStartId)
								endId = startId;
							else
								endId = this._idManager.getColIdByIndex(sheetId, end, true);
							if(endId != null || bChange)
								rangeModel._endColId = endId;
						}
					}else
						endId = "";//no change
					if(startId == null || endId == null){
						if(rangeModel._type != websheet.Constant.RangeType.INVALID){
							rangeModel._typeBak = rangeModel._type;
							rangeModel._type = websheet.Constant.RangeType.INVALID;
						}
					}
					this.modifyRange(this._Map[sheetId],id,event.refType,os, startId, oe, endId);
				}
			}
		}
	},
	
	//do nothing in RangeList, and inherited it in ReferenceList
	_addPredeleteRange:function(event, rangeInfo, rangeModel)
	{
		var usage = rangeModel.usage;
		if(usage == websheet.Constant.RangeUsage.COMMENTS)
		{
			if(!event._data)
				event._data = {};
			if(!event._data.cmts)
				event._data.cmts = {};
			event._data.cmts[rangeModel.rangeId] = rangeModel.getAddress();
		}	
	},
	
	_getPredeleteRange:function(event, rangeInfo, rangeModel)
	{
		var id = rangeModel.getRangeId(true);
		var range = {};
		range.rangeid = id;
		range.model = rangeModel;
		//only the range has usage, put the old range address info 
		//otherwise it must be reference which just need the model to get the impact cells
		if(rangeModel.usage){
			range.usage = rangeModel.usage;
			if(!rangeInfo)
				rangeInfo = rangeModel._getRangeInfo();
			//the address must be the old address before delete
			var params = {refMask: rangeModel._refMask, invalidRef:true};
			var address = websheet.Helper.getAddressByIndex(rangeInfo.sheetName, 
					rangeInfo.startRow, rangeInfo.startCol, rangeInfo.endSheetName, rangeInfo.endRow, rangeInfo.endCol, params);
			range.address = address;
		}
		return range;
	},
	
	//update the range address according to the usage
	//if no usage given, this method is useless
	updateRangeByUsage: function (refValue, rangeId, usage)
	{
		if(usage == websheet.Constant.RangeUsage.NAME)
			rangeId = rangeId.toLowerCase();
		var range = this.getRangeByUsage(rangeId, usage);
		if(range){
			var oSheetId = range._sheetId;
			var osr = range._startRowId;
			var osc = range._startColId;
			var oer = range._endRowId;
			var oec = range._endColId;
			var parsedRef = refValue;
			if(dojo.isString(refValue))
			{
				parsedRef = websheet.Helper.parseRef(refValue);
			}
			var bPre3D = range.is3D();
			var bNext3D = (parsedRef && parsedRef.is3D());
			if (bPre3D || bNext3D){
				this.deleteRange(range);
				if(bNext3D)
					range = new websheet.event.undo.Range3D(parsedRef,this._idManager);
				else
					range = new websheet.event.undo.Range(parsedRef,null,this._idManager);
				this.addRange(range);
				return range;
			}
			range.updateAddress(parsedRef);
			var nsr = range._startRowId;
			var nsc = range._startColId;
			var ner = range._endRowId;
			var nec = range._endColId;
			var sheet = this._get(range._sheetId, true);
			if(sheet && sheet.range[rangeId]){
				//update row / column
				this.modifyRange(sheet, rangeId, websheet.Constant.OPType.ROW, osr, nsr, oer, ner);
				this.modifyRange(sheet, rangeId, websheet.Constant.OPType.COLUMN, osc, nsc, oec, nec);
			}else
				this.addRange(range);
			//if the old sheet id is different with new sheet id
			//this will happen when client A delete sheet then undo,
			//then in client B, the sheet might not recover the old sheet id
			if(oSheetId != range._sheetId){
				//update _usageMap
				var map = this._usageMap[usage];
				//delete this range from old sheet id in usage map
				var usageSheet = map[oSheetId];
				if(usageSheet && usageSheet[rangeId])
					delete usageSheet[rangeId];
				//add this range to the new sheet id in usage map
				usageSheet = map[range._sheetId];
				if(!usageSheet){
					usageSheet = {};
					map[range._sheetId] = usageSheet;
				}
				usageSheet[rangeId] = range;
				
				//update map
				var sheet = this._get(oSheetId);
				if(sheet){
				 	if(sheet.range && sheet.range[rangeId])
						delete  sheet.range[rangeId];
					if(sheet.row){
						if(osr && sheet.row[osr]){
							var idx = dojo.indexOf(sheet.row[osr],rangeId);
							if(idx != -1)
								sheet.row[osr].splice(idx,1);
						}
						if(osr && sheet.row[oer]){
							var idx = dojo.indexOf(sheet.row[oer],rangeId);
							if(idx != -1)
								sheet.row[oer].splice(idx,1);
						}
					}
					if(sheet.col){
					    if(osc && sheet.col[osc]){
							var idx = dojo.indexOf(sheet.col[osc],rangeId);
							if(idx != -1)
								sheet.col[osc].splice(idx,1);
						}
						if(oec && sheet.col[oec]){
							var idx = dojo.indexOf(sheet.col[oec],rangeId);
							if(idx != -1)
								sheet.col[oec].splice(idx,1);
						}
					}
				}
			}
		}
		return range;
	},
	
	//osId, oeId is the old id for start/end row/column
	//startId, endId is the new id which might be
	//1)"", means no change, do nothing
	//2)null, just remove it from list
	//3)non empty, remove it from list of old id, and add it into the new id list
	modifyRange:function(sheet, rangeId,type, osId, startId, oeId, endId)
	{
//		var sheet = this._get(sheetId);
		if(sheet)
		{
			if(startId !== "")
			{
				if(osId != startId)
				{
					var list = [];
					if(type == websheet.Constant.OPType.ROW)
					{
						list = sheet.row[osId];
					}else
					{
						list = sheet.col[osId];
					}
					if(list)
					{
						//only remove it from list when the old start id is not equal to the new end id
						if( ((endId !== "") && (osId !== endId))
								|| ((endId === "") && (osId !== oeId))){
							for(var i=0;i<list.length;i++)
							{
								if(list[i] == rangeId)
								{
									list.splice(i,1);
									break;
								}
							}
						}
					}
				}
					//if new id is valid, insert it to _Map
				if(startId != null)
				{
					if(type == websheet.Constant.OPType.ROW)
					{
						if(!sheet.row[startId])
						{
							sheet.row[startId] = [];
						}
						list = sheet.row[startId];
					}else
					{
						if(!sheet.col[startId])
						{
							sheet.col[startId] = [];
						}
						list = sheet.col[startId];
					}
					if(dojo.indexOf(list,rangeId) == -1)
						list.push(rangeId);
				}
			}
			if(endId !== "")
			{
				
				if(oeId != endId)
				{
					var list = [];
					if(type == websheet.Constant.OPType.ROW)
					{
						list = sheet.row[oeId];
					}else
					{
						list = sheet.col[oeId];
					}
					if(list)
					{
						//only remove it from list when the old end id is not equal to the new start id
						//because the new start id must in the list
						if( ((startId !== "") && (oeId !== startId))
								|| ((startId === "") && (oeId !== osId))){
							for(var i=0;i<list.length;i++)
							{
								if(list[i] == rangeId)
								{
									list.splice(i,1);
									break;
								}
							}
						}
					}
				}
				if(endId != null)
				{
					if(type == websheet.Constant.OPType.ROW)
					{
						if(!sheet.row[endId])
						{
							sheet.row[endId] = [];
						}
						list = sheet.row[endId];
					}
					else
					{
						if(!sheet.col[endId])
						{
							sheet.col[endId] = [];
						}
						list = sheet.col[endId];
					}
					if(dojo.indexOf(list,rangeId) == -1)
						list.push(rangeId);
				}
			}			
		}
	},
	
	//collect all the ranges which will be changed because of delete/add row/col/sheet
	//this method should be called before the event has been applied to the model
	getImpactRanges:function(event)
	{
		if(!event._data)
			event._data = {};
		var ranges = {};	//store all the impact range with id
		{
			var idManager = this._idManager;
			var s = event._source;
			var v = s.refValue.split("!");
			var sheetId = v[0];
			var sheet = this._get(sheetId);
			if(sheet)
			{
				if(s.refType == websheet.Constant.OPType.SHEET &&
						(s.action == websheet.Constant.DataChange.SET || s.action == websheet.Constant.DataChange.PREDELETE))
				{
					var rs = sheet.range;
					for(var id in rs)
					{
						var rangeModel = rs[id];
						if(!ranges[id])
						{
							// TODO we need to construct one map per sheet that contains each cell reference in formula string that
							// explicitly reference one cell(s) in the sheet.
							//even the range model which does not contain sheet name, might also set sheet name dirty for this range
							// because for formula offset(A3,A2,0), it need A3's sheetName for getPartial
								if (rangeModel && /*rangeModel._hasSheetRef &&*/ rangeModel._sheetId == sheetId)
									ranges[id] = rangeModel;
						}
					}
				}
				else
				{
				var start = -1;
				if(s.action == websheet.Constant.DataChange.PREDELETE
						|| s.action == websheet.Constant.DataChange.PREINSERT)
				{
					if(s.refType == websheet.Constant.OPType.COLUMN ||
						s.refType == websheet.Constant.OPType.ROW)
					{
						var index = v[1].split(":");
						var sIndex = index[0];
						var eIndex = (index.length > 1)?index[1]:sIndex;
						if(s.refType == websheet.Constant.OPType.COLUMN)
						{
							sIndex = websheet.Helper.getColNum(sIndex);
							eIndex = websheet.Helper.getColNum(eIndex);
						}else
						{
							sIndex = parseInt(sIndex);
							eIndex = parseInt(eIndex);
						}
						if(sIndex > eIndex)
						{
							var i = eIndex;
							eIndex = sIndex;
							sIndex = i;
						}
						start = sIndex - 1;						
					}
				}
				//the impact reference must has the row/col index >= event.start row/col index
				if (start >= 0)
				{
					var idList;
					// don't change the idList
					if (s.refType == websheet.Constant.OPType.COLUMN)
						idList = idManager.getColIdArrayByIndex(sheetId, start, -1);
					else
						idList = idManager.getRowIdArrayByIndex(sheetId, start, -1);
					var maxRefId = websheet.Constant.MAXREF;
					var id;
					var length = idList.length;
					for (var i = 0; i <= length; ++i) {
						if (i < length)
							id = idList[i];
						else
							id = maxRefId;
						if (id != null && id != "") {
							var list;
							if(s.refType == websheet.Constant.OPType.COLUMN)
								list = sheet.col[id];
							else
								list = sheet.row[id];
							if(list)
							{
								for(var j=0;j<list.length;j++)
								{
									var ref = list[j];
									if(ref)
									{
										if(!ranges[ref])
										{
											ranges[ref] = sheet.range[ref];
										}
									}
								}
							}
						}
					}
				}
				}
			}
		}
		return ranges;
	},
	/*
	preMove: function(event) {
		if(event && event.refType == websheet.Constant.OPType.SHEET) {
			var values = event.refValue.split("|");
			var sheetName = values[0];
			var fromIndex = parseInt(values[1]);
			var toIndex = parseInt(values[2]);
			var sheetId = this._idManager.getSheetIdBySheetName(sheetName);
			var sheet = this._get(sheetId);
			if(sheet) {
				for(var id in sheet.range3D) {
					var range = sheet.range3D[id];
					if(sheetId == range._sheetId || sheetId == range._endSheetId) {
						var startIndex = this._idManager.getSheetIndexById(range._sheetId) + 1;
						var endIndex = this._idManager.getSheetIndexById(range._endSheetId) + 1;
						var newSheetId;
						if(sheetId == range._sheetId && toIndex >= endIndex) {
							newSheetId = range._sheetId = this._idManager.getSheetIdByIndex(startIndex);
							delete sheet.range3D[id];
						} else if(sheetId == range._endSheetId && toIndex <= startIndex){
							newSheetId = range._endSheetId = this._idManager.getSheetIdByIndex(endIndex - 2);
							delete sheet.range3D[id];
						}
						if(range._sheetId == range._endSheetId) {
							this._modify3DRefTo2D(range);
						} else if (newSheetId) {
							// insert to new Sheet
							var newSheet = this._get(newSheetId, true);
							newSheet.range3D[id] = range;
						}
					}
				}
			}
		}
	},
	*/
	notify:function(source, event)
	{
		if(event._type == websheet.Constant.EventType.DataChange)
		{
			var s = event._source;
			switch(s.action) {
			case websheet.Constant.DataChange.PREDELETE:
				this.preDelete(s, false, event);
				break;
			case websheet.Constant.DataChange.PREINSERT:
				this.insert(s);
				break;
			// do not do premove here,
			// such as name range Sheet1:Sheet3!A1:B2, sheet index is 1 and 3
			// then move Sheet3 before Sheet1, then undo event will include set name range info event
			// we need addRange Sheet1:Sheet3!A1:B2 in undoRangeList,
			// While here Sheet3 is already before Sheet1
			// then user undo or other user move/delete Sheet3, the undo range can not transform correctly
			// because they don't know the previous sheet of Sheet3 at the very beginning
			/*
			case websheet.Constant.DataChange.PREMOVE:
				this.preMove(s);
				break;
			*/
			}
		}
	}
});