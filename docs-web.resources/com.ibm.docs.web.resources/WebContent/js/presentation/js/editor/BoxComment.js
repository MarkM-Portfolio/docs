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

dojo.provide("pres.editor.BoxComment");
dojo.declare("pres.editor.BoxComment", null, {

	constructor: function()
	{
		this.displayedCommentIds = [];
		this.selectedCommentId = null;
	},

	destroyAllCommentIconNodes: function()
	{
		dojo.query(".imgcomment", this.commentsContainer).forEach(dojo.destroy);
		if (this.commentsContainer)
			dojo.empty(this.commentsContainer);
	},

	getCommentIconNode: function(cid)
	{
		if (cid)
		{
			var cin = dojo.byId("ic_" + cid);
			if (cin)
				return cin;
		}
		return dojo.query(".imgcomment", this.commentsContainer)[0]; // return first node
	},

	getCommentIconNodes: function()
	{
		return dojo.query(".imgcomment", this.commentsContainer);
	},

	deselectAllCommentIconNodes: function()
	{
		var cinodes = this.getCommentIconNodes();
		for ( var i = 0; i < cinodes.length; i++)
		{
			cinodes[i].src = window.contextPath + window.staticRootPath + '/styles/css/images/comment16.png';
		}
		this.selectedCommentId = null;
	},

	addCommentIcon: function(currentCommentsId, index, isResolved)
	{
		this.initCommentsContainer();
		var icw = this.commentsContainer;
		var a11yStrings = dojo.i18n.getLocalization("concord.util", "a11y");
		var imgSrc = '';
		if (isResolved)
			imgSrc = window.contextPath + window.staticRootPath + '/styles/css/images/comment16resolved.png';
		else
			imgSrc = window.contextPath + window.staticRootPath + '/styles/css/images/comment16.png';

		var ic = dojo.create('img', {
			className: "imgcomment",
			id: 'ic_' + currentCommentsId,
			alt: a11yStrings.aria_comments_icon,
			src: imgSrc,
			contentEditable: false,
			style: {
				'maxHeight': "26px",
				'maxWidth': "29px",
				'position': "relative",
				'height': "auto",
				'width': "100%",
				'border': 'none',
				'cursor': 'pointer',
				'padding': 0,
				'margin': 0
			}
		}, icw);

		ic.style.paddingTop = index > 0 ? "3%" : "0";
        //defect 51770
		if(!concord.util.browser.isMobile())
		{	
		    this.connect(ic, 'onmouseover', dojo.hitch(this, this.selectComment, ic.id, false));
		    this.connect(ic, 'onmousedown', dojo.hitch(this, this.selectComment, ic.id, false));
		}
		},

	selectComment: function(commentId)
	{
		if (pe.scene.hub.commentsHandler.clickedComment)
			return;
		pe.showCommentTimeout && clearTimeout(pe.showCommentTimeout);
		pe.showCommentTimeout = setTimeout(dojo.hitch(this, function(commentId)
		{
			var commentsId = commentId.substring(commentId.indexOf("_") + 1, commentId.length);
			if (pe.scene.hub.commentsHandler.activeCommentId != commentsId)
			{
				pe.scene.slideEditor.deSelectAll();
				if (this.element)
					this.enterSelection();
				dojo.publish("/comments/to/show", [commentsId]);
			}
		}, commentId), 500);
	},
	hasComment: function(commentId)
	{
		if (this.element)
		{
			return this.element.hasComment(commentId);
		}
		else if (this.slide)
		{
			return this.slide.hasComment(commentId);
		}
	},
	initCommentsContainer: function()
	{
		if (!this.commentsContainer)
		{
			this.commentsContainer = dojo.create("div", {
				className: "box-comments",
				contentEditable: false,
				style: {
					'position': 'absolute',
					'left': "100%",
					'marginLeft': "6px",
					'top': 0
				}
			}, this.mainNode);
			if(BidiUtils.isGuiRtl()) {
				dojo.style(this.commentsContainer, 'left','');
				dojo.style(this.commentsContainer, 'marginLeft','');
				dojo.style(this.commentsContainer, 'right','100%');
				dojo.style(this.commentsContainer, 'marginRight','6px');
			}
		}
	},
	refreshComments: function()
	{
		if (pe.scene.isHTMLViewMode())
			return;

		if (pe.scene.isMobile)
			return;

		this.initCommentsContainer();
		if (!pe.scene.sidebar.commentsController.isReady)
		{
			setTimeout(dojo.hitch(this, this.refreshComments), 100);
		}
		else
		{
			var commentsid = "";
			if (this.element)
			{
				commentsid = this.element.attr("commentsid");
			}
			else if (this.slide)
			{
				commentsid = this.slide.attr("commentsid");
			}
			if (commentsid)
				commentsid = dojo.trim(commentsid);
			if (commentsid)
			{
				var commentStore = pe.scene.sidebar.commentsController.store;
				var ids = commentsid.split(" ");
				this.displayedCommentIds = ids;
				this.selectedCommentId = null;
				this.destroyAllCommentIconNodes();

				for ( var i = 0; i < this.displayedCommentIds.length; i++)
				{
					var commentId = this.displayedCommentIds[i];
					var comment = commentStore.get(commentId);
					if (comment)
					{
						var isResolved = comment.items[0].isResolved();
						if (!isResolved)
						{
							this.addCommentIcon(commentId, i, isResolved);
						}
						else if (pe.scene.hub.commentsHandler.clickedComment
								&& commentId == pe.scene.hub.commentsHandler.activeCommentId)
						{
							this.addCommentIcon(commentId, i, isResolved);
						}
					}
					else
					{
						// TODO remove not exist comments ref?
					}
				}
			}
			else
			{
				this.destroyAllCommentIconNodes();
			}
		}
	},
	removeCommentIcon: function(commentid)
	{
		var oldAttrValue = "";
		var tid = "";
		if (this.element)
		{
			oldAttrValue = this.element.attr("commentsid");
			tid = this.element.id;
		}
		else if (this.slide)
		{
			oldAttrValue = this.slide.attr("commentsid");
			tid = this.slide.id;
		}
		if (oldAttrValue)
			oldAttrValue = dojo.trim(oldAttrValue);
		var newAttrValue = oldAttrValue;
		if (oldAttrValue)
		{
			newAttrValue = oldAttrValue.replace(commentid, "");
			newAttrValue = dojo.trim(newAttrValue.replace("  ", " "));
			if (this.element)
			{
				this.element.attr("commentsid", newAttrValue);
			}
			else if (this.slide)
			{
				this.slide.attr("commentsid", newAttrValue);
			}
			this.refreshComments();
			var msgPub = pe.scene.msgPublisher;
			var msgPairList = msgPub.createAttributeMsgPair(tid, 'commentsid', newAttrValue, null, oldAttrValue);
			if (this.displayedCommentIds.length == 0)
			{
				oldAttrValue = "true";
				newAttrValue = "";
				if (this.element)
				{
					this.element.attr("comments", newAttrValue);
				}
				else if (this.slide)
				{
					this.slide.attr("comments", newAttrValue);
				}
				msgPairList = msgPub.createAttributeMsgPair(tid, 'comments', newAttrValue, msgPairList, oldAttrValue);
			}
			var deleteCommentMsg = msgPub.deleteCommentMsg(tid, commentid); // tells other clients to remove comment icon node.
			msgPairList.push(deleteCommentMsg);
			return msgPairList;
		}
		return null;
	},
	createCommentsLink: function(comment)
	{
		var oldAttrValue = "";
		var tid = "";
		if (this.element)
		{
			oldAttrValue = this.element.attr("commentsid");
			tid = this.element.id;
		}
		else if (this.slide)
		{
			oldAttrValue = this.slide.attr("commentsid");
			tid = this.slide.id;
		}
		if (oldAttrValue)
			oldAttrValue = dojo.trim(oldAttrValue);
		else
			oldAttrValue = "";
		var newAttrValue = oldAttrValue;
		if (comment)
		{
			newAttrValue += ' ' + comment.id;
			if (this.element)
			{
				this.element.attr("commentsid", newAttrValue);
			}
			else if (this.slide)
			{
				this.slide.attr("commentsid", newAttrValue);
			}
			this.displayedCommentIds = newAttrValue.split(" ");
			this.addCommentIcon(comment.id);
			var msgPub = pe.scene.msgPublisher;
			var msgPairList = msgPub.createAttributeMsgPair(tid, 'commentsid', newAttrValue, null, oldAttrValue);
			newAttrValue = "true";
			if (this.element)
			{
				oldAttrValue = this.element.attr("comments");
				this.element.attr("comments", newAttrValue);
			}
			else if (this.slide)
			{
				oldAttrValue = this.slide.attr("comments");
				this.slide.attr("comments", newAttrValue);
			}
			if (oldAttrValue)
				oldAttrValue = dojo.trim(oldAttrValue);
			else
				oldAttrValue = "";
			msgPairList = msgPub.createAttributeMsgPair(tid, 'comments', newAttrValue, msgPairList, oldAttrValue);
			var addCommentMsg = msgPub.createAddNewCommentMsg(tid, comment.id); // tells other clients to add comment icon node.
			msgPairList.push(addCommentMsg);
			return msgPairList;
		}
		return null;
	}
});