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

dojo.provide("websheet.model._cell");
dojo.require("websheet.model.BasicModel");
dojo.declare("websheet.model._cell",[websheet.model.BasicModel],{
	_doc: null,						//the document obj
	_parent:null,					// row obj
	_id: null,						// column id
	_repeatednum:0,			        //how many cells are merged
	
	/**
	 * constructor
	 */
	constructor:function(parent,id,repeatednum){
		this._parent = parent;
		this._doc = this._parent._parent._parent;
		this._id = id;
		if(undefined != repeatednum){
			this._repeatednum = repeatednum;
		}
	},

	/////////////////////////////////////////////////
	/*
	 * check whether this cell object has the same content as given cell
	 */
	/*boolean*/isEqual:function(cell) {
		if(null == cell) return false;
		if(this._rawValue != cell._rawValue){
		 	return false;
		}
		if(this._styleId != cell._styleId){ 
			return false;
		}
		if(this._repeatednum != cell._repeatednum){
			return false;
		}
		if(this._colSpan > 1 || cell._colSpan > 1){
			return false;
		}
		return true;
	},
	
	/////////////////////////////////////////////////
	/**
	 * get parent object
	 */
	/*Row*/_getParent:function(){
		return this._parent;
	},
	/**
	 * get document object
	 */
	/*Document*/_getDocument:function(){
		return this._doc;
	},
	
	/**
	 * get sheet object
	 */
	/*Document*/_getSheet:function(){
		return this._parent._parent;
	},

	/**
	 * get StyleManager
	 */
	/*style manager*/getStyleManager:function(){
		return 	this._doc._styleManager;
	},
	
	/**
	 * get row index
	 */
	/*Integer*/getRow:function(){
		return this._parent.getIndex();
	},
	
	/**
	 * get column index
	 */
	/*Integer*/getCol:function(){
		var index = this._colIndex;//might be undefined, only used when loading
		if( ((this._doc.isLoading) && (index == undefined))
				|| (!this._doc.isLoading))
		{
			var sheet = this._parent._parent;
			index = sheet.getColIndex(this._id);
			if(index > -1)
				index++;
			if(this._doc.isLoading)
				this._colIndex = index;
			else
				delete this._colIndex;
		}
		return index;
	},
		
	/**
	 * return cell's style id
	 * if colStyleId is specified, return column style if this cell doesn't have _styleId
	 * @param colStyleId		column style id
	 */
	/*string*/getStyleId:function(/*string*/colStyleId){
		if (this._styleId) return this._styleId;
		return colStyleId;
	},

	/**
	 * return the cell address with sheet id by default
	 * @params withSheetName		true return cell address with sheetname instead
	 */
	/*string*/getAddress:function(withSheetName){
		var sheetId = this._parent._parent._id;	
		var address = sheetId + "!";
		if (withSheetName) {
			var sheetName = this._parent._parent.getSheetName();
			if(websheet.Helper.needSingleQuotePattern.test(sheetName)){
				sheetName = sheetName.replace(/\'/g,"''");	// change '' if the sheet name has ' 
				sheetName = ["'", sheetName, "'"].join(""); 
			}
			address = sheetName + "!";
		}
		var r = this.getRow();
		var c = this.getCol();
		if(c > -1)
			c = websheet.Helper.getColChar(c);
		else
			c = websheet.Constant.INVALID_REF;
		address += c;
		
		if(r == -1)
			r = websheet.Constant.INVALID_REF;
		address += r;
		return address;
	},

	
	/**
	 * return cell's column id
	 */
	/*string*/getColumnId:function(){
		return this._id;
	},
	
	/**
	 * set cell's column id
	 */
	/*void*/setColumnId:function(columnId){
		this._id = columnId;
	},
	
	/**
	 * set cell's repeatednum
	 * @param  repeatednum          integer 
	 */
	/*void*/setRepeatedNum:function(repeatednum){
		if(repeatednum > 0){
			this._repeatednum = repeatednum;
		}else{
			delete this._repeatednum;
		}
	},
	
	/**
	 * return cell's repeated number
	 */
	/*integer*/getRepeatedNum:function(){
		return this._repeatednum;
	},
	
	/**
	 * if cell doesn't contain any value or styleId,userId
	 * return true,otherwise return false;
	 */
	/*boolean*/isNull:function(){
		if (!this._doc._mhelper.isEmpty(this._rawValue) || this._styleId || this._colSpan > 1 || this._rowSpan > 1) {
			return false;
		} else {
			return true;
		}
	},
	
	/**
	 * return cell's styleCode
	 * if colStyleId is specified, return column's style object if this cell doesn't have _styleId
	 * @param colStyleId		column style id
	 */
	/*Style*/getStyle:function(/*string*/colStyleId){
		var styleCode = null;
		var styleId = this._styleId || colStyleId;
		if(styleId)
		{
			styleCode = this._doc._styleManager.getStyleById(styleId);
		}
		
		return styleCode;
	},
	
	isHidden:function(/*string*/colStyleId){
		var sheet = this._parent._parent;
		if(sheet._bProtected){
			var style = this.getStyle(colStyleId);
			return this._doc._styleManager.getAttr(style,websheet.Constant.Style.PROTECTION_HIDDEN);
		}
		return false;
	},
    
	//Only use when need other infos of the cell, if only coverinfo is needed, then use row.isCoveredCell directly.
	isCovered: function(){
		if(this._colSpan > 1 || this._rowSpan > 1) return false;
		var sheet = this._getSheet();
		return (sheet && sheet.isCoveredCell(this.getRow(), this.getCol()));
	},
	
	/*integer*/getColSpan: function()
	{
		if(this._colSpan > 1)
			return this._colSpan;
		
		return 1;
	},
	
	getRowId: function() {
		return this._parent._id;
	},
	
	getColId: function() {
		return this._id;
	}
});