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

dojo.provide("concord.scenes.AbstractScene");
dojo.require("concord.scenes.mHeader");
dojo.require("concord.scenes.ErrorScene");
//dojo.require("concord.net.Session");
dojo.require("concord.widgets.ProgressBox");
dojo.require("concord.widgets.ConfirmBox");
dojo.require("concord.widgets.LockBox");
dojo.require("concord.widgets.LoadingBox");
dojo.require("concord.widgets.OfflineBox");
dojo.require("concord.widgets.LotusTextButton");
dojo.require("concord.widgets.HtmlViewerLoadingPage");
dojo.require("concord.widgets.MessageBox");
dojo.require("concord.widgets.ModelDialog");
dojo.require("concord.feature.FeatureController");
dojo.require("concord.beans.WebClipboard");
dojo.require("concord.util.BidiUtils");
//dojo.require("concord.beans.EditorStore");
//dojo.require("concord.spellcheck.SpellCheckDlg");
//dojo.require("concord.spellcheck.SpellCheckDlgHandler");
//dojo.require("concord.widgets.spreadsheetTemplates.Dialog");
dojo.require("concord.widgets.FileDeepDetectDialog");
dojo.require("dojox.html.metrics");
dojo.require("dojo.i18n");
dojo.require("dojo.string");
dojo.require("concord.util.strings");
dojo.require("concord.util.uri");
dojo.require("dojo.cookie");
//dojo.require("concord.widgets.EncryptPwdValidatorDlg");
//dojo.require("concord.beans.RecentFiles");
dojo.require("concord.util.browser");
dojo.require("concord.widgets.social.conditionRenderer");
dojo.require("concord.widgets.EndSessionDlg");
dojo.require("concord.widgets.SuccessReviewDialog");
dojo.require("concord.widgets.SaveAsDialog");
dojo.require("concord.widgets.LoginDialog");
dojo.require("concord.widgets.unsupportDlg");
dojo.require("concord.util.conditional");
if ( concord.util.browser.isMobile())
{
	dojo.require("concord.util.mobileUtil");
}

