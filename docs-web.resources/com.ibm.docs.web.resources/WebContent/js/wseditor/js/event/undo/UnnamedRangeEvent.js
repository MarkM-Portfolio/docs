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

dojo.provide("websheet.event.undo.UnnamedRangeEvent");
dojo.require("websheet.Constant");
dojo.require("websheet.event.undo.Event");

dojo.declare("websheet.event.undo.UnnamedRangeEvent",websheet.event.undo.Event, {
	
	constructor: function(jsonEvent)
	{
		
	},
	
	//TODO: should be same with ClearUnnamedRangeEvent._checkRelated??
	_checkRelated: function(token)
	{
		if(token.type == websheet.Constant.Event.SCOPE_ROW)
		{
			var srIndex = token.getStartRowIndex();
			var erIndex = token.getEndRowIndex();
			if(erIndex == -1) erIndex = srIndex;
			var sr = this.refTokenId.token.getStartRowIndex();
			var er = this.refTokenId.token.getEndRowIndex();
			if(srIndex <= sr && erIndex >= er) return true;
		}else if(token.type == websheet.Constant.Event.SCOPE_COLUMN)
		{
			var scIndex = token.getStartColIndex();
			var ecIndex = token.getEndColIndex();
			if(ecIndex == -1) ecIndex = scIndex;
			var sc = this.refTokenId.token.getStartColIndex();
			var ec = this.refTokenId.token.getStartColIndex();
			if(scIndex <= sc && ecIndex >= ec) return true;
		}else if (token.type == websheet.Constant.Event.SCOPE_UNNAMERANGE){
		    if(this.refTokenId.token.toString() == token.toString())
		      return true;
		}
		return false;
	},
	
	/*
	 * transform index -> id for data in the josn event
	 */
	transformData2Index: function()
	{
		return this.jsonEvent.data;
	}

});

