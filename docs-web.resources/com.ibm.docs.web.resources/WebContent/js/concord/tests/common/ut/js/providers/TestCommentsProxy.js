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

dojo.provide("concord.tests.common.ut.js.providers.TestCommentsProxy");

dojo.require("concord.xcomments.CommentsProxy");
dojo.require("concord.xcomments.Comments");
dojo.require("concord.xcomments.CommentItem");
dojo.require("concord.xcomments.CommentsStoreListener");

dojo.declare("concord.tests.common.ut.js.providers.TestCommentsProxy", [concord.xcomments.CommentsProxy, concord.xcomments.CommentsStoreListener], {
	comments: null,
	comment_items: null,
	url: null,
	constructor: function(url)
	{
		this.url = url;
	},
	
	/*
	 * register CommentsProxyCallback instance
	 */
	registerCallback: function (callback)
	{
		this.callback = callback;
	},
	
	generateUUID: function ()
	{
		var seedA = Math.random().toString(16);
		var seedB = Math.random().toString(16);
		var out = String(seedA + seedB);
		out = out.replace(/0\./g, "");
		var uuid = "";
		var j=0;
		for (var i=0; i<out.length; i++)
		{
			uuid = String(uuid+out.charAt(i));
			if (j == 7)
				uuid = String(uuid + "-");
			if (i == 12)
				break;
			j++;
		}
 		return uuid;
	},
	
	add: function (e)
	{
		var c = new Object();
		c.id = this.generateUUID();
		c.items = new Array();
		c.items.push(e);
		this.comments.push(c);
		return c;
	},
	
	appendItem: function (commentsId, e)
	{
		var c = this.get(commentsId);
		if (c)
		{
			c.items.push(e);
			return e;
		}
		return null;
	},
	
	get: function (commentsId)
	{
		for (var i = 0; i < this.comments.length; i++)
		{
			var c = this.comments[i];
			if (c.id == commentsId)
				return c;
		}
		return null;
	},
	
	getAll: function ()
	{
		var response, ioArgs;
		dojo.xhrGet({
			url: this.url,
			load: function(resp)
			{
				response = resp;
			},
			sync: true,
			handleAs: "json",
			preventCache: true
		});
		
		this.comments = response.comments;
		
		this.initCommentsStoreForWriter();
		this.callback.handleStore(this.comment_items);
	},
	
	remove: function (commentsId)
	{
		// delete from local store
		var newList = new Array();
		var found = false;
		for (var i = 0; i < this.comments.length; i++)
		{
			var c = this.comments[i];
			if (c.id == commentsId)
			{
				found = true;
				continue;
			}
			newList.push(c);
		}
		if (found)
		{
			this.comments = newList;
			return true;
		}
		return false;
	},

	msgReceived: function (msg)
	{
		if (!this.callback)
			return;
		
		var action = msg.action;
		if (action == "add")
		{
			this.comments.push(msg.data); 
			this.callback.added(msg.data);
		}
		else if (action == "append")
		{
			this.appendItem(msg.id, msg.data);
			this.callback.itemAppended(msg.id, msg.data);
		}
		else if (action == "delete")
		{
			this.callback.removed(msg.id);
		}
	},
	
	storeReady: function()
	{
		
	},
	
	commentsAdded: function (comments)
	{
		//throw new Error("not implemented");
	},
	
	commentItemAppended: function (commentsId, item)
	{
		//throw new Error("not implemented");
	},
	
	commentItemUpdated: function (commentsId, index, item)
	{
		//throw new Error("not implemented");
	},

	commentsRemoved: function (commentsId)
	{
		//throw new Error("not implemented");
	},	
	
	
	initCommentsStoreForWriter:function() {
		this.comment_items = [];
		for(var n in this.comments){
			var comment = this.comments[n];
			var xcomment = this.getXCommentItemForWriter(comment);
			if (xcomment)
				this.comment_items.push(xcomment);
		}
		function sortCommentByIndex(a,b){
			return parseInt(a.index) - parseInt(b.index);
		};
		return this.comment_items.sort(sortCommentByIndex);
	},
	
	// construct a xcomment object from parent or child comment list
	getXCommentItemForWriter:function(cmt) {
		var tzdiff = new Date().getTimezoneOffset()*60000;
		var xcomment = null;
		var comment = cmt;
		if (comment) {
			if(comment instanceof concord.xcomments.Comments ){
				xcomment = new concord.xcomments.Comments(comment);
			}else if(comment instanceof Object){
				xcomment = new concord.xcomments.Comments();
				xcomment.id = comment.id;
				if(!comment.index)
					comment.index = comment.id;
				xcomment.index = comment.index;
				var xcomment_item = new concord.xcomments.CommentItem;
				var content="";
				for(var i=0;i<comment.content.length;i++){
					if(comment.content[i].c !== null && typeof comment.content[i].c != 'undefined')
						content = content + comment.content[i].c + "\n";
				}
				if (content.replace(/(^\s*)|(\s*$)/g, "").length ==0){
					content = "EMPTY";
				}
				xcomment_item.content = content;
				xcomment_item.name = comment.author;
				xcomment_item.time = new Date(comment.date).getTime();
				xcomment_item.time += tzdiff;
				xcomment_item.resolved = (comment.done == "1"?true:false);
				
				xcomment_item.org = comment.org? comment.org : null; 
				xcomment_item.uid = comment.uid? comment.uid : null;
				xcomment_item.assigneeOrg = comment.assigneeOrg? comment.assigneeOrg.concat() : null;
				xcomment_item.assigneeId = comment.assigneeId? comment.assigneeId.concat() : null;
				xcomment_item.assignee = comment.assignee? comment.assignee.concat() : null;
				xcomment_item.mentions = (comment.mentions && comment.mentions.length > 0)? comment.mentions.slice(0) : null; 

				xcomment.appendItem(xcomment_item);
			}
		}		
		return xcomment;
	}
});