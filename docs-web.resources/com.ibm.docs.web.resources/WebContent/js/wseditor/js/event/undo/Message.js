dojo.provide("websheet.event.undo.Message");

dojo.require("websheet.Constant");
dojo.require("websheet.event.undo.SetCellEvent");
dojo.require("websheet.event.undo.SetCellEvent4UndoDelete");
dojo.require("websheet.event.undo.RowEvents");
dojo.require("websheet.event.undo.RangeEvents");
dojo.require("websheet.event.undo.UnnamedRangeEvent");
dojo.require("websheet.event.undo.SortRangeEvent");
dojo.require("websheet.event.undo.ColumnEvents");
dojo.require("websheet.event.undo.SheetEvents");
dojo.require("websheet.event.undo.MergeSplitEvent");
dojo.require("websheet.event.undo.FilterEvent");
dojo.require("websheet.event.undo.FreezeEvent");

dojo.declare("websheet.event.undo.Token",null, {
	_sheetName : "",
	_endSheetName : null,
	_startRowIndex: -1,   //index is 1 based
	_endRowIndex: -1,
	_startColIndex: -1,  //index is 1 based
	_endColIndex: -1,
	_refType: websheet.Constant.RangeType.RANGE,
	type: null,
	
	constructor: function(refValue, refType)
	{
		this.type = refType;
		this.parse(refValue);
	},
	
	parse: function(refValue)
	{
		if(this.type == websheet.Constant.Event.SCOPE_SHEET)
        {
        	this._sheetName = refValue.split("|")[0];;
        }else{
        	var parsedRef = websheet.Helper.parseRef(refValue);
        	this._sheetName = parsedRef.sheetName;
        	var type = parsedRef.getType();
        	this._refType = type;
        	if(type == websheet.Constant.RangeType.ROW){
        		this._startRowIndex = parsedRef.startRow;
	        	this._endRowIndex = parsedRef.endRow;
        	} else if(type == websheet.Constant.RangeType.COLUMN){
        		this._startColIndex = parsedRef.startCol;
	        	this._endColIndex = parsedRef.endCol;
        	} else {
	        	this._startRowIndex = parsedRef.startRow;
	        	this._endRowIndex = parsedRef.endRow;
	        	this._startColIndex = parsedRef.startCol;
	        	this._endColIndex = parsedRef.endCol;
        	}
        }
	},
	
	getSheetName: function()
	{
		return this._sheetName;
	},
	
	setSheetName: function(sheetName)
	{
		this._sheetName = sheetName;
	},
	
	getEndSheetName: function()
	{
		return this._endSheetName;
	},
	
	setEndSheetName: function(endSheetName)
	{
		this._endSheetName = endSheetName;
	},
	
	getStartRowIndex: function()
	{
		return this._startRowIndex;
	},
	
	setStartRowIndex: function(index)
	{
		this._startRowIndex = index;
	},
	
	getEndRowIndex: function()
	{
		return this._endRowIndex;
	},
	
	setEndRowIndex: function(index)
	{
		this._endRowIndex = index;
	},
	getStartColIndex: function()
	{
		return this._startColIndex;
	},
	
	setStartColIndex: function(index)
	{
		this._startColIndex = index;
	},
	
	getEndColIndex: function()
	{
		return this._endColIndex;
	},
	
	setEndColIndex: function(index)
	{
		this._endColIndex = index;
	},
	
	toString: function()
	{
		var ret = this._sheetName;
		var params = {};
		switch(this.type)
		{
			case websheet.Constant.Event.SCOPE_SHEET:
			break;
			case websheet.Constant.Event.SCOPE_ROW:
			params.refMask = websheet.Constant.ROWS_MASK;
			if(this._startRowIndex > 0){
				if(this._endRowIndex>0){
					ret=websheet.Helper.getAddressByIndex(ret, this._startRowIndex, null,null,this._endRowIndex,null,params);
				}else{
					ret=websheet.Helper.getAddressByIndex(ret, this._startRowIndex, null,null,null,null,params);
				}
			}else return null;
			break;
			case websheet.Constant.Event.SCOPE_COLUMN:
			params.refMask = websheet.Constant.COLS_MASK;
			if(this._endColIndex>0){
				ret=websheet.Helper.getAddressByIndex(ret, null, this._startColIndex,null,null,this._endColIndex,params);
			}else{
				ret=websheet.Helper.getAddressByIndex(ret, null, this._startColIndex,null,null,null,params);
			}		
			break;
			case websheet.Constant.Event.SCOPE_CELL:
				params.refMask = websheet.Constant.CELL_MASK;
				ret=websheet.Helper.getAddressByIndex(ret, this._startRowIndex, this._startColIndex,null,this._startRowIndex,this._startColIndex,params);
			break;
			case websheet.Constant.Event.SCOPE_CHART:
				ret = websheet.Helper.createVirtualRef(ret);
			break;
			case websheet.Constant.Event.SCOPE_UNNAMERANGE:{
				var refMask;
				if (this._refType == websheet.Constant.RangeType.RANGE)
					refMask = websheet.Constant.RANGE_MASK;
				else if (this._refType == websheet.Constant.RangeType.CELL)
					refMask = websheet.Constant.CELL_MASK;
				else if (this._refType == websheet.Constant.RangeType.COLUMN)
					refMask = websheet.Constant.COLS_MASK;
				else if (this._refType == websheet.Constant.RangeType.ROW)
					refMask = websheet.Constant.ROWS_MASK;
				else
					refMask = websheet.Constant.RANGE_MASK;
				ret=websheet.Helper.getAddressByIndex(ret, this._startRowIndex, this._startColIndex, this._endSheetName,this._endRowIndex,this._endColIndex,
						 { refMask : refMask });
			}
				
		}
		return ret;
	}
});

