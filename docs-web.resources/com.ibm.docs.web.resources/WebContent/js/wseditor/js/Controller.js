dojo.provide("websheet.Controller");

dojo.require("websheet.Helper");
dojo.require("dojox.collections.Stack");
dojo.require("websheet.model.Document");
dojo.require("websheet.model.Sheet");
dojo.require("websheet.widget._RangePickRectangle");
dojo.require("websheet.widget._MobileRangePickRectangle");
dojo.require("websheet.widget.InlineEditor");
dojo.require("websheet.listener.BroadCaster");
dojo.require("websheet.Constant");
dojo.require("websheet.model.ModelHelper");
dojo.require("websheet.widget.AutoFilterHandler");
dojo.require("websheet.RangeDataHelper");
dojo.require("concord.util.BidiUtils");
dojo.declare('websheet.Controller', websheet.listener.BroadCaster, {
	_documentObj: null,
	_grids: {},
	editor: null,
	// flag for batch sendNotify for undo-delete, for details, refer to comments in function sendNotify4SetRange
	_bBatchNotify: false,
	_LOTS_OF_ROWS: 100,
	
	_rangeWorking: false,
	_areaListeners: null,
	
	constructor: function(args) {
		dojo.mixin(this, args);
		this._list = [];//initialize the broadcast list
	},
	
	// PUBLIC INTERFACE ////////////
	////////////////////////////////
	getDocumentObj: function() {
		if (!this._documentObj) {
			// always enable formula unless it is in html view mode
			var enableFormula = true, enableTask = true, enableComments = true, enableDataValidation = true, enableACL = true;
			var bSocial = websheet.Utils.isSocialEnabled();
			if (!bSocial) enableTask = false;
			
			if (this.editor.scene.isHTMLViewMode()) {
				enableFormula = false;
				enableTask = false;
				//enableComments = false;
				enableDataValidation = false;
				enableACL = false;
		        if (!this.editor.watermark && window.g_watermark && window.g_watermark.enabled && window.g_watermark.enabled.toLowerCase() == "true") {
		        	this.editor.watermark = websheet.Utils.normalizeTextWatermark();
				}
			}
			
			var maxSheetRows = this.editor.getMaxRow();
			var args = {controller: this, enableFormula: enableFormula, enableTask: enableTask, enableComments: enableComments, enableDataValidation: enableDataValidation,
						enableACL:enableACL, maxSheetRows: maxSheetRows, partialLevel: this.editor.partialLevel};
			this._documentObj = new websheet.model.Document(args);
			this._defaultSetRangeParam.userId = pe.authenticatedUser.getId();
		}
		
		return this._documentObj;
	},

	getGrid: function(sheetName) {
		return this._grids[sheetName];
	},
	
	getHighlightProvider: function(){
		if(this._highlightProvider)
			return this._highlightProvider;
		else
			return (this._highlightProvider = new websheet.widget.RangeHighlightProvider(this.editor));
	},
	
	getInlineEditor: function(grid){
		if (this._inlineEditor) {
			return this._inlineEditor;
		} else {
			return (this._inlineEditor = new websheet.widget.InlineEditor({editor: this.editor, grid: grid || this.editor.getCurrentGrid()}, dojo.create("div", null, dojo.body(), 'last')));
		}
	},

	// GRID ////
	//////////////////////	
	_deleteGrid: function(sheetName) {
		this._grids[sheetName].destroy();
		delete this._grids[sheetName];
	},

	_renameGrid: function(sheetName,newSheetName) {
		var grid = this._grids[sheetName];
		grid.sheetName = newSheetName;
		//update title
		var title = newSheetName;
		var sheet = this._documentObj.getSheet(newSheetName);
		var sheetId = sheet.getId();
		var workSheetContainer = this.editor.getWorksheetContainer();
		if (title.substring(0, 1) == "'") {
			title = title.substring(1, title.length - 1);
		}
		var shortenedTitle = websheet.BrowserHelper.shortenName4Display(title,this.MAX_TITLE_CHARS);
		shortenedTitle = websheet.Helper.escapeXml(shortenedTitle, null, true);
		shortenedTitle = shortenedTitle.replace(/\ /g,"&nbsp;");
		var titleStr = '<span title="' + websheet.Helper.escapeXml(title, null, true) + ' " id="' + workSheetContainer.TITLE_ID + sheetId +  '" ' + BidiUtils.generateDirAttr(title) + '>' +shortenedTitle  + '</span>';
		if(sheet.isProtected())
			titleStr = titleStr + '<img src='+ this.editor.lockIcon + ' alt="' + this.editor.nls.PROTECTEDSHEET + '"></img>';
		grid.title = titleStr;
		delete this._grids[sheetName];
		this._grids[newSheetName] = grid;
	},

	reset: function() {
		//delete filters
		//destroy the filter headers
		var areaMgr = this._documentObj.getAreaManager();
		var filterHandler = this.editor.getAutoFilterHdl();
		var filters = filterHandler.filters;
		for(var name in filters) {
			var filter = filters[name];
			if(filter && filter._header)
				filter._header.destroy();
			
			areaMgr.endListeningArea(filter.broadcaster,filter);
			filter.broadcaster = null;
		}
		filterHandler.filters= {};
		for(var name in this._grids) {
			filterHandler.deleteFilter(name);
		}
		if(this.editor.hasACLHandler())
		{
			var aclHandler = this.editor.getACLHandler();
			aclHandler.destory();
		}
		this.editor._aclHandler = null;
		
		this._areaListeners = null;
		
		this.editor.getWorksheetContainer().clearWorksheets();
		this.editor._clipboard.onGridReset();
		this.editor._formatpainter.onGridReset();
		// reset grids
		for (var idx in this._grids) {
			this._deleteGrid(idx);
		}
		this._grids = {};
	},
	
	_deleteSheet:function(sheetName) {
		this.editor.getWorksheetContainer().removeWorksheet(sheetName);
		this._deleteGrid(sheetName);
	},
	
	hideSheet:function(sheetName) {
		if (!this._documentObj.updateSheetVisibility(sheetName,"hide"))
			return;
		
		var params = {sheetName: sheetName};
		this.editor.publishForMobile({"name": "hideSheet", "params":[params]});

		var source = {};//broadcaste sort range
		source.action = websheet.Constant.DataChange.HIDE;
		source.refType = websheet.Constant.OPType.SHEET;
		source.refValue = sheetName;
		//when set cell rawValue, there might produce a circular reference
		//so the value of  cells in the circular are also changed.
		var e = new websheet.listener.NotifyEvent(websheet.Constant.EventType.DataChange, source);
		this.broadcast(e);

		this.editor.getWorksheetContainer().hideWorksheet(sheetName);
		this.validateSheet(sheetName);
		var grid = this.getGrid(sheetName);
		var selector = grid.selection.selector();
		if (selector.isAutofilling())
			selector.autofillApply();
	},
	
	unhideSheet:function(sheetName, from_event){
		if (!this._documentObj.updateSheetVisibility(sheetName,"visible"))
			return;

		var params = {sheetName: sheetName};
		this.editor.publishForMobile({"name": "showSheet", "params":[params]});

		var source = {};
		source.action = websheet.Constant.DataChange.SHOW;
		source.refType = websheet.Constant.OPType.SHEET;
		source.refValue = sheetName;
		var e = new websheet.listener.NotifyEvent(websheet.Constant.EventType.DataChange, source);
		this.broadcast(e);
		
		var sheettab_index = this._documentObj.getSheetTabIndex(sheetName);
		var grid = this.getGrid(sheetName);
		if (grid == undefined)
			grid = this.createWorksheet(sheetName, sheettab_index-1);
		else
		{
			this.editor.getWorksheetContainer().addChild(grid, sheettab_index-1 );
		}
		//if unhide comes from remote event or undo/redo event, 
		//it will not set unhide sheet as current/active sheet
		if (!from_event && !this.editor.isMobile())
			this.editor.getWorksheetContainer().showWorksheet(sheetName);
		
		if(this.editor.hasACLHandler())
		{
			this.editor.getACLHandler().handleShowSheet(sheetName);
		}
	},
	
	validateSheet: function(sheetName)
	{
		var grid = this.getGrid(sheetName);
		if (grid) {
			grid.requestUpdate();
		}
	},

	getRangePicker:function(grid, getCanvasPicker)
	{
		// summary:
		//		Should use data grid's SelectionManager to get picker's instance.
		if (this._rangePicker && !this._rangePicker._destroyed) {
			return this._rangePicker;
		} else {
			if(this.editor.scene.bMobileBrowser)
				return (this._rangePicker = new websheet.widget._MobileRangePickRectangle({grid: grid || this.editor.getCurrentGrid()}));
			else
				return (this._rangePicker = new websheet.widget._RangePickRectangle({grid: grid || this.editor.getCurrentGrid()}));
		}
	},

	/// LOAD and INITIALIZE /////
	_initialize: function() {
		dojo.forEach(this.getDocumentObj().getSheets(),function(sheet,index){
			if (sheet.isSheetVisible()){			
				this.createWorksheet(sheet.getSheetName());
			}
		},this);
		this.editor.getWorksheetContainer().resize();
	},

	setDocumentObj: function(obj, criteria, bJoin) {
		if(obj && obj.html){
			var compareWnd = window.open("", "compare");
			if(compareWnd){
				var body = compareWnd.document.getElementsByTagName("body")[0];
				body.innerHTML = obj.html;
			}
		}
		
		if (bJoin) {
			var styles = obj.content.styles;
			if (styles) {
				var height = styles.defaultrowstyle ? styles.defaultrowstyle[websheet.Constant.Style.HEIGHT] : websheet.Constant.defaultRowHeight;
				var width =  styles.defaultcolumnstyle ? styles.defaultcolumnstyle[websheet.Constant.Style.WIDTH] : websheet.Constant.DEFAULT_COLUMN_WIDTH;
				var maxRow = this.editor.getMaxRow();
				var data = websheet.Helper.cloneJSON(obj.meta);
				data.unnames = obj.content.unnames;
				data.comments = obj.content.comments;
				data.names = obj.content.names;
				data.charts = obj.content.charts;
				this.editor.publishForMobile({"name": "loadSheetMeta", "params":[data, height, width, maxRow]});
			}
		} else {
			var data = websheet.Helper.cloneJSON(obj.meta);
			data.loadedSheet = criteria.sheet;
			data.charts = obj.content.charts; // chart json are loaded per sheet
			this.editor.publishForMobile({"name": "loadSheetMeta2", "params":[data]});
		}
		
		this._documentObj = this.getDocumentObj();
		if (obj.meta.hasMoreContent) {
			// if document has more content to go, set flag in this timer
			this._documentObj._moreContentSheets[criteria.sheet] = true;
		}
		try {
			this._documentObj.init(obj, criteria, bJoin);
		} catch (e) {
			if (this._documentObj.isLoading)
			{
				this._documentObj.isLoading = false;
				this.editor.scene.hideErrorMessage(); // hide loading message
				this.editor.scene.showErrorMessage(this.editor.nls.Corrupted_Spreadsheet_MSG);
			}
		}

		if (this._documentObj._coverInfos.length > 0) {
			this.editor.publishForMobile({"name": "loadMergeCell", "params":[this._documentObj._coverInfos]});
			this._documentObj._coverInfos = [];
		}

		this.editor.getFreezeHdl(); // start the listener for freezewindow handler
		if (bJoin) {
			if (this.editor.scene.isHTMLViewMode()) {
				var editor = this.editor;
				editor.setFocusFlag(false);
				setTimeout(function () {
					editor.setFocusFlag(true);
				}, 1000);
			}
			// first time loading
			this.reset();
			this._initialize();
	        
			//show the select rectangle
			var sheetName = this._documentObj.getSheetName(obj.meta.loadedSheet);
			if (!sheetName) {
				var firstVisibleSheet = this._documentObj.getFirstVisibleSheet();
				sheetName = firstVisibleSheet.getSheetName();
			}
			var grid = this.getGrid(sheetName);
			if (grid) {
				this.editor.getWorksheetContainer().selectChild(grid);
			}
			var formulaBar = this.editor.getFormulaBar();
			if (formulaBar) formulaBar.onSwitchSheet(sheetName);
			
			if (window.g_docMimeType == "text/csv" && (obj.meta.csv == undefined)) {
				this.editor.importFromFile(true);
			}
		} else {
			var cm = this.editor.getCalcManager();
			cm._hasHighPriority = true;
			// not first time loading
			if (criteria && criteria.sheet)
			{
				// update sheet max column index and max row index if needed
				// get criteria sheet
				var sheetId = criteria.sheet;
				var sheet = this._documentObj.getSheetById(sheetId);
				var grid = this._grids[sheet.getSheetName()];
				if (grid) {
					// remove all current row height/column information and re-build the grid;;
					grid.updateAll();
					// update max row index
					var maxRowIndex = sheet.initMaxRowIndex;
					if (maxRowIndex) {
						grid.updateRowCount(maxRowIndex);
					}
				}
			}	// ok for update max row index and column index
		}

		// the first time convert this doc
		if(DOC_SCENE.jobId != "null" && obj.unsupport_feature)
		{
			var unsup = obj.unsupport_feature.unsupport_feature;
			var list = null;
			if(unsup)
			{
				list = unsup.split(",");
				if(list.length > 0)
					this.editor.showUnsupFeatureDlg(list);
			}
		}
	},
	
	// return true if it need get data from server
	// if bSync set to true, for partial level set to 2 (per row), getPartial() will request for partialRowCount rows instead of 
	// a whole sheet
	getPartial:function(sheetName, bSync){
		var doc = this.getDocumentObj();
		var sheet = doc.getSheet(sheetName);
		if(!sheet){
			console.log("there is no sheet with name " + sheetName + " when getPartial");
			return false;
		}
		var sheetId = sheet.getId();
		var partialManager = websheet.model.ModelHelper.getPartialManager();
		var bPartialLoading = false;
		try{
			bPartialLoading = doc.getPartialLoading(sheetId);
			if(!bPartialLoading && (
				doc._moreContentSheets == null || (doc._moreContentSheets && !doc._moreContentSheets[sheetId]))) {
				// if not partial loading, and the target sheet not waiting for 2nd response(more content), goes to getPartial request.
				var unloadedCharts = doc.getUnLoadedChartsId(sheetName);
				var criteria;
				if (bSync) {
					criteria = partialManager.getPartialCriteria(sheetId, 1, g_partialRowCnt);
				} else {
					criteria = partialManager.getPartialCriteria(sheetId);
				}
				
				if(unloadedCharts.length>0 && criteria==null)
				{
					criteria = {};
					criteria.sheet = sheetId;
				}
				if(criteria){
					// TODO we should setPartialLoading() in scene.getPartial(). current code
					// will cause dependency between a GetPartial task and the partial-loading flag in 
					// editor.execCommand() when pending tasks.
					// for sync, it is safe to move setPartialLoading() to scene.getPartial(),
					// for async, we can use comparator to prevent from add duped getPartial tasks,
					// but we need test in such case since we postpone setPartialLoading().
					if(unloadedCharts.length>0)
						criteria.charts = unloadedCharts;

					var loadedCharts = doc.getLoadedChartsIdInOtherSheets(sheetName);
					if(loadedCharts.length > 0)
						criteria.loadedCharts = loadedCharts;
					
					doc.setPartialLoading(sheetId,true);
					bPartialLoading = true;
					if(bSync) {
						this.editor.scene.disableEdit();
						this.editor.scene.getPartial(criteria);
					}
					else {
						// postpone getPartial by adding it as a async task, to make it run after sendMessage() happens
						// if the action causing getPartial leads to a sync sendMessage, the task will get run after the timer completes
						// if else, the action leads to an async sendMessage, the priority of GetPartial is lower than SendMessage, 
						// make it run after SendMessage.
						var taskMan = this.editor.getTaskMan();
						taskMan.addTask(this.editor.scene, "getPartial", [criteria], taskMan.Priority.GetPartial);
						taskMan.start();
					}
				}
			}
			if(bPartialLoading){
				//interrupt partial calculate until partial loading is finished
				var partialCalcMgr = this.editor.getPartialCalcManager();
				var currentTask = this.editor.getTaskMan()._current;
				if(currentTask){
					var scope = currentTask.scope;
					if(scope instanceof websheet.model.PartialCalcManager)
						partialCalcMgr = scope;
				}
				var interruptFunc = partialCalcMgr._interruptFunc;
				if(interruptFunc)
					partialManager.addNotify(interruptFunc);//TODO: how to make sure that the notify method is not duplicate
				partialCalcMgr.reset(true);
				var cm = this.editor.getCalcManager();
				cm.pauseTasks();
			}
		}catch(e){
			console.log("partial loading error", e);
			doc.setPartialLoading(sheetId,false);
		}
		
		return bPartialLoading;
	},

	//update Task and Comments for lazy loading if event is null, for example switch sheet or scroll
	//or merge/split cells, show/hide rows event happens
	updateUI: function(sheetName){
		//Only be called after grid has been constructed
		var grid = this.getGrid(sheetName);
		if(grid && this.editor.getCurrentGrid()){
			var taskHdl = this.editor.getTaskHdl();
			if (taskHdl) taskHdl.redrawTask(sheetName);

            var nameHdl = this.editor.getNameRangeHdl();
            nameHdl.updateUI();
            
			var filterHdl = this.editor.getAutoFilterHdl();
			filterHdl.update(grid);
			
			/**
			 * Update images/charts
			 */
			if(!grid._skipImgRender){
				this.editor.getDrawFrameHdl().drawAll(sheetName);
			}
			
			grid.updateFreezebarShadow();
			this.editor.getCommentsHdl().commentBoxReLocation();
			var dataValidationHdl = this.editor.getDataValidationHdl();
	 		if(dataValidationHdl)
	 			dataValidationHdl.updateUI();
			if(this.editor.hasACLHandler())
				this.editor.getACLHandler().updateUI();
		}
	},

	/**
	 * Creates a visual representation for a given Sheet + Data
	 *
	 * @param {Object} sheetName
	 * @param {Object} sheetData
	 */
	createWorksheet: function(sheetName, position) {
		var sheetId = this._documentObj.getSheet(sheetName).getId();
		var grid = this.editor.getWorksheetContainer().newWorksheet(sheetName, sheetId, position);
		this._grids[sheetName] = grid;		
		// subscribe topics related to "moreDocumentLoad". the function only works in new scroller
		grid.own(
			dojo.subscribe("/websheet/moreDocumentLoad/" + sheetName, dojo.hitch(grid, grid.onMoreDocumentLoad)),
			dojo.subscribe("/websheet/moreDocumentLoaded/" + sheetName, dojo.hitch(grid, grid.onMoreDocumentLoaded))
//			dojo.subscribe("_cellFocusMoveIn" + sheetName, dojo.hitch(grid, grid.onCellFocusMoved))
		);
		return grid;
	},
	
	////// MODEL OPERATIONS ///////////////////////
	
	setFilterInfo: function(refValue, data, mode)
	{
		var bLocal = (mode === undefined);
		if (!bLocal) {
			var ref = websheet.Helper.parseRef(refValue);
			var params = {sheetName: ref.sheetName, startRow: ref.startRow, startCol: ref.startCol, endRow: ref.endRow, endCol: ref.endCol, data: data};
			this.editor.publishForMobile({"name": "setRangeInfo", "params":[params]});
		}
		
		this.editor.getAutoFilterHdl().setFilterInfo(refValue, data, mode);
	},
	
	/*void*/setRowsHeight: function(sheetName, rowIndex, eRowIndex, rowsData, mode) {
		var params = {sheetName: sheetName, startRow: rowIndex, endRow: eRowIndex, rowData: rowsData};
		this.editor.publishForMobile({"name": "setRow", "params":[params]});

		this.setRows(sheetName, rowIndex, eRowIndex, rowsData, false, mode);
		
		var type = websheet.Constant.EventType.DataChange;
		var source = {};
		source.action = websheet.Constant.DataChange.CHANGEHEIGHTORWIDTH;
		source.refType = websheet.Constant.OPType.ROW;
		source.refValue = new websheet.parse.ParsedRef(sheetName, rowIndex, -1, eRowIndex, -1,  websheet.Constant.ROWS_MASK);
		var e = new websheet.listener.NotifyEvent(type, source);
		this.broadcast(e);
	},
	
	setRows: function(sheetName, rowIndex, eRowIndex, oriRowsData, bReplaceStyle, mode, bUpdateChart){
		if (!eRowIndex || eRowIndex < 1) {
			eRowIndex = rowIndex;
		}
		
		this._documentObj.setRows(sheetName, rowIndex, eRowIndex, oriRowsData, bReplaceStyle, false, mode);
		
		var grid = this.getGrid(sheetName);
		if (grid) {
			var sr = rowIndex - 1;
			var er = eRowIndex - 1;
			if (bReplaceStyle || websheet.Utils.isJsonHasBorderStyle(oriRowsData))
			{
				sr = (sr - 1) < 0 ? 0 : (sr - 1);
				er = er + 1;
			} 
			grid.updateRows(sr, er);
		}
		
		// for the undo event of clear rows
		var utils = websheet.Utils;
		var bUpdate = utils.isJSONContainValue(oriRowsData, utils.hasValue);
		if (bUpdate || bUpdateChart)
		{
			var refValue = websheet.Helper.getAddressByIndex(sheetName, rowIndex, "A", null, eRowIndex, websheet.Constant.MaxColumnChar);
			this.sendNotify4SetRange(refValue);
		}
	},	

	_defaultSetRangeParam: 
	{
	    forReplace: true,
	    forColumn: false,
	    userId: null,
	    bUpdateChart: false,
	    forRow: false,
	    ignoreFilteredRow:false
    },
    
	/**
	 * Set range in async, break operations in setTimeout(..., 0) pieces. Parameter params is the same with the sync setRange, except for 2
	 * more values:
	 * callback: callback function when async is done
	 * error: call back function when there's error (exception) during the alg.
	 */
	asyncSetRange: function(sheetName, startRowIndex, endRowIndex, startColIndex, endColIndex, rangeJson, params) {
		this._rangeWorking = true;
		params = dojo.mixin({}, this._defaultSetRangeParam, params);
		var bReplace = params.forReplace;
		var bColumn = params.forColumn;
		var userId = params.userId;
		var bUpdateChart = params.bUpdateChart;
		var bRow = params.forRow;

		if (endRowIndex < startRowIndex)
		{
			var temp = endRowIndex;
			endRowIndex = startRowIndex;
			startRowIndex = temp;
		}
		
		if (endColIndex < startColIndex)
		{
			var temp = endColIndex;
			endColIndex = startColIndex;
			startColIndex = temp;
		}
		
		var mergeCells = [];
		if (rangeJson.rows) {
			for (var rowIndex in rangeJson.rows) {
				var cells = rangeJson.rows[rowIndex].cells;
				for (var col in cells) {
					var cellJson = cells[col];
					if (cellJson.rs || cellJson.cs) {
						rowIndex = parseInt(rowIndex);
						var colIndex = websheet.Helper.getColNum(col);
						var endRow = rowIndex, endCol = colIndex;
						if (cellJson.rs) endRow = endRow + cellJson.rs - 1;
						if (cellJson.cs) endCol = endCol + cellJson.cs - 1;
						mergeCells.push({sheetName: sheetName, startRow: rowIndex, startCol: colIndex, endRow: endRow, endCol: endCol});
					}
				}
			}
		}
		
		var tm = this.editor.getTaskMan();
		tm.addTask(this, "_preSetRange", [sheetName, startRowIndex, endRowIndex, startColIndex, endColIndex, bReplace, bColumn && bRow, mergeCells, params.bRCmts], tm.Priority.UserOperation);
		
		var rangeWidth = endColIndex - startColIndex + 1;
		var rangeHeight = endRowIndex - startRowIndex + 1;
		var threshold = websheet.Constant.THRESHOLD_SPLIT_SET_RANGE;
		if (threshold != -1 && rangeWidth * rangeHeight > threshold)
		{
			// split setRange() operation to smaller parts
			// each part has maximum row count of partMaxRow
			var partMaxRow = Math.round(threshold / rangeWidth);
			var partStartRowIndex = startRowIndex;
			var partEndRowIndex = null;
			var partRangeJson = {};
			var rowsJson = rangeJson.rows || rangeJson;
			var bFirst = true;
			var start, end;
			if (dojo.isArray(rowsJson))
			{
				start = 0;
				end = rowsJson.length - 1;
			}
			else
			{
				start = startRowIndex;
				end = endRowIndex;
			}
			
			// access the row json, no matter a map(un-ordered) or an array (ordered) in an ordered way.
			for (var rowIndex = start; rowIndex <= end; rowIndex++)
			{
				var row = rowsJson[rowIndex];
				if (row == null)
				{
					continue;
				}
				
				partRangeJson[rowIndex] = row;
				var repeat = row.rn;
				if (repeat == null)
				{
					repeat = 0;
				}
				partEndRowIndex = rowIndex = rowIndex + repeat;
				if (partEndRowIndex - partStartRowIndex  + 1 > partMaxRow)
				{
					// current part range json exceeds max row according to threshold, generate a partial setRange,
					// it can't be a "bColumn" since column message should only apply once
					if (bFirst && bColumn)
					{
						// if message is to set column, only apply column width and style at first call
						partRangeJson = { rows: partRangeJson };

						if(rangeJson.columns)
							partRangeJson.columns = rangeJson.columns;
						if(rangeJson.bFollowPart)
							partRangeJson.bFollowPart = true;
						if (rangeJson.rn != null)
						{
							partRangeJson.rn = rangeJson.rn;
						}
						// this call copies a new params so not affected by following reset forColumn
						tm.addTask(this._documentObj, "setRange", [sheetName, partStartRowIndex, partEndRowIndex, startColIndex, endColIndex, partRangeJson, dojo.mixin({}, params)], tm.Priority.UserOperation);
						// disable params.forColumn for future use
						params.asyncNotFirst = true;
					}
					else
					{
						tm.addTask(this._documentObj, "setRange", [sheetName, partStartRowIndex, partEndRowIndex, startColIndex, endColIndex, partRangeJson, params], tm.Priority.UserOperation);
					}
					
					bFirst = false;
					partStartRowIndex = partEndRowIndex + 1;
					partEndRowIndex = null;
					partRangeJson = {};
				}
			}

			if (partEndRowIndex != null || bFirst)
			{
				// has data left, or still being bFirst
				partEndRowIndex = endRowIndex;
				if (bFirst)
				{
					// still being bFirst, indicates that original rangeJson has rows data less then threshold, no setRange()
					// scheduled in previous FOR, only 1 setRange needed, no need to be sliced,
					// call setRange with orignal params
					tm.addTask(this._documentObj, "setRange", [sheetName, startRowIndex, endRowIndex, startColIndex, endColIndex, rangeJson, params], tm.Priority.UserOperation);
				}
				else
				{
					tm.addTask(this._documentObj, "setRange", [sheetName, partStartRowIndex, partEndRowIndex, startColIndex, endColIndex, partRangeJson, params], tm.Priority.UserOperation);
				}
			}
		}
		else
		{
			tm.addTask(this._documentObj, "setRange", [sheetName, startRowIndex, endRowIndex, startColIndex, endColIndex, rangeJson, params], tm.Priority.UserOperation);
		}
		
		tm.addTask(this, "_notifySetRange", [sheetName, startRowIndex, endRowIndex, startColIndex, endColIndex, rangeJson, bReplace, bColumn, bUpdateChart, params], tm.Priority.UserOperation);
		
		var lastTask = tm.addTask(this, "_postSetRange", [sheetName, startRowIndex, endRowIndex, startColIndex, endColIndex, rangeJson, bReplace, bColumn], tm.Priority.UserOperation);
		if (params.callback) {
			lastTask.addCallback(params.callback);
		}
		
		if (params.error) {
			lastTask.addErrback(params.error);
		}
		
		tm.start();
	},	
	
	/*
	 * Due to long history, this function accepts 3 kinds of rangeJson:
	 * 
	 * 1) { rows: { ... }, ... }, from Connector, paste ops
	 * 2) { <row index>: { ... }, ... }, from set style, etc.
	 * 3) [..., <row index>: { ... }], from sort
	 * The 3rd one happened to work because JS foreach supports this array. TODO may need to unify this in the future
	 */
	setRange: function(sheetName, startRowIndex, endRowIndex, startColIndex, endColIndex, rangeJson, params)
	{
	    params = dojo.mixin({}, this._defaultSetRangeParam, params);
	    var bReplace = params.forReplace;
        var bColumn = params.forColumn;
        var userId = params.userId;
        var bUpdateChart = params.bUpdateChart;
        var bRow = params.forRow;
		if (endRowIndex < startRowIndex) {
			var temp = endRowIndex;
			endRowIndex = startRowIndex;
			startRowIndex = temp;
		}
		if (endColIndex < startColIndex) {
			var temp = endColIndex;
			endColIndex = startColIndex;
			startColIndex = temp;
		}
		
		var mergeCells = [];
		if (rangeJson.rows) {
			for (var rowIndex in rangeJson.rows) {
				var cells = rangeJson.rows[rowIndex].cells;
				for (var col in cells) {
					var cellJson = cells[col];
					if (cellJson.rs || cellJson.cs) {
						rowIndex = parseInt(rowIndex);
						var colIndex = websheet.Helper.getColNum(col);
						var endRow = rowIndex, endCol = colIndex;
						if (cellJson.rs) endRow = endRow + cellJson.rs - 1;
						if (cellJson.cs) endCol = endCol + cellJson.cs - 1;
						mergeCells.push({sheetName: sheetName, startRow: rowIndex, startCol: colIndex, endRow: endRow, endCol: endCol});
					}
				}
			}
		}
		
		this._preSetRange(sheetName, startRowIndex, endRowIndex, startColIndex, endColIndex, bReplace, bColumn && bRow, mergeCells, params.bRCmts);
		
		this._documentObj.setRange(sheetName, startRowIndex, endRowIndex, startColIndex, endColIndex, rangeJson, params);
		
		this._notifySetRange(sheetName, startRowIndex, endRowIndex, startColIndex, endColIndex, rangeJson, bReplace, bColumn, bUpdateChart, params);
		
		this._postSetRange(sheetName, startRowIndex, endRowIndex, startColIndex, endColIndex, rangeJson, bReplace, bColumn);
	},
	
	_preSetRange: function (sheetName, startRowIndex, endRowIndex, startColIndex, endColIndex, bReplace, bAll, mergeCells, bRCmts)
	{
		if(bReplace)
		{
			// for copy/cut paste, we need split the merged cell in the range first
			if(!bAll){
				this.splitCells(sheetName, startRowIndex, endRowIndex, startColIndex, endColIndex, true);
				if (mergeCells && mergeCells.length > 0)
					this.editor.publishForMobile({"name": "mergeCell", "params": mergeCells});
			}
			if(bRCmts){
				this.deleteComments(sheetName, startRowIndex, startColIndex, endRowIndex, endColIndex);
			}
			var params = {sheetName: sheetName, startRow: startRowIndex, startCol: startColIndex, endRow: endRowIndex, endCol: endColIndex};
			this.editor.publishForMobile({"name": "clearRange", "params":[params]});
		}
	},
	
	/*
	 * sendNotify work for setRange
	 */
	_notifySetRange: function(sheetName, startRowIndex, endRowIndex, startColIndex, endColIndex, rangeJson, bReplace, bColumn, bUpdateChart, params) {
		//for clear range content then undo, both bReplace and bUpdate are false, but still need notify
		var utils = websheet.Utils;
		var rowsJson = rangeJson.rows || rangeJson;
		var bValue = utils.isJSONContainValue(rowsJson, utils.hasValue);
		
		if(bReplace || bValue || bUpdateChart)
		{
			if(bColumn)
			{
				startRowIndex = 1;
				endRowIndex = this.editor.getMaxRow();
			}
			var refValue = websheet.Helper.getAddressByIndex(sheetName, startRowIndex, startColIndex, null, endRowIndex, endColIndex);
			this.sendNotify4SetRange(refValue, params);
		}
	},
	
	/*
	 * UI work after setRange ALG done
	 */
	_postSetRange: function(sheetName, startRowIndex, endRowIndex, startColIndex, endColIndex, rangeJson, bReplace, bColumn) {
		//update grid cache
		var grid = this.getGrid(sheetName);
		if (!grid) {
			this._rangeWorking = false;
			return;
		}
		this.editor.getPartialCalcManager().calcVisibleFormula();
		// update grid ui
		if (bColumn) {
			grid.updateAll();
		} else {
			var sr = startRowIndex - 1;
			var er = endRowIndex - 1;
			var rowsJson = rangeJson.rows || rangeJson;
			if (bReplace || websheet.Utils.isJsonHasBorderStyle(rowsJson)) 
			{
				sr = (sr - 1) < 0 ? 0 : (sr - 1);
				er = er + 1;
			} 
			grid.updateRows(sr, er);
		}
		this._rangeWorking = false;
	},
	
	setColumns: function(sheetName, startCol, endCol, colJson, params) {
		var grid = this._grids[sheetName];
		var bReplaceStyle = false;
		var bUpdateChart = false;
		if(params){
			bReplaceStyle = params.bReplaceStyle;
			bUpdateChart = params.bUpdateChart;
		}
		var wcs = websheet.Constant.Style;
		var repNum = endCol - startCol;
		var sColIndex = websheet.Helper.getColChar(startCol);
		var eColIndex = websheet.Helper.getColChar(endCol);
    	var data = {};
    	var colsMeta = {};
    	//show /hide columns
    	if(undefined != colJson.visibility)
    	{
    		colsMeta[sColIndex] = {"rn":repNum,"visibility":colJson.visibility};
    		data.columns = colsMeta;
    	}	
    	//adjust column width
    	else if(undefined !== colJson[wcs.WIDTH])
    	{
    		colsMeta[sColIndex]  = {"rn":repNum}; colsMeta[sColIndex][wcs.WIDTH] = colJson[wcs.WIDTH];
    		data.columns = colsMeta;
    	}
    	// set style for columns
    	else if(colJson.style)
    	{
    		colsMeta[sColIndex] = { "rn":repNum, "style": colJson.style};
    		data.columns = colsMeta;
    	}	
    	//the others: undo set style for column
    	else
    	{
    		data = colJson;
    	}	
    	
		var params = {sheetName: sheetName, startCol: startCol, endCol: endCol, colData: data};
		this.editor.publishForMobile({"name": "setColumn", "params":[params]});

		this._documentObj.setColumns(sheetName, startCol, endCol, data, bReplaceStyle);
		
		if(bUpdateChart)
		{
			var refValue = websheet.Helper.getAddressByIndex(sheetName, 1, sColIndex, null, this.editor.getMaxRow(), eColIndex);
			this.sendNotify4SetRange(refValue);
		}
		
		if (colJson.visibility !== undefined) {
			/***********grid update**************/
			/***********broadcast show/hide col event**************/
			var type = websheet.Constant.EventType.DataChange;
			var source = {};
			if(colJson.visibility == websheet.Constant.COLUMN_VISIBILITY_ATTR.HIDE)
				source.action = websheet.Constant.DataChange.HIDE;
			else
				source.action = websheet.Constant.DataChange.SHOW;
			source.refType = websheet.Constant.OPType.COLUMN;
			source.refValue = new websheet.parse.ParsedRef(sheetName, -1, startCol, -1, endCol,  websheet.Constant.COLS_MASK);
			var e = new websheet.listener.NotifyEvent(type, source);
			this.broadcast(e);
			grid.showHideColumns(startCol, endCol, (source.action == websheet.Constant.DataChange.HIDE));
			/**********end insert col******************************/
		} else if (colJson[wcs.WIDTH] !== undefined) {
			var type = websheet.Constant.EventType.DataChange;
			var source = {};
			source.action = websheet.Constant.DataChange.CHANGEHEIGHTORWIDTH;
			source.refType = websheet.Constant.OPType.COLUMN;
			source.refValue = new websheet.parse.ParsedRef(sheetName, -1, startCol, -1, endCol,  websheet.Constant.COLS_MASK);
			var e = new websheet.listener.NotifyEvent(type, source);
			this.broadcast(e);

			/***********grid update**************/
			grid.setColumns(colJson, startCol, endCol);
		} else {
			/***********grid update**************/
			grid.setColumns(colJson, startCol, endCol);
		}
	},
	
	renameSheet:function(sheetName,newSheetName){
		var params = {sheetName: sheetName, newSheetName: newSheetName};
		this.editor.publishForMobile({"name": "renameSheet", "params":[params]});

		var sheet = this._documentObj.getSheet(sheetName);
		this._documentObj.renameSheet(sheetName,newSheetName);
		this._renameGrid(sheetName,newSheetName);
		/***********broadcase set sheet event**************/
		var type = websheet.Constant.EventType.DataChange;
		var source = {};
		source.action = websheet.Constant.DataChange.SET;
		source.refType = websheet.Constant.OPType.SHEET;
		source.refValue = sheetName;
		source.oldSheetName = sheetName;
		source.newSheetName = newSheetName;
		var e = new websheet.listener.NotifyEvent(type, source);
		this.broadcast(e);
		/**********end set sheet******************************/
		if(this.editor.hasACLHandler())
		{
			this.editor.getACLHandler().handleRenameSheet(source);
		}
		
		var workSheet = this.editor.getWorksheetContainer();
		var title = newSheetName;
		if (title.substring(0, 1) == "'") {
			title = title.substring(1, title.length - 1);
		}
		var shortenedTitle = websheet.BrowserHelper.shortenName4Display(title,workSheet.MAX_TITLE_CHARS);		
		var node = dojo.byId(workSheet.TITLE_ID + sheet.getId());
		
		// make IE redraw...#26366
		//defect 36643, if userA hide the sheet just before userB(current user) click OK to rename
		//sheet. The correspinding grid is removed from worksheet container
		if (node){
			dojo.isIE && dojo.addClass(node, "-x-");
			
			node.title = newSheetName;
			if (BidiUtils.isBidiOn())
				node.dir = BidiUtils.getResolvedTextDir(newSheetName);
			
			shortenedTitle = websheet.Helper.escapeXml(shortenedTitle);
			shortenedTitle = shortenedTitle.replace(/\ /g,"&nbsp;");			
			node.innerHTML = shortenedTitle;
			
			dojo.isIE && dojo.removeClass(node, "-x-");
		}
	},
	
	/**
	 * adds/replaces a sheet within the document object
	 *
	 * @param {String} sheetName
	 * @param {Object} data the sheet data - see json schema: /simpleSpreadsheetDocument.json
	 */
	addSheet: function(sheetName,sheetIndex,sheet,mode) {
		this._documentObj.insertSheet(sheetName,sheetIndex,sheet,mode);
		var sheetExisted = this._documentObj.isSheetExist(sheetName);
		if (sheetExisted) 
		{
			var newTabIndex = this._documentObj.getSheetTabIndexByIndex(sheetIndex);
			this.createWorksheet(sheetName,newTabIndex-1);
		}
		
		var sheetId = this._documentObj.getSheetId(sheetName);
		var params = {sheetName: sheetName, sheetIndex: sheetIndex, sheetId: sheetId, sheetData: sheet};
		this.editor.publishForMobile({"name": "insertSheet", "params":[params]});
		
		if(mode == websheet.Constant.MSGMode.REDO && this.editor.hasACLHandler())
		{
			this.editor.getACLHandler().handleInsertSheetForRedo(sheetId);
		}	
		/***********broadcase insert sheet event**************/
		var areaMap = null;
		if(sheet && sheet.uuid){
			var recMgr = this._documentObj.getRecoverManager();
			var sheetInfo = recMgr.getDeletedSheetInfo(sheet.uuid);
			if(sheetInfo)
				areaMap = sheetInfo.areaMap;
		}

		var type = websheet.Constant.EventType.DataChange;
		var source = {};
		source.action = websheet.Constant.DataChange.INSERT;
		source.refType = websheet.Constant.OPType.SHEET;
		source.refValue = sheetName + "|" + sheetIndex;
		source.data = {areaMap:areaMap};
		var e = new websheet.listener.NotifyEvent(type, source);
		this.broadcast(e);
		/**********end insert sheet ******************************/
	},
    
    /*
     * uuid : the new sheet id for the  deleted sheet
     */
	deleteSheet: function(sheetName,bNotDeleteGrid,uuid) {
		if (this._documentObj.isSheetExist(sheetName)) 
		{
			var params = {sheetName: sheetName, uuid: uuid};
			this.editor.publishForMobile({"name": "deleteSheet", "params":[params]});

			/***********broadcase predelete sheet event**************/
			var type = websheet.Constant.EventType.DataChange;
			var source = {};
			source.action = websheet.Constant.DataChange.PREDELETE;
			source.refType = websheet.Constant.OPType.SHEET;
			source.refValue = sheetName;
			source.data = {uuid:uuid};
			e = new websheet.listener.NotifyEvent(type, source);
			this.broadcast(e);
			/**********end predelete sheet******************************/
			this._documentObj.deleteSheet(sheetName,uuid);
			
			if(!bNotDeleteGrid)
				this._deleteSheet(sheetName);
		}
	},
	
	setChartInfo: function(rangeAddr, data, mode)
	{
		var bLocal = mode === undefined;
		if (!bLocal) {
			var ref = websheet.Helper.parseRef(rangeAddr);
			var params = {sheetName: ref.sheetName, startRow: ref.startRow, startCol: ref.startCol, endRow: ref.endRow, endCol: ref.endCol, data: data};
			this.editor.publishForMobile({"name": "setRangeInfo", "params":[params]});
		}

		var chartHdl = this.editor.getChartHdl();
		var range = chartHdl.setChart(data.chartId, data);
		var grid = this.editor.getCurrentGrid();
		//refresh chart
		if(range && grid.sheetName == range.getSheetName())
		{
			var args = [range, grid];
			var pm = this.editor.getTaskMan();
			pm.addTask(chartHdl, "drawChart", args, pm.Priority.Normal, false, 0, function (newTask, taskInQueue) {
				if (newTask.task == taskInQueue.task) {
					return -1; // remove the old task in queue, keep the new task;
				}
			});
			pm.start();
		}
	},
	
	/**
	 * insert rows
	 * TODO	function start with insertrow will be deleted
	 */
	insertRows: function(sheetName,startRowIndex,endRowIndex,rowData,mode)
	{
		var params = {sheetName: sheetName, startRow: startRowIndex, endRow: endRowIndex};
		if (rowData && rowData.rows) params.rowData = rowData.rows;
		this.editor.publishForMobile({"name": "insertRow", "params":[params]});

		/////////////////////////
		/***********broadcase insert row event**************/
		//TODO: when rowData is null ,do not need to recalc sum(A1:B2)
		var constant = websheet.Constant;		
		var type = constant.EventType.DataChange;
		var source = {};
		source.action = constant.DataChange.PREINSERT;
		source.refType = constant.OPType.ROW;
		source.refValue = new websheet.parse.ParsedRef(sheetName, startRowIndex, -1, endRowIndex, -1, websheet.Constant.ROWS_MASK);
		source.mode = mode;//mode is used in FreezeHandler.notify, uuid is used in UndoRangeList
		if(rowData && rowData.uuid)
			source.uuid = rowData.uuid;
		var e = new websheet.listener.NotifyEvent(type, source);
		if(rowData && rowData.undoFreeze) {
			e._data = {};
			e._data.undoFreeze = rowData.undoFreeze;
		}
		this.broadcast(e);
		/**********end insert row******************************/
		
		this._documentObj.insertRows(sheetName,startRowIndex,endRowIndex,true,rowData,mode);

		//INSERT event is listened by undo, such as undoRangeList, rowEvents, columnEvents which need update the row/col id when idmanager has been updated
		source.action = constant.DataChange.INSERT;
		this.broadcast(e);
		
		var grid = this._grids[sheetName];
		//////////////restore named range//////////////////////
		if(rowData && rowData.undoRanges){
			this._documentObj.restoreRange(rowData.undoRanges,startRowIndex,endRowIndex,constant.Event.SCOPE_ROW);
		}
		if(rowData && rowData.undoCharts){
			this._documentObj.restoreChart(rowData.undoCharts,startRowIndex,endRowIndex,constant.Event.SCOPE_ROW);
			this.editor.getChartHdl().updateHighLightChart();
			this.redrawCharts(rowData.undoCharts);
		}
		
		//////////////restore freeze info//////////////////////
		var undoFreeze = rowData && rowData.undoFreeze;
		if (undoFreeze && undoFreeze.delta != null) {
			//undoFreeze means insert rows with extra freeze info to restore, set this flag to prevent
			//adaptHeight to give the window size warning message when insert rows, leave the window size check 
			//after restore completely done (after buildFrozenArea finished).
			this._restoreFreezeInfo(sheetName, {delta: undoFreeze.delta, sIndex:startRowIndex, bRow:true});
		}
		var adjustFreeze = undoFreeze || (startRowIndex <= grid.freezeRow);
		if (!grid) return;
		if (undoFreeze) {
			grid.restoreFreeze();
		} else {
			if (this.editor.getFreezeHdl().updateGridFreezeInfo(grid)) {
				grid.updateStage();
			} else {
				grid.requestUpdate().then(function () {
					if (undoFreeze || adjustFreeze) {
						grid.adaptHeight();
						grid.adjustFreezebar();
					}
				});
			}
		}
	},
	
	deleteComments: function(sheetName, startRowIndex, startColIndex, endRowIndex, endColIndex){
		var info = {
				sheetName: sheetName,
				startRow: startRowIndex,
				endRow: endRowIndex,
				startCol: startColIndex,
				endCol: endColIndex
			};
			var areaMgr =  this._documentObj.getAreaManager();
			var ranges = areaMgr.getRangesByUsage(websheet.Constant.RangeUsage.COMMENTS, sheetName);
			for(var i = 0; i < ranges.length; i++){
				var range = ranges[i];
				var rangeInfo = range._getRangeInfo();
				var relation = websheet.Helper.compareRange(info, rangeInfo);
				if(relation == websheet.Constant.RangeRelation.EQUAL || relation == websheet.Constant.RangeRelation.SUPERSET){
					this.deleteRange(range._id, websheet.Constant.RangeUsage.COMMENTS);
					this.editor.getCommentsHdl().publishDelCmtsMsg(range._id);
				}
			}
	},
	
	cutRange: function(sheetName, startRowIndex, startColIndex, endRowIndex, endColIndex, cutParams){
		var refValue = websheet.Helper.getAddressByIndex(sheetName, startRowIndex, startColIndex, null, endRowIndex, endColIndex);
		var newParams = null;
		var sheetDelta = false;
	    if(cutParams){
	    	if(cutParams.rowDelta || cutParams.colDelta || cutParams.sheetDelta)
	    		newParams = dojo.mixin({bCut:true}, cutParams);
	    	if(cutParams.sheetDelta)
	    		sheetDelta = true;
	    }
		this.sendNotify4SetRange(refValue, newParams, true);

		var params = {sheetName: sheetName, startRow: startRowIndex, startCol: startColIndex, endRow: endRowIndex, endCol: endColIndex};
		this.editor.publishForMobile({"name": "clearRange", "params":[params]});

		this._documentObj.clearRange(sheetName, startRowIndex, endRowIndex, startColIndex, endColIndex, true, sheetDelta);
		this.deleteComments(sheetName, startRowIndex, startColIndex, endRowIndex, endColIndex);
		var grid = this.getGrid(sheetName);
		if (!grid) return;
		grid.updateRows(startRowIndex - 1, endRowIndex - 1);
	},
	
	cutCols: function(sheetName, maxRowIndex, colIndex, endColIndex, cutParams){
		var refValue = websheet.Helper.getAddressByIndex(sheetName, null, colIndex, null, null, endColIndex, {refMask:websheet.Constant.COLS_MASK});
		var newParams = null;
		var sheetDelta = false;
	    if(cutParams){
	    	if(cutParams.rowDelta || cutParams.colDelta || cutParams.sheetDelta)
	    		newParams = dojo.mixin({bCut:true}, cutParams);
	    	if(cutParams.sheetDelta)
	    		sheetDelta = true;
	    }
		this.sendNotify4SetRange(refValue, newParams, true);

		var params = {sheetName: sheetName, startCol: colIndex, endCol: endColIndex};
		this.editor.publishForMobile({"name": "clearColumn", "params":[params]});

		this._documentObj.deleteColumns(sheetName, colIndex, endColIndex, true, sheetDelta);
		this.deleteComments(sheetName, 1, colIndex, websheet.Constant.MaxRowNum, endColIndex);
		var grid = this.getGrid(sheetName);
		if (!grid) return;
		grid.updateAll();
	},
	
	/*
	 * clear the cell value in the row, rowIndex start from 0 in grid
	 */
	clearRows: function(sheetName,startRowIndex, endRowIndex, bCut, cutParams)
	{
	    if (!endRowIndex || endRowIndex < 1) {
		    endRowIndex = startRowIndex;
	    }
	    var forSheet = endRowIndex == this.editor.getMaxRow() && startRowIndex == 1;
	    if(!bCut)
	    	this._documentObj.clearRows(sheetName,startRowIndex,endRowIndex);
		
	    var refValue;
	    if(bCut)
	    	refValue = websheet.Helper.getAddressByIndex(sheetName, startRowIndex, null, null, endRowIndex, null,{refMask:websheet.Constant.ROWS_MASK});
	    else
	    	refValue = websheet.Helper.getAddressByIndex(sheetName, startRowIndex, "A", null, endRowIndex, websheet.Constant.MaxColumnChar);

	    var newParams = null;
	    if(bCut && cutParams && (cutParams.rowDelta || cutParams.colDelta || cutParams.sheetDelta))
	    	newParams = dojo.mixin({bCut:true}, cutParams);
		this.sendNotify4SetRange(refValue, newParams, bCut);
		
		 if(bCut){
			var sheetDelta = cutParams && cutParams.sheetDelta;
    		var params = {sheetName: sheetName};
	    	if(forSheet) {
	    		this.editor.publishForMobile({"name": "clearSheet", "params":[params]});

	    		this._documentObj.cutSheet(sheetName);
		 	} else {
				params.startRow = startRowIndex;
				params.endRow = endRowIndex;
				this.editor.publishForMobile({"name": "clearRow", "params":[params]});

	    		this._documentObj.deleteRows(sheetName,startRowIndex,endRowIndex, true, sheetDelta);
	    	}
	    	this.deleteComments(sheetName, startRowIndex, 1, endRowIndex, websheet.Constant.MaxColumnIndex);
	    }

	    var grid = this.getGrid(sheetName);
    	if (!grid) return; // the sheet would be hidden

    	grid.updateRows(startRowIndex - 1, endRowIndex - 1);
	},
	
	clearRange: function(sheetName, startRowIndex, endRowIndex, startColIndex, endColIndex) {
	    if (!endRowIndex || endRowIndex < 1)
		    endRowIndex = startRowIndex;
	    
	    this._documentObj.clearRange(sheetName, startRowIndex, endRowIndex, startColIndex, endColIndex);
		var refValue = websheet.Helper.getAddressByIndex(sheetName, startRowIndex, startColIndex, null, endRowIndex, endColIndex);
		this.sendNotify4SetRange(refValue);
		
	    var grid = this.getGrid(sheetName);
	    if (!grid) return; // the sheet would be hidden
	    
	    grid.updateRows(startRowIndex - 1, endRowIndex - 1);
	},
	
	hideRows:function(sheetName,rowIndex, eRowIndex,hiddenArray, bSetFocus){
		var params = {sheetName: sheetName, rowData: hiddenArray};
		this.editor.publishForMobile({"name": "hideRow", "params":[params]});

	    dojo.forEach(hiddenArray,function(hiddenMap){
			var startRowIndex = hiddenMap.startRowIndex;
			var endRowIndex = hiddenMap.endRowIndex;
	        var rowJson = {};
	        var startIndexInModel = startRowIndex+1;
	        rowJson[startIndexInModel] = {};
	        if (startRowIndex != endRowIndex)
	        rowJson[startIndexInModel].rn = endRowIndex - startRowIndex;
	        rowJson[startIndexInModel].visibility = websheet.Constant.ROW_VISIBILITY_ATTR.HIDE;
		    this._documentObj.setRows(sheetName, startRowIndex+1, endRowIndex+1, rowJson,false, true);
		    var idxArray = new Array();
		    for(var i =0;i<=(endRowIndex-startRowIndex);i++){
				idxArray.push(parseFloat(startRowIndex)+i);
			}
		},this);		

	    /***********update data grid**************/
		var grid = this.getGrid(sheetName);
		if (grid) {
			grid.showHideRows(hiddenArray, true);
		}
		
		/***********broadcast hide row event**************/
		var type = websheet.Constant.EventType.DataChange;
		var source = {};
		source.action = websheet.Constant.DataChange.HIDE;
		source.refType = websheet.Constant.OPType.ROW;
		source.refValue = new websheet.parse.ParsedRef(sheetName, rowIndex + 1, -1, eRowIndex + 1, -1, websheet.Constant.ROWS_MASK);
		var e = new websheet.listener.NotifyEvent(type, source);
		this.broadcast(e);
		/**********end hide row******************************/
	},
	
	showRows:function(sheetName, hiddenArray){
		var params = {sheetName: sheetName, rowData: hiddenArray};
		this.editor.publishForMobile({"name": "showRow", "params":[params]});

	    var eventRows = [];//array of parsedRef
	    dojo.forEach(hiddenArray, function(hiddenMap) {
			var startRowIndex = hiddenMap.startRowIndex;
			var endRowIndex = hiddenMap.endRowIndex;
	        var rowJson = {};
	        var startIndexInModel = startRowIndex+1;
	        rowJson[startIndexInModel] = {};
	        if (startRowIndex != endRowIndex)
	        rowJson[startIndexInModel].rn = endRowIndex - startRowIndex;
	        rowJson[startIndexInModel].visibility = null;  //cleanup visibility attribute. show row evenif it's a filter row.
		    this._documentObj.setRows(sheetName, startRowIndex+1, endRowIndex+1, rowJson, false, true);
		    var hideRowsRef = new websheet.parse.ParsedRef(sheetName, startRowIndex + 1, -1, endRowIndex + 1, -1, websheet.Constant.ROWS_MASK);
			eventRows.push(hideRowsRef);
		},this);

	    /***********Update data grid**************/
		var grid = this.getGrid(sheetName);
		if (grid) {
			grid.showHideRows(hiddenArray/*, isHide* false*/);
		}
		
	    /***********broadcast show row event**************/
	    if(eventRows.length > 0){
			var type = websheet.Constant.EventType.DataChange;
			var source = {};
			source.action = websheet.Constant.DataChange.SHOW;
			source.refType = websheet.Constant.OPType.ROW;
			source.refValue = eventRows;
			var e = new websheet.listener.NotifyEvent(type, source);
			
			this.broadcast(e);
	    }else{
	    	grid && grid.updateUI();
	    }
		/**********end show row******************************/
	},
	
	/**
	 * delete rows
	 */
	deleteRows: function(sheetName,startRowIndex,endRowIndex,uuid,mode, bCut)
	{
		if(!endRowIndex || endRowIndex < 1) 
			endRowIndex = startRowIndex;
		
		var params = {sheetName: sheetName, startRow: startRowIndex, endRow: endRowIndex};
		this.editor.publishForMobile({"name": "deleteRow", "params":[params]});

		/**************broadcast pre delete event*************/
		if(!bCut)
		{
			var type = websheet.Constant.EventType.DataChange;
			var source = {};
			source.action = websheet.Constant.DataChange.PREDELETE;
			source.refType = websheet.Constant.OPType.ROW;
			source.refValue = new websheet.parse.ParsedRef(sheetName, startRowIndex, -1, endRowIndex, -1, websheet.Constant.ROWS_MASK);
			source.uuid = uuid;
			source.mode = mode;
			var event = new websheet.listener.NotifyEvent(type, source);
			this.broadcast(event,true);
		}
		/*************end pre delete**************************/
		this._documentObj.deleteRows(sheetName,startRowIndex,endRowIndex, bCut);
		
		var grid = this._grids[sheetName];
		if (grid) {
			var adjustFreeze = (startRowIndex <= grid.freezeRow);
			if (this.editor.getFreezeHdl().updateGridFreezeInfo(grid)) {
				grid.updateStage();
			} else {
				grid.requestUpdate().then(function () {
					if (adjustFreeze) {
						grid.adaptHeight();
						grid.adjustFreezebar();
					}
				});
			}
		}
	},

	redrawCharts: function(undoCharts)
	{
		var areaMgr = this._documentObj.getAreaManager();
		var grid = this.editor.getCurrentGrid();
		for(var chartId in undoCharts){
			var range = areaMgr.getRangeByUsage(chartId, websheet.Constant.RangeUsage.CHART);
			if(grid.sheetName == range.getSheetName()){
				grid.requestWidgetsUpdate();
				break;
			}
		}
	},
	
	/**
	 * insert columns
	 */
	insertColumns: function(sheetName, startCol, endCol, data, mode){
		var params = {sheetName: sheetName, startCol: startCol, endCol: endCol};
		if (data && data.columns) params.colData = data.columns;
		this.editor.publishForMobile({"name": "insertColumn", "params":[params]});

		/***********broadcast insert col event**************/
		var type = websheet.Constant.EventType.DataChange;
		var source = {};
		source.action = websheet.Constant.DataChange.PREINSERT;
		source.refType = websheet.Constant.OPType.COLUMN;
		source.refValue = new websheet.parse.ParsedRef(sheetName, -1, startCol, -1, endCol, websheet.Constant.COLS_MASK);
		source.mode = mode;
		if(data && data.uuid)
			source.uuid = data.uuid;
		var e = new websheet.listener.NotifyEvent(type, source);
		if(data && data.undoFreeze) {
			e._data = {};
			e._data.undoFreeze = data.undoFreeze;
		}		
		this.broadcast(e);
		/**********end insert col******************************/
		
		this._documentObj.insertColumns(sheetName, startCol, endCol, true, data, mode);
		
		//INSERT event is listened by undo, such as undoRangeList, rowEvents, columnEvents which need update the row/col id when idmanager has been updated
		source.action = websheet.Constant.DataChange.INSERT;
		this.broadcast(e);
		
		///////////////////////restore named range///////////////////////
		if(data && data.undoRanges){
			this._documentObj.restoreRange(data.undoRanges,startCol,endCol,websheet.Constant.Event.SCOPE_COLUMN);
		}	
		if(data && data.undoCharts){
			this._documentObj.restoreChart(data.undoCharts,startCol,endCol,websheet.Constant.Event.SCOPE_COLUMN);
			this.editor.getChartHdl().updateHighLightChart();
			this.redrawCharts(data.undoCharts);
		}
		
		var grid = this._grids[sheetName];
		if (!grid) return;
		
		grid.updateAll();
		///////////////////////restore freeze ///////////////////////
		if (data && data.undoFreeze) {
			if (data.undoFreeze) {
				this._restoreFreezeInfo(sheetName, {delta: data.undoFreeze.delta, sIndex: startCol, bCol: true});
				grid.freezeRestoring = true;
				grid.restoreFreeze();
			}
		} else {
			if (this.editor.getFreezeHdl().updateGridFreezeInfo(grid))
				grid.updateStage();
			else
				grid.requestUpdate();
		}
	},
	
	/**
	 * delete columns
	 */
	deleteColumns:function(sheetName,startCol,endCol,uuid,mode){
		var params = {sheetName: sheetName, startCol: startCol, endCol: endCol};
		this.editor.publishForMobile({"name": "deleteColumn", "params":[params]});

		var type = websheet.Constant.EventType.DataChange;
		var source = {};
		source.action = websheet.Constant.DataChange.PREDELETE;
		source.refType = websheet.Constant.OPType.COLUMN;
		source.refValue = new websheet.parse.ParsedRef(sheetName, -1, startCol, -1, endCol, websheet.Constant.COLS_MASK);
		source.uuid = uuid;
		source.mode = mode;
		var event = new websheet.listener.NotifyEvent(type, source);
		this.broadcast(event,true);

		this._documentObj.deleteColumns(sheetName,startCol,endCol);

		var grid = this._grids[sheetName];
		if (!grid) return;
		this.editor.getFreezeHdl().updateGridFreezeInfo(grid);
		grid.updateAll();
	},
	
	setCell:function(sheetName, rowIndex, colNum, newValue, parseTokenResult/*tokenArray with array type or result of parseFormula with tokenTree and tokenArray*/, userId, mode, bInheritFormat)
	{
		var cellJson = {v: newValue};
		if (dojo.isArray(parseTokenResult)) cellJson.tarr = parseTokenResult;
		this._documentObj.setCell(sheetName, rowIndex, colNum, cellJson, userId, false, mode, bInheritFormat);
		var cell = this._documentObj.getCell(sheetName, rowIndex, colNum);
		if (!(cell && cell._bPR)) {
			if(parseTokenResult && parseTokenResult.tokenTree){
				cell.setCellToken(parseTokenResult.tokenTree);
				cell.pushTokenArray(parseTokenResult.tokenArray);
			}
			// don't broadcast / calculate if it is undo-deleting and the cell has a partial reference
			/***********broadcase set cell event**************/
			var refValue = websheet.Helper.getCellAddr(sheetName, rowIndex, colNum);
			this.sendNotify4SetRange(refValue);
			/**********end set cell******************************/
		}
		if(cell)
		{
			if(userId != pe.authenticatedUser.getId())
				cell._jsonDirty = true;
			else
				delete cell._jsonDirty;
		}
		this.editor.getPartialCalcManager().calcVisibleFormula();
	},
	
	mergeCells: function(sheetName, srIndex, erIndex, scIndex, ecIndex)
	{
		var params = {sheetName: sheetName, startRow: srIndex, endRow: erIndex, startCol: scIndex, endCol: ecIndex};
		this.editor.publishForMobile({"name": "mergeCell", "params":[params]});

		this._documentObj.mergeCells(sheetName, srIndex, erIndex, scIndex, ecIndex);

		var source = {};
		source.action = websheet.Constant.DataChange.MERGE;
		source.refType = websheet.Constant.OPType.RANGE;
		source.refValue = websheet.Helper.getAddressByIndex(sheetName, srIndex, scIndex, null, erIndex, ecIndex);
		//when set cell rawValue, there might produce a circular reference
		//so the value of  cells in the circular are also changed.
		var e = new websheet.listener.NotifyEvent(websheet.Constant.EventType.DataChange, source);
		e._data = {sheetName : sheetName, sr: srIndex, er:erIndex, sc: scIndex, ec: ecIndex};
		this.broadcast(e);
		
		// The content of the merged cells will be removed, need to notify formulas/charts
		this.sendNotify4SetRange(source.refValue);
		
		var grid = this.getGrid (sheetName);
		if (!grid) return;
		grid.updateRows(srIndex - 1, erIndex - 1);
	},
	
	// bSplitAnyway is true means if there are cover cell located in the given range,
	// split it no matter the master cell is in the range or not
	// false means split it if master cell is in the range
	splitCells: function(sheetName, srIndex, erIndex, scIndex, ecIndex, bSplitAnyway)
	{
		var params = {sheetName: sheetName, startRow: srIndex, endRow: erIndex, startCol: scIndex, endCol: ecIndex}; // FIXME
		this.editor.publishForMobile({"name": "splitCell", "params":[params]});

		var source = {};
		source.action = websheet.Constant.DataChange.PRESPLIT;
		source.refType = websheet.Constant.OPType.RANGE;
		source.refValue = websheet.Helper.getAddressByIndex(sheetName, srIndex, scIndex, null, erIndex, ecIndex);
	
		var e = new websheet.listener.NotifyEvent(websheet.Constant.EventType.DataChange, source);
		e._data = {sheetName : sheetName, sr: srIndex, er:erIndex, sc: scIndex, ec: ecIndex};
		this.broadcast(e);
		
		this._documentObj.splitCells(sheetName, srIndex, erIndex, scIndex, ecIndex, bSplitAnyway);
		
		var grid = this.getGrid (sheetName);
		if (!grid) return;
		
		grid.updateRows(srIndex - 1, erIndex - 1);
	},
	
	/*
	 * replace or merge cell style
	 */
	setCellStyle: function(sheetName, rowIndex, colIndex, style, bReplaceStyle, bUpdateChart) {
		if (bReplaceStyle || style.id) {
			this._documentObj.setCellStyle(sheetName, rowIndex, colIndex, style);
		} else {
			this._documentObj.mergeCellStyle(sheetName, rowIndex, colIndex, style);
		}
		
		if (bUpdateChart) {
			//for chart X/Y axis number format update
			/***********broadcase set cell event**************/
			var type = websheet.Constant.EventType.DataChange;
			var source = {};
			source.action = websheet.Constant.DataChange.SET;
			source.refType = websheet.Constant.OPType.CELL;
			source.refValue = websheet.Helper.getCellAddr(sheetName, rowIndex, colIndex);
			var e = new websheet.listener.NotifyEvent(type, source);
			this.broadcast(e);
			/**********end set cell******************************/	
		}
		var grid = this._grids[sheetName];
		if (grid) {
			grid.updateRows(rowIndex - 1);
		}
	},
	
	//Return -1: No sheet error, 0: Not change, 1: Sort change
	sortRange: function(refValue, sortData, userId, mode) {
		dojo["require"]("concord.concord_sheet_widgets");
		var bLocal = (mode === undefined);
		var rangeSorting = new websheet.sort.RangeSorting(this.editor, refValue, bLocal ? this.editor.sortDialog : null);
		rangeSorting._bLocal = bLocal;
		
		var ret = 0;
		try {
			// the applyRangeSort function will call the setRange function that will call sendNotify4SetRange
			// no need to explicitly call sendNotify4SetRange
			ret = rangeSorting.applyRangeSort(sortData, userId, mode);
		}
		catch (e) {
			ret = -1;
		}
		if(ret > 0)
		{
			var source = {};//broadcaste sort range
			source.action = websheet.Constant.DataChange.SORT;
			source.refType = websheet.Constant.OPType.RANGE;
			source.refValue = refValue;
			//when set cell rawValue, there might produce a circular reference
			//so the value of  cells in the circular are also changed.
			var e = new websheet.listener.NotifyEvent(websheet.Constant.EventType.DataChange, source);
			e._data = {sortRange : rangeSorting.getRangeInfo(), data: sortData};
			this.broadcast(e);
		}
		return ret;
	},
	
	getAreaListener:function(area){
		if(!area)
			return null;
		var RangeUsage = websheet.Constant.RangeUsage;
		
		if(!this._areaListeners){
			this._areaListeners = {};
			this._areaListeners[RangeUsage.NAME] = [this.editor.getNameRangeHdl(), this.getInlineEditor().getNameListener()];
			this._areaListeners[RangeUsage.COMMENTS] = [this.editor.getCommentsHdl()];
			this._areaListeners[RangeUsage.FILTER] = [this.editor.getAutoFilterHdl()];
			this._areaListeners[RangeUsage.IMAGE] = [this.editor.getImageHdl()];
			this._areaListeners[RangeUsage.SHAPE] = [this.editor.getShapeHdl()];
			this._areaListeners[RangeUsage.CHART] = [this.editor.getChartHdl()];
		}
		
		var usage = area.getUsage();
		if(!this._areaListeners[usage])
		{
			if(usage == RangeUsage.ACCESS_PERMISSION)
				this._areaListeners[RangeUsage.ACCESS_PERMISSION] = [this.editor.getACLHandler()];
			else if(usage == RangeUsage.TASK)
				this._areaListeners[RangeUsage.TASK] = [this.editor.getTaskHdl(true)];
		}
		return this._areaListeners[usage];
	},
	
	/**
	 * Filter out multiple continuous rows
	 * @param sheetName 	 	sheet name
	 * @param idxArray  	    a discrete row index array e.g.[1,2,3,9,40,41,42,43...]
	 * @param isFiltered	 	if filter out the array or show the array. 
	 *                         true:filter out array
	 *                         false: show array
	 * @return 
	 */
	/*void*/filterRows: function(sheetName, idxArray, isFiltered){
        if (!idxArray || idxArray.length==0)
            return;

		var params = {sheetName: sheetName, filtered: isFiltered, rowData: idxArray};
		this.editor.publishForMobile({"name": "filterRow", "params":[params]});
        
	    var len = idxArray.length;
	    var roStart;
	    var roRepeat;
	    var upStart;
	    var upRepeat;
	    for(var i=0; i<=len; i++)
	    {
	        if (i == len){ //for case this is last one.
	           upStart = roStart;
	           upRepeat = roRepeat;     
	        }else{	        
    	        var index = idxArray[i];
    	        if((roStart + roRepeat + 1) == index){
    	            roRepeat++;
    	            if (i+1 == len){
    	                upStart = roStart;
    	                upRepeat = roRepeat;
    	            }
    	        }else{	            
    	            if (i>0){
    	                upStart = roStart;
    	                upRepeat = roRepeat;        	
    	            }
    	            
    	           roStart = index;
    	           roRepeat = 0;
    	        }
                
                if (len == 1){ //for case it just has one item.
                   upStart = roStart;
    	           upRepeat = roRepeat;    
                }            
	        }
            
            if (upStart >=0)
        	{
        		var startRowIndex = upStart;
        		var endRowIndex = startRowIndex + upRepeat;
                var rowJson = {};
                var startIndexInModel = startRowIndex;
                rowJson[startIndexInModel] = {};
                if (startRowIndex != endRowIndex)
                    rowJson[startIndexInModel].rn = endRowIndex - startRowIndex;
                
                if(isFiltered)
                    rowJson[startIndexInModel].visibility = websheet.Constant.ROW_VISIBILITY_ATTR.FILTER;
                else
                    rowJson[startIndexInModel].visibility = null;
                    
        	    this._documentObj.setRows(sheetName, startRowIndex, endRowIndex, rowJson);	
        	     
        	    upStart = undefined;
        	    upRepeat = undefined;
            }
	    }
	},
	
	insertRange: function(rangeId, rangeAddress, data, mode){
		var usage = data.usage;
		var RangeUsage = websheet.Constant.RangeUsage;
		var ref = websheet.Helper.parseRef(rangeAddress);
		//COMMENTS OT, ignore the comments at the same position
		if(usage == RangeUsage.COMMENTS){
			var commentsId = this.editor.getCommentsHdl().getCommentsByRef(ref);
			if(commentsId && commentsId != rangeId){
			    return;
			}
		}else if(usage == RangeUsage.DATA_VALIDATION){
			//create new data validation instance
			this._documentObj.insertRulesObjByUsage(rangeId, ref, data, usage);
			if(mode ==  websheet.Constant.MSGMode.NORMAL)
				this.editor.getDataValidationHdl(true);
			return;
		}else if(usage == RangeUsage.CONDITION_FORMAT){
			this._documentObj.insertRulesObjByUsage(rangeId, ref, data, usage);
			return;
		}
		data.rangeid = rangeId;
		
		var bLocal = (mode === undefined);
		var params = {sheetName: ref.sheetName, startRow: ref.startRow, startCol: ref.startCol, endRow: ref.endRow, endCol: ref.endCol, data: data, local: bLocal};
		this.editor.publishForMobile({"name": "insertRange", "params":[params]});
		
		var type = websheet.Constant.EventType.DataChange;
		var source = {action: websheet.Constant.DataChange.INSERT,
					  refType: websheet.Constant.OPType.RANGEADDRESS,
					  refValue: ref,
					  mode: mode, //mode is used by chart to set checkData
					  data: data};
		var e = new websheet.listener.NotifyEvent(type, source);
		this.broadcast(e);
	},
	
	deleteRangeByRef:function(refValue, usage)
	{
		var ref = websheet.Helper.parseRef(refValue);
		var params = {sheetName: ref.sheetName, startRow: ref.startRow, startCol: ref.startCol, endRow: ref.endRow, endCol: ref.endCol, usage: usage};
		this.editor.publishForMobile({"name": "deleteRangesByRange", "params":[params]});
		
		this._documentObj.removeRangesByUsage(ref, usage);
	},
	
	deleteRange: function(rangeId, usage, mode){
		var data = {rangeid: rangeId, usage: usage};
		var RangeUsage = websheet.Constant.RangeUsage;
		var bLocal = (mode === undefined);
		if (!bLocal || usage == RangeUsage.FILTER) {
			this.editor.publishForMobile({"name": "deleteRange", "params":[data]});
		}

		var type = websheet.Constant.EventType.DataChange;
		var source = {action: websheet.Constant.DataChange.DELETE,
					  refType: websheet.Constant.OPType.RANGEADDRESS,
					  //not care about the refValue
					  mode: mode, //comments will use mode to check if need publish events to common component.
					  data: data};
		var e = new websheet.listener.NotifyEvent(type, source);
		this.broadcast(e);
	},
	
	setRangeInfo: function(rangeAddress, data, mode){
		var rangeId = data.rangeid;
		if(!rangeId) return;
		var usage = data.usage;
		if(!usage) return;
		
		var bLocal = (mode === undefined);
		var ref = websheet.Helper.parseRef(rangeAddress);
		var RangeUsage = websheet.Constant.RangeUsage;
		if (!bLocal) {
			var params = {sheetName: ref.sheetName, startRow: ref.startRow, startCol: ref.startCol, endRow: ref.endRow, endCol: ref.endCol, data: data};
			this.editor.publishForMobile({"name": "setRangeInfo", "params":[params]});
		}
		
		var type = websheet.Constant.EventType.DataChange;
		var source = {action: websheet.Constant.DataChange.SET,
					  refType: websheet.Constant.OPType.RANGEADDRESS,
					  refValue: ref,
					  mode: mode, //comments will use mode to check if need publish events to common component.
					  data: data};
		var e = new websheet.listener.NotifyEvent(type, source);
		this.broadcast(e);
	},
	
	moveSheet:function(sheetName, newIndex, bNotMoveGrid){
		var params = {sheetName: sheetName, sheetIndex: newIndex};
		this.editor.publishForMobile({"name": "moveSheet", "params":[params]});

		var docObj = this.getDocumentObj();
		var sheet = docObj.getSheet(sheetName);
		var sheetIndex = sheet.getIndex();
		
		/***********broadcase move sheet event**************/
		var type = websheet.Constant.EventType.DataChange;
		var source = {};
		source.action = websheet.Constant.DataChange.PREMOVE;
		source.refType = websheet.Constant.OPType.SHEET;
		source.refValue = sheetName  + "|" + sheetIndex + "|" + newIndex;
		var e = new websheet.listener.NotifyEvent(type, source);
		this.broadcast(e);
		/**********end move sheet ******************************/
		
		docObj.moveSheet(sheetIndex, newIndex);
		if(!bNotMoveGrid && sheet.isSheetVisible()){
			var origSheetName = this.editor.getCurrentGrid().getSheetName();
			this._moveSheet(sheet, newIndex, origSheetName);
		}
	},
	
	_moveSheet: function(sheet, newIndex, origSheetName){
		var sheetName = sheet.getSheetName();
		var workSheet = this.editor.getWorksheetContainer();
		var docObj = this.getDocumentObj();
		var newTabIndex = docObj.getSheetTabIndexByIndex(newIndex);
		workSheet.moveWorkSheetto(sheetName, newTabIndex);
		//if the sheet has ACL lock icon, need to add it after moving
		if(this.editor.hasACLHandler())
		{
			this.editor.getACLHandler().checkHasValidPm(sheetName);
		}	
		if (origSheetName == sheetName) {
			// current working sheet is moving, move focus
			workSheet.showWorksheet(sheetName);
		}
		//defect 36646, if userA hide the sheet just before userB(current user) click OK to move
		//sheet. The correspinding grid is removed from worksheet container
		var node = dojo.byId(workSheet.TITLE_ID + sheet.getId());
		if (node){
			var title = sheetName;
			if (title.substring(0, 1) == "'") {
				title = title.substring(1, title.length - 1);
			}
			var shortenedTitle = websheet.BrowserHelper.shortenName4Display(title,workSheet.MAX_TITLE_CHARS);
			shortenedTitle = websheet.Helper.escapeXml(shortenedTitle, null, true);
			shortenedTitle = shortenedTitle.replace(/\ /g,"&nbsp;");
			node.innerHTML = shortenedTitle;
			node.title = sheetName;			
		}
	},
	
	_mergeSendNotify: function(incomingTaskDef, pendingTaskDef) {
		// summary: callback from TaskManager when add batch sendNotify tasks
		// details:
		//		parameters:
		//			incomingTaskDef: incoming new task that going to be added
		//			pendingTaskDef: sendNotify task that already in TaskManager
		//		This callback compares incoming task and pending task, if these task references (the 1st argument) to the same
		//		sheet, the callback merges these 2 references by modify the src task argument, then ignore the incoming task
		//		by returning 1. If these task references to different sheets, then return 0, means accept this task.
		var funcName = "sendNotify4SetRange";
		if (incomingTaskDef.task != funcName || pendingTaskDef.task != funcName) {
			// unrelated tasks
			return 0;
		}

		var incomingTaskArgs = incomingTaskDef.args;
		var pendingTaskArgs = pendingTaskDef.args;
		if (!(incomingTaskArgs.length > 1 && incomingTaskArgs[1] != null && incomingTaskArgs[1].bMerge == true)
				|| !(pendingTaskArgs.length > 1 && pendingTaskArgs[1] != null && pendingTaskArgs[1].bMerge == true)) {
			// only merge sendNotify calls with args like [range, null, true]
			return 0;
		}
		
		var helper = websheet.Helper;
		var incomingRef = incomingTaskDef.args[0];
		if (incomingRef.isCell == null) {
			incomingTaskDef.args[0] = incomingRef = helper.parseRef(incomingRef);
		}
		var pendingRef = pendingTaskDef.args[0];
		if (pendingRef.isCell == null) {
			// pendingRef is a string, parse it to a parsedRef
			pendingTaskDef.args[0] = pendingRef = helper.parseRef(pendingRef);
		}
		
		if (incomingRef.sheetName != pendingRef.sheetName) {
			// unrelated sheets
			return 0;
		}
		
		pendingRef = helper.mergeRef(incomingRef, pendingRef);
		// incoming already merged to pending, don't add incoming
		return 1;
	},
	
	/**
	 * 
	 * @param range rangeAddress
	 * @returns
	 */
	sendNotify4SetRange:function(range, params, bCut)
	{
		if (this._bBatchNotify) {
			// If in batch notify, all sendNotify's will be pended to last run after all possible calculation tasks,
			// by assigning a sufficient low priority (48). Meanwhile, the comparator _mergeSendNotify() will merge all
			// sendNotify's range to a large range. In the end, this makes just one sendNotify for a batch of message updates
			// (usually SetCell events) for each sheet that needs to be notified.
			var args = null;
			if (arguments.length == 1) {
				//bMerge will be recognized by _mergeSendNotify
				args = [range, { bMerge: true}];
				var task = this.editor.getTaskMan().addTask(this, "sendNotify4SetRange", args, this.editor.getTaskMan().Priority.BatchSendNotify,
						/* is paused */false, /* interval */ 0, /* comparator */ this._mergeSendNotify);
				this.editor.getTaskMan().start();
				return task;
			}
		}
		var action = websheet.Constant.DataChange.SET;
		var data;
		if(params && params.bCut){
			action = websheet.Constant.DataChange.CUT;
			data = {rowDelta:params.rowDelta, 
					colDelta:params.colDelta,
					sheetDelta:params.sheetDelta};
		}
		var type = websheet.Constant.EventType.DataChange;
		var source = {	refType:websheet.Constant.OPType.RANGE, 
						action:action,
						refValue: range};
		if(data)
			source.data = data; 
		var e = new websheet.listener.NotifyEvent(type, source);
		this.broadcast(e);
	},
	
	notifyCalcComplete: function(updateRows,bComplete)
	{
		var calcManager = this.editor.getCalcManager();
		var curGrid = this.editor.getCurrentGrid();
		var curSheetId = this._documentObj.getSheetId(curGrid.sheetName);
//			curGrid.scroller.cacheManager.notify(updateRows[curSheetId],bComplete);
		calcManager.resetCompleteCells(curSheetId);
		for(var sId in updateRows)
		{
			if(sId != curSheetId)
			{
				var sheetName = this._documentObj.getSheetName(sId);
				var grid = this.getGrid(sheetName);
				if (grid) 
				{
					grid.updateRows(updateRows[sId]);
				}	
			}	
			calcManager.resetCompleteCells(sId);
		}
	},
	
	_addNotify:function(/*websheet.parse.Area*/range)
	{
		if(this._documentObj.partialLevel != websheet.Constant.PartialLevel.ALL)
		{
			//if is partial loading one sheet, then postpone this notify
			if(this._documentObj.isLoading || this._documentObj.getPartialLoading()){
				var partialMgr = websheet.model.ModelHelper.getPartialManager();
				var method = dojo.hitch(this, "sendNotify4SetRange", range);
				partialMgr.addNotify(method);
				return true;
			}
		}
		return false;
	},
	
	//bNotUpdate=true, means not update row
	broadcast:function(e,bNotUpdate)
	{
//		this._documentObj.isCalculating = true;
//		this.inherited(arguments);
		for(var i=0;i<this._list.length;i++)
		{
			var l = this._list[i];
			if (e && l.preCondition(e))
				l.notify(this, e);
		}
//		this._documentObj.isCalculating = false;
		//if row need update, construct update row event
		if(e._data && e._data.rows && e._data.rows.length>0){
			
			if(!bNotUpdate) {
				var curGridName = this.editor.getCurrentGrid().sheetName;
				
				if (e._data.rows.length > this._LOTS_OF_ROWS) {
					var rows = this._compactRows(e._data.rows);
					for (var sheetName in rows) {
						if (this._documentObj.getSheet(sheetName) != null) {
							var grid = this.getGrid(sheetName);
							if (grid) {
								var arr = rows[sheetName];
								grid.updateRows(arr[0], arr[1]);
								var filter = this.editor.getAutoFilterHdl().getFilter(sheetName);
								if(filter)
								{
									filter.updateResetState(true);
								}	
							}
						}
						// else, sheet is deleted, no need to update
					}
				} else {
					dojo.forEach(e._data.rows,function(row){
						var str = row.toString();
						var index = str.lastIndexOf(".");
						var endIndex = (index >= 0) ? index : str.length;
						var sheetName = str.substring(0,endIndex);
						if (this._documentObj.getSheet(sheetName) != null) {
							var grid = this.getGrid(sheetName);
							if (grid) {
								var rowIndex = -1;
								if(endIndex < str.length)
								{
									rowIndex = parseInt(str.substring(endIndex+1,str.length));
									rowIndex--;
								}	
								if (rowIndex >= 0) {
									grid.updateRows(rowIndex);
								}
								var filter = this.editor.getAutoFilterHdl().getFilter(sheetName);
								if(filter)
								{
									filter.updateResetState(true);
								}
							}
						}
					},this);
				}
			}else if(e._data.chartGrids){
				var grid = this.editor.getCurrentGrid();
				for(var sheetName in e._data.chartGrids){
					if(grid.sheetName == sheetName){
						grid.requestWidgetsUpdate();
						break;
					}
				}
			}
		}
	},
	
	_compactRows: function(rows) {
		// summary: compact separated rows in event to a start row and end row, to
		//		reduce the calls of updateRow
		// returns: a map of:
		//		{ <sheetId>: [startRow, endRow] }
		var ret = {};
		for (var i = 0; i < rows.length; i++) {
			var row = rows[i];
			var index = row.lastIndexOf(".");
			var endIndex = (index >= 0) ? index : row.length;
			var sheetName = row.substring(0, endIndex);
			sheetName = websheet.Helper.normalizeSheetName(sheetName);
			var rowIndex = -1;
			if(endIndex < row.length)
				rowIndex = parseInt(row.substring(endIndex+1, row.length)) -1;
			if(rowIndex >= 0) {
				var arr = ret[sheetName];
				if (arr == null) {
					ret[sheetName] = arr = [];
					arr[0] = arr[1] = rowIndex;
				} else {
					if (rowIndex < arr[0]) {
						arr[0] = rowIndex;
					}
					if (rowIndex > arr[1]) {
						arr[1] = rowIndex;
					}
				}
			}
		}
		return ret;
	},
	
	getVisibleRange:function(){
		var grid = this.editor.getCurrentGrid();
		if (grid && grid.scroller.lastVisibleRow != -1) {
			var rangeInfo = {};
			rangeInfo.sheetName = grid.sheetName;
			rangeInfo.startRow = grid.scroller.firstVisibleRow + 1;
			rangeInfo.endRow = grid.scroller.lastVisibleRow + 1;
			if (grid.freezeRow > 0) {
				rangeInfo.startFreezeRow = grid.getFirstVisibleRow() + 1;
				rangeInfo.endFreezeRow = grid.freezeRow;
			}
			rangeInfo.startCol = -1;
			rangeInfo.endCol = -1;
			return rangeInfo;
		}
		return null;
	},

	calcDrawFrameInfo: function(area)
	{
		if(!area || !area.isValid()) return;
		var usage = area.getUsage();
		if(usage == websheet.Constant.RangeUsage.IMAGE || usage == websheet.Constant.RangeUsage.CHART || usage == websheet.Constant.RangeUsage.SHAPE)
		{
			if(area.data && area.data.z){
				var sheetId = this.getDocumentObj().getSheetId(area.getSheetName);
				this.editor.getDrawFrameHdl().updateMaxZIndex(sheetId,area.data.z);
			}
			
			var rangeInfo = area._getRangeInfo();
			if(rangeInfo.endRow > this.editor.getMaxRow()){
				area.data.ey = -1;
			}
			var initMaxColIndex = this._documentObj.getSheet(rangeInfo.sheetName).initMaxColIndex; 
			var maxCol = initMaxColIndex? initMaxColIndex : websheet.Constant.MinColumnIndex;
			maxCol = maxCol >  websheet.Constant.MinColumnIndex ? maxCol : websheet.Constant.MinColumnIndex;
			if(rangeInfo.endCol > maxCol){
				area.data.ex = -1;
			}
		}
	},

	/**
	 * Freeze window by using freezeWindowAtPosition in datagrid.
	 */
	freezeWindow: function(sheetName, row, col, holdScroll, reviseMerge){
		if(!(sheetObj = this.getDocumentObj().getSheet(sheetName)) || !(grid = this.getGrid(sheetName))) 
			return false;
		if (row == undefined || row == null) {
			row = grid.freezeRow;
		}
		if (col == undefined || col == null) {
			col = grid.freezeCol;
		}
		var result = grid.freezeWindow(row, col);
		if (result.success) {
			var params = {sheetName: sheetName, startRow: grid.freezeRow, startCol: grid.freezeCol};
			this.editor.publishForMobile({"name": "freezePane", "params":[params]});

			sheetObj.setViewSetting({freezeRow:grid.freezeRow, freezeCol:grid.freezeCol});
		} else {
			result.reason && this.editor.scene.showWarningMessage(result.reason, 5000);
		}
		return result;
	},
	
	//Restore freeze window settings when insert rows.
	_restoreFreezeInfo: function(sheetName, freezeInfo){
		var sheetObj = this._documentObj.getSheet(sheetName);
		var newIndex = freezeInfo.sIndex + freezeInfo.delta;
		var params = {sheetName: sheetName};
		if(freezeInfo.bRow)
		{
			params.startRow = newIndex;
			this.editor.publishForMobile({"name": "freezePane", "params":[params]});
			
			sheetObj.setViewSetting({freezeRow: newIndex});
		}
		if(freezeInfo.bCol)
		{
			params.startCol = newIndex;
			this.editor.publishForMobile({"name": "freezePane", "params":[params]});
			
			sheetObj.setViewSetting({freezeCol: newIndex});
		}
	},

	/**
	 * updateRows is collected by partialCalcManager
	 */
	postRender:function(updateRows){
		var grid = this.editor.getCurrentGrid();
		var sheetName = grid.getSheetName();
		var sheet = this._documentObj.getSheet(sheetName);
		var sheetId = sheet.getId();
		var cm = this.editor.getCalcManager();
		var sc = grid.scroller;
		//updateRowsIndex is collected by Calcmanager, only happened when quick scroll, 
		//cm calculated some formulas in the next visisble area
		var updateRowsIndex = cm.removeCompleteCells(sheetId,sc.firstVisibleRow,sc.lastVisibleRow);
		var sheetMap = updateRows[sheetId];
		if(sheetMap || updateRowsIndex){
			for(var id in updateRows) {
				var map = updateRows[id];
				var s = this._documentObj.getSheetById(id);
				if (!s)
					continue;
				var g;
				if ( s == sheet) {
					g = grid;
				} else {
					g = this.getGrid(s.getSheetName());
					if (!g || !g.isGridLoaded())
						continue;
				}
				for(var rowId in map){
					if(map[rowId]){
						var rowIndex = s.getRowIndex(rowId);
						grid.updateRows(rowIndex);
					}
				}
				updateRows[id] = {};
			}
			
			if(updateRowsIndex && updateRowsIndex.length > 0){
				for (var i = 0; i < updateRowsIndex.length; i++){
					var rowIndex = updateRowsIndex[i];
					grid.updateRows(rowIndex);
				}
			}		
		}
		var errorMessage;
		var errMsgDiv = dojo.byId('lotus_error_message');
		if (errMsgDiv) {
			// for IE10+ and other browsers, use textContent
			errorMessage = errMsgDiv.textContent;
		}
		var scene = this.editor.scene;
		var nls = scene.nls;
		var doc = this.getDocumentObj();
		var bLoading = doc.isLoading || doc.getPartialLoading();
		if(!bLoading && (errorMessage && (errorMessage == nls.browserWorkingMsg || errorMessage == nls.loadMsg))){
			if(!(this._rangeWorking || websheet.RangeDataHelper.isWorking))
				scene.hideErrorMessage();
		}
	},
	
	postLoad:function(criteria, bJoin){
	   	//resume the task which is paused by specified topic
	   	this.editor.getTaskMan().resumeOnTopic("loading");
//	   	if(criteria != null){
	   		//TODO: process pending message and async notify here?
	    
		var doc = this.getDocumentObj();
		var grid = this.editor.getCurrentGrid();
		if (!grid) {
	    	//ui is not ready, return directly
	    	this.editor.scene.hideErrorMessage();
	    	this.editor._showExceedMessage(criteria, doc);
			return;
		}
		
		if(!doc.isLoading && !doc.getPartialLoading()){//make sure that all the partial loading is done
			this.editor.getPartialManager().notify();//call all the postponed event
		}
		
		if(bJoin) {
			this.editor.getCommentsHdl().loadComments();

			if (websheet.Utils.hasRangesByUsage(websheet.Constant.RangeUsage.DATA_VALIDATION)) {
				this.editor.getDataValidationHdl(true);
			}
			this.editor.getAutoFilterHdl().loadFilters();
			if(this.editor.hasACLHandler())
			{
				this.editor.getACLHandler().loadPermissions();
			}
		}
		this.editor._updateGrid(criteria,true);//update grid after load, always
		
		var currSheetName = grid.getSheetName();
		var sheetName = currSheetName;
		if((criteria == null) || (criteria.sheet == null)){
			var firstVisibleSheet = doc.getFirstVisibleSheet();
			sheetName = firstVisibleSheet.getSheetName();
		}
		else
			sheetName = this._documentObj.getSheetName(criteria.sheet);
		if(sheetName == currSheetName){
			var grid = this.getGrid(currSheetName);
			this.editor._checkCurrentGrid();
			this.editor._showPostLoadWarningMessage(criteria, doc);
		}
		this.editor.getPartialCalcManager().calcVisibleFormula();
		
		if (bJoin)
			this.publishContentLoaded();
	},
	
	publishContentLoaded: function() {
		// tell native client that content loading is done
		this.editor.publishForMobile({"name":"stopActivityIndicator", "params":[]});
		
		//for hybrid mobile
		var fontNames = concord.editor.PopularFonts.getLangSpecFontArray();
		this.editor.publishForMobile({"name": "contentloaded", "params":[
		         {"name": "fontSize", "options":["8", "9", "10", "11", "12", "14", "16", "18", "20", "22", "24"]},
		         {"name": "font", "options": fontNames}
		         ]});
	},
	
	showGridLines: function(sheetName, show)
	{		
		this._documentObj.showGridLines(sheetName,show);
		var grid = this.getGrid(sheetName);
		if (grid){
			grid.requestUpdate();
		}
	}
});