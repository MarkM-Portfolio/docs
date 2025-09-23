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

dojo.provide("html.scenes.AbstractScene");

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
dojo.require("dijit.layout.BorderContainer");
dojo.require("dijit.layout.ContentPane");
dojo.require("dojox.html.metrics");

dojo.require("viewer.beans.Document");
dojo.require("viewer.widgets.MessageBox");
dojo.require("viewer.widgets.ConfirmBox");
dojo.require("viewer.widgets.ViewerToolbar");
dojo.require("viewer.widgets.FloatBox");
dojo.require("viewer.util.Events");
dojo.require("viewer.util.browser");
dojo.require("viewer.scenes.ErrorScene");
dojo.require("viewer.widgets.LotusTextButton");
dojo.require("html.widgets.LoadingPage");
dojo.require("viewer.util.BidiUtils");
dojo.requireLocalization("viewer.scenes", "Scene");

dojo.declare("html.scenes.AbstractScene", null, {
	app: null,
	doc: null,
	jobId: null,
	nls: null,
	//The following four attributes are used for IBM Docs and Viewer integration
	isDocsEnabled: false,
	docsURI: null,
	isDocsSupportType: false,
	isDocsEditor: false,
	numberOfRetry: 0,
	proxyErrorRetry:0,
	helpTail: null,
	scale: 0.92,
	
	//for resize
	thumbnailView: null,
	contentView:null,
	bg: null,
	
	constructor: function(app, sceneInfo) {
		this.nls = dojo.i18n.getLocalization("viewer.scenes", "Scene");
		this.app = app;
		this.jobId = sceneInfo.jobId;
		this.doc = new viewer.beans.Document(sceneInfo.title, sceneInfo.type, sceneInfo.repoUri, sceneInfo.docUri, sceneInfo.version, sceneInfo.pageNum);
		this.bg = new html.widgets.LoadingPage();
		this.doc.setPagesInfo(sceneInfo.images);
		this.isDocsEnabled = sceneInfo.isDocsEnabled;
		this.docsURI = sceneInfo.docsURI;
		this.isDocsSupportType = sceneInfo.isDocsSupportType;
		this.isDocsEditor = sceneInfo.isDocsEditor;
		
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
	},
	
	begin: function(oldScene) {
		this.authUser = this.app.authenticatedUser;
		this.show();
	},
	
	end: function(newScene) {
	},
	
	show: function() {
		this.render();
		this.stage();
	},
	
	render: function(){			
		
		var titlePane = dijit.byId('titlePane');
		dojo.style(titlePane.domNode, 'overflow', 'hidden');
		var titleNode = this.createHeader(titlePane.domNode, this.doc.getTitle());
		var titleSize = dojo.marginBox(titleNode);
		dojo.style(titlePane.domNode, 'height', titleSize.h + 'px');
		
		dojo.attr(document.body,'role','main');
		dojo.attr(document.body,'aria-label', 'body');
		
		if(this.doc.type=="pres")
		{
			var thumbnailPane=dojo.byId("thumbnailPane");
			dijit.setWaiState(thumbnailPane,'labelledby','doc_title_text');			
		}
		var contentPane=dojo.byId("contentPane");
		dijit.setWaiState(contentPane,'labelledby','doc_title_text');
		var mainContainer = dijit.byId('mainContainer');
		mainContainer.resize();
		this.contentView= this.createContentWidget();
		this.setCurrentScale(this.scale);
	},
	
	stage: function(){
		// OCS: 223678
		// notify the parent page (e.g. FIDO) that the content is loaded and the docs page will be rendered
		if(window.self != window.parent) {
			var message = {
				event: "ic-fileviewer/contentLoaded"
			};
			window.parent.postMessage(JSON.stringify(message), window.parent.location.origin);
		}
		
		if (this.jobId != null)
		{
			console.log('conversion has not been completed, wait ...');
			this.bg.show();
			this.doc.addListener(this);
			this.queryJob();
		}
		else
		{
			this.bg.show();
			this.staged(true);
		}
	},
	
	queryJob: function(){
	  	var url = contextPath + "/api/job/" + this.doc.getRepository() + "/" + this.doc.getUri() + "/" + this.jobId + "?version=" + DOC_SCENE.version + "&sid=" +DOC_SCENE.snapshotId;
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
	  
	loadData: function(){
		console.log("===========Error==================");	
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
	  		setTimeout(dojo.hitch(this, this.queryJob), 1000);
	  		return;
	  	}
	  	else
	  	{
	  		console.info("unknown job status: " + response.status);
	  		setTimeout(dojo.hitch(this, this.queryJob), 1000);
	  	}
	},
	
	staged: function(success, response){
	  	if (!success){
	  		console.log('staged failed');
	  		this.hideErrorMessage();
	  		this.bg.hide();
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
		  		//If snapshot ID is null,should set it when query job returns.
		  		if(DOC_SCENE.snapshotId == "null" && response.sid)
		  		{
		  			DOC_SCENE.snapshotId = response.sid;
		  		}
		  		this.doc.setPagesInfo(data);
		  		//this.hideErrorMessage();
	  		}
	  		this.loadData();
	  	}
	  	
	  	this.doc.removeListener(this);
	  	console.log("staged from AbstractScene......");
	},

	staging: function(response){
		var data = response.data;
		this.doc.setPagesInfo(data);		
		console.log("staging from AbstractScene......");
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

		var imagepath = staticResPath + "/images/";
		var imagesource = imagepath + this.getTitleImageName();
		var titleText = "";
		if (title) {
			titleText = title;
		}
		var docTitleText=document.createElement("label");
		docTitleText.setAttribute("id", "doc_title_text");
		var img = document.createElement("img");
		img.setAttribute("src", imagesource);
		img.setAttribute("alt", this.nls.labelImageTypeIcon);
		if(g_env!="smart_cloud")
			dojo.style(img, 'height', '32px');
		else
			dojo.addClass(img, "cloud_text_icon");
		dojo.addClass(img, "lotusIcon");
		docTitle.appendChild(img);

		docTitleText.innerHTML = titleText;
		docTitle.appendChild(docTitleText);

		titleBarContent.appendChild(docTitle);
		innerDiv.appendChild(titleBarContent);		
		
		var actions = document.createElement("ul");
		dojo.addClass(actions, "lotusInlinelist");
		var reviewData = DOC_SCENE.reviewData;
		if( reviewData && 
				reviewData.globalApprovalProperties && 
				reviewData.globalApprovalProperties.approvalProcess == 'BasicApproval' &&
				reviewData.globalApprovalProperties.approvalState == 'pending') {
			var lockOwner = reviewData.lockOwner;
			var draftOwner = false;
			var approver = false;
//			var draftOwner = true;
//			var approver = true;
			
			if (lockOwner.id == g_authUser.id){
				draftOwner = true;
			} else {
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
			}
		
			if(draftOwner || approver) {
				setTimeout( dojo.hitch(this, this._loadCCMWidgets), 100 );
				if(approver) {
					this.addAction(actions, "approve",this.nls.labelApprove, true, false, "", "_approve");
					this.addAction(actions, "reject",this.nls.labelRejct, true, false, "", "_reject");
				}
				this.addAction(actions, "stop_review", this.nls.labelStopReview, true, false, "", "_stopReview");
				innerDiv.appendChild(actions);
			}
		} else if(DOC_SCENE.isDocsEnabled=="true" && DOC_SCENE.isDocsSupportType=="true" && DOC_SCENE.isDocsEditor=="true") {
			this.addAction(actions,"html_edit",this.nls.labelEdit,true,true,"","htmlviewEdit");
		}
		
		this.addAction(actions,"html_play",this.nls.labelPlay,false,true,"htmlViewerPlayIcon","htmlviewPlay");
		this.addAction(actions,"html_print",this.nls.labelPrint,false,true,"htmlViewerPrintIcon","htmlviewPrint");

		innerDiv.appendChild(actions);
		var errorMessageDiv = document.createElement("div");
		dojo.attr(errorMessageDiv,'role','alert');
		errorMessageDiv.id = "lotus_error_message";
		errorMessageDiv.className = "lotusMessage";
		errorMessageDiv.style.display = "none";
		var img = document.createElement("img");
		var floatDirStr = BidiUtils.isGuiRtl() ? 'right' : 'left';
		dojo.style(img, 'float', floatDirStr);
		img.setAttribute("alt", " ");
		errorMessageDiv.appendChild(img);
		var messageSpan = document.createElement("span");
		dojo.style(messageSpan, 'float', 'left');
		errorMessageDiv.appendChild(messageSpan);
		headerDiv.appendChild(errorMessageDiv);

		var clearDiv = document.createElement("div");
		clearDiv.setAttribute("id", "doc_clear");
		clearDiv.className = "clear";
		innerDiv.appendChild(clearDiv);

		mainNode.appendChild(headerDiv);
		return headerDiv;
	},
	addAction: function(actions, actionId, labeltxt, showLab, isDisabled, iconClassName, listener){
		var list = document.createElement("li");
		list.setAttribute("id", actionId);
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
	
	htmlviewEdit: function(editor){
		var winName = DOC_SCENE.docUri.replace(/[-\s.@]/g, '_');
		window.open(this.docsURI,winName);
	},
	
	htmlviewPrint: function(editor){
		if(this.checkSnapshotStatus(this.nls.fileUpdatedContent1))
			return;
		pe.scene.print();
	},
	htmlviewPlay: function(editor){
		if(this.checkSnapshotStatus(this.nls.fileUpdatedContent2))
			return;
		pe.scene.slideShow();
	},
	checkSnapshotStatus: function(msg){
		if(DOC_SCENE.snapshotId != 'null' && !pe.scene.outofdate)
			pe.scene.checkStatus();
		if(pe.scene.outofdate)
		{
			var dlg = new viewer.widgets.ConfirmBox(null, this.nls.fileUpdated, this.nls.updateNow, true, {message:msg, callback:pe.scene.refreshCallback});
			dlg.show();
			return true;
		}
		return false;
	},
	refreshCallback:function(editor,refresh){
		if(refresh)
			window.location.reload();
	},
	checkStatus: function(){
		var url = contextPath + "/api/docsvr/" + this.doc.getRepository() + "/" + this.doc.getUri() + "/edit?mode=snapshotCheck&version=" + DOC_SCENE.version + "&sid=" +DOC_SCENE.snapshotId;
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
	createToolbar: function(node){
		var toolbar = new viewer.widgets.ViewerToolbar({});
		dojo.addClass(toolbar.domNode, DOC_SCENE.type+"_toolbar");
		this.insertModeButton(toolbar);
		//this.insertZoomButton(toolbar);
		if(g_enablePrintBtn=="true")
			this.insertPrintButton(toolbar);
		node.appendChild(toolbar.domNode);
		this.insertPageButton(toolbar);
		if(this.isDocsEnabled=="true" && this.isDocsSupportType=="true" && this.isDocsEditor=="true")
			this.insertEditDocsButton(toolbar);
		if(g_enableVersionBtn=="true"||g_enableHelpBtn=="true")
			this.insertHelpButton(toolbar);
		this.postionButton(toolbar);
		if(dojo.byId("T_separater"))
			dojo.attr(dojo.byId("T_separater"),'tabindex','-1');
		if(dojo.byId("T_ModePagePicker"))
			dojo.attr(dojo.byId("T_ModePagePicker"),'tabindex','-1');
		return toolbar.domNode;
	},
	insertSeprater:function(toolbar){
		//var seprater=new dijit.ToolbarSeparator({id:"T_separater"},"seprater");
		//toolbar.addChild(seprater);
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
	            		buildMessage= dojo.string.substitute(this.nls.labelBuild,[viewer_build]);	
	            	else
	            		buildMessage= dojo.string.substitute(this.nls.labelVersion,["",viewer_version]);
	            	var versionDialog = new viewer.widgets.MessageBox(null, this.nls.labelProject, null, false,
	            			{message: buildMessage});
	            	versionDialog.show();
	            })
	        });
	        
	        helpMenu.addChild(menuAboutDialog);
		}
        var helpButton =new dijit.form.DropDownButton
 		({
 			id: "T_Help",
 			label: this.nls.labelHelp,
			showLabel: false,
			iconClass: "helpButtonIcon",
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
	    	})
		});
		button.attr('disabled', true);
		dojo.addClass(button.domNode,"lotusDijitButtonImg");
		toolbar.addChild(button);	
	},
	updateUI:function()
	{
		this.updateMessageLocation();
		if(this.fitwidth)
			this.setUIDimensions();
		else
			this.setSlideEditorLocation();
		this.getScale();
	},
	postionButton:function(toolbar)
	{
		var buttons = toolbar.getChildren();
		if(buttons.length<2)
			return;
		var right=4;
		if(dojo.isWebKit||dojo.isChrome)
			right=8;
		for(var i=buttons.length-1;i>=0;i--){
			if(buttons[i].id=="T_Print"&&i<buttons.length-1)
			{
				var preNode=buttons[i].domNode;
				var left=dojo.marginBox(preNode).l+dojo.marginBox(preNode).w;
				var calcWidth=dojo.marginBox(toolbar.domNode).w-right-left;
				if(calcWidth>130)
					buttons[i+1].domNode.style.marginLeft=calcWidth+"px";
				else
					buttons[i+1].domNode.style.marginLeft="130px";
				break;
			}
			else
			{
				right+=dojo.marginBox(buttons[i].domNode).w;
				var marginValue=parseFloat(buttons[i].domNode.style.marginLeft);
				if(isNaN(marginValue))
					continue;
				else
					right-=marginValue;
			}
		}
	},
		
	getPageRoot: function(){
		return viewer.util.uri.getHtmlRoot(this.doc)+"/content.html";
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
			case 3:
				imgPath = '/images/information.png';
				className = 'lotusMessage lotusInfo';	
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
	
	updateMessageLocation:function(){
		var errorMessageDiv = document.getElementById( 'lotus_error_message' );
		if(errorMessageDiv&&errorMessageDiv.style.display!='none')
		{
			var browserWidth = viewer.util.browser.getBrowserWidth();
			var messageWidth = dojo.marginBox(errorMessageDiv).w;
			var left = ( browserWidth - messageWidth ) / 2;
			dojo.style(errorMessageDiv,"left",left+"px");
		}
		var height=dojo.marginBox(dojo.byId("titleBar")).h;
		dojo.style(dojo.byId("thumbnailPane"),'top',height+'px');
		dojo.style(dojo.byId("contentPane"),'top',height+'px');
		dojo.style(dojo.byId("titlePane"),'height',height+'px');
	},
	hideErrorMessage: function() {
		var errorMessageDiv = document.getElementById( 'lotus_error_message' );
		errorMessageDiv.style.display = 'none';
		if(pe.scene.outofdate){
			this._showReloadWidget();
		}
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
	showHtmlViewerInfoMessage: function(text, interval) {	
		this._showMessage(text, interval, 3);
	}
});
