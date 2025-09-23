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

dojo.provide("concord.scenes.SheetDocSceneMobile");

dojo.registerModulePath("websheet", "../wseditor/js");

dojo.declare("concord.scenes.SheetDocSceneMobile" , [concord.scenes.SheetDocScene], {
	
});
//
//dojo.declare("concord.scenes.SheetDocSceneMobile", [concord.scenes.AbstractScene,concord.widgets.CommentsEventListener], {
//	chartProxy : null,
//	connector: null,
//	
//	constructor:function(app, sceneInfo){
//		this.app = app;
//        this.sceneInfo = sceneInfo;
//        this.bean = null;
//        this.isEditable = false;
//        this.docType = "sheet";
//        this.coedit = false;
//        this.leaveData = null;
//        // one copy of the participant list to keep the information of user who lefts
//        this.participantList = null;
//        this.locale = g_locale;
//        var sheetLocale = dojo.cookie("sheetLocale");
//        this.setLocale(sheetLocale);
//        
//		this.connector = new websheet.ConnectorBase();
//		websheet.Constant.init();
////		this.chartProxy = new concord.chart.controller.ChartProxy();
//	},
//	
//	begin: function(oldScene){
//		this.authUser = this.app.authenticatedUser;
//        
//        if (this.authUser == null) {// may never come to this statement
//            console.info("null user");
//        }
//        else {
//        	this.session = new concord.net.Session(this, this.sceneInfo.repository, this.sceneInfo.uri);
//            this.show();
//            this.editors = new concord.beans.EditorStore(null, null, null);	
//        }
//	},
//	
//    end: function(newScene){
//    },
//    
//	show: function() {
//		this.render();
//	},
//	
//	render: function(){
//		this.stage();
//	},
//	
//	staged: function(success, response)
//	{
//		this.inherited(arguments);
//		
//  		if (success)
//  		{
//			var criteria = this.getUpdatedCriteria(true);
//			
//			this.join(criteria);
//  		}
//	},
//	
//	getUpdatedCriteria: function(bFirst)
//	{
//		try
//		{
//			var criteria;
//			var wpConst = websheet.Constant.PartialLevel;
//			
//			switch (window.g_partialLevel)
//			{
//			case wpConst.ALL:
//				criteria = null;
//				break;
//			case wpConst.SHEET:
//				criteria = { "sheet": /* get the first sheet */ "first" };
//				break;
//			default:
//				// row
//				criteria = { "sheet": /* get the first sheet */ "first" };
//				if (window.g_partialRowCnt > 0) {
//					criteria["startrow"] = 1;
//					criteria["endrow"] = window.g_partialRowCnt;
//				}
//				break;
//			}
//			
//			if (criteria) {
//				if (bFirst) {
//					if (g_lastSheet) {
//						criteria.name = g_lastSheet;
//					}
//					// else do nothing
//				} else {
//					// not first time load, set to current sheet
//					criteria.name = websheet.event.DocumentAgent.getCurrentSheetName();
//				}
//			}
//			return criteria;
//		}
//		catch (e)
//		{
//			console.error("can't get updated criteria, ", e);
//			return null;
//		}
//	},
//	
//	/**
//	 * abstract callback method, called when the document content is loaded/reloaded from server
//	 * implementation should load the state to editor in this method
//	 * ATTENTION: don't forget to clean all undo stack
//	 */
//	loadState: function(state) {
//		var criteria = {sheet:state.content.meta.loadedSheet};
//		//TODO: load in native
//		//pe.base.loadDocument(this.bean.getUri(), state.content, criteria, true);//bJoin = true
//	},
//	
//	//TODO: jinjing
//	 beforeLeave: function() {
////    	pe.base.leaveSession();
////    	pe.taskMan.sync(pe.taskMan.Priority.PublishMessage);
//    },
//	
//  //do not show any staging and loading box on mobile.
//	staging: function()
//	{
//		return;
//	},
//    
//	/**
//	 * abstract method, generate a restore data message
//	 * this method will be called when the client find out the server is in old state
//	 * (e.g, server crashed and restarted), client contains the latest content
//	 * 1. client will reload from server first, after reload successfully
//	 * 2. use this message to call restoreState method to restore local client
//	 * 3. then send out this restore (resetContent) message to other client
//	 * @return	a restore data message, null to ignore it
//	 */
//	generateRestoreMsg: function() {
//		// TODO to implement a "real" restore message for server
//		
//		// we don't know how to "restore" client document state to server,
//		// so nothing to do here, we just accept server document JSON data and reset the state to server seq
//		// this is the same logic as reconnect-reload.
//		console.log("generateRestoreMsg is called but nothing to generate for spreadsheet.");
//	},
//	
//	/**
//	 * abstract method, recover state from client to server
//	 * this method will be called when there are data lost happening in server
//	 * (e.g, server crashed and restarted)
//	 * implementation need to create & send a "resetContent" message to override what's in the server
//	 * @param	msg
//	 *			the message or message list generated by "generateRestoreMsg" method
//	 *			editor need to use this message to recover the state
//	 */
//	restoreState: function(msg) {
//		// TODO spreadsheet not supported yet
//	},
//	
//	join: function(criteria) {
//		this.session.join(criteria);
//	},
//	
//	partialLoad: function(callback, criteria) {
//		this.session.getPartial(callback, criteria);
//	},
//	
//	getPartial:function(criteria){
//		var tm = this.editor.getTaskMan();
//		tm.sync(tm.Priority.PublishMessage);
//		//TODO:
//		this.partialLoad(null, criteria);
//	},
//	
//	reload: function(){
//    	window.location.reload();
//    },
//    
//    syncState: function(s, e){
//        // because we'll use sync mode
//        if (s == 0) 
//            s = this.session.getCurrentSeq() + 1;
//        var resp = this.session.getState(s, e);
//        if (resp == null) {
//            return null;
//        }
//        else {
//            return resp.msgList;
//        }
//    },
//	
//	getURI: function() {
//		if (!this.url) {
//			this.url = concord.util.uri.getDocServiceRoot() + "/" + this.sceneInfo.repository + "/" + this.sceneInfo.uri;
//			if (!this.isViewMode(true)) this.url += "/edit"; 
//			else
//				this.url += "/edit"; //FIXME
//		}
//		
//		return this.url;
//	},
//	
//    showFileFormatNotMatchDialog: function( params )
//	{
//		concord.util.mobileUtil.fileFormatNotMatchParams = params;
//		// we post event and pop up dialog from the native code
//		var events = [];
//		events.push({"name":"fileFormatNotMatch"});
//		concord.util.mobileUtil.jsObjCBridge.postEvents(events);
//	},
//    
//	applySidebarSettings: function()
//	{ 
//		//TODO: need to overwrite
//	},
//	
//	userJoined: function(user) {
//		
//	},
//	
//	userLeft: function(user) {
//
//	},
//	
//	_showMessage : function(text, interval, type) {
//	
//	},
//	
//	_showLockBox: function(errorCode) {
//		if (errorCode == 1002) // no permission
//		{
//			concord.util.mobileUtil.postError(errorCode);
//		}else{ // network issue
//			//if(!this.bNetworkIssue){
//				this.bNetworkIssue = true;
//				concord.util.mobileUtil.networkIssue();				
//			//}
//		}
//	},
//	
//	_hideLockBox: function() {
//		this.bNetworkIssue = false;
//	},
//	
//	_showKickOutBox: function() {
//		if (this._kickOutBox)
//		{
//			return;
//		}
//		dojo.requireLocalization("concord.scenes", "ErrorScene");
//		var msgNls = dojo.i18n.getLocalization("concord.scenes", "ErrorScene");
//		concord.util.mobileUtil.postError(-1,"",msgNls.kickout_user_content);
//	},
//	
//	showBigFileErrorMsg: function(){
//		concord.util.mobileUtil.showMessage(this.nls.bigFileErrMsg);
//	},
//	
//	_showOfflineDialog: function() {
//		this.bOffline = true;
//		concord.util.mobileUtil.networkIssue();
//	},
//	
//	showVersionPublishedMessage: function() {
//
//	},
//	
//	showVersionPublishedFailedMessage: function(msg){
//		concord.util.mobileUtil.showPublishFailedDialog(msg);
//	},
//	
//	showLocalVersionPublishedMessage: function(userName) {
//
//	},
//	
//	// MOBILE: disable welcome and unsupported dialogs in docs mobile editor
//	showWelcomeOrUnsupportDialog: function()
//	{
//		// do nothing.
//	},
//	
//	_showLoadingBox: function()
//	{
//		return;
//	},
//	_hideLoadingBox: function()
//	{
//		return;
//	},
//	
//	getClientId: function(userId) {
//		var client_id = null;
//		var pList = this.participantList;
//        for (var i = 0; i < pList.length; i++)
//        	if (userId == pList[i].getUserBean().getId()) {
//        		client_id = pList[i].getClientId();
//        		break;
//        	}
//        
//        return client_id;
//	},
//	
//	getUserId: function(clientId) {
//		var id = null;
//		var pList = this.participantList;
//        for (var i = 0; i < pList.length; i++)
//        	if (clientId == pList[i].getClientId()) {
//        		id = pList[i].getUserBean().getId();
//        		break;
//        	}
//        
//        return id;
//	},
//	
//	setLeaveData:function(data)
//    {
//	    this.leaveData = data;
//    },
//    
//    getLeaveData: function()
//    {
//        return this.leaveData;
//    },
//    
//    getLocale: function () {
//		return this.locale;
//	},
//	
//	setLocale: function (locale) {
//		if(locale){
//			this.locale = locale;
//			dojo.cookie("sheetLocale", locale, { path: '/' });
//		}
//		else
//			locale = this.locale;
//		dojo["requireLocalization"]("dojo.cldr",'gregorian', locale);
//		dojo["requireLocalization"]("dojo.cldr",'number', locale);
//		dojo["requireLocalization"]("dojo.cldr",'currency', locale);
//		dojo["requireLocalization"]("websheet.i18n",'Number', locale);
//		dojo["requireLocalization"]("concord.editor", 'PopularFonts', locale);
//	},
//    // pending session from receiving messages
//    checkPending: function() {
//    	//TODO: mobile
////    	var _pe = pe;
////    	var dc = _pe.base._data;
////    	if (!dc) {
////    		return false;
////    	}
////    	var doc = dc._documentObj;
////    	if (!doc) {
////    		return false;
////    	}
////    	
////    	if (doc.isLoading || doc.getPartialLoading()) {
////    		// if document is in loading, let the messages in
////    		return false;
////    	} else {
////    		// block if any important heavy task in running
////    		return _pe.taskMan.isRunning(_pe.taskMan.Priority.Trivial);
////    	}
//    },
//	
//	 processMessage: function(msg) {
//		 websheet.event.DocumentAgent.processMessage(msg);
//	}
//});