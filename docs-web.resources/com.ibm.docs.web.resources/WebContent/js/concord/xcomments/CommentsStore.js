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

dojo.provide("concord.xcomments.CommentsStore");
dojo.require("concord.xcomments.CommentsStoreListener");

dojo.require("concord.xcomments.Comments");
dojo.require("concord.xcomments.CommentsProxy");
dojo.require("concord.xcomments.TextCommentsProxy");
dojo.require("concord.xcomments.SheetCommentsProxy");

dojo.require("concord.util.browser");
dojo.require("concord.util.mobileUtil");

dojo.declare("concord.xcomments.CommentsStore", [concord.xcomments.CommentsProxyCallback], {
	comments: [],
	listener: null,
	proxy: null,
	
	/*
	 * construct a document's comments store
	 * @param url
	 * 		the url to access a document's comments resource
	 * @param e
	 * 		initial state of all comments, will retrieve from server if it's null
	 * @param proxy
	 * 		the proxy to connect with remote comments store, can be a proxy pointing to test data
	 */
	constructor: function (url, e, proxy,listener)
	{
		if (proxy)
		{
			this.proxy = proxy;
		}
		else {
			if(pe.scene.docType == "text")
				this.proxy = new concord.xcomments.TextCommentsProxy(url);
			else if(pe.scene.docType == "sheet")
				this.proxy = new concord.xcomments.SheetCommentsProxy(url);
			else
				this.proxy = new concord.xcomments.CommentsProxy(url);
		}
		
		this.proxy.registerCallback(this);
		if(listener)
			this.listener = listener;
		if (!e)
		{
			this.proxy.getAll();
		}

	},
	
	handleStore: function(e)
	{
		// clear it first
		this.comments = [];
		
		if (concord.util.browser.isMobile())
		{
			var events = [];
			var params = e;
			events.push({"name":"comments", "params":params});
			concord.util.mobileUtil.jsObjCBridge.postEvents( events );
		}
		
		for (var i = 0; i < e.length; i++)
		{
			if(!this.isFiltered(e[i])){				
				this.comments.push(new concord.xcomments.Comments(e[i]));
			}
		}		
		
		if(this.listener)
			setTimeout(dojo.hitch(this.listener,this.listener.storeReady), 30);	  		
	},
	/*
	 * Filter according to comments data
	 */
	isFiltered: function(comment)
	{
		if(comment)
		{
			var items = comment.items;
			if(items && items.length != 0)
			{
				//Now, only filtering the warning comment for spreadsheet
				if(window.pe.scene.docType == "sheet"){
					if(items[0].isWarning)
					{
						return true;
					}
				}
			}			
		}
		return false;
	},
	/*
	 * register CommentsStoreListener instance
	 */
	registerListener: function (listener)
	{
		this.listener = listener; 
	},
	
	/*
	 * @param item
	 * 		instance of CommentsItem
	 * @return
	 * 		instance of Comments
	 */
	add: function (item)
	{		
			var o = new concord.xcomments.Comments(null);
			o.appendItem(item);
			this.comments.push(o);
			return o;
	},	 
	
	/*
	 * @param commentsId
	 * 		id of the comments
	 * @param item
	 * 		instance of CommentsItem
	 * @return
	 * 		instance of CommentsItem
	 */
	appendItem: function (commentsId, item)
	{
		var comments = this.get(commentsId);
		if(comments)
		{			
			comments.appendItem(item);
			return item;
		}
		return null;
	},	 
	
	/*
	 * 
	 */
//	updateItem: function (commentsId, item)
//	{
//		this.proxy.updateItem(commentsId, item.toJSObj());
//	},
	
	/*
	 * @param commentsId
	 * 		id of the comments
	 * @return
	 * 		instance of Comments
	 */
	get: function (commentsId)
	{
		for (var i = 0; i < this.comments.length; i++)
		{
			var c = this.comments[i];
			if (c.getId() == commentsId)
			{
				return c;
			}
		}
		// not in local store? try to get it from server
		var e = this.proxy.get(commentsId);
		if (e && e.id)
		{
			var o = new concord.xcomments.Comments(e);
			this.comments.push(o);
			return o;
		}
		return null;
	},
	
	exists: function (commentsId)
	{
		for (var i = 0; i < this.comments.length; i++)
		{
			var c = this.comments[i];
			if (c.getId() == commentsId)
			{
				return true;
			}
		}
		return false;
	},
	
	/*
	 * @param commentsId
	 * 		id of the comments
	 * @return
	 * 		true if succeeded
	 */
	remove: function (commentsId)
	{
			// delete from local store
			var newList = new Array();
			var found = false;
			for (var i = 0; i < this.comments.length; i++)
			{
				var c = this.comments[i];
				if (c.getId() == commentsId)
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
	
	/*
	 * get total comments count
	 */
	getCount: function ()
	{
		return this.comments.length;
	},
	
	/*
	 * get visible comments count
	 */
	getVisibleCount: function ()
	{
		var invisibleCount = 0;
		for (var i = 0; i < this.comments.length; i++)
		{
			var c = this.comments[i];
			if(c.items[0] && c.items[0].getVisible() < 1)
			{
				invisibleCount ++;
			}
		}
		return this.comments.length - invisibleCount;
	},
	
	/*
	 * get total items count of a comments
	 */	
	getItemCount: function(commentsId)
	{
		var o = this.get(commentsId);	
		return o ? o.getItemCount() : 0;
	},
	
	/*
	 * get indexed comments
	 */
	getFromIndex: function (i)
	{
		return this.comments[i];
	},
	
	/*
	 * implementation of CommentsProxyCallback
	 */
	added: function (e)
	{
		var o = new concord.xcomments.Comments(e);
		if (this.exists(o.getId()))
			return;
		
		this.comments.push(o);
		if (this.listener)
			this.listener.commentsAdded(o);
	},
	
	/*
	 * implementation of CommentsProxyCallback
	 */
	itemAppended: function (commentsId, e)
	{
		var o = this.get(commentsId);
		if (!o)
		{
			console.log("commentItemAppended: cannot find comments in local store: " + commentsId);
			return;
		}
		if(e && e.id && o.getItembyId(e.id))// existing reply
			return;

		var item = new concord.xcomments.CommentItem(e);
		o.appendItem(item);
		if (this.listener)
			this.listener.commentItemAppended(commentsId, item);
	},
	
	/*
	 * implementation of CommentsProxyCallback
	 */
	itemUpdated: function (commentsId, index, e)
	{
		var o = this.get(commentsId);
		if (!o)
		{
			console.log("commentItemAppended: cannot find comments in local store: " + commentsId);
			return;
		}
		var item = new concord.xcomments.CommentItem(e);
		o.updateItem(index, item);
		if (this.listener)
			this.listener.commentItemUpdated(commentsId, index, item);
	},
	
	/*
	 * implementation of CommentsProxyCallback
	 */
	removed: function (commentsId)
	{
		var newList = new Array();
		var found = false;
		for (var i = 0; i < this.comments.length; i++)
		{
			var c = this.comments[i];
			if (c.getId() == commentsId)
			{
				found = true;
				continue;
			}
			newList.push(c);
		}
		if (found)
		{
			this.comments = newList;
			if (this.listener)
				this.listener.commentsRemoved(commentsId);
		}
	}
	
});
