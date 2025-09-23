dojo.provide("websheet.model.RangeUtil");
dojo.require("websheet.functions.IObject");
websheet.model.RangeUtil = {
		//fill the row array with colCnt size
		_fillRow:function(row, colCnt, bModel)
		{
			for(var i=row.length;i<colCnt;i++)
			{
				if(bModel)
					row.push(null);
				else
					row.push("");
			}
		},
		_pushEmptyRows:function(cells, cnt, colCnt, bModel, bOptimize)
		{
			for(var i=0; i<cnt; i++)
			{
				var row = [];
				if(!bOptimize)
					websheet.model.RangeUtil._fillRow(row, colCnt, bModel);
				cells.push(row);
			}
		},
		_pushEmptyCells:function(row, cnt, bModel)
		{
			for(var i=0; i<cnt; i++)
			{
				if(bModel)
					row.push(null);
				else
					row.push("");
			}
		},
		_pushCell:function(row, cellModel, bModel)
		{
			if(bModel)
				row.push(cellModel);
			else{
				var value;
				if(cellModel)
					value = cellModel.getCalculatedValue();
				else
					value = "";
				row.push(value);
			}
		},
		
		//return array of cells in this range
		//bModel: return the cell model or cell value
		//bIgnoreError : true when the formula is ignore error when loading document
		//bOptimize: only work for row/column
		//mode : websheet.Constant.OPType
		//selectRange: array, which is used to get part of the range
		//the content of array is the row/column index which is based from startRow/startCol
		//index: get the cells at row index or column index if index exist, 0-based
		_getCellsByMode:function(/*RangeInfo*/ rangeInfo, bModel, bIgnoreError, bOptimize, mode, index)
		{
			var cells = [];
			var mhelper = websheet.model.ModelHelper;
			var doc = mhelper.getDocumentObj();
			var partialLevel = doc.partialLevel;
			var maxSheetRows = doc.maxSheetRows;
			var isLoading = doc.isLoading;
			var isDeepParsing = doc.isDeepParsing;
			var sheetName = rangeInfo.sheetName;
			var startCol = rangeInfo.startCol;
			var startRow = rangeInfo.startRow;
			var endCol = rangeInfo.endCol;
			var endRow = rangeInfo.endRow;
			if(endRow > maxSheetRows)
	            endRow = maxSheetRows;
			
			var rowCnt = endRow - startRow + 1;
			var colCnt = endCol - startCol + 1;
			
			if(websheet.Helper.isNumeric(index))
			{
				index = parseInt(index);
				if(mode == websheet.Constant.OPType.ROW)
				{
					if(index >= 0 && index < rowCnt)
					{
						startRow += index;
						endRow = startRow;
						rowCnt = 1;
					}
				}else if(mode == websheet.Constant.OPType.COLUMN)
				{
					if(index >= 0 && index < colCnt)
					{
						startCol += index;
						endCol = startCol;
						colCnt = 1;
					}
				}
			}
			if(startRow > 0 && startCol > 0 && rowCnt >= 0 && colCnt >= 0)
			{
				var sheet = doc.getSheet(sheetName);
				if(sheet)
				{
					//load sheet on need when enable partial loading
					if(partialLevel != websheet.Constant.PartialLevel.ALL){
						if( rangeInfo.needPartial || doc.getPartialLoading(sheet.getId()) || sheet.isDirty()){
							var con = doc.controller;
							if(con){
								delete rangeInfo.needPartial;
								var bRet = con.getPartial(sheetName);
								if(bRet)
									throw websheet.Constant.ERRORCODE["2001"];
							}
						}
					}
					var rowModels = sheet.getRows();
					var sRIndex = sheet.getRowPosition(startRow);
					if(sRIndex < 0){
						sRIndex = -(sRIndex + 1);
					}
					
					if(sRIndex < rowModels.length)
					{
						var rIndex = sRIndex;
						while(rIndex < rowModels.length)
						{
							var rowModel = rowModels[rIndex++];
							var rowIndex = rowModel.getIndex();
							if(rowIndex > endRow)
								break;
							else if(rowIndex < startRow)
								continue;
							//for row
							if(mode != websheet.Constant.OPType.CELL)
							{
								var cnt = rowIndex - cells.length - startRow;
								websheet.model.RangeUtil._pushEmptyRows(cells, cnt, colCnt, bModel, bOptimize);
							}
							
							var row = [];
							var cellModels = rowModel.getValueCells(startCol, endCol);
							var cIndex = 0;
							var colIndex = startCol;
							var len = cellModels.length;
							while(cIndex < len)
							{
								var cellModel = cellModels[cIndex++];
								colIndex = cellModel.getCol();
								
								if(isDeepParsing)
									websheet.model.RangeUtil._parseCell(cellModel, bIgnoreError);
								if(mode != websheet.Constant.OPType.CELL)
								{
									var cnt = colIndex - row.length - startCol;
									websheet.model.RangeUtil._pushEmptyCells(row, cnt, bModel);
									websheet.model.RangeUtil._pushCell(row, cellModel, bModel);
								}else
								{
									websheet.model.RangeUtil._pushCell(cells, cellModel, bModel);
								}					
							}
							
							if(mode != websheet.Constant.OPType.CELL && !bOptimize)
							{	
								var cnt = endCol - colIndex; 
								websheet.model.RangeUtil._pushEmptyCells(row, cnt, bModel);							
							}
							if(mode != websheet.Constant.OPType.CELL)
							{
								if(!bOptimize)
									websheet.model.RangeUtil._fillRow(row, colCnt, bModel);
								cells.push(row);	
							}
							cnt = rowModel._repeatedNum;
							var count = endRow - rowIndex; 
							var bEnd = false;
							if( count <= cnt)
							{
								cnt = count;
								bEnd = true;
							}
							if(mode != websheet.Constant.OPType.CELL)
							{
							    if(rIndex == rowModels.length)
	                            {
	                                if(bOptimize)
	                                    break;
	                                if(rowModel.isNull())
	                                    break;
	                            }
								if((bEnd && !bOptimize) || !bEnd)
								{
									websheet.model.RangeUtil._pushEmptyRows(cells, cnt, colCnt, bModel, bOptimize);
								}
							}
							if(bEnd)
								break;
						}
						var cnt = rowCnt - cells.length; 
						if(mode != websheet.Constant.OPType.CELL)
						{
							if(!bOptimize)
							{
								websheet.model.RangeUtil._pushEmptyRows(cells, cnt, colCnt, bModel, bOptimize);
							}
						}
					}
				}
			}
			return cells;
		},
		//when loading document, if the cell has error, throw it directly
		//so that the formula cell reference this cell will return error without calculation
		_parseCell:function(cell, bIgnoreError)
		{
			if(cell && !cell.isParsed)
			{
				cell._parse();
				
				var et = cell.getError();
				if(et && !bIgnoreError)
				{
					if(et.errorType == websheet.Constant.ErrorType.UNSUPPORTFORMULA)
					{
						throw websheet.Constant.ERRORCODE["1003"];
					}else{
						throw et;
					}
				}
			}
		},
		/**
		 * Return a two dimensional array of cell models/calculated value
		 * get exist cell models/value by column
		 * if cell model/value does not exist, use null("") instead
		 * each column is array of cell model/value
		 * index should be int(0-based from startCol), if does not exist, means return all the columns in the range
		 */
		getCols:function(/*RangeInfo*/range, bModel, bOptimize, bIgnoreError)
		{
			var rows = websheet.model.RangeUtil.getRows(range, bModel, bOptimize, bIgnoreError);
			var cells = [];
			for(var i=0; i<rows.length; i++)
			{
				var row = rows[i];
				for(var j=0; j < row.length; j++)
				{
					var cell = row[j];
					if(!cells[j])
						cells[j] = [];
					cells[j][i] = cell;
				}
			}
			return cells;
		},
		//0-based from startCol
		getColByIndex:function(/*RangeInfo*/range, index, bModel, bOptimize, bIgnoreError)
		{
			var rows = websheet.model.RangeUtil._getCellsByMode(range, bModel, bIgnoreError, bOptimize, websheet.Constant.OPType.COLUMN, index);
			var cells = [];
			for(var i=0; i<rows.length; i++)
			{
				var row = rows[i];
				if(row && row.length > 0)
					cells.push(row[0]);
				else
				{
					websheet.model.RangeUtil._pushEmptyCells(cells, 1, bModel);
				}
			}
			if(bOptimize)
			{
				var startRow = range.startRow;
				var endRow = range.endRow;
				var rowCnt = endRow - startRow + 1;
				if(cells.length < rowCnt)
					websheet.model.RangeUtil._pushEmptyCells(cells, 1, bModel);
			}
			return cells;
		},
		/**
		 * Return a two dimensional array of cell models or calculated value
		 * if bModel == true, return cell model, otherwise return calculated value
		 * get exist cell models/calculated value by row
		 * if cell model(value) does not exist, use null("") instead
		 * each row is array of cell model/value
		 * index should be int(0-based, from startRow), if does not exist, means return all the rows in the range
		 */
		getRows:function(/*RangeInfo*/range, bModel, bOptimize, bIgnoreError)
		{
			return websheet.model.RangeUtil._getCellsByMode(range, bModel, bIgnoreError, bOptimize, websheet.Constant.OPType.ROW);
		},
		
		//0-based from startRow
		getRowByIndex:function(/*RangeInfo*/range, index, bModel, bOptimize, bIgnoreError)
		{
			var rows = websheet.model.RangeUtil._getCellsByMode(range, bModel, bIgnoreError, bOptimize, websheet.Constant.OPType.ROW, index);
			var cells = rows[0]? rows[0]: [];
			if(bOptimize)
			{
				var startCol = range.startCol;
				var endCol = range.endCol;
				var colCnt = endCol - startCol + 1;
				if(cells.length < colCnt)
					websheet.model.RangeUtil._pushEmptyCells(cells, 1, bModel);
			}
			return cells;
		},
		getCells:function(/*RangeInfo*/range, bModel, bIgnoreError)
		{
			return websheet.model.RangeUtil._getCellsByMode(range, bModel, bIgnoreError, true, websheet.Constant.OPType.CELL);
		},
		//get the cell at specified position
		//base from the startRow, startCol of range
		getCell:function(/*RangeInfo*/range, rowIndex, colIndex, bModel, bIgnoreError)
		{
			return websheet.model.RangeUtil._getCell(range, rowIndex, colIndex, bModel, bIgnoreError);
		},
		
		_getCell:function(/*RangeInfo*/range, rowIndex, colIndex, bModel, bIgnoreError)
		{
			var cell = null;
			if(!bModel)
				cell = "";
			var mhelper = websheet.model.ModelHelper;
			var doc = mhelper.getDocumentObj();
			var partialLevel = doc.partialLevel;
			var sheetName = range.sheetName;
			var startCol = range.startCol;
			var startRow = range.startRow;
			var endCol = range.endCol;
			var endRow = range.endRow;
			if(startCol > -1 && startRow > -1 && endCol > -1 && endRow > -1)
			{
				if(doc)
				{
					var sheet = doc.getSheet(sheetName);
					if(partialLevel != websheet.Constant.PartialLevel.ALL){
						if(range.needPartial || doc.getPartialLoading(sheet.getId()) || (sheet && sheet.isDirty())){
							var con = doc.controller;
							if(con){
								delete range.needPartial;
								var bRet = con.getPartial(sheetName);
								if(bRet)
									throw websheet.Constant.ERRORCODE["2001"];
							}
						}
					}
					cell = doc.getCell(sheetName, startRow + rowIndex, startCol + colIndex);
//					if(doc.isLoading && doc.isDeepParsing && cell)
					if(doc.isDeepParsing && cell)
						websheet.model.RangeUtil._parseCell(cell, bIgnoreError);
					if(!bModel)
					{
						//get value
						if(cell)
							cell = cell.getCalculatedValue();
						else
							cell = "";
					}
				}
			}
			return cell;
			
		},
		
		/***************************CACHED VERSION OF GET CELL MODEL*****************/
		getRefCells:function(/*RangeInfo*/range, bModel, bIgnoreError)
		{
			var mhelper = websheet.model.ModelHelper;
			var doc = this._doc;
			var pcm = this._pcm;
			if(!doc){
				doc = mhelper.getDocumentObj();
			}
			if(!pcm){
				pcm = mhelper.getPartialCalcManager();
			}
				
			if(!doc.isDeepParsing)
			{
				if(!this._cells || this._bContentDirty){ 
					if(this._bContentDirty && this.resetCache)
						this.resetCache();
					//get cells model, bModel = true
					try{
						this._cells = websheet.model.RangeUtil._getCellsByMode(range, true, bIgnoreError, true, websheet.Constant.OPType.CELL);
					}catch(e){
						//if throw 2001 unparsed exception, 
						//it means that this._cells might just be part of the cells in this reference
						//which should be collect later
						this._bContentDirty = true;
						throw e;
					}
				}
				try{
					var retCells = websheet.model.RangeUtil._checkCells(this._cells, bModel, bIgnoreError, this._firstCheckCells);
				}catch(e){
					throw e;
				}finally{
					this._firstCheckCells = false;
					pcm._rangeList[this._id] = this;//TODO: rangeId might not exist for area, it is id
				}
				return retCells;
			}else{
				delete this._cells;
				return websheet.model.RangeUtil.getCells(range, bModel, bIgnoreError);
			}
		},
		
		getRefCell:function(/*RangeInfo*/range,rowIndex, colIndex, bModel, bIgnoreError)
		{
			var mhelper = websheet.model.ModelHelper;
			var doc = this._doc;
			var pcm = this._pcm;
			var tm = this._tm;
			if(!doc){
				doc = mhelper.getDocumentObj();
			}
			if(!pcm){
				pcm = mhelper.getPartialCalcManager();
			}
			if(!tm){
				tm = doc._taskMgr;
			}
			if(!doc.isDeepParsing)
			{
				var cell = websheet.model.RangeUtil._getCell(range, rowIndex, colIndex, true, bIgnoreError);//bModel=true
				var cell1 = cell;
				if(this._rows && !this._bContentDirty)
				{
					var row = this._rows[rowIndex];
					if(row){
						cell1 = row[colIndex];
						if(cell != cell1)
							console.log("getCell are not equals");
					}
				}	
				if(cell){
//					if(cell._isDirty && cell.isParsed && !cell._isUnCalc)
//						cell.getCalculatedValue(); //force re-calculation if this cell is Dirty
					if(!cell.isParsed || cell._isUnCalc || cell._isDirty){
							//if the cell is not parsed
							//then put it to fCells of sheet
							//so that it can be parsed in sheet.partialParse
							//make sure that cell is unique in _fCells 
							var currentCalcManager = null;
							var sId = null;
							var currentTask = tm._current;
							if(currentTask){
								var scope = currentTask.scope;
								if(scope && scope._addF)
								{
									currentCalcManager = scope;
									sId = currentTask.args[0];
								}
							}
							if(!currentCalcManager)
								currentCalcManager = this._pcm;
							currentCalcManager._addF(cell, sId);
							if(cell == websheet.parse.FormulaParseHelper.getCurrentParseCell() && !bIgnoreError)
								throw websheet.Constant.ERRORCODE["522"];
						throw websheet.Constant.ERRORCODE["2001"];
					}
						var et = cell._error;
						if(et && !bIgnoreError)
						{
							if(et.errorType == websheet.Constant.ErrorType.UNSUPPORTFORMULA)
							{
								throw websheet.Constant.ERRORCODE["1003"];
							}else{
								throw et;
							}
						}
				}
				if(!bModel)
				{
					if(cell)
						cell = cell.getCalculatedValue();
					else
						cell = "";
				}
				return cell;
			}else
				return websheet.model.RangeUtil.getCell(range, rowIndex, colIndex, bModel, bIgnoreError);
		},
		
		//bIgnoreUnParse is true means no matter the cells in the reference is unparsed or not, we return them without throw unparsed error
		//because for some formulas such as sumif it will get the cells in the destination range with the corresponding source cells meet the satisfaction
		//while the destination range might contains unparsed cells which correspoding source cells is not meet the satisfactions
		getRefRows:function(/*RangeInfo*/range,bModel, bOptimize, bIgnoreError, bIgnoreUnParse, bIgnoreRecursive)
		{
//			if(this._doc.isLoading && !this._doc.isDeepParsing)//just called when this._document is loading
			if(!this._doc.isDeepParsing)
			{
				var rows = null;
				if((!this._rows  && !bOptimize)
						|| (!this._opRows && bOptimize)
						|| this._bContentDirty)
				{
					if(this._bContentDirty)
						this.resetCache();
					//get cells model, bModel = true
					try{
						rows = websheet.model.RangeUtil._getCellsByMode(range, true, bIgnoreError, bOptimize, websheet.Constant.OPType.ROW);
					}catch(e){
						this._bContentDirty = true;
						throw e;
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
//				var bThrowUnCalcExp = false;
				var retRows = [];
				var error = null;
				var length = rows.length;		
				var maxColSize = 1;
				for(var i=0; i < length; i++)
				{
					var row = rows[i];
					try{
						var retRow = websheet.model.RangeUtil._checkCells(row, bModel, bIgnoreError, this._firstCheckRows, bIgnoreUnParse, bIgnoreRecursive);
						retRows.push(retRow);
						//
						if (maxColSize < retRow.length && bOptimize)
							maxColSize = retRow.length;
					}catch(e){
						if(!this._firstCheckRows)
							throw e;
						//the other error code has high priority than 2001(unparsed exception)
						if(!error || error.errorCode == 2001){
							error = e;
						}
//						if(e.errorCode == 2001){
//							bThrowUnCalcExp = true;
//						}else
//							throw e;
					}
				}
				this._firstCheckRows = false;
				this._pcm._rangeList[this._id] = this;
				if(error)
					throw error;
				
				if(bOptimize)
					retRows.colSize = maxColSize;
				return retRows;
			}
			else{
				//TODO: should still cache it for deep tranverse
				delete this._rows;
				delete this._opRows;
				return websheet.model.RangeUtil.getRows(range, bModel, bOptimize, bIgnoreError);
			}
		},
		
		getRefCols:function(/*RangeInfo*/range,bModel, bOptimize, bIgnoreError)
		{
			if(!this._doc.isDeepParsing)
			{
				if(!this._columns || this._bContentDirty)
				{
					//get cells model, bModel = true
//					arguments[0] = true;
					this._columns = websheet.model.RangeUtil.getCols(range,bModel, bOptimize, bIgnoreError);
					this._bContentDirty = false;
				}
				var bCheck = false;
				var cols = null;
				if((!this._columns  && !bOptimize)
						|| (!this._opColumns && bOptimize)
						|| this._bContentDirty)
				{
					if(this._bContentDirty)
						this.resetCache();
					var rows = this.getRows(bModel, bOptimize, bIgnoreError);
					bCheck = true;
					cols = [];
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
					var error = null;
					var length = cols.length;			
					for(var i=0; i < length; i++)
					{
						var col = cols[i];
						try{
							var retCol = websheet.model.RangeUtil._checkCells(col, bModel, bIgnoreError, this._firstCheckRows);
							retCols.push(retCol);
						}catch(e){
							if(!this._firstCheckRows)
								throw e;
							//the other error code has high priority than 2001(unparsed exception)
							if(!error || error.errorCode == 2001){
								error = e;
							}
						}
					}
					this._firstCheckRows = false;
					this._pcm._rangeList[this.getId()] = this;
					if(error)
						throw error;
					return retCols;
				}
				
				return cols;
			}
			else{
				delete this._columns;
				delete this._opColumns;
				return websheet.model.RangeUtil.getCols(range, bModel, bOptimize, bIgnoreError);
			}
		},
		
		getRefRowByIndex:function(/*RangeInfo*/range,index, bModel, bOptimize, bIgnoreError)
		{
//			if(this._doc.isLoading && !this._doc.isDeepParsing)//just called when this._document is loading
			if(!this._doc.isDeepParsing)
			{
				if(this._bContentDirty)
					this.resetCache();
				var cells = [];
				if(this._indexRows && this._indexRows[index])
					cells = this._indexRows[index];
				else if(this._rows)
					cells = this._rows[index];
				else if(this._opRows)
					cells = this._opRows[index];
				else{
					cells = websheet.model.RangeUtil.getRowByIndex(range, index, bModel, bOptimize, bIgnoreError);
				}
				if(!this._indexRows)
					this._indexRows = [];
				this._indexRows[index] = cells;
				
				if(!this._firstCheckIndexRows)
					this._firstCheckIndexRows = [];
				if(this._firstCheckIndexRows[index] == undefined)
					this._firstCheckIndexRows[index] = true;
					
				try{
					var retCells = websheet.model.RangeUtil._checkCells(cells, bModel, bIgnoreError, this._firstCheckIndexRows[index]);
					return retCells;
				}catch(e){
					throw e;
				}finally{
					this._firstCheckIndexRows[index] = false;//should not set undefined
					this._pcm._rangeList[this._id] = this;
				}
			}else{
				return websheet.model.RangeUtil.getRowByIndex(range, index, bModel, bOptimize, bIgnoreError);
			}
		},
		
		getRefColByIndex:function(/*RangeInfo*/range,index, bModel, bOptimize, bIgnoreError)
		{
//			if(this._doc.isLoading && !this._doc.isDeepParsing)//just called when this._document is loading
			if(!this._doc.isDeepParsing)
			{
				//get cells model, bModel = true
				if(this._bContentDirty)
					this.resetCache();
				var cells = [];
				if(this._indexColumns && this._indexColumns[index])
					cells = this._indexColumns[index];
				else if(this._columns)
					cells = this._columns[index];
				else if(this._opColumns)
					cells = this._opColumns[index];
				else{
					cells = websheet.model.RangeUtil.getColByIndex(range, index, bModel, bOptimize, bIgnoreError);
				}
				if(!this._indexColumns)
					this._indexColumns = [];
				this._indexColumns[index] = cells;
				
				if(!this._firstCheckIndexCols)
					this._firstCheckIndexCols = [];
				if(this._firstCheckIndexCols[index] == undefined)
					this._firstCheckIndexCols[index] = true;
					
				try{
					var retCells = websheet.model.RangeUtil._checkCells(cells, bModel, bIgnoreError, this._firstCheckIndexCols[index]);
					return retCells;
				}catch(e){
					throw e;
				}finally{
					this._firstCheckIndexCols[index] = false;//should not set undefined
					this._pcm._rangeList[this._id] = this;
				}
				
			}else{
				return websheet.model.RangeUtil.getColByIndex(range, index, bModel, bOptimize, bIgnoreError);
			}
		},
		
		_checkCells:function(cells, bModel, bIgnoreError, bFirstCheck, bIgnoreUnParse, bIgnoreRecursive){
			var mhelper = websheet.model.ModelHelper;
			var pcm = this._pcm;
			if(!pcm){
				pcm = mhelper.getPartialCalcManager();
			}
			var tm = this._tm;
			if(!tm){
				tm = this._doc._taskMgr;
			}
			var currentCalcManager = null;
			var sId = null;
			var retCells = [];
			var curCell = websheet.parse.FormulaParseHelper.getCurrentParseCell();
			var error = null;
			if(cells){
				var bThrowUnCalcExp = false;
				var size = cells.length;
				for(var i=0; i<size;i++){
					var cell = cells[i];
					if(cell){
//						if(cell._isDirty && cell.isParsed && !cell._isUnCalc)
//							cell.getCalculatedValue(); //force re-calculation if this cell is Dirty
						if(!cell.isParsed || cell._isUnCalc || cell._isDirty){
							//for first check, should put all the cells to partialCalcManager
							//if the cell is not parsed
							//then put it to fCells of sheet
							//so that it can be parsed in sheet.partialParse
							//make sure that cell is unique in _fCells 
							if(!currentCalcManager)
							{
								var currentTask = tm._current;
								if(currentTask){
									var scope = currentTask.scope;
									if(scope && scope._addF)
									{
										currentCalcManager = scope;
										sId = currentTask.args[0];
									}
								}
								if(!currentCalcManager)
									currentCalcManager = pcm;
							}
							currentCalcManager._addF(cell, sId);
							
							if(cell == curCell && !bIgnoreRecursive)
								throw websheet.Constant.ERRORCODE["522"];
							if(!bFirstCheck){
								if(!bIgnoreUnParse)
									throw websheet.Constant.ERRORCODE["2001"];
							}
							bThrowUnCalcExp = true;
							if(!error)//return the first encountered error, the unparsed cell might also contain error value after calcuated done
								error = websheet.Constant.ERRORCODE["2001"];
							continue;
						}
							var et = cell._error;
							if(et && !bIgnoreError)
							{
								if(cell == curCell)
									et = websheet.Constant.ERRORCODE["522"];
								else if(et.errorType == websheet.Constant.ErrorType.UNSUPPORTFORMULA)
								{
									et = websheet.Constant.ERRORCODE["1003"];
								}
								if(!bFirstCheck)
									throw et;
								//only return the first error
								if(!error)
									error = et;
							}
						if(!bModel) {
							retCells.push(cell.getCalculatedValue());
						}
					}else{
						if(!bModel)
							retCells.push("");
					}
				}
				if(error && error != websheet.Constant.ERRORCODE["2001"])
					throw error;
				
				if(!bIgnoreUnParse){
					if(bThrowUnCalcExp){
						throw websheet.Constant.ERRORCODE["2001"];
					}
				}
			}
			if(!bModel)
				return retCells;
			return cells;
		}
};