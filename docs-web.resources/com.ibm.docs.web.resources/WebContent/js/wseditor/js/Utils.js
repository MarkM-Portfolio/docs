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

dojo.provide("websheet.Utils");
dojo.require("websheet.model.ModelHelper");
websheet.Utils = {
	  	/*boolean*/hasRangesByUsage: function(usage) {
			//iterate task id get task bean and show task 
			var documentModel = websheet.model.ModelHelper.getDocumentObj();
			var ranges = documentModel.getAreaManager().getRangesByUsage(usage);
			
			if(ranges && ranges.length > 0)
				return true;
			return false;
		},
		
		/*
		 * get the cell's value for the given row model
		 * @param rModel: row model
		 * output: json
		 */
		_getCellsValue: function(rModel)
		{
			var cellsJson = {};
			var sheetName = rModel._getSheetName();
			var index = rModel.getIndex();
			var rangeInfo = {sheetName: sheetName, startRow: index, endRow: index, startCol: 1, endCol: 1024};
			var isExist = false;
			var iter = new websheet.model.RangeIterator(rangeInfo, websheet.Constant.RangeIterType.OPTIMIZEVALUE);
			iter.iterate(function(cModel, row, col) {
				var cell = {};
				var flag = false;
				var value = cModel.getRawValue();
				if (cModel.isNumber()) {
		    		// non formula number cell, convert value to string if it is a big number
		    		cell.v = websheet.Helper.convertToStringForBigNumber(value);
		    	} else
		    		cell.v = value;
				if(cModel.getLink(true))
					cell.link = cModel.getLink();
				var tarr = cModel.serializeTokenArray();
				if (tarr && tarr.length > 0) {
					cell.tarr = tarr;
				}
				flag = true;
				isExist = true;
				
				if(flag)
				{
					var strColIndex = websheet.Helper.getColChar(col);
					cellsJson[strColIndex] = cell;
				}
				
				return true;
			});
			
			if(isExist) return cellsJson;
			return null;
		},
		
		getDelRangeInfo: function(area, refMask, deltaR, deltaC){
			var ref = area.getParsedRef();
			var rowSize = 1;
	    	var colSize = 1;
	    	if(area.usage == websheet.Constant.RangeUsage.SHARED_REFS){
	    		rowSize = area._rowSize;
	    		colSize = area._colSize;
	    	}
			var startRow = ref.startRow;
			var endRow = ref.endRow;
			var startCol = ref.startCol;
			var endCol = ref.endCol;
			
			if((refMask & websheet.Constant.RefAddressType.ROW) > 0 && (refMask & websheet.Constant.RefAddressType.ABS_ROW) == 0)
				startRow += deltaR;
			if((refMask & websheet.Constant.RefAddressType.COLUMN) > 0 && (refMask & websheet.Constant.RefAddressType.ABS_COLUMN) == 0)
				startCol += deltaC;
			if(refMask == websheet.Constant.DEFAULT_CELL_MASK || refMask == websheet.Constant.CELL_MASK){
				endRow = startRow;
				endCol = startCol;
			}else{
				if((refMask & websheet.Constant.RefAddressType.END_ROW) > 0 && (refMask & websheet.Constant.RefAddressType.ABS_END_ROW) == 0)
					endRow = startRow + rowSize - 1;
				if((refMask & websheet.Constant.RefAddressType.END_COLUMN) > 0 && (refMask & websheet.Constant.RefAddressType.ABS_END_COLUMN) == 0)
					endCol = startCol + colSize - 1;
			}
			return {sheetName:ref.sheetName,
					startRow:startRow,
					endRow:endRow,
					startCol:startCol,
					endCol:endCol};
		},
		
		getRefValue4Chart: function(chartId)
		{
	    	var docObj = websheet.model.ModelHelper.getDocumentObj();
	    	var range = docObj.getAreaManager().getRangeByUsage(chartId, websheet.Constant.RangeUsage.CHART);
	    	if(range){
	    		var sheetName = range.getSheetName();
	    		if(sheetName)
	    			return websheet.Helper.createVirtualRef(sheetName);
	    	}	    	
		},
		
		/*
		 * get a range address to create chart, the range address is the area with data
		 */
		getRangeAddr4Chart: function(rangeAddr)
		{
			var parseRef = websheet.Helper.parseRef(rangeAddr);
			if(!parseRef || !parseRef.isValid() || !parseRef.sheetName)
				return null;
			var sheetName = parseRef.sheetName;
			if(!sheetName)
				return null;
			
			var mhelper = websheet.model.ModelHelper;
			var doc = mhelper.getDocumentObj();
			var sheet = doc.getSheet(sheetName);
			if(!sheet)
				return null;
			var startCol = parseRef.startCol;
			var startRow = parseRef.startRow;
			var endCol = parseRef.endCol;
			var endRow = parseRef.endRow;
			
			var MAXROW = doc.maxSheetRows;
			
			var bRow = false;
			var bCol = false;			
			//row
			var type = parseRef.getType();
			if((startCol == 1 && endCol == websheet.Constant.MaxColumnIndex) || type==websheet.Constant.RangeType.ROW){
			    bRow = true;
				startCol = mhelper.getMinColIndex4Show(sheetName, startRow, endRow);
				endCol = mhelper.getMaxColIndex4Show(sheetName, startRow, endRow);
				if(startCol > endCol)
					startCol = endCol = 1;
			}
			else if((startRow == 1 && endRow == MAXROW) || type==websheet.Constant.RangeType.COLUMN)
			{
			    bCol = true;
				startRow = mhelper.getMinRowIndex(sheet, startCol, endCol);					
				endRow = mhelper.getMaxRowIndex(sheet, startCol, endCol);
				if(startRow == 0 && endRow == 0)
					startRow = endRow = 1;
			}
			
			var bCell = (startRow == endRow && startCol == endCol);
			var params= {};
			if(bCell)
				params.refMask = websheet.Constant.CELL_MASK;
			var address = websheet.Helper.getAddressByIndex(sheetName, startRow, startCol,null,endRow,endCol, params);
			return address;
		},
		
		//for set chart event and insert chart event in undo stack
		getAddr: function(addrs, rangeIds, /*RangeList*/rangeList)
		{
			var addr = "";
			var l = addrs.length;
			if(l > 1)
				addr += "(";
			for(var j = 0; j < l; j++){
				var rangeId = rangeIds[j];
				var range;
				if(rangeId)
					range = rangeList.getRange(rangeId);
				if(range){
					var ref = range.getAddress();
					addr += ref;
				}else
					addr += addrs[j];
				if(j < l - 1)
					addr += ",";			
			}
			if(l > 1)
				addr += ")";
			return addr;
		},
		
		getDataValidation4Cell:function(sheetName, rowIndex, colIndex, forRange){
			var doc = websheet.model.ModelHelper.getDocumentObj();
			var areaMgr = doc.getAreaManager();
			var ranges = areaMgr.getRangesByUsage(websheet.Constant.RangeUsage.DATA_VALIDATION, sheetName);
			for(var i = 0; i < ranges.length; i++){
				var range = ranges[i];
				var psrsedRef = range.getParsedRef();
				if(rowIndex >= psrsedRef.startRow && rowIndex <= psrsedRef.endRow && colIndex >= psrsedRef.startCol && colIndex <= psrsedRef.endCol)
					return forRange ? range : range.data;
			}
			return null;
		},
		
		getRowsVisMap: function(sheet, startRow, endRow)
		{
			var rows = sheet.getRows();
			var rowsMap = {};
			var start = sheet.getRowPosition(startRow, true);
			if (start < 0) {
				start = -(start + 1);
			}
			for(var i = start; i < rows.length; i++){
				var row = rows[i];
				var rowIndex = row.getIndex();
				if(rowIndex > endRow)
					break;
				if(!row.isVisibility()){
					var j = 0;
					j = rowIndex < startRow ? startRow - rowIndex : j;
					for(; j <= row._repeatedNum; j++){
						rowsMap[rowIndex + j] = true;
					    if(rowIndex + j == endRow)
					    	return rowsMap;
					}
				}
			}
			return rowsMap;
		},
		
		getColsVisMap: function(sheet, startCol, endCol){
			var cols = sheet.getColumns();
			var colsMap = {};
			var start = sheet.getColumnPosition(startCol, true);
			if (start < 0) {
				start = -(start + 1);
			}
			for (var i = start; i < cols.length; i++){
				var col = cols[i];
				var colIdx = col.getIndex();
				
				if (colIdx > endCol)
					break;
				
				if(!col.isVisible()){
					var j = 0;
					j = colIdx < startCol ? startCol - colIdx : j;
					for(; j <= col._repeatedNum; j++){
						colsMap[colIdx + j] = true;
					    if(colIdx + j == endCol)
					    	return colsMap;
					}
				}
			}
			return colsMap;
		},
		
		/*
		 * get the cell's value from start row index to end row index
		 * @param sModel: sheet model
		 * @param srIndex: start row index
		 * @param erIndex: end row index
		 * output: json
		 */
		getRowsValue: function(sModel, srIndex, erIndex)
		{
			var rows = {};
			var sheetId = sModel.getId();
			var sPos = sModel.getRowPosition(srIndex);
			var sIndex = (sPos < 0)? (-(sPos+1)): sPos;
			var ePos = sModel.getRowPosition(erIndex);
			var eIndex = (ePos < 0)? (-(ePos+2)): ePos;
			
			var rowsArray = sModel.getRows();
			if(eIndex < 0 || sIndex >= rowsArray.length|| rowsArray.length == 0) return null;
			var flag = false;
			for(var index = sIndex; index <= eIndex; index++)
			{
				var rModel = rowsArray[index];
				var curRIndex = rModel.getIndex();
				if(curRIndex >= srIndex && curRIndex <= erIndex)
				{
					var cellsJson = this._getCellsValue(rModel);
					if(cellsJson != null)
					{
						var item = {};
						item.cells = cellsJson;
						rows[curRIndex] = item;
						flag = true;
					}
				}
			}
			if(flag) return rows;
			return null;
		},
				
		/**
		 * @returns a map containing all valid ID with row id as key and index as value
		 */
		getRowsId: function(sModel, srIndex, erIndex)
		{
			var idList = sModel.getRowIdArray(0, -1);
			var i = Math.min(srIndex, idList.length + 1);
			var end = Math.min(erIndex, idList.length + 1);
			var idMap = {};
			for (; i <= end; i++) {
				var id = idList[i - 1];
				if (id != null && id.length > 0) {
					idMap[id] = i;
				}
			}

			return idMap;
		},
		
		/**
		 * @returns a map containing all valid ID with column id as key and index as value
		 */
		getColsId: function(sModel,scIndex, ecIndex)
		{
			var sheetId = sModel.getId();
			var idList = sModel.getColIdArray(0, -1);
			var i = Math.min(scIndex, idList.length + 1);
			var end = Math.min(ecIndex, idList.length + 1);
			
			var idMap = {};
			for (; i <= end; i++) {
				var id = idList[i - 1];
				if (id != null && id.length > 0) {
					idMap[id] = i;
				}
			}
			return idMap;
		},
		
		/*
		 * summary: get the cells value, the cell should not between the startRowIndex and endRowIndex
		 * @param deltSheetName: the sheet name of deleted row/column/sheet
		 * @param cArray: the cells array
		 * @type row or column,
		 * output: the cell's value map, the key is the reference of the cell
		 */
		getImpactCellsValue: function(deltSheetName,cArray, type, bContainNewValue)
		{
			var cells = {};
			if(cArray.length == 0) return cells;
			for(var index = 0 ; index < cArray.length; index++)
			{				
				var content = cArray[index];
				var cModel = content.cell;
				var cell = {};
				// it's tricky here, must use _rawValue rather than cModel.getRawValue()
				// because getRawValue will re-serialize formula string. As a result, we
				// fail to get correct formula string
				cell.v = content.v;
				cell.tarr = content.tarr;
				
				var sheetName = cModel.getSheetName();
				var rIndex = cModel.getRow();
				if(rIndex <= 0) continue;
				var cIndex = cModel.getCol();
				if(cIndex <= 0) continue;
				
				// No need to collect the cell if it belongs to the sheet that are being deleted
				if(type == websheet.Constant.Sheet) 
				{
					//fixme: the clear refs does not need any more
//					cModel.clearRefs();
					if(sheetName == deltSheetName)
						continue;
					else
					{
						var cRef = websheet.Helper.getCellAddr(sheetName, rIndex, cIndex);
						cells[cRef] = cell;
					}
					continue;
				}else 
				{
					//for row and column type
					var cRef = websheet.Helper.getCellAddr(sheetName, rIndex, cIndex);
					cells[cRef] = cell;
					if(bContainNewValue){
						var newtarr = cModel.serializeTokenArray();
						cell.newtarr = newtarr;
						cell.newv = cModel._rawValue;
					}
				}
			} 
			return cells;
		},
		
		 //return true if merged cell contained or filtered rows in the column.
	    _checkMergedOrFilteredInColumn: function(sheetName, scIndex,ecIndex)
	    {
	    	var docObj = websheet.model.ModelHelper.getDocumentObj();
	    	var sheet = docObj.getSheet(sheetName);
	    	var rows = sheet._rows;
	    	var ret = dojo.some(rows, function(row)
	    	{
	    		if(row._filtered)
	    			return true;
	    		var coverInfo = row._coverInfos;
	    		var len = coverInfo.length;
	    		if(len > 0)
	    		{
	    			var pos = row.getCellPosition(scIndex,true,websheet.Constant.CellType.COVERINFO);
	    			if(pos < 0)
	    				pos = -(pos+1);
	    			for(var i = pos; i < len; i++)
	    			{
	    				var coverCell = coverInfo[i];
	    				var start = coverCell.getCol(), end = start + coverCell._colSpan -1;
	    				if( (start < scIndex && end >= scIndex) || (start <= ecIndex && end > ecIndex))
	    				{
	    					return true;
	    				}	
	    				if(start > ecIndex || end > ecIndex)
	    					break;
	    			}	
	    		}	
	    	}, this);
	    	return ret;
	    }, 
	    
	    _checkMergedInRow: function(sheetName, startRow, endRow)
	    {
			var mhelper = websheet.model.ModelHelper;
			var doc = mhelper.getDocumentObj();
			var sheet = doc.getSheet(sheetName);
			var cols = sheet._columns;
			var len = cols.length;
			var checkedCoverCells = [];
			var bContainMergeCell = false;
			var check = function (cell) {
				if(!cell.isChecked) {
					cell.isChecked = true;
					checkedCoverCells.push(cell);
					var srow = cell.getRow();
					if (srow > endRow) {
						return false;
					}
					var rowSpan = cell.getRowSpan();
					var erow = srow + rowSpan - 1;
					if((srow < startRow && erow >= startRow) || (erow > endRow && srow <= endRow)) {
						return (bContainMergeCell = true);
					}
				}
				return false;
			};
			for(var i = 0; i < len; i++)
			{
				var col = cols[i];
				if(col)
				{		
					var cell;
					var infos = col._coverInfos;
					var pos = col.getCoverCellPosition(startRow, true);
					if(pos >= 0) {
						cell = infos[pos];
						if (check(cell)) {
							break;
						}
						break;
					} else {
						pos = - (pos + 1);
					}
					while(cell = infos[pos++])
					{						
						if (check(cell)) {
							break;
						}
					}
				}
				if (bContainMergeCell)
					break;
			}	
			for(var i = 0; i < checkedCoverCells.length; i++) {
				var cell = checkedCoverCells[i];
				delete cell.isChecked;
			}
			
			return bContainMergeCell;
	    },
	    
	    isValidFilterRange: function(rangeInfo)
	    {
	    	if(rangeInfo.sheetName != websheet.Constant.INVALID_REF 
	    			&& rangeInfo.startRow > 0 && rangeInfo.endRow > 0
	    			&& rangeInfo.startCol > 0 && rangeInfo.endCol > 0)
	    		return true;
	    	return false;
	    },
		
		isRangeContainValue: function(sheetName,srIndex,erIndex,scIndex,ecIndex, ignoreMasterCell)
		{
			var doc = websheet.model.ModelHelper.getDocumentObj();
			var sheet = doc.getSheet(sheetName);
			var ret = false;
			for(var rIndex = srIndex; rIndex <= erIndex; rIndex++)
			{
				var row = sheet.getRow(rIndex);
				if(row)
				{
					var cells = row._valueCells;
					for(var i = scIndex; i <= ecIndex; i++)
					{
						if (ignoreMasterCell && rIndex == srIndex && i == scIndex) 
							continue;
						var cell = cells[i - 1];
						if(cell)
						{
							var value = cell.getRawValue();
							if(value !== "" && value !== undefined && value !== null) 
							{
								ret = true;
								break;
							}
						}	
					}	
				}
				if(ret) break;
			}
			return ret;
		},
		
		getSheetMeta: function(sheetId)
		{
			var ret = {};
			ret.row = {};
			ret.col = {};
			ret.sheetid = sheetId;
			var doc = websheet.model.ModelHelper.getDocumentObj();
			var sheet = doc.getSheetById(sheetId);
			if (sheet.getRows()) {
				var idList = sheet.getRowIdArray(0, -1);
				for(var index = 0; index < idList.length; index++)
				{
					var rowId = idList[index];
					if(rowId.length > 0)
					{
						ret.row[rowId] = index+1;
					}
				}
			}
			if(sheet.getColumns()) {
				var idList = sheet.getColIdArray(0, -1);
				for(var index = 0; index < idList.length; index++)
				{
					var colId = idList[index];
					if(colId.length > 0)
					{
						ret.col[colId] = index+1;
					}
				}
			}
			return ret;
		},
		
		/**
		 * get columns width from colIndex to endColIndex, 1-based
		 */
		getColumnWidth:function(sheetName, colIndex, endColIndex)
		{
			var defaultWidth = websheet.Constant.DEFAULT_COLUMN_WIDTH;
			if(!endColIndex)
				endColIndex = colIndex;
			if(colIndex > endColIndex)
			{
				var index = colIndex;
				colIndex = endColIndex;
				endColIndex = index;
			}
			var colCount = endColIndex - colIndex + 1;
			var range = {};
			range.sheetName = sheetName;
			range.startCol = colIndex;
			range.endCol = endColIndex;
			var cols = websheet.model.ModelHelper.getCols(range, true, true).data;
			var width = 0;
			var hasHideCol = 0;
			for(var i=0; i<colCount; i++)
			{
				var col = cols[i];
				var w = defaultWidth;
				if(col){
					if(col.isVisible()){
						var tmpWidth = col.getWidth();
						if(tmpWidth !== null)
							w = tmpWidth;
					}else{
						w = 0;
						hasHideCol++;
					}
				}
				width += w;
			}
			return width;
		},
		
		//fill the target Range
		fillRange: function(sourceRange, targetRange)
		{
			var result = {};
			var sName = sourceRange.sheetName;
			var tName = targetRange.sheetName;
			if(sName === tName)
			{
				var bVertical = true;
				var bIncrease = true;
				var ssr = sourceRange.startRow;
				var ser = sourceRange.endRow;
				var ssc = sourceRange.startCol;
				var sec = sourceRange.endCol;
				var sRowCnt = ser - ssr + 1;
				var sColCnt = sec - ssc + 1;
				var tsr = targetRange.startRow;
				var ter = targetRange.endRow;
				var tsc = targetRange.startCol;
				var tec = targetRange.endCol;
				if((ssr == tsr) && (ser == ter))
				{
					bVertical = false;//fill horizontally
					if(tsc < ssc)// && tec == sec)
						bIncrease = false;	//decrease
				}else
				{
					if(tsr < ssr )//&& ter == ser)
						bIncrease = false;
				}
				var sourceData = websheet.model.ModelHelper.toRangeJSON(sName, ssr, ssc, ser, sec, {checkHidden : true});
				var sourceDVs = websheet.model.ModelHelper.getJSONByUsage(sName, ssr, ssc, ser, sec, websheet.Constant.RangeUsage.DATA_VALIDATION);
				var newData = {};
				//check if the data in one column(if autofill vertically) or in one row(if horizontally)
				//is arithmetic sequence, if yes return the substraction, else return 1
				var subs = this._checkArithSeq(ssr, ser, ssc, sec, sourceData, bVertical);
				//TODO: how to calculate formula more effective
				if(bVertical)
				{
					var startIndex = ser + 1;
					var endIndex = ter;
					if(!bIncrease)
					{
						startIndex = tsr;
						endIndex = ssr - 1;
					}
					for(var i= startIndex; i <= endIndex; i++)
					{
						var rIndex = ssr;
						if(sRowCnt > 1)
						{
							if(bIncrease)
							{
								rIndex += (i-ssr)%sRowCnt;
							}else
							{
								rIndex = ser - (ser-i)%sRowCnt;
							}
						}
						var multiple = Math.abs((i-rIndex)/sRowCnt);
						var row = sourceData[rIndex];
						if(row)
						{
							var newRow = {};
							if(row.rn) {
								var r = row.rn;
								var eri = i + r;// end row index
								if (eri > ter) {
									// repeat range end row index pass target end row index
									// constraint repeat range to target range end
									r = ter - i;
								}
								if (r > 0) {
									newRow.rn = r;
								}								
							}
							
							var rowCells = row.cells;
							for(var cIndex in rowCells)
							{
								var cell = rowCells[cIndex];
								var newCell = dojo.clone(cell);
								var newValue = this._fillData(newCell, sourceRange, bVertical, bIncrease, multiple, subs[cIndex]);
								// for numeric values, formular values has been set in _fillData function already.
								if( (newValue != null) || (newValue != undefined) )
								{
									newCell.v = newValue;
								}
								if(!newRow.cells)
									newRow.cells = {};
								newRow.cells[cIndex] = newCell;
							}
							newData[i] = newRow;
							//TODO: optimize newRow does not have any cell value
						}
					}	
					
				}else
				{
					for(var rIndex in sourceData)
					{
						var newRow = {};
						newData[rIndex] = newRow;
						if(sourceData[rIndex].rn)
							newRow.rn = sourceData[rIndex].rn;
						var row = sourceData[rIndex].cells;
						if(row==null)
							continue;
							
						var startIndex = sec + 1;
						var endIndex = tec;
						if(!bIncrease)
						{
							startIndex = tsc;
							endIndex = ssc - 1;
						}
						for(var i= startIndex; i <= endIndex; i++)
						{
							var cIndex = ssc;
							if(sColCnt > 1)
							{
								if(bIncrease)
								{
									cIndex += (i-ssc)%sColCnt;
								}else
								{
									cIndex = sec - (sec-i)%sColCnt;
								}
							}
							var multiple = Math.abs((i-cIndex)/sColCnt);
							var cChar = websheet.Helper.getColChar(cIndex);
							var cell = row[cChar];
							if(cell)
							{
								var newCell = dojo.clone(cell);
								var newValue = this._fillData(newCell, sourceRange, bVertical,bIncrease,multiple, subs[rIndex]);
								// for numeric values, formular values has been set in _fillData function already.
								if( (newValue != null) || (newValue != undefined))
								{
									newCell.v = newValue;
								}
								cChar = websheet.Helper.getColChar(i);
								if(!newRow.cells)
									newRow.cells = {};
								if (newCell.rn) 
								{
									// fix cell repeatednum if needed
									var r = newCell.rn;
									var eci = r + i; 	// end column index
									if (eci > tec) {
										// fix r to constraint range in targe range
										r = tec - i;
										if (r == 0) {
											delete newCell.rn;
										} else {
											newCell.rn = r;
										}
									}
								}
								newRow.cells[cChar] = newCell;
								//TODO: optimize, if only one cell in row, and has no value, then use repeat number
							}
						}	
					}
				}
				result.newData = newData;
				
				var range = {};
				range.sheetName = tName;
				range.startRow = tsr;
				range.startCol = tsc;
				range.endRow = ter;
				range.endCol = tec;
				var expandRange = this.getExpandRangeInfo(range);		
				//TODO: enlarge data
				result.oldData = websheet.model.ModelHelper.toRangeJSON(tName, expandRange.startRow, expandRange.startCol, expandRange.endRow, expandRange.endCol);
				result.oldDVs = websheet.model.ModelHelper.getJSONByUsage(tName, expandRange.startRow, expandRange.startCol, expandRange.endRow, expandRange.endCol, websheet.Constant.RangeUsage.DATA_VALIDATION);
				result.expandRange = expandRange;
				result.newDVs = this._fillRangeDVs(sourceDVs, sourceRange, expandRange, bVertical);
			}
			return result;
		},
		
		_fillRangeDVs: function(sourceDVs, sourceRange, targetRange, bVertical)
		{
			var len = sourceDVs.length;
			if(len == 0)
				return;
			
			var newDvs = [];
    		var usage = websheet.Constant.RangeUsage.DATA_VALIDATION;
    		var mhelper = websheet.model.ModelHelper;
        	var helper = websheet.Helper;
        	var valueType = websheet.Constant.valueType;
        	        	
    		var sourceRowCount = sourceRange.endRow - sourceRange.startRow + 1;
    		var sourceColCount = sourceRange.endCol - sourceRange.startCol + 1;
    		var targetRowCount = targetRange.endRow - targetRange.startRow + 1;
    		var targetColCount = targetRange.endCol - targetRange.startCol + 1;
    		
    		var repeat = bVertical ?  parseInt(targetRowCount/sourceRowCount) : parseInt(targetColCount/sourceColCount);
    		var mod = bVertical ? targetRowCount - repeat * (sourceRowCount) : targetColCount - repeat * (sourceColCount);
    		var delta = bVertical ? targetRange.startRow - sourceRange.startRow : targetRange.startCol - sourceRange.startCol;
    		
    		for(var i = 0; i < len; i++){
    			var dv = sourceDVs[i];
    			var ref= dv.refValue;
    			var dvJson = dv.data;
    			var parsedRef = websheet.Helper.parseRef(ref);
    			var oldDvStr = JSON.stringify(dvJson);
    			
    			var sr = sc = er = ec = null;
    			
    			var r = repeat;
    			var m = mod;
    			if(bVertical){
    				if(parsedRef.endRow - parsedRef.startRow + 1 == sourceRowCount){
	    				r = 1;
	    				m = 0;
	    				sr = targetRange.startRow;
	    				er = targetRange.endRow;
    				}
    				sc = parsedRef.startCol;
    				ec =  parsedRef.endCol;
    			}else{
    				if(parsedRef.endCol - parsedRef.startCol + 1 == sourceColCount){
	    				r = 1;
	    				m = 0;
	    				sc = targetRange.startCol;
	    				ec = targetRange.endCol;
    				}
    				sr = parsedRef.startRow;
    				er = parsedRef.endRow;
    			}
    			var parentId;
    			if(r > 0){
    				if(sr == null){
	    				sr = parsedRef.startRow + delta;
	    				er = parsedRef.endRow + delta;
	    			}
    				else if(sc == null){
	    				sc = parsedRef.startCol + delta;
	    				ec = parsedRef.endCol + delta;
	    			}
    				var newRef = websheet.Helper.getAddressByIndex(targetRange.sheetName, sr, sc, null, er, ec, {refMask : websheet.Constant.RANGE_MASK });
					var newDv = JSON.parse(oldDvStr);
					var newData = {};
					if(helper.parseValue(newDv.criteria.value1) == valueType.FORMULA){
		    			var value1 = mhelper.transformFormulaString(newDv.criteria.value1, bVertical ? delta : 0,  bVertical ? 0 : delta);
		    			newDv.criteria.value1 = value1;
		    		}
		    		if(newDv.criteria.value2 != undefined && helper.parseValue(newDv.criteria.value2) == valueType.FORMULA){
		    			var value2 = mhelper.transformFormulaString(newDv.criteria.value2, bVertical ? delta : 0,  bVertical ? 0 : delta);
		    			newDv.criteria.value2 = value2;
		    		}
	    			newData.data = newDv;
	    			parentId = newData.rangeid = "DV" + dojox.uuid.generateRandomUuid();
	    			newData.usage = usage;
	    			newDvs.push({refValue: newRef, data: newData});
    			}
    			for(var j = 1; j < r; j++){
    				if(bVertical){
    					sr = parsedRef.startRow + delta + sourceRowCount * j;
    					er = parsedRef.endRow + delta + sourceRowCount * j;
    				}else{
    					sc = parsedRef.startCol + delta + sourceColCount * j;
    					ec = parsedRef.endCol + delta + sourceColCount * j;
    				}
    				var newRef = websheet.Helper.getAddressByIndex(targetRange.sheetName, sr, sc, null, er, ec, {refMask : websheet.Constant.RANGE_MASK });
					var newDv = {parentId : parentId};
					var newData = {};
	    			newData.data = newDv;
	    			newData.rangeid = "DV" + dojox.uuid.generateRandomUuid();
	    			newData.usage = usage;
	    			newDvs.push({refValue: newRef, data: newData});
    			}
    			if(m){
    				hasMore = false;
    				if(bVertical){
    					sr = parsedRef.startRow + delta + sourceRowCount * repeat;
    					if(sr <= targetRange.endRow){
    						er = parsedRef.endRow + delta + sourceRowCount * repeat;
        					if(er > targetRange.endRow)
        						er = targetRange.endRow;
        					hasMore = true;
    					}
    				}else{
    					sc = parsedRef.startCol + delta + sourceColCount * repeat;
        				if(sc <= targetRange.endCol){
        					ec = parsedRef.endCol + delta + sourceColCount * repeat;
        					if(ec > targetRange.endCol)
        						ec = targetRange.endCol;
        					hasMore = true;
        				}
    				}
    				if(hasMore){
    					var newRef = websheet.Helper.getAddressByIndex(targetRange.sheetName, sr, sc, null, er, ec, {refMask : websheet.Constant.RANGE_MASK });
    					var newData = {};
    					var newDv;
    					if(parentId)
    						newDv = {parentId : parentId};
    					else{
    						newDv = JSON.parse(oldDvStr);
    						if(helper.parseValue(newDv.criteria.value1) == valueType.FORMULA){
    			    			var value1 = mhelper.transformFormulaString(newDv.criteria.value1, bVertical ? delta : 0,  bVertical ? 0 : delta);
    			    			newDv.criteria.value1 = value1;
    			    		}
    			    		if(newDv.criteria.value2 != undefined && helper.parseValue(newDv.criteria.value2) == valueType.FORMULA){
    			    			var value2 = mhelper.transformFormulaString(newDv.criteria.value2, bVertical ? delta : 0,  bVertical ? 0 : delta);
    			    			newDv.criteria.value2 = value2;
    			    		}
    					}
    					newData.data = newDv;
    	    			parentId = newData.rangeid = "DV" + dojox.uuid.generateRandomUuid();
    	    			newData.usage = usage;
    	    			newDvs.push({refValue: newRef, data: newData});
    				}
    			}
    		}
			return newDvs;
		},
		
		//check if the data in one column(if autofill vertically) or in one row(if horizontally)
		//is arithmetic sequence, return an array of substraction number
		//if the column/row is arithmetic sequence, then return substraction
		//else return null
		_checkArithSeq:function(startRow, endRow, startCol, endCol,sourceData, bVertical)
		{
			var subs = {};
			var defaultInc = null;
			if(bVertical)
			{
				if(endRow > startRow)
				{
					for(var i= startCol; i <= endCol; i++)
					{
						var sub = defaultInc;
						var colChar = websheet.Helper.getColChar(i);
						var previousValue = null;
						//record the string with pattern str + num
						var prefixStr = null;
						var previousPrefixStr = prefixStr;
						for(var j = startRow; j <= endRow; j++)
						{
							var row = sourceData[j];
							if(row && row.cells)
							{
								var cell= row.cells[colChar];
								var ret = this._parseStr(cell);
								if(ret)
								{
									value = parseFloat(ret.value);
									prefixStr = ret.prefix;
									if(j != startRow)
									{
										if(previousPrefixStr != prefixStr)
										{
											sub = defaultInc;
											break;
										}
										var delta = websheet.Math.sub(value, previousValue);
										if(j == (startRow + 1))
										{
											sub = delta;
										}else
										{
											if(sub != delta) //check if the sub between adjacent cell is equal
											{
												sub = defaultInc;
												break;
											}
										}
									}
									previousValue = value;
									previousPrefixStr = prefixStr;
								}else
								{
									sub = defaultInc;
									break;
								}
							}else
								return subs;	//the row is empty means that there must not has arithmetic sequence in one column
						}
						subs[colChar] = sub;
					}	
				}
			}else
			{
				if(endCol > startCol)
				{
					for(var i= startRow; i <= endRow; i++)
					{
						var sub = defaultInc;
						var row = sourceData[i];
						if(row && row.cells)
						{
							var previousValue = null;
							//record the string with pattern str + num
							var prefixStr = null;
							var previousPrefixStr = prefixStr;
							for(var j = startCol; j <= endCol; j++)
							{
								var colChar = websheet.Helper.getColChar(j);	
								var cell= row.cells[colChar];
								var ret = this._parseStr(cell);
								if(ret)
								{
									value = parseFloat(ret.value);
									prefixStr = ret.prefix;
									if(j != startCol)
									{
										if(previousPrefixStr != prefixStr)
										{
											sub = defaultInc;
											break;
										}
										var delta = websheet.Math.sub(value, previousValue);
										if(j == (startCol + 1))
										{
											sub = delta; //get the sub
										}else
										{
											if(sub != delta) //check if the sub between adjacent cell is equal
											{
												sub = defaultInc;
												break;
											}
										}
									}
									previousValue = value;
									previousPrefixStr = prefixStr;
								}else
								{
									sub = defaultInc;
									break;
								}
							}
						}
						subs[i] = sub;
					}
				}
			}
			return subs;
		},
		
		_parseStr:function(cell)
		{
			if(cell)
			{
				var value = cell.v;
				var prefixStr = null;
				if(websheet.parse.FormulaParseHelper.isFormula(value))
					return null;
				if(!websheet.Helper.isNumeric(value))
				{
					//if it is string, then get the last digital number instead.
					var isLastNum = false;
					var matches = websheet.Helper.lastNum.exec(value);
					if(matches){
						var num = matches[0];
						if(websheet.Helper.isNumeric(num))
						{
							var index = value.lastIndexOf(num);
							prefixStr = value.substring(0, index);
							value = num;
							return {value:num, prefix: prefixStr};
						}
					}
				}else
				{
					prefixStr = null;
					return {value:value};
				}
			}
			return null;
		},
		//the value might be copied, or minus/plus multiple*base
		//multiple: should always be positive integer, default is 1
		//base: default is 1
		_fillData:function(cell, range, bVertical, bIncrease, multiple, base)
		{
			var newData = null;
			var value = cell.v;
			var rowcnt = range.endRow - range.startRow + 1;
			var colcnt = range.endCol - range.startCol + 1;
			var mhelper = websheet.model.ModelHelper;
			if((value != null) || (value != undefined))
			{
				newData = value;
				if(!multiple && (multiple !== 0))
					multiple = 1;
				if(websheet.parse.FormulaParseHelper.isFormula(value))
				{
					var rowDelta = 0;
					var colDelta = 0;
					if(bVertical)
					{
						var rowDelta = multiple*rowcnt;
						if(!bIncrease)
							rowDelta = 0 - rowDelta;
					}else
					{
						var colDelta = multiple*colcnt;
						if(!bIncrease)
							colDelta = 0 - colDelta;
					}
					mhelper.transformFormulaValue(cell, null, rowDelta, colDelta);
					newData = cell.v;
				}else{
					if(!websheet.Helper.isNumeric(value))
					{
						//if it is string, then get the last digital number instead.
						var matches = websheet.Helper.lastNum.exec(value);
						if(matches){
							var num = matches[0];
							if(websheet.Helper.isNumeric(num))
							{
								var index = value.lastIndexOf(num);
								var str = value.substring(0, index);
								var preNumLen = num.length;
								num = this._incNum(num, bVertical, bIncrease, multiple, rowcnt,colcnt, base);
								var sNum = num + "";
								var zeroLen = preNumLen - sNum.length;
								if(str.charAt(0) == "'")
								{
									format = websheet.i18n.Number.getDefaultFormatForShowValue(websheet.Constant.FormatType["NUMBER"]);
									num = websheet.i18n.Number.format(num, format);
								}
								
								var i = 0;
								while( i<zeroLen )
								{
									str += "0";
									i++;
								}
								newData = str + num;
								return newData;
							}
						}
					}else
					{
						newData = this._incNum(value, bVertical, bIncrease, multiple, rowcnt,colcnt, base);
						// for sci number
						newData = websheet.Helper.convertToStringForBigNumber(newData);
					}
				}
			}
			return newData;
			
		},
		
		_incNum:function(num, bVertical, bIncrease, multiple, rowcnt,colcnt, base)
		{
			num = parseFloat(num);
			var cnt = multiple;
			if(bVertical)
			{
				if(base != null && base != undefined)
				{
//					cnt *= rowcnt*base;
					var t = websheet.Math.mul(rowcnt, base);
					cnt = websheet.Math.mul(cnt, t);
				}
			}else
			{
				if(base != null && base != undefined)
				{
//					cnt *= colcnt*base;
					var t = websheet.Math.mul(colcnt, base);
					cnt = websheet.Math.mul(cnt, t);
				}
			}
			if(bIncrease)
			{
//				num += cnt;
				num = websheet.Math.add(num, cnt);
			}else
			{
//				num -= cnt;
				num = websheet.Math.sub(num, cnt);
			}
			return num;
		},
		
		getMergeCellInfo: function(sheetName,srIndex,erIndex,scIndex,ecIndex)
		{
			var mergedCell = new Array();
			var mhelper = websheet.model.ModelHelper;
			var doc = mhelper.getDocumentObj();
			var sheet = doc.getSheet(sheetName);
			var cPos = sheet.getColumnPosition(scIndex,true);
			cPos = (cPos < 0) ? ( - (cPos + 1)) : cPos;
			var cols = sheet._columns;
			var len = cols.length;
			var checkedCoverCells = [];
			for(var i = cPos; i < len; i++)
			{
				var col = cols[i];
				var cIndex = col.getIndex();
				if(cIndex > ecIndex) break;
				if(col)
				{		
					var infos = col._coverInfos;
					var pos = col.getCoverCellPosition(srIndex, true);
					pos = (pos < 0) ? ( - (pos + 1)) : pos;
					var cell;
					while(cell = infos[pos++])
					{						
						if(!cell.isChecked) {
							cell.isChecked = true;
							checkedCoverCells.push(cell);
							var rowIndex = cell.getRow();
							if(rowIndex > erIndex) break;					
							var colIndex = cell.getCol();
							var endCol = colIndex + cell.getColSpan() - 1;
							var endRow = rowIndex + cell.getRowSpan() - 1;
							var cellAddress = websheet.Helper.getAddressByIndex(sheetName, rowIndex, colIndex,null,endRow,endCol);
							mergedCell.push(cellAddress);
						}
					}
				}
			}	
			for(var i = 0; i < checkedCoverCells.length; i++) {
				var cell = checkedCoverCells[i];
				delete cell.isChecked;
			}
			return mergedCell;
		},
		
		/*
		 * colIndex, rowIndex should be 1-based
		 * notIgnoreHide means don't need search the visible cell
		 */
		getCoverCellInfo: function(sheetName, colIndex, rowIndex, backward, notIgnoreHide)
	    {
			// This mehotd currently check the merge info on the column direction;
			// Will skip the hidden columns start from the given column index;
			// You've probably skipped the hidden rows already, currently used in image/chart position calculation;
			// Will revise the column index to master index and return it to you, if you're given a covered column on the row;
	    	var result = {};
	    	if (typeof colIndex == "string") {
	    		colIndex = websheet.Helper.getColNum(colIndex);
			}
			result.sheetName = sheetName;
			result.row = rowIndex;
			result.col = colIndex;
	    	var mhelper = websheet.model.ModelHelper;
	    	var editor = mhelper.getEditor();
	    	var grid = editor.getController().getGrid(sheetName);
	    	if (!grid) {
	    		return result;
	    	}
	    	if ( !notIgnoreHide )
	    		colIndex =  grid.searchVisibleCol(colIndex, backward);
			colIndex = Math.min(colIndex, websheet.Constant.MaxColumnIndex);
	    	result.col = colIndex; 
	    	var doc = editor.getDocumentObj();
	    	var col = doc.getColumn(sheetName, colIndex, true);
	    	if (col) {
	    		var mcell = col.getCoverInfo(rowIndex, true);
	    		if (mcell) {
	    			result.row = mcell.getRow();
    				result.col = mcell.getCol();
    				result.colSpan = mcell.getColSpan();
    				result.rowSpan = mcell.getRowSpan();
	    		}	    			
	    	}
	    	return result;
	    },
	    
	    /*
	     * param@{ info:{ startRow,endRow, startCol,endCol,sheetName}}, all integers
	     */
		getExpandRangeInfo: function(info)
		{
			if(!info.endCol) info.endCol = info.startCol;
			if(!info.endRow) info.endRow = info.startRow;
			if(info.endRow < info.startRow)
			{
				var r = info.endRow;
				info.endRow = info.startRow;
				info.startRow = r;
			}
			if(info.endCol < info.startCol)
			{
				var r = info.endCol;
				info.endCol = info.startCol;
				info.startCol = r;
			}

			var newInfo = dojo.clone(info);
			var mhelper = websheet.model.ModelHelper;
			var docObj = mhelper.getDocumentObj();
			var sheet = docObj.getSheet(info.sheetName);
			var colModels = sheet.getColumns();
			var sCIndex = sheet.getColumnPosition(info.startCol, true);
			if(sCIndex < 0){
				sCIndex = -(sCIndex + 1);
			}
			var checkedCoverCells = [];
			if(sCIndex < colModels.length)
			{
				var cIndex = sCIndex;
				while(cIndex < colModels.length)
				{
					var col = colModels[cIndex++];
					var colIndex = col.getIndex();
					if(colIndex > newInfo.endCol)
						break;
					/*
					 * Recalculate previous cols when range expanded by reset col index.
					 */
					var coverInfos = col._coverInfos;
					var rIndex = col.getCoverCellPosition(newInfo.startRow,true);
					if(rIndex < 0){
						rIndex = -(rIndex + 1);
					}
					while(rIndex < coverInfos.length) {
						var mcell = coverInfos[rIndex];
	    				if(mcell && !mcell.isChecked){
	    					var srow = mcell.getRow();
	    					if(srow > newInfo.endRow)
	    						break;
	    					
	    					mcell.isChecked = true;
	    					checkedCoverCells.push(mcell);

	    					if(srow < newInfo.startRow) {
	    						newInfo.startRow = srow;
	    						cIndex = sCIndex;
	    					}
	    					var rowSpan = mcell.getRowSpan();
	    					var erow = srow + rowSpan - 1;
	    					if(erow > newInfo.endRow) {
	    						newInfo.endRow = erow;
	    						cIndex = sCIndex;
	    					}
	    					
	    					var scol = mcell.getCol(); 
	    					if(scol < newInfo.startCol){
		    					newInfo.startCol = scol;
		    					var index = sheet.getColumnPosition(scol, true);
		    					if(index < 0)
		    						index = -(index + 1);
		    					if(index < sCIndex)
		    						cIndex = index;
	    					}
	    					var colSpan = mcell.getColSpan();
	    					var ecol = scol + colSpan - 1;
	    					if(ecol > newInfo.endCol){
	    						newInfo.endCol = ecol;
	    					}
	    					
	    				}
	    				rIndex++;
					}
				}
			}
			for(var i = 0; i < checkedCoverCells.length; i++) {
				var cell = checkedCoverCells[i];
				delete cell.isChecked;
			}
			return newInfo;
		},
		
		
		// return merge size if yes, else return no.
		isSameMergeRange: function(expandInfo) {
			// summary:
			//		Check against the range, return if all the cells in the range are the same 'size'.
			// return:
			//		{ isSame: boolean, colSpan: number, rowSpan: number}
			var 
				model_iter = new websheet.model.RangeIterator(expandInfo, websheet.Constant.RangeIterType.CHECKSORTRANGE),
				row_span = -1,
				col_span = -1,
				previous_row = expandInfo.startRow - 1,
				isSame = true;
			model_iter.iterate(function (obj, row, col) {
				// Leading cells ? V	Empty rows	? X
				// Tailing cells ? V	Hidden rows ? V
				if (obj && obj.isCovered) {
					if (previous_row < row) {
						previous_row = row;
					}
					return true;
				}
				if (row_span == -1) {
					if (!obj || (!obj.bMultiRowMaster && !obj.isCovered)) {
						row_span = 1;
					} else {
						if (row > previous_row + 1 && obj.bMultiRowMaster && obj.coverInfo._rowSpan > 1) {
							return (isSame = false);
						}
						if (obj.bMultiRowMaster) {
							row_span = obj.coverInfo._rowSpan;
						}
					}
				} else {
					// check row span
					if (row > previous_row + 1 && row_span != 1) {
						if (row > previous_row + row_span) {
							return (isSame = false);
						} else if ((expandInfo.endCol - expandInfo.startCol)%col_span != 0) {
							return (isSame = false);
						}
					}
					if (!obj || (!obj.bMultiRowMaster && !obj.isCovered)) {
						if (row_span != 1) {
							return (isSame = false);
						}
					} else if (obj.bMultiRowMaster && !obj.isCovered) {
						if (row_span != obj.coverInfo._rowSpan) {
							return (isSame = false);
						}
					}
				}
				if (col_span == -1) {
					if (!obj || (!obj.bMultiColMaster && !obj.isCovered)) {
						col_span = 1;
					} else if (obj.bMultiColMaster){
						col_span = obj.coverInfo._colSpan;
					}
				} else {
					// check col span
					if (!obj || (!obj.bMultiColMaster && !obj.isCovered)) {
						if (col_span != 1) {
							return (isSame = false);
						}
					} else if (obj.bMultiColMaster && !obj.isCovered) {
						if (col_span != obj.coverInfo._colSpan) {
							return (isSame = false);
						}
					}
				}
				// The "CheckSortRange" type of iterator may not be able to iterate the last few rows if they are covered.
				// In this case, we still need answer the question with "YES" if they're actually the same size.
				// Here we need to expand the 'previous_row' to the last row of the cover cell, as if we've iterated the row (in advance).
				// 
				if (obj && obj.bMultiRowMaster) {
					previous_row = row + row_span - 1; 
				} else {
					previous_row = row;
				}
				return true;
			});
			if (previous_row != expandInfo.endRow && (row_span > 1 || col_span > 1)) {
				return false;
			}
			return {isSame: true, colSpan: col_span, rowSpan: row_span};
		},
		
		/*
		 * each cell in this range has the same merge size or not merged at all.
		 */
		isSortableRange: function(expandInfo)
		{
			return this.isSameMergeRange(expandInfo) !== false;
		},
		
		/*
		 * check if this cell (in json) contains any value
		 * @param {cell}   	the cell message in json 
		 */
		/*boolean*/hasValue: function(/*cell*/cell)
		{
			if (cell && (cell.v != undefined))
				return true;
			
			return false;
		},
		/*
		 * check if this cell (in json) contains any number format
		 * @param {cell}   	the cell message in json 
		 */
		/*boolean*/hasFormat: function(/*cell*/cell)
		{
			if (cell && cell.style && (cell.style[websheet.Constant.Style.FORMAT]|| cell.style.id))
				return true;
			
			return false;
		},
		
		/*
		 * detect whether the jsonData contain any format style
		 * @param {jsonData}   	rows json or column json representing the undo event of set style to row(s)/column, a map data
		 * @param {type}   		websheet.Constant.Row or websheet.Constant.Column
		 * @param {func} 		search function
		 * @return				TRUE or FALSE
		 */
		/*boolean*/isJSONContainValue: function (jsonData, func,type)
		{
			if(!type || type == websheet.Constant.Row )
			{
				var rows = jsonData.rows ? jsonData.rows : jsonData;
				for(rIndex in rows )
				{
					var row  = rows[rIndex];
					if (row.cells) 
					{
						for (var colIndex in row.cells) 
						{
							var cell = row.cells[colIndex];
							if (func(cell)) return true;
						}
					}
				}
				return false;
			}	
			else if(type == websheet.Constant.Column)
			{
				for(var cIndex in jsonData)
				{
					var col = jsonData[cIndex];
					if(func(col))
					{
						return true;
					}	
				}	
				return false;
			}	
		},
		
		/**
		 * get the visible range info incase there are rows hide in the given range
		 */
		getShowRange:function(rangeInfo){
			var showRangeInfo = dojo.clone(rangeInfo);
			showRangeInfo.startRow = 0;
			showRangeInfo.endRow = 0;
			var mhelper = websheet.model.ModelHelper;
			var rows = mhelper.getRows(rangeInfo, true, true);
			if(rows)
			{
				var rowArray = rows.data;
				var length = rangeInfo.endRow - rangeInfo.startRow + 1;
				
				for(var i = 0; i < length; i++)
				{
					var row = rowArray[i];
					if(row && !row.isVisibility())
					{
						continue;
					}else{
						showRangeInfo.startRow = rangeInfo.startRow + i;					
						break;
					}
				}			
				
				for(var j = (length-1); j >= 0; j--)
				{
					var row = rowArray[j];
					if(row && !row.isVisibility())
					{
						continue;
					}else{
						showRangeInfo.endRow = rangeInfo.endRow - length +j+1;						
						break;
					}
				}
			}

			return showRangeInfo;
		},
		
		/**
		 * get the next visible row index after the row at rowIndex
		 */
		getNextShowRow:function(sheetName, rowIndex)
		{
			var mhelper = websheet.model.ModelHelper;
			var showRowIndex = rowIndex + 1;
			var docObj = mhelper.getDocumentObj();
			var sheet = docObj.getSheet(sheetName);
	        var sRIndex = sheet.getRowPosition(showRowIndex, true);
	        var rowModels = sheet.getRows();
			if(sRIndex > 0 && sRIndex < rowModels.length)
			{
				var rIndex = sRIndex;
				while(rIndex < rowModels.length)
				{
					var row = rowModels[rIndex++];
					var index = row.getIndex();
					if(index > showRowIndex)
						break;
					if(!row.isVisibility())
					{
						var num = row.getRepeatedNum();
						if(num)
							showRowIndex += num;
					}else
					{
						showRowIndex = index;
						break;
					}
					showRowIndex++;
				}
			}
			return showRowIndex;
		},
		
		/**
		 * get the show columns between scIndex and ecIndex
		 * @param sheetName
		 * @param scIndex	: 1-based
		 * @param ecIndex	: 1-based
		 * @returns {Array}
		 */
		getShowColsArray: function(sheetName, scIndex, ecIndex)
		{
			var hArray = [];
			var map = {};
			var mhelper = websheet.model.ModelHelper;
			var colsModel = mhelper.getCols({sheetName:sheetName, startCol:scIndex, endCol:ecIndex }, true, true).data;
			
			var findFirst = true;
			var len = colsModel.length;
			for(var i = 0; i < len; i++)
			{
				var col = colsModel[i];
				if((!col || col.isVisible()) && findFirst)
				{
					map = {};
					map.startIndex = scIndex + i;
					map.endIndex = scIndex + i;
					findFirst = false;
				}	
				if(!findFirst)
				{
					if(!col || col.isVisible())
					{
						map.endIndex = scIndex + i;
					}	
					else
					{
						if( scIndex + i == parseInt(map.endIndex) + 1)
						{
							hArray.push(map);
							findFirst = true;
						}	
					}	
				}	
			}	
			if(!findFirst)
				hArray.push(map);
			var count = ecIndex - scIndex + 1;
			if(len < count)
			{
				if(map.endIndex == scIndex + len -1)
					hArray[hArray.length -1].endIndex = ecIndex;
				else
				{
					map = {startIndex: (scIndex + len), endIndex : ecIndex};
					hArray.push(map);
				}	
			}
			return hArray;
		},
		
		getHiddenArray4Hide:function(sheetName,startRowIndex,endRowIndex){
			var hiddenArray = new Array;
		    var hiddenMap = {};
			var rowArray = this._getRows(sheetName,startRowIndex,endRowIndex);

			var findFirst = true;
			if(rowArray.length > 0)
			{
				for(var i = 0; i < rowArray.length; i++){
					var row = rowArray[i];
					if((!row || row.isVisibility())&& findFirst){
						hiddenMap = {};
						hiddenMap.startRowIndex = startRowIndex + i;
						hiddenMap.endRowIndex = startRowIndex + i;
						if(i == rowArray.length-1)
						{
							hiddenArray.push(hiddenMap);
							break;
						}
						findFirst = false;
					}
					if(!findFirst){
						if(!row || row.isVisibility())
						{
							hiddenMap.endRowIndex = startRowIndex + i;
							if(i == rowArray.length-1)
							{
								hiddenArray.push(hiddenMap);
								findFirst = true;
							}
						}else{
							if(startRowIndex + i == parseInt(hiddenMap.endRowIndex)+1){
								hiddenArray.push(hiddenMap);
								findFirst = true;
							}
						}
					}
				}
				if(rowArray.length < (endRowIndex - startRowIndex + 1)){
					if(hiddenArray.length > 0 && hiddenArray[hiddenArray.length - 1].endRowIndex == startRowIndex + rowArray.length - 1)
						hiddenArray[hiddenArray.length - 1].endRowIndex = endRowIndex;
					else
					{
						hiddenMap = {};
						hiddenMap.startRowIndex = startRowIndex + rowArray.length;
						hiddenMap.endRowIndex = endRowIndex;
						hiddenArray.push(hiddenMap);
					}
				}
			}
			else
			{
				hiddenMap.startRowIndex = startRowIndex ;
				hiddenMap.endRowIndex = endRowIndex ;
				hiddenArray.push(hiddenMap);
			}
			return hiddenArray;
		},
		
		getHiddenArray4Show:function(sheetName,startRowIndex,endRowIndex){
			var hiddenArray = new Array;
		    var hiddenMap = {};
			var rowArray = this._getRows(sheetName,startRowIndex,endRowIndex);
			
			var findFirst = true;
			for(var i = 0; i < rowArray.length; i++){
				var row = rowArray[i];
				if(row && !row.isVisibility()&& !row.isFiltered() && findFirst){
					hiddenMap = {};
					hiddenMap.startRowIndex = startRowIndex + i;
					hiddenMap.endRowIndex = startRowIndex + i;
					if(i == rowArray.length-1) {
						hiddenArray.push(hiddenMap);
						break;
					}
					findFirst = false;
				}
				if(!findFirst){
					if(row && !row.isVisibility() && !row.isFiltered())
					{
						hiddenMap.endRowIndex = startRowIndex + i;
						if(i == rowArray.length-1)
						{
							hiddenArray.push(hiddenMap);
							findFirst = true;
						}
					}else{
						if(startRowIndex + i == parseInt(hiddenMap.endRowIndex)+1){
							hiddenArray.push(hiddenMap);
							findFirst = true;
						}
					}
				}
			}
			return hiddenArray;
		},
		
	
		/**
		 * get the hidden columns between scIndex and ecIndex
		 * @param sheetName
		 * @param scIndex	: 1-based
		 * @param ecIndex	: 1-based
		 */
		getHiddenColsArray: function(sheetName, scIndex, ecIndex)
		{
			var hArray = [];
			var map = {};
			var mhelper = websheet.model.ModelHelper;
			var colsModel = mhelper.getCols({sheetName:sheetName, startCol:scIndex, endCol:ecIndex }, true, true).data;
			
			var findFirst = true;
			var len = colsModel.length;
			for(var i = 0; i < len; i++)
			{
				var col = colsModel[i];
				if(col && !col.isVisible() && findFirst)
				{
					map = {};
					map.startIndex = scIndex + i;
					map.endIndex = scIndex + i;
					findFirst = false;
				}	
				if(!findFirst)
				{
					if(col && !col.isVisible())
					{
						map.endIndex = scIndex + i;
					}	
					else
					{
						if(scIndex + i == parseInt(map.endIndex) + 1)
						{
							hArray.push(map);
							findFirst = true;
						}	
					}	
				}	
			}	
			if(!findFirst)
				hArray.push(map);
			return hArray;
		},
		
		/**
		 * an array,such as [0,1,1,0], 1 means show, 0 means hide,
		 * @param sheetName
		 * @param start			: 1-based
		 * @param end			: 1-based
		 */
		getShowHideInfo: function(sheetName, start, end)
		{
			var info =[];
			for(var i = start; i <= end; i++)
			{
				info[i-start] = 1;
			}
			
			var VISATTR = websheet.Constant.ROW_VISIBILITY_ATTR;
			
			var doc = websheet.model.ModelHelper.getDocumentObj();
			var sheet = doc.getSheet(sheetName);
			var pos = sheet.getRowPosition(start,true);
			if(pos < 0)
				pos = -(pos + 1);
			
			var len = sheet._rows.length;
			for(var i = pos; i < len ; i++)
			{
				var row = sheet._rows[i];
				var sIndex = row.getIndex();
				if(sIndex > end) break;
				var eIndex = row._repeatedNum ? sIndex + row._repeatedNum : sIndex;
				sIndex = sIndex < start ? start : sIndex;
				eIndex = eIndex > end ? end : eIndex;
				if(row._visibility == VISATTR.FILTER && sIndex <= eIndex)
				{
					for(var j = sIndex ; j <= eIndex; j++)
					{
						info[j-start] = 0;
					}
				}
			}
			return info;
		},
		
		getRangeDelta:function(/*parsedRef*/rangeRef,/*parsedRef*/delRef,type)
		{			
			var data = {};
			var rStart, rEnd, start, end;
			if(type == websheet.Constant.Event.SCOPE_ROW){
			    rStart = rangeRef.startRow;
			    rEnd = rangeRef.endRow;
			    start = delRef.startRow;
			    end = delRef.endRow;				
			}else if(type == websheet.Constant.Event.SCOPE_COLUMN){
				rStart = rangeRef.startCol;
			    rEnd = rangeRef.endCol;
			    start = delRef.startCol;
			    end = delRef.endCol;
			}				 	
			 //range changed to #ref	
			if(start <= rStart && end >= rEnd){
				data.startIndex = rStart - start +1;
				data.delta = rEnd - rStart +1;
			}else if(end < rEnd){
				data.startIndex = rStart - start +1;
				data.delta = end - rStart + 1;
			}else {
				data.startIndex = 1;
				data.delta = rEnd - start + 1;						
			}
			return data;
			
		},
		_getRows:function(sheetName,startRowIndex,endRowIndex){
			var rangeInfo = {};
			rangeInfo.sheetName = sheetName;
			rangeInfo.startRow = startRowIndex + 1;
			rangeInfo.endRow = endRowIndex + 1;
			var mhelper = websheet.model.ModelHelper;
			var rows = mhelper.getRows(rangeInfo, true, true);
			if(rows)
				return rows.data;
			return null;
		},
		
		/*
		 * Get all formula cells of the current document,
		 * With partial load being enabled, it only can get formula cells of loaded sheets
		 */
		//if rangeInfo is null,means return all the formula cells in the document
		//if rangeInfo is given, with startRow/endRow -1, means get the whole row of the given sheet
		//startCol/endCol is -1, means get the whole column of the given sheet
		getFormulaCells:function(rangeInfo){
			var formulaCells = [];
			var mhelper = websheet.model.ModelHelper;
			var docObj = mhelper.getDocumentObj();
			var cm = mhelper.getCalcManager();
			var fCellsMap = cm._fCellsMap;
			if(!rangeInfo){
				for(var sheetId in fCellsMap){
					var rowMap = fCellsMap[sheetId];
					if(rowMap){
						for(var rowId in rowMap){
							var cellMap = rowMap[rowId];
							if(cellMap){
								for(var colId in cellMap){
									var cell = cellMap[colId];
									if(cell)
										formulaCells.push(cell);
								}
							}
						}
					}
				}
			}else{
				var sheetName = rangeInfo.sheetName;
				var startCol = rangeInfo.startCol;
				var startRow = rangeInfo.startRow;
				var endCol = rangeInfo.endCol;
				var endRow = rangeInfo.endRow;
				var sheetModel = docObj.getSheet(sheetName);
				var sheetId = sheetModel.getId();
				var rowMap = fCellsMap[sheetId];
				if(rowMap){
					var rowIds = [];
					if((startRow == null || startRow < 1) && (endRow == null || endRow < 1)){
						rowIds = sheetModel.getRowIdArray(0, -1);
					}else
						rowIds = sheetModel.getRowIdArray(startRow-1, endRow-1);
					var colIds = [];
					if((startCol == null || startCol < 1) && (endCol == null || endCol < 1)){
						colIds = sheetModel.getColIdArray(0, -1);
					}else
						colIds = sheetModel.getColIdArray(startCol-1, endCol-1);
					var length = rowIds.length;
					for(var i=0; i<length; i++){
						var rowId = rowIds[i];
						var cellMap = rowMap[rowId];
						if(cellMap){
							var colLength = colIds.length;
							for(var j=0;j<colLength;j++){
								var colId = colIds[j];
								var cell = cellMap[colId];
								if(cell){
									formulaCells.push(cell);
								}
							}
						}
					}
				}
			}
			return formulaCells;
		},
		/*
		 * Remove the cached show value of float number cells or number format cell in the loaded sheets
		 * when switch to different locale because the show value is locale sensitive
		 * With sheetName, only invalidate the show value of indicated sheet
		 * Without sheetName, invalidate the show value of whole document
		 * @return 		the list of cells which impacted cells should be recalculated when switch locale 
		 */
		/*Array*/invalidateShowValue: function(sheetName) {
			var docObj = websheet.model.ModelHelper.getDocumentObj();
			var sheets = [];
			var cellList = [];
			if(sheetName)
				sheets.push(docObj.getSheet(sheetName));
			else
				sheets = docObj.getSheets();
			
			dojo.forEach (sheets, function (sheet) {
				var rows = sheet.getRows();
				dojo.forEach(rows, function (row) {
					var cells = row._valueCells;
					for (var i = 0; i < cells.length; ++i) {
						var cell = cells[i];
						if (cell) {
							if (cell.isNumber())
								delete cell._showValue;
							if (cell.isFormula() && cell._errProp & websheet.Constant.CellErrProp.CHANGE_PER_LOCALE) {
								cell.setDirty(true);
								cellList.push(cell);
							}
						}
					}
				});
			});
			
			return cellList;
		},
		
		/*
		 * Given one list of cells, get their impacted cells and re-calculate them and then update visible rows containing those cells
		 * Broadcast for set cells
		 */
		/*void*/broadcast: function(/*Array*/cellList) {
			if (cellList.length) {
				// broadcast cell value change
				var addr = "";
				for (var i = 0; i < cellList.length; i++) {
					if (i != 0) addr += ",";
					addr += cellList[i].getAddress();
				}
				var type = websheet.Constant.EventType.DataChange;
				var source = {};
				source.action = websheet.Constant.DataChange.SET;
				source.refType = websheet.Constant.OPType.CELL;
				source.refValue = addr;
				var e = new websheet.listener.NotifyEvent(type, source);
				var editor = websheet.model.ModelHelper.getEditor();
				editor.getController().broadcast(e);
			}
		},

	// get the color css string for given cell, if cell isn't specified, use the current focus cell	   
	/*string*/getCellColorByType: function(cell, type){	
		var color;
		var styleId;
		var styleManager;
		if (!cell) {
			// get focus cell
			var editor = websheet.model.ModelHelper.getEditor();
			var sheetName = editor.getCurrentGrid().getSheetName();
			var doc = editor.getDocumentObj();
			var grid = editor.getController().getGrid(sheetName);
			styleId = doc.getCellStyleId(sheetName, grid.selection.getFocusedRow() + 1, grid.selection.getFocusedCol());
			styleManager = doc._getStyleManager();
		}else{
			// get cell's row index and column
			var rowindex = cell.getRow();
			var columnIndex = cell.getCol();
			styleId = cell._doc.getCellStyleId(cell.getSheetName(),rowindex, columnIndex);
			// get cell style id. 
			styleManager = cell._doc._styleManager;
		}
		
		var styleCode = styleManager.getStyleById(styleId);
		var color = null;
		if (styleCode)
			color = styleCode._getAttrValue(type);
		
		if (color == null || color == "null" || color.length == 0) {
			color = websheet.style.DefaultStyleCode._attributes[type];
		}
			
		return color;
	},
	
	expandBorderWidthCss: function(cssStr)
	{
		if(!cssStr) return null;
		if(cssStr.indexOf("border-width")== -1) return cssStr;
		var attrs = cssStr.toLowerCase().split(";");
		var length = attrs.length;
		var widths = [];
		for(var i = 0; i < length; i++)
		{
			if(attrs[i].indexOf("border-width")>=0)
			{
				var value = attrs[i].split(":")[1];
				value = value.replace(";", "");
				widths = value.split("px");
				attrs[i] = "";
				break;
			}
		}
		var borders = ["border-top-width","border-right-width","border-bottom-width","border-left-width"];
		length = widths.length;
		if(length == 1)
		{
			widths[1]=widths[2]=widths[3] = widths[0];
		}
		length = borders.length;
		for(var i = 0; i < length; i++)
		{
			var width = parseInt(widths[i]);
			if(width > 0)
				attrs.push(borders[i] + ":" + width + "px");
		}
		return attrs.join(";");
	},
	
	getCssStyleAttr: function(cssStr,key)
	{
		if(!cssStr) return null;
		var attrs = cssStr.toLowerCase().split(";");
		var style = null;
		var length = attrs.length;
		for(var i = 0; i < length; i++)
		{
			if(attrs[i].indexOf(key) >= 0)
			{
				style = attrs[i];break;
			}
		}
		return style;
	},
	
	getCssStyleIntValue: function(cssStr, key)
	{
		if(!cssStr) return null;
		var attrs = cssStr.toLowerCase().split(";");
		var value = null;
		var length = attrs.length;
		for(var i = 0; i < length; i++)
		{
			if(attrs[i].indexOf(key) >= 0)
			{
				value = parseInt(attrs[i].split(":")[1]);break;
			}
		}
		return value;
	},
	
	removeCssStyleAttr: function(cssStr,key)
	{
		if(!cssStr) return "";
		var attrs = cssStr.toLowerCase().split(";");
		var length = attrs.length;
		for(var i = 0; i < length; i++)
		{
			if(attrs[i].indexOf(key) >= 0)
				attrs[i] = "";
		}
		return attrs.join(";");
	},
	/*
	 * Tell if task assignment function is enabled when deployed 
	 */
	/*boolean*/isSocialEnabled: function()
	{
	    var entitlements = window["pe"].authenticatedUser.getEntitlements(); 
	    return entitlements.assignment.booleanValue;
	},
	
	/**
	 *  delete the useless attributte in every styleObject 
	 * @param styles : an array, every item in the array is a styleObject
	 * @param attr : the name of the useless style attributte want to be clear
	 */
	clearUselessStyleAttr: function(styles, attr)
	{
		if(!styles || !attr) return;
		var cnt = styles.length;
		for(var i = 0; i < cnt; i++)
		{
			var style = styles[i];
			if(style)
				delete style[attr];
		}	
	},
	/*
	 * Tell if the co-editing function is enabled when deployed
	 */
	/*boolean*/isCoeditEnabled: function()
	{
	    var entitlements = window["pe"].authenticatedUser.getEntitlements(); 
	    return entitlements.coedit.booleanValue;
	},
	/**
	 * get the actrually character count of the the string (espeicall for the non-bmp characters)
	 */
	getStringDisplayLength: function(str)
	{
		if(!str) return 0;
		var len = str.length, cnt = 0;
		for(var i=0; i<len; i++)
		{
			var c = str.charCodeAt(i);
			if(concord.i18n.utf.U16_IS_SURROGATE(c))
			{
				if(concord.i18n.utf.U16_IS_SURROGATE_LEAD(c))
					continue; // ignore the first surrogate
				else
					cnt++;
			}
			else
				cnt++;
		}
		return cnt;
	},
	/**
	 * Get the first cnt characters of the string( by considering the non-bmp characters)
	 */
	getSubString: function(str, cnt)
	{
		var i, len = str.length, n = 0;
		for( i=0; i<len; i++ )
		{
			var c = str.charCodeAt(i);
			if(concord.i18n.utf.U16_IS_SURROGATE(c))
			{
				if(concord.i18n.utf.U16_IS_SURROGATE_LEAD(c))
					continue; // ignore the first surrogate
				else
					n++;
			}
			else
				n++;
			if(n == cnt) break;
		}
		return str.substring(0,i+1);
	},
	/**
	 * truncate the given string at len,  with ellipsis "..."
	 * @param str
	 * @param len
	 */
	truncateStrWithEllipsis: function(str, len)
	{
		if(len >= this.getStringDisplayLength(str))
			return str;
		if(len > 0)
		{
			return this.getSubString(str,len) + "...";
		}
		return str;
	},
	
	findCssSheet: function(styleName, create)
	{
		if(styleName && this.cssSheets && this.cssSheets[styleName])
			return this.cssSheets[styleName];
		if(create)
		{
			var sheet;
			if(dojo.isIE && (dojo.isIE!=11) && document.createStyleSheet)
			{
				sheet = document.createStyleSheet();
				if(styleName)
				{
					// IE9, title attr is read-only...
					if(dojo.isIE < 9)
						sheet.title = styleName;
					if(this.cssSheets == null)
						this.cssSheets = {};
					this.cssSheets[styleName] = sheet;
				}
			}
			else
			{
				sheet = document.createElement('style');
				sheet.type = 'text/css';
				document.getElementsByTagName('head')[0].appendChild(sheet);
				if(this.cssSheets == null)
					this.cssSheets = {};
				this.cssSheets[styleName] = sheet;
			}
			return sheet;
		}
		return null;
	},
	
	updateCssStyle: function(css, styleName)
	{
		var sheet = this.findCssSheet(styleName);
		if(!sheet)
			return;
		if(dojo.isIE && (dojo.isIE!=11) && document.createStyleSheet)
			sheet.cssText = css;
		else{
			for(var i = sheet.childNodes.length - 1; i >= 0; i--){
				sheet.removeChild(sheet.childNodes[i]);
			}
			sheet.appendChild(dojo.doc.createTextNode(css));
		}
	},
	
	insertCssStyle: function(css, styleName)
	{
		var sheet = this.findCssSheet(styleName, true);
		if(dojo.isIE)
			sheet.cssText += css;
		else
			sheet.appendChild(dojo.doc.createTextNode(css));
	},
	
	getPtPxRatio: function()
	{
		if(this._ptPxRatio) 
			return this._ptPxRatio;
		var dummy = dojo.create("span", {style: {fontSize: "10pt", display: "none"}}, dojo.body());
		this._ptPxRatio = parseFloat(dojo.style(dummy, "fontSize")) / 10;
		dojo.destroy(dummy);
		return this._ptPxRatio;
	},
    
	parseLink: function(link){
		if(!(typeof link=="string"))
			return {type:websheet.Constant.linkType.URL};
		if(link.indexOf("[") == 0)//check filename
			return this._parseExLink(link);
		
		link = link.trim();
		
		if(link.indexOf("##") == 0)
			link = link.substr(2);
		else if(link.indexOf("#") == 0)
			link = link.substr(1);
		else//URL, but not valid.
			return {type:websheet.Constant.linkType.URL};
		
		if(link.indexOf("[") == 0)//check filename
			return this._parseExLink(link);
		else
			return this._parseLinkRef(link);
	},
	
	_parseExLink: function(link){
		var endIdx = link.indexOf("]");
		if(endIdx == -1)
			return {type:websheet.Constant.linkType.URL};
		var file = link.substring(1, endIdx);
		var fileName = pe.scene.getDocBean().getUri();
		if(file != fileName)			
			return {type:websheet.Constant.linkType.File};
		link = link.substring(endIdx + 1);
		return this._parseLinkRef(link, true);
	},
	
	_parseLinkRef: function(link, checkSheetName)
	{
		var parseRef = websheet.Helper.parseRef(link);
		var documentModel = websheet.model.ModelHelper.getDocumentObj();
		
		if(!parseRef || !parseRef.isValid()){
			var area = documentModel.getAreaManager().getRangeByUsage(link,websheet.Constant.RangeUsage.NAME);
			if(!area || !area.isValid())
				return {type:websheet.Constant.linkType.Ref};
			parseRef = area.getParsedRef();
		}
		
		if(checkSheetName && parseRef.sheetName == null)
			return {type:websheet.Constant.linkType.Ref};
		if(parseRef.sheetName && !documentModel.isSheetExist(parseRef.sheetName))
			return {type:websheet.Constant.linkType.Ref};
		if((parseRef.refMask & websheet.Constant.RefAddressType.ROW) > 0){
			var editor = websheet.model.ModelHelper.getEditor();
			var MAXROW = editor.getMaxRow();
			if(parseRef.endRow && parseRef.endRow > MAXROW)
				return {type:websheet.Constant.linkType.Ref};
		}
		if(parseRef.startRow && parseRef.startRow > MAXROW)
			return {type:websheet.Constant.linkType.Ref};		
	
		return {parsedRef: parseRef};
	},
	
	/**
	 * 
	 * @param data
	 * @param rangeJson
	 * @param rowIndex
	 * @param colIndex
	 * @param from
	 * @param to
	 * @param columns optional every row with the same column number, matrix is complete even though the cell value is empty string
	 */
    formatRawValueInJson: function(data, rangeJson, rowIndex, colIndex, from, to, columns){
    	for(var i = from; i <= to; i++)
    	{
    		var row = data[i];
    		var rowNumber = rowIndex + i + "";
    		var rowJson = {};
    		rangeJson[rowNumber] = {};
    		rangeJson[rowNumber].cells = rowJson;
    		var clen = row.length;
    		if(columns)
    			clen = columns;
    		var wshelper = websheet.Helper;
    		for(var j = 0; j < clen; j++)
    		{
    			var colName = websheet.Helper.getColChar(j + colIndex);
    			if(row.length >= j + 1)
    			{
    				var value = row[j];
    				var parseResult = null;
    				if(value && value.indexOf("=") == 0)
    					value = "'" + value;
    				// FIXME, some too long value, we just not to recognize it, just take it as a string.
    				else if(value.length < 30) {
    					parseResult = websheet.i18n.numberRecognizer.parse(value, false, true);
    					if (parseResult.isNumber && (isNaN(parseResult.fValue) || !isFinite(parseResult.fValue))) {
    						// fix parseResult if we get nothing from it
    						parseResult.fValue = value;
    						parseResult.isNumber = false;
    						parseResult.percentageNum = 0;
    						parseResult.formatType = websheet.Constant.FormatType["STRING"];
    					}
    				}
    				
    				var json = {v: value};
    				if(parseResult)
    				{
    					if(parseResult.formatType !== websheet.Constant.FormatType["STRING"]){
	    					var formatType = parseResult.formatType;
	    					if(formatType != websheet.Constant.FormatType["NUMBER"] && formatType != websheet.Constant.FormatType["BOOLEAN"])
	    					{
								var format = websheet.i18n.Number.getDefaultFormatForShowValue(formatType, parseResult.currencySymbol);
								if(format && format[websheet.Constant.Style.FORMATCODE])
									json.style = {format: format};
	    					}
	    					
	    					if(formatType == websheet.Constant.FormatType["NUMBER"] ||
	    							formatType == websheet.Constant.FormatType["SCIENTIFIC"] ||
	    							formatType == websheet.Constant.FormatType["FRACTION"]) {
	    						// if parse result is all kinds of number, need to take care of very large number, convert it to string
	    						json.v = wshelper.convertToStringForBigNumber(parseResult.fValue);;
	    					} else if (formatType == websheet.Constant.FormatType["BOOLEAN"]) {
	    						json.v = (parseResult.fValue != 0);
	    					} else {
	    						json.v = parseResult.fValue;
	    					}
    					} else {
    						// for single quote started string, it should be showed, so we need prefix with another single quote
    						if(value && value.indexOf("'") == 0){
    							json.v = "'" + value;
    						}
    					}
    				}
    				rowJson[colName] = json;
    			}
    			else
    			{
    				rowJson[colName] = {v: ""};
    			}
    		}
    	}
    },
    
	isJsonHasBorderStyle: function(json) {
		return this.isJSONContainValue(json, function(c) {
			var s = c.style;
			if (s) {
				return s.id || s[websheet.Constant.Style.BORDER] || s[websheet.Constant.Style.BORDERCOLOR] || s[websheet.Constant.Style.BORDERSTYLE];
			} else {
				return false;
			}
		});
	},

	// isTop = true means the given index is the top row or the left column
	/*void*/_trimBorderStyle: function(cellsJson, enlargedCellsJson, bRow, index, isTop) {
		var wscnt = websheet.Constant.Style;
		var BorderColor = wscnt.BORDERCOLOR;
		var BorderStyle = wscnt.BORDERSTYLE;
		var Border = wscnt.BORDER;
		if (bRow) {
			var rowJson = cellsJson[index];
			if(!rowJson) {
				return;
			}
			var newRowJson = {cells: {}};
			for (var id in rowJson.cells) {
				var cellJson = rowJson.cells[id];
				var style = cellJson.style;
				if (!style) continue;
				if (style[BorderColor] || style[BorderStyle] || style[Border]) {
					var newStyle = {};
					if (style[Border]) {
						var tb = style[Border][wscnt.BORDER_TOP];
						var bb = style[Border][wscnt.BORDER_BOTTOM];
						var hasBorder = false;
						if (isTop && bb && bb != "0") {
							newStyle[Border] = {};
							newStyle[Border][wscnt.BORDER_BOTTOM] = "";
							hasBorder = true;
						} else
						if (!isTop && tb && tb != "0") {
							newStyle[Border] = {};
							newStyle[Border][wscnt.BORDER_TOP] = "";
							hasBorder = true;
						}
						if(hasBorder){
							if (style[BorderColor]) {
								var tc = style[BorderColor][wscnt.BORDER_TOP_COLOR];
								var bc = style[BorderColor][wscnt.BORDER_BOTTOM_COLOR];
								if (isTop && bc) {
									// if true, then collect undo and merge to zheng shijian, do not delete from cellsJson
									newStyle[BorderColor] = {};
									newStyle[BorderColor][wscnt.BORDER_BOTTOM_COLOR] = "";
								}
								if (!isTop && tc) {
									newStyle[BorderColor] = {};
									newStyle[BorderColor][wscnt.BORDER_TOP_COLOR] = "";
								}
							}
							if (style[BorderStyle]) {
								var st = style[BorderStyle][wscnt.BORDER_TOP_STYLE];
								var sb = style[BorderStyle][wscnt.BORDER_BOTTOM_STYLE];
								if (isTop && sb) {
									newStyle[BorderStyle] = {};
									newStyle[BorderStyle][wscnt.BORDER_BOTTOM_STYLE] = "";
								}
								if (!isTop && st) {
									newStyle[BorderStyle] = {};
									newStyle[BorderStyle][wscnt.BORDER_TOP_STYLE] = "";
								}
							}
							newRowJson.cells[id] = {style: newStyle};
							if(cellJson.rn > 0)
								newRowJson.cells[id].rn = cellJson.rn;
							if(isTop)
								enlargedCellsJson.startRow = index;
							else
								enlargedCellsJson.endRow = index;
						}
					}
					
				}
			}
			for (var id in newRowJson.cells){
				enlargedCellsJson[index] = newRowJson;
				return ;
			}
			delete cellsJson[index];
			if(rowJson.rn > 0){
				rowJson.rn = rowJson.rn - 1;
				isTop && (cellsJson[index + 1] = rowJson);
			}
		} else {
			var strIndex = websheet.Helper.getColChar(index);
			var isLeft = isTop;
			for (var r in cellsJson) {
				var rowJson = cellsJson[r];
				var newRowJson = enlargedCellsJson[r];
				var cellJson = rowJson.cells[strIndex];
				if (cellJson) {
					var style = cellJson.style;
					if (!style) continue;
					var found = false;
//					delete rowJson.cells[index].style;
					if (style[BorderColor] || style[BorderStyle] || style[Border]) {
						var newStyle = {};
						var hasBorder = false;
						if (style[Border]) {
							var bl = style[Border][wscnt.BORDER_LEFT];
							var br = style[Border][wscnt.BORDER_RIGHT];
							if (isLeft && br && (br != "0")) {
								newStyle[Border] = {};
								newStyle[Border][wscnt.BORDER_RIGHT] = "";
								hasBorder = true;
							} else 
							if (!isLeft && bl && (bl != "0")) {
								newStyle[Border] = {};
								newStyle[Border][wscnt.BORDER_LEFT] = "";
								hasBorder = true;
							}
							if(hasBorder) {
								if (style[BorderColor]) {
									var lc = style[BorderColor][wscnt.BORDER_LEFT_COLOR];
									var rc = style[BorderColor][wscnt.BORDER_RIGHT_COLOR];
									if (isLeft && rc) {
										newStyle[BorderColor] = {};
										newStyle[BorderColor][wscnt.BORDER_RIGHT_COLOR] = "";
									} else
									if (!isLeft && lc) {
										newStyle[BorderColor] = {};
										newStyle[BorderColor][wscnt.BORDER_LEFT_COLOR] = "";
									}
								}
								if (style[BorderStyle]) {
									var ls = style[BorderStyle][wscnt.BORDER_LEFT_STYLE];
									var rs = style[BorderStyle][wscnt.BORDER_RIGHT_STYLE];
									if (isLeft && rs) {
										newStyle[BorderStyle] = {};
										newStyle[BorderStyle][wscnt.BORDER_RIGHT_STYLE] = "";
									} else
										if (!isLeft && ls) {
											newStyle[BorderStyle] = {};
											newStyle[BorderStyle][wscnt.BORDER_LEFT_STYLE] = "";
										}
								}
								if(!newRowJson){
									enlargedCellsJson[r] = newRowJson = {cells:{}};
									if(rowJson.rn > 0)
										newRowJson.rn = rowJson.rn;
								}
								newRowJson.cells[strIndex] = {style: newStyle};
								found = true;
								if(isLeft)
									enlargedCellsJson.startCol = index;
								else
									enlargedCellsJson.endCol = index;
							}
						}
					}
					if (!found){
						delete rowJson.cells[strIndex];
						if(cellJson.rn > 0){
							cellJson.rn = cellJson.rn - 1;
							isLeft && (rowJson.cells[websheet.Helper.getColChar(index + 1)] = cellJson);
						}
					}
				}
			}
		}
	},
	
	/**
	 * return boolean	: return true if all the columns from 1 to scIndex are all hidden, else false
	 * @param sheetName
	 * @param scIndex	: 1-based
	 */
	checkTopHiddenCols: function(sheetName, scIndex)
	{
		var helper = websheet.model.ModelHelper;
		var colsArray = helper.getCols({sheetName:sheetName, startCol:1, endCol:scIndex },true,true).data;
		
		var len = colsArray.length;
		var count = scIndex;
		//there are some visible columns
		if(len < count) return false;
		
		for(var i = 0; i < len; i++)
		{
			var col = colsArray[i];
			if(!col || col.isVisible())
			{
				return false;
			}	
		}	
		return true;
	},
	/*
     * 
     */
    checkTopBoundaryHiddenRows:function(startRowIndex){	
		var helper = websheet.model.ModelHelper;
		var rangeInfo = {};
		rangeInfo.sheetName = helper.getEditor().getCurrentGrid().sheetName;
		
		if (startRowIndex == 0)
			return false;	//the first row should be shown because it's selected.
			
		//check if first item and following are hidden
		rangeInfo.startRow = 1 ;
		rangeInfo.endRow = startRowIndex + 1;
		var rowArray = helper.getRows(rangeInfo, true, true);
		
		if (rowArray == null)
			return false;	//no sheet exception.
			
		/**
		 * The rows between indexing have not been defined in model.
		 * that means these rows have not been hidden.
		 */ 
		 var length = rowArray.data.length;
		 var i=0;
		 for(i = 0; i <= startRowIndex - length; i++){
		 	rowArray.data.push(null); //fill null row
		 }
			
		for(i = 0; i < rowArray.data.length - 1; i++){//bypass itself
			var row = rowArray.data[i];
			if((row == undefined) || (row && row.isVisibility()) ){
				return false; //has un-continuious unhidden rows
			}
		} 
		
		return true;//has continuious hidden rows
	},
	
	/**
	 * return true if the cIndex is the last render column and has been hidden
	 * @param sheetName
	 * @param cIndex : 1-based
	 * @returns
	 */
	isLastHiddenCol: function(sheetName, cIndex)
	{
		if (typeof cIndex == "string") {
			cIndex = websheet.Helper.getColNum(cIndex);
		}
        var grid = websheet.model.ModelHelper.getEditor().getController().getGrid(sheetName);
        if (!grid) {
        	return false;
        }
        if (cIndex == websheet.Constant.MaxColumnIndex && (grid.geometry.colWidth(cIndex) <= 0)) {
        	return true;
        }
		return false;
	},
    
    setSelectable: function(node, selectable){
    	if(dojo.isChrome){
    		node.style.WebkitUserSelect = selectable ? "auto" : "none";
    	}else{
    		dojo.setSelectable(node, selectable);
    	}
    },
    
    /*
     * Given the focus cell, get its increased or decreased decimal place 
     */
    /*Format*/getDecimalFormat: function(editor, /*boolean*/bIncrease) {
    	var code, codes, place = 0, leadPart, remainPart, bScientific, index = 0; // > 0 by default
    	var wcs = websheet.Constant.Style;
    	var selectInfo = editor.getSelectRectInfo();
    	var row = selectInfo.selectRect.focusRow + 1;
    	var col = selectInfo.selectRect.focusCol;
    	var sheetName = selectInfo.sheetName;
    	var docObj = editor.getDocumentObj();
    	var cell = docObj.getCell(sheetName, row, col, websheet.Constant.CellType.MIXED, true);
    	if (!cell || !cell.isNumber()) return null;
		
    	var style = websheet.model.ModelHelper.getStyleCode(sheetName, row, col);
    	var format = websheet.Helper.getFormat(style);
    	if (format) {
    		var cats = format[wcs.FORMATTYPE].split(";");
    		if (cats.length > 1) {
    	    	var cv = cell.getCalculatedValue();
    			if (cv < 0) index = 1;
    			else if (cv == 0) index = 2;
    		}
    		
    		var type = cats[index];
    		if (type != "number" && type != "currency" && type != "percent" && type != "scientific")
    			return null;
    		
    		codes = format[wcs.FORMATCODE].split(";");
    		code = codes[index];
    		if (!code)
    			return null;

    		var m = websheet.Helper.numberFormatCode.exec(code);
    		if (!m) return null;
    		
    		if (m.index != 0)
    			leadPart = code.substring(0, m.index);
    		if (m.index + m[0].length < code.length)
    			remainPart = code.substring(m.index + m[0].length);
    		
    		code = m[0];
    		
    		var n = code.indexOf(".");
    		if (n != -1) 
    			place = code.substring(n+1).length;
    	} else {
    		var editor = websheet.model.ModelHelper.getEditor();
    		var locale = editor.scene.getLocale();
    		var bundle = dojo.i18n.getLocalization("dojo.cldr", "number", locale);
    		var decimal = bundle["decimal"];
    		// column model doesn't have number formatting, it is safe here to use getShowValue w/o column style id
        	var value = cell.getShowValue();
        	
        	var t = value.split("E"); // scientific expression could be either "E+" or "E-"
        	if (t.length == 2) {
        		value = t[0];
        		remainPart = "E+00";
        		bScientific = true;
        	}
        	
    		var n = value.indexOf(decimal);
    		if (n != -1)
    			place = value.substring(n+1).length;
    	}
    	
    	if (bIncrease) ++place;
    	else --place;

    	if (place < 0 || place == 31) return null; // maxinum place is 30

    	if (format) {
    		var n = code.indexOf(".");
    		if (bIncrease) {// append decimal if necessary
    			if (n == -1) code = code.concat(".");
    			code = code.concat("0");
    		} else { // remove decimal if place is 0
    			if (n != -1) { // n == -1 should never happen
    			var pos = place == 0 ? n : n + 1 + place;
    			code = code.substring(0, pos);
    			}
    		}
    		
    		if (leadPart) code = leadPart.concat(code);
    		if (remainPart) code = code.concat(remainPart);	
    		codes[index] = code;
    		code = codes.join(";");
    	} else {
    		if (place == 0) code = "###0";
    		else code = "###0.";
    		
    		for (var i = 0; i < place; i++)
    			code = code.concat("0");
    		
    		if (remainPart)
    			code = code.concat(remainPart);
    	}
    	
    	if (!format) {
    		format = {};
    		format[wcs.FORMATTYPE] = "number";
    		if (bScientific)
    			format[wcs.FORMATTYPE] = "scientific";
    	}
    	format[wcs.FORMATCODE] = code;
    	
    	return format;
    },
    
    //rgb_value is like #FF00FF
    getGrayFromRGB: function(rgb_value){
    	if (typeof rgb_value == "string" && rgb_value.length == 7){
    		var red = parseInt("0x"+rgb_value.substring(1,3));
    		var green = parseInt("0x"+rgb_value.substring(3,5));
    		var blue = parseInt("0x"+rgb_value.substring(5));
    		if (red!=NaN && green != NaN && blue != NaN)
    			return red*0.299+green*0.587+blue*0.114;
    	}
    	return null; 
    },
    
    /*boolean*/_isTextFormat: function(formatCode){
    	if (formatCode == null)
    		return false;
		var replaced = formatCode.replace(/([\\\\].)/ig,"");
		return replaced.match(/@/) != null ? true : false;
	},
    
	/*color*/getFormatColor: function(calcuatedValue, formatColor, formatCode, isString, type) {
		/**
		 * Copy from Formatter.js, used to get cell format color.
		 * */
    	var tmpValue = calcuatedValue;
    	if (!formatColor) return null;
		var fColorArray = formatColor.split(";"); //"positive;negative;zero;text"
		var lenFC = fColorArray.length;
		var fColor = fColorArray[0]; //"[blue]#.0" or "[blue]@@"
		
		var fCodeArray = formatCode.split(";");
		var lenFCode = fCodeArray.length;
		
		if (isString || (type >> 3) == websheet.Constant.ValueCellType.BOOLEAN){
			// for string or boolean type (will be formatted to TRUE/FALSE)
			if((lenFCode == 1 && formatCode == "")	// for general format code, also get the last format color
					|| this._isTextFormat(fCodeArray[lenFCode - 1]))
				fColor = fColorArray[lenFC - 1]; 	
			else
				fColor = null;
		}
		else if(tmpValue > 0){
			if(lenFC > 0)
				fColor = fColorArray[0];
		}
		else if(tmpValue < 0){
			if(lenFC > 1 && !this._isTextFormat(fCodeArray[1]))
				fColor = fColorArray[1];
		}		
		else if(tmpValue == 0){
			if(lenFC > 2 && !this._isTextFormat(fCodeArray[2]))
				fColor = fColorArray[2];
		}
		
		return fColor;
    },
    
	getFilterRowNum: function(sheetName, startRowIndex, endRowIndex)
	{
		var filteredRowNum = 0;
		var filterConstant = websheet.Constant.ROW_VISIBILITY_ATTR.FILTER;
		
		var docObj = websheet.model.ModelHelper.getDocumentObj();
		var sheetModel = docObj.getSheet(sheetName);
		var pos = sheetModel.getRowPosition(startRowIndex,true);
		if(pos < 0)
			pos = -(pos + 1);
		var rows = sheetModel._rows;
		var length = rows.length;
		for(var i = pos; i < length; i++)
		{
			var rowModel = rows[i];
			var srIndex = rowModel.getIndex();
			if(srIndex > endRowIndex) break;
			if(rowModel._visibility == filterConstant)
			{
                filteredRowNum++;
                var rowRepeat = rowModel._repeatedNum;
                if (rowRepeat != null) 
                {
                	if( rowRepeat + srIndex > endRowIndex) 
                	{
                		filteredRowNum += endRowIndex - srIndex;
                		break;
                	}
                	else
                		filteredRowNum += rowRepeat;   
                }
			}
		}
		return filteredRowNum;
	},

	/*
	 *  return true if the range contains a filtered row(s) and the number of discontinous filtered ranges
	 *   is less than the threshold. Otherwise, return false.
	 */
	hasFilteredRows: function(rangeInfo) {
		var editor = websheet.model.ModelHelper.getEditor();
		var filter = editor.getAutoFilterHdl().getFilter(rangeInfo.sheetName);
		if (filter && Object.keys(filter._rules).length > 0) {
			var count = 0;
			var preIdx = 0;
	    	var iter = new websheet.model.RowIterator(rangeInfo, websheet.Constant.RangeIterType.OPTIMIZEVALUE);
			iter.iterate(function(row, index) {
				if(row.isFiltered()){
					if (!preIdx)
						preIdx = index;
				} else {
					if (preIdx) {
						count++;
						preIdx = 0;
					}
				}
				if (count > websheet.Constant.MaxFilteredRanges) {
					count = 0;
					return false;
				}
				return true;
			});
			return count > 0 ? true : false;
		} else {
			return false;
		}
	},

	getImpactedRange4InsertOrDel: function(bDelete, bShiftUpDown, addr){
		var parsedRef = websheet.Helper.parseRef(addr);
	   	var rowIndex = parsedRef.startRow;
		var endRowIndex = parsedRef.endRow;
		var colIndex = parsedRef.startCol;
		var endColIndex = parsedRef.endCol;
	 
		var rowNum = endRowIndex - rowIndex + 1;
	   	var colNum = endColIndex - colIndex + 1;
   	
	   	var docObj = websheet.model.ModelHelper.getDocumentObj();
	   	var sheet = docObj.getSheet(parsedRef.sheetName);
	   	if(bShiftUpDown){
	   		var maxRowIndex = websheet.model.ModelHelper.getMaxRowIndex(sheet, colIndex, endColIndex, false);
	   		endRowIndex = endRowIndex < maxRowIndex ? maxRowIndex : endRowIndex;
			if(!bDelete)
				endRowIndex += rowNum;
			if(endRowIndex > this.maxRow)
				endRowIndex = this.maxRow;
	   	}else{
	   		var maxColIndex4Show= websheet.model.ModelHelper.getMaxColIndex4Show(parsedRef.sheetName, rowIndex, endRowIndex);
	   		endColIndex = endColIndex < maxColIndex4Show ? maxColIndex4Show : endColIndex;
	   		var cols = sheet._columns;
	   		var maxColIndex = 1;
	   		for(var i = cols.length - 1; i >= 0; i--){
	   			var col = cols[i];
	   			if(col._styleId != null)
	   			{
	   				maxColIndex = col.getIndex();
	   				if(col.getRepeatedNum() < websheet.Constant.ThresColRepeatNum)
	   					maxColIndex += col.getRepeatedNum();
	   				break;
	   			}
	   		}
	   		endColIndex = endColIndex < maxColIndex ? maxColIndex : endColIndex;
	   		
	   		if(!bDelete)
	   			endColIndex = endColIndex + colNum;
	   		var maxColIndex = websheet.Constant.MaxColumnIndex;
	   		endColIndex = endColIndex > maxColIndex ? maxColIndex : endColIndex;
	   	}
	   	var refValue = websheet.Helper.getAddressByIndex(parsedRef.sheetName, rowIndex, websheet.Helper.getColChar(colIndex),null,endRowIndex,websheet.Helper.getColChar(endColIndex));
	    return refValue;
   },
   
	
	/*
	 * Look up in the given column and get the list of value of non-empty adjacent cells
	 * for the cell: sheetName, rowIndex and colIndex 
	 */
	/*array*/getTypeAheadCellList: function(sheetName, rowIndex, colIndex) {
		var docObj = websheet.model.ModelHelper.getDocumentObj();
		var sheet = docObj.getSheet(sheetName);
		var pItems = this._getAdjacentRowItems(sheet, rowIndex, colIndex, -1);
		var nItems = this._getAdjacentRowItems(sheet, rowIndex, colIndex, 1);
		return pItems.concat(nItems);
	},

    /*array*/_getAdjacentRowItems: function(sheet, rowIndex, colIndex, direction)
    {
    	// rowIndex is 0 based;
    	if(direction < 0)
    		rowIndex = rowIndex - 1;
    	else
    		rowIndex = rowIndex + 1;
    	
    	if(rowIndex < 0)
    		return [];
    	
    	// getRow is 1 based;
    	var prevRow = sheet.getRow(rowIndex + 1, true);
    	if(!(prevRow && prevRow._valueCells.length))
    		return [];
    	
    	var items = [];
    	var index = dojo.indexOf(sheet._rows, prevRow);
    	
    	while(prevRow != null)
    	{
    		var cell = prevRow._valueCells[colIndex - 1];
        	if (!cell || !cell._calculatedValue || cell.isNumber())
            {
                break;
            }
        	else
        	{
        		var value = cell._calculatedValue;
        		// do not count number (formula, or with "'" text number)
        		// isNaN will return false for empty string, add additional code for check that.
        		if(!cell._error && (isNaN(value) || (dojo.isString(value) && dojo.trim(value).length == 0)))
        		{
        			items.push(value + "");
        		}
        		
        		prevRow = null;
        		
    			if(direction < 0)
    			{
    				rowIndex = rowIndex - 1;
    				index = index - 1;
    			}
    			else
    			{
    				rowIndex = rowIndex + 1;
    				index = index + 1;
    			}
    			
    			if(rowIndex < 0 || index < 0)
    	    		break;
    			
        		prevRow = sheet._rows[index];
        		// get row id by index
        		var prevRowId = sheet.getRowId(rowIndex);
        		if(!(prevRow && prevRowId && prevRow._id == prevRowId))
        			prevRow = null;
        	}
    	}
    	
    	return items;
    },
    
    /*Font String*/fontFallback: function (font) {
		//fall back "Helvetica" font family to "Arial" on non-mac-machine,
		//'Helvetica Neue Light','Helvetica Neue', 'Helvetica','Arial'. 
    	var lowerCaseFont = (font || "").toLocaleLowerCase();
    	if (lowerCaseFont.indexOf("helvetica") == -1 && lowerCaseFont.indexOf("calibri") == -1) {
    		return font;
    	}
    	var result = lowerCaseFont.indexOf("calibri light");
		if (result >= 0) {
			return font
					.replace(/\'?Calibri Light\'?/g, "'Calibri Light',Calibri,Carlito,'Helvetica Neue',HelveticaNeue,Helvetica,Roboto,Arial,sans-serif");
		}
		var result = lowerCaseFont.indexOf("calibri");
		if (result >= 0) {
			return font
					.replace(/\'?Calibri\'?/g, "Calibri,Carlito,'Helvetica Neue',HelveticaNeue,Helvetica,Roboto,Arial,sans-serif");
		}
    	var result = lowerCaseFont.indexOf("helvetica neue light");
		if (result >= 0) {
			return font
					.replace(
							/\'?Helvetica Neue Light\'?/i,
							"'Helvetica Neue Light','HelveticaNeueLight','HelveticaNeue-Light','Helvetica Neue','HelveticaNeue',Helvetica,Roboto,Arial,sans-serif");
		}
		var result = lowerCaseFont.indexOf("helvetica neue black condensed");
		if (result >= 0) {
			return font
					.replace(
							/\'?Helvetica Neue Black Condensed\'?/i,
							"'Helvetica Neue Black Condensed','HelveticaNeueBlackCondensed','HelveticaNeue-Black-Condensed','HelveticaNeueBlack','HelveticaNeue-Black','Helvetica Neue Black','Helvetica Neue','HelveticaNeue',Helvetica,Roboto,Arial,sans-serif");
		}
		var result = lowerCaseFont.indexOf("helvetica neue black");
		if (result >= 0) {
			return font
					.replace(
							/\'?Helvetica Neue Black\'?/i,
							"'Helvetica Neue Black','HelveticaNeueBlack','HelveticaNeue-Black','Helvetica Neue','HelveticaNeue',Helvetica,Roboto,Arial,sans-serif");
		}
		var result = lowerCaseFont.indexOf("helvetica neue heavy");
		if (result >= 0) {
			return font
					.replace(
							/\'?Helvetica Neue Heavy\'?/i,
							"'Helvetica Neue Heavy','HelveticaNeueHeavy','HelveticaNeue-Heavy','Helvetica Neue','HelveticaNeue',Helvetica,Roboto,Arial,sans-serif");
		}
		var result = lowerCaseFont.indexOf("helvetica neue bold condensed");
		if (result >= 0) {
			return font
					.replace(
							/\'?Helvetica Neue Bold Condensed\'?/i,
							"'Helvetica Neue Bold Condensed', 'HelveticaNeueBoldCondensed', 'HelveticaNeue-Bold-Condensed', 'HelveticaNeueBold', 'HelveticaNeue-Bold', 'Helvetica Neue Bold', 'Helvetica Neue','HelveticaNeue', Helvetica,Roboto,Arial,sans-serif");
		}
		var result = lowerCaseFont.indexOf("helvetica neue bold");
		if (result >= 0) {
			return font
					.replace(
							/\'?Helvetica Neue Bold\'?/i,
							"'Helvetica Neue Bold','HelveticaNeueBold','HelveticaNeue-Bold','Helvetica Neue','HelveticaNeue',Helvetica,Roboto,Arial,sans-serif");
		}

		var result = lowerCaseFont.indexOf("helvetica neue medium");
		if (result >= 0) {
			return font
					.replace(
							/\'?Helvetica Neue Medium\'?/i,
							"'Helvetica Neue Medium','HelveticaNeueMedium','HelveticaNeue-Medium','Helvetica Neue','HelveticaNeue',Helvetica,Roboto,Arial,sans-serif");
		}
		var result = lowerCaseFont.indexOf("helvetica neue thin");
		if (result >= 0) {
			return font
					.replace(
							/\'?Helvetica Neue Thin\'?/i,
							"'Helvetica Neue Thin','HelveticaNeueThin','HelveticaNeue-Thin','Helvetica Neue','HelveticaNeue',Helvetica,Roboto,Arial,sans-serif");
		}
		var result = lowerCaseFont.indexOf("helvetica neue ultralight");
		if (result >= 0) {
			return font
					.replace(
							/\'?Helvetica Neue UltraLight\'?/i,
							"'Helvetica Neue UltraLight','HelveticaNeueUltraLight','HelveticaNeue-UltraLight','Helvetica Neue','HelveticaNeue',Helvetica,Roboto,Arial,sans-serif");
		}
		
		var result = lowerCaseFont.indexOf("helvetica neue");
		if (result >= 0) {
			return font.replace(/\'?Helvetica Neue\'?/g, "'Helvetica Neue',HelveticaNeue,Helvetica,Roboto,Arial,sans-serif");			
		} else {
			if (lowerCaseFont.indexOf("'") == -1) {
				//wrap font name with single quote, to make browser recgnize font such as 'HelveticaNenueLT STL 75Pro'
				font = "'" + font + "'";
			}
			return font + ",'Arial'";
		}
		return font;
    },
    
    setLocalStorageItem: function(prefix,withDocUri, withUserName, value)
    {
    	var key = prefix + (withDocUri ?  "_"+DOC_SCENE.uri : "") + (withUserName ? "_"+pe.authenticatedUser.getName(): "");
    	localStorage.setItem(key, value);
    },
    
    getLocalStorageItem: function(prefix,withDocUri, withUserName)
    {
    	var key = prefix + (withDocUri ? "_"+DOC_SCENE.uri : "") + (withUserName ? "_"+pe.authenticatedUser.getName(): "");
    	return localStorage.getItem(key);
    },

	normalizeTextWatermark : function() {
		var watermark = window.g_watermark && window.g_watermark.text_watermark ? dojo.clone(window.g_watermark.text_watermark) : {};
		
		// text
		if (watermark.text && watermark.text.trim().length != 0) {
			if (watermark.text.indexOf("$") > -1) {
				var user = window.g_authUser && window.g_authUser.disp_name ? window.g_authUser.disp_name : "";
				var time = (new Date()).toLocaleDateString();
				watermark.text = dojo.string.substitute(watermark.text, {user: user, time: time});
			}
		} else {
			watermark.text = "DRAFT";
		}

		// font "90px Arial"
		var size = watermark.size && parseInt(watermark.size);
		size = size ? (size < 36 ? 36 : (size > 144 ? 144 : size)) : 90;
		var px = Math.round(size * websheet.Utils.getPtPxRatio());
		watermark.font = px + "px " + (watermark.font ? watermark.font: "Arial");
		watermark.size = px;

		// hex color 
		if (!watermark.color || !/^#[0-9A-F]{6}$/i.test(watermark.color)) {
			watermark.color = "#D2D2D2"; // GRID_LINE_COLOR
		}
		
		// opacity
		var opacity = watermark.opacity && parseFloat(watermark.opacity);
		if (!opacity || opacity <= 0 || opacity > 1)
			watermark.opacity = 0.5;	

		// layout
		watermark.diagonal = !watermark.diagonal || watermark.diagonal.toLowerCase() == "true";

		return watermark;
	}
};