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

dojo.provide("websheet.event.undo.SheetEvents");
dojo.require("dojo.i18n");
dojo.requireLocalization("websheet.event.undo","SheetEvents");

dojo.declare("websheet.event.undo.SetSheetEvent",websheet.event.undo.Event, {
	
	constructor: function(jsonEvent,idManager)
	{
		dojo.mixin(this, jsonEvent);
		this.transformRef2Id();
	},
	
	/*
	 * the undo event of rename sheet is also rename sheet
	 * bu
	 */
	transformRef2Id: function()
	{
		if(!this.refTokenId.getSheetId())
		{
			var sheetName = this.jsonEvent.data.sheet.sheetname;
//			var doc = websheet.model.ModelHelper.getDocumentObj();
//			var sheet = doc.getSheet(sheetName);
//			if(!sheet) return;
//			this.refTokenId._sheetId = sheet.getId();
		//	if (sheetName != undefined)
				this.refTokenId._sheetId = this._idManager.getSheetIdBySheetName(sheetName);
		}
	},
	
	updateIDManager: function(idm, reverse) 
	{
	    var success = true;
	    if (this.jsonEvent.data.sheet.visibility != undefined)
	    {
			var cnst = websheet.Constant.SHEET_VISIBILITY_ATTR;
			var visible = this.jsonEvent.data.sheet.visibility == cnst.SHOW ? true : false;
			var id = this.refTokenId.getSheetId();
			if(!reverse)
				idm.updateSheetVis(id,visible);
			else
				idm.updateSheetVis(id,!visible);	 
	    	return success;
	    }	
			
	    var oldName = this.refTokenId.token.getSheetName();
	    var newName = this.jsonEvent.data.sheet.sheetname;
	    if (newName == undefined) return success;
	    
	    var id = this.refTokenId.getSheetId();
	    if (!reverse) 
	    {
	      var id2 = idm.getSheetIdBySheetName (newName);
	      // old sheet name doesn't exist or new sheet name exists already
	      if (id == null || id2 != null) 
	        success = false;
	      else 
	        idm.renameSheet(oldName, newName);
	    } 
	    else 
	    {
	      if (id != null)
	        success = false;
	      else
	        idm.renameSheet(newName, oldName);
	    }
	    
	    return success;
    },
  
	toJson: function()
	{
		var sheetName = this.getSheetName();
		var jEvent = websheet.Helper.cloneJSON(this.jsonEvent);
		jEvent.reference.refValue = sheetName;
		if (jEvent.data.sheet.visibility != undefined){
			var sheetId = this.refTokenId.getSheetId();
			var info = this._idManager.getSheetVisibleInfo();
			var sheet_vis = info.sheetsInfo[sheetId];
			var visibleSheetCnt = info.visibleCount;
			
			if (visibleSheetCnt <= 1 && jEvent.data.sheet.visibility == "hide" && sheet_vis) return null;
			var refValue = sheetName + "|" + visibleSheetCnt;
			
			jEvent.reference.refValue = refValue;
			return jEvent;
		}
		var newName = jEvent.data.sheet.sheetname;
		var id2 = this._idManager.getSheetIdBySheetName(newName);
		if(sheetName != newName && id2 == null)
			return jEvent;
		else
			return null;
	},
	
	hasStructChange: function()
	{
		return true;
	}
});

