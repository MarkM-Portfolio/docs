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

dojo.provide("concord.pres.ProcMsg");
dojo.require("concord.pres.MsgUtil");

dojo.require("concord.util.presToolbarMgr");
dojo.require("concord.text.ProcMsg");
dojo.require("concord.text.tools");

dojo.declare("concord.pres.ProcMsg", concord.text.ProcMsg, {
	_slideSorter: null,
	_scene: null,
	_slideEditor: null,
	_handleConflictZIdxFlag: false,
	SORTER_DOC: 'sorterDoc',
	CANVAS_DOC: 'canvasDoc',
	SECK_DOC: 'slideEditorCKDOC',
	
	constructor: function(data) {
		this._slideSorter = data.slideSorter;
		this._scene = data.scene;
		this._slideEditor = data.slideEditor;		
	},
	
	checkRelated2 : function(msg, baseMsg)
	{
		return msg.asCtrl !== undefined && (baseMsg.asCtrl !== undefined || baseMsg.elemId !== undefined);
	},
	
	testDeleteLast: function(id)
	{
    	var tstart = new Date();
    	this._recordStart = tstart;
	
    	var slides = pe.scene.slideSorter.slides;
    	var lastPage = slides[slides.length-1].parentNode;
		lastPage.parentNode.removeChild(lastPage);
		var tend = new Date();
		console.log("ProcMsg.testDeleteLast: " + (tend.getTime() - tstart.getTime()));
		setTimeout(dojo.hitch(this, this.recordTime), 0);
	},
	
	testDeleteFirst: function(id)
	{
    	var tstart = new Date();
    	this._recordStart = tstart;
	
    	var slides = pe.scene.slideSorter.slides;
    	var firstPage = slides[0].parentNode;
    	firstPage.parentNode.removeChild(firstPage);
		var tend = new Date();
		console.log("ProcMsg.testDeleteFirst: " + (tend.getTime() - tstart.getTime()));
		setTimeout(dojo.hitch(this, this.recordTime), 0);
	},
	
    recordTime: function() {
    	var tend = new Date();
    	console.error("Timeout in ProcMsg.testDelete: " + (tend.getTime() - this._recordStart.getTime()));
    },
    
	transform : function(msg, localList)
	{
		var baseList= localList;
		var type = msg.type;
	    for (var index = 0; index < baseList.length; index++)
	    {
	      var baseMsg = baseList[index];
	      if(!this.checkRelated2(msg, baseMsg))
	    	  continue;
      
	      if (type == baseMsg.type) {
	    	  // ignore local lock and unlock operation
	    	  if (baseMsg.elemId == msg.elemId) {
	    		  if (msg.editMode)
	    			  ;
	    	  }
	      } else if (baseMsg.elemId == msg.elemId)
	    	  // local object content change operation, need to be rejected
	    	  return baseMsg;
	    }
	    
	    return null;
	},
	
	receiveMessage : function(msg){
		// 1.Chk for presentation specific messages and process them
		var fromUndoRedo = false;
		var continueProcess = this.processPresMsg(msg,fromUndoRedo);
		if (continueProcess){
			// 2.Transform message in sendoutList
			//if this p_tt message no need to check OT
//			if ((msg.updates[0].p_tt!=undefined && msg.updates[0].p_tt!=true) || msg.updates[0].p_tt==undefined){
				this.transformMessage(msg);							
//			}
			// 3 apply message to editor
			var remoteMsg = this._setRemoteFlagInMsgAct(msg);
			this.processRemoteMsg(remoteMsg);
			// 4. Transform Undo/Redo message if msg is not contentBox or slide level operation
//			if (this.isMsgForPresentationObj(msg)){
//				this._slideSorter.editor.transformUndo(msg);
//			}
		}
	},
	
	procMessageFromUndoRedo : function(msg,dom,docKey){
		// 1.Chk for presentation specific messages and process them
		var undoMsg = this._setUndoFlagInMsgAct(msg);
		var continueProcess = this.processPresMsg(undoMsg,true);
		if (continueProcess){
			this.processMessage(undoMsg,dom,docKey,null,true);
		}
	},
	
	processMessage : function(message,dom,docKey,fromUndoRedo,stripACF)
	{	
		var acts1 = message.as || message.updates;
		for( var i=0; i < acts1.length; i++ )
		{
			
			var act1 = acts1[i];	
			//check if the message has slideId attribute
			//if it does, load the slide
			if(act1.p_sid!=null){
				//load slide to sorter
					window.pe.scene.slideSorter.loadSlideIdToSorter(act1.p_sid);

				//It is a task insertElement message					
				if(act1.p_isnat == "true" && act1.s){
		  			var eventData = [act1];
		  			concord.util.events.publish(concord.util.events.taskEvents_eventName_undoOTFailedTaskHolder, eventData);
				}								
			}
		}
		var msgType = message.type;
		if(msgType == "resetContent" || msgType == "rc"){
			// ACF
			var acf = concord.util.acf;
			var dataContent = act1.data;
			// The data in "resetContent" in msg.data, in "rc" in msg.updates[0].data
			if(msgType == "resetContent")	
				dataContent = message.data;
			if (!stripACF && acf.suspiciousHtml(dataContent))
			{
				console.log("malicious html fragment detected: " + dataContent);
				return;
			}
			
			//publish clean up event here
			//concord.util.events.slideSorterEvents_eventName_cleanupOldContentBeforeReset
			var eventData = [{'eventName': concord.util.events.slideSorterEvents_eventName_cleanupOldContentBeforeReset}];
			concord.util.events.publish(concord.util.events.slideSorterEvents, eventData);
			
			window.pe.scene.slideSelectedIdforResetContent = window.pe.scene.slideSelectedId;
			if(window.pe.scene.slideEditor.spareBox && window.pe.scene.slideEditor.spareBox.isDirty)
				window.pe.scene.slideEditor.spareBox.synchAllData( window.pe.scene.slideEditor.spareBox.getContentEditNode());
			window.pe.scene.slideEditor.deSelectAll();
			
			window.pe.scene.slideSorter.presHtmlContent = dataContent;
			window.pe.scene.slideSorter.stopPartialLoading();
			
			window.pe.scene.slideSorter.prepPresContent(window.pe.scene.slideSorter.presHtmlContent);
			window.pe.scene.slideSorter.editor.setData(window.pe.scene.slideSorter.presHtmlContent);
			//no need to clear undo stack if reset content from master Style changes
			//window.pe.scene.slideSorter.editor.fire("resetUndo");
			return;
		}
		
		this._toggleTableContentEditableState(message, docKey, false);
		
		var lockIconNode = null;
		var goOnNext = true;
		if(docKey == PROCMSG.SECK_DOC || docKey == PROCMSG.CANVAS_DOC){
			var fromRemote = message.updates[0].remoteFlag;
			var mainNodeId = message.updates[0].p_nid;
			var msgTP = message.updates[0].t;
			if((message.type == "rn") && (message.updates.length == 2) && mainNodeId && fromRemote){
				var userObj = this._getUserObject(message.user_id);
				var isLocked = pe.scene.isSlideNodeLocked(mainNodeId);
				
				if(userObj.id && isLocked){
					window['pe'].scene.slideNodeLockStatusRemoveEntry(mainNodeId, userObj);
					this.inherited(arguments);
					
					var entry = {'drawFrameId':mainNodeId, 'user':userObj, 'action':'inEdit'};
					window['pe'].scene.slideNodeLockStatusAddEntry(entry);
					
					goOnNext = false;
				}
				
			}
			else if((message.type == "e") && (message.updates.length == 1) && mainNodeId && fromRemote &&(msgTP == "de"))
				{
				
					window['pe'].scene.slideNodeLockStatusRemoveEntry(mainNodeId, null);

				}
		}

		if(goOnNext){
			this.inherited(arguments);
		}
		
		this._toggleTableContentEditableState(message, docKey, true);
		//Let's check if this is a text type message
		//We me may need to resize the content box
		if (message.type==MSGUTIL.msgType.Text && docKey==PROCMSG.CANVAS_DOC){
			//this._postInsertDeleteText(msg);
		} else if (message.type == MSGUTIL.msgType.contentBoxEditMode){
			console.log('process contentBoxEditMode message');
			var userObj = this._getUserObject(message.user_id);
			if(message.editMode&&(this._scene.authUser.e.id!=message.user_id)){
//				var entry = {'drawFrameId':message.elemId,'user':userObj,'action':'inEdit','initialEditServerSeq':message.initialEditServerSeq};
				// handle conflicted lock message here
				var entry = {'drawFrameId':message.elemId,'user':userObj,'action':'inEdit'};
				window['pe'].scene.slideNodeLockStatusAddEntry(entry);
			} else{
				window['pe'].scene.slideNodeLockStatusRemoveEntry(message.elemId,userObj);				
			}
		} else {
			if (docKey==PROCMSG.SECK_DOC || docKey==PROCMSG.CANVAS_DOC) {
				var actType = MSGUTIL.actType;
				var acts = message.as || message.updates;
				for( var i=0; i < acts.length; i++ )
				{
					var act = acts[i];	
					if (act.t == actType.insertElement || act.t == actType.deleteElement) {
						var id = message.updates[0].tid;
						var contentBox = this._getTargetBox2(id);
						if (contentBox){
							if(docKey==PROCMSG.SECK_DOC ) {
								if(contentBox.editModeOn){
									if (typeof message.updates[0].undoFlag != undefined && message.updates[0].undoFlag != null && message.updates[0].undoFlag){
										var fromUndo=true;
										contentBox.editorAdjust(null,null,fromUndo);
									}
									//handle focus lost issue for FF in Table
									if(contentBox.editor && contentBox.editor.isTable)
										dojo.isFF && window.pe.scene.setFocusToSlideEditor();	
										
									if(PresCKUtil.isEditModeOn())
										contentBox.moveCursorToLastEditableElement();
									
								}
								
							}
							
							if (docKey==PROCMSG.CANVAS_DOC){
								if (typeof message.updates[0].undoFlag != undefined && message.updates[0].undoFlag != null && message.updates[0].undoFlag
										&& typeof message.updates[0].placeHolderFlag != undefined && message.updates[0].placeHolderFlag != null && message.updates[0].placeHolderFlag) {
									
									contentBox.makeNonEditable(null,true);//D15602
									
									if (window.pe.scene.slideEditor.SINGLE_CK_MODE){
										if (contentBox.boxRep!=null){
											contentBox = contentBox.boxRep.unLoadSpare(); //unload spare and return original contentBox
										}
									}		
									
									if(contentBox)
									{
										contentBox.isEmptyCBPlaceholder = true;
										contentBox.isDirty = false;
										var tmpNode = dojo.query(".draw_frame_classes",contentBox.contentBoxDataNode);
										if ((tmpNode.length > 0) && (tmpNode[0].firstChild)){
											var targetNode = tmpNode[0].firstChild;
											var family = dojo.attr(contentBox.mainNode,'presentation_class');
											if (family=='outline'){
												if(targetNode.firstChild)
												{
													targetNode = targetNode.firstChild;
													dojo.addClass(targetNode,PresConstants.CONTENT_BOX_OUTLINE_CLASS);
												}
												else
												{
													var li = dom.createElement('li');
													dojo.addClass(li,PresConstants.CONTENT_BOX_OUTLINE_CLASS);
													targetNode.appendChild(li);
													targetNode = li;
												}	
												
											}
											else if (family == 'title'){					
												dojo.addClass(targetNode,PresConstants.CONTENT_BOX_TITLE_CLASS);
											} else if (family == 'subtitle'){
												dojo.addClass(targetNode,PresConstants.CONTENT_BOX_SUBTITLE_CLASS);
											} else if (family == 'notes'){					
												dojo.addClass(targetNode,PresConstants.CONTENT_BOX_NOTES_CLASS);
											}
											dojo.addClass(targetNode,'defaultContentText');
											family = null;
										}
									}
									tmpNode = null;
									window.pe.scene.setFocusToSlideEditor();// D15238 - Established focus to slideEditor after exiting the box from edit mode
								} 
								//D40692: [IE][Co-editing]Table  which created by other users on Safari height is not correct on IE remove th three line.
								//D29076: [TODO][IE]Table height bigger than draw frame after undo clear content operation add follow three line.
								if(contentBox && !contentBox.editModeOn && (contentBox.contentBoxType==PresConstants.CONTENTBOX_TABLE_TYPE)){
									var isMobile = concord.util.browser.isMobile();
									if (isMobile && !window.g_noimprove && !window.g_updatetableheight)
										setTimeout(dojo.hitch(PresTableUtil, PresTableUtil.updateDFNodeWithContentHeight, contentBox), 0);
									else PresTableUtil.updateDFNodeWithContentHeight(contentBox);
								}
							}
							else if (contentBox.contentBoxType == PresConstants.CONTENTBOX_NOTES_TYPE) {
								if(act.t == actType.insertElement){
									contentBox.adjustSpeakerNotesBackGround();
									//make sure notes does not have duplicate draw_frame_classes
									contentBox.checkForDuplicateDFC();
								}
							}																									
						}							
					}
				}
			}
		}
		PresCKUtil.setEditFlagInProcMsg(message, dom, this.getScope(dom));
	},
	
	processPresMsg: function(msg,isUndoRedo){
		var msgType = msg.type;
		console.log('processPresMsg');
		//console.log(PresConstants.LOG_HERDER, dojo.toJson(msg));
		var continueProcess = true;
		if (msgType == MSGUTIL.msgType.slideSelected){
			//remove the previous slideSelected from the slideNodeLockObj by this user if any
			var user = this._getUserObject(msg.user_id);		
			var slideNodeLockEntriesByThisUser = window['pe'].scene.getSlideNodeLockedEntryForUser(user);
			if(slideNodeLockEntriesByThisUser!=null && slideNodeLockEntriesByThisUser.length>0){
				for(var i=0; i< slideNodeLockEntriesByThisUser.length; i++){
					var action= slideNodeLockEntriesByThisUser[i].action;
					if(action == "slideSelected"){
						var entryId = slideNodeLockEntriesByThisUser[i].drawFrameId;
						window['pe'].scene.slideNodeLockStatusRemoveEntry(entryId,user);
					}
				}
			}
			
			//publish to slideSorter
			//add user locking new slide
			var entry = {'drawFrameId':msg.elemId,'user':user,'action':'slideSelected'};			
			window['pe'].scene.slideNodeLockStatusAddEntry(entry);			
			var eventData = [{eventName: concord.util.events.coeditingEvents_eventName_slideSelectedByOtherUser, msg:entry}];
			concord.util.events.publish(concord.util.events.coeditingEvents, eventData);
			continueProcess =  false;					
		}else if (msgType == MSGUTIL.msgType.doAssignment){
			var entry = {'slideId':msg.slideId, 'taskId':msg.taskId, 'type':msg.actionType};
			//publish to slideSorter
			var eventData = [{eventName: concord.util.events.coeditingEvents_eventName_doAssignmentByOtherUser, msg:entry}];
			concord.util.events.publish(concord.util.events.coeditingEvents, eventData);
			continueProcess =  false;	
		}else if (msgType == MSGUTIL.msgType.applyTemplate){ //JMT - TODO: verify flow with Tintin 
			var entry = {'templateData':msg.templateData,'action':'applyTemplate'};
			//publish to slideSorter
			var eventData = [{eventName: concord.util.events.undoRedoEvents_eventName_applyTemplate, msg:entry}];
			concord.util.events.publish(concord.util.events.undoRedoEvents, eventData);
			continueProcess =  false;	
		}else if (msgType == MSGUTIL.msgType.templateApplied){
			var entry = {'newTemplateCss':msg.newTemplateCss,'oldTemplateCss':msg.oldTemplateCss,'action':'templateApplied'};
			//publish to slideSorter
			var eventData = [{eventName: concord.util.events.coeditingEvents_eventName_templateAppliedByOtherUser, msg:entry}];
			concord.util.events.publish(concord.util.events.coeditingEvents, eventData);
			continueProcess =  false;	
		}else if (msgType == MSGUTIL.msgType.layoutApplied){
			var entry = {'slideId':msg.slideId,'action':'layoutApplied'};
			//publish to slideSorter
			var eventData = [{eventName: concord.util.events.coeditingEvents_eventName_layoutAppliedByOtherUser, msg:entry}];
			concord.util.events.publish(concord.util.events.coeditingEvents, eventData);
			continueProcess =  false;	
		}else if (msgType == MSGUTIL.msgType.addNewComment){					
			var eventData = [{'eventName': concord.util.events.commenttingEvents_eventName_addCommentIcon, 'drawFrameId':msg.elemId, 'commentId':msg.commentId}];
			concord.util.events.publish(concord.util.events.coeditingEvents, eventData);
			continueProcess =  false;	
		}else if (msgType == MSGUTIL.msgType.deleteComment){					
			var eventData = [{'eventName': concord.util.events.commenttingEvents_eventName_deleteCommentIcon, 'drawFrameId':msg.elemId, 'commentId':msg.commentId}];
			concord.util.events.publish(concord.util.events.coeditingEvents, eventData);
			continueProcess =  false;	
		}else if (msgType == MSGUTIL.msgType.addSlideComment){					
			var eventData = [{'eventName': concord.util.events.commenttingEvents_eventName_addSlideCommentIcon, 'slideId':msg.elemId}];
			concord.util.events.publish(concord.util.events.coeditingEvents, eventData);
			continueProcess =  false;	
		}else if (msgType == MSGUTIL.msgType.delSlideComment){					
			var eventData = [{'eventName': concord.util.events.commenttingEvents_eventName_delSlideCommentIcon, 'slideId':msg.elemId}];
			concord.util.events.publish(concord.util.events.coeditingEvents, eventData);
			continueProcess =  false;	
		} else if (msgType == "resetContent" || msgType == "rc"){
			/* rc is handled in the processMessage() now, to be able to let transform() process the message first to handle conflict
			//publish clean up event here
			//concord.util.events.slideSorterEvents_eventName_cleanupOldContentBeforeReset
			var eventData = [{'eventName': concord.util.events.slideSorterEvents_eventName_cleanupOldContentBeforeReset}];
			concord.util.events.publish(concord.util.events.slideSorterEvents, eventData);
	
			
			window.pe.scene.slideSorter.presHtmlContent = msg.data;
  			window.pe.scene.slideSorter.prepPresContent(window.pe.scene.slideSorter.presHtmlContent);
  			window.pe.scene.slideSorter.editor.setData(window.pe.scene.slideSorter.presHtmlContent);
  			//no need to clear undo stack if reset content from master Style changes
  			//window.pe.scene.slideSorter.editor.fire("resetUndo");		
  			continueProcess =  false;
  			*/
  			
		}else if (msgType == MSGUTIL.msgType.slideShowCoview){
			var userObj = this._getUserObject(msg.user_id);
			window['pe'].scene.handleSlideShowCoeditFromOtherUser(msg.curSlide, msg.totalSlides, msg.slideContent, userObj);
			continueProcess =  false;					
		}else if (msgType == MSGUTIL.msgType.slideShowCoviewStart){
			var userObj = this._getUserObject(msg.user_id);			
			var inviteeList = (msg.inviteeList!=null && msg.inviteeList.length>0)? msg.inviteeList.split(","): [];
			window['pe'].scene.handleSlideShowCoviewStartFromOtherUser(msg.curSlide, msg.totalSlides, msg.slideContent, userObj,inviteeList);
			continueProcess =  false;					
		}else if (msgType == MSGUTIL.msgType.slideShowCoviewEnd){
			var userObj = this._getUserObject(msg.user_id);
			window['pe'].scene.handleSlideShowCoviewEndFromOtherUser(userObj);
			continueProcess =  false;					
		}else if (msgType == MSGUTIL.msgType.slideShowCoviewJoin){
			var userObj = this._getUserObject(msg.user_id);			
			window['pe'].scene.handleUserJoingingCoview(userObj,msg.userHostId);
			continueProcess =  false;					
		}else if (msgType == MSGUTIL.msgType.slideShowCoviewLeft){
			var userObj = this._getUserObject(msg.user_id);
			window['pe'].scene.handleUserLeavingCoview(userObj);
			continueProcess =  false;					
		}else if (msgType == MSGUTIL.msgType.removeUserLock){
			var userObj = this._getUserObject(msg.user_id);
			// when handling coediting fail over, sometimes userObj will be null
			if (userObj) {
				window['pe'].scene.handleRemoveUserLocks(userObj);
				continueProcess =  false;
			}
		}else if(msgType == MSGUTIL.msgType.requestLockStatus){
			window['pe'].scene.handleRequestLockStatus();
			continueProcess =  false;								
		}else if(msgType == MSGUTIL.msgType.Attribute && isUndoRedo!=true){
			//need to check if it is a change presentation_presentation-page-layout-name attribute
			//if so, need to check if undo stack has the same attribute change for the same slide, if so, remove the msg from undo stack
			//it means the slide on which user has changed layout, is about to change layout by other user, so need to invalidate this user's change layout undo
			//so we don't undo the change layout by other user coming in.
		// #9340 OT conflict happened need the undo message to do rollback.
//			var acts1 = msg.updates;
//			if(acts1!=null){
//				for( var i=0; i < acts1.length; i++ )
//				{
//					var act1 = acts1[i];	
//					if(act1.a!=null){ //if contain change layout name attribute
//						for(var m in act1.a){
//							if(m == "presentation_presentation-page-layout-name"){
//								var undoStack = window.pe.scene.getEditor().getStack();
//								if(act1.p_sid!=null && undoStack!=null){
//									for(var j=0; j<undoStack.length; j++){
//										var msgList1 = undoStack[j].redo;
//										if(msgList1!=null && msgList1.length>0){
//											var msg0 = msgList1[0]; //check the first message, the layout name attribute change is always the first message
//											if(msg0.type == MSGUTIL.msgType.Attribute && msg0.updates!=null && msg0.updates.length>0){
//												var msg0Act = msg0.updates[0];
//												if(msg0Act.a!=null && msg0Act.p_sid == act1.p_sid){
//													for(var z in msg0Act.a){
//														if(z == "presentation_presentation-page-layout-name"){
//															//if same slide change layout, remove this undo msgList from undo stack
//															undoManager.removeSingleAction(j);
//															j--;
//														}
//													}
//												}
//												
//											}
//										}
//									}
//								}
//							}
//						}
//						
//					}
//				}
//			}
		}
		return continueProcess;
	},
		
	processRemoteMsg: function(msg) {
		var tstart = new Date();
		
		if (window.g_noimprove)
			console.log(dojo.toJson(msg));
		var docs = this.getLocalDocuments(msg);					
		// Process message		
		for (var i in docs){
			if(i  == PROCMSG.SECK_DOC &&
				(msg.updates[0].flag == "doi"||msg.updates[0].flag =="cs")){
				this.processStructChangeMsg(msg,docs[i],i);
			}else
				this.processMessage(msg, docs[i],i);
		}
		
		if (msg && msg.type && msg.type == MSGUTIL.msgType.Table) {
		  // attributes may have changed. notify listeners
		  var eventData = [ { 'eventName' : concord.util.events.slideEditorEvents_eventName_attributeChange } ];
		  concord.util.events.publish(concord.util.events.slideEditorEvents, eventData);
		}	 
		
		var tend = new Date();
		console.log("message type: " + msg.type + "; elemId: " + msg.elemId);
		console.log("pres.procMsg.processRemoteMsg: " + (tend.getTime() - tstart.getTime()));
	},
	
	isMsgInSlideSelected: function(msg){		
		var curSlideInEditorId = window['pe'].scene.getSlideSelectedId();
		var msgId = msg.updates[0].tid;
		var editorNode = dojo.byId(curSlideInEditorId);
		var elementInEditor = null;
		if (editorNode){
			if (editorNode.id == curSlideInEditorId) 
				return true;
			elementInEditor = dojo.query("#"+msgId, editorNode);
			if(elementInEditor!=null && elementInEditor.length>0 ){
				return true;
			}	
		}			
		return false;
	},
	
	_setOtherDocs: function(msgType, actId, docs) {
		if (!docs) return;
		if (msgType!="applyTemplate" && msgType!="rc"){
			var selectedSlide = this._scene.getSlideSelectedId();
			if(selectedSlide == actId) {
				docs[this.CANVAS_DOC]=window.document;
			} else {
				var editorNode = dojo.byId(selectedSlide);
				var children = dojo.query('#' + actId, editorNode);
				if(children && children.length > 0) {
					var contentBox = this._getTargetBox2(actId);
//					if(contentBox && contentBox.editModeOn) {
					if(contentBox && contentBox.editor) {
						docs[this.SECK_DOC]= contentBox.editor.document.$;
					}
					
					docs[this.CANVAS_DOC]=window.document;
					contentBox = null;
				}
			}
		}
	},
	
	getLocalDocuments: function(msg) {
		var acts = msg.updates;
		var msgType = msg.type;
		var docs = [];
		docs[this.SORTER_DOC]=this._getSorterDocument();
		
		var actsLen = acts ? acts.length : 0;
		for (var i = 0; i < actsLen; i++) {
			this._setOtherDocs(msgType, acts[i].tid, docs);
		}
		
		return docs;
	},
	
	getTargetBox: function(msg) {
		var acts = msg.updates;
		var msgType = msg.type;
		var sid  = acts[0].tid; 	// id of node being affected 
		var selectedSlide = this._scene.getSlideSelectedId();
		var editorNode = dojo.byId(selectedSlide);
		var children = dojo.query('#' + sid, editorNode);
		if(children && children.length > 0) {
			return this._getTargetBox2(sid);
		} else {
			return null;
		}
	},
	
	_postInsertElement: function(node, docKey){
		if ((node) && (dojo.hasClass(node.$,'draw_frame'))){
			if(docKey==PROCMSG.CANVAS_DOC){
				var selectBox = false;
				this._slideEditor.widgitizeContent(node.$,false,selectBox,false);
				//D15959 - ensure correct position of box			
				var contentBox = this._slideEditor.getRegisteredContentBoxById(node.$.id);
				if (contentBox){
					contentBox.adjustPositionForBorder();
					window.pe.scene.slideEditor.correctIeNumberingList();
				}
				
				if(this._handleConflictZIdxFlag == true) {
					var eventData = [ { 'eventName' : concord.util.events.LocalSync_eventName_conflictingZindex, "id":node.getId()} ];
					concord.util.events.publish(concord.util.events.coeditingEvents, eventData);
				}	
			}else if(docKey==PROCMSG.SORTER_DOC){
				if(dojo.attr(node.$, 'comments') == 'true') {
					var commentsId = dojo.trim(dojo.attr(node.$, 'commentsId'));
					var commentsArray = commentsId.split(' ');
					for(var i=0;i<commentsArray.length;i++) {
						concord.widgets.sidebar.CommentsController.publishUndoDeleteEvent(commentsArray[i]);	
					}			
				}
			}
		} if((node) && (dojo.hasClass(node.$,'taskContainer')) && (docKey==PROCMSG.SORTER_DOC))	{
			//If just added a taskcontainer then we need to remove any <br> tags that insertElement function code added
			var brTags = dojo.query('br',node.$);
			for (var i=0; i<brTags.length; i++){
				var br = brTags[i];
				br.parentNode.removeChild(br);
			}
		}				
	},
	
	//TODO remove, no caller
	_postInsertDeleteText: function(msg){
		var id = msg.updates[0].tid; //id of paragraph ???
		var contentBox = this._getTargetBox2(id);
		if(contentBox) contentBox.editorAdjust(null,false);
	},
	
	_postAttrChange: function(docKey, act) {	
		if (docKey==PROCMSG.CANVAS_DOC){
			// When process a message, use related doc(sorter, canvos and ckeditor)
			// passed from process message. Do not always use sorter doc
			var contentBox = this._getTargetBox(act.tid, this._getCanvasDocument());
			if (contentBox){
				if (act.s && act.s.top && act.s.left){
					contentBox.adjustPositionForBorder();
					
					//D34566 [Co-editing] User A resize table, then user B resize same table horizontally, table height is incorrect.
					//Needs to force to update presrowheight for table.
					if(contentBox.contentBoxType == PresConstants.CONTENTBOX_TABLE_TYPE){
						contentBox.setPresRowHeight(true);
					}
				}
				else if (act.s && act.s.top) 
					contentBox.adjustPositionForBorder(null,null,'top');
				else if (act.s && act.s.left) 
					contentBox.adjustPositionForBorder(null,null,'left');					
				
				if (dojo.isIE) 
					contentBox.adjustContentDataSize();
				
				contentBox.updateCoeditAttributeChange();
				
				if (contentBox.boxSelected){// a message may come in that changes the class so we need to reset.
					// No need handle this two classes for connector shape
					// It has its own similar class
					if (!PresCKUtil.isConnectorShape(contentBox.mainNode)) {
						dojo.removeClass(contentBox.mainNode,'resizableContainer');
						dojo.addClass(contentBox.mainNode,'resizableContainerSelected');
					}
					contentBox.showHandles();
				}
				
				/// *** special logic for shape ***
				/// After undo the size/pos changed shape in text editing mode,
				/// the pos/size for spare will be covered in undo.
				/// But the original will keep the old value, which need to sync
				///
				/// It's OK for shape in none text editing mode. 
				/// Because the undo msg will apply on the original node
				///
				if (contentBox.contentBoxType == PresConstants.CONTENTBOX_GROUP_TYPE) {
					contentBox.syncPosSizeForRepBox();
				}
			}
		}							
	},
	
	_getTargetBox2: function(elementId) {
		try {
			var drawFrameId = this._slideEditor.getParentDrawFrameId(elementId);
			var contentObj = this._slideEditor.getRegisteredContentBoxById(drawFrameId);
			// If a group then return the actual grouped box
			if(!contentObj)
				return;
			if (contentObj.opts.contentBoxType == PresConstants.CONTENTBOX_GROUP_TYPE) {
				return contentObj.getGContentBoxById(contentObj.getParentGDrawFrameId(elementId));
			} else {
				return this._slideEditor.getRegisteredContentBoxById(drawFrameId);
			}
		}
		catch(e) {
			return null;			
		}
	},
	
	_getTargetBox: function(elementId,doc) {
		var d = (doc)? doc: this._getSorterDocument();
		var selectedSlide = d.getElementById(this._scene.slideSelectedId);
		var childrenNodes = dojo.query("#"+elementId, selectedSlide);
				
		if(childrenNodes!=null & childrenNodes.length>0) {
			var drawFrameId = this._slideEditor.getParentDrawFrameId(elementId);
			selectedSlide = null;
			childrenNodes = null;
			d = null;
			return this._slideEditor.getRegisteredContentBoxById(drawFrameId);
		} else {
			return null;
		}
	},
	
	_getSorterDocument: function() {
		return this._slideSorter.editor.document.$;
	},
	
	_getCanvasDocument: function(){
		return window.document;
	},
	
	_getUserObject: function(userId){
		var userObj = {'disp_name':'','email':'','id':userId};
		var userProfile = ProfilePool.getUserProfile(userId);
		if(userProfile !=null){
			userObj.disp_name = userProfile.getName();
			userObj.email = userProfile.getEmail();
		}
		return userObj;		
	},
	_setUndoFlagInMsgAct: function(msg){
	   for (var i=0; i< msg.updates.length;i++){
		   msg.updates[i].undoFlag=true;
	   } 
	   return msg;
	},
	
	setRollbackInMsgAct: function(msg){
		for (var i=0; i< msg.updates.length;i++){
			msg.updates[i].rollBack=true;
		}
		return msg;
	},
	
	_setRemoteFlagInMsgAct:  function(msg){
		   for (var i=0; i< msg.updates.length;i++){
			   msg.updates[i].remoteFlag=true;
		   } 
		   return msg;
	},
	
	_adjustTableFocus:function(target,act){
		//presentations doesn't need this anymore since only one coediting user can edit the table
	},
	
	insertElement: function(doc,act){
		//Txt typing (p_tt) messages will come as element coedit
		//Need to filter these here.
		//They show up as a delete Element followed by insert element
		//We are preventing the delete to happen since the insert will
		//happen as an innerHTML istead of a dom appendchild for performance reasons.
		try{
			if(act.p_iclb && !PROCMSG.notNeedUpdateListStyle)
				PresCKUtil.updateListBeforeStyleSheet(doc,act.p_iclb);			
		}catch( evt){
			console.log("===> error occur when apply list css style messages:"+ act.p_iclb);
		} 
		
		if (act.p_tt == true){
			var newElement = doc.getElementById(act.p_nid);
			
			if(!newElement){
				console.info("===> Error occur when executing ie message, there is no target node to insert into.");
				return;
			}
			
			if (act['s'].toLowerCase().indexOf('<tbody') === 0){
				var tempDiv = doc.createElement('div');
				tempDiv.innerHTML = '<table>' + act['s'] + '</table>';
				//let's clean selected cells if it is sorter
				if (!dojo.hasClass(doc.body, 'slideEditor')){ //then this is sorter
					PresCKUtil.cleanSelectedSTCells(tempDiv);
				}
				// replaceChild has memory leak innerHTML for a tbody fails in some browsers
				// newElement.parentNode.replaceChild(tempDiv.firstChild.firstChild, newElement);
				var tbodyElement = newElement;
				var tableElement = newElement.parentNode;
				var newTbodyElement = tempDiv.firstChild.firstChild;
				dojo.destroy(tbodyElement);
				//S36075, we should not remove colgroup from table element
//				tableElement.innerHTML ="";
				//tableElement.innerHTML = tempDiv.firstChild.innerHTML; //in ie this get a error
				//S26973: Uncertain operation leads one more duplicated table or text in an unwanted position in slide editor
				tableElement.appendChild(newTbodyElement);
				if ( this.getScope(doc) == 'ck_canvas' && window.pe.scene.getEditor()){
					// D16913 put cursor back into a table cell after replacing the tbody 
					var contentBox = window.pe.scene.getEditor().contentBox;
					if ( contentBox){
						contentBox.moveCursorToLastEditableElement();
					}
				}
				concord.text.tools.destroyNode(tempDiv);
				tempDiv = null;
				tbodyElement = null;
				tableElement = null;
				newElement = null;
				//D7279 may need to update stack
				this.updateUndoStack(doc,act);
				
				return CKEDITOR.dom.node(newTbodyElement);
			} else/* if(act['s'].toLowerCase().indexOf('<div')>=0)*/{
				var newContent = CKEDITOR.dom.element.createFromHtml(act['s']);
				if(dojo.isIE){
					newElement = new CKEDITOR.dom.node(newElement);		
					newContent.insertBefore(newElement);
					if (this.getScope(doc) != 'sorter' && window.pe.scene.getEditor() && !act['remoteFlag']){
						if(newElement.$.contentEditable)
							newContent.$.contentEditable = true;
					} else {
						if(newElement.$.contentEditable)
							newContent.$.contentEditable = false;
					}
					concord.text.tools.destroyNode(newElement);
					PresCKUtil.removeEmptyText( newContent.$);
					
					//D7279 may need to update stack
					this.updateUndoStack(doc,act);
					return newContent;
				}else{
					newElement.innerHTML = newContent.$.innerHTML;
					// for some reason, we can end up with blank text nodes, which
					// can cause issues with range determination. remove any blanks
					// (which, from my observations, occur after SPANs).
					PresCKUtil.removeEmptyText( newElement );
					
					//D7279 may need to update stack
					this.updateUndoStack(doc,act);
					concord.text.tools.destroyNode(newContent);
					newContent = null;
					return CKEDITOR.dom.node(newElement);	
				}

			}
			
		}
		
		if (act.placeHolderFlag == true){//D6887 && D7319
			
			var newElement = doc.getElementById(act.tid);
			if(newElement)
			{
				PresCKUtil.removeAllChildren(newElement);
				
				// 14038 remove all siblings of the newElement when adding back default text
				var theParent = newElement.parentNode;
				var childNodes = theParent.childNodes;
				for(i=0; i<childNodes.length; i++) {
					if (childNodes[i] != newElement) {
						dojo.destroy(childNodes[i]);
					}
				}
				childNodes = null;
			}
		}
		
		var isNodeASlide = act.p_isnas;
		var isNodeADrawFrame = act.p_isnad;
		var isNodeASlideWrapper = act.p_isnasw;
		var nodeId = act.p_nid;
		var element = null;
		var isFromUndo = (act.undoFlag!=null)? act.undoFlag: false;
		var isRollBack = (act.rollBack)? act.rollBack: false;
		var isMsgHasInserElemDeleteElem =  (act.has_ie_de_inlist!=null)? act.has_ie_de_inlist: false;
		if(isFromUndo == true || isMsgHasInserElemDeleteElem==true){
			this._handleConflictZIdxFlag = false;  // do not handle conflict zIndex if it is fromUndo or fromLayout that has insetElement and deleteElement flag on each message
		}else{
			this._handleConflictZIdxFlag = false;  // This was added for D7265 but causes D14496 turning feature off for now.
		}
		
		var isSlideMove= (act.slideMove!=null)? act.slideMove: false;
		if (this.getScope(doc)=='sorter'){ //if scope is sorter document			
			var nextSibling = doc.getElementById(act.refId);
			var parent = doc.getElementById(act.tid);
			if (isNodeASlideWrapper==true){
				//publish an event to slide sorter
				element = this.inherited(arguments);
//				if (!isFromUndo){
					var eventData = [{'eventName': concord.util.events.coeditingEvents_eventName_processMessageInsertSlideWrapper,'slideElemWrapper':element.$, 'nextSlideWrapper':nextSibling, 'slideWrapperParent':parent, 'isFromUndo': isFromUndo, 'isRollBack': isRollBack, 'idx':act.idx}];
					concord.util.events.publish(concord.util.events.coeditingEvents, eventData);
//				}else{
//		    		//publish an event to slide sorter
//	   				var eventData = [{'eventName': concord.util.events.undoRedoEvents_eventName_processMessageInsertSlideWrapper,'slideElemWrapper':element, 'nextSlideWrapper':nextSibling, 'slideWrapperParent':parent, 'isFromUndo':true}];
//					concord.util.events.publish(concord.util.events.undoRedoEvents, eventData);
//				}
				if(isSlideMove == true){
					window.pe.scene.slideSorter.cleanUpImgDropPosFunc();
				}
			} else if (isNodeADrawFrame){
			// jmt - comment this out wrk around in case D39536 is invalid
				var parent =doc.getElementById(act.tid);
				var target = new CKEDITOR.dom.element(parent);
				element = CKEDITOR.dom.element.createFromHtml(act.s);
				//target.append(element);
				var ref = null;
				if(act.idx > 0)
					ref = MSGUTIL.getChildNode( target,act.idx - 1);
				else
					ref = MSGUTIL.getChildNode( target,0); 	
				if( ref )
					(act.idx>0)? element.insertAfter(ref):element.insertBefore(ref);
				else
				{
					target.append(element);
					console.log("=====================the dup case1??");
				}
			} else {
				// process br hideInIE for coedit session sorter (48199)
				var element = CKEDITOR.dom.element.createFromHtml(act.s);
				if (element && element.$ && element.$.nodeName.toLowerCase() == 'br' && dojo.hasClass(element.$, 'hideInIE')) {
					var target = doc.getElementById(act.tid);
					if (target == null)
						return element;			
					
					if (act.isb){
						var p = new CKEDITOR.dom.element(target);
						p.appendBogus();
					}
				} else {	// run super
					element = this.inherited(arguments);		
				}
			}		
		} else {
			// process br hideInIE for coedit session canvas (48199)
			var element = CKEDITOR.dom.element.createFromHtml(act.s);
			if (element && element.$ && element.$.nodeName.toLowerCase() == 'br' && dojo.hasClass(element.$, 'hideInIE')) {
				var target = doc.getElementById(act.tid);
				if (target == null)
					return element;			
				if (act.isb){
					var p = new CKEDITOR.dom.element(target);
					p.appendBogus();
				}
			} else {	
				if (this.getScope(doc)=='canvas' && isNodeADrawFrame){ //D5689
					var parent =doc.getElementById(act.tid);
					if(parent!=null){
						var target = new CKEDITOR.dom.element(parent);
						element = CKEDITOR.dom.element.createFromHtml(act.s);
						//target.append(element);
						var ref = null;
						if(act.idx > 0)
							ref = MSGUTIL.getChildNode( target,act.idx - 1);
						else
							ref = MSGUTIL.getChildNode( target,0); 	
						
						if( ref ) {
							(act.idx>0)? element.insertAfter(ref):element.insertBefore(ref);
						}
						else {
							target.append(element);
							console.log("=====================the dup case2??");
						}
					}
				} else { // run super
					element = this.inherited(arguments);
				}
			}
		}
		return element;	
	},
	
	deleteElement: function(doc,act){
		//Txt typing (p_tt) messages will come as element coedit
		//Need to filter these here.
		//They show up as a delete Element followed by insert element
		//We are preventing the delete to happen since the insert will
		//happen as an innerHTML istead of a dom appendchild for performance reasons.

		try{
			if(act.p_iclb && !PROCMSG.notNeedUpdateListStyle)
				PresCKUtil.updateListBeforeStyleSheet(doc,act.p_iclb);			
		}catch( evt){
			console.log("===> error occur when apply list css style messages:"+ act.p_iclb);
		} 
		
		//console.log('delete by pres');
		if (typeof act.p_tt!='undefined' && act.p_tt!=null && act.p_tt==true ){
			return;
		}
		
		
		// Since we do no transformUndo for prezObjects
		// we need to ensure that the idx is correct 
		if (this.isMsgForPresentationObj({'updates':[act]})){
			if (typeof act.p_nid!= 'undefined' && act.p_nid!=null && act.p_nid.length>0){
				var node = doc.getElementById(act.p_nid);
				if (node!=null){
					var  ckNode =  CKEDITOR.dom.node(node);
					if (ckNode!=null){
						act.idx = ckNode.getIndex();
					}
					ckNode = null;
					node = null;
				}
			}
		}
		if (this.getScope(doc)=='sorter'){ //if scope is sorter document
			//console.log('delete for sorter');
			var isNodeASlide = (act.p_isnas==null)? false :act.p_isnas;
			var isNodeASlideWrapper = (act.p_isnasw==null) ? false :act.p_isnasw ;
			var nodeId = act.p_nid;
//			var slideSelectedId = this._scene.slideSelectedId;
//			var slideSelected = doc.getElementById(slideSelectedId);
//			var targetNodeParent  = new CKEDITOR.dom.node(doc.getElementById(act.tid));
			var targetNode  = (nodeId==null || nodeId=='')? null : doc.getElementById(nodeId);
			//var sess = this._scene.session;		
			var isFromUndo = (act.undoFlag!=null)? act.undoFlag: false;
			var isRollBack = (act.rollBack)? act.rollBack: false;
			var isSlideMove= (act.slideMove!=null)? act.slideMove: false;
			if(targetNode !=null && isNodeASlideWrapper == true){
	    		var targetNodeNextSliblingSlideWrapperId = act.refId;
	    		var targetNodeId = targetNode.id;
	    		//var targetNodeSlideWrapperParent = targetNode.parentNode;
	    		//targetNodeSlideWrapperParent.removeChild(targetNode);
	    		
	    		var slideId = "";
	    		if(targetNode.firstChild!=null){
	    			slideId = targetNode.firstChild.id;
	    		}
	    		
	    		var eventData = [{'eventName': concord.util.events.coeditingEvents_eventName_preProcessMessageDeleteSlide, 'slideWrapperDeletedId':targetNodeId,'slideDeletedId':slideId,'isFromUndo':isFromUndo, 'isRollBack':isRollBack}];
	    		concord.util.events.publish(concord.util.events.coeditingEvents, eventData);
	    		
	    		this.inherited(arguments);
    			eventData = [{'eventName': concord.util.events.coeditingEvents_eventName_processMessageDeleteSlide, 'slideWrapperDeletedId':targetNodeId,'slideDeletedId':slideId,'nextSlideWrapperId':targetNodeNextSliblingSlideWrapperId,'isFromUndo':isFromUndo, 'isRollBack':isRollBack, 'idx':act.idx}];
    			if (isSlideMove){
    				eventData[0].selectNextOnDelete=false;
    			}else {
    				eventData[0].selectNextOnDelete=true;
    			}
	    		if(isFromUndo!=true){
	    			eventData[0].isFromUndo=false;
	    		} else{
	    			eventData[0].isFromUndo=true;	
	    		}
	    		
	    		if(isRollBack!=true){
	    			eventData[0].isRollBack=false;
	    		} else{
	    			eventData[0].isRollBack=true; 
	    		}
	    		// D42044, [B2B][Regression]After copy paste slide then undo redo, 
	    		// the slide in slide sorter will change to blank, total slide number will not update in slide sorter
	    		// Roll back of commenting out this line, which will affect Ctrl+Z and Ctrl+Y
    			concord.util.events.publish(concord.util.events.coeditingEvents, eventData);
	    	}
	    	else if(targetNode){
	    		if ((targetNode) && (dojo.hasClass(targetNode,'draw_frame'))){
	    			if(dojo.attr(targetNode, 'comments') == 'true') {
	    				var commentsId = dojo.trim(dojo.attr(targetNode, 'commentsId'));
	    				var commentsArray = commentsId.split(' ');
	    				for(var i=0;i<commentsArray.length;i++) {
	    					concord.widgets.sidebar.CommentsController.publishDeleteEvent(commentsArray[i]);	
	    				}			
	    			}
	    		}
	    		
	    		targetNode.parentNode.removeChild(targetNode);
	    	}else {
				 this.inherited(arguments);		
			}	    	
		} else if (this.getScope(doc)=='canvas'){ // scope is canvas document
			//console.log('delete for canvas');
			if ((act.p_isnad!=null) && (act.p_isnad==true)){				
				var contentBox = this._getTargetBox(act.p_nid,this._getCanvasDocument());
				if (contentBox) {
					if (contentBox.editor) {
						concord.util.presToolbarMgr.setFocusSorterTb();
			             if (contentBox.boxRep!=null){ // this is a spare in it is representing a box
			            	 contentBox = contentBox.boxRep.unLoadSpare();
			             } else{
			            	 contentBox.editor.destroy(true);	 
			             }
					}
					if (contentBox.boxRep==null){ //not a spare so we can nullify
						contentBox.editor = null;						
					}
					contentBox.editModeOn = false;
					contentBox.deleteContentBox(false); // false for do not publish to sorter
					
				} else {
					// no this content box, do nothing because slide has been switched
					console.log("Content box is not found in canvas doc. Maybe slide has been switched.");
				}
			}
			else{
				this.inherited(arguments);
			}
		} else {
			 this.inherited(arguments);		
		}
		
		this.updateUndoStack(doc,act);
		concord.text.tools.destroyNode(targetNode);
		targetNode = null;
	},
	
	getScope: function(doc){
		if (dojo.hasClass(doc.body,'mainBody')){
			return 'canvas';
		} else if (dojo.hasClass(doc.body,'ck_mainBody')){
			return 'ck_canvas';			
		} else return 'sorter';
	},
	
	
	//process draw frame change for insert&delete row(s)/column(s) and resize column
	processStructChangeMsg:function(msg,doc,id){
		//console.log(PresConstants.LOG_HERDER, 'ProcMsg::processStructChangeMsg');
		//console.log(PresConstants.LOG_HERDER, dojo.toJson(msg));
			var cloneMsg = dojo.clone(msg);
			var contentBox = this._getTargetBox2(cloneMsg.updates[0].tid)
			var drawFram = new CKEDITOR.dom.node(contentBox.mainNode);
			var heightPer = drawFram.getStyle('height');
			var widthPer = drawFram.getStyle('width');
			if(!dojo.isIE)
				var ckTdNode = dojo.query("iframe",contentBox.editTD[0])[0].parentNode;
			else
				var ckTdNode = contentBox.mainNode.childNodes[1].firstChild.firstChild.firstChild.childNodes[0].childNodes[1].childNodes[0];
			dojo.style(ckTdNode,{
				'height':contentBox.PercentToPx(heightPer, 'height')+'px',
				'width':contentBox.PercentToPx(widthPer, 'width')+'px'
			});	
			var tableNodes = contentBox.mainNode.childNodes;
			for(var i=0;i<2;i++){
				dojo.style(tableNodes[i],{
					'width':'100%'
				});
			}
			var editorRows=dojo.query('table',contentBox.editor.document.$.body)[0].rows;
			var viewRows = contentBox.contentBoxDataNode.rows;
//			this._changeWidthAndHeightPercent(editorRows);
//			this._changeWidthAndHeightPercent(viewRows);
			cloneMsg.updates[0].s.height = '100%';
			cloneMsg.updates[0].s.width = '100%';
			cloneMsg.updates[0].s.left = '0px';
			cloneMsg.updates[0].s.top = '0px';
//			cloneMsg.updates[0].s.left = null;
//			cloneMsg.updates[0].s.top = null;
//			delete cloneMsg.updates[0].s.left;
//			delete cloneMsg.updates[0].s.top;
			//this.processMessage(cloneMsg, doc, id, true);
			this.processMessage(cloneMsg, doc, id, false);
			cloneMsg = null;
		},
		_changeWidthAndHeightPercent:function(rows){
			for(var i=0;i< rows.length;i++){
				dojo.attr(rows[i],'height',((1/rows.length)*100)+"%");
				for(var j=0;j<rows[i].childNodes.length;j++)
				{
					var cellWidth = rows[i].childNodes[j].offsetWidth;
					var totalWidth = rows[i].offsetWidth;
					dojo.attr(rows[i].childNodes[j],'width',((cellWidth/totalWidth)*100)+"%");
				}
			}
		},

	_toggleTableContentEditableState: function(msg, docKey, state) {
		if ( docKey==PROCMSG.SECK_DOC){
			var id = msg.updates[0].tid;
			var contentBox = this._getTargetBox2(id);
			if (dojo.isIE == 9 && contentBox && contentBox.contentBoxType == PresConstants.CONTENTBOX_TABLE_TYPE && contentBox.editModeOn){
				contentBox.editor.document.getBody().$.contentEditable = state;
			}
		}
	},

	execBlockStyle: function( doc, cmd )
	{
		// if this is the "editable" table, then make sure top, left, and width aren't adjusted
		// (since the adjustment is for the slide sorter and slide editor "viewable" table)
		// note that the "editable" table is within a <body> tag while the others are both in <div> tags
		var targetId = cmd.tid;
		var el = doc.getElementById(targetId);
		if (el) {
		  var element = new CKEDITOR.dom.element(el);
		  if ( element.getName() == 'body' && element.getFirst().getName() == 'table' && cmd.s) {
		    var clonedCmd = dojo.clone(cmd);
		    var styles = clonedCmd.s;
		    styles.left = '0px';
		    styles.top = '0px';
		    styles.width = '100%';
		    // TODO : this isn't correct if the table height is being changed.
		    styles.height = element.getFirst().$.offsetHeight + 'px';
		    var ret = this.inherited( arguments, [doc, clonedCmd] );
		    clonedCmd = null;
		    return ret;
		  }
		}
		
		this.inherited(arguments);
	},
	
	/*****************************************************************************************************************************************
	 * overwrite text/ProcMsg
	 */
	setElementAttrs: function(node,styles,attrs )
	{

		//Wangzhe >>>==================
    	function _updateSpanFontSize(spanNode)
    	{
    		var curFontSize = PresCKUtil.getAbsoluteValue(spanNode,PresConstants.ABS_STYLES.FONTSIZE);
    		var newFontSize = curFontSize;
    		if(styles['font-size'] == 'increase'
    			|| styles['font-size'] == 'decrease'){
    			 if(styles['font-size'] == 'increase'){
    				 newFontSize = PresFontUtil.getNextFontSize(curFontSize);
    			 }else{
    				 newFontSize = PresFontUtil.getNextFontSize(curFontSize,false);
    			 }
    		}else if (styles['vertical-align'] == 'super' ||
 	        		styles['vertical-align'] == 'sub') {
    			 var va = spanNode.getStyle('vertical-align');
    			 if (!va || va == 'baseline') {  // not set sup/sub from sub/sup
    				 //newFontSize = dojo.number.round(curFontSize * 0.58, 0);  // new pt font size
    				 newFontSize = curFontSize * 0.58;  // new pt font size
    			 }
    			 // set vertical-align style
    			 MSGUTIL.setStyles(spanNode, styles);
    		}else if (!isNaN(parseInt(styles['font-size']))){
    			 // font is in pt we must convert to em
    			newFontSize = styles['font-size'];
    			newFontSize = parseFloat(newFontSize);
    		}
    		
    		if(newFontSize != curFontSize)
    		{
    			PresCKUtil.setCustomStyle(spanNode,PresConstants.ABS_STYLES.FONTSIZE,newFontSize);
    			spanNode.setStyle('font-size',parseFloat(newFontSize)/18.0 + 'em');
    		}
    	};
    	//<<<===========================
    	// check to see if the span has a text node besides other span children
		//set style
		if( node.type != CKEDITOR.NODE_ELEMENT )
	 		return;
        // skip bookmarks
        if ( MSGUTIL.isBookMark(node) )
            return;
		if( styles ) {
	    	// if changing font-family of first child of LI, then update font-family of the LI itself
	        var updateLI = false;
	        var liToUpdate = null;
	    	var li = node.getAscendant({'li':1}, true);
	    	if(li){
	    		var newSpan = PresCKUtil.getFirstVisibleSpanFromLine(li);
	    		if(node.equals(newSpan)){
                    	pe.scene.slideSorter.needUpdateListStyleSheet = true;                    	
                    	PresCKUtil.copyFirstSpanStyleToILBefore(li,styles,true);
	    		}
	    	} 	
	        if (typeof styles["font-family"] != 'undefined') {
	        	var ckNode = PresCKUtil.ChangeToCKNode(node);
	        	if(ckNode.is('span'))
	        	{
	        		MSGUTIL.setStyles(node, styles);
	        	}
	        	else
	        	{
		        	//we only set fontsize for span, so, get all span node
		        	var allSpans = dojo.query('span',ckNode.$);
		        	for(var i=0;i<allSpans.length;i++)
		        	{
		        		var spanNode = PresCKUtil.ChangeToCKNode(allSpans[i]);
		        		MSGUTIL.setStyles(spanNode, styles);
		        	}
	        	}
	        }
	        
        	//
        	// Need to verify if this is font-size
        	//            	
	        
	        else if (typeof styles["font-size"] != 'undefined' ||
	        		styles['vertical-align'] == 'super' ||
	        		styles['vertical-align'] == 'sub') {
	        	//get the current font size
	        	var ckNode = PresCKUtil.ChangeToCKNode(node);
	        	if(ckNode.is('span'))
	        	{
	        		_updateSpanFontSize(ckNode);
	        	}
	        	else
	        	{
		        	//we only set fontsize for span, so, get all span node
		        	var allSpans = dojo.query('span',ckNode.$);
		        	
		        	for(var i=0;i<allSpans.length;i++)
		        	{
		        		var spanNode = PresCKUtil.ChangeToCKNode(allSpans[i]);
		        		_updateSpanFontSize(spanNode);
		        	}
	        	}
	        } else if (styles['text-decoration'] == 'underline' ||
	        		styles['text-decoration'] == 'line-through') {
	        	styles[styles['text-decoration']] = '1';
	        	delete styles['text-decoration'];
	        	MSGUTIL.setStyles(node, styles);
        	 }else {
        		 MSGUTIL.setStyles(node, styles);
        	 }
        }

		//set attribute	
		if( attrs)
		{
			for( var name in attrs )
			{
				if(attrs[name]!="" ) {
					var oldFillColor = null;
					var oldLineColor = null;
					if (dojo.isFF <= 25 && name == 'fill') {
						oldFillColor = node.getAttribute('fill');
					}
					if (dojo.isFF <= 25 && name == 'stroke') {
						oldLineColor = node.getAttribute('stroke');
					}
					
					node.setAttribute(name,attrs[name]);
					
					var nodeName = node.getName().toLowerCase();
					// No need add this handling for Docs created connector
					// because it has no gradient color and "no fill" has no issue for FF25d
					if ( (name == 'fill' && (nodeName == 'rect' || nodeName == 'circle' || nodeName == 'path')) ||
						(name == 'stroke' && (nodeName == 'path'))) {
						// "_upd" is trimed when sending message
						// But maybe another coediting client id is not suffixed by _upd
						// So refresh the id here
						if (attrs[name].indexOf("url(#") >= 0) {
							var svgNode = node.getAscendant('svg');
							concord.util.HtmlContent.refreshIdForSVGElement(svgNode.$);
						}
						
						// Need delete orig node then insert new one
						// Or FF25 will not redraw when change from "none" fill
						if (dojo.isFF <= 25 && (oldFillColor == 'none' || oldLineColor == 'none')) {
							var parentNode =  node.getParent();
							var clonedNode = node.clone(true, true);
							dojo.destroy(node.$);
							parentNode.append(clonedNode);
							node = clonedNode;
						}
					}
				}
				else
					node.removeAttribute(name);
				//D21282
				if(name && (name.indexOf('smil_type') != -1 || name.indexOf('smil_subtype') != -1 || name.indexOf('smil_direction') != -1)){
					var slideWrapper = node.$.parentNode;
					if(slideWrapper.children.length > 1){
						var slideUtil = slideWrapper.children[1];
						if(slideUtil.children.length > 1){
							slideUtilNode = slideUtil.children[1];
							var transitionIconType = this.getTransitionType(node);
							dojo.attr(slideUtilNode, "class", transitionIconType);
						}
					}					
				}

			}
		}
	},
	//D21282
	getTransitionType: function(slide){
		var smil_type = slide.getAttribute('smil_type');
		var smil_subtype = slide.getAttribute('smil_subtype');
		var smil_direction = slide.getAttribute('smil_direction');
		if (smil_direction == null) {
			smil_direction = "none";
		}
				
		if (smil_type == "none") {
			smil_type = null;
		}
		
		var transitionToUse = "slideTransitions_none";
		
		if(!smil_type){
			return transitionToUse;
		}
		
		if (smil_type == "slideWipe") {
			if (smil_subtype == "fromTop") {
				transitionToUse	= "slideTransitions_coverDown";	
			} else if (smil_subtype == "fromRight") {
				transitionToUse	= "slideTransitions_coverLeft";
			} else if (smil_subtype == "fromBottom") {
				transitionToUse	= "slideTransitions_coverUp";
			} else if (smil_subtype == "fromLeft") {
				transitionToUse	= "slideTransitions_coverRight";
			} else
				//the default transition if the transition is not supported
				transitionToUse	= "slideTransitions_notSupported";
		} else if (smil_type == "pushWipe") {
			if (smil_subtype == "fromTop") {
				transitionToUse	= "slideTransitions_pushDown";	
			} else if (smil_subtype == "fromRight") {
				transitionToUse	= "slideTransitions_pushLeft";
			} else if (smil_subtype == "fromBottom") {
				transitionToUse	= "slideTransitions_pushUp";
			} else if (smil_subtype == "fromLeft") {
				transitionToUse	= "slideTransitions_pushRight";
			} else
				//the default transition if the transition is not supported
				transitionToUse	= "slideTransitions_notSupported";
		} else if (smil_type == "fade") {
			transitionToUse	= "slideTransitions_fadeSmoothly";	
		} else if (smil_type == "barWipe") {
			if (smil_subtype == "topToBottom" && (smil_direction == "none" || smil_direction == "forward")) {
				transitionToUse	= "slideTransitions_wipeDown";	
			} else if (smil_subtype == "leftToRight" && (smil_direction == "none" || smil_direction == "forward")) {
				transitionToUse	= "slideTransitions_wipeRight";
			} else if (smil_subtype == "topToBottom" && smil_direction == "reverse") {
				transitionToUse	= "slideTransitions_wipeUp";
			} else if (smil_subtype == "leftToRight" && smil_direction == "reverse") {
				transitionToUse	= "slideTransitions_wipeLeft";
			} else
				//the default transition if the transition is not supported
				transitionToUse	= "slideTransitions_notSupported";			
		} else {
			//the default transition if the transition is not supported
			transitionToUse	= "slideTransitions_notSupported";
		}
		return transitionToUse;
	},
	
	insertText : function (doc,act,deleteNodePos){
		this.inherited(arguments);
		if (act.undoFlag!= undefined &&  act.undoFlag!=null &&  act.undoFlag==true && act.tid.length!=0){
			var drawFrameId = this._slideEditor.getParentDrawFrameId(act.tid);
			var contentObj = this._slideEditor.getRegisteredContentBoxById(drawFrameId);			
			if (contentObj!=null && (contentObj.opts.contentBoxType == PresConstants.CONTENTBOX_TEXT_TYPE || contentObj.opts.contentBoxType == PresConstants.CONTENTBOX_NOTES_TYPE)) {		
				contentObj.isEmptyCBPlaceholder=false; //48301 jmt - clear our placeholder status since a character has been inserted
			}
		}
	},
	
	//
	// Determines if message is for a presentation object or not
	//
	isMsgForPresentationObj: function(msg){
		var forPresObj=false;
		if (msg.updates!= undefined && msg.updates!=null){
			var updates = msg.updates;
			for (var i=0; i<updates.length; i++){
				var act = updates[i];
				//Check if msg is for a drawFrame (contentBox)
				if (act.p_isnad!= undefined && act.p_isnad!=null && act.p_isnad==true){
					forPresObj=true;
					break;
				}
				//Check if msg is for a slide
				if (act.p_isnas!= undefined && act.p_isnas!=null && act.p_isnas==true){
					forPresObj=true;
					break;
				}
				//Check if msg is for a slideWrapper
				if (act.p_isnasw!= undefined && act.p_isnasw!=null && act.p_isnasw==true){
					forPresObj=true;
					break;
				}
				//Check if msg is resizing a drawFrame
				if (act.flag!= undefined && act.flag!=null && (act.flag=='Resizing' || act.flag=='ResizingEnd' || act.flag=='Resized')){
					forPresObj=true;
					break;
				}				
			}			
		}
		
		return forPresObj;
	},
	handleConflict : function(msg){
		this.inherited(arguments);
		//need to handle undo stack, removed the rescinded msg from undo
		var index = -1;
		var editor = window.pe.scene.getEditor();
		if(editor!=null){
			var undoStack = editor.getStack();
			if(undoStack!=null){
				for (var i=undoStack.length-1; i>=0; i--)
				{
					if (undoStack[i].redo.client_seq == msg.client_seq)
					{
						index = i;
						break;
					}
				}
				if (index != -1)
					undoManager.removeAction(index);
			}
		}
		
	},

	checkNHandleDeleteOnlySlide: function (baseOp){
		if(baseOp!=null){
			var editor = window['pe'].scene.getEditor();
			if(editor!=null){
				var doc = editor.document.$;
				if(doc!=null){
					var parentNode = doc.getElementById(baseOp.tid);
					if(parentNode.children!=null && parentNode.children.length ==1){
						//this is an only slide
						//need to call undo
						//and show message to the user that the change is rescinded/cancelled
						var sess = window['pe'].scene.session;
						//1 show error message
						var nls = dojo.i18n.getLocalization("concord.scenes","Scene");
						pe.scene.showWarningMessage(nls.conflictMsg,5000);
						
						//2 look at undo stack and modify the index from the undo stack
						//need to update idx in undo msgs since position of slides must have been changed due to OT delete by other users
						//do undo to reinsert back the slides

						//need to sort the msg in the undo msgList from biggest index to smallest
						//then need to change the index of each message to 0
						//so when the insert element is executed, the insert resulted in the correct order
						//because idx 0 will insert before, and if we start from the largest index first,
						//and all other slide with smaller index is inserted before the larger index, it will maintain order
						if(undoManager.stack!=null && undoManager.stack.length>0 && undoManager.stack[undoManager.stack.length-1]!=null){
							var undoMsgList = undoManager.stack[undoManager.stack.length-1].undo;
							if(undoMsgList!=null && undoMsgList.length>0){

									undoMsgList.sort(dojo.hitch(this, this.sortMsgByIdx));
									undoMsgList = this.reverseMsgOrder(undoMsgList);

									//after sort reverse, we need to set every idx to 0
									for(var u=0; u<undoMsgList.length; u++){
										var undoMsg = undoMsgList[u];
										var acts = undoMsg.updates;
										for (var i = 0; i< acts.length; i++)
									    {
											var act = acts[i];
											act.idx = 0;
									    }
									}
										undoManager.performAction(undoMsgList);
										undoManager.removeAction(undoManager.stack.length-1); //remove from the undo stack

							}
						}
						
						
						
					}
				}
				
			}
		}
	},
	
	sortMsgByIdx: function(msgA, msgB){
		if(msgA !=null && msgB !=null){
			var actA = msgA.updates;
			var actB = msgB.updates;
			if(actA!=null && actB!=null && actA.length>0 && actB.length>0){
				var idxA = actA[0].idx;
				var idxB = actB[0].idx;
				return (idxA - idxB); //causes an array to be sorted numerically and ascending
			}
			
		}
		return 0; //no sort performed
	},
	
	//reverse the order of the msg if index is different than other msgs
	//but keep the order of msgs with same indexes.
	reverseMsgOrder: function(msgList){
		if(msgList!=null && msgList.length>0){
			var msgListClone = dojo.clone(msgList);
			var newMsgList = [];
			var msgIdxCurr = -1; 
			var msgIdxNext = -1;
			var tempArray = [];
			for(var i=msgListClone.length-1; i>=0; i--){
				if(msgListClone[i].updates!=null && msgListClone[i].updates.length>=0){
					msgIdxCurr = msgListClone[i].updates[0].idx;
					tempArray.push(msgListClone[i]);

					if(i-1>=0){
						msgIdxNext = msgListClone[i-1].updates[0].idx;
					}
					
					if(i==0 ||(msgIdxNext != msgIdxCurr)){
						if(tempArray!=null ){
							for(var t=tempArray.length-1; t>=0; t--){
								newMsgList.push(tempArray[t]);
							}
						}
						tempArray = [];
					}
				}				
			}
			msgList = newMsgList;
		}
		return msgList;
	},
	
	//
	// After a coedit user makes an update we need to see if local undo stack needs to be modified 
	//
	updateUndoStack: function(doc,act){
		if (this.getScope(doc)=='sorter' && act.p_nid && act.remoteFlag==true){ //if scope is sorter document
			if ((act.undoFlag==undefined) || (act.undoFlag!=undefined && act.undoFlag==false)) {
				for(var i=0; i<undoManager.stack.length; i++){
					var undoEntry = undoManager.stack[i];
					// When coediting, undoEntry can be null
					var redoArr = undoEntry ? undoEntry.redo : null;					
					if(redoArr!=null){
						for (var j=0;j<redoArr.length;j++){
							var redo = redoArr[j];
							var contentBoxDFId = window.pe.scene.slideEditor.getParentDrawFrameId(act.p_nid);
							var contentBoxDFIdForRedo = window.pe.scene.slideEditor.getParentDrawFrameId(redo.updates[0].p_nid );
							
							var slideId = act.p_sid;
							var slideIdForRedo = (redo.updates[0].p_sid) ? redo.updates[0].p_sid : window.pe.scene.slideEditor.getParentDrawPageId(redo.updates[0].p_nid ,doc);

							if (act.p_tt==true && act.t==MSGUTIL.actType.insertElement){ //The remote msg is text ptt type
								//SCENARIO: A
								//	Local user creates a box and types in the box then exits.
								//	Remote user types in the box.

								//CONTENT BOX LEVEL  ACTIONS
								if (contentBoxDFId && contentBoxDFIdForRedo && contentBoxDFId == contentBoxDFIdForRedo){//remote message and msg from undo stack refer to same content box drawframe

									//action 1  for scenario A: we should clear any entries that indicate that local user did add some text in this contentBox
									if (redo.updates[0].t==MSGUTIL.actType.insertElement &&
										//redo.updates[0].p_nid == act.p_nid &&    // we will care if they are same id when we fix no longer coediting at dfc level
										redo.updates[0].p_tt==true){
										//if found entry with same id and this is a insert element ptt  message then remove 
										undoManager.removeSingleAction(i);
										i--;
										break;
									}
									
									//action 2  for scenario A: we should clear any entries that has todo with insert drawFrame or delete drawframe
									if ((redo.updates[0].t==MSGUTIL.actType.insertElement || redo.updates[0].t==MSGUTIL.actType.deleteElement ) &&
										(redo.updates[0].placeHolderFlag==true)){
										//if found entry with same id and this is a insert or delete drawframe we need to clear
										undoManager.removeSingleAction(i);
										i--;
										break;
									}																	
								}	
								
								//SLIDE LEVEL ACTIONS
								if (slideId && slideIdForRedo && slideId == slideIdForRedo){//remote message and msg from undo stack refer to same slide
									//action 3  for scenario A: we should clear any entries that indicate that local user added a created this slide
									if (redo.updates[0].t==MSGUTIL.actType.insertElement &&
										//redo.updates[0].p_nid == act.p_nid &&    // we will care if they are same id when we fix no longer coediting at dfc level
										redo.updates[0].p_isnasw==true){
										//if found entry with same id and this is a insert element ptt  message then remove 
										undoManager.removeSingleAction(i);
										i--;
										break;
									}																		
								}
							}
							else if (act.t==MSGUTIL.actType.deleteElement && act.p_isnad!= undefined && act.p_isnad!= null && act.p_isnad ==true){ //The remote msg is a delete drawFrame
								//SCENARIO: B
								//	Remote user creates a box and types in the box then exits.
								//	Local user types in the box.
								//  Remote user deletes the box  						

								if (contentBoxDFId && contentBoxDFIdForRedo && contentBoxDFId == contentBoxDFIdForRedo){//remote message and msg from undo stack refer to same content box drawframe
								
									//action 1  for scenario B: we should clear any entries that indicate that local user did add some text in this contentBox
									if (redo.updates[0].t==MSGUTIL.actType.insertElement &&
										//redo.updates[0].p_nid == act.p_nid &&    // we will care if they are same id when we fix no longer coediting at dfc level
										redo.updates[0].p_tt==true){
										//if found entry with same id and this is a insert element ptt  message then remove 
										undoManager.removeSingleAction(i);
										i--;
										break;
									}																
								}
							}
					}
				}				
			}
		}
	 }	
	}
});