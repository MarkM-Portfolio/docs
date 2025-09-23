dojo.provide('websheet.JsProxyModel.Reference');

dojo.declare("websheet.JsProxyModel.Reference", websheet.functions.Reference, {
	_doc: null,	//websheet.JsProxyModel.Document
	_pcm: null, //websheet.JsProxyModel.PartialCalcManager
	_idManager: null, //websheet.JsProxyModel.IDManager
	rangeId:null,//rangeId is the name for named range, and unique id for unnamed range
	usage: null,
	
	//the following ids are only used for compatible with client JS, no other uses
	_sheetId:null,
	
	_rangeInfo: null,
	_address:null,
	_type: null, 
	
	_refCount:0,	
//	_refType: websheet.Constant.RefType.DEFAULT,	
	
	//content cache
	_cells:	null,		//cache all the cells in the range, just used when doc.isLoading=true,doc.isDeepParsing=true
	_rows: null,		//the whole rows
	_opRows: null,		//the optimized rows
	_indexRows: null,	//the row at specified index
	_columns : null,	
	_opColumns: null,	
	_indexColumns: null,
	
	_list:	null,		//store all the formula cell which reference this obj
	
	constructor: function(d, idmanager, address, sheetName)
	{
		this._doc = d;
		this._idManager = idmanager;
		this._pcm = this._doc.getPartialCalcManager();
		if(address)
			this.parseAddress(address, sheetName);
		this._list = [];
	},
	
	parseAddress: function(address, sheetName){
		this._rangeInfo = {sheetName:null, startRow: -1, startCol: -1, endRow:-1, endCol:-1};
		if(address){
			var parsedRef = null;
			if(dojo.isString(address))
    		{
    			this._address = address;
    			parsedRef = websheet.Helper.parseRef(address);
    			if(!parsedRef)
    			{
					this._type = websheet.Constant.RangeType.INVALID;
    				return;
    			}
    		}else
    		{
				parsedRef = address;
    			this._address = address.toString();//it is parseRef
    		}
			if(parsedRef.sheet)
    		{
    			sheetName = parsedRef.sheet;
    		}
			
			var sheet = this._doc.getSheet(sheetName);
    		if(sheet)
    		{
				this._sheetId = sheet.getId();
				var sheetName = sheet.getSheetName();
				var startCol = -1;
    			var startRow = -1;
    			var endCol = -1;
    			var endRow = -1;
    			if(parsedRef){
    				this._type = parsedRef.type;
    				startRow = parsedRef.row;
    				endRow = (parsedRef.endRow < 1)? startRow : parsedRef.endRow;
    				startCol = parsedRef.column;
    				endCol = (parsedRef.endColumn == undefined)? startCol : parsedRef.endColumn;
    				if(this._type == websheet.Constant.RangeType.COLUMN){
						startRow = 1;
						endRow = websheet.Constant.MaxRowNum;
					}else{
	    				if(startRow !== undefined && startRow !== websheet.Constant.INVALID_REF){
	    				}else{
							startRow = -1;
	    					this._type = websheet.Constant.RangeType.INVALID;
						}
	    				if(endRow !== undefined && endRow !== websheet.Constant.INVALID_REF){
	    				}else{
							endRow = -1;
	    					this._type = websheet.Constant.RangeType.INVALID;
						}
					}
    				if(this._type == websheet.Constant.RangeType.ROW){
						startCol = 1;
						endCol = websheet.Constant.MaxColumnIndex;
					}else{
	    				if(startCol !== undefined && startCol !== websheet.Constant.INVALID_REF){
	    					startCol = websheet.Helper.getColNum(startCol);
	    				}
	    				else{
							startCol = -1;
	    					this._type = websheet.Constant.RangeType.INVALID;
						}
	    				if(endCol !== undefined && endCol !== websheet.Constant.INVALID_REF){
	    					endCol = websheet.Helper.getColNum(endCol);
	    				}
	    				else{
							endCol = -1;
	    					this._type = websheet.Constant.RangeType.INVALID;
						}
					}
						
					this._rangeInfo.sheetName = sheetName;
					this._rangeInfo.startRow = startRow;
					this._rangeInfo.startCol = startCol;
					this._rangeInfo.endRow = endRow;
					this._rangeInfo.endCol = endCol;
    			}
    		}else
    		{
    			//if sheetName does not exist, use #REF! instead
    			this._type = websheet.Constant.RangeType.INVALID;
    			parsedRef.sheet = websheet.Constant.INVALID_REF;
    			if(parsedRef.endSheet)
    				parsedRef.endSheet = parsedRef.sheet;
    			this._address = parsedRef.toString();
    		}
		}
	},
	
	equals: function(ref){
		if(ref == null)
			return false;
		var rangeInfo1 = this._rangeInfo;
		var rangeInfo2 = ref._rangeInfo;
		if(this._refType == ref._refType && this._type == ref._type
				&& rangeInfo1.sheetName == rangeInfo2.sheetName
				&& rangeInfo1.startRow == rangeInfo2.startRow
				&& rangeInfo1.startCol == rangeInfo2.startCol
				&& rangeInfo1.endRow == rangeInfo2.endRow
				&& rangeInfo1.endCol == rangeInfo2.endCol)
			return true;
		return false;
	},
	
	getRangeId: function(){
		return this.rangeId;
	},
	
	setRangeId: function(id) {
		this.rangeId = id;
	},
	
	getUsage: function() {
		return this.usage;
	},
	
	setUsage: function(u){
		this.usage = u;
	},
	
	_setRefType:function(type, bOverWrite)
	{
		if(bOverWrite)
			this._refType = type;
		else
			this._refType = this._refType | type;
	},
	
	getRefType:function()
	{
		return this._refType;
	},
	
	addCount: function()
	{
		this._refCount++;
	},
	
	deleteCount: function()
	{
		this._refCount--;
		return this._refCount;
	},
	
	//////////////////////Implement websheet.functions.Reference method///////////////////
////////////////////////////////////////////////
	
	_getRangeInfo: function() {
		return this._rangeInfo;
	},
	
	/*boolean*/isSingleCell: function() {
		var info = this._rangeInfo;
		if( info.startRow == info.endRow && info.startRow > 0
				&& info.startCol == info.endCol && info.startCol > 0)
			return true;
		return false;
	},

	isValid: function(){
		if(this._type == websheet.Constant.RangeType.INVALID)
			return false;
		return true;
	},
	
	getAddress: function(){
		return this._address;
	},
	
	resetCache:function() {
		this._cells = null;
		this._rows = null;
		this._opRows = null;
		this._indexRows = null;
		this._columns = null;
		this._opColumns = null;
		this._indexColumns = null;
	},
	
	//TODO: need check the cell's calculation status
	/*websheet.JsProxyModel.Cell*/getCell:function(rowIndex, colIndex, bModel, bIgnoreError) {
		var javaCell = this._doc._javaDoc.getCellSync(this._sheetId, this._rangeInfo.startRow + rowIndex, 
				this._rangeInfo.startCol + colIndex);
		var cell = null;
		if(javaCell){
			var pcm = this._pcm;
			cell = pcm.getCellByJavaModel(javaCell, true);
			if(pcm._bDeep){
				if(!cell.isParsed)
					cell._calculate();
				else if(cell._isUnCalc){
					pcm._addF(cell);
					throw websheet.Constant.ERRORCODE["2001"];
				}
			}else{
				if(!cell.isParsed || cell._isUnCalc){
					pcm._addF(cell);
					throw websheet.Constant.ERRORCODE["2001"];
				}
			}
		}
		if(!bModel)
		{
			if(cell)
				cell = cell.getComputeValue();
			else
				cell = "";
		}
		return cell;
			
	},
	
	_getError: function(cell, curCell, bIgnoreError, bIgnoreUnParse, bThrow){
		var error;
		if( (!cell.isParsed || cell._isUnCalc) && !bIgnoreUnParse){
			error = websheet.Constant.ERRORCODE["2001"];
		}else{
			var et = cell.getError();
			if(et && !bIgnoreError)
			{
				if(cell == curCell)
					et = websheet.Constant.ERRORCODE["522"];
				else if(et.errorType == websheet.Constant.ErrorType.UNSUPPORTFORMULA)
				{
					et = websheet.Constant.ERRORCODE["1003"];
				}
				error = et;
			}
		}
		if(bThrow && error){
			if(!bIgnoreUnParse)
				throw error;
			
			if(error && (error != websheet.Constant.ERRORCODE["2001"]))
				throw error;
		}
		return error;
	},
	
	_checkCells:function(cells, bModel, bIgnoreError, bIgnoreUnParse){
		var retCells = [];
		if(cells){
			var curCell = websheet.parse.parseHelper.getCurrentParseCell();
			var pcm = this._pcm;
			var bThrowUnCalcExp = false;
			var size = cells.length;
			for(var i=0; i<size;i++){
				var cell = cells[i];
				if(cell){
					this._getError(cell, curCell, bIgnoreError, bIgnoreUnParse, true);
					
					if(!bModel) {
						retCells.push(cell.getCalculatedValue());
					}
				}else{
					if(!bModel)
						retCells.push("");
				}
			}
		}
		if(!bModel)
			return retCells;
		return cells;
	},
	
	/*array of websheet.JsProxyModel.Cell*/getCells: function(bModel, bIgnoreError) {
		var pcm = this._pcm;
		if(!this._cells){
			var bDirty = false;
			this._cells = [];
			var curCell = websheet.parse.parseHelper.getCurrentParseCell();
			if(curCell._bAfPat && pcm.bBatchGetCells){
				//the cell has already been get from jvm
				var sheetName = this._rangeInfo.sheetName;
				if(sheetName){
					var sr = this._rangeInfo.startRow;
					var er = this._rangeInfo.endRow;
					var sc = this._rangeInfo.startCol;
					var ec = this._rangeInfo.endCol;
					for ( var i = sr; i <= er; i++) {
						for ( var j = sc; j <= ec; j++) {
							var cellId = sheetName + "." + websheet.Helper.getColChar(j) + i;
							var cell = pcm.getCell(cellId);
							if(cell)
								this._cells.push(cell);
						}
					}
				}
			}else{
				var javaCells = this._doc._javaDoc.getCellsSync(this._sheetId, this._rangeInfo.startRow, this._rangeInfo.startCol,
						this._rangeInfo.endRow, this._rangeInfo.endCol);
				var size = javaCells.length;
				for(var i = 0; i < size; i++){
					var javaCell = javaCells[i];
					var cell = null;
					if(javaCell){
						cell = pcm.getCellByJavaModel(javaCell, true);
						if(pcm._bDeep){
							if(!cell.isParsed)
								cell._calculate();
							else if(cell._isUnCalc){
								pcm._addF(cell);
								bDirty = true;
							}
//							this._getError(cell, curCell, bIgnoreError);//bIgnoreUnParse is false that is do not throw 2001 error here, because now we want to collect all the cells
						}else{
							if(!cell.isParsed || cell._isUnCalc){
								pcm._addF(cell);
								bDirty = true;
							}
						}
					}
					this._cells.push(cell);
				}
			}
			if(bDirty)//as the first check
				throw websheet.Constant.ERRORCODE["2001"];
		}
//		if(bModel && pcm._bDeep)
//			return this._cells;
			
		var retCells = this._checkCells(this._cells, bModel, bIgnoreError);
		return retCells;
	},
	
	/*array*/getCols: function(bModel, bOptimize, bIgnoreError) {
		var cols = [];
//		var error = null;
		var bCheck = false;
		if((!this._columns  && !bOptimize)
				|| (!this._opColumns && bOptimize))
		{
			var rows = this.getRows(true, bOptimize, bIgnoreError);
			bCheck = true;
			for(var i=0; i<rows.length; i++)
			{
				var row = rows[i];
				for(var j=0; j < row.length; j++)
				{
					var cell = row[j];
					if(!cols[j])
						cols[j] = [];
					cols[j][i] = cell;
				}
			}
			if(bOptimize)
				this._opColumns = cols;
			else
				this._columns = cols;
			
		}else{
			if(bOptimize)
				cols = this._opColumns;
			else
				cols = this._columns;
		}
		if(!bCheck)
		{
			var retCols = [];
			var length = cols.length;			
			for(var i=0; i < length; i++)
			{
				var col = cols[i];
					var retCol = this._checkCells(col, bModel, bIgnoreError);
					retCols.push(retCol);
			}
			return retCols;
		}
	},
	
	/*array*/getRows: function(bModel, bOptimize, bIgnoreError, bIgnoreUnParse) {
		var rows = [];
		var pcm = this._pcm;
		if((!this._rows  && !bOptimize)
				|| (!this._opRows && bOptimize)){
			var curCell = websheet.parse.parseHelper.getCurrentParseCell();
			var javaRows = this._doc._javaDoc.getCellsByRowSync(this._sheetId, this._rangeInfo.startRow, this._rangeInfo.startCol,
					this._rangeInfo.endRow, this._rangeInfo.endCol, bOptimize);
			var rowSize = javaRows.length;
			for(var i = 0; i < rowSize; i++){
				var javaRow = javaRows[i];
				if(!javaRow){
					rows.push([]);//or push null?
					continue;
				}
				var row = [];
				var size = javaRow.length;
				for(var j = 0; j < size; j++){
					var javaCell = javaRow[j];
					var cell = null;
					if(javaCell){
						cell = pcm.getCellByJavaModel(javaCell, true);
						if(pcm._bDeep){
							if(!cell.isParsed)
								cell._calculate();
							else if(cell._isUnCalc)
								pcm._addF(cell);
//							this._getError(cell, curCell, bIgnoreError);//bIgnoreUnParse is false that is do not throw 2001 error here, because now we want to collect all the cells
						}else{
							if(!cell.isParsed || cell._isUnCalc){
								pcm._addF(cell);
							}
						}
					}
					row.push(cell);
				}
				rows.push(row);
			}
			if(bOptimize)
				this._opRows = rows;
			else
				this._rows = rows;
		}else{
			if(bOptimize)
				rows = this._opRows;
			else
				rows = this._rows;
		}
//		if(bModel && pcm._bDeep)
//			return rows;
		
		var retRows = [];
		var length = rows.length;
		for(var i=0; i < length; i++)
		{
			var row = rows[i];
			var retRow = this._checkCells(row, bModel, bIgnoreError, bIgnoreUnParse);
			retRows.push(retRow);
		}
		return retRows;
	},
	
	getRowByIndex:function(index, bModel, bOptimize, bIgnoreError){

		var cells = [];
		var pcm = this._pcm;
		if(this._indexRows && this._indexRows[index])
			cells = this._indexRows[index];
		else if(this._rows)
			cells = this._rows[index];
		else if(this._opRows)
			cells = this._opRows[index];
		else{
			//request one row
			var curCell = websheet.parse.parseHelper.getCurrentParseCell();
			var sr = this._rangeInfo.startRow + index;
			var javaRows = this._doc._javaDoc.getCellsByRowSync(this._sheetId, sr, this._rangeInfo.startCol,
					sr, this._rangeInfo.endCol, bOptimize);
			var javaRow = javaRows[0];//only one row
			if(javaRow){
				var size = javaRow.length;
				for(var j = 0; j < size; j++){
					var javaCell = javaRow[j];
					var cell = null;
					if(javaCell){
						cell = pcm.getCellByJavaModel(javaCell, true);
						if(pcm._bDeep){
							if(!cell.isParsed)
								cell._calculate();
							else if(cell._isUnCalc)
								pcm._addF(cell);
//							this._getError(cell, curCell, bIgnoreError);//bIgnoreUnParse is false that is do not throw 2001 error here, because now we want to collect all the cells
						}else{
							if(!cell.isParsed || cell._isUnCalc){
								pcm._addF(cell);
							}
						}
					}
					cells.push(cell);
				}
			}
		}
		if(!this._indexRows)
			this._indexRows = [];
		this._indexRows[index] = cells;
		
//		if(bModel && pcm._bDeep)
//			return cells;
		
		var retCells = this._checkCells(cells, bModel, bIgnoreError);
		return retCells;
	},
	
	getColByIndex:function(index, bModel, bOptimize, bIgnoreError){
		var cells = [];
		var pcm = this._pcm;
		if(this._indexColumns && this._indexColumns[index])
			cells = this._indexColumns[index];
		else if(this._columns)
			cells = this._columns[index];
		else if(this._opColumns)
			cells = this._opColumns[index];
		else{
			//request one column
			var curCell = websheet.parse.parseHelper.getCurrentParseCell();
			var sc = this._rangeInfo.startCol + index;
			var javaRows = this._doc._javaDoc.getCellsByRowSync(this._sheetId, this._rangeInfo.startRow, sc,
					this._rangeInfo.endRow, sc, bOptimize);
			var size = javaRows.length;
			for(var i = 0; i < size; i++){
				var javaCells = javaRows[i];
				if(javaCells){
					var csize = javaCells.length;
					var cell = null;
					if(csize > 0){
						var javaCell = javaCells[0];
						if(javaCell){
							cell = pcm.getCellByJavaModel(javaCell, true);
							if(pcm._bDeep){
								if(!cell.isParsed)
									cell._calculate();
								else if(cell._isUnCalc)
									pcm._addF(cell);
//								this._getError(cell, curCell, bIgnoreError);//bIgnoreUnParse is false that is do not throw 2001 error here, because now we want to collect all the cells
							}else{
								if(!cell.isParsed || cell._isUnCalc)
									pcm._addF(cell);
							}
						}
					}
					cells.push(cell);
				}
			}
		}
		if(!this._indexColumns)
			this._indexColumns = [];
		this._indexColumns[index] = cells;
		
//		if(bModel && pcm._bDeep)
//			return cells;
		
		var retCells = this._checkCells(cells, bModel, bIgnoreError);
		return retCells;
	},
	
	addRelateCell:function(cellModel)
	{
		if(cellModel)
		{
			this._list.push(cellModel);
		}
	},
	deleteRelateCell:function(cellModel)
	{
		if(cellModel)
		{
			for(var i=0; i<this._list.length; i++)
			{
				if(this._list[i] == cellModel)
				{
					this._list.splice(i, 1);
					return true;
				}
			}
		}
		return false;
	},
	containRelateCell:function(cellModel)
	{
		if(cellModel)
		{
			for(var i=0; i<this._list.length; i++)
			{
				if(this._list[i] == cellModel)
				{
					return true;
				}
			}
		}
		return false;
	}
	
});
