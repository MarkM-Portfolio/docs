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

dojo.provide("websheet.event.undo.RowEvent");
dojo.require("websheet.event.undo.Range");
dojo.require("websheet.event.undo.SetCellEvent");

dojo.declare("websheet.event.undo.RowEvent",websheet.event.undo.Event,{
	_rangeIdList: null, 
	_formulaCellEvents: null, // keep the info of formula in the josnEvent.data.rows
	_needCheckFormula: false,
	_rows: null,    // to keep the info in the josnEvent.data.rows
	_rowsId2JsonMap: null, // this is a back up, for example , if user A set 2:4 row style,
	                        // then delete 4, undo twice, for the undo of set style could be generate, need it
	_type: null,
	
	constructor: function(jsonEvent,idManager)
	{
		dojo.mixin(this, jsonEvent);
		if(jsonEvent.data && jsonEvent.data.rows)
		{
			this._rows = [];
			this._rangeIdList = [];
			this._formulaCellEvents = [];
			this._rowsId2JsonMap = {};
			this.transformData2Id();
		}
		if(jsonEvent.data && jsonEvent.data.style && !jsonEvent.data.bR)
		{
			this._type = websheet.Constant.DATA_TYPE.STYLE;
		}
		else if(!jsonEvent.data || !jsonEvent.data.rows)
		{
			this._type = websheet.Constant.DATA_TYPE.NONE;
		}
	},
	
	getRowRangeIndex : function()
	{
		var idRange = this.refTokenId.getIdRange();
		var sheetId = this.refTokenId.getSheetId();
		var rowRangeIndex = [];
		for(var i = 0 ; i < idRange.length; i++)
		{
			var rIndex = this._idManager.getRowIndexById(sheetId,idRange[i]);
			if(rIndex != -1) rIndex++;
			rowRangeIndex.push(rIndex);
		}
		return rowRangeIndex;
	},
	
	/*
	 * the row range may split inot several new range,
	 * for example ,the 1:5 may become 1:2, 4:6
	 */
	getUpdatedRowRange: function()
	{
		var rowRangeIndex = this.getRowRangeIndex();
		var newRowRange = [];
		//find the first valid row index
		var i = 0;
		for(; i < rowRangeIndex.length; i++)
		{
			if(rowRangeIndex[i] != -1) break;
		}
		if(i == rowRangeIndex.length) return newRowRange;
		var srIndex = rowRangeIndex[i];
		var erIndex = srIndex;
		for(i=i+1; i < rowRangeIndex.length; i++)
		{
			if(rowRangeIndex[i] != -1) 
			{
				if(rowRangeIndex[i] == erIndex +1)
				{
					erIndex = rowRangeIndex[i];
				}else{
					var item = {};
					item.startRow = srIndex;
					item.endRow = erIndex;
					newRowRange.push(item);
					srIndex = rowRangeIndex[i];
					erIndex = srIndex;
				}
			}
		}
		var item = {};
		item.startRow = srIndex;
		item.endRow = erIndex;
		newRowRange.push(item);
		
		return newRowRange;
	},
	
	transformCells2Id: function(srIndex,jCells)
	{
		var cells = {};
		if(jCells)
		{
			var sheetName  = this.getSheetName();
			var sheetId = this.refTokenId.getSheetId();
			var msgTransformer = this.getMsgTransformer();
			for(var colIndex in jCells)
			{
				var jCell = jCells[colIndex];
				if(this._needCheckFormula && this.isFormulaCell(jCell))
				{
					var cRefValue=websheet.Helper.getCellAddr(sheetName, srIndex, colIndex);
					var attr = {v: jCell.v};
					if (jCell.tarr) {
						attr.tarr = jCell.tarr;
					}
					if(jCell.style)
						attr.style = jCell.style;
					if(jCell.cs) // colspan
						attr.cs = jCell.cs;
					var msg = new websheet.event.SetCell(cRefValue,attr).getMessage();
					var jCellEvent = msg.updates[0];
					var idManager = this.bTrans ? this._idManager : null;
					var cEvent = new websheet.event.undo.SetCellEvent(jCellEvent,idManager);
					this._formulaCellEvents.push(cEvent);
				}
				else
				{
					var iSCIndex = websheet.Helper.getColNum(colIndex);
					var repeatedNum = jCell.rn ? parseInt(jCell.rn):0;
					if(repeatedNum == 0)
					{
						var cId = this._idManager.getColIdByIndex(sheetId,iSCIndex-1,true);
//						cells[cId] = websheet.Helper.cloneJSON(jCell);
						//just one cell use it, do not need clone
						cells[cId] = jCell;
					}
					else
					{
						var iECIndex = iSCIndex + repeatedNum;
						iECIndex = iECIndex > websheet.Constant.MaxColumnIndex ? websheet.Constant.MaxColumnIndex : iECIndex;
						var strECIndex = (repeatedNum == 0)? colIndex : websheet.Helper.getColChar(iECIndex);
						var address = colIndex + ":" + strECIndex;
						var range = new websheet.event.undo.Range(address,sheetName,this._idManager);
						var rangeId = msgTransformer.addRange(range,this.bTrans);
						this._rangeIdList.push(rangeId);
						cells[rangeId] = websheet.Helper.cloneJSON(jCell);
					}
				}
			}
		}
		return cells;
	},
	
	isFormulaCell: function(jCell)
	{
		if(jCell.v)
		{
			return websheet.parse.FormulaParseHelper.isFormula(jCell.v);
		}
		return false;
	},
	
	_isExpandRowsMap: function()
	{
		return true;
	},
	
	transformData2Id: function()
	{
		var jsonRowsMap = this.jsonEvent.data.rows;
		var sheetName  = this.getSheetName();
		var msgTransformer = this.getMsgTransformer();
		
		this._type = websheet.Constant.DATA_TYPE.MAP;
		this._needCheckFormula = true;
		
		if(this.action == websheet.Constant.Event.ACTION_INSERT)
		{
			this._transformData2Id(jsonRowsMap);
			return;
		}
		var sheetId = this.refTokenId.getSheetId();
		var bExpand = this._isExpandRowsMap();
		for(var rIndex in jsonRowsMap)
		{
			var jRow = jsonRowsMap[rIndex];
			var srIndex = parseInt(rIndex);
			var repeatedNum = jRow.rn ? parseInt(jRow.rn):0;
			var row = {};
			if(repeatedNum == 0)
			{
				row.rId = this._idManager.getRowIdByIndex(sheetId,srIndex-1,true);
			}
			else
			{
				var erIndex = srIndex + repeatedNum;
				var address = srIndex + ":" + erIndex;
				var range = new websheet.event.undo.Range(address,sheetName,this._idManager);
				var rangeId = msgTransformer.addRange(range,this.bTrans);
				row.rangeId = rangeId;
				this._rangeIdList.push(rangeId);
			}
			var cells = this.transformCells2Id(srIndex,jRow.cells);
			row.cells = cells;
			var wcs = websheet.Constant.Style;
            //set row height
            if(jRow[wcs.HEIGHT] != null){
                row[wcs.HEIGHT] = jRow[wcs.HEIGHT];
            }
            //set row height
            if(jRow.visibility!=null && jRow.visibility!=undefined)
            	row.visibility = jRow.visibility;
			this._rows.push(row);
			
			if (erIndex > this._idManager.maxRow) {
				erIndex = this._idManager.maxRow;
			}
			if(jRow.cells && bExpand)
			{
				for(var i = srIndex ; i <= erIndex; i++)
				{
					var rId = this._idManager.getRowIdByIndex(sheetId,i-1,true);
					this._rowsId2JsonMap[rId] = cells;
				}
			}	
		}
	},
	
	transformCells2Index: function(cells)
	{
		var jCells = {};
		var count = 0;
		var msgTransformer = this.getMsgTransformer();
		var rangeList = msgTransformer.getRangeList(this.bTrans);
		var sheetId = this.refTokenId._sheetId;
		var prefixrange = websheet.Constant.IDPrefix.RANGE;
		for(var id in cells)
		{
			var jCell = cells[id];
			var rst = null;
			// TODO use const
			if(id.indexOf(prefixrange) == 0)
			{
				var range = rangeList.getRange(id,sheetId);
				if(!range)
				{
					console.log("transformCells2Index error");
					continue;
				}
			    rst = range._getRangeInfo();
			}
			else{
				var colIndex = this._idManager.getColIndexById(sheetId,id);
				colIndex = (colIndex != -1)? colIndex + 1 : colIndex;
				rst = {startCol: colIndex, endCol:colIndex};
			}

			if(rst.startCol != -1)
			{
				var repeatedNum = (rst.endCol >= rst.startCol)? (rst.endCol - rst.startCol ): 0;
				if(jCell.v == undefined)
				{
					jCell.rn = repeatedNum;  
				}
				if (jCell.rn == 0) {
					delete jCell.rn;
				}
				var strColIndex = websheet.Helper.getColChar(rst.startCol);
				jCells[strColIndex] = jCell;
				count++;
			}
		}
		if(count > 0) return jCells;
		return null;
	},
	
	getRangeInfo: function(range)
	{
		if(this.type != websheet.Constant.Event.ACTION_INSERT)
		{
			return range._getRangeInfo();
		}else
		{
			//TODO: for the undo of delete row
			this._getRangeInfo(range);
		}
	},
	
	_sortIndex: function(a,b)
	{
		return a - b;
	},
		
	transformData2Index: function()
	{
		var jRowsMap = null;
		if(this._rows)
		{
			jRowsMap = {};
			var msgTransformer = this.getMsgTransformer();
			var rangeList = msgTransformer.getRangeList(this.bTrans);
			var sheetId = this.refTokenId._sheetId;
			var wcs = websheet.Constant.Style;
			//step 1: all the none foumla cells
			for(var i = 0; i < this._rows.length; i++)
			{
				var row = this._rows[i];
				var rst = null;
				if(row.rangeId)
				{
					var range = rangeList.getRange(row.rangeId,sheetId);
					if(!range) continue;
					rst = this.getRangeInfo(range);
				}
				else if(row.rId)
				{
					var rowIndex = this._idManager.getRowIndexById(sheetId,row.rId);
					rowIndex = (rowIndex != -1) ? rowIndex + 1 : rowIndex;
					rst = {startRow:rowIndex, endRow:rowIndex};
				}
				if(rst.startRow != -1)
				{
					var repeatedNum = (rst.endRow >= rst.startRow)? (rst.endRow - rst.startRow ): 0;
					var jCells = this.transformCells2Index(row.cells);
					if(jCells || row[wcs.HEIGHT] != null || row.visibility != undefined)
					{
						var jRow = {};
						if(jCells)
						jRow.cells = jCells;						
						if(row[wcs.HEIGHT] != null)
							jRow[wcs.HEIGHT] = row[wcs.HEIGHT];
					
						if(row.visibility != undefined)
                        jRow.visibility = row.visibility;
						
						if(repeatedNum>0)
							jRow.rn = repeatedNum;
							
                        jRowsMap[rst.startRow] = jRow;
                    }
				}
			}
			//step 2: all the formula cells
			if(this._formulaCellEvents)
			{
				for(var i = 0 ; i < this._formulaCellEvents.length; i++)
				{
					var cEvent = this._formulaCellEvents[i];
					cEvent.refTokenId.updateToken(this._idManager);
					var rIndex = cEvent.refTokenId.token.getStartRowIndex();
					if(rIndex < 0) continue;
					var cIndex = cEvent.refTokenId.token.getStartColIndex();
					if(cIndex < 0) continue;
					var jCEvent = cEvent.toJson();
					var jRow = jRowsMap[rIndex];
					if(!jRow)
					{
						jRow = {};
						jRowsMap[rIndex] = jRow;
					}
					var cells = jRow.cells;
					if(!cells)
					{
						cells = {};
						jRow.cells = cells;
					}
					var strCIndex = websheet.Helper.getColChar(cIndex);
					cells[strCIndex] = jCEvent.data.cell;
				}
			}
		}
		return jRowsMap;
	},
	
	clear: function()
	{
		var rangeList = this.getMsgTransformer().getRangeList(this.bTrans);
		if(this._rangeIdList)
		{
			for(var i = 0 ; i < this._rangeIdList.length; i++)
			{
				var range = rangeList.getRange(this._rangeIdList[i]);
				if(range) rangeList.deleteRange(range);
			}
		}
		if(this._formulaCellEvents)
		{
			for(var i = 0 ; i < this._formulaCellEvents.length; i++)
			{
				var event = this._formulaCellEvents[i];
				event.clear();
			}
		}
	}
});