dojo.declare("websheet.event.undo.InsertUnnamedRangeEvent",websheet.event.undo.UnnamedRangeEvent, {
	
	_bChartMsg: null,
	_bFilterMsg:false,
	_filterRules: null,
	axisRefIds: null,
	plotsRefIds: null,
	axisRefAddrs: null,
	plotsRefAddrs: null,
	
	constructor: function(jsonEvent)
	{
		if(jsonEvent.data && jsonEvent.data.usage == websheet.Constant.RangeUsage.CHART)
			this._bChartMsg = true;
		if(jsonEvent.data && jsonEvent.data.usage == websheet.Constant.RangeUsage.FILTER)
			this._bFilterMsg = true;
		if(this._bChartMsg || this._bFilterMsg)
			this.transformData2Id();
	},
	
	/*
	 * transform index -> id for data in the josn event
	 */
	transformData2Id: function()
	{
		if(!this.jsonEvent.data.data)
			return;
		if(this._bFilterMsg)
		{
			this._filterRules = {};
			var sheetId = this.refTokenId.getSheetId();
			
			for(var colIdx in this.jsonEvent.data.data)
			{
				var col = parseInt(colIdx);
				var cId = this._idManager.getColIdByIndex(sheetId, col - 1);
				this._filterRules[cId] = this.jsonEvent.data.data[colIdx];
			}
		}
		if(!this._bChartMsg)
			return;
		

		if(!this.jsonEvent.data.data.chart)
			return;
		
		var chartJson = this.jsonEvent.data.data.chart;
		
		if(chartJson.plotArea){
			var msgTransformer = this.getMsgTransformer();
			
			var axisJson = chartJson.plotArea.axis;
			if(axisJson){
				this.axisRefIds = [];
				this.axisRefAddrs = [];
				for(var i = 0; i< axisJson.length; i++){
					var axis = axisJson[i];
					if(axis.cat && axis.cat.ref){
						var _rangeIds = [];
						var addrs = websheet.Helper.getRanges(axis.cat.ref);
						for(var j = 0; j< addrs.length; j++){
							var parsedRef = websheet.Helper.parseRef(addrs[j]);
							if(parsedRef && parsedRef.isValid()){
								var range = new websheet.event.undo.Range(addrs[j],null,this._idManager);
								var _rangeId = msgTransformer.addRange(range,this.bTrans);
								 _rangeIds.push(_rangeId);
							}else
								_rangeIds.push(null);
						}
						this.axisRefIds.push(_rangeIds);
						this.axisRefAddrs.push(addrs);
					}
					else{
						this.axisRefIds.push(null);
						this.axisRefAddrs.push(null);
					}
				}
			}

			var _roles = ["label","xVal","yVal", "val", "bubbleSize"];
			var plotsJson = chartJson.plotArea.plots;
			if(plotsJson){
				this.plotsRefIds = [];
				this.plotsRefAddrs = [];
				for(var i = 0; i< plotsJson.length; i++){
					var plotJson = plotsJson[i];
					if(plotJson.series){
						var plotRefIds = [];
						var plotRefAddrs = [];
						var seriesJson = plotJson.series;
						for(var j = 0; j< seriesJson.length; j ++){
							var seriesIds = {};
							var seriesAddrs = {};
							var serieJson = seriesJson[j];
							
							var _rangeIds;
							var addrs;
							
							for(var t=0;t<_roles.length;t++)
							{
								var role = _roles[t];
								var valJson = serieJson[role];
								
								if(valJson && valJson.ref){
									_rangeIds = [];
									addrs = websheet.Helper.getRanges(valJson.ref);
									for(var k = 0; k < addrs.length; k++){
										var parsedRef = websheet.Helper.parseRef(addrs[k]);
										if(parsedRef && parsedRef.isValid()){
											var range = new websheet.event.undo.Range(addrs[k],null,this._idManager);
											var _rangeId = msgTransformer.addRange(range,this.bTrans);
											 _rangeIds.push(_rangeId);
										}else
											_rangeIds.push(null);
									}
									seriesIds[role] = _rangeIds;
									seriesAddrs[role] = addrs;
								}
							}
							
							plotRefIds.push(seriesIds);
							plotRefAddrs.push(seriesAddrs);
						}
					}
					this.plotsRefIds.push(plotRefIds);
					this.plotsRefAddrs.push(plotRefAddrs);
				}
			}
		}
		
	},
	
	/*
	 * transform id -> index for data in the josn event
	 */
	transformData2Index: function()
	{
		if(this._bFilterMsg)
		{
			var sheetId = this.refTokenId.getSheetId();
			var rules = {};
			for(var colId in this._filterRules)
			{
				var cIndex = this._idManager.getColIndexById(sheetId, colId);
				if (cIndex == -1)
		    		continue;
				cIndex ++;
				rules[cIndex] = this._filterRules[colId];
			}
			this.jsonEvent.data.data = rules;
			return this.jsonEvent.data;
		}
		
		if(!this._bChartMsg)
			return this.jsonEvent.data;
		
		if(!this.jsonEvent.data.data)
			return this.jsonEvent.data;
		if(!this.jsonEvent.data.data.chart)
			return this.jsonEvent.data;		
		
		var chartJson = this.jsonEvent.data.data.chart;
		
		if(chartJson.plotArea){
			var msgTransformer = this.getMsgTransformer();
			var msgRangeList = msgTransformer.getRangeList(this.bTrans);
			
			var axisJson = chartJson.plotArea.axis;
			if(axisJson && this.axisRefIds && this.axisRefIds.length > 0){
				for(var i = 0; i < this.axisRefIds.length; i++){
					if(axisJson[i].cat){
						var rangeIds = this.axisRefIds[i];
						var addrs = this.axisRefAddrs[i];
						if(addrs){
							var addr = websheet.Utils.getAddr(addrs, rangeIds, msgRangeList);
							if(addr.length > 0)
								axisJson[i].cat.ref = addr;
						}
					}
				}				
			}
			chartJson.plotArea.axis = axisJson;
			
			var plotsJson = chartJson.plotArea.plots;
			if(plotsJson && this.plotsRefIds && this.plotsRefIds.length > 0){
				for(var i = 0; i < this.plotsRefIds.length; i++){
					var plotJson = plotsJson[i];
					var plotRefIds = this.plotsRefIds[i];
					var plotRefAddrs = this.plotsRefAddrs[i];
					if(plotJson.series && plotRefIds && plotRefIds.length > 0){
						var seriesJson = plotJson.series;
						for(var j = 0; j< plotRefIds.length; j++){
							var seriesIds = plotRefIds[j];
							var seriesAddrs = plotRefAddrs[j];
							var serieJson = seriesJson[j];
							for(var key in seriesIds){
								if(seriesIds[key] && serieJson[key]){
									var rangeIds = seriesIds[key];
									var addrs = seriesAddrs[key];
								    if(addrs){
								    	var addr = websheet.Utils.getAddr(addrs, rangeIds, msgRangeList);
								    	if(addr.length > 0)
											serieJson[key].ref = addr;
								    }
								}
							}
							seriesJson[j] = serieJson;
						}
						plotJson.series = seriesJson;
					}
					plotsJson[i] = plotJson;
				}
			}
			chartJson.plotArea.plots = plotsJson;
		}
		this.jsonEvent.data.data.chart = chartJson;
		
		return this.jsonEvent.data;
	},
	
	clear: function()
	{
		var rangeList = this.getMsgTransformer().getRangeList(this.bTrans);
		if(this.plotsRefIds && this.plotsRefIds.length > 0){
			for(var i = 0; i < this.plotsRefIds.length; i++){
				var plotRefIds = this.plotsRefIds[i];
				if(plotRefIds && plotRefIds.length > 0){
					for(var j = 0; j< plotRefIds.length; j++){
						var seriesIds = plotRefIds[j];
						for(var key in seriesIds){						
							var rangeIds = seriesIds[key];
							if(rangeIds){
								for(var k = 0; k < rangeIds.length; k++){
									var rangeId = rangeIds[k];
									if(rangeId){
										var range = rangeList.getRange(rangeId);
										if(range) rangeList.deleteRange(range);
									}
								}									
							}
						}
					}
				}
			}
		}
		if(this.axisRefIds && this.axisRefIds.length > 0){
			for(var i = 0; i < this.axisRefIds.length; i++){
				var rangeIds = this.axisRefIds[i];
				if(rangeIds){
					for(var k = 0; k < rangeIds.length; k++){
						var rangeId = rangeIds[k];
						if(rangeId){
							var range = rangeList.getRange(rangeId);
							if(range) rangeList.deleteRange(range);
						}
					}
				}
			}
		}
	},
	
	toJson: function()
	{
		var bACL = this.jsonEvent && this.jsonEvent.data &&  this.jsonEvent.data.usage == websheet.Constant.RangeUsage.ACCESS_PERMISSION;
		if(bACL)
		{
			var aclHandler = this.controller.editor.getACLHandler();
			var bhChecker = aclHandler._behaviorCheckHandler;
			this.transformRef2Index();
			var refValue = this.refTokenId.token.toString();
			var parsedRef = websheet.Helper.parseRef(refValue);
			var data = this.jsonEvent.data.data;
			var preCheckCode = bhChecker.canCreatePermission(parsedRef,data.bSheet,data.type,data.owners, Object.keys(aclHandler._userHandler._users));
	    	if(preCheckCode == bhChecker.PRE_CREATE_PERM_CHECK.CAN_NOT_EDIT || preCheckCode == bhChecker.PRE_CREATE_PERM_CHECK.HAVE_CONFLICT)
	    		return [];			
		}	
		var event = this.inherited(arguments);
		if(bACL && this.jsonEvent.data.data && this.jsonEvent.data.data.bSheet)
		{
			event.reference.refValue = websheet.Helper.getAddressByIndex(this.getSheetName(), 1, null, null, websheet.Constant.MaxRowNum, null,{refMask:websheet.Constant.ROWS_MASK});
		}	
		return event;
	}
	
});

