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

dojo.provide("websheet.model.IDManager");
dojo.require("websheet.Constant");
dojo.require("websheet.model.ModelHelper");
dojo.require("websheet.functions.IObject");
dojo.declare("websheet.model.IDManager",websheet.functions.IDManager,{
	_IDMap:{},//FORMAT: sheetId:{row:[],col:[]}, in fact, it is row column id map
	_IDCache:{},//FORMAT: sheetId:{row:{rowId:rowIndex}, col:{colId:colIndex}}, it is row column id cache
	_SheetIDArray:[],//keep the sheet id array list
	_SheetsMap:{}, //sheetID:sheetName
	_sheetVisInfo: {}, 	// store sheet visibility meta info 
	_maxRowIndex:0,	//generate rowId with the max row index ++
	_maxColIndex:0,	//generate colId with the max col index ++
	_maxSheetIndex:0,	//generate sheetId with the max sheet index ++
	_partialMgr: null,	//the partial manager instance
	maxRow:0, 		// the maximum number of rows in one sheet
	OPType: websheet.Constant.OPType,
	IDPrefix: websheet.Constant.IDPrefix,
	MAXREF: websheet.Constant.MAXREF,
	
	/*
	 * @param idm     The id manager to be cloned
     *                or construct one new id manager instance
	 */
	constructor: function(idm) {
		//dojo.mixin(this, args);
		if(!idm && window.g_partialLevel != websheet.Constant.PartialLevel.ALL)
		{
			this._partialMgr = websheet.model.ModelHelper.getPartialManager();//do not need it when partial level is ALL
			this._partialMgr._clearMapping();
		}
		
		if(idm)
		{
			this._IDMap = dojo.clone(idm._IDMap);
			this._IDCache = dojo.clone(idm._IDCache);
			this._SheetIDArray = dojo.clone(idm._SheetIDArray);
			this._SheetsMap = dojo.clone(idm._SheetsMap);
			this._sheetVisInfo = dojo.clone(idm._sheetVisInfo);
			this._maxRowIndex = idm._maxRowIndex;
			this._maxColIndex = idm._maxColIndex;
			this._maxSheetIndex = idm._maxSheetIndex;
			this.maxRow = idm.maxRow;
		}
	},
	
	//construct _IDMap and Cache when load document
	//doc is the document content which got from server
	//bJoin is only used when partial loading is enabled
	init:function(doc, criteria, bJoin)
	{
		if(doc == undefined || doc == null)
			return;
		//for partial loading and not in join time, 
		//the id should be mapped between client and server
		var bMapping = false;
		if(this._partialMgr && !bJoin)
		{
			bMapping = true;
			this._partialMgr._clearMapping();
		}
		var meta = doc.meta;
		//the sheetsIdArray in both server and client must be the whole set
		var sheetsIdArray = meta.sheetsIdArray;
		var sheetsArray = meta.sheetsArray;
		var sheets = meta.sheets;
		var cnst = websheet.Constant.SHEET_VISIBILITY_ATTR;
		for(var i = 0; i < sheetsIdArray.length; i++)
		{
			var sheetId = sheetsIdArray[i];
			if(!bMapping)
			{
				this._adjustMaxIndexById(this.OPType.SHEET, sheetId);
				//init one sheet
				this._SheetIDArray[i] = sheetId;
				this._SheetsMap[sheetId] = sheets[sheetId].sheetname;
				this._initSheetMap(sheetId);
				this._sheetVisInfo[sheetId] = (!sheets[sheetId].visibility || sheets[sheetId].visibility == cnst.SHOW)? true : false;
				this._IDCache[sheetId].index = i;
			}
			else
			{
				var cId = this.getSheetIdByIndex(i);
				this._partialMgr._setMapping(sheetId, cId);
			}
			if (!sheetsArray) continue;
			var sheet = sheetsArray[sheetId];
			if(sheet)
			{
				//use the client id
				if(bMapping)
					sheetId = this._partialMgr._getMapping(sheetId);
				var rowsArray = sheet.rowsIdArray;
				var colsArray = sheet.columnsIdArray;
				this._setIdArray(sheetId, sheet, this.OPType.ROW, rowsArray, bMapping);
				this._setIdArray(sheetId, sheet, this.OPType.COLUMN, colsArray, bMapping);
			}
		}
	},
	
	/*boolean*/isValid: function() {
		var sheets = {};
		var valid = true;
		for (var id in this._SheetsMap) {
			// sheet name can be case insensitive in Excel
			var name = this._SheetsMap[id];
			if (!sheets[name]) {
				sheets[name] = true;
			} else {
				valid = false;
				break;
			}
		}
		
		if (!valid) return valid;
		
		var info = this.getSheetVisibleInfo();
		return info.visibleCount != 0;
	},
	
	/*void*/setMaxRow: function(maxRow) {
		this.maxRow = maxRow;
	},
	
	//////////////   websheet.functions.IDManager    ///////////////////////
    // get the sheet name with the given 'sheetId'
    // return null if it isn't found
    getSheetNameById: function(sheetId)
    {
    	if(!sheetId)
    		return null;
    		
    	return this._SheetsMap[sheetId];
    },
	
	//if index does not exist, return -1
	getRowIndexById:function(sheetId, rowId)
	{
		if(!sheetId || !rowId)
			return -1;
		//find in cache first
		var rowIndex = null;
		var sheet = this._IDCache[sheetId];
		if(sheet)
		{
			if(sheet.row)
				rowIndex = sheet.row[rowId];
		}
		//find in map, and update cache
		if(rowIndex == null)
		{
			sheet = this._IDMap[sheetId];
			if(sheet && sheet.row)
			{
				for(var i=0; i<sheet.row.length;i++)
				{
					if(rowId === sheet.row[i])
					{
						rowIndex = i;
						this._updateCache(this.OPType.ROW, sheetId, rowId, rowIndex);
						break;
					}
				}	
			}
		}
		if(rowIndex == null)
			rowIndex = -1;
		return rowIndex;
	},
	
	//return -1 if index does not exist
	getColIndexById:function(sheetId, colId)
	{
		if(!sheetId || !colId)
			return -1;
		//find in cache first
		var colIndex = null;
		var sheet = this._IDCache[sheetId];
		if(sheet)
		{
			if(sheet.col)
				colIndex = sheet.col[colId];
		}
		if(colId == this.MAXREF)
			return websheet.Constant.MaxColumnIndex - 1;//1023, because return 0-based
		//find in map, and update cache
		if(colIndex == null)
		{
			sheet = this._IDMap[sheetId];
			if(sheet && sheet.col)
			{
				for(var i=0; i<sheet.col.length;i++)
				{
					if(colId === sheet.col[i])
					{
						colIndex = i;
						this._updateCache(this.OPType.COLUMN, sheetId, colId, colIndex);
						break;
					}
				}	
			}
		}
		if(colIndex == null)
			colIndex = -1;
		return colIndex;
	},
	/////////////  End of websheet.functions.IDManager /////////////////////
	
	_setIdArray:function(sheetId, sheet, type, idsArray, bMapping)
	{
		if(idsArray)
		{
			var start = 0;
			var idArray = null;
			if(type == this.OPType.ROW)
			{
				start = sheet.startrow;
				idArray = this._IDMap[sheetId].row;
			}else 
			{
				start = sheet.startcol;
				idArray = this._IDMap[sheetId].col;
			}
			if(start && start > 1)
			{
				start--;//change to 0-based
				for(var r=0; r <= start; r++)
				{
					if(!bMapping)
						idArray[r] = "";
					else
					{
						if(!idArray[r])
							idArray[r] = "";
						//else keep the original id
					}
				}
			}else
				start = 0;
			for(var r = 0; r < idsArray.length; r++)
			{
				var id = idsArray[r];
				var index = r + start;
				if(!bMapping)
					idArray[index] = id;
				else
				{
					var cId = idArray[index];
					
					if (cId == null || cId == "") {
						// when loading idArrays, it is very possible that in server side IDs are removed, moved or re-arranged during save,
						// it is not safe to put a server ID to a null position for client ID for both row and column IDs
						// generate a brand-new ID for row/column in client side for safe
						if (type == this.OPType.ROW) {
							cId = idArray[index] = this.IDPrefix.SHORT_ROW + this._maxRowIndex++;
						} else {
							cId = idArray[index] = this.IDPrefix.SHORT_COLUMN + this._maxColIndex++;
						}
					}
					
					if(!cId)
						idArray[index] = id;
					else
					{
						this._partialMgr._setMapping(id, cId);
						id = cId;
					}
				}
				if(id != "")
				{
					if(type == this.OPType.ROW)
						this._IDCache[sheetId].row[id] = index;
					else
						this._IDCache[sheetId].col[id] = index;
//					this._adjustMaxIndexById(type, id);
				}
			}
		}
	},
	
	//get the client id which has mapping relationship with server id
	getMapping:function(id)
	{
		if(this._partialMgr)
			id = this._partialMgr._getMapping(id);
		return id;
	},
	
	/*
	 * recover the sheet row&column ids
	 */
	recoverSheet: function(ids,sheetId)
	{
		if(!ids || !sheetId) return;
		this._IDMap[sheetId] = ids;
		var rowArray = this._IDMap[sheetId].row;
		if(!this._IDCache[sheetId])
			this._IDCache[sheetId] = {};
		if(rowArray && rowArray.length > 0)
		{
			this._IDCache[sheetId].row = {};
			var rowIdCache = this._IDCache[sheetId].row;
			for(var i = 0; i < rowArray.length; i++)
			{
				var rowId = rowArray[i];
				rowIdCache[rowId] = i;
				this._adjustMaxIndexById(this.OPType.ROW, rowId);
			}
		}

		var colArray = this._IDMap[sheetId].col;
		if(colArray && colArray.length > 0)
		{
			this._IDCache[sheetId].col = {};
			var colIdCache = this._IDCache[sheetId].col;
			for(var i = 0; i < colArray.length; i++)
			{
				var colId = colArray[i];
				colIdCache[colId] = i;
				this._adjustMaxIndexById(this.OPType.COLUMN, colId);
			}
		}
	},
	
	initSheet: function(sheetId, rowsId2IndexMap, colsId2IndexMap, bOnlyOri)
	{
		var rowArray = this._IDMap[sheetId].row;
		var oriRowPreFix = this.IDPrefix.ORIGINAL_ROW;
		for(var rowId in rowsId2IndexMap)
		{
			if(bOnlyOri && rowId.indexOf(oriRowPreFix) < 0) continue;
			
			var rowIndex = parseInt(rowsId2IndexMap[rowId]);
			var length = rowArray.length;
			while(length < rowIndex)
			{
				rowArray.push("");
				length++;
			}
			rowArray[rowIndex-1] = rowId;
			this._IDCache[sheetId].row[rowId] = rowIndex-1;
			this._adjustMaxIndexById(this.OPType.ROW, rowId);
		}
		
		var colArray = this._IDMap[sheetId].col;
		var oriColPreFix = this.IDPrefix.ORIGINAL_COLUMN;
		for(var colId in colsId2IndexMap)
		{
			if(bOnlyOri && colId.indexOf(oriColPreFix) < 0) continue;
			
			var colIndex = parseInt(colsId2IndexMap[colId]);
			var length = colArray.length;
			while(length < colIndex)
			{
				colArray.push("");
				length++;
			}
			colArray[colIndex-1] = colId;
			this._IDCache[sheetId].col[colId] = colIndex-1;
			this._adjustMaxIndexById(this.OPType.COLUMN, colId);
		}
	},
	
	getIDCache: function(sheetId, type)
	{
		this._prepareCache(sheetId, type);
		var sheet = this._IDCache[sheetId];
		if(!sheet) return null;
		var ret = null;
		if(type == this.OPType.ROW)
			ret = sheet.row;
		else if(type == this.OPType.COLUMN)
			ret = sheet.col;
		else if(type == this.OPType.SHEET)
			ret = sheet;
		return ret;
	},
	
	/*
	 * build up the id -> index map
	 * if type is row, build up the rowid ->index map
	 * if type is col, build up the colid ->index map
	 * if type is sheet, build both rowid and colid map
	 */
	_prepareCache: function(sheetId, type)
	{
		var indexSheet = this._IDMap[sheetId];
		if(!indexSheet) return;
		
		var sheet = this._IDCache[sheetId];
		if(!sheet)
		{
			sheet = {};
			sheet.row = {}, sheet.col = {};
			this._IDCache[sheetId] = sheet;
		}
		if(type == this.OPType.ROW || type == this.OPType.SHEET)
		{
			var rowIdxArray = indexSheet.row;
			var length = rowIdxArray.length;
			for(var i = 0; i < length; i++)
			{
				var rId = rowIdxArray[i];
				if(rId)
					sheet.row[rId] = i;
			}
		}
		if(type == this.OPType.COLUMN || type == this.OPType.SHEET)
		{
			var colIdxArray = indexSheet.col;
			var length = colIdxArray.length;
			for(var i = 0; i < length; i++)
			{
				var cId = colIdxArray[i];
				if(cId)
					sheet.col[cId] = i;
			}
		}
	},
	
	/***********Private Method*****************/
	_clearCache:function(sheetId, type)
	{
		if(type == this.OPType.SHEET)
		{
			//delete the sheet index cache
			for(var id in this._IDCache)
			{
				var sheet = this._IDCache[id];
				delete sheet.index;
			}
		}
		if(sheetId)
		{
			if(this._IDCache[sheetId])
			{
				switch(type)
				{
				case this.OPType.ROW:
					delete this._IDCache[sheetId].row;
					this._IDCache[sheetId].row = {};
					break;
				case this.OPType.COLUMN:
					delete this._IDCache[sheetId].col;
					this._IDCache[sheetId].col = {};
					break;
				case this.OPType.SHEET:
					delete this._IDCache[sheetId];
					break;
				}
			}
		}
	},
	//according to id and the type of id(row/col/sheet)
	//set the max row/col/sheet index
	_adjustMaxIndexById:function(type, id)
	{
		if(id && typeof id == "string")
		{
			var prefix = "";
			var s_prefix = "";// might use short prefix if the id is created by client
			var maxIndex = 0;
			switch (type)
			{
				case this.OPType.SHEET:
					prefix = this.IDPrefix.SHEET;
					s_prefix = this.IDPrefix.SHORT_SHEET;
					maxIndex = this._maxSheetIndex;
					break;
				case this.OPType.ROW:
					prefix = this.IDPrefix.ROW;
					s_prefix = this.IDPrefix.SHORT_ROW;
					maxIndex = this._maxRowIndex;
					break;
				case this.OPType.COLUMN:
					prefix = this.IDPrefix.COLUMN;
					s_prefix = this.IDPrefix.SHORT_COLUMN;
					maxIndex = this._maxColIndex;
					break;
			}
			var index = parseInt(id.substr(s_prefix.length));
			if(isNaN(index))
				index = parseInt(id.substr(prefix.length));
			if(!isNaN(index))
			{
				maxIndex = (maxIndex <= index)?(index+1):maxIndex;
				switch (type)
				{
					case this.OPType.SHEET:
						this._maxSheetIndex = maxIndex;
						break;
					case this.OPType.ROW:
						this._maxRowIndex = maxIndex;
						break;
					case this.OPType.COLUMN:
						this._maxColIndex = maxIndex;
						break;
				}
			}
		}
	},
	//update cache for row/column
	_updateCache:function(type, sheetId, id, index)
	{
		if(type == this.OPType.SHEET || (id && id != ""))
		{
			if(!this._IDCache[sheetId])
				this._IDCache[sheetId] = {};
			var sheet = this._IDCache[sheetId];
			switch (type)
			{
				case this.OPType.ROW:
					if(!sheet.row)
						sheet.row = {};
					sheet.row[id] = index;
					break;
				case this.OPType.COLUMN:
					if(!sheet.col)
						sheet.col = {};
					sheet.col[id] = index;
					break;
				case this.OPType.SHEET:
					sheet.index = index;
			}
		}
	},
	_initSheetMap:function(sheetId)
	{
		this._IDMap[sheetId] = {};
		this._IDCache[sheetId] = {};
		this._IDMap[sheetId].row = [];	
		this._IDCache[sheetId].row = {};
		this._IDMap[sheetId].col = [];
		this._IDCache[sheetId].col = {};
	},
	//get the row count in id map
	_getRowCount:function(sheetId)
	{
		var sheet = this._IDMap[sheetId];
		if(!sheet)
			return 0;
		return sheet.row.length;
	},
	//get the col count in id map
	_getColCount:function(sheetId)
	{
		var sheet = this._IDMap[sheetId];
		if(!sheet)
			return 0;
		return sheet.col.length;
	},
	/***********ROW************/
	//index is 0 based
	//if sheetId does not exist, return null directly
	//if row id does not exist or is empty
	//return null(row id does not exist) or empty string if bCreate == false, 
	//else create one and update it in _IDMap
	getRowIdByIndex:function(sheetId, rowIndex, bCreate)
	{
		if(!sheetId || (rowIndex == null) || (rowIndex == undefined) || (rowIndex < 0))
			return null;
		var sheet = this._IDMap[sheetId];
		if(!sheet)
			return null;
		var rowId = null;
		if(rowIndex >=0 && rowIndex < sheet.row.length)
			rowId = sheet.row[rowIndex];
		//create row Id when rowId == null or rowId == ""
		//update _IDMap
		if(bCreate && (!rowId || rowId == ""))
		{
			rowId = this.IDPrefix.SHORT_ROW + this._maxRowIndex++;
			var size = sheet.row.length;
			var fillCount = rowIndex - size + 1;
			for(var i=0;i<fillCount;i++)
			{
				sheet.row[size+i] = "";
			}
			sheet.row[rowIndex] = rowId;
		}
		//update cache if rowId != null and rowId != ""
		this._updateCache(this.OPType.ROW, sheetId, rowId, rowIndex);
		return rowId;
	},
	/*
	 * return one array of row id for rows starting with 'rowIndex' and ending with 'endRowIndex'
	 * compared to getRowIdByIndex, it won't update cache in order to improve performance.
	 * BE CAREFUL - don't change the returned array
	 * @param endRowIndex		undefined if get id of the singe row by 'rowIndex'
	 * 							-1 if get id of all remaining rows 
	 * @return					one array
	 */
	/*array*/getRowIdArrayByIndex:function(sheetId, rowIndex, endRowIndex,bCreate)
	{
		var bRow = false;
		var list = [];
		if(!sheetId || (rowIndex == null) || (rowIndex == undefined) || (rowIndex < 0))
			return list;
		var sheet = this._IDMap[sheetId];
		if(!sheet)
			return list;
		if (endRowIndex == -1 || endRowIndex >= sheet.row.length - 1) { 
			if(!bCreate)
			{
				endRowIndex = sheet.row.length - 1;
				if (rowIndex == 0) bRow = true;
			}	
		} else if (endRowIndex == undefined) 
			endRowIndex = rowIndex;
		else if (endRowIndex < rowIndex)
			return list;
		
		if (bRow)
			return sheet.row;
		
		for (var i = rowIndex; i <= endRowIndex; ++i)
		{
			var rowId = sheet.row[i];
			if(bCreate && !rowId)
			{
				rowId = this.IDPrefix.SHORT_ROW + this._maxRowIndex++;
				sheet.row[i] = rowId;
			}	
			list.push(rowId);
		}	
		return list;
	},
		
	setColIdByIndex: function(sheetId, colIndex, colId)
	{
		if(!sheetId || (colIndex == null) || (colIndex == undefined) ||  (colIndex < 0))
			return;
		var sheet = this._IDMap[sheetId];
		if(sheet)
		{
			sheet.col[colIndex] = colId;
		}
	},
	
	setRowIdByIndex: function(sheetId, rowIndex, rowId)
	{
		if(!sheetId || (rowIndex == null) || (rowIndex == undefined) ||  (rowIndex < 0))
			return;
		var sheet = this._IDMap[sheetId];
		if(sheet)
		{
			sheet.row[rowIndex] = rowId;
		}
	},
	
	//insert rows from rowIndex with count number
	//count default number is 1
	//the new inserted row does not have row id generated
	//you should use getRowIdByIndex with bCreate=true to get the new row id
	insertRowAtIndex:function(sheetId, rowIndex, count)
	{
		if(!sheetId || (rowIndex == null) || (rowIndex == undefined) ||  (rowIndex < 0))
			return;
		if((count == null) || (count == undefined) || count < 1)
			count = 1;
		var sheet = this._IDMap[sheetId];
		if(sheet)
		{
			if( (0 <= rowIndex) && (rowIndex < sheet.row.length))
			{
				//insert row id in _IDMap
				for(var i=0;i<count;i++)
					sheet.row.splice(rowIndex,0,"");
				//clear _IDCache of this sheet
				this._clearCache(sheetId,this.OPType.ROW);
			}
		}
	},
	//delete row from rowIndex with count number
	//0 <= rowIndex < rowIdArray.length
	//return one array that contains the row id to being deleted,
	//it will be used for transforming local sendoutlist, otherwise 
	//return one empty array
	deleteRowAtIndex:function(sheetId, rowIndex,count)
	{
		var oldIds = [];
		if(!sheetId || (rowIndex == null) || (rowIndex == undefined))
			return oldIds;
		if((count == null) || (count == undefined) || count < 1)
			count = 1;
		var sheet = this._IDMap[sheetId];
		if(sheet)
		{
			if( (0 <= rowIndex) && (rowIndex < sheet.row.length))
			{
				//delete row id in _IDMap
				var left = sheet.row.length - rowIndex;
				count = (count > left)?left:count;
				oldIds = sheet.row.splice(rowIndex,count);
				//optimize the row id array
				var size = sheet.row.length;
				for(var i=size-1; i>=0; i--)
				{
					if(sheet.row[i] == "")
						sheet.row.splice(i,1);
					else
						break;
				}
				//clear _IDCache of this sheet
				this._clearCache(sheetId,this.OPType.ROW);
			}
		}
		return oldIds;
	},
	/***********COLUMN************/
	//colIndex is a number, rather than alpha
	//other param is the same with getRowIdByIndex
	getColIdByIndex:function(sheetId, colIndex, bCreate)
	{
		if(!sheetId || (colIndex == null) || (colIndex == undefined) || (colIndex < 0) || isNaN(colIndex))
			return null;
		var sheet = this._IDMap[sheetId];
		if(!sheet)
			return null;
		var colId = null;
		if(colIndex >=0 && colIndex < sheet.col.length)
			colId = sheet.col[colIndex];
		
		//create col Id when colId == null or colId == ""
		//update _IDMap
		if(bCreate && (!colId || colId == ""))
		{
			colId = this.IDPrefix.SHORT_COLUMN + this._maxColIndex++;
			var size = sheet.col.length;
			var fillCount = colIndex - size + 1;
			for(var i=0;i<fillCount;i++)
			{
				sheet.col[size+i] = "";
			}
			sheet.col[colIndex] = colId;
		}
		//update cache if colId != null and colId != ""
		this._updateCache(this.OPType.COLUMN, sheetId, colId, colIndex);
		return colId;
	},
	/*
	 * return one array of column id for columns starting with 'colIndex' and ending with 'endColIndex'.
	 * BE CAREFUL - don't change the returned array
	 * @param endColIndex		undefined if get id of the singe column by 'colIndex'
	 * 							-1 if get id of all remaining columns 
	 * @return					one array
	 */
	/*array*/getColIdArrayByIndex:function(sheetId, colIndex, endColIndex,bCreate)
	{
		var list = [];
		var bColumn = false;
		if(!sheetId || (colIndex == null) || (colIndex == undefined) || (colIndex < 0))
			return list;
		var sheet = this._IDMap[sheetId];
		if(!sheet)
			return list;
		if (endColIndex == -1 || endColIndex >= sheet.col.length - 1) {
			if(!bCreate)
			{
				endColIndex = sheet.col.length - 1;
				if (colIndex == 0) bColumn = true; 
			}	
		} else if (endColIndex == undefined) 
			endColIndex = colIndex;
		else if (endColIndex < colIndex)
			return list;
		
		if (bColumn)
			return sheet.col;
		
		for (var i = colIndex; i <= endColIndex; ++i)
		{
			var colId = sheet.col[i];
			if(!colId && bCreate)
			{
				colId = this.IDPrefix.SHORT_COLUMN + this._maxColIndex++;
				sheet.col[i] = colId;
			}	
			list.push(colId);
		}	
		return list;
	},	
	
	//insert count columns from colIndex with "" as id
	insertColAtIndex:function(sheetId, colIndex,count)
	{
		if(!sheetId || (colIndex == null) || (colIndex == undefined))
			return;
		if((count == null) || (count == undefined) || count < 1)
			count = 1;
		var sheet = this._IDMap[sheetId];
		if(sheet)
		{
			if( (0 <= colIndex) && (colIndex < sheet.col.length))
			{
				//insert column id in _IDMap
				for(var i=0; i<count;i++)
					sheet.col.splice(colIndex,0,"");
				//clear _IDCache of this sheet
				this._clearCache(sheetId,this.OPType.COLUMN);
			}
		}
	},
	//delete column at colIndex
	//return one array that contains the cloumn id to being deleted,
	deleteColAtIndex:function(sheetId, colIndex, count)
	{
		var oldIds = [];
		if(!sheetId || (colIndex == null) || (colIndex == undefined))
			return oldIds;
		if((count == null) || (count == undefined) || count < 1)
			count = 1;
		var sheet = this._IDMap[sheetId];
		if(sheet)
		{
			if( (0 <= colIndex) && (colIndex < sheet.col.length))
			{
				//delete column id in _IDMap
				var left = sheet.col.length - colIndex;
				count = (count > left)?left:count;
				oldIds = sheet.col.splice(colIndex,count);
				//optimize the col id array
				var size = sheet.col.length;
				for(var i=size-1; i>=0; i--)
				{
					if(sheet.col[i] == "")
						sheet.col.splice(i,1);
					else
						break;
				}
				//clear _IDCache of this sheet
				this._clearCache(sheetId,this.OPType.COLUMN);
			}
		}
		return oldIds;
	},

	/***********SHEET************/
	//return null if does not exist
	//different with row/column is that if sheetIndex > sheetIdArray length, return null,
	//event bCreate == true
	getSheetIdByIndex:function(sheetIndex,bCreate)
	{
		var sheetId = null
		if(sheetIndex >= 0 && sheetIndex < this._SheetIDArray.length)
			sheetId = this._SheetIDArray[sheetIndex];
		else if(sheetIndex == this._SheetIDArray.length && bCreate)
		{
			var sheetId = this.IDPrefix.SHORT_SHEET + this._maxSheetIndex++;
			this._SheetIDArray[sheetIndex] = sheetId;
			this._initSheetMap(sheetId);
			if(this._partialMgr){
				//never load this sheet from server
				this._partialMgr.setComplete(sheetId);
			}
		}
		this._updateCache(this.OPType.SHEET, sheetId, null, sheetIndex);
		return sheetId;
	}, 
	//return -1 if can not found
	getSheetIndexById:function(sheetId)
	{
		//find in cache first
		var sheetIndex = -1;
		var sheet = this._IDCache[sheetId];
		if(sheet)
		{
			if(sheet.index != undefined && sheet.index >= 0){
				sheetIndex = sheet.index;
				return sheetIndex;
			}
		}
		//find in map, and update cache
		for(var i=0; i < this._SheetIDArray.length; i++)
		{
			if( this._SheetIDArray[i] == sheetId ){
				sheetIndex = i;
				this._updateCache(this.OPType.SHEET, sheetId, null, sheetIndex);
				break;
			}
		}
		return sheetIndex;
	},
	//insert sheet at sheetIndex, return the new sheet id
	insertSheetAtIndex:function(sheetIndex, sheetId, sheetName)
	{
		var newSheetId = null;
		
		if (sheetIndex < 0){
			sheetIndex = 0;
		}else if (sheetIndex > this._SheetIDArray.length){
			sheetIndex = this._SheetIDArray.length;
		}
		
		if(sheetIndex >= 0 && sheetIndex <= this._SheetIDArray.length)
		{
			if(sheetId) 
				newSheetId = sheetId;
			else 
				newSheetId = this.IDPrefix.SHEET + this._maxSheetIndex++;
				
			this._SheetIDArray.splice(sheetIndex,0,newSheetId);
			this._initSheetMap(newSheetId);
			this._SheetsMap[newSheetId] = sheetName;
			this._sheetVisInfo[newSheetId] = true;
			if(this._partialMgr){
				//never load this sheet from server
				this._partialMgr.setComplete(newSheetId);
			}
			this._clearCache(null,this.OPType.SHEET);
		}
		return newSheetId;
	},	
	
	//delete sheet at sheetIndex
	//return one array that contains the sheet id to being deleted,
	deleteSheetAtIndex:function(sheetIndex)
	{
		var deleteSheets = [];
		if(sheetIndex >= 0 && sheetIndex < this._SheetIDArray.length)
		{
			deleteSheets = this._SheetIDArray.splice(sheetIndex,1);//return array
			var sheetId = deleteSheets[0];
			delete this._IDMap[sheetId];
			delete this._SheetsMap[sheetId];
			delete this._sheetVisInfo[sheetId];
			this._clearCache(sheetId,this.OPType.SHEET);
		}
		return deleteSheets;
	},
	
	// use newName to replace old sheet name
	renameSheet: function(oldName, newName)
	{
		var sheetId = this.getSheetIdBySheetName (oldName);      
		if (sheetId == null) 
			return;
      
		this._SheetsMap[sheetId] = newName;
	},

	/**
	 * 
	 * @param sheetName
	 * @param visible : boolean
	 */
	updateSheetVis: function(sheetId, visible)
	{
		this._sheetVisInfo[sheetId] = visible;
	},
	
	getSheetVisibleInfo: function()
	{
		var info = {};
		info.sheetsInfo = this._sheetVisInfo;
		var visbleCnt = 0;
		for(var sheetId in info.sheetsInfo)
		{
			if(info.sheetsInfo[sheetId])
				visbleCnt++;
		}	
		info.visibleCount = visbleCnt;
		return info;
	},
	
    // get the sheet id with the given 'sheetName'
    // return null if it isn't found	
	getSheetIdBySheetName:function (sheetName)
    {
		var sheetId = null;
		if (!sheetName) 
			return null;
	 
		for(var id in this._SheetsMap)
		{
			if(this._SheetsMap[id]==sheetName)
			{
				sheetId = id;
				break;
			}
		}
	  
		return sheetId;
    },
    

	// get the number of sheets    
    getSheetCount: function()
    {
    	return  this._SheetIDArray.length;
    },
	//
	//move sheet at the targetIndex
	//the targetIndex is the index when move sheet done.
	//and targetIndex is a number and 0-based
	moveSheet:function(sheetId, targetIndex)
	{
		if(targetIndex >= 0 && targetIndex < this._SheetIDArray.length)
		{
			var curIndex = this.getSheetIndexById(sheetId);
			if(curIndex != -1)
			{
				if(curIndex != targetIndex)
				{
					this._SheetIDArray.splice(curIndex,1);
					this._SheetIDArray.splice(targetIndex,0,sheetId);
					this._clearCache(null,this.OPType.SHEET);
				}
			}
		}
	},
	
	getSheetIdRanges: function(sheetId, endSheetId) {
		var sheetIds = [];
		if(sheetId) {
			if(!endSheetId)
				endSheetId = sheetId;
			var startIndex = this.getSheetIndexById(sheetId);
			var endIndex = this.getSheetIndexById(endSheetId);
			if(startIndex > -1 && endIndex > -1) {
				if(startIndex > endIndex){
					var i = endIndex;
					endIndex = startIndex;
					startIndex = i;
				}
				sheetIds = this._SheetIDArray.slice(startIndex, endIndex + 1);
			}
		}
		return sheetIds;
	},
	
	/**
	 * return sheets name array by order
	 * Note that startName and endName should be in order, if they aren't in order, just return one array containing the first sheet
	 */
	/*Array*/getSheetNameRanges:function(/*string*/startName, /*string*/endName){
		var sheets = [];
		
		if(!endName) {
			var sId = this.getSheetIdBySheetName(startName);
			if(sId) 
				sheets = [startName];
			return sheets;
		}
		var sId = this.getSheetIdBySheetName(startName);
		var eId = this.getSheetIdBySheetName(endName);
		
		if(sId && eId) {
			var startIndex = this.getSheetIndexById(sId);
			var endIndex = this.getSheetIndexById(eId);
			if(startIndex > endIndex){
				var i = endIndex;
				endIndex = startIndex;
				startIndex = i;
			}
			
			sheetIds = this._SheetIDArray.slice(startIndex, endIndex + 1);
			
			for(var i = 0; i < sheetIds.length; i++) {
				var sheetId = sheetIds[i];
				sheets.push(this.getSheetNameById(sheetId));
			}
		}
		return sheets;
	}
});
