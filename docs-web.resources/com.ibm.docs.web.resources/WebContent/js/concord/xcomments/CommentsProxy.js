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

dojo.provide("concord.xcomments.CommentsProxy");
dojo.provide("concord.xcomments.CommentsProxyCallback");

// doPost is obsolete in this class, rather, the post was taken place under document message
// and handled by DocumentMessageHandler, rather than DocumentCommentsHandler...
dojo.declare("concord.xcomments.CommentsProxy", null, {
	callback: null,
	url: null,
	
	/*
	 * construct a comments proxy, which CRUD comments resource from server url
	 * @param url
	 * 		the base url to access comments resource
	 */
	constructor: function (url)
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
	
//	add: function (e)
//	{
//		var response, ioArgs;
//		var sData = dojo.toJson(e);
//		dojo.xhrPost({
//			url: concord.main.App.appendSecureToken(this.url),
//			postData: sData,
//			contentType: "text/plain; charset=UTF-8",
//			sync: true,
//			handle: function(r, io) {response = r; ioArgs = io;},
//			preventCache: true,
//			handleAs: "json"
//		});
//		if (response instanceof Error)
//			return null;
//		return response;
//	},
	
//	appendItem: function (commentsId, e)
//	{
//		var response, ioArgs;
//		var sData = dojo.toJson(e);
//		dojo.xhrPost({
//			url: concord.main.App.appendSecureToken(this.url + "?id=" + commentsId),
//			postData: sData,
//			contentType: "text/plain; charset=UTF-8",
//			sync: true,
//			handle: function(r, io) {response = r; ioArgs = io;},
//			preventCache: true,
//			handleAs: "json"
//		});
//		if (response instanceof Error)
//			return null;
//		return response;		
//	},
//	
//	updateItem: function (commentsId, e)
//	{
//		var response, ioArgs;
//		var sData = dojo.toJson(e);
//		dojo.xhrPost({
//			url: concord.main.App.appendSecureToken(this.url + "?id=" + commentsId + "&task_id=" + e.task_id),
//			postData: sData,
//			contentType: "text/plain; charset=UTF-8",
//			sync: true,
//			handle: function(r, io) {response = r; ioArgs = io;},
//			preventCache: true,
//			handleAs: "json"
//		});
//		if (response instanceof Error)
//			return null;
//		return response;
//	},
	
	get: function (commentsId)
	{
		var response, ioArgs;
		dojo.xhrGet({
			url: this.url + "?id=" + commentsId,
			handle: function(r, io) {response = r; ioArgs = io;},
			sync: true,
			handleAs: "json",
			preventCache: true
		});
		
		if (response instanceof Error)
			return null;
		return response;
	},
	
	getAll: function ()
	{		
		dojo.xhrGet({
			url: this.url,
			error: function(error) {						
				    console.log('Error to get comments list, the error is:');
						console.log(error);},
			sync: false,
			handleAs: "json",
			load: dojo.hitch(this.callback, this.callback.handleStore),
			preventCache: true
		});
	},	
	
//	remove: function (commentsId)
//	{
//		var response, ioArgs;
//		dojo.xhrDelete({
//			url: concord.main.App.appendSecureToken(this.url + "?id=" + commentsId),
//			handle: function(r, io) {response = r; ioArgs = io;},
//			sync: true,
//			handleAs: "json",
//			preventCache: true
//		});
//		
//		if (response instanceof Error)
//			return false;
//		return true;	
//	},
	
	msgReceived: function (msg)
	{
		if (!this.callback)
			return;
		
		var action = msg.action;
		if (action == "add")
		{
			msg.data.id = msg.id;
			this.callback.added(msg.data);
		}
		else if (action == "append")
		{
			this.callback.itemAppended(msg.id, msg.data);
		}
		else if (action == "update")
		{
			this.callback.itemUpdated(msg.id, msg.index, msg.data);
		}
		else if (action == "delete")
		{
			this.callback.removed(msg.id);
		}
	}
});

dojo.declare("concord.xcomments.CommentsProxyCallback", null, {
	
	/*
	 * called when the proxy receive a comments added message
	 * @param e
	 * 		json representation of the comments
	 */
	added: function (e)
	{
		throw new Error("not implemented");
	},
	
	/*
	 * called when the proxy receive a comments item appended message
	 * @param commentsId
	 * 		id of the comments
	 * @param e
	 * 		json representation of the comments item
	 */
	itemAppended: function (commentsId, e)
	{
		throw new Error("not implemented");
	},
	
	/*
	 * called when the proxy receive a item updated message
	 */
	itemUpdated: function (commentsId, index, e)
	{
		throw new Error("not implemented")
	},
	
	/*
	 * called when the proxy receive a comments deleted message
	 * @param commentsId
	 * 		id of the comments
	 */
	removed: function (commentsId)
	{
		throw new Error("not implemented");
	}
});