dojo.declare("websheet.event.undo.TokenId",null, {
	_sheetId: null,
	_endSheetId: null,
	_startRowId: null,
	_endRowId: null,
	_startColId:null,
	_endColId:null,
	_idRange:null,
	_rangeId:null, // just used for unnamerange
	token: null,
	_startRowIndex: null,		// save row index-es to store actual value for "M" id's.
	_endRowIndex: null,
	
	constructor: function(token,idManager)
	{
		this.token = token;
		this._idRange = [];
		this.updateId(idManager);
	},
	
	getIdRange: function()
	{
		return this._idRange;
	},
	
	getSheetId: function()
	{
		return this._sheetId;
	},
	/*
     * index --> Id transformation
     */
	updateId: function(idManager)
	{
		var sheetId = idManager.getSheetIdBySheetName(this.token.getSheetName());
		var maxRowIndex = idManager.maxRow;
		if(!sheetId)
			return;
			
		this._sheetId = sheetId;
		
		if(this.token.getEndSheetName())
			this._endSheetId = idManager.getSheetIdBySheetName(this.token.getEndSheetName());
		
		var srIndex = this.token.getStartRowIndex() ;
		
		if (srIndex > maxRowIndex)
		{
			this._startRowIndex = srIndex;
			this._startRowId = websheet.Constant.MAXREF;
		}
		else if(srIndex > 0) 
			this._startRowId = idManager.getRowIdByIndex(this._sheetId,srIndex-1,true);
			
		var erIndex = this.token.getEndRowIndex();
		if (erIndex > maxRowIndex)
		{
			this._endRowIndex = erIndex;
			this._endRowId = websheet.Constant.MAXREF;
		} else if(erIndex > 0){
			if(this._endSheetId)
				this._endRowId = idManager.getRowIdByIndex(this._endSheetId,erIndex-1,true);
			else
				this._endRowId = idManager.getRowIdByIndex(this._sheetId,erIndex-1,true);
		}
		else 
			erIndex = srIndex;
			
		var scIndex = this.token.getStartColIndex();
		if(scIndex > 0) 
			this._startColId = idManager.getColIdByIndex(this._sheetId,scIndex-1,true);
			
		var ecIndex = this.token.getEndColIndex();		
		if(ecIndex > 0) {
			if(this._endSheetId)
				this._endColId = idManager.getColIdByIndex(this._endSheetId,ecIndex-1,true);
			else
				this._endColId = idManager.getColIdByIndex(this._sheetId,ecIndex-1,true);
		}
		else 
			ecIndex = scIndex;
		
		if(this.token.type == websheet.Constant.Event.SCOPE_ROW)
		{
			if(erIndex >= srIndex)
			{
				for(var i = srIndex; i <= erIndex; i++)
				{
					var rowId = idManager.getRowIdByIndex(this._sheetId,i-1,true);
					this._idRange.push(rowId);
				}
			}
		}
		else if(this.token.type == websheet.Constant.Event.SCOPE_COLUMN)
		{
			if(ecIndex >= scIndex)
			{
				for(var i = scIndex; i <= ecIndex; i++)
				{
					var colId = idManager.getColIdByIndex(this._sheetId,i-1,true);
					this._idRange.push(colId);
				}
			}
		}
		else if(this.token.type == websheet.Constant.Event.SCOPE_UNNAMERANGE)
		{
			var msgTransformer = websheet.event.DocumentAgent.getMsgTransformer();
			var address = this.token.toString();
			var range = new websheet.event.undo.Range(address,this.token.getSheetName(),idManager); 
			this._rangeId = msgTransformer.addRange(range,idManager.bTrans);
		}
	},
	
	/*
     * ID --> index transformation
     */
	updateToken: function(idManager)
	{
		var sheetName = idManager.getSheetNameById(this._sheetId);
		var ws = websheet;
		var wconst = ws.Constant;
		if(!sheetName)
			return;
		
	  	this.token.setSheetName(sheetName);
	  	
	  	if(this._endSheetId){
	  		var endSheetName = idManager.getSheetNameById(this._endSheetId);
	  		if(endSheetName)
	  			this.token.setEndSheetName(endSheetName);
	  	}
	  	
      	if(this.token.type == wconst.Event.SCOPE_UNNAMERANGE)
      	{
      		var msgTransformer = websheet.event.DocumentAgent.getMsgTransformer();
      		var rangeList = msgTransformer.getRangeList(idManager.bTrans);
      		var range = rangeList.getRange(this._rangeId,this._sheetId);
    
            var rangeInfo;
      		if(range)
      		{
      		    rangeInfo = range._getRangeInfo();
      			if (rangeInfo){
            	   this.token.setStartRowIndex (rangeInfo.startRow);
            	   this.token.setEndRowIndex (rangeInfo.endRow);
            	   this.token.setStartColIndex (rangeInfo.startCol);
            	   this.token.setEndColIndex (rangeInfo.endCol);    
      			}        	                   
      		}
      	}else{
      		
      		if (this._startRowIndex != null)
      		{
      			this.token.setStartRowIndex(this._startRowIndex);
      			this._startRowIndex = null;
      		}
      		else if (this._startRowId) 
          	{
            	var index = idManager.getRowIndexById(this._sheetId, this._startRowId);
            	if(index != -1) this.token.setStartRowIndex (index + 1);
            	else this.token.setStartRowIndex (index);
            }
          
          	if (this._endRowIndex != null)
          	{
          		this.token.setEndRowIndex(this._endRowIndex);
          		this._endRowIndex = null;
          	}
          	else if (this._endRowId) 
    	    {
          		var index = -1;
          		if(this._endSheetId)
          			index = idManager.getRowIndexById(this._endSheetId, this._endRowId);
          		else	
          			index = idManager.getRowIndexById(this._sheetId, this._endRowId);
    	        if(index != -1 ) this.token.setEndRowIndex(index + 1);
    	        else this.token.setEndRowIndex(index);
    	    }
    	    
    	    if (this._startColId) 
          	{
            	var index = idManager.getColIndexById(this._sheetId, this._startColId);
            	if(index != -1) this.token.setStartColIndex (index + 1);
            	else this.token.setStartColIndex (index);
            }
          
    	    if (this._endColId) 
    	    {
    	    	var index = -1;
    	    	if(this._endSheetId)
    	    		index = idManager.getColIndexById(this._endSheetId, this._endColId);
    	    	else	
    	    		index = idManager.getColIndexById(this._sheetId, this._endColId);
    	        if (index != -1) {
    	        	if (index + 1 > wconst.MaxColumnIndex) {
    	        		this.token.setEndColIndex(wconst.MaxColumnIndex);
    	        	} else {
    	        		this.token.setEndColIndex(index + 1);
    	        	}
    	        }
    	        else this.token.setEndColIndex(index);
    	    }
      	}
	}
});