dojo.declare("websheet.event.undo.MoveSheetEvent",websheet.event.undo.Event, {
	delta : -1,
	constructor: function(jsonEvent,idManager)
	{
		dojo.mixin(this, jsonEvent);
	},
	
	transformData2Index: function()
	{
		this.delta = parseInt(this.jsonEvent.data.delta);
		var sheetId = this.refTokenId.getSheetId();
		var sheetIndex = this._idManager.getSheetIndexById(sheetId) + 1;
//		var sheetCnt = websheet.model.ModelHelper.getDocumentObj().getSheets().length;
		var sheetCnt = this._idManager.getSheetCount();
		var dstIndex = sheetIndex + this.delta;
		dstIndex = (dstIndex < 1) ? 1: dstIndex;
		dstIndex = (dstIndex > sheetCnt)? sheetCnt: dstIndex;
		var newDelta = dstIndex - sheetIndex;
		var data = {};
		data.delta = newDelta;
		return data;
	},
	
	
    updateIDManager: function(idm, reverse) 
    {
        var tempDelta = this.delta;
        if(reverse) 
        	tempDelta = 0 - tempDelta;
        
        var sheetId = this.refTokenId.getSheetId();
        var rIndex = idm.getSheetIndexById(sheetId);
        var index = rIndex + tempDelta;
        idm.moveSheet(sheetId, index);
    
        return true;
    },
  
	toJson: function()
	{
		var jEvent = websheet.Helper.cloneJSON(this.jsonEvent);
		
		var sheetName = this.getSheetName();
		var sheetId = this.refTokenId.getSheetId();
		var sheetIndex = this._idManager.getSheetIndexById(sheetId) + 1;
		var refValue = sheetName + "|" + sheetIndex;
		
		jEvent.reference.refValue = refValue;
		
		var data = this.transformData2Index();
		jEvent.data = data;
		return jEvent;
	},
	
	hasStructChange: function()
	{
		return true;
	}
});

dojo.declare("websheet.event.undo.InsertSheetEvent",[websheet.event.undo.Event,websheet.listener.Listener], {
	_sheetIndex: -1,
	_originSheetIndex: -1,
	_link: "_",
	bChanged: false,
	meta:null, //sheet meta info,set by the outside method
	
	constructor: function(jsonEvent,idManager)
	{
		dojo.mixin(this, jsonEvent);
		if(jsonEvent.data && jsonEvent.data.sheet)
		{
			this._sheetIndex = parseInt(jsonEvent.data.sheet.sheetindex);
			this._originSheetIndex = this._sheetIndex;
		}
		if(!idManager) 
			this.startListening(this.controller);
	},
	
	_checkRelated: function(token)
	{
		if(token.type == websheet.Constant.Event.SCOPE_SHEET)
		{
			//the ui insert action
			if(!this.jsonEvent.data.sheet.isUndo)
			{
				return false;
			}
			// the undo action of delete
			else
			{
				var eTokenId = new websheet.event.undo.TokenId(token,this._idManager);
				// the this.refTokenId._sheetId maybe null here
				var sheetId = this._idManager.getSheetIdByIndex(this._sheetIndex-1);
				if(eTokenId._sheetId === sheetId) 
					return true;
			}
		}
		return false;
	},
	
	notify: function(source, event)
	{
		if(event._type == websheet.Constant.EventType.DataChange)
		{
			var s = event._source;
			if(s.refType == websheet.Constant.OPType.SHEET)
			{
				if(s.action == websheet.Constant.DataChange.INSERT)
				{
					var sIndex = parseInt(s.refValue.split("|")[1]);
					if(sIndex < this._sheetIndex) 
						this._sheetIndex++;
					else if(sIndex == this._sheetIndex)
					{
						if(sIndex < this._originSheetIndex)
							this._sheetIndex++;
					}
				}
				else if(s.action == websheet.Constant.DataChange.PREDELETE)
				{
					var sheetName = s.refValue;
					var sheetId = this._idManager.getSheetIdBySheetName(sheetName);
					var sIndex = this._idManager.getSheetIndexById(sheetId)+1;
					if(sIndex < this._sheetIndex) this._sheetIndex--;
				}
				else if(s.action == websheet.Constant.DataChange.PREMOVE)
				{
					var srcIndex = parseInt(s.refValue.split("|")[1]);
					var dstIndex = parseInt(s.refValue.split("|")[2]);
					if(srcIndex < this._sheetIndex && dstIndex >= this._sheetIndex)
						this._sheetIndex--;
					else if(srcIndex >= this._sheetIndex && dstIndex < this._sheetIndex)
						this._sheetIndex++;
				}
			}
		}
	},
	
	updateIDManager: function(idm, reverse,dltIds) 
	{
	    var success = true;
	    if (!reverse) 
	    {
	      var sheetName = this.refTokenId.token.getSheetName();	      
	      var index =  this._sheetIndex - 1;//idm.getSheetCount();	
	      var id = idm.getSheetIdBySheetName (sheetName);
	      if (id != null) 
	      {
	        // already exist
	        success = false;
	      }
	      else 
	      {
	      	var sheetId = null;
	      	if(dltIds && dltIds[0]) sheetId = dltIds[0];
	        idm.insertSheetAtIndex(index,sheetId,sheetName);
	      }
	    } 
	    else 
	    {
	      var sheetId = this.refTokenId.getSheetId();
	      var rIndex = idm.getSheetIndexById(sheetId);
	      idm.deleteSheetAtIndex(rIndex);
	    }
	    
        return success;
    },
  
  	clear: function()
  	{
  		var uuid = null;
  		if(this.jsonEvent.data && this.jsonEvent.data.sheet && this.jsonEvent.data.sheet.uuid)
  			uuid =  this.jsonEvent.data.sheet.uuid;
  		if(uuid)
  		{
  			var doc = websheet.model.ModelHelper.getDocumentObj();
			doc.getRecoverManager().clear(uuid);
  		}
  	},
	//TODO: how to handle the conflict, when the insert sheet name the same as the existed sheets
	toJson: function()
	{
		var jEvent = this.jsonEvent;
		jEvent.data.sheet.sheetindex = this._sheetIndex;
		var oldSheetName = jEvent.data.sheet.sheetname;
//		var doc = websheet.model.ModelHelper.getDocumentObj();
		var newSheetName = oldSheetName;
		var postfix = dojo.i18n.getLocalization("websheet.event.undo","SheetEvents").postfix;
//		while(doc.isSheetExist(newSheetName))
//		{
//			newSheetName += this._link + postfix;
//		}
		while(this._idManager.getSheetIdBySheetName(newSheetName))
		{
			newSheetName += this._link + postfix;
		}
		if(newSheetName !== oldSheetName)
		{
			jEvent.data.sheet.sheetname = newSheetName;
			jEvent.reference.refValue = newSheetName;
			this.bChanged = true;
		}
		if(this.meta)
			jEvent.data.sheet.meta = this.meta;
		return jEvent;
	},
	
	hasStructChange: function()
	{
		return true;
	}
});

