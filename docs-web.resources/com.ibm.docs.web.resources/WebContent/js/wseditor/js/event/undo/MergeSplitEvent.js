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

dojo.provide("websheet.event.undo.MergeSplitEvent");

dojo.declare("websheet.event.undo.MergeEvent",websheet.event.undo.Event, {
	constructor: function(jsonEvent,idManager)
	{
		dojo.mixin(this, jsonEvent);
	},
	
	_checkRelated: function(refValue, refType,action)
	{
		this.refTokenId.updateToken(this._idManager);
		var parsedRef = websheet.Helper.parseRef(refValue);
		if(action == websheet.Constant.Event.ACTION_DELETE)
		{
			if(refType == websheet.Constant.Event.SCOPE_ROW)
			{
				var srIndex = parsedRef.startRow;
				var erIndex = parsedRef.endRow;
				if(erIndex < srIndex) erIndex = srIndex;
				var curSRIndex = this.refTokenId.token.getStartRowIndex();
				var curERIndex = this.refTokenId.token.getEndRowIndex();
				if(curERIndex < curSRIndex) curERIndex == curSRIndex;
				if(curSRIndex >= srIndex && curSRIndex <= erIndex &&
				   curERIndex >= srIndex && curERIndex <= erIndex )
			       return true;
			}
			else if(refType == websheet.Constant.Event.SCOPE_COLUMN)
			{
				// delete the first merged cell
				var scIndex = parsedRef.startCol;
				var curColIndex = this.refTokenId.token.getStartColIndex();
				if(curColIndex == scIndex ) return true;
			}
		}
		else if(action == websheet.Constant.Event.ACTION_MERGE)
		{
			var srIndex = parsedRef.startRow;
			var erIndex = parsedRef.endRow;
			if(erIndex < srIndex) erIndex = srIndex;
			var curSRIndex = this.refTokenId.token.getStartRowIndex();
			var curERIndex = this.refTokenId.token.getEndRowIndex();
			if(curERIndex < curSRIndex) curERIndex == curSRIndex;
			
			var scIndex = parsedRef.startCol;
			var ecIndex = parsedRef.endCol;
			if(!ecIndex || ecIndex < scIndex) ecIndex = scIndex;
			
			var curSCIndex = this.refTokenId.token.getStartColIndex();
			var curECIndex = this.refTokenId.token.getEndColIndex();
			if(curECIndex < curSCIndex) curECIndex = curSCIndex;
			
			// the other user's merge action overlap with the current merge action
			if(((srIndex >= curSRIndex && srIndex <= curERIndex) || (erIndex >= curSRIndex && erIndex <= curERIndex) )
			   && ((scIndex >= curSCIndex && scIndex <= curECIndex) || (ecIndex >= curSCIndex && ecIndex <= curECIndex)))
			{
				return true;
			}
		}
		
		return false;
	},
	
	/*
	 * validate the reference value
	 */
	_validate: function(refValue)
	{
		var parseRef = websheet.Helper.parseRef(refValue);
		if (!parseRef.isValid())
			return false;
		return true;
	},
	
	toJson: function()
	{
		if(this.controller.editor.hasACLHandler())
		{
			var refValue = this.refTokenId.token.toString();
			var bhChecker = this.controller.editor.getACLHandler()._behaviorCheckHandler;
			if(!bhChecker.canMergeCell(refValue))
				return null;
		}	
		return this.inherited(arguments);
	}
});

dojo.declare("websheet.event.undo.SplitEvent",websheet.event.undo.Event, {
	
	constructor: function(jsonEvent,idManager)
	{
		dojo.mixin(this, jsonEvent);
	},
	
	_checkRelated: function(refValue, refType,action)
	{
		this.refTokenId.updateToken(this._idManager);
		var parsedRef = websheet.Helper.parseRef(refValue);
		if(action == websheet.Constant.Event.ACTION_DELETE)
		{
			if(refType == websheet.Constant.Event.SCOPE_ROW)
			{
				var srIndex = parsedRef.startRow;
				var erIndex = parsedRef.endRow;
				if(erIndex < srIndex) erIndex = srIndex;
				var curSRIndex = this.refTokenId.token.getStartRowIndex();
				if(curSRIndex >= srIndex && curSRIndex <= erIndex )
			       return true;
			}
			else if(refType == websheet.Constant.Event.SCOPE_COLUMN)
			{
				// delete the first merged cell
				var scIndex = parsedRef.startCol;
				var curColIndex = this.refTokenId.token.getStartColIndex();
				if(curColIndex == scIndex ) return true;
			}
		}
		else if(action == websheet.Constant.Event.ACTION_MERGE)
		{
			// to make the action could be removed from undo stack
			return true;
		}

		return false;
	},
	
	/*
	 * validate the reference value
	 */
	_validate: function(refValue)
	{
		var parseRef = websheet.Helper.parseRef(refValue);
		if (!parseRef.isValid())
			return false;
		return true;
	}
});