/*
 * SetUnnamedRangeEvent cover the following events: 
 * (1) set range style/ undo event for set range style
 * (2) copy paste range data with style/ undo event for copy past range
 * (3) undo event for clear range event
 */
dojo.declare("websheet.event.undo.SetUnnamedRangeEvent",[websheet.event.undo.SetRowEvent], {
	_rowsIdRange: null,
	_colsIdRange: null,
	_hasData: false,
	_bReplace: false,
	_bRow: false,
	_bColumn: false,
	_columnWidth: null,
	_columnStyle: null,
	_cols: null, //a map, to store the columns meta info such as style, width, visibility
	
	constructor: function(jsonEvent)
	{
		dojo.mixin(this, jsonEvent);
		//work privately will also send set unnamed range event
		//which is not need to construct this event, 
		//because it will never be split to several ranges
		//but only the range enlarge or shrink, which is already covered by websheet.event.undo.TokenId
		if(jsonEvent.data && ( jsonEvent.data.rows || jsonEvent.data.style || jsonEvent.data.data))
		{
			this._hasData = true;
			if(jsonEvent.data.bRow)
				this._bRow = true;
			if (jsonEvent.data.bCol)
			{
				this._bColumn = true;
				this._transformColumn2Id();
			}
			
			//the data in set range will be replaced, rather than merged with the original value/style
			//and in such condition, if there are no data at specific row/column,
			//means the cells should be replaced by empty value and default cell style id.
			if(jsonEvent.data.bR)	
				this._bReplace = true;
			this._initIdRange();
		}
	},
	
	/*
	 * For paste column event, transform column style and column width msg to id
	 */
	_transformColumn2Id: function()
	{
		var data = this.jsonEvent.data;
		
		var meta = data.columns;
		if(meta)
		{
			if(!this._rangeIdList)
				this._rangeIdList = [];
			var sheetId = this.refTokenId.getSheetId();
			var idm = this._idManager;
			var sheetName  = this.getSheetName();
			var msgTransformer = this.getMsgTransformer();
			this._cols = {};
			for(var cIndex in meta)
			{
				var scIndex = websheet.Helper.getColNum(cIndex);
				var cId = idm.getColIdByIndex(sheetId, scIndex - 1);
				var colJson = meta[cIndex];
				var repNum = colJson.rn ? parseInt(colJson.rn) : 0;
				var ecIndex = scIndex + repNum;
				var address = cIndex + ":" + websheet.Helper.getColChar(ecIndex);
				var range = new websheet.event.undo.Range(address,sheetName,this._idManager);
				var rangeId = msgTransformer.addRange(range,this.bTrans);
				this._rangeIdList.push(rangeId);
				var colMeta = websheet.Helper.cloneJSON(colJson);
				delete colMeta.rn;
				this._cols[rangeId] = colMeta;
			}	
		}	
	},
	
	transformColumn2Index: function()
	{
		var colsMap = null;
		if(this._cols)
		{
			var msgTransformer = this.getMsgTransformer();
			var rangeList = msgTransformer.getRangeList(this.bTrans);
			var sheetId = this.refTokenId._sheetId;
			colsMap = {};
			for(var rId in this._cols)
			{
				var range = rangeList.getRange(rId,sheetId);
				if(!range) continue;
				var rst = this.getRangeInfo(range); 
				if(rst.startCol != -1)
				{
					colsMap[rst.startCol] = websheet.Helper.cloneJSON(this._cols[rId]);
					var repNum = rst.endCol - rst.startCol;
					if(repNum > 0)
						colsMap[rst.startCol].rn = repNum;
				}	
			}	
		}	
		return colsMap;
	},

	_getColJsonByIndex: function(index, colsMap)
	{
		if(!colsMap) return null;
		var ret = null;
		if(colsMap[index])
		{
			ret = websheet.Helper.cloneJSON(colsMap[index]);
		}
		else
		{
			
			for(var i in colsMap)
			{
				var srIndex = parseInt(i);
				var repeatedNum = (colsMap[i].rn)? parseInt(colsMap[i].rn): 0;
				var erIndex = srIndex + repeatedNum;
				if( index>=srIndex && index <= erIndex)
				{
					ret = websheet.Helper.cloneJSON(colsMap[i]);
					var curRepNum =  erIndex - index;
					ret.rn = curRepNum;
					break;
				}
			}
		}
		return ret;
	},

	_initIdRange:function()
	{
		this._rowsIdRange = [];
		this._colsIdRange= [];
		
		//construct _rowsIdRange, _colsIdRange
		var sheetId = this.refTokenId.getSheetId();
		var sr = this.refTokenId.token.getStartRowIndex();
		var er = this.refTokenId.token.getEndRowIndex();
		if(er == -1)
			er = sr;
		if(er > this._idManager.maxRow)
			er = this._idManager.maxRow;
		this._rowsIdRange = this._idManager.getRowIdArrayByIndex(sheetId, sr-1, er-1,true);
		var sc = this.refTokenId.token.getStartColIndex();
		var ec = this.refTokenId.token.getEndColIndex();
		if(ec == -1)
			ec = sc;
		this._colsIdRange = this._idManager.getColIdArrayByIndex(sheetId,sc-1,ec-1,true);
	},
	_checkRelated: function(token)
	{
		if(this.data && this.data.data && this.data.data.pt == "absolute")
		{
			return false;
		}
		if(token.type == websheet.Constant.Event.SCOPE_ROW)
		{
			var srIndex = token.getStartRowIndex();
			var erIndex = token.getEndRowIndex();
			if(erIndex == -1) erIndex = srIndex;

			var rowRangeList = this._getRangesIndex();
			var isRelated = true;
			for(var i = 0 ; i < rowRangeList.length; i++)
			{
				var item = rowRangeList[i];
				if(item)
				{			
					if(item.startRow <srIndex || item.endRow > erIndex)
					{
						isRelated = false;
						break;
					}
				}
			}
			return isRelated;
		}else if(token.type == websheet.Constant.Event.SCOPE_COLUMN)
		{
			var scIndex = token.getStartColIndex();
			var ecIndex = token.getEndColIndex();
			if(ecIndex == -1) ecIndex = scIndex;
			var colRangeList = this._getRangesIndex(websheet.Constant.OPType.COLUMN);
			var isRelated = true;
			for(var i = 0 ; i < colRangeList.length; i++)
			{
				var item = colRangeList[i];
				if(item)
				{			
					if(item.startCol <scIndex || item.endCol > ecIndex)
					{
						isRelated = false;
						break;
					}
				}
			}
			return isRelated;
		}
		return false;
	},
	//type: websheet.Constant.OPType.ROW/COLUMN, ROW is the default value
	//get the new range array in case there are insert row/column event happens
	_getRangesIndex: function(type)
	{
		var ws = websheet;
		var wconst = ws.Constant;
		var sheetId = this.refTokenId.getSheetId();
		var rangeIndex = [];
		var idRange = this._rowsIdRange;
		if(type == wconst.OPType.COLUMN)
			idRange = this._colsIdRange;
		var i = 0;
		var length = idRange.length;
		// for perfermance issue, when the idRange >= 100
		// first we prepare the id -> index cache
		try{
			if(length >= 100)
			{
				if(!type) type = wconst.OPType.ROW;
				var idMap = this._idManager.getIDCache(sheetId,type);
				if(!idMap) return [];
				for(; i < length; i++)
				{
					var id = idRange[i];
					var index = idMap[id];
					if(index === undefined || index === null)
						index = -1;
					if(index != -1) index++;
					rangeIndex.push(index);
				}
			}
			else
			{
				for(; i < idRange.length; i++)
				{
					var id = idRange[i];
					var index = -1;
					if(type == wconst.OPType.COLUMN)
						index = this._idManager.getColIndexById(sheetId, id);
					else
						index = this._idManager.getRowIndexById(sheetId, id);
					if(index != -1) index++;
					rangeIndex.push(index);
				}
			}
		}catch(e)
		{
			console.log("error " + e);
		}

		//find the first valid index
		var newRange = [];
		for( i = 0; i < rangeIndex.length; i++)
		{
			if(rangeIndex[i] != -1) break;
		}
		if(i == rangeIndex.length) return newRange;
		var sIndex = rangeIndex[i];
		var eIndex = sIndex;
		for(i=i+1; i < rangeIndex.length; i++)
		{
			if(rangeIndex[i] != -1) 
			{
				if(rangeIndex[i] == eIndex +1)
				{
					eIndex = rangeIndex[i];
				}else{
					var item = {};
					if(type == wconst.OPType.COLUMN)
					{
						item.startCol = sIndex;
						item.endCol = eIndex;
					}else
					{
						item.startRow = sIndex;
						item.endRow = eIndex;
					}
					if (item.endCol > wconst.MaxColumnIndex) {
						item.endCol = wconst.MaxColumnIndex;
					}
					newRange.push(item);
					sIndex = rangeIndex[i];
					eIndex = sIndex;
				}
			}
		}
		var item = {};
		if(type == wconst.OPType.COLUMN)
		{
			item.startCol = sIndex;
			item.endCol = eIndex;
		}else
		{
			item.startRow = sIndex;
			item.endRow = eIndex;
		}
		if (item.endCol > wconst.MaxColumnIndex) {
			item.endCol = wconst.MaxColumnIndex;
		}
		newRange.push(item);
		
		return newRange;
	},
	/*
	 * return the range json in rowsMap(contains the row json from start row to end row)
	 * the range column index is from start col to end col
	 */
	getCellsJsonByIndex: function(scIndex, ecIndex, rowsMap)
	{
		var rows = {};
		var wcs = websheet.Constant.Style;
		for(var index in rowsMap)
		{
			var row = rowsMap[index];
			var cells = {};
			var cellsJSON = {};
			var rowJSON = {};
			if(row.rn)
				rowJSON.rn = row.rn;
			if(row.cells)
				cells = row.cells;
				
			if(this._bRow && row.visibility!=null && row.visibility!=undefined)
				rowJSON.visibility = row.visibility;
				
			//start - if the range contains whole row(s), set the row height
            if(row[wcs.HEIGHT] && scIndex==1 && ecIndex== websheet.Constant.MaxColumnIndex){
                rowJSON[wcs.HEIGHT] = row[wcs.HEIGHT];
            }
            //end - set row height
			rows[index] = rowJSON;
			rowJSON.cells = cellsJSON;
			var cIndex = scIndex;
			while(cIndex <= ecIndex)
			{
				var strCol = websheet.Helper.getColChar(cIndex);
				var cell = null;
				if(cells[strCol])
				{
					cell = websheet.Helper.cloneJSON(cells[strCol]);
				}else
				{
					for(var c in cells)
					{
						var sc = websheet.Helper.getColNum(c);
						var repeatedNum = (cells[c].rn)? parseInt(cells[c].rn): 0;
						var ec = sc + repeatedNum;
						if( cIndex>=sc && cIndex <= ec)
						{
							cell = websheet.Helper.cloneJSON(cells[c]);
							cell.rn = ec - cIndex;
							break;
						}
					}
				}
				if(cell)
				{
					var repeatedNum = (cell.rn)? parseInt(cell.rn): 0;
					var end = cIndex + repeatedNum;
					if(end > ecIndex)
					{
						repeatedNum = ecIndex - cIndex;
//						if(repeatedNum > 0)
							cell.rn = repeatedNum;
					}
					cellsJSON[strCol] = cell;
					cIndex += repeatedNum;
				}
				cIndex++;
			}
		}
		return rows;
	},
	
	_getColsMetaArray: function(colRanges)
	{
		var colsMetaArray = null;
		if(this._bColumn)
		{
			colsMetaArray = [];
			var colsMap = this.transformColumn2Index();
			for(var i = 0; i <  colRanges.length; i++)
			{
				var scIndex = colRanges[i].startCol;
				var ecIndex = colRanges[i].endCol;
				
				var cIndex = scIndex;
				var colsMetaMap = {};
				while(cIndex <= ecIndex)
				{
					var col = this._getColJsonByIndex(cIndex, colsMap);
					if(col)
					{
						var colRepNum = col.rn ? parseInt(col.rn):0;
						var colEIndex = cIndex + colRepNum;
						colEIndex = colEIndex < ecIndex ? colEIndex : ecIndex;
						colRepNum = colEIndex - cIndex;
						col.rn = colRepNum;
						var strCol = websheet.Helper.getColChar(cIndex);
						colsMetaMap[strCol] = col;
						cIndex = colEIndex + 1;
					}	
					else
						cIndex++;
				}	
				colsMetaArray.push(colsMetaMap);
			}
		}	
		return colsMetaArray;
	},
	
	/**
	 * get all the rows in jRowsMap which Index >= erIndex
	 * @param jRowsMap
	 * @param rIndex
	 */
	_getRemainRows: function(jRowsMap, erIndex)
	{
		var rows = {};
		var maxRow = websheet.Constant.MaxRowNum;
		for(var rIndex in jRowsMap)
		{
			var row = jRowsMap[rIndex];
			var curSRIndex = parseInt(rIndex);
			var curERIndex = row.rn ? row.rn + curSRIndex : curSRIndex;
			if(curERIndex > maxRow)
				curERIndex = maxRow;
			if(rIndex >= erIndex)
			{
				row.rn = curERIndex - rIndex;
				rows[rIndex] = row;
			}	
			else if( curERIndex >= erIndex)
			{
				var rJson = websheet.Helper.cloneJSON(row);
				rJson.rn = curERIndex - erIndex;
				rows[erIndex] = rJson;
			}	
		}
		return rows;
	},
	
	toJson:function()
	{
		//update RangeMsg.java when change this method.
		var events = [];
		var rowRanges = null;
		//TODO: if this._bReplace == false && it is not set range style, it does not neccessary to split column
		var colRanges = null;
		var sheetName = this.getSheetName();
		//set image events
		if(this.jsonEvent.data.data && !this.jsonEvent.data.rows && !this.jsonEvent.data.style){
			var docObj = websheet.model.ModelHelper.getDocumentObj();
			var areaManager = docObj.getAreaManager();
			var range = areaManager.getRangeByUsage(this.jsonEvent.data.rangeid,this.jsonEvent.data.usage);
			if(!range && this.jsonEvent.data.usage != websheet.Constant.RangeUsage.ACCESS_PERMISSION)
				return events;
				
		    if(this.jsonEvent.data.usage == websheet.Constant.RangeUsage.COMMENTS){
		    	if(this.jsonEvent.data.data && (this.jsonEvent.data.data.action == "append" || this.jsonEvent.data.data.action == "undoAppend")){
		    		var comments = docObj.getComments(this.jsonEvent.data.rangeid);
		    		if(comments && comments.items[0].resolved)
		    			return events;
		    	}
		    }
		    else if(this.jsonEvent.data.usage == websheet.Constant.RangeUsage.ACCESS_PERMISSION)
		    {
		    	var data = this.jsonEvent.data.data;

		    	// sheet level permission
		    	if(data && (data.bSheet || data.add || data["delete"]))
		    	{
			    	var event = websheet.Helper.cloneJSON(this.jsonEvent);
			    	var aclHandler = this.controller.editor.getACLHandler();
			    	var bhChecker = aclHandler._behaviorCheckHandler;
			    	var sheetId = this.refTokenId.getSheetId();
			    	
		    		if(!bhChecker.canEditSheet(sheetName)) return events;
		    		if(data.add || data["delete"])
		    		{
		    			var shMap = aclHandler.getSheetPermissions(sheetId);
		    			if(shMap && shMap.sheet)
		    			{
		    				var shType = shMap.sheet.getType();
		    				if(shType == aclHandler._editType) return events;
		    				if(shMap.sheet.getId() != this.jsonEvent.data.rangeid) return events;
		    			}
		    		}
		    		
		    		event.reference.refValue = websheet.Helper.getAddressByIndex(sheetName, 1, null, null, websheet.Constant.MaxRowNum, null,{refMask:websheet.Constant.ROWS_MASK});
		    		return event;
		    	}
		    }	
			
			var event = websheet.Helper.cloneJSON(this.jsonEvent);
			if(range.data && range.data.pt == "absolute"){	
			    event.reference.refValue = websheet.Helper.createVirtualRef(sheetName);
				events.push(event);
			}
		   	else
		   	{
			   	var srIndex, erIndex,sc,ec;
		   		rowRanges = this._getRangesIndex();
		   		colRanges = this._getRangesIndex(websheet.Constant.OPType.COLUMN);
		   		var rl = rowRanges.length;
		   		var cl = colRanges.length;
			   	if(rowRanges[0]){
					srIndex = rowRanges[0].startRow;
					erIndex = rowRanges[rl -1].endRow;
				}
				if(colRanges[0]){	
					var scIndex = colRanges[0].startCol;	
					var ecIndex = colRanges[cl - 1].endCol;			
					sc = websheet.Helper.getColChar(scIndex);
					ec = websheet.Helper.getColChar(ecIndex);
				}
				var params = {refMask : websheet.Constant.RANGE_MASK};
				if(this.jsonEvent.data.usage == websheet.Constant.RangeUsage.ACCESS_PERMISSION)
				{
				    if (this.refTokenId.token._refType == websheet.Constant.RangeType.COLUMN)
				    {
				    	params.refMask = websheet.Constant.COLS_MASK;
				    	srIndex = 1;
				    }	
					else if (this.refTokenId.token._refType == websheet.Constant.RangeType.ROW)
					{
						params.refMask = websheet.Constant.ROWS_MASK;
						sc = 1;
					}	
				}	
				if(srIndex != null && sc != null)
				{
					event.reference.refValue=websheet.Helper.getAddressByIndex(sheetName, srIndex, sc,null,erIndex,ec,params);
					
					if(this.jsonEvent.data.usage == websheet.Constant.RangeUsage.ACCESS_PERMISSION)
					{
				    	var aclHandler = this.controller.editor.getACLHandler();
				    	var bhChecker = aclHandler._behaviorCheckHandler;
				    	var sheetId = this.refTokenId.getSheetId();
				    	var pm = aclHandler.getPermissionById(sheetId,this.jsonEvent.data.rangeid);
				    	if(!pm) return events;
				    	var parsedRef = websheet.Helper.parseRef(event.reference.refValue);
				    	var data = this.jsonEvent.data;
				    	var preCheckCode = bhChecker.canChangePermission(pm,parsedRef,data.data.type,data.data.owners,Object.keys(aclHandler._userHandler._users));
				    	if(preCheckCode == bhChecker.PRE_CREATE_PERM_CHECK.CAN_NOT_EDIT || preCheckCode == bhChecker.PRE_CREATE_PERM_CHECK.HAVE_CONFLICT)
				    		return events;
					}
					events.push(event);	
				}
			}
			return events;
		}		
		rowRanges = this._getRangesIndex();
		colRanges = this._getRangesIndex(websheet.Constant.OPType.COLUMN);
		var colsMetaArray = this._getColsMetaArray(colRanges);

		var jRowsMap = this.transformData2Index();
		
		for(var i = 0; i < rowRanges.length; i++)
		{
			var srIndex = rowRanges[i].startRow;
			var erIndex = rowRanges[i].endRow;

			//get row event
			var rowsMap = {};
			//if type is style, does not need to get row json
			if(this._type != websheet.Constant.DATA_TYPE.STYLE)
			{
				var rIndex = srIndex;
				
				while(rIndex <= erIndex)
				{
					var row = this.getRowJsonByIndex(rIndex,jRowsMap);
					if(row)
					{
						var rowRepNum = row.rn ? parseInt(row.rn):0;
						var rowERIndex = rIndex + rowRepNum;
						var curERIndex = (rowERIndex <= erIndex)?rowERIndex:erIndex;
						var curRpeNum = curERIndex - rIndex;
//						if(curRpeNum > 0)
						row.rn = curRpeNum;
						rowsMap[rIndex] = row;
						rIndex = curERIndex + 1;
					}else
						rIndex++;
				}
			}
			//for column, the end rowIndex should be the maxrowNum
			if(this._bColumn && (i == rowRanges.length -1))
			{
				var lastRows = this._getRemainRows(jRowsMap,erIndex + 1);
				dojo.mixin(rowsMap, lastRows);
				erIndex = websheet.Constant.MaxRowNum;
			}	
			
			for(var j = 0; j <  colRanges.length; j++)
			{
				var scIndex = colRanges[j].startCol;
				var ecIndex = colRanges[j].endCol;
				var event = websheet.Helper.cloneJSON(this.jsonEvent);
				var sc = websheet.Helper.getColChar(scIndex);
				var ec = sc;
				if(ecIndex > scIndex)
					ec = websheet.Helper.getColChar(ecIndex);
					
				if( (erIndex > srIndex) || (ecIndex > scIndex) ) 					
					event.reference.refValue=websheet.Helper.getAddressByIndex(sheetName, srIndex, sc,null,erIndex,ec);
				else {
					event.reference.refValue=websheet.Helper.getCellAddr(sheetName, srIndex, sc);
				}
				
				//construct event that only contains the cell from start col to end col, start row to end row
				if(this._type != websheet.Constant.DATA_TYPE.STYLE)
				{
					var cells = this.getCellsJsonByIndex(scIndex, ecIndex, rowsMap);				
					event.data.rows = cells;
				}
				if(this._bColumn)
				{
					event.data.columns = colsMetaArray[j];
					if(i != 0)
						event.data.bFollowPart = true;
				}	
				//else if type == STYLE, set the style for split range
				if(this._bUndoDefault)
					event.data[this._strBUndoDefault] = true;
				events.push(event);
			}
		}
		return events;
	}
	
});

