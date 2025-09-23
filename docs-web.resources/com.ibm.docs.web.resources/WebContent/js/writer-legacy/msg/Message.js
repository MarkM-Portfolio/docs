dojo.provide("writer.msg.Message");
dojo.require("writer.msg.OTService");

dojo.declare("writer.msg.Message",null,{
	recordingMsgs : [],
	recordLevel: 0,
	recordCmdId: "",
	/**
	 * after you call beginRecord, the message will not be sent until you call endRecord.
	 * So, More than 1 messages can be combined into one single operation, for undo/redo.
	 * If you call two times of beginRecord, you should call two times of endRecord.
	 * When exception happens, you may not call "endRecord". To avoid such case, 
	 * I use a 1s timer to clean all "beginRecord". 
	 */
	beginRecord: function(){
		if (this.recordLevel == 0){
			this.sendMessage = function(msgs, cmdId){
				if (msgs && msgs.length>0){
					this.recordingMsgs = this.recordingMsgs.concat(msgs);
					this.recordCmdId = cmdId;
				}
				for (var i=0; i<msgs.length; i++)
				{
					var msg = msgs[i].msg;
					var rMsg = msgs[i].rMsg;
					if(msg.updates.length <= 0)
						continue;
					if( cmdId && !msg.cmdId )
						msg.cmdId = cmdId;
					if( msg.cmdId )
						rMsg.cmdId = "undo_"+ msg.cmdId;
				}
			};
			var that = this;
			//to avoid exception, here we use a timer to stop record
			setTimeout(function(){
//				that.endRecord(true);
			},1000);
		}
		this.recordLevel++;
	},
	/**
	 * 
	 * @param byForce, true to stop record by force, internal use only
	 * Be very careful to use this param. Most of time, you should use null.
	 */
	endRecord: function(byForce){
		if (this.recordLevel <= 0){
			return;
		}
		if (byForce){
			this.recordLevel = 0;
		}else if (this.recordLevel>0){
			this.recordLevel--;
		}
		
		if (this.recordLevel == 0){
//			console.log("endRecord");
			delete this.sendMessage;
			//use prototype's sendMessage
			if (this.recordingMsgs.length>0){
				this.sendMessage(this.recordingMsgs, this.recordCmdId);
			}
			this.recordingMsgs = [];
		}
	},
	
	/**
	 * 
	 * @param logData The logData is a string which will be recorded in server.
	 */
	sendLogMessage:function(logData)
	{
		var sess = pe.scene.session;  
    	
    	var msg = sess.createMessage();
    	msg.client_log = logData || "empty log";
    	msg.type = "client_log";
    	msg.data = '';
    	
    	sess.sendMessage(msg);
    	return msg;
	},
	sendNotesMessage:function(msg){
		this._notesMsg = this._notesMsg||[];
		this._notesMsg.push(msg);
	},
	/**
	 * Send the message to server.
	 */
	sendMessage : function(msgPairList, cmdId )
	{
//		console.log("send message "+msgPairList.length);
		if(msgPairList.length == 0)
			return;
		// Update first
		pe.lotusEditor.updateManager.update();
		if(this._notesMsg&&this._notesMsg.length>0){
			msgPairList = msgPairList.concat(this._notesMsg);
			this._notesMsg=[];
		}
		
		var selection = pe.lotusEditor.getSelection();
		if (selection && pe.scene.coedit)
		{
			var isEnter = cmdId && cmdId.indexOf("enter") >= 0;
			// force get msg on enter key
			var msg = selection._getSelectionMsg(isEnter);
			if (msg)
			{
				msg.orphan = false;
				msgPairList = msgPairList.concat({msg:msg, rMsg:{updates:[]}});
			}
		}
		
		var listMsgList=[];
		var listRedoMsgList=[];
		var msgList = [];
		var rMsgList = [];
		var scene = pe.scene;
		
		// Use the flag to check if content size has been changed.
		scene.editorContentChanged = true;
		
		for (var i=0; i<msgPairList.length; i++)
		{
			var msg = msgPairList[i].msg;
			var rMsg = msgPairList[i].rMsg;
			if(msg.updates.length <= 0)
				continue;
			if( cmdId && !msg.cmdId )
				msg.cmdId = cmdId;
			if( msg.cmdId && rMsg )
				rMsg.cmdId = "undo_"+msg.cmdId;
			
			msgList.push(msg);
			rMsgList.push(rMsg || {});
		}

		if(msgList.length > 0)
			this._compressMsg(msgList, rMsgList);
		
	},
	
	// The new message design will set message server/client sequence in message sending.
	// We should update these information to undo/redo stack. 
	updateMsgState : function(sendOutList, stackMsgs)
	{		
		// Both arguments are array
		if( (sendOutList instanceof Array) && (stackMsgs instanceof Array))
		{			
			for(var i = 0; i < sendOutList.length; i++ )
			{
				stackMsgs[i].server_seq = sendOutList[i].server_seq;
				stackMsgs[i].client_seq = sendOutList[i].client_seq;
				stackMsgs[i].client_id = sendOutList[i].client_id;
			}
		}
		else if( !(sendOutList instanceof Array) && !(stackMsgs instanceof Array))
		{
			// Both arguments are normal object
			stackMsgs.server_seq = sendOutList.server_seq;
			stackMsgs.client_seq = sendOutList.client_seq;
			stackMsgs.client_id = sendOutList.client_id;
		}		
		else
			console.error("Illeagal arguments in Message.updateMsgState(), sendOutList: '" + sendOutList.toString() + " ' StackMsgs: '" + stackMsgs.toString() + " '");
	},
	// Combine new message to old message
	// AB -> ABC -> ABCD
	// The newMsg message is insert D, the oldMsg message is Insert C.
	_combineMsg : function(newMsg, oldMsg, isUndo)
	{
		// Both message type is text message
		if(newMsg.type != oldMsg.type || newMsg.type != WRITER.MSGTYPE.Text || newMsg.mc != oldMsg.mc || newMsg.subtype == "bm" || pe.lotusEditor.isPasting )
			return false;
		
		
		var newActs = newMsg.updates, oldActs = oldMsg.updates;
		
		// Both message have only one action, same target id, same action type
		if(newActs.length != 1 || oldActs.length != 1 || newActs[0].tid != oldActs[0].tid || newActs[0].t != oldActs[0].t)
			return false;
		
		if( newActs[0].t == WRITER.ACTTYPE.InsertText )
		{
			// Insert text action is a pure text
			var newCnt = newActs[0].cnt, oldCnt = oldActs[0].cnt;
			if(!isUndo && (newCnt.c == null || oldCnt.c == null) && ((newCnt.fmt && oldCnt.fmt) || (!newCnt.fmt && !oldCnt.fmt) ))
				return false;
			
			if(newCnt.c && newCnt.c.length > 2)	// Paste text, for double byte text.
				return false;
				
			// Merge continuous content which type is 't' 
			var mergeInsertTextCnts = function(srcCnt, destCnt)
			{
				srcCnt.c += destCnt.c;
				if(srcCnt.fmt)
					srcCnt.fmt = srcCnt.fmt.concat(destCnt.fmt);
				return srcCnt;
			};
			
			if(newActs[0].idx == (oldActs[0].idx + oldActs[0].len))
			{
				// Insert text: A -> AB -> ABC
				oldActs[0].len += newActs[0].len;
				oldActs[0].cnt = mergeInsertTextCnts(oldCnt, newCnt); //oldActs[0].cnt.concat(newActs[0].cnt);
				return true;
			}
			else if(isUndo && (newActs[0].idx + newActs[0].len) == oldActs[0].idx)
			{
				// Delete before, ABCD -> ABC -> AB -> A
				oldActs[0].idx = newActs[0].idx;
				oldActs[0].len += newActs[0].len;
				oldActs[0].cnt = mergeInsertTextCnts(newCnt, oldCnt); //newActs[0].cnt.concat(oldActs[0].cnt);
				return true;
			}
			else if(isUndo && newActs[0].idx == oldActs[0].idx)
			{
				// For undo message: Delete after, ABCD -> ACD -> AD -> A
				oldActs[0].len += newActs[0].len;
				oldActs[0].cnt = mergeInsertTextCnts(oldCnt, newCnt); //oldActs[0].cnt.concat(newActs[0].cnt);
				return true;
			}
		}
		else if( newActs[0].t == WRITER.ACTTYPE.DeleteText )
		{
			if(newActs[0].len > 2)	// Paste text, for double byte text.
				return false;
			
			if(newActs[0].idx == oldActs[0].idx)
			{
				// Delete after, ABCD -> ACD -> AD -> A
				oldActs[0].len += newActs[0].len;
				return true;
			}
			else if((newActs[0].idx + newActs[0].len) == oldActs[0].idx)
			{
				// Delete before, ABCD -> ABC -> AB -> A
				oldActs[0].idx = newActs[0].idx;
				oldActs[0].len += newActs[0].len;
				return true;
			}
			else if(isUndo && newActs[0].idx == (oldActs[0].idx + oldActs[0].len))
			{
				// For undo message: Insert text A -> AB -> ABC
				oldActs[0].len += newActs[0].len;
				return true;
			}
		}
		
		return false;
	},
	
	// Compress continuous insert/delete text message
	_compressMsg : function( msgList, rMsgList )
	{
		var sess = pe.scene.session;
		var undoManager = pe.lotusEditor.undoManager;
		var undoStack = undoManager.getStack();
		var isSingleMode = sess.isSingleMode();
		var isIMEing = undoManager.isIMEing();
		var isIMEInput = undoManager.isIMEInput();
		var isIgnoreUndo = undoManager.isIgnoreUndoMsg();
		// Compress message text message, has no redo
		if(!isIgnoreUndo && !isIMEInput && !isIMEing && sess.waitingList.length > 0 && msgList.length == 1 && !undoManager.hasRedo() && undoStack.length > 0)
		{
			// Get the latest redo message from stack
			var msgs = undoStack[undoStack.length - 1];
			if(msgs.redo.length == 1 && msgs.compress)
			{
				var combined = this._combineMsg(msgList[0], msgs.redo[0]);
				if(combined)
				{
					this._combineMsg(rMsgList[0], msgs.undo[0], true);
					
					// Remove the latest message from waiting list
					sess.waitingList.pop();
					
					// Send the combined message
					//var cloneRedo = dojo.clone(msgs.redo);
					//var cloneRedo = dojo.fromJson(dojo.toJson(msgs.redo));
					var cloneRedo = isSingleMode ? msgs.redo : dojo.fromJson(dojo.toJson(msgs.redo));
					sess.sendMessage(cloneRedo);
					if( !isSingleMode )
						this.updateMsgState(cloneRedo, msgs.redo);
					return;
				}
			}
		}
		
		//var cloneList = dojo.clone(msgList);
		//var cloneList = dojo.fromJson(dojo.toJson(msgList));
		var cloneList = isSingleMode ? msgList : dojo.fromJson(dojo.toJson(msgList));
		sess.sendMessage(cloneList);
		if( !isSingleMode )
		{
			this.updateMsgState(cloneList, msgList);
			this.updateMsgState(cloneList, rMsgList);
		}
		pe.lotusEditor.undoManager.addUndo(msgList,rMsgList);
	},
	sendResetContentMsg : function(msgList)
	{
		
	},
	
	createContentResetMsg: function()
	{
		return {};
	},
	
	createTableMsg:function(tableId, actPairList, messageCategory)
	{
		for (var i=0; i<actPairList.length; i++)
		{
			var actPair = actPairList[i];
			if (actPair != null)
			{
				if (actPair.act != null)
					actPair.act.tbId = tableId;
				if (actPair.rAct != null)
					actPair.rAct.tbId = tableId;
			}
		}
		
		return this.createMsg(WRITER.MSGTYPE.Table, actPairList, messageCategory);
	},
	
	createMsg : function(type, actPairList, messageCategory, subtype )
	{
		//header-footer editing may cause other messages. 
		if(!messageCategory && pe.lotusEditor.isHeaderFooterEditing())
		{
			//TODO: comments, footnotes, endnotes
			messageCategory = WRITER.MSGCATEGORY.Relation;
		}
		if(!messageCategory && pe.lotusEditor.isFootnoteEditing()){
			messageCategory = WRITER.MSGCATEGORY.Footnotes;
		}
		if(!messageCategory && pe.lotusEditor.isEndnoteEditing()){
			messageCategory = WRITER.MSGCATEGORY.Endnotes;
		}
		return this.createMsg2( type, type, actPairList, messageCategory, subtype);
	},
	
	createMsg2 : function(type, rtype, actPairList, messageCategory , subtype )
	{
		var sess = pe.scene.session;  
    	var msg = sess.createMessage();
    	var rMsg = sess.createMessage();
		msg.type = type, rMsg.type = rtype;
		msg.mc = rMsg.mc = messageCategory || WRITER.MSGCATEGORY.Content;
		msg.updates = [], rMsg.updates = [];
		subtype && ( msg.subtype = subtype );
		for (var i=0; i<actPairList.length; i++)
		{
			var actPair = actPairList[i];
			if (actPair != null)
			{
				if (actPair.act != null)
			 		msg.updates.push(actPair.act);
				if (actPair.rAct != null)
			 	{
			 		if(actPair.rAct.actions)
			 		{
			 			// Reversed
			 			for(var j=actPair.rAct.actions.length - 1; j >= 0 ; j--)
			 				rMsg.updates.unshift(actPair.rAct.actions[j]);
			 		}
			 		else
			 			rMsg.updates.unshift(actPair.rAct);
			 	}
			}
		}
		
		return {"msg": msg, "rMsg": rMsg};
	},
	
	assert:function(condition, msg)
	{
		if(!condition)
			console.error("===== Assert failed: " + msg);
	},
	
	/*
	 * createDeleteBlockAct
	 */
	
	_getIdObjOf: function( m )
	{
		if(!m){
			return;
		}
		if(m.declaredClass == 'writer.model.HeaderFooter')
			return m.rId;
		else if(m.modelType == writer.MODELTYPE.FOOTNOTE){
			return "footnotes:"+pe.lotusEditor.relations.notesManager.getFnIndex(m);
		}else if(m.modelType == writer.MODELTYPE.ENDNOTE){
			return "endnotes:"+pe.lotusEditor.relations.notesManager.getEnIndex(m);
		}
		else if( m.id )
			return m.id;
		else
		{
			var parent = m.parent;
			if( parent ){
				var id = {};
				id.pid = this._getIdObjOf( parent );
				id.index = parent.container.indexOf( m );
				return id;
			}
		}
		return null;
		
	},
	createInsertSectionAct:function(sect,idx){
		var act  = this._createInsertSectionAct(sect);
		var rAct = this._createDeleteSectionAct(sect);
		act.idx = idx;
		return {"act": act, "rAct": rAct};
 	},
	createDeleteSectionAct:function(sect,idx){
		var act  = this._createDeleteSectionAct(sect);
		var rAct = this._createInsertSectionAct(sect);	
		rAct.idx = idx;
		return {"act": act, "rAct": rAct};
	},
	createAddEvenOddAct: function(){
		var act		= this._createAddEvenOddAct();
		var rAct	= this._createRemoveEvenOddAct();
		return {"act": act, "rAct": rAct};
	},
	createRemoveEvenOddAct: function(){
		var act		= this._createRemoveEvenOddAct();
		var rAct	= this._createAddEvenOddAct();
		return {"act": act, "rAct": rAct};
	},
	createInsertElementAct : function( m ,idx)
	{
		var act = this._createInsertElementAct(m,idx);
		var rAct = this._createDeleteElementAct( m );
		rAct.idx = act.idx;
		rAct.tid = act.tid;
		return {"act": act, "rAct": rAct};
	},
	createInsertRowAct:function(row){
		var act = this._createInsertRowAct(row);
		var rAct = this._createDeleteRowAct( row );
		rAct.idx = act.idx;
		rAct.tid = act.tid;
		return {"act": act, "rAct": rAct};
	},
	createDeleteRowAct:function(row,fixCell){
		var act =  this._createDeleteRowAct(row ,fixCell);
		var rAct = this._createInsertRowAct(row ,fixCell);
		act.idx = rAct.idx;
		act.tid = rAct.tid;
		return {"act": act, "rAct": rAct};
	},
	createInsertColumn:function(table,index,cells){
		var act = this._createInsertColumnAct(cells);
		var rAct = this._createDeleteColumnAct( cells );
		act.idx = index;
		act.tid = this._getIdObjOf( table );
		rAct.idx = act.idx;
		rAct.tid = act.tid;
		return {"act": act, "rAct": rAct};
	},
	createDeleteColumn:function(table,index,cells,fixCells){
		var act = this._createDeleteColumnAct(cells,fixCells);
		var rAct = this._createInsertColumnAct( cells,fixCells );
		act.idx = index;
		act.tid = this._getIdObjOf( table );
		rAct.idx = act.idx;
		rAct.tid = act.tid;
		return {"act": act, "rAct": rAct};
	},
	createMergeCellsAct:function(table,startColIdx,startRowIdx,oldRowSpan,oldColSpan,newRowSpan,newColSpan,cells){
		var act = this._createMergeCellsAct(startColIdx,startRowIdx,newRowSpan,newColSpan);
		var rAct = this._createSplitCellsAct(startColIdx,startRowIdx,oldRowSpan,oldColSpan,cells);
		act.tid = this._getIdObjOf( table );
		rAct.tid = act.tid;
		return {"act": act, "rAct": rAct};
	},
	createSplitCellsAct:function(table,startColIdx,startRowIdx,oldRowSpan,oldColSpan,newRowSpan,newColSpan,cells){
		var act = this._createSplitCellsAct(startColIdx,startRowIdx,newRowSpan,newColSpan,cells);
		var rAct = this._createMergeCellsAct(startColIdx,startRowIdx,oldRowSpan,oldColSpan);
		act.tid = this._getIdObjOf( table );
		rAct.idx = act.idx;
		rAct.tid = act.tid;
		return {"act": act, "rAct": rAct};
	},
	createDeleteElementAct : function( m , idx)
	{
		var act = this._createDeleteElementAct( m );
		var rAct = this._createInsertElementAct(m,idx);
		act.idx = rAct.idx;
		act.tid = rAct.tid;
		return {"act": act, "rAct": rAct};
	},
	_createMergeCellsAct:function(startColIdx,startRowIdx,newRowSpan,newColSpan){
		var act = {};
		act.t = WRITER.ACTTYPE.MergeCells;
		act.sc=startColIdx;
		act.sr=startRowIdx;
		act.nr=newRowSpan;
		act.nc=newColSpan;
		return act;
	},
	_createSplitCellsAct:function(startColIdx,startRowIdx,newRowSpan,newColSpan,cells){
		var act = {};
		act.t = WRITER.ACTTYPE.SplitCells;
		act.sc=startColIdx;
		act.sr=startRowIdx;
		act.nr=newRowSpan;
		act.nc=newColSpan;
		act.cnt = cells;
		return act;
	},
	_createInsertColumnAct:function(cells,fixCells){
		var act={};
		act.t = WRITER.ACTTYPE.InsertColumn;
		act.cnt=cells;
		if(fixCells){
			act.fc = fixCells;
		}
		return act;
	},
	_createDeleteColumnAct:function(cells,fixCells){
		var act={};
		act.t = WRITER.ACTTYPE.DeleteColumn;
		act.cnt=cells;
		if(fixCells){
			act.fc = fixCells;
		}
		return act;
	},
	_createInsertRowAct:function(row,fixCell){
		var act ={};
		act.tid = this._getIdObjOf( row.parent );
		act.cnt = row.toJson();
		act.t = WRITER.ACTTYPE.InsertRow;
		act.idx = row.parent.container.indexOf( row );
		if(fixCell){
			act.fc = fixCell;
		}
		return act;
	},
	_createDeleteRowAct:function(row,fixCell){
		var act = {};
		act.t = WRITER.ACTTYPE.DeleteRow;
		if(fixCell){
			act.fc = fixCell;
		}
		return act;
	},
	_createInsertSectionAct:function(sect){
		var act = {};
		act.tid = sect.id;
		act.cnt = sect.toJson();
		act.t = WRITER.ACTTYPE.InsertSection;
		return act;
	},
	_createDeleteSectionAct:function(sect){
		var act = {};
		act.tid = sect.id;
		act.t = WRITER.ACTTYPE.DeleteSection;
		return act;
	},
	_createAddEvenOddAct: function() {
		var act = {};
		act.cnt = { "t" : "evenAndOddHeaders" };
		act.t = WRITER.ACTTYPE.AddEvenOdd;
		return act;
	},
	_createRemoveEvenOddAct: function() {
		var act = {};
		act.t = WRITER.ACTTYPE.RemoveEvenOdd;
		return act;
	},
	/*
	 * createDeleteElementActById
	 */
	_createDeleteElementAct: function( m )
	{
		var act = {};
//		act.tid =  this._getIdObjOf(m.getParent());
		act.t = WRITER.ACTTYPE.DeleteElement;
		return act;
	},

	_createInsertElementAct: function( m ,idx)
	{
		var act = {};
		act.tid = this._getIdObjOf( m.parent );
		
		if(m.modelType == writer.MODELTYPE.FOOTNOTE){
			act.idx = pe.lotusEditor.relations.notesManager.getFnIndex(m);
			act.tid = "footnotes";
		}else if(m.modelType == writer.MODELTYPE.ENDNOTE){
			act.idx = pe.lotusEditor.relations.notesManager.getEnIndex(m);
			act.tid = "endnotes";
		}else{
			if(idx>=0){
				act.idx = idx;
			}else{
				act.idx = m.parent.container.indexOf( m );
			}
			
		}
		if(m.modelType == writer.MODELTYPE.PARAGRAPH)
			act.cnt = m.toJson(0,null,true);
		else
			act.cnt = m.toJson();
		act.t = WRITER.ACTTYPE.InsertElement;
		return act;
	},
	/*
	 * createInsertTextAct
	 */
	createInsertTextAct: function(index, length, target)
	{
		var act = this._createInsertTextAct(index, length, target);
		var rAct = this._createDeleteTextAct( index,length, target );	
		if( length ==0 ){
			var cnt = act.cnt;
			if( cnt && cnt.fmt && cnt.fmt[0] && cnt.fmt[0].id ){
				rAct.oid = cnt.fmt[0].id;
			}
		}
		return {"act": act, "rAct": rAct};
	},
	createAddListAct: function(numId,absId,Json,imgsJson){
		var act = {}, rAct = {};
		act.nid = rAct.nid = numId;
		act.aid = rAct.aid = absId;
		if( imgsJson || imgsJson != {})
			act.imgs = imgsJson;
		else
			act.imgs = "";
		act.cnt = Json;
		act.t = rAct.t = WRITER.ACTTYPE.AddList;
		// rAct is empty object and can't be undo/redo
		rAct.cnt = null;
		
		return {"act": act, "rAct": rAct};
	},
	createSetListAttributeAct: function(numId,newJson,oldJson,type){
		var act = {}, rAct = {};
		act.nid = rAct.nid = numId;
		act.t = rAct.t = type;
		
		act.cnt = newJson;
		rAct.cnt = oldJson;
		
		if(newJson.lvl != undefined)
			act.lvl = newJson.lvl;
		
		if(oldJson.lvl != undefined)
			rAct.lvl = oldJson.lvl;
		
		return {"act": act, "rAct": rAct};
	},
	/*
	 * _createDeleteTextAct
	 */
	_createDeleteTextAct: function( index, length, target)
	{
		var act= {};	
		var id;
		if ( typeof target == 'string' )
			id = target;
		else
			id = target.id;
		
		this.assert(id, "ID is empty at createDeleteTextAct");
		
		act.tid = id;
		act.t = WRITER.ACTTYPE.DeleteText;		
		act.idx = index;							
		act.len = length;	
		return act;
	},
	createDeleteTextAct : function(index, length, target)
	{		
		var act= this._createDeleteTextAct( index,length, target );			
		var rAct = this._createInsertTextAct(index, length, target);
				
		return {"act": act, "rAct": rAct};
	},
	/**
	 * create delete inline obj act
	 * @param obj
	 * @returns {___anonymous19846_19871}
	 */
	createDeleteInlineObjAct: function( obj ){
		var target = obj.paragraph;
		var rAct= this._createInsertInlineObjAct( obj, target );
		var act= this._createDeleteInlineObjAct( obj, target );	
		act.idx = rAct.idx;
		act.len = rAct.len;
		return {"act": act, "rAct": rAct};
	},
	
	/*
	 * _createDeleteInlineObjAct
	 */
	_createDeleteInlineObjAct: function( obj, target)
	{
		var act= {};	
		var id;
		if ( typeof target == 'string' )
			id = target;
		else
			id = target.id;
		
		this.assert(id, "ID is empty at _createDeleteInlineObjAct");
		
		act.tid = id;
		act.t = WRITER.ACTTYPE.DeleteText;		
		act.oid = obj.id;
		
		return act;
	},
	
	_createInsertInlineObjAct: function( obj, target )
	{
		var index = obj.start;
		if( obj.length == 0 ){
		//"bmk
			var prev = target.previousChild( obj );
			while( prev && prev.length == 0 )
				prev = target.previousChild( prev );
			index = prev ? ( prev.start + prev.length ) : 0;
			
			var act = {};
			act.tid = target.id;
			act.idx = index;
			act.len = 0;
			act.t = WRITER.ACTTYPE.InsertText;
			act.cnt = { "fmt":[obj.toJson()],"c": "" };
			return act;
		}
		else
			return this._createInsertTextAct(index, 0, target);;
	},
	
	
	createSetAttributeAct:function(target,styles,oStyles,atts,oAtts ){
		var act=this._createSetAttributeAct(target, styles, atts );
		var rAct=  this._createSetAttributeAct(target, oStyles, oAtts );
		return {"act":act,"rAct":rAct};
	},
	_createSetAttributeAct:function(target,styles,atts){
		var act={};
		if (!target)
			id = target;
		else if ( typeof target == 'string' )
			id = target;
		else
			id = target.id;
		act.tid = id;
		act.t = WRITER.ACTTYPE.SetAttribute;
		styles && ( act.st = styles );
		atts && ( act.at = atts );
		return act;
	},
	createSetTextAttribute:function(index,length,target,styles,oStyles){
		var act = this._createSetTextAttribute(index, length, target,styles);
		var ract = this._createSetTextAttribute(index, length, target,oStyles);//just test
		
		return {"act":act,"rAct":ract};
	},
	_createSetTextAttribute:function(index,length,target,styles){
		var act = {};
		if (!target)
			id = target;
		else if ( typeof target == 'string' )
			id = target;
		else
			id = target.id;
		act.tid = id;
		act.t = WRITER.ACTTYPE.SetTextAttribute;
		act.idx = index;
		act.len = length;
		act.st = styles;
		return act;
	},
	createTaskAct : function (type,taskId)
	{
		var act = {};
		var rAct = {};
		act.t = type;
		rAct.t = type;
		if ( taskId != null ) {
			act.tsk = taskId;
			rAct.tsk = taskId;
		}
		return { "act" : act, "rAct" : rAct }; 
	},
	createSetParaTaskAct:function(type,bAdd,pid,tid) {
		var act = {};
		var ract = {};
		if(bAdd) {
			act = this._createParaTaskAct(pid,tid,type);
			ract = this._createParaTaskAct(pid,"",type);
		}else 
		{
			ract = this._createParaTaskAct(pid,tid,type);
			act = this._createParaTaskAct(pid,"",type);			
		}
		return {"act":act,"rAct":ract};
	},
	_createParaTaskAct:function(pid,tid,type) {
		var act = {};
		act.tid = pid;
		act.taskId = tid;
		act.t = type;
		return act;
	},
	addCommentAct:function(pid,cid,start,end,cpid,rcid,runid) {
		var act = this._createAddCommentAct(pid,cid,start,end,cpid,rcid,runid);
		var ract = null;
		if (!cpid) ract = this._createDelCommentAct(pid,cid);
		return {"act":act,"rAct":ract};
	},
	_createAddCommentAct:function(pid,cid,start,end,cpid,rcid,runid) {
		var act = {};
		act.tid = pid;
		act.cid = cid;
		act.t = WRITER.ACTTYPE.AddComment;
		act.idx = start;
		act.len = end-start;
		if (cpid) act.cpid = cpid;
		if (rcid) act.rcid = rcid;
		if (runid) act.rid = runid;
		return act;
	},
	delCommentAct:function(pid,cid,s,e) {
		var act = this._createDelCommentAct(pid,cid);
		var ract = this._createAddCommentAct(pid,cid,s,e);
		return {"act":act,"rAct":ract};
	},
	_createDelCommentAct:function(pid,cid) {
		var act = {};
		act.tid = pid;
		act.cid = cid;
		act.t = WRITER.ACTTYPE.DelComment;
		return act;
	},
	createUpdateCommentAct:function(cid, index, item) {
		var  act = {tid:cid, k:item.name, v:item.val, idx: index, t:WRITER.ACTTYPE.UpdateComment},
		    ract = {tid:cid, k:item.name, v:item.oldval, idx:index, t:WRITER.ACTTYPE.UpdateComment};
		return {"act":act,"rAct":ract};
	},
	_createInsertTextAct : function(index, length, target)
	{
		var act= {};		
		var id;
		if ( typeof target == 'string' )
		{
			id = target;
			target = WRITER.MSG_HELPER.byId(id);
		}
		else
			id = target.id;
		
		act.tid = id;
		act.idx = index;
		act.len = length;
		act.t = WRITER.ACTTYPE.InsertText;
		act.cnt = target.toJson(index, length);
		
		return act;
	},
	
	/**
	 * Create insert key action
	 * @param key The key will be created.
	 * @param value The value of the key
	 * @returns {___anonymous15988_16013}
	 */
	createInsertKeyAct: function(key, value, path)
	{
		var act = this._createInsertKeyAct(key, value);
		var ract = this._createDeleteKeyAct(key);
		act.path = ract.path = path || "";
		return {"act": act, "rAct": ract};
	},
	
	/**
	 * Create a delete key action
	 * @param key The key will be deleted.
	 * @param value The value of current key before removed.
	 * @returns {___anonymous16343_16368}
	 */
	createDeleteKeyAct: function(key, value , path)
	{
		var act = this._createDeleteKeyAct(key);
		var ract = this._createInsertKeyAct(key, value);
		act.path = ract.path = path || "";
		return {"act": act, "rAct": ract};
	},
	
	/**
	 * Create a replace key action
	 * @param keyId The key content will be replaced.
	 * @param oldValue The old value of the key.
	 * @param newValue The new value of the key.
	 * @param path The key path.
	 * @Sample create a replace section action
	 * WRITER.MSG.createReplaceKeyAct("sectId", oldSectJson, newSectJson, WRITER.KEYPATH.Section);
	 */
	createReplaceKeyAct: function(keyId, oldValue, newValue, path)
	{
		var act= {}, ract = {};		
		act.t = ract.t = WRITER.ACTTYPE.ReplaceKey;
		act.k = ract.k = keyId;
		act.path = ract.path = path || "";
		
		act.c = newValue;
		ract.c = oldValue;
		
		return {"act": act, "rAct": ract};
	},
	/**
	 * Add a style in style.json
	 */
	createAddStyleAct: function(styleId, styleJson)
	{
		var act= {}, ract = {};		
		act.t = ract.t = WRITER.ACTTYPE.AddStyle;
		act.styleId = ract.styleId = styleId;
		
		act.c = styleJson;
		ract.c = null;	// No Undo action
		
		return {"act": act, "rAct": ract};
	},
	
	_createInsertKeyAct: function(key, value)
	{
		var act= {};		
		act.t = WRITER.ACTTYPE.InsertKey;
		act.k = key;
		act.c = value;
		return act;
	},
	
	_createDeleteKeyAct: function(key)
	{
		var act= {};		
		act.t = WRITER.ACTTYPE.DeleteKey;
		act.k = key;
		return act;
	},

	createInsertArrayAct: function(key, value, path)
	{
		var act = this._createInsertArrayAct(key, value);
		var ract = this._createDeleteArrayAct(key);
		act.path = ract.path = path || "";
		return {"act": act, "rAct": ract};
	},
	
	createDeleteArrayAct: function(key, value , path)
	{
		var act = this._createDeleteArrayAct(key);
		var ract = this._createInsertArrayAct(key, value);
		act.path = ract.path = path || "";
		return {"act": act, "rAct": ract};
	},
	
	_createInsertArrayAct: function(key, value)
	{
		var act= {};		
		act.t = WRITER.ACTTYPE.InsertArray;
		act.k = key;
		act.c = value;
		return act;
	},
	
	_createDeleteArrayAct: function(key)
	{
		var act= {};		
		act.t = WRITER.ACTTYPE.DeleteArray;
		act.k = key;
		return act;
	},
	
	addDeleteMsg: function( p, index, endIndex, msgs ){
		var msg;
		if( p.text == null|| p.text == "" ){
			return;
		}
		if( index == null )
			index = 0;
		if( endIndex == null )
			endIndex = p.text.length;
		var len = endIndex - index;
		if( len <= 0 )
			return;
		
		var actPair = WRITER.MSG.createDeleteTextAct(index, len, p);
		msg= WRITER.MSG.createMsg(WRITER.MSGTYPE.Text, [actPair]);
		msg && msgs.push(msg);
	},
	
	createPageCountMsg: function(pageCount)
	{
		var sess = pe.scene.session;  
    	var msg = sess.createMessage();
    	
    	msg.mc = WRITER.MSGCATEGORY.Meta;
		msg.type = WRITER.MSGTYPE.Meta;
		
		var act = {};
		act.t = WRITER.ACTTYPE.PageCount;
		act.pc = pageCount;
		msg.updates = [act];
		
		return msg;
	},
		
	createSelectionMsg: function(rangeArr)
	{
		var sess = pe.scene.session;  
    	var msg = sess.createMessage();
    	
    	var mc = WRITER.MSGCATEGORY.Content;
    	if(pe.lotusEditor.isHeaderFooterEditing())
		{
			//TODO: comments, footnotes, endnotes
			mc = WRITER.MSGCATEGORY.Relation;
		}
    	else if(pe.lotusEditor.isFootnoteEditing()){
			mc = WRITER.MSGCATEGORY.Footnotes;
		}
    	else if( pe.lotusEditor.isEndnoteEditing()){
			mc = WRITER.MSGCATEGORY.Endnotes;
		}
		
    	msg.mc = mc;
		msg.type = WRITER.MSGTYPE.Selection;
		msg.isCtrl = true;
		
		// an orphan event, just selection not with any other event.
		msg.orphan = true;
		
		var act = {};
		act.t = WRITER.ACTTYPE.SelectionChanged;
		act.ranges = rangeArr;
		msg.updates = [act];
		
		return msg;
	}

});

