/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2014. All Rights Reserved.          */
/*                                                                   */
/* U.S. Government Users Restricted Rights: Use, duplication or      */
/* disclosure restricted by GSA ADP Schedule Contract with IBM Corp. */
/*                                                                   */
/* ***************************************************************** */

dojo.provide("concord.widgets.sidebar.SideBar");
dojo.require("dojo.i18n");
dojo.require("concord.util.BidiUtils");
dojo.require("concord.util.events");
dojo.require("concord.util.browser");
dojo.require("concord.widgets.sidebar.CommentsController");
dojo.require("concord.widgets.sidebar.WidgetStore");
dojo.require("concord.widgets.sidebar.PopupCommentsCacher");

dojo.require("concord.widgets.sidebar.EditorsPane");
dojo.require("concord.widgets.sidebar.CommentsFilterSearch");

dojo.requireLocalization("concord.widgets.sidebar","SideBar");
dojo.declare("concord.widgets.sidebar.SideBar", null, {
	nls: null,
	listener: null,
	domNode: null,
	connectArray: [],
	bSocial: true,
	cminW: 0,
	cmaxW: 300,
	editorsPane:null,
	streamHeader: null,
	streamContent: null,
	streamFooter: null,
	streamEditors: null,
	topShadow: null,
	bottomShadow: null,
	
	commentsController: null,
	widgetStore: null,
	
	ll_panel_div_id: "ll_sidebar_panel",
	ll_docsstream_div_id: "ll_docsstream_div_id",
	ll_comments_init_imgid: "ll_comments_init_imgid",
	
	constructor: function (domNode, listener){
		this.nls = dojo.i18n.getLocalization("concord.widgets.sidebar","SideBar");
		this.listener = listener;
		this.domNode = domNode;
		
		var entitlements = pe.authenticatedUser.getEntitlements();
		this.bSocial = entitlements.assignment.booleanValue;
		
		this.widgetStore = concord.widgets.sidebar.WidgetStore();
		this._buildSideBar();
		this.setMaxWidth();
		this._initAsyncPane();
		this._regEvent();
	},
	
	_buildSideBar: function(){
		var panel = dojo.create("div",{id:this.ll_panel_div_id, height:"100%", width:"100%"},this.domNode);
		dojo.addClass(panel,"sidebar");
		dojo.style(panel, "display","none");
		try { 
			this._buildEditors(panel);
		}catch(e) {
	  		console.log("build editors error: "+ e);
	  	}
		this._buildDocsStream(panel);
	},
	
	_buildEditors: function(panel){
		if (pe.scene.isViewMode(true)) {
			return;
		}
		dirValue = BidiUtils.isGuiRtl() ? 'rtl' : 'ltr';
		if(window.pe.scene.docType == "sheet"){
    	  // use g_locale for creating widgets since spreadsheet has another locale set in document that could be different than browser locale, SheetDocScene has overridden getLocale() call
    	  // to return spreadsheet locale.
    	  this.editorsPane = new concord.widgets.sidebar.EditorsPane({style:{width: "100%", padding: "20px 0 0 0"},title: '', id: "sidebar_editors_pane", lang: g_locale, dir:dirValue});
		} else if(window.pe.scene.docType == "pres"){
		  if(!window.__pres2)
		  {
		  }
		  this.editorsPane = new concord.widgets.sidebar.EditorsPane({style:{width: "100%", padding: "20px 0 0 0"},title: '', id: "sidebar_editors_pane", lang: pe.scene.getLocale(), dir:dirValue});
		} else {
    	  this.editorsPane = new concord.widgets.sidebar.EditorsPane({style:{width: "100%", padding: "20px 0 0 0"},title: '', id: "sidebar_editors_pane", lang: pe.scene.getLocale(), dir:dirValue});
		}
		this.streamEditors = this.editorsPane.domNode ;
		panel.appendChild( this.editorsPane.domNode );
		dijit.setWaiState(this.editorsPane.domNode,'label', this.nls.editorsPaneDesc);
	},
	
	_buildDocsStream: function(panel){
		var container = dojo.create("div", {id: this.ll_docsstream_div_id}, panel);
		dojo.addClass(container, "docs-stream");
		if (BidiUtils.isGuiRtl() && navigator.userAgent.indexOf("Trident/7.0") != -1 ) {
			dojo.addClass(container, "ie11");
		}
		this._buildButton(container);
		this._buildStreamHeader(container);
		this._buildStreamContent(container);
		this._buildStreamFooter(container);
	},
	
	_buildButton: function(container)
	{
		var nls = pe.scene.nls;
		this.buttonHeader = dojo.create("div", {className:"stream-button-title lotusTitleBar2"}, container);
		var cmtBtn = new concord.widgets.LotusTextButton({label: nls.comment, id: "concord_comment_btn", onClick: dojo.hitch(pe.scene, "toggleCommentsCmd")});
		this.buttonHeader.appendChild(cmtBtn.domNode);
		concord.util.events.subscribe(concord.util.events.commentButtonDisabled, this, '_disableCommentBtn');
		this.commentBtn = cmtBtn;
	},
	
	_disableCommentBtn: function(disabled){
		var btn = dijit.byId("concord_comment_btn");
		if(btn) btn.setDisabled(disabled);
		if(pe.addCommentMenuItem)
			pe.menuItemDisabled(pe.addCommentMenuItem,disabled);
	},
	
	_buildStreamHeader: function(container){
		this.streamHeader = dojo.create("div", null, container);
		dojo.addClass(this.streamHeader,"stream-title hide");
		this.filterUtil = new concord.widgets.sidebar.CommentsFilterSearch(this);
		this.filterUtil._createFilterWidgets();
		this.topShadow = dojo.create("div", null, container);
	},
	
	_buildStreamContent: function(container){
		//commenting/assignment widgets
		this.streamContent = dojo.create("div", null, container);
		dojo.addClass(this.streamContent,"scrolled-window");
		dijit.setWaiRole(this.streamContent,'region'); 		
		dijit.setWaiState(this.streamContent,'label', this.nls.jawsDocsStream);
		this.connectArray.push(dojo.connect(this.streamContent, "onscroll", dojo.hitch(this, this._scrollHandler)));
		
		this.commentsController = new concord.widgets.sidebar.CommentsController(this.streamContent,this.widgetStore);
		this.filterUtil.commentsController = this.commentsController;
		this.filterUtil.streamContent = this.streamContent;
	},
	
	_buildStreamFooter: function(container){
		this.streamFooter = dojo.create("div", null, container);
		this.bottomShadow = dojo.create("div", null, this.streamFooter);		
	},	
	
	_initAsyncPane: function(){
		var container = dojo.byId(this.ll_docsstream_div_id);
		var imgContainer = dojo.create('div', {id:this.ll_comments_init_imgid}, container);
		imgContainer.style.display = 'block';

		dojo.addClass(imgContainer,'ll_sidebar_asyncImg_container');	 
		var imgDiv = dojo.create('span', null, imgContainer);
		dojo.addClass(imgDiv,'ll_sidebar_asyncImg');   	 
	}, 
	
    _regEvent: function(){
		concord.util.events.subscribe(concord.util.events.doc_data_changed, this, '_docDataChanged');
        
		var container = dojo.byId("ll_sidebar_div");
		if(container){
			this.connectArray.push(dojo.connect(container, "onkeydown", dojo.hitch(this, this._onKeyPress)));
		}
    },
    
    _isKeepScrollPosition: function(){
		if(dojo.hasClass(this.topShadow,'more-newer')){
			return true;
		}else{
			return false;
		}
    },
    
    _scrollHandler: function(event){
		this.nextScrollTop = this.streamContent.scrollTop;
		var key = event.keyCode || event.charCode;  
		var sw = event.target;
		if (sw == null) 
			sw = event.srcElement; 
		if(sw.scrollTop){
			dojo.addClass(this.topShadow,'more-newer');
		}else{
			dojo.removeClass(this.topShadow,'more-newer');
			this.commentsController._showWaitingWidgets(true);
			this.widgetStore.updateUIbySortResult();
			this.commentsController._updateFilteredStreamContent();
			this.commentsController._updateFilterMenu();
		}
		// detect at the bottom
		if (sw.clientHeight + sw.scrollTop >= sw.scrollHeight) {
			dojo.removeClass(this.bottomShadow,'more-older');
		}
		else {
			dojo.addClass(this.bottomShadow,'more-older');
		}    	
    },
	/**
	 * new a doc or others when the side bar is collapsed
	 */
	toggle_collapse: function(preventStatus)
	{	
  	    this.domNode.style.display = "";	  		             		 			  			  
	    this.collapse();
	    this.setStatus(preventStatus, pe.settings.SIDEBAR_COLLAPSE);
	},
	
	toggle: function(preventStatus){		
		if (this.domNode != null ) {
			if(this.isCollapsed()){				  		  
				this.expand(preventStatus);
			}else{	  		
				this.collapse(preventStatus);
			}
			//document may need revise the height      
			if( pe.scene.resizeSidebarDiv )
				pe.scene.resizeSidebarDiv(true);			
			}	
	},  
	
	expand: function(preventStatus){
		dojo.publish("sidePaneOpen", [{sidePane:this}]);
		
		if(!this._isKeepScrollPosition()){
			this.commentsController._showWaitingWidgets();
			this.filterUtil.filterStreamContentByType();
		}
		this.domNode.style.display = "";
		this.listener.sidebarResized(this.cmaxW);
		this.setButtonStatus(true);
		this.setStatus(preventStatus, pe.settings.SIDEBAR_OPEN);
		if(this.nextScrollTop)
			this.streamContent.scrollTop = this.nextScrollTop;
		setTimeout(dojo.hitch(this, function(){ 
			var panel = dojo.byId(this.ll_panel_div_id);
			dojo.style(panel, "display","block");
			dojo.addClass(this.domNode, "show-sidebar");
			if(this.filterUtil.newCommentsBannerShown){
				this.filterUtil._showNewCommentsDiv();
			}
			concord.widgets.sidebar.SideBar.resizeSidebar();
			setTimeout( dojo.hitch(pe.scene,pe.scene.setFocus), 0 );
		}),200);
	},
	
	collapse: function(preventStatus){   
		dojo.publish("sidePaneClose", [{sidePane:this}]);

		if(this.streamContent)
			this.nextScrollTop = this.streamContent.scrollTop;
		this.domNode.style.display = 'none';
		this.listener.sidebarResized(this.cminW);  
		this.setButtonStatus(false);
		this.setStatus(preventStatus, pe.settings.SIDEBAR_COLLAPSE);
		var panel = dojo.byId(this.ll_panel_div_id);
		dojo.style(panel, "display","none");
		dojo.removeClass(this.domNode, "show-sidebar");
		setTimeout( dojo.hitch(pe.scene,pe.scene.setFocus), 0 );
	},
	
	setButtonStatus: function(pressed){
		var sDiv = dojo.byId("concord_sidebar_btn");
		if(sDiv){	
			var title = this.nls.hideComments;
			if(pressed){	
				dojo.removeClass(sDiv, "commonsprites-streamOBtn");
				dojo.addClass(sDiv,"commonsprites-streamCBtn");
			}else{
				dojo.removeClass(sDiv,"commonsprites-streamCBtn");
				dojo.addClass(sDiv, "commonsprites-streamOBtn");
				title = this.nls.showComments;
			}			
			dojo.attr(sDiv,"title", title);
			dojo.attr(sDiv,'alt',title);
			dojo.attr(sDiv,"aria-label", dojo.string.substitute(this.nls.jawsSideBarAriaLabel, [title, title]));
			var txtNode = dojo.query(".ll_commmon_images_alttext", sDiv)[0];
			if(txtNode) {
				txtNode.innerHTML = '&#9608;';
			}
		}
	},
	
	setStatus: function(preventStatus, status){
		if(pe.settings){	
			if( preventStatus != 'yes' ){
				pe.settings.setSidebar(status);
			}
		}
	},
	
	isCollapsed: function(){			
		return this.domNode.style.display == 'none';
	},
	
	refreshAllforFirstClick: function() {
	   this.commentsController._updateUnreadStatus(0);
	   this.refresh();
	   this.setMaxWidth();
	   this.streamContent.scrollTop = 0;
	   this.widgetStore.updateUIbySortResult();
	},
	
	refresh: function() {
		var totalH = this.domNode.offsetHeight; 
		var editorH = this.streamEditors.clientHeight;
		var headerH = this.streamHeader.clientHeight;
		var buttonH = this.buttonHeader.clientHeight;
		var footerH = this.streamFooter.clientHeight;
		var stH = 40;//for sametime floating window
		var marginTop = dojo.style(this.streamContent, "marginTop"); //when displaying the comments search result, should subtract the marginTop
		var streamH = totalH - editorH - headerH -footerH - stH - buttonH - marginTop;
		this.commentsController.refresh(streamH);
	},
	
	setSidebarFocus: function(){
		if( !this.isCollapsed() ){
			this.editorsPane.grabFocus();
		}	
	},
	
	getMinWidth: function(){
		return this.cminW;
	},
	
	getMaxWidth: function(){
		return this.cmaxW;
	},
	
	checkMaxWidth: function()
	{
		var maxWidth = concord.util.browser.getBrowserWidth();
		if(window.pe.scene.docType == "sheet" || window.pe.scene.docType == "pres"){			
			if(maxWidth >= 1330){
				this.cmaxW = 300;
				this._setSidebarPadding("20px","260px");	
			}else{
				this.cmaxW = 225;
				this._setSidebarPadding("2px","221px");			
			}
		}else if(window.pe.scene.docType == "text"){
			var pageWidth = pe.lotusEditor._shell.view().getPage(1).getWidth();
			var nvw = parseInt(window.pe.scene.getNaviPanelWidth && window.pe.scene.getNaviPanelWidth());
			nvw = isNaN(nvw) ? 0: nvw;
			if(maxWidth > pageWidth + nvw +300){
				this.cmaxW = 300;
				this._setSidebarPadding("20px","260px");					
			}else if(maxWidth > pageWidth + nvw +200){
				this.cmaxW = maxWidth - pageWidth - nvw - 20;
				this._setSidebarPadding("2px",""+this.cmaxW-4+"px");
			}else{
				this.cmaxW = 180;
				this._setSidebarPadding("2px","176px");				
			}
		}
	},
	
	setMaxWidth: function(){
		this.checkMaxWidth();
		this.listener.sidebarResized(this.cmaxW);
	},
	
	_setSidebarPadding: function(pxValue,pxWidth){
		dojo.style(this.streamContent,"paddingLeft",pxValue);
		dojo.style(this.streamContent,"paddingRight",pxValue);
		this.filterUtil && this.filterUtil._setSidebarPadding(pxValue);
		this.editorsPane &&	this.editorsPane._setSidebarPadding(pxValue,pxWidth);
	},
	
	// perform resize after document content changed (css changed), such as change template.
	_docDataChanged: function(e)
	{	
		if( this.isCollapsed() ){
			this.listener.sidebarResized(this.cminW); 
		}else{ 
			this.listener.sidebarResized(this.cmaxW); 
		}
		
	}, 
	
	_onKeyPress: function(event){
		event = event || window.event;
		var key = (event.keyCode ? event.keyCode : event.which);
		if(key == dojo.keys.F4 && (event.ctrlKey || event.metaKey)){
			if (event.preventDefault) 
				event.preventDefault();
		}else if(key == dojo.keys.F2 && event.shiftKey){
			/*if(window.pe.scene.docType == "sheet"){
				var controller = pe.base.getContrller();
				var editor = controller.getInlineEditor();
				if(editor.isEditing()){
					editor.focus();
					editor.collapseToEnd();
					return;
				}
				pe.base._needFocus = true;
				pe.base.focus2Grid();
				dojo.stopEvent(event);
			}else{
				pe.scene.getEditor().focus();	
			}	 
			if (event.preventDefault) 
				event.preventDefault();	*/		
			conditionRenderer.grabSTBarFocus();
			event.preventDefault();
		}
	},
	
	usersJoined: function(){
 		if (this.editorsPane)
 			this.editorsPane.usersJoined();
	},
		
	userJoined: function(user){
		if (this.editorsPane)
			this.editorsPane.userJoined(user);
	},
	
	userLeft: function(user){
		if (this.editorsPane)
			this.editorsPane.userLeft(user);
	},
	
	open: function(preventStatus){
		if( this.isCollapsed()) this.expand(preventStatus);		
	},
	
	getPCommentsHoverStatus: function(commentId){
		var pWidgetObj =  concord.widgets.sidebar.PopupCommentsCacher.getCachedPComments();
		var pWidget = pWidgetObj.widget;
		var cached = pWidgetObj.cached;
		if(cached){	
			return pWidget.isMouseHovered(commentId);
		}else{
			return false;
		}		
	},
	
	onInsertComments: function(){
		var pWidgetObj =  concord.widgets.sidebar.PopupCommentsCacher.getCachedPComments();
		var pWidget = pWidgetObj.widget;
		var cached = pWidgetObj.cached;
		if(cached){	
			pWidget.updateComments();
		}else{
			pWidget.show();
		}		
	},
	
	getComment: function(commentId){
		return this.commentsController ? this.commentsController.getComment(commentId) : null;
	},
	
	switchToViewMode: function() {
		
	},
	
	switchToObserverMode: function() {
		
	},	
	
	switchToEditMode: function() {	
		
	},	
	/*
	_udateCommentsStatusToServer: function() {
		var status = pe.curUser.getUnreadCommentsStatus();
		var curId = pe.authenticatedUser.getId();
		var value = status.time + '_' + status.number;
		pe.scene.getEditorStore().updateIndicator(curId,'commentsstatus',value);
	},	
	*/
    destroySideBar: function(){
    	//this._udateCommentsStatusToServer();
    	//1- remove DOJO connections
		for(var i=0; i<this.connectArray.length; i++){
			dojo.disconnect(this.connectArray[i]);			
		}
		//2- destroy widgets
		this.filterUtil.destroy();
		this.widgetStore.destroy();		
		//3- nullify variables
		this.nullifyVariables();
    },
    
	nullifyVariables: function(){
		this.domNode= null;
		this.listener= null;
		this.nls= null;
    	this.connectArray= null;
    	this.widgetStore= null;
    	this.commentsController= null;
    	this.filterUtil= null;
	}
});
/*
 * When browser's size has been changed, adjust sidebar's dijit explicitly. 
 */
concord.widgets.sidebar.SideBar.resizeSidebar = function(){
	var sidebar = pe.scene.getSidebar();
	if(sidebar && !sidebar.isCollapsed()){
		sidebar.refresh();
		sidebar.setMaxWidth();
		if(sidebar.nextScrollTop)
			sidebar.streamContent.scrollTop = sidebar.nextScrollTop;				
	}
};