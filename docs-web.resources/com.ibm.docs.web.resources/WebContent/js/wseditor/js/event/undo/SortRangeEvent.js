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

dojo.provide("websheet.event.undo.SortRangeEvent");
dojo.require("websheet.Constant");
dojo.require("websheet.event.undo.Event");

dojo.declare("websheet.event.undo.SortRangeEvent",websheet.event.undo.Event, {
	_sortRowIds: null,
	_invisibleRowsId : null,
	
	_checkRelated: function(token)
	{
		if(token.type == websheet.Constant.Event.SCOPE_ROW)
		{
			var eventSIndex = token.getStartRowIndex();
			var eventEIndex = token.getEndRowIndex();
			if(eventEIndex == -1) eventEIndex = eventSIndex;
			var sIndex = this.refTokenId.token.getStartRowIndex();
			var eIndex = this.refTokenId.token.getEndRowIndex();
			if(sIndex >= eventSIndex && eIndex <= eventEIndex) 
				return true;
			return false;
		}else if(token.type == websheet.Constant.Event.SCOPE_COLUMN)
		{
			var eventSIndex = token.getStartColIndex();
			var eventEIndex = token.getEndColIndex();
			if(eventEIndex == -1) eventEIndex = eventSIndex;
			var sIndex = this.refTokenId.token.getStartColIndex();
			var eIndex = this.refTokenId.token.getEndColIndex();
			if(sIndex >= eventSIndex && eIndex <= eventEIndex) 
				return true;
			return false;
		}	
	},
	
	constructor: function(jsonEvent,idManager)
	{
		dojo.mixin(this, jsonEvent);
		if(jsonEvent.data && jsonEvent.data.sortresults)
		{
			this._sortRowIds = [];
			this.transformData2Id();
		}
	},
	
	/*
	 * transform index -> id for data in the josn event
	 */
	transformData2Id: function()
	{
		var sheetId = this.refTokenId.getSheetId();
		var srIndex = this.refTokenId.token.getStartRowIndex();
		var sortResults = this.jsonEvent.data.sortresults; 
		for(var i = 0; i < sortResults.length; i++)
		{
			var rowIndex = srIndex + parseInt(sortResults[i]);
			this._sortRowIds[i] = this._idManager.getRowIdByIndex(sheetId, rowIndex - 1,true);
		}
		var invisibleRowsId = this.jsonEvent.data.invisibleRows;
		if(invisibleRowsId!=null)
		{
		    this._invisibleRowsId = [];
		    for(var i=0;i<invisibleRowsId.length;i++)
		    {
		        var rowIndex = srIndex + parseInt(invisibleRowsId[i]);
		        this._invisibleRowsId[i] = this._idManager.getRowIdByIndex(sheetId, rowIndex - 1,true);
		    }
		}
	},
	
	/*
	 * transform index -> id for data in the josn event
	 */
	transformData2Index: function()
	{
		var sheetId = this.refTokenId.getSheetId();
		var srIndex = this.refTokenId.token.getStartRowIndex();
		var erIndex = this.refTokenId.token.getEndRowIndex();
		var sortResults = []; 
		//Find the new added rows' id
		//if(erIndex-srIndex+1>this._sortRowIds.length)
		{
			var tmpMap = {};
			for(var i = 0; i < this._sortRowIds.length; i++)
		    {
		        var rowId = this._sortRowIds[i];
		        tmpMap[rowId] = 1;
		    }
			for(var i=0;i<erIndex-srIndex+1;i++)
			{
				var id = this._idManager.getRowIdByIndex(sheetId, srIndex + i - 1);
				if(!tmpMap[id])
					sortResults[i] = i;
			}
		}
		var data = {sortresults:sortResults};
		
		if(this._invisibleRowsId!=null)
		{
		    for (var i = 0; i < this._invisibleRowsId.length; i++) 
            {
                var index = this._idManager.getRowIndexById(sheetId, this._invisibleRowsId[i])+1;
                if(index>0)
                {
                  sortResults[index-srIndex] = index-srIndex;
                }
            }
		}
		var n = 0;
	    for(var i = 0; i < this._sortRowIds.length; i++)
	    {
	        var rowId = this._sortRowIds[i];
            var isHideRow = false;
            if(this._invisibleRowsId!=null)
            {
                for(var j=0;j<this._invisibleRowsId.length;j++)
                {
                  if(rowId == this._invisibleRowsId[j])
                  {
                    isHideRow = true;
                    break;
                  }
                }
            }
            if(isHideRow)
            {
              continue;
            }
	    	var index = this._idManager.getRowIndexById(sheetId, rowId)+1;
	    	if (index == 0)
	    		continue;
	    	var delta = index - srIndex;	    	
	    	while(sortResults[n]!=null)
            {
              n++;
            }
            sortResults[n] = delta;
	    }
		return data;
	}
	
});