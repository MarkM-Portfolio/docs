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

dojo.provide("websheet.event.undo.Event");

dojo.require("websheet.Constant");
dojo.require("websheet.event.undo.Message");

dojo.declare("websheet.event.undo.Event",null, {
	
	controller: null,
	jsonEvent: null,
	refTokenId: null,
	action: null,
	type: null,
	_idManager: null,
	
	bTrans: false, // this flag used to identify this event is used for transfer the sendout list msg or not
   /*
   * construct  from jsonEvent and transform normalized refValue to id 
   */
	constructor: function(jsonEvent,idManager)
	{
		if(idManager) this.bTrans = true;
		if(!jsonEvent) return;
		this.jsonEvent = jsonEvent;
		this.action = jsonEvent.action;
		var reference = jsonEvent.reference;
		this.type = reference.refType;
		var doc = websheet.model.ModelHelper.getDocumentObj();
		this.controller = doc.controller;

		this._idManager = idManager;
		if(!this._idManager ) {
			this._idManager = doc._getIDManager();
		}
		
		var token = new websheet.event.undo.Token(reference.refValue,this.type);
		this.refTokenId = new websheet.event.undo.TokenId(token,this._idManager);
	},
	
	getSheetName: function()
	{
		var sheetId = this.refTokenId.getSheetId();
		return this._idManager.getSheetNameById(sheetId);
	},
	
	/*
	 * for all the delete event, check if it related to the current event
	 * param@ event: json
	 * return: true( related), false(not related)
	 */
	checkRelated: function(event)
	{
		if(event.reference.refType == websheet.Constant.Event.SCOPE_UNNAMERANGE && event.data 
				&& websheet.Constant.RangeUsage.CHART == event.data.usage){//delete chart should not related to other events
			if(this.type == websheet.Constant.Event.SCOPE_CHART){
				if(this.jsonEvent.data && event.data.rangeid == this.jsonEvent.data.chartId)
					return true;
			}
			else if(this.type == websheet.Constant.Event.SCOPE_UNNAMERANGE && this.jsonEvent && this.jsonEvent.data 
					&& websheet.Constant.RangeUsage.CHART == this.jsonEvent.data.usage 
					&& this.action != websheet.Constant.Event.ACTION_DELETE){
				if(event.data.rangeid == this.jsonEvent.data.rangeid)
					return true;
			}
			return false;
		}			
		if(this.action == websheet.Constant.Event.ACTION_MERGE ||
		   this.action == websheet.Constant.Event.ACTION_SPLIT ) 
		{
			return this._checkRelated(event.reference.refValue, event.reference.refType, event.action);
		}
		if(event.action != websheet.Constant.Event.ACTION_DELETE) return false;
		this.refTokenId.updateToken(this._idManager);
		var reference = event.reference;
		var token = new websheet.event.undo.Token(reference.refValue,reference.refType);
		var eTokenId = new websheet.event.undo.TokenId(token,this._idManager);
		
		if(this.type == websheet.Constant.Event.SCOPE_SHEET &&
		 (this.action == websheet.Constant.Event.ACTION_INSERT || this.action == websheet.Constant.Event.ACTION_DELETE ) )
	    {
		 	return this._checkRelated(token);
		}
		
		if(eTokenId._sheetId != this.refTokenId._sheetId) return false;
		

		if(reference.refType == websheet.Constant.Event.SCOPE_SHEET)
		{
			if(eTokenId._sheetId === this.refTokenId._sheetId)
				return true;
		}		
		return this._checkRelated(token);
	},
	
	_checkRelated: function(token)
	{
		return false;
	},
	
	checkDataRelated: function(event)
	{
		var reference = event.reference;
		var token = new websheet.event.undo.Token(reference.refValue,reference.refType);
		return this._checkDataRelated(token);
	},
	
	_checkDataRelated: function (token) {
		return false;
	},
	
	/*
	 * transform index -> id for reference
	 */
	transformRef2Id: function()
	{
		this.refTokenId.updateId(this._idManager);
	},
	/*
	 * transform id -> index for reference
	 * maybe overide by the subclass
	 */
	transformRef2Index: function()
	{
		this.refTokenId.updateToken(this._idManager);
	},
	
	/*
	 * transform index -> id for data in the josn event
	 */
	transformData2Id: function()
	{
		
	},
	
	/*
	 * transform index -> id for data in the josn event
	 */
	transformData2Index: function()
	{
	
	},
	
	/*
	 * delete the used range model and reference model
	 */
	clear: function()
	{
		
	},
	
	getMsgTransformer: function()
	{
		return websheet.event.DocumentAgent.getMsgTransformer();
	},
	
	/*
	 * if the subclass not implement the toJson method, and need check the refValue
	 * could overide this method
	 */
	_validate: function(refValue)
	{
		//here, maybe delete unnamerange, even the refValue is invalid, cloud be deleted
		if(this.action == websheet.Constant.Event.ACTION_DELETE) return true;
		if(this.type == websheet.Constant.Event.SCOPE_SHEET) return true;
		
		var parsedRef = websheet.Helper.parseRef(refValue);
		if (!parsedRef.isValid())
			return false;
		return true;
	},
	
	/*
	 * validate the refvalue, if is valide, return true, else return false;
	 */
	validate: function(refValue)
	{
		return this._validate(refValue);
	},
	
	toJson: function()
	{
		var jEvent = websheet.Helper.cloneJSON(this.jsonEvent);
		this.transformRef2Index();
		var refValue = this.refTokenId.token.toString();
		if(!this.validate(refValue))
		{
			console.log("invalide refValue : " + refValue + " event is : " + jEvent);
			return null;
		}
		jEvent.reference.refValue = refValue;
		
		var data = this.transformData2Index();
		if(data) jEvent.data = data;
		return jEvent;
	},
	
	updateIDManager : function (idm, reverse,dltIds)
	{
		return true;
	},	
	
	hasStructChange: function()
	{
		return false;
	}
});