dojo.declare("websheet.event.undo.ClearUnnamedRangeEvent",websheet.event.undo.SetUnnamedRangeEvent,{
	constructor: function(jsonEvent)
	{
		dojo.mixin(this, jsonEvent);
		this._initIdRange();
	},
	
	_checkRelated: function(token)
	{
		if(token.type == websheet.Constant.Event.SCOPE_ROW)
		{
			var srIndex = token.getStartRowIndex();
			var erIndex = token.getEndRowIndex();
			if(erIndex == -1) erIndex = srIndex;
			var sr = this.refTokenId.token.getStartRowIndex();
			var er = this.refTokenId.token.getEndRowIndex();
			if(sr >= srIndex && er <= erIndex) return true;
		}else if(token.type == websheet.Constant.Event.SCOPE_COLUMN)
		{
			var scIndex = token.getStartColIndex();
			var ecIndex = token.getEndColIndex();
			if(ecIndex == -1) ecIndex = scIndex;
			var sc = this.refTokenId.token.getStartColIndex();
			var ec = this.refTokenId.token.getStartColIndex();
			if(sc >= scIndex && ec <= ecIndex) return true;
		}
		return false;
	},
	
	/*
	 *for clear action,  it always should be one action, that is not split into several sub-action 
	 */
	getRefValue: function()
	{
		var newRowRange = this._getRangesIndex();
		if(newRowRange.length == 0) return null;
		var srIndex = newRowRange[0].startRow;
		var erIndex = newRowRange[0].endRow;
		for(var i = 1 ; i < newRowRange.length; i++)
		{
			var item = newRowRange[i];
			if(item.startRow< srIndex) srIndex = item.startRow;
			if(item.endRow > erIndex) erIndex = item.endRow;
		}
		var newColRange = this._getRangesIndex(websheet.Constant.OPType.COLUMN);
		if(newColRange.length == 0) return null;
		var scIndex = newColRange[0].startCol;
		var ecIndex = newColRange[0].endCol;
		for(var i = 1 ; i < newColRange.length; i++)
		{
			var item = newColRange[i];
			if(item.startCol< scIndex) scIndex = item.startCol;
			if(item.endCol > ecIndex) ecIndex = item.endCol;
		}
		var refValue=null;
		var scolNum=websheet.Helper.getColChar(scIndex);
		if(ecIndex > scIndex || erIndex > srIndex)
			refValue=websheet.Helper.getAddressByIndex(this.getSheetName(), srIndex, scolNum,null,erIndex,websheet.Helper.getColChar(ecIndex));
		else {
			refValue=websheet.Helper.getCellAddr(this.getSheetName(), srIndex, scolNum);
		}
		return refValue;
	},
	
	toJson: function()
	{
		var refValue = this.getRefValue();
		if(refValue == null) return null;
		var jEvent = websheet.Helper.cloneJSON(this.jsonEvent);
		jEvent.reference.refValue = refValue;
		return jEvent;
	}
});
