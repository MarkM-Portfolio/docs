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

dojo.provide("concord.scenes.SheetDocScene");

dojo.registerModulePath("websheet", "../wseditor/js");
//dojo.require("dojox.cometd");
dojo.require("websheet.Main");
dojo.require("websheet.Utils");
//dojo.require("websheet.Toolbar");
//dojo.require("websheet.widget.FormulaBar");
dojo.require("websheet.TaskManager");
//dojo.require("websheet.widget.ScSpellCheckDlgHandler");
dojo.require("concord.beans.Document");
dojo.require("concord.scenes.AbstractScene");
dojo.require("concord.widgets.CommentsEventListener");
dojo.require("concord.util.browser");
dojo.require("concord.util.user");
dojo.require("concord.beans.ProfilePool");
dojo.require("concord.net.HtmlViewConnector");
dojo.require("concord.widgets.MessageBox");
//dojo.require("dijit.form.Button");
//dojo.require('dijit.MenuBar');
//dojo.require('dijit.MenuBarItem');
//dojo.require('dijit.PopupMenuBarItem');
//dojo.require('dijit.Menu');
//dojo.require('dijit.MenuItem');
//dojo.require('dijit.PopupMenuItem');
dojo.require("dojo.i18n");
dojo.require("dojo.cookie");
dojo.require("concord.util.BidiUtils");
dojo.require("websheet.widget.MenuTooltip");
dojo.requireLocalization("websheet","base");
dojo.requireLocalization("concord.scenes","Scene");
dojo.declare("concord.scenes.SheetDocScene", [concord.scenes.AbstractScene,concord.widgets.CommentsEventListener], {

    showSwitch:false,
    templateDlg:null,
    bMobile: false, // the sheet doc scene is enabled for mobile version
    bJSMobileApp: false,	// differentiate the mobile native and js implementation,
    constructor: function(app, sceneInfo){
		this.app = app;
        this.sceneInfo = sceneInfo;
        this.bean = null;
        this.editor = null;
        this.isEditable = false;
        this.docType = "sheet";
        this.coedit = false;
        this.leaveData = null;
        // one copy of the participant list to keep the information of user who lefts
        this.participantList = null;
        this.locale = g_locale == "no" ? "nb" : g_locale; // dojo cldr uses 'nb' rather than 'no'
        var sheetLocale = dojo.cookie("sheetLocale");
        this.setLocale(sheetLocale);
        this._nls = dojo.i18n.getLocalization("websheet","base");
        this.bMobile = concord.util.browser.isMobile();
        this.bMobileBrowser = concord.util.browser.isMobileBrowser();
        
        var ua = navigator.userAgent.toLowerCase();
        dojo.isEdge = (ua.indexOf("edge") > 0);
        dojo.isWebKit = dojo.isWebKit && !dojo.isEdge;
        
//        if(!this.isHTMLViewMode())
        {
   			dojo.subscribe(websheet.Constant.APIEvent.SELECTION_CHANGE, function(){
   				websheet.api.notify("*", "IDOCS.EVENT.selectionChange");
   			});
   			dojo.subscribe(websheet.Constant.APIEvent.LOAD_READY, function(){
   				websheet.api.notify("*", "IDOCS.EVENT.contentReady", "sheet");
   			});
        }
    },

    //	DOC_TYPE : "sheet",
    
    begin: function(oldScene){    	
        this.nls = dojo.i18n.getLocalization("concord.scenes","Scene");
        this.authUser = this.app.authenticatedUser;
        
        if (this.authUser == null) {// may never come to this statement
            console.info("null user");
        }
        else {
        	var bView = this.isHTMLViewMode();
	    	if (!bView)
            	this.session = new concord.net.Session(this, this.sceneInfo.repository, this.sceneInfo.uri);
            // override settings in both view mode and mobile client
            if (this.isHTMLViewMode() || this.bMobile) {
            	window["pe"].settings = new websheet.view.Settings();
            }
            this.show();
            if (!bView)
            	this.editors = new concord.beans.EditorStore(null, null, null);	
        }
    },
    
    end: function(newScene){
    },
    
    show: function(){
        this.render();
    },

    stage: function()
    {
    	if(this.isHTMLViewMode())
    	{
    		//workround: As HTML viewer has no loading dialog, use tooltip instead to avoid white page.
    		this.showWarningMessage(this.nls.loadMsg);
    	}
    	this.inherited(arguments);
    },
    staged: function(success, response)
	{
		this.inherited(arguments);
		
  		if (success)
  		{
			// FIRST LOAD loading message, will be cleared in Base._postRender
  			this.showWarningMessage(this.nls.loadMsg);
			this.showACLWarning();
			var criteria = this.getUpdatedCriteria(true);
			
			this.join(criteria);
  		}
	},

	/*PartialLevel*/getPartialLevel: function() {
		// TODO - partialLevel would be set to the SHEET LEVEL if run within webview in offline
		return window.g_partialLevel;
	},
		
	getUpdatedCriteria: function(bFirst)
	{
		try
		{
			var criteria;
			var partialLevel = this.getPartialLevel();
			var wpConst = websheet.Constant.PartialLevel;
			
			switch (partialLevel)
			{
			case wpConst.ALL:
				criteria = null;
				break;
			case wpConst.SHEET:
				criteria = { "sheet": /* get the first sheet */ "first" };
				break;
			default:
				// row
				criteria = { "sheet": /* get the first sheet */ "first" };
				if (window.g_partialRowCnt > 0) {
					criteria["startrow"] = 1;
					criteria["endrow"] = window.g_partialRowCnt;
				}
				break;
			}
			
			if (criteria) {
				if (bFirst) {
					if (g_lastSheet) {
						criteria.name = g_lastSheet;
					}
					// else do nothing
				} else {
					// not first time load, set to current sheet
					criteria.name = this.editor.getCurrentGrid().getSheetName();
				}
			}
			
			return criteria;
		}
		catch (e)
		{
			console.error("can't get updated criteria, ", e);
			return null;
		}
	},
	
	showACLWarning: function()
	{
		if(DOC_SCENE.showACLWarning)
		{
			var msg;
			if (DOC_SCENE.ownerId === window["pe"].authenticatedUser.getId()) {
				msg = this.nls.aclWarningMsgForOwner;
			} else {
				var fileOwner = ProfilePool.getUserProfile(DOC_SCENE.ownerId);
				var name = fileOwner.getName();
				msg =  dojo.string.substitute(this.nls.aclWarningMsg,[name]);
			}
			var dlg = new concord.widgets.SingletonConfirmBox(this, this.nls.aclWarningTitle, null, false, 
					{message: msg,imageclass:"warningPhoto", errorContentStyle:"padding:10px",msgsDivStyle:"margin-left:35px"});
			dlg.show();
		}	
		
		if(DOC_SCENE.hasACL && this.isHTMLViewMode()){
			this.showViewInfoMessage(this.nls.viewProtectedAreas, 0, true, "viewACL");
		}
	},
	
	showMacroWarning: function()
	{
		var dlg = new concord.widgets.SingletonConfirmBox(this, this.nls.macroTitle, null, false, 
				{message: this.nls.macroDesc, errorContentStyle:"padding:10px",msgsDivStyle:"margin-left:35px"});
		dlg.show();	
	},
	
	/**
	 * abstract callback method, called when the document content is loaded/reloaded from server
	 * implementation should load the state to editor in this method
	 * ATTENTION: don't forget to clean all undo stack
	 */
	loadState: function(state) {
		var criteria = {sheet:state.content.meta.loadedSheet};
		this.editor.loadDocument(state.content, criteria, true);//bJoin = true
		dijit.setWaiRole(dojo.body(), 'application');
		dijit.setWaiState(dojo.body(), "labelledby", "doc_title_text");
		var sheetDiv = document.getElementById('sheet_node');		
        dijit.setWaiRole(sheetDiv,'region');
        dijit.setWaiState(sheetDiv, 'label','Edit Pane for ');
        dijit.setWaiState(sheetDiv, 'labelledby','doc_title_text');
		// reset undo
        this.editor.getUndoManager().reset();
		//reset image handler's imageDiv map
        this.editor.getDrawFrameHdl().reset();
		
		document.title = this.bean.getTitle();
		dojo.connect(document,'onmouseup',this,'onMouseUp');
		dojo.connect(document,'onkeypress',this,'onKeyEvent');
		dojo.connect(document,'onkeydown',this,'onKeyEvent');
		dojo.connect(document,'onkeyup',this,'onKeyUp');
		
		// do not use td cell style anymore for canvas enablement
//		// init default cell styles, styles are initialized in current timer so it is safe to read them now
//		var dcs = websheet.style.DefaultStyleCode;
//		if (dcs) {
//			// override ".dojoxGridRowTable td" with customized default cell styles
//			var dcsCssStr = dcs.toCssString();
//			var cssStr = ".dojoxGridRowTable td { " + dcsCssStr + " }";
//			websheet.Utils.insertCssStyle(cssStr);
//			
//			// override JK ".dojoxGridRowTable td" with customized font name
//			var font = dcs._getAttrValue(websheet.Constant.Style.FONTNAME);
//			if (font)
//			{
//				font = font.replace(/[<>'"]/g, "");
//				cssStr = ".lotusJapanese .dojoxGridRowTable td {font-family:\"" + font + "\";}\n.lotusKorean .dojoxGridRowTable td {font-family:\"" + font + "\";}";
//				websheet.Utils.insertCssStyle(cssStr);
//			}
//		}
		
		var settings = window["pe"].settings;
		var sidebarState = settings? settings.getSidebar() : null;
		if (sidebarState && sidebarState == settings.SIDEBAR_OPEN && (!this.isDocViewMode() && !this.isEditCompactMode()) && !this.bMobileBrowser) {
			// do not set timeout here, otherwise sidebar will have the focus and make new feature tour disappeared
			this._openSidebar();
//			 set time out to open sidebar to improve initial load performance
//			setTimeout(dojo.hitch(this, "_openSidebar"), 1000);
		}
		
		if (!this.isHTMLViewMode() && !DOC_SCENE.showACLWarning && ("xlsm" == DOC_SCENE.extension || state.content.meta.hasMacro)) {
			setTimeout(dojo.hitch(this, "showMacroWarning"), 10);
		}
	},
	
	_openSidebar: function() {
		dojo["require"]("concord.concord_sheet_widgets");
		this.applySidebarSettings();
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
		// TODO to implement a "real" restore message for server
		
		// we don't know how to "restore" client document state to server,
		// so nothing to do here, we just accept server document JSON data and reset the state to server seq
		// this is the same logic as reconnect-reload.
		console.log("generateRestoreMsg is called but nothing to generate for spreadsheet.");
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
		// TODO spreadsheet not supported yet
	},

	join: function(criteria) {
		if (!this.isHTMLViewMode())
			this.session.join(criteria);
		else {
			// html viewer
			concord.net.HtmlViewConnector.join(criteria, this.getURI(), this);
		}
	},
	
	partialLoad: function(callback, criteria) {
		if (!this.isHTMLViewMode()) 
			this.session.getPartial(callback, criteria);
		else {
			// html viewer
			concord.net.HtmlViewConnector.getPartial(callback, criteria);
		}
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
	
	getDocBean: function() {
		var bean;
		if (!this.isHTMLViewMode())
			bean = this.session.bean;
		else
			bean = this.bean;
		return bean;
	},
	
	
    render: function(){
    	var mainSheetNode = dojo.byId("mainNode");
    	
		this.createHeader(this.nls.sheetdoc, mainSheetNode);
		//After creating Docs header, try to fetch content data  
		this.stage();
		
		var toolBar = null;
		var formulaBar = null;
		if (!this.bMobile) {
			// To display more columns on mobile browser, adjust it's scale per sreen width; Currently to display column G.
			(concord.util.browser.isMobileBrowser() && pe.scene && pe.scene.isHTMLViewMode()) && !dojo.isSafari &&
			    concord.util.mobileUtil.viewport.init(588, screen.width);

			//fixed body position to prevent 'shake' when focus dijit/concord elements, the 'shake' of sheet is actually scroll of the body.
			dojo.style(dojo.body(), {position : 'fixed', width: '100%', height: '100%', overflow: 'hidden'});
			var menuBarNode = this.createMenuBarNode();
    	    mainSheetNode.appendChild(menuBarNode);
			var toolBarNode = this.createToolBarNode();
			mainSheetNode.appendChild(toolBarNode);
				
			toolBar = new websheet.Toolbar();
	        createMenubar(this, 'lotus_editor_menubar');
	        var mode = null;
	        if (this.lightEditMode) mode = websheet.Constant.ToolbarMode.LIGHT;
    	    createToolbar(this, 'lotus_editor_toolbar',toolBar, mode, "S_t");

			var formulaBarNode = document.createElement("div");
			formulaBarNode.setAttribute("id","formulaBar_node");
			formulaBarNode.setAttribute("class","formulaBar");
			dijit.setWaiRole(formulaBarNode,'region');
			var bnls = dojo.i18n.getLocalization("websheet","base");
			dijit.setWaiState(formulaBarNode, "label", bnls.acc_formulaBarLabel);
			mainSheetNode.appendChild(formulaBarNode);
			formulaBar = new websheet.widget.FormulaBar({});
			if(BidiUtils.isGuiRtl()) {
 	 			toolBarNode.setAttribute('dir','rtl');
				mainSheetNode.setAttribute('dir','rtl');
				formulaBar.nameBoxNode.setAttribute('dir','ltr');
			}
			formulaBarNode.appendChild(formulaBar.domNode);
	    }
		
        if (this.isViewCompactMode()) {
            var header = dojo.byId("header");
            var banner = dojo.byId("banner");
            dojo.style(header, "display", "none");
            dojo.style(banner, "display", "none");
            dojo.style(document.body, 'background', 'none transparent');
        }
        
        if (this.isEditCompactMode()) {
            var header = dojo.byId("header");
            var banner = dojo.byId("banner");
            var menubar = dojo.byId("S_m");
            dojo.style(header, "display", "none");
            dojo.style(banner, "display", "none");
            dojo.style(menubar, "display", "none");
            dojo.style(formulaBar.domNode, "display", "none");
        }
	    
        var sheetNode = document.createElement("div");
        sheetNode.setAttribute("id", "sheet_node");       
//        document.body.appendChild(sheetNode);        
        mainSheetNode.appendChild(sheetNode);
        this.loadCommentsImg();

		var height = this.getWorksheetHeight();
		var floatValue = (BidiUtils.isGuiRtl()) ? 'right' : 'left';
		var size = "width: 100%;height:"+ height +";float:"+ floatValue + ";z-index:100;";
		if (this.bMobile) {
			// with the position given here, not set z-index,
			// otherwise the comments tooltip with z-index 1 can not be show, because comments also set position
			size = "position: fixed;width: 100%;height:"+ height +";";
			if(!this.bJSMobileApp)
				dojo.addClass(dojo.body(), "websheetMobile");
		}

        var editor = new websheet.Main({
        		scene: this,
        		settings: window["pe"].settings,
        		style: size,
        		maxRow: parseInt(g_maxSheetRows),
        		partialLevel: this.getPartialLevel(),
            	user: this.authUser,
            	toolBar:toolBar,
            	formulaBar: formulaBar
        	}, "sheet_node");
        editor.setStatusBar(new websheet.widget.StatusBar({editor : editor}, dojo.create("div", null, 'sheet_node')));
        editor.startup();
        window["pe"].lotusEditor = editor; // being compatible
        this.editor = editor;
        
        createGridContextMenu(editor);
        createSheetContextMenu(editor);
        if (!this.bMobile) {
    	    toolBar.refreshUndoRedoIcon();
        	toolBar.disableSortIcon();
//	        toolBar.refreshMergeCellIcon(true);
		}
		
        this.setImageUploadUrl();
        this.setTextFileUploadUrl();
        
        this.disableEdit();
    },
    /**
     * Mobile will override it
     * @returns
     */
    createMenuBarNode:function(){
    	var div = document.createElement('div');
        div.setAttribute('id', 'lotus_editor_menubar');
        dijit.setWaiRole(div,'menubar');
        dijit.setWaiState(div,'label',this._nls.acc_menubarLabel);
        return div;
    },
    /**
     * Mobile will override it
     * @returns
     */
    createToolBarNode:function(){
    	var div = document.createElement("div");
    	div.setAttribute('id','lotus_editor_toolbar');
		/*dijit.setWaiRole(div,'toolbar');
		dijit.setWaiState(div,'label',this._nls.acc_toolbarLabel);*/
		div.className = 'dijit dijitToolbar websheetToolbar';
		return div;
    },
	setImageUploadUrl: function(){
//		var uploadAttachmentUrl = this.session.url + "/att";
		var uploadAttachmentUrl = this.getURI() + "/att";
		this.editor.filebrowserImageUploadUrl = uploadAttachmentUrl;
		this.editor.urlUploaderUrl = uploadAttachmentUrl + "?method=paste";
	},
	
	setTextFileUploadUrl: function(){
//		var uploadAttachmentUrl = this.session.url + "/datasource";
		var uploadAttachmentUrl = this.getURI() + "/datasource";
		this.editor.filebrowserTextFileUploadUrl = uploadAttachmentUrl;
	},
	getPartial:function(criteria){
		// partial loading loading message, will be cleared in Base._postRender
		this.showWarningMessage(this.nls.loadMsg);
		var tm = this.editor.getTaskMan();
		tm.sync(tm.Priority.PublishMessage);
		this.partialLoad(dojo.hitch(this.editor, 'renderPartial'), criteria);
	},

	shareWith: function(editor){
		// override base function in order to load concord_sheet_widgets
		dojo["require"]("concord.concord_sheet_widgets");
		this.inherited(arguments);
	},

    onKeyUp: function()
    {
		var grid = this.editor.getCurrentGrid();
		if(grid)
		{
			grid._PCount = 0;
		}	
    },
    
	onMouseUp : function(event){
		var target = (dojo.isIE == 8) ? event.srcElement :  event.target;
		//here handle the context menu: if the user click button on the empty grid area
		if((event.button == 2 || (dojo.isMac && event.ctrlKey)) )
		{
			if(target.className == "dojoxGridContent"  || (dojo.isMac && target.id == "grid_context_menu"))
			{
				var grid = this.editor.getCurrentGrid();
				var selector = grid.selection.selector();
				if(!this.editor.hasDrawFrameSelected() && selector)
					grid.modifyContextMenu(event, selector.getSelectType());
			}	
		}
		
//		var rect = grid.domNode.getBoundingClientRect();
//		if(!event.cellNode || event.clientY < rect.top || event.clientY > rect.bottom ||
//			event.clientX < rect.left || event.clientX > rect.right)
//		{  	
//    		grid.onMouseUp(event);
//		}
    },
    
    onKeyEvent: function(event)
    {
    	if(event.ctrlKey && !event.altKey || (dojo.isMac && event.metaKey) )
		{
			if (event.charCode == 83 || event.charCode == 115)
			{
				if(this.supportInCurrMode(commandOperate.SAVEDRAFT) && this.supportSaveShortCut())
					this.editor.execCommand(commandOperate.SAVEDRAFT);
				dojo.stopEvent(event);
				return;
			}
		}
    	//do not dispatch key press events to grid, if modal dialog is shown.
    	if(this.isModalDialogShown()) return;
		//Handle Top Level Focus-Switch-Shortcuts
		if(this._handleACCShortcut(event)) return;
		//Deliver Body/HTML targeted events to grid.
		var grid = this.editor.getCurrentGrid();
		if(event.target && ((event.target.nodeName == "HTML") || (event.target.nodeName == "BODY")))
		{
			//do not dispatch TAB event to grid when focus is still on HTML document, for A11Y capabilities, TAB is used to navigate among widgets out of the grid
			if(event.keyCode == dojo.keys.TAB) return;
			if(event.type == "keypress")
				grid.onKeyPress(event);
			else
				grid.onKeyDown(event);
		}
    },

    _handleACCShortcut: function(e){
    	if(dojo.isFF && e.type != "keypress" && !dojo.isMac) return false;
    	var dk = dojo.keys, bHandled = false;
    	if(e.altKey){//alt + f10 , move focus to tool bar
    		if(e.keyCode == dk.F10){
    			this.editor.switchFocusOutGrid(ACCOperate.FOCUSTOOLBAR, e);    			
    			bHandled = true;
    		}
    	}
    	if(e.shiftKey){//alt + shift + f, move focus to menu bar
    		if(e.altKey && ((e.keyChar == "f" || e.keyChar == "F")||e.keyCode == 70)){
    			this.editor.switchFocusOutGrid(ACCOperate.FOCUSMENUBAR, e);
    			bHandled = true;
    		}else if(e.keyCode == dk.F2){// shift + f2,  move focus to side bar (comments input area).
    			if (!this.isHTMLViewMode()) {
    				var sidebar = this.sidebar;
    				var openedPane = this.editor.getPaneMgr().getOpenedPane();
    				if(openedPane)
    					openedPane.grapFocus();
    				else
    				{
    					if(sidebar && !sidebar.isCollapsed())
    						sidebar.setSidebarFocus();
    					else
    						this.toggleSideBarCmd(); 
    				}
    				bHandled = true;
    			}
    		}else if(e.altKey && (e.keyChar == 'd' || e.keyChar == "D" || e.keyCode == 68) ){
    			var statusbar = this.editor.getStatusBar();
    			if(statusbar){
    				statusbar._dropDown.toggleDropDown();
    				statusbar._dropDown.dropDown.focusFirstChild();
    			}
    			bHandled = true;
    		}
		}
    	if(e.keyCode == dk.ESCAPE){//back to grid
    		//if menu bar item shown, do not change focus to grid when pressing esc,
    		//user may toggle menu via esc.
    		//if has popup menu, do not move focus to grid
    		if(dijit.popup._stack.length > 0)
    			return false;			
//    		var menubar = dijit.byId('S_m');
//    		if (menubar) {
//    			if(menubar.focusedChild && menubar.focusedChild.popup && menubar.focusedChild.popup.isShowingNow) 
//    				return false;
//    		}
    		document.activeElement.blur();//For webkit, make sure focus swtich success.
    		var controller = this.editor.getController();
			var inlineEditor = controller.getInlineEditor();
			if(inlineEditor.isEditing())
			{
				inlineEditor.focus();	
			}
			else
			{
				this.editor.focus2Grid();
			}
    		bHandled = true;
    	}
    	
    	if(bHandled)
    		dojo.stopEvent(e);
    	return bHandled;
    },
    
    reload: function(){
    	window.location.reload();
    },
    
    syncState: function(s, e){
        // because we'll use sync mode
        if (s == 0) 
            s = this.session.getCurrentSeq() + 1;
        var resp = this.session.getState(s, e);
        if (resp == null) {
            return null;
        }
        else {
            return resp.msgList;
        }
    },
   
    beforeLeave: function() {
    	this.inlineEditorApply();
    	this.editor.leaveSession();
    	var tm = this.editor.getTaskMan();
    	tm.sync(tm.Priority.PublishMessage);
    },
    
    inlineEditorApply: function() {
    	try {
	    	var inlineEditor = this.editor.getController().getInlineEditor();
	    	if (inlineEditor.isEditing()) {
	    		if (inlineEditor.isCovered()) {
	    			inlineEditor._applyOnUncover = false;
	    			inlineEditor.uncover();
	    		}
	    		inlineEditor.apply().then(dojo.hitch(this, function (result) {
	    			if (result.success) {
	    				this.session.save(true);
	    			}
	    		}));
	    	}
    	}
    	catch (err) {
    	}
    },
    
    processMessage: function(msg) {
		this.editor.processMessage(msg);
	},
	
	coeditStarted: function(){
		this.inherited(arguments);
		
		this.coedit = true;
		var toolbar = this.editor.getToolbar();
    	if (toolbar) toolbar.refreshUndoRedoIcon();
    	if(window["pe"].discardMenuItem)
    		window["pe"].discardMenuItem.setDisabled(true);
	},
	
	coeditStopped: function() {
		this.inherited(arguments);
		
		this.coedit = false;
		var toolbar = this.editor.getToolbar();
    	if (toolbar) toolbar.refreshUndoRedoIcon();
    	if(window["pe"].discardMenuItem)
    		window["pe"].discardMenuItem.setDisabled(false);
	},
	
	userJoined: function(user) {
		if(this.isDocViewMode(true)) return;
        try {
        	this.inherited(arguments);        
          	
        	this.participantList = dojo.clone(this.session.getParticipantList());
        	var userId = user.getId();
        	var color = this.getEditorStore().getUserCoeditColor(userId);
        	if (dojo.isArray(color) && color.length > 0) {
        		color = color[0];
        	}
        	this.editor.getCollaboratorContainer().addCollaborator(user.getName(), userId, color);
        	if(userId != window["pe"].authenticatedUser.getId() && window["pe"].curUser.getIndicator(userId)  == 'hide')
        		this.editor.turnOnUserIndicator(false, userId);
        } catch (e) {
        }
	},
	
	userLeft: function(user) {
		if(this.isDocViewMode(true)) return;
		this.inherited(arguments);    
		this.editor.getCollaboratorContainer().removeCollaborator(user.getId());
	},
	
	commentsCreated: function (comments)
	{
		var commentsHdl = this.editor.getCommentsHdl();
		commentsHdl.CreateComments(comments);
	},
	commentsDeleted: function (commentsId)
	{
		var commentsHdl = this.editor.getCommentsHdl();
		commentsHdl.DeleteComments(commentsId);
	},
	commentsAppended: function(commentsId, item)
	{
		var commentsHdl = this.editor.getCommentsHdl();
		commentsHdl.AppendComments(commentsId, item);		
	},
	commentsUpdated: function(commentsId, index, item)
	{
		var commentsHdl = this.editor.getCommentsHdl();
		commentsHdl.UpdateComments(commentsId, index, item);		
	},	
	
	//If the cell of the comments is not displayed(hide, merged and so on), return true;
	commentsSelected: function (commentsId)
	{
		if (!this.isDocViewMode() && this.isViewMode()) {
			// currently readonly, don't navigate away
			;
		} else {
			var commentsHdl = this.editor.getCommentsHdl();
			if(commentsHdl.hasCmts(commentsId)){
				return commentsHdl.commentsSelected(commentsId);
			}
		}
	},
	
	sidebarShown:function(){
		
		var sheetDiv = document.getElementById('sheet_node');
		var width = concord.util.browser.getBrowserWidth() - 275 + "px";
		sheetDiv.style.width = width;

		var container = dijit.byId('websheet_layout_WorksheetContainer_0'); 
		if(container) 
		{
			container.domNode.style.width = width;
			container.resize(); 	   
		}
	},
	
	sidebarResized: function(w)
	{
		//in this case,only when comments side is collapsed, and some other side pane(such as ACL) opened
		//and then user first time click the "Comment" button, this would trigger the collapsed of the unopened comments sidebar
		if((w == 0 && this.editor.paneMgr.hasOpenedSidebar()) || this.isEditCompactMode())
		{
			return;
		}	
			
		var sheetDiv = document.getElementById('sheet_node');
		var width = concord.util.browser.getBrowserWidth() - w + "px";
		sheetDiv.style.width = width; 
	
		var container = dijit.byId('websheet_layout_WorksheetContainer_0'); 
		if(container) 
		{
			container.domNode.style.width = width;
			container.resize(); 			
		}	
    
//		var sideBar = dojo.byId("ll_sidebar_div");
//		dojo.style(sideBar, "width", w+"px");		
		this.editor.paneMgr.updateWidth(w+"px");
	},
	
	_setHeight: function(h) {
		var n = dojo.byId("sheet_node");
		dojo.style(n, "height", h + "px");

		this.editor.setWorksheetHeight();
		var container = this.editor.getWorksheetContainer();
		if(container)
			container.resize();
		
	    var sideBar = dojo.byId("ll_sidebar_div");
	    if (sideBar) {
			dojo.style(sideBar, "height", h + "px");		
	    }
	},
	
	setHeightDelta: function(delta) {
		var n = dojo.byId("sheet_node");
		if (n) {
			var h = dojo.contentBox(n).h;
			this._setHeight(h + delta);
		}
	},
	
	commentsUnSelected: function (commentsId)
	{
		var commentsHdl = this.editor.getCommentsHdl();
		if(commentsHdl.hasCmts(commentsId)){
			commentsHdl.commentsUnSelected(commentsId);
		}
	},
	
	saveAsDoc: function(editor)
	{
		dojo["require"]("concord.util.dialogs");
		concord.util.dialogs.showSaveAsDlg( 'spreadsheet' );
	},
	
//	createSheetDocFromTemplate: function(editor)
//	{
//		if(!this.templateDlg) {
//			dojo["require"]("concord.concord_sheet_widgets");
//			//dojo["require"]("concord.widgets.spreadsheetTemplates.Dialog");
//			this.templateDlg = new concord.widgets.spreadsheetTemplates.Dialog(editor,this.nls.spreadsheetTemplates + "#SpreadsheetTemplate");
//		}
//		this.templateDlg.show();
//	},
	
	setFocus: function()
	{
		this.editor.focus2Grid();
	},
	
	getSheetClipBoard: function ()	{		
		return this.getClipBoard("ws");
	},
	
	getTaskHdl: function()
	{
		return this.editor.getTaskHdl();
	},
	
	getSidebarHeight: function() {
	  	return this.getWorksheetHeight();
	},
	
	getLocale: function () {
		return this.locale;
	},
	
	setLocale: function (locale) {
		if(locale){
			this.locale = locale;
			dojo.cookie("sheetLocale", locale, { path: '/' });
		}
		else
			locale = this.locale;
		dojo["requireLocalization"]("dojo.cldr",'gregorian', locale);
		dojo["requireLocalization"]("dojo.cldr",'number', locale);
		dojo["requireLocalization"]("dojo.cldr",'currency', locale);
		dojo["requireLocalization"]("websheet.i18n",'Number', locale);
		dojo["requireLocalization"]("concord.editor", 'PopularFonts', locale);
	},

	/**
	 * the value should be sum of banner, menubar, toolbar and formular bar
	 * Same with method getHeaderHeight in appsheet.jsp, need change both together
	 * @returns
	 */
    getHeaderHeight: function () {    	
    	var height = 0;
    	var bannerDiv = dojo.byId("banner");
    	if(bannerDiv){
	    	if (dojo.isIE < 9)
				height += bannerDiv.offsetHeight;
			else
				height += bannerDiv.clientHeight;
    	}
    	
    	var menubarDiv = dojo.byId("lotus_editor_menubar");
    	if(menubarDiv){
    		if (dojo.isIE < 9)
				height += menubarDiv.offsetHeight;
			else
				height += menubarDiv.clientHeight;
    	}
    	
    	var toolbarDiv = dojo.byId("lotus_editor_toolbar");
    	if(toolbarDiv){
    		if (dojo.isIE < 9)
				height += toolbarDiv.offsetHeight;
			else
				height += toolbarDiv.clientHeight;
    	}
    			
    	var formulaBarDiv = dojo.byId("formulaBar_node");
    	if(formulaBarDiv){
    		if (dojo.isIE < 9)
				height += formulaBarDiv.offsetHeight;
			else
				height += formulaBarDiv.clientHeight;
    	}
    	
    	return height;
    },
    
    getStatusBarHeight: function()
    {
    	if (!this.bJSMobileApp && (this.bMobile)) {
    		return 0;
    	} else {
    		return 24;
    	}
    },
    
    toggleCommentsCmd: function()
	{
    	dojo["require"]("concord.concord_sheet_widgets");
    	this.inherited(arguments);	
    	// 16590-[Regression] Focus moves back to grids automatically when try to respond to an existing comment. 
    	// set focus back to sidebar
		if(this.sidebar){
			setTimeout(dojo.hitch(this.sidebar, this.sidebar.setSidebarFocus),500);			
		}
	},
	
	toggleSideBarCmd: function(preventStatus){
		dojo["require"]("concord.concord_sheet_widgets");
    	this.inherited(arguments);	
	},
    
    getWorksheetHeight: function () {
	  	var height;
	  	var mainNodeH = this.getHeaderHeight();
	  	var browserHeight = concord.util.browser.getBrowserHeight();
		height = (browserHeight - mainNodeH) + "px";
		
		return height;
    },
    
	getScHandler: function()
	{
		dojo["require"]("concord.concord_sheet_extras");
		return new websheet.widget.ScSpellCheckDlgHandler(this.editor);
	},
	
	getSidebarMenuItemId: function()
	{
		sidebarMenuId = "S_i_Sidebar";
		return sidebarMenuId;
	},
	
	enabledTrackChange: function() {
		return window["pe"].settings.getIndicator();
    },
    
    turnOnColorShading: function(isTurnOn, userId) {
    	this.editor.turnOnUserIndicator(isTurnOn, userId);	
    },
	
	setLeaveData:function(data)
    {
	    this.leaveData = data;
    },
    
    getLeaveData: function()
    {
        return this.leaveData;
    },
    
    // pending session from receiving messages
    checkPending: function() {
    	var controller = this.editor.getController();
    	if (!controller) {
    		return false;
    	}
    	var doc = this.editor.getDocumentObj();
    	if (!doc) {
    		return false;
    	}
    	
    	if (doc.isLoading || doc.getPartialLoading()) {
    		// if document is in loading, let the messages in
    		return false;
    	} else {
    		// block if any important heavy task in running
    		var tm = this.editor.getTaskMan();
    		return tm.isRunning(tm.Priority.Trivial);
    	}
    },
    
    /**
     * this method is used to verify if the command should do more under current Mode
     * return false means need do more, return true means this command already solved, do not need do anything anymore
     * @param command
     */
    supportInCurrMode: function(command){
    	var commop = window.commandOperate;    	
    	var rtn = false;
    	if(this.isObserverMode()){
    		switch (command) { 
	    		case commop.COPY:	             	
	            case commop.FIND:        	      
	            case commop.EXPORTTOPDF:
	            case commop.SELECTSHEET:   		
		    			rtn = true;
		    			break;
		        default:
		               break;
    		}
    		if(!rtn){
    			this._needFocus = true;
    			this.editor.focus2Grid();
    		}
    		return rtn;
    	}else if(this.isViewMode(true)){
    		switch (command) {
	    		case commop.COPY: {
	    			if (window.g_disableCopy) {
	    				rtn = false;
	    			} else {
	    				rtn = true;
	    			}
	    			break;
	    		}
	    		case commop.UNDO:
	    		case commop.REDO:
	    		case commop.FIND:
	    		case commop.EXPORTTOPDF:
	    		case commop.SELECTSHEET:	
		    			rtn = true;
		    			break;
		        default:
		               break;
    		}
    		if(!rtn){
    			this._needFocus = true;
    			this.editor.focus2Grid();
    		}
    		return rtn;
    	}else
    		return true;
    },
    
	disableViewModeMenuItems: function(disable) {
		this.inherited(arguments);
		// if disable is true, to disable the menu items for ViewMode
		// if disable is false, to enable the menu items for EditMode
		
		// customize the formulabar when switch mode
		this.editor.getFormulaBar().customizeWithMode();	    
	    // customize the menubar
	    customizeMenubar(this);
	    customizeContextMenu(this);
	    this.customizeReviewMenu(disable);
	    this.customizeAPMenu();
	},
	
	disableViewModeToolbar: function(disable) {
		this.inherited(arguments);	
		// if disable is true, to disable the toolbar for ViewMode
		// if disable is false, to enable the toolbar for EditMode
		customizeToolbar(this, disable, this.editor.getToolbar());
	},
	
	enableEdit: function() {
		// enable edit functions in edit mode
		if (!(this.sceneInfo.mode == ViewMode.OBSERVER || this.sceneInfo.mode == ViewMode.VIEWDRAFT || this.sceneInfo.mode == ViewMode.HTMLVIEW)) {
			this.switchToEditMode();
			
			if (!this.bMobile) {
				this.disableViewModeMenuItems();
				this.disableViewModeToolbar();
				this.editor.formulaBar.disable(false);
			} if (this.bJSMobileApp) {
        		customizeContextMenu(this);
        	}
			
			// clear menu item state cache
			window["pe"].menuItemState = {};
			var toolbar = this.editor.getToolbar();
	    	if (toolbar) toolbar.refreshUndoRedoIcon();
	    	
	    	// styles
	    	var grid = this.editor.getCurrentGrid();
	        var sheetName = grid.getSheetName();
	        var selector = grid.selection.selector();
	        var rowIndex = selector._startRowIndex + 1;
	        var colIndex = selector._startColIndex;
	        var cellStyle = websheet.model.ModelHelper.getStyleCode (sheetName, rowIndex, colIndex);
	        if (toolbar) toolbar.applyStyle(cellStyle);
	        
	        // image props
	    	if (toolbar) toolbar.disableImagePropertyDlg(true);
		}
	},
	
	disableEdit: function() {
		// force client to disable all edit functions in edit mode
        if (!this.isViewMode()) {
        	this.switchToObserverMode();
        	if (!this.bMobile) {
        		this.disableViewModeMenuItems();
        		this.disableViewModeToolbar();
        		this.editor.formulaBar.disable(true);
        	} else if (this.bJSMobileApp) {
        		customizeContextMenu(this);
        	}
        	if (!this.bMobile) {
        		// disable export
        		window["pe"].menuItemDisabled(dijit.byId("S_i_PrintToPDF"), true);
        		window["pe"].menuItemDisabled(dijit.byId("S_i_ExportToCSV"), true);
        		// disable locale settings
        		window["pe"].menuItemDisabled(dijit.byId("S_i_Settings"), true);
        		// disable navigator
        		window["pe"].menuItemDisabled(dijit.byId("S_i_Navigator"), true);
        		// enable toolbar
        		window["pe"].menuItemDisabled(dijit.byId("S_i_Toolbar"), false);
        	}
        }
	},
    
	switchToViewMode: function() {
		this.inherited(arguments);
	},
	
	switchToObserverMode: function() {
		this.inherited(arguments);
	},		
	
	switchToEditMode: function() {
		this.inherited(arguments);
	},
	
	isEditDisabled: function() {
		// if document mode is edit but currently edit is disabled
		return !this.isDocViewMode() // document mode is edit
			&& this.isViewMode();	 // but currently edit is disabled
	},
	
	isEditEnabled: function() {
		// if document mode is edit and currently editable
		return !this.isDocViewMode() // document mode is edit
			&& !this.isViewMode();	 // and currently edit is enabled
	},
	
	_showMessage: function() {
		if (this.editor) {
			var doc = this.editor.getDocumentObj();
			if (doc && doc.isLoading) {
				// if document is in loading, refuse any request for showing messages
				;
			} else {
				this.inherited(arguments);
			}
		} else {
			this.inherited(arguments);
		}
	},
	
	hideErrorMessage: function() {
		var doc = this.editor.getDocumentObj();
		if (doc && doc.isLoading) {
			// loading message still on, refuse any request hiding messages
			;
		} else {
			this.inherited(arguments);
		}
	},
	
	loadCommentsImg: function() {
		//These images need to be loaded first (before grid render) to prevent row node mis-align when user add comments.
		//REFERENCE: 24550 To add comment on a cell with wrapped texts results grids mis-aligned.
		dojo.forEach([window.contextPath + window.staticRootPath + "/styles/css/websheet/img/withComment2.gif",
		              window.contextPath + window.staticRootPath + "/styles/css/websheet/img/withComment1.gif"], 
		function(src){
			var imgObj = new Image();
			imgObj.src = src;
		});
	},
	
	getSnapshotUpdateStr: function(){
		return this.nls.updateSpreadsheet;
	},
	appendHtmlActions: function(actions)
	{
		var menuStrs = dojo.i18n.getLocalization("concord.widgets","menubar");
		var viewList = document.createElement("li");
		viewList.setAttribute("id", "html_sheet_viewer");
		var dirAttr = (BidiUtils.isGuiRtl()) ? 'rtl' : 'ltr';
		var menu = new dijit.Menu({ style: "display: none;", dir: dirAttr}); 
		menu.addChild(new dijit.MenuItem({
	        label: menuStrs.fileMenu_SpreadsheetSettings,
	        dir: dirAttr,
	        onClick: function(){ window["pe"].lotusEditor.execCommand(commandOperate.SPREADSHEETSETTINGS); }
	    }));
		menu.addChild(new dijit.MenuItem({
	        label: menuStrs.viewMenu_Navigator,
	        dir: dirAttr,
	        onClick: function(){ window["pe"].lotusEditor.execCommand(commandOperate.NAVIGATOR); }
	    }));
		menu.addChild(new dijit.MenuSeparator());
		var freezeRowsMenu = new dijit.Menu();
		freezeRowsMenu.addChild(new dijit.MenuItem({
	          label:menuStrs.viewMenu_NoFrozenRows,
	          dir: dirAttr,
	          onClick: function(){ window["pe"].lotusEditor.execCommand(commandOperate.FREEZEWINDOW,[{row:0}]); }
	      }));
		freezeRowsMenu.addChild(new dijit.MenuItem({
	          label:dojo.string.substitute(menuStrs.viewMenu_FreezeOneRow, [1]),
	          dir: dirAttr,
	          onClick: function(){ window["pe"].lotusEditor.execCommand(commandOperate.FREEZEWINDOW,[{row:1}]); }
	      }));
		var freezeColumnsMenu = new dijit.Menu();
		freezeColumnsMenu.addChild(new dijit.MenuItem({
	          label:menuStrs.viewmenu_NoFrozenColumns,
	          dir: dirAttr,
	          onClick: function(){ window["pe"].lotusEditor.execCommand(commandOperate.FREEZEWINDOW,[{col:0}]); }
	      }));
		freezeColumnsMenu.addChild(new dijit.MenuItem({
			label:dojo.string.substitute(menuStrs.viewMenu_FreezeOneColumn, [1]),
			dir: dirAttr,
	          onClick: function(){ window["pe"].lotusEditor.execCommand(commandOperate.FREEZEWINDOW,[{col:1}]); }
	      }));
		for(var i=2;i<=10;i++){
			freezeRowsMenu.addChild(new dijit.MenuItem({
		          label:dojo.string.substitute(menuStrs.viewMenu_FreezeXRows, [i]),
		          index_value:i,
		          dir: dirAttr,
		          onClick: function(){ window["pe"].lotusEditor.execCommand(commandOperate.FREEZEWINDOW,[{row:this.index_value}]); }
		      }));
			freezeColumnsMenu.addChild(new dijit.MenuItem({
		          label:dojo.string.substitute(menuStrs.viewMenu_FreezeXColumns, [i]),
		          index_value:i,
		          dir: dirAttr,
		          onClick: function(){window["pe"].lotusEditor.execCommand(commandOperate.FREEZEWINDOW,[{col:this.index_value}]); }
		      }));
		}
		menu.addChild(new dijit.PopupMenuItem({
	          label:menuStrs.viewMenu_FreezeRows,
	          dir: dirAttr,
	          popup:freezeRowsMenu
	      }));
		menu.addChild(new dijit.PopupMenuItem({
	          label:menuStrs.viewMenu_FreezeColumns,
	          dir: dirAttr,
	          popup:freezeColumnsMenu
	      }));
		menu.addChild(new dijit.MenuSeparator());
		menu.addChild(new dijit.MenuItem({
	        label: menuStrs.formatMenu_HideRow,
	        dir: dirAttr,
	        onClick: function(){ window["pe"].lotusEditor.execCommand(commandOperate.HIDEROW); }
	    }));
		menu.addChild(new dijit.MenuItem({
	        label: menuStrs.formatMenu_HideColumn,
	        dir: dirAttr,
	        onClick: function(){ window["pe"].lotusEditor.execCommand(commandOperate.HIDECOLUMN); }
	    }));
		menu.addChild(new dijit.MenuItem({
	        label: menuStrs.formatMenu_ShowRow,
	        dir: dirAttr,
	        onClick: function(){ window["pe"].lotusEditor.execCommand(commandOperate.SHOWROW); }
	    }));
		menu.addChild(new dijit.MenuItem({
	        label: menuStrs.formatMenu_ShowColumn,
	        dir: dirAttr,
	        onClick: function(){ window["pe"].lotusEditor.execCommand(commandOperate.SHOWCOLUMN); }
	    }));
	    var button = new dijit.form.DropDownButton({
	        label: this.nls.view,
	        name: this.nls.view,
	        dropDown: menu,
	        iconClass: "htmlviewIcon",
	        disabled:true,
	        id: "html_sheet_viewer_btn"
	    });
	    var lastchild = button.domNode.lastChild;
	    if (lastchild && lastchild.nodeName.toLowerCase() == "input") {
	        dijit.setWaiRole(lastchild, "button");
	        lastchild.setAttribute("aria-labelledby", button.id);
	    }
	    dojo.addClass(button.titleNode.parentNode, "lotusBtn");
	    viewList.appendChild(button.domNode);
	    actions.appendChild(viewList);
	},
	
	initReviewMenu: function()
	{
		this.inherited(arguments);
		this.customizeReviewMenu(false);
	},
	
	customizeReviewMenu: function(disable)
	{
		if(concord.util.uri.isCCMDocument())
		{
			var disableReview = disable || !this.isNeedRenderSFR();
			var disablePublish = disable || this.isNeedRenderSFR();
	  		if(window["pe"].reviewMenuItem)
	  			window["pe"].menuItemDisabled(window["pe"].reviewMenuItem,disableReview);  		
	  		if(window["pe"].publishMenuItem)
	  			window["pe"].menuItemDisabled(window["pe"].publishMenuItem,disablePublish);			
		}
	},
	
	customizeAPMenu: function()
	{
		if(!pe.scene.autoPublishFeature())
		{  		
	  		if(window["pe"].autoPublishMenuItem)
	  			window["pe"].menuItemDisabled(window["pe"].autoPublishMenuItem,true);			
		}
	},
	
    filterFeatureIDs: function(featureIDs){ 
    	return dojo.filter(featureIDs, function(id){
    		if(id == "PUBLISH_BUTTON")
    		{
    			return pe.scene.myHeader.isPublishBtnShown();
    		}
    		if(id == "AUTO_PUBLISH" || id == "SHEET_AUTO_PUBLISH")
    		{
    			if(!pe.scene.autoPublishFeature())
    				return false;    			
    		}
    		if (id == "COMMON_COEDIT")
    		{
    			return (pe.scene.myHeader.getSharePosition() != null);	
    		}
    		if( id == "SHEET_PROTECTED_AREA")
    		{
    			return g_enableACL;
    		}	
    		return true;
    	});
    },
	
	getFeaturePosition: function(featureID)
	{
		switch(featureID) {
		case "SHEET_NEW_MORE_COEDITORS":
		{
			var sheetContainer = dojo.byId("sheet_node");
			if (sheetContainer) {
				var containerPos = dojo.position(sheetContainer);
				var x = containerPos.x;
				var y = containerPos.y + 30;
				if (BidiUtils.isGuiRtl()) {
					x += 270;
					return {x : x, y : y, l: 1};
				} else {
					x += containerPos.w - 270;
					return {x : x, y : y, r: 1};
				}
			}
			break;
		}
		case "SHEET_DATA":		
		{
			var dataMenu = dijit.byId("S_i_Data");
			if(dataMenu && dataMenu.domNode) 
			{
				var pos = dojo.position(dataMenu.domNode);
				var x = BidiUtils.isGuiRtl() ? pos.x + pos.w - 15 : pos.x + 15;
				var y = pos.y + pos.h + 2;
				return {x: x, y: y};
			}
			break;
		}			
		case "SHEET_DATA_VALIDATION":
		{
			var menubar = dijit.byId("S_m");
			var dataMenu = dijit.byId("S_i_Data");
//			menubar.onItemClick(fileMenu, {type: "click"});
			menubar._openItemPopup(dataMenu, false);
			var subMenu = dijit.byId("S_i_Validation");
			if(menubar && subMenu && subMenu.domNode) 
			{
				var pos = dojo.position(subMenu.domNode);
				var x = this.getMenuFeatureXPos(pos);
				var y = pos.y + 5;
				return {x: x, y: y, m: 1};
			}
			break;
		}
		case "SHEET_PROTECTED_AREA":
			var menubar = dijit.byId("S_m");
			var dataMenu = dijit.byId("S_i_Data");
			menubar._openItemPopup(dataMenu, false);
			var subMenu = dijit.byId("S_i_ACL");
			if(menubar && subMenu && subMenu.domNode) 
			{
				var pos = dojo.position(subMenu.domNode);
				var x = this.getMenuFeatureXPos(pos);
				var y = pos.y + 5;
				return {x: x, y: y, m: 1};
			}
			break;
		case "SHEET_GRID_LINES":
			var menubar = dijit.byId("S_m");
			var viewMenu = dijit.byId("S_i_View");
			menubar._openItemPopup(viewMenu, false);
			var subMenu = dijit.byId("S_i_GridOnOff");
			if(menubar && subMenu && subMenu.domNode) 
			{
				var pos = dojo.position(subMenu.domNode);
				var x = this.getMenuFeatureXPos(pos);
				var y = pos.y + 5;
				return {x: x, y: y, m: 1};
			}
			break;			
		case "SHEET_FORMULA":
		case "SHEET_NEW_3D_REFERENCE" :
		case "SHEET_NEW_FORMULA":
		{
//			//center
//			var sheetNode = dojo.byId("sheet_node");
//			var pos = dojo.position(sheetNode);
//			var x = pos.x + pos.w/2 ;
//			var y = pos.y + pos.h/2;
//			return {x: x, y: y, c: 1};
			
			//formulabar
			var formulaBar = this.editor.getFormulaBar();
			if(formulaBar && formulaBar.isShow) {
				var btn = formulaBar.allFormulaButton;
				if(btn && btn.domNode){
					var barPos = dojo.position(formulaBar.domNode);
					var pos = dojo.position(btn.domNode);
					var x = pos.x + barPos.x + pos.w/2 ;
					var y = barPos.y + barPos.h;
					return {x: x, y: y};
				}
			}
			break;
		}
		case "SHEET_NEW_MULTICOLUMNSORT":
		{
			// menu
			var menubar = dijit.byId("S_m");
			var dataMenu = dijit.byId("S_i_Data");
//			menubar.onItemClick(fileMenu, {type: "click"});
			menubar._openItemPopup(dataMenu, false);
			var subMenu = dijit.byId("S_i_Sort");
			if(menubar && subMenu && subMenu.domNode) 
			{
				var pos = dojo.position(subMenu.domNode);
				var x = this.getMenuFeatureXPos(pos);
				var y = pos.y + 5;
				return {x: x, y: y, m: 1};
			}
			break;
		}
		/*
		case "SHEET_Merge":
		{
			//toolbar
			var toolbar = dojo.byId("lotus_editor_toolbar");
			var merge = dijit.byId("S_t_MergeSplitCell");
			if (toolbar && merge)
			{
				var dom = merge.domNode;
				var toolbarPos = dojo.position(toolbar);
				var pos = dojo.position(dom);
				var x = pos.x + toolbarPos.x + pos.w/2 ;
				var y = toolbarPos.y + toolbarPos.h;
				return {x: x, y: y};
			}
			break;
		}
		*/
		case "SHEET_DOWNLOAD":
		{
			// menu
			var menubar = dijit.byId("S_m");
			var fileMenu = dijit.byId("S_i_File");
//			menubar.onItemClick(fileMenu, {type: "click"});
			menubar._openItemPopup(fileMenu, false);
			var subMenu = dijit.byId("S_i_Export");
			if(menubar && subMenu && subMenu.domNode) 
			{
				var pos = dojo.position(subMenu.domNode);
				var x = this.getMenuFeatureXPos(pos);
				var y = pos.y + 5;
				return {x: x, y: y, m: 1};
			}
			break;
		}
		case "SHEET_NEW_VERTICALMERGE":
		{
			var toolbar = dojo.byId("lotus_editor_toolbar");
			var merge = dijit.byId("S_t_MergeSplitCell");
			if (toolbar && merge)
			{
				var dom = merge.domNode;
				var toolbarPos = dojo.position(toolbar);
				var pos = dojo.position(dom);
				var x = pos.x + toolbarPos.x - 5 + (BidiUtils.isGuiRtl() ? pos.w : pos.w/2);
				var y = toolbarPos.y + toolbarPos.h;
				return {x: x, y: y};
			}
			break;
		}
		case "SHEET_NEW_MORECOLUMNS":
		{
			var sheetContainer = dojo.byId("sheet_node");
			if (sheetContainer) {
				var containerPos = dojo.position(sheetContainer);
				var x = containerPos.x + containerPos.w/2;
				var y = containerPos.y + 30;
				return {x : x, y : y};
			}
			break;
		}
		case "SHEET_AUTO_PUBLISH":
		case "AUTO_PUBLISH":
		{
			// menu
			var menubar = dijit.byId("S_m");
			var fileMenu = dijit.byId("S_i_File");
//			menubar.onItemClick(fileMenu, {type: "click"});
			menubar._openItemPopup(fileMenu, false);
			var subMenu = dijit.byId("S_i_AutoPublish");
			if(menubar && subMenu && subMenu.domNode) 
			{
				var pos = dojo.position(subMenu.domNode);
				var x = this.getMenuFeatureXPos(pos);
				var y = pos.y + 5;
				return {x: x, y: y, m: 1};
			}
			break;
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
		case "SHEET_COMMENT":
		{
			return this.myHeader.getCommentPosition();	
			break;
		}
		case "COMMON_TOUR":
		{
			// menu
			var menubar = dijit.byId("S_m");
			var helpMenu = dijit.byId("S_i_Help");
//			menubar.onItemClick(fileMenu, {type: "click"});
			menubar._openItemPopup(helpMenu, false);
			var subMenu = dijit.byId("S_i_UserTour");
			if(menubar && subMenu && subMenu.domNode) 
			{			
				var pos = dojo.position(subMenu.domNode);
				var x = this.getMenuFeatureXPos(pos);
				var y = pos.y + 5;
				return {x: x, y: y, m: 1};
			}			
			break;			
		}
		}
		
		return this.inherited(arguments);
	},
	
	afterFeatureShow: function(featureID)
	{
		switch(featureID) {
			case "SHEET_FORMULA":
			case "COMMON_TOUR":	
		    case "AUTO_PUBLISH":
		    case "SHEET_AUTO_PUBLISH":	
		    case "SHEET_DATA_VALIDATION":
		    case "SHEET_PROTECTED_AREA":
		    case "SHEET_GRID_LINES":
			case "SHEET_DOWNLOAD": {
				var menubar = dijit.byId("S_m");
				menubar._cleanUp(true);
				break;
			}
		}
		
	},
	showPublishDialog: function()
	{
		pe.lotusEditor.execCommand( commandOperate.PUBLISHDIALOG );
	},
	createTooltip: function(widget, str, pos, onHeader)
	{
	    new websheet.widget.MenuTooltip({
	    	widget : widget,	        
	        label: str,
	        position: pos,
	        onHeader: onHeader
	    });
	}
});

commandOperate = {
	/*******  FILE  ***********/
	NEWSPREADSHEET:"newSpreadSheet",
//	NEWSPREADSHEETFROMTEMPLATE:"newSpreadSheetFromTemplate",
	NEWDOCUMENT: "newDocument",
//	NEWDOCUMENTTEMPLATE: "newDocumentFromTemplate",
	NEWPRESENTATION: "newPresentation",
	IMPORT: "import",
	IMPORT: "import",
	DISCARDDRAFT:"discardDraft",
	SPREADSHEETSETTINGS: "spreadsheetSettings",
	SAVE: "save",
	SAVEAS: "saveAs",
	SAVEDRAFT: "saveDraft",
	SAVEVERSION: "saveVersion",
	SETAUTOPUBLISH: "autoPublish",
	PUBLISHDIALOG: "publishDialog",
	SFRDIALOG: "SFRDialog",
	SHAREWITH: "shareWith",
	EXPORTTOPDF: "exportToPDF",
	EXPORTTOCSV: "exportToCSV",
	EXPORTTODEFAULT: "exportToDEFAULT",
	SHOWREVISION: "showRevision",
	
	/*******  EDIT ***********/
	UNDO: "undo",
	REDO: "redo",
	CUT: "cut", 
	COPY: "copy",
	PASTE: "paste",
	FORMAT: "format",
	PAINT: "paint",
	CONPAINT: "conpaint",
	SELECTSHEET:"selectSheet",
	DELETESHEET:"deleteSheet",
	RENAMESHEET:"renameSheet",
	HIDESHEET:"hidesheet",
	UNHIDESHEET:"unhidesheet",
	MOVESHEET:"moveSheet",
	DELETEROW:"deleteRow",
	DELETECOLUMN:"deleteColumn",
	DELETECELL:"deleteCell",
	DELETECELLUP:"deleteCellUp",
	CLEAR: "clear",
	STARTAUTOFILL: "startautofill",
	CLEARRANGE: "clearRange",
	FILLRANGE: "fillRange",
	FIND: "find",
	REPLACE: "replace",
	CELLEDIT: "cellEdit",
	DELETEIMAGE: "delImg",
	RESIZEIMAGE: "resizeImg",
	MOVEIMAGE: "moveImg",
	MOVERANGE: "moverange",
	/*******  VIEW  ***********/
	SHOWORHIDETOOLBAR: "showOrHideToolbar",	
	SHOWORHIDESIDEBAR: "showOrHideSideBar",
	SHOWORHIDEFORMULA: "showOrHideFormula",
	SHOWORHIDETASK:"showOrHideTask",
	SHOWORHIDEACL: "showOrHideACL",
	UserIndicator: "showAndHideUserIndicator",
	SHOWUNSUPP: "showUnSupp",
	NAVIGATOR: "navigator",
	FREEZEWINDOW: "freezeWindow",
	SELECTCOMMENT: "selectComment",
	SHOWORHIDEGRIDLINES: "showGridLines",
	/*******  INSERT  ***********/
	INSERTROW:"insertRow",
	INSERTROWBELOW: "insertRowBelow",
	INSERTCOLUMN:"insertColumn",
	INSERTCOLUMNAFTER: "insertColumnAfter",
	INSERTCELL:"insertCell",
	INSERTCELLDOWN:"insertCellDown",
	INSERTSHEET:"insertSheet",
	INSERTIMAGE:"insertImage",
	INSERTCHART:"insertChart",
	ALLFORMULAS: "allFormulas",
	SUMFORMULA: "sum",
	AVERAGEFORMULA: "avrg",
	COUNTFORMULA: "count",
	MAXFORMULA: "max",
	MINFORMULA: "min",
	NAMERANGE: "nameRange",
	MANAGERANGE: "manageNameRange",
	
	/*******  FORMAT  ***********/
	DEFAULTSTYLE: "defaultStyle",
	SETSTYLE: "setStyle",
	FONT:"font",
	FONTSIZE:"fontSize",
	FONTCOLOR:"fontColor",
	ITALIC:"italic",
	UNDERLINE:"underline",
	STRIKE:"strike",
	BOLD:"bold",
	SETBORDERSTYLE: "setBorderStyle",
	CHANGEROWHEIGHT: "changeRowHeight",
	CHANGECOLUMNWIDTH: "changeColumnWidth",
	HIDEROW:"hideRow",
	SHOWROW:"showRow",
	HIDECOLUMN:"hideColumn",
	SHOWCOLUMN:"showColumn",
	ALIGNLEFT: "left",
	ALIGNRIGHT: "right",
	ALIGNTOP:"top",
	ALIGNBOTTOM:"bottom",
	ALIGNMIDDLE:"middle",
	ALIGNCENTER: "center",
	LTRDIRECTION: "ltr",
	RTLDIRECTION: "rtl",
	AUTODIRECTION: "",
	LTRSHEETDIRECTION: "ltrSheet",
	RTLSHEETDIRECTION: "rtlSheet",
	MERGECELL: "mergeCell",
	WRAPTEXT: "wrapText",
	IMAGEPROPERTIES: "imageProperties",
	CHARTPROPERTIES: "chartProperties",
	DELETEFRAME: "deleteSelectedFrame",
	/*******  DATA  ***********/
	SORTRANGE:"sortRange",
	INSTANCESORT: "instanceSort",
	ACCESSPERMISSION: "accessPermission",
	DELETEACL:"deleteACL",
	VALIDITY: "stTemplate",
	INSTANTFILTER: "instantFilter",
	FILTERROWS: "filterRows",
	VALIDATION:"validation",	
	/******** TEAM  *************/
	CREATECOMMENTS:"createComments",
	ASSIGNTASK:"assignTask",
	EDITASSIGNMENT:"editAssignment",
	REOPENASSIGNMENT:"reopenAssignment",
	REASSIGNASSIGNMENT: "reassignAssignment",
	MARKASSIGNCOMPLETE:"markAssignComplete",
	SUBMITTASK: "submitTask",
	RETURNASSIGNMENT:"returnAssignment",
	REMOVECOMPLETEDASSIGN:"removeCompletedAssign",
	APPROVEASSIGNMENT:"approveAssignment",
	ABOUTASSIGN:"aboutAssign",
	DELETETASK:"deleteTask",
	SELECTACTIVITY: "selectActivity",
	
	/******** Tools *************/
	SPELLCHECK: "spellCheck",
	PREFERENCES: "preferences",
	AUTOCOMPLETE: "autoComplete",
	
	DOWNLOADCHART:"downloadChart",
	/******** HELP  *************/
	ABOUT: "about",
	NEWFEATURS: "newFeaturs",
	USERTOUR: "userTour",
		
	// functions not in menu currently	
	BORDERCUSTOMIZE:"BORDERCUSTOMIZE",
	NUMBERFORMAT:"NUMBERFORMAT",
	// miscellous (for image and chart)
	INSERTRANGE: "insertRange",
	DELETERANGE: "deleteRange",
	SETRANGEINFO: "setRangeInfo",
	DELETERANGESBYRANGE: "deleteRangesByRange",
	SETCHARTINFO: "setChartInfo"
};