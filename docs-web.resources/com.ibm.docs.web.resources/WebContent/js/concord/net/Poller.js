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
 * manage long poll request
 *@author: gaowwei@cn.ibm.com
 */
dojo.provide("concord.net.Poller");

dojo.require("concord.net.cometd");
dojo.require("concord.net.rtc4web");

//This is the configuration for logger of rtc4web.
loggerConfig = {"topic" : "docs_rtc4web"};

concord.net.Poller = new function()
{
	this._session = null;
	this._callback = null;
	this._isRtc4Web = false;
	this._isSharedMode = false;
	this._rtcContextPath = "";
	this._rtcSession = null;
	this._rtcSessionId = null;
	this._rtcSessionUser = null;
	
	/**
	 * Handle the rtc4web long poller error.
	 * 
	 * @param xhrStatus presents the request status
	 * @param rtcStatus presents the status returned from rtc4web
	 * @param rtcReason presents the reason returned from rtc4web
	 */
	this._errorHdl = function(xhrStatus, rtcStatus, rtcReason)
	{
		// If xhrStatus is 400, rtcStatus is 67, presents that user is ejected because same user joined from a different instance.
		if (xhrStatus === 400 && rtcStatus === 67 && this._session)
		{
			this._session.checkKickedOut();
		}
		else if (rtc4web.core.RTCUpdater.updateState == "STOPPED")//updater has been stopped
		{
			if (!rtcStatus && this._session)
				this._session.lockEditor(xhrStatus);
		}
	};
	
	/**
	 * Start the rtc4web long poller.
	 */
	this._startRtc4Web = function()
	{
		try
		{
			this._rtcSessionId = this._session.bean.getRepository() + "-" + this._session.bean.getUri() + "-" + this._session.secureToken;
			this._rtcSessionUser = this._session.getClientId();
			this._rtcSession = rtc4web.core.getSession(this._rtcSessionId, this._rtcContextPath);
			this._rtcSession.setContextRoot(this._rtcContextPath);
			this._rtcSession.setDocSession(this._session);
			this._rtcSession.setSharedMode(this._isSharedMode);
			
			// Join the RTC session and add the listener.
			rtc4web.core.joinSession(this._rtcSessionId, this._rtcSessionUser, {userName : this._rtcSessionUser});
			rtc4web.core.addCollectionListener(this._rtcSession.sid, "co-edit-data", window, this._callback, dojo.hitch(this, this._errorHdl), false);
			
			// Register window unload event, clear my subscription when unloaded.
			dojo.addOnWindowUnload(this, "stop");
		}
		catch (e)
		{
			console.log("Error happen when starting rtc4web long poller: ", e);
		}
	};
	
	/**
	 * Stop the rtc4web long poller.
	 */
	this._stopRtc4Web = function()
	{
		try
		{
			if (this._rtcSessionId != null)
			{
				rtc4web.core.removeCollectionListener(this._rtcSession.sid, "co-edit-data");
				rtc4web.core.leaveSession(this._rtcSessionId, this._rtcSessionUser);
			}
			this._rtcSession = null;
			this._rtcSessionId = null;
			this._rtcSessionUser = null;
		}
		catch (e)
		{
			console.log("Error happen when stopping rtc4web long poller: ", e);
		}
	};
	
	/**
	 * Start the Cometd long poller.
	 */
	this._startCometd = function()
	{
		concord.net.cometd.start(this._session, this._callback, this._isSharedMode);
	};
	
	/**
	 * Stop the Cometd long poller.
	 */
	this._stopCometd = function()
	{
		concord.net.cometd.stop();
	};
	
	/**
	 * Start the long poller according to the type.
	 */
	this.start = function(session, callback)
	{
		this._session = session;
		this._callback = callback;
		this._isRtc4Web = CONFIG_POLLER.isRtc4Web;
		this._isSharedMode = CONFIG_POLLER.isSharedMode;
		this._rtcContextPath = CONFIG_POLLER.rtcContextPath;
		
		if (this._isRtc4Web)
		{
			this._startRtc4Web();
		}
		else
		{
			this._startCometd();
		}
	};
	
	/**
	 * Stop the long poller according to the type.
	 */
	this.stop = function()
	{
		if (this._isRtc4Web)
		{
			this._stopRtc4Web();
		}
		else
		{
			this._stopCometd();
		}
	};
}();
