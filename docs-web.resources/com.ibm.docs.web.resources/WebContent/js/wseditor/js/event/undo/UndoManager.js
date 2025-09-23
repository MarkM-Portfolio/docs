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

/************************************************************************************/
/* Spreadsheet Undo manager(single user mode only, in TP2							*/
/************************************************************************************/
dojo.provide("websheet.event.undo.UndoManager");

dojo.require("websheet.Connector");
dojo.require("websheet.Constant");
dojo.require("websheet.event.undo.MessageTransformer");
dojo.require("websheet.event.Factory");

dojo.declare("websheet.event.undo.UndoManager",null, {
	editor: null,
	_index: -1,
	_stack:[],        //the undo & redo action
	_map: {},         //keep the actions,key is the action id, value is the action
	_maxActionIndex: 0,  //generate actionId with the max action index ++
	_MaxUndoSize: 10, //set maxinumn undo size 100
	_enabled:true,
	_msgTransformer: null,
		
	constructor: function(editor, maxUndoSize)
	{
		this.reset();
		// _MaxUndoSize is configurable
		if (maxUndoSize) 
			this._MaxUndoSize = maxUndoSize;
		else
			this._MaxUndoSize = websheet.Constant.MaxUndoStackSize;
		
		this._msgTransformer = new websheet.event.undo.MessageTransformer(editor);
		this.editor = editor;
	},
	
	getMsgTransformer: function()
	{
		return this._msgTransformer;
	},
	
	reset: function ()
	{ 
		this._index = -1;
		this._stack = [];
		this._map = {};
		var toolbar = this.editor && this.editor.getToolbar();
		if (toolbar) toolbar.refreshUndoRedoIcon();
	},
	
	hasUndo : function()
	{
		return this._index != -1 ? true : false;
	},

	hasRedo : function()
	{
		return this._index < this._stack.length -1 ? true : false;
	},
	
	/**
	 * Check the current redo state.
	 * @return {Boolean} Whether the spreadsheet has previous state to
	 *		retrieve.
	 */
	redoable : function()
	{			
		return this._enabled && this.hasRedo();
	},

	/**
	 * Check the current undo state.
	 * @return {Boolean} Whether the spreadsheet has future state to restore.
	 */
	undoable : function()
	{			
		return this._enabled && this.hasUndo();
	},
	
	/*
	 * get the action by id, action:{"undo":{},"redo":{}}
	 */
	getActionById: function(id,type)
	{
		var actionJson = null;
		if(id && this._map[id])
		{
			var action = this._map[id];
			if(type == "undo"){
				action.undo.setTransform(true);
				actionJson = this._msgTransformer.transform2Index(action.undo);
				action.undo.setTransform(false);
			} else 
				actionJson =  this._msgTransformer.transform2Index(action.redo);
		}
		return actionJson;
	},
	
	/*
	 * for all the delete action, after _msgTransformer.transform2Id, the id in the refTokenId are wrong,
	 * cause, the row/column had been deleted, 
	 * correct them here
	 */
	resetId: function(redoEvent, redoJson)
	{
		if(!redoEvent) return;
		if(redoJson.updates[0].action ==  websheet.Constant.Event.ACTION_DELETE &&
		   (redoJson.updates[0].reference.refType == websheet.Constant.Event.SCOPE_ROW || redoJson.updates[0].reference.refType == websheet.Constant.Event.SCOPE_COLUMN))
		{
			var event = redoEvent.msgList[0];
			if(event)
			{
				event.refTokenId._startRowId = "undefined";
				event.refTokenId._endRowId = "undefined";
				event.refTokenId._startColId = "undefined";
				event.refTokenId._endColId = "undefined";
			}
		}
	},
	
	// modify the redo action for split, to make the split is the minimal set
	modifyRedo: function(undo, redo)
	{
		if(!undo || !redo) return redo;
		
		if(redo.updates && redo.updates[0] && redo.updates[0].action == websheet.Constant.Event.ACTION_SPLIT)
		{
			var newRedo = {};
			var updates = websheet.Helper.cloneJSON(undo.updates);
			for(var index = 0; index < updates.length; index++)
			{
				updates[index].action = websheet.Constant.Event.ACTION_SPLIT;
				var tmpRef = updates[index].reference.refValue.split(":")[0];
				var strColRow = tmpRef.substring(tmpRef.lastIndexOf("!")+1);
				var refValue = tmpRef + ":" + strColRow;
				updates[index].reference.refValue = refValue;
			}
			newRedo.updates = updates;
			return newRedo;
		}
		return redo;
	},
	
	/**
 	 * @param bAsync	 set to true to not sync make undo/redo action, caller will make it in timer
	 */
	addAction: function(undo, redo, bAsync)
	{
		var action = {};
		// generate actionId
		var actionId = websheet.Constant.IDPrefix.ACTION + this._maxActionIndex++;
		action.id = actionId;
		// call transform here only if is sync
		if (!bAsync) {
			this._transformAction(undo, redo, action);
		}
		return action;
	},
	
	_transformAction: function(undo, redo, action)
	{
		try
		{
			var newRedo = this.modifyRedo(undo,redo);
			action.undo = this._msgTransformer.transform2Id(undo);
			if(undo.atomic)
				action.undo.atomic = undo.atomic;
			action.redo = this._msgTransformer.transform2Id(newRedo);
			if(newRedo.atomic)
				action.redo.atomic = newRedo.atomic;
			this.resetId(action.redo, newRedo);
			// action ready, add to stack
			// drop invalid actions
			this.removeActions(this._index + 1);
			//add new action			
			if ( this._stack.length == this._MaxUndoSize )
			{
				this.removeActionByIndex(0);
			}
			this._index = this._stack.push(action) - 1;
			this._map[action.id] = action;
			var toolbar = this.editor.getToolbar();
			if (toolbar) toolbar.refreshUndoRedoIcon();
		}
		catch(e)
		{
			console.log("transform error, exception, ", e);
		}		
	},
	
	/*
	 * only remove the action at the index
	 */
	removeActionByIndex: function(index)
	{
		if(index < 0 || index >= this._stack.length) return;
		var action = this._stack[index];
		if(action.undo instanceof websheet.event.undo.Message)
		{
			action.undo.clear();
		}
		if(action.redo instanceof websheet.event.undo.Message)
		{
			action.redo.clear();
		}
		this._stack.splice(index,1);
		delete this._map[action.id];
		if(index <= this._index)
		{
			this._index--;
		}	
		if(this._index < -1) this._index = -1;
		this.onChange();
	},
	
	/*
	 * first find the corresponding index for the given id, then remove the action by index 
	 */
	removeActionById: function(id)
	{
		if(!id) return;
		var index = -1;
		for(var i = 0; i < i < this._stack.length; i++)
		{
			var action = this._stack[i];
			if(action.id == id)
			{
				index = i; 
				break;
			}
		}
		if(index != -1)
			this.removeActionByIndex(index);
	},
	
	/*
	 * modify the message in the undo stack according to the given info
	 * @param {id} : the message id
	 * @param {modifyInfo} : 
	 * @param {bUpdateRedo,bUpdateUndo}: boolean, true means update, false means not
	 */
	modifyActionById: function(id, modifyInfo,bUpdateRedo,bUpdateUndo)
	{
		if(!id ||!modifyInfo) return;
		var message = this._map[id];
		if(!message) return;
		if(bUpdateRedo)
		{
			var event = message.redo.msgList[0];
			if(event instanceof websheet.event.undo.DeleteRowEvent)
			{
				var redo = new websheet.event.DeleteRow(modifyInfo.refValue).getMessage();
				message.redo = this._msgTransformer.transform2Id(redo);
			}
		}
		if(bUpdateUndo)
		{
			//TODO:
		}
	},
	/*
	 * remove all the actions from index to the end
	 */
	removeActions : function(index)
	{
		for(var i = index ; i < this._stack.length; i++)
		{
			var action = this._stack[i];
			if(action.undo instanceof websheet.event.undo.Message)
			{
				action.undo.clear();
			}
			if(action.redo instanceof websheet.event.undo.Message)
			{
				action.redo.clear();
			}
			delete this._map[action.id];
		}
		this._stack.splice( index , this._stack.length - index );
		this._index = this._stack.length - 1;
	},
	
	/*
	 * return is a Object : { "event":{}, id:{}}
	 */
	getAction: function(isUndo)
	{
		var ret = {};
		if ( isUndo )
		{
			if (this.hasUndo())
			{
				var action = this._stack[this._index];
				this._index = this._index - 1;
				var undo = null;
				//always need transform
				try{
					undo = this._msgTransformer.transform2Index(action.undo);
					if(action.undo.atomic)
						undo.atomic = action.undo.atomic;
				}catch(e){
					console.log("transform error ! there maybe some not support event");
				}
				ret.event = undo;
				ret.id = action.id;
			}
		}
		else
		{
			if (this.hasRedo())
			{
				this._index = this._index + 1;
				var action = this._stack[this._index];
				var redo = null;
				try{
					redo = this._msgTransformer.transform2Index(action.redo);
					if(action.redo.atomic)
						redo.atomic = action.redo.atomic;
				}catch(e){
					console.log("transform error ! there maybe some not support event");
				}
				ret.event = redo;
				ret.id = action.id;
			}
		}
		return ret;
	},
	
	undo: function() 
	{
		try{
			if ( this.undoable() )
			{
				var ret = this.getAction(true);
				var undo = ret.event;
				if(undo)
				{
					this.updateRedo(true, undo);
					this.performAction(undo,websheet.Constant.MSGMode.UNDO,ret.id);
					var tm = this.editor.getTaskMan();
					if(tm.isRunning(tm.Priority.UndoRedo))
					{
						tm.addTask(this, "updateRedo", [false, undo], tm.Priority.UndoRedo);
					}
					else
					{
						this.updateRedo(false,undo);
					}
				}else{
					console.log("nothing to undo !");
				}
			}
		}catch(e)
		{
			console.log("error happend in undo : " + e);
		}

	},
	//in coediting mode, need re generate undo redo msg again, for delete action, clear, set style action,...
	redo: function() 
	{
		try{
			if ( this.redoable() )
			{
				var ret = this.getAction(false);
				var redo = ret.event;
				if(redo)
				{
					this.updateUndo(true,redo);
//					this.correctRedo(redo);
					this.performAction(redo, websheet.Constant.MSGMode.REDO,ret.id);
					var tm = this.editor.getTaskMan();
					if(tm.isRunning(tm.Priority.UndoRedo))
					{
						tm.addTask(this, "updateUndo", [false, redo], tm.Priority.UndoRedo);
					}
					else
					{
						this.updateUndo(false,redo);
					}
				}else{
					console.log("nothing to redo !");
				}
			}
		}catch(e)
		{
			console.log("error happended in redo : " + e);
		}
	},
	
	/**
	 * for the delete column 
	 * @param redo
	 */
	correctRedo: function(msg)
	{
		var redoEvent = msg.updates[0];
		var ws = websheet.Constant.Event;
		if(redoEvent && redoEvent.action == ws.ACTION_DELETE && redoEvent.reference.refType == ws.SCOPE_COLUMN)
		{
			var refValue = redoEvent.reference.refValue;

			var filterMsg = null;
			var rMsg = this.editor.getAutoFilterHdl().getReverseMsg();
			if(rMsg) {
				var updates = rMsg.getMessage().updates;
				var len = updates.length;
				for(var i = 0; i < len; i++)
				{
					var event = updates[i];
					if(event && event.action == ws.ACTION_INSERT && event.reference.refType == ws.SCOPE_UNNAMERANGE 
							&& event.data.usage == websheet.Constant.RangeUsage.FILTER)
					{
						filterMsg = null;
						break;
					}	
					if(event && event.action == ws.ACTION_FILTER)
					{
						if(!filterMsg)
							filterMsg = [];
						filterMsg.push(event);
					}
				}
				if(filterMsg)
				{
					var msgJson = this.editor.getFilterMsg4DeleteCol(filterMsg, refValue);
					if(msgJson)
						msg.updates.push(msgJson);
				}	
			}
		}	
	},
	
	prePerformAction: function(msg, type, actionId, result)
	{
		// if msg very huge, the websheet.Helper.cloneJSON would spend long time
		// for the insert action, the msg would not change, do not clone it
		var sentMsg = null;
		var wconst = websheet.Constant;
		
		if(msg.updates[0] && (msg.updates[0].action == wconst.Event.ACTION_INSERT || msg.updates[0].action == wconst.Event.ACTION_FILTER) )
			sentMsg = msg; // workaround here for 1)delete undo performance 2) filter rule and model consistency
		else
			sentMsg = websheet.Helper.cloneJSON(msg); // TODO: shouldn't clone message 
		result.sentMsg = sentMsg;
		
		var controller = this.editor.getController();
		if (msg.updates.length > wconst.THRESHOLD_MERGE_MESSAGE_UPDATES) {
			this.editor.scene.showWarningMessage(this.editor.scene.nls.browserWorkingMsg);
			controller._bBatchNotify = true;
		}
	},
	
	postPerformAction: function(sendMsgResult, type, actionId)
	{
		this.editor.resumeGridUpdate();
		var msg = sendMsgResult.sentMsg;
		this.correctRedo(msg);
		
		var controller = this.editor.getController();
		
		if (controller._bBatchNotify) {
			controller._bBatchNotify = false;
		}
		
		var connector = this.editor.getConnector();
		if(!connector) return;
		var attrs = {};
		if(msg.atomic)
			attrs.atomic = true;
			
		if(type == websheet.Constant.MSGMode.UNDO) 
		    connector.publish(msg,actionId,type, attrs);
        else 
            connector.publish(msg,actionId, null, attrs);
	},
	
	performActionUpdates: function(msg, userId, type, index)
	{
		var connector = this.editor.getConnector();
		if(!connector) return;
		
		var constant = websheet.Constant;
		var tm = this.editor.getTaskMan();
		var priority = tm.Priority.UserOperation;
		if(!index)
			index = 0;
		var len = msg.updates.length;
		for(var i = index; i < len; i++)
		{
			var update = msg.updates[i];
			try{connector.applyEvent(update, userId, type);}
			catch(e){console.log(e);}
			if(tm.hasNext(priority) && i < len - 1)
			{
				this.editor.suspendGridUpdate();
				if (update.action == constant.Event.ACTION_INSERT || update.action == constant.Event.ACTION_DELETE)
				{
					this.editor.resumeGridUpdate();
				}	
				var next = i+1;
				// to make performActionUpdates tasks happens before postPerformAction;
				tm.addTask(this, "performActionUpdates", [msg, userId, type, next], priority);
				break;
			}
		}
	},
	

	performAction : function(msg, type, actionId)
	{
		
		var connector = this.editor.getConnector();
		if(!connector) return;
		
		var userId = pe.authenticatedUser.getId();
		
		var tm = this.editor.getTaskMan();
		var priority = tm.Priority.UserOperation; // 10
		
		var sendMsgResult = {};
		
		if(tm.isRunning(priority))
		{
			tm.addTask(this, "prePerformAction", [msg, type, actionId, sendMsgResult], priority);
			tm.addTask(this, "performActionUpdates", [msg, userId, type], priority);
			tm.addTask(this, "postPerformAction", [sendMsgResult, type, actionId], tm.Priority.UndoRedo);
		}
		else
		{
			this.prePerformAction(msg, type, actionId, sendMsgResult);
			this.performActionUpdates(msg, userId, type);
			
			if(tm.isRunning(tm.Priority.UndoRedo))
			{
				tm.addTask(this, "postPerformAction", [sendMsgResult, type, actionId], tm.Priority.UndoRedo);
				tm.start();
			}
			else
			{
				this.postPerformAction(sendMsgResult, type, actionId);
			}
		}
	},
		
	onChange: function()
	{
		var toolbar = this.editor.getToolbar();
		if (toolbar) toolbar.refreshUndoRedoIcon();
	},
	
	updateRedo: function(isPre,msg,id)
	{
		try{
			var action = this._stack[this._index+1];
			if(id) action = this._map[id];
			var actionType = msg.updates[0].action;
			var refType = msg.updates[0].reference.refType;
			var refValue = msg.updates[0].reference.refValue;
			
			if(!isPre)
			{
				if(actionType == websheet.Constant.Event.ACTION_INSERT) 
				{
					var redo = null;
					if(refType == websheet.Constant.Event.SCOPE_ROW)
					{
						redo = new websheet.event.DeleteRow(refValue).getMessage();
					}else if(refType == websheet.Constant.Event.SCOPE_COLUMN)
					{
						redo = new websheet.event.DeleteColumn(refValue).getMessage();
					}
					else if(refType == websheet.Constant.Event.SCOPE_SHEET)
					{
						var doc = this.editor.getDocumentObj();
						var sheetIndex = doc.getSheet(refValue).getIndex();
						var sheetCnt = doc.getVisibleSheetsCount();
						var newRefValue = refValue + "|" + sheetIndex + "|" + sheetCnt;
						// keep the original uuid for the delete sheet
						var uuid = msg.updates[0].data.sheet.uuid;
						redo = new websheet.event.DeleteSheet(newRefValue,{uuid:uuid}).getMessage();
					}
					if(redo) action.redo = this._msgTransformer.transform2Id(redo);
				} else if(actionType == websheet.Constant.Event.ACTION_DELETE) {
					var redo = null;
					
					var parsedRef = websheet.Helper.parseRef(refValue);
					if(refType == websheet.Constant.Event.SCOPE_ROW) {
						redo = this.editor.postGetReverse4DeleteAction(parsedRef.sheetName, action.info,websheet.Constant.Row);
					}else if(refType == websheet.Constant.Event.SCOPE_COLUMN ){
						redo = this.editor.postGetReverse4DeleteAction(parsedRef.sheetName, action.info,websheet.Constant.Column);
					}
					if(redo){
						delete action.info;
						if(!action.redo.msgList[0].data)
							action.redo.msgList[0].data = {};
						action.redo.msgList[0].data.undoCharts = redo.updates[0].data.undoCharts;
						action.redo.msgList[0].data.undoFreeze = redo.updates[0].data.undoFreeze;
						action.redo.msgList[0].data.undoRanges = redo.updates[0].data.undoRanges;
						action.redo.msgList[0].data.uuid = redo.updates[0].data.uuid;
					}
				}
			}
			else
			{
				if(actionType == websheet.Constant.Event.ACTION_DELETE)
				{
					var parsedRef = websheet.Helper.parseRef(refValue);
					var sheetName = (parsedRef)? parsedRef.sheetName : refValue.split("|")[0];
					var sheet = this.editor.getDocumentObj().getSheet(sheetName);
					if(refType == websheet.Constant.Event.SCOPE_ROW)
					{
						var idMap = websheet.Utils.getRowsId(sheet,parsedRef.startRow,parsedRef.endRow);
						if(!action.redo.msgList[0]._rowsIdCache)
							action.redo.msgList[0]._rowsIdCache = idMap;
						
						var info = this.editor.preGetReverse4DeleteRows(sheet, parsedRef.startRow,parsedRef.endRow, true);
						action.info = info;
						
					}
					else if(refType == websheet.Constant.Event.SCOPE_COLUMN)
					{
						var scIndex = parsedRef.startCol;
						var ecIndex = parsedRef.endCol;
						ecIndex = ecIndex ? ecIndex : scIndex;
						ecIndex = (ecIndex < scIndex)? scIndex : ecIndex;
						var idMap = websheet.Utils.getColsId(sheet,scIndex,ecIndex);
						if(!action.redo.msgList[0]._colsIdCache)
							action.redo.msgList[0]._colsIdCache = idMap;
						
						var info = this.editor.preGetReverse4DeleteColumns(sheet, scIndex, ecIndex, true);
						action.info = info;
					}
					else if(refType == websheet.Constant.Event.SCOPE_SHEET)
					{
						var sheetMeta = websheet.Utils.getSheetMeta(sheet.getId()); 
						action.redo.msgList[0].meta = sheetMeta;
					}
				}
				//TODO: collect updates for cut.
//				if(actionType == websheet.Constant.Event.ACTION_SET && action.redo.msgList[0].data && action.redo.msgList[0].data.bCut){//Collect updates for cut.
//					var sourceRef = msg.updates[0].reference;
//					var targetRef = msg.updates[1].reference;
//					
//				}
			}

		}catch(e)
		{
			console.log("error happened when updated redo : " + e);
		}
	},
	
	/*
	 * for all the insert/delete action, after redo, should update the undo msg
	 * @isPre: true means before the redo action perform, false means after the redo action perform
	 * @id: actionId
	 */
	updateUndo: function(isPre, msg,id)
	{
		try{
			
			var action = this._stack[this._index];
			if(id) action = this._map[id];
			var actionType = msg.updates[0].action;
			var refType = msg.updates[0].reference.refType;
			var refValue = msg.updates[0].reference.refValue;
			var undo = null;
			if(isPre)
			{
				if(refType == websheet.Constant.Event.SCOPE_ROW)
				{
					var parsedRef = websheet.Helper.parseRef(refValue);
					var sheet = this.editor.getDocumentObj().getSheet(parsedRef.sheetName);
					if(actionType == websheet.Constant.Event.ACTION_DELETE)
					{
						var info = this.editor.preGetReverse4DeleteRows(sheet, parsedRef.startRow,parsedRef.endRow );
						action.info = info;
					}
					else if(actionType == websheet.Constant.Event.ACTION_CLEAR)
					{
						if(action.redo.msgList.length == 1){
							var rowData = websheet.Utils.getRowsValue(sheet,parsedRef.startRow,parsedRef.endRow);
							var event = new websheet.event.ClearRow(refValue);
							var reverse = new websheet.event.Reverse (event, refValue, null, rowData);
						}
//						else if(action.redo.msgList.length > 1){ //for CUT rows
//							var maxColIndex = websheet.Constant.MaxColumnIndex;
//							var rowData = websheet.model.ModelHelper.toRangeJSON(parsedRef.sheetName, parsedRef.startRow, 1, parsedRef.endRow, maxColIndex, {forRow: true});
//							var refValueSrc = websheet.Helper.getAddressByIndex(parsedRef.sheetName, parsedRef.startRow,  1, null, parsedRef.endRow, maxColIndex);
//							var reverse = new websheet.event.SetUnnameRange(refValueSrc, {rows: rowData, bR: true, bRow: true});
//							
//       						var jsonEvent = action.redo.msgList[1].jsonEvent;
//       						var tarRefValue = jsonEvent && jsonEvent.reference.refValue;
//       						var tarParseRef = websheet.Helper.parseRef(tarRefValue);
//       						var tarRowData = websheet.model.ModelHelper.toRangeJSON(tarParseRef.sheetName, tarParseRef.startRow, 1, tarParseRef.endRow, maxColIndex, {forRow: true});
//       						var eventReverse = new websheet.event.SetUnnameRange(tarRefValue,{rows: tarRowData, bR: true, bRow: true});
//       						reverse.getMessage().updates.push(eventReverse.getMessage().updates[0]);
//       					}
       				 
       					undo = reverse.getMessage();
       					action.undo = this._msgTransformer.transform2Id(undo);
					}
				}
				else if(refType == websheet.Constant.Event.SCOPE_COLUMN)
				{
					var parsedRef = websheet.Helper.parseRef(refValue);
					var startColumn = parsedRef.startCol;
					var endColumn = parsedRef.endCol;
					var sheet = this.editor.getDocumentObj().getSheet(parsedRef.sheetName);
					if(actionType == websheet.Constant.Event.ACTION_DELETE)
					{
						var info = this.editor.preGetReverse4DeleteColumns(sheet, startColumn, endColumn );
						action.info = info;
					}
				}
				else if(refType ==websheet.Constant.Event.SCOPE_SHEET )
				{
					var parsedRef = websheet.Helper.parseRef(refValue);
					var sheetName;
					if(parsedRef)
					  sheetName = parsedRef.sheetName;
					else 
					  sheetName = websheet.Helper.handleRefValue(refValue, refType);					
					var sheet = this.editor.getDocumentObj().getSheet(sheetName);
					if(actionType == websheet.Constant.Event.ACTION_DELETE)
					{
						var uuid = msg.updates[0].data.sheet.uuid;
						var info = this.editor.preGetReverse4DeleteSheet(sheet,uuid);
						action.info = info;
					}
				}else if(refType == websheet.Constant.Event.SCOPE_UNNAMERANGE)
				{
					var parsedRef = websheet.Helper.parseRef(refValue);
					var startRow = parsedRef.startRow;
					var endRow =  parsedRef.endRow;
					var startColumn = parsedRef.startCol;
					var endColumn = parsedRef.endCol;
					if(actionType == websheet.Constant.Event.ACTION_CLEAR)
					{
						var rangeData = websheet.model.ModelHelper.toRangeJSON(parsedRef.sheetName, startRow, startColumn, endRow, endColumn, {
							includeStyle: false,
							includeColumnStyle: false,
							includeValue: true
						});
			    		var event = new websheet.event.ClearUnnameRange(refValue);
			           	var reverse = new websheet.event.Reverse (event, refValue, {rows:rangeData});
       					undo = reverse.getMessage();
       					action.undo = this._msgTransformer.transform2Id(undo);
					}
					else if(actionType == websheet.Constant.Event.ACTION_MERGE)
					{
						var event = new websheet.event.MergeCells(refValue);
						var rangeJson = websheet.model.ModelHelper.toRangeJSON(parsedRef.sheetName,  startRow, startColumn, endRow, endColumn);
		        		var dvsJson = websheet.model.ModelHelper.getJSONByUsage(parsedRef.sheetName,  startRow, startColumn, endRow, endColumn, websheet.Constant.RangeUsage.DATA_VALIDATION);
		        		this.editor._toDVJSON4Msg(dvsJson, websheet.Constant.RangeUsage.DATA_VALIDATION, "DV");
		            	var attrs = { rows: rangeJson, dvs: dvsJson, bR: true};
		            	
						var reverse = new websheet.event.Reverse(event,refValue,attrs,{});
						undo = reverse.getMessage();
						action.undo = this._msgTransformer.transform2Id(undo);
					}
				}
			}
			else
			{
				if(actionType == websheet.Constant.Event.ACTION_INSERT) 
				{
					if(refType == websheet.Constant.Event.SCOPE_ROW)
					{
						undo = new websheet.event.DeleteRow(refValue).getMessage();
					}else if(refType == websheet.Constant.Event.SCOPE_COLUMN)
					{
						undo = new websheet.event.DeleteColumn(refValue).getMessage();
					}
					else if(refType == websheet.Constant.Event.SCOPE_SHEET)
					{
						var doc = this.editor.getDocumentObj();
						var sheetIndex = doc.getSheet(refValue).getIndex();
						var sheetCnt = doc.getVisibleSheetsCount();
						var newRefValue = refValue + "|" + sheetIndex + "|" + sheetCnt;
						undo = new websheet.event.DeleteSheet(newRefValue).getMessage();
					}
					if(undo) action.undo = this._msgTransformer.transform2Id(undo);
				}
				else if(actionType == websheet.Constant.Event.ACTION_DELETE)
				{
					// after delete, transform the message
					//The impact unnamedrange information can only be collected
					// after perform delete action.
					var parsedRef = websheet.Helper.parseRef(refValue);
					if(refType == websheet.Constant.Event.SCOPE_ROW) {
						undo = this.editor.postGetReverse4DeleteAction(parsedRef.sheetName, action.info, websheet.Constant.Row);
					}else if(refType == websheet.Constant.Event.SCOPE_COLUMN ){
						undo = this.editor.postGetReverse4DeleteAction(parsedRef.sheetName, action.info, websheet.Constant.Column);
					} else if (refType ==websheet.Constant.Event.SCOPE_SHEET )
					{
						var sheetName;
						if(parsedRef)
						  sheetName = parsedRef.sheetName;
						else 
						  sheetName = websheet.Helper.handleRefValue(refValue, refType);	
						undo = this.editor.postGetReverse4DeleteAction(sheetName, action.info, websheet.Constant.Sheet);
					}
					if(undo){
						delete action.info;
						action.undo = undo;
						if(undo && !(undo instanceof websheet.event.undo.Message))
							action.undo = this._msgTransformer.transform2Id(undo);
					}
				}
				
			}

		}catch(e)
		{
			console.log("error happened when updated undo : " + e);
		}

	},
	
	transform: function(events)
	{
		try{
			for(var i = 0; i < events.length; i++)
			{
				var e = events[i];
				if(e.action == websheet.Constant.Event.ACTION_DELETE || e.action == websheet.Constant.Event.ACTION_MERGE) 
				{
					for(var j = this._stack.length-1 ; j >= 0; j--)
					{
						var action = this._stack[j];
						if(action.undo.checkRelated(e) && action.redo.checkRelated(e))
						{
							this.removeActionByIndex(j);
						} else if (action.undo.checkDataRelated(e)) {
							this.removeActionByIndex(j);
						}
					}
				}
				
				var refType = e.reference.refType;
				
				// rename sheet || (insert/delete -> row,column,sheet)
				var needCheckCompactSetRange = (e.action == websheet.Constant.Event.ACTION_SET && refType == websheet.Constant.Event.SCOPE_SHEET) ||
					((e.action == websheet.Constant.Event.ACTION_INSERT || e.action == websheet.Constant.Event.ACTION_DELETE) && 
							(refType == websheet.Constant.Event.SCOPE_ROW || refType == websheet.Constant.Event.SCOPE_COLUMN || refType == websheet.Constant.Event.SCOPE_SHEET));
				
				if(needCheckCompactSetRange) 
				{
					for(var j = this._stack.length-1 ; j >= 0; j--)
					{
						this._clearCompactSetRange(this._stack[j]);
					}
				}
				if(e.action == websheet.Constant.Event.ACTION_SORT)
				{
					this._updateSetCell(e);
				}
				else if(e.action == websheet.Constant.Event.ACTION_SET && e.reference.refType == websheet.Constant.Event.SCOPE_CHART)
				{
					this._clearUndoChartDelta(e);
				}
			}
		}catch(err)
		{
			console.log("the undo event has not support" );
		}

		this.onChange();
	},
	
	_clearCompactSetRange: function(action)
	{
		var undo = action.undo;
		var redo = action.redo;
		for(var i = 0; i < undo.msgList.length; i++)
		{
			var msg = undo.msgList[i];
			if(msg.data && msg.action == websheet.Constant.Event.ACTION_SET && 
					msg.type == websheet.Constant.Event.SCOPE_UNNAMERANGE)
			{					
				delete msg.data.compactData;
			}
		}
		for(var i = 0; i < redo.msgList.length; i++)
		{
			var msg = redo.msgList[i];
			if(msg.data && msg.action == websheet.Constant.Event.ACTION_SET && 
					msg.type == websheet.Constant.Event.SCOPE_UNNAMERANGE)
			{					
				delete msg.data.compactData;
			}
		}
	},

	//If a chart is set, then undo delta in undo delete row/column is removed.
	_clearUndoChartDelta: function(event)
	{
		if(!event.data || !event.data.settings)
			return;		
		var chartId = event.data.chartId;
		var settings = event.data.settings;
		var seriesSet = settings.series;
		for(var j = this._stack.length-1 ; j >= 0; j--)
		{
			var undo = this._stack[j].undo;
			
			for(var i = 0; i < undo.msgList.length; i++)
			{
				var msg = undo.msgList[i];
				if(msg.action == websheet.Constant.Event.ACTION_INSERT && 
						(msg.type == websheet.Constant.Event.SCOPE_COLUMN || 
						msg.type == websheet.Constant.Event.SCOPE_ROW))
				{					
					if(msg.data){
						var undoCharts = msg.data.undoCharts;
						if(undoCharts){
							var undoChart = undoCharts[chartId];
							if(undoChart){
								for(var seqKey in undoChart){
									var role = seqKey;
									var id;
									var idx = seqKey.indexOf(" ");
									if(idx > 0){
										role = seqKey.substring(0, idx);
										id = seqKey.substring(idx+1);
									}
									if(role == "cat"){
										var axisSet = settings.axis;
										if(axisSet){
											var axis = axisSet[id];
											if(axis && axis.cat)
												delete undoChart[seqKey];
										}
									}else if(seriesSet){
										var series = seriesSet[id];
										if(series){
											var serData = series.data;
											if(serData && serData[role] !== undefined)
												delete undoChart[seqKey];											
										}
									}
								}
							}
						}
					} 
				}
			}
		}
	},
	
	/**
	 * @param event
	 * Now sorting event from network will change the set cell event that introduced by undo delete row, column or sort.
	 * For example:
	 *        A      B
	 * 1      1
	 * 2      2
	 * 3      3      =A2
	 * 
	 * User A delete the 2nd row, then
	 * 
	 *        A      B
	 * 1      1
	 * 2      3      =A#REF
	 * 
	 * and the undo message in the undo stack will be:
	 *     updates:
	 *         0:  insert row 2
	 *         1:  set cell B2 to "=A2"
	 *     
	 * User B sort A1:B2, then
	 *        A      B
	 * 1      3      =A#REF
	 * 2      1      
	 * 
	 * Undo message will be transformed to:
	 *      updates:
	 *         0:  insert row 2
	 *         1:  set cell B1 to "=A2"
	 */
	_updateSetCell: function(event)
	{
		var eventRefval = event.reference.refValue;
		var parsedRef = websheet.Helper.parseRef(eventRefval);
		var sr = parsedRef.startRow;
		var er = parsedRef.endRow;
		var sc = parsedRef.startCol;
		var ec = parsedRef.endCol;
		var doc = this.editor.getDocumentObj();
		var idManager = doc._getIDManager();
		
		var sortRes = event.data.sortresults;
		for(var j = this._stack.length-1 ; j >= 0; j--)
		{
			var undo = this._stack[j].undo;
			
			for(var i = 1; i < undo.msgList.length; i++)
			{
				var msg = undo.msgList[i];
				if(msg.action == websheet.Constant.Event.ACTION_SET && 
						msg.type == websheet.Constant.Event.SCOPE_CELL)
				{
					msg.refTokenId.updateToken(idManager);
					var token = msg.refTokenId.token;
					if(token._sheetName!=parsedRef.sheetName)
						continue;
					
					var cellRow = token._startRowIndex;
					var cellCol = token._startColIndex;
					
					if(cellRow>=sr && cellRow<=er && cellCol>=sc && cellCol<=ec)
					{
						var newRow = -1;
						for(var n=0;n<sortRes.length;n++)
						{
							if(cellRow==sortRes[n]+sr)
							{
								newRow = n+sr;
								break;
							}
						}
						
						var newRowId = idManager.getRowIdByIndex(msg.refTokenId._sheetId,newRow-1,true);
						msg.refTokenId._startRowId = newRowId;
						msg.refTokenId._endRowId = newRowId;
					}
				}
			}
		}
	},
	
	turnOff: function()
	{
		this._enabled = false;
	},
	
	turnOn: function()
	{
		this._enabled = true;
	}
});


