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

dojo.provide("concord.scenes.TextDocSceneMobile");

dojo.require("concord.scenes.TextDocScene");
dojo.require("concord.util.mobileUtil");
dojo.declare("concord.scenes.TextDocSceneMobile", [concord.scenes.TextDocScene], {
	insertDateDialog:null,
	insertTimeDialog:null,
	saveDlg:null,
	bNetworkIssue:false,
	bOffline:false,
	
	_minmizeLeft: 10,
	
	constructor: function(app, sceneInfo) {
		// add mobile dialog css file
//		CKEDITOR.document.appendStyleSheet(window.contextPath + window.staticRootPath +'/styles/css/mobile/mobileDialog.css');
	},
	
	render: function(){
		this.inherited(arguments);
		// enable spell check for layout engine mobile.
	    /*pe.settings.getAutoSpellCheck() && */spellcheckerManager && spellcheckerManager.setAutoScayt(true);
	    dojo.byId("header").style.display = 'none';
	    dojo.byId("banner").style.display = 'none';
	    var sidebar = dojo.byId("ll_sidebar_div");
	    if (sidebar)
	    	sidebar.style.display = 'none';
		var mFrame = dojo.byId("measureFrame");
		if(!mFrame)
		{
			var div = document.createElement("div");
			div.style.visibility="hidden";
			mFrame = document.createElement("iFrame");
			div.appendChild(mFrame);
			dojo.attr(mFrame, {"id": "measureFrame","style": "position:absolute; bottom:10000px; right:10000px;"});
			var mainNode = dojo.byId("mainNode");
			mainNode.appendChild(div);
		}
	    
		mFrame.style.display = 'none';
		dojo.byId("mainNode").style.marginTop = '0px';
	},
	
	getEditorLeft: function(isUpdate)
	{
		if(!isUpdate)
			this.resizeSidebarDiv();
		this.editorWidth = concord.util.mobileUtil.viewport.width;
		if(this.editorWidth == 0)
			return this._minmizeLeft;
		else
			return (this.editorWidth-768)/2;
	},
	
	instanceReady: function(event)
	{
		//just to overwrite base class function, to not init
		console.log("instanceReady in textmobile scene");
		
		var session = pe.scene.getSession();
		if (!session)
			return;
	    var url = session.url + "/parts/comments";
	    var commentsProxy = new concord.xcomments.TextCommentsProxy(url);
	    
		commentsProxy.registerCallback({
			handleStore: function(e)
			{
				var events = [];
				var params = e;
				events.push({"name":"comments", "params":params});
				concord.util.mobileUtil.jsObjCBridge.postEvents( events );
			},
			
			added: function(e)
			{
				console.log("comment added");
			},
			
			itemAppended: function(id, data)
			{
				console.log("comment appended");
			},
			
			itemUpdated: function(id, data)
			{
				console.log("comment updated");
			},
			
			removed: function(id)
			{
				console.log("comment removed");
			}
		});
		
		session.registerCommentsProxy(commentsProxy);
		
		console.log("comments proxy registered");
	},
	applySidebarSettings: function()
	{ 
		//just to overwrite base class function, to not init sidebar
		console.log("applySidebarSettings in textmobile scene");
	},
	checkHeaderFooter: function()
	{
		//just to overwrite base class function, to not init header/footer
		console.log("checkHeaderFooter in textmobile scene");
	},
	userJoined: function(user) {
		//just to overwrite base class function, to not init sidebar when new user join co-editing
		try {
        	pe.lotusEditor.execCommand("creatIndicatorSytle", {
        		"user": user.getId()
        	});
        } catch (e) { }
		
		console.log("userJoined in textmobile scene");
		
	},
	userLeft: function(user) {
		//just to overwrite base class function, to not init sidebar when new user join co-editing
		console.log("userLeft in textmobile scene");
	},
	
	_showMessage : function(text, interval, type) {
		// do nothing in mobile
		concord.util.mobileUtil.showMessage(text);
	},
	// network issue
	_showLockBox: function(errorCode) {
		if (errorCode == 1002) // no permission
		{
			concord.util.mobileUtil.postError(errorCode);
		}else{ // network issue
			//if(!this.bNetworkIssue){
				this.bNetworkIssue = true;
				concord.util.mobileUtil.networkIssue();				
			//}
		}
	},

	_hideLockBox: function() {
		this.bNetworkIssue = false;
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
		concord.util.mobileUtil.postError(-1,"",msgNls.kickout_user_content);
	},
	
	// override
	showPasteImgErrorDialog: function(msg,interval){
		concord.util.mobileUtil.showErrorMessage(msg);
	},
	// override
	showPasteTextErrorDialog: function(msg){
		concord.util.mobileUtil.showErrorMessage(msg);
	},
	_showOfflineDialog: function() {
		this.bOffline = true;
		concord.util.mobileUtil.networkIssue();
	},
	
	showBigFileErrorMsg: function(){
		concord.util.mobileUtil.showMessage(this.nls.bigFileErrMsg);
	},
	
	showVersionPublishedMessage: function() {
		this.inherited(arguments);
		pe.scene.updatePageCount(true);
		concord.util.mobileUtil.versionPublished();
	},
	
	showVersionPublishedFailedMessage: function(msg){
		concord.util.mobileUtil.showPublishFailedDialog(msg);
	},
	
	showLocalVersionPublishedMessage: function(userName) {
		var theMsg = concord.util.uri.isLCFilesDocument() ? this.nls.versionpublished: this.nls.versionpublished2;
		var msg = dojo.string.substitute(theMsg, [userName, concord.util.date.getTime()]);
		concord.util.mobileUtil.showMessage(msg);
	},
	
	uploadImage: function(url, width, height)
	{
	    var editor = pe.scene.getEditor();
		var element =  editor.document.createElement( 'img' );
		url = encodeURI(decodeURI( url ));
		element.setAttribute( 'src', url );
		element.setAttribute( '_cke_saved_src', url );
		var onLoad = function( )
		{
			SYNCMSG.beginRecord();
			try
			{
				element.setStyle( "width", ((width*0.75)/72)*2.54 + "cm" );
				element.setStyle( "height", ((height*0.75)/72)*2.54 + "cm" );
				var selection = editor.document.getSelection();
				var ranges =  selection.getRanges();						
				var node = MSGUTIL.getBlock(ranges[0].startContainer);
				var data = {'insert':element,'node': node, 'selection': selection };
				editor.fire('beforeInsert',data);
				element = data.insert;
				
				if( element )
					editor.insertElement( element );							
			}
			catch(e)
			{
				concord.text.tools.printExceptionStack(e);
			}

			var msg = SYNCMSG.endRecord();
			SYNCMSG.sendMessage(msg);
		};
		
		onLoad();
		element.on( 'load', function(){
			var events = [{"name":"dismissImageUploadDialog", "params":[]}];
			concord.util.mobileUtil.jsObjCBridge.postEvents(events);
		});
		
		element.setAttribute( '_cke_saved_src', element.$.src );
	},
	
	// MOBILE: disable welcome and unsupported dialogs in docs mobile editor
	showWelcomeOrUnsupportDialog: function()
	{
		// do nothing.
	},
	
	showFileFormatNotMatchDialog: function( params )
	{
		concord.util.mobileUtil.fileFormatNotMatchParams = params;
		// we post event and pop up dialog from the native code
		var events = [];
		events.push({"name":"fileFormatNotMatch"});
		concord.util.mobileUtil.jsObjCBridge.postEvents(events);
	}
	,
	//do not show any staging and loading box on mobile.
	staging: function()
	{
		return;
	},
	_showLoadingBox: function()
	{
		return;
	},
	_hideLoadingBox: function()
	{
		return;
	},
	
	commentsCreated: function (comments) {
		this.inherited(arguments);
		concord.net.Beater.beat(false,true,true);
	}
});
	