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
dojo.provide("websheet.ConnectorBase");

dojo.require("websheet.Constant");
dojo.require("websheet.Helper");
dojo.require("websheet.RangeDataHelper");

dojo.declare('websheet.ConnectorBase', null, {
	Event: websheet.Constant.Event,
	//Add for resolve rejected OT msg, need to be removed by co-editing undo/redo mechanism
    sendOutList:null,
    //when do partial loading, the message should be pending
    _paritalPendingList:[],
    
    constructor: function(args){
        dojo.mixin(this, args);
    },
    
    // flag to indicate Connector is in ASYNC state
    _onSetStoreListener: function(){
    },
    getSendOutList:function(){
    	if (this.solist == null || this.solist.length == 0) {
    		if(!this.sendOutList)
    			this.sendOutList = new Array();
    		return this.sendOutList;
    	} else {
    		// if temporary snapshot sendout list is set, return the snapshot instead
    		return this.solist;
    	}
    },
    setSendOutList:function(arg){
    		this.sendOutList = arg;
    },
    
  //1)if server seq is given, then process and remove all the message not greater than server seq
    //this will be called before apply the partial document
    //2) if not given, process all the message in pending message list, and remove them all
    processPendingMessage:function(serverSeq){
    	try{
	    	if(serverSeq != undefined)
	    	{
	    		if(serverSeq <= -1)
	    			return;
	    		var curSeq = this.editor.scene.session.getCurrentSeq();
	    		var i;
	    		for(i=0; i<this._paritalPendingList.length; i++)
				{
					var msg = this._paritalPendingList[i];
					curSeq = msg.server_seq;
					if(curSeq <= serverSeq)
						this.processMessage(msg);
					else
						break;
				}
	    		this._paritalPendingList.splice(0, i);
	    		if(curSeq < serverSeq){
	    			// if after processing all pending messages, serverSeq still behind the sequence claimed
	    			// in partial messages, syncState() to poll all messages from server
	    			this.editor.scene.session.syncState(curSeq+1, serverSeq);
	    		}
	    	}else
	    	{
		    	//process it when partial loading has been done
				for(var i=0; i<this._paritalPendingList.length; i++)
				{
					var msg = this._paritalPendingList[i];
					this.processMessage(msg);
				}
				this._paritalPendingList = [];
	    	}
    	}catch(e)
    	{
    		console.error(e);
    		console.log("process pending message error when partial loading");
    	}
    },
    
    pushPendingMessage:function(message){
    	
    	this.updateSendoutList();
    	var solist = this.getSendOutList();
    	var xflist = this.getTransformList();

    	if ((solist != null && solist.length > 0) && (xflist != null && xflist.length > 0)) {
    		// when this message is to push to pending list, but transform list and sendout list is not empty,
    		// means the message is meant to be OT with the transform list or the sendout list,
    		// but the message is to pend to execute in the future. at that time these 2 list may be different,
    		// so leave a snapshot to the message object, later when it is processed, OT with the snapshot list
    		message["solist"] = [].concat(solist);
    		message["xflist"] = [].concat(xflist);
    	}
    	
    	this._paritalPendingList.push(message);
    },
    
    /////////////////////////////////////////////////////////////////////
    ///////////// RECEIVE MESSAGE AND TRANSFORM /////////////////////////
    /////////////////////////////////////////////////////////////////////
    /*abstract method */
    //TODO: jinjing
    processMessageUpdates: function(events, userId, index)
    {   
    	throw new Error("not implemented");
    },
    
    /* process a single message
     * abstract method
     **/
    //TODO: jinjing
    processMessage: function(msg) 
    {
    	throw new Error("not implemented");
    },
    
    updateSendoutList: function()
    {
    	var sess = this.editor.scene.session;
		var length =  sess.sendoutList.length+sess.waitingList.length;
		var rLength = this.getSendOutList().length;
		if(rLength>length){
			for(rLength;rLength>length;rLength--){
				this.getSendOutList().shift();
			}
		}
    },

    //clear either ignored or conflict message from local sendout list and waiting list
    clearConflictMsg: function()
    {
    	var sess = this.editor.scene.session;
		var sendoutListLength = sess.sendoutList.length;
		for(var i = this.sendOutList.length - 1; i >= 0; i--)
		{
			if(this.sendOutList[i].isConflict)
			{
				if(i >= sendoutListLength) 
				{
					sess.waitingList.splice(i-sendoutListLength,1);
				}
				else
				{
					sess.sendoutList.splice(i,1);
				}
				this.sendOutList.splice(i,1);
			}
		}
    },
    
    /* 
     * process received message
     * this function is used for process received message,
     * including server/client sequence detect and sequence gap fill
     * it will invoke processMessage() for handling single message
     */
    processReceiveMessage:function(msg)	{
    },
    
    getTransformList:function() {
		var sess = this.editor.scene.session;
		var baseList = [];
		var prior;
		for (var i=0;i<sess.sendoutList.length;i++)
		{
			prior = sess.sendoutList[i];
			baseList.push(prior);
		}
		for (var i=0;i<sess.waitingList.length;i++)
		{
			prior = sess.waitingList[i];
			baseList.push(prior);
		}
	
		var usedIds = [];
		
		for(var i = 0 ; i < baseList.length; i ++)
		{
			var msg = baseList[i];
			// replace compacted data with full data.
			if(msg._cid && this._compactedFullData && this._compactedFullData[msg._cid])
			{
				usedIds.push(msg._cid);
				baseList[i] = this._compactedFullData[msg._cid];
			}
		}
		
		if(this._compactedFullData)
		{
			if(usedIds.length == 0)
				this._compactedFullData = [];
			else
			{
				// remove not used full data data.
				for(var x in this._compactedFullData)
				{
					if(dojo.indexOf(usedIds, x) < 0)
					{
						delete this._compactedFullData[x];
					}
				}
			}
		}
		
		return baseList;
    },

    // return true if the event isn't cursor, lock and release event
    isOperationMsg : function(event) {
    	var ret = true;
    	if ((event.action == this.Event.CURSOR) ||(event.action == this.Event.LOCK) ||(event.action == this.Event.RELEASE))
    		ret = false;

    	return ret;
    },
    
    //////////////////////////////////////////////////////////////
    ///////// PUBLISH MESSAGE ////////////////////////////////////
    //////////////////////////////////////////////////////////////

    /*
     * indicator is not a content change message, but a control message
     */
    isIndicatorMsg: function(msg)
    {
    	// for the lock release msg, only contian 1 update
    	if(msg.updates.length != 1) return false;
    	var action = msg.updates[0].action;
    	if(action == "lock" ||action == "release")
    	 {
    	 	return true;
    	 }
    	return false;
    },
    
    /** 
     * send the resolve_conflict message to server
     */
    conflictResolved: function(){
        var sess = this.editor.scene.session;
        var msg = sess.createMessage();
        msg.resolve_conflict = "true";
        msg.combined = false;

        sess.sendMessage(msg);
    },
    
    /** 
     * send XHR message to server
     */
    publish: function(msgObj, id, type, attrs) {
		if (this.editor.scene.isDocViewMode()) {
			// Don't send any local message in view mode.
			// TODO how to notify user that the local message isn't sent
			return;
		}
    	
    	var sess = this.editor.scene.session;    	
    	var msg = sess.createMessage(this.isIndicatorMsg(msgObj));
    	msg.updates = msgObj.updates;
    	for (var attr in attrs) {
    		msg[attr] = attrs[attr];
    	}
    	
    	var compactedMsg = this.compact(msg);
    	if(compactedMsg != msg)
    	{
    		var _cid = new Date().valueOf();
    		compactedMsg._cid = _cid;
    		if(!this._compactedFullData)
    			this._compactedFullData = {};
    		
    		// store original full value msg here for OT.
    		this._compactedFullData[_cid] = msg;
    		
    		if(!this._clearCompactedDataMapInterval)
    			// every 3 mins to delete unused compact data - full data map to reduce memory.
    			this._clearCompactedDataMapInterval = setInterval(dojo.hitch(this, "getTransformList"), 3 * 60 * 1000);
    	}
    	
		sess.sendMessage(compactedMsg);
		
   		var data = {};
   		if(id){
   			data.id = id;
   			if(type)
   				data.type = type;
   		} else
   			data = msgObj;
   		
   		if(this.getSendOutList().length==10) // websheet.Constant.MaxStored
   			this.getSendOutList().shift();	
   		if(!this.isIndicatorMsg(msgObj))
   			this.getSendOutList().push(data);		
   	},
   	
   	decompact: function(msg, callback)
   	{
   		if(msg.updates)
   		{
   			var updates = [];
   			var changed = false;
   			var datas = [];
   			dojo.forEach(msg.updates, function(update, index)
   			{	
   				var data = update.data;
   				var added = false;
   				if(data && data.extras)
   				{
   					if(update.action == websheet.Constant.Event.ACTION_SET && update.reference && update.reference.refType == "unnamerange")
   					{
   						datas.push(data);
   					}
   				}
   			});
   			
   			if(datas.length > 0)
   			{
   				this._decompatWaiting = datas.length;
   		   		var cb = dojo.hitch(this, function()
   		   		{
   		   			this._decompatWaiting --;
   		   			if(this._decompatWaiting == 0)
   		   			{
   		   				if(callback)
   		   					callback();
   		   			}
   		   		});
	   			dojo.forEach(datas, function(data){
	   				var extras = data.extras;
	   				delete data.extras;
	   				websheet.RangeDataHelper.transformData(data, extras, !data.bCutPaste, cb);
	   			});
   			}
   			else if(callback)
   				callback();
   		}
   		else if(callback)
			callback();
   	},
   	
	compact: function(msg)
   	{
   		if(msg.updates)
   		{
   			var updates = [];
   			var changed = false;
   			dojo.forEach(msg.updates, function(update, index)
   			{	
   				var data = update.data;
   				var added = false;
   				if(data && data.compactData && data.compactData.extras)
   				{
   					if(update.action == websheet.Constant.Event.ACTION_SET && update.reference && update.reference.refType == "unnamerange")
   					{
   						var newUpdate = websheet.Helper.cloneJSON(update);
   						var data = newUpdate.data;
   						if(data.rows)
   							data.rows = data.compactData.rows;
   						if(data.columns)
   							data.columns = data.compactData.columns;
   						data.extras = data.compactData.extras;
   						updates.push(newUpdate);
   						
   						added = true;
   						changed = true;
   					}
   				}
   				if(data)
   				{
   					delete data.compactData;
   				}
   				if(!added)
   					updates.push(update);
   			});
   			if(changed)
   			{
   				msg = websheet.Helper.cloneJSON(msg);
   				msg.updates = updates;
   			}
   		}
   		return msg;
   	}
});