dojo.declare("concord.scenes.AbstractScene", null, {

	session: null,
	bean: null,
	webClipboard: null,
	sidebar: null,
	editors: null,
	deepDetectKey: null,
	nls:null,
	stagingDlg:null,
	encryptedPwdDlg:null,
	exportPDFDialog:null,
	spellCheckDialog:null,
	preferencesDailog:null,
	participantChangeListener:null,
	rev: null,
	contentType: "draft", // "revision" means get contents from revision folder, "draft" means draft folder
	CONTENT_TYPE_DRAFT: "draft",
	CONTENT_TYPE_REVISION: "revision",	
	bSaved: true,
	bCommandIgnored: false,
	fileDetailWin: null,
	//HTML Viewer
	isDocsEnabled: false,
	docsURI: null,
	isDocsSupportType: false,
	isDocsEditor: false,
	bg: null,
	outofdate: false,
	myHeader: null,
	ccmFrameId: "CCM_WIDGETS_IFRAME",
	compactMode: false,
	// mark the encrypted document
	encryptedDocument: false,
	
	constructor: function(app, sceneInfo) {
		this.app = app;
		this.sceneInfo = sceneInfo;
		this.stagingState = false;
		this.observerMode = this.sceneInfo.mode==ViewMode.OBSERVER;
        this.viewDraftMode = this.sceneInfo.mode==ViewMode.VIEWDRAFT;
        this.htmlViewMode = this.sceneInfo.mode==ViewMode.HTMLVIEW;
        this.compactEditMode = this.sceneInfo.editMode==ViewMode.COMPACTEDIT;
        this.lightEditMode = this.sceneInfo.editMode==ViewMode.LIGHTEDIT; 
        if(this.htmlViewMode)
        {
        	this.isDocsEnabled = sceneInfo.isDocsEnabled;
    		this.docsURI = sceneInfo.docsURI;
    		this.isDocsSupportType = sceneInfo.isDocsSupportType;
    		this.isDocsEditor = sceneInfo.isDocsEditor;
    		this.bg = new concord.widgets.HtmlViewerLoadingPage();
    		this.compactMode = DOC_SCENE.compactMode;
    		if(this.compactMode) {
    			this.DEFAULT_STYLE = 'compact';
    			dojo.removeClass(this.bg.node,"viewerLoadingUnderlay");
    			dojo.addClass(this.bg.node,"viewerCompactLoadingUnderlay");
    		}
        }
        this.deepDetectKey = "edit_deepdetect_" + encodeURIComponent(sceneInfo.uri);
        this._clearObsoleteCookies();
	},
	
	_loadNls: function() {
		if (!this.nls)
		{
			dojo.requireLocalization("concord.scenes","Scene");
			this.nls = dojo.i18n.getLocalization("concord.scenes","Scene");
		}
		return this.nls;
	},
	
	_clearObsoleteCookies: function() {
		var key = this.sceneInfo.repository + "_" + this.sceneInfo.uri + "_revision";
		dojo.cookie(key, null, {expires: -1});
	},
	
	/**
	 * called if client cannot synchronize with server
	 * make the client offline
	 */
	offline: function(reasonMsg) {
		this._hideLoadingBox();
		this._hideLockBox();

		var msg = this.nls.offline;
		pe.scene.showErrorMessage(msg);
		
		if(this.session)
			this.session.stop();
		
		this._showOfflineDialog(reasonMsg);
		
		// put editor in read only mode
		this.readonly(true);
		
		// unregister myself from cookie, so user can open this document in another tab
		this.app.unregisterOpenDocs();
	},
	
	_showOfflineDialog:function(reasonMsg){
		//for HTML viewer
		if(pe.scene.isHTMLViewMode())
			return;
		this._loadNls();
		if (!reasonMsg)
			reasonMsg = this.nls.offlineReasonMsg;
		var dlgMsg = reasonMsg + "\n" + this.nls.reloadExplanationMsg;
		var reload = function(){
			window.location.reload();
		};
		var offDlg = new concord.widgets.OfflineBox( null, null, this.nls.reloadBtnLabel, false, {message:dlgMsg, callback:reload, imageclass:"yourProductSprite yourProductSprite-msgError48"} );
		offDlg.show();
	},
	/**
	 * called when there are network issue, cannot connect to server
	 * this method will display a locking dialog, then call scene implementation
	 * to put editor in read only mode
	 */
	lock: function(errorCode) {
		//for html
		if(pe.scene.isHTMLViewMode())
			return;
		this._hideLoadingBox();
		this._showLockBox(errorCode);
  		// call abstract method to put editor in read only mode
  		this.readonly(true);
	},
	
	/**
	 * called when the network is back
	 * this will hide the locking dialog, then call scene implementation
	 * to put editor back to edit mode
	 */
	unlock: function() {
		if(pe.scene.isHTMLViewMode())
			return;
		this._hideLoadingBox();
		this._hideLockBox();
		this.readonly(false);
	},
	
	/**
	 * Called when the session is kicked out, display the kicked out dialog and put editor in read only mode.
	 */
	makeKickedOut: function() {
		this._showKickOutBox();
		this.readonly(true);
	},
		
	/**
	 * Show the warning message to user who is editing the file, the warning message talks which users want 
	 * to join the editing session, but cannot join this session because of no entitlement for co-editing.
	 * 
	 * @param errorCode presents the code of error that why the users cannot join the session
	 * @param users presents the users who cannot join the session
	 */
	showUserCannotJoinMsg: function(errorCode, users) {
		var number = 0;
		var array = new Array();
		var length = users != null ? users.length : 0;
		for (var index = 0; index < length; index++) {
			var name = users[index];
			if (name != null && name != "") {
				array[number++] = name;
			}
		}
		var usersStr = array.join(", ");
		if (length > 0 && usersStr != null && usersStr != "") {
			var message = "";
			if (errorCode == 3102) {
				message = dojo.string.substitute(this.nls.joinwithoutentitle, [usersStr]);
			} else {
				message = dojo.string.substitute(this.nls.joinwithoutentitle2, [usersStr]);
			}
			this.showWarningMessage(message, 15000);
		}
	},
	
	/**
	 * called when start loading document from server
	 */
	loading: function() {
		if (this.session && this.session.isLoadedBefore())
		{
			this._hideLockBox();
			this._showLoadingBox();
	  		// call abstract method to put editor in read only mode
	  		this.readonly(true);
		}
	},
	
	/**
	 * called when document has been loaded from server
	 * this method will call editor to load document, then hide the loading box
	 */
	loaded: function(state) {
		var bean = this.getDocBean();
		if (bean)
		{
			// update document title
			var title = bean.getTitle();
			if (title)
			{				             
				this.myHeader.applyOptimizedDocTitle(title);
			}
			document.title = bean.getTitle();
			DOC_SCENE.title = document.title; 
			this.bean = bean;
		}
		
		// call editor to load document state
		this.loadState(state);
		this.myHeader.subscribeHeaderResizeEvent();
		dojo.publish(concord.util.events.doc_data_reload, [true]);
		
		if (this.session && this.session.isLoadedBefore())
		{
			this._hideLockBox();
			this._hideLoadingBox();
			this.readonly(false);
		}
		
		// Disable the menu item "Share..." if the document is not sharable.
		if (this.session && pe.shareWithMenuItem && !this.session.bean.getIsSharable())
		{
	        if(this.session.bean && !this.session.bean.getIsCommunityFile())
	          pe.shareWithMenuItem.setDisabled(true);
		}

		if ( concord.util.browser.isMobile())
		{
			this.initParticipantChangeListener();
		}
		concord.util.dialogs.createTemplateFrame();
		
		if(concord.util.uri.isCCMDocument())
		{
			if(this.isNeedRenderSFR())
			{
				setTimeout( dojo.hitch(this, pe.scene.initReviewMenu), 100 );
			}
			else
			{
				setTimeout( dojo.hitch(this, this.initCCMWidgets), 100 );				
			}											
		}
		else
		{
			if(pe.reviewMenuItem)
			{
				pe.reviewMenuItem.domNode.style.display = 'none';
			}
			
		}		
//		this._switchSceneMode();
	},
	
	initParticipantChangeListener : function()
	{
		try
		{
			var editorStore = this.getEditorStore();
			this.participantChangeListener = {
					activeId: null,
					initActiveIds: function ()
					{
						if(! this.activeId )
						{
							this.activeId = { };
							this.activeId[ pe.authenticatedUser.getId()] = "";
						}
					},
					editorAdded: function (editor)
					{
						this.initActiveIds();
						this.activeId[editor.getEditorId()] = "";
						this.editorsUpdated();
					},
					editorRemoved: function (editorId)
					{
						this.initActiveIds();
						delete this.activeId[editorId];
						this.editorsUpdated();
					},
					getAttributeValue: function( val )
					{
						if( typeof(val) == "object" )
						{
							if( val.length )
							{
								return val[0];
							}
							else
							{
								return "";
							}
						}
						else
							return val;
					},
					generateEditorObj: function(item)
					{
						var editor = {};
						editor.userId = this.getAttributeValue( item.getEditorId() );
						editor.color = this.getAttributeValue(item.getEditorColor());
						editor.displayName = this.getAttributeValue(item.getName());
						editor.orgId = this.getAttributeValue(item.getOrgId());
						return editor;
					},
					
					editorsUpdated: function()
					{
						try
						{
							if( editorStore.getCount() == 0 && !g_mobileOfflineMode)
							{
								editorStore.refresh(true);
								setTimeout( dojo.hitch(this, this.editorsUpdated), 100 );
								return;
							}
							
							this.initActiveIds();
							var onlineeditors = [];
							var offlineeditors = [];
							for(var i=0;i< editorStore.editorContainer.items.length;i++  )
							{
								var item = editorStore.editorContainer.items[i];
								if(this.activeId[item.getEditorId()] != undefined)
								{
									onlineeditors.push( this.generateEditorObj(item) );
								}
								else
								{
									offlineeditors.push( this.generateEditorObj(item) );
								}
							}
							

							var params = [pe.authenticatedUser.getId(),  this.activeId,  onlineeditors.concat( offlineeditors)];
							var events = [{"name":"editorsStateChanged", "params":params}];
							concord.util.mobileUtil.jsObjCBridge.postEvents(events);
						}
						catch(err)
						{
							//alert("err1" + err.message);
						}
					}
				} ;
			this.participantChangeListener.editorsUpdated();
		}
		catch(err)
		{
			//alert("err2" + err.message);
		}
	},
	
	getUpdatedCriteria: function()
	{
		// when editor crashes and has the need to reload, this function is called to get updated criteria
		// used for loading.
		// if returning null, session will use the same criteria when join(), 
		// or the returned object is used as the new criteria
		return null;
	},
	
	_showLockBox: function(errorCode) {
		if (this._lockBox)
		{
			if (this._lockBox.params != null && errorCode != this._lockBox.params.errorCode)
			{
				this._lockBox.hide();
				this._lockBox = null;
			}
			else
			{
				return;
			}
		}
		
		this._loadNls();
		var msg = this.nls.networkIssueMsg + "\n" + this.nls.lockEditorMsg;
		if (errorCode == 1002)
		{
			msg = this.nls.noPermissionMsg;
			pe.noPermission = true;
		}

  		this._lockBox = new concord.widgets.LockBox( null, null, null, false, {errorCode:errorCode, message:msg, imageclass:"dlg_progress_processing", errorType: "error"} );
  		this._lockBox.show();		
	},
	
	_hideLockBox: function() {
		if (!this._lockBox)
		{
			return;
		}
		
		this._lockBox.hide();
		this._lockBox = null;		
	},
	
	_showLoadingBox: function() {
		if (this._loadingBox)
		{
			return;
		}
		
		this._loadNls();
		var msg = null;
		if(this.getContentType() == this.CONTENT_TYPE_REVISION)
			msg = this.nls.loadingDocumentMsg;
		else
			msg = this.nls.reLoadingDocumentMsg;

  		this._loadingBox = new concord.widgets.LoadingBox( null, null, null, false, {message:msg, imageclass:"dlg_progress_processing"} );
  		this._loadingBox.show();		
	},
	
	_hideLoadingBox: function() {
		if (!this._loadingBox)
		{
			return;
		}
		
		this._loadingBox.hide();
		this._loadingBox = null;		
	},
	
	/**
	 * Called when the session is kicked out, display the kicked out dialog.
	 */
	_showKickOutBox: function() {
		if (this._kickOutBox)
		{
			return;
		}
		
		dojo.requireLocalization("concord.scenes", "ErrorScene");
		var msgNls = dojo.i18n.getLocalization("concord.scenes", "ErrorScene");
		var btnLabel;
		if(concord.util.uri.isCCMDocument())
		{
			btnLabel = msgNls.return_to_library;
			
		}
		else if(concord.util.uri.isECMDocument())
		{
			btnLabel = msgNls.return_to_icn;
		}
		else
		{
			btnLabel = msgNls.return_to_files;
		}
		
		this._kickOutBox = new concord.widgets.LockBox(null, null, null, false, {message:msgNls.kickout_user_content, imageclass:"dlgImageInformation", titleMsg: msgNls.document_already_open,errorType: "info", customizedBtnLabel: btnLabel});
		this._kickOutBox.show();
	},
	
	/**
	 * abstract callback method, called when the document content is loaded/reloaded from server
	 * implementation should load the state to editor in this method
	 * ATTENTION: don't forget to clean all undo stack
	 */
	loadState: function(state) {
		throw new Error("not implemented");
	},
	
	/**
	 * abstract method, generate a restore data message
	 * this method will be called when the client find out the server is in old state
	 * (e.g, server crashed and restarted), client contains the latest content
	 * 1. client will reload from server first, after reload successfully
	 * 2. use this message to call restoreState method to restore local client
	 * 3. then send out this restore (resetContent) message to other client
	 * @return	a restore data message, null to ignore it
	 */
	generateRestoreMsg: function() {
		throw new Error("not implemented");
	},
	
	/**
	 * abstract method, recover state from client to server
	 * this method will be called when there are data lost happening in server
	 * (e.g, server crashed and restarted)
	 * implementation need to create & send a "resetContent" message to override what's in the server
	 * @param	msg
	 *			the message or message list generated by "generateRestoreMsg" method
	 *			editor need to use this message to recover the state
	 */
	restoreState: function(msg) {
		throw new Error("not implemented");
	},
	
	/**
	 * replace current scene with an error page
	 */
	gotoErrorScene: function(statusCode, data) {
		concord.scenes.ErrorScene.renderError(statusCode, data);
	},
	
	/**
	 * abstract method
	 * called when it's necessary to put editor in readonly mode or vise-versa
	 */
	readonly: function(readonly) {
		// do nothing, scene implementation need to do something
	},
	
	reconnecting: function() {
		this._loadNls();
		this.showWarningMessage(this.nls.reconnectingMsg, null);
	},
	
	reconnected: function() {
		this.hideErrorMessage();
	},
	
	getSession: function() {
		return this.session;
	},
	
	getURI: function() {
		if (!this.url) {
			this.url = concord.util.uri.getDocServiceRoot() + "/" + this.sceneInfo.repository + "/" + this.sceneInfo.uri;
			if (!this.isViewMode(true)) this.url += "/edit"; 
			else
				this.url += "/edit"; //FIXME
		}
		
		return this.url;
	},
	
	getEditorStore: function()
	{
		return this.editors;
	},
	
	/**
	 * type = 0, 1, 2 (info, warning, error)
	 */
	_showMessage : function(text, interval, type ,nojaws, key)
	{
		if(this.outofdate) return;//For html viewer,if snapshot is out of date,will not show other messages.
		this.myHeader._showMessage(text, interval, type, nojaws, key);
	},
		
	_doA11yMessage: function(messageDiv, nojaws){
		this.myHeader._doA11yMessage(messageDiv, nojaws);
	},
	/**
	 * @param text , message information
	 * @param interval, time interval
	 * @param forjaws, if it is true, screen readers like jaws is able to read the message
	 */
	showErrorMessage: function(text, interval, nojaws, key) {
		if(key == 'publishFail' && this.showCheckinMenu())
		{// handle publish error in dialog for ccm document
			return;
		}			
		this.myHeader._showMessage0(text, interval, 2, nojaws, key);
	},
	
	showWarningMessage: function(text, interval,nojaws, key) {	
		this.myHeader._showMessage0(text, interval, 1, nojaws, key);
	},
	showInfoMessage: function(text, interval, nojaws, key) {	
		this.myHeader._showMessage0(text, interval, 0, nojaws, key);
	},
	showHtmlviewInfoMessage:function(text, interval, nojaws, key) {	
		this.myHeader._showMessage(text, interval, 3, nojaws, key);
	},
	
	showViewInfoMessage: function(text, interval, nojaws, key){
		this.myHeader._showMessage(text, interval, 4, nojaws, key);
	},
	
	showTextMessage: function(text, interval) {
		this.myHeader.showTextMessage(text, interval);
	},
	showUnsupportedTextMessage: function(array, interval){
		if(array.indexOf("data_pilot") != -1 && array.indexOf("conditional_formatting") != -1)
		{
			this.myHeader._showMessage(this.nls.htmlviewerlimitation3, interval, 3, null, null);
			return;
		}
		if(array.indexOf("conditional_formatting") != -1)
		{
			this.myHeader._showMessage(this.nls.htmlviewerlimitation2, interval, 3, null, null);
			return;
		}
		if(array.indexOf("data_pilot") != -1)
		{
			this.myHeader._showMessage(this.nls.htmlviewerlimitation1, interval, 3, null, null);
		}
	},
	hideTextMessage: function() {
		this.myHeader.hideTextMessage();
	},
	
	disableShareCommentButton: function(disable) {
		this.myHeader.disableShareCommentButton(disable);
	},
	
	showBigFileErrorMsg: function(){
		this.showErrorMessage(this.nls.bigFileErrMsg, g_hbInterval);
	},
	
	showDraftSavedMessage: function() {
		this.myHeader.showSavedMessage();
	},
	
	showDraftNothingSavedMessage: function() {
		this.myHeader.showSavedMessage();
	},
	
	showVersionPublishedMessage: function(overwrite)
	{
		if (concord.util.browser.isMobile()) {
			concord.util.mobileUtil.versionPublished();
		}

		this.showLocalVersionPublishedMessage(pe.authenticatedUser.getName(), overwrite);
	},
	// Desktop will do nothing
	// Mobile will show the message
	showVersionPublishedFailedMessage: function(message)
	{
		if (concord.util.browser.isMobile()) {
			concord.util.mobileUtil.showPublishFailedDialog(message);
		}
	},
	
	handlePublishFailResultInDlg: function(msg, overwrite) {
		if(overwrite && this.showCheckinMenu())
		{
			this.showSaveCCMErrorMsg();
		}
		else if(pe.scene.publishDlg)
		{
			pe.scene.publishDlg.handleResult(msg, false);
		}
	},
	
	showLocalVersionPublishedMessage: function(userName, overwrite) {
		if(overwrite)
		{
			// do nothing when saved to CCM success
		}
		else
		{
			if (BidiUtils.isBidiOn())
                userName = BidiUtils.addEmbeddingUCC(userName);  
			var theMsg = concord.util.uri.isLCFilesDocument() ? this.nls.versionpublished: this.nls.versionpublished2;
			var msg = dojo.string.substitute(theMsg, [userName, concord.util.date.getTime()]);;
			this.showInfoMessage(msg, 5000, false, 'published');
			if(pe.scene.publishDlg)
			{
				var checkinMsg = concord.util.uri.isExternalCMIS() ? dojo.string.substitute(this.nls.chekinCloseDocsMsg, { 'productName' : concord.util.strings.getProdName() }) : msg;
				pe.scene.publishDlg.handleResult(checkinMsg, true);
			}
		}
		this.switchDraftBadge(false);
	},
	
	showRemoteVersionPublishedMessage: function(userName) {
		this.showLocalVersionPublishedMessage(userName);
		if(this.showCheckinMenu())
		{
			this.showEndSessionDialog(userName);
		}		
	},
	
	showEndSessionDialog: function(userName)
	{
		if (BidiUtils.isBidiOn())
            userName = BidiUtils.addEmbeddingUCC(userName);
		var notice = dojo.string.substitute(this.nls.endSessionDlgNotice,[userName]);

		if(!pe.scene.endSessionDlg)
		{
			var closeDocs = dojo.string.substitute(this.nls.closeDocs, { 'productName' : concord.util.strings.getProdName() });
			pe.scene.endSessionDlg = new concord.widgets.EndSessionDlg(null, this.nls.endSessionDlgTitle, closeDocs, false, {message:notice} );
		}
		pe.scene.endSessionDlg.show();		
	},
	
	isDraftSaved: function() {
		return this.bSaved;
	},
	
	showSaveMessage: function() {
		this.myHeader.showSaveMessage();
	},
	
	showSavedMessage: function(interval) {
		this.myHeader.showSavedMessage(interval);
	},
	
	showSavingMessage: function() {
		this.myHeader.showSavingMessage();
	},	
	
	showLockedDocumentMessage: function() {
		if(DOC_SCENE.isLocked && !this.showCheckinMenu()){
		   this._loadNls();
		   this.showWarningMessage(this.nls.editLockedDocumentWarning, 60000, true); 
		}
	},
	
	hideErrorMessage: function(key) {
		this.myHeader.hideErrorMessage(key);
	},
		
	userJoined: function(user) {				
		if( this.getSidebar() ) 
		{
			this.getSidebar().userJoined(user);	
		}    
	},
	
	userLeft: function(user) {		
		if( this.getSidebar() )
		{
			this.getSidebar().userLeft(user);
		} 			
	},
	
	coeditStarted: function() {
		this.showLockedDocumentMessage();
	},
	
	coeditStopped: function() {
		
	},
	
	processMessage: function(msg) {
		throw new Error("not implemented");
	},
	checkPending:function(){
		return false;
	},
	syncStarted: function() {
		this.showWarningMessage(this.nls.synchronizing,30000, true); 		
	},
	
	syncFinished: function() {
		this.hideErrorMessage();		
	},
	
	syncFailed: function() {
		console.log("cannot get the state requested");
		this.showErrorMessage(this.nls.synchronizeError,30000); 
		this.offline();
	},
	
	// draft saving uses the same delta data to represent the revision
	// instead of whole document
	// this operation will update last modified time and editor info.
	saveDraft: function(nSync, isPublish)
	{
		if (isPublish)
		{
			var data = {"changeSummary" : ""};
			this.publish(data, true);
		}
		else
		{
			var success = this.session.save(false, nSync);
			if(success)
			{
			   this.showDraftSavedMessage();
			}
		}
	},
	
	discardDraft: function(saveDraft)
	{
		this.session.discard(saveDraft);
	},

	saveAs: function(data)
	{
		this.showWarningMessage(this.nls.draftSavingAs, 0, false, "savingas");
		var callback = function(response, ioArgs)
		{
			this.hideErrorMessage("savingas");
			if (response && response.dojoType == "timeout") {
				;
			} else if (ioArgs.xhr.status == 200) {
				if (response.status == 'complete') {
					
					var newDoc = new concord.beans.Document(response.data);
					var url = concord.util.uri.getDocPageUri(newDoc);
					var msg = dojo.string.substitute(this.nls.draftSavedAs, [newDoc.getTitle()]);
					this.showInfoMessage(msg, 5000, false, "savedas");
					
					if( ! concord.util.browser.isMobile() )
					{
						if (!this.isOverride) {
							window.open(url);
						} else {
							window.location.href = url;
						}
					}
					else
					{
						var events = [{"name":"createFileSuccess", "params":[newDoc.getTitle() + "." + newDoc.getExtension(), url, newDoc.getUri()]}];
						concord.util.mobileUtil.jsObjCBridge.postEvents(events);
					}	
					return;
				} else {
					if (response.status == 'error') {
						var problem_id = this.getProblemId(response, ioArgs);
						var errObj = concord.scenes.ErrorScene.getErrorMessage(response.error_code);
						if(response.error_code == 1011)
						{
							if(this.docType == 'text')
								errObj.message = this.nls.newDocTextErrMsg4;
							else if(this.docType == 'sheet')
				    			errObj.message = this.nls.newDocSheetErrMsg4;
							else
				    			errObj.message = this.nls.newDocPresErrMsg4;
						}	
						this.showErrorMessage(errObj.message, 5000, false, "savedasFail");
						if(problem_id && problem_id != "")
						{
						    this.showProblemIDDiv(problem_id,'savedasFail');
						}
						if( concord.util.browser.isMobile() )
						{
							concord.util.mobileUtil.stopActivityIndicator();
							concord.util.mobileUtil.confirm({ message: errObj.title, yesTitleKey: "keyRetry",  YES:"concord.util.mobileUtil.showSaveAsDialog();" });
						}
						return;
					}
				}
			} else if (ioArgs.xhr.status == 403) {
				try {
					var respJson = dojo.fromJson(response.responseText);
					var errorCode = respJson != null ? respJson.error_code : -1;
					var problem_id = this.getProblemId(response, ioArgs);
					var errObj = concord.scenes.ErrorScene.getErrorMessage(errorCode);
					this.showErrorMessage(errObj.message, 5000, false, "savedasFail");
					if(problem_id && problem_id != "")
					{
					    this.showProblemIDDiv(problem_id,'savedasFail');
					}
					if( concord.util.browser.isMobile() )
					{
						concord.util.mobileUtil.stopActivityIndicator();
						concord.util.mobileUtil.confirm({ message: errObj.title, yesTitleKey: "keyRetry",  YES:"concord.util.mobileUtil.showSaveAsDialog();" });
					}
					return;
				} catch (e) {
				}
			}

			// general error message
			var msg;

			if (this.docType == 'text')
				msg = this.nls.saveAsTextErrMsg;
			else if (this.docType == 'sheet')
				msg = this.nls.saveAsSheetErrMsg;
			else
				msg = this.nls.saveAsPresErrMsg;
			this.showErrorMessage(msg, 5000, false);
			var problem_id = this.getProblemId(response, ioArgs);
			if(problem_id == null || problem_id == "")
			{
			    problem_id = ioArgs.xhr.getResponseHeader("problem_id");
			}
			if(problem_id && problem_id != "")
			{
			    this.showProblemIDDiv(problem_id);
			}
			if( concord.util.browser.isMobile() )
			{
				concord.util.mobileUtil.stopActivityIndicator();
				concord.util.mobileUtil.confirm({ message: msg,  yesTitleKey: "keyRetry", YES:"concord.util.mobileUtil.showSaveAsDialog();" });
			}
		};
		this.session.saveAs(data, dojo.hitch(this, callback));
	},
	
	supportSaveShortCut: function() {
		return !this.showCheckinMenu();
	},
	
	isNeedRenderSFR: function()
	{
		var bean = this.getDocBean();
		if (bean && concord.util.uri.isCCMDocument())
		{
			if(pe.scene.bean.getApproveProcess() == 'BasicApproval' &&
					!pe.scene.bean.getApproveState() && DOC_SCENE.isPublishable)
				{
					return true;
				}
		}
			
		return false;
	},
	
	initCCMWidgets: function(show)
	{		
		var frame = document.getElementById(this.ccmFrameId);
		if(!frame)
		{
			frame = document.createElement("iframe");
			if(pe.scene.isHTMLViewMode()){
				frame.src= window.contextPath + window.staticRootPath + "/js/viewer/widgets/templates/ccmwidgets.html";
			}else{
				frame.src= window.contextPath + window.staticRootPath + "/js/concord/templates/ccmwidgets.html";
			}
			frame.id=this.ccmFrameId;
			frame.style.position = "absolute";
			frame.style.left = "0";
			frame.style.top = "0";
			frame.style.width = "100%";
			frame.style.height = "100%";				
			frame.frameBorder = "0";
			frame.style.display = show ? "" : "none";
			dojo.attr(frame, "allowtransparency", "true");
			document.body.appendChild(frame);	
		}
		this.initCCMMenu();
		return frame;
	},

	initCCMMenu: function()
	{
		if(pe.scene.isNeedRenderSFR())
		{
			if(pe.publishMenuItem)
				pe.publishMenuItem.domNode.style.display = 'none';
			//to avoid the presentation async initCCMWidgets twice and isNeedRendSFR async load.
			pe.reviewMenuItem.domNode.style.display = '';
		}
		else
		{            				
			pe.reviewMenuItem.domNode.style.display = 'none';
		}
	},
	
	initReviewMenu: function(show)
	{
  		// init the iframe
		this.initCCMWidgets(show);
	},
	
	hideReviewFrame: function()
	{
		var frame = document.getElementById(this.ccmFrameId);
		if(frame)
		{
			frame.style.display = "none";
		}
	},
	
	onErrorAndHideReviewFrame: function(dialogType)
	{	
		var msg = this.nls.widgetsFaiure;
		if (dialogType == "SubmitForReview")
		{
			msg = this.nls.submitReviewWidgetsFaiure;			
		}
		var dlg = new concord.widgets.MessageBox(null, null, null, false, {message:msg, callback: dojo.hitch(this, pe.scene.hideReviewFrame)});
		dlg.show();		
	},
	
	showSaveCCMErrorMsg: function()
	{
		var dlg = new concord.widgets.MessageBox(null, null, null, false, {message: this.nls.versionSavedFailed});
		dlg.show();				
	},
	
	submitForReview: function() 
	{
		// need remind user to save first before submit for review
		var needSave = false;
		if(this.session.isDirty())
		{
			needSave = true;
		}
		else
		{
			var resp = concord.util.uri.getDraftStatus();
			if(resp && resp.dirty)
			{
				needSave = true;
			}
		}
		if(needSave)
		{
			var callback = function(editor, answer)
			{
				if(answer)
				{
					this.saveDraft(null, true);
				}
			};
			var dlg = new concord.widgets.ConfirmBox(null, null, this.nls.save, true, {message: this.nls.saveBeforeReviewMsg, callback: dojo.hitch(this,callback)});
			dlg.show();		
			return;	
		}
		
		// submit for review is there is nothing to be saved
		var frame = document.getElementById(this.ccmFrameId);
		if(!frame)
		{
			frame = this.initReviewMenu(true); 
		}
		frame.style.display = "";
		frame.contentWindow.run("SubmitForReview");		
	},
	
	stopReview: function()
	{
		var frame = document.getElementById(this.ccmFrameId);
		if(!frame)
		{
			frame = this.initCCMWidgets(true); 
		}
		frame.style.display = "";
		frame.contentWindow.run("StopReview");						
	},
	
	rejectReview: function()
	{
		var frame = document.getElementById(this.ccmFrameId);
		if(!frame)
		{
			frame = this.initCCMWidgets(true); 
		}
		frame.style.display = "";
		frame.contentWindow.run("RejectReview");					
	},
	
	approveReview: function()
	{
		var frame = document.getElementById(this.ccmFrameId);
		if(!frame)
		{
			frame = this.initCCMWidgets(true); 
		}
		frame.style.display = "";
		frame.contentWindow.run("ApproveReview");			
		
	},
	
	successReview: function()
	{
 		var uri = concord.util.uri.getCCMSubmitForReview();
 		dojo.xhrPost({
   			url: uri ,
   			handleAs: "json",
   			handle: function(r, io) {},
   			sync: false,
   			preventCache: true,
   			contentType: "text/plain; charset=UTF-8",
   			postData: {},
   			noStatus: true,
   			failOk: true
 		});	
		var dlg = new concord.widgets.SuccessReviewDialog(null, null, null, false, null, null);
		dlg.show();
	},
	
	closeViewer: function() {
		window.location = DOC_SCENE.fileDetailPage;
	},
	
	reviewFail: function(error) {
		this.hideReviewFrame();
		
		var dlg = new concord.widgets.MessageBox(null,this.nls.errorMsg, null, false, 
				{message:this.nls.labelItemNotFountTitle + '\n\u00a0\n' + this.nls.labelItemNotFountMsg, 
				 imageclass:"viewerSprite viewerSprite-msgError48"});
		dlg.show();
	},
	
	publish: function(data, overwrite)
	{
		// disable publish and discard menu
		pe.publishMenuItem && pe.publishMenuItem.setDisabled(true);
		pe.discardMenuItem && pe.discardMenuItem.setDisabled(true);
		this.myHeader.disablePublishButton(true);
		var isConn = concord.util.uri.isLCFilesDocument();
		var msg = isConn ? this.nls.versionPublishing : this.nls.versionPublishing2; 
		this.showWarningMessage(msg, 0, false, 'publishing');
		var callback = function(response, ioArgs)
		{
			// enable publish and discard menu
			pe.publishMenuItem && pe.publishMenuItem.setDisabled(false);
			this.myHeader.disablePublishButton(false);
			if(concord.util.uri.isECMDocument())
			{
				pe.scene.initReviewMenu(false);
			}
			if (this.session && this.session.singleMode && !DOC_SCENE.hasTrack)
			{
				pe.discardMenuItem && pe.discardMenuItem.setDisabled(false);
			}
			this.hideErrorMessage('publishing');
			
			var failmsg;
			if(this.showCheckinMenu())
			{
				failmsg = this.nls.versionCheckinFailed;	
			}
			else
			{
				failmsg = isConn ? this.nls.versionPublishFailed: this.nls.versionPublishFailed2;	
			}	
			
			if (response && response.dojoType == "timeout") {
				this.showVersionPublishedFailedMessage("timeout");		
				this.handlePublishFailResultInDlg(failmsg, overwrite);
			} else if (ioArgs.xhr.status == 200) {
				if (response.status == 'complete') {
					
					if (response.data)
						this.bean.update(response.data);
					this.showVersionPublishedMessage(overwrite);

					if (window.top.opener) {
						var odojo = window.top.opener.dojo;
						if (odojo) {
							odojo.publish("lconn/share/action/completed", [ {fileChange : true}, null ]);
						}
					}
					return;
				} else {
					if (response.status == 'error') {
						var msg;
						var problem_id = this.getProblemId(response, ioArgs);
						if ((response.error_code >=1200 ) && (response.error_code <= 1299) && (response.error_code != 1208) && (response.error_code != 1201)) {
							// For conversion error, only process 1208 (EC_CON_SERVER_BUSY) and 1201 (EC_CONV_DOC_TOOLARGE)
							if(overwrite)
							{
								msg = this.nls.versionSavedFailed;
							}
							else if(this.showCheckinMenu())
							{
								msg = this.nls.versionCheckinFailed;
							}
							else
							{
								msg = isConn ? this.nls.versionPublishFailed: this.nls.versionPublishFailed2;
							}
						} else if (response.error_code == 1010) {
							if(overwrite)
							{
								msg = this.nls.versionSavedFailed;
							}
							else if(this.showCheckinMenu())
							{
								msg = this.nls.checkinFileSizeExceedMsg;	
							}
							else
							{
								msg = isConn ? this.nls.publishFileSizeExceedMsg: this.nls.publishFileSizeExceedMsg2;	
							}																
						} else{
							var errObj = concord.scenes.ErrorScene.getErrorMessage(response.error_code);
							msg = errObj.message;						
						}
						this.showErrorMessage(msg, 5000, false, 'publishFail');
						if(problem_id && problem_id != "")
						{
							this.showProblemIDDiv(problem_id,'publishFail');
						}
						this.showVersionPublishedFailedMessage(msg);						
						this.handlePublishFailResultInDlg(msg, overwrite);
						return;
					}
				}
			} else if (ioArgs.xhr.status == 410) {
				// document cannot be found in repository
				// allow user to save as another file
				var nls = dojo.i18n.getLocalization("concord.widgets", "SaveDialog");
				if( ! concord.util.browser.isMobile()  )
				{
					if(this.showCheckinMenu())
					{
						var errornls = dojo.i18n.getLocalization("concord.scenes", "ErrorScene");
						this.handlePublishFailResultInDlg(errornls.doc_notfound_content, overwrite);						
					}					
					else
					{
						concord.util.dialogs.confirm(nls.confirmSaveAs, dojo.hitch(this, function(editor, answer) {
							if (answer) {
								var dlg = new concord.widgets.SaveAsDialog(editor, true);
								dlg.show();
							}
						}));						
					}
				}
				else
				{
					this.showVersionPublishedFailedMessage(""); // don't popup alert with no message
					concord.util.mobileUtil.confirm({ titleKey: "keyConfirmSaveAsTitle", messageKey:"keyConfirmSaveAsMsg",
						"YES": "concord.util.mobileUtil.showSaveAsDialog();",
						yesTitleKey: "keySaveAs",noTitleKey: "keyDiscardEdits" });
				}
				return;
			} else if (ioArgs.xhr.status == 403) {
				try {
					var respJson = dojo.fromJson(response.responseText);
					var errorCode = respJson != null ? respJson.error_code : -1;
					var problem_id = this.getProblemId(response, ioArgs);
					var errObj = concord.scenes.ErrorScene.getErrorMessage(errorCode);
					this.showErrorMessage(errObj.message, 5000, false, 'publishFail');
					if(problem_id && problem_id != "")
					{
					    this.showProblemIDDiv(problem_id,'publishFail');
					}
					this.showVersionPublishedFailedMessage(errObj.message);					
					this.handlePublishFailResultInDlg(failmsg, overwrite);
					return;
				} catch (e) {
				}
			}
			// general error message
			var problem_id = this.getProblemId(response, ioArgs);
			var msg = isConn ? this.nls.versionPublishFailed: this.nls.versionPublishFailed2;
			this.showErrorMessage(msg, 5000, false, 'publishFail');
			if(problem_id && problem_id != "")
			{
			    this.showProblemIDDiv(problem_id,'publishFail');
			}
			this.showVersionPublishedFailedMessage(msg);
			this.handlePublishFailResultInDlg(failmsg, overwrite);						
		};
		this.session.publish(data, dojo.hitch(this, callback), overwrite);
	},
	
	submit: function(data)
	{
		return this.session.submit(data);
	},
	
	createHeader : function(app, node, title)
	{
		this._loadNls();
		if(concord.util.browser.isMobile())
			this.myHeader = new concord.scenes.mHeader(app, node, title, pe.scene);
		else
			this.myHeader = new concord.scenes.Header(app, node, title, pe.scene);
	},
	htmlviewEdit: function(editor){
		var winName = DOC_SCENE.uri.replace(/[-\s.@]/g, '_');
		window.open(this.docsURI,winName);
	},
	htmlviewPrint: function(editor){
		if(DOC_SCENE.snapshotId != 'null' && !pe.scene.outofdate)
			pe.scene.checkStatus();
		if(pe.scene.outofdate)
		{
			var dlg = new concord.widgets.ConfirmBox(null, this.nls.fileUpdated, this.nls.updateNow, true, {message:this.nls.fileUpdatedContent1, callback:pe.scene.refreshCallback});
			dlg.show();
			return;
		}else{
			pe.scene.printHtml();
		}
	},
	refreshCallback:function(editor,refresh){
		if(refresh)
			window.location.reload();
	},
	checkStatus: function(){
		var url = contextPath + "/api/docsvr/" + this.sceneInfo.repository + "/" + this.sceneInfo.uri +"/edit?mode=snapshotCheck";
	  	dojo.xhrGet
		(
			{
				url: url,
				handleAs: "json",
				handle: dojo.hitch(this, this._checkSnapshotStatus),
				sync: true,
				preventCache: true
			}
		);
	},
	monitorSnapshotStatus: function(img){
		console.log("Missing image"+img.src);
		if(this.outofdate)
			return;
		var url=img.src;
		dojo.xhrGet
		(
			{
				url: url,
				handleAs: "text",
				handle: dojo.hitch(this, this._checkSnapshotStatus),
				sync: false,
				preventCache: true
			}
		);
	},
	_checkSnapshotStatus: function(response,ioArgs){
		if(response.status==507)
		{
		   console.log("Snapshot changed,server return 507,should refresh current page.");
		   this._showReloadWidget();
		   this.outofdate=true;
		}
	},
	_showReloadWidget:function (){
		var link='<a href="javascript:void(0)" onclick="pe.scene.refreshPage()">'+this.nls.openLatestFile+'</a>';
		if (BidiUtils.isGuiRtl())
			link = "&nbsp;" + link + "&nbsp;";
		var text=dojo.string.substitute(this.getSnapshotUpdateStr(),[link]);
		this.showHtmlviewInfoMessage(text);
	},
	refreshPage: function(){
		window.location.reload();
	},
	
	reinvokePartialLoading: function(){
		var reloadDialog = new concord.widgets.MessageBox(null, this.nls.networkIssueTitle, null, false,
    			{message: this.nls.networkIssueContent, callback:pe.scene.refreshPage,imageclass:"yourProductSprite yourProductSprite-msgWarning48"});
		reloadDialog.show();
	},
	
	createMessageDiv: function(id)
	{
		return this.myHeader.createMessageDiv(id);
	},

	renderMessageDiv: function(msgNode){		
		this.myHeader.renderMessageDiv(msgNode);
	},
	
	resizeMessageDiv: function() {
		pe.scene.myHeader.resizeMessageDiv();
	},
	
	createSubmitInHeader: function() 
	{
		this.myHeader.createSubmitInHeader();
	},
	
	createNewDoc: function( app, title, isExternal, fromTemplate )
	{
		switch( app ){
		case 'text': return this._doCreateNewTextDoc(app,title, isExternal, fromTemplate);
		case 'presentation': return this._doCreateNewPresDoc(app, title, isExternal);
		case 'spreadsheet': return this._doCreateNewSheetDoc(app, title, isExternal, fromTemplate);
		default:break;
		}
	},

	newDocResponse: function(app, fromTemplate, response, ioArgs ) {
    	if (ioArgs.xhr.status==201) {
			var docBean = new concord.beans.Document(response);
			var newUri;
		
			if (fromTemplate)
				newUri = concord.util.uri.getDocPageUri(docBean) + "?fromTemplate=true";
			else
				newUri = concord.util.uri.getDocPageUri(docBean);
			
			window.open(newUri);
    	} else if (ioArgs.xhr.status==409){
    		var errMsg;
    		if(app == 'text')
    			errMsg = this.nls.newDocTextErrMsg4;
    		if(app == 'spreadsheet')
    			errMsg = this.nls.newDocSheetErrMsg4;
    		if(app == 'presentation')
    			errMsg = this.nls.newDocPresErrMsg4;
    		pe.scene.showErrorMessage(errMsg, 15000);
    	} else if (ioArgs.xhr.status==410){
    		var outOfSpace;
    		if(app == 'text')
    			outOfSpace = this.nls.newDocTextErrMsg3;
    		if(app == 'spreadsheet')
    			outOfSpace = this.nls.newDocSheetErrMsg3;
    		if(app == 'presentation')
    			outOfSpace = this.nls.newDocPresErrMsg3;
    		pe.scene.showErrorMessage(outOfSpace, 15000);
    	} else {
    		var errMsg;
    		if ( fromTemplate) { 
    			if(app == 'text')
    				errMsg = this.nls.newDocTextErrMsg2;
    			if(app == 'spreadsheet')
    				errMsg = this.nls.newDocSheetErrMsg2;
    			if(app == 'presentation')
    				errMsg = this.nls.newDocPresErrMsg2;
    		}
    		else {
    			if(app == 'text')
    				errMsg = this.nls.newDocTextErrMsg;
    			if(app == 'spreadsheet')
    				errMsg = this.nls.newDocSheetErrMsg;
    			if(app == 'presentation')
    				errMsg = this.nls.newDocPresErrMsg;
    		}
    		pe.scene.showErrorMessage(dojo.string.substitute(errMsg, [app]), 15000);
    	}
	},
	
	createCCMDocument: function(type)
	{
		if(concord.util.uri.isCCMDocument())
		{
			var frame = document.getElementById(this.ccmFrameId);
			if(!frame)
			{
				frame = this.initCCMWidgets(true);
				frame.style.display = "";
				setTimeout(function(){
					frame.contentWindow.run(type);
				}, 2000);			
			}
			else
			{
				frame.style.display = "";
				frame.contentWindow.run(type);
			}
		}
		else if(concord.util.uri.isICNDocument())
		{
			// TODO
			console.warn("Does not support this function!");
		}
	},
	
	createSheetDoc: function (editor, fromTemplate)
	{
		if(concord.util.uri.isCCMDocument())
		{
			this.createCCMDocument("CreateSpreadsheet");
		}
		else
		{
			dojo["require"]("concord.util.dialogs");
			concord.util.dialogs.showSaveAsDlg( 'spreadsheet', true , fromTemplate);
		}
	},
	
	createSheetDocFromTemplate: function(editor)
	{
		dojo["require"]("concord.widgets.spreadsheetTemplates.Dialog");
		var dlg = new concord.widgets.spreadsheetTemplates.Dialog(editor,this.nls.spreadsheetTemplates + "#SpreadsheetTemplate");
		dlg.show();
	},
	
	createPresDoc: function (editor)
	{
		if(concord.util.uri.isCCMDocument())
		{
			this.createCCMDocument("CreatePresentation");
		}
		else
		{
			dojo["require"]("concord.util.dialogs");
			concord.util.dialogs.showSaveAsDlg( 'presentation', true );	
		}
	},
	_doCreateNewTextDoc: function( app, title, isExternal, fromTemplate )
	{
		var servletUrl = concord.util.uri.getDocServiceRoot() + "/text";
		if(DOC_SCENE.communityID && DOC_SCENE.communityID.length > 0)
		{
			servletUrl += "?communityuuid=" + DOC_SCENE.communityID;
			servletUrl += "&repository=" + DOC_SCENE.repository;
		}   		
		var emptyDoc = {};
		emptyDoc.newTitle = title;
		emptyDoc.isExternal = isExternal;
		emptyDoc["locale"] = this.getLocale();
		//emptyDoc.content = '{"body":[{"pPr":{},"c":"","rPr":{"rFonts":{"cs":"Arial","ascii":"Arial","hAnsi":"Arial"},"preserve":{"szCs":"14pt"},"font-size":"14pt"},"t":"p","id":"id_0000000000000","fmt":[{"style":{"rFonts":{"cs":"Arial","ascii":"Arial","hAnsi":"Arial"},"preserve":{"szCs":"14pt"},"font-size":"14pt"},"rt":"rPr","s":"0","l":"0"}]}]}';
		if(fromTemplate)
			emptyDoc.templateId = pe.documentTemplateId;
		var sData = dojo.toJson(emptyDoc);
		dojo.xhrPost({
				url: servletUrl,
				handleAs: "json",
				handle: dojo.hitch(this, this.newDocResponse, app, fromTemplate),
				sync: true,
				contentType: "text/plain",
				postData: sData
			});		
	},
	_doCreateNewPresDoc: function(app, title, isExternal) {
    	var servletUrl = concord.util.uri.getDocServiceRoot() + "/pres";
		if(DOC_SCENE.communityID && DOC_SCENE.communityID.length > 0)
		{
			servletUrl += "?communityuuid=" + DOC_SCENE.communityID;
			servletUrl += "&repository=" + DOC_SCENE.repository;
		}       	
    	var data = {};
    	data["newTitle"] = title;
    	data["isExternal"] = isExternal;
    	data["template"] = "default";
    	var sData = dojo.toJson(data);
    	dojo.xhrPost ({
    		url: servletUrl,
    		handleAs: "json",
    		handle: dojo.hitch(this, this.newDocResponse, app, false ),
    		sync: true,
    		contentType: "text/plain",
    		postData: sData
    	});
	},
	_doCreateNewSheetDoc: function(app, title, isExternal, fromTemplate) {
    	var servletUrl = concord.util.uri.getDocServiceRoot() + "/sheet";
		if(DOC_SCENE.communityID && DOC_SCENE.communityID.length > 0)
		{
			servletUrl += "?communityuuid=" + DOC_SCENE.communityID;
			servletUrl += "&repository=" + DOC_SCENE.repository;
		}   
    	var locale = this.getLocale();
    	var data = {};
    	data["newTitle"] = title;
    	data["isExternal"] = isExternal;
    	// create 3 init sheets name
    	data["st0"] = this.nls.st0;
    	data["st1"] = this.nls.st1;
    	data["st2"] = this.nls.st2;
    	data["locale"] = locale;
    	var font = concord.editor.PopularFonts.getDefaultFont(locale);
    	if (font) data["font"] = font;
    	if(fromTemplate)
    	{
    		data.templateId = pe.spreadsheetTemplateId;
    	}
    	
    	var sData = dojo.toJson(data);
    	dojo.xhrPost ({
    		url: servletUrl,
    		handleAs: "json",
    		handle: dojo.hitch(this, this.newDocResponse, app, false),
    		sync: true,
    		contentType: "text/plain",
    		postData: sData
    	});
	},
	
	createTextDocFromTemplate:function(editor){
		dojo["require"]("concord.widgets.documentTemplates.Dialog");
		
		var dlg = new concord.widgets.documentTemplates.Dialog(editor,this.nls.documentTemplates + "#DocumentTemplate");
		dlg.show();
	},
	
	createTextDoc: function (editor, template)
	{
		if(concord.util.uri.isCCMDocument())
		{
			this.createCCMDocument("CreateDocument");
		}
		else
		{
			dojo["require"]("concord.util.dialogs");
			concord.util.dialogs.showSaveAsDlg( 'text', true, template );
		}
	},
	
	saveAsDoc: function (editor)
	{
    	return;
	},
	exportPerExtension: function(ext)
	{
		this.saveDraft();
		var url = concord.util.uri.getViewModeUri(window.pe.scene.sceneInfo.repository, window.pe.scene.sceneInfo.uri, window.g_draft);
		url += "?asFormat=" + ext;
    	window.open( url );	
	},
	exportToDefault: function()
	{
		var ext = DOC_SCENE.extension;
		if(ext && ext.toLowerCase() == "doc")
		{
			ext = "docx";
		}
		pe.scene.exportPerExtension(ext);
	},
	exportPdf: function(editor)
	{
//		if( !this.exportPDFDialog )
//		{
//			dojo["require"]("concord.widgets.print.textPrintToPdf");    		
//    		this.exportPDFDialog = new concord.widgets.print.textPrintToPdf(editor, this.nls.exportPdf);
//		} 	
//		this.exportPDFDialog.show();
		this.saveDraft(true);
		var url = concord.util.uri.getPrintPDFUri(window.pe.scene.sceneInfo.repository, window.pe.scene.sceneInfo.uri, window.g_draft);
    	window.open( url );
	},
	exportPresToPdf: function(editor)
	{
		this.saveDraft();
		if( !this.exportPDFDialog )
		{
			dojo["require"]("concord.widgets.print.presPrintToPdf");  
			this.exportPDFDialog = new concord.widgets.print.presPrintToPdf(editor, this.nls.exportPdf);
		}
    	this.exportPDFDialog.show();
	},
	exportToHttpRespWriter: function(self, name, ext, content) {
		if (self.exHttpForm == null) {
			var fname = "exHttpFrame";
			var cframe = dojo.place(
					"<iframe name='" + fname + "' style='position: absolute; left: 1px; top: 1px; height: 1px; width: 1px; visibility: hidden'>",
				dojo.body());
			var form = self.exHttpForm = dojo.create("form", {
				method: "post", 
				target: fname,
				style: { display: "none" }
			}, cframe);
			
			self.exHttpArea = dojo.create("textarea", { "name": "excontent" }, form);
		}

		var action = window.contextPath + "/api/httpwriterexp/" + DOC_SCENE.repository + "/" + DOC_SCENE.uri + "/" + encodeURIComponent(name) + "." + ext;		
		if (dojo.isSafari) {
			action += "?browser=safari";
		}

		self.exHttpForm.action = action;			
		self.exHttpArea.value = content;
		self.exHttpForm.submit();
    }, 
	shareWith: function(editor){
		dojo["require"]("concord.widgets.shareDocument");
		var d = new concord.widgets.shareDocument(editor, this.nls.shareDoc);
		d.show();
	},
	
	getDocTitle: function(){
		var bean = this.getDocBean();
		return bean ? bean.getTitle() : null;	
	},
	
	getFileDetailsURL: function(){	
		return concord.util.uri.getFileDetailsURL();
	},	
	
	goBackToFileDetails: function(){
		this.myHeader.goBackToFileDetails();
	},
	aboutConcord: function ()
	{
		dojo["require"]("concord.util.dialogs");
		concord.util.dialogs.alert( concord_version );
	},
	
	// called when onbeforeunload is called
	beforeLeave: function()
	{
		
	},

	leave: function()
	{
		this.session.leave();
		if(this.sidebar)
			this.sidebar.destroySideBar();
	},
	
	setFocus: function ()
	{
		// to be overriden;
		return;
	},
	
	// web-based clipboard
	getClipBoard: function (id)
	{
		if( !this.webClipboard )
		{
			this.webClipboard = new concord.beans.WebClipboard();
			if(id)	{ 
			  this.webClipboard.setApp(id); 
			}
		}
		return this.webClipboard;
	},

	getDocBean: function() {
		var bean = null;
		if (this.session) bean = this.session.bean;
		return bean;
	},
		
	getEditor: function()
	{
		// Should be overrided
		return;
	},	
	
	resetSessionList: function(){
		this.session.waitingList = [];
		this.session.sendoutList = [];		
	},
	
	getTaskHdl: function()
	{
		console.log("please implement getTaskHdl in apllication scene");
		return null;
	},	
	getCommentsIdInActRange: function()
	{
		return null;
	},
	
	getSidebar: function()
	{
		return this.sidebar;
	},
	
	toggleCommentsCmd: function()
	{
		if( ! concord.util.browser.isMobile() )
		{
			if(this.sidebar)
			{
				this.sidebar.onInsertComments();
			}
			else
			{
				this.toggleSideBar();	  	
				if(this.sidebar)	  	
					this.sidebar.onInsertComments();
			}
		}
	},
	
	toggleSideBarCmd: function(preventStatus){
		if(!this.sidebar)
			this.toggleSideBar();
		this.toggleSideBar(preventStatus);
	},
	
	toggleSideBar: function (preventStatus){							
	  var sidebar = this.sidebar;
	  if(sidebar){
		sidebar.toggle(preventStatus);
		if(pe.firstSidebarOpenClick){
			  pe.firstSidebarOpenClick = false;
			  sidebar.refreshAllforFirstClick();
		}
	  }
	  else{
		var initStaticRender = function () {
			if(!window.conditionRenderer)
				window.conditionRenderer = new concord.widgets.social.conditionRenderer(window.renderParams);
		};
		concord.util.conditional.processUntilAvailable(initStaticRender, null,"window.renderParams!='undefined'",	null, false /* do not throw if test clause not found */);
		
	  	try{
	  		//build up 1st time, must not set display as none when 1st build.
	  		var mainNode = dojo.byId("mainNode");  		
	  		var sidebarNode = dojo.byId("ll_sidebar_div");
	  		if (!sidebarNode)
	  			sidebarNode = dojo.create("div",{id: "ll_sidebar_div"}, mainNode);      
		  
	  		this._loadNls();
	  		dijit.setWaiRole(sidebarNode,'region');
	  		dijit.setWaiState(sidebarNode,'label', this.nls.sidebarLandmarkDesc);	  
	  		sidebarNode.style.height = this.getSidebarHeight(); // application scene implemented        		   
	  		sidebarNode.style.display = "";
	  		sidebarNode.style.visibility = "hidden";
 
	  		if (BidiUtils.isGuiRtl()){
	  			dojo.style(sidebarNode,"left","1px");
	  			sidebarNode.style.direction = "rtl";
	  		} else
	  			dojo.style(sidebarNode,"right","1px");
	  		
	  		if(window.pe.scene.docType == "text" || window.pe.scene.docType == "sheet"){	  			
	  			if(BidiUtils.isGuiRtl()){
	  				dojo.style(sidebarNode,"borderRight","1px solid #CECECE");
	  			}else{
	  				dojo.style(sidebarNode,"borderLeft","1px solid #CECECE");
	  			}	  			
	  		}
	  		
	  		dojo["require"]("concord.widgets.sidebar.SideBar");
	  		sidebar = new concord.widgets.sidebar.SideBar(sidebarNode, pe.scene);					            			     
	  		this.sidebar = sidebar;	
      
 	  		var bar = pe.settings ? pe.settings.getSidebar() : null;
	  		sidebarNode.style.display = "none"; 
	  		sidebarNode.style.visibility="visible";
	  		var lastCollapse = pe.settings && (bar == pe.settings.SIDEBAR_COLLAPSE);
	  		if(lastCollapse)
	  			pe.firstSidebarOpenClick = true;
	  		else
	  			pe.firstSidebarOpenClick = false;
	  		//when the sidebar was collapsed last time
	  		if(pe.scene.docType == "sheet")
	  		{
	  			sidebar.usersJoined();
	  		}
	  		if(lastCollapse){        	  
	  			sidebar.toggle_collapse(preventStatus);
	  		}else{ //toggle
	  			pe.firstSidebarOpenClick = false;
	  			if (!this.isEditCompactMode()) {
	  				sidebar.expand(preventStatus);
	  			}
	  		}
	  		
	  		if( pe.scene.resizeSidebarDiv ){
	  			concord.util.events.subscribe(concord.util.events.doc_data_reload, this, 'resizeSidebarDiv',true);
	  			concord.util.events.subscribe(concord.util.events.doc_header_dom_changed, this, 'resizeSidebarDiv',true);
	  		}            
	  	} catch(e) {
	  		console.log("toggle sidebar error: "+e);
	  	}
	  }
  },

  stage: function()
  {
	if(DOC_SCENE.isDraftOutOfDate)
	{
		this.staged(false);
	}	
	else if (DOC_SCENE.jobLive == "true")	  
	{
		console.log(DOC_SCENE.jobId);
		this.queryJob();
	}
	else if (DOC_SCENE.sessionClosing == "true")
	{
		this.querySessionStatus();
	}
	else
	{
		if(this.getContentType() == this.CONTENT_TYPE_REVISION) {
			// staged revision
			this.loadVersion(this.getRev());
		}
		else {
			// staged draft
			this.staged(true);	
		}		
	}
  },
  
  showEncryptedPwdDialog: function(data){
	//hide loading dialog
	if(this.stagingDlg)
	{
		this.stagingDlg.hide();
		this.stagingDlg = null;
	}
	if (! concord.util.browser.isMobile()) 
	{ 	 	
	  	if(!this.encryptedPwdDlg)
	  	{
	  		dojo["require"]("concord.widgets.EncryptPwdValidatorDlg");
	  		this.encryptedPwdDlg = new concord.widgets.EncryptPwdValidatorDlg(null, null, null, false,null,{method: "POST",
	  			action: contextPath + "/api/docsvr/" + DOC_SCENE.repository + "/" + DOC_SCENE.uri + "/decrypt",id:'id_decryption_form'});
	  		this.encryptedPwdDlg.setScene(this); 
	  		this.encryptedPwdDlg.show();
	  	}
	  	else if(this.encryptedPwdDlg)
	  	{
	  		this.encryptedPwdDlg.errorReset();
	  		if(this.isHTMLViewMode()){
				this.bg.hide();
	  		}
	  	}         
	} 
	else
	{
		if(! concord.util.mobileUtil.passwordTryTimes )
			concord.util.mobileUtil.passwordTryTimes = 0;
		concord.util.mobileUtil.passwordTryTimes++;
		var events = [{"name":"requirePassword", "params":[concord.util.mobileUtil.passwordTryTimes]}];
		concord.util.mobileUtil.jsObjCBridge.postEvents(events);
	}
  },
  
  showDraftConflictOptions: function()
  {
	if(this.stagingDlg)
	{
		this.stagingDlg.hide();
		this.stagingDlg = null;
	}
	if (! concord.util.browser.isMobile()) 
	{ 	 	
	  	if(!this.optsDlg)
	  	{
	  		dojo["require"]("concord.widgets.DraftConflictOptsDlg");
	  		this.optsDlg = new concord.widgets.DraftConflictOptsDlg(null, null, null, true);
	  		this.optsDlg.show();
	  	}
	  	else if(this.optsDlg)
	  	{
	  		this.optsDlg.show();
	  	}         
	} 	 
	else
	{
		var message = concord.util.dialogs.formatStrings4Modifier(this.nls.uploadNewVersionOpenConfirm, DOC_SCENE.repoModifier, DOC_SCENE.repoModified);			
		//confirm obj: title titleKey, message, messageKey, yesTitle, yesTitleKey , YES callback, NO callback
		var confirmObj = {
			message: message,
			yesTitleKey: "keyOpen",
			YES: "pe.scene.handleDraftConflict(true)",
			NO: "pe.scene.handleDraftConflict(false)"
		};
		concord.util.mobileUtil.confirm( confirmObj);
	}
  },
  
  handleDraftConflict: function(syncdraft) {
	DOC_SCENE.syncDraft = syncdraft;
	var paras = syncdraft ? "?syncdraft=true" : "?syncdraft=false";
	var servletUrl = concord.util.uri.getUploadNewVersionUri() + paras;
	var callback = function(data){
			DOC_SCENE.isDraftOutOfDate = false;
			//console.log(data);
			if(data.status == 'converting'){
				DOC_SCENE.jobId = data.jobid;
				//console.log(DOC_SCENE.jobId);
				pe.scene.queryJob();
			}else if(data.status == 'success'){
				DOC_SCENE.jobId = data.jobid;
				pe.scene.staged(true);
			}						
		}
	dojo.xhrPost({
		url: servletUrl,
		handleAs: "json",
		load: callback,
		sync: false,
		contentType: "text/plain"
	});			  
  },
  
  staged: function(success, response)
  {
	if(DOC_SCENE.isDraftOutOfDate)
	{
		this.showDraftConflictOptions();
		return;
	} 
	if (!success)
  	{
  		var data = response.data;
  		if(data != null && data.correctFormat != null && data.correctFormat.search(/unsupported/i) == -1)
  		{
  			var redirect = function(response, aborted)
  			{
  				var data = response.data;
  				var json = dojo.fromJson(dojo.cookie(this.deepDetectKey));
  				if(!json)
  				{
  					json = {};
  				}
  				if(aborted || (data.correctFormat != null && data.correctFormat.search(/unsupported/i) != -1))
  				{
  					dojo.cookie(this.deepDetectKey, dojo.toJson(json), {path : contextPath});
  					concord.scenes.ErrorScene.renderError(response.error_code);
					return;
  				}
  				var url = window.location.href;
  				json.correctFormat = data.correctFormat;
				json.jobId = data.jobId;
  				dojo.cookie(this.deepDetectKey, dojo.toJson(json), {path : contextPath});
  				window.location.href = url;
  			};
  			
  			var params =
  			{
  				message : this.nls.fileDeepDetectMsg, 
  				callback : dojo.hitch(this, redirect),
  				response : response
  			};
  			
  			this.showFileFormatNotMatchDialog( params );
  			return;
  		}
  		else if(this.isHTMLViewMode() && response.error_code == 1205)
  		{ 			
  		  	//error_code 1205, password protection in conversion
  			this.showEncryptedPwdDialog(response.data);
  			this.bg.hide();
  			return;
  		}
  		else
  		{
			if(response.error_code == 1205) 				
  				this.encryptedDocument = true;
			
  			this.clearFormatCookie();
  			var problem_id = response.problem_id;
  			if(problem_id && problem_id != ""){
  				if (!data) data = {};
  				data.problem_id = problem_id;
  			}

  			if(this.isHTMLViewMode()){
  				if (!data) data = {};
  				data.limits=viewerConfig;
  				concord.scenes.ErrorScene.renderError(response.error_code, data);
  			}else{
  				concord.scenes.ErrorScene.renderError(response.error_code, data);	
  			}
  	  		
  		}
  	}
  	else
  	{
  		if(pe.scene && pe.scene.isHTMLViewMode())
  		{
  			if(response && response.sid && DOC_SCENE.snapshotId && DOC_SCENE.snapshotId=='null')
			{
 	  			DOC_SCENE.snapshotId = response.sid;
			}
			if(dijit.byId('html_edit_btn'))
				dijit.byId('html_edit_btn').setDisabled(false);
			if(dijit.byId('html_print_btn'))
				dijit.byId('html_print_btn').setDisabled(false);
			if(dijit.byId('html_pdfprint_btn'))
				dijit.byId('html_pdfprint_btn').setDisabled(false);
			if(dijit.byId('html_sheet_viewer_btn'))
				dijit.byId('html_sheet_viewer_btn').setDisabled(false);
  			this.bg.hide();
  		}
  		if(this.stagingDlg)
  		{
  			this.stagingDlg.hide();
  			this.stagingDlg = null;
  		}
  		if(this.encryptedPwdDlg){
  			this.encryptedPwdDlg.destory();
  			this.encryptedPwdDlg = null;
  		}
  		concord.util.dialogs.showUnsupportDlg();
  	}

//  	console.log("staged from AbstractScene......");
  },

  showFileFormatNotMatchDialog: function( params )
  {
	  var dlg = new concord.widgets.FileDeepDetectDialog(null, this.nls.fileDeepDetectTitle, this.nls.fileDeepDetectOkLabel, true, params);
	  dlg.show();
  },
  
  staging: function()
  {
	if(this.isHTMLViewMode())
	{
		this.bg.show();
		return;
	}
  	if(!this.stagingDlg && !this.encryptedPwdDlg )
  	{
		dojo.requireLocalization("concord.scenes", "AppCheckScene");
		var resourceBundle = dojo.i18n.getLocalization("concord.scenes", "AppCheckScene");

		var content = DOC_SCENE.upgradeConvert == "true" ? dojo.string.substitute(resourceBundle.appcheck_msg_upgrading, { 'productName' : concord.util.strings.getProdName() }) : resourceBundle.appcheck_msg_loading;
		var msg = {subTitle: resourceBundle.appcheck_loading, content: content};
		if (DOC_SCENE.convertingToODF == "true")
		{
			msg.content = resourceBundle.appcheck_msg_notodf + "\n" + resourceBundle.appcheck_msg_notodf_next;
		}

  		this.stagingDlg = new concord.widgets.ProgressBox( null, null, null, false, {message:msg, imageclass:"dlg_progress_processing"} );
  		this.stagingDlg.show();
  	}
  	console.log("staging from AbstractScene......");
  },

  queryJob: function()
  {
  	var url = contextPath + "/api/job/" + DOC_SCENE.repository + "/" + DOC_SCENE.uri + "/" + DOC_SCENE.jobId + "?mode=" + DOC_SCENE.mode;
  	dojo.xhrGet
	(
		{
			url: url,
			handleAs: "json",
			handle: dojo.hitch(this, this.jobHandle),
			sync: false,
			preventCache: true
		}
	);
  },
  
  jobHandle: function(response, ioArgs)
  {
  	if (response instanceof Error)
  	{
  		// check again
  		setTimeout(dojo.hitch(this, this.queryJob), 1000);
  		return;
  	}
  	
  	if (response.status == "complete")
  	{
  		this.staged(true, response);
  		this.clearFormatCookie();
  	}
  	else if (response.status == "broken")
  	{
  		// Job was broken, reload the document window.
  		window.location.reload();
  	}
  	else if (response.status == "error")
  	{
  		var problem_id = this.getProblemId(response, ioArgs);
  		if(problem_id && problem_id != "")
  		{
  			response.problem_id = problem_id ;
  		}
  		this.staged(false, response);
  	}
  	else if (response.status == "pending")
  	{
  		this.staging();

  		// check again
  		setTimeout(dojo.hitch(this, this.queryJob), 1000);

  		return;
  	}
  	else
  	{
  		console.info("unknown job status: " + response.status);

  		// check again
  		setTimeout(dojo.hitch(this, this.queryJob), 1000);
  	}
  },	 
  
  /**
   * Query the status of the document session, check if the session is closing or not.
   */
  querySessionStatus: function()
  {
  	var url = this.session.url + "?method=getSessionStatus";
  	dojo.xhrGet
	({
		url: url,
		handleAs: "json",
		handle: dojo.hitch(this, this._queryStatusHandler),
		sync: false,
		preventCache: true
	});
  },
  
  _queryStatusHandler: function(response, ioArgs)
  {
  	if (response == null || response instanceof Error || response.status == "pending")
  	{
  		// Check again.
  		this.staging();
  		setTimeout(dojo.hitch(this, this.querySessionStatus), 1000);
  	}
  	else if (response.status == "complete")
  	{
  		if (response.refresh == "true")
  		{
  			window.location.reload();
  		}
  		else
  		{
  			DOC_SCENE.sessionClosing = "false";
  			this.stage();
  		}
  	}
  	else if (response.status == "error")
  	{
  		this.gotoErrorScene(response.error_code);
  	}
  	else
  	{
  		this.staging();
  		setTimeout(dojo.hitch(this, this.querySessionStatus), 1000);
  	}
  },
  
  clearFormatCookie: function()
  {
    var cookie = dojo.cookie(this.deepDetectKey);
    if(cookie != null)
    {
        var json = dojo.fromJson(cookie);
        if(json != null)
        {
        	var cookieProps = {path: contextPath, expires:-1};
        	dojo.cookie(this.deepDetectKey, "", cookieProps);
        }
    }	
  },
  /**
	* apply settings after document was loaded.
	*/
	applySidebarSettings: function()
	{ 
		var bar = pe.settings? pe.settings.getSidebar() : null;		
		if(bar)
		{
			var preventStatus = 'yes';		
			if(	pe.scene.getSidebar())
				!this.isEditCompactMode() && pe.scene.getSidebar().open(preventStatus); 
			else
				pe.scene.toggleSideBar(preventStatus);
		}
	},

	doSpellCheck: function()
	{
		if(this.spellCheckDialog)
		{
			this.spellCheckDialog.show();
		}	
		else
		{	
			dojo["require"]("concord.spellcheck.SpellCheckDlg");
			this.spellCheckDialog = new concord.spellcheck.SpellCheckDlg();		
			this.spellCheckDialog.show();
		}
	},
	
	showPreferencesDailog: function()
	{
		if(this.preferencesDailog)
		{
			this.preferencesDailog.show();
		}	
		else
		{	
			dojo["require"]("concord.widgets.PreferencesDialog");
			dojo.requireLocalization("concord.widgets","PreferencesDialog");
			var preferencesNls = dojo.i18n.getLocalization("concord.widgets","PreferencesDialog");
			this.preferencesDailog = new concord.widgets.PreferencesDialog(pe.scene.getEditor(), preferencesNls.preferencesDialogTitle);		
			this.preferencesDailog.show();
		}		
	},
	
	getScHandler: function()
	{
		dojo["require"]("concord.spellcheck.SpellCheckDlgHandler");
		return new concord.spellcheck.SpellCheckDlgHandler();
	},
    
    getSidebarMenuItemId: function()
    {
		// Should be overrided
    	throw new Error("getSidebarMenuItemId not implememented");
	},
	
	getLocale: function()
	{
		return g_locale;
	},
	
	getBrowserWidth: function()
	{
		//return g_browserWidth;
		return 0;
	},
	
	setBrowserWidth: function(width)
	{
//		g_browserWidth = width;
	},	
	
	setLeaveData: function(data)
	{
	    
	},
	
	getLeaveData: function()
	{
	    return null;
	},
		
	openRecentFile: function(docId, repoId)
	{
		if(!RecentFiles.openFile(docId, repoId))
		{
	    	dojo["require"]("concord.util.dialogs");
	    	concord.util.dialogs.confirm(this.nls.removeRecentFile, 
	    	       dojo.hitch( this, function(editor, answer) 
	                  {
	                       if(answer)
	                    	   setTimeout(dojo.hitch(this, function(){
	                    		   this.removeRecentFileSubMenu(docId, repoId);
	                    		   RecentFiles.deleteFileInList(docId, repoId);
	                    	   }), 0);
	                   } 
	               ));    							
		}
	},
	
	getRecentFilesMenu: function()
	{
		var subMenu = new dijit.Menu();
		dojo.addClass(subMenu.domNode,"lotusActionMenu");
		subMenu.domNode.style.display ='none';
		document.body.appendChild(subMenu.domNode);
		if(!RecentFiles) return;
		var fileItems = RecentFiles.getRecentFiles();
		var dirAttr = BidiUtils.isGuiRtl() ? 'rtl' : '';
		for(var i= 0; i<fileItems.length; i++)
		{
			var item = fileItems[i];
			subMenu.addChild( new dijit.MenuItem(
			{
				id: "A_i_RecentFiles_" + item.getDocId() + "_" + item.getRepoId(),
				label: item.getTitle(),
				iconClass: '',
				docId: item.getDocId(),
				repoId: item.getRepoId(),
				onClick: function()
			    {
					pe.scene.openRecentFile(this.docId, this.repoId); 					
			    },
			    dir: dirAttr
			}));
		}
		return subMenu;
	},	
	
	removeRecentFileSubMenu: function(docId, repoId)
	{
		if(pe && pe.recentFileMenuItem && pe.recentFileMenuItem.popup)
		{
			var children =  pe.recentFileMenuItem.popup.getChildren();
			for(var i=0; i<children.length; i++)
			{
				if(children[i].docId == docId && children[i].repoId == repoId)
				{
					pe.recentFileMenuItem.popup.removeChild(children[i]);
					break;
				}
			}
		}
	},
	
	updateParticipant: function(participantList)
	{
		if( concord.util.browser.isMobile() && !g_mobileOfflineMode)
		{
			var activeId = {};
			for( var i=0;i<participantList.length;i++)
			{
				activeId[participantList[i].getUserBean().getId()] = "";
			}
			this.participantChangeListener.activeId = activeId;
			this.participantChangeListener.editorsUpdated();
		}
	},
	
	isModalDialogShown: function(){
		if(dijit._underlay && dijit._underlay.domNode.style.display != "none"){
			return true;
		}
		return false;
	},	
	
	getPageSettings: function() {
		var ret = {};
		ret['hasSet'] = false;

		var url = concord.util.uri.getDocSettingsUri() + "/page";
		var callback = function(response, ioArgs){};
	  	var resp = dojo.xhrGet
		(
			{
				url: url,
				handleAs: "json",
				timeout: 10000,
				load: callback,
				error: callback,
				sync: true,
				preventCache: false
			}
		);			
		if (resp.ioArgs.xhr.status == 200) {
			var json = resp.results[0];				
			for(var key in json) {
				ret['hasSet'] = true;
				var value = json[key];
				switch (key) {
					case 'pageWidth':
					case 'pageHeight':
					case 'marginLeft':
					case 'marginRight':
					case 'marginTop':
					case 'marginBottom':
						try {
							ret[key] = parseFloat(value.substring(0,value.length-2));
						}
						catch(exception)
						{
							ret[key] = null;
						}													
						break;	
					case 'orientation':
					case 'pageOrder':
					case 'UseTaggedPDF':
					case 'gridline':
					case 'header':
					case 'footer':
						ret[key] = value;					
						break;
					default:
						break;
				}						
			}				
		} else {
			return null;			
		}		  				
			
		return ret;
	},
	
	redirectToSummaryPage: function() {
		window.location = concord.util.uri.getFileDetailsURL();
	},
	
	closeOrRedirectToSummaryPage: function (){
		window.close();
		if( !window.closed )
		{
			setTimeout(dojo.hitch(this, this.redirectToSummaryPage), 0);
		}
		return true;
	},

	autoPublishSet: function() {
		if(typeof g_autopublish_set == 'undefined')
			return false;
		return g_autopublish_set;
	},
	
	autoPublishFeature: function()
	{
		if((concord.util.uri.isECMDocument() && !concord.util.uri.isICNDocument()) || concord.util.uri.isExternalCMIS())
			return false;
		if(typeof g_enable_auto_publish == 'undefined')
			return false;
		return g_enable_auto_publish;
	},
	
	switchAutoPublish: function(check) {
		this.myHeader.switchAutoPublish(check);
		var data = dojo.toJson({"autopublish": check});
		var uri = concord.util.uri.getAutoPublishUri();
		var callback = function(r, io){}
 		dojo.xhrPost({
   			url: uri ,
   			handleAs: "json",
   			handle: callback,
   			sync: false,
   			preventCache: true,
   			contentType: "text/plain; charset=UTF-8",
   			putData: data,
   			noStatus: true,
   			failOk: true
 		});	
	},
	
	/**
	 * called when co-editor changed the status
	 */
	switchAutoPublishWidget: function(check)
	{
		if(check != true)
			check = false;
		this.myHeader.switchAutoPublish(check);
		if(pe.autoPublishMenuItem)
		{
			pe.autoPublishMenuItem.set('checked', check);
		}		
	},
	
	switchDraftBadge: function(show)
	{
		if(!this.autoPublishSet() && (concord.util.uri.isLCFilesDocument() || concord.util.uri.isLocalDocument()) )
		{
			if(show)
			{
				if(!this.myHeader.draftBadgeShown)
					this.myHeader.showDraftBadge(show);	
			}
			else
			{
				this.myHeader.showDraftBadge(show);	
			}			
		}
	},
			
	viewRevision: function (bExit)
	{// bExit = true to exit viewRevision, otherwise, enter viewRevision		
		if(bExit) {
			this.switchToEditMode();
			this.disableViewModeToolbar(false);		
			this.disableViewModeMenuItems(false);
			this.setRev(null);
			this.setContenType(this.CONTENT_TYPE_DRAFT);
		}
		else {
			this.saveDraft();
			this.setContenType(this.CONTENT_TYPE_REVISION);
			if(!this.sidebar) {
				this.toggleSideBar();
				setTimeout(dojo.hitch(this,this.sidebar.showRevisionPane()),50);
			} else {
				this.sidebar.open();
				this.sidebar.showRevisionPane();
			}		
			
			this.switchToViewMode();
			this.disableViewModeToolbar(true);
			this.disableViewModeMenuItems(true);
			this.setRev("current");
		}
		this.session.reload();
	},	
	
	setRev: function(rev) {
		this.rev = rev;
		var bean = this.getDocBean();
		var key = this.sceneInfo.repository + "_" + this.sceneInfo.uri + "_revision";
 		if(rev && rev != "current") {
			dojo.cookie(key, rev);
		}
		else {
			dojo.cookie(key ,null, {expires: -1});
		}
	},
	
	getRev: function() {
		return this.rev;
	},
	
    setContenType: function(type) {
    	if(type == this.CONTENT_TYPE_REVISION)
    		this.contentType = this.CONTENT_TYPE_REVISION;
    	else 
    		this.contentType = this.CONTENT_TYPE_DRAFT;
    },
    
    getContentType: function() {
    	return this.contentType;
    },	
		
	loadVersion: function(rev) {
		if(!this.isViewDraftMode()) {
			this.switchToViewMode();
			this.disableViewModeToolbar(true);
			this.disableViewModeMenuItems(true);
		}				
		this.setRev(rev);
		if(rev == "current") {
			this.session.reload();
		}
		else {			
			this._showLoadingBox(); // 1. show loading dialog till contents got
			var url = concord.util.uri.getDocRevUri() + "/" + rev + "/content";
			var callback = function(response, ioArgs){}
		  	var resp = dojo.xhrGet
			(
				{
					url: url,
					handleAs: "json",
					timeout: 30000,
					load: callback,
					error: callback,
					sync: true,
					preventCache: false
				}
			);			
			if (resp.ioArgs.xhr.status == 200) {	
				if(resp.results[0] && resp.results[0].state) {// 2. contents got here
					this._hideLoadingBox();
					if(!this.session.bean) { 
						// when render a revision, we don't call session loaded, the bean may be null
						this.session.bean = new concord.beans.Document(resp.results[0].bean);
					}					 
					this.loaded(resp.results[0].state);					
				}
				else if(resp.results[0] && resp.results[0].jobId){
					DOC_SCENE.jobLive = "true";
					DOC_SCENE.jobId = resp.results[0].jobId;
					this.stage();
				}
				else {
					setTimeout(dojo.hitch(this, function(){																
						this.loadVersion(rev);
					}), 1000);					
				}
				
			} else {
				setTimeout(dojo.hitch(this, function(){																
					this.loadVersion(rev);
				}), 1000);							
			}		  				
		}		
	},
	
	restoreVersion: function(rev) {
		this.switchToEditMode();
		alert("TODO: scene, restore version: " + rev); 
		
//		var url = concord.util.uri.getDocRevUri() + "/" + rev + "/restore";
//	  	var resp = dojo.xhrPost
//		(
//			{
//				url: url,
//				handleAs: "json",
//				timeout: 30000,
//				load: function(response, ioArgs) {
//				},
//				error: function(response, ioArgs) {			
//				},
//				sync: true,
//				preventCache: false
//			}
//		);					
	},
	
	disableViewModeMenuItems: function(disable) {
		// revision menu item
		var revMenu = dijit.byId("D_i_Revision") || dijit.byId("P_i_Revision") || dijit.byId("S_i_Revision");
		if(revMenu) {
			if(disable) {
				revMenu.attr("disabled", true);
			}
			else {
				revMenu.attr("disabled", false);
			}
		}
		// if disable is true, to disable the menu items for ViewMode
		// if disable is false, to enable the menu items for EditMode
	},
	
	disableViewModeToolbar: function(disable) {
		// if disable is true, to disable the toolbar for ViewMode
		// if disable is false, to enable the toolbar for EditMode
	},
	
//	// check the document and user role mode and swith to accordingly edit/view/observer scene mode
//	_switchSceneMode: function() {
//		var user = pe.authenticatedUser;
//		if(this.bean && user) {
//			if(this.bean.getApproveProcess()) 
//			{ // with work flow
//				this.switchToViewMode();
//			}
//			else if(user.isReader())
//			{
//				this.switchToViewMode();
//			}
//		}
//	},
	
	switchToViewMode: function() {
		this.viewDraftMode = true;
		this.hideTextMessage();
		if( this.getSidebar() ) {
			this.getSidebar().switchToViewMode();
		}
	},
	
	switchToObserverMode: function() {
		this.observerMode = true;
		if( this.getSidebar() ) {
			this.getSidebar().switchToObserverMode();
		}		
	},	
	
	switchToEditMode: function() {
		this.observerMode = false;
        this.viewDraftMode = false;
		if( this.getSidebar() ) {
			this.getSidebar().switchToEditMode();
		}		        
	},
    
    isViewDraftMode: function(){
        return this.viewDraftMode;
    },
    isObserverMode: function(){
    	return this.observerMode;
    },
    isHTMLViewMode: function() {
    	return this.htmlViewMode;
    },
    isEmbedded: function()
    {
    	return window.top != window;
    },
    /**
     * Returns if the document scene now is in view or observer mode. Note that the scene mode can be switched from view mode to edit mode during editing.
     * If need to know originally what the document mode is, call isDocViewMode or isDocObserverMode instead.
     * @params bExclueObserver set to true to return true iff doc mode is either VIEWDRAFT or HTMLVIEW
     * @returns true if the document scene now is in view mode
     */
    isViewMode: function(bExcludeObserver){
    	if (bExcludeObserver) 
    		return this.isViewDraftMode() || this.isHTMLViewMode();
    	
    	return this.isViewDraftMode() || this.isHTMLViewMode() || this.isObserverMode();
    },
    /**
     * check if it is compact mode now.
     */
    isViewCompactMode: function() {
    	return (this.htmlViewMode && this.compactMode);
    },
    /**
     * Returns if the original document mode is in view or observer mode. Note that the scene mode can be switched from view mode to edit mode during editing.
     * If need to know current edit state, call isViewMode instead.
     * @params bExclueObserver set to true to return true iff doc mode is either VIEWDRAFT or HTMLVIEW
     * @returns true if the document is opened in view or observer mode
     */
    isDocViewMode: function(bExcludeObserver) {
		var mode = this.sceneInfo.mode;
		if (bExcludeObserver) {
			return mode == ViewMode.VIEWDRAFT || mode == ViewMode.HTMLVIEW;
		} else {
			return mode == ViewMode.OBSERVER || mode == ViewMode.VIEWDRAFT || mode == ViewMode.HTMLVIEW;
		}
    },
    /**
     * Returns if the original document mode is in observer mode. Note that the scene mode can be switched from view mode to edit mode during editing.
     * If need to know current edit state, call isViewMode instead.
     * @returns true if the document is opened in view mode
     */
    isDocObserverMode: function() {
		return this.sceneInfo.mode == ViewMode.OBSERVER;
    },
    /**
     * check if it is edit compact mode. Banner and menubar won't be displayed in this mode
     */
    isEditCompactMode: function() {
    	return (this.compactEditMode || this.lightEditMode);
    },

    switchTrackChanges: function (nStatus) {
    	// Implemented in TextDocScene
    },

    enabledTrackChange: function() {
    	return false;
    },
    
    turnOnColorShading: function(isTurnOn, userId) {
    	throw("please implement the interface in concret class!!");
    },
    
    updateClientSeqForUndoRedoStack: function() {
    	// Implemented in TextDocScene
    },
    
    getFeaturePosition: function(featureId){
	if (BidiUtils.isGuiRtl()) {
		var toolbar = dojo.byId("lotus_editor_toolbar");
		if (toolbar) {
			var toolbarPos = dojo.position(toolbar);
			return {x: toolbarPos.x + toolbarPos.w - 100, y: 120};
		}
	}
    	return {x: 100, y: 120};
    },
    
    afterFeatureShow: function(featureId){
    	//inherited by sub-classes
    },
    
    filterFeatureIDs: function(featureIDs){ 
    	 return featureIDs;
    },
    
    showNewUserTour: function()
    {
    	concord.feature.FeatureController.showWelcomeDlg();
    },
    
    showNewFeatures: function()
    {
    	concord.feature.FeatureController.showNewFeatureDlg(true);
    },
    
    isPPTOrODP: function(){
    	var ext = DOC_SCENE && DOC_SCENE.extension ? DOC_SCENE.extension.toLowerCase() : null;
    	//odp ppt
    	if("odp" == ext || "ppt" == ext){
    		return true;
    	}
    	return false;
    },

    getMenuFeatureXPos: function(pos){
    	 return (BidiUtils.isGuiRtl() ? pos.x - 10 : pos.x + pos.w + 10);
    },
    
    showFileDetailMenu: function()
    {
    	return concord.util.uri.isCCMDocument() || concord.util.uri.isLCFilesDocument();
    },
    
    showShareMenu: function()
    {
    	return !(concord.util.uri.isECMDocument() || concord.util.uri.isExternal());    	
    },
    
    showNewMenu: function()
    {
    	return !(concord.util.uri.isICNDocument() || concord.util.uri.isExternal());
    },
    
    showDiscardMenu: function()
    {
    	return !(concord.util.uri.isECMDocument() || concord.util.uri.isExternal());
    },
    
    showRecentFilesMenu: function()
    {
    	return !(concord.util.uri.isECMDocument() || concord.util.uri.isExternalCMIS());
    	
    },
    
    showCheckinMenu: function()
    {
    	return (concord.util.uri.isECMDocument() || concord.util.uri.isExternalCMIS());    	
    },
    
    showSaveAsMenu: function()
    {
    	return !(concord.util.uri.isECMDocument() || concord.util.uri.isExternal());
    },
    
    showSetAutoPublishMenu: function()
    {
    	return pe.scene.autoPublishFeature() && (concord.util.uri.isLCFilesDocument() || concord.util.uri.isICNDocument() || concord.util.uri.isLocalDocument() || concord.util.uri.isExternalREST());
    },
    
    showSubmitReviewMenu: function()
    {
    	return concord.util.uri.isCCMDocument();
    },
    
    showPreferences: function()
    {
    	return concord.util.uri.isCCMDocument() || concord.util.uri.isLCFilesDocument() || concord.util.uri.isLocalDocument();
    },
    
    disableMenu: function(id, disable)
    {
		var menu = dijit.byId(id);
		if(menu)
		{
			menu.setDisabled(disable);
		}
    },
    
    showDownloadMenu: function()
    {
    	var bShowDownloadMenu = true;
    	if (typeof g_GatekeeperFeatures !== 'undefined' && 
    	  typeof g_GatekeeperFeatures.DisableDownload !== 'undefined' && 
    	  typeof g_GatekeeperFeatures.DisableDownload.enabled !== 'undefined')
    	{
    		bShowDownloadMenu = g_GatekeeperFeatures.DisableDownload.enabled === true ? false:true;
    	}
    	return bShowDownloadMenu;
    },
    getProblemId : function (response, ioArgs) 
    {
    	var problem_id = null ;
        try {
        	if (response && response.data && response.data.problem_id && response.data.problem_id != "") {
        		problem_id = response.data.problem_id;
        	}
        } catch (ex) {
            console.log("Error happens while get problem id from data .", ex);
        }
        if (problem_id == null || problem_id == "") {
            problem_id = ioArgs.xhr.getResponseHeader("problem_id");
        }
        return problem_id;
    },
    showProblemIDDiv : function (problem_id, key) 
    {
        return this.myHeader.showProblemIDDiv(problem_id, key);
    }
});
ViewMode = {
	HTMLVIEW:"html",
	VIEWDRAFT:"view",
	OBSERVER:"observer",
	COMPACTEDIT: "compact", // embedded Docs
	LIGHTEDIT: "light" // embedded Docs
}
