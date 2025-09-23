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

dojo.provide("pres.msg.Receiver");
dojo.require("concord.beans.User");
dojo.require("concord.beans.Profile");
dojo.require("concord.beans.ProfilePool");
dojo.require("concord.beans.Participant");
dojo.require("concord.text.OTService");
dojo.require("pres.msg.ReceiverInsDel");
dojo.require("pres.msg.ReceiverAttr");
dojo.require("concord.pres.MsgUtil");

dojo.declare("pres.msg.Receiver", [pres.msg.ReceiverInsDel, pres.msg.ReceiverAttr], {
	receiveMessage: function(msg)
	{
		// 1.Chk for presentation specific messages and process them
		var fromUndoRedo = false;
		var continueProcess = this.processPresMsg(msg, fromUndoRedo);
		if (continueProcess)
		{
			// 2.Transform message in sendoutList
			// if this p_tt message no need to check OT
			// if ((msg.updates[0].p_tt!=undefined && msg.updates[0].p_tt!=true) || msg.updates[0].p_tt==undefined){
			this.transformMessage(msg);
			if(this.checkWithPendingMessage(msg))
			{
				// 1 show error message
				var nls = dojo.i18n.getLocalization("concord.scenes", "Scene");
				pe.scene.showWarningMessage(nls.conflictMsg, 5000);	
				//if the remote message is older than local pending message, for server side already is the remote message so, rollback the local message.
				var rmsg = pe.scene.msgPublisher._pending.msg[0].rMsg;
				this.processMessage(rmsg, null, true);
				pe.scene.msgPublisher._pending.msg = [];
			}
			
			// }
			// 3 apply message to editor
			var remoteMsg = this._setRemoteFlagInMsgAct(msg);
			this.processRemoteMsg(remoteMsg);
			// 4. Transform Undo/Redo message if msg is not contentBox or slide level operation
			// if (this.isMsgForPresentationObj(msg)){
			// this._slideSorter.editor.transformUndo(msg);
			// }
		}
	},

	_setRemoteFlagInMsgAct: function(msg)
	{
		for ( var i = 0; i < msg.updates.length; i++)
		{
			msg.updates[i].remoteFlag = true;
		}
		return msg;
	},

	checkRelated2: function(msg, baseMsg)
	{
		return msg.asCtrl !== undefined && (baseMsg.asCtrl !== undefined || baseMsg.elemId !== undefined);
	},

	transform: function(msg, localList)
	{
		var baseList = localList;
		var type = msg.type;
		for ( var index = 0; index < baseList.length; index++)
		{
			var baseMsg = baseList[index];
			if (!this.checkRelated2(msg, baseMsg))
				continue;

			if (type == baseMsg.type)
			{
				// ignore local lock and unlock operation
				if (baseMsg.elemId == msg.elemId)
				{
					if (msg.editMode)
						;
				}
			}
			else if (baseMsg.elemId == msg.elemId)
				// local object content change operation, need to be rejected
				return baseMsg;
		}

		return null;
	},

	transformMessage: function(msg)
	{
		var sess = window['pe'].scene.session;
		// if message in waitingList isn't conflict with others, then the message will be OT on server,
		// so we should clone the waitingList here, or else the message will be OT twice.
		var localList = sess.sendoutList.concat(sess.waitingList);
		// var localList = sess.sendoutList2.concat(sess.waitingList2);
		if (localList.length > 0)
		{
			var conflictMsg = this.transform(msg, localList);
			if (conflictMsg == null)
				conflictMsg = OTSERVICE.transform(msg, localList);
			if (conflictMsg != null)// conflict
				this.handleConflict(conflictMsg);
		}
	},
	checkWithPendingMessage: function(remotemsg)
	{
		var pending = pe.scene.msgPublisher._pending;
		if(pending)
		{
			if(pending.msg && pending.msg[0]){
				var localmsg = pending.msg[0].msg;
				var msgList = [localmsg];
				var rMsgList = [pending.msg[0].rMsg];
				pe.scene.msgPublisher && pe.scene.msgPublisher._addSlideId(msgList, rMsgList);
				
				var conflictMsg = this.transform(remotemsg, msgList);
				if (conflictMsg == null)
					conflictMsg = OTSERVICE.transform(remotemsg, msgList);
				if (conflictMsg != null)
					return true;
				if (this.checkRNandAmessage(remotemsg, localmsg))
					return true;
			}
		}
		return false;
	},
	checkRNandAmessage: function(msg, localmsg){
		var ltId = null;
		var rtId = null;
		if(msg.type == "rn")
		{
			rtId = msg.updates[0].p_nid;
		}
		else if(msg.type == "a")
		{
			rtId = msg.updates[0].tid;
		}
		if(localmsg.type == "rn")
		{
			ltId = localmsg.updates[0].p_nid;
		}
		else if(localmsg.type == "a")
		{
			ltId = localmsg.updates[0].tid;
		}
		if(ltId && rtId && (rtId == ltId))
			return true;
		return false;
	},
	handleConflict: function(msg)
	{
		var sess = window['pe'].scene.session;
		// 1 show error message
		var nls = dojo.i18n.getLocalization("concord.scenes", "Scene");
		pe.scene.showWarningMessage(nls.conflictMsg, 5000);

		// remove message on sendloutlist
		var index = -1;
		for ( var i = 0; i < sess.sendoutList.length; i++)
		{
			if (sess.sendoutList[i].client_seq == msg.client_seq)
			{
				index = i;
				break;
			}
		}
		if (index != -1)
			sess.sendoutList.splice(index, sess.sendoutList.length - index);

		// remove message on waiting list
		sess.waitingList = [];

		// send resolve conflict message to server
		var newmsg = sess.createMessage();
		newmsg.resolve_conflict = "true";
		sess.sendMessage([newmsg]);

		// for presentation mostly have client's handle conflict scenario
		// which does not need to reload from server
		// the throw exception is for document temporarily until finding better solution
		// to document's complex scenarios (bullet numbering manipulation - defect 6447) in handling conflict
		// if(window.g_presentationMode!=true)
		// {
		// throw "reload for local conflict";
		// }

		// 2 roll back local change
		var undoManager = pe.scene.undoManager;
		var isReload = undoManager.rollbackAction(msg);
		if (isReload)
		{
			throw "reload for local conflict";
		}

		// for pres
		var index = -1;
		var undoStack = undoManager.stack;
		if (undoStack != null)
		{
			for ( var i = undoStack.length - 1; i >= 0; i--)
			{
				if ((undoStack[i].redo.client_seq == msg.client_seq) || (undoStack[i].redo.client_seq == msg.orig_client_seq))
				{
					index = i;
					break;
				}
			}
			if (index != -1)
				undoManager.removeAction(index);
		}

	},

	processPresMsg: function(msg, isUndoRedo)
	{
		var msgType = msg.type;
		// console.log(PresConstants.LOG_HERDER, dojo.toJson(msg));
		var continueProcess = true;
		var userObj = pe.scene.getEditorStore().getEditorById(msg.user_id);
		if (msgType == MSGUTIL.msgType.slideSelected)
		{
			// remove the previous slideSelected from the slideNodeLockObj by this user if any
			pe.scene.locker.updateLockOnSlideSelected(msg.user_id, msg.elemIds);
			continueProcess = false;
		}
		else if (msgType == MSGUTIL.msgType.doAssignment)
		{
			var entry = {
				'slideId': msg.slideId,
				'taskId': msg.taskId,
				'type': msg.actionType
			};
			// publish to slideSorter
			var eventData = [{
				eventName: concord.util.events.coeditingEvents_eventName_doAssignmentByOtherUser,
				msg: entry
			}];
			concord.util.events.publish(concord.util.events.coeditingEvents, eventData);
			continueProcess = false;
		}
		else if (msgType == MSGUTIL.msgType.applyTemplate)
		{ // JMT - TODO: verify flow with Tintin
			var entry = {
				'templateData': msg.templateData,
				'action': 'applyTemplate'
			};
			// publish to slideSorter
			var eventData = [{
				eventName: concord.util.events.undoRedoEvents_eventName_applyTemplate,
				msg: entry
			}];
			concord.util.events.publish(concord.util.events.undoRedoEvents, eventData);
			continueProcess = false;
		}
		else if (msgType == MSGUTIL.msgType.templateApplied)
		{
			var entry = {
				'newTemplateCss': msg.newTemplateCss,
				'oldTemplateCss': msg.oldTemplateCss,
				'action': 'templateApplied'
			};
			// publish to slideSorter
			var eventData = [{
				eventName: concord.util.events.coeditingEvents_eventName_templateAppliedByOtherUser,
				msg: entry
			}];
			concord.util.events.publish(concord.util.events.coeditingEvents, eventData);
			continueProcess = false;
		}
		else if (msgType == MSGUTIL.msgType.layoutApplied)
		{
			var entry = {
				'slideId': msg.slideId,
				'action': 'layoutApplied'
			};
			// publish to slideSorter
			var eventData = [{
				eventName: concord.util.events.coeditingEvents_eventName_layoutAppliedByOtherUser,
				msg: entry
			}];
			concord.util.events.publish(concord.util.events.coeditingEvents, eventData);
			continueProcess = false;
		}
		else if (msgType == MSGUTIL.msgType.addNewComment)
		{
			var eventData = [{
				'eventName': concord.util.events.commenttingEvents_eventName_addCommentIcon,
				'drawFrameId': msg.elemId,
				'commentId': msg.commentId
			}];
			concord.util.events.publish(concord.util.events.coeditingEvents, eventData);
			continueProcess = false;
		}
		else if (msgType == MSGUTIL.msgType.deleteComment)
		{
			var eventData = [{
				'eventName': concord.util.events.commenttingEvents_eventName_deleteCommentIcon,
				'drawFrameId': msg.elemId,
				'commentId': msg.commentId
			}];
			concord.util.events.publish(concord.util.events.coeditingEvents, eventData);
			continueProcess = false;
		}
		else if (msgType == MSGUTIL.msgType.addSlideComment)
		{
			var eventData = [{
				'eventName': concord.util.events.commenttingEvents_eventName_addSlideCommentIcon,
				'slideId': msg.elemId
			}];
			concord.util.events.publish(concord.util.events.coeditingEvents, eventData);
			continueProcess = false;
		}
		else if (msgType == MSGUTIL.msgType.delSlideComment)
		{
			var eventData = [{
				'eventName': concord.util.events.commenttingEvents_eventName_delSlideCommentIcon,
				'slideId': msg.elemId
			}];
			concord.util.events.publish(concord.util.events.coeditingEvents, eventData);
			continueProcess = false;
		}
		else if (msgType == "resetContent" || msgType == "rc")
		{
			/*
			 * rc is handled in the processMessage() now, to be able to let transform() process the message first to handle conflict //publish clean up event here //concord.util.events.slideSorterEvents_eventName_cleanupOldContentBeforeReset var eventData = [{'eventName': concord.util.events.slideSorterEvents_eventName_cleanupOldContentBeforeReset}]; concord.util.events.publish(concord.util.events.slideSorterEvents, eventData);
			 * 
			 * 
			 * window.pe.scene.slideSorter.presHtmlContent = msg.data; window.pe.scene.slideSorter.prepPresContent(window.pe.scene.slideSorter.presHtmlContent); window.pe.scene.slideSorter.editor.setData(window.pe.scene.slideSorter.presHtmlContent); //no need to clear undo stack if reset content from master Style changes //window.pe.scene.slideSorter.editor.fire("resetUndo"); continueProcess = false;
			 */

		}
		else if (msgType == MSGUTIL.msgType.slideShowCoview)
		{
			window['pe'].scene.handleSlideShowCoeditFromOtherUser(msg.curSlide, msg.totalSlides, msg.slideContent, userObj);
			continueProcess = false;
		}
		else if (msgType == MSGUTIL.msgType.slideShowCoviewStart)
		{
			var inviteeList = (msg.inviteeList != null && msg.inviteeList.length > 0) ? msg.inviteeList.split(",") : [];
			window['pe'].scene.handleSlideShowCoviewStartFromOtherUser(msg.curSlide, msg.totalSlides, msg.slideContent, userObj,
				inviteeList);
			continueProcess = false;
		}
		else if (msgType == MSGUTIL.msgType.slideShowCoviewEnd)
		{
			window['pe'].scene.handleSlideShowCoviewEndFromOtherUser(userObj);
			continueProcess = false;
		}
		else if (msgType == MSGUTIL.msgType.slideShowCoviewJoin)
		{
			window['pe'].scene.handleUserJoingingCoview(userObj, msg.userHostId);
			continueProcess = false;
		}
		else if (msgType == MSGUTIL.msgType.slideShowCoviewLeft)
		{
			window['pe'].scene.handleUserLeavingCoview(userObj);
			continueProcess = false;
		}
		else if (msgType == MSGUTIL.msgType.removeUserLock)
		{
			window['pe'].scene.handleRemoveUserLocks(userObj);
			continueProcess = false;
		}
		else if (msgType == MSGUTIL.msgType.requestLockStatus)
		{
			window['pe'].scene.handleRequestLockStatus();
			continueProcess = false;
		}
		else if (msgType == MSGUTIL.msgType.Attribute && isUndoRedo != true)
		{
			// need to check if it is a change presentation_presentation-page-layout-name attribute
			// if so, need to check if undo stack has the same attribute change for the same slide, if so, remove the msg from undo stack
			// it means the slide on which user has changed layout, is about to change layout by other user, so need to invalidate this user's change layout undo
			// so we don't undo the change layout by other user coming in.
			// #9340 OT conflict happened need the undo message to do rollback.
			// var acts1 = msg.updates;
			// if(acts1!=null){
			// for( var i=0; i < acts1.length; i++ )
			// {
			// var act1 = acts1[i];
			// if(act1.a!=null){ //if contain change layout name attribute
			// for(var m in act1.a){
			// if(m == "presentation_presentation-page-layout-name"){
			// var undoStack = window.pe.scene.getEditor().getStack();
			// if(act1.p_sid!=null && undoStack!=null){
			// for(var j=0; j<undoStack.length; j++){
			// var msgList1 = undoStack[j].redo;
			// if(msgList1!=null && msgList1.length>0){
			// var msg0 = msgList1[0]; //check the first message, the layout name attribute change is always the first message
			// if(msg0.type == MSGUTIL.msgType.Attribute && msg0.updates!=null && msg0.updates.length>0){
			// var msg0Act = msg0.updates[0];
			// if(msg0Act.a!=null && msg0Act.p_sid == act1.p_sid){
			// for(var z in msg0Act.a){
			// if(z == "presentation_presentation-page-layout-name"){
			// //if same slide change layout, remove this undo msgList from undo stack
			// undoManager.removeSingleAction(j);
			// j--;
			// }
			// }
			// }
			//												
			// }
			// }
			// }
			// }
			// }
			// }
			//						
			// }
			// }
			// }
		}
		return continueProcess;
	},

	processStructChangeMsg: function()
	{

	},

	processRemoteMsg: function(msg)
	{
		this.processMessage(msg);
	},

	processMessage: function(msg, fromUndoRedo, stripACF)
	{
		var actType = MSGUTIL.actType;
		// TODO remove msg.updates
		var acts = msg.as || msg.updates; // Act command list

		if (!acts)
			return;

		var msgType = msg.type;

		var fromRemote = msg.updates[0].remoteFlag;
		var mainNodeId = msg.updates[0].p_nid;
		var msgTP = msg.updates[0].t;
		// var userObj = pe.scene.getUserObject(msg.user_id);
		// TODO, BOB, need to check with old code..
		if ((msg.type == "rn") && (msg.updates.length == 2) && mainNodeId && fromRemote)
		{
			// TODO, bob
			/*
			 * var isLocked = pe.scene.isSlideNodeLocked(mainNodeId);
			 * 
			 * if (userObj.id && isLocked) { window['pe'].scene.slideNodeLockStatusRemoveEntry(mainNodeId, userObj); this.inherited(arguments);
			 * 
			 * var entry = { 'drawFrameId': mainNodeId, 'user': userObj, 'action': 'inEdit' }; window['pe'].scene.slideNodeLockStatusAddEntry(entry);
			 * 
			 * goOnNext = false; }
			 */

		}
		else if ((msg.type == "e") && (msg.updates.length == 1) && mainNodeId && fromRemote && (msgTP == "de"))
		{
			// delete element
			// TODO, bob
			// window['pe'].scene.slideNodeLockStatusRemoveEntry(mainNodeId, null);
		}

		else if (msgType == MSGUTIL.msgType.contentBoxEditMode)
		{
			if (pe.scene.authUser.e.id != msg.user_id)
			{
				if (msg.editMode)
					pe.scene.locker.lockElement(msg.elemId, msg.user_id);
				else
					pe.scene.locker.unlockElement(msg.elemId, msg.user_id);
			}
		}

		var acf = concord.util.acf;
		var fristDeleteNode;
		var hasDeleteElement = false;

		// multiple slides change.
		var batchSlidesInsDel = (msg.forLayout && acts.length > 1) || (msgType == MSGUTIL.msgType.MoveSlide && acts.length > 1)
			|| (acts.length > 1 && msgType == MSGUTIL.msgType.Element && dojo.every(acts, function(act)
			{
				return act.t == MSGUTIL.actType.insertElement || act.t == MSGUTIL.actType.deleteElement && act.p_type == "slide";
			}));

		// console.info(" batchSlidesInsDel " + batchSlidesInsDel);

		if (msg.forLayout)
		{
			dojo.publish("/msg/layout/before", []);
		}
		
		for ( var i = 0; i < acts.length; i++)
		{
			var act = acts[i];
			if (pe.scene.isMobile)
			{
				if (act.t != actType.insertElement && act.t != actType.deleteElement)
					concord.util.mobileUtil.presObject.processMessage(act.tid, act.t);
			}
			var last = acts.length - 1 == i && !msg.forLayout;
			switch (act.t)
			{
				/*
				 * case actType.insertText: { if (!fromUndoRedo && !stripACF) { for ( var j = 0; j < act.cnt.length; j++) { var data = act.cnt[j]; var str = data.t || data.e || ''; if (acf.suspiciousHtml(str)) { LOG.log("malicious html fragment detected: " + str); return; } } }
				 * 
				 * this.insertText(targetDoc, act, fristDeleteNode, fromUndoRedo); if (concord.util.browser.isMobile() && isMessageProcessed(targetDoc, act, range)) { concord.util.mobileUtil.isProcessedMessage = true; } break; } case actType.deleteText: { if (concord.util.browser.isMobile() && isMessageProcessed(targetDoc, act, range)) { concord.util.mobileUtil.isProcessedMessage = true; } var deleteNode = this.deleteText(targetDoc, act); fristDeleteNode = fristDeleteNode || deleteNode; break; }
				 */
				case actType.insertElement:
				{
					if (!fromUndoRedo && !stripACF && acf.suspiciousHtml(act.s))
					{
						LOG.log("malicious html fragment detected: " + act.s);
						return;
					}

					// Assume Insert/delete element is block.
					this.insertElement(act, batchSlidesInsDel, last);

					break;
				}
				case actType.deleteElement:
				{
					// TODO delete element in table should remain a "&nbsp;" character

					// TODO remove all elements should keep the first's paragraph as placehold
					// console.info("before delete element");
					this.deleteElement(act, batchSlidesInsDel, last);
					hasDeleteElement = true;
					// For replace block
					// fristDeleteNode = fristDeleteNode || deleteNode;
					// console.info("after delete Element");
					break;
				}
				case actType.insertStyleElement:
				{
					console.log('insert Style Element');
					this.insertStyleElement(targetDoc, act, fromUndoRedo);
					break;
				}
				case actType.deleteStyleElement:
				{
					console.log('delete Style Element');
					this.deleteStyleElement(targetDoc, act);
					break;
				}
				case actType.setStyle:
				case actType.removeStyle:
				{
					if (!fromUndoRedo && !stripACF && act.t == actType.setStyle)
					{
						if (act.e && acf.suspiciousHtmlRegex('<' + act.e + '>'))
						{
							LOG.log("malicious html element detected: " + act.e);
							return;
						}
						else if (this._checkSuspiciousStyles(act.s))
						{
							return;
						}
					}

					// console.info("before style action");
					this.exeStyle(act);
					// console.info("after sytle action");
					break;
				}
				case actType.setAttributes:
				case actType.removeAttributes:
				{
					if (!fromUndoRedo && !stripACF && act.t == actType.setAttributes)
					{
						if (this._checkSuspiciousStyles(act.s) || this._checkSuspiciousStyles(act.a))
							return;
					}

					// console.info("before attribute action");
					this.updateAttributes(act);
					// console.info("after style action");
					break;
				}
				case actType.insertTask:
				case actType.deleteTask:
				case actType.updateTask:
				case actType.updateFragment:
				{
					editor.getTaskHdl().processMessage(act.t, act);
					break;
				}
				case actType.ResetContentAction:
				{
					// ACF
					if (!stripACF && acf.suspiciousHtml(act.data))
					{
						LOG.log("malicious html fragment detected: " + act.data);
						return;
					}

					editor.setData(act.data);

					// Clear undo/redo stack, all content has been removed
					editor.fire("resetUndo");

					return;
				}
				case actType.UpdateListValue:
				{
					if (window.g_concordInDebugMode)
						console.info("before updateListValue ");
					this.updateListValue(targetDoc, act);
					// For replace block
					// fristDeleteNode = fristDeleteNode || deleteNode;
					if (window.g_concordInDebugMode)
						console.info("after updateListValue ");
					break;
				}
				case actType.ChangeListType:
				{
					if (window.g_concordInDebugMode)
						console.info("before change list type ");
					this.changeListType(targetDoc, act);
					// For replace block
					// fristDeleteNode = fristDeleteNode || deleteNode;
					if (window.g_concordInDebugMode)
						console.info("after change list type ");
					break;
				}
				case actType.updateHeaderFooter:
				{
					pe.scene.refreshHeaderFooter(act.tid);
					break;
				}
			}
		}
		
		if (msg.forLayout)
		{
			dojo.publish("/msg/layout/after", []);
		}

		if (msg.cb != null && msg.cb != "")
		{
			eval(msg.cb);
		}

		function isMessageProcessed(doc, act, range)
		{
			var result = false;
			if (!range || !act)
				return result;

			var tar = doc.getElementById(act.tid);
			if (!tar)
			{
				return result;
			}
			var block = MSGUTIL.getBlock(range.startContainer);
			if (block && act.tid == block.getId())
				result = true;

			return result;
		}
	},

	procMessageFromUndoRedo: function(msg)
	{
		// 1.Chk for presentation specific messages and process them
		var undoMsg = this._setUndoFlagInMsgAct(msg);
		var continueProcess = this.processPresMsg(undoMsg, true);
		if (continueProcess)
		{
			this.processMessage(undoMsg, null, true);
		}
	},

	setRollbackInMsgAct: function(msg)
	{
		for ( var i = 0; i < msg.updates.length; i++)
		{
			msg.updates[i].rollBack = true;
		}
		return msg;
	},

	_setUndoFlagInMsgAct: function(msg)
	{
		for ( var i = 0; i < msg.updates.length; i++)
		{
			msg.updates[i].undoFlag = true;
		}
		return msg;
	}
});