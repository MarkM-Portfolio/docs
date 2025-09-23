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

dojo.provide("websheet.event.IDManagerHelper");
dojo.require("websheet.Constant");

websheet.event.IDManagerHelper = 
{
	Event: websheet.Constant.Event,

	/**
	 *  idm:      the idManager that will be updated
	 *  message:  json events updates
	 *  reverse:  ture for undo and false for redo
	 * 
	 *  return the row/column/sheet ids that have been deleted when update idManager
	 */
	updateByEvents: function(idm, message,reverse)
	{
		var allBackupIds = [];
		if(!message.updates) return allBackupIds;
		for(var i=0;i<message.updates.length;i++)
		{
			var jsonEvent = message.updates[i];
			var backupIds = this.updatebyEvent(idm, jsonEvent,reverse);
			allBackupIds.push(backupIds);
		}
		return allBackupIds;
	},
	
	//update idm according to jsonEvent
	updatebyEvent: function(idm, jsonEvent,reverse)
	{
		var action = jsonEvent.action;
		var type = jsonEvent.reference.refType;
		var refValue = jsonEvent.reference.refValue;
		
		switch(type)
		{
			case this.Event.SCOPE_SHEET:
			{
				if(action==this.Event.ACTION_SET)
				{
					return this._updateSheet(idm,jsonEvent,reverse);
				}
				else if(action==this.Event.ACTION_MOVE)
				{
					return this._moveSheet(idm,jsonEvent,reverse);
				}
				else if(action==this.Event.ACTION_INSERT)
				{
					return this._insertSheet(idm,jsonEvent,reverse);
				}
				else if(action==this.Event.ACTION_DELETE)
				{
					return this._deleteSheet(idm,jsonEvent,reverse);
				}
			}
			break;
			
			case this.Event.SCOPE_ROW:
			{
				if(action==this.Event.ACTION_INSERT)
				{
					return this._insertRow(idm,jsonEvent,reverse);
				}
				else if(action==this.Event.ACTION_DELETE)
				{
					return this._deleteRow(idm,jsonEvent,reverse);
				}
			}
			break;
			
			case this.Event.SCOPE_COLUMN:
			{
				if(action==this.Event.ACTION_INSERT)
				{
					return this._insertCol(idm,jsonEvent,reverse);
				}
				else if(action==this.Event.ACTION_DELETE)
				{
					return this._deleteCol(idm,jsonEvent,reverse);
				}
			}
			break;
			
		}
		return [];
	},
	
	_insertRow: function(idm,jsonEvent,reverse)
	{
		var backupIds = [];
		var parsedRow = websheet.Helper.parseRef(jsonEvent.reference.refValue);
		
		var count = parsedRow.endRow - parsedRow.startRow + 1;
		var sheetId = idm.getSheetIdBySheetName(parsedRow.sheetName);
		
		var srIndex = parsedRow.startRow - 1;
		if (!reverse)
			idm.insertRowAtIndex(sheetId, srIndex, count);
		else
			backupIds = idm.deleteRowAtIndex(sheetId, srIndex, count);
		return backupIds;
	},
	
	_deleteRow: function(idm,jsonEvent,reverse)
	{
		var parsedRow = websheet.Helper.parseRef(jsonEvent.reference.refValue);
		
		var count = parsedRow.endRow - parsedRow.startRow + 1;
		var sheetId = idm.getSheetIdBySheetName(parsedRow.sheetName);
		
		var srIndex = parsedRow.startRow - 1;
		if (!reverse)
			idm.deleteRowAtIndex(sheetId, srIndex, count);
		else
			idm.insertRowAtIndex(sheetId, srIndex, count);
		return [];
	},
	
	_insertCol: function(idm,jsonEvent,reverse)
	{
		var backupIds = [];
		var parsedCol = websheet.Helper.parseRef(jsonEvent.reference.refValue);
		var startCol = parsedCol.startCol;
		var endCol = parsedCol.endCol;
		
		var count = endCol - startCol + 1;
		var sheetId = idm.getSheetIdBySheetName(parsedCol.sheetName);
		
		if (!reverse)
			idm.insertColAtIndex(sheetId, startCol -1, count);
		else
			backupIds = idm.deleteColAtIndex(sheetId, startCol-1, count);
		
		return backupIds;
	},
	
	_deleteCol: function(idm,jsonEvent,reverse)
	{
		var parsedCol = websheet.Helper.parseRef(jsonEvent.reference.refValue);
		var startCol = parsedCol.startCol;
		var endCol = parsedCol.endCol;
		
		var count = endCol - startCol + 1;
		var sheetId = idm.getSheetIdBySheetName(parsedCol.sheetName);
		
		if (!reverse)
			idm.deleteColAtIndex(sheetId, startCol-1, count);
		else
			idm.insertColAtIndex(sheetId, startCol-1, count);
		
		return [];
	},
	
	_updateSheet: function(idm,jsonEvent,reverse)
	{
		//rename sheet
		if(jsonEvent.data.sheet.sheetname)
		{
			var newSheetName = jsonEvent.data.sheet.sheetname;
			var oldSheetName = jsonEvent.reference.refValue;
			
			if (!reverse) 
		        idm.renameSheet(oldSheetName, newSheetName);
		    else 
		        idm.renameSheet(newSheetName, oldSheetName);
		}	
		//show hide sheet
		else if(jsonEvent.data.sheet.visibility)
		{
			var cnst = websheet.Constant.SHEET_VISIBILITY_ATTR;
			var visible = jsonEvent.data.sheet.visibility == cnst.SHOW ? true : false;
			var sheetName = jsonEvent.reference.refValue.split('|')[0];
			var sheetId = idm.getSheetIdBySheetName(sheetName);
			if(!reverse)
				idm.updateSheetVis(sheetId,visible);
			else
				idm.updateSheetVis(sheetId,!visible);
		}	
	    return [];		
	},
	
	_moveSheet: function(idm,jsonEvent,reverse)
	{
		var sheetName = jsonEvent.reference.refValue.split('|')[0];
		var delta = parseInt(jsonEvent.data.delta);
		
        if(reverse) 
        	delta = -delta;
        
        var sheetId = idm.getSheetIdBySheetName(sheetName);
        var rIndex = idm.getSheetIndexById(sheetId);
        var index = rIndex + delta;
        
        idm.moveSheet(sheetId, index);
        
        return [];
	},
	
	_insertSheet: function(idm,jsonEvent,reverse)
	{
		var backupIds = [];
		var sheetName = jsonEvent.data.sheet.sheetname;
		var sheetIndex = jsonEvent.data.sheet.sheetindex;
		
		var id = idm.getSheetIdBySheetName (sheetName);
	    if (!reverse) 
	    {
	      	if (id == null) 	     
	        	idm.insertSheetAtIndex(sheetIndex - 1,null,sheetName);
	    } 
	    else 
	    {
	    	if(id!=null)
	    	{
	    		var index = idm.getSheetIndexById(id);
	      		backupIds = idm.deleteSheetAtIndex(index);
	    	}
	    }
		return backupIds;
	},
	
	_deleteSheet: function(idm,jsonEvent,reverse)
	{
		var list = jsonEvent.reference.refValue.split('|');
		var sheetName = list[0];
		var sheetIndex = list[1];
		
		var sheetId = idm.getSheetIdBySheetName (sheetName);    
	    if (!reverse) 
	    {
		     if(sheetId!=null)
		     {
			     var sIndex = idm.getSheetIndexById(sheetId);
			     var visibleSheetCnt = websheet.model.ModelHelper.getDocumentObj().getVisibleSheetsCount();
			     if (visibleSheetCnt > 1 || sIndex > -1) 
			        idm.deleteSheetAtIndex(sIndex);
		     }
		} 
		else
		{
			if(sheetId==null)
		     	idm.insertSheetAtIndex(sheetIndex-1, null,sheetName);
		}
		
		return [];
	}
}