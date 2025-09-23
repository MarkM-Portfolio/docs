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

dojo.provide("websheet.event.undo.MessageTransformer");

dojo.require("websheet.event.undo.UndoRangeList");
dojo.require("websheet.event.undo.RangeList");
dojo.require("websheet.event.undo.Message");

dojo.declare("websheet.event.undo.MessageTransformer",null, {
	_maxRangeIndex: 0,    // for generate range Id
	_cache: null,         // to keep the deleted row ids or col id
	rangeList4Undo: null, // keep all the ranges used in the undo stack
	rangeList4Trans: null, //keep all the ranges used for the transform the send out list
	editor: null,
	
	constructor: function(editor) {
		this.editor = editor;
	},
	
	getCache: function()
	{
		return this._cache;
	},
	
	setCache: function(cache)
	{
		this._cache = cache;
	},
	
	resetRangeList4Trans: function(idManager)
	{
		var rangeList = this.getRangeList(true);
		rangeList.reset(idManager);
	},
	/*
	 * @param bTrans 		true  - the range is added by transforming the event in local send out list 
	 * 						false - the range is added by undo event for undo/redo and needs to be notified
	 */
	getRangeList: function(bTrans)
	{
//		if(!this.rangeList)
//		{
//			this.rangeList = new websheet.event.undo.RangeList(null,false);
//			this.rangeList.startListening(this.editor.getController());
//		}
//		return this.rangeList;
		if(!bTrans)
		{
			if(!this.rangeList4Undo)
			{
				this.rangeList4Undo = new websheet.event.undo.UndoRangeList(null,false);
				this.rangeList4Undo.startListening(this.editor.getController());
			}
			return this.rangeList4Undo;
		}
		else
		{
			if(!this.rangeList4Trans)
			{
				this.rangeList4Trans = new websheet.event.undo.RangeList(null,false);
			}
			return this.rangeList4Trans;
		}
	},	
	
	_generateId:function()
	{
		return websheet.Constant.IDPrefix.RANGE + this._maxRangeIndex++;
	},
	
	/*
	 * range model without rangid
	 */
	addRange: function(range,bTrans)
	{
		var rangeId = this._generateId();
		range.setRangeId(rangeId);
		range.setUsage(websheet.Constant.RangeUsage.UNDO);
		var rangeList = this.getRangeList(bTrans);
		rangeList.addRange(range);
		return rangeId;
	},
	
	transform2Id: function(msgJosn,idManager)
	{
		var message = new websheet.event.undo.Message(msgJosn,idManager);
		return message;
	},
	
	transform2Index: function(message)
	{
		return message.toJson();
	}
});