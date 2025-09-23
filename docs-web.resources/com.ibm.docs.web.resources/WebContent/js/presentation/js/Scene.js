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

dojo.provide("pres.Scene");

dojo.require("dojo.number");
dojo.require("concord.spellcheck.scaytservice");
dojo.require("concord.beans.Document");
dojo.require("concord.scenes.AbstractScene");
dojo.require("concord.beans.User");
dojo.require("concord.beans.Profile");
dojo.require("concord.beans.ProfilePool");
dojo.require("concord.beans.Participant");
dojo.require("concord.net.Session");
dojo.require("concord.widgets.viewPresForHtmlPrint");
dojo.require("concord.widgets.CommentsEventListener");
dojo.require("dojo.i18n");
dojo.require("dojo.cookie");
dojo.require("pres.model.Document");
dojo.require("pres.widget.App");
dojo.require("concord.util.resizer");
dojo.require("concord.beans.EditorStore");
dojo.require("pres.msg.Receiver");
dojo.require("pres.Locker");
dojo.require("pres.msg.Publisher");
dojo.require("pres.msg.UndoManager");
dojo.require("concord.i18n.ClassName");
dojo.require("concord.util.HtmlContent");
dojo.require("pres.handler.SlideShowHandler");
dojo.require("concord.util.mobileUtil");
dojo.require("concord.util.A11YUtil");
dojo.require("concord.pres.TextMsg");
dojo.require("pres.utils.a11yUtil");
dojo.require("pres.Hub");
dojo.require("pres.perf");
dojo.require("pres.print.HtmlPrint");
dojo.require("pres.print.PDFDialog");
dojo.require("pres.spellCheckService");

dojo.require("pres.mobile.mobileUtilAdapter");
dojo.require("pres.mobile.SnapshotMgr");
dojo.require("pres.widget.MenuTooltip");

dojo.require("pres.api");

// For Html Viewer.
dojo.require("concord.net.HtmlViewConnector");

dojo.requireLocalization("concord.scenes", "Scene");
dojo.requireLocalization("concord.widgets", "CKResource");
dojo.requireLocalization("concord.widgets", "menubar");

var ProfilePool = new concord.beans.ProfilePool();

window.g_presentationMode = true;

