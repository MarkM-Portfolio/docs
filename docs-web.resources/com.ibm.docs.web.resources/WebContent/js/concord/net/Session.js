/* ***************************************************************** */
/*                                                                   */
/* HCL Confidential                                                  */
/*                                                                   */
/* OCO Source Materials                                              */
/*                                                                   */
/* Copyright HCL Technologies Limited 2010, 2022                     */
/*                                                                   */
/* The source code for this program is not published or otherwise    */
/* divested of its trade secrets, irrespective of what has been      */
/* deposited with the U.S. Copyright Office.                         */
/*                                                                   */
/* ***************************************************************** */

/*
 *@author: gaowwei@cn.ibm.com
 */
dojo.provide("concord.net.Session");

dojo.require("concord.net.Beater");
dojo.require("concord.net.Sender");
dojo.require("concord.net.Poller");
dojo.require("concord.net.Connector");
dojo.require("concord.text.Log");
dojo.require("concord.util.browser");
dojo.require("concord.util.uri");
dojo.require("concord.beans.Participant");
dojo.require("dojo.i18n");
dojo.require("concord.util.BidiUtils");
dojo.requireLocalization("concord.net","Session");

/**
 * Session maintains synchronize states between server and client
 */
dojo.declare("concord.net.Session", null, {
    scene: null,
    bean: null,
    lastUserChange: null,
    userList: [],
    participantList: [],
    currentSeq: 0,
    clientSeq: 0,
    clientId: null,
    url: null,
	sessionToken:null,
	waitingList: [],
	sendoutList: [],
	_receiveList:[],
	singleMode: true,
	//whether this heart beat is sent automatically, if false, will not show auto save info.
	_autoSent: true,
	commentsProxy: null,
	loadParameter: null,
	loadedBefore: false,
	lastSyncTime: null,
	firstBeater: true,
    
    constructor: function constructor(scene, repository, uri){
        this.scene = scene;
        this.repository = repository;
        this.uri = uri;
        var url = concord.util.uri.getDocServiceRoot() + "/";
        url = url + repository + "/" + uri + "/edit";
        this.url = url;
    },
    
    /**
     * call this method to join the session, session will automatically started after join successfully
     * @param	criteria
     *			criteria for partial loading the document
     */
    join: function(criteria)
    {
    	this.stop();
    	
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
    	
    	// for upload new version case, if user choose to use the old draft, 
    	// need to set jobId as "null" to let server ignore conflict check. 
    	if(DOC_SCENE.syncDraft != null && DOC_SCENE.syncDraft == false)
    	{
        	this.loadParameter.jobId = "null";
        	DOC_SCENE.syncDraft = null;
    	}
    	else if(DOC_SCENE.hasACL)
    	{
    		this.loadParameter.jobId = "null";
    		DOC_SCENE.showACLWarning = false;
    	}
    	else if(DOC_SCENE.hasTrack)
    	{
    		this.loadParameter.jobId = "null";
    		DOC_SCENE.showTrackWarning = false;
    	}
    	else
    	{
    		this.loadParameter.jobId = DOC_SCENE.jobId;
    	}
    	this.loadParameter.lock = DOC_SCENE.hasConflictLock;

        // now let's try to join the session and load data
       	this._load(null, true);
    },
    
    /**
    * call this method to stop the session object
    */
   stop: function()
   {
       this._stopPoller();
       this._stopSender();
       this._stopBeater();
       // connector is started on demand, don't forget to stop it in this case
       concord.net.Connector.stop();
       
       // Make the user left before clear the user list, so can process the participants list successfully next time.
       try
       {
           var len = (this.participantList != null) ? this.participantList.length : 0;
           var currentUserId = (pe != null && pe.authenticatedUser != null) ? pe.authenticatedUser.getId() : null;
           if (currentUserId != null)
           {
               for (var index = 0; index < len; index++)
               {
                   var userBean = this.participantList[index].getUserBean();
                   if (currentUserId != userBean.getId())
                   {
                       this.scene.userLeft(userBean);
                   }
               }
           }
       }
       catch (e)
       {
    	   console.log("Error happens while clearing user list: ", e);
       }
       // clean user list
       this.participantList = [];
       this.lastUserChange = null;
    },
    
    _start: function()
    {
    	if(pe.scene.isHTMLViewMode()||window.g_presentationMode && concord.util.browser.isMobile() && concord.util.mobileUtil.disablePresEditing)
    		return;
        this._startBeater();
        this._startSender();
    },
        
    /**
     * reload document state from server
     */
    reload: function() {
    	this._receiveList = [];
    	var criteria = this.scene.getUpdatedCriteria();
    	if (criteria != null) {
    		this.loadParameter.criteria = dojo.toJson(criteria);
    	}
    	this._load(null, false);
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
    	concord.net.Connector.start(this, dojo.hitch(this, this._loaded, args), "load", parameter, this.scene);
    },
    
    _loaded: function(args, data) {
    	if (data.status == "error")
        {
    		if (data.error_code == 1703)
        	{
        		// error case when there is edit conflict when import document concurrently
    			if (g_reloadLog) {
    				LOG.level = 'report';
    				LOG.log("My user id is: " + pe.authenticatedUser.getName());
    				LOG.log("Reload from 1703");
    				LOG.report();
    			}
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
        
        this.bean = new concord.beans.Document(data.bean);
        if (data.activity != null)
        {
        	var activityId = data.activity.activityId;
        	var activityName = data.activity.activityName;
        	dojo["require"]("concord.beans.Activity");        	
        	var activity = new concord.beans.Activity(activityId, activityName);
        	this.bean.setActivity(activity);
        }

        this._updateSession(data, true);
        // 40270: [Co-editing]It will reload two times continuously  for one action
        // 1. Anytime when we just finished reloading then we record the status(the server seq) of this reload,
        // then if immediately we received another reload request from other, then we compare and deny this request
        // if we already reloaded that status(the server seq).
        // 2. This will work for loading(reload, reconnect, refresh and join)
        this.reloadCause = this.getCurrentSeq();
        
    	console.log("server sequence is: ", this.getCurrentSeq());

        // call scene to hide loading box, and fullfill data into editor
		try
		{
			this.scene.loaded(data.state);
		} 
		catch (e) 
		{
			if(e && e.error_code && e.error_code == "1603"){
				this.scene.gotoErrorScene(e.error_code, e);
				return;
			}
			throw e;
		};
    	this.loadedBefore = true;
    	
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
    	//defect 9470 a conflict resolved message need  to sent when the document is reload.
//    	var newmsg =this.createMessage();
//		newmsg.resolve_conflict= "true";
//		this.sendMessage([newmsg]);	
        // clear conflict lock status
    	DOC_SCENE.hasConflictLock = false;
        // clear conflict lock status
    	DOC_SCENE.hasConflictLock = false;
    	// ready to start all services
    	setTimeout(dojo.hitch(this, this._start), 1000);   	
    },
    
    isLoadedBefore: function()
    {
    	return this.loadedBefore;
    },
    
    _updateSession: function(data, clear)
    {
        this.clientId = data.client_id;
		this.secureToken = data.secure_token;
        this.setCurrentSeq(parseInt(data.seq, 10));
        if (clear)
        {
        	this.waitingList = [];
        	this.sendoutList = [];
            this.setClientSeq(parseInt(data.client_seq, 10));
        }
        else {
        	// update client id in messages, since client id may change after reload
        	for (var i = 0; i < this.waitingList.length; i++)
        	{
        		var msg = this.waitingList[i];
        		this._markMessage(msg, true);
        	}
        	// update client id in messages, since client id may change after reload
        	for (var i = 0; i < this.sendoutList.length; i++)
        	{
        		var msg = this.sendoutList[i];
        		this._markMessage(msg, true);
        	}
        }
    },
        
    _updateSeqInMsg: function(list, seq)
    {
    	for (var i = 0; i < list.length; i++)
    	{
    		var msg = list[i];
    		msg.server_seq = seq;
    	}    	
    },
        
    _startBeater: function(){
    	concord.net.Beater.start(this, dojo.hitch(this, this.processBeatResult));
    },
        
    _stopBeater: function(){
    	concord.net.Beater.stop();
    },
    
    _startSender: function(){
    	concord.net.Sender.start(this, null);
    },
    
    _stopSender: function(){
    	concord.net.Sender.stop();
    },
    
    _startPoller: function(){
    	if (this.singleMode)
    	{
            // 1. start long poller
            concord.net.Poller.start(this, dojo.hitch(this, this.receiveMessage));

            //2 stop autosave
            this.singleMode = false;
            
            //3 send autosave message in the list as coedting message
            if (this.waitingList && (this.waitingList.length > 0)) 
                concord.net.Sender.send();
            
            // try to sync to with server sequence
            this.syncState(0, -1);
        
            this.scene.coeditStarted();    		
        }
    },
    
    _stopPoller: function(){
    	if (!this.singleMode)
        {
            concord.net.Poller.stop();
            this.singleMode = true;
            this.scene.coeditStopped();    		
        }
    },
        
    processBeatResult: function(data) {
        if (this.singleMode) {
        	// process server generated message list first
        	// those messages are appended in hbPendingList
        	if (data.msgList)
        	{
        		for (var i = 0; i < data.msgList.length; i++)
        		{
        			var msg = data.msgList[i];
        	    	if (msg.is_server_msg)
        	    		this.receiveServerMessage(msg.msg);
        	    	else
        	    		this.processMessage(msg);
        		}
        	}
        	
            if (this.sendoutList.length > 0) {
            	if(this._autoSent){
            		this.scene.showSavedMessage(5000);
            	} else {
            		// _autoSent may be false only in function save.  
            		// reset to true to make sure autosave message can be shown after executed heart beat.
            		this._autoSent = true;
            	}                
                if (data.mode == "coedit") {
                    // mode from single to co-edit has started,
                    // autosaved message will be received again by synState
                }
                else {
                    // update server sequence, clear sendout list
                    this.setCurrentSeq(parseInt(data.seq, 10));
					
                    this.sendoutList = [];
                }
            }
        }
        this.processParticipantList(data.participants, data.time);
        this.processCannotJoinUserList(data.cannotJoinUsers);
        
        // check server seq with local to see if channel is invalid
        if ( this.getCurrentSeq() < data.seq)
        {
        	// it's a way to detect if long poll channel works well
        	// heart beat response will tell client what's the current status of server
        	// if they are not synchronized, client will restart long poll channel automatically
        	var curr = new Date();
        	var ct = curr.getTime();
        	var lt = this.lastSyncTime.getTime();
        	if (ct - lt > (10*1000 + g_hbInterval))
        	{
        		console.log("heart beat tell me I'm out of sync for more than " + (10*1000 + g_hbInterval) + "ms");
        		this._stopPoller();
        		this._startPoller();
        	}
        }
        else if (this.getCurrentSeq() == data.seq)
        {
        	this.lastSyncTime = new Date();
        }
        // Comments out following codes, because in some case, this logic is not correct, and actually, this logic is not needed currently.
        // The case is: hb request has got a server sequence but has not arrived at client, a new message is sent to server and published to client, the currentSeq
        // of client is changed to the new server sequence after receives the new message, then hb response arrives at client, the seq in hb response data is less 
        // than the currentSeq of client, that causes the client to reload, actually, in this case do not need to reload document, so I comment out following codes.
//        else if (this.getCurrentSeq() > data.seq)
//        {
//        	console.log("oops! heart beat tell me I'm newer than server!!!");
//        	this.reload();
//        }
        this.firstBeater = false;
    },
    
    // Display the warning message that some users can not join because of no entitlement for co-editing.
    processCannotJoinUserList: function(cannotJoinUsers)
    {
    	try
    	{
    		if (cannotJoinUsers != null)
    		{
        		var errorCode = cannotJoinUsers.errorCode;
        		var users = cannotJoinUsers.users;
        		var length = users != null ? users.length : 0;
        		if (length > 0 && errorCode != 0)
        		{
        			this.scene.showUserCannotJoinMsg(errorCode, users);
        		}
        	}
    	}
    	catch (ex)
    	{
    		consoloe.log("Error happens while process the user list that can not join the session", ex);
    	}
    },
    
    _parseParticipants: function(list) {
        var pList = [];
        for (var i = 0; i < list.length; i++)
        {
        	pList.push(new concord.beans.Participant(list[i], list[i].client_id,parseFloat(list[i].join_time)));
        }
        return pList;
    },
    
    processParticipantList: function(ps, time) {
        if (time == this.lastUserChange) 
            return;
        
        var pList = this._parseParticipants(ps);
        
        var lastList = dojo.clone(this.participantList);
        this.participantList = pList;
        var lastCount = lastList.length;
        var participantChanged = false;
        
        try
        {
        	this.lastUserChange = time;
        	
	        for (var i = 0; i < pList.length; i++) {
	            var client_id = pList[i].getClientId();
	            var joinTime = pList[i].getJoinTime();
	            var user_id = pList[i].getUserBean().getId();
	            var find = false;
	            for (var j = 0; j < lastList.length; j++) {
	                if (client_id == lastList[j].getClientId() && joinTime == lastList[j].getJoinTime()) {
	                    find = true;
	                    lastList.splice(j, 1);
	                    break;
	                }
	                else if (user_id == lastList[j].getUserBean().getId())
	                {
	                    // If client id is different but user id is same, then should remove this participant from last list.
	                    lastList.splice(j--, 1);
	                }
	            }
	            if (find == false) {
	                //user joined
	                var userId = pList[i].getUserBean().getId();
	                var userName = pList[i].getUserBean().getName();
	                var editorStore = pe.scene.getEditorStore();
	                if( editorStore && !editorStore.exists(userId) )
	                {// this user is not in editors list
	                	//To fix defect 41585
	                	var isSync = true;
	                	editorStore.refresh(isSync);
	                }
	                try {
	               		//if( userId != pe.authenticatedUser.getId() )
	               		{
	               			participantChanged = true;
	               			console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~user:'+userId+' joined');
	               			this.scene.userJoined( pList[i].getUserBean());
	               		}
	                } catch (e) {
	                	// sometimes there are error in notification code
	                	// catch the error for continuing processing
	                }
	                if (this.singleMode && (lastCount == 1 || (lastCount == 0 && pList.length > 1))) 
	                    this._startPoller();
	                // for mobile, do not show message after first loaded.
	                if(participantChanged && !(concord.util.browser.isMobile() && this.firstBeater)){
	                	var msg = dojo.i18n.getLocalization("concord.net","Session").userJoinedMessage;
	                	setTimeout( dojo.hitch(this, function(msg,userName){
	                		this.scene.showInfoMessage(dojo.string.substitute(msg, [BidiUtils.isBidiOn() ? BidiUtils.addEmbeddingUCC(userName) : userName]),5000);
	                	},msg,userName), 5000);                		                	
	                }    
	            }
	        }
	        
	        for (var i = 0; i < lastList.length; i++) {
	            // user left
	            try {
	            	if( lastList[i].getUserBean().getId() != pe.authenticatedUser.getId() )
	            	{
	            		participantChanged = true;
	            		this.scene.userLeft( lastList[i].getUserBean() );
	            		var userName = lastList[i].getUserBean().getName();
	            		var msg = dojo.i18n.getLocalization("concord.net","Session").userLeftMessage;
	            		this.scene.showWarningMessage(dojo.string.substitute(msg, [BidiUtils.isBidiOn() ? BidiUtils.addEmbeddingUCC(userName) : userName]),5000);
	            		var userId = lastList[i].getUserBean().getId();
//	            		var screenReaderNode = pe.scene.CKEditor.document.$.getElementById('coid_CSS_'+userId);
//	            		if(screenReaderNode)
//	            			screenReaderNode.parentNode.removeChild(screenReaderNode);
	            	}
	            } catch (e) {
	            	// sometimes there are error in notification code
	            	// catch the error for continuing processing       
	            }
	        }
        }
        catch (ex)
        {
        	this.lastUserChange = null;
        	console.log("Exception happens while processing participants", ex);
        }
        
        if (this.participantList.length == 1) {
            this._stopPoller();
        }
        
        if( participantChanged )
        {
        	this.scene.updateParticipant(this.participantList);
        }
    },
    
    getParticipantList: function(){
		concord.net.Beater.beat(false, true);
        return this.participantList;
    },
    
    isSingleMode: function() {
    	return this.singleMode;
    },
    
    isDisconnected: function() {
    	var b = concord.net.Connector.isConnecting();
    },
    
    getCurrentSeq: function(){
        return this.currentSeq;
    },
    
    setCurrentSeq: function(seq){
        this.currentSeq = seq;
        this.lastSyncTime = new Date();
    },
    
    getClientSeq: function(){
        return this.clientSeq;
    },
    
    setClientSeq: function(cs){
    	this.clientSeq = cs;
    },
    
    increaseClientSeq: function(){
        this.clientSeq = this.clientSeq + 1;
        return this.clientSeq;
    },
    
    getClientId: function(){
        return this.clientId;
    },
    
    lockEditor: function(errorCode) {
    	this.scene.lock(errorCode);
    },
    
    unlockEditor: function() {
    	this.scene.unlock();
    },
    
    makeOffline: function(reasonMsg) {
    	this.stop();
    	this.scene.offline(reasonMsg);
    },
    
    // Fire a heart beat request to check whether this session has been kicked out or not.
    checkKickedOut: function() {
    	this._autoSent = true;
    	concord.net.Beater.beat(false, false);
    },
    
    // Make this session be kicked out, because the same user joined the document from different browser.
    makeKickedOut: function() {
    	this.stop();
    	this.scene.makeKickedOut();
    },
    
    // get state changes between start and end
    getState: function(start, end){
        var url = this.url + "?method=getState";
        url = url + "&start=" + start;
        if (end > 0) {
            url = url + "&end=" + end;
        }
        var response, ioArgs;
        dojo.xhrGet({
            url: url,
            handleAs: "json",
            timeout: 30000,
            sync: true,
            preventCache: true,
            handle: function(r, io){
                response = r;
                ioArgs = io;
            }
        });
        
        if (response instanceof Error) {
            return null;
        }
        return response;
    },
    
    _postGetPartial: function(callback, criteria, response, ioArgs){
        var result;
    	// Handle error.
        if(response instanceof Error){
        	var status = ioArgs.xhr.status;
        	if(status == 500)
        	{
        		try
        		{
        			var respJson = dojo.fromJson(response.responseText);
        			this.scene.gotoErrorScene(respJson.error_code, null);
        		}
        		catch(e)
        		{
        			this.scene.gotoErrorScene(status, null);
        		}
        	}
        	else
        	{
        		this.scene.gotoErrorScene(status, null);
        	}	
        	result = new String(status);
        	return result;
        }
        else if(response && response.status == "error")
        {
            result = response;
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
    	if (this.isDirty())
    	{
    		this._autoSent = true;
    		concord.net.Beater.beat(false, true);
    	}
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
        var xhrArgs = {
            url: url,
            content: {
                // If sCriteria is undefined, this parameter "criteria" is not appended to the request, it's checked by dojo.
                "criteria": sCriteria
            },
            handleAs: "json",
            handle: syncCall ? function(r, io){
                response = r;
                ioArgs = io;
            }: dojo.hitch(this, this._postGetPartial, callBack, criteria),
            sync: syncCall,
            preventCache: true,
            noStatus: true
        };
        dojo.xhrGet(xhrArgs);
        
        if(syncCall){
            return this._postGetPartial(null, criteria, response, ioArgs);
        }
    },
    
    /**
    * call this method to reconnect to server to sync state
    */   
	reconnect: function() {
		// stop the whole session
		this.stop();
		// call scene to give user some indication
		this.scene.reconnecting();
		// start the reconnector
		concord.net.Connector.start(this, dojo.hitch(this, this._reconnected), "reconnect", null);
	},
        
	_reconnected: function(data)
	{
		
		var action = data.reconnect_action;
		console.log("_reconnected:"+action);
		// call scene to clear warning message
		this.scene.reconnected();
		// unlock editor, if any
		this.unlockEditor();
		if (action == "reload")
		{	// cannot synchronize with server anymore, reload the document
			// session will be restarted after loading succeeded
			if (g_reloadLog) {
				LOG.level = 'report';
				LOG.log("My user id is: " + pe.authenticatedUser.getName());
				LOG.log("Need reload the content, action is _reconnected reload");
				LOG.report();
			}
			this.reload();
		}
		else if (action == "refresh")
		{
			if (g_reloadLog) {
				LOG.level = 'report';
				LOG.log("My user id is: " + pe.authenticatedUser.getName());
				LOG.log("Need reload the content, action is _reconnected refresh");
				LOG.report();
			}
			// If the type of client document is not the same with the type of draft, then should reload the window.
			window.location.reload();
		}
		else if (action == "ok")
		{
			this._updateSession(data, false);
			if(pe.noPermission) {
				if (g_reloadLog) {
					LOG.level = 'report';
					LOG.log("My user id is: " + pe.authenticatedUser.getName());
					LOG.log("Need reload the content, Permission -- > noPermission -->Permission.action is _reconnected ok");
					LOG.report();
				}
				delete pe.noPermission;
				this.reload();
			}
			// resume directly
			setTimeout(dojo.hitch(this, this._start), 1000);
		}
		else if (action == "restore")
		{
			// FIXME: need to implement, reload for now
			var args = {};
			args.callback = dojo.hitch(this, this._restore);
			args.data = this.scene.generateRestoreMsg();
			if (args.data != null)
			{
				// Presents that this is a reset content message for fail over.
				args.data.failover = "yes";
			}
			this._load(args, false);
			return;
        
			// need to restore document from client to server
			// local messages need to be cleared in this case
			this._updateSession(data, true);
        
			// call editor implementation to create & send a reset content message
			this.scene.restoreState();
	
			// then restart myself
			setTimeout(dojo.hitch(this, this._start), 1000);
		}
	},
        
	_restore: function(msg) {
		if (!msg)
		{
			return;
		}
		
		// restore to my local first
		this.scene.restoreState(msg);
		// send to server and other clients
		this.sendMessage(msg);
	},    

	getLeaveData : function()
	{
	    return this.scene.getLeaveData();
	},
	
    leave: function(){
    	if (this.isDisconnected())
    		return;
    	
    	if (this.isDirty() && this.singleMode)
    	{
    		// something need to save to server
    		// auto SAVE draft
			// Fix for PMR DOCS-143 and DOCS-145
			// The leave function is used to leave a co-editing session on a shared document. It's called from concord.main.App.onUnload method which is an event fired  on closing of the tab or browser.
			// This method has synchronous ajax calls to the server one for persisting dirty data and other for leaving the shared session.
			// In the latest version of Chrome v80 chrome has removed support for any synchronous calls from the unload or close events of tab or browser. Ref link https://www.chromestatus.com/feature/4664843055398912
			// In order to make the ajax calls working the fix is to make them asynchronous only for chrome browser.
			// the beat method takes three argument first is for whether it is leave event, second is it a synchronous call and other is whether to save data.
			// specifically for chrome removed save method and let the beat method handle both dirty data save and co-edit session leave intimation. 
			// So for the same the beat method is passed three arguments leave=true, sync=false and save=true
			// Haven't changed anything for chrome or IE browser.
			if(dojo.isChrome >= 80){
				this._autoSent = true;
				// beat for LEAVE request
				concord.net.Beater.beat(true,false,true);
			}else{
				this.save(true);
				// beat for LEAVE request
				this._autoSent = true;
				concord.net.Beater.beat(true);
			}
    		
    	}
    	else {
    		// just send out LEAVE request
            var url = this.url + "?method=leave";
            var response, ioArgs;
            var leavedata = this.getLeaveData();
            var sLeavedata = null;
            var sync = true;
            if(leavedata!=null)
            {
                try {
                    sLeavedata = dojo.toJson(leavedata);
                } catch (e) {
                    console.log("error happens when converting leavedata to json format string: ", e);
                }
            }

            // Fix for PMR DOCS-143 and DOCS-145
            // In the latest version of Chrome v80 chrome has removed support for any synchronous calls from the unload or close events of tab or browser. Ref link https://www.chromestatus.com/feature/4664843055398912. 
            // So for chrome making the ajax call asynchronous
            sync = !(dojo.isChrome >= 80); // set sync = false if chrome 80+
			
            dojo.xhrGet({
                url: url,
                handleAs: "json",
                content: {leavedata: sLeavedata},
                handle: function(r, io){
                    response = r;
                    ioArgs = io;
                },
                sync: sync,
                preventCache: true
            });
            
            if (response instanceof Error) {
                return null;
            }
      }
      // Fix for PMR DOCS-143 and DOCS-145
      // In the latest version of Chrome v80 chrome has removed support for any synchronous calls from the unload or close events of tab or browser. Ref link https://www.chromestatus.com/feature/4664843055398912. 
      // So for chrome making the ajax call asynchronous and in order the processing to be completed in backend waiting for 5 seconds.
      if(dojo.isChrome >= 73) this.sleep(2000);

    	this.scene.setLeaveData(null);
    },
	
	sleep: function (milliseconds) {
		var date = Date.now();
		var currentDate = null;
		do {
			currentDate = Date.now();
		} while (currentDate - date < milliseconds);
	},
    
    /* discard current draft, and reload with published version */
    discard: function(saveDraft) {
//	if (saveDraft)
//	{	
    	// to make sure the revision can created for the discarded draft, 
    	// force save draft 
		this.save(true);
//	}

    	var url = concord.util.uri.getDocDraftAccUri() + "?publish=" + saveDraft;
        var response, ioArgs;
        dojo.xhrDelete({
            url: url,
            sync: true,
            handle: function(r, io){
                response = r;
                ioArgs = io;
            }
        });
        
        if (response instanceof Error) {
        	if(response.status == 404)
        		pe.scene.showErrorMessage(dojo.i18n.getLocalization("concord.net","Session").discardErrorDelete,5000);
        	else if(response.status == 403)
        		pe.scene.showErrorMessage(dojo.i18n.getLocalization("concord.net","Session").discardErrorNoPermission,5000);
        	else if(response.status == 409)
        		pe.scene.showErrorMessage(dojo.i18n.getLocalization("concord.net","Session").discardErrorNoSpace,5000);
        	else
        		pe.scene.showErrorMessage(dojo.i18n.getLocalization("concord.net","Session").discardError,5000); 
        	return;
        }
        
        // After discarded draft successfully, should clear client message list, do not need to fire heart beat request when leaving.
        this.waitingList = [];
    	this.sendoutList = [];
		
    	if (g_reloadLog) {
			LOG.level = 'report';
			LOG.log("My user id is: " + pe.authenticatedUser.getName());
			LOG.log("Reload from discard");
			LOG.report();
		}
        window.location.reload();
    },
    
    /* save draft */
    // autoSave is true means this function is run in background.
    // sync is to set the sync property to post the request (xhrPost). 
    // return true when the draft is dirty & save successfully, otherwise return false to avoid show message.
    save: function(autoSave, nSync)
    {
    	// save messages to server in sync mode
    	if (this.isDirty())
    	{
    	   this._autoSent = autoSave;
    	   concord.net.Beater.beat(false, !nSync, true);
    	   return true;
    	} else {
    		if(!autoSave)
    		{
        		pe.scene.showDraftNothingSavedMessage();
    		}
        	return false;
    	}
    },

    /* save as new document */
    saveAs: function(d, c) {
    	// let's kick off a heart beat to save the content to draft
    	if (this.isDirty())
    	{
    		this._autoSent = true;
    		concord.net.Beater.beat(false, true);
    	}
    	
		var sData = dojo.toJson(d);
		var url = concord.util.uri.getDocDraftAccUri() + "?method=saveas";
		if(DOC_SCENE.communityID && DOC_SCENE.communityID.length > 0)
		{
			url += "&communityuuid=" + DOC_SCENE.communityID;
		}   
	
		dojo.xhrPost({
			url: url,
			handleAs: "json",
			handle: dojo.hitch(this, this.postJobHandle, c),
			sync: false,
			contentType: "text/plain",
			timeout: g_hbTimeout,
			postData: sData
		});
    },

    /* publish document */
    // * d: data
    // * c: callback
    // * o: overwrite
    publish: function(d, c, o) {
    	// because publish content only be posted to filer as a new version
    	// let's kick off a heart beat to save the content to draft
    	if (this.isDirty())
    	{
    		this._autoSent = true;
    		concord.net.Beater.beat(false, true);
    	}
		var sData = dojo.toJson(d);
		var url = concord.util.uri.getDocDraftAccUri() + "?method=publish";	
		if(o)
		{
			url+="&overwrite=true";
		}
	
		dojo.xhrPost({
			url: url,
			handleAs: "json",
			handle: dojo.hitch(this, this.postJobHandle, c),
			sync: false,
			contentType: "text/plain",
			timeout: g_hbTimeout,
			postData: sData
		});
    },
    
    postJobHandle: function(cb, response, ioArgs) {
    	if (response instanceof Error)
    	{
    		cb(response, ioArgs);
    		return;
    	}
    	if (response.status == "pending")
    	{
    		this.queryJob(response.id, cb);
    	}
    	else
    	{
    		cb(response, ioArgs);
    	}
    },
    
    /* query a job's status until it fails or complete */
    queryJob: function(jobId, cb) {
    	var url = contextPath + "/api/job/" + DOC_SCENE.repository + "/" + DOC_SCENE.uri + "/" + jobId;
      	dojo.xhrGet
    	(
    		{
    			url: url,
    			handleAs: "json",
    			handle: dojo.hitch(this, this.jobHandle, jobId, cb),
    			sync: false,
    			preventCache: true,
    			timeout: g_hbTimeout
    		}
    	);
    },
    
    jobHandle: function(jobId, cb, response, ioArgs)
    {
    	if (response instanceof Error)
    	{
		if (response.dojoType == "timeout")
		{
			cb(response, ioArgs);
			return;
		}
		else
		{
			// check again
    			setTimeout(dojo.hitch(this, this.queryJob, jobId, cb), 1000);
    			return;
		}
    	}

    	var ret = false;
    	if (response.status == "complete")
    	{
    		ret = true;
    	}
    	else if (response.status == "broken")
    	{
    		ret = true;
    	}
    	else if (response.status == "error")
    	{
    		ret = true;
    	}
    	else if (response.status == "pending")
    	{
    		setTimeout(dojo.hitch(this, this.queryJob, jobId, cb), 1000);
    		return;
    	}
    	else
    	{
    		console.info("unknown job status: " + response.status);
    		// check again
    		setTimeout(dojo.hitch(this, this.queryJob, jobId, cb), 1000);
    	}
    	
    	if (ret == true)
    	{
    		cb(response, ioArgs);
    	}
    },
    
    submit: function(data)
    {
    	if (this.isDirty())
    	{
    		this._autoSent = true;
    		concord.net.Beater.beat(false, true);
    	}    		
    	var clean = (data && data.clean) ? true : false;
    	var response, ioArgs;
        var callback = function(r, io) {response = r; ioArgs = io;};
    	var url = this.url + "?method=submit"+"&clean="+clean;
//		setTimeout(function() {
			dojo.xhrPost({
			url: url,
			handleAs: "json",
			sync: true,
			handle: callback,
			contentType: "text/plain"
		});
    	if (response instanceof Error) {
    		return false;
    	}
        if(!response) return true;
        var error_code = response.error_code;
        if (error_code) {
            return false;        
        }else{
            return true
        }    
//		},0);
    },
    
    /* check if there are unsaved changes */
    isDirty: function() {
		// now the dirty is determined by if:
		//   any unsended message
		//   any unconfirmed message
		var isDirty = ((this.waitingList.length > 0) || (this.sendoutList.length > 0));
		return isDirty;
    	
    },
    
    /* get document meta data from server, and update document bean */
    updateDocMeta: function() {
    	var url = concord.util.uri.getDocUri() + '?method=getDetail';
        var response, ioArgs;
        dojo.xhrGet({
            url: url,
            timeout: 30000,
            sync: true,
            preventCache: true,
            handle: function(r, io){
                response = r;
                ioArgs = io;
            }
        });
        if (response instanceof Error)
        	return false;
        else {
        	var meta = dojo.fromJson(response);
        	this.bean.update(meta);
        }
     },
    
    /* called when editor want to create a content change message */
    /*
     * isControl = true, means a control message, will only be sent out in co-editing mode, no quality of service,
     * which means, the message may be lost
     * isControl = false, means a content change message, will apply to draft eventually
     * asControl = true, means one message like control message, but it will be added into transformed list as content change message, 
	 * will be filtered out when apply to draft
     */
    createMessage: function(isControl, asControl)
    {
    	var msg = new Object();
    	if (isControl)
    	{
    		msg.isCtrl = true;
    	}
    	if (asControl)
    	{
    		msg.asCtrl = true;
    	}	
    	return msg;
    },
    
    /* called when editor generate a content change message */
    /* msg: can be a single message object, or a message Array list */
    /* errorhandler: to handle the status of sendMessage*/
    //for presentaion workitem
    sendMessage: function(msg,errorHandler) {
    	if (pe.scene.isDocViewMode()) {
			// don't send content message in view/observer mode
			return;
		}
    	
    	var waitingDirty = false;
    	if(msg instanceof Array)
    	{
    		for (var i = 0; i < msg.length; i++)
    		{
    			var item = msg[i];
    			this._markMessage(item);
    			if (item.isCtrl)
    			{
    		    	// control message will be only be sent in co-editing mode, and will not be put in waitingList
					this.sendControlMessage(item,errorHandler);
    			}
    			else {
    				// asControl message will be only sent in co-editing mode, and will not be put in waitingList
    				if (item.asCtrl) {
    					if (this.singleMode) continue;
    				}
    				// append to waiting list
    				waitingDirty = true;
    				this.waitingList.push(item);
    			}
    		}
    	}
    	else {
    		this._markMessage(msg);
    		if (msg.isCtrl)
    		{
    	    	// control message will be only be sent in co-editing mode, and will not be put in waitingList
    			this.sendControlMessage(msg);
    		}
    		else {
    			// asControl message will be only sent in co-editing mode, and will not be put in waitingList
    			if (msg.asCtrl) {
    				if (this.singleMode) return;
    			}
    			// append to waiting list
				waitingDirty = true;
    			this.waitingList.push(msg);
    		}
    	}

    	// no content change message? we are done
    	if (!waitingDirty)
    		return;
    	
    	if (this.singleMode)
    	{
    		if(pe.scene.isDraftSaved())
    			pe.scene.showSavingMessage();
    	}
    	else {
    		concord.net.Sender.send();
    	}
    	pe.scene.switchDraftBadge(true);
    },
    
    _markMessage: function(msg, isFromUpdateSession) {
    	msg.server_seq = this.getCurrentSeq();
    	if(!isFromUpdateSession)
    	{
    		var newSeq = this.increaseClientSeq();
        	msg.client_seq = newSeq;
    	}
    	/*else {
       		for update session
       		should not increase its client seq for msg 
       		which is already in waiting list or sendout list
    	}*/
    	
    	msg.client_id = this.clientId;
    },
    
    /* called when sending a single control message
     * no quality of service, only in co-edit mode
     */
    sendControlMessage: function(msg,errorHandler) {
    	msg.isCtrl = true;
    	if (this.singleMode) return;
    	var fooList = new Array();
    	fooList.push(msg);
    	concord.net.Sender.send(fooList,errorHandler);
    },
    
    /* called when long poll receive a message */
    receiveMessage: function(m) {
    	if(pe.scene.isDocViewMode(true)) {// don't receive message in view mode
    		return;
    	}
		if (m) {
			this._receiveList = this._receiveList.concat(m.value? m.value : m.data);
		}

    	if (!window.g_noimprove && !window.g_syncprocess && concord.util.browser.isMobile() && pe.scene.docType == 'pres')
    	{
    		setTimeout(dojo.hitch(this, this._receiveMessage0), 100);
    	}
    	else {
    		this._receiveMessage0();
    	}    	
    },
    
    _receiveMessage0: function() {
		var i;
		for (i = 0; i < this._receiveList.length; i++) {
			// check pending for each message
			if(this.scene.checkPending()){
				setTimeout(dojo.hitch(this, this._receiveMessage0), 0);
				break;
			}
			var data = this._receiveList[i];
			//var data = msg.value ? msg.value : msg.data;
			if (data.type == "content") 
				this.receiveContentMessage(data.msg);
			//else if (data.type == "comments") // this should never happens after all editor changed to contents...
			//	this.receiveCommentsMessage(data.msg);
			//else if (data.type == "notify") // remove it after dropped notification bar
			//	this.receiveNotificationMessage(data.msg);
			else if (data.is_server_msg)
				this.receiveServerMessage(data.msg);
			else if (data.type == "control") 
				this.receiveControlMessage(data.msg);
			else if (data.type == "activity") 
				this.receiveActivityMessage(data.msg);
			else 
				console.log("unknown message from long poll channel");
			
	    	if (!window.g_noimprove && !window.g_syncprocess && concord.util.browser.isMobile() && pe.scene.docType == 'pres')
			{
				if (i < this._receiveList.length - 1)
				{
					setTimeout(dojo.hitch(this, this._receiveMessage0), 100);
					this._receiveList.splice(0, 1);
					return;
				}
			}
		}

		this._receiveList.splice(0, i);    	
    },
    
    receiveContentMessage: function(msg)
    {
    	this.processMessage(msg);
    },
    
    receiveControlMessage: function(msg)
    {
    	try
    	{
    		var clientId = msg.client_id;
    		if (clientId != this.getClientId())
    		{
    			//this.scene.processMessage(msg);
    			if (msg.type == 'reload')
    			{
        			//1 rtc will resend all messages on its cache
        			//2 receive dup reload from all other clients
        			if (this.reloadCause && this.reloadCause >= msg.data)
        				return;
        			if (g_reloadLog) {
        				LOG.level = 'report';
        				LOG.log("My user id is: " + pe.authenticatedUser.getName());
        				LOG.log("Reloaded when receiveControlMessage and the msg is: " + dojo.toJson(msg));
        				LOG.report();
        			}
    				this.reload();    				
    			}
    			else
    			{
    			    this.scene.processMessage(msg);
    			}
    		}		
    		// Also need to update the last sync time after received control message by long poll.
    		this.lastSyncTime = new Date();
    	}
    	catch (e)
    	{
    		console.log("control message processing error: ", e);
    	}
    },
    
    receiveServerMessage: function(msg) 
    {
    	// console.log("received a message from server: ", msg.type);
    	try
    	{
    		if(msg.type == 'switchAutoPublish')
    		{
    			if (msg.user != pe.authenticatedUser.getId())
    			{
    				pe.scene.switchAutoPublishWidget(msg.enabled);
    			}
    		}
    		else if(msg.type == 'publishNotify' || msg.type == 'prepublishNotify')
			{
    			var overwrite = false;
    			if( msg.overwrite && msg.overwrite == 'true')
    			{	
    				overwrite = true;
    			}
    			if (msg.user != pe.authenticatedUser.getId() && !overwrite )
    			{
					var meta = msg.data;
					this.bean.update(meta);
					var userId = msg.user;
					var user = pe.authenticatedUser;
			        var len = (this.participantList != null) ? this.participantList.length : 0;
			               for (var index = 0; index < len; index++)
			               {
			                   var userBean = this.participantList[index].getUserBean();
			                   if (userBean.getId() == userId)
			                	   {
			                	   user = userBean;
			                	   break;
			                	   }
			               }
			        if(concord.util.uri.isECMDocument() || concord.util.uri.isExternalCMIS())
			        {
			        	this.stop();
			        }			        
			        if(msg.type == 'publishNotify')
			        {
			        	this.scene.showRemoteVersionPublishedMessage(user.getName());	
			        }					
			        if(msg.type == 'prepublishNotify' && (concord.util.uri.isECMDocument() || concord.util.uri.isExternalCMIS()))
			        {
			        	this.scene.showEndSessionDialog(user.getName());
			        }			        
			    }
			  }
        else if(msg.type  == 'ccmSubmitForReview' && concord.util.uri.isECMDocument() && msg.user != pe.authenticatedUser.getId() )
			  {
			    var userId = msg.user;
			    var user = pe.authenticatedUser;
			    var len = (this.participantList != null) ? this.participantList.length : 0;
			    for (var index = 0; index < len; index++)
			    {
			      var userBean = this.participantList[index].getUserBean();
			      if (userBean.getId() == userId)
			      {
			        user = userBean;
			        break;
			      }
			    }
			    this.stop();
			    this.scene.showEndSessionDialog(user.getName());
			  }
    		else
    		{
    			this.scene.processMessage(msg);
    		}
	
    		// Also need to update the last sync time after received server message by long poll.
    		this.lastSyncTime = new Date();
    	}
    	catch (e)
    	{
    		console.log("control message processing error: ", e);
        	if (g_reloadLog) {
        		LOG.level = 'report';
        		LOG.log("My user id is: " + pe.authenticatedUser.getName());
        		LOG.log("Exception occurs when handling: " + dojo.toJson(msg));
        		LOG.report();
        	}
    	}
    },
    
    processMessage: function(msg) {
    	// console.log("received a message from server: ", msg.server_seq);    		
    	var tstart = new Date();
    	this._recordStart = tstart;
    	
    	var msgSeq = parseInt(msg.server_seq, 10);
    	var clientId = msg.client_id;
    	var msgClienSeq = parseInt(msg.client_seq, 10);
    	var serverSeq = this.getCurrentSeq();
		if( msgSeq < serverSeq )
		{
			console.log("received a message with old state: ", msgSeq, ", ", serverSeq);
			return;
		}
		else if(msgSeq > serverSeq)
		{
			var off = msgSeq - serverSeq;
			if (off > 1)
			{	
				console.log("lose state from ", serverSeq+1, " to ", msgSeq-1);
				var success = this.syncState(serverSeq+1, msgSeq-1);
				if (success == false)
				{
					// TODO process anyway
				}
			}
			this.setCurrentSeq(msgSeq);
		}
		else
		{
			console.log("received a message with old state: ", msgSeq, ", ", serverSeq);
			return;
		}
		
		if (this.sendoutList.length > 0 && this.sendoutList[0].resolve_conflict == "true")
		{
			this.sendoutList.shift();
		}
		
		if(clientId == this.getClientId()) //from local
		{
			// server generated message use different clientId, will not go in here
			
			if(this.sendoutList.length==0)
			{
				console.log("!!!sendoutList is empty, but received a local message");
			}
			else if(msgClienSeq==this.sendoutList[0].client_seq)
			{
				this.sendoutList.shift();
			}
			
			if (msg.ctrl_type == "reject")
			{
				// this means server cannot accept my message, for example, exception occurred
				// while server performing OT on this message
				console.log("My message rejected by server, seq:" + msg.server_seq);
				console.log("God knows what happened, I have to reload to sync with server");
				if (g_reloadLog) {
					LOG.level = 'report';
					LOG.log("My user id is: " + pe.authenticatedUser.getName());
					LOG.log("Server cannot accept my message, for example, exception occurred");
					LOG.log("Need reload the content, message is:" + dojo.toJson(msg));
					LOG.report();
				}
				this.reload();
				return;
			}
			else if (msg.ctrl_type == "reload")
			{
				// Means there are some reset content messages in transform list while server does OT for this message.
				if (g_reloadLog) {
					LOG.level = 'report';
					LOG.log("My user id is: " + pe.authenticatedUser.getName());
					LOG.log("there are some reset content messages in transform list while server does OT for this message");
					LOG.log("Need reload the content, message is:" + dojo.toJson(msg));
					LOG.report();
				}
				this.reload();
				return;
			}
		}
		else //from another client
		{
			// this is another client's message which is rejected by server, my client will just ignore it
			if (msg.ctrl_type != "reject")
			{
				try {
					if(msg.type == "comments")
					{//message to sync content on sidebar comments pane.
						this.receiveCommentsMessage(msg);
					}
					else
					{
						this.scene.processMessage(msg);
						pe.scene.switchDraftBadge(true);
					}
				}
				catch (e)
				{
					// For other app, LOG.report will return directly
					// So remove it for other app
					if (g_reloadLog) {
						LOG.level = 'report';
						LOG.log("My user id is: " + pe.authenticatedUser.getName());
					}
					// NOW WHAT!!!
					// reload the content from server
					if (typeof e !="string" ) {
						this.forceSync(msg.server_seq);
						if (g_reloadLog)
							LOG.log("I will send a reload msg to server and other clients will be reloaded");
					}
					
					if (g_reloadLog) {
						LOG.log("Message processing error e: " + e);
						LOG.log("Message processing error e.stack: " + e.stack);

						LOG.log("Exception occurs when handling: " + dojo.toJson(msg));
						LOG.report();
					}
					this.reload();
				}
			}
		}    	
		
		// once the message has been proceeded successfully, the local message's sequence can be updated
		// because local message will also be transformed
		// THIS IS VERY IMPORTANT, ELSE THIS MESSAGE WILL BE TRANSFORMED TWICE
		this._updateSeqInMsg(this.waitingList, this.getCurrentSeq());
		this._updateSeqInMsg(this.sendoutList, this.getCurrentSeq());
		
//		var tend = new Date();
//		console.log("Session.processMessage: " + (tend.getTime() - tstart.getTime()));
//		setTimeout(dojo.hitch(this, this.recordTime), 0);
    },
    
//    recordTime: function() {
//    	var tend = new Date();
//    	console.info("Timeout in Session.processMessage: " + (tend.getTime() - this._recordStart.getTime()));
//    },
    
    forceSync: function(data) {
    	var msg = this.createMessage(true);
        msg.type = 'reload';
        msg.data = data;
    	this.sendMessage(msg);
    },
    
	syncState: function(s, e) {
		this.scene.syncStarted();
		// because we'll use sync mode
		console.log("sync state from ", s, " to ", e);
		if (s == 0)
			s = this.getCurrentSeq() + 1;
		var resp = this.getState(s, e);
		if (resp == null)
		{
			this.scene.syncFailed();
			return false;
		}
		else {
			var list = resp.msgList;
			// now process each message
			for (var i = 0; i < list.length; i++)
			{
				try {
					this.processMessage(list[i]);
				} catch (e) {
					for( var i in e){
						console.info( i +": " +e[i]);
					}
					console.log("message processing error: ", e);
				}
			}
		}
		this.scene.syncFinished();
		return true;
	},
	
	registerCommentsProxy: function(proxy) {
		this.commentsProxy = proxy;
	},
	
	receiveCommentsMessage: function(msg) {
		if (msg.client_id != this.clientId)
		{
			if (this.commentsProxy)
			{
				this.commentsProxy.msgReceived(msg);
			}
		}
	},
	
	registerTaskService: function(taskService) {
		this.taskService = taskService;
	},
	
	receiveActivityMessage: function(msg) {
		this.taskService.updateActLink(msg.activityId, msg.activityName);
	},
	
	forceRestoreClientDraft: function() {
		this._reconnected({reconnect_action: "restore"});
	}
	
//	sendPublishNotifyMessage: function(){
//		var msg = this.createMessage(true);
//        msg.type = 'publishNotify';
//        msg.client_id = this.getClientId();
//        msg.data = this.bean.getMetadata();
//        this.sendMessage(msg);
//	}
});
