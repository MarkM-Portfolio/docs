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

dojo.provide("pres.widget.App");

dojo.require("dojo.cache");
dojo.require("dojo.window");
dojo.require("pres.Hub");
dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("dijit._Container");
dojo.require("pres.widget.SorterHeader");
dojo.require("pres.widget.Sorter");
dojo.require("pres.widget.SideBar");
dojo.require("pres.widget.MenuBar");
dojo.require("pres.widget.Toolbar");
dojo.require("pres.widget.Editor");
dojo.require("concord.util.BidiUtils");
dojo.require("dijit.Dialog");
dojo.require("dijit.DialogUnderlay");
dojo.require("dijit.layout.BorderContainer");
dojo.require("dijit.layout.ContentPane");
dojo.require("pres.widget.common.LinkPanel");
dojo.require("viewer.widgets.NavigatorBarManager");

//htmlviewer
if(DOC_SCENE && DOC_SCENE.mode && DOC_SCENE.mode=="html")
{
	dojo.require("viewer.widgets.PageIndicator");
	dojo.require("viewer.widgets.PresActions");
}

dojo.requireLocalization("concord.widgets", "slidesorter");
dojo.requireLocalization("concord.widgets", "toolbar");

dojo.declare("pres.widget.App", [dijit.layout.BorderContainer, dijit._Templated], {
	gutters: false,
	widgetsInTemplate: true,
	sorterShown: true,
	// an overlay to prevent user activity before data fully loaded.
	overlay: null,
	fitWindow: true,
	iframeSrc: "javascript:void(0)",
	initIFrame: function()
	{
		if (this.frameInited)
			return;
		this.frameInited = true;
		pe.scene.menutoolbarFrame = this.iframe;
		this.iframe.style.zIndex = 5;
		this.iframe.style.outline = "none";
		this.iframe.title = "Menubar and Toolbar";
		var win = this.iframe.contentWindow;
		var doc = win.document;
		var docElement = doc.documentElement;
		var mlang = dojo.attr(document.documentElement,'lang')||'en-us';
		dojo.attr(docElement,'lang',mlang);
		docElement.className = document.documentElement.className;
		var body = doc.body;
		body.className = document.body.className;
		body.innerHTML = "";
		this.connect(body, pe.scene.isMobileBrowser() ? "ontouchstart" : "onmousedown", function(e)
		{
			if (e.target == body)
			{
				if (this.menuBar)
					this.menuBar._cleanUp(true);

				var bannerHeight = 0;
				if (this.banner)
					bannerHeight = dojo.marginBox(this.banner).h;
				if (this.linkPanel)
					this.linkPanel.close();
				this.restoreIFrame();
				var ele = document.elementFromPoint(e.screenX, e.screenY);
				if (ele)
				{
					setTimeout(function()
					{
						var evt = document.createEvent("MouseEvents");
						evt.initMouseEvent("click", true, true, window, 0, e.screenX, e.screenY, e.clientX, e.clientY + bannerHeight,
							false, false, false, false, 0, null);
						ele.dispatchEvent(evt);
					}, 100);
				}
			}
		});

		var mainDiv = win.document.createElement("div");
		body.appendChild(mainDiv);
		dijit.setWaiRole(mainDiv,'main');
		dojo.attr(mainDiv,'aria-label','content area');
		
		var div = win.document.createElement("div");
		mainDiv.appendChild(div);
		var div2 = win.document.createElement("div");
		mainDiv.appendChild(div2);
		
		body.style.background = "transparent";
		var dir = BidiUtils.isGuiRtl() ? 'rtl' : 'ltr';

		var menuBarModel = this.menuBarModel;
		var toolbarModel = this.toolbarModel;

		win.pe = pe;
		pe.scene.iframeFocusMgr = new dijit.FocusManager();
		pe.scene.iframeFocusMgr.tag = "iframe";
		pe.scene.iframeFocusMgr.registerWin(win);
		dijit.a11yclick.initDocument(win.document);

		var mb = new pres.widget.MenuBar({
			dir: dir,
			ownerDocument: win.document,
			_focusManager: pe.scene.iframeFocusMgr
		}, div);
		mb.set("model", menuBarModel);
		mb.startup();
		mb.domNode.style.outline = "none";
		this.menuBar = mb;
		if (pe.scene.isEditCompactMode()) {
			dojo.style(this.menuBar.domNode, 'display', 'none');
		}

		var tb = new pres.widget.Toolbar({
			dir: dir,
			ownerDocument: win.document,
			_focusManager: pe.scene.iframeFocusMgr
		}, div2);
		tb.set("model", toolbarModel);
		var mode = pe.scene.lightEditMode ? pres.constants.ToolbarMode.LIGHT : pres.constants.ToolbarMode.ALL;
		tb.startup(mode);
		tb.domNode.style.outline = "none";

		this.toolbar = tb;
		if (pe.scene.compactEditMode || !(pe.settings && pe.settings.getToolbar())) {
			dojo.style(this.toolbar.domNode, 'display', 'none');
		}

		pres.utils.htmlHelper.setSelectable(this.toolbar.domNode, false);
		pres.utils.htmlHelper.setSelectable(this.menuBar.domNode, false);
		dojo.attr(this.menuBar.domNode,'aria-label','Menubar');
		dojo.attr(this.toolbar.domNode,'aria-label','Toolbar');
		
		var div3 = win.document.createElement("div");
		mainDiv.appendChild(div3);
		
		this.linkPanel = new pres.widget.common.LinkPanel({
			dir: dir,
			ownerDocument: win.document,
			_focusManager: pe.scene.iframeFocusMgr
		}, div3);
		
		dojo.attr(this.linkPanel.domNode,'aria-label','Linkpanel');
		
		this.linkPanel.domNode.style.position = "absolute";
		this.linkPanel.domNode.style.top = "-1000px";
		this.linkPanel.domNode.style.zIndex = "999";
		/*
		this.iframe.onfocus = win.document.onfocus = dojo.hitch(this, function()
		{
			setTimeout(dojo.hitch(this, function()
			{
				if (!this.menuBar.focusedChild && !this.toolbar.focusedChild)
					this.menuBar.focus();
			}), 10);
		});
		*/
		this.subscribe("/header/dropdown/open", function(){
			if (pe.scene.slideEditor && pe.scene.slideEditor.linkPanelShow)
				pe.scene.slideEditor.closeLink();
			
			this.enlargeIFrame();
		});
		this.subscribe("/header/dropdown/close", function(){
			if (pe.scene.slideEditor && (pe.scene.slideEditor.linkPanelShow || pe.scene.slideEditor.opcityPanelShow))//|| pe.scene.slideEditor.borderStylePanelShow))
				return;
			this.restoreIFrame();
			var featureWShow = concord.feature.FeatureController.isWidgetShown();
			if(!pe.scene.hub.commentsHandler.clickedComment && !featureWShow){
				if(pe.scene.hub && pe.scene.hub.focusMgr && pe.scene.hub.focusMgr.isCopyPasteIssueCases()) {
					pe.scene.hub.focusMgr.onFocusOut();
				}	
			}
		});
		if(concord.util.uri.isCCMDocument())
		{
			pe.scene.initReviewMenu();
		}
		else 
		{
			if(pe.reviewMenuItem)
			{
				pe.reviewMenuItem.domNode.style.display = 'none';
			}			
		}
		this.resize();
	},
	
	focusToolbar: function()
	{
		if (this.toolbar && this.toolbar.domNode.style.display != "none")
			this.toolbar.focus();
	},
	
	focusMenuBar: function()
	{
		if (this.menuBar && this.menuBar.domNode.style.display != "none")
			this.menuBar.focus();
	},
	
	focusSidebar: function()
	{
		var sidebar = pe.scene.getSidebar();
		if (sidebar){
			if (sidebar.isCollapsed()){
				pe.scene.toggleSideBarCmd();
			}else{
				setTimeout( function(){	
					sidebar.setSidebarFocus();	
				}, 200);						
			}    				
		}else{
			pe.scene.toggleSideBarCmd();
		}
	},

	toggleToolbar: function(show)
	{
		this.toolbar.domNode.style.display = show ? "" : "none";
		this.resize(true);
	},

	toggleSorter: function(show)
	{
		// change toolbar showSorter status
		var toolbarStrs = dojo.i18n.getLocalization("concord.widgets", "toolbar");
		var s = pe.scene;
		var c = pres.constants;
		var dom = this.sorterContainer.domNode;
		if (show)
		{
			dom.style.width = "210px";
			dom.style.overflowY = "auto";
			s.hub.toolbarModel.setIconLabel(c.CMD_SHOWSORTER,'sorterHideIcon', toolbarStrs.hideSorterTip);
			s.hub.commandsModel.setValue(c.CMD_SHOWSORTER, true);
		}
		else
		{
			dom.style.width = "0px";
			dom.style.overflowY = "hidden";
			s.hub.toolbarModel.setIconLabel(c.CMD_SHOWSORTER,'sorterShowIcon', toolbarStrs.showSorterTip);
			s.hub.commandsModel.setValue(c.CMD_SHOWSORTER, false);
		}
		this.sorterShown = show;
		this.resize(true);
	},

	enlargeIFrame: function()
	{
		this.iframe.style.height = "100%";
	},

	restoreIFrame: function()
	{
		this.iframe.style.height = this.getMenuToolbarHeight() + "px";
	},

	getMenuToolbarHeight: function()
	{
		var h = (this.menuBar ? dojo.marginBox(this.menuBar.domNode).h : 0) + 
				(this.toolbar ? dojo.marginBox(this.toolbar.domNode).h : 0);
		return h;
	},

	buildRendering: function()
	{
		this.banner = dojo.byId("banner");
		
		if (pe.scene.isWebkitApp)
			this.banner.style.display = "none";
		
		if (!pe.scene.isHTMLViewMode() && !pe.scene.isMobile && !pe.scene.isWebkitApp)
		{
			window.menutoolbarLoaded = dojo.hitch(this, this.initIFrame);
			this.iframeSrc = window.contextPath + window.staticRootPath + "/js/concord/templates/menutoolbar.html";
		}
		
		// for better build...
		var template = dojo.cache("pres", "templates/App.html");
		var rtlTemplate = dojo.cache("pres", "templates/App_Rtl.html");
		var mobileTemplate = dojo.cache("pres", "templates/App_Mobile.html");
		
		if (pe.scene.isMobile)
			this.templateString = mobileTemplate;
		else if (pe.scene.isWebkitApp)
			this.templateString = dojo.cache("pres", "templates/App_MobileApp.html");
		else
			this.templateString = BidiUtils.isGuiRtl() ? rtlTemplate : template;
		
		if (pe.scene.isViewCompactMode()) {
			this.templateString = dojo.cache("pres", "templates/App_ViewerCompact.html");
		}

		if(pe.scene.isHTMLViewMode()&& !concord.util.browser.isMobile() && !concord.util.browser.isMobileBrowser())  // pe.scene.isViewCompactMode()
		{
		    dojo.subscribe("/data/loaded", this, this.createActionsAndPageIndicator);
		}
		
		this.inherited(arguments);

		if(pe.scene.isHTMLViewMode()) {
			dojo.style(this.sorterHeader.domNode, 'display', 'none');
		}
	},
	
	createActionsAndPageIndicator: function(isFull) {
		var actions=this.createActions();
		var pageIndicator=null;
		if (isFull) {
			pageIndicator=this.createPageIndicator();
		}
		var manager=new viewer.widgets.NavigatorBarManager(actions,pageIndicator);
		manager.registerEvents();
		
	},
	
	createPageIndicator: function() {		
		var indicator = new viewer.widgets.PageIndicator({
			id: "T_PageIndicator",
			pageNum: pe.scene.doc.slides.length,
			viewManager: this
		});
		dojo.body().appendChild(indicator.domNode);
		indicator.position();
		return indicator;
	},
	
	createActions: function(){
		var actions = new viewer.widgets.PresActions({
			id: "T_Actions",
			manager: this
		});
		dojo.body().appendChild(actions.domNode);
		actions.position();
		return actions;
	},
	
	resize: function(force)
	{
		// Workaround: do not layout in mobile app if there is an editing box, otherwise we will lose focus
		var s = pe.scene;
		if (s.isWebkitApp && s.editor.getEditingBox())
		 	return;
		// do not do resize when zoom whole page in mobile
		if (s.slideEditor._touchZoom) {
			s.slideEditor._touchZoom = false;
			return;
		}
		// do not layout when new comment dialog is open 
		if (s.isMobileBrowser() && (s.editor.getEditingBox()||(s.hub && s.hub.commentsHandler && s.hub.commentsHandler.clickedComment)))
		 	return;
		if (!this.resizeInited || !s.isMobile || force)
		{
			if (this.banner)
			{
				var box = dojo.window.getBox();
				if (this.menuBar && this.toolbar)
				{
					var h = this.getMenuToolbarHeight();
					this.iframe.style.height = h + "px";
					this.belowContainer.domNode.style.marginTop = h + "px";
				}
				var bannerHeight = dojo.marginBox(this.banner).h;
				var height = box.h - bannerHeight;
				this.domNode.style.height = height + "px";
				this.inherited(arguments);
				this.resizeInited = true;
				
				s.setFocus();
			}
		}
	},

	startup: function()
	{
		if (this._started)
			return;
		this.inherited(arguments);

		this.overlay = new dijit.DialogUnderlay();
		this.overlay.show();
		this.overlay.node.style.opacity = 0;
		this.overlay.domNode.style.zIndex = 200;

		this.subscribe("/data/master/loaded", function(full)
		{
			this.overlay.hide();
			this.updatePageNumber();
			dojo.publish("/app/ready", []);
			var s = pe.scene;
			// Tell native app we are done
			if (s.isWebkitApp)
			{
				webkit.messageHandlers["iconcord"].postMessage(
						{
							type: "application",
							name: "presentation",
							key: "status",
							value: "ready"
						});
			};
			// finish load, hide sorter & siderbar on mobile
			if (!s.isHTMLViewMode()) {
				if (s.lightEditMode || s.isMobileBrowser()) {
					this.sorterContainer && this.toggleSorter(false);
					s.sidebars && s.sidebars.sidebar.collapse();
				} else {
					this.sorterContainer && this.toggleSorter(true);
				}
			}
		});
		this.subscribe("/mask/show", function(full)
		{
			this.overlay.show();
		});
		this.subscribe("/mask/hide", function(full)
		{
			if (pe.scene.isLoadFinished())
				this.overlay.hide();
		});

		this.subscribe("/thumbnail/selected", this.updatePageNumber);
		this.subscribe("/thumbnail/selected", this.adjustSlideValue);
		this.subscribe("/slide/inserted", this.updatePageNumberBySlideUpdate);
		this.subscribe("/slides/moved", this.updatePageNumberBySlideUpdate);
		this.subscribe("/slide/deleted", this.updatePageNumberBySlideUpdate);
		this.subscribe("/slides/deleted", this.updatePageNumberBySlideUpdate);

		if (this.header)
			pres.utils.htmlHelper.setSelectable(this.header, false);

		if (pe.scene._sizeBarWidth)
			this.onSideBarResized(pe.scene._sizeBarWidth);

		setTimeout(dojo.hitch(this, function()
		{
			this.resize();
		}), 0);
	},

	updatePageNumberBySlideUpdate: function(slides, eventSource)
	{
		clearTimeout(this._updatePageNumberTimer);
		this._updatePageNumberTimer = setTimeout(dojo.hitch(this, this.updatePageNumber), 50);
	},

	updatePageNumber: function()
	{
		var total = pe.scene.doc.slides.length;
		var currentIndex = pe.scene.slideSorter.getCurrentIndex() + 1;
		if (BidiUtils.isArabicLocale()){
			total = BidiUtils.convertArabicToHindi(total + "");
			currentIndex = BidiUtils.convertArabicToHindi(currentIndex + "");
		}
		var htmlString = dojo.string.substitute(this.strings.slideOf, [currentIndex, total]);
		this.sorterHeader.setContent(htmlString);
	},

	onSideBarResized: function(w)
	{
		this.sideBar.onSideBarResized(w);
	},

	adjustSlideValue: function()
	{
		// adjust slide by resize for (fitWindow = true)
		if(pe.scene.doc && this.fitWindow)
		{
			clearTimeout(this._adjustSlideTimer);
			this._adjustSlideTimer = setTimeout(dojo.hitch(this, this._adjustSlideValue), 100);
		}
	},

	_adjustSlideValue: function()
	{
		// fitWindow mode
		var cm = pe.scene.hub.commandsModel;
		var realHeight = pres.utils.helper.cm2pxReal(pe.scene.doc.slides[0].h);
		var scale = this.editor.slideEditor.mainBoxH / realHeight;
		var value = Math.round(scale * 100);
		this.sliderDisabled = true;
		cm.setValue(pres.constants.CMD_ZOOM, value);
		clearTimeout(this._disableSlide);
		this._disableSlide = setTimeout(dojo.hitch(this, function()
		{
			this.sliderDisabled = false;
		}), 500);
	},
	
	zoom: function(value)
	{
		// called by action triggered, CMD_ZOOM value changed.
		var editor = pe.scene.editor;
		var slideEditor = pe.scene.slideEditor;
		if (!pe.scene.isMobileBrowser()) {
			// keep box is editing model in mobile
			var box = editor.getEditingBox();
			if (box)
				box.exitEdit();
		}
		if(!this.sliderDisabled)
			this.fitWindow = false;
		slideEditor.zoom(this.fitWindow ? 0 : value / 100);
	},
	
	zoomFit: function()
	{
		var editor = pe.scene.editor;
		var slideEditor = pe.scene.slideEditor;
		if (!pe.scene.isMobileBrowser()) {
			// keep box is editing model in mobile
			var box = editor.getEditingBox();
			if (box)
				box.exitEdit();
		}
		this.fitWindow = true;
		slideEditor.zoom(0);
		this._adjustSlideValue();
		setTimeout(function(){
			slideEditor.domNode.focus();
		}, 0);
	},

	postCreate: function()
	{
		this.inherited(arguments);
		pe.scene.presApp = this;
		dojo.addClass(this.domNode, "presApp");
		this.connect(this.editor.slideEditor, "resize", "adjustSlideValue");
		this.strings = dojo.i18n.getLocalization("concord.widgets", "slidesorter");
		
		if (pe.scene.isHTMLViewMode() || pe.scene.isMobile)
		{
			if (this.iframe)
				dojo.destroy(this.iframe);
		}
	}

});
