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

/*
 *@author: gaowwei@cn.ibm.com
 */
dojo.require("dojo.cookie");
dojo.require("dojox.cometd");
dojo.require("dojox.collections.Dictionary");

dojo.provide("concord.net.cometd");

/*
 * every window (document) has a cometd instance, 
 * but only one instance owns the long poll request,
 */
concord.net.cometd = new function()
{
	// channel<->window instance map
	this.subscribers = null;
	this.isOwner = false;
	this.isSubscribed = false;
	
	this.callback = null;
	this.handle = null;
	
	this.session = null;
	this.sharedMode = false;
	
	this.clear = function()
	{
		this.subscribers = null;
		this.isOwner = false;
		this.isSubscribed = false;
		
		this.callback = null;
		this.handle = null;
		
		this.session = null;
	};
	
	this._subscribeBackAll = function()
	{
		var keys = this.subscribers.getKeyList();
		for (var i = 0; i < keys.length; i++)
		{
			var s = this.subscribers.item(keys[i]);
			this._subscribe(s);
		}		
	};
	
	this._getUri = function()
	{
		var uri;
		if (!this.sharedMode)
		{
			uri = contextPath + "/coEditServlet?repository=" + this.session.bean.getRepository() + "&uri=" + this.session.bean.getUri();
		}
		else {
			uri = contextPath + "/coEditServlet";
		}
		return uri;
	};
	
	this._getChannelId = function()
	{
		var id = "/" + this.session.bean.getRepository() + "/" + this.session.bean.getUri() +"/" + this.session.secureToken;
		return id;
	};
	
	this._initRequest = function()
	{
		dojox.cometd.init(this._getUri());
	};
	
	this._stopRequest = function()
	{
		dojox.cometd.disconnect();
	};
	
	this.addSubscriber = function(instance)
	{
		if (!this.isOwner)
			return;
		this.subscribers.add(instance._getChannelId(), instance);
		this._subscribe(instance);
	};
	
	this.removeSubscriber = function(instance)
	{
		if (!this.isOwner)
			return;
		this._unsubscribe(instance);
		this.subscribers.remove(instance._getChannelId());
	};
	
	this._subscribe = function(instance)
	{
		if (!this.isOwner)
			return;
		var handle = dojox.cometd.subscribe(instance._getChannelId(), instance.session, instance.callback);
		instance.handle = handle;
	};
	
	this._unsubscribe = function(instance)
	{
		if (!this.isOwner)
			return;
		dojox.cometd.unsubscribe(instance.handle);
	};
	
	this._getOwner = function()
	{
		if (!this.sharedMode)
		{
			if (this.isOwner)
				return this;
			else
				return null;
		}
		else {
			var ownerWindowName = dojo.cookie("ownerCometdWindowName");
			if (ownerWindowName == null || ownerWindowName.length == 0)
			{
				return null;
			}
			else {
				var ownerWin = window.open("", ownerWindowName);
				var owner = ownerWin.cometdInstance;
				if (owner.isSubscribed)
					return owner;
				else
					return null;
			}
		}
		
		return null;
	};
	
	/*
	 * make current window instance to be the owner who owns the long poll
	 * @param newInstances	all instances in this browser
	 */
	this._becomeOwner = function(/*dojox.collections.Dictionary*/allSubscribers)
	{
		// clone the instances list to local
		this.subscribers = new dojox.collections.Dictionary();
		var keys = allSubscribers.getKeyList();
		for (var i = 0; i < keys.length; i++)
		{
			this.subscribers.add(keys[i], allSubscribers.item(keys[i]));
		}
		
		if (this.sharedMode)
		{
			// write self window name to the cookie
			var cookieProps = {"path":contextPath};
			// assume window.name has already been set
			dojo.cookie("ownerCometdWindowName", window.name, cookieProps);
		}
		
		this.isOwner = true;
		
		// now start the request
		this._initRequest();
		
		// subscribe back all the channels
		this._subscribeBackAll();
		// setTimeout(dojo.hitch(this, this._subscribeBackAll()), 100);
	};
	
	this._passOwner = function()
	{
		if (!this.isOwner)
			return;
		
		// release my connection
		this._stopRequest();
		
		if (this.sharedMode)
		{
			// clear cookie
			var cookieProps={"path":contextPath,"expires":"-1"};
			dojo.cookie("ownerCometdWindowName", "",cookieProps);
		}
		this.isOwner = false;
		
		// pass the owner to first subscriber instance
		var keys = this.subscribers.getKeyList();
		if (keys.length > 0)
		{
			var newOwner = this.subscribers.item(keys[0]);
			newOwner._becomeOwner(this.subscribers);
		}
	};
	
	this.start = function(session, callback, isSharedMode)
	{
		if (this.isSubscribed)
			return;
		
		this.session = session;
		this.callback = callback;
		this.sharedMode = isSharedMode;
		
		// check to see if there is a global cometd variable
		if (!window.cometdInstance)
		{
			window.cometdInstance = this;
		}
		
		var owner = this._getOwner();
		if (owner == null)
		{
			this._becomeOwner(new dojox.collections.Dictionary());
			owner = this;
		}
		
		owner.addSubscriber(this);
		this.isSubscribed = true;
		
		// register window unload event,
		// clear my subscription when unloaded
		dojo.addOnUnload(this, "stop");
	};
	
	this.stop = function()
	{
		if (!this.isSubscribed)
			return;
		
		var owner = this._getOwner();
		if (owner == null)
		{
			// shouldn't be called
			return;
		}
		
		owner.removeSubscriber(this);
		this.isSubscribed = false;
		
		if (this.isOwner)
		{
			// pass owner to other subscribers
			this._passOwner();
		}
		
		// to make sure no memory leak
		this.clear();
	};
}();
