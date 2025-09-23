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

dojo.provide("websheet.parse.ParsedRef");
dojo.declare("websheet.parse.ParsedRef", null, {
	sheetName:null,
	endSheetName:null,
	startRow:-1,
	startCol:-1,
	endRow:-1,
	endCol:-1,
	refMask:websheet.Constant.RefAddressType.NONE,
	//index are 1-based
	//if you want to specify the invalid parsedRef or row/col type, pls set index to -1
	constructor: function(sheetName, /*int*/sr, /*int*/sc, /*int*/er, /*int*/ec, refMask, /*optional*/endSheetName) {
		this.sheetName = sheetName;
		this.startRow = sr;
		this.startCol = sc;
		this.endRow = er;
		this.endCol = ec;
		this.refMask = refMask;
		if(endSheetName == sheetName)
			this.endSheetName = null;
		else
			this.endSheetName = endSheetName;
		var type = refMask & websheet.Constant.DEFAULT_RANGE_MASK;
		if (sr == -1 && er == -1 && (type == websheet.Constant.DEFAULT_COLS_MASK)){
			this.startRow = 1;
			this.endRow = websheet.Constant.MaxRowNum;
		} else if (sc == -1 && ec == -1 && (type == websheet.Constant.DEFAULT_ROWS_MASK)){
			this.startCol = 1;
			this.endCol = websheet.Constant.MaxColumnIndex;
		} else if (er == -1 && ec == -1 && (type == websheet.Constant.DEFAULT_CELL_MASK)){
			this.endRow = this.startRow;
			this.endCol = this.startCol;
		}
	},
	
	setSheetName:function(sheetName){
		this.sheetName = sheetName;
		this.refMask &= ~websheet.Constant.RefAddressType.INVALID_SHEET;
	},

	setEndSheetName:function(endSheetName){
		this.endSheetName = endSheetName;
		this.refMask &= ~websheet.Constant.RefAddressType.INVALID_SHEET;
	},

	setInvalidSheetName:function(){
		//do not change the sheetName for recover sheet
		this.refMask |= websheet.Constant.RefAddressType.INVALID_SHEET;
	},
	
	// different with invalid sheet "#REF!"
	// it is the sheet referenced by user input formula, but the sheet does not exist
	setUnexistSheetName: function(){
		this.refMask |= websheet.Constant.RefAddressType.UNEXIST_SHEET;
	},
	
	// same params as that of websheet.Helper.getAddressByIndex
	// but add  "hasSheetName" key
	// because the reference might be reused by formula reference or data sequence or filter
	// if create formula reference without the sheet name first, then the refMask does not has start sheet mask
	// while data sequence and filter address both need sheet name
	getAddress:function(params) {
		params = params || {};
		if (!params.refMask)
			params.refMask = this.refMask;
		if(params.hasSheetName)
			params.refMask |= websheet.Constant.RefAddressType.SHEET;
		return websheet.Helper.getAddressByIndex(this.sheetName, this.startRow, this.startCol, this.endSheetName, this.endRow, this.endCol, params);
	},
	
	toString:function(){
		return this.getAddress();
	},
	
	isValid:function() {
		if ((this.refMask & websheet.Constant.RefAddressType.INVALID_SHEET)
				|| (this.refMask & websheet.Constant.RefAddressType.UNEXIST_SHEET) )
			return false;
		if( (this.refMask & websheet.Constant.DEFAULT_RANGE_MASK) == websheet.Constant.DEFAULT_RANGE_MASK){
			if(this.startRow == -1 || this.startCol == -1 || this.endRow == -1 || this.endCol == -1)
				return false;
			return true;
		}
		if( (this.refMask & websheet.Constant.DEFAULT_CELL_MASK) == websheet.Constant.DEFAULT_CELL_MASK){
			if(this.startRow == -1 || this.startCol == -1 )
				return false;
			return true;
		}
		if( (this.refMask & websheet.Constant.DEFAULT_ROWS_MASK) == websheet.Constant.DEFAULT_ROWS_MASK){
			if(this.startRow == -1 || this.endRow == -1)
				return false;
			return true;
		}
		if( (this.refMask & websheet.Constant.DEFAULT_COLS_MASK) == websheet.Constant.DEFAULT_COLS_MASK) {
			if(this.startCol == -1 || this.endCol == -1)
				return false;
			return true;
		}
		return false;
	},
	
	/*boolean*/is3D: function() {
		return this.endSheetName && this.endSheetName != this.sheetName;
	},
	
	getType:function() {
		return websheet.Helper.getRangeTypeByRefMask(this.refMask);
	},
	
	copy:function(){
		return new websheet.parse.ParsedRef(this.sheetName, this.startRow, this.startCol, this.endRow, this.endCol, this.refMask, this.endSheetName);
	}

});