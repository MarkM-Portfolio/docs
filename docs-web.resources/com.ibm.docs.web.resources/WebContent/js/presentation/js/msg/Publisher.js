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

dojo.provide("pres.msg.Publisher");
dojo.require("pres.msg.PublisherUtils");
dojo.require("pres.msg.PublisherAttr");
dojo.require("pres.msg.PublisherPending");
dojo.require("pres.msg.PublisherInsDelJson");
dojo.require("pres.msg.PublisherSlideShow");

dojo.declare("pres.msg.Publisher", [pres.msg.PublisherUtils, pres.msg.PublisherSlideShow, pres.msg.PublisherAttr, pres.msg.PublisherInsDelJson, pres.msg.PublisherPending], {

	createMessage: function(type, actPairList, callback, data, isCtrl, asCtrl)
	{
		return this.createMessage2(type, type, actPairList, callback, data, isCtrl, asCtrl);
	},

	createMessage2: function(type, rtype, actPairList, callback, data, isCtrl, asCtrl)
	{
		var app = window['pe'];
		var sess = app.scene.session;

		var msg = sess.createMessage(isCtrl, asCtrl);
		var rMsg = sess.createMessage(isCtrl, asCtrl);
		msg.type = type;
		rMsg.type = rtype;
		if (!data)
		{
			msg.data = '';
			rMsg.data = '';
		}
		else
		{
			msg.data = data;
			rMsg.data = data;
		}

		msg.as = [];
		rMsg.as = []; // Acts

		for ( var i = 0; i < actPairList.length; i++)
		{
			var act = actPairList[i];
			if (act != null)
			{
				if (act.act != null)
					msg.as.push(act.act);
				if (act.rAct != null)
				{
					// Insert element
					if (act.rAct.actions)
					{
						// Reversed
						for ( var j = act.rAct.actions.length - 1; j >= 0; j--)
							rMsg.as.unshift(act.rAct.actions[j]);
						// rMsg.as.push(act.rAct.actions[j]);
					}
					else
						rMsg.as.unshift(act.rAct);
					// rMsg.as.push(act.rAct);
				}
			}
		}

		// TODO remove updates
		msg.updates = msg.as;
		rMsg.updates = rMsg.as;
		delete msg.as;
		delete rMsg.as;

		var msgPair = {
			"msg": msg,
			"rMsg": rMsg
		};

		if (msgPair.msg.updates.length == 0)
		{
			var act = {};
			msgPair.msg.updates.push(act);
			msgPair.rMsg.updates.push(act);
		}
		return msgPair;
	},

	createReplaceMsg: function(element, data)
	{
		var actPair = [];
		var index = dojo.indexOf(element.parent.elements, element);
		actPair.push(this.createDeleteElementAct(element, index));

		var elementCloned = element.clone();
		elementCloned.parent = element.parent;

		var hasStyle = false;
		if ("content" in data)
		{
			elementCloned.setContent(data.content);
		}
		if ("t" in data)
		{
			elementCloned.t = data.t;
			hasStyle = true;
		}
		if ("l" in data)
		{
			elementCloned.l = data.l;
			hasStyle = true;
		}
		if ("w" in data)
		{
			elementCloned.w = data.w;
			hasStyle = true;
		}
		if ("h" in data)
		{
			elementCloned.h = data.h;
			hasStyle = true;
		}
		if ("z" in data)
		{
			elementCloned.z = data.z;
			hasStyle = true;
		}
		if (hasStyle)
			elementCloned.attr("style", elementCloned.getFinalStyle());

		var act = this.createInsertElementAct(elementCloned, index);
		actPair.push(act);
		return this.createMessage(MSGUTIL.msgType.ReplaceNode, actPair);
	},

	createReplaceMsgForSlide: function(oldSlide, newSlide)
	{
		var actPair = [];
		var index = dojo.indexOf(oldSlide.parent.sliides, oldSlide);
		actPair.push(this.createDeleteElementAct(oldSlide, index));
		var act = this.createInsertElementAct(newSlide, index);
		actPair.push(act);
		return this.createMessage(MSGUTIL.msgType.ReplaceNode, actPair);
	},

	createSlidesSelectedMsg: function(ids)
	{
		var msgPair = this.createMessage(MSGUTIL.msgType.slideSelected, [], null, null, true, true);
		msgPair.msg.elemIds = ids;
		return msgPair;
	},

	createActivateEditModeMsg: function(elemId, editMode, initialEditServerSeq)
	{
		var msgPair = this.createMessage(MSGUTIL.msgType.contentBoxEditMode, [], null, null, false, true);
		msgPair.msg.elemId = elemId;
		msgPair.msg.editMode = editMode;
		msgPair.msg.initialEditServerSeq = initialEditServerSeq;
		return msgPair;
	},

	createRemoveUserLockMsg: function()
	{
		var msgPair = this.createMessage(MSGUTIL.msgType.removeUserLock, [], null, null, true);
		return msgPair;
	},

	createRequestLockStatusMsg: function()
	{
		var msgPair = this.createMessage(MSGUTIL.msgType.requestLockStatus, [], null, null, true);
		return msgPair;
	},

	preSend: function(msgList, rMsgList, data)
	{
		this._addSlideId(msgList, rMsgList); // add slide id to each msg for loading slide when the message is processed
	},

	_addSlideId: function(msgList, rmsgList)
	{
		var helper = pres.model.helper;
		for ( var i = 0; i < msgList.length; i++)
		{
			var updatesList = msgList[i].updates;
			var updatesRList = rmsgList[i].updates;
			if (updatesList != null)
			{
				for ( var j = 0; j < updatesList.length; j++)
				{
					var act = updatesList[j];
					var rAct = updatesRList[j];
					var slide = helper.getParentSlide(pe.scene.doc, act.tid);
					if (slide != null)
					{
						act.p_sid = slide.id;
						rAct.p_sid = slide.id;
					}
					var element = helper.getParentElement(pe.scene.doc, act.tid);
					if (element != null)
					{
						act.p_cid = element.id;
						rAct.p_cid = element.id;
					}
				}
			}
		}
	},
	createAddNewCommentMsg: function(elemId, commentId)
	{
		var msgPair = this.createMessage(MSGUTIL.msgType.addNewComment, []);
		msgPair.msg.elemId = elemId;
		msgPair.msg.commentId = commentId;
		return msgPair;
	},
	deleteCommentMsg: function(elemId, commentId)
	{
		var msgPair = this.createMessage(MSGUTIL.msgType.deleteComment, []);
		msgPair.msg.elemId = elemId;
		msgPair.msg.commentId = commentId;
		return msgPair;
	},
	// this is tempory used to send comments message both on sidebar and editors
	sendCombinedMessage: function(msgPairList, data)
	{
		var msgList = [];
		var aMsgList = [];
		var rMsgList = [];
		var scene = window['pe'].scene;
		for ( var i = 0; i < msgPairList.length; i++)
		{
			if (msgPairList[i].type == "comments")
			{
				msgList.push(msgPairList[i]);
			}
			else
			{
				var msg = msgPairList[i].msg;
				var rMsg = msgPairList[i].rMsg;
				if (msg.updates && msg.updates.length > 0)
				{
					aMsgList.push(msg);
					rMsgList.push(rMsg);
				}
				msgList.push(msg);
			}
		}
		this.preSend(aMsgList, rMsgList, data);
		if (msgList.length > 0)
		{
			scene.session.sendMessage(msgList);
		}
	},
	sendMessage: function(msgPairList, data, returnMsgPairList, undoMsgId, parked)
	{
		var msgList = [];
		var rMsgList = [];
		var scene = window['pe'].scene;

		// Use the flag to check if content size has been changed.
		// scene.editorContentChanged = true;

		for ( var i = 0; i < msgPairList.length; i++)
		{
			var msg = msgPairList[i].msg;
			var rMsg = msgPairList[i].rMsg;
			if (msg.updates.length <= 0)
				continue;

			msgList.push(msg);
			rMsgList.push(rMsg);
		}

		this.checkPending(msgPairList);
		this.preSend(msgList, rMsgList, data);

		if (msgList.length > 0)
		{
			// console.log('send msg from syn');
			// console.log(msgList);

			// TODO, BOB
			// PresCKUtil.normalizeMsgSeq1(msgList, undoMsgId, parked);

			// BOB, just send by now.
			window.pe.scene.session.sendMessage(msgList);

			if (this.addToUndoQ(msgList))
			{
				// TODO, BOB
				// PresCKUtil.normalizeMsgSeq(msgList, rMsgList, undoMsgId);

				// BOB, just record the undo .

				pe.scene.undoManager.addAction(msgList, rMsgList, false);
				// window.pe.scene.getEditor().recordUndo(msgList, rMsgList, mergeFlag);
			}
		}

		this.sendEditFlag(msgList, data);

		if (returnMsgPairList == true)
			return dojo.clone({
				'msgList': msgList,
				'rMsgList': rMsgList
			});
	},

	addToUndoQ: function(msgList)
	{
		var addToQ = true;
		if (!this._isAddToUndo(msgList))
		{
			addToQ = false;
		}
		else
		{
			for ( var i = 0; i < msgList.length; i++)
			{
				var msg = msgList[i];
				if (msg.type == MSGUTIL.msgType.slideSelected || msg.type == MSGUTIL.msgType.contentBoxEditMode || msg.type == MSGUTIL.msgType.slideShowCoview || msg.type == MSGUTIL.msgType.slideShowCoviewStart || msg.type == MSGUTIL.msgType.slideShowCoviewEnd || msg.type == MSGUTIL.msgType.slideShowCoviewJoin || msg.type == MSGUTIL.msgType.slideShowCoviewLeft || msg.type == MSGUTIL.msgType.templateApplied || (msg.type == MSGUTIL.msgType.layoutApplied && msgList.length == 1) || msg.type == MSGUTIL.msgType.addNewComment || msg.type == MSGUTIL.msgType.deleteComment || msg.type == MSGUTIL.msgType.requestLockStatus || msg.type == MSGUTIL.msgType.removeUserLock || msg.type == MSGUTIL.msgType.ResetContent || msg.type == "resetContent")
				{
					addToQ = false;
					break;
				}
				/*
				 * //if the layoutApplied is a message by itself, do not put in undo queue //since this is non operation message, user would experience like a blank undo else if(msg.type == MSGUTIL.msgType.layoutApplied && msgList.length==1){//if this is the only one, set addToQ to false. addToQ = false; break; }
				 */
			}
		}
		return addToQ;
	},
	addUndoFlag: function(msgPair, addToUndo)
	{
		var msg = msgPair.msg;
		var rMsg = msgPair.rMsg;
		msg.updates[0].addToUndoFlag = addToUndo;
		rMsg.updates[0].addToUndoFlag = addToUndo;
		return {
			'msg': msg,
			'rMsg': rMsg
		};
	},
	_isAddToUndo: function(msgList)
	{
		for ( var i = 0; i < msgList.length; i++)
		{
			var updatesList = msgList[i].updates;
			if (updatesList != null)
			{
				for ( var j = 0; j < updatesList.length; j++)
				{
					var act = updatesList[j];
					if ((typeof act.addToUndoFlag != undefined && act.addToUndoFlag != null))
					{
						return act.addToUndoFlag;
					}
				}
			}
		}
		return true;
	}

});