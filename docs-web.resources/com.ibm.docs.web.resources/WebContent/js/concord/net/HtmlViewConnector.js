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

dojo.provide("concord.net.HtmlViewConnector");

concord.net.HtmlViewConnector = {
	/////////////////////////////////////////////////////////////////////////
	////////////////////// concord.net.Session  /////////////////////////////
	/////////////////////////////////////////////////////////////////////////
	MAXRETRYTIMES: 3,

    /**
     * call this method to join the session, session will automatically started after join successfully
     * @param	criteria
     *			criteria for partial loading the document
     */
    join: function(criteria, url, scene)
    {
    	this.stop();
    	
    	this.scene = scene;
    	this.url = url;
    	
    	if (criteria)
    	{
    		try
    		{
    			var parameter = {};
    			parameter.criteria = dojo.toJson(criteria);
    			this.loadParameter = parameter;
    		}
    		catch (e)
    		{
    			console.log("parsing criteria object error:" + criteria + ";error:" + e);
    		}
    	}
    	else
    	{
    		this.loadParameter = {};
    	}
    	this.loadParameter.nonce = DOC_SCENE.jobId;

        // now let's try to join the session and load data
       	this._load(null, true);
    },
    
    /**
     * load document state from server
     * @param	args
     *			{callback:callback, data:data}
     *			something need to be executed after loaded successfully
     * @param checkEntitlement indicates that if check the 'co-edit' entitltment of the editor or not
     */
    _load: function(args, checkEntitlement) {
    	// tell scene loading started, scene will pop up a loading dialog
    	this.scene.loading();
    	
    	// stop the whole session
    	this.stop();
    	
    	var parameter = this.loadParameter;
    	if (checkEntitlement != null && typeof(checkEntitlement) != 'undefined')
    	{
    		if (parameter == null || typeof(parameter) == 'undefined')
        	{
        		parameter = {};
        	}
    		parameter.checkEntitlement = checkEntitlement;
    	}
    	// start the connector
    	this.start(dojo.hitch(this, this._loaded, args), "load", parameter);
    },
    
    _loaded: function(args, data) {
    	if (data.status == "error")
        {
    		if (data.error_code == 1703)
        	{
        		// error case when there is edit conflict when import document concurrently.
        		window.location.reload();
        	}
    		else if (data.error_mode == "mobile_error")
    		{
    			this.scene.gotoErrorScene(data.error_code, data);    			
    		}
    		else
        	{
        		this.scene.gotoErrorScene(data.error_code, data.participants);
	    	}
    		return;
        }
        
        this.scene.bean = new concord.beans.Document(data.bean);
        
        // call scene to hide loading box, and fullfill data into editor
    	this.scene.loaded(data.state);
    	
    	// something need to be executed then?
    	// used to restore my content
    	if (args)
    	{
    		try
    		{
    			args.callback(args.data);
    		}
    		catch (ex)
    		{
    			console.log("Exception happens while executing the call back method", ex);
    		}
    	}
    },
    
    _postGetPartial: function(callback, criteria, response, ioArgs){
        var result;
    	// Handle error.
        if(response instanceof Error){
            var status = ioArgs.xhr.status;
            //For HTML Viewer
            if(status != 507)
            { 
            	if(response && response.status == 504){
            			this.scene && this.scene.reinvokePartialLoading();	
            	}else{
            		if(response && response.status == 1207){
            			status = 1207;
            		}
            		this.scene && this.scene.gotoErrorScene(status, null);
            	}
            }
            result = new String(status);
            return result;
        }
        else if(response && response.status == "error")
        {
            result = response;
            return result;
        }
        else if(response)
        {
            result = response.state;
        }

        if(callback)
        {
            callback(result, criteria);
        }
        return result;
    },

    // Get partial content of the document according to "criteria", "criteria" is a JSON format object. Such as: var criteria = {"sheets" : "1"}.
    // Can get partial content of document through this method, the returned content does NOT include the comments and notifications of document.
    // Input one parameter into callBack after getting content, it may be the doc content, or an error object. Please see the function "_postGetPartial".
    getPartial: function(callBack, criteria){
    	var url = this.url + "?method=getpartial";
        var syncCall = true;
        if(callBack){
        	syncCall = false;
        }
        
        var sCriteria;
        // Convert the JSON format object to the JSON format string.
        if(criteria){
            try {
                sCriteria = dojo.toJson(criteria);
            } catch (e) {
                console.log("error happens when converting criteria to json format string: ", e);
            }
        }
        
        var response, ioArgs;
        var syncCallHandle = function(r, io) {response = r; ioArgs = io;};
        var xhrArgs = {
            url: url,
            content: {
                // If sCriteria is undefined, this parameter "criteria" is not appended to the request, it's checked by dojo.
                "criteria": sCriteria
            },
            handleAs: "json",
            handle: syncCall ? syncCallHandle : dojo.hitch(this, this._postGetPartial, callBack, criteria),
            sync: syncCall,
            preventCache: true,
            noStatus: true
        };
        dojo.xhrGet(xhrArgs);
        
        if(syncCall){
            return this._postGetPartial(null, criteria, response, ioArgs);
        }
    },
    
	/////////////////////////////////////////////////////////////////////////
	////////////////////// concord.net.Connector  ////////////////////////
	/////////////////////////////////////////////////////////////////////////

	/**
	 * start connector
	 * @param	callback
	 * 			ignore this parameter
	 * @param	method
	 * 			purpose of starting this connector
	 * 			"load" or null means to load latest state from server
	 * 			"reconnect" means try to reconnect to server
	 * @param	parameter
	 * 			any parameter object that need to be appended in url (e.g, partial loading criteria)
	 */
	start: function(callback, method, parameter)
	{
		this._deferred = null;
		this._stopped = false;
		this._timer = null;
		this._startTime = new Date();
		this._retryCnt = 0;
		this._callback = callback;
		this._method = method;
		this._parameter = parameter;
		this._connect();
	},
	
	/**
	 * stop connector
	 */
	stop: function(isCancel)
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
        this._retryCnt = 0;
	},
	
	_connect: function()
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
			this._loadByConnector();
		}
	},
	
	_loadByConnector: function()
	{
		this._deferred = this.get(this.url, this._parameter, dojo.hitch(this, this._successHdl), dojo.hitch(this, this._errorHdl), false);
	},
	
	_reconnect: function()
	{
		var data = new Object();
		this._deferred = post(this.url + "?method=reconnect", data, dojo.hitch(this, this._successHdl), dojo.hitch(this, this._errorHdl), false);		
	},

	_successHdl: function(data)
	{
		this._deferred = null;
		
		var callback = this._callback;
		// stop myself
		this.stop(false);
		
		if (callback) callback(data);
	},
	
	_errorHdl: function(response, ioArgs)
	{
		// Get status code before call method this.stop(), because after call that method, the variable 'ioArgs.xhr.status' is disposed.
		var status = (response.dojoType != "timeout" && ioArgs.xhr != null) ? ioArgs.xhr.status : -1;

		this._connecting = false;

		if (response.dojoType == "timeout")
		{
			this._deferred = null;
		}
		else if (ioArgs.xhr.status == 401 && this._retryCnt < this.MAXRETRYTIMES)
		{
			// retry 5s later
			this._timer = setTimeout(dojo.hitch(this, this._connect), 5000);
			this._retryCnt++;
			return;
		}

		var currTime = new Date();
		var ct = currTime.getTime();
		var st = this._startTime.getTime();
		var diff = ct - st;
		if (this._retryCnt >= this.MAXRETRYTIMES || diff >= (120*1000))
		{
			// cannot connect in max reconnect times or in 2 mins
			// make application offline
			this.stop(false);
			response.status = 1207;
			return;
		}

		// retry 5s later
		this._retryCnt++;
		this._timer = setTimeout(dojo.hitch(this, this._connect), 5000);
	},

	/////////////////////////////////////////////////////////////////////////
	////////////////////// concord.net.SessionProxy  ////////////////////////
	/////////////////////////////////////////////////////////////////////////
	/**
	 * post something to a session channel, provide common handling mechanism
	 * for session related requests
	 * @param	url
	 * 			url of destination
	 * @param	c
	 * 			a JSON object data for posting
	 * @param	successHdl(data)
	 * 			a callback handler if request succeeds, the callback contains one parameter, the response as JSON object
	 * @param	errorHdl(response, ioArgs)
	 * 			a callback handler if request fails, see dojo.xhr for the parameter for detail
	 * @param	sync
	 * 			if this request need to be synchronized or not
	 * @return	
	 * 			deferral object handle of this request
	 */
	post: function(url, c, successHdl, errorHdl, sync)
	{
		var sData = dojo.toJson(c);
		var deferred = dojo.xhrPost({
			url: url,
			postData: sData,
			contentType: "text/plain; charset=UTF-8",
			handle: dojo.hitch(this, this._handle, successHdl, errorHdl),
			preventCache: true,
			sync: sync,
			timeout: g_hbTimeout //FIXME
		});
		return deferred;
	},
	
	/**
	 * get something from a session channel, provide common handling mechanism
	 * for session related requests
	 * @param	url
	 * 			url of destination
	 * @param	parameter
	 * 			parameter appended in url
	 * @param	successHdl(data)
	 * 			a callback handler if request succeeds, the callback contains one parameter, the response as JSON object
	 * @param	errorHdl(response, ioArgs)
	 * 			a callback handler if request fails, see dojo.xhr for the parameter for detail
	 * @param	sync
	 * 			if this request need to be synchronized or not
	 * @return	
	 * 			deferral object handle of this request
	 */		
	get: function(url, parameter, successHdl, errorHdl, sync)
	{
		var deferred = dojo.xhrGet({
			url: url,
			content: parameter,
			handle: dojo.hitch(this, this._handle, successHdl, errorHdl),
			preventCache: true,
			sync: sync,
			timeout: g_hbTimeout // FIXME
		});
		return deferred;
	},
	
	_handle: function(successHdl, errorHdl, resp, ioArgs)
	{
		if (resp instanceof Error)
		{
			if (resp.dojoType == "cancel")
			{
				if (ioArgs.args.sync == true)
				{
					if (errorHdl)
					{
						errorHdl(resp, ioArgs);
					}
					return;
				}
				
				// who cancel it, who process it
				// do nothing here
				return;
			}

			if (errorHdl)
			{
				errorHdl(resp, ioArgs);
				if(resp.status == 1207)
					this.scene && this.scene.gotoErrorScene(resp.status, null); 
			}
		}
		else {
			// response returned as plain text
			// evaluate it to JSON object
			var data = null;
			try {
				data = eval('('+resp+')');
			}
			catch (err)
			{
				// cannot evaluate the response to a JSON object, possible reason:
				// 1. response just contains part of data
				// 2. session timeout, redirected to a login page
				// treat as an error response
				if (errorHdl)
				{
					errorHdl(resp, ioArgs);
				}
				return;
			}
			
			// call success callback
			if (successHdl)
			{
				successHdl(data);
			}
		}
	}
};