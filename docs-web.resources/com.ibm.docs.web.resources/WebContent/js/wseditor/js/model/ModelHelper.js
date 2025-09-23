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
/* ModelHelper								    	*/
/****************************************************/
dojo.provide("websheet.model.ModelHelper");
dojo.require("websheet.Constant");
dojo.require("websheet.functions.IObject");
dojo.require("websheet.Cache");
dojo.requireLocalization("websheet","Constant");

websheet.model.ModelHelper = {	
	Constant: websheet.Constant,
    UtilObj : websheet.functions.Object,
	/**
	 * merge one cell specified by 'colid' with its previous cell, next cell or both cells
	 * @param row	       	row object where merging cell happens
	 * @param colIndex     	merged cell position
	 * @param position 	position type value:[previous|next|both]
	 * @param bArrayIndex true if provided colIndex is the array index in row._cells
	 * return
	 */
	/*void*/mergeCell:function(row, /*integer*/colIndex, position, bArrayIndex){
		if(undefined==row || undefined==colIndex ){return;}
		var arrayIndex = bArrayIndex ? colIndex : row.getCellPosition(colIndex); // pointer (array index) if current cell
		var cells = row._styleCells;
		var curCell = cells[arrayIndex];
		var Position = this.Constant.Position;
		if(undefined == curCell)
		{
			return ;
		}
		if (bArrayIndex) {
			colIndex = curCell.getCol();
		}
		
		var pCell = null;
		var lCell = null;
		var cRepeatNum = (curCell._repeatednum == undefined)? 0: parseInt(curCell._repeatednum);
		//merge cell with next
		if(position == Position.NEXT || position == Position.BOTH)
		{
			// here we just get the neighbour cell in cells array,
			// the lCell, if exists, must be after curCell in position, it is very possible that lCell is not neighbour of curCell,
			// the function isCellCanMerge() will constrain that
			// same as pCell in next block for PREVIOUS
			lCell = cells[arrayIndex + 1];
			if(null != lCell){
				if(curCell.isMergable(lCell))
				{
					// set current cell, remove next cell
					var lRepeatNum = (lCell._repeatednum == undefined)? 0: lCell._repeatednum;
					curCell.setRepeatedNum(cRepeatNum + lRepeatNum + 1);
					row._styleCells.splice(arrayIndex + 1, 1);
				}
			}
		}
		//merge cell with previous
		if(position == Position.PREVIOUS || position == Position.BOTH)
		{
			pCell = cells[arrayIndex - 1];
			if(null != pCell){
				if(pCell.isMergable(curCell))
				{
					var pRepeatNum = (pCell._repeatednum == undefined)? 0: pCell._repeatednum;
					//curCell has been changed
					cRepeatNum = (curCell._repeatednum == undefined)? 0: parseInt(curCell._repeatednum);
					pCell.setRepeatedNum(pRepeatNum + cRepeatNum + 1);
					// set previous cell, remove current cell
					row._styleCells.splice(arrayIndex, 1);
				}
			}
		}
	},
	
	/**
	 * Split cell = row._cells[arrayIndex], so cell repeat ends at splitColIndex - 1, start with splitColIndex is a new cell locate at 
	 * row._cells[arrayIndex + 1], if succeed, return arrayIndex + 1, if cell not exists, return -1
	 */
	splitCellByArrayIndex: function(row, arrayIndex, splitColIndex) {
		var cells = row._styleCells;
		var cell = cells[arrayIndex];
		if (!cell) {
			return -1;
		}
		var r = cell._repeatednum;
		if (r == 0) {
			return arrayIndex;
		}
		var colIndex = cell.getCol();
		if (colIndex >= splitColIndex) {
			return arrayIndex;
		}
		var cellEnd = colIndex + r;
		if (cellEnd < splitColIndex) {
			return arrayIndex;
		}
		var splitEnd = splitColIndex - 1;
		// new repeat range ends at splitEnd
		cell._repeatednum = splitEnd  - colIndex;
		// new colIndex starts at splitColIndex
		var IDManager = row._parent._idManager;
		var colId = IDManager.getColIdByIndex(row._parent._id,splitColIndex-1, true);
		var newCell = new websheet.model.StyleCell(row,colId);
//		var newCell = row._createCell(splitColIndex);
		// must set repeatednum before setStyleId, since setStyleId need correct repeatednum
		newCell._repeatednum = cellEnd - splitColIndex;
		newCell.setStyleId(cell._styleId);
		if (newCell._styleId != null)
		{
			// only add the splitted cell if the new cell is not null
			cells.splice(arrayIndex + 1, 0, newCell);
		}
		return arrayIndex + 1;
	},
	/**
	 * split cell mean that if cell in a repeated region,then break this connections 
	 * if witheStyle is true, current cell has style following previous cell's style
	 * @param row	       	row where splitting cell happens
	 * @param colIndex	       	split cell position
	 * @param position      position type value:[previous|next|both]
	 * return
	 */
	//TODO: bNotApplyColStyle should be true by default in order not to generate redundant styled cell
	//which style id is inherited from column model
	/*void*/splitCell:function(row,colIndex,position, bNotApplyColStyle){
		if(row == undefined || colIndex == undefined){return;}
		var fCell = row.getCell(colIndex,this.Constant.CellType.STYLE,true);
		var Position = this.Constant.Position;
		//if exist repeated cell,then divide the repeated number
		//else to fetch its column style,if not exit,do nothing
		if(fCell){
			if(fCell.getStyleId()){
				if(undefined == fCell._repeatednum)
				{
					return;
				}
				var repeatNum = fCell._repeatednum;
				if(!repeatNum){repeatNum = 0;}
				var followColIndex = fCell.getCol();
				//split cell with previous cell
				if((position == Position.PREVIOUS || position == Position.BOTH)
						&& followColIndex != colIndex && (followColIndex + repeatNum) >= colIndex ){
					//copy style from previous cell to current cell
					repeatNum = followColIndex + repeatNum - colIndex;
					var cCell = row.copyCellStyle(fCell,colIndex,repeatNum);
//					var cCell = row.getCell(colIndex);									
					//update cell's repeated number attribute				
					fCell.setRepeatedNum(colIndex - followColIndex - 1);
					fCell = cCell;
					followColIndex = colIndex;
				}				
				if((position == Position.NEXT || position == Position.BOTH)
						&& (followColIndex + repeatNum) > colIndex){
					//copy style from previous to next
					var nCell = row.copyCellStyle(fCell,colIndex + 1,followColIndex + repeatNum - colIndex - 1);

					//update cell's repeated number attribute					
					fCell.setRepeatedNum(colIndex - followColIndex);
				}
				return;
			}
		}
		//if you want to split a cell,maybe it is in case of set a cell's value,or change its style
		//so you will get the column style if exist
		if(!bNotApplyColStyle)
		{
			var sheet = row._getParent();
			var column = sheet.getColumn(colIndex,true);
			if(column && column.getStyleId()){
				var cell = row.getCell(colIndex, this.Constant.CellType.STYLE);
				if(!cell){
					cell = row._createCell(colIndex, this.Constant.CellType.STYLE);
				}
				cell.setStyleId(column.getStyleId());
			}
		}
	},
	
	/**
	 * merge one row specified by 'rowIndex' with its previous row, next row or both rows
	 * @param sheet	       	sheet where merging row happens
	 * @param rowIndex     	merged row position
	 * @param position      position type value:[previous|next|both]
	 * @param bArrayIndex 	is provided rowIndex the array index in sheet row array
	 * return
	 */
	/*void*/mergeRow:function(sheet, rowIndex, position, bArrayIndex){
		if(sheet == undefined || rowIndex == undefined){return;}
		var arrayIndex = bArrayIndex ? rowIndex : sheet.getRowPosition(rowIndex);
		var modelRows = sheet._rows;
		var row = modelRows[arrayIndex];
		var Position = this.Constant.Position;
		//if current row doesn't exist,then return
		if(row == undefined){
			return ;
		}
		
		var pRow = null;
		var lRow = null;
		var index = -1;
		var cRepeatNum;
		if (!(cRepeatNum = row._repeatedNum)) {
			cRepeatNum = 0;
		}
		//merge row with next
		if(position == Position.NEXT || position == Position.BOTH)
		{
			lRow = modelRows[arrayIndex + 1];
			if(null != lRow){
				if(row.isMergable(lRow))
				{
					// set current row, remove next row
					var lRepeatNum = (lRow._repeatedNum == undefined)? 0: lRow._repeatedNum;
					row.setRepeatedNum(cRepeatNum + lRepeatNum + 1);
					row._gap += lRow._gap + 1;
					modelRows.splice(arrayIndex + 1, 1);
				}
			}
		}
		if (!(cRepeatNum = row._repeatedNum)) {
			cRepeatNum = 0;
		}
		//merge row with previous
		if(position == Position.PREVIOUS || position == Position.BOTH)
		{
			pRow = modelRows[arrayIndex - 1];
			if(null != pRow){
				if(pRow.isMergable(row))
				{
					// set previous row, remove current row
					var pRepeatNum = (pRow._repeatedNum == undefined)? 0: pRow._repeatedNum;
					pRow.setRepeatedNum(cRepeatNum + pRepeatNum + 1);
					pRow._gap += row._gap + 1;
					modelRows.splice(arrayIndex, 1);
				}
			}
		}
	},
	
	/*
	 *  split the row node in arrayIndex , then the next row node start with splitRowIndex
	 * @param sheet: sheet model
	 * @param arrayIndex:  the index in the rows array
	 * @param splitRowIndex: the row index need to split
	 * return: the array index for the splitRowIndex row node
	 */
	/*int*/splitRowByArrayIndex: function(sheet,arrayIndex,splitRowIndex)
	{
		var row = sheet._rows[arrayIndex];
		if(!row) return -1;
		var repeatedNum = row._repeatedNum;
		if( !repeatedNum )
			return arrayIndex;
		var rowIndex = row.getIndex();
		if(rowIndex >= splitRowIndex)
			return arrayIndex;
		
		var endRowIndex = rowIndex + parseInt(repeatedNum);
		if(endRowIndex < splitRowIndex) 
			return arrayIndex;
		
		var lRowId = sheet._idManager.getRowIdByIndex(sheet._id,splitRowIndex - 1,true);
		var lRow = new websheet.model.Row(sheet,lRowId);
		sheet._rows.splice(arrayIndex + 1, 0, lRow);
		this.copyRowStyle(row,lRow);
		
		row._repeatedNum = splitRowIndex- 1 - rowIndex;
		lRow._gap = lRow._repeatedNum = endRowIndex - splitRowIndex;
		
		var index = lRow.getIndex();
		row._gap = index - rowIndex - 1;
		var rRow = sheet._rows[arrayIndex + 2];
		if (rRow) lRow._gap = rRow.getIndex() - index - 1;
		
		return arrayIndex+1;
	},
	
	/*
	 * copy row style from pRow to lRow
	 * @param pRow, lRow: row model
	 */
	copyRowStyle: function(pRow, lRow)
	{
		lRow._styleCells = [];
		var cells = pRow._styleCells;
		for(var i = 0; i <cells.length; i++)
		{
			var cell = cells[i];
			var cellStyleId = cell.getStyleId();
			if(cellStyleId)
			{
				var lCell = new websheet.model.StyleCell(lRow,cell._id);
				lCell._repeatednum = cell._repeatednum;
				lCell.setStyleId(cellStyleId);
				lRow._styleCells.push(lCell);
			}
		}
		lRow._height = pRow._height;
		lRow._visibility = pRow._visibility;
		if(lRow._visibility == this.Constant.ROW_VISIBILITY_ATTR.HIDE)
			lRow._visible = false;
		else if(lRow._visibility == this.Constant.ROW_VISIBILITY_ATTR.FILTER)
		    lRow._filtered = true;
	},
	
	/**
	 * split row mean that if row in a repeated region,then break this connections 
	 * @param sheet	       	sheet where splitting row happens
	 * @param rowIndex     	split row position
	 * @param position      position type value:[previous|next|both]
	 * @param bArrayIndex 	is provided rowIndex the array index in sheet row array
	 * return
	 */
	/*void*/splitRow:function(sheet, rowIndex,position){
		if(sheet == undefined || rowIndex == undefined){return;}
		var fRow = sheet.getRow(rowIndex,true);
		var Position = this.Constant.Position;
		if(fRow){
			var repeatNum = fRow._repeatedNum;
			var fRowIndex = fRow.getIndex();
			//split row with previous row
			if((position == Position.PREVIOUS || position == Position.BOTH)
					&& fRowIndex != rowIndex && (fRowIndex + repeatNum) >= rowIndex){
				//copy row from previous to current
				var cRow = sheet.copyRowStyle(fRow,rowIndex);
				//update rows repeated number attribute
				repeatNum = fRowIndex + repeatNum - rowIndex;
				cRow.setRepeatedNum(repeatNum);
				fRow.setRepeatedNum(rowIndex - fRowIndex - 1);
				fRow = cRow;
				fRowIndex = rowIndex;
			}
			//if row contains value of cells,then return;
			if(fRow.isContainValueCell()){
				return;
			}
			//split row with next
			if((position == Position.NEXT || position == Position.BOTH)
					&& (fRowIndex + repeatNum) > rowIndex){
				//copy row from previous to next
				var nRow = sheet.copyRowStyle(fRow,rowIndex + 1);
				//update its repeated number attribute
				nRow.setRepeatedNum(fRowIndex + repeatNum - rowIndex - 1);
				fRow.setRepeatedNum(rowIndex - fRowIndex);
			}
		}
	},

	/**
	 * merge one column specified by 'colIndex' with its previous column, next column or both columns
	 * @param sheet	       	sheet object where merging column happens
	 * @param colIndex     	merged column position	
	 * @param position    	position type value:[previous|next|both]
	 * return
	 */
	/*void*/mergeColumn:function(sheet, /*integer*/colIndex, position){
		if(undefined==sheet || undefined==colIndex ){return;}
		var curCol = sheet.getColumn(colIndex);
		var Position = this.Constant.Position;
		//if current column doesn't exist,then do nothing
		if(undefined == curCol)
		{
			return ;
		}
		var pCol = null;
		var lCol = null;
		var fetchMethod = "";//dojo.hitch(IDManager,"getColIndexById");
		var cRepeatNum = (curCol._repeatedNum == undefined)? 0: curCol._repeatedNum;
		//merge current column with next
		if(position == Position.NEXT || position == Position.BOTH)
		{
			var lColIndex = colIndex + 1;
			lCol = sheet.getColumn(lColIndex);
			if(null != lCol){
				//if column can't be merged,then do nothing
				if(curCol.isMergable(lCol))
				{
					var lRepeatNum = (lCol._repeatedNum == undefined)? 0: lCol._repeatedNum;
					//if column can be merged,update current column's repeated number attribute
					curCol.setRepeatedNum(cRepeatNum + lRepeatNum + 1);
					//delete next column in sheet
					index = this.binarySearch(sheet.getColumns(),lColIndex,this.equalCondition,fetchMethod,false,sheet.getId(), this.Constant.Column);
					if(index >= 0){
						sheet.getColumns().splice(index,1);
					}
				}
			}
		}
		cRepeatNum = (curCol._repeatedNum == undefined)? 0: curCol._repeatedNum;
		//merge column with previous
		if(position == Position.PREVIOUS || position == Position.BOTH)
		{
			var pColIndex = colIndex - 1;
			if(pColIndex > 0)
			{
				pCol = sheet.getColumn(pColIndex, true);
			}
			if(null != pCol){
				//if column can't be merged,then do nothing
				if(pCol.isMergable(curCol))
				{
					var pRepeatNum = (pCol._repeatedNum == undefined)? 0: pCol._repeatedNum;
					//if column can be merged,update current column's repeated number attribute
					pCol.setRepeatedNum(pRepeatNum + cRepeatNum + 1);
					//delete current column in sheet
					index = this.binarySearch(sheet.getColumns(),colIndex,this.equalCondition,fetchMethod,false,sheet.getId(), this.Constant.Column);
					if(index >= 0){
						sheet.getColumns().splice(index,1);
					}
				}
			}
		}
	},

	/**
	 * split column mean that if column in a repeated region,then break this connections 
	 * @param sheet	       	sheet object where splitting column happens
	 * @param colIndex     	split column position
	 * @param position      position type value:[previous|next|both]
	 * return
	 */
	/*void*/splitColumn:function(sheet, /*integer*/colIndex, position){
		if(sheet == undefined || colIndex == undefined){return;}
		var fCol = sheet.getColumn(colIndex,true);
		var Position = this.Constant.Position;
		//if exist repeated cell,then divide the repeated number
		//else to fetch its column style,if not exit,do nothing
		if(fCol){
			if(undefined == fCol._repeatedNum)
			{
				return;
			}
			var repeatNum = fCol._repeatedNum;
			if(!repeatNum){repeatNum = 0;}
			var followColIndex = fCol.getIndex();
			if((position == Position.PREVIOUS || position == Position.BOTH)
					&& followColIndex != colIndex && (followColIndex + repeatNum) >= colIndex){
				//copy column style from previous to current
				var cCol = sheet.copyColumnStyle(fCol,colIndex);
				//update repeated number attribute
				repeatNum = followColIndex + repeatNum - colIndex;
				if(cCol)
					cCol.setRepeatedNum(repeatNum);
				fCol.setRepeatedNum(colIndex - followColIndex - 1);
				fCol = cCol;
				followColIndex = colIndex;
			}
			if((position == Position.NEXT || position == Position.BOTH)
					&& (followColIndex + repeatNum) > colIndex){
				//copy column style from previous to next
				var nCol = sheet.copyColumnStyle(fCol,colIndex + 1);
				//update repeated number attribute
				nCol.setRepeatedNum(followColIndex + repeatNum - colIndex - 1);
				fCol.setRepeatedNum(colIndex - followColIndex);
			}
		}
	},
	/**
	 * utilize binary search method to find object fit equal condition in array
	 * @param <Array>array			searched object
	 * @param key					compare object
	 * @param equalCondition		equal condition,it is a method address
	 * @param fetchMethodById		fetch object by Id
	 * @param follow				
	 * @param sheetId				sheet Id
	 * return position which fit to equal condition in array 
	 */
	/*integer*/binarySearch:function(array,key,equalCondition,fetchMethodById,followStyle,sheetId, methodType){
		var low = 0;
		var high = array.length - 1;
		if (this.idManager == undefined) {
			var docObj = this.getDocumentObj();
			this.idManager = docObj._getIDManager();
		}
		if(high > key){high = key;}
		while(low <= high){
			var mid = (low + high) >> 1;
			var cmp = equalCondition(array[mid],key,fetchMethodById,followStyle,sheetId, methodType, this.idManager);
			if (cmp < 0)
				low = mid + 1;
		    else if (cmp > 0)
		    	high = mid - 1;
		    else
		    	return mid; // key found
		}
		return -(low + 1);//key not found
	},
	/**
	 * equal condition for binary search
	 * @param model					compare object
	 * @param index					it is a position for search
	 * @param fetchMethodById		how to fetch a object by id
	 * @param followStyle			if it is true,search a object whose style current position(parameter index) followed]
	 * 								otherwise only search a object in current position
	 * @param sheetId				sheet id
	 */
	/*integer*/equalCondition:function(model,index,fetchMethodById,followStyle,sheetId, methodType, idManager){
		var id = 0;
		var repeatednum;
		if(model["getId"]){
			id = model.getId();
			repeatednum = model.getRepeatedNum();
		}else{ // cell model
			id = model._id; //getColumnId
			repeatednum = model._repeatednum;
		}
		if(repeatednum == undefined){repeatednum = 0;}
		
		var pos;
		if(methodType == websheet.Constant.Row){
		    pos = idManager.getRowIndexById(sheetId,id);
		}else if (methodType == websheet.Constant.Column){
		    pos = idManager.getColIndexById(sheetId,id);
		}else{
		    pos = fetchMethodById(sheetId,id); //very slowly because eval
		}
		
		if(pos != -1){pos += 1;}
		if(followStyle){
			if(pos	<= index && index <= pos + repeatednum){
				return 0;
			}else if(pos > index){
				return 1;
			}else{
				return -1;
			}
		}else{
			if(pos > index){
				return 1;
			}else if(pos == index){
				return 0;
			}else{
				return -1;
			}
		}
	},

	/**
	 * get Partial Manager
	 * does not need in view mode
	 */
	/*PartialManager*/getPartialManager:function(){
		return this.getEditor().getPartialManager();
	},
	
	/**
	 * get Partial Calculation Manager
	 */
	/*PartialManager*/getPartialCalcManager:function(){
		return this.getEditor().getPartialCalcManager();
	},
	
	/**
	 * get Calculation Manager to calculate all the formulas
	 */
	/*PartialManager*/getCalcManager:function(){
		return this.getEditor().getCalcManager();
	},
	
	/*
	 * if attr is null or undefined or "",then return true,
	 * else return false
	 */
	isEmpty: function(attr)
	{
		if(null == attr || undefined == attr) return true;
		if(typeof attr == "string" && attr.length == 0) return true;
		return false;
	},
	
	/*
	 * cModel is one mixed cell model that contains both value and style
	 * 
	 * construct cell json for event 
	 * return: null if this cell is empty, else JSON
	 * bStyle: true, only return style & repeat number
	 * bValue: true, only return raw value, without style & repeat number
	 * bStyle and bValue should be positive, otherwise both bStyle and bValue set to true 
	 * bHasColStyle: only used when bStyle=true, if cell does not have style,return the column style
	 * bStyleId: only used when bStyle=true, return style with style json or style id
	 * bRawValue: If true, use cell._rawValue, else use getRawValue()
	 */
	toCellJSON: function(cModel, params)
	{
		if (!params) params = {};
		var bStyle = params.bStyle;
		var bValue = params.bValue;
		var bHasColStyle = params.bHasColStyle;
		var bExcludeColspan = params.bExcludeColspan;
		var bStyleId = params.bStyleId;
		var bRawValue = params.bRawValue;
		var forCopy = params.forCopy;
		var forCut = params.forCut;
		var checkHidden = params.checkHidden;
		
		var cell = {};
		if(!bValue && !bStyle)
		{
			bValue = true;
			bStyle = true;
		}
		
		if(bValue)
		{
			// it's tricky here, must use _rawValue rather than cModel.getRawValue()
			// because getRawValue will re-serialize formula string. As a result, we
			// fail to get correct formula string
		    var bHidden = false;
		    var value;
			if((forCopy || checkHidden) && cModel._parent._parent._bProtected){ 
		    	var styleId = null;
		    	var column = cModel._parent._parent.getColumn(cModel.getCol(), true);
			    if(column)
			    	styleId = column._styleId;
			    bHidden = cModel.isHidden(styleId);
	    	}
			if(bHidden)
			    value = cModel._calculatedValue;
			else
				value = bRawValue ? cModel._rawValue : cModel.getRawValue();//_rawValue;
		    if(!this.isEmpty(value))
		    {
		        cell.v = value;
		    }
		    var link=cModel.getLink(true);
		    // if it's one formula cell, don't put the link attribute into cell json
		    if(!this.isEmpty(link))
		    {
		        cell.link = link;
		    }
		    if (cModel._tokenArray && cModel.isParsed && !bHidden) {
				if (cModel._tokenArray.length > 0)
					cell.tarr = cModel.serializeTokenArray(true);
				else if(cModel.isFormula())
					cell.tarr = [];
				if(forCut)
					cell.uId = cModel._uniqueId;
			}
		    if (!cModel.isFormula()) {
		    	value = cell.v;
		    	if (cModel.isBoolean()) {
			    	// non formula boolean cell, turn value to TRUE or FALSE
			    	cell.v = this.intToBoolean(value);
		    	} else if (cModel.isNumber()) {
		    		// non formula number cell, convert value to string if it is a big number
		    		cell.v = websheet.Helper.convertToStringForBigNumber(value);
		    	}
		    }
		}
		if(bStyle)
		{
		    var repeatedNum = cModel._repeatednum;
		    if(repeatedNum != null && repeatedNum != 0 && cModel._styleId != null)
		    {
		        cell.rn = repeatedNum;
		    }
		    
		    if(!bExcludeColspan)
		    {
			   	var mColSpan = cModel._colSpan;
			    if(mColSpan>1)
			    	cell.cs = mColSpan; // colspan
			    var mRowSpan = cModel._rowSpan;
			    if(mRowSpan>1)
			    	cell.rs = mRowSpan; // rowspan
			    var mbCover = cModel._isCovered;
			    if(mbCover)
		    		cell.ic = true;
		    }

		    var styleId = cModel._styleId;
		    var styleCode = null;
		    if ((styleId == null) && bHasColStyle)
		    {
		    	var column = cModel._getSheet().getColumn(cModel.getCol(), true);
		    	if (column)
		    		styleId = column._styleId;
		    }
		    
		    if(styleId != null){
		    	if(bStyleId)
		    		cell.style = styleId;
		    	else {
			    	styleCode = this.getDocumentObj()._getStyleManager().getStyleById(styleId)
		    		if (styleCode)
		    			cell.style = styleCode.toJSON();
			    	if (cell.style == null)
			    		delete cell.style;
		    	}
		    }
		}
		
		var count = 0;
		for(var attr in cell)
		{
			count++;
			break;
		}
	    if(count > 0){
	    	return cell;
	    }else{
	    	return null;
	    }   
	},

	/**
	 * @param sheetName
	 * @param startIndex
	 * @param endIndex
	 * @param parms, bSet, if given , only returns columns json, exclude meta and rows data (for insert/delete columns).
	 * @returns
	 */
	toColsJSON: function(sheetName, /*number*/ startIndex, /*number*/ endIndex, parms)
	{
		var sheet = this.getDocumentObj().getSheet(sheetName);
		var cols = {}, sm = this.getDocumentObj()._getStyleManager();
		var idx = 0;
		while( idx <= (endIndex - startIndex) )
		{
			var curIndex = startIndex + idx;
			var columnModel = sheet.getColumn(curIndex, true);
			if(columnModel)
			{
				var col = cols[websheet.Helper.getColChar(curIndex)] = {};
				//custom style
				if(columnModel._styleId)
				{
					var columnStyleCode = sm.getStyleById(columnModel._styleId);
					col.style = columnStyleCode.toJSON();
				}
				//width
				if(columnModel._width)
					col[websheet.Constant.Style.WIDTH] = columnModel._width;
				//visibility
				if(columnModel._visibility)
					col.visibility = columnModel._visibility;
				//repeate number
				var rn = columnModel._repeatedNum;
				if(rn > 0)
				{
					var cnt = columnModel.getIndex() + rn - curIndex;
					var count = endIndex - curIndex;
					if(cnt > count)	cnt = count;
					col.rn = cnt;
					idx += cnt;
				}
			}
			idx ++;
		}
		if (parms && parms.bSet){
			return cols;
		} else {
			var eventData = {};
			eventData.columns = cols,
			eventData.meta = websheet.Utils.getColsId(sheet, startIndex, endIndex);
			eventData.rows = this.toRangeJSON(sheetName, 1, startIndex, websheet.Constant.MaxRowNum, endIndex, 
					{ bRawValue: true, bUpdateFormula: true, includeColumnStyle: true });
			return eventData;
		}
	},
	
	/* construct column json for event, not contain cells
	 * return: null if this column is empty, else JSON 
	 */
	toColJSON: function(colModel)
	{
		var col = {};
		var count = 0;
		var width = colModel.getWidth();
		if(width != null)
		{
			col[websheet.Constant.Style.WIDTH] = width;
			count++;
		}
		var repeatedNum = colModel._repeatedNum;
		if(repeatedNum != null && repeatedNum != 0)
		{
			col.rn = repeatedNum;
			count++;
		}
		var styleCode = colModel.getStyle();
		if( styleCode != null)
		{
			col.style = styleCode.toJSON();
			count++;
		}
		if(count > 0) return col;
		return null;
	},
	
	createColsArray: function(colsMap)
	{
		var colArray = [];
		for(var cIndex in colsMap)
		{
			var colJson = dojo.clone(colsMap[cIndex]);
			var iCIndex = websheet.Helper.getColNum(cIndex);
			colJson.index = iCIndex;
			colArray.push(colJson);	
		}	
		if(colArray.length > 0)
		{
			colArray.sort(this._sortByIndex);
		}
		return colArray;
	},
	
	createRowsArray: function(rowsMap)
	{
		var rowArray = [];
		var wcs = websheet.Constant.Style;
		for(var rIndex in rowsMap)	
		{
			rIndex = parseInt(rIndex);
			var rowJson = rowsMap[rIndex];
			var rItem = {};
			rItem.index = rIndex;
			if(rowJson[wcs.HEIGHT] !== undefined)
				rItem[wcs.HEIGHT] = rowJson[wcs.HEIGHT];
			if(rowJson.visibility !== undefined)
				rItem.visibility = rowJson.visibility;
			if(rowJson.rn !== undefined)
				rItem.rn = rowJson.rn;
			if(rowJson.cells)
			{
				var cellArray = [];
				for(var cIndex in rowJson.cells)
				{
					var iCIndex = websheet.Helper.getColNum(cIndex);
					var cellJson = rowJson.cells[cIndex];
					var style = cellJson.style;
					if (style && style.id) {
						style = this.docObj._styleManager.styleMap[style.id].toJSON();
						cellJson.style = style;
					}
					var cItem = {};
					cItem.index = iCIndex;
					cItem.cell = cellJson;
					cellArray.push(cItem);
				}
				cellArray.sort(this._sortByIndex);
				rItem.cells = cellArray;
			}
			
			rowArray.push(rItem);
		}	
		if(rowArray.length > 0)
		{
			rowArray.sort(this._sortByIndex);
		}
		return rowArray;
	},
	/*
	 * a/b: {index:colindex,object:{}}
	 */
	_sortByIndex: function(/*item*/a,/*item*/b)
	{
		return a.index - b.index;
	},
	/*
	 * summary : sort items according to the row/column index
	 * @param items: three type, cells(colIndex:{cell}), rows( rowIndex:{row}), columns(colIndex:{column})
	 * @isNumeric : boolean, if true, is rowIndex(integer), else is colIndex(character)
	 * output: array, every item changed to(index:.., object:{})
	 */
	_sortItems: function(items, isNumeric)
	{
		var array = new Array();
		for(var index in items)
		{
			var newItem = {};
			newItem.index = (isNumeric == true)? parseInt(index): websheet.Helper.getColNum(index);
			newItem.object = items[index];
			array.push(newItem);
		}
		if(array.length > 0)
		{
			array.sort(this._sortByIndex);
		}
		return array;
	},
	
	/*
	 * summary: create the row model by the rJson
	 * @param sheet: the sheet model, which is the parent of the row
	 * @param rIndex: integer row index, start from 1
	 * @param rJson: row josn object
	 * output: rowModel
	 */
	createRowByJSON: function(sheet, rIndex, rJson, bCacheStyleJson, bEnlargeCoverCell)
	{
		if(!rJson) return null;
		var sheetId = sheet.getId();
		var idManager = sheet._idManager;
		var rId = idManager.getRowIdByIndex(sheetId,rIndex-1,true);
		var row = new websheet.model.Row(sheet,rId,rJson[websheet.Constant.Style.HEIGHT],rJson.rn,rJson.visibility);
		
		if(rJson.cells)
		{
			var styleManager = sheet._parent._getStyleManager();
			var cellsArray = this._sortItems(rJson.cells,false);
			var styleIndex = 0;
			var previous = null;
			for(var index = 0 ; index < cellsArray.length; index++)
			{
				var colIndex = cellsArray[index].index;
				var cell =  cellsArray[index].object;
				var colId = idManager.getColIdByIndex(sheetId,colIndex-1,true);
				// same mechanism as what have been done when load one row in row.js
//				var cellModel = new websheet.model.Cell(row,colId,cell.v,/* formula value */ null, cell.calculatedvalue,null,cell.rn,cell.link, 0, false, cell.tarr);
				if(!(cell.v == undefined) && cell.v !== ""){
					var cellModel = new websheet.model.Cell(row,colId,0,cell.v,cell.calculatedvalue,null,cell.link,/* cell type */ null, cell.tarr);
					row._valueCells[colIndex - 1] = cellModel;
				}
				
				var colspan = cell.cs;
				var rowspan = cell.rs;
				if( colspan > 1 || rowspan > 1)
				{
					var coverInfo = row._createCell(colIndex, this.Constant.CellType.COVERINFO);
					if(colspan > 1)
						coverInfo.setColSpan(colspan);
					if(rowspan > 1)
						coverInfo.setRowSpan(rowspan);
					sheet.insertCoverInfoInColumn(coverInfo, -1, -1);
				} else if(cell.ic && bEnlargeCoverCell){
					var coverCol = sheet.getColumn(colIndex, true);
					if(coverCol) {
						// first check if this covered cell is belong to the inserted columns
						var coverIndex = coverCol.getCoverCellPosition(rIndex, true);
						if(coverIndex < 0){
							//if not belong, then check if it should be enlarged with the upper cover cell
							coverIndex = -(coverIndex + 1) - 1;
							var coverCell = coverCol._coverInfos[coverIndex];
							if(coverCell) {
								var coverRowIndex = coverCell.getRow();
								if(coverRowIndex + coverCell.getRowSpan() == rIndex){
									coverCell.setRowSpan(rIndex + row.getRepeatedNum() - coverRowIndex + 1);
								}
							}
						}
					}
				}
				
				if (cell.style)
				{
					var styleId = null;
					var cellStyle = cell.style;
					if (cellStyle.id) {
						styleId = cellStyle.id;
					} else {
						styleId = styleManager.addStyle(cell.style);
					}
					if(styleId){
						if(!cell.rn)
							cell.rn = 0;
						var cellModel = null;
						var bRepeated = false;
						if(previous){							
							var sid = previous._styleId;
							var rn = previous._repeatednum;
							if (sid == styleId && (styleIndex + rn + 1)>= colIndex) {
								previous._repeatednum = colIndex + cell.rn - styleIndex;
								bRepeated = true;
							}
						}
						if(!bRepeated){
							cellModel = new websheet.model.StyleCell(row,colId,cell.rn,styleId);
							row._styleCells.push(cellModel);
							styleIndex = colIndex;
							previous = cellModel;
						}
						if (bCacheStyleJson) {
							if(cellModel){
								cellMode._styleJson = new Array();
								cellMode._styleJson.push(cell.style);
							}else
								previous._styleJson.push(cell.style);
						}
					}
				}
			}
		}
		return row;
	},
	
	/*
	 * summary: create the rows model Array by the rJson
	 * @param sheet: the sheet model, which is the parent of the rows
	 * @param rJson: rows json map
	 * @param bCacheStyleJson: will cache style json in cell as prop _styleJson
	 * output: rowsModel Array
	 */
	createRowsByJson: function(sheet, rowsJson, bCacheStyleJson)
	{
		if(!rowsJson) return null;
		var rowsArray = [];
		var rowsJsonArray = this._sortItems(rowsJson,true);
		var length = rowsJsonArray.length;
		for(var i = 0 ; i < length; i++)
		{
			var obj = rowsJsonArray[i];
			var rIndex = obj.index;
			var rowJson = obj.object;
			var rowModel = this.createRowByJSON(sheet, rIndex, rowJson, bCacheStyleJson, true);
			rowsArray.push(rowModel);
		}
		
		return rowsArray;
	},
	
	/*
	 * summary: create the column model by the cJson
	 * @param sheet: the sheet model, which is the parent of the column
	 * @param colIndex: integer column index, start from 1
	 * @param cJson: column json object
	 * output: column Model
	 */
	createColByJson: function(sheet,colIndex,cJson)
	{
		if(!cJson || colIndex <1) return null;
		var sheetId = sheet.getId();
		var idManager = sheet._idManager;
		var colId = idManager.getColIdByIndex(sheetId,colIndex-1,true);
		var colModel = new websheet.model.Column(sheet, colId, cJson[websheet.Constant.Style.WIDTH], null, cJson.rn, cJson.visibility);
		if(cJson.style)
		{
			var colStyle = cJson.style;
			var styleManager = sheet._parent._getStyleManager();
			var styleId = null;
			if (colStyle.id) {
				if (styleManager.getStyleById(colStyle.id)) {
					styleId = colStyle.id;
				}
			} else {
				styleId = styleManager.addStyle(cJson.style);
			}
			if (styleId) {
				colModel._styleId = styleId;
			}
		}
		return colModel;
	},
		
	/*
	 * summary: load sheet model by the sheetJson
	 * @param sheet: the empyt sheet model
	 * @param sheetJson : sheet json
	 * output: the sheet model
	 */
	loadSheetJsonData: function(sheet,sheetJson)
	{
		if(!sheetJson) return null;
		if(sheetJson.rows)
		{
			var rowsArray = this._sortItems(sheetJson.rows,true);
			for(var index = 0 ; index < rowsArray.length; index++)
			{
				var item = rowsArray[index];
				var rowModel = this.createRowByJSON(sheet,item.index,item.object);
				if (rowModel) 
					sheet._rows.push(rowModel);
			}
		}
		if(sheetJson.columns)
		{
			var colsArray = this._sortItems(sheetJson.columns,false);
			for(var index = 0 ; index < colsArray.length; index++)
			{
				var item = colsArray[index];
				var colModel = this.createColByJson(sheet,item.index,item.object);
				sheet._columns.push(colModel);
			}
		}
		return sheet;
	},
	
	/*
	 * summary: for the given style attribute, get the corresponding value the column 
	 * @param rModel: row model
	 * @param colIndex: column index, integer
	 * @param style: style json
	 * output: json
	 */
	getDeltaStyle4Column: function(sModel,colIndex,style)
	{
		var colJson = {};
		
		var styleManager = sModel._parent._getStyleManager();
		var eDelta = styleManager.getDelta(null,style);
		
		var colModel = sModel.getColumn(colIndex,true);
		var styleCode = null;
		if(colModel) styleCode = colModel.getStyle();
		if(styleCode)
		{
			colJson.style = styleManager.getDelta(styleCode.toJSON(),style);
		}else{
			if(eDelta) colJson.style = eDelta;
		}
	
		var rows = sModel._rows;
		var cells = {};
		var flag = false;
		var docObj = this.getDocumentObj();
		var maxRow = docObj.maxSheetRows;
		for(var index = 0; index < rows.length; index++)
		{
			var rModel = rows[index];
			var cModel = rModel.getCell(colIndex,this.Constant.CellType.STYLE, true);
			if(null != cModel)
			{
				if(cModel._styleId == this.Constant.Style.DEFAULT_CELL_STYLE && 
				  style.id == this.Constant.Style.DEFAULT_CELL_STYLE)
					continue;
				var styleCode = cModel.getStyle();
				if(null != styleCode)
				{
					var delta = styleManager.getDelta(styleCode.toJSON(),style);
					var cell = {style: delta};
					var sIndex = rModel.getIndex();
					var eIndex = sIndex + rModel._repeatedNum;
					eIndex = (eIndex > maxRow)? maxRow : eIndex;
					for(var i = sIndex; i <= eIndex; i++)
					{
						cells[i] = cell;
						flag = true;
					}
				}
			}
		}
		if(flag)
		{
			colJson.cells = cells;
		}
		return colJson;
	},
	
	/*
	 * summary: for the given style attribute, get the corresponding value the column 
	 * @param rModel: row model
	 * @param colIndex: column index, integer
	 * @param style: style json
	 * output: json
	 */
	getDeltaStyle4Columns: function(sModel,sColIndex,eColIndex,style)
	{
		var colsArray = new Array();
		for(var index = sColIndex; index <= eColIndex; index++)
		{
			var colJson = this.getDeltaStyle4Column(sModel,index,style);
			var strColIndex = websheet.Helper.getColChar(index);
			var item = {};
			item[strColIndex] = colJson;
			colsArray.push(item);
		}
		return colsArray;
	},
	
	//row, col should be cell at specified 1-based index
	//or be model, row is cellModel, col is the columnModel which has the same column index with cell
	getStyleId:function(sheetName, row, col)
	{
		var docObj = this.docObj || this.getDocumentObj();
		var styleId = null;
		var bCellModel = false;
		if (row != null && typeof row == "object") {
			styleId = row._styleId;
			bCellModel = true;
		}

		if(!styleId){
			var bColModel = false;
			if(col != null && typeof col == "object"){
				styleId = col._styleId;
				bColModel = true;
			}
			if (!styleId) {
				if (!bCellModel && !bColModel && row != null && col != null) {
					if (typeof col == "string") {
						col = websheet.Helper.getColNum(col);
					}
					styleId = docObj.getCellStyleId(sheetName, row, col);
				}
			}
		}
        return styleId;
	},
	
	/*
	 * Get style code of given cell, if it doesn't have style cell, fallback to get column's style
	 */
	getStyleCode:function(sheetName, row, col, resolveAlignment)
	{
        var styleId = this.getStyleId(sheetName, row, col);
        if (resolveAlignment) {
    		return this._getResolvedStyleCode(sheetName, row, col, styleId);
        }
        if (styleId) {
			var docObj = this.docObj || this.getDocumentObj();
    		var styleManager = docObj._getStyleManager();
        	var styleCode =  styleManager.getStyleById(styleId);
	        return styleCode;
        }
        return null;
	},
			
	/*
	 * Bidi counterpart of getStyleCode, resoves textAlign attribute accordin to direction
	 */
	_getResolvedStyleCode: function(sheetName, row, col, styleId)
	{
	        var docObj = this.docObj || this.getDocumentObj();
	        var styleManager = docObj._getStyleManager(); 
	        var styleCode = styleId ? styleManager.getStyleById(styleId) : null;
		var textAlign = styleCode ? styleManager.getAttr(styleCode, websheet.Constant.Style.TEXT_ALIGN) : null;
		if (textAlign == null || textAlign.length == 0) {
			var direction = styleCode ? styleManager.getAttr(styleCode, websheet.Constant.Style.DIRECTION) : null;
			if (!direction) {
				var cellModel = docObj.getSheet(sheetName).getCell(row, col, websheet.Constant.CellType.MIXED, true);
				var v = cellModel ? cellModel.getRawValue() : "";
				direction = BidiUtils.isTextRtl(v) ? "rtl" : "ltr";
			}
			if (direction == "rtl") {
				if (styleCode)
					styleCode.setAttr(websheet.Constant.Style.TEXT_ALIGN, "right");
				else {
					styleCode = new Object();
					styleCode._attributes = new Array();
					styleCode._attributes[websheet.Constant.Style.TEXT_ALIGN] = "right";
				}
			}
		}
	
		return styleCode;
	},
			
	/**
	 * get current document model
	 */
	getDocumentObj: function()
	{
		if(!this.docObj)
		{
			this.docObj = this.getEditor().getDocumentObj();
		}
		return this.docObj;
	},

	setEditor: function(editor) {
		this.editor = editor;
	},
	
	/**
	 * get editor
	 */
	getEditor: function() {
		return this.editor;
	},
	
	_pushObj:function(array, obj, cnt, followStyle, emptyObj)
	{
		var item = emptyObj;
		if(followStyle)
			item = obj;
		if(cnt == undefined || cnt == null)
			cnt = 1;
		
//		var len = array.length;
		for(var i=0; i<cnt; i++)
		{
//		    array[len++] = item; // it doesn't work for generic array for formula calculation
			array.push(item);
		}
	},
	
	/*
	 * @param params
	 */
	_getObjs:function(sIndex, models, type, startIndex, endIndex, params)
	{
		var bArray = params.bArray;
		var followStyle = params.followStyle;
		var emptyObj = params.emptyObj;
		var isContainCovered = params.isContainCovered;
		var docObj = this.getDocumentObj();
		var maxSheetRows = docObj.maxSheetRows;
		var objs = null;
		if(bArray) {
			objs = [];
		} else
			objs = {};
		
		if (params["bNoConstraints"]) {
			// Don't constaint endIndex to max row. If has any row model after max row, it will not  
			;
		} else {
			 if(type== this.Constant.OPType.ROW && endIndex> maxSheetRows) {
				 endIndex= maxSheetRows;
			 }
		}
		
		var colSpan = 0;//only >0 when type is cell
		if(isContainCovered && models.length)//correct initial colSpan, used when delete a column containing isCovered cells
		{
			if(sIndex >= models.length || !(models[sIndex]._colSpan)){//must make sure all the colspan > 1;
				var rowModel = models[0]._parent;
				if(rowModel._coverInfos.length){
					var mainCover = rowModel.getCell(startIndex,this.Constant.CellType.COVERINFO,true);
					if(mainCover)						
						colSpan = mainCover.getCol() + mainCover._colSpan - startIndex;					
				}
			}
		}
		
		var pos = -1 ;//pointer to cell with _isCovered.
		var idManager = docObj._getIDManager();
		if(sIndex < models.length)
		{
			var index = sIndex;
			while(index < models.length)
			{
				var model = models[index++];
				var mIndex = -1;
				switch(type)
				{
				case this.Constant.OPType.COLUMN: 
				case this.Constant.OPType.ROW:
					mIndex = model.getIndex();
					break;
				case this.Constant.OPType.CELL:
					mIndex = idManager.getColIndexById(model._getSheet()._id,model._id);
					mIndex = mIndex > -1 ? mIndex+1 : -1;
					break;
				}
				
				var num = model.getRepeatedNum();
				if(mIndex > endIndex)
					break;
				else if(mIndex < startIndex)
				{
					var cnt = mIndex + num - startIndex;
					if(bArray)
					{
						var count = endIndex - startIndex;
						if(cnt > count)
							cnt = count;
						objs.push(model);
						if(colSpan > 0){//mIndex < startIndex, model has repeatednum, don't have colSpan, the model is a tmp cell.					
							var r = Math.min(colSpan, cnt+1);
							var colId = idManager.getColIdByIndex(model._getSheet()._id, startIndex -1,true);
							
							colSpan -= r;
							pos += r;
							
							model._id = colId;
							model._repeatednum = r - 1;
							model._isCovered = true;
							this._pushObj(objs, model, r-1, followStyle, emptyObj);	
							
							if(cnt > r-1){//need to add cell without isCovered either, create a new cell model
								var tmpID = idManager.getColIdByIndex(model._getSheet()._id, pos + startIndex,true);
								var tmpModel = new websheet.model.Cell(model._parent, tmpID); 
								tmpModel.mixin(model);
								if(model._styleId)//copy the styleId
									tmpModel._styleId = model._styleId;
								delete tmpModel._isCovered;
								tmpModel._repeatednum = cnt - r;
								objs.push(tmpModel);
								this._pushObj(objs, tmpModel, cnt - r, followStyle, emptyObj);
							}
						}
						else
							this._pushObj(objs, model, cnt, followStyle, emptyObj);
					}
					else //push to map
					{
						if(cnt > 0)
						{
							var key = startIndex;
							if(type == this.Constant.OPType.COLUMN || type == this.Constant.OPType.CELL)
							{
								key = websheet.Helper.getColChar(key);
							}
							objs[key] = model;
						}
					}
					continue;
				}
				if(bArray)
				{
					this._pushObj(objs, emptyObj, mIndex - objs.length - startIndex, followStyle, emptyObj);
					
					if(colSpan > 0 && pos < objs.length - 1){
						var colIndex = pos + 1 + startIndex;
						var colId = idManager.getColIdByIndex(model._getSheet()._id,colIndex - 1,true);
						var tmpModel = new websheet.model.Cell(model._parent, colId);
						tmpModel._isCovered = true;
						var r = Math.min(colSpan, objs.length - 1 - pos);
						tmpModel._repeatednum = r -1;
					
						objs[++pos] = tmpModel;
						
						if(followStyle){
							for(var p = 0; p < r-1; p++)
								objs[++ pos] = tmpModel;								
						}else							
							pos += r - 1;
						
						colSpan -= r;
					}
					
					objs.push(model);
					if(isContainCovered){						
						if(model._colSpan){//model doesn't have repeatednum
							colSpan = model._colSpan - 1;
							pos = objs.length -1;;
						}else if(colSpan > 0){	
							var count = endIndex - mIndex; 
							var r = Math.min(count, num, colSpan-1);//repeatednum
							
							pos += r+1;
							colSpan = colSpan - r -1;
							
							//num -r is number of cells without isCovered, mIndex + r + 1 is its colIndex					
							if(num - r > 0 && mIndex + r < endIndex){//split the cell to two cells.
								objs.pop();
								var tmpModel = new websheet.model.Cell(model._parent, model._id);
								tmpModel.mixin(model);
								if(model._styleId)//copy the styleId
									tmpModel._styleId = model._styleId;
								tmpModel._repeatednum = r;
								tmpModel._isCovered = true;
								objs.push(tmpModel);
								this._pushObj(objs, tmpModel, r, followStyle, emptyObj);//push cells with isCovered and repeatednum	
								
								mIndex += r + 1;
								num -= r + 1;
								var tmpID = idManager.getColIdByIndex(model._getSheet()._id, mIndex -1 ,true);
								model._id = tmpID;								
								model._repeatednum = num;						
								objs.push(model);//num cells will be pushed latter;
							}else
								model._isCovered = true;														
						}		
					}	
				}else //push to map
				{
					var key = mIndex;
					if(type == this.Constant.OPType.COLUMN || type == this.Constant.OPType.CELL)
					{
						key = websheet.Helper.getColChar(key);
					}
					objs[key] = model;
				}
				var count = endIndex - mIndex; 
				var bEnd = false;
				if( count <= num)
				{
					num = count;
					bEnd = true;
				}
				if(index==models.length)
				{
				    if(!followStyle)
				        break;
				    if(followStyle && type== this.Constant.OPType.ROW && model.isNull())
				        break;
				}
				  
				if(bArray)
					this._pushObj(objs, model, num, followStyle, emptyObj);//colSpan has been checked when push model to array				
				if(bEnd)
					break;
			}
		}
		if(colSpan > 0){//add empty cell with isCovered.
			if(bArray){
				var colIndex = objs.length + startIndex;
				if(colIndex <= endIndex){
					var colId = idManager.getColIdByIndex(models[0]._getSheet()._id, colIndex -1,true);
					var tmpModel = new websheet.model.Cell(models[0]._parent, colId); 
					tmpModel._isCovered = true;
					var r = Math.min(colSpan-1, endIndex - colIndex);
					tmpModel._repeatednum = r;
					objs.push(tmpModel);
					if(followStyle)
						this._pushObj(objs, tmpModel, r, followStyle, emptyObj);
				}
			}
		}
		return objs;
	},
	
	/*
	 * get the min column index for show, the cells which contain value, or style
	 * @prarm erIndex if -1, means the last row
	 */
	getMinColIndex4Show: function(sheetName, srIndex, erIndex)
	{
		if(!erIndex) erIndex = srIndex;
		
		var docObj = this.getDocumentObj();
		var sheet = docObj.getSheet(sheetName);
		var rows = sheet.getRows();
		var sPos = sheet.getRowPosition(srIndex);
		if(sPos < 0)
			sPos = -(sPos + 1);
		
		var minColIndex = this.Constant.MaxColumnIndex;
		var length = rows.length;
		if(erIndex == -1 && length > 0)
		{
			var lastRowIndex = rows[length -1].getIndex();
			var repeateNum = rows[length -1]._repeatedNum;
			repeateNum = repeateNum ? repeateNum: 0;
			erIndex = lastRowIndex + repeateNum;
		}
		while(sPos < length)
		{
			var rowModel = rows[sPos];
			var rIndex = rowModel.getIndex();
			if(rIndex >= srIndex && rIndex <= erIndex )
			{
			    var lastIndex = rowModel.getMinColIndex4Show();
			    minColIndex = (lastIndex < minColIndex) ? lastIndex : minColIndex;
			}
			else 
				break;
			sPos++;
		}

		return minColIndex ;
	},
	
	/*
	 * get the max column index for show, the cells which contain value, or style
	 * @prarm erIndex if -1, means the last row
	 */
	getMaxColIndex4Show: function(sheetName, srIndex, erIndex)
	{
		if(!erIndex) erIndex = srIndex;
		
		var docObj = this.getDocumentObj();
		var sheet = docObj.getSheet(sheetName);
		var rows = sheet.getRows();
		var sPos = sheet.getRowPosition(srIndex);
		if(sPos < 0)
			sPos = -(sPos + 1);
		
		var maxColIndex = 0;
		var length = rows.length;
		if(erIndex == -1 && length > 0)
		{
			var lastRowIndex = rows[length -1].getIndex();
			var repeateNum = rows[length -1]._repeatedNum;
			repeateNum = repeateNum ? repeateNum: 0;
			erIndex = lastRowIndex + repeateNum;
		}
		while(sPos < length)
		{
			var rowModel = rows[sPos];
			var rIndex = rowModel.getIndex();
			if(rIndex >= srIndex && rIndex <= erIndex )
			{
			    var lastIndex = rowModel.getMaxColIndex4Show();
				maxColIndex = (lastIndex > maxColIndex) ? lastIndex : maxColIndex;					
			}
			else 
				break;
			sPos++;
		}

		return maxColIndex > this.Constant.MaxColumnIndex ? this.Constant.MaxColumnIndex : maxColIndex;
	},
	
	/**
	 * return the rows model of rangeInfo
	 * 
	 * @param bNoConstraints don't constraint result using max sheet rows, just return all rows at all costs.
	 */
	getRows:function(rangeInfo, bArray, followStyle, bNoConstraints)
	{
		var emptyRow = null;
		var sheetName = rangeInfo.sheetName;
		var startRow = rangeInfo.startRow;
		var endRow = rangeInfo.endRow;
		var rowCnt = endRow - startRow + 1;
		var docObj = this.getDocumentObj();
		var sheet = docObj.getSheet(sheetName);
		if(sheet)
		{
			var rowModels = sheet.getRows();
			var sRIndex = sheet.getRowPosition(startRow);
			if(sRIndex < 0){
				sRIndex = -(sRIndex + 1);
			}
			var params = {bArray: bArray, followStyle: followStyle, emptyObj: emptyRow};
			if (bNoConstraints) {
				params["bNoConstraints"] = true;
			}
			var rows = this._getObjs(sRIndex, rowModels, this.Constant.OPType.ROW, startRow, endRow, params);
			var retMap = {};
			retMap.start = startRow;
			retMap.data = rows;
			return retMap;
		}
		return null;
	},
	
	/**
	 * return two-dimensional array of cells in the range
	 * each row is the cells map with the column character as key.
	 * Note that you can't make change on the cell model, it could be one mixed object (temporary cell object).
	 * @param bRow		true - contains row height and visibility info
	 */
	/*Array*/getMixedCells: function(rangeInfo, bRow) {
		var iter = new websheet.model.RangeIterator(rangeInfo, websheet.Constant.RangeIterType.MIXED);
		var bFollowStyle = false; // true - the repeated row should be the same with the previous style row
								 // false - the repeated row should be []
		var currentRow = -1; // row index
		var currentRowModel = null; // row model
		var currentCell = null; // cell model
		var cellList = [];
		var rowList = [];
		var colIndex = rangeInfo.startCol;
		var rowIndex = rangeInfo.startRow;
		var wcs = websheet.Constant.Style;
		iter.iterate(function(obj, row, col) {
			var cell = obj.cell, rowModel = obj.row;
			if (currentRow == -1)  {
				for (var i = rangeInfo.startRow; i < row; ++i)
					rowList.push([]);
				
				currentRow = row;
				currentRowModel = obj && obj.row;
				if (currentRow > rangeInfo.startRow)
					rowIndex = currentRow;
			}
			if (currentRow != row) {
				// iterate into next row
				currentCell = null;
				
				var rn = currentRowModel._repeatedNum + currentRow - rowIndex;
				var rowData = {
					data:	cellList,
					index:	currentRow,
					rn: 	rn
				};
				if (bRow) {
					// somehow the height in row model isn't one integer, need to make sure that it is integer in msg json,
					// otherwise exception will happen at server side when apply the message.
					rowData[wcs.HEIGHT] = currentRowModel.getHeight();
					if (rowData[wcs.HEIGHT])
						rowData[wcs.HEIGHT] = Math.round(rowData[wcs.HEIGHT]);
					rowData.visibility = currentRowModel.getVisibility();
				}
				rowList.push(rowData);
				for (var i = 1; i <= rn; ++i) {
					var r = (bFollowStyle || currentRow < rangeInfo.startRow) ? rowData : [];
					rowList.push(r);
				}

				for (var i = rowIndex + rn + 1; i < row; ++i)
					rowList.push([]);
				
				cellList = [];
				currentRow = row;
				currentRowModel = obj && obj.row;
				rowIndex = currentRow;
				colIndex = rangeInfo.startCol;
			}

			var bEmptyCell = !cell || websheet.model.ModelHelper.isEmpty(cell._rawValue);
			if (!currentCell ||
				!cell ||
				!bEmptyCell ||
				cell._styleId != currentCell._styleId ||
				(cell._isCovered && !currentCell._isCovered) ||
				cell._colSpan || cell._rowSpan) {// coverInfo
				if (cell) {
					for (var i = colIndex; i < col; ++i)
						cellList.push(null);
					cellList.push(cell);
					var rn = cell._repeatednum ? cell._repeatednum : 0;
					for (var i = 1; i <= rn; ++i)
						cellList.push(cell);
					colIndex = col + 1 + rn;
				}
				currentCell = cell;
				if (!bEmptyCell)
					currentCell = null;
			} else {
				if (currentCell._repeatednum == null)
					currentCell._repeatednum = 0;
				currentCell._repeatednum ++;
				cellList.push(currentCell);
				colIndex = col + 1;
				if(cell._repeatednum){
					currentCell._repeatednum += cell._repeatednum;
					colIndex += cell._repeatednum;
				}
			}
			
			return true;
		});

		if (currentRow != -1) {
			var rn = currentRowModel._repeatedNum;
			var rowData = {
				data:	cellList,
				index:	currentRow,
				rn: 	rn
			};
			if (bRow) {
				rowData[wcs.HEIGHT] = currentRowModel.getHeight();
				if (rowData[wcs.HEIGHT])
					rowData[wcs.HEIGHT] = Math.round(rowData[wcs.HEIGHT]);
				rowData.visibility = currentRowModel.getVisibility();
			}
			rowList.push(rowData);
			if (currentRow < rangeInfo.startRow) {
				var endRow = rn + currentRow < rangeInfo.endRow ? rn + currentRow : rangeInfo.endRow;
				for (var i = 1; i <= endRow - rowIndex; ++i)
					rowList.push(bFollowStyle ? rowData : []);
			}
		}
		
		return rowList;
	},
	
	/*
	 * get two-diemensional array of value cells for one range specified by 'rangeInfo'.
	 * The returned array is ordered by row by default.
	 * @param	rangeInfo		range info
	 * @param	bColumn			true if the two-dimensional array is ordered by column 
	 */
	/*Array*/getCells: function(rangeInfo, bColumn) {
		var startRow = rangeInfo.startRow;
		var startCol = rangeInfo.startCol;
		var rows = [];
		var oneRow = [];
		var currentRow = -1;
		var currentCol = startCol;
		var iter = new websheet.model.RangeIterator(rangeInfo, websheet.Constant.RangeIterType.OPTIMIZEVALUE);
		iter.iterate(function(cell, row, col) {
			if (currentRow == -1) {
				for (var i = startRow; i < row; ++i)
					rows.push([]);
				
				currentRow = row;
			} else if (currentRow != row) {
				// iterate into new row
				rows.push(oneRow);
				
				for (var i = currentRow + 1; i < row; ++i)
					rows.push([]);
				
				currentRow = row;
				currentCol = startCol;
				oneRow = []; // reset it
			}
		
			for (var i = currentCol + 1; i < col; i++)
				oneRow.push(null);
			oneRow.push(cell);
			currentCol = col;
			return true;
		});
		
		if (currentRow != -1)
			rows.push(oneRow);
		
		if (rows.length == 0) rows.push([]);
		
		if (bColumn) {
			var endCol = rangeInfo.endCol;
			var columnCount = endCol - startCol + 1;
			var cols = [];
			// adjust rows array to fit column range
			for (var index = 0, fixLength = rows.length; index < fixLength; index ++) {
				var row = rows[index];
				if (row.length < columnCount) {
					var cell = row[0];
					if (cell) {
						var col = cell.getCol();
						if (col > startCol) {
							Array.prototype.splice.apply(row, [0, 0].concat(new Array(col - startCol)));
						}
					} else {
						// cell is null, continue to search the first non-empty cell;
						for (var k = 0, rowLen = row.length; k < rowLen; k ++) {
							cell = row[k];
							if (cell) {
								var col = cell.getCol();
								if (col > startCol) {
									Array.prototype.splice.apply(row, [0, 0].concat(new Array(col - startCol - k)));
								}
							} else {
								continue;
							}
						}
					}
				}
			}
			for(var i = 0, rowsLength = rows.length; i < rowsLength; i++) {
				var row = rows[i];
				for (var j = 0; j < columnCount; j++) {
					if (!cols[j]) {
						cols[j] = [];
					}
					cols[j][i] = row[j];
				}
				if (cols.length == 0) cols.push([]);
			}
			return cols;
		}
		
		return rows;
	},

	/**
	 * return column models of rangeInfo
	 */
	getCols:function(rangeInfo, bArray, followStyle)
	{
		var docObj = this.getDocumentObj();
		var cols = [];
		var emptyCol = null;
		try{
			var sheetName = rangeInfo.sheetName;
			var startCol = rangeInfo.startCol;
			var endCol = rangeInfo.endCol;
			var colCnt = endCol - startCol + 1;
			if( startCol > 0 && colCnt > 0)
			{
				var sheet = docObj.getSheet(sheetName);
				if(sheet)
				{
					var colModels = sheet.getColumns();
					var sCIndex = sheet.getColumnPosition(startCol,true);
					if(sCIndex < 0){
						sCIndex = -(sCIndex + 1);
					}
					var params = {bArray: bArray, followStyle: followStyle, emptyObj: emptyCol};
					cols  = this._getObjs(sCIndex, colModels, this.Constant.OPType.COLUMN, startCol, endCol, params);
				}
			}
		}catch(e)
		{
		}
		var retMap = {};
		retMap.start = startCol;
		retMap.data = cols;
		return retMap;
	},
	
	/**
	 * get the delta style json to construct the undo event for set column style
	 * @param sheet 		: sheet model
	 * @param startCol		: 1-based
	 * @param endCol		: 1-based
	 * @param style			: json
	 * @returns 			: format {colum: {style:}}
	 */
	getDeltaColsStyleJson: function(sheet, startCol, endCol, style)
	{
		var ret = {};
		var cols = sheet._columns;
		var styleManager = sheet._parent._getStyleManager();
		var eDelta = styleManager.getDelta(null, style); 
		
		var pos = sheet.getColumnPosition(startCol,true);
		if(pos < 0)
			pos = -(pos + 1);
		
		var index = startCol;
		var length = cols.length;
		for(var i = pos; i < length; i++)
		{
			var col = cols[i];
			var sCol = col.getIndex();
			var eCol = col._repeatedNum ? sCol + col._repeatedNum  : sCol;
			if(sCol < startCol) sCol = startCol;
			if(eCol > endCol) eCol = endCol;
			if(index < sCol)
			{
				if(eDelta)
				{
					var json = {style:eDelta};
					var repNum = sCol <= endCol ?  (sCol - index - 1) : (endCol - index );
					if(repNum > 0)
						json.rn = repNum;
					var strCol = websheet.Helper.getColChar(index);
					ret[strCol] = json;
				}	
				index = sCol;
				if(index > endCol) break;
			}	
			if(index == sCol)
			{
				var deltaStyle = eDelta;
				if(col._styleId)
				{
					var styleObject = styleManager.getStyleById(col._styleId);
					deltaStyle = styleManager.getDelta(styleObject.toJSON(), style);
				}	
				if(deltaStyle)
				{
					var json = {style:deltaStyle};
					var repNum = eCol - index;
					if(repNum > 0)
						json.rn = repNum;
					var strCol = websheet.Helper.getColChar(index);
					ret[strCol] = json;
				}	
				index = eCol + 1;
			}	
			if(index > endCol) break;
		}	
		if(index <= endCol && eDelta)
		{
			var json = {style:eDelta};
			var repNum = endCol - index;
			if(repNum > 0)
				json.rn = repNum;
			var strCol = websheet.Helper.getColChar(index);
			ret[strCol] = json;
		}	
		return ret;
	},
	
	/**
	 * construct range json for event. format:
	 * { <row index> : { cells : { <column name> : { ... }, ... }, ... }, ... },
	 * if forColumn parameter is set to true, then returns:
	 * { rows: { ... }, width: { ... }, style: { ... } }
	 * Parameter:
	 * sheetName: sheet name
	 * startRow: start row index,
	 * startCol: start column index,
	 * endRow: end row index
	 * endCol: end column index
	 * param: parameter object hash. includes:
	 * includeColumnStyle: default to true, for empty cell, include column style into json, if includeStyle is false, ignore this parameter
	 * includeValue: default to true, include cell value in json
	 * includeStyle: default to true, include cell style in json
	 * computeDelta: default to false, for cell style, compute delta with provided style parameter
	 * style: if computeDelta is true, must set to compute delta with
	 * forRow: default to false, toRangeJson compute for 1 or more row(s),
	 * 		if set to true, then startCol is set to 1, endCol is set to MaxColumnIndex,
	 * 		returned row JSON will include row visibility and row height, this need not set if
	 * 		row visibility and height info is not needed && endColIndex is set.
	 * forColumn: default to false, toRangeJson compute for 1 column (till now, limitation).
	 * 		if set to true, then endCol is set to startCol (TODO), startRow is set to 1, endRow is set to MaxRowNum
	 * checkFilter: default to false. If set to true, the rows content that are filtered will not be got.
	 * bRawValue: default to false. If set to true, the cell rawValue use cell._rawValue, else use getRawValue()
	 * ignoreFilteredRows: default to false. If set to true, filtered rows will not be ignored.
	 */
	_defaultToRangeJsonParam: {
		includeColumnStyle: true,
		includeValue: true,
		includeStyle: true,
		computeDelta: false,
		style: null,
		forRow: false,
		forColumn: false,
		checkMerge: false,
		checkFilter: false,
		forCopy: false,
		checkHidden : false,
		ignoreFilteredRows: false
	}, 
	
	toRangeJSON:function(sheetName, startRow, startCol, endRow, endCol, params)
	{
		params = dojo.mixin({}, this._defaultToRangeJsonParam, params);
		var bRow = params.forRow;
		if (bRow) {
			startCol = 1;
			endCol = this.Constant.MaxColumnIndex;
		}
		
		var bColumn = params.forColumn;
		if (bColumn) {
//			endCol = startCol;
			startRow = 1;
			endRow = this.Constant.MaxRowNum;
		}
		var filteredRowNum = 0;
		var filterConstant = this.Constant.ROW_VISIBILITY_ATTR.FILTER;
		var range = {};
		range.sheetName = sheetName;
		range.startRow = startRow;
		range.startCol = startCol;
		range.endRow = endRow;
		range.endCol = endCol;
		var bIncludeColumnStyle = params.includeColumnStyle;
		var cols = [], colsStyleCode = [];
		if (bIncludeColumnStyle || bColumn) {
			cols = this.getCols(range, /* bArray */ true, /* followStyle */ true).data;
			for(var i = 0; i < cols.length; i++)
			{
				if(cols[i])
					colsStyleCode[i] = cols[i].getStyle();
			}	
		}
		var cells = this.getMixedCells(range, bRow || params.checkFilter || params.ignoreFilteredRows);
		var emptyRowJSON = null; // get from _toEmptyRowStyleJSON, and can be reused by other empty rows
		var docObj = this.getDocumentObj();
		var maxSheetRows = docObj.maxSheetRows;
		var styleManager = docObj._getStyleManager();
		var bStyle = params.includeStyle;
		var bValue = params.includeValue;
		var bDeltaStyle = params.computeDelta;
		var style = params.style;
		var bRawValue = params.bRawValue;
		var deltaStyleMap = {}; //only used when bDeltaStyle = true,key is the cell style id, value is the delta style with newStyle
		var hashMap4DeltaStyle = {};// used for deltaStyleMap, cause in deltaStyleMap, maybe the different style id would have the same json value
		                            // here in this map, the key is the hashcode of the json
		var eDelta = null;
		var wcs = websheet.Constant.Style;
		if (bDeltaStyle) {
			eDelta = styleManager.getDelta(null, style);
			var eDeltaStyleCode = new websheet.style.StyleCode(this.Constant.PARAM_TYPE.JSON,eDelta);
			hashMap4DeltaStyle[eDeltaStyleCode.hashCode()] = eDelta;
		}
		
		//even it does not contain any cell, but column style might be there
		if(cells.length == 0 && bIncludeColumnStyle)
		{
			var emptyMap = {};
			emptyMap.start = startCol;
			emptyMap.data = [];
			emptyMap.rn = endRow - startRow;
			emptyMap.index = startRow;	
			cells.push(emptyMap);
		}
		
		var i=0;
		var previousRowJson = null;
		var bPreviousRowHasValue = false;
		var bCurrentRowHasValue = false;
		var cellsJSON = {};
		var maxRowNum = this.Constant.MaxRowNum;
		
		if(bDeltaStyle && params.enlargeForBorderStyle){
			// split repeat rows for enlarged start/end row
			if(params.enlargeForBorderStyle.startRow){
				var firstRow = cells[0];
				if(firstRow.index == startRow && firstRow.rn > 0){
					var veryFirstRow = {
							data:	firstRow.data,
							index:	startRow,
							rn: 	0,
							h:		firstRow.h,
							visibility: firstRow.visibility
					};
					
					cells.splice(0, 0, veryFirstRow);
					firstRow.index++;
					firstRow.rn--;
				}
			}
			if(params.enlargeForBorderStyle.endRow){
				var lastRow = cells[cells.length - 1];
				if(lastRow && lastRow.index < endRow && lastRow.rn > 0 && (lastRow.index + lastRow.rn >= endRow)){
					var veryLastRow = {
							data:	lastRow.data,
							index:	endRow,
							rn: 	0,
							h:		lastRow.h,
							visibility: lastRow.visibility
					};
					cells.push(veryLastRow);
					lastRow.rn = endRow - lastRow.index - 1;
				}
			}
		}
		while(i <= (endRow - startRow))
		{
			var rowData = null;
			var rowJSON = null;
			var bEmptyRowModel = false;
			bCurrentRowHasValue = false;
			var row = cells[i];
			if(i >= cells.length)
			{
				if(bDeltaStyle && params.enlargeForBorderStyle && params.enlargeForBorderStyle.endRow && veryLastRow){
					row = veryLastRow;
				} else
				// go beyond row model, attach left row models if:
				// 1) it is computing delta && 
				// 2) it is not for column
				// OR
				// 1) it is not computing delta &&
				// 2) column array > 0
				// 3) include column style
				if ((bDeltaStyle && !bColumn) || (!bDeltaStyle && cols.length > 0 && bIncludeColumnStyle)) {
					rowJSON = {};
					// compute left cell model's repeatednum
					// we have generated all rows in array cells[], so the left row models is total row count - rows in cells - (last row repeatednum)
					// we must minus last row repeat num since it is not included in cell.length
					var lastRow = cells[cells.length - 1];
					var rNum = endRow - startRow - cells.length;
					if (lastRow.rn)
					{
						rNum -= lastRow.rn;
					}
					
					if(rNum > 0)
					{
						rowJSON.rn = rNum;
					}
				} else {
					break;
				}
			}
			
			if(row)
			{
				rowData = row.data;
				var rowIndex = Math.max(row.index, i + startRow);
				var rowRepeate = row.rn;
				if(rowRepeate != null && rowRepeate != 0)
				{
					if(!rowJSON)
						rowJSON = {};
					var count = endRow - rowIndex;
					if( (count >= 0) && (count < rowRepeate))
					{
						rowRepeate = count;
					}
					if (bColumn && !bDeltaStyle && rowIndex + rowRepeate > maxSheetRows) {
						// force it to repeat to last row (1048576)
						rowRepeate = maxRowNum - rowIndex;
					}
					if(bDeltaStyle && params.enlargeForBorderStyle){
						// do not repeat the enlarged cell because they do not have the same delta style
						if(params.enlargeForBorderStyle.startRow && (i == 0))
							rowRepeate = 0;
						else if(params.enlargeForBorderStyle.endRow && ((rowIndex + rowRepeate) >= endRow)){
							rowRepeate = endRow - rowIndex - 1;
						}
					}
					if(rowRepeate > 0)
						rowJSON.rn = rowRepeate;
				}

				if (params.ignoreFilteredRows) {
					if (previousRowJson && 
							((previousRowJson.visibility === filterConstant) ^ (row.visibility === filterConstant))) {
						previousRowJson = null;
					}
					if (!bColumn && row.visibility === filterConstant) {
						if (row.rn) {
							i += parseInt(row.rn) + 1;
						} else {
							i++;
						}
						continue;
					}
				}

				if(row.visibility!=null)
				{
				    if(params.checkFilter && row.visibility == filterConstant)
                    {
              			filteredRowNum ++; // add myself first.
              			i++;
                        if(rowRepeate) 
                        {
                            filteredRowNum += rowRepeate;
                        	i += rowRepeate;
                        }
                        continue;
                    }
				    
					if(!rowJSON)
						rowJSON = {};
					rowJSON.visibility = row.visibility;
				}
				if (row[wcs.HEIGHT] != null) 
				{
					if (!rowJSON) {
						rowJSON = {};
					}
					rowJSON[wcs.HEIGHT] = row[wcs.HEIGHT];
				}
			}
			if (bDeltaStyle && (!rowData || (rowData.length == 0)))
				bEmptyRowModel = true;
				
			if(bEmptyRowModel)
			{
				if(!rowJSON)
					rowJSON = {};
				if(!emptyRowJSON){
					emptyRowJSON = {};
					if( !(bColumn && bDeltaStyle && !bIncludeColumnStyle)) {
						// only compute emptyRowJSON when it is not for delta columns style. since for delta columns style, empty row cells
						// should remain empty to show delta column styles.
						var sc = startCol;
						var ec = endCol;
						if( params.enlargeForBorderStyle ) {
							if(params.enlargeForBorderStyle.startCol)
								sc = startCol + 1;
							if(params.enlargeForBorderStyle.endCol)
								ec = endCol - 1;
						}
						this._toEmptyRowStyleJSON(emptyRowJSON, sheetName, sc, ec, cols, bDeltaStyle, style);
					}
				}
				rowJSON.cells = emptyRowJSON;
			}
			else
			{
				var j=0;
				var previousCellJson = null;
				while( j<= (endCol - startCol))
				{
					var cellJSON = null;
					var cell = null;
					if(rowData)
					{
						if( j >= rowData.length) 
						{
							if(!bDeltaStyle)
							{
								if(j >= cols.length || (bColumn && !bIncludeColumnStyle))
									break;
							}
							if(!rowJSON)
								rowJSON = {};
							if(!rowJSON.cells)
								rowJSON.cells = {};
							var newCols = cols.slice(j);
							if( !(bColumn && bDeltaStyle && !bIncludeColumnStyle)) {
								// only compute emptyRowJSON when it is not for delta columns style. since for delta columns style, empty row cells
								// should remain empty to show delta column styles.
								var sc = j + startCol;
								var ec = endCol;
								if( params.enlargeForBorderStyle ) {
									if(params.enlargeForBorderStyle.startCol && j == 0)
										sc = startCol + 1;
									if(params.enlargeForBorderStyle.endCol)
										ec = endCol - 1;
								}
								this._toEmptyRowStyleJSON(rowJSON.cells, sheetName, sc, ec, newCols, bDeltaStyle, style, previousCellJson);
							}
							break;
						}
						cell = rowData[j];
					}
					if(cell)
					{
						/**
						 * All cells in deleted row/column need to regenerateFormula for undo
						 */
						if(params.bUpdateFormula){
							if (cell.getUpdateFormula()){ 
								cell.regenerateFormula();
							}
						}
						var bCopyCell = true;	
						if(params.checkMerge)
						{
							var colspan = cell._colSpan;
							var rowspan = cell._rowSpan;
							var iscovered = cell._isCovered;
							// for any merge cell, if its merged cells aren't contained in the range,
							// don't copy the cell content
							if(colspan>1)
							{   // master merge cell
								if(cell.getCol()+colspan-1>endCol || cell.getRow()+rowspan-1>endRow)
									bCopyCell = false;
							}
							else if(iscovered)
							{   // cell being merged
								var coverInfo = null;
								// first check if this covered cell is belong to the inserted columns
								var sheet = docObj.getSheet(sheetName);
								var coverCol = sheet.getColumn(cell.getCol(), true);
								if(coverCol) {
									var coverInfo = coverCol.getCoverInfo(cell.getRow(),true);
									if(coverInfo != null) {
										var csc = coverInfo.getCol();
										var cec = csc + coverInfo.getColSpan() - 1;
										var csr = coverInfo.getRow();
										var cer = csr + coverInfo.getRowSpan() - 1;
										if(!(csc>=startCol && cec<=endCol
												&& csr>=startRow && cer<=endRow))
											bCopyCell = false;
									}
								}
							}
						}
						
						if(bCopyCell)
						{
							var p = {bStyle: bStyle, bValue: bValue, bExcludeColspan: bDeltaStyle, bStyleId: bDeltaStyle, bRawValue: bRawValue, forCopy:params.forCopy, forCut:params.forCut, checkHidden:params.checkHidden};
							cellJSON = this.toCellJSON(cell, p);//return value and style, last two param means bExcludeColspan = bDeltaStyle, bStyleId=bDeltaStyle
														//(return style json or style id depend on bDeltaStyle)
							if(params.forCopy && cellJSON)
								cellJSON.model = cell;
						}
					}
					
					if(bIncludeColumnStyle &&(!cellJSON || !cellJSON.style))
					{
						var col = cols[j];
						if(col)
						{
							//put style id if bDeltaStyle
							if(bDeltaStyle)
							{
								var cStyleId = col._styleId;
								if(cStyleId)
								{	
									if(!cellJSON)
										cellJSON = {};
							    	cellJSON.style = cStyleId;
								}
							}
							else
							{
								var cStyleCode = colsStyleCode[j];
							    if(cStyleCode != null)
							    {
									if(!cellJSON)
										cellJSON = {};
							    	cellJSON.style = cStyleCode.toJSON();
							    }
							}
						}
					}
					
					if(bDeltaStyle)
					{		
						if(cellJSON && cellJSON.style)//here the style must be styleid
						{
							//TODO: change the style according to bEnlargeStartRow, 
							//if style.border.top != null and current row is the very first row,
							// then set clone(style).border.bottom = style.border.top
							// incase the 
							// the adjacent cell, should not have the duplicate border, for example, either left cell has the right border or right cell has the left border
							// they can not both exist, except they have the same border
							// if they have the same border, then the enlarged cells need to get delta with the following clone style
							var bEnlargedCell = false;
							var deltaStyle = null;
							if(params.enlargeForBorderStyle){
								var cloneStyle = websheet.Helper.cloneJSON(style);
								var wscnt = websheet.Constant.Style;
								if(params.enlargeForBorderStyle.startRow && (i == 0)){
									if(cloneStyle[wscnt.BORDER]){
										cloneStyle[wscnt.BORDER][wscnt.BORDER_BOTTOM] = cloneStyle[wscnt.BORDER][wscnt.BORDER_TOP];
									}
									if(cloneStyle[wscnt.BORDERCOLOR]){
										cloneStyle[wscnt.BORDERCOLOR][wscnt.BORDER_BOTTOM_COLOR] = cloneStyle[wscnt.BORDERCOLOR][wscnt.BORDER_TOP_COLOR];
									}
									if(cloneStyle[wscnt.BORDERSTYLE]) {
										cloneStyle[wscnt.BORDERSTYLE][wscnt.BORDER_BOTTOM_STYLE] = cloneStyle[wscnt.BORDERSTYLE][wscnt.BORDER_TOP_STYLE];
									}
									bEnlargedCell = true;
								}
								if (params.enlargeForBorderStyle.endRow && (i == (endRow - startRow))){
									if(cloneStyle[wscnt.BORDER]){
										cloneStyle[wscnt.BORDER][wscnt.BORDER_TOP] = cloneStyle[wscnt.BORDER][wscnt.BORDER_BOTTOM];
									}
									if(cloneStyle[wscnt.BORDERCOLOR]){
										cloneStyle[wscnt.BORDERCOLOR][wscnt.BORDER_TOP_COLOR] = cloneStyle[wscnt.BORDERCOLOR][wscnt.BORDER_BOTTOM_COLOR];
									}
									if(cloneStyle[wscnt.BORDERSTYLE]) {
										cloneStyle[wscnt.BORDERSTYLE][wscnt.BORDER_TOP_STYLE] = cloneStyle[wscnt.BORDERSTYLE][wscnt.BORDER_BOTTOM_STYLE];
									}
									bEnlargedCell = true;
								}
								if (params.enlargeForBorderStyle.startCol && (j == 0)){
									if(cloneStyle[wscnt.BORDER]){
										cloneStyle[wscnt.BORDER][wscnt.BORDER_RIGHT] = cloneStyle[wscnt.BORDER][wscnt.BORDER_LEFT];
									}
									if(cloneStyle[wscnt.BORDERCOLOR]){
										cloneStyle[wscnt.BORDERCOLOR][wscnt.BORDER_RIGHT_COLOR] = cloneStyle[wscnt.BORDERCOLOR][wscnt.BORDER_LEFT_COLOR];
									}
									if(cloneStyle[wscnt.BORDERSTYLE]) {
										cloneStyle[wscnt.BORDERSTYLE][wscnt.BORDER_RIGHT_STYLE] = cloneStyle[wscnt.BORDERSTYLE][wscnt.BORDER_LEFT_STYLE];
									}
									bEnlargedCell = true;
								}
								if (params.enlargeForBorderStyle.endCol && (j == (endCol - startCol))){
									if(cloneStyle[wscnt.BORDER]){
										cloneStyle[wscnt.BORDER][wscnt.BORDER_LEFT] = cloneStyle[wscnt.BORDER][wscnt.BORDER_RIGHT];
									}
									if(cloneStyle[wscnt.BORDERCOLOR]){
										cloneStyle[wscnt.BORDERCOLOR][wscnt.BORDER_LEFT_COLOR] = cloneStyle[wscnt.BORDERCOLOR][wscnt.BORDER_RIGHT_COLOR];
									}
									if(cloneStyle[wscnt.BORDERSTYLE]) {
										cloneStyle[wscnt.BORDERSTYLE][wscnt.BORDER_LEFT_STYLE] = cloneStyle[wscnt.BORDERSTYLE][wscnt.BORDER_RIGHT_STYLE];
									}
									bEnlargedCell = true;
								}
							} 
							if(bEnlargedCell){
								var styleCode = styleManager.getStyleById(cellJSON.style);
								deltaStyle = styleManager.getDelta(styleCode.toJSON(), cloneStyle);
							} else {
								//get delta style in deltaStyleMap
								deltaStyle = deltaStyleMap[cellJSON.style];
								var deltaStyleForColumn = null;
								if(!deltaStyle){
									var styleCode = styleManager.getStyleById(cellJSON.style);
									deltaStyle = styleManager.getDelta(styleCode.toJSON(), style);
									
									//for undo column defaultformat, make delta with column style
									if(style && style.id){
										var col = cols[j];
										if(col){
											var cStyleId = col._styleId;
											if(cStyleId){
												styleCode = styleManager.getStyleById(cStyleId);
												deltaStyleForColumn = styleManager.getDelta(style, styleCode.toJSON());
												deltaStyle = styleManager.mixStyleJson(deltaStyle, deltaStyleForColumn);
											}
										}
									}
									//using the same style json at most, therefore when compare them, could using == to reduce time
									var deltaStyleCode = new websheet.style.StyleCode(this.Constant.PARAM_TYPE.JSON,deltaStyle);
									var hashCode = deltaStyleCode.hashCode();
									var styleJson = hashMap4DeltaStyle[hashCode];
									if(styleJson)
									{
										deltaStyle = styleJson;
									}
									else
									{
										hashMap4DeltaStyle[hashCode] = deltaStyle;
									}		
									deltaStyleMap[cellJSON.style] = deltaStyle;
								}
							}
							cellJSON.style = deltaStyle;
						}
						else
						{
							if (eDelta) 
							{
								if(bColumn && !bIncludeColumnStyle)
								{
									//generate Set column style undo event
									//If cell hasn't style, it will not be included to the undo event
									// DO NOTHING 
								}
								else
								{
									cellJSON = cellJSON || {};
									cellJSON.style = eDelta;
								}								
							}
						}
					}
					if(cellJSON)
					{
						if(!rowJSON)
							rowJSON = {};
						if(!rowJSON.cells)
							rowJSON.cells = {};
						
						// cellJSON is the cell going to store in rowJSON, see if it can be merged.
						if (bDeltaStyle 
								// do not merge cell if it is enlarged col
								&& !(params.enlargeForBorderStyle && ((params.enlargeForBorderStyle.startCol && (j == 1)) || (params.enlargeForBorderStyle.endCol && (j == (endCol - startCol))))) 
								&& this._mergeCellJson(previousCellJson, cellJSON))
						{
							// cell merge happened, do nothing, just move j forward if has repeatnum
							if (cellJSON.rn)
							{
								j += parseInt(cellJSON.rn);
							}
						}
						else
						{
							var cIndex = websheet.Helper.getColChar(j+startCol);
							rowJSON.cells[cIndex] = previousCellJson = cellJSON;
								
							bCurrentRowHasValue = bCurrentRowHasValue || (cellJSON.v != undefined);
							var _r = cellJSON.rn;
							if (_r)
							{
								// fix the cell repeatednum
								// the case that the master cell is before startCol, cut the part from cell.getCol() ~ current index
								var colIndex = cell.getCol();
								var num = j + startCol - colIndex;
									
								if (num > 0)
								{
									_r -= num;
								}
								// the case that the master cell repeat range is after endCol, cut the part from endCol ~ cell repeat end
								var count = endCol - (j+startCol); 
								if( count < _r)
								{
									_r = count;
								}
								if(bDeltaStyle && params.enlargeForBorderStyle){
									// do not repeat the enlarged cell because they do not have the same delta style
									if(params.enlargeForBorderStyle.startCol && (j == 0))
										_r = 0;
									else if(params.enlargeForBorderStyle.endCol && ((colIndex + _r) >= endCol)){
										_r = endCol - colIndex - 1;
									}
								}
							}
								
							if (_r < 1)
							{
								delete cellJSON.rn;
							}
							else if (_r != undefined)
							{
									j += parseInt(_r);
									cellJSON.rn = _r;
							}
						}
					}else{ // if the cell has no styleid,the cellJSON will be null.
						previousCellJson = cellJSON;
					}
					j++;
				}
			}
			
			if(rowJSON)
			{
				if (bDeltaStyle && previousRowJson && !bPreviousRowHasValue && !bCurrentRowHasValue
						// do not merge row if it is enlarged row
						&& !(params.enlargeForBorderStyle && ((params.enlargeForBorderStyle.startRow && (i == 1)) || (params.enlargeForBorderStyle.endRow && (i == (endRow - startRow)))))
						&& this._isRowJsonCanMerge(previousRowJson, rowJSON))
				{
					if (previousRowJson.rn == undefined)
					{
						previousRowJson.rn = 1;
					}
					else
					{
						previousRowJson.rn++;
					}
					if (rowJSON.rn)
					{
						i += parseInt(rowJSON.rn);
						previousRowJson.rn += rowJSON.rn;
					}
				}
				else
				{
				    if(params.checkFilter && !bRow)
				    {
				        delete rowJSON.visibility;
				        delete rowJSON[wcs.HEIGHT];
				    }
				        
				    var rIndex = i + startRow - filteredRowNum;
                    cellsJSON[rIndex] = previousRowJson = rowJSON;
                    bPreviousRowHasValue = bCurrentRowHasValue;
                
                    if(rowJSON.rn) 
                        i += parseInt(rowJSON.rn);
                    else
                        delete rowJSON.rn;
					
				}
			}else{
				previousRowJson = null;
			}
			//TODO: row delta style
			i++;
		}
		if(params.checkFilter)
		    cellsJSON["filterRowNum"] = filteredRowNum;
		if(params.enlargeForBorderStyle){
			var enlargedCells = {}, rowJson, colStr;
			if(params.enlargeForBorderStyle.startRow){
				// delete the upper corner cells which have nothing to do with this enlarged range
				if(bDeltaStyle){
					rowJson = cellsJSON[startRow];
					if(params.enlargeForBorderStyle.startCol){
						colStr = websheet.Helper.getColChar(startCol);
						delete rowJson.cells[colStr];
					}
					if(params.enlargeForBorderStyle.endCol){
						colStr = websheet.Helper.getColChar(endCol);
						delete rowJson.cells[colStr];
					}
				}
				websheet.Utils._trimBorderStyle(cellsJSON, enlargedCells, true, startRow, true); // trim bottom border of this row
			}
			if (params.enlargeForBorderStyle.endRow){
				// delete the bottom corner cells which have nothing to do with this enlarged range
				if(bDeltaStyle){
					rowJson = cellsJSON[endRow];
					if(rowJson && rowJson.cells) {
						if(params.enlargeForBorderStyle.startCol){
							colStr = websheet.Helper.getColChar(startCol);
							delete rowJson.cells[colStr];
						}
						if(params.enlargeForBorderStyle.endCol){
							colStr = websheet.Helper.getColChar(endCol);
							delete rowJson.cells[colStr];
						
						}
					}
				}
				websheet.Utils._trimBorderStyle(cellsJSON, enlargedCells, true, endRow, false); // trim top border of this row
			}
			if (params.enlargeForBorderStyle.startCol)
				websheet.Utils._trimBorderStyle(cellsJSON, enlargedCells, false, startCol, true); // trim right border of this column
			if (params.enlargeForBorderStyle.endCol)
				websheet.Utils._trimBorderStyle(cellsJSON, enlargedCells, false, endCol, false); // trim left border of this column
			cellsJSON.enlargedCells = enlargedCells;
		}
		return cellsJSON;
	},
	
	/*
	 * Try to merge slave cell json to master, return true if merge happens
	 */
	_mergeCellJson: function(master, slave)
	{
		if (master && this._isCellJsonCanMerge(master, slave))
		{
			if (!master.rn) {
				master.rn = 1;
			} else {
				master.rn++;
			}
			if (slave.rn) {
				master.rn += slave.rn;
			}
			return true;
		}
		else
		{
			return false;
		}
	},
	
	/*
	 * Determine if 2 row jsons can be merged. These 2 rows don't contain value, only check if styles and repeatednum are the same
	 */
	_isRowJsonCanMerge: function(json1, json2)
	{
		var cells1 = json1.cells;
		var cells2 = json2.cells;
		if (!cells1 && !cells2)
		{
			return true;
		} 
		else if (cells1 && cells2)
		{
			var length = 0;
			for (var colName in cells1)
			{
				length++;
				var cell1 = cells1[colName];
				var cell2 = cells2[colName];
				if (cell2 && this._isStyleJsonEqual(cell1.style, cell2.style))
				{
					var rn1 = cell1.rn;
					var rn2 = cell2.rn;
					if (rn1 == undefined && rn2 == undefined)
					{
						continue;
					}
					else if (rn1 == rn2)
					{
						continue;
					}
					else
					{
						return false;
					}
				}
				else
				{
					return false;
				}
			}
			for (var colName in cells2)
			{
				length--;
			}
			return (length == 0);
		}
		else
		{
			return false;
		}
	},
	
	/*
	 * Determine if provided 2 cell jsons can be merged. Cell jsons can be merge only if 2 cells doesn't have value and has same style json. 
	 */
	_isCellJsonCanMerge: function(json1, json2)
	{
		// both have no value and style json is equal
		return (json1.v == undefined && json2.v == undefined && this._isStyleJsonEqual(json1.style, json2.style));
	},
	
	_isStyleJsonEqual: function(json1, json2) {
		if (json1 == undefined && json2 == undefined) {
			return true;
		}else if(json1 == json2)
		{
			return true;
		}	
		else if (json1 && json2) {
			var length = 0;
			for (var p in json1)
			{
				var v1 = json1[p];
				if (typeof v1 == "object")
				{
					var v2 = json2[p];
					if (v2 != undefined)
					{
						for (var subp in v1)
						{
							length++;
							if (v2[subp] != undefined && v2[subp] == v1[subp])
							{
								continue;
							}
							else
							{
								return false;
							}
						}
					}
					else
					{
						return false;
					}
				}
				else
				{
					length++;
					if (json2[p] != undefined && json2[p] == v1)
					{
						continue;
					}
					else
					{
						return false;
					}
				}
			}
			
			for (var p in json2) {
				var v2 = json2[p];
				if (typeof v2 == "object")
				{
					for (var subp in v2)
					{
						length--;
					}
				}
				else
				{
					length--;
				}
			}
			return (length == 0);
		} else {
			return false;
		}		
	},
	
	//get the style for empty cells in one row from start column index to end column index
	_toEmptyRowStyleJSON:function(cellsJSON, sheetName, startCol, endCol, cols, bDeltaStyle, newStyle, previousCellJson)
	{
		var mhelper = websheet.model.ModelHelper;
		var docObj = mhelper.getDocumentObj();
		var styleManager = docObj._getStyleManager();
		var eDelta = styleManager.getDelta(null,newStyle);
		var index = startCol;
		var sIndex = 0;
		var length = 0;
		if(cols)
			length = cols.length;
		while(sIndex < length)
		{
			var col = null;
			col = cols[sIndex++];
			if(col)
			{
				var cStyleCode = col.getStyle();
				if(cStyleCode)
				{
					var colIndex = col.getIndex();
					if(bDeltaStyle)
					{
						// for empty delta style, in the case that column index > current index
						var num = colIndex - index;
						if(num > 0 && eDelta)
						{
							var cellJSON = {};
							cellJSON.style = eDelta;
							if(num > 1)
								cellJSON.rn = num - 1;
							
							if (previousCellJson && this._mergeCellJson(previousCellJson, cellJSON))
							{
								// merge happened, do nothing
								;
							}
							else
							{
								var colStr = websheet.Helper.getColChar(index);
								cellsJSON[colStr] = previousCellJson = cellJSON;
							}
						}
					}
					//for column delta style
					// if column index > current index, then choose column index, else, 
					// choose index,
					// don't confuse, if we choose index, above IF that stores cellsJSON won't happen since column index will < current index
					var tmpIndex = Math.max(colIndex, index);
					var cellJSON = {};
					if (bDeltaStyle)
					{
						cellJSON.style = styleManager.getDelta(cStyleCode.toJSON(), newStyle);
					}
					else
					{
						cellJSON.style = cStyleCode.toJSON();
					}
					var colRepeatNum = col._repeatedNum;
					if( colRepeatNum )
					{
						if ( colIndex < startCol)
						{
							colRepeatNum = colIndex + colRepeatNum - startCol;
						}
						colRepeatNum = Math.min(colRepeatNum, endCol - tmpIndex);
						if (colRepeatNum > 0) 
						{
							cellJSON.rn = colRepeatNum;
							index = tmpIndex + colRepeatNum + 1;
							sIndex += colRepeatNum;
						}
						else
						{
							index = tmpIndex;
						}
					}
					else
					{
						index = colIndex + 1;
					}
					if (bDeltaStyle && previousCellJson && this._mergeCellJson(previousCellJson, cellJSON))
					{
						// merge happened, do nothing
						;
					}
					else
					{
						var colStr = websheet.Helper.getColChar(tmpIndex);
						cellsJSON[colStr] = previousCellJson = cellJSON;
					}
				}
			}
		}
		if(bDeltaStyle)
		{
			var num = endCol - index;
			//for empty delta style
			if(num >= 0 && eDelta)
			{
				// going to fill eDelta and num as repeatednum
				var cellJSON = {};
				cellJSON.style = eDelta;
				if(num > 0)
					cellJSON.rn = num;
				if (previousCellJson && this._mergeCellJson(previousCellJson, cellJSON))
				{
					// merge happened, do nothing
					;
				}
				else
				{
					var colStr = websheet.Helper.getColChar(index);
					cellsJSON[colStr] = cellJSON;
				}
			}
		}
	},
    
	/*
	 * get the min row index in the columns(from startColIndex to endCOlIndex) which contain cell value or style
	 */
	getMinRowIndex: function(sheet, sColIndex, eColIndex)
	{
		var rows = sheet._rows;
		if(length == 0) return 0;
		var minIndex = 0;
		for(var i = 0; i < rows.length; i ++)
		{
			var rowModel = rows[i];
			var hasCell = false;
			if(rowModel.isContainValueCell()){
				for (var index = sColIndex - 1; index < eColIndex; index++) {
					if (rowModel._valueCells[index]){
						hasCell = true;
						break;
					}
				}
			}
			if(!hasCell){
				var cells = rowModel._styleCells;
				if(cells.length){
					var sIndex = this.binarySearch(cells,sColIndex,this.equalCondition,"",true,sheet._id, this.Constant.Column);
					if(sIndex >= 0)
						hasCell = true;
					else{
						//find the cell behind the sColIndex cell
						cell = cells[-sIndex-1];
						if(cell)
						{
							var cellColIndex = cell.getCol();
							if(cellColIndex >= sColIndex && cellColIndex <= eColIndex)
								hasCell = true;
						}
					}
				}					
			}
			if(!hasCell){
				var cells = rowModel._coverInfos;
				if(cells.length){
					var sIndex = this.binarySearch(cells,sColIndex,this.equalCondition,"",true,sheet._id, this.Constant.Column);
					if(sIndex >= 0)
						hasCell = true;
					else{
						//find the cell behind the sColIndex cell
						cell = cells[-sIndex-1];
						if(cell)
						{
							var cellColIndex = cell.getCol();
							if(cellColIndex >= sColIndex && cellColIndex <= eColIndex)
								hasCell = true;
						}
					}
				}
			}
		   if(hasCell){
			   minIndex = rowModel.getIndex();
			   break;
		   }
		}
		return minIndex;
	},
	
	getValidLastCol: function(sheet, bCheckStyle) 
	{
		var cols = sheet._columns;
		var maxColIndex = 1;
		var len = cols.length;
		var showVisibility = this.Constant.COLUMN_VISIBILITY_ATTR.SHOW;
		// var gCol = sheet.getGlobalStyleColumn();
		for(var i = len - 1; i >= 0; i--){
			var col = cols[i];
			var visi = col._visibility;
			if(col._width != null || col._styleId != null || (visi && visi != showVisibility))
			{
				maxColIndex = col.getIndex();
				if(col.getRepeatedNum() < this.Constant.ThresColRepeatNum)
					maxColIndex += col.getRepeatedNum();
				break;
			}
		} 
		var rows = sheet._rows;
		len = rows.length;
		for(var i = 0; i < len; i++)
		{
			var row = rows[i];
			var index = this.getLastCellInRow(row, bCheckStyle);
			if (maxColIndex < index) {
				maxColIndex = index;
			}
		}	
		return maxColIndex;
	},
	
	getLastCellInRow: function(row, bCheckStyle) {
		var defaultStyle = this.Constant.Style.DEFAULT_CELL_STYLE;
		var defaultStr = this.Constant.Style.DEFAULT;  // "Default" is custom default cell style being defined in ODS,
														   // need to ignore it here as well
		var maxColIndex = 1;
		if(row) {
			var valueCells = row._valueCells;
			for(var j = valueCells.length - 1; j >= 0; j--)
			{
				var valueCell = valueCells[j];
				if(valueCell){
					var index = valueCell.getCol();
					if (maxColIndex < index) {
						maxColIndex = index;
					}
					break;
				}
			}
			
			if(bCheckStyle){
				var styleCells = row._styleCells;
				var bValue = row.isContainValueCell();
				
				for(var j = styleCells.length - 1; j >= 0; j--)
				{
					var styleCell = styleCells[j];
					var styleId = styleCell._styleId;
					if(styleId && styleId != defaultStyle && styleId.toLowerCase() != defaultStr)
					{
						var index = styleCell.getCol();
						if(styleCell.getRepeatedNum() < this.Constant.ThresColRepeatNum)
							index += styleCell.getRepeatedNum();
						if (maxColIndex < index) {
							maxColIndex = index;
						}
						break;
					}	
				}
			}
			
			var coverInfos = row._coverInfos;
			for(var j = coverInfos.length - 1; j >= 0; j--)
			{
				var coverInfo = coverInfos[j];
				if(coverInfo){
					var index = coverInfo.getCol() + coverInfo.getRepeatedNum();
					if (maxColIndex < index) {
						maxColIndex = index;
					}
					break;
				}
			}
		}
		return maxColIndex;
	},
	
	/**
	 * get the last row which has row attributts(such as height and visiblitt)value cell, or merge cell, or un-default style cell
	 * @param sheet: sheet model
	 */
	getValidLastRow: function(sheet, bCheckStyle)
	{
		var rows = sheet._rows;
		var styleManager = sheet._parent._getStyleManager();
		var lastRowIndex = 1;
		var len = rows.length;
		var defaultHeight = sheet._rowHeight || this.Constant.defaultRowHeight;
		var defaultStyle = this.Constant.Style.DEFAULT_CELL_STYLE;
		var defaultStr = this.Constant.Style.DEFAULT;  // "Default" is custom default cell style being defined in ODS,
														   // need to ignore it here as well
		var showVisibility = this.Constant.ROW_VISIBILITY_ATTR.SHOW;
		for(var i = len - 1; i >= 0; i--)
		{
			var row = rows[i];
			if((row._height && row._height != defaultHeight) || (row._visibility && row._visibility != showVisibility))
			{
				// Do not consider repeated rows if bCheckStyle is false, because for binary xls 
				// file, there may be row with large repeat number at end of the sheet. 
				// User cannot insert row if add the repeat number.
				lastRowIndex = row.getIndex(); 
				if(bCheckStyle)
					lastRowIndex += row.getRepeatedNum();
				break;
			}
			var styleCells = row._styleCells;
			var bValue = row.isContainValueCell();
			// only check style when bCheckStyle is true			
			if(!bValue && bCheckStyle)
			{
				var cnt = styleCells.length;
				for(var j = 0; j < cnt; j++)
				{
					var styleCell = styleCells[j];
					var styleId = styleCell._styleId;
					//for border style, it's an exception, cause if you select column to set border style,
					//it's actaully set style for the related cells, and then it would reach the max row's limitation
					//here to escape the border style to make user could insert rows after set border style for column
					if(styleId && styleId != defaultStyle && styleId.toLowerCase() != defaultStr && !styleManager.isBorderStyle(styleId))
					{
						bValue = true; break;
					}	
				}	
			}	
			if(bValue)
			{				
				lastRowIndex = row.getIndex();
				if(bCheckStyle)
					lastRowIndex += row.getRepeatedNum();
				var info = {startRow:lastRowIndex, endRow:lastRowIndex, startCol:1, endCol:websheet.Constant.MaxColumnIndex, sheetName:sheet._name};
				var newInfo = websheet.Utils.getExpandRangeInfo(info);
				lastRowIndex = newInfo.endRow;
				break;
			}
		}	
		return lastRowIndex;
	},
	/*
	 * get the max row index in the columns(from startColIndex to endCOlIndex) which contain cell value or style
	 * TODO merge cell support
	 */
	getMaxRowIndex: function(sheet, sColIndex, eColIndex, valueOnly)
	{
		var rows = sheet._rows;
		if(length == 0) return 0;
		var maxIndex = 0;
		for(var i = rows.length -1; i >= 0; i--)
		{
			var rowModel = rows[i];
			var hasCell = false;
			if(rowModel.isContainValueCell()){
				for (var index = sColIndex - 1; index < eColIndex; index++) {
					if (rowModel._valueCells[index]){
						hasCell = true;
						break;
					}
				}
			}
			if(!hasCell && !valueOnly){
				var cells = rowModel._styleCells;
				if(cells.length){
					var sIndex = this.binarySearch(cells,sColIndex,this.equalCondition,"",true,sheet._id, this.Constant.Column);
					if(sIndex >= 0)
						hasCell = true;
					else{
						//find the cell behind the sColIndex cell
						cell = cells[-sIndex-1];
						if(cell)
						{
							// TODO support multiple columns
							var cellColIndex = cell.getCol();
							if(cellColIndex >= sColIndex && cellColIndex <= eColIndex)
								hasCell = true;
						}
					}
				}					
			}
			if(!hasCell && !valueOnly){
				var cells = rowModel._coverInfos;
				if(cells.length){
					var sIndex = this.binarySearch(cells,sColIndex,this.equalCondition,"",true,sheet._id, this.Constant.Column);
					if(sIndex >= 0)
						hasCell = true;
					else{
						//find the cell behind the sColIndex cell
						cell = cells[-sIndex-1];
						if(cell)
						{
							// TODO support multiple columns
							var cellColIndex = cell.getCol();
							if(cellColIndex >= sColIndex && cellColIndex <= eColIndex)
								hasCell = true;
						}
					}
				}
			}
		   if(hasCell){
			   var index = rowModel.getIndex();
				var repeatedNum = (!rowModel._repeatedNum)? 0 : parseInt(rowModel._repeatedNum);
				maxIndex = index + repeatedNum;
				break;
		   }
		}
		return maxIndex;
	},
	
	/**
	 * 
	 * @param sheetName
	 * @param sCol : {integer} 1-based
	 * @param eCol : integer} 1-based
	 * @returns    : a map {strColumnIndex: width}, if the original width is default, it would be null
	 */
	getColsWidth: function(sheetName,sCol,eCol)
	{
		if(!eCol || eCol < sCol) eCol = sCol;
		var rangeInfo ={ sheetName: sheetName, startCol:sCol, endCol:eCol };
		var cols = this.getCols(rangeInfo, true, true).data;
		var widths = {};
		var wcs = websheet.Constant.Style;
		var cnt = eCol - sCol + 1;
		for(var i = 0; i < cnt; i++)
		{
			var col = cols[i];
			var colIndex = websheet.Helper.getColChar(sCol + i);
			widths[colIndex] = {}; widths[colIndex][wcs.WIDTH] = null;
			if(col && col.getWidth())
			{
				widths[colIndex][wcs.WIDTH] = col.getWidth();
			}	
		}
		return widths;
	},
	
	getRowsHeight: function(sheetName, sRow, eRow)
	{
		if(eRow == null) eRow = sRow;
		var info = {sheetName: sheetName, startRow: sRow, endRow: eRow};
		var rows = this.getRows(info, true, true).data;
		var heights = {};
		var wcs = websheet.Constant.Style;
		var pv, cv, master = sRow;
		var cnt = eRow - sRow + 1;
		var len = rows.length, r;
		for(var pos = 0; pos < cnt; pos++)
		{
			
			if(pos < len)
			{
				r = rows[pos];
				cv = r ? (r._height || 0) : 0;
			}
			else
				cv = 0;
			if(cv == pv)
			{
				var rn = heights[master].rn;
				heights[master].rn =  rn == null ? 1 : (rn + 1);
			}
			else
			{
				//can not repeate
				master = sRow + pos;
				(heights[master] = {})[wcs.HEIGHT] = cv;
				pv = cv;
			}
		}
		return heights;
	},
	
	transformFormulaString: function(value, rowDelta, colDelta){
		var fhelper = websheet.parse.FormulaParseHelper;
		var tokens = [];
		try{
			tokens = fhelper.parseTokenList(value);
		} catch(e) {
			return value;
		}
		this._transformTokens(tokens, rowDelta, colDelta, null);
		return fhelper.updateFormula(value, tokens);
	},
	
	transformFormulaValue: function(cell, sheet, rowDelta, colDelta){		
		var fhelper = websheet.parse.FormulaParseHelper;
		if(!this.cachedTokens)
			this.cachedTokens = new websheet.Cache();
    	var tokens = null;
    	var obj = {v:cell.v, tarr:cell.tarr};
    	var key = "ct_" + dojo.toJson(obj);
    	tokens = this.cachedTokens.get(key);
    	
    	if(tokens)
    	{	
    		for (var i = 0; i < tokens.length; i++) {
    			var ref = tokens[i].getRef();
    			tokens[i].setChangedText(null);
    			if(ref)
    				tokens[i].setRef(ref);
    		}
    	}
    	
    	if(!tokens)
    	{
	    	if(cell.tarr)
	    	{
	    		tokens = fhelper.getTokenList(cell.v, cell.tarr);
	    	}
	    	else {
	    		try{
	    			tokens = fhelper.parseTokenList(cell.v);
	    		} catch(e) {
	    			tokens = [];
	    		}
	    	}
	    	
	    	this.cachedTokens.put(key, tokens);
    	}
    	
    	if (tokens) {
    		this._transformTokens(tokens,rowDelta, colDelta, sheet);
    		cell.v = fhelper.updateFormula(cell.v, tokens, cell.tarr);
    	}
	},
	
	_transformTokens: function(tokens, rowDelta, colDelta, sheet){
		for (var i = 0; i < tokens.length; i++) {
			var token = tokens[i];
			var tokenRef = token.getRef();
			if(!tokenRef)
			{
				var tokenText = token.getText();
    			tokenRef = websheet.Helper.parseRef(tokenText);
			}
			if (tokenRef) {
				var checkSheet = sheet !== null && tokenRef.sheetName;
				// TODO, endSheet?
				if (checkSheet && sheet !== tokenRef.sheetName)
					continue;
				
				var startRow = tokenRef.startRow;
				var endRow = tokenRef.endRow;
				var startCol = tokenRef.startCol;
				var endCol = tokenRef.endCol;
				var ret = null;
				if(rowDelta)
				{
					ret = websheet.Helper.addIndentForAddress(startRow, endRow, rowDelta, true, tokenRef.getType(), tokenRef.refMask);
					if(startRow != -1)
						startRow = ret.start;
					if(endRow != -1)
						endRow = ret.end;
				}
				
				if(colDelta)
				{
					ret = websheet.Helper.addIndentForAddress(startCol, endCol, colDelta, false, tokenRef.getType(), tokenRef.refMask);
					if(startCol != -1)
						startCol = ret.start;
					if(endCol != -1)
						endCol = ret.end;
				}
				
				var params = {refMask: tokenRef.refMask};
				if(ret)
					params.refMask = ret.refMask;
				var newText = websheet.Helper.getAddressByIndex(tokenRef.sheetName, startRow, startCol, tokenRef.endSheetName, endRow, endCol, params);
				token.setChangedText(newText);
				token.setRef(tokenRef);
			}
		}
	},

	/*
	 * Get value cell json
	 * @param	withNumberStyle 		true if number format in json format is needed
	 */
	/*json*/getValueCellJson: function(/*Cell*/cellModel, /*boolean*/withNumberStyle) {
		var cellJson = {};
		
        var value;
        var tarr;
        var type;
        if (cellModel) {
			value = cellModel.getRawValue();
			tarr = cellModel.serializeTokenArray();
			type = cellModel.getType();
        }
        
        if (cellModel && cellModel.isNumber()) {
        	value = websheet.Helper.convertToStringForBigNumber(value);
        }

        if (cellModel && cellModel.isBoolean() && !cellModel.isFormula()) {
			// normalize raw boolean value to string
			value = this.intToBoolean(value);
		}
		cellJson.v = value;
		if (tarr && tarr.length > 0) cellJson.tarr = tarr;
		
		if (withNumberStyle) {
			var style;
			if (cellModel) style = cellModel.getStyle();
			var format;
			if (style) format = style.toJSON()[this.Constant.Style.FORMAT];
			if (format) {
				cellJson.style = {};
				cellJson.style.format = format;
			}
		}
		
		return cellJson;
	},
	
	getCellType: function(raw, calc, bNoParse) {
		// summary: get cell type according to cell raw value and calculated value,
		// 	Cell type is an integer number, lower 3 bits is formula type, left bits are value types.
		// 	if raw is a formula string (begins with '='), then formula type is set to 1 (normal formula)
		// 	if calc is null when raw is formula, value type is set to UNKNOWN
		//	others refer to spreadsheet wiki,
		//	this function only check if it is formula by raw[0] == '='. can pass a '=' when cell is formula and
		// 	need to refresh type by calculated value
		//	param bNoNumberParse, if set to true, will not parse numeric/boolean string to number/boolean, but only returns string in
		//	such cases
		var res = 0;
		if (raw == null) {
			return res;
		} else {
			var v = raw;
			var ws = websheet;
			var constct = ws.Constant.ValueCellType;
			
			if (raw.charAt && raw.charAt(0) == '=' && raw.length > 1) {
				// is formula
				res = 1;
				if (calc == null) {
					// formula without calculated value, set as UNKNOWN
					res |= (constct.UNKNOWN << 3);
					return res;
				} else {
					v = calc;
				}
			}
			
			if (ws.Helper.isValidNumeric(v)) {
				// numeric string,
				if (bNoParse && typeof(v) == "string") {
					// don't parse it, return as string
					res |= (constct.STRING << 3);
				} else {
					res |= (constct.NUMBER << 3);
				}
			} else if (typeof(v) == "boolean") {
				// boolean type
				res |= (constct.BOOLEAN << 3);
			} else {
				// error string, boolean string, plain string or whatever
				// cast v to string
				v = v + "";
				var upV = v.toUpperCase();
				if (!bNoParse && (upV == "TRUE" || upV == "FALSE")) {
					// boolean type, only parse to boolean when bNoParse is not set
					res |= (constct.BOOLEAN << 3);
				} else {
					if (this._errTypes == null) {
						// initialize error type object
						this._initErrTypes();
					}
					switch (v) {
					case this._enErrTypes["7"]:
					case this._enErrTypes["501"]:
					case this._enErrTypes["502"]:
					case this._enErrTypes["503"]:
					case this._enErrTypes["504"]:
					case this._enErrTypes["508"]:
					case this._enErrTypes["509"]:
					case this._enErrTypes["510"]:
					case this._enErrTypes["511"]:
					case this._enErrTypes["512"]:
					case this._enErrTypes["513"]:
					case this._enErrTypes["514"]:
					case this._enErrTypes["516"]:
					case this._enErrTypes["517"]:
					case this._enErrTypes["518"]:
					case this._enErrTypes["519"]:
					case this._enErrTypes["520"]:
					case this._enErrTypes["521"]:
					case this._enErrTypes["522"]:
					case this._enErrTypes["523"]:
					case this._enErrTypes["524"]:
					case this._enErrTypes["525"]:
					case this._enErrTypes["526"]:
					case this._enErrTypes["527"]:
					case this._enErrTypes["532"]:
					case this._enErrTypes["533"]:
					case this._enErrTypes["1002"]:
						// error types
						res |= (constct.ERROR << 3);
						break;
					default:
						// regular string
						res |= (constct.STRING << 3);
					}
				}
			}
		
			return res;
		}
	},
	
	getErrorMessage:function(errorCode, bLocaleSensitive){
		if (this._errTypes == null) {
			this._initErrTypes();
		}
		if(bLocaleSensitive)
			return this._errTypes["" + errorCode];
		else
			return this._enErrTypes["" + errorCode];
	},
	
	toErrCode: function(msg, bLocaleSensitive) {
		// summary: turn error message to error code object
		if (this._errTypes == null) {
			this._initErrTypes();
		}
		var consterr = websheet.Constant.ERRORCODE;
		var errTypes = bLocaleSensitive ? this._errTypes: this._enErrTypes;
		switch (msg.toUpperCase()) {
		case errTypes["7"].toUpperCase():
			return consterr["7"];
		case errTypes["501"].toUpperCase():
			return consterr["501"];
		case errTypes["502"].toUpperCase():
			return consterr["502"];
		case errTypes["503"].toUpperCase():
			return consterr["503"];
		case errTypes["504"].toUpperCase():
			return consterr["504"];
		case errTypes["508"].toUpperCase():
			return consterr["508"];
		case errTypes["509"].toUpperCase():
			return consterr["509"];
		case errTypes["510"].toUpperCase():
			return consterr["510"];
		case errTypes["511"].toUpperCase():
			return consterr["511"];
		case errTypes["512"].toUpperCase():
			return consterr["512"];
		case errTypes["513"].toUpperCase():
			return consterr["513"];
		case errTypes["514"].toUpperCase():
			return consterr["514"];
		case errTypes["516"].toUpperCase():
			return consterr["516"];
		case errTypes["517"].toUpperCase():
			return consterr["517"];
		case errTypes["518"].toUpperCase():
			return consterr["518"];
		case errTypes["519"].toUpperCase():
			return consterr["519"];
		case errTypes["520"].toUpperCase():
			return consterr["520"];
		case errTypes["521"].toUpperCase():
			return consterr["521"];
		case errTypes["522"].toUpperCase():
			return consterr["522"];
		case errTypes["523"].toUpperCase():
			return consterr["523"];
		case errTypes["524"].toUpperCase():
			return consterr["524"];
		case errTypes["525"].toUpperCase():
			return consterr["525"];
		case errTypes["526"].toUpperCase():
			return consterr["526"];
		case errTypes["527"].toUpperCase():
			return consterr["527"];
		case errTypes["532"].toUpperCase():
			return consterr["532"];
		case errTypes["533"].toUpperCase():
			return consterr["533"];
		case errTypes["1002"].toUpperCase():
			return consterr["1002"];
		default:
			return null;
		}
	},
	
	fixValueByType: function(v, type) {
		var constct = websheet.Constant.ValueCellType;
		switch (type >> 3) {
		case constct.NUMBER:
			if (typeof(v) == "string") {
				v = parseFloat(v);
			}
			if (typeof(v) == "number") {
				v = parseFloat(v.toPrecision(15));
			}
			// number or whatever ...
			return v; 
		case constct.STRING:
			return v + "";
		case constct.ERROR:
			return this.toErrCode(v).message;
		case constct.BOOLEAN:
			if (typeof(v) == "string") {
				return v.toUpperCase() == "TRUE" ? 1 : 0;
			} else if (typeof(v) == "boolean") {
				return v == true ? 1 : 0;
			} else if (typeof(v) == "number") {
				return v != 0 ? 1 : 0;
			} else {
				// whatever it is...
				return 0;
			}
		case constct.UNKNOWN:
			return null;
		}
	},
	
	resetLocale: function(){
		this._errTypes = null;
	},
	
	_initErrTypes: function() {
		var nls = dojo.i18n.getLocalization("websheet","Constant");
		var consterr = websheet.Constant.ERRORCODE;
		this._errTypes = {
		  "7": nls[consterr["7"].key], //
		  "501": nls[consterr["501"].key], //
		  "502": nls[consterr["502"].key], //
		  "503": nls[consterr["503"].key], //
		  "504": nls[consterr["504"].key], //
		  "508": nls[consterr["508"].key], //
		  "509": nls[consterr["509"].key], //
		  "510": nls[consterr["510"].key], //
		  "511": nls[consterr["511"].key], //
		  "512": nls[consterr["512"].key], //
		  "513": nls[consterr["513"].key], //
		  "514": nls[consterr["514"].key], //
		  "516": nls[consterr["516"].key], //
		  "517": nls[consterr["517"].key], //
		  "518": nls[consterr["518"].key], //
		  "519": nls[consterr["519"].key], //
		  "520": nls[consterr["520"].key], //
		  "521": nls[consterr["521"].key], //
		  "522": nls[consterr["522"].key], //
		  "523": nls[consterr["523"].key], //
		  "524": nls[consterr["524"].key], //
		  "525": nls[consterr["525"].key], //
		  "526": nls[consterr["526"].key], //
		  "527": nls[consterr["527"].key], //
		  "532": nls[consterr["532"].key], //
		  "533": nls[consterr["533"].key], //
		  "1002": nls[consterr["1002"].key] 
		};		
		if(this._enErrTypes == null){
			this._enErrTypes = {
			  "7": consterr["7"].message, //
			  "501": consterr["501"].message, //
			  "502": consterr["502"].message, //
			  "503": consterr["503"].message, //
			  "504": consterr["504"].message, //
			  "508": consterr["508"].message, //
			  "509": consterr["509"].message, //
			  "510": consterr["510"].message, //
			  "511": consterr["511"].message, //
			  "512": consterr["512"].message, //
			  "513": consterr["513"].message, //
			  "514": consterr["514"].message, //
			  "516": consterr["516"].message, //
			  "517": consterr["517"].message, //
			  "518": consterr["518"].message, //
			  "519": consterr["519"].message, //
			  "520": consterr["520"].message, //
			  "521": consterr["521"].message, //
			  "522": consterr["522"].message, //
			  "523": consterr["523"].message, //
			  "524": consterr["524"].message, //
			  "525": consterr["525"].message, //
			  "526": consterr["526"].message, //
			  "527": consterr["527"].message, //
			  "532": consterr["532"].message, //
			  "533": consterr["533"].message, //
			  "1002": consterr["1002"].message 
			}
		}
	},
	
	 //idx is 1 based.
    isCellProtected: function(sheetName, rowIdx, colIdx){
 	    var doc = this.getDocumentObj();
    	var bSheetPro = doc.isSheetProtected(sheetName);
    	if(bSheetPro){
    		var sheet = doc.getSheet(sheetName);
    		return sheet.isCellProtected(rowIdx, colIdx);
    	}
    	return false;
    },
    
    isRangeProtected: function(sheetName, rowIndex, endRowIndex, colIndex, endColIndex, ignoreFilteredRow){
 	    var doc = this.getDocumentObj();
    	var bSheetPro = doc.isSheetProtected(sheetName);
    	if(bSheetPro){
    		var sheet = doc.getSheet(sheetName);
    		return sheet.isRangeProtected(rowIndex, endRowIndex, colIndex, endColIndex, ignoreFilteredRow);
    	}
    	return false;
    },
    
    isRowProtected: function(sheetName, rowIndex, endRowIndex){
 	    var doc = this.getDocumentObj();
    	var bSheetPro = doc.isSheetProtected(sheetName);
    	if(bSheetPro){
    		var sheet = doc.getSheet(sheetName);
    		return sheet.isRowProtected(rowIndex, endRowIndex);
    	}
    	return false;
    },
    
    isColumnProtected: function(sheetName, colIndex, endCol){
 	    var doc = this.getDocumentObj();
    	var bSheetPro = doc.isSheetProtected(sheetName);
    	if(bSheetPro){
    		var sheet = doc.getSheet(sheetName);
    		return sheet.isColumnProtected(colIndex, endCol);
    	}
    	return false;
    },
    
    isDocumentProtected: function(){
    	return false;
    },
    
    isSheetProtected: function(sheetName){
      if(!sheetName){
	 	  var grid = this.getEditor().getCurrentGrid();
	 	  if(grid)
	 		  sheetName = grid.getSheetName();
      }
      if(sheetName){
 	    var doc = this.getDocumentObj();
 	    return doc.isSheetProtected(sheetName);
 	  }
 	  return false;
    },
	
    getJSONByUsage: function(sheetName, startRow, startCol, endRow, endCol, usage, withId)
	{
		var docObj = this.getDocumentObj();
		var areaMgr = docObj.getAreaManager();
		var ranges = areaMgr.getRangesByUsage(usage, sheetName);
		var info = {
			sheetName:sheetName,
			startRow:startRow,
			endRow:endRow,
			startCol:startCol,
			endCol:endCol
		};
		
		var ret = [];
		for(var i = 0; i < ranges.length; i++){
			var range = ranges[i];
			var rangeInfo = range._getRangeInfo();
			var newRange = websheet.Helper.rangeIntersection(info, rangeInfo);
			if(newRange != null){
				var data = range.data;
				var jsonData = null;
				if(usage == websheet.Constant.RangeUsage.COMMENTS){
					var comments = docObj.getComments(range._id);
					jsonData = {items: comments.items};
				}else
					jsonData = (data != null && data.getJSON4Range != null) ? data.getJSON4Range(newRange, range) : null;
				var ref = websheet.Helper.getAddressByIndex(newRange.sheetName, newRange.startRow, newRange.startCol, newRange.endSheetName, newRange.endRow, newRange.endCol, {refMask : websheet.Constant.RANGE_MASK });
				var json = {refValue: ref, data: jsonData};
				if(withId){
					json.rangeid = range._id;
				}
				ret.push(json);
			}
		}
		return ret;
	},
    
	getJSONByUsage4Editing: function(info, usage)
	{
		var docObj = this.getDocumentObj();
		var areaMgr = docObj.getAreaManager();
		var ranges = areaMgr.getRangesByUsage(usage, info.sheetName);
		
		var dvs = [];
		for(var i = 0; i < ranges.length; i++){
			var range = ranges[i];
			var rangeInfo = range._getRangeInfo();
			var relation = websheet.Helper.compareRange(info, rangeInfo);
			
			if(relation == websheet.Constant.RangeRelation.EQUAL || relation == websheet.Constant.RangeRelation.SUBSET){
				var data = range.data;
				var jsonData = data.getJSON4Range(info, range);
				return {isMul: false, json: jsonData};
			}
			if(relation == websheet.Constant.RangeRelation.SUPERSET || relation == websheet.Constant.RangeRelation.INTERSECTION){
				var newRange = websheet.Helper.rangeIntersection(info, rangeInfo);
				var dv = {rangeInfo: newRange, range: range};
				if(dvs.length == 0)
					dvs.push(dv);
				else{
					var dv1 = dvs[0];
					if(!range.data.compare(range, dv1.range))
						return {isMul: true};
					dvs.push(dv);
				}
			}
		}
		var len = dvs.length;
		if(len == 0)
			return {isMul: false};
		
		var rIdx = info.startRow;
		var cIdx = info.startCol;
		var first = null;
		var nextRIdx = null;
		while(true){
			var i = 0;
			for( ; i < len; i++){
				var rangeInfo = dvs[i].rangeInfo;
				if(rangeInfo.startRow <= rIdx && rIdx <= rangeInfo.endRow && rangeInfo.startCol == cIdx){
					if(!first && rangeInfo.startRow == info.startRow && rangeInfo.startCol == info.startCol)
						first = dvs[i];
					cIdx = rangeInfo.endCol + 1;
					if(nextRIdx == null || nextRIdx >  dvs[i].rangeInfo.endRow)
						nextRIdx = dvs[i].rangeInfo.endRow;
					if(cIdx > info.endCol){
						rIdx = nextRIdx + 1;
						if(rIdx > info.endRow){
							var range = first.range;
							var jsonData = range.data.getJSON4Range(first.rangeInfo, range);
							return {isMul: false, json: jsonData};
						}
						cIdx = info.startCol;
						nextRIdx = null;
					}
					break;
				}
			}
			if(i >= len)
				return {isMul: true};
		}
	},
	
	intToBoolean: function(v) {
		// summary: turn v to primitive type boolean, return true if v != 0, false otherwise.
		return v != 0;
	}
	
};