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
 * Reference is the advanced range model referenced by formula
 * It has the cell list which reference this model
 */
dojo.provide("websheet.parse.Reference");
dojo.require("websheet.parse.Area");
dojo.require("websheet.functions.IObject");
dojo.declare("websheet.parse.Reference",websheet.parse.Area,{
	_list:	null,		//store all the listeners that listen to this area
	
	//width first parse
	_bContentDirty:false,	//the cached _cells, _rows, _columns is dirty or not
	_cells:	null,		//cache all the cells in the range, just used when doc.isLoading=true,doc.isDeepParsing=true
	_opRows: null,		//the optimized rows
//	_indexRows: null,	//the row at specified index
	_opColumns: null,	
//	_indexColumns: null,
	
	 _pcm: null, 			//PartialCalcManager
	 _tm: null,				//TaskManager
	 _doc: null,			//Document model
	 cacheEnabled: true,
	 
	constructor: function()
	{
		this._init();
		if(!this.usage)
			this.usage = websheet.Constant.RangeUsage.REFERENCE;
		if(!this._id)
			this._generateId();
	},
	
	_init : function() {
		this._list = [];
		this.resetCache();
		this._firstCheckCells = true;
		this._firstCheckRows = true;
		var mhelper = websheet.model.ModelHelper;
		this._pcm = mhelper.getPartialCalcManager();
		this._doc = mhelper.getDocumentObj();
		this._tm = this._doc._taskMgr;
		this.cacheEnabled = true;
	},
		
	_generateId:function() {
		if (this.constructor.prototype._idCount == undefined)//static variable used to generate unique id for unique area
			this.constructor.prototype._idCount = 1;
		this._id = "rf" + this.constructor.prototype._idCount++; // it won't conflict with name range id
	},
	
	/*AreaRelation*/compare: function(/*parsedRef*/range) {
		var relation = this.inherited(arguments);
		var AreaRelation = websheet.Constant.AreaRelation;
		if (relation == AreaRelation.EQUAL) {
			//make sure that A1:A1048576 is not equal to A:A
			var type = range.getType();
			if(this._refType == type || type == websheet.Constant.RangeType.CELL) {// cell compare to range is equal
				return AreaRelation.EQUAL;
			} else if(this._refType > type) {
				return AreaRelation.GREATER;
			} else {
				return AreaRelation.LESS;
			}
		}
		return relation;
	},
	
	/*boolean*/update: function(range, /*int*/rowDelta, /*int*/colDelta, event) {
		if ( (this._refType == websheet.Constant.RangeType.COLUMN && rowDelta != 0 )
			|| (this._refType == websheet.Constant.RangeType.ROW && colDelta != 0 ) ) {
			if( (this.getStartCol() == -1 && this.getEndCol() == -1 && rowDelta != 0) 
					||  (this.getStartRow() == -1 && this.getEndRow() == -1 && colDelta != 0) )
				return false;
			var data = event._source.data;
			if (!data){
				data = {};
				event._source.data = data;
			}
			data.sizeChanged = true;
			data.collectUndo = false;
			this.setContentDirty(true);
			this.broadcast(event);
			return false;
		}
		return this.inherited(arguments);
	},
	
	/**************Reference Management***********************/
	setContentDirty:function(bDirty)
	{
		this._bContentDirty = bDirty;
	},
	
	setNeedPartial:function(bNeedPartial)
	{
		this.needPartial = bNeedPartial;
	},
	
	/*boolean*/isCacheEnabled: function()
	{
		return this.cacheEnabled;
	},
	
	/*boolean*/enableCache: function(enabled) {
		// TODO use the reference count to enable or disable cache
		this.cacheEnabled = enabled;
	},
	
	resetCache:function()
	{
		this._cells = null;
		this._rows = null;
		this._opRows = null;
//		this._indexRows = null;
		this._columns = null;
		this._opColumns = null;
//		this._indexColumns = null;
		this._bContentDirty = false;
		this._firstCheckCells = true;
		this._firstCheckRows = true;
	},
	
	/*****************************GET CELL MODEL OF AREA****************************************/
	getCells:function(bModel, bIgnoreError) {
		var rangeInfo = this._getRangeInfo();
		if(this.needPartial)
			rangeInfo.needPartial = true;
		var cells = websheet.model.RangeUtil.getRefCells.call(this, rangeInfo , bModel, bIgnoreError);
		delete this.needPartial;
		return cells;
	},
	
	getCell:function(rowIndex, colIndex, bModel, bIgnoreError) {
		var rangeInfo = this._getRangeInfo();
		if(this.needPartial)
			rangeInfo.needPartial = true;
		var cell = websheet.model.RangeUtil.getRefCell.call(this, rangeInfo, rowIndex, colIndex, bModel, bIgnoreError);
		delete this.needPartial;
		return cell;
	},
	
//	_getCell:function(rowIndex, colIndex, bModel, bIgnoreError) {
//		var rangeInfo = this._getRangeInfo();
//		if(this.needPartial)
//			rangeInfo.needPartial = true;
//		var cell = websheet.model.RangeUtil._getCell.call(this, rangeInfo, rowIndex, colIndex, bModel, bIgnoreError);
//		delete this.needPartial;
//		return cell;
//	},

	/*array*/getCache: function(type, bOptimize) {
		if (!this.isCacheEnabled()) return null;
		if (this._bContentDirty) return null;

		var data = null;		
		switch (type) {
		case websheet.Constant.RangeType.RANGE:
			data = this._cells;
			break;
		case websheet.Constant.RangeType.ROW:
			if(bOptimize)
				data = this._opRows;
			else
				data = this._rows;
			break;
		case websheet.Constant.RangeType.COLUMN:
			if(bOptimize)
				data = this._opColumns;
			else
				data = this._columns;
			break;
		default:
			break;
		}
		
		return data;
	},
	
	/*void*/setCache: function(data, type, bOptimize) {
		if (!this.isCacheEnabled()) return;
		
		if (this._bContentDirty)
			this.resetCache();
		
		switch (type) {
		case websheet.Constant.RangeType.RANGE:
			this._cells = data;
			break;
		case websheet.Constant.RangeType.ROW:
			if(bOptimize)
				this._opRows = data;
			else
				this._rows = data;
			break;
		case websheet.Constant.RangeType.COLUMN:
			if(bOptimize)
				this._opColumns = data;
			else
				this._columns = data;
			break;
		default:
			break;
		}
	}
	
//	getRows:function(bModel, bOptimize, bIgnoreError, bIgnoreUnParse) {
//		var rangeInfo = this._getRangeInfo();
//		if(this.needPartial)
//			rangeInfo.needPartial = true;
//		var rows = websheet.model.RangeUtil.getRefRows.call(this, rangeInfo, bModel, bOptimize, bIgnoreError, bIgnoreUnParse);
//		delete this.needPartial;
//		return rows;
//	},
	
//	getCols:function(bModel, bOptimize, bIgnoreError) {
//		var rangeInfo = this._getRangeInfo();
//		if(this.needPartial)
//			rangeInfo.needPartial = true;
//		var cols = websheet.model.RangeUtil.getRefCols.call(this, rangeInfo, bModel, bOptimize, bIgnoreError);
//		delete this.needPartial;
//		return cols;
//	}
	
//	getRowByIndex:function(index, bModel, bOptimize, bIgnoreError) {
//		var rangeInfo = this._getRangeInfo();
//		if(this.needPartial)
//			rangeInfo.needPartial = true;
//		var row = websheet.model.RangeUtil.getRefRowByIndex.call(this, rangeInfo, index, bModel, bOptimize, bIgnoreError);
//		delete this.needPartial;
//		return row;
//	},
	
//	getColByIndex:function(index, bModel, bOptimize, bIgnoreError) {
//		var rangeInfo = this._getRangeInfo();
//		if(this.needPartial)
//			rangeInfo.needPartial = true;
//		var col = websheet.model.RangeUtil.getRefColByIndex.call(this, rangeInfo, index, bModel, bOptimize, bIgnoreError);
//		delete this.needPartial;
//		return col;
//	}
});