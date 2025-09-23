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

dojo.provide("websheet.event.undo.RangeEvents");
dojo.require("websheet.Constant");
dojo.require("websheet.event.undo.Event");
dojo.require("websheet.event.undo.Range3D");
dojo.declare("websheet.event.undo.RangeEvent",websheet.event.undo.Event, {
	
	
});

/*
 * SetRangeEvent cover the following events: 
 * (1) undo event for delete/row/column/sheet event
 */
dojo.declare("websheet.event.undo.SetRangeEvent",[websheet.event.undo.Event], {	
	_rangeId:null,
	constructor: function(jsonEvent)
	{
		dojo.mixin(this, jsonEvent);		
		var reference = jsonEvent.reference;
		var range = this.transformRange2Id(reference.refValue);
		var data = jsonEvent.data;
		if(data)
			range.usage = data.usage;
	},
	
	transformRange2Id: function(refValue){		
		var msgTransformer = this.getMsgTransformer();
		var parsedRef = websheet.Helper.parseRef(refValue);
		var range;
		if (parsedRef.is3D())
			range = new websheet.event.undo.Range3D(parsedRef,this._idManager);
		else
			range = new websheet.event.undo.Range(parsedRef,null,this._idManager);
		this._rangeId = msgTransformer.addRange(range,this.bTrans);		
		return range;
	},
	
	toJson: function(){
		var jEvent = websheet.Helper.cloneJSON(this.jsonEvent);		
		var msgTransformer = this.getMsgTransformer();
		var refValue =  msgTransformer.getRangeList(this.bTrans).getRange(this._rangeId);
		if(refValue)
		    jEvent.reference.refValue = refValue.getAddress();
		return jEvent;
	},
	clear: function(){
		var rangeList = this.getMsgTransformer().getRangeList(this.bTrans);
		var range = rangeList.getRange(this._rangeId);
		if(range) rangeList.deleteRange(range);		
	}	
	});

dojo.declare("websheet.event.undo.DeleteRangeEvent",[websheet.event.undo.Event], {	
	constructor: function(jsonEvent)
	{
		dojo.mixin(this, jsonEvent);	
	},
	
	toJson: function(){
		var jEvent = websheet.Helper.cloneJSON(this.jsonEvent);			
		return jEvent;
	}
	
	});
dojo.declare("websheet.event.undo.InsertRangeEvent",[websheet.event.undo.Event], {	
	_rangeId:null,
	constructor: function(jsonEvent)
	{
		dojo.mixin(this, jsonEvent);	
		var reference = jsonEvent.reference;
		var range = this.transformRange2Id(reference.refValue);
		//set usage which is used by RangeList._changeByType
		//to evaluate that keep the row/col id or set it to null 
		//when the row/col has been deleted
		var data = jsonEvent.data;
		if(data)
			range.usage = data.usage;
	},
	transformRange2Id: function(refValue){		
		var msgTransformer = this.getMsgTransformer();
		var parsedRef = websheet.Helper.parseRef(refValue);
		var range;
		if (parsedRef.is3D())
			range = new websheet.event.undo.Range3D(parsedRef,this._idManager);
		else
			range = new websheet.event.undo.Range(parsedRef,null,this._idManager);
		
		this._rangeId = msgTransformer.addRange(range,this.bTrans);		
		return range;
	},
	toJson: function(){
		var jEvent = websheet.Helper.cloneJSON(this.jsonEvent);		
		var msgTransformer = this.getMsgTransformer();
		var refValue =  msgTransformer.getRangeList(this.bTrans).getRange(this._rangeId);
		if(refValue)
		    jEvent.reference.refValue = refValue.getAddress();
		return jEvent;
	},
	clear: function(){
		var rangeList = this.getMsgTransformer().getRangeList(this.bTrans);
		var range = rangeList.getRange(this._rangeId);
		if(range) rangeList.deleteRange(range);		
	}
	
	});