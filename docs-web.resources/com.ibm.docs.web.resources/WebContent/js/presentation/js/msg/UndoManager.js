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

dojo.provide("pres.msg.UndoManager");
dojo.require("concord.util.mobileUtil");
dojo.require("concord.pres.MsgUtil");
dojo.requireLocalization("concord.widgets","slideEditor");

dojo.declare("pres.msg.UndoManager", null, {

	enabled: true,

	constructor: function()
	{
		this.reset();
		this.STRINGS = dojo.i18n.getLocalization("concord.widgets","slideEditor");
	},

	reset: function() // Reset the undo stack.
	{
		/**
		 * Stack for all the undo and redo snapshots, they're always created/removed in consistency.
		 */
		this.stack = [];

		/**
		 * Current snapshot history index.
		 */
		this.index = -1;
		this.mergeSIndx = -1;
		this.limit = 20; // TODO
		this.processingUndoRedo = false;
		this.mergestack = [];

		this.onChange();
	},

	onChange: function()
	{

	},

	hasUndo: function()
	{
		return this.index != -1 ? true : false;
	},

	hasRedo: function()
	{
		return this.index < this.stack.length - 1 ? true : false;
	},

	/**
	 * Check the current redo state.
	 * 
	 * @return {Boolean} Whether the document has previous state to retrieve.
	 */
	redoable: function()
	{
		var redoable = false;
		if (this.enabled && this.hasRedo())
		{
			redoable = true;
			var msgList = this.stack[this.index + 1].redo;
			// if(!msgList && this.stack[this.index+1].flg)
			// return redoable;
			for ( var i = 0; i < msgList.length; i++)
			{
				if (msgList[i].disableRedo != null)
				{
					redoable = false;
					break;
				}
			}
		}
		return redoable;
	},

	/**
	 * Check the current undo state.
	 * 
	 * @return {Boolean} Whether the document has future state to restore.
	 */
	undoable: function()
	{
		var undoable = false;
		if (this.enabled && this.hasUndo())
		{
			undoable = true;
			var msgList = this.stack[this.index].undo;
			// if(!msgList && this.stack[this.index].flg)
			// {
			// if(this.stack[this.index-1] && this.stack[this.index-1].undo)
			// {
			// msgList = this.stack[this.index-1].undo;
			// }
			// else
			// return false;
			// }
			for ( var i = 0; i < msgList.length; i++)
			{
				if (msgList[i].disableUndo != null)
				{
					undoable = false;
					break;
				}
			}
		}
		return undoable;
	},

	/**
	 * Checks if nodes in message are still present in document
	 * 
	 * @return {Boolean} Whether the nodes in message are valid
	 */
	msgNodesValid: function(msgList, undo)
	{
		var valid = true;
		// let's check nodes in msgList

		for ( var i = 0; i < msgList.length; i++)
		{
			var msg = msgList[i];
			if (!this.isMsgOk(msg, undo))
			{
				valid = false;
				break;
			}
		}
		return valid;
	},

	isMsgOk: function(msg, undo)
	{
		var doc = pe.scene.doc;
		var updates = msg.updates;
		var ok = true;

		// D15378 - Check if content is locked by another user if we are not in single user mode
		// Unfortunately we need to check for locked content first only if in coedit mode
		if (!window.pe.scene.session.isSingleMode())
		{
			for ( var i = 0; i < updates.length; i++)
			{
				var act = updates[i];
				// D17119 - do not check if locked by another user if the message type is insert element
				// because the content box will not exist
				if (typeof act.tid != undefined && act.tid != null && act.tid.length > 0 && act.t != "ie")
				{
					var ele = pe.scene.doc.find(act.tid);
					if (ele instanceof pres.model.Element && pe.scene.locker.isLockedByOther(ele.id))
					{
						ok = false;
						var msgToDisplay = this.STRINGS.contentInUse;
						window.pe.scene.showWarningMessage(msgToDisplay, 5000);
						// defect 31020, show alert at the mobile side.
						pe.scene.isMobile && concord.util.mobileUtil.showErrorMessage(msgToDisplay);
						return ok;
					}
				}
			}
		}

		var isRNMsg = (msg.type == MSGUTIL.msgType.ReplaceNode);
		for ( var i = 0; i < updates.length; i++)
		{
			var act = updates[i];
			// if a delete element ensure element is there for deletion
			if (act.t == MSGUTIL.actType.deleteElement)
			{
				if (typeof act.p_nid != undefined && act.p_nid != null && act.p_nid.length > 0 && act.has_ie_de_inlist != true)
				{ // check if there is a flag (has_ie_de_inlist) indicating same element delete and insert in this message, if this flag is true, we need to allow this message
					if (!isRNMsg && !doc.find(act.p_nid))
					{
						ok = false;
						var msgToDisplay = (undo) ? this.STRINGS.undoContentNotAvailable : this.STRINGS.redoContentNotAvailable;
						window.pe.scene.showWarningMessage(msgToDisplay, 5000);
						// defect 31020, show alert at the mobile side.
						pe.scene.isMobile && concord.util.mobileUtil.showErrorMessage(msgToDisplay);
						break;
					}
				}
			}
			// if a insert element ensure element is not there before inserting
			if (act.t == MSGUTIL.actType.insertElement)
			{
				if (typeof act.p_nid != undefined && act.p_nid != null && act.p_nid.length > 0 && act.has_ie_de_inlist != true)
				{// check if there is a flag (has_ie_de_inlist) indicating same element delete and insert in this message, if this flag is true, we need to allow this message
					if (!isRNMsg && doc.find(act.p_nid))
					{
						ok = false;
						var msgToDisplay = (undo) ? this.STRINGS.undoContentAlreadyExist : this.STRINGS.redoContentAlreadyExist;
						window.pe.scene.showWarningMessage(msgToDisplay, 5000);
						// defect 31020, show alert at the mobile side.
						pe.scene.isMobile && concord.util.mobileUtil.showErrorMessage(msgToDisplay);
						break;
					}
				}
			}

		}
		return ok;
	},

	//update the index to use the current one to avoid the coediting slide sequence error issue.
	fixDeleteSlideIdx: function(msg)
	{
		var doc = pe.scene.doc;
		var updates = msg.updates;
		var isRNMsg = (msg.type == MSGUTIL.msgType.ReplaceNode);
		for ( var i = 0; i < updates.length; i++)
		{
			var act = updates[i];
			var ele = doc.find(act.p_nid);
			if (act.t == MSGUTIL.actType.deleteElement && !isRNMsg && act.p_type == "slide")
			{
				var cIdx = dojo.indexOf(doc.slides,ele);
				act.idx = cIdx;
				act.p_osc = doc.slides.length;
			}
		}
	},
	
	/**
	 * Perform undo on current index.
	 */
	undo: function()
	{
		// window.pe.scene.slideEditor.chkPendingChangesForAll(); //D9613
		var msgPub = pe.scene.msgPublisher;
		msgPub.sendPending();
		// PresCKUtil.runPending();
		this.mergeSIndx = -1;
		if (this.mergestack.length > 0)
		{
			this.stack = this.stack.concat(this.mergestack);
			this.mergestack.length = 0;
			this.dealLimit();
		}
		if (this.undoable())
		{
			// console.log('undo 1');
			var msgList = this.getAction(true);
			var rmsgList = this.getAction(false, true);
			if (this.msgNodesValid(msgList, true))
			{
				// transform redo result base on undo result if there is delete action in undo msg
				// console.log('undo 2');
				var hasDelOrInsertAct;
				for ( var i = 0; i < msgList.length; i++)
				{
					var msg = msgList[i];
					var rmsg = rmsgList[msgList.length - i - 1];
					if (msg.updates.length == 0)
					{
						rmsg.updates = [];
						rmsgList[msgList.length - 1 - i] = rmsg;
						continue;
					}

					hasDelOrInsertAct = MSGUTIL.hasDelOrInsertAct(msg);
					if (hasDelOrInsertAct && msg.ot)
					{
						if (!MSGUTIL.isReplaceNode(msg) && !MSGUTIL.isSplitJoin(msg) && msg.updates.length > rmsg.updates.length)
						{// split one delete action into two
							continue;
						}
						rmsg = this.transformUndoRedo(msg).rMsg;
						for ( var j = 0; j < msg.updates.length; j++)
						{
							if (msg.updates[j].isOTAdded)
								rmsg.updates[msg.updates.length - 1 - j].isOTAdded = true;
						}
						rmsgList[msgList.length - 1 - i] = rmsg;
					}
				}
				// console.log('undo 3');
				this.performAction(msgList);
				// 26704 this set preSnapShot should be move to coediting key down event after refactor the delete&backspace function.
				// TODO
				// PresCKUtil.setPreSnapShot(window.pe.scene.getEditor());
				return true;
			}
			else
			{// some nodes are not valid in the messages let's skip to the next one on the stack
				// no need to reduce index already reduced from getAction
				// this.index = this.index-1;
				// console.log('undo 4');
				this.onChange();
				this.undo();
			}
		}

		return false;
	},

	/**
	 * Perform redo on current index.
	 */
	redo: function()
	{
		var msgPub = pe.scene.msgPublisher;
		msgPub.sendPending();
		// window.pe.scene.slideEditor.chkPendingChangesForAll(); //D9613
		// PresCKUtil.runPending();
		this.mergeSIndx = -1;
		if (this.redoable())
		{
			var msgList = this.getAction(false);
			if (this.msgNodesValid(msgList, false))
			{
				this.performAction(msgList);
				// 26704 this set preSnapShot should be move to coediting key down event after refactor the delete&backspace function.
				// TODO
				// PresCKUtil.setPreSnapShot(window.pe.scene.getEditor());
				return true;
			}
			else
			{
				// no need to reduce index already reduced from getAction
				// this.index = this.index-1;
				this.onChange();
				this.redo();
			}
		}
		return false;
	},

	addAction: function(msgList, rmsgList, mergeFlag)
	{
		if (this.index < this.stack.length - 1)
			this.stack.splice(this.index + 1, this.stack.length - this.index - 1); // remove from the index and the rest keep index

		var action = {};
		if (mergeFlag)
		{
			if (mergeFlag == 'beginMerge')
			{
				if (this.mergestack.length > 0)
				{
					this.stack = this.stack.concat(this.mergestack);
					this.mergestack.length = 0;
					this.dealLimit();
				}
				this.mergeSIndx = this.index + 1;
			}
			else
			{
				// console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~merge');
				this.merge();
				this.dealLimit();
			}
			return;
		}
		else
		{
			action.undo = rmsgList.reverse();
			action.redo = msgList;
		}
		if (action != undefined && action.undo && action.redo)
		{
			if (this.mergestack.length > 0)
				this.mergestack.push(action);
			else
			{
				// jmt- only update index if we are not traversing the undo queue
				this.stack.push(action);
				if ((this.stack.length > this.limit) && (this.mergeSIndx >= 0) && (this.mergeSIndx <= this.stack.length))
					this.mergestack = this.stack.splice(this.mergeSIndx, this.stack.length - this.mergeSIndx);
			}
			if (this.mergeSIndx < 0)
			{
				this.mergestack.length = 0;
				this.dealLimit();
			}

			if (!this.processingUndoRedo)
			{
				this.index = this.stack.length - 1;
			}
		}
		this.onChange();
	},
	dealLimit: function()
	{
		var breakwhile = false;
		while ((this.stack.length > this.limit) && !breakwhile)
		{
			breakwhile = this.removeOutOfLimit();
		}
		if (!this.processingUndoRedo)
		{
			this.index = this.stack.length - 1;
		}
	},
	removeOutOfLimit: function()
	{
		var topaction = this.stack[0];
		var msgs = topaction.redo;
		var sendoutList = window['pe'].scene.session.sendoutList;
		var find = false;
		for ( var i = 0; !find && i < msgs.length; i++)
		{
			for ( var j = 0; j < sendoutList.length; j++)
			{
				if (msgs[i].client_seq == sendoutList[j].client_seq)
				{
					find = true;
					return true;
				}
			}
		}
		// when the message is still waiting server's confirm, it should not be removed from undo list,
		// because co-edit need undo/redo list to resolve conflict issue.
		if (!find)
		{
			this.stack.shift();
			this.mergeSIndx = this.mergeSIndx - 1;
			this.onChange();
		}
	},
	stripInvalidUndo: function()
	{
		var cloneStack = [];
		for ( var i = 0; i < this.stack.length; i++)
		{
			if (!this.stack[i].flg)
				cloneStack.push(this.stack[i]);
			else
			{
				this.flgCount--;
				if (i <= this.index)
					this.index--;
			}

		}
		this.stack = cloneStack;
		this.onChange();
	},
	getAction: function(isUndo, isFromUndo)
	{
		if (isUndo)
		{
			if (this.hasUndo())
			{
				if (this.mergeSIndx != -1)
					this.mergeSIndx = -1;
				// if(this.flgCount > 0)
				// this.stripInvalidUndo();
				var action = this.stack[this.index];
				this.index = this.index - 1;
				return action.undo;
			}
		}
		else
		{
			if (this.hasRedo())
			{
				// if(this.flgCount > 0)
				// this.stripInvalidUndo();
				this.index = this.index + 1;
				var action = this.stack[this.index];
				if (isFromUndo)// when perform undo,we just need redo message,but we don't actually redo
					this.index = this.index - 1;
				return action.redo;
			}
		}
		return null;
	},
	merge: function()
	{
		if (this.mergestack.length > 0)
		{
			this.stack = this.stack.concat(this.mergestack);
			this.mergestack.length = 0;
		}

		if (this.mergeSIndx < 0 || this.stack.length <= 1)
			return;
		var cloneStack = [];
		for ( var i = 0; i < this.mergeSIndx; i++)
		{
			cloneStack.push(this.stack.shift());
		}
		if (this.stack.length > 0)
		{

			var act = {};
			while (this.stack.length > 0)
			{
				var mergedAct = this.stack.pop();
				if (act.undo && act.undo.length > 0)
				{
					act.undo = act.undo.concat(mergedAct.undo);
					try
					{
						act.redo = mergedAct.redo.concat(act.redo);
					}
					catch (e)
					{
						console.log(e);
					}
				}
				else
				{
					act.undo = mergedAct.undo;
					act.redo = mergedAct.redo;
				}

			}
			cloneStack.push(act);
		}
		this.stack = cloneStack;
		this.index = this.stack.length - 1;
		this.mergeSIndx = -1;
		this.onChange();
		return;
	},

	/*
	 * _merge : function() { var cloneStack = []; while (this.stack.length > 0) { if(this.stack[0].flg) { this.stack.shift(); this.flgCount--; var act = {}; var actIsNull = true; while(this.stack.length > 0 ) { actIsNull = false; var mergedAct = this.stack.pop(); if(act.undo && act.undo.length>0) { act.undo = act.undo.concat(mergedAct.undo); try{ act.redo = mergedAct.redo.concat(act.redo); }catch(e) { console.log(e); } } else { act.undo = mergedAct.undo; act.redo = mergedAct.redo; } } if(!actIsNull) cloneStack.push(act); } else cloneStack.push(this.stack.shift()); } this.stack = cloneStack; this.index = this.stack.length-1; return; },
	 */
	// wj
	mergeTopTwo: function()
	{
		// if(this.index >= 1)
		// {
		// var topOneAction = this.stack[this.index];
		// var elementnew = topOneAction.redo[0].updates[0].tid;
		// var validMsg = false;
		// for(var i = this.index - 1; i >= 0 ; i--)
		// {
		// var formerAction = this.stack[i];
		// var element = formerAction.redo[0].updates[0].tid;
		//			
		// if(elementnew == element&&
		// formerAction.redo[0].updates[0].flag == "Resizing" )
		// {
		// formerAction.redo = topOneAction.redo;
		// formerAction.undo[0].updates[0].flag = topOneAction.redo[0].updates[0].flag;
		// this.removeAction(this.index);
		// validMsg = true;
		// return;
		// }
		// }
		// //if going to here that means no message need be merged,
		// //and if the message is Ending message, that means it is a useless message, just remove it.
		// if(topOneAction.redo[0].updates[0].flag == "ResizingEnd")
		// this.removeAction(this.index);
		// }
	},

	// unconditionaly merge the top 2 actions
	mergeTop2: function()
	{
		console.log('mergeTop2');
		if (this.stack.length >= 2)
		{
			var act1 = this.stack.pop();
			var act2 = this.stack.pop();
			var act = {};
			act.undo = act1.undo.concat(act2.undo);
			act.redo = act2.redo.concat(act1.redo);
			this.stack.push(act);
			this.index--;
			this.onChange();
		}
		else
		{
			console.info('Less than 2 actions!');
		}
	},
	// merge the top 2 actions ... undo is also re-ordered
	// use this if order of operations is important in the merge
	// for instance when adding multiple rows and columns indexes of other rows/columns might shift
	// whenever a new row/column is added to the middle of the table
	mergeTop2WithReorderedUndo: function()
	{
		// console.log('mergeTop2WithReorderedUndo');
		// if(this.stack.length == 2) {
		// var act1 = this.stack.pop();
		// var act2 = this.stack.pop();
		//			
		// var act = {};
		// act.undo = act1.undo.concat(act2.undo);
		// act.redo = act2.redo.concat(act1.redo);
		// this.stack.push(act);
		// this.index --;
		// }else if(this.stack.length > 2){
		// var act2 = this.stack.shift();
		// var act1 = this.stack.shift();
		// var cloneStack = dojo.clone(this.stack);
		// this.stack = [];
		// var act = {};
		// act.undo = act1.undo.concat(act2.undo);
		// act.redo = act2.redo.concat(act1.redo);
		// this.stack.push(act);
		// this.stack = this.stack.concat(cloneStack);
		// this.index --;
		// }
		// else {
		// console.info('Less than 2 actions!');
		// }
	},

	performAction: function(msgListOrig)
	{
		// console.log('performAction1');
		var msgList = dojo.clone(msgListOrig);// Work on clone message instead for D3699 so we don't splice messages on the stack
		this.processingUndoRedo = true;
		var isLayoutChangeMsg = false;
		var PROCMSG = pe.scene.msgReceiver;
		for ( var i = 0; i < msgList.length; i++)
		{
			var msg = msgList[i];
			if (msg.updates != null && msg.updates.length == 0) // ts added the check if updates is null
				continue;
			//in undo stack, the slide idx is still using the orginal one, need update to the correct one
			//52476: [Coedit]Slide number and slide sequence wrong after some operation on slides with 20 users
			this.fixDeleteSlideIdx(msg);
			// 1 update to correct client seq and server seq
			var app = window['pe'];
			var sess = app.scene.session;

			msg.server_seq = sess.getCurrentSeq();

			// 2 apply to local editor
			var isMsgToProcess = true; // a flag to indicate if the message is to be continued processed or not
			var msgToProcess = msg;
			// if (id == "canvasDoc")
			{
				// we need to pass in just the clone of the msg when processing canvasDoc, not the real msg.
				// Because in processing canvasDoc, the msg is going to be updated with different idx and we don't want to send this msg out
				// because of passing by reference in javascript, the msg we pass in to processMessage for canvas doc is going to be updated and it means we are updating the msg here
				// that we want to send out to server.
				// defect 7282
				msgToProcess = dojo.clone(msg);
			}
			// to check whether the msg is OK to be continued to be processed (check if it is locked, if it is already existing for insert, etc)
			isMsgToProcess = this.isMsgToContinueProcess(msgToProcess);
			if (isMsgToProcess)
			{ // if not to further process, skip the PROCMSG.processMessage

				// Keep the contentbox status before perform action.
				var inEditMode = false;
				var inSelectMode = false;
				var fromUndo = msgToProcess.updates[0].undoFlag;
				var contentBox = null;
				var isRNMsg = msgToProcess.type == "rn";
				// Make multiple content box selected again
				// when resizing
				var contentBoxStatus = [];
				
				var ids = [];
				dojo.forEach(msgToProcess.updates, function(u)
				{
					if (u.p_nid && dojo.indexOf(ids, u.p_nid) == -1)
						ids.push(u.p_nid);
				});
				
				if (isRNMsg && ids.length)
				{
					dojo.publish("/msg/rn/before", [ids]);
				}

				// If the doc is seck and msg type is delete or insert row/col,
				// or is resize column,the undo msg need to be special handled
				// for seck doc.
				if (msgToProcess.updates[0].flag == "doi" || msgToProcess.updates[0].flag == "cs")
				{
					PROCMSG.processStructChangeMsg(msgToProcess, docs[id], id);
				}
				else
				{
					{
						// console.log('performAction6');
						PROCMSG.procMessageFromUndoRedo(msgToProcess);
					}
				}

				// Restore the contentbox status after perform action.
				if (isRNMsg && ids.length)
				{
					dojo.publish("/msg/rn/after", [ids]);
				}
			}
			// console.log('performAction7');
			// if the msg is not to be continued to processed, move it out from the msgList
			if (isMsgToProcess == false)
			{
				msgList.splice(i, 1);
				i = i - 1;
			}
			// console.log('performAction8');
			// processMessage may send message again, although this is unexpected behavior,
			// we still postpone to correct client sequence to workaround it
			msg.orig_client_seq = msg.client_seq;
			msg.client_seq = sess.increaseClientSeq();

			// check if this is a layout change msgList by checking if the msg is attribute (type=a) and the attribute listed is presentation_presentation-page-layout-name
			if ((msg.type == "a" && msg.updates[0] != null && msg.updates[0].a != null && msg.updates[0].a["presentation_presentation-page-layout-name"] != null) || msg.type == "layoutApplied")
			{
				isLayoutChangeMsg = true;
			}
			// console.log('performAction9');
			// 3 send to server

			// select the slide after processing the msg
			if (i == msgList.length - 1)
			{
				if (msg.updates[0].p_sid != null)
				{
					dojo.publish("/msg/undo/back", [msg.updates[0].p_sid]);
				}
			}

			// console.log('performAction10');
		}

		// Incoming message will be OT with sendingOutList message and undo/redo message,
		// if we don't clone it here, this message would be OT twice
		if (msgList != null && msgList.length > 0)
		{
			// after processing the message locally, try to see if the message is to be sent out
			// if "applyTemplate" message, do not send out to other clients
			if (msgList[0] != null && msgList[0].type != "applyTemplate")
			{
				var msgListClone = dojo.clone(msgList);

				// remove undoFlag here before we send it out
				for ( var i = 0; i < msgListClone.length; i++)
				{
					var acts = msgListClone[i].updates;
					if (acts != null)
					{
						for ( var j = 0; j < acts.length; j++)
						{
							var act = acts[j];
							if (act.undoFlag)
							{
								delete act.undoFlag;
							}
						}
					}
				}

				sess.sendMessage(msgListClone);
			}
		}
		// console.log('performAction11');
		this.onChange();
		this.processingUndoRedo = false;
	},

	removeAction: function(index)
	{
		var action = this.stack[index];

		this.stack.splice(index, this.stack.length - index); // remove from the index and the rest

		if (!this.processingUndoRedo)
		{
			this.index = this.stack.length - 1;
		}

		this.onChange();

		return action;
	},
	removeSingleAction: function(index)
	{
		var action = this.stack[index];

		this.stack.splice(index, 1); // we want to keep the rest of the stack

		if (!this.processingUndoRedo)
		{
			this.index = this.stack.length - 1;
		}

		this.onChange();

		return action;
	},

	transform: function(baseMsg)
	{
		var baseList = new Array();
		baseList.push(baseMsg);

		var undoList = new Array();
		var redoList = new Array();

		for ( var i = 0; i < this.stack.length; i++)
		{
			var action = this.stack[i];
			undoList = action.undo.concat(undoList);// from top to bottom
			redoList = redoList.concat(action.redo);// from bottom to top
		}
		var msg;
		if (baseMsg.type == MSGUTIL.msgType.Task)
		{
			msg = undoList[0];
			if (msg != null)
				msg.disableUndo = true;
			msg = (redoList.length > 0) && redoList[redoList.length - 1];
			if (msg != null)
				msg.disableRedo = true;
			undoManager.onChange();
			return;
		}
		var origBaseList = dojo.clone(baseList);
		// transform with undo first
		for (i = 0; i < undoList.length; i++)
		{
			msg = undoList[i];
			OTSERVICE.transform(msg, baseList, true);
			msg.ot = true;
			baseList = dojo.clone(origBaseList);
		}
		// then transform with redo with transform result of undo
		for (i = 0; i < redoList.length; i++)
		{
			msg = redoList[i];
			OTSERVICE.transform(msg, baseList, true);
			msg.ot = true;
			baseList = dojo.clone(origBaseList);
		}
	},

	transformUndoRedo: function(undoMsg)
	{
		var editor = window['pe'].scene.getEditor();
		var targetDoc = editor.document.$;
		var actType = MSGUTIL.actType;
		var len = undoMsg.updates.length;
		var act;
		var acts = [];
		for ( var i = 0; i < len; i++)
		{
			var msg = undoMsg.updates[i];
			if (msg.t == actType.deleteElement)
			{
				act = SYNCMSG.createDeleteElementAct(msg.idx, msg.len, msg.tid, msg.elist, true);
				acts.push(act);
			}
			else if (msg.t == actType.insertElement)
			{
				act = SYNCMSG.createInsertElementAct(msg.idx, msg.tid, msg.s, true);
				acts.push(act);
			}
			else if (msg.t == actType.deleteText)
			{
				act = SYNCMSG.createDeleteTextAct(msg.idx, msg.idx + msg.len, msg.tid);
				acts.push(act);
			}
			else if (msg.t == actType.insertText)
			{
				act = SYNCMSG.createInsertTextAct(msg.idx, msg.idx + msg.len, msg.tid, null);
				acts.push(act);
			}
		}
		var undoMsgType = undoMsg.type;
		var redoMsgType = undoMsg.type;
		if (undoMsgType == MSGUTIL.msgType.Split)
			redoMsgType = MSGUTIL.msgType.Join;
		else if (undoMsgType == MSGUTIL.msgType.Join)
			redoMsgType = MSGUTIL.msgType.Split;
		var msgPairList = SYNCMSG.createMessage2(undoMsgType, redoMsgType, acts, null, undoMsg.data);
		return msgPairList;
	},

	getMsgIndex: function(msg, isUndo)
	{
		var stackIndex = -1;
		for ( var i = 0; i < this.stack.length; i++)
		{
			var msgList;
			if (isUndo)
			{
				msgList = this.stack[i].undo;
			}
			else
				msgList = this.stack[i].redo;

			var find = false;
			var interIndex = 0;
			for ( var j = 0; j < msgList.length; j++)
			{
				if ((msgList[j].client_seq == msg.client_seq) || (msgList[j].client_seq == msg.orig_client_seq))
				{
					find = true;
					interIndex = j;
					break;
				}
			}
			if (find)
			{
				stackIndex = i;
				break;
			}
		}
		return {
			"stackIndex": stackIndex,
			"interIndex": interIndex
		};
	},

	rollbackAction: function(msg)
	{
		// This is a restore message. If need to rollback it the client need reload. Return true will reload it.
		if (msg.failover == "yes" && msg.type == MSGUTIL.msgType.presResetContent)
		{
			window.location.reload(); // 30445, window reload to avoid the partial loading bug.
			return true;
		}
		// get conflict msg index on stack
		var stack = this.getMsgIndex(msg, false);
		var stackIndex = stack.stackIndex;
		if (stackIndex == -1)
			return;
		var interIndex = this.stack[stackIndex].undo.length - 1 - stack.interIndex;// transform index of redo list to index of undo list

		// roll back actions
		var receiver = pe.scene.msgReceiver;
		for ( var i = this.index; i >= stackIndex; i--)
		{
			var msgList = this.stack[i].undo;
			for ( var j = 0; j < msgList.length; j++)
			{
				var msg = msgList[j];
				if (msg.updates.length == 0)
					continue;

				receiver.setRollbackInMsgAct(msg);
				receiver.processMessage(msg, null, true);

				if (i == stackIndex && j > interIndex)// should send out undo message again
				{
					// 1 update to correct client seq and server seq
					var app = window['pe'];
					var sess = app.scene.session;
					msg.client_seq = sess.increaseClientSeq();
					msg.server_seq = sess.getCurrentSeq() - 1;

					// 2 send to server
					sess.sendMessage(msg);
				}
			}
		}

		// remove roll backed actions on undo stack
		this.removeAction(stackIndex);
	},

	// to check a delete undo/redo message if the element to be deleted is locked by other user
	// to check a insert undo/redo message if the element to be inserted is already existing in the document
	// (for scenario that the undo delete slide was skipped because the slide was locked then the redo of the insert slide should not be pefromed since it wasn't deleted (still existed)
	// return false for both above cases, true otherwise.
	isMsgToContinueProcess: function(msg)
	{
		var doc = pe.scene.doc;

		if (msg)
		{
			// fix defect 27064
			// TODO, BOB
			if (msg.type && msg.type == "applyTemplate")
			{
				if (!window.pe.scene.session.isSingleMode())
				{
					var eventData = [{
						'eventName': concord.util.events.slideSorterEvents_eventName_launchContentLockDialog,
						'objId': null
					}];
					concord.util.events.publish(concord.util.events.slideSorterEvents, eventData);
					return false;
				}
			}
			var acts = msg.as || msg.updates;
			var actType = MSGUTIL.actType;
			if (acts != null)
			{
				var removedId = {}, isMoveMsg = (msg.type == MSGUTIL.msgType.MoveSlide || msg.type == MSGUTIL.msgType.ReplaceNode);
				for ( var i = 0; i < acts.length; i++)
				{
					var act = acts[i];
					var isNodeASlideWrapper = (act.p_isnasw == null) ? false : act.p_isnasw;
					var isNodeADrawFrame = (act.p_isnad == null) ? false : act.p_isnad;
					var nodeId = act.p_nid;
					var targetNode = doc.find(nodeId);

					switch (act.t)
					{
						case actType.insertElement:
						{
							// check if the element is a slide wrapper or a draw_frame
							if (isNodeASlideWrapper == true || isNodeADrawFrame == true)
							{
								if (isMoveMsg && act.p_nid && removedId[act.p_nid]) // The element will be removed in this message.
									continue;

								if (targetNode)
								{
									// do nothing, skip the already existing element
									// this may be caused by the delete from undo was skipped because the element was locked, the redo of insert undeleted element is then skipped, since the element is already there
									return false;
								}
							}

						}
						case actType.deleteElement:
						{
							if (isMoveMsg && act.p_nid)
								removedId[act.p_nid] = 1;
							// check if the element is a slide wrapper or a draw_frame
							// since we only lock on slide wrapper and draw_frame
							if (isNodeASlideWrapper == true || isNodeADrawFrame == true)
							{
								var nodeIdToCheckLock = nodeId;
								if (targetNode)
								{
									if (isNodeASlideWrapper)
									{
										nodeIdToCheckLock = targetNode.id;
									}
									if (pe.scene.locker.isLockedByOther(nodeIdToCheckLock, !isNodeADrawFrame))
									{
										var eventData = [{
											'eventName': concord.util.events.slideSorterEvents_eventName_launchContentLockDialog,
											'objId': nodeIdToCheckLock
										}];
										concord.util.events.publish(concord.util.events.slideSorterEvents, eventData);
										return false;
									}
								}
							}

						}
					}
				}
			}
		}
		return true;
	}
});