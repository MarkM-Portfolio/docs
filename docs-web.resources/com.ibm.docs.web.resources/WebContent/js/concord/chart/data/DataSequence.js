/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

dojo.provide("concord.chart.data.DataSequence");

//Must be implemented by the editors
dojo.declare("concord.chart.data.DataSequence", null,{
	_dataArray: null,
	_exRef: null,
	_properties: null,
	_isDirty: false,
	_dataProvider: null,
	_addrList: null,
	_parent: null,
	_numFmt: null,
	
	constructor: function(dataProvider)
	{
		this._dataProvider = dataProvider;
		this._dataArray = [];
		this._properties = {};
	},
	
	setData: function(data)
	{
		this._dataArray = data;
	},
	
	getData: function()
	{
		this._isDirty = false;
		return this._dataArray;
	},
	
	setExRef: function(exRef)
	{
		this._exRef = exRef;
	},
	
	getExRef: function()
	{
		return this._exRef;
	},
	
	getAddress: function(beMSFmt,separator, bDlg)
	{
		return null;
	},
	
	generateLabel: function()
	{
		
	},
	
	notify: function(event)
	{
		
	},
	
	setProperty: function(key, value)
	{
		this._properties[key] = value;
	},
	
	getProperty: function(key)
	{
		return this._properties[key];
	},
	
	setDirty: function(dirty)
	{
		this._isDirty = dirty;
	},
	
	isDirty: function()
	{
		return this._isDirty;
	},
	
	setParent: function(parent)
	{
		this._parent = parent;
	},
	
	getChartId: function()
	{
		if(this._chartId)
			return this._chartId;
		else{
			var chart = this._parent._chart;
			if(chart)
				this._chartId = chart.id;
		}	
		return this._chartId;
	},
	
	/**
	 * @returns {category: xx, code: xx, currency: xx, fmColor:xx}
	 */
	getNumberFormat: function()
	{
		return this._numFmt;
	},
	
	setNumberFormat: function(numFmt)
	{
		this._numFmt = numFmt;
	},	
	
	getDataPointNumber: function()
	{
		return this._dataArray.length;
	},
	
	destroy: function()
	{
		
	}
	
});
