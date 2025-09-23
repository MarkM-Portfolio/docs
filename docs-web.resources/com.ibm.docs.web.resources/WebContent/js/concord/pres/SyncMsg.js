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

dojo.provide("concord.pres.SyncMsg");
dojo.require("concord.text.SyncMsg");
dojo.require("concord.pres.MsgUtil");

dojo.declare("concord.pres.SyncMsg", concord.text.SyncMsg, {
	
	_documents: {},
	
	SYNC_BOTH: {},
	SYNC_SORTER: {syncSorter: true, syncCanvus: false},
	SYNC_CANVUS: {syncSorter: false, syncCanvus: true},
	NO_LOCAL_SYNC: {syncSorter: false, syncCanvus: false},
	
	
	initDocNodes : function(sorterDoc) {
		this._documents['sorter'] = sorterDoc;
		this._documents['canvus'] = document;
	},
	
	// this is tempory used to send comments message both on sidebar and editors
	sendCombinedMessage : function(msgPairList, data)
	{
		var msgList = [];
		var aMsgList = [];
		var rMsgList = [];
		var scene = window['pe'].scene;
		for (var i=0; i<msgPairList.length; i++)
		{
			var msg = msgPairList[i].msg;
			var rMsg = msgPairList[i].rMsg;
			
			msgList.push(msg);
			
			if(msg.updates && msg.updates.length > 0 && msg.type != "comments")
			{	
				aMsgList.push(msg);		
			  rMsgList.push(rMsg);
			}
		}
		
		// merge undo/redo actions
		this.preSend(aMsgList, rMsgList, data);
				
		if(msgList.length > 0)
		{
			scene.session.sendMessage(msgList);
//			if (this.addToUndoQ(aMsgList))
//				scene.getEditor().recordUndo(aMsgList,rMsgList);
		}
	},	

	
	sendMessage : function(msgPairList, data, returnMsgPairList,undoMsgId,parked)
	{
			//console.log(PresConstants.LOG_HERDER, "SyncMsg::sendMessage");
			//console.log(PresConstants.LOG_HERDER, dojo.toJson(msgPairList));
			var msgList = [];
			var rMsgList = [];
			var scene = window['pe'].scene;
			
			// Use the flag to check if content size has been changed.
			scene.editorContentChanged = true;
			
			for (var i=0; i<msgPairList.length; i++)
			{
				var msg = msgPairList[i].msg;
				var rMsg = msgPairList[i].rMsg;
				if(msg.updates.length <= 0)
					continue;
				
				msgList.push(msg);
				rMsgList.push(rMsg);
			}
			this.preSend(msgList, rMsgList, data);
					
			if(msgList.length > 0)
			{
				console.log('send msg from syn');
				PresCKUtil.normalizeMsgSeq1(msgList);

				if (this.addToUndoQ(msgList)){
					PresCKUtil.normalizeMsgSeq(msgList,rMsgList,undoMsgId);
				}
			}	
		
		PresCKUtil.setEditFlagInSendMsg(msgList, this._documents['sorter'], data);
		
		if (returnMsgPairList == true)
			return dojo.clone({'msgList':msgList,'rMsgList':rMsgList});
	},	
	
	//Moved sendMessage until get permission to add addToUndoQ to concord.text.SyncMsg
	sendMessageOLD : function(msgPairList, data)
	{
		var msgList = [];
		var rMsgList = [];
		var scene = window['pe'].scene;
		for (var i=0; i<msgPairList.length; i++)
		{
			var msg = msgPairList[i].msg;
			var rMsg = msgPairList[i].rMsg;
			if(msg.updates!=null && msg.updates.length <= 0)
				continue;
			
			msgList.push(msg);
			rMsgList.push(rMsg);
		}
		
		this.preSend(msgList, rMsgList, data);
				
		if(msgList.length > 0)
		{
			this._compressMsg(msgList, rMsgList);
		}
	},

	swapWaitingListElement : function(array, indexA, indexB) {
		  var tmp = array[indexA];
		  array[indexA] = array[indexB];
		  array[indexB] = tmp;
	},

	// Compress continuous insert/delete text message
	_compressMsg : function( msgList, rMsgList )
	{
		var scene = window['pe'].scene;
		var sess = scene.session;
		var editor = scene.getEditor();
		var undoStack = editor.getStack();

		// Compress message in single mode only, has no redo
		if(sess.singleMode && sess.waitingList.length > 0 && msgList.length == 1 && !editor.hasRedo() && undoStack.length > 0)
		{
			/*
			* Fix for fast typing grahamo@ca.ibm.com 45870
			* If the user is typing very fast the second text entry will end up in 
			* the wrong position in sess.waitingList. The code below adjusts the position
			* of that entry so combineMsg can work properly.
			*/
			if (sess.waitingList[8] != undefined && sess.waitingList[8].type == "a" 
				&& sess.waitingList[8].updates[0].a != undefined
				&& sess.waitingList[8].updates[0].a.emptyCB_placeholder != undefined
				&& sess.waitingList[8].updates[0].a.emptyCB_placeholder == "false"
				&& sess.waitingList[3] != undefined && sess.waitingList[4].type == "t"
				&& sess.waitingList[4] != undefined && sess.waitingList[4].type == "t") {
				
				//console.log("fast type detected");
				
				//swap the waiting list elements to the correct order
				this.swapWaitingListElement(sess.waitingList, 4, 8);

				//reset the undo stack
				undoStack = editor.getStack();
			}

			// Get the latest redo message from stack
			var msgs = undoStack[undoStack.length - 1];
			if(msgs.redo.length == 1)
			{
				var combined = this._combineMsg(msgList[0], msgs.redo[0]);
				if(combined)
				{
					this._combineMsg(rMsgList[0], msgs.undo[0], true);
					
					// Remove the latest message from waiting list
					sess.waitingList.pop();
					
					// Send the combined message
					var clone = dojo.clone(msgs.redo);
					sess.sendMessage(clone);
					this.updateMsgState(clone, msgs.redo);
					return;
				}
			}
		}
		
		var cloneList = dojo.clone(msgList);
		sess.sendMessage(cloneList);
		this.updateMsgState(cloneList, msgList);
		this.updateMsgState(cloneList, rMsgList);
		if (this.addToUndoQ(msgList))
			editor.recordUndo(msgList,rMsgList);
	},
	
	addToUndoQ: function(msgList){		
		var addToQ = true;
		if (this._isResizingMsg(msgList,"Resizing") || this._isResizingMsg(msgList,"ResizingEnd")) {
			addToQ = false;
		}else if (!this._isAddToUndo(msgList)) {
			addToQ = false;
		} else {
			for(var i=0; i<msgList.length; i++ ){
				var msg = msgList[i];
				if (msg.type == MSGUTIL.msgType.slideSelected 		  	||
					msg.type == MSGUTIL.msgType.contentBoxEditMode		||
					msg.type == MSGUTIL.msgType.slideShowCoview	    	||
			        msg.type == MSGUTIL.msgType.slideShowCoviewStart	||
			        msg.type == MSGUTIL.msgType.slideShowCoviewEnd 		||
			        msg.type == MSGUTIL.msgType.slideShowCoviewJoin		||
			        msg.type == MSGUTIL.msgType.slideShowCoviewLeft		||
					msg.type == MSGUTIL.msgType.templateApplied		||
					(msg.type == MSGUTIL.msgType.layoutApplied && msgList.length==1) 	||
					msg.type == MSGUTIL.msgType.addNewComment		||
					msg.type == MSGUTIL.msgType.deleteComment 		||
					msg.type == MSGUTIL.msgType.requestLockStatus	||
					msg.type == MSGUTIL.msgType.removeUserLock 		||
					msg.type == MSGUTIL.msgType.ResetContent 		||
					msg.type == "resetContent"
					){
					addToQ = false;
					break;
				}
				/*
				//if the layoutApplied is a message by itself, do not put in undo queue
				//since this is non operation message, user would experience like a blank undo
				else if(msg.type == MSGUTIL.msgType.layoutApplied && msgList.length==1){//if this is the only one, set addToQ to false.
					addToQ = false;
					break;
				}
				*/
			}
		}
		return addToQ;
	},
	
	/*
	 * isCtrl = true, indicate this message is not a content change message
	 * just used to notify other clients, such as "slideSelected" events
	 */
	createMessage: function(type, actPairList, callback, data, isCtrl){
		var msgPair = this.inherited(arguments);		
		//jmt - tempcode until server allows empty updates for presentation specific messages.
		if(msgPair.msg.updates.length==0){	
			var act = {};		
			msgPair.msg.updates.push(act);
			msgPair.rMsg.updates.push(act);
		}
		return msgPair;
	},	
	
	/*
	 * !!!slideSelected event is not a content change event, shouldn't be sent to server the same as content change message
	 */
	createActivateSlideSelectedMsg: function(elemId){
		var msgPair = this.createMessage(MSGUTIL.msgType.slideSelected,[], null, null, true);
		msgPair.msg.elemId = elemId;		
		//msgPair.msg.updates = [];
		return msgPair;
	},
	
	createActivateEditModeMsg: function(elemId,editMode,initialEditServerSeq){		
		var msgPair = this.createMessage(MSGUTIL.msgType.contentBoxEditMode,[], null, null, false, true);
		msgPair.msg.elemId = elemId;		
		msgPair.msg.editMode = editMode;		
		msgPair.msg.initialEditServerSeq = initialEditServerSeq;
		return msgPair;		                                    
	},
	
	createSlideShowCoviewMsg: function(curSlide,totalSlide,slideContent){		
		var msgPair = this.createMessage(MSGUTIL.msgType.slideShowCoview,[], null, null, true);			
		msgPair.msg.curSlide = curSlide;
		msgPair.msg.totalSlides = totalSlide; 
	    // task 32762 remove slide content for better performance
		//	msgPair.msg.slideContent = slideContent;
		return msgPair;		                                    
	},
	
	createSlideShowCoviewStartMsg: function(curSlide,totalSlide,slideContent,userIdArr){		
		var msgPair = this.createMessage(MSGUTIL.msgType.slideShowCoviewStart,[], null, null, true);
		msgPair.msg.inviteeList = userIdArr.toString();
		msgPair.msg.curSlide = curSlide;
		msgPair.msg.totalSlides = totalSlide; 
        //task 32762 remove slide content for better performance 
		//msgPair.msg.slideContent = slideContent;

		return msgPair;		                                    
	},
	
	createSlideShowCoviewJoinMsg: function(userHostId){		
		var msgPair = this.createMessage(MSGUTIL.msgType.slideShowCoviewJoin,[], null, null, true);
		msgPair.msg.userHostId = userHostId;
		return msgPair;		                                    
	},
	
	createSlideShowCoviewEndMsg: function(){		
		var msgPair = this.createMessage(MSGUTIL.msgType.slideShowCoviewEnd,[], null, null, true);
		return msgPair;		                                    
	},
	
	createSlideShowCoviewLeftMsg: function(){		
		var msgPair = this.createMessage(MSGUTIL.msgType.slideShowCoviewLeft,[], null, null, true);
		return msgPair;		                                    
	},

	createRequestObserverModeStatusMsg: function(){		
		var msgPair = this.createMessage(MSGUTIL.msgType.requestObserverModeStatus,[], null, null, true);
		return msgPair;		                                    
	},
	
	createRequestLockStatusMsg: function(){		
		var msgPair = this.createMessage(MSGUTIL.msgType.requestLockStatus,[], null, null, true);
		return msgPair;		                                    
	},
	
	createRemoveUserLockMsg: function(userId){		
		var msgPair = this.createMessage(MSGUTIL.msgType.removeUserLock,[], null, null, true);		
		return msgPair;		                                    
	},
	
	createAssignmentMsg: function(slideId, taskId, type){
		var msgPair = this.createMessage(MSGUTIL.msgType.doAssignment,[]);
		msgPair.msg.slideId = slideId;
		msgPair.msg.taskId = taskId;
		msgPair.msg.actionType = type;
		return msgPair;		                                    
	},
	
	createLayoutAppliedMsg: function(slideId){
		if(slideId!=null && slideId !=""){			
			var msgPair = this.createMessage(MSGUTIL.msgType.layoutApplied,[]);
			msgPair.msg.slideId = slideId;
			return msgPair;		                                    
		}	
	},
	
	createAddNewCommentMsg: function(elemId, commentId){		
		var msgPair = this.createMessage(MSGUTIL.msgType.addNewComment,[]);
		msgPair.msg.elemId = elemId;
		msgPair.msg.commentId = commentId;
		return msgPair;		                                    
	},

	
	deleteCommentMsg: function(elemId, commentId){		
		var msgPair = this.createMessage(MSGUTIL.msgType.deleteComment,[]);
		msgPair.msg.elemId = elemId;	
		msgPair.msg.commentId = commentId;
		return msgPair;		                                    
	},
	
	_createInsertElementAct : function(index,target,node,isblock, keep8203)
	{
		var act = this.inherited(arguments);
		//note: if node is a slide (.draw_page level)
		//node always is wrapped inside a slideWrapper (has slideWrapper as parent)
		//need to send parentId as the slideWrapper parent id, not the slideWrapper id.
		//need to send refId as the next slide id (not the next slide wrapper)
		
		//check if node is a slide
		var isNodeASlide = false;
		var isNodeASlideWrapper = false;
		var className = node.$.getAttribute("class");
		if(className!=null){ //add by wj
			var drawPageIdx = className.indexOf("draw_page");
			if(drawPageIdx >=0){
				isNodeASlide = true;
			}
			var slideWrapperIdx = className.indexOf("slideWrapper");
			if(slideWrapperIdx >=0){
				isNodeASlideWrapper = true;
			}
		}
				
		act.p_nid=node.$.id;		
		if (dojo.hasClass(node.$,'draw_frame')){
			act.p_isnad = true;
			act.p_cid = node.$.id;
		}
		
		if(isNodeASlide){
			act.p_isnas = true;
			act.p_isnasw = false;
			act.parentId=node.$.parentNode.parentNode.id;  //node.parentNode is slideWrapper, the real parent to send is the parent of the slideWrapper
			act.refId="";
			var nextSlideWrapper = node.$.parentNode.nextSibling;
			if(nextSlideWrapper!=null){//get next slide sibling, which is a child of the next slideWrapper
				if(nextSlideWrapper.childNodes!=null && nextSlideWrapper.childNodes.length>0){
					act.refId=nextSlideWrapper.childNodes[0].id;
					if (!act.refId)
						act.refId = '';
				}
			}
			act.p_sid = node.id;
		}else if(isNodeASlideWrapper){
			node.$.style.border = "";//remove the indication that this slide was selected by other users
			act.p_isnas = false;
			act.p_isnasw = true;
			//act.parentId=node.parentNode.id; //this doesn't work for defect 46753 [co-editing]Undo/Redo error when move up slide, parentNode is null, so use target
			//target sometimes contains already an id string, but sometimes contains a node
			if(target.getId !=null){
				act.parentId=target.getId();
			}else {
				act.parentId=target;
			}
			
			act.refId=node.$.nextSibling && node.$.nextSibling.id ? node.$.nextSibling.id: "" ;
			if (node.firstChild && dojo.hasClass(node.firstChild,'draw_page'))
			  act.p_sid = node.firstChild.id;
		}
		else{
			try{
				act.p_isnas = false;
				act.p_isnasw = false;
				if(node.$.parentNode && typeof node.$.parentNode.id != 'undefined') {
					act.parentId=node.$.parentNode.id;
				}
				act.refId=node.$.nextSibling && node.$.nextSibling.id ? node.$.nextSibling.id: "" ;
			}catch(e) {}
		}	
		
		//Let's check if this is a task
		if ((className!=null)&&(className=='taskContainer')){
			act.p_isnat='true';
		} else {
			act.p_isnat='false';
		}
		target = null;
		node = null;
		return act;		
	},
	
	createInsertElementAct : function(index,target,node,isblock, keep8203)
	{
		if(typeof node == 'string')// JMT - Merge
			node = CKEDITOR.dom.element.createFromHtml(node);// JMT - Merge	
		var act= this._createInsertElementAct(index, target, node, isblock, keep8203);	
		var rAct = this._createDeleteElementAct(index, 1, target, [node],isblock); // need to pass in the delete node
		//rAct.t = MSGUTIL.actType.deleteElement;
		target = null;
		node = null;
		return {"act": act, "rAct": rAct};
	},

	
	createDeleteElementAct : function(index, length, target, deleteNodes ,isblock,useElemId)
	{		
		var act = this._createDeleteElementAct(index, length, target, deleteNodes,isblock, useElemId); // need to pass in delete Node			
		var rActs = [];
		var doc = window.pe.scene.getEditor().document; // JMT - merge
		for(var i = 0; i < length; i++)
		{
			var node = deleteNodes[i];	// JMT - merge
			if(typeof node == 'string') // JMT - merge
				node = doc.getById(deleteNodes[i]); // JMT - merge

			var rA = this._createInsertElementAct(index + i,target,node,isblock);
			rActs.push(rA);	
			node = null;
		}
		
		var rAct = {};
		rAct.actions = rActs;
		target = null;
		deleteNodes = null;
		doc = null;
		return {"act": act, "rAct": rAct};
	},
	
	_createDeleteElementAct : function(index, length, target,nodeArray, isblock,useElemId)
	{
		var act = this.inherited(arguments);
		//note: if node is a slide (.draw_page level)
		//node always is wrapped inside a slideWrapper (has slideWrapper as parent)
		//need to send parentId as the slideWrapper parent id, not the slideWrapper id.
		//need to send refId as the next slide id (not the next slide wrapper)
		//check if node is a slide
		var isNodeASlide = false;
		var isNodeASlideWrapper = false;
		
		var node = null;
		
		if(typeof nodeArray[0] == 'string')
		{
			var id = nodeArray[0];
			node =PROCMSG._getSorterDocument().getElementById(id);			
		} else {
			node = nodeArray[0].$;
		}

		var className = node.getAttribute("class");
		if(className!=null){	//some node may not have class attribute
			var drawPageIdx = className.indexOf("draw_page");
			if(drawPageIdx >=0){
				isNodeASlide = true;
			}
			var slideWrapperIdx = className.indexOf("slideWrapper");
			if(slideWrapperIdx >=0){
				isNodeASlideWrapper = true;
			}
		}	
		act.p_nid=node.id;
		if (useElemId) act.useElemId = true;
		act.p_isnad = false;
		if (dojo.hasClass(node,'draw_frame')){
			act.p_isnad = true;
			act.p_cid = node.id;
		}

		if(isNodeASlide){
			act.p_isnas = true;
			act.p_isnasw = false;
			act.parentId=node.parentNode.parentNode.id;  //node.parentNode is slideWrapper, the real parent to send is the parent of the slideWrapper
			act.refId="";
			act.p_sid = node.id;
			var nextSlideWrapper = node.parentNode.nextSibling;
			if(nextSlideWrapper!=null){//get next slide sibling, which is a child of the next slideWrapper
				if(nextSlideWrapper.childNodes!=null && nextSlideWrapper.childNodes.length>0){
					act.refId=nextSlideWrapper.childNodes[0].id;
					if (!act.refId)
						act.refId = '';
				}
			}	
		}else if(isNodeASlideWrapper){
				act.p_isnas = false;
				act.p_isnasw = true;
				//act.parentId=node.parentNode.id; //this doesn't work for defect 46753 [co-editing]Undo/Redo error when move up slide, parentNode is null, so use target 
				//target sometimes contains already an id string, but sometimes contains a node
				if(target.getId !=null){
					act.parentId=target.getId();
				}else {
					act.parentId=target;
				}
				
				act.refId=node.nextSibling && node.nextSibling.id ? node.nextSibling.id: "" ;
				if (node.firstChild && dojo.hasClass(node.firstChild,'draw_page'))
				  act.p_sid = node.firstChild.id;
		}
		else{
			try{
				act.p_isnas = false;
				act.p_isnasw = false;
				if(node.parentNode && typeof node.parentNode.id != 'undefined') {
					act.parentId=node.parentNode.id;  
				}
				act.refId=node.nextSibling && node.nextSibling.id ? node.nextSibling.id: "" ;
			}catch(e) {
				console.error(e);				
			}
		}	
		
		//Let's check if this is a task
		if ((className!=null)&&(className=='taskContainer')){
			act.p_isnat='true';
		} else {
			act.p_isnat='false';
		}
		target = null;
		node = null;
		nodeArray = null;
		return act;
	},
	
	/**
	 * Create a update Node message. 
	 * @param _editorNode The node will be update to sorter
	 */
	createUpdateNodeMsg: function(_editorNode,msgPairList)
	{
		var editorNode = PresCKUtil.ChangeToCKNode(_editorNode);
		var nodeInSorter = window.pe.scene.slideSorter.editor.document.getById(editorNode.$.id);
		if(!nodeInSorter)
			return msgPairList;
		nodeInSorter = PresCKUtil.ChangeToCKNode(nodeInSorter);
		var parentInSorter = nodeInSorter.getParent();
		if(!parentInSorter)
			return msgPairList;
        msgPairList =SYNCMSG.createDeleteNodeMsgPair(nodeInSorter,msgPairList);
        var nextSibling = nodeInSorter.getNext();
        dojo.destroy(nodeInSorter.$);
        //then insert the new one
        var newElem = editorNode.clone(true);

        if(nextSibling!=null){
        	newElem.insertBefore(nextSibling);
        }else{
        	parentInSorter.append(newElem);
        }
        msgPairList = SYNCMSG.createInsertNodeMsgPair(newElem.$,msgPairList);
        return msgPairList;
	},
	
	/**
	 * Create a Replace Node message. 
	 * @param node The node will be replaced
	 */
	createReplaceNodeMsg: function(node, useElemId, keep8203)
	{
		// Use node.$ check if the node is CKEditor Node, if not will create it as CKEditor node. 
		node = node.$ ? node : new CKEDITOR.dom.node(node);
		
		var actPair = [];
		actPair.push( SYNCMSG.createDeleteElementAct(node.getIndex(), 1, node.getParent(), [node], true, useElemId) );	
		actPair.push( SYNCMSG.createInsertElementAct(node.getIndex(), node.getParent(), node, true, keep8203) );
		
		return SYNCMSG.createMessage(MSGUTIL.msgType.ReplaceNode, actPair);
	},
	
	createInsertNodeMsgPair: function(node,pairList){
		var msgPairList =(pairList==null)? []: pairList;
		var newE = new CKEDITOR.dom.node(node);			
		var actPair = SYNCMSG.createInsertElementAct(newE.getIndex(), newE.getParent(), newE, true);
		if(dojo.isIE)
		{
			var tmpNode  = dojo.clone(node);
			tmpNode.removeAttribute('contenteditable');
			actPair.act.s = tmpNode.outerHTML ;
			delete tmpNode;
		}
		msgPairList.push(SYNCMSG.createMessage(MSGUTIL.msgType.Element, [actPair]));
		newE = null;
		node = null;
		return msgPairList;
	},
	
	createDeleteNodeMsgPair: function(elem,pairList,useElemId){
		var msgPairList =(pairList==null)? []: pairList;	
		var actPair = SYNCMSG.createDeleteElementAct(elem.getIndex(), 1, elem.getParent(), [elem], true,useElemId);		
		msgPairList.push(SYNCMSG.createMessage(MSGUTIL.msgType.Element, [actPair]));
		elem = null;
		return msgPairList;
	},
	
	createPresDelInsertElementAct: function(divId, msgType){

		var sorterDoc = PROCMSG._getSorterDocument();
		var sorterDFNode = sorterDoc.getElementById(divId);
		if(!sorterDFNode){
			console.log("! Failed to insert row in table, sorter don't have responding table.");
			return;
		}
		sorterDFNode = new CKEDITOR.dom.node(sorterDFNode);
		var sorterDFNodeIndex = sorterDFNode.getIndex();
		
		var ret = null;
		switch(msgType){
			case "delete":
				ret = SYNCMSG.createDeleteElementAct(sorterDFNodeIndex, 1, sorterDFNode.getParent(), [sorterDFNode], true)
				break;
			case "insert":
				ret = SYNCMSG.createInsertElementAct(sorterDFNodeIndex, sorterDFNode.getParent(), sorterDFNode, true);
				break;
			default:
				break;
		}
		
		return ret;
	},
	
	createAttributeMsgActs: function(node, attrName,newAttrValue,acts,oldAttrValue){
		var msgActs =(acts == null)? []: acts;
		var attrName = attrName;
		var oldAttrs = {};
		oldAttrs[attrName] = (oldAttrValue) ? oldAttrValue : node.getAttribute(attrName);													
		var newAttrs = {};
		newAttrs[attrName] = (newAttrValue)? newAttrValue :node.getAttribute(attrName);
		
		//Let's prevent resizeablecontainerSelected attribute to pass	
		if (oldAttrs[attrName] !=null && oldAttrs[attrName].indexOf("resizableContainerSelected") >0) {
			oldAttrs[attrName] = oldAttrs[attrName].replace('resizableContainerSelected','resizableContainer');	
			newAttrs[attrName] = newAttrs[attrName].replace('resizableContainerSelected','resizableContainer');
		}

		var act = SYNCMSG.createAttributeAct(node.getId(), newAttrs, null, oldAttrs, null);
		msgActs.push(act);
		return msgActs;
	},
	
	createAttributeMsgPair: function(node, attrName,newAttrValue,pairList,oldAttrValue){
		var msgPairList =(pairList==null)? []: pairList;
		var msgActs = [];
		SYNCMSG.createAttributeMsgActs(node, attrName,newAttrValue,msgActs,oldAttrValue);
		msgPairList.push(SYNCMSG.createMessage(MSGUTIL.msgType.Attribute, msgActs)); 
		return msgPairList;
	},	
	
	createStyleMsgPair: function(data,attrObj,pairList){
		if(data!=null && data.id !=null && data.attributeName!=null){				
			var msgPairList =(pairList==null)? []: pairList;			
			//co-edit, send the change and command to other user if any
			//console.log('oldStyleValue :'+attrObj.oldStyleValue,'\nnewStyleValue:'+attrObj.newStyleValue);
			var act = SYNCMSG.createAttributeAct(data.id, attrObj.newAttrValue, attrObj.newStyleValue, attrObj.oldAttrValue, attrObj.oldStyleValue);
			var msg = SYNCMSG.createMessage(MSGUTIL.msgType.Attribute,[act]);
			msgPairList.push(msg);
			return msgPairList;
		}
	},	
	
	createAttributeAct : function(target,atts,styles,oldatts,oldstyles,flag)
	{
		if(!oldstyles)
			oldstyles = {};
		var actPair = this.inherited(arguments);
		if (flag){
			actPair.act.flag = flag;
			actPair.rAct.flag = flag;
		}		
		return actPair;
	},
	
	//
	// Sets undoflag flag in message
	//	
	addUndoFlag: function(msgPair,addToUndo){		
	   var msg = msgPair.msg;
	   var rMsg = msgPair.rMsg;
	   msg.updates[0].addToUndoFlag=addToUndo;
	   rMsg.updates[0].addToUndoFlag=addToUndo;
	   return {'msg':msg,'rMsg':rMsg};
	},
	
	//
	// Sets hasInsertDeleteSameElement flag in message list, indicating that in somewhere in the messageList, we have 
	// insert and delete operation of the same element, eg. in the case of dnd, move up move down, layout change, etc
	//	
	setHasInsertDeleteSameElementInMsgListFlag: function(msgPairList,hasInsertDeleteSameElement){
		if(msgPairList!=null){
			for(var i=0; i<msgPairList.length; i++){
				var msg = msgPairList[i].msg;
				var rMsg = msgPairList[i].rMsg;
				for(var j = 0; j < msg.updates.length; j++)
				{
					msg.updates[j].has_ie_de_inlist=hasInsertDeleteSameElement;
					rMsg.updates[j] && (rMsg.updates[j].has_ie_de_inlist=hasInsertDeleteSameElement);
				}
			}
		}
		return msgPairList;
	},
	
	//sets slideId to the message
	addSlideId: function(msgPair,slideId){		
		   var msg = msgPair.msg;
		   var rMsg = msgPair.rMsg;
		   msg.updates[0].p_sid=slideId;
		   rMsg.updates[0].p_sid=slideId;
		   return {'msg':msg,'rMsg':rMsg};
		},
	
	
	
	getAttrValues: function(data,doc){
		var attrName =data.attributeName;
		var attrValue = null;
		var stylesValue = null;
		var oldStyles =null;
		var oldAttrValue = null;
		if (attrName.toLowerCase()=='style'){ // Processing style attribute
			
			stylesValue = data.attributeValue;			
			var node = dojo.query("#"+data.id,doc)[0];
			oldStyles = node && dojo.attr(node,attrName); 
			if (oldStyles == undefined || oldStyles == null){
				oldStyles = " ";
			} else{
				if ((dojo.isIE)&& (oldStyles.cssText)) {
					oldStyles = oldStyles.cssText;
				}
				if (oldStyles && oldStyles.charAt(oldStyles.length-1) != ';')
					oldStyles = oldStyles + ";";
				
				//D26550 [Regression]Click slide thumbnail, table will flash in slide
				//if user action was not made draw frame position changed, then only get the old width and height value
				//only when posChanged was set to false, then handle replace style.
				if((data.posChange != undefined) && (data.posChange == false)){
					oldStyles = PresCKUtil.replaceStyle(stylesValue, oldStyles, ['left', 'top']);
				}
			}
			
		} else{
			var node = dojo.query("#"+data.id,doc)[0];		
			oldAttrValue =dojo.attr(node,attrName);  		
			attrValue = data.attributeValue;
		}		
		return {'oldAttrValue':oldAttrValue,'newAttrValue':attrValue,'oldStyleValue':oldStyles,'newStyleValue':stylesValue};
	},
	
	createAttributeActForResizing: function(target,atts,styles,oldatts,oldstyles,flag)
	{
		styles = this._normalizeStyles(styles);
		oldstyles = this._normalizeStyles(oldstyles);
		
		var act = this._createSingleAttributeAct(target,"sbt",atts,styles);		
		var rAct=  this._createSingleAttributeAct(target,"sbt",oldatts,oldstyles);
		var actPair = {"act": act, "rAct": rAct};	
		if (flag){
			actPair.act.flag = flag;
			actPair.rAct.flag = flag;
		}				
		return actPair;
	},
	
	preSend: function(msgList, rMsgList, data){
		//console.info('in preSend');
		this._addSlideId(msgList, rMsgList); //add slide id to each msg for loading slide when the message is processed
		this._localSync(msgList, rMsgList, data);
		if (this._isResizingMsg(msgList,"Resizing")||this._isResizingMsg(msgList,"ResizingEnd")){
			//ResizingEnd sometime is move selected objects , Resizing is just resizing object
			PresCKUtil.normalizeMsgSeq(msgList,rMsgList);// add to undo stack from here.
			
		}
	},
	
	_isAddToUndo: function(msgList){
		for ( var i=0; i< msgList.length; i++){
			var updatesList = msgList[i].updates;
			if(updatesList!=null){
					for (var j=0; j<updatesList.length; j++){
						var act = updatesList[j];
						if ( (typeof act.addToUndoFlag != undefined && act.addToUndoFlag != null)){
							return act.addToUndoFlag;
						}
					}
			}
		}	
		return true;		
	},
	
	_isResizingMsg: function(msgList, type){				                             
		for ( var i=0; i< msgList.length; i++){
			var updatesList = msgList[i].updates;
			if(updatesList!=null){
					for (var j=0; j<updatesList.length; j++){
						var act = updatesList[j];
						if ( act.flag!=null && act.flag==type){
							return true;
						}
					}
			}
		}	
		return false;
	},
	
	_addSlideId: function(msgList, rmsgList){				                             
		for ( var i=0; i< msgList.length; i++){
			var updatesList = msgList[i].updates;
			var updatesRList = rmsgList[i].updates;
			if(updatesList!=null){
					for (var j=0; j<updatesList.length; j++){
						var act = updatesList[j];
						var rAct = updatesRList[j];
						var slideId = window.pe.scene.slideEditor.getParentDrawPageId(act.tid, this._documents['sorter']);
						if(slideId !=null){
							act.p_sid = slideId;
							rAct.p_sid = slideId;
						}
						var contentBoxId = window.pe.scene.slideEditor.getParentDrawFrameId(act.tid, this._documents['sorter']);
						if (contentBoxId != null) {
							act.p_cid = contentBoxId;
							rAct.p_cid = contentBoxId;
						}
					}
			}
		}	
	},
	
	//This function will merge a new msgPairList with the msgPaitList stored (parked) in editor instance
	mergeWithParked: function(msgPairList, parkedMsgPairList){
		var newMsgPairList =[];
		for (var i=0; i<parkedMsgPairList.length; i++){
			newMsgPairList.push(parkedMsgPairList[i]);
		}
		for (var i=0; i<msgPairList.length; i++){
			newMsgPairList.push(msgPairList[i]);
		}
		
		return newMsgPairList;		
	},
	
	/**
	 * Sync edit box message to canvas and slidesorter rather than server. 
	 */
	localSync: function(msgList, rMsgList, data) {
		this._localSync(msgList, rMsgList, data);
	},
		
	/*
	 * if not defined, sorter and canvus will be synced
	 */
	_localSync: function(msgList, rMsgList, data) {
		//console.info('Entering _localSync, msgList: ' + msgList);
		PROCMSG.notNeedUpdateListStyle = true;
		var syncSorter = (data ? ((typeof data.syncSorter == 'undefined') ? true : data.syncSorter) : true);
		var syncCanvus = (data ? ((typeof data.syncCanvus == 'undefined') ? true : data.syncCanvus) : true);
		for (var i=0; i<msgList.length; i++) {
			var msg = msgList[i];
			this._logMsg(msg);
			if(msg) {
				try{
					if(syncSorter) PROCMSG.processMessage(msg, this._documents['sorter'],null,null,true);
					if(syncCanvus) PROCMSG.processMessage(msg, this._documents['canvus'],null,null,true);
				}
				catch(e) {console.log(e);}
			}
		}
		PROCMSG.notNeedUpdateListStyle = false;
		//console.info('Exiting _localSync');
	},
	
	

	
	_logMsg: function(msg) {
/*	
		if(msg) {
			console.log('--------- Message Body -----------');
			console.log('Type: ' + msg.type);
			console.log('Cliend ID: ' + msg.client_id);
			var u = msg.updates;
			if(u) {
				for(var i=0; i<u.length; i++) {
					console.log('Target: ' + u[i].tid + ' Type: ' + u[i].t + ' idx: ' + u[i].idx + ' len: ' + u[i].len);
				}
			}
			console.log('-------------  END  -------------');
		} */
	},
	
	
	recordApplyTemplateMessageUndo: function(data){		
		var sorterEditor = PROCMSG._slideSorter.editor;
		var msgList = [];
		var rmsgList = [];
		var type = "applyTemplate";
		var msgPair = this.createMessage(type, []);
		
		var newTemplateData = data.newTemplateDataJSONStr;
		var prevTemplateData = data.prevTemplateDataJSONStr;
		
		msgPair = this.generateApplyTemplateMsgPairList(msgPair, newTemplateData, prevTemplateData);
		msgList.push(msgPair.msg);
		rmsgList.push(msgPair.rMsg);
		if ( msgList.length > 0 && rmsgList.length > 0 )	
			sorterEditor.recordUndo(msgList,rmsgList);
	},
	
	generateApplyTemplateMsgPairList: function(msgPair,newTemplateData, prevTemplateData)
	{
		if(msgPair!=null && msgPair.msg !=null && msgPair.rMsg!=null && newTemplateData!=null && prevTemplateData!=null){
			var act;
			msgPair.msg.combined = false;
			msgPair.msg.type= "applyTemplate";
			msgPair.msg.templateData = newTemplateData;
			
			msgPair.rMsg.combined = false;
			msgPair.rMsg.type= "applyTemplate";
			msgPair.rMsg.templateData = prevTemplateData;
		}
		return msgPair;
	},

	createResetContentMsg: function(type, actPairList,msgPairArray, contentHtml)
	{
		var msgPairList = (msgPairArray==null) ? [] : msgPairArray;
		var msgPair = this.createMessage(type, []);
		var sorterDoc = PROCMSG._getSorterDocument();
		var msg = msgPair.msg;
		msg.combined = false;

		//remove indicator
		var elements = sorterDoc.getElementsByTagName("style");
		for (var i=0; i<elements.length;i++)
		{
			var e = elements[i];
			if (e.id.indexOf("CSS_") == 0)
			{
				e.parentNode.removeChild(e);
				i = i-1;
			}
		}
		//remove \r\n on ie
		//var content = sorterDoc.documentElement.innerHTML;
		var content = (contentHtml==null) ? sorterDoc.documentElement.innerHTML :  contentHtml;
		if (CKEDITOR.env.ie)
			content = content.replace(/\r\n/g,'');
		//msg.data = "<html>" + content + "</html>";
		msg.data = content ;
		
		//add indicator back
//		var list = window.pe.scene.session.participantList;
//		for (var i=0; i<list.length;i++)
//			CKEDITOR.instances.editor1.execCommand("recreateIndicatorSytle", {"user": list[i].getUserBean().getId()});
//		       
		
		//msg.updates[0]={'data': "<html>" + content + "</html>",'t':MSGUTIL.actType.ResetContentAction, 'tid':""};
		msg.updates[0]={'data': content ,'t':MSGUTIL.actType.ResetContentAction, 'tid':""};
		
		msgPairList.push(msgPair);
		return msgPairList;
	},
	createContentResetMsg: function(type, actPairList,msgPairArray)
	{
		var msgPairList = (msgPairArray==null) ? [] : msgPairArray;
		var msgPair = this.createMessage(type, []);
		
		var sorterDoc = PROCMSG._getSorterDocument().cloneNode(true);		
		
		if (!sorterDoc){ // In Safari, document.cloneNode(true) return null
			sorterDoc = window.pe.scene.slideSorter.getSorterDocument().documentElement.cloneNode(true); 
		} 
		
		if(!sorterDoc){
			throw('The Sorter document element is empty in create reset content message');
		}
		
		// remove spell check styles
		if(sorterDoc.spellckecker){
			sorterDoc.spellchecker.resetOneNode(sorterDoc, true);
		}
		
		var msg = msgPair.msg;
		msg.combined = false;

		//remove indicator
		var elements = sorterDoc.getElementsByTagName("style");
		for (var i=0; i<elements.length;i++)
		{
			var e = elements[i];
			if (e.id.indexOf("CSS_") == 0)
			{
				e.parentNode.removeChild(e);
				i = i-1;
			}
		}
		//remove \r\n on ie
		/* Fix for defect 10013
		var content = sorterDoc.documentElement.innerHTML;
		if (CKEDITOR.env.ie)
			content = content.replace(/\r\n/g,'');
		msg.data = "<html>" + content + "</html>";	
		*/
		
		var content = window.pe.scene.slideSorter.getSlideSorterPresContentHtml();
		if (CKEDITOR.env.ie){
			content = content.replace(/\r\n/g,'');
		}
		msg.data = content; 
		
		//add indicator back
//		var list = window.pe.scene.session.participantList;
//		for (var i=0; i<list.length;i++)
//			CKEDITOR.instances.editor1.execCommand("recreateIndicatorSytle", {"user": list[i].getUserBean().getId()});
//		       
		
//		msg.updates[0]={'data': "<html>" + content + "</html>",'t':MSGUTIL.actType.ResetContentAction, 'tid':""};
		
		msgPairList.push(msgPair);
		return msgPairList;
	},		
	
	 //TODO:: filterMarkNode is slow if node is a very large table
	 filterMarkNode : function (node)
	 {
		if(typeof node == 'string')
			return node;
		else
		{
			var editor = window['pe'].scene.getEditor();
			var cNode = node.clone(true,true);
			
			var destroyClone = true;
			if(editor.spellchecker)
				editor.spellchecker.resetOneNode(cNode.$, true);
			
			var tmpStr = cNode.getOuterHtml();
			
			
			 // book mark
			tmpStr = tmpStr.replace(/<span[^>]+_fck_bookmark.*?\/span>/gi,'');
			//D41774 destroy clone after usage to avoid memory leak
			if(destroyClone){
				dojo.destroy(cNode.$);
				cNode.$=null;
			}
			editor = null;
			cNode = null;
			node = null;
			return tmpStr;
		}				
	 },
	 
	 /**
	  * D14496 Filter style attributes that should be removed from s
	  */
	 filterStyleProperties: function(s,list){
		 //0 = do not send
		 //1 = send only if value is different from initial
		 var defaultList = {'background':0,
				 			'background-attachment':0,
				 			'background-color':1,
				 			'background-origin':0,
				 			'background-position':0,
				 			'background-repeat':0,
				 			'background-image':0,
				 			'background-clip':0
				 			};
		 var sProps = (list!=null)? list : defaultList;
		 if (s!=null){
			for( var name in s ){		
				if (sProps[name]!=null){ // if property is in list									
					if (sProps[name]==0){ //don't send so remove from list
						delete s[name];
					} else if (sProps[name]==1){ //we want to send if value is not initial
						var value = s[name]; //let's look at value to be sent
						if (value.match(/initial/gi)!=null){ //then remove if value contains initial
							delete s[name];
						}
					}
				}				
			}			 			 
		 }		 
		 return s;
	 }
});

(function(){	
		SYNCMSG = new concord.pres.SyncMsg();	
})();