dojo.declare("websheet.event.undo.Message",null,{
	msgList: [],
	mainAction:null,
	// when undo one 'delete row or column' operation, the undo message contains set cell updates 
	// for formula cells that refer to those rows/column, the formula string in the set cell updates
	// shouldn't be transformed when undo isn't called from Transformer.js 
	_bTransform: false,	
	//when undo one 'delete row or column' operation, the undo message contains set cell updates 
	//the refvalue and formula string in the set cell updates shouldn't be transformed when process message in sendOutList
	_bTransSendoutMsg: false,
	
	constructor: function(message,idManager)
	{
		this.msgList = [];
		if(message.updates)
			this.loadFromEvents(message.updates,idManager);
	},
	
	setTransform: function(bTransform)
	{
		this._bTransform = bTransform;
	},
	
	setTransSendoutMsg: function(bTransSendoutMsg){
		this._bTransSendoutMsg = bTransSendoutMsg;
	},
	
	checkRelated: function(pEvent)
	{
		// (1)for  the action(set/insert/delete/clear/move), undo or redo, only contain one event, 
		// except for the undo of delete may contain several events 
		// then for the checkRelated function, here just check the first one
		// (2) for the merge / split aciton, may contain several events
		if(this.mainAction == websheet.Constant.Event.ACTION_SPLIT || this.mainAction == websheet.Constant.Event.ACTION_MERGE)
		{
			//for the merge action, if any merge action related with one of the event, should return true
			//else only if every event  related with the event, colud return true else return false
			var isAll = true;
			if(this.mainAction == websheet.Constant.Event.ACTION_MERGE && pEvent.action == websheet.Constant.Event.ACTION_MERGE)
				isAll = false;
			for(var i = 0; i < this.msgList.length; i++)
			{
				var event = this.msgList[i];
				var isRelated = event.checkRelated(pEvent);
				if(!isAll && isRelated)
				{
					return true;
				}else if(isAll && !isRelated)
				{
					return false;
				}
			}
			if(isAll) return true;
			else return false;
		}
		else
		{
			var event = this.msgList[0];
			if(event) return event.checkRelated(pEvent);
			return false;
		}

	},
	
	checkDataRelated: function(pEvent)
	{
		var event = this.msgList[0];
		if(event) return event.checkDataRelated(pEvent);
		return false;
	},
	
	clear: function()
	{
		for(var i = 0; i < this.msgList.length; i++)
		{
			var event = this.msgList[i];
			if(event) event.clear();
		}
	},
	
	loadFromEvents: function(events,idManager)
	{
		var mainEvent = events[0];
		var ma = this.mainAction = mainEvent.action;
		var mt = mainEvent.reference.refType;
		var wce = websheet.Constant.Event;		
		
		var bNotInsert = true;
		for(var i = 0 ; i < events.length; i++)
		{
			var jsonEvent = events[i];
			var action = jsonEvent.action;
			var type = jsonEvent.reference.refType;
			var event = null;
			if(action == websheet.Constant.Event.ACTION_SET)
			{
				if(type == websheet.Constant.Event.SCOPE_CELL)
				{
					if(i == 0 || bNotInsert){
						event = new websheet.event.undo.SetCellEvent(jsonEvent,idManager);
					}else {
						// If set cell is not master event in the message, its value will not be transformed
						event = new websheet.event.undo.SetCellEvent4UndoDelete(jsonEvent,idManager);
					}
				}
				else if(type == websheet.Constant.Event.SCOPE_ROW)
				{
					event = new websheet.event.undo.SetRowEvent(jsonEvent,idManager);
				}
				else if(type == websheet.Constant.Event.SCOPE_COLUMN)
				{
					event = new websheet.event.undo.SetColumnEvent(jsonEvent,idManager);
				}
				else if(type == websheet.Constant.Event.SCOPE_SHEET)
				{
					event = new websheet.event.undo.SetSheetEvent(jsonEvent,idManager);
				}
				else if(type == websheet.Constant.Event.SCOPE_RANGE)
				{
					event = new websheet.event.undo.SetRangeEvent(jsonEvent,idManager);
				}
				else if(type == websheet.Constant.Event.SCOPE_UNNAMERANGE)
				{
					event = new websheet.event.undo.SetUnnamedRangeEvent(jsonEvent,idManager);
				}
				else if(type == websheet.Constant.Event.SCOPE_CHART)
				{
					event = new websheet.event.undo.SetChartEvent(jsonEvent,idManager);
				}
			}
			else if(action == websheet.Constant.Event.ACTION_INSERT)
			{
				if(i == 0)
					bNotInsert = false;
				if(type == websheet.Constant.Event.SCOPE_ROW)
				{
					event = new websheet.event.undo.InsertRowEvent(jsonEvent,idManager);
				}
				else if(type == websheet.Constant.Event.SCOPE_UNNAMERANGE)
				{
					event = new websheet.event.undo.InsertUnnamedRangeEvent(jsonEvent,idManager);
				}
				else if(type == websheet.Constant.Event.SCOPE_COLUMN)
				{
					event = new websheet.event.undo.InsertColumnEvent(jsonEvent,idManager);
				}
				else if(type == websheet.Constant.Event.SCOPE_SHEET)
				{
					event = new websheet.event.undo.InsertSheetEvent(jsonEvent,idManager);
				}
				else if(type == websheet.Constant.Event.SCOPE_RANGE)
				{
					event = new websheet.event.undo.InsertRangeEvent(jsonEvent,idManager);
				}
			}
			else if(action == websheet.Constant.Event.ACTION_DELETE)
			{
				if(type == websheet.Constant.Event.SCOPE_ROW)
				{
					event = new websheet.event.undo.DeleteRowEvent(jsonEvent,idManager);
				}
				else if(type == websheet.Constant.Event.SCOPE_UNNAMERANGE)
				{
					event = new websheet.event.undo.UnnamedRangeEvent(jsonEvent,idManager);
				}
				else if(type == websheet.Constant.Event.SCOPE_COLUMN)
				{
					event = new websheet.event.undo.DeleteColumnEvent(jsonEvent,idManager);
				}
				else if(type == websheet.Constant.Event.SCOPE_SHEET)
				{
					event = new websheet.event.undo.DeleteSheetEvent(jsonEvent,idManager);
				}
				else if(type == websheet.Constant.Event.SCOPE_RANGE)
				{
					event = new websheet.event.undo.DeleteRangeEvent(jsonEvent,idManager);
				}
			}
			else if(action == websheet.Constant.Event.ACTION_CLEAR)
			{
				if(type == websheet.Constant.Event.SCOPE_ROW)
				{
					event = new websheet.event.undo.ClearRowEvent(jsonEvent,idManager);
				}
				else if(type == websheet.Constant.Event.SCOPE_UNNAMERANGE)
				{
					event = new websheet.event.undo.ClearUnnamedRangeEvent(jsonEvent,idManager);
				}
			}else if(action == websheet.Constant.Event.ACTION_MOVE)
			{
				if(type == websheet.Constant.Event.SCOPE_SHEET)
				{
					event = new websheet.event.undo.MoveSheetEvent(jsonEvent,idManager);
				}
			}
			else if(action == websheet.Constant.Event.ACTION_SORT)
			{
				if(type == websheet.Constant.Event.SCOPE_UNNAMERANGE)
				{
					event = new websheet.event.undo.SortRangeEvent(jsonEvent,idManager);
				}
			}
			else if(action == websheet.Constant.Event.ACTION_FILTER)
			{
				if(type == websheet.Constant.Event.SCOPE_UNNAMERANGE)
				{
					event = new websheet.event.undo.FilterEvent(jsonEvent,idManager);
				}
			}			
			else if(action == websheet.Constant.Event.ACTION_MERGE)
			{
				event = new websheet.event.undo.MergeEvent(jsonEvent,idManager);
			}
			else if(action == websheet.Constant.Event.ACTION_SPLIT)
			{
				event = new websheet.event.undo.SplitEvent(jsonEvent,idManager);
			}
			else if(action == websheet.Constant.Event.ACTION_FREEZE)
			{
				event = new websheet.event.undo.FreezeEvent(jsonEvent,idManager);
			}	
			else
			{
				event = new  websheet.event.undo.Event(jsonEvent,idManager);
			}
			// according to the event type, construct event
			if(event)this.msgList.push(event);
		}
	},
	
	updateIDManager : function (idm, reverse,dltIds)
	{
		var length = this.msgList.length;
		if(length == 0 ) return;
		if(!dltIds) dltIds = [];
		for(var i = length-1; i>= 0; i--)
		{
			if(this.msgList[i])
				this.msgList[i].updateIDManager(idm,reverse,dltIds[i]);
		}
	},
	
	toJson: function()
	{
		var events = [];
		var errorEventIndexArray = [];
		var isCol = false;
		// for the undo event of delete row/column( insert row/column), 
		// there may some followed set formula cell events, change the formula to the original
		if(this.msgList.length > 1 && this.msgList[0].action == websheet.Constant.Event.ACTION_INSERT 
		&& (this.msgList[0].type == websheet.Constant.Event.SCOPE_ROW 
		   || this.msgList[0].type == websheet.Constant.Event.SCOPE_COLUMN
		   || this.msgList[0].type == websheet.Constant.Event.SCOPE_SHEET))
		{
			var jsonEvent = this.msgList[0].toJson();
			events.push(jsonEvent);
			var insertRef = websheet.Helper.parseRef(jsonEvent.reference.refValue);
			var insertRowCnt = 0;
			var insertColCnt = 0;
			if(this.msgList[0].type == websheet.Constant.Event.SCOPE_ROW )
			{
				insertRowCnt = insertRef.endRow - insertRef.startRow + 1;
			}
			else if(this.msgList[0].type == websheet.Constant.Event.SCOPE_COLUMN)
			{
				isCol = true;
				var iSCIndex = insertRef.startCol;
				var iECIndex = insertRef.endCol;
				insertColCnt = iECIndex - iSCIndex + 1;
			}
			else if(this.msgList[0].type == websheet.Constant.Event.SCOPE_SHEET)
			{
				// the set (formula) cell messages if any being associated with this insert sheet message are invalid
				// because the corresponding sheet gets removed
				if(this.msgList[0].bChanged)
				{
					var msg = {};
					msg.updates = events;
					return msg;
				}
			}
			for(var i = 1; i < this.msgList.length; i++)
			{
				var jsonEvent = this.msgList[i].toJson();
				if(null == jsonEvent) 
				{
					errorEventIndexArray.push(i);
					continue;
				}
				if(this.msgList[i].action == websheet.Constant.Event.ACTION_SET && 
				   this.msgList[i].type == websheet.Constant.Event.SCOPE_CELL)
				{
				   //when undo one 'delete row or column' operation, the undo message contains set cell updates 
				  //the refvalue and formula string in the set cell updates shouldn't be transformed when process message in sendOutList	
				   if(!this._bTransSendoutMsg)
				   {
						var pareseRef = websheet.Helper.parseRef(jsonEvent.reference.refValue);
						var newRefValue = jsonEvent.reference.refValue;
						if(insertRef && pareseRef.sheetName == insertRef.sheetName && pareseRef!=null)
						{
							if(this.msgList[0].type == websheet.Constant.Event.SCOPE_ROW )
							{
								if(pareseRef.startRow >=  insertRef.startRow)
								{
									var rowIndex= pareseRef.startRow + insertRowCnt;
									newRefValue=websheet.Helper.getCellAddr(pareseRef.sheetName, rowIndex, pareseRef.startCol);
								}
							}
							else if(this.msgList[0].type == websheet.Constant.Event.SCOPE_COLUMN)
							{
								var iCol = pareseRef.startCol;
								var iSCol = insertRef.startCol;
								if(iCol >= iSCol)
								{
									var strCol = websheet.Helper.getColChar(iCol + insertColCnt);
									newRefValue=websheet.Helper.getCellAddr(pareseRef.sheetName, pareseRef.startRow, strCol);
								}
							}
						}
	
						jsonEvent.reference.refValue = newRefValue;
						if(!this._bTransform) {
							// for non-OT case, the transformed cell value may contain #REF, rewrite old value
							jsonEvent.data.cell.v = this.msgList[i].jsonEvent.data.cell.v;
							var tarr = this.msgList[i].jsonEvent.data.cell.tarr;
							if(tarr)
								jsonEvent.data.cell.tarr = tarr;
						}
					}
				}
				// at this kind is if the deleted sheet contain comments
				else if(jsonEvent.data.usage == websheet.Constant.RangeUsage.COMMENTS && this.msgList[i].action == websheet.Constant.Event.ACTION_INSERT && 
					this.msgList[i].type == websheet.Constant.Event.SCOPE_UNNAMERANGE && 
					this.msgList[0].type == websheet.Constant.Event.SCOPE_SHEET)
				{
					var sheetName = events[0].reference.refValue;
					var refValue = jsonEvent.reference.refValue;
					jsonEvent.reference.refValue = websheet.Helper.replaceSheetName(sheetName,refValue);
				}
				else if(isCol && this.msgList[i].action == websheet.Constant.Event.ACTION_FILTER){
					jsonEvent.data.col = insertRef.startCol + jsonEvent.data.delta;
					delete jsonEvent.data.delta;
				}
				
				if(jsonEvent) 
					events.push(jsonEvent);
			}
		}
		else
		{
			for(var i = 0; i < this.msgList.length; i++)
			{
				var jsonEvent = this.msgList[i].toJson();
				// in some case, such as set row range, one action may split to several events
				if(jsonEvent == null)
				{
					errorEventIndexArray.push(i);
					continue;
				}
				if(jsonEvent instanceof Array)
				{
					for(var j = 0; j < jsonEvent.length; j++)
					{
						events.push(jsonEvent[j]);
					}
				}
				else
				{
					events.push(jsonEvent);
				}
			}
		}
		//remove the error events
		for(var index = errorEventIndexArray.length -1; index >=0; index--)
		{
			this.msgList.splice(index,1);
		}
		if(events.length == 0) return null;
		//here check ACL events, if only left 1 event to update(add/delete) the sheet permission
		//which means the main action insert edit type range pm has conflict, then just return null;
		if(events.length == 1)
		{
			if(events[0].action ==  websheet.Constant.Event.ACTION_SET 
			&& events[0].data.usage == websheet.Constant.RangeUsage.ACCESS_PERMISSION
			&& events[0].data.data && events[0].data.data.add)
				return null;
		}	
		var msg = {};
		msg.updates = events;
		return msg;
	}
});
