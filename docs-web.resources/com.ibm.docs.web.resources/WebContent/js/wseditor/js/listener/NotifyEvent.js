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

dojo.provide("websheet.listener.NotifyEvent");
dojo.declare("websheet.listener.NotifyEvent",null,{

	_type: null,//Constant.EventType
	//for DataChange,
//	_source.action: Constant.DataChange	
//						CALC: means that the cell's raw value has been set, here should parse it,
//							  It often broadcast before set row/col/range(which will set the cell raw value without parse)
//	_source.refType: Constant.OPType
//	_source.refValue:	data of dataChange, it can be several data in same type split by ",", such as several set cell event
//					for row/col, it is the SheetId.startIndex:endIndex/ alpha for col
//					for sheet, it is the sheetId
//					for cell, it is cell address, SheetId.colrow (cell address but not with sheetname, but with sheetId)
//					set row/col/range means set the content of row/col/range, such as clear row, sort range
	_source: null,
	_data: null,	//any info related with event
					//such as we can store the impact cell got by predelete event to _data(for example , _data.cells=[])
					//and transfer it to delete event, which can know update which formula cell
	constructor: function(type, source) 
	{
		this._type = type;
		if(!source)
			source = {};
		this._source = source;
	},
	setAction:function(a)
	{
		this._source.action = a;
	},
	setRefType:function(t)
	{
		this._source.refType = t;
	},
	setRefValue:function(v)
	{
		this._source.refValue = v;
	}
});