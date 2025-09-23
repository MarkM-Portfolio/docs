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
/* Row Model									    */
/****************************************************/
dojo.provide("websheet.model.Row");
dojo.require("websheet.model.BasicModel");
dojo.declare("websheet.model.Row",[websheet.functions.Row, websheet.model.BasicModel],{
	_height: null,				//row height set by user
	_calcHeight: null,				//row height calculated by browser, no import/export
    _repeatedNum:0,		        //how many rows follow current row style
	_parent:null,				//parent, that is sheet
	_doc:null,					//document
	_id:null,					//row id
	_visibility:null,			//for visibility attr, if non-null, always invisible state
	_visible:true,             //hide or show row
	_filtered:false,            //for filtered row
	_gap: 0,					// the gap between this row and next row in the row array
	
	/**
	 * constructor
	 */
	constructor:function(parent,id,height,repeatednum,visibility){
		this._id = id;
		this._parent = parent;
		this._doc = this._parent._parent;
		this._valueCells = new Array(); // value cell list
		this._styleCells = new Array(); // style cell list
		this._coverInfos = new Array(); // CoverInfo list
		this._gap = 0;
		if(undefined != repeatednum){
			this._gap = this._repeatedNum = repeatednum;
		}
		if(undefined != height){
			this._height = height;
		}
		
		this.setVisibility(visibility);	
	},

	////////////// websheet.functions.Row         ////////////////////
	/*boolean*/isVisible:function(){
		return this._visible;
	},
	
	/*boolean*/isFiltered:function(){
		return this._filtered;
	},
	
	////////////// End of websheet.functions.Row  ////////////////////
	
	/**
	 * load data from specified 'rowData'
	 */
	/*void*/load:function(rowData, columnsIdArray, rowRef){
		var isCriteria = (this._doc.partialLevel == websheet.Constant.PartialLevel.ALL) || (this._doc.criteria.sheet == this._parent._id);
		
		if(undefined == rowData)return null;
		var styleManager = this._doc._getStyleManager();
		var sheet = this._parent;
		// as cell style  is separated from cell value, simply remove the existing styleCells at the scenario
		// that there have partial cells being created on the loaded sheet, unlike value cell, it doesn't have
		// any other objects that have been associated with style cells. so it is safe to remove it.
		//clear styleCells firstly;
		if(isCriteria && this._styleCells && this._styleCells.length > 0)
			this._styleCells.length = 0;
		
		var length = columnsIdArray.length;
		this._startIndex = 0;		
		for (var i = 0; i < length; i++) {
			var colId = columnsIdArray[i];
			var c_colId = this._doc._idManager.getMapping(colId);
			if(c_colId)
			{
				// use server side colId in _colIdMap
				var colIndex = sheet._colIdMap[colId];
				if(colIndex != -1){
					colIndex += 1;
					var cellData = rowData[colId];
					if(cellData){
					    var colSpan = 1,
					    	rowSpan = 1;
					 	if(cellData.cs)	
					 		colSpan = parseInt(cellData.cs);
						if(cellData.rs)
							rowSpan = parseInt(cellData.rs);
						
						var c_styleId = styleManager.getMapping(cellData.sid);						
						var cellRef = null;
						if(rowRef)
							cellRef = rowRef[colId];

						// FIXME ignore the isCovered cell that neither have value or styleId
						if (cellData.ic && (cellData.v === undefined || cellData.v === "") && !c_styleId) continue;
						if(!isCriteria){
							this._mergeStyleOnLoad(colIndex,c_colId,c_styleId,cellData.rn);
							c_styleId = null;
						}
						
						var v = cellData.v, cv = cellData.cv;
						var cellType = cellData.t;
						if (cellType == undefined) {
							// cellType default to 0
							cellType = 0;
						}
						
						if (!this._doc.enableFormula) {
							if (cv) { // formula cell
								v = cv, cv = null;
								cellType = (cellType >> 3) << 3;//remove the formula type
							}
						}
						this._createCellOnLoad(colIndex,
								c_colId,
								v,
								cv,
								c_styleId,
								cellType,
								cellData.rn,
								cellData.link, 
								/* ignore null cell */ true, 
								cellData.bPR, 
								cellRef, 
								cellData.tjson, 
								cellData.fi);
						if(colSpan > 1 || rowSpan > 1)
				 		{
							this.mergeCells(colIndex, colIndex + colSpan - 1, rowSpan);
							
							// collect the merged cell
							var index = this.getIndex();
							var coverInfo = {sheetName: sheet.getSheetName(), startRow: index, endRow: index + rowSpan - 1,  
												startCol: colIndex, endCol: colIndex + colSpan - 1};
							this._doc._coverInfos.push(coverInfo);
				 		}
					}
				}
			}
		}
		
		delete this._startIndex;	
	},
	
    //////////////////////////////////////////////
	///// PRIVATE FUNCTION ///////////////////////
    //////////////////////////////////////////////
	/**
	 * parse cells value in row
	 */
	/*void*/_parse:function(){
		var cells = this.getValueCells();
		dojo.forEach(cells,function(cell,index){
			cell._calculate();
		});
	},
	/**
	 * return sheet name of parent sheet
	 */
	/*string*/_getSheetName:function(){
		if(this._parent){
			return this._parent.getSheetName();
		}
		return null;
	},
	/**
	 * return parent sheet object
	 */
	/*Sheet*/_getParent:function(){
		return this._parent;
	},
	
	_mergeStyleOnLoad: function(colIndex,colid,styleId,rn){
		var del = 0;
		if (rn == null) {
			rn = 0;
		}
		if(this._styleCells.length > 0){
			var wspconst = websheet.Constant.Position;
				
			this._doc._mhelper.splitCell(this, colIndex, wspconst.PREVIOUS);
			this._doc._mhelper.splitCell(this, colIndex + rn, wspconst.NEXT);
			
			var pStart = this.getCellPosition(colIndex);
			if (pStart < 0) {
				pStart = -(pStart + 1);
			}
			
			var pEnd = this.getCellPosition(colIndex + rn);
			if (pEnd < 0) {
				pEnd = -(pEnd + 1);
			}
			
			del = pEnd - pStart + 1;
		}
		if(styleId){	
			if(!colid)
				colid = this._doc._idManager.getColIdByIndex(this._parent._id,colIndex - 1,true);
			
			var styleCell = new websheet.model.StyleCell(this,colid,rn,styleId);
			this._styleCells.splice(pStart, del, styleCell);	
		}else
			this._styleCells.splice(pStart, del);		
	},
	
	/**
	 * create new cell object for given 'colid' in this row
	 * On initial load, create both value cell and style cell with correct repeated num, and put value cell into this._valueCells and style cell into
	 * this._styleCells respectively.
	 * @param colIndex 		1-based cell position
	 * @param colid			column id
	 * @param value			cell value
	 * @param calculateValue
	 * @param styleid		cell style id
	 * @param cellType		cell type
	 * @param repeatednum	cell repeated number
	 * @param link 			hyperlink
	 * @param bNotCreateNull	if set to true, not insert null cell and return null
	 * @param bPR
	 * @param cellRef		the cell/range references of the current cell if it is formula
	 * @param tokenJson		syntax tree with priority can be generated by other parser framework for formula cell
	 * @param formulaSharedIndex	the autofill formula index
	 */
	_createCellOnLoad:function(colIndex,
			colid,
			value,
			calculateValue,
			styleId,
			cellType,
			repeatednum,
			link, 
			bNotCreateNull,
			bPR, 
			cellRef, 
			tokenJson, 
			formulaSharedIndex){
		if(value == undefined){value = "";}
		//get column id according to column index
		if(!colid){
			colid = this._doc._idManager.getColIdByIndex(this._parent._id,colIndex - 1,true);
		}		
		if (repeatednum == undefined) {
			repeatednum = 0;
		}
		
		//value cell
		var cell = this._valueCells[colIndex - 1];
		if (cell) {
			if (value === "") {
				this._valueCells[colIndex - 1] = null;
				delete cell;
			} else if (bPR) {
				// message have partial-reference flag set
				if (cell._bPR) {
					// cell also have partial-reference flag, set rawValue if needed, but don't calculate
					if (value != cell.getRawValue()) {
						cell.setRawValue(value, true);
						cell.setReferences(cellRef);
					}
				}
				// else, message have partial-reference but cell doesn't, ignore this rawValue
			} else {
				// message doesn't have a partial-reference flag set, 
				if (cell._bPR || value != cell.getRawValue()) {
					delete cell._bPR;
					cell.setRawValue(value);
					cell.setReferences(cellRef);
				} 
			}
		}else if(value !== "") {//create a new value cell
			// need a fix to cell type, when cell has a "boolean" category, it should be marked with boolean type,
			// mark type if server hasn't done it
			if (styleId && (cellType >> 3) == websheet.Constant.ValueCellType.NUMBER) {
				var style = this._doc._getStyleManager().getStyleById(styleId);
				var category = style == null ? null : style._attributes[websheet.Constant.Style.FORMATTYPE];
				if (category == "boolean") {
					// it is boolean style, update cellType to boolean
					cellType = (websheet.Constant.ValueCellType.BOOLEAN << 3) | (cellType & websheet.Constant.ValueCellType.FORMULA_TYPE_MASK);
				}
			}
			cell = new websheet.model.Cell(this,colid,0,value,calculateValue,null,link,cellType,cellRef,tokenJson);
			if (!bNotCreateNull || !cell.isNull()) {
				this._valueCells[colIndex - 1] = cell;
				// set broken-reference flag
				if (bPR) {
					cell._bPR = true;
				}
			}
		}
		if(formulaSharedIndex){
			cell.fi = formulaSharedIndex;
		}
		if (styleId) {
			var styleCells = this._styleCells;
			var len = styleCells.length;
			// check whether it is one repeated style cell on initial load, if yes, don't create one cell object
			var bRepeated = false;
			if(len){
				var previous = styleCells[len - 1];
				var sid = previous._styleId;
				var rn = previous._repeatednum;
				if (sid == styleId && (this._startIndex + rn + 1)>= colIndex) {
					// it is one repeated style cell
					rn = colIndex + repeatednum - this._startIndex;
					previous._repeatednum = rn;
					bRepeated = true;
				}
			}
			
			//create a new style cell
			if (!bRepeated) {
				cell = new websheet.model.StyleCell(this, colid, repeatednum, styleId);				
				if (!bNotCreateNull || !cell.isNull()) {
					this._startIndex = colIndex;
					styleCells.push(cell);
				}
			}
		}
	},
	
	/**
	 * Create new cell object for given cellType and put it into row object,
	 * if cellType isn't specified, it is VALUE CELL by default
	 * @param colIndex		1-based cell position
	 * @param cellType		cell Type
	 */
	/*_cell*/_createCell:function(colIndex, /*CellType*/ cellType) {
		if (cellType == this._doc.CellType.MIXED) return null;
		if (cellType === undefined) cellType = this._doc.CellType.VALUE;

		var cell = null;
		var colId = this._doc._idManager.getColIdByIndex(this._parent._id,colIndex - 1,true);
		switch (cellType) {
		case this._doc.CellType.VALUE:
			cell = new websheet.model.Cell(this, colId);
			this._valueCells[colIndex - 1] = cell;
			break;
		case this._doc.CellType.STYLE:
		case this._doc.CellType.COVERINFO:
			{
				var cells;
				if (cellType == this._doc.CellType.STYLE) {
					cell = new websheet.model.StyleCell(this, colId);
					cells = this._styleCells;
				} else {
					cell = new websheet.model.CoverInfo(this, colId);
					cells = this._coverInfos;
				}
			
				var pos = this._doc._mhelper.binarySearch(cells,colIndex,this._doc._mhelper.equalCondition,"",false,this._parent._id, websheet.Constant.Column);
				if(pos <= -1){
					pos = -(pos + 1);
				}
			
				cells.splice(pos, 0, cell);
			}
			break;
		}
		
		return cell;
	},
	
	////////////////// UTILITY FUNCTIONS ////////////////////////
	/////////////////////////////////////////////////////////////
	
	/*
	 * check whether this object can be merged together with given 'row' object
	 */
	/*boolean*/isMergable:function(row) {
		if(null == row) return false;

		if(!this.isContainStyle() || !row.isContainStyle())
			return false;
		
		if(this.isContainValueCell() || row.isContainValueCell())
			return false;
		
		/*Does filtered row can be repeated?
		 * S - show, H - hide, F - filter
		 * Can be merged: 
		 * SS HH  FF
		 * 
		 * Can not be merged:
		 * SH SF  HS  HF  FS  FH
		 */		
		if(this.getVisibility() != row.getVisibility())
			return false;
		
		var pRowIndex = this.getIndex();
		var pRepeateNum = (this._repeatedNum == undefined) ? 0 : this._repeatedNum;
		var lRowIndex = row.getIndex();
		//two row is neighbour 
		if(pRowIndex + pRepeateNum + 1 != lRowIndex)
			return false;
		
		if(this._height == undefined || this._height <= 0)
			this._height = null;

		if(row._height == undefined  || row._height <= 0)
			row._height = null;
		
		if(this._height != row._height)
			return false;
		
		return this.isEqual(row);
	},
	
	/*
	 * check whether this object has the same content as the given 'row' object
	 */
	/*boolean*/isEqual:function(row) {
		if(!row) return false;
		
		var index;
		var cell;
		var cells = this._styleCells;
		var cells2 = row._styleCells;
		if(cells.length != cells2.length){return false;}
		for(index = 0;index < cells.length;index++){
			cell = cells[index];
			if(cell._id != cells2[index]._id){ // getColumnId
				return false;
			}
			if(!cell.isEqual(cells2[index])){
				return false;
			}
		}
		
		var cells = this._valueCells;
		var cells2 = row._valueCells;
		if(cells.length != cells2.length){return false;}
		for (index = 0; index < cells.length; index++) {
			cell = cells[index];
			if (cell && !cell.isEqual(cells2[index])) return false;
		}
		
		var cells = this._coverInfos;
		var cells2 = row._coverInfos;
		if(cells.length != cells2.length){return false;}
		for(index = 0;index < cells.length;index++){
			cell = cells[index];
			if(cell._id != cells2[index]._id){ // getColumnId
				return false;
			}
			if(!cell.isEqual(cells2[index])){
				return false;
			}
		}
		
		return true;
	},
	
	/**
	 * whether or not this row contains cell has style
	 * return boolean		 true:row contains cell has style
	 * 						 false:row doesn't contains cell has style        
	 */
	/*boolean*/isContainStyle: function()
	{
		// FIXME how about visibility???
        if(this.getHeight()) return true;
		return this._styleCells.length !== 0;
	},
	
	/**
	 * whether or not this row contains cell has value
	 * return boolean		 true:row contains cell has value, colspan > 1, or isCovered == true
	 * 						 false:row doesn't contains cell has value        
	 */
	/*boolean*/isContainValueCell:function(){
		var found = false;
		for (var i = 0; i < this._valueCells.length; ++i) {
			var cell = this._valueCells[i];
			if (cell) {
				if (cell.isNull()) {
					this._valuesCells[i] = null;
					delete cell;
				} else {
					found = true;
					break;
				}
			}
		}
		return found || this._coverInfos.length;
	},
	
	/*boolean*/isCellProtected: function(colIdx){
		var styleId = this.getCellStyle(colIdx);
		var styleManager = this._doc._getStyleManager();
		var style;
		if(styleId)
			style = styleManager.getStyleById(styleId);
		return !styleManager.getAttr(style,websheet.Constant.Style.PROTECTION_UNLOCKED);
	},
	
	/*boolean*/hasProtectedCell: function(startColIndex,endColIndex){
		if(!startColIndex)
			startColIndex = 1;
		if(!endColIndex)
			endColIndex = websheet.Constant.MaxColumnIndex;
		
		var len = this._styleCells.length;
		var cellIdx = this.getCellPosition(startColIndex, true, this._doc.CellType.STYLE);
		if(cellIdx < 0)
			cellIdx = -(cellIdx + 1);
		
		var cell = null;
		var cellCol = endColIndex + 1;
		if(cellIdx < len){
			cell = this._styleCells[cellIdx];
			cellCol = cell.getCol();
			if(cellCol > endColIndex)
				cell = null;
		}
		
		var columns = this._parent._columns;
		var cLen = columns.length;
		var colIdx = this._parent.getColumnPosition(startColIndex, true);
		if(colIdx < 0)
			colIdx = -(colIdx + 1);
		var col = null;
		var colIndex;
		if(colIdx < cLen){
			col = columns[colIdx];
			colIndex = col.getIndex();
			if(colIndex > endColIndex)
				col = null;
		}
		
		var styleManager = this._doc._getStyleManager();
		var i = startColIndex;
		while(i <= endColIndex &&(cell || col)){
			if(cell && i >= cellCol && i <= cellCol + cell._repeatednum){
				var style = styleManager.getStyleById(cell.getStyleId());
				if(!styleManager.getAttr(style,websheet.Constant.Style.PROTECTION_UNLOCKED))
					return true;
				i = cellCol + cell._repeatednum + 1;
				cellIdx ++;
				//next style cell
				if(cellIdx < len){
					cell = this._styleCells[cellIdx];
					cellCol = cell.getCol();
					if(cellCol > endColIndex)
						cell = null;
				}
				else{
					cell = null;
					cellCol = endColIndex + 1;
				}
			}else if(col){
				while(col && i > colIndex + col._repeatedNum){
					colIdx ++;
					if(colIdx < cLen){
						col = columns[colIdx];
						colIndex = col.getIndex();
						if(cellCol > endColIndex)
							cell = null;
					}else
						col = null;
				}
				if(col && i >= colIndex && i <= colIndex + col._repeatedNum){
					var style = styleManager.getStyleById(col.getStyleId());
					if(!styleManager.getAttr(style,websheet.Constant.Style.PROTECTION_UNLOCKED))
						return true;
					i = cellCol <= colIndex + col._repeatedNum ? cellCol : (colIndex + col._repeatedNum + 1);
				}else if(!styleManager.getAttr(null,websheet.Constant.Style.PROTECTION_UNLOCKED))//there is not column model for the index.
					return true;
				else
					i = colIndex < cellCol ? colIndex : cellCol;
			}else if(!styleManager.getAttr(null,websheet.Constant.Style.PROTECTION_UNLOCKED))
				return true;
			else
				i = cellCol;
		}
		if(i > endColIndex)
			return false;
		return !styleManager.getAttr(null,websheet.Constant.Style.PROTECTION_UNLOCKED);
	},
	///////////////////////////////////////////////////////////////////
	
    ///////////////////////////////////////////
    ///////// PUBLIC FUNCTION /////////////////
	///////////////////////////////////////////
	/********************Row******************/
	 /**
	  * visible or non-filter all are visible state for a row
	  */
	 
	 getVisibility: function(){
	   return this._visibility;  
	 },
	 
	/*boolean*/isVisibility:function(){
        return this._visible && !this._filtered;
	},
	
	/**
	 * visibility: "hide" or "filter"
	 * or null for show attribute
	 */
	setVisibility:function(visibility){	    
		this._visibility = visibility;

		if(visibility == websheet.Constant.ROW_VISIBILITY_ATTR.HIDE){
		    this._visible = false;
		}else if(visibility == websheet.Constant.ROW_VISIBILITY_ATTR.FILTER){
		    this._filtered = true;
		}else{ //back to default value.
		    this._visible = true;
		    this._filtered = false;
		}
	},

	/*String*/getId:function(){
		return this._id;
	},
	/**
	 * set row id
	 */
	/*String*/setId:function(id){
		this._id = id;
	},
	/**
	 * 1-based
	 */
	/*integer*/getIndex:function()
	{
		var index = this._index;//may be undefined
		if( ((this._doc.isLoading) && (index == undefined))
				|| (!this._doc.isLoading))
		{
			var sheet = this._parent;
			index = sheet.getRowIndex(this._id);
			if(index > -1)
				index++;
			if(this._doc.isLoading)
				this._index = index;
			else
				delete this._index;
		}
		return index;
	},
	
	/**
	 *whether the whole row has the same style 
	 */
	/*boolean*/hasRowStyle:function(){
		var count = 0;
		dojo.forEach(this._styleCells,function(cell){
			count++;
			if(cell._repeatednum > 0){
				count += cell._repeatednum;
			}
		},this);
		if(count < websheet.Constant.ThresRowStyle){return false;}
		return true;
	},
	
	/**
	 *get the style in row 
	 */
	/*StyleId*/getRowStyle:function(){
		var styleManager = this._doc._getStyleManager();
		var interSect = null;
		dojo.forEach(this._styleCells,function(cell,index){
			var styleCode = styleManager.getStyleById(cell.getStyleId());
			if(index == 0){
				interSect = styleCode;
			}else{
				if(null != interSect){
					interSect = styleManager.getInterSect(interSect,styleCode);
				}
			}
		},this);
		return styleManager.addStyle(interSect,true);
	},
		
	/*
	 * clean up the value cells
	 */
	/*void*/_cleanValueCells: function() {
		var bClear = true;
		for (var i = 0; i < this._valueCells.length; ++i) {
			var cell = this._valueCells[i];
			if (cell && !cell.isNull()) {
				bClear = false;
				break;
			}
		}
		
		if (bClear) this._valueCells = [];		
	},

	/**
	 * clear all cell value in current row
	 */
	/*void*/clearRow:function(){
		for (var i = 0; i < this._valueCells.length; ++i) {
			var cell = this._valueCells[i];
			if (cell) {
				if(cell._rawValue!== "")
					cell.setRawValue("");
				if(cell.isNull()){
					this._valueCells[i] = null;
					delete cell;
				}
			}
		}

		this._cleanValueCells();
	},

	/**
	 * clear the raw value of all cells in given range in current row 
	 *
	/*void*/clearCells:function(startColIndex, endColIndex) {
		for (var i = startColIndex - 1; i < endColIndex; ++i) {
			var cell = this._valueCells[i];
			if (cell) {
				if (cell._rawValue !== "") {
					cell.setRawValue("");
				}
				this._valueCells[i] = null;
				delete cell;
			}
		}
		
		this._cleanValueCells();
	},

	/**
	 * delete all cell objects in given range at current row
	 */
	/*void*/deleteCells:function(startColIndex, endColIndex, bCut, sheetDelta) {
		var cm = websheet.model.ModelHelper.getCalcManager();
		var endIndex = Math.min(endColIndex, this._valueCells.length);
		for(var i = startColIndex - 1; i < endIndex; i++){
			var valueCell = this._valueCells[i];
			if(valueCell){
				if(bCut)
					valueCell.updateCellForCut(sheetDelta);
				cm._removeFormulaCell(valueCell);
				valueCell.reset();
				this._valueCells[i] = null;
				delete valueCell;
			}
		}
		
		this._cleanValueCells();
		
		//style cells
		if(this._styleCells.length > 0){
			var wspconst = websheet.Constant.Position;
			
			this._doc._mhelper.splitCell(this, startColIndex, wspconst.PREVIOUS);
			this._doc._mhelper.splitCell(this, endColIndex, wspconst.NEXT);
			var pStart = this.getCellPosition(startColIndex);
			if (pStart < 0) {
				pStart = -(pStart + 1);
			}
			var p = pStart;
			var cells = this._styleCells;
			// count the number of cell models
			var cell = cells[p];
			while (cell && cell.getCol() <= endColIndex)
				cell = cells[++p];
			
			cells.splice(pStart, p - pStart);
		}
		
		if(this._coverInfos.length > 0){
			var pos = this.getCellPosition(startColIndex, false,this._doc.CellType.COVERINFO);
			if(pos < 0){
				pos = -(pos + 1);
			}
			
			var p = pos;
			var cells = this._coverInfos;
			var cell = cells[p];
			while(cell && cell.getCol() <= endColIndex){
				this._parent.deleteCoverInfoInColumn(cell);
				cell = cells[++p];
			}
			cells.splice(pos, p - pos);
		}
	},
	/**
	 * if row doesn't contain any cell,and its height information,it will
	 * return true,otherwise return false;
	 */
	/*boolean*/isNull:function(){
		var length = this._valueCells.length + this._styleCells.length  + this._coverInfos.length;
		if(length == 0 && !this.getHeight() && this._visible && !this._filtered)
		{
			return true;
		}
		return false;
	},
	/**
	 * return row repeated number
	 */
	/*integer*/getRepeatedNum: function() {
		return this._repeatedNum;
	},
	/**
	 * set row repeated number
	 * @param repeatednum      integer
	 */
	/*void*/setRepeatedNum:function(repeatednum){
		this._repeatedNum = repeatednum;
	},
	/*
	 * get the gap between this row and next row in row array
	 */
	/*int*/getGAP: function() {
		return this._gap;
	},
	/*
	 * set the gap between this row and next row in row array
	 */
	/*void*/setGAP: function(gap) {
		this._gap = gap;
	},
	/**
	 * return row height
	 */
	/*integer*/getHeight: function() {
		return this._height;
	},
	/**
	 * set row height
	 * @param height          integer
	 */
	/*void*/setHeight:function(height){
		this._height = height;
	},
	/**
	 * return row height calculated by browser
	 */
	/*integer*/getCalcHeight: function() {
		return this._calcHeight;
	},
	/**
	 * set row height calculated by browser
	 * @param height          integer
	 */
	/*void*/setCalcHeight:function(height){
		this._calcHeight = height;
	},

	getMaxColIndex4Show: function(){
		var cells = this.getValueCells();
		var maxColIndex = this._getMaxColIndex(cells);

		var lastStyleCell = this._getMaxColIndex(this._styleCells);
		maxColIndex = lastStyleCell > maxColIndex ? lastStyleCell: maxColIndex;		
		
		var lastCoverCell = this._getMaxColIndex(this._coverInfos);
		maxColIndex = lastCoverCell > maxColIndex ? lastCoverCell: maxColIndex;
		
		return maxColIndex;
	},
	
	_getMaxColIndex: function(cells){
		var lastIndex = 0;
		if(cells && cells.length > 0)
		{
			var i = cells.length -1;
			var cell = null;
			do{
				cell = cells[i --];
			}while(cell.isNull() && i>=0);
				
			if(!cell.isNull())
			{
				var colIndex = cell.getCol();
				var repeateNum = cell._repeatednum;
				repeateNum = repeateNum ? repeateNum : 0;
				var lastIndex = colIndex + repeateNum;
			}
		}
		return lastIndex;		
	},
	
	getMinColIndex4Show: function(){
		var cells = this.getValueCells();
		var minColIndex = this._getMinColIndex(cells);

		var lastStyleCell = this._getMinColIndex(this._styleCells);
		minColIndex = lastStyleCell < minColIndex ? lastStyleCell: minColIndex;		
		
		var lastCoverCell = this._getMinColIndex(this._coverInfos);
		minColIndex = lastCoverCell < minColIndex ? lastCoverCell: minColIndex;
		
		return minColIndex;
	},
	
	_getMinColIndex: function(cells){
		var firstIndex = websheet.Constant.MaxColumnIndex;
		if(cells && cells.length > 0)
		{
			var i = 0;
			var cell = null;
			do{
				cell = cells[i ++];
			}while(cell.isNull() && i < cells.length);
				
			if(!cell.isNull())
				firstIndex = cell.getCol();
		}
		return firstIndex;		
	},
	/***************Cell********************/	
	/*
	 * Return one compressed array of value cells for the given range
	 * If neither scIndex nor ecIndex is specified, it returns all value cells in this row
	 * @param scIndex 		1-based start column index
	 * @param ecIndex		1-based end column index or -1
	 * @return				the value cell array
	 */
	/*Array*/getValueCells:function(scIndex, ecIndex) {
		var cells = [];

		if ((scIndex == null || scIndex == undefined) && (ecIndex == null || ecIndex == undefined)) {
			scIndex = 1;
			ecIndex = -1;
		}
		if ((scIndex < 1) || (ecIndex != -1 && scIndex > ecIndex)) return cells;
		if (ecIndex == -1 || ecIndex > websheet.Constant.MaxColumnIndex)
			ecIndex = websheet.Constant.MaxColumnIndex;
		
		ecIndex = Math.min(ecIndex, this._valueCells.length);
		for (var i = scIndex - 1; i < ecIndex; ++i) {
			if (this._valueCells[i]) cells.push(this._valueCells[i]);
		}
		
		return cells;
	},

   //cellJson.v === "" is needed in order to support copy/paste with external application
	setCell: function(colIndex, cellJson, userId, bReplace, mode, bInheritFormat) {
		// value cell
		var cell = this.getCell(colIndex);
		if (bReplace)
			if (cell) cell.reset();
		if (cellJson.v === "" || !this._doc._mhelper.isEmpty(cellJson.v)) {
			if (!cell)
				cell = this._createCell(colIndex);
			if (userId) cell.setUser(userId);
			cell.setCellByJson(cellJson, null, bReplace, mode);
		}
		if (cell && cell.isNull()) {
			this._valueCells[colIndex - 1] = null;
			delete cell;
		}
		if (cell && bInheritFormat) cell._bInheritFormat = true;
		
		var colspan = cellJson.cs; // colspan
		if(colspan && colspan > 1){
			var cell = this.getCell(colIndex, this._doc.CellType.COVERINFO);
			if(!cell){
				cell = this._createCell(colIndex,this._doc.CellType.COVERINFO);
				cell.setColSpan(colspan);
			}
			var freeze = this._parent._freezeInfo;
			//Can not merge freeze and unfreeze sections, unfreeze the column.
			if(freeze.col > 0 && colIndex <= freeze.col && colIndex + colspan - 1 > freeze.col)
				freeze.col = 0;
		}
		
		var withStyle = !this._doc._mhelper.isEmpty(cellJson.style);
		if (!withStyle && !bReplace) return;
		
		// style cell
		this._doc._mhelper.splitCell(this,colIndex,websheet.Constant.Position.BOTH);
		cell = this.getCell(colIndex, this._doc.CellType.STYLE);
		if (!cell)
			cell = this._createCell(colIndex, this._doc.CellType.STYLE);
		if (bReplace) {
			cell.setStyleId(null);
		}
		if (withStyle) {
			cell.mergeStyle(cellJson.style);
		}
		else if (bReplace) {
			// if the cell doesn't have a column style, the funciton will clear
			// the cell's style to null
			cell.setStyleId(websheet.Constant.Style.DEFAULT_CELL_STYLE);
		}
		if (cell && cell.isNull()) {
			var p = this.getCellPosition(colIndex);
			if (p >= 0) {
				this._styleCells.splice(p, 1);
			}
		}
		this._doc._mhelper.mergeCell(this,colIndex,websheet.Constant.Position.BOTH);
	},
	
	/**
	 * only accepts row model, take _cells from param rowModel and set it to current row model
	 */	
	/*void*/setCells:function(eventRowJson, startColIndex, endColIndex, arrCols, bReplace, bColumn, userId, mode, bInsertCol) {
		var wspconst = websheet.Constant.Position;
		var defaultcellstyle = websheet.Constant.Style.DEFAULT_CELL_STYLE;
		var eventCells = eventRowJson.cells;
		if(!eventCells)eventCells = [];
		// pointer to event cells array
		var pEventCells = 0;
		
		var currentRowIndex = -1;
		
		var styleCells = this._styleCells;
		var hasStyle = styleCells.length > 0;
		var ps = 0;
		if(hasStyle){
			//pointer to style cells array
			ps = this.getCellPosition(startColIndex);
			if (ps < 0) {
				ps = -(ps + 1);
			}
			var _tmp = this._doc._mhelper.splitCellByArrayIndex(this, ps, startColIndex);
			var bStartSplit = _tmp > ps;
			if (bStartSplit) {
				ps = _tmp;
			}
		}
		var colIndex = startColIndex;
		while (colIndex <= endColIndex) {
			var eventCell = eventCells[pEventCells];
			if (eventCell)
			{
				var eventColIndex = eventCell.index;
				eventCell = eventCell.cell;
				// current event cell's colIndex
	 			if (eventColIndex > colIndex) {
	 				// event cells have gap, move colIndex to the gap
	 				if (bReplace) {
	 					// if is paste, create event cell as empty cell
	 					eventCell =  {index:colIndex, rn:( eventColIndex - colIndex - 1)};
	 					// colIndex move to eventColIndex,
	 					// and set eventColIndex to created empty cell index (original colIndex) 
	 					var __tmp = colIndex;
		 				colIndex = eventColIndex;
	 					eventColIndex = __tmp;
	 				} else {
	 					// if is merge, just bypass the gap
	 					colIndex = eventColIndex;
	 					// move ps(pointer in style rows) forward if needed
	 					if(hasStyle){
		 					var styleCell = styleCells[ps];
		 					while (styleCell && styleCell.getCol() < eventColIndex) {
		 						if (styleCell._repeatednum > 0) {
		 							this._doc._mhelper.splitCellByArrayIndex(this, ps, eventColIndex);
		 						}
		 						styleCell = styleCells[++ps];
		 					}
		 				}
	 					continue;
	 				}
	 			} else if (eventColIndex == colIndex) {
	 				// event cell just matches current cell
	 				var rp = eventCell.rn ? parseInt(eventCell.rn) : 0;
	 				colIndex +=  rp + 1;//eventCell._repeatednum + 1;
	 				// move event cell pointer
	 				pEventCells++;
	 			} else {
	 				// eventColIndex < colIndex, never happens for sorted event cells
	 				throw "eventCellIndex < colIndex, setCells() for this condition should never happened!";
	 			}
			}
			else 
			{
	 			// no event cells, range not end
	 			if (bReplace) {
	 				// for paste, create empty cells 					
 					eventCell =  {index:colIndex,rn:(endColIndex - colIndex) };
					eventColIndex = colIndex;
	 				colIndex = endColIndex + 1;
	 			} else {
	 				// for merge, done
	 				colIndex = endColIndex + 1;
	 				continue;
	 			}					
			}
			
			if (eventCell.cs > 1 || eventCell.rs > 1) {
				this.mergeCells(eventColIndex, eventCell.cs > 1 ? (eventColIndex + eventCell.cs - 1): eventColIndex, eventCell.rs);
			}
			if(bInsertCol && eventCell.ic)
			{
				var bEnlarge = true;
				var rp = eventCell.rn ? parseInt(eventCell.rn) : 0;
				var coverInfo = null;
				// first check if this covered cell is belong to the inserted columns
				var coverCol = this._parent.getColumn(eventColIndex, true);
				if(coverCol) {
					if(currentRowIndex < 0)
						currentRowIndex = this.getIndex();
					var eventCover = coverCol.getCoverInfo(currentRowIndex,true);
					if(eventCover != null)
						bEnlarge = false;
				}
				// if not belong to the inserted columns, then check if it should be enlarged with the previous cover cell
				if(bEnlarge) {
					var coverCol = this._parent.getColumn(eventColIndex - 1, true);
					if(coverCol) {
						if(currentRowIndex < 0)
							currentRowIndex = this.getIndex();
						coverInfo = coverCol.getCoverInfo(currentRowIndex,true);
					}
					if(coverInfo){
						var sc = coverInfo.getCol();
						var ec = sc + coverInfo.getColSpan() - 1;
						if(ec < eventColIndex){
							coverInfo.setColSpan(eventColIndex + rp - sc + 1);
							this._parent.insertCoverInfoInColumn(coverInfo, eventColIndex, eventColIndex + rp);
						}
					} else {
						this.mergeCells(eventColIndex-1,eventColIndex + rp, 1);
					}
				}
			}			
			var eventCellRP = eventCell.rn ? parseInt(eventCell.rn) : 0;
			var r = eventCellRP + 1;
			
			//value cell
			var emptyValue = this._doc._mhelper.isEmpty(eventCell.v);
			if(bReplace){
				if(r > 1 || emptyValue){//value is empty, delete the valueCells.
					var	nCells = this._valueCells.length;
					var fn = 0;
					for(var i = 0; fn < nCells && i < r; i++){
						var eCellIndex = eventColIndex + eventCellRP - r + 1 + i ;
						var valueCell = this._valueCells[eCellIndex - 1];
						if(valueCell){
							fn++ ;
							valueCell.reset();
		 					this._valueCells[eCellIndex - 1] = null;
		 					delete valueCell;
						}
					}
				}
			}
			if (!emptyValue || eventCell.v === "") {//only merge value when value is not empty.
				valueCell = this.getCell(eventColIndex);
				if(!valueCell)
					valueCell = this._createCell(eventColIndex);
				valueCell.setCellByJson(eventCell, null, bReplace, mode);
				if(userId === undefined)
					delete valueCell._userId;
				else
					valueCell._userId = userId;
				if (valueCell && valueCell.isNull()) {
					this._valueCells[eventColIndex - 1] = null;
					delete valueCell;
				}
			}
			
			//For multi-column
			if(bReplace && !eventRowJson.bRow)
				bColumn = false;
			//style cell
			 //don't merge with next for optimize, only merge with previous.
			//merge with next at end
			//merge to colstyle for optimize. 
			while (r > 0)
			{	 			
	 			// current event cell index, index in current event cell repeat range
	 			var eventCellIndex = eventColIndex + eventCellRP - r + 1;
	 			var col = arrCols[eventCellIndex - startColIndex];
 				var colStyleId = col ? col._styleId : null;
 				
 				if(!this._doc._mhelper.isEmpty(eventCell.style) || (bReplace && ((!bColumn && colStyleId) || hasStyle)))//need to replace
 				{
 					var styleCell = styleCells[ps];
 					var styleColIndex = null;
 					if(styleCell)
 						styleColIndex = styleCell.getCol();//column index 
 					if(!styleCell || styleColIndex > eventCellIndex){
 						// style cell after event cell, event cell in style "gap"
		 				// create a cell for eventCell.col ~ style.col
 						//find ps-1 or create new one.
 						if(!this._doc._mhelper.isEmpty(eventCell.style) || (bReplace && !bColumn && colStyleId)){					
 							var eventColId = this._doc._idManager.getColIdByIndex(this._parent._id,eventCellIndex - 1,true);
 							styleCell = new websheet.model.StyleCell(this,eventColId); 							
 						    
 							if(styleColIndex)
 								styleCell._repeatednum = Math.min(styleColIndex - eventCellIndex - 1, r - 1);
 							else
 								styleCell._repeatednum = r - 1;
	 						styleCell.setCellByJson(eventCell, colStyleId, bReplace, mode);
	 						if (bReplace && !bColumn && !bInsertCol && colStyleId && !styleCell._styleId) {
	 		 					// the case that pasting, col has style, need to add defaultcellstyle, and don't
	 		 					// need additional IF in Cell.setStyleId(), set directly to save performance
	 							styleCell._styleId = defaultcellstyle;
	 		 				}
	 						if((styleCell.isNull() && (!styleCell._repeatednum || !arrCols.length)) || (col && colStyleId == styleCell._styleId && eventCellIndex + styleCell._repeatednum <= col.getIndex() + col._repeatedNum))
	 							//Fix a defect, set column style for C:D, copy B1:D1 and paste to C1:E1, style of E1 is not changed.
	 							;//do nothing
 							else if(ps > 0 && styleCell.isMergable(styleCells[ps-1]))//merge to previous
 								styleCells[ps-1]._repeatednum += styleCell._repeatednum + 1; 							
 							else{//add a new styleCell
 								this._styleCells.splice(ps,0,styleCell);
 								ps ++;
 							} 							
	 						r =  r - styleCell._repeatednum - 1;
 						}else{//TODO:?nonStyle, replace other cells with colStyle
 							if(ps < this._styleCells.length && bReplace && !bColumn){
 								if(styleColIndex)
 	 								r -= Math.min(styleColIndex - eventCellIndex, r);
 								else
 									r -- ;
 							} 								
 							else
 								r = 0;
 						} 						
 					}else if(styleColIndex == eventCellIndex || (styleColIndex < eventCellIndex && styleColIndex + styleCell._repeatednum >= eventCellIndex)){
 						if(styleColIndex < eventCellIndex){//split from previous firstly
 							this._doc._mhelper.splitCellByArrayIndex(this, ps, eventCellIndex);
 		 					styleCell = this._styleCells[++ ps];
 		 					styleColIndex = styleCell.getCol();
 						} 
 						if(styleColIndex == eventCellIndex){
 							if(styleCell._repeatednum > 0 /* early quit */) 
		 		 				// in previous processing, modelCell[p] have the same or a larger colIndex as eventColIndex,
		 						// split modelCell[p] so it has same endColIndex as event cell
		 						this._doc._mhelper.splitCellByArrayIndex(this, ps, eventCellIndex + r); // eventColIndex + eventCell._repeatednum + 1
 		 				}
 						styleCell.setCellByJson(eventCell, colStyleId, bReplace, mode);
 						if (bReplace && !bColumn && !bInsertCol && colStyleId && !styleCell._styleId) {
 		 					// the case that pasting, col has style, need to add defaultcellstyle, and don't
 		 					// need additional IF in Cell.setStyleId(), set directly to save performance
 							styleCell._styleId = defaultcellstyle;
 		 				}
 						if((styleCell.isNull() && (!styleCell._repeatednum || !arrCols.length)) || (col && colStyleId == styleCell._styleId && eventCellIndex + styleCell._repeatednum <= col.getIndex() + col._repeatedNum))
 							//don't change ps
 							this._styleCells.splice(ps,1);
						else if(ps > 0 && styleCell.isMergable(styleCells[ps-1])){
							styleCells[ps-1]._repeatednum += styleCell._repeatednum + 1;
							this._styleCells.splice(ps,1);
						}
						else
							ps ++; 
 						r = r - styleCell._repeatednum - 1;
 					}else {
 						// modelCell && modelCell.getCol() < eventCell.getCol()
		 				// not happen, already done before, so nothing to do here
						console.log("tell wen min,styleCell && styleCell.getCol() < eventCell.getCol(), should never happens");
						r = 0;
					} 								
 				}//style end 
 				else{
 					if(bReplace && arrCols.length)
 						r --;
 					else 					
 						r = 0; 					
 					// move ps(pointer in style rows) forward if needed, used for replace = false
 					if(hasStyle){
	 					var styleCell = styleCells[ps];
	 					while (styleCell && styleCell.getCol() < colIndex) {
	 						if (styleCell._repeatednum > 0) {
	 							this._doc._mhelper.splitCellByArrayIndex(this, ps, colIndex);
	 						}
	 						styleCell = styleCells[++ps];
	 					}
	 				}
 				}
			}
		}
		if (bStartSplit) {
			this._doc._mhelper.mergeCell(this, startColIndex, wspconst.PREVIOUS);
		}
		//may have style fragement, need merge?
	},
	
	/*
	 * optimize cell for style change, purge cell if it is null, merge cell if possible,
	 * return true if cell is removed or merged
	 */
	_optimizeCell: function(cell, col, colIndex, /* cell index in cells array */ arrayIndex) {
 		if (col && col._styleId) {
			if (cell._styleId == col._styleId && cell._repeatednum <= col._repeatednum) {
				cell.setStyleId(null);
			}
		}
		// "else" for removing "defaultcellstyle" cell is removed,
		// since before every optimize call we call cell.setStyleId, there we will
		// do such optimize.
		if (!cell._styleId) {
		// cell is null
			if (arrayIndex == undefined) {
				arrayIndex = this.getCellPosition(colIndex, false);
			}
			this._styleCells.splice(arrayIndex, 1);
			return true;
		} else {
		// cell is not null, but it is possible that it can be merged
			var l = this._styleCells.length;
			if (arrayIndex == undefined) {
				this._doc._mhelper.mergeCell(this, colIndex, websheet.Constant.Position.PREVIOUS);
			} else {
				this._doc._mhelper.mergeCell(this, arrayIndex, websheet.Constant.Position.PREVIOUS, /* array index is provided */ true);
			}
			return l > this._styleCells.length;
		} 
	},

	/**
	 * get cell object with given cell type by id 
	 * if followStyle is true, return cell object which's style the given cell is following
	 * if cellType isn't specified, it is to get value cell
	 * BE CAREFUL When uses CellType.MIXED, the cell objects are new created cell objects with mixed content of value cell and style cell(temporarily),
	 * Don't change its cell content.
	 * @param colIndex		1 based cell position
	 * @param cellType, 	cell type
	 * @param followStyle 	boolean value whether or not return cell instance whose style followed by specific cell 
	 * @return 
	 */
	/*Cell*/getCell:function(colIndex,cellType,followStyle){
		var cell = null;
		if (!cellType) {
			return this._valueCells[colIndex - 1];
		}
		
		if(cellType == this._doc.CellType.COVERINFO){
			var cells = this._coverInfos;
			if (cells.length) {
				var index = this._doc._mhelper.binarySearch(cells,colIndex,this._doc._mhelper.equalCondition,"",followStyle,this._parent._id, websheet.Constant.Column);
				if(index >= 0) cell = cells[index];
			}
			return cell;
		}
		
		// if column id exist,then return row search by row id
		// otherwise if followStyle is true,search row whose style current row followed
		var cells = this._styleCells;
		if (cells.length) {
			if (cellType == this._doc.CellType.MIXED)
				followStyle = true;			
			var index = this._doc._mhelper.binarySearch(cells,colIndex,this._doc._mhelper.equalCondition,"",followStyle,this._parent._id, websheet.Constant.Column);
			if(index >= 0) cell = cells[index];
		}
		
		if (cellType == this._doc.CellType.MIXED) {
			var cells = this._coverInfos;
			var coverCell = null;
			if (cells.length) {//for coverinfo, followStyle should always be false here.
				var index = this._doc._mhelper.binarySearch(cells,colIndex,this._doc._mhelper.equalCondition,"",false,this._parent._id, websheet.Constant.Column);
				if(index >= 0) coverCell = cells[index];
			}
			
			var valueCell = this._valueCells[colIndex - 1];
			var hasValue = valueCell != null;
			if(hasValue){
				if (valueCell._styleId) delete valueCell._styleId;
				if (valueCell._colSpan) delete valueCell._colSpan;
				if (valueCell._rowSpan) delete valueCell._rowSpan;
				if (valueCell._isCovered) delete valueCell._isCovered;
			}
			
			var colId = this._doc._idManager.getColIdByIndex(this._parent._id,colIndex - 1,true);
			if(coverCell){
				if(!hasValue)
					valueCell = new websheet.model.Cell(this, colId);
				valueCell = valueCell.mixin(coverCell);	
				hasValue = true;
			}
			
			if (!hasValue) {
				if (!cell) return null;
				else
					valueCell = new websheet.model.Cell(this, colId);
			} 			
			// reuse the value object here to improve performance,
			// create one temporary mixed object only if value cell is empty.
			// it is tricky here because the mixed cell object has the same id as value cell			
			cell = valueCell.mixin(cell);
			// FIXME it is correct to use colId and style cell's repeatednum here if it is one empty cell?
			//if (hasValue)
				delete cell._repeatednum;
		}
		
		return cell;
	},
	
	/**
	 * get style cell position in array according to cell index
	 * @param colIndex  column id
	 * @return 
	 */
	/*integer*/getCellPosition:function(colIndex,followStyle, cellType){
		if(followStyle == undefined){followStyle = true;}
		var cells = this._styleCells;
		if(cellType == this._doc.CellType.COVERINFO)
			cells = this._coverInfos;			
		//if column id exist,then return row search by row id
		//otherwise if followStyle is true,search row whose style current row followed
		var fetchMethod = "";// dojo.hitch(this._doc._idManager,"getColIndexById");
		var index = this._doc._mhelper.binarySearch(cells,colIndex,this._doc._mhelper.equalCondition,fetchMethod,followStyle,this._parent._id, websheet.Constant.Column);
		return index;
	},
	/**
	 * get cell style,maybe it follows the column's style
	 */
	/*String*/getCellStyle:function(colIndex){
		var cell = this.getCell(colIndex, this._doc.CellType.STYLE, true);
		if(cell){
			return cell.getStyleId();
		}
		var column = this._parent.getColumn(colIndex,true);
		if(column){
			return column.getStyleId();
		}
		return null;
	},
	
	/**
	 * copy style from one cell to another cell(not include repeated number)
	 * @param cell  	cell object
	 * @param toIndex   column Index
	 * @param repeatedNum how many empty cells to be repeated with same cell style
	 */
	/*Cell*/copyCellStyle: function(cell, toIndex, repeatedNum) {
		var tCell = this.getCell(toIndex, this._doc.CellType.STYLE);
		if(!tCell){
			tCell = this._createCell(toIndex, this._doc.CellType.STYLE);
		}
		
		if(repeatedNum && repeatedNum > 0)
			tCell._repeatednum=repeatedNum;
		
		tCell.setStyleId(cell.getStyleId());
		return tCell;
	},
	/**
	 * merge one cell's style with the given style attribute
	 */
	/*void*/mergeCellStyle:function(colIndex,styleAttr){
		this._doc._mhelper.splitCell(this,colIndex,websheet.Constant.Position.BOTH);
		var cell = this.getCell(colIndex, this._doc.CellType.STYLE);
		if(!cell){
			cell = this._createCell(colIndex, this._doc.CellType.STYLE);
		}
		// check col style
		var sheet = this._parent;
		var column = sheet.getColumn(colIndex, true);
		var colStyleId = column ? column.getStyleId() : null;
		
		cell.mergeStyle(styleAttr, colStyleId);
		
		// reset the cached show value if the delta style contains number format style
		if (styleAttr && styleAttr.format) {
			var vCell = this._valueCells[colIndex - 1];
			if (vCell) delete vCell._showValue;
		}
		
		if (cell.isNull()) {
			var p = this.getCellPosition(colIndex);
			if (p >= 0) {
				this._styleCells.splice(p, 1);
			}
		}
		this._doc._mhelper.mergeCell(this,colIndex,websheet.Constant.Position.BOTH);
	},
	/**
	 * get cell style id
	 */
	/*String*/getCellStyleId:function(/*integer*/colIndex){
		var cell = this.getCell(colIndex,this._doc.CellType.STYLE, true);
		if(!cell){
			return null;
		}
		return cell.getStyleId();
	},

	/**
	 * set one cell's style id
	 */
	/*void*/setCellStyleId:function(colIndex,styleid){
		this._doc._mhelper.splitCell(this,colIndex,websheet.Constant.Position.BOTH);
		var cell = this.getCell(colIndex, this._doc.CellType.STYLE);
		if(!cell){
			cell = this._createCell(colIndex, this._doc.CellType.STYLE);
		}
		// reset cached show value
		if (styleid == websheet.Constant.Style.DEFAULT_CELL_STYLE) {
			var vCell = this._valueCells[colIndex - 1];
			if (vCell) delete vCell._showValue;
		}

		cell.setStyleId(styleid);
		if (cell.isNull()) {
			var p = this.getCellPosition(colIndex);
			if (p >= 0) {
				this._styleCells.splice(p, 1);
			}
		}
			
		this._doc._mhelper.mergeCell(this,colIndex,websheet.Constant.Position.BOTH);
	},

	splitCells: function(scIndex, ecIndex)
	{
		var len = this._coverInfos.length;
		if(scIndex > ecIndex || !len)
			return;
		var pos = this.getCellPosition(scIndex, true, this._doc.CellType.COVERINFO);
		if(pos <= -1){
			pos = -(pos + 1); 
		}
		var p = pos;
		var cnt = 0;//number of coverInfos to delete
		while(p < len){
			var cell = this._coverInfos[p ++];
			var curSIndex = cell.getCol();
			if(curSIndex > ecIndex) break;
			cnt ++;
		}
		var deleteCoverInfos = this._coverInfos.splice(pos, cnt);
		for(var i = 0; i < deleteCoverInfos.length; i++){
			var cell = deleteCoverInfos[i];
			this._parent.deleteCoverInfoInColumn(cell);
		}
	},
	
	mergeCells: function(scIndex, ecIndex, rowSpan)
	{
		var cell = this.getCell(scIndex,this._doc.CellType.COVERINFO);
		if(!cell)
			cell = this._createCell(scIndex,this._doc.CellType.COVERINFO);

		var colSpan = ecIndex - scIndex + 1;
		cell.setColSpan(colSpan);
		if(rowSpan > 0)
			cell.setRowSpan(rowSpan);
		this._parent.insertCoverInfoInColumn(cell);
		return cell;
//		//Can not merge freeze and unfreeze sections, unfreeze the column, set 0 for freezeInfo.col.
//		var freezeCol = this._parent._freezeInfo.col;
//		if(freezeCol > 0 && scIndex <= freezeCol && ecIndex > freezeCol)
//			this._parent._freezeInfo.col = 0;
	}
});