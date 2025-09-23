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
var ua = navigator.userAgent.toLowerCase();
dojo.isEdge = (ua.indexOf("edge") > 0);
        
dojo.provide("concord.scenes.TextDocScene");
dojo.require("concord.net.Session");
dojo.require("writer.constants");
dojo.require("writer.global");
dojo.require("writer.config.config");
dojo.require("writer.msg.msgCenter");
dojo.require("writer.msg.msgHandler");
dojo.require("concord.beans.Document");
dojo.require("concord.scenes.AbstractScene");

dojo.require("concord.util.date");
dojo.require("concord.util.browser");
dojo.require("concord.util.BidiUtils");

dojo.require("concord.editor.EditorExtend");
dojo.require("concord.widgets.CommentsEventListener");
dojo.require("concord.widgets.viewTextForHtmlPrint");

//dojo.require("concord.widgets.outline.outline");
dojo.require("concord.widgets.print.textPrintToPdf");
dojo.require("writer.controller.Editor");
dojo.require("writer.ui.menu.Menubar");
dojo.require("writer.ui.toolbar.Toolbar");
dojo.require("writer.ui.widget.ListStyle");
dojo.require("writer.ui.widget.TableTemplatePane");
dojo.require("writer.ui.widget.ColorPalette");
dojo.require("writer.ui.widget.ButtonDropDown");
dojo.require("writer.ui.widget.TablePicker");
dojo.require("writer.ui.widget.MenuTooltip");
dojo.require("concord.util.dialogs");
dojo.require("writer.ui.sidebar.SidePaneManager");
dojo.require("viewer.widgets.NavigatorBarManager");

