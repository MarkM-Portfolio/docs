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
/* Sheet Model									    */
/****************************************************/
dojo.provide("websheet.model.Sheet");
dojo.require("websheet.functions.IObject");
dojo.declare("websheet.model.Sheet",websheet.functions.Sheet,{
	/*Array*/_rows:null,						// rows array
	/*Array*/_columns:null,					// columns array
	/*String*/_id:null,						// sheet id
	/*String*/_name:null,						// sheet name
	/*String*/_tabColor: null,
	/*Document*/_parent:null,					// document
	/*IDManager*/_idManager:null,				//IDManager instance
	/*int*/initMaxColIndex: 0,
	/*int*/initMaxRowIndex: 0,
	/*boolean*/initFilterRow: false,			//check if the sheet has filtered row when first load
												//it is used for show range filter warning message
	/*Map*/_freezeInfo: null,						//freeze window indexes, {row:0, col:0}
	/*String*/_direction: "ltr",				//sheet direction (mirroring)
	/*String*/_visibility: "visible",			//sheet visibility info, "visible", "hidden", "veryHidden"
	ModelHelper: websheet.model.ModelHelper,
	Constant: websheet.Constant,
	_bDirty: false,								//one criteria that the cell refer to this sheet need getPartial when calculate
	_bProtected: false,
	_offGridLine: false,
	/**
	 * constructor
	 */
	constructor: function(parent,sheetId,sheetName,meta) {
		this._id = sheetId;
		this._name = sheetName;
		this._parent = parent;
		this._idManager = this._parent._idManager;
		this._rows = new Array();
		this._columns = new Array();
		this._fCells = [];
		this._freezeInfo = {};
		this._rowHeight = null;
		
		if (meta)
		{
			if (meta.dir){
				this._direction = meta.dir;
			}
			if (meta["protected"])
				this._bProtected = meta["protected"];			
			// since 1.03 version, the abbreviated name is used
			var visibility = meta.visibility !== undefined ? meta.visibility : meta.vis;
			if (visibility){
				this._visibility = visibility;
			}
			if (meta.color)
				this._tabColor = meta.color;
			if (meta.offGridLine)
				this._offGridLine = meta.offGridLine;
		}
	},

	/////////  websheet.functions.Sheet    //////////////////
	/**
	 * 1-based
	 */
	/*integer*/getIndex:function()
	{
		var index = this._idManager.getSheetIndexById(this._id);
		if(index > -1)
			index++;
		return index;
	},
	
	
	/////////  End of websheet.functions.Sheet //////////////
	
	///////// helper function to get row/column id/index from idmanager ////////
	
	/*int*/getRowIndex: function(id) {
		return this._idManager.getRowIndexById(this._id, id);
	},
	
	/*id*/getRowId: function(index) {
		return this._idManager.getRowIdByIndex(this._id, index);
	},
	
	/*int*/getColIndex: function(id) {
		return this._idManager.getColIndexById(this._id, id);
	},
	
	/*id*/getColId: function(index) {
		return this._idManager.getColIdByIndex(this._id, index);
	},
	
	/*array*/getRowIdArray: function(startIndex, endIndex) {
		return this._idManager.getRowIdArrayByIndex(this._id, startIndex, endIndex);
	},
	
	/*array*/getColIdArray: function(startIndex, endIndex) {
		return this._idManager.getColIdArrayByIndex(this._id, startIndex, endIndex);
	},
	
	/*bool*/getOffGridLines: function(){
		return this._offGridLine;
	},
	
	/*void*/setOffGridLines: function(off) {
		this._offGridLine = off;
	},
	
	////////////////////////////////////////////////////////
	
    /////////////////////////////////////////////////////////
    /////// PRIVATE FUNCTION ////////////////////////////////
    /////////////////////////////////////////////////////////
	/**
	 * parse all cells in current sheet
	 */
	/*void*/_parse:function(){
		dojo.forEach(this._rows,function(row){
			row._parse();
		});
	},
	/**
	 * partial parse the cells in current sheet,
	 * and set time out for the other cells
	 */
	_partialParse:function(startIndex){
		try{
			this._parent.setClientPartialStatus(this._id, true, true);
			if(!startIndex)
				startIndex = 0;
			var size = this._fCells.length;
			var endIndex = startIndex + this.Constant.PartialParseCellCnt;
			if((endIndex < startIndex) || (endIndex > size))
				endIndex = size;
			for(var i=startIndex; i<endIndex; i++){
				var cell = this._fCells[i];
				cell._calculate();
			}
			if(endIndex < size){
				setTimeout(dojo.hitch(this, "_partialParse", endIndex), 500);
			}else{
//				console.log("_partialParse : " + this._id + " done!");
				this._parent.setClientPartialStatus(this._id, true, false);
				this._fCells = [];
			}
		}catch(e){
			console.log("client side partial parse error");
			this._parent.setClientPartialStatus(this._id, true, false);
			this._fCells = [];
		}	
	},
	/**
	 * create new row object
	 * if the row at the position is exist, then return it directly
	 * @param rowIndex 		row position
	 * @param rowid			row id
	 * @param height		row height
	 * @param repeatednum	row repeated number
	 * @param sort			if sort is false,then will find the position to insert into rows array
	 * @param rowsArray		if given, then check if the row at rowIndex is exist or not, if yes, return it directly
	 * return          new row object
	 */
	/*Row*/_createRow:function(rowIndex,rowid,height,repeatednum,/*boolean*/sort,visibility, rowsArray){
		var id = rowid;
		//if id don't exist,then create it by IDManager
		var IDManager = this._idManager;
		if(id == undefined || id == null){
			id = IDManager.getRowIdByIndex(this._id,rowIndex - 1,true);
		}

		var row = null;
		if(rowsArray)
			row = rowsArray[rowIndex - 1];
		
		var _rows = this._rows;
		if (row) {
			if (row._id == id) {
				if(undefined != height){
					row._height = height;
				}
				if(undefined != visibility){
					row.setVisibility(visibility);
				}
				
				// find a row model on the position, reuse this model
				var oldRepeat = row._repeatedNum || 0;
				if (oldRepeat > repeatednum) {
					// cut client row repeat range SMALLER. this is safe, we just need to cut
					// step 1, cut the client model
					row._repeatedNum = repeatednum;
					// step 2, tidy the rowsArray
					var _end = rowIndex + oldRepeat - 1;
					for (var i = /* 1 position pass new repeat end position */ rowIndex + repeatednum; i <= _end; i++) {
						rowsArray[i] = null;
					}					
				} else if (oldRepeat < repeatednum) {
					// make client row repeat range LARGER, this could be unsafe, we need to clear 
					// row model in the enlarged repeat range
					// step 1, tidy the rows array and clean redundant rows
					var _end = rowIndex + repeatednum - 1;
					var _p = null;	// position to rows array
					var bNoModelLeft = false;
					for (var i = /* 1 position pass old repeat */ rowIndex + oldRepeat; i <= _end; i++) {
						if (rowsArray[i]) {
							rowsArray[i] = null;
							if (!bNoModelLeft) {
								// clean model
								var modelRow;
								if (_p != null) {
									modelRow = _rows[_p];
									if (modelRow.getIndex() == i + 1) {
										_rows.splice(_p, 1);
									} else {
										_p++;
									}
								} else {
									// if we first met a row, it must be a master row
									// find the precise row
									_p = this.getRowPosition(i + 1, false);
									// _p must > 0, TODO should we assert it...
									_rows.splice(_p, 1);
								}
								
								modelRow = _rows[_p];
								if (!modelRow || modelRow.getIndex() > _end + 1) {
									bNoModelLeft = true;
								}
							}
						}
					}
					// step 2, enlarge the client row model
					row._repeatedNum = repeatednum;
				}
				return row;
			} else {
				// position has row model but can't reuse, cut the row model short and create a new one in following steps
				var oldRepeat = row._repeatedNum;
				var masterRowIndex = row.getIndex();
				var newRepeat = rowIndex - masterRowIndex - 1;
				row._repeatedNum = newRepeat;
				// tidy rowsArray
				var _end = masterRowIndex + oldRepeat - 1;
				for (var i = rowIndex; i <= _end; i++) {  
					rowsArray[i] = null;
				}
			}
		}
		
		var row = new websheet.model.Row(this,id,height,repeatednum,visibility);
		if(!sort){
			var fetchMethod = "";//dojo.hitch(IDManager, "getRowIndexById");
			var pos = this.ModelHelper.binarySearch(_rows,rowIndex,this.ModelHelper.equalCondition,fetchMethod,false,this._id, this.Constant.Row);
			if(pos <= -1){
				pos = -(pos + 1); 
			}
			// check row model if any rows on the way
			var deleteCnt = 0;
			if (repeatednum > 0) {
				var endRowIndex = rowIndex + repeatednum - 1;
				var _p = pos;
				var rowModel = _rows[_p];
				while (rowModel && rowModel.getIndex() <= endRowIndex) {
					deleteCnt++;
					rowModel = _rows[++_p];
				}
			}

			//insert row instance to corresponding position
			_rows.splice(pos, deleteCnt, row);

			var pRow = _rows[pos - 1];
			if (pRow) pRow._gap = rowIndex - pRow.getIndex() - 1;
			var nRow = _rows[pos + 1];
			if (nRow)
				row._gap = nRow.getIndex() - rowIndex - 1;
			else { // Last rows are empty rows with same style
				if (pRow) {
					var rn = pRow._repeatedNum;
					if (rn && rn > (pRow._gap + 1)) {
						row._gap = rn - pRow._gap - 1;
					}
				}
			}
		}else{
			var pRow = _rows[_rows.length - 1];
			if (pRow) pRow._gap = rowIndex - pRow.getIndex() - 1;
			_rows.push(row);
		}
		return row;
	},
	/**
	 * create new column object
	 * if column at this position exist, then return it directly
	 * @param colIndex 		column position
	 * @param colid			column id
	 * @param width			column width
	 * @param styleid		column style id
	 * @param repeatednum	column repeated number
	 * @param sort			if sort is false,then will find the position to insert into columns array
	 * @param bNotCreateNull	if set to true, not insert null column and return null
	 * @param colsArray		if given, then check if the column at colIndex is exist or not, if yes, return it directly
	 */
	/*Column*/_createColumn:function(/*integer*/colIndex,colid,width,styleid,repeatednum,sort, bNotCreateNull,colsArray,visibility){
		var id = colid;
		//if id don't exist,then create it by IDManager
		var IDManager = this._idManager;
		if(id == undefined || id == null){
			id = IDManager.getColIdByIndex(this._id,colIndex - 1,true);
		}
		var column = null;
		if(colsArray)
			column = colsArray[colIndex - 1];
		if(column && column._id == id) return column;
		
		column = new websheet.model.Column(this,id,width,styleid,repeatednum,visibility);
		if (bNotCreateNull && column.isNull()) {
			return null;
		}
		
		if(!sort){
			var fetchMethod = "";//dojo.hitch(IDManager, "getColIndexById");
			var pos = this.ModelHelper.binarySearch(this._columns,colIndex,this.ModelHelper.equalCondition,fetchMethod,false,this._id, this.Constant.Column);
			if(pos <= -1){
				pos = -(pos + 1); 
			}
			this._columns.splice(pos, 0, column);
		}else{
			this._columns.push(column);
		}
		return column;
	},
	/**
	 * get IDManager
	 */
	/*IDManager*/_getIDManager:function(){
		return this._idManager;
	},
	/**
	 * return document
	 */
	/*Document*/_getParent:function(){
		return this._parent;
	},
	/**
	 * if the sheet has not been completely loaded, and do sort on this sheet
	 * set dirty to true, because the cell refer to this sheet need getPartial when calculate
	 * @param bDirty
	 */
	setDirty:function(bDirty){
		this._bDirty = bDirty;
	},
	
	isDirty:function(){
		return this._bDirty;
	},

	isMirrored:function(){
		return (this._direction == 'rtl');
	},
	
	isProtected: function()
	{
		return this._bProtected;
	},
	
	//////////////////////////////////////////////////////////
	//////// PUBLIC FUNCTION /////////////////////////////////
    //////////////////////////////////////////////////////////

	/**************sheet************************************/
	/**
	 * load sheet data on initialization
	 */
	/*void*/load:function(sheetData,docData, sId){
		// from Document._load(), which we know is not in any managed tasks
		// this function would pend partialLoadRow() if any as managed tasks, since this call is in root,
		// every sheet's partialLoadRow() would be siblings in task tree
		if(sheetData == undefined || sheetData == null)return null;
		var sheet = docData.content.sheets[sId];//rather than this._id, sId is the server side sheet id
		var sheetRef = null;
		if(docData.reference)
			sheetRef = docData.reference[sId];
		var context = {};
		context.env = this;
		//init _colIdMap to map the col id and index, and only used when loading
		this._colIdMap = {};
		context.document = docData;
		context.sheet = sheet;
		context.sheetRef = sheetRef;
		context.idManager = this._idManager;
		context.styleManager = this._parent._getStyleManager();
		var sr = sheetData.startrow;
		if(sr && sr > 1)
			context.startrow = sr;
		else
			context.startrow = 1;
		var sc = sheetData.startcol;
		if(sc && sc > 1)
			context.startcol = sc;
		else
			context.startcol = 1;
		//get all the cols array with order
		var range = {};
		range.sheetName = this._name;
		range.startRow = 1;
		range.startCol = 1;
		range.endRow = this._idManager._getRowCount(this._id);
		range.endCol = this._idManager._getColCount(this._id);
		context.colsArray = [];
		if (this._columns.length) 
			context.colsArray = this.ModelHelper.getCols(range,true).data;//followStyle = false
		
		//load column data
		var columnsIdArray = sheetData.columnsIdArray;
		if (columnsIdArray != null)
		{
			var length = columnsIdArray.length;
			for (var i = 0; i < length; i++) {
				var colId = columnsIdArray[i];
				if(colId && dojo.string.trim(colId) != ""){
					//cache colId with its index
					var colIndex = i + context.startcol;
					//TODO: when to destroy it
					context.env._colIdMap[colId] = colIndex - 1;//0 based
					var colData = null;
					if (context.document.meta.columns )
					{
						var sheetColData = context.document.meta.columns[this._id];
						if(sheetColData)
							colData = sheetColData[colId];
						//compatible with the old json format	
						if(!colData && context.document.meta.columns[colId])
							colData = context.document.meta.columns[colId];
					}
					if(colData){
						var c_colId = context.idManager.getMapping(colId);
						var c_styleId = context.styleManager.getMapping(colData.sid);
						var bNotSort = true; 
						if(context.colsArray.length > 0)
							bNotSort = false;
						// since 1.03 version, the abbreviated name is used
						var visibility = colData.visibility != undefined ? colData.visibility : colData.vis;
						context.env._createColumn(colIndex, c_colId, colData.w,c_styleId,colData.rn,bNotSort, /* ignore null */ true, context.colsArray, visibility);
					}
				}	
			}
		}
		
		//load row data
		//get all the cols array with order
		context.rowsArray = this.ModelHelper.getRows(range, /* bArray */ true, /* follow style */ true, /* don't set contraint */ true).data;
		this._partialLoadRow(context, sheetData, 0);
	},
	
	// Load websheet.Constant.PartialRowCnt rows at each timer
	_partialLoadRow:function(context, sheetData, startIndex){
		try{
			var rowsIdArray = sheetData.rowsIdArray;
			if(!rowsIdArray){
				this._parent.setClientPartialStatus(this._id, false, false);
				return;
			}
			this._parent.setClientPartialStatus(this._id, false, true);
			var idArraySize = rowsIdArray.length;
			var partialRowCnt = this.Constant.PartialRowCnt;
			if(!context.sheet)
				context.sheet = {rows:{}};
			
			var endIndex = startIndex;
			var rowCnt = 0;
			for(; rowCnt < partialRowCnt && endIndex < idArraySize; endIndex++){
				var rowId = rowsIdArray[endIndex];
				if(rowId && dojo.string.trim(rowId) != "")
				{
					var rowData = null;
					//check if the row has stylex
					if(context.document.meta.rows)
					{
						var sheetRowMeta = context.document.meta.rows[this._id];
						if(sheetRowMeta)
							rowData = sheetRowMeta[rowId];
					}
					//check if the row has content
					if(!rowData && context.sheet.rows)
					{
						rowData = context.sheet.rows[rowId];
					}
					//if the row has no style or content, row will not be created
					if(rowData)
					{
						var c_rowId = context.idManager.getMapping(rowId);
						var bNotSort = true; 
						if(context.rowsArray && context.rowsArray.length > 0)
							bNotSort = false;
						var row = context.env._createRow(endIndex + context.startrow, c_rowId, rowData.h, rowData.rn,bNotSort,rowData.visibility, context.rowsArray);
						var rowRef = null;
						if(context.sheetRef)
							rowRef = context.sheetRef[rowId];
						row.load(context.sheet.rows[rowId], sheetData.columnsIdArray, rowRef);
						if(!this.initFilterRow)
							this.initFilterRow = row._filtered;
						rowCnt++;
					}
				}
			}
			if(endIndex < idArraySize) {
				this._parent._taskMgr.addTask(this, "_partialLoadRow", [context, sheetData, endIndex], this._parent._taskMgr.Priority.LoadDocument, false , this.Constant.PartialRowTimeoutDelay);
				// setTimeout(dojo.hitch(this, "_partialLoadRow", context, sheetData, endIndex), 0);
			}else{
				this._parent.setClientPartialStatus(this._id, false, false);
			}
		}catch(e){
			console.log("client side partial load error");
			this._parent.setClientPartialStatus(this._id, false, false);
		}	
	},
  
	/**
	 * rename sheet name
	 */
	/*void*/rename:function(newName){
		this._name = newName;
	},
	/**
	 * return sheet name
	 */
	/*string*/getSheetName:function(){
		return this._name;
	},
	/**
	 * get sheet id
	 */
	/*String*/getId:function(){
		return this._id;
	},
	/**
	 * get sheet visibility info
	 */
	/*String*/getSheetVisibility:function(){
		return this._visibility;
	},
	
	/*void*/setSheetVisibility:function(new_vis){
		this._visibility = new_vis;
	},
	
	/*boolean*/isSheetVisible:function(){
		if (this._visibility != "hide" && this._visibility != "veryhide")
			return true;
		else
			return false;
	},
	
	/*string*/getSheetColor: function() {
		return this._tabColor;
	},
	
	/*********************************************row************************************/
	/**
	 * get rows in from to end
	 * @param from  		start with 0
	 * @param end 	 
	 * @return 
	 */
	/*Array*/getRows:function(from,end){
		var rows = this._rows;
		if(from == undefined){
			return rows;
		}
		var some = new Array();
		if(from > rows.length){return some;}
		if(end > rows.length - 1){end = rows.length - 1;}
		for(;from<=end;from++){
			some.push(rows[from]);
		}
		return some;
	},
	
	/**
	 * get first visible row index (start from 0) in the grid
	 */
	/*int*/getFirstVisibleRowIndex: function() {
		var invisibleRowEnd = null;
		
		for(var i = 0; i < this._rows.length; i++)
		{
			var r = this._rows[i];
			if(!r.isVisibility())
			{
				var index = this.getRowIndex(r._id);
				if(i == 0 && index > 0)
				{
					return 0;
				}
				
				var end = index + r._repeatedNum;
				if(invisibleRowEnd !== null)
				{
					if(index > invisibleRowEnd + 1)
					{
						// gap betwteen the 2 invisible ranges.
						return invisibleRowEnd + 1;
					}
				}
				
				invisibleRowEnd = end;
			}
			else
			{
				if(invisibleRowEnd !== null)
					return invisibleRowEnd + 1;
				else
				{
					// must be the first row and it is visible;
					return 0;
				}
			}
		}
		
		if(invisibleRowEnd !== null)
			return invisibleRowEnd + 1;
		else
			return 0;
	},
	/**
	 * get row instance by index,if followStyle is true,will return row object whose style followed 
	 * by given row. 
	 * @param rowIndex  row instance index
	 * @param followStyle boolean value whether or not return row instance whose style followed by specific row 
	 * @return 
	 */
	/*Row*/getRow:function(rowIndex,followStyle){
		//if row id exist,then return row search by row id
		//otherwise if followStyle is true,search row whose style current row followed		
		var fetchMethod = "";//dojo.hitch(this._idManager,"getRowIndexById");
		var index = this.ModelHelper.binarySearch(this._rows,rowIndex,this.ModelHelper.equalCondition,fetchMethod,followStyle,this._id, this.Constant.Row);

		if(index >= 0){
			return this._rows[index];
		}
		return null;
	},
	
	/**
	 * get the position in the rows array for the given row index
	 * @param rIndex: (integer) row index
	 * @param followStyle boolean value whether or not return row instance whose style followed by specific row
	 * @return index:  if index <0, not find
	 */
	/*integer*/getRowPosition: function(rIndex,followStyle)
	{
		if(followStyle == undefined){followStyle = true;}
		//if row id exist,then return row search by row id
		//otherwise if followStyle is true,search row whose style current row followed		
		var fetchMethod = "";//dojo.hitch(this._idManager,"getRowIndexById");
		var index = this.ModelHelper.binarySearch(this._rows,rIndex,this.ModelHelper.equalCondition,fetchMethod,followStyle,this._id, this.Constant.Row);
		return index;
	},
	
	/**
	 * return specific row height
	 */
	/*integer*/getRowHeight: function(rowIndex) {
		var row = this.getRow(rowIndex);
        if( row != null ){
            return row.getHeight();
        }
		return 0;
	},
	/**
	 * Have bad performance issue. To be deprecated later!!!!
	 * copy row's style from one to another
	 * only style information and repeated number(not include cell's value) will be copied
	 * @param row           		the row instance must exist
	 * @param toIndex             	row Index,if the row instance exist,do nothing,otherwise create it
	 * @return Row
	 */
	/*Row*/copyRowStyle: function(row, toIndex) {
		if(!row){return;}
		var tRow = this.getRow(toIndex);
		if(!tRow){
			tRow = this._createRow(toIndex);
		}else{
			//if tRow exist,do nothing
			return tRow;
		}
		dojo.forEach(row._styleCells,function(cell,index){
			    var cellStyleId = cell._styleId;
				if(cellStyleId == null){
					return;
				}
				var colid = cell._id; // getColumnId
				var colIndex = this._doc._idManager.getColIndexById(this._parent._id,colid) + 1;
				var tCell = this.getCell(colIndex, this._doc.CellType.STYLE);
				if(!tCell){
					tCell = this._createCell(colIndex, this._doc.CellType.STYLE);
				}
				// set repeatednum first to not remove necessary defaultcellstyle
				tCell.setRepeatedNum(cell._repeatednum);
				tCell.setStyleId(cellStyleId);
		},tRow);
		tRow.setHeight(row.getHeight());
		tRow.setVisibility(row.getVisibility());
		return tRow;
	},
	
	_clearRowsIndex: function(rowIndex)
	{
		var partialManager = websheet.model.ModelHelper.getPartialManager();
		if(!partialManager.isComplete(this._id)){//clear index cache for rows after the inserted row if sheet is not loaded completed.
			var sPos = this.getRowPosition(rowIndex);
			if(sPos < 0)
				sPos = -(sPos + 1);
			var len = this._rows.length;
			while(sPos < len){
				var row = this._rows[sPos++];
				delete row._index;
			}
		}
	},
	
	/**
	 * insert rows at the row specified by 'startRowIndex' with rowDat
	 * @param startRowIndex  start row index
	 * @param endRowIndex	 end row index
	 * @param followStyle	 if it is true,follow previous row's style,otherwise not follow
	 * @param rowData	 	 row data containing information like row height, style and cell value etc
     *                       insert empty rows that following first row's style if rowData is null
     *                       if rowData exist,then followStyle doesn't work
	 * @return 
	 */
	/*void*/insertRows:function(startRowIndex,endRowIndex,followStyle,data,mode){
		this._clearRowsIndex(startRowIndex);
		var rowData;
		if(data) rowData = data.rows;
		var rows = null;
		var IDManager = this._idManager;
		var sheetId = this._id;

		if(endRowIndex < startRowIndex){endRowIndex = startRowIndex;}
		var delta = endRowIndex - startRowIndex;
		var maxSheetRows = this._parent.maxSheetRows;
		var freezeRow = this._freezeInfo.row;
		if(startRowIndex <= freezeRow){
			this._freezeInfo.row = Math.min(freezeRow + delta + 1, maxSheetRows);
		}
		//1.if rowData doesn't exist and followStyle is true,only dealing with style information.
		if(followStyle && !rowData){
			IDManager.insertRowAtIndex(this._id,startRowIndex - 1,delta + 1);
			if(data && data.meta && mode == this.Constant.MSGMode.REDO)
			{
				for(var rowId in data.meta)
				{
					var rowIndex = parseInt(data.meta[rowId]);
					IDManager.setRowIdByIndex(sheetId,rowIndex-1,rowId);
				}
			}

		    // iterate columns to enlarge coverInfo
		    var colSize = this._columns.length;
		    var mCoverInfos = [];
		    for(var i = 0 ; i < colSize; i++)
		    {
		      var col = this._columns[i];
		      var cInfo = col.getCoverInfo(startRowIndex, true);
		      if(cInfo != null) {
		        if(!cInfo.isChecked) {
		        	cInfo.isChecked = true;
		        	mCoverInfos.push(cInfo);
		        	cInfo.setRowSpan(cInfo.getRowSpan() + delta + 1);
		        }
		      }
		    }
		    for(var i = 0; i < mCoverInfos.length; i++) {
		    	var cInfo = mCoverInfos[i];
		    	delete cInfo.isChecked;
		    }
		    
			var row;
			if(startRowIndex == 1){
				// copy next row (startRowIndex is the row just inserted)
				row = this.getRow(endRowIndex + 1, true);
			} else {
				// copy previous row (startRowIndex is the row just inserted)
				row = this.getRow(startRowIndex - 1, true);
			}
			if(row){
				//if row contains value, or this row is hidden, then copy its style to next
				//otherwise add its repeated number with delta
				if(row.isContainValueCell() || /* copy next row */ startRowIndex == 1)
				{
					var nRow;
					if(row.isContainStyle())
					{
						nRow = this.copyRowStyle(row,startRowIndex);
						nRow.setRepeatedNum(delta);	
						nRow.setVisibility(null);				
						this.ModelHelper.mergeRow(this,endRowIndex + 1,this.Constant.Position.PREVIOUS);
					} else {
						if (startRowIndex != 1)
							row._gap += delta + 1;
					}
					
//					if(startRowIndex != 1){
//						// check if rowSpan should be enlarged 
//						var coverInfos = row._coverInfos;
//						var length = 0;
//						if(coverInfos && ((length = coverInfos.length) > 0) ) {
//							for(var i = 0; i < length; i++) {
//								var cover = coverInfos[i];
//								var sIndex = cover.getRow();
//								var eIndex = sIndex + cover.getRowSpan() - 1;
//								if(eIndex >= startRowIndex){
//									cover.setRowSpan(cover.getRowSpan() + delta + 1);
//									if(!nRow){
//										nRow = this._createRow(startRowIndex);
//										nRow.setRepeatedNum(delta);	
//									}
//									nRow._coverInfos.push(cover);
//								}
//							}
//						}
//					}
				}
				else 
				{
					var rn = row._repeatedNum;
					row.setRepeatedNum(rn + delta + 1);
					row._gap += delta + 1;
					
					if(!row.isVisibility())	
					{
						this.ModelHelper.splitRow(this,startRowIndex,this.Constant.Position.PREVIOUS);
						var cNodeStartRowIndex = row.getIndex();
						var cNodeEndRowIndex = cNodeStartRowIndex + rn;
						if(startRowIndex<=cNodeEndRowIndex)
							this.ModelHelper.splitRow(this,endRowIndex,this.Constant.Position.NEXT);
						
						var newRow = this.getRow(startRowIndex);
						newRow.setVisibility(null);
					}
				}
			} else {
				var index = this.getRowPosition(startRowIndex - 1);
				if (index < 0) {
					index = -(index + 1);
					if (index != 0)
						this._rows[index - 1]._gap += delta + 1;
				}
			}
			if(startRowIndex > 1)//Add data validation for new inserted row/column
				this._parent.insertRulesObj4EmptyRowCol(this._name, startRowIndex, endRowIndex, true);
			
			return;
		}
		//2.split row by next
		this.ModelHelper.splitRow(this,startRowIndex,this.Constant.Position.PREVIOUS);
		//3.IDManager insert rows,but don't generate every row id 
		IDManager.insertRowAtIndex(this._id,startRowIndex - 1,delta + 1);
		if(data && data.meta )
		{
			var oriRowId = this.Constant.IDPrefix.ORIGINAL_ROW;
			for(var rowId in data.meta)
			{
				var rowIndex = parseInt(data.meta[rowId]);
				if(mode == this.Constant.MSGMode.UNDO || rowId.indexOf(oriRowId) == 0)
					IDManager.setRowIdByIndex(sheetId,rowIndex-1,rowId);
			}
		}
		// iterate columns to enlarge coverInfo
	    var colSize = this._columns.length;
	    var mCoverInfos = [];
	    for(var i = 0 ; i < colSize; i++)
	    {
	      var col = this._columns[i];
	      var cInfo = col.getCoverInfo(startRowIndex, true);
	      if(cInfo != null) {
	        if(!cInfo.isChecked) {
	        	cInfo.isChecked = true;
	        	mCoverInfos.push(cInfo);
	        	cInfo.setRowSpan(cInfo.getRowSpan() + delta + 1);
	        }
	      }
	    }
	    for(var i = 0; i < mCoverInfos.length; i++) {
	    	var cInfo = mCoverInfos[i];
	    	delete cInfo.isChecked;
	    }
		//4.if rowData exist,then load it
		if(rowData){
			//get a rows array,a sort array
			//if rowData is null,this function will return null;
			rows = this.ModelHelper.createRowsByJson(this,rowData,false);
		}
		if(!rows){
			return;
		}
		//5.if rows exist,then insert to rows array in sheet
		var fetchMethod = "";//dojo.hitch(IDManager,"getRowIndexById");
		var index = this.ModelHelper.binarySearch(this._rows,startRowIndex,this.ModelHelper.equalCondition,fetchMethod,false,this._id, this.Constant.Row);
		if(index < 0){
			index = -(index + 1);
		}
		
		// aplice rows into this._rows
		Array.prototype.splice.apply(this._rows, [index, 0].concat(rows));
		for (var i = 0; i <= rows.length; i++) {
			var pRow = this._rows[index + i - 1];
			var nRow = this._rows[index + i];
			if (pRow && nRow) pRow._gap = nRow.getIndex() - pRow.getIndex() - 1;
		}
		
		//6.merge first row with previous and last row with next
		this.ModelHelper.mergeRow(this,startRowIndex,this.Constant.Position.PREVIOUS);
		this.ModelHelper.mergeRow(this,endRowIndex,this.Constant.Position.NEXT);
	},
	/**
	 * @deprecated
	 * 
	 * clear all cell value in rows but keep their style intact
	 * @param startRowIndex  start column index
	 * @param endRowIndex	 end column index
	 * @return 
	 */
	/*void*/clearRows:function(startRowIndex,endRowIndex)
	{
		var pRow = this.getRowPosition(startRowIndex, false);
        if (pRow < 0) 
            pRow = -(pRow + 1);
        
        var row = this._rows[pRow];
		while(row && row.getIndex() <= endRowIndex)
		{
		    if(row._visibility!=this.Constant.ROW_VISIBILITY_ATTR.FILTER)
				row.clearRow();
		    
			row = this._rows[++pRow];
		}
	},

	
	clearRange: function(startRowIndex, endRowIndex, startColIndex, endColIndex, bCut, sheetDelta) {
		var pRow = this.getRowPosition(startRowIndex, false);
		if (pRow < 0) {
			pRow = -(pRow + 1);
		}
		
		if(bCut){
			this.ModelHelper.splitRow(this, startRowIndex, this.Constant.Position.BOTH);
			this.ModelHelper.splitRow(this, endRowIndex, this.Constant.Position.BOTH);
		}
		
		var row = this._rows[pRow];
		while (row && row.getIndex() <= endRowIndex) 
		{
			if(bCut)
				row.deleteCells(startColIndex, endColIndex, bCut, sheetDelta);
		    else if(row._visibility!= this.Constant.ROW_VISIBILITY_ATTR.FILTER)
		    	row.clearCells(startColIndex, endColIndex);
			row = this._rows[++pRow];
		}
		if(bCut && this._bProtected && !websheet.style.DefaultStyleCode[websheet.Constant.Style.PROTECTION_UNLOCKED]){
			var sStartCol = websheet.Helper.getColChar(startColIndex);
			var rangeJson = {};
			var cellsJson = {};
			cellsJson[sStartCol] = {style: {unlocked : true}};
			if (endColIndex > startColIndex) 
				cellsJson[sStartCol].rn = endColIndex - startColIndex;
			
			rangeJson[startRowIndex] = {cells: cellsJson};
			if (endRowIndex > startRowIndex) 
				rangeJson[startRowIndex].rn = endRowIndex - startRowIndex;
				
			this.setRange(startRowIndex, endRowIndex, startColIndex, endColIndex, rangeJson, {forReplace: false});
		}
	},
	/**
	 * delete rows between start row index and end row index
	 * @param startRowIndex  start row index
	 * @param endRowIndex	 end row index
	 * @return 
	 */
	/*void*/deleteRows:function(startRowIndex,endRowIndex, bCut, sheetDelta){
		this._clearRowsIndex(startRowIndex);
		var IDManager = this._idManager;
		var cm = this.ModelHelper.getCalcManager();
		var eRow = null;
		var delArray = new Array();
		if(!endRowIndex){endRowIndex = startRowIndex;}
		var count = endRowIndex - startRowIndex + 1;
		var freezeRow = this._freezeInfo.row;
		if(!bCut && startRowIndex <= freezeRow){
			this._freezeInfo.row = Math.max(1, freezeRow - (Math.min(endRowIndex, freezeRow) - startRowIndex + 1));
		}
		var osRowIndex = startRowIndex;
		var oIndex = -1;
		var styleManager = this._parent._getStyleManager();
		//1.split row
		this.ModelHelper.splitRow(this,startRowIndex,this.Constant.Position.PREVIOUS);
		this.ModelHelper.splitRow(this,endRowIndex + 1,this.Constant.Position.PREVIOUS);
		
		//delete coverInfo between the delete rows
		var infos = [];
		var colSize = this._columns.length;
	    for(var i = 0 ; i < colSize; i++)
	    {
	    	var col = this._columns[i];
	    	var coverInfos = col._coverInfos;
		    var pos = col.getCoverCellPosition(endRowIndex, true);
		    if(pos < 0)
		    	pos = -(pos + 1) - 1;
		    for (var j = pos; j >= 0; j--)
		    {
		    	var cInfo = coverInfos[j];
		    	var rowSpan = cInfo.getRowSpan();
			    var colSpan = cInfo.getColSpan();
		    	if(rowSpan <= 1 && colSpan <= 1){
		    		coverInfos.splice(j, 1);
		    		continue;
		    	}
		    	if(!cInfo.isChecked) {
		    		infos.push(cInfo);
		    		cInfo.isChecked = true;
			    	var sr = cInfo.getRow();
			    	var er = sr + rowSpan - 1;
			    	if (er < startRowIndex)
			    		break;
			    	if (sr >= startRowIndex && sr <= endRowIndex){
			    		cInfo.setRowSpan(1);
			    		cInfo.setColSpan(1);
			    		coverInfos.splice(j, 1);
			    	}
			    	else
			    	{
			    		var d = Math.min(er, endRowIndex) - startRowIndex + 1;
			    		var newRowSpan = rowSpan - d;
			    		cInfo.setRowSpan(newRowSpan);
			    		if(newRowSpan <= 1 && colSpan <= 1){
			    			coverInfos.splice(j, 1);
			    		}
			    	}
		    	}
		    }
	    }
	    for(var i = 0; i < infos.length; i++ ) {
	    	var cInfo = infos[i];
	    	delete cInfo.isChecked;
	    }
	    
		//2.delete rows in sheet
		var fetchMethod = "";//dojo.hitch(IDManager,"getRowIndexById");
		while(startRowIndex <= endRowIndex){
			var index = this.ModelHelper.binarySearch(this._rows,startRowIndex,this.ModelHelper.equalCondition,fetchMethod,false,this._id, this.Constant.Row);
			if (startRowIndex == osRowIndex) oIndex = index;
			if(index >= 0){
				var row = this._rows[index];
				//reduce style reference count
				dojo.forEach(row._styleCells,function(cell){
						var styleId = cell.getStyleId();
						if(styleId){
							styleManager.deleteStyle(styleId);
						}
				},this);
				var cells = row._valueCells;
				for (var i = 0; i < cells.length; ++i) {
					var vCell = cells[i];
					if (!vCell) continue;
					if(bCut)
						vCell.updateCellForCut(sheetDelta);
					// need clear all refs and tokenArray when delete happened from refs list.
					vCell.clearRefs();
					//TODO: should set cell to null directly, pls test defect 13511 comments 2
					//remove the formula cell from partial calc manager
					cm._removeFormulaCell(vCell);					
				}
				delArray.push(index);
			}
			startRowIndex++;
		}
		if(delArray.length > 0){
			this._rows.splice(delArray[0], delArray.length);
		}

		if (!bCut) {
			//3.delete rows in IDManager
			IDManager.deleteRowAtIndex(this._id,osRowIndex - 1, count );
		}

		if (oIndex < 0) oIndex = -(oIndex + 1);
		var pRow = this._rows[oIndex - 1];
		var nRow = this._rows[oIndex];
		if (pRow && nRow) pRow._gap = nRow.getIndex() - pRow.getIndex() - 1;
		
		if (bCut) {
			if(this._bProtected){
				 var isCutSheet = osRowIndex == 1 && endRowIndex ==  this._parent.maxSheetRows;
				 if(!isCutSheet && !websheet.style.DefaultStyleCode[websheet.Constant.Style.PROTECTION_UNLOCKED]){
					 var rowJson = {};
					 rowJson[osRowIndex] = {
						 cells: {
							 "A": {
								 "style": {unlocked : true},
								 "rn": websheet.Constant.MaxColumnIndex - 1
							 }
						 }
					 };
					if(osRowIndex != endRowIndex)
						rowJson[osRowIndex].rn = endRowIndex - osRowIndex;
					this.setRange(osRowIndex, endRowIndex, 1, websheet.Constant.MaxColumnIndex, rowJson, {forRow: true,forReplace: false});
				 }
			}
			return;
		}
		
		//4.merge current rows in delete position
		this.ModelHelper.mergeRow(this,startRowIndex,this.Constant.Position.PREVIOUS);
	},
	
	setCell: function(rowIndex, colIndex, cellJson, userId, bReplace, mode, bInheritFormat) {
		this.ModelHelper.splitRow(this, rowIndex, this.Constant.Position.BOTH);
		var row = this.getRow(rowIndex);
		if (!row) {
			row = this._createRow(rowIndex);
		}
		row.setCell(colIndex, cellJson, userId, bReplace, mode, bInheritFormat);
		this.ModelHelper.mergeRow(this, rowIndex, this.Constant.Position.BOTH);
	},
	
	/**
	 * Set view settings for the sheet, (for now, the freeze window information).
	 * @parm {freezeRow: Integer or undefined, freezeCol: Integer or udnefined}
	 */
	setViewSetting: function(parm){
		//Freeze window settings,
		parm.freezeRow >= 0 && (this._freezeInfo.row = parm.freezeRow);
		parm.freezeCol >= 0 && (this._freezeInfo.col = parm.freezeCol);
	},
	/**
	 * Get window frozen position
	 * @param type, ROW, COLUMN, SHEET
	 */
	getFreezePos: function(type){
		switch(type){
		case this.Constant.FreezeType.ROW:
			return this._freezeInfo.row;
		case this.Constant.FreezeType.COLUMN:
			return this._freezeInfo.col;
		default:
			return dojo.clone(this._freezeInfo);	
		}
	},

	/**
	 * move multiple continuous rows to specific position,only rows index change 
	 * @param startRowIndex  	start row index(operation region)
	 * @param endRowIndex	 	end row index(operation region)
	 * @param toStartRowIndex  	start row index(target region)
	 * @param toEndRowIndex	 	end row index(target region)
	 * @return 
	 */
	/*void*/moveRows:function(startRowIndex,endRowIndex,toStartRowIndex,toEndRowIndex){	    
	},

	/**************column************************************/
	/**
	 * get columns in from to end
	 * @param from  		start with 1
	 * @param end 	 
	 * @return 
	 */
	/*Array*/getColumns:function(from, end){
		var columns = this._columns;
		if(from == undefined){
			return columns;
		}
		var start = this.getColumnPosition(from, true);
		if (start < 0) {
			start = -(start + 1);
		}
		var some = new Array();
		for (var i = start; i < columns.length; i++) {
			var col = columns[i];
			if (col.getIndex() <= end) {
				some.push(col);
			} else {
				break;
			}
		}
		
		return some;
	},
	/**
	 * get column object by index
	 * if followStyle is true, return column object which style is followed by the given column
	 * @param colIndex       column index
	 * @param followStyle    boolean whether or not return column object which style is followed by the given column
	 * @return 
	 */
	/*Column*/getColumn:function(colIndex,followStyle){
		//if column id exist,then return column search by column id
		//otherwise if followStyle is true,search column whose style current column followed
		var fetchMethod = "";//dojo.hitch(this._idManager,"getColIndexById");
		var index = this.ModelHelper.binarySearch(this._columns,colIndex,this.ModelHelper.equalCondition,fetchMethod,followStyle,this._id, this.Constant.Column);
		if(index >= 0){
			return this._columns[index];
		}
		return null;
	},
	/**
	 * get column object by index
	 * if followStyle is true, return column object which style is followed by the given column
	 * @param colIndex       column index
	 * @param followStyle    boolean whether or not return column object which style is followed by the given column
	 * @return 
	 */
	/*integer*/getColumnPosition:function(colIndex,followStyle){
		//if column id exist,then return column search by column id
		//otherwise if followStyle is true,search column whose style current column followed
		var fetchMethod = "";//dojo.hitch(this._idManager,"getColIndexById");
		var index = this.ModelHelper.binarySearch(this._columns,colIndex,this.ModelHelper.equalCondition,fetchMethod,followStyle,this._id, this.Constant.Column);
		return index;
	},
	/**
	 * copy column style from one to another,only style information(not include repeated number)
	 * @param column           column
	 * @param toIndex	       column Index,if the row instance exist,do nothing,otherwise create it
	 * @return 
	 */
	/*void*/copyColumnStyle: function(column, toIndex) {
		if(!column || column.isNull()){return null;}
		var tColumn = this.getColumn(toIndex);
		if(!tColumn){
			tColumn = this._createColumn(toIndex);
		}else{
			//if tRow exist,do nothing
			return tColumn;
		}
		tColumn.setStyleId(column.getStyleId());
		tColumn.setWidth(column.getWidth());
		tColumn.setVisibility(column.getVisibility());
		tColumn._coverInfos = [].concat(column._coverInfos);
		return tColumn;
	},
	
	getGlobalStyleColumn: function()
	{
		var length = this._columns.length;
		for(var i = length - 1; i >= 0; i--){
			var column = this._columns[i];
			if(column.getRepeatedNum() > websheet.Constant.ThresGlobalColStyle 
					&& (column.getStyleId() || column.getWidth() !== undefined)){
				return column;
			}
		}
		return null;
	},
	
	/**
	 * create new column that will follow previous column's style and its cells' style
	 */
	/*void*/ _insertEmptyColumns: function(startColIndex,endColIndex, data,mode)
	{
		var IDManager = this._idManager;		
			
		if (!endColIndex)
			endColIndex = startColIndex;
		
		var start = startColIndex;
		var delta = endColIndex - startColIndex;
		
		var pColumn = 0;
		var column = null;
		var oldRn = 0;
		if(startColIndex > 1)
		{
			pColumn = this.getColumnPosition(startColIndex - 1, true);
			column = this._columns[pColumn];
			//column exist style information
			if(column && !column.isNull()) {
				oldRn = column.getRepeatedNum();
				column.setRepeatedNum(oldRn + delta + 1);
			}
		}
		
		//adjust IDManager's position information
		IDManager.insertColAtIndex(this._id,startColIndex - 1, delta + 1);
		
		if(data && data.meta && mode == this.Constant.MSGMode.REDO )
		{
			var sheetId = this._id;
			for(var colId in data.meta)
			{
				var colIndex = parseInt(data.meta[colId]);
				IDManager.setColIdByIndex(sheetId,colIndex-1,colId);
			}
		}
		if(startColIndex == 1) {
			//check if this sheet has the global column, if yes, then use it
			var styleColumn = this.getGlobalStyleColumn();
			if(styleColumn){
				var styleColumnIndex = styleColumn.getIndex();
				if(styleColumnIndex == (endColIndex + 1)){
					styleColumn.setRepeatedNum(styleColumn.getRepeatedNum() + delta + 1);
					styleColumn.setId(IDManager.getColIdByIndex(this._id, 0, true));
				} else {
					var newColumn = this._createColumn(1);
					newColumn.setRepeatedNum(delta);
					newColumn.setStyleId(styleColumn.getStyleId());
					newColumn.setWidth(styleColumn.getWidth());
				}
			}
		} else if (column && (column._visibility != null || !column._visible 
				// only copy the coumn style if insert the column after this style column (with repeat number) and this column has cover cell
				// because col span of covered cell will not be enlarged
				|| (column._coverInfos && column._coverInfos.length > 0 && (column.getIndex() + oldRn + 1 == startColIndex))))
		{
			// split expanded column and clear visible information
			this.ModelHelper.splitColumn(this, startColIndex, this.Constant.Position.PREVIOUS);
			this.ModelHelper.splitColumn(this, endColIndex, this.Constant.Position.NEXT);
			// new column index is pColumn + 1;
			var newColumn = this._columns[pColumn + 1];
			// clear visible information
			newColumn._visibility = null;
			newColumn._visible = true;
			newColumn._coverInfos = [];
		} 
		
		// make sure the column size is not larger than 1024
		var lastCol = this._columns[this._columns.length - 1];
		if(lastCol && !lastCol.isNull()){
			var lastColIndex = lastCol.getIndex();
			var rn = lastCol._repeatedNum;
			if(lastColIndex + rn >  websheet.Constant.MaxColumnIndex){
				rn = websheet.Constant.MaxColumnIndex - lastColIndex;
				lastCol.setRepeatedNum(rn);
			}
		}
		
		//update row's data
		for(var index = 0; index < this._rows.length; index++)
		{
			var row = this._rows[index];
			if(!row) 
				continue;
			try
			{
				// value cells
				if (row._valueCells.length >= startColIndex) {
					var l = [];
					for (var i = startColIndex - 1; i < endColIndex; ++i) l.push(null);
					Array.prototype.splice.apply(row._valueCells, [startColIndex - 1, 0].concat(l));
				}
				
				if(startColIndex == 1)
				{
					if(row.hasRowStyle())
					{
						var styleId = row.getRowStyle();
						var cell = row._createCell(1, this.Constant.CellType.STYLE);
						cell.setStyleId(styleId);
						cell._repeatednum = delta;
						this.ModelHelper.mergeCell(row,endColIndex + 1,this.Constant.Position.PREVIOUS);
					}
				}
				else
				{
					var cell = row.getCell(startColIndex - 1, this.Constant.CellType.STYLE, true);
					if(cell && cell.getStyleId())
					{
						var colIndex = cell.getCol();
						var rn = cell._repeatednum + delta + 1;
						cell.setRepeatedNum(rn);
					}
					//coverInfo
					var mCell = row.getCell(startColIndex, this.Constant.CellType.COVERINFO, true);
					if(mCell){
						mCell.setColSpan(mCell._colSpan + delta + 1);
						this.insertCoverInfoInColumn(mCell, startColIndex, endColIndex);
					}
				}
				// make sure the cell style size is not larger than 1024
				var lastStyleCell = row._styleCells[row._styleCells.length - 1];
				if (lastStyleCell) {
					var lastIndex = lastStyleCell.getCol();
					var rn = lastStyleCell._repeatednum;
					if(lastIndex + rn >  websheet.Constant.MaxColumnIndex){
						rn = websheet.Constant.MaxColumnIndex - lastIndex;
						lastStyleCell.setRepeatedNum(rn);
					}
				}
				
				//make sure the merge cell size is not larger than 1024
				var lastMergeCell = row._coverInfos[row._coverInfos.length - 1];
				if(lastMergeCell){
					var lastIndex = lastMergeCell.getCol();
					var rn = lastMergeCell._repeatednum;
					if(lastIndex + rn >  websheet.Constant.MaxColumnIndex){
						rn = websheet.Constant.MaxColumnIndex - lastIndex;
						lastMergeCell.setRepeatedNum(rn);
					}
				}
			}
			catch(e)
			{
				console.log(e);
			}	
		}
		if(startColIndex > 1)//Add data validation for new inserted row/column
			this._parent.insertRulesObj4EmptyRowCol(this._name, startColIndex, endColIndex);
	},
	
	/**
	 * insert columns with event data which has column information,like column width,style,cell value and so on.
	 * this operation will insert new column instances with data
	 * @param startColIndex  start column index
	 * @param endColIndex	 end column index
	 * @param followStyle	 if it is true,follow previous column's style,otherwise not follow
	 * @param colData		 event data (if this parameter not exist,then insert empty columns)
	 * @return 
	 */
	/*void*/ insertColumns:function(/*integer*/startColIndex, /*integer*/endColIndex, followStyle, data,mode) 
	{
		var rowsData;
		if(data) 
			rowsData = data.rows;
		
		if (!endColIndex)
			endColIndex = startColIndex;
		var freezeCol = this._freezeInfo.col;
		
		if(startColIndex <= freezeCol){
			this._freezeInfo.col = Math.min(freezeCol + endColIndex - startColIndex + 1, this.Constant.MaxColumnIndex);
		}	
		//1.if rowsData doesn't exist and followStyle is true,only dealing with style information.
		if(followStyle && !rowsData) 
		{
			this._insertEmptyColumns(startColIndex, endColIndex, data,mode);
			return;
		}
		
		var IDManager = this._idManager;
		var delta = endColIndex - startColIndex;
		
		//2.split column by next
		// first in all rows, split cells in the position
		var rows = this._rows;
		for (var i = 0; i < rows.length; i++)
		{
			var row = rows[i];
			if(row._styleCells.length){
				var pCell = row.getCellPosition(startColIndex, true);
				if (pCell >= 0)
				{
					var cell = row._styleCells[pCell];
					if (cell._repeatednum > 0)
					{
						this.ModelHelper.splitCellByArrayIndex(row, pCell, startColIndex);
					}
				}
				// make sure the cell style size is not larger than 1024
				var lastStyleCell = row._styleCells[row._styleCells.length-1];
				var lastIndex = lastStyleCell.getCol();
				var rn = lastStyleCell._repeatednum;
				if(lastIndex + rn + delta + 1 >  websheet.Constant.MaxColumnIndex){
					rn = websheet.Constant.MaxColumnIndex - ((lastIndex < startColIndex)? lastIndex: (lastIndex+delta+1));
					lastStyleCell.setRepeatedNum(rn);
				}
			}
		}
		
		this.ModelHelper.splitColumn(this,startColIndex,this.Constant.Position.PREVIOUS);
		//3.IDManager insert columns,but don't generate every column id 
		//adjust IDManager's position information
		IDManager.insertColAtIndex(this._id,startColIndex - 1,delta + 1);
		
		// 4. insert column model
		// restore column id
		if (data.meta) {
			var oriColId = this.Constant.IDPrefix.ORIGINAL_COLUMN;
			for (var colId in data.meta) {
				var index = data.meta[colId];
				if(mode == this.Constant.MSGMode.UNDO) {
					IDManager.setColIdByIndex(this._id,index-1,colId);
				} else {
					if(colId.indexOf(oriColId) == 0)		
						IDManager.setColIdByIndex(this._id,index-1,colId);			
				}
			}
		}
		
		// 5 create column model
		if(data.columns)
		{
			var colModel, cols = data.columns, models = [], insertIndex = -1;
			for(var idx = startColIndex; idx <= endColIndex; idx++) 
			{
				var cidx = websheet.Helper.getColChar(idx);
				if(cols[cidx]) 
				{//only need to create column model when have style/width
					//5.if column model exist,then insert into columns array in sheet
					colModel = this.ModelHelper.createColByJson(this, idx, cols[cidx]);
					models.push(colModel);
					if(insertIndex == -1) 
					{
						//find the insert place.
						var fetchMethod = "";//dojo.hitch(IDManager,"getColIndexById");
						insertIndex = this.ModelHelper.binarySearch(this._columns, idx, this.ModelHelper.equalCondition,fetchMethod,false,this._id, this.Constant.Column);
						if(insertIndex < 0)
							insertIndex = -(insertIndex + 1);
					}
				}
			}
			if(insertIndex >= 0)
				Array.prototype.splice.apply(this._columns, [insertIndex, 0].concat(models));
		}
		
		// make sure the column size is not larger than 1024
		var lastCol = this._columns[this._columns.length - 1];
		if(lastCol && !lastCol.isNull()){
			var lastColIndex = lastCol.getIndex();
			var rn = lastCol._repeatedNum;
			if(lastColIndex + rn >  websheet.Constant.MaxColumnIndex){
				rn = websheet.Constant.MaxColumnIndex - lastColIndex;
				lastCol.setRepeatedNum(rn);
			}
		}
		
		// 6 increase value cell array and enlarge cover info
		for (var index = 0; index < this._rows.length; index++)
		{
			var row = this._rows[index];
			if(!row)
				continue;
			
			// value cells
			if (row._valueCells.length >= startColIndex) {
				var l = [];
				for (var i = startColIndex - 1; i < endColIndex; ++i) l.push(null);
				Array.prototype.splice.apply(row._valueCells, [startColIndex - 1, 0].concat(l));
			}
			// cover info
			var coverInfo = row.getCell(startColIndex,this._parent.CellType.COVERINFO,true);
			if(coverInfo){
				coverInfo.setColSpan(coverInfo.getColSpan() + delta + 1);
				this.insertCoverInfoInColumn(coverInfo, startColIndex, endColIndex);
			}
		}
		
		// 7 set rows data
		if (rowsData) {
			this.setRange(1, this.Constant.MaxRowNum, startColIndex, endColIndex, rowsData, {forColumn:true,forInsertColumn: true,mode:mode});
		}
	},
	
	
	/*
	 * Delete value cells and style cells at the columns between startColIndex and endColIndex
	 */
	/*void*/_deleteColumns: function(/*integer*/startColIndex,/*integer*/endColIndex, /*boolean*/bCut, sheetDelta) {
		var styleManager = this._parent._getStyleManager();
		var cm = this.ModelHelper.getCalcManager();
		var cell;
		for (var id in this._rows) {
			var row = this._rows[id];
			
			// value cell
			for (var i = startColIndex - 1; i < endColIndex; ++i) {
				cell = row._valueCells[i];
				if (cell) { 
					if(bCut)
						cell.updateCellForCut(sheetDelta);
					// need clear all refs and tokenArray when delete happened from refs list.
					cell.clearRefs();
					//TODO: should set cell to null directly
					//remove the formula cell from partial calc manager
					cm._removeFormulaCell(cell);
					
					row._valueCells[i] = null;
					delete cell;
				}
			}
			if (!bCut) {
				if (row._valueCells.length >= startColIndex)
					row._valueCells.splice(startColIndex - 1, endColIndex - startColIndex + 1);
			}
			
			//style cell
			var styleCells = row._styleCells;
			if (styleCells.length) {
				var s_d_pos = e_d_pos = row.getCellPosition(startColIndex, true, this.Constant.CellType.STYLE);
				var isFind = false;
				if (s_d_pos >= 0)
				{
					s_d_pos = this.ModelHelper.splitCellByArrayIndex(row, s_d_pos, startColIndex);
				}
				else
				{
					s_d_pos = - (s_d_pos + 1);
				}
				if (s_d_pos < row._styleCells.length)
				{
					var scell = null, e_d_pos = s_d_pos;
					for (; (scell = styleCells[e_d_pos]); e_d_pos++)
					{
						var index = scell.getCol(), span = index + scell._repeatednum;
						if (index <= endColIndex && span >= endColIndex)
						{
							if (scell._repeatednum > 0) 
							{
								this.ModelHelper.splitCellByArrayIndex(row, e_d_pos, endColIndex + 1);
							}
							break;
						}
						if (index > endColIndex)
						{
							e_d_pos = e_d_pos - 1;
							break;
						}
							
					}
					if (e_d_pos >= s_d_pos)
						styleCells.splice(s_d_pos, (e_d_pos - s_d_pos + 1));
				}
			}
			
			//cover info
			var coverInfos = row._coverInfos;
			if (coverInfos.length) {
				var pos = row.getCellPosition(endColIndex, true,this._parent.CellType.COVERINFO);
				if(pos < 0)
					pos = -(pos + 1) - 1;
				for(var i = pos; i >= 0; i--) {
					var _cell = coverInfos[i];
					var sc = _cell.getCol();
					var span = _cell._colSpan;
					var ec = sc + span - 1;
					if(ec < startColIndex)
						break;
					if(sc >= startColIndex && sc <= endColIndex){
						coverInfos.splice(i, 1);
						this.deleteCoverInfoInColumn(_cell);
					} else {
						var delta = Math.min(ec, endColIndex) - startColIndex + 1;
						var newSpan = span - delta;
						_cell.setColSpan(newSpan);
						if(newSpan <= 1 && _cell.getRowSpan() <= 1){
							coverInfos.splice(i, 1);
							this.deleteCoverInfoInColumn(_cell);
							_cell._colSpan = 0;
						} 
					}
				}
			}
		}
	},
	
	/**
	 * delete columns between start column index and end column index
	 * @param startColIndex  start column index
	 * @param endColIndex	 end column index
	 * @return 
	 */
	/*void*/deleteColumns:function(/*integer*/startColIndex,/*integer*/endColIndex,/*boolean*/bCut, sheetDelta){
		if(!endColIndex){endColIndex = startColIndex;}
		var freezeCol = this._freezeInfo.col;
		if(!bCut && startColIndex <= freezeCol){
			this._freezeInfo.col = Math.max(1, freezeCol - (Math.min(freezeCol, endColIndex) - startColIndex + 1));
		}
		var dsColIndex = startColIndex;
		var styleManager = this._parent._getStyleManager();
		//1.split columns
		this.ModelHelper.splitColumn(this,startColIndex,this.Constant.Position.PREVIOUS);
		this.ModelHelper.splitColumn(this,endColIndex + 1,this.Constant.Position.PREVIOUS);
		//2.update rows
		this._deleteColumns(startColIndex, endColIndex, bCut, sheetDelta);
		//3.delete columns
		var delArray = [];
		var fetchMethod = "";//dojo.hitch(IDManager,"getColIndexById");
		var sIndex = this.ModelHelper.binarySearch(this._columns,startColIndex,this.ModelHelper.equalCondition,fetchMethod,false,this._id,this.Constant.Column);
		if(sIndex < 0)
			sIndex = -(sIndex + 1);
		var eIndex = this.ModelHelper.binarySearch(this._columns,endColIndex + 1,this.ModelHelper.equalCondition,fetchMethod,false,this._id,this.Constant.Column);
		if(eIndex < 0)
			eIndex = -(eIndex + 1);
		while(sIndex < eIndex){
			var styleCol = this._columns[sIndex];
			var styleId = styleCol.getStyleId();
			//reduce style reference count
			if(styleId){
				styleManager.deleteStyle(styleId);
			}
			delArray.push(sIndex++);
		}
		if(delArray.length > 0){
			this._columns.splice(delArray[0], delArray.length);
		}
		//4.delete columns id in IDManager
		if(!bCut){
			this._idManager.deleteColAtIndex(this._id,startColIndex - 1, endColIndex - startColIndex + 1);
			// fill the global column style if it has
			var styleCol = this.getGlobalStyleColumn();
			if(styleCol){
				var lastCol = this._columns[this._columns.length - 1];
				if(lastCol){
					var lastColIndex = lastCol.getIndex();
					var rn = lastCol._repeatedNum;
					var index = lastColIndex + rn + 1;
					if(index < websheet.Constant.MaxColumnIndex){
						if(styleCol == lastCol){
							rn = websheet.Constant.MaxColumnIndex - lastColIndex;
							lastCol.setRepeatedNum(rn);
						} else {
							rn = websheet.Constant.MaxColumnIndex - index;
							var newColumn = this._createColumn(index);
							newColumn.setRepeatedNum(rn);
							newColumn.setStyleId(styleCol.getStyleId());
							newColumn.setWidth(styleCol.getWidth());
						}
					}
				}
			}
		}else if(this._bProtected && !websheet.style.DefaultStyleCode[websheet.Constant.Style.PROTECTION_UNLOCKED]){
			var colJson = {
				style: {unlocked : true}
			};
			if(endColIndex > startColIndex) 
				colJson.rn = endColIndex - startColIndex ;
			var newCol =  this.ModelHelper.createColByJson(this, startColIndex, colJson);
			var index = this.getColumnPosition(startColIndex, true);
			if(index < 0)
				index = -(index + 1);
			Array.prototype.splice.apply(this._columns, [index, 0].concat([newCol]));
		}
	},
//	/**
//	 * clear all cell value in columns but keep their style intact
//	 * @param startColIndex  start column index
//	 * @param endColIndex	 end column index
//	 * @return 
//	 */
//	/*void*/clearColumns:function(startColIndex,endColIndex){
//		var column = null;
//		while(startColIndex <= endColIndex){
//			column = this.getColumn(startColIndex);
//			if(column){
//				column.clearColumn();
//				//if column is null,then delete it
//				if(column.isNull()){
//					this._columns.splice(startColIndex, 1);
//				}
//			}
//			startColIndex++;
//		}
//	},
	
	/**
	 * set columns with event data which has column information,like column width,style,cell value and so on.
	 * this operation will cover original data in columns between start column index and end column index.
	 * till now, this method assumes sColIndex == eColIndex (only for single column)
	 * @param startColIndex  start column index
	 * @param endColIndex	 end column index
	 * @param colJson		 event json data 
	 * @return 
	 */
	setColumns: function(/* int */ sColIndex, /* int */ eColIndex, colJson)
	{
		if(!colJson) return;
		
		if(colJson.columns)
		{
			// merge columns meta info
			var colsMetaArray = this.ModelHelper.createColsArray(colJson.columns);
			var colMerger = new websheet.model.ColumnMerger();
			colMerger.setStartIndex(sColIndex);
			colMerger.setEndIndex(eColIndex);
			colMerger.setSheet(this);
			colMerger.setEventList(colsMetaArray);
			colMerger.doMerge();
			
			// merge the columns style into the styleCell
			var styleManager = this._parent._styleManager;
			var colsWithFormat = []; // store the column id of column which contain format info
			var cellsStyleJson = [];
			var length = colsMetaArray.length;
			for(var i = 0; i < length; i++)
			{
				var col = colsMetaArray[i];
				if(col.style)
				{
					var sJson = col.style;
					if (col.style && col.style.id) {
						sJson = styleManager.styleMap[col.style.id].toJSON();
					}
					if(sJson.format)
					{
						var sc = col.index, ec = col.rn ? sc + col.rn : sc;
						for(var cIndex = sc; cIndex <= ec; cIndex++)
						{
							colsWithFormat.push(cIndex);
						}	
					}	
					var cell = {rn: col.rn, style: sJson};
					cellsStyleJson.push({index: col.index,cell:cell});
				}	
			}
			if(cellsStyleJson.length > 0)
			{
				//TODO: need to remove the empty column models? 
				var colsModelArray = this.ModelHelper.getCols({sheetName: this._name, startCol:sColIndex, endCol:eColIndex}, true,true).data;
				var modelColumns = this._getColumnsWithStyle(sColIndex, eColIndex);
				length = this._rows.length;
				var formatColSize = colsWithFormat.length;
				for(var i = 0; i < length; i++)
				{
					var row = this._rows[i];
					var vCells = row._valueCells;
					for(var j =0; j < formatColSize; j++)
					{
						var colIndex = colsWithFormat[j];
						if(vCells[colIndex -1])
							delete vCells[colIndex - 1]._showValue;
					}	
					if (!row._styleCells.length) continue;
					this._applyColStyle(row, modelColumns, sColIndex, eColIndex);
					var rowsJson = {index:row.getIndex(),rn:row._repeatedNum, cells:cellsStyleJson};
					row.setCells(rowsJson,sColIndex, eColIndex,colsModelArray);
				}	
			}	
		}
		
		if(colJson.rows)
		{
			this.setRange(1, this.Constant.MaxRowNum, sColIndex, eColIndex, colJson.rows, {forReplace:false,forColumn:true});
		}
		
		this.ModelHelper.mergeColumn(this,eColIndex + 1,this.Constant.Position.PREVIOUS);
		this.ModelHelper.mergeColumn(this,sColIndex,this.Constant.Position.PREVIOUS);
	},
	
	/**********************cell************************************/
	/**
	 * get cell object with given cell type by index
	 * if followStyle is true, return cell object which style is followed by the given cell.
	 * if cellType isn't specified, it is to get value cell
	 * @param rowIndex       row index
	 * @param colIndex	 	 column index
	 * @param cellType		 cell type
	 * @param followStyle    boolean whether or not return cell object which style is followed by the given cell
	 * @return 
	 */
	/*Cell*/getCell:function(rowIndex,colIndex,cellType,followStyle){
		var row = this.getRow(rowIndex, followStyle);
		if(row){
			return row.getCell(colIndex,cellType,followStyle);
		}
		return null;
	},	
	/**
	 * set cell's styleId
	 */
	/*void*/setCellStyleId:function(rowIndex,colIndex,styleid){
		this.ModelHelper.splitRow(this,rowIndex,this.Constant.Position.BOTH);
		var row = this.getRow(rowIndex);
		if (!row) {
			row = this._createRow(rowIndex);
		}
		row.setCellStyleId(colIndex,styleid);
		this.ModelHelper.mergeRow(this,rowIndex,this.Constant.Position.BOTH);
	},

	/**
	 * merge cell's style with style attributes
	 */
	/*void*/ mergeCellStyle:function(rowIndex, colIndex, styleAttrs){
		this.ModelHelper.splitRow(this,rowIndex,this.Constant.Position.BOTH);
		var row = this.getRow(rowIndex);
		if(!row) {
			row = this._createRow(rowIndex);
		}
		row.mergeCellStyle(colIndex,styleAttrs);
		this.ModelHelper.mergeRow(this,rowIndex,this.Constant.Position.BOTH);
	},
	/**
	 * get cell style id
	 */
	/*String*/getCellStyleId:function(rowIndex,/*integer*/colIndex){
		var row = this.getRow(rowIndex,true);
		var styleId = null;
		if(row){
			styleId = row.getCellStyleId(colIndex);
		}
		if(!styleId)
		{
			var col = this.getColumn(colIndex,true);
			if(col)
				styleId = col.getStyleId();
		}
		return styleId;
	},
	
	//idx is 1 based.
	/*boolean*/isCellProtected: function(rowIdx, colIdx){
		var row = this.getRow(rowIdx, true);
		if(row)
			return row.isCellProtected(colIdx);
		
		var column = this.getColumn(colIdx, true);
		var styleManager = this._parent._getStyleManager();
		var style;
		if(column)
			style = styleManager.getStyleById(column.getStyleId());
		
		return !styleManager.getAttr(style,websheet.Constant.Style.PROTECTION_UNLOCKED);
	},
	
	isRowProtected: function(rowIndex, endRowIndex){
		endRowIndex = endRowIndex ? endRowIndex : rowIndex;
		endRowIndex ++;
		var bCheckCol = false;
		
		var len = this._rows.length;
		var rIdx = this.getRowPosition(rowIndex, true);
		if(rIdx < 0)
			rIdx = -(rIdx + 1);
		
		var row = null;
		var rowIdx = endRowIndex;
		if(rIdx < len){
			row = this._rows[rIdx];
			rowIdx = row.getIndex();
		}
		
		for(var i = rowIndex; i < endRowIndex; ){
			if(!row || i < rowIdx){
				bCheckCol = true;
				i = rowIdx;
			}else if(row.hasProtectedCell())
				return true;
			else{
				rIdx ++;
				i = rowIdx + row._repeatedNum + 1;
				if(rIdx < len){
					row = this._rows[rIdx];
					rowIdx = row.getIndex();
				}else{
					row = null;
					rowIdx = endRowIndex;
				}
			}
		}
		if(bCheckCol)
			return this._isColumnsProtected();
		else
			return false;
	},
	
	isRangeProtected: function(rowIndex, endRowIndex, colIndex, endColIndex, ignoreFilteredRow)
	{
		endRowIndex = endRowIndex ? endRowIndex : rowIndex;
		endRowIndex ++;
		
		var bCheckCol = false;
		
		var len = this._rows.length;
		var rIdx = this.getRowPosition(rowIndex, true);
		if(rIdx < 0)
			rIdx = -(rIdx + 1);
		
		var row = null;
		var rowIdx = endRowIndex;
		if(rIdx < len){
			row = this._rows[rIdx];
			rowIdx = row.getIndex();
		}
		
		for(var i = rowIndex; i < endRowIndex; ){
			if(!row || i < rowIdx){
				bCheckCol = true;
				i = rowIdx;
			}
			else if(!(ignoreFilteredRow && row._visibility==this.Constant.ROW_VISIBILITY_ATTR.FILTER) && row.hasProtectedCell(colIndex,endColIndex))
				return true;
			else{
				rIdx ++;
				i = rowIdx + row._repeatedNum + 1;
				if(rIdx < len){
					row = this._rows[rIdx];
					rowIdx = row.getIndex();
				}else{
					row = null;
					rowIdx = endRowIndex;
				}
			}	
		}
		if(bCheckCol)
			return this._isColumnsProtected(colIndex, endColIndex);
		else
			return false;
	},
	
	_isColumnsProtected: function(colIndex, endColIndex){
		var styleManager = this._parent._getStyleManager();
		if(!colIndex)
			colIndex = 1;
		if(!endColIndex)
			endColIndex = websheet.Constant.MaxColumnIndex;
		
		var columns = this._columns;
		var cLen = columns.length;
		if(cLen == 0)
			return !styleManager.getAttr(null,websheet.Constant.Style.PROTECTION_UNLOCKED);
		
		var colIdx = this.getColumnPosition(colIndex, true);
		if(colIdx < 0){
			if(!styleManager.getAttr(null,websheet.Constant.Style.PROTECTION_UNLOCKED))
				return true;
			colIdx = -(colIdx + 1);
		}		
		
		if(colIdx >=cLen){
			return !styleManager.getAttr(null,websheet.Constant.Style.PROTECTION_UNLOCKED);
		}
		
		var col = columns[colIdx];
		var index = col.getIndex();
		var i = colIndex;
		while(i <= endColIndex){
			if(i < index && !styleManager.getAttr(null,websheet.Constant.Style.PROTECTION_UNLOCKED))
				return true;
			else{
				var style = styleManager.getStyleById(col.getStyleId());
				if(!styleManager.getAttr(style,websheet.Constant.Style.PROTECTION_UNLOCKED))
					return true;
				i = index + col._repeatedNum + 1;
				colIdx ++;
				if(colIdx < cLen){
					col = columns[colIdx];
					index = col.getIndex();
				}else if(i <= endColIndex && !styleManager.getAttr(null,websheet.Constant.Style.PROTECTION_UNLOCKED))
					return true;
			}
		}
		return false;
	},
	
	isColumnProtected: function(colIndex, endColIndex){
		return this.isRangeProtected(1, this._parent.maxSheetRows, colIndex, endColIndex);
	},
	
	/*boolean*/isCoveredCell:function(rowIndex,colIndex){		
		var col = this.getColumn(colIndex, true);
		if(col) {
			var cover = col.getCoverInfo(rowIndex, true);
			if(cover) {
				var r = cover.getRow();
				if(r == rowIndex) {
					if(colIndex > cover.getCol())
						return true;
				} else
					return true;
			}
		}
		return false;
	},
	
	/*
	 * merge cells from scIndex to ecIndex in column and from srIndex to erIndex in row
	 * srIndex, erIndex, scIndex,ecIndex {integer} base 1
	 */
	mergeCells: function(srIndex, erIndex, scIndex,ecIndex)
	{
		var row;
		this.ModelHelper.splitRow(this, srIndex, this.Constant.Position.BOTH);
		var pos = this.getRowPosition(srIndex, true);
		if(pos < 0){
			pos = -(pos + 1);
			row = this._createRow(srIndex);// not new Row model directly but use createRow to make sure the row gap is right
		}
		else
		{
			row = this._rows[pos];
		}	
		var coverInfo = row.mergeCells(scIndex,ecIndex, erIndex-srIndex+1);
		row.deleteCells(scIndex+1, ecIndex);
		
		var endPos = this.getRowPosition(erIndex, true);
        if (endPos < 0) 
        	endPos = -(endPos + 1) - 1;
        
        for(var i = pos + 1; i <= endPos; i++ ){
        	var row = this._rows[i];
        	if(i == endPos) {
        		this.ModelHelper.splitRow(this,erIndex,this.Constant.Position.NEXT);
        	}
        	row.deleteCells(scIndex, ecIndex);
        }
	},
	
	splitCells: function(srIndex, erIndex, scIndex,ecIndex, bSplitAnyway)
	{
	    var index = this.ModelHelper.binarySearch(this._rows,srIndex,this.ModelHelper.equalCondition,"",false,this._id, this.Constant.Row);
        if(index < 0)
            index = -(index + 1);
        for(var i=index;i<this._rows.length;i++)
        {
            var row = this._rows[i];
            if(row.getIndex()>erIndex)
                break;
            row.splitCells(scIndex,ecIndex);
        }
        if(bSplitAnyway) {
        	// bSplitAnyway will split cells if there are cover info has intersection with the given range
        	var ec = this.getColumnPosition(ecIndex, true);
     		if (ec < 0) {
     			ec = -(ec + 1) - 1;
     		}
     	    
     	    var sc = this.getColumnPosition(scIndex, true);
     	    if (sc < 0) {
     	    	sc = -(sc + 1);
     		}
    	    for(var i = sc; i <= ec; i++)
    	    {
    	    	var col = this._columns[i];
    	    	var coverInfos = col._coverInfos;
    		    var er = col.getCoverCellPosition(erIndex, true);
    		    if(er < 0)
    		    	er = -(er + 1) - 1;
    		    var sr = col.getCoverCellPosition(srIndex, true);
    		    if(sr < 0)
    		    	sr = -(sr + 1);
    		    for (var j = er; j >= sr && j<coverInfos.length ; j--)
    		    {
    		    	var cInfo = coverInfos[j];
    		    	var rowSpan = cInfo.getRowSpan();
    			    var colSpan = cInfo.getColSpan();
    		    	if(rowSpan <= 1 && colSpan <= 1){
    		    		coverInfos.splice(j, 1);
    		    		continue;
    		    	}
    		    	var row = cInfo._parent;
    		    	if (row) 
    		    	{
       			    	var cIndex = cInfo.getCol();
    		    		row.splitCells(cIndex, cIndex);
    		    	}
    		    }
    	    }
        }
        	
	},
	
	 /**
	   * Delete the cover info from the columns
	   * @param ci
	   */
	deleteCoverInfoInColumn: function(coverInfo){
	    var startColIndex = 0;
	    var endColIndex = 0;
	    var coverStartCol = coverInfo.getCol();
	    var coverEndCol = coverStartCol + coverInfo.getColSpan() - 1;
	   endColIndex = this.getColumnPosition(coverEndCol, true);
		if (endColIndex < 0) {
			endColIndex = -(endColIndex + 1) - 1;
			console.log("the coverInfo is not stored in the corresponding columns correctly");
		}
	    
	    startColIndex = this.getColumnPosition(coverStartCol, true);
	    if (startColIndex < 0) {
	    	startColIndex = -(startColIndex + 1);
			console.log("the coverInfo is not stored in the corresponding columns correctly");
		}
	    
	    while (endColIndex >= startColIndex)
	    {
	      if(endColIndex < this._columns.length) 
	      {
	        var col = this._columns[endColIndex];
	        var infos = col._coverInfos;
	        for(var i = 0; i < infos.length; i++) {
	        	if(infos[i] == coverInfo){
	        		infos.splice(i,1);
	        		break;
	        	}
	        }
	      }
	      endColIndex--;
	    }
	 },
	  
	  /**
	   * Insert the cover info in the columns
	   * @param ci  the same CoverInfo instance shared with row
	   * @param startCol    if > 0, only insert columns which index >= startCol
	   * @param endCol      if > 0, only insert columns which index <= endCol
	   */
	 insertCoverInfoInColumn: function(ci, startCol, endCol){
	    var startColIndex = 0;
	    var endColIndex = 0;
	    var coverStartCol = ci.getCol();
	    if(startCol > 0)
	      coverStartCol = Math.max(startCol, coverStartCol);
	    var coverEndCol = coverStartCol + ci.getColSpan() - 1;
	    if(endCol > 0)
	      coverEndCol = Math.min(endCol, coverEndCol);
	    
	    this.ModelHelper.splitColumn(this, coverStartCol, this.Constant.Position.PREVIOUS);
		this.ModelHelper.splitColumn(this, coverEndCol + 1, this.Constant.Position.PREVIOUS);
		
	    endColIndex = this.getColumnPosition(coverEndCol, true);
		if (endColIndex < 0) {
			endColIndex = -(endColIndex + 1) - 1;
		}
	    
	    startColIndex = this.getColumnPosition(coverStartCol, true);
	    if (startColIndex < 0) {
	    	startColIndex = -(startColIndex + 1);
		} 
	    var index = coverEndCol + 1;
	    var colIndex = coverStartCol;
	    var colSize = this._columns.length;
	    while (endColIndex >= startColIndex)
	    {
	      var endIndex = 0;
	      if(endColIndex >= 0 && endColIndex < colSize) {
	        var col = this._columns[endColIndex];
	        col.insertCoverInfo(ci);
	        colIndex = col.getIndex();
	        endIndex = colIndex + col.getRepeatedNum() + 1;
	      } else {
	        endIndex = colIndex = coverStartCol;
	      }
	      var delta = index - endIndex;
	      if(delta > 0) {
			var col = new websheet.model.Column(this,this._idManager.getColIdByIndex(this._id,endIndex - 1,true));
	        col.setRepeatedNum(delta - 1);
	        col.insertCoverInfo(ci);
	        this._columns.splice(endColIndex + 1, 0, col);
	      }
	      index = colIndex;
	      endColIndex--;
	    }
	    var delta = index - coverStartCol;
	    if(delta > 0)
	    {
	      var col = new websheet.model.Column(this,this._idManager.getColIdByIndex(this._id,coverStartCol - 1,true));
	      col.setRepeatedNum(delta - 1);
	      col.insertCoverInfo(ci);
	      this._columns.splice(endColIndex + 1, 0, col);
	    }
	 },

	_applyColStyle: function(row, columns, startColIndex, endColIndex) {
	 	var wspconst = this.Constant.Position;
	 	
		for (var i = 0; i < columns.length; i++) 
		{
		    var colitem = columns[i];
			var col = colitem.col;
			var idx = colitem.idx;
			if (col._styleId) 
			{
				var start = Math.max(idx, startColIndex);
				var end = Math.min(idx + col._repeatedNum, endColIndex);
				var p = 0;
				if(start == end)
				{
					p = row.getCellPosition(start,true);
					if(p >= 0)
					{
						var cells = row._styleCells;
						var tmpCell = cells[p];
						if(tmpCell._repeatednum > 0)
						{
							p = this.ModelHelper.splitCellByArrayIndex(row,p,start);
							if(cells[p]._repeatednum > 0)
								this.ModelHelper.splitCellByArrayIndex(row,p,start+1);
						}
					}
				}
				else
				{
					this.ModelHelper.splitCell(row, start, wspconst.PREVIOUS);
					this.ModelHelper.splitCell(row, end + 1, wspconst.PREVIOUS);
					p = row.getCellPosition(start);
				}
				
				if (p < 0) 
				{
					p = -(p + 1);
				}
				
				var modelCells = row._styleCells;
				var colIndex = start;
				while (colIndex <= end) 
				{
					var cell = modelCells[p];
					if (cell) 
					{
						var modelColIndex = cell.getCol();
						if (colIndex < modelColIndex) 
						{
							// cell has gap in column repeat range, create cell
							cell = row._createCell(colIndex, this.Constant.CellType.STYLE);
							cell.setRepeatedNum(Math.min(modelColIndex - colIndex - 1, end - colIndex /* don't minus 1 */));
							colIndex = modelColIndex;
						} else if (colIndex == modelColIndex) {
							// has cell model in column repeat range
							colIndex += cell._repeatednum + 1;
						} else {
							// colIndex > modelColIndex, never happens
							throw "colIndex > modelColIndex in _applyColStyle, never happens!";
						}
					} 
					else 
					{
						// model cells is end but column repeat range not end, create cells for it
						cell = row._createCell(colIndex, this.Constant.CellType.STYLE);
						cell.setRepeatedNum(end - colIndex);
						colIndex = end + 1;
					}
					if (!cell.getStyleId()) {
						cell.setStyleId(col.getStyleId());
					}
					var lenBeforeMerge = modelCells.length;
					if(start != end)
						this.ModelHelper.mergeCell(row, p, wspconst.PREVIOUS, true);
					if (modelCells.length < lenBeforeMerge) 
					{
						p--;
					}
					p++;
				}
				if(start != end)
				{
					this.ModelHelper.mergeCell(row, start, wspconst.PREVIOUS);
					this.ModelHelper.mergeCell(row, end + 1, wspconst.PREVIOUS);
				}
			}
		}
	},
	
	_getColumnsWithStyle: function(from,end)
	{
	    var columns = this._columns;       
        var start = this.getColumnPosition(from, true);
        if (start < 0)
            start = -(start + 1);
        
        var some = [];
        for (var i = start; i < columns.length; i++) 
        {
            var col = columns[i];
            var idx = col.getIndex();
            if (idx <= end) 
            {
                if(col._styleId)
                    some.push({col:col,idx:idx});
            }
            else 
                break;
        }
        return some;
	},
	
	_defaultSetRangeParam: 
    {
        forReplace: true,
        forColumn: false,
        forInsertColumn: false,
        userId: null,
        forRow: false,
        ignoreFilteredRow:false
    }, 
    
	setRange: function(startRowIndex, endRowIndex, startColIndex, endColIndex, rangeJson, params) 
	{
	    params = dojo.mixin({}, this._defaultSetRangeParam, params);
	    
	    var bReplace = params.forReplace;
        var bColumn = params.forColumn;
        var userId = params.userId;
        var bRow = params.forRow;
        var bRowShowHide = params.forShowHideRow;
        var ignoreFilteredRow = params.ignoreFilteredRow;
        var mode =  params.mode;
        
	 	var wspconst = this.Constant.Position;
	 	var maxSheetRows = this._parent.maxSheetRows;
	 	var maxRowNum = this.Constant.MaxRowNum;
	 	var wcs = websheet.Constant.Style;
	 	
	 	var multipleColumns = bColumn && endColIndex > startColIndex;
	 	var forAll = startColIndex == 1 && endColIndex == this.Constant.MaxColumnIndex && bRow && bColumn;
	 	var bInsertCol = params.forInsertColumn;
	 	//for copy & paste the whole sheet, for performance issue, first clear the current sheet
	 	if(forAll && bReplace && startRowIndex == 1)
	 	{
	 		this._columns = [];
	 		this._rows = [];
	 	}	
		if (bReplace && bColumn && !params.forInsertColumn && !params.asyncNotFirst && !rangeJson.bFollowPart)
		{
			// merge columns meta info
			var colsMetaArray = this.ModelHelper.createColsArray(rangeJson.columns);
			var colMerger = new websheet.model.ColumnMerger({bReplace:true,bColumn:true});
			colMerger.setStartIndex(startColIndex);
			colMerger.setEndIndex(endColIndex);
			colMerger.setSheet(this);
			colMerger.setEventList(colsMetaArray);
			colMerger.doMerge();
		}
		
		var eventRows = this.ModelHelper.createRowsArray(rangeJson.rows ? rangeJson.rows : rangeJson);

	 	// split top of rows
		this.ModelHelper.splitRow(this, startRowIndex, wspconst.PREVIOUS);
	 	// pointer to model array row
	 	var p = this.getRowPosition(startRowIndex, false);
	 	if (p < 0) {
	 		p = -(p + 1);
	 	}
	 	// pointer in event row
	 	var pEventRows = 0;
	 	var modelRows = this._rows;
	 	var modelColumns = this._getColumnsWithStyle(startColIndex, endColIndex);
	 	var needApplyColStyle = !bReplace && (modelColumns.length>0);
	 	var rangeInfo = {};
	 	rangeInfo.sheetName = this._name;
	 	rangeInfo.startCol = startColIndex;
	 	rangeInfo.endCol = endColIndex;
	 	var arrModelColumns = this.ModelHelper.getCols(rangeInfo, true, true).data;
	 	var rowIndex = startRowIndex;
	 	var bEmptyEventRow = false;
	 	// for every row in range
	 	while (rowIndex <= endRowIndex) {
	 		var eventRow = eventRows[pEventRows];
	 		var hasStyle = false;
	 		if (eventRow) {
	 			if(eventRow.cells){
		 			var len = eventRow.cells.length;
		 			for(var i = 0 ; i< len; i ++){
		 				 if(eventRow.cells[i].cell && eventRow.cells[i].cell.style){
		 					hasStyle = true;
		 					break;
		 				}
		 			}
		 		}
	 			bEmptyEventRow = false;
	 			eventRow.rn = (eventRow.rn) ? parseInt(eventRow.rn) : 0;
	 			var eventRowIndex = eventRow.index;
	 			if (bColumn && bReplace) {
	 				if (eventRowIndex + eventRow.rn > maxSheetRows) {
	 					// the event row ends out of maxSheetRows, make the event row to repeat to MAX_ROW
	 					// here we suppose that this event row doesn't have a value.
	 					// if the event row has a value, that means we are going to set a value out of maxSheetRows, that's
	 					// incorrect.
	 					var forceRepeat = maxRowNum - eventRowIndex;
	 					if (eventRow.rn != forceRepeat) {
	 						eventRow.rn = forceRepeat;
	 					}
	 				}
	 			}
	 			if (eventRowIndex > rowIndex) {
	 				// event rows have gap, move rowIndex to the gap
	 				if (bReplace) {
	 					// if is paste, create event row as empty row
	 					eventRow = {index: rowIndex, rn:(eventRowIndex - rowIndex - 1)};
		 				rowIndex = eventRowIndex;
	 				} else {
	 					// if is merge, just bypass the gap
	 					rowIndex = eventRowIndex;
	 					// move p(pointer in model rows) forward if needed
	 					var modelRow = modelRows[p];
	 					while (modelRow && modelRow.getIndex() < eventRowIndex) {
	 						if (modelRow._repeatedNum > 0) {
	 							this.ModelHelper.splitRow(this, eventRowIndex, wspconst.PREVIOUS);
	 						}
	 						modelRow = modelRows[++p];
	 					}
	 					
	 					continue;
	 				}
	 			} else if (eventRowIndex == rowIndex) {
	 				// event row just matches current row
	 				rowIndex +=  eventRow.rn + 1;
	 				// move event row pointer
	 				pEventRows++;
	 			} else {
	 				// eventRowIndex < rowIndex, never happens for sorted event rows
	 				throw "eventRowIndex < rowIndex, setRange() for this condition should never happened!";
	 			}
	 		} else {
	 			// no event rows, range not end
	 			if (bReplace) {
	 				// for paste, create empty rows
	 				eventRow = {index: rowIndex, rn:(endRowIndex - rowIndex)};
	 				rowIndex = endRowIndex + 1;
	 				bEmptyEventRow = true;
	 			} else {
	 				// for merge, done
	 				rowIndex = endRowIndex + 1;
	 				continue;
	 			}
	 		} 

	 		if(forAll)
	 			eventRow.bRow = true;
	 		// how many rows does event row have?
	 		var r = eventRow.rn + 1;
	 		// split the model to have the same "floor" in event and model rows
//	 		mhelper.splitRow(this, eventRow.index + r, wspconst.PREVIOUS);
	 		while (r > 0) {
	 			var modelRow = modelRows[p];
	 			// current event row index, index in current event row repeat range
	 			var eventRowIndex = eventRow.index + eventRow.rn - r + 1;
	 			
	 			if (!modelRow) {
	 				// model row not exists, we already bypass model row length
	 				// put event row to model row array if event row has something to set
	 				if (bEmptyEventRow && bColumn) {
	 					// event row is empty, model row is empty, only meaning to set this empty event row is to blank the
	 					// column style, but if forColumn is true, we don't need to do the blanking. that is, nothing to do
	 					;
	 				} else if (!bEmptyEventRow || needApplyColStyle) {
		 				var newRow = this._createRow(eventRowIndex);
		 				if(needApplyColStyle && hasStyle)
		 				    this._applyColStyle(newRow, modelColumns, startColIndex, endColIndex);
		 				//set row height if the range contains whole row
		 				if( bRow){
		 					if (eventRow[wcs.HEIGHT] != null || bReplace) {
		 						newRow.setHeight(eventRow[wcs.HEIGHT]);
		 					}
		 						
		 					// filter has higher priority than show/hide
		 					// don't allow to change visibility of filtered rows when show/hide
		 					
 							if (eventRow.visibility === null) {
 								// event data explicity set visiblity to null, show row action
 								newRow.setVisibility(null);
 							} else if (eventRow.visibility === undefined) {
 								// visibility doesn't set, do nothing
 								;
 							} else {
 								newRow.setVisibility(eventRow.visibility);
 							}
	 						
		 				}
		 				newRow.setCells(eventRow, startColIndex, endColIndex, arrModelColumns, bReplace, bColumn, userId, mode, bInsertCol);
		 				newRow.setRepeatedNum(r - 1);
		 				if (newRow._gap == 0) newRow._gap = r - 1; // if it is the last row in row array, set its _gap correctly
	 				}
	 				r = 0; // r - (r - 1) - 1
	 			} 
	 			else
	 			{
	 				var modelRowIndex = modelRow.getIndex();
	 				var modelRepeat = modelRow._repeatedNum;
	 				if (bColumn && bReplace) {
	 					if (modelRowIndex + modelRepeat > maxSheetRows) {
		 					// the model row ends out of maxSheetRows, make the model row to repeat to MAX_ROW
		 					var forceRepeat = maxRowNum - modelRowIndex;
		 					if (modelRepeat != forceRepeat) {
		 						modelRepeat = forceRepeat;
		 						modelRow._repeatedNum = forceRepeat;
		 					}
	 					}
	 				}
	 				if(modelRow._repeatedNum > 0)
	 				{
	 					this.ModelHelper.splitRowByArrayIndex(this, p , eventRow.index + eventRow.rn + 1);
	 				}
		 			if (modelRowIndex > eventRowIndex) 
		 			{
		 				// model row after event row, event row in model "gap"
		 				// create a row for eventRow.index ~ modelRow.index
		 				var newRow = this._createRow(eventRowIndex);
		 				if(needApplyColStyle && hasStyle)
		 				    this._applyColStyle(newRow, modelColumns, startColIndex, endColIndex);
		 				//set row height if the range contains whole row
		 				if( bRow){
		 					if (eventRow[wcs.HEIGHT] != null || bReplace) {
		 						newRow.setHeight(eventRow[wcs.HEIGHT]);
		 					}
		 					// filter has higher priority than show/hide
		 					// don't allow to change visibility of filtered rows when show/hide
		 							 					
 							if (eventRow.visibility === null) {
 								// event data explicity set visiblity to null, show row action
 								newRow.setVisibility(null);
 							} else if (eventRow.visibility === undefined) {
 								// visibility doesn't set, do nothing
 								;
 							} else {
 								newRow.setVisibility(eventRow.visibility);
 							}
	 						
		 				}
		 				newRow.setCells(eventRow, startColIndex, endColIndex, arrModelColumns, bReplace, bColumn, userId, mode, bInsertCol);
		 				var rn = Math.min(modelRowIndex - eventRowIndex - 1, r - 1);
		 				newRow.setRepeatedNum(rn);
		 				if (newRow._gap == 0) newRow._gap = rn; // if it is the last row in row array, set its _gap correctly
		 				var lenBeforeMerge = modelRows.length;
		 				this.ModelHelper.mergeRow(this, eventRowIndex, wspconst.PREVIOUS);
		 				if (modelRows.length < lenBeforeMerge) {
		 					// merge happens, one row less, so move p back
		 					p--;
		 				}
		 				r = r - rn - 1;
		 			} 
		 			else if (modelRowIndex == eventRowIndex) 
		 			{
		 			  if(ignoreFilteredRow && modelRow._visibility==this.Constant.ROW_VISIBILITY_ATTR.FILTER)
		 			  {
		 			     r = r - modelRow._repeatedNum - 1;
		 			     p++;
		 			     continue;		 			     
		 			  }
	 			      if(needApplyColStyle && hasStyle)
                           this._applyColStyle(modelRow, modelColumns, startColIndex, endColIndex);
                        //set row height if the range contains whole row
                      if( bRow){
                    	  if (eventRow[wcs.HEIGHT] != null || bReplace) {
                    		  modelRow.setHeight(eventRow[wcs.HEIGHT]); 
                    	  }
                    	  
                    	   if(bReplace)
	 							modelRow.setVisibility(eventRow.visibility);
                    	    // filter has higher priority than show/hide
		 					// don't allow to change visibility of filtered rows when show/hide
                    	   else if(!(bRowShowHide && modelRow._visibility == "filter"))
	 						{
	 							if (eventRow.visibility === null) {
	 								// event data explicity set visiblity to null, show row action
	 								modelRow.setVisibility(null);
	 							} else if (eventRow.visibility === undefined) {
	 								// visibility doesn't set, do nothing
	 								;
	 							} else {
	 								modelRow.setVisibility(eventRow.visibility);
	 							}
	 						}
                        }
                        
                        modelRow.setCells(eventRow, startColIndex, endColIndex, arrModelColumns, bReplace, bColumn, userId, mode, bInsertCol);
                        var lenBeforeMerge = modelRows.length;
                        this.ModelHelper.mergeRow(this, p, wspconst.PREVIOUS, /* provides array index as pointer */ true);
                        if (modelRows.length < lenBeforeMerge) {
                            // merge happens, one row less, so move p back
                            p--;
                        }
		 			    
		 				r = r - modelRow._repeatedNum - 1;
		 			} 
		 			else 
		 			{
		 				// modelRow && modelRow.getIndex() < eventRow.getIndex(), never happens
		 				throw "modelRow && modelRow.getIndex() < eventRow.getIndex(), should never happens";
		 				//console.log("modelRow && modelRow.getIndex() < eventRow.getIndex(), should never happens");
		 			}
	 			}
	 			
	 			p++;
	 		}
	 	}
	 	this.ModelHelper.mergeRow(this, startRowIndex, wspconst.PREVIOUS);
	 	this.ModelHelper.mergeRow(this, endRowIndex + 1, wspconst.PREVIOUS);
	 }
});