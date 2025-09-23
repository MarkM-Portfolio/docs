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

/****************************************************/
/* created by LinXin, linxinbj@cn.ibm.com           */
/*   1/27/2011                                      */
/* Document Model									*/
/****************************************************/
dojo.provide("websheet.model.Document");
dojo.require("websheet.style.StyleManager");
dojo.require("websheet.model.chart.DataProvider");
dojo.require("websheet.model.chart.Chart");
dojo.require("websheet.TaskManager");
dojo.require("websheet.parse.AreaManager");
dojo.require("websheet.model.RangeUtil");
dojo.declare("websheet.model.Document",websheet.functions.Document,{
	/*Array*/_sheets:null,						//when document exist,it will be initialize as a Array
	/*IDManager*/_idManager:null,				//IDManager instance
	/*ModelHelper*/_mhelper: null,				// model helper
	/*cell type*/CellType: websheet.Constant.CellType,  // cell type
	/*CalcManager*/_calcManager:null,			// formula calc manager at background
	/*TaskManager*/_taskMgr: null,				// task Manager
	/*websheet.parse.AreaManager*/_areaManager:null,	//all the formula reference of this document
	/*StyleManager*/_styleManager:null,
	/*websheet.model.RecoverManager*/_recoverManager:null, // keep the deleted sheets info
	
//	calculated: false,							//true if the cell's calculated at server side
	isLoading:false,							//true when initial loading 
//	isCalculating:false,							//true when and do calculation for range
	ptLoadMap:null,								//used when get sheet from server, map for each sheet,key is sheet id, and set true value when some sheet do partial loading
	clPtLoadMap:null,							//used when client partial load the sheet
	clPtParseMap:null,							//used when client partial parse the sheet
	//width first parse
	isDeepParsing: false,						//true means parse the cell depth first, else width first
	_unCalcCells:null,							//put all the not calculate formula cells, these cells have been parsed with tokens, but can not get calculate value
												//because it refer to the unparsed cells.
	_partialMgr:null,
	_numOfLoadedCells: 0,						// the total number of non-empty loaded cells
	_coverInfos: null,  // one temporary place to collect the loaded merged cells
	
	_charts: null,   //map, {chartId, chart}
	_comments: null, //array, to keep the order of comments.
	_dataValidations: null, //map, data validation map.
	_conditionalFormats: null, //map
	_moreContentSheets: null,
	enableFormula: true,						//if false, calculated value of one formula cell will be used directly to build cell model
	enableTask: true,							// enable task assignment or not
	enableComments: true,						// temporary solution - disable comments in viewer
	enableDataValidation: true,
	maxSheetRows: 100000,							// the max row in sheet 
	/**
	 * constructor
	 */
	/*void*/constructor: function(args) {
		dojo.mixin(this, args); 			  // controller, enableFormula, maxSheetRows, partialLevel

		this._sheets = new Array();
		this.ptLoadMap = {};
		this.clPtLoadMap = {};
		this.clPtParseMap = {};
		this._mhelper = websheet.model.ModelHelper;
		this._idManager = new websheet.model.IDManager();
		this._idManager.setMaxRow(this.maxSheetRows);
		this._partialMgr = this._idManager._partialMgr;
		this._calcManager = this._mhelper.getCalcManager();
		this._taskMgr = websheet.TaskManager;
		this.isDeepParsing = websheet.Constant.isDeepParsing;
		this._unCalcCells = {};
		this._recoverManager = new websheet.model.RecoverManager(this);
		this._charts = {};
		this._comments = [];
		this._dataValidations = {};
		this._conditionalFormats = {};
		if (this.partialLevel == websheet.Constant.PartialLevel.ROW) {
			this._moreContentSheets = {};
		}
		this._numOfLoadedCells = 0;
		this._coverInfos = [];
		websheet.baseDateStr = websheet.Constant.baseDateStr;
	},
	
	///////// websheet.functions.Document 		 ///////////////////////////
	/*AreaManager*/getAreaManager:function(){
		if(!this._areaManager){
			this._areaManager = new websheet.parse.AreaManager(this);
			if(this.controller)
				this._areaManager.startListening(this.controller);
		}
		return this._areaManager;
	},
	
	/**
	 * whether or not sheet name is exist
	 * if bSheetId=true, sheet is the sheetId
	 */
	/*boolean*/isSheetExist:function(sheetName, bSheetId){
		if(this.isLoading)//the sheet might not loaded yet, check the idmananger
		{
			if(bSheetId){
				var sheet = this.getSheetName(sheetName);
			}else{
				var sheet = this.getSheetId(sheetName);
			}
				
			if(sheet)
				return true;
			else
				return false;
		}
		if(this._sheets)
		{
			for(var i=0; i<this._sheets.length; i++)
			{
				var sheet = this._sheets[i];
				var text = "";
				if(bSheetId)
					text = sheet._id;
				else
					text = sheet.getSheetName();
				if(text == sheetName)
					return true;
			}
		}
		return false;
	},
	
	isSheetProtected: function(sheetName){
		var sheet = this.getSheet(sheetName);
		if(sheet)
			return sheet._bProtected;
		return false;
	},
	//////// End of websheet.functions.Document  /////////////////////////////
	/**********************************************************************************************************
	*    										private function        									  *
	**********************************************************************************************************/
	/**
	 * load document data
	 */
	/*void*/_load:function(docData){
		// we know that this function must be called in main stream and not in any other managed tasks
		if(docData == undefined || docData == null)return null;
		docData.criteria = this.criteria;
		docData.bJoin = this.bJoin;
		/** load meta.js */
		this.url = docData.meta.url;
		if (docData.meta.date1904)
			websheet.baseDateStr = websheet.Constant.baseDateStr1904;
		var sheets = docData.meta.sheetsIdArray;
		var context = {};
		context.env = this;
		context.document = docData;
		context.idManager = this._idManager;
		//load name range before load content, so that bPR cell can refer to the right name range
		//but we can not add NameRangeHandler instance as the listener of name range
		//because NameRangeHandler depends on grid which has not been constructed yet 
		this._loadRange(docData.content.names, true);
		if(this.controller) {
			this.controller.getInlineEditor().getNameListener().updateNames();
		}
		// FOR every sheet content data in docData and load the content
		// every sheet will create partialLoadRow managed tasks in root level
		dojo.forEach(sheets,function(sheetId,index){
			if(sheetId && dojo.string.trim(sheetId) != ""){
				var meta = this.document.meta;
				var sheetMeta = meta.sheets[sheetId];
				var sheetName = sheetMeta.sheetname;
				var c_sheetId = this.idManager.getMapping(sheetId);
				if(!this.env._partialMgr || !this.env._partialMgr.isComplete(c_sheetId)){
					var sheet = this.env._createSheet(sheetName,c_sheetId,index + 1,true,sheetMeta);
					sheet.initMaxColIndex = sheetMeta.maxColumnIndex;
					sheet.initMaxRowIndex = sheetMeta.maxrow;
					if (sheetMeta.rowHeight != null) {
						sheet._rowHeight = sheetMeta.rowHeight;
					}
					var settings = sheet.getFreezePos();
					if(settings.row == null && settings.col == null)
						// load settings repeatedly from meta leads to strange update problem sometimes, seems postLoad revise validation & update not working
						// just make sure not to overwrite the revised settings in client model.
						sheet.setViewSetting({freezeRow:sheetMeta.freezeRow, freezeCol:sheetMeta.freezeCol});
					if (meta.sheetsArray!=undefined)
					{
						sheet.load(meta.sheetsArray[sheetId],this.document, sheetId);
					}
				}
			}
		},context);
		
		// add postLoadContent as a task, the task would be Qed after all sheet's partialLoadRow() tasks are completed,
		// so we don't bother checking
		// the postLoadContent has a priority lower than partialLoadRow, so if different setDocumentObj() comes together,
		// make sure all _postLoadContent is executed after all _partialLoadRow finishes
		this._taskMgr.addRootTask(this, "_postLoadContent", [docData], this._taskMgr.Priority.PostLoadDocument);	
		this._taskMgr.start();
	},
	
	_parseRuleObjs: function(usage, objMap){
		var areaMgr = this.getAreaManager();
		var ranges = areaMgr.getRangesByUsage(usage);
		for(var i = 0; i < ranges.length; i++){
			var range = ranges[i];
			if(typeof range.data == "string"){
				var obj = objMap[range.data];
				if(obj)
					obj.addRange(range);
				else{
					areaMgr.deleteArea(range);
					this._calcManager.removeCF(range);
				}
				range.data = obj;
			}
		}
		for(var id in objMap){
			var obj = objMap[id];
			obj.parse();
		}
	},
	
	//after each sheet content have been load finished
	_postLoadContent:function(docData){
		// check all the sheet loading status in client side
		var bNotDone = this.getClientPartialStatus();
		if(!bNotDone){
			//add listeners for name range
			var names = this.getAreaManager().getRangesByUsage(websheet.Constant.RangeUsage.NAME);
			var nameListeners;
			for(var i = 0; i < names.length; i++){
				var nameRange = names[i];
				if(!nameListeners)
					nameListeners = this.getAreaListener(nameRange);
				nameRange.addListeners(nameListeners);
			}
			this._loadRange(docData.content.unnames);
			if(docData.bJoin){
				//Parse data validation
				this._parseRuleObjs(websheet.Constant.RangeUsage.DATA_VALIDATION, this._dataValidations);
				this._parseRuleObjs(websheet.Constant.RangeUsage.CONDITION_FORMAT, this._conditionalFormats);
			}
			this._loadRange(docData.content.pnames);
			this._loadCharts(docData.content.charts);
			if (this.enableComments)
				this._loadComments(docData.content.comments);
			
			if (this.partialLevel == websheet.Constant.PartialLevel.SHEET || this.partialLevel == websheet.Constant.PartialLevel.ALL) {
				// finishes loading
				this.isLoading = false;
			} else {
				// partial row,
				if (docData.meta.hasMoreContent) {
					// still loading
					this.isLoading = true;
				} else {
					// this sheet finishes loading
					this._moreContentSheets[docData.criteria.sheet] = false;
					this.isLoading = false;
					// check other sheet's "moreData" state
					for (var id in this._moreContentSheets) {
						if (this._moreContentSheets[id]) {
							this.isLoading = true;
							break;
						}
					}
				}
			}
			
			if (!this.isLoading) {
				// finishes loading, publish event, this implicitly makes "postRender" tasks to resume
				if (this.controller)
					dojo.publish("/websheet/documentLoaded");
				dojo.publish(websheet.Constant.APIEvent.LOAD_READY);
			}
		
			//start partial calculate the visible formula cells
			if (this.controller)
				this.controller.postLoad(docData.criteria, docData.bJoin);
			delete this.criteria;
			delete this.bJoin;
		}
	},
	
	setPartialLoading:function(sheetId, bLoading){
		this.ptLoadMap[sheetId] = bLoading;
	},
	
	//if sheetId is not given, check if there is any sheet is do partial loading
	getPartialLoading:function(sheetId){
		if(this.partialLevel != websheet.Constant.PartialLevel.ALL)
		{
			if(sheetId){
				if(this.ptLoadMap[sheetId])
					return true;
			}else{
				for(var sheetId in this.ptLoadMap){
					if(this.ptLoadMap[sheetId])
						return true;
				}
			}
		}
		return false;
	},
	
	//bParse: if client is now parsing or loading
	//flag: boolean, true for parsing/loading now, false for parse/load complete
	setClientPartialStatus:function(sheetId, bParse, flag){
		if(bParse)
			this.clPtParseMap[sheetId] = flag;
		else
			this.clPtLoadMap[sheetId] = flag;
	},
	
	getClientPartialStatus:function(sheetId, bParse){
		var map = this.clPtLoadMap;
		if(bParse)
			map = this.clPtParseMap;
		if(sheetId){
			if(map[sheetId])
				return true;
		}else{
			for(var sheetId in map){
				if(map[sheetId])
					return true;
			}
		}
		return false;
	},
	
	/**
	 * load range data
	 */
	/*void*/_loadRange:function(rangeData, bNotAddListener){
		if(!rangeData) return;
		
		var areaMgr = this.getAreaManager();
		for(var id in rangeData){
			var data = rangeData[id];
			if(data){
				var range = null;
				var usage = data.usage;
				if(!this.enableTask && usage == websheet.Constant.RangeUsage.TASK)
					continue;
				if(!this.enableComments && usage == websheet.Constant.RangeUsage.COMMENTS)
					continue;
				if(!this.enableDataValidation && usage == websheet.Constant.RangeUsage.DATA_VALIDATION)
					continue;
				if(!this.enableACL && usage == websheet.Constant.RangeUsage.ACCESS_PERMISSION)
					continue;
				var address = data.addr;
				var parsedRef = websheet.Helper.parseRef(address);
				if (!parsedRef)
					continue;
				if(!parsedRef.isValid()){
					//if address is like Sheet1.#REF! pattern
				    //can not make sure that it is row/column type
				    //for name range/chart, it might not recovered correctly by undoRange delta info
				    //so use the endrow or end column id is "M" to treat it as column/row type.
					if(parsedRef.refMask == (websheet.Constant.RefAddressType.SHEET | websheet.Constant.RefAddressType.COLUMN)){
						if(data.erid == websheet.Constant.MAXREF){
							parsedRef.refMask = websheet.Constant.COLS_MASK;
						}else if(data.ecid == websheet.Constant.MAXREF){
							parsedRef.refMask = websheet.Constant.ROWS_MASK;
						}else{
							var idManager = this._idManager;
							var sheetId = idManager.getMapping(data.sheetid);
								
							if(!data.srid && !data.erid){
								if(data.ecid)
									parsedRef.refMask = websheet.Constant.RANGE_MASK;
								else
									parsedRef.refMask = websheet.Constant.CELL_MASK;
								var startcolid = idManager.getMapping(data.scid);
								var endcolid = idManager.getMapping(data.ecid);
								endcolid = (endcolid == null) ? startcolid : endcolid;
								var startColIndex = idManager.getColIndexById(sheetId, startcolid);
								var endColIndex = idManager.getColIndexById(sheetId, endcolid);
								parsedRef.startCol = startColIndex + 1;
								parsedRef.endCol = endColIndex + 1;
							}else if(!data.scid && !data.ecid){
								if(data.erid)
									parsedRef.refMask = websheet.Constant.RANGE_MASK;
								else
									parsedRef.refMask = websheet.Constant.CELL_MASK;
								var startrowid = idManager.getMapping(data.srid);
								var endrowid = idManager.getMapping(data.erid);
								endrowid = (endrowid == null) ? startrowid : endrowid;
								var startRowIndex = idManager.getRowIndexById(sheetId, startrowid);
								var endRowIndex = idManager.getRowIndexById(sheetId, endrowid);
								parsedRef.startRow = startRowIndex + 1;
								parsedRef.endRow = endRowIndex + 1;
							}else
								parsedRef.refMask = websheet.Constant.RANGE_MASK;
						}
					}
				}
				if(usage == websheet.Constant.RangeUsage.DATA_VALIDATION || usage == websheet.Constant.RangeUsage.CONDITION_FORMAT){//use sharedformularef for data validation range
					var area = null;
					switch(usage){
					case websheet.Constant.RangeUsage.DATA_VALIDATION:
						area = new websheet.parse.SharedFormulaRef4DV(parsedRef, id);
						if(data.data.criteria){
							var obj = new websheet.model.RulesObject.DataValidation(area, this, data.data.criteria);
							this._dataValidations[id] = obj;
							area.data = obj;
						}else
							area.data = data.data.parentId;
						break;
					case websheet.Constant.RangeUsage.CONDITION_FORMAT:
						area = new websheet.parse.SharedFormulaRef4CF(parsedRef, id);
						if(data.data.criterias){
							var obj = new websheet.model.RulesObject.ConditionalFormat(area, this, data.data);
							this._conditionalFormats[id] = obj;
							area.data = obj;
						}else
							area.data = data.data.parentId;
						break;
					default:
						break;
					}
					if(area)
						area.addListeners(area);//add its self as listeners to listen for the set dataValidation range event
				}else{
					if (usage == websheet.Constant.RangeUsage.NAME)
						area = new websheet.parse.NameArea(parsedRef, id);
					else
						area = new websheet.parse.Area(parsedRef, id, usage);
					
					area.data = data.data;
				}
				
				if(!bNotAddListener) {
					var listeners = this.getAreaListener(area);
					area.addListeners(listeners);
				}
				
				areaMgr.addArea(area);
				
				if (this.controller)
				{
					this.controller.calcDrawFrameInfo(area);
				}
			}
		}
	},
	
	_loadComments: function(comments)
	{
		if(comments == null)
			return;
		this._comments = comments;
		dojo.publish(concord.util.events.comments_reload, [true]);
	},
	
	getComments: function(commentsId)
	{
		for (var i = 0; i < this._comments.length; i++)
		{
			var c = this._comments[i];
			if (c.id == commentsId)
				return c;
		}
	},
	
	addComments: function(commentsId, comments)
	{
		var com = {};
		com.items = comments;
		com.id = commentsId;
		this._comments.push(com);
	},
	
	deleteComments: function(commentsId)
	{
		for (var i = 0; i < this._comments.length; i++)
		{
			var c = this._comments[i];
			if (c.id == commentsId){
				this._comments.splice(i, 1);
				return;
			}
		}
	},
	
	appendComments: function(commentsId, item)
	{
		for (var i = 0; i < this._comments.length; i++)
		{
			var c = this._comments[i];
			if (c.id == commentsId){
				c.items.push(item);
				return;
			}
		}
	},
	
	undoAppendComments: function(commentsId, item)
	{
		for (var i = 0; i < this._comments.length; i++)
		{
			var c = this._comments[i];
			if (c.id == commentsId){
				for(var j = 1; j < c.items.length; j++){
					if(c.items[j].time == item.time && c.items[j].uid == item.uid){
						c.items.splice(j, 1);
						break;
					}
				}
				return;
			}
		}
	},
	
	updateComments: function(commentsId, index, item)
	{
		for (var i = 0; i < this._comments.length; i++)
		{
			var c = this._comments[i];
			if (c.id == commentsId){
				c.items.splice(index, 1, item);
				return;
			}
		}
	},
	
	getAreaListener:function(area) {
		if (this.controller) {
			return this.controller.getAreaListener(area);
		}
	},
	
	getOrderRangesByUsage: function(info, usage, bRowOrder)
	{
		var ret = [];
		var areaMgr = this.getAreaManager();
		var ranges = areaMgr.getRangesByUsage(usage, info.sheetName);
		for(var i = 0; i < ranges.length; i++){
			var range = ranges[i];
			var rangeInfo = range._getRangeInfo();
			var relation = websheet.Helper.compareRange(info, rangeInfo);
			if(relation != websheet.Constant.RangeRelation.NOINTERSECTION){
				var inserted = false;
				for(var j = 0; j < ret. length; j ++){
					var r = ret[j];
					if(bRowOrder && range.getStartRow() < r.getStartRow() || !bRowOrder && range.getStartCol() < r.getStartCol()){
						ret.splice(j, 0 , range);
						inserted = true;
						break;
					}
				}
				if(!inserted)
					ret.push(range);
			}
		}
		return ret;
	},
	
	//data validation and conditional format
	insertRulesObj4EmptyRowCol: function(sheetName, start, end, bRow)
	{
		this._insertRulesObjByUsage(sheetName, start, end, bRow, websheet.Constant.RangeUsage.DATA_VALIDATION);
		this._insertRulesObjByUsage(sheetName, start, end, bRow, websheet.Constant.RangeUsage.CONDITION_FORMAT);
	},
	
	_insertRulesObjByUsage: function(sheetName, start, end, bRow, usage)
	{
		var info = {
			sheetName: sheetName,
			startRow: bRow ? start - 1 : 1,
			endRow: bRow ? start - 1: websheet.Constant.MaxRowNum,
			startCol: bRow ? 1 : start - 1,
			endCol: bRow ? websheet.Constant.MaxColumnIndex : start - 1
		};
		var ranges = this.getOrderRangesByUsage(info, usage, !bRow);
		var len = ranges.length;
		if (len == 0)
			return;
		var delta = end - start + 1;
		var rowDelta = bRow ? delta : 0;
		var colDelta = bRow ? 0 : delta;
		var updateRange = {
				sheetName: sheetName,
				startRow: bRow ? start : 1,
				endRow: websheet.Constant.MaxRowNum,
				startCol: bRow ? 1 : start,
				endCol: websheet.Constant.MaxColumnIndex 
		};
		for(var i = 0; i < len; i++){
			var range = ranges[i];
			if ((bRow && range._parsedRef.endRow === start - 1) 
			 || (!bRow && range._parsedRef.endCol === start - 1))
				range.updateAddress(updateRange, rowDelta, colDelta, this, true);
		}
	},
	
	insertRulesObjByUsage: function(rangeId, parsedRef, data, usage)
	{
		var area = null;
		switch(usage){
		case websheet.Constant.RangeUsage.DATA_VALIDATION:
			this.removeRangesByUsage(parsedRef, usage);
			var area = new websheet.parse.SharedFormulaRef4DV(parsedRef, rangeId);
			if(data.data.criteria){
				var dv = new websheet.model.RulesObject.DataValidation(area, this, data.data.criteria);
				this._dataValidations[rangeId] = dv;
				area.data = dv;
				dv.parse();
			}else{
				var dv = this._dataValidations[data.data.parentId];
				if(dv)
					dv.addRange(area, true);
				area.data = dv;
			}
			break;
		case websheet.Constant.RangeUsage.CONDITION_FORMAT:
			this.removeSplitedRanges(rangeId, parsedRef.sheetName, usage);
			area = new websheet.parse.SharedFormulaRef4CF(parsedRef, rangeId);
			if(data.data.criterias){
				var cf = new websheet.model.RulesObject.ConditionalFormat(area, this, data.data);
				this._conditionalFormats[rangeId] = cf;
				area.data = cf;
				cf.parse();
			}else{
				var cf = this._conditionalFormats[data.data.parentId];
				if(cf)
					cf.addRange(area, true);
				area.data = cf;
			}
			break;
		default:
			break;
		}
		if(area){
			area.addListeners(area);
			var areaMgr = this.getAreaManager();
			areaMgr.addArea(area);
		}
	},
	
	removeSplitedRanges : function(pId, sheetName, usage)
	{
		var areaMgr = this.getAreaManager();
		var ranges = areaMgr.getRangesByUsage(usage, sheetName);
		for(var i = 0; i < ranges.length; i ++){
			var range = ranges[i];
			if(range._id.indexOf(pId + "_") == 0 || range._id == pId){
				var data = range.data;
				data.removeRange(range);
				range.endListeningSharedArea(areaMgr, range, range);
				if(range.clearRefTokens)
					range.clearRefTokens();
				areaMgr.deleteAreaInUsageMap(range);
			}
		}
	},
	
	removeRangesByUsage: function(parsedRef, usage)
	{
		var info = {
			sheetName:parsedRef.sheetName,
			startRow:parsedRef.startRow,
			endRow:parsedRef.endRow,
			startCol:parsedRef.startCol,
			endCol:parsedRef.endCol
		};
		var areaMgr = this.getAreaManager();
		var ranges = areaMgr.getRangesByUsage(usage, parsedRef.sheetName);
		for(var i = 0; i < ranges.length; i++){
			var range = ranges[i];
			var rangeInfo = range._getRangeInfo();
			var interRange = websheet.Helper.rangeIntersection(info, rangeInfo);
			if(interRange != null){
				if(websheet.Helper.compareRange(rangeInfo, interRange) == websheet.Constant.RangeRelation.EQUAL){
					var data = range.data;
					data.removeRange(range);
					range.endListeningSharedArea(areaMgr, range, range);
					if(range.clearRefTokens)
						range.clearRefTokens();
					areaMgr.deleteAreaInUsageMap(range);
				}else{//split range.
					range.removPartialRange(interRange, this);
				}
			}
		}
	},
	
	renameRulesObjByUsage: function(rulesObj, newName, usage){
		var objMap;
		switch(usage){
		case websheet.Constant.RangeUsage.DATA_VALIDATION:
			objMap = this._dataValidations;
			break;
		case websheet.Constant.RangeUsage.CONDITION_FORMAT:
			objMap = this._conditionalFormats;
			break;
		default:
			break;
		}
		
		if(objMap != null){
			delete objMap[rulesObj._id];
			rulesObj._id = newName;
			objMap[newName] = rulesObj;
		}
	},
	
	addRulesObjByUsage: function(rulesObj, usage){
		switch(usage){
		case websheet.Constant.RangeUsage.DATA_VALIDATION:
			this._dataValidations[rulesObj._id] = rulesObj;
			break;
		case websheet.Constant.RangeUsage.CONDITION_FORMAT:
			this._conditionalFormats[rulesObj._id] = rulesObj;
			break;
		default:
			break;
		}
	},
	
	removeRulesObjByUsage: function(id, usage){
		switch(usage){
		case websheet.Constant.RangeUsage.DATA_VALIDATION:
			delete this._dataValidations[id];
			break;
		case websheet.Constant.RangeUsage.CONDITION_FORMAT:
			delete this._conditionalFormats[id];
			break;
		default:
			break;
		}
	},
	
	_loadCharts: function(charts)
	{
		if(charts==null)
			return;
		for(var id in charts)
		{
			var chartJson = charts[id];
			if(this._charts[id]){//The chart may has been loaded
				if(!chartJson.bPR)
					this._charts[id]._bPR = false;
				continue;
			}
			this.addChart(id, chartJson);
		}
	},
	
	addChart: function(chartId, chartJson)
	{
		var chart = new websheet.model.chart.Chart(chartId,this);
		var dataProvider = new websheet.model.chart.DataProvider(this);
		chart.attachDataProvider(dataProvider);
		chart.loadFromJson(chartJson);
		this._charts[chartId] = chart;	
		return chart;
	},
	
	removeChart: function(chartId)
	{
		var chart = this._charts[chartId];
		if(chart){
			chart.destroy();
			delete  this._charts[chartId];	
		}
	},
	
	getUnLoadedChartsId: function(sheetName)
	{
		var chartRanges = this._areaManager.getRangesByUsage(websheet.Constant.RangeUsage.CHART,sheetName);
		var unloadIds = [];
		for(var i=0;i<chartRanges.length;i++)
		{
			var chartid = chartRanges[i].getId();
			if(this._charts[chartid]==null || this._charts[chartid]._bPR)//reload bPR charts to load its data source
				unloadIds.push(chartid);
		}
		return unloadIds;
	},
	
	getLoadedChartsIdInOtherSheets: function(sheetName)
	{
		var chartRanges = this._areaManager.getRangesByUsage(websheet.Constant.RangeUsage.CHART, sheetName);
		var loadIds = [];
		for(var i=0;i<chartRanges.length;i++)
		{
			var chartid = chartRanges[i].getId();
			if(this._charts[chartid]!=null)
				loadIds.push(chartid);
		}
		return loadIds;
	},
	
	/**
	 * create a new sheet,only called in inner
	 * if the sheet is already exist then just return it
	 */
	/*Sheet*/_createSheet:function(sheetName,sheetId,index,sort,sheetMeta){
		var id = sheetId;
		//if id don't exist,then create it by IDManager
		if(id == undefined || id == null){
//			id = this._idManager.getSheetIdByIndex(this._sheets.length,true);
			id = this._idManager.insertSheetAtIndex(index-1, null, sheetName);
		}
		var sheet = this._sheets[index - 1];
		if(sheet && sheet._id == sheetId)
			return sheet;

		sheet = new websheet.model.Sheet(this,id,sheetName,sheetMeta);
		if(!sort && index != undefined){
			this._sheets.splice(index - 1, 0, sheet);
		}else{
			this._sheets.push(sheet);
		}
		return sheet;
	},
	/**
	 * get IDManager
	 */
	/*IDManager*/_getIDManager:function(){
		return this._idManager;
	},
	/**
	 * get StyleManager
	 */
	/*StyleManager*/_getStyleManager:function(){
		if(!this._styleManager)
			this._styleManager = new websheet.style.StyleManager();
		return this._styleManager;
	},
	
	/**********************************************************************************************************
	*    										public function        										  *
	**********************************************************************************************************/
	/**
	 * initialize document with event data
	 */
	/*void*/init:function(docData, criteria, bJoin){
		//the following two are temp variable
		this.criteria = criteria;
		this.bJoin = bJoin;
		this.isLoading = true;
		this.clPtLoadMap = {};
		this.clPtParseMap = {};
		this._isPartialCalcDone = false;
		if (!this.enableFormula) {
			// disable formula only iff it is in html view mode and formula cell has calculated value: 'calculated' is true.
			if (!docData.content.calculated)
				this.enableFormula = true;
		}
		//load IDManager data to initialize its IDs array
		this._idManager.init(docData, criteria, bJoin);
		if (!this._idManager.isValid()) {
			throw("corrupted document");
		}
		this._getStyleManager()._init(docData.content.styles, bJoin);
		//load document data to generate model
		this._load(docData);
		if (this._partialMgr) {
			this._partialMgr.init(docData, criteria, bJoin);
		}
		if (g_DEBUG) {
			try {
				this.selfCheck();
			} catch (e) {
				console.log(e);
			}
		}
	},
	
	getRecoverManager: function()
	{
		return this._recoverManager;
	},
	/*
	 * Tell whether the document is calculated at server or not on load
	 */
	/*boolean*/isCalculated: function() {
		return this.calculated;
	},
	
	addCutUpdateCell: function(uId, cellData){
		this._updateCells[uId] = cellData;
	},
	
	getCutUpdateCell: function(){
		return this._updateCells;
	},
	
	clearCutUpdateCell: function(){
		this._updateCells = {};
	},
	
	/*
	 * Check if too many cells have been loaded
	 */
	/*boolean*/haveTooManyCells: function() {
		return this._numOfLoadedCells > websheet.Constant.MaxNumOfLoadedCells;
	},
	
	/*********************************************sheet************************************/
	/**
	 * return sheets array
	 */
	/*Array*/getSheets:function(){
		return this._sheets;
	},
	
	/**
	 * return sheets name array with given start/end sheet name
	 * @param startName
	 * @param endName
	 * @returns
	 */
	getSheetNameRanges:function(startName, endName) {
		if(!startName && !endName) {
			var sheets = [];
			for(var i = 0; i < this._sheets.length; i++) {
				sheets[i] = this._sheets[i].getSheetName();
			}
			return sheets;
		}
		return this._idManager.getSheetNameRanges(startName, endName);
	},
		
	/*Array*/getVisibleSheets:function(){
		var unhided_sheets = new Array();
		if (this._sheets){			
			for (var i=0; i<this._sheets.length;i++){
				var sheet = this._sheets[i];
				if (sheet.isSheetVisible()){
					unhided_sheets.push(sheet);
				}
			}			
		}
		return unhided_sheets;
	},
	
	/**/getVisibleSheetsCount:function(){
		var count = 0;
		if (this._sheets){			
			for (var i=0; i<this._sheets.length;i++){
				var sheet = this._sheets[i];
				if (sheet.isSheetVisible()){
					count ++;
				}
			}
		}
		return count;
	},
	/* 
	 * helper function to get sheet id or sheet name
	 * don't get them by using idmanager
	 */
	/*string*/getSheetName: function(sheetId) {
		var sheet = this.getSheetById(sheetId);
		return sheet != null ? sheet.getSheetName() : null;
	},
	
	/*id*/getSheetId: function(sheetName) {
		var sheet = this.getSheet(sheetName);
		return sheet != null ? sheet._id : null;
	},
	
	/**
	 * return sheet by name
	 */
	/*Sheet*/getSheet:function(sheetName){
		if(this._sheets)
		{
			for(var i=0; i<this._sheets.length; i++)
			{
				var sheet = this._sheets[i];
				if(sheet.getSheetName() == sheetName)
					return sheet;
			}
		}
		return null;
	},
	/**
	 * return sheet by id
	 */
	/*Sheet*/getSheetById:function(sheetid){
		if(this._sheets)
		{
			for(var i=0; i<this._sheets.length; i++)
			{
				var sheet = this._sheets[i];
				if(sheet._id == sheetid)
					return sheet;
			}
		}
		return null;
	},
	
	/**
	 * 1-based
	 */
	/*integer*/getSheetTabIndex:function(sheetName){
		var tab_index = 0;
		var cur_sheet = this.getSheet(sheetName);
		if (!cur_sheet.isSheetVisible())
			return tab_index;
		var sheet_index = cur_sheet.getIndex();
		
		if (sheet_index > 0)
		 tab_index = sheet_index;
		for (var i=1; i<sheet_index; i++){			
			var sheet = this._sheets[i-1]; 
			if (sheet && !sheet.isSheetVisible()){
				tab_index--;
			}
		}
		return tab_index;
	},
	
	/**
	 * 1-based 
	 */
	/*integer*/getSheetIndexByTabIndex:function(tabIndex){
		var index = 0;
		if (tabIndex > this._sheets.length){
			return index;
		}
		var i_tab = 0;
		while((i_tab != tabIndex) && index < this._sheets.length){
			var sheet = this._sheets[index];
			if (sheet.isSheetVisible())
				i_tab++;
			index++;
		}
		if (i_tab == tabIndex)
			return index;
		else
			return 0;
	},
	/**
	 * index: 1-based
	 * return tabIndex, 1-based 
	 */
	/*integer*/getSheetTabIndexByIndex:function(index){
		if (index > this._sheets.length || index < 1)
			return 0;
		var sheet = this._sheets[index-1];
		return this.getSheetTabIndex(sheet.getSheetName());
	},
	
	/*sheet*/getFirstVisibleSheet:function(){
		if(this._sheets)
		{
			for(var i=0; i<this._sheets.length; i++)
			{
				var sheet = this._sheets[i];
				if(sheet.isSheetVisible())
					return sheet;
			}
		}
		return null;
	},
	
	/**
	 * insert new sheet instance with name sheetName to specific position.If sheet event data exist,then the new
	 * instance sheet will be created with the data.
	 * before insert sheet,IDManager has insert a sheet id to the given position in array.
	 * @param sheetName 	sheet name
	 * @param index  		sheet position start from 1
	 * @param sheetData 	event data 
	 * @return 
	 */
	/*void*/insertSheet:function(sheetName,index,sheetData,mode)
	{
		// this is the undo delete sheet action
		if(sheetData && sheetData.uuid)
		{
			this._recoverManager.recoverSheet(sheetData.uuid,sheetName,index);
			return;
		}
		
		var sheetId = null;
		//reuse the sheet id  if it's the undo action of itself
		if(sheetData && sheetData.meta && sheetData.meta.sheetid)
		{
			var oriSheetId = sheetData.meta.sheetid;
			if((mode == websheet.Constant.MSGMode.UNDO)||(mode == websheet.Constant.MSGMode.REDO) 
				|| (oriSheetId.indexOf(websheet.Constant.IDPrefix.ORIGINAL_SHEET) == 0))
			{
				sheetId = oriSheetId;
			}
		}
		sheetId = this._idManager.insertSheetAtIndex(index - 1, sheetId, sheetName);
		var sheet = this._createSheet(sheetName,sheetId,index);
		if(sheetData && sheetData.meta)
		{
			if(mode == websheet.Constant.MSGMode.UNDO || mode == websheet.Constant.MSGMode.REDO )
			{
				this._idManager.initSheet(sheetId,sheetData.meta.row,sheetData.meta.col);
			}
			else
			{
				// this sheet is the original existed sheet, not a new insert sheet
				if((oriSheetId.indexOf(websheet.Constant.IDPrefix.ORIGINAL_SHEET) == 0))
					this._idManager.initSheet(sheetId,sheetData.meta.row,sheetData.meta.col,true);
			}
			websheet.model.ModelHelper.loadSheetJsonData(sheet,sheetData);
		}
	},
	
	/*
	 * move sheet from source Index to target index 
	 * @param srcIndex : source integer (base 1)
	 * @param tarIndex : target integer (base 1)
	 */
	/*void*/moveSheet:function(srcIndex,tarIndex)
	{
		if(srcIndex == tarIndex) return;

		var sheetId = this._idManager.getSheetIdByIndex(srcIndex -1);
		if (sheetId) this._idManager.moveSheet(sheetId, tarIndex - 1);
		if(srcIndex >=1 && srcIndex <= this._sheets.length && tarIndex>= 1 && tarIndex <=this._sheets.length)
		{
			var sheet = this._sheets[srcIndex-1];
			this._sheets.splice(srcIndex-1,1);
			this._sheets.splice(tarIndex-1,0,sheet);
		}
	},
	
	/**
	 * delete a sheet instance by sheet name
	 * @param sheetName sheet name
	 * @param uuid, using this uuid to identify the deleted sheet
	 * @return 
	 */
	/*void*/deleteSheet:function(sheetName,uuid){
		var sheet = this.getSheet(sheetName);
		if(uuid)
		{
			var idMeta = this._idManager._IDMap[sheet._id];
			this._recoverManager.backupSheet(sheet,idMeta,uuid);
		}

		//TODO: delete all the content of sheet, include row/column/cell/cell reflist in rows
		var index = sheet.getIndex() - 1;
		this._sheets.splice(index, 1);
		this._idManager.deleteSheetAtIndex(index);
	},
	/**
	 * rename sheet name
	 * @param sheetName 	sheet name
	 * @param newSheetName 	new sheet name
	 * @return 
	 */
	/*void*/renameSheet:function(sheetName,newSheetName){
		var sheet = this.getSheet(sheetName);
		sheet.rename(newSheetName);
		this._idManager.renameSheet(sheetName, newSheetName);
	},
	
	updateSheetVisibility: function(sheetName,vis)
	{
		var sheet = this.getSheet(sheetName);
		if (sheet.isSheetVisible() && vis == "visible" ||
			!sheet.isSheetVisible() && vis == "hide")
			return false;
		sheet.setSheetVisibility(vis);
		this._idManager.updateSheetVis(sheet.getId(), sheet.isSheetVisible());
		return true;
	},
	
	/**
	 * show or hide gridlines in sheet
	 * @param sheetName 	 sheet name
	 * @param show		     show or hide grid lines
	 * @return 
	 */
	/*void*/showGridLines: function(sheetName, show) {
		var sheet = this.getSheet(sheetName);
		if (sheet){
			sheet.setOffGridLines(!show);
		}
	},	
	
	getChart: function(chartId)
	{
		return this._charts[chartId];
	},
	
	/*********************************************row************************************/
	/**
	 * get row instance by index,if followStyle is true,will return row instance whose style followed 
	 * by specific row. 
	 * row start from 1
	 * @param sheetName 	sheet name
	 * @param rowIndex  	row instance index
	 * @param followStyle 	boolean value whether or not return row instance whose style followed by specific row 
	 * @return 
	 */
	/*Row*/getRow:function(sheetName,rowIndex,followStyle){
		var sheet = this.getSheet(sheetName);
		return sheet.getRow(rowIndex,followStyle);
	},
	/**
	 * get rows in from to end
	 * @param sheetName 	sheet name
	 * @param from  		start with 0
	 * @param end 	 
	 * @return 
	 */
	/*Array*/getRows:function(sheetName,from,end){
		var sheet = this.getSheet(sheetName);
		return sheet.getRows(from,end);
	},
	/**
	 * get the position in the rows array for the given row index
	 * @param rIndex: (integer) row index
	 * @param followStyle boolean value whether or not return row instance whose style followed by specific row
	 * @return index:  if index <0, not find
	 */
	/*integer*/getRowPosition: function(sheetName,rIndex,followStyle)
	{
		var sheet = this.getSheet(sheetName);
		return sheet.getRowPosition(rIndex,followStyle);
	},
	/**
	 * insert rows with event data which has row information,like row height,style,cell value and so on.
	 * this operation will insert new row instances with data
	 * row start from 1
	 * @param sheetName 	 sheet name
	 * @param startRowIndex  start row index
	 * @param endRowIndex	 end row index
	 * @param rowData		 event data (if this parameter not exist,then insert empty rows)
	 * @return 
	 */
	/*void*/insertRows:function(sheetName,startRowIndex,endRowIndex,followStyle,rowData,mode){
		var sheet = this.getSheet(sheetName);
		sheet.insertRows(startRowIndex,endRowIndex,followStyle,rowData,mode);
	},
	/**
	 * delete rows between start row index and end row index
	 * row start from 1
	 * @param sheetName 	 sheet name
	 * @param startRowIndex  start row index
	 * @param endRowIndex	 end row index
	 * @return 
	 */
	/*void*/deleteRows:function(sheetName,startRowIndex,endRowIndex, bCut, sheetDelta){
		var sheet = this.getSheet(sheetName);
		sheet.deleteRows(startRowIndex,endRowIndex, bCut, sheetDelta);
		if(bCut)
			this.removeRangesByUsage(new websheet.parse.ParsedRef(sheetName, startRowIndex, -1, endRowIndex, -1, websheet.Constant.DEFAULT_ROWS_MASK), websheet.Constant.RangeUsage.DATA_VALIDATION);
	},
	/**
	 * set rows with event data which has row information,like row height,style,cell value and so on.
	 * this operation will cover original data in rows between start row index and end row index.
	 * row start from 1
	 * @param sheetName 	 sheet name
	 * @param startRowIndex  start row index
	 * @param endRowIndex	 end row index
	 * @param rowData		 event data, only accepts json map
	 * @param bReplaceStyle  use to enable or disable styleCache
	 * @param bShowHide      true mean
	 * @return 
	 */
	/*void*/setRows:function(sheetName, startRowIndex, endRowIndex, rowData, bReplaceStyle,bShowHide, mode){
		var sheet = this.getSheet(sheetName);
		if (!bReplaceStyle) {
			this._styleManager.enableStyleChgCache();
		}
		try
		{
			var params = {forReplace:false, forRow:true, forShowHideRow: bShowHide};
			params.mode = mode;
			sheet.setRange(startRowIndex, endRowIndex, 1, websheet.Constant.MaxColumnIndex, rowData, params);
		}
		finally
		{
			//sheet.setRows(startRowIndex, endRowIndex, rowData, bReplaceStyle,bShowHide);
			if (!bReplaceStyle) {
				this._styleManager.disableStyleChgCache();
			}
		}
	},
	/**
	 * clear rows value not include style
	 * @param sheetName 	 sheet name
	 * @param startRowIndex  start row index
	 * @param endRowIndex	 end row index
	 * @return 
	 */
	/*void*/clearRows:function(sheetName,startRowIndex,endRowIndex){
		var sheet = this.getSheet(sheetName);
		sheet.clearRows(startRowIndex,endRowIndex);
	},
	
	clearRange: function(sheetName, startRowIndex, endRowIndex, startColIndex, endColIndex, bCut, sheetDelta) {
		var sheet = this.getSheet(sheetName);
		sheet.clearRange(startRowIndex, endRowIndex, startColIndex, endColIndex, bCut, sheetDelta);
		if(bCut)//remove data validations for the rangeAddress			
			this.removeRangesByUsage(new websheet.parse.ParsedRef(sheetName, startRowIndex, startColIndex, endRowIndex, endColIndex), websheet.Constant.RangeUsage.DATA_VALIDATION);
	},
	
	cutSheet: function(sheetName){
		this.deleteRows(sheetName, 1, this.maxSheetRows, true);
		this.deleteColumns(sheetName, 1, websheet.Constant.MaxColumnIndex, true);
	},
	
	/**
	 * move multiple continuous rows to specific position,only rows index change 
	 * row start from 1
	 * @param sheetName 	 	sheet name
	 * @param startRowIndex  	start row index(operation region)
	 * @param endRowIndex	 	end row index(operation region)
	 * @param toStartRowIndex  	start row index(target region)
	 * @param toEndRowIndex	 	end row index(target region)
	 * @return 
	 */
	/*void*/moveRows:function(sheetName,startRowIndex,endRowIndex,toStartRowIndex,toEndRowIndex){
		var sheet = this.getSheet(sheetName);
		sheet.moveRows(startRowIndex,endRowIndex,toStartRowIndex,toEndRowIndex);
	},
		
	/*********************************************column************************************/
	/**
	 * get column instance by index,if followStyle is true,will return column instance whose style followed 
	 * by specific column. 
	 * @param sheetName 	 sheet name
	 * @param colIndex  column instance index
	 * @param followStyle boolean value whether or not return column instance whose style followed by specific column 
	 * @return 
	 */
	/*Column*/getColumn:function(sheetName,colIndex,followStyle){
		var sheet = this.getSheet(sheetName);
		return sheet.getColumn(colIndex,followStyle);
	},
	 
	/**
	 * insert columns with event data which has column information,like column width,style,cell value and so on.
	 * this operation will insert new column instances with data
	 * @param sheetName 	 sheet name
	 * @param startColIndex  start column index
	 * @param endColIndex	 end column index
	 * @param colData		 event data (if this parameter not exist,then insert empty columns)
	 * @return 
	 */
	/*void*/insertColumns:function(sheetName,startColIndex,endColIndex,followStyle,colData,mode){
		var sheet = this.getSheet(sheetName);
		sheet.insertColumns(startColIndex,endColIndex,followStyle,colData,mode);
	},
	
	/**
	 * delete columns between start column index and end column index
	 * @param sheetName 	 sheet name
	 * @param startColIndex  start column index
	 * @param endColIndex	 end column index
	 * @return 
	 */
	/*void*/deleteColumns:function(sheetName,startColIndex,endColIndex,bCut, sheetDelta){
		var sheet = this.getSheet(sheetName);
		sheet.deleteColumns(startColIndex,endColIndex,bCut, sheetDelta);
		if(bCut)
			this.removeRangesByUsage(new websheet.parse.ParsedRef(sheetName, -1, startColIndex, -1, endColIndex, websheet.Constant.DEFAULT_COLS_MASK), websheet.Constant.RangeUsage.DATA_VALIDATION);
	},
	/**
	 * set columns with event data which has column information,like column width,style,cell value and so on.
	 * this operation will cover original data in columns between start column index and end column index.
	 * @param sheetName 	 sheet name
	 * @param startColIndex  start column index
	 * @param endColIndex	 end column index
	 * @param colData		 event data 
	 * @return 
	 */
	/*void*/setColumns:function(sheetName, startColIndex, endColIndex, colData, bReplaceStyle){
		var sheet = this.getSheet(sheetName);
		if (!bReplaceStyle) {
			this._styleManager.enableStyleChgCache();
		}
		try
		{
			sheet.setColumns(startColIndex, endColIndex, colData);
		}finally{
			if (!bReplaceStyle) {
				this._styleManager.disableStyleChgCache();
			}
		}
	},
//	/**
//	 * clear columns value not include style
//	 * @param sheetName 	 sheet name
//	 * @param startColIndex  start column index
//	 * @param endColIndex	 end column index
//	 * @return 
//	 */
//	/*void*/clearColumns:function(sheetName,startColIndex,endColIndex){
//		var sheet = this.getSheet(sheetName);
//		sheet.clearColumns(startColIndex,endColIndex);
//	},
	
	/*********************************************cell************************************/
	/**
	 * Get cell instance with given cellType by index,if followStyle is true,will return cell instance whose style followed 
	 * by specific cell. If cellType isn't specified, it is to get value cell. 
	 * @param sheetName 	sheet name
	 * @param rowIndex  	row instance index
	 * @param colIndex	 	column instance index
	 * @param cellType		cell type
	 * @param followStyle 	boolean value whether or not return cell instance whose style followed by specific cell 
	 * @return 
	 */
	/*Cell*/getCell:function(sheetName,rowIndex,/*integer*/colIndex,/*websheet.Constant.CellType*/cellType, followStyle){
		var sheet = this.getSheet(sheetName);
		if(!sheet)
			return null;		
		var cell = sheet.getCell(rowIndex,colIndex,cellType,followStyle);
		return cell;
	},
	/**
	 * set cell data, including value and style
	 */
	/*void*/setCell: function(sheetName, rowIndex, /*integer*/colIndex, cellJson, userId, bReplace, mode, bInheritFormat) {
		var sheet = this.getSheet(sheetName);
		sheet.setCell(rowIndex, colIndex, cellJson, userId, bReplace, mode, bInheritFormat);
	},
	
	/**
	 * set cell style with style attributes
	 */
	/*void*/setCellStyle:function(sheetName, rowIndex, /*integer*/colIndex, styleAttrs){
		var sheet = this.getSheet(sheetName);
		var styleId = null;
		if (styleAttrs) {
			if (styleAttrs.id) {
				styleId = styleAttrs.id;
			} else {
				styleId = this._styleManager.addStyle(styleAttrs);
			}
		}
		
		sheet.setCellStyleId(rowIndex, colIndex, styleId);
	},
	/**
	 * merge specific cell style with style attributes
	 */
	/*void*/mergeCellStyle:function(sheetName,rowIndex,/*integer*/colIndex,styleAttrs){
		var sheet = this.getSheet(sheetName);
		sheet.mergeCellStyle(rowIndex,colIndex,styleAttrs);
	},
	/**
	 * get cell style id
	 * First get style id of style cell, if not available, get from column model
	 */
	/*String*/getCellStyleId:function(sheetName,rowIndex,/*integer*/colIndex){
		var sheet = this.getSheet(sheetName);
		return sheet.getCellStyleId(rowIndex,colIndex);
	},
	/*
	 * merge cells from scIndex to ecIndex for each row between srIndex and erIndex
	 * srIndex, erIndex, scIndex,ecIndex {integer} base 1
	 */
	mergeCells: function(sheetName, srIndex, erIndex, scIndex,ecIndex)
	{
		var sheet = this.getSheet(sheetName);
		sheet.mergeCells(srIndex, erIndex, scIndex,ecIndex);
	},
	
	splitCells: function(sheetName, srIndex, erIndex, scIndex,ecIndex, bSplitAnyway)
	{
		var sheet = this.getSheet(sheetName);
		sheet.splitCells(srIndex, erIndex, scIndex,ecIndex, bSplitAnyway);
	},
	
	/*********************************************range reference************************************/
	setRange: function(sheetName, startRowIndex, endRowIndex, startColIndex, endColIndex, rangeJson, params) {
		var sheet = this.getSheet(sheetName);
		
		if (!params.forReplace) {
			this._styleManager.enableStyleChgCache();
		}
		try{
			//remove data validation in the range.
			var parsedRef = websheet.parse.ParsedRef(sheetName, startRowIndex, startColIndex, endRowIndex, endColIndex);
			if (params.forReplace){
				this.removeRangesByUsage(parsedRef, websheet.Constant.RangeUsage.DATA_VALIDATION);
			}
			sheet.setRange(startRowIndex, endRowIndex, startColIndex, endColIndex, rangeJson, params);
		}finally{
			if (!params.forReplace) {
				this._styleManager.disableStyleChgCache();
			}
		}
	},
	/*restore name range, called by insertrows/columns of dataconcentrator */
	restoreRange: function(undoRanges,startIndex,endIndex,type){
		for(var rangeId in undoRanges)
		{  
		   var delta = undoRanges[rangeId];
		   var usage = delta.usage;
		   var range = this._areaManager.getRangeByUsage(rangeId,usage);
		   if(range){
			   var rangeRef = this._getRestoredRange(range, delta, startIndex, endIndex, type);
			   if(rangeRef)
			   {
				  if(this.controller)
					  //use setRangeInfo so that for name range it can trackformula by areaManager
					  this.controller.setRangeInfo(rangeRef, {rangeid:rangeId, usage:usage}, websheet.Constant.MSGMode.NORMAL);
				  else
					  this._areaManager.updateRangeByUsage(rangeRef, rangeId, usage);
			  
				  if(delta.data)
				  {
				   		for(var attr in delta.data)
				   		{
				   			range.data[attr] = delta.data[attr]; //FIXME for Named Range
				   		}
				  }
		  	 	}
		   }
		}
	},
	
	//For OT
	unRestoreRange: function(rangeId,delta,startIndex,endIndex,type){
	   var usage = websheet.Constant.RangeUsage.NAME;
	   var range = this._areaManager.getRangeByUsage(rangeId,usage);
	   if(range){
		   var rInfo = range._getRangeInfo();
		   var end;
		   var start;
		  if(type == websheet.Constant.Event.SCOPE_ROW){
		  		end = rInfo.endRow;
				start = rInfo.startRow;
		  }else  if(type == websheet.Constant.Event.SCOPE_COLUMN){
		  	 end = rInfo.endCol;
		     start = rInfo.startCol;
		  }
		   if(start < startIndex && end > endIndex)
			   	return;
		   if(delta.startIndex ==1){
		   		if(start == startIndex){
		   			if(end == startIndex + delta.delta-1)
		   				start = end = -1;
		   			else
		   				start = startIndex + delta.delta;
		   		}
		   		else
		   			end = startIndex-1;
		   }else{
		   	    if(start == startIndex+delta.startIndex-1)
		   	    	start = end = -1;
		   	    else
		   	    	start =  start + delta.delta;
		   }
		   var rangeRef;
		   if(type == websheet.Constant.Event.SCOPE_ROW)
			   rangeRef = new websheet.parse.ParsedRef(rInfo.sheetName, start, rInfo.startCol, end, rInfo.endCol, websheet.Constant.RANGE_MASK);			   	  	
		   else if(type == websheet.Constant.Event.SCOPE_COLUMN)
			   rangeRef = new websheet.parse.ParsedRef(rInfo.sheetName,rInfo.startRow, start, rInfo.endRow, end, websheet.Constant.RANGE_MASK);	
		   if(rangeRef)
		  	   this._areaManager.updateRangeByUsage(rangeRef, rangeId, usage);
	   }
	},
	
	restoreChart: function(undoCharts,startIndex,endIndex,type){
		var refType = websheet.Constant.RefType.CAREFILTER | websheet.Constant.RefType.CARESHOWHIDE;
		for(var chartId in undoCharts){
			var dataSeqs = undoCharts[chartId];
			var chartDoc = this._charts[chartId];
			if(!chartDoc)
				continue;
			for(var seqKey in dataSeqs){
				var seqDeltas = dataSeqs[seqKey];
				var role = seqKey;
				var id;
				var idx = seqKey.indexOf(" ");
				if(idx > 0){
					role = seqKey.substring(0, idx);
					id = seqKey.substring(idx+1);
				}
				var dataSeq = chartDoc.getDataSequence(role,id);
				if(!dataSeq)
					continue;
				//if seqDelta has been set by UI, then continue
				for(var i =0; i< seqDeltas.length; i++){
					var delta = seqDeltas[i];
					if(delta){
						var range = dataSeq._refList[i];//dataSeq.putRef have already done this,check if the range is still in the areaManager, specially for invalid range, if yes, should endListening first
						if(range && range.getUsage() != websheet.Constant.RangeUsage.NAME){
							range.setContentDirty(true);
							var rangeRef = this._getRestoredRange(range, delta, startIndex, endIndex, type);
							if(rangeRef){
								var	ref = this._areaManager.startListeningArea(rangeRef, dataSeq);
								dataSeq.putRef(ref,i);
							}
						}
					}
				}
				dataSeq.setDirty(true);
			}
		}
	},
	
	_getRestoredRange: function(range,delta,startIndex,endIndex,type){
	   var rInfo = range._getRangeInfo();
	   var end;
	   var start;
	   if(type == websheet.Constant.Event.SCOPE_ROW){
		   end = rInfo.endRow;
		   start = rInfo.startRow;			   
	   }else if(type == websheet.Constant.Event.SCOPE_COLUMN){
	   	   end = rInfo.endCol;
		   start = rInfo.startCol;
	   }
	   if(start < startIndex && end > endIndex && !range.isValid())
		   start = end = -1;
	   if(!(start < startIndex && end > endIndex))
	   {	
		   if(delta.startIndex ==1){
		   	    if(start != -1){
		   	    	if(startIndex + delta.delta == start)
		   	    		start = startIndex;
		   	    	else
		   	    		end = end + delta.delta;
		   	    }
		   	    else{
		   	    	start = startIndex;
		   	    	end = startIndex + delta.delta-1;
		   	    }				   	    
		   }else{
		   		if(start!= -1)
		   			start = start - delta.delta;
		   		else{
		   			start = startIndex+delta.startIndex-1;
		   			end = start + delta.delta -1;
		   		}
		   }
	   }
   	   
	   var rangeRef;
	   var refMask = range.getParsedRef().refMask;
	   if(type == websheet.Constant.Event.SCOPE_ROW){
		   rangeRef= new websheet.parse.ParsedRef(rInfo.sheetName,start,rInfo.startCol,end,rInfo.endCol, refMask);			   	  	
	   }
	   else if(type == websheet.Constant.Event.SCOPE_COLUMN){
		   rangeRef= new websheet.parse.ParsedRef(rInfo.sheetName,rInfo.startRow,start,rInfo.endRow,end, refMask);
 	  }	
	  return rangeRef;
	},

	/*
	 * check model consistency and correctness, throw an exception for any error
	 * d: document object
	 */
	selfCheck: function() {
		var sheets = this._sheets;
		var error = "--- error found in model ---";
		dojo.forEach(sheets, function(s) {
			var rows = s._rows;
			var sheetName = s.getSheetName();
			dojo.forEach(rows, function(row) {
				var rowId = row._id + ",";
				if (row.getIndex() < 0) {
					console.log(error);
					console.log(row);
					throw ("row id not found. row index < 0");
				}
				if (this.rowIdStr.indexOf(rowId) > -1) {
					console.log(error);
					console.log(row);
					throw ("duplicated row id");
				}
				this.rowIdStr += rowId;
				// this.row is previous row
				if (this.row) {
					if (this.row.getIndex() + this.row.getGAP() + 1 != row.getIndex()) {
						var error = "The row " + this.row.getIndex() + " in " + sheetName + " has incorrect gap";
						console.log(error);
						console.log(this.row);
						console.log(row);
						throw ("incorrect row gap");
					}

					if (row.getRepeatedNum() > row.getGAP()) { // last row's gap should be equal to its repeated num
						var error = "The row " + row.getIndex() + " in " + sheetName + " has incorrect gap";
						console.log(error);
						console.log(row);
						throw ("incorrect row gap");
					}
					
					if (this.row.getIndex() + this.row.getRepeatedNum() >= row.getIndex()) {
						console.log(error);
						console.log(this.row);
						console.log(row);
						throw ("overlapped rows");
					} else {
						this.row = row;
					}
				} else {
					this.row = row;
				}				
				var cells = row.getValueCells(); // FIXME need to check style cells
				dojo.forEach(cells, function(c) {
					if (c.getCol() < 0) {
						console.log(error);
						console.log(c);
						console.log("column id not found, colIndex < 0");
					}
					if (c.isNull()) {
						console.log(error);
						console.log(c);
						if (c.getRepeatedNum()) {
							throw ("empty cells and repeatednum");
						} else {
							throw ("empty cells");
						}
					}
					var colId = "|" + c._id + ",";
					if (this.colIdStr.indexOf(colId) > -1) {
						console.log(error);
						console.log(c);
						throw ("duplicated column id");
					}
					this.colIdStr += colId;
					if (!websheet.model.ModelHelper.isEmpty(c.getRawValue()) && c.getRepeatedNum()) {
						console.log(error);
						console.log(c);
						throw ("cell has value and repeatednum");
					}
					// this.cell is previous cell
					if (this.cell) {
						if (this.cell.getCol() + this.cell.getRepeatedNum() >= c.getCol()) {
							console.log(error);
							console.log(this.cell);
							console.log(c);
							throw ("overlapped cells");
						} else {
							this.cell = c;
						}
					} else {
						this.cell = c;
					}
				}, {
					colIdStr: ""
				});
			}, {
				rowIdStr: ""
			});
			
			var columns = s._columns;
			dojo.forEach(columns, function(col) {
				var colId = col._id + ",";
				if (col.getIndex() < 0) {
					console.log(error);
					console.log(col);
					throw ("column id not found, column index < 0");
				}
				if (this.colIdStr.indexOf(colId) > -1) {
					console.log(error);
					console.log(col);
					throw ("duplicated column id");
				}
				this.colIdStr += colId;
				if (col.isNull()) {
					console.log(error);
					console.log(col);
					if (col.getRepeatedNum()) {
						throw ("empty columns and repeatednum");
					} else {
						throw ("empty columns");
					}
				}
				// this.column is previous column
				if (this.column) {
					if (this.column.getIndex() + this.column.getRepeatedNum() >= col.getIndex()) {
						console.log(error);
						console.log(this.column);
						console.log(col);
						throw ("overlapped columns");						
					}
				} else {
					this.column = col;
				}
			}, {
				colIdStr: ""
			});
		});
	},
	
	getLoadedSheets: function(includeHidden) {
		var ptMgr = this._partialMgr;
		var sheets = [];
		this._sheets.forEach(function(sheet) {
			if (ptMgr.isComplete(sheet._id)) {
				if (sheet.isSheetVisible() || includeHidden) {
					sheets.push(sheet);
				}
			}
		});
		return sheets;
	},
	
	isSheetLoaded: function(sheet) {
		if (sheet && sheet._id) {
			return this._partialMgr.isComplete(sheet._id);
		}
		return false;
	}
});