dojo.require("writer.api");
//htmlviewer
if(DOC_SCENE && DOC_SCENE.mode && DOC_SCENE.mode == "html")
{
	dojo.require("viewer.widgets.DocPageIndicator");
	dojo.require("viewer.widgets.Actions");
}
dojo.require("concord.net.HtmlViewConnector");
dojo.declare("concord.scenes.TextDocScene", [concord.scenes.AbstractScene, concord.widgets.CommentsEventListener], {
	
	_minmizeLeft: 30,
	
	toggleSideBar: function()
	{
		if (this.isNote())
			return;
		this.inherited(arguments);
		var bar = pe.settings.getSidebar();
		if(!this.isEditCompactMode() && bar && bar == pe.settings.SIDEBAR_TC && this.toggleTrackChangePanel && pe.lotusEditor.setting.isTrackChangeOn())
			this.toggleTrackChangePanel();
	},

	constructor: function(app, sceneInfo) {
		this.app = app;
		this.sceneInfo = sceneInfo;
		this.bean = null;
		this.isEditable = false;
		this.bTrackAuthor = true;
		this.bCarriageReturn = pe.settings.getCarriageReturn();
		this.bShowBookMark = pe.settings.getShowBookMark();
		this.bShowNaviPanel = pe.settings.getShowNaviPanel();
		this.bIndicatorAuthor = pe.settings.getIndicator();
		this.sidePaneMgr = new writer.ui.sidebar.SidePaneManager();
		this.docType = "text";
		this.editPosition = {};
		this.toolbar=null;
		this.autoMergeText = true;
		//outline window
		this.outlineWin = null;
		// Check the file size after file content changed. 
		this.editorContentChanged = false;
		
		if(!window.g_maxHtmlSize || window.g_maxHtmlSize == 0)
			window.g_maxHtmlSize = 2097152;// 2048 * 1024;
		
		if(!window.g_maxCharacterCount || window.g_maxCharacterCount == 0)
			window.g_maxCharacterCount = 525312; // 513 * 1024
		
		this.locale = g_locale == "no" ? "nb" : g_locale; // dojo cldr uses 'nb' rather than 'no'
		
		concord.util.editor = new concord.editor.EditorExtend();
		
		this._note = DOC_SCENE.note;
		
		if (this._note)
		{
			var me = this;
			me._noteSub = dojo.subscribe(writer.constants.EVENT.LOAD_READY, function(){
				dojo.connect(window, "onresize", me, "resizeNote");
				dojo.unsubscribe(me._noteSub);
			});
		}
		
//		if (!this.isHTMLViewMode())
		{
			dojo.subscribe(writer.constants.EVENT.SELECTION_CHANGE, function(){
				writer.api.notify("*", "IDOCS.EVENT.selectionChange");
			});
			dojo.subscribe(writer.constants.EVENT.LOAD_READY, function(){
				writer.api.notify("*", "IDOCS.EVENT.contentReady", "text");
			});
		}
	},
	checkNoteSection: function(section){
		section.pageMargin.header = 0;
		section.pageMargin.footer = 0;
		section.pageMargin.top = 0;
		section.pageMargin.bottom = 0;
		section.pageMargin.left = 40;
		section.pageMargin.right = 40;
		var screenSize = dojo.window.getBox();
		section.pageSize.w = screenSize.w - 20;
		section.pageSize.h = 10000000;
		// console.warn(section.pageSize.w)
	},
	resizeNote: function()
	{
		clearTimeout(this._noteRelayoutTimer);
		this._noteRelayoutTimer = setTimeout(function(){
			pe.scene.checkNoteSection(pe.scene.noteSection);
			pe.lotusEditor.layoutEngine.rootView.updateSection(pe.scene.noteSection, null);
		}, 200);
	},
	isNote: function()
	{
		return this._note;
	},
	getLocale: function()
	{
		return this.locale;
	},
	getCurrUserId: function(){
		 return pe.authenticatedUser.getId();
	 },
	setTrackAuthor: function(bEnable){
		this.bTrackAuthor = bEnable;
	},
	setCarriageReturn: function(bEnable){
		this.bCarriageReturn = bEnable;
		if(pe.settings) pe.settings.setCarriageReturn(bEnable);
	},
	setShowBookMark: function( bEnable ){
		this.bShowBookMark = bEnable;
		if(pe.settings) pe.settings.setShowBookMark(bEnable);
	},
	setShowNaviPanel: function( bEnable ){
		this.bShowNaviPanel = bEnable;
		if(pe.settings) pe.settings.setShowNaviPanel(bEnable);
	},
	setIndicatorAuthor: function(bEnable){		
		this.bIndicatorAuthor = bEnable;
		if(pe.settings) pe.settings.setIndicator(bEnable);	
		if(!bEnable)
			this._usersColorStatus = {};
		dojo.publish(writer.constants.EVENT.COEDIT_COLOR_UPDATE);
	},
	setAutoTextMerge: function(bEnable){
		this.autoMergeText = bEnable;
	},
	isAutoMergeText: function(){
		return this.autoMergeText;
	},
	isTrackAuthor: function(){
		return this.bTrackAuthor;
	},
	isCarriageReturn: function(){
		return this.bCarriageReturn;
	},
	isShowBookMark: function(){
		return this.bShowBookMark; 
	},
	isShowNaviPanel: function(){
		return this.bShowNaviPanel; 
	},	
	isIndicatorAuthor: function(){
		return this.bIndicatorAuthor;
	},
	begin: function(oldScene) {
		this.nls = dojo.i18n.getLocalization("concord.scenes","Scene");
		this.authUser=this.app.authenticatedUser;
		if(this.authUser==null){// may never come to this statement
			console.info("null user");
		}else{
			if(!this.isHTMLViewMode()) {
				this.session = new concord.net.Session(this, this.sceneInfo.repository, this.sceneInfo.uri);
				this.editors = new concord.beans.EditorStore(null, null, null);	
			}
            this.show();
		}
	},

	_checkContentSize: function()
	{
//		var editor = this.CKEditor;
//		var interval = g_hbInterval * 10;
//		if( this.editorContentChanged && editor.contentLoaded && editor.document )
//		{
//			 var body = editor.document.getBody();
//			 var htmlLen = body.getHtml().length;
//			 if(htmlLen > g_maxHtmlSize)
//			 {
//				 this.showBigFileErrorMsg();
//				 interval = g_hbInterval * 2;
//			 }
//			 else if(htmlLen < g_maxHtmlSize * 0.7)
//			 {
//				 interval = interval * 6;
//				 //var characterLen = body.getText().length;
//				 //if(characterLen > g_maxCharacterCount )
//				//	this.showBigFileErrorMsg();
//				 //else if(characterLen < g_maxCharacterCount/2 && htmlLen < g_maxHtmlSize/2)
//				//	 interval = interval * 6;
//			 }
//				 
//			 this.editorContentChanged = false;
//		}
	},
		
	/*
	 * reset the global object
	 */
//	_resetGlobalObj:function(){
//		CKEDITOR.instances.editor1.contentLoaded = true;
//		CKEDITOR.instances.editor1.fire("resetUndo");
//		PROCMSG = new concord.text.ProcMsg();
//		TEXTMSG = new concord.text.TextMsg();
//	},
	/**
	 * abstract callback method, called when the document content is loaded/reloaded from server
	 * implementation should load the state to editor in this method
	 * ATTENTION: don't forget to clean all undo stack
	 */
	
	_assembleContent: function(state)
	{
		// For Unit test view
		var params = concord.util.uri.getRequestParameters();
		var testDoc = params.testDoc;
		if(testDoc && window.opener && window.opener.assembleContent)
		{
			window.opener.subDocloadFinished && window.opener.subDocloadFinished();
			return window.opener.assembleContent(testDoc);
		}

		var jsonCnt = {}, cnt = state.content;
		jsonCnt.content = cnt.content && cnt.content.body;
		jsonCnt.style = cnt.styles;
		jsonCnt.setting = cnt.settings ;
		jsonCnt.numbering = cnt.numbering ;
		jsonCnt.relations = cnt.relations ;
		
		return jsonCnt;
	},
	
	loadState: function(state) {
		dijit.setWaiRole(dojo.body(), 'application');
		dijit.setWaiState(dojo.body(), "labelledby", "doc_title_text");
		var editorFrame = document.getElementById('editorFrame');
        dijit.setWaiState(editorFrame, 'label','Edit Pane for ');
        dijit.setWaiState(editorFrame, 'labelledby','doc_title_text');
        if (!this.isHTMLViewMode())
        	this.bean = this.session.bean;
//		this._resetGlobalObj();	
		
		var jsonCnt = this._assembleContent(state);
		var editor = this.app.lotusEditor;
		editor.currentScene = this;
		editor.setData(jsonCnt);
		editor.startEngine(); 
		dojo.connect(document,'onkeypress',this,'onKeyPress');
//		dojo.connect(document,'onkeydown',this,'onKeyDown');
//		this.CKEditor.docBean = this.bean;
//		this.CKEditor.user = this.authUser;
//	
		// config for viewPage
//		CKEDITOR.config.viewPageURL = concord.util.uri.getDocViewModeUri();
	
		// Check Editor's content size
		this.editorContentChanged = true;
	},
	onKeyPress:function(evt)
	{
//		if(this.stopKeyEventInModalDlg(evt))
//			 return;
		if(evt.ctrlKey /*&& editor.fire('hotkey',evt) */ || (dojo.isMac && evt.metaKey) )
		{
			// #defect 20809
			if (evt.altKey) {
				return;
			}
			if (evt.charCode == 83 || evt.charCode == 115)
			{
				if(pe.scene.supportSaveShortCut())
					this.saveDraft();
				dojo.stopEvent(evt);
			}else if(evt.charCode == 80 || evt.charCode == 112)
			{
				this.printHtml(pe.lotusEditor);
				dojo.stopEvent(evt);
			}
		}else if(evt.keyCode == dojo.keys.PAGE_DOWN){
			//45044 [FF]focus should be on menu when menu pops up and edit window should not receive keyboard messages
			//dojo.stopEvent(evt);
		}else if(evt.shiftKey){
			if (evt.charCode == 113)
			{
				var sidebar = pe.scene.sidebar;
				if(sidebar){
					if(sidebar.isCollapsed()){
						pe.scene.toggleCommentsCmd();
					}else{
						sidebar.setSidebarFocus();
					}    				
				}else{
					pe.scene.toggleCommentsCmd();
				}
				dojo.stopEvent(evt);
			}
		}
		else if(evt.keyCode == 27)//ESC
		{
			 setTimeout(function(){pe.lotusEditor.focus();},0);
		}
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
		console.log("generateRestoreMsg is called but nothing to generate for document.");
		//var msg = SYNCMSG.createContentResetMsg();
//		var msg = writer.msg.msgCenter.createContentResetMsg();
//		return msg;
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
//		this._resetGlobalObj();
		var content = msg.updates[0].data;
		this.app.lotusEditor.restoreState();
//		CKEDITOR.instances.editor1.setData(content);

	},

	staged: function(success, response)
	{
		this.inherited(arguments);

  		if (success)
  		{  			
  			this.showChangeHistoryWarning();
  			if (!this.isHTMLViewMode())
  				this.session.join();
  			else
  			{
  				concord.net.HtmlViewConnector.join(null, this.getURI(), this);
  			}
  		}
	},

	end: function(newScene) {
	},
	
	show: function() {
		this.render();
	},
	
	setEditorConfig: function(){
		if(this.isHTMLViewMode())
			return;
		
		var uploadAttachmentUrl = this.session.url + "/att";
		writer.config.config.filebrowserImageUploadUrl = uploadAttachmentUrl;
		writer.config.config.imageBaseHref = concord.util.uri.getDocPageRoot();
		writer.config.config.urlUploaderUrl = uploadAttachmentUrl + "?method=paste";
	},

	// Implement the move element function
	_moveElement: function(element)
	{
		var oldX = oldY = newX = newY = null;
		var startX = startY = 0;
		var pos = {};
		var parentNode = element.parentNode;

		var that = this;
		var mouseMove = function(event) { 
			// Avoid mouse up in other place cause the mouse move handler can't be released.
			if(!that._mouseDown && that._mouseMoveHandler)
			{
				that._mouseDown = false;
				dojo.disconnect(that._mouseMoveHandler);
				that._mouseMoveHandler = null;
				return;
			}	
			
			newX = event.clientX;
			newY = event.clientY;
			pos.x = ((newX - oldX + startX) + "px");
			pos.y = ((newY - oldY + startY) + "px");
			dojo.style(parentNode, {
	        	"left": pos.x,
	        	"top": pos.y
			});
		};
		
		var mouseUp = function(event) {
			that._mouseDown = false;
			if(that._mouseMoveHandler)
			{
				dojo.disconnect(that._mouseMoveHandler);
				that._mouseMoveHandler = null;
			}
			
			if(that._mouseUpHandler)
			{
				dojo.disconnect(that._mouseUpHandler);
				that._mouseUpHandler = null;
			}
			
			dojo.cookie("floatingToolbarPosition", dojo.toJson(pos));
		};
		
		var mouseDown = function(event) {
			that._mouseDown = true;
			if(!that._mouseMoveHandler)
				that._mouseMoveHandler = dojo.connect(document, "onmousemove", mouseMove);
			
			if(!that._mouseUpHandler)
				that._mouseUpHandler = dojo.connect(element, "onmouseup", mouseUp);
			
			var position = concord.util.browser.getElementPositionInDocument( { $: parentNode} );
			startX = position.left;
			startY = position.top;
			oldX = event.clientX;
			oldY = event.clientY;
		};
		
		that._mouseDownHandler = dojo.connect(element, "onmousedown", mouseDown);
	},
	
	_createFloatingToolbar: function()
	{
		if(this._floatingToolbarHdl)
		{
			dojo.unsubscribe(this._floatingToolbarHdl);
			delete this._floatingToolbarHdl;
		}	
		// Load the position from cookie.
		var left = "300px";
		var top = "300px";
		var pos = dojo.cookie("floatingToolbarPosition");
		if(pos)
		{
			pos = dojo.fromJson(pos);
			left = pos.x || left;
			top = pos.y || top;
		}
		
		var floatingToolbarId = "lotus_editor_floating_toolbar";
		
		var style = "position:absolute; width:170px; height:80px; top:" + top + ";left:" + left + ";zIndex:9999;";
		style += "border:1px solid #ff5c00; border-radius:8px; box-shadow:10px 10px 5px #888888";
		
        var floatingToolbarNode = dojo.create("div", {"class":"docToolbar dijitToolbar ", "id": floatingToolbarId, "style":style});
        
        // Title with drag indicator and close button
        var titleContent = "Handy Toolbox";
        style = "cursor:move; border-bottom: 1px solid #e9e9e9; text-align: center; font-weight: bold; padding:2px; width:160px;";
        var titleNode = dojo.create("div", {innerHTML:titleContent, "style":style}, floatingToolbarNode);
        
        style = "float:right; cursor:pointer;";
        var closeBtnNode = dojo.create("span", {innerHTML: "X", "style":style}, titleNode);
        dojo.connect(closeBtnNode, "onclick", function() {
        	pe.scene.showFloatingToolbox(false);
        });
        
        this._moveElement(titleNode);
        
        // Toolbar item container
        var toolbarItemContainer = dojo.create("div", null, floatingToolbarNode);
        dojo.style(toolbarItemContainer, {
        	"padding": "0 5px 5px 5px"
        		});
        
        createFloatingToolbar(toolbarItemContainer, this.toolbar);
        
        var parent = dojo.byId("header");
        parent.appendChild(floatingToolbarNode);
	},
//	_createOutlineWin: function( page )
//	{
//		if( !this.outline )
//		{
//			this.outline = new concord.widgets.outline.outline();
//			this.outline.createOutlineWin( page );
//		}
//	},
	showFloatingToolbox: function(isShow)
	{
		var toolboxNode = dojo.byId("lotus_editor_floating_toolbar");
		if(isShow)
		{
			if(!toolboxNode)
				this._createFloatingToolbar();
			else
				dojo.style(toolboxNode, "display", "");
		}
		else if(!isShow && toolboxNode)
		{
			dojo.style(toolboxNode, "display", "none");
		}	
		
		dojo.cookie("floatingToolbarDisplay", isShow ? "show" : "hide");
		
		// Update menu state
		var domNode = pe.toolboxMenuItem.domNode;
		if(domNode)
		{
			dojo.toggleClass(domNode, "dijitCheckedMenuItemChecked", isShow);   
			dijit.setWaiState(domNode, "checked", isShow);
			pe.toolboxMenuItem.checked = isShow;
		}
	},

	getDocBean: function() {
		var bean;
		if (!this.isHTMLViewMode())
			bean = this.session.bean;
		else
			bean = this.bean;
		return bean;
	},

	render: function(){
    	var header = dojo.byId("header");	    
    	if(BidiUtils.isGuiRtl())
    		header.setAttribute('dir','rtl');

	    this.createHeader(this.nls.textdoc, header, "");

	    this.stage();

		var menubarNode = dojo.byId('lotus_editor_menubar');
		if (!menubarNode) {
			var	menubarNode = document.createElement('div');
			menubarNode.setAttribute('id', 'lotus_editor_menubar');
			header.appendChild(menubarNode);
			writer.global.createMenubar( 'lotus_editor_menubar');
		}

		var toolbarNode = document.createElement("div");
		toolbarNode.setAttribute('id','lotus_editor_toolbar');
		toolbarNode.className = 'dijit dijitToolbar docToolbar';
		header.appendChild(toolbarNode);
		this.toolbar = new writer.ui.toolbar.Toolbar();
		var mode = ((this.lightEditMode) ? writer.global.ToolbarConstant.ToolbarMode.LIGHT : writer.global.ToolbarConstant.ToolbarMode.ALL);
		writer.global.createToolbar( 'lotus_editor_toolbar', this.toolbar, null, mode);
        
//        if( dojo.cookie("floatingToolbarDisplay") == "show" ) 
//        	this._floatingToolbarHdl = dojo.subscribe(writer.constants.EVENT.FIRSTTIME_RENDERED, this, this._createFloatingToolbar);
        
        //create floating outline window
//        dojo.subscribe(writer.constants.EVENT.PAGECREATED, this, this._createOutlineWin );
    	
		var banner = dojo.byId("banner");
		
        if(this.isViewMode())
        {
            if (this.isViewCompactMode()) {
                dojo.style(header, "display", "none");
                dojo.style(banner, "display", "none");
                dojo.style(document.body, 'background', 'none transparent');
            } else {
                dojo.style(menubarNode, "display", "none");
                dojo.style(toolbarNode, "display", "none");
            }
        }
        
        if (this.isNote())
        {
        	dojo.style(header, "display", "none");
            dojo.style(banner, "display", "none");
            dojo.style(document.body, 'background', 'none transparent');
        }
		
		if (this.isEditCompactMode()) {
            dojo.style(banner, "display", "none");
            dojo.style(menubarNode, "display", "none");
		}
		
		if (this.compactEditMode) {
            dojo.style(toolbarNode, "display", "none");
		}

        var minusHeaderHeight = function(hBrowser)
		{
			var headerHeight = 0;
			if (header)
				headerHeight = dojo.isIE ? header.offsetHeight : header.clientHeight;
			
			var bannerHeight = 0;
			if (banner)
				bannerHeight = dojo.isIE ? banner.offsetHeight : banner.clientHeight;
			
			return hBrowser - bannerHeight - headerHeight;
		};
		//defect 43250
        var mainNode = dojo.byId("mainNode");
		var editorIframe = dojo.byId("editorFrame");
		// add scroll div for edit mode on ios browser 
		if (concord.util.browser.isIOSBrowser() && !pe.scene.isHTMLViewMode()) {
			var mobileFrameDiv = dojo.create("div", 
				{"id": "mobileIframeDiv", 
				"style":"-webkit-overflow-scrolling: touch; overflow:auto; height:100%"},
				mainNode);
			mobileFrameDiv.appendChild(editorIframe);
		}
        var bHeight = concord.util.browser.getBrowserHeight;
        var h = minusHeaderHeight( bHeight() );
        if (this.isViewCompactMode()) {
            h = bHeight();
        }
		mainNode.style.height = h + "px";
		editorIframe.style.height = h - 2 + "px";
		//this.app.lotusEditor = new writer.DocumentEditor();
		window.onresize=dojo.hitch(this,this.onWinResized,mainNode,minusHeaderHeight,bHeight);
		//TODO:
		this.setEditorConfig();
		var jsonEditor = new writer.controller.Editor();
		this.app.lotusEditor  = jsonEditor;
		//editorIframe.style.height = "100%";

		// htmlviewer
		if (this.isHTMLViewMode() && !concord.util.browser.isMobile() && !concord.util.browser.isMobileBrowser()) {
			dojo.subscribe(writer.constants.EVENT.LOAD_READY, this, this.createToolbar);
		}
	},
	createToolbar: function(){
		var actions=this.createActions();
		var pageIndicator=this.createPageIndicator();
		var manager=new viewer.widgets.NavigatorBarManager(actions,pageIndicator);
		manager.registerEvents();
	},
	
	createPageIndicator: function() {		
		var indicator = new viewer.widgets.DocPageIndicator({
			id: "T_PageIndicator",
			pageNum: pe.lotusEditor.currFocusePage.parent.pages.length(),
			currentPage: pe.lotusEditor.currFocusePage.pageNumber,
			viewManager: this
		});
		dojo.body().appendChild(indicator.domNode);
		indicator.position();
		return indicator;
	},	
	createActions: function(){		
		var actions = new viewer.widgets.Actions({
			id: "T_Actions",
			manager: this
		});
		dojo.body().appendChild(actions.domNode);
		actions.position();
		return actions;
	},	
	onWinResized:function(node,minus,bHeight){
		// Update the cache
		concord.util.browser.getBrowserWidth();
		if(node){
			var newHeight = minus( bHeight() );
			node.style.height = newHeight+"px";
			var editorIframe = dojo.byId("editorFrame");
			if (editorIframe)
				editorIframe.style.height = newHeight - 2 + "px";
		}
		
		this.resizeSidebarDiv();
		if (concord.util.browser.isMobileBrowser()) {
			pe.lotusEditor.onEditorResized();
			pe.lotusEditor.getSelection().scrollIntoView();
		}
		
	},
	instanceReady: function(event)
	{
		if (this.isHTMLViewMode())
			return;

		this.applySidebarSettings();
		this.sidebarShown();

		if(this.isShowNaviPanel() && !this.isEditCompactMode())
			this.toggleNaviPane();
	},
	sidebarShown: function(){		
		// move the editor area right
		this.resizeSidebarDiv();
	},
	insertPageNumber: function (editor){	
		
		var element = editor.document.createElement( 'span' );
		var idValue = writer.msg.msgHelper.getUUID(); 
		element.setAttribute("id", idValue );			
		element.setAttribute( "class", "ODT_PN" );
		element.setAttribute( "contenteditable", "false" );
		element.appendText('#');
		editor.insertElement( element );
				
  },

  coeditStarted: function() {
		this.inherited(arguments);
		this.coedit = true;
		if( pe.discardMenuItem )
			pe.discardMenuItem.attr('disabled', true);
		dojo.publish(writer.constants.EVENT.COEDIT_STARTED);		
	},
	
	coeditStopped: function() {
		this.inherited(arguments);
		this.coedit = false;
		if( pe.discardMenuItem && !DOC_SCENE.hasTrack)
			pe.discardMenuItem.attr('disabled', false);
		dojo.publish(writer.constants.EVENT.COEDIT_STOPPED);
	},
	
	processMessage: function(msg) {
		//LB_COM.processMessage(msg);
//		PROCMSG.receiveMessage(msg);
		writer.msg.msgHandler.receiveMessage(msg);
	},
	userJoinPostpone: function(user)
	{
		this.userJoined(user);
	},
	
	userJoined: function(user) {
		var editCell = dojo.byId('editorFrame'); 		
		if(editCell)
		{
		  this.inherited(arguments);	
    
          try {
        	pe.lotusEditor.execCommand("turnOnUserIndicator", {
        		"user": user.getId(),
        		notFocus:1
        	});
          } catch (e) { }
          
          dojo.publish(writer.constants.EVENT.COEDIT_USER_JOINED, [user.getId()]);
        }
        else
  	    {
  		  setTimeout(dojo.hitch(this, this.userJoinPostpone, user), 1000);
  	    }
	},
	
	userLeft: function(user) {
		this.inherited(arguments);	
		dojo.publish(writer.constants.EVENT.COEDIT_USER_LEFT, [user]);
	},
	
	/**
	 * inherited from AbstractScene
	 * put editor in readonly mode or not
	 */
	readonly: function(readonly) {
		// CKEDITOR.instances.editor1.readOnly( readonly );
	},

//	scrollToElement : function( event, elementId )
//	{
//		var editor = pe.lotusEditor;
//		var element = editor.document.getById( elementId );
//		if( element )
//		{
//			editor.focus();
//			var selection = editor.getSelection();
//			var range = selection.getRanges()[0];
//			if (range){
//				range.moveToElementEditStart( element );
//				range.select();
//			}
//			element.scrollIntoView( true );
//		}
//	},
	
//	identifyLocation : function( nodeId )
//	{
//		var doc = pe.lotusEditor.document;
//		var thisNode = doc.getById( nodeId );
//		if( thisNode == null ) return 'the document'; //TODO: NLS
//		
//		var node = thisNode;
//		var nodeName = node.getName();
//		
//		// Is it inside a table?
//		while( true )
//		{
//			if( node.type == CKEDITOR.NODE_ELEMENT )
//			{
//				var nodeName = node.getName();
//				if( nodeName == 'table' )
//				{
//					var caption = node.getFirst();
//					if( caption.getName() == 'caption' )
//					{
//						var captionText = caption.getText().replace( /^\s\s*/, '' ).replace( /\s\s*$/, '' );
//						if( captionText.length > 0 )
//							return { 'message' : 'table "' + captionText + '"', 'nodeId' : node.getId() }; //TODO: NLS
//						else
//							break;
//					}
//					else
//						break;
//				}
//				if( nodeName == 'body' )
//					break;
//			}
//			
//			node = node.getParent();
//		}
//		
//		// Is it under a header?
//		var headerNode = null;
//		var headerRegExp = new RegExp( '^h[1-9]$', 'i' );
//		var walkerRange = new CKEDITOR.dom.range( doc );
//		walkerRange.setStartAt( doc.getBody(), CKEDITOR.POSITION_AFTER_START );
//		walkerRange.setEnd( thisNode, 0 );
//		
//		var walker = new CKEDITOR.dom.walker( walkerRange );
//		while( walker.next() )
//		{
//			if( walker.current.type == CKEDITOR.NODE_ELEMENT )
//			{
//				if( headerRegExp.test( walker.current.getName() ) )
//					headerNode = walker.current;
//			}
//		}
//		
//		if( headerNode )
//			return { 'message' : 'section "' + headerNode.getText().replace( /^\s\s*/, '' ).replace( /\s\s*$/, '' ) + '"', 'nodeId' : headerNode.getId() }; //TODO: NLS
//		else
//			return { 'message' : 'the document' }; //TODO: NLS
//	},
//	
	saveAsDoc: function(editor)
	{
		concord.util.dialogs.showSaveAsDlg( 'text' );
	},
	
	getEditor: function()
	{
		return this.app.lotusEditor;
//		return this.CKEditor;
	},
	
	getDocClipBoard: function ()	{		
		return pe.scene.getClipBoard("doc");
	},
	
	resizeSidebarDiv : function(fontChanged)
	{
		if( this.sidePaneMgr.hasOpenedSidebar())
		{
			var width = this.sidePaneMgr.getWidth();
			this.sidePaneMgr.updateHeight(this.getSidebarHeight());
			this.sidebarResized(width);	
			concord.widgets.sidebar.SideBar.resizeSidebar();
		}
		else
		{
			this.sidebarResized(0);	
		}// Set editor position when window resized.	
	},

	getHeaderHeight: function(){
		var banner = dojo.byId("doc_header");
		return banner ? banner.offsetHeight : 0;
	},
	
	getMenubarHeight: function(){
		var menuBar = dojo.byId("lotus_editor_menubar");
		return menuBar ? menuBar.offsetHeight : 0;
	},
	
	getActionbarHeight: function(){
		var actionBar = dojo.byId("cke_top_editor1");
		return actionBar ? actionBar.offsetHeight : 0;
	},
	
	sidebarResized: function(w)
	{    
		if(w == 0 && this.sidePaneMgr.hasOpenedSidebar())
		{
			return;
		}
		var editCell = dojo.byId('editorFrame'); 				
		//var leftCell = dojo.byId('left_sidebar');
		var sideBar = dojo.byId("ll_sidebar_div");    
		var bW = concord.util.browser.getBrowserWidth(true);
		if(BidiUtils.isGuiRtl())
			dojo.style(editCell, "float", "right");
  
		//percentage width in IE just simply round up so it may hide the border a little
		if(dojo.isIE) 
		{
			//minus 1 to avoid that when the browser width is narrow side bar may hide the border a bit
			var eWIE = bW - w - 1; 
			if(editCell){
				dojo.style(editCell, "width", (eWIE > 0 ? eWIE: 0)+"px");    								
				this.editorWidth=eWIE;
			}

			if(sideBar)
				dojo.style(sideBar, "width", w+"px");
			this.sidePaneMgr.updateWidth(w + "px");
		}
		else
		{
			var eW = 100*(bW - w)/bW + "%";  
			var lW = 100*w/bW + "%";    	        
			if(editCell){
				dojo.style(editCell, "width", eW);				
				this.editorWidth=bW-w;
			}

			if(sideBar)
				dojo.style(sideBar, "width", lW);
			this.sidePaneMgr.updateWidth(lW);
		}
		this.updateEditor();
	},	
	
	addResizeListener:function(fn){
		if(!this.rListener) {
			this.rListener=[];			
		}
		this.rListener.push(fn);
	},
	
	getEditorLeft: function(isUpdate)
	{
		if(!isUpdate)
			this.resizeSidebarDiv();
		var left = BidiUtils.isGuiRtl() ? this._minmizeLeft*2/3 : this._minmizeLeft;
		var editor = this.getEditor();
		var scale = editor ? editor.getScale() : 1;
		var padding = 20;	// The padding from CSS
		var phw = editor ? editor.placeholder.w : 768 ;
		left = Math.max(left, (this.editorWidth-(phw + padding) *scale)/2);

		if(!BidiUtils.isGuiRtl() && this.isShowNaviPanel()){
			var naviWidth = this.getNaviPanelWidth();
			if(naviWidth)
				left = Math.max(left, naviWidth / scale);
		}

		return left;
	},

	updateEditor:function()
	{
		var updated = false;
		var newLeft = this.getEditorLeft(true);
		if(newLeft != this._oldLeft){
			updated = newLeft - this._oldLeft;
			this._oldLeft = newLeft;
			if(this.rListener){
				dojo.forEach(this.rListener,function(fn){
					fn && fn(newLeft);
				});
			}
		}
		return updated;
//		var docView = pe.lotusEditor.layoutEngine.rootView;
//		docView.docLeft=
//		docView.render(pe.lotusEditor._shell._mainNode.scrollTop);
	},

	getNaviPanelWidth: function() {
		var openPanel = this.naviMgr && this.naviMgr.getCurrentOpenPane();
		if(openPanel && openPanel.getPanelClientWidth)
			return openPanel.getPanelClientWidth();
	},

	getSidebarHeight: function() {
		return dojo.byId('editorFrame').offsetHeight - 2 + "px";		
	},
	
	commentsCreated: function (comments)
	{
		var editor = this.getEditor();
		editor.execCommand("addComment",comments);
	},
	
	commentsDeleted: function (commentsId)
	{
    	var editor = this.getEditor();
    	editor.execCommand("deleteComment",commentsId);
	},
	
	commentsAppended: function(commentsId, item)
	{
    	var editor = this.getEditor();
    	var appObj = {};
    	appObj.cid = commentsId;
    	appObj.item = item;
    	editor.execCommand("appendComment",appObj);	
	},
	
	commentsUpdated: function(commentsId, index, item)
	{
    	var editor = this.getEditor();
    	var appObj = {};
    	appObj.cid = commentsId;
    	appObj.index = index;
    	appObj.item = item;
    	editor.execCommand("updateComment",appObj);
	},	
	
	
	commentsSelected: function (commentsId, noFocus)
	{
		var editor = this.getEditor();
		var appObj = {};
		appObj.cid = commentsId;
		appObj.nofocus = noFocus;
		editor.execCommand("selectComment",appObj);
	},
	
	commentsUnSelected: function (commentsId)
	{
		var editor = this.getEditor();
		editor.execCommand("unselectComment",commentsId);
	},
	commentsCheckAddable: function ()
	{
		var editor = this.getEditor();
		return editor.execCommand("addableComment");		
	},
	toggleCommentsCmd: function()
	{
		this.commentsSelected(null); // reuse the selectComment to notify cmtservice
		this.inherited(arguments);
	},
	setFocus : function()
	{
//		if(!pe.scene.headerfooter || pe.scene.headerfooter.currentArea == 'text')
			this.getEditor().focus();	
	},
	getTaskHdl: function()
	{
		if(typeof pe.lotusEditor.getTaskHdl == 'undefined') return null;
		else return pe.lotusEditor.getTaskHdl();
	},
	updatePageCount: function(bForceUpdate){
		var rootView = window.layoutEngine.rootView;
    	var orgPageCount = rootView.getOriginalPageCount();
    	var pageCount = rootView.getPageCount();
    	if(bForceUpdate || (pageCount != orgPageCount && orgPageCount > 0))
		{
    		var msg = writer.msg.msgCenter.createPageCountMsg(pageCount); 
    		pe.scene.session.sendMessage(msg);
		}
	},
	beforeLeave: function() {
		this.updatePageCount();		 
		dojo.publish(writer.constants.EVENT.BEFORELEAVE);		
    	if (LOG.forceReport){
    		LOG.report();
    	}
    },
//    leave: function(){
//    	this.inherited(arguments);
    	
    	// In long distance case, refresh will destroy ckeditor and leave the gray screen to user for long time.
    	// To improve the user experience, temporary remove it.
//    	try{
//    		this.CKEditor && this.CKEditor.destroy(true);
//    	}
//    	catch(e){}
//    },
	getDraftDocContent:function(){
        var rText;
		var callback = function(r, io){};
        var docURL = concord.util.uri.getDocDraftUri(this, "true");

		var resp = dojo.xhrGet({
			url: docURL,
			handleAs: "text",
			sync: true,			
			timeout: 5000,
			load: callback,
			error: callback
		});
		if (resp.ioArgs.xhr.status == 200) {
			rText = resp.results[0];
		} else {
			console.log(" #### Load draft content error #####");
			rText = null;
		}
		return rText;
	},

	exportToMarkdown: function() {
		var md = pe.lotusEditor.document.convertToMD();
		this.exportToHttpRespWriter(this, document.title, "md", md.text);
	},
	// TODO Reimplement this function.
	printHtml: function() {
		openTextHtmlPrintWindow = function(printWindow) {
			var printView = new concord.widgets.viewTextForHtmlPrint(printWindow);
			printView.loadData();
		};

		closeTextHtmlPrintWindow = function() {
			//
		};		
		var location = window.location.href;
		var title = window.document.title;
		if(location.indexOf('?',4)>0)
			location += '&mode=htmlprint';
		else
			location += '?mode=htmlprint';
		
		var pages = pe.lotusEditor._shell.view().getPages();
		var pageWidth = pages.getByIndex(0).getWidth();
		if (pages.getByIndex(0).section.pageSize.orient) {
			for (var i = 0; i < pages.length(); i++) {
				if (!pages.getByIndex(i).section.pageSize.orient) {
					pageWidth = pages.getByIndex(i).getWidth();
					break;
				}
			}
		}
		var swidth = pageWidth;// screen.width - 200;
		
		var printWindow = window.open(location,
				'TextHtmlPrint_' + DOC_SCENE.jobId, 'height='+screen.height+',width='+swidth+',resizable=yes,menubar=yes,location=no,statusbar=no,scrollbars=yes');
	},
	
	getSidebarMenuItemId: function()
	{
		var sidebarMenuId = "D_i_Sidebar";
		return sidebarMenuId;
	},
	
	// TODO Reimplement this function.
	getPageSettings: function() {
		var settings = this.inherited(arguments);
		if(settings && settings['hasSet']) {
			return settings;
		}
		try {
			var ret = {};
			var body = pe.lotusEditor.document.$.body;
			var ml = body.style.paddingLeft;
			var mr = body.style.paddingRight;
			var mt = body.style.paddingTop;
			var mb = body.style.paddingBottom;
			
			// page-height, page width is not css2 properties, get them from style strings
			var h = null;
			var w = null;
//			var orientation = null;			
			var stylesStr = dojo.attr(body, 'style');
			var array = stylesStr? stylesStr.split(';') : [];
			for(var i=0; i< array.length; i++) {
				var str = array[i];
				var subarray = str.split(':');				
				if(subarray[0]) {
					var key = dojo.trim(subarray[0]).toLowerCase();
					if(key == "page-height") {
						h = subarray[1] ? dojo.trim(subarray[1]) : null;
					}
					if(key == "page-widths") {
						w = subarray[1] ? dojo.trim(subarray[1]) : null;
					}					
//					if(key == "print-orientation") {
//						orientation = subarray[1] ? dojo.trim(subarray[1]) : null;
//					}
				}				
			}
			var height = h? parseFloat(h.substring(0,h.length-2)) : null;
			var width = w? parseFloat(w.substring(0,w.length-2)) : null;
			
		
			ret.marginLeft = ml? parseFloat(ml.substring(0,ml.length-2)) : null;
			ret.marginRight = mr? parseFloat(mr.substring(0,mr.length-2)) : null;
			ret.marginTop = mt? parseFloat(mt.substring(0,mt.length-2)) : null;
			ret.marginBottom = mb? parseFloat(mb.substring(0,mb.length-2)) : null;
			ret.pageWidth = width;
			ret.pageHeight = height;
			ret.orientation = 'portrait';
			if(ret.pageWidth && ret.pageHeight && (ret.pageWidth > ret.pageHeight)) {
				ret.orientation = 'landscape';
			}
			return ret;
		}
		catch(exception) {
			return null;
		}
		
		return null;
	},
	
	// TODO Reimplement this function.
	disableViewModeMenuItems: function(disable) {
		this.inherited(arguments);
		var menuItems = [];
		menuItems.push(dijit.byId("D_i_Save"));
		menuItems.push(dijit.byId("D_i_SaveAs"));
		menuItems.push(dijit.byId("D_i_Cut"));
		menuItems.push(dijit.byId("D_i_Paste"));
		menuItems.push(dijit.byId("D_i_AddComment"));
		dojo.forEach(menuItems, function(menuItem) {
			if(menuItem) {
				if(disable) {
					menuItem.attr("disabled", true);
				}
				else {
					menuItem.attr("disabled", false);
				}
			}
		});
	},
	
	// TODO Reimplement this function.
	disableViewModeToolbar: function(disable) {
		this.inherited(arguments);
		// disable commands
		var commandList = ['undo', 'redo', 'cut', 'paste', 'bold', 'italic', 'underline', 'strike', 'decreasefont', 'increasefont',
		                   'replace', 'pagebreak', 'uploadimage', 'image', 'setHeadingButton', 'pcmd', 'h1cmd', 'h2cmd', 'h3cmd', 'h4cmd',
		                   'h5cmd', 'h6cmd', 'superscript', 'subscript', 'justifyleft', 'justifyright', 'justifycenter',
		                   'justifyblock', 'indent', 'outdent', 'specialchar', 'insertDate', 'insertTime', 'horizontalrule',
		                   'createTOC', 'multilevellist', 'bulletedlist', 'numberedlist', 'docTemplate', 'openOutLineDlg', 
		                   'addST', 'insertHeader', 'insertFooter','applyTableStyles', 'insertRowAfter', 'insertColAfter', 
		                   'uploadimage', 'link', 'unlink', 'toggleCommentsCmd', 'saveDraft', 'linespacing1', 'linespacing12', 'linespacing15', 'linespacing2'];
		dojo.forEach(commandList, function (commandName) {
			if (disable) {
				pe.lotusEditor.getCommand(commandName).setState(CKEDITOR.TRISTATE_DISABLED);
			}
			else {
				pe.lotusEditor.getCommand(commandName).setState(CKEDITOR.TRISTATE_OFF);
			}
		});
		// we need fire an event to change the some tool bar item state
		pe.lotusEditor.fire('editorModeChanged');
		// if disable is true, to disable the menu items for ViewMode
		// if disable is false, to enable the menu items for EditMode
	},	
	
	switchToViewMode: function() {
		this.inherited(arguments);
		if(spellcheckerManager) {
			spellcheckerManager.enableAutoScayt(false);	
		}
	},
	
	switchToObserverMode: function() {
		this.inherited(arguments);
		this.observerMode = this.sceneInfo.mode = true;
		if(spellcheckerManager) {
			spellcheckerManager.enableAutoScayt(false);	
		}
	},		
	
	switchToEditMode: function() {
		this.inherited(arguments);
        if(spellcheckerManager && pe.autoSpellCheckMenu) {
			  if( !(dojo.isSafari && dojo.isSafari < 5.1) && pe.settings.getAutoSpellCheck() )
			  {
				  pe.autoSpellCheckMenu.attr("checked", true);					  
				  spellcheckerManager.setAutoScayt(true);
			  }			        	
		}
	},
	showPasteImgErrorDialog: function(msg,interval){
		this.showErrorMessage(msg,interval);
	},
	showPasteTextErrorDialog: function(msg){
		concord.util.dialogs.alert(msg);
	},

    enabledTrackChange: function() {
    	return this.isIndicatorAuthor();
    },

    getUsersColorStatus: function(userId)
    {
    	return this._usersColorStatus && this._usersColorStatus[userId];
    },

    getUserIdbyIndicatorCSS: function(indClass){
    	var uid = null, cid = indClass.replace("ind", "");
    	var uStatus = pe.scene.getUsersColorStatus(cid);
    	if(uStatus)
    		uid = cid;
    	else if (this._usersColorStatus) {
    		for(var csKey in this._usersColorStatus){
    			var csStatus = this._usersColorStatus[csKey];
    			if(csStatus.key == cid){
    				uid = csKey;
    				break;
    			}
    		}
    	}
    	return uid;
    },

    turnOnColorShading: function(isTurnOn, userId) {
    	if (!this._usersColorStatus)
			this._usersColorStatus = {};
    	var status = {"on":isTurnOn};
    	if(isTurnOn)
    		status.key = userId.replace(/\W/g,"_");

		this._usersColorStatus[userId] = status;
    	pe.lotusEditor.execCommand("turnOnUserIndicator", {isTurnOn: status.on, userId: userId, notFocus:1}); 
    	
    	dojo.publish(writer.constants.EVENT.COEDIT_COLOR_UPDATE);
    },
    
    /**
     * #defect 32236 Update undo/redo stack client sequence in failover and reconnect case.
     * @param oldSeq Old client sequence
     * @param newSeq New client sequence
     * @param server_seq The current server sequence
     */
    updateClientSeqForUndoRedoStack: function(oldSeq, newSeq,server_seq) {
    	var stack = pe.lotusEditor.undoManager.getStack();
    	for (var i = 0; i < stack.length; i++)
    	{
    		var undoList = stack[i].undo;
    		var redoList = stack[i].redo;
    		for (var j = 0; j < undoList.length; j++)
    		{
    			var undo = undoList[j];
    			if(undo.client_seq == oldSeq)
    			{
    				undo.client_seq = newSeq;
    				undo.server_seq = server_seq;
    			}	
    		}
    		for (var j = 0; j < redoList.length; j++)
    		{
    			var redo = redoList[j];
    			if(redo.client_seq == oldSeq)
    			{
    				redo.client_seq = newSeq;
    				redo.server_seq = server_seq;
    			}
    		}
    	}
    },
    getSnapshotUpdateStr: function(){
		return this.nls.updateDocument;
	},
	appendHtmlActions: function(actions)
	{
		return;
		
//		var printList = document.createElement("li");
//		printList.setAttribute("id", "html_print");
//		var cmtBtn = new concord.widgets.LotusTextButton({label: this.nls.print, disabled:true, showLabel:false,iconClass:"htmlViewerPrintIcon", id: "html_print_btn", onClick: dojo.hitch(this, "htmlviewPrint")});
//		printList.appendChild(cmtBtn.domNode);
//		actions.appendChild(printList);
	},
	initReviewMenu: function()
	{
		this.inherited(arguments);
		var bReview = this.isNeedRenderSFR();
  		if(pe.reviewMenuItem)
  		{
  			pe.reviewMenuItem.setDisabled(!bReview);	
  		}  		
  		if(pe.publishMenuItem)
  		{
  			pe.publishMenuItem.setDisabled(bReview);
  		}
	},
    filterFeatureIDs: function(featureIDs){ 
    	var me = this;
    	return dojo.filter(featureIDs, function(id){
    		if (me.isNote())
    			return false;
    		if(id == "PUBLISH_BUTTON")
    		{
    			return pe.scene.myHeader.isPublishBtnShown();
    		}
    		if(id == "AUTO_PUBLISH" || id == "TEXT_AUTO_PUBLISH")
    		{
    			if(!pe.scene.autoPublishFeature())
    				return false;    			
    		}
    		if (id == "COMMON_COEDIT")
    		{
    			return (pe.scene.myHeader.getSharePosition() != null);	
    		}    
			if (id == "TEXT_TOOLBAR" || id == "TEXT_FormatPainter")
			{
				var toolbar = dojo.byId("lotus_editor_toolbar");
				if(!toolbar || toolbar.style.display == "none"){
					return false;
				}
			}	    		
    		return true;
    	});
    },
	getFeaturePosition: function(featureId){
		switch(featureId){
		case "TEXT_FormatPainter":
			{
				var toolbar = dojo.byId("lotus_editor_toolbar");
				var widget = dijit.byId("D_t_FormatPainter");
				if(toolbar && widget && widget.domNode){
					var toolbarPos = dojo.position(toolbar);
					var pos = dojo.position(widget.domNode);
					
					var x = BidiUtils.isGuiRtl() ? pos.x + pos.w : pos.x;
					var y = toolbarPos.y + pos.h + 9;
					return {x: x, y :y};
				}
			}
		case "TEXT_TOOLBAR":
		{
			var toolbar = dojo.byId("lotus_editor_toolbar");
			var children = toolbar.children[0].children;
			var lastDom = null;
			for(var i = children.length - 1; i >=0 ; i--)
			{
				var child = children[i];
				if (dojo.style(child, "display") != "none")
				{
					lastDom = child;
					break;
				}
			}
			if(lastDom){
				var pos = dojo.position(lastDom);				
				var x = this.getMenuFeatureXPos(pos);
				var y = pos.y + 5;
				return {x: x, y :y, m: 1};
			}
		}			
		case "TEXT_DOWNLOAD" :
		{
			var menubar = dijit.byId("document_menubar");
			var fileMenu = dijit.byId("D_m_File");
//			menubar.onItemClick(fileMenu, {type: "click"});
			menubar._openItemPopup(fileMenu, false);
			var subMenu = dijit.byId("D_i_Download");
			if(menubar && subMenu && subMenu.domNode) 
			{
				var pos = dojo.position(subMenu.domNode);
				var x = this.getMenuFeatureXPos(pos);
				var y = pos.y + 5;
				return {x: x, y: y, m: 1};
			}
		}
		case "TEXT_ClearFormat":
			{
			var menubar = dijit.byId("document_menubar");
			var fileMenu = dijit.byId("D_m_Format");
//			menubar.onItemClick(fileMenu, {type: "click"});
			menubar._openItemPopup(fileMenu, false);
			var subMenu = dijit.byId("D_i_ClearFormat");
			if(menubar && subMenu && subMenu.domNode) 
			{
				var pos = dojo.position(subMenu.domNode);
				var x = this.getMenuFeatureXPos(pos);
				var y = pos.y + 5;
				return {x: x, y: y, m: 1};
			}
			}
//		case "TEXT_SET_NUMBERING_VALUE":{
//			// Context menu item.
//			break;
//		}
		
		case "CREATE_BOOKMARK":{
			var menubar = dijit.byId("document_menubar");
			var fileMenu = dijit.byId("D_m_Insert");
//			menubar.onItemClick(fileMenu, {type: "click"});
			menubar._openItemPopup(fileMenu, false);
			var subMenu = dijit.byId("D_i_BookMark");
			if(menubar && subMenu && subMenu.domNode) 
			{
				var menuPos = dojo.position(menubar.domNode);
				var pos = dojo.position(subMenu.domNode);
				var x = this.getMenuFeatureXPos(pos);
				var y = pos.y + 5;
				return {x: x, y: y, m: 1};
			}
		}	
		case "TEXT_AUTO_PUBLISH":
		case "AUTO_PUBLISH": {
			var menubar = dijit.byId("document_menubar");
			var fileMenu = dijit.byId("D_m_File");
			var subMenu = dijit.byId("D_i_AutoPublish");
			menubar._openItemPopup(fileMenu, false);
			if(menubar && subMenu && subMenu.domNode) 
			{
				var pos = dojo.position(subMenu.domNode);
				var x = this.getMenuFeatureXPos(pos);
				var y = pos.y + 5;
				return {x: x, y: y, m: 1};
			}			
		}
		case "TEXT_LAYOUT": {
			var menubar = dijit.byId("document_menubar");
			var fileMenu = dijit.byId("D_m_Insert");
			var subMenu = dijit.byId("D_i_Pagebreak");
			menubar._openItemPopup(fileMenu, false);
			if(menubar && subMenu && subMenu.domNode) 
			{
				var pos = dojo.position(subMenu.domNode);
				var x = this.getMenuFeatureXPos(pos);
				var y = pos.y + 5;
				return {x: x, y: y, m: 1};
			}			
		}	
		case "COMMON_TOUR": {
			var menubar = dijit.byId("document_menubar");
			var fileMenu = dijit.byId("D_m_Help");
			var subMenu = dijit.byId("D_i_HelpTour");
			menubar._openItemPopup(fileMenu, false);
			if(menubar && subMenu && subMenu.domNode) 
			{
				var pos = dojo.position(subMenu.domNode);
				var x = this.getMenuFeatureXPos(pos);
				var y = pos.y + 5;
				return {x: x, y: y, m: 1};
			}			
		}	
		case "PUBLISH_BUTTON":
		{
			return this.myHeader.getPublishPosition();	
			break;
		}
		case "COMMON_COEDIT":
		{
			return this.myHeader.getSharePosition();	
			break;
		}
		case "TEXT_COMMENT":
		{
			return this.myHeader.getCommentPosition();	
			break;
		}		
		case "TEXT_MORE_CO_EDITORS": {
			var container = dojo.byId("editorFrame");
			if (container) {
				var containerPos = dojo.position(container);
				var x = containerPos.x + containerPos.w - 270;
				var y = containerPos.y + 30;
				return {x : x, y : y, r: 1};
			}
		}
		case "TEXT_PARA_CONTROL": {
			var menubar = dijit.byId("document_menubar");
			var fileMenu = dijit.byId("D_m_Format");
			var subMenu = dijit.byId("D_i_ParaProp");
			menubar._openItemPopup(fileMenu, false);
			fileMenu.popup._openItemPopup(subMenu, false);
			subMenu.attr("disabled", false);
			if(menubar && subMenu && subMenu.domNode && subMenu.popup && subMenu.popup.domNode) 
			{
				var pos = dojo.position(subMenu.popup.domNode);
				var x = this.getMenuFeatureXPos(pos);
				var y = pos.y + 5;
				return {x: x, y: y, m: 1};
			}			
		}
		case "TEXT_TABLE_BORDERS":{
			var toolbar = dojo.byId("lotus_editor_toolbar");
			var widget = dijit.byId("D_t_CellBorder");
			if(!widget || !widget.domNode || dojo.hasClass(widget.domNode,"toolbar_hidden") || dojo.hasClass(widget.domNode,"toolbar_disabled")){
				widget = dijit.byId("D_t_InsertTable");
			}
			if(toolbar && widget && widget.domNode){
				var pos = dojo.position(widget.domNode);
				var x = BidiUtils.isGuiRtl() ? pos.x + pos.w - 3: pos.x + 3;
				var y = pos.y + pos.h + 9;
				return {x: x, y :y};
			}
		}
		case "TEXT_TRACK_CHANGE":{
			var menubar = dijit.byId("document_menubar");
			var teamMenu = dijit.byId("D_m_Team");
			var subMenu = dijit.byId("D_i_TrackChange");
			menubar._openItemPopup(teamMenu, false);
			if(menubar && subMenu && subMenu.domNode) 
			{
				var pos = dojo.position(subMenu.domNode);
				var x = this.getMenuFeatureXPos(pos);
				var y = pos.y + 5;
				return {x: x, y: y, m: 1};
			}
		}
		}
		return this.inherited(arguments);
    },
    afterFeatureShow: function(featureID)
	{
		switch(featureID) {
			case "TEXT_ClearFormat":
			case "TEXT_PARA_CONTROL":
			{
				var fileMenu = dijit.byId("D_m_Format");
				if (fileMenu && fileMenu.popup && fileMenu.popup._cleanUp)
					fileMenu.popup._cleanUp(true);
				var menubar = dijit.byId("document_menubar");
				menubar._cleanUp(true);
				break;
			}
			case "TEXT_LAYOUT":
			case "CREATE_BOOKMARK": 
			{
				var menubar = dijit.byId("document_menubar");
				var fileMenu = dijit.byId("D_m_Insert");
				if (fileMenu && fileMenu.popup && fileMenu.popup._cleanUp)
					fileMenu.popup._cleanUp(true);
				menubar._cleanUp(true);
				break;
			}
			case "TEXT_DOWNLOAD":
			case "AUTO_PUBLISH":	
			case "TEXT_AUTO_PUBLISH":
			{
				var menubar = dijit.byId("document_menubar");
				var fileMenu = dijit.byId("D_m_File");
				if (fileMenu && fileMenu.popup && fileMenu.popup._cleanUp)
					fileMenu.popup._cleanUp(true);
				menubar._cleanUp(true);
				break;
			}
			case "COMMON_TOUR":
			{
				var menubar = dijit.byId("document_menubar");
				var helpMenu = dijit.byId("D_m_Help");
				if (helpMenu && helpMenu.popup && helpMenu.popup._cleanUp)
					helpMenu.popup._cleanUp(true);
				menubar._cleanUp(true);
				break;
			}
			case "TEXT_TRACK_CHANGE":
			{
				var menubar = dijit.byId("document_menubar");
				var teamMenu = dijit.byId("D_m_Team");
				if (teamMenu && teamMenu.popup && teamMenu.popup._cleanUp)
					teamMenu.popup._cleanUp(true);
				menubar._cleanUp(true);
				break;
			}
		}
		
	},
	showPublishDialog: function()
	{
		pe.lotusEditor.execCommand( 'publishDialog' );
	},
	createTooltip: function(widget, str, pos, onHeader)
	{
	    new writer.ui.widget.MenuTooltip({
	    	widget : widget,	        
	        label: str,
	        position: pos,
	        onHeader: onHeader
	    });
	},
	  /**
	* apply settings after document was loaded.
	*/
	applySidebarSettings: function()
	{ 
		var bar = pe.settings? pe.settings.getSidebar() : null;		
		if(!this.isEditCompactMode() && bar && pe.scene.getSidebar() && bar == pe.settings.SIDEBAR_TC 
			&& this.toggleTrackChangePanel && pe.lotusEditor.setting.isTrackChangeOn())
			this.toggleTrackChangePanel();
		else 
			this.inherited(arguments);
	},

	toggleNaviPane: function(settingRef){
		pe.lotusEditor.execCommand("toggleNavigation", settingRef);
	},

	hasChangeHistory: function() {
    	return DOC_SCENE.hasTrack;
    },

    showChangeHistoryWarning: function(){
		if(DOC_SCENE.showTrackWarning)
		{
			var msg;
			if (DOC_SCENE.ownerId === window["pe"].authenticatedUser.getId()) {
				msg = this.nls.changeHistoryWarningMsgForOwner;
			} else {
				var fileOwner = ProfilePool.getUserProfile(DOC_SCENE.ownerId);
				var name = fileOwner.getName();
				msg =  dojo.string.substitute(this.nls.changeHistoryWarningMsg,[name]);
			}
			var dlg = new concord.widgets.SingletonConfirmBox(this, this.nls.aclWarningTitle, null, false, 
					{message: msg,imageclass:"warningPhoto", errorContentStyle:"padding:10px",msgsDivStyle:"margin-left:35px"});
			dlg.show();
		}

		if(this.hasChangeHistory() && this.isHTMLViewMode()){
			this.showViewInfoMessage(this.nls.viewChangeHistory, 0, true, "viewChangeHistory");
		}
    },

    setChangeHistoryState: function(state){
    	DOC_SCENE.hasTrack = state;
    	pe.discardMenuItem && pe.discardMenuItem.setDisabled(this.coedit || state);
    }
    
});

if (window.g_reloadLog || window.g_concordInDebugMode)
{
	window.errorLogs = [];
	var console_error = console.error;
	console.error = function () {
		var args = Array.prototype.slice.call(arguments);
		console_error.apply(this, args);
		errorLogs.push({type: "console", obj: args});
	};
	window.onerror = function(message, file, line, col, error)
	{
		var args = Array.prototype.slice.call(arguments);
		errorLogs.push({type: "uncaught", obj: args});
		return false;
	}
}