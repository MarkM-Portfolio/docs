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

dojo.provide("pres.handler.CommentsHandler");
dojo.require("concord.widgets.CommentsEventListener");
dojo.declare("pres.handler.CommentsHandler", null, {
	msgType: 'comments',
	actAdd: 'add',
	actDelete: 'delete',
	actAppend: 'append',
	actUpdate: 'update',
	constructor: function()
	{
		this._regEvent();

	},
	_regEvent: function()
	{
		concord.util.events.subscribe(concord.util.events.comments_queryposition, this, "_handleQueryPosition");
		concord.util.events.subscribe(concord.util.events.commenting_popupDlg_click, this, "_handleCommentsBoxClick");
		concord.util.events.subscribe(concord.util.events.commenting_popupDlg_mouseOut, this, "_handlePopupCommentsBoxMouseOut");
		concord.util.events.subscribe(concord.util.events.commenting_addCommentPopupDlg, this, "_handleaddCommentPopup");
		concord.util.events.subscribe(concord.util.events.coeditingEvents, this, "handleSubscriptionCommentEventsForCoedit");
		concord.util.events.subscribe(concord.util.events.commenttingEvents, this, "handleSubscriptionCommentEventsForCoedit");
		concord.util.events.subscribe("/slide/inserted", this, "undoDeleteSlideComments");
		concord.util.events.subscribe("/slide/deleted", this, "deleteSlideComments");

		concord.util.events.subscribe("/mask/hide", this, "slideEditorReady");
	},
	deleteSlideComments: function(slide)
	{
		if (slide.elements)
		{
			dojo.forEach(slide.elements, function(ele)
			{
				var commentsId = ele.attrs.commentsid;
				if (commentsId && commentsId.length > 0)
				{
					var commentsArray = commentsId.split(' ');
					for ( var i = 0; i < commentsArray.length; i++)
					{
						concord.widgets.sidebar.CommentsController.publishDeleteEvent((commentsArray[i]));
					}
				}
			});
		}
	},
	undoDeleteSlideComments: function(slide)
	{
		if (slide.elements)
		{
			dojo.forEach(slide.elements, function(ele)
			{
				var commentsId = ele.attrs.commentsid;
				if (commentsId && commentsId.length > 0)
				{
					var commentsArray = commentsId.split(' ');
					for ( var i = 0; i < commentsArray.length; i++)
					{
						concord.widgets.sidebar.CommentsController.publishUndoDeleteEvent(commentsArray[i]);
					}
				}
			});
		}
	},
	//
	// Handle Comment events from pub/sub model for Coedit
	//
	handleSubscriptionCommentEventsForCoedit: function(data)
	{
		if (data.eventName == concord.util.events.commenttingEvents_eventName_addCommentIcon)
		{
			this.handleCoeditAddCommentIcon(data);
		}
		else if (data.eventName == concord.util.events.commenttingEvents_eventName_deleteCommentIcon)
		{
			this.handleCoeditDeleteCommentIcon(data);
		}
	},
	handleCoeditAddCommentIcon: function(data)
	{
		var drawFrameId = data.drawFrameId;
		var commentId = data.commentId;
		var box = pe.scene.slideEditor.getBoxByElementId(drawFrameId);
		if (box)
			box.refreshComments();
	},

	handleCoeditDeleteCommentIcon: function(data)
	{
		var drawFrameId = data.drawFrameId;
		var commentId = data.commentId;
		var box = pe.scene.slideEditor.getBoxByElementId(drawFrameId);
		if (box)
			box.refreshComments();
	},
	_handleQueryPosition: function(pos)
	{
		try {
			if (dojo.isIE < 10) {
				var editingBox = pe.scene.slideEditor.getEditingBox();
				if (editingBox && editingBox.element.table) {
					editingBox.exitEdit();
				}
			}
		} catch (e){}
		
		var icSize = pe.scene.slideEditor.commentIconSize;
		var icHight = icSize * 26 / 29;
		var commentsId = pos.id;
		if (commentsId)
		{
			var cBox = pe.scene.slideEditor.getBoxWithCommentId(commentsId);
			if (cBox)
			{
				cBox.refreshComments();
				if (cBox.status != cBox.STATUS_SELECTED)
				{
					cBox.enterSelection();
				}
				var commentImg = cBox.getCommentIconNode(commentsId);
				if (commentImg)
				{
					var index = 0;
					var cis = commentImg.parentElement.children;
					for ( var i = 0; i < cis.length; i++)
					{
						var ci = cis[i];
						if (ci == commentImg)
						{
							index = i;
							break;
						}
					}
					var styles = commentImg.parentElement.getBoundingClientRect();
					pos.filled = true;
					pos.x = styles.left + icSize / 2;
					pos.y = styles.top + icHight * index;
					pos.w = icSize;
					pos.h = icHight;
					delete this.incommentsSelected;
					return pos;
				}
			}
			else if (pe.scene.slideEditor.slide.hasComment(commentsId))
			{// maybe a slide comments
				var cBox = pe.scene.slideEditor;
				cBox.refreshComments();
				var commentImg = cBox.getCommentIconNode(commentsId);
				if (commentImg)
				{
					var index = 0;
					var cis = commentImg.parentElement.children;
					for ( var i = 0; i < cis.length; i++)
					{
						var ci = cis[i];
						if (ci == commentImg)
						{
							index = i;
							break;
						}
					}
					var styles = commentImg.parentElement.getBoundingClientRect();
					pos.filled = true;
					pos.x = styles.left + icSize / 2;
					pos.y = styles.top + icHight * index;
					pos.w = icSize;
					pos.h = icHight;
					delete this.incommentsSelected;
					return pos;
				}
			}

		}
		
		//no comments id it's mean that end user is just create new comment
		this.clickedComment = 1;
		var boxToComment = pe.scene.slideEditor.getSelectedContentboxForComment();
		if (boxToComment)
		{
			var commentImgs = boxToComment.getCommentIconNodes();
			var i = commentImgs.length;
			if (i == 0)
			{
				var useNode = boxToComment.commentsContainer || boxToComment.mainNode;
				var styles = useNode.getBoundingClientRect();
				pos.x = styles.left + styles.width + icHight / 3;
				pos.y = styles.top;
				pos.w = icSize;// styles.width;
				pos.h = icHight * 2 / 3;// styles.height;
				pos.filled = true;
				return pos;
			}
			else
			{
				var index = i;
				var styles = commentImgs[0].parentElement.getBoundingClientRect();
				pos.filled = true;
				pos.x = styles.left + icSize / 2;
				pos.y = styles.top + icHight * index;
				pos.w = icSize;
				pos.h = icHight * 2 / 3;
				return pos;
			}
		}
//		if (this.incommentsSelected)
//		{
//			pos.filled = true;
//			pos.x = -9999;
//			pos.y = -9999;
//			pos.w = icSize;
//			pos.h = icHight * 2 / 3;
//			return pos;
//		}
		//51461: [Regression] [Comment] Put focus into Speaker notes of slide, Comment is added for this Slide.
		var nodesEditor = pe.scene.notesEditor.getEditingBox();
		if(nodesEditor)
			nodesEditor.exitEdit();
		// no box selected, add comment to slide
		boxToComment = pe.scene.slideEditor;
		var commentImgs = boxToComment.getCommentIconNodes();
		var i = commentImgs.length;
		if (i == 0)
		{
			var useNode = boxToComment.commentsContainer || boxToComment.mainNode;
			var styles = useNode.getBoundingClientRect();
			pos.x = styles.left + styles.width + icHight / 3;
			pos.y = styles.top;
			pos.w = icSize;// styles.width;
			pos.h = icHight * 2 / 3;// styles.height;
			pos.filled = true;
			return pos;
		}
		else
		{
			var index = i;
			var styles = commentImgs[0].parentElement.getBoundingClientRect();
			pos.filled = true;
			pos.x = styles.left + icSize / 2;
			pos.y = styles.top + icHight * index;
			pos.w = icSize;
			pos.h = icHight * 2 / 3;
			return pos;
		}
	},
	_handleCommentsBoxClick: function()
	{
		this.clickedComment = true;
	},

	_handlePopupCommentsBoxMouseOut: function(commentsId)
	{
		if (this.clickedComment)
		{
			// focused comment mode,do nothing
			return;
		}
		else
		{
			this.hideComment();
		}
	},
	hideComment: function(commentsId)
	{
		this.activeCommentId = null;
		this.clickedComment = 0;
		concord.util.events.publish(concord.util.events.comments_deselected, []);
	},
	_handleaddCommentPopup: function(isOpen)
	{
		window.pe.scene.clickedComment = isOpen;
	},	
	commentsCreated: function(comment)
	{		
		if(comment && comment.items[0] && comment.items[0].getWarning()){
			this.publishInsCmtsMsg(comment, null);
			return;
		}
		
		this.activeCommentId = null;
		this.clickedComment = 0;
		var msgPairList = null;
		var selectedBoxs = pe.scene.slideEditor.getSelectedBoxes();
		if (selectedBoxs.length > 0)
		{
			var firstBox = selectedBoxs[0];
			if (firstBox != null)
			{
				msgPairList = firstBox.createCommentsLink(comment);
				var nid = firstBox.id;
				var lastUndo = pe.scene.undoManager.stack[pe.scene.undoManager.stack.length - 1];
				if (lastUndo && lastUndo.redo[0].type == 'rn' && lastUndo.redo[0].updates[1].p_nid == nid)
				{
					var ieop = lastUndo.redo[0].updates[1];
					ieop.p_obj.attrs.comments = true;
					var commentid = ieop.p_obj.attrs.commentsid || '';
					if (commentid.indexOf(comment.id) < 0)
					{
						var newcommentid = commentid + ' ' + comment.id;
						ieop.p_obj.attrs.commentsid = newcommentid.trim();
					}

					ieop = lastUndo.undo[0].updates[1];
					ieop.p_obj.attrs.comments = true;
					var commentid = ieop.p_obj.attrs.commentsid || '';
					if (commentid.indexOf(comment.id) < 0)
					{
						var newcommentid = commentid + ' ' + comment.id;
						ieop.p_obj.attrs.commentsid = newcommentid.trim();
					}
				}
			}
		}
		else
		{
			// add comment to slide
			var slide = pe.scene.slideEditor;
			if (slide != null)
			{
				msgPairList = slide.createCommentsLink(comment);
			}
		}
		pe.scene.msgPublisher.checkEditFlag(msgPairList, pe.scene.slideEditor.slide.id, true);
		this.publishInsCmtsMsg(comment, msgPairList);
	},
	cleanCommentsIDinOP: function(ieop, commentsId)
	{
		var oldAttrValue = ieop.p_obj.attrs.commentsid || '';
		var newAttrValue = oldAttrValue;
		if (oldAttrValue)
		{
			oldAttrValue = dojo.trim(oldAttrValue);
			newAttrValue = oldAttrValue.replace(commentsId, "");
			newAttrValue = dojo.trim(newAttrValue.replace("  ", " "));
			ieop.p_obj.attrs.commentsid = newAttrValue;
			var ids = newAttrValue.split(" ");
			if (newAttrValue == "")
			{
				ieop.p_obj.attrs.comments = "false";
			}
		}
	},
	updatUndoStackByCommentsDeleted: function(nid, commentsId)
	{
		var stack = pe.scene.undoManager.stack;
		for ( var i = 0; i < stack.length; i++)
		{
			var action = stack[i];
			if (action && action.redo[0].type == 'rn' && action.redo[0].updates[1].p_nid == nid)
			{
				var ieop = action.redo[0].updates[1];
				this.cleanCommentsIDinOP(ieop, commentsId);
				ieop = action.undo[0].updates[1];
				this.cleanCommentsIDinOP(ieop, commentsId);
			}
		}
	},
	commentsDeleted: function(commentsId)
	{
		this.activeCommentId = null;
		this.clickedComment = 0;
		var msgPairList = null;
		var box = pe.scene.slideEditor.getBoxWithCommentId(commentsId);
		if (box)
		{
			msgPairList = box.removeCommentIcon(commentsId);
			this.updatUndoStackByCommentsDeleted(box.id, commentsId);
		}
		else if (pe.scene.slideEditor.slide.hasComment(commentsId))
		{// is a slide comment
			msgPairList = pe.scene.slideEditor.removeCommentIcon(commentsId);
			this.updatUndoStackByCommentsDeleted(pe.scene.slideEditor.slide.id, commentsId);
		}
		this.publishDelCmtsMsg(commentsId, msgPairList);
	},

	commentsAppended: function(commentsId, item)
	{
		if (commentsId != null)
		{
			this.publishApdCmtsMsg(commentsId, item);
		}
	},
	commentsUpdated: function(commentsId, index, item)
	{
		if (commentsId != null)
		{
			var commentStore = pe.scene.sidebar.commentsController.store;
			var comment = commentStore.get(commentsId);
			var isResolved = comment.items[0].isResolved();
			if (isResolved)
			{
				this.activeCommentId = null;
				this.clickedComment = 0;
			}
			var cBox = pe.scene.slideEditor.getBoxWithCommentId(commentsId);
			if (cBox)
			{
				cBox.refreshComments();
			}
			else if (pe.scene.slideEditor.slide.hasComment(commentsId))
			{// it is a slide comment
				pe.scene.slideEditor.refreshComments();
			}
			this.publishUptCmtsMsg(commentsId, index, item);
		}
	},

	slideEditorReady: function()
	{
		if (this.incommentsSelected)
		{
			pe.scene.sidebar.commentsController._handleShowComments(this.activeCommentId);
		}
		delete this.incommentsSelected;
	},

	commentsSelected: function(commentsId)
	{
		this.incommentsSelected = true;
		this.publishCommentSelected(commentsId);
		this.activeCommentId = commentsId;
		this.clickedComment = 1;
	},
	publishCommentSelected: function(commentsId)
	{
		dojo.publish("/slides/commentselected", [commentsId]);
	},
	commentsUnSelected: function(commentsId)
	{
		this.activeCommentId = null;
		this.clickedComment = 0;
	},

	showComment: function(commentsId)
	{
		if (commentsId != null)
		{
			if (this.activeCommentId != commentsId)
			{
				concord.util.events.publish(concord.util.events.comments_selected, [commentsId, true]);
				this.activeCommentId = commentsId;
			}
		}
	},
	checkForEmptyPageWhenAddingComments: function()
	{
		return false;
	},
	//
	// When an object is deleted or undo the delete action,the associated comments will be hidden/shown accordingly.
	//
	deleteElementComments: function(commentsId)
	{
		if (commentsId != null)
		{
			var commentsArray = commentsId.split(' ');
			for ( var i in commentsArray)
			{
				var commentid = commentsArray[i];
				if (commentid.length > 0)
				{
					concord.widgets.sidebar.CommentsController.publishDeleteEvent(commentid);
				}
			}
		}
	},

	undoDeleteElementComments: function(commentsId)
	{
		if (commentsId != null)
		{
			commentsId = commentsId.trim();
			var commentsArray = commentsId.split(' ');
			for ( var i = 0; i < commentsArray.length; i++)
			{
				concord.widgets.sidebar.CommentsController.publishUndoDeleteEvent(commentsArray[i]);
			}
		}
	},

	// publish comments message on sidebar and document together ...
	// need generate a common event when to support undo/redo in the future.
	publishInsCmtsMsg: function(comment, msgPairList)
	{
		msgPairList = (msgPairList == null) ? [] : msgPairList;
		var msgPub = pe.scene.msgPublisher;
		// add comment into comment store on other clients.
		var sess = pe.scene.session;
		var msgCMTS = sess.createMessage();
		msgCMTS.type = this.msgType;
		msgCMTS.action = this.actAdd;
		msgCMTS.id = comment.id;
		msgCMTS.data = comment.items[0].e;
		var msgs = [msgCMTS].concat(msgPairList);
		msgPub.sendCombinedMessage(msgs);
	},
	publishDelCmtsMsg: function(commentsId, msgPairList)
	{
		msgPairList = (msgPairList == null) ? [] : msgPairList;
		var msgPub = pe.scene.msgPublisher;
		var sess = pe.scene.session;
		var msgCMTS = sess.createMessage();
		msgCMTS.type = this.msgType;
		msgCMTS.action = this.actDelete;
		msgCMTS.id = commentsId;
		var msgs = [msgCMTS].concat(msgPairList);
		msgPub.sendCombinedMessage(msgs);
	},
	publishApdCmtsMsg: function(commentsId, item)
	{
		var sess = pe.scene.session;
		var msg = sess.createMessage();
		msg.type = this.msgType;
		msg.action = this.actAppend;
		msg.id = commentsId;
		msg.data = item.e;
		sess.sendMessage([msg]);
	},
	publishUptCmtsMsg: function(commentsId, index, item)
	{
		var sess = pe.scene.session;
		var msg = sess.createMessage();
		msg.type = this.msgType;
		msg.action = this.actUpdate;
		msg.id = commentsId;
		msg.index = index;
		msg.data = item.e;
		sess.sendMessage([msg]);
	}
});