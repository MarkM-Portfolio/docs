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
 * manage reconnection to the session, if there are network issues
 *@author: gaowwei@cn.ibm.com
 */
dojo.provide("concord.net.Connector");

dojo.require("concord.net.SessionProxy");

concord.net.Connector = new function()
{
	this._deferred = null;
	this._connecting = false;
	this._session = null;
	this._stopped = true;
	this._startTime = null;
	this._callback = null;
	this._method = null;
	this._parameter = null;
	this._timer = null;
	this._scene = null;
	
	/**
	 * start connector
	 * @param	session
	 * 			session object itself
	 * @param	callback
	 * 			ignore this parameter
	 * @param	method
	 * 			purpose of starting this connector
	 * 			"load" or null means to load latest state from server
	 * 			"reconnect" means try to reconnect to server
	 * @param	parameter
	 * 			any parameter object that need to be appended in url (e.g, partial loading criteria)
	 */
	this.start = function(session, callback, method, parameter,scene)
	{
		this._session = session;
		this._deferred = null;
		this._stopped = false;
		this._timer = null;
		this._startTime = new Date();
		this._callback = callback;
		this._method = method;
		this._parameter = parameter;
		this._scene = scene;
		this._connect();
	};
	
	/**
	 * stop connector
	 */
	this.stop = function(isCancel)
	{
        if (this._deferred != null) {
        	// there is a connecting request ongoing,
        	// cancel it
        	if (isCancel == null || isCancel == true)
        	{
        		this._deferred.cancel();
        	}
            this._deferred = null;
        }
        
        if (this._timer != null) {
        	try {
        		window.clearTimeout(this._timer);
        	}
        	catch (e)
        	{
        		
        	}
        	this._timer = null;
        }
        
        this._connecting = false;
        this._stopped = true;
        this._startTime = null;
	};
	
	this.isConnecting = function()
	{
		return this._connecting;
	};
	
	this._connect = function()
	{
		if (this._stopped)
		{
			return;
		}

		if (this._connecting)
		{
			return;
		}
		
		this._connecting = true;
		
		if (this._method == "reconnect")
		{
			this._reconnect();
		}
		else {
			this._load();
		}
	};
	
	this._load = function()
	{
		this._deferred = concord.net.SessionProxy.get(this._session.url, this._parameter, dojo.hitch(this, this._successHdl), dojo.hitch(this, this._errorHdl), false);
	};
	
	this._reconnect = function()
	{
		var data = new Object();
		// report to server my current sequence
		data.seq = this._session.getCurrentSeq();
		// report to server how many messages in my local hasn't been confirmed from server
		// lmc stands for local message count
		data.lmc = this._session.waitingList.length + this._session.sendoutList.length;
		// report to server my client sequence
		data.client_seq = this._session.getClientSeq();
		// Report the document type and document last modified time of client to server to check with these information of document in draft.
		if (this._session.bean != null)
		{
			data.mime = this._session.bean.getMimeType();
			data.modified = this._session.bean.getModified();
		}
		this._deferred = concord.net.SessionProxy.post(this._session.url + "?method=reconnect", data, dojo.hitch(this, this._successHdl), dojo.hitch(this, this._errorHdl), false);		
	};
	
	this._successHdl = function(data)
	{
		this._deferred = null;
		
		var callback = this._callback;
		// stop myself
		this.stop(false);
		
		callback(data);
	};
	
	this._errorHdl = function(response, ioArgs)
	{
		// Get status code before call method this.stop(), because after call that method, the variable 'ioArgs.xhr.status' is disposed.
		var status = (response.dojoType != "timeout" && ioArgs.xhr != null) ? ioArgs.xhr.status : -1;
		
		this._connecting = false;
		
		if (response.dojoType == "timeout")
		{
			this._deferred = null;
		}
		else if (ioArgs.xhr.status == 401)
		{
			// retry 5s later
			this._timer = setTimeout(dojo.hitch(this, this._connect), 5000);
			return;
		}
		else if (this._scene != null && ioArgs.xhr.status === 500)
		{
			try
			{
				var respJson = dojo.fromJson(response.responseText);
				this._scene.gotoErrorScene(respJson.error_code, null);
				return ;
			}
			catch (e)
			{
			}
		}
		
		
		var currTime = new Date();
		var ct = currTime.getTime();
		var st = this._startTime.getTime();
		var diff = ct - st;
		if ( (diff > (60*1000)) && (diff < (60*60*1000)) )
		{
			// fail to connect in 1 min, user may generate many message in queue
			// lock editor for safety
			var errorCode = null;
			if (status === 403 || status === 503)
			{
				try
				{
					var respJson = dojo.fromJson(response.responseText);
					errorCode = respJson != null ? respJson.error_code : errorCode;
					if ((errorCode === 1709) || (errorCode === 1710))
					{
						// 1709: Docs server is in inactivating status, and draft format has been changed a lot
						// we have to ask user to reload document so that active doc server will serve for it
						// 1710: Docs server failover case for 3rd party integration with bypass sso
						if(respJson.reload)
						{
							console.log(respJson.error_msg);
							this.stop(false);
							this._session.makeOffline();
							return;
						}
					}
				}
				catch (e)
				{
				}
			}
			this._session.lockEditor(errorCode);
		}
		else if (diff >= (60*60*1000))
		{
			// cannot connect in one hour
			// make application offline
			this.stop(false);
			this._session.makeOffline();
			return;
		}
		
		// retry 5s later
		this._timer = setTimeout(dojo.hitch(this, this._connect), 5000);
	};
}();