(function(){	
	if(typeof WRITER == "undefined")
		WRITER = {};
	if(typeof WRITER.MSG == 'undefined')
		WRITER.MSG = new writer.msg.Message();	
	
	WRITER.MSGCATEGORY = {
//		"Category"	: "mc",
		"Content"	: "c",			// Content change message category
		"Style"		: "s",			// Style change message category
		"List"		: "l",			// List change message category
		"Setting"	: "st",			// Setting change message category
		"Relation"	: "r",			// Relation change message category
		"Footnotes" : "fn",
		"Endnotes"  : "en",
		"Meta"		: "mt"			// Control message, ignore in client. It's used for update total page number in server.
	};
	WRITER.MSGTYPE = {
			"Text"		: "t",		// Message category: Content, Relation(in Header, footer). Text change message
			"Element"	: "e",		// Message category: Content, Relation(in Header, footer).
			"Attribute"	: "a",		// Message category: Content, Relation(in Header, footer). Change Paragraph/Table property. Such as change paragraph alignment, heading 
			"TextAttribute"	: "ta",	// Message category: Content, Relation(in Header, footer). Such as bold
			"Table"		: "tb",		// Message category: Content, Relation(in Header, footer).
			"TextComment" : "tm",	// Message category: Content.
			"Section"	: "sec",	// Message category: Setting.
			"Setting"	: "stt",	// Message category: Setting.
			"Task"		: "task",
			"KeyMessage": "k",		// Message category: Setting, Relation. 	The key change message. It will be used in modify Json data.
			"List"		: "l",		// Message category: List. 			        The message was used to change numbering.json content
			"Style"		: "st",		// Message category: Style. 				Change style.json message, like change style or crate style.
			"Meta"		: "mt",
			"Selection" : "sel"		// Message category: Content, Relation(in Header, footer). When user selection changed.
		};
	WRITER.ACTTYPE = {
			"InsertText"		: "it",		// Message type: Text.
			"DeleteText"		: "dt",		// Message type: Text.
			"InsertElement"		: "ie", 	// Message type: Element, Table.
			"DeleteElement"		: "de", 	// Message type: Element.
			"SetAttribute"		: "sa", 	// Message type: Attribute, Table.
			"SetTextAttribute"	: "sta",	// Message type: TextAttribute.
			"InsertRow"         : "ir", 	// Message type: Table.
			"DeleteRow"         : "dr", 	// Message type: Table.
			"InsertColumn"      : "ic", 	// Message type: Table.
			"DeleteColumn"      : "dc", 	// Message type: Table.
			"MergeCells"        : "tmc", 	// Message type: Table.
			"SplitCells"        : "tsc", 	// Message type: Table.
			
			// Use the following action to change setting, relations, styles and numbering 			
			"InsertKey"			: "ik",		// Message type: KeyMessage. The action will add a key in object
			"DeleteKey"			: "dk",		// Message type: KeyMessage. No used yet. The action will remove the key from object
			"ReplaceKey"		: "rk",		// Message type: KeyMessage. The action will replace the key content

			"InsertArray"		: "ia",		// Message type: KeyMessage. The action will add a object to an array
			"DeleteArray"		: "da",		// Message type: KeyMessage. The action will remove a object from an array
			
			// Numbering related message
			"AddList"			: "al",		// Message type: List. Add numbering item in numbering.json
			"IndentList"		: "il",		// Message type: List. Indent list
			"ChangeType"		: "ct",		// Message type: List. Change list type
			"ChangeStart"		: "cs",		// Message type: List. Change list start
			
			// Style related message
			"AddStyle"			: "as",		// Message type: Style. Add a style in style.json
			
			//Task related message
			"TaskUpdate"		: "tup",	// Message type: update the task item
			"TaskDelete"		: "tdel",   // Message type: delete the task item
			"SetParaTask"		: "sps",	// Message type: Set Paragraph task
			"SetTableTask"		: "sts",	// Message type: Set Table task
			
			
			// Comments related message
			"AddComment"		: "acmt", 	// Message type: TextComment.
			"DelComment"		: "dcmt", 	// Message type: TextComment.
			"UpdateComment"         : "ucmt",   // Message type: TextComment.
			"DeleteSection"		: "deSec", 	// Message type: Section.
			"InsertSection"		: "iSec", 	// Message type: Section.
			"AddEvenOdd"		: "ieo", 	// Message type: Setting.
			"RemoveEvenOdd"		: "deo", 	// Message type: Setting.
			
			"PageCount"			: "pc",		// The document's page count
				
			"SelectionChanged"	: "selc"	// Message type: Selection, when selection changed
		};
	WRITER.KEYPATH = {
			"Footnote"			: "footnote",
			"Endnote"			: "endnote",
			"Section"			: "sects"
	};
})();