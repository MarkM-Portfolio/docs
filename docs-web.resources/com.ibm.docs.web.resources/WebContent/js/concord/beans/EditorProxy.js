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

/**
 * @author dragonli
 */
dojo.provide("concord.beans.EditorProxy");
dojo.provide("concord.beans.EditorProxyCallback");

dojo.declare("concord.beans.EditorProxy", null, {
	callback: null,
	url: null,
	
	/*
	 * construct a editors proxy, which CRUD editors resource from server url
	 * @param url
	 * 		the base url to access comments resource
	 */
	constructor: function (url)
	{
		this.url = url;
	},
	
	/*
	 * register EditorProxyCallback instance
	 */
	registerCallback: function (callback)
	{
		this.callback = callback;
	},
	
	add: function (e)
	{
		var response, ioArgs;
		var sData = dojo.toJson(e);
		dojo.xhrPost({
			url: this.url,
			postData: sData,
			contentType: "text/plain; charset=UTF-8",
			sync: true,
			handle: function(r, io) {response = r; ioArgs = io;},
			preventCache: true,
			handleAs: "json"
		});
		if (response instanceof Error)
			return null;
		return response;
	},
	
	remove: function (editorId)
	{
		var response, ioArgs;
		dojo.xhrDelete({
			url: this.url + "?userId=" + editorId,
			handle: function(r, io) {response = r; ioArgs = io;},
			sync: true,
			handleAs: "json",
			preventCache: true
		});
		
		if (response instanceof Error)
			return false;
		return true;	
	},
	
	update: function(editor) {
		throw("This function in not implemented!");
	},
	
	updateIndicators: function(id, indicators) {
		var response, ioArgs;
		var json = {userId: id, indicators:indicators};
		var sData = dojo.toJson(json);
		dojo.xhrPost({
			url: this.url + "?method=updateIndicators",
			postData: sData,
			contentType: "text/plain; charset=UTF-8",
			sync: false,
			handle: function(r, io) {response = r; ioArgs = io;},
			preventCache: true,
			handleAs: "json"
		});
		if (response instanceof Error) {
			return false;
		}			
		return true;		
	},
	
	updateIndicator: function(id, indicatorId, show) {
		var response, ioArgs;
		var indicatorValue = (indicatorId == 'commentsstatus') ? show :( show? "show" : "hide");
		var json = {userId: id, indicatorId: indicatorId, indicatorValue: indicatorValue};
		var sData = dojo.toJson(json);
		dojo.xhrPost({
			url: this.url + "?method=updateIndicator",
			postData: sData,
			contentType: "text/plain; charset=UTF-8",
			sync: false,
			handle: function(r, io) {response = r; ioArgs = io;},
			preventCache: true,
			handleAs: "json"
		});
		if (response instanceof Error) {
			return false;
		}			
		return true;				
	},	

	getAll: function (isSync)
	{	
		//To fix defect 41585
		var defSync = false;
		if (isSync == true) {
			defSync = true;
		}
		dojo.xhrGet({
			url: this.url,
			error: function(error) {						
				    console.log('Error to get editor list, the error is:');
						console.log(error);},
			sync: defSync,			
			handleAs: "json",
			load: dojo.hitch(this.callback, this.callback.handleStore),
			preventCache: true
		});		
		
	},
	
	msgReceived: function (msg)
	{
		if (!this.callback)
			return;
		
		var action = msg.action;
		if (action == "add")
		{
			this.callback.added(msg.data);
		}
		else if (action == "delete")
		{
			this.callback.removed(msg.id);
		}
	}
});

dojo.declare("concord.beans.EditorProxyCallback", null, {
	
	/*
	 * called when the proxy receive an editor added message
	 * @param e
	 * 		json representation of the editor
	 */
	added: function (e)
	{
		throw new Error("not implemented");
	},
	/*
	 * called when the proxy receive an editor deleted message
	 * @param editorId
	 * 		id of the editor
	 */
	removed: function (editorId)
	{
		throw new Error("not implemented");
	}
});
