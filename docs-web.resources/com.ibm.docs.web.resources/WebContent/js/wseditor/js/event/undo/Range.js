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

/***
 * For Range Object in spreadsheet document
 * It can be unnamed range with different usage, such as task, comments
 * Or named range
 */
dojo.provide("websheet.event.undo.Range");
dojo.require("websheet.Helper");
dojo.require("websheet.Constant");
dojo.require("websheet.functions.IObject");
dojo.declare("websheet.event.undo.Range",null,{
	rangeId:null,//rangeId is the name for named range, and unique id for unnamed range
	_sheetId:null,
	_endSheetId:null,//might be null if the address is not like Sheet1.A1:Sheet1.B3 pattern
	_startRowId:null,
	_startColId:null,
	_endRowId:null,
	_endColId:null,
	
	_type: websheet.Constant.RangeType.INVALID,
	_typeBak:websheet.Constant.RangeType.INVALID,
	_refMask: websheet.Constant.RefAddressType.NONE,
	usage:null, //can be TASK|COMMENT|NAMES|UNNAMES(for example, created by formula)
	_bEnableMaxRow: true,	
	//TODO: relative or absolute address
	/*****FOR TASK UNNAMED RANGE****/
	fragDocId: null,
	state: null,	//set working state to task_range, because working is not the state of activity
	_idManager : null,
   
    cachedTask: {}, //cached task
    data: null,
	
	/**
	 * @param: rangeRef, might be range address string, or range parsed reference
	 * @param: bEnableMaxRow, if the row index > max row in config, then set its id to "M", 
	 * and do not update it when insert/delete row
	 * FUTURE SUPPORT, DOES NOT SUPPORT NOW
	 * rangeAddress can be 'A' represent the first column, "1" represent the first row
	 * "A:B" means the first two colums, "1:2" is the first two rows
	 * set the type of this range to websheet.Constant.RangeType.COLUMN/ROW
	 */
	//must set range id after constructor
	constructor: function(rangeRef, sheetName,idManager, bEnableMaxRow) 
	{
    	if(!idManager) {
    		var docObj = websheet.model.ModelHelper.getDocumentObj();
			idManager = docObj._getIDManager();
    	}
		this._idManager = idManager;
		if (bEnableMaxRow === false)
		  this._bEnableMaxRow = bEnableMaxRow;
		  
		this.updateAddress(rangeRef, sheetName);
		cachedTask = {};
	},	
	
	getValue: function() {
		//FIXME 
		return null;
	},
	
	/*boolean*/isSingleCell:function()
	{
		if(this._type == websheet.Constant.RangeType.CELL || this._type == websheet.Constant.RangeType.RANGE)
		{
			if(this._startRowId && (this._endRowId == undefined || this._startRowId == this._endRowId)
					&& this._startColId && (this._endColId == undefined ||this._startColId == this._endColId))
			{
				if(!this._rowDelta)//in case start/end row id is "M" but the index are not equal
					return true;
			}
		}
		return false;
	},
	
	/*boolean*/isValid:function()
	{
		if(this._type == websheet.Constant.RangeType.INVALID)
			return false;
		return true;
	},
	
	/*id*/getRangeId: function() {
		return this.rangeId;
	},
	
	/*type*/getType: function() {
		return this._type;
	},
	
	/*id*/getSheetId: function() {
		return this._sheetId;
	},
	
	/*void*/setEndSheetId: function(id) {
		this._endSheetId = id;
	},
	
	/**********************Private*********************/
	//make the start index always not large than end index
	_normalize:function()
	{
		var idManager = this._idManager;
		var startRow = idManager.getRowIndexById(this._sheetId, this._startRowId);
		var endRow = idManager.getRowIndexById(this._sheetId, this._endRowId);
		//valid row
		if(startRow > endRow && endRow > -1)
		{
			var rowid = this._endRowId;
			this._endRowId = this._startRowId;
			this._startRowId = rowid;
		}
		
		var startCol = idManager.getColIndexById(this._sheetId, this._startColId);
		var endCol = idManager.getColIndexById(this._sheetId, this._endColId);
		//valid col
		if(startCol > endCol && endCol > -1)
		{
			var colid = this._endColId;
			this._endColId = this._startColId;
			this._startColId = colid;
		}
	},
	
	getSheetName: function()
	{
		if(this._sheetId){
			var idManager = this._idManager;
			var sheetName = idManager.getSheetNameById(this._sheetId);
			return sheetName;
		}
		return null;
	},
	
	//return the sheetName with start/end row/col index of the current range if rangeAddress == null
	//otherwise return these info of the rangeAddress
	//1-based
	//bOptimize = true means return the max row/column in this sheet 
	//if end row/column of this range is larger than the max 
	_getRangeInfo:function(rangeAddress, bMSMaxCol)
	{
		var result = {};
		var Const = websheet.Constant;
		var MAXCOL = Const.MaxColumnIndex;
		if(bMSMaxCol)
			MAXCOL = Const.MaxColumnCount;
		result.sheetName = Const.INVALID_REF;
		result.startRow = -1;
		result.endRow = -1;
		result.startCol = -1;
		result.endCol = -1;
		if(!rangeAddress)
		{
			//if(this._type != websheet.Constant.RangeType.INVALID)
			{
				var idManager = this._idManager;
				if(this._sheetId){
					var sheetName = idManager.getSheetNameById(this._sheetId);
					if(sheetName){
						result.sheetName = sheetName;
						if(this._endSheetId)
							result.endSheetName = sheetName;
					}
				}else
					return result;
				//FUTURE SUPPORT ,set the start/end row/col by range type
				//so even the id is null, if type = ROW, the index should not be -1
//				var bStartMax = false;
//				var bEndMax = false;
				if(this._type == Const.RangeType.COLUMN || this._typeBak == Const.RangeType.COLUMN){
					result.startRow = 1;
					result.endRow = Const.MaxRowNum;
				}else{
				if(this._startRowId){
					if(this._bEnableMaxRow && (this._startRowId == Const.MAXREF)){
						result.startRow = this._startRowIndex > Const.MaxRowNum ? Const.MaxRowNum : this._startRowIndex ;
	//					bStartMax = true;
					}else{
						result.startRow = idManager.getRowIndexById(this._sheetId, this._startRowId);
						if(result.startRow > -1)
							result.startRow++;
					}
				} 
					 
				if(this._endRowId){
					if(this._bEnableMaxRow && (this._endRowId == Const.MAXREF)){
						if(result.startRow > 0)//valid start row
							result.endRow = result.startRow + this._rowDelta;
						else
							result.endRow = this._rowDelta;
						result.endRow = result.endRow > Const.MaxRowNum ? Const.MaxRowNum : result.endRow ;
	//					bEndMax = true;
					}else{
						result.endRow = idManager.getRowIndexById(this._sheetId, this._endRowId);
						if(result.endRow > -1)
							result.endRow++;
						else 
							result.endRow = result.startRow;
					}
				}else{
					result.endRow = result.startRow;
				}
				}
				 if(this._type == Const.RangeType.ROW || this._typeBak == Const.RangeType.ROW){
						result.startCol = 1;
						result.endCol = MAXCOL;
				 }else{
				 if(this._startColId){
					result.startCol = idManager.getColIndexById(this._sheetId, this._startColId);
					if(result.startCol > -1)
						result.startCol++;
					result.startCol = result.startCol > MAXCOL ? MAXCOL : result.startCol;				
				 }
					 
				 if(this._endColId){
					result.endCol = idManager.getColIndexById(this._sheetId, this._endColId);
					if(result.endCol > -1)
						result.endCol++;
					else
						result.endCol = result.startCol;
					result.endCol = result.endCol > MAXCOL ? MAXCOL : result.endCol;
				 }else{
					result.endCol = result.startCol;
				 }
				 }
			}
		}else
		{
			var parsedRef = websheet.Helper.parseRef(rangeAddress);
			var sheetName = parsedRef ? parsedRef.sheetName : "";
			if(!sheetName)
				result.noSheet = true;
			var startColumn = -1;
			var startRow = -1;
			var endColumn = -1;
			var endRow = -1;
			if(parsedRef){
				startRow = parsedRef.startRow;
				endRow = parsedRef.endRow;
				startColumn = parsedRef.startCol;
				endColumn = parsedRef.endCol;
				if(startRow > endRow)
				{
					var row = endRow;
					endRow = startRow;
					startRow = row;
				}
				if(startColumn > endColumn)
				{
					var col = endColumn;
					endColumn = startColumn;
					startColumn = col;
				}
				
				if(this._type == Const.RangeType.ROW){
					result.startCol = 1;
					result.endCol = MAXCOL;
				}else if(this._type == Const.RangeType.COLUMN){
					result.startRow = 1;
					result.endRow = Const.MaxRowNum;
				}
			}
			result.sheetName = sheetName;
			result.startRow = startRow;
			result.endRow = endRow;
			result.startCol = startColumn;
			result.endCol = endColumn;
		}
		return result;
	},
	/**********************Public**********************/
	//called when load range 
	transform: function(sheetId, sRowId, sColId, eRowId, eColId) 
	{
		this._sheetId = sheetId;
		this._startRowId = sRowId;
		this._startColId = sColId;
		this._endRowId = eRowId;
		this._endColId = eColId;
		this._normalize();
	},
	//append this range to document
	setRangeId:function(rangeId)
	{
		this.rangeId = rangeId;
	},
	
	setUsage:function(use){
		this.usage = use;
	},
	
	getUsage:function(){
//		if(!this.usage)
//			this.usage = websheet.Constant.RangeUsage.UNNAMES;
		return this.usage;
	},
	//change the range address by range address string or range parsed ref, and update start/end row/column id
	updateAddress:function(rangeRef, sheetName)
	{
    	try
    	{
    		if(rangeRef)
    		{
    			if(!sheetName)
    			{
    				var grid = websheet.model.ModelHelper.getEditor().getCurrentGrid();
    				if(grid)
    					sheetName = grid.getSheetName();
    			}
    			var parsedRef = rangeRef;
    			if(dojo.isString(rangeRef))
    			{
    				parsedRef = websheet.Helper.parseRef(rangeRef);
    				if(!parsedRef)
    				{
    					this._type = websheet.Constant.RangeType.INVALID;
    					return;
    				}
    			}
    			if(parsedRef.sheetName)
    			{
    				sheetName = parsedRef.sheetName;
    			}
    			var idManager = this._idManager;
    			this._sheetId = idManager.getSheetIdBySheetName(sheetName);
    			if(this._sheetId)
    			{
    				var startColumn = -1;
    				var startRow = -1;
    				var endColumn = -1;
    				var endRow = -1;
    				if(parsedRef){
    					this._type = parsedRef.getType();
    					this._typeBak = this._type;
    					
    					startRow = parsedRef.startRow;
    					endRow = parsedRef.endRow;
    					startColumn = parsedRef.startCol;
    					endColumn = parsedRef.endCol;
    					
    					if(this._type == websheet.Constant.RangeType.COLUMN){
    						this._startRowId = this._idManager.getRowIdByIndex(this._sheetId, 0, true);
    						this._endRowId = websheet.Constant.MAXREF;
    					}else{
    	    				var maxRow = idManager.maxRow;
    	    				if(startRow != undefined && startRow != websheet.Constant.INVALID_REF){
    	    					if(this._bEnableMaxRow && (startRow > maxRow)){
    	    						this._startRowId = websheet.Constant.MAXREF;
    	    						this._startRowIndex = startRow;//record it and do not update it when model changed
    	    					}else
    	    						this._startRowId = idManager.getRowIdByIndex(this._sheetId, startRow-1, true);
    	    				}else
    	    					this._type = websheet.Constant.RangeType.INVALID;
    	    				
    	    				if(endRow != undefined && endRow != websheet.Constant.INVALID_REF){
    	    					if(this._bEnableMaxRow && (endRow > maxRow)){
    	    						this._endRowId = websheet.Constant.MAXREF;
    	    						if(startRow > 0)
    	    							this._rowDelta = endRow - startRow;
    	    						else
    	    							this._rowDelta = endRow;
    	    					}else
    	    						this._endRowId = idManager.getRowIdByIndex(this._sheetId, endRow-1, true);
    	    				}else
    	    					this._type = websheet.Constant.RangeType.INVALID;
    					}
    					
    					if(this._type == websheet.Constant.RangeType.ROW){
    						this._startColId = this._idManager.getColIdByIndex(this._sheetId, 0, true);
    						this._endColId = websheet.Constant.MAXREF;
    					}else{
    						if(startColumn > 0)
    						{
    							this._startColId = idManager.getColIdByIndex(this._sheetId, startColumn-1, true);
    						}
    						else
    							this._type = websheet.Constant.RangeType.INVALID;
    						if(endColumn > 0)
    						{
    							this._endColId = idManager.getColIdByIndex(this._sheetId, endColumn-1, true);
    						}
    						else
    							this._type = websheet.Constant.RangeType.INVALID;
    					}
    					
    					this._refMask = parsedRef.refMask;
    					return;
    				}
    			}else
    			{
    				//if sheetName does not exist
    				this.setUnexistSheetName();
    			}
    		}
    	}catch(e)
		{	
			this._type = websheet.Constant.RangeType.INVALID;
		}
	},
	
	/**
	 * get Range address with sheetname(or not, according to withSheetName)
	 *  and with semicolon(or not, according to bSimple) for single cell if bUserDefine = true
	 *  
	 */
	getAddress:function()
	{
		var result = this._getRangeInfo();
		var sheetName = result.sheetName;
		var startCol = result.startCol;
		var startRow = result.startRow;
		var endCol = result.endCol;
		var endRow = result.endRow;
		
		var params = {refMask: this._refMask};
		var address = websheet.Helper.getAddressByIndex(sheetName, startRow, startCol, null, endRow, endCol, params);
		if(address.indexOf(websheet.Constant.INVALID_REF) > -1){
			if(this._type != websheet.Constant.RangeType.INVALID){
				this._typeBak = this._type;
				this._type = websheet.Constant.RangeType.INVALID;   
			}
		}
		return address;
	},
	
	recoverSheetName: function(sheetName)
	{
		//TODO: how to set sheetName
		this.refMask &= ~websheet.Constant.RefAddressType.INVALID_SHEET;
		this._type = this._typeBak;
	},
	/**
	 * Set the sheet name of range to #REF!, and set type to INVALID
	 * */
	// just be used for rangelist.js
	setInvalidSheetName:function()
	{
		this._refMask |= websheet.Constant.RefAddressType.INVALID_SHEET;
		if(this._type != websheet.Constant.RangeType.INVALID)
			this._typeBak = this._type;
		this._type = websheet.Constant.RangeType.INVALID;
	},
	
	setUnexistSheetName:function()
	{
		this._refMask |= websheet.Constant.RefAddressType.UNEXIST_SHEET;
	},
	
	// when cut and paste, both row and column id would change
	updateId: function(range) {
		this._sheetId = range._sheetId;
		this._startRowId = range._startRowId;
		this._endRowId = range._endRowId;
		this._startColId = range._startColId;
		this._endColId = range._endColId;
	},
	
	//same value for start/end row/col/sheet id and hasSheetRef and hasSemicolon
	equals:function(range)
	{
		if(range)
		{
			var RangeType = websheet.Constant.RangeType;
			if((this._sheetId == range._sheetId) 
				&&( (this._type != RangeType.INVALID && this._type == range._type)//the same range type, otherwise A#REF!:B#REF! or A1:B5001 will be the same with A:B
						|| ( this._typeBak == range._typeBak ) )//or all change to the invalid type, but typeBak are the same 
				&& (this._startRowId == range._startRowId || this._type == RangeType.COLUMN)//for column type, the start row id might not update to the first row
				&& (this._startColId == range._startColId || this._type == RangeType.ROW)
				&& (this._endRowId == range._endRowId)
				&& (this._endColId == range._endColId)
				&& (this._refMask == range._refMask)
				&& (this._startRowIndex == range._startRowIndex)
				&& (this._rowDelta == range._rowDelta)
				&& (this.usage == range.usage))
				return true;
		}
		return false;
	},
	//compare the relationship between two ranges( or addresses)
	//return type websheet.Constant.RangeRelation
	//return NOINTERSECTION if they have no intersection
	//return INTERSECTION if they have, but not contain another
	//return EQUAL if they are the same
	//return SUBSET if the current range is contained by the range in param
	//return SUPERSET if the current range containes the range in param
	//return -1 when error , for example, one range contains sheetName ,while another does not have, 
	//or range address contains #REF!
	compare: function(range)
	{
		var result1 = this._getRangeInfo();
		var result2 = {};
		if(range instanceof websheet.event.undo.Range)
			result2 = range._getRangeInfo();
		else
			//use range address
			result2 = this._getRangeInfo(range);
		var sC1 = result1.startCol;
		var eC1 = result1.endCol;
		var sR1 = result1.startRow;
		var eR1 = result1.endRow;
		return websheet.Helper.compareRange(result1, result2);
	},
	
	setData: function(data)
	{
	    if(!data)
	        return;
	    
	    if(this.usage == websheet.Constant.RangeUsage.TASK)
        {
            var c_title = data.c_title;
            if(c_title)//title
                this.cachedTask.c_title = c_title; 
            var c_owner = data.c_owner;
            if(c_owner)//owner
                this.cachedTask.c_owner = c_owner;                         
            var c_state = data.c_state;                     
            if(c_state) // state
                this.cachedTask.c_state = c_state;                         
            var c_assignee = data.c_assignee;
            if(c_assignee) //assignee
                this.cachedTask.c_assignee = c_assignee; 
            var c_reviewer = data.c_reviewer;
            if(c_reviewer) //reviewer
                this.cachedTask.c_reviewer = c_reviewer; 
            var c_createDate  = data.c_createDate;
            if(c_createDate)//createDate
                this.cachedTask.c_createDate = c_createDate;                       
        }else if(this.usage == websheet.Constant.RangeUsage.IMAGE || this.usage == websheet.Constant.RangeUsage.SHAPE){
        	if(data.x)
        		data.x = Math.round(data.x);
        	if(data.ex)
        		data.ex = Math.round(data.ex);
        	if(data.y)
        		data.y = Math.round(data.y);
        	if(data.ey)
        		data.ey = Math.round(data.ey);   
        	this.data = data;
        } else{
	        this.data = data;
	    }
	},
	
	isWholeRowColRange:function()
	{
		var rangeType = this._type != websheet.Constant.RangeType.INVALID?this._type:this._typeBak;
		return rangeType == websheet.Constant.RangeType.ROW || rangeType == websheet.Constant.RangeType.COLUMN;
	},
	
	/*boolean*/is3D: function() {
		return false;
	}
});