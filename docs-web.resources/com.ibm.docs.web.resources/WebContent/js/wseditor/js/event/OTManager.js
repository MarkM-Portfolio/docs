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
/* event transform in  co-editing mode												*/
/* Undo & Redo for Operation transform is implemented here										*/
/************************************************************************************/
dojo.provide("websheet.event.OTManager");

dojo.declare("websheet.event.OTManager",[websheet.event.OTManagerBase], {
	editor:null,

	constructor: function(docAgent){
		this.editor = websheet.model.ModelHelper.getEditor();
	},
	
	_do:function(msg,flag, incomingMsg){
		var actionType;
		var reverseType;
		if(flag == websheet.Constant.MSGMode.UNDO)
		{
			reverseType = "redo";
			actionType = "undo";
		}
		else
		{
			reverseType = "undo";
			actionType = "redo";
		}	
		var message;
		var action = msg.type ? reverseType : actionType;
		//if msg.type is not null, this means msg is a undo message.
		var criteria = msg.type ? websheet.Constant.MSGMode.UNDO : websheet.Constant.MSGMode.REDO;
		
		// criteria is the UNDO/REDO type of client's action that needs to OT
		// flag is the UNDO/REDO phase in the UNDO-APPLY-REDO OT perform,
		// the relation between criteria, flag and the perform that going to happen is,
		// flag | criteria		UNDO			REDO
		// UNDO					REDO-UNDO(*)	UNDO-REDO
		// REDO					UNDO			REDO(**)
		// in the case of (*) and (**), need to call UndoManager.updateUndo(), which will re-generate the undo event that
		// may going to execute in the future, esp. in case (*), will execute right after the APPLY phase.
		// since we don't transform setCell events for UNDO DELETE events, there are cases that the updateUndo() can't generate
		// correct setCell events for the re-generated undo event. so will cause inconsistency in OT.
		// below code delicates updateUndo() to this.updateUndoWithCheck(), which will throw a string exception when the updateUndo()
		// is likely to generate a inconsistency UNDO event, to force this client to reload to align with server, to solve the OT inconsistency.
		
		try{
			message = this.editor.getUndoManager().getActionById(msg.id, action);
			if(!message){
				var tm = this.editor.getTaskMan();
				tm.sync(tm.Priority.PublishMessage);
				throw this._INCONSIS_ERR;
			}
			if(flag == criteria) {
				if (flag == websheet.Constant.MSGMode.UNDO) {
					if(incomingMsg) 
						this.checkUndoRedo(message,incomingMsg);
					this.updateUndoWithCheck(message, msg.id);
				} else {
					this.editor.getUndoManager().updateUndo(true,message,msg.id);	
				}
			}
			else
				this.editor.getUndoManager().updateRedo(true,message,msg.id);
				
			this._applyEvent(message, flag);
			
			if(flag == criteria) {
				this.editor.getUndoManager().updateUndo(false,message,msg.id);
			}
			else 
				this.editor.getUndoManager().updateRedo(false,message,msg.id);
		}
		catch(e)
		{
			console.error("error happended: " + e);
			if (typeof e == "string" && e == this._INCONSIS_ERR) {
				// throw e to let session catch it
				throw e;
			}
		}
	},
	
	_undo: function(array, incomingMsg) {
		var tm = this.editor.getTaskMan();
		if (tm.protect(this, "_undo", arguments, tm.Priority.UserOperation)) {
			return;
		}
		
		for(var i = array.length - 1; i >= 0; i--){
			this._do(array[i],websheet.Constant.MSGMode.UNDO, incomingMsg);
		}
	},
	
	_applyMsg: function(msg) {
		var tm = this.editor.getTaskMan();
		if (tm.protect(this, "_applyMsg", arguments, tm.Priority.UserOperation)) {
			return;
		}

		for(var i=0;i<msg.updates.length;i++)
			this.editor.getConnector().applyEvent(msg.updates[i], null, websheet.Constant.MSGMode.NORMAL);
	},
	
	_redo: function(array) {
		var tm = this.editor.getTaskMan();
		if (tm.protect(this, "_redo", arguments, tm.Priority.UserOperation)) {
			return;
		}
		
		// need modify the first msg
		if(this.modifyInfo)
		{
			var msgId = array[0].id;
			var undoManager = this.editor.getUndoManager();
			undoManager.modifyActionById(msgId,this.modifyInfo,true);
		}
		//redo the msg in the sendoutlist
		for(var j = 0;j<array.length;j++){
			this._do(array[j],websheet.Constant.MSGMode.REDO);
		}		
	},
	
	checkUndoRedo:function(message,incomingMsg){
		var actionType = message.updates[0].action;	
		var incomingAction = incomingMsg.updates[0].action;
		
		var wseconst = websheet.Constant.Event;
		if(wseconst.ACTION_INSERT == actionType && wseconst.ACTION_INSERT== incomingAction){
			var refType = message.updates[0].reference.refType;
			var incomingRefType = incomingMsg.updates[0].reference.refType;
			
			if((wseconst.SCOPE_ROW == refType  && wseconst.SCOPE_ROW == incomingRefType)|| (wseconst.SCOPE_COLUMN == refType && wseconst.SCOPE_COLUMN == incomingRefType)){
				var refValue = message.updates[0].reference.refValue;
				var incomingRefValue = incomingMsg.updates[0].reference.refValue;
				
				var rangeInfo = websheet.Helper.getRangeInfoByRef(refValue);
				var incomingRangeInfo = websheet.Helper.getRangeInfoByRef(incomingRefValue);
				
				incomingStartIndex = refType == wseconst.SCOPE_ROW ? incomingRangeInfo.startRow : incomingRangeInfo.startCol;
				startIndex = refType == wseconst.SCOPE_ROW ? rangeInfo.startRow : rangeInfo.startCol;
				endIndex = 	refType == wseconst.SCOPE_ROW ? rangeInfo.endRow : rangeInfo.endCol;
					
				if(rangeInfo.sheetName == incomingRangeInfo.sheetName &&  incomingStartIndex >= startIndex && incomingStartIndex <= endIndex){
					var tm = this.editor.getTaskMan();
					tm.sync(tm.Priority.PublishMessage);
					throw this._INCONSIS_ERR;
				}
			}
		}
	},
	
	updateUndoWithCheck: function(message, id) {
		// summary: called before updateUndo() in _do() is called, used to check for consistency before calling updateUndo() during undo-redo OT resolving,
		//	If check passed, nothing happens, otherwise, throws a string exception to force session to reload.

		var bNeedReload = false;
		
		var um = this.editor.getUndoManager();
		var action = um._stack[this._index];
		if (id) {
			action = um._map[id];
		}
		
		// the updateUndo() will base on a event described by following 3 criteria, i.e. 
		// will create undo event for this event
		var actionType = message.updates[0].action;
		var refType = message.updates[0].reference.refType;
		var refValue = message.updates[0].reference.refValue;
		var wseconst = websheet.Constant.Event;
		
		var oldUndo = action.undo;
		
		// perform updateundo
		um.updateUndo(true, message, id);
		var newUndo = action.undo;
		
		switch (actionType) {
		case wseconst.ACTION_DELETE:
			// only cares about DELETE action,
			switch (refType) {
			case wseconst.SCOPE_ROW:
			case wseconst.SCOPE_COLUMN:
			case wseconst.SCOPE_SHEET:
				// DELETE action on row, column and sheet
				var oldMsgList = oldUndo.msgList;
				var oldMainMsg = oldMsgList[0];
				var oldMainEvent = oldMainMsg.jsonEvent;
				var oldMainRefValue = oldMainEvent.reference.refValue;
				if (oldMainRefValue != refValue) {
					// the original event refValue not the same as the new base action's refValue,
					// during the coming updateUndo(), double check if attached setcell events changed
					var oldUpdatesJson = oldUndo.toJson();
					var oldUpdates = oldUpdatesJson == null ? [] : oldUpdatesJson.updates;
					var newUpdatesJson = newUndo.toJson();
					var newUpdates = newUpdatesJson == null ? [] : newUpdatesJson.updates;
					
					if (oldUpdates && newUpdates &&  oldUpdates.length == newUpdates.length) {
						// TODO further detect if all set-cells equal
						;
					} else {
						bNeedReload = true;
					}
				}
				break;
			default:
				break;
			}
			break;
		default:
			break;
		}

		if (bNeedReload) {
			// force save before reload
			var tm = this.editor.getTaskMan();
			tm.sync(tm.Priority.PublishMessage);
			throw this._INCONSIS_ERR;
		}
	},
	
	/**
	 * index:the index of local sendoutlist
	 * latter:null(only undo the msg in local sendoutlist) 
	 *        the message came from server side
	 */
	perform:function(index,incomingMsg)
	{
		try
		{
			var msgList = this.editor.getConnector().getSendOutList();
			var array = new Array();
			
			for(var i = index;i < msgList.length;i++)
			{
				if(msgList[i].id)
					array.push(msgList[i]);
			}
			
			if(incomingMsg || array.length > 1)
			{
				this.editor.suspendGridUpdate();
			}	
			this._undo(array, incomingMsg);
			
			if(incomingMsg!=null)
			{
				this._applyMsg(incomingMsg);
				this._redo(array);
			}
			else
			{
				var eIndex = index + array.length -1;
				this.conflictResolve(index,eIndex,true);
				this.removeActionInUndoStack(index,eIndex);
				// there doesn't have interface available to undo any comments and task action
				// that occurs after this undo message, as a workaround, reload the whole document
				// to keep consistent document content with other clients
				for(var i = index ; i < msgList.length; i++)
				{
					var msg = msgList[i];
					if(msg.updates && msg.updates[0] && msg.updates[0].data && msg.updates[0].data.usage
					   &&(msg.updates[0].data.usage == websheet.Constant.RangeUsage.TASK) )
					{
						window.location.reload();
					}
				}
			}

		}
		catch(e){
			console.error(e);
			if (typeof e == "string" && e == this._INCONSIS_ERR) {
				// throw e to let session catch it
				throw e;
			}
		}
		finally
		{
			var tm = this.editor.getTaskMan();
			var priority = tm.Priority.UndoRedo;
			tm.addTask(this.editor , "resumeGridUpdate", [], priority);
			tm.start();
		}
	},
	
	/*
	 * when conflict occurs, need to rollback all local messages
	 */
	removeActionInUndoStack: function(sIndex,eIndex)
	{
		var msgList = this.editor.getConnector().sendOutList;
		var undoManager = this.editor.getUndoManager();
		for(var index = eIndex; index >= sIndex; index--)
		{
			var msgId = null;
			try{
				msgId = msgList[index] ? msgList[index].id : null;
				if(msgId)
					undoManager.removeActionById(msgId);
			}catch(e)
			{
				console.log(e);
			}
		}

	},
	
	/**
	 * Just apply the undo/redo event to model,don't update UI
	 */
	_applyEvent: function (event, type, index) {
		var userId; 
		if(!index)
			index = 0;
		
		var tm = this.editor.getTaskMan();
		var priority = tm.Priority.UserOperation;
		var connector = this.editor.getConnector();
		var len = event.updates.length;
		
		for (var i = index; i < len; i++)
		{
			var update = event.updates[i];
			connector.applyEvent(update, userId, type);
			if(tm.hasNext(priority) && i < len - 1)
			{
				var next = i+1;
				tm.addTask(this, "_applyEvent", [event, type, next], priority);
				break;
			}
		}
	}
});
