/* ***************************************************************** */
/*                                                                   */
/* Licensed Materials - Property of IBM.                             */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* Copyright IBM Corporation 2012. All Rights Reserved.              */
/*                                                                   */
/* U.S. Government Users Restricted Rights: Use, duplication or      */
/* disclosure restricted by GSA ADP Schedule Contract with IBM Corp. */
/*                                                                   */
/* ***************************************************************** */
dojo.provide("viewer.scenes.AbstractScene");

dojo.require("viewer.beans.Document");
dojo.require("dojo.string");
dojo.require("dijit.Toolbar");
dojo.require("dijit.form.Button");
dojo.require("dijit.form.ToggleButton");
dojo.require("dijit.form.DropDownButton");
dojo.require("dojox.html.metrics");
dojo.require("dijit.ToolbarSeparator");
dojo.require("dijit.Menu");
dojo.require("dijit.MenuItem");
dojo.require("dijit.form.Select");
dojo.require("viewer.widgets.Zoomer");
dojo.require("viewer.widgets.MessageBox");
dojo.require("viewer.widgets.FloatBox");
dojo.require("viewer.widgets.PagePicker");
dojo.require("viewer.widgets.NormalContentContainer");
dojo.require("viewer.widgets.ThumbnailPicker");
dojo.require("viewer.widgets.ViewerToolbar");
dojo.require("dijit.layout.BorderContainer");
dojo.require("dijit.layout.ContentPane");
dojo.require("dojox.html.metrics");
dojo.require("viewer.util.Events");
dojo.require("viewer.scenes.ErrorScene");
dojo.require("viewer.widgets.MessageBox");
dojo.require("viewer.print.PrintManager");
dojo.require("viewer.widgets.LotusTextButton");
dojo.require("viewer.util.BidiUtils");
dojo.require("viewer.widgets.PageIndicator");
dojo.require("viewer.widgets.NavigatorBarManager");
dojo.requireLocalization("viewer.scenes", "Scene");
dojo.declare("viewer.scenes.AbstractScene", null, {
//	NOT_CONVERTED: 0,
//	CONVERT_COMPLETED: 1,
//	CONVERTING: 2,

	app: null,
	doc: null,
	jobId: null,
	currentPage: 0,
	scale: 0,
	style: 'fitWidth',
	currentMode: null,
	mediaSize : -1,
	
	thumbnailView: null,
	views: {},
	nls: null,
	printManager: null,
	
	defaultMode : 'Normal', 
	DEFUALT_THUMBNAIL_WIDTH: 133,
	DEFUALT_NORMAL_PAGE_WIDTH: 1600,
	supportedMode: ['Normal'],
	
	//The following four attributes are used for IBM Docs and Viewer integration
	isDocsEnabled: false,
	docsURI: null,
	isDocsSupportType: false,
	isDocsEditor: false,
	numberOfRetry: 0,
	proxyErrorRetry:0,
	helpTail: null,
	ccmFrameId: "CCM_WIDGETS_IFRAME",	
	compactMode: false,

	constructor: function(app, sceneInfo) {
		this.nls = dojo.i18n.getLocalization("viewer.scenes", "Scene");
		this.app = app;
		this.jobId = sceneInfo.jobId;
		this.doc = new viewer.beans.Document(sceneInfo.title, sceneInfo.type, sceneInfo.repoUri, sceneInfo.docUri, sceneInfo.version, sceneInfo.pageNum);
		this.doc.setPagesInfo(sceneInfo.images);
		if (this.doc.getPagesInfo()[0] && this.doc.getPagesInfo()[0].getFullImageInfo() != null){
			this.DEFUALT_NORMAL_PAGE_WIDTH = this.doc.getPagesInfo()[0].getFullImageInfo().getPageWidth();
		}
		this.isDocsEnabled = sceneInfo.isDocsEnabled;
		this.docsURI = sceneInfo.docsURI;
		this.isDocsSupportType = sceneInfo.isDocsSupportType;
		this.isDocsEditor = sceneInfo.isDocsEditor;
		this.mediaSize = sceneInfo.mediaSize;
		this.compactMode = DOC_SCENE.compactMode;
		if(this.compactMode) {
			this.DEFAULT_STYLE = 'compact';
		}
		
		if(g_env=="smart_cloud")
		{
			var locale = dojo.locale;
			var localArray = locale.split('-');
			if(locale == "pt-br" || locale == "zh-cn" || locale =="zh-tw"){
				locale = localArray[0] + "_" + localArray[1].toUpperCase();
			}
			else{
				locale = localArray[0];
			}
			this.helpTail="&lang="+locale;
		}
		else
		{
			this.helpTail="";
		}
		dojo.connect(window, "onresize", this, "updateUI");
		dojo.connect(document, 'onkeypress',this,this._onKeyPress);
		dojo.connect(dojox.html.metrics,'onFontResize',this,this._onFontResize);
	},
	
	begin: function(oldScene) {
//		this.nls = dojo.i18n.getLocalization("concord.scenes",
//				"Scene");
		this.authUser = this.app.authenticatedUser;
//		if (this.authUser == null) {// may never come to this
//										// statement
//			console.info("null user");
//		}else {
			this.show();
//		}
	},
	
	end: function(newScene) {
	},
	
	show: function() {
		this.render(this.defaultMode);// by default, normal view should be created
		this.preparePrintArea();
		this.stage();
	},
	
	render: function(mode){
		// defect 4411
		// width is always set for border container
		// When browser zoom in/out happens, no resize event got,
		// which causes bad layout on IE
		// This change is to clear width setting in the border container.
		// Put the clear operation within setTimeout 
		// because we need to do it after the border container is rendered by dojo.
		setTimeout(function(){
			var headerBorderContainer = dojo.byId('headerBorderContainer');
			dojo.style(headerBorderContainer, 'width', '');
		}, 0);
		
		var headerPane = dijit.byId('headerPane');
		var thumbnailPane=dojo.byId("thumbnailPane");
		var titlePane = dijit.byId('titlePane');
		var toolbarPane = dijit.byId('toolbarPane');
		var contentPane=dojo.byId("contentPane");
		
		//compact mode
		if(this.compactMode){
			dojo.style(headerPane.domNode, 'display', 'none');
			if (thumbnailPane)
			  dojo.style(thumbnailPane, 'display', 'none');
			var thumbnailPane_splitter=dojo.byId("thumbnailPane_splitter");
			if (thumbnailPane_splitter)
			  dojo.style(thumbnailPane_splitter, 'display', 'none');
			dojo.style(document.body, 'background', 'none transparent');
		}
		
		dojo.attr(document.body,'role','main');
		dojo.attr(document.body,'aria-label', 'body');
		
		dojo.style(titlePane.domNode, 'overflow', 'hidden');
		var titleNode = this.createHeader(titlePane.domNode, this.doc.getTitle());
		var titleSize = dojo.marginBox(titleNode);
		dojo.style(titlePane.domNode, 'height', titleSize.h + 'px');

		var toolbarHeight = 0;
		if (toolbarPane) {
			dojo.style(toolbarPane.domNode, 'overflow', 'hidden');
			var toolbarNode = this.createToolbar(toolbarPane.domNode);
			dijit.setWaiState(toolbarNode,'label','toolbarPane');
			var toolbarSize = dojo.marginBox(toolbarNode);
			toolbarHeight = toolbarSize.h;
			dojo.style(toolbarPane.domNode, 'height', toolbarSize.h + 'px');
			dojo.attr(toolbarPane.domNode, 'aria-label', 'toolbarNode');
		}
		
		dijit.setWaiState(headerPane.domNode,'labelledby','doc_title_text');
		headerPane.resize({h: toolbarHeight + titleSize.h});
		
		if (thumbnailPane) {
		  dijit.setWaiState(thumbnailPane,'labelledby','doc_title_text');
		}
		if (BidiUtils.isGuiRtl()){
			var thumbnailPane_splitter=dojo.byId("thumbnailPane_splitter");
			if (thumbnailPane_splitter) {
			  dojo.style(thumbnailPane_splitter, 'right', thumbnailPane_splitter.style.left);
			  dojo.style(thumbnailPane_splitter, 'left', '');
			}
		}
		
		dijit.setWaiState(contentPane,'labelledby','doc_title_text');
//		var input=dojo.byId("selector_page");
//		dojo.attr(input,'role','spinbutton');//only assign this role or 'slider' role,could avoid RPT violation.
//		dojo.attr(input,'aria-valuenow','0');
		
		var mainContainer = dijit.byId('mainContainer');
		if (BidiUtils.isGuiRtl())
			dojo.attr(mainContainer,'dir','rtl');
		mainContainer.resize();
		this.switchMode(mode);
		this.setCurrentScale(this.scale);
	},
	
	stage: function(){
		if (this.jobId != null)
		{
			var printBtn = dijit.byId('T_Print');
			if (printBtn){
				printBtn.attr('disabled', true);
			}
			console.log('conversion has not been completed, wait ...');
			this.showWarningMessage(this.nls.msgLoading, 0);
			this.doc.addListener(this);
			this.queryJob();
		}
		else
		{
			this.staged(true);
		}
	},
	
	queryJob: function(){
	  	var url = contextPath + "/api/job/" + this.doc.getRepository() + "/" + this.doc.getUri() + "/" + this.doc.getVersion() + "/" + this.jobId;
	  	if(this.compactMode){
	  		url+='?mode=compact';
	  	}
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
	  
	jobHandle: function(response, ioArgs){
	  	if (response instanceof Error)
	  	{
	  		this.proxyErrorRetry=this.proxyErrorRetry+1;
	  		if(this.proxyErrorRetry<g_retryCount)
	  		{
	  			setTimeout(dojo.hitch(this, this.queryJob), 1000);
	  			return;
	  		}
	  		this.staged(false, response);
	  		return;
	  	}
	  	
	  	if (response.status == "complete")
	  	{
	  		this.staged(true, response);
	  	}
	  	else if (response.status == "error")
	  	{
	  		this.staged(false, response);
	  		
	  	}
	  	else if (response.status == "pending")
	  	{
	  		var errorCode = (response && response.error_code) ? parseInt(response.error_code) : 0;
	  		if (isNaN(errorCode))
	  			errorCode = 0;
	  		if(errorCode == 2001)
	  		{
	  			this.numberOfRetry = this.numberOfRetry + 1;
	  			if(this.numberOfRetry > 2)
	  			{
		  			this.staged(false, response);
		  			return;
	  			}
	  		}
	  		else
	  		{
		  		this.staging(response);
	  		}
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
	
	staged: function(success, response){
	  	if (!success){
	  		console.log('staged failed');
	  		this.hideErrorMessage();
	  		// update print err message
	  		var printMsgDiv = dojo.byId("printErrMessage");
	  		printMsgDiv.innerHTML = this.nls.errPrintConversionFail;
	  		
	  		var errorCode = (response && response.error_code) ? parseInt(response.error_code) : 0;
	  		if (isNaN(errorCode))
	  			errorCode = 0;
	  		var error = viewer.scenes.ErrorScene.getErrorMessage(errorCode);
	  		var reload = function(){
				window.location.reload();
			};
			
	  		this.hideErrorMessage();
	  		if (errorCode == 1206){// ConversionException.EC_CON_ENCRPTED_ERROR
	  			var dlg = new viewer.widgets.FloatBox(null, this.nls.msgConversionFail, null, false, 
	  													{message:error.title + '\n\u00a0\n' + error.message, 
	  													imageclass:"viewerSprite viewerSprite-msgError48"});
	  			dlg.show();
	  		}
	  		else
	  		{
	  			var dlg = new viewer.widgets.MessageBox(null,this.nls.msgConversionFail, null, false, 
							{message:error.title + '\n\u00a0\n' + error.message, 
							 imageclass:"viewerSprite viewerSprite-msgError48"});
	  			dlg.show();
	  			this.app.unregisterOpenDocs();
	  		}
	  	}
	  	else
	  	{
	  		if (response){
		  		var data = response.data;
		  		this.doc.setPagesInfo(data);
		  		this.hideErrorMessage();
//		  		this.showInfoMessage(this.nls.msgConversionComplete, 5000);
	  		}
			var printBtn = dijit.byId('T_Print');
			if(printBtn)
				printBtn.attr('disabled', false);
	  		// update print err message
	  		var printMsgDiv = dojo.byId("printErrMessage");
	  		printMsgDiv.innerHTML = this.nls.errPrintFromBrowserMenu;
			this.printManager = new viewer.print.PrintManager(this.doc.getPagesInfo(), 
												viewer.util.uri.getDocPageRoot(this.doc),
												'printImgContainer', 'printErrMessage');
	  		
	  	}
	  	
	  	this.doc.removeListener(this);

	  	console.log("staged from AbstractScene......");
	},

	staging: function(response){
		var data = response.data;
		this.doc.setPagesInfo(data);		
		console.log("staging from AbstractScene......");
	},
	
	reviewFail: function(error) {
		this.hideReviewFrame();
		
		var dlg = new viewer.widgets.MessageBox(null,this.nls.errorMsg, null, false, 
				{message:this.nls.labelItemNotFountTitle + '\n\u00a0\n' + this.nls.labelItemNotFountMsg, 
				 imageclass:"viewerSprite viewerSprite-msgError48"});
		dlg.show();
	},
	
	_showCCMWidget: function(cmd) 
	{
		var frame = document.getElementById(this.ccmFrameId);
//		if(!frame)
//		{
//			frame = this.initReviewMenu(true); 
//		}
		frame.style.display = "";
		frame.contentWindow.run(cmd);		
	},
	
	hideReviewFrame: function()
	{
		var frame = document.getElementById(this.ccmFrameId);
		if(frame)
		{
			frame.style.display = "none";
		}
	},
	
	closeViewer: function() {
		window.location = DOC_SCENE.fileDetailPage;
	},
	
	_loadCCMWidgets: function(show) {
		var frame = document.getElementById(this.ccmFrameId);
		if(!frame)
		{
			frame = document.createElement("iframe");
			frame.src= window.staticResPath + "/js/viewer/widgets/ccmwidgets.html";
			frame.id = this.ccmFrameId;
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
		return frame;
	},
	
	createHeaderImg : function() 
	{
		var imagepath = staticResPath + "/images/";
		var imagesource = imagepath + this.getTitleImageName();
		
		var img = document.createElement("img");
		img.setAttribute("src", imagesource);
		img.setAttribute("alt", this.nls.labelImageTypeIcon);
		if(g_env!="smart_cloud") {
			var imgheight = "32px";
			//if (this.getTitleImageHeight)
			//	imgheight = this.getTitleImageHeight();
			dojo.style(img, 'height', imgheight);
		} else
			dojo.addClass(img, "cloud_text_icon");
		dojo.addClass(img, "lotusIcon");
		
		return img;
	},
	
	createHeader : function(node, title)
	{
		var mainNode = node;

		var headerDiv = document.createElement("div");
		dojo.addClass(headerDiv, "lotusTitleBar2");
		dojo.attr(headerDiv, "id", "titleBar");
		var innerDiv = document.createElement("div");
		dojo.addClass(innerDiv, "lotusInner");
		innerDiv.setAttribute("id", "doc_header");
		headerDiv.appendChild(innerDiv);

		var titleBarContent = document.createElement("div");
		dojo.addClass(titleBarContent, "lotusTitleBarContent");
		var docTitle = document.createElement("h2");
		docTitle.setAttribute("id", "doc_title");
		dojo.addClass(docTitle, "lotusHeading");

		var titleText = "";
		if (title) {
			titleText = title;
		}
		var docTitleText=document.createElement("label");
		docTitleText.setAttribute("id", "doc_title_text");
		
		var img = this.createHeaderImg();
		docTitle.appendChild(img);

//		var docTitleText = document.createElement("label");
//		docTitleText.setAttribute("id", "doc_title_text");
		docTitleText.innerHTML = titleText;
		docTitle.appendChild(docTitleText);

		titleBarContent.appendChild(docTitle);
		innerDiv.appendChild(titleBarContent);
		
		var reviewData = DOC_SCENE.reviewData;
		if( reviewData && 
				reviewData.globalApprovalProperties && 
				reviewData.globalApprovalProperties.approvalProcess == 'BasicApproval' &&
				reviewData.globalApprovalProperties.approvalState == 'pending') {
			var lockOwner = reviewData.lockOwner;
			var draftOwner = false;
			var approver = false;
			if (lockOwner.id == g_authUser.id){
				draftOwner = true;
			}
			// tell if the user is the approver
			var approvers = reviewData.approvers;
			if (approvers) {
				for(var i = 0; i < approvers.length; i++){
					if(((approvers[i].approverId == g_authUser.id || 
							(approvers[i].approverSelf && approvers[i].approverSelf.toLowerCase() == 'true'))) &&
							approvers[i].approvalState == 'pending') {
						approver = true;
						break;
					}
				}
			}
			if(draftOwner || approver) {
				setTimeout( dojo.hitch(this, this._loadCCMWidgets), 100 );
				
				var actions = document.createElement("ul");
				dojo.addClass(actions, "lotusInlinelist");
				this._addAction(actions, "stop_review", this.nls.labelStopReview, true, false, "", "_stopReview");
				
				if(approver) {
					this._addAction(actions, "reject",this.nls.labelRejct, true, false, "", "_reject");
					this._addAction(actions, "approve",this.nls.labelApprove, true, false, "", "_approve");
				}
				innerDiv.appendChild(actions);
			}
		}
		
		var errorMessageDiv = document.createElement("div");
		dojo.attr(errorMessageDiv,'role','alert');
		errorMessageDiv.id = "lotus_error_message";
		errorMessageDiv.className = "lotusMessage";
		errorMessageDiv.style.display = "none";
		var img = document.createElement("img");
		if (BidiUtils.isGuiRtl())
			dojo.style(img, 'float', 'right');
		else
			dojo.style(img, 'float', 'left');
		img.setAttribute("alt", " ");
		errorMessageDiv.appendChild(img);
		var messageSpan = document.createElement("span");
		dojo.style(messageSpan, 'float', 'left');
//		dojo.style(messageSpan, 'marginTop', '10px');
		errorMessageDiv.appendChild(messageSpan);
		headerDiv.appendChild(errorMessageDiv);

		var clearDiv = document.createElement("div");
		clearDiv.setAttribute("id", "doc_clear");
		clearDiv.className = "clear";
		innerDiv.appendChild(clearDiv);

		mainNode.appendChild(headerDiv);
		return headerDiv;
	},
	
	_addAction: function(actions, actionId, labeltxt, showLab, isDisabled, iconClassName, listener){
		var list = document.createElement("li");
		list.setAttribute("id", actionId);
		dojo.addClass(list, "ccmReview");
		var cmdBtn = new viewer.widgets.LotusTextButton({label: labeltxt,showLabel:showLab, disabled: isDisabled, iconClass:iconClassName, id: actionId+"_btn", onClick: dojo.hitch(this, listener)});
		list.appendChild(cmdBtn.domNode);
		actions.appendChild(list);
	},
	
	_stopReview: function()
	{
		this._showCCMWidget('StopReview');
	},
	_reject: function()
	{
		this._showCCMWidget('RejectReview');
	},
	_approve: function()
	{
		this._showCCMWidget('ApproveReview');
	},
	
	createToolbar: function(node){
		var mainNode = node;
		var toolbar = new viewer.widgets.ViewerToolbar({});
		dojo.addClass(toolbar.domNode, DOC_SCENE.type+"_toolbar");
		this.insertModeButton(toolbar);
		this.insertSeprater(toolbar);
		this.insertZoomButton(toolbar);
		if(g_enablePrintBtn=="true")
			this.insertPrintButton(toolbar);
		node.appendChild(toolbar.domNode);
		this.insertPageButton(toolbar);
		//this.insertSeprater(toolbar);
		if(this.isDocsEnabled=="true" && this.isDocsSupportType=="true" && this.isDocsEditor=="true")
			this.insertEditDocsButton(toolbar);
		if(g_enableVersionBtn=="true"||g_enableHelpBtn=="true")
			this.insertHelpButton(toolbar);
		this.postionButton(toolbar);
		this.modifyWidgets();
		return toolbar.domNode;
	},
	//This function if for A11y,as dojo updated to 1.8.3,the customized widget got default tabindex=0
	//So we need to change it back to 0,then the widget will not got focus by tab pressed.
	modifyWidgets:function(){
		dojo.attr(dojo.byId("T_separater"),'tabindex','-1');
		dojo.attr(dojo.byId("T_Zoomer"),'tabindex','-1');
		dojo.attr(dojo.byId("T_ModePagePicker"),'tabindex','-1');
	},
	insertModeButton: function(toolbar){
//		var button = new dijit.form.ToggleButton({
//			id: "T_Mode_Normal",
//			title: this.nls.labelNormal,
//			iconClass: "normalModeIcon",
//			showLabel: false,
//		    label: this.nls.labelNormal,
//		    _onButtonClick: dojo.hitch(this, function(){		    	
//		    	this.switchMode("Normal");
//		    	})
//		});
//
//		toolbar.addChild(button);	
	},
	insertSeprater:function(toolbar){
		var seprater=new dijit.ToolbarSeparator({id:"T_separater"},"seprater");
		toolbar.addChild(seprater);
	},
	insertZoomButton: function(toolbar){
		this.zoomer = new viewer.widgets.Zoomer({
			id: "T_Zoomer",
			viewManager:this,
			index:3
		});
		toolbar.addChild(this.zoomer);
	},
	
	insertPageButton: function(toolbar){
		this.pagePicker = new viewer.widgets.PagePicker({
			id: "T_ModePagePicker",
			pageNum: this.doc.getPages(),
			viewManager: this
		});
	   
		dojo.style(this.pagePicker.domNode, 'display', 'inline-block');
		dojo.style(this.pagePicker.domNode, 'vertical-align', 'middle');
		toolbar.addChild(this.pagePicker);
	},
	
	insertEditDocsButton:function(toolbar){
		var editDocs = new viewer.widgets.LotusTextButton({
			id: "T_IBMDocsEditor",
			label: this.nls.labelEdit, 
			title: this.nls.labelEdit,
			iconClass: "",
		    onClick: dojo.hitch(this, function(){	
		    		var winName = this.doc.uri.replace(/[-\s.@]/g, '_');
					window.open(this.docsURI,winName);
		    	})
		});
		dojo.style(editDocs.domNode, 'vertical-align', 'middle');
		toolbar.addChild(editDocs);
	},
		
	insertHelpButton:function(toolbar)
	{
 		var helpMenu = new dijit.Menu({ style: "display: none;"});
 		dojo.addClass(helpMenu.domNode,"lotusActionMenu");
 		if(g_enableHelpBtn=="true")
 		{
 			var menuHelpContent = new dijit.MenuItem({
 	        	id : "M_HelpContent",
 	            label: this.nls.labelHelpContent,
 	            onClick: dojo.hitch(this, function(){
 	            	this.showHelp();
 	            })
 	        });
 	        helpMenu.addChild(menuHelpContent);
 		}
        
        if(g_enableVersionBtn=="true"&&g_env!="smart_cloud") {
	        var menuAboutDialog = new dijit.MenuItem({
	        	id : "M_About",
				label : this.nls.labelAbout,
	            onClick: dojo.hitch(this, function(){
	            	var buildMessage = null;
	            	
	            	if(viewer_version=='null') 
	            		buildMessage= dojo.string.substitute(this.nls.labelBuild,{ 'productName' : window.g_prodName, '0' : viewer_build});	
	            	else
	            		buildMessage= dojo.string.substitute(this.nls.labelVersion,{ 'productName' : window.g_prodName, '0' : "", '1' : viewer_version});
	            	var versionDialog = new viewer.widgets.MessageBox(null, dojo.string.substitute(this.nls.labelProject, { 'productName' : window.g_prodName }), null, false,
	            			{message: buildMessage});
	            	versionDialog.show();
	            })
	        });
	        
	        helpMenu.addChild(menuAboutDialog);
		}
		var helpButtonClass = "helpButtonIcon";
		if (g_locale.substr(0,2) == 'ar')
			helpButtonClass += "_ar";
        var helpButton =new dijit.form.DropDownButton
 		({
 			id: "T_Help",
 			label: this.nls.labelHelp,
			showLabel: false,
			iconClass: helpButtonClass,
			dropDown: helpMenu
 		});
        if(g_enableHelpBtn=="false"&&g_enableVersionBtn=="true")
        	dojo.attr(helpButton,'label',this.nls.labelAbout);
        dojo.style(helpButton.domNode, 'vertical-align', 'middle');
       	toolbar.addChild(helpButton);
	},
	insertPrintButton: function(toolbar){
		var button = new dijit.form.Button({
			id: "T_Print",
			title: this.nls.labelPrint,
			iconClass: "printIcon",
			showLabel: false,
			label: this.nls.labelPrint,
			onClick: dojo.hitch(this, function(){		    	
				this.printManager.print();
	    	})
		});
		dojo.addClass(button.domNode,"lotusDijitButtonImg");
		toolbar.addChild(button);	
	},
	updateUI:function()
	{
		var toolbarPane = dijit.byId('toolbarPane');
		if (toolbarPane) {
			var toolbar=toolbarPane.getChildren()[0];
			this.postionButton(toolbar);
		}
		this.updateMessageLocation();
	},
	postionButton:function(toolbar)
	{
		var buttons = toolbar.getChildren();
		var pagePicker = dijit.byId("T_ModePagePicker");
		pagePicker.pageInput._refreshState();
		var right=4;
		if(dojo.isWebKit||dojo.isChrome)
			right=8;
		for(var i=buttons.length-1;i>0;i--){
			if(buttons[i].id=="T_ModePagePicker")
			{
				var preNode=buttons[i-1].domNode;
				var left = 0;
				if (BidiUtils.isGuiRtl())
					left = dojo.marginBox(toolbar.domNode).w - dojo.marginBox(preNode).l;
				else
					left=dojo.marginBox(preNode).l+dojo.marginBox(preNode).w;
				var calcWidth=dojo.marginBox(toolbar.domNode).w-right-left;
				if(calcWidth>130)
					dojo.style(pagePicker.domNode,"width",calcWidth+"px");
				else
					dojo.style(pagePicker.domNode,"width","130px");
				break;
			}
			else
			{
				right+=dojo.marginBox(buttons[i].domNode).w;
			}
		}
	},
	
	createPageIndicator: function() {
		
		var indicator = new viewer.widgets.PageIndicator({
			id: "T_PageIndicator",
			pageNum: this.doc.getPages(),
			viewManager: this
		});
		dojo.body().appendChild(indicator.domNode);
		indicator.position();
		return indicator;
	},
	
	switchMode: function(mode, style){
		this.currentMode = mode;
		for (var i in this.supportedMode){
			if (this.supportedMode[i] == mode)
				dijit.byId('T_Mode_'+this.supportedMode[i]).attr('checked', true);
			else
				dijit.byId('T_Mode_'+this.supportedMode[i]).attr('checked', false);
		}

		var bShown = false;
		for (var i in this.views){
			if (i != mode)
				dojo.style(this.views[i].domNode, 'display', 'none');
			else{
				dojo.style(this.views[i].domNode, 'display', 'block');
				bShown = true;
			}
		}

		if (!bShown){
			var widget = null;
			if(this.compactMode){
				widget = this.createContentWidget('Continuous');
				var actions = this.createActions();
				var pageIndicator = this.createPageIndicator();
				var manager=new viewer.widgets.NavigatorBarManager(actions,pageIndicator);
				manager.registerEvents();
			}
			else {
				widget = this.createContentWidget(mode);
			}
			if (widget)
				this.views[mode] = widget;
		}else{
			if (style)
				this.setCurrentStyle(style);
		}
		
		// defect 3952 
		// for performance reason, 
		// thumbnail should be created after content widget created
		// so that full image can be loaded first
		if (!this.thumbnailView)
			this.createThumbnailWidget();		

		if (this.doc.getPages()!=0){
			if (this.currentPage == 0){
				this.setCurrentPage(1);
			}else{
				dojo.publish(viewer.util.Events.PAGE_SELECTED, [this.currentPage]);
			}
		}

	},
	
	createContentWidget: function(mode){
		console.log('the mode ' + mode + 'is not supported');
		return null;
	},
		
	createThumbnailWidget: function(){
		var thumbnailPane = dijit.byId('thumbnailPane');
		this.thumbnailView = new viewer.widgets.ThumbnailPicker({id: "thumbnailView",
																size: this.doc.getPages(),
																pagesInfo: this.doc.getPagesInfo(),
																thumbWidth: this.DEFUALT_THUMBNAIL_WIDTH,
																//baseUri: this.getThumbnailRoot(),
																baseUri: this.getPageRoot(),
																tabIndex: 0,
																viewManager: this
																});
		thumbnailPane.setContent(this.thumbnailView.domNode);
	},
	
	preparePrintArea: function(){
		var printDiv = dojo.byId('print');
		var msgDiv = dojo.create('div', {id: 'printErrMessage'}, printDiv);
		var imgDiv = dojo.create('div', {id: 'printImgContainer'}, printDiv);
		imgDiv.style.textAlign="center";
		// initialize the default warning message in msgDiv
		msgDiv.innerHTML = this.nls.errPrintBeforeLoading;
	},
	
	getPageRoot: function(){
		return viewer.util.uri.getDocPageRoot(this.doc);
	},
	
	setCurrentPage: function(pageNum){
		if (!pageNum)
			pageNum = 1;
//		console.log('setCurrentPage ' + pageNum);
		if (this.currentPage != pageNum){
			if (pageNum >= 1 && pageNum <= this.doc.getPages()){
				this.currentPage = pageNum;
				dojo.publish(viewer.util.Events.PAGE_SELECTED, [this.currentPage]);
			}
		}
	},
	
	setCurrentStyle: function(newStyle){
//		console.log('style is changed to ' + newStyle);
		if (this.style != newStyle){
			this.style = newStyle;
			dojo.publish(viewer.util.Events.STYLE_CHANGED, [this.style]);
		}
	},
	
	setCurrentScale: function(newScale){
//		console.log('scale is changed to ' + newScale);
		if (this.scale != newScale){
			this.scale = newScale;
			dojo.publish(viewer.util.Events.SCALE_CHANGED, [newScale]);
		}
	},
	
	/**
	 * type = 0, 1, 2 (info, warning, error)
	 */
	_showMessage : function(text, interval, type)
	{
		var imgPath, className,altMessage; 
		switch (type) {
			case 0:
				imgPath = '/images/success.png';
				className = 'lotusMessage lotusSuccess';
				altMessage=this.nls.successMsg;
				break;
			case 1:
				imgPath = '/images/warning.png';
				className = 'lotusMessage lotusWarning';	
				altMessage=this.nls.warningMsg;
				break;
			case 2:				
			default:
				imgPath = '/images/error.png';
				className = 'lotusMessage';	
				altMessage=this.nls.errorMsg;
		}
		
		
		var errorMessageDiv = document.getElementById( 'lotus_error_message' );
		errorMessageDiv.className = className;
		errorMessageDiv.firstChild.setAttribute( 'src', staticResPath + imgPath );
		errorMessageDiv.firstChild.setAttribute( 'alt', altMessage );
		errorMessageDiv.lastChild.innerHTML = text;
		
		errorMessageDiv.style.cssText = 'display:inline-block'; //trigger layout to calc clientWidth
		if(dojo.isChrome)
		{
			var spanWidth=dojo.marginBox(errorMessageDiv.lastChild).w;
			dojo.style(errorMessageDiv.lastChild,"width",spanWidth+"px");
		}
		
		var browserWidth = viewer.util.browser.getBrowserWidth();
		var messageWidth = dojo.marginBox(errorMessageDiv).w;
		var left = ( browserWidth - messageWidth ) / 2;
		
		errorMessageDiv.style.cssText = 'left:' + left + 'px;top:0px;display:inline-block;position:absolute;z-index:1;color:#222222 !important';
		
		if( interval )
			setTimeout( dojo.hitch(this, this.hideErrorMessage), interval );
	},
	
	_onKeyPress: function(e){
		if (e.keyCode == dojo.keys.PAGE_UP && e.keyChar != '!'){
			this.setCurrentPage(this.currentPage - 1);
			e.preventDefault();
		}
		else if (e.keyCode == dojo.keys.PAGE_DOWN && e.keyChar != '"'){
			this.setCurrentPage(this.currentPage + 1);
			e.preventDefault();
		}
		else if(dojo.isIE && e.ctrlKey && (e.charOrCode == '+'||e.charOrCode == '-'))
		{
			this.updateUI();
			if(this.views[this.currentMode].resize)
				this.views[this.currentMode].resize();
		}
	},
	_onFontResize:function()
	{
		this.updateUI();
		var a=dijit.byId("titlePane").domNode;
		var b=dijit.byId("toolbarPane").domNode;
		var h1=dojo.marginBox(a.firstChild).h;
		var h2=dojo.marginBox(b.firstChild).h;
		dojo.style(a,"height",h1+'px');
		dojo.style(b,"height",h2+'px');
		var con=dojo.byId("headerBorderContainer");
		dojo.style(con,"height",(h1+h2)+"px");
		con=dojo.byId("headerPane");
		dojo.style(con,"height",(h1+h2)+"px");
		var mainContainer = dijit.byId('mainContainer');
		mainContainer.resize();
	},
	updateMessageLocation:function(){
		var errorMessageDiv = document.getElementById( 'lotus_error_message' );
		if(errorMessageDiv&&errorMessageDiv.style.display!='none')
		{
			var browserWidth = viewer.util.browser.getBrowserWidth();
			var messageWidth = dojo.marginBox(errorMessageDiv).w;
			var left = ( browserWidth - messageWidth ) / 2;
			dojo.style(errorMessageDiv,"left",left+"px");
		}
	},
	hideErrorMessage: function() {
		var errorMessageDiv = document.getElementById( 'lotus_error_message' );
		errorMessageDiv.style.display = 'none';
	},
	
	showErrorMessage: function(text, interval) {
		this._showMessage(text, interval, 2);
	},
	
	showWarningMessage: function(text, interval) {	
		this._showMessage(text, interval, 1);
	},
	
	showInfoMessage: function(text, interval) {	
		this._showMessage(text, interval, 0);
	},
	
	////////////////// callback for document event ////////////
	onPageInfoUpdated: function(data){
		console.log("page num updated to: " + this.doc.getPages());
		if (this.doc.getPagesInfo()[0] && this.doc.getPagesInfo()[0].getFullImageInfo() != null){
			var pageWidth = this.doc.getPagesInfo()[0].getFullImageInfo().getPageWidth();
			if (this.DEFUALT_NORMAL_PAGE_WIDTH != pageWidth)
				data.orgWidth = pageWidth;
		}
		dojo.publish(viewer.util.Events.PAGE_INFO_UPDATED, [this.doc.getPages(), this.doc.getPagesInfo(), data]);
		if ((this.currentPage == 0) && (this.doc.getPages() != 0)){
			this.setCurrentPage(1);
		}
	},
	
	createActions: function(){
		console.log('create actions.');
	}
});