dojo.declare("websheet.event.undo.DeleteSheetEvent",websheet.event.undo.Event, {
	constructor: function(jsonEvent,idManager)
	{
		dojo.mixin(this, jsonEvent);
	},
	
	_checkRelated: function(token)
	{
		if(token.type == websheet.Constant.Event.SCOPE_SHEET)
		{
			//the ui delete action
			if(!this.refTokenId._sheetId)
			{
				return false;
			}
			// the undo action of insert
			else
			{
				var eTokenId = new websheet.event.undo.TokenId(token,this._idManager);
				if(eTokenId._sheetId == this.refTokenId._sheetId) 
					return true;
			}
		}
		return false;
	},
	
	updateIDManager: function(idm, reverse) 
	{
	    var success = true;
	    
	    var sheetId = this.refTokenId.getSheetId();
	    if(!sheetId)
	    	return false;
	    
	    var index = idm.getSheetIndexById(sheetId);
	    var sheetName = this.refTokenId.token.getSheetName();
	      
	    if (!reverse) 
	    {
			var info = idm.getSheetVisibleInfo();
	    	var visibleSheetCnt = info.visibleCount; 
	    	if (visibleSheetCnt == 1 || index == -1) 
		        success = false;  
		      else
		        idm.deleteSheetAtIndex(index);
		 } 
		 else
		      idm.insertSheetAtIndex(index, null,sheetName);
	    
         return success;
    },
	
	toJson: function()
	{
		var jEvent = websheet.Helper.cloneJSON(this.jsonEvent);
		
		var sheetId = this.refTokenId.getSheetId();
		var sheetIndex = this._idManager.getSheetIndexById(sheetId);
		if(sheetIndex == -1) return null;
		sheetIndex += 1;
		var info = this._idManager.getSheetVisibleInfo();
		var sheetName = this.getSheetName();
		var sheet_vis = info.sheetsInfo[sheetId];
		var visibleSheetCnt = info.visibleCount;
		if (visibleSheetCnt <= 1 && sheet_vis) return null;
		var refValue = sheetName + "|" + sheetIndex + "|" + visibleSheetCnt;
		
		jEvent.reference.refValue = refValue;
		return jEvent;
	},
	
	hasStructChange: function()
	{
		return true;
	}
});