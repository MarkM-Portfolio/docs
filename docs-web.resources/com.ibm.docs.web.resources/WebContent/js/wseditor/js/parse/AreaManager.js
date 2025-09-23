/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2014. All Rights Reserved.          */
/*                                                                   */
/* U.S. Government Users Restricted Rights: Use, duplication or      */
/* disclosure restricted by GSA ADP Schedule Contract with IBM Corp. */
/*                                                                   */
/* ***************************************************************** */

dojo.provide("websheet.parse.AreaManager");
dojo.require("websheet.listener.Listener");
dojo.require("websheet.parse.AreaPage");
dojo.declare("websheet.parse.AreaManager",websheet.listener.Listener,{
	  // Sheet Name <--> area pages in the sheet
	  // in each sheet the area pages are splitted into size 128*16(row * col)
	  // ------------------------------------------------------------------------------------------>Col(1024)
	  // | page 1              | page 1 + ROWS_PAGE_SIZE              | page 1 + ROWS_PAGE_SIZE*2
	  // | page 2              | page 2 + ROWS_PAGE_SIZE              | page 2 + ROWS_PAGE_SIZE*2
	  // | ...                 | ...                                  | ...
	  // | page ROWS_PAGE_SIZE | page ROWS_PAGE_SIZE + ROWS_PAGE_SIZE | page ROWS_PAGE_SIZE + ROWS_PAGE_SIZE*2
	  // \/
	  // Row( MAX_REF_ROW_NUM)
	pageTables : null,

	// it stores the unname ranges {usage:{sheetName:{rangeId:range}}}
	_usageMap : null,

	// for the undefined name ranges
	undefinedNameAreas : null,
	// for name ranges with lower case of name as key
	nameAreas : null,
	
	// all the areas that need to be update
	updateAreas : null, // the head area of the update area list
	updateAreasLast : null, // the end area of update area list

	//all the impact ranges
	rDataHead: null,
	rDataLast: null,
	
	// all the impact formula cells
	fCellHead : null, // the head of the formula cells linked list
	fCellLast : null, // the last cell of the formula cells linked list
	
	//all the shared references(shared formula or shared ref) that need to be update
	sharedRefTrack: null,
	
	//all the impact shared formulas
	sFormulaTrack: null,
	
	doc : null,
	
	delUndoCells : null, // store the impact cells for delete undo or cut event
	delUndoAreas : null, // store the impact areas for delete undo or cut event
	
	// the following is used to iterate page instance when broadcast
	ROW_PER_PAGE : 128,
	COL_PER_PAGE : 16,
	ROWS_PAGE_SIZE : null,
	COLS_PAGE_SIZE : null,
	nStart : 0,
	nEnd : 0,
	nCur : 0,
	nRowBreak : 0,

	constructor: function(d) {
		this.doc = d;
		this.pageTables = {};
		this.nameAreas = {};
		this._usageMap = {};
		this.undefinedNameAreas = {};
		this.delUndoCells = {};
		this.prepareUndoCells = {};
		this.delUndoAreas = {};
		this.delUndoChartRef = {};
		this.delUndoSharedRefs = {};
		this.splitUndoSharedRefs = {};
		this.prepareUndoSharedRefs = {};
		this.sFormulaTrack = {};
		this.maxSheetRows = this.doc.maxSheetRows;
		this.maxSheetCols = websheet.Constant.MaxColumnIndex;
		this.ROWS_PAGE_SIZE = Math.floor((this.maxSheetRows - 1) / this.ROW_PER_PAGE) + 1;
		this.COLS_PAGE_SIZE = Math.floor((this.maxSheetCols - 1) / this.COL_PER_PAGE) + 1;
	},

	/**
	 * add area for each unname/preserve/name range with specified usage
	 * name range should be a Reference instance rather than a Area instance
	 * the given area should not be null
	 */
	/*Area*/addArea:function(area) {
		var bListening = true;
		if(area.usage == websheet.Constant.RangeUsage.IMAGE || area.usage == websheet.Constant.RangeUsage.SHAPE) {
			if (area.data && area.data.pt == "absolute")
				bListening = false;
			/** 51404, need reset area.updateStatus. So for image
			 *  the parsedRef could be updated after delete->undo
			 */
			var AreaUpdateInfo = websheet.Constant.AreaUpdateInfo;
			area.updateStatus = AreaUpdateInfo.NONE;
		}
		if (bListening)
			this.startListeningArea(area.getParsedRef(), null, area);
		this.addAreaInUsageMap(area);
		return area;
	},
	
	/**
	 * delete unname/preserve/name area
	 * @param area
	 */
	deleteArea:function(/*Area*/area) {
		var bListening = true;
		if(area.usage == websheet.Constant.RangeUsage.IMAGE || area.usage == websheet.Constant.RangeUsage.SHAPE) {
			if (area.data && area.data.pt == "absolute")
				bListening = false;
		}
		if (bListening)
			this._endListeningArea(area.getParsedRef(), null, area);
		this.deleteAreaInUsageMap(area);
	},
	
	/**
	 * get the stored reference with the given parsedRef info 
	 * here use parsedRef rather than rangeInfo to differentiate the row/col/range type
	 * @param parsedRef instance
	 */
	getReference:function(/*parsedRef*/range){
		var area;
	    if(range && range.isValid()) {
	    	var sheetName = range.sheetName;
	    	var pages = this.pageTables[sheetName];
			if (!pages) {
				return null;
			}
			this.firstPage(range, true);
			while (this.hasNextPage()) {
				var page = pages[this.nCur];
				if (page){
					area = page.getArea(range);
				}
				break;
			}
		}
		return area;
	},
	/**
	 * Start listening to formula reference with listener and store it in AreaManager
	 * @param range: type is parsedRef which can describe the reference size
	 * @param listener: it can be nil when the area do not want to listen the data change event, such as unname area
	 * @param area: if given area is nil, will reuse the reference if it has the same size as the given range
	 * 				else it will add area to AreaManager
	 */
	/*Reference*/startListeningArea: function(/*parsedRef*/range, listener, rangeArea)
	{
		if (!range) return null;
		
		var area;
    	var sheets = this.doc.getSheetNameRanges(range.sheetName, range.endSheetName);
	    
	    if (sheets.length == 0) {
	    	// bPR cell is setReference when load, it referred ref sheet might not load in document
	    	// but it already initialized in IDManager
    		if(!rangeArea) {
    			rangeArea = new websheet.parse.Reference(range);
    		}
    		rangeArea.setUnexistSheetName();
    		rangeArea.addListener(listener);
    		return rangeArea;
	    }
	    var bFirst = true;
	    for (var i = 0; i < sheets.length; i++) {
	    	var sheetName = sheets[i];
	    	var currentRange = new websheet.parse.ParsedRef(sheetName, range.startRow, range.startCol, range.endRow, range.endCol);	    	
	    	var pages = this.pageTables[sheetName];
			if (!pages) {
				pages = [];
				this.pageTables[sheetName] = pages;
			}
			
			var type = range.getType();
			var bRow = (type == websheet.Constant.RangeType.ROW);
			var bCol = (type == websheet.Constant.RangeType.COLUMN);
			
			var size = 0;
			this.firstPage(currentRange);
			while (this.hasNextPage()) {
				if (!bFirst && (bRow || bCol)) {
					// the RowColArea only insert to the page at
					// the first row(for column area) or the
					// first column(for row area)
					if (!this.isStartEdgePage(this.nCur, bRow)) {
						this.nextPage(bRow, bCol);
						continue;
					}
				}
				var page = pages[this.nCur];
				if (page == null) {
					page = new websheet.parse.AreaPage(this.nCur, this);
					// add to pages
					websheet.Helper.putToArray(pages, this.nCur, page);
				}

				if (bFirst)
					size = page.getAreaSize();
				area = page.startListeningArea(area, range, listener, rangeArea);
				
				// the same area to different pages
				if (bFirst) {
					bFirst = false;
					if (listener && page.getAreaSize() == size) {
						area.addListener(listener);
						break;
					}
				}
				this.nextPage(bRow, bCol);
			}
	    }
	    
		return area;
	},
	
	/**
	 * start listening to name range, so that when anything changed in the range position it can be notified
	 * @param id 			the id of this defined name
	 * @param listener 		the listener for the defined name
	 * 
	 * @return the area object or null
	 */
	/*area*/startListeningNameArea: function(/*string*/id, listener) {
		var lowerId = id.toLowerCase();
		var area = this.nameAreas[lowerId];
		if (area) {
			area = this.startListeningArea(area.getParsedRef(), listener, area);
		} else {
			area = this.undefinedNameAreas[lowerId];
			if (!area) {
				area = new websheet.parse.UndefinedNameArea(id);
				this.undefinedNameAreas[lowerId] = area;
			}
			area.addListener(listener);
		}
		return area;
	},
	
	/**
	 * end listening the reference, so the listener will not be notified when anything changed in the area position
	 * @param reference which is already exist in area manager
	 */
	/*boolean*/endListeningArea: function(/*websheet.parse.Referece*/reference, listener) {
		var usage = reference.getUsage();
		if(usage == websheet.Constant.RangeUsage.UNDEFINEDNAME || usage == websheet.Constant.RangeUsage.NAME)
			return this.endListeningNameArea(reference.getId(), listener);
		else
			return this._endListeningArea(reference.getParsedRef(), listener, reference);
	},
	
	/**
	 * end listening name, so the listener will not be notified when anything changed in the area position
	 * @param id		the id of the name range
	 */
	/*boolean*/endListeningNameArea: function(/*string*/id, listener) {
		var lowerId = id.toLowerCase();
		
		var area = this.undefinedNameAreas[lowerId];
		if (area){
			area.removeListener(listener);
			if (!area.hasListener())
				delete this.undefinedNameAreas[lowerId];
			return true;
		}
		area = this.nameAreas[lowerId];
		var success = false;
		if (area)
			success = this._endListeningArea(area.getParsedRef(), listener, area);
		if (!success && area){
			// it might be that the name range area is in the deleted sheet
			area.removeListener(listener);
		}
		
		return success;
	},
	
	/**
	 * end listening the reference with range size if rangeArea is null
	 * otherwise end listening the rangeArea
	 */
	/*boolean*/_endListeningArea: function(/*parsedRef*/range, listener, rangeArea) {
		if (!range) return false;
		
    	var sheets = this.doc.getSheetNameRanges(range.sheetName, range.endSheetName);
	    var area;
	    for (var i = 0; i < sheets.length; i++) {
	    	var sheetName = sheets[i];
	    	var currentRange = new websheet.parse.ParsedRef(sheetName, range.startRow, range.startCol, range.endRow, range.endCol);
			var pages = this.pageTables[sheetName];
			if (pages == null) {
//				console.log("it is impossible to call endListeneningArea for area " + area.getId());
				return false;
			}
			var type = range.getType();
			var bRow = (type == websheet.Constant.RangeType.ROW);
			var bCol = (type == websheet.Constant.RangeType.COLUMN);
			this.firstPage(currentRange, true);
			while (this.hasNextPage()) {
				var bEndAndStillHasListener = false;
				if (bRow || bCol) {
					//the RowColArea only insert to the page at the first row(for column area) or the first column(for row area)
					if (!this.isStartEdgePage(this.nCur, bRow)) {
						this.nextPage(bRow, bCol);
						continue;
					}
				}
				var page = pages[this.nCur];
				if (page != null) {
					area = page.endListeningArea(area, range, listener, rangeArea);
					if (area){
						if (listener && area.hasListener()) {
							bEndAndStillHasListener = true;
							break;
						}
					} else {
						console.log("The area does not exist when endListeningArea");
					}
				}
				this.nextPage(bRow, bCol);
			}
			
			if(bEndAndStillHasListener)// do not need iterate other sheets because area should still be there
				break;
				
		}
	    
		return area ? true : false;
	},

	addAreaInUsageMap:function(area) {
		var id = area.getId();
		var usage = area.getUsage();
		if (usage == websheet.Constant.RangeUsage.NAME) {
			id = id.toLowerCase();
			this.nameAreas[id] = area;
			return;
		}
		var areaMap = this._usageMap[usage];
		if(!areaMap) {
			areaMap = {};
			this._usageMap[usage] = areaMap;
		}
		var sheetName = area.getSheetName();
		var areaSheet = areaMap[sheetName];
		if (!areaSheet) {
			areaSheet = {};
			areaMap[sheetName] = areaSheet;
		}
		areaSheet[id] = area;
	},
	
	deleteAreaInUsageMap:function(area) {
		var id = area.getId();
		var usage = area.getUsage();
		if (usage == websheet.Constant.RangeUsage.NAME) {
			id = id.toLowerCase();
			delete this.nameAreas[id];
			return;
		}
		var areaMap = this._usageMap[usage];
		if (areaMap) {
			var areaSheet = areaMap[area.getSheetName()];
			if (areaSheet)
				delete areaSheet[id];
		}
	},
	
	/**
	 * get the first page which impact by the given range address
	 * @param range
	 */
	/*void*/firstPage: function(/*parsedRef*/range, onlyQuery) {
		var startRow = range.startRow;
		var endRow = range.endRow;
		var startCol = range.startCol;
		var endCol = range.endCol;
		
		//for invalid range, only store the info according to the valid edge
		// such as A#REF!, we only store it to the page as "A1" is
		if(startRow == -1 && endRow == -1)
			startRow = endRow = 1;
		if(startCol == -1 && endCol == -1)
			startCol = endCol = 1;
			
		this.nStart = this.getPageIndex(startRow, startCol);
		this.nEnd = this.getPageIndex(endRow, endCol);
		if (onlyQuery) {
			var pages = this.pageTables[range.sheetName];
			if (this.nEnd >= pages.length)
				this.nEnd = pages.length - 1;
		}
		this.nCur = this.nStart;
		this.nRowBreak = this.getPageIndex(endRow, startCol) - this.nStart;
	},

	/**
	 * check if the given page is locate at the most left edge or the most top edge of the sheet
	 * @param page
	 * @return
	 */
	/*boolean*/isStartEdgePage: function(pageIndex, bLeft) {
		if (bLeft) {
			var index = Math.floor(pageIndex / this.ROWS_PAGE_SIZE);
			if (index == 0)
				return true;
		} else {
			var index = pageIndex % this.ROWS_PAGE_SIZE;
			if (index == 0)
				return true;
		}
		return false;
	},

	/*boolean*/hasNextPage: function() {
		if (this.nCur <= this.nEnd)
			return true;
		this.nStart = this.nEnd = this.nCur = 0;
		return false;
	},

	/*boolean*/nextPage: function(bRow, bCol) {
		if (!this.hasNextPage()) {
			console.log("no such element exception when nextPage for AreaManager");
			return;
		}
		if(bRow || bCol){
			if(bRow){
				this.nCur++;
				if (this.nCur > (this.nStart + this.nRowBreak)) {
					//only iterate the pages at the left side
					this.nCur = this.nEnd + 1;//stop here
				}
			} else {
				this.nCur += this.ROWS_PAGE_SIZE;
			}
		} else {
			this.nCur++;
			if (this.nCur > (this.nStart + this.nRowBreak)) {
				this.nStart += this.ROWS_PAGE_SIZE;
				this.nCur = this.nStart;
			}
		}
	},

	/**
	 * get the page index of the point which locate at row and col index
	 * @param row the row index 1-based
	 * @param col the col index 1-base
	 * @return the area page
	 */
	/*int*/getPageIndex: function(row, col) {
		var index = 0;
		if (!websheet.Helper.isValidRow(row) || !websheet.Helper.isValidCol(col)) {
			console.log("can not get the area page for the invalid row " + row + " or col " + col + " index");
			return 0;
		}
		if (row > this.maxSheetRows)
			index = this.ROWS_PAGE_SIZE - 1;
		else
			index = Math.floor((row - 1) / this.ROW_PER_PAGE);
		var colIndex;
		if (col > this.maxSheetCols)
			colIndex = this.COLS_PAGE_SIZE - 1;
		else
			colIndex = Math.floor((col - 1) / this.COL_PER_PAGE);
		index += colIndex * this.ROWS_PAGE_SIZE;
		return index;
	},

	// get the page range info at index
	getPageRange: function(sheetName, index) {
		var colCount = Math.floor(index / this.ROWS_PAGE_SIZE);
		var rowCount = index % this.ROWS_PAGE_SIZE;
		var row = rowCount * this.ROW_PER_PAGE + 1;
		var col = colCount * this.COL_PER_PAGE + 1;
		return {
			sheetName: sheetName,
			startRow: row,
			startCol: col,
			endRow: row + this.ROW_PER_PAGE - 1,
			endCol: col + this.COL_PER_PAGE - 1
		};
	},

	/**
	 * broadcast the areas which has the intersection with given range the area will broadcast to the listeners 
	 * Used for set cell/range data
	 * @param range the range area which data might changed
	 * @param collectAreas: an array, if existed, means just for permission check
	 */
	/*boolean*/areaBroadcast: function(/*parsedRef*/range, event, bCut, collectAreas) {
		var bBroadcast = false;
		if (range && range.isValid()) {
			var sheetName = range.sheetName;
			var pages = this.pageTables[sheetName];
			if (pages == null)
				return false;
			
			this.firstPage(range, true);
			while (this.hasNextPage()) {
				var page = pages[this.nCur];
				if (page != null)
					bBroadcast |= collectAreas ? page.broadcastByUsage(range,collectAreas) : page.areaBroadcast(range, event, bCut);
				this.nextPage();
			}

	      // areaBroadcast for the whole row/column areas on the start edge pages
			if (range.startRow > this.ROW_PER_PAGE) {
				var topRange = {
					sheetName: range.sheetName,
					startRow: 1,
					startCol: range.startCol,
					endRow: 1,
					endCol: range.endCol
				};
				this.firstPage(topRange, true);
				while (this.hasNextPage()) {
					var page = pages[this.nCur];
					if (page != null)
						bBroadcast |= collectAreas ? page.broadcastByUsage(range,collectAreas) : page.areaBroadcast(range, event, bCut);
					this.nextPage();
				}
			}

			if (range.startCol > this.COL_PER_PAGE) {
				var leftRange = {
					sheetName: range.sheetName,
					startRow: range.startRow,
					startCol: 1,
					endRow: range.endRow,
					endCol: 1
				};
				this.firstPage(leftRange, true);
				while (this.hasNextPage()) {
					var page = pages[this.nCur];
					if (page != null)
						bBroadcast |= collectAreas ? page.broadcastByUsage(range,collectAreas) : page.areaBroadcast(range, event, bCut);
					this.nextPage();
				}
			}
			
			if(bCut)
				this.manageUpdateAreas();
		}
		return bBroadcast;
	},

	/**
	 * Iterate the areas in sheet and do broadcast
	 * @param event
	 */
	/*void*/areaBroadcastInSheet: function(sheetName, event) {
		var pages = this.pageTables[sheetName];
		if (pages != null) {
			var length = pages.length;
			for ( var i = 0; i < length; i++) {
				var page = pages[i];
				if (page != null)
					page.areaBroadcastAll(event);
			}
		}
	},
	
	/**
	 * update all the areas in the given range with the row delta and col delta change Used for insert/delete row/column
	 * @param range
	 * @param rowDelta
	 * @param colDelta
	 */
	/*void*/updateBroadcastAreas: function(/*parsedRef*/range, rowDelta, colDelta, event) {
		if (range && range.isValid()) {
			var sheetName = range.sheetName;
			var sr = range.startRow;
			var sc = range.startCol;
			var er = range.endRow;
			var ec = range.endCol;
			if (rowDelta < 0)
				sr += rowDelta;
			if (colDelta < 0)
				sc += colDelta;
			var updateRange = {
				sheetName : sheetName,
				startRow : sr,
				startCol : sc,
				endRow : er,
				endCol : ec
			};
			var pages = this.pageTables[sheetName];
			if (pages == null)
				return;
			if (this.updateAreas != null)
				console.log("there are still areas in update chains");
			this.firstPage(updateRange, true);
			while (this.hasNextPage()) {
				var page = pages[this.nCur];
				if (page != null)
					page.updateAreas(range, rowDelta, colDelta, event);
				this.nextPage();
			}
			if(rowDelta || colDelta)
				this.splitSharedFormula(range, rowDelta, colDelta);
			this.manageUpdateAreas();
		}
	},
	// given func shows how to deal with each update area
	manageUpdateAreas:function(/*optional, by default is page.insertArea func*/areaFunc, 
								/*clear the useless member of area*/clearAreaFunc) {
		var AreaUpdateInfo = websheet.Constant.AreaUpdateInfo;
		// iterate updateAreas and add the area to the right page
		var areaPointer = this.updateAreas;
		while (areaPointer != null) {
			var a = areaPointer;
			areaPointer = a.next;
			var bInsert = a.updateStatus > AreaUpdateInfo.UPDATE;
			a.next = null;
			a.pre = null;
			
			if (!bInsert) {//even invalid area need to insert to page for restore in later undo action
				a.updateStatus = AreaUpdateInfo.NONE;
				continue;
			}
			
			// insert the updated range into the pages(they have been removed from their pages
			// when page.updateAreas incase the area has been disordered due to update
			var type = a.getType();
			var bRow = (type == websheet.Constant.RangeType.ROW);
			var bCol = (type == websheet.Constant.RangeType.COLUMN);
		
			var newRange = a.getParsedRef();
			var sheets = [];
			if(a.opSheets) {
				// for 3D reference, we need update areas in each sheet range
				// opSheets only exists for 3D reference, but it is not all the sheet range
				// but some of the sheets that need delete/remove/update 3D reference
				for(var i = 0; i < a.opSheets.length; i++) {
					sheets.push(a.opSheets[i].getSheetName());
				}
			} else if(a.is3DArea()) {
				// without opSheets, 3D reference should iterate each sheets
				sheets = this.doc.getSheetNameRanges(newRange.sheetName, newRange.endSheetName);
			} else {
				sheets = [newRange.sheetName];
			}
			for(var i = 0; i < sheets.length; i++) {
				var sheetName = sheets[i];
				var pages = this.pageTables[sheetName];
				if (!pages) {
					pages = [];
					this.pageTables[sheetName] = pages;
				}
				this.firstPage(newRange);
				while (this.hasNextPage()) {
					if ((bRow || bCol) && !this.isStartEdgePage(this.nCur, bRow)) {
						this.nextPage(bRow, bCol);
						continue;
					}
					var page = pages[this.nCur];
					if (page == null) {
						page = new websheet.parse.AreaPage(this.nCur, this);
						websheet.Helper.putToArray(pages, this.nCur, page);
					}
					if(areaFunc)
						areaFunc.apply(page, [a, sheetName]);
					else
						page.insertArea(a);
					this.nextPage(bRow, bCol);
				}
			}
			a.updateStatus = AreaUpdateInfo.NONE;
			if(clearAreaFunc)
				clearAreaFunc(a);
		}
		
		if(!areaFunc && this.sharedRefTrack){
			for(var id in this.sharedRefTrack){
				var ref = this.sharedRefTrack[id];
				ref.updateStatus = AreaUpdateInfo.NONE;
				this.startListeningArea(ref.getParsedRef(), null, ref);
			}
			this.sharedRefTrack = {};
		}
		
		this.updateAreas = null;
		this.updateAreasLast = null;
	},
	
	//update address(given parsedRef) of area whose is conform to rangeid, and usage,
	updateRangeByUsage:function(/*parsedRef*/newRange, rangeId, usage, event) {
		var area = this.getRangeByUsage(rangeId, usage);
		if (area) {
			var oldParsedRef = area.getParsedRef();
			this.deleteArea(area);			
			var ref = new websheet.parse.ParsedRef(newRange.sheetName, newRange.startRow, newRange.startCol,
					newRange.endRow, newRange.endCol, newRange.refMask, newRange.endSheetName);
			area.setParsedRef(ref);
			area = this.addArea(area);

			var ne = event;
			if(event)
				event._source.refValue = oldParsedRef;
			else{
				var ns = {
						action: websheet.Constant.DataChange.SET,
						refType: websheet.Constant.OPType.AREA,
						refValue: oldParsedRef//the old parsedRef
					};
				ne = new websheet.listener.NotifyEvent(websheet.Constant.EventType.DataChange, ns);
			}
			area.broadcast(ne);
			
			if(usage == websheet.Constant.RangeUsage.NAME) {
				area.setContentDirty(true);
				area.setNeedPartial(true);
			}
		}
		else
		{
			if(usage == websheet.Constant.RangeUsage.ACCESS_PERMISSION)
			{
				if(event._source.data.add)
				{
					var nEvent = dojo.clone(event);
					nEvent._source.action = websheet.Constant.DataChange.INSERT;
					var data = event._source.data;
					var nData = {bSheet: true, creator:data.creator, owners:data.add, type:websheet.Constant.PermissionType.READONLY};
					nEvent._source.data = {data:nData, rangeid:rangeId,usage:usage};
					nEvent._source.refValue = newRange;
					this._areaHandler(nEvent);
				}	
			}	
		}
		//doing the insert edit range acl action
		if(event && event._source.data && event._source.data.insert)
		{
			var nEvent = dojo.clone(event);
			nEvent._source.action = websheet.Constant.DataChange.INSERT;
			nEvent._source.data = event._source.data.insert.attrs;
			nEvent._source.refValue = websheet.Helper.parseRef(event._source.data.insert.rangeAddr);
			this._areaHandler(nEvent);
		}	
		return area;
	},

	// insert/delete/set unname/preserve/name range, with rangeId as refValue, other info are in data
	/*void*/_areaHandler: function(event) {
		var eventSource = event._source;
		var range = eventSource.refValue;//instanceof parsedRef
		var action = eventSource.action;
		var usage = eventSource.data.usage;
		var id = eventSource.data.rangeid;
		var data = eventSource.data.data;
		var mode = eventSource.mode;
		var ns = {
				action: action,
				refType: websheet.Constant.OPType.AREA,
				data: data,
				mode: mode
			};
		var ne = new websheet.listener.NotifyEvent(websheet.Constant.EventType.DataChange, ns);
		if(event._data)
			ne._data = event._data;
		switch(action) {
			case websheet.Constant.DataChange.DELETE:{
				var area = this.getRangeByUsage(id, usage);
				if (!area)
					return;
				ns.refValue = area;
				if (usage == websheet.Constant.RangeUsage.NAME && area.hasListener()) {
					var lowerId = id.toLowerCase();
					var undefinedName = new websheet.parse.UndefinedNameArea(id);
					this.undefinedNameAreas[lowerId] = undefinedName;
					ns.refValue = undefinedName;
					var nameRangeListeners = this.doc.getAreaListener(area);
					var allListeners = area.getAllListener();
					var length = allListeners.length;
					for(var i = 0; i < length; i++){
						var l = allListeners[i];
						if(!nameRangeListeners || nameRangeListeners.indexOf(l) == -1){
							undefinedName.addListener(l);
						}
					}
				}
				this.deleteArea(area);
				area.broadcast(ne);
				area.removeAllListener();
				break;
			}
			case websheet.Constant.DataChange.INSERT:{
				var area = this.getRangeByUsage(id, usage);
				if (area){
					this.deleteArea(area);
				}
				if (usage == websheet.Constant.RangeUsage.NAME){
					area = new websheet.parse.NameArea(range, id);
					//set unloaded to true, so that when getCells for such name reference
					//if the new name reference refer to the unload sheet, it can getPartial for that sheet
					area.setNeedPartial(true);
				}else 
					area = new websheet.parse.Area(range, id, usage);
				area.data = {};
				for(var attr in data) {
					area.data[attr] = data[attr];
				}
				ns.refValue = area;
				area = this.addArea(area);
				var listener = this.doc.getAreaListener(area);
				if(listener){
					for(var i = 0; i < listener.length; i++){
						var l = listener[i];
						if(!area.hasListener(l))
							area.addListener(l);
					}
				}
				
				if (usage == websheet.Constant.RangeUsage.NAME) {
					area.broadcast(ne);//notify name range handler
					var lowerId = id.toLowerCase();
					var ua = this.undefinedNameAreas[lowerId];
					if (ua) {
						ua.broadcast(ne);
						area.addListeners(ua.getAllListener());
						ua.removeAllListener();
						delete this.undefinedNameAreas[lowerId];
					}
				} else {
					//add listener for each usage, then broadcast
					area.broadcast(ne);
					
					if(!listener) {
						//only for preserve range
						//because for other areas such as chart, the data might store "chart" model which is not belong to Area.data
						area.data = {};
						for(var attr in data)//such as usage, attribute,series,index
							area.data[attr] = data[attr];
					}
				}
				break;
			}
			case websheet.Constant.DataChange.SET:{
				var area = this.updateRangeByUsage(range, id, usage, ne);
				break;
			}
		}
		
		if(ne._data)
			event._data = ne._data;
	},
	
	// delete/rename sheet
	_sheetHandler:function(event)
	{
		var eventSource = event._source;
		var refValue = eventSource.refValue;
		var action = eventSource.action;
		var data = eventSource.data;
		this.resetUndoData();
		if (action == websheet.Constant.DataChange.PREDELETE) {
			var sheetName = refValue;
			var areaMap = this.backupSheet(sheetName, event);
			var uuid = data.uuid;
			this.doc.getRecoverManager().backupAreaMaps(areaMap, uuid);
			
			// delete invalid 3D reference and put them in 2D reference list
			this.manageUpdateAreas(websheet.parse.AreaPage.prototype.modify3DTo2DRef);
			
		} else if (action == websheet.Constant.DataChange.SET) {
			var sheetName = refValue;
			var newSheetName = eventSource.newSheetName;
			if (newSheetName) {
				var pages = this.pageTables[sheetName];
				if (pages) {
					this.pageTables[newSheetName] = pages;
					delete this.pageTables[sheetName];
					for ( var i = 0; i < pages.length; i++) {
						var page = pages[i];
						if (page)
							page.setSheetName(newSheetName, event, false, sheetName);
					}
				}
				for (var usage in this._usageMap) {
					var sheetMap = this._usageMap[usage];
					var map = sheetMap[sheetName];
					if (map) {
						sheetMap[newSheetName] = map;
						delete sheetMap[sheetName];
					}
				}
			}
		} else if (action == websheet.Constant.DataChange.INSERT) {
			var sheetName = refValue.split("|")[0];
			var areaMap = data.areaMap;
			this.recoverSheet(sheetName, areaMap, event);

			// get previous page table and find all 3-D references
			// insert existing 3-D reference into the new page table if necessary
			var sheet = this.doc.getSheet(sheetName);
			if (sheet != null) {
				var sheetIndex = sheet.getIndex();//1-based
				var preSheet = this.doc._sheets[sheetIndex-2];
				this._insert3DRefFromPreSheet(preSheet, sheet, event);
			}
			this.manageUpdateAreas(null, this._clear3DRefFunc);
		} else if (action == websheet.Constant.DataChange.PREMOVE) {
			var values = refValue.split("|");
			var sheetName = values[0];
			var sheetIndex = parseInt(values[1]);
			var newSheetIndex = parseInt(values[2]);
			
			// update 3D reference for move sheet event, deal with case 1-4 in Area.preMoveSheet 
			this.preMoveSheet(event, sheetName, sheetIndex, newSheetIndex);
			// insert 3D reference if move in the sheet range (case 5-6 in Area.preMoveSheet)
			// because the 3D ref is not in the moved sheet, it have not been iterated yet 
			var sheet = this.doc.getSheet(sheetName);
			var preSheet = null;
			if(sheetIndex < newSheetIndex)
				preSheet = this.doc._sheets[newSheetIndex-1];
			else
				preSheet = this.doc._sheets[newSheetIndex-2];
			this._insert3DRefFromPreSheet(preSheet, sheet, event);
			
			this.manageUpdateAreas(websheet.parse.AreaPage.prototype.update3DRefForMove, this._clear3DRefFunc);
		}
	},
	
	// for 3D reference, change the 3D reference start/end sheet name for delete/move sheet operationi
	preMoveSheet: function(event, sheetName, sheetIndex, newSheetIndex) {
		var pages = this.pageTables[sheetName];
		if (pages == null)
			return;
		for (var i = 0; i < pages.length; i++) {
			var page = pages[i];
			if (page) {
				page.preMoveSheet(event, sheetIndex, newSheetIndex);
			}
		}
		
	},
	
	_clear3DRefFunc: function(ref3D) {
		delete ref3D.opSheets;
	},
	
	// insert the 3D reference of preSheet into the current sheet
	_insert3DRefFromPreSheet: function(preSheet, sheet, event) {
		var AreaUpdateInfo = websheet.Constant.AreaUpdateInfo;
		if(preSheet) {
			var preSheetName = preSheet.getSheetName();
			var prePages = this.pageTables[preSheetName];
			if(prePages) {
				for (var i = 0; i < prePages.length; i++) {
					var prePage = prePages[i];
					if (prePage) {
						var preRef3DList = prePage.ref3DList;
						for(var j = 0; j < preRef3DList.length; j++) {
							var pre3DRef = preRef3DList[j];
							if(pre3DRef && (pre3DRef.getEndSheetName() != preSheetName)
									&& (pre3DRef.updateStatus & AreaUpdateInfo.UPDATE) == 0 ) {
//								var page = pages[i];
//								if (page == null) {
//									page = new websheet.parse.AreaPage(this.nCur, this);
//									websheet.Helper.putToArray(pages, this.nCur, page);
//								}
								pre3DRef.opSheets = [sheet];
								pre3DRef.updateStatus |= (AreaUpdateInfo.UPDATE | AreaUpdateInfo.ADD);
								var data = event._source.data;
								if (!data){
									data = {};
									event._source.data = data;
								}
								pre3DRef.setContentDirty(true);
								data.b3DRef = true;
								data.bDirty = true;
								pre3DRef.broadcast(event);
								delete data.b3DRef;
								delete data.bDirty;
								this.appendToReferenceTrack(pre3DRef);
							}
						}
					}
				} 
			}
		}
	},
	
	_rowColHandler:function(bDelete, bRow, event) {
		var eventSource = event._source;
		var range = eventSource.refValue;//instanceof ParsedRef
		var ns = {
				action: eventSource.action,
				refType:eventSource.refType,
				refValue: range
			};
		var ne = new websheet.listener.NotifyEvent(websheet.Constant.EventType.DataChange, ns);
		if(event._data)
			ne._data = event._data;
		// modify the area position and set dirty for impacted cells
		var rowDelta = 0;
		var colDelta = 0;
		if (bRow)
			rowDelta = range.endRow - range.startRow + 1;
		else
			colDelta = range.endCol - range.startCol + 1;
		var updateRange = new websheet.parse.ParsedRef(range.sheetName,
				   1, 1, this.maxSheetRows, this.maxSheetCols, websheet.Constant.RANGE_MASK);
		this.resetUndoData();
		if (bDelete) {
			if (bRow) {
				updateRange.startRow = range.startRow + rowDelta;
				rowDelta = -rowDelta;
			}else {
				updateRange.startCol = range.startCol + colDelta;
				colDelta = -colDelta;
			}
			
		} else {
			if (bRow)
				updateRange.startRow = range.startRow;
			else
				updateRange.startCol = range.startCol;
		}
		this.updateBroadcastAreas(updateRange, rowDelta, colDelta, ne);
		if(ne._data)
			event._data = ne._data;
		return {updateRange: updateRange, rowDelta:rowDelta, colDelta:colDelta};
	},
	
	preCondition:function(event)
	{
		var s = event._source;
		if (event._type != websheet.Constant.EventType.DataChange ||
		   (s.action == websheet.Constant.DataChange.CHANGEHEIGHTORWIDTH) ||
		   (s.action == websheet.Constant.DataChange.INSERT 
				   && (s.refType == websheet.Constant.OPType.COLUMN || s.refType == websheet.Constant.OPType.ROW)) )
		{
			return false;
		}
		
		return true;
	},
	
	/*void*/notify: function(caster, event) {
		var type = event._type;
		if (type == websheet.Constant.EventType.DataChange) {
			var trackFromCell = this.fCellLast;
			var s = event._source;
			var refType = s.refType;
			var action = s.action;
			var updateRange, rowDelta, colDelta;
			// insert/delete/set range address
			if (refType == websheet.Constant.OPType.RANGEADDRESS) {
				this._areaHandler(event);
			} else if (refType == websheet.Constant.OPType.SHEET) {
				this._sheetHandler(event);
			} else if ((action == websheet.Constant.DataChange.PREINSERT || action == websheet.Constant.DataChange.PREDELETE)) {
				if (refType == websheet.Constant.OPType.ROW || refType == websheet.Constant.OPType.COLUMN) {
					var bDelete = true;
					if (action == websheet.Constant.DataChange.PREINSERT)
						bDelete = false;
					var bRow = true;
					if (refType == websheet.Constant.OPType.COLUMN)
						bRow = false;
					var rst = this._rowColHandler(bDelete, bRow, event);
					updateRange = rst.updateRange;
					rowDelta = rst.rowDelta;
					colDelta = rst.colDelta;
				}
			} else if( action == websheet.Constant.DataChange.FILTER || (action == websheet.Constant.DataChange.SHOW && refType == websheet.Constant.OPType.ROW) ) { // un-hide rows
				// show rows(multi-rows) msg is differenct with columns(sheetName.startCol:endCol)
				// refValue in message: array of parsedRef, [sheetName.1:1,sheetName.3:3]
				var rows = s.refValue;
				for (var i = 0; i < rows.length; i++) {
					var info = rows[i];
					this.areaBroadcast(info, event);
				}
			} else if (action == websheet.Constant.DataChange.SET || action == websheet.Constant.DataChange.CUT 
					|| action == websheet.Constant.DataChange.SHOW || action == websheet.Constant.DataChange.HIDE
					|| action == websheet.Constant.DataChange.MERGE || action == websheet.Constant.DataChange.PRESPLIT) {
				if (refType == websheet.Constant.OPType.CELL || refType == websheet.Constant.OPType.RANGE || refType == websheet.Constant.OPType.ROW
						|| refType == websheet.Constant.OPType.COLUMN) {
					if(action == websheet.Constant.DataChange.CUT ){
						this.resetUndoData();
					}
					var range = websheet.Helper.parseRef(s.refValue);
					this.areaBroadcast(range, event, action == websheet.Constant.DataChange.CUT);
				}
			}
			if(trackFromCell) {
				trackFromCell = trackFromCell.next;
			} else
				trackFromCell = this.fCellHead;
			this.trackFormula(event, trackFromCell, updateRange, rowDelta, colDelta);			
		}
	},
	
	endListeningSharedArea: function(sharedRef, listener){
		if(sharedRef.usage == ""){//absolute ref 
			var areaPointer = this.updateAreas;
			while (areaPointer != null) {
				var a = areaPointer;
				areaPointer = a.next;
				if(sharedRef == a){
					a.removeListener(listener);
					if(!a.hasListener()){
						if(this.updateAreas == a)
							this.updateAreas = areaPointer;
						if(a.pre)
							a.pre.next = areaPointer;
						if(areaPointer)
							areaPointer.pre = a.pre;
					}
					return true;
				}
			}
			return false;
		}
		if(!this.sharedRefTrack)
			return false;
		if(this.sharedRefTrack[sharedRef._id]){
			sharedRef.removeListener(listener);
			if(!sharedRef.hasListener())
				delete this.sharedRefTrack[sharedRef._id];
			return true;
		}
		return false;
	},
	
	appendToSharedFormulaTrack: function(sharedFormulaRef){
		if(this.sFormulaTrack[sharedFormulaRef._id])
			return;
		this.sFormulaTrack[sharedFormulaRef._id] = sharedFormulaRef;
	},
	
	appendToSharedRefTrack: function(sharedRef){
		if(!this.sharedRefTrack)
			this.sharedRefTrack = {};
		if(this.sharedRefTrack[sharedRef._id])
			return;
		this.sharedRefTrack[sharedRef._id] = sharedRef;
	},
	// /////////////////////////// Formula Track // ///////////////////////////////////	
	appendToRangeDataTrack: function(ref){
		if (ref && (ref.pre || this.rDataHead == ref))
			return;
		if(this.rDataLast != null)
			this.rDataLast.next = ref;
		else
			this.rDataHead = ref;
		ref.pre = this.rDataLast;
		ref.next = null;
		this.rDataLast = ref;
	},
	
	/*boolean*/isInRangeTrack: function(cell) {
		var rowIdx = cell.getRow();
		var colIdx = cell.getCol();
		var range = this.rDataHead;
		while(range){
			if(rowIdx >= range.getStartRow() && rowIdx <= range.getEndRow() 
				&& colIdx >= range.getStartCol() && colIdx <= range.getEndCol())
				return true;
			range = range.next;
		}
		return false;
	},
	
	/*boolean*/isInFormulaTrack: function(cell) {
		if (cell != null && (cell.pre != null || this.fCellHead == cell))
			return true;
		return false;
	},

	/*void*/appendToFormulaTrack: function(cell) {
		if (this.isInFormulaTrack(cell) || this.isInRangeTrack(cell))
			return;
		if (this.fCellLast != null)
			this.fCellLast.next = cell;
		else
			this.fCellHead = cell;
		cell.pre = this.fCellLast;
		cell.next = null;
		this.fCellLast = cell;
	},

	/*void*/removeFromFormulaTrack: function(cell) {
		if (cell == null)
			return;
		var pre = cell.pre;
		if (pre != null || this.fCellHead == cell) {
			var next = cell.next;
			if (pre != null)
				pre.next = next;
			else
				this.fCellHead = next;
			if (next != null)
				next.pre = pre;
			else
				this.fCellLast = pre;
			cell.pre = null;
			cell.next = null;
		}
	},
	
	appendToReferenceTrack: function(reference) {
		if (reference && (reference.pre || this.updateAreas == reference))
			return;
		if (this.updateAreasLast)
			this.updateAreasLast.next = reference;
		else
			this.updateAreas = reference;
		reference.pre = this.updateAreasLast;
		reference.next = null;
		this.updateAreasLast = reference;
	},

	/**
	 * iterate the formula cell in the track list and append the new formula cell to track list if they are impact cells
	 */
	/*void*/trackFormula: function(event, trackFromCell, /*parsedRef*/updateRange, rowDelta, colDelta) {
		var s = {
			action : websheet.Constant.DataChange.SET,
			refType : websheet.Constant.OPType.RANGE
		};
		var e = new websheet.listener.NotifyEvent(websheet.Constant.EventType.DataChange, s);
		var cellIter = trackFromCell;
		// performance improve, which should be deprecate when we support autofill range reference
		// if the formula track list contains more than 50 formulas, we need combine them into big range and broadcast
		var formulaNum = 0;
		var cellIterLast = this.fCellLast;
		while (cellIter != null) { 
			formulaNum++;
			if(formulaNum > 50){
				formulaNum = 0;
				this._combineCellsAndBroadcast(trackFromCell, cellIterLast, event, updateRange, rowDelta, colDelta);
				cellIter = trackFromCell = cellIterLast.next;
				cellIterLast = this.fCellLast;
				if(cellIter == null)
					break;
			}
			var sr = cellIter.getRow();
			var sc = cellIter.getCol();
			var sheetName = cellIter.getSheetName();
			if (updateRange && (updateRange.sheetName == sheetName) ) {
				if (rowDelta != 0) 
					sr = websheet.Helper.updateArea(updateRange.startRow, sr, sr, rowDelta, this.maxSheetRows).newStart;
				if (colDelta != 0) 
					sc = websheet.Helper.updateArea(updateRange.startCol, sc, sc, colDelta, this.maxSheetCols).newStart;
			}
			var cellPos = new websheet.parse.ParsedRef(sheetName, sr,sc, sr,sc, websheet.Constant.RANGE_MASK);
			s.refValue = cellPos;
			this.areaBroadcast(cellPos, e);
			// for grid to update cell/row and using the new position of cell
			this._addRowForGridUpdate(sheetName, sr, cellIter, event);
			
			cellIter = cellIter.next;
		}
		
		this.clearTrackList(this.updateAreas, this.updateAreasLast);
		this.updateAreas = this.updateAreasLast = null;
	},
	
	_combineCellsAndBroadcast: function(firstCell, lastCell, event, updateRange, rowDelta, colDelta) {
		var cellIter = firstCell;
		var sheetMap = {};
		var sheetName = firstCell.getSheetName();
		var r = firstCell.getRow();
		var c = firstCell.getCol();
		sheetMap[sheetName] = {sheetName: sheetName, startRow:r, startCol:c, endRow:r, endCol:c};
		
		do {
			cellIter = cellIter.next;
			if(cellIter == null)
				break;
			r = cellIter.getRow();
			c = cellIter.getCol();
			sheetName = cellIter.getSheetName();
			var range = sheetMap[sheetName];
			if(!range){
				range = {sheetName: sheetName, startRow:r, startCol:c, endRow:r, endCol:c};
				sheetMap[sheetName] = range;
				continue;
			} 
			if(r < range.startRow)
				range.startRow = r;
			else if (r > range.endRow)
				range.endRow = r;
			if(c < range.startCol)
				range.startCol = c;
			else if(c > range.endCol)
				range.endCol = c;
			// for grid to update cell/row and using the new position of cell
			this._addRowForGridUpdate(sheetName, r, cellIter, event);
		} while(cellIter != lastCell);
		
		var s = {
				action : websheet.Constant.DataChange.SET,
				refType : websheet.Constant.OPType.RANGE
			};
		var e = new websheet.listener.NotifyEvent(websheet.Constant.EventType.DataChange, s);
			
		for(sheetName in sheetMap){
			var range = sheetMap[sheetName];
			if (updateRange && (updateRange.sheetName == sheetName) ) {
				if (rowDelta != 0) {
					var result = websheet.Helper.updateArea(updateRange.startRow, range.startRow, range.endRow, rowDelta, this.maxSheetRows);
					range.startRow = result.newStart;
					range.endRow = result.newEnd;
				}
				if (colDelta != 0) {
					var result = websheet.Helper.updateArea(updateRange.startCol, range.startCol, range.endCol, colDelta, this.maxSheetCols);
					range.startCol = result.newStart;
					range.endCol = result.newEnd;
				}
			}
			var rangePos = new websheet.parse.ParsedRef(sheetName, range.startRow, range.startCol, range.endRow, range.endCol, websheet.Constant.RANGE_MASK);
			s.refValue = rangePos;
			this.areaBroadcast(rangePos, e);
		}
	},

	clearTrackList:function(head, last) {
		while (head) {
			var list = {head : head, last:last};
			this.removeFromTrackList(head, list);
			head = list.head;
			last = list.last;
		}
	},
	
	removeFromTrackList:function(obj, list) {
		if (!obj)
			return;
		var head = list.head;
		var last = list.last;
		var pre = obj.pre;
		if (pre || head == obj) {
			var next = obj.next;
			if(pre)
				pre.next = next;
			else
				head = next;
			if (next)
				next.pre = pre;
			else
				last = pre;
			obj.next = null;
			obj.pre = null;
			
			list.head = head;
			list.last = last;
		}
	},
	
	/*void*/_addRowForGridUpdate: function(sheetName, rowIndex, cell, event) {
		if(!event._data)
			event._data = {};
		if(!event._data.rows) {
			event._data.rows = [];
			event._data.rowsId = {};
		}
		var rowId = cell._parent._id;
		var row = [sheetName, ".", rowIndex].join("");
		if(!event._data.rowsId[rowId]) {
			event._data.rows.push(row);
			event._data.rowsId[rowId] = true;
		}		
	},
	
	splitSharedFormula:function(updateRange, /*int*/rowDelta, /*int*/colDelta){
		for(var id in this.sFormulaTrack){
			var sharedFormulaRef = this.sFormulaTrack[id];
			sharedFormulaRef.splitSharedReferences(updateRange, rowDelta, colDelta, this.doc);
		}
		this.sFormulaTrack = {};
	},
	
	/*array area*/getRangesByUsage: function(usage, sheetName){
		if(!usage)
			return null;
		var ranges = [];
		if (usage == websheet.Constant.RangeUsage.NAME) {
			for (var id in this.nameAreas){
				var nameArea = this.nameAreas[id];
				if (!sheetName || nameArea.getSheetName() == sheetName){
					ranges.push(nameArea);
				}
			}
		} else {
			var map = this._usageMap[usage];
			for(var sName in map)
			{
				if (!sheetName ||sName == sheetName){ 
					var sheet = map[sName];
		            if(sheet)
					{
						for(var rangeId in sheet)
						{
							var range = sheet[rangeId];
							ranges.push(range);
						}
					}
				}
			}
		}
		return ranges;
	},
	
	//get the range by rangeId and usage which should get from _usageMap
	/*area*/getRangeByUsage: function(rangeId, usage, sheetName)
	{
		if(!usage || !rangeId)
			return null;
		if (usage){
			if(usage == websheet.Constant.RangeUsage.NAME){
				rangeId = rangeId.toLowerCase();
				return this.nameAreas[rangeId];
			}
			var map = this._usageMap[usage];
			if (sheetName) {
				var sheet = map[sheetName];
				if (sheet)
					return sheet[rangeId];
			}
				
			for(var sheetName in map)
			{
				var sheet = map[sheetName];
				if(sheet[rangeId])
					return sheet[rangeId];
			}
		} else {
			var area = this.nameAreas[rangeId.toLowerCase()];
			if (area)
				return area;
			for (var usage in this._usageMap) {
				area = this.getRangeByUsage(rangeId, usage, sheetName);
				if (area)
					return area;
			}
		}
		return null;
	},	
	
	/*array*/getImpactCells: function(event) {
		var range = websheet.Helper.parseRef(event._source.refValue);
		//first clear the formula track list, otherwise it will make returned cells contains the cells of old formula tracklist
		this.clearTrackList(this.fCellHead, this.fCellLast);
		this.fCellHead = this.fCellLast = null;
		// set dirty for the impact cells
		this.areaBroadcast(range, event);
		var cells = [];
		var cellIter = this.fCellHead;
		while (cellIter != null) {
			cells.push(cellIter);
			cellIter = cellIter.next;
		}
		this.clearTrackList(this.updateAreas, this.updateAreasLast);
		this.updateAreas = this.updateAreasLast = null;
		return cells;
	},
	
//	/* when delete column/rows, some area border may be changed, 
//	 * the impact cells need record the original string */
	/*array*/getCells4DeleteUndo: function() {
		var cells = [];
		for(var cellId in this.delUndoCells) {
			cells.push(this.delUndoCells[cellId]);
		}
		return cells;
	},
	
	/*void*/resetUndoData: function() {
		this.delUndoCells = {};
		this.prepareUndoCells = {};
		this.delUndoAreas = {};
		this.delUndoSharedRefs = {};
		this.splitUndoSharedRefs = {};
		this.prepareUndoSharedRefs = {};
		this.delUndoChartRef = {};
	},
	
	/*void*/_addCell4DeleteUndo: function(/*websheet.model.Cell*/cell) {
		var undoCell = this.delUndoCells[cell._uniqueId];
		if(!undoCell) {
			undoCell = this.prepareUndoCells[cell._uniqueId];
			if(!undoCell){
				this._addCellsInList(cell, this.delUndoCells);
			} else {
				this.delUndoCells[cell._uniqueId] = undoCell;
			}
		}
	},
	
	//prepare the cell's raw value if the cell refer to two reference
	//the first reference size changed, but do not need collect(not delete the edge), then set cell update formula to be true
	//the second reference need collect(which delete the edge), but the cell should not update formula to get the _rawValue
	_prepareCell4DeleteUndo:function(cell){
		this._addCellsInList(cell, this.prepareUndoCells);
	},
	
	_addCellsInList:function(cell, list){
		var undoCell = list[cell._uniqueId];
		if(!undoCell){
			if (cell._bUpdateFormula) {
				cell.regenerateFormula();
			}
			var content = {};
			list[cell._uniqueId] = content;
			content.v = cell._rawValue;
			// serialize tokenArray if has
			//bNotUpdateFormula = true, same reason like _rawValue above
			if (cell._tokenArray && cell._tokenArray.length > 0) {
				content.tarr = cell.serializeTokenArray(true);
			}
			content.cell = cell;
		}
	},
	
	getChartSequenceRefs4DeleteUndo:function(){
		return this.delUndoChartRef;
	},
	
	_addChartSequenceRef4DeleteUndo:function(attrs, dataSequence){
		var undoChartRef = this.delUndoChartRef[attrs.rangeid];
		if(!undoChartRef){
			undoChartRef = attrs;
			undoChartRef._chartDataSeqList = [];
			this.delUndoChartRef[attrs.rangeid] = undoChartRef;
		}
		undoChartRef._chartDataSeqList.push(dataSequence);
	},
	
	/* impact name/chart/image/filter areas
	*/
	/*object*/getRanges4DeleteUndo: function() {
		var undoRanges = {};
		//{usage:array of range}
		for(var id in this.delUndoAreas){
			var range = this.delUndoAreas[id];
			var usage = range.usage;
			var usageRanges = undoRanges[usage];
			if(!usageRanges){
				usageRanges = {};
				undoRanges[usage] = usageRanges;
			}
			usageRanges[id] = range;
		}
		return undoRanges;
	},
	
	addSharedRef4DeleteUndo: function(sharedRef){
		var undoSharedref = this.delUndoSharedRefs[sharedRef._id];
		if(!undoSharedref){
			undoSharedref = this.prepareUndoSharedRefs[sharedRef._id];
			if(!undoSharedref)
				this.delUndoSharedRefs[sharedRef._id] = sharedRef.getUndoInfo();
			else
				this.delUndoSharedRefs[sharedRef._id] = undoSharedref;
		}
	},
	
	addSharedRef4InsertUndo: function(sharedRef){
		if (!sharedRef._parsedRef.isValid())
			return;
		var undoSharedref = this.splitUndoSharedRefs[sharedRef._id];
		if (!undoSharedref)
			this.splitUndoSharedRefs[sharedRef._id] = sharedRef.getUndoInfo();
	},

	prepareSharedRef4DeleteUndo: function(sharedRef){
		var undoSharedref = this.prepareUndoSharedRefs[sharedRef._id];
		if(!undoSharedref){
			this.prepareUndoSharedRefs[sharedRef._id] = sharedRef.getUndoInfo();
		}
	},
	
	/*
	 * impact shared references, for example data validation
	 */
	getSharedRefs4DeleteUndo: function(){
		return this.delUndoSharedRefs;
	},
	
	getSharedRefs4InsertUndo: function(){
		return this.splitUndoSharedRefs;
	},

	backupSheet:function(sheetName, event){
		var usageMap = {};
		var areaMap = {usageMap:usageMap};
		
		//backup name range
		var namesMap = {};
		usageMap[websheet.Constant.RangeUsage.NAME] = namesMap;
		for (var id in this.nameAreas){
			var nameArea = this.nameAreas[id];
			if ( nameArea.getSheetName() == sheetName || nameArea.getEndSheetName() == sheetName){
				namesMap[id] = nameArea.getParsedRef().copy();
			}
		}
		
		//backup pages
		var pages = this.pageTables[sheetName];
		if (pages != null) {
			var length = pages.length;
			for ( var i = 0; i < length; i++) {
				var page = pages[i];
				if (page != null) {
					page.setInvalidSheetName(event, sheetName);
				}
			}
			areaMap.pages = pages;
		}
		delete this.pageTables[sheetName];
		
		//back up other usage map
		for(var usage in this._usageMap){
			var map = this._usageMap[usage];
			var sheet = map[sheetName];
		    if(sheet)
			{
		    	if(usage == websheet.Constant.RangeUsage.COMMENTS)
				{
					this.delUndoAreas = {};
					for(var rangeId in sheet)
					{
						var range = sheet[rangeId];
						this.delUndoAreas[rangeId] = range._toUndoRangeInfo();
					}
				}
		    	else{
		    		var unnamesMap = {};
					usageMap[usage] = unnamesMap;
					for(var rangeId in sheet)
					{
						var range = sheet[rangeId];
						unnamesMap[rangeId] = range;
					}
		    	}
				delete map[sheetName];
			}
		}
		return areaMap;
	},
	
	recoverSheet: function(sheetName,areaMap, event)
	{
		if(!areaMap) return;
		//recover other usage map
		var usageMap = areaMap.usageMap;
		if(usageMap){
			var namesMap = usageMap[websheet.Constant.RangeUsage.NAME];
			delete usageMap[websheet.Constant.RangeUsage.NAME];
			for(var usage in usageMap) {
				var map = usageMap[usage];
				if(map){
					for(var id in map){
						var area = map[id];
						this.addAreaInUsageMap(area);
					}
				}
			}
		}
		//recover pages
		var pages = areaMap.pages;
		if(pages){
			this.pageTables[sheetName] = pages;
			var length = pages.length;
			for( var i = 0 ; i < length; i++) {
				var page = pages[i];
				if(page){
					page.setSheetName(sheetName, event, true);
				}
			}
		}
		
		//recover name ranges
		if(namesMap) {
			var editor = websheet.model.ModelHelper.getEditor(); 
			for(var id in namesMap){
				var parsedRef = namesMap[id];
				editor.getController().setRangeInfo(parsedRef, {rangeid:id, usage:websheet.Constant.RangeUsage.NAME});
			}
		}		
	},
	
	////////////////////////////////////////////HEALTH CHECK//////////////////////////////
	areaConsistencyCheck:function(/*parsedRef*/range, rangeArea, bExist) {
		if (range.isValid()) {
	    	var sheetName = range.sheetName;
	    	var pages = this.pageTables[sheetName];
			if (!pages) {
				pages = [];
				this.pageTables[sheetName] = pages;
			}
			var type = range.getType();
			var bRow = (type == websheet.Constant.RangeType.ROW);
			var bCol = (type == websheet.Constant.RangeType.COLUMN);
			
			this.firstPage(range, true);
			while (this.hasNextPage()) {
				if (bRow || bCol) {
					// the RowColArea only insert to the page at
					// the first row(for column area) or the
					// first column(for row area)
					if (!this.isStartEdgePage(this.nCur, bRow)) {
						this.nextPage();
						continue;
					}
				}
				var page = pages[this.nCur];
				if (page == null) {
					if (bExist)
						return false;
					else {
						this.nextPage();
						continue;
					}
				}
				var area = page.getArea(range, rangeArea);
				if (bExist) {
					if (!area)
						return false;
					if (area.compare(range) != websheet.Constant.AreaRelation.EQUAL)
						return false;
					if (rangeArea){
						if(area != rangeArea)
							return false;
					}
				} else {
					if(area)
						return false;
				}
				this.nextPage();
			}
		} else 
			return false;
		return true;
	},
	
	consistencyCheck:function(){
		for(var sheetName in this.pageTables) {
			var pages = this.pageTables[sheetName];
			var pageLength = pages.length;
			for(var i = 0; i < pageLength; i++) {
				var page = pages[i];
				if (page) {
					if (!page.consistencyCheck())
						return false;
				}
			}
		}
		return true;
	}
});