dojo.declare("pres.Scene", [concord.scenes.AbstractScene, concord.widgets.CommentsEventListener, pres.handler.SlideShowHandler], {

	loadFormat: "json",
	loadInitSlide: 5,

	editMode: false,
	hub: null,
	slideSorterContainerId: "slideSorterContainer",
	sideBarSlideSorterPaneId: "sidebar_slidesorter_pane",
	bLoadFinished: false,
	canCacheSlideHTMLDiv: false,

	// set to sorter and editor.
	defaultFonts: "Arial,Helvetica,sans-serif",

	// only for slideShow(?) (not related with content lang, only with browser locale)
	defaultBrowserFonts: "Arial,Helvetica,sans-serif",
	
	isMobileBrowser: function()
	{
		return pres.utils.helper.isMobileBrowser();
	},
	
	getLocale: function()
	{
		return this.locale;
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
    	
    	var extension = DOC_SCENE.extension;
		var shapeEnabled = false;
		if (extension && extension.toLowerCase() == 'pptx' && !DOC_SCENE.isOdfDraft)
			shapeEnabled = true;
		
    	return dojo.filter(featureIDs, function(id){
    		if(id == "PRES_Shape" || id == "PRES_NINE_NEW_SHAPE" || id == "PRES_COMMENTS_ROUNDTRIP")
    		{
    			if (!shapeEnabled)
    				return false;
    		}
    		if(id == "PUBLISH_BUTTON")
    		{
    			return pe.scene.myHeader.isPublishBtnShown();
    		}
    		if(id == "AUTO_PUBLISH" || id == "PRES_AUTO_PUBLISH")
    		{
    			if(!pe.scene.autoPublishFeature())
    				return false;    			
    		}
    		if(id == "PRES_OPACITY_IMAGE" || id == "PRES_OPACITY_OBJECT" || id == "PRES_LINE_STYLE" )
    		{
    			return shapeEnabled;
    		}
    		if (id == "COMMON_COEDIT")
    		{
    			return (pe.scene.myHeader.getSharePosition() != null);	
    		}
    		if (id == "PRES_SLIDES")
    		{
    			var toolbarNode = pe.scene.presApp.toolbar? pe.scene.presApp.toolbar.domNode : null;
				if(!toolbarNode || toolbarNode.style.display == "none"){
					return false;
				}
    		}  
    		if (id == "PRES_COMMENT")
    		{
    			if(pe.scene.isPPTOrODP()){
    				return false;
    			}    			
    		}
    		return true;
    	});
    },

	getFeaturePosition: function(featureID)
	{
		var c = pres.constants;
		var commandsModel = pe.scene.hub.commandsModel;
		if (featureID == "PRES_Download" || featureID == "PRES_COMMENTS_ROUNDTRIP")
		{
			var menubar = pe.scene.presApp.menuBar;
			var iframe = dojo.byId("menutoolbarFrame");
			var fileMenuDom = dojo.query(".dijitMenuItem[name='file']",menubar.domNode)[0];
			
			if (fileMenuDom)
			{
				var fileMenu = dijit.byNode(fileMenuDom);
				
				if (fileMenu)
				{
					menubar._openItemPopup(fileMenu, false);
					var downloadMenuDom = dojo.query(".dijitMenuItem[name='download']",iframe.contentWindow.document)[0];
					if (downloadMenuDom)
					{
						var iframePos = dojo.position(iframe);
						var subMenu = dijit.byNode(downloadMenuDom);
						var pos = dojo.position(subMenu.domNode);
						var x = iframePos.x + this.getMenuFeatureXPos(pos);
						var y = pos.y + iframePos.y + 5;
						return {x: x, y: y, m: 1};
					}
				}
			}
		}
		
		else if (featureID == "PRES_Toolbar")
		{
			var iframe = dojo.byId("menutoolbarFrame");
			var toolbar = pe.scene.presApp.toolbar;
			if (iframe && toolbar)
			{
				var iframePos = dojo.position(iframe);
				var pos = dojo.position(toolbar.domNode);
				var x = pos.x + iframePos.x + pos.w/2 ;
				var y = pos.y + iframePos.y;
				return {x: x, y :y};
			}
		}
		else if (featureID == "PRES_Sorter" || featureID == "PRES_ORDER")
		{
			var sorter = pe.scene.slideSorter;
			if (sorter)
			{
				{
					var pos = dojo.position(sorter.domNode);
					var y = pos.y + 60;
					var x = pos.x + 100;
					return {x: x, y :y, m: 1};
				}
			}
		}
		else if (featureID == "PRES_Zoom")
		{
			var iframe = dojo.byId("menutoolbarFrame");
			var zoom = dijit.byId("toolbar_zoom");
			if (iframe && zoom)
			{
				var dom = zoom.domNode;
				var iframePos = dojo.position(iframe);
				var pos = dojo.position(dom);
				var x = pos.x + iframePos.x + pos.w/2 ;
				var y = iframePos.y + pos.h + pos.y;
				return {x: x, y :y};
			}
		}
		else if (featureID == "PRES_Shape" || featureID == "PRES_NINE_NEW_SHAPE")
		{
			var iframe = dojo.byId("menutoolbarFrame");
			var shape = dijit.byId("toolbar_drag_create_shape");
			if (iframe && shape)
			{
				var dom = shape.domNode;
				var iframePos = dojo.position(iframe);
				var pos = dojo.position(dom);
				var x = iframePos.x + pos.x + pos.w/2 + (BidiUtils.isGuiRtl() ? 10 : -10);
				var y = iframePos.y + pos.h + pos.y + 5;
				return {x: x, y :y};
			}
		}
		// 1.3.6
		else if (featureID == "PRES_LINESPACE")
		{
			var menubar = pe.scene.presApp.menuBar;
			var iframe = dojo.byId("menutoolbarFrame");
			var fileMenuDom = dojo.query(".dijitMenuItem[name='format']",menubar.domNode)[0];
			
			if (fileMenuDom)
			{
				var fileMenu = dijit.byNode(fileMenuDom);
				
				if (fileMenu)
				{
					menubar._openItemPopup(fileMenu, false);
					var downloadMenuDom = dojo.query(".dijitMenuItem[name='linespacing']",iframe.contentWindow.document)[0];
					if (downloadMenuDom)
					{
						commandsModel.setEnabled(c.CMD_LINESPACING, true);
						var iframePos = dojo.position(iframe);
						var subMenu = dijit.byNode(downloadMenuDom);
						var pos = dojo.position(subMenu.domNode);
						var x = iframePos.x + this.getMenuFeatureXPos(pos);
						var y = pos.y + iframePos.y + 5;
						return {x: x, y: y, m: 1};
					}
				}
			}
		}
		else if (featureID == "PRES_HYPERLINK")
		{
			var iframe = dojo.byId("menutoolbarFrame");
			var shape = dijit.byId("toolbar_add_link");
			if (iframe && shape)
			{
				commandsModel.setEnabled(c.CMD_LINK_ADD, true);
				var dom = shape.domNode;
				var iframePos = dojo.position(iframe);
				var pos = dojo.position(dom);
				var x = iframePos.x + pos.x + pos.w/2 + (BidiUtils.isGuiRtl() ? 10 : -10);
				var y = iframePos.y + pos.h + pos.y + 5;
				return {x: x, y :y};
			}
		}
		else if (featureID == "AUTO_PUBLISH" || featureID == "PRES_AUTO_PUBLISH")
		{
			var menubar = pe.scene.presApp.menuBar;
			var iframe = dojo.byId("menutoolbarFrame");
			var fileMenuDom = dojo.query(".dijitMenuItem[name='file']",menubar.domNode)[0];
			
			if (fileMenuDom)
			{
				var fileMenu = dijit.byNode(fileMenuDom);
				
				if (fileMenu)
				{
					menubar._openItemPopup(fileMenu, false);
					var autoPublish = dojo.query(".dijitMenuItem[name='autopublish']",iframe.contentWindow.document)[0];
					if (autoPublish)
					{
						var iframePos = dojo.position(iframe);
						var subMenu = dijit.byNode(autoPublish);
						var pos = dojo.position(subMenu.domNode);
						var x = iframePos.x + this.getMenuFeatureXPos(pos);
						var y = pos.y + iframePos.y + 5;
						return {x: x, y: y, m: 1};
					}
				}
			}
		}
		else if (featureID == "PUBLISH_BUTTON")
		{
			return this.myHeader.getPublishPosition();	
		}
		else if (featureID == "COMMON_COEDIT")
		{
			return this.myHeader.getSharePosition();	
		}
		else if (featureID == "PRES_COMMENT")
		{
			return this.myHeader.getCommentPosition();	
		}		
		//1.3.8
		else if (featureID == "PRES_OPACITY_IMAGE")
		{
			var menubar = pe.scene.presApp.menuBar;
			var iframe = dojo.byId("menutoolbarFrame");
			var fileMenuDom = dojo.query(".dijitMenuItem[name='format']",menubar.domNode)[0];
			
			if (fileMenuDom)
			{
				var fileMenu = dijit.byNode(fileMenuDom);
				
				if (fileMenu)
				{
					menubar._openItemPopup(fileMenu, false);
					var downloadMenuDom = dojo.query(".dijitMenuItem[name='open_transparency_dialog']",iframe.contentWindow.document)[0];
					if (downloadMenuDom)
					{
						commandsModel.setEnabled(c.CMD_TRANSPARENCY_DIALOG_OPEN, true);
						var iframePos = dojo.position(iframe);
						var subMenu = dijit.byNode(downloadMenuDom);
						var pos = dojo.position(subMenu.domNode);
						var x = iframePos.x + this.getMenuFeatureXPos(pos);
						var y = pos.y + iframePos.y + 5;
						return {x: x, y: y, m: 1};
					}
				}
			}
		}
		else if (featureID == "PRES_OPACITY_OBJECT")
		{
			var iframe = dojo.byId("menutoolbarFrame");
			var bgColorDropDown = dijit.byId("toolbar_bg_color");			
			var bgColorPanel = dijit.byId("toolbar_bg_color_popup");
			if(bgColorDropDown && bgColorDropDown && bgColorPanel)
			{
				bgColorDropDown.openDropDown();
				var iframePos = dojo.position(iframe);
				var pos = dojo.position(bgColorDropDown.domNode);
				var size = dojo.position(bgColorPanel.domNode);
				var x = iframePos.x + pos.w/2 + pos.x;
				var y = iframePos.y + size.h + pos.y + 32;
				return {x: x, y :y};
			}
		}
		//1.3.11
		else if(featureID == "PRES_LINE_STYLE")
		{
			var iframe = dojo.byId("menutoolbarFrame");
			var shape = dijit.byId("toolbar_border_color");
			if (iframe && shape)
			{
				var dom = shape.domNode;
				var iframePos = dojo.position(iframe);
				var pos = dojo.position(dom);
				var x = iframePos.x + pos.x + pos.w/2 + (BidiUtils.isGuiRtl() ? 10 : -10);
				var y = iframePos.y + pos.h + pos.y + 15;
				return {x: x, y :y};
			}
		}
		else if(featureID == "PRES_MORE_COEDITOR")
		{
			var editorIcon = dojo.byId("ll_sidebar_panel");
			//bubble size : 251 * 140
			var slideDom = pe.scene.slideEditor.domNode;
			var iconPos = dojo.position(slideDom);
			if(editorIcon &&dojo.style(editorIcon, "display") != "none" )
			{
				var x = iconPos.x + iconPos.w - 240;
				var y = iconPos.y + 10 ;
				return {x: x, y: y, r: 1};
			}
			else if(editorIcon &&dojo.style(editorIcon, "display") == "none")
			{
				var y = iconPos.y + 80;
				var x = iconPos.x + iconPos.w  - 135;
				return {x: x, y: y, c: 1};
			}
		}
		// 2.0
		else if(featureID == "COMMON_TOUR")
		{
			var menubar = pe.scene.presApp.menuBar;
			var iframe = dojo.byId("menutoolbarFrame");
			var helpMenuDom = dojo.query(".dijitMenuItem[name='help']",menubar.domNode)[0];
			
			if (helpMenuDom)
			{
				var helpMenu = dijit.byNode(helpMenuDom);
				
				if (helpMenu)
				{
					menubar._openItemPopup(helpMenu, false);
					var tour = dojo.query(".dijitMenuItem[name='helptour']",iframe.contentWindow.document)[0];
					if (tour)
					{
						var iframePos = dojo.position(iframe);
						var subMenu = dijit.byNode(tour);
						var pos = dojo.position(subMenu.domNode);
						var x = iframePos.x + this.getMenuFeatureXPos(pos);
						var y = pos.y + iframePos.y + 5;
						return {x: x, y: y, m: 1};
					}
				}
			}
		}
		else if(featureID == "PRES_SLIDES")
		{
			var iframe = dojo.byId("menutoolbarFrame");
			var newslide = dijit.byId("toolbar_create_slide");
			if (iframe && newslide)
			{
				var dom = newslide.domNode;
				var iframePos = dojo.position(iframe);
				var pos = dojo.position(dom);
				var x = iframePos.x + pos.x + pos.w/2 + (BidiUtils.isGuiRtl() ? 10 : -10);
				var y = iframePos.y + pos.h + pos.y + 15;
				if(y < 0) {
					y += 162; 
				}
				return {x: x, y :y};
			}
		}
	},
	
	afterFeatureShow: function(featureID)
	{
		var c = pres.constants;
		var commandsModel = pe.scene.hub.commandsModel;
		switch(featureID) {
		    case "COMMON_TOUR":
		    case "PRES_AUTO_PUBLISH":
			case "AUTO_PUBLISH":				
			case "PRES_Download": 
			case "PRES_LINESPACE":
				var menubar = pe.scene.presApp.menuBar;
				menubar._cleanUp(true);
				commandsModel.setEnabled(c.CMD_LINESPACING, false);
				break;
			case "PRES_HYPERLINK":
				commandsModel.setEnabled(c.CMD_LINK_ADD, false);
				break;
			case "PRES_OPACITY_IMAGE":
				var menubar = pe.scene.presApp.menuBar;
				menubar._cleanUp(true);
				commandsModel.setEnabled(c.CMD_TRANSPARENCY_DIALOG_OPEN, false);
				break;
			case "PRES_OPACITY_OBJECT":
				var bgColorDropDown = dijit.byId("toolbar_bg_color");
				if(bgColorDropDown)
					bgColorDropDown.closeDropDown();
				break;
		}
	},
	appendHtmlActions: function(actions)
	{
		// view mode will use floating button for slideshow
		if (this.isHTMLViewMode())
			return;

		var menuStrs = dojo.i18n.getLocalization("concord.widgets", "menubar");
		var li = document.createElement("li");
		li.style.marginTop = "3px";
		var cmtBtn = new concord.widgets.LotusTextButton({label: menuStrs.presentationMenu_SlideShow, showLabel:false, iconClass: "htmlViewerPlayIcon",  id: "htmlViewerPlayIcon", onClick: function(){
			dojo.publish("/command/exec", [pres.constants.CMD_SLIDE_SHOW]);
		}});
		var lastchild = cmtBtn.domNode.lastChild;
		if (lastchild && lastchild.nodeName.toLowerCase() == "input") {
			dijit.setWaiRole(lastchild, "button");
			lastchild.setAttribute("aria-labelledby", cmtBtn.id);
		}
		li.appendChild(cmtBtn.domNode);
		/*
		var cmtBtn = new concord.widgets.LotusTextButton({label: menuStrs.fileMenu_Print, showLabel:false, iconClass: "htmlViewerPrintIcon",  id: "htmlViewerPrintIcon", onClick: function(){
			dojo.publish("/command/exec", [pres.constants.CMD_PRINT]);
		}});
		li.appendChild(cmtBtn.domNode);
		*/
		actions.appendChild(li);
	},
	
	getEditor: function()
	{
		return pe.scene.slideEditor;
	},

	isLoadFinished: function()
	{
		return this.bLoadFinished;
	},

	setLoadFinished: function(b)
	{
		this.bLoadFinished = b;
	},

	enabledTrackChange: function()
	{
		return pe.settings.getIndicator();
	},

	turnOnColorShading: function(isTurnOn, userId)
	{
		if (!this._userColorMap)
			this._userColorMap = {};
		this._userColorMap[userId] = isTurnOn;
		dojo.publish("/user/color/show", [userId, isTurnOn]);
	},

	toggleCoEditIndicator: function()
	{
		var show = true;
		if (pe.settings.getIndicator())
		{
			dojo.removeClass(dojo.doc.body, 'user_indicator');
			show = false;
		}
		else
		{
			dojo.addClass(dojo.doc.body, 'user_indicator');
			show = true;
		}
		pe.settings.settings.show_indicator = show ? 'yes' : 'no';
		pe.settings.setIndicator(show);
	},

	requestLockStatus: function()
	{
		var msgPub = pe.scene.msgPublisher;
		var msg = msgPub.createRequestLockStatusMsg();
		var msgPairsList = [];
		msgPairsList.push(msg);
		msgPub.sendMessage(msgPairsList);
	},

	handleRequestLockStatus: function()
	{
		dojo.publish("/scene/coedit/started", []);
	},

	removeUserLocks: function(userId)
	{
		var sendMsg = !userId;
		userId = userId ? userId : pe.authenticatedUser.getId();
		var result = this.locker.removeUser(userId);
		if (sendMsg)
		{
			var msgPub = this.msgPublisher;
			var msgPairsList = [];
			msgPairsList.push(msgPub.createRemoveUserLockMsg());
			msgPub.sendMessage(msgPairsList, null);
		}
	},

	handleRemoveUserLocks: function(userObj)
	{
		this.locker.removeUser(userObj.getEditorId());
	},

	openLockMessageDialog: function(slidesOrBoxes)
	{
		var curTime = new Date().getTime();
		var timeLapse = curTime - this.openLockMessageDialogTmStamp;
		this.openLockMessageDialogTmStamp = curTime;
		if (timeLapse > 500)
		{
			var widgetId = "P_d_LockMessage";
			var contentId = "P_d_LockMessage_MainDiv";
			var message = this.editornls.contentInUseAll; // default message, assume slide content object
			var title = this.editornls.contentInUse; // default title, assume slide content object
			// check if it is a slide or slide content object, we have different message and title to show
			var obj = slidesOrBoxes[0];
			var ids = dojo.map(slidesOrBoxes, function()
			{
				return obj.id;
			});
			var isSlide = (obj && obj instanceof pres.model.Slide);
			var userList = [];
			if (isSlide == true)
			{
				message = this.editornls.slidesInUseAll;
				title = this.editornls.slidesInUse;
			}
			userList = this.locker.getMultipleLockedOtherUsers(ids, isSlide);
			this.lockMessageDialog = new pres.widget.Dialog({
				'id': widgetId,
				'title': title,
				'content': "<div id='" + contentId + "' style='padding:15px;'> </div>",
				'presModal': true,
				'dialogWidth': 550,
				'destroyOnClose': true,
				'presDialogButtons': [{
					'label': this.editornls.ok,
					'action': dojo.hitch(this, function()
					{
					})
				}]
			});
			this.lockMessageDialog.startup();
			this.lockMessageDialogContent(id, widgetId, contentId, userList, message);
			this.lockMessageDialog.show();
		}
	},

	lockMessageDialogContent: function(id, widgetId, contentId, users, message)
	{
		var dialogContentDiv = dojo.byId(contentId);
		var contentStringArray = new Array();
		contentStringArray.push("<p><b>" + message + "</b></p><br>");
		contentStringArray.push("<ol>");
		for ( var i = 0; i < users.length; i++)
		{
			var user = ProfilePool.getUserProfile(users[i]);
			contentStringArray.push("<li>" + user.getName() + "&nbsp; &nbsp; " + this.editornls.contentLockemail + ": <i>" + user.getEmail() + "</i></li>");
		}
		contentStringArray.push("</ol>");
		var contentString = contentStringArray.join("");
		dialogContentDiv.innerHTML = contentString;
	},

	constructor: function(app, sceneInfo)
	{
		this.isMobile = concord.util.browser.isMobile();
		if (this.isMobile)
		{
			this.loadInitSlide = 6;
			pres.utils.a11yUtil.enabled = false;
		}
		
		this.app = app;
		this.sceneInfo = sceneInfo;
		this.bean = null;
		this.isEditable = false;
		this.docType = "pres";
		this.locale = g_locale;
		this.nls = dojo.i18n.getLocalization("concord.scenes", "Scene");
		this.cknls = dojo.i18n.getLocalization("concord.widgets", "CKResource");
		this.editornls = dojo.i18n.getLocalization("concord.widgets", "slideEditor");
		this.msgReceiver = new pres.msg.Receiver();
		this.msgPublisher = new pres.msg.Publisher();
		this.locker = new pres.Locker();
		this.undoManager = new pres.msg.UndoManager();

		if (!this.isHTMLViewMode() && !this.isMobile)
		{
			if (!(dojo.isSafari && dojo.isSafari < 5.1) && pe.settings && pe.settings.getAutoSpellCheck())
			{
				if (window.spellcheckerManager)
				{
					spellcheckerManager.setAutoScayt(true);
				}
			}
		}

		var body = dojo.body();
		if (this.isMobile)
			dojo.addClass(body, "mobile");
		if (this.isMobileBrowser())
			dojo.addClass(body, "mobileBrowser");

		if (pe.settings && pe.settings.getIndicator())
		{
			dojo.addClass(body, 'user_indicator');
		}

		dojo.subscribe(pres.constants.APIEvent.LOAD_READY, function(){
			pres.api.notify("*", "IDOCS.EVENT.contentReady", "pres");
		});
		
		this.cemsgListInLoading = [];
		this.userListInLoading = [];
		// Commenting below code as dojo is inbuilt methods for checking the type of browser.
		// fixing for issues Docs-182 and Docs-189
        //var ua = navigator.userAgent.toLowerCase();
        //dojo.isEdge = (ua.indexOf("edge") > 0);
        //dojo.isWebKit = dojo.isWebKit && !dojo.isEdge;
        //dojo.isChrome = dojo.isChrome && !dojo.isEdge;
	},

	leave: function()
	{
		this.removeUserLocks();
		this.inherited(arguments);
	},

	processMessage: function(msg)
	{
		if (!this.bLoadFinished)
		{
			// this.cemsgListInLoading.push(msg);
			this.pendingCemsgInLoading(msg);
			return;
		}

		this.msgReceiver.receiveMessage(msg);
	},

	pendingCemsgInLoading: function(msg)
	{
		// to find cemsg pair for edit-in/edit-out
		var msg_num = this.cemsgListInLoading.length;
		if ((msg.type == "contentBoxEditMode") && (msg.editMode == false) && (msg_num > 0))
		{
			var pre_msg = this.cemsgListInLoading[msg_num - 1];
			if ((pre_msg != null) && (pre_msg.type == "contentBoxEditMode") && (pre_msg.editMode == true) && (pre_msg.elemId == msg.elemId) && (pre_msg.client_id == msg.client_id) && (pre_msg.server_seq == msg.server_seq) && (pre_msg.user_id == msg.user_id))
			{
				// console.info("~~~ PresDocScene::pendingCemsgInLoading : found cemsg pair for editi-in/edit-out ~~~");
				this.cemsgListInLoading[msg_num - 1] = null;
				return false;
			}
		}

		this.cemsgListInLoading.push(msg);
		return true;
	},

	dealWithCemsgInLoading: function()
	{
		for ( var i = 0; i < this.cemsgListInLoading.length; i++)
		{
			if (this.cemsgListInLoading[i] != null)
			{
				PROCMSG.receiveMessage(this.cemsgListInLoading[i]);
			}
		}

		this.cemsgListInLoading = [];
	},

	dealWithUserJoinInLoading: function()
	{
		if (this.userListInLoading)
		{
			for ( var i = 0; i < this.userListInLoading.length;)
			{
				if (this.userListInLoading[i] != null)
				{
					this.userJoined(this.userListInLoading[i + 1]);
				}

				i += 2;
			} // end for
		}

		this.userListInLoading = [];
	},

	coeditStarted: function()
	{
		this.inherited(arguments);
		dojo.publish("/scene/coedit/started", []);
		this.requestLockStatus();
	},
	
	coeditStopped: function() {
		this.inherited(arguments);
		dojo.publish("/scene/coedit/stopped", []);
	},

	userJoined: function(user)
	{
		// console.info('~~~~~~~~~~~~~~~~~~~ PresDocScene::userJoined');

		if (!this.bLoadFinished)
		{
			// check user id
			var userId = user.getId();
			if (!this.userListInLoading)
				this.userListInLoading = [];
			for ( var i = 0; i < this.userListInLoading.length;)
			{
				if (this.userListInLoading[i] == userId)
				{
					this.userListInLoading[i + 1] = user;
					return;
				}

				i += 2;
			} // end for

			this.userListInLoading.push(userId, user);
			return;
		}

		// For Defect 13287

		this.userLeft(user, true);

		this.inherited(arguments);

		this.requestLockStatus();

		// update editorGrid dialog
		if (this.editorGrid != null)
		{
			var userData = this.getEditorPane().store.getClonedEditors();
			userData.items.shift(); // Remove first entry which should be the current user. May need to harden
			userData.items = this.removeInactiveUsers(userData.items); // Need to remove users who are not currently in the document
			var dataStore = new dojo.data.ItemFileReadStore({
				data: userData
			});
			this.editorGrid.setStore(dataStore);
		}

		dojo.publish("/scene/user/joined", [user]);

		// Let's verify if there is a shared slide show in progress and if this user was invited
		var userID = user.getId();
		// if (this.hasSharedSlideShowStarted() && window.pe.scene.ssObject!= null && this.sssUserInviteeList.indexOf(userID) >=0){
		/*
		 * if (this.hasSharedSlideShowStarted() && window.pe.scene.ssObject != null && PresCKUtil.isInArray(this.sssUserInviteeList, userID) >= 0) {
		 * 
		 * var curSlide = window.pe.scene.ssObject.currSlide; var totalSlides = window.pe.scene.ssObject.slides.length; var slideContent = window.pe.scene.ssObject.slideContainer.innerHTML; // Send coedit invitation to this user setTimeout(dojo.hitch(this, this.sendCoeditSlideShowCoViewStart, curSlide, totalSlides, slideContent, [userID]), 500); // //Send current slide show progress // this.sendCoeditSlideShowCoViewMode(); }
		 */

	},

	userLeft: function(user)
	{
		// console.info('~~~~~~~~~~~~~~~~~~~ PresDocScene::userLeft');
		var userId = user.getId();
		if (!this.bLoadFinished)
		{
			// check user id
			for ( var i = 0; i < this.userListInLoading.length;)
			{
				if (this.userListInLoading[i] == userId)
				{
					this.userListInLoading[i] = null;
					this.userListInLoading[i + 1] = null;
					return;
				}

				i += 2;
			}

			return;
		}

		this.inherited(arguments);

		this.locker.removeUser(userId);
		// update editorGrid dialog
		if (this.editorGrid != null)
		{
			var userData = this.getEditorPane().store.getClonedEditors();
			userData.items.shift(); // Remove first entry which should be the current user. May need to harden
			userData.items = this.removeInactiveUsers(userData.items); // Need to remove users who are not currently in the document
			var dataStore = new dojo.data.ItemFileReadStore({
				data: userData
			});
			this.editorGrid.setStore(dataStore);
			// this.editorGrid.filter({ displayName:"*"});
		}

		dojo.publish("/scene/user/left", [user]);

	},

	getEditorPane: function()
	{
		return this.getSidebar().editorsPane;
	},

	reset: function()
	{
		this.bLoadFinished = false;
		this.canCacheSlideHTMLDiv = false;
		this.undoManager.reset();
		// remove lock for myself
		if (this.doc && this.locker)
			this.removeUserLocks();
		dojo.publish("/data/reset", null);
	},

	begin: function(oldScene)
	{
		this.authUser = this.app.authenticatedUser;
		if (this.authUser)
		{
			pres.perf.clear();
			pres.perf.mark("data_load_prepare");
			if (!this.isHTMLViewMode() && !this.isMobile)
				this.session = new concord.net.Session(this, this.sceneInfo.repository, this.sceneInfo.uri);
			else if(pe.settings)
				// disable welcome dialog in htmlview mode.
            	pe.settings.getShowWelcome = function(){return false;};
			// this.editors = new concord.beans.EditorStore(null, null, null);
			this.render();
			this.hub = new pres.Hub();
			var sceneMode = this.sceneInfo.mode;
			this.editMode = sceneMode != "view";
			this.editMode && this.stage();
			if (this._sizeBarWidth)
			{
				this.hub.onSideBarResized(this._sizeBarWidth);
			}
			// this.checkClipBoard(); // JMT added for D41898
		}
	},

	staged: function(success, response)
	{
		this.inherited(arguments);
		if (success)
		{
			pres.perf.mark("data_load_start");
			var classname = new concord.i18n.ClassName();
			var langClass = classname.getLangClass() || "";
			
			var criteria = {
				"presVersion": 2,
				"inPartial": true,
				"format": this.loadFormat,
				"lang":langClass,
				"initSlide": this.loadInitSlide
			};
			if (!this.isHTMLViewMode() && !this.isMobile)
				this.session.join(criteria);
			else
			{
				if (this.isHTMLViewMode() && !this.partialLoadForHTMLView)
				{
					delete criteria.inPartial;
					delete criteria.initSlide;
				}
				concord.net.HtmlViewConnector.join(criteria, this.getURI(), this);
			}
		}
	},

	/**
	 * abstract callback method, called when the document content is loaded/reloaded from server implementation should load the state to editor in this method ATTENTION: don't forget to clean all undo stack
	 */
	loadState: function(state)
	{
		// if it is reloaded from server, reset internal object state
		this.reset();
		pres.perf.mark("data_loaded_" + (state.content.chunkId ? "partial" : "full"));
		if (!this.isHTMLViewMode() && !this.isMobile)
			this.bean = this.session.bean;
		this.locker.init(state);
		this.doc = new pres.model.Document(state.content.html, state.content.json, state.content.chunkId);
		
		setTimeout(function() {
			dojo.publish(pres.constants.APIEvent.LOAD_READY);
		}, 0);
		
		this.hub.setDocument(this.doc);
		this.hub.app.overlay.hide();
	},

	render: function()
	{
		if (!this.isHTMLViewMode() && !this.isMobile)
			this.editors = new concord.beans.EditorStore(null, null, null);
		
		var mainNode = dojo.byId("mainNode");
		mainNode.focus();
		document.title = !this.editMode ? this.sceneInfo.title : "";
		// adding header
		this.createHeader(this.nls.presdoc, mainNode, document.title);

		// Following code for story 6483
		var body = dojo.doc.body;
		concord.util.HtmlContent.addI18nClassToBody(body);
		concord.util.A11YUtil.createLabels(body);

		if (dojo.hasClass(dojo.body(), "lotusJapanese"))
		{
			this.defaultBrowserFonts = "MS Gothic,MS PGothic,Apple Gothic";
		}
		else if (dojo.hasClass(dojo.body(), "lotusKorean"))
		{
			this.defaultBrowserFonts = "Gulim,GulimChe";
		}
		
		if (dojo.isIE || dojo.isEdge) {
			dojo.addClass(dojo.body(), "dj-ie");
		}

		var header = dojo.byId("header");
		var banner = dojo.byId("banner");
		if (this.isViewCompactMode()) {
   			dojo.style(header, "display", "none");
			dojo.style(banner, "display", "none");
			dojo.style(document.body, 'background', 'none transparent');
		}

		if (this.isEditCompactMode()) {
			dojo.style(header, "display", "none");
			dojo.style(banner, "display", "none");
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
		console.log("generateRestoreMsg is called but nothing to generate for presentation.");
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
		// TODO presentation not supported yet
	},

	getSidebarHeight: function()
	{
		var winHeight = concord.util.resizer.getBrowserHeight();
		return winHeight + "px";
	},

	sidebarShown: function()
	{
	},

	sidebarResized: function(w)
	{
		if (this.isEditCompactMode()) {
			return;
		}
		if (this._sizeBarWidth != w)
		{
			this._sizeBarWidth = w;
			this.hub && this.hub.onSideBarResized(w);
		}
	},

	getSidebarMenuItemId: function()
	{
		return "P_i_Sidebar";
	},

	setFocusToDialog: function()
	{
		console.warn("setFocusToDialog not implemented");
	},
	
	setFocus: function()
	{
		if (this.hub && this.hub.focusMgr)
		{
			var fm = this.hub.focusMgr;
			var vf = fm.virtualFocus;
			var handled = false;
			
			if (fm.isFocusInSorter())
			{
				this.slideSorter.focus();
				handled = true;
			}
			else if(vf == fm.VIRTUAL_FOCUS_BOX || vf == fm.VIRTUAL_FOCUS_SLIDE_BOX || vf == fm.VIRTUAL_FOCUS_NOTES_BOX )
			{
				var box = pe.scene.editor.getEditingBox();
				if (box)
				{
					box.focus();
					box.editor && box.editor.renderSelection();
					handled = true;
				}
			}
			if (!handled)
			{
				pe.scene.slideEditor.domNode.focus();
			}
		}
	},

	getRecentFilesMenu: function(ownerDocument, _focusManager)
	{
		var attrs = {};
		if (ownerDocument)
		{
			attrs = {
				ownerDocument: ownerDocument,
				_focusManager: _focusManager
			};
		}
		var subMenu = new dijit.Menu(attrs);
		dojo.addClass(subMenu.domNode, "lotusActionMenu");
		subMenu.domNode.style.display = 'none';
		document.body.appendChild(subMenu.domNode);

		var fileItems = RecentFiles.getRecentFiles();
		var dirAttr = BidiUtils.isGuiRtl() ? 'rtl' : '';
		for ( var i = 0; i < fileItems.length; i++)
		{
			var item = fileItems[i];
			var itemAttrs = {
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
			};
			dojo.mixin(itemAttrs, attrs);
			subMenu.addChild(new dijit.MenuItem(itemAttrs));
		}
		return subMenu;
	},

	getDownloadMenu: function(ownerDocument, _focusManager)
	{
		var dirAttr = BidiUtils.isGuiRtl() ? 'rtl' : '';
		var attrs = {dir: dirAttr};
		if (ownerDocument){
			attrs = {
				ownerDocument: ownerDocument,
				_focusManager: _focusManager,
				dir: dirAttr
			};
		}
		var subMenu = new dijit.Menu(attrs);
		dojo.addClass(subMenu.domNode,"lotusActionMenu");
		subMenu.domNode.style.display ='none';
		document.body.appendChild(subMenu.domNode);
		var menuStrs = dojo.i18n.getLocalization("concord.widgets","menubar");
		
		var itemAttrs = {
			id: 'P_i_ExportToPDF',
			label: concord.util.strings.getBidiRtlFormatStr(menuStrs.fileMenu_ExportToPDF), 
			iconClass: '',
			onClick: function(){
				pe.scene.printPresPDF();					
			}				
		};
		dojo.mixin(itemAttrs, attrs);
		subMenu.addChild( new dijit.MenuItem(itemAttrs));
	 
		itemAttrs = {
			id: 'P_i_ExportToDefault',
			label: concord.util.strings.getDefaultFileFormatStr(menuStrs.fileMenu_ExportToMS, menuStrs.fileMenu_ExportToODF), 
			iconClass: '',
			onClick: function(){
				pe.scene.msgPublisher.sendPending();
				pe.scene.session && pe.scene.session.save(true);
				pe.scene.exportToDefault();					
			}				
		};
		dojo.mixin(itemAttrs, attrs);
		subMenu.addChild( new dijit.MenuItem(itemAttrs));
		return subMenu;
	},
	
	printPresPDF: function()
	{
		pe.scene.msgPublisher.sendPending();
		pe.scene.session && pe.scene.session.save(true);
		if (!this.pdfPrintDialog)
			this.pdfPrintDialog = new pres.print.PDFDialog();
		this.pdfPrintDialog.show();
	},
	
	printHtml: function()
	{
		pe.scene.msgPublisher.sendPending();
		pe.scene.session && pe.scene.session.save(true);
		openPresHtmlPrintWindow = function(printWindow)
		{
			var printView = new pres.print.HtmlPrint(printWindow);
			printWindow.onbeforeunload = function()
			{
				printView.unsubscribeEvents();
			};
			return printView;
		};

		closePresHtmlPrintWindow = function()
		{
			//
		};
		// Bob: the old fix for 12300 is not needed any more
		// fix for defect 12300 after print window is open ensure focus returns back to the sorter
		// dojo.byId( pe.scene.slideSorterContainerId).focus();
		// pe.scene.setFocusToSlideSorter();

		var printWindow = null;
		var printUrlspecs = 'height=' + screen.height + ',width=700px,resizable=yes,menubar=yes,location=no,statusbar=no,scrollbars=yes';
		if (window.location.search)
		{
			// fix for defect 12880, append to existing url query if one already exists
			printWindow = window.top.open(window.location.href + '&mode=htmlprint', this.printWindowName, printUrlspecs);
		}
		else
		{
			printWindow = window.top.open(window.location.href + '?mode=htmlprint', this.printWindowName, printUrlspecs);
		}
		if (printWindow)
			printWindow.focus();
	},

	// below empty functions just for compaibility with old code.
	disableDefaultMouseDownHandler: function()
	{
	},
	enableDefaultMouseDownHandler: function()
	{
	},
	disableOnSelectStart: function()
	{
	},
	restoreOnSelectStart: function()
	{
	},
	setFocusComponent: function(component)
	{
	},
	toggleCommentsCmd: function()
	{
		if (this.slideEditor.checkSelectedBoxCommentNumber())
		{
			this.hub.commentsHandler.clickedComment = 0;
			this.hub.commentsHandler.activeCommentId = null;
			return;
		}
		this.inherited(arguments);
		this.hub.commentsHandler.clickedComment = 1;
		this.hub.commentsHandler.activeCommentId = null;
	},
	commentsIconRefresh: function(commentsId)
	{
		this.hub.commentsHandler.activeCommentId = null;
		this.hub.commentsHandler.clickedComment = 0;
		if (commentsId != null)
		{
			var cBox = this.slideEditor.getBoxWithCommentId(commentsId);
			if (cBox)
			{
				cBox.refreshComments();
			}
			else if(this.slideEditor.slide.hasComment(commentsId))
			{//it is a slide comment
				this.slideEditor.refreshComments();
			}
		}
	},
	commentsCreated: function(comment)
	{
		dojo.publish("/comments/to/created", [comment]);
	},

	commentsDeleted: function(commentsId)
	{
		dojo.publish("/comments/to/deleted", [commentsId]);
	},

	commentsUpdated: function(commentsId, index, item)
	{
		dojo.publish("/comments/to/updated", [commentsId, index, item]);
	},
	commentsAppended: function(commentsId, item)
	{
		dojo.publish("/comments/to/appended", [commentsId, item]);
	},
	checkForEmptyPageWhenAddingComments: function(commentsId)
	{
		return this.slideEditor.checkSelectedBoxCommentNumber();
	},

	hideComments: function(commentsId)
	{
		dojo.publish("/comments/to/hide", [commentsId]);
	},

	commentsSelected: function(commentsId)
	{
		dojo.publish("/comments/to/selected", [commentsId]);
	},

	commentsUnSelected: function(commentsId)
	{
		dojo.publish("/comments/to/unselected", [commentsId]);
	},
	getCommentsIdInActRange: function(noReply)
	{
		return null;
	},
	saveAsPresentation: function()
	{
		concord.util.dialogs.showSaveAsDlg('presentation');
	},
	showPublishDialog: function()
	{
		this.hub.commandHandler.execCommand(pres.constants.CMD_PUBLISH);
	},
	createTooltip: function(widget, str, pos, onHeader)
	{
	    new pres.widget.MenuTooltip({
	    	widget : widget,	        
	        label: str,
	        position: pos,
	        onHeader: onHeader
	    });
	},
    disableMenu: function(id, disable)
    {
		var iframe = dojo.byId("menutoolbarFrame");		
		if (iframe)
		{
			var qStr = ".dijitMenuItem[name=" + id + "]";
			var menuDom = dojo.query(qStr,iframe.contentWindow.document)[0];
			if (menuDom)
			{
				var subMenu = dijit.byNode(menuDom);
				if (subMenu)
				{
					subMenu.setDisabled(disable);
				}
			}
		}
    },
    
	getSnapshotUpdateStr: function(){
		return this.nls.updatePresentation;
	}

});
