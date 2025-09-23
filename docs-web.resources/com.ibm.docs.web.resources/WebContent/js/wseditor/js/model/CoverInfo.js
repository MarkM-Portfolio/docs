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

dojo.provide("websheet.model.CoverInfo");
dojo.require("websheet.Constant");
dojo.require("websheet.model._cell");
dojo.declare("websheet.model.CoverInfo",[websheet.model._cell],{
	_colSpan: 1,					// how many merged cells the cell has: _colSpan - 1
	_rowSpan: 1,	
	/**
	 * constructor
	 */
	constructor:function(parent,id,colSpan, rowSpan){
		this.setColSpan(colSpan);
		this.setRowSpan(rowSpan);
	},

	/*
	 * check whether this object can be merged together with given 'coverInfo'
	 */
	/*boolean*/isMergable:function(coverInfo) {
		// TODO
		return true;
	},
	
	/*boolean*/isEqual:function(coverInfo) {
		// TODO
		return true;
	},
	
	/**
	 * set cell's repeatednum
	 * @param  repeatednum          integer 
	 */
	/*void*/setRepeatedNum:function(repeatednum){
		this._repeatednum = repeatednum;
		if (this._colSpan)
			this._colSpan = repeatednum + 1;
	},	

	//must make sure colSpan > 1, need a method to always check it.
	/*void*/setColSpan: function(colSpan)
	{
		this._colSpan = colSpan;
		this._colSpan = (this._colSpan > 0)? this._colSpan : 1;
		this._repeatednum = this._colSpan - 1;
	},
	
	/*void*/setRowSpan: function(rowSpan)
	{
		this._rowSpan = rowSpan;
		this._rowSpan = (this._rowSpan > 0)?this._rowSpan : 1;
	},
	
	/*int*/getColSpan: function()
	{
		return this._colSpan;
	},
	
	/*int*/getRowSpan: function()
	{
		return this._rowSpan;
